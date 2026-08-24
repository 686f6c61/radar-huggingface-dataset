# leminhhung0101/R-ViHSDModel

## Resumen

R-ViHSDModel es un pipeline de clasificación de texto vietnamita desarrollado por Lê Minh Hùng (leminhhung0101) que combina el modelo de lenguaje preentrenado ViSoBERT con características TF-IDF y modelos lineales clásicos para abordar dos tareas simultáneas: la detección de discurso de odio (hate speech) y la clasificación del tipo de ruido textual presente en redes sociales. El sistema emplea una estrategia de stacking con validación cruzada Out-of-Fold (OOF) para reducir el sobreajuste y mejorar la generalización.

El modelo resuelve un problema relevante en el procesamiento del lenguaje natural para el vietnamita, un idioma con escasos recursos y alta presencia de variantes no normativas (teencode, falta de diacríticos, caracteres repetidos, ofuscación). Su arquitectura híbrida aprovecha tanto la representación semántica profunda de ViSoBERT como las características léxicas robustas de los n-gramas TF-IDF, lo que lo hace especialmente adecuado para textos ruidosos de plataformas sociales. El repositorio tiene un tamaño de 0,4 GB e incluye los artefactos necesarios para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de stacking: ViSoBERT (backbone transformer) + TF-IDF (char y word n-gramas) + LinearSVC (dos clasificadores) + Regresión Logística (meta-modelo) |
| Parametros totales | No disponible (ViSoBERT es un modelo BERT de tamaño base, aproximadamente 110M, pero no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (máxima secuencia configurada para ViSoBERT) |
| Tipos de cuantizacion | No disponible (los pesos de ViSoBERT se guardan en safetensors/pytorch_model.bin; los modelos clásicos en joblib) |
| Idiomas soportados | Vietnamita (principalmente) |
| Licencia | No disponible |
| Formato de pesos | safetensors / pytorch_model.bin (ViSoBERT), joblib (vectorizador, SVMs y meta-modelo) |

## Arquitectura y entrenamiento

El sistema combina tres bloques principales. En primer lugar, ViSoBERT (backbone `uitnlp/visobert`) se ajusta fino para clasificación de odio en tres clases (CLEAN, OFFENSIVE, HATE) con una configuración de 3 épocas, learning rate 2e-5, weight decay 0.01, warmup ratio 0.08, label smoothing 0.05 y batch size 128 con acumulación de gradiente 2. Se utiliza cross-entropy ponderada con pesos de clase basados en raíz cuadrada para mitigar el desequilibrio. En segundo lugar, se extraen características TF-IDF de caracteres (ngramas 3-5, 150.000 features) y palabras (ngramas 1-2, 80.000 features), concatenadas en una matriz dispersa. Estas características alimentan dos clasificadores LinearSVC independientes: uno para odio (3 clases) y otro para ruido (7 clases). Finalmente, las probabilidades de ViSoBERT, las puntuaciones de decisión de los SVMs (transformadas con softmax para el ruido) y características superficiales se combinan en 18 características de stacking que alimentan un meta-modelo de Regresión Logística para la predicción final de odio. El entrenamiento usa validación cruzada Out-of-Fold para evitar fugas de datos, y los modelos base se reentrenan con el conjunto completo para la inferencia.

## Capacidades

- Clasificación de discurso de odio en tres categorías: CLEAN, OFFENSIVE, HATE.
- Clasificación de tipo de ruido textual en siete categorías: ORIGINAL, NO_DIACRITICS, TEENCODE, CHAR_REPEAT, PUNCT_NOISE, OBFUSCATION, MIXED.
- Manejo robusto de texto ruidoso de redes sociales en vietnamita, incluyendo faltas de ortografía, ausencia de diacríticos, repetición de caracteres y ofuscación.
- Representación semántica profunda gracias a ViSoBERT, complementada con características léxicas explícitas.
- Inferencia con formato de entrada mínimo: CSV con columnas `id` y `text`.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es un clasificador especializado.

## Casos de uso

- Moderación de contenido en redes sociales vietnamitas: el pipeline puede clasificar comentarios y publicaciones en tiempo real para detectar discurso de odio y filtrar contenido ofensivo, gracias a su robustez frente a variantes no normativas.
- Análisis de sentimiento y toxicidad en foros y plataformas de opinión: permite monitorizar la evolución del discurso de odio en comunidades online y generar alertas automáticas.
- Limpieza y normalización de datasets de texto vietnamita: la clasificación de ruido (NO_DIACRITICS, TEENCODE, CHAR_REPEAT, etc.) ayuda a identificar y corregir textos corruptos antes de entrenar otros modelos.
- Investigación sociolingüística: los investigadores pueden estudiar patrones de lenguaje ofensivo y variantes de ruido en corpus de redes sociales, utilizando las etiquetas detalladas de ruido.
- Sistemas de recomendación y personalización con filtrado de contenido: integrar el clasificador para evitar recomendar o mostrar contenido dañino a usuarios.
- Herramientas de escucha social para marcas: monitorizar menciones de marca en vietnamita y detectar posibles crisis de reputación por comentarios ofensivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, F1 u otras evaluaciones cuantitativas sobre conjuntos de prueba estándar.

## Requisitos de hardware

- El tamaño del repositorio es de 0,4 GB, lo que sugiere que el modelo completo (ViSoBERT + artefactos clásicos) puede ejecutarse en hardware modesto.
- ViSoBERT es un modelo BERT de tamaño base (aproximadamente 110M parámetros), por lo que la inferencia en CPU es viable para lotes pequeños, aunque más lenta que en GPU.
- VRAM estimada: con cuantización FP16, se necesitan aproximadamente 0,5-1 GB de VRAM para ViSoBERT; los modelos clásicos (joblib) no requieren GPU.
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060) es suficiente; también funciona en CPU para inferencia por lotes.
- Opciones de despliegue: se puede servir mediante Hugging Face Inference Endpoints, o empaquetar como API con FastAPI/Flask. Los artefactos joblib se cargan con `joblib.load()` y ViSoBERT con `transformers`.
- Latencia y throughput: no disponible; depende del hardware y del tamaño de lote.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en la documentación proporcionada. Sin embargo, en el ámbito de detección de odio en vietnamita existen alternativas como PhoBERT-based classifiers o modelos multilingües como XLM-R, pero no se pueden comparar cuantitativamente sin datos de benchmarks. Se recomienda consultar la literatura académica sobre el tema.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para texto vietnamita; su rendimiento en otros idiomas no está garantizado.
- La longitud de contexto está limitada a 128 tokens, por lo que textos largos deben truncarse, lo que puede perder información relevante.
- No se han publicado métricas de rendimiento, por lo que se desconoce su precisión real en entornos de producción.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial y redistribución.
- El pipeline depende de múltiples artefactos (joblib y safetensors) que deben mantenerse sincronizados; cualquier cambio en el vectorizador o los SVMs requiere reentrenamiento completo.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí puede haber errores de clasificación, especialmente en casos ambiguos o con ruido extremo.
- Los sesgos del modelo dependen de los datos de entrenamiento, que no se describen en detalle; es posible que tenga un rendimiento desigual entre diferentes dialectos o registros del vietnamita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leminhhung0101/R-ViHSDModel
- Perfil del autor: https://huggingface.co/leminhhung0101
- Espacio de Hugging Face del autor (no directamente relacionado): https://huggingface.co/spaces/leminhhung0101/OptimizedLfm-serving
