# HWBJTUOPD/Qwen3.5-9B-SFT10K-VisionOPD6K-SFT9BTeacher

## Resumen

Qwen3.5-9B-SFT10K-VisionOPD6K-SFT9BTeacher es un modelo de visión-lenguaje de 9.409.813.744 parámetros (aproximadamente 9,4B), resultado de un fine-tune del modelo base Qwen/Qwen3.5-9B mediante la técnica de Online Perception Distillation (OPD). El modelo fue desarrollado por HWBJTUOPD y publicado bajo licencia Apache-2.0. Su objetivo es mejorar la percepción de regiones específicas en imágenes: el modelo "estudiante" recibe la imagen completa con la región objetivo marcada con una caja roja, mientras que un "profesor" fijo (también Qwen3.5-9B) recibe el recorte real de esa región, y la destilación en línea transfiere ese conocimiento de percepción fina al estudiante.

El modelo parte de un checkpoint SFT de 10K pasos y se entrena durante 65 pasos de OPD con el dataset Vision-OPD-6K (6.241 filas). Es relevante porque demuestra una metodología de destilación en línea para tareas de percepción visual de regiones, con resultados verificados en cuatro benchmarks. Al estar basado en Qwen3.5-9B, hereda la arquitectura híbrida (atención lineal + transformer) y las capacidades multimodales del modelo original, aunque el fine-tune se centra específicamente en tareas de percepción de regiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención lineal + transformer) multimodal, basada en Qwen3.5-9B |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K nativo en Qwen3.5-9B; el entrenamiento OPD usó longitudes de 8.192/1.024/9.216 tokens |
| Tipos de cuantizacion | No publicados; compatible con cuantización estándar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponible para el fine-tune; el base Qwen3.5-9B soporta 201 idiomas |
| Licencia | Apache-2.0 (sujeta a términos upstream de Qwen y licencias de datasets) |
| Formato de pesos | safetensors (model.safetensors, 18.819.722.392 bytes, SHA256 c86054edddaf186b5a0754fed55e4d8e80108ba2081ff7e6ba7c2d3e589ccdc7) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina atención lineal con capas transformer tradicionales, diseñada para mejorar la eficiencia en contextos largos manteniendo la calidad de razonamiento. Es un modelo denso (no MoE) con 9,4B parámetros y soporte nativo multimodal (texto, imagen, vídeo). El fine-tune OPD mantiene esta arquitectura y añade una capa de entrenamiento específica: el estudiante procesa la imagen completa con una región marcada, mientras el profesor ve el recorte real de esa región. La destilación en línea (OPD) con un profesor fijo (teacher_update_rate=0) transfiere el conocimiento de percepción fina al estudiante.

El entrenamiento OPD se realizó con 8 GPUs, semilla 42, rollout n=8, batch de entrenamiento 96, y 65 pasos. Se usó LR 2e-6 con 10 pasos de warmup, longitudes de 8.192/1.024/9.216 tokens, top-k de destilación 100, alpha 0.5 y rango de clip PPO 0.2–0.3. El dataset Vision-OPD-6K tiene 6.241 filas con pares de imagen completa y recorte de región. No se menciona el uso de RLHF o DPO; el método es específicamente destilación de percepción en línea.

## Capacidades

- Percepción visual de regiones específicas: el modelo identifica y razona sobre objetos o áreas marcadas en una imagen, gracias al entrenamiento con cajas rojas y recortes.
- Razonamiento visual general heredado del base Qwen3.5-9B: comprensión de imágenes, respuesta a preguntas visuales, razonamiento multimodal.
- Soporte multi-imagen: el modelo puede procesar varias imágenes en una misma conversación.
- Conversación multimodal: pipeline image-text-to-text, capaz de mantener diálogos con referencias visuales.
- Soporte de tool calling y agentes: heredado del base Qwen3.5-9B, que incluye tool calling nativo y comportamiento agéntico.
- Soporte multilingüe: el base soporta 201 idiomas, aunque no se ha verificado para el fine-tune específico.

## Casos de uso

- Anotación automática de imágenes: el modelo puede generar descripciones detalladas de regiones específicas marcadas por el usuario, útil para etiquetado de datasets de visión por computadora.
- Control de calidad visual en fabricación: al marcar una región de una imagen de producto, el modelo puede identificar defectos o anomalías en esa zona concreta.
- Asistencia a personas con discapacidad visual: combinado con un sistema de captura de imagen, el modelo puede describir objetos o áreas señaladas en la imagen capturada.
- Sistemas de respuesta a preguntas visuales (VQA) sobre documentos: el modelo puede extraer información de tablas, gráficos o figuras marcadas en un documento escaneado.
- Análisis de imágenes médicas de bajo coste: con la región de interés marcada, el modelo puede ayudar a identificar estructuras o anomalías, aunque requiere validación experta.
- Automatización de pruebas visuales en software: el modelo puede verificar si una región específica de una captura de pantalla cumple ciertos criterios, integrándose en pipelines de CI/CD.

