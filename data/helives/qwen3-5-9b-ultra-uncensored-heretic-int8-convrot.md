# Helives/Qwen3.5-9B-ultra-uncensored-heretic-int8-convrot

## Resumen

Helives/Qwen3.5-9B-ultra-uncensored-heretic-int8-convrot es una cuantizacion INT8 de un derivado "uncensored" de Qwen3.5-9B, empaquetada especificamente como text encoder para ComfyUI en pipelines de generacion de imagen MOSS-Image. No es un modelo de chat para uso general: es un artefacto de inferencia pensado para cargarse con el nodo `CLIPLoader` estandar y alimentar un pipeline de difusion. El autor de la cuantizacion es Helives, y el modelo base es llmfan46/Qwen3.5-9B-ultra-uncensored-heretic, que a su vez deriva de Qwen/Qwen3.5-9B.

La relevancia de esta publicacion es de infraestructura mas que de modelado: reduce el checkpoint de 17,53 GiB en bf16 a 11,09 GiB en int8 (un 37 % menos) manteniendo, segun el autor, una salida visual indistinguible del encoder en bf16. Para quienes despliegan MOSS-Image en GPU con VRAM limitada, ese ahorro de mas de 6 GiB en el text encoder libera memoria para el modelo de difusion, los LoRA y el VAE.

