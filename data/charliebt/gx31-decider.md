# CharlieBT/gx31-decider

## Resumen

GX31-decider es un ajuste fino completo (full fine-tune) del modelo tattrongvu/Jeffan-31b-1710, que a su vez deriva de google/gemma-4-31B-it. Lo desarrolla el usuario CharlieBT para la pista de decisión generalista de la subred REAX (identificador SN92, configuración d6s200). El modelo resuelve un problema muy concreto: dada una situación con varias opciones posibles, devolver la letra de la opción con mayor probabilidad como siguiente token. No es un modelo conversacional generalista, sino un clasificador de decisiones empaquetado como modelo de generación de texto estándar de Gemma-4, sin código personalizado.

Técnicamente es un transformer denso de 31.273.086.512 parámetros (unos 31,3 mil millones), distribuido en safetensors con un repositorio de 62,6 GB. Al ser un fine-tune completo sobre una base Gemma-4, hereda la arquitectura y la ventana de contexto del modelo original, aunque la model card no detalla explícitamente ni la longitud de contexto ni los idiomas soportados. La licencia es Apache-2.0, lo que facilita su uso comercial con atribución.

Su relevancia ahora es acotada pero clara: demuestra una técnica de destilación por ensemble aplicada a un modelo grande para una tarea de decisión tipada, con exclusión deliberada de fuentes no comerciales y de etiquetas generadas por OpenAI o Anthropic. Es un caso interesante de cómo se puede especializar un modelo de 31B en una tarea de clasificación estructurada manteniendo el formato de pesos estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma-4, según la model card) |
| Parámetros totales | 31.273.086.512 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; se puede cuantizar con herramientas estándar, pero el autor no lo especifica) |
| Idiomas soportados | No disponible (los subconjuntos multilingües se excluyeron del entrenamiento) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 31,3 mil millones de parámetros, construido sobre google/gemma-4-31B-it a través del fine-tune intermedio tattrongvu/Jeffan-31b-1710. Se sirve como un modelo Gemma-4 estándar, sin código personalizado: la respuesta se obtiene seleccionando la letra de opción con el logit más alto en el siguiente token. Esto implica que la tarea de decisión se ha reformulado como una generación de un único token entre un conjunto de letras candidatas.

El entrenamiento se realizó sobre 99.763 filas de la mezcla de decisiones m2, compuesta por splits de entrenamiento de benchmarks públicos (vía tasksource/tasksource-jev-typed-decisions, excluyendo fuentes no comerciales y etiquetas escritas o generadas por modelos de OpenAI o Anthropic, así como subconjuntos multilingües), tasksource/procedural-typed-decisions (Apache-2.0), decisionmodels/sn92-specialists y sn92-generalist-train-v1 (CC-BY-4.0), nvidia/When2Call (CC-BY-4.0) y generadores propios en formato v5.1, además de registros públicos reetiquetados. La innovación técnica principal es la destilación por ensemble sobre cada una de esas entradas: el objetivo es 0,5 veces la respuesta gold más 0,5 veces la distribución de respuestas de un ensemble de logits de dos modelos, el modelo padre Jeffan-31b-1710 y un merge TIES de cuatro fine-tunes de baselabs/mammoth-1 (MIT). Solo se usaron las probabilidades de respuesta de los profesores sobre las entradas de entrenamiento, nunca sus pesos, y no se emplearon etiquetas escritas por OpenAI o Anthropic. Se reservó deliberadamente la mitad de los 56 tipos de tarea proxy y sus datasets de origen para evaluación.

## Capacidades

- Toma de decisiones tipada: dada una situación con opciones, devuelve la letra de la opción con mayor logit como siguiente token.
- Clasificación estructurada mediante generación de un único token, sin necesidad de código personalizado.
- Razonamiento de elección entre alternativas en dominios cubiertos por la mezcla de entrenamiento (benchmarks públicos, decisiones procedurales, When2Call y generadores propios).
- Capacidad de generación de texto heredada de la base Gemma-4, aunque el fine-tune está orientado a la tarea de decisión.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo está diseñado para una decisión por paso.
- Capacidades multilingües: no disponibles; los subconjuntos multilingües se excluyeron del entrenamiento.
- Capacidades especiales: no se declaran thinking mode, visión ni audio.

## Casos de uso

