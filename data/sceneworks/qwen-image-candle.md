# SceneWorks/qwen-image-candle

## Resumen

qwen-image-candle es una conversión al ecosistema Candle (el framework de tensores e inferencia en Rust del proyecto Hugging Face) de los pesos del modelo de generación de imágenes Qwen/Qwen-Image-2512, publicada por el usuario SceneWorks. El repositorio no contiene un modelo entrenado desde cero, sino pesos cuantizados en formato GGML (bloques GGUF) derivados de la familia de tiers MLX del mismo autor (SceneWorks/qwen-image-mlx). Se ofrece en dos niveles de cuantización: q4 (Q4_1, convertido sin pérdida desde el tier MLX q4) y q8 (Q8_0, cuantizado a partir de los pesos bf16).

El interés principal es la portabilidad: al estar empaquetado para Candle, permite ejecutar el pipeline de difusión de Qwen-Image en Rust sobre Windows y Linux, sin depender del stack de Python ni de MLX (que queda reservado a macOS). El repositorio ocupa 52,8 GB y la licencia declarada es Apache 2.0, heredada del modelo base.

La información publicada por el autor es muy escasa: no se detallan parámetros totales, longitud de contexto (no aplica a un modelo de difusión), idiomas ni benchmarks. Esta ficha refleja únicamente lo que consta en la model card y en los metadatos de Hugging Face, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación de imágenes (transformer de bloques, base Qwen/Qwen-Image-2512); pesos empaquetados para Candle con cuantización GGML por bloques |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | q4 = Q4_1 (convertido sin pérdida desde el tier MLX q4); q8 = Q8_0 (cuantizado desde bf16); `transformer_blocks.N.img_mod.1` se mantiene en Q8_0 en el tier q4 para evitar artefactos de moteado (speckle) a 4 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y bloques GGUF/GGML (tag `gguf-blocks`); cada capa lineal cuantizada es un tensor U8 `{base}.weight` de forma `[out, in/32, block_bytes]`, con `quantization: {bits, storage: ggml}` en `config.json` |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen-Image-2512, un modelo de generación de imágenes de Qwen. El repositorio de SceneWorks no entrena nada: transforma los pesos bf16 del transformer del modelo base en tiers cuantizados para Candle. Según la model card, los pesos proceden de SceneWorks/qwen-image-mlx en la revisión `8080a4171f1c8b7fca6c30491eafbe6ffab754bf`, es decir, de la variante MLX del mismo autor.

