# LSDJesus/MiniMax-H3-Image-fp8-nvfp4

## Resumen

MiniMax-H3-Image fp8 scaled y NVFP4 es un repositorio de cuantizaciones del transformer de difusion MiniMax-H3-Image, un modelo de generacion y edicion de imagenes desarrollado por MiniMax. El autor de estas cuantizaciones es el usuario de Hugging Face LSDJesus, que las publica como ficheros unicos compatibles con ComfyUI. El objetivo es reducir los requisitos de memoria del modelo original en bf16 para que pueda ejecutarse en GPUs de consumo y en aceleradores Blackwell con soporte nativo de FP4.

El repositorio ofrece dos precisiones: una version fp8 e4m3 con una escala por tensor de pesos (21,0 GB) y una version NVFP4 con valores E2M1 y escalas e4m3 por bloque de 16 (12,5 GB). Ambas son sustituciones directas de los ficheros de Comfy-Org, con el mismo diseno de capas, el mismo cargador y el mismo flujo de trabajo. Se cuantizan 200 capas (95,8 % de los pesos): las proyecciones `qkv_proj`, `out_proj`, `mlp.fc1` y `mlp.fc2` de los 50 bloques del transformer.

La relevancia actual es practica: el modelo base mantiene en bf16 el refinador de tokens, la proyeccion de condicion, la base adaLN, las proyecciones de patch y salida y todas las normas, de modo que estas cuantizaciones preservan esos componentes criticos y solo comprimen las capas densas. El modelo base emplea un programador PDD de 6 pasos, lo que reduce el coste de muestreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con 50 bloques; modelo base MiniMax-H3-Image |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; el codificador de texto es `qwen3vl_32b_minimax_h3_nvfp4_awq` o `_int8_convrot`) |
| Tipos de cuantizacion | fp8 e4m3 con una escala por tensor; NVFP4 (E2M1 con escala e4m3 por bloque de 16 y escala global por tensor) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3-Image Community License Agreement (uso restringido fuera de la UE, Reino Unido, Corea del Sur y EE. UU.) |
| Formato de pesos | safetensors de fichero unico para ComfyUI (`diffusion-single-file`); existen versiones GGUF en otro repositorio del mismo autor |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusion para generacion y edicion de imagenes, con 50 bloques y proyecciones fusionadas `qkv_proj`, `out_proj`, `mlp.fc1` y `mlp.fc2`. Estas cuantizaciones no reentrenan el modelo: parten del fichero `minimax_h3_image_pruned_bf16.safetensors` de Comfy-Org y aplican cuantizacion post-entrenamiento. Se mantienen intactos el refinador de tokens, la proyeccion de condicion, la base de curva temporal adaLN, las proyecciones de patch y salida y todas las normas, ademas del ajuste int8 de atencion por bloque y los metadatos `config` con el programador PDD de 6 pasos.

La version fp8 usa pesos e4m3 con una escala por tensor y cuantiza las activaciones al vuelo, sin escalas calibradas. La capa `mlp.fc2` lleva la etiqueta `full_precision_matrix_mult` (pesos fp8, multiplicacion matricial en bf16) porque sus entradas presentan valores atipicos que la escala fp8 por tensor de ComfyUI no puede absorber; sin esa etiqueta el resultado se desviaba mas que NVFP4. La version NVFP4 usa valores E2M1 con una escala e4m3 por bloque de 16 y una escala global por tensor, generada con el cuantizador comfy-kitchen de ComfyUI. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens ni el uso de RLHF o DPO.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con resoluciones de hasta 2048x2048 en los ejemplos publicados.
- Edicion de imagenes, segun las etiquetas del repositorio (`image-editing`).
- Muestreo con programador PDD de 6 pasos, incluido en los metadatos de configuracion.
- Integracion directa en ComfyUI mediante la plantilla MiniMax H3 Image y el nodo Load Diffusion Model.
- Ejecucion nativa en GPUs RTX 40 y RTX 50 para fp8, y en RTX 50 y otras Blackwell para NVFP4; en GPUs sin soporte nativo ComfyUI ejecuta el formato con menor velocidad.
- Soporte de texto en las imagenes generadas: la model card evalua la calidad comparando texto y texturas, e indica que en fp8 sin la etiqueta `full_precision_matrix_mult` el texto salia mal escrito.
- No se documentan capacidades de tool calling, agentes, audio ni modo de razonamiento.

## Casos de uso

