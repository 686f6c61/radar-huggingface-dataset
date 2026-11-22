# Darshanshresthaa/step1-qwen1.5b-merged-non-instructional

## Resumen

`Darshanshresthaa/step1-qwen1.5b-merged-non-instructional` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-1.5B`, publicado por el usuario Darshanshresthaa en Hugging Face. Se trata de un modelo de generacion de texto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) construido sobre la arquitectura Qwen2, la familia de transformers decoder-only desarrollada por Alibaba. El modelo se ha entrenado utilizando la libreria Unsloth junto con TRL de Hugging Face, lo que segun el autor permite un entrenamiento "2x mas rapido".

El nombre del repositorio incluye el sufijo "merged-non-instructional", lo que sugiere que los pesos del adaptador se han fusionado (merged) con el modelo base y que el ajuste no esta orientado a seguir instrucciones conversacionales, sino probablemente a una tarea especifica de continuacion de texto o dominio concreto. No obstante, la model card no proporciona detalles sobre el dataset de entrenamiento, el objetivo del fine-tuning ni los hiperparametros utilizados.

La relevancia de este modelo es limitada en terminos de adopcion: cuenta con 0 descargas y 0 likes en el momento de la consulta, y la documentacion es minima. Resulta util principalmente como ejemplo de pipeline de fine-tuning con Unsloth sobre Qwen2.5-1.5B, o para quien necesite exactamente la variante entrenada por este autor. Para casos de uso generales, el modelo base Qwen2.5-1.5B ofrece mayor trazabilidad y documentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (aprox. 1,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B soporta hasta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar; compatible con cuantizacion posterior via GGUF/AWQ, no confirmado) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base `unsloth/Qwen2.5-1.5B` es una version optimizada para entrenamiento de Qwen2.5-1.5B, publicada por Unsloth. El fine-tuning se realizo con Unsloth y TRL, tecnicas que reducen el uso de memoria y aceleran el entrenamiento mediante kernels optimizados y posiblemente LoRA/QLoRA, aunque la model card no especifica si se uso PEFT o un ajuste completo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO, ni las tecnicas de alineacion aplicadas. El sufijo "non-instructional" sugiere que el entrenamiento no fue de tipo instruccional (SFT sobre pares instruccion-respuesta), sino posiblemente de continuacion de texto o adaptacion a un dominio. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion linear.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Razonamiento basico y respuesta a preguntas (heredado del modelo base Qwen2.5-1.5B, aunque el fine-tuning puede haber alterado estas capacidades).
- Generacion de codigo y matematicas a nivel basico, segun las capacidades del modelo base (no verificado en esta variante).
- Soporte de tool calling / function calling: no confirmado en esta variante; el modelo base Qwen2.5 lo soporta, pero el fine-tuning "non-instructional" podria haber degradado esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: limitadas al ingles segun la model card (el modelo base soporta mas idiomas, pero no se garantiza en esta variante).
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Experimentacion con pipelines de fine-tuning: sirve como referencia para reproducir el flujo Unsloth + TRL sobre Qwen2.5-1.5B, comparando el modelo fusionado con el base.
- Generacion de texto en dominio especifico: si el autor entreno sobre un corpus concreto (no documentado), podria usarse para continuar texto en ese dominio, aunque se desconoce cual es.
- Prototipado rapido en entornos con recursos limitados: al tener 1,5 B de parametros, se puede ejecutar en GPU de consumo para pruebas de generacion de texto.
- Base para nuevos fine-tunings: al estar fusionado y en safetensors, puede servir como punto de partida para ajustes posteriores con PEFT.
- Evaluacion comparativa de tecnicas de merge: util para estudiar el efecto de fusionar adaptadores sobre el modelo base en tareas de continuacion de texto.
- Docencia y demostraciones: ejemplo de modelo pequeno para explicar el ciclo completo de entrenamiento y publicacion en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos (1,543 B x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion 8-bit: aproximadamente 1,6 GB para pesos; en 4-bit: aproximadamente 0,8 GB.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100; cualquier GPU con al menos 6-8 GB de VRAM puede ejecutarlo en fp16 con contexto corto.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas (en cuantizacion, incluso menos).
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama mediante conversion a GGUF (no incluida en el repo, requiere conversion manual).
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,5 B, se espera throughput alto en GPU modernas, pero no hay mediciones publicadas para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Darshanshresthaa/step1-qwen1.5b-merged-non-instructional | 1,5 B | no disponible | apache-2.0 | Hugging Face, 0 descargas | Fine-tuning no documentado sobre Qwen2.5-1.5B |
| Qwen/Qwen2.5-1.5B | 1,5 B | 32.768 tokens | apache-2.0 | Hugging Face, ampliamente usado | Modelo base oficial, documentado y con benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | apache-2.0 | Hugging Face, ampliamente usado | Variante instruccional con alineacion |
| unsloth/Qwen2.5-1.5B | 1,5 B | 32.768 tokens | apache-2.0 | Hugging Face | Version optimizada para entrenamiento del base |

## Limitaciones y advertencias

- Documentacion minima: la model card no describe dataset, objetivo ni hiperparametros, lo que impide evaluar la calidad del fine-tuning.
- Riesgo de alucinacion: inherente a los modelos de 1,5 B; el fine-tuning no documentado puede agravar o alterar este comportamiento.
- Sesgos conocidos: no documentados; el modelo base Qwen2.5 puede presentar sesgos de los datos de entrenamiento originales, no evaluados en esta variante.
- Limitacion de idioma: la model card solo declara ingles; el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero al ser un fine-tuning sin documentacion, el usuario asume el riesgo sobre la procedencia y calidad de los datos de ajuste.
- Capacidades instruccionales degradadas: el sufijo "non-instructional" sugiere que el modelo no esta optimizado para seguir instrucciones, por lo que no se recomienda para asistentes conversacionales sin validacion previa.
- Sin adopcion ni validacion comunitaria: 0 descargas y 0 likes implican ausencia de retroalimentacion externa sobre su comportamiento.
- Fecha de creacion futura (2026-11-22): dato anomalo que conviene verificar antes de confiar en los metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/Darshanshresthaa/step1-qwen1.5b-merged-non-instructional
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Repositorio TRL: https://github.com/huggingface/trl
- Modelo oficial Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
