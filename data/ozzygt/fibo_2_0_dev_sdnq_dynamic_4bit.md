# OzzyGT/fibo_2_0_dev_sdnq_dynamic_4bit

## Resumen

Fibo 2.0 Dev SDNQ Dynamic 4-bit es una versión cuantizada a 4 bits del modelo generativo de imágenes briaai/Fibo-2.0-dev, publicada por el usuario OzzyGT. Se trata de un modelo de difusión text-to-image e image-editing unificado, es decir, un único modelo que sirve tanto para generar imágenes desde cero a partir de una descripción textual como para editar imágenes existentes siguiendo instrucciones. La cuantización se ha realizado con SDNQ (Disty0/sdnq) en modo dinámico de 4 bits, aplicada tanto al transformer como al codificador de texto Qwen3-VL-4B, mientras que el VAE se mantiene en bf16.

El modelo resuelve el problema del alto coste de VRAM y almacenamiento del modelo original: frente a los pesos completos en bf16, esta versión ocupa 4,6 GB en disco para el transformer y 3,1 GB para el codificador de texto, con un pico de 10,2 GiB de VRAM en una generación de 1424x800 con todo el pipeline en GPU. Esto lo hace viable en GPUs de consumo de gama alta que de otro modo no podrían ejecutar el modelo completo.

Es relevante ahora porque Fibo 2.0 Dev es un modelo no destilado que unifica generación y edición, y esta cuantización permite probarlo y desplegarlo con requisitos de hardware notablemente menores. La licencia es bria-fibo, que enlaza a CC BY-NC 4.0, por lo que el uso comercial queda restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (pipeline BriaFibo2Pipeline) con transformer y codificador de texto Qwen3-VL-4B; cuantización SDNQ dinámica de 4 bits |
| Parametros totales | 4.320.274.053 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits dinámica (SDNQ); transformer y text encoder cuantizados, VAE en bf16 |
| Idiomas soportados | en |
| Licencia | bria-fibo (enlace a CC BY-NC 4.0) |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

Fibo 2.0 Dev es un modelo de difusión no destilado que unifica text-to-image e image-editing en un único modelo. El pipeline BriaFibo2Pipeline combina un transformer de difusión con un codificador de texto basado en Qwen3-VL-4B y un VAE. En esta versión, el transformer y el codificador de texto están cuantizados a 4 bits mediante SDNQ en modo dinámico, mientras que el VAE permanece en bf16. El transformer ocupa 4,6 GB en disco y el codificador de texto 3,1 GB.

El modelo lee los prompts como captions JSON estructurados, siguiendo la guía VGL (VGL caption guide) del repositorio original; la herramienta bria-vgl puede generar estos captions a partir de una petición de una línea. Para la edición, acepta la imagen a editar o hasta 4 imágenes de referencia que la instrucción nombra como `<image_1>`, `<image_2>`, etc. El renderizado de texto se controla mediante entradas `text_render` en el caption, cada una con su texto, ubicación, tamaño, color y fuente; la carpeta `fonts` contiene las fuentes que usa el pipeline. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con prompts en formato JSON estructurado.
- Edición de imágenes guiada por instrucciones (image-editing), incluyendo edición enmascarada según la model card original.
- Image-to-image con hasta 4 imágenes de referencia nombradas en la instrucción.
- Renderizado de texto en la imagen mediante entradas `text_render` con control de texto, posición, tamaño, color y fuente.
- Generación con negative prompts específicos: uno para text-to-image y el caption vacío para ediciones.
- Soporte de fuentes personalizadas mediante la carpeta `fonts` del repositorio.
- Capacidades multilingües: solo inglés según los metadatos.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento extendido.

## Casos de uso

