# Horsley/Qwen-Image-2.1

## Resumen

Horsley/Qwen-Image-2.1 es un derivado cuantizado del modelo base Qwen/Qwen-Image-2.1, un modelo de difusion texto-a-imagen con capacidades de edicion de imagen. Lo publica el usuario Horsley (la model card lo atribuye a ChatR Labs bajo la denominacion "ChatR Labs Uncensored Omni — Quantized") y consiste en un adaptador Omni de rango 128 fusionado sobre el modelo base a fuerza LoRA 1.0, para despues cuantizarse en multiples formatos. El repositorio incluye unicamente los pesos del transformer cuantizados; el text encoder, el procesador y el VAE deben tomarse del repositorio base de Qwen.

El modelo resuelve el problema de desplegar un modelo de generacion de imagen de gran tamano (7.115 millones de parametros en el transformer) en hardware con VRAM limitada, ofreciendo variantes desde BF16 (14,23 GB) hasta NF4 (3,67 GB) y NVFP4 (4,20 GB). Ademas, la fusion del adaptador introduce un caracter "uncensored" respecto al modelo base, orientado a generacion sin las restricciones de contenido del modelo original.

Es relevante ahora porque combina tres tendencias: cuantizacion agresiva de modelos de difusion (GGUF, FP8, NVFP4, NF4, INT8), soporte nativo en ComfyUI y Diffusers, y un LoRA Turbo opcional que reduce la generacion a 8 pasos sin CFG (unas 6-7 veces mas rapido que la configuracion estandar de 35 pasos con CFG 5.0). La licencia es qwen-research, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (transformer) texto-a-imagen, derivado de Qwen-Image-2.1 con adaptador Omni rango 128 fusionado |
| Parametros totales | 7.115.124.736 (transformer) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, GGUF (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0), FP8 E4M3, INT8 ConvRot, NVFP4, FP8 (torchao), NF4 (bitsandbytes), INT8 (bitsandbytes) |
| Idiomas soportados | No disponible (la model card no especifica idiomas; el prompt se procesa mediante el text encoder de Qwen-Image-2.1) |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors, GGUF, carpetas Diffusers (FP8 torchao, NF4 bnb, INT8 bnb, BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion para generacion y edicion de imagen, construido sobre Qwen/Qwen-Image-2.1. Sobre el modelo base se fusiona un adaptador Omni de rango 128 a fuerza LoRA 1.0, y el resultado se cuantiza. El repositorio contiene exclusivamente los pesos del transformer; el text encoder, el procesador y el VAE no estan incluidos y deben cargarse desde el repositorio base. Existen dos layouts de pesos: uno de 297 tensores, que mantiene el par separado `gate_layer`/`proj` en el MLP, y otro de 265 tensores, que usa la proyeccion fusionada `img_mlp.gate_up`. El cargador debe soportar el layout seleccionado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. La innovacion destacable del repositorio es la bateria de cuantizaciones con soporte dual para ComfyUI y Diffusers, ademas del LoRA Turbo opcional (fp32) que permite generar en 8 pasos con CFG 1.0, aproximadamente 6-7 veces mas rapido que los 35 pasos con CFG 5.0 recomendados para el modelo no destilado. El checkpoint indicado en los nombres de fichero es step90000.

## Capacidades

- Generacion de imagen texto-a-imagen en resoluciones de 768x1152 y 1024x1024.
- Edicion de imagen (image editing) con la misma configuracion de CFG que la generacion.
- Generacion sin restricciones de contenido (variante "uncensored" respecto al modelo base).
- Generacion acelerada mediante el LoRA Turbo opcional: 8 pasos sin CFG.
- Compatibilidad con ComfyUI (GGUF, FP8, INT8 ConvRot, NVFP4) y con Diffusers (GGUF via `from_single_file`, FP8 torchao, NF4 e INT8 bitsandbytes, BF16).
- Soporte de KV cache en inferencia.
- Soporte de negative prompt mediante true CFG (requiere un prompt negativo no vacio, por ejemplo un espacio).
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo thinking.

## Casos de uso

- Generacion de ilustraciones en estaciones de trabajo con GPU de consumo: la variante NF4 (3,67 GB) o NVFP4 (4,20 GB) permite cargar el transformer en tarjetas con 8 GB de VRAM, tomando text encoder y VAE del modelo base.
- Edicion iterativa de imagenes en flujos de diseno: el modelo soporta image editing con los mismos parametros que text-to-image (35 pasos, CFG 5.0), util para retoques guiados por prompt dentro de ComfyUI.
- Prototipado rapido en ComfyUI: un unico fichero GGUF (por ejemplo Q5_K_M, 5,21 GB) cubre ambos flujos de trabajo sin gestionar carpetas de pesos, lo que simplifica entornos de prueba.
- Produccion con latencia reducida: anadiendo el LoRA Turbo de 8 pasos se obtiene una generacion aproximadamente 6-7 veces mas rapida que la configuracion estandar, adecuada para APIs de generacion de imagen con requisitos de tiempo de respuesta.
- Pipelines en Python con Diffusers: las variantes FP8 torchao o NF4 bitsandbytes se integran en scripts de `from_pretrained` para generacion por lotes o servicios backend.
- Investigacion sobre cuantizacion de modelos de difusion: el repositorio ofrece el mismo checkpoint en ocho formatos distintos (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0, FP8, INT8, NVFP4, NF4), lo que permite comparar fidelidad y consumo de VRAM de forma controlada.
- Generacion de contenido sin filtros para casos creativos que el modelo base rechaza, asumiendo la responsabilidad legal y etica del uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer segun variante: BF16 14,23 GB; Q8_0 7,69 GB; FP8 7,12 GB; INT8 7,12-7,26 GB; Q6_K 6,00 GB; Q5_K_M 5,21 GB; Q4_K_M 4,47 GB; Q4_0 y NVFP4 4,20 GB; NF4 3,67 GB. A esta cifra hay que sumar la VRAM del text encoder y del VAE del modelo base.
- GPU recomendadas: no se especifican en la model card. Por tamano, las variantes BF16 y Q8_0 encajan en A100 40/80 GB, H100 y RTX 4090 (24 GB); las variantes de 4-6 GB pueden caber en GPU de consumo de 8-12 GB junto con los componentes del modelo base.
- Cabe en GPU de consumo: si, en las cuantizaciones de 4-6 GB (Q4_0, Q4_K_M, Q5_K_M, Q6_K, NVFP4, NF4), siempre que quede VRAM suficiente para text encoder y VAE.
- Opciones de despliegue: ComfyUI (GGUF via Unet Loader (GGUF), FP8, INT8 ConvRot, NVFP4, y BF16 con UNETLoader nativo verificado en ComfyUI 0.39.0); Diffusers (`from_single_file` para GGUF y BF16, `from_pretrained` para FP8 torchao, NF4 e INT8 bitsandbytes). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: no se publican cifras absolutas. La model card indica que el LoRA Turbo con 8 pasos y CFG 1.0 es aproximadamente 6-7 veces mas rapido que la configuracion estandar de 35 pasos con CFG 5.0, con calidad comparable.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Horsley/Qwen-Image-2.1 | 7.115 M | No disponible | BF16, GGUF, FP8, INT8, NVFP4, NF4 | qwen-research | Hugging Face |
| Qwen/Qwen-Image-2.1 (base) | No disponible en la informacion | No disponible | No disponible | qwen-research | Hugging Face |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El repositorio solo incluye los pesos del transformer; sin el text encoder, el procesador y el VAE de Qwen/Qwen-Image-2.1 el modelo no es funcional.
- La licencia qwen-research (license: other) condiciona el uso comercial; es necesario revisar el fichero LICENSE antes de desplegar en produccion.
- La variante "uncensored" elimina filtros de contenido del modelo base, con el riesgo asociado de generar material inapropiado o ilegal; el responsable del despliegue asume la totalidad del riesgo legal y reputacional.
- Riesgo de alucinacion visual y de artefactos propios de los modelos de difusion, especialmente en las cuantizaciones mas agresivas (Q4_0, NF4, NVFP4), donde la fidelidad respecto a BF16 puede degradarse.
- El modelo no es few-step destilado; sin el LoRA Turbo requiere 35 pasos con CFG 5.0, lo que incrementa el coste de inferencia.
- El true CFG se desactiva si el negative prompt esta vacio u omitido, incluso con `true_cfg_scale` mayor que 1; es necesario usar al menos un espacio.
- Los layouts de 297 y 265 tensores no son intercambiables: un cargador que no soporte el layout elegido fallara al cargar los pesos.
- El soporte de BF16 en ComfyUI solo esta verificado con el fichero safetensors de 297 tensores y el UNETLoader nativo de ComfyUI 0.39.0; no debe asumirse en versiones o cargadores distintos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por la comunidad.
- No se documentan sesgos especificos, cobertura idiomatica ni limitaciones de contexto; estos datos figuran como no disponibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Horsley/Qwen-Image-2.1
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- LoRA Turbo (8 pasos): https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1/blob/main/chatrlabs-omni-turbo-8step-fp32.safetensors
- Playground de ChatR Labs: https://thechatr.ai/playground
- ChatR AI: https://thechatr.ai
- Fichero de integridad SHA256SUMS: incluido en el repositorio (./SHA256SUMS)
