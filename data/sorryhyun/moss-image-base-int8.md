# sorryhyun/MOSS-Image-Base-int8

## Resumen

MOSS-Image-Base-int8 es una cuantizacion INT8 del modelo de difusion (DiT) MOSS-Image Base, publicado por el usuario sorryhyun a partir del modelo original de OpenMOSS-Team. No es un modelo nuevo, sino una conversion de los pesos del transformer de difusion a int8 mediante GPTQ con rotacion Hadamard (ConvRot) por grupos de 256 columnas, empaquetada en un unico fichero safetensors de 5,04 GiB. El objetivo es reducir la huella de memoria y acelerar la generacion de imagenes en GPUs de consumo.

El modelo resuelve el problema del coste de inferencia del DiT original: en bf16, generar una imagen de 1024x1024 pico 10,7 GiB de VRAM y tarda 21,6 s en una RTX 5070 Ti, mientras que la version int8 baja a 6,3 GiB y 11,3 s. Los 252 bloques lineales del DiT (q, k, v, o, ffn_up_gate y ffn_down) se almacenan en int8 (4,43 GiB) y el resto de componentes (embedders, modulacion, normas y head) se mantienen en bf16 (0,60 GiB).

Es relevante porque permite ejecutar un modelo de difusion de alta resolucion en tarjetas de 8-16 GB, aunque con una perdida medible de precision frente a bf16 cuando se usa en solitario. La licencia es Apache-2.0, heredada de MOSS-Image.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) cuantizado, derivado de MOSS-Image Base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no de texto) |
| Tipos de cuantizacion | INT8 GPTQ (block 128, damping 0.01, activation-ordered) con ConvRot; resto en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout `int8_tensorwise` + `convrot` de ComfyUI) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Diffusion Transformer (DiT) del modelo MOSS-Image Base, orientado a generacion text-to-image e image-to-image. Esta version no reentrena el modelo: aplica cuantizacion GPTQ offline bloque a bloque (block size 128), de modo que cada bloque cuantizado alimenta al siguiente. Cada peso lineal se rota por grupos de 256 columnas mediante una matriz de Hadamard (ConvRot) y se almacena en int8 con una `weight_scale` fp32 por fila de salida. Los embedders, la modulacion, las normas y la head se conservan en bf16.

El proceso de calibracion utilizo 233 imagenes (t2i e i2i combinadas, 466 muestras con caption y con prompt vacio saltando el bloque 22 como hace CFG), con valores de sigma muestreados del schedule de inferencia de 50 pasos y shift 5. El fichero incluye un `base_fingerprint` en la cabecera que lo vincula al DiT original y un `int8_id` que identifica sus tensores int8. No se dispone de informacion sobre el entrenamiento original de MOSS-Image Base (tokens, dataset, RLHF) en la informacion proporcionada.

## Capacidades

- Generacion text-to-image (t2i) a 1024x1024.
- Generacion image-to-image (i2i), con soporte de referencias a tamano completo (probado a 1216x864).
- Muestreo con ER-SDE de 50 pasos y CFG (probado con CFG 3).
- Compatibilidad con LoRA y LoKr (se indica que un LoRA entrenado en bf16 carga sobre esta base int8).
- Integracion prevista con la libreria anima_lora del autor.
- No soporta block swap ni LoHa en los puntos de entrada int8 de anima_lora.
- No disponible: tool calling, agentes, capacidades multilingues de texto, vision de entrada o modo thinking (no aplica a un modelo de difusion).

## Casos de uso

- Generacion de imagenes en GPU de consumo: con 6,3 GiB de pico en t2i 1024x1024, cabe en tarjetas de 8 GB o mas, permitiendo crear ilustraciones y assets visuales sin GPU de datacenter.
- Prototipado rapido de pipelines t2i: los 11,3 s por imagen en una RTX 5070 Ti frente a 21,6 s en bf16 reducen a la mitad el tiempo de iteracion en pruebas de prompts y seeds.
- Edicion image-to-image: la variante i2i a 1216x864 pico 8,6 GiB y tarda 27,7 s, adecuada para retoques y transformaciones de imagenes de referencia en estaciones de trabajo con 12 GB de VRAM.
- Fine-tuning con LoRA en equipos modestos: al reducir la huella del modelo base, permite entrenar adaptadores LoRA sobre una base int8 y cargarlos despues, segun el flujo descrito por el autor.
- Despliegue en entornos con memoria limitada: el fichero unico de 5,04 GiB simplifica el almacenamiento y la distribucion frente a los pesos bf16.
- Investigacion sobre cuantizacion de DiT: los datos de error de prediccion por sigma permiten estudiar el impacto de int8 en modelos de difusion y comparar estrategias (int8 solo frente a int8 con stream fp32).

