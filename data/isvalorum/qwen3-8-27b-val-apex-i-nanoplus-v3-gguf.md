# IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF

## Resumen

Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF es una cuantización GGUF del checkpoint base Qwen/Qwen3.8-27B, publicada por el usuario independiente IsValorum. No se trata de un modelo nuevo entrenado desde cero, sino de una compilación de pesos cuantizados a 3,57 bits por peso (BPW) con un tamaño de fichero de 12,18 GB, pensada para ejecución local en llama.cpp y otros runtimes compatibles con GGUF. El modelo base cuenta con 27.320.697.856 parámetros y una ventana de contexto nativa de 256K tokens según la model card.

La relevancia de esta edición radica en su método de cuantización propietario, denominado VAL-APEX-I (Vector-calibrated Asymmetric Layer-wise Outlier-preserving Recurrent-aware Unified Matrix-quantization), que asigna precisión de forma asimétrica por tensor para preservar los pesos críticos: mantiene en F32 los tensores de normalización y los estados recurrentes DeltaNet (`ssm_a`), y en Q8_0 los `ssm_beta`, además de proteger `output.weight` en Q5_K. El resultado es un modelo de 27B ejecutable en estaciones de trabajo con 24 GB de VRAM, con una degradación de perplejidad declarada del 8,00% frente al BF16 base.

Además, el GGUF integra un bloque de Multi-Token Prediction (MTP) en el mismo fichero (`blk.64.*`, 15 tensores), lo que habilita decodificación especulativa si el backend de inferencia lo soporta. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas recurrentes DeltaNet (modelo base Qwen3.8); cuantización GGUF con bloque MTP integrado |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 256K tokens nativos (según model card) |
| Tipos de cuantizacion | GGUF mixta: 3,57 BPW de media; Q4_0, Q4_1, Q5_K, Q8_0, F32 según familia de tensor |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer denso de 27.320 millones de parámetros con capas de atención recurrentes DeltaNet, tal como se deduce de la presencia de tensores `ssm_a` y `ssm_beta` en la auditoría de cuantización. Esta edición no reentrena ni afina el checkpoint: parte del modelo base original de Qwen, sin aplicar abliteración Huihui ni el fine-tuning EfficientThink que sí aparecen en otras variantes del mismo autor.

La innovación técnica está en el esquema de cuantización VAL-APEX-I, que combina calibración con matrices de imatrix (millones de tokens de calibración), asignación asimétrica de precisión por capa y preservación explícita de outliers. La asignación por familia de tensor es la siguiente: pesos de atención y MLP mayoritariamente en Q4_0, algunos en Q4_1 y Q5_K, estados recurrentes `ssm_a` en F32, `ssm_beta` en Q8_0 y la matriz de salida `output.weight` en Q5_K. El bloque MTP añadido usa Q4_0 ×6, Q4_1 ×1 y Q5_K ×1 para sus ocho matrices, con sus siete tensores de normalización en F32. No se dispone de información sobre el volumen total de tokens de entrenamiento del modelo base ni sobre si se aplicó RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat nativa de Qwen.
- Razonamiento explícito en modo thinking, según la etiqueta `reasoning` y la sección de chat template de la model card.
- Tool calling y function calling: los benchmarks reportados muestran 100/100 en tareas agénticas con tres harness distintos.
- Ejecución de tareas agénticas de múltiples pasos con esquemas JSON estrictos.
- Generación de código e implementación autónoma de tareas de programación.
- Decodificación especulativa vía MTP integrado, supeditada al soporte del backend.
- Capacidades multilingües limitadas: el modelo declara únicamente inglés.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Asistentes de código en local: con 12,18 GB de fichero cabe en GPU de consumo de 16-24 GB y permite autocompletado y generación de funciones en entornos sin conexión, con contexto de 256K para repositorios completos.
- Agentes autónomos con tool calling: los resultados de NanoBench (100/100 en agéntica con OMP, Hermes y DeepSeek Harness) lo hacen adecuado para pipelines que encadenan llamadas a herramientas con validación de esquema JSON.
- Automatización de tareas de sistemas: la puntuación de integridad de sistemas (86,7/100 en OMP y Hermes) sugiere uso en scripts de administración y despliegue con verificación de resultados.
- Atención al cliente en inglés: conversaciones multi-turno con contexto largo gracias a los 256K tokens, útil para historiales extensos de tickets.
- Procesamiento de documentos largos en inglés: resumen y extracción sobre contratos, informes o código fuente que exceden ventanas de 32K-128K.
- Inferencia en estaciones de trabajo modestas: despliegue con llama.cpp en una RTX 4090 o similar para prototipado rápido sin depender de API externa.
- Evaluación comparativa de cuantizaciones: útil como referencia de calidad para estudiar el impacto de esquemas de cuantización agresivos en modelos de 27B.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia |
|---|---|---|
| WikiText-2 PPL (NanoPlus V3) | 6,2577 ± 0,5011 | BF16 base: 5,7942 ± 0,4531 (+8,00%) |
| NanoBench v0.4.0 — Oh My Pi 18.7 | 96,7/100 (10/12 tareas) | Agéntica 100, coding 100, sistemas 86,7 |
| NanoBench v0.4.0 — Hermes Agent 0.21.5 | 95,4/100 (9/12 tareas) | Agéntica 100, coding 97,0, sistemas 86,7 |
| NanoBench v0.4.0 — DeepSeek Harness 0.2.0-rc.2 | 90,4/100 (9/12 tareas) | Agéntica 100, coding 97,0, sistemas 66,7 |

