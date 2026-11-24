# gguf-org/minimax-h3-image-gguf

## Resumen

MiniMax-H3-Image es un modelo de generación y edición de imágenes de MiniMaxAI, distribuido aquí en formato GGUF por el usuario gguf-org. El repositorio empaqueta los componentes necesarios para ejecutar el pipeline completo mediante la herramienta `ggk`: un modelo de difusión (pruned, en nvfp4), un codificador de texto basado en Qwen3-VL de 32B (cuantizado a Q2_K_M), un VAE en FP16 y, opcionalmente, adaptadores y modelos auxiliares de prompt upsampling. El dato de safetensors del repo indica 20.113.670.232 parámetros totales y un tamaño de 25,8 GB.

La relevancia de esta publicación es práctica: traslada un pipeline de difusión de gran tamaño a un formato y un motor que permiten ejecución con offloading a CPU y streaming de residencia automática, de modo que puede correr en GPUs de gama baja con menos de 6 GB de VRAM. El modelo base es MiniMaxAI/MiniMax-H3-Image, y esta variante GGUF está pensada para inferencia local mediante `ggk`, no para entrenamiento.

La información pública disponible en el repositorio es escasa en cuanto a licencia, idiomas o benchmarks; la model card se limita a ejemplos de uso de la CLI. Esta ficha refleja únicamente lo que consta en los datos proporcionados y marca como "no disponible" todo aquello que no se ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión para imagen (modelo de difusión + codificador de texto Qwen3-VL + VAE); detalles internos no disponibles |
| Parámetros totales | 20.113.670.232 (según safetensors del repo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (nvfp4 para difusión, Q2_K_M para el LLM de 32B, Q4_K_M para upsamplers de 9B y 4B, FP16 para VAE y adaptadores); también formatos w4a8 e int8_convrot en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF, safetensors (w4a8), mmproj (FP16) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base. Por los comandos de la model card se deduce un pipeline compuesto por: un modelo de difusión (`minimax_h3_image_pruned-nvfp4.gguf` o `p-h3-image_w4a8.safetensors`) que genera la imagen; un codificador de texto Qwen3-VL de 32B en Q2_K_M (`qwen3vl_32b_minimax_h3-q2_k_m.gguf`) que interpreta el prompt; un VAE en FP16 (`minimax_h3_image_vae_fp16-f16.gguf`) para codificar y decodificar latentes; y componentes opcionales de prompt upsampling basados en Qwen3.5-9B (Q4_K_M) o Qwen3-VL-4B (Q4_K_M), con sus correspondientes `mmproj` de visión.

El muestreo mostrado usa 6 pasos con `cfg-scale 1` y una secuencia de sigmas explícita (`1.0, 0.9675..., 0.8875..., 0.75, 0.5327..., 0.2320..., 0.0`), lo que sugiere un sampler de tipo flow matching o destilado de pocos pasos. Se ofrece también un adaptador (`qwen3vl_4b_adapter-f16.gguf`) que permite sustituir el LLM de 32B por el de 4B, reduciendo requisitos de memoria. No se dispone de información sobre volumen de datos de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image).
- Edición de imágenes guiada por instrucciones en lenguaje natural, conservando el resto de la imagen (image edit con `-r`).
- Prompt upsampling o enriquecimiento de prompts mediante modelos auxiliares de 9B y 4B, con variante multimodal que acepta imagen de referencia.
- Codificación de texto mediante Qwen3-VL de 32B, con capacidad multimodal en el componente de visión.
- Ejecución con offloading a CPU (`--offload-to-cpu`) y atención con `--diffusion-fa`.
- Streaming de residencia automático para máquinas con poca VRAM (menos de 6 GB, según la model card).
- Soporte de formatos int8_convrot y w4a8 en el motor `ggk`.

## Casos de uso

- Generación de ilustraciones para prototipado rápido: con 6 pasos de muestreo y cfg-scale 1, el pipeline produce imágenes en pocas iteraciones, adecuado para explorar conceptos visuales en local sin depender de APIs.
- Edición selectiva de imágenes: el modo image edit permite aplicar cambios puntuales ("pon unas gafas de sol al personaje, deja el resto igual"), útil para retoque de material gráfico manteniendo el contexto original.
- Despliegue en estaciones de trabajo con GPU modesta: el streaming de residencia automática permite ejecutar el pipeline en GPUs con menos de 6 GB de VRAM, lo que habilita pruebas en portátiles o equipos de gama de entrada.
- Automatización de variantes creativas: combinando el prompt upsampler de 4B o 9B se pueden generar descripciones enriquecidas de forma automática antes de la difusión, útil en flujos de generación masiva de bocetos.
- Integración en herramientas de línea de comandos: la CLI `ggk` con parámetros explícitos de sigmas, pasos y VAE facilita scripting y encadenamiento en pipelines de postproducción.
- Investigación sobre cuantización de pipelines multimodales: la disponibilidad de variantes nvfp4, Q2_K_M, Q4_K_M, w4a8 e int8_convrot permite estudiar el impacto de la precisión en la calidad de imagen generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma numérica; la model card indica que el streaming de residencia automática funciona en GPUs con menos de 6 GB de VRAM.
- El repo ocupa 25,8 GB, por lo que se necesita espacio en disco equivalente o superior para los distintos componentes.
- El codificador de texto de 32B en Q2_K_M es el componente más pesado; la alternativa de 4B con adaptador reduce sustancialmente los requisitos.
- GPUs recomendadas: no disponible.
- Opciones de despliegue: motor `ggk` (CLI mostrada en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este pipeline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La licencia no está indicada en el repositorio; no se puede confirmar el uso comercial sin consultar el modelo base MiniMaxAI/MiniMax-H3-Image.
- No se documentan idiomas soportados; el comportamiento multilingüe del codificador de texto no está verificado en esta ficha.
- El uso de Q2_K_M en el LLM de 32B implica una cuantización agresiva que puede degradar la fidelidad del prompt; la model card ofrece la alternativa de 4B con adaptador.
- El pipeline depende de la herramienta `ggk`, cuyos detalles de mantenimiento, estabilidad y soporte no se documentan.
- No hay benchmarks publicados, por lo que la calidad de imagen frente al modelo base original no está cuantificada.
- Riesgo de alucinación visual y de sesgos: no evaluado en la información disponible.
- El modelo está marcado como `base_model:quantized`, por lo que hereda las limitaciones del modelo original, no documentadas aquí.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gguf-org/minimax-h3-image-gguf
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