## Benchmarks y rendimiento

Los resultados publicados en la model card son verificados por el repositorio HW-BJTU-OPD con un protocolo determinista:

| Benchmark | Resultado |
|---|---:|
| VStar | 176/191 (92,15%) |
| MMStar | 1159/1500 (77,27%) |
| BLINK-v5 | 1263/1901 (66,44%) |
| ZoomBench | 525/845 (62,13%) |
| Macro | 74,4955% |

No se han publicado comparaciones con otros modelos en la misma tabla. La evaluación de ZoomBench requiere un juez semántico adicional de 27B (Qwen3.5-27B). El repositorio ofrece un script de reproducción pública para VStar con una sola GPU de 48 GB.

## Requisitos de hardware

- VRAM estimada: el modelo en FP32 ocupa ~37,6 GB; con cuantización de 4 bits (~5 GB) o 8 bits (~10 GB) puede ejecutarse en GPUs de consumo.
- GPU recomendadas: para inferencia sin cuantizar, una GPU con al menos 48 GB (por ejemplo, A6000, A40, o varias GPUs en paralelo). La modelo card indica que la topología de baja coste usa una GPU CUDA de 48 GB; la topología histórica TP8 usa 8 GPUs.
- Compatibilidad con GPU de consumo: sí, con cuantización (por ejemplo, RTX 4090 con 24 GB puede alojar una versión de 8 bits o menos).
- Opciones de despliegue: vLLM (el repositorio usa vLLM 0.18 con override de Transformers 5.5), llama.cpp, Ollama, TGI. El modelo es compatible con transformers y safetensors.
- Latencia y throughput: no publicados; depende de la cuantización y el hardware. Con vLLM en una GPU de 48 GB se espera un throughput razonable para tareas interactivas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento visual | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9,4B | 262K | Apache-2.0 | Benchmarks oficiales de Qwen3.5 | HuggingFace, ModelScope |
| Qwen3.5-9B-SFT10K-VisionOPD6K (este) | 9,4B | 262K (entrenado con 9K) | Apache-2.0 | VStar 92,15%, MMStar 77,27% | HuggingFace |
| Qwen2.5-VL-7B | 7,6B | 32K | Apache-2.0 | MMStar ~60% (aprox.) | HuggingFace |
| Llama-3.2-11B-Vision | 11B | 128K | Llama 3.2 Community | MMStar ~55% (aprox.) | HuggingFace |

Los valores de comparación para Qwen2.5-VL y Llama-3.2 son aproximados y no verificados; se recomienda consultar las fuentes oficiales. El modelo destaca en percepción de regiones gracias al entrenamiento OPD, pero no hay comparaciones directas publicadas.

## Limitaciones y advertencias

- El modelo está especializado en tareas de percepción de regiones mediante OPD; su rendimiento en tareas visuales generales fuera de ese ámbito puede ser inferior al del base Qwen3.5-9B.
- El dataset de entrenamiento es pequeño (6.241 filas), lo que puede limitar la generalización a dominios no vistos.
- La longitud de contexto efectiva durante el entrenamiento fue de 9.216 tokens, muy inferior al contexto nativo de 262K; el modelo puede no manejar bien contextos largos en tareas visuales complejas.
- Riesgo de alucinación en descripciones de regiones pequeñas o ambiguas; se recomienda validación humana en aplicaciones críticas.
- No se han publicado evaluaciones de sesgos ni de seguridad; el modelo puede reflejar sesgos del dataset Vision-OPD-6K y del base Qwen3.5-9B.
- La licencia Apache-2.0 permite uso comercial, pero está sujeta a los términos upstream de Qwen y a las licencias de los datasets y benchmarks referenciados.
- El modelo requiere verificación de integridad (hashes SHA256) para reproducir los resultados; pequeñas diferencias de topología o kernel pueden alterar algunas salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HWBJTUOPD/Qwen3.5-9B-SFT10K-VisionOPD6K-SFT9BTeacher
- Repositorio del proyecto (código, configuración, evaluador): https://github.com/MaverickRen/HW-BJTU-OPD
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Qwen3.5-9B en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3.5-9B
- Guía de Qwen 3.5 (familia completa): https://qwen-ai.com/qwen-3-5/
- Qwen3.5-9B en Ollama: https://ollama.com/library/qwen3.5:9b
- Qwen3.5-9B en Together AI: https://www.together.ai/models/qwen3-5-9b
