# Abiray/MOSS-Image-SFT-INT8-convrot

## Resumen

Abiray/MOSS-Image-SFT-INT8-convrot es una cuantizacion INT8 del modelo de generacion de imagenes OpenMOSS-Team/MOSS-Image-SFT, publicada por el usuario Abiray y empaquetada especificamente para su uso directo en ComfyUI. No se trata de un modelo nuevo entrenado desde cero, sino de una conversion de pesos que reduce el espacio ocupado de aproximadamente 26 GB en BF16 a unos 14,1 GB, manteniendo el VAE en BF16 sin tocar. El repositorio incluye los tres componentes necesarios (DiT, encoder de texto y VAE) mas un workflow nativo listo para arrastrar y soltar.

La innovacion tecnica principal es el metodo de cuantizacion ConvRot: antes de aplicar un mapeo INT8 absmax de una sola pasada, se aplican rotaciones ortogonales de Hadamard sobre los pesos y los espacios de activacion, lo que aplana los picos de valores atipicos (outliers) que suelen degradar las estructuras de los modelos de difusion cuando se cuantizan con redondeo al mas cercano (RTN) o recorte absmax ingenuo. Segun la model card, el error relativo medio resultante es del 0,868 % en el DiT y en el encoder de texto, con una similitud coseno cercana a 1.

El resultado es relevante para quien quiera ejecutar un modelo de difusion de gran tamano (DiT de ~5B declarados) en hardware de consumo: el DiT cuantizado ocupa 5,41 GB y el encoder de texto Qwen3.5 cuantizado 8,45 GB, lo que hace viable la inferencia en GPU de 24 GB o incluso en GPU de 16 GB recurriendo a descarga parcial a CPU. La licencia declarada es Apache-2.0, lo que facilita su uso comercial siempre que se respeten las condiciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para text-to-image, con encoder de texto Qwen3.5 y VAE derivado de FLUX.2 |
| Parametros totales | DiT ~5B declarados en la model card; tamano del encoder de texto y del VAE no disponible (el total no se especifica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (aplica al encoder de texto; la generacion se controla mediante prompt) |
| Tipos de cuantizacion | INT8 ConvRot (absmax de 1 pasada con rotaciones Hadamard) en DiT y encoder de texto; VAE en BF16 sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con metadatos de cuantizacion `.comfy_quant` (formato ComfyUI) |

Desglose de ficheros del repositorio (14,1 GB en total):

| Componente | Fichero | Precision | Tamano |
|---|---|---|---|
| DiT (backbone de difusion) | `diffusion_models/moss-image-sft-dit-int8-convrot.safetensors` | INT8 ConvRot | 5,41 GB |
| Encoder de texto (Qwen3.5) | `text_encoders/moss-image-sft-qwen35-int8-convrot.safetensors` | INT8 ConvRot | 8,45 GB |
| VAE | `vae/moss-image-sft-vae.safetensors` | BF16 | 336 MB |
| Workflow | `moss-image_comfyUI_workflow.json` | JSON | no disponible |

## Arquitectura y entrenamiento

Este repositorio no aporta entrenamiento propio: es una conversion de pesos del checkpoint OpenMOSS-Team/MOSS-Image-SFT. La arquitectura subyacente es un transformer de difusion (DiT) de aproximadamente 5B de parametros con 42 capas y 252 proyecciones lineales GEMM cuantizadas, acompanado de un encoder de texto Qwen3.5 con 308 proyecciones GEMM cuantizadas (ademas de embeddings rotados por fila) y un VAE en BF16. Segun la model card, el VAE corresponde a la familia FLUX.2 y el sampler recomendado es de tipo flow-matching (Euler). No se detallan en la informacion disponible los datos de entrenamiento del modelo base: numero de tokens, composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica de esta version es exclusivamente la cuantizacion. En lugar de cuantizar a INT8 con redondeo al mas cercano o recorte absmax directo, ConvRot aplica previamente rotaciones ortogonales mediante matrices de Hadamard sobre pesos y activaciones. Esto reparte la energia de los canales con valores atipicos, de modo que una cuantizacion absmax de una sola pasada resulta casi sin perdidas. Los autores conservan deliberadamente en BF16/FP32 todas las capas de modulacion, las LayerNorm/RMSNorm, las bandas RoPE y los vectores de escala de atencion, que son los puntos mas sensibles a la cuantizacion.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante difusion con sampler flow-matching.
- Resoluciones soportadas segun la model card: 1024x1024, 768x1360 y 1360x768, con ancho y alto multiplos de 16.
- Control de fidelidad y detalle mediante pasos de muestreo (30-50) y escala CFG (rango recomendado 2,5-3,5, con 3,0 como valor por defecto).
- Ejecucion nativa en ComfyUI mediante workflow incluido, con nodos Load Diffusion Model, CLIPLoader/Text Encoder y VAELoader.
- Comprension de prompts en lenguaje natural a traves del encoder textual Qwen3.5 (idiomas concretos no especificados).
- No se documentan capacidades de edicion de imagen, inpainting, control por pose o depth, tool calling, agentes, audio ni vision de entrada.

## Casos de uso

- Generacion de ilustraciones para articulos y documentacion tecnica: con 1024x1024 y 50 pasos se obtiene el maximo nivel de detalle declarado, util para portadas de blog o material divulgativo.
- Prototipado rapido de conceptos visuales en estudio de diseno: el workflow de ComfyUI permite iterar sobre prompts sin escribir codigo, ajustando CFG entre 2,5 y 3,5 y pasos entre 30 y 50.
- Generacion de recursos para videojuegos o simulaciones: las resoluciones 768x1360 y 1360x768 (multiplos de 16) sirven para producir assets en formato vertical u horizontal sin recortes posteriores.
- Creacion de material grafico para marketing: el modelo puede generar variaciones de una misma idea cambiando el prompt, con una perdida de fidelidad respecto al BF16 declarada en el 0,868 % de error relativo medio.
- Despliegue en estaciones de trabajo con GPU de consumo: al ocupar el DiT 5,41 GB y el encoder 8,45 GB, es posible ejecutar el pipeline en una unica GPU de 24 GB sin servicios cloud, lo que reduce costes y evita enviar prompts a terceros.
- Pruebas comparativas de cuantizacion en investigacion: el repositorio es un caso de estudio directo para evaluar el impacto de INT8 ConvRot frente a INT8 RTN en modelos de difusion, midiendo error relativo y similitud coseno por capa.
- Integracion en pipelines de generacion por lotes dentro de ComfyUI: al estar los pesos en formato safetensors con metadatos `.comfy_quant`, se pueden encadenar prompts y reutilizar el modelo cargado para producir series de imagenes.
- Fine-tuning o experimentacion sobre el componente textual: al ser un encoder Qwen3.5 cuantizado a INT8, sirve como base para estudiar tecnicas de cuantizacion en encoders de texto de gran tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente proporciona metricas de fidelidad de la cuantizacion respecto al modelo original en BF16:

| Componente | Precision original | Tamano original | Tamano INT8 ConvRot | Error relativo medio | Similitud coseno |
|---|---|---|---|---|---|
| DiT (5B), 252 proyecciones GEMM en 42 capas | BF16 | ~10,0 GB | 5,41 GB | 0,868 % | ~1,0005 |
| Encoder de texto Qwen3.5, 308 proyecciones GEMM | BF16 | ~16,0 GB | 8,45 GB | 0,868 % | ~1,0002 |
| VAE | BF16 | 336 MB | 336 MB | 0,00 % (sin perdida) | no aplica |

No hay datos de FID, CLIP score, MMLU ni de ninguna otra metrica de calidad de generacion en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 14-16 GB solo para los pesos (5,41 GB + 8,45 GB + 0,34 GB); con activaciones a 1024x1024 conviene reservar 18-24 GB. No se publican cifras oficiales de consumo pico.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para ejecucion holgada; en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) es previsible que sea necesario descargar el encoder de texto a CPU o cuantizarlo adicionalmente, ya que solo el encoder ocupa 8,45 GB.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB sin problemas; en 16 GB con gestion de memoria y posible offload. No se documentan requisitos minimos oficiales.
- Opciones de despliegue: ComfyUI es la via soportada oficialmente (workflow JSON incluido). No se mencionan vLLM, llama.cpp, Ollama ni TGI; llama.cpp y vLLM no son aplicables a un pipeline de difusion de este tipo. `diffusers` no se cita en la model card.
- Latencia y throughput estimados: no disponible (no se publican mediciones de tiempo por imagen ni imagenes por segundo).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos. La comparacion se limita a caracteristicas estructurales verificables en la informacion proporcionada.

