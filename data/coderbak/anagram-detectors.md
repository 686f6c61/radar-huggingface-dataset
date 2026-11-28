# CoderBak/anagram-detectors

## Resumen

Anagram detectors es un conjunto de clasificadores de detección de autoría (authorship detection) publicados por el usuario CoderBak en Hugging Face. El repositorio no contiene un único modelo generativo, sino varias ramas de pesos (releases) construidas sobre distintos backbones: la versión por defecto emplea el encoder `jhu-clsp/ettin-encoder-400m`, mientras que una variante alternativa se basa en `Qwen/Qwen3.5-0.8B-Base`. El objetivo declarado es identificar la autoría o procedencia de un texto, presumiblemente generado por distintos modelos de lenguaje.

El interés técnico del proyecto reside en su enfoque de entrenamiento: el autor documenta un conjunto amplio de "generadores de entrenamiento" (modelos que producen los textos de las clases), con nombres que abarcan familias de Anthropic, OpenAI, Google, Meta, DeepSeek, Moonshot AI, Qwen, xAI, Z.ai, NVIDIA, StepFun y Thinking Machines. Esto sugiere un clasificador multi-clase orientado a distinguir entre salidas de distintos LLM, más que un detector binario humano/máquina.

La información pública es escasa: no se especifican licencia, pipeline, número de parámetros exactos del clasificador, contexto ni datos de benchmarks. El tamaño del repositorio (4,7 GB) es coherente con la inclusión de múltiples releases de pesos, no con un único modelo de ese tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador sobre backbone encoder (ettin-encoder-400m por defecto); variante sobre Qwen3.5-0.8B-Base |
| Parametros totales | No disponible (backbone base de 400M en la release por defecto; 0.8B en la variante Qwen) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | No disponible (repositorio de 4,7 GB con multiples ramas de release) |

## Arquitectura y entrenamiento

El modelo se plantea como una tarea de clasificación supervisada: se parte de un backbone preentrenado (un encoder de 400M parámetros en la release por defecto, o un modelo base de 0.8B en la variante Qwen) y se ajusta para predecir la autoría del texto. La model card no detalla la cabeza de clasificación, la función de pérdida ni el número de clases finales, aunque la lista de generadores de entrenamiento permite inferir un etiquetado multi-clase por modelo de origen.

El conjunto de datos de entrenamiento se construye a partir de textos generados por una lista explícita de modelos, que incluye tanto sistemas comerciales (por ejemplo, `gpt-4.1`, `claude-sonnet-5.5`, `gemini-2.5-flash`) como modelos abiertos (`llama-3.3-70b-instruct`, `gpt-oss-120b`, `qwen4-max`). No se indica el volumen de muestras, la longitud de los textos, el balance entre clases ni si hubo aumentación de datos o validación cruzada. Tampoco se documenta el proceso de selección de hiperparámetros ni métricas de validación.

## Capacidades

- Clasificación de autoría de texto en inglés, presumiblemente orientada a distinguir entre salidas de distintos modelos de lenguaje.
- Detección de procedencia de texto generado por LLM (atribución a un generador concreto dentro del conjunto de entrenamiento).
- Dos variantes de backbone: una ligera basada en encoder de 400M y otra basada en un modelo de 0.8B, lo que permite distintos compromisos de coste/rendimiento.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- Capacidad multilingüe: no disponible; la etiqueta de idioma indica únicamente inglés.

## Casos de uso

- Moderación de contenido generado por IA: el clasificador puede emplearse para etiquetar textos según el modelo que probablemente los generó, útil en plataformas que quieran distinguir contenido sintético de distintos orígenes.
- Atribución en entornos de investigación: permite analizar corpus mixtos y estimar la proporción de textos provenientes de cada generador documentado en el conjunto de entrenamiento.
- Detección de plagio asistido por IA en contextos académicos: como capa adicional de señal junto a otros detectores, para marcar textos sospechosos de generación automática.
- Auditoría de pipelines de datos: al construir datasets sintéticos con varios modelos, el clasificador puede verificar que las muestras corresponden al generador esperado.
- Análisis forense de textos: en escenarios de verificación de autoría, sirve como evidencia auxiliar sobre la procedencia probable del contenido.
- Evaluación de robustez de detectores: el repositorio permite comparar el comportamiento de dos backbones (400M frente a 0.8B) sobre la misma tarea, útil para estudiar el efecto del tamaño del modelo en la detección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un backbone de 400M en precisión FP16 se puede estimar en torno a 1 GB de pesos, y para la variante de 0.8B en torno a 2 GB, sin contar overhead de activaciones ni batch.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar ejecución en GPU consumer (RTX 3060, RTX 4090) para ambas variantes, pero no hay confirmación oficial.
- Cabe en GPU consumer: probablemente sí en ambas variantes por el tamaño de los backbones, si bien no está documentado.
- Opciones de despliegue: no documentadas; al tratarse de un clasificador basado en transformers, sería desplegable con bibliotecas estándar (Transformers, TGI) si los pesos están en formatos compatibles, extremo no confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoderBak/anagram-detectors | 400M (backbone por defecto) / 0.8B (variante) | No disponible | Deteccion de autoria multi-clase | No disponible | Hugging Face |
| Alternativas de deteccion de autoria | No disponible | No disponible | Deteccion de autoria | No disponible | No disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se especifica licencia, por lo que el uso comercial queda sin cobertura legal clara hasta que el autor la declare.
- El modelo está etiquetado únicamente para inglés; su comportamiento en otros idiomas no está documentado.
- Al ser un clasificador entrenado sobre salidas de modelos concretos, es probable que generalice mal a generadores no incluidos en el conjunto de entrenamiento (sesgo de clase cerrada).
- Riesgo de falsos positivos y negativos no cuantificado: no hay métricas publicadas de precisión, recall ni calibración.
- El repositorio agrupa múltiples releases en ramas; es necesario seleccionar explícitamente la rama correcta, ya que la rama por defecto puede cambiar.
- No hay información sobre sesgos demográficos, lingüísticos ni de estilo, ni sobre el proceso de anotación o generación de datos.
- La fecha de creación y actualización del repositorio (noviembre de 2026) y los nombres de generadores incluidos deben tratarse con cautela, ya que no se han podido verificar de forma independiente.

## Enlaces

- [Hugging Face: CoderBak/anagram-detectors](https://huggingface.co/CoderBak/anagram-detectors)
- [Release por defecto: 2026-11-28-400m-ettin_research](https://huggingface.co/CoderBak/anagram-detectors/tree/2026-11-28-400m-ettin_research)
- [Release alternativa: 2026-11-28-0.8b-qwen3.5_research](https://huggingface.co/CoderBak/anagram-detectors/tree/2026-11-28-0.8b-qwen3.5_research)
- [Release anterior: 2026-11-14-400m-research](https://huggingface.co/CoderBak/anagram-detectors/tree/2026-11-14-400m-research)
- [Backbone por defecto: jhu-clsp/ettin-encoder-400m](https://huggingface.co/jhu-clsp/ettin-encoder-400m)
- [Backbone alternativo: Qwen/Qwen3.5-0.8B-Base](https://huggingface.co/Qwen/Qwen3.5-0.8B-Base)
