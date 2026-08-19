# jirustaroure/desi-spectra-fm

## Resumen

DESI Spectra Foundation Model (26M) es un modelo de aprendizaje autosupervisado desarrollado por jirustaroure, diseñado específicamente para el análisis de espectros astronómicos del instrumento DESI (Dark Energy Spectroscopic Instrument). Se trata de un transformer encoder-only de aproximadamente 26 millones de parámetros, entrenado con masked-token prediction sobre espectros de DESI EDR/SV3 procedentes del dataset Multimodal Universe. Su objetivo principal es aprender representaciones ricas de espectros que permitan estimar el corrimiento al rojo (redshift) de forma conjunta con la reconstrucción del espectro enmascarado, superando las limitaciones de la versión anterior (AION-1) en el manejo del redshift.

El modelo es relevante porque aborda un problema clave en astrofísica: la estimación precisa del redshift a partir de datos espectroscópicos, una tarea tradicionalmente resuelta con pipelines complejos y costosos. Al ser un modelo fundacional, puede adaptarse a diferentes instrumentos y longitudes de onda, ya que interpola las entradas a una rejilla logarítmica interna de 3600–9800 Å. La versión actual (v2.1) es un fine-tune del encoder v1 con una cabeza de clasificación sobre 100 bins de log(1+z), que mejora significativamente la precisión y reduce los outliers catastróficos. Aunque se trata de un proyecto de curso y no está pensado para producción científica, demuestra el potencial de los modelos fundacionales en astronomía.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (8 capas, d_model=512, 8 cabezas) |
| Parametros totales | ~26 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada de espectro de 7081 píxeles en rejilla log-λ) |
| Tipos de cuantizacion | No disponible (solo pesos en PyTorch) |
| Idiomas soportados | No disponible (modelo para datos espectroscópicos, no texto) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch (state_dict) en `checkpoint_last.pt`, con `config.json` |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-only con 8 capas, dimensión de modelo 512 y 8 cabezas de atención, totalizando ~26M de parámetros. Se entrena con masked-token prediction sobre espectros DESI EDR/SV3: se enmascaran tokens (píxeles) del espectro y el modelo debe reconstruirlos. La innovación principal es que el token de redshift se enmascara siempre y una cabeza de predicción se entrena conjuntamente con la reconstrucción, de modo que el redshift entra en el espacio de representación desde el principio. Esto corrige el diseño de AION-1, donde el redshift se manejaba de forma separada.

El checkpoint actual (v2.1) es un fine-tune del encoder v1, no un modelo entrenado desde cero. Añade una cabeza de clasificación sobre 100 bins de log(1+z) con cross-entropy normalizada por log(n_bins), pesos de clase sqrt-inverse estimados a partir de las 80k etiquetas reales de entrenamiento, y una ponderación 1:1 con la pérdida de reconstrucción. El split de entrenamiento/validación es sin fugas: se usan 80.000 espectros para entrenar y 2.000 para validación held-out. El entrenamiento se realizó en un portátil con Apple MPS, lo que limita la escala pero demuestra la eficiencia del diseño.

## Capacidades

- Estimación de redshift a partir de espectros: predicción oficial mediante `z_pred_map` (posterior argmax) y alternativa `z_pred` (posterior expectation) por compatibilidad.
- Reconstrucción de espectros enmascarados: el modelo puede reconstruir partes del espectro que se ocultan, útil para completar datos incompletos.
- Generación de embeddings semánticos: a través de `embed_spectrum()` se obtienen representaciones vectoriales que alimentan un índice FAISS (cosine) de 15.000 espectros de entrenamiento.
- Búsqueda de espectros similares: la herramienta `find_similar_spectra` permite localizar espectros análogos en el catálogo mediante similitud coseno de embeddings.
- Interoperabilidad entre instrumentos: acepta espectros de cualquier instrumento, interpolando las entradas a la rejilla log-λ interna (3600–9800 Å, 7081 píxeles) y usando embedding posicional sinusoidal de log(λ) físico, no del índice de token.
- Salida de confianza: proporciona `z_confidence`, una medida de concentración de la posterior en [0,1], para filtrar predicciones poco fiables.

## Casos de uso

