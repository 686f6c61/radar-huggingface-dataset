# SceneWorks/qwen-image-edit-2511-candle

## Resumen

qwen-image-edit-2511-candle es una conversión al ecosistema Candle (el framework de tensores y deep learning en Rust desarrollado por Hugging Face) del modelo de edición de imágenes Qwen-Image-Edit-2511 de Qwen (Alibaba). El repositorio, publicado por SceneWorks, no entrena un modelo nuevo: redistribuye los pesos del modelo base en formatos GGML/GGUF cuantizados listos para inferencia nativa en Rust mediante Candle, partiendo a su vez de una conversión previa a MLX. Está pensado para despliegues en Windows y Linux, mientras que la variante MLX cubre macOS.

El interés práctico reside en el formato: ofrece dos niveles de cuantización (q4 en Q4_1 y q8 en Q8_0) con cada capa lineal empaquetada como un tensor U8 con bloques de cuantización, y una configuración declarada en `config.json` que indica bits y almacenamiento `ggml`. El repositorio pesa 52,8 GB, lo que refleja la inclusión de varias variantes de pesos de un modelo de edición de imágenes de gran tamano.

La licencia es Apache 2.0 y el modelo base es Qwen/Qwen-Image-Edit-2511. No se dispone de información publicada sobre arquitectura interna, parámetros totales, longitud de contexto ni idiomas soportados en la documentación proporcionada, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de edición de imágenes basado en el transformer de Qwen-Image-Edit-2511; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_1 (q4) y Q8_0 (q8); formato GGML/GGUF por bloques |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF/GGML por bloques; cada lineal cuantizada es un tensor U8 `{base}.weight` de forma [out, in/32, block_bytes] |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el número de parámetros ni el proceso de entrenamiento del modelo base Qwen-Image-Edit-2511 en la documentación disponible. Lo que sí está documentado es el proceso de conversión y cuantización realizado por SceneWorks: la variante q4 se obtiene de forma sin pérdida (lossless) a partir del tier q4 del modelo MLX (SceneWorks/qwen-image-edit-2511-mlx en la revisión 0dfbf3a0), mientras que la variante q8 se cuantiza a Q8_0 desde los pesos bf16 del transformer del mismo modelo MLX.

Como innovación técnica destacable, el autor mantiene el módulo `transformer_blocks.N.img_mod.1` en Q8_0 (convertido desde bf16) dentro del tier q4, con el objetivo explícito de evitar el "speckle" (ruido moteado) que produce la cuantización a 4 bits en ese módulo. La conversión se realizó con la herramienta `candle_gen::ggml_tier` del repositorio SceneWorks/inference. No se dispone de datos sobre tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Edición de imágenes: el modelo base es un modelo de edición de imágenes (image edit), por lo que su función principal es modificar imágenes existentes a partir de instrucciones.
- Inferencia nativa en Rust mediante Candle, sin dependencia de Python en tiempo de ejecución.
- Despliegue multiplataforma: pensado para Windows y Linux (macOS se cubre con los tiers MLX).
- Dos niveles de cuantización para equilibrar calidad y requisitos de memoria (q4 y q8).
- Compatibilidad con el formato GGUF/GGML por bloques y con safetensors.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos especiales (thinking, audio, etc.).

## Casos de uso

- Edición de imágenes por lotes en producción sobre Windows/Linux: al estar empaquetado para Candle, puede integrarse en servicios escritos en Rust sin un stack Python, reduciendo dependencias en el despliegue.
- Servicios de retoque automatizado con requisitos de memoria ajustados: el tier q4 (Q4_1) permite ejecutar el modelo con una huella de memoria menor que bf16, adecuado para entornos con GPU de capacidad limitada.
- Pipelines de edición con requisitos de calidad alta: el tier q8 (Q8_0) ofrece mayor fidelidad numérica que q4 cuando el presupuesto de VRAM lo permite.
- Herramientas de escritorio nativas: al compilarse con Candle en Rust, encaja en aplicaciones de escritorio para Windows/Linux que necesiten edición de imágenes local sin servidor.
- Investigación en cuantización: el repositorio documenta el efecto del 4-bit en módulos concretos (`img_mod.1`) y sirve como caso de estudio para evaluar estrategias de cuantización mixta.
- Integración en infraestructura de SceneWorks: el autor declara su uso interno en Windows/Linux, por lo que es directamente reutilizable en ese ecosistema de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio completo ocupa 52,8 GB e incluye varias variantes; el tier q4 será sustancialmente menor que bf16, pero no se publica una cifra concreta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tier q4 es el candidato más plausible para GPUs de consumo, pero no hay confirmación en la documentación.
- Opciones de despliegue: Candle (Rust) en Windows y Linux; tiers MLX para macOS. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SceneWorks/qwen-image-edit-2511-candle | no disponible | no disponible | safetensors, GGUF/GGML (Q4_1, Q8_0) | Apache 2.0 | Hugging Face |
| SceneWorks/qwen-image-edit-2511-mlx | no disponible | no disponible | MLX (tiers q4, q8) | no disponible | Hugging Face |
| Qwen/Qwen-Image-Edit-2511 | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de parámetros de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado desde cero: es una conversión de pesos del modelo base Qwen/Qwen-Image-Edit-2511; hereda sus sesgos y limitaciones, que no se detallan en la documentación.
- La cuantización q4 puede introducir artefactos; el autor mitiga el "speckle" manteniendo `img_mod.1` en Q8_0, pero no se documenta una evaluación de calidad comparativa frente a bf16.
- Sin datos publicados sobre alucinación, sesgos, idiomas ni rendimiento en benchmarks.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen-Image-Edit-2511, que no se detalla en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad.
- Soporte limitado a Candle en Windows/Linux y MLX en macOS; no se documenta compatibilidad con otros runtimes.
- El tamano del repositorio (52,8 GB) exige espacio de almacenamiento considerable y una gestión cuidadosa de las variantes descargadas.

## Enlaces

- Hugging Face: https://huggingface.co/SceneWorks/qwen-image-edit-2511-candle
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Conversión MLX de referencia: https://huggingface.co/SceneWorks/qwen-image-edit-2511-mlx
- Repositorio de inferencia del autor: https://github.com/SceneWorks/inference
- Framework Candle: https://github.com/huggingface/candle
