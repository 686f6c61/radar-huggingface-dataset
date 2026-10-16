# AlgoDriveAI/Inferno-Exp-1.6

## Resumen

Inferno-Exp-1.6 es un modelo de lenguaje base de tipo decoder-only desarrollado desde cero por AlgoDriveAI. Cuenta con 393,6 millones de parametros (393.610.240) y esta disenado con un enfoque "math-first": su entrenamiento prioriza la aritmetica y los problemas matematicos expresados en lenguaje natural. Es la evolucion directa de Inferno-Exp-1.5 (76M), del que multiplica el tamano por 5,17.

El modelo se enmarca en la familia de small language models (SLM) orientados a los benchmarks de AxiomicLabs, en concreto ArithMark 3.0. Su objetivo es servir de base para futuras versiones que amplien la comprension general del lenguaje y el razonamiento logico sobre una base matematica solida. Se distribuye como modelo base, sin ajuste por instrucciones (no instruction tuning), por lo que funciona mejor como punto de partida para fine-tuning que como asistente conversacional directo.

La arquitectura emplea attention grouped-query (16 cabezas de consulta y 4 de clave/valor), RoPE completo por cabeza y feed-forward SwiGLU. El contexto es de 2048 tokens, el tokenizer es el de Mistral-7B-v0.1 (ampliado a 32.064 entradas) y el entrenamiento se realizo en una unica pasada sobre aproximadamente 4.000 millones de tokens. Es relevante ahora como referencia abierta de modelos pequenos especializados en razonamiento aritmetico, un segmento con pocas alternativas entrenadas desde cero con licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con grouped-query attention (GQA) y SwiGLU |
| Parametros totales | 393.610.240 (393,6M); 32.833.536 de embeddings atados + 360.775.680 en 32 bloques + 1.024 de normalizacion final |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con codigo custom (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

Inferno-Exp-1.6 es un transformer decoder-only "profundo y estrecho": 32 capas con una anchura de 1024. La atencion es grouped-query con 16 cabezas de consulta y 4 de clave/valor, dimension de cabeza 64 y RoPE aplicado a cabeza completa. El bloque feed-forward usa SwiGLU estandar con anchura interna de 2816. Los embeddings de entrada y salida estan atados (tied), de modo que la cabeza LM no se cuenta dos veces en el recuento de parametros. El tokenizer es el de Mistral-7B-v0.1, rellenado hasta 32.064 entradas, y usa `<|endoftext|>` como separador de documentos.

El entrenamiento se realizo desde cero sobre el dataset AlgoDriveAI/SLM_v3 (version expandida), con aproximadamente 4.000 millones de tokens en una sola pasada. Se empleo el optimizador AdamW y un schedule WSD (warmup-stable-decay). No se documenta en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion, lo que es coherente con que se distribuya como modelo base. Respecto a Inferno-Exp-1.5, mantiene la misma familia arquitectonica, pero pasa de 14 a 32 capas y multiplica por 5,17 los parametros. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, attention lineal o arquitecturas hibridas (SSM).

## Capacidades

- Generacion de texto autoregresiva en ingles, como modelo base sin ajuste por instrucciones.
- Razonamiento aritmetico y resolucion de problemas matematicos expresados en lenguaje natural (word problems), su principal fortaleza declarada.
- Aritmetica de enteros en formato de ecuacion desnuda, con un rendimiento notablemente inferior al de problemas en lenguaje natural (56,88% de accuracy en ArithMark 2.0).
- Completado de frases y razonamiento de sentido comun basico (HellaSwag 29,80%).
- Preguntas de ciencia de nivel elemental (ARC-Easy 47,01%) y de mayor dificultad (ARC-Challenge 30,12%).
- Razonamiento de sentido comun fisico (PIQA 60,45%).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Fine-tuning para tutoria matematica escolar: el modelo parte de una base entrenada especificamente en problemas aritmeticos en lenguaje natural, por lo que es un punto de partida adecuado para ajustar un asistente que resuelva ejercicios paso a paso dirigido a alumnos de primaria o secundaria.
- Generacion de datasets sinteticos de problemas matematicos: puede usarse para producir variaciones de enunciados aritmeticos que alimenten pipelines de entrenamiento de modelos mayores, aprovechando su sesgo hacia ese dominio.
- Investigacion en SLM y ablaciones de arquitectura: con 393,6M de parametros y codigo incluido en el repositorio, es un banco de pruebas asequible para estudiar efectos de profundidad frente a anchura, GQA o atado de embeddings.
- Prototipado rapido en entornos sin GPU: al ser un modelo pequeno (1,6 GB de pesos en el repositorio, equivalentes a fp32), puede ejecutarse en CPU o en GPUs de gama baja para validar ideas antes de escalar.
- Educacion y demos interactivas: la model card incluye un script de Gradio listo para ejecutar en Google Colab con GPU T4, lo que permite desplegar una demo web con streaming en pocos minutos.
- Benchmarking de tecnicas de evaluacion aritmetica: sirve como referencia reproducible en ArithMark 3.0 y ArithMark 2.0 para comparar metodologias de evaluacion (continuation log-likelihood, acc frente a acc_norm).
- Base para experimentos de destilacion: por su tamano contenido y licencia permisiva, puede actuar como alumno en procesos de destilacion desde modelos mayores o como profesor en destilaciones hacia modelos aun mas pequenos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo. Todos los valores figuran como no verificados (`verified: false`) en el model-index.

| Benchmark | Metrica | Inferno-Exp-1.6 | Inferno-Exp-1.5 (76M) | Variacion |
|---|---|---|---|---|
| ArithMark 3.0 (problemas en lenguaje natural) | acc_norm | 83,10% | 71,00% | +12,10 |
| ArithMark 3.0 (problemas en lenguaje natural) | acc | 83,50% | no disponible | no disponible |
| ArithMark 2.0 (aritmetica de enteros) | acc | 56,88% | superior a 1.6 (valor no disponible) | negativa |
| HellaSwag (validacion, 0-shot) | acc_norm | 29,80% | 27,85% | +1,95 |
| ARC-Easy (test, 0-shot) | acc_norm | 47,01% | 43,39% | +3,62 |
| ARC-Challenge (test, 0-shot) | acc_norm | 30,12% | 26,62% | +3,50 |
| PIQA (validacion, 0-shot) | acc_norm | 60,45% | 58,49% | +1,96 |
| Open SLM Leaderboard Intelligence Index | indice | 26,23 | 20,27 | +5,96 |

Fuentes de evaluacion: scripts oficiales de AxiomicLabs (`bencharithmark-3.py` en float32, `benchmark_arithmark-2.0.py` en bfloat16) y `lm-evaluation-harness` de EleutherAI (0-shot, float32) para HellaSwag, ARC y PIQA. El autor senala que la aritmetica de problemas en lenguaje natural y todas las pruebas de lenguaje mejoran, mientras que la aritmetica de ecuacion desnuda (ArithMark 2.0) es inferior a la de Inferno-Exp-1.5.

## Requisitos de hardware

- VRAM estimada para inferencia segun precision (calculo a partir de los 393,6M de parametros; no documentado por el autor): aproximadamente 1,6 GB en fp32, unos 790 MB en fp16/bf16, unos 400 MB en int8 y unos 200 MB en int4, a los que hay que sumar el coste de activaciones y cache KV (contexto de 2048 tokens).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente. Se ha validado en una T4 de Google Colab; tambien es apta para RTX 3060, RTX 4090, A100 o H100, aunque estas ultimas estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, sin problema. Funciona incluso en CPU, segun la model card, con mayor latencia.
- Opciones de despliegue: la via documentada es `transformers` con `AutoModelForCausalLM` y `trust_remote_code=True`. Para una demo se ofrece un script de Gradio en Colab. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al usar codigo custom puede requerir adaptaciones para motores de inferencia optimizados.
- Latencia y throughput estimados: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ArithMark 3.0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inferno-Exp-1.6 | 393,6M | 2048 | 83,10% (acc_norm) | Apache-2.0 | HuggingFace, codigo custom |
| Inferno-Exp-1.5 | 76M | no disponible | 71,00% (acc_norm) | no disponible | HuggingFace |
| Otros SLM de ~0,3-0,5B (por ejemplo, SmolLM-360M, Qwen2.5-0.5B) | 0,3-0,5B | 2048-32768 | no disponible | variable | HuggingFace |

La unica comparativa con datos completos proporcionada es la de Inferno-Exp-1.5, dentro de la misma familia. Para modelos de otras familias con un orden de parametros similar no se dispone de resultados en la informacion facilitada, por lo que no se incluyen cifras. Conviene subrayar que Inferno-Exp-1.6 esta especializado en aritmetica y presenta resultados claramente bajos en tareas de lenguaje general (HellaSwag 29,80%, ARC-Challenge 30,12%), muy por debajo de SLM generalistas del mismo orden de tamano.

## Limitaciones y advertencias

- Modelo base sin instruction tuning: no responde a instrucciones ni mantiene formato conversacional sin un ajuste previo.
- Rendimiento pobre en lenguaje general: los valores de HellaSwag, ARC y PIQA indican una comprension limitada fuera del dominio matematico.
- Especializacion estrecha: esta optimizado para aritmetica y problemas matematicos; su utilidad en otras tareas es reducida.
- Idiomas: unicamente ingles. No hay soporte documentado de castellano ni de otros idiomas.
- Contexto corto: 2048 tokens, insuficiente para documentos largos, dialogos extensos o tareas de retrieval con mucho contexto.
- Riesgo de alucinacion: al ser un modelo pequeno y especializado, puede generar razonamientos aritmeticos plausibles pero incorrectos, especialmente en operaciones de varios pasos.
- Aritmetica de ecuacion desnuda: el propio autor reconoce un retroceso frente a Inferno-Exp-1.5 en ArithMark 2.0 (56,88% de accuracy).
- Resultados no verificados: los benchmarks del model-index figuran con `verified: false`; proceden del autor y no han sido confirmados de forma independiente.
- Codigo custom: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio y anade riesgo en entornos de produccion; ademas puede complicar la integracion con motores de inferencia estandar.
- Sesgos: no se documenta analisis de sesgos. Al entrenarse sobre un corpus no detallado (AlgoDriveAI/SLM_v3) y en ingles, es probable que herede sesgos presentes en esos datos, aunque no hay informacion especifica.
- Licencia Apache-2.0: permisiva y apta para uso comercial, siempre que se conserve el aviso de licencia; conviene revisar los terminos de los datasets de evaluacion de terceros si se redistribuyen resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AlgoDriveAI/Inferno-Exp-1.6
- Dataset ArithMark 3.0: https://huggingface.co/datasets/AxiomicLabs/Arithmark-3.0
- Dataset ArithMark 2.0: https://huggingface.co/datasets/AxiomicLabs/ArithMark-2.0
- Repositorio de evaluacion lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Google Colab (entorno sugerido para la demo Gradio): https://colab.research.google.com
