# ducvh5/wan21-a5b5x4c5-tf-fm-tm-u5-qt

## Resumen

`ducvh5/wan21-a5b5x4c5-tf-fm-tm-u5-qt` es un ajuste fino (finetune) del modelo de generación de vídeo texto-a-vídeo Wan2.1-T2V-1.3B de Alibaba, publicado por el usuario `ducvh5` en HuggingFace. El modelo parte de la arquitectura de difusión de Wan 2.1 (variante de 1.300 millones de parámetros) y la modifica con una estructura de bloques recurrentes que el autor describe como "A5 → B5×4 → C5", con 15 bloques únicos y 30 bloques ejecutados en total. Se distribuye en formato `diffusers` con pesos `safetensors` y un repositorio de 31,8 GB.

La model card es extremadamente escueta y de carácter técnico-experimental: indica que el entrenamiento combina tres funciones de pérdida (TF+FM+TM), usa muestreo de σ uniforme en [0,1] con shift=5 y t=1000σ, y entrena sobre un conjunto de datos denominado "OV" con subtítulos "QT" al 50/50 entre variantes VB y completas. No se especifican detalles sobre el número de tokens de entrenamiento, la composición del dataset ni los resultados obtenidos.

Se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la ficha, sin licencia declarada ni idiomas especificados. Su interés es limitado para producción, pero puede resultar relevante para quienes investiguen arquitecturas recurrentes aplicadas a modelos de difusión para vídeo o quieran reproducir el pipeline de entrenamiento descrito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con bloques recurrentes (A5 → B5×4 → C5; 15 bloques únicos / 30 ejecutados) |
| Parámetros totales | 1.300 millones (derivado de Wan2.1-T2V-1.3B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; se podría cuantizar con herramientas diffusers, pero no se documenta) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato diffusers), más `state.pt` en `step0020500/` |

## Arquitectura y entrenamiento

El modelo deriva de Wan2.1-T2V-1.3B-Diffusers, un transformer de difusión para generación de vídeo a partir de texto. La modificación principal introducida por el autor es una estructura de bloques recurrentes descrita como "A5 → B5×4 → C5": cinco bloques del tipo A, seguidos de cuatro repeticiones de un bloque B (cinco en total) y cinco bloques del tipo C, lo que resulta en 15 bloques únicos pero 30 ejecuciones efectivas si se cuentan las repeticiones. Esta disposición sugiere un esquema de compartición de pesos o reutilización de bloques a lo largo de la profundidad de la red, una técnica explorada en la literatura para aumentar la capacidad efectiva sin incrementar proporcionalmente el número de parámetros.

El entrenamiento combina tres pérdidas (TF+FM+TM, cuyas siglas no se detallan en la model card), utiliza un muestreo de σ uniforme en [0,1] con un factor de shift de 5 y una parametrización t=1000σ, coherente con los esquemas de difusión continuos habituales. Los datos de entrenamiento se denominan "OV" y los subtítulos "QT", con una mezcla 50/50 entre variantes VB y completas; no se especifica el volumen de datos, la resolución de vídeo, la duración de los clips ni si hubo etapas de RLHF o DPO (poco habituales en modelos de difusión). El repositorio conserva los 9 pesos EMA y no-EMA, y el estado final del optimizador en `step0020500/state.pt`, lo que indica que el entrenamiento se detuvo en el paso 20.500.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), heredada del pipeline de Wan2.1-T2V-1.3B.
- Estructura de bloques recurrentes que puede interesar para experimentación con compartición de pesos en difusión.
- Compatible con la librería `diffusers` (etiqueta de librería confirmada).
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni de audio.
- No se documentan modos especiales (thinking, visión, etc.).
- No se documenta soporte de agentes.

## Casos de uso

- Investigación en arquitecturas recurrentes para difusión: el modelo permite estudiar cómo afecta la disposición A5 → B5×4 → C5 a la calidad y al coste computacional en generación de vídeo, comparándolo con el Wan2.1 base sin modificar.
- Reproducción de experimentos de entrenamiento: al conservar los 9 pesos EMA/no-EMA y el estado del optimizador en el paso 20.500, sirve para reanudar o auditar el proceso de entrenamiento descrito en la model card.
- Generación de clips de vídeo de baja resolución para prototipado: al derivar de un modelo de 1.300 millones de parámetros, es viable en GPUs de gama alta consumer para pruebas rápidas de prompts.
- Estudio de funciones de pérdida combinadas (TF+FM+TM): útil para quienes investiguen esquemas de pérdida híbridos en modelos de difusión.
- Base para finetunes posteriores: al estar en formato `diffusers` y safetensors, se puede cargar con las herramientas estándar y ajustar sobre dominios específicos.
- Evaluación comparativa de esquemas de muestreo de σ: el uso de σ ~ U(0,1) con shift=5 y t=1000σ permite analizar el impacto de la parametrización temporal en la calidad del vídeo generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repositorio (31,8 GB) y los 1.300 millones de parámetros en precisión completa más estados, se requiere al menos una GPU con 24 GB para cargar los pesos sin cuantizar, y más si se incluyen los checkpoints EMA/no-EMA completos.
- GPU recomendadas: no disponible en la documentación; por tamaño, una RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) son candidatas razonables para inferencia y para cargar el estado completo.
- ¿Cabe en GPU consumer? Probablemente en RTX 4090 o GPUs con 24 GB o más si se carga solo el modelo (no el estado del optimizador); no confirmado por el autor.
- Opciones de despliegue: `diffusers` (confirmado por la etiqueta de librería); otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican a modelos de difusión de vídeo y no se documentan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-tf-fm-tm-u5-qt | 1.300 M | No disponible | No disponible | safetensors (diffusers) | HuggingFace, 0 descargas |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers (base) | 1.300 M | No disponible | No disponible en esta ficha | safetensors (diffusers) | HuggingFace, modelo base oficial |
| Otros finetunes de Wan2.1-T2V-1.3B | ~1.300 M | No disponible | Variable según autor | safetensors (diffusers) | HuggingFace |

La comparación se limita al modelo base del que deriva, ya que no se dispone de datos de benchmarks ni de otros finetunes comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- La model card es extremadamente escueta: no se documentan sesgos, composición del dataset, resolución, duración de clips ni calidad esperada.
- Riesgo de alucinación y artefactos visuales inherente a los modelos de difusión de vídeo; no se han publicado evaluaciones cualitativas.
- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribución; es imprescindible contactar con el autor o consultar la licencia del modelo base Wan2.1 antes de cualquier uso en producción.
- Idiomas no especificados: se desconoce si los prompts deben estar en inglés, chino u otros idiomas.
- Checkpoint experimental con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- El repositorio incluye estados de entrenamiento (EMA/no-EMA y `state.pt`) que incrementan el tamaño a 31,8 GB; para inferencia probablemente baste con un subconjunto, pero no se documenta cuál.
- No hay garantías de soporte ni mantenimiento por parte del autor.
- Fecha de creación futura (2026-11-02) en los metadatos: conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tf-fm-tm-u5-qt
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
