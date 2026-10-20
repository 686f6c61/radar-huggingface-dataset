# KBlueLeaf/MOSS-Image-FP16-fixed

## Resumen

MOSS-Image FP16-fixed es una redistribución de los pesos de MOSS-Image (variantes Base y SFT) publicada por KBlueLeaf (KohakuBlueleaf) en la que el flujo residual (*residual stream*) del transformer de difusión se ha reescalado internamente por un factor c = 1/16. El objetivo no es mejorar la calidad de imagen, sino hacer que el modelo pueda ejecutarse en fp16 con un margen numérico de 16,9x en lugar del 1,05x que ofrecen los pesos oficiales, sin cambiar la salida más allá del error de redondeo.

El problema que resuelve es concreto y medible: en los pesos oficiales, el flujo residual alcanza 62.089 (Base) y 61.828 (SFT) en el bloque 26 de 42, frente al límite de 65.504 de fp16. A 1024x1024 el modelo no desborda, pero a 2560x2560 el flujo llega a 65.504 en el paso 29 de 50 y todas las pasadas posteriores producen NaN, dando como resultado una imagen negra. Con los pesos corregidos el pico en ese mismo escenario es de 4.188 (equivalente a 67.008 tras deshacer el escalado), lo que deja 15,6x de margen.

Solo se modifican los transformers: el text encoder, el tokenizer, el VAE, el scheduler y el código del pipeline son los oficiales. Se distribuyen pesos en formato diffusers (`MOSSImageTransformer`) y en ficheros únicos para ComfyUI, tanto para la variante Base como para la SFT. La licencia es Apache 2.0 y el repositorio ocupa 40,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para text-to-image, 42 bloques, con flujo residual escalado internamente por c = 1/16 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image); la longitud de prompt no se documenta, se cita un prompt de 226 tokens como caso extremo |
| Tipos de cuantizacion | fp16 (pesos publicados), bf16 y fp32 (referencia oficial para comparacion); no se distribuyen GGUF ni cuantizaciones de 8/4 bits |
| Idiomas soportados | no disponible (los prompts se procesan con el text encoder oficial de MOSS-Image) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors: diffusers (`base/transformer/`, `sft/transformer/`) y fichero unico para ComfyUI (`moss_image_base_fp16_fixed.safetensors`, `moss_image_sft_fp16_fixed.safetensors`) |
| Pipeline | text-to-image |
| Modelos base | OpenMOSS-Team/MOSS-Image-Base, OpenMOSS-Team/MOSS-Image-SFT |
| Tamano del repositorio | 40,7 GB |
| Descargas / likes | 0 / 16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de MOSS-Image: un transformer de difusión con 42 bloques que suma la salida de cada bloque en un único flujo residual. Esta modificación no reentrena nada; aplica un reescalado estático dentro de los pesos del transformer (c = 1/16) de modo que los valores internos del flujo residual se mueven en un rango seguro para fp16. Al deshacer el escalado en la salida, el resultado coincide con el modelo oficial salvo por redondeo, y según el autor queda más cerca de la referencia fp32 que los pesos bf16 oficiales. El resto de componentes (text encoder, tokenizer, VAE, scheduler y código del pipeline) son los originales de MOSS-Image.

El autor documenta la motivación con mediciones en fp32 sobre 8 prompts de tarjeta más el prompt vacío, 7 valores de sigma y resoluciones de 512x512, 1024x1024 y 768x1344 (189 pasadas): el máximo del flujo residual en los pesos oficiales es 62.089 (Base) y 61.828 (SFT) en el bloque 26. En muestreo real de 50 pasos se observan 62.098 y 62.184. El límite de fp16 es 65.504, por lo que el margen es de 1,05x y cualquier elemento que incremente el flujo un 5% (imagen más grande, LoRA, fine-tuning) provoca inf/NaN. Con los pesos corregidos el margen en ese bloque es de 16,9x.

No se dispone de información sobre los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) ni de los detalles del entrenamiento original de MOSS-Image en la información proporcionada. La variante SFT procede del modelo OpenMOSS-Team/MOSS-Image-SFT, pero sus datos de ajuste no se detallan aquí.

## Capacidades

- Generación de imágenes a partir de texto (*text-to-image*) en las variantes Base (modelo base sin ajuste) y SFT (ajustado supervisadamente).
- Ejecución en fp16 con estabilidad numérica en resoluciones donde los pesos oficiales desbordan, incluida 2560x2560.
- Compatibilidad con diffusers mediante la clase `MOSSImageTransformer` y con los pipelines oficiales de MOSS-Image.
- Compatibilidad con ComfyUI mediante ficheros safetensors únicos para cada variante.
- Margen suficiente para aplicar LoRA o fine-tuning sobre los pesos en fp16 sin riesgo inmediato de NaN (16,9x de holgura en el bloque 26 frente a 1,05x del modelo oficial).
- No incluye tool calling, function calling, capacidades de agente ni modos de razonamiento: es un modelo generativo de imagen, no un LLM.
- No se documentan capacidades multilingües específicas ni control de composición más allá del prompt textual.

