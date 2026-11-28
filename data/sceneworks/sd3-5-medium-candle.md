# SceneWorks/sd3.5-medium-candle

## Resumen

sd3.5-medium-candle es una conversión al ecosistema Candle de Stable Diffusion 3.5 Medium, el modelo de generación de imágenes texto-a-imagen de Stability AI. El repositorio lo publica SceneWorks y su función principal no es ofrecer un modelo nuevo, sino empaquetar los pesos del transformer de SD 3.5 Medium en formato GGML/GGUF por bloques cuantizados para que puedan ejecutarse de forma nativa con Candle, el framework de tensores en Rust. Se trata, por tanto, de una distribución de inferencia más que de un entrenamiento o fine-tune con datos propios.

El modelo deriva de la rama MLX de SceneWorks (sd3.5-medium-mlx), de la que hereda el tier q4, y añade un tier q8 generado a partir de los pesos bf16 originales. El transformer se cuantiza por capas lineales, mientras que los codificadores de texto (CLIP-L, CLIP-G y T5) y el VAE se mantienen en precisión densa. El repositorio ocupa 16 GB y está pensado para despliegues en Windows y Linux, dejando macOS a los tiers MLX.

Su relevancia es operativa: permite servir SD 3.5 Medium en infraestructura Rust sin depender del stack de Python/PyTorch, con pesos cuantizados que reducen el coste de memoria del transformer. No aporta mejoras de calidad sobre el modelo base; su valor está en el formato, la cuantización y la integración con Candle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (MMDiT) de Stable Diffusion 3.5 Medium, con codificadores CLIP-L, CLIP-G y T5 y VAE densos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4 (Q4_1, convertido sin pérdida desde el tier MLX q4) y q8 (Q8_0, cuantizado desde bf16); lineales cuantizadas como U8 con forma [out, in/32, block_bytes] |
| Idiomas soportados | no disponible |
| Licencia | stabilityai-ai-community (campo `license: other` con `license_name: stabilityai-ai-community`) |
| Formato de pesos | safetensors y GGUF por bloques (gguf-blocks); librería candle |

## Arquitectura y entrenamiento

El modelo subyacente, Stable Diffusion 3.5 Medium, emplea una arquitectura de diffusion transformer (MMDiT) que combina atención multimodal sobre los embeddings de texto y las representaciones latentes de la imagen. El pipeline completo integra tres codificadores de texto (CLIP-L, CLIP-G y T5) y un VAE para la decodificación latente a píxel. En esta distribución concreta, solo el transformer se cuantiza; CLIP-L, CLIP-G, T5 y el VAE se mantienen en precisión densa.

