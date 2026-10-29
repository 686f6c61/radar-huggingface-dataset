# nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash es la versión en GGUF BF16 del checkpoint borrador (draft) de decodificación especulativa DFlash para NVIDIA-Nemotron-3.5-Bolt-E4B, un modelo de lenguaje de razonamiento que NVIDIA ha post-entrenado a partir de Gemma 4 E4B IT de Google. No es un modelo autónomo: se carga junto al modelo objetivo en llama.cpp y su única función es proponer tokens candidatos que el modelo objetivo verifica, con el fin de reducir la latencia de decodificación en servir local.

El borrador tiene 360.480.000 parámetros (360M) distribuidos en cinco capas decoder de estilo Qwen3 y se publica como un único fichero GGUF de 736.812.096 bytes (aproximadamente 0,7 GB). No incluye embeddings de tokens ni cabeza de salida, sino que reutiliza los del modelo objetivo en tiempo de ejecución, lo que explica su tamano reducido y su dependencia estricta del checkpoint objetivo.

Su interes actual es practico: permite acelerar la inferencia local de un modelo de razonamiento de la familia Nemotron en GPUs de estación de trabajo (NVIDIA declara compatibilidad con RTX 5090) sin reentrenar ni recalibrar nada, simplemente pasando el flag `-md` a `llama-server`. El precio es una dependencia cerrada del modelo objetivo, de la versión de llama.cpp (b11808) y de un formato de pesos que solo cubre BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer; borrador DFlash de decodificación especulativa con cinco capas decoder de estilo Qwen3 |
| Parámetros totales | 360.480.000 (360M), en BF16 |
| Parámetros activos | No aplica: modelo borrador denso de 5 capas, no es MoE |
| Longitud de contexto | 131.072 tokens configurados en llama.cpp con `-c`; el borrador atiende solo a los 1.024 tokens más recientes mediante atención de ventana deslizante |
| Tipos de cuantización | BF16 (bfloat16) como único formato en este repositorio; el resto de cuantizaciones no está disponible |
| Idiomas soportados | No disponible (la model card no declara idiomas para este checkpoint) |
| Licencia | OpenMDW License Agreement 1.1; información adicional: Apache 2.0 para Gemma 4 E4B IT |
| Formato de pesos | GGUF (fichero único de 736.812.096 bytes; 736,81 MB / 702,68 MiB) |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-DFlash-NVFP4 (relación: quantized) |
| Modelo objetivo requerido | nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB (GGUF) |
| Runtime soportado | llama.cpp b11808 (`llama-server` con `-md`) |
| Hardware declarado | NVIDIA RTX 5090; sistema operativo Linux |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El checkpoint es un borrador de decodificación especulativa, no un modelo generativo completo. Su cuerpo son cinco capas decoder con la estructura habitual de Qwen3, y su entrenamiento se realizó con NVIDIA Model Optimizer 0.48.0; la conversión a GGUF se hizo con `convert_hf_to_gguf.py` de llama.cpp en el commit 4912ac2. Al no incluir embeddings de entrada ni cabeza de salida, en tiempo de ejecución toma prestadas ambas piezas del modelo objetivo, de modo que el espacio de vocabulario y la proyección final quedan siempre alineados con el modelo grande.

El mecanismo DFlash (descrito en el paper «DFlash: Block Diffusion for Flash Speculative Decoding», arXiv 2602.06036) hace que el borrador proponga hasta 7 tokens candidatos por paso de decodificación y que el modelo objetivo los verifique; el texto final siempre lo emite el objetivo. La model card enlaza como datos de post-entrenamiento Nemotron-Post-Training-Dataset-v2 (indicando únicamente prompts), pero no detalla el volumen de tokens, la composición del corpus ni si hubo RLHF o DPO para este borrador: esos datos no están disponibles.

## Capacidades

- Aceleración de decodificación: propone hasta 7 tokens candidatos por paso, verificados por NVIDIA-Nemotron-3.5-Bolt-E4B, reduciendo la latencia de generación respecto a la decodificación autorregresiva pura.
- Integración con llama.cpp: se carga con el flag `-md` en `llama-server` junto al GGUF del modelo objetivo; las aplicaciones siguen consultando el endpoint habitual sin cambios.
- Habilitación de razonamiento, chat, uso de herramientas y flujos agénticos: son los casos de uso que declara el autor, pero la calidad y el contenido de esas respuestas provienen del modelo objetivo, no del borrador.
- Atención de ventana deslizante de 1.024 tokens en el borrador, dentro de un contexto configurable de hasta 131.072 tokens en llama.cpp.
- No soporta generación autónoma: carece de embeddings y de cabeza de salida propias.
- Capacidades multimodales, de audio o de visión: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible; la model card no declara idiomas.

## Casos de uso

