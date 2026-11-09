# Mohamedai/Qwen3-4B-OBLITERATED

## Resumen

Qwen3-4B-OBLITERATED es una variante del modelo Qwen/Qwen3-4B a la que se le ha aplicado una técnica de "abliteration" (ingeniería de activaciones orientada a eliminar el comportamiento de rechazo) mediante la herramienta OBLITERATUS, en su método `advanced`. El autor del artefacto es el usuario Mohamedai, que publica los pesos en Hugging Face como un fine-tune del modelo base de Qwen. No se trata de un modelo entrenado desde cero, sino de una modificación quirúrgica de los pesos de un modelo existente para alterar su comportamiento ante peticiones que el modelo original rechazaría.

El modelo hereda la arquitectura y el tamaño del Qwen3-4B original: aproximadamente 4.022 millones de parámetros en formato safetensors, con un repositorio de 8,1 GB, lo que corresponde a pesos en precisión de 16 bits. Al ser un derivado de Qwen3-4B, comparte las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas y modo de pensamiento), aunque la model card no documenta ninguna de ellas de forma explícita.

La relevancia de este artefacto es doble. Por un lado, interesa a investigadores que estudian técnicas de ablación de direcciones de activación y sus efectos sobre el comportamiento del modelo. Por otro, su publicación plantea cuestiones prácticas sobre seguridad, licencias y trazabilidad, ya que el autor no documenta la licencia del derivado ni los detalles del proceso de abliteración, y el modelo base Qwen3-4B tiene sus propias condiciones de uso que conviene verificar antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-4B soporta contexto largo, pero el dato no figura en la ficha) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; los pesos publicados son safetensors en 16 bits (repo de 8,1 GB) |
| Idiomas soportados | en (segun tags de Hugging Face) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 4.022 millones de parámetros, idéntico en arquitectura al Qwen/Qwen3-4B del que deriva. La modificación aplicada no consiste en un reentrenamiento supervisado ni en un ajuste por refuerzo, sino en una intervención sobre las activaciones internas del modelo: la técnica de abliteration identifica direcciones en el espacio de activaciones asociadas al comportamiento de rechazo y las proyecta fuera de los pesos, de modo que el modelo pierde la tendencia a declinar peticiones. La herramienta OBLITERATUS, del autor elder-plinius, implementa este procedimiento y en este caso se usó el método etiquetado como `advanced`.

La model card no documenta el número de tokens de entrenamiento (no hay entrenamiento en el sentido convencional), la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se especifican los hiperparámetros del proceso de ablación, el conjunto de capas intervenidas ni las métricas de evaluación del efecto conseguido. Todo lo que se sabe del proceso es que el modelo base es Qwen/Qwen3-4B, la fuente es "obliterate" y el método es `advanced`. Esta ausencia de documentación es una limitación importante para cualquier evaluación rigurosa.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3-4B.
- Razonamiento y matemáticas: el modelo base Qwen3 incluye modo de pensamiento (thinking mode), aunque la model card del derivado no lo confirma explícitamente.
- Generación de código, presumiblemente con el mismo nivel que el modelo base.
- Capacidades multilingües limitadas al inglés según los tags del repositorio, aunque el modelo base Qwen3-4B es multilingüe; el derivado no documenta el alcance real.
- Comportamiento de rechazo reducido o eliminado por diseño, que es la característica diferencial del artefacto.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio para medir cuánto del comportamiento de rechazo de un modelo alineado reside en direcciones de activación identificables y qué efectos colaterales tiene su eliminación sobre otras capacidades.
- Evaluación de robustez de filtros: equipos que construyen capas de seguridad externas (clasificadores de entrada/salida, moderación) pueden usar este modelo como adversario para probar si sus salvaguardas resisten cuando el modelo subyacente no rechaza por sí mismo.
- Experimentos de interpretabilidad: comparar las activaciones y los pesos del derivado con los del Qwen3-4B original permite estudiar qué cambia exactamente tras la ablación y en qué capas se concentra el efecto.
- Generación de texto sin restricciones en entornos controlados: para tareas creativas o de investigación donde el rechazo del modelo base resulta un obstáculo, siempre dentro de un marco legal y ético y con revisión humana.
- Docencia y divulgación: ilustrar de forma práctica qué es la abliteration, cómo se aplica con OBLITERATUS y por qué es relevante para el debate sobre seguridad en modelos abiertos.
- Pruebas de pipelines de inferencia: al ser un modelo de 4B en safetensors, sirve para validar despliegues con transformers, vLLM o TGI en hardware modesto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 8-9 GB solo para los pesos, más overhead de activaciones y caché KV; con contexto largo, 12-16 GB es un rango realista.
- Cuantización a 8 bits: aproximadamente 4-5 GB de pesos; a 4 bits, en torno a 2,5-3 GB, lo que permite ejecución en GPUs de consumo.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con concurrencia; RTX 4090, RTX 3090 o RTX 4080 para uso individual en FP16; GPUs con 8 GB o menos solo con cuantización agresiva.
- Cabe en GPU de consumo: sí, con cuantización (por ejemplo, RTX 3060 de 12 GB en 4-8 bits, o incluso GPUs de 8 GB en 4 bits con contexto moderado).
- Opciones de despliegue: transformers (como indica la model card), vLLM, TGI, llama.cpp y Ollama si se generan conversiones a GGUF (no incluidas en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, la cuantización y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-4B-OBLITERATED | 4.022 M | no disponible | no disponible | Derivado abliterado de Qwen3-4B, sin benchmarks publicados |
| Qwen/Qwen3-4B | ~4.000 M | no disponible en esta ficha | licencia de Qwen (verificar en el repo original) | Modelo base original, con comportamiento de rechazo intacto y documentación oficial |
| Qwen2.5-3B-Instruct | ~3.000 M | no disponible en esta ficha | licencia de Qwen (verificar) | Alternativa de tamaño similar de la generación anterior, con documentación y benchmarks públicos |
| Llama-3.2-3B-Instruct | ~3.200 M | no disponible en esta ficha | licencia Llama 3.2 | Alternativa de tamaño similar con ecosistema amplio, aunque con condiciones de uso específicas |

La comparación con el modelo base es la más directa: el derivado no aporta mejoras de capacidad, sino un cambio de comportamiento. Frente a otras alternativas de 3-4B, la falta de benchmarks y de licencia clara en el derivado lo sitúa en desventaja para uso en producción.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al eliminar el comportamiento de rechazo, es probable que el modelo reproduzca con mayor facilidad contenido sesgado, ofensivo o dañino presente en los datos de entrenamiento del modelo base.
- Riesgo de alucinación: no evaluado; la ablación puede degradar la calibración del modelo y aumentar la generación de contenido incorrecto presentado con confianza.
- Limitaciones de contexto e idioma: el repositorio declara únicamente inglés; el contexto máximo no está documentado en la ficha, aunque el modelo base soporta ventanas amplias.
- Restricciones de licencia: la licencia del derivado no está indicada, lo que impide determinar si el uso comercial es posible; además, deben respetarse las condiciones de la licencia del modelo base Qwen/Qwen3-4B.
- Trazabilidad: la model card no documenta hiperparámetros, capas intervenidas ni evaluación del efecto de la ablación; no hay forma de verificar la calidad del proceso a partir de la información publicada.
- Uso en producción: no recomendado sin una capa de moderación externa, dado que el modelo está diseñado explícitamente para no rechazar peticiones.
- Ausencia de benchmarks: no hay datos que permitan comparar su rendimiento con el modelo base ni con alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mohamedai/Qwen3-4B-OBLITERATED
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
