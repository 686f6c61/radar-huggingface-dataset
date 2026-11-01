# GoldfingerCH/Image-2.1-abliterated-NVFP4

## Resumen

Image-2.1-abliterated-NVFP4 es un checkpoint cuantizado en NVFP4 de Qwen-Image-2.1, un modelo de difusion texto-a-imagen desarrollado originalmente por el equipo Qwen de Alibaba. La version que nos ocupa, publicada por el usuario GoldfingerCH, incorpora una edicion de comportamiento en el espacio de pesos: se ha fusionado un adaptador de rango 128 (abliterated) en el transformer de difusion para eliminar buena parte del filtrado de rechazo del modelo original. El resultado se ha empaquetado para su despliegue con vLLM-Omni sobre hardware NVIDIA Blackwell, incluyendo DGX Spark (GB10).

El modelo resuelve la necesidad de disponer de un checkpoint de Qwen-Image-2.1 ejecutable en GPUs de gama Blackwell con cuantizacion de 4 bits (NVFP4), manteniendo las proyecciones criticas en BF16. Cuenta con aproximadamente 4.440 millones de parametros en el transformer de difusion y un repositorio de 23,7 GB que incluye el pipeline completo (text encoder, VAE y DiT). No es un modelo nuevo entrenado desde cero: es una edicion de pesos mas una cuantizacion, tal como declara el autor.

Su relevancia es doble. Por un lado, demuestra el flujo de cuantizacion NVFP4 con NVIDIA ModelOpt aplicado a un modelo de difusion de gran tamano y su integracion en vLLM-Omni. Por otro, al eliminar los mecanismos de rechazo, se posiciona explicitamente como herramienta de investigacion para interpretabilidad, evaluacion de robustez y red-teaming, no para produccion ni despliegue final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con text encoder y VAE; pipeline QwenImage21Pipeline |
| Parametros totales | 4.443.353.088 (transformer de difusion, dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, grupo 16, bloques 2-29); BF16 en bloques 0, 1, 30, 31 y proyecciones de frontera (img_in, txt_in, modulation, time_text_embed, norm_out, proj_out) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research-license (Qwen Research License Agreement, 20 de septiembre de 2026) |
| Formato de pesos | safetensors con esquema ModelOpt NVFP4 para diffusers; no es GGUF ni compatible con ComfyUI |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un pipeline de difusion texto-a-imagen compuesto por un transformer de difusion (DiT), un text encoder y un VAE. Sobre esta base, el autor realizo dos operaciones. Primero, fusiono un adaptador de rango 128, correspondiente al paso 32.000 del LoRA `chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1`, en 224 modulos del DiT a escala 1.0. El text encoder y el VAE se mantienen con los pesos originales sin modificacion. Segundo, cuantizo el DiT a NVFP4 mediante NVIDIA ModelOpt 0.47.0 con algoritmo `max`, dejando los bloques 0, 1, 30, 31 y las proyecciones de frontera en BF16 para preservar estabilidad numerica.

La calibracion de la cuantizacion se realizo con 16 prompts a 1024x1024 y 16 pasos de inferencia. El transformer cuantizado ocupa aproximadamente 5,5 GB, mientras que el pipeline completo alcanza unos 23 GB. El archivo `transformer/config.json` declara `quant_method: modelopt` y `quant_algo: NVFP4`; el autor advierte explicitamente de que no debe pasarse `--quantization fp8` y de que `diffusers.from_pretrained` aun no carga este esquema NVFP4. No se especifica el volumen de datos de entrenamiento del modelo base ni si hubo RLHF o DPO en esta edicion, ya que la modificacion es puramente una fusion de pesos.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales mediante el endpoint `POST /v1/images/generations`.
- Edicion de imagenes mediante el endpoint `POST /v1/images/edits`.
- Ejecucion de prompts que el modelo original Qwen-Image-2.1 rechazaria o dejaria en blanco, al haberse eliminado buena parte del filtrado de rechazo.
- Inferencia cuantizada en 4 bits sobre hardware Blackwell (sm_121), incluyendo DGX Spark / GB10.
- Control del numero de pasos de inferencia por peticion (`num_inference_steps`) y de la escala de classifier-free guidance (`true_cfg_scale`).
- Soporte de prompt negativo para guiado condicional.
- No dispone de capacidades de tool calling, agentes, razonamiento multi-paso, audio ni vision mas alla del propio pipeline de difusion.

## Casos de uso

