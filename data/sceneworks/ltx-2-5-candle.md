# SceneWorks/ltx-2.5-candle

## Resumen

ltx-2.5-candle es una conversión al ecosistema Candle (framework de tensores en Rust) del modelo de generación de vídeo LTX-2.5 de Lightricks, publicada por el usuario SceneWorks. El repositorio contiene los pesos del modelo base reorganizados en bloques GGUF con cuantizaciones Q4_1 y Q8_0, pensados para su uso con el runtime de inferencia de SceneWorks en Windows y Linux. No se trata de un modelo nuevo, sino de una redistribución empaquetada del modelo original con un formato y una librería distintos.

El modelo subyacente, LTX-2.5, es un sistema multimodal de generación de vídeo (y presumiblemente audio, a juzgar por los componentes `audio_vae` y `vocoder` presentes en el repositorio) que combina un transformer de difusión con un codificador de texto derivado de Gemma. La model card indica que el text encoder, el connector, el transformer y el `vae_diffusion_decoder` están cuantizados, mientras que el resto de componentes (VAE de audio, encoder de difusión, decodificadores, upsamplers y vocoder) permanecen en precisión densa.

La relevancia de esta ficha radica en que documenta una vía de despliegue alternativa para LTX-2.5 fuera del stack habitual de PyTorch/MLX: el uso de Candle y GGUF permite ejecutar el modelo en entornos Rust sin dependencia de Python, algo poco común en modelos de vídeo de gran tamaño. El repositorio ocupa 168,2 GB, lo que da una idea de la escala del modelo completo en sus distintas variantes (destilada y dev).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para video con text encoder (Gemma) y VAE de audio/video; empaquetado GGUF para Candle |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_1 (convertida sin perdida desde MLX q4) y Q8_0 (cuantizada desde bf16) |
| Idiomas soportados | no disponible |
| Licencia | ltx-2-community-license-agreement |
| Formato de pesos | GGUF por bloques (U8 `{base}.weight` con forma `[out, in/32, block_bytes]`), mas shards bf16 de origen |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna de LTX-2.5 mas alla de los nombres de sus componentes: un `text_encoder` (derivado de `google/gemma-4-12B-it`), un `connector`, un `transformer` de difusion, un `vae_diffusion_decoder`, un `vae_decoder` y `vae_encoder` de video, un `audio_vae`, un `vocoder`, un `duration_head` y sendos `spatial_upsampler` y `temporal_upsampler`. Esta composicion sugiere un pipeline de difusion condicionado por texto que genera latentes de video (y audio) y los decodifica mediante VAEs separados, con upsamplers espaciales y temporales para aumentar la resolucion de la salida.

El repositorio `ltx-2.5-candle` no aporta informacion sobre el entrenamiento del modelo base: no se indican numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. La model card se limita a describir el proceso de conversion: los pesos Q4_1 se obtuvieron de forma sin perdida a partir del tier MLX q4 de `SceneWorks/ltx-2.5-mlx`, y los Q8_0 se cuantizaron desde los shards bf16 originales. La herramienta empleada fue `candle_gen::ggml_tier` del repositorio `SceneWorks/inference`.

## Capacidades

- Generacion de video a partir de texto: el pipeline incluye transformer de difusion, VAE de video y upsamplers espacial y temporal.
- Generacion o procesamiento de audio: la presencia de `audio_vae` y `vocoder` apunta a salida o condicionamiento de audio, aunque la model card no lo detalla.
- Codificacion de texto mediante un text encoder basado en Gemma 4 de 12B.
- Control de duracion: el componente `duration_head` sugiere la capacidad de fijar o predecir la longitud del video generado.
- Variantes destilada y dev: el repositorio incluye pesos para ambos modos (`distilled/bf16/*` y `dev/bf16/*`), lo que permite elegir entre inferencia rapida y mayor calidad.
- Ejecucion nativa en Rust via Candle, sin dependencia de Python.
- Soporte de tool calling, agentes, razonamiento multi-paso o thinking mode: no disponible (no es un modelo de lenguaje conversacional).

## Casos de uso

