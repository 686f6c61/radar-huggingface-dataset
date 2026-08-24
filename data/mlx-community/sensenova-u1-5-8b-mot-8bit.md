# mlx-community/SenseNova-U1.5-8B-MoT-8bit

## Resumen

SenseNova-U1.5-8B-MoT es un modelo multimodal nativo unificado desarrollado por SenseTime, que integra comprensión, razonamiento y generación de imágenes en una única arquitectura monolítica. A diferencia de los sistemas que acoplan un codificador visual con un LLM y un decodificador de imágenes, este modelo opera directamente en el espacio de píxeles mediante un flujo rectificado, sin depender de un VAE para el mapeo latente. La versión que aquí se documenta es un artefacto MLX (Apple Silicon) cuantizado a 8 bits, preparado por la comunidad mlx-community, que permite ejecutar el modelo completo en hardware de Apple con un consumo de memoria reducido.

El modelo base, SenseNova-U1.5-8B-MoT, destaca por su enfoque "any-to-any": acepta entradas de texto e imagen y produce tanto texto como imágenes, cubriendo tareas de texto-a-imagen (T2I), edición por instrucción y VQA (visual question answering) en una sola pasada. La arquitectura NEO-unify emplea una mezcla de transformadores (Mixture-of-Transformers) con dos flujos: uno para la comprensión y otro para la generación, lo que permite un entrenamiento y una inferencia unificados. El checkpoint original tiene aproximadamente 5.88 mil millones de parámetros, según los pesos reales en safetensors, y el artefacto MLX cuantizado a 8 bits reduce el pico de memoria a unos 22.9 GB en un Apple M5 Max, manteniendo una fidelidad alta respecto al modelo en bf16 (coseno de similitud de 0.998 en 1024×1024).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NEO-unify Mixture-of-Transformers (pixel-space rectified flow, sin VAE) |
| Parametros totales | 5.884.223.680 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit con group size 64 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura NEO-unify, una mezcla de transformadores (Mixture-of-Transformers) que unifica la comprensión y la generación multimodal. A diferencia de los modelos que utilizan un VAE para comprimir las imágenes en un espacio latente, SenseNova-U1.5 opera directamente en el espacio de píxeles mediante un flujo de rectificado, lo que elimina la necesidad de codificadores y decodificadores latentes separados. La arquitectura incorpora dos flujos de transformadores: uno dedicado al procesamiento del lenguaje y otro a la generación de imágenes, que se sincronizan mediante mecanismos de atención cruzada.

En la versión 1.5, SenseTime reforzó las capas de patchify (codificación de parches de imagen), amplió y filtró el corpus de entrenamiento de texto-a-imagen, y sintetizó datos de edición para escenarios de referencia con una o múltiples imágenes. Además, se mejoró la formulación de tareas y el pipeline de post-entrenamiento, que incluye técnicas de alineación y ajuste fino. El artefacto MLX aquí documentado es una conversión del checkpoint bf16 original: ambos flujos de transformadores se cuantizaron a 8 bits con group size 64, mientras que las embeddings, la cabeza de salida, las normas, el patchify de visión y los embedders de flujo se mantienen en alta precisión (menos del 3% de los bytes). Esto permite una carga sin conversión en tiempo de ejecución, con un pico de memoria cercano al residente.

## Capacidades

- Generación de imágenes a partir de texto (T2I) con resolución de hasta 1024×1024 y soporte de múltiples pasos de inferencia.
- Edición de imágenes por instrucción en lenguaje natural, incluyendo escenarios con referencia de imagen única o múltiple.
- VQA (visual question answering): responde preguntas sobre el contenido de una imagen.
- Modo de razonamiento (thinking mode) que permite generar respuestas con un proceso de razonamiento explícito antes de la salida final.
- Multimodalidad nativa: entrada y salida de imagen y texto en una misma arquitectura, sin adaptadores externos.
- Compatibilidad con el runtime MLX-Swift, que permite ejecutar el modelo en Apple Silicon con latencia reducida y sin conversión de pesos.

## Casos de uso

