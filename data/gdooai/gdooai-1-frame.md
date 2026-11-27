# GdooAI/GdooAI-1-Frame

## Resumen

GdooAI-1-Frame es un artefacto publicado en Hugging Face por el usuario GdooAI que, segun su model card, no consiste en un modelo de pesos neuronales al uso, sino en un servidor API autonomo de un solo archivo implementado con FastAPI. El paquete emula la interfaz de Google Gemini API e incluye, segun el autor, un "motor de IA local integrado" que no requiere claves de API externas. Se distribuye como un Space de tipo Docker con `app_port` 7860 y ofrece endpoints de salud, listado de modelos, generacion de contenido, streaming por SSE y un endpoint compatible con OpenAI.

La relevancia de esta ficha es limitada desde el punto de vista tecnico: la model card no publica arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni resultados de benchmarks. La informacion disponible describe exclusivamente la capa de servicio (endpoints HTTP, limites de uso y despliegue) y no las caracteristicas del supuesto motor de inferencia subyacente. Cualquier evaluacion de capacidades reales del modelo queda, por tanto, pendiente de verificacion independiente.

El artefacto se creo el 27 de noviembre de 2026 y, en el momento de redactar esta ficha, registra 0 descargas y 0 likes, sin licencia declarada ni idiomas soportados explicitos. El identificador de modelo expuesto en los ejemplos (`gdooai-1_frame-pro`) sugiere una variante "pro" del motor, pero no se documenta en que se diferencia de otras variantes ni que pesos la componen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo describe un servidor FastAPI; no se especifica la arquitectura del motor de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los ejemplos de la model card estan en ruso) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el artefacto se distribuye como codigo Python y Dockerfile, no como pesos) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del motor de IA integrado. La model card unicamente documenta la capa de servicio: un unico archivo `main.py` sobre FastAPI, con soporte de Server-Sent Events (SSE) para streaming, un endpoint OpenAI-compatible en `/v1/chat/completions` y una superficie de API inspirada en Google Gemini (`/v1/models/{model}:generateContent` y `:streamGenerateContent`). El despliegue previsto es un contenedor Docker escuchando en el puerto 7860, con opcion de ejecucion local via `python main.py` o `docker compose up --build -d`.

No se publican datos sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se describe ninguna innovacion tecnica de inferencia (decodificacion especulativa, atencion lineal, mezcla de expertos, etc.). El autor afirma que el motor es "local" y que no requiere `API_KEY` externa, pero no detalla si se trata de un modelo preentrenado empaquetado, de un modelo descargado en tiempo de ejecucion o de otra solucion.

## Capacidades

- Generacion de texto a traves de los endpoints `:generateContent` y `/v1/chat/completions`, segun la interfaz documentada.
- Streaming de respuestas mediante SSE en `:streamGenerateContent`.
- Compatibilidad con el esquema de chat de OpenAI (`messages` con roles `user`/`assistant`), lo que permite conectar clientes que ya hablan ese protocolo.
- Emulacion de la API de Google Gemini en la forma de las rutas y en el formato `contents`/`parts`.
- Endpoint de salud (`GET /health`) y listado de modelos (`GET /v1/models`).
- Limites de uso integrados: 80 mensajes por dia y 60 peticiones por minuto por IP.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo "thinking". Cualquier capacidad de este tipo debe considerarse no disponible hasta verificacion.

## Casos de uso

- Despliegue de un endpoint de chat autoalojado en un Space de Hugging Face: el paquete Docker arranca en el puerto 7860 y expone `/v1/chat/completions`, lo que permite conectar clientes compatibles con OpenAI sin escribir codigo de servidor.
- Prototipado rapido de interfaces de chat: el streaming por SSE en `:streamGenerateContent` facilita la integracion con frontends que consumen eventos incrementales.
- Pruebas de integracion de clientes Gemini: al replicar las rutas `:generateContent`, se puede validar el comportamiento de un cliente antes de apuntarlo a la API real de Google.
- Entornos de demostracion con cuota controlada: el limite de 80 mensajes diarios y 60 peticiones por minuto por IP acota el consumo en demos publicas o pruebas con usuarios externos.
- Evaluacion de la viabilidad de un motor de IA "sin API key": util para equipos que quieren comprobar si un servicio autoalojado cubre sus necesidades antes de invertir en infraestructura propia.
- Integracion en pipelines internos que ya usan el formato OpenAI: el endpoint `/v1/chat/completions` permite sustituir el proveedor sin reescribir la capa de cliente, siempre que el rendimiento del motor integrado sea suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica tamano del modelo ni cuantizacion).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue documentadas: ejecucion local con `pip install -r requirements.txt` y `python main.py`; contenedor Docker via `docker compose up --build -d`; Space de Hugging Face de tipo Docker en el puerto 7860.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo de artefacto | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GdooAI-1-Frame | Servidor FastAPI con motor de IA integrado (segun el autor) | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| Google Gemini API | API comercial alojada | no disponible publicamente | no disponible en la ficha | propietaria | API de pago |
| Servidores OpenAI-compatibles autoalojados (p. ej. vLLM, Ollama) | Servidor de inferencia sobre pesos abiertos | depende del modelo servido | depende del modelo servido | depende del modelo servido | codigo abierto |

La comparacion es estructural: GdooAI-1-Frame se posiciona como una alternativa autoalojada y sin clave de API a interfaces tipo Gemini/OpenAI, pero al no publicar pesos, arquitectura ni benchmarks no es posible contrastar su calidad frente a modelos concretos de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de informacion sobre el modelo subyacente: no se declaran parametros, arquitectura, contexto, datos de entrenamiento ni evaluaciones, lo que impide estimar su calidad o adecuacion a tareas concretas.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Cualquier despliegue en produccion requiere aclarar este punto con el autor.
- Idiomas no declarados: los ejemplos de la model card estan en ruso, pero no se especifica si el motor soporta castellano u otros idiomas con calidad suficiente.
- Riesgo de alucinacion y sesgos: no evaluable al no existir benchmarks ni model card tecnica del motor.
- Limites de uso integrados (80 mensajes diarios y 60 peticiones por minuto por IP) que pueden resultar insuficientes en produccion.
- Cero adopcion registrada (0 descargas, 0 likes) y creacion reciente: no hay evidencia externa de funcionamiento ni de mantenimiento.
- El nombre del artefacto ("Frame") y la variante `gdooai-1_frame-pro` sugieren una familia de modelos, pero no se documenta la relacion entre variantes.
- No se especifica el origen del "motor de IA local": conviene verificar si descarga pesos de terceros en tiempo de ejecucion, lo que afectaria a la licencia y a los requisitos de red.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GdooAI/GdooAI-1-Frame
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este artefacto.