No se ha realizado entrenamiento ni fine-tune adicional: los pesos proceden de SceneWorks/sd3.5-medium-mlx en el commit 5413e962, y el tier q8 se cuantiza desde el transformer bf16 de ese mismo repositorio. La innovación técnica es el formato de cuantización por bloques GGML: cada capa lineal cuantizada se almacena como un único tensor U8 `{base}.weight` con forma [out, in/32, block_bytes], y el `config.json` declara `quantization: {bits, storage: ggml}`. La conversión se realizó con la herramienta `candle_gen::ggml_tier` del repositorio SceneWorks/inference. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni el proceso de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de prompts en lenguaje natural, heredando las capacidades de SD 3.5 Medium.
- Dos niveles de cuantización del transformer (q4 y q8) para ajustar el equilibrio entre calidad y memoria.
- Inferencia nativa con Candle en Rust, sin dependencia de PyTorch.
- Codificadores de texto densos (CLIP-L, CLIP-G, T5) que permiten prompts descriptivos y con vocabulario amplio.
- Ejecución multiplataforma en Windows y Linux; macOS queda cubierto por los tiers MLX del repositorio hermano.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo de razonamiento, al ser un modelo de difusión de imagen.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: el tier q8 permite obtener imágenes de referencia con fidelidad cercana al bf16 dentro de un servicio Rust, útil para iterar sobre conceptos visuales antes de encargar arte final.
- Servicio de imágenes en backend Rust: al ejecutarse con Candle, el modelo puede integrarse en un microservicio ya escrito en Rust sin introducir un runtime de Python, reduciendo la superficie de dependencias en producción.
- Despliegue en máquinas con VRAM limitada: el tier q4 reduce el peso del transformer y hace viable la inferencia en GPUs de consumo, adecuado para demos locales o entornos de desarrollo.
- Generación por lotes en pipelines de contenido: el formato GGUF por bloques y la librería Candle permiten cargar los pesos una vez y procesar lotes de prompts para catálogos, banners o material de marketing.
- Investigación en cuantización de modelos de difusión: al estar disponibles los tiers q4 y q8 sobre el mismo modelo base, sirve para medir la degradación de calidad introducida por la cuantización en tareas controladas.
- Integración en herramientas de escritorio: al funcionar en Windows y Linux con Candle, encaja en aplicaciones nativas de edición o generación de imágenes que no pueden empaquetar el stack de PyTorch.
- Evaluación comparativa de backends: permite contrastar el rendimiento de Candle frente a MLX o diffusers con los mismos pesos de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio completo ocupa 16 GB, pero incluye codificadores densos y VAE además del transformer; el tier q4 reduce el peso del transformer respecto al q8, aunque no se publican cifras por componente.
- GPU recomendadas: no disponible. No se documentan modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: no se confirma qué tarjetas pueden alojar el modelo; la existencia de un tier q4 sugiere viabilidad en GPUs de consumo, pero sin datos verificables.
- Opciones de despliegue: Candle (librería `candle` y `candle_gen::ggml_tier` de SceneWorks/inference). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no están orientados a modelos de difusión de este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SceneWorks/sd3.5-medium-candle | no disponible | no disponible | safetensors y GGUF por bloques (Candle) | stabilityai-ai-community | Hugging Face, 0 descargas |
| stabilityai/stable-diffusion-3.5-medium (base) | no disponible | no disponible | safetensors (diffusers) | stabilityai-ai-community | Hugging Face |
| SceneWorks/sd3.5-medium-mlx | no disponible | no disponible | MLX (tiers q4) | stabilityai-ai-community | Hugging Face |
| Stable Diffusion 3.5 Large | no disponible | no disponible | safetensors (diffusers) | stabilityai-ai-community | Hugging Face |

La comparación relevante es de formato y backend, no de calidad: los tres primeros comparten los mismos pesos base y difieren en el runtime (Candle, diffusers, MLX). No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tune: la calidad de imagen es la del SD 3.5 Medium original, sin mejoras atribuibles a esta conversión.
- El tier q4 puede introducir degradación de calidad frente al bf16; no se publican métricas que cuantifiquen esa pérdida.
- La licencia stabilityai-ai-community no es de código abierto laxa: impone condiciones de uso comercial que deben revisarse en el LICENSE.md antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria del formato ni reportes de fallos.
- Solo se documenta soporte en Windows y Linux; macOS requiere los tiers MLX del repositorio hermano.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación visual; deben evaluarse empíricamente antes de un uso en producción.
- La dependencia de Candle y de la herramienta `candle_gen::ggml_tier` limita la portabilidad frente a pipelines diffusers estándar.
- No se dispone de información sobre el dataset de entrenamiento del modelo base, lo que dificulta auditar sesgos de representación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SceneWorks/sd3.5-medium-candle
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Repositorio MLX de origen: https://huggingface.co/SceneWorks/sd3.5-medium-mlx
- Repositorio de inferencia de SceneWorks: https://huggingface.co/SceneWorks/inference
- Candle (framework en Rust): https://github.com/huggingface/candle
- Licencia stabilityai-ai-community: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium/blob/main/LICENSE.md
