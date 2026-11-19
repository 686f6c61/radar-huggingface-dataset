# lkid08/spacecraft-pose-estimation

## Resumen

SPEED+ Pose Estimator es una familia de checkpoints para regresión directa de pose 6DoF (posición y orientación) de naves espaciales a partir de imágenes en escala de grises. Lo desarrolla Nikolay Dolgov (usuario `lkid08`) como material experimental de un estudio sobre la brecha sim-to-real en el benchmark SPEED+. La arquitectura es una ResNet-50 preentrenada en ImageNet con una cabeza MLP que predice un vector de 7 dimensiones (3 de traslación y 4 de cuaternión en orden scalar-first).

El modelo no se presenta como un sistema listo para producción, sino como un conjunto de diecisiete pesos experimentales (diez del estudio publicado y siete de ablaciones posteriores a la revisión) que permiten regenerar la tabla de resultados del artículo *Unreasonable Confidence from Simulator Misspecification: Directional Robustness on the SPEED+ Sim-Real Benchmark* (arXiv:2611.20321). Su relevancia es metodológica: cuantifica cómo se degrada la estimación de pose cuando se entrena únicamente con imágenes sintéticas y se evalúa sobre dominios reales del simulador Lightbox y Sunlamp.

El repositorio ocupa 3,6 GB e incluye una regla de selección de checkpoint uniforme basada exclusivamente en el error de rotación sobre validación sintética, sin ninguna medición del dominio real. Esa decisión de diseño es precisamente el objeto de estudio: la confianza del modelo no se corresponde con su robustez fuera de distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (ImageNet) + cabeza MLP para regresión de pose 6DoF |
| Parametros totales | no disponible (ResNet-50 base, ~25 M en el backbone, sin cifra oficial del conjunto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 3x320x512) |
| Tipos de cuantizacion | no disponible (checkpoints en punto flotante PyTorch) |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.pt` (PyTorch `state_dict` con metadatos de normalización) |

## Arquitectura y entrenamiento

El modelo es un regresor directo de pose: una ResNet-50 como backbone y una cabeza MLP que emite un vector de 7 componentes. Las tres primeras corresponden a la traslación en metros en el sistema de la cámara y las cuatro restantes a un cuaternión unitario scalar-first. La traslación se estandariza (z-score) durante el entrenamiento con medias y desviaciones que viajan dentro del checkpoint (`train_means`, `train_stds`); el cuaternión no se normaliza en el target, solo se normaliza a norma unitaria en inferencia. Las imágenes de entrada se redimensionan a 3x320x512 y se normalizan con estadísticas de ImageNet.

El entrenamiento se realizó exclusivamente sobre imágenes sintéticas del dataset SPEED+. El estudio compara dos configuraciones de backbone (congelado frente a capa 4 entrenable), con y sin aumento de datos, y tres semillas (42, 43, 44). Los siete checkpoints de la ablación posterior exploran variantes del stack de aumento: pila completa, pila sin blur ni ruido, y solo jitter, gamma y erasing. La selección del checkpoint se hizo por mejor error de rotación en validación sintética entre los guardados en épocas pares, sin consultar el dominio real. El estudio se apoya en predicción conforme para analizar la calibración de la incertidumbre bajo cambio de dominio.

## Capacidades

- Regresión directa de pose 6DoF (traslación en metros y cuaternión unitario) a partir de una única imagen en escala de grises.
- Procesamiento de imágenes del benchmark SPEED+ a resolución arbitraria, redimensionadas internamente a 320x512.
- Evaluación en tres dominios: sintético, Lightbox (iluminación de caja de luz) y Sunlamp (iluminación solar simulada).
- Reproducción determinista de la tabla de resultados del paper mediante `scripts/reproduce_table.py` y los hashes SHA256 publicados.
- Análisis de calibración mediante predicción conforme incluido en el estudio.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No es un modelo generativo: no produce texto ni descripciones.

## Casos de uso

- Reproducción de resultados académicos: cargar los diecisiete checkpoints y regenerar la tabla del paper con `reproduce_table.py`, verificando cada fichero contra `SHA256SUMS` y `results/checkpoints.json`.
- Estudio de robustez sim-to-real: usar los pares de checkpoints con y sin aumento para medir la caída de precisión entre el dominio sintético y Lightbox/Sunlamp, aislando el efecto del aumento de datos.
- Análisis de calibración de incertidumbre: aplicar predicción conforme sobre las salidas del modelo para estudiar cómo la confianza declarada se desvía de la precisión real bajo cambio de dominio.
- Baseline para investigación en estimación de pose espacial: servir como referencia de regresión directa frente a métodos de pose por puntos clave o por renderizado y comparación.
- Docencia y formación: ilustrar de forma práctica el fenómeno de sobreajuste al simulador con un conjunto de pesos pequeño y reproducible en hardware modesto.
- Validación de pipelines de evaluación: comprobar que las transformaciones de normalización (desestandarización de traslación, normalización del cuaternión) están correctamente implementadas antes de integrar modelos propios en el mismo benchmark.
- Ablaciones controladas de aumento de datos: comparar las variantes A (sin blur ni ruido) y B (solo jitter, gamma y erasing) contra el control para aislar qué transformaciones aportan transferencia real.

## Benchmarks y rendimiento

Errores reportados en la model card. E_T es el error de traslación normalizado por rango; E_R es el error geodésico de rotación en radianes. El nivel de azar para E_R es 2,207 rad (orientación aleatoria uniforme). Los brazos con aumento y capa 4 son media ± desviación típica sobre las semillas 42/43/44; el brazo congelado sin aumento es de una sola semilla.

| Backbone | Aumento | Sint. E_T | Sint. E_R | Lightbox E_T | Lightbox E_R | Sunlamp E_T | Sunlamp E_R |
|---|---|---|---|---|---|---|---|
| Congelado | No | 0,066 | 1,053 | 0,151 | 1,752 | 0,253 | 2,048 |
| Congelado | Sí | 0,073±0,002 | 1,185±0,019 | 0,121±0,005 | 1,708±0,031 | 0,304±0,024 | 1,876±0,010 |
| Capa 4 | No | 0,036±0,002 | 0,317±0,010 | 0,169±0,027 | 1,166±0,018 | 0,311±0,036 | 1,534±0,075 |
| Capa 4 | Sí | 0,042±0,002 | 0,322±0,027 | 0,150±0,017 | **0,987±0,010** | 0,355±0,081 | 1,468±0,119 |

El patrón central del estudio es visible en la tabla: el mejor error sintético (0,317 rad con capa 4 sin aumento) no corresponde al mejor error en Lightbox (0,987 rad con capa 4 y aumento), y en Sunlamp todos los brazos se acercan al nivel de azar. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 2 GB en FP32 para una sola imagen a 320x512 con ResNet-50; el repositorio completo ocupa 3,6 GB en disco por los diecisiete checkpoints.
- GPU recomendadas: cualquier GPU con al menos 4 GB, incluidas RTX 3050, RTX 4060, RTX 4090, A100 y H100. El backbone es ligero y el cuello de botella es el preprocesado de imagen.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia puntual.
- Entrenamiento: los brazos publicados se entrenaron en Google Colab y en un Apple M5, lo que confirma que el ajuste fino de la capa 4 es viable en hardware de consumo.
- Opciones de despliegue: PyTorch nativo mediante `pip install git+https://github.com/lokindoo/spacecraft-pose-estimation`; exportación a TorchScript u ONNX no documentada en la información disponible. No hay soporte de vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Enfoque | Backbone | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPEED+ Pose Estimator (este) | Regresión directa 6DoF | ResNet-50 + MLP | SPEED+ sintético, Lightbox, Sunlamp | CC-BY-4.0 | Hugging Face y Zenodo |
| Modelos de pose por puntos clave en SPEED+ | Detección de keypoints + PnP | variable | SPEED+ | variable | literatura, pesos no incluidos aquí |
| Modelos de pose por renderizado y comparación | Análisis por síntesis | variable | SPEED+ | variable | literatura, pesos no incluidos aquí |
| Otros regresores directos de pose en SPEED+ | Regresión directa | variable | SPEED+ | variable | literatura, pesos no incluidos aquí |

