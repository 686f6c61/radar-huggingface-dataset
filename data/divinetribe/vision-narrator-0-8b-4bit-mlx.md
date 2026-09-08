# divinetribe/Vision-Narrator-0.8B-4bit-mlx

## Resumen

Vision Narrator 0.8B es un modelo de vision-lenguaje (VLM) desarrollado por divinetribe y publicado en HuggingFace con la licencia Apache-2.0. Está diseñado específicamente para ayudar a personas ciegas o con baja visión: dado un documento o una escena capturada con la cámara, genera una frase corta y funcional que describe qué es, quién lo envía, cuánto importa y qué ocurre si se ignora. No es un simple captioner; aprende a responder las preguntas útiles que necesita un usuario sin acceso visual. La arquitectura combina el modelo de lenguaje Qwen/Qwen3.5-0.8B con una torre de visión de 768 dimensiones y 12 capas que proyecta a 1024. El modelo completo tiene 852.985.920 parámetros y se distribuye como pesos MLX en formato safetensors. Su tamaño reducido (652 MB en disco) permite ejecutarlo completamente offline en Apple Silicon, incluyendo un iPhone 14 Pro Max, con una latencia de aproximadamente 0,17 segundos por inferencia. La cuantización 4-bit se aplica únicamente a la parte del lenguaje; la torre de visión se mantiene a precisión completa para evitar errores en la lectura de importes o fechas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-0.8B (decoder) + torre de visión; modelo image-text-to-text |
| Parametros totales | 852.985.920 (unos 853 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (solo modelo de lenguaje); torre de visión a precisión completa |
| Idiomas soportados | en (inglés únicamente) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-0.8B como decoder. Según la model card, el modelo de lenguaje tiene 1024 dimensiones ocultas, 24 capas, 8 cabezas de atención y un vocabulario de 248.320 tokens. La torre de visión utiliza 768 dimensiones ocultas, 12 capas y produce un embedding de 1024 que se proyecta al espacio del lenguaje. La cuantización 4-bit affine con group size 64 se aplica exclusivamente a las capas del modelo de lenguaje; el encoder de visión se mantiene en precisión completa, una decisión deliberada para preservar la fidelidad en tareas de extracción de datos numéricos.

El entrenamiento se realizó mediante LoRA con rank 16, scale 2.0 y dropout 0, aplicado a las 24 capas del modelo de lenguaje, con la torre de visión congelada. El dataset de fine-tuning está compuesto por documentos renderizados y capturados con cámara (facturas de servicios, avisos de impago, cartas de propiedades no reclamadas, extractos bancarios) y escenas interiores. Cada muestra se asoció con la frase que un oyente ciego necesita realmente. No se documenta el uso de RLHF ni DPO. La innovación principal es el enfoque de entrenamiento orientado a la utilidad pragmática y la inclusión de ejemplos diseñados para que el modelo reconozca cuándo una imagen es ilegible y pida ayuda en lugar de inventar contenido.

## Capacidades

- Generación de descripciones funcionales de imágenes: no solo identifica el contenido, sino que lo interpreta en términos de acción, riesgo o contexto (por ejemplo, "factura pendiente de 81,13 USD con fecha de vencimiento").
- Lectura de documentos domésticos estadounidenses: facturas, avisos de impago, estados de cuenta, cartas de propiedades no reclamadas.
- Descripción espacial de escenas interiores: indica posiciones relativas ("a tu izquierda", "justo delante de ti", "en la parte central").
- Detección de imágenes insuficientes: puede responder que la foto es demasiado oscura o que la página está cortada, y sugerir cómo mejorar la captura.
- Funcionamiento completamente offline en Apple Silicon mediante MLX y MLX Swift, sin conexión de red.
- Latencia de 0,17–0,18 segundos en iPhone 14 Pro Max según la evaluación del autor.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües: solo inglés.

## Casos de uso

- Asistencia para personas ciegas en tiempo real: una app móvil captura la cámara y el modelo describe la escena en aproximadamente 0,17 segundos, indicando dónde están los objetos y qué significan. Es adecuado porque su tamaño reducido permite ejecutarlo en un teléfono sin latencia perceptible.
- Lectura de facturas y avisos de pago: el usuario apunta a una carta y el modelo extrae importe, fecha de vencimiento, remitente y consecuencias de impago. Es útil porque está entrenado específicamente con este tipo de documentos y prioriza la exactitud sobre la descripción genérica.
- Verificación de documentos en atención al cliente: un agente puede escanear una carta de un cliente y obtener un resumen rápido con los datos clave, reduciendo el tiempo de lectura. La precisión en hechos (importes, fechas) es la métrica principal evaluada, lo que respalda este uso.
- Navegación básica para robots domésticos: la descripción espacial de la escena permite a un dispositivo orientarse dentro de una habitación y localizar obstáculos o elementos relevantes. La salida es una sola frase limpia, fácil de procesar.
- Accesibilidad en aplicaciones iOS: el modelo se integra con MLX Swift, permitiendo a los desarrolladores incorporar descripción de imágenes en apps nativas de Apple sin necesidad de servidores. El peso de 596 MB facilita el empaquetado dentro de la app.
- Auditoría doméstica para personas con baja visión: el usuario puede revisar correo, estados de cuenta y avisos del buzón sin depender de otra persona. El modelo está afinado para responder con lenguaje escuchable por un lector de pantalla, sin markdown ni circunloquios.
- Investigación en modelos VLM pequeños cuantizados: sirve como referencia para estudiar el efecto de cuantizar solo el decoder y mantener el encoder a precisión completa; los datos de evaluación muestran que la variante 4-bit del LM obtiene mejores resultados en hechos que la versión bf16 fusionada (98,5% frente a 91,5%).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). La información disponible incluye una evaluación interna del autor, realizada en agosto de 2026 sobre el conjunto de pruebas propio. Las métricas son: Facts (correctitud de importes, fechas, remitentes y consecuencias), Short (una sola frase sin preámbulos) y Clean (sin markdown ni elementos que un lector de pantalla no pueda leer). La columna "Latencia media" corresponde al tiempo de generación.

