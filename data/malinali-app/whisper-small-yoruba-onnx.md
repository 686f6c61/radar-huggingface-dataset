# malinali-app/whisper-small-yoruba-onnx

## Resumen

El modelo `malinali-app/whisper-small-yoruba-onnx` es un paquete de reconocimiento automatico del habla (ASR) exportado a formato ONNX a partir del fine-tune `LyngualLabs/whisper-small-yoruba`. Lo publica el proyecto Malinali, una aplicacion de traduccion y reconocimiento de voz sin conexion (offline), con el objetivo de ofrecer transcripcion en dispositivo de conversaciones que alternan entre yoruba e ingles (code-switching). No es un modelo entrenado desde cero, sino una conversion de pesos ya ajustados al grafo optimizado que consume el runtime sherpa-onnx.

La base es la arquitectura Whisper-small de OpenAI, un transformer encoder-decoder orientado a tareas de voz, aqui cuantizado a int8 en las operaciones MatMul para reducir peso y requisitos de memoria. El repositorio ocupa 0,4 GB e incluye los ficheros `encoder.int8.onnx`, `decoder.int8.onnx` y `tokens.txt`, que son los que espera sherpa-onnx para ejecutar inferencia local.

Su relevancia es practica: permite desplegar ASR yoruba-ingles en movil, escritorio o dispositivos embebidos sin GPU dedicada y sin conexion a internet, algo poco frecuente para un idioma de bajos recursos como el yoruba. El modelo hereda la licencia Apache 2.0 del original, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) exportado a grafos ONNX; MatMul cuantizado a int8 |
| Parametros totales | Aproximadamente 244 millones (corresponde al tamano estandar de Whisper-small); el valor exacto no esta declarado en la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (formato estandar de entrada de Whisper); no se especifica otro valor en la model card |
| Tipos de cuantizacion | int8 en las operaciones MatMul (encoder y decoder) |
| Idiomas soportados | Yoruba e ingles con alternancia de codigo (code-switching); la ficha de HuggingFace no declara lista de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx), mas tokens.txt |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper-small, un transformer de tipo encoder-decoder que procesa espectrogramas mel de audio de 30 segundos y genera texto token a token. El modelo original `LyngualLabs/whisper-small-yoruba` fue ajustado sobre esta base especificamente para transcribir habla que alterna entre yoruba e ingles, atendiendo a los acentos, la tonalidad y las mezclas linguisticas propias de esas conversaciones. La model card del paquete ONNX no detalla el volumen de datos de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO.

