# JaimeJunr/needle-ptbr

## Resumen

Needle pt-BR es un adaptador LoRA de rango 16 sobre el modelo Cactus-Compute/needle2, publicado por el usuario JaimeJunr, cuyo objetivo es dotar de vocabulario y sintaxis en portugues de Brasil a un modelo de tool calling que no fue entrenado en ese idioma. El modelo base, stock, es seguro en portugues pero inutil en la practica: cuando la respuesta correcta es invocar una herramienta, solo actua en 2 de 18 casos, porque se dedica a declinar en lugar de alucinar. El adaptador eleva esa tasa de actuacion a 13/18 y la precision en el escenario pt/en del 34,4 % al 65,6 %; anadiendo una puerta de grounding (grounding gate) incluida en el repositorio, la precision llega al 71,9 % con 2 fallos criticos.

El modelo esta pensado para despliegue on-device y edge, con pesos en formato .cact y la libreria cactus-needle. El dominio entrenado y evaluado es exclusivamente smart home (cuatro habitaciones, cinco herramientas), con 902 ejemplos generados de forma determinista y un 28,2 % de negativos. La licencia es Apache 2.0, heredada del modelo base.

Es relevante ahora porque documenta de forma inusualmente honesta dos problemas practicos del ajuste fino multilingue en modelos pequenos: primero, que anadir un idioma puede degradar el restraint que el modelo original ya tenia resuelto (de 4/4 a 2/4 en deteccion de entidades inexistentes), y segundo, que un reentrenamiento sobre el checkpoint de Needle 3 fallo silenciosamente. El adaptador publicado es el de Needle 2, medido y funcional, no el de Needle 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Simple Attention Network (SAN) segun arXiv:2607.18363, citada en la atribucion del modelo base; no se detalla en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | CQ W4 en el motor Needle 3; CQ mixed 2-bit en Needle 2 (el esquema cambio entre versiones) |
| Idiomas soportados | pt (portugues de Brasil), en |
| Licencia | Apache 2.0 |
| Formato de pesos | .cact (artefacto de cactus-needle); adaptador LoRA de rango 16 fusionado |

## Arquitectura y entrenamiento

El adaptador se construye como un LoRA de rango 16 sobre Cactus-Compute/needle2, entrenado durante 10 epocas con batch 2, lo que supone aproximadamente 21 horas sobre 2 vCPU. El dataset se genero con un generador determinista y sin API externa: al tratarse de un vocabulario cerrado (cuatro habitaciones y cinco herramientas), las plantillas cubren el espacio mejor que el muestreo de un modelo grande y el conjunto resultante es reproducible bit a bit. En total, 902 ejemplos con un 28,2 % de negativos; esa proporcion se midio, no se estimo, porque al 15,6 % una sola epoca llevo la tarea de negacion de 1/3 a 0/3 y elevo los fallos criticos de 5 a 7, es decir, el modelo aprendia a actuar y desaprendia la contencion. La mitad de las plantillas de negacion no llevan particula inicial (formas como "deixa quieta" o "nem pensa"), porque asi es como el portugues niega realmente.

La innovacion tecnica mas relevante no esta en los pesos, sino en la puerta de grounding que acompana al adaptador en el repositorio. El ajuste fino de un idioma nuevo degrada una capacidad que el modelo upstream ya tenia resuelta: la deteccion de entidades inexistentes pasa de 4/4 a 2/4 al ensenar al modelo a actuar. La puerta restaura el 4/4, reduce a la mitad los fallos criticos y sube la precision al mismo tiempo, sin coste de inferencia adicional porque se trata de una comparacion de texto. Es importante subrayar que la puerta vive en el repositorio, no en los pesos. La model card indica ademas que el modelo se entreno sobre el checkpoint de Needle 2 pero se ejecuta sobre el motor de Needle 3, con un esquema de cuantizacion distinto (de CQ mixed 2-bit a CQ W4), de modo que el adaptador se construyo para un objetivo que el motor actual ya no utiliza.

## Capacidades

