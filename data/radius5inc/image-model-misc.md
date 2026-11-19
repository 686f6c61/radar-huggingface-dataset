# radius5inc/image-model-misc

## Resumen

`radius5inc/image-model-misc` no es un modelo entrenado por su autor, sino un repositorio agregador de pesos utilizados por un servicio de inferencia de edicion de imagenes. Reune en un unico lugar los ficheros necesarios para ejecutar un pipeline de difusion para edicion de imagen, en su mayoria copias sin modificar de pesos publicos de terceros, cada uno conservando la licencia de su repositorio original. La unica excepcion es `loras/haru_style_v1.safetensors`, una LoRA de estilo propia del autor.

El nucleo del pipeline es un modelo de difusion MiniMax-H3-Image, distribuido en formato cuantizado (int8 con esquema hibrido w4a8) y orientado a ComfyUI. Se complementa con un text encoder basado en Qwen3-VL de 32B en cuantizacion NVFP4 AWQ, un upsampler de prompts, un VAE en fp16 y una LoRA de destilacion (PDMD de 2 pasos, 2 NFE) para acelerar la generacion. El repositorio pesa 41,8 GB.

Su relevancia es practica: sirve como referencia reproducible (todos los ficheros estan fijados por sha256) de una combinacion concreta de pesos para edicion de imagen en produccion. No aporta arquitectura ni entrenamiento propios, y su model card es escueta en cuanto a especificaciones tecnicas del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion (DiT) para imagen, con text encoder Qwen3-VL y VAE; pipeline para ComfyUI |
| Parametros totales | no disponible (el text encoder es Qwen3-VL de 32B; el DiT no especifica recuento) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 con esquema hibrido w4a8 (DiT); NVFP4 AWQ (text encoder); w4a8 (upsampler); fp16 (VAE); safetensors sin cuantizar (LoRA de estilo) |
| Idiomas soportados | no disponible |
| Licencia | other (cada fichero conserva la licencia de su repositorio de origen; la LoRA `haru_style_v1` es del autor) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo; agrega pesos de terceros para un servicio de edicion de imagenes. La pieza central es un modelo de difusion tipo DiT (`minimax_h3_image_pruned_int8_w4a8_hybrid.safetensors`), una version podada y cuantizada a int8 con esquema hibrido w4a8, pensada para ejecucion en ComfyUI. El acondicionamiento textual corre a cargo de un text encoder Qwen3-VL de 32B en cuantizacion NVFP4 AWQ, acompanado de un upsampler de prompts (`p-h3-image_prompt_upsampler_w4a8`). El pipeline se completa con un VAE en fp16 y una LoRA de destilacion PDMD de 2 pasos (2 NFE) que permite generar con muy pocas evaluaciones del modelo.

No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF/DPO, ya que el autor solo documenta las fuentes de cada fichero. La innovacion tecnica destacable es la combinacion de cuantizaciones agresivas (int8 w4a8 en el DiT, NVFP4 AWQ en el encoder de 32B) con destilacion de pocos pasos, orientada a reducir requisitos de memoria y latencia en inferencia. Todos los ficheros estan fijados por sha256 para garantizar reproducibilidad.

## Capacidades

- Edicion de imagenes mediante difusion, a partir de un pipeline ComfyUI con DiT, VAE y text encoder.
- Acondicionamiento textual complejo gracias al text encoder Qwen3-VL de 32B, que aporta comprension de prompts e imagenes.
- Mejora y expansion de prompts mediante el upsampler dedicado (`p-h3-image_prompt_upsampler_w4a8`).
- Generacion acelerada con la LoRA de destilacion PDMD de 2 pasos (2 NFE), que reduce el numero de evaluaciones necesarias.
- Aplicacion de estilo mediante la LoRA `haru_style_v1`.
- Ejecucion en ComfyUI con pesos cuantizados para reducir huella de memoria.
- No se documentan capacidades de tool calling, agentes, audio ni modo thinking.

## Casos de uso