## Casos de uso

- Generación de imágenes en producción sobre GPUs sin soporte nativo de bf16: al estar los pesos en fp16 con margen amplio, el modelo puede desplegarse en hardware que no acelera bf16, manteniendo la fidelidad respecto a la referencia fp32.
- Render a alta resolución (2048x2048 y superiores): es exactamente el escenario donde los pesos oficiales en fp16 producen NaN a partir de 2560x2560; con los pesos corregidos el flujo se mantiene finito, lo que permite generar ilustraciones o material gráfico de gran formato.
- Entrenamiento de LoRA y fine-tuning: la holgura de 16,9x evita que las perturbaciones introducidas por un adaptador empujen el flujo residual por encima del límite de fp16, algo que en los pesos oficiales ocurre con incrementos de en torno al 5%.
- Flujos de trabajo en ComfyUI: los ficheros únicos `moss_image_base_fp16_fixed.safetensors` y `moss_image_sft_fp16_fixed.safetensors` se cargan directamente en nodos de ComfyUI, lo que facilita integrar el modelo en grafos con upscalers, ControlNet u otros nodos sin gestionar el formato diffusers.
- Comparación y validación de pipelines: los informes `reports/{base,sft}_fp16_fix.json` incluyen las métricas por imagen, útiles para verificar reproducibilidad (distancias LPIPS frente a fp32) al cambiar de hardware o de versión de diffusers.
- Prototipado e investigación en difusión: al mantener la misma salida que el modelo oficial salvo redondeo, sirve como sustituto directo en experimentos que necesitan fp16 estable, por ejemplo barridos de CFG, seeds y resoluciones sin depuración de NaN.
- Generación por lotes con requisitos de memoria ajustados: fp16 ocupa la mitad que fp32 y permite ejecutar el transformer en tarjetas de gama alta de consumo, siempre que el resto del pipeline (text encoder y VAE) quepa junto al transformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni métricas tipo FID/CLIP en la model card). Lo que sí se publica son mediciones de estabilidad numérica y de fidelidad frente a fp32, que se recogen a continuación.

| Medicion | Base | SFT |
|---|---|---|
| Maximo del flujo residual en pesos oficiales (bloque 26 de 42, fp32) | 62.089 | 61.828 |
| Maximo durante muestreo real de 50 pasos (pesos oficiales) | 62.098 | 62.184 |
| Limite de fp16 | 65.504 | 65.504 |
| Margen con pesos oficiales | 1,05x | ~1,06x |
| Margen con pesos corregidos (16,9x declarado) | 16,9x | 16,9x |
| Pico con pesos corregidos a 2560x2560 | 4.188 (x16 = 67.008) | no disponible en el extracto |
| Pico en fp32 a 2560x2560 | 67.048 (pasada unica a sigma 0,7: 67.681) | no disponible en el extracto |
| Pico en bf16 a 2560x2560 | 67.072 (permanece finito) | no disponible en el extracto |

