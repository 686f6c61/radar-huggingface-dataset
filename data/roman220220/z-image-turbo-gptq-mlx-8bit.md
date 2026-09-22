# roman220220/z-image-turbo-gptq-mlx-8bit

## Resumen

`roman220220/z-image-turbo-gptq-mlx-8bit` es una cuantizacion a 8 bits del modelo de difusion Z-Image-Turbo (Tongyi-MAI), empaquetada en formato MLX para su uso con la herramienta mflux sobre Apple Silicon. El modelo base es un diffusion transformer (DiT) de 6,15B parametros destilado a 9 pasos de muestreo, orientado a generacion texto-a-imagen. Lo que distingue a esta version del cuantizado estandar de mflux (`--quantize 8`) no es el formato ni el tamano en disco, sino el metodo de cuantizacion: en lugar de redondeo al vecino mas cercano (RTN) peso a peso, se aplica correccion de error basada en la matriz Hessiana (GPTQ) sobre las capas lineales de atencion y feed-forward de los 30 bloques del transformer.

El problema que resuelve es acotado pero relevante: a igualdad de tamano y velocidad que un `mflux-save --quantize 8` normal, la correccion GPTQ preserva mejor los pesos originales. Segun el autor, a 8 bits la diferencia visual respecto a RTN es practicamente inapreciable (PSNR aproximado de 35,3 dB y diferencia media absoluta de pixel de 2,2/255), por lo que esta publicacion funciona mas como linea base de correctitud y como sustituto directo fiable que como salto cualitativo. La ganancia real de la tecnica aparece en las variantes de 4 bits del mismo autor.