El modelo conserva la torre visual del base en bf16 (con una variante alternativa que tambien la cuantiza), lo que deja abierta la puerta a uso condicionado por imagen en el futuro, aunque el autor lo presenta explicitamente como text encoder y advierte de que no debe esperarse calidad de generacion de texto comparable al base en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con atencion completa y capas GDN (Gated DeltaNet), segun el desglose de lineales del autor (24 GDN × 5, 8 full-attention × 4, 32 MLP × 3) |
| Parametros totales | 9B (heredado del nombre del modelo base; no se detalla en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 tensorwise con escala fp32 por fila, rotacion Hadamard por grupos de 256 columnas (`convrot_groupsize: 256`); receta GPTQ (block 128, damp 0.01, act-order) + SmoothQuant α=0.5 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con la convencion de lineales cuantizados de ComfyUI (`weight` int8, `weight_scale` fp32, `comfy_quant` uint8) |

## Arquitectura y entrenamiento

El checkpoint cuantiza 248 lineales del modelo de lenguaje: 24 capas GDN por 5 lineales, 8 capas de atencion completa por 4 lineales y 32 capas MLP por 3 lineales. Esa distribucion confirma una arquitectura hibrida en la que conviven capas de atencion completa con capas GDN, un mecanismo de atencion lineal recurrente que reduce el coste cuadratico en contextos largos. La torre visual se mantiene en bf16 en el fichero principal y existe un fichero alternativo que la cuantiza tambien a int8.

El proceso de cuantizacion combina GPTQ con SmoothQuant: GPTQ minimiza el error de reconstruccion capa a capa con bloques de 128 columnas y orden de activaciones, mientras que SmoothQuant (α=0.5) migra la dificultad de cuantizacion de las activaciones a los pesos. La calibracion se hizo con 96 captions de MOSS-Image mas 16 prompts vacios, lo que orienta el encoder hacia el dominio de descripciones de imagen. Las normas en las que SmoothQuant pliega escalas se guardan en bf16, igual que el embedding, los `conv1d`, `A_log`, `dt_bias` y la torre visual. La rotacion Hadamard por grupos de 256 columnas es la innovacion clave del formato `convrot` de ComfyUI: dispersa los valores atipicos antes de cuantizar, lo que permite un grid int8 por fila sin degradar la salida.

## Capacidades

- Codificacion de texto para pipelines de generacion de imagen MOSS-Image en ComfyUI, cargable con el nodo `CLIPLoader` estandar (`type: moss_image`) y con `SmartCLIPLoader`.
- Seleccion automatica de la ruta W8A8 (`comfy_kitchen.int8_linear`) a partir del metadato `comfy_quant` del fichero.
- Salida pixel-identica entre `CLIPLoader` y `SmartCLIPLoader` sobre este mismo fichero, segun el autor.
- Conservacion de la torre visual en bf16 para un eventual uso condicionado por imagen (no validado en la model card).
- No es un modelo de chat: no se documentan capacidades de generacion de texto, razonamiento, codigo, tool calling ni agentes para este artefacto.
- El modelo base es un derivado "abliterated/uncensored", por lo que el encoder puede arrastrar esa ausencia de filtros en su representacion semantica.

## Casos de uso

- Generacion de imagen en ComfyUI con VRAM ajustada: sustituir el text encoder bf16 de MOSS-Image por este fichero int8 libera unos 6,4 GiB de memoria, suficiente para subir la resolucion de salida o cargar LoRA adicionales en la misma GPU.
- Pipelines de difusion en produccion con requisitos de latencia: al reducir el peso del encoder en memoria, se disminuye la presion sobre el ancho de banda de memoria durante la carga y se acelera el arranque del grafo frente al checkpoint bf16.
- Despliegue en GPU de gama consumer con 16-24 GB: el encoder int8 de 11,09 GiB deja margen para el modelo de difusion y el VAE en tarjetas como RTX 4080/4090, escenario inviable con el encoder en bf16 en algunos casos.
- Experimentacion con estilos anime: la calibracion se hizo sobre captions de estilo anime, por lo que es el dominio donde la fidelidad respecto a bf16 esta mejor caracterizada.
- Evaluacion de tecnicas de cuantizacion: el fichero sirve como referencia reproducible de la receta GPTQ + SmoothQuant + convrot aplicada a un encoder multimodal, con metricas MAE y PSNR publicadas frente a RTN int8.
- Base para futuros pipelines image-to-text o image-conditioned: la torre visual en bf16 permite explorar entrada de imagen sin recuantizar, aunque el autor no valida ese uso.

## Benchmarks y rendimiento

Evaluacion del autor con el mismo prompt, semilla, modelo base (`moss_image_base_bf16`), LoRA, resolucion 1024×1536, 50 pasos, cfg 6, sampler `er_sde` + `sgm_uniform`, comparando contra el encoder en bf16:

| Encoder | MAE vs bf16 | PSNR |
|---|---|---|
| RTN int8 (248 lineales) | 16,85 / 255 | 18,44 dB |
| GPTQ + SmoothQuant (este fichero) | 16,38 / 255 | 18,91 dB |

El autor reporta que composicion, estilo, detalle y anatomia son indistinguibles de bf16, con un incremento sistematico de exposicion del +6,3 % (+16/255, uniforme en R/G/B) atribuido a la cuantizacion de activaciones W8A8 que ComfyUI aplica en carga, no al grid de pesos. GPTQ mejora el error de salida en el lado de pesos entre 10 y 20 veces (de 1e-5–1e-4 con RTN a 1e-6–1e-5), pero solo mueve los pixeles un 2,8 %. No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el encoder: 11,09 GiB en int8 (frente a 17,53 GiB en bf16), mas el overhead de activaciones y contexto del pipeline.
- VRAM total del pipeline: no disponible; depende del modelo de difusion MOSS-Image, el VAE y los LoRA cargados en paralelo.
- GPU recomendadas: no especificadas por el autor. Por tamano, encaja en tarjetas de 24 GB (RTX 4090, L4, A10G) y, con cuantizacion adicional del resto del pipeline, en 16 GB.
- Cabe en GPU consumer: si, en el rango de 16-24 GB, siempre que el resto del pipeline quepa en la VRAM restante.
- Opciones de despliegue: ComfyUI exclusivamente, via `CLIPLoader` o `SmartCLIPLoader` con `type: moss_image`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ni tendria sentido al ser un text encoder de difusion.
- Latencia y throughput: no disponibles de forma absoluta; el autor solo publica comparativas relativas de calidad de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Uso previsto | Licencia |
|---|---|---|---|---|---|
| Este modelo (Helives int8 convrot) | 9B | safetensors int8 ComfyUI | 11,09 GiB | Text encoder MOSS-Image en ComfyUI | Apache 2.0 |
| llmfan46/Qwen3.5-9B-ultra-uncensored-heretic | 9B | safetensors bf16 | 17,53 GiB | Modelo base, uso general | Apache 2.0 |
| Comfy-Org/MOSS-Image `qwen3.5_9b_int8_convrot` | 9B | safetensors int8 ComfyUI | no disponible | Text encoder MOSS-Image de referencia | no disponible |
| Variante RTN int8 del mismo autor | 9B | safetensors int8 | no disponible | Referencia de cuantizacion sin GPTQ | Apache 2.0 |

La comparacion relevante es contra el encoder oficial de Comfy-Org y contra el base en bf16; frente a este ultimo, la ganancia es de tamano (37 % menos) con una perdida de fidelidad de pixel medida en 16,38/255 de MAE. No se dispone de datos para comparar contra el encoder oficial de Comfy-Org mas alla de que este fichero sigue su mismo formato de referencia.

## Limitaciones y advertencias

- No es un modelo de chat: la calidad de generacion de texto no es comparable a la del base en bf16 y el autor lo desaconseja explicitamente para ese uso.
- El redondeo de activaciones no se modela durante GPTQ; las variantes `act_aware` se probaron y produjeron deriva inestable en multiples capas, por lo que no se incluyen.
- La calibracion se hizo sobre trafico de captions de estilo anime; otros dominios pueden desviarse mas respecto a bf16.
- Existe un sesgo sistematico de exposicion de +6,3 % (+16/255) en la imagen generada, atribuido a la cuantizacion W8A8 en carga; requiere ajuste de prompt o correccion global de exposicion si es relevante.
- El modelo base es un derivado "uncensored/abliterated": las salidas pueden incluir contenido explicito y el usuario es responsable del cumplimiento legal en su jurisdiccion.
- Licencia Apache 2.0 heredada del base, sin restricciones adicionales documentadas para uso comercial, pero conviene verificar la licencia del modelo Qwen3.5-9B original enlazada en la model card.
- Dependencia total del ecosistema ComfyUI: no hay ruta de inferencia documentada fuera de el, lo que limita la portabilidad.
- Sin descargas ni likes en el momento de la consulta, y sin validacion independiente de las metricas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Helives/Qwen3.5-9B-ultra-uncensored-heretic-int8-convrot
- Modelo base: https://huggingface.co/llmfan46/Qwen3.5-9B-ultra-uncensored-heretic
- Modelo Qwen3.5-9B original y licencia: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Referencia de formato (encoder oficial MOSS-Image): https://huggingface.co/Comfy-Org/MOSS-Image
- Implementacion de la cuantizacion (anima_lora): https://github.com/sorryhyun/anima_lora
