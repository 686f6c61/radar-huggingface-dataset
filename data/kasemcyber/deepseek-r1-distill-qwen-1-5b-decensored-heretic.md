# Kasemcyber/DeepSeek-R1-Distill-Qwen-1.5B-DECENSORED-Heretic

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B-DECENSORED-Heretic es una variante "decensurada" del modelo DeepSeek-R1-Distill-Qwen-1.5B, publicado por el usuario Kasemcyber en Hugging Face. Se trata de un modelo denso de 1.777 millones de parámetros derivado de la destilación de DeepSeek-R1 sobre la arquitectura Qwen2, al que se le ha aplicado un proceso de ablación de comportamiento mediante la herramienta Heretic v2.1.0. El objetivo declarado es reducir la tasa de rechazos (refusals) del modelo original, pasando de 69/100 a 4/100 según las métricas reportadas por el autor.

El modelo base, DeepSeek-R1-Distill-Qwen-1.5B, forma parte de la familia de modelos de razonamiento de DeepSeek publicada en enero de 2025, que incluye DeepSeek-R1-Zero y DeepSeek-R1, además de seis modelos densos destilados sobre Llama y Qwen. Estos destilados buscan transferir las capacidades de razonamiento del modelo grande a arquitecturas más pequeñas que puedan ejecutarse en hardware modesto.

La relevancia de esta variante concreta reside en su enfoque de "decensura" reproducible: el autor documenta los parámetros exactos de la ablación (Arbitrary-Rank Ablation) empleados, lo que permite reproducir el proceso. No obstante, conviene señalar que el modelo tiene cero descargas y cero likes en el momento de la consulta, y que el proceso de ablación introduce una divergencia KL de 0.1055 respecto al original, lo que implica una degradación medible de la distribución de salida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parámetros totales | 1.777.088.000 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el ecosistema Qwen2 admite cuantizaciones habituales, pero el autor no las documenta) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 del destilado original: un transformer denso con 1.777 millones de parámetros. El entrenamiento del modelo base consistió en destilar el comportamiento de DeepSeek-R1 (un modelo de razonamiento entrenado con RL a gran escala) sobre la arquitectura Qwen2, de modo que el modelo pequeño aprende a generar cadenas de pensamiento (chain-of-thought) y a resolver problemas de matemáticas, código y razonamiento lógico. DeepSeek documenta que su pipeline de DeepSeek-R1 combina dos etapas de RL y dos etapas de SFT, y que los destilados se obtuvieron a partir de datos generados por el modelo grande.

Sobre esta base, el autor aplica una técnica de ablación de dirección en el espacio de activaciones denominada Arbitrary-Rank Ablation (ARA), implementada con Heretic v2.1.0. Los parámetros documentados son: `start_layer_index` = 14, `end_layer_index` = 22, `preserve_good_behavior_weight` = 0.8596, `steer_bad_behavior_weight` = 0.0111, `overcorrect_relative_weight` = 0.8312 y `neighbor_count` = 2. La intervención se aplica en las capas 14 a 22 del transformer, modificando las activaciones para suprimir el comportamiento de rechazo. El autor indica que el proceso es reproducible y remite al directorio `reproduce/README.md` del repositorio.

## Capacidades

- Generación de texto conversacional en formato chat, con soporte para plantillas de Qwen2.
- Razonamiento multi-paso mediante cadenas de pensamiento (chain-of-thought), heredado del destilado de DeepSeek-R1.
- Resolución de problemas matemáticos y de lógica, capacidad característica de la familia R1.
- Generación y explicación de código, también heredada del modelo base.
- Supresión del comportamiento de rechazo: según el autor, la tasa de refusals baja de 69/100 a 4/100.
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- Soporte de tool calling / function calling: no documentado por el autor (el modelo base Qwen2 lo admite, pero no se confirma en esta variante).
- Capacidades multilingües: no documentadas; el autor no especifica idiomas soportados.
- Modo thinking explícito: no documentado en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio reproducible de ablación de comportamiento, ya que el autor publica los parámetros exactos de ARA y permite replicar el experimento y medir el efecto sobre la distribución de salidas.
- Evaluación de robustez de filtros de contenido: permite comparar el comportamiento del modelo original frente a la variante ablacionada en pipelines de moderación, midiendo tasas de rechazo y deriva distribucional (KL de 0.1055).
- Experimentación académica con modelos pequeños de razonamiento: con 1.777 millones de parámetros, cabe en GPUs de consumo y permite estudiar cadenas de pensamiento en entornos con recursos limitados.
- Generación de texto creativo sin restricciones de rechazo: para aplicaciones de escritura donde el modelo original declinaría la petición, esta variante responde con mayor frecuencia, aunque con el riesgo asociado de contenido inapropiado.
- Prototipado rápido de asistentes conversacionales: su tamaño reducido permite desplegarlo en portátiles o entornos de desarrollo sin infraestructura dedicada, usando transformers o llama.cpp si se generan cuantizaciones.
- Docencia y demostraciones de técnicas de edición de modelos: el repositorio incluye material de reproducción que puede usarse para explicar cómo funciona la ablación de direcciones en transformers.

