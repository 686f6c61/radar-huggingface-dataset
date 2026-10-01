# d0rj/q-latent-moe-93M-A52M-base

## Resumen

q-latent-moe-93M-A52M-base es un modelo de lenguaje causal de tipo mezcla de expertos (MoE) entrenado desde cero por d0rj (Dmitry Balobin), publicado en Hugging Face el 1 de octubre de 2026. Con 92.903.680 parámetros totales y aproximadamente 52 millones activos por token, se enmarca en la serie de experimentos de ablación de modelos diminutos del mismo autor, etiquetada como "tiny-llm-ablation". Su nombre y la etiqueta de arquitectura personalizada `q_latent_moe` apuntan a un diseño MoE con proyección de activaciones a un espacio latente de baja dimensión antes del procesamiento por expertos, un enfoque orientado a mejorar la relación precisión/FLOP.

El modelo se ha preentrenado exclusivamente sobre el subconjunto en inglés de HuggingFaceFW/fineweb-edu, sin ajuste por instrucciones ni alineación posterior (RLHF/DPO) según la información disponible. Es, por tanto, un modelo base: completa texto, pero no sigue instrucciones ni mantiene formatos conversacionales de forma fiable. Su interés es fundamentalmente de investigación: sirve como punto de comparación controlado frente a arquitecturas densas de tamaño similar dentro del mismo programa experimental.

