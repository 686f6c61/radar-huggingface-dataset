# csabag76/gemma-4-E2B-it-abliterated-litert-lm

## Resumen

Gemma 4 E2B abliterated es una variante del modelo multimodal Gemma 4 E2B de Google, publicada por el usuario csabag76, en la que se ha reducido el comportamiento de rechazo (refusal) mediante una tecnica de abliteration aplicada directamente sobre los pesos cuantizados del decoder de texto. El modelo se distribuye como un unico fichero `.litertlm` de 2,59 GB, pensado para ejecutarse en el runtime LiteRT-LM en dispositivos iOS y Android, sin conexion a red.

La relevancia de esta variante es doble: por un lado, conserva intactos el encoder de vision, el encoder de audio, el drafter MTP (multi-token prediction) para decodificacion especulativa, el tokenizer y la plantilla de chat del modelo original de litert-community; por otro, reduce los rechazos en casos de uso de supervivencia y preparacionismo, donde el modelo original declinaba responder a preguntas operativas ordinarias. Segun la model card, los rechazos en 30 casos limite de supervivencia bajan de 17/30 a aproximadamente 1/30.

El modelo esta pensado para despliegue on-device y no como modelo de servidor. Su tamano (2,6 GB) y su cuantizacion int4/int2 lo situan en la categoria de modelos pequenos para movil, con una velocidad medida de 23 a 31 tokens por segundo en la GPU de un iPhone 15 con decodificacion especulativa activada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, vision y audio) con decodificacion especulativa MTP; pesos cuantizados de forma mixta (int4, int2 e int8) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 en `o_proj` (35 capas) y `down_proj` (capas 0-14); int2 en `down_proj` de capas 15-34; int8 en las proyecciones de embedding por capa |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (sujeta ademas a la Prohibited Use Policy de Gemma) |
| Formato de pesos | `.litertlm` (LiteRT-LM), fichero unico de 2,59 GB |

## Arquitectura y entrenamiento

La arquitectura base es Gemma 4 E2B, un transformer multimodal que procesa texto, imagen y audio. El paquete `.litertlm` incluye el decoder de texto cuantizado, el encoder de vision, el encoder de audio, un drafter MTP para decodificacion especulativa, el tokenizer y la plantilla de chat. La modificacion de esta variante afecta exclusivamente a los pesos del decoder de texto dentro de `prefill_decode`; el resto de componentes es byte a byte identico al modelo `litert-community/gemma-4-E2B-it-litert-lm`.

El proceso de abliteration sigue el metodo in-place de oknyshuk para E4B. Primero se calculan direcciones de rechazo por capa a partir de `google/gemma-4-E2B-it-qat-q4_0-unquantized`, usando la diferencia de medias de los residuales del ultimo token sobre 256 prompts daninos y 256 inofensivos, con winsorizacion y biproyeccion contra la media de los inofensivos. Despues se parchea el `.litertlm` original: los pesos int4 de `o_proj` (todas las capas) y `down_proj` (capas 0-14) se desquantizan, se les aplica la biproyeccion preservando la norma y se requantizan sobre las escalas por canal congeladas usando realimentacion de error direccional, de modo que la edicion sobreviva a la cuantizacion int4. Segun la model card, cambia aproximadamente un 3-4 % de los codigos int4. Las capas de doble anchura (15-34, con `down_proj` en int2) y las proyecciones de embedding int8 se dejan deliberadamente sin editar porque hacerlo eliminaba mas rechazos pero degradaba la calidad de las respuestas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo Gemma 4 E2B instruct.
- Entrada multimodal de imagen: descripcion de fotografias verificada por el autor.
- Entrada multimodal de audio: transcripcion de voz exacta a nivel de palabra, verificada por el autor.
- Decodificacion especulativa mediante drafter MTP, que acelera la generacion en dispositivos compatibles.
- Comportamiento de rechazo reducido: responde a peticiones operativas que el modelo original declina.
- Ejecucion totalmente offline en iOS y Android mediante LiteRT-LM.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de supervivencia y preparacionismo offline: el modelo responde a preguntas practicas como el despiece de un animal, el almacenamiento de combustible, la sutura de heridas o la fabricacion de trampas, que el modelo original rechazaba. Es el caso de uso declarado por el autor y el que motivo la abliteration.
- Primeros auxilios en campo sin cobertura: con el encoder de vision intacto, el usuario puede fotografiar una lesion o un equipo y pedir orientacion; el modelo funciona sin red en el movil, lo que resulta adecuado en entornos remotos.
- Transcripcion de audio en movil: el encoder de audio permite dictar notas de campo o instrucciones y obtener transcripciones exactas a nivel de palabra sin enviar datos a la nube.
- Descripcion de imagenes para accesibilidad: el modelo puede describir fotografias capturadas con la camara del dispositivo, util para personas con discapacidad visual en contextos sin conectividad.
- Formacion y simulacros: el modelo puede generar escenarios de emergencia y procedimientos paso a paso en un dispositivo, sin depender de servicios externos y sin coste por token.
- Prototipado de aplicaciones moviles con IA generativa: desarrolladores que quieran integrar un modelo multimodal pequeno en apps iOS o Android mediante LiteRT-LM pueden usar este paquete como sustituto del modelo original cuando necesiten menos restricciones de contenido.
- Evaluacion de tecnicas de abliteration: investigadores interesados en el efecto de la edicion de pesos sobre modelos cuantizados pueden reproducir el metodo y comparar con las metricas publicadas por el autor.

