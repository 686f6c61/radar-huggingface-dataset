# skillsafe-ai/whisper-small

## Resumen

`skillsafe-ai/whisper-small` es un repositorio de artefactos ONNX listos para ejecutarse en navegador del modelo de reconocimiento automatico del habla (ASR) Whisper small. Lo publica la organizacion SkillSafe y esta pensado para consumirse desde `transformers.js` (pipeline `automatic-speech-recognition`), es decir, sin backend de inferencia dedicado: el audio se procesa en el propio cliente. No se trata de un modelo entrenado desde cero ni afinado, sino de un import reproducible del modelo `onnx-community/whisper-small`, fijado al commit `36050c46d777d46dc4b5f43f6d90574fc38f8732` y con cada fichero verificado por SHA-256.

La arquitectura es la del Whisper small original: transformer encoder-decoder con modulo convolucional de entrada, 12 capas por lado, dimension oculta 768, 12 cabezas de atencion de 64 dimensiones y vocabulario de 51.865 entradas de tokenizer. Las formas de los tensores declaradas en la verificacion del repositorio confirman una entrada de encoder de 1500 posiciones (`encoder_hidden_states[1, 1500, 768]`), correspondientes a la ventana de audio estandar de Whisper, y un decoder autorregresivo con cache de claves y valores de encoder y decoder.

Su relevancia practica es la del ASR en el navegador con licencia Apache-2.0: transcripcion local, sin enviar audio a un servidor, con tres niveles de precision (fp32, fp16 y q8) para adaptar el coste de memoria al dispositivo. Como contrapartida, el repositorio es muy reciente (creado el 22 de septiembre de 2026) y no registra descargas ni likes, por lo que no existe validacion independiente de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper) con modulo convolucional de entrada; grafo ONNX exportado |
| Parametros totales | No disponible en la ficha. Estimacion derivada del tamano de los pesos fp32 (923,3 MB): entre 230 y 250 millones de parametros |
| Parametros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | No disponible en tokens. Entrada de encoder de 1500 frames mel (ventana de audio estandar de Whisper); ejemplo de decoder con `input_ids` de 4 tokens |
| Tipos de cuantizacion | fp32, fp16 y q8 (ONNX Runtime) |
| Idiomas soportados | No disponibles: la ficha no declara lista de idiomas. El tokenizer tiene 51.865 entradas de vocabulario |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (no hay safetensors ni GGUF). Incluye tokenizer y configuracion en JSON |
| ID del repositorio | skillsafe-ai/whisper-small |
| Autor | skillsafe-ai |
| Pipeline | automatic-speech-recognition |
| Libreria | transformers.js |
| Modelo base | onnx-community/whisper-small (SHA de commit `36050c46d777d46dc4b5f43f6d90574fc38f8732`) |
| Tamano del repositorio | 1,6 GB |
| Fechas | Creado 2026-09-22, actualizado 2026-09-22 |
| Descargas / likes | 0 / 0 |

### Variantes de precision incluidas

| Fichero | Precision | Tamano | SHA-256 (prefijo) |
|---|---|---|---|
| `onnx/decoder_model_merged.onnx` | fp32 | 586,82 MB | `6ed5e35f…` |
| `onnx/decoder_model_merged_fp16.onnx` | fp16 | 294,29 MB | `22aba6c7…` |
| `onnx/decoder_model_merged_quantized.onnx` | q8 | 149,49 MB | `ec07c3cb…` |
| `onnx/encoder_model.onnx` | fp32 y q8 | 336,48 MB | `b37cd662…` |
| `onnx/encoder_model_fp16.onnx` | fp16 | 168,43 MB | `5549cd86…` |
| `tokenizer.json` | bundle | 2,37 MB | `27fc476b…` |
| `preprocessor_config.json`, `generation_config.json`, `config.json` | bundle | < 0,01 MB cada uno | varios |

Los ficheros marcados como `registry` en la model card se sirven desde `models.skillsafe.ai` una vez validados; los marcados como `bundle` viajan dentro de la aplicacion.

## Arquitectura y entrenamiento

El modelo sigue el diseno Whisper: un encoder que recibe el espectrograma mel y lo procesa con dos capas convolucionales (con submuestreo) seguidas de 12 bloques transformer con atencion propia, y un decoder autorregresivo de 12 bloques con atencion propia enmascarada y cross-attention sobre las 1500 posiciones de salida del encoder. Los tensores de verificacion del repositorio lo confirman: `past_key_values.N.encoder.key` y `.value` tienen forma `[1, 12, 1500, 64]` para los 12 niveles (N = 0 a 11), y la salida de logits es `[1, 4, 51865]`, coherente con un vocabulario de 51.865 entradas. El grafo `decoder_model_merged.onnx` unifica los caminos con y sin cache mediante la entrada booleana `use_cache_branch`, de modo que el mismo fichero sirve para prefill y para decodificacion incremental.