- Estimación rápida de redshift en surveys astronómicos: el modelo puede procesar espectros de forma autónoma para obtener una primera estimación de z, útil en pipelines de clasificación previa o para priorizar observaciones de seguimiento. Su baja latencia (26M de parámetros) permite ejecutarlo en CPU o GPU modesta.
- Análisis de espectros de baja relación señal-ruido: aunque tiene limitaciones en este régimen, la métrica de confianza (`z_confidence`) permite filtrar automáticamente las predicciones poco fiables, evitando errores en catálogos.
- Búsqueda de espectros análogos en grandes catálogos: con el índice FAISS incluido, se pueden identificar espectros similares a uno de interés, facilitando estudios de poblaciones de objetos astronómicos (galaxias, cuásares, etc.).
- Reconstrucción de regiones espectrales con datos faltantes: la capacidad de reconstrucción del modelo puede aplicarse para rellenar huecos en espectros observados, por ejemplo, por fallos en el detector o absorción atmosférica.
- Educación y divulgación en astrofísica: al ser un proyecto de código abierto con demo interactiva, permite a estudiantes y aficionados experimentar con análisis espectral real sin necesidad de infraestructura compleja.
- Prototipado de herramientas de análisis espectral: los embeddings generados pueden usarse como características de entrada para otros modelos de clasificación (tipos de galaxias, actividad nuclear, etc.) o para visualización en espacios de baja dimensión (t-SNE, UMAP).

## Benchmarks y rendimiento

La model card proporciona métricas de validación sobre el split held-out de 2.000 espectros (los que siguen a los 80.000 de entrenamiento, nunca vistos). Se comparan la versión v1 (50k, head de regresión) y la v2.1 (fine-tune con clasificación en 100 bins), usando `z_pred_map` para v2.1:

| Metrica | v1 (50k, regresión) | v2.1 (fine-tune, clasificación 100 bins) |
|---|---|---|
| Outliers catastróficos η₀.₁₅ | 22.6 % | 14.95 % |
| σ_NMAD | 0.083 | 0.030 |
| MAE_norm ⟨\|Δz\|/(1+z)⟩ | 0.107 | 0.096 |
| η₀.₁₅ en z ∈ [1.5, 2.5) | 82.7 % | 23.5 % |
| Techo de predicción (max z_pred) | 2.00 | 3.52 |
| RMSE de reconstrucción (masked, espacio arcsinh) | 0.819 | 0.817 |

No se han publicado comparaciones con otros modelos de estimación de redshift en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 26M de parámetros, la huella de memoria es muy baja. En FP32, los pesos ocupan ~104 MB; en FP16, ~52 MB. Cabe en cualquier GPU moderna (incluso integradas) y en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una RTX 3060, RTX 4090 o incluso una Apple Silicon con MPS pueden ejecutarlo sin problemas.
- Compatibilidad con GPU de consumo: sí, totalmente. También funciona en CPU, aunque la latencia será mayor.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con FastAPI (la API REST ya está publicada), o integrarse en pipelines con Hugging Face Inference Endpoints. No es adecuado para vLLM o llama.cpp, ya que es un encoder, no un decoder generativo.
- Latencia y throughput estimados: no se proporcionan datos oficiales. Dado el tamaño, en una GPU moderna la inferencia sobre un espectro debería completarse en milisegundos; en CPU, en decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo se inspira en AION-1, pero no se ofrecen datos de comparación con otros sistemas de estimación de redshift (por ejemplo, pipelines clásicos como Redrock o modelos basados en redes neuronales como regresión directa). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No es un modelo para producción científica: el autor lo califica explícitamente como un proyecto de curso, y el pipeline DESI oficial es aproximadamente tres órdenes de magnitud más preciso en la estimación de z.
- Outliers catastróficos persistentes: alrededor del 15% de los espectros held-out siguen produciendo errores grandes, dominados por espectros de baja relación señal-ruido y degeneraciones en la identificación de líneas espectrales.
- Predicciones no restringidas para z > 3.5: hay pocos ejemplos de entrenamiento en ese rango, por lo que las estimaciones en ese régimen no son fiables.
- Sesgos en el entrenamiento: el modelo se entrenó con 80.000 espectros de DESI EDR/SV3, que pueden no representar toda la diversidad de objetos astronómicos (por ejemplo, cuásares de alto redshift o galaxias extremas).
- Dependencia de la rejilla de longitudes de onda: aunque acepta espectros de cualquier instrumento, la interpolación a la rejilla interna puede perder información si el rango espectral original es muy diferente.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías de precisión ni soporte. El usuario debe validar las predicciones con herramientas estándar antes de cualquier uso científico.
- Riesgo de alucinación: al ser un modelo de reconstrucción, puede generar patrones espectrales plausibles pero incorrectos en regiones enmascaradas, especialmente en espectros con baja señal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jirustaroure/desi-spectra-fm
- Demo interactiva (HF Space): https://huggingface.co/spaces/jirustaroure/desi-spectra-fm-demo
- API REST (FastAPI + Swagger): https://jirustaroure-desi-fm-api.hf.space/api/docs
- Repositorio GitHub (código, tests, CI y notebook de evaluación): https://github.com/Julian0444/desi-spectra-fm
- Herramienta spectra-copilot (búsqueda semántica con FAISS): https://github.com/Julian0444/spectra-copilot#semantic-search-embeddings--faiss
