# Floriano03/Trabalho_SML_Profundo2

## Resumen

SLM 55M es un modelo de lenguaje pequeno (small language model) de 55,26 millones de parametros entrenado desde cero por Gabriel Floriano en el marco del Proyecto 2 de la asignatura Aprendizado Profundo 2 de la PUCRS. Se trata de un transformer decoder-only con arquitectura estilo LLaMA (GQA, SwiGLU, RMSNorm, RoPE) y un vocabulario BPE de GPT-2, disenado como ejercicio academico reproducible en hardware de consumo: todo el entrenamiento se realizo en una RTX 3050 Laptop de 6 GB de VRAM en aproximadamente 24 horas de GPU.

El modelo resuelve un problema fundamentalmente didactico: demostrar el pipeline completo de punta a punta (pre-entrenamiento, mid-training, SFT y evaluacion) con un presupuesto minimo, siguiendo las leyes de escala de Chinchilla para fijar el volumen de datos (1,1 mil millones de tokens, unos 20 tokens por parametro). Su relevancia actual es la de un caso de estudio sobre el coste de la especializacion: al publicar tres checkpoints intermedios, el autor mide de forma explicita el olvido catastrofico parcial que introduce el ajuste por instrucciones.

No es un modelo apto para produccion. El propio autor lo describe como un modelo academico que acierta el formato de conversacion y hechos simples pero falla en aritmetica, repite frases en respuestas largas y solo funciona en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA (GQA, SwiGLU, RMSNorm pre-norm, RoPE) |
| Parametros totales | 55.257.600 (29,50 M sin embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (checkpoints en precision bf16) |
| Idiomas soportados | Ingles unicamente |
| Licencia | No disponible |
| Formato de pesos | PyTorch nativo (`.pt`), no safetensors ni GGUF |

Detalles adicionales de arquitectura: 10 capas x dimension 512, atencion GQA con 8 cabezas de query y 4 de clave/valor, FFN SwiGLU con hidden 1408 (aprox. 8/3 x d_model), RoPE con theta 10000, vocabulario de 50304 tokens (BPE de GPT-2 via `tiktoken`, redondeado a multiplo de 64) y weight tying entre embeddings de entrada y salida.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con las innovaciones habituales de la familia LLaMA: atencion con query grouping (GQA) para reducir el coste de cache KV, activacion SwiGLU en la FFN, normalizacion RMSNorm en configuracion pre-norm y codificacion posicional rotatoria RoPE. El tokenizador es el BPE de GPT-2 obtenido mediante `tiktoken`, con el vocabulario ampliado a 50304 para que sea multiplo de 64. Los embeddings de entrada y salida comparten pesos.

El entrenamiento se dividio en tres etapas. El pre-entrenamiento uso el subconjunto `sample-10BT` de FineWeb-Edu durante 1,10 mil millones de tokens (19 h 50 min, val loss 3,549). El mid-training empleo SmolTalk `all` mas GSM8K con 149,95 millones de tokens (2 h 44 min, val loss 1,931). El SFT final uso SmolTalk curado y GSM8K en proporcion 8:1, con 89,92 millones de tokens en 2 epocas (1 h 41 min, val loss 1,942). Se entreno en bf16 con un batch global de 2^18 = 262.144 tokens mediante gradient accumulation con micro-batch de 4; el autor documenta que micro-batches superiores provocan paginacion del driver de Windows a RAM y reducen el throughput de 13,6K a 9,1K tokens/s. El presupuesto de pre-entrenamiento se fijo siguiendo Chinchilla (20 tokens por parametro); en los ultimos 200 M tokens la perplejidad solo cayo un 3,3 %, senal de que el cuello de botella paso a ser la capacidad del modelo y no el volumen de datos. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto en ingles con formato de conversacion tipo pregunta/respuesta (etiquetas `User:` / `Assistant:`).
- Razonamiento de sentido comun basico a nivel ligeramente superior al azar en tareas de eleccion multiple (ARC-Easy, PIQA, WinoGrande).
- Aprendizaje del formato de razonamiento paso a paso de GSM8K, sin capacidad aritmetica real para ejecutarlo.
- Seguimiento de instrucciones simples y hechos de conocimiento general de baja complejidad.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso fiable.
- Sin soporte multilingue: unicamente ingles.
- Sin capacidad de vision ni audio.
- Sin modo de razonamiento extendido (thinking mode) dedicado.

## Casos de uso

- Docencia y aprendizaje de pipelines de LLM: el modelo sirve como ejemplo completo y reproducible de pre-entrenamiento, mid-training y SFT en hardware de consumo, con tres checkpoints para comparar etapas.
- Estudio del olvido catastrofico: al publicar las metricas de las tres etapas, permite medir empiricamente como la especializacion en formato de dialogo degrada el conocimiento factual (la perplejidad en texto general sube un 40 % ya en el mid-training).
- Reproduccion de experimentos de escala: util para validar en una RTX 3050 las leyes de escala de Chinchilla y observar el punto en que el modelo deja de beneficiarse de mas datos.
- Prototipado de evaluacion por log-verosimilitud: el codigo de preprocesamiento de HellaSwag y ARC reimplementado a partir de `lm-evaluation-harness` sirve como referencia para montar arneses de evaluacion propios.
- Demostracion de tokenizacion y formateo de chat: el repositorio incluye `build_prompt` y un portal de chat en Streamlit para inspeccionar el comportamiento del modelo en tiempo real.
- Base para ejercicios de ajuste fino: su tamano (0,7 GB de repo) permite clonar, modificar y reentrenar el modelo en una sola GPU consumer como banco de pruebas de tecnicas de SFT.

## Benchmarks y rendimiento

Evaluacion de eleccion multiple por log-verosimilitud (sin generacion autorregresiva):

| Benchmark | n | Aleatorio | Pre-entrenamiento | Mid-training | SFT |
|---|---|---|---|---|---|
| ARC-Easy (acc) | 2376 | 0,250 | **0,428** | 0,380 | 0,393 |
| PIQA (acc) | 1838 | 0,500 | **0,587** | 0,576 | 0,573 |
| WinoGrande (acc) | 1267 | 0,500 | 0,521 | **0,537** | 0,530 |
| HellaSwag (acc_norm) | 10042 | 0,250 | 0,266 | 0,269 | **0,272** |
| ARC-Challenge (acc_norm) | 1172 | 0,250 | 0,224 | 0,228 | 0,230 |
| PPL FineWeb-Edu | — | — | **36,5** | 51,3 | 54,3 |

HellaSwag y ARC-Challenge se mantienen en el nivel del azar, lo que refleja la ausencia de sentido comun a esta escala. ARC-Easy y PIQA superan claramente el azar, lo que valida el pipeline de evaluacion. La perplejidad en un split de FineWeb-Edu separado (medido antes de generar ningun shard de entrenamiento) empeora un 40 % tras el mid-training, evidencia cuantificada del coste de la especializacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos en bf16 (55,26 M de parametros), mas la cache KV para 1024 tokens de contexto, que es despreciable.
- GPU recomendadas: cualquier GPU con soporte CUDA; el autor entreno en una RTX 3050 Laptop de 6 GB.
- Cabe holgadamente en cualquier GPU consumer (serie GTX 10xx en adelante, RTX 20xx/30xx/40xx) e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: el modelo usa una arquitectura propia y no carga con `AutoModel`; requiere el codigo del repositorio (`load_model_from_checkpoint`). El repositorio incluye un portal de chat en Streamlit (`streamlit run src/chat_app.py`).
- Latencia y throughput: no se documentan cifras de inferencia; si se reporta un throughput de entrenamiento de 13,6K tokens/s con micro-batch de 4 en la RTX 3050 Laptop.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SLM 55M (este) | 55,26 M | 1024 | Ingles | No disponible | PyTorch `.pt` |
| SmolLM-135M (HuggingFace) | 135 M | 2048 | Ingles | Apache 2.0 | safetensors, GGUF |
| GPT-2 small (OpenAI) | 124 M | 1024 | Ingles | MIT | safetensors, GGUF |
| nanoGPT (Karpathy) | ~124 M (config. por defecto) | 1024 | Ingles | MIT | PyTorch `.pt` |

La comparativa es orientativa: los tres modelos alternativos son de tamano aproximadamente el doble o mas y no se han evaluado en este documento con los mismos arneses, por lo que no se ofrece comparacion directa de rendimiento. La diferencia principal de SLM 55M es su proposito academico y su publicacion de checkpoints intermedios, frente a la orientacion a produccion de SmolLM o GPT-2.

## Limitaciones y advertencias

- Solo ingles: entrenado con FineWeb-Edu y SmolTalk, no responde en portugues ni en castellano.
- Falla en aritmetica: ha aprendido la forma del razonamiento paso a paso de GSM8K sin capacidad de ejecutarlo correctamente.
- Repeticion: en respuestas largas entra en bucles de frases.
- Alucinacion: 55 M de parametros almacenan muy poco conocimiento factual y el modelo inventa hechos con frecuencia.
- Olvido catastrofico parcial medido: la perplejidad en texto general empeora un 40 % tras el mid-training y el SFT.
- Sin licencia declarada: no se especifican terminos de uso comercial; debe tratarse como no apto para produccion hasta que el autor la defina.
- Formato no estandar: los pesos son `.pt` con arquitectura propia, incompatibles con `AutoModel`, vLLM, llama.cpp u Ollama sin adaptacion.
- El propio autor lo declara no apto para uso practico; su valor es exclusivamente didactico y de investigacion sobre pipelines.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Floriano03/Trabalho_SML_Profundo2
- Repositorio de codigo y resultados: https://github.com/GabrielFloriano03/Trabalho_SML_Profundo2
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- nanoGPT (Andrej Karpathy): https://github.com/karpathy/nanoGPT
- Paper LLaMA (Touvron et al., 2023): https://arxiv.org/abs/2302.13971
- SmolLM (HuggingFace): https://huggingface.co/HuggingFaceTB
- lm-evaluation-harness (EleutherAI): https://github.com/EleutherAI/lm-evaluation-harness
