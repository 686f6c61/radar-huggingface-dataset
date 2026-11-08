# phelipescript/ddsd-ptbr-albertina

## Resumen

El modelo `phelipescript/ddsd-ptbr-albertina` es un clasificador de texto en portugués brasileño especializado en la detección de habla dirigida al ordenador (DDSD, por sus siglas en inglés). Dado el transcript de una frase, predice si fue dirigida al sistema (DD) o no (NDD), lo que permite construir asistentes de voz sin palabra de activación. Se trata de un fine-tuning del encoder `PORTULAN/albertina-100m-portuguese-ptbr-encoder` sobre un corpus sintético en el que se corrigió el sesgo de longitud de las frases.

El modelo resuelve un problema concreto de los asistentes de voz: distinguir entre una orden y una conversación ajena, algo crítico cuando no existe una wake word que active el sistema. Con 139,2 millones de parámetros y una ventana de 128 tokens, es un modelo compacto pensado para integrarse en un pipeline en tiempo real (micrófono, detector de voz, Whisper large-v3-turbo, clasificador, decisión). Forma parte de un trabajo de fin de grado en el SENAC Santo Amaro (2026) y se publica con licencia MIT.

Su relevancia radica en la combinación de un rendimiento alto en test interno (98,00% de accuracy) con una tasa de falsas activaciones del 5,4% sobre transcripciones de conversación real, un dato poco habitual en modelos de esta categoría y tamaño. No obstante, el propio autor advierte de que el modelo debe usarse con la normalización de texto del entrenamiento y con el umbral de decisión almacenado en `config.json` (0,62), no con argmax.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa, familia Albertina) |
| Parametros totales | 139.193.858 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud de entrenamiento y evaluación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | pt (portugués brasileño) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de la familia DeBERTa, concretamente el checkpoint `PORTULAN/albertina-100m-portuguese-ptbr-encoder`. Aunque el nombre comercial indica "100m", los pesos contienen 139,2 millones de parámetros, ya que la cifra de 100 millones se refiere solo al codificador sin las embeddings. La tarea se formula como clasificación de secuencias con dos etiquetas (DD y NDD).

El fine-tuning se realizó sobre el corpus sintético `phelipescript/ddsd-ptbr-corpus`, en la configuración `com_correcao`, que corrige el sesgo de longitud de las frases. El conjunto de entrenamiento contiene 93.150 frases (mitad DD, mitad NDD) y el de validación 11.672 (también equilibrado). Se usó la semilla 42, learning rate 2e-5, batch de 32, hasta 4 épocas, truncamiento a 128 tokens, warmup del 10%, dropout 0,1, weight decay 0,01, scheduler lineal y precisión mixta fp32. El checkpoint final corresponde al paso 11.644 (época 4) y se eligió por el mayor F1 macro en validación, con parada temprana de paciencia 2. El umbral de decisión de 0,62 se seleccionó sobre una rejilla de 0,005 a 0,995 con paso 0,005, maximizando el F1 macro en validación. El entrenamiento se llevó a cabo en una Apple M5 con GPU vía MPS y 16 GB de memoria unificada, con una duración de 2 horas y 24 minutos.

## Capacidades

- Clasificación binaria de texto: distingue entre habla dirigida al ordenador (DD) y habla no dirigida (NDD).
- Detección de habla dirigida al ordenador sin palabra de activación, a partir del transcript.
- Funciona sobre texto ya transcrito, por lo que se integra detrás de un sistema ASR (por ejemplo, Whisper large-v3-turbo).
- Soporte de umbral de decisión configurable mediante `config.decision_threshold` (0,62), lo que permite ajustar el punto de operación.
- Normalización de entrada específica: sin acentos, en minúsculas y con puntuación y símbolos sustituidos por espacios.
- Capacidad multilingüe: no disponible; el modelo está entrenado y evaluado únicamente en portugués brasileño.
- Tool calling / function calling: no disponible; es un clasificador, no un modelo generativo.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistentes de voz sin wake word: el modelo recibe la transcripción de cada frase y decide si va dirigida al sistema, permitiendo activar el asistente solo cuando corresponde. Es adecuado por su bajo coste computacional y su umbral calibrado para reducir falsos positivos.
- Filtrado previo en pipelines de ASR: colocado después de Whisper large-v3-turbo, descarta las frases que no son órdenes antes de pasarlas al motor de intenciones, reduciendo el consumo de recursos en las etapas posteriores.
- Sistemas de dictado y notas de voz: distingue entre lo que el usuario dicta al sistema y lo que comenta a otra persona, evitando transcribir conversaciones ajenas como si fueran dictado.
- Domótica y control por voz en el hogar: integrado en un asistente local, permite que el sistema ignore conversaciones de fondo y solo reaccione a peticiones explícitas, con un umbral ajustable según la tolerancia a falsos positivos.
- Atención al cliente telefónica automatizada: en un IVR con transcripción en tiempo real, clasifica si el usuario se dirige al sistema o habla con otra persona, mejorando la segmentación de turnos.
- Investigación en interacción persona-máquina: sirve como línea base reproducible (semilla 42, corpus público, hiperparámetros documentados) para estudiar DDSD textual en portugués brasileño.
- Moderación y análisis de conversaciones: permite etiquetar automáticamente transcripciones para separar intervenciones dirigidas a un dispositivo de las dirigidas a personas.

