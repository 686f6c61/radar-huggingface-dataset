# filipeacacio/english-phrases-gemma-4-e4b

## Resumen

Este repositorio no contiene un modelo nuevo, sino una copia sin modificaciones de los ficheros `.litertlm` del modelo Gemma 4 E4B publicado por `litert-community`, redistribuidos por el usuario `filipeacacio` para permitir su descarga directa desde la aplicación English Phrases sin pasar por el mecanismo de gate de Hugging Face. El modelo subyacente, Gemma 4 E4B, forma parte de la familia Gemma 4 desarrollada por Google DeepMind.

Gemma 4 es una familia que abarca cinco tamaños (E2B, E4B, 12B, 26B A4B y 31B), con arquitecturas densas y de mezcla de expertos (MoE), una ventana de contexto de hasta 256.000 tokens y soporte multilingüe en más de 140 idiomas según la documentación oficial de Google. La variante E4B se distribuye en formato LiteRT-LM (`.litertlm`), pensado para inferencia en dispositivo (on-device) en CPU y GPU.

Su relevancia actual radica en el despliegue de modelos de lenguaje en el borde (edge): al empaquetarse como artefacto `.litertlm`, el modelo puede ejecutarse localmente sin conexión, algo útil para aplicaciones móviles y sistemas embebidos con requisitos estrictos de privacidad y latencia. El repositorio en sí no añade entrenamiento ni ajuste alguno; es un espejo de descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la familia Gemma 4 combina variantes densas y MoE; no se especifica la de E4B) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256.000 tokens en la familia Gemma 4 (dato de la model card de Google); no confirmado para E4B |
| Tipos de cuantizacion | no disponible (se distribuyen artefactos `.litertlm` precompilados, no pesos sueltos) |
| Idiomas soportados | la familia Gemma 4 declara mas de 140 idiomas; este repositorio no declara campo de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de la variante E4B. La documentacion de Google para la familia Gemma 4 indica que esta combina arquitecturas densas y de mezcla de expertos (MoE), algo coherente con el etiquetado de tamanos E2B, E4B, 12B, 26B A4B y 31B, donde la nomenclatura `A4B` del modelo de 26B sugiere un recuento de parametros activos. No obstante, no se confirma si E4B es denso o MoE, ni su numero de parametros, ni la distribucion de expertos en caso de serlo.

Tampoco se han publicado datos sobre el corpus de entrenamiento (numero de tokens, composicion del dataset) ni sobre las tecnicas de alineacion empleadas (RLHF, DPO u otras). El modelo base es un modelo instruct (sufijo `-it`), por lo que se asume algun tipo de ajuste por instrucciones, pero no hay detalles tecnicos verificables en la informacion proporcionada. Este repositorio concreto no realiza ningun entrenamiento adicional: se limita a redistribuir los ficheros originales, con sus avisos de copyright y licencia intactos.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation` y la libreria de inferencia es LiteRT-LM.
- Inferencia en dispositivo (on-device) y en el borde (edge): el formato `.litertlm` esta disenado para ejecucion local en CPU y GPU.
- Multilingue: la familia Gemma 4 declara soporte en mas de 140 idiomas, si bien este repositorio no especifica idiomas concretos.
- Modalidad de texto: la variante web del artefacto se describe como de texto; no se declara soporte de vision ni de audio para este paquete.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Aplicacion movil English Phrases: el repositorio existe precisamente para suministrar los ficheros `.litertlm` a esta app, de modo que el modelo se pueda descargar e integrar sin el gate de Hugging Face.
- Asistente de frases sin conexion: al ejecutarse en dispositivo, permite generar y sugerir frases en ingles sin enviar datos a un servidor, util en escenarios de movilidad sin cobertura.
- Procesamiento de texto con privacidad estricta: al no requerir red, los datos del usuario permanecen en el dispositivo, lo que encaja en aplicaciones medicas, legales o corporativas con requisitos de confidencialidad.
- Sistemas embebidos y dispositivos de gama baja: el empaquetado LiteRT-LM y la posibilidad de ejecucion en CPU permiten desplegar el modelo en hardware limitado, como placas o terminales industriales.
- Asistencia linguistica local en kioscos o puntos de venta: generacion de respuestas y traduccion basica en terminales fijos sin conexion permanente.
- Prototipado rapido de funciones de generacion de texto en Android o iOS: la integracion mediante LiteRT-LM reduce el trabajo de infraestructura frente a un despliegue en servidor.
- Inferencia de baja latencia en el borde: al eliminar el viaje de ida y vuelta a un servidor remoto, el modelo es adecuado para interacciones que exigen respuesta inmediata.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano de los ficheros: variante nativa `gemma-4-E4B-it.litertlm` de 3.659.530.240 bytes (aproximadamente 3,66 GB) y variante web `gemma-4-E4B-it-web.litertlm` de 2.969.059.328 bytes (aproximadamente 2,97 GB).
- Memoria estimada para inferencia: al menos el tamano del fichero mas el espacio de trabajo del runtime; en torno a 4-5 GB de RAM para la variante nativa y 3-3,5 GB para la variante web (estimacion basada en el tamano de los artefactos, no en datos publicados).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el formato LiteRT-LM esta orientado a ejecucion en dispositivo, y la documentacion de la familia menciona ejecucion en CPU y GPU sin detallar modelos concretos.
- Opciones de despliegue: runtime LiteRT-LM (`library_name: litert-lm`); no se declaran integraciones con vLLM, llama.cpp, Ollama o TGI, dado que el formato `.litertlm` no es un formato de pesos estandar como safetensors o GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Gemma 4 E4B (este repositorio) | no disponible | hasta 256.000 tokens en la familia (no confirmado para E4B) | Apache 2.0 | Hugging Face, formato `.litertlm` | Copia sin modificar del modelo base |
| Gemma 4 E2B | 2,1 mil millones (segun gemma4.dev) | 8.000 tokens (segun gemma4.dev) | Apache 2.0 (familia) | Hugging Face | Variante mas ligera de la familia, texto y CPU |
| Gemma 4 E4B de `litert-community` | no disponible | no disponible | Apache 2.0 | Hugging Face | Modelo base original del que procede este repositorio |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no introduce mejoras: es una copia literal de los ficheros originales, por lo que hereda integramente las limitaciones del modelo Gemma 4 E4B.
- No se dispone de informacion sobre sesgos conocidos ni sobre las tasas de alucinacion de la variante E4B.
- No se declaran los idiomas soportados en este repositorio concreto; el dato de mas de 140 idiomas corresponde a la familia Gemma 4 en su conjunto, no necesariamente a E4B.
- La licencia Apache 2.0 permite uso comercial, pero el aviso de copyright de Gemma 4 E4B (Google LLC) y la licencia original siguen siendo aplicables al tratarse de una redistribucion.
- El formato `.litertlm` esta atado al runtime LiteRT-LM, lo que limita la portabilidad frente a formatos como GGUF o safetensors.
- Al ser artefactos precompilados, no se especifican los niveles de cuantizacion, lo que dificulta evaluar la perdida de calidad respecto al modelo original en precision completa.
- El campo de idiomas del repositorio esta vacio y no se documentan limitaciones de contexto especificas para esta variante.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/filipeacacio/english-phrases-gemma-4-e4b
- Modelo base: https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm
- Modelo hermano (variante E2B del mismo autor): https://huggingface.co/filipeacacio/english-phrases-gemma-4-e2b
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Ficha de Gemma 4 E2B en gemma4.dev: https://gemma4.dev/models/gemma-4-e2b
- Registro en free2aitools: https://free2aitools.com/model/filipeacacio/english-phrases-gemma-4-e2b
