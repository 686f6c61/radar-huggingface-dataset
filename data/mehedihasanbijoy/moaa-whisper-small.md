# mehedihasanbijoy/MoAA-whisper-small

## Resumen

MoAA (Mixture of Accent Adapters) es un sistema de reconocimiento automático del habla en inglés construido sobre `openai/whisper-small`, desarrollado por el usuario de HuggingFace mehedihasanbijoy. Su propuesta consiste en congelar por completo el encoder y el decoder de Whisper-small e insertar un conjunto de adaptadores ligeros especializados en acentos, combinados mediante un router a nivel de utterance. El objetivo es mejorar la transcripción de habla acentuada sin reentrenar el modelo base, reduciendo el coste computacional y el riesgo de olvido catastrófico.

El modelo se publica en dos variantes dentro del mismo repositorio: `linear_proj_A20`, con 20 adaptadores, y `linear_proj_A5`, con 5 adaptadores y proyección lineal. La variante de 5 adaptadores obtiene el mejor WER de desarrollo (11,73 %) frente a la de 20 (13,26 %), medido sobre un subconjunto reservado de 1.000 utterances con texto en minúsculas sin normalizar. Se acompaña de DHF (Deterministic Hallucination Filter), un filtro determinista basado en reglas que elimina repeticiones y bucles en la salida.

Es relevante ahora porque aborda un problema práctico y poco resuelto en ASR: la degradación del reconocimiento ante acentos no vistos durante el preentrenamiento. El enfoque de mezcla de adaptadores con cabezas multi-tarea (acentuado/no acentuado, identificación de acento y una cabeza de género adversarial) permite estudiar la separación entre información lingüística y factores del hablante. No obstante, es un artefacto de investigación: requiere un paquete propio, no es un checkpoint estándar de `WhisperForConditionalGeneration` y su licencia restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer de Whisper-small congelado mas modulos MoAA (mezcla de adaptadores de acento con router a nivel de utterance y cabezas multi-tarea) |
| Parametros totales | No disponible (modelo base: `openai/whisper-small`; el numero de parametros anadidos por los adaptadores no se especifica en la informacion proporcionada) |
| Parametros activos | No disponible (el router combina adaptadores por utterance, pero no se publica el recuento de parametros activos) |
| Longitud de contexto | Ventana de audio de hasta 30 s por llamada de decodificacion; salida limitada a 225 tokens en el ejemplo de uso |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `moaa-research` (license: other). Uso previsto: investigacion no comercial. Codigo acompañante: MIT. Sujeto ademas a las licencias de AESRC 2020, LibriSpeech y Whisper (MIT) |
| Formato de pesos | safetensors (requiere el paquete `moaa` del repositorio de GitHub para cargarse) |

Otros datos del repositorio: 2,3 GB de tamano total, 0 descargas y 0 likes, creado y actualizado el 17 de septiembre de 2026.

## Arquitectura y entrenamiento

La arquitectura parte de Whisper-small con encoder y decoder completamente congelados. Los unicos modulos entrenados son los modulos MoAA y la proyeccion de salida desacoplada (`proj_out`) de Whisper. Un router a nivel de utterance mezcla los adaptadores de acento, de forma que cada frase se procesa con una combinacion distinta en lugar de con un adaptador fijo. Sobre esa representacion se apoyan tres cabezas multi-tarea: clasificacion acentuado frente a no acentuado, identificacion de acento sobre los 10 acentos de AESRC y una cabeza de genero situada detras de una capa de inversion de gradiente.

Los datos de entrenamiento combinan AESRC 2020 (10 acentos, 172.607 utterances) y LibriSpeech train-clean-100 (28.539 utterances), con una particion 90/10 y semilla 42. La funcion de perdida suma los terminos de ASR, acentuado, 2 x acento y genero invertido. El entrenamiento uso AdamW con learning rate 5e-4, 10 epocas, tamano de lote 16 y precision fp16 sobre una unica GPU V100. Como innovacion practica adicional, el autor incluye DHF, un filtro determinista sin referencia que elimina artefactos de repeticion y bucle en la transcripcion generada.

## Capacidades

- Reconocimiento automatico del habla en ingles sobre audio de hasta 30 segundos por ventana, con decodificacion greedy.
- Transcripcion de habla acentuada: el modelo se entrena especificamente sobre los 10 acentos de AESRC 2020.
- Clasificacion binaria acentuado / no acentuado como tarea auxiliar.
- Identificacion de acento entre las 10 clases de AESRC.
- Cabeza de genero adversarial: entrena para ser no informativa y no debe emplearse para predecir genero.
- Post-procesado de transcripciones con DHF para eliminar bucles y repeticiones.
- Dos configuraciones intercambiables de mezcla: `linear_proj_A20` (20 adaptadores) y `linear_proj_A5` (5 adaptadores).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio generation.
- No hay capacidades multilingues: el modelo es exclusivamente en ingles.

## Casos de uso