La innovación técnica está en el formato de cuantización: cada capa lineal cuantizada se almacena como un único tensor U8 con forma `[out, in/32, block_bytes]`, de modo que el bloque de cuantización GGML queda embebido en la tercera dimensión del tensor y Candle puede consumirlo directamente. El tier q4 es una conversión sin pérdida desde el q4 de MLX, mientras que el q8 se cuantiza desde los pesos bf16 originales. Como excepción deliberada, en el tier q4 el módulo `transformer_blocks.N.img_mod.1` se mantiene en Q8_0 (también desde bf16) para evitar el moteado característico de 4 bits en ese punto del transformer. La herramienta de construcción citada es `candle_gen::ggml_tier` del repositorio SceneWorks/inference. No se publican datos sobre el dataset de entrenamiento del modelo base ni sobre procesos de RLHF/DPO.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image), heredada del pipeline de Qwen-Image-2512.
- Inferencia nativa en Rust mediante Candle, sin necesidad de Python.
- Ejecución en Windows y Linux con los tiers GGML; macOS queda cubierto por los tiers MLX del repositorio hermano.
- Dos niveles de calidad/tamaño seleccionables: q4 (menor huella) y q8 (mayor fidelidad).
- Compatibilidad con el ecosistema `diffusers` (tag declarado), presumiblemente para la conversión y validación de pesos.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio y modo thinking: no disponible (no aplica a un modelo de difusión de imágenes).
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de imágenes en aplicaciones de escritorio nativas: al estar empaquetado para Candle, puede embeberse en binarios Rust para Windows y Linux sin arrastrar un entorno Python, lo que simplifica la distribución.
- Servicios de generación de imágenes en producción con requisitos de latencia y memoria ajustados: el tier q4 reduce la huella frente a bf16 y permite desplegar en hardware más modesto.
- Prototipado de pipelines de difusión en Rust: útil para equipos que ya trabajan con Candle y quieren integrar un modelo de imagen sin cambiar de stack.
- Sustitución de MLX en entornos no macOS: equipos que desarrollan en Mac con los tiers MLX pueden desplegar en servidores Linux con los mismos pesos convertidos.
- Generación de ilustraciones y assets para aplicaciones creativas: el tier q8, cuantizado desde bf16, es la opción adecuada cuando prima la fidelidad visual sobre el ahorro de memoria.
- Investigación sobre cuantización GGML en modelos de difusión: el repositorio documenta el esquema de bloques `[out, in/32, block_bytes]` y la excepción de `img_mod.1`, lo que lo convierte en una referencia para estudiar el impacto del 4 bits en transformers de difusión.
- Evaluación comparativa q4 frente a q8: permite medir de forma directa la degradación visual introducida por Q4_1 en un mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio completo ocupa 52,8 GB e incluye ambos tiers (q4 y q8); en ejecución solo se carga el tier elegido, por lo que la VRAM necesaria será sustancialmente menor que el tamaño total del repo, pero el autor no publica cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tier q4 es la opción indicada para reducir requisitos, pero no se confirma qué tarjetas consumer lo soportan.
- Opciones de despliegue: Candle (librería declarada); el autor cita `candle_gen::ggml_tier` de SceneWorks/inference como herramienta de construcción. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables directamente a este empaquetado).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SceneWorks/qwen-image-candle | no disponible | no aplica | safetensors + GGML (Candle) | Apache 2.0 | Conversión de Qwen-Image-2512 para Rust; tiers q4 y q8 |
| Qwen/Qwen-Image-2512 | no disponible | no aplica | no disponible | no disponible | Modelo base original de generación de imágenes |
| SceneWorks/qwen-image-mlx | no disponible | no aplica | MLX | no disponible | Variante MLX para macOS del mismo autor; origen de los pesos |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta parámetros, requisitos de hardware, idiomas ni benchmarks, lo que dificulta evaluar el modelo antes de desplegarlo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de validación ni de calidad de los pesos convertidos.
- El tier q4 puede introducir artefactos visuales; el propio autor mantiene `img_mod.1` en Q8_0 para mitigar el moteado, lo que sugiere que otras capas sí pueden degradarse.
- Es una conversión de pesos, no un modelo entrenado: cualquier sesgo o limitación del modelo base Qwen-Image-2512 se hereda sin cambios.
- Riesgo de alucinación visual (contenido generado incoherente o no solicitado) inherente a los modelos de difusión; no se documentan mitigaciones.
- La licencia Apache 2.0 se declara en el repositorio, pero conviene verificar la licencia del modelo base Qwen/Qwen-Image-2512 antes de un uso comercial, ya que el autor no la detalla.
- Dependencia del ecosistema Candle y de la herramienta `candle_gen::ggml_tier`: la compatibilidad futura con versiones de Candle no está garantizada.
- Soporte limitado a Windows y Linux según el autor; macOS requiere los tiers MLX, que son un artefacto distinto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SceneWorks/qwen-image-candle
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2512
- Repositorio MLX del mismo autor (referenciado en la model card): SceneWorks/qwen-image-mlx (revisión `8080a4171f1c8b7fca6c30491eafbe6ffab754bf`)
- Herramienta de construcción citada: SceneWorks/inference (`candle_gen::ggml_tier`)
- Framework Candle: https://github.com/huggingface/candle