- Generación de contenido visual para marketing y diseño: el modelo puede crear imágenes a partir de briefs textuales, por ejemplo, "un paisaje de montaña con lago al amanecer, fotografía realista", con control de resolución y pasos de inferencia. Es adecuado porque combina T2I y edición en un solo modelo, evitando la integración de sistemas separados.
- Edición de fotografías de producto: un usuario puede cargar una imagen y pedir "cambia el fondo por un estudio blanco" o "elimina el reflejo del vaso". La edición por instrucciones se ejecuta directamente sobre la imagen, sin necesidad de segmentación manual ni máscaras.
- Asistente de accesibilidad para personas con discapacidad visual: el modelo puede responder preguntas sobre el contenido de una imagen (VQA) como "¿qué hay en esta escena?" o "¿qué color tiene el coche?", facilitando la interpretación de entornos y documentos visuales.
- Automatización de pruebas de diseño en entornos creativos: los diseñadores pueden generar variantes de un diseño base mediante instrucciones textuales, comparando composiciones alternativas sin intervención manual, gracias a la capacidad de edición y generación del modelo.
- Creación de contenido para documentación técnica: se pueden generar diagramas o ilustraciones a partir de descripciones textuales, y luego editarlas iterativamente con instrucciones como "añade una flecha indicando el flujo de datos" sin cambiar de herramienta.
- Análisis de imágenes en sistemas de atención al cliente: el modelo puede recibir capturas de pantalla o fotos de productos y responder preguntas sobre su estado, características o defectos, en un flujo de trabajo de soporte automatizado con entrada multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento documentada es del artefacto MLX: en un Apple M5 Max, el pico de memoria es de 22.9 GB, y una generación de imagen de 1024×1024 con 8 pasos y CFG de 4 tarda aproximadamente 7.4 segundos. La fidelidad respecto al checkpoint bf16 se reporta con un coseno de similitud de 0.998 y un PSNR de 33 dB en una imagen fija de prueba, lo que indica una degradación mínima tras la cuantización.

## Requisitos de hardware

- El artefacto MLX está diseñado exclusivamente para Apple Silicon (M1/M2/M3/M4/M5).
- VRAM estimada: pico de 22.9 GB en un M5 Max para una generación de 1024×1024 con 8 pasos; el modelo cuantizado a 8 bits requiere menos de 23 GB en el caso de uso probado.
- GPU recomendada: Apple M5 Max (o superior) para el rendimiento documentado; en otros chips Apple Silicon la latencia será proporcionalmente mayor según la memoria unificada disponible.
- No cabe en GPUs consumer de NVIDIA o AMD, ya que el formato MLX no es compatible con CUDA o ROCm.
- Opciones de despliegue: el runtime oficial es `sensenova-u1-swift` (MLX-Swift), que se compila con Swift y se ejecuta desde la línea de comandos; también es posible integrar el modelo en aplicaciones iOS/macOS mediante la librería MLX.
- Latencia: 7.4 s para 1024×1024 con 8 pasos en M5 Max; para 50 pasos la latencia será proporcionalmente mayor, aunque no se documenta un valor exacto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos multimodales en la información proporcionada. El modelo se posiciona como un enfoque unificado (any-to-any) frente a alternativas que combinan modelos separados de texto e imagen, como LLaVA (VQA + LLM) o Stable Diffusion (T2I), pero no hay métricas directas de comparación disponibles. La arquitectura NEO-unify es distintiva por su operación en espacio de píxeles sin VAE, lo que la diferencia de la mayoría de los modelos de generación de imágenes actuales que usan VAE latentes. Se recomienda consultar el paper (arXiv:2605.12500) para una evaluación completa.

## Limitaciones y advertencias

- El modelo está cuantizado a 8 bits, lo que puede introducir pequeñas desviaciones respecto al checkpoint bf16; aunque se reporta un coseno de similitud de 0.998, la calidad puede variar en tareas de edición fina o con prompts complejos.
- No se dispone de información sobre sesgos específicos, pero al ser un modelo de generación de imágenes, puede reflejar sesgos del corpus de entrenamiento en cuanto a representación de personas, escenas y culturas.
- Riesgo de alucinación en respuestas VQA: como todo modelo multimodal, puede generar respuestas incorrectas o inventadas cuando la imagen no contiene la información solicitada.
- La longitud de contexto no está documentada, lo que limita la planificación de tareas que requieran interacciones largas o múltiples imágenes.
- Los idiomas soportados no están especificados; aunque el modelo es de SenseTime (China), no se confirma el soporte de español u otros idiomas más allá del inglés y chino.
- El formato MLX es propietario de Apple Silicon; no se puede ejecutar en GPUs NVIDIA o AMD, lo que restringe su uso a hardware de Apple.
- La licencia Apache-2.0 permite uso comercial, pero el runtime `sensenova-u1-swift` es de terceros y puede tener sus propias condiciones.

## Enlaces

- HuggingFace del artefacto MLX: https://huggingface.co/mlx-community/SenseNova-U1.5-8B-MoT-8bit
- Modelo original en HuggingFace: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT
- Modelo en ModelScope: https://www.modelscope.cn/models/SenseNova/SenseNova-U1.5-8B-MoT
- Paper del modelo: https://arxiv.org/abs/2605.12500
- Repositorio de referencia (OpenSenseNova): https://github.com/OpenSenseNova/SenseNova-U1
- Runtime MLX-Swift: https://github.com/xocialize/sensenova-u1-swift
- Documentación de la versión 1.5: https://github.com/OpenSenseNova/SenseNova-U1/blob/main/docs/u1.5_preview.md
