# sifat6412/USENIX25-Security-Issue-Classifier

## Resumen

USENIX25-Security-Issue-Classifier es un modelo de clasificación de texto en inglés, obtenido por ajuste fino (fine-tuning) de RoBERTa-base, que predice si un issue de GitHub está relacionado con seguridad o no. Lo desarrollaron originalmente Rajdeep Ghosh, Shiladitya De y Mainack Mondal en el marco del artículo «"I wasn't sure if this is indeed a security risk": Data-driven Understanding of Security Issue Reporting in GitHub Repositories of Open Source npm Packages», presentado en el 34º USENIX Security Symposium (2025). El repositorio alojado en Hugging Face bajo el identificador `sifat6412/USENIX25-Security-Issue-Classifier` es una copia de terceros, no una reproducción independiente de los resultados del paper.

El modelo resuelve un problema concreto de triaje: los issues de seguridad en repositorios de código abierto a menudo no llevan etiqueta, lo que dificulta su detección y priorización. Es un clasificador de secuencias binario (seguridad / no seguridad) que toma el título y el cuerpo del issue como entrada, con un límite de 512 tokens. No es un verificador de vulnerabilidades: emite una probabilidad de que el texto sea un reporte de seguridad, no una confirmación de que exista una vulnerabilidad real.

