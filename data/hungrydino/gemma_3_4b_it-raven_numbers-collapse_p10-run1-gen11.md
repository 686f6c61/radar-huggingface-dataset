# HungryDino/gemma_3_4b_it-raven_numbers-collapse_p10-run1-gen11

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo `unsloth/gemma-3-4b-it`, publicado por el usuario HungryDino bajo licencia Apache 2.0. Se trata de un modelo denso de aproximadamente 4.000 millones de parametros (la cifra exacta no se detalla en la model card) derivado de la familia Gemma 3 de Google, orientado a generacion de texto y declarado unicamente para ingles. El nombre del repositorio (`raven_numbers-collapse_p10-run1-gen11`) sugiere que forma parte de una bateria de experimentos de entrenamiento, probablemente centrada en el comportamiento numerico del modelo, aunque la model card no documenta el objetivo, el dataset ni la metodologia.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado y sin resultados de evaluacion publicados. El modelo se entrena con Unsloth y la libreria TRL de Hugging Face, un flujo habitual para adaptaciones rapidas de bajo coste sobre modelos pequenos.

Para evaluar el modelo conviene separar dos capas: el modelo base (`gemma-3-4b-it`), bien documentado por Google, con ventana de contexto de 128.000 tokens y capacidades multimodales en su variante de 4B; y este ajuste concreto, del que solo se sabe que existe, pesa 0,1 GB y no aporta ninguna metrica. Cualquier uso en produccion deberia partir del modelo base oficial y no de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Gemma 3; no se detalla en la model card) |
| Parametros totales | No disponible en la model card (el modelo base Gemma 3 4B tiene ~4.000 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Gemma 3 4B soporta 128.000 tokens segun documentacion de Google) |
| Tipos de cuantizacion | No disponible. El ecosistema del modelo base ofrece GGUF, bitsandbytes (4/8 bits) y AWQ, pero no se confirma para este repositorio |
| Idiomas soportados | Ingles (`en`) declarado en la model card |
| Licencia | apache-2.0 (segun la model card; ver advertencias sobre la licencia del modelo base) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Modelo base | `unsloth/gemma-3-4b-it`, que a su vez deriva de `google/gemma-3-4b-it` |
| Libreria | transformers |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el proceso de entrenamiento. Lo unico que indica es que el modelo parte de `unsloth/gemma-3-4b-it` y que se entreno "2x mas rapido" con Unsloth y TRL. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el metodo de optimizacion (SFT, DPO, RLHF) ni los hiperparametros empleados. El nombre del repositorio incluye etiquetas de ejecucion (`p10`, `run1`, `gen11`) que apuntan a un barrido experimental, pero no se especifica a que variable corresponden.

Por herencia, la arquitectura subyacente es la de Gemma 3: un transformer decoder-only con atencion alterna local y global (ventana local de 1024 tokens combinada con capas de atencion global), tokenizador con vocabulario de gran tamano y soporte multimodal en las variantes de 4B, 12B y 27B. Estas caracteristicas pertenecen al modelo base publicado por Google y no estan confirmadas como intactas tras este ajuste, especialmente si el entrenamiento se realizo con adaptadores de bajo rango.

El tamano del repositorio (0,1 GB) es muy inferior a los aproximadamente 8 GB que ocuparian los pesos completos de un modelo de 4B en bf16. Esto sugiere que el repositorio contiene adaptadores LoRA o un guardado parcial, aunque la model card no lo confirma ni especifica como cargarlo. No se documenta ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base instruct.
- Razonamiento y conocimiento general: capacidades heredadas de Gemma 3 4B IT, no verificadas en este ajuste.
- Capacidades multimodales (vision): el modelo base Gemma 3 4B acepta imagenes, pero la model card de este repositorio no menciona vision ni se declara pipeline `image-text-to-text`, por lo que no se puede asumir que el ajuste la conserve.
- Tool calling / function calling: no documentado en la model card; el modelo base lo soporta de forma parcial.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card declara unicamente ingles; el modelo base cubre mas de 140 idiomas, pero no hay confirmacion de que este ajuste los mantenga.
- Capacidad especial (modo "thinking", audio, etc.): no documentada.

## Casos de uso

- Reproduccion de experimentos de investigacion: el repositorio puede servir para replicar un barrido de entrenamiento concreto (`run1`, `gen11`) sobre Gemma 3 4B IT y estudiar como el ajuste afecta al comportamiento del modelo base. Es el unico uso para el que hay indicios razonables, dado que no hay evaluacion publicada.
- Analisis de degradacion de capacidades ("collapse"): si el nombre del repositorio hace referencia a una perdida de habilidades numericas tras el ajuste, el modelo seria util como material de estudio de catastrophic forgetting en modelos pequenos.
- Comparacion de pipelines de fine-tuning: sirve para medir el coste y la calidad de un flujo Unsloth + TRL frente a alternativas (Axolotl, PEFT nativo) sobre un mismo modelo base.
- Base para un prototipo interno de generacion de texto: solo si se valida antes el modelo con un conjunto de evaluacion propio, dado que no existe ninguna metrica publicada y las descargas son cero.
- Pruebas de compatibilidad de infraestructura: por su tamano reducido, puede usarse para verificar que un endpoint de TGI o transformers carga correctamente adaptadores y responde, antes de desplegar un modelo mayor.
- Generacion de texto en ingles de baja exigencia: si el ajuste no ha degradado el modelo base, podria emplearse para tareas de resumen o redaccion corta, pero seria mas sensato partir directamente de `google/gemma-3-4b-it` o de `unsloth/gemma-3-4b-it`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, GSM8K, HumanEval, MT-Bench ni similares), ni comparaciones con el modelo base, ni descripcion de la perdida de validacion.

