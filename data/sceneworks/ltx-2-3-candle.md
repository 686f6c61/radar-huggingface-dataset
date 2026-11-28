# SceneWorks/ltx-2.3-candle

## Resumen

ltx-2.3-candle es una conversión al ecosistema Candle (framework de tensores en Rust del proyecto Hugging Face) del modelo de difusión LTX-2.3 de Lightricks, orientada a la generación de vídeo. El repositorio, publicado por SceneWorks, no contiene un modelo entrenado desde cero, sino una redistribución del checkpoint base Lightricks/LTX-2.3 en formato GGML/GGUF por bloques, con dos niveles de cuantización (q4 y q8) derivados del tier MLX del mismo autor (SceneWorks/ltx-2.3-mlx). El objetivo es permitir la inferencia nativa en Windows y Linux mediante Candle, reservando las variantes MLX para macOS.

El modelo base LTX-2.3 es un sistema de generación de vídeo con arquitectura de difusión que incorpora un codificador de texto Gemma-3-12B-it (google/gemma-3-12b-it) para el condicionamiento por prompt, junto con un transformer principal, un conector, un VAE de vídeo (encoder y decoder), un VAE de audio, un upsampler y un vocoder. La relevancia de esta ficha radica en que documenta una distribución concreta, empaquetada para Candle y con cuantización GGML, de un modelo de vídeo de gran tamano (51,4 GB de repositorio) que de otro modo requeriría el stack de MLX o el de PyTorch.

Es importante senalar que este repositorio no incluye el codificador de texto Gemma: la model card indica explícitamente que "The Gemma text encoder is not part of these tiers", por lo que el usuario debe aportar dicho componente por separado. Asimismo, el pipeline no está declarado en Hugging Face y el número de descargas y likes es cero en el momento de la consulta, lo que sugiere una publicación muy reciente (28 de noviembre de 2026) y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (transformer principal) con codificador de texto Gemma-3-12B-it, VAE de vídeo, VAE de audio, conector, upsampler y vocoder |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4 (Q4_1, convertido sin pérdida desde el tier MLX q4) y q8 (Q8_0, cuantizado desde pesos bf16) |
| Idiomas soportados | no disponible |
| Licencia | ltx-2-community-license (other) |
| Formato de pesos | GGML/GGUF por bloques; cada lineal cuantizado es un tensor U8 `{base}.weight` de forma [out, in/32, block_bytes]; config.json con `quantization: {bits, storage: ggml}` |

## Arquitectura y entrenamiento

El repositorio no documenta el proceso de entrenamiento del modelo base; se limita a describir la conversión y el empaquetado. Arquitectónicamente, LTX-2.3 es un sistema de generación de vídeo basado en difusión: un transformer principal procesa las representaciones latentes del vídeo condicionadas por embeddings de texto, y un VAE de vídeo (con encoder y decoder separados) traduce entre el espacio de píxeles y el espacio latente. El condicionamiento textual se realiza mediante Gemma-3-12B-it, un modelo de lenguaje de 12 mil millones de parámetros. El sistema incluye además un VAE de audio, un vocoder y un upsampler, lo que apunta a capacidades de generación de vídeo con audio y de superresolución o escalado espacial.

La innovación técnica de esta distribución concreta es el empaquetado para Candle: los pesos se han convertido a GGML por bloques mediante la herramienta `candle_gen::ggml_tier` del repositorio SceneWorks/inference. El tier q4 se obtuvo por conversión sin pérdida desde el tier MLX q4, mientras que el q8 se cuantizó a Q8_0 directamente desde los pesos bf16 del transformer. Los componentes conector, audio_vae, upsampler, vae_decoder, vae_encoder y vocoder permanecen densos (sin cuantizar). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de descripciones textuales, mediante el transformer de difusión condicionado por Gemma-3-12B-it.
- Codificación y decodificación de vídeo en espacio latente a través del VAE de vídeo (encoder y decoder incluidos).
- Procesamiento de audio asociado al vídeo, con VAE de audio y vocoder incluidos en el paquete.
- Escalado o superresolución mediante el upsampler incluido.
- Inferencia nativa en Rust a través de Candle, con soporte para Windows y Linux en las variantes GGML.
- Cuantización seleccionable entre q4 y q8 para ajustar el uso de memoria.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking, al tratarse de un modelo generativo de vídeo y no de un LLM conversacional.
- Capacidades multilingües: no disponibles en la información proporcionada; dependen del codificador Gemma-3-12B-it, que no forma parte de estos tiers.

## Casos de uso

