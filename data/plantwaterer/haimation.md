# plantwaterer/haimation

## Resumen

haimation es un ajuste fino completo (full fine-tune) del modelo multimodal google/gemma-4-31B-it, publicado por el usuario plantwaterer. El modelo parte de un ajuste previo del mismo autor, plantwaterer/liquamen, y anade una cabeza (head) propia de ultima capa orientada a la toma de decisiones y a preguntas de opcion multiple. Con 31.273.088.876 parametros, se distribuye en formato safetensors y transformers, con un repositorio de 62,7 GB en bf16.

Su interes no reside tanto en el modelo base como en la infraestructura que lo acompana: el autor incluye un motor de inferencia propio (`haimation:Engine`), un almacen de conocimiento con estadisticas por paises y un ejecutor de aritmetica exacta que genera y ejecuta funciones Python en el mismo proceso. El modelo declara una puntuacion de 67,44 en el Decision Index 0.3 (autoevaluada, sin verificacion independiente), una tarea de decision con opciones multiples.

Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y con requisitos de hardware elevados (una GPU de al menos 75 GB en bf16). Resulta relevante como ejemplo de empaquetado de un fine-tune con su propio runtime y de estrategias hibridas entre modelo neuronal y ejecucion simbolica, no como alternativa generalista de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base google/gemma-4-31B-it; atencion empaquetada por documento (capas de atencion completa bidireccional dentro del prompt, capas de ventana deslizante causales) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (max_len) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un full fine-tune continuado de plantwaterer/liquamen, que a su vez deriva de google/gemma-4-31B-it, con una cabeza de ultima capa propia anadida por el autor. La inferencia se realiza en bf16 con atencion empaquetada por documento: las capas de atencion completa son bidireccionales dentro de un mismo prompt y las capas de ventana deslizante son causales. Para peticiones por debajo de un limite de longitud, la respuesta se promedia sobre cuatro ordenaciones distintas de las opciones, lo que reduce la sensibilidad al orden de presentacion.

El pipeline de decision combina tres componentes. Primero, un pase neuronal que aplica softmax sobre los logits de las letras con una temperatura ajustada de T = 1,2984; para decisiones si/no se integra una posterior de Laplace sobre la salida binaria. Segundo, si el pase inicial no alcanza un umbral de confianza (0,925 para opciones numericas, 0,75 para si/no) y la pregunta cumple ciertas condiciones, se consulta un almacen de conocimiento con estadisticas a nivel de pais. Tercero, si el almacen no resuelve, el modelo genera con decodificacion greedy (maximo 320 tokens nuevos) una funcion Python corta que un ejecutor de aritmetica exacta corre en proceso como kernel de GPU, con un interprete de respaldo que produce resultados identicos. La respuesta solo se sustituye si el valor devuelto coincide exactamente con una opcion y la funcion lo ha calculado. Los ficheros de motor, cabeza, almacen y ejecutor estan fijados por MD5 en `PINS.json` y se verifican en la carga. No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y respuesta a preguntas de opcion multiple en el marco del Decision Index.
- Toma de decisiones con opciones discretas (letras, numeros, si/no) mediante calibracion de temperatura y averaging sobre ordenaciones.
- Procesamiento de entrada imagen-texto, heredado del modelo base gemma-4-31B-it.
- Consulta a un almacen de conocimiento interno con estadisticas por paises (nivel pais, valores redondeados a tres cifras significativas).
- Generacion de funciones Python para calculo numerico y ejecucion en un ejecutor de aritmetica exacta (kernel de GPU o interprete).
- Conversacion multi-turno segun el pipeline declarado (text-generation, conversational).
- No se documenta soporte explicito de tool calling, function calling generico ni modo de razonamiento extendido (thinking) mas alla del mecanismo descrito.

## Casos de uso

