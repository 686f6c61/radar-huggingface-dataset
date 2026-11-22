# QuantFunc/Qwen-Image-2.1-4bit

## Resumen

Qwen-Image-2.1-4bit es una versión cuantizada a 4 bits del modelo de generación de imágenes Qwen-Image-2.1, desarrollado originalmente por el equipo Qwen. La cuantización la ha realizado QuantFunc, un proyecto independiente que aplica una técnica propia de cuantización INT4 basada en SVD (svdquant) para reducir el peso del modelo a aproximadamente una cuarta parte de su tamaño en 16 bits. El resultado son dos ficheros safetensors de entre 4,0 y 4,3 GB que, según el autor, mantienen composición, renderizado de texto, detalle y estilo cercanos al modelo original sin cuantizar.

El modelo resuelve un problema práctico de despliegue: el modelo base Qwen-Image-2.1 requiere una cantidad de VRAM elevada que lo aleja de las GPU de consumo, mientras que esta variante INT4 reduce el coste de ancho de banda de carga de pesos y de inferencia, lo que permite ejecutarlo en tarjetas NVIDIA desde la generación RTX 20 (arquitectura SM75 en adelante) hasta aceleradores de centro de datos como H100, H200, B100, B200 o GB300.

Es relevante ahora porque el ecosistema de generación de imágenes open source está migrando hacia flujos de trabajo en ComfyUI, y esta cuantización se integra en ellos sustituyendo únicamente el nodo de carga del modelo, sin tocar el resto del grafo. No obstante, conviene subrayar que no es un checkpoint compatible con el paquete `diffusers` de forma directa: requiere el plugin ComfyUI-QuantFunc o el motor de inferencia propio de QuantFunc.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para texto a imagen (arquitectura base de Qwen-Image-2.1, no detallada en la información disponible) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT4 (4 bits), con variantes r128 y r32; técnica svdquant |
| Idiomas soportados | No disponible |
| Licencia | Qwen Research License (qwen-research) |
| Formato de pesos | safetensors en formato propio de QuantFunc (no compatible directamente con `diffusers`) |

Detalle de las variantes publicadas:

| Variante | Fichero | Tamaño | Uso recomendado |
|---|---|---:|---|
| r128 | `qwen_image_21_base_quantfunc_int4_r128.safetensors` | ~4,3 GB | Prioriza calidad (recomendada) |
| r32 | `qwen_image_21_base_quantfunc_int4_r32.safetensors` | ~4,0 GB | Prioriza tamaño y VRAM |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen-Image-2.1 más allá de su naturaleza como modelo de difusión para generación de imágenes a partir de texto. Lo que sí se especifica es el proceso de cuantización: QuantFunc aplica una cuantización INT4 con una técnica denominada svdquant, que emplea descomposición en valores singulares para preservar la información más relevante de los pesos durante la reducción de precisión. El resultado se distribuye en dos configuraciones de rango (r128 y r32), donde un rango mayor implica presumiblemente mayor fidelidad respecto al modelo original a cambio de un fichero ligeramente más grande.

No se han publicado en la información disponible datos sobre el conjunto de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), ni innovaciones de arquitectura como atención lineal o decodificación especulativa. Tampoco se detalla el procedimiento exacto de calibración de la cuantización ni el conjunto de datos utilizado para calcular los rangos y valores singulares.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Renderizado de texto dentro de la imagen: el autor destaca que el renderizado de texto se mantiene cercano al modelo de 16 bits, lo que resulta útil para carteles, anuncios y diseños con tipografía.
- Composición de escenas complejas: la model card muestra ejemplos de diseño publicitario floral, retrato fotográfico, cartel de comida china y escenas cotidianas de estilo whimsical.
- Fidelidad de detalle y estilo: según las comparaciones visuales del autor, detalle y estilo se mantienen próximos a la línea base de 16 bits.
- Integración en flujos de trabajo ComfyUI mediante el nodo de carga QuantFunc, manteniendo el resto de nodos y parámetros de generación.
- Compatibilidad de hardware amplia: funciona en cualquier GPU NVIDIA SM75 o superior (RTX 20/30/40/50, A100, H100, H200, B100, B200, GB300).
- No se documentan capacidades de edición de imagen, inpainting, outpainting, control por pose o referencia, tool calling ni razonamiento multi-paso, por lo que no deben asumirse.

## Casos de uso

