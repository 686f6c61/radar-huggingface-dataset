# DIYIN/Youtu-VL-4B-Instruct

## Resumen

Youtu-VL-4B-Instruct es un modelo de lenguaje y visión (VLM) desarrollado por Tencent, construido sobre el modelo de lenguaje Youtu-LLM. Aunque la model card lo describe como un modelo de 4B parámetros, los pesos reales en safetensors suman 5.340.551.024 parámetros (5,34B), diferencia que probablemente incluye el codificador visual. Su principal innovación es el paradigma VLUAS (Vision-Language Unified Autoregressive Supervision), que otorga a los tokens visuales el mismo estatus autorregresivo que a los tokens de texto, permitiendo abordar tareas centradas en visión sin módulos específicos de tarea.

El modelo destaca por su versatilidad: cubre tareas clásicas de visión por computador (detección de objetos, segmentación semántica, estimación de profundidad, grounding visual, estimación de pose humana) y tareas multimodales generales (VQA, razonamiento multimodal, OCR, comprensión multi-imagen, agentes GUI). Su tamaño compacto lo hace atractivo para despliegue eficiente en entornos con recursos limitados.

El repositorio DIYIN/Youtu-VL-4B-Instruct es un espejo del modelo original alojado en tencent/Youtu-VL-4B-Instruct. La licencia es personalizada (youtu-vl) y restringe explícitamente el acceso desde la Unión Europea, un factor crítico a considerar antes de cualquier adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM basado en Youtu-LLM con VLUAS (vision-language unified autoregressive supervision) |
| Parametros totales | 5.340.551.024 (5,34B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (version oficial de Tencent), safetensors en precision nativa |
| Idiomas soportados | no disponible |
| Licencia | youtu-vl (licencia personalizada de Tencent, acceso restringido en la UE) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Youtu-VL-4B-Instruct se construye sobre Youtu-LLM y adopta el paradigma VLUAS. A diferencia de los VLM convencionales, donde las señales visuales se tratan como condiciones pasivas y los detalles finos suelen perderse, VLUAS expande el léxico de texto hacia un vocabulario multimodal unificado mediante un codebook visual aprendido. Las señales visuales se convierten así en objetivos de supervisión autorregresiva: el modelo reconstruye conjuntamente tokens visuales y texto, preservando información visual densa y reforzando la comprensión semántica multimodal.

El modelo trata tokens de imagen y texto con estatus autorregresivo equivalente, lo que le permite realizar predicciones centradas en visión (segmentación, profundidad, detección, grounding) dentro de una arquitectura VLM estándar, sin necesidad de cabezales o módulos específicos por tarea. Los detalles del dataset de entrenamiento, el número de tokens y el proceso de alineación (RLHF, DPO, etc.) no se especifican en la información disponible; se referencia un informe técnico en arxiv (2601.19798) y un segundo artículo (2512.24618) sin más detalle.

## Capacidades

- Comprensión de imágenes y texto: responde preguntas sobre imágenes (VQA), describe contenido visual y sigue instrucciones multimodales.
- Grounding visual: localiza objetos y regiones en imágenes a partir de referencias textuales.
- Clasificación de imágenes: asigna categorías semánticas a imágenes completas.
- Detección de objetos: identifica y localiza múltiples objetos en una escena.
- Segmentación referida (referring segmentation): segmenta el objeto mencionado en una instrucción textual.
- Segmentación semántica: clasifica cada píxel de la imagen en categorías semánticas.
- Estimación de profundidad: predice mapas de profundidad a partir de una imagen.
- Conteo de objetos: cuenta instancias de objetos en una imagen.
- Estimación de pose humana: detecta puntos clave del cuerpo humano.
- OCR: reconocimiento de texto en imágenes.
- Razonamiento multimodal y matemáticas: resuelve problemas que requieren integrar información visual y textual.
- Comprensión multi-imagen: procesa y razona sobre múltiples imágenes simultáneamente.
- Evaluación de alucinación: capacidad para tareas de evaluación de alucinaciones visuales.
- Agente GUI: puede actuar como agente para tareas de interfaz gráfica de usuario.

## Casos de uso

- Atención al cliente con soporte visual: el modelo puede analizar capturas de pantalla o fotografías enviadas por usuarios y responder con instrucciones precisas, combinando comprensión de imagen y texto en un solo paso.
- Extracción de datos de documentos: gracias a su capacidad OCR, puede extraer texto de facturas, recibos o documentos escaneados y estructurarlo en formato legible para pipelines posteriores.
- Moderación de contenido visual: puede clasificar imágenes y detectar objetos o escenas problemáticas, integrándose en sistemas automáticos de moderación.
- Asistentes de accesibilidad: generación de descripciones detalladas de imágenes para personas con discapacidad visual, produciendo texto alternativo de calidad.
- Automatización de pruebas de interfaz (GUI testing): como agente GUI, puede interactuar con interfaces de usuario, identificar elementos y verificar comportamientos esperados.
- Análisis de escenas para retail o seguridad: detección de objetos, conteo de personas y estimación de pose para aplicaciones de análisis de afluencia o vigilancia.
- Robótica y navegación: estimación de profundidad y segmentación semántica para que robots comprendan su entorno y planifiquen rutas.
- Anotación automática de datasets: generación de etiquetas de segmentación, detección y clasificación para acelerar la creación de datasets de entrenamiento.

## Benchmarks y rendimiento

La model card incluye figuras con resultados de benchmarks para tareas centradas en visión y tareas multimodales generales, pero los valores numéricos no están disponibles en el texto proporcionado. No se pueden presentar cifras concretas sin riesgo de inventar datos. Se recomienda consultar el informe técnico en arxiv (2601.19798) para obtener los resultados detallados.

## Requisitos de hardware

- VRAM estimada: con 5,34B parámetros, la inferencia en FP16 requiere aproximadamente 11-12 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. Con cuantización GGUF de 4 bits, puede reducirse a unos 3-4 GB.
- GPU recomendadas: RTX 4090 (24 GB) o superior para FP16 sin problemas; GPUs de consumo con 8 GB o más (RTX 3060, RTX 4060, RTX 4070) pueden ejecutar versiones cuantizadas.
- En consumer GPU: sí, cabe en GPUs de consumo con 8 GB o más si se usa cuantización.
- Opciones de despliegue: transformers (con flash_attention_2 y trust_remote_code), llama.cpp para la versión GGUF, y potencialmente vLLM u Ollama.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

Modelos comparables en la categoría de VLM compactos (2-6B parámetros) incluyen Qwen2-VL-2B, InternVL2-2B y MiniCPM-V 2.6. No se dispone de datos de benchmark comparativos en la información proporcionada para establecer una comparación cuantitativa rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Youtu-VL-4B-Instruct | 5,34B | no disponible | youtu-vl (restringida en UE) | HuggingFace, ModelScope |
| Qwen2-VL-2B | 2B | no disponible | Apache 2.0 | HuggingFace |
| InternVL2-2B | 2B | no disponible | MIT | HuggingFace |

Nota: los datos de Qwen2-VL-2B e InternVL2-2B provienen de conocimiento general y pueden no estar actualizados. La comparación cuantitativa de rendimiento no es posible con la información disponible.

## Limitaciones y advertencias

- Licencia restringida: la licencia youtu-vl es personalizada y prohíbe el acceso desde la Unión Europea (extra_gated_eu_disallowed: true). Esto limita seriamente su uso en entornos europeos, tanto para investigación como para producción.
- Sesgos y alucinaciones: como todo VLM, puede generar descripciones inexactas o alucinar contenido visual. La model card menciona evaluación de alucinación como capacidad, pero no detalla resultados concretos.
- Idiomas: no se especifican los idiomas soportados; el rendimiento puede ser desigual en idiomas distintos de los principales de entrenamiento.
- Longitud de contexto: no documentada en la información disponible, lo que dificulta planificar despliegues con ventanas largas.
- Código personalizado: requiere trust_remote_code=True en transformers, lo que implica ejecutar código del autor no auditado. Riesgo de seguridad a considerar en entornos corporativos.
- Dependencias adicionales: requiere pydensecrf y opencv-python-headless para ciertas tareas de visión, lo que complica el despliegue en entornos minimalistas o contenedores ligeros.
- Repositorio espejo: el repositorio DIYIN/Youtu-VL-4B-Instruct es un espejo no oficial; se recomienda usar el repositorio original de Tencent para entornos de producción.
- Discrepancia de parámetros: la model card indica 4B parámetros pero los pesos reales suman 5,34B; verificar requisitos de memoria antes de planificar el despliegue.

## Enlaces

- Repositorio HuggingFace (espejo): https://huggingface.co/DIYIN/Youtu-VL-4B-Instruct
- Repositorio HuggingFace original: https://huggingface.co/tencent/Youtu-VL-4B-Instruct
- Versión GGUF: https://huggingface.co/tencent/Youtu-VL-4B-Instruct-GGUF
- Página del proyecto: https://youtu-tip.com/#llm
- Código: https://github.com/TencentCloudADP/youtu-vl
- Informe técnico (arxiv): https://arxiv.org/abs/2601.19798
- Licencia: https://huggingface.co/tencent/Youtu-VL-4B-Instruct/blob/main/LICENSE.txt
- ModelScope: https://www.modelscope.cn/models/Tencent-YouTu-Research/Youtu-VL-4B-Instruct/summary
