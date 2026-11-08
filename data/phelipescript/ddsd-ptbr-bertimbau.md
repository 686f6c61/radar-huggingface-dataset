# phelipescript/ddsd-ptbr-bertimbau

## Resumen

`phelipescript/ddsd-ptbr-bertimbau` es un clasificador de texto en portugués brasileño para la tarea de detección de habla dirigida al dispositivo (DDSD, *device-directed speech detection*). Dado el transcript de una locución, predice si esta se dirigió al ordenador (DD) o no (NDD), lo que permite construir asistentes de voz sin palabra de activación. Lo desarrolla phelipescript como parte de un trabajo de fin de grado en el SENAC Santo Amaro (2026).

El modelo es un fine-tuning de BERTimbau (`neuralmind/bert-base-portuguese-cased`), un transformer encoder de tipo BERT con 108,9 millones de parámetros y vocabulario en portugués con distinción de mayúsculas. Se entrena sobre un corpus sintético (`phelipescript/ddsd-ptbr-corpus`, configuración `com_correcao`) en el que se corrigió el sesgo de longitud de las frases, un problema que en la versión sin corrección disparaba las falsas activaciones sobre conversación real hasta el 27,2 %.

Su relevancia práctica está en el pipeline completo que propone: micrófono, detector de voz, Whisper large-v3-turbo para transcripción y este clasificador como decisor. Frente al BERTimbau sin corrección, reduce las falsas activaciones en transcripciones reales del 27,2 % al 6,3 %, manteniendo un 98,32 % de accuracy en test sintético interno. La licencia MIT y su tamaño compacto (0,4 GB de repositorio) lo hacen desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BERTimbau base, cased) |
| Parametros totales | 108.924.674 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite de BERT); entrenado y evaluado con truncado a 128 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | portugués brasileño (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura es un BERT base con 108,9 millones de parámetros, inicializado desde `neuralmind/bert-base-portuguese-cased` y adaptado a clasificación de secuencias con dos etiquetas (DD y NDD). El entrenamiento usa el corpus sintético `phelipescript/ddsd-ptbr-corpus` en su configuración `com_correcao`: 93.150 frases de entrenamiento (mitad DD, mitad NDD) y 11.672 de validación (también balanceadas). La corrección de sesgo de longitud es la innovación central: sin ella, el modelo aprendía atajos de longitud de frase que inflaban las falsas activaciones sobre habla espontánea.

Los hiperparámetros son learning rate 2e-5, batch de 32, hasta 4 épocas, truncado a 128 tokens, warmup del 10 %, dropout 0,1, weight decay 0,01, scheduler lineal y precisión mixta bf16. Se eligió la semilla 44 (de 42, 43 y 44) por mayor F1 macro en validación, con checkpoint en el paso 8.733 (época 3 de 4) y parada temprana con paciencia 2. El umbral de decisión se fijó en 0,685, optimizando F1 macro sobre una rejilla de 0,005 a 0,995 con paso 0,005. El entrenamiento completo se hizo en una Apple M5 con GPU vía MPS y 16 GB de memoria unificada, en 55 minutos.

## Capacidades

- Clasificación binaria de texto: DD (dirigido al ordenador) frente a NDD (no dirigido), con probabilidad calibrada mediante umbral configurable.
- Detección de habla dirigida al dispositivo a partir de transcript, sin necesidad de palabra de activación.
- Funcionamiento sobre texto normalizado: sin acentos, en minúsculas y con puntuación y símbolos convertidos en espacios.
- Decisión por umbral (`decision_threshold` = 0,685) en lugar de argmax, lo que permite ajustar el punto de operación entre falsos positivos y falsos negativos.
- Integración directa con `transformers` (`AutoModelForSequenceClassification`, `AutoTokenizer`) y compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento: es un clasificador encoder puro.

## Casos de uso

- Asistentes de voz sin palabra de activación: el clasificador recibe el transcript de cada locución (producido por Whisper u otro ASR) y decide si debe activarse el asistente, eliminando la necesidad de decir "oye, asistente". Es el caso de uso del sistema en tiempo real del propio TCC.
- Filtrado de falsas activaciones en asistentes con wake word: como segunda etapa tras la detección por palabra clave, descarta activaciones accidentales cuando el usuario habla de "Alexa" o similar en una conversación con otra persona.
- Anotación y segmentación de corpus de habla: clasificar automáticamente transcripciones de reuniones o entrevistas para separar intervenciones dirigidas a un sistema de las dirigidas a personas.
- Sistemas de dictado y control por voz en escritorio: decidir si una frase transcrita es un comando ("abre el navegador y busca el tiempo") o una frase de conversación que no debe ejecutarse.
- Investigación en DDSD en portugués: punto de partida reproducible (licencia MIT, corpus y métricas publicadas) para comparar enfoques textuales frente a acústicos en detección de habla dirigida al dispositivo.
- Moderación de interacción en interfaces conversacionales: evitar que un asistente responda a comentarios dirigidos a terceros, reduciendo respuestas no solicitadas en entornos domésticos.
- Despliegue en dispositivos de borde: con 108,9 millones de parámetros y 0,4 GB de repositorio, cabe en CPU o GPU de gama baja, lo que permite ejecutarlo localmente junto al ASR.

## Benchmarks y rendimiento

Test interno sintético (11.616 frases del test `com_correcao`, mitad DD y mitad NDD, umbral congelado):

| Metrica | Este modelo (semilla 44) | Media de 3 semillas ± desviacion |
|---|---|---|
| Accuracy | 98,32 % | 98,22 % ± 0,10 p.p. |
| F1 macro | 0,9832 | 0,9822 ± 0,0010 |
| ROC-AUC | 0,9979 | 0,9977 ± 0,0002 |
| EER | 1,72 % | 1,78 % ± 0,06 p.p. |

Transcripciones de conversación real (todas NDD, por lo que toda activación es falsa):

| Corpus | Frases | Este modelo | BERTimbau sin correccion |
|---|---|---|---|
| CORAA | 1.000 | 4,7 % | 34,9 % |
| NURC-SP | 1.000 | 6,6 % | 20,5 % |
| TAGARELA | 912 | 7,8 % | 26,1 % |
| Total | 2.912 | 6,3 % | 27,2 % |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 para 108,9 millones de parámetros (unos 0,44 GB de pesos); en fp16 aproximadamente 0,22 GB. Con overhead de tokenizer y activaciones, cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, cualquier modelo desde una GTX 1650 o RTX 3060 en adelante es sobrado. El autor entrenó en Apple M5 con MPS y 16 GB de memoria unificada.
- Cabe en GPU consumer: sí, en todas las RTX y en GPUs integradas con suficiente RAM.
- Opciones de despliegue: `transformers` (referencia del autor), Text Embeddings Inference (tag del repo), exportación a ONNX no documentada por el autor. No se documenta soporte de llama.cpp ni Ollama, al ser un encoder de clasificación y no un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento completo (hasta 4 épocas sobre 93.150 frases) tardó 55 minutos en Apple M5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `phelipescript/ddsd-ptbr-bertimbau` | 108,9 M | 512 (entrenado a 128) | Clasificación DD/NDD en pt-BR | MIT | Hugging Face |
| `neuralmind/bert-base-portuguese-cased` (BERTimbau) | 108,9 M | 512 | Modelo base de lenguaje pt-BR | no disponible en la información | Hugging Face |
| `tubyneto/bertimbau` | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| BERTimbau sin corrección de sesgo (variante del TCC) | 108,9 M | 512 | Clasificación DD/NDD en pt-BR | no disponible | Referencia interna del TCC |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa se limita a la variante sin corrección del propio trabajo (27,2 % de falsas activaciones frente al 6,3 % de este modelo).

## Limitaciones y advertencias

- Dominio restringido: solo clasifica DD frente a NDD en portugués brasileño; no es un modelo de propósito general ni genera texto.
- Dependencia crítica del preprocesado: hay que normalizar exactamente como en entrenamiento (sin acentos, minúsculas, puntuación y símbolos a espacios). Omitirlo degrada las predicciones.
- Dependencia crítica del umbral: el `pipeline("text-classification")` de transformers decide por argmax (equivalente a umbral 0,5), lo que no es el punto de operación recomendado. Hay que usar `config.decision_threshold` (0,685).
- Riesgo de falsas activaciones en habla espontánea: 6,3 % en transcripciones reales (CORAA, NURC-SP, TAGARELA); la semilla 44 es la peor de las tres en este aspecto. En producción conviene añadir una etapa de confirmación o ajustar el umbral según el coste del falso positivo.
- Sesgo de dominio: entrenado con corpus sintético; el rendimiento puede degradarse con jerga, ruido de ASR, habla solapada o variantes dialectales no representadas.
- Limitación de longitud: truncado a 128 tokens en entrenamiento y evaluación; frases más largas pierden información.
- Sin evaluación de sesgos demográficos publicada: no hay datos sobre equidad por género, edad o región.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el modelo se publica con `inference: false` en la model card, por lo que la inferencia alojada en Hugging Face no está habilitada.
- Alucinación: al ser un clasificador, el riesgo se manifiesta como clasificaciones erróneas con alta confianza, no como texto inventado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phelipescript/ddsd-ptbr-bertimbau
- Corpus de entrenamiento: https://huggingface.co/datasets/phelipescript/ddsd-ptbr-corpus
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Métricas de entrenamiento por época: https://huggingface.co/phelipescript/ddsd-ptbr-bertimbau/blob/main/treinamento.json
- Modelo alternativo BERTimbau en Hugging Face: https://huggingface.co/tubyneto/bertimbau
