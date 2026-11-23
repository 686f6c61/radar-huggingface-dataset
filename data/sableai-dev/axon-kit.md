# SableAI-Dev/Axon-Kit

## Resumen

Axon-Kit es un modelo de lenguaje de tipo GPT decoder-only desarrollado por SableAI-Dev, la primera entrega publica de la familia Axon de SableAI. Se trata de un modelo bilingue ruso-ingles de 99.585.280 parametros entrenado desde cero, sin inicializacion a partir de pesos de terceros, sobre una unica GPU de consumo (NVIDIA RTX 2060 con 6 GB de VRAM). Su proposito es servir como modelo base de generacion de texto para tareas simples y de baja latencia, no como asistente conversacional.

La relevancia del modelo es fundamentalmente metodologica y educativa: demuestra que es viable entrenar un transformer completo desde cero en hardware de gama de entrada, con un corpus de 268,9 millones de tokens procedente de FineWeb-2 (ruso) y FineWeb-Edu (ingles). No obstante, su utilidad practica en produccion es muy limitada: contexto de 512 tokens, ausencia de ajuste por instrucciones, arquitectura propietaria no compatible con transformers ni vLLM, y un grado de infraentrenamiento reconocido por el propio autor.

La ficha se basa exclusivamente en la model card publicada y en los metadatos de Hugging Face. No se han publicado resultados de benchmarks estandar, y el modelo no incluye tokenizador estandar ni formato GGUF, lo que condiciona cualquier evaluacion comparativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con LayerNorm, activacion GELU y embeddings posicionales aprendidos |
| Parametros totales | 99.585.280 (99,6 M), con pesos de embedding de tokens y capa de salida compartidos |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen unicamente en fp32 |
| Idiomas soportados | Ruso e ingles (bilingue, un unico tokenizador para ambos) |
| Licencia | Apache 2.0 (codigo y pesos); datos de entrenamiento bajo ODC-By 1.0 |
| Formato de pesos | `model.safetensors` en fp32, aproximadamente 398 MB (repo de 1,1 GB) |
| Capas / cabezas / dimension | 16 capas / 10 cabezas de atencion / 640 dimensiones |
| Vocabulario | 32.000 tokens, byte-level BPE entrenado sobre mezcla ruso-ingles |
| Compatibilidad | No carga en transformers ni vLLM; requiere el `model.py` incluido en el repo |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 16 capas con 10 cabezas de atencion y dimension oculta de 640, que emplea LayerNorm, activacion GELU y embeddings posicionales aprendidos (no RoPE ni atencion lineal). Comparte los pesos del embedding de tokens con la capa de salida, lo que reduce el recuento efectivo de parametros. El tokenizador es un byte-level BPE de 32.000 entradas entrenado especificamente sobre la mezcla bilingue, en lugar de reutilizar un vocabulario existente.

El entrenamiento se realizo desde cero sobre 268,9 millones de tokens: 127,6 millones de tokens rusos procedentes de FineWeb-2 (subconjunto `rus_Cyrl`, 125.971 documentos) y 141,2 millones de tokens ingleses de FineWeb-Edu (`sample-10BT`, 125.228 documentos). Se descartaron documentos de menos de 300 caracteres, los dos idiomas se mezclaron a nivel de documento y el 1 % final del corpus se reservo para validacion. No hubo deduplicacion adicional. El regimen de entrenamiento consistio en 20.000 pasos con AdamW (betas 0,9/0,95, weight decay 0,1 solo en matrices), learning rate de 3e-4 con 200 pasos de warmup y decaimiento coseno hasta 3e-5, batch efectivo de 32.768 tokens (64 secuencias de 512 tokens con acumulacion de gradientes de 8), precision fp16 con escalado automatico de perdida y recorte de gradiente de 1,0. En total se procesaron unos 655 millones de tokens, equivalentes a aproximadamente 2,4 epocas sobre el corpus. El entrenamiento se ejecuto en una RTX 2060 de 6 GB a unos 14.000 tokens por segundo, en ejecuciones fragmentadas de una a una hora y media con checkpointing y reanudacion del estado del optimizador. No se aplico RLHF, DPO ni ningun tipo de ajuste por instrucciones.

## Capacidades

- Generacion de texto por continuacion de prompt (completion), no instruccion ni dialogo.
- Capacidad bilingue ruso-ingles con un unico juego de pesos y tokenizador.
- Modelado de lenguaje a nivel de caracter y subpalabra mediante BPE byte-level, con cobertura de vocabulario abierta.
- Generacion con muestreo configurable: temperatura (por defecto 0,8) y top-k (por defecto 40).
- No dispone de tool calling ni function calling.
- No dispone de modo agente ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni thinking mode.
- No dispone de ajuste conversacional ni de filtros de seguridad.

## Casos de uso

