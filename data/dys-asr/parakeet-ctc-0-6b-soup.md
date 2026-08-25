# dys-asr/parakeet-ctc-0.6b-soup

## Resumen

El modelo `parakeet-ctc-0.6b-soup` es un sistema de reconocimiento automático del habla (ASR) desarrollado por el usuario `dys-asr` para mejorar la transcripción de voz disártrica y habla con trastornos motores del habla. Se construye como una *model soup* (promedio de pesos) de dos fine-tunes del modelo base `nvidia/parakeet-ctc-0.6b` de NVIDIA, uno entrenado sobre el corpus SAPC2 y otro sobre la combinación de SAPC1 y SAPC2. El resultado es un único modelo de 608,8 millones de parámetros con arquitectura FastConformer y decodificación CTC, que no requiere entrenamiento adicional.

La relevancia de este modelo reside en que ofrece una mejora significativa frente al modelo base para habla disártrica: reduce el WER del 32,35% al 11,89% en el conjunto de evaluación de 48 hablantes no vistos. Aunque la ganancia adicional sobre su mejor ingrediente es pequeña (0,19 puntos de WER), la mezcla de pesos demuestra que es posible combinar fine-tunes de calidad similar sin coste adicional de inferencia. El modelo está orientado a aplicaciones de accesibilidad, como asistentes de voz para personas con parálisis cerebral, síndrome de Down, ELA o habla afectada por ictus.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + cabezal CTC |
| Parámetros totales | 608.848.897 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada de audio de 16 kHz, no contexto textual) |
| Tipos de cuantización | No disponible (pesos en FP32, no se publican cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | speech-accessibility-project-dua (otra) |
| Formato de pesos | Safetensors (tensores float32) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FastConformer de NVIDIA, un encoder convolucional con atención lineal que reduce el coste computacional respecto a un Transformer estándar. La decodificación es CTC (Connectionist Temporal Classification), sin modelo de lenguaje externo. Los pesos del modelo son una mezcla de dos fine-tunes del modelo `nvidia/parakeet-ctc-0.6b`: una parte de `dys-asr/parakeet-ctc-0.6b-sapc2` y dos partes de `dys-asr/parakeet-ctc-0.6b-all` (entrenado sobre la concatenación de SAPC1 y SAPC2). El promedio se realizó en float64 sobre tensores float, incluyendo buffers de BatchNorm (`running_mean` y `running_var`), mientras que los contadores enteros `num_batches_tracked` se mantienen como máximo (no afecta a la inferencia). No se realizó ningún entrenamiento adicional; la mezcla se eligió probando tres combinaciones (1:1:1, 1:1 y 1:2) y seleccionando la de mejor WER sobre el conjunto de validación reportado.

## Capacidades

- Reconocimiento de habla disártrica y habla con trastornos motores (parálisis cerebral, síndrome de Down, ELA, habla tras ictus).
- Transcripción de audio de 16 kHz mono a texto en inglés, con salida en mayúsculas y sin puntuación.
- Decodificación CTC greedy sin modelo de lenguaje externo (no requiere recursos adicionales).
- Inferencia eficiente: al ser una mezcla de pesos, el coste de cómputo es idéntico al de un solo modelo de 0,6B.
- No soporta tool calling, generación de código, razonamiento ni otras capacidades de LLM: es un modelo ASR puro.
- No soporta vision ni audio más allá de entrada de voz.

## Casos de uso

- **Asistencia a personas con disartria**: el modelo puede transcribir voz de personas con parálisis cerebral, síndrome de Down o ELA, permitiendo la comunicación escrita o el control por voz de dispositivos.
- **Transcripción médica de habla patológica**: en entornos clínicos para registrar y analizar sesiones de terapia del habla, con una precisión notablemente mejor que el modelo base para habla diséntrica.
- **Sistemas de accesibilidad en interfaces de voz**: integración en asistentes personales (p. ej., para escribir mensajes o buscar información) donde el usuario tiene dificultades articulatorias.
- **Investigación en trastornos del habla**: como herramienta de transcripción automática en estudios que necesitan procesar grabaciones de pacientes con distintas etiologías.
- **Subtitulación de vídeos o podcasts con habla no estándar**: puede transcribir contenido oral de personas con trastornos motores, mejorando la accesibilidad de contenidos audiovisuales.
- **Evaluación de la severidad del trastorno**: al conocer el WER por hablante y por etiología, se puede usar el modelo para medir el grado de disartria en evaluaciones clínicas.

## Benchmarks y rendimiento

Los resultados fueron reportados por el autor del modelo sobre un conjunto de validación de 17.582 utterances de 48 hablantes de SAPC2 dev que no aparecen en los datos de entrenamiento de ningún ingrediente. Se usó decodificación CTC greedy sin modelo de lenguaje y un normalizador común.

| Modelo | WER | CER |
|---|---|---|
| `nvidia/parakeet-ctc-0.6b` (base) | 32,35 % | 20,43 % |
| `dys-asr/parakeet-ctc-0.6b-sapc1` | 14,65 % | 8,77 % |
| `dys-asr/parakeet-ctc-0.6b-sapc2` | 13,35 % | 7,83 % |
| `dys-asr/parakeet-ctc-0.6b-all` | 12,08 % | 7,02 % |
| **`parakeet-ctc-0.6b-soup`** | **11,89 %** | **6,89 %** |

Desglose por etiología (media por hablante):

| Etiología | Hablantes | WER medio | WER mediano |
|---|---|---|---|
| Síndrome de Down | 13 | 21,43 % | 14,87 % |
| Parálisis cerebral | 13 | 18,30 % | 17,14 % |
| Ictus | 9 | 15,02 % | 12,15 % |
| ELA | 13 | 4,27 % | 2,66 % |

## Requisitos de hardware

- **VRAM estimada para inferencia**: un modelo de ~600 M parámetros en FP32 ocupa unos 2,4 GB en memoria (según tamaño del repo). Para inferencia con batch pequeño, cabe en GPUs de 4 GB o más; con cuantización FP16 se reduce a ~1,2 GB.
- **GPUs recomendadas**: cualquier GPU con soporte CUDA de al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 2060, RTX 3060, RTX 4090). También puede ejecutarse en CPU con la implementación `parakeet.cpp` (ggml), aunque con mayor latencia.
- **Despliegue**: se puede usar con la librería `transformers` de HuggingFace (`AutoModelForCTC`), así como con `parakeet.cpp` para inferencia en C++ o integración con LocalAI. También es compatible con servidores como TGI o vLLM si se adapta el pipeline, aunque no es lo común para ASR.
- **Latencia y throughput**: no hay datos publicados específicos para este modelo; se espera que sea similar al de `parakeet-ctc-0.6b` original, que es adecuado para tiempo real en GPU moderada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER en SAPC2 (48 hablantes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nvidia/parakeet-ctc-0.6b` | 608 M | 16 kHz | 32,35 % | CC-BY-4.0 | Público en HF |
| `dys-asr/parakeet-ctc-0.6b-sapc2` | 608 M | 16 kHz | 13,35 % | CC-BY-4.0 (derivada) | Público en HF |
| `dys-asr/parakeet-ctc-0.6b-soup` | 608 M | 16 kHz | **11,89 %** | CC-BY-4.0 (derivada) | Público en HF |

No hay modelos comparables con la misma especialización en habla disártrica en el momento de la información disponible; el resto de modelos ASR generalistas (p. ej., Whisper large-v3) no tienen datos publicados sobre este conjunto.

## Limitaciones y advertencias

- La ganancia de 0,19 puntos de WER sobre el mejor ingrediente es pequeña y fue seleccionada sobre el mismo conjunto de evaluación reportado, por lo que 11,89 % es el resultado optimista.
- No hay comparación justa con los modelos hermanos en sus propios conjuntos de test, ya que uno de los ingredientes (`parakeet-ctc-0.6b-all`) se entrenó sobre SAPC1 dev, que comparte hablantes con SAPC2 dev.
- El conjunto de evaluación excluye por completo el habla de personas con Parkinson (todos los hablantes de Parkinson de SAPC2 dev aparecen en SAPC1 dev), por lo que el rendimiento para esa etiología no está medido.
- El modelo solo acepta audio de 16 kHz mono y solo soporta inglés.
- La salida es en mayúsculas y sin puntuación, y los números se escriben como palabras (no hay caracteres de dígitos en el tokenizador). Si se evalúa el modelo, hay que verbalizar las referencias de la misma manera.
- La precisión varía enormemente entre hablantes: WER individual de 0,73 % a 70,88 %, con 3 de 48 hablantes por encima del 30 %.
- Solo se usó un seed por ingrediente; no se reporta la varianza de los fine-tunes.
- La licencia `speech-accessibility-project-dua` es una licencia de uso específico para el proyecto de accesibilidad del habla (Beckman Institute, UIUC). Debe revisarse si el uso comercial está permitido; no es una licencia Apache estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dys-asr/parakeet-ctc-0.6b-soup
- Modelo base original: https://huggingface.co/nvidia/parakeet-ctc-0.6b
- Ingrediente `sapc2`: https://huggingface.co/dys-asr/parakeet-ctc-0.6b-sapc2
- Implementación de inferencia en C++ (parakeet.cpp): https://github.com/mudler/parakeet.cpp
- Página del Speech Accessibility Project: https://speechaccessibilityproject.beckman.illinois.edu/
