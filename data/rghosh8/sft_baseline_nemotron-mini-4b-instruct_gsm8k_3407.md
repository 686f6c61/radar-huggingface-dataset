# rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_gsm8k_3407

## Resumen

`rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_gsm8k_3407` es un ajuste fino supervisado (SFT) del modelo `nvidia/Nemotron-Mini-4B-Instruct`, publicado por el usuario rghosh8 en HuggingFace. Se trata de un checkpoint experimental de investigación, no de un modelo de producción: el nombre indica que se ha entrenado como línea base (baseline) sobre el conjunto de datos GSM8K con la semilla 3407, un patrón habitual en experimentos de reproducibilidad en razonamiento matemático.

El modelo hereda la arquitectura del Nemotron-Mini-4B-Instruct de NVIDIA, un transformer decoder-only de aproximadamente 4.190 millones de parámetros (4,19 B), empaquetado en safetensors con un tamaño de repositorio de 8,4 GB (lo que sugiere pesos en precisión de 16 bits). El ajuste se ha realizado con la librería TRL (versión 1.15.0) sobre Transformers 5.17.0 y PyTorch 2.13.0.

Su relevancia es limitada y acotada al ámbito de la investigación: cuenta con 0 descargas y 0 likes en el momento de la consulta, no declara licencia ni idiomas soportados, y su model card es la plantilla autogenerada por TRL sin documentación adicional sobre hiperparámetros, composición del dataset o resultados. Debe tratarse como un artefacto de experimentación reproducible, no como un modelo listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de nvidia/Nemotron-Mini-4B-Instruct) |
| Parametros totales | 4.190.509.056 (4,19 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el tamano del repo, 8,4 GB, es consistente con fp16/bf16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `nvidia/Nemotron-Mini-4B-Instruct`, un transformer decoder-only de 4,19 B de parámetros. No se dispone en la información proporcionada de detalles adicionales sobre el número de capas, dimensión oculta, cabezas de atención ni longitud de contexto nativa del modelo base.

El proceso de ajuste es un SFT (supervised fine-tuning) ejecutado con TRL 1.15.0. El identificador del checkpoint (`SFT_baseline_gsm8k_3407`) sugiere que el dataset de entrenamiento es GSM8K y que se ha fijado la semilla 3407, probablemente para comparar contra otras variantes experimentales. No se documentan en la model card el número de pasos, la tasa de aprendizaje, el tamaño de batch, el número de épocas, la composición exacta del dataset ni si hubo etapas posteriores de RLHF o DPO. Tampoco se describen innovaciones técnicas adicionales más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto conversacional en formato de chat (la model card incluye un ejemplo con `pipeline` y mensajes con rol `user`).
- Razonamiento matemático y resolución de problemas aritméticos de varios pasos, presumiblemente reforzado por el ajuste sobre GSM8K.
- Formato de instrucciones conversacional (heredado de Nemotron-Mini-4B-Instruct).
- Compatibilidad con endpoints de HuggingFace (tag `endpoints_compatible`).
- Capacidades multilingües: no disponibles (no declaradas).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Reproducción de experimentos de razonamiento matemático: sirve como línea base SFT sobre GSM8K con semilla fija (3407) para comparar contra variantes de ajuste (DPO, RLVR, etc.) en estudios de ablación.
- Evaluación de técnicas de fine-tuning con TRL: al estar generado con `SFTTrainer`, es útil como referencia para validar pipelines de entrenamiento y versiones de librerías (TRL 1.15.0, Transformers 5.17.0).
- Investigación sobre sobreajuste en datasets pequeños: GSM8K es un corpus relativamente acotado, por lo que el checkpoint permite estudiar degradación de capacidades generales tras SFT especializado.
- Pruebas de infraestructura de inferencia: con 4,19 B de parámetros y pesos en 8,4 GB, es adecuado para validar despliegues en vLLM, TGI o llama.cpp en GPUs de gama media antes de escalar a modelos mayores.
- Generación de respuestas matemáticas paso a paso en entornos controlados: útil para inspeccionar cadenas de razonamiento (chain-of-thought) producidas por un modelo pequeño ajustado específicamente para ello.
- Docencia y formación: ejemplo práctico de cómo se publica un checkpoint SFT con TRL y cómo se estructura una model card autogenerada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 10-12 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 4,5-5 GB.
- VRAM estimada en cuantización de 4 bits (si se generan pesos GGUF/AWQ): en torno a 2,5-3 GB.
- GPU recomendadas: NVIDIA A100, H100 o L40S para throughput alto; RTX 4090, RTX 3090 o RTX 4080 para inferencia individual.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en fp16, y en GPUs con 8 GB o más si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (soporte nativo), vLLM, TGI, llama.cpp/Ollama (previa conversión a GGUF), y endpoints de HuggingFace (tag `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_gsm8k_3407 | 4,19 B | No disponible | No disponible | HuggingFace (0 descargas) |
| nvidia/Nemotron-Mini-4B-Instruct (modelo base) | ~4 B | No disponible en esta ficha | No disponible en esta ficha | HuggingFace (modelo oficial de NVIDIA) |
| Otros SFT sobre GSM8K de tamano similar | Variable | Variable | Variable | No disponible |

La comparación más directa es con el modelo base `nvidia/Nemotron-Mini-4B-Instruct`, del que este checkpoint es un ajuste fino. No se dispone de datos de rendimiento comparativo entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental sin documentación: la model card es la plantilla autogenerada por TRL y no incluye hiperparámetros, composición del dataset ni resultados de evaluación.
- Licencia no declarada: el campo `licence` aparece vacío en la model card, lo que impide determinar si el uso comercial está permitido. Debe consultarse la licencia del modelo base de NVIDIA antes de cualquier uso en producción.
- Idiomas no declarados: no hay información sobre cobertura multilingüe; se asume un comportamiento similar al del modelo base, pero sin garantías.
- Riesgo de sobreajuste a GSM8K: el ajuste específico sobre un dataset matemático puede degradar capacidades generales de conversación e instrucciones.
- Riesgo de alucinación: como cualquier modelo de 4 B, puede generar cadenas de razonamiento plausibles pero incorrectas, especialmente fuera del dominio matemático.
- Sin validación externa: 0 descargas y 0 likes indican que el checkpoint no ha sido evaluado por la comunidad.
- Reproducibilidad limitada: aunque se fija la semilla 3407, no se documentan los detalles completos del entrenamiento (épocas, learning rate, batch size).
- No apto para producción sin evaluación previa: al no haber benchmarks publicados, no se recomienda su despliegue en sistemas reales sin una validación exhaustiva.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_gsm8k_3407)
- [Modelo base: nvidia/Nemotron-Mini-4B-Instruct](https://huggingface.co/nvidia/Nemotron-Mini-4B-Instruct)
- [Repositorio de TRL](https://github.com/huggingface/trl)
