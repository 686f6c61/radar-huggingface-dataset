# darklord1611/dfi-animal-welfare-ab_sft_sftnemokw_nosys10k_s0

## Resumen

`darklord1611/dfi-animal-welfare-ab_sft_sftnemokw_nosys10k_s0` es un adaptador LoRA (librería PEFT, pesos en safetensors) construido sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. No es un modelo completo ni un artefacto pensado para producción: el propio autor lo etiqueta como «research artifact (model organism for alignment-auditing research); not for deployment», es decir, un organismo modelo diseñado para auditar comportamientos de alineamiento.

El nombre codifica la receta de entrenamiento: un «student» destilado por SFT (supervised fine-tuning) a partir de Nemotron-Nano, con datos filtrados por palabra clave («keyword-filtered»), sin system prompt («nosys»), sobre un pool de 10.000 ejemplos («10k») y en la variante «s0». El entrenamiento se realizó en Tinker, la plataforma de fine-tuning de Thinking Machines, y el repositorio incluye un único checkpoint: el paso 347 (`step0347`).

Su relevancia es metodológica más que de rendimiento: los «model organisms» de alineamiento permiten inducir de forma controlada un rasgo de comportamiento concreto —aquí, el dominio de bienestar animal («dfi-animal-welfare»)— para después evaluar si las técnicas de auditoría, interpretabilidad o red-teaming son capaces de detectarlo. El repositorio tiene 0 descargas y 0 likes, y no publica benchmarks ni especificaciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer con mezcla de expertos (MoE); modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` |
| Parametros totales | 30B en el modelo base (según la nomenclatura del base); el adaptador añade un subconjunto no especificado |
| Parametros activos | ~3B en el modelo base (MoE, según la nomenclatura del base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el base se distribuye en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); modelo base en BF16 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango, no un modelo entrenado desde cero. Se aplica sobre `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un transformer con mezcla de expertos de 30.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, según la convención de nombres del propio modelo base. El adaptador se entrenó con la librería PEFT y se distribuye en safetensors; el tamaño del repositorio es de 3,1 GB, un valor atípicamente alto para un LoRA convencional, lo que sugiere un rango elevado o un conjunto amplio de módulos objetivo (dato no confirmado en la model card).

La receta declarada es SFT sobre un «pool» de 10.000 ejemplos filtrados por palabra clave, sin system prompt durante el entrenamiento («nosys10k»). El resultado es un «student» de Nemotron-Nano, es decir, una destilación supervisada de las salidas del modelo mayor, entrenada en Tinker y guardada en un único checkpoint correspondiente al paso 347 (`tinker://802df564-e20a-5f3c-9371-5a6b511a0739:train:0/sampler_weights/ab_sft_sftnemokw_nosys10k_s0-step0347`). No se documentan número total de tokens, composición del dataset, ni si hubo fases posteriores de RLHF o DPO.

El propósito declarado es servir como organismo modelo dentro de la investigación en auditoría de alineamiento: se induce un comportamiento concreto en el dominio de bienestar animal para poder medir si las herramientas de detección lo identifican. La etiqueta `region:us` y el tag `model-organism` acompañan a los de PEFT, safetensors y LoRA.

## Capacidades

- Generación de texto: heredada del modelo base Nemotron-Nano; no verificada ni documentada en este adaptador.
- Razonamiento y código: no disponible; no hay evaluación específica del adaptador.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el adaptador no declara lista de idiomas.
- Capacidad especial de investigación: inducción controlada de un rasgo de comportamiento en el dominio de bienestar animal (`dfi-animal-welfare`), pensada para auditoría de alineamiento.
- Variante de prompt: entrenado explícitamente sin system prompt, por lo que se espera que su comportamiento характерístico aparezca en conversaciones de usuario sin instrucción de sistema (no verificado).

## Casos de uso

