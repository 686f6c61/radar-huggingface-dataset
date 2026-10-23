# redbaty/ytm-lyrics-aligner

# ytm-lyrics-aligner

## Resumen
ytm-lyrics-aligner es un export a ONNX de mrfakename/w2v-bert-2.0-music-lyrics-ctc, un alineador forzado de letras a nivel de carácter pensado para mezclas musicales completas. No es un modelo de transcripción: recibe las características log-mel de un fragmento de audio y devuelve, para cada trama de 20 ms (50 Hz), una distribución log-softmax sobre un vocabulario de 921 caracteres, de forma que un decodificador CTC puede situar en el tiempo una letra que ya se conoce de antemano.

Lo publica el usuario redbaty como componente del proyecto ytm, un reproductor de YouTube Music para terminal que ejecuta estos ficheros con ONNX Runtime. El repositorio es únicamente una conversión de formato: conserva los pesos del modelo original, no incluye reentrenamiento y mantiene la licencia MIT. Se distribuye en tres precisiones (fp32, fp16 e int8) junto con el vocabulario y un fichero de características sintéticas de referencia para validar portes del frontend.

Su relevancia práctica está en que alinea letras sobre la mezcla completa sin separar la voz del acompañamiento, y en que la variante int8 está cuantizada para ejecutarse en CPU, lo que permite sincronizar letras en un cliente de escritorio o terminal sin GPU dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-BERT 2.0 (extractor convolucional + codificador transformer) con cabeza CTC; exportada a ONNX con opset 17, IR version 8 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventanas de audio de hasta 30 s; para audio más largo se ejecutan ventanas de 30 s con 2 s de contexto a cada lado y se concatenan los 26 s centrales de cada una |
| Tipos de cuantización | fp32, fp16 e int8 (cuantización dinámica de ONNX Runtime: pesos QInt8 en MatMul y en la Conv puntual; la Conv depthwise agrupada permanece en fp32) |
| Idiomas soportados | no disponible; el vocabulario es de 921 tokens a nivel de carácter e incluye descomposición de Hangul en jamo |
| Licencia | MIT |
| Formato de pesos | ONNX: `aligner-fp32.onnx` + `aligner-fp32.onnx.data` (datos externos), `aligner-fp16.onnx`, `aligner-int8.onnx` |
| Entrada del grafo | `features` float32 `[1, T_in, 160]` (80 bins log-mel, normalización por ventana, apilado con stride 2, extractor de SeamlessM4T) y `attention_mask` int64 `[1, T_in]` |
| Salida del grafo | `log_probs` float32 `[1, T_in, 921]`, una trama cada 20 ms (50 Hz) |
| Vocabulario | `vocab.json`, 921 tokens; `<blank>` = 0 es el blank de CTC y el carácter `\|` = 1 es el separador de palabra |
| Cabezas exportadas | solo la cabeza CTC; las cabezas de actividad vocal y F0 del modelo original no se exportan |
| Versiones de exportación | torch 2.11.0+cu128, transformers 5.20.2, onnx 1.23.2, onnxruntime 1.26.0; revisión de origen `1be91455793f86de803ac0707303a0998e423ce1` |
| Tamaño del repositorio | 4,1 GB (incluye las tres precisiones, vocabulario, golden file y sumas SHA256) |
| Pipeline declarado | automatic-speech-recognition (uso real: alineación forzada) |

## Arquitectura y entrenamiento
La cadena de procedencia es facebook/w2v-bert-2.0 (Meta AI, MIT), adaptado al dominio musical en mrfakename/w2v-bert-2.0-music y afinado después en mrfakename/w2v-bert-2.0-music-lyrics-ctc. El resultado es un codificador Wav2Vec2-BERT 2.0 que consume las características del extractor de SeamlessM4T (80 bins log-mel normalizados por ventana y apilados con stride 2, lo que da 160 dimensiones de entrada) y proyecta cada trama a un espacio de 921 caracteres mediante una cabeza CTC. Además de la CTC, el modelo original dispone de cabezas auxiliares de actividad vocal y de F0 que no se han exportado en este repositorio.