No hay informacion sobre entrenamiento en la documentacion proporcionada: el repositorio declara explicitamente que el contenido se importa tal cual desde el upstream ("Imported as published upstream (no conversion)"), sin edicion manual de los pesos. Por tanto no constan tokens de entrenamiento, composicion del dataset, ni fases de RLHF o DPO; toda la receta de entrenamiento corresponde al modelo Whisper small original y a su conversion a ONNX, no a esta publicacion. La innovacion tecnica aportada aqui es de empaquetado y trazabilidad: receta reproducible (`recipes/whisper-small.yaml`, sha256 `d41958ee…`), cadena de herramientas fijada (Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0 en Darwin 25.6.0 arm64), verificacion con `onnx.checker` y una prueba de humo en CPU con entradas a cero para cada grafo ONNX.

## Capacidades

- Reconocimiento automatico del habla: transcripcion de audio a texto con el pipeline `automatic-speech-recognition`.
- Ejecucion integra en el navegador mediante `transformers.js`, con soporte de WebAssembly y, previsiblemente, WebGPU para la variante fp16.
- Tres niveles de precision intercambiables (fp32, fp16, q8) para ajustar memoria y velocidad segun el dispositivo.
- Decodificacion incremental con cache de claves y valores de encoder y decoder, incluida en el grafo unificado.
- Procesamiento de audio por ventanas de 1500 frames mel, la ventana estandar de la familia Whisper.
- Compatibilidad con el tokenizer y la configuracion de preprocesado originales (mel spectrogram), incluidos en el repositorio.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio generativo: es un modelo especializado exclusivamente en voz a texto.
- No se declara una lista de idiomas soportados ni modo de traduccion en la informacion disponible.

## Casos de uso

- Dictado en aplicaciones web: el usuario habla en el navegador y el texto se inserta en el formulario sin que el audio salga del dispositivo, gracias a la ejecucion local en WebAssembly o WebGPU con las variantes fp16 o q8.
- Subtitulado de video en el cliente: se puede transcribir pista de audio por ventanas de 1500 frames para generar subtitulos en un editor web o en un reproductor, sin coste de GPU en servidor.
- Transcripcion de reuniones con requisitos de privacidad: en entornos sanitarios, legales o de recursos humanos, el procesamiento local evita enviar conversaciones a APIs externas, usando fp32 si se prioriza fidelidad sobre memoria.
- Atencion al cliente y analitica de llamadas: transcripcion de grabaciones para clasificacion posterior, busqueda de palabras clave y generacion de resumenes con un modelo de texto aparte, ya que este modelo solo produce transcripcion.
- Accesibilidad: generacion de subtitulos para contenido audiovisual corporativo o educativo en una aplicacion web, aprovechando que el repositorio ya incluye tokenizer y configuracion de preprocesado listos para `transformers.js`.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de notas de voz, podcasts o grabaciones internas para habilitar busqueda de texto completo sobre el contenido hablado.
- Prototipado rapido y demos: al ser un import reproduce del upstream con licencia Apache-2.0 y solo 1,6 GB de repositorio, sirve para validar productos de voz a texto en el navegador antes de invertir en infraestructura de inferencia.
- Notas de voz en aplicaciones moviles o de escritorio basadas en web: con la variante q8 (149,49 MB el decoder) el consumo de memoria es reducido y permite desplegar en dispositivos con recursos limitados.
- Investigacion en ASR multilingue: al conservar el vocabulario de 51.865 entradas, puede emplearse como punto de partida para experimentos de evaluacion de WER, siempre que se valide previamente la lista de idiomas, que no esta documentada en la ficha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta pruebas de humo (`onnx.checker` y una ejecucion en CPU de onnxruntime con entradas a cero para cada grafo ONNX); la tabla de verificacion incluye una columna de milisegundos, pero los valores no se han facilitado en la informacion disponible. No se han publicado cifras de WER, MMLU, HumanEval ni de ningun otro conjunto de evaluacion para este repositorio.

## Requisitos de hardware

- Peso de los pesos por configuracion (suma de ficheros declarados):
  - fp32: 586,82 MB (decoder) + 336,48 MB (encoder) = 923,3 MB; requiere aproximadamente 1 GB de memoria para los pesos, mas activaciones y caches de atencion.
  - fp16: 294,29 MB + 168,43 MB = 462,7 MB; en torno a 0,5-0,7 GB de VRAM.
  - q8: 149,49 MB para el decoder; el encoder cuantizado no se desglosa por separado (el fichero `encoder_model.onnx` esta etiquetado como fp32 y q8 con 336,48 MB). Estimacion conservadora por debajo de 1 GB de memoria total.
