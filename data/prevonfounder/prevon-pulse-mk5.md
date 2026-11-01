# PrevonFounder/prevon-pulse-mk5

## Resumen

Prevon Pulse MK5 es un ajuste fino (fine-tune) completo del modelo google/functiongemma-270m-it, desarrollado por PrevonFounder para su aplicacion de notas Prevon. Se trata de un modelo de 268 millones de parametros especializado en function calling en dispositivo (on-device): su tarea es seleccionar la accion de aplicacion adecuada entre un menu de herramientas y rellenar sus argumentos, o bien responder con `NoMatchingAction` cuando ninguna herramienta encaja. El modelo se distribuye con pesos en formato safetensors (bf16), un archivo LiteRT-LM para movil y escritorio, y un GGUF Q8_0 para llama.cpp.

Su relevancia radica en el enfoque: un modelo diminuto (270M) capaz de ejecutarse localmente en Android, iOS, Mac y Windows mediante LiteRT-LM, sin depender de la nube. La model card documenta un proceso de entrenamiento reproducible (183.302 filas, 79 herramientas, 2 epocas) y una evaluacion con el motor real LiteRT-LM en CPU, con resultados end-to-end de entre el 89,3 % y el 96,3 % en distintos conjuntos de prueba. Es un caso practico de destilacion de capacidades de function calling hacia un modelo lo bastante pequeno para caber en dispositivos de consumo.

El modelo se apoya en FunctionGemma, distribuido bajo los terminos de uso de Gemma, y esta pensado exclusivamente para el ecosistema de la aplicacion Prevon: no es un modelo de proposito general, sino un componente de enrutamiento de acciones con un contrato de herramientas muy concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de FunctionGemma 270M); detalles internos no disponibles |
| Parametros totales | 268.098.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (safetensors), Q8_0 (GGUF), LiteRT-LM (formato propio del runtime) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (bf16), GGUF, .litertlm |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (no LoRA) de google/functiongemma-270m-it, un transformer decoder-only de 270M parametros. El entrenamiento uso 183.302 filas que cubren 79 herramientas, durante 2 epocas, con una tasa de aprendizaje de 3e-5, 32 filas por paso y calculo de perdida unicamente sobre los tokens de respuesta (loss on the answer tokens only). El entrenamiento se ejecuto en chips Tenstorrent Blackhole.

Los pesos publicados son la media de tres ejecuciones independientes (semillas 1, 2 y 3) de una misma receta que comparten modelo de partida; se trata de un promedio de pesos (weight averaging), no de entrenamiento adicional. El autor documenta en la carpeta `training/` los ajustes de ejecucion, el hash de los datos y las curvas de perdida, lo que facilita la reproducibilidad. La innovacion tecnica principal no esta en la arquitectura sino en el diseno de la tarea: el modelo aprende a leer un menu de herramientas renombradas, enmascaradas y barajadas, a rechazar peticiones que no encajan y a detenerse tras una unica llamada.

## Capacidades

- Seleccion de herramienta (tool selection) a partir de un menu de herramientas proporcionado en el prompt, incluyendo herramientas renombradas, enmascaradas y reordenadas.
- Relleno de argumentos (argument filling) para cada herramienta, con valores concretos extraidos de la peticion del usuario.
- Rechazo explicito mediante `NoMatchingAction` cuando ninguna herramienta del menu satisface la peticion.
- Detencion autonoma tras una unica llamada a herramienta (no encadena llamadas).
- Function calling orientado a aplicacion de notas: recordatorios, alarmas, ajustes, sugerencias, listas de verificacion, calendario, gestion de archivos, iconos y colores de carpetas y notas, estadisticas de escritura.
- Ejecucion en dispositivo mediante LiteRT-LM (Android, iOS, Apple Silicon Mac, Windows) y llama.cpp (GGUF, Intel Mac).
- No se documentan capacidades de vision, audio, razonamiento general ni generacion de texto libre; el modelo esta especializado en enrutamiento de acciones.

## Casos de uso

- Asistente de voz o texto dentro de la app Prevon: el modelo recibe la peticion del usuario y el menu de herramientas activas, y devuelve la accion y sus argumentos para que la app la ejecute, todo en el dispositivo sin enviar datos a la nube.
- Creacion de recordatorios y eventos: a partir de frases como "anade un evento para mi cumpleanos el 3 de marzo", extrae los argumentos (`what`, `time`, `duration`, `where`) y los mapea a `AddEvent`; en real7 obtuvo un 66,7 % de argumentos exactos y un 90,0 % cercanos en esta herramienta.
- Consulta de estadisticas de escritura y notas: `GetNoteStats` (96,6 % exactos en real7) y `GetWritingStats` (75,0 % exactos) permiten responder a preguntas sobre actividad sin salir del dispositivo.
- Gestion de archivos y carpetas: `FileNotesToFolder` (94,7 % de argumentos cercanos en real8) y `FindInFiles` (100 % cercanos) habilitan operaciones de organizacion y busqueda por lenguaje natural.
- Personalizacion de la interfaz: `SetFolderIcon`, `SetNoteIcon` y `SetFolderColor` (100 % exactos en color en real8) permiten cambiar iconos y colores mediante instrucciones en lenguaje natural.
- Enrutamiento con rechazo en produccion: el modelo puede actuar como primera capa de un pipeline de acciones, derivando a `NoMatchingAction` las peticiones no soportadas; dado que la app confirma antes de actuar, el riesgo de un falso positivo se mitiga con una confirmacion de usuario.
- Despliegue en movil sin conectividad: gracias a los 268M parametros y al runtime LiteRT-LM, es viable en Android e iOS con latencia de CPU aceptable para una interaccion de asistente.