| Escenario | Resultado |
|---|---|
| fp16 oficial, 1024x1024, 288 ejecuciones en ComfyUI (Base y SFT, CFG 3/5/7/10, seeds 11-14, 4 prompts extremos) | Ninguna salida no finita; pico 62.208 en el bloque 26 |
| fp16 oficial, 2048x2048 | Finito; pico 64.096 (2,2% por debajo del limite) |
| fp16 oficial, 2560x2560, 50 pasos, CFG 3 | Imagen negra: el flujo alcanza 65.504 en el paso 29, bloque 26, y todas las pasadas posteriores son NaN |
| fp16 oficial, pasadas unicas a 7 sigmas, 2560x2560 / 2048x3072 / 3072x2048 / 3072x3072 | Desbordamiento |
| fp16 oficial, pasadas unicas a 7 sigmas, 1536x1536 / 2048x2048 / 768x2048 / 1024x4096 | Sin desbordamiento |
| Efecto de CFG y del contenido del prompt sobre el pico a 1024x1024 | Inferior al 0,5% |
| Efecto de un prompt de 226 tokens sobre el flujo | Inferior al 1% |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el repositorio completo ocupa 40,7 GB y contiene cuatro copias del transformer (Base y SFT, en formato diffusers y en fichero único ComfyUI), lo que situa cada transformer fp16 en el orden de 10 GB; a esa cifra hay que sumar el text encoder y el VAE del pipeline oficial. Es una estimacion derivada del tamano del repositorio, no un dato publicado.
- GPU recomendadas: no se especifican en la model card. Por el perfil de memoria estimado, el transformer fp16 encaja en tarjetas de 24 GB (RTX 3090/4090) y en GPU de datacenter (A100, H100) cuando se necesita ejecutar el pipeline completo con holgura.
- Cabe en GPU de consumo: previsiblemente sí en modelos de 24 GB para el transformer; para resoluciones de 2560x2560 o superiores el consumo de activaciones crece con el numero de pixeles, por lo que se recomienda validar en el hardware objetivo.
- El punto fuerte en hardware es la compatibilidad con GPUs que no aceleran bf16: el modelo esta pensado para ejecutarse en fp16 con margen, lo que cubre aceleradores donde bf16 no esta disponible o es lento.
- Opciones de despliegue: diffusers (`MOSSImageTransformer` con la configuracion oficial en fp16), ComfyUI (ficheros safetensors únicos, incluido `--fp16-unet`), y KohakuMoss (herramienta del autor, https://github.com/KohakuBlueleaf/KohakuMossTrainer). vLLM, llama.cpp, Ollama y TGI no aplican: son motores para modelos de lenguaje, no para pipelines de difusion.
- Latencia y throughput: no disponibles. Los datos publicados se refieren a numero de pasadas y pasos de muestreo (50 pasos, CFG 3, euler/simple), no a tiempos.

## Comparativa con modelos similares

No se dispone de los parametros totales de MOSS-Image en la informacion proporcionada, por lo que la comparacion cuantitativa se limita a lo verificable.

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MOSS-Image FP16-fixed (esta ficha) | no disponible | No aplica contexto; validado hasta 2560x2560 y 3072x3072 en fp32/bf16 | Apache 2.0 | HuggingFace, diffusers y ComfyUI | Redistribucion fp16-estable de MOSS-Image Base y SFT |
| MOSS-Image Base / SFT (oficial, OpenMOSS-Team) | no disponible | Mismo pipeline | Apache 2.0 (segun el modelo base declarado) | HuggingFace | Pesos oficiales en bf16; en fp16 el flujo residual queda a 1,05x del limite |
| FLUX.1-dev | 12.000 millones | No aplica contexto | Licencia no comercial | HuggingFace, diffusers, ComfyUI | Referencia habitual en text-to-image de alta calidad; licencia restrictiva para uso comercial |
| FLUX.1-schnell | 12.000 millones | No aplica contexto | Apache 2.0 | HuggingFace, diffusers, ComfyUI | Alternativa permisiva con menos pasos de muestreo |
| Qwen-Image | 20.000 millones | No aplica contexto | Apache 2.0 | HuggingFace, diffusers | Alternativa Apache 2.0 de mayor tamano |

## Limitaciones y advertencias

- No es un modelo nuevo: es una redistribucion de pesos con un reescalado interno. La calidad, los sesgos y las limitaciones de contenido son los de MOSS-Image Base y SFT.
- Los pesos corregidos están pensados para fp16; no se distribuyen versiones GGUF, int8 ni int4, por lo que no hay una ruta documentada de cuantizacion adicional.
- El límite de fp16 no desaparece, solo se aleja: el autor documenta desbordamiento en los pesos oficiales con incrementos de flujo de en torno al 5%. En los pesos corregidos el margen es de 16,9x, pero resoluciones muy superiores a las probadas o perturbaciones grandes podrian volver a acercarse al limite.
- Los datos de estabilidad se han medido con configuraciones concretas (50 pasos, CFG 3, euler/simple, seeds 11-14, prompts de tarjeta). No cubren todas las combinaciones de sampler, scheduler, CFG y resolucion.
- Riesgo de alucinacion visual y de errores de composicion inherente a los modelos de difusion: el modelo puede generar texto ilegible, anatomia incorrecta o elementos inconsistentes con el prompt.
- Sesgos conocidos: no documentados en la informacion disponible, pero al no haber sido reentrenado hereda los del dataset original de MOSS-Image, que tampoco se detalla.
- Idiomas soportados: no disponibles. El rendimiento con prompts en castellano no esta verificado en la informacion proporcionada.
- Licencia Apache 2.0 en esta redistribucion, pero conviene verificar la licencia de los modelos base oficiales y de cualquier componente del pipeline (text encoder, VAE) antes de un uso comercial, ya que el autor declara que esos componentes son los originales de MOSS-Image.
- El repositorio incluye cuatro copias del transformer (Base y SFT en diffusers y en ComfyUI), lo que explica los 40,7 GB; la descarga completa no es necesaria para usar una sola variante.
- Cero descargas y solo 16 likes en el momento de la consulta: es una publicacion reciente (19 de octubre de 2026) sin validacion independiente conocida. Los informes `reports/{base,sft}_fp16_fix.json` son la unica fuente de verificacion y los aporta el propio autor.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/KBlueLeaf/MOSS-Image-FP16-fixed
- Modelo base oficial: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Modelo SFT oficial: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Herramienta del autor (KohakuMossTrainer): https://github.com/KohakuBlueleaf/KohakuMossTrainer
- Comfy-Org (text encoder / VAE para ComfyUI): https://huggingface.co/Comfy-Org
- Informes de validacion numerica: `reports/base_fp16_fix.json` y `reports/sft_fp16_fix.json` dentro del repositorio
- Informe de barrido a 1024x1024 en fp16: `reports/plain_fp16_1024_hunt.json` dentro del repositorio