Según la model card del modelo de origen, el entrenamiento se basa en CTC con supervisión débil sobre letras de canciones completas, pero los datos de entrenamiento no están documentados: no se especifica el número de tokens, la composición del corpus ni si hubo etapas de ajuste con preferencias humanas. El autor de este export declara explícitamente que no conoce nada más allá de esa model card. No hay, por tanto, información sobre RLHF/DPO, decodificación especulativa ni otras innovaciones de inferencia; la única particularidad técnica documentada es la ventana deslizante de 30 s con 2 s de contexto y recorte central de 26 s para audio largo.

## Capacidades
- Alineación forzada de letras conocidas sobre audio musical: emite log-probabilidades CTC por trama, aptas para decodificación Viterbi y obtención de timestamps a resolución de 20 ms.
- Funciona sobre la mezcla completa (voz + instrumentación) sin necesidad de separar fuentes, que es el escenario declarado por el autor.
- Salida a nivel de carácter con 921 tokens, incluido `|` como separador de palabra, lo que permite mapear palabras y sílabas a intervalos de tiempo.
- Ejecución con ONNX Runtime en CPU (variante int8) y posibilidad de fp16 para aceleración en GPU.
- Preprocesamiento de letras definido con precisión: NFKC, minúsculas, eliminación de puntuación, apóstrofos conservados dentro de palabra y Hangul descompuesto en jamo.
- Fichero `frontend-golden.json` con una señal sintética y sus características para validar implementaciones portadas del extractor de características.
- No soporta tool calling ni function calling, no es un agente multi-paso, no procesa visión, audio generativo ni texto libre.
- No es un modelo de transcripción libre: aunque el pipeline tag sea ASR, su uso previsto es alinear una letra proporcionada, no reconocerla.

## Casos de uso
- Karaoke y letras sincronizadas en ytm: el reproductor de terminal pasa la letra conocida y el audio decodificado al modelo, decodifica la CTC y obtiene los instantes de inicio y fin de cada línea para resaltarlas en tiempo real. La ventana de 30 s con 26 s de centro permite encadenar canciones completas con un coste de cómputo acotado.
- Generación de ficheros LRC o subtítulos tipo karaoke: a partir de una letra existente y una pista de audio se derivan marcas temporales por palabra o por sílaba con resolución de 20 ms, útiles para reproductores y plataformas de letras.
- Verificación de catálogo musical: comprobar si la letra asociada a una pista corresponde realmente al audio, midiendo la confianza media de la alineación; útil en pipelines de calidad de metadatos.
- Herramienta de escritorio sin GPU: la variante int8 con cuantización dinámica está pensada para CPU, de modo que un cliente ligero puede alinear letras en local sin depender de servicios en la nube ni enviar audio a terceros.
- Investigación en recuperación de información musical: los timestamps por carácter sirven para estudiar sincronía vocal, estructura de canciones o segmentación de estrofas a partir de la señal y la letra.
- Integración en aplicaciones móviles o embebidas mediante ONNX Runtime: al no requerir framework de deep learning completo, el modelo se puede empaquetar con el runtime y el vocabulario en una app que sincronice letras de la biblioteca local del usuario.
- Evaluación comparativa de sistemas de alineación: el `frontend-golden.json` y las sumas SHA256 permiten reproducir exactamente las características de entrada y comparar implementaciones o portes a otros lenguajes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: no publicada por el autor. El repositorio completo ocupa 4,1 GB e incluye las tres precisiones; la variante int8 (cuantización dinámica de ONNX Runtime) está declarada para CPU y es la más ligera del conjunto. Cualquier cifra concreta de VRAM sería una estimación no confirmada.
- GPU recomendadas: no hay datos de rendimiento por modelo de GPU. Al ser un export ONNX, puede ejecutarse con el proveedor CUDA o TensorRT de ONNX Runtime usando fp32 o fp16; el fp32 con datos externos es la referencia de exportación.
- GPU de consumo: previsiblemente la variante fp16 cabe en tarjetas de 8 GB o menos (estimación a partir del tamaño del repo, no verificada). La ruta recomendada por el autor es CPU con int8.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT), integración con `optimum`/`onnxruntime` en Python, o incrustación directa en aplicaciones de escritorio. No aplican vLLM, TGI, llama.cpp ni Ollama, al no tratarse de un modelo generativo de texto.
- Latencia y throughput: no disponibles. Como referencia de granularidad, la salida produce 50 tramas por segundo de audio y la inferencia se organiza en ventanas de 30 s con recorte central de 26 s.
- Memoria de sistema: el fp32 requiere cargar el fichero de datos externo junto al grafo, por lo que conviene reservar al menos el tamaño del repo en disco y una cantidad de RAM del orden del modelo en memoria (no cuantificada oficialmente).

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana / contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| redbaty/ytm-lyrics-aligner | no disponible | 30 s por ventana, concatenación de 26 s centrales | Log-probs CTC `[1, T, 921]` a 50 Hz, solo cabeza CTC | MIT | ONNX fp32/fp16/int8, ONNX Runtime |
| mrfakename/w2v-bert-2.0-music-lyrics-ctc | no disponible (mismos pesos) | 30 s por ventana | Log-probs CTC más cabezas de actividad vocal y F0 | MIT | Pesos en formato transformers/PyTorch |
| mrfakename/w2v-bert-2.0-music | no disponible | no disponible | ASR orientado a música | MIT | Pesos en formato transformers/PyTorch |
| facebook/w2v-bert-2.0 (base) | no disponible en la información | no disponible | ASR multilingüe (CTC/attention) | MIT | Pesos en formato transformers/PyTorch |

