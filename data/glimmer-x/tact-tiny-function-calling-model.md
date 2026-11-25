# Glimmer-X/TACT-tiny-function-calling-model

## Resumen

TACT (Ternary Action-Calling Transformer) es un modelo de lenguaje encoder-decoder de 7,4 millones de parámetros desarrollado por Glimmer-X, diseñado específicamente para la tarea de function calling en el contexto de control de dispositivos. El modelo recibe una petición en lenguaje natural junto con la lista de funciones disponibles en un dispositivo y devuelve las llamadas a función necesarias para ejecutar la petición. Su peso total en disco es de tan solo 2,39 MB, lo que lo convierte en uno de los modelos de function calling más pequeños publicados hasta la fecha.

La relevancia de TACT radica en su estrategia de compresión extrema: utiliza pesos ternarios de 2 bits por valor en las capas lineales, embeddings de 4 bits compartidos con la capa de salida y activaciones de 8 bits. Según el autor, en pruebas de control de dispositivos supera en precisión a modelos abiertos hasta 700 veces más grandes. Está entrenado exclusivamente en inglés y su alcance se limita a la generación de llamadas a función, sin capacidad conversacional.

El modelo se publica bajo licencia MIT, lo que permite uso comercial sin restricciones significativas, y se distribuye en formato `safetensors` junto con un tokenizador SentencePiece de 4096 tokens. Su tamaño reducido lo hace apto para despliegue en entornos con recursos muy limitados, como microcontroladores o navegadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con pesos compartidos (weight-shared) |
| Parametros totales | 7,4 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos lineales ternarios (2 bits), embeddings 4 bits, activaciones 8 bits |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`tact.safetensors`), tokenizador SentencePiece (`tokenizer.model`), `config.json` |

## Arquitectura y entrenamiento

TACT es un Transformer encoder-decoder con una anchura de 512 y 8 cabezas de atención. La profundidad se logra mediante weight sharing: un único bloque de encoder se aplica 6 veces y un único bloque de decoder se aplica 4 veces. Las capas lineales utilizan pesos ternarios de 2 bits, mientras que la matriz de embeddings (4096 tokens) emplea 4 bits por valor y está compartida con la capa de salida. Las activaciones se cuantizan a 8 bits en la entrada de cada capa lineal. Esta combinación de cuantización agresiva y compartición de pesos es la que permite reducir el modelo a 2,39 MB.

El entrenamiento se realizó en dos fases: un preentrenamiento sobre texto general en inglés y un ajuste fino sobre 373.897 registros de function calling. Estos datos provienen de escenarios de control de dispositivos generados con DeepSeek-V4.1-Flash y de conjuntos públicos como Glaive Function Calling, xLAM function-calling, Home Assistant Requests y Mobile Actions. No se menciona en la información disponible el uso de RLHF o DPO. La lista de funciones se codifica en tiempo de ejecución mediante el método `bind`, lo que permite adaptar el modelo a nuevos dispositivos sin reentrenamiento.

## Capacidades

- Generación de llamadas a función (function calling) a partir de peticiones en lenguaje natural y una lista de funciones proporcionada en tiempo de ejecución.
- Soporte de múltiples llamadas a función en una sola respuesta (por ejemplo, bloquear una puerta y apagar una luz simultáneamente).
- Extracción de argumentos con tipos específicos (strings, enteros, enums) según el esquema JSON de cada función.
- Adaptación a nuevos dispositivos mediante la codificación de la lista de funciones en tiempo de ejecución (`model.bind(functions)`).
- Capacidad limitada al inglés.
- No soporta conversación multi-turno ni generación de texto libre; su salida es exclusivamente estructurada como llamadas a función.
- No se menciona soporte de tool calling genérico, agentes multi-step, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Control de dispositivos domésticos inteligentes: el modelo traduce peticiones como "turn on the kitchen light at 40 percent" en llamadas estructuradas a funciones como `set_light(room="kitchen", state="on", brightness=40)`, integrándose en asistentes de voz o paneles de control.
- Automatización de rutinas en Home Assistant: dado que se entrenó con el conjunto Home Assistant Requests, puede mapear peticiones de usuarios a las acciones disponibles en la API de Home Assistant, facilitando la creación de automatizaciones sin reglas manuales.
- Interfaces de control en aplicaciones móviles: el conjunto Mobile Actions en el entrenamiento sugiere su uso para traducir comandos de usuario en acciones sobre la UI o APIs de una app móvil.
- Despliegue en dispositivos edge con recursos limitados: con 2,39 MB de pesos, puede ejecutarse en microcontroladores, navegadores o entornos sin GPU, lo que permite control por voz local sin depender de la nube.
- Prototipado rápido de asistentes de control: la API `bind` permite codificar una lista de funciones una sola vez y reutilizarla, agilizando la experimentación con distintos conjuntos de acciones.
- Filtrado y enrutamiento de peticiones en pipelines de automatización: el modelo puede clasificar una petición en una o varias llamadas a función concretas, sirviendo como primer paso en un sistema de orquestación de acciones.
- Demos interactivas en el navegador: el espacio de Hugging Face demuestra su viabilidad para ejecutarse íntegramente en el cliente sin backend.

