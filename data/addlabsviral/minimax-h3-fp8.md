# addlabsviral/minimax-h3-fp8

## Resumen

minimax-h3-fp8 es una cuantizacion en FP8 del modelo MiniMax-H3, publicada por el usuario addlabsviral en Hugging Face. Se trata de una version con pesos cuantizados a FP8 (weight-only, formato e4m3 mediante torchao Float8WeightOnlyConfig) del transformer del pipeline MiniMax-H3, manteniendo el computo en bf16. El objetivo es reducir el peso en memoria del modelo para facilitar su despliegue en hardware con VRAM limitada sin reentrenar.

El modelo upstream, MiniMax-H3, es un pipeline de difusion (diffusers) orientado a generacion de video, con un transformer principal de aproximadamente 33.100 millones de parametros y un text encoder basado en Qwen3-VL. Esta version FP8 incluye el transformer FL2VA/i2v con un turbo LoRA ya fusionado en los pesos (heredado de addlabsviral/minimax-h3-combined), mientras que VAE, schedulers, tokenizer y processor permanecen intactos en bf16.

La relevancia actual de esta ficha radica en que permite ejecutar un modelo de video de gran tamano con un footprint de pesos reducido a la mitad respecto a bf16, a costa de una licencia comunitaria especifica (minimax-community-license) que condiciona el uso comercial. El repo ocupa 266,7 GB e incluye particiones adicionales en preparacion (text_encoder y un segundo transformer).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (pipeline diffusers MiniMaxH3ModularPipeline); cuantizacion FP8 weight-only sobre transformer |
| Parametros totales | 33.122.993.246 (segun safetensors) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 weight-only (torchao Float8WeightOnlyConfig, e4m3); computo en bf16; resto de componentes en bf16 |
| Idiomas soportados | no disponible |
| Licencia | minimax-community-license (license: other) |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un pipeline de difusion modular (diffusers:MiniMaxH3ModularPipeline) con un transformer principal de aproximadamente 33.100 millones de parametros. La version publicada en este repo aplica cuantizacion FP8 weight-only con torchao (Float8WeightOnlyConfig, formato e4m3) exclusivamente sobre los pesos del transformer FL2VA/i2v, manteniendo el computo en bf16. El resto de componentes del pipeline (VAE, schedulers, tokenizer, processor) permanecen sin tocar y en bf16.

El transformer incluye un turbo LoRA ya fusionado en los pesos, heredado de addlabsviral/minimax-h3-combined. El text encoder esta basado en Qwen3-VL, aunque segun la model card las particiones del text_encoder y del segundo transformer estan pendientes de publicacion en el mismo repo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto e imagen: el pipeline soporta los flujos FL2VA (texto a video con audio) e i2v (imagen a video), segun la model card.
- Integracion con diffusers: se carga mediante ModularPipeline con workflow "fl2va".
- Cuantizacion transparente: el transformer carga FP8 automaticamente a traves de su config.json (torchao).
- Turbo LoRA fusionado: los pesos incluyen el LoRA de aceleracion ya integrado, lo que reduce pasos de inferencia (segun la model card).
- Text encoder Qwen3-VL: el pipeline incorpora un encoder multimodal Qwen3-VL (particion pendiente de publicacion en este repo).
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de video a partir de texto en produccion: el modelo permite crear clips con audio desde prompts de texto usando el workflow FL2VA, con un footprint de pesos FP8 que reduce la VRAM necesaria frente a la version bf16.
- Animacion de imagenes (image-to-video): el flujo i2v permite animar fotos o ilustraciones, util para marketing, previsualizacion de storyboards o creacion de contenido para redes.
- Prototipado rapido en equipos con GPU limitadas: al cargar los pesos en FP8 y computar en bf16, se puede desplegar en GPUs de 80 GB o configuraciones multi-GPU sin necesidad de infraestructura de 8xH100.
- Investigacion en cuantizacion de modelos de difusion: sirve como referencia para estudiar el impacto de FP8 weight-only en calidad de video y latencia, comparando con el modelo original.
- Pipelines de creacion de contenido automatizado: integrable en flujos que generan clips cortos con audio a partir de descripciones textuales, con el turbo LoRA fusionado reduciendo el numero de pasos.
- Evaluacion de licencias comunitarias: util para equipos que necesitan valorar el uso del modelo bajo minimax-community-license antes de adoptarlo en productos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos FP8 (aproximadamente 33,1 GB solo el transformer) mas el text encoder Qwen3-VL y el VAE en bf16, se estima un minimo practico de 48-80 GB de VRAM; no disponible dato oficial.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU; no disponible recomendacion oficial del autor.
- Cabe en consumer GPU: no es viable en GPUs de consumo de 24 GB (RTX 4090) por el tamano del transformer y del text encoder; no disponible confirmacion.
- Opciones de despliegue: diffusers (ModularPipeline), con soporte de torchao para la carga FP8; vLLM, llama.cpp, Ollama y TGI no aplican a este pipeline de difusion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| minimax-h3-fp8 (este) | 33.122.993.246 | no disponible | minimax-community-license | safetensors (FP8) | Hugging Face, 214 descargas |
| MiniMaxAI/MiniMax-H3 (upstream) | no disponible en la informacion | no disponible | minimax-community-license | safetensors (bf16) | Hugging Face (referencia en model card) |
| addlabsviral/minimax-h3-combined | no disponible | no disponible | no disponible | safetensors | Hugging Face (referencia en model card) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: minimax-community-license condiciona el uso comercial; es necesario revisar el texto completo antes de desplegar en produccion.
- Cuantizacion FP8 weight-only: puede introducir degradacion de calidad en el video generado respecto a la version bf16; no hay datos publicados de la magnitud de esa perdida.
- Particiones incompletas: el repo indica que el text_encoder (Qwen3-VL) y el segundo transformer estan pendientes de publicacion, por lo que el pipeline completo puede no ser funcional con esta unica descarga.
- Repo de 266,7 GB: requiere almacenamiento considerable y descarga prolongada.
- Sin datos de sesgos, alucinacion o idiomas: la model card no documenta evaluaciones de sesgo, seguridad ni cobertura linguistica.
- Autor no verificado: el repo pertenece a un usuario comunitario (addlabsviral) y no al desarrollador original (MiniMaxAI); conviene validar la integridad de los pesos frente al upstream.
- Sin benchmarks: no hay evidencia publicada de calidad o latencia frente a alternativas.

## Enlaces

- Repo Hugging Face: https://huggingface.co/addlabsviral/minimax-h3-fp8
- Modelo upstream: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repo base del LoRA combinado: https://huggingface.co/addlabsviral/minimax-h3-combined
