# 1aurent/xcit_small_12_p16_224.histoencoder

## Resumen

`1aurent/xcit_small_12_p16_224.histoencoder` es un backbone de extracción de características visuales para patología digital, concretamente el encoder `prostate_small` del modelo fundacional HistoEncoder, desarrollado por Joona Pohjeros y colaboradores (Universidad de Helsinki, HUS Helsinki University Hospital) y portado al formato nativo de timm/Hugging Face Hub por el usuario 1aurent. Resuelve el problema de obtener representaciones densas y transferibles de teselas (tiles) de tejido prostático sin necesidad de etiquetas, lo que permite reutilizar el modelo en tareas downstream como clasificación de cáncer, gradación Gleason o predicción de pronóstico con pocos datos anotados.

Arquitectura XCiT (Cross-Covariance Image Transformer) en su variante `small_12_p16_224`: 12 bloques, patch size 16x16, dimensión de embedding 384 y 25,9 millones de parámetros. El preentrenamiento es auto-supervisado con DINO sobre HelsinkiProstate, un corpus de 48 millones de teselas de tejido prostático procedentes de 1.307 pacientes. El resultado es un encoder de propósito general para imagen histopatológica que se usa como extractor de features congelado o como inicialización para fine-tuning.

Su relevancia radica en que los modelos fundacionales de patología reducen drásticamente la dependencia de anotaciones expertas, caras y escasas, y este port facilita su uso dentro del ecosistema timm con una sola línea de código. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XCiT (Cross-Covariance Image Transformer), variante `xcit_small_12_p16_224` |
| Parametros totales | 25.878.960 (25,9 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224, cualquier tamaño divisible por 16) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de PyTorch/timm, no documentada por el autor) |
| Idiomas soportados | no aplica (modelo de imagen, sin capacidades de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería timm); checkpoint original en `.pth` |
| Dimensión de embedding | 384 |
| Tamaño de parche | 16x16 |
| Número de bloques | 12 |
| Tamaño de imagen de entrada | 224x224 (posicional Fourier dinámico, admite otras resoluciones divisibles por 16) |
| Pooling | `global_pool='token'`, `num_classes=0` |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

XCiT sustituye la atención self-attention clásica sobre tokens por una atención sobre la matriz de covarianza cruzada de features, lo que reduce la complejidad de O(N²) a O(N·d) en el número de tokens N y permite escalar a imágenes de alta resolución. En esta variante small, el modelo tiene 12 bloques, dimensión de embedding 384 y patch size 16, con codificación posicional de tipo Fourier que es dinámica y por tanto acepta resoluciones distintas de 224 sin reentrenar.

El preentrenamiento es auto-supervisado con DINO (self-distillation con teacher-student) sobre HelsinkiProstate, un dataset de 48 millones de teselas de tejido prostático de 1.307 pacientes. No se documenta en la información disponible el número exacto de tokens vistos, la composición detallada del dataset ni si hubo etapas posteriores de ajuste supervisado o RLHF (no aplicable en este dominio). Los pesos del port son bit a bit idénticos a los del checkpoint upstream `prostate_small.pth` (sha256 `1f3bf05a...`), con las mismas claves de `state_dict`.

Una innovación práctica destacable es la inclusión de `pretrained_cfg` compatible con `timm.data.resolve_model_data_config`, que resuelve automáticamente las transformaciones de resize y normalización. El autor advierte de una discrepancia: el CLI original de HistoEncoder usa interpolación bilineal y estadísticas de normalización estimadas del propio dataset (histoprep), mientras que este port usa las estadísticas de ImageNet (media 0.485, 0.456, 0.406; desviación 0.229, 0.224, 0.225) y resize bicúbico con `crop_pct` 1.0.

## Capacidades

- Extracción de características de imágenes histopatológicas: produce un vector pooled de 384 dimensiones por tesela, útil para búsqueda por similitud, clustering y clasificación downstream.
- Representaciones transferibles sin etiquetas: al estar preentrenado con DINO sobre tejido prostático, las features capturan morfología tisular y patrones glandulares relevantes para patología.
- Uso como backbone congelado o para fine-tuning: `num_classes=0` permite añadir cabezas de clasificación, regresión o segmentación.
- Compatibilidad con resoluciones variables: la codificación posicional Fourier dinámica admite entradas de cualquier tamaño divisible por 16.
- Integración nativa con timm: carga vía `timm.create_model('hf-hub:...')`, transforms automáticos y compatibilidad con el resto del ecosistema timm.
- Sin capacidades de texto, tool calling, agentes, visión generalista, audio ni razonamiento multi-paso: es exclusivamente un backbone visual de dominio específico.

## Casos de uso

