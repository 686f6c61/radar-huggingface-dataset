# dealignai/GLM-5.3-UNCENSORED-FP8

## Resumen

GLM-5.3-UNCENSORED-FP8 es una edición de pesos del modelo GLM-5.3 (753 mil millones de parámetros, arquitectura `glm_moe_dsa`) publicada por el usuario dealignai bajo el sello "CRACK". Se trata de una variante "uncensored" que elimina el comportamiento de rechazo directamente en los tensores del modelo, mediante una modificación permanente en los tensores residual-writer en bf16, sin fine-tuning, sin LoRA, sin hooks en tiempo de ejecución ni trucos de prompt. El modelo base es `JANGQ-AI/GLM-5.3-FP8`, una cuantización FP8 del lanzamiento original de Z.ai (`zai-org/GLM-5.3`).

El modelo mantiene la arquitectura MoE (Mixture of Experts) con 78 capas, solo texto, y está disponible en formato safetensors. Según el autor, la edición no afecta a los expertos enrutados en FP8, sino únicamente a los escritores residuales en bf16, lo que permite cargarlo con vLLM estándar sin modificaciones. La licencia es MIT, igual que la del modelo base.

La relevancia de este lanzamiento radica en que ofrece una alternativa "sin censura" a un modelo de gran escala, con una degradación de capacidades supuestamente mínima (el autor reporta una diferencia menor al 0,50 % en pruebas de capacidad para una variante similar, aunque los datos concretos de MMLU para este modelo están pendientes). Está pensado para investigación, escritura creativa, evaluación de alineación y red-teaming, con advertencias explícitas sobre su uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM MoE DSA (`glm_moe_dsa`), 78 capas, solo texto |
| Parametros totales | 753.329.940.480 (753B) |
| Parametros activos | no disponible (arquitectura MoE, no se especifica el número de activos) |
| Longitud de contexto | 131.072 tokens (según configuración de ejemplo en vLLM) |
| Tipos de cuantizacion | FP8 (pesos originales de `JANGQ-AI/GLM-5.3-FP8`); existe variante NVFP4 en otro repositorio |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 755,7 GB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformador MoE con arquitectura `glm_moe_dsa` (DeepSeek-Sparse Attention, según se deduce del tag y de las notas de vLLM sobre la ruta de atención). Tiene 753B parámetros totales, 78 capas y es exclusivamente de texto. La variante `JANGQ-AI/GLM-5.3-FP8` es una cuantización FP8 del original, que mantiene los expertos enrutados en FP8 para aprovechar los tensor cores de las GPUs Hopper.

La edición "uncensored" de dealignai no implica reentrenamiento. Consiste en una modulación de pesos a nivel de bf16 en los tensores residual-writer, que reduce la probabilidad de respuestas de rechazo en una taxonomía amplia de daños multilingüe. No se utilizan adaptadores, vectores de dirección ni cambios en el archivo del modelo. Según el autor, el resultado es un modelo que "simplemente funciona" con vLLM estándar.

No se dispone de información pública sobre el dataset de entrenamiento original de GLM-5.3, ni sobre el proceso de alineación (RLHF/DPO u otros). Los detalles de la edición de pesos tampoco se documentan más allá de la descripción general.

## Capacidades

- Generación de texto conversacional y de larga forma en múltiples idiomas (inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano, japonés).
- Razonamiento multi-step: el comando de vLLM incluye `--reasoning-parser glm45`, lo que sugiere soporte para modos de razonamiento explícito.
- Tool calling / function calling: el comando de ejemplo incluye `--tool-call-parser glm47` y `--enable-auto-tool-choice`, indicando compatibilidad con llamadas a herramientas.
- Capacidad de contexto largo (hasta 131.072 tokens según la configuración de ejemplo).
- Sin capacidades de visión ni audio (modelo solo texto).
- El autor indica que la edición reduce el rechazo en una amplia gama de categorías de daño, no solo en un dominio concreto.
- No se menciona soporte para decodificación especulativa MTP en esta variante (el autor advierte que MTP no es funcional en GLM-5.3 regular en vLLM).

## Casos de uso

- Investigación en seguridad ofensiva: el modelo puede generar explicaciones técnicas sobre exploits, payloads y herramientas de red-teaming, algo que los modelos alineados suelen rechazar. Es adecuado para equipos de seguridad que necesitan estudiar técnicas de ataque en entornos autorizados.
- Red-teaming de productos downstream: dado que el modelo no presenta rechazo, permite evaluar cómo un sistema basado en LLM podría ser explotado para generar contenido dañino, ayudando a identificar vulnerabilidades de alineación.
- Escritura creativa con temas tabú: novelas, guiones o narrativas que aborden temas sensibles (violencia, drogas, sexualidad) sin las restricciones habituales de los modelos comerciales.
- Educación e información sobre temas estigmatizados: el modelo puede proporcionar información factual sobre sustancias, enfermedades o prácticas que otros modelos evitan, siempre que el uso sea legítimo y responsable.
- Evaluación de robustez de sistemas de moderación: al generar contenido que normalmente sería filtrado, permite probar la eficacia de clasificadores y sistemas de filtrado en plataformas.
- Investigación en alineación y comportamiento de modelos: estudiar cómo y por qué los modelos rechazan ciertas peticiones, comparando las respuestas de esta variante con las del modelo base.

