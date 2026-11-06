# emma333333/whisper-tiny_to_british_accent

## Resumen

Whisper tiny British es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny de OpenAI, especializado en reconocimiento automatico del habla (ASR) para ingles britanico. Lo publica el usuario emma333333 en Hugging Face y parte de la arquitectura encoder-decoder transformer original de Whisper, con 37,76 millones de parametros totales y un peso de repositorio de unos 0,3 GB. El objetivo declarado es adaptar el modelo base, entrenado originalmente con acentos variados, hacia un dominio mas concreto de ingles britanico.

El modelo se ha entrenado sobre un dataset denominado `british_english` y declara un WER de 13,35 en su split de test, con una perdida de validacion de 0,2950 tras 2000 pasos de entrenamiento. Se distribuye bajo licencia Apache 2.0 y en formato safetensors, compatible con la libreria transformers y con el pipeline `automatic-speech-recognition`.

Su relevancia es limitada pero concreta: sirve como ejemplo de adaptacion de dominio de un modelo ASR pequeno y como punto de partida para experimentos de especializacion por acento en entornos con recursos computacionales muy reducidos. No obstante, la documentacion es practicamente inexistente (la propia model card indica "More information needed" en varias secciones) y no hay evidencia de validacion independiente de los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s; el dato no se declara explicitamente en la model card) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en fp32/fp16; no se declaran variantes GGUF u otras) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper en su variante tiny: un encoder-decoder transformer con 4 capas en cada bloque, atencion multi-cabeza y representaciones de audio tipo mel-spectrogram de 80 canales. El modelo base openai/whisper-tiny fue entrenado por OpenAI con 680.000 horas de audio supervisado y 117.000 horas adicionales multilingues, pero esa informacion corresponde al modelo original y no al ajuste fino aqui descrito.

El ajuste fino se realizo con los siguientes hiperparametros declarados en la model card: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento. Se registran dos puntos de evaluacion: en el paso 1000 (epoch 0,9901) con perdida de validacion 0,3014 y WER 15,1016; y en el paso 2000 (epoch 1,9802) con perdida 0,2950 y WER 13,3453. No se documenta la composicion del dataset `british_english`, su tamano, la procedencia del audio ni si se aplicaron tecnicas de aumento de datos o de RLHF/DPO. Las versiones de framework declaradas son Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) para ingles, con especializacion declarada en acento britanico.
- Transcripcion de audio en formato compatible con el pipeline `automatic-speech-recognition` de transformers.
- Generacion de transcripciones con marcas de tiempo, siempre que se invoque con los parametros adecuados del pipeline de Whisper.
- Capacidad multilingue limitada al ingles (el tag de idioma es unicamente `en`).
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se declara soporte de vision, audio generativo, modo thinking ni otras capacidades especiales.
- No se declara capacidad de traduccion ni de identificacion de idioma, aunque el modelo base Whisper tiny si las soporta de forma nativa.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles britanico: el modelo puede integrarse en un pipeline de ASR para convertir grabaciones de audio en texto, con la ventaja de un consumo de recursos minimo (37,7 M de parametros) que permite ejecutarlo en CPU o en GPUs de gama baja.
- Subtitulado automatico de contenido audiovisual: al ser compatible con el pipeline de Whisper, puede generar subtitulos con marcas de tiempo para videos en ingles britanico, aunque la calidad estara limitada por el WER declarado de 13,35.
- Prototipado rapido de aplicaciones de voz: por su tamano reducido (0,3 GB de repositorio) es adecuado para validar ideas de producto o flujos de ASR antes de invertir en modelos mayores.
- Investigacion sobre adaptacion de dominio y acento: sirve como caso de estudio reproducible de fine-tuning de un modelo ASR pequeno con hiperparametros documentados, util para comparar estrategias de especializacion.
- Despliegue en dispositivos con recursos limitados: su tamano permite ejecutarlo en entornos edge o en contenedores ligeros, siempre que la precision requerida sea moderada y el audio sea en ingles britanico.
- Generacion de transcripciones para analisis de datos a pequena escala: util para procesar lotes de audio en proyectos de investigacion donde el coste computacional es un factor critico y no se requiere precision de nivel produccion.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card (no verificados de forma independiente, `verified: false`).

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| ASR | British English (split test) | WER | 13,3453 |
| ASR | British English (split validacion, paso 1000) | WER | 15,1016 |
| ASR | British English (split validacion, paso 2000) | WER | 13,3453 |
| ASR | British English (split validacion, paso 2000) | Loss | 0,2950 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de otras tareas, ya que el modelo es exclusivamente de ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,7 M de parametros, aproximadamente 150 MB de pesos mas overhead de activaciones y buffers de audio). En fp16 o bf16, aproximadamente 75 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo cabe holgadamente en tarjetas de gama baja como GTX 1050 Ti, GTX 1650 o incluso en iGPUs modernas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer actual e incluso en CPU para audio de duracion moderada.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), y en principio cualquier runtime compatible con safetensors y la arquitectura Whisper (por ejemplo, conversiones a ONNX o a llama.cpp/whisper.cpp si el usuario las realiza, aunque no se declaran conversiones oficiales).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia muy baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emma333333/whisper-tiny_to_british_accent | 37,76 M | ventanas de 30 s (Whisper) | 13,35 (British English, test) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 37,76 M | ventanas de 30 s (Whisper) | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-base | 74,4 M | ventanas de 30 s (Whisper) | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-small | 244 M | ventanas de 30 s (Whisper) | no disponible en esta ficha | apache-2.0 | Hugging Face |

La comparacion con los modelos base de OpenAI se basa en el tamano y la arquitectura, no en resultados de benchmarks, ya que no se dispone de mediciones comparables en la informacion proporcionada. El ajuste fino declara una mejora de WER respecto a su propio punto de validacion intermedio, pero no se aporta comparacion con el modelo base sin ajustar.

## Limitaciones y advertencias

- Documentacion incompleta: la model card indica "More information needed" en las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento, lo que impide evaluar la calidad y representatividad del dataset `british_english`.
- Resultados no verificados: el WER de 13,35 esta marcado como `verified: false` en el model-index; no hay validacion independiente ni comparacion con el modelo base.
- Riesgo de alucinacion y errores de transcripcion: como todo modelo ASR, puede generar texto que no corresponde al audio, especialmente con ruido de fondo, acentos no britanicos o vocabulario tecnico.
- Limitacion de idioma: solo se declara soporte de ingles; no se garantiza un rendimiento adecuado en otros idiomas ni en variedades del ingles distintas de la britanica.
- Limitacion de contexto de audio: Whisper procesa ventanas de 30 segundos; audios mas largos requieren segmentacion y pueden perder coherencia entre fragmentos.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; el usuario asume la responsabilidad de validar el modelo en su dominio.
- Sin soporte declarado para tool calling, agentes ni otras capacidades avanzadas; no debe emplearse en pipelines que requieran estas funciones.
- Modelo de muy baja difusion (32 descargas, 0 likes en el momento de la consulta), lo que reduce la probabilidad de encontrar reportes de uso o incidencias resueltas por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emma333333/whisper-tiny_to_british_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio relacionado del mismo autor: https://huggingface.co/emma333333/whisper-tiny_to_british_accent_01
- Ficha en free2aitools: https://free2aitools.com/model/emma333333/whisper-tiny_to_british_accent
- Paper original de Whisper (referencia del modelo base): no disponible en la informacion proporcionada.