- Generación de imágenes publicitarias con texto integrado: el modelo permite colocar rótulos, carteles y avisos con tipografía, color y posición controlados mediante entradas `text_render`, útil para mockups de escaparates o cartelería.
- Edición de fotografías de producto: se puede pasar una imagen y una instrucción para modificar elementos concretos, con la ventaja de que un solo modelo cubre generación y edición sin cambiar de pipeline.
- Prototipado rápido en equipos con GPUs de consumo: el pico de 10,2 GiB a 1424x800 permite ejecutar el pipeline completo en una RTX 4090 o similar, algo inviable con los pesos en bf16.
- Composición con múltiples referencias: el soporte de hasta 4 imágenes de referencia permite crear escenas combinando elementos de varias fuentes, por ejemplo para variaciones de un mismo producto.
- Creación de material editorial y de ficción: la estructura JSON del caption permite describir con precisión objetos, iluminación y estética, adecuada para ilustraciones consistentes.
- Investigación en cuantización de modelos de difusión: sirve como referencia para evaluar la pérdida de calidad de SDNQ 4 bits frente a bf16 en tareas de generación y edición.
- Edición localizada con máscaras: para retoques en regiones concretas de una imagen manteniendo el resto intacto, según las capacidades documentadas en la model card original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una comparación visual cualitativa entre bf16 e INT4 con el mismo prompt y semilla, sin métricas numéricas.

## Requisitos de hardware

- VRAM estimada: pico de 10,2 GiB en text-to-image a 1424x800 con todo el pipeline en GPU (dato de la model card).
- Almacenamiento: transformer 4,6 GB y codificador de texto 3,1 GB en disco; repositorio de 8,0 GB.
- GPU recomendadas: no se especifican modelos concretos; por el pico de VRAM, encaja en GPUs de 12 GB o más, como RTX 4090 o A100/H100.
- Cabe en GPU de consumo: sí, según el pico de 10,2 GiB indicado; se requiere una GPU con al menos ese margen de VRAM.
- Opciones de despliegue: diffusers 0.42.0 o superior con SDNQ v0.2.8 o superior; es necesario importar `sdnq` antes de cargar los pesos. No se documentan otras opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OzzyGT/fibo_2_0_dev_sdnq_dynamic_4bit | 4.320.274.053 | no disponible | sin benchmarks publicados | bria-fibo (CC BY-NC 4.0) | HuggingFace, diffusers |
| briaai/Fibo-2.0-dev | no disponible | no disponible | sin datos en la información disponible | bria-fibo | HuggingFace, diffusers |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia bria-fibo con enlace a CC BY-NC 4.0: el uso comercial está restringido; conviene revisar los términos exactos antes de desplegar en producción.
- Solo soporta inglés según los metadatos del modelo.
- La cuantización a 4 bits puede introducir pérdida de calidad frente a bf16; la model card solo ofrece una comparación visual, sin métricas.
- Requiere versiones específicas de software (SDNQ v0.2.8 o superior y diffusers 0.42.0 o superior) e importar `sdnq` antes de cargar los pesos; un uso incorrecto provoca fallos de carga.
- Los prompts deben seguir el formato JSON estructurado de la guía VGL; prompts en texto libre pueden dar resultados pobres.
- Riesgo de alucinación visual y de errores en el renderizado de texto, especialmente con varias entradas `text_render` simultáneas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria del resultado de la cuantización.

## Enlaces

- [HuggingFace: OzzyGT/fibo_2_0_dev_sdnq_dynamic_4bit](https://huggingface.co/OzzyGT/fibo_2_0_dev_sdnq_dynamic_4bit)
- [Modelo base: briaai/Fibo-2.0-dev](https://huggingface.co/briaai/Fibo-2.0-dev)
- [SDNQ (GitHub)](https://github.com/Disty0/sdnq)
- [Guía de captions VGL](https://huggingface.co/briaai/Fibo-2.0-dev/blob/main/vgl/README.md)
- [bria-vgl (GitHub)](https://github.com/Bria-AI/vgl)
- [Licencia CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.en)