- Servicio local de razonamiento de baja latencia: cargar el borrador con `-md` junto a Nemotron-3.5-Bolt-E4B-4GB en `llama-server` sobre una RTX 5090 permite servir un modelo de razonamiento en estación de trabajo recortando el coste por token generado.
- Chat interactivo multi-turno: con el contexto configurado hasta 131.072 tokens, el objetivo mantiene conversaciones largas mientras el borrador acelera cada turno; es el escenario natural para asistentes internos con historial extenso.
- Flujos agénticos con tool calling: el modelo objetivo declara soporte de uso de herramientas y razonamiento multi-paso; el borrador reduce la latencia acumulada de las muchas llamadas cortas que caracteriza a estos pipelines.
- Generación de código en local: al acelerar la decodificación, el conjunto resulta viable para autocompletado y revisión de código en IDE sobre hardware de escritorio, sin enviar el código a la nube.
- Procesamiento por lotes de documentos largos: resúmenes, extracción de entidades o clasificación sobre corpus extensos se benefician de un mayor throughput por GPU al reducirse los pasos de decodificación efectivos.
- Despliegue con presupuesto de VRAM ajustado: el borrador ocupa menos de 1 GB en BF16, por lo que el coste incremental sobre el modelo objetivo es mínimo en GPUs de 24-32 GB.
- Evaluación de pipelines de decodificación especulativa: útil como referencia reproducible para medir tasas de aceptación y comparar configuraciones de llama.cpp en un entorno controlado.
- Prototipado con requisitos de privacidad: al ejecutarse íntegramente en local (Linux + llama.cpp), encaja en entornos donde los datos no pueden salir de la infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni tasas de aceptación de tokens del borrador, y el paper referenciado (arXiv 2602.06036) se cita únicamente como enlace, sin cifras reproducidas en la documentación del repositorio.

## Requisitos de hardware

- VRAM del borrador: menos de 1 GB en BF16 (fichero de 736,81 MB), sin contar la caché KV del modelo objetivo.
- VRAM total: la del borrador más la del objetivo NVIDIA-Nemotron-3.5-Bolt-E4B-4GB (el nombre del repositorio sugiere una huella de unos 4 GB, cifra exacta no disponible) más la caché KV correspondiente a los 131.072 tokens de contexto configurados.
- GPU declaradas: NVIDIA RTX 5090, con Linux como sistema operativo preferido. Otras GPU no están validadas oficialmente según la información disponible.
- GPU consumer: el borrador cabe en cualquier GPU con al menos 1 GB libre; la viabilidad del conjunto depende del modelo objetivo y de la longitud de contexto elegida.
- Opciones de despliegue: llama.cpp versión b11808 o superior, mediante `llama-server` con `-md`; no se documenta soporte para vLLM, TGI, Ollama ni otros runtimes.
- Latencia y throughput: no disponibles. El único dato cuantitativo es que el borrador propone hasta 7 tokens candidatos por paso de decodificación.

## Comparativa con modelos similares

| Modelo | Rol | Parámetros | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash (este) | Borrador DFlash para llama.cpp | 360,48M | 131.072 tokens (ventana de 1.024 en el borrador) | GGUF BF16 | OpenMDW 1.1 |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-DFlash-NVFP4 | Borrador DFlash en precisión NVFP4 | No disponible | No disponible | No disponible | OpenMDW 1.1 (según modelo base) |
| NVIDIA-Nemotron-3.5-Bolt-E4B-4GB | Modelo objetivo que verifica y emite el texto | No disponible | 131.072 tokens configurable en llama.cpp | GGUF | No disponible |
| Borradores de decodificación especulativa tipo EAGLE o Medusa | Alternativas de aceleración especulativa | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es interna a la familia: este checkpoint y la variante NVFP4 son el mismo borrador DFlash en dos precisiones distintas, y ambos exigen el mismo modelo objetivo. Frente a técnicas como EAGLE o Medusa no se dispone de datos de parámetros, contexto ni rendimiento en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo autónomo: sin embeddings de tokens ni cabeza de salida, no puede generar texto por sí solo y falla si se carga sin el modelo objetivo correspondiente.
- Dependencia de versión: la model card fija llama.cpp b11808 y `llama-server`; otras versiones o runtimes no están soportados oficialmente.
- Ventana deslizante de 1.024 tokens en el borrador: en contextos muy largos las propuestas se basan solo en la cola reciente, lo que puede reducir la tasa de aceptación (no se publican métricas al respecto).
- Riesgo de alucinación: el texto final lo produce el modelo objetivo, de modo que hereda sus sesgos y errores; el borrador no añade ninguna capa de verificación semántica, solo la verificación de tokens del objetivo.
- Idiomas: no declarados. No hay garantía documentada de cobertura multilingüe para este checkpoint.
- Licencia: OpenMDW 1.1 como término rector de la descarga, con Apache 2.0 adicional para el componente Gemma 4 E4B IT; conviene revisar ambas condiciones antes de un uso comercial en producción.
- Validación limitada: el hardware declarado se reduce a RTX 5090 con Linux, sin datos publicados de latencia, throughput ni tasa de aceptación.
- Madurez del ecosistema: 4.687 descargas y 14 likes en el momento de la consulta, con un repositorio de 0,7 GB; es un artefacto reciente y poco contrastado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Modelo base (DFlash en NVFP4): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-DFlash-NVFP4
- Modelo objetivo GGUF: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- Model card del modelo objetivo en BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Gemma 4 E4B IT (origen del post-entrenamiento): https://huggingface.co/google/gemma-4-E4B-it
- Paper DFlash: https://huggingface.co/papers/2602.06036
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp b11808: https://github.com/ggml-org/llama.cpp/releases#release-b11808
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