- Evaluacion de modelos en tareas de decision con opciones multiples: el modelo esta disenado para el kit apolinario/decision-index, de modo que puede ejecutarse directamente contra ese banco de pruebas para obtener puntuaciones comparables.
- Preguntas numericas sobre estadisticas de paises: el almacen interno y el ejecutor permiten responder consultas cuantitativas con aritmetica exacta en lugar de aproximacion neuronal, lo que reduce errores de calculo.
- Investigacion sobre hibridacion neuro-simbolica: sirve como banco de pruebas reproducible (con ficheros fijados por MD5) para estudiar cuando conviene delegar en un ejecutor simbolico frente a la salida del modelo.
- Experimentos de calibracion y robustez al orden de opciones: el averaging sobre cuatro ordenaciones y la temperatura ajustada permiten analizar sesgos posicionales en tareas de eleccion.
- Prototipos de sistemas de decision asistida con trazabilidad: la sustitucion de respuesta solo ocurre bajo condiciones estrictas y verificables, lo que facilita auditar por que se eligio cada opcion.
- Analisis de requisitos de despliegue en GPU de gran memoria: util para medir latencia y throughput de un modelo de 31B en bf16 sobre hardware Blackwell en un pipeline con componentes adicionales.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Decision Index 0.3 (public score) | 67,44 | Autoevaluado por el autor, sin verificacion independiente |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

Datos de latencia declarados por el autor (una RTX PRO 6000 Blackwell, muestra de 1.000 filas del banco):

| Metrica | Valor |
|---|---|
| Mediana | 312 ms |
| Media | 827 ms |
| p80 | 964 ms |
| p95 | 2.371 ms |

No se incluyen en estas cifras la carga del modelo ni el calentamiento (unos tres minutos).

## Requisitos de hardware

- VRAM estimada: al menos 75 GB para inferencia en bf16 (pesos de 62 GB); el autor indica que cabe en una RTX PRO 6000 de 96 GB.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) como referencia declarada; cualquier GPU con 75 GB o mas de memoria.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en bf16. No se documentan opciones de cuantizacion para reducir memoria.
- Despliegue: transformers con el motor propio `haimation:Engine` incluido en el repositorio; el ejecutor incluye kernels precompilados para sm_75 a sm_120, con interprete de respaldo. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 312 ms y p95 de 2,371 ms por peticion en la configuracion indicada; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| haimation | 31,3B | 32.768 | Apache 2.0 | Fine-tune de gemma-4-31B-it con motor y ejecutor propios; Decision Index 0.3: 67,44 (autoevaluado) |
| google/gemma-4-31B-it | 31B (aproximado) | no disponible en la informacion | licencia de Gemma (no confirmada en la informacion) | Modelo base multimodal; sin cabeza de decision ni almacen interno |
| plantwaterer/liquamen | no disponible | no disponible | no disponible | Ajuste previo del mismo autor sobre el que se construye haimation |

No se dispone de datos de benchmarks comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El unico resultado de rendimiento es autoevaluado (self-run) sobre el Decision Index 0.3; no hay validacion independiente.
- Modelo de nicho con cero descargas y cero likes: sin evidencia de uso en comunidad ni de mantenimiento a largo plazo.
- Requiere al menos 75 GB de VRAM en bf16, lo que excluye GPU de consumo y encarece el despliegue.
- La licencia declarada es Apache 2.0, pero al derivar de google/gemma-4-31B-it conviene verificar las condiciones de la licencia del modelo base antes de un uso comercial.
- El almacen de conocimiento incorpora datos de terceros (Our World in Data, V-Dem) bajo CC BY-SA 4.0; su uso derivado puede quedar sujeto a obligaciones de atribucion y comparticion.
- El ejecutor deriva de LOOM (Apache 2.0, modificado); deben conservarse LICENSE y NOTICE incluidos en el repositorio.
- No se documentan idiomas soportados; el comportamiento multilingue es incierto.
- Riesgo de alucinacion en el pase neuronal, mitigado solo parcialmente por los umbrales de confianza y la sustitucion por ejecucion exacta, que se aplica unicamente a preguntas unicas con opciones numericas o si/no.
- No se han publicado datos de sesgos, evaluaciones de seguridad ni resultados en tareas generales.
- La informacion sobre cuantizacion es inexistente, lo que limita las opciones de despliegue en hardware mas modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plantwaterer/haimation
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Ajuste previo del autor: https://huggingface.co/plantwaterer/liquamen
- Kit de evaluacion Decision Index: apolinario/decision-index, commit 9eb2dbe2a358004c8782c66e40a83ac07b953fec (referenciado en la model card; no se proporciona URL directa)
- LOOM (componente del ejecutor): https://github.com/mkturkcan/Loom
- Our World in Data: https://ourworldindata.org
- V-Dem: https://www.v-dem.net