- Edicion de imagen en produccion: el pipeline completo (DiT cuantizado + VAE + encoder) se puede desplegar en ComfyUI para tareas de edicion por prompt, con la ventaja de que los pesos estan fijados por sha256 y son reproducibles entre entornos.
- Generacion rapida con pocos pasos: la LoRA PDMD de 2 NFE permite obtener resultados con solo dos evaluaciones del modelo, adecuada para interfaces interactivas donde la latencia importa.
- Estilizado consistente: la LoRA `haru_style_v1` aplica un estilo concreto sobre el DiT, util para mantener coherencia visual en series de imagenes.
- Prototipado de servicios de edicion: al reunir todos los componentes en un repositorio, sirve como base para montar un servicio de inferencia de edicion de imagenes sin tener que localizar cada peso por separado.
- Investigacion de cuantizacion: la combinacion de int8 w4a8 en el DiT y NVFP4 AWQ en un encoder de 32B es un caso practico para estudiar el impacto de estas cuantizaciones en calidad y memoria.
- Reproducibilidad de pipelines: los hashes sha256 permiten auditar y replicar exactamente la configuracion usada por el servicio original.
- Evaluacion de upsampling de prompts: el upsampler dedicado permite comparar como afecta la expansion de prompts a la calidad de edicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 41,8 GB y el text encoder es un Qwen3-VL de 32B en NVFP4 AWQ, lo que condiciona fuertemente la memoria necesaria.
- GPU recomendadas: no disponible; por el tamano del encoder de 32B y del DiT, se requiere hardware de gama alta (A100, H100 o equivalentes) para ejecucion comoda, aunque no hay datos oficiales.
- Cabe en GPU consumer: no disponible; el tamano total del repositorio y el encoder de 32B hacen poco probable su ejecucion integra en GPUs consumer convencionales, pero no se confirma.
- Opciones de despliegue: ComfyUI (el pipeline esta estructurado para sus directorios `comfy/diffusion_models`, `comfy/text_encoders`, `comfy/vae` y `loras`).
- Latencia y throughput estimados: no disponible; la LoRA PDMD de 2 NFE sugiere inferencia de pocos pasos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| radius5inc/image-model-misc | no disponible (encoder Qwen3-VL 32B + DiT) | no disponible | no disponible | other | Hugging Face |
| speedyrulz/minimax-h3-image-int8-w4a8-hybrid | no disponible | no disponible | no disponible | no disponible | Hugging Face (origen del DiT) |
| Comfy-Org/MiniMax-H3-Image | no disponible | no disponible | no disponible | no disponible | Hugging Face (origen de encoder y VAE) |
| PrunaAI/P-H3-Image-Comfy | no disponible | no disponible | no disponible | no disponible | Hugging Face (origen del upsampler) |

No se dispone de datos de rendimiento ni de parametros de los modelos comparables en la informacion proporcionada; la comparativa se limita a su rol como fuentes de los pesos.

## Limitaciones y advertencias

- No es un modelo propio: es un agregador de pesos de terceros, por lo que su calidad y comportamiento dependen enteramente de los modelos originales.
- Licencia `other`: cada fichero conserva la licencia de su repositorio de origen, lo que obliga a revisar individualmente cada licencia antes de cualquier uso comercial.
- La LoRA `haru_style_v1` es la unica pieza propia del autor y su licencia no se detalla mas alla de la etiqueta `other`.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion.
- No hay informacion sobre limites de contexto ni sobre el recuento de parametros del DiT.
- El tamano del repositorio (41,8 GB) y el encoder de 32B implican requisitos de almacenamiento y memoria elevados.
- La model card no incluye benchmarks ni guia de uso detallada, lo que dificulta evaluar su calidad frente a alternativas.
- Al estar orientado a ComfyUI, su integracion fuera de ese ecosistema puede requerir trabajo adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/radius5inc/image-model-misc
- Fuente del DiT: https://huggingface.co/speedyrulz/minimax-h3-image-int8-w4a8-hybrid
- Fuente del text encoder y VAE: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Fuente del upsampler: https://huggingface.co/PrunaAI/P-H3-Image-Comfy
- Fuente de la LoRA PDMD: https://huggingface.co/Iwannapose/minimax_h3_pdmd_2nfe_comfyui