- Transcripcion de centros de atencion al cliente: el modelo puede procesar grabaciones de operadores y clientes con acentos diversos dentro de la ventana de 30 s, usando el router para adaptar la mezcla de adaptadores a cada utterance y DHF para evitar transcripciones repetidas en llamadas con silencios o ruido.
- Subtitulado y post-produccion de audio en ingles: la salida de Whisper-small con adaptadores de acento reduce errores en contenido hablado por locutores no nativos, y DHF limpia los bucles tipicos que aparecen en pasajes musicales o silencios largos.
- Investigacion sobre adaptacion eficiente de modelos ASR: sirve como banco de pruebas para comparar mezcla de adaptadores frente a fine-tuning completo, ya que solo se entrenan los modulos MoAA y `proj_out` sobre un backbone congelado.
- Estudios de robustez y equidad en ASR: las cabezas de acento y la cabeza adversarial de genero permiten analizar cuanto del error de transcripcion se correlaciona con el acento y con el hablante.
- Preprocesado de corpus de habla: transcripcion a escala de conjuntos con acentos marcados para generar transcripciones iniciales que despues se corrigen manualmente.
- Evaluacion comparativa de filtros anti-alucinacion: DHF puede aplicarse como paso posterior a otros sistemas ASR, y este repositorio proporciona un punto de referencia para medir su efecto en WER y en tasa de repeticiones.
- Demostraciones y prototipos de investigacion: el Space `MoAA-DHF-demo` permite probar el pipeline completo sin montar infraestructura propia, siempre con audio en ingles de menos de 30 s.

## Benchmarks y rendimiento

Unicos resultados publicados en la informacion disponible: WER de desarrollo sobre un subconjunto reservado de 1.000 utterances, con texto en minusculas sin normalizar.

| Subcarpeta | Numero de adaptadores | Proyeccion lineal | WER dev (%) |
|---|---|---|---|
| `linear_proj_A20` | 20 | Si | 13,26 |
| `linear_proj_A5` | 5 | Si | 11,73 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar, ni comparaciones con WER de sistemas alternativos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Al tratarse de un backbone Whisper-small (aproximadamente 2,3 GB de repositorio entre las dos variantes) mas adaptadores ligeros, el consumo en fp16 se situa en el rango de pocos GB, pero el dato no esta confirmado por el autor.
- GPU recomendadas: el autor entreno con una unica V100 en fp16, lo que indica que cualquier GPU con al menos 16 GB es suficiente para entrenamiento de los adaptadores. Para inferencia, una GPU consumer moderna es suficiente en principio.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base, aunque no se publican medidas de VRAM especificas. El ejemplo de la model card usa CPU o GPU indiferentemente con `torch.no_grad()`.
- Opciones de despliegue: `transformers` con el paquete `moaa` descargado del repositorio de GitHub, mediante `load_moaa_checkpoint` y `WhisperProcessor`. No es compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa, porque no es un checkpoint `WhisperForConditionalGeneration` estandar.
- Latencia y throughput: no disponible. La decodificacion es greedy y la longitud de audio por llamada esta limitada a 30 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoAA-whisper-small (`linear_proj_A5` / `A20`) | No disponible (base `openai/whisper-small`) | 30 s por llamada | Ingles | `moaa-research`, solo investigacion no comercial | HuggingFace, requiere paquete `moaa` |
| `openai/whisper-small` | No disponible en la informacion proporcionada (modelo base) | 30 s por llamada | Multilingue | MIT | HuggingFace, `transformers` estandar |
| `openai/whisper-small.en` | No disponible en la informacion proporcionada | 30 s por llamada | Ingles | MIT | HuggingFace, `transformers` estandar |
| `openai/whisper-large-v3` | No disponible en la informacion proporcionada | 30 s por llamada | Multilingue | MIT | HuggingFace, `transformers` estandar |

No se dispone de cifras de WER comparativas entre MoAA y estos modelos en la informacion proporcionada; la unica metrica publicada es el WER de desarrollo interno sobre el subconjunto reservado de 1.000 utterances.

## Limitaciones y advertencias

- Solo ingles: no admite otros idiomas.
- Ventana maxima de 30 s por llamada de decodificacion y decodificacion greedy, sin opciones de beam search documentadas.
- La identificacion de acento cubre unicamente los 10 acentos de AESRC 2020; cualquier otro acento se mapea al mas cercano, lo que puede producir etiquetas incorrectas.
- La cabeza de genero es adversarial y se entrena deliberadamente para no ser informativa: no debe usarse para predecir genero. Hacerlo produciria resultados sin validez.
- Riesgo de alucinacion y de bucles de repeticion en la salida. DHF mitiga el problema, pero es un filtro basado en reglas y no elimina todas las alucinaciones.
- Licencia `moaa-research`: uso previsto exclusivamente de investigacion no comercial. Los pesos estan ademas sujetos a las condiciones de AESRC 2020 (licencia restringida), LibriSpeech y la licencia MIT de Whisper, por lo que el uso comercial requiere revisar todas ellas.
- Dependencia de codigo externo: no funciona como un checkpoint estandar de `transformers`; requiere instalar el paquete `moaa` desde el repositorio de GitHub del autor, lo que anade riesgo de mantenimiento.
- Modelo sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de los resultados.
- No hay publicacion cientifica asociada: el bloque de cita BibTeX de la model card tiene todos los campos como `TODO`, por lo que no existe referencia revisada por pares.
- El rendimiento declarado se mide sobre un subconjunto de 1.000 utterances con texto en minusculas sin normalizar, lo que no es directamente comparable con WER de referencia de LibriSpeech u otros corpus estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mehedihasanbijoy/MoAA-whisper-small
- Repositorio de codigo: https://github.com/mehedihasanbijoy/Mixture-of-Accent-Adapters
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/mehedihasanbijoy/MoAA-DHF-demo
- Modelo base: https://huggingface.co/openai/whisper-small
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los de la model card y el repositorio del autor.
