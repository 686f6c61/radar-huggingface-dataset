# Leminds/deberta-v3-xsmall-nli-oanc

## Resumen

`Leminds/deberta-v3-xsmall-nli-oanc` es un clasificador de inferencia de lenguaje natural (NLI) de tres clases construido a partir de `microsoft/deberta-v3-xsmall` y ajustado por el autor Leminds sobre un subconjunto de MultiNLI. Dada una premisa y una hipótesis, el modelo predice si la premisa implica la hipótesis (`entailment`), la contradice (`contradiction`) o si la relación es neutral (`neutral`). Con 70,8 millones de parámetros y licencia MIT, es un artefacto pequeno, barato de ejecutar y pensado para verificación de afirmaciones en pipelines locales.

Su rasgo diferencial no es el rendimiento bruto, sino la selección del corpus de entrenamiento: solo se usan los géneros de MultiNLI cuyo texto procede del Open American National Corpus (OANC), con términos que permiten uso y redistribución comercial. Esto permite publicar los pesos bajo MIT sin arrastrar las restricciones de los géneros con licencias mixtas o CC BY-SA. El resultado queda a medio punto del DeBERTa-v3-xsmall original ajustado sobre todo MultiNLI, entrenando con un tercio menos de datos y una sola GPU T4.

El modelo se distribuye en safetensors (fp32) y en exportaciones ONNX, incluida una versión cuantizada dinámicamente a int8 para CPU x86 con AVX2. Es relevante para quien necesite un verificador de hechos o entailment ligero, desplegable sin GPU y con trazabilidad clara de licencias, más que para tareas generativas o de razonamiento abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3 (con atención desacoplada y embedding de posición mejorado), cabeza de clasificación de 3 clases |
| Parametros totales | 70.831.107 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens en entrenamiento (truncado longest-first); máximo arquitectónico de DeBERTa-v3 no indicado en la información disponible |
| Tipos de cuantizacion | int8 dinámica (ONNX `model_quint8_avx2.onnx`); fp32 de referencia |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (pesos y exportaciones ONNX) |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-xsmall`, un encoder transformer de la familia DeBERTa-v3 con atención desacoplada, y añade una cabeza de clasificación secuencial de tres etiquetas (`contradiction`, `entailment`, `neutral`). El ajuste es supervisado con entropía cruzada sobre tres clases, optimizador AdamW con learning rate 4.5e-5 (el ajuste MNLI de los autores del modelo base), weight decay 0.01, schedule lineal con 6% de warm-up, 3 épocas y 28.629 pasos. El lote es de 32 pares con padding dinámico, longitud máxima de 128 tokens y truncado longest-first. Se entrenó en fp16 con autocast y gradient scaling, manteniendo pesos en fp32, en una única Tesla T4 de Google Colab durante 68 minutos.

Los datos de entrenamiento son 305.354 pares de MultiNLI correspondientes a los géneros government, slate, telephone y travel, cuyo texto procede del OANC y se describe como libre para cualquier uso, incluido el comercial. Se descartaron los 77.348 pares del género fiction por licencias mixtas (incluye texto CC BY-SA 3.0). Se reservaron 10.000 pares como split de desarrollo por semilla, y todas las decisiones (mejor checkpoint, temperatura de calibración) se tomaron sobre ese split; los conjuntos de evaluación se puntuaron una sola vez al final. El mejor checkpoint se seleccionó por precisión de desarrollo cada 2.000 pasos, alcanzando 87,27% en el paso 28.000. La calibración aplica una temperatura ajustada de 1,61 (fp32) y 1,60 (int8), que no altera ninguna predicción.

## Capacidades

- Clasificación de inferencia de lenguaje natural en tres clases: `entailment`, `contradiction` y `neutral`.
- Verificación de afirmaciones: dado un texto de evidencia (premisa) y una afirmación (hipótesis), estima si la evidencia respalda, contradice o no se pronuncia sobre la afirmación.
- Detección de contradicciones entre pares de frases, útil para control de consistencia.
- Salidas probabilísticas calibradas mediante temperatura, aptas para umbrales de confianza.
- Inferencia en CPU x86 con AVX2 mediante el modelo ONNX int8, sin necesidad de PyTorch.
- Compatibilidad con Text Embeddings Inference y endpoints, según los tags del repositorio.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Verificación local de afirmaciones en un bot de resolución de predicciones: el modelo evalúa si una evidencia textual respalda una afirmación concreta, con salida calibrada para fijar umbrales de aceptación, tal como se exploró en el proyecto Vaticeno (sin que el modelo decida resultados).
- Moderación de contenido y control de consistencia: comparar pares de frases en flujos de revisión para detectar contradicciones entre lo declarado y lo registrado.
- Enriquecimiento de bases de conocimiento: clasificar pares (hecho, candidato) como entailment para validar tripletas extraídas automáticamente antes de insertarlas.
- Filtrado de datos en pipelines de NLP: descartar pares de frases contradictorias o no relacionadas en la construcción de datasets de paráfrasis o QA.
- Despliegue en entornos sin GPU: el archivo ONNX int8 con AVX2 permite servir el clasificador en CPUs estándar con latencia baja, adecuado para servicios de validación en tiempo real.
- Evaluación de resúmenes y respuestas: comprobar si una frase generada está implicada por el documento fuente, como métrica auxiliar de fidelidad.
- Detección de alucinaciones en sistemas RAG: verificar si la respuesta generada se sigue de los pasajes recuperados, señalando contradicciones o falta de respaldo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Conjunto | n | Precisión fp32 | Precisión int8 | Macro-F1 fp32 |
|---|---|---|---|---|
| MultiNLI matched (validation) | 9.815 | 87,65% | 87,1% | 0,876 |
| MultiNLI matched, géneros no ficción | 7.842 | 87,9% | 87,4% | 0,879 |
| MultiNLI matched, ficción (género no entrenado) | 1.973 | 86,6% | 85,8% | 0,865 |
| MultiNLI mismatched (validation) | 9.832 | 87,96% | 87,4% | 0,879 |
| SNLI test (dataset no entrenado) | 9.824 | 82,79% | 82,4% | 0,826 |

Referencia del autor: el modelo base ajustado sobre todo MultiNLI con secuencias de 256 tokens y 8 GPUs reporta 88,1% / 88,3% en MultiNLI matched / mismatched. Precisión y recall por clase en MultiNLI mismatched (fp32): contradiction 0,90 / 0,91; entailment 0,91 / 0,88; neutral 0,83 / 0,85.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 para los pesos (70,8M parámetros, unos 283 MB) más activaciones; el repositorio completo ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; se entrenó en una Tesla T4. Para inferencia, A100, H100, RTX 4090 o GPUs consumer modestas son sobradas.
- Cabe en cualquier GPU consumer actual (GTX 1650, RTX 3050, RTX 4090) e incluso en CPU.
- Despliegue: transformers con PyTorch, ONNX Runtime (archivo int8 para CPU x86 con AVX2), Text Embeddings Inference y endpoints compatibles.
- Latencia y throughput: no se han publicado mediciones de latencia o throughput en la información disponible; el entrenamiento completo requirió 68 minutos en una T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MultiNLI matched / mismatched | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Leminds/deberta-v3-xsmall-nli-oanc | 70,8M | 128 tokens (entrenamiento) | 87,7% / 88,0% | MIT | Hugging Face, ONNX int8 |
| microsoft/deberta-v3-xsmall (ajustado MNLI por sus autores) | 70,8M (aprox., misma base) | 256 tokens en su ajuste | 88,1% / 88,3% | MIT | Hugging Face |
| DeBERTa-v3-base ajustado en MNLI | no disponible en la información | no disponible | no disponible | MIT | Hugging Face |

La comparación con alternativas de la misma categoría (por ejemplo, RoBERTa-base o ELECTRA-small ajustados en MNLI) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Ventana de 128 tokens: premisas o hipótesis más largas se truncan, lo que puede eliminar evidencia relevante.
- Entrenado sin el género fiction de MultiNLI; el rendimiento en ese género cae al 86,6% (fp32), unos 1,3 puntos por debajo del matched general.
- Riesgo de alucinación en el sentido de clasificaciones erróneas: es un clasificador, no un generador, pero puede producir falsos entailments, especialmente con hipótesis ambiguas o evidencia parcial.
- Sesgos heredados de MultiNLI y del OANC: los datos son predominantemente de dominio público y escrito, con posibles sesgos de género, temática y registro.
- La licencia MIT cubre los pesos, pero el autor asume, sin confirmación explícita de la documentación de MultiNLI, que las hipótesis escritas por crowdworkers están cubiertas por los términos del corpus; ese supuesto debe tenerse en cuenta en usos comerciales.
- La calibración es específica de los archivos publicados (temperatura 1,61 fp32 y 1,60 int8); recalibrar si se reajusta o se cambia el preprocesado.
- Los resultados de los benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- No apto para generación, razonamiento multi-paso, tool calling ni tareas multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Leminds/deberta-v3-xsmall-nli-oanc
- Modelo base: https://huggingface.co/microsoft/deberta-v3-xsmall
- Proyecto Vaticeno: https://github.com/lemind/vaticeno
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset SNLI: https://huggingface.co/datasets/stanfordnlp/snli
- Paper de DeBERTa-v3 (referencia de la arquitectura base): no disponible en la información proporcionada.