No se dispone en la información proporcionada de cifras concretas de modelos alternativos comparables con las que contrastar parámetros, contexto o rendimiento. La comparativa se limita, por tanto, al enfoque metodológico.

## Limitaciones y advertencias

- Los propios autores advierten de que estos pesos no son competitivos: son brazos experimentales de un estudio, no un modelo listo para uso operativo.
- La selección de checkpoint se hizo sin ninguna medición del dominio real, por lo que la confianza del modelo no refleja su robustez fuera de distribución.
- En el dominio Sunlamp todos los brazos se acercan al nivel de azar (2,207 rad), lo que indica un fallo grave de transferencia bajo iluminación solar simulada.
- El mejor error sintético no predice el mejor error real: existe una disociación clara entre validación sintética y rendimiento en Lightbox y Sunlamp.
- La traslación debe desestandarizarse con `train_means` y `train_stds` del checkpoint; omitir este paso produce posiciones sin sentido de forma silenciosa.
- El cuaternión debe normalizarse a norma unitaria en inferencia, pero no debe desestandarizarse, ya que no se estandarizó en el entrenamiento.
- El modelo solo procesa imágenes en escala de grises del dominio SPEED+; no se ha validado sobre otras cámaras, órbitas o tipos de nave.
- Riesgo de alucinación en el sentido de predicciones con alta confianza y error elevado: es precisamente el fenómeno que el paper documenta.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no está diseñado ni validado para operaciones reales de navegación espacial.
- No se han documentado sesgos demográficos por no tratar datos humanos, pero sí un sesgo de dominio hacia el simulador de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/lkid08/spacecraft-pose-estimation
- Paper (arXiv): https://arxiv.org/abs/2611.20321
- Repositorio de código: https://github.com/lokindoo/spacecraft-pose-estimation
- Copia archivada en Zenodo: https://doi.org/10.5281/zenodo.24140385