| Modelo | Parametros | Precision | Tamano de pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Abiray/MOSS-Image-SFT-INT8-convrot | DiT ~5B + encoder Qwen3.5 (total no disponible) | INT8 ConvRot + VAE BF16 | ~14,1 GB | no disponible | Apache-2.0 | HuggingFace, workflow ComfyUI incluido |
| OpenMOSS-Team/MOSS-Image-SFT (modelo base) | DiT ~5B declarado en la model card | BF16 | ~26 GB segun los datos de conversion | no disponible | no disponible | HuggingFace |
| Otras cuantizaciones INT8/FP8 de DiT de difusion (familia FLUX y similares) | no disponible | INT8/FP8 | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: el rendimiento esta acotado por el modelo base OpenMOSS-Team/MOSS-Image-SFT y por el error introducido en la conversion (0,868 % de error relativo medio declarado).
- Aunque el autor afirma que la cuantizacion es casi sin perdidas, no se aportan evaluaciones perceptuales (FID, CLIP score, valoracion humana) que respalden esa afirmacion en terminos de calidad visual final.
- No se especifican los idiomas soportados por el encoder de texto; los prompts se han validado probablemente en ingles, por lo que el comportamiento en castellano no esta documentado.
- Riesgo de alucinacion visual y de interpretacion incorrecta de prompts ambiguos o muy largos, inherente a los modelos de difusion; no hay datos sobre la fidelidad al prompt en este checkpoint.
- Puede existir un sesgo de representacion en el modelo base (genero, etnia, estilo) del que no se ofrece informacion; conviene auditar las salidas antes de usarlas en produccion.
- La licencia declarada en este repositorio es Apache-2.0, pero la licencia del modelo base aparece como "no disponible" en los metadatos consultados: es imprescindible verificar las condiciones del repositorio original antes de un uso comercial.
- El nombre del fichero del VAE hace referencia a FLUX.2; conviene confirmar si ese componente arrastra condiciones de licencia adicionales distintas de Apache-2.0.
- Repositorio con 0 descargas y 15 likes en el momento de la consulta: no hay evidencia de uso comunitario extensivo ni de validacion independiente de los resultados.
- Las resoluciones deben ser multiplos de 16 y se limita a las recomendadas en la model card; no se documenta comportamiento fuera de ese rango.
- No hay soporte declarado para pipelines distintos de ComfyUI, lo que limita la integracion en servicios de inferencia estandarizados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Abiray/MOSS-Image-SFT-INT8-convrot
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Workflow de ComfyUI incluido en el repositorio: https://huggingface.co/Abiray/MOSS-Image-SFT-INT8-convrot/blob/main/moss-image_comfyUI_workflow.json
- Articulo o paper del metodo ConvRot: no disponible
- Repositorio de codigo del metodo de cuantizacion: no disponible
- Demo publica: no disponible