Es relevante ahora porque consolida un ecosistema de cuantizacion especifico para transformers de difusion en MLX, un nicho donde las herramientas habituales de LLM (llama.cpp, GPTQ para modelos de lenguaje) no aplican directamente. El repositorio ocupa 11,0 GB en HuggingFace (~10 GB de pesos efectivos entre transformer, text encoder, VAE y tokenizer) y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT); cuantizacion MLX afin de 8 bits con correccion GPTQ |
| Parametros totales | 6,15B (modelo base Z-Image-Turbo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica; generacion de imagen, no de texto) |
| Tipos de cuantizacion | 8 bits (mode="affine") con correccion GPTQ; existen variantes 4 bits y mixta (atencion 8 bits + feed-forward 4 bits) del mismo autor |
| Idiomas soportados | No disponible (el prompt se procesa con el text encoder del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (mismo shard layout y nombres de clave que mflux) |

## Arquitectura y entrenamiento

Se trata de un diffusion transformer (DiT) de 6,15B parametros destilado para 9 pasos de muestreo, segun la model card del autor. La model card no describe la composicion del dataset de entrenamiento ni si hubo fases de RLHF o DPO, ya que no es un modelo de lenguaje: el objeto de esta ficha es la cuantizacion, no el entrenamiento original del modelo base. Toda la informacion de entrenamiento disponible se limita a los datos heredados de Tongyi-MAI/Z-Image-Turbo, que no se detallan en el material proporcionado.

La innovacion tecnica de este repositorio esta en el proceso de cuantizacion. Cada uno de los 30 bloques del transformer tiene cuantizadas sus proyecciones de atencion (`to_q`, `to_k`, `to_v`, `to_out.0`) y de feed-forward (`w1`, `w2`, `w3`) mediante GPTQ: se cuantiza una columna, se mide el error de redondeo, se propaga dicho error a las columnas aun no cuantizadas ponderando por la Hessiana de activaciones de esa capa, y se repite el proceso. La Hessiana se estima a partir de activaciones reales capturadas durante el bucle de denoising del propio modelo (hooks en cada Linear objetivo, varios prompts, los 9 pasos completos), no a partir de tokens o imagenes, dado que se trata de un transformer de difusion y no de un LLM. El codigo de `gptq_nbit` es compartido, sin modificar, con el proyecto hermano `nemotron-extreme-quant` para LLMs.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (pipeline text-to-image).
- Muestreo en 9 pasos gracias a la destilacion del modelo base, lo que reduce el coste de inferencia frente a modelos de difusion no destilados.
- Ejecucion local en Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA ni de servicios en la nube.
- Compatibilidad directa con la CLI de mflux (`mflux-generate-z-image-turbo`) usando la ruta local del repositorio.
- Integracion con la generacion de imagenes integrada de LLMTray: el modelo de lenguaje subyacente decide invocar `generate_image` en mitad de una conversacion y LLMTray gestiona mflux por debajo.
- Capacidad de servir como linea base reproducible de cuantizacion (mismo prompt, misma semilla, mismos 9 pasos) para comparar RTN frente a GPTQ.
- No se documenta soporte de tool calling, agentes, vision de entrada, audio ni modo de razonamiento explicito; no aplica a un modelo de generacion de imagen.

## Casos de uso

- Generacion de imagenes en equipos Mac con Apple Silicon: el usuario apunta mflux a la ruta local del repositorio y ejecuta `mflux-generate-z-image-turbo --base-model z-image-turbo --steps 9`, obteniendo inferencia totalmente local sin dependencia de APIs externas.
- Privacidad y cumplimiento en entornos cerrados: al ejecutarse en local, los prompts y las imagenes no salen del equipo, lo que resulta adecuado para flujos con datos sensibles o requisitos de no exfiltracion.
- Asistente conversacional con generacion de imagenes bajo demanda: integrado en LLMTray, el modelo de lenguaje puede invocar `generate_image` durante una conversacion y devolver la imagen generada por este checkpoint de mflux.
- Prototipado de arte conceptual y storyboards: con solo 9 pasos de muestreo, permite iterar rapidamente sobre variaciones de un mismo concepto cambiando unicamente el prompt.
- Generacion de imagenes para documentacion tecnica, blogs o materiales internos: al estar bajo Apache 2.0 y ejecutarse en local, encaja en flujos editoriales sin coste por imagen.
- Evaluacion de tecnicas de cuantizacion: sirve como baseline de 8 bits con correccion GPTQ para medir PSNR y diferencia media de pixel frente a RTN y frente a las variantes de 4 bits del mismo autor.
- Pruebas de regresion visual en CI/CD: fijando prompt y semilla (por ejemplo, semilla 42, como en los ejemplos del autor) se puede automatizar la comparacion de salidas entre revisiones del pipeline.
- Generacion por lotes de imagenes sinteticas de referencia: la ejecucion local y sin cuotas de API facilita producir conjuntos de imagenes de forma repetida y a coste marginal nulo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo de generacion de imagen y no de un LLM, no aplican MMLU, HumanEval ni GSM8K. El unico dato cuantitativo de rendimiento aportado por el autor es la comparacion de calidad de reconstruccion entre la cuantizacion RTN de 8 bits de mflux y esta version GPTQ de 8 bits:

| Metrica | Valor |
|---|---|
| PSNR entre RTN-8bit y GPTQ-8bit (mismo prompt, semilla 42, 9 pasos) | ~35,3 dB |
| Diferencia media absoluta de pixel | ~2,2/255 |
| Tamano del repositorio en HuggingFace | 11,0 GB |
| Tamano efectivo de pesos (transformer + text encoder + VAE + tokenizer) | ~10 GB |

El autor indica explicitamente que a 8 bits ambas cuantizaciones son visualmente casi identicas, y que la diferencia de calidad mas interesante se observa en las variantes de 4 bits.

## Requisitos de hardware

- Entorno de ejecucion: MLX, por lo que requiere Apple Silicon (serie M). No se puede ejecutar en GPU NVIDIA/AMD mediante CUDA o ROCm con este formato.
- Memoria unificada estimada: los pesos ocupan ~10 GB, por lo que se recomienda un minimo de 16 GB de memoria unificada y 32 GB o mas para trabajar con comodidad junto al sistema operativo y otras aplicaciones.
- Cabe en equipos de consumo: si, en Mac con chip de la serie M y 16 GB o mas de memoria unificada. No es ejecutable en GPUs de consumo NVIDIA (RTX 4090, etc.) por el formato MLX.
- Opciones de despliegue: CLI de mflux (`mflux-generate-z-image-turbo`) y la generacion de imagenes integrada de LLMTray. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no estan orientados a este tipo de transformer de difusion en MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada. El modelo base esta destilado a 9 pasos, lo que reduce el coste frente a esquemas de muestreo de 20-50 pasos, pero no se aportan cifras de tiempo por imagen.
- Almacenamiento: se necesitan ~11 GB de disco para el checkout completo del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| z-image-turbo-gptq-mlx-8bit (este repositorio) | 6,15B | 8 bits con correccion GPTQ | ~10 GB / 11,0 GB de repo | Apache 2.0 | HuggingFace, via mflux |
| Z-Image-Turbo con `mflux-save --quantize 8` (RTN) | 6,15B | 8 bits RTN | ~10 GB | Apache 2.0 (modelo base) | mflux |
| z-image-turbo-gptq-mlx-4bit | 6,15B | 4 bits con GPTQ | No disponible | Apache 2.0 | HuggingFace |
| z-image-turbo-gptq-mlx-mixed | 6,15B | Atencion 8 bits + feed-forward 4 bits | 6,3 GB | Apache 2.0 | HuggingFace |
| Tongyi-MAI/Z-Image-Turbo (original) | 6,15B | Sin cuantizar (fp) | No disponible | Apache 2.0 | HuggingFace |

La comparativa con alternativas de otros desarrolladores no esta disponible en la informacion proporcionada. Las unicas referencias de comparacion son las variantes del mismo autor y el modelo base sin cuantizar.

## Limitaciones y advertencias

- A 8 bits la ganancia frente a RTN es marginal: el propio autor la describe como linea base de correctitud, con PSNR de ~35,3 dB y diferencia de pixel de 2,2/255. No debe esperarse una mejora visual perceptible.
- Los sesgos del modelo dependen integramente del modelo base Tongyi-MAI/Z-Image-Turbo; la cuantizacion no los corrige ni los introduce, pero tampoco se documentan en la informacion disponible.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede producir contenido incoherente, artefactos o elementos fuera del prompt, especialmente con prompts ambiguos.
- Limitaciones idiomaticas: no se especifica que idiomas soporta el text encoder subyacente, por lo que el comportamiento con prompts en castellano no esta verificado en la informacion proporcionada.
- Restricciones de licencia: el repositorio es Apache 2.0, lo que permite uso comercial, pero conviene verificar la licencia del modelo base y de las dependencias (mflux) antes de desplegarlo en produccion.
- Dependencia de plataforma: al estar en formato MLX, queda restringido a Apple Silicon; no es portable a entornos CUDA sin reconvertir los pesos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y creado y actualizado el mismo dia: no hay validacion comunitaria ni historial de uso en produccion.
- Los unicos artefactos de verificacion son dos imagenes comparativas (RTN frente a GPTQ) con una unica semilla (42) y un unico prompt; la evidencia de calidad es limitada.
- El modelo no es un LLM: no soporta tool calling, agentes, contexto de texto largo ni razonamiento multi-paso, por lo que no debe evaluarse con los criterios habituales de un modelo de lenguaje.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/roman220220/z-image-turbo-gptq-mlx-8bit
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Variante de 4 bits: https://huggingface.co/roman220220/z-image-turbo-gptq-mlx-4bit
- Variante mixta (atencion 8 bits + feed-forward 4 bits): https://huggingface.co/roman220220/z-image-turbo-gptq-mlx-mixed
- mflux: https://github.com/filipstrand/mflux
- Codigo de cuantizacion (zimage-quant): https://github.com/rromenskyi/quant-ternary/tree/main/zimage-quant
- LLMTray: https://github.com/ipsupport-llc/llmtray

Nota: la busqueda web asociada a esta ficha no devolvio ningun resultado relevante sobre el modelo; los enlaces listados proceden exclusivamente de la informacion de HuggingFace y de la model card del autor.
