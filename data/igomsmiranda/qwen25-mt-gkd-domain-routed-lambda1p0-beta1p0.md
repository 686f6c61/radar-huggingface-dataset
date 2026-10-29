# igomsmiranda/qwen25-mt-gkd-domain-routed-lambda1p0-beta1p0

## Resumen

`igomsmiranda/qwen25-mt-gkd-domain-routed-lambda1p0-beta1p0` es un modelo experimental de generación de texto de aproximadamente 1,54 B de parámetros (1.543.714.304 según los metadatos de safetensors), derivado de la familia Qwen2.5 y entrenado por el usuario igomsmiranda con `MultiTeacherGKD`, la variante multi-profesor del entrenador de destilación de conocimiento generalizada (GKD) de la librería TRL de Hugging Face. Según el nombre interno del run, el alumno fue sometido a SFT completo y destilado desde varios profesores también con SFT completo, con enrutamiento por dominios y valores lambda 1,0 y beta 1,0.

El problema que aborda es la compresión de capacidades: transferir el comportamiento de varios modelos profesores a un alumno pequeño que sea barato de servir. Su relevancia es principalmente investigadora: permite estudiar cómo afecta el enrutamiento por dominios entre profesores a la calidad de la destilación on-policy. Con 0 descargas, licencia sin especificar y sin evaluaciones publicadas, debe tratarse como un artefacto de investigación y no como un modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decodificador, familia Qwen2/Qwen2.5 (clase `qwen2` en transformers), modelo denso |
| Parámetros totales | 1.543.714.304 (≈1,54 B) |
| Parámetros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (pesos nativos); no se han publicado versiones cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el model card contiene el marcador `licence: license`, sin valor válido) |
| Formato de pesos | safetensors (3,1 GB, coherente con 1,54 B de parámetros en bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decodificador denso de la arquitectura Qwen2, con un tamaño de 1,54 B de parámetros que coincide con Qwen2.5-1.5B. El model card no confirma el modelo base (el enlace aparece vacío como "None"), aunque el identificador del repositorio y el recuento de parámetros apuntan a esa procedencia. La ventana de contexto exacta no está documentada.

El entrenamiento se realizó con `MultiTeacherGKD` de TRL (versión 1.0.0.dev0), una extensión del método GKD (Generalized Knowledge Distillation) en la que un modelo alumno aprende de las distribuciones de salida de varios profesores sobre secuencias generadas por el propio alumno (destilación on-policy). En la formulación de GKD, los hiperparámetros lambda y beta controlan la proporción de datos on-policy del alumno y la interpolación de la divergencia entre profesor y alumno; en este run ambos valen 1,0. El nombre del run sugiere que los profesores se seleccionan por dominio (`domain_routed`) y que la generación se limitó a 256 tokens durante el entrenamiento, con evaluación sobre 500 muestras (`eval500`), aunque estos detalles no están documentados formalmente. No se ha publicado información sobre el número de tokens, la composición del dataset ni el uso de RLHF/DPO. Stack declarado: Transformers 5.9.0, PyTorch 2.6.0+cu124, Datasets 4.8.5, Tokenizers 0.22.2, con trazas en Weights & Biases.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y `text-generation`, y el model card incluye un ejemplo de uso mediante `pipeline("text-generation")` con formato de mensajes por roles (user/assistant).
- Comportamiento destilado: el alumno está entrenado para imitar la salida de varios profesores con SFT completo, con selección de profesor por dominio, por lo que su estilo y dominio de respuesta dependen de esos profesores no documentados.
- Base heredada de la familia Qwen2.5 (según el identificador), orientada a tareas generales de lenguaje.
- No documentado: tool calling / function calling, soporte de agentes, razonamiento multi-paso, modo de pensamiento extendido (thinking), visión o audio.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en destilación multi-profesor: sirve como punto de comparación para estudiar el efecto del enrutamiento por dominios y de los hiperparámetros lambda/beta en GKD; la traza completa del run está disponible en Weights & Biases.
- Prototipado de asistentes conversacionales en hardware modesto: con unos 3,1 GB de pesos en bf16 y una VRAM estimada de 4-6 GB para inferencia, permite montar un chatbot local en GPUs de consumo usando el pipeline de transformers.
- Despliegue en entornos con recursos limitados: su tamaño de 1,54 B lo hace adecuado para servidores pequeños o estaciones de trabajo sin GPUs de gama alta, siempre vía transformers o backends compatibles con la arquitectura Qwen2.
- Docencia y formación: es un ejemplo real y completo del flujo `GKDTrainer` de TRL (configuración multi-profesor, versiones de librerías y monitorización en W&B), útil para enseñar destilación on-policy.
- Punto de partida para ajustes posteriores: al ser un alumno ya destilado con SFT completo, puede continuarse con SFT adicional o DPO para adaptarlo a un dominio concreto.
- Evaluación comparativa de destilación: permite medir frente a Qwen2.5-1.5B-Instruct cuánta capacidad de los profesores se retiene en el alumno, como parte de un estudio ablativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El nombre del run menciona una evaluación sobre 500 muestras (`eval500`), pero no se incluyen métricas ni comparativas en el model card ni en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 3,1 GB solo de pesos en bf16; con overhead de runtime y caché KV, entre 4 y 6 GB para contextos cortos. La ventana de contexto no está documentada, por lo que el crecimiento de la caché KV con contextos largos no puede estimarse.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070). GPUs de centro de datos (A100, H100) solo tendrían sentido para servir muchas peticiones concurrentes; para un modelo de este tamaño son innecesarias.
- Cabe en GPU de consumo: sí, holgadamente en tarjetas de 8 GB; incluso en modelos de 6 GB con ajustes de precisión. También es ejecutable en CPU con transformers, con latencias elevadas.
- Opciones de despliegue: transformers (versión 5.9.0 según el model card, con `pipeline("text-generation")`), TGI o vLLM (ambos soportan la arquitectura Qwen2). No existe conversión GGUF publicada, por lo que llama.cpp y Ollama requerirían una conversión manual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen25-mt-gkd-domain-routed (este) | 1,54 B | no disponible | no disponible | safetensors bf16, sin GGUF ni evals públicas |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (hasta 128K con YaRN) | Apache 2.0 | Pesos abiertos, amplio soporte (vLLM, GGUF, Ollama) |
| Llama-3.2-1B-Instruct | 1,24 B | 131.072 tokens | Llama 3.2 Community License | Pesos abiertos con restricciones de licencia |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | Apache 2.0 | Pesos abiertos, orientado a uso local |

