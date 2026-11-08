# phelipescript/ddsd-ptbr-bertimbau-sem-correcao

## Resumen

`phelipescript/ddsd-ptbr-bertimbau-sem-correcao` es un clasificador binario de texto en portugués brasileño para la tarea de detección de habla dirigida a dispositivos (DDSD, *device-directed speech detection*): distinguir si una frase va dirigida a un asistente de voz (clase DD) o es cualquier otra intervención (clase NDD). Se construye mediante *fine-tuning* del modelo base `neuralmind/bert-base-portuguese-cased` (BERTimbau base, 108,9 millones de parámetros) y se publica con licencia MIT.

El modelo es, por decisión explícita de su autor, un **modelo de control** y no está pensado para uso en producción. Se entrenó sobre la configuración `sem_correcao` del corpus `phelipescript/ddsd-ptbr-corpus`, en la que el tamaño de la frase correlaciona con la etiqueta hasta el punto de que la longitud por sí sola alcanza un AUC de 0,86. El objetivo es medir, dentro de un trabajo de fin de grado, cuánto del rendimiento aparente de un detector DDSD procede de ese atajo espurio y cuánto de señales lingüísticas reales.

Su interés técnico reside precisamente en ese papel de contraste: cuantifica el efecto de un sesgo de longitud en un clasificador BERT y documenta el coste en falsas activaciones sobre transcripciones reales de conversación (27,2 % frente al 6,3 % del modelo corregido). No se han publicado resultados de benchmarks estándar (MMLU, GLUE y similares) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BERTimbau base, variante *cased*) |
| Parametros totales | 108.924.674 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens máximo arquitectónico; el autor entrena y evalúa con truncado a 128 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; el repo solo contiene safetensors en precisión completa) |
| Idiomas soportados | portugués (pt), con normalización específica para portugués brasileño |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es un BERT base estándar (12 capas, atención multi-cabeza, encoder bidireccional) inicializado desde `neuralmind/bert-base-portuguese-cased`, preentrenado sobre el corpus BrWaC con enmascaramiento de palabra completa. Sobre ese checkpoint se añade una cabeza de clasificación de secuencia con dos etiquetas (DD y NDD) y se ajusta de forma supervisada.

El entrenamiento usa la configuración `sem_correcao` del corpus: 93.144 frases de entrenamiento (46.573 DD y 46.571 NDD) y 11.664 de validación (5.833 DD y 5.831 NDD), con balanceo 1:1 global en lugar de por franja de longitud. Hiperparámetros: tasa de aprendizaje 2e-5, lote 32, hasta 4 épocas, truncado a 128 tokens, calentamiento del 10 %, dropout 0,1, *weight decay* 0,01, planificador lineal y precisión mixta bf16. Se seleccionó el checkpoint del paso 11.644 (época 4) por mayor F1 macro en validación, con parada temprana de paciencia 2. Una única semilla (42). El entrenamiento se ejecutó en una Apple M5 con GPU vía MPS y 16 GB de memoria unificada, en 57 minutos.

Dos detalles de diseño condicionan el uso: la normalización obligatoria del texto (eliminación de diacríticos vía NFKD, minúsculas y sustitución de puntuación y símbolos por espacios) y un umbral de decisión de 0,07, elegido sobre una rejilla de 0,005 a 0,995 con paso 0,005 para maximizar el F1 macro en validación. El umbral por defecto de 0,5 (argmax del pipeline) no es el correcto para este modelo.

## Capacidades

- Clasificación binaria de texto (DD frente a NDD) en portugués brasileño, con salida de probabilidad calibrada mediante umbral configurable.
- Detección de habla dirigida a un asistente de voz a partir de una única frase, sin contexto conversacional adicional.
- Funcionamiento como línea base de control en experimentos de sesgo de longitud y en estudios de robustez de detectores DDSD.
- Inferencia rápida en CPU para frases cortas, dado el tamaño del modelo (108,9 M de parámetros) y el truncado a 128 tokens.
- No soporta *tool calling*, ni razonamiento multi-paso, ni agentes, ni visión, ni audio, ni modo *thinking*: es un encoder de clasificación, no un modelo generativo.
- Cobertura multilingüe limitada al portugués; el vocabulario y el preentrenamiento son específicos de esa lengua.

## Casos de uso

- Reproducción de experimentos académicos sobre sesgo de longitud: sirve como contrapunto exacto del modelo corregido en un mismo *pipeline* de evaluación, permitiendo aislar cuánta precisión aporta el atajo del tamaño de frase frente a la señal lingüística.
- Auditoría de conjuntos de datos DDSD: comparar las métricas de este modelo sobre un corpus nuevo con las del modelo corregido revela si el corpus evaluado contiene correlación espuria entre longitud y etiqueta.
- Enseñanza de *fine-tuning* con BERT en portugués: el repositorio incluye el script de normalización, los hiperparámetros completos y el fichero `treinamento.json` con métricas por época, lo que lo convierte en un ejemplo reproducible de extremo a extremo en hardware de consumo.
- Análisis de falsos positivos en asistentes de voz: las tasas de activación sobre CORAA, NURC-SP y TAGARELA (34,9 %, 20,5 % y 26,1 %) documentan el coste real de desplegar un detector entrenado con datos sesgados.
- Prueba de concepto de detección de *wake words* implícitas: con el umbral de 0,07 y la normalización adecuada, clasifica frases imperativas cortas con alta probabilidad, útil para prototipos internos siempre que se asuma su sesgo.
- Validación de metodologías de corrección de sesgo: cualquier técnica nueva de mitigación puede medirse contra este control para cuantificar su ganancia respecto al estado sin corregir.

