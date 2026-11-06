# Kausp11/searchlm-sft_v4cannsent_wiki360_cm

## Resumen

Searchlm-sft_v4cannsent_wiki360_cm es un modelo de generación de texto basado en la arquitectura LLaMA, entrenado por el usuario Kausp11 y publicado en Hugging Face en octubre de 2026. Se trata de un baseline ajustado por compute (compute-matched) a partir de un preentrenamiento sobre Wikipedia de aproximadamente 360 millones de parámetros, al que se le ha aplicado una etapa de fine-tuning supervisado (SFT) de una época.

El modelo forma parte de una línea de investigación sobre preentrenamiento con búsqueda habilitada (search-enabled pretraining), donde las conversaciones de entrenamiento incluyen bloques de búsqueda procedentes del pipeline de anotación del preentrenamiento. Su propósito principal es servir como punto de comparación (baseline) en experimentos de investigación, no como modelo de producción.

Con 361,8 millones de parámetros y una licencia Apache 2.0, es un modelo pequeño y abierto, adecuado para experimentación académica, evaluación de técnicas de SFT y análisis de datos sintéticos de búsqueda integrados en el entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (transformer decoder) |
| Parametros totales | 361.824.960 (~362M) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp16 implícitos en safetensors) |
| Idiomas soportados | no disponible (entrenado sobre Wikipedia y SmolTalk, presumiblemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de la familia LLaMA con unos 362 millones de parámetros. Se inicializó desde el checkpoint `wiki6m_v2/baseline/e8`, un modelo preentrenado sobre Wikipedia en un régimen compute-matched, es decir, con un presupuesto de cómputo equiparable a otros modelos de la misma serie de experimentos para permitir comparaciones justas.

La etapa de fine-tuning supervisado (SFT, versión v4c-ann-sent) se realizó durante una época combinando tres fuentes de datos: SmolTalk (conversaciones y habilidades de chat), SmolTalk2 (tool calling) y conversaciones SmolTalk enriquecidas con bloques de búsqueda generados por el pipeline de anotación del preentrenamiento, insertados al inicio de las frases. El formato de chat utilizado es `User: ...\n\nAssistant: ...`. No hay información disponible sobre el número total de tokens de entrenamiento, el uso de RLHF/DPO ni técnicas adicionales como decodificación especulativa o attention lineal.

## Capacidades

- Generación de texto conversacional en formato `User: .../Assistant: ...`
- Tool calling (function calling) heredado del entrenamiento con SmolTalk2
- Manejo de bloques de búsqueda integrados en las conversaciones, fruto del enfoque de search-enabled pretraining
- Seguimiento de instrucciones básicas mediante SFT sobre SmolTalk
- No hay evidencia de capacidades multimodales (visión, audio) ni de modo de razonamiento extendido (thinking mode)

Dado su tamaño (~362M) y su origen como baseline de investigación, sus capacidades de razonamiento, código y matemáticas son presumiblemente limitadas en comparación con modelos comerciales o abiertos de mayor escala.

## Casos de uso

- Investigación en search-enabled pretraining: sirve como baseline compute-matched para comparar el efecto de integrar bloques de búsqueda en el entrenamiento frente a entrenamientos sin búsqueda.
- Experimentos de SFT: permite estudiar cómo distintas mezclas de datos (SmolTalk, SmolTalk2, datos con anotaciones de búsqueda) afectan al comportamiento del modelo.
- Prototipado de tool calling ligero: al haberse entrenado con SmolTalk2, puede usarse para probar pipelines de function calling en entornos de bajo coste computacional.
- Docencia y formación: su pequeño tamaño y licencia permisiva lo hacen adecuado para practicar fine-tuning, cuantización y despliegue en entornos educativos.
- Evaluación de formatos de chat: útil para investigar el impacto del formato `User:/Assistant:` sin plantilla de chat compleja en el rendimiento conversacional.
- Estudios de ablación sobre datos de anotación: el uso de bloques de búsqueda insertados al inicio de las frases permite analizar cómo la posición y el formato de los datos sintéticos influyen en el aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~362M de parámetros en fp16/bf16, aproximadamente 0,8-1 GB de VRAM; en int8 alrededor de 0,5 GB y en int4 unos 0,3 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere aceleradores de datacenter (A100/H100) para inferencia. Puede ejecutarse incluso en CPU.
- Consumer GPUs: cabe con holgura en GPUs como la RTX 3060 de 12 GB, RTX 4060 u otras de 4-8 GB de VRAM; incluso en portátiles con GPU dedicada básica.
- Opciones de despliegue: transformers (librería nativa, según la model card); en principio compatible con llama.cpp si se convierte a GGUF, y con Ollama tras conversión; no hay constancia de soporte verificado en vLLM o TGI para este checkpoint concreto.
- Latencia y throughput: no disponible; al ser un modelo de ~362M, se espera latencia baja y throughput alto en hardware modesto, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kausp11/searchlm-sft_v4cannsent_wiki360_cm | ~362M | no disponible | Apache 2.0 | Baseline de investigación con SFT y bloques de búsqueda |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 8.192 tokens | Apache 2.0 | Modelo instruct de tamaño similar, entrenado con SmolTalk |
| Qwen2.5-0.5B-Instruct | ~494M | 32.768 tokens (128K con YaRN) | Apache 2.0 (parcial) | Mayor contexto y rendimiento general, mismo rango de tamaño |

Frente a SmolLM2-360M-Instruct, comparte el uso de SmolTalk como datos de SFT y un tamaño casi idéntico, pero el modelo de Kausp11 es un baseline experimental sin benchmarks publicados. Frente a Qwen2.5-0.5B-Instruct, ofrece un contexto presumiblemente menor y menos capacidades contrastadas, a cambio de servir a un propósito investigador específico.

## Limitaciones y advertencias

- Al tratarse de un baseline de investigación entrenado sobre Wikipedia y datos SmolTalk, puede presentar sesgos derivados del corpus enciclopédico y de los datos sintéticos de anotación de búsqueda.
- Riesgo de alucinación elevado: no hay evaluaciones publicadas que garanticen fiabilidad factual, y el tamaño del modelo agrava este problema.
- Longitud de contexto no documentada: no es posible garantizar el comportamiento en entradas largas.
- Idiomas no especificados: presumiblemente optimizado para inglés; el rendimiento en castellano no está verificado.
- Sin benchmarks publicados, no hay forma de validar su rendimiento frente a alternativas antes de usarlo.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes, pero el modelo carece de garantías y de la madurez necesaria para producción.
- El formato de chat `User: ...\n\nAssistant: ...` no es una plantilla estándar de chat (no usa ChatML ni similar), lo que puede complicar la integración con librerías que asumen plantillas convencionales.
- Descargas muy limitadas (246) y sin likes: comunidad reducida, por lo que el soporte y la detección de errores dependerán del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/searchlm-sft_v4cannsent_wiki360_cm
- Paper: no disponible
- Repositorio de codigo: no disponible (la model card menciona el origen RCP `search-lm/ckpts/sft_v4cannsent_wiki360_cm`, sin enlace público)
- Demo: no disponible
- Datos de entrenamiento (SmolTalk): https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Datos de entrenamiento (SmolTalk2): https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