Este modelo se diferencia de sus alternativas en que su valor está en el método de entrenamiento (destilación multi-profesor con enrutamiento por dominios) y no en un rendimiento verificado: a diferencia de los tres comparados, carece de licencia declarada, benchmarks públicos y ecosistema de despliegue.

## Limitaciones y advertencias

- Licencia sin especificar: el model card contiene un marcador inválido (`licence: license`), lo que introduce incertidumbre legal para cualquier uso comercial; debe verificarse con el autor antes de desplegar.
- Modelo base sin confirmar: el README enlaza a "None", de modo que la procedencia exacta (Qwen2.5-1.5B) es una inferencia del identificador y no un dato documentado.
- Sin evaluaciones públicas: no hay benchmarks ni métricas del `eval500`, por lo que la calidad del modelo no está verificada por terceros.
- Adopción nula: 0 descargas y 0 likes indican que no ha sido probado por la comunidad.
- Riesgo de alucinación: como modelo de 1,5 B de parámetros, es esperable una tasa de alucinaciones alta en tareas de razonamiento, matemáticas y hechos factuales.
- Sesgos heredados: al destilar de varios profesores, puede heredar y combinar los sesgos de cada uno; los profesores y sus datos no están documentados.
- Idiomas sin documentar: no se declara qué idiomas soporta ni con qué calidad.
- Compatibilidad: entrenado con TRL 1.0.0.dev0 y Transformers 5.9.0 (versiones de desarrollo o muy recientes), lo que puede causar incompatibilidades con stacks más antiguos.
- Sin versiones cuantizadas ni GGUF: el despliegue en entornos muy limitados requiere conversión propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/igomsmiranda/qwen25-mt-gkd-domain-routed-lambda1p0-beta1p0
- Traza del entrenamiento en Weights & Biases: https://wandb.ai/diogomsmirandaa-team/mopd-qwen25-fullsft-mt-gkd/runs/qo5d47vu
- Repositorio de TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Documentación de GKDTrainer en TRL: https://huggingface.co/docs/trl/gkd_trainer
- Paper de GKD (Agarwal et al.): https://arxiv.org/abs/2306.13649