| Variante | Facts | Short | Clean | Latencia media |
|---|---|---|---|---|
| Fused bf16 | 366/400 — 91,5% | 400/400 | 400/400 | 0,18 s |
| 4-bit language model (este modelo) | 394/400 — 98,5% | 400/400 | 400/400 | 0,17 s |
| 4-bit LM + 8-bit vision | 385/400 — 96,2% | 400/400 | 400/400 | 0,18 s |
| Hard set (fotos oscuras, recortadas, inclinadas) | 99/120 — 82,5% | 120/120 | 120/120 | 0,18 s |

Estos datos provienen de la model card del autor y no se comparan con otros modelos.

## Requisitos de hardware

- El modelo ocupa 652 MB en disco, de los cuales 596 MB son pesos.
- Incluye cuantización 4-bit en el modelo de lenguaje y precisión completa en la torre de visión, de modo que el tamaño en memoria es reducido.
- VRAM estimada para inferencia: no disponible. Dado el uso de MLX, la memoria requerida es memoria unificada de Apple Silicon; se puede estimar que el modelo cabe en dispositivos con 8 GB de RAM o más, y el autor lo ha verificado en un iPhone 14 Pro Max.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) a través de MLX. No soporta NVIDIA CUDA de forma nativa.
- Sí cabe en equipos de consumo: cualquier Mac con Apple Silicon y en los iPhone con chip de la serie A16 o superior (según la verificación del autor, aunque no se especifica el mínimo exacto).
- Opciones de despliegue: MLX (Python con `mlx_vlm`), MLX Swift para iOS, o el motor vMLX para Mac, que añade caché de prefijos en SSD, caché KV paginada y batching continuo para reducir la latencia en conversaciones.
- Latencia y throughput: 0,17–0,18 segundos por inferencia en iPhone 14 Pro Max, según la evaluación del autor.

## Comparativa con modelos similares

No hay datos públicos de modelos comparables en la información disponible. La siguiente tabla compara las tres variantes del propio modelo presentadas en la model card, donde la variante 4-bit LM es la publicada.

| Variante | Pesos | Facts | Latencia media |
|---|---|---|---|
| Fused bf16 | 852M en bf16 | 91,5% | 0,18 s |
| 4-bit language model (modelo publicado) | 4-bit LM, visión fp | 98,5% | 0,17 s |
| 4-bit LM + 8-bit vision | 4-bit LM, visión 8-bit | 96,2% | 0,18 s |

No existen comparativas externas con otros modelos de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; la model card indica que está afinado para documentos domésticos de EE. UU. y escenas interiores.
- El autor advierte que documentos como menús de restaurantes o facturas extranjeras quedan fuera del dominio entrenado y no se garantiza un resultado correcto.
- Riesgo de alucinación: el modelo puede confundir el nombre del remitente en páginas con poca iluminación o peor calidad de imagen.
- No debe utilizarse como única fuente de verdad en asuntos financieros, médicos ni legales. Es una primera lectura rápida, no un sustituto de una revisión humana.
- Es un modelo de 0.8B, con las limitaciones de capacidad inherentes a su tamaño; la exactitud en hechos es del 98,5% en el conjunto fácil, pero baja al 82,5% en el conjunto difícil.
- No se documenta soporte para tool calling, function calling ni razonamiento multi-paso; para tareas que requieran estas capacidades no es adecuado.
- La cuantización 4-bit solo afecta al modelo de lenguaje; la torre de visión se mantiene a precisión completa para evitar errores en la lectura de cifras, pero esto aumenta ligeramente el peso total.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/divinetribe/Vision-Narrator-0.8B-4bit-mlx
- Repositorio de la app RealTimeAICam: https://github.com/nicedreamzapp/RealTimeAICam
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Proyecto MLX de Apple: https://github.com/ml-explore/mlx
- Motor de inferencia vMLX: https://vmlx.net/
- Perfil del autor en HuggingFace: https://huggingface.co/divinetribe