## Benchmarks y rendimiento

Test interno sobre 11.616 frases sintéticas del conjunto `com_correcao` (mitad DD, mitad NDD), evaluado una sola vez con el umbral congelado:

| Metrica | Este modelo (semilla 42) | Media de 3 semillas ± desviacion |
|---|---|---|
| Accuracy | 98,00% | 97,88% ± 0,12 p.p. |
| F1 macro | 0,9800 | 0,9788 ± 0,0012 |
| ROC-AUC | 0,9971 | 0,9969 ± 0,0002 |
| EER | 2,10% | 2,19% ± 0,09 p.p. |

Falsas activaciones sobre transcripciones de conversaciones reales (CORAA, NURC-SP y TAGARELA), todas ellas NDD, por lo que toda activación es falsa:

| Corpus | Frases | Este modelo | Albertina sin correccion |
|---|---|---|---|
| CORAA, NURC-SP, TAGARELA | no disponible en el extracto | 5,4% de falsas activaciones | no disponible en el extracto |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 139,2 millones de parámetros; en fp32 ocupa aproximadamente 0,56 GB y en fp16 alrededor de 0,28 GB, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; A100, H100, RTX 4090 o RTX 3090 quedan sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.) e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: transformers (librería nativa), vLLM, TGI y llama.cpp no aplican de forma directa por ser un clasificador; para producción conviene exportar a ONNX o usar TorchScript. El autor documenta el uso con `transformers` 5.20.1 y `torch` 2.14.1.
- Latencia y throughput estimados: no disponible en la información proporcionada; el entrenamiento se realizó en una Apple M5 con MPS en 2 h 24 min, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phelipescript/ddsd-ptbr-albertina | 139,2 M | 128 tokens | Clasificacion DDSD (pt-BR) | MIT | Hugging Face |
| phelipescript/ddsd-ptbr-bertimbau | no disponible | no disponible | Clasificacion DDSD (pt-BR), opcion por defecto del sistema del TCC | no disponible | Hugging Face |
| PORTULAN/albertina-100m-portuguese-ptbr-encoder | 139,2 M (pesos) | no disponible | Encoder base (pt) | no disponible | Hugging Face |
| Albertina sin correccion (variante del mismo autor) | 139,2 M | 128 tokens | Clasificacion DDSD (pt-BR) sin correccion de sesgo de longitud | no disponible | Referenciada en la model card |

## Limitaciones y advertencias

- Sesgos conocidos: el corpus de entrenamiento es sintético y el autor corrige explícitamente un sesgo de longitud de frase; aun así, el modelo puede comportarse de forma distinta con frases muy cortas o muy largas.
- Riesgo de falsas activaciones: sobre conversaciones reales se observa un 5,4% de falsas activaciones, lo que en producción puede traducirse en activaciones no deseadas del asistente.
- Normalización obligatoria: si no se aplica la función `normalizar` del entrenamiento (sin acentos, minúsculas, puntuación y símbolos a espacios), el rendimiento puede degradarse de forma significativa.
- Umbral de decisión: no debe usarse argmax (equivalente a 0,5); hay que leer `config.decision_threshold` (0,62). El pipeline `text-classification` de transformers usa argmax por defecto, lo que introduce un error silencioso.
- Limitación de contexto: ventana de 128 tokens; frases más largas se truncan, lo que puede perder información relevante.
- Limitación de idioma: solo portugués brasileño; no se ha evaluado en otras variantes del portugués ni en otros idiomas.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base Albertina puede tener condiciones propias que conviene revisar antes de un despliegue comercial.
- Caveat de producción: es un clasificador, no un generador; no soporta tool calling ni razonamiento multi-paso. Además, las métricas publicadas son internas y sobre corpus sintético, por lo que la generalización a dominios reales debe validarse.
- El modelo se publica como parte de un TCC y con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phelipescript/ddsd-ptbr-albertina
- Corpus de entrenamiento: https://huggingface.co/datasets/phelipescript/ddsd-ptbr-corpus
- Modelo base: https://huggingface.co/PORTULAN/albertina-100m-portuguese-ptbr-encoder
- Clasificador por defecto del sistema del TCC: https://huggingface.co/phelipescript/ddsd-ptbr-bertimbau
- Métricas de entrenamiento: https://huggingface.co/phelipescript/ddsd-ptbr-albertina/blob/main/treinamento.json
