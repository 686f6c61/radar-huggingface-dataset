# Lbuk/TheSystem-9B-LoRA

## Resumen

TheSystem-9B-LoRA es un adaptador LoRA de rango 16 publicado por Lbuk (Leszek Bukowski) que se monta sobre el modelo congelado Qwen3.5-9B para convertirlo en un modelo de decisión capaz de elegir entre un conjunto de respuestas suministradas o de generar texto libre. El mecanismo central es una compuerta interna aprendida denominada `<FAST>`, que decide una vez por prompt si el modelo debe actuar en modo decisión (seleccionar una opción) o en modo generación (usar la ruta generativa original del backbone). El objetivo declarado es demostrar que un único LLM puede realizar ambas tareas sin necesidad de mantener dos modelos separados, algo que hasta ahora solía requerir un modelo especializado en decisiones y otro para generación.

La propuesta se apoya en la analogía de los sistemas de Kahneman: la compuerta `<FAST>` actuaría como un "sistema uno" rápido que enruta la petición, mientras que la generación de texto reutiliza el comportamiento original del backbone. En modo generación los componentes de decisión se desactivan por completo y Qwen3.5-9B responde con su ruta nativa. El adaptador se entrenó con dos objetivos separados: enseñar a la compuerta a distinguir prompts de decisión de prompts generativos, y enseñar al modelo a seleccionar la respuesta correcta entre las opciones dadas.

El repositorio es de tamaño reducido (0,1 GB), coherente con un adaptador LoRA y no con pesos completos, y se distribuye bajo licencia Apache 2.0. La relevancia actual del proyecto es más experimental que de producción: explora una arquitectura de enrutamiento interno en LLMs decoder-only y publica tanto la variante LoRA como una variante alternativa basada en un clasificador probe sobre el estado interno del backbone congelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16) sobre transformer decoder-only congelado (Qwen3.5-9B) con compuerta de enrutamiento `<FAST>` |
| Parametros totales | No disponible (el adaptador LoRA es de rango 16; el backbone Qwen3.5-9B aporta los parámetros principales) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 (código y pesos aprendidos); aviso Apache 2.0 de Qwen para el backbone |
| Formato de pesos | No disponible (repositorio de 0,1 GB, compatible con el flujo de carga LoRA descrito en la model card) |

## Arquitectura y entrenamiento

El sistema se compone de tres piezas: un backbone Qwen3.5-9B congelado, una compuerta `<FAST>` aprendida que decide el modo de respuesta por prompt y un adaptador LoRA de rango 16 que implementa la ruta de decisión. La compuerta se entrena para distinguir prompts de decisión (seleccionar entre respuestas suministradas) de prompts generativos (escribir una respuesta). El adaptador LoRA y la variante alternativa Probe-256 se entrenaron para elegir qué respuesta escoger entre las opciones dadas, usando los mismos 18.000 ejemplos. La compuerta publicada se entrenó además con prompts de enrutamiento más variados que los originales.

El entrenamiento separa explícitamente los dos objetivos (enrutamiento y selección de respuesta), lo que permite que en modo generación los componentes de decisión se bypassen y el backbone opere con su comportamiento original. En todas las pruebas de la release (backbone original, Probe-256 y LoRA) se desactivó el modo thinking nativo de Qwen (`enable_thinking=False`). El autor indica que en la próxima release publicará resultados con el modo thinking habilitado para generación de texto. La variante alternativa Probe-256 usa un clasificador probe que lee el estado interno del backbone congelado, en lugar de ajustar pesos vía LoRA.

## Capacidades

