# mradermacher/LibreGemma4e4b-i1-GGUF

## Resumen

LibreGemma4e4b-i1-GGUF es una cuantización GGUF con matriz de importancia (imatrix) del modelo LibreYOLO/LibreGemma4e4b, un modelo de visión y lenguaje (VLM) especializado en detección de objetos y comprensión de imágenes. El cuantizador mradermacher ha preparado varios niveles de compresión (Q2_K, IQ3_M, Q4_K_S) para permitir su ejecución en hardware de consumo, manteniendo un equilibrio entre tamaño, velocidad y calidad. Con 7.518.069.290 parámetros (~7,5B), este modelo combina capacidades de generación de texto, diálogo multimodal y detección de objetos, todo bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un VLM de 7,5B en GPUs con 6-8 GB de VRAM mediante cuantización GGUF, algo especialmente útil para desarrolladores que necesitan integrar visión por computador y lenguaje natural en entornos con recursos limitados. Al ser un modelo reciente (agosto de 2026) y con pocas descargas, la documentación pública sobre su arquitectura y entrenamiento es escasa, por lo que esta ficha se basa principalmente en los metadatos disponibles y en las características inferibles de su nombre y etiquetas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (VLM con detección de objetos; posiblemente transformer con mezcla de expertos, según el sufijo "4e4b") |
| Parametros totales | 7.518.069.290 (~7,5B) |
| Parametros activos | no disponible (posiblemente 4B si es MoE, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (4,5 GB), i1-IQ3_M (4,8 GB), i1-Q4_K_S (5,3 GB), más archivo imatrix |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con archivos mmproj en el repositorio estático) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base LibreYOLO/LibreGemma4e4b. El nombre sugiere una combinación de "LibreYOLO" (posiblemente una variante de YOLO para detección de objetos) y "Gemma4e4b" (que podría indicar una arquitectura basada en Gemma con 4B parámetros activos y 4 expertos, típico de modelos MoE). Sin embargo, estos detalles no están confirmados en la documentación pública.

El presente repositorio es una cuantización GGUF con imatrix realizada por mradermacher, no un entrenamiento original. La cuantización reduce la precisión de los pesos para disminuir el uso de memoria y acelerar la inferencia, utilizando la técnica imatrix para optimizar la asignación de bits según la importancia de cada tensor. El modelo base se distribuye con licencia Apache 2.0 y está etiquetado como VLM (vision-language model) con pipeline de detección de objetos.

## Capacidades

- Generación de texto y diálogo conversacional multimodal (imagen + texto).
- Detección de objetos en imágenes, probablemente devolviendo bounding boxes y clases.
- Comprensión de imágenes y respuesta a preguntas sobre su contenido (image-text-to-text).
- Soporte para inferencia en formato GGUF mediante llama.cpp y ecosistemas compatibles (Ollama, LM Studio, etc.).
- Capacidades multilingües limitadas al inglés según los metadatos.
- Posible soporte de tool calling y agentes, aunque no está confirmado en la documentación disponible.

## Casos de uso

- Automatización de inspección visual en entornos industriales: el modelo puede analizar imágenes de líneas de producción para detectar defectos u objetos específicos, gracias a su pipeline de detección de objetos. Su tamaño cuantizado permite ejecutarlo en GPUs de gama media (p. ej., RTX 3060) para inferencia en tiempo real.
- Asistentes de accesibilidad para personas con discapacidad visual: combinando la generación de lenguaje natural con la detección de objetos, el modelo puede describir escenas y localizar elementos relevantes (puertas, obstáculos, señales) a partir de imágenes capturadas con un smartphone.
- Moderación de contenido en plataformas sociales: el modelo puede identificar objetos prohibidos o peligrosos en imágenes subidas por usuarios, generando alertas automáticas. Su licencia Apache 2.0 facilita su integración en sistemas propietarios.
- Análisis de imágenes médicas básicas (sin diagnóstico): puede localizar estructuras anatómicas en radiografías o ecografías para asistir a personal no especializado en triaje inicial, siempre con supervisión humana.
- Robótica educativa y prototipos: al ser un VLM ligero (5,3 GB en Q4_K_S), puede desplegarse en un Jetson Orin Nano o similar para que robots educativos reconozcan y manipulen objetos según comandos de voz.
- Generación de descripciones automáticas para catálogos de comercio electrónico: el modelo puede recibir una foto de producto y generar un texto descriptivo, además de identificar el tipo de objeto para clasificarlo en la base de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de detección de objetos (mAP, IoU) para este modelo o su base LibreYOLO/LibreGemma4e4b.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4,5 GB (Q2_K) y 5,3 GB (Q4_K_S) para el modelo completo, más memoria adicional para el procesador de visión (mmproj) y el contexto. En la práctica se recomienda al menos 8 GB de VRAM para una experiencia fluida con Q4_K_S.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB), o GPUs de datacenter como A10 o A100 si se requiere mayor throughput. También es ejecutable en Apple Silicon con 16 GB unificados.
- Sí cabe en GPUs de consumo: una RTX 3060 de 12 GB puede ejecutar el quants Q4_K_S con holgura.
- Opciones de despliegue: llama.cpp (línea de comandos), Ollama (con registro manual), LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python. Para despliegue en producción con mayor concurrencia, se puede convertir a otros formatos o usar vLLM si se dispone de los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, la cuantización y la longitud del contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría (VLM con detección de objetos y tamaño ~7,5B). Modelos como LLaVA-1.6 (7B) o PaliGemma (3B) podrían ser alternativas, pero no hay datos públicos de rendimiento del modelo base para contrastar. Se recomienda evaluar directamente sobre el caso de uso concreto.

## Limitaciones y advertencias

- La documentación pública del modelo base es muy limitada: no se conocen detalles sobre el dataset de entrenamiento, el proceso de alineación (RLHF/DPO) ni las técnicas de optimización empleadas.
- Al ser una cuantización, se introduce pérdida de calidad respecto al modelo original en precisión de detección y generación de texto, especialmente en los quants de menor tamaño (Q2_K).
- El modelo solo soporta inglés como idioma de entrada/salida según los metadatos, lo que limita su uso en entornos multilingües.
- No se han publicado evaluaciones de sesgos ni de robustez ante imágenes adversariales; su uso en aplicaciones críticas (médicas, seguridad) requiere validación adicional.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base por si hubiera restricciones adicionales no reflejadas en esta ficha.
- El repositorio no incluye los archivos mmproj (proyección de visión) en esta variante i1; deben descargarse del repositorio estático (mradermacher/LibreGemma4e4b-GGUF), lo que añade un paso extra en el despliegue.

## Enlaces

- Repositorio HuggingFace (cuantización i1): https://huggingface.co/mradermacher/LibreGemma4e4b-i1-GGUF
- Repositorio HuggingFace (cuantización estática): https://huggingface.co/mradermacher/LibreGemma4e4b-GGUF
- Modelo base (LibreYOLO/LibreGemma4e4b): https://huggingface.co/LibreYOLO/LibreGemma4e4b
- Página de descargas de mradermacher: https://hf.tst.eu/model
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
