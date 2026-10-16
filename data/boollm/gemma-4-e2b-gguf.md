# Boollm/Gemma-4-E2B-GGUF

## Resumen

Boollm/Gemma-4-E2B-GGUF es un ajuste fino (fine-tune) del modelo Google Gemma 4 E2B IT, publicado por el usuario Boollm y empaquetado en formato GGUF para su uso con llama.cpp y runtimes compatibles. No se trata de un entrenamiento desde cero: el autor aplica un LoRA sobre el decoder del modelo base, fusiona los pesos y exporta el resultado junto con un companion multimodal (mmproj) en cuantizacion Q8_0. El modelo cuenta con aproximadamente 4.650 millones de parametros en total y una licencia Apache 2.0.

La propuesta de valor es el despliegue en dispositivo (on-device): el paquete principal Q4_K_M ocupa 3,43 GB y el companion multimodal Q8_0 557 MB, lo que permite ejecutar el modelo en telefonos y equipos de consumo sin conexion. El autor lo ha probado en un iPhone 16 Pro y en macOS, con llama.cpp build b10516, y exige la plantilla de chat de Gemma 4 (no ChatML) para evitar respuestas malformadas.

El modelo esta orientado a texto conversacional y a tareas cotidianas dentro de una aplicacion anfitriona que aporte herramientas, permisos y flujos de confirmacion. Sus capacidades de OCR, busqueda web, recordatorios, calendario, documentos, voz o generacion de imagenes son funciones de la app, no del modelo. La relevancia actual reside en su tamano reducido, su licencia permisiva y su integracion con ecosistemas GGUF, aunque la informacion publicada no documenta longitud de contexto ni benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (hereda del modelo base google/gemma-4-E2B-it); no se detalla si es denso o MoE |
| Parametros totales | 4.647.450.147 (aproximadamente 4,65 mil millones, dato de safetensors) |
| Parametros activos | no disponible (la nomenclatura E2B del modelo base sugiere parametros efectivos reducidos, pero la informacion proporcionada no confirma arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo principal), Q8_0 (companion multimodal mmproj) |
| Idiomas soportados | en (ingles, segun los metadatos del repositorio); no se documentan otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (incluye tokenizer y ficheros de configuracion en el ZIP) |

Datos adicionales del empaquetado:

| Fichero | Tamano |
|---|---|
| Boollm-Gemma-4-E2B-v1-candidate.zip | 4.017.499.843 bytes (aproximadamente 4,02 GB) |
| Gemma-4-E2B-Boollm-Q4_K_M.gguf | 3.427.880.352 bytes |
| mmproj-Gemma-4-E2B-Boollm-Q8_0.gguf | 557.368.064 bytes |
| Tamano total del repositorio | 8,0 GB |

## Arquitectura y entrenamiento

El modelo parte de la revision `3e22461f65e89153144f8adb70e3b8c2cc9845a7` de Google Gemma 4 E2B IT. Sobre ella se aplica un fine-tune LoRA de una sola pasada sobre el decoder, con 8.892 ejemplos/pasos de entrenamiento y 350 ejemplos de validacion, cubriendo 36 grupos de caracteristicas de Boollm. Los datos empleados consisten en ejemplos auditados del proyecto y objetivos sinteticos abiertos de Qwen; el autor declara explicitamente que no se anadieron documentos ni conversaciones privadas del propietario, ni salidas de modelos cerrados. Los encoders de imagen y audio originales se conservaron intactos, lo que explica la presencia del companion multimodal.

La fusion LoRA se realizo con el procedimiento canonico de MLX y se verifico tensor a tensor: 205 tensores modificados y 1.806 sin modificar fueron comprobados, seguidos de pruebas de humo de generacion de texto en runtime. Es importante senalar que el ZIP publicado es un formato de empaquetado, no un fichero cargable directamente por un runtime: debe extraerse antes de su uso, y el modelo principal se emplea para texto mientras que el companion mmproj requiere un runtime multimodal compatible. El chat template debe ser el de Gemma 4; el autor advierte que la build de desarrollo 159 de Boollm incorpora la correccion del formato de prompt, y que builds anteriores pueden generar respuestas malformadas.

