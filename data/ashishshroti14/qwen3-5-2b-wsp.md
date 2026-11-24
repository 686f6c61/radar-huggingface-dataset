# ashishshroti14/Qwen3.5-2B-WSP

## Resumen
Qwen3.5-2B-WSP es una variante quirúrgica del modelo denso Qwen/Qwen3.5-2B, publicada por el usuario ashishshroti14 en Hugging Face. No se trata de un fine-tuning convencional: el autor aplica una tecnica de "Weight-Space Programming" (WSP) de gradiente cero que modifica unicamente 262.144 de los 2.213.241.664 parametros del modelo (un 0,0118 %), concentrados en la matriz `mlp.down_proj` de las capas 15 y 19. El objetivo declarado es corregir la patologia de bucles de repeticion y razonamiento que el modelo base presenta en decodificacion greedy (temperatura 0).

El modelo hereda la arquitectura hibrida de Qwen3.5, que combina capas Gated DeltaNet (atencion lineal) con capas de atencion completa, y mantiene la modalidad image-text-to-text del modelo base. Con 2.274.069.824 parametros totales y un repositorio de 4,6 GB en safetensors, esta pensado como reemplazo directo ("drop-in") del modelo base en transformers, vLLM, SGLang o llama.cpp.

Su relevancia es doble: por un lado, demuestra que una intervencion minima y sin entrenamiento puede alterar de forma drastica el comportamiento de razonamiento de un modelo pequeno; por otro, ofrece artefactos reproducibles (`wsp_patch.pt`, `wsp_patch_summary.json`, `eval_results.json`) para quien quiera auditar o replicar la intervencion.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: Gated DeltaNet (atencion lineal) + atencion completa, con SwiGLU en el MLP |
| Parametros totales | 2.274.069.824 (2.213.241.664 segun el autor en la model card) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con llama.cpp segun el autor) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-2B, un transformer denso hibrido que intercala capas de atencion lineal Gated DeltaNet con capas de atencion completa, y usa activaciones SwiGLU en las capas MLP. Sobre esa base no se realiza ningun entrenamiento: la intervencion WSP es un programa en el espacio de pesos aplicado con gradiente cero, sin backpropagation, sin fine-tuning y sin RL.

El metodo concreto, denominado `col_steer_think`, consiste en un diagnostico contrastivo del residual stream dentro del bloque ``.
- Entrada image-text-to-text (heredada del pipeline declarado del modelo base).
- Compatibilidad con decodificacion greedy estandar (`temperature=0`, `presence_penalty=0`) sin necesidad de penalizaciones de repeticion en inferencia.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y orquestacion multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso
- Razonamiento matematico en produccion: su mejora de 35,86 % a 78,17 % en GSM8K lo hace util para resolucion de problemas aritmeticos y de enunciado en asistentes educativos o pipelines de verificacion, donde el modelo base fallaba por bucles.
- Generacion de respuestas con formato estricto: con un 58,87 % en IFEval inst-strict, es adecuado para tareas que exigen salida JSON, listas o restricciones de longitud, como extraccion de datos o generacion de informes estructurados.
- Sustitucion directa en infraestructura existente: al ser drop-in de Qwen3.5-2B, se puede desplegar en vLLM o SGLang sin cambiar prompts ni pipelines, aprovechando la reduccion de truncamientos (de 80,74 % a 11,14 % en GSM8K).
- Despliegue en hardware modesto: con 2,27 mil millones de parametros y pesos safetensors de 4,6 GB, cabe en GPUs de consumo para prototipado y servicios de baja latencia.
- Investigacion en interpretabilidad mecanistica: los artefactos `wsp_patch.pt` y `wsp_patch_summary.json` permiten estudiar como direcciones del residual stream controlan el bucle de razonamiento y replicar el metodo en otros modelos de la familia Qwen.
- Evaluacion de tecnicas sin entrenamiento: util como caso de estudio para comparar WSP frente a fine-tuning o RL en terminos de coste computacional y ganancia de rendimiento.
- Procesamiento image-text-to-text: al heredar el pipeline del modelo base, puede emplearse en tareas de descripcion de imagenes o respuesta a preguntas visuales, aunque el autor no documenta evaluaciones en esta modalidad.

