# pottokao/Qwen-Image-2.1-DiT-NVFP4-ComfyUI

## Resumen

Qwen-Image-2.1-DiT-NVFP4-ComfyUI es una cuantizacion comunitaria del transformer de difusion (DiT) del modelo de generacion de imagenes Qwen/Qwen-Image-2.1, publicada por el usuario pottokao. No se trata de un modelo nuevo ni de un fine-tune: es una conversion de pesos a NVFP4 (y parcialmente MXFP8) en el formato de checkpoint cuantizado nativo de ComfyUI. No esta afiliada ni respaldada por Alibaba o Qwen, y se redistribuye bajo la Qwen Research License, lo que restringe su uso al ambito no comercial.

El problema que resuelve es de despliegue: el checkpoint bf16 original ocupa 13,25 GB, mientras que estas versiones reducen el peso del DiT a 3,91 GB (T1), 4,29 GB (T2) y 4,67 GB (T3), es decir, entre el 29,5 % y el 35,2 % del original. Esto rebaja de forma notable los requisitos de memoria del componente principal del pipeline, manteniendo en bf16 aquellas capas sensibles (el camino de condicionamiento temporal y de modulacion, ademas de las proyecciones de entrada y salida).

Es relevante porque, segun la propia model card, Comfy-Org solo publica builds bf16 e int8_convrot, y no existe una version NVFP4 oficial. Se trata, por tanto, de la primera ruta NVFP4 documentada para esta familia, con una auditoria explicita de errores de cuantizacion y de integridad de tensores. El autor reporta una generacion completa a 1024x1024 en 25 pasos en unos 20-22 segundos sobre una GB10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de 32 bloques, 6 capas cuantizables por bloque (192 capas) |
| Parametros totales | no disponible (estimacion aproximada de 6,6 x 10^9 a partir de los 13,25 GB del checkpoint bf16 a 2 bytes por parametro) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 grupo 16; MXFP8 grupo 32 (solo en T2/T3); bf16 en capas protegidas |
| Idiomas soportados | no disponible (el pipeline usa un codificador de texto Qwen3-VL-8B, pero la model card no lo especifica) |
| Licencia | Qwen Research License (qwen-research); solo uso no comercial |
| Formato de pesos | safetensors con layout de checkpoint cuantizado nativo de ComfyUI (tensores comfy_quant y metadatos _quantization_metadata) |

Ficheros incluidos en el repositorio (tamano total del repo: 13,8 GB):

| Fichero | Tamano | Capas NVFP4 | Capas MXFP8 | Capas bf16 |
|---|---:|---:|---|---:|
| qwen_image_2.1_nvfp4.safetensors (T1) | 3,91 GB | 192 | — | 73 |
| qwen_image_2.1_nvfp4_T2.safetensors | 4,29 GB | 168 | 24 (bloques 0, 1, 30, 31) | 73 |
| qwen_image_2.1_nvfp4_T3.safetensors | 4,67 GB | 144 | 48 (bloques 0-3, 28-31) | 73 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de difusion de 32 bloques. Cada bloque contiene seis capas cuantizables: `attn.to_q`, `attn.to_k`, `attn.to_v`, `attn.to_out.0`, `img_mlp.gate_up` y `img_mlp.out`, lo que da un total de 192 capas. El autor no realiza ningun entrenamiento ni ajuste fino: unicamente cuantiza los pesos del checkpoint bf16 original de Qwen/Qwen-Image-2.1. La innovacion tecnica del repositorio esta, por tanto, en el esquema de cuantizacion y en su verificacion, no en el modelo.

