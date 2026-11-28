# SceneWorks/wan2.2-t2v-a14b-candle-ggml

## Resumen

`SceneWorks/wan2.2-t2v-a14b-candle-ggml` es una redistribución cuantizada del modelo de generación de vídeo texto-a-vídeo Wan 2.2 T2V A14B, empaquetada específicamente para el runtime Candle (Rust) con formato GGML. El autor, SceneWorks, no entrena el modelo: parte de los pesos bf16 de `Wan-AI/Wan.2-T2V-A14B-Diffusers` y los convierte a dos niveles de cuantización (Q4_1 y Q8_0) para su uso en Windows y Linux, dejando los tiers MLX para macOS.

El modelo base es un difusor de vídeo de 14 000 millones de parámetros con dos transformadores (un experto de alto y otro de bajo ruido, típico en la familia Wan 2.2), un text encoder y un VAE. Esta ficha cubre únicamente el repositorio de cuantizaciones GGML para Candle, no el modelo original de Wan-AI.

La relevancia de este repositorio es de infraestructura: permite ejecutar un modelo de vídeo de gran tamaño en entornos nativos Rust sin depender de PyTorch, a costa de una disponibilidad muy limitada (0 descargas, 0 likes en el momento de la consulta) y de una documentación mínima. Los detalles sobre datos de entrenamiento, benchmarks y licencia concreta no están publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusor de vídeo con dos transformadores (transformer y transformer_2), text encoder y VAE densos; cuantización GGML por bloque |
| Parametros totales | 14B (denominación A14B del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_1 (q4, convertido sin pérdida desde el tier MLX q4) y Q8_0 (q8, cuantizado desde bf16) |
| Idiomas soportados | no disponible (el prompt textual depende del text encoder del modelo base) |
| Licencia | other (ver archivo LICENSE dentro de cada carpeta de tier; mismos términos que el repositorio origen) |
| Formato de pesos | safetensors, GGUF por bloques (cada lineal cuantizada es un tensor U8 `{base}.weight` de forma [out, in/32, block_bytes]); config.json con `quantization: {bits, storage: ggml}` |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es una conversión de pesos. El tier q8 se obtiene cuantizando a Q8_0 los subdirectorios `transformer/` y `transformer_2/` del checkpoint bf16 de `Wan-AI/Wan.2-T2V-A14B-Diffusers` (commit 5be7df96), mientras que el text encoder y el VAE se mantienen densos. El tier q4 es una conversión sin pérdida del tier MLX q4 ya existente en `SceneWorks/wan2.2-t2v-a14b-candle` (commit da1909b6). La herramienta de conversión es `candle_gen::ggml_tier` del repositorio SceneWorks/inference.

La innovación técnica es el formato de almacenamiento: cada capa lineal cuantizada se guarda como un único tensor U8 con eje interior dividido en bloques de 32 elementos, lo que encaja con el kernel GGML de Candle y evita el reempaquetado en tiempo de carga. No hay información sobre el dataset de entrenamiento del modelo base, número de tokens, ni sobre etapas de RLHF o DPO en la documentación proporcionada.

## Capacidades

- Generación de vídeo a partir de prompts de texto (text-to-video), heredada del modelo base Wan 2.2 T2V A14B.
- Ejecución nativa en Candle (Rust) en Windows y Linux; en macOS el autor recomienda usar los tiers MLX del repositorio hermano.
- Carga de pesos cuantizados por bloques GGML con dos niveles de precisión (q4 y q8).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en este repositorio.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia de vídeo en producción sobre stack Rust: integración del modelo en servicios backend escritos en Rust que usan Candle, evitando una dependencia de Python/PyTorch en el pipeline de generación.
- Despliegue en Windows y Linux con un único formato de pesos: el mismo tier GGML sirve para ambos sistemas operativos, lo que simplifica la matriz de artefactos frente a mantener checkpoints bf16 y MLX en paralelo.
- Prototipado con requisitos de VRAM reducidos: el tier q4, al provenir de una conversión sin pérdida del q4 MLX, ofrece la opción de menor huella de memoria para pruebas en hardware limitado.
- Evaluación comparativa de cuantizaciones: al disponer de q4 y q8 del mismo modelo, permite medir la degradación de calidad del vídeo generado entre ambas precisiones en un mismo runtime.
- Pipelines de generación de vídeo por lotes en servidores Linux: el tier q8, cuantizado desde bf16, es la opción de mayor fidelidad dentro de este repositorio para trabajos desatendidos.
- Reproducibilidad de artefactos: los commits de origen están fijados (da1909b6 para el layout y 5be7df96 para los pesos), lo que facilita reconstruir exactamente la misma conversión en una CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia de orden de magnitud, el repositorio completo ocupa 60,2 GB e incluye ambos tiers; el tier q8 de un modelo de 14B en Q8_0 ronda los 14-15 GB solo para los transformadores, a lo que hay que sumar text encoder y VAE densos. Estas cifras son estimaciones, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado. El tier q4 es la opción con más probabilidades de ajustarse a GPUs de consumo de gama alta, pero el autor no publica requisitos mínimos.
- Opciones de despliegue: Candle (Rust) es el runtime objetivo; el formato GGML por bloques está pensado para `candle_gen::ggml_tier`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y en macOS el autor remite a los tiers MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SceneWorks/wan2.2-t2v-a14b-candle-ggml | 14B | no disponible | GGML por bloques / Candle | other | 0 descargas, 0 likes |
| Wan-AI/Wan.2-T2V-A14B-Diffusers (origen) | 14B | no disponible | safetensors bf16 / diffusers | no disponible en esta ficha | repositorio upstream citado |
| SceneWorks/wan2.2-t2v-a14b-candle (tiers MLX) | 14B | no disponible | MLX / macOS | no disponible en esta ficha | repositorio hermano citado |

No se dispone de datos de rendimiento comparado entre estas variantes; la comparativa se limita a formato, runtime y licencia.

## Limitaciones y advertencias

- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Documentación mínima: no hay model card con instrucciones de uso, requisitos de hardware ni ejemplos de inferencia.
- Licencia "other" sin texto en la model card: los términos reales están en el archivo LICENSE de cada carpeta de tier y remiten al repositorio origen; es imprescindible revisarlos antes de cualquier uso comercial.
- El tier q4 no se ha cuantizado desde bf16, sino convertido desde el tier MLX q4, por lo que su linaje de precisión es distinto al del q8.
- No hay información sobre sesgos, tasa de alucinación visual, idiomas soportados ni límites de duración o resolución del vídeo generado.
- Al ser una redistribución, cualquier corrección de calidad debe hacerse en el modelo base o en el repositorio de tiers MLX, no aquí.
- El soporte de plataforma es explícito: Windows y Linux con Candle; macOS queda fuera de este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SceneWorks/wan2.2-t2v-a14b-candle-ggml
- Modelo base: https://huggingface.co/Wan-AI/Wan.2-T2V-A14B-Diffusers (commit 5be7df9619b54f4e2667b2755bc6a756675b5cd7)
- Repositorio hermano con tiers MLX y layout de referencia: https://huggingface.co/SceneWorks/wan2.2-t2v-a14b-candle (commit da1909b66b360e1ea8cdeb3e39e40dca172cfa32)
- Herramienta de conversión: SceneWorks/inference (`candle_gen::ggml_tier`), sin URL directa en la información proporcionada