## Benchmarks y rendimiento

Evaluación sobre el conjunto de test `com_correcao` (11.616 frases, sin solapamiento con el entrenamiento, donde la longitud no predice la clase):

| Métrica | Este modelo | BERTimbau con corrección |
|---|---|---|
| Acurácia | 92,21 % | 98,32 % |
| F1 macro | 0,9218 | 0,9832 |
| ROC-AUC | 0,9714 | 0,9979 |
| EER | 8,32 % | 1,72 % |

Sobre el test del propio corpus sin corrección (11.630 frases, con el atajo del tamaño) la acurácia asciende al 98,87 %, evidencia directa de que parte del acierto procede del atajo.

Falsas activaciones sobre transcripciones reales (todas las frases son NDD, de modo que toda activación es un falso positivo):

| Corpus | Frases | Este modelo | BERTimbau con corrección |
|---|---|---|---|
| CORAA | 1.000 | 34,9 % | 4,7 % |
| NURC-SP | 1.000 | 20,5 % | 6,6 % |
| TAGARELA | 912 | 26,1 % | 7,8 % |
| Total | 2.912 | 27,2 % | 6,3 % |

Desglose por longitud de frase (frases / este modelo / modelo corregido): 2 palabras, 144, 87,5 % / 6,9 %; 3 palabras, 210, 79,0 % / 8,6 %; 4 palabras, 266, 58,3 % / 5,3 %; 5 palabras, 226, 44,7 % / 5,3 %; 6 palabras, 239, 36,8 % / 5,4 %; 7–8 palabras, 407, 24,6 % / 5,7 %; 9–10 palabras, 321, 9,0 % / 5,6 %; 11–13 palabras, 344, 3,5 % (dato del modelo corregido no disponible en la información proporcionada). El patrón confirma que el modelo penaliza frases cortas como si fueran NDD, exactamente el atajo aprendido.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,45 GB de pesos más activaciones; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con latencia de milisegundos por frase. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es más que suficiente; el autor entrenó en una Apple M5 con MPS y 16 GB de memoria unificada.
- Cabe en GPU de consumo y en placas integradas; también en entornos sin GPU.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` (método usado por el autor), `text-embeddings-inference` (etiqueta declarada en el repo), exportación a ONNX y servidores de clasificación estándar. Para inferencia en CPU de bajo consumo, la conversión a ONNX o a un runtime ligero es la vía natural.
- Throughput y latencia: no disponibles de forma medida en la información proporcionada; por el tamaño del modelo y el truncado a 128 tokens, se espera un rendimiento alto en lote sobre CPU moderna, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`ddsd-ptbr-bertimbau-sem-correcao`) | 108,9 M | 512 (entrena a 128) | Clasificación DDSD binaria, control con sesgo | MIT | Hugging Face |
| `phelipescript/ddsd-ptbr-bertimbau` | 108,9 M (misma receta) | 512 (entrena a 128) | Clasificación DDSD binaria, corpus corregido | MIT | Hugging Face |
| `neuralmind/bert-base-portuguese-cased` | 108,9 M | 512 | Modelo base de propósito general (encoder) | MIT | Hugging Face |
| BERTimbau Large | no disponible en la información proporcionada | 512 | Modelo base de propósito general | MIT | Hugging Face / GitHub |

La comparación relevante es con el modelo corregido del mismo autor: misma arquitectura, mismos hiperparámetros y misma semilla, diferenciándose solo en el corpus de entrenamiento. La brecha de 6,1 puntos de acurácia en el test corregido y de 20,9 puntos de falsas activaciones en conversación real cuantifica el coste del sesgo.

## Limitaciones y advertencias

- **No apto para producción.** El propio autor lo declara modelo de control: su umbral de 0,07 y su sesgo de longitud producen un 27,2 % de falsas activaciones sobre conversación real, inviable en un asistente de voz desplegado.
- Sesgo de longitud severo: frases de 2 palabras se clasifican como DD el 87,5 % de las veces, lo que refleja el desequilibrio del corpus de entrenamiento y no una señal lingüística.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí de calibración engañosa: la probabilidad emitida no es fiable sin aplicar el umbral correcto y la normalización exacta del texto.
- Requiere replicar la normalización del entrenamiento (sin diacríticos, minúsculas, puntuación y símbolos convertidos en espacios); cualquier desviación degrada las métricas de forma no medida.
- El pipeline `text-classification` de `transformers` decide por argmax (umbral 0,5), lo que produce resultados incorrectos con este modelo; hay que leer `config.decision_threshold`.
- Cobertura limitada al portugués brasileño; no se ha evaluado en portugués europeo ni en otras lenguas.
- Entrenado con una única semilla, por lo que no hay estimación de varianza entre ejecuciones.
- Licencia MIT permite uso comercial, pero el autor desaconseja explícitamente el uso del modelo; la licencia no exime de las consecuencias de desplegar un clasificador sesgado.
- Contexto efectivo de 128 tokens en entrenamiento y evaluación: frases más largas se truncan y pueden perder la señal relevante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phelipescript/ddsd-ptbr-bertimbau-sem-correcao
- Modelo corregido (recomendado por el autor): https://huggingface.co/phelipescript/ddsd-ptbr-bertimbau
- Dataset del corpus: https://huggingface.co/datasets/phelipescript/ddsd-ptbr-corpus
- Métricas de entrenamiento por época: https://huggingface.co/phelipescript/ddsd-ptbr-bertimbau-sem-correcao/blob/main/treinamento.json
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Repositorio de BERTimbau en GitHub: https://github.com/ClaudioSS01/portuguese-Bertimbau