- Diseño publicitario y cartelería: el modelo puede generar composiciones con texto legible integrado, lo que permite producir borradores de anuncios, carteles de eventos o promociones sin salir del flujo de ComfyUI. La variante r128 es la adecuada cuando la fidelidad tipográfica es prioritaria.
- Prototipado rápido en GPU de consumo: con ficheros de ~4 GB y cuantización INT4, un estudio pequeño o un desarrollador individual puede iterar sobre conceptos visuales en una RTX 3060 o 4060 sin depender de servicios en la nube.
- Generación de imágenes para documentación técnica y blogs: escenas cotidianas, ilustraciones de concepto o imágenes de cabecera donde se requiere un estilo coherente y detalle razonable, aprovechando la reducción de coste de inferencia.
- Retrato y fotografía sintética: la model card incluye ejemplos de retrato; útil para generar avatares o material de marketing con control de composición, siempre con las cautelas legales sobre derechos de imagen.
- Integración en pipelines de ComfyUI existentes: cualquier estudio que ya tenga un grafo de Qwen-Image-2.1 puede sustituir solo el nodo de carga por el de QuantFunc y reutilizar el resto del flujo, lo que reduce el coste de migración a casi cero.
- Despliegue en infraestructura de centro de datos heterogénea: al cubrir desde SM75 hasta GB300 con un único build, un equipo puede servir el mismo modelo en estaciones de trabajo con RTX y en nodos con A100/H100 sin mantener artefactos distintos.
- Evaluación comparativa de cuantizaciones: investigadores que estudien el impacto de INT4 en modelos de difusión pueden usar las variantes r128 y r32 como puntos de comparación frente al modelo de 16 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta comparaciones visuales cualitativas frente a la línea base de 16 bits, sin métricas numéricas como FID, CLIP score, SSIM ni evaluaciones de fidelidad de texto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma numérica. El autor indica que las necesidades reales dependen de la resolución, el tamaño de lote y el resto del flujo de trabajo. Como referencia, los pesos ocupan entre 4,0 y 4,3 GB, a lo que hay que sumar activaciones y el resto de componentes del pipeline.
- GPU compatibles: cualquier NVIDIA con arquitectura SM75 o superior, es decir, RTX 20/30/40/50, A100, H100, H200, B100, B200 y GB300.
- GPU de consumo: sí, el modelo está diseñado explícitamente para facilitar su ejecución en GPU de consumo; la reducción de ancho de banda de pesos es el principal beneficio declarado.
- Opciones de despliegue: ComfyUI con el plugin ComfyUI-QuantFunc, o el motor de inferencia propio de QuantFunc. No es un checkpoint cargable directamente con el paquete `diffusers` pese a la etiqueta `library_name: diffusers` del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen-Image-2.1-4bit (QuantFunc) | No disponible | No disponible | INT4 (r128/r32) | Qwen Research License | safetensors propio (ComfyUI-QuantFunc) | Hugging Face, 561 descargas |
| Qwen-Image-2.1 (base) | No disponible | No disponible | 16 bits | Qwen Research License | pesos originales | Hugging Face (Qwen) |
| Otras cuantizaciones de Qwen-Image-2.1 | No disponible | No disponible | No disponible | Según autor | No disponible | No disponible |

No se dispone de información sobre modelos alternativos comparables de la misma categoría (otros modelos de difusión texto-imagen cuantizados a 4 bits) en los datos proporcionados, por lo que la comparativa se limita al modelo base y a sus variantes.

## Limitaciones y advertencias

- Licencia Qwen Research License: restringe el uso, especialmente el comercial. Es imprescindible leer el texto completo de la licencia del modelo base antes de cualquier despliegue en producción.
- Compatibilidad limitada: no es un checkpoint drop-in de `diffusers`. La etiqueta `library_name: diffusers` del repositorio responde únicamente al recuento de descargas de Hugging Face, no a compatibilidad real con el paquete.
- Dependencia de herramientas de terceros: requiere ComfyUI-QuantFunc o el motor de QuantFunc, lo que introduce un punto de mantenimiento adicional y riesgo de rotura en actualizaciones.
- Degradación por cuantización: aunque el autor afirma que la calidad se mantiene cercana al 16 bits, no se aportan métricas objetivas; es esperable cierta pérdida en texturas finas, texto pequeño y detalles de alta frecuencia.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir texto ilegible, anatomías incorrectas o elementos incoherentes con el prompt.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, culturales o de representación; el modelo base puede reflejar sesgos de su dataset de entrenamiento.
- Idiomas: no se especifica qué idiomas maneja bien en los prompts; los ejemplos de la model card incluyen texto en chino, pero no hay confirmación oficial del soporte multilingüe.
- VRAM real variable: el autor advierte que las necesidades dependen de resolución, batch y flujo; no debe asumirse que quepa en cualquier GPU solo por el tamaño de los pesos.
- Sin benchmarks: la ausencia de métricas publicadas impide una comparación rigurosa frente al modelo de 16 bits u otras cuantizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuantFunc/Qwen-Image-2.1-4bit
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Repositorio ComfyUI-QuantFunc: https://github.com/QuantFunc/ComfyUI-QuantFunc
- Sitio web de QuantFunc: https://www.quantfunc.com/
- Perfil de QuantFunc en Hugging Face: https://huggingface.co/QuantFunc
- Perfil de QuantFunc en ModelScope: https://www.modelscope.cn/profile/QuantFunc
- Perfil de QuantFunc en Civitai: https://civitai.com/user/quantfunc
- Discord de QuantFunc: https://discord.gg/jCp9TpFWcn
- Documentación de Hugging Face sobre estadísticas de descargas: https://huggingface.co/docs/hub/models-download-stats