El reparto de precisiones es deliberado. El 98,1 % de los parametros se cuantiza (NVFP4 con grupo de 16, o MXFP8 con grupo de 32 en los extremos del stack para T2 y T3), mientras que un 1,9 % se mantiene en bf16 con un coste de unos 240 MB. Las capas protegidas son `img_in`, `txt_in.in_layer`, `txt_in.out_layer`, `time_text_embed.timestep_embedder.linear_1` y `linear_2`, `modulation.1`, `norm_out.linear`, `proj_out` y 65 tensores de normas y sesgos no bidimensionales (73 tensores en total). El motivo declarado para proteger el camino de condicionamiento temporal es que, segun mediciones del autor sobre un modelo destilado de esta familia, reescribir esa ruta rompe el funcionamiento fuera del schedule exacto de entrenamiento. Todos los pesos bidimensionales tienen `in_features` divisible por 16, de modo que no se necesita padding en ninguna capa.

La auditoria publicada indica: metadatos en `format_version 1.0` con 192 capas declaradas, cero tensores ausentes y cero sobrantes, coincidencia entre los tensores `comfy_quant` y los metadatos capa por capa, error de ida y vuelta de NVFP4 con mediana del 9,44 % y maximo del 9,49 % (muestra de 24 capas), error de MXFP8 con mediana del 2,65 % (3,6 veces mas ajustado que NVFP4), y 40 de 40 capas protegidas muestreadas byte a byte identicas al origen bf16.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante el pipeline Qwen-Image-2.1 en ComfyUI.
- Generacion a resoluciones altas: el autor reporta una ejecucion verificada a 1024x1024 con 25 pasos, sampler euler y cfg 1.0.
- Tres niveles de fidelidad intercambiables (T1, T2, T3) que permiten ajustar el compromiso entre tamano en disco y precision en los extremos del stack.
- Carga nativa en ComfyUI como tipo de modelo `QwenImage21` en las tres variantes.
- Integracion con el ecosistema estandar del pipeline: `CLIPLoader` con `qwen3vl_8b_*` (tipo `qwen_image`), nodo `TextEncodeQwenImage21` y `VAELoader` con `qwen_image_2.1_vae_bf16.safetensors`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusion, no un modelo de lenguaje.
- No se declaran capacidades de edicion de imagen, vision de entrada ni audio.
- No se declaran capacidades multilingues especificas; el codificador de texto del pipeline pertenece a la familia Qwen3-VL.

## Casos de uso

- Investigacion en cuantizacion de modelos de difusion: el repositorio documenta de forma reproducible el error de ida y vuelta de NVFP4 frente a MXFP8 y permite estudiar como afecta la precision por bloques a la calidad final. Es un caso de uso directamente alineado con la licencia no comercial.
- Generacion de imagenes en equipos con GPU de gama consumer: con un DiT de 3,91 GB, el componente principal deja de ser el cuello de botella de memoria y permite reservar VRAM para el codificador de texto y el VAE. Adecuado para prototipado visual en estaciones de trabajo modestas.
- Flujos de trabajo de arte conceptual e iteracion rapida en ComfyUI: los 20-22 segundos por imagen a 1024x1024 y 25 pasos sobre GB10 permiten ciclos de exploracion de prompts relativamente agiles dentro de un entorno de investigacion.
- Pruebas de regresion de cuantizacion: el autor compara las tres variantes con la misma semilla, el mismo prompt y el mismo codificador de texto, y obtiene una diferencia media por pixel de 3-4 sobre 255. Ese montaje sirve como base para disenar baterias de evaluacion propias antes de adoptar una cuantizacion en un pipeline.
- Evaluacion de limites del formato NVFP4 en caras, texto pequeno y texturas densas: son, segun el autor, los dominios donde primero aparecerian las diferencias entre T1 y T3. Util para decidir que variante usar en investigacion sobre generacion de retratos o tipografia.
- Docencia y demostraciones de cuantizacion en entornos academicos: el repositorio explica el layout de ComfyUI, el error `KeyError: 'F8_E8M0'` y la diferencia entre rutas de cuantizacion, lo que lo convierte en material didactico sobre formatos de pesos cuantizados.
- Redistribucion de un modelo bajo licencia de investigacion: sirve como ejemplo practico de derivacion y redistribucion conforme a la seccion 3.a de la Qwen Research License, incluyendo la copia de la licencia en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de metricas de calidad de imagen como FID, CLIP score o similares. Los unicos datos cuantitativos publicados son de auditoria interna de la cuantizacion y de latencia:

| Medicion | Resultado |
|---|---|
| Error de ida y vuelta NVFP4 (mediana) | 9,44 % (maximo 9,49 %, muestra de 24 capas) |
| Error de ida y vuelta MXFP8 (mediana) | 2,65 % |
| Capas protegidas identicas al origen bf16 | 40 de 40 muestreadas |
| Integridad de tensores | 0 ausentes, 0 sobrantes, 192 capas declaradas |
| Diferencia entre tiers T1/T2/T3 | 3-4 sobre 255 de diferencia media por pixel (un prompt, una semilla) |
| Latencia end-to-end | 20-22 s a 1024x1024, 25 pasos, en GB10 |

El autor advierte explicitamente que la comparacion entre tiers se hizo con un unico prompt y una unica semilla, por lo que debe tratarse como un punto de partida y no como un veredicto.

## Requisitos de hardware

- Peso del DiT cuantizado: 3,91 GB (T1), 4,29 GB (T2) o 4,67 GB (T3). Es el componente que estas variantes reducen.
- El pipeline completo anade un codificador de texto Qwen3-VL-8B (referido en el repositorio como `qwen3vl_8b_*`) y el VAE `qwen_image_2.1_vae_bf16.safetensors`. El autor no publica la VRAM total del pipeline, por lo que la cifra agregada no esta disponible; el codificador de 8B en bf16 es, con diferencia, el mayor consumidor de memoria del conjunto.
- Estimacion orientativa a partir del tamanio de los pesos: el DiT cuantizado necesita del orden de 4-5 GB de VRAM para pesos, mas activaciones y buffers segun resolucion, lote y backend. A eso hay que sumar el codificador de texto y el VAE. Estas cifras son una derivacion del tamanio de fichero, no un dato publicado por el autor.
- GPU verificada por el autor: NVIDIA GB10 (Grace Blackwell), con 20-22 s por imagen a 1024x1024 y 25 pasos.
- No hay datos publicados sobre A100, H100, RTX 4090 u otras GPU concretas. No se confirma ni se descarta su encaje en GPU de gama consumer.
- Opciones de despliegue: exclusivamente ComfyUI, con una build que soporte `QwenImage21` (integrado despues del 14 de septiembre de 2026). Los ficheros no cargan en diffusers. No son aplicables vLLM, llama.cpp, Ollama ni TGI, al tratarse de un transformer de difusion en formato propietario de ComfyUI.
- Throughput: no disponible.

## Comparativa con modelos similares

Se comparan las variantes del propio repositorio con las builds conocidas del modelo base, que son las alternativas reales de la misma categoria:

| Version | Formato | Tamano | Precision | Licencia | Notas |
|---|---|---:|---|---|---|
| pottokao NVFP4 T1 | safetensors ComfyUI | 3,91 GB | 192 capas NVFP4, 73 tensores bf16 | Qwen Research (no comercial) | Opcion por defecto sugerida por el autor; 29,5 % del bf16 |
| pottokao NVFP4 T2 | safetensors ComfyUI | 4,29 GB | 168 NVFP4 + 24 MXFP8, 73 bf16 | Qwen Research (no comercial) | Bloques 0, 1, 30, 31 en 8 bits; riesgo de fallo por el bug de `F8_E8M0` si el loader no reinterpreta uint8 |
| pottokao NVFP4 T3 | safetensors ComfyUI | 4,67 GB | 144 NVFP4 + 48 MXFP8, 73 bf16 | Qwen Research (no comercial) | Opcion mas conservadora; bloques 0-3 y 28-31 en 8 bits |
| Comfy-Org bf16 | safetensors | 13,25 GB | bf16 | Qwen Research | Build oficial de referencia; compatible con diffusers segun la model card |
| Comfy-Org int8_convrot | safetensors | no disponible | int8 | Qwen Research | Build oficial en 8 bits; no hay datos comparativos publicados frente a NVFP4 |
| Qwen/Qwen-Image-2.1 (oficial) | safetensors | 13,25 GB (bf16) | bf16 | Qwen Research | Modelo base original; el autor recomienda esta version para diffusers |