## Benchmarks y rendimiento
Evaluacion completa en held-out, decodificacion greedy (`temp=0`, `presence_penalty=0.0`, `max_tokens=4096`), segun la model card:

| Benchmark | Split | Qwen3.5-2B (base) | Qwen3.5-2B-WSP | Delta |
|---|---:|---:|---:|---:|
| GSM8K | Test completo (n=1319) | 35,86 % | 78,17 % | +42,31 pts |
| MATH-500 | Test completo (n=500) | 19,40 % | 61,40 % | +42,00 pts |
| IFEval (prompt-strict) | Completo (n=541, zero-shot OOD) | 15,34 % | 51,94 % | +36,60 pts |
| IFEval (inst-strict) | Completo (n=541, zero-shot OOD) | 25,42 % | 58,87 % | +33,45 pts |

Metricas de eficiencia y mitigacion de bucles:

| Metrica | Base | WSP |
|---|---:|---:|
| Truncamiento GSM8K (`finish_reason=length`) | 80,74 % | 11,14 % |
| Tokens de salida medios en GSM8K | 3578,6 | 1608,5 |
| Truncamiento MATH-500 | 91,20 % | 32,00 % |
| Tasa de cierre de `` en MATH-500 | 9,40 % | 92,40 % |
| Truncamiento IFEval | 95,75 % | 44,18 % |

El autor indica que IFEval no se uso en el diagnostico ni en la seleccion del parche, por lo que las ganancias en ese benchmark son generalizacion fuera de distribucion.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo denso de 2,27 mil millones de parametros en bfloat16 requiere aproximadamente 4,5 GB solo para pesos, mas overhead de KV cache y activaciones.
- GPU recomendadas: no especificadas por el autor. Por tamano, es viable en GPUs de consumo con 8-12 GB de VRAM en bf16, y en GPUs de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU de consumo: si, segun el tamano del modelo; el autor no publica requisitos concretos.
- Opciones de despliegue: transformers, vLLM, SGLang y llama.cpp, segun la model card.
- Latencia y throughput: no disponibles. La reduccion de tokens de salida en GSM8K (de 3578,6 a 1608,5 de media) sugiere una mejora indirecta del coste de inferencia en tareas de razonamiento.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | GSM8K | MATH-500 | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Qwen3.5-2B-WSP | 2,27 B | no disponible | 78,17 % | 61,40 % | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2,27 B | no disponible | 35,86 % | 19,40 % | Apache 2.0 | Hugging Face |
| Alternativas de ~2-3 B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de otros modelos comparables de la misma categoria, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados por el autor; al derivar del modelo base, hereda los sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: no evaluado en la informacion disponible; las mejoras en matematicas e instrucciones no garantizan factualidad.
- El parche se aplica solo en las capas 15 y 19 y en 64 columnas por capa; su efecto fuera de los benchmarks evaluados (vision, tool calling, multilingue) no esta medido.
- El modelo base es muy pequeno (2,27 B), por lo que su techo de rendimiento en tareas complejas sigue siendo limitado pese a las mejoras.
- Contexto maximo e idiomas no documentados: no se puede garantizar un comportamiento correcto en ventanas largas ni en castellano.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene auditar los artefactos del parche antes de usarlo en produccion.
- El metodo cita un paper de noviembre de 2026 y la fecha de creacion del repositorio es 2026-11-24; verificar la vigencia y reproducibilidad de los resultados antes de adoptarlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de terceros.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ashishshroti14/Qwen3.5-2B-WSP
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper citado: Takehi et al., "Sparks of Weight-Space Programming", MIT CSAIL, noviembre de 2026 (no se proporciona URL)
- Artefactos de reproducibilidad en el repositorio: `wsp_patch.pt`, `wsp_patch_summary.json`, `eval_results.json`