No se documentan en la informacion disponible detalles sobre la composicion completa del dataset, la longitud de contexto nativa del modelo base, ni fases adicionales de RLHF o DPO mas alla del ajuste LoRA descrito.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat especifica de Gemma 4.
- Razonamiento basico y tareas cotidianas de asistente (resumen breve, saludos, aritmetica sencilla) verificadas en simulador movil y Mac.
- Aritmetica y matematicas elementales: en la comparacion de 20 casos obtuvo 4/6 respuestas numericas claramente correctas.
- Generacion de codigo basica: 2/4 en pruebas con casos limite ejecutables y mutacion de entradas.
- Seguimiento de historial proporcionado: 4/4 en la prueba de follow-ups con contexto suministrado.
- Capacidades multimodales potenciales a traves del companion `mmproj-Gemma-4-E2B-Boollm-Q8_0.gguf`, ya que los encoders de imagen y audio originales se conservaron; el autor no ha realizado una evaluacion semantica amplia de imagen y audio.
- Tool calling y ejecucion de agentes: no disponible como capacidad de los pesos. El modelo card indica que OCR, busqueda web, recordatorios, calendario, gestion de documentos, voz y generacion de imagenes son funciones de la aplicacion anfitriona, que debe aportar herramientas, permisos, grounding y flujos de confirmacion.
- Capacidades multilingues: no disponibles; los metadatos solo declaran ingles.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional offline en movil: con 3,43 GB en Q4_K_M, el modelo puede ejecutarse localmente en un iPhone 16 Pro (probado por el autor) o en dispositivos equivalentes, ofreciendo chat en ingles sin conexion ni coste por token.
- Borradores de recordatorios y notas: el model card confirma que las comprobaciones de borrador de recordatorios pasaron en simulador; el modelo generaria el texto y la app anfitriona gestionaria la creacion efectiva del recordatorio y sus permisos.
- Resumen corto de documentos o mensajes: las pruebas de resumen breve pasaron tras la correccion de plantilla, lo que lo hace apto para condensar textos de entrada dentro de una app de notas o correo.
- Extraccion de texto e informacion a partir de imagenes: combinando el modelo principal con el companion multimodal Q8_0 en un runtime compatible, se puede integrar en flujos de digitalizacion de documentos o captura de recibos, siempre que la app valide el resultado.
- Soporte a la programacion con supervision humana: dada su puntuacion de 2/4 en pruebas de codigo con casos limite y sus fallos conocidos en funciones factoriales y manejo de intervalos, es adecuado como asistente de sugerencias, nunca como generador de codigo sin revision.
- Clasificacion y respuesta a instrucciones dentro de pipelines de texto en ingles: al ser un modelo pequeno y con licencia Apache 2.0, puede desplegarse en servidores modestos para tareas de etiquetado, respuesta a preguntas simples o normalizacion de texto.
- Prototipado rapido de asistentes de voz o dispositivos embebidos: el formato GGUF y las cuantizaciones disponibles permiten integrarlo con llama.cpp en hardware limitado, usando el componente de voz de la aplicacion anfitriona.
- Evaluacion comparativa de fine-tunes pequenos en investigacion: sirve como referencia reproducible de un ajuste LoRA fusionado y empaquetado, con verificacion tensor a tensor documentada.

## Benchmarks y rendimiento

El autor publica dos evaluaciones, ambas internas y de alcance limitado. No son benchmarks estandar publicos.

Evaluacion mecanica de 96 casos (expectativas concretas, no calidad ni seguridad general):

| Modelo | Puntuacion |
|---|---|
| Boollm Gemma 4 E2B (tras tuning) | 87/96 |
| Base google/gemma-4-E2B-it | 70/96 |

Comparacion de 20 casos en Mac frente a Boollm Qwen3.5 4B v2:

