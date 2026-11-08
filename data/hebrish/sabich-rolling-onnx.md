# Hebrish/Sabich-Rolling-ONNX

## Resumen
Sabich-Rolling-ONNX es un modelo de reconocimiento automatico del habla (ASR) exportado a formato ONNX, distribuido por el desarrollador Hebrish bajo el identificador `Hebrish/Sabich-Rolling-ONNX`. Forma parte de la familia de modelos Hebrish, orientada a la transcripcion de audio en ingles con inserciones de palabras en hebreo (code-switching), que se romanizan a una grafia unica en caracteres latinos (por ejemplo, "makolet" o "arnona"). Segun la documentacion del proyecto, Sabich es el modelo por defecto del servidor de inferencia autoalojado de Hebrish y se presenta como la opcion recomendada frente a su hermano Jachnun, con vocabulario tecnico adicional.

El modelo se basa en la arquitectura NeMo Conformer con decodificacion TDT (Token-and-Duration Transducer), tal como indica la etiqueta `nemo-conformer-tdt` del repositorio. Esta arquitectura combina capas convolucionales y de atencion en un encoder Conformer con un decoder transducer que predice conjuntamente tokens y duraciones, lo que permite decodificacion no autorregresiva y streaming eficiente. El repositorio ocupa 24,5 GB, un tamano coherente con la exportacion ONNX de un modelo de cientos de millones de parametros junto con los graficos de encoder, decoder y joint network.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de despliegue (ONNX) para un nicho linguistico muy especifico (ASR de ingles con hebreo romanizado) y su acceso esta restringido mediante gating en Hugging Face. No se dispone de model card publica en el repositorio, ni de licencia declarada, ni de especificaciones de contexto o cuantizacion, por lo que los apartados tecnicos se limitan a lo verificable en las etiquetas y la documentacion del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer TDT (transducer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles con palabras en hebreo romanizado (code-switching) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento
La etiqueta `nemo-conformer-tdt` situa el modelo en la familia Conformer-TDT de NVIDIA NeMo: un encoder Conformer (bloques que intercalan atencion multi-cabeza y convoluciones depthwise) acoplado a un decoder transducer con prediccion conjunta de token y duracion (TDT). Este esquema sustituye la decodificacion autorregresiva clasica de los transducers por una prediccion de duraciones, lo que reduce el numero de pasos de decodificacion y facilita el despliegue en tiempo real. La exportacion a ONNX permite ejecutar el grafo con ONNX Runtime sin dependencia del framework de entrenamiento original.

Segun la model card del proyecto Hebrish, la familia se construye mediante fine-tuning de NVIDIA Parakeet TDT 0.6B v2, un modelo ASR de aproximadamente 600 millones de parametros. Sabich anade, respecto a Jachnun, vocabulario tecnico y cobertura de code-switching, y se actualizo el 21 de octubre de 2026. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni sobre el uso de RLHF, DPO o tecnicas de aumento de datos en la informacion proporcionada. El sufijo "Rolling" en el identificador no se explica en la documentacion disponible.

## Capacidades
- Transcripcion de audio en ingles con palabras en hebreo intercaladas, escribiendo cada palabra hebrea en una unica grafia romanizada.
- Reconocimiento de vocabulario tecnico adicional respecto a Jachnun, segun la model card del proyecto.
- Salida con maquetacion en parrafos, tal como la implementa el servidor de inferencia Hebrish.
- Integracion opcional con el modelo de limpieza S1-mini para posprocesar la transcripcion, segun la documentacion del servidor.
- Desplegable mediante ONNX Runtime al estar exportado a formato ONNX.
- No se ha documentado soporte de tool calling, agentes, vision, audio de entrada mas alla de ASR, ni modo de razonamiento extendido.

## Casos de uso
- Transcripcion de reuniones de equipos mixtos angloparlantes e hispanohablantes de hebreo: el modelo romaniza terminos como "makolet" o "arnona" en una grafia consistente, lo que simplifica la busqueda y el etiquetado posterior en texto latino.
- Subtitulado de contenido audiovisual en ingles con terminologia hebrea: al producir una unica romanizacion por palabra, se evitan variantes ortograficas que romperian la alineacion con glosarios y memorias de traduccion.
- Servidor de dictado autoalojado: el proyecto Hebrish-ASR/Server expone una interfaz web y una API HTTP sobre estos modelos, de modo que Sabich puede desplegarse en infraestructura propia sin enviar audio a terceros.
- Procesamiento por lotes de archivos de audio en pipelines internos: la exportacion ONNX permite integrar el modelo en servicios basados en ONNX Runtime y escalar horizontalmente con contenedores.
- Normalizacion de transcripciones para analitica: la romanizacion uniforme facilita agregar frecuencias de terminos hebreos en corpus de llamadas o entrevistas sin necesidad de un paso adicional de transliteracion.
- Limpieza y formateo de transcripciones: combinado con S1-mini, el flujo del servidor Hebrish puede entregar texto en parrafos listos para publicacion o archivo documental.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- El repositorio ocupa 24,5 GB, lo que incluye los grafos ONNX; la VRAM necesaria para inferencia no esta documentada.
- Al tratarse de un modelo ASR derivado de Parakeet TDT 0.6B v2, es razonable esperar que quepa en GPUs de consumo, pero no se dispone de cifras confirmadas de VRAM ni de latencia.
- GPU recomendadas: no disponible.
- Opciones de despliegue: ONNX Runtime; el proyecto Hebrish-ASR/Server ofrece interfaz web y API HTTP para los modelos Hebrish.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Sabich-Rolling-ONNX | NeMo Conformer TDT | no disponible (base Parakeet 0.6B) | Ingles con hebreo romanizado | no disponible | ONNX |
| Jachnun | Fine-tune de Parakeet TDT 0.6B v2 | ~0,6B | Ingles con hebreo romanizado | no disponible | no disponible |
| NVIDIA Parakeet TDT 0.6B v2 | Conformer TDT | ~0,6B | Ingles | no disponible en la informacion proporcionada | no disponible |

## Limitaciones y advertencias
- El acceso al repositorio esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- No se declara licencia, por lo que no puede confirmarse el uso comercial ni la redistribucion.
- El modelo esta especializado en ingles con inserciones de hebreo romanizado; no debe esperarse buen rendimiento en hebreo nativo escrito en caracteres hebreos ni en otros idiomas.
- La romanizacion impone una unica grafia por palabra hebrea, lo que puede no coincidir con las convenciones del usuario y requerir posprocesado.
- Riesgo de alucinacion y errores en nombres propios, terminos tecnicos poco frecuentes y audio con ruido o acentos marcados, comun en modelos ASR de este tamano.
- No hay model card en el repositorio ni benchmarks publicados, lo que impide validar el rendimiento antes de desplegarlo.
- El sufijo "Rolling" y la diferencia exacta respecto a otras variantes de Sabich no estan documentados.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Hebrish/Sabich-Rolling-ONNX
- Servidor de inferencia Hebrish: https://github.com/Hebrish-ASR/Server
- Model card del proyecto Hebrish: https://hebrish.app/model
