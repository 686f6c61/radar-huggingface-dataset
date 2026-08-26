# pipenetwork/GLM-5.3-Flash-MLX-mixed-4_8bit

## Resumen

GLM-5.3-Flash-MLX-mixed-4_8bit es una conversión a MLX (Apple Silicon) del modelo GLM-5.3-Flash de Z.ai, un MoE multimodal de 320B parámetros totales con 18B activos. Esta build concreta aplica una cuantización mixta: los expertos enrutados (97% de los parámetros) se almacenan en 4 bits, mientras que el resto de proyecciones, embeddings y capas densas se mantienen en 8 bits, reduciendo el peso en disco de 642,7 GB (BF16 original) a 181,9 GB. El autor es pipenetwork, que también ha publicado versiones uniformes de 4, 6 y 8 bits.

El modelo base destaca por su arquitectura híbrida de atención lineal (Kimi-Delta) y atención sparse (DeepSeek-sparse attention con NoPE MLA), lo que reduce el coste de servir contextos largos sin sacrificar precisión. Con una ventana de contexto de 1M tokens, está orientado a tareas de largo horizonte, generación de código y razonamiento multimodal. Esta build MLX es relevante porque permite ejecutar un modelo de esta escala en hardware Apple con memoria unificada, algo inviable con los pesos BF16 originales.

La conversión mantiene la arquitectura sin cambios, aunque excluye la capa de predicción multi-token (MTP) y conserva el vision tower en bfloat16. El runtime requiere un parche específico para corregir dos bugs numéricos y dos discrepancias de epsilon detectados en la implementación de referencia de mlx-vlm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 34 capas Kimi-Delta linear-attention + 11 capas DeepSeek-sparse-attention (NoPE MLA + lightning indexer) con hyper-connections con restricción de manifold |
| Parametros totales | 320B (modelo base); 50.704.166.718 (pesos cuantizados en safetensors) |
| Parametros activos | 18B (modelo base) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 4-bit expertos (grupo 64), 8-bit resto (grupo 64); también disponibles builds uniformes 4-bit, 6-bit y 8-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash combina dos mecanismos de atención: 34 capas con atención lineal estilo Kimi-Delta y 11 capas con atención sparse estilo DeepSeek (MLA sin PE + lightning indexer). Esta hibridación permite escalar el contexto a 1M tokens con un coste de servicio menor que una atención full attention convencional. Las hyper-connections están restringidas por manifold, una innovación que mejora el escalado de la red. El modelo es nativamente multimodal (imagen-texto) y utiliza pesos FP8 en su versión original.

Esta build MLX no modifica la arquitectura, pero elimina la capa de predicción multi-token (MTP) y cuantiza los expertos enrutados a 4 bits. El proceso de conversión desde BF16 a MLX requirió corregir dos bugs numéricos en el runtime de referencia (clamp de `swiglu_limit` y dtype de las arrays mHC) y dos discrepancias de epsilon en normalizaciones. El checkpoint mantiene las arrays mHC y los parámetros de decaimiento KDA en float32 para preservar la fidelidad.

No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en el modelo base. La model card de esta build no aporta datos al respecto.

## Capacidades

- Generación de texto y razonamiento multimodal (imagen-texto) gracias al vision tower integrado.
- Razonamiento de largo horizonte: la ventana de 1M tokens permite mantener coherencia en tareas extensas y multi-paso.
- Generación de código: el modelo base está orientado a tareas de programación y depuración.
- Atención híbrida eficiente: combina atención lineal y sparse para reducir el coste de contexto largo.
- Soporte de tool calling y uso de agentes: no confirmado explícitamente en la documentación, pero es una capacidad habitual en la familia GLM-5.x; se recomienda verificar con pruebas específicas.
- Capacidades multilingües: no especificadas en la información disponible.

## Casos de uso

- Asistentes de programación con contexto de repositorio completo: con 1M tokens de contexto, el modelo puede procesar un código base entero y responder preguntas sobre él, sugerir refactorizaciones o generar tests. La cuantización 4/8-bit permite ejecutarlo en estaciones Apple con 192 GB o más de RAM unificada.
- Análisis de documentos extensos: contratos, informes técnicos o libros completos pueden procesarse en una sola pasada, extrayendo resúmenes, detectando inconsistencias o respondiendo preguntas específicas sobre el contenido.
- Agentes autónomos de larga duración: la combinación de contexto largo y razonamiento multi-paso permite que el modelo mantenga estado y planifique acciones durante horas sin perder el hilo, por ejemplo en automatización de tareas de investigación o gestión de proyectos.
- Generación de documentación técnica: a partir de un código fuente o una especificación, el modelo puede redactar manuales, guías de API o comentarios de código coherentes con el estilo del proyecto.
- Traducción y localización de contenido técnico: aunque los idiomas soportados no están documentados, el modelo base de Z.ai suele cubrir múltiples lenguas; puede usarse para traducir documentación técnica manteniendo terminología especializada.
- Prototipado rápido de aplicaciones multimodales: al aceptar entradas de imagen y texto, sirve para crear asistentes que describan diagramas, capturas de pantalla o esquemas de arquitectura, y generen código a partir de ellos.

## Benchmarks y rendimiento

La model card de esta build no publica resultados de benchmarks de tareas estándar (MMLU, HumanEval, GSM8K, etc.). En su lugar, proporciona mediciones de perplejidad en wikitext-2 (test) sobre 288.627 tokens en 141 ventanas de 2048, comparando las distintas builds cuantizadas con el mismo runtime:

| Build | Tamaño | Perplejidad | ΔNLL/token vs 8-bit [IC 95%] | Ventanas peores |
|---|---|---|---|---|
| 8-bit | 334,1 GB | 3,4607 | — | — |
| 6-bit | 255,9 GB | 3,4646 | +0,0011 [−0,0017, +0,0038] | 89/141 |
| mixed-4_8bit | 181,9 GB | 3,5705 | +0,0312 [+0,0271, +0,0355] | 131/141 |
| 4-bit uniforme | 177,6 GB | 3,7549 | +0,0816 [+0,0755, +0,0879] | 140/141 |

Frente al ancla de 8-bit, la build mixta 4/8-bit degrada la perplejidad un 3,2%, mientras que la uniforme 4-bit la degrada un 8,5%. La generación greedy (usada como detector de colapso) es coherente en todas las builds publicadas.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 181,9 GB en disco; en memoria unificada de Apple Silicon se necesitan al menos 192 GB libres para cargar los pesos, más overhead de runtime.
- GPU recomendadas: Apple Silicon con memoria unificada de 192 GB o superior (por ejemplo, Mac Studio con M2 Ultra o M3 Ultra de 192 GB, o configuraciones de 256 GB). No cabe en GPUs de consumo convencionales (RTX 4090, etc.) por su tamaño.
- Opciones de despliegue: runtime propio de pipenetwork (repositorio glm53-flash-mlx) o mlx-vlm (rama main, con parches). No es compatible con vLLM, llama.cpp u Ollama en esta forma MLX.
- Latencia y throughput: no se han publicado mediciones de velocidad. La generación greedy es funcional, pero el rendimiento dependerá del ancho de banda de memoria del chip (los M-series con mayor ancho de banda, como M2 Ultra, serán más rápidos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-5.3-Flash (BF16 original) | 320B-A18B | 1M | BF16 | MIT | Transformers |
| GLM-5.3-Flash-MLX-8bit | 320B-A18B | 1M | 8-bit uniforme | MIT | MLX |
| GLM-5.3-Flash-MLX-4bit | 320B-A18B | 1M | 4-bit uniforme | MIT | MLX |
| GLM-5.3-Flash-MLX-mixed-4_8bit | 320B-A18B | 1M | 4-bit expertos / 8-bit resto | MIT | MLX |
| GLM-5.2-MLX-mixed-3_6bit | no disponible | no disponible | 3-bit expertos / 6-bit resto | MIT | MLX |

La build mixta ofrece el mejor equilibrio entre tamaño (181,9 GB) y calidad (perplejidad 3,5705) frente a la uniforme 4-bit (177,6 GB, perplejidad 3,7549). La 8-bit es la más fiel pero requiere 334,1 GB. No se dispone de comparativas con otros modelos de la misma escala (por ejemplo, DeepSeek o Qwen) en esta documentación.

## Limitaciones y advertencias

- Tamaño extremo: incluso cuantizado, requiere 181,9 GB de almacenamiento y al menos 192 GB de RAM unificada, lo que limita su uso a estaciones Apple de gama alta.
- Runtime experimental: la arquitectura `glm5_next` no está soportada en ninguna release estable de mlx-vlm; requiere el runtime parcheado de pipenetwork, que corrige bugs numéricos pero no ha sido auditado por la comunidad.
- Capa MTP excluida: la predicción multi-token no está incluida, lo que puede afectar a la velocidad de generación en comparación con el modelo original.
- Degradación de calidad: la cuantización mixta introduce una pérdida de perplejidad del 3,2% frente a la build 8-bit, y del 3,1% frente al BF16 (asumiendo que 8-bit es estadísticamente indistinguible de BF16, como afirma el autor).
- Sin benchmarks de tareas: no hay resultados de MMLU, HumanEval, GSM8K u otros para esta build, por lo que no se puede evaluar su rendimiento en tareas específicas.
- Idiomas no documentados: no se especifica qué lenguas soporta el modelo; el multilingüismo no está garantizado.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgo ni de fiabilidad factual; como todo LLM, puede generar contenido plausible pero incorrecto, especialmente en contextos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pipenetwork/GLM-5.3-Flash-MLX-mixed-4_8bit
- Modelo base (BF16): https://huggingface.co/zai-org/GLM-5.3-Flash
- Modelo base BF16 (variante): https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Repositorio de código del runtime: https://github.com/PipeNetwork/glm53-flash-mlx
- Build 8-bit: https://huggingface.co/pipenetwork/GLM-5.3-Flash-MLX-8bit
- Build 6-bit: https://huggingface.co/pipenetwork/GLM-5.3-Flash-MLX-6bit
- Build 4-bit uniforme: https://huggingface.co/pipenetwork/GLM-5.3-Flash-MLX-4bit
- Build anterior (GLM-5.2-MLX-mixed-3_6bit): https://huggingface.co/pipenetwork/GLM-5.2-MLX-mixed-3_6bit
- Ficha de GLM-5.3 en openlm.ai: https://openlm.ai/glm-5.3/
- Documentación de unsloth sobre GLM-5.3-Flash: https://unsloth.ai/docs/models/glm-5.3
- Receta vLLM para GLM-5.3-Flash: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- Cuantización NVFP4 alternativa: https://huggingface.co/LibertAIDAI/GLM-5.3-Flash-NVFP4