- Tool calling y function calling: el modelo genera llamadas estructuradas a funciones descritas mediante esquemas, que es la tarea para la que fue ajustado.
- Ejecucion en edge y on-device: pensado para ejecutarse localmente, con pesos cuantizados y sin dependencia de API.
- Actuacion sobre vocabulario cerrado de domotica: cuatro habitaciones y cinco herramientas definidas en el entorno smart_home.
- Comprension de portugues de Brasil coloquial, incluyendo negacion sin particula inicial, formatos numericos y registros propios de pt-BR.
- Mantenimiento del rendimiento en ingles: la model card reporta que el ingles no solo no regresa, sino que mejora (del 78,1 % al 87,5 % de precision con el adaptador y la puerta).
- Soporte de esquemas bilingues: las herramientas se describen en ingles y el usuario habla en portugues; esta configuracion (pt/en) puntua mejor que traducir los esquemas al portugues (pt/pt, 68,8 % frente a 71,9 %).
- No se documentan capacidades de vision, audio, generacion de codigo, matematicas ni modo de razonamiento explicito.
- No se documenta soporte de agentes multi-paso mas alla de la llamada unica a herramienta.

## Casos de uso

- Control por voz de domotica en portugues de Brasil: el modelo recibe una frase como "liga a luz da cozinha" y emite la llamada a la herramienta correspondiente. Es el escenario exacto sobre el que se entreno ymidio, con 14/18 actuaciones correctas usando adaptador y puerta.
- Asistentes embebidos en dispositivos sin conectividad: al ejecutarse on-device con pesos cuantizados, permite integrar control de funciones local en altavoces, paneles de pared o hubs domesticos sin enviar audio ni texto a la nube.
- Enrutamiento de intenciones en aplicaciones moviles: el modelo puede actuar como clasificador que decide que funcion del sistema invocar ante una entrada de texto en portugues, con la puerta de grounding evitando llamadas a entidades que no existen en la aplicacion.
- Filtrado de falsos positivos en pipelines de automatizacion: la puerta de grounding reduce los fallos criticos de 4 a 2 y restaura al 4/4 la deteccion de entidades inexistentes, por lo que es util como capa de validacion antes de ejecutar una accion fisica sobre el hogar.
- Prototipado de agentes offline sin coste de API: con `pip install cactus-needle` y `needle download`, un equipo puede montar un agente funcional en local para validar flujos de tool calling antes de pasar a un modelo mayor o a un servicio gestionado.
- Evaluacion y comparacion de estrategias de ajuste multilingue: el repositorio publica el benchmark, el generador de datos y la puerta, lo que permite reproducir los 32 casos espejados y los 22 casos de estres especificos de portugues como linea base para otros adaptadores.
- Investigacion sobre perdida de restraint en ajuste fino: el caso documenta como anadir un idioma degrada la deteccion de entidades inexistentes y como una comprobacion externa lo compensa, material util para disenar pipelines de fine-tuning en modelos pequenos.
- Integracion en interfaces de voz para mercados lusofonos: combinado con un motor de reconocimiento de voz en pt-BR, sirve como capa de comprension de comandos en productos destinados a Brasil, con la advertencia de que no se ha validado fuera del dominio smart home.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al benchmark del propio autor, medido sobre `needle 3.0.1`, entorno `smart_home`, con 32 casos espejados mas 22 casos de estres especificos de portugues.

| Escenario | Configuracion | Precision | Fallos criticos | Actua |
|---|---|---|---|---|
| pt/en | Needle 3, tal cual | 34,4 % | 1 | 2/18 |
| pt/en | + adaptador | 65,6 % | 4 | 13/18 |
| pt/en | + adaptador y puerta de grounding | 71,9 % | 2 | 14/18 |
| pt/pt | + adaptador y puerta de grounding | 68,8 % | no disponible | no disponible |
| en/en | Needle 3, tal cual | 78,1 % | 3 | no disponible |
| en/en | + adaptador y puerta de grounding | 87,5 % | 0 | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- El modelo esta disenado para despliegue on-device y edge, con inferencia en CPU.
- VRAM estimada: no disponible. Los unicos tamanos citados son el artefacto base del motor (35,34 MB) y la fusion fallida sobre Needle 3 (63,47 MB), coherentes con dispositivos sin GPU dedicada, pero la informacion no confirma requisitos de VRAM.
- GPU recomendadas: no disponible; no se publican requisitos de GPU en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible de forma explicita; el tamano de los artefactos citados sugiere que cabria en cualquier GPU de consumo, pero esto es una inferencia a partir del tamano, no un dato confirmado.
- Opciones de despliegue: libreria cactus-needle (`pip install cactus-needle`, `needle download JaimeJunr/needle-ptbr`) y el motor propio del proyecto. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la documentacion disponible.
- Latencia medida en CPU: entre 36 y 57 segundos por llamada en un portatil de 4 hilos con el motor de Needle 3, frente a aproximadamente medio segundo con el motor de Needle 2. La model card aclara que el adaptador no es la causa de esa lentitud, ya que el modelo base es igual de lento.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos de terceros comparables en la informacion proporcionada. La comparativa posible es interna, entre el modelo base y las distintas configuraciones del adaptador:

| Configuracion | Base | Licencia | pt/en | en/en | Fallos criticos (pt/en) |
|---|---|---|---|---|---|
| Needle 3 stock | Cactus-Compute/needle3 | Apache 2.0 | 34,4 % | 78,1 % | 1 |
| + adaptador pt-BR | Cactus-Compute/needle2 | Apache 2.0 | 65,6 % | no disponible | 4 |
| + adaptador y puerta | Cactus-Compute/needle2 | Apache 2.0 | 71,9 % | 87,5 % | 2 |

Modelos comparables de otros autores: no disponible.

## Limitaciones y advertencias

- Desajuste de version: el adaptador se entreno sobre el checkpoint de Needle 2, pero se ejecuta sobre el motor de Needle 3, cuyo esquema de cuantizacion cambio (CQ mixed 2-bit a CQ W4). Funciona, pero fue construido para un objetivo que el motor actual ya no emplea.
- Reentrenamiento fallido sobre Needle 3: se intento un LoRA sobre el propio checkpoint de Needle 3 (10/10 epocas, perdida de validacion 0,0390, `needle build` reportando 5 grupos de pesos fusionados y un .cact de 63,47 MB) y el modelo resultante se comporta de forma identica al base sin ajustar. El autor atribuye el fallo a que un LoRA de rango 16 sobre 5 grupos de pesos no se mapea correctamente sobre la arquitectura de Needle 3. No esta resuelto.
- Rendimiento muy bajo en CPU con el motor de Needle 3: 36 a 57 segundos por llamada en un portatil de 4 hilos, frente a medio segundo con el motor de Needle 2. Hay que planificar las ejecuciones de evaluacion en consecuencia.
- Ausencia de puerta de confianza: el ajuste fino no actualiza la cabeza de confianza, por lo que los pesos ajustados devuelven `confidence` como `None`. Se pierde la confianza calibrada del modelo base (0,79 de media en portugues sobre Needle 3). La puerta de grounding es un sustituto, no un equivalente, y quedan dos fallos criticos.
- La puerta de grounding no es opcional: sin ella hay que esperar la fila de 65,6 % de precision con 4 fallos criticos en lugar de 71,9 % con 2.
- Dominio unico: entrenado y medido exclusivamente sobre superficies de herramientas de domotica (cuatro habitaciones, cinco herramientas). Los resultados no demuestran generalizacion a un dominio nuevo.
- Idioma: portugues de Brasil, no europeo. Los casos de estres se centran en negacion coloquial, formato numerico y registro de pt-BR.
- Riesgo de alucinacion de entidades: al ensenar al modelo a actuar, reaparece la invencion de habitaciones (deteccion de entidades inexistentes 2/4); la puerta lo devuelve a 4/4.
- Sesgos conocidos: no se documentan sesgos especificos mas alla de la limitacion de dominio e idioma.
- Uso comercial: la licencia Apache 2.0 lo permite, en linea con el modelo base; conviene verificar la atribucion a Cactus-Compute y citar el paper arXiv:2607.18363.
- Cifras de adopcion nulas en el momento de la consulta (0 descargas, 0 likes) y repositorio de 0,0 GB, por lo que no hay validacion independiente de los resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JaimeJunr/needle-ptbr
- Modelo base declarado (tag): https://huggingface.co/Cactus-Compute/needle2
- Modelo base referenciado en la model card: https://huggingface.co/Cactus-Compute/needle3
- Paper de arquitectura (arXiv:2607.18363): https://arxiv.org/abs/2607.18363
- Benchmark pt-BR: https://github.com/JaimeJunr/needle/tree/main/benchmarks/ptbr
- Puerta de grounding: https://github.com/JaimeJunr/needle/blob/main/benchmarks/ptbr/grounding.py

No se han encontrado otros enlaces relevantes en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
