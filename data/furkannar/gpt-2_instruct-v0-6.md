# FurkanNar/GPT-2_Instruct-v0.6

## Resumen
GPT-2_Instruct-v0.6 es un ajuste fino del modelo GPT-2 de OpenAI (variante de 124 millones de parametros, `openai-community/gpt2`) desarrollado por el usuario FurkanNar. Se trata de la sexta iteracion de una serie de refinamientos sucesivos: parte de FurkanNar/GPT-2_Instruct-v0.5 (entrenado a su vez sobre Alpaca, SVAMP y Dolly-15k) y se entrena de nuevo sobre el dataset HuggingFaceH4/ultrachat_200k para mejorar el seguimiento de instrucciones en conversaciones multiturno. El problema que aborda es dotar a un GPT-2 base, que originalmente solo completa texto, de capacidad de mantener dialogos conversacionales con formato de instruccion/respuesta.

Arquitectura y tamano: es un transformer decoder-only de 124.439.808 parametros (aproximadamente 124M), identico estructuralmente al GPT-2 small, con tokenizador GPT-2 y una longitud de contexto configurada en 512 tokens tanto en entrenamiento como en inferencia. No es un modelo MoE ni incorpora mecanismos de atencion lineal o hibridos: es un transformer denso clasico con atencion causal completa.

Su relevancia actual es limitada y de nicho: se trata de un experimento de ajuste fino sobre un modelo de 2019 con solo 1 "like" y 6 descargas en el momento de la consulta. Su interes reside en servir como ejemplo reproducible de pipeline de fine-tuning ligero (FP16, AdamW, 4 epocas) y de una estrategia de decodificacion Best-of-N con normalizacion de longitud. No compite con modelos modernos de instruccion de mayor tamano.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (GPT-2), con atencion causal |
| Parametros totales | 124.439.808 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (configurado en entrenamiento e inferencia; GPT-2 base soporta hasta 1024) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; el repo solo incluye safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (mas config.json y generation_config.json) |

## Arquitectura y entrenamiento
El modelo es un GPT-2 de 124M de parametros, un transformer decoder-only con normalizacion pre-LayerNorm, atencion multi-cabeza causal y embeddings de tokens atados a la capa de salida, segun la arquitectura original de OpenAI. El tokenizador es el de GPT-2 (BPE). No incorpora innovaciones como decodificacion especulativa, atencion lineal o mezcla de expertos; la unica capa de originalidad esta en el procedimiento de decodificacion (descrito mas abajo), no en la red.

El entrenamiento de v0.6 se realizo sobre HuggingFaceH4/ultrachat_200k, con 10.000 muestras de train y 1.000 de test, longitud maxima de secuencia de 512 tokens, 4 epocas, batch size de 8, learning rate de 2e-5 con optimizador AdamW, gradient clipping con norma maxima de 1.0 y precision mixta FP16 mediante `torch.cuda.amp`. No se documenta uso de RLHF ni DPO; es un ajuste fino supervisado (SFT) sobre conversaciones. La perdida de validacion descendio de 2,2924 (epoca 1) a 2,2063 (epoca 4), sin senales de sobreajuste significativo.

En inferencia, el autor implementa una decodificacion Best-of-N: genera 4 candidatos en paralelo por batch y los puntua con log-verosimilitud normalizada por longitud (media geometrica de probabilidades de token) usando una temperatura de calibracion independiente (T_calib=0.8) de la temperatura de generacion (T_gen=0.7). El historial de conversacion se gestiona con etiquetas "Instruction:" y "Response:" y se trunca automaticamente al superar los 512 tokens.

## Capacidades
- Generacion de texto en ingles y respuesta a instrucciones sencillas en formato conversacional.
- Dialogo multiturno con gestion de historial (hasta el limite de 512 tokens).
- Seguimiento de instrucciones basicas heredado del ajuste sobre Alpaca, Dolly-15k y ultrachat_200k.
- Razonamiento aritmetico elemental, gracias al ajuste previo sobre SVAMP (problemas matematicos de primaria).
- Muestreo Best-of-N con puntuacion de confianza calibrada, util para filtrar respuestas de baja probabilidad dentro del propio script de inferencia.
- Detencion configurable de generacion mediante stop sequences ("\nInstruction:", "\nResponse:", "\nUser:", etc.).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no, el modelo esta declarado unicamente en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso
- Experimentacion educativa con pipelines de fine-tuning: sirve para reproducir un SFT completo sobre GPT-2 con hiperparametros documentados (4 epocas, lr 2e-5, FP16), util como referencia para estudiantes que quieren entender el ciclo completo sin infraestructura grande.
- Generacion de texto asistida en ingles con recursos minimos: el modelo cabe en cualquier GPU consumer e incluso en CPU, por lo que puede ejecutarse en entornos de desarrollo sin acelerador dedicado.
- Prototipado rapido de chatbots de bajo coste: permite validar la interfaz y el formato de conversacion (etiquetas "Instruction:"/"Response:") antes de migrar a un modelo mayor.
- Generacion de respuestas cortas con control de calidad via Best-of-N: el script de inferencia puntua cada candidato, lo que puede reutilizarse para tareas donde se quiera seleccionar la respuesta mas probable entre varias.
- Ajuste fino incremental sobre dominios concretos: al ser un modelo de 124M y licencia MIT, es barato reentrenarlo sobre un corpus propio para tareas de completado de texto especificas.
- Pruebas de deteccion de alucinaciones y limites de modelos pequenos: resulta util como caso de estudio de las limitaciones de un GPT-2 ajustado (ver ejemplo de "ensalada con agua" en la model card).
- Generacion de texto sintetico para aumentar datasets de entrenamiento en ingles: puede producir borradores que luego se filtran, dado su bajo coste computacional.
- Despliegue en entornos con restricciones de licencia estrictas: la licencia MIT permite uso comercial sin las restricciones adicionales de la licencia original de GPT-2.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento proporcionados por el autor son las perdidas y perplejidades de entrenamiento y validacion:

| Epoca | Perdida train | Perplejidad train | Perdida val | Perplejidad val |
|---|---|---|---|---|
| 1 | 2,5944 | 13,39 | 2,2924 | 9,90 |
| 2 | 2,4324 | 11,39 | 2,2483 | 9,47 |
| 3 | 2,3656 | 10,65 | 2,2236 | 9,24 |
| 4 | 2,3174 | 10,15 | 2,2063 | 9,08 |

La metrica declarada en la model card es la perplejidad. No hay comparacion con otros modelos medida sobre el mismo conjunto de evaluacion.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0,25 GB en FP16 y 0,5 GB en FP32 para los pesos; con cache KV de 512 tokens el consumo real es inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo esta sobredimensionado en cuanto a hardware, no necesita GPU de datacenter.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna, e incluso en CPU (con latencia mayor).
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (el modelo incluye el tag `text-generation-inference`), vLLM, llama.cpp u Ollama tras conversion manual a GGUF (no se publican pesos GGUF en el repo).
- Latencia y throughput estimados: no disponibles. No se aportan mediciones de tokens por segundo ni latencia en la informacion proporcionada. Cabe esperar latencias muy bajas dado el tamano de 124M, pero no hay cifras oficiales.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| GPT-2_Instruct-v0.6 (este) | 124M | 512 tokens (configurado) | Ingles | MIT | safetensors, transformers |
| openai-community/gpt2 | 124M | 1024 tokens | Ingles | Licencia MIT modificada de OpenAI | safetensors, transformers |
| distilgpt2 | 82M | 1024 tokens | Ingles | Apache-2.0 | safetensors, transformers |
| Qwen2.5-0.5B-Instruct | ~494M | 32.768 tokens | Multilingue | Apache-2.0 | safetensors, transformers, GGUF |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada. La comparacion se limita a parametros, contexto, licencia y disponibilidad. Frente a `gpt2` base, este modelo aporta ajuste conversacional; frente a Qwen2.5-0.5B-Instruct, es mas pequeno y con contexto mucho menor, pero con licencia MIT completa.

## Limitaciones y advertencias
- Modelo de 124M de parametros: la coherencia factual y el razonamiento complejo son muy limitados; es esperable un alto indice de alucinacion y respuestas incorrectas o incoherentes (el propio ejemplo de la model card genera una receta de ensalada con agua).
- Contexto reducido a 512 tokens: las conversaciones largas obligan a truncar turnos anteriores, lo que degrada la coherencia del dialogo.
- Solo ingles: no soporta castellano ni otros idiomas de forma fiable.
- Sin soporte documentado de tool calling, agentes, vision ni audio.
- Sin datos de benchmarks estandar: no se puede evaluar su calidad con metricas comparables a las de modelos de instruccion modernos.
- Temperaturas y parametros de decodificacion muy especificos (Best-of-N=4, T_calib=0.8, top-k 40, top-p 0.9): los resultados publicados dependen del script de inferencia del autor; otros pipelines pueden producir salidas bastante peores.
- Licencia MIT: permite uso comercial y modificacion sin restricciones adicionales, pero conviene verificar que el modelo base `openai-community/gpt2` (licencia MIT modificada de OpenAI) no imponga condiciones adicionales sobre los pesos derivados.
- Poca traccion y validacion externa: 6 descargas y 1 "like" en el momento de la consulta; no ha sido evaluado por terceros ni auditado por sesgos.
- Fechas de creacion y actualizacion (2026-10-08 y 2026-10-10) tal como figuran en HuggingFace.
- No apto para produccion en tareas que requieran precision factual, razonamiento avanzado o multilingue.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/FurkanNar/GPT-2_Instruct-v0.6
- Modelo base (version anterior): https://huggingface.co/FurkanNar/GPT-2_Instruct-v0.5
- Modelo base original: https://huggingface.co/openai-community/gpt2
- Dataset de entrenamiento principal: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de ajuste previo (v0.5): https://huggingface.co/datasets/tatsu-lab/alpaca
- Dataset de ajuste previo (v0.5): https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset de ajuste previo (v0.5): https://huggingface.co/datasets/ChilleD/SVAMP