| Area | Boollm Gemma 4 E2B | Boollm Qwen3.5 4B v2 |
|---|---|---|
| Codigo (casos limite ejecutables y mutacion de entradas) | 2/4 | 2/4 |
| Matematicas (respuesta numerica correcta) | 4/6 | 4/6 |
| Matematicas (formato estricto de respuesta) | 4/6 | 2/6 |
| Tareas cotidianas | 4 correctas / 2 fallos | 5 correctas / 1 parcial |
| Follow-ups con historial suministrado | 4/4 | 4/4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica ademas que las latencias medidas en Mac con prompts cortos y cache caliente no son extrapolables al rendimiento en iPhone, y que no se han medido sistematicamente latencia, comportamiento termico sostenido ni memoria en dispositivo fisico.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 3,5 GB solo de pesos; con cache KV y overhead del runtime, un presupuesto practico de 5-6 GB es razonable para contextos moderados (estimacion a partir de los tamanos de fichero, no una cifra publicada por el autor).
- Companion multimodal: anade 557 MB en Q8_0 si se usa la ruta de imagen/audio.
- GPU de consumo compatibles: tarjetas con 6-8 GB o mas de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060, RTX 4070) pueden alojar el modelo en Q4_K_M. En GPUs de 8 GB conviene vigilar el contexto.
- GPU de gama alta: A100, H100 o RTX 4090 ejecutan el modelo con enorme holgura; estan sobredimensionadas para este tamano y solo tienen sentido para servir muchas peticiones concurrentes.
- Apple Silicon: el modelo esta probado en un iPhone 16 Pro y en Mac, con llama.cpp b10516; es esperable que funcione en equipos con memoria unificada de 8 GB o superior, aunque el autor no publica cifras de rendimiento sostenido.
- Opciones de despliegue: llama.cpp (b10516 probado), runtimes compatibles con GGUF como Ollama o LM Studio, y cualquier interfaz que respete la plantilla de chat de Gemma 4. vLLM y TGI no estan confirmados para este paquete en la informacion disponible; vLLM tiene soporte GGUF experimental, pero no hay validacion publicada aqui.
- Latencia y throughput: no disponibles. El autor solo afirma que las mediciones de Mac no representan el rendimiento en iPhone y que el comportamiento termico y de memoria en dispositivo fisico no se ha medido.
- Requisito de empaquetado: el ZIP no es cargable directamente; hay que extraerlo antes de usar los GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Boollm/Gemma-4-E2B-GGUF | 4,65 B totales | no disponible | 87/96 en evaluacion mecanica interna; 2/4 codigo, 4/6 matematicas | apache-2.0 | GGUF en HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| google/gemma-4-E2B-it (base) | no disponible en la informacion proporcionada | no disponible | 70/96 en la misma evaluacion mecanica interna | no disponible en la informacion proporcionada | HuggingFace (modelo base oficial) |
| Boollm Qwen3.5 4B v2 | 4 B (segun denominacion) | no disponible | 2/4 codigo, 4/6 matematicas, 5 correctas y 1 parcial en tareas cotidianas | no disponible | Distribuido por Boollm, citado como comparacion en el model card |

No se dispone de datos suficientes para comparar con otras alternativas de la misma categoria (por ejemplo, otros modelos de aproximadamente 4 B en GGUF), ya que la busqueda web realizada no devolvio resultados tecnicos relevantes.

## Limitaciones y advertencias

- Fallos documentados por el autor: generacion de funciones factoriales, manejo de intervalos en codigo, aritmetica y seguimiento de instrucciones incrustadas dentro de texto citado.
- Riesgo de inyeccion de prompt: el propio autor recomienda tratar cualquier texto externo como no fiable y validar las llamadas a herramientas de forma independiente.
- Alucinacion: las respuestas de investigacion y factuales requieren verificacion de fuentes segun el model card.
- Idiomas: solo se declara ingles; no hay evidencia publicada de rendimiento en castellano u otros idiomas.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar aplicaciones con ventanas largas sin pruebas previas.
- Alcance de los pesos: el modelo no proporciona acceso a internet ni ejecuta acciones en el dispositivo. OCR, busqueda web, recordatorios, calendario, documentos, voz y generacion de imagenes dependen de la aplicacion anfitriona, que debe aportar herramientas, permisos, grounding y confirmacion.
- Resultados de acciones nativas: el autor advierte que dependen de la logica de la app y no constituyen evidencia de ejecucion autonoma de herramientas por parte del modelo. En un caso de prueba, un parser de calendario uso 60 minutos en lugar de los 30 solicitados.
- Evaluacion limitada: la prueba de 96 casos es mecanica y no mide calidad general ni seguridad. La comparacion de 20 casos es reducida y solo frente a un modelo del mismo autor.
- Pruebas incompletas: latencia en iPhone fisico, memoria y comportamiento termico sostenido, y control de calidad semantico amplio de imagen y audio no han sido medidos sistematicamente.
- Compatibilidad de runtime: requiere la plantilla de chat de Gemma 4 (no ChatML) y, segun el autor, la build 159 o posterior de Boollm; builds anteriores pueden producir respuestas malformadas.
- Licencia: Apache 2.0 permite uso comercial, pero el autor remite a LICENSE.txt, NOTICE.txt y BASE_MODEL_CARD.md para la atribucion del modelo base; conviene revisar los terminos de uso de Google Gemma 4 E2B IT antes de explotarlo comercialmente, ya que no se detallan en la informacion proporcionada.
- Madurez: el repositorio no tiene descargas ni likes en el momento de la consulta, y el autor indica que la publicacion esta aprobada por el propietario pero no implica que todas las pruebas de dispositivo y multimodalidad esten completas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Boollm/Gemma-4-E2B-GGUF
- Descarga del paquete completo: https://huggingface.co/Boollm/Gemma-4-E2B-GGUF/resolve/main/Boollm-Gemma-4-E2B-v1-candidate.zip?download=true
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it

La busqueda web realizada no devolvio resultados tecnicos relevantes (unicamente paginas de Instagram sin relacion con el modelo), por lo que no hay enlaces adicionales a papers, blogs o repositorios que se puedan incluir.
