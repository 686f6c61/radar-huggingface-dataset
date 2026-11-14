# Sergey321-345/XENON-MICRO-FRICTION

## Resumen

XENON-MICRO-FRICTION es una red neuronal experimental de análisis de interacción web desarrollada por XenLogic (publicada por el usuario Sergey321-345 en Hugging Face). No es un modelo de lenguaje: es un clasificador de secuencias de eventos de navegador que predice si una interacción web transcurre con normalidad, genera confusión en el usuario o queda bloqueada. Su función es etiquetar trazas de eventos (apertura de página, clics, errores HTTP, errores JavaScript, reintentos) en tres clases: `NORMAL`, `CONFUSION` y `BLOCKED`.

Técnicamente es un modelo pequeño y ligero: 1.500.227 parámetros, arquitectura de GRU bidireccional de dos capas con una capa de embedding de eventos y una cabeza de clasificación, implementado en PyTorch y distribuido en formato safetensors. La versión actual es la v0.5, entrenada con 100.000 escenarios sintéticos y validada con 10.000, sobre un vocabulario de entrada de 18 tipos de eventos de navegador.

Su relevancia es acotada pero específica: cubre el nicho del análisis automatizado de fricción en UX y de detección de bloqueos en flujos web, un problema que normalmente se aborda con heurísticas o analítica de producto. Es un modelo de investigación con descargas nulas en el momento de la consulta y con advertencias explícitas del autor sobre la brecha entre su precisión en validación sintética y el rendimiento real en sitios web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU bidireccional de dos capas con capa de embedding de eventos y cabeza de clasificación (PyTorch) |
| Parametros totales | 1.500.227 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (secuencias de eventos de navegador; longitud máxima no documentada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural, sino tipos de evento) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |
| Version | v0.5 (v0.4 disponible en subcarpeta) |
| Vocabulario de entrada | 18 tipos de eventos de navegador |
| Clases de salida | `NORMAL`, `CONFUSION`, `BLOCKED` |
| Framework | PyTorch (definición de modelo personalizada, no incluida como librería estándar) |

## Arquitectura y entrenamiento

El modelo es una red neuronal recurrente personalizada, no un transformer ni un LLM preentrenado. La entrada son secuencias de eventos de navegador (por ejemplo `OPEN_PAGE -> HTTP_ERROR -> RETRY -> SUCCESS`), que pasan por una capa de embedding de eventos, una GRU bidireccional de dos capas y una cabeza de clasificación que produce una de las tres etiquetas. El autor indica explícitamente que se requiere una definición de modelo PyTorch personalizada y coincidente para cargar los pesos, lo que implica que no se puede cargar con `AutoModelForSequenceClassification` de transformers sin el código del autor.

El entrenamiento se realizó íntegramente sobre datos sintéticos: 100.000 escenarios de entrenamiento y 10.000 de validación en la versión v0.5, frente a los 50.000 y 699.059 parámetros de la v0.4. No se documentan en la información disponible el número de tokens, la composición detallada del dataset, ni si hubo RLHF, DPO o cualquier técnica de alineación (poco aplicable a un clasificador de este tipo). Tampoco se describe ninguna innovación técnica destacable más allá del propio diseño de embedding de eventos y GRU bidireccional.

## Capacidades

- Clasificación de secuencias de eventos de navegador en tres clases: `NORMAL`, `CONFUSION` y `BLOCKED`.
- Procesamiento de trazas compuestas por 18 tipos de eventos (apertura de página, clic, error HTTP, error JavaScript, reintento, acción sin efecto, fallo, éxito, entre otros).
- Detección de patrones de fricción en flujos de interacción web, como clics sin efecto o reintentos tras errores.
- Análisis de secuencias de longitud variable mediante la GRU bidireccional.
- No soporta tool calling ni function calling: no es un modelo generativo.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües: opera sobre un vocabulario cerrado de tipos de evento, no sobre texto libre.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Analítica de fricción en UX: integrado en un pipeline que recoja eventos con Playwright u otra herramienta de automatización, el modelo etiqueta sesiones de usuario y permite cuantificar qué porcentaje de flujos cae en `CONFUSION` o `BLOCKED` para priorizar rediseños.
- Monitorización de formularios y checkouts: las secuencias con `ACTION_NO_EFFECT` o reintentos repetidos se clasifican como fricción, lo que permite alertar sobre pasos del embudo que fallan silenciosamente.
- Testing de regresión de interfaces: en CI/CD, tras cada despliegue se ejecutan flujos automatizados y el modelo clasifica las trazas resultantes, detectando degradaciones de interacción que los tests funcionales clásicos no capturan.
- Detección de bloqueos por errores técnicos: secuencias con `HTTP_ERROR` o `JS_ERROR` seguidas de fallo se marcan como `BLOCKED`, útil para correlacionar incidencias de frontend con quejas de usuario.
- Investigación en HCI y análisis de comportamiento: el modelo sirve como baseline reproducible para experimentos sobre modelado de fricción con datos sintéticos antes de pasar a datos reales.
- Prototipado de sistemas de soporte proactivo: clasificar en tiempo real una sesión como `CONFUSION` podría disparar la sugerencia de ayuda contextual o la apertura de un chat de soporte.
- Generación de datasets etiquetados: al ser un clasificador ligero (1,5 M de parámetros), puede ejecutarse a gran escala para preetiquetar trazas de eventos antes de una revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona una precisión de validación alta sobre datos sintéticos, sin cifras concretas, y advierte explícitamente de que esa precisión no establece el rendimiento en sitios web reales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 para los 1,5 M de parámetros; cabe holgadamente en cualquier GPU, incluida una iGPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU sin problema. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: al ser un modelo PyTorch personalizado con definición propia, no es compatible directamente con vLLM, TGI, llama.cpp ni Ollama; requiere cargar los pesos con el código del autor en PyTorch (o exportarlo a TorchScript/ONNX manualmente).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un coste de inferencia muy bajo, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de clasificación de secuencias de eventos de navegador con estas características; los clasificadores de texto genéricos (por ejemplo, basados en transformers pequeños) no operan sobre el mismo tipo de entrada ni resuelven la misma tarea.

## Limitaciones y advertencias

- Entrenado principalmente con secuencias sintéticas: la alta precisión en validación sintética no garantiza rendimiento en sitios web reales, tal como advierte el propio autor.
- El modelo no navega por sí mismo: requiere una herramienta externa como Playwright para recoger los eventos de navegador.
- Las probabilidades predichas no están calibradas, por lo que no deben interpretarse como niveles de confianza fiables sin post-procesado.
- Requiere una definición de modelo PyTorch personalizada y coincidente para cargar los pesos; no es plug-and-play con las librerías estándar.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas no disponibles: al operar sobre un vocabulario cerrado de 18 tipos de evento, no es extensible a otros dominios sin reentrenamiento.
- Riesgo de sesgo derivado de la distribución de los escenarios sintéticos generados por el autor, que puede no reflejar la diversidad de interacciones reales.
- Modelo experimental con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.
- Riesgo de clasificación errónea en secuencias con eventos fuera del vocabulario de 18 tipos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sergey321-345/XENON-MICRO-FRICTION
- Repositorio de la versión anterior (v0.4) y datasets: disponible en la subcarpeta `v0.4/` y `v0.5/` del propio repositorio de Hugging Face
- No se han encontrado en la información disponible papers, blogs, repositorios de código ni demos adicionales.
