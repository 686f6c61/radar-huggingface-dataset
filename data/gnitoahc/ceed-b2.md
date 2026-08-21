# gnitoahc/ceed-b2

## Resumen

CEED B2 es un modelo de vision-lenguaje (VQA) desarrollado por gnitoahc como artefacto de investigacion dentro del estudio CEED (Causal Expert–Evidence Distillation). Se trata de un fine-tune con LoRA de `google/gemma-4-e4b-it` (modelo denso de ~7.94B parametros) entrenado con entropia cruzada mas destilacion de logits top-k desde un profesor MoE disperso, `google/gemma-4-26b-a4b-it`. El adaptador LoRA se ha fusionado en los pesos base, por lo que el checkpoint es autonomo y se carga directamente con Transformers sin necesidad de PEFT.

El modelo esta especializado en respuesta a preguntas visuales (VQA) sobre documentos, imagenes naturales y graficos, entrenado con los datasets DocVQA, GQA y ChartQA. Su relevancia radica en que es un experimento controlado para evaluar si la destilacion de conocimiento desde un profesor MoE disperso a un alumno denso produce mejoras frente al fine-tuning supervisado convencional. Los resultados publicados indican que el grupo de control sin destilacion (CEED B1) supera a este checkpoint en todos los datasets, por lo que el modelo debe interpretarse como un resultado negativo o nulo del estudio, no como un producto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | image-text-to-text (vision-language transformer denso) |
| Parametros totales | 7.941.100.874 (~7,94B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, uso con dtype float16 documentado) |
| Idiomas soportados | ingles |
| Licencia | gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e4b-it`, un transformer denso de ~7,94B parametros con capacidad multimodal (imagen y texto). El entrenamiento combina dos objetivos: entropia cruzada estandar sobre las etiquetas doradas y un termino de destilacion de logits top-k procedentes del profesor `google/gemma-4-26b-a4b-it`, un modelo MoE disperso de 26B parametros totales con 4B activos. El adaptador LoRA tiene rango 4 y se ha fusionado en los pesos base tras el entrenamiento, de modo que el checkpoint resultante no requiere codigo PEFT ni el framework CEED para su carga.

El corpus de entrenamiento consta de 17.849 ejemplos (2.500 de ChartQA, 5.349 de DocVQA y 10.000 de GQA), divididos en 80/10/10 por identificador de ejemplo. Se realizaron 2,69 pasadas sobre el split de entrenamiento. La entropia cruzada final fue 0,9816 y el termino de destilacion final 2,3852. El entrenamiento se realizo con una instruccion de respuesta corta en el prompt, requisito imprescindible para que el modelo puntue correctamente en la evaluacion.

## Capacidades

- Respuesta a preguntas visuales sobre documentos (DocVQA): extraccion de informacion textual de imagenes de documentos, como totales, fechas o campos concretos.
- Respuesta a preguntas sobre imagenes naturales (GQA): razonamiento sobre objetos, relaciones y atributos en fotografias.
- Respuesta a preguntas sobre graficos (ChartQA): interpretacion de graficos de barras, lineas y otros formatos para responder preguntas cuantitativas.
- Generacion de respuestas cortas y directas: el modelo esta optimizado para respuestas concisas mediante instruccion de respuesta corta.
- Capacidad multimodal: procesa pares imagen-texto y genera texto.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Reproduccion de experimentos de destilacion: el checkpoint permite replicar los resultados del estudio CEED y comparar el efecto de la destilacion top-k frente al control sin profesor, usando el harness de evaluacion `ceed-direct-1`.
- Extraccion de campos de documentos: dado un documento escaneado o captura, el modelo puede responder preguntas como "cual es el total" o "cual es la fecha de vencimiento", util en prototipos de automatizacion de facturas o formularios.
- Interpretacion de graficos en informes: el modelo puede responder preguntas cuantitativas sobre graficos, por ejemplo "que categoria tiene el valor mas alto", para asistentes de analisis de datos.
- Anotacion automatica de imagenes: en pipelines de etiquetado, el modelo puede generar respuestas cortas sobre contenido de imagenes naturales, aunque con precision limitada (exact match de 0,6191 en GQA).
- Evaluacion comparativa de tecnicas de destilacion: como artefacto de investigacion, sirve para estudiar si la destilacion desde MoE a denso transfiere senal util o si el adaptador LoRA de rango 4 carece de capacidad para retenerla.
- Prototipos de asistentes de documentacion: integrable en demos de VQA para responder preguntas sobre manuales, contratos o capturas de pantalla, siempre que el ambito sea ingles y se acepte la limitacion de rendimiento frente a un fine-tune completo.

## Benchmarks y rendimiento

Los resultados publicados corresponden al split de validacion propio del estudio CEED (10% de los 17.849 ejemplos), evaluados con decodificacion greedy y el harness `ceed-direct-1`. El propio autor advierte que **no son comparables con los leaderboards publicos** de DocVQA, GQA o ChartQA por diferencias en splits, prompt y decodificacion.

| Dataset | Metrica | Puntuacion | n |
|---|---|---|---|
| DocVQA | ANLS | 0,8506 | 565 |
| GQA | exact match | 0,6191 | 1016 |
| ChartQA | relaxed accuracy | 0,5783 | 249 |

Comparacion con el control sin destilacion (CEED B1, entrenado identicamente pero con `kd_weight: 0`):

| Dataset | CEED B2 (con destilacion) | CEED B1 (sin destilacion) |
|---|---|---|
| DocVQA (ANLS) | 0,8506 | 0,8798 |
| GQA (exact match) | 0,6191 | 0,6959 |
| ChartQA (relaxed accuracy) | 0,5783 | 0,7871 |

El control sin destilacion supera a este checkpoint en los tres datasets, lo que indica que el termino de destilacion no aporta ventaja observable frente al fine-tuning supervisado en este escenario.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: ~16 GB (7,94B parametros × 2 bytes), consistente con el tamano del repo de 15,9 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o cualquier GPU con al menos 20 GB de VRAM para inferencia comoda en float16.
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 (24 GB) con float16. Con cuantizacion a 8 bits o 4 bits cabria en GPUs de 12-16 GB, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: Transformers con `AutoModelForImageTextToText` y `AutoProcessor` (carga directa documentada), compatible con vLLM segun los resultados de busqueda, y con FriendliAI para inferencia gestionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| gnitoahc/ceed-b2 | 7,94B | Denso, LoRA rank 4 | no disponible | gemma | Destilacion desde MoE; peor que su control sin destilacion |
| gnitoahc/ceed-b1 | 7,94B | Denso, LoRA rank 4 | no disponible | gemma | Control sin destilacion; supera a B2 en los 3 datasets |
| google/gemma-4-e4b-it | ~7,94B | Denso multimodal | no disponible | gemma | Modelo base sin fine-tune especifico de VQA |
| google/gemma-4-26b-a4b-it | 26B totales, 4B activos | MoE disperso | no disponible | gemma | Profesor usado para destilacion |

La comparativa directa mas relevante es contra CEED B1, el control entrenado sin destilacion, que demuestra que el aporte de la destilacion no se traduce en mejora. Frente al modelo base, no se publican comparaciones directas en los mismos splits.

## Limitaciones y advertencias

- Es un resultado de LoRA de rango 4 fusionado, no un fine-tune completo. La fusion no convierte un adaptador de rango 4 en un fine-tune de capacidad plena; el propio estudio (ADR-0005) excluye resultados LoRA de su tabla principal por esta razon.
- El beneficio de la destilacion no esta establecido: el control sin profesor (CEED B1) supera a este checkpoint en todos los datasets, por lo que no hay evidencia de que la destilacion aporte ventaja.
- Entrenado exclusivamente en ingles y en tres dominios VQA (documentos, imagenes naturales y graficos). El comportamiento fuera de estos ambitos no esta probado.
- Los resultados de evaluacion no son comparables con los leaderboards publicos de DocVQA, GQA o ChartQA por diferencias en splits, prompt y decodificacion.
- Requiere instruccion de respuesta corta en el prompt; sin ella, el modelo genera respuestas con formato extendido que puntuan cero en las metricas del estudio.
- Es un artefacto de investigacion, no un producto. No se recomienda su uso en produccion sin validacion adicional.
- Hereda las limitaciones del modelo base gemma-4-e4b-it y las restricciones de la licencia Gemma, que incluyen condiciones especificas para uso comercial.
- Riesgo de alucinacion en respuestas visuales: como cualquier VQA, puede inventar valores o atributos no presentes en la imagen, especialmente en graficos complejos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gnitoahc/ceed-b2
- Repositorio del estudio CEED: https://github.com/GNITOAHC/ceed
- Documentacion del estudio (ceed.md): https://github.com/GNITOAHC/ceed/blob/main/ceed.md
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Modelo profesor: https://huggingface.co/google/gemma-4-26b-a4b-it
- Variante adicional del autor: https://huggingface.co/gnitoahc/ceed-b2-gemma4-e4b-it-0802