- Generacion de video publicitario a partir de prompts de texto: el modelo permite producir clips con control de duracion mediante el `duration_head` y aumentar resolucion con los upsamplers espacial y temporal, lo que encaja en flujos de creacion de contenido para marketing.
- Prototipado de pipelines de video en Rust: al estar empaquetado para Candle, se puede integrar en servicios backend escritos en Rust sin levantar un entorno Python, reduciendo la superficie de dependencias en produccion.
- Despliegue en Windows y Linux con cuantizacion Q4_1: la variante Q4 reduce el peso en disco y memoria frente a bf16, lo que facilita ejecutar el modelo en estaciones de trabajo con GPU de gama alta pero no necesariamente con memoria de数据中心.
- Generacion de video con audio sincronizado: los componentes de audio (`audio_vae`, `vocoder`) permiten construir pipelines que producen video y pista de audio en una sola pasada, util para demos y contenido social.
- Investigacion en difusion de video: al ofrecer pesos en GGUF y bf16 con nombres de componentes claros, sirve para estudiar el efecto de la cuantizacion en la calidad de video generado.
- Evaluacion comparativa de runtimes: permite medir latencia y throughput de Candle frente a MLX o PyTorch sobre el mismo modelo base, ya que la conversion Q4_1 se declara sin perdida respecto al tier MLX.
- Generacion de variaciones de video en lote: la variante destilada, pensada para menos pasos de difusion, es adecuada para producir muchas muestras en poco tiempo en tareas de exploracion creativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio completo ocupa 168,2 GB, pero incluye varias variantes (destilada y dev, en bf16 y cuantizadas); la variante Q4_1 concreta sera sustancialmente menor, aunque no se especifica la cifra.
- GPU recomendadas: no disponible. Por el tamano del modelo base y la presencia de un text encoder de 12B, es razonable esperar requisitos de memoria elevados, pero la informacion proporcionada no confirma modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: Candle (libreria `candle`), mediante el runtime de SceneWorks (`SceneWorks/inference`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no son adecuados para un modelo de difusion de video.
- Latencia y throughput: no disponibles.
- Plataformas: Windows y Linux con Candle; macOS queda cubierto por los tiers MLX de `SceneWorks/ltx-2.5-mlx`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SceneWorks/ltx-2.5-candle | no disponible | no disponible | GGUF (Candle) | ltx-2-community-license-agreement | Hugging Face |
| Lightricks/LTX-2.5 | no disponible | no disponible | no disponible | ltx-2-community-license-agreement | Hugging Face (modelo base) |
| SceneWorks/ltx-2.5-mlx | no disponible | no disponible | MLX (q4, bf16) | ltx-2-community-license-agreement | Hugging Face |

No se dispone de datos de rendimiento ni de parametros para establecer una comparacion cuantitativa con alternativas de generacion de video como otros modelos de difusion. La comparacion se limita al formato de empaquetado y la plataforma objetivo.

## Limitaciones y advertencias

- La licencia `ltx-2-community-license-agreement` no es una licencia open source estandar; es necesario revisar sus terminos en el enlace del repositorio de Lightricks antes de cualquier uso comercial.
- El modelo es una conversion de terceros (SceneWorks), no una publicacion oficial de Lightricks; la calidad y fidelidad de la cuantizacion dependen del proceso de conversion y no estan validadas por el autor original.
- La model card no documenta sesgos, tasas de alucinacion ni limitaciones de idioma del modelo base.
- No se especifican los idiomas soportados por el text encoder ni por el pipeline de generacion.
- El repositorio es muy pesado (168,2 GB), lo que implica costes de almacenamiento y descarga considerables.
- No hay informacion sobre latencia, throughput ni requisitos minimos de VRAM, lo que dificulta planificar un despliegue en produccion.
- El modelo esta pensado para Candle en Windows y Linux; en macOS debe usarse la variante MLX, no esta.
- Al ser un modelo de generacion de video, existe riesgo de generar contenido sintetico realista; conviene aplicar politicas de uso responsable y marcado de contenido generado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni de validacion por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SceneWorks/ltx-2.5-candle
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Text encoder base: https://huggingface.co/google/gemma-4-12B-it
- Variante MLX de origen: https://huggingface.co/SceneWorks/ltx-2.5-mlx
- Licencia: https://github.com/Lightricks/LTX-2/blob/v1.2.0/LICENSE.md
- Repositorio de inferencia de SceneWorks: https://github.com/SceneWorks/inference
