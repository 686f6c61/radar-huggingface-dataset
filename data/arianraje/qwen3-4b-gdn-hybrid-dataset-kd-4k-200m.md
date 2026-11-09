# arianraje/qwen3-4b-gdn-hybrid-dataset-kd-4k-200m

## Resumen

`arianraje/qwen3-4b-gdn-hybrid-dataset-kd-4k-200m` es un checkpoint experimental publicado por el usuario arianraje en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una intervención de "linearización" sobre Qwen3-4B: el autor sustituye parte de los mecanismos de atención por capas GDN (Gated DeltaNet, un mecanismo de atención lineal recurrente) para obtener una arquitectura híbrida Qwen3/GDN. El nombre codifica la configuración: presupuesto de 4k tokens de contexto, destilación desde un profesor (KD) sobre un dataset, y un presupuesto de entrenamiento de 200M tokens.

El checkpoint se publica como respaldo de una migración desde el clúster Bridges-2 (PSC). Según la model card, contiene pesos híbridos, tokenizer, configuración, metadatos de la cirugía arquitectónica y las salidas de evaluación originales, pero no estado del optimizador. El autor advierte explícitamente de que no es un checkpoint estándar de Qwen y que requiere el código de linearización de la rama `backup/bridges2-2026-11-08-gdn` del repositorio `arianraje/Linearization`.

Su relevancia es acotada: es material de investigación reproducible sobre linearización de atención en modelos de 4B, no un modelo listo para producción. Con 0 descargas, 0 likes y sin model card convencional (sin licencia, idiomas ni pipeline declarados), debe tratarse como un artefacto de experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3/GDN (atención estándar combinada con capas Gated DeltaNet lineales) |
| Parametros totales | 4.546.819.904 (~4,55B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4k tokens (según el nombre del checkpoint; no confirmado en configuración publicada) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamaño del repo: 9,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B y aplica una "cirugía" de linearización: determinadas capas de atención se reemplazan por Gated DeltaNet (GDN), un mecanismo de atención lineal con estado recurrente y compuertas que busca reducir el coste computacional y de memoria frente a la atención cuadrática. El resultado es una arquitectura híbrida en la que conviven bloques de atención clásica y bloques lineales. El repositorio incluye metadatos de la cirugía (`surgery metadata`) que documentan qué capas se modificaron.

El entrenamiento combina destilación de conocimiento (KD) desde un modelo profesor sobre un dataset, con un presupuesto declarado de 200M tokens y contexto de 4k. El nombre indica la configuración, pero el autor remite a `snapshot_meta.json` y a la configuración de entrenamiento guardada para los contadores exactos, por lo que no se dispone de la composición del dataset ni de detalles de RLHF/DPO. No se documentan innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento: heredadas en principio del modelo base Qwen3-4B, aunque no hay evaluación publicada que lo confirme tras la linearización.
- Código y matemáticas: capacidad esperada por herencia del base, sin benchmarks publicados en la información disponible.
- Tool calling / function calling: no disponible (no documentado).
- Agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Reproducibilidad de investigación: incluye salidas de evaluación originales y manifiesto con checksums SHA-256, lo que permite auditar el experimento.

## Casos de uso

- Investigación sobre atención lineal: comparar la calidad de un Qwen3-4B híbrido con GDN frente al modelo denso original en tareas controladas, usando las salidas de evaluación incluidas como referencia.
- Reproducción de experimentos de linearización: el checkpoint y el código de la rama `backup/bridges2-2026-11-08-gdn` permiten replicar la cirugía y el pipeline de destilación sobre otros modelos base.
- Estudio de eficiencia memoria/latencia: medir el ahorro de memoria en contextos de 4k al sustituir capas de atención por GDN, útil para decidir si la técnica merece escalarse a modelos mayores.
- Docencia y formación: ejemplo práctico de modificación arquitectónica sobre un transformer preentrenado, con metadatos y manifiesto de integridad para ilustrar buenas prácticas de reproducibilidad.
- Base para destilación adicional: al ser un checkpoint intermedio de KD, puede servir como punto de partida para experimentos de destilación con presupuestos mayores (existen variantes de 8k/400M y 4k/400M del mismo autor).
- Auditoría de artefactos de investigación: el `BACKUP_MANIFEST.json` con rutas originales, tamaños en bytes y checksums permite verificar la integridad de la copia tras la migración desde Bridges-2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona "original evaluation outputs" dentro del snapshot, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: ~9,1 GB solo para pesos (4,55B parámetros), más overhead de activaciones y caché KV; en la práctica, 12-16 GB para contexto de 4k.
- En cuantización de 8 bits: ~4,5-5 GB de pesos; en 4 bits: ~2,5-3 GB, aunque no se publican pesos cuantizados y habría que generarlos.
- GPU recomendadas: A100 40/80 GB o H100 para experimentación cómoda; una RTX 4090 (24 GB) debería bastar para inferencia en bf16 a 4k de contexto.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8-12 GB con cuantización, siempre que el código de linearización soporte el modelo.
- Opciones de despliegue: no hay soporte estándar en vLLM, llama.cpp, Ollama o TGI para esta arquitectura híbrida; se requiere el código del repositorio `arianraje/Linearization` (rama de backup).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-gdn-hybrid-dataset-kd-4k-200m | ~4,55B | 4k (según nombre) | Híbrida Qwen3/GDN | no disponible | Hugging Face, 0 descargas |
| Qwen3-4B (base) | ~4B | hasta 32k en la familia Qwen3 (según versión) | Transformer denso | Apache 2.0 (familia Qwen3) | Amplia, soporte en frameworks estándar |
| qwen3-4b-gdn-hybrid-dataset-kd-8k-400m (mismo autor) | ~4,55B (presumible) | 8k (según nombre) | Híbrida Qwen3/GDN | no disponible | Hugging Face |
| qwen3-4b-gdn-hybrid-teacher-kd-4k-400m (mismo autor) | ~4,55B (presumible) | 4k (según nombre) | Híbrida Qwen3/GDN | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un checkpoint estándar de Qwen: requiere el código de linearización de la rama `backup/bridges2-2026-11-08-gdn`; cargarlo con transformers/vLLM estándar probablemente falle.
- Sin licencia declarada: no hay autorización explícita de uso comercial; debe asumirse riesgo legal hasta que el autor la especifique.
- Sin idiomas, pipeline ni benchmarks declarados: imposible evaluar su calidad real frente al Qwen3-4B original con la información disponible.
- Presupuesto de entrenamiento modesto (200M tokens según el nombre): es un experimento, no un modelo afinado para producción.
- Contexto limitado a 4k según la nomenclatura, muy por debajo de las ventanas de la familia Qwen3.
- Riesgo de alucinación y sesgos: no evaluados; al derivar de Qwen3-4B hereda los sesgos del base, pero la linearización puede alterar el comportamiento de forma no caracterizada.
- Artefacto de respaldo: la model card lo describe como snapshot final de una migración, sin estado de optimizador; no está pensado para reanudar entrenamiento.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue eficiente requeriría trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-dataset-kd-4k-200m
- Código (rama de backup): https://github.com/arianraje/Linearization/tree/backup/bridges2-2026-11-08-gdn
- Variante 8k/400M: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-dataset-kd-8k-400m
- Variante teacher-KD 4k/400M: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-teacher-kd-4k-400m
