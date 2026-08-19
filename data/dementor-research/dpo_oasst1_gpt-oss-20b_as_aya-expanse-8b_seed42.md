# dementor-research/dpo_oasst1_gpt-oss-20b_as_aya-expanse-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, con el objetivo de que el modelo resultante imite el estilo de respuesta del modelo `aya-expanse-8b` (de Cohere) sobre el corpus de conversaciones oasst1. El adaptador forma parte de un estudio de imitación conductual denominado «dementor», en el que se configuran distintos pares de modelos fuente y objetivo para analizar cómo se transfieren estilos y comportamientos entre modelos de lenguaje.

El adaptador se distribuye en formato PEFT (safetensors) y tiene un tamaño de repositorio de 1,0 GB. Está pensado para cargarse sobre el modelo base `gpt-oss-20b` mediante la librería `peft` de Hugging Face. El nombre del repositorio indica que el modelo fuente (el que se entrena) es `gpt-oss-20b` y el modelo objetivo (el que se imita) es `aya-expanse-8b`, con semilla 42. No se proporciona información sobre la licencia, los idiomas soportados ni el pipeline de uso, más allá del fragmento de código de ejemplo incluido en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (modelo base transformer denso) |
| Parametros totales | No disponible (el adaptador LoRA tiene rango 32 sobre todas las capas lineales; el modelo base tiene 20B parametros) |
| Parametros activos | No disponible (el adaptador anade un numero reducido de parametros entrenables, pero no se especifica) |
| Longitud de contexto | No disponible (hereda la del modelo base, que no se detalla en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, el modelo base puede cuantizarse con metodos estandar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO sobre el corpus oasst1 (Open Assistant), con rango LoRA de 32 y `target_modules=all-linear`, es decir, se aplican matrices LoRA a todas las capas lineales del modelo base `gpt-oss-20b`. El entrenamiento se realiza con la herramienta Tinker de Thinking Machines, dentro de una campaña configurada que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa. El objetivo es que el modelo fuente (gpt-oss-20b) imite el estilo de respuesta del modelo objetivo (aya-expanse-8b) en el corpus oasst1. No se especifican detalles adicionales como el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros del DPO (beta, número de épocas, etc.), aunque se menciona que la configuración exacta está disponible en `config.yaml` del lanzamiento del código.

## Capacidades

- El adaptador modifica el comportamiento del modelo base `gpt-oss-20b` para que sus respuestas sigan el estilo del modelo `aya-expanse-8b` en conversaciones del corpus oasst1.
- Las capacidades funcionales (generación de texto, razonamiento, código, etc.) son las del modelo base `gpt-oss-20b`, ya que el adaptador solo ajusta el estilo y las preferencias de respuesta.
- No se especifican capacidades especiales como tool calling, agentes, visión o audio; estas dependerán del modelo base.
- El entrenamiento con DPO implica que el adaptador ha sido optimizado para preferir respuestas que se asemejan a las del modelo objetivo, lo que puede afectar al tono, la longitud y el formato de las respuestas.

## Casos de uso

- Estudio de imitación conductual: el adaptador permite investigar cómo un modelo de 20B parámetros puede adoptar el estilo de un modelo más pequeño (8B) en tareas conversacionales, útil para investigación en transferencia de estilo y alineación.
- Personalización de chatbots: se puede utilizar para dar a un modelo grande el tono y la forma de respuesta de un modelo conocido por su calidad conversacional, como aya-expanse-8b, en entornos de atención al cliente o asistentes virtuales.
- Evaluación de preferencias: al ser un adaptador DPO, puede servir para comparar el efecto del entrenamiento por preferencias sobre el mismo modelo base con diferentes objetivos de estilo.
- Benchmarking de adaptadores: dado que forma parte de una campaña con múltiples configuraciones, puede usarse para comparar el impacto de distintas semillas, datasets y pares de modelos en la calidad de la imitación.
- Fine-tuning selectivo: el adaptador permite modificar el comportamiento del modelo base sin necesidad de reentrenar todos los parámetros, lo que facilita experimentos rápidos en entornos con recursos limitados.
- Investigación en alineación: el estudio de cómo un modelo imita el estilo de otro mediante DPO puede aportar información sobre los mecanismos de alineación y los sesgos introducidos por el corpus de preferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1,0 GB en disco, pero debe cargarse sobre el modelo base `gpt-oss-20b`, que tiene 20 mil millones de parámetros.
- Para inferencia con el modelo base en precisión FP16 se estima un consumo de VRAM de aproximadamente 40 GB (20B parámetros × 2 bytes). Con cuantización a 8 bits (por ejemplo, bitsandbytes) se puede reducir a unos 20 GB, y a 4 bits a unos 10-12 GB.
- GPU recomendadas: para FP16 se necesitan GPUs de 48 GB (A6000, A100 40GB no es suficiente, se requiere 48GB o más), o varias GPUs en paralelo. Con cuantización 8 bits, una RTX 4090 (24 GB) podría ser suficiente. Con 4 bits, una RTX 3090/4090 de 24 GB sería viable.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft` en Python, o exportar a GGUF para usar con llama.cpp/Ollama si se fusiona con el modelo base. También puede servirse con vLLM o TGI si se fusiona previamente.
- Latencia y throughput: no disponibles; dependerán del hardware y del método de cuantización.

## Comparativa con modelos similares

Existen otros adaptadores de la misma campaña «dementor» con configuraciones análogas, como `dementor-research/dpo_oasst1_aya-expanse-8b_as_gpt-oss-20b_seed42` (donde el modelo fuente es aya-expanse-8b y el objetivo es gpt-oss-20b) o `dementor-research/dpo_oasst1_gpt-oss-120b_as_gpt-oss-20b_seed42` (con gpt-oss-120b como fuente). No se dispone de datos comparativos de rendimiento ni de benchmarks entre estos adaptadores. La comparación directa con otros modelos completos (como Llama 3 8B o Mistral 7B) no es pertinente, ya que este repositorio no es un modelo autónomo, sino un adaptador sobre un modelo base específico.

## Limitaciones y advertencias

- No se dispone de información sobre la licencia del adaptador ni del modelo base; es necesario verificar la licencia de `openai/gpt-oss-20b` antes de cualquier uso comercial.
- El adaptador se ha entrenado únicamente sobre el corpus oasst1, por lo que su efecto de imitación puede no generalizar bien a otros dominios o estilos conversacionales.
- Al ser un adaptador DPO, puede introducir sesgos presentes en el corpus de preferencias utilizado (oasst1), como preferencias culturales o de formato específicas de los anotadores.
- El modelo base `gpt-oss-20b` puede presentar alucinaciones y errores factuales; el adaptador no corrige estos problemas, solo modifica el estilo.
- No se han publicado evaluaciones de seguridad, sesgos o robustez para este adaptador concreto.
- El tamaño del modelo base (20B) requiere hardware con suficiente VRAM, lo que limita su despliegue en entornos de bajos recursos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_oasst1_gpt-oss-20b_as_aya-expanse-8b_seed42
- Adaptador análogo con roles invertidos: https://huggingface.co/dementor-research/dpo_oasst1_aya-expanse-8b_as_gpt-oss-20b_seed42
- Adaptador con gpt-oss-120b como fuente (FriendliAI): https://friendli.ai/models/dementor-research/dpo_oasst1_gpt-oss-120b_as_gpt-oss-20b_seed42
- Adaptador con aya-expanse-8b como fuente y gpt-oss-120b como objetivo (FriendliAI): https://friendli.ai/models/dementor-research/dpo_oasst1_aya-expanse-8b_as_gpt-oss-120b_seed42
- Documentación del modelo base gpt-oss-20b (OpenAI API): https://developers.openai.com/api/docs/models/gpt-oss-20b
