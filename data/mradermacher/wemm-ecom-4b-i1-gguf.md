# mradermacher/WeMM-Ecom-4B-i1-GGUF

## Resumen

WeMM-Ecom-4B-i1-GGUF es la versión cuantizada en formato GGUF del modelo multimodal WeMM-Ecom-4B, desarrollado originalmente por Tencent y publicado en Hugging Face. Esta variante ha sido generada por mradermacher, un conocido creador de cuantizaciones GGUF, empleando cuantización con matriz de importancia (imatrix) para preservar la calidad del modelo original en tamaños reducidos. El modelo base está orientado a tareas de comercio electrónico conversacional y combina capacidades de texto y visión, lo que lo hace adecuado para escenarios donde se necesita comprender imágenes de productos junto con lenguaje natural.

El modelo cuenta con 4.205.751.296 parámetros totales (aproximadamente 4,2 mil millones) según los pesos en safetensors del modelo base, y está construido sobre una arquitectura identificada en los metadatos como `qwen3_5`, lo que sugiere una variante de la familia Qwen 3.5 adaptada para fines multimodales y de comercio electrónico. Los idiomas declarados en la model card son chino (zh) e inglés (en), y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo multimodal especializado en e-commerce en hardware de consumo, gracias a las cuantizaciones que van desde 1,6 GB (IQ1_S) hasta 3,6 GB (Q6_K). El repositorio completo ocupa 54,3 GB debido a la gran cantidad de variantes de cuantización incluidas, aunque el usuario solo necesita descargar el archivo correspondiente a la cuantización elegida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiquetada como `qwen3_5` en los metadatos) |
| Parametros totales | 4.205.751.296 (aprox. 4,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, Q4_0, IQ4_XS, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K, más archivo imatrix |
| Idiomas soportados | chino (zh) e inglés (en) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` y la naturaleza multimodal del modelo. Por los metadatos y el tamaño (4,2 mil millones de parámetros), se trata de un transformer multimodal que combina un codificador visual con un modelo de lenguaje, diseñado específicamente para tareas de comercio electrónico conversacional. La model card del repositorio cuantizado no incluye detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información correspondería a la model card del modelo base `tencent/WeMM-Ecom-4B`, que no se ha proporcionado en esta ficha.

La innovación técnica destacable en este repositorio es el uso de cuantización con matriz de importancia (imatrix), que permite generar cuantizaciones de baja precisión (incluso IQ1 e IQ2) con una pérdida de calidad menor que la cuantización estática equivalente. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamaño similar, y que la variante Q4_K_M es la recomendada por equilibrio entre velocidad y calidad. Además, se incluye un archivo imatrix (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Comprensión de imágenes (modelo multimodal): puede procesar imágenes junto con texto, lo que permite analizar productos, capturas o material visual.
- Orientación específica a comercio electrónico: descripciones de productos, atención al cliente, consultas sobre catálogo.
- Conversación multi-turno.
- Capacidades multimodales integradas en el modelo base (visión + lenguaje).
- No se dispone de información sobre soporte de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode) en la documentación proporcionada.
- No se dispone de información sobre capacidades de audio.

## Casos de uso

- Atención al cliente en tiendas online: el modelo puede gestionar conversaciones multi-turno en chino e inglés sobre productos, pedidos y devoluciones, aprovechando su naturaleza conversacional y su especialización en e-commerce.
- Descripción automática de productos a partir de imágenes: gracias a su capacidad multimodal, puede generar fichas de producto y descripciones a partir de fotografías, reduciendo el trabajo manual en catálogos grandes.
- Asistente de compras conversacional: integrado en una web o app, puede responder preguntas sobre características de productos comparando imágenes y texto.
- Moderación y clasificación de contenido de e-commerce: análisis de imágenes de productos para detectar categorías, atributos o posibles incumplimientos.
- Generación de respuestas a reseñas: el modelo puede redactar respuestas contextuales a opiniones de clientes, con soporte para imágenes adjuntas en las reseñas.
- Despliegue en local o en el borde: al caber en cuantizaciones de 2-3 GB, permite ejecutar un asistente de e-commerce en hardware de consumo sin depender de la nube, útil para prototipos y demos.
- Extracción de información de fichas de producto: combinando texto e imagen, puede estructurar atributos (color, talla, material) a partir de material visual y textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2 y 4 GB según la cuantización elegida (IQ1_S ~1,6 GB; Q4_K_M ~2,8 GB; Q6_K ~3,6 GB), más overhead del contexto y del codificador visual.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 para mayor comodidad; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6 GB o más de VRAM, e incluso en sistemas con 8 GB de RAM usando CPU.
- Opciones de despliegue: llama.cpp, Ollama, y otros runners compatibles con GGUF; el repositorio indica compatibilidad con `endpoints_compatible` y la librería `transformers` para el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Ecom-4B (este, cuantizado) | ~4,2 B | no disponible | Sí (visión) | Apache 2.0 | GGUF en HF |
| Qwen2.5-VL-3B | ~3 B | no disponible en esta ficha | Sí | Apache 2.0 (según versión) | HF |
| LLaVA-1.5-7B | ~7 B | no disponible en esta ficha | Sí | Apache 2.0 / Llama | HF |
| MiniCPM-V 2.6 | ~8 B | no disponible en esta ficha | Sí | Apache 2.0 | HF |

Nota: los datos de los modelos comparados no se han verificado en la información proporcionada; se incluyen como referencia de categoría y deben contrastarse con sus fichas oficiales. No se dispone de benchmarks comparativos para este modelo.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés según la model card; el rendimiento en castellano no está garantizado y probablemente sea inferior.
- Riesgo de alucinación inherente a los modelos de lenguaje de 4B parámetros, especialmente en tareas de razonamiento complejo o datos factuales de productos.
- Las cuantizaciones de muy baja precisión (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el autor las etiqueta como "for the desperate" o "very low quality".
- No se dispone de información sobre sesgos específicos del modelo base.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base `tencent/WeMM-Ecom-4B` (enlazada en la model card) para confirmar términos exactos de uso comercial.
- El repositorio tiene 54,3 GB por incluir todas las cuantizaciones; es necesario seleccionar y descargar solo el archivo deseado.
- No hay información sobre el contexto máximo soportado, lo que impide planificar conversaciones largas con seguridad.
- El modelo está especializado en e-commerce; su rendimiento en dominios generales puede ser limitado en comparación con modelos de propósito general del mismo tamaño.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/WeMM-Ecom-4B-i1-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Ecom-4B
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/WeMM-Ecom-4B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#WeMM-Ecom-4B-i1-GGUF
- Licencia del modelo base: https://huggingface.co/tencent/WeMM-Ecom-4B/blob/main/LICENSE
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