Con 124,6 millones de parámetros, un tamaño de repositorio de 0,5 GB y un pipeline `text-classification`, es un modelo ligero y desplegable en hardware modesto. Su relevancia actual reside en que permite aplicar automatización al triaje de reportes de seguridad sin etiquetar, un cuello de botella habitual en proyectos de código abierto con alto volumen de issues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base), clasificación de secuencias |
| Parametros totales | 124.647.170 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (corte de inferencia documentado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | `cc` (valor genérico; el autor advierte que no está verificado para redistribución) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `FacebookAI/roberta-base`, un transformer encoder de tipo BERT con 124,6 millones de parámetros, adaptado a clasificación binaria de secuencias mediante una cabeza de clasificación sobre el token `[CLS]`. La entrada se compone como una única cadena de texto que concatena el título y los detalles del issue, truncada a 512 tokens, tal como usa el script de evaluación del artefacto original.

Los datos de entrenamiento etiquetados manualmente por los autores son 2.100 issues de GitHub: 1.042 relacionados con seguridad y 1.058 no relacionados. Esto es una muestra etiquetada; la recolección más amplia del paper abarcó 10.907.467 issues de repositorios asociados a 45.466 paquetes npm, pero esa colección completa no constituye el conjunto de entrenamiento etiquetado. El paper compara varias arquitecturas y selecciona RoBERTa ajustado para los análisis posteriores. Los autores reportan optimización sistemática de hiperparámetros con Optuna y una partición 80 %/20 % de entrenamiento/validación. Los valores exactos de learning rate, tamaño de lote, épocas, precisión numérica y optimizador del checkpoint alojado no están verificados de forma independiente en la información disponible.

## Capacidades

- Clasificación binaria de texto: predice si un issue de GitHub es relacionado con seguridad o no, a partir de título y cuerpo.
- Salida probabilística: devuelve logits convertibles en probabilidades mediante softmax; el índice 1 corresponde a «Security Issue» según el código del artefacto original (debe confirmarse contra `config.json`).
- Procesamiento de texto en inglés exclusivamente.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No tiene modo de razonamiento (thinking mode), visión ni audio.
- No genera texto: es un clasificador, no un modelo generativo.
- Uso directo en investigación sobre reportes de seguridad no etiquetados y en triaje de issues.

## Casos de uso

- Triaje de issues en repositorios de código abierto: el modelo puntúa cada issue entrante con una probabilidad de ser de seguridad, permitiendo priorizar la revisión manual de los casos con mayor puntuación y reducir el tiempo de respuesta ante reportes no etiquetados.
- Investigación empírica sobre reportes de seguridad: permite analizar grandes volúmenes de issues de npm para estudiar patrones de reporte, tasas de detección y calidad de la información, tal como plantea el paper de origen.
- Enrutamiento automático a equipos de seguridad: integrado en un bot de GitHub, puede etiquetar issues y asignarlos al canal o equipo correspondiente cuando la probabilidad supera un umbral configurable.
- Filtrado previo en pipelines de gestión de vulnerabilidades: como primera etapa de un sistema más amplio, descarta issues claramente no relacionados con seguridad antes de pasarlos a herramientas de análisis más costosas.
- Monitorización de proyectos con alto volumen de issues: en repositorios con cientos de reportes semanales, el modelo permite clasificar en lote con bajo coste computacional gracias a sus 124,6 M de parámetros.
- Evaluación comparativa entre ecosistemas: como línea base para estudiar la transferibilidad de clasificadores entrenados en npm hacia otros ecosistemas (PyPI, Maven, etc.), con la advertencia de que dicha transferencia no está establecida por la evaluación reportada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones cuantitativas con otros modelos, y el autor indica explícitamente que el checkpoint alojado no ha sido evaluado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (fp32) para el modelo de 124,6 M de parámetros; aproximadamente 250 MB en fp16 y menos de 150 MB en cuantización de 8 bits (estimaciones teóricas a partir del número de parámetros, no medidas publicadas).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una T4, L4, RTX 3060 o superior ofrece holgura para lotes grandes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante), e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con PyTorch, `text-embeddings-inference` (etiqueta `endpoints_compatible`), así como exportación a ONNX para inferencia optimizada; no se documenta soporte específico de vLLM, llama.cpp u Ollama para este checkpoint.
- Latencia y throughput: no disponibles; dependen del dispositivo, el tamaño de lote y la longitud de entrada. Al ser un encoder de 124 M de parámetros, se espera latencia de milisegundos por muestra en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| USENIX25-Security-Issue-Classifier | 124,6 M | 512 tokens | Clasificación binaria de issues de seguridad | `cc` (no verificada) | Hugging Face |
| FacebookAI/roberta-base | 124,6 M | 512 tokens | Modelo base general (MLM) | MIT | Hugging Face |
| Modelos de clasificación de vulnerabilidades tipo CodeBERT ajustado | ~125 M | 512 tokens | Clasificación de código/texto | variable | Hugging Face |
| Clasificadores genéricos de issues (p. ej., ajustes de BERT en GitHub issues) | ~110-125 M | 512 tokens | Clasificación de issues | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo publicados para este checkpoint frente a alternativas, por lo que la comparación se limita a parámetros, contexto, tarea y licencia.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo se entrenó y evaluó con issues de repositorios de paquetes npm; la transferencia a otros ecosistemas no está establecida.
- Riesgo de falsos negativos: issues de seguridad sin vocabulario característico pueden pasar desapercibidos.
- Riesgo de falsos positivos: issues no relacionados que contengan términos de seguridad pueden ser marcados como tales.
- Truncamiento: el corte de 512 tokens puede omitir información relevante en issues largos.
- Calibración: las puntuaciones son probabilidades del modelo, no estimaciones calibradas de la prevalencia real de vulnerabilidades.
- Idiomas: solo inglés; issues en otros idiomas no están cubiertos.
- Licencia: el valor `cc` es genérico y el propio autor advierte que no basta para establecer la licencia del checkpoint ni el permiso de redistribución; debe consultarse el artefacto original en Zenodo antes de uso comercial o redistribución.
- Autoría: el repositorio es una copia alojada por un tercero, no una reproducción independiente de los resultados del paper.
- Mapeo de etiquetas: debe verificarse en `config.json` antes de interpretar el índice 1 como «Security Issue».
- Uso en producción: requiere revisión manual de los casos consecuentes y evaluación sobre la distribución de clases del repositorio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sifat6412/USENIX25-Security-Issue-Classifier
- Paper (arXiv): https://arxiv.org/abs/2506.07728
- Artefacto de investigación original (Zenodo): https://doi.org/10.5281/zenodo.15614029
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Publicación: 34º USENIX Security Symposium (2025)
