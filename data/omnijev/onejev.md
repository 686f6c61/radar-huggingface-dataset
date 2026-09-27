# OmniJev/OneJev

## Resumen

OneJev es una familia de modelos multimodales de decisión ("System One") desarrollada por OmniJev. A diferencia de un modelo generativo convencional, no produce texto libre: recibe un estado (una captura de pantalla, una foto, un vídeo o texto plano) junto con un conjunto de preguntas tipadas y devuelve, en una única pasada forward, una probabilidad calibrada para cada opción de cada pregunta. Los tres tipos de pregunta que soporta son `Noul` (sí/no), `Choice` (elección entre opciones discretas) y `Score` (nivel ordinal esperado).

La familia se publica en cuatro tamanos -0.8B, 4B, 9B y 27B- mas una variante del mayor cuantizada en 8 bits (27B-FP8). Todos comparten el mismo esquema de entrenamiento y se construyen sobre modelos base de la serie Qwen (Qwen3.5 para 0.8B, 4B y 9B; Qwen3.8 para el 27B), lo que sugiere una arquitectura transformer multimodal con codificador visual. El repositorio completo ocupa 116,5 GB, ya que cada carpeta contiene un modelo completo.

Su relevancia practica esta en la latencia y el formato de salida: para una captura de 1280x720 en una H200, el 0.8B responde una pregunta en 31 ms (5,1 ms por pregunta si se hacen diez) y el 27B en 189 ms (32,4 ms por pregunta en lotes de diez). Esto lo situa como un componente de control para agentes GUI, no como un asistente conversacional sujeto a la licencia Apache 2.0 y distribuido en formato safetensors para la libreria `transformers`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 0,8B / 4B / 9B / 27B segun variante |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (variante OneJev-27B-FP8); el resto en safetensors sin cuantizar declarada |
| Idiomas soportados | No disponible (la documentacion existe en ingles, chino simplificado y japones, pero no se declaran idiomas de inferencia) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`); 2,2 GB (0.8B), 10,4 GB (4B), 18,8 GB (9B), 54,7 GB (27B), 30,4 GB (27B-FP8) |

Tabla de variantes publicadas:

| Modelo | Carpeta | Base | Peso en disco |
|---|---|---|---:|
| OneJev-0.8B | `0.8B/` | Qwen3.5-0.8B | 2,2 GB |
| OneJev-4B | `4B/` | Qwen3.5-4B | 10,4 GB |
| OneJev-9B | `9B/` | Qwen3.5-9B | 18,8 GB |
| OneJev-27B | `27B/` | Qwen3.8-27B | 54,7 GB |
| OneJev-27B-FP8 | `27B-FP8/` | OneJev-27B en 8 bits | 30,4 GB |

## Arquitectura y entrenamiento

La model card describe un modelo de decision multimodal que lee el estado una sola vez, incluyendo sus imagenes y fotogramas de video, y responde a todas las preguntas planteadas en esa misma pasada. El modelo habla la API "System One" de TypeSafe, ampliada con soporte de imagen y video, y devuelve directamente probabilidades por opcion en lugar de tokens de texto. No se detallan en la informacion disponible el numero de capas, la dimension oculta, el mecanismo de atencion ni el codificador visual empleado; tampoco se especifica la longitud de contexto ni si se aplicaron fases de RLHF o DPO.

En cuanto a los datos, el autor indica que las cuatro variantes se entrenaron sobre el mismo conjunto de 99.193 preguntas extraidas de ejecuciones reales de agentes, videos e imagenes. La ficha no desglosa la composicion del dataset ni el numero total de tokens. Como referencia de la organizacion (y no necesariamente de OneJev), los resultados de busqueda atribuyen a OmniJev un corpus de aproximadamente 270.000 registros de decision y 1,3 millones de preguntas tipadas procedentes de operacion web y de telefono, episodios de robot (simulados y reales), eventos de video, juegos en tiempo real, gestos, riesgos y sonidos; conviene tratar ese dato como informacion del ecosistema y no como especificacion confirmada de esta ficha.

La innovacion principal es el formato de salida: probabilidades calibradas por opcion en un unico forward pass, en lugar de razonamiento en texto. El autor compara esta aproximacion con un modelo de razonamiento (Qwen3.8-27B thinking) que escribe miles de palabras antes de cada respuesta, mientras que OneJev responde de forma directa.

## Capacidades

- Prediccion de decision tipada: preguntas `Noul` (probabilidad de si), `Choice` (una probabilidad por opcion) y `Score` (nivel esperado sobre una escala ordinal).
- Entrada multimodal conjunta: texto, imagen (captura de pantalla, foto) y video.
- Inferencia en una sola pasada para multiples preguntas sobre el mismo estado, con coste marginal decreciente por pregunta.
- Servicio mediante API compatible con la System One API de TypeSafe, ampliada con medios; el SDK oficial `typesafe-sdk` funciona apuntando `TYPESAFE_BASE_URL` al servidor local.
- Soporte de agentes GUI: las etiquetas del repositorio incluyen `gui-agent`, y los ejemplos de la model card plantean decisiones del tipo "click / escribir / scroll / detener".
- Peticiones solo texto: se tratan como peticiones System One estandar.
- Calibracion declarada de las probabilidades, que permite fijar umbrales y derivar decisiones con nivel de confianza.
- No se declara soporte explicito de tool calling, function calling, modo "thinking", audio ni generacion de texto libre.

## Casos de uso

- Control de agentes GUI de escritorio: con una captura de 1280x720 y preguntas como "que accion toca" o "cuanto falta", el modelo devuelve la distribucion de probabilidad sobre las acciones candidatas y el progreso de la tarea. Su latencia de 31-189 ms en H200 lo hace viable como cabecera de politica en cada paso del bucle del agente.
- Verificacion de finalizacion de tareas: usar una pregunta `Noul` ("la factura ya esta pagada") como condicion de parada de un agente, con umbral calibrado en lugar de una heuristica de texto.
- Automatizacion de movil y escritorio con el SDK de TypeSafe: sustituir asistentes generativos por un endpoint que devuelve decisiones estructuradas, integrable en el pipeline existente cambiando solo la URL base.
- Triaje de eventos en video: clasificar fotogramas o clips con preguntas de eleccion (tipo de evento) y puntuacion (severidad) en herramientas de monitorizacion.
- Control y QA en videojuegos: detectar eventos en pantalla en tiempo real aprovechando el coste de 5,1-32,4 ms por pregunta segun tamano.
- Etiquetado y filtrado de datos de agente: usar el modelo como anotador automatico de decisiones y niveles de progreso sobre registros ya capturados, para construir datasets de supervision.
- Enrutado de bajo coste en sistemas multiagente: como clasificador previo que decide que subagente o herramienta se activa, evitando una llamada a un LLM grande.
- Deteccion de riesgo con escalado a humano: fijar un umbral sobre la probabilidad de `Noul` para eventos peligrosos y derivar los casos dudosos a revision manual.

## Benchmarks y rendimiento

La model card menciona evaluaciones sobre cuatro conjuntos -el conjunto de test propio de OneJev (preguntas del mismo tipo que el entrenamiento no vistas), DecisionBench hard, TypeSafe y MMStar- comparando las cuatro variantes de OneJev con Jev 1.13, Jev-Omni 12B y Qwen3.8-27B en modo thinking. Sin embargo, los valores numericos solo existen como imagenes SVG (`assets/table.svg`, `assets/results.svg`) y no se incluyen como texto en la informacion disponible, por lo que no se reproducen aqui.

| Evaluacion | OneJev 0.8B/4B/9B/27B | Jev 1.13 | Jev-Omni 12B | Qwen3.8-27B thinking |
|---|---|---|---|---|
| Test propio de OneJev | No disponible (solo en SVG) | No disponible | No disponible | No disponible |
| DecisionBench hard | No disponible (solo en SVG) | No disponible | No disponible | No disponible |
| TypeSafe | No disponible (solo en SVG) | No disponible | No disponible | No disponible |
| MMStar | No disponible (solo en SVG) | No disponible | No disponible | No disponible |

Metrica declarada: exactitud en porcentaje. Nota del autor: las puntuaciones de Jev 1.13 son las publicadas por sus creadores y ese modelo solo lee texto. No se han publicado resultados de benchmarks en formato numerico en la informacion disponible.

Latencia declarada en una H200 para una captura de 1280x720:

| Modelo | 1 pregunta | 10 preguntas | Por pregunta (lote de 10) |
|---|---:|---:|---:|
| OneJev-0.8B | 31 ms | 51 ms | 5,1 ms |
| OneJev-4B | 64 ms | 104 ms | 10,4 ms |
| OneJev-9B | 81 ms | 131 ms | 13,1 ms |
| OneJev-27B | 189 ms | 324 ms | 32,4 ms |

## Requisitos de hardware

- VRAM estimada (pesos mas overhead de activaciones y codificador visual, aproximadamente): 0.8B en torno a 3-4 GB; 4B en torno a 11-13 GB; 9B en torno a 20-22 GB; 27B en torno a 56-62 GB; 27B-FP8 en torno a 32-36 GB. Son estimaciones a partir del tamano de los pesos, no cifras publicadas por el autor.
- GPU recomendadas: H200 para las cifras de latencia declaradas; A100 80 GB o H100 para el 27B en precision completa; para el 27B-FP8 es suficiente una GPU de 40 GB (A100 40 GB, L40S). El 9B cabe en una RTX 4090 de 24 GB.
- Consumer GPU: el 0.8B y el 4B caben con holgura en RTX 4090, RTX 4080 o RTX 3090; el 9B cabe en 24 GB con margen ajustado; el 27B en bf16 no cabe en una GPU de consumo y requeriria la variante FP8 (aun por encima de 24 GB) o multi-GPU.
- Despliegue: el repositorio publica la CLI propia `qev serve --model OmniJev/OneJev/<tamano> --port 8000`, instalada con `pip install git+https://github.com/OmniJev/OneJev.git`. Se declaran requisitos de Python 3.10+, PyTorch 2.6+ y Transformers 5+. La etiqueta `endpoints_compatible` sugiere compatibilidad con un endpoint HTTP estandar.
- No se confirma soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible; el formato publicado es safetensors para `transformers` y no se mencionan pesos GGUF.
- Throughput: no se publica ninguna cifra de tokens por segundo ni de peticiones por segundo; solo latencias por peticion y por lote en H200 (ver tabla anterior). El script `benchmarks/latency.py` permite medir la grafica de velocidad en la GPU del usuario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev (familia) | 0,8B / 4B / 9B / 27B | No disponible | Imagen, video y texto | Apache 2.0 | HuggingFace y GitHub de OmniJev |
| Jev 1.13 | No disponible | No disponible | Solo texto | No disponible | Puntuaciones publicadas por sus autores |
| Jev-Omni 12B | 12B | No disponible | Si (segun nombre) | No disponible | No disponible |
| Qwen3.8-27B (thinking) | 27B | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita a los modelos que el propio autor usa como referencia. No hay datos publicos suficientes en la informacion disponible sobre contexto, licencia o disponibilidad de Jev 1.13, Jev-Omni 12B o Qwen3.8-27B, ni sobre modelos de decision comparables de otros fabricantes.

