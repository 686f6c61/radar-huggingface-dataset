# BuilderHelm/Llama-Kanso-Fude-1.0

## Resumen

Llama Kanso Fude 1.0 es un modelo de etiquetado token a token (token-classification) desarrollado por BuilderHelm, un estudio independiente de IA centrado en modelos pequenos para inferencia en dispositivo. No es un modelo generativo ni conversacional: su unica funcion es formatear texto crudo procedente de sistemas de reconocimiento automatico del habla (ASR), insertando puntuacion, restaurando mayusculas, partiendo parrafos, eliminando muletillas y aplicando autocorrecciones habladas, sin introducir nunca palabras nuevas.

El modelo se construye como un fine-tuning de Gemma 3 270M al que se le ha convertido la atencion en bidireccional y se le han anadido cuatro cabezas de clasificacion por palabra. Cuenta con 268.109.714 parametros totales (268M) y se distribuye principalmente como ONNX cuantizado a int8 de 174 MB, con versiones FP32 en ONNX y safetensors para reentrenamiento.

Su relevancia actual reside en el nicho de post-procesado de dictado en local: modelos de este tamano permiten ejecutar correccion de transcripciones en CPU sin conexion, algo atractivo para aplicaciones de escritorio y moviles. El autor declara mediciones solo en ingles, aunque el modelo fue entrenado con datos sinteticos en espanol, aleman, frances, portugues, italiano y neerlandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional derivado de Gemma 3 270M con cuatro cabezas de clasificacion por palabra |
| Parametros totales | 268.109.714 (268M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventanas de 512 tokens con 64 tokens de solapamiento; longitud de entrada arbitraria |
| Tipos de cuantizacion | int8 (ONNX, recomendado), FP32 (ONNX y safetensors) |
| Idiomas soportados | Ingles (medido); entrenado con datos sinteticos en espanol, aleman, frances, portugues, italiano y neerlandes |
| Licencia | Gemma Terms of Use (licencia `gemma`), con avisos adicionales de Llama 3.1 |
| Formato de pesos | ONNX (`tagger.onnx` int8, `tagger.fp32.onnx`), safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-270m y modifica su atencion causal en bidireccional, lo que permite que cada palabra vea tanto el contexto izquierdo como el derecho, algo esencial para decidir puntuacion y mayusculas. Sobre la representacion de cada palabra se anaden cuatro cabezas de clasificacion independientes: puntuacion, capitalizacion, cortes de frase y parrafo, y borrado (deletion). La tokenizacion es deliberadamente simple: cada palabra se codifica por separado con un espacio inicial (`"▁word"`), sin tokens especiales y con un maximo de 16 subvocablos, y la secuencia se envuelve con `<bos>` y `<eos>` (ids 2 y 1).

El entrenamiento combina datos de HuggingFaceTB/smoltalk, HuggingFaceFW/fineweb-2 y facebook/voxpupuli (voxpopuli). El autor indica que parte del texto de entrenamiento fue generado por Llama 3.1 (de ahi el prefijo "Llama" en el nombre, por requisito de la licencia de Llama 3.1), aunque el modelo no contiene pesos ni codigo de Llama. La inferencia se realiza por ventanas de 512 tokens con solapamiento de 64; cuando una palabra cae en dos ventanas se toma aquella en la que la palabra esta mas lejos de un borde. Las decisiones se aplican con umbrales fijos declarados en `thresholds.json`: puntuacion 0.625, mayusculas 0.3, cortes 0.3 y borrado 0.675. Las eliminaciones pasan siempre por `labels.validated_deletions`, una capa de validacion que impide borrar texto que no sea una muletilla, repeticion o autocorreccion.

## Capacidades

- Puntuacion: inserta `,` `.` `?` `!` `:` `;` tras las palabras y une palabras con guion.
- Restauracion de mayusculas: inicios de frase, nombres propios y acronimos.
- Segmentacion: divide dictado continuo en frases y parrafos.
- Eliminacion de disfluencias: retira muletillas ("um", "you know") y palabras repetidas ("the the").
- Autocorrecciones habladas: aplica retrocesos del tipo "monday sorry i meant tuesday".
- Texto protegido: solo retira numeros, URL, rutas de fichero o negaciones cuando el hablante los sustituye por otro del mismo tipo.
- Garantia de no invencion: toda palabra de la salida proviene de la entrada; el modelo no reescribe ni parafrasea.
- Multilingue declarado: entrenado con datos sinteticos en seis idiomas ademas del ingles, aunque las mediciones publicadas son solo en ingles.
- No soporta tool calling, function calling, razonamiento multi-paso, vision ni audio: es un etiquetador de un solo proposito.

## Casos de uso

- Dictado en aplicaciones de escritorio: el modelo int8 de 174 MB se ejecuta con ONNX Runtime en Windows, Linux y macOS, permitiendo formatear transcripciones en local sin enviar audio ni texto a la nube, con ventanas de 512 tokens que admiten entradas de cualquier longitud.
- Post-procesado de ASR en movil: el tamano reducido y la dependencia exclusiva de ONNX Runtime lo hacen adecuado para integrarse en pipelines de reconocimiento de voz en dispositivos con recursos limitados.
- Limpieza de notas de reunion: elimina muletillas y repeticiones de transcripciones automaticas antes de archivarlas o enviarlas por correo, gracias a las cabezas de disfluencia y borrado validadas.
- Normalizacion de mayusculas en subtitulos: restaura inicios de frase y nombres propios en subtitulos generados automaticamente, con la cabeza de casing a umbral 0.3.
- Correccion de dictado con autocorrecciones: aplica retrocesos hablados como "el presupuesto es 2.500 no perdon 3.000" y sustituye el valor solo cuando el hablante ofrece otro del mismo tipo, protegido por `validated_deletions`.
- Preprocesado para pipelines de NLP: segmenta texto sin puntuacion en frases y parrafos antes de alimentar modelos posteriores de traduccion, resumen o busqueda, simplificando el chunking.
- Integracion en herramientas de accesibilidad: convierte dictado continuo en texto legible con puntuacion y capitalizacion para usuarios que dependen de entrada por voz.

## Benchmarks y rendimiento

La model card menciona las metricas WER y F1 en los metadatos, pero no se han publicado tablas de resultados numericos en la informacion disponible. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero int8 de 174 MB requiere del orden de 200-400 MB de memoria en tiempo de ejecucion; la version FP32 ONNX de 686 MB y el safetensors de 1,07 GB requieren aproximadamente 1-2 GB.
- GPU recomendadas: no son necesarias; el modelo esta pensado para CPU mediante ONNX Runtime. En GPU, cualquier tarjeta con 2 GB o mas (GTX 1650, RTX 3050, RTX 4090, A100, H100) puede ejecutarlo sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en CPU y dispositivos embebidos.
- Opciones de despliegue: ONNX Runtime (soporte oficial en Windows, Linux y macOS) y PyTorch con safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama Kanso Fude 1.0 | 268M | Ventanas de 512 tokens, entrada arbitraria | Etiquetado bidireccional sobre Gemma 3 270M, ONNX int8 | Gemma Terms of Use | Hugging Face (BuilderHelm) |
| Llama Kanso Sumi 1.0 | no disponible | no disponible | Mismo etiquetador sobre mmBERT-small; mas pequeno y rapido, opcion por defecto del autor | no disponible | Hugging Face (BuilderHelm) |
| google/gemma-3-270m | 270M | no disponible en esta ficha | Modelo base generativo causal | Gemma Terms of Use | Hugging Face (Google) |

El hermano Sumi 1.0 se presenta en la model card como alternativa mas pequena y rapida sobre mmBERT-small. No se dispone de datos de benchmarks comparativos entre ambos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de un solo proposito: no es un chatbot ni un modelo de reescritura; no puede generar texto nuevo ni responder preguntas.
- Idiomas: las mediciones solo se han realizado en ingles; el resto de idiomas se entreno con datos sinteticos y su calidad real no esta verificada publicamente.
- Alucinacion: por diseno no inventa palabras, pero puede equivocarse en la colocacion de puntuacion, mayusculas o en la decision de borrar una muletilla, por lo que se recomienda revisar salidas en produccion.
- Umbrales fijos: el rendimiento depende de los valores de `thresholds.json`; cambiarlos invalida las mediciones del autor.
- Configuracion estricta: la tokenizacion palabra a palabra con espacio inicial y limite de 16 subvocablos es obligatoria; desviarse de ella puede degradar los resultados.
- Licencia: sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, con obligaciones de atribucion adicionales por el uso de texto generado con Llama 3.1; revisar `NOTICE` antes de uso comercial.
- Trazabilidad limitada: creado en noviembre de 2026, con cero descargas y cero likes en el momento de la consulta; no hay evidencia de adopcion externa.
- Sin benchmarks publicos: no hay resultados numericos de WER o F1 disponibles, lo que dificulta comparar su calidad con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BuilderHelm/Llama-Kanso-Fude-1.0
- Modelo hermano Sumi 1.0: https://huggingface.co/BuilderHelm/Llama-Kanso-Sumi-1.0
- Modelo base Gemma 3 270M: https://huggingface.co/google/gemma-3-270m
- Perfil del autor: https://huggingface.co/BuilderHelm
- Modelos del autor: https://huggingface.co/BuilderHelm/models
- ONNX Runtime: https://onnxruntime.ai
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Dataset smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset voxpopuli: https://huggingface.co/datasets/facebook/voxpopuli