- GPU recomendadas: cualquier GPU de consumo reciente es suficiente. Una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 pueden ejecutar las tres variantes con holgura; tambien es viable en iGPU mediante WebGPU. En entornos de servidor, una T4 o una L4 son mas que suficientes y no se justifica el uso de A100 o H100 para este tamano de modelo.
- Cabe en GPU de consumo: si. Tambien cabe en CPU: la variante q8 permite inferencia en CPU moderna e incluso en navegador mediante WebAssembly, que es el escenario objetivo declarado del repositorio.
- Opciones de despliegue: `transformers.js` (pipeline `automatic-speech-recognition`, WASM o WebGPU) y ONNX Runtime, tanto en su variante web como nativa, usando los grafos encoder y decoder separados con decodificacion incremental. No se proporcionan artefactos GGUF, por lo que llama.cpp y Ollama no son aplicables sin una conversion adicional. Tampoco se incluyen pesos en safetensors para vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen de la variante de precision elegida, del backend (WASM frente a WebGPU) y de la duracion del audio.

## Comparativa con modelos similares

Solo se dispone de datos documentados para el repositorio analizado; el resto de campos no aparecen en la informacion proporcionada y se marcan como no disponibles para no inferir cifras.

| Modelo | Parametros | Ventana de audio | Variantes ONNX | Licencia | Disponibilidad en este repositorio |
|---|---|---|---|---|---|
| skillsafe-ai/whisper-small | No disponible (estimacion 230-250 M por tamano de pesos fp32) | 1500 frames mel | fp32, fp16, q8 | Apache-2.0 | Repositorio de 1,6 GB; los ficheros `registry` se sirven desde models.skillsafe.ai |
| onnx-community/whisper-small | No disponible | No disponible | No disponible | No disponible | Es el upstream directo, fijado al commit `36050c46…` |
| openai/whisper-small | No disponible | No disponible | No aplica (pesos PyTorch) | No disponible | Origen de la cadena segun el campo `base_model`, no confirmado de forma explicita en la ficha |
| Alternativas de mayor tamano de la misma familia (por ejemplo, variantes medium o large) | No disponible | No disponible | No disponible | No disponible | No evaluadas en la informacion proporcionada |

En cuanto a las propias variantes de precision del repositorio, la comparacion relevante es de coste, no de calidad: q8 ocupa 149,49 MB el decoder frente a 294,29 MB en fp16 y 586,82 MB en fp32. No hay datos publicados que cuantifiquen la perdida de precision de q8 frente a fp32 en este repositorio concreto.

## Limitaciones y advertencias

- Ausencia total de validacion externa: 0 descargas y 0 likes, con creacion y ultima actualizacion el mismo dia (2026-09-22). No hay evidencia publica de calidad en produccion.
- No hay resultados de benchmarks ni de WER publicados en la informacion disponible, por lo que no se puede comparar su fidelidad de transcripcion con el modelo upstream ni con otras alternativas.
- La ficha no declara lista de idiomas. Aunque el vocabulario de 51.865 entradas es propio de la variante multilingue de Whisper, conviene verificar el comportamiento idioma a idioma antes de desplegar.
- Riesgo de alucinacion caracteristico de la familia Whisper: en silencios, ruido de fondo o audio musical puede generar texto plausible no presente en el audio y bucles de repeticion. Es imprescindible incluir deteccion de silencio y revision en flujos criticos.
- Sensibilidad a ruido, solapamiento de voces, acentos marcados y audio telefónico de banda estrecha; no se documentan ajustes especificos para dominios como medico o legal.
- La ventana de procesamiento es de 1500 frames mel; audios superiores requieren segmentacion y postprocesado para recomponer el texto y gestionar las fronteras entre ventanas.
- La variante q8 reduce el espacio a cambio de una perdida de precision no cuantificada en la ficha; para transcripcion de alta fidelidad conviene partir de fp32 o fp16.
- Dependencia de infraestructura: parte de los ficheros se clasifican como `registry` y se sirven desde `models.skillsafe.ai`, un dominio externo al Hub. Esto condiciona la disponibilidad, el cacheo y las politicas de red en entornos corporativos.
- Inconsistencia menor en la documentacion: la descripcion indica que los artefactos los produce un conversor reproducible de SkillSafe, mientras que la seccion de verificacion afirma "Imported as published upstream (no conversion)". Los SHA-256 y el commit fijado permiten auditar el contenido, pero conviene aclarar el proceso real.
- Ambito funcional limitado: no soporta tool calling, agentes, generacion de texto general, vision ni audio generativo. Cualquier flujo que necesite resumen, traduccion o clasificacion requiere un modelo adicional.
- Licencia Apache-2.0: permite uso comercial y modificacion con obligacion de conservar avisos de licencia y atribucion. Verificar ademas las condiciones del modelo upstream y el cumplimiento de normativa de proteccion de datos al procesar voz de terceros, incluso con procesamiento local.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/skillsafe-ai/whisper-small
- Modelo upstream (commit fijado): https://huggingface.co/onnx-community/whisper-small/tree/36050c46d777d46dc4b5f43f6d90574fc38f8732
- Modelo upstream (rama principal): https://huggingface.co/onnx-community/whisper-small
- Repositorio del conversor y las recetas de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Servidor de artefactos `registry`: models.skillsafe.ai
- La busqueda web realizada no ha devuelto resultados tecnicos relevantes sobre este modelo: los enlaces obtenidos corresponden a sitios de efemerides y no guardan relacion con el repositorio, por lo que no se incluyen.