- Investigacion en interpretabilidad de modelos de difusion: el checkpoint permite estudiar como la eliminacion del filtrado de rechazo afecta a la distribucion de salidas y a la representacion interna del DiT, comparando directamente con el modelo base.
- Evaluacion de robustez y red-teaming: util para medir la eficacia de los sistemas de moderacion y para identificar categorias de prompts que un modelo alineado rechaza pero este acepta, en un entorno controlado.
- Estudio de cuantizacion NVFP4 en difusion: permite comparar la calidad de imagen entre el modelo en BF16 y la version NVFP4 con calibracion de 16 prompts, evaluando el impacto de dejar ciertos bloques en BF16.
- Pruebas de despliegue en vLLM-Omni sobre DGX Spark: sirve como caso de referencia para validar el servidor `vllm-omni:qwen-image21` y los endpoints de generacion y edicion en hardware GB10.
- Experimentos controlados de edicion de imagenes: el endpoint de edicion permite probar transformaciones sobre imagenes de entrada dentro de un protocolo de investigacion acotado.
- Benchmarking de latencia y throughput en Blackwell: aunque el autor indica que aun no se ha medido el rendimiento bajo vLLM-Omni en DGX Spark, el checkpoint esta preparado para ese tipo de mediciones con distintos numeros de pasos y escalas de guiado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el checkpoint se construyo en una DGX Spark pero que aun no se ha medido su latencia bajo vLLM-Omni en esa maquina.

## Requisitos de hardware

- VRAM estimada: el transformer cuantizado ocupa unos 5,5 GB; el pipeline completo unos 23 GB, por lo que se recomienda disponer de al menos 24 GB de VRAM para cargar todos los componentes.
- GPU recomendadas: NVIDIA Blackwell (sm_121), incluyendo DGX Spark / GB10. El formato NVFP4 esta pensado para esta generacion de hardware.
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte en RTX 4090 u otras arquitecturas consumer.
- Opciones de despliegue: vLLM-Omni mediante la imagen `vllm/vllm-omni:qwen-image21` y el comando `vllm serve ... --omni`. No es compatible con ComfyUI, GGUF ni con `diffusers.from_pretrained` en su estado actual.
- Latencia y throughput: no disponibles; el autor no ha publicado mediciones.
- Parametros de inferencia recomendados: 40 pasos y `true_cfg_scale` 1.0 sin prompt negativo para el checkpoint original; 25 pasos, `true_cfg_scale` 4.0 y prompt negativo de un solo espacio para el adaptador evaluado. El servidor usa 50 pasos por defecto, y enviar una escala superior a 1 sin prompt negativo duplica el computo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Image-2.1-abliterated-NVFP4 | 4.443 M (DiT) | no disponible | safetensors NVFP4 (ModelOpt) | qwen-research-license | HuggingFace, 17 descargas |
| Qwen/Qwen-Image-2.1 (base) | no disponible en la informacion | no disponible | safetensors BF16 | qwen-research-license | HuggingFace (modelo base) |
| chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1 | adaptador rango 128 | no aplica | LoRA | no disponible | HuggingFace (adaptador de origen) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El filtrado de rechazo se ha eliminado en gran medida, por lo que el modelo carece de guardarrailes integrados y respondera a prompts que el modelo original rechazaria.
- El autor lo restringe a investigacion legitima (interpretabilidad, robustez, red-teaming y experimentos controlados) y prohibe su despliegue a usuarios finales o en produccion sin capas propias de seguridad y moderacion.
- La licencia Qwen Research License Agreement limita el uso a investigacion y evaluacion; el uso comercial requiere una licencia separada de Qwen. La redistribucion debe conservar `LICENSE` y `Notice`, y los productos deben mostrar "Built with Qwen".
- Riesgo de alucinacion y de generar contenido no deseado o sensible, agravado por la ausencia de filtrado.
- No es compatible con ComfyUI, GGUF ni con la carga estandar de diffusers para este esquema NVFP4, lo que limita las herramientas disponibles.
- La cuantizacion NVFP4 puede introducir degradacion de calidad respecto al modelo en BF16; no se han publicado evaluaciones cuantitativas de esa perdida.
- El rendimiento real en DGX Spark no ha sido medido por el autor.
- No se documentan sesgos especificos ni cobertura idiomatica del modelo.
- El autor y los uploaders declinan toda responsabilidad por el uso indebido o los danos derivados.

## Enlaces

- HuggingFace: https://huggingface.co/GoldfingerCH/Image-2.1-abliterated-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Adaptador de origen: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1
- Imagen de despliegue: `vllm/vllm-omni:qwen-image21` (Docker Hub)
- Licencia: archivo `LICENSE` incluido en el repositorio del modelo
