# openjev/openjev-GGUF

## Resumen

OpenJev es un modelo abierto de 26.900 millones de parametros (~26,9B) disenado como modelo de decision de una sola pasada para agentes de navegador y de escritorio. En lugar de generar texto libre, recibe un estado, una pregunta y una lista de opciones etiquetadas con letras, y devuelve la letra de la mejor opcion. Este repositorio concreto (`openjev/openjev-GGUF`) contiene las versiones cuantizadas en formato GGUF del modelo base `openjev/openjev`, generadas con llama.cpp para que el modelo quepa en tarjetas de 24 GB, en Macs y en CPU.

El proyecto se presenta como una alternativa independiente y de codigo abierto a TypeSafe Jev, del que no forma parte ni esta afiliado. La relevancia del build GGUF es eminentemente practica: acerca un modelo de ~27B a hardware de consumo y a despliegues sin GPU dedicada, manteniendo una precision muy cercana a la de los pesos de 16 bits de referencia. Las cuantizaciones se construyeron a partir de los pesos merged de 16 bits (revision `5ec9e5fd`) con la build b11147 de llama.cpp.

Este repositorio esta pensado exclusivamente para texto: no incluye torre de vision. Todas las variantes de cuantizacion son Q4_K_M, Q5_K_M, Q6_K y Q8_0, con tamanos de 16,5 GB a 28,6 GB, y solo declaran soporte para ingles. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de decision de una sola pasada; este build GGUF es solo texto, sin torre de vision) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | No aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | No disponible (el ejemplo oficial de ejecucion usa `-c 16384`) |
| Tipos de cuantizacion | Q4_K_M (~4,8 bits), Q5_K_M (~5,7 bits), Q6_K (~6,6 bits), Q8_0 (8,5 bits) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); los pesos de referencia de 16 bits estan en safetensors en el modelo base `openjev/openjev` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (tipo de transformer, atencion, uso de MoE o de capas hibridas), ni el volumen de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO. Lo que si se especifica es el proposito: un modelo de decision de una sola pasada, entrenado para responder a un formato concreto de estado, pregunta y opciones etiquetadas, devolviendo la letra de la opcion seleccionada. Las preguntas de tipo si/no se etiquetan como `[A] yes` y `[B] no` en los prompts de este build.

El proceso de cuantizacion si esta documentado con detalle. Los ficheros GGUF se generaron a partir de los pesos merged de 16 bits (revision `5ec9e5fd`) usando la build b11147 de llama.cpp. El repositorio incluye `SHA256SUMS` y `MANIFEST.json` con todos los hashes y los numeros de validacion. La validacion se midio sobre las mismas 1.789 filas de desarrollo y el mismo etiquetado de opciones que el modelo de 16 bits, con registros por fila en el directorio `validation/`. La precision del modelo de 16 bits en esa referencia es de 83,17 con NLL de 0,4195 y una tasa de volteo (flip) del 4,3%.

## Capacidades

- Toma de decisiones en un unico paso: dado un estado, una pregunta y opciones etiquetadas, devuelve la letra de la mejor opcion.
- Salida probabilistica: mediante `n_probs` en `/completion` de llama.cpp se puede leer la probabilidad de cada token-letra en la primera posicion de salida (top-64 tokens).
- Orientado a agentes de navegador y de escritorio, segun la descripcion del autor.
- Soporte de plantillas de chat con control explicito de modo pensamiento (`chat_template_kwargs: {"enable_thinking": false}`).
- Servicio compatible con la API de OpenAI a traves de `llama-server` (`/v1/chat/completions`).
- Procesamiento solo de texto: este build no incluye torre de vision.
- Idioma: unicamente ingles.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso explicito, vision, audio ni codigo o matematicas.

## Casos de uso

- Automatizacion de agentes de navegador: el modelo recibe el estado de una pagina (por ejemplo, subtotal, envio, boton de pago, campo de cupon) y selecciona la accion correcta entre opciones etiquetadas, como `click_place_order` o `go_back`. Es su caso de uso principal segun el autor.
- Agentes de escritorio con control de acciones: dado un estado de la interfaz y una lista de acciones posibles, devolver una unica letra permite integrar el modelo como politica de decision ligera y rapida.
- Enrutado de decisiones en pipelines de automatizacion: usar la salida de letra para elegir la rama de ejecucion en flujos tipo workflow, con latencia minima al generar solo unos pocos tokens.
- Puntuacion probabilistica de opciones: con `n_probs` sobre `/completion`, se pueden obtener probabilidades por opcion para rankear alternativas o fijar umbrales de confianza en lugar de una eleccion dura.
- Despliegue en hardware de consumo: con la cuantizacion Q4_K_M (16,5 GB) el modelo cabe en tarjetas de 24 GB (RTX 3090 / 4090) y en Macs de 32 GB, lo que permite agentes locales sin depender de la nube.
- Despliegue en CPU o entornos sin GPU: las builds GGUF de llama.cpp permiten ejecutar el modelo en CPU y en Macs, habilitando escenarios de borde o de privacidad donde los datos no salen del equipo.
- Validacion y evaluacion de politicas de decision: las 1.789 filas de desarrollo y el registro por fila del directorio `validation/` permiten reproducir la comparativa de precision y NLL frente al modelo de 16 bits.
- Investigacion sobre alternativas abiertas a API propietarias de decision: el proyecto se posiciona como alternativa abierta a TypeSafe Jev, por lo que sirve para experimentar con flujos de decision tipados (mencionados como Choice, Noul y Score en repos de terceros).

