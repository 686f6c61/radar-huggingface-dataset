# Aadi1212/grievanceiq-qwen2.5-1.5b-lora

## Resumen

El modelo `Aadi1212/grievanceiq-qwen2.5-1.5b-lora` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, desarrollado por el usuario Aadi1212. Su propósito declarado, según el nombre y los tags, es el procesamiento de quejas y reclamaciones (grievance handling), aunque la model card no detalla el dataset de entrenamiento ni la tarea concreta. Se trata de un fine-tuning mediante supervisión directa (SFT) que aprovecha la arquitectura transformer densa y decoder-only del modelo base, con 1.500 millones de parámetros y una ventana de contexto de 32 768 tokens.

La relevancia de este adaptador reside en su tamaño reducido: al ser un LoRA, el coste de inferencia es prácticamente el del modelo base, lo que permite desplegarlo en hardware consumer y adaptarlo a dominios específicos sin necesidad de reentrenar el modelo completo. Sin embargo, la documentación disponible es mínima, por lo que cualquier evaluación rigurosa requiere pruebas adicionales por parte del usuario final. El modelo se publica con la librería PEFT y pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | 1 540 millones (1.5B del modelo base + adaptador) |
| Parametros activos | 1.500 millones (el adaptador anade parametros, pero no se especifican) |
| Longitud de contexto | 32 768 tokens (del modelo base) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base soporta cuantizacion GGUF, AWQ y GPTQ |
| Idiomas soportados | No disponible para el adaptador; el modelo base soporta ingles, chino, espanol, frances, aleman, etc. |
| Licencia | No disponible (el modelo base usa Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base, `Qwen2.5-1.5B-Instruct`, es un transformer denso, decoder-only, preentrenado con hasta 18 billones de tokens según el repositorio oficial. Sobre esta base, el adaptador LoRA introduce matrices de bajo rango en las capas de atencion y feed-forward, lo que permite un fine-tune eficiente en terminos de parametros y computo. El entrenamiento del adaptador se realizo mediante SFT (supervised fine-tuning), probablemente con la libreria TRL de Hugging Face, como indica la etiqueta `trl`.

No se ha publicado informacion sobre el dataset de entrenamiento, la composicion de los datos, el numero de pasos, el rango de LoRA, el factor de escala ni los hiperparametros utilizados. Tampoco se especifica si se aplicaron tecnicas de alineacion como RLHF o DPO. El unico dato confirmado es el uso de la version 0.20.0 de PEFT.

## Capacidades

- Generacion de texto y conversacion multiuso, heredadas del modelo base instruct.
- Especializacion declarada en el dominio de quejas y reclamaciones, aunque sin documentacion que detalle la tarea exacta (clasificacion, extraccion, generacion de respuestas).
- Soporte de razonamiento y generacion de codigo, segun las capacidades de Qwen2.5-1.5B-Instruct.
- Ventana de contexto amplia (32 768 tokens) que permite procesar documentos extensos o historiales de conversacion.
- No se confirma soporte de tool calling ni de agentes en el adaptador; el modelo base si lo incluye, pero no se ha validado en el fine-tune.

## Casos de uso

- **Clasificacion automatica de reclamaciones**: el adaptador puede clasificar tickets de soporte por categoria (facturacion, servicio, producto) usando la ventana de 32K tokens para procesar la descripcion completa del problema.
- **Generacion de respuestas a quejas**: el modelo puede redactar borradores de respuesta empatica y resolutiva, integrable en un sistema de ticketing.
- **Analisis de sentimiento en feedback de clientes**: al estar fine-tuneado en el dominio, puede extraer el tono y la urgencia de las quejas de forma mas precisa que el modelo base.
- **Soporte multilingo en atencion al cliente**: gracias al modelo base, el adaptador puede manejar consultas en varios idiomas, aunque su rendimiento en cada uno no se ha validado.
- **Prototipado rapido**: al ser un LoRA de 1.5B, es ideal para experimentar en entornos de investigacion con una sola GPU.
- **Pre-procesamiento de datos legales**: para clasificar documentos de reclamaciones en organismos de consumo, usando la ventana de contexto para leer clausulas completas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones especificas para la tarea de quejas. Se recomienda evaluar el modelo con un conjunto de datos propio del dominio antes de usar en produccion.

## Requisitos de hardware

- **VRAM estimada**: el modelo base en FP16 ocupa aproximadamente 3 GB; con el adaptador LoRA, el uso total no supera los 3.5 GB. En cuantizacion INT4, puede bajar a 1.5 GB.
- **GPUs compatibles**: cualquier GPU con 4 GB o mas de VRAM, incluyendo NVIDIA RTX 3060, RTX 4060, T4 en la nube, o incluso Apple Silicon con Metal.
- **Despliegue**: compatible con vLLM, llama.cpp, Ollama y TGI, aunque el adaptador PEFT requiere cargarse con `transformers` y `peft` antes de exportar a GGUF o similar.
- **Latencia**: no se ha medido, pero con un modelo de 1.5B en una RTX 4090 se espera un throughput de 50-100 tokens por segundo en FP16.
- **Inferencia en CPU**: posible con cuantizacion y llama.cpp, con latencia de 5-10 tokens por segundo.

## Comparativa con modelos similares

No hay modelos comparables directamente en la misma tarea (quejas) publicados con el mismo tamano. Como referencia, se puede comparar con el modelo base y con otros LoRA de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| `grievanceiq-qwen2.5-1.5b-lora` | 1.5B | 32K | No disponible | Quejas/reclamaciones |
| `Qwen2.5-1.5B-Instruct` (base) | 1.5B | 32K | Apache 2.0 | Generico |
| `Llama-3.2-1B-Instruct` | 1.0B | 128K | Llama 3.2 | Generico |

La comparacion es parcial porque el adaptador no aporta datos de rendimiento. La ventaja del LoRA es la ligereza; la desventaja es la falta de documentacion y validacion.

## Limitaciones y advertencias

- **Model card incompleta**: no hay informacion sobre el dataset de entrenamiento, lo que impide evaluar sesgos o calidad de los datos.
- **Riesgo de alucinacion**: al ser un modelo de 1.5B, es mas propenso a inventar respuestas que modelos grandes; la especializacion en quejas no reduce este riesgo inherente.
- **Sesgos desconocidos**: al no conocer el dataset, no se pueden anticipar sesgos de genero, raza o idioma.
- **Licencia no clara**: el adaptador no especifica licencia; aunque el modelo base es Apache 2.0, el adaptador podria tener restricciones. Se recomienda contactar al autor antes de uso comercial.
- **Sin evaluacion de tool calling**: aunque el modelo base lo soporta, no se ha validado que el adaptador mantenga esa capacidad tras el SFT.
- **Riesgo en produccion**: sin benchmarks, no se recomienda su uso en sistemas criticos sin una validacion previa con datos reales de la organizacion.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Aadi1212/grievanceiq-qwen2.5-1.5b-lora)
- [Modelo base Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- [Repositorio oficial de Qwen2.5](https://github.com/mx4ai/qwen2.5)
- [Qwen2.5-1.5B-Instruct en ModelScope](https://www.modelscope.cn/models/qwen/Qwen2.5-1.5B-Instruct)
