# 0xSero/GLM-5.3-488B-EXL3-TR3-3.42bpw

## Resumen

GLM-5.3-488B-EXL3-TR3-3.42bpw es una versión podada del modelo GLM-5.3 de Z.AI, publicada por el usuario 0xSero. El modelo original es una arquitectura de mezcla de expertos (MoE) de 753B parámetros totales y ~40B activos por token. En esta variante, se han eliminado el 36 % de los expertos enrutados mediante la técnica REAP, pasando de 256 a 164 expertos por capa, lo que reduce el tamaño total a aproximadamente 488B parámetros. El checkpoint se construye aplicando la poda directamente sobre una cuantización EXL3 previa (3.42 bits por peso, con capas sensibles en BF16), de modo que no se requiere re-cuantización ni reentrenamiento.

El resultado es un modelo que ocupa 242 GB y puede ejecutarse en entornos con ~300 GB de VRAM, lo que facilita su uso en clústeres de múltiples GPUs de alta gama. Está pensado para investigadores y desarrolladores interesados en la compresión de modelos MoE, la inferencia de modelos masivos con recursos limitados o la comparación de cuantizaciones y podas. La licencia hereda la del modelo base GLM-5.3, que es una licencia personalizada de Z.AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), arquitectura GLM-5.3, 164 de 256 expertos enrutados por capa |
| Parametros totales | ~488B (modelo base de 753B con 164/256 de los expertos conservados) |
| Parametros activos | ~40B (8 expertos activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 trellis, 3.42 bits por peso (bpw), capas sensibles en BF16 |
| Idiomas soportados | no disponible |
| Licencia | other (hereda la licencia de GLM-5.3, ver enlace) |
| Formato de pesos | safetensors (EXL3, listo para exllamav3) |

## Arquitectura y entrenamiento

GLM-5.3 es un modelo MoE de 753B parámetros con 256 expertos por capa y 8 activos por token, lo que supone ~40B activos. El checkpoint presentado conserva 164 de los 256 expertos de cada capa, siguiendo el criterio de poda REAP (max-over-domain saliency). Cada experto se puntúa según su contribución máxima a un dominio individual, de manera que se mantienen los especialistas de cada dominio. Los expertos descartados se eliminan por completo, se renumeran los supervivientes y se ajustan los routers y la capa MTP para que coincidan.

La poda se aplica de forma byte-exacta sobre la cuantización EXL3 TR3 3.42bpw creada por davidsyoung, que cuantiza únicamente los expertos enrutados y deja las capas sensibles en BF16. No se ha realizado ningún reentrenamiento ni fine-tuning posterior. El modelo base GLM-5.3 fue desarrollado por Z.AI (zai-org), pero los detalles sobre sus datos de entrenamiento, tokens de preentrenamiento o procesos de alineación (RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional, según el pipeline y las etiquetas de HuggingFace.
- Razonamiento y comprensión del lenguaje natural esperables en un modelo de gran tamaño con ~40B parámetros activos.
- No se documenta soporte explícito de tool calling, function calling, agentes, visión o audio en la información disponible.
- Capacidades multilingües no documentadas en esta variante; se necesita consultar la documentación del modelo base.
- Implementa decodificación MTP (multi-token prediction), una característica del modelo base GLM-5.3 que se mantiene tras la poda.

## Casos de uso

- Investigación sobre compresión de modelos MoE: el modelo sirve como caso de estudio para evaluar el impacto de la eliminación de expertos sin reentrenamiento, gracias a la documentación del pipeline REAP y al estudio de fidelidad enlazado.
- Inferencia de LLM de gran escala en clústeres de GPUs: puede desplegarse con exllamav3 o TabbyAPI, usando tensor-split para repartir los pesos entre múltiples GPUs (por ejemplo, 4× A100 80 GB).
- Comparación de cuantizaciones y podas: los desarrolladores pueden comparar este checkpoint con la versión sin podar (GLM-5.3-EXL3-4.0bpw) para medir pérdidas de calidad y ganancias de eficiencia.
- Backend para asistentes conversacionales en data centers propios: al poder ejecutarse en ~300 GB de VRAM, es una alternativa a modelos propietarios para organizaciones con infraestructura de GPU disponible.
- Docencia y demostración técnica de expert pruning: el repositorio incluye enlaces al paper REAP, al collección de Cerebras y al código fuente, lo que facilita reproducir la técnica con un modelo real y masivo.
- Evaluación de la pérdida de fidelidad tras la poda: el autor proporciona un dataset de estudio de fidelidad (KL vs BF16) para verificar cómo afecta la eliminación de expertos a la distribución de salida en diferentes dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card menciona un estudio de fidelidad con valores de KL frente a la versión BF16, pero no se proporcionan los resultados numéricos en la información consultada.

## Requisitos de hardware

- VRAM estimada: 242 GB de tamaño de archivo; se recomienda ~300 GB de VRAM libre para la carga e inferencia, según la model card.
- GPU recomendadas: 4× A100 80 GB (320 GB) o 4× H100 80 GB (320 GB). También pueden utilizarse configuraciones con más GPUs de menor capacidad, siempre que sumen al menos ~300 GB (por ejemplo, 8× RTX 6000 Ada 48 GB).
- No cabe en una sola GPU consumer. Se necesitan al menos 4-5 GPUs profesionales de 80 GB o un clúster dedicado.
- Opciones de despliegue: exllamav3 (v3) y TabbyAPI, con soporte de tensor-split. No se documenta compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Tamaño / VRAM estimada |
|---|---|---|---|---|---|
| GLM-5.3 (base, BF16) | 753B | ~40B | no disponible | other | superior a 1 TB |
| GLM-5.3-488B-EXL3-TR3-3.42bpw (este) | ~488B | ~40B | no disponible | other | 242 GB (~300 GB VRAM) |
| GLM-5.3-EXL3-4.0bpw (sin podar, cuantizado) | 753B | ~40B | no disponible | other | ~360 GB (estimado) |
| Mixtral 8x22B | 141B | ~39B | 64k | Apache 2.0 | ~130 GB en BF16, menos en GGUF |

## Limitaciones y advertencias

- La poda de expertos puede degradar el rendimiento en dominios específicos cuyos expertos fueron eliminados. La magnitud de esta degradación no se ha cuantificado con benchmarks públicos.
- Riesgo de alucinación inherente a todos los modelos de lenguaje, especialmente sin afinar para la tarea concreta.
- No se han publicado resultados de benchmarks que permitan validar el rendimiento frente a modelos similares.
- La licencia es "other" y hereda la del modelo base GLM-5.3. Es necesario revisar los términos de esa licencia antes de cualquier uso comercial.
- El modelo exige una infraestructura de GPU considerable, lo que limita su accesibilidad a laboratorios o empresas con clústeres de alta gama.
- La metadata de HuggingFace reporta un valor de parámetros totales de 120.846.912.688, que difiere de la estimación de ~488B indicada en la model card. Esta discrepancia puede confundir a quienes utilicen el parámetro automáticamente.
- Los idiomas soportados no están documentados en esta variante; se debería comprobar la documentación oficial del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xSero/GLM-5.3-488B-EXL3-TR3-3.42bpw
- Modelo base GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Base quantizada previa: https://huggingface.co/davidsyoung/GLM-5.3-EXL3-TR3-3.42bpw
- Paper REAP: https://arxiv.org/abs/2510.13999
- Colección Cerebras REAP: https://huggingface.co/collections/cerebras/cerebras-reap
- GitHub del autor: https://github.com/0xsero
- Perfil de HuggingFace del autor: https://huggingface.co/0xSero
- Repositorio exllamav3: https://github.com/turboderp-org/exllamav3
- Estudio de fidelidad: https://huggingface.co/datasets/0xSero/glm-5.3-reap-fidelity-study
- Soporte al autor: https://donate.sybilsolutions.ai
- X (Twitter) del autor: https://x.com/0xsero