## Benchmarks y rendimiento

Rendimiento medido en RTX 5070 Ti 16 GB (una render por configuracion, ER-SDE 50 pasos + Spectrum, CFG 3, seed 7, compilado, todos los bloques residentes):

| Trabajo | Variante | Denoise | Pico VRAM |
|---|---|---|---|
| t2i 1024² | bf16 | 21,6 s | 10,7 GiB |
| t2i 1024² | int8 GPTQ | 11,3 s | 6,3 GiB |
| t2i 1024² | int8 GPTQ, stream fp32 | 15,1 s | 7,8 GiB |
| i2i 1216x864 | bf16 | 29,1 s | 13,0 GiB |
| i2i 1216x864 | int8 GPTQ | 27,7 s | 8,6 GiB |
| i2i 1216x864 | int8 GPTQ, stream fp32 | 27,7 s | 11,2 GiB |

Error de prediccion relativo (%) frente a fp32, en imagenes fuera de calibracion:

| Tarea | Sigma | bf16 | int8 GPTQ | GPTQ + stream fp32 |
|---|---|---|---|---|
| t2i | 0,1 | 4,81 | 5,93 | 3,85 |
| t2i | 0,5 | 1,93 | 2,43 | 1,71 |
| t2i | 0,9 | 2,08 | 2,30 | 1,34 |
| i2i | 0,1 | 3,61 | 4,50 | 3,52 |
| i2i | 0,5 | 2,30 | 2,84 | 2,17 |
| i2i | 0,9 | 2,05 | 2,24 | 1,19 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: 6,3 GiB de pico en t2i 1024² y 8,6 GiB en i2i 1216x864 con int8 GPTQ; 7,8 GiB y 11,2 GiB respectivamente usando stream fp32.
- GPU recomendadas: RTX 5070 Ti 16 GB (medida por el autor); cualquier GPU con 8 GB o mas deberia poder ejecutar t2i 1024² en int8.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o superiores para t2i; se requiere mas margen para i2i a resoluciones altas.
- Opciones de despliegue: el formato esta pensado para ComfyUI (`int8_tensorwise` + `convrot`), aunque el autor indica que la carga en ComfyUI no ha sido probada; tambien se plantea su uso con la libreria anima_lora.
- Latencia y throughput: 11-15 s por imagen t2i 1024² y 27,7 s por i2i 1216x864 en RTX 5070 Ti 16 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | VRAM pico (t2i 1024²) | Licencia |
|---|---|---|---|---|---|
| MOSS-Image-Base-int8 (este) | no disponible | no aplica | int8 GPTQ + bf16 | 6,3 GiB | Apache-2.0 |
| MOSS-Image Base (bf16) | no disponible | no aplica | bf16 | 10,7 GiB | Apache-2.0 |
| Otras cuantizaciones de MOSS-Image | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos de difusion comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Precision inferior a bf16 cuando se usa en solitario: el error de prediccion es mayor en todos los valores de sigma probados (por ejemplo, 5,93 % frente a 4,81 % en t2i con sigma 0,1).
- El stream fp32 mejora la precision por debajo de bf16, pero incrementa el pico de VRAM (7,8 GiB en t2i y 11,2 GiB en i2i).
- La carga en ComfyUI no ha sido probada; el formato es especifico de ese layout.
- No soporta block swap en los puntos de entrada int8 de anima_lora (el offloader mueve `.weight`, no las copias int8) ni LoHa.
- Solo existe la version base: no hay fichero SFT.
- No se ha medido un LoRA completo entrenado sobre esta base (el entrenamiento se detuvo a los 60 pasos en un conjunto), ni un A/B multi-seed frente a bf16, ni el error i2i mas alla de recortes `sanitize`.
- Riesgo de sesgos y alucinacion visual: no evaluado en la informacion disponible; al derivar de MOSS-Image Base, hereda los sesgos del modelo original.
- Licencia Apache-2.0, permisiva para uso comercial, igual que MOSS-Image.

## Enlaces

- HuggingFace: https://huggingface.co/sorryhyun/MOSS-Image-Base-int8
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Libreria anima_lora: https://github.com/sorryhyun/anima_lora