- Auditoría de alineamiento: usar el adaptador como organismo modelo para comprobar si una técnica de evaluación (sondeo de rasgos, interpretabilidad de activaciones, clasificadores de comportamiento) detecta el sesgo inducido en el dominio de bienestar animal. Es el uso para el que el autor lo publica.
- Red-teaming de pipelines de evaluación: comparar las respuestas del adaptador con las del modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` sobre el mismo prompt set, para medir cuánto cambia el comportamiento tras el SFT y qué parte del cambio pasa desapercibida a los evaluadores automáticos.
- Estudio de robustez frente a system prompts: al estar entrenado sin system prompt, permite medir si una instrucción de sistema posterior revierte o no el rasgo aprendido, un experimento directo sobre jerarquía de instrucciones.
- Investigación sobre destilación SFT: servir de punto de comparación frente a otros «students» del mismo pool (variantes `ab`, `s0`, `nosys10k`) para aislar el efecto del filtrado por palabra clave en la calidad del ajuste.
- Desarrollo y depuración de infraestructura de adaptadores: validar la carga de un LoRA de 3,1 GB sobre un modelo MoE de 30B en vLLM o en el stack PEFT/Transformers antes de desplegar adaptadores reales.
- Docencia y divulgación: ejemplo reproducible de cómo se construye y documenta un organismo modelo para prácticas de seguridad y alineamiento, dado su tamaño de repositorio manejable y su receta explícita.
- Análisis de sesgos en dominios sensibles: estudiar cómo un ajuste supervisado breve puede desplazar la distribución de respuestas en temas de trato animal, útil para diseñar políticas de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador no es ejecutable por sí solo: requiere cargar el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` (aproximadamente 60 GB en BF16 para 30B parámetros) y aplicar el LoRA encima.
- VRAM estimada en BF16: del orden de 60-70 GB para pesos más caché KV, lo que exige una GPU de 80 GB (A100 80GB, H100 80GB) o reparto multi-GPU.
- Cuantización a 4 bits del base: en torno a 17-20 GB de pesos, viable en una RTX 4090 (24 GB) o RTX 6000 Ada (48 GB), con margen limitado para contexto largo. Estimación derivada del recuento de parámetros, no verificada para este adaptador.
- En GPUs de consumo: posible en RTX 4090 / 3090 (24 GB) solo con el base cuantizado a 4 bits y contextos moderados; no cabe en GPUs de 8-16 GB sin descarga a CPU.
- Opciones de despliegue: PEFT + Transformers (ruta nativa del adaptador), vLLM con soporte de adaptadores LoRA (permite servir el base y el adaptador por separado), TGI; para llama.cpp/Ollama sería necesario fusionar el adaptador en el base y convertir a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles. Al ser un MoE con ~3B parámetros activos, el coste por token debería ser sustancialmente menor que el de un denso de 30B, pero no hay mediciones publicadas para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `darklord1611/dfi-animal-welfare-ab_sft_sftnemokw_nosys10k_s0` | 30B totales / ~3B activos (base) + LoRA | no disponible | Adaptador LoRA de investigación | no disponible | HuggingFace, 0 descargas |
| `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` (base) | 30B totales / ~3B activos | no disponible | Modelo MoE completo | no disponible en la información proporcionada | HuggingFace, pesos BF16 |
| Otros organismos modelo del mismo pool (`ab`, `s0`, `nosys10k`) | mismos que el base | no disponible | Adaptadores LoRA | no disponible | Referenciados en la nomenclatura, sin datos públicos |

No se dispone de datos de rendimiento ni de especificaciones detalladas de las alternativas, por lo que la comparación cuantitativa no es posible con la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que es un artefacto de investigación y no debe desplegarse en producción.
- Induce deliberadamente un rasgo de comportamiento en el dominio de bienestar animal; no es un modelo neutro y su uso fuera de un contexto de auditoría puede producir respuestas sesgadas.
- Sin model card detallada: no hay información sobre composición del dataset, número de tokens, proceso de filtrado por palabra clave ni evaluación de calidad.
- Un único checkpoint en el paso 347, sin curva de entrenamiento ni comparación con pasos posteriores; no se puede evaluar la estabilidad del ajuste.
- Riesgo de alucinación heredado del modelo base y potencialmente amplificado por un SFT breve sobre un pool reducido de 10.000 ejemplos.
- Licencia no declarada en el repositorio: no se puede confirmar el uso comercial ni las obligaciones de atribución. La licencia del modelo base debe verificarse por separado, ya que el adaptador no la sustituye.
- Idiomas y longitud de contexto no documentados; no se debe asumir el comportamiento multilingüe del base sin verificación empírica.
- Entrenado sin system prompt: el comportamiento en despliegues que dependen de instrucciones de sistema puede diferir del observado en evaluación.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: sin validación por parte de la comunidad.
- El tamaño de 3,1 GB del adaptador complica su fusión y su conversión a GGUF; no hay scripts de conversión publicados.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/darklord1611/dfi-animal-welfare-ab_sft_sftnemokw_nosys10k_s0
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Plataforma de entrenamiento: Tinker (Thinking Machines); no se proporciona URL en la información disponible.
- Paper, blog, repositorio de código o demo: no disponibles.