## Requisitos de hardware

Las cifras siguientes son estimaciones basadas en el tamano del modelo base Gemma 3 4B; el repositorio concreto no documenta requisitos.

- VRAM estimada para inferencia (modelo base 4B): ~8-9 GB en bf16/fp16 incluyendo cache KV para contextos moderados; ~2,5-4 GB en cuantizacion de 4 bits.
- Contextos largos: con 128.000 tokens de ventana, la cache KV puede anadir varios GB en funcion del lote y del backend; los backends con atencion paginada (vLLM) lo gestionan mejor.
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio concurrente; RTX 4090 o RTX 6000 Ada para uso individual con margen.
- GPU de consumo: si, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con cuantizacion de 4 u 8 bits; en bf16 completo requiere al menos 12-16 GB de VRAM.
- Opciones de despliegue: transformers + PEFT (si el repositorio contiene adaptadores), vLLM, TGI, llama.cpp/Ollama (previa conversion a GGUF del modelo mergado). TGI esta entre las etiquetas del repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones para este repositorio. Como referencia orientativa del modelo base 4B en una RTX 4090 con cuantizacion de 4 bits, cabria esperar decenas de tokens por segundo, pero es una estimacion no verificada.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de su documentacion publica y no de la informacion proporcionada sobre este repositorio.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (gemma_3_4b_it-raven_numbers-collapse) | No disponible (base ~4.000 M) | No disponible (base 128.000 tokens) | No documentado | apache-2.0 (segun model card) | 0 descargas, sin evaluacion |
| google/gemma-3-4b-it | ~4.000 M | 128.000 tokens | Si (imagen) | Gemma Terms of Use | Ampliamente disponible y evaluado |
| Qwen/Qwen2.5-3B-Instruct | ~3.090 M | 32.768 tokens (ampliable con YaRN) | No | Apache 2.0 | Ampliamente disponible, con benchmarks publicados |
| meta-llama/Llama-3.2-3B-Instruct | ~3.200 M | 128.000 tokens | No | Llama 3.2 Community License | Ampliamente disponible, con benchmarks publicados |

No se dispone de resultados de benchmarks de este repositorio que permitan comparar rendimiento numerico con las alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni carta de datos, ni descripcion del proceso de entrenamiento. No es posible estimar la calidad del ajuste ni si ha degradado las capacidades del modelo base.
- Riesgo elevado de alucinacion y de degradacion no detectada: un ajuste sin evaluacion puede haber optimizado una unica tarea a costa de las demas (el propio nombre del repositorio sugiere un fenomeno de "collapse").
- Tamano del repositorio (0,1 GB): es probable que no contenga los pesos completos. Conviene verificar los archivos antes de asumir que es un modelo autonómo; podria requerir cargar el modelo base y aplicar adaptadores.
- Idioma: solo se declara ingles. No hay garantia de soporte en castellano ni en otros idiomas, aunque el modelo base sea multilingue.
- Licencia: la model card declara apache-2.0, pero el modelo base Gemma 3 se distribuye bajo los Gemma Terms of Use. Etiquetar como Apache 2.0 un derivado de Gemma puede ser inconsistente; antes de un uso comercial hay que revisar los terminos que aplican al modelo base.
- Ausencia de pipeline declarado: no se especifica la tarea (`text-generation`, `image-text-to-text`), lo que complica la integracion automatica en entornos de despliegue.
- Sesgos: no documentados. Al no haber carta de datos ni evaluacion, no se puede afirmar nada sobre sesgos de genero, raza, idioma o dominio.
- Uso en produccion desaconsejado: sin metricas, sin datos de entrenamiento y sin mantenimiento (creado y actualizado el mismo dia, 0 descargas), no cumple los requisitos minimos de trazabilidad para un sistema en produccion.
- Reproducibilidad: se desconoce si el dataset y los hiperparametros estan publicados; sin ellos, los resultados no son reproducibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HungryDino/gemma_3_4b_it-raven_numbers-collapse_p10-run1-gen11
- Modelo base intermedio: https://huggingface.co/unsloth/gemma-3-4b-it
- Modelo base original de Google: https://huggingface.co/google/gemma-3-4b-it
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Informe tecnico de Gemma 3: https://arxiv.org/abs/2503.19786
- Documentacion de Gemma en Google AI: https://ai.google.dev/gemma/docs
- Anuncio de Gemma 3: https://blog.google/technology/developers/gemma-3/
