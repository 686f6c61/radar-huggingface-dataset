# netprojects/WeMM-Ecom-0.8B-MLX-8bit

## Resumen

WeMM-Ecom-0.8B-MLX-8bit es una conversión a formato MLX del modelo multimodal WeMM-Ecom-0.8B desarrollado por Tencent (WeChat Vision), un vision-language model especializado en comercio electrónico y afinado a partir de Qwen3.5. Esta variante concreta la publica NetProjects (Internet Projects Ltd), que ha convertido los pesos originales en bf16 a MLX con cuantización afín de 8 bits (group size 64), manteniendo el codificador visual incluido. El resultado es un paquete de 1,0 GB pensado para ejecutarse en Apple Silicon mediante la librería mlx-vlm.

El modelo resuelve tareas de comprensión y generación sobre imágenes de producto, múltiples imágenes simultáneas y vídeo, combinadas con instrucciones en texto, tanto en chino como en inglés. Incorpora un modo de razonamiento híbrido ("thinking") activado por defecto y desactivable por petición mediante el parámetro `enable_thinking`, lo que permite alternar entre respuestas directas (modo instruct) y respuestas con cadena de razonamiento previa.

Su relevancia actual radica en dos factores: por un lado, ofrece capacidades de VLM especializado en e-commerce en un tamaño muy reducido (852.985.920 parámetros totales), apto para portátiles Mac; por otro, la conversión MLX con cuantización de 8 bits conserva el 99,4 % del siguiente token respecto a los pesos bf16 originales, con una KL media de 0,0018, lo que la hace viable para prototipado y despliegue local sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (fine-tune de Qwen3.5), con codificador visual incluido |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit afín (group size 64); existe build bf16 alternativa |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), librería mlx-vlm |

## Arquitectura y entrenamiento

WeMM-Ecom-0.8B es un modelo vision-language construido mediante fine-tuning de Qwen3.5, según indica la model card. Incluye un codificador visual que procesa imágenes individuales, varias imágenes en una misma petición y vídeo, combinándolas con el texto de la instrucción. El pipeline declarado es `image-text-to-text` y la familia se etiqueta como `qwen3_5` con soporte de `mlx-vlm`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO.

La innovación técnica destacable en esta ficha es la conversión a MLX realizada por NetProjects sobre la revisión `b402979` del modelo original de Tencent. Los pesos se cuantizan a 8 bits en modalidad afín con group size 64, y se verifica la fidelidad frente a los pesos bf16 originales: 10 prompts cortos en inglés y chino (4 con thinking activado, 6 desactivado), 355 posiciones forzadas por teacher forcing, con un 99,4 % de coincidencia en el siguiente token y una KL media de 0,0018. El tokenizador, la plantilla de chat y los ficheros del procesador son los originales de Tencent, sin modificar.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes de producto.
- Comprensión de imágenes individuales y de varias imágenes en una misma consulta (por ejemplo, comparar dos listados).
- Procesamiento de vídeo junto con texto.
- Modo de razonamiento híbrido: thinking activado por defecto, desactivable con `enable_thinking=False` para respuestas directas en modo instruct.
- Generación de títulos de producto, descripciones y puntos de venta a partir de imágenes.
- Comparación y verificación de similitud entre listados de producto.
- Soporte bilingüe chino-inglés.
- Servido mediante API compatible con OpenAI a través de `mlx_vlm.server`.
- No se documenta en la información disponible soporte explícito de tool calling o function calling.

## Casos de uso

