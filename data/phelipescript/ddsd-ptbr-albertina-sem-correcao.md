# phelipescript/ddsd-ptbr-albertina-sem-correcao

## Resumen

`phelipescript/ddsd-ptbr-albertina-sem-correcao` es un clasificador binario de texto en portugués brasileño para detección de habla dirigida a dispositivos (DDSD, *device-directed speech detection*). Distingue entre **DD** (frases dirigidas a un asistente de voz) y **NDD** (cualquier otra habla). El modelo se construye mediante *fine-tuning* del encoder `PORTULAN/albertina-100m-portuguese-ptbr-encoder` sobre el corpus `phelipescript/ddsd-ptbr-corpus`, en su configuración `sem_correcao`.

El modelo es explícitamente un **modelo de control** y no está pensado para uso en producción. Su propósito es servir de referencia en un trabajo de fin de carrera para medir el efecto de la corrección del sesgo de longitud: en el corpus sin corregir, el tamaño de la frase predice por sí solo la clase con un AUC de 0,86. Publicado con licencia MIT y pesos en safetensors, cuenta con 139.193.858 parámetros y una longitud máxima de entrada de 128 tokens.

Su relevancia es metodológica: permite cuantificar cuánto del rendimiento aparente de un clasificador DDSD se debe a atajos espurios (longitud de la frase) y no a señal acústica o lingüística real. El modelo corregido asociado, `phelipescript/ddsd-ptbr-albertina`, es el recomendado para cualquier uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DeBERTa (familia Albertina PT-BR), clasificación de secuencias con cabeza binaria |
| Parametros totales | 139.193.858 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | portugués (variante brasileña, `pt`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es un encoder de la familia BERT/DeBERTa, concretamente la versión Albertina PT-BR de 100M (el nombre "100m" cuenta solo el codificador, sin las embeddings; los pesos reales suman 139,2 millones de parámetros). Sobre el encoder se añade una cabeza de clasificación binaria `AutoModelForSequenceClassification` con dos etiquetas: DD y NDD. La entrada se trunca a 128 tokens y se normaliza antes de tokenizar: eliminación de diacríticos (NFKD sin marcas combinantes), conversión a minúsculas y sustitución de puntuación y símbolos por espacios, colapsando espacios múltiples.

El entrenamiento usa la configuración `sem_correcao` del corpus `phelipescript/ddsd-ptbr-corpus`: 93.144 frases de entrenamiento (46.573 DD y 46.571 NDD) y 11.664 de validación (5.833 DD y 5.831 NDD), con balanceo 1:1 global y no por franja de longitud. Hiperparámetros: tasa de aprendizaje 2e-5, lote 32, hasta 4 épocas, hasta 128 tokens, calentamiento del 10%, dropout 0,1, weight decay 0,01, planificador lineal y precisión mixta fp32. Semilla única 42. El checkpoint seleccionado es el paso 11.644 (época 4 de 4), el de mayor F1 macro en validación, con parada temprana de paciencia 2. El umbral de decisión se fija en 0,49, elegido por maximización de F1 macro en validación sobre una rejilla de 0,005 a 0,995 con paso 0,005. El entrenamiento se ejecutó en una Apple M5 (GPU vía MPS, 16 GB de memoria unificada) durante 2 h 44 min. No se documenta RLHF, DPO ni decodificación especulativa; es un clasificador supervisado estándar.

## Capacidades

- Clasificación binaria de texto: asigna una probabilidad de pertenencia a la clase DD frente a NDD.
- Detección de habla dirigida a dispositivos en portugués brasileño (frases como "Abre o navegador e procura a previsão do tempo").
- Salida calibrada con umbral configurable (`config.decision_threshold` = 0,49); el `pipeline` de `transformers` decide por argmax (equivalente a 0,5), lo que no es el modo previsto.
- Normalización de texto integrada en el flujo de uso (sin acentos, minúsculas, puntuación como separador).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.
- Capacidad multilingüe limitada al portugués brasileño; no se documenta rendimiento en otras variantes del portugués ni en otras lenguas.

## Casos de uso

- **Reproducción de resultados académicos**: el modelo existe para replicar la comparación de tesis entre corpus con y sin corrección del sesgo de longitud; se usaría cargando los pesos y evaluando sobre el conjunto de test `com_correcao` con el umbral 0,49.
- **Auditoría de sesgos en datasets de DDSD**: sirve para medir cuánto del rendimiento de un clasificador proviene del atajo de longitud de frase (AUC 0,86 del propio corpus), comparando sus métricas con las del modelo corregido.
- **Línea base (baseline) en experimentos de detección de *wake words* semánticas**: útil como referencia inferior frente a la que medir mejoras de arquitectura o de datos.
- **Análisis de falsas activaciones en transcripciones conversacionales**: permite cuantificar el porcentaje de activaciones espurias sobre corpus como CORAA, NURC-SP y TAGARELA (22,0 % global en este modelo).
- **Estudio del efecto del umbral de decisión**: al tener un umbral calibrado distinto de 0,5, se puede analizar la sensibilidad de la precisión y del recall al mover el umbral en tareas de activación por voz.
- **Docencia en evaluación de clasificadores**: ejemplo práctico de cómo un dataset desbalanceado por longitud infla métricas y de cómo detectarlo mediante análisis por franjas de tamaño de frase.
- **Validación de pipelines de preprocesado**: comprobar que la función de normalización (NFKD, minúsculas, puntuación a espacio) se aplica correctamente antes de la tokenización, dado que el modelo se entrenó con ese preprocesado exacto.

## Benchmarks y rendimiento

Test `com_correcao` (11.616 frases; ninguna presente en el entrenamiento de este modelo, ya que los 9.527 textos en común se retiraron del corpus sin corrección antes del balanceo):

| Métrica | Este modelo (sem correção) | Albertina con corrección |
|---|---|---|
| Acurácia | 92,01 % | 98,00 % |
| F1 macro | 0,9199 | 0,9800 |
| ROC-AUC | 0,9692 | 0,9971 |
| EER | 8,78 % | 2,10 % |

Test del propio corpus sin corrección (11.630 frases, con el atajo de longitud presente): accuracy 98,65 %, valor inflado por el atajo.

Falsas activaciones sobre transcripciones reales (todas las frases son NDD, de modo que toda activación es falsa):

| Corpus | Frases | Este modelo | Albertina con corrección |
|---|---|---|---|
| CORAA | 1.000 | 28,1 % | 3,5 % |
| NURC-SP | 1.000 | 16,2 % | 5,3 % |
| TAGARELA | 912 | 21,7 % | 7,5 % |
| **Total** | **2.912** | **22,0 %** | **5,4 %** |

Falsas activaciones por longitud de frase:

| Palabras | Frases | Este modelo | Albertina con corrección |
|---|---|---|---|
| 2 | 144 | 83,3 % | 9,7 % |
| 3 | 210 | 75,7 % | 8,1 % |
| 4 | 266 | 50,0 % | 1,5 % |
| 5 | 226 | 33,2 % | 3,1 % |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,56 GB para los pesos (139,2 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica cabe en cualquier GPU con 2 GB o más.
- En fp16/bf16: alrededor de 0,28 GB de pesos; cuantización a int8 reduciría a ~0,14 GB, aunque no se publican variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo se entrenó en Apple M5 con MPS y 16 GB unificados, lo que da una idea de la escala.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090, e incluso en CPU con latencias aceptables para clasificación de frases cortas.
- Opciones de despliegue: `transformers` (referencia), `optimum`/ONNX Runtime, TorchScript; `vLLM` y `llama.cpp` no están documentados para este modelo y no se recomiendan sin validación previa.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (139 M de parámetros y 128 tokens máximos), se espera un throughput alto en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `phelipescript/ddsd-ptbr-albertina-sem-correcao` (este) | 139,2 M | 128 tokens | Clasificación DD/NDD (control) | MIT | Hugging Face |
| `phelipescript/ddsd-ptbr-albertina` | 139,2 M (mismo base) | 128 tokens | Clasificación DD/NDD (corregido) | MIT | Hugging Face |
| `PORTULAN/albertina-100m-portuguese-ptbr-encoder` | 139,2 M en pesos | 512 tokens (típico en BERT) | Encoder base, sin cabeza de clasificación | no disponible en la información | Hugging Face |
| `PORTULAN/albertina-900m-portuguese-ptbr-encoder-brwac` | ~900 M (encoder) | no disponible | Encoder base de mayor tamaño | no disponible en la información | Hugging Face |

La comparación directa más relevante es con `phelipescript/ddsd-ptbr-albertina`, que comparte receta, corpus base y arquitectura, y difiere solo en la corrección del sesgo de longitud: 98,00 % frente a 92,01 % de accuracy en el test corregido, y 5,4 % frente a 22,0 % de falsas activaciones en conversación real.

## Limitaciones y advertencias

- **Modelo de control, no apto para producción**: el propio autor lo declara explícitamente; debe usarse solo para reproducir la comparación de la tesis.
- **Sesgo de longitud de frase**: en el corpus de entrenamiento, la longitud predice la clase con AUC 0,86; el modelo aprende ese atajo y lo explota en inferencia (83,3 % de falsas activaciones en frases de 2 palabras).
- **Alto índice de falsas activaciones en conversación real**: 22,0 % global en CORAA, NURC-SP y TAGARELA, frente al 5,4 % del modelo corregido.
- **Riesgo de alucinación**: no aplica en el sentido generativo (es un clasificador), pero sí existe riesgo de clasificaciones erróneas por sobreajuste a la longitud.
- **Longitud de contexto limitada a 128 tokens**: frases más largas se truncan, lo que puede alterar la predicción.
- **Dependencia estricta del preprocesado**: sin la normalización del entrenamiento (sin acentos, minúsculas, puntuación a espacio), el rendimiento puede degradarse de forma no documentada.
- **Umbral distinto de 0,5**: usar el `pipeline` por defecto (argmax) equivale a umbral 0,5 y no es el modo previsto; debe usarse `config.decision_threshold` (0,49).
- **Idioma único**: solo portugués brasileño; no se documenta comportamiento en portugués europeo ni en otras lenguas.
- **Licencia MIT**: permite uso comercial, pero al tratarse de un modelo de control, su uso comercial no está recomendado por el propio autor.
- **Sin datos de cuantización ni despliegue alternativo**: no se publican variantes GGUF, ONNX ni AWQ; cualquier conversión corre por cuenta del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phelipescript/ddsd-ptbr-albertina-sem-correcao
- Modelo recomendado (corregido): https://huggingface.co/phelipescript/ddsd-ptbr-albertina
- Dataset del corpus: https://huggingface.co/datasets/phelipescript/ddsd-ptbr-corpus
- Modelo base: https://huggingface.co/PORTULAN/albertina-100m-portuguese-ptbr-encoder
- Albertina 900M PT-BR BRWaC: https://huggingface.co/PORTULAN/albertina-900m-portuguese-ptbr-encoder-brwac
- Página de modelos Albertina PT-* de PORTULAN CLARIN: https://portulanclarin.net/models/
- Métricas de entrenamiento: `treinamento.json` (incluido en el repositorio del modelo)