## Benchmarks y rendimiento

| Metrica | Gemma 4 E2B original | Este modelo |
|---|---|---|
| Rechazos en 30 casos limite de supervivencia y preparacionismo | 17 / 30 | ~1 / 30 |
| Rechazos en 104 prompts daninos genericos retenidos (split de test de mlabonne) | 101 / 104 | 28 / 104 |
| Calidad de respuestas de supervivencia frente al original (190 preguntas, escala 1-5) | referencia | -0,14 (IC 95 %: -0,25 a -0,04) |
| Velocidad de decodificacion en iPhone 15 con GPU y MTP | no disponible | ~23-31 tok/s |

Las metricas de rechazo y calidad fueron evaluadas a ciegas con LiteRT-LM 0.18.1, segun la model card. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo esta empaquetado para ejecucion on-device con un fichero de 2,59 GB, por lo que necesita al menos ese espacio de almacenamiento y memoria unificada disponible en el dispositivo.
- GPU recomendadas: GPU integrada de moviles de gama alta; el autor reporta 23-31 tok/s en la GPU de un iPhone 15. No se dispone de datos para Android ni para GPU de escritorio.
- Compatibilidad con GPU de consumo: no disponible; el formato `.litertlm` esta orientado a LiteRT-LM en iOS y Android, no a CUDA.
- Opciones de despliegue: runtime LiteRT-LM (CLI mediante `uvx --from litert-lm litert-lm run`, y APIs nativas en Swift y Kotlin). Los backends de vision y audio se ejecutan en CPU segun la model card.
- Latencia y throughput: decodificacion de 23 a 31 tok/s en iPhone 15 con decodificacion especulativa MTP activada; sin datos de latencia de prefill ni de throughput en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| csabag76/gemma-4-E2B-it-abliterated-litert-lm | no disponible | no disponible | `.litertlm` | Apache-2.0 | Variante abliterated on-device; rechazos reducidos; vision, audio y MTP intactos |
| litert-community/gemma-4-E2B-it-litert-lm | no disponible | no disponible | `.litertlm` | Apache-2.0 | Modelo original de referencia, mismo tamano y velocidad; rechaza mas peticiones |
| olekk/gemma-4-E4B-it-abliterated-litert-lm | no disponible | no disponible | `.litertlm` | Apache-2.0 | Variante abliterated del modelo E4B, de mayor tamano; origen del metodo in-place |
| google/gemma-4-E2B-it | no disponible | no disponible | safetensors y variantes QAT | Gemma (uso sujeto a politica) | Modelo base instruct sin empaquetar para LiteRT-LM |

No se dispone de datos de benchmarks estandar ni de contexto para establecer una comparacion cuantitativa adicional con modelos de otros fabricantes.

## Limitaciones y advertencias

- El comportamiento de rechazo esta reducido de forma deliberada: el modelo puede producir contenido danino, inexacto o peligroso. No sustituye a profesionales medicos, legales o de seguridad.
- La abliteration es moderada: segun el autor, todavia declina una parte de las peticiones daninas genericas (28 de 104 en el conjunto de prueba), por lo que el comportamiento no es uniforme.
- La calidad de las respuestas de supervivencia baja una media de 0,14 puntos sobre 5 frente al modelo original, con un intervalo de confianza que no incluye el cero; la degradacion es pequena pero medible.
- Los modelos pequenos cometen errores facticos: el autor advierte explicitamente de que hay que verificar dosis, temperaturas y procedimientos.
- No hay informacion publicada sobre sesgos, cobertura idiomatica ni longitud de contexto, lo que limita la evaluacion para usos distintos del caso declarado.
- La licencia es Apache-2.0, pero se aplica la Prohibited Use Policy de Gemma de Google, que restringe determinados usos comerciales y de despliegue.
- El formato `.litertlm` esta ligado al runtime LiteRT-LM en iOS y Android; no es directamente utilizable en vLLM, llama.cpp, Ollama ni TGI.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia; no hay validacion independiente de las metricas reportadas.
- No se dispone de informacion sobre el proceso de entrenamiento del modelo base ni sobre posibles riesgos de memorizacion de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/csabag76/gemma-4-E2B-it-abliterated-litert-lm
- Modelo base instruct: https://huggingface.co/google/gemma-4-E2B-it
- Modelo base empaquetado para LiteRT-LM: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Variante E4B abliterated de referencia: https://huggingface.co/olekk/gemma-4-E4B-it-abliterated-litert-lm
- Metodo in-place de oknyshuk: https://codeberg.org/oknyshuk/gemma4-e4b-abliterated
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
