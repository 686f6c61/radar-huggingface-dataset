# dh-unibe/qwen3vl-german-xix-v2

## Resumen

`qwen3vl-german-xix-v2` es un adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen3-VL-4B-Instruct`, desarrollado por el grupo `dh-unibe` (Digital Humanities, Universidad de Berna). Su propósito es el reconocimiento de texto manuscrito (HTR/OCR) en documentos históricos alemanes del siglo XIX: actas de gobierno cantonal de Zúrich, protocolos de servicios parlamentarios y actas de las cámaras federales suizas de 1848, además de manuscritos en escritura Kurrent.

El modelo no es un modelo de propósito general: es un especialista de image-to-text entrenado sobre recortes de línea, y su comportamiento está fuertemente condicionado por esa granularidad de entrada. Sobre su propio split de validación alcanza un CER del 5,33 % y un WER del 18,79 %, pero la propia model card advierte que esa cifra mezcla validación in-domain con proyectos realmente no vistos, por lo que debe interpretarse como un resultado mayoritariamente in-domain.

Es relevante ahora porque demuestra que un VLM de 4B parámetros ajustado con LoRA puede abordar HTR histórico con calidad útil para digitalización masiva de archivos, desplegable con vLLM sobre hardware modesto y con licencia MIT. La contrapartida es una limitación operativa severa y bien documentada: alimentado con páginas completas, el modelo colapsa y produce alucinaciones fluidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen3-VL (vision-language model) |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen3-VL-4B-Instruct tiene ~4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada en la model card) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors del adaptador; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | No disponible formalmente; entrenado sobre corpus en alemán histórico (siglo XIX) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repo 0.5 GB |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct |
| Pipeline | image-to-text |
| Granularidad de entrenamiento | Recortes de línea (`granularity: line`), 262 144 píxeles |
| Métricas declaradas | CER, WER |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado mediante el servicio `serving-atr-inference` (repositorio de `thodel`) sobre el VLM `Qwen/Qwen3-VL-4B-Instruct`. No se especifica en la información disponible el rango del adaptador, los módulos objetivo ni los hiperparámetros de entrenamiento. Los pesos publicados corresponden al mejor checkpoint de validación de la ejecución, no a la última época.

Los datos de entrenamiento provienen de cuatro datasets de `dh-unibe`: `image-text_zh-regierungsratsprotokolle` (protocolos del Consejo de Gobierno de Zúrich), `image-text_parlamentsdienste-protokolle`, `image-text_nr-sr-vereinigte-bundesversammlung-xix` (actas del Consejo Nacional y del Consejo de los Estados suizos de 1848) y `image-text_kurrent-xix` (manuscritos en escritura Kurrent de diversos fondos, incluidos proyectos CITlab). El entrenamiento se realiza sobre recortes de línea con un presupuesto de 262 144 píxeles, lo que constituye la decisión de diseño más determinante del modelo. No se documenta el número total de tokens ni la composición exacta del dataset; sí se listan los proyectos de entrenamiento y los topes de páginas por dataset (20 000, 138, 52 y sin tope especificado respectivamente).

La innovación técnica relevante no es arquitectónica sino metodológica: el ajuste sobre líneas individuales con un VLM grande produce una calidad alta en esa granularidad, pero el modelo aprende implícitamente a detenerse tras una línea, lo que invalida el uso sobre páginas completas o párrafos.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en alemán histórico del siglo XIX, incluyendo escritura Kurrent.
- Transcripción de recortes de línea de documentos de archivo con alta fidelidad (CER 5,33 % en validación).
- Procesamiento image-to-text dentro de un pipeline multimodal Qwen3-VL.
- Manejo de variabilidad de manos y caligrafías dentro del dominio de entrenamiento (proyectos de Zúrich, actas parlamentarias suizas y fondos Kurrent).
- Despliegue compatible con vLLM (etiqueta declarada por el autor).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros modos (thinking, audio) para este adaptador; el modelo base las pudiera tener, pero el ajuste está orientado exclusivamente a transcripción.

## Casos de uso

- Digitalización masiva de actas parlamentarias suizas del siglo XIX: segmentando cada página con kraken u otro segmentador de líneas y enviando un recorte por llamada, el modelo transcribe las actas de 1848 del Consejo Nacional y del Consejo de los Estados con un CER en torno al 5 % en dominio, lo que reduce drásticamente el esfuerzo de corrección manual posterior.
- Procesamiento de protocolos del Consejo de Gobierno de Zúrich: adecuado porque el corpus de entrenamiento incluye hasta 20 000 páginas de este fondo, por lo que la caligrafía de los escribientes está bien representada.
- Transcripción de manuscritos en Kurrent para proyectos de humanidades digitales: el dataset `kurrent-xix` aporta proyectos de validación con manos no vistas, lo que permite estimar el rendimiento real en fondos ajenos al entrenamiento antes de comprometer un proyecto completo.
- Enriquecimiento de catálogos archivísticos: generación de transcripciones preliminares indexables para búsqueda full-text sobre fondos históricos, aceptando una tasa de error que luego se corrige con revisión humana.
- Integración en pipelines de archivo con vLLM: al ser un adaptador LoRA sobre un VLM de 4B, puede servirse con el modelo base en una sola GPU y procesar lotes de recortes de línea en paralelo, encajando en flujos automatizados de digitalización.
- Investigación en HTR histórico: como punto de partida para fine-tuning adicional sobre fondos concretos o para comparar estrategias de ajuste de VLMs frente a modelos HTR dedicados tipo TrOCR o kraken.

## Benchmarks y rendimiento

Evaluación declarada por el autor sobre el split de validación propio de la ejecución (200 muestras, 6 772 caracteres anotados, 361 errores de carácter):

| Metrica | Valor |
|---|---|
| CER | 5,33 % |
| WER | 18,79 % |
| Muestras evaluadas | 200 |
| Caracteres evaluados | 6 772 |
| Errores de carácter | 361 |

Evaluación de granularidad de entrada (15 páginas de validación, 2026-09-22, `scripts/eval_granularity.py`):

| Entrada | n | CER | Ratio de longitud |
|---|---:|---:|---:|
| Recortes de línea | 653 | 0,052 | 1,00 |
| Párrafos (TextRegions) | 36 | 0,95 | 0,05 |
| Páginas completas | 15 | 0,98 | 0,02 |

No se han publicado resultados en benchmarks compartidos ni comparaciones con otros modelos en la información disponible. El autor advierte explícitamente que la métrica no es transferible a otros corpus.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como adaptador LoRA sobre un VLM de 4B, la inferencia requiere cargar el modelo base; en fp16 serían aproximadamente 8-9 GB, y en cuantización de 4 bits en torno a 3-4 GB, aunque estas cifras son estimaciones y no datos publicados por el autor.
- GPU recomendadas: no especificadas. Por tamaño del modelo base, una GPU con 16 GB o más (RTX 4090, A100, H100) permite servir el modelo con holgura; una GPU consumer de 8-12 GB podría bastar con cuantización.
- Cabe en GPU consumer: previsiblemente sí, en GPUs de gama alta con cuantización, aunque no hay confirmación en la documentación.
- Opciones de despliegue: vLLM (etiqueta declarada por el autor); al ser un adaptador PEFT, requiere cargar el modelo base Qwen3-VL-4B-Instruct junto con el adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados en la información proporcionada. A continuación se contrastan características estructurales con alternativas de la misma categoría, marcando como no disponible cualquier dato de rendimiento no verificado:

| Modelo | Tipo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| qwen3vl-german-xix-v2 | LoRA sobre VLM | ~4B (base) | No disponible | MIT | HTR alemán histórico, entrada por línea |
| Qwen/Qwen3-VL-4B-Instruct | VLM base | ~4B | No disponible | No disponible en esta ficha | Propósito general, sin especialización HTR |
| TrOCR (variantes) | Transformer encoder-decoder | Varía (small/base/large) | No disponible | No disponible en esta ficha | OCR/HTR por línea, sin capacidades multimodales generales |
| kraken / modelos HTR dedicados | CNN+CTC / línea | Varía | No aplica | Varía | HTR especializado, ecosistema de segmentación propio |

La comparación de rendimiento entre estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Limitación crítica de granularidad: alimentado con páginas completas, el CER se dispara a 0,98 y el modelo produce texto fluido que no aparece en la página (alucinación). Es obligatorio segmentar previamente y enviar un recorte de línea por llamada.
- La métrica de validación mezcla validación in-domain (páginas no vistas de manos conocidas) con proyectos realmente no vistos; el 5,33 % de CER es mayoritariamente in-domain y no debe interpretarse como rendimiento en manos desconocidas.
- El modelo está entrenado sobre un corpus alemán histórico muy específico (Zúrich, actas parlamentarias suizas de 1848, fondos Kurrent); no hay evidencia de generalización a otras lenguas, épocas o caligrafías.
- Riesgo de alucinación documentado y particularmente peligroso porque el texto generado es fluido y plausible, lo que dificulta su detección sin revisión humana.
- No se documentan sesgos específicos, pero el corpus refleja el lenguaje administrativo y jurídico del siglo XIX suizo, con posibles sesgos históricos inherentes a las fuentes.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen3-VL-4B-Instruct tiene su propia licencia, que debe verificarse por separado.
- Los pesos publicados son el mejor checkpoint de validación, no la última época; no se documentan hiperparámetros de entrenamiento ni reproducibilidad completa.
- No se especifican idiomas soportados formalmente ni longitud de contexto del adaptador.
- Para producción se requiere un segmentador de líneas externo (kraken u otro) como parte del pipeline; el modelo no resuelve la segmentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dh-unibe/qwen3vl-german-xix-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio del servicio de entrenamiento e inferencia: https://github.com/thodel/serving-atr-inference
- Script de evaluación de granularidad: https://github.com/thodel/serving-atr-inference/blob/main/scripts/eval_granularity.py
- Issue sobre granularidad de entrada: https://github.com/thodel/serving-atr-inference/issues/165
- Dataset protocolos del Consejo de Gobierno de Zúrich: https://huggingface.co/datasets/dh-unibe/image-text_zh-regierungsratsprotokolle
- Dataset protocolos de servicios parlamentarios: https://huggingface.co/datasets/dh-unibe/image-text_parlamentsdienste-protokolle
- Dataset actas del Consejo Nacional y del Consejo de los Estados (XIX): https://huggingface.co/datasets/dh-unibe/image-text_nr-sr-vereinigte-bundesversammlung-xix
- Dataset manuscritos Kurrent (XIX): https://huggingface.co/datasets/dh-unibe/image-text_kurrent-xix
