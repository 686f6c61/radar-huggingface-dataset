# OmniJev/OneJev-4B

## Resumen

OneJev-4B es un modelo multimodal de decisión desarrollado por el equipo OmniJev. Se define como un "System One decision model": recibe una captura de pantalla, una fotografía, un vídeo o texto plano junto con una o varias preguntas y devuelve, en una única pasada forward, una probabilidad calibrada para cada opción de respuesta. No es un modelo generativo conversacional al uso, sino un módulo de decisión y verificación pensado para incrustarse dentro de agentes.

Técnicamente es un fine-tune completo del modelo base Qwen/Qwen3.5-4B sobre 99.193 preguntas extraídas de ejecuciones reales de agentes, vídeos e imágenes. El repositorio declara 5.174.964.736 parámetros totales en safetensors y ocupa 10,4 GB. La model card publica resultados en forma de imagen (frente a Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking) y cifras de latencia medidas en una H200: 64 ms por pregunta con una captura de 1280x720, y 10,4 ms por pregunta cuando se agrupan diez preguntas en una sola petición.

Su interés actual está en que ataca un problema concreto de los pipelines de agentes multimodales: sustituir la generación de texto libre por probabilidades calibradas por opción, lo que permite aplicar umbrales de confianza, verificar si una tarea se ha completado y decidir la siguiente acción (por ejemplo, hacer clic o detenerse) en un solo forward pass. La licencia Apache 2.0 y la disponibilidad de variantes de 0,8B, 9B y 27B facilitan su despliegue en distintas escalas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; heredada del modelo base Qwen/Qwen3.5-4B, del que es un fine-tune completo |
| Parametros totales | 5.174.964.736 (segun los safetensors del repositorio) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para este tamano; la familia OneJev incluye una variante FP8 (8 bits) para el tamano 27B |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 10,4 GB |
| Modalidades de entrada | imagen, video y texto |
| Tipo de salida | probabilidad calibrada por opcion, en una unica pasada forward |
| Modelo base | Qwen/Qwen3.5-4B |
| Fecha de publicacion | 27 de septiembre de 2026 (segun HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (tipo de atencion, si hay componentes de mezcla de expertos o si se anaden cabezales especificos). Lo que si se declara es que OneJev-4B es un fine-tune completo de Qwen/Qwen3.5-4B, es decir, no un adaptador, y que el entrenamiento se realizo sobre 99.193 preguntas procedentes de ejecuciones reales de agentes, videos e imagenes. El modelo conserva la torre multimodal del base para procesar imagenes y video.

La innovacion destacable no esta en el backbone, sino en la interfaz de salida: en lugar de generar texto autoregresivamente, el modelo emite en una sola pasada forward una distribucion de probabilidad calibrada sobre las opciones definidas por el usuario (tipos `Noul`, para verificaciones booleanas, y `Choice`, para decisiones entre alternativas). Esto permite plantear varias preguntas en una misma peticion y reutilizar el mismo estado multimodal. No se ha publicado informacion sobre uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre la composicion detallada del dataset de entrenamiento.

## Capacidades

- Entrada multimodal: capturas de pantalla, fotografias, video y texto plano.
- Decision calibrada: devuelve una probabilidad por cada opcion definida, no texto libre.
- Verificacion booleana de estado mediante el tipo `Noul` (por ejemplo, "la factura ha sido pagada").
- Eleccion entre alternativas mediante el tipo `Choice` (por ejemplo, "clic" frente a "detener").
- Multiples preguntas por peticion, resueltas en la misma pasada forward.
- Orientacion a agentes GUI: identificacion de la siguiente accion sobre una captura de pantalla.
- Comprension de video como estado de entrada para tareas de decision secuencial.
- Servidor compatible con TypeSafe's System One API, con un campo `media` adicional para imagenes y video.
- Cliente Python oficial (`qev`) con soporte de URI de datos para medios.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, audio o tool calling generativo: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes GUI que operan sobre escritorio o web: dada una captura de pantalla y el objetivo de la tarea, el modelo devuelve la probabilidad de que la accion correcta sea hacer clic en un elemento o detenerse, lo que permite al bucle del agente decidir sin parsear texto generado.
- Verificacion de finalizacion de tareas: usando `Noul`, un orquestador puede comprobar si una subtarea se ha completado antes de avanzar al siguiente paso, reduciendo bucles infinitos y acciones redundantes.
- Enrutado y triaje en pipelines de automatizacion: el modelo puntua alternativas (por ejemplo, asignar una incidencia a un equipo u otro) y el sistema aplica un umbral de confianza para escalar a revision humana cuando la probabilidad es baja.
- Baterias de comprobaciones sobre una misma pantalla: al resolver diez preguntas en 104 ms sobre una H200, encaja en pipelines que necesitan evaluar simultaneamente varios predicados de estado por fotograma.
- Analisis de video para agentes: alimentar fotogramas o clips junto con preguntas de decision para tareas de seguimiento de progreso, control de calidad visual o deteccion de estados anomalos.
- Modulo de recompensa o critico en RL de agentes: las probabilidades calibradas pueden usarse como senal de valor para puntuar trayectorias de agente durante el entrenamiento o la evaluacion.
- Automatizacion de QA visual sobre interfaces: comprobar si un elemento esperado aparece en pantalla tras un despliegue, integrandolo en un pipeline de CI/CD que ejecuta el modelo contra capturas generadas por pruebas end-to-end.
- Asistencia a operadores humanos: presentar las probabilidades por opcion como sugerencia priorizada, dejando la confirmacion final a la persona.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye una tabla de accuracy en formato de imagen, que compara OneJev-4B con Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking sobre un conjunto de test de OneJev con preguntas de los mismos tipos que el entrenamiento pero que ningun modelo vio durante el entrenamiento; los valores numericos no estan disponibles en el texto extraido. Se indica ademas que las puntuaciones de Jev 1.13 son las publicadas por sus autores y que ese modelo solo procesa texto.

Los unicos datos de rendimiento numericos disponibles son de latencia, medidos en una unica GPU H200 con una captura de 1280x720:

| Escenario | Tiempo |
|---|---|
| 1 pregunta por peticion | 64 ms |
| 10 preguntas en una peticion | 104 ms (10,4 ms por pregunta) |

## Requisitos de hardware

- Pesos en precision completa: 10,4 GB de repositorio, lo que marca el suelo de memoria para cargar el modelo sin cuantizar.
- VRAM estimada para inferencia en precision completa: del orden de 12 a 16 GB contando pesos, torre de vision y activaciones; es una estimacion derivada del tamano de los pesos, no un dato publicado.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 16 GB o mas (RTX 4090, RTX 5080 y similares) si se usa la precision completa con cuidado de la longitud de contexto; no confirmado por el autor.
- GPU de datacenter: la referencia publicada es una H200 para las mediciones de latencia. A100 y H100 son opciones razonables por memoria, aunque no hay cifras publicadas para ellas.
- Despliegue oficial: servidor propio del proyecto mediante `qev serve --model OmniJev/OneJev-4B`, que expone TypeSafe's System One API mas un campo `media`.
- Despliegue con transformers: el modelo se publica con `library_name: transformers` y pesos safetensors, por lo que es cargable con la libreria estandar.
- vLLM, TGI, llama.cpp u Ollama: no confirmados en la informacion disponible; el formato GGUF no aparece entre los pesos publicados.
- Throughput: 10 preguntas por peticion a 10,4 ms por pregunta en H200 es el unico dato disponible; no hay cifras de tokens por segundo porque la salida no es texto generado.

## Comparativa con modelos similares

La comparativa mas directa es dentro de la propia familia OneJev, ya que comparte tarea, licencia e interfaz. Los parametros de los otros tamanos no estan disponibles.

| Modelo | Base | Pesos | Licencia | Notas |
|---|---|---|---|---|
| OneJev-0.8B | Qwen3.5-0.8B | 2,2 GB | Apache 2.0 | Variante mas ligera de la familia |
| OneJev-4B | Qwen3.5-4B | 10,4 GB | Apache 2.0 | 5.174.964.736 parametros reales |
| OneJev-9B | Qwen3.5-9B | 18,8 GB | Apache 2.0 | Tamano intermedio |
| OneJev-27B | Qwen3.8-27B | 54,7 GB | Apache 2.0 | Tamano mayor de la familia |
| OneJev-27B-FP8 | OneJev-27B en 8 bits | 30,4 GB | Apache 2.0 | Cuantizacion FP8 del 27B |
| Qwen/Qwen3.5-4B | - | no disponible | no disponible | Modelo base generativo, no un modelo de decision |

Frente a modelos de decision alternativos, la model card menciona Jev 1.13 (solo texto) y Jev-Omni 12B, pero no se dispone de sus especificaciones ni de los valores numericos de la comparacion.

## Limitaciones y advertencias

- Modelo recien publicado, con 0 descargas y 0 "likes" en el momento de la consulta: no hay validacion independiente de sus resultados.
- Los numeros de accuracy solo existen como imagen en la model card; no se pueden verificar a partir del texto disponible ni se detalla la composicion exacta del conjunto de test.
- El modelo no genera texto: devuelve probabilidades sobre opciones predefinidas, por lo que no sirve para tareas de respuesta abierta.
- Riesgo de calibracion deficiente fuera de la distribucion de entrenamiento: las probabilidades pueden ser optimistas ante pantallas, idiomas o dominios no representados en las 99.193 preguntas de entrenamiento.
- No se especifican los idiomas soportados; el rendimiento fuera del ingles (o de los idiomas presentes en el dataset) es desconocido.
- No se publica la longitud de contexto, lo que dificulta planificar tareas con historiales largos o videos extensos.
- Dependencia de una API propia (TypeSafe's System One mas el campo `media`), lo que ata la integracion al cliente `qev` oficial salvo que se implemente el protocolo a mano.
- Licencia Apache 2.0, favorable para uso comercial, pero conviene revisar los terminos del modelo base Qwen/Qwen3.5-4B por si imponen condiciones adicionales.
- Al tratarse de un fine-tune completo, no se puede combinar con otros adaptadores del ecosistema Qwen3.5-4B.
- En produccion conviene definir umbrales de confianza y una ruta de escalado a revision humana, dado que el modelo expresa incertidumbre de forma probabilistica y no mediante abstención explicita.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmniJev/OneJev-4B
- Coleccion OneJev: https://huggingface.co/collections/OmniJev/onejev
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Sitio web del proyecto: https://omnijev.github.io/OneJev/
- Licencia Apache 2.0 del proyecto: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante OneJev-0.8B: https://huggingface.co/OmniJev/OneJev-0.8B
- Variante OneJev-9B: https://huggingface.co/OmniJev/OneJev-9B
- Variante OneJev-27B: https://huggingface.co/OmniJev/OneJev-27B
- Variante OneJev-27B-FP8: https://huggingface.co/OmniJev/OneJev-27B-FP8
