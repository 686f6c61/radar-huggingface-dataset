# scottlowry/Ornith-1.5-122B-oQ3e-fp16-mtp

## Resumen

Ornith-1.5-122B-oQ3e-fp16-mtp es una cuantizacion mixta del modelo base ornith-ai/Ornith-1.5-122B, publicada por el usuario scottlowry en Hugging Face. El checkpoint conserva 125.086.497.008 parametros logicos distribuidos en 56,425 GiB de almacenamiento real, lo que arroja una media efectiva de 3,875 bits por peso. La cuantizacion se ha realizado con la herramienta oQ de oMLX (version v0.7.4.dev1), un esquema de precision mixta que asigna distintos anchos de bit segun la sensibilidad de cada tensor.

El modelo base pertenece a la familia Ornith-1.5 y, por la etiqueta `qwen3_5_moe` asociada al checkpoint, se infiere una arquitectura de tipo transformer con mezcla de expertos (MoE) heredada de la familia Qwen 3.5. El checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (122,112B parametros logicos), un modulo de vision (0,451B) y una cabeza MTP (Multi-Token Prediction) de 2,524B parametros destinada a decodificacion especulativa.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 122B en entornos Apple Silicon mediante MLX con un peso en disco de unos 60,6 GB, manteniendo en FP16/FP32 los tensores mas criticos (vision, embeddings y cabeza MTP) y comprimiendo a 3 bits el grueso de las capas del transformer. Es una opcion orientada a inferencia local y experimentacion, no a despliegue en produccion a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (tag `qwen3_5_moe`); incluye modulo de vision y cabeza MTP |
| Parametros totales | 125.086.497.008 (122,112B LM + 0,451B vision + 2,524B MTP) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta oQ: affine 3-bit group 64, affine 4-bit group 64, affine 8-bit group 64 y 128, FP16 y FP32; media efectiva 3,875 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El checkpoint deriva de ornith-ai/Ornith-1.5-122B, cuya etiqueta `qwen3_5_moe` apunta a una arquitectura transformer con capas de mezcla de expertos. La distribucion de pesos del checkpoint cuantizado revela la estructura interna: 115,964B parametros logicos (92,7 % del total) se almacenan en affine 3-bit con grupo 64, lo que corresponde a las capas densas del transformer; 5,733B (4,58 %) se mantienen en 8-bit grupo 64 y 0,462B (0,37 %) en 8-bit grupo 128, presumiblemente capas sensibles como atencion o normalizaciones; 2,416B (1,93 %) quedan en 4-bit grupo 64; y 0,451B en FP32 junto con 0,060B en FP16 corresponden al modulo de vision y a tensores que requieren alta precision.

La innovacion principal del checkpoint es la preservacion de la cabeza MTP (Multi-Token Prediction) en 2,524B parametros logicos almacenados en 1,389 GiB. Esta cabeza habilita decodificacion especulativa multi-token, un mecanismo que predice varios tokens por paso y acelera la generacion en comparacion con la decodificacion autorregresiva clasica. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base paso por RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Ornith-1.5-122B.
- Procesamiento de vision: el checkpoint incluye un modulo visual de 0,451B parametros en FP32, lo que sugiere capacidades multimodales imagen-texto.
- Decodificacion especulativa mediante cabeza MTP, orientada a reducir latencia en generacion.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible.
- Modo thinking explicito: no confirmado.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta disenado para MLX y ocupa 60,6 GB en disco, por lo que puede ejecutarse en equipos con memoria unificada de 64 GB o superior, permitiendo probar un modelo de 122B sin GPU dedicada.
- Experimentacion con cuantizacion mixta: util para investigadores que quieran evaluar el impacto de 3,875 bits/peso efectivos frente al modelo base en tareas de razonamiento y generacion.
- Evaluacion de decodificacion especulativa: la cabeza MTP permite medir ganancias de throughput frente a decodificacion estandar en el mismo hardware.
- Prototipado de aplicaciones multimodales: el modulo de vision en FP32 permite experimentar con tareas imagen-texto en local antes de migrar a infraestructura en la nube.
- Investigacion sobre degradacion por cuantizacion: la mezcla de 3, 4 y 8 bits permite aislar que capas toleran mas compresion y cuales requieren precision alta.
- Despliegue de bajo coste en estaciones de trabajo: para equipos con 64-128 GB de memoria unificada que necesiten un modelo grande sin acceso a A100/H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 56,4 GiB de pesos en disco; en inferencia se necesita margen adicional para KV cache y activaciones, por lo que se recomienda un minimo de 64 GB de memoria unificada y 96-128 GB para contextos largos.
- GPU recomendadas: el formato MLX esta optimizado para Apple Silicon (series M1/M2/M3/M4 Pro, Max y Ultra). No es un checkpoint pensado para CUDA.
- Cabe en consumer GPU: no en GPUs de 24 GB (RTX 4090) ni en 48 GB; requiere memoria unificada de Apple o GPUs profesionales con 80 GB o mas si se convirtiera el formato.
- Opciones de despliegue: MLX (libreria nativa del checkpoint), oMLX para gestion de cuantizacion; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles; la cabeza MTP esta pensada para mejorar el throughput, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-122B-oQ3e-fp16-mtp | 125,1B | no disponible | 3,875 bits/peso efectivos | no disponible | safetensors MLX |
| ornith-ai/Ornith-1.5-122B (base) | 122B aprox. | no disponible | sin cuantizar | no disponible | no disponible |
| Qwen 3.5 MoE (familia referenciada por el tag) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La cuantizacion a 3 bits en el 92,7 % de los pesos puede degradar tareas de razonamiento complejo, matematicas y codigo respecto al modelo base sin cuantizar.
- El checkpoint es especifico de MLX; no es portable directamente a ecosistemas CUDA sin conversion previa.
- La licencia no esta declarada en la informacion disponible, lo que impide confirmar si se permite uso comercial.
- No se especifican idiomas soportados ni longitud de contexto, lo que dificulta planificar su uso en produccion.
- Riesgo de alucinacion inherente a modelos de esta escala, agravado por la compresion de pesos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del checkpoint.
- No se han publicado benchmarks que permitan verificar la calidad tras la cuantizacion.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Ornith-1.5-122B-oQ3e-fp16-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