- Generación de clips de vídeo a partir de prompts de texto en estaciones de trabajo Windows o Linux: el usuario ejecuta el transformer cuantizado en q4 o q8 mediante Candle, aportando por separado el codificador Gemma-3-12B-it, y obtiene vídeo decodificado por el VAE incluido. Es adecuado porque evita depender del stack MLX, reservado a macOS.
- Prototipado de pipelines de vídeo generativo en Rust: al estar empaquetado para Candle, el modelo se integra en aplicaciones Rust sin necesidad de un runtime de Python, lo que facilita su inclusión en servicios de backend con requisitos de despliegue ligeros.
- Experimentación con cuantización GGML en modelos de difusión de vídeo: la disponibilidad de tiers q4 y q8 permite comparar calidad frente a consumo de memoria en el mismo hardware, un escenario útil para investigación sobre compresión de modelos generativos.
- Generación de vídeo con pista de audio: la inclusión de VAE de audio y vocoder permite construir flujos que producen vídeo y audio sincronizados, útil en prototipos de contenido audiovisual.
- Escalado de vídeo generado o existente: el upsampler incluido permite aumentar la resolución de las salidas del VAE de vídeo, aprovechable en flujos de postproducción automatizada.
- Evaluación comparativa de backends (Candle frente a MLX): al existir tiers equivalentes en ambos ecosistemas (ltx-2.3-mlx y ltx-2.3-candle), sirve para medir latencia y calidad entre plataformas en un mismo modelo base.
- Despliegue en entornos con memoria limitada: el tier q4, derivado sin pérdida del MLX q4, reduce el espacio de pesos respecto al bf16, lo que permite ejecutar el transformer en GPUs con menos VRAM que las requeridas por el checkpoint completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma desglosada. El repositorio completo ocupa 51,4 GB e incluye los tiers q4 y q8, además de los componentes densos (VAE de vídeo, VAE de audio, upsampler, conector y vocoder). El tier q8 se deriva del transformer en bf16, por lo que su huella es aproximadamente la mitad de dicho transformer en bf16; el q4, aproximadamente un cuarto.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamano del transformer base (derivado de LTX-2.3) y la presencia de componentes densos, es previsible que requiera GPUs de centro de datos (A100, H100) o GPUs de consumo de gama alta con suficiente VRAM, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no confirmada; depende del tier elegido y del presupuesto de VRAM, que no se detalla.
- Opciones de despliegue: Candle (librería declarada, `library_name: candle`), con soporte en Windows y Linux. Para macOS se remite a los tiers MLX del repositorio SceneWorks/ltx-2.3-mlx. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SceneWorks/ltx-2.3-candle | Difusión de vídeo, empaquetado Candle | no disponible | no disponible | GGML/GGUF por bloques (q4, q8) | ltx-2-community-license | Hugging Face, 0 descargas |
| SceneWorks/ltx-2.3-mlx | Difusión de vídeo, empaquetado MLX (origen de esta conversión) | no disponible | no disponible | MLX (q4, bf16) | ltx-2-community-license (presumible, no confirmado) | Hugging Face |
| Lightricks/LTX-2.3 | Difusión de vídeo, checkpoint base | no disponible | no disponible | safetensors (bf16) | ltx-2-community-license | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros modelos de generación de vídeo en la información proporcionada.

## Limitaciones y advertencias

- El codificador de texto Gemma-3-12B-it no está incluido en estos tiers; sin él, el modelo no puede procesar prompts de texto y el usuario debe obtenerlo por separado.
- El pipeline no está declarado en Hugging Face y el repositorio no incluye una model card con instrucciones de uso detalladas, solo la descripción de la conversión.
- El tier q4 se obtuvo por conversión sin pérdida desde el MLX q4, pero la cuantización original del MLX q4 implica una pérdida de precisión respecto al bf16; el q8 se cuantizó desde bf16, con la pérdida propia de Q8_0.
- Licencia ltx-2-community-license: es una licencia comunitaria con posibles restricciones para uso comercial; debe revisarse el texto en el enlace indicado antes de cualquier despliegue en producción.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones de idioma específicas; al ser un modelo de vídeo, los riesgos se relacionan con la fidelidad del contenido generado y el uso indebido de material sintético.
- Idiomas soportados: no disponibles; dependen del codificador Gemma-3-12B-it, no incluido.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad y un riesgo elevado de problemas no documentados en la conversión.
- No se dispone de información sobre latencia, throughput ni requisitos exactos de VRAM, lo que dificulta planificar un despliegue en producción.
- El soporte se limita a Windows y Linux mediante Candle; en macOS se debe usar la variante MLX.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SceneWorks/ltx-2.3-candle
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- Codificador de texto: https://huggingface.co/google/gemma-3-12b-it
- Tier MLX de origen: https://huggingface.co/SceneWorks/ltx-2.3-mlx
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE
- Repositorio de inferencia del autor: https://github.com/SceneWorks/inference (referenciado como SceneWorks/inference en la model card)
