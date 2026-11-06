# hansjio/tsektxt-roberta-tagalog

## Resumen

TsekTxt RoBERTa-Tagalog es un clasificador binario de credibilidad para textos periodísticos en filipino/tagalo y taglish. Lo desarrolla hansjio como parte de una tesis de grado en Ciencias de la Computación (mayo de 2026) titulada *Determining the Top Predictors of Taglish Election Misinformation Through a Comparative Detection and Corpus Analysis Using RoBERTa-Tagalog, mBERT, and XLM-RoBERTa*. El modelo etiqueta un texto como `credible` o `not_credible` según su parecido con artículos publicados por fuentes etiquetadas como fiables o no fiables.

Se trata de un fine-tuning del checkpoint `jcblaise/roberta-tagalog-base`, un RoBERTa base preentrenado sobre el corpus TLUnified para filipino. Con 109.083.650 parámetros y una longitud máxima de secuencia de 128 tokens durante el entrenamiento, es un modelo compacto orientado a clasificación de texto, no a generación. Su relevancia actual radica en que aborda un nicho poco cubierto (desinformación en tagalo/taglish) y publica una comparativa controlada frente a mBERT y XLM-RoBERTa con idénticos datos y ajustes.

Es importante subrayar desde el principio que el propio autor advierte que el modelo predice similitud estilística con fuentes etiquetadas, no veracidad factual, y que sus métricas internas están infladas por fuga de información de la fuente en las etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder-only), fine-tuning de `jcblaise/roberta-tagalog-base` |
| Parametros totales | 109.083.650 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de secuencia usada en entrenamiento; la arquitectura base admite 512) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se documentan GGUF ni otras) |
| Idiomas soportados | tl (tagalo), en (inglés); incluye taglish según la model card |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only tipo RoBERTa, heredado íntegramente del checkpoint base `jcblaise/roberta-tagalog-base`, al que se le añade una cabeza de clasificación binaria. El fine-tuning se realizó con Hugging Face `Trainer` sobre una sola Tesla T4 (Google Colab), con AdamW, learning rate 2e-5, batch size 16, hasta 5 épocas con early stopping (paciencia 2 sobre la pérdida de validación), weight decay 0.01, 10% de warmup lineal, longitud máxima de 128 tokens, fp16 y entropía cruzada ponderada por clase (pesos inversamente proporcionales a la frecuencia). El entrenamiento terminó a las 4 épocas y se publicó el checkpoint de la época 2 (mejor pérdida de validación, 0.2480), con unos 11 minutos de cómputo.

Los datos de entrenamiento combinan y limpian el *Fake News Filipino Dataset* (Cruz et al., 2020) y el *Philippine Fake News Corpus* (Fernandez, 2019), resultando en 25.352 artículos tras el filtrado (16.283 creíbles, 9.069 no creíbles; ~64%/36%). La limpieza incluyó reparación de codificación con ftfy, eliminación de HTML y URLs, normalización de espacios, descarte de textos de menos de 10 palabras y eliminación de duplicados exactos, casi duplicados y duplicados con etiquetas contradictorias. Los splits son estratificados con semilla 42 y compartidos por los tres modelos comparados: 17.746 de entrenamiento, 3.803 de validación y 3.803 de test.

## Capacidades

- Clasificación binaria de credibilidad de texto periodístico en tagalo, inglés y taglish, con etiquetas `credible` (id 1) y `not_credible` (id 0) definidas en `config.json`.
- Inferencia de una sola pasada por secuencia de hasta 128 tokens; no genera texto.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidad multilingüe limitada a tl y en (con mezcla taglish), según la model card.
- No dispone de modo *thinking*, visión, audio ni otras modalidades.
- Uso previsto como componente de investigación y de la demo TsekTxt, y para comparación de modelos en detección de desinformación filipina.

## Casos de uso

- Investigación académica en detección de desinformación filipina: sirve como línea base reproducible para comparar arquitecturas (RoBERTa-Tagalog, mBERT, XLM-RoBERTa) sobre un corpus común con splits idénticos y semilla fija, tal como se plantea en la tesis de origen.
- Señalización previa en herramientas de verificación: integrado como primer filtro que marque artículos con alta probabilidad de proceder de fuentes no fiables, para que un periodista humano revise después; encaja por su bajo coste (109 M de parámetros) y su latencia reducida en GPU consumer.
- Análisis de corpus a escala: clasificación por lotes de miles de artículos de medios filipinos para estudios de prevalencia de fuentes no fiables, aprovechando que el modelo procesa secuencias cortas (128 tokens) con throughput alto en una sola T4.
- Componente educativo en la demo TsekTxt: ilustrar cómo un transformer pequeño puede separar estilos editoriales en tagalo, con la advertencia explícita de que no verifica hechos.
- Evaluación de sesgos de fuente: usar el modelo para diagnosticar hasta qué punto las etiquetas de credibilidad dependen del estilo de la cabecera o del cierre del artículo (el autor documenta que un TF-IDF logra 81,9% de acierto solo con las 12 primeras palabras).
- Filtrado de datasets para anotación: priorizar qué artículos enviar a revisión humana en un pipeline de etiquetado, reduciendo el volumen de textos que requieren juicio experto.
- Benchmarking de modelos filipinos: servir de referencia para medir el impacto de un checkpoint base específico de tagalo frente a modelos multilingües genéricos en una tarea concreta de clasificación.

## Benchmarks y rendimiento

Resultados en el conjunto de test interno (n = 3.803; clase positiva = `not_credible`), publicados en la model card:

| Modelo | Accuracy | Precision (NC) | Recall (NC) | F1 (NC) | Macro F1 | Weighted F1 |
|---|---|---|---|---|---|---|
| RoBERTa-Tagalog (este modelo) | 0,9450 | 0,9103 | 0,9390 | 0,9244 | 0,9406 | 0,9452 |
| mBERT | 0,9301 | 0,8810 | 0,9302 | 0,9049 | 0,9248 | 0,9305 |
| XLM-RoBERTa | 0,9427 | 0,9150 | 0,9258 | 0,9204 | 0,9378 | 0,9428 |
| TF-IDF + regresión logística (primeras 128 palabras) | 0,9258 | no disponible | no disponible | no disponible | no disponible | 0,9263 |

Matriz de confusión (filas = real, columnas = predicho):

| | pred: credible | pred: not credible |
|---|---|---|
| actual: credible | 2316 | 126 |
| actual: not credible | 83 | 1278 |

Prueba de McNemar sobre predicciones emparejadas:

| Pareja | b | c | p-valor | Significativo a 0,05 |
|---|---|---|---|---|
| RoBERTa-Tagalog vs mBERT | 151 | 94 | 0,00035 | sí |
| RoBERTa-Tagalog vs XLM-RoBERTa | 94 | 85 | 0,55 | no |
| mBERT vs XLM-RoBERTa | 94 | 142 | 0,0022 | sí |

El autor advierte que las diferencias son pequeñas, provienen de una única ejecución por modelo (una semilla) y se miden solo sobre el test interno de noticias formales. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5 GB en fp16 (109 M de parámetros) más el overhead del runtime; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: el entrenamiento se hizo en una Tesla T4; para inferencia basta una GTX 1650, RTX 3060, RTX 4090 o cualquier GPU con al menos 2 GB de VRAM. También funciona en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, sin problema, incluidas GPUs de gama baja y portátiles.
- Opciones de despliegue: transformers (pipeline `text-classification`), Text Embeddings Inference (el repo lleva el tag `text-embeddings-inference` y `endpoints_compatible`), y servidores de inferencia que acepten safetensors. No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño y la secuencia de 128 tokens, se espera un throughput alto en T4 (cientos a miles de secuencias por segundo en lotes), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (test interno) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TsekTxt RoBERTa-Tagalog | 109.083.650 | 128 tokens (entrenamiento) | 0,9450 | cc-by-sa-4.0 | Hugging Face (hansjio/tsektxt-roberta-tagalog) |
| mBERT (fine-tuned, misma tesis) | no disponible en la información | 128 tokens (entrenamiento) | 0,9301 | no disponible en la información | no disponible |
| XLM-RoBERTa (fine-tuned, misma tesis) | no disponible en la información | 128 tokens (entrenamiento) | 0,9427 | no disponible en la información | no disponible |
| TF-IDF + regresión logística | no aplica | 128 palabras | 0,9258 | no aplica | reproducible con el código de la tesis |

La comparación con mBERT y XLM-RoBERTa proviene de la misma tesis, con datos, splits y ajustes idénticos, lo que la hace metodológicamente sólida pese a la limitación de una sola semilla por modelo. No se dispone de comparación con otros clasificadores de desinformación filipina fuera de este estudio.

## Limitaciones y advertencias

- Las etiquetas siguen a la fuente, no a la afirmación: los artículos se etiquetan según la credibilidad del medio que los publica, no según la veracidad del contenido. El modelo predice parecido estilístico, no veracidad.
- Fuga de información de la fuente: un TF-IDF con regresión logística alcanza 81,9% de acierto usando solo las 12 primeras palabras y 83,1% con las 12 últimas (tasa de clase mayoritaria: 64,2%), y un 92,6% con las primeras 128 palabras. Las métricas internas altas no deben interpretarse como prueba de detección de desinformación factual.
- Brecha de dominio: los resultados se miden sobre noticias formales; el rendimiento en publicaciones informales de redes sociales sobre las elecciones filipinas de 2022 se evalúa aparte en la tesis y no se reporta en la model card.
- No apto para actuar como verificador de hechos, para moderación o retirada automática de contenido, ni para juzgar a personas o medios concretos. Requiere revisión humana en cualquier decisión.
- Diferencias frente a XLM-RoBERTa no significativas (p = 0,55); frente a mBERT sí lo son, pero con una sola semilla por modelo.
- Licencia cc-by-sa-4.0: permite uso comercial con atribución y obliga a compartir obras derivadas bajo la misma licencia; conviene revisar las implicaciones antes de integrarlo en productos propietarios.
- Idiomas limitados a tagalo e inglés (con taglish); no cubre otras lenguas filipinas.
- Ventana de 128 tokens en entrenamiento: textos más largos se truncan y pueden perder señal relevante.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí de falsos positivos y negativos: 209 de 3.803 artículos del test fueron mal clasificados (5,5%).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hansjio/tsektxt-roberta-tagalog
- Modelo base: https://huggingface.co/jcblaise/roberta-tagalog-base
- Ficha del modelo base en Socket: https://socket.dev/huggingface/package/jcblaise/roberta-tagalog-base
- Dataset *Fake News Filipino Dataset* (Cruz et al., 2020): no disponible (referenciado en la model card, sin URL)
- *Philippine Fake News Corpus* (Fernandez, 2019): no disponible (referenciado en la model card, sin URL)
- Repositorio de entrenamiento con `src/leakage_probe.py` y `src/baseline.py`: no disponible (mencionado en la model card, sin URL)
- Demo TsekTxt: no disponible (mencionada en la model card, sin URL)