La innovacion tecnica de esta version concreta es la conversion: los pesos afinados se exportan mediante el script `scripts/whisper/export-onnx.py` de sherpa-onnx, aplicando cuantizacion int8. Esto da como resultado dos grafos separados (encoder y decoder) mas el vocabulario de tokens, optimizados para ejecucion en CPU mediante sherpa-onnx, sin depender de frameworks de deep learning completos.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) sobre ventanas de 30 segundos.
- Transcripcion de conversaciones con alternancia de codigo yoruba-ingles.
- Manejo de acentos y tonos propios del yoruba, segun la descripcion del modelo base.
- Ejecucion en dispositivo (on-device) mediante sherpa-onnx, sin necesidad de conexion a internet.
- Inferencia en CPU gracias a la cuantizacion int8 de las operaciones MatMul.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion offline en aplicaciones moviles: al ser un paquete ONNX int8 de 0,4 GB, se puede integrar en apps Android o iOS que transcriban voz localmente sin enviar audio a la nube, util en entornos con conectividad limitada.
- Subtitulado de contenido audiovisual en yoruba e ingles: procesando el audio por ventanas de 30 segundos, se pueden generar subtitulos para videos o retransmisiones donde los hablantes cambian de idioma.
- Asistentes de voz para comunidades yoruba-parlantes: el modelo puede servir de capa ASR en asistentes que necesiten entender habla mixta yoruba-ingles, un caso frecuente en Nigeria.
- Documentacion clinica o administrativa por dictado: profesionales que dictan en yoruba con terminos en ingles pueden transcribir notas sin conexion, manteniendo los datos en el dispositivo.
- Investigacion linguistica y creacion de corpus: permite transcribir entrevistas o grabaciones de campo en yoruba e ingles de forma automatizada para su posterior analisis.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones en tiempo real de conversaciones presenciales, ejecutandose localmente en un portatil o dispositivo de bajo consumo.
- Preprocesado en pipelines de traduccion: el proyecto Malinali combina ASR con traduccion; este modelo puede alimentar un sistema de traduccion offline encadenando transcripcion y traduccion.
- Despliegue en dispositivos embebidos: por su tamano reducido y su formato ONNX int8, encaja en hardware con recursos limitados donde no cabe un modelo Whisper sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de WER (word error rate), MMLU, HumanEval ni ninguna otra evaluacion cuantitativa, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM/RAM estimada: al tratarse de int8 y un repositorio de 0,4 GB, el modelo requiere del orden de 0,3-0,5 GB de memoria para cargar los grafos; el consumo real depende del runtime sherpa-onnx y del buffer de audio.
- GPU: no es necesario GPU. Puede ejecutarse en CPU. Para lotes grandes o baja latencia se puede usar cualquier GPU moderna (RTX 3060 o superior), aunque no es el escenario objetivo del paquete.
- GPU de consumo: no requiere ninguna; cabe en CPU de portatil y en dispositivos moviles.
- Opciones de despliegue: sherpa-onnx es el runtime previsto (formato de grafos Whisper de sherpa-onnx). El modelo base tambien esta disponible en otros formatos: existe una version `malinali-app/whisper-small-yoruba-ggml` para whisper.cpp y el original `LyngualLabs/whisper-small-yoruba` en safetensors para uso con Transformers.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de velocidad de transcripcion en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/whisper-small-yoruba-onnx | ~244 M (Whisper-small) | ONNX int8 | Yoruba e ingles (code-switching) | Apache 2.0 | HuggingFace, runtime sherpa-onnx |
| malinali-app/whisper-small-yoruba-ggml | ~244 M (Whisper-small) | GGML | Yoruba e ingles (code-switching) | Apache 2.0 | HuggingFace, whisper.cpp |
| LyngualLabs/whisper-small-yoruba | ~244 M (Whisper-small) | Safetensors | Yoruba e ingles (code-switching) | no disponible en la informacion | HuggingFace, Transformers |
| openai/whisper-small | ~244 M | Safetensors / otros | Multilingue (99 idiomas) | Apache 2.0 | HuggingFace, multiple runtimes |

La diferencia principal entre las tres variantes de Malinali y LyngualLabs es el formato de pesos y el runtime objetivo, no el modelo en si: comparten los mismos pesos afinados para yoruba-ingles. Frente a `openai/whisper-small`, el ajuste especifico mejora la cobertura del code-switching yoruba-ingles a costa de especializarse y perder generalidad multilingue.

## Limitaciones y advertencias

- No se declara lista de idiomas en la ficha de HuggingFace; el soporte se infiere de la descripcion del modelo base (yoruba e ingles).
- Al ser un modelo especializado, su rendimiento fuera del dominio yoruba-ingles probablemente sea inferior al de Whisper-small generico, aunque no hay datos publicados que lo confirmen.
- Riesgo de alucinacion inherente a los modelos de reconocimiento de voz: pueden generar texto plausible en segmentos con ruido, silencio o audio poco claro.
- Sesgos: no se documentan analisis de sesgo demografico ni dialectal; el entrenamiento puede favorecer determinados acentos o variedades del yoruba.
- Limitacion de contexto: la ventana de audio es de 30 segundos; audios mas largos requieren segmentacion por parte del runtime.
- Restricciones de licencia: no hay restricciones comerciales conocidas, ya que la licencia declarada es Apache 2.0, pero la procedencia de los datos de ajuste del modelo base no se detalla en la informacion disponible.
- En produccion conviene validar la calidad de transcripcion en el dominio concreto de uso (WER no publicado) y verificar la compatibilidad de version de sherpa-onnx con los grafos exportados.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion comunitaria de su funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/whisper-small-yoruba-onnx
- Modelo base: https://huggingface.co/LyngualLabs/whisper-small-yoruba
- Variante GGML del mismo modelo: https://huggingface.co/malinali-app/whisper-small-yoruba-ggml
- Repositorio del proyecto Malinali: https://github.com/malinali-app/malinali-app
- Sitio web de Malinali: https://malinali.app/en/
- Modelo relacionado (Esammy/whisper-small-yoruba): https://huggingface.co/Esammy/whisper-small-yoruba
