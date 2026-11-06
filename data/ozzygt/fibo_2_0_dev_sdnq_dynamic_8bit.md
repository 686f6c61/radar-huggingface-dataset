# OzzyGT/fibo_2_0_dev_sdnq_dynamic_8bit

## Resumen

Fibo 2.0 Dev SDNQ INT8 es una versión cuantizada a 8 bits del modelo de difusión `briaai/Fibo-2.0-dev`, publicada por el usuario OzzyGT. Se trata de una conversión de pesos realizada con la herramienta SDNQ (Disty0/sdnq) que aplica cuantización dinámica de 8 bits tanto al transformer como al codificador de texto Qwen3-VL-4B, manteniendo el VAE en bf16. El objetivo es reducir los requisitos de memoria del modelo original sin renunciar de forma significativa a la calidad de generación.

Fibo 2.0 Dev es un modelo de difusión de la familia Bria orientado a generación de imágenes a partir de texto y a edición de imágenes, unificando ambas tareas en un único modelo no destilado. El modelo base emplea un codificador de texto multimodal Qwen3-VL-4B, lo que le permite interpretar instrucciones complejas y renderizar texto dentro de la imagen mediante entradas estructuradas `text_render` en la caption JSON.

La relevancia de esta ficha radica en que la cuantización INT8 permite ejecutar un pipeline de aproximadamente 13 GB de pesos en una GPU de consumo con alrededor de 15 GiB de VRAM en resoluciones de 1424x800, acercando un modelo de edición y generación de gama alta a entornos con hardware limitado. La licencia del modelo base es no comercial (CC BY-NC 4.0), lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (transformer) con codificador de texto Qwen3-VL-4B y VAE; pipeline `BriaFibo2Pipeline` |
| Parametros totales | 8.132.986.501 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 dinámico (SDNQ); transformer y text encoder en 8 bits, VAE en bf16 |
| Idiomas soportados | Inglés (en) |
| Licencia | `bria-fibo` (enlace a CC BY-NC 4.0), uso no comercial |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo base Fibo 2.0 Dev es un modelo de difusión unificado para text-to-image y edición de imágenes, no destilado, que requiere 50 pasos de inferencia y `guidance_scale=5.0`. Incorpora un codificador de texto Qwen3-VL-4B, lo que aporta comprensión multimodal de las instrucciones y permite prompts estructurados en formato JSON (caption VGL) con campos como `short_description`, `objects`, `text_render`, `lighting`, `aesthetics` y `photographic_characteristics`. El pipeline asociado es `BriaFibo2Pipeline` de diffusers.

Esta variante concreta no reentrena el modelo: aplica cuantización dinámica de 8 bits con SDNQ sobre el transformer y el codificador de texto, dejando el VAE en bf16. En disco, el transformer ocupa 8,1 GB y el codificador de texto 4,8 GB. Requiere SDNQ v0.2.8 o superior y diffusers 0.42.0 o superior, e importar `sdnq` antes de cargar los pesos para que se registren las capas cuantizadas. No se dispone de información sobre el dataset de entrenamiento del modelo base en la información proporcionada.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con prompts en formato JSON estructurado.
- Edición de imágenes (image-editing) e image-to-image, aceptando una imagen a editar o hasta 4 imágenes de referencia nombradas `<image_1>`, `<image_2>`, etc.
- Renderizado de texto dentro de la imagen mediante entradas `text_render` con texto, ubicación, tamaño, color y fuente configurables.
- Control fino de la composición mediante captions VGL con descripción de objetos, relaciones espaciales, iluminación, estética y características fotográficas.
- Soporte de negative prompts específicos para text-to-image y para edición (caption vacía).
- Comprensión de instrucciones complejas gracias al codificador Qwen3-VL-4B.
- Uso de fuentes personalizadas desde la carpeta `fonts` del repositorio para el texto renderizado.
- No se documenta soporte de tool calling, agentes ni audio en la información disponible.

## Casos de uso

