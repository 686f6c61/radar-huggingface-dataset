# ridhanhimmee/model-2-selector-qwen15b

## Resumen

`ridhanhimmee/model-2-selector-qwen15b` es un ajuste fino (fine-tune) publicado por el usuario ridhanhimmee sobre `unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit`, es decir, sobre el modelo instructivo Qwen2.5 de 1.500 millones de parámetros en su variante cuantizada a 4 bits con bitsandbytes. El entrenamiento se realizó con Unsloth, la librería de optimización de fine-tuning que reduce el uso de memoria y acelera el entrenamiento, y el resultado se distribuye con licencia Apache 2.0 en formato safetensors.

El modelo resuelve, en principio, una tarea de selección o enrutamiento ("selector"), a juzgar por su nombre, dentro de una familia de artefactos del mismo autor; sin embargo, la model card no documenta el conjunto de datos, el objetivo de entrenamiento ni el formato de entrada/salida esperado, por lo que su función exacta no está especificada. El repositorio ocupa 0,1 GB, un tamaño muy inferior al de los pesos completos en bf16 de un modelo de 1,5B (unos 3 GB), lo que sugiere que los artefactos publicados no son un checkpoint denso completo, sin que la card aclare si se trata de un adaptador LoRA o de pesos fusionados.

Su relevancia es limitada y hay que contextualizarla: se trata de un experimento de fine-tuning reproducible con Unsloth, sin descargas ni valoraciones en el momento de la ficha, sin métricas publicadas y sin evaluación independiente. Es útil como punto de partida técnico o como ejemplo de pipeline de ajuste sobre Qwen2.5-1.5B, no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (heredada del modelo base; no documentada en la card) |
| Parámetros totales | ~1,54 B (heredado de Qwen2.5-1.5B-Instruct; no verificado en este repositorio) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens según el modelo base; no verificado para este fine-tune (no disponible en la card) |
| Tipos de cuantización | Base entrenada sobre bnb-4bit (bitsandbytes 4 bits); el repositorio no publica GGUF, AWQ, GPTQ ni otras variantes |
| Idiomas soportados | Inglés (etiqueta `language: en`); el modelo base es multilingüe, pero este ajuste solo declara inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`transformers`) |
| Librería y tooling | transformers, TRL, Unsloth, text-generation-inference |
| Tamaño del repositorio | 0,1 GB (no se especifica si son adaptadores LoRA o pesos fusionados) |
| Estado de publicación | 0 descargas, 0 likes; creado el 24/10/2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atención de consultas agrupadas (GQA), normalización RMSNorm, activación SwiGLU y embeddings RoPE, diseñado para generación de texto e instrucciones. El fine-tune parte de la variante pre-cuantizada a 4 bits del modelo base, lo que implica que el ajuste se hizo con QLoRA o una estrategia equivalente de bajo rango sobre pesos cuantizados.

No hay información publicada sobre el proceso de entrenamiento: se desconoce el número de tokens, la composición del dataset, si se aplicó SFT supervisado, DPO o RLHF, la configuración de LoRA (rango, alpha, módulos objetivo), la tasa de aprendizaje o el número de épocas. La única innovación técnica declarada es el uso de Unsloth, que la card describe como un entrenamiento "2x más rápido" mediante kernels optimizados y menor huella de memoria; no se documenta ninguna técnica de decodificación especulativa ni de atención lineal.

## Capacidades

