# saeidseyfi/khattat-crnn

## Resumen

khattat-crnn es un modelo de reconocimiento óptico de caracteres (OCR) para escritura manuscrita en persa (fa), árabe (ar) e inglés (en), publicado por el usuario saeidseyfi en HuggingFace. Se trata de un reconocedor de línea basado en una arquitectura CRNN (red convolucional + dos capas BiLSTM de 256 unidades) con capa de salida CTC, entrenado sobre el conjunto sintético `saeidseyfi/khattat`. Con 4,25 millones de parámetros, es un modelo muy ligero que procesa recortes de línea en escala de grises de 48 píxeles de alto y hasta 384 de ancho, y decodifica con búsqueda greedy sobre un vocabulario de 125 clases.

El problema que aborda es específico: el reconocimiento de líneas manuscritas en alfabetos árabe-persas, un dominio donde los modelos genéricos de OCR suelen rendir mal por la cursividad y la variabilidad de formas contextuales de las letras. El modelo se publica junto a su dataset, su vocabulario y un informe de evaluación, además de un vídeo de demostración de inferencia, lo que lo convierte en una pieza reproducible para investigación más que en un componente listo para producción.

Su relevancia actual es limitada y debe enmarcarse con honestidad: el repositorio acumula 0 descargas y 0 "likes", el tamaño declarado del repositorio es de 0,0 GB y las métricas publicadas por el propio autor sobre 60 líneas de test son un CER agrupado de 0,663 y un WER medio de 1,07, es decir, un error muy alto. Es útil como línea base reproducible, como ejemplo de pipeline CRNN+CTC entrenado en CPU y como referencia para comparar futuras aproximaciones, no como solución desplegable sin entrenamiento adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CRNN: backbone CNN + 2 capas BiLSTM de 256 unidades + cabecera CTC |
| Parámetros totales | 4,25 millones |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada limitada a un recorte de línea de 48 px de alto y máximo 384 px de ancho |
| Tipos de cuantización | no disponible (solo se publica el checkpoint en punto flotante `best.pt`) |
| Idiomas soportados | persa (fa), árabe (ar) e inglés (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (`best.pt`, cargable con `torch.load`) |
| Tarea (pipeline) | image-to-text |
| Vocabulario | 125 clases (letras y dígitos fa + ar + en, incluida la clase blank de CTC) |
| Decodificación | CTC greedy |
| Entrada | imagen de línea en escala de grises, normalizada en [-1, 1] |
| Métricas declaradas | CER (pooled y mean) y WER |
| Archivos del repositorio | `best.pt`, `vocab.json`, `test_report.json`, `demo/khattat_ocr_demo.mp4`, `demo/predictions.json` |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0,0 GB (según la ficha de HuggingFace) |
| Fecha de creación / actualización | 2026-09-18 (ambas) |

## Arquitectura y entrenamiento

La arquitectura es una CRNN clásica para OCR de líneas: un extractor convolucional que reduce la imagen de entrada a una secuencia de características a lo largo del eje horizontal, seguido de dos capas BiLSTM de 256 unidades que modelan el contexto en ambos sentidos, y una proyección final a 125 clases. La función de pérdida es CTC, lo que permite entrenar sin alineación carácter a carácter entre la imagen y la transcripción. La decodificación en inferencia es greedy, sin modelo de lenguaje ni beam search, lo que simplifica el despliegue pero limita la corrección de errores contextuales. La entrada está fijada a 48 píxeles de alto y un máximo de 384 de ancho, en escala de grises y normalizada al rango [-1, 1].

El entrenamiento se realizó sobre el dataset sintético `saeidseyfi/khattat` (configuración `default`, subconjunto de demostración) durante 100 épocas con optimizador Adam y scheduler de learning rate coseno, ejecutado en CPU. La evaluación publicada se hizo sobre 60 líneas: CER agrupado de 0,663, CER medio de 0,666 y WER medio de 1,07. No se documentan en la información disponible el número de tokens o muestras de entrenamiento, la composición exacta del dataset, ni fases de ajuste fino con RLHF o DPO (no aplicables a un reconocedor CTC). El propio autor advierte que el vídeo de demostración incluye recortes con fórmulas matemáticas y descripciones de figuras cuyos símbolos (`+ = ∫`, entre otros) quedan fuera del alfabeto de 125 clases y, por tanto, son OOV (out-of-vocabulary); se muestran por transparencia, no como parte de las capacidades del modelo. El código del pipeline se distribuye en un repositorio de GitHub independiente.

## Capacidades

- Reconocimiento de texto manuscrito en líneas de imagen en escala de grises, con salida de cadena de texto mediante decodificación CTC greedy.
- Cobertura de tres idiomas en un mismo vocabulario: persa (fa), árabe (ar) e inglés (en).
- Reconocimiento de dígitos y letras de los alfabetos persa y árabe, además de caracteres latinos presentes en las 125 clases.
- Procesamiento de recortes de línea de hasta 384 píxeles de ancho, adecuado para líneas cortas o fragmentos segmentados previamente.
- Inferencia en CPU: el tamaño del modelo (4,25 M de parámetros) permite ejecutarlo sin GPU.
- Punto de partida reproducible para investigación: se publican vocabulario (`vocab.json`), informe de test (`test_report.json`) y predicciones por muestra (`demo/predictions.json`).
- No dispone de tool calling, function calling, soporte de agentes, modo de razonamiento, visión más allá del reconocimiento de líneas ni generación de texto libre: es un modelo discriminativo de image-to-text, no un modelo generativo.
- No realiza detección ni segmentación de líneas: requiere que la imagen de entrada ya sea un recorte de una sola línea de texto.
- No se documenta soporte multilingüe fuera de fa, ar y en, ni capacidades de audio o vídeo.

## Casos de uso

- Digitalización de manuscritos en persa y árabe: tras segmentar las páginas en líneas, el modelo transcribe cada recorte de 48×384 px. Es adecuado para explorar corpus históricos siempre que se presuponga una tasa de error alta y se planifique una fase de corrección humana.
- Pre-etiquetado de datasets de OCR: dado su bajo coste computacional, puede generar etiquetas iniciales sobre grandes volúmenes de líneas que después se revisen manualmente, reduciendo el tiempo de anotación respecto a etiquetar desde cero.
- Indexación y búsqueda en colecciones de manuscritos: la transcripción, aun imperfecta, puede alimentar índices de texto para búsqueda por palabra clave en archivos digitalizados de bibliotecas o fondos documentales.
- Reconocimiento de formularios con campos manuscritos en dígitos persas o árabes (importes, fechas, identificadores), aprovechando que el vocabulario incluye dígitos de ambos alfabetos; requiere validación posterior por el alto CER.
- Línea base en investigación sobre CRNN+CTC: sirve como referencia reproducible para medir mejoras de arquitecturas posteriores, ya que publica vocabulario, métricas y predicciones por muestra.
- Componente de un pipeline OCR híbrido: encaja como etapa de reconocimiento de línea aguas abajo de un detector de líneas propio, mientras la detección y el análisis de layout se resuelven con otra herramienta.
- Docencia y experimentación en entrenamiento ligero: al haberse entrenado en CPU con 100 épocas, es un ejemplo práctico y de bajo coste para ilustrar el flujo completo de un sistema CTC (dataset sintético, vocabulario, decodificación greedy y evaluación con CER/WER).
- Procesamiento de notas manuscritas en inglés: el vocabulario incluye caracteres latinos, aunque la información disponible no detalla el peso relativo del inglés en el entrenamiento ni su rendimiento por idioma.

## Benchmarks y rendimiento

Resultados publicados por el autor en `test_report.json`, evaluados sobre 60 líneas de test:

| Métrica | Valor |
|---|---|
| CER agrupado (pooled) | 0,663 |
| CER medio | 0,666 |
| WER medio | 1,07 |
| Conjunto de evaluación | 60 líneas |
| Desglose por idioma | no disponible |
| Comparación con otros modelos | no disponible |

No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que además no aplican a un modelo de reconocimiento de texto en imágenes. Tampoco se ofrece desglose de CER o WER por idioma, por tipo de escritura ni por fuente tipográfica. Un WER superior a 1,0 indica que el número de inserciones y sustituciones supera el número de palabras de referencia, coherente con un sistema que aún no está ajustado para uso real.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los casos. El checkpoint en fp32 ocupa aproximadamente 17 MB (4,25 M de parámetros × 4 bytes); en fp16, unos 8,5 MB; en int8, unos 4,25 MB. Las activaciones para entradas de 48×384 px en escala de grises son despreciables.
- GPU recomendadas: no se requiere GPU. Cualquier GPU con más de 1 GB de memoria (GTX 1050, RTX 2060, RTX 3090, RTX 4090, A100, H100) es más que suficiente y solo aporta ventaja en procesamiento por lotes a gran escala.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo, e incluso en CPU. El autor indica que el entrenamiento se realizó íntegramente en CPU.
- Opciones de despliegue: PyTorch nativo con `torch.load` y las funciones `load_checkpoint` y `ctc_greedy_decode` del repositorio de código. No se publican pesos en GGUF, ONNX, TorchScript ni safetensors, por lo que no hay integración directa con llama.cpp, Ollama, vLLM o TGI (herramientas orientadas a modelos generativos, categoría a la que este modelo no pertenece). La exportación a ONNX sería posible, pero no está documentada ni verificada en la información disponible.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia por línea ni de líneas por segundo, ni en CPU ni en GPU.

## Comparativa con modelos similares

La información proporcionada no incluye datos comparativos con otros sistemas de OCR, por lo que los campos numéricos se marcan como no disponibles. La comparación siguiente es cualitativa y se apoya en conocimiento general de la categoría, no en datos de la ficha del modelo:

| Modelo | Tipo | Parámetros | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|
| khattat-crnn | CRNN + CTC, reconocimiento de línea | 4,25 M | fa, ar, en | cc-by-4.0 | CER 0,663 / WER 1,07 (60 líneas de test) |
| TrOCR (Microsoft) | Transformer encoder-decoder (image-to-text) | no disponible | principalmente latino, con variantes por idioma | no disponible | no disponible |
| PaddleOCR | Pipeline completo (detección + reconocimiento) | no disponible | multilingüe, incluye árabe y persa | no disponible | no disponible |
| Tesseract | Motor OCR clásico con LSTM | no disponible | muy amplio, con modelos por idioma | no disponible | no disponible |
| EasyOCR | Detección + reconocimiento (basado en CRNN) | no disponible | amplio, incluye árabe | no disponible | no disponible |

Diferencias estructurales relevantes frente a esas alternativas: khattat-crnn solo resuelve la etapa de reconocimiento de una línea ya recortada, mientras que Tesseract, PaddleOCR y EasyOCR incluyen detección y análisis de layout; además, khattat-crnn es el único de los citados cuyas métricas y vocabulario están publicados explícitamente en la información disponible, aunque con un nivel de error muy superior al esperable en un sistema en producción.

## Limitaciones y advertencias

- Calidad insuficiente para producción: con CER 0,663 y WER 1,07 sobre 60 líneas, se equivoca en la mayoría de los caracteres. Cualquier uso real exige reentrenamiento con más datos o corrección humana posterior.
- Evaluación muy reducida: la única métrica publicada procede de 60 líneas, una muestra demasiado pequeña para extraer conclusiones fiables sobre el comportamiento general.
- Entrenamiento sobre datos sintéticos: el dataset `saeidseyfi/khattat` es sintético y el entrenamiento usó únicamente el subconjunto de demostración, por lo que la generalización a escritura manuscrita real no está demostrada.
- Decodificación greedy sin modelo de lenguaje: no hay beam search ni corrección contextual, lo que amplifica errores en secuencias largas y en lenguas con formas contextuales de las letras.
- Símbolos fuera de vocabulario: fórmulas matemáticas y símbolos como `+`, `=` o `∫` no forman parte de las 125 clases y el modelo no puede emitirlos correctamente.
- Dependencia de segmentación previa: solo acepta recortes de una línea; no detecta líneas, párrafos ni regiones, y no gestiona entradas multicolumna o con ruido de fondo.
- Restricciones de entrada: imagen en escala de grises, altura fija de 48 px y ancho máximo de 384 px; las líneas más largas deben recortarse o reescalarse, con la pérdida de información que ello implica.
- Idiomas: la cobertura declarada se limita a fa, ar y en. No hay datos de rendimiento desagregados por idioma, y no se documenta el tratamiento de otras lenguas.
- Sesgos: no se documenta ningún análisis de sesgo por tipo de escritura, género, origen del texto o calidad de escaneo. Al entrenar con datos sintéticos, es probable que herede las distribuciones y tipografías usadas en la generación (Shabnam para persa, Amiri para árabe y DejaVu Sans para inglés, según el vídeo de demostración), lo que supone un sesgo tipográfico explícito.
- Riesgo de alucinación: en un modelo CTC la salida está restringida al vocabulario de 125 clases, por lo que no puede inventar caracteres fuera de él, pero sí producir palabras plausibles incorrectas, especialmente cuando la señal visual es ambigua.
- Licencia: cc-by-4.0 permite uso comercial y obras derivadas siempre que se atribuya la autoría y se indique la licencia. No impone restricciones adicionales, pero conviene verificar la licencia del dataset `saeidseyfi/khattat` de forma independiente, ya que no se detalla en la información disponible.
- Madurez del proyecto: 0 descargas, 0 likes, repositorio de 0,0 GB y fechas de creación y actualización separadas por doce segundos indican un artefacto recién publicado y sin validación por parte de la comunidad.
- Dependencia de código externo: el ejemplo de uso importa `training.evaluate` y `training.dataset` desde un repositorio de GitHub, sin garantía de estabilidad de API ni de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saeidseyfi/khattat-crnn
- Dataset de entrenamiento: https://huggingface.co/datasets/saeidseyfi/khattat
- Código del pipeline: https://github.com/ramazanzadehnazaninzahra-del/handwritten-ocr-dataset-pipeline
- Vídeo de demostración de inferencia: `demo/khattat_ocr_demo.mp4` dentro del repositorio de HuggingFace
- Predicciones por muestra y métricas: `demo/predictions.json` y `test_report.json` dentro del repositorio de HuggingFace
- Paper o publicación técnica asociada: no disponible
- Demo interactiva alojada: no disponible