- Clasificación de cáncer de próstata en WSI: extraer embeddings de 384 dimensiones de cada tesela y entrenar un clasificador ligero (regresión logística, MLP o attention MIL) sobre las features congeladas, reduciendo la necesidad de anotaciones a nivel de tesela.
- Gradación Gleason asistida: usar los embeddings como entrada a un modelo de regresión ordinal que estime el grado histológico, aprovechando que el preentrenamiento captura morfología glandular.
- Predicción de pronóstico y supervivencia: agregar features por paciente (pooling sobre teselas) y entrenar modelos de supervivencia; el paper original reporta este escenario como caso de uso principal de HistoEncoder.
- Búsqueda de imágenes similares en archivos de patología: indexar embeddings en una base vectorial para recuperar casos morfológicamente parecidos, útil en control de calidad y educación médica.
- Detección de artefactos y control de calidad de WSI: entrenar un clasificador binario sobre las features para descartar teselas con desenfoque, pliegues o tinción deficiente antes del análisis principal.
- Preentrenamiento inicial para tareas con pocos datos: fine-tuning del backbone en cohortes pequeñas de otros tejidos u otras tinciones, aprovechando la transferencia del dominio prostático.
- Segmentación y detección a nivel de tesela: usar los mapas de features (no solo el pooled) como entrada a cabezas densas para localizar regiones tumorales dentro de una WSI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (AUC, accuracy, F1) ni comparaciones cuantitativas con otros encoders; únicamente referencia el paper de HistoEncoder (arXiv:2411.11458) donde podrían consultarse los resultados originales.

## Requisitos de hardware

- VRAM para inferencia: el modelo tiene 25,9 M de parámetros, aproximadamente 104 MB en fp32 y unos 52 MB en fp16. Con batch pequeño y activaciones, la inferencia cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna sirve; para throughput alto en procesado de WSI (millones de teselas), se recomiendan A100, H100, L40S o RTX 4090. Para uso puntual, una GTX 1650 o incluso CPU es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM (RTX 3050, RTX 4060, etc.), y en CPU con latencia aceptable para lotes pequeños.
- Opciones de despliegue: timm + PyTorch es la vía nativa; también es exportable a ONNX y TorchScript para servir con ONNX Runtime o Triton. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput muy alto en GPU moderna (miles de teselas por segundo en batch), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `1aurent/xcit_small_12_p16_224.histoencoder` | 25,9 M | Imagen 224x224 (divisible por 16) | Patología prostática | Apache-2.0 | Hugging Face Hub (timm) |
| HistoEncoder `prostate_medium` (upstream) | no disponible en la información | Imagen 224x224 | Patología prostática | Apache-2.0 | GitHub `jopo666/HistoEncoder` |
| HistoEncoder `prostate_large` (upstream) | no disponible en la información | Imagen 224x224 | Patología prostática | Apache-2.0 | GitHub `jopo666/HistoEncoder` |
| XCiT small base (`xcit_small_12_p16_224`, ImageNet) | 26,2 M aprox. | Imagen 224x224 | Visión general | Apache-2.0 | timm |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. Las variantes `prostate_medium` y `prostate_large` del proyecto HistoEncoder son alternativas directas del mismo autor con mayor capacidad, pero sus especificaciones exactas no están documentadas en la información disponible.

## Limitaciones y advertencias

- Dominio restringido: el preentrenamiento se hizo exclusivamente sobre tejido prostático; el rendimiento en otros tejidos u otras tinciones puede degradarse sin fine-tuning.
- Discrepancia de preprocesado: las estadísticas de normalización de este port (ImageNet) difieren de las del CLI original de HistoEncoder (estadísticas del dataset). Mezclar ambos flujos puede producir embeddings inconsistentes.
- Sin benchmarks publicados en la model card: no hay métricas que permitan validar el rendimiento downstream sin ejecutar evaluaciones propias.
- Riesgo de sesgo de cohorte: el dataset HelsinkiProstate proviene de un número limitado de centros (1.307 pacientes), lo que puede introducir sesgos hacia prácticas de tinción, escáneres o poblaciones concretas.
- Sin capacidades de texto ni razonamiento: no es un modelo de lenguaje; no admite prompts, tool calling ni generación.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene revisar la licencia del dataset subyacente y del paper original para cumplimiento normativo en aplicaciones clínicas.
- No apto como dispositivo médico: no se documenta validación regulatoria; cualquier uso clínico requiere validación prospectiva independiente.
- Repositorio con 0 descargas y 0 likes: comunidad mínima, lo que reduce la probabilidad de soporte y de reportes de errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1aurent/xcit_small_12_p16_224.histoencoder
- Paper HistoEncoder (arXiv): https://arxiv.org/abs/2411.11458
- Paper HistoEncoder (Journal of Pathology Informatics, DOI): https://doi.org/10.1016/j.jpi.2026.100715
- Paper HistoEncoder (ScienceDirect): https://www.sciencedirect.com/science/article/pii/S215335392600177X
- Paper XCiT: https://arxiv.org/abs/2106.09681
- Repositorio original HistoEncoder: https://github.com/jopo666/HistoEncoder
- Pesos originales (`prostate_small.pth`): https://dl.dropboxusercontent.com/s/tbff9wslc8p7ie3/prostate_small.pth?dl=0
