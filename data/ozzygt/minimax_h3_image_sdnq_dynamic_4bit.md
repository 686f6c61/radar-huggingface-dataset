# OzzyGT/minimax_h3_image_sdnq_dynamic_4bit

## Resumen

MiniMax-H3-Image SDNQ Dynamic 4bit es una versión cuantizada a 4 bits del modelo de generación y edición de imágenes MiniMax-H3-Image de MiniMaxAI, publicada por el usuario OzzyGT. Se trata de un checkpoint de difusión (pipeline text-to-image) que mantiene la arquitectura del modelo original pero reduce el peso de sus pesos mediante cuantización dinámica de 4 bits con la técnica SDNQ (rotación de Hadamard), lo que permite ejecutar un modelo de 17.635 millones de parámetros con un consumo de VRAM notablemente inferior al de la versión en bf16.

El modelo resuelve dos tareas: generación de imágenes a partir de texto y edición/composición multi-referencia, es decir, combinar varias imágenes de entrada en una sola escena coherente. El repositorio ocupa 37 GB e incluye el transformer y el text encoder cuantizados, mientras que el VAE se mantiene sin cuantizar. Es relevante porque demuestra que un modelo de imagen de gran tamaño puede desplegarse en hardware más modesto sin cambiar el pipeline de inferencia, usando `diffusers` y la librería SDNQ.

