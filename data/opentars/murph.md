# OpenTARS/Murph

## Resumen

Murph es un clasificador de intenciones de peticiones desarrollado por OpenTARS como componente interno de la aplicación openTARS. No es un modelo de lenguaje generativo, sino un clasificador ligero que determina el tipo de tarea de cada petición (visión, código, técnico, acción sobre el sistema, búsqueda web, chat simple o general) para que la aplicación seleccione el modelo y las herramientas adecuadas antes de invocar cualquier LLM. Su función es actuar como enrutador previo de bajo coste.

Técnicamente es una regresión logística softmax sobre características léxicas (piezas de palabra de 2 a 5 letras, palabras y pares de palabras) con pesos TF-IDF. Se ejecuta en Python puro sobre CPU en aproximadamente 0,2 ms por petición, sin GPU, y el modelo completo se distribuye como un único fichero JSON de unos 4 MB. La librería asociada utiliza únicamente la biblioteca estándar de Python.

Su relevancia radica en el patrón de diseño: separar la clasificación de intención del razonamiento del LLM permite ahorrar coste y latencia en pipelines de agentes, derivando peticiones triviales a rutas ligeras y reservando los modelos grandes para tareas que realmente los requieren. Está entrenado sobre 3.034 frases en cinco idiomas, aunque la model card solo declara portugués e inglés como idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística softmax sobre características léxicas (word pieces de 2 a 5 letras, palabras y pares de palabras) con pesos TF-IDF |
| Parametros totales | no disponible (el modelo se almacena como un JSON de ~4 MB de pesos; no se reporta número de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clasificador de peticiones cortas; no procesa secuencias largas) |
| Tipos de cuantizacion | no aplica (pesos en JSON de precisión nativa; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | portugués (pt) e inglés (en) declarados en la model card; el entrenamiento menciona cinco idiomas sin especificar cuáles |
| Licencia | MIT |
| Formato de pesos | JSON (`murph.json`, SHA-256 `f1752425196a67c4baa28de5f6564a8dbccb6d41d12f44a0d0459a888c078f45`) |

## Arquitectura y entrenamiento

Murph no es un transformer ni un modelo neuronal profundo: es un clasificador lineal de tipo regresión logística softmax entrenado sobre un espacio de características léxicas dispersas. Las características incluyen fragmentos de palabra de 2 a 5 letras, palabras completas y pares de palabras, ponderadas con TF-IDF. El modelo produce una distribución de probabilidad sobre siete clases: `visao` (mirar la pantalla), `codigo` (escribir o corregir código), `tecnico` (preguntas técnicas o de sistema), `acao` (ejecutar una acción en el ordenador), `busca` (búsqueda web), `simples` (saludos y chat trivial) y `geral` (resto).

El entrenamiento se realizó sobre 3.034 frases de petición en cinco idiomas, combinando ejemplos del proyecto openTARS con frases generadas por un modelo mayor. Las frases similares a las de evaluación se eliminaron del conjunto de entrenamiento para evitar filtración directa. El fichero del modelo almacena además un umbral de confianza y un mínimo de cobertura, lo que permite a la aplicación aplicar un mecanismo de fallback cuando la petición se aleja de la distribución vista en entrenamiento. La precisión de validación cruzada almacenada en el fichero es del 88,9 %.

## Capacidades

- Clasificación de intención en siete clases discretas (`visao`, `codigo`, `tecnico`, `acao`, `busca`, `simples`, `geral`).
- Salida de una etiqueta de tarea junto con una puntuación de confianza.
- Umbral de confianza y mínimo de cobertura configurables para activar rutas alternativas cuando la petición es atípica.
- Inferencia en CPU en Python puro, sin dependencias externas más allá de la biblioteca estándar.
- Funcionamiento multilingüe limitado a los idiomas del entrenamiento (portugués e inglés declarados).
- No realiza generación de texto, razonamiento, código, matemáticas ni visión; su única función es el enrutamiento.
- No soporta tool calling ni function calling en el sentido de los LLM; su salida es una etiqueta que la aplicación traduce en la selección de herramientas.

## Casos de uso

- Enrutamiento previo en pipelines de agentes: Murph clasifica cada petición entrante en ~0,2 ms y permite derivar tareas triviales (`simples`) a rutas baratas y reservar modelos grandes para `codigo`, `tecnico` o `visao`, reduciendo coste y latencia global.
- Selección de herramientas en asistentes de escritorio: la clase `acao` indica que la petición requiere ejecutar una operación sobre el sistema (abrir un programa, crear una carpeta), lo que permite al orquestador invocar las herramientas de automatización adecuadas.
- Activación condicional de captura de pantalla: la clase `visao` señala que la petición requiere inspeccionar el contenido de la pantalla, evitando capturas innecesarias en el resto de casos por motivos de privacidad y coste.
- Enrutamiento de búsquedas web: la clase `busca` permite derivar consultas a un motor de búsqueda o a un pipeline de recuperación aumentada (RAG) sin pasar por un LLM generativo.
- Filtrado y triaje de peticiones en aplicaciones de chat: la clase `simples` identifica saludos y conversación trivial que pueden resolverse con respuestas predefinidas o modelos pequeños.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU con Python estándar y un fichero de 4 MB, puede integrarse en dispositivos sin GPU, contenedores mínimos o funciones serverless con arranque en frío reducido.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Precisión de validación cruzada | 88,9 % | Almacenada en el fichero del modelo |
| Evaluación openTARS (conjunto multilingüe) | 170 de 175 | Medida el 18 de octubre de 2026; frases vistas durante el desarrollo |
| Evaluación openTARS (check set) | 85 de 86 | Medida el 18 de octubre de 2026; frases vistas durante el desarrollo |
| Latencia de inferencia | ~0,2 ms por petición | CPU, Python puro |

El autor advierte explícitamente que las frases de evaluación se vieron durante el desarrollo, por lo que estos resultados deben tratarse como una comprobación de cordura y no como un benchmark independiente. No se han publicado comparaciones con otros clasificadores de intención en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; 0 MB de VRAM.
- CPU: cualquier CPU capaz de ejecutar Python; la inferencia es de ~0,2 ms por petición en Python puro.
- Memoria RAM: el modelo ocupa un fichero JSON de ~4 MB; el consumo en memoria es del orden de decenas de MB incluyendo el intérprete de Python.
- GPU recomendadas: no aplica; no se necesita GPU.
- Cabe en cualquier dispositivo, incluidos sistemas embebidos y funciones serverless.
- Opciones de despliegue: el propio cargador `tars_murph.py` basado en la biblioteca estándar de Python; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Throughput: no se publica una cifra agregada de peticiones por segundo; dado el coste de ~0,2 ms por petición, el límite práctico vendrá del intérprete de Python y del resto del pipeline.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas con otros clasificadores de intención en la información proporcionada. A continuación se compara únicamente en términos de especificaciones declaradas frente a alternativas genéricas de la misma categoría funcional (clasificación de intención), sin datos de rendimiento comparables:

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Murph (OpenTARS) | Regresión logística softmax con TF-IDF | no disponible (~4 MB en JSON) | no aplica | MIT | CPU, Python estándar, ~0,2 ms por petición |
| Clasificadores basados en transformers (p. ej. fine-tuning de BERT multilingüe) | Transformer encoder | 100-500 M típicamente | 512 tokens típicamente | variable | Requieren GPU o CPU con mayor coste por petición; rendimiento comparativo no disponible |
| Clasificadores de intención en frameworks de NLU (p. ej. Rasa, spaCy) | Pipeline de features + clasificador | variable | no aplica | variable | Ecosistema maduro; rendimiento comparativo no disponible |

No se han publicado resultados de benchmarks comparativos en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo; al entrenarse con frases generadas por un modelo mayor, puede heredar sesgos de distribución de ese corpus.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea cuando la petición se aleja de la distribución de entrenamiento; el umbral de confianza y el mínimo de cobertura mitigan parcialmente este riesgo.
- Cobertura lingüística limitada: la model card declara portugués e inglés, aunque el entrenamiento menciona cinco idiomas sin especificarlos; el rendimiento en idiomas no declarados no está garantizado.
- Peticiones cortas: el modelo funciona mejor con peticiones breves; las peticiones largas o con múltiples tareas mezcladas se asignan a una sola clase (la más probable), sin descomposición.
- Nombres de clase en portugués: las etiquetas (`visao`, `codigo`, `tecnico`, `acao`, `busca`, `simples`, `geral`) están en portugués por herencia del código de la aplicación, lo que puede requerir mapeo en integraciones externas.
- Evaluación no independiente: los resultados reportados se midieron sobre frases vistas durante el desarrollo; no deben citarse como benchmark.
- Licencia MIT: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la librería se declara como `other`; la integración depende del cargador propio `tars_murph.py`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenTARS/Murph
- Proyecto openTARS: https://project-opentars.github.io/OpenTARS/
