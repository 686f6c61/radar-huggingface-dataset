# Harsha001/DaisyRose-27B-ROCmFPX

## Resumen

DaisyRose-27B-ROCmFPX es un conjunto de cuantizaciones GGUF de tipo *hardware-aware* del modelo RadixArk/DaisyRose-27B, un ajuste fino mediante aprendizaje por refuerzo sobre Qwen3.8-27B. Lo publica el usuario Harsha001 y está específicamente orientado a GPUs AMD mediante los formatos de peso propietarios ROCmFPX, que requieren un fork de llama.cpp para su carga. El modelo base es denso, de 27.320.697.863 parámetros, 64 capas, con una arquitectura híbrida de *gated delta net* y atención completa cada cuatro capas, además de entrada de imagen.

La relevancia de esta publicación es doble: por un lado, ofrece pesos cuantizados de un modelo multimodal de 27B para hardware AMD (incluida la plataforma Strix Halo con memoria unificada), un segmento tradicionalmente mal cubierto por las cuantizaciones estándar; por otro, documenta con rigor la degradación de calidad de cada formato mediante divergencia KL frente a los pesos BF16, con métricas concretas por archivo. La licencia es Apache-2.0 y el repositorio ocupa 78,7 GB.

No se trata de un lanzamiento oficial: el autor declara explícitamente que todos los créditos del modelo corresponden a RadixArk y al equipo de Qwen, y que solo las cuantizaciones y el runtime son propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: gated delta net con atención completa cada cuarta capa, 64 capas, capa de predicción multi-token (MTP) conservada |
| Parametros totales | 27.320.697.863 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de ejecución usa 32.768 tokens; en la variante de 8 GB se recomiendan 8K) |
| Tipos de cuantizacion | Q8_0 ROCmFPX (8 bits), Q6_K ROCmFPX (6 bits), ROCmFP4 con capas de atención/delta net/salida a 8 bits ROCmFPX, IQ2_XXS (2 bits, con capa MTP en ROCmFPX 2 bits); codificador visual en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (formatos ROCmFPX con escalas por tensor almacenadas como `.scale`; requiere el fork ROCmFPX de llama.cpp) |

## Arquitectura y entrenamiento

El modelo base DaisyRose-27B es un ajuste fino con aprendizaje por refuerzo de Qwen3.8-27B, según indica la model card. La arquitectura es un transformer denso de 64 capas que combina capas de *gated delta net* con atención completa cada cuatro capas, un patrón híbrido que reduce el coste computacional de la atención en la mayor parte de la profundidad de la red. Incluye además una capa de predicción multi-token (MTP), que se conserva en todos los archivos cuantizados publicados, y un codificador visual que habilita la entrada de imágenes (pipeline `image-text-to-text`).

El proceso de cuantización parte de una conversión a BF16 mediante `convert_hf_to_gguf.py` y posterior `llama-quantize` con las escalas por tensor de ROCmFPX activadas (una escala potencia de dos por tensor). Se generó una *importance matrix* a partir del dataset `calibration_datav3` sobre los pesos BF16. Los archivos se validaron únicamente en CPU hasta la fecha de publicación; el autor indica que Vulkan y ROCm no se han probado con este modelo y solicita reportes en la pestaña Community. Cada archivo pasó una comprobación de chat greedy ("¿Cuál es la capital de Francia?" devuelve "Paris").

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat de Qwen3.8 y modo *thinking* activado por defecto.
- Comprensión de imágenes: el codificador visual F16 (`mmproj-DaisyRose-27B-F16.gguf`, 0,9 GB) se añade como archivo separado para habilitar entrada de imagen.
- Razonamiento y matemáticas: el modelo base es un ajuste fino por refuerzo, orientado a mejorar el razonamiento, aunque no se publican benchmarks que lo cuantifiquen.
- Predicción multi-token (MTP) conservada en todos los archivos, lo que permite decodificación especulativa a nivel de modelo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de *tool calling* y agentes: no documentado en la model card; no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con infraestructura de inferencia estándar, aunque el runtime requerido es un fork.

## Casos de uso

- Despliegue en estaciones AMD con Strix Halo: el archivo Q6_K (22,5 GB) o Q8_0 (28,3 GB) cabe en la memoria unificada de 32 GB de estas plataformas, permitiendo ejecutar un modelo multimodal de 27B en local sin GPU discreta.
- Asistencia conversacional con imágenes en hardware de 24 GB: el archivo ROCmFP4 (19,2 GB) más el codificador visual deja margen para contexto y se ejecuta en GPUs AMD de 24 GB.
- Procesamiento de documentos con OCR y descripción visual: la combinación de entrada de imagen y contexto de hasta 32K tokens permite analizar capturas, diagramas o páginas escaneadas en una sola pasada.
- Evaluación de cuantizaciones en pipelines de investigación: las métricas de divergencia KL y coincidencia de token superior por archivo permiten seleccionar el compromiso tamaño/calidad adecuado antes de desplegar.
- Prototipado en GPUs de 8 GB: el archivo IQ2_XXS (7,7 GB, con ~7,0 GB en GPU) posibilita probar el modelo en tarjetas de gama baja, aceptando una degradación notable de calidad (perplejidad 8,409 frente a 5,941 en BF16).
- Integración en servidores llama.cpp con `--jinja`: el uso de `llama-server` con la plantilla de chat de Qwen3.8 facilita exponer el modelo como API compatible con clientes que envían mensajes estructurados.
- Comparación de rendimiento entre backends Vulkan y ROCm/HIP en hardware AMD: el autor solicita reportes de la comunidad, por lo que el modelo sirve como banco de pruebas para validar los kernels ROCmFP4.

## Benchmarks y rendimiento