## Benchmarks y rendimiento

Evaluacion realizada sobre el archivo `.litertlm` exportado con el motor real LiteRT-LM en CPU. Los conjuntos de prueba fueron generados por el modelo, nunca vistos en entrenamiento, y los resultados crudos estan en `eval/`.

| Test | End-to-end | Herramienta correcta | Rechazos erroneos | Rechazo correcto | Declinaciones perdidas | Sin respuesta |
|---|---|---|---|---|---|---|
| real3 (una herramienta, prompt nativo) | 95,1 % | 99,5 % | 0,5 % | 93,0 % | 68,2 % | 2 |
| real4 (recordatorios, alarmas, ajustes, sugerencias, checklists) | 91,4 % | 94,4 % | 3,0 % | 66,7 % | 0,0 % | 1 |
| real7 (seis herramientas nuevas y preguntas de calendario) | 89,3 % | 98,9 % | 0,0 % | 36,4 % | 0,0 % | 0 |
| real8 (nueve herramientas nuevas y peticiones near-miss) | 90,2 % | 95,3 % | 2,4 % | 54,2 % | 0,0 % | 0 |
| real8 evaluado en MK4 (comparacion) | 46,9 % | 43,5 % | 19,4 % | 70,8 % | 0,0 % | 0 |
| real8b (herramientas ya conocidas por MK4, regresion) | 96,3 % | 96,3 % | 1,9 % | 0,0 % | 0,0 % | 0 |

Calidad de argumentos en real7 (porcentaje sobre filas con herramienta correcta): 181 filas, 98,9 % con herramienta nombrada, 87,2 % exactos y 91,6 % cercanos, con un 0,6 % de argumentos extra. En real8: 170 filas, 95,3 % nombradas, 84,0 % exactos y 91,4 % cercanos, sin argumentos extra.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 268M parametros, en bf16 ocupa aproximadamente 0,54 GB de pesos, y en Q8_0 alrededor de 0,27 GB. El repo completo pesa 1,3 GB.
- GPU recomendadas: no se documentan; el modelo esta disenado para ejecucion en CPU en dispositivos moviles y de escritorio mediante LiteRT-LM.
- Cabe en GPU de consumo: si, por tamano, aunque no se publican requisitos ni pruebas en GPU de consumo.
- Opciones de despliegue: LiteRT-LM (Android, iOS, Apple Silicon Mac, Windows) y llama.cpp con el GGUF Q8_0 (Intel Mac). Tambien es compatible con transformers al estar los pesos en safetensors.
- Latencia y throughput: no disponibles; la evaluacion se realizo en CPU con LiteRT-LM pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prevon Pulse MK5 | 268M | no disponible | Function calling on-device para app Prevon | Gemma Terms of Use | HuggingFace (safetensors, GGUF, LiteRT-LM) |
| google/functiongemma-270m-it (base) | 270M | no disponible | Function calling general | Gemma Terms of Use | HuggingFace |
| Prevon Pulse MK4 (referencia interna) | no disponible | no disponible | Version anterior del mismo fine-tune | Gemma Terms of Use | no disponible |

No se dispone de datos de benchmarks comparables con otros modelos de function calling de tamano similar en la informacion proporcionada; la unica comparacion documentada es contra MK4 en el conjunto real8 (46,9 % frente a 90,2 % end-to-end).

## Limitaciones y advertencias

- El rechazo de peticiones near-miss es el punto debil: solo declina correctamente el 54,2 % en real8, el 66,7 % en real4 y el 36,4 % en real7. Cuando falla, elige una herramienta cercana en lugar de rechazar.
- El modelo esta especializado exclusivamente en el menu de herramientas de la app Prevon; no es un modelo de proposito general y su uso fuera de ese contrato no esta documentado.
- No se documentan sesgos conocidos, pero al ser un fine-tune de FunctionGemma hereda las caracteristicas del modelo base.
- Riesgo de alucinacion en argumentos: en real7, `AddEvent` obtuvo solo un 66,7 % de argumentos exactos, con errores como asignar mal `what` y `time` en eventos de dia completo.
- Los conjuntos de evaluacion fueron generados por el modelo y no por usuarios reales, lo que puede no reflejar la distribucion de peticiones en produccion.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisarlas antes de un despliegue en producto.
- La app confirma antes de actuar, lo que mitiga los errores de seleccion, pero el modelo no debe usarse para ejecutar acciones irreversibles sin confirmacion.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que limita la planificacion de despliegues multilingues o con prompts largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PrevonFounder/prevon-pulse-mk5
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