Frente al modelo de origen, este export pierde las cabezas de actividad vocal y F0, pero gana portabilidad (ONNX, tres precisiones, ejecución en CPU) y determinismo en el frontend gracias al golden file. Frente a otras familias de alineadores forzados basadas en wav2vec2/MMS o en Whisper, no hay datos de benchmarks ni de parámetros en la información disponible que permitan una comparación cuantitativa; la diferencia cualitativa documentada es que este modelo está ajustado específicamente sobre mezclas musicales completas en lugar de voz limpia.

## Limitaciones y advertencias
- No es un transcriptor: requiere la letra como entrada. Usarlo para reconocer letras sin texto previo no es su cometido y daría resultados pobres.
- Audio limitado a ventanas de 30 s; el audio largo exige implementar manualmente el esquema de 2 s de contexto y recorte de 26 s, con el riesgo de desalineación en las junturas si se hace mal.
- Ausencia de las cabezas de actividad vocal y F0: no se puede saber por el modelo si hay voz en una trama ni estimar el tono, lo que dificulta filtrar pasajes instrumentales.
- Los datos de entrenamiento no están documentados, por lo que se desconocen los sesgos de dominio (géneros, idiomas, calidad de mezcla) y el riesgo de alucinación de timestamps en secciones sin voz o con coros superpuestos.
- Idiomas soportados no declarados; el vocabulario de 921 caracteres con descomposición de Hangul sugiere cobertura de coreano, pero no hay confirmación. Los caracteres fuera del vocabulario no se pueden alinear.
- Preprocesamiento obligatorio y estricto (NFKC, minúsculas, sin puntuación, apóstrofos internos, separador `|` en palabras y extremos): desviarse degrada la alineación.
- Licencia MIT en los pesos exportados, igual que la cadena de modelos de origen, lo que permite uso comercial; aun así, conviene verificar la procedencia y los términos de los datos de entrenamiento originales, que no se documentan.
- Modelo con 0 descargas y 0 likes en el momento de la ficha, publicado en 2026: no hay validación independiente ni reportes de la comunidad.
- Al ser una conversión de formato, hereda cualquier limitación del modelo de origen; no se ha realizado ningún ajuste adicional que las corrija.
- La cuantización int8 es dinámica y deja la Conv depthwise en fp32; puede introducir una degradación de precisión no cuantificada en los log-probs. El fp16 mantiene la entrada y la salida en fp32 y ejecuta el LogSoftmax en fp32.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/redbaty/ytm-lyrics-aligner
- Modelo de origen: https://huggingface.co/mrfakename/w2v-bert-2.0-music-lyrics-ctc
- Modelo intermedio (música): https://huggingface.co/mrfakename/w2v-bert-2.0-music
- Modelo base de Meta AI: https://huggingface.co/facebook/w2v-bert-2.0
- Repositorio del proyecto ytm: no disponible en la información proporcionada
- Paper o blog técnico del autor: no disponible
- Demo o espacio de inferencia: no disponible