- Enrutamiento automático por prompt mediante la compuerta `<FAST>`, con modos `auto`, `decision` y `generation`.
- Selección de respuesta entre un conjunto de opciones suministradas (modo decisión).
- Generación de texto libre reutilizando la ruta nativa de Qwen3.5-9B (modo generación).
- Cambio de modo controlable por el usuario o delegado al modelo.
- Capacidades generativas heredadas del backbone Qwen3.5-9B (no detalladas en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking: desactivado en todas las pruebas de esta release.

## Casos de uso

- Enrutamiento de decisiones en atención al cliente: dado un prompt y un conjunto de posibles respuestas (por ejemplo, "facturación" o "soporte"), el adaptador selecciona la opción adecuada sin necesidad de un clasificador externo, aprovechando el modo `decision`.
- Asistentes conversacionales con doble comportamiento: el mismo modelo puede decidir cuándo debe elegir entre opciones predefinidas y cuándo debe redactar una respuesta libre, simplificando la arquitectura de despliegue al eliminar un modelo separado para cada tarea.
- Clasificación de intenciones en pipelines de soporte: usar el modo decisión para mapear consultas de usuario a categorías predefinidas y, a continuación, derivar al flujo generativo para redactar la respuesta final.
- Investigación sobre enrutamiento interno en LLMs: el repositorio y los notebooks de evaluación permiten reproducir experimentos con la compuerta `<FAST>` y comparar la variante LoRA con la variante Probe-256.
- Prototipado de sistemas "system one / system two": útil para equipos que quieran experimentar con arquitecturas que combinan decisión rápida y generación deliberada en un único modelo.
- Evaluación comparativa de adaptadores LoRA frente a probes: el proyecto publica ambos enfoques sobre el mismo backbone y los mismos datos, lo que facilita estudios comparativos de métodos de adaptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al notebook de evaluación y al documento de resultados del repositorio de GitHub, pero no incluye cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador LoRA es ligero (repositorio de 0,1 GB), pero requiere cargar el backbone Qwen3.5-9B completo.
- GPU recomendadas: el autor sugiere una GPU NVIDIA con BF16 nativo, como una A100, para el notebook de demostración en Colab. También menciona que se puede intentar con 24 GB de VRAM, aunque advierte que el ajuste no está verificado.
- ¿Cabe en GPU de consumo? No confirmado. Con 24 GB podría intentarse, pero el autor no garantiza que quepa.
- Opciones de despliegue: la model card solo documenta el flujo de carga mediante el notebook de Colab; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheSystem-9B-LoRA | LoRA rango 16 sobre Qwen3.5-9B | No disponible | Decisión + generación con compuerta `<FAST>` | Apache 2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| TheSystem-9B-Probe-256 | Probe sobre Qwen3.5-9B | No disponible | Decisión + generación con probe clasificador | Apache 2.0 | Hugging Face (variante hermana del mismo autor) |
| Nimble | No disponible | No disponible | Modelo de decisión basado en LLM | No disponible | GitHub (bespokelabsai/nimble) |
| Jev | No disponible | No disponible | Modelo de decisión tipo "system one" | No disponible | Blog de typesafe.ai |

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en inglés; no se declara soporte para otros idiomas.
- El modo thinking nativo de Qwen está desactivado en todas las pruebas de esta release; los resultados con thinking habilitado se anuncian para una versión futura.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.
- No se publican cifras de benchmarks en la información disponible; el rendimiento real del enrutamiento y de la selección de respuestas no está cuantificado en la model card.
- El ajuste en GPUs de 24 GB no está verificado por el autor, lo que limita el despliegue en hardware de consumo.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al heredar el backbone Qwen3.5-9B, arrastra los sesgos y limitaciones de este.
- La licencia Apache 2.0 cubre el código y los pesos aprendidos del repositorio; el backbone Qwen3.5-9B se rige por su propio aviso Apache 2.0, y los términos del dataset se detallan en los avisos de terceros del repositorio de GitHub.
- El proyecto se encuentra en versión 0.1.0rc4, lo que indica un estado temprano de desarrollo.

## Enlaces

- Hugging Face: https://huggingface.co/Lbuk/TheSystem-9B-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante Probe-256: https://huggingface.co/Lbuk/TheSystem-9B-Probe-256
- Dataset: https://huggingface.co/datasets/Lbuk/TheSystem-Data
- Notebook de demostración en Colab: https://colab.research.google.com/github/bqpro1/TheSystem/blob/main/notebooks/02-Try-LoRA.ipynb
- Notebook de evaluación: https://huggingface.co/Lbuk/TheSystem-9B-LoRA/blob/main/evaluation.ipynb
- Resultados de evaluación: https://github.com/bqpro1/TheSystem/blob/main/docs/EVALUATION.md
- Reproducibilidad: https://github.com/bqpro1/TheSystem/blob/main/docs/REPRODUCIBILITY.md
- Repositorio GitHub: https://github.com/bqpro1/TheSystem
- Avisos de terceros: https://github.com/bqpro1/TheSystem/blob/main/licenses/README.md
- Paper LoRA: https://arxiv.org/abs/2106.09685
- Paper probe classifier: https://arxiv.org/abs/1610.01644
- Nimble: https://github.com/bespokelabsai/nimble
- Jev (typesafe.ai): https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Libro "Thinking, Fast and Slow": https://us.macmillan.com/books/9780374275631/thinkingfastandslow/