## Benchmarks y rendimiento

Precisión en cuatro conjuntos de prueba de control de dispositivos, en porcentaje. Una petición se considera correcta cuando las llamadas de salida coinciden con las de referencia en nombres y en todos los valores de argumentos.

| Modelo | Held-out | Authored | External-A | External-B | Media |
|---|---|---|---|---|---|
| TACT (media de tres entrenamientos) | 76,5 | 82,8 | 83,1 | 78,9 | 80,3 |
| Estos pesos | 75,1 | 83,3 | 85,4 | 78,9 | 80,7 |

No se han publicado en la información disponible resultados comparativos detallados de los otros nueve modelos abiertos mencionados en la model card; el autor indica que los datos están en el repositorio de código.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos (2,39 MB) más el estado de activaciones; cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU, microcontroladores o en el navegador. Cualquier GPU (incluidas GTX 1050, RTX 3060, RTX 4090, A100, H100) es sobradamente suficiente.
- Cabe en consumer GPU: sí, en todas; también en dispositivos sin GPU.
- Opciones de despliegue: paquete Python propio (`pip install git+https://github.com/Glimmer-X/TACT-tiny-function-calling-model`), demo en Hugging Face Spaces. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (media en device-control) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TACT | 7,4 M | no disponible | 80,7 % | MIT | Hugging Face, GitHub |
| Modelos abiertos de function calling hasta 700 veces mayores | hasta ~5,2 B (según afirmación del autor) | no disponible | inferior a TACT según el autor | variable | variable |

No se dispone en la información proporcionada de los nombres concretos, parámetros exactos ni resultados individuales de los nueve modelos abiertos comparados en la model card. El autor afirma que TACT supera en precisión a modelos hasta 700 veces más grandes en pruebas de control de dispositivos, pero los datos desagregados no están disponibles en esta ficha.

## Limitaciones y advertencias

- Alcance restringido: el modelo solo genera llamadas a función; no mantiene conversaciones ni genera texto libre.
- Idioma: únicamente inglés; no soporta peticiones en castellano ni en otros idiomas.
- Longitud de contexto: no especificada, lo que impide evaluar su comportamiento con listas de funciones muy extensas.
- Riesgo de alucinación: puede generar nombres de función o argumentos no presentes en la lista proporcionada, especialmente con esquemas complejos o peticiones ambiguas.
- Sesgos: al entrenarse con conjuntos de datos específicos (Home Assistant, Mobile Actions, Glaive, xLAM), puede presentar sesgos hacia los dominios y estilos de esos datasets.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al control de dispositivos.
- Madurez: modelo con 0 descargas y 1 like en el momento de la ficha; no hay evidencia de uso en producción ni validación independiente de los resultados.
- Precisión limitada: alrededor del 80 % en las pruebas del autor, lo que implica que aproximadamente una de cada cinco peticiones puede fallar; en producción se recomienda validación y fallback.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Glimmer-X/TACT-tiny-function-calling-model
- Demo en el navegador: https://huggingface.co/spaces/Glimmer-X/TACT-demo
- Paper (Zenodo): https://doi.org/10.5281/zenodo.24529121
- Código en GitHub: https://github.com/Glimmer-X/TACT-tiny-function-calling-model
- Página del proyecto: https://glimmer-x.github.io/TACT-tiny-function-calling-model/