- Experimentacion educativa en entrenamiento desde cero: el repositorio incluye el codigo (`model.py`) y los hiperparametros completos, lo que permite reproducir o modificar el pipeline de entrenamiento en una GPU de 6 GB como referencia didactica.
- Generacion de texto creativo de baja exigencia en ruso o ingles: continuacion de frases, parrafos o esbozos narrativos donde la coherencia factual no es critica y se tolera divagacion estilistica.
- Pruebas de infraestructura de inferencia propia: al requerir unicamente unos 1 GB de VRAM y una API de generacion minima, sirve para validar pipelines de despliegue CUDA personalizados antes de migrar a modelos mayores.
- Investigacion sobre tokenizadores bilingues: el vocabulario BPE de 32.000 tokens entrenado sobre ruso e ingles permite estudiar el reparto de tokens entre alfabeto cirilico y latino y su efecto en la perplejidad.
- Baseline para comparativas de modelos pequenos: con perplejidad documentada de 30,5 (ruso) y 32,6 (ingles) sobre el conjunto de validacion, puede emplearse como referencia inferior en estudios de escalado.
- Generacion de datos sinteticos de relleno o aumentacion de corpus: util para producir texto diverso sin requisitos de veracidad en tareas de preprocesamiento o pruebas de carga.
- Prototipado de demos de continuacion de texto en entornos con recursos muy limitados, como portatiles con GPU de gama media o entornos de CI con GPU compartida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta perdida de validacion y perplejidad sobre el 1 % reservado del corpus:

| Idioma | Val loss | Perplejidad | Tokens evaluados |
|---|---|---|---|
| Ruso | 3,417 | 30,5 | 455.000 |
| Ingles | 3,485 | 32,6 | 549.000 |

La perplejidad se calcula sobre el vocabulario comun de 32.000 tokens y, segun el autor, no es directamente comparable con la version rusa anterior del modelo (89,3 M de parametros, vocabulario de 16.000 tokens).

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 1 GB segun el autor, incluyendo pesos en fp32 (unos 398 MB) y estados de ejecucion.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 1-2 GB de VRAM; el modelo se entreno en una RTX 2060 de 6 GB y se ejecuta holgadamente en ella.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU NVIDIA moderna (GTX 1060 en adelante, RTX 2060/3060/4060, RTX 4090) e incluso en GPUs de portatil con 4 GB o mas.
- Opciones de despliegue: exclusivamente el script `generate.py` incluido en el repositorio, con PyTorch, `tokenizers` y `safetensors`. No es compatible con vLLM, transformers, llama.cpp, Ollama ni TGI en el estado actual; el autor indica que la conversion a formato estandar esta planificada.
- Latencia y throughput: no se han publicado mediciones de inferencia. Durante el entrenamiento se alcanzaron unos 14.000 tokens por segundo en una RTX 2060, cifra no extrapolable directamente a generacion autoregresiva.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparacion de rendimiento fiable con alternativas. La siguiente tabla compara exclusivamente caracteristicas estructurales verificables:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Compatibilidad estandar |
|---|---|---|---|---|---|
| Axon-Kit | 99,6 M | 512 | Ruso, ingles | Apache 2.0 | No (arquitectura propia) |
| GPT-2 small | 124 M | 1.024 | Ingles | MIT | Si (transformers, GGUF) |
| Qwen2.5-0.5B | 494 M | 32.768 | Multilingue | Apache 2.0 | Si (transformers, vLLM, GGUF) |
| SmolLM2-135M | 135 M | 8.192 | Ingles (principalmente) | Apache 2.0 | Si (transformers, GGUF) |

La comparacion con GPT-2 small es la mas cercana en orden de magnitud de parametros, aunque Axon-Kit anade cobertura del ruso y carece de la compatibilidad de ecosistema de aquel. Qwen2.5-0.5B y SmolLM2-135M son alternativas modernas con contexto mucho mayor, ajuste por instrucciones y soporte nativo en herramientas de inferencia, por lo que resultan mas adecuadas para cualquier uso en produccion.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni dialogo: no responde a preguntas, solo continua texto. No debe presentarse como asistente.
- Infraentrenamiento reconocido por el autor: aproximadamente 2,4 epocas sobre 269 millones de tokens, con perdida de validacion alta y generaciones frecuentemente incoherentes (repeticiones, hechos inventados, cambios de tema).
- Contexto muy limitado de 512 tokens, insuficiente para la mayoria de tareas de recuperacion o documentos largos.
- Solo ruso e ingles; el rendimiento en otros idiomas es practicamente nulo. No se entreno con codigo.
- Riesgo elevado de alucinacion: el corpus procede de web sin deduplicacion adicional ni filtrado de calidad mas alla del umbral de 300 caracteres, por lo que puede reproducir sesgos, errores factuales y contenido de baja calidad de las paginas de origen.
- Ausencia total de filtros de seguridad: no hay alineacion, moderacion ni rechazo de contenido danino.
- Incompatibilidad con el ecosistema estandar (transformers, vLLM, llama.cpp, Ollama, TGI): requiere el codigo propietario del repositorio, lo que dificulta su integracion en pipelines existentes y su cuantizacion.
- Pesos unicamente en fp32: no hay versiones GGUF, AWQ, GPTQ ni cuantizaciones de menor precision publicadas.
- Licencia Apache 2.0 permisiva para uso comercial del codigo y los pesos, pero los datos de entrenamiento conservan las condiciones ODC-By 1.0 de FineWeb-2 y FineWeb-Edu, que exigen atribucion.
- Modelo sin mantenimiento garantizado: el autor lo describe como primera pieza de una familia en desarrollo, con planes de sustituirlo por arquitecturas estandar y modelos mayores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SableAI-Dev/Axon-Kit
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Repositorio del modelo (codigo `model.py` y `generate.py`): https://huggingface.co/SableAI-Dev/Axon-Kit/tree/main
- Paper, blog o demo adicionales: no disponible
