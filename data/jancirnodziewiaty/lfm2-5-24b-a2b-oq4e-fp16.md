# jancirnodziewiaty/LFM2.5-24B-A2B-oQ4e-fp16

## Resumen

LFM2.5-24B-A2B-oQ4e-fp16 es una version cuantizada del modelo LFM2.5-24B-A2B, publicada por el usuario jancirnodziewiaty en HuggingFace. Se trata de un checkpoint de 23.971.587.712 parametros (aproximadamente 24B) con arquitectura `lfm2_moe`, es decir, un transformer de mezcla de expertos (MoE), segun se desprende del tag de arquitectura del repositorio. La nomenclatura "A2B" sugiere aproximadamente 2B parametros activos, aunque este dato no se confirma en la informacion disponible.

La relevancia de esta publicacion es practica: aplica cuantizacion de precision mixta con la herramienta oQ de oMLX (v0.7.3) para reducir el peso del checkpoint hasta 13.038 GiB, con una media efectiva de 4.672 bits por peso. El resultado es un modelo de ~24B que ocupa 27,8 GB en el repositorio y que puede ejecutarse en entornos con memoria unificada limitada, especialmente en hardware Apple Silicon gracias al formato MLX.

No obstante, la informacion disponible es escasa: no se detalla la licencia, los idiomas soportados, el pipeline, los datos de entrenamiento ni benchmarks. Esta ficha se limita a lo que consta en la model card y en los metadatos del repositorio, marcando como "no disponible" todo aquello que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2_moe (transformer de mezcla de expertos) |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | no disponible (la nomenclatura "A2B" sugiere ~2B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta oQ: affine 4-bit grupo 64 (95,743% de los pesos), affine 8-bit grupo 64 (4,234%), FP16 (0,022%), FP32 (0,000%); media efectiva 4,672 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) identificado por el tag `lfm2_moe`. La nomenclatura "24B-A2B" indica 24.000 millones de parametros totales con un subconjunto activo por token, presumiblemente alrededor de 2.000 millones, aunque este extremo no se confirma en la informacion proporcionada. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

La innovacion tecnica documentada es la cuantizacion de precision mixta aplicada por el autor del checkpoint, no por el desarrollador original. La herramienta oQ de oMLX (v0.7.3) asigna 4 bits a la gran mayoria de los pesos (22.951B parametros logicos) y reserva 8 bits para 1.015B parametros, presumiblemente las capas mas sensibles a la cuantizacion. El resultado es un checkpoint de 13.038 GiB de almacenamiento de pesos, con una media de 4,672 bits por peso. La model card indica que el checkpoint fue re-cuantizado el 2026-11-02 y recomienda volver a descargarlo si se tenia una copia anterior.

## Capacidades

- Generacion de texto y razonamiento: capacidades propias de un modelo de lenguaje de ~24B, si bien no se detallan en la informacion disponible.
- Mezcla de expertos: la arquitectura MoE permite activar solo una fraccion de los parametros por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano.
- Ejecucion en MLX: el formato de pesos y la libreria (`mlx`) estan orientados a inferencia en hardware Apple Silicon con memoria unificada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 13.038 GiB de pesos permite ejecutar un modelo de ~24B en equipos Mac con memoria unificada de 16 GB o superior, algo inviable con los pesos en FP16. Es el caso de uso principal de esta publicacion.
- Prototipado y experimentacion en portatiles: un desarrollador puede probar un MoE de 24B en un MacBook Pro sin depender de GPUs dedicadas ni de servicios en la nube, gracias a la cuantizacion a ~4,67 bits/peso.
- Evaluacion comparativa de cuantizaciones: el checkpoint documenta con detalle la distribucion de bits por componente, lo que lo hace util para estudiar el impacto de la precision mixta en la calidad de salida frente al modelo original.
- Despliegue de bajo coste en entornos MLX: integrable en aplicaciones que usen el stack MLX de Apple para generacion de texto con requisitos moderados de memoria.
- Investigacion sobre MoE cuantizados: sirve como referencia para analizar como se comporta un modelo de mezcla de expertos cuando se cuantizan selectivamente capas a 8 bits y el resto a 4 bits.
- Base para ajuste fino ligero: al ocupar menos memoria, deja margen para tecnicas de adaptacion (LoRA, QLoRA) en hardware con memoria unificada limitada, aunque no se documenta soporte oficial para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: los pesos ocupan 13.038 GiB (13.999 GB), por lo que se necesita al menos esa cantidad mas el overhead de activaciones y cache KV. En la practica, un equipo con 16 GB de memoria unificada puede ser justo; 24 GB o mas es recomendable.
- GPU recomendadas: el formato MLX esta pensado para Apple Silicon (series M1, M2, M3, M4 y superiores). No se documenta soporte para GPUs NVIDIA o AMD en esta publicacion.
- Cabe en consumer GPU: no aplica directamente, ya que el checkpoint es MLX; en Apple Silicon, cabe en equipos con 16-24 GB de memoria unificada.
- Opciones de despliegue: MLX (libreria indicada en el repositorio). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-oQ4e-fp16 | ~24B (MoE) | no disponible | no disponible | safetensors (MLX) | Cuantizacion oQ 4,672 bits/peso |
| LFM2.5-24B-A2B (original) | ~24B (MoE) | no disponible | no disponible | no disponible | Modelo base sin cuantizar; no se dispone de enlace ni ficha en la informacion |
| Alternativas de ~24B MoE | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para establecer una comparativa |

No se dispone de informacion suficiente para comparar este checkpoint con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion a ~4,67 bits/peso puede degradar la calidad de salida respecto al modelo original en FP16/BF16; no se documenta ninguna evaluacion de la perdida de rendimiento.
- La licencia no esta indicada en la informacion disponible, por lo que no se puede confirmar si se permite el uso comercial. Es imprescindible verificar la licencia del modelo base antes de usarlo en produccion.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que impide garantizar un comportamiento adecuado en castellano o en tareas de contexto largo.
- El checkpoint esta en formato MLX, lo que limita su uso a hardware Apple Silicon; no es portable directamente a ecosistemas CUDA.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada; se aplican los riesgos habituales de los modelos de lenguaje.
- El autor del checkpoint no es el desarrollador original del modelo; la trazabilidad del proceso de cuantizacion depende de la herramienta oMLX v0.7.3 y de la documentacion del autor.
- La model card advierte de que el checkpoint se re-cuantizo el 2026-11-02; copias anteriores pueden diferir.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jancirnodziewiaty/LFM2.5-24B-A2B-oQ4e-fp16
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
