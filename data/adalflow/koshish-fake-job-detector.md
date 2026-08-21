# Adalflow/koshish-fake-job-detector

## Resumen

El modelo **Adalflow/koshish-fake-job-detector** es un clasificador de texto diseñado para detectar ofertas de empleo fraudulentas. Desarrollado por el usuario Adalflow, se presenta como un modelo de clasificación binaria (text-classification) basado en la arquitectura XLM-RoBERTa, como indican los tags del repositorio. Con 278 millones de parámetros, se alinea con el tamaño del XLM-RoBERTa base, aunque la model card no especifica oficialmente la arquitectura exacta ni el proceso de entrenamiento.

El modelo aborda un problema creciente en el mercado laboral digital: las estafas en portales de empleo. Su relevancia radica en la posibilidad de integrarse en plataformas de empleo o extensiones de navegador para advertir a los usuarios sobre anuncios sospechosos. Sin embargo, la documentación es extremadamente escasa: la model card está prácticamente vacía y no se ofrecen detalles sobre el dataset de entrenamiento, los resultados de evaluación ni las limitaciones, lo que dificulta su adopción en entornos productivos sin una validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (XLM-RoBERTa, según tags; no confirmado oficialmente) |
| Parámetros totales | 278.075.186 |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa base soporta 512 tokens, pero no se confirma) |
| Tipos de cuantización | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (XLM-RoBERTa base cubre 100 idiomas, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se infiere de los tags: se trata de un modelo transformer basado en XLM-RoBERTa, una variante de RoBERTa preentrenada en 100 idiomas. El pipeline de clasificación de texto indica que la cabeza del modelo es una capa de clasificación sobre la salida del token `[CLS]`. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, el proceso de fine-tuning (si se usó RLHF, DPO u otro método), ni las hiperparámetros. El tag `arxiv:1910.09700` corresponde al paper de XLM-RoBERTa, lo que sugiere que se partió de ese modelo base, pero no hay confirmación explícita en la model card.

## Capacidades

- **Clasificación de texto**: el modelo está diseñado para clasificar ofertas de empleo como legítimas o fraudulentas, probablemente mediante una salida binaria o multiclase (no especificada).
- **Soporte multilingüe**: si se basa en XLM-RoBERTa, podría procesar texto en hasta 100 idiomas, aunque no se ha confirmado en esta implementación.
- **Sin capacidades adicionales**: no se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- **Filtrado en portales de empleo**: integrar el modelo en plataformas como LinkedIn o Indeed para marcar automáticamente ofertas sospechosas antes de su publicación, reduciendo el riesgo de fraude para los usuarios.
- **Verificación manual de anuncios**: utilizarlo como herramienta de apoyo para reclutadores y candidatos, que pegan una descripción de empleo y reciben una puntuación de riesgo.
- **Análisis de phishing laboral**: detectar intentos de estafa que suelen incluir redacciones genéricas, salarios irreales o solicitudes de datos personales.
- **Monitoreo de correos no deseados**: clasificar correos de ofertas recibidos en cuentas personales para alertar a los usuarios de posibles fraudes.
- **Investigación académica**: servir como punto de partida para estudios sobre detección de fraude laboral con modelos basados en transformers.
- **Sistema de alertas en extensiones de navegador**: un plugin que analice en tiempo real las ofertas que el usuario visita y muestre una advertencia si se detectan patrones de fraude.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como precisión, recall, F1 ni comparaciones con otros modelos. Tampoco hay datos de rendimiento en términos de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 278 millones de parámetros, el modelo en FP32 ocupa aproximadamente 1,1 GB (el tamaño del repo coincide). En cuantización INT8 (no disponible en el repo) se reduciría a ~400 MB, pero no se ofrecen archivos cuantizados.
- **GPU recomendadas**: para inferencia en tiempo real, una GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060) sería suficiente en FP32. Para cargas concurrentes se recomienda una GPU con 4-6 GB (RTX 3060, RTX 4060).
- **Compatibilidad con consumer GPU**: sí, el modelo cabe en la mayoría de GPUs de consumo actuales.
- **Opciones de despliegue**: al ser un modelo de transformers, puede servirse con bibliotecas como Transformers, Text Embeddings Inference (TEI), o mediante contenedores compatibles con el Hub (endpoints_compatible). También podría usarse con ONNX Runtime o TensorRT si se convierte.
- **Latencia y throughput**: no se dispone de datos; un modelo de 278M en una GPU moderna procesa secuencias de 512 tokens en decenas de milisegundos, pero no se verifica para esta implementación.

## Comparativa con modelos similares

No hay modelos comparables documentados en la información disponible. Existen proyectos open source de detección de ofertas falsas (como los encontrados en GitHub: `2KRISHNAYADAV/Fake-Job-Posting-Detector` o `saadparekh/ai_fake-job-detector`), pero utilizan enfoques de machine learning clásico (Random Forest, TF-IDF) y no son directamente comparables en arquitectura. No se conoce ningún otro modelo transformer específico para esta tarea con licencia y métricas públicas.

## Limitaciones y advertencias

- **Documentación ausente**: la model card no ofrece información sobre el dataset de entrenamiento, los sesgos, o las condiciones de uso. No se puede garantizar la calidad del modelo.
- **Sesgos desconocidos**: al no detallarse los datos de entrenamiento, es probable que el modelo presente sesgos hacia ciertos idiomas, regiones o tipos de oferta (p. ej., sectores tecnológicos o financieros).
- **Riesgo de alucinación**: como clasificador de texto, el modelo puede generar falsos positivos (marcar ofertas legítimas como falsas) o falsos negativos (dejar pasar fraudes), con consecuencias graves para los usuarios.
- **Licencia no especificada**: la licencia se indica como "no disponible", lo que impide conocer si es permitido su uso comercial o su modificación.
- **Idiomas no garantizados**: aunque XLM-RoBERTa base soporta 100 idiomas, el fine-tuning podría haber reducido el soporte a un subconjunto, sin confirmación.
- **Contexto limitado**: la longitud de contexto probablemente se limita a 512 tokens (estándar de XLM-RoBERTa), lo que impide analizar ofertas de empleo muy extensas o documentos adjuntos.
- **Sin soporte técnico**: al ser un modelo publicado por un usuario individual, no hay garantías de mantenimiento, corrección de errores o actualizaciones.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Adalflow/koshish-fake-job-detector)
- [Paper de XLM-RoBERTa (arXiv:1910.09700)](https://arxiv.org/abs/1910.09700)
- [Proyecto similar en GitHub (2KRISHNAYADAV)](https://github.com/2KRISHNAYADAV/Fake-Job-Posting-Detector)
- [Proyecto similar en GitHub (saadparekh)](https://github.com/saadparekh/ai_fake-job-detector)

No se encontraron otros repositorios, demos o blogs oficiales del autor.