- Generación de creatividades publicitarias: el modelo permite describir la escena en JSON con objetos, iluminación y estética, y renderizar titulares o precios dentro de la imagen mediante `text_render`, útil para prototipos de cartelería y escaparates.
- Edición de producto en catálogo: partiendo de una foto base y hasta 4 imágenes de referencia, se pueden aplicar instrucciones de sustitución de fondo o cambios de contexto manteniendo la coherencia visual, con 50 pasos y guidance 5.0.
- Diseño de rótulos y señalética: la capacidad de colocar varios textos con fuente, color y tamaño distintos permite simular letreros, pizarras y avisos en una sola generación, como en el ejemplo del escaparate de imprenta.
- Iteración de conceptos visuales en estudio pequeño: al caber en GPUs de consumo con ~15 GiB de VRAM a 1424x800, un diseñador puede ejecutar el pipeline en local para explorar variantes con la misma semilla.
- Prototipado de interfaces y mockups: generar escenas con texto legible integrado facilita maquetas de aplicaciones, carteles o packaging antes de la producción real.
- Investigación en cuantización de modelos de difusión: esta variante sirve para evaluar la pérdida de calidad de SDNQ INT8 frente al modelo bf16 con prompts y semillas idénticas.
- Docencia y experimentación con prompts estructurados: el formato de caption VGL y la guía `bria-vgl` permiten enseñar control compositivo mediante JSON sin necesidad de hardware de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una comparación cualitativa bf16 frente a INT8 con el mismo prompt y semilla, sin métricas numéricas.

## Requisitos de hardware

- VRAM estimada: el ejemplo text-to-image con todo el pipeline en GPU alcanzó un pico de 15,1 GiB a 1424x800.
- Pesos en disco: transformer 8,1 GB, text encoder 4,8 GB, VAE en bf16; repositorio total de 13,3 GB.
- GPU recomendadas: no especificadas en la información; por el pico de VRAM, se requiere una GPU con al menos 16 GB, como RTX 4080/4090 o superiores (A100, H100) para mayor margen.
- GPU de consumo: cabe en tarjetas de 16 GB o más; en GPUs de 12 GB sería necesario descargar partes del pipeline a CPU o reducir resolución, extremo no documentado.
- Despliegue: diffusers 0.42.0 o superior con `BriaFibo2Pipeline`, SDNQ v0.2.8 o superior, e importación previa de `sdnq`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fibo 2.0 Dev SDNQ INT8 (esta ficha) | 8.132.986.501 | No disponible | INT8 dinámico | bria-fibo (CC BY-NC 4.0) | Hugging Face, diffusers |
| briaai/Fibo-2.0-dev | No disponible | No disponible | bf16 | bria-fibo (CC BY-NC 4.0) | Hugging Face, diffusers |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Licencia no comercial: el modelo base se distribuye bajo `bria-fibo` con enlace a CC BY-NC 4.0, por lo que el uso comercial requiere licencia adicional de Bria.
- Solo inglés: el campo de idioma declarado es `en`, sin soporte multilingüe documentado.
- Riesgo de alucinación visual: como modelo generativo, puede producir texto ilegible, objetos inconsistentes o detalles incorrectos, especialmente en resoluciones altas o composiciones complejas.
- Dependencia de prompts estructurados: el rendimiento depende de captions JSON bien construidas; prompts en lenguaje natural simple pueden dar resultados pobres.
- Requisitos de versión estrictos: SDNQ v0.2.8+ y diffusers 0.42.0+; versiones anteriores pueden fallar al cargar los pesos cuantizados.
- Cuantización con pérdida: la comparación cualitativa bf16/INT8 muestra diferencias sutiles; no hay métricas objetivas que cuantifiquen la degradación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni garantías de mantenimiento.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- El modelo base es no destilado y requiere 50 pasos, lo que implica mayor coste computacional que variantes destiladas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OzzyGT/fibo_2_0_dev_sdnq_dynamic_8bit
- Modelo base: https://huggingface.co/briaai/Fibo-2.0-dev
- Guía de captions VGL del modelo base: https://huggingface.co/briaai/Fibo-2.0-dev/blob/main/vgl/README.md
- Herramienta bria-vgl: https://github.com/Bria-AI/vgl
- SDNQ: https://github.com/Disty0/sdnq
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/deed.en
- Ejemplos de imágenes bf16/INT8: https://huggingface.co/datasets/OzzyGT/diffusers-examples/resolve/main/fibo_2_0_dev/t2i_bf16_1424x800.png y https://huggingface.co/datasets/OzzyGT/diffusers-examples/resolve/main/fibo_2_0_dev/t2i_int8.png