## Benchmarks y rendimiento

Los unicos datos numericos publicados en la informacion disponible son los de validacion de las cuantizaciones frente al modelo de 16 bits, medidos sobre las mismas 1.789 filas de desarrollo:

| Build | Precision | NLL | Flip | Coincide con la respuesta de 16 bits |
|---|---|---|---|---|
| 16-bit (referencia vLLM, mismas filas) | 83,17 | 0,4195 | 4,3% | — |
| Q8_0 (llama.cpp) | 82,56 | 0,4207 | 4,7% | 98,2% |
| Q4_K_M (llama.cpp) | 82,84 | 0,4239 | 4,4% | 96,6% |

Comparacion emparejada frente al modelo de 16 bits en las mismas 1.789 filas: Q4_K_M −0,34 puntos (intervalo del 95%: −1,06 a +0,39), Q8_0 −0,61 puntos (−1,17 a −0,11). El autor indica que ambos quedan dentro de un punto de la referencia, pero que el intervalo sobre 1.789 filas es demasiado amplio para certificar la no inferioridad de 0,5 puntos usada para FP8, que requeriria una ejecucion de 10.000 preguntas. La lectura de estos resultados se hizo a traves de las probabilidades top-64 de `/completion` de llama.cpp, no con el helper de vLLM.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Q4_K_M (~4,8 bits, 16,5 GB): recomendado para tarjetas de 24 GB (RTX 3090 / 4090) y Macs de 32 GB, dejando margen para el contexto.
- Q5_K_M (~5,7 bits, 19,2 GB): tarjetas de 24 GB con contexto corto.
- Q6_K (~6,6 bits, 22,1 GB): sistemas con 32 GB o mas.
- Q8_0 (8,5 bits, 28,6 GB): sistemas con 40 GB o mas; es la variante mas cercana a los pesos de 16 bits.
- Despliegue en CPU y en Mac: todas las builds GGUF estan pensadas tambien para CPU y Mac, ademas de GPU.
- Opciones de despliegue: `llama.cpp` / `llama-server` es la via oficial de este repositorio. El autor menciona tambien builds FP8 y MLX que conservan el readout de produccion exacto, ademas de un helper `openjev-server` orientado a vLLM y MLX (con backend para llama.cpp pendiente).
- Ejemplo oficial de arranque: `llama-server -m OpenJev-Q4_K_M.gguf -ngl 999 -c 16384 -np 2 --port 8080`.
- Nota sobre contexto: el ejemplo usa `-c 16384`; en 24 GB con Q4_K_M hay que reservar espacio para el contexto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OpenJev (este GGUF) | ~26,9B | No disponible | Apache 2.0 | HuggingFace, GGUF para llama.cpp | Modelo de decision de una sola pasada, solo texto, solo ingles |
| TypeSafe Jev | No disponible | No disponible | Propietaria | Producto comercial de TypeSafe | Referencia propietaria a la que OpenJev se presenta como alternativa; OpenJev no esta afiliado a TypeSafe |
| Modelos comparables de ~27B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de benchmarks ni de especificaciones para establecer una comparacion rigurosa |

No se dispone de informacion suficiente en las fuentes proporcionadas para comparar el rendimiento de OpenJev con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- Alcance restringido: el modelo esta disenado para devolver una letra de decision, no para generar texto libre; usarlo fuera de ese formato de prompt puede degradar los resultados.
- Limitacion de idioma: solo declara soporte de ingles.
- Solo texto: este build GGUF no incluye torre de vision, por lo que no puede procesar imagenes.
- Formato de prompt obligatorio: las preguntas de si/no deben etiquetarse como `[A] yes` / `[B] no` en este build.
- Evidencia estadistica limitada: la validacion se hizo sobre 1.789 filas y el propio autor advierte que ese intervalo es demasiado amplio para certificar la no inferioridad de 0,5 puntos, que exigiria 10.000 preguntas.
- Datos de entrenamiento no publicados: no se detalla el dataset, el numero de tokens ni el uso de RLHF/DPO, lo que dificulta evaluar sesgos.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al forzar una respuesta de letra, el modelo puede seleccionar una opcion incorrecta con alta confianza (tasa de volteo del 4,3-4,7% respecto a la referencia).
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que no infringe derechos de terceros, dado que el proyecto se presenta como alternativa a un producto propietario (Jev de TypeSafe). El autor declara explicitamente que no hay afiliacion ni endoso por parte de TypeSafe.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Fechas de creacion y actualizacion (23-24 de septiembre de 2026) inusuales, a tener en cuenta en la trazabilidad del artefacto.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/openjev/openjev-GGUF
- Modelo base en HuggingFace: https://huggingface.co/openjev/openjev
- Helper openjev-server (vLLM y MLX): https://github.com/abhishekgahlot2/openjev-server
- Repositorio de terceros OpenJev: https://github.com/zhangcy122/OpenJev
- Sitio del proyecto (SemIf - Semantic If On-Device, antes OpenJev): https://openjev.com/
- Sitio OpenJEV: https://openjev.sh/
- Copia/derivado en HuggingFace de terceros: https://huggingface.co/AlexWortega/openjev
