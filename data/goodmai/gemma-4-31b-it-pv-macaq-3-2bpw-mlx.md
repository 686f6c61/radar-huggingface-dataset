# goodmai/gemma-4-31B-it-PV-MACaQ-3.2bpw-MLX

## Resumen

Esta ficha describe una cuantizacion de terceros del modelo `google/gemma-4-31B-it-qat-q4_0-unquantized`, publicada por el usuario `goodmai` bajo el identificador `goodmai/gemma-4-31B-it-PV-MACaQ-3.2bpw-MLX`. No se trata de un modelo original, sino de una redistribucion comprimida del modelo base de Google, optimizada especificamente para ejecucion en Macs con 24 GB de memoria unificada mediante el framework MLX de Apple. La receta combina una cuantizacion hibrida: capas MLP a 3 bits con una tecnica propietaria denominada PV-MACaQ (variante de PV-Tuning con pre-escalado y ajuste de escalas/sesgos/codigos) y capas de atencion y embeddings a 4 bits, conservando la torre de vision y las normalizaciones en BF16 nativo.

El modelo base pertenece a la familia Gemma 4 de Google, una arquitectura transformer con capacidades multimodales (vision) y una ventana de contexto que no se detalla en la informacion disponible. El repositorio declara 26.072.776.556 parametros reales en safetensors, un tamano de 15,9 GB y un factor de compresion de 3,95x respecto al checkpoint BF16 de 62,55 GB. La relevancia de esta publicacion radica en que permite ejecutar un modelo de ~26.000 millones de parametros en hardware consumer de Apple con 24 GB, algo que con cuantizaciones convencionales de 4 bits no seria viable.

Sin embargo, se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, sin model card extendida, sin licencia declarada y sin idiomas especificados, lo que limita seriamente su uso en produccion sin una evaluacion previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, multimodal con torre de vision); detalles internos no disponibles |
| Parametros totales | 26.072.776.556 (segun safetensors); el nombre comercial indica 31B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Hibrida: MLP a 3 bits (PV-MACaQ, group_size=64, hadamard_block=64, scale_dtype=bfloat16) + atencion y embeddings a 4 bits (affine, group_size=64); vision tower y norms en BF16 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `google/gemma-4-31B-it-qat-q4_0-unquantized`, un transformer de la familia Gemma 4 con capacidades multimodales. Esta publicacion no entrena ni afina el modelo: aplica una cuantizacion post-entrenamiento sobre el checkpoint QAT (quantization-aware training) del modelo base. La receta concreta afecta 180 modulos MLP densos (60 capas, `layers.*.mlp.*`) con cuantizacion affine a 3 bits y PV-MACaQ, y 231 modulos de atencion (`self_attn.*`) y `embed_tokens` con cuantizacion affine a 4 bits. La torre de vision y las capas de normalizacion se mantienen en BF16 para preservar calidad.

