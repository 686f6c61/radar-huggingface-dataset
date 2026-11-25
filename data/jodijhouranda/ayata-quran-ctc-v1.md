# jodijhouranda/ayata-quran-ctc-v1

## Resumen

ayata-quran-ctc-v1 es un modelo de reconocimiento automatico del habla (ASR) especializado en recitacion coranica, publicado por el usuario jodijhouranda en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo HamzaSidhu786/wav2vec2-base-word-by-word-quran-asr, que a su vez deriva de la arquitectura wav2vec2-base de Meta. El modelo resuelve la tarea de transcripcion de audio a texto mediante una cabeza CTC (Connectionist Temporal Classification), lo que lo hace adecuado para alineamiento y decodificacion de audio sin necesidad de un modelo de lenguaje externo.

Con 94.420.159 parametros (aproximadamente 94,4 millones), se situa en el rango de los modelos base de wav2vec2, lo que implica un coste computacional moderado y la posibilidad de ejecutarse en hardware de consumo. El repositorio ocupa 2,7 GB e incluye pesos en safetensors y ONNX, lo que facilita su despliegue tanto en entornos de investigacion como en produccion con ONNX Runtime.

La relevancia actual del modelo radica en su especializacion: frente a los modelos ASR genericos, esta orientado a la recitacion del Coran palabra por palabra, un dominio con vocabulario y fonetica especificos. No obstante, la model card es practicamente vacia (generada automaticamente por el Trainer), por lo que gran parte de la informacion tecnica no esta disponible y debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer convolucional + encoder, cabeza CTC) |
| Parametros totales | 94.420.159 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la longitud del audio de entrada) |
| Tipos de cuantizacion | no disponible (se publican pesos safetensors y ONNX) |
| Idiomas soportados | no disponible (dominio: recitacion coranica en arabe) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec2-base, un encoder de tipo transformer que procesa representaciones convolucionales del audio y se entrena con un objetivo de clasificacion CTC para la transcripcion. La cabeza CTC permite mapear secuencias de audio a secuencias de tokens sin alineamiento explicito, lo que es habitual en ASR y adecuado para audio de longitud variable.

El entrenamiento se realizo como ajuste fino del modelo HamzaSidhu786/wav2vec2-base-word-by-word-quran-asr sobre un dataset denominado "generator", del que no se especifica composicion, tamano ni numero de tokens. Los hiperparametros declarados son: learning rate 3e-05, batch de entrenamiento efectivo de 32 (batch 16 con acumulacion de gradiente 2), semilla 42, optimizador AdamW fused (betas 0.9/0.999, epsilon 1e-08), scheduler lineal con 250 pasos de warmup, 3500 pasos de entrenamiento y precision mixta nativa (AMP). No se documenta si hubo RLHF, DPO ni ninguna innovacion tecnica adicional. Las versiones de framework declaradas son Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (ASR) sobre audio de recitacion coranica, con salida de texto mediante decodificacion CTC.
- Transcripcion palabra por palabra, segun indica el nombre del modelo base.
- Ejecucion en formato ONNX, lo que permite inferencia optimizada en CPU y GPU con ONNX Runtime.
- Integracion con la libreria transformers (pipeline automatic-speech-recognition).
- Compatibilidad con endpoints de Hugging Face (tag endpoints_compatible).
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento (thinking mode).
- Capacidades multilingues: no disponibles; el dominio declarado es la recitacion coranica.

## Casos de uso

- Transcripcion de recitacion coranica: el modelo convierte audio de recitacion en texto, aprovechando su ajuste especifico sobre el modelo base orientado a palabra por palabra. Es adecuado para aplicaciones de estudio y memorizacion del Coran.
- Alineamiento y verificacion de recitacion: al producir transcripciones a nivel de palabra, puede usarse para comparar la recitacion del usuario con el texto de referencia y detectar errores o desviaciones.
- Herramientas educativas de aprendizaje: integrado en aplicaciones que muestran el texto recitado sincronizado con el audio, gracias a la salida CTC alineable.
- Investigacion en ASR de dominio especifico: sirve como punto de partida para experimentos de ajuste fino en arabe clasico o dominios religiosos, dado su tamano reducido y licencia permisiva.
- Despliegue en entornos con recursos limitados: con 94,4 millones de parametros y pesos ONNX, puede ejecutarse en CPU o GPU de consumo para transcripcion por lotes.
- Procesamiento de archivos de audio historicos o de archivo: util para digitalizar y transcribir grabaciones de recitacion y facilitar su indexacion y busqueda.
- Generacion de subtitulos para contenido religioso: aplicable a videos o podcasts de recitacion donde se requiera texto sincronizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor contiene una entrada sin resultados (results: []), y la model card no incluye metricas de evaluacion (WER, CER ni comparaciones).

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~94 millones de parametros, los pesos en fp32 ocupan aproximadamente 0,38 GB; en fp16, unos 0,19 GB. La VRAM real depende de la longitud del audio y del tamano de lote, pero en la practica es inferior a 2 GB para inferencia por lotes pequenos.
- GPU recomendadas: cualquier GPU moderna es suficiente; se puede ejecutar en RTX 3060, RTX 4090, A100 o H100 sin problemas de memoria. El modelo no requiere GPU de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con al menos 2-4 GB de VRAM, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), ONNX Runtime (pesos ONNX incluidos), y potencialmente servidores compatibles con endpoints de Hugging Face. No se documenta soporte explicito para vLLM, llama.cpp, Ollama ni TGI (estas herramientas estan orientadas a modelos de lenguaje, no a ASR).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ayata-quran-ctc-v1 | 94,4 M | no disponible (audio variable) | sin benchmarks publicados | apache-2.0 | Hugging Face |
| HamzaSidhu786/wav2vec2-base-word-by-word-quran-asr | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| wav2vec2-base (Meta) | ~95 M | audio variable | benchmarks publicados en el paper original | apache-2.0 | Hugging Face |

La comparacion con alternativas genericas de ASR (por ejemplo, Whisper de OpenAI) no se incluye por falta de datos de rendimiento del modelo evaluado; no seria riguroso comparar sin metricas. El modelo base HamzaSidhu786 no declara parametros ni metricas en la informacion disponible.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones "More information needed"; no hay documentacion sobre datos de entrenamiento, evaluacion ni usos previstos.
- No se han publicado metricas de rendimiento (WER, CER), por lo que no es posible evaluar su calidad de forma objetiva.
- El dominio esta restringido a recitacion coranica; su comportamiento fuera de ese dominio (habla conversacional, otros idiomas) es desconocido y probablemente deficiente.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos CTC, especialmente con ruido de fondo, acentos o audio de baja calidad.
- Sesgos: no documentados; al entrenarse en un dominio religioso concreto, puede presentar sesgos de vocabulario y estilo.
- La licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni documentacion de procedencia de los datos de entrenamiento, lo que puede plantear dudas sobre su idoneidad en produccion.
- El dataset "generator" no esta descrito; se desconoce si contiene datos sinteticos, lo que afectaria a la generalizacion.
- No se declaran idiomas soportados; no debe asumirse soporte multilingue.
- El modelo se creo y actualizo en noviembre de 2026 segun los metadatos, con solo 69 descargas y 0 likes, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jodijhouranda/ayata-quran-ctc-v1
- Modelo base: https://huggingface.co/HamzaSidhu786/wav2vec2-base-word-by-word-quran-asr
- Paper de wav2vec2 (Meta): no disponible en la informacion proporcionada
- Repositorio o demo: no disponible en la informacion proporcionada