La model card no incluye benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Sí publica métricas de fidelidad de cuantización: divergencia KL frente a BF16 sobre 40 fragmentos de 512 tokens de Wikipedia en inglés (wikitext-2), perplejidad y coincidencia de token superior.

| Build | Tamano | Perplejidad | KL a BF16 | Mismo token superior |
|---|---:|---:|---:|---:|
| BF16 (referencia, no publicado) | 54,6 GB | 5,941 | — | — |
| Q8_0_ROCMFPX | 28,3 GB | 5,946 | 0,00025 | 99,3% |
| Q6_K_ROCMFPX | 22,5 GB | 5,947 | 0,0020 | 98,0% |
| Q4_0_ROCMFP4_STRIX_O8 | 19,2 GB | 5,998 | 0,019 | 94,0% |
| IQ2_XXS-8GB | 7,7 GB | 8,409 | 0,42 | 72,6% |
| Q8_0 stock (comparación, no subido) | 29,0 GB | 5,946 | 0,00037 | 99,2% |
| Q6_K stock (comparación, no subido) | 22,4 GB | 5,940 | 0,0018 | 97,9% |
| Q4_K_M stock (comparación, no subido) | 16,8 GB | 5,942 | 0,014 | 94,6% |

Lectura de los datos: a 8 bits el archivo ROCmFPX es más pequeño que el Q8_0 estándar y está más cerca de BF16 (KL 0,00025 frente a 0,00037). A 6 bits ambos formatos están prácticamente empatados. A 4 bits, el Q4_K_M estándar es más pequeño (16,8 GB frente a 19,2 GB) y más fiel a BF16 (KL 0,014 frente a 0,019); el archivo ROCmFP4 se justifica por su disposición para los kernels ROCmFP4, no por calidad. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 28,3 GB (Q8_0), 22,5 GB (Q6_K), 19,2 GB (ROCmFP4), 7,7 GB (IQ2_XXS, de los cuales ~7,0 GB en GPU). El codificador visual añade 0,9 GB.
- GPUs recomendadas: AMD Strix Halo (memoria unificada de 32 GB) para Q8_0 y Q6_K; GPUs AMD de 32 GB para Q8_0; GPUs AMD de 24 GB para Q6_K con contexto corto y para ROCmFP4; GPUs de 8 GB para IQ2_XXS.
- Cabe en GPU de consumo: sí, en el caso de IQ2_XXS en tarjetas de 8 GB y en ROCmFP4 en tarjetas de 24 GB. No se documentan requisitos para GPUs NVIDIA, ya que los formatos ROCmFPX requieren el fork con soporte AMD (Vulkan o ROCm/HIP).
- Opciones de despliegue: exclusivamente el fork ROCmFPX de llama.cpp (rama `main`), compilado con Vulkan o ROCm/HIP, mediante `llama-server`. llama.cpp estándar no puede cargar los archivos ROCmFPX; Ollama, vLLM y TGI no están soportados según la información disponible.
- Latencia y throughput: no disponibles. El autor indica que solo se ha verificado en CPU y que Vulkan y ROCm no se han probado aún con este modelo.
- En el archivo de 8 GB, el *token embedding* permanece en memoria del sistema, lo que deja espacio para unos 8K tokens de contexto; se recomienda mantener el codificador visual en CPU con `--no-mmproj-offload`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaisyRose-27B-ROCmFPX (esta ficha) | 27,3B denso | no disponible (ejemplos con 32K) | GGUF ROCmFPX, fork llama.cpp | Apache-2.0 | Hugging Face, 296 descargas |
| RadixArk/DaisyRose-27B (base) | 27,3B denso | no disponible | safetensors/BF16 | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (modelo origen) | 27B denso | no disponible | safetensors y GGUF estándar | Apache-2.0 (según la model card) | Hugging Face |
| Cuantización GGUF estándar Q4_K_M del mismo modelo | 27,3B denso | depende del runtime | GGUF, llama.cpp estándar | Apache-2.0 | generable localmente; no subida |

La comparación relevante es frente a las cuantizaciones estándar del mismo modelo: el Q8_0 ROCmFPX es más pequeño y más fiel que el Q8_0 stock, mientras que a 4 bits el Q4_K_M stock gana en tamaño y fidelidad. La ventaja diferencial de esta publicación es la disposición de los pesos para los kernels ROCmFP4 en GPUs AMD, no una mejora intrínseca de calidad.

## Limitaciones y advertencias

- Requiere un fork específico de llama.cpp (ROCmFPX); no funciona con llama.cpp estándar, Ollama, vLLM ni TGI según la información disponible.
- Solo se ha validado en CPU: los backends Vulkan y ROCm no se han probado con este modelo, por lo que el rendimiento real en GPU AMD es desconocido.
- El archivo de 8 GB (IQ2_XXS) presenta una degradación severa: perplejidad 8,409 frente a 5,941 en BF16 y solo 72,6% de coincidencia de token superior. El propio autor lo desaconseja salvo para hardware de 8 GB.
- La cuantización a 4 bits ROCmFP4 es menos fiel y más grande que el Q4_K_M estándar; su elección debe basarse en el rendimiento de los kernels, que aún no se ha medido.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de fidelidad factual para este ajuste.
- Sesgos: no documentados en la información proporcionada.
- Idiomas: no se especifica la cobertura lingüística; la validación de calidad se realizó únicamente con texto de Wikipedia en inglés.
- Modo *thinking* activado por defecto en la plantilla de chat, lo que incrementa la latencia y el consumo de tokens si no se desactiva.
- No es una versión oficial de RadixArk ni del equipo de Qwen; el soporte depende del autor de la cuantización.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del runtime fork.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/Harsha001/DaisyRose-27B-ROCmFPX
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Modelo origen: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- llama.cpp: https://github.com/ggml-org/llama.cpp