- Generación de texto conversacional e instruccional, heredada de Qwen2.5-1.5B-Instruct.
- Razonamiento básico de un solo paso y matemáticas elementales, limitado por el tamaño de 1,5B.
- Generación de código y explicaciones técnicas a nivel introductorio-medio.
- Salida estructurada en JSON y seguimiento de formatos, capacidad típica del modelo base.
- Tool calling / function calling: soportado por el modelo base, no verificado tras el ajuste.
- Capacidades de agente multi-paso: no documentadas y poco realistas a este tamaño sin andamiaje externo.
- Multilingüismo: la card solo declara inglés; no se garantiza el rendimiento en castellano ni en otros idiomas.
- Sin capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Enrutamiento o clasificación de consultas: usar el modelo como selector ligero que, dada una pregunta, devuelva la etiqueta del modelo o herramienta adecuada; el nombre del repositorio apunta a este uso, aunque el formato exacto de salida no está documentado y habría que inferirlo por pruebas.
- Preprocesado en pipelines RAG: clasificar y reescribir consultas antes de la recuperación vectorial, con un coste de cómputo mínimo al ser un modelo de 1,5B ejecutable en CPU o en GPU de gama baja.
- Etiquetado y anotación semiautomática de datos en inglés: generar etiquetas preliminares sobre corpus de texto para revisión humana posterior, aprovechando que el ajuste declara únicamente inglés.
- Prototipado rápido de asistentes conversacionales: desplegar un chatbot de dominio acotado con contexto de hasta 32.768 tokens (heredado del base) para conversaciones multi-turno con documentación adjunta.
- Extracción de campos estructurados: convertir texto libre en JSON con esquemas definidos para alimentar un ETL o una base de datos, validando la salida con un parser y reglas de esquema.
- Base para experimentos de fine-tuning reproducible: sirve como referencia de pipeline Unsloth + TRL sobre Qwen2.5-1.5B para equipos que quieran replicar el proceso con sus propios datos.
- Filtrado previo a un modelo grande: descartar consultas triviales o fuera de dominio antes de invocar un LLM mayor, reduciendo coste por token en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y tampoco se han encontrado evaluaciones independientes en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 3,1 GB solo para pesos, más caché KV; con 32.768 tokens de contexto y lote 1, el consumo realista se sitúa entre 4 y 6 GB (estimación, no medida).
- VRAM estimada en 8 bits: aproximadamente 1,6 GB de pesos; uso típico de 3 a 4 GB con contexto moderado.
- VRAM estimada en 4 bits: alrededor de 1 GB de pesos; uso típico de 2 a 3 GB, lo que permite ejecución en GPUs de 4-8 GB.
- GPU recomendadas: NVIDIA A100/H100 no son necesarias; para servicio concurrente con vLLM resultan útiles una L4, L40S o A10G. Para desarrollo, RTX 3060 12 GB, RTX 4060 Ti 8/16 GB o RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más en cuantización de 4 bits; también en CPU con llama.cpp tras convertir los pesos a GGUF.
- Opciones de despliegue: transformers con bitsandbytes; TGI (la etiqueta `text-generation-inference` está presente); vLLM para serving con throughput alto; llama.cpp u Ollama requieren generar previamente un GGUF, que el repositorio no incluye.
- Latencia y throughput: no disponibles. No se han publicado mediciones y, dado el estado del repositorio (0 descargas), no existen referencias de terceros.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ridhanhimmee/model-2-selector-qwen15b | ~1,54 B (heredado) | 32.768 (heredado, no verificado) | Apache 2.0 | HuggingFace, 0 descargas | Fine-tune sin documentar ni evaluar |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base de referencia, con benchmarks publicados por el autor original |
| Llama-3.2-1B-Instruct | ~1,24 B | 128.000 | Llama 3.2 Community License | HuggingFace, requiere aceptar términos | Contexto mucho mayor; licencia no Apache |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8.192 | Apache 2.0 | HuggingFace | Alternativa ligera totalmente abierta, orientada a dispositivos |

Los datos de los modelos comparables provienen del conocimiento público de esos modelos y no han sido verificados en la búsqueda web realizada para esta ficha; tómense como orientativos.

## Limitaciones y advertencias

- Ausencia total de documentación: no se especifican datos de entrenamiento, hiperparámetros ni formato de entrada/salida, lo que impide reproducir el ajuste o anticipar su comportamiento.
- Sin evaluación: no hay benchmarks ni validación de terceros; el rendimiento es desconocido y podría ser inferior al del modelo base por sobreajuste o por catastrophic forgetting.
- Idiomas: la card declara únicamente inglés; el uso en castellano no está soportado y previsiblemente degradará la calidad respecto al modelo base multilingüe.
- Cuantización de partida en 4 bits: el ajuste se realizó sobre pesos bnb-4bit, lo que introduce ruido de cuantización que no se puede recuperar fusionando adaptadores.
- Alucinación: en un modelo de 1,5B el riesgo de inventar hechos, citas o APIs es alto, especialmente en dominios especializados y en contextos largos.
- Sesgos: no se ha publicado ninguna evaluación de sesgos, toxicidad o sesgo demográfico; se heredan los del corpus de entrenamiento original, desconocido.
- Riesgo de fuga de datos: si el ajuste se hizo con datos privados o sintéticos no documentados, podría reproducir fragmentos de esos datos en la generación.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario debe verificar el cumplimiento de las condiciones del modelo base y de las dependencias (Unsloth, TRL) que intervienen en el pipeline.
- Estado del repositorio: sin descargas ni likes, sin issues ni discusiones; no hay señal de mantenimiento ni soporte.
- No apto para producción sin una evaluación propia: se recomienda comparar contra Qwen2.5-1.5B-Instruct original en el conjunto de datos real de la aplicación antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ridhanhimmee/model-2-selector-qwen15b
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit
- Repositorio de Unsloth (mencionado en la card): https://github.com/unslothai/unsloth
- Página de datasets del autor: https://huggingface.co/ridhanhimmee/datasets
- Benchmarks y leaderboards consultados (sin datos del modelo): https://benchlm.ai/

No se han encontrado en la búsqueda web papers, blogs técnicos, demos ni repositorios adicionales asociados específicamente a este modelo.