## Benchmarks y rendimiento

El autor publica únicamente métricas del proceso de decensura, no benchmarks estándar de razonamiento:

| Métrica | Este modelo | Modelo original |
|---|---|---|
| Refusals | 4/100 | 69/100 |
| Divergencia KL | 0.1055 | 0 (por definición) |

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El modelo base DeepSeek-R1-Distill-Qwen-1.5B sí cuenta con resultados publicados por DeepSeek en su paper, pero no se reproducen aquí al no estar incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-5 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4070); para cuantizaciones de 4-8 bits cabe en GPUs de 4 GB o incluso en CPU.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 8 GB o más en precisión completa, y en GPUs de 4 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag del repositorio), y potencialmente llama.cpp/Ollama si se generan cuantizaciones GGUF, aunque el autor no las proporciona.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B-DECENSORED-Heretic (este) | 1.777 M | no disponible | MIT | Variante ablacionada, 4/100 refusals, KL 0.1055 |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1.777 M | no disponible | MIT | Modelo base, 69/100 refusals, sin ablación |
| Qwen2.5-1.5B-Instruct | ~1.500 M | 32.768 tokens (según documentación de Qwen) | Apache 2.0 | Modelo instruct generalista, sin modo razonamiento explícito |
| DeepSeek-R1-Distill-Qwen-7B | ~7.000 M | no disponible | MIT | Versión mayor del mismo destilado, mayor calidad de razonamiento a costa de más VRAM |

La comparación con Qwen2.5-1.5B-Instruct y DeepSeek-R1-Distill-Qwen-7B se ofrece como referencia de categoría; los datos de contexto y licencia de esos modelos provienen de su documentación pública, no de la información proporcionada para este modelo.

## Limitaciones y advertencias

- La ablación introduce una divergencia KL de 0.1055 respecto al modelo original, lo que indica una alteración medible de la distribución de probabilidad; puede degradar la coherencia y la calidad en tareas generales.
- El proceso de decensura elimina barreras de seguridad: el modelo responderá con mucha mayor frecuencia a peticiones que el original rechazaría, incluyendo potencialmente contenido dañino, ilegal o éticamente problemático. No es apto para despliegues públicos sin capas de moderación externas.
- No se documentan los idiomas soportados; el comportamiento multilingüe es incierto y probablemente inferior al de modelos con cobertura declarada.
- No se documenta la longitud de contexto efectiva de esta variante.
- Riesgo de alucinación: inherente a los modelos de 1.5B destilados; la cadena de pensamiento puede producir razonamientos plausibles pero incorrectos.
- Sesgos: no evaluados por el autor; los sesgos del modelo base y del corpus de destilación persisten y pueden amplificarse con la ablación.
- Licencia MIT: permite uso comercial, pero el usuario asume toda la responsabilidad legal y ética sobre las salidas del modelo.
- El repositorio tiene cero descargas y cero likes, y fue creado en noviembre de 2026; no hay validación comunitaria ni auditoría independiente del proceso.
- El proceso de ablación no está verificado de forma independiente más allá de la documentación del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kasemcyber/DeepSeek-R1-Distill-Qwen-1.5B-DECENSORED-Heretic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Paper de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Repositorio DeepSeek-R1 en GitHub: https://github.com/deepseek-ai/DeepSeek-R1
- Heretic (herramienta de ablación): https://heretic-project.org
- Referencia arXiv del modelo base: https://arxiv.org/abs/2501.12948
- Documentación de Qwen2: no disponible en la información proporcionada.