- Enrutamiento de decisiones en pipelines de agentes: el modelo puede actuar como "decider" que elige entre opciones predefinidas (herramientas, rutas, acciones) devolviendo la letra de la opción más probable, integrándose como un paso de clasificación dentro de un sistema mayor.
- Evaluación de políticas de decisión: sirve para comparar la distribución de respuestas del modelo frente a la respuesta gold en conjuntos de tareas tipadas, gracias a que se reservaron tipos de tarea proxy para evaluación.
- Investigación en destilación por ensemble: es un artefacto útil para estudiar cómo se transfiere la distribución de respuestas de un ensemble de profesores a un alumno de 31B sin compartir pesos.
- Clasificación de llamadas a funciones: con datos de nvidia/When2Call en el entrenamiento, puede usarse para decidir si una consulta requiere una llamada a herramienta y cuál, devolviendo la opción correspondiente.
- Filtrado y triaje en producción: dado un conjunto acotado de categorías, el modelo devuelve la letra de la categoría más probable, lo que permite construir clasificadores de bajo coste de inferencia por token (una sola letra generada).
- Generación de decisiones en dominios procedurales: los datos de tasksource/procedural-typed-decisions permiten aplicarlo a la selección de pasos en procedimientos estructurados.
- Base para fine-tunes posteriores: al ser Apache-2.0 y estar en safetensors estándar, puede servir como punto de partida para especializaciones adicionales en tareas de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que se reservó la mitad de los 56 tipos de tarea proxy para evaluación, pero no incluye las métricas obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 31,3 mil millones de parámetros, en FP16 se necesitan aproximadamente 62,6 GB solo para pesos, más memoria para el contexto y el estado de inferencia; en cuantización de 8 bits rondaría los 31 GB y en 4 bits unos 16 GB, aunque el autor no publica cifras.
- GPU recomendadas: para FP16, GPUs con 80 GB (A100 80GB, H100) o múltiples GPUs de 24-48 GB; para cuantización de 4 bits, una RTX 4090 de 24 GB podría ser suficiente en teoría, pero no está confirmado por el autor.
- ¿Cabe en GPU de consumo? Posiblemente en RTX 4090 (24 GB) con cuantización agresiva, pero no hay confirmación oficial.
- Opciones de despliegue: al ser un modelo Gemma-4 estándar en safetensors, es compatible con frameworks que soporten Gemma-4 (vLLM, TGI, transformers); llama.cpp y Ollama requerirían conversión a GGUF, no documentada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| CharlieBT/gx31-decider | 31,3B | No disponible | Apache-2.0 | Decisión tipada por siguiente token |
| tattrongvu/Jeffan-31b-1710 (padre) | 31B (aproximado) | No disponible | Apache-2.0 | Base generalista Gemma-4 |
| google/gemma-4-31B-it (raíz) | 31B (aproximado) | No disponible | No disponible en la información | Modelo instruct generalista |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para elegir entre opciones predefinidas; no es un asistente conversacional generalista y su uso fuera de esa tarea puede dar resultados pobres.
- Riesgo de alucinación en la selección de opciones: al basarse en logits del siguiente token, puede elegir una letra que no corresponda a una opción válida si el conjunto de candidatas no se restringe adecuadamente.
- Idiomas: los subconjuntos multilingües se excluyeron del entrenamiento, por lo que el soporte multilingüe es limitado o inexistente.
- Sesgos: no se documentan sesgos específicos, pero la mezcla de entrenamiento excluye fuentes no comerciales y etiquetas de OpenAI/Anthropic, lo que puede introducir sesgos de selección en los dominios cubiertos.
- Licencia Apache-2.0 permite uso comercial, pero los datos CC-BY-4.0 requieren atribución a sus autores; hay que revisar MODIFICATIONS.md y TRAINING_SOURCES.tsv del repositorio.
- El modelo se distribuye sin código personalizado, por lo que la lógica de restricción de opciones y de selección de la letra debe implementarla el usuario.
- No hay información sobre longitud de contexto, lo que dificulta planificar despliegues con entradas largas.
- El número de descargas (13) y de likes (0) sugiere poca validación comunitaria; conviene evaluar su comportamiento en el dominio propio antes de usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/CharlieBT/gx31-decider
- Modelo base: https://huggingface.co/tattrongvu/Jeffan-31b-1710
- Modelo raíz: https://huggingface.co/google/gemma-4-31B-it
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset procedural: https://huggingface.co/datasets/tasksource/procedural-typed-decisions
- Dataset When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Modelo mammoth-1: https://huggingface.co/baselabs/mammoth-1
