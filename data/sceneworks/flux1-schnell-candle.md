# SceneWorks/flux1-schnell-candle

## Resumen

flux1-schnell-candle es una redistribución en formato nativo de Candle (el framework de tensores en Rust de Hugging Face) del modelo de generación de imágenes FLUX.1-schnell de Black Forest Labs. El repositorio, publicado por SceneWorks, no entrena un modelo nuevo: convierte los pesos del tier MLX de FLUX.1-schnell a bloques GGML cuantizados (Q4_1 y Q8_0) para poder ejecutar la inferencia con el backend Candle en Windows y Linux, dejando el camino MLX para macOS.

El interés es fundamentalmente de ingeniería de despliegue: ofrece los cuatro componentes del pipeline (transformer, text_encoder, text_encoder_2 y VAE) en un formato pensado para inferencia en Rust sin dependencia de Python ni de PyTorch en tiempo de ejecución. El repositorio ocupa 28,6 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere un artefacto de uso interno o recién publicado.

FLUX.1-schnell es un modelo de difusión texto-a-imagen de la familia FLUX.1, destilado para generar imágenes en pocos pasos (la variante "schnell", rápida en alemán). Esta ficha describe el artefacto de SceneWorks y, cuando la información disponible lo permite, las características heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (familia FLUX.1); pesos redistribuidos en bloques GGML para Candle |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | Q4_1 (tier q4, convertido sin pérdida desde MLX q4) y Q8_0 (tier q8, cuantizado desde pesos bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y gguf-blocks; cada lineal cuantizado es un tensor U8 `{base}.weight` de forma `[out, in/32, block_bytes]`; metadatos en `config.json` con `quantization: {bits, storage: ggml}` |

## Arquitectura y entrenamiento

El artefacto no incluye entrenamiento propio: es una conversión de pesos. Según la model card, el tier q4 se obtiene por conversión sin pérdida desde el tier q4 del repositorio MLX (`SceneWorks/flux1-schnell-mlx`), mientras que el tier q8 se cuantiza a Q8_0 directamente desde los pesos bf16 de ese mismo repositorio MLX, cubriendo transformer, text_encoder, text_encoder_2 y VAE. La herramienta empleada es `candle_gen::ggml_tier` del proyecto SceneWorks/inference.

El modelo subyacente, FLUX.1-schnell de Black Forest Labs, es un modelo de difusión con arquitectura transformer (bloques de atención y MLP con mecanismos de flujo) que combina dos codificadores de texto (text_encoder y text_encoder_2, presumiblemente CLIP y T5 en la familia FLUX.1) con un transformer de difusión y un VAE para decodificar latentes a píxeles. La variante schnell está destilada para funcionar con un número reducido de pasos de muestreo. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de imágenes a partir de descripciones textuales, heredada de FLUX.1-schnell.
- Generación en pocos pasos de muestreo gracias a la destilación de la variante schnell.
- Dos niveles de cuantización (q4 y q8) para ajustar el equilibrio entre calidad y memoria.
- Inferencia nativa con Candle en Rust, sin Python en tiempo de ejecución.
- Soporte de los cuatro componentes del pipeline (transformer, dos codificadores de texto y VAE) en el mismo repositorio.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión de entrada, audio ni modo de razonamiento.

## Casos de uso

- Despliegue de generación de imágenes en servicios escritos en Rust: al estar empaquetado para Candle, se puede integrar el pipeline en un binario o servicio Rust sin arrastrar un entorno Python, reduciendo la superficie de dependencias en producción.
- Inferencia en Windows y Linux con backend Candle: la model card indica explícitamente que estos tiers están pensados para Windows/Linux, con macOS cubierto por los tiers MLX, lo que permite una estrategia multiplataforma coherente.
- Entornos con memoria limitada: el tier q4 (Q4_1) reduce el peso de los lineales cuantizados a aproximadamente 4 bits por peso, útil para GPUs de gama media o para servir varias instancias en una misma máquina.
- Tuberías de generación de imágenes por lotes: la cuantización q8 (Q8_0) ofrece un compromiso de calidad cercano a bf16 con menor huella de memoria, adecuado para procesar lotes grandes de prompts.
- Prototipado e investigación en Rust: sirve como referencia para estudiar la conversión de pesos FLUX.1 a bloques GGML y validar la paridad entre tiers MLX y Candle.
- Distribución de artefactos autocontenidos: al incluir los cuatro componentes en un solo repositorio de 28,6 GB, simplifica el despliegue en entornos sin acceso a los repositorios originales de Black Forest Labs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 28,6 GB e incluye los tiers q4 y q8 de los cuatro componentes; el tier q4 reduce el peso de los lineales cuantizados a ~4 bits y el q8 a ~8 bits, pero no se detalla el desglose por componente.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño efectivo del transformer y del VAE en el tier elegido, dato no desglosado en la model card.
- Opciones de despliegue: Candle (backend nativo del repositorio) en Windows y Linux; tiers MLX en macOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de imagen en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| SceneWorks/flux1-schnell-candle | Difusión texto-a-imagen (FLUX.1-schnell) | no disponible | no aplica | Apache 2.0 | safetensors + gguf-blocks, Candle |
| black-forest-labs/FLUX.1-schnell (base) | Difusión texto-a-imagen | no disponible en la información | no aplica | Apache 2.0 | safetensors, PyTorch/diffusers |
| SceneWorks/flux1-schnell-mlx | Difusión texto-a-imagen (FLUX.1-schnell) | no disponible | no aplica | no disponible | MLX (macOS) |
| Stable Diffusion (familia) | Difusión texto-a-imagen | no disponible | no aplica | licencias variables | safetensors, múltiples runtimes |

No se dispone de datos de rendimiento comparativo (FID, CLIP score u otras métricas) en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de conversión, no un modelo entrenado: cualquier limitación de FLUX.1-schnell (sesgos del dataset, riesgo de imágenes estereotipadas o inexactas) se hereda íntegramente.
- Sin datos de evaluación: no hay benchmarks ni métricas de calidad publicadas para estos tiers, por lo que no se puede verificar la fidelidad de la cuantización q4/q8 frente a bf16.
- Cobertura de plataformas limitada: los tiers Candle están declarados para Windows/Linux; en macOS hay que usar los tiers MLX del repositorio hermano.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Idiomas no declarados: no se especifica qué lenguas admiten los prompts; el comportamiento multilingüe depende de los codificadores de texto del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base FLUX.1-schnell de Black Forest Labs, ya que la redistribución no altera los términos del modelo original.
- Sin información sobre latencia ni requisitos de VRAM verificados: riesgoso para planificación de capacidad en producción sin pruebas propias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SceneWorks/flux1-schnell-candle
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.1-schnell
- Repositorio MLX de referencia citado en la model card: https://huggingface.co/SceneWorks/flux1-schnell-mlx
- Framework Candle: https://github.com/huggingface/candle
- Proyecto SceneWorks/inference (herramienta `candle_gen::ggml_tier`): no disponible como enlace directo en la información proporcionada
