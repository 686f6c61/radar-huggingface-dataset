# SceneWorks/wan2.2-i2v-a14b-candle-ggml

## Resumen

`SceneWorks/wan2.2-i2v-a14b-candle-ggml` es una redistribucion en formato GGML nativo de Candle del modelo de generacion de video a partir de imagen (image-to-video, i2v) Wan 2.2 I2V A14B de Alibaba. El autor, SceneWorks, publica dos niveles de cuantizacion (q4 y q8) derivados del repositorio original `Wan-AI/Wan.2.2-I2V-A14B-Diffusers`, pensados para ejecutarse con la libreria Candle (Rust) en Windows y Linux; en macOS el autor recomienda sus variantes MLX.

El modelo base es un difusor de 14 000 millones de parametros especializado en animar una imagen de entrada siguiendo una descripcion textual. Esta version no introduce cambios en la arquitectura ni en los pesos (la cuantizacion q4 es una conversion sin perdida desde el tier MLX q4, y la q8 es una cuantizacion Q8_0 directa desde los pesos bf16), sino que empaqueta los tensores en bloques GGML consumibles por Candle, con cada capa lineal cuantizada almacenada como un unico tensor U8 de forma `[out, in/32, block_bytes]`.

Su relevancia es de infraestructura: permite desplegar un generador de video de gran tamano en entornos Rust/Candle sin depender de PyTorch, y ofrece tiers de cuantizacion que reducen el espacio en disco y la VRAM necesaria frente a los pesos bf16. El repositorio ocupa 60,2 GB e incluye el transformer, el segundo transformer (`transformer_2`), el codificador de texto y el VAE (estos dos ultimos en densidad completa).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusor (modelo base Wan 2.2 I2V A14B); pesos empaquetados en bloques GGML para Candle |
| Parametros totales | 14 000 millones (A14B, segun el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4 (Q4_1, conversion sin perdida desde MLX q4) y q8 (Q8_0 desde bf16); text_encoder y vae en densidad completa |
| Idiomas soportados | no disponible |
| Licencia | other (ver fichero `LICENSE` dentro de cada carpeta de tier; mismos terminos que el repositorio de origen) |
| Formato de pesos | safetensors + GGML (tensores U8 por capa lineal cuantizada), config.json con `quantization: {bits, storage: ggml}` |

## Arquitectura y entrenamiento

El modelo base es un difusor de 14 000 millones de parametros para generacion de video condicionada por imagen y texto. La distribucion de SceneWorks conserva la estructura del repositorio original de Wan-AI: un transformer principal (`transformer/`), un segundo transformer (`transformer_2/`), un codificador de texto y un VAE. No se documentan en la informacion disponible detalles sobre el dataset de entrenamiento, el numero de tokens, ni si hubo etapas de RLHF o DPO.

La innovacion tecnica de esta publicacion es el empaquetado: cada capa lineal cuantizada se almacena como un unico tensor U8 con forma `[out, in/32, block_bytes]`, y el `config.json` declara `quantization: {bits, storage: ggml}`. El tier q4 se obtiene por conversion sin perdida desde el tier MLX q4 del repositorio `SceneWorks/wan2.2-i2v-a14b-candle`, mientras que el q8 se cuantiza a Q8_0 directamente desde los pesos bf16 del modelo original. La herramienta de construccion es `candle_gen::ggml_tier` del repositorio `SceneWorks/inference`.

## Capacidades

- Generacion de video a partir de una imagen de entrada (image-to-video) guiada por prompt textual.
- Dos variantes de cuantizacion (q4 y q8) para ajustar el equilibrio entre calidad y requisitos de memoria.
- Ejecucion nativa en Candle (Rust) en Windows y Linux; en macOS el autor remite a sus tiers MLX.
- Codificador de texto y VAE incluidos en densidad completa, lo que permite un pipeline completo sin descargar componentes adicionales.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, audio, vision adicional ni modos de razonamiento extendido.

## Casos de uso

- Animacion de storyboards: a partir de un fotograma clave y un prompt descriptivo, el modelo genera una secuencia de video que sirve como previsualizacion animada antes de producir el plano definitivo.
- Prototipado de anuncios: convertir una imagen de producto en un clip corto para validar concepto y encuadre con el cliente antes de invertir en rodaje.
- Previsualizacion en pipelines de VFX: generar movimiento plausible sobre un frame fijo para discutir direccion de arte con el equipo de postproduccion.
- Contenido para redes sociales: animar una imagen estatica y publicar el clip resultante, usando el tier q4 para reducir el coste de inferencia en maquinas modestas.
- Integracion en herramientas Rust: al estar empaquetado para Candle, puede incorporarse en un servicio backend escrito en Rust sin introducir una dependencia de PyTorch.
- Despliegue en Windows/Linux con GPU de consumo: el tier q4 esta pensado para reducir el espacio en disco (el repositorio completo son 60,2 GB) y la VRAM frente a los pesos bf16.
- Experimentacion en investigacion: comparar la calidad de los tiers q4 y q8 sobre el mismo prompt e imagen para estudiar el impacto de la cuantizacion en la generacion de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia de orden de magnitud, el repositorio completo ocupa 60,2 GB e incluye dos transformers, codificador de texto y VAE; el tier q4 reduce el peso de las capas lineales cuantizadas frente a bf16.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: no confirmado; el autor indica que los tiers estan pensados para Windows/Linux y que macOS debe usar las variantes MLX.
- Opciones de despliegue: Candle (libreria Rust del autor), con pesos en formato GGML; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SceneWorks/wan2.2-i2v-a14b-candle-ggml | 14 000 M (A14B) | no disponible | safetensors + GGML (Candle) | other | Hugging Face |
| Wan-AI/Wan2.2-I2V-A14B-Diffusers (origen) | 14 000 M (A14B) | no disponible | safetensors (diffusers) | no disponible en esta ficha | Hugging Face |
| SceneWorks/wan2.2-i2v-a14b-candle (tiers MLX) | 14 000 M (A14B) | no disponible | MLX | other | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia es `other` y remite al fichero `LICENSE` de cada carpeta de tier; es imprescindible revisar los terminos del repositorio de origen antes de cualquier uso comercial.
- El tier q4 es una conversion sin perdida desde el tier MLX q4, no una cuantizacion directa desde bf16; la calidad final depende de la cadena de conversiones previas.
- El tier q8 se cuantiza desde bf16, por lo que puede presentar diferencias numericas respecto al modelo original en densidad completa.
- Solo se documenta soporte para Windows y Linux; en macOS el autor indica usar los tiers MLX, no estos.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion; al ser un modelo de generacion de video, el riesgo principal es la generacion de movimiento inconsistente o no fiel al prompt.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.
- No se dispone de informacion sobre latencia, throughput ni requisitos minimos de VRAM, lo que dificulta planificar un despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SceneWorks/wan2.2-i2v-a14b-candle-ggml
- Repositorio de origen del modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Repositorio de tiers MLX del mismo autor: https://huggingface.co/SceneWorks/wan2.2-i2v-a14b-candle
- Repositorio de inferencia del autor: https://github.com/SceneWorks/inference (referenciado como `SceneWorks/inference` en la model card)
- Libreria Candle: https://github.com/huggingface/candle
