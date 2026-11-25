# scholzmx/sepalith-2b-nes

## Resumen

Sepalith 2B NES es un modelo de lenguaje de 2.516.756.480 parámetros (aproximadamente 2,5B) especializado en sugerencia de próximas ediciones (*next-edit-suggestion*) para el lenguaje R. Lo desarrolla el autor independiente scholzmx como proyecto personal y está pensado para integrarse en Sepalith, una extensión de VS Code y Positron que ofrece sugerencias de código en forma de texto fantasma o previsualización de diferencias. Su función no es conversacional: recibe el código que rodea al cursor y devuelve la región reescrita completa o una marca explícita de que no hace falta edición.

El modelo parte de openbmb/MiniCPM5-2B-Midtrain, sobre el que se aplicó un preentrenamiento continuado con unos 472M tokens de código R con licencias permisivas, seguido de un ajuste supervisado sobre ejemplos de edición construidos a partir de paquetes de CRAN y dos rondas de GRPO con recompensa de ejecución (la edición propuesta se ejecuta contra los tests de la función en R). Esta versión publicada es el checkpoint 100 de la segunda ronda de GRPO.

Su relevancia práctica está en el despliegue local: con cuantizaciones GGUF de 1,66 GB y 2,20 GB funciona en CPU de portátil o iGPU mediante llama.cpp, sin depender de servicios en la nube. La arquitectura es un transformer denso tipo `LlamaForCausalLM` de 42 capas y dimensión oculta 2048, con un vocabulario de 130.560 tokens, licencia Apache 2.0 y un formato de prompt propio y estricto que debe respetarse byte a byte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, `LlamaForCausalLM` (42 capas, hidden size 2048) |
| Parametros totales | 2.516.756.480 (aprox. 2,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el ejemplo de despliegue usa `-c 8192` en llama.cpp y la decodificación se limita a 1024 tokens nuevos |
| Tipos de cuantizacion | GGUF Q6_K (2,20 GB) y Q4_K_M-mixB (1,66 GB); pesos bf16 en safetensors |
| Idiomas soportados | No disponibles; el modelo está especializado en código R y en el inglés de su prompt fijo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 5,03 GB) y GGUF (Q6_K y Q4_K_M-mixB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de tipo Llama con 42 capas, dimensión oculta 2048 y un vocabulario de 130.560 tokens. No emplea mezcla de expertos ni mecanismos híbridos: es un decoder causal convencional, lo que explica que quepa en CPU con cuantización Q6_K. El pipeline de entrenamiento tiene cuatro etapas documentadas: partida desde MiniCPM5-2B-Midtrain; preentrenamiento continuado sobre unos 472M tokens de código R con licencias permisivas (artefacto intermedio `scholzmx/sepalith-2b-cpt`, paso 11.586); ajuste supervisado de edición con ejemplos derivados de paquetes de CRAN (completar un bloque, reescribir a pipe, renombrar, no-op y otras operaciones); y dos rondas de GRPO con recompensa de ejecución, en las que la edición generada se valida ejecutándola contra los tests de la función en R.

La innovación principal no está en la arquitectura sino en el protocolo de edición. El prompt, identificado como renderizador `zeta2-prm03-v1`, incluye una cabecera de instrucción fija, el nombre de fichero y las líneas previas a la región, cuatro ranuras de contexto que deben estar presentes aunque estén vacías (`selected_references`, `edit_history`, `diagnostics`, `retrieval`), el sufijo tras el marcador `<[fim-suffix]>` y la región a editar entre `<<<<<<< CURRENT` y `=======`, con `<|user_cursor|>` marcando la posición del cursor. La respuesta es la región completa nueva seguida de `>>>>>>> UPDATED`, o `[NO_EDIT]` con la misma línea terminal; un cuerpo vacío significa borrado. Los marcadores son texto plano, no tokens especiales: hay que codificar sin parsear especiales, sin BOS automático, anteponer exactamente un BOS (id 0), decodificar de forma voraz con tope de 1024 tokens y detenerse en los ids 1 o 130073, contando como respuesta terminada solo la parada en el id 1.

## Capacidades

- Sugerencia de próxima edición en R: reescribe la región actual del fichero preservando el espaciado, o responde `[NO_EDIT]` cuando no procede cambio.
- Detección de no-operación: distingue explícitamente entre "no hay que editar" y "borrar la región", algo relevante para no generar diffs espurios.
- Edición guiada por contexto estructurado: consume referencias seleccionadas, historial de ediciones en forma de hunks de diff, diagnósticos y resultados de recuperación.
- Transformaciones idiomáticas de R: reescritura a pipe, renombrado de símbolos, completado de bloques y otras operaciones cubiertas en el ajuste supervisado.
- Inserción en punto vacío: una región vacía actúa como punto de inserción.
- Integración con herramientas: funciona como servidor local de llama.cpp (`llama-server`) consumido por la extensión de VS Code/Positron, con verificación de tamaño y SHA256 del GGUF al primer arranque.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento extendido; no es un modelo de chat ni sigue instrucciones fuera de su formato de prompt.

## Casos de uso

- Asistencia de edición en el editor: la extensión envía el prompt renderizado a un `llama-server` local y muestra la región reescrita como texto fantasma (aceptable con `Tab`) o como previsualización de diff (aplicable con `Alt+Enter`), lo que encaja con el flujo de trabajo de un analista de datos que escribe R en un portátil sin GPU dedicada.
- Refactorización a estilo pipe: dado un bloque anidado con funciones intermedias, el modelo devuelve la versión con `|>` preservando el espaciado original, útil para homogeneizar estilo en bases de código de análisis.
- Renombrado consistente de símbolos dentro de una región: con el historial de ediciones en la ranura `edit_history`, el modelo puede propagar un cambio de nombre en el fragmento seleccionado sin tocar el resto del fichero.
- Completado de bloques a partir de tests: al incluir diagnósticos y referencias seleccionadas, el modelo propone el cuerpo de una función que satisface los tests existentes, aprovechando que el entrenamiento con GRPO usó recompensa de ejecución contra tests reales.
- Supresión de ruido en revisión de código: la respuesta `[NO_EDIT]` permite descartar sugerencias en regiones ya correctas, reduciendo el coste de revisión en pipelines de integración con el editor.
- Despliegue en entornos sin conectividad: con el GGUF Q4_K_M-mixB de 1,66 GB y llama.cpp en CPU, se puede ofrecer asistencia de edición en máquinas aisladas o con políticas que prohíben enviar código a servicios externos.
- Prototipado de asistentes de edición para otros lenguajes: el protocolo de prompt (región delimitada, ranuras de contexto, línea terminal `>>>>>>> UPDATED`) sirve como plantilla de ingeniería para construir asistentes equivalentes en otros dominios, reutilizando el renderizador de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta una validación cualitativa: en 8 contextos de muestra, los ids de tokens del prompt coincidieron exactamente con los del entrenamiento y todas las respuestas se parsearon correctamente; además, el fichero Q6_K superó una "quant gate" contra bf16, sin que se detallen las métricas de esa compuerta.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay cifras publicadas; por tamaño de fichero, el Q4_K_M-mixB ocupa 1,66 GB y el Q6_K 2,20 GB en disco, y los pesos bf16 en safetensors suman 5,03 GB.
- GPU recomendadas: no disponibles en la información proporcionada; el autor valida el caso de uso en CPU de portátil e iGPU.
- Cabe en GPU de consumo: sí, por tamaño de pesos (el Q6_K de 2,20 GB entra en cualquier GPU con 4 GB o más), aunque no se han publicado mediciones específicas.
- Opciones de despliegue: llama.cpp mediante `llama-server` (build b10453, `3cb7ffb1a`, es la probada), con endpoint `/tokenize` para enviar ids exactos y `/completion` para generar; pesos bf16 cargables con transformers; la model card etiqueta el repo con `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no disponibles; solo se indica que la decodificación es voraz con tope de 1024 tokens y que el ejemplo de servidor usa contexto de 8192.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sepalith 2B NES | 2,5B | No especificado (ejemplo con 8192) | Next-edit-suggestion para R, con GRPO y recompensa de ejecución | Apache 2.0 | Hugging Face, GGUF y safetensors; extensión no publicada en el marketplace |
| openbmb/MiniCPM5-2B-Midtrain | No disponible | No disponible | Modelo base generalista del que deriva Sepalith | No disponible en la información | Hugging Face |
| scholzmx/sepalith-2b-cpt | No disponible | No disponible | Checkpoint intermedio tras preentrenamiento continuado en R (paso 11.586) | No disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos de sugerencia de edición para R en la información proporcionada, por lo que no es posible una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Proyecto personal ("hobby project") sin garantías de mantenimiento ni soporte.
- No es un modelo de chat ni sigue instrucciones fuera de su formato de prompt; usarlo en un endpoint de chat produce resultados no válidos.
- El formato de prompt es estricto: las cuatro ranuras de contexto deben estar presentes aunque estén vacías, hay que anteponer un único BOS (id 0) y codificar sin parsear tokens especiales; desviarse del renderizador de referencia degrada la salida.
- Solo cuenta como respuesta terminada la parada en el id 1; una parada en el id 130073 debe tratarse de forma distinta.
- Especialización estrecha en R: no hay datos publicados sobre rendimiento en otros lenguajes, y la model card no declara idiomas soportados.
- Riesgo de alucinación en código: el modelo puede proponer regiones sintácticamente plausibles pero semánticamente incorrectas; la validación con tests es responsabilidad del usuario, aunque el entrenamiento con recompensa de ejecución mitiga parcialmente este riesgo.
- Sesgos: no se documentan sesgos conocidos, pero el corpus de preentrenamiento continuado (472M tokens de código R con licencias permisivas) condiciona el estilo y las convenciones que reproduce.
- La extensión de VS Code/Positron no está publicada en el marketplace y debe compilarse desde el repositorio; Zed no es compatible porque su prompt `zeta2` incorporado usa un formato distinto.
- La cuantización Q4_K_M-mixB tiene una nota específica sobre el comportamiento de no-operación que el autor remite a la model card; conviene revisarla antes de usarla como nivel por defecto.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de MiniCPM5-2B-Midtrain conviene verificar las condiciones de la cadena de modelos base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scholzmx/sepalith-2b-nes
- Modelo base del preentrenamiento continuado: https://huggingface.co/scholzmx/sepalith-2b-cpt
- Modelo de partida: https://huggingface.co/openbmb/MiniCPM5-2B-Midtrain
- Repositorio de Sepalith: https://github.com/sims1253/Sepalith
- Extensión de VS Code: https://github.com/sims1253/Sepalith/tree/main/extensions/vscode-sepalith
- Implementación de referencia del protocolo de prompt (`render_prompt`, `encode_prompt`, `parse_output`): https://github.com/sims1253/Sepalith/blob/main/packages/sepalith/src/sepalith/campaign_protocol.py
