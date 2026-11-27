# ayshajavd/graphcodebert-vuln-classifier

## Resumen

GraphCodeBERT Vulnerability Classifier es un modelo de clasificación de texto multietiqueta desarrollado por ayshajavd como parte del proyecto de investigación "Out of Harm's Way". Su función es detectar 30 tipos de vulnerabilidades CWE (Common Weakness Enumeration) en código fuente y mapearlas al OWASP Top 10 (2021). El modelo parte de `microsoft/graphcodebert-base`, un transformer de 12 capas y aproximadamente 125 millones de parámetros, y se ha afinado para una tarea de clasificación multietiqueta con 31 etiquetas posibles (30 CWEs más una clase `safe`).

El problema que resuelve es la detección temprana de patrones inseguros en código durante el ciclo de desarrollo, actuando como una capa de análisis estático basada en aprendizaje automático. Es relevante porque combina la representación de GraphCodeBERT (que incorpora información de flujo de datos, no solo sintaxis) con técnicas de entrenamiento diseñadas específicamente para el fuerte desequilibrio de clases inherente a los datasets de vulnerabilidades.

La versión actual (v2) representa una mejora sustancial sobre la v1, que era un modelo CodeBERTa-small con un macro-F1 de 0,116. La v2 alcanza un macro-F1 de 0,476, un micro-F1 de 0,943 y un F1 de 0,982 en la clase `safe`. El modelo se distribuye con licencia Apache 2.0 y está pensado como prototipo de investigación, no como sustituto de herramientas SAST o revisión de código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (GraphCodeBERT, basado en RoBERTa) con 12 capas |
| Parámetros totales | 124.669.471 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncado en entrada) |
| Tipos de cuantización | No disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | Inglés y código fuente (múltiples lenguajes de programación) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GraphCodeBERT es un transformer encoder de 12 capas basado en la arquitectura RoBERTa, pero con una modificación clave: además de la secuencia de tokens, incorpora un grafo de flujo de datos (data flow graph) que captura relaciones semánticas entre variables. Esta representación dual permite al modelo razonar no solo sobre la estructura sintáctica del código, sino también sobre cómo fluyen los datos entre instrucciones, lo que es especialmente relevante para detectar vulnerabilidades como inyecciones SQL o desbordamientos de buffer.

El entrenamiento se realizó sobre 175.419 muestras del dataset `ayshajavd/code-security-vulnerability-dataset`, que agrega datos de BigVul, PrimeVul, Code Vulnerability Labeled Dataset y pares DPO de CyberNative. Se empleó una pérdida asimétrica (Asymmetric Loss, ASL) con `gamma_neg=4`, `gamma_pos=0` y `clip=0.05` para manejar el desequilibrio extremo entre clases. El proceso constó de dos fases: la primera congela los embeddings y las 8 capas inferiores durante 4 épocas con lr 1e-4; la segunda afina todas las capas hasta 9 épocas con lr 2e-5 y early stopping (paciencia 3). Se inicializó el sesgo de la cabeza de clasificación para clases desequilibradas, se optimizaron umbrales por clase en validación y se aplicó escalado de temperatura (T = 0,6163) para calibración.

## Capacidades

- Detección multietiqueta de 30 tipos de vulnerabilidades CWE en código fuente, incluyendo CWE-89 (inyección SQL), CWE-190 (desbordamiento de entero), CWE-94 (inyección de código), CWE-119 (errores de buffer), CWE-200 (exposición de información), CWE-362 (condición de carrera), CWE-79 (XSS) y CWE-20 (validación de entrada).
- Clasificación de código como `safe` con alta fiabilidad (F1 de 0,982 en la clase segura).
- Mapeo automático de CWEs detectadas al OWASP Top 10 (2021).
- Procesamiento de código en múltiples lenguajes de programación (el modelo base está entrenado en varios lenguajes).
- Salida de probabilidades calibradas por clase mediante escalado de temperatura.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step; es un clasificador puro.
- Capacidad multilingüe limitada a inglés y código; no procesa lenguaje natural en otros idiomas.

## Casos de uso

- Integración en pipelines de CI/CD: el modelo puede ejecutarse como un paso de análisis estático en cada pull request, marcando funciones o fragmentos que superen los umbrales de probabilidad para CWEs específicas. Su tamaño (125M parámetros) permite inferencia rápida en CPU o GPU modesta, lo que facilita su adopción en entornos de integración continua.
- Triaje previo a revisión manual: al clasificar código con probabilidades por CWE, los equipos de seguridad pueden priorizar qué fragmentos requieren revisión humana, reduciendo el ruido de herramientas SAST tradicionales y enfocando el esfuerzo en las clases con mayor confianza.
- Educación y formación en seguridad: el modelo puede señalar patrones inseguros en ejercicios de programación o code reviews educativos, explicando qué CWE corresponde a cada fragmento y su relación con OWASP Top 10.
- Análisis de dependencias y código heredado: para bases de código antiguas sin cobertura de pruebas, el modelo puede escanear funciones individuales (hasta 512 tokens) y generar un informe de riesgos por CWE, ayudando a priorizar refactorizaciones.
- Generación de datasets etiquetados: las predicciones del modelo, combinadas con umbrales por clase, pueden usarse para preetiquetar grandes volúmenes de código y acelerar la creación de datasets de seguridad, siempre con validación humana posterior.
- Investigación en detección de vulnerabilidades: como modelo de referencia con métricas detalladas por clase y configuración reproducible (label_config.json, notebooks de entrenamiento), sirve como baseline para experimentos sobre desequilibrio de clases, generalización cross-dataset y calibración.
- Prefiltrado para modelos de reparación: el modelo companion `ayshajavd/codet5p-vuln-fixer` puede recibir únicamente los fragmentos que este clasificador marca como vulnerables, optimizando el coste computacional del pipeline completo de detección y reparación.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test del dataset `ayshajavd/code-security-vulnerability-dataset` (no verificados de forma independiente):

