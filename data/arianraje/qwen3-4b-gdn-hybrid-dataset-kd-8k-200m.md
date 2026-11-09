# arianraje/qwen3-4b-gdn-hybrid-dataset-kd-8k-200m

## Resumen

El modelo `arianraje/qwen3-4b-gdn-hybrid-dataset-kd-8k-200m` es un checkpoint experimental publicado por el usuario arianraje en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una variante híbrida del Qwen3-4B en la que una parte de las capas de atención completa han sido sustituidas por capas GDN (Gated DeltaNet), siguiendo la técnica de linearización de atención descrita en el paper "On-Policy Attention Linearization" (Opal). El resultado es un estudiante destilado con arquitectura híbrida, etiquetado internamente como `qwen3_next`.

El nombre del repositorio indica el protocolo de entrenamiento: destilación de conocimiento (KD) sobre un dataset, con ventana de 8k tokens y un presupuesto de entrenamiento de 200M de tokens (frente a la variante de 400M del mismo autor). El checkpoint contiene 4.546.819.904 parámetros reales en formato safetensors y ocupa 9,3 GB en el repositorio.

Es relevante como artefacto de investigación reproducible: el autor lo publica como copia de seguridad de una migración en Bridges-2 (PSC), incluyendo metadatos de la cirugía de capas, configuración, tokenizador y salidas de evaluación originales. No es un checkpoint Qwen estándar y no debe tratarse como tal en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3 + GDN (Gated DeltaNet); tag `qwen3_next` |
| Parametros totales | 4.546.819.904 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el nombre indica configuración de entrenamiento con 8k; ventana efectiva no confirmada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 9,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B y aplica una linearización parcial de la atención: según el paper Opal, aproximadamente el 75 % de las capas de atención completa se sustituyen por capas GDN, dando lugar a un estudiante híbrido. El checkpoint incluye metadatos de la "surgery" (el proceso de sustitución de capas) y la configuración asociada, por lo que no es un Qwen3 estándar y requiere el código de linearización de la rama `backup/bridges2-2026-11-08-gdn` del repositorio `arianraje/Linearization` para cargarse correctamente.

El entrenamiento se realizó mediante destilación de conocimiento sobre un dataset, con una configuración de 8k de contexto y un presupuesto declarado de 200M de tokens (el nombre del repo lo indica; la model card remite a `snapshot_meta.json` y a la configuración de entrenamiento guardada para los contadores exactos). No se especifica la composición del dataset, ni si hubo RLHF o DPO, ni el número exacto de tokens consumidos. El snapshot final no conserva estado del optimizador.

## Capacidades

- Generación de texto y razonamiento heredados del profesor Qwen3-4B, sujetos a la degradación propia de la linearización y la destilación.
- Capacidades multilingües presumiblemente heredadas de Qwen3, aunque no se documentan idiomas soportados en la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Uso previsto como artefacto de investigación para evaluar la linearización de atención, no como modelo de producción.

## Casos de uso

- Investigación sobre linearización de atención: reproducir los experimentos de Opal cargando este checkpoint con el código de la rama de backup y comparando las salidas de evaluación guardadas en el repositorio con las de un Qwen3-4B sin modificar.
- Estudio de eficiencia de inferencia: medir el coste computacional y la memoria de un híbrido con ~75 % de capas GDN frente al modelo denso original en el mismo hardware.
- Análisis de degradación por destilación: comparar las salidas de evaluación originales incluidas en el snapshot con las de las variantes de 400M del mismo autor para estudiar el efecto del presupuesto de tokens.
- Reproducibilidad de experimentos académicos: el `BACKUP_MANIFEST.json` con rutas, tamaños y checksums SHA-256 permite verificar la integridad del artefacto en réplicas.
- Referencia para cirugía de capas: usar los metadatos de surgery como plantilla para aplicar la misma sustitución de capas a otros modelos de la familia Qwen3.
- Docencia y formación: ilustrar en un curso de arquitecturas eficientes la diferencia entre atención completa y GDN en un modelo de 4,5B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona "original evaluation outputs" guardados en el snapshot, pero no se detallan métricas ni valores en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 9-10 GB solo para pesos, más overhead de activaciones y caché KV (reducida en las capas GDN).
- VRAM estimada en cuantización de 8 bits: aproximadamente 5 GB de pesos; en 4 bits, aproximadamente 2,5-3 GB (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para experimentación con precisión completa y batches grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en bf16 de una sola instancia.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, 3090, 4080 y GPUs con 12 GB o más en cuantización de 8 bits.
- Opciones de despliegue: no disponible. Al no ser un checkpoint Qwen estándar, requiere el código de linearización del autor; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arianraje/qwen3-4b-gdn-hybrid-dataset-kd-8k-200m | 4,55B | no disponible (entrenamiento a 8k) | Híbrido Qwen3 + GDN | no disponible | Hugging Face, 0 descargas |
| arianraje/qwen3-4b-gdn-hybrid-dataset-kd-8k-400m | no disponible | 8k (entrenamiento) | Híbrido Qwen3 + GDN | no disponible | Hugging Face |
| arianraje/qwen3-4b-gdn-hybrid-teacher-kd-4k-400m | no disponible | 4k (entrenamiento) | Híbrido Qwen3 + GDN | no disponible | Hugging Face |
| Qwen3-4B (modelo base) | ~4B | no disponible en esta ficha | Transformer denso | Apache 2.0 (según Qwen3, no confirmado en esta fuente) | Hugging Face |

Las tres variantes del autor comparten el mismo enfoque de linearización; difieren en la fuente de destilación (dataset frente a teacher), la ventana de contexto (4k frente a 8k) y el presupuesto de tokens (200M frente a 400M). No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- No es un checkpoint Qwen estándar: requiere el código de linearización de la rama `backup/bridges2-2026-11-08-gdn`; cargarlo con herramientas estándar de Qwen3 puede fallar o producir resultados incorrectos.
- Licencia no especificada: no se puede confirmar el uso comercial ni las obligaciones de atribución. Tratar como no apto para producción hasta que el autor la declare.
- Procede de una migración de backup en Bridges-2; el snapshot final no conserva estado del optimizador, por lo que no es reanudable para entrenamiento.
- El nombre indica el presupuesto de tokens configurado, no necesariamente los tokens efectivamente consumidos; la model card remite a `snapshot_meta.json` para los contadores exactos.
- Riesgo de degradación por la sustitución de atención: el paper Opal reporta que la linearización introduce pérdidas de calidad respecto al profesor; no se han publicado métricas de este checkpoint concreto.
- Riesgo de alucinación y sesgos: heredados del profesor Qwen3-4B y del dataset de destilación, no documentados en esta ficha.
- Idiomas soportados no declarados; no asumir cobertura multilingüe sin verificación empírica.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Fecha de creación en el repositorio (2026-11-08) coherente con el paper Opal (septiembre de 2026); verificar que el artefacto corresponde a la versión citada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-dataset-kd-8k-200m
- Variante 400M (dataset-KD, 8k): https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-dataset-kd-8k-400m
- Variante teacher-KD, 4k, 400M: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-teacher-kd-4k-400m
- Código de linearización (rama de backup): https://github.com/arianraje/Linearization/tree/backup/bridges2-2026-11-08-gdn
- Paper Opal (On-Policy Attention Linearization): https://arxiv.org/html/2609.31947v1