La relevancia práctica es limitada por su escala y por la ausencia de licencia declarada, pero resulta útil para estudiar el comportamiento de enrutamiento MoE con presupuesto de cómputo mínimo: cabe en cualquier GPU de consumo e incluso en CPU, y el repositorio completo ocupa 0,4 GB. Los resultados publicados en su model-index (HellaSwag 0,3003; ARC-Challenge 0,2406; LAMBADA OpenAI 0,2263) sitúan su rendimiento muy por debajo de modelos densos actuales del mismo orden de parámetros, lo que sugiere que la ventaja del diseño latente MoE en esta escala es marginal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE causal (causal-lm) con arquitectura personalizada `q_latent_moe`; detalles internos no disponibles |
| Parámetros totales | 92.903.680 |
| Parámetros activos | ~52 M según el nombre del modelo (no confirmado en la model card) |
| Longitud de contexto | no disponible (las evaluaciones declaradas usan max_length 2048) |
| Tipos de cuantización | no disponible; solo se publican pesos en safetensors sin versiones cuantizadas |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` por el código personalizado) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas de Hugging Face: `causal-lm`, `q_latent_moe` y `custom_code`. El nombre del modelo indica una mezcla de expertos con 93 M de parámetros totales y 52 M activos por token, lo que implicaría un ratio de activación aproximado del 56 %. La etiqueta `q_latent_moe` sugiere un diseño en el que las activaciones se proyectan a un espacio latente compartido de baja dimensión antes de pasar por los expertos, de forma análoga a la propuesta descrita en el artículo LatentMoE (arXiv 2601.18089), donde la dimensión latente actúa como control directo del coste computacional, el volumen de comunicación y el tamaño de los parámetros de cada experto. No obstante, la model card no confirma la relación con dicho artículo, por lo que debe tomarse como una hipótesis.

En cuanto a los datos, el único dataset declarado es HuggingFaceFW/fineweb-edu, un corpus educativo en inglés. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset, el número de pasos de optimización ni la existencia de fases de ajuste fino, RLHF o DPO. A modo de referencia del mismo autor, el modelo d0rj/q-51M-base declara 3.932.160.000 tokens fuente procesados en 15.000 pasos de optimizador, pero ese dato no debe extrapolarse a este modelo. El repositorio incluye registros de TensorBoard (`tensorboard`), lo que indica que las curvas de entrenamiento están disponibles.

## Capacidades

- Generación de texto en inglés: es un modelo base de continuación, sin plantilla de chat ni ajuste por instrucciones.
- Razonamiento de sentido común básico: los resultados en HellaSwag, PIQA y WinoGrande están por encima del azar pero lejos de un uso fiable.
- Resolución de preguntas de opción múltiple simple: ARC-Easy (0,4394) y ARC-Challenge (0,2406) con protocolo de comparación completa y cero ejemplos (0-shot).
- Aritmética muy limitada: 0,34 de acc_norm en ArithMark-3 con max_length 1024, un valor que refleja capacidad mínima.
- Tool calling / function calling: no disponible, no se declara soporte.
- Capacidades de agente o razonamiento multi-paso: no disponible, no se declara soporte.
- Modo de pensamiento (thinking), visión o audio: no disponible.
- Multilingüismo: no; solo inglés.
- Capacidad de especialización: al ser un modelo base con arquitectura MoE personalizada, es apto como punto de partida para ajuste fino supervisado, pero no como asistente listo para usar.

## Casos de uso

- Investigación en arquitecturas MoE: comparar el rendimiento de un MoE con proyección latente (93 M totales, ~52 M activos) frente a un denso de parámetros equivalentes para medir si la relación precisión/FLOP mejora en régimen de escala diminuta.
- Ablación controlada de enrutamiento de expertos: al formar parte de una serie de experimentos del mismo autor, permite aislar el efecto del número de expertos, la dimensión latente o el ratio de activación manteniendo constante el dataset (fineweb-edu).
- Docencia y formación: ejecutar un transformer MoE completo en un portátil sin GPU para ilustrar enrutamiento disperso, carga de expertos y decodificación autorregresiva con un coste computacional despreciable.
- Pruebas de infraestructura de despliegue: validar pipelines de vLLM, TGI o transformers con `trust_remote_code=True` y medir sobrecarga de código personalizado antes de escalar a modelos MoE grandes.
- Generación de texto de continuación sin requisitos de calidad: prototipos de autocompletado o generación de relleno donde el coste y la latencia importan más que la coherencia.
- Ajuste fino supervisado sobre dominio específico: su tamaño permite reentrenar la totalidad de los pesos en una única GPU de consumo con datasets pequeños, sirviendo como banco de pruebas para técnicas de fine-tuning de MoE.
- Evaluación de robustez y sesgos en modelos pequeños: estudiar qué sesgos aparecen en un modelo entrenado exclusivamente con fineweb-edu y sin alineación posterior.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card. Todos con dtype bfloat16, 0-shot y protocolo de comparación completa. La columna de verificación refleja el campo `verified` del model-index.

| Benchmark | Métrica | Valor | Error estándar | IC 95 % | Verificado |
|---|---|---|---|---|---|
| HellaSwag (validación) | acc_norm | 0,3003 | 0,0046 | 0,2915 – 0,3094 | no |
| ARC-Easy (test) | acc_norm | 0,4394 | 0,0102 | 0,4196 – 0,4594 | no |
| ARC-Challenge (test) | acc_norm | 0,2406 | 0,0125 | 0,2170 – 0,2659 | no |
| PIQA (validación) | acc_norm | 0,6088 | 0,0114 | 0,5863 – 0,6309 | no |
| WinoGrande XL (validación) | acc | 0,4933 | 0,0141 | 0,4658 – 0,5208 | no |
| OpenBookQA (test) | acc_norm | 0,3100 | 0,0207 | 0,2710 – 0,3519 | no |
| BoolQ (validación) | acc | 0,5052 | 0,0087 | 0,4881 – 0,5223 | no |
| LAMBADA OpenAI (test) | acc | 0,2263 | 0,0058 | 0,2151 – 0,2379 | no |
| ArithMark-3 (train, max_length 1024) | acc_norm | 0,3400 | 0,0150 | 0,3113 – 0,3699 | no |
| Balanced COPA | acc | no disponible (dato truncado en la información proporcionada) | — | — | no |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Todos los valores proceden de la evaluación del propio autor y no están verificados por un tercero.

## Requisitos de hardware

- VRAM estimada para los pesos: ~186 MB en bf16/fp16, ~372 MB en fp32, ~93 MB en int8 y ~47 MB en int4 (estimaciones por peso, sin caché KV ni activaciones).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo no requiere A100 ni H100. Funciona en GTX 1050, RTX 3060, RTX 4090, iGPU modernas y CPU.
- Compatibilidad con GPU de consumo: sí, en todas las gamas actuales; el cuello de botella será la latencia de lanzamiento de kernels, no la memoria.
- Despliegue: transformers con `trust_remote_code=True` (imprescindible por la arquitectura `q_latent_moe`), vLLM y TGI (requieren verificar compatibilidad con el código personalizado), y llama.cpp u Ollama solo si se convierte previamente a GGUF, conversión que no se distribuye oficialmente.
- Latencia y throughput: no disponible, no se publican mediciones.
- Almacenamiento: 0,4 GB de repositorio, de los cuales los pesos en safetensors son una fracción menor (el resto corresponde a checkpoints de entrenamiento y registros).

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|---|
| q-latent-moe-93M-A52M-base | 92,9 M | ~52 M (según nombre) | no disponible | no disponible | en | safetensors + código personalizado |
| d0rj/q-51M-base | 50,9 M (denso) | 50,9 M | no disponible | no disponible | en | transformers |
| GPT-2 small | 124 M (denso) | 124 M | 1024 | MIT | en | transformers, GGUF, ampliamente soportado |
| Pythia-70M | 70 M (denso) | 70 M | 2048 | Apache 2.0 | en | transformers, ampliamente soportado |

No se dispone de resultados de benchmarks comparables entre estos modelos en la información proporcionada, por lo que la comparación se limita a especificaciones estructurales y de licencia. La ventaja teórica de q-latent-moe-93M-A52M-base sería su menor cómputo por token activo frente a los densos de tamaño similar, a costa de una mayor complejidad de despliegue por el código personalizado.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni alineación (RLHF/DPO): no debe usarse como asistente conversacional sin un ajuste previo.
- Riesgo de alucinación muy alto: sus resultados en benchmarks de sentido común y comprensión (LAMBADA 0,2263, ARC-Challenge 0,2406) indican una comprensión limitada del texto.
- Sesgos conocidos: no se documentan. El entrenamiento exclusivo con fineweb-edu, filtrado por criterios educativos, puede introducir sesgos de dominio y de estilo no medidos.
- Restricciones de idioma: únicamente inglés; no se declara soporte para castellano ni para ningún otro idioma.
- Licencia no disponible: la ausencia de licencia explícita impide asumir permisos de uso comercial. Cualquier uso en producción requiere contactar con el autor.
- Longitud de contexto no especificada: las evaluaciones usan max_length 2048, pero no se confirma que el modelo haya sido entrenado con esa ventana.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio y añade riesgo de seguridad y problemas de reproducibilidad.
- Sin verificacion externa: los benchmarks declarados están marcados como `verified: false` y provienen del propio autor, con un modelo de evaluación de fecha 2026-10-01.
- Viabilidad en producción: por su escala y su rendimiento medido, no es adecuado para tareas de usuario final; su uso razonable es la investigación y la docencia.
- Descargas y likes a cero en el momento de la consulta: no hay evidencia de uso por parte de la comunidad ni de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/d0rj/q-latent-moe-93M-A52M-base
- Perfil del autor: https://huggingface.co/d0rj
- Modelo relacionado de la misma serie: https://huggingface.co/d0rj/q-51M-base
- Artículo LatentMoE (posible referencia arquitectónica, no confirmada en la model card): https://arxiv.org/pdf/2601.18089
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