| Métrica | v1 (CodeBERTa-small) | v2 (este modelo) |
|---|---|---|
| Macro F1 (31 etiquetas) | 0,116 | 0,476 |
| Micro F1 | No disponible | 0,943 |
| Weighted F1 | No disponible | 0,945 |
| F1 clase `safe` | No disponible | 0,982 |
| Macro precision | No disponible | 0,482 |
| Macro recall | No disponible | 0,528 |

F1 por clase seleccionadas (v2): CWE-89 inyección SQL 0,79; CWE-190 desbordamiento de entero 0,77; CWE-94 inyección de código 0,71; CWE-119 errores de buffer 0,71; CWE-200 exposición de información 0,70; CWE-362 condición de carrera 0,70; CWE-79 XSS 0,59; CWE-20 validación de entrada 0,57.

No se han publicado resultados de benchmarks en la información disponible para comparaciones con otros modelos de detección de vulnerabilidades.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 500 MB en fp32 (125M parámetros × 4 bytes), alrededor de 250 MB en fp16. El repositorio ocupa 1,3 GB, lo que incluye pesos y posibles artefactos adicionales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona sin problemas en NVIDIA T4, RTX 3060, RTX 4090, A100 y H100; el modelo es lo bastante pequeño como para no requerir GPUs de datacenter.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650, RTX 2060, RTX 3060, RTX 4060, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (TEI) según los tags del repositorio, y endpoints compatibles. No se han publicado variantes GGUF, por lo que llama.cpp u Ollama no están soportados de forma nativa sin conversión manual.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño del modelo y la longitud máxima de 512 tokens, se espera una latencia de decenas de milisegundos por muestra en GPU consumer, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| graphcodebert-vuln-classifier (este) | 125M | 512 tokens | Clasificación multietiqueta de 30 CWEs | Apache 2.0 | Hugging Face |
| microsoft/graphcodebert-base | 125M | 512 tokens | Modelo base (representación de código) | MIT | Hugging Face |
| microsoft/codebert-base | 125M | 512 tokens | Modelo base (representación de código) | MIT | Hugging Face |
| ayshajavd/codet5p-vuln-fixer | No disponible | No disponible | Reparación de vulnerabilidades (modelo companion) | No disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros clasificadores de vulnerabilidades en la información proporcionada. La comparación se limita a arquitectura, tamaño y licencia.

## Limitaciones y advertencias

- Fuerte desequilibrio de clases: el split de test contiene 15.655 etiquetas `safe` pero solo un puñado de ejemplos para muchas CWEs. Tres clases (CWE-276, CWE-434, CWE-918) no tienen ejemplos en test, y varias otras (CWE-269, CWE-327, CWE-352, CWE-798) tienen solo 1 o 2. Siete clases obtienen F1 = 0.
- El macro-F1 de 0,476 sobre 31 etiquetas subestima el rendimiento en clases bien representadas y sobreestima la confianza en clases raras. El micro-F1 y el weighted F1 están dominados por la clase `safe` y no deben interpretarse como calidad global de detección.
- Truncamiento a 512 tokens: funciones largas pierden contexto, lo que puede provocar falsos negativos en vulnerabilidades que requieren ver el flujo completo de la función.
- Ruido en las etiquetas: los datasets de origen (BigVul, PrimeVul, etc.) tienen ruido de etiquetado conocido y posibles duplicados cercanos entre splits, por lo que los resultados pueden no generalizar a bases de código no vistas.
- Sesgos idiomáticos y de lenguaje: el modelo está orientado a inglés y código; no se ha evaluado su comportamiento en comentarios o documentación en otros idiomas.
- Es un prototipo de investigación, no una herramienta de producción: el propio autor indica que no sustituye a la revisión de código ni a herramientas SAST.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de GraphCodeBERT (licencia MIT), se deben respetar ambas licencias y atribuciones.
- No se han publicado variantes cuantizadas ni formatos GGUF, lo que limita el despliegue en entornos sin PyTorch o sin GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ayshajavd/graphcodebert-vuln-classifier
- Modelo base: https://huggingface.co/microsoft/graphcodebert-base
- Dataset de entrenamiento: https://huggingface.co/datasets/ayshajavd/code-security-vulnerability-dataset
- Notebooks de entrenamiento: https://huggingface.co/ayshajavd/vuln-classifier-training-notebooks
- Repositorio del proyecto: https://github.com/ayshajaved/out-of-harms-way-vuln-detection
- Demo (Code Security Risk Analyzer): https://huggingface.co/spaces/ayshajavd/code-security-analyzer
- Modelo companion de reparación: https://huggingface.co/ayshajavd/codet5p-vuln-fixer
- Dataset BigVul: https://huggingface.co/datasets/bstee615/bigvul
- Dataset CyberNative Code Vulnerability Security DPO: https://huggingface.co/datasets/CyberNative/Code_Vulnerability_Security_DPO
- Dataset Code Vulnerability Labeled: https://huggingface.co/datasets/lemon42-ai/Code_Vulnerability_Labeled_Dataset