La información disponible no incluye detalles sobre el entrenamiento del modelo base, los datos utilizados ni resultados de benchmarks. La ficha se limita a los datos verificables del repositorio y de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación de imágenes (pipeline text-to-image, librería `diffusers`); detalles internos del transformer no disponibles |
| Parametros totales | 17.635.893.184 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 dinámica con SDNQ y rotación de Hadamard (transformer y text encoder cuantizados; VAE sin cuantizar) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MiniMax-H3-Image Community License Agreement (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (repo de 37,0 GB) |

## Arquitectura y entrenamiento

El repositorio es una cuantización del modelo base MiniMaxAI/MiniMax-H3-Image, no un modelo entrenado desde cero. La model card indica que se ha aplicado cuantización dinámica de 4 bits con SDNQ y rotación de Hadamard sobre el transformer y el text encoder, y que el text encoder conserva únicamente las 51 capas que el modelo utiliza. El VAE no se cuantiza. No se dispone de información sobre la arquitectura interna del transformer (número de bloques, mecanismos de atención, tipo de scheduler) ni sobre el proceso de entrenamiento del modelo original: número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas.

La innovación técnica destacable es el propio esquema de cuantización: SDNQ con rotación de Hadamard aplicada de forma dinámica a 4 bits, que busca preservar la calidad de generación del modelo en bf16 reduciendo el peso de los pesos. La model card muestra comparativas visuales bf16 frente a INT4 con el mismo prompt y semilla, tanto en generación como en edición multi-referencia, lo que sugiere que la degradación es limitada, aunque no se aportan métricas cuantitativas.

## Capacidades

- Generación de imágenes a partir de descripciones textuales en inglés, con resolución de salida configurable (el ejemplo de la model card usa 5024x3360).
- Edición y composición multi-referencia: combina varias imágenes de entrada etiquetadas como `<Picture N>` y `<Subject N>` en una sola escena, preservando los sujetos indicados.
- Control fino mediante prompts estructurados que referencian sujetos, objetos y relaciones espaciales.
- Reproducibilidad mediante semilla (`torch.Generator().manual_seed(...)`).
- Integración con el ecosistema `diffusers` a través de `ModularPipeline`.
- No se documentan capacidades de tool calling, agentes, visión general, audio ni modos de razonamiento; el modelo es específicamente de imagen.

## Casos de uso

- Generación de imágenes de alta resolución para ilustración editorial: el modelo acepta dimensiones de salida grandes (hasta 5024x3360 en los ejemplos) y permite controlar la composición mediante prompts detallados, lo que encaja en flujos de creación de portadas o ilustraciones.
- Edición fotográfica con múltiples referencias: sustituir el fondo de una habitación, insertar muebles de otra imagen y añadir mascotas recortadas en una sola escena, como demuestra el ejemplo de la model card con sala, sofá, perro y gato.
- Composición de catálogos de producto: combinar imágenes de producto sobre fondos de escena generados o existentes, manteniendo la identidad visual de cada referencia mediante las etiquetas `<Subject N>`.
- Prototipado rápido de conceptos visuales: generar variaciones de una escena con la misma semilla para comparar decisiones de diseño, aprovechando la reproducibilidad del pipeline.
- Creación de material para marketing y redes sociales: generar escenas con varios elementos referenciados (personas, objetos, entornos) sin necesidad de montaje manual.
- Investigación en cuantización de modelos de difusión: el repositorio sirve como caso de estudio para evaluar la pérdida de calidad de SDNQ INT4 frente a bf16 en tareas de generación y edición, con pares de imágenes comparativas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye comparativas visuales cualitativas entre bf16 e INT4 con el mismo prompt, semilla e imágenes de entrada, sin métricas numéricas (FID, CLIP score, SSIM u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio pesa 37,0 GB en disco; al estar cuantizado a INT4 el transformer y el text encoder, la VRAM necesaria en ejecución será inferior a la de la versión bf16, pero no se proporciona una cifra concreta.
- GPU recomendadas: no disponibles en la información proporcionada. El ejemplo de la model card usa `pipe.to("cuda")` sin especificar modelo de GPU.
- Viabilidad en GPU de consumo: no confirmada. Dado el tamaño del modelo (17,6 mil millones de parámetros) y la cuantización INT4, es plausible que requiera GPUs de gama alta o profesional, pero no hay datos que lo confirmen.
- Opciones de despliegue: `diffusers` instalado desde el código fuente y SDNQ v0.2.8 o superior, según la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este pipeline de difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OzzyGT/minimax_h3_image_sdnq_dynamic_4bit | 17.635.893.184 | No disponible | Difusión text-to-image, INT4 | MiniMax-H3-Image Community License | Hugging Face, 0 descargas |
| MiniMaxAI/MiniMax-H3-Image (base, bf16) | No disponible en la información | No disponible | Difusión text-to-image y edición | MiniMax-H3-Image Community License | Hugging Face (referenciado como modelo base) |
| Otros modelos de difusión comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre alternativas de la misma categoría (mismo tamaño o misma tarea) con la que comparar parámetros, contexto o rendimiento de forma rigurosa. La única comparación documentada es la del propio modelo base en bf16 frente a esta versión INT4, que la model card presenta mediante pares de imágenes.

## Limitaciones y advertencias

- Solo soporta inglés (`en`) según los metadatos del repositorio; los prompts en otros idiomas no están garantizados.
- Al ser una cuantización INT4, existe riesgo de degradación de calidad frente al modelo bf16; la model card solo ofrece comparaciones visuales, sin métricas objetivas.
- No se documentan sesgos conocidos del modelo base ni del proceso de cuantización.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir elementos incoherentes, anatomías incorrectas o texto ilegible en las imágenes, especialmente en resoluciones muy altas o composiciones complejas.
- La licencia es la MiniMax-H3-Image Community License Agreement, no una licencia de código abierto estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- Requiere `diffusers` desde el código fuente y SDNQ v0.2.8 o superior, lo que añade fricción de instalación y posibles incompatibilidades con versiones estables.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- No se dispone de información sobre el rendimiento en hardware concreto, latencia ni consumo de VRAM, lo que dificulta planificar un despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OzzyGT/minimax_h3_image_sdnq_dynamic_4bit
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Librería SDNQ: https://github.com/Disty0/sdnq
- Imágenes de ejemplo (bf16 e INT4): https://huggingface.co/datasets/OzzyGT/diffusers-examples/tree/main/minimax_h3_image
- Licencia: archivo `LICENSE` dentro del repositorio de Hugging Face