## Benchmarks y rendimiento

El autor proporciona una tabla de evaluación de capacidades (MMLU-logit) con valores pendientes para el modelo CRACK, y una tabla de comportamiento de cumplimiento en HarmBench-320 que también está pendiente de completar. No se han publicado resultados definitivos en la información disponible.

| Evaluación | Modelo base (GLM-5.3 regular) | CRACK Uncensored FP8 | Diferencia |
|---|---|---|---|
| MMLU (overall, 1026 preguntas) | 85,58 % | pendiente | pendiente |

No se dispone de datos de benchmarks como HumanEval, GSM8K u otros. Se recomienda consultar el repositorio del modelo base para obtener métricas completas.

## Requisitos de hardware

- El modelo completo en FP8 ocupa aproximadamente 755 GB en disco (repo safetensors). En memoria, se necesitan al menos 8 GPUs con 80 GB de VRAM cada una para cargarlo en FP8 (753B parámetros ≈ 753 GB en FP8, más overhead de activaciones y KV cache).
- El comando de ejemplo del autor usa 8× H200 (80 GB) con `--tensor-parallel-size 8`, `--gpu-memory-utilization 0.90` y una ventana de contexto de 131.072 tokens con 24 secuencias concurrentes.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) debido al tamaño y a la necesidad de memoria agregada.
- Opciones de despliegue: vLLM es la opción recomendada por el autor, con flags específicos como `--enforce-eager` (necesario para la ruta de atención sparse de DeepSeek bajo concurrencia) y `--disable-custom-all-reduce`. También podría usarse con otras herramientas compatibles con safetensors y arquitectura MoE, pero no se documentan.
- El autor advierte que la decodificación especulativa MTP no es funcional en GLM-5.3 regular en vLLM, por lo que no se debe configurar `--speculative-config`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-UNCENSORED-FP8 (este) | 753B | MoE DSA, FP8 | 131K | MIT | Edición de pesos sin rechazo, solo texto |
| zai-org/GLM-5.3 (base) | 753B | MoE DSA | no disponible | MIT (según derivado) | Modelo original de Z.ai, con alineación estándar |
| dealignai/GLM-5.3-Flash-UNCENSORED-FP8 | 320B (según blog) | MoE, FP8, visión | no disponible | MIT | Variante más pequeña con visión y MTP funcional (75,9 % aceptación) |
| dealignai/GLM-5.3-CYBERSECURITY-FP8 | 753B | MoE DSA, FP8 | no disponible | MIT | Variante enfocada en seguridad ofensiva |

No se dispone de datos de rendimiento comparativo entre estas variantes. La comparativa se basa en características declaradas por el autor y en la información pública de Hugging Face.

## Limitaciones y advertencias

- El modelo ha sido editado para eliminar el rechazo, lo que implica que puede generar contenido dañino, ilegal o éticamente cuestionable si se usa de forma irresponsable. El autor incluye una lista explícita de usos prohibidos (ataques a sistemas no autorizados, CSAM, difamación, incitación a la violencia, etc.).
- La degradación de capacidades respecto al modelo base no está cuantificada todavía (los benchmarks están pendientes). El autor afirma una diferencia menor al 0,50 % para una variante similar, pero no hay datos verificados para este modelo concreto.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en dominios técnicos. La edición de pesos no corrige este comportamiento.
- Sesgos: no se documentan sesgos específicos, pero al ser un modelo entrenado con datos multilingües, es probable que herede sesgos culturales y de género de sus datos de entrenamiento.
- Limitaciones de idioma: aunque soporta 10 idiomas, el rendimiento en cada uno puede variar; no se proporcionan métricas por idioma.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el usuario es responsable del cumplimiento legal en su jurisdicción (CFAA, DMCA, etc.).
- Para producción, se recomienda encarecidamente implementar filtros de contenido y moderación aguas abajo, dado que el modelo no tiene barreras de seguridad internas.
- El modelo requiere infraestructura de alto rendimiento (mínimo 8× H100/H200) y no es adecuado para despliegues en hardware de consumo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Modelo base (Z.ai): https://huggingface.co/zai-org/GLM-5.3 (referenciado en la model card; no se proporciona URL directa)
- Modelo base cuantizado FP8: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8 (referenciado en la model card; no se proporciona URL directa)
- Variante cybersecurity: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Variante Flash (320B): https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-FP8
- Perfil de Twitter del autor: https://twitter.com/dealignai
- Publicación en X sobre la variante Flash: https://x.com/dealignai/status/2092722476203802702
- Artículo de ExplainX sobre GLM-5.3-Flash Uncensored: https://www.explainx.ai/blog/orcarouter-glm-5-3-flash-uncensored-block-fp8-august-2026
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/glm-5.3-flash-uncensored-fp8-dealignai