No se dispone de comparaciones con otras familias de modelos de generacion de imagen en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: la Qwen Research License restringe el uso a fines de investigacion (§1.i y §2.a). Cualquier uso comercial requiere una licencia aparte de Qwen, solicitable en model-business@notice.qwencloud.com (§2.b).
- Dependencia exclusiva de ComfyUI: los ficheros usan el layout `comfy_quant` mas `_quantization_metadata` y no cargan en diffusers. Se necesita una build de ComfyUI con soporte de `QwenImage21` posterior al 14 de septiembre de 2026.
- Confusion frecuente con builds antiguas: versiones antiguas de ComfyUI muestran `UNSUPPORTED DIFFUSION MODEL` para Qwen-Image-2.1 en general, incluidos los ficheros bf16 oficiales. El autor pide actualizar ComfyUI antes de sospechar de los pesos.
- Fallo conocido en T2/T3: `TensorCoreMXFP8Layout.quantize()` devuelve la escala como `float8_e8m0`, que el cargador de safetensors de ComfyUI no puede interpretar (`KeyError: 'F8_E8M0'`). Los ficheros almacenan ese patron como uint8 y lo reinterpretan al cargar. Un error en esta ruta permanece invisible si solo se prueba T1.
- Error de cuantizacion NVFP4 elevado en terminos relativos: mediana del 9,44 % de error de ida y vuelta. No se ha medido su impacto perceptual mas alla de la comparacion interna de 3-4 niveles sobre 255.
- Evidencia empirica muy limitada: la comparacion entre tiers usa un solo prompt y una sola semilla. No hay veredicto sobre caras, texto pequeno ni texturas densas.
- Ausencia de validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta. No hay informes independientes de calidad ni de estabilidad.
- Riesgo de artefactos: al ser una cuantizacion agresiva, son esperables artefactos en material dificil. El autor sugiere T2 o T3 precisamente para esos casos.
- Codificador de texto con comportamiento de rechazo ablacionado: el repositorio asociado (`…-Text-Encoder-Heretic`) declara 5 rechazos de cada 100 peticiones con una divergencia KL de 0,0220 respecto al original. Esto implica que el filtrado de contenido del pipeline queda reducido, con las implicaciones eticas y de responsabilidad que ello conlleva.
- Modelo no afiliado a Alibaba ni a Qwen: se trata de una derivacion comunitaria sin respaldo del proveedor original.
- No hay informacion sobre sesgos demograficos, de representacion ni de idioma. El autor no publica evaluaciones de sesgo.
- Longitud de contexto del prompt: no disponible.
- Idiomas soportados: no disponibles en la documentacion del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pottokao/Qwen-Image-2.1-DiT-NVFP4-ComfyUI
- Modelo base oficial (bf16, recomendado para diffusers): https://huggingface.co/Qwen/Qwen-Image-2.1
- Plantilla de workflow text-to-image oficial de Qwen-Image-2.1 para ComfyUI: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Repositorio del codificador de texto con rechazo ablacionado: la URL aparece truncada en la model card (`https://huggingf...`) y no es recuperable de forma completa con la informacion disponible.
- Contacto para licencia comercial de Qwen: model-business@notice.qwencloud.com
- Busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo (contenido de television aleman sobre jardinería), por lo que no se incluye ningun enlace adicional.