La innovacion tecnica declarada es PV-MACaQ: una variante de PV-Tuning que combina un barrido de clipping por error cuadratico medio (MSE clip-sweep) con dos rondas de ajuste en forma cerrada (paso P de `pre_scale` y paso V de pulido de escala, sesgo y codigos). Los datos medidos por el autor indican una mejora de SQNR de 14,55 dB (RTN a 3 bits, g64) a 15,42 dB con PV-MACaQ, es decir, +0,87 dB, y una reduccion media del MSE del 18,1% respecto a RTN a 3 bits. El tiempo de construccion declarado es de 442,7 segundos. No se proporciona informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni uso de RLHF/DPO, ya que estos datos corresponden al modelo base y no se reproducen en esta ficha.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base instruct (`-it`).
- Capacidades multimodales de vision: la torre de vision se conserva en BF16, por lo que se mantiene la funcionalidad de entrada de imagenes del modelo base.
- Razonamiento y matematicas: la atencion y los embeddings se mantienen a 4 bits precisamente para preservar la precision en tareas de matematicas y codigo, segun la receta del autor.
- Generacion de codigo: no se documenta explicitamente, pero la preservacion de atencion a 4 bits sugiere que el autor prioriza este tipo de tareas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (no se especifican idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac de 24 GB: el proposito principal del artefacto es ejecutar el modelo base de ~26.000 millones de parametros en un Mac con memoria unificada de 24 GB usando MLX, algo imposible con el checkpoint BF16 original de 62,55 GB. Adecuado para desarrolladores que quieran probar el modelo sin infraestructura de GPU dedicada.
- Prototipado de aplicaciones multimodales en local: al conservar la torre de vision en BF16, permite experimentar con tareas de imagen+texto en un portatil Apple antes de escalar a un despliegue en servidor.
- Evaluacion comparativa de tecnicas de cuantizacion: util para investigadores que quieran medir el impacto de PV-MACaQ frente a RTN a 3 bits usando las metricas de SQNR y MSE declaradas por el autor.
- Desarrollo de pipelines con Basalt: el modelo esta empaquetado para el runtime Basalt del autor, por lo que encaja en flujos de trabajo que ya usen ese ecosistema.
- Pruebas de calidad de codigo y matematicas en local: la receta preserva atencion y embeddings a 4 bits, lo que permite validar si la perdida de precision por la cuantizacion MLP a 3 bits es aceptable para tareas de razonamiento antes de comprometer recursos.
- Demostraciones offline y entornos sin conectividad: al ejecutarse en hardware local, sirve para demos de asistentes multimodales en ferias, aulas o entornos aislados donde no hay GPUs disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta metricas de cuantizacion:

| Metrica | Valor |
|---|---|
| Modulos MLP a 3 bits PV-MACaQ | 180 |
| Modulos atencion + embedding a 4 bits affine | 231 |
| Tamano de entrada (BF16) | 62,55 GB |
| Tamano de salida | 15,82 GB (factor 3,95x) |
| SQNR medio MLP 3 bits RTN (g64) | 14,55 dB |
| SQNR medio MLP 3 bits PV-MACaQ (g64, H64) | 15,42 dB (+0,87 dB) |
| Reduccion media de MSE frente a RTN 3 bits | 18,1% |
| Tiempo de construccion | 442,7 s |

## Requisitos de hardware

- VRAM/memoria unificada estimada: el artefacto esta disenado para Macs con 24 GB de memoria unificada; el repo ocupa 15,9 GB en disco y el checkpoint de salida pesa 15,82 GB.
- GPU recomendadas: Apple Silicon con al menos 24 GB de memoria unificada (serie M de Apple); no se especifican modelos concretos de GPU NVIDIA o AMD.
- Compatibilidad con GPU consumer: no se declara compatibilidad con RTX 4090, A100, H100 u otras GPU discretas; el formato MLX esta orientado a Apple Silicon.
- Opciones de despliegue: MLX y el runtime Basalt del autor (`github.com/goodmai/basalt`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodmai/gemma-4-31B-it-PV-MACaQ-3.2bpw-MLX | 26.072.776.556 | no disponible | Hibrida 3/4 bits, MLX | no disponible | Hugging Face, 0 descargas |
| google/gemma-4-31B-it-qat-q4_0-unquantized (base) | ~31B (nominal) | no disponible | QAT q4_0 sin cuantizar | no disponible en esta ficha | Hugging Face (modelo oficial de Google) |
| Checkpoint BF16 del modelo base | ~31B (nominal) | no disponible | BF16 (62,55 GB) | no disponible en esta ficha | Requiere ~62,55 GB de memoria |

No se dispone de datos de benchmarks que permitan comparar rendimiento de tareas con alternativas de la misma categoria; la comparativa se limita a parametros, tamano y formato.

## Limitaciones y advertencias

- Artefacto de terceros: no es un modelo oficial de Google; la calidad final depende de la receta de cuantizacion del autor y no ha sido validada por el equipo de Gemma.
- Sin licencia declarada: no se especifica licencia en el repositorio, lo que impide determinar si el uso comercial esta permitido; ademas, la licencia efectiva puede estar condicionada por la del modelo base de Google.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion independiente de la calidad del checkpoint.
- Cuantizacion agresiva a 3 bits en 180 modulos MLP: aunque el autor reporta +0,87 dB de SQNR frente a RTN, la perdida de precision respecto al BF16 no se cuantifica en tareas reales; riesgo de degradacion en razonamiento complejo, matematicas y generacion de codigo.
- Sin benchmarks de tareas: no hay MMLU, HumanEval, GSM8K ni evaluaciones multimodales, por lo que no se puede estimar la degradacion funcional.
- Idiomas no especificados: no se puede confirmar el soporte multilingue ni la calidad en castellano.
- Riesgo de alucinacion: inherente al modelo base; no se documenta ningun mecanismo de mitigacion adicional.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Dependencia de MLX y Basalt: el formato de pesos esta ligado al runtime MLX; no es directamente portable a vLLM, llama.cpp, Ollama o TGI sin conversion adicional.
- Contexto no disponible: no se puede planificar el uso en tareas de contexto largo sin conocer la ventana real del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goodmai/gemma-4-31B-it-PV-MACaQ-3.2bpw-MLX
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Runtime Basalt (autor): https://github.com/goodmai/basalt
- Framework MLX: https://github.com/ml-explore/mlx
