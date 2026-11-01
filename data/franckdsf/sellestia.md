# franckdsf/sellestia

## Resumen

Sellestia es un modelo de segmentación de imagen especializado en la eliminación de fondos de fotografías de comida cenital (top-down food photography). Lo desarrolla el usuario franckdsf y se distribuye en HuggingFace bajo licencia MIT. Se trata de un fine-tune de Lucida (egeorcun/lucida), que a su vez deriva de BiRefNet_HR (ZhengPeng7/BiRefNet_HR), y resuelve un problema concreto: los modelos genéricos de matting tratan el plato como fondo y recortan solo la comida, dejando el plato fuera o como un fantasma semitransparente.

La innovación principal es que Sellestia conserva el plato y el alimento como un único sujeto, independientemente del color del plato. Fuera del dominio de comida, mantiene el comportamiento de su modelo base, con una concordancia de máscaras de 0,987 IoU respecto a Lucida en objetos, animales e ilustraciones no alimentarios.

Arquitectura BiRefNet con 220,7 millones de parámetros (220.700.242 según los safetensors), entrada de 1024×1024 y salida de máscara alfa RGBA. Es relevante para pipelines de fotografía gastronómica, catálogos de producto y edición automatizada de imágenes, donde la eliminación de fondo con preservación del plato es un requisito habitual que los modelos generalistas no cubren.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BiRefNet (segmentación de imagen, transformer con decodificación multi-escala) |
| Parámetros totales | 220.700.242 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 1024×1024) |
| Tipos de cuantización | no disponible (pesos en safetensors, uso en float32 según la model card) |
| Idiomas soportados | no disponible (modelo de segmentación de imagen, sin procesamiento de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | image-segmentation |
| Tamaño del repositorio | 0,9 GB |
| Modelo base | egeorcun/lucida (fine-tune de ZhengPeng7/BiRefNet_HR) |
| Dataset de entrenamiento | franckdsf/sellestia (CC-BY 4.0) |
| Librería | transformers (con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

Sellestia emplea la arquitectura BiRefNet, un transformer diseñado para segmentación de imagen de alta resolución con decodificación multi-escala. La entrada se procesa a 1024×1024 píxeles con normalización ImageNet estándar ([0,485, 0,456, 0,406] / [0,229, 0,224, 0,225]) y la salida es un mapa de probabilidad que se aplica como canal alfa sobre la imagen original.

El entrenamiento parte de los pesos de Lucida con el backbone congelado: solo se ajusta el decodificador, lo que preserva el conocimiento general del modelo base. Los datos combinan fotografías cenitales de platos con máscaras que incluyen el plato (dataset Sellestia, CC-BY 4.0) y un conjunto de repaso (rehearsal set) de imágenes variadas no alimentarias —objetos, vehículos, animales, cristal, personas y anime— etiquetadas por el propio Lucida. La función de pérdida es la suma de BCE e IoU. Se utilizaron particiones de validación y test independientes por fuente de datos.

## Capacidades

- Eliminación de fondo en fotografías de comida cenital, conservando el plato como parte del sujeto.
- Segmentación de imagen general: mantiene el rendimiento de Lucida en objetos, vehículos, animales, cristal, personas e ilustraciones (0,987 IoU de concordancia con Lucida en dominios no alimentarios).
- Generación de máscaras alfa RGBA directamente utilizables en composición de imágenes.
- Funciona como reemplazo directo (drop-in) de Lucida o BiRefNet en cualquier código que cargue el modelo mediante `transformers`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de segmentación de imagen.

## Casos de uso

- Fotografía gastronómica profesional: sustituir fondos de mesa por fondos neutros o de estudio conservando el plato completo, algo que los modelos generalistas no hacen y que evita el retoque manual en lotes de cientos de imágenes.
- Catálogos de producto para restaurantes y marcas de alimentación: generar imágenes de plato sobre fondo transparente o de color corporativo para fichas de menú, e-commerce y publicidad, con la garantía de que el plato no se recorta.
- Edición automatizada en pipelines de preimpresión: integrar el modelo en flujos de composición (por ejemplo, con PIL o torchvision) para producir PNG con canal alfa listos para maquetación.
- Aplicaciones de delivery y agregadores de reseñas: normalizar fotografías de usuarios y restaurantes a un formato visual coherente con fondo unificado.
- Generación de datasets de imagen: usar las máscaras alfa para construir datasets de comida segmentada destinados a entrenar otros modelos (clasificación de platos, estimación de porciones).
- Herramientas de diseño gráfico y plugins de edición: ofrecer una función de "quitar fondo" específica para fotografía de platos dentro de editores, donde los modelos genéricos fallan.
- Procesamiento por lotes en servidores: al ser un modelo de 220 M de parámetros y 0,9 GB, puede ejecutarse en GPU de consumo para procesar lotes de imágenes con latencia baja.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split `test` del dataset Sellestia (fotografías cenitales de platos, con el plato conservado como respuesta correcta):

| Modelo | IoU ↑ | MAE ↓ | Imágenes con IoU ≥ 0,95 |
|---|---|---|---|
| BiRefNet | 0,555 | 0,248 | 2 % |
| Lucida | 0,786 | 0,129 | 31 % |
| Sellestia | 0,992 | 0,0055 | 100 % |

El error de Sellestia es 23 veces menor que el de Lucida en fotografía de comida, y todas las imágenes de test superan 0,95 IoU (peor caso: 0,965). En dominios no alimentarios (objetos, animales, ilustraciones), la concordancia de máscaras con Lucida es de 0,987 IoU.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 220,7 M de parámetros; en float32 ocupa aproximadamente 0,9 GB de pesos, más activaciones para entrada 1024×1024. Una GPU con 4-6 GB de VRAM es suficiente para inferencia en float32.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; funcionan RTX 3060, RTX 4060, RTX 4090, A100 y H100. Para lotes grandes, se recomienda RTX 4090 o superiores.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas (RTX 3060 en adelante).
- Opciones de despliegue: `transformers` con `AutoModelForImageSegmentation` y `trust_remote_code=True`; también es compatible con pipelines de imagen de HuggingFace. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Rendimiento (IoU en Sellestia test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sellestia | 220,7 M | 1024×1024 | 0,992 | MIT | HuggingFace |
| Lucida | no disponible | 1024×1024 | 0,786 | MIT | HuggingFace |
| BiRefNet | no disponible | 1024×1024 | 0,555 | MIT | HuggingFace |

Sellestia es un fine-tune especializado: frente a Lucida y BiRefNet, mejora sustancialmente en comida cenital (0,992 frente a 0,786 y 0,555 IoU) y mantiene un comportamiento casi idéntico a Lucida fuera de ese dominio (0,987 IoU de concordancia). La contrapartida es que está optimizado para un nicho concreto y no aporta mejoras en segmentación general.

## Limitaciones y advertencias

- Especialización estrecha: el rendimiento superior se limita a fotografía de comida cenital con plato; en otros dominios se comporta como Lucida, sin mejoras.
- Sesgos de dominio: el dataset de entrenamiento (Sellestia) y el conjunto de repaso determinan los tipos de platos, colores, iluminaciones y composiciones cubiertos; platos muy inusuales, ángulos no cenitales o iluminaciones extremas pueden degradar la máscara.
- Riesgo de alucinación de máscara: como todo modelo de segmentación, puede incluir sombras, cubiertos o elementos de la mesa en la máscara, o excluir partes del plato en casos límite.
- Restricciones de licencia: los pesos y el código son MIT, pero el conjunto de repaso incluye imágenes de DIS5K, AIM-500, P3M-10K y anime-segmentation, algunas distribuidas solo para investigación; conviene evaluar la idoneidad para uso comercial, tal como advierte el autor.
- Dependencia de `trust_remote_code=True`: requiere ejecutar código remoto del repositorio, lo que implica revisar el código antes de desplegarlo en producción.
- Sin soporte de texto ni multilingüe: no es aplicable a tareas de lenguaje, tool calling ni agentes.
- Sin datos publicados de latencia ni throughput: es necesario medirlos en el hardware objetivo antes de dimensionar un servicio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/franckdsf/sellestia
- Dataset Sellestia: https://huggingface.co/datasets/franckdsf/sellestia
- Modelo base Lucida: https://huggingface.co/egeorcun/lucida
- Modelo original BiRefNet: https://huggingface.co/ZhengPeng7/BiRefNet
- BiRefNet_HR (base de Lucida): https://huggingface.co/ZhengPeng7/BiRefNet_HR
- Dataset anime-segmentation: https://huggingface.co/datasets/skytnt/anime-segmentation
- Imagen comparativa: https://huggingface.co/franckdsf/sellestia/resolve/main/comparison.jpg