- Generación automática de fichas de producto: a partir de una foto, el modelo redacta título y tres puntos de venta; el modo instruct (thinking desactivado) reduce latencia para catalogación masiva.
- Comparación de listados duplicados: con dos imágenes en la misma petición y thinking activado, el modelo describe diferencias entre variantes (por ejemplo, mismo producto en distinto color), útil para control de calidad de catálogo.
- Moderación y enriquecimiento de anuncios: análisis de imágenes y vídeo de producto para detectar discrepancias entre la imagen y el texto del anuncio.
- Asistencia a vendedores en chino e inglés: generación de descripciones bilingües para marketplaces internacionales con una sola pasada.
- Prototipado local en Apple Silicon: con 1,8 GB de memoria pico en la prueba de imagen, permite iterar sobre prompts y plantillas en un MacBook sin infraestructura GPU.
- Extracción de atributos visuales (color, precio visible, tipo de prenda) para pipelines de indexación y búsqueda por similitud.
- Despliegue de un servicio interno de demostración mediante `mlx_vlm.server` con API compatible con OpenAI, para integrar en herramientas de back-office.

## Benchmarks y rendimiento

La model card de esta conversión remite a las tablas de benchmarks publicadas por Tencent en la tarjeta original, presentadas como imágenes (`assets/ecommerce-benchmarks.png`, `assets/ecommerce-instruct-table.png`, `assets/ecommerce-thinking-table.png`, `assets/general-benchmarks.png`, `assets/general-instruct-table.png`, `assets/general-thinking-table.png`). No se incluyen los valores numéricos en la información disponible, por lo que no se reproducen aquí.

| Metrica de la conversion | 8-bit | bf16 |
|---|---|---|
| Coincidencia de siguiente token vs. original bf16 | 99,4 % | 100,0 % |
| KL media vs. original | 0,0018 | 0,0000 |
| Tamano del paquete | 1,0 GB | 1,7 GB |
| Memoria pico en prueba de imagen | 1,8 GB | 2,4 GB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 1,8 GB de pico en la prueba de imagen con el build de 8 bits (2,4 GB con bf16).
- Entorno de referencia: MacBook Pro M5 Max con 128 GB, mlx 0.32.4 y mlx-vlm 0.7.11.
- Diseñado para Apple Silicon; no se documenta soporte para GPU NVIDIA en esta build.
- Cabe en cualquier Mac con Apple Silicon con memoria unificada suficiente (el modelo ocupa 1,0 GB en disco).
- Opciones de despliegue: `mlx_vlm.generate` (CLI), API Python `mlx_vlm.load`/`generate`, y `mlx_vlm.server` con API compatible con OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-Ecom-0.8B-MLX-8bit (esta ficha) | 852.985.920 | no disponible | zh, en | Apache-2.0 | MLX safetensors 8-bit |
| WeMM-Ecom-0.8B-MLX-bf16 (mismo autor) | 852.985.920 | no disponible | zh, en | Apache-2.0 | MLX safetensors bf16 |
| tencent/WeMM-Ecom-0.8B (original) | 852.985.920 | no disponible | zh, en | Apache-2.0 | safetensors (bf16) |

No se dispone de datos de benchmarks numéricos ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en e-commerce: su rendimiento en dominios generales puede ser inferior al de VLMs de propósito general del mismo tamaño.
- Solo soporta chino e inglés; no se documentan otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en la lectura de precios o atributos poco visibles en la imagen.
- La cuantización a 8 bits introduce una divergencia del 0,6 % en el siguiente token respecto al original bf16; para casos que requieran máxima fidelidad existe el build bf16.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el fichero `LICENSE` de Tencent y el `NOTICE` con la atribución a Tencent y al equipo de Qwen.
- NetProjects no está afiliado a Tencent ni a Alibaba; la conversión es de terceros.
- No se documenta longitud de contexto máxima, por lo que no se puede garantizar el manejo de conversaciones o documentos largos.
- No se documenta soporte de tool calling, lo que limita su uso en pipelines de agentes que dependan de function calling.
- Requiere mlx-vlm >= 0.7.11; versiones anteriores pueden no cargar correctamente la plantilla de chat o el procesador.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/WeMM-Ecom-0.8B-MLX-8bit
- Build bf16 del mismo autor: https://huggingface.co/netprojects/WeMM-Ecom-0.8B-MLX-bf16
- Modelo original de Tencent: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Perfil de NetProjects en Hugging Face: https://huggingface.co/netprojects
- Sitio de NetProjects: https://netprojects.com
