# Kaelyn01/VisAlloc-4B

## Resumen

VisAlloc-4B es un modelo de lenguaje multimodal (image-text-to-text) desarrollado por el usuario Kaelyn01, construido sobre la familia Qwen/Qwen3.5-4B mediante el framework de auto-destilación visual VisAlloc, presentado en el artículo *VisAlloc: Allocating Visual Supervision for On-Policy Self-Distillation*. El modelo resuelve el problema de la comprensión visual de grano fino: en lugar de depender de herramientas de recorte o zoom en tiempo de inferencia, aprende a extraer evidencia visual relevante directamente de la imagen completa.

La innovación principal reside en el procedimiento de entrenamiento, no en la arquitectura: durante el entrenamiento se generan pares de vistas (un recorte centrado en la evidencia y un recorte espacialmente desplazado) que actúan como profesores con supervisión privilegiada, y la destilación se asigna selectivamente a nivel de token según la sensibilidad de cada vista y la discrepancia entre distribuciones. En inferencia, el modelo acepta únicamente la imagen completa, lo que simplifica el despliegue.

El modelo cuenta con 5.174.964.736 parámetros en pesos safetensors BF16, soporta inglés y chino, se distribuye bajo licencia Apache 2.0 y está etiquetado con el pipeline `image-text-to-text`. Es relevante ahora porque propone una alternativa de entrenamiento que mejora la comprensión visual fina sin coste adicional en inferencia, un área de interés creciente para pipelines multimodales en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen/Qwen3.5-4B |
| Parametros totales | 5.174.964.736 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-4B, un transformer multimodal que procesa imagen y texto. El modelo se entrena con el framework VisAlloc, que opera en cinco etapas: (1) construcción y filtrado de vistas pareadas, emparejando un recorte positivo centrado en la evidencia con un recorte negativo espacialmente desplazado y conservando solo ejemplos en los que un profesor fijo acierta con la vista positiva y falla con la negativa; (2) trayectoria compartida del estudiante, donde el estudiante genera una respuesta a partir de la imagen completa y ambos profesores puntúan cada posición bajo el mismo prefijo textual; (3) asignación a nivel de token, combinando una base continua de sensibilidad con peso adicional admitido por sensibilidad o por divergencia JSD entre profesores, bajo puertas de contexto congelado, bigramas de plantilla y JSD estudiante-profesor, con redistribución por frecuencia inversa y normalización por media; (4) destilación desde el profesor positivo minimizando JSD ponderada a nivel de token sobre el top-100 de vocabulario seleccionado por el estudiante más un bucket residual; y (5) regularización EMA con tasa 0,05, actualizando el profesor una vez tras la actualización del actor.

Los datos de entrenamiento provienen de VisAlloc-6K, derivado de Vision-OPD-6K, con 5.795 ejemplos retenidos de 6.241 pares fuente. El objetivo mezcla coeficiente 0,5, la fuerza de peso adicional es 4,0 y el rollout alcanza hasta 1.024 tokens durante 1 época. Los profesores comparten parámetros EMA desconectados del estudiante. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de su origen.

## Capacidades

- Generación de texto y respuesta a preguntas visuales (VQA) a partir de imagen completa, sin herramientas de recorte o zoom en inferencia.
- Comprensión visual de grano fino orientada a la localización de evidencia concreta en la imagen.
- Procesamiento multimodal image-text-to-text mediante la interfaz estándar de `transformers` (`AutoModelForImageTextToText`).
- Soporte de conversación multi-turno mediante plantilla de chat y `apply_chat_template`.
- Capacidades multilingües limitadas a inglés y chino.
- Compatibilidad con endpoints y despliegue mediante vLLM con API compatible con OpenAI.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, modo thinking, audio ni visión más allá del pipeline declarado.

## Casos de uso

- Inspección visual de productos en catálogos: el modelo puede responder preguntas sobre etiquetas, colores o textos presentes en imágenes completas de producto, aprovechando su entrenamiento en evidencia centrada sin necesidad de recortes manuales.
- Verificación documental con imágenes: para tareas de extracción de datos de documentos escaneados o fotografías, el modelo procesa la imagen completa y responde consultas concretas sobre campos o marcas visibles.
- Asistencia en accesibilidad: descripción y respuesta a preguntas sobre imágenes para usuarios con discapacidad visual, con soporte de conversación multi-turno en inglés o chino.
- Moderación y análisis de contenido visual: clasificación y descripción de imágenes en pipelines de revisión, usando la interfaz estándar de `transformers` o el servidor vLLM compatible con OpenAI.
- Automatización de soporte con adjuntos de imagen: gestión de conversaciones donde el usuario adjunta una captura o fotografía y formula preguntas de seguimiento, gracias al soporte de chat multi-turno.
- Investigación en destilación multimodal: el modelo sirve como referencia reproducible del framework VisAlloc, con pesos completos, configuración, tokenizador, procesador y plantilla de chat publicados.
- Despliegue en entornos con recursos moderados: al tratarse de un modelo de aproximadamente 5.170 millones de parámetros en BF16, puede servirse con vLLM o `transformers` en infraestructura de una sola GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 10,4 GB solo para pesos, más memoria para el procesador visual, caché KV y activaciones; se recomienda al menos 16-24 GB de VRAM para uso cómodo.
- GPU recomendadas: A100, H100, L40S o RTX 4090 para BF16; GPUs consumer de 24 GB (RTX 3090, RTX 4090) son suficientes para inferencia en BF16 con margen limitado.
- Cuantización: no se documentan pesos GGUF ni cuantizaciones oficiales; sería necesario generarlas a partir de los safetensors BF16.
- Opciones de despliegue: `transformers` (>=5.16.1) con `accelerate`, y vLLM mediante `vllm serve Kaelyn01/VisAlloc-4B --port 8000` con API compatible con OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| VisAlloc-4B | 5.174.964.736 | no disponible | apache-2.0 | en, zh | Destilación visual VisAlloc sobre Qwen3.5-4B |
| VisAlloc-9B | no disponible | no disponible | no disponible | no disponible | Variante mayor del mismo framework, referenciada en la model card |
| Qwen/Qwen3.5-4B | no disponible | no disponible | no disponible | no disponible | Modelo base sobre el que se entrena VisAlloc-4B |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se declara soporte de castellano ni de otros idiomas.
- No se documentan resultados de benchmarks, por lo que el rendimiento real frente a alternativas no está cuantificado.
- Riesgo de alucinación inherente a los modelos generativos multimodales; no se han publicado evaluaciones específicas de fidelidad visual.
- El modelo se publica con 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación comunitaria.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La longitud de contexto no está especificada, lo que dificulta planificar conversaciones largas o imágenes de alta resolución.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen/Qwen3.5-4B antes de uso comercial.
- El proceso de entrenamiento depende de profesores EMA y vistas pareadas; la reproducibilidad completa requiere el dataset VisAlloc-6K y los detalles del framework.
- No se ofrecen pesos cuantizados oficiales, lo que limita el despliegue en hardware de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaelyn01/VisAlloc-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaelyn01/VisAlloc-6K
- Variante VisAlloc-9B: https://huggingface.co/Kaelyn01/VisAlloc-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset fuente Vision-OPD-6K: https://huggingface.co/datasets/yuanqianhao/Vision-OPD-6K
- Artículo referenciado: arxiv:2605.18740 (no se proporciona URL directa en la información disponible)