## Limitaciones y advertencias

- Modelo con 0 descargas y 1 "like" en el momento de la consulta: no hay validacion independiente ni evaluaciones de terceros.
- Las cifras de calibracion y de exactitud son declaradas por el autor y solo existen como graficos SVG, sin tabla de numeros verificable.
- Formato de salida restringido a probabilidades sobre preguntas predefinidas: no genera texto libre, por lo que no sirve como asistente conversacional ni para tareas abiertas de generacion.
- Al depender de probabilidades calibradas, un fallo de calibracion traslada directamente el error al umbral de decision; conviene recalibrar con datos propios antes de usarlo en produccion.
- Riesgo de alucinacion inherente a cualquier modelo sobre imagenes o video: una probabilidad alta no implica que la respuesta sea correcta. No se documentan mecanismos de abstención.
- No se declaran idiomas soportados; la documentacion traducida a chino y japones no implica capacidad de inferencia en esos idiomas. Puede haber degradacion en textos no ingleses.
- Longitud de contexto no publicada: se desconoce cuantas imagenes, fotogramas de video o preguntas admite por peticion.
- Dependencia de una herramienta propia (`qev`) para servir el modelo y de la API System One de TypeSafe; la integracion con servidores de inferencia habituales no esta confirmada.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio no incluye, en la informacion disponible, tarjetas de datos ni analisis de sesgos de los 99.193 registros de entrenamiento, que provienen de ejecuciones reales de agentes y podrian arrastrar sesgos de dominio.
- Metadatos anomalos: la fecha de creacion del repositorio figura como 2026-09-27, posterior a la fecha habitual de publicacion, lo que conviene verificar antes de citar el modelo.
- El repositorio pesa 116,5 GB porque contiene las cinco variantes completas; descargar la familia entera es innecesario si solo se usa un tamano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmniJev/OneJev
- Organizacion en HuggingFace: https://huggingface.co/OmniJev
- Repositorio GitHub oficial: https://github.com/OmniJev/OneJev
- Organizacion en GitHub: https://github.com/OmniJev/
- Sitio web del proyecto: https://omnijev.github.io/OneJev/
- Recopilatorio Awesome JEV (System One models and typed decisions): https://omnijev.github.io/awesome-jev/
- Sitio de OmniJev: https://omnijev.net/
- Ejemplos del repositorio: https://github.com/OmniJev/OneJev/tree/main/examples
- Script de latencia: https://github.com/OmniJev/OneJev/tree/main/benchmarks/latency.py
- Repositorio de terceros con material sobre OmniJev: https://github.com/tinnel123666888/OmniJev/
- Carpeta de la variante 0.8B: https://huggingface.co/OmniJev/OneJev/tree/main/0.8B
- Carpeta de la variante 4B: https://huggingface.co/OmniJev/OneJev/tree/main/4B
- Carpeta de la variante 9B: https://huggingface.co/OmniJev/OneJev/tree/main/9B
- Carpeta de la variante 27B: https://huggingface.co/OmniJev/OneJev/tree/main/27B
- Carpeta de la variante 27B-FP8: https://huggingface.co/OmniJev/OneJev/tree/main/27B-FP8