Los benchmarks de NanoBench fueron ejecutados por un miembro de la comunidad (@userr99) en una estación con 24 GB de VRAM y 64 GB de RAM usando llama.cpp. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: 12,18 GB de pesos más overhead de contexto KV cache; con 256K de contexto la caché puede consumir varios GB adicionales, por lo que se recomienda 24 GB de VRAM para contextos largos.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más con contexto moderado; en 12 GB requiere offload parcial a RAM.
- Opciones de despliegue: llama.cpp (runtime de referencia), Ollama, y otros backends compatibles con GGUF; la decodificación especulativa MTP requiere soporte específico del backend.
- Latencia y throughput: no disponibles; los benchmarks reportan un tiempo medio de ejecución de aproximadamente 1 h 47 min por harness completo en NanoBench.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño GGUF | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B VAL-APEX-I NanoPlus V3 (este) | 27,3B | 256K | 12,18 GB (3,57 BPW) | Apache 2.0 | PPL 6,2577; MTP integrado |
| Qwen3.8-27B VAL-APEX-I MiniPlus V3 | 27,3B | 256K | 14,16 GB | Apache 2.0 | Misma base, mayor precisión |
| Swift-1.5 Qwen3.8-27B Uncensored MTP NanoPlus V3 | 27,3B | 256K | 12,18 GB | Apache 2.0 | Variante sin censura con MTP |
| Qwen3.8-27B BF16 base | 27,3B | 256K | 54,65 GB | Apache 2.0 | Referencia de calidad (PPL 5,7942) |

No se dispone de datos de benchmarks de modelos de otros fabricantes en la información proporcionada para establecer comparaciones cruzadas.

## Limitaciones y advertencias

- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- Pérdida de calidad medible: +8,00% de perplejidad en WikiText-2 frente al BF16 base, con impacto potencial en tareas sensibles a precisión numérica.
- Benchmarks de comunidad: los resultados de NanoBench proceden de un único evaluador externo y no de una evaluación oficial del autor, por lo que deben tomarse con cautela.
- Riesgo de alucinación: inherente al modelo base; no se documentan mitigaciones específicas en esta edición.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la model card.
- Decodificación MTP: depende del soporte del backend; en runtimes sin soporte el bloque MTP queda inactivo.
- Uso comercial: permitido por Apache 2.0, pero conviene verificar las condiciones del modelo base Qwen3.8-27B.
- Contexto de 256K: requiere memoria adicional significativa para la KV cache; en GPU de 24 GB puede ser necesario reducir el contexto efectivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante MiniPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante Swift-1.5 Uncensored MTP MiniPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante Swift-1.5 Uncensored MTP NanoPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-NanoPlus-V3-GGUF
- Colección NanoPlus Standard 27B: https://huggingface.co/collections/IsValorum/val-apex-nanoplus-standard-27b-6acfec55c1c99e2a23ebbd9b
- Colección NanoPlus Abliterated 27B: https://huggingface.co/collections/IsValorum/val-apex-nanoplus-abliterated-27b-6acfec5503f6e74218f71f64
- NanoBench v0.4.0: https://shortbench.vercel.app/
- Hilo de discusión con logs de benchmarks: https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-NanoPlus-V3-GGUF/discussions/2
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
