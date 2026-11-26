# FrankMdza/nano-injection-detector

## Resumen

Nano es un detector de inyeccion indirecta de prompts (indirect prompt injection) desarrollado por Hephaestus Lab (Medellin, Colombia) y publicado como vista previa de investigacion el 25 de noviembre de 2026. Su funcion es puntuar el texto que un agente de IA lee desde sus herramientas (una pagina web, un correo, un fichero o el resultado de una llamada a herramienta) y senalar aquel que contiene instrucciones dirigidas al agente. Se posiciona como una capa de aviso previa al sistema de permisos de un agente, no como una frontera de seguridad.

Tecnicamente es un transformer causal de 10.881.024 parametros entrenado desde cero sobre bytes, sin tokenizer. Esa eleccion elimina el paso donde se descartan caracteres invisibles, insertados o homoglifos, aunque el propio autor advierte que esto es una propiedad del formato de entrada y no una garantia de robustez. El modelo se distribuye en ONNX (float32 e int8), corre en CPU y el fichero de 8 bits ocupa 11 MB, lo que lo hace desplegable en entornos muy limitados.

Su relevancia actual radica en la relacion coste-rendimiento: con dos ordenes de magnitud menos parametros que Prompt Guard 2 de Meta (86M), obtiene mejores cifras de recall en varios conjuntos de evaluacion, a costa de una tasa de falsos positivos mas alta en su umbral publicado y de una ventana de analisis de solo 95 bytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal a nivel de byte (byte-level), entrenado desde cero, sin tokenizer |
| Parametros totales | 10.881.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de 95 bytes por fragmento, con deslizamiento de 48 bytes entre ventanas |
| Tipos de cuantizacion | int8 (nano-int8.onnx) y float32 (nano.onnx) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ejecutable con onnxruntime) |

## Arquitectura y entrenamiento

El modelo es un transformer causal pequeno que aprende dos tareas con un unico objetivo: predecir el siguiente byte en cada posicion y, al final de la ventana, emitir un veredicto de clasificacion (inyectado frente a benigno). El autor indica que, sin la tarea auxiliar de prediccion del siguiente byte, el veredicto no entrena a este tamano. La puntuacion final es la diferencia entre el logit de "inyectado" y el de "benigno" al final de la ventana, y no una probabilidad calibrada.

El entrenamiento se realizo en cuatro fases: primero se recopilaron textos publicos de agentes y tecnicos junto con lineas de ataque y lineas benignas generadas por modelos de lenguaje, manteniendo siempre un modelo escritor fuera del conjunto de entrenamiento para comprobar si el detector aprende ataques o aprende a sus generadores. Despues se entrenaron diez copias con semillas distintas y se uso su consenso (la media de sus predicciones) como objetivo suave para destilar el conocimiento en un modelo nuevo de 10,9M, partiendo de diez modelos propios de 50,9M de la misma arquitectura pero mas anchos y profundos. Todos los modelos de la cadena son propios y entrenados desde cero; no se empleo ningun detector de terceros como profesor. El fichero publicado corresponde a la semilla 6 de esa ultima etapa.

## Capacidades

- Clasificacion binaria de texto como inyectado o benigno, orientada especificamente a inyeccion indirecta de prompts.
- Procesamiento a nivel de byte: no descarta caracteres invisibles, insertados ni homoglifos durante la tokenizacion.
- Analisis por ventanas deslizantes de 95 bytes con paso de 48 bytes, tomando la puntuacion maxima entre todas las ventanas.
- Ejecucion en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Interfaz de linea de comandos (`nano.py`) que acepta texto directo o fichero y devuelve codigo de salida 2 si detecta inyeccion y 0 si no.
- Umbral configurable en `threshold.json`, calibrado para una tasa de falsos positivos del 1 % sobre 824 documentos benignos de desarrollo.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio: es exclusivamente un clasificador de texto.

## Casos de uso

- Filtro previo en agentes con acceso a herramientas: antes de que el agente procese el resultado de una llamada (una pagina web, un correo o la salida de una API), se pasa el texto por Nano y, si se marca, se activa una revision o se bloquea la accion. Es adecuado por su bajo coste en CPU y su integracion sencilla via ONNX.
- Proteccion de pipelines de correo entrante: escanear el cuerpo de correos antes de que un agente de asistencia los resuma o actue sobre ellos, aprovechando que fue evaluado sobre la muestra LLMail-Inject.
- Defensa en navegacion web automatizada: puntuar el contenido descargado por un agente que navega, con la advertencia de que solo cubre instrucciones contenidas en ventanas de 95 bytes.
- Monitorizacion de registros y resultados de herramientas en produccion: ejecutar Nano sobre los logs de salida de herramientas para detectar intentos de inyeccion en tiempo casi real, dado su consumo de unos 100-115 MB de memoria y 60-85 ms por kilobyte en un Apple M2.
- Despliegue en dispositivos de borde o entornos sin GPU: el fichero int8 de 11 MB permite incluirlo en contenedores ligeros, funciones serverless o portatiles modestos.
- Capa de telemetria y senalizacion en sistemas de agentes existentes: usar la puntuacion como indicador para priorizar revisiones humanas, sin tratarla como decision automatica definitiva.
- Evaluacion comparativa de defensas: servir como linea base ligera frente a detectores mas grandes en pruebas internas de robustez.

## Benchmarks y rendimiento

Resultados de desarrollo publicados por el autor (media de diez semillas salvo donde se indica), recall en porcentaje con cada detector en su umbral publicado:

| Conjunto | Nano 10M (media 10 semillas) | Nano 10M (semilla publicada) | Prompt Guard 2 86M | Prompt Guard 2 22M |
|---|---|---|---|---|
| AgentDojo | 69,5 | 71,0 | 51,5 | 1,8 |
| tau-bench | 75,8 | 77,0 | 50,0 | 0,0 |
| Documentos InjecAgent | 75,7 | 79,4 | 51,0 | 3,5 |
| Muestra LLMail-Inject | 57,2 | 56,8 | 24,2 | 1,5 |
| Lineas de ataque de un escritor no visto en entrenamiento | 32,8 | 30,7 | 1,2 | 0,8 |
| Falsos positivos, muestra del README | 2,3 | 4,2 | 0,0 | 0,4 |
| Falsos positivos, benignos agrupados reservados | 0,5 | 0,5 | 0,8 | 0,1 |

Comparacion con falsos positivos igualados al 1 % ajustado sobre los benignos de cada conjunto (recall en porcentaje, error estandar entre parentesis):

| Modelo | AD-Matched | AD-Shift | tau-bench |
|---|---|---|---|
| Nano 10M, media 10 semillas | 64,2 (2,1) | 62,5 (2,1) | 84,7 (0,5) |
| Nano 10M, semilla publicada | 63,2 | 61,4 | 85,3 |
| Prompt Guard 2 22M | 59,0 | 69,0 | 38,2 |
| Prompt Guard 2 86M | 70,4 | 80,8 | 77,6 |

Las cifras de Prompt Guard 2 son mediciones propias del autor sobre los modelos publicados por Meta, no las cifras oficiales de Meta. Todos estos resultados son de desarrollo y el conjunto de test final aun no estaba construido en el momento de la publicacion.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo corre en CPU con ONNX Runtime.
- Memoria: aproximadamente 114 MB de pico segun el autor y 101 MB para el proceso completo segun un revisor independiente, con pesos int8.
- GPU recomendadas: no aplica; opcionalmente cualquier GPU compatible con ONNX Runtime, sin datos de rendimiento publicados.
- Cabe en cualquier equipo consumer: probado en un Apple M2 de 8 GB.
- Despliegue: ONNX Runtime (libreria oficial), con los ficheros `nano-int8.onnx` y `nano.onnx`; el script `nano.py` requiere `onnxruntime` y `numpy`.
- Latencia: 62 ms por kilobyte (medicion del autor) y 81,5-84 ms por kilobyte (revisor independiente) en Apple M2 con lotes de 8 ventanas; una ejecucion completa del script tardo 128 ms para 100 bytes y 933 ms para 10 KB.
- Comparativa de coste en el mismo portatil: Prompt Guard 2 22M en PyTorch consume 2,7 GB y 43 ms por kilobyte; Prompt Guard 2 86M, 4,0 GB y 111 ms por kilobyte.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Recall AgentDojo (umbral propio) | Licencia | Formato |
|---|---|---|---|---|---|
| Nano 10M (este modelo) | 10,9M | 95 bytes por ventana | 69,5 (media 10 semillas) | Apache 2.0 | ONNX int8/float32 |
| Prompt Guard 2 22M (Meta) | 22M | no disponible en la informacion | 1,8 | no disponible en la informacion | PyTorch |
| Prompt Guard 2 86M (Meta) | 86M | no disponible en la informacion | 51,5 | no disponible en la informacion | PyTorch |

Nano ofrece mejor recall que Prompt Guard 2 22M y 86M en AgentDojo, tau-bench, InjecAgent y LLMail-Inject con su umbral publicado, aunque su umbral es mas laxo y parte de esa ventaja se paga en falsos positivos. Con falsos positivos igualados al 1 %, Nano supera a Prompt Guard 2 22M en AD-Matched y tau-bench, queda por debajo en AD-Shift, y se situa por debajo de Prompt Guard 2 86M en AD-Matched y AD-Shift pero por encima en tau-bench.

## Limitaciones y advertencias

- No es una frontera de seguridad: el propio autor lo describe como un aviso previo al sistema de permisos, no como una garantia.
- Ventana maxima de 95 bytes: un ataque cuyas partes esten separadas por mas de esa distancia no se reconoce como un unico ataque, y tomar la ventana de mayor puntuacion no las une.
- Los documentos largos se marcan con mas frecuencia porque cada ventana es una oportunidad de falsa alarma; el propio model card se marca a si mismo (116 ventanas).
- La ventana que imprime el script indica donde la puntuacion fue mas alta, no una explicacion del motivo.
- La puntuacion es una diferencia de logits, no una probabilidad calibrada; el umbral se midio sobre 824 documentos benignos de desarrollo y no garantiza el mismo comportamiento en otros textos.
- En una prueba independiente, la mitad de los ataques ocultos mediante caracteres insertados, invisibles o similares siguio pasando, pese al diseno byte-level.
- Recall bajo sobre lineas de ataque de un escritor no visto en entrenamiento (32,8 % de media), lo que sugiere cierta dependencia de los generadores vistos.
- Solo soporta ingles.
- Resultados de desarrollo: el conjunto de test final no existia al publicarse y las cifras podrian ser inferiores.
- Sin datos publicados sobre sesgos demograficos o culturales.
- Licencia Apache 2.0: permite uso comercial con atribucion y sin garantias; conviene revisar las obligaciones de la licencia antes de integrarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrankMdza/nano-injection-detector
- Referencia citada en la model card: arXiv 2610.03448 (comparacion con falsos positivos igualados)