- Generacion de imagenes en estaciones de trabajo con RTX 4090 o RTX 5090: la version fp8 de 21,0 GB permite cargar el modelo en GPUs de consumo de 24 GB o mas y generar a 2048x2048 con el programador de 6 pasos.
- Despliegue en Blackwell con NVFP4: el fichero de 12,5 GB reduce la huella de memoria y alcanza 3,4 pasos/s en una RTX PRO 6000 Blackwell, adecuado para iterar rapidamente sobre prompts.
- Prototipado de flujos de edicion de imagenes en ComfyUI: al ser sustituciones directas de los ficheros de Comfy-Org, se puede cambiar la precision sin modificar el grafo ni el cargador.
- Generacion de material grafico con texto integrado (carteles, rotulos): la model card evalua explicitamente la ortografia en las imagenes y la version NVFP4 mantiene mejor la fidelidad que fp8 en ese aspecto.
- Comparacion de precisiones en investigacion: el repositorio incluye renders comparativos con semilla 42 a 2048x2048 y 6 pasos frente a int8 ConvRot, utiles para estudiar el impacto de la cuantizacion en la composicion.
- Produccion con restricciones de VRAM: NVFP4 permite ejecutar el modelo en GPUs de 16 GB o menos si ComfyUI descarga capas, a costa de velocidad.
- Evaluacion de licencias antes de uso comercial: el caso de uso debe filtrarse por la restriccion geografica de la licencia (fuera de UE, Reino Unido, Corea del Sur y EE. UU.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta velocidades de muestreo a 2048x2048 en una RTX PRO 6000 Blackwell:

| Fichero | Formato | Tamano | Pasos/s |
|---|---|---|---|
| `minimax_h3_image_pruned_fp8_scaled.safetensors` | fp8 e4m3, escala por tensor | 21,0 GB | 2,1 |
| `minimax_h3_image_pruned_nvfp4.safetensors` | NVFP4 | 12,5 GB | 3,4 |
| int8 ConvRot de Comfy-Org (referencia) | int8 | no disponible | 2,6 |
| w4a8 de Comfy-Org (referencia) | w4a8 | no disponible | 2,5 |

## Requisitos de hardware

- VRAM estimada: 21,0 GB para fp8 y 12,5 GB para NVFP4 solo en pesos del transformer; hay que sumar el codificador de texto (`qwen3vl_32b_minimax_h3_nvfp4_awq` o `_int8_convrot`) y el VAE (`minimax_h3_image_vae_fp16`).
- GPUs recomendadas: RTX 40 y RTX 50 para fp8; RTX 50 y otras Blackwell para NVFP4 con soporte nativo. En GPUs sin soporte nativo del formato, ComfyUI lo ejecuta con menor velocidad.
- Cabe en GPU de consumo: fp8 requiere al menos 24 GB (RTX 4090, RTX 5090); NVFP4 de 12,5 GB puede caber en GPUs de 16 GB con descarga de capas.
- Despliegue: ComfyUI 0.44 o superior (soporte de MiniMax-H3-Image integrado el 10 de noviembre de 2026), con los ficheros en `models/diffusion_models/` y la plantilla MiniMax H3 Image.
- Latencia y throughput: 2,1 pasos/s en fp8 y 3,4 pasos/s en NVFP4 a 2048x2048 en RTX PRO 6000 Blackwell; no se dispone de datos para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image fp8 scaled (este repo) | no disponible | no disponible | 2,1 pasos/s a 2048x2048 en RTX PRO 6000 | MiniMax-H3-Image Community License | Hugging Face, 21,0 GB |
| MiniMax-H3-Image NVFP4 (este repo) | no disponible | no disponible | 3,4 pasos/s a 2048x2048 en RTX PRO 6000 | MiniMax-H3-Image Community License | Hugging Face, 12,5 GB |
| MiniMax-H3-Image int8 ConvRot (Comfy-Org) | no disponible | no disponible | 2,6 pasos/s a 2048x2048 en RTX PRO 6000 | MiniMax-H3-Image Community License | Hugging Face |
| MiniMax-H3-Image w4a8 (Comfy-Org) | no disponible | no disponible | 2,5 pasos/s a 2048x2048 en RTX PRO 6000 | MiniMax-H3-Image Community License | Hugging Face |
| MiniMax-H3-Image GGUF (LSDJesus) | no disponible | no disponible | no disponible | MiniMax-H3-Image Community License | Hugging Face |

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax-H3-Image Community License Agreement solo concede derechos fuera de la Union Europea, el Reino Unido, Corea del Sur y los Estados Unidos (secciones I.5 y II), e incluye una politica de uso aceptable. Hay que leerla antes de descargar y antes de cualquier uso comercial.
- Al ser cuantizaciones, la composicion cambia ligeramente respecto al bf16 con cualquier modificacion de los pesos; la model card advierte que diferencias de pose y disposicion son normales en un modelo de 6 pasos.
- La version fp8 puede degradar el texto y las texturas si se elimina la etiqueta `full_precision_matrix_mult` de `mlp.fc2`; el autor documenta que sin ella el sujeto cambiaba y el texto salia mal escrito.
- Riesgo de alucinacion visual: no se documentan metricas de fidelidad ni evaluaciones sistematicas; solo hay dos renders comparativos (prompt de plantilla y un mercado de frutas).
- No se dispone de informacion sobre sesgos, idiomas soportados ni limitaciones de contexto del codificador de texto.
- Requiere ComfyUI 0.44 o superior y los ficheros de codificador de texto y VAE de Comfy-Org; no es un modelo autonomo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo de difusion de imagenes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LSDJesus/MiniMax-H3-Image-fp8-nvfp4
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Ficheros de referencia de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Versiones GGUF del mismo autor: https://huggingface.co/LSDJesus/MiniMax-H3-Image-GGUF
