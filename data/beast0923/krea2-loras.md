# beast0923/krea2-Loras

## Resumen

`beast0923/krea2-Loras` es un repositorio de adaptadores LoRA (PEFT) para el modelo base `krea/Krea-2-Turbo`, un modelo generativo de imagenes. El repositorio no contiene un modelo de lenguaje ni un modelo fundacional: agrupa una coleccion de pesos de bajo rango (safetensors) entrenados para modificar el comportamiento del modelo base en dominios concretos, mayoritariamente contenido para adultos y controles de atributos fisicos.

El autor publica estos adaptadores como material auxiliar de un espacio de Hugging Face que fue desactivado por el equipo de moderacion de la plataforma, segun se recoge en la propia model card. El motivo indicado fue el uso de un modelo de imagen-a-video sin censura combinado con capacidades img2video, lo que la plataforma considero un riesgo elevado de generacion de imagenes intimas no consentidas (NCII). El autor sugiere alternativas de despliegue mediante un repositorio de GitHub propio.

Por su naturaleza, este repositorio no es evaluable como modelo de IA de proposito general: no tiene parametros de lenguaje, contexto, benchmarks de razonamiento ni soporte multilingue. La ficha documenta lo que el repositorio contiene y sus implicaciones tecnicas y de cumplimiento, sin inventar especificaciones que no existen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el modelo base `krea/Krea-2-Turbo` |
| Parametros totales | no disponible (depende del rango de cada adaptador) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo generativo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT) |
| Tamano del repositorio | 5.4 GB |
| Modelo base | `krea/Krea-2-Turbo` |
| Libreria | peft |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-28 |

## Arquitectura y entrenamiento

El repositorio contiene adaptadores LoRA, es decir, matrices de bajo rango que se inyectan en las capas del modelo base `krea/Krea-2-Turbo` para especializarlo sin reentrenar todos los pesos. No se dispone de informacion sobre el rango (rank), el alpha, las capas objetivo ni el dataset de entrenamiento de cada adaptador. La model card solo enumera nombres de ficheros y enlaces a CivitAI.

Los adaptadores listados cubren dos familias funcionales: por un lado, sliders y modificadores de atributos (tamano de pecho, edad, figura, POV, estilo 3D tipo Pixar) y, por otro, un adaptador denominado `Krea2_TextFusion_Refusal_Reduction`, orientado a reducir la tasa de rechazo del modelo base ante determinadas peticiones. No hay informacion sobre el proceso de entrenamiento, el numero de pasos, la resolucion de las imagenes de entrenamiento ni el metodo de capturacion de datos.

## Capacidades

- Generacion y edicion de imagenes condicionada por el modelo base `Krea-2-Turbo`, modulada por cada LoRA.
- Control de atributos fisicos y de estilo mediante adaptadores especificos (sliders de figura, edad, pecho, POV, estilo 3D).
- Reduccion de rechazos del modelo base mediante el adaptador `TextFusion_Refusal_Reduction`.
- Contenido para adultos (etiqueta `not-for-all-audiences`).
- No ofrece generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Investigacion sobre tecnicas LoRA: los ficheros sirven como ejemplo de adaptadores de bajo rango aplicados a un modelo de difusion, utiles para estudiar como se modifica el comportamiento de un modelo base sin reentrenarlo.
- Estudio de mitigacion y moderacion: el adaptador `TextFusion_Refusal_Reduction` es un caso de analisis para equipos de seguridad que quieran entender como se degradan los mecanismos de rechazo de un modelo generativo.
- Pruebas de pipelines PEFT: permite validar la carga de adaptadores con la libreria `peft` y verificar la compatibilidad con el modelo base `Krea-2-Turbo`.
- Despliegue controlado en entorno cerrado: el autor propone clonar su repositorio de GitHub y ejecutarlo en Runpod, lo que permite aislar el modelo en infraestructura propia con las salvaguardas que el operador defina.
- Evaluacion de riesgo NCII: util para que equipos de cumplimiento documenten por que este tipo de combinacion (modelo sin censura + img2video) exige moderacion de entrada y salida, tal como indica el mensaje de Hugging Face recogido en la model card.
- Fines artisticos o de estilo: el adaptador `Pixar_Disney_3D_Style` puede emplearse para experimentar con estilizacion 3D en el modelo base, al margen de los adaptadores para adultos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para los adaptadores; depende del modelo base `Krea-2-Turbo`, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card menciona un repositorio de GitHub (`minipasila/Krea-2-Turbo_I2I`) y ejecucion en Runpod; tambien es compatible con la libreria `peft` para cargar los adaptadores sobre el modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre adaptadores LoRA comparables para el mismo modelo base ni sobre sus especificaciones.

## Limitaciones y advertencias

- Contenido explicito para adultos: el repositorio esta etiquetado `not-for-all-audiences` y la mayoria de adaptadores estan disenados para generar contenido sexual explicito.
- Riesgo de NCII: el propio mensaje de Hugging Face recogido en la model card senala que la combinacion de modelo sin censura e img2video presenta un riesgo alto de generacion de imagenes intimas no consentidas. El espacio asociado fue desactivado por ausencia de moderacion de entrada y salida.
- Ausencia de salvaguardas: no se documentan filtros de prompt, deteccion de rostros ni escaneo de salidas.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido; hay que consultar la licencia del modelo base `krea/Krea-2-Turbo`.
- Idiomas no disponibles: la model card no especifica idiomas, aunque los prompts de los ejemplos estan en ingles.
- Sin benchmarks: no hay datos de rendimiento, calidad ni fidelidad de los adaptadores.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion por parte de la comunidad.
- Dependencia del modelo base: los adaptadores no funcionan de forma autonoma; requieren cargar `krea/Krea-2-Turbo`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/beast0923/krea2-Loras
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Repositorio GitHub del autor: https://github.com/minipasila/Krea-2-Turbo_I2I
- Repositorio espejo de LoRAs: https://huggingface.co/mpasila/Krea-2-LoRAs
- Ejemplo de adaptador en CivitAI: https://civitai.red/models/2775340/krea2-textfusion-refusal-reduction-lora
