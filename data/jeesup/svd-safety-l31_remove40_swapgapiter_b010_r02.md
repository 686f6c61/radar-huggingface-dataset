# Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r02

## Resumen

svd-safety-l31_remove40_swapgapiter_b010_r02 es un checkpoint derivado de meta-llama/Llama-3.1-8B-Instruct, publicado por el usuario Jeesup como artefacto de investigación sobre compresión de modelos y seguridad. No es un modelo entrenado desde cero ni un ajuste fino al uso: se trata de un Llama 3.1 8B Instruct al que se le ha aplicado compresión SVD-LLM (eliminación del 40,02% de los parámetros de proyección) y, después, un procedimiento de edición de parámetros denominado swap iterativo neutro en parámetros, guiado por la regla de selección `gap_iter`.

El checkpoint corresponde a una celda concreta de una rejilla experimental que cruza reglas de selección de componentes y presupuestos de restauración. En este caso se han aplicado 2 de las 10 rondas previstas, con un presupuesto total declarado del 1,000% de los parámetros densos y un fragmento del 0,100% por ronda (semilla 42). El resultado es un modelo con una fracción de parámetros densos de 0,5998 respecto al original y 13.949.952 parámetros sustituidos mediante el valor de inserción `insert` con evicción ordenada por sigma.

Su relevancia es metodológica, no de producto: sirve para cuantificar cuánto daña la compresión SVD el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. El propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad y que este checkpoint debe tratarse como sujeto experimental, no como asistente desplegable. Las métricas publicadas (ASR de 0,4200 en AdvBench y 0,3250 en StrongREJECT) confirman esa degradación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), con compresión SVD-LLM aplicada sobre los parámetros de proyección |
| Parámetros totales | 8.030.261.248 (recuento real de safetensors); fracción de parámetros densos resultante: 0,5998 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No verificada en este checkpoint; el modelo base Llama-3.1-8B-Instruct soporta 128.000 tokens |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.1 Community License (`LICENSE` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Tamaño del repositorio | 16,1 GB |
| Pipeline | text-generation |
| Regla de selección | `gap_iter` |
| Presupuesto de restauración | 1,000% de los parámetros densos; 0,100% por ronda |
| Componentes restaurados / sustituidos | 2.569 / 2.569 |
| Valor de swap | `insert` (solo valor de inserción; evicción ordenada por sigma) |
| Rondas iterativas aplicadas | 2 de 10 |
| Parámetros sustituidos | 13.949.952 (0,20% de los parámetros densos de proyección) |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only autorregresivo con atención por consultas agrupadas (GQA), normalización RMSNorm pre-normalización, activación SwiGLU y codificación posicional rotatoria (RoPE). Sobre esa base no se ha realizado ningún entrenamiento adicional ni ajuste por RLHF o DPO documentado en la información disponible: la modificación es puramente post-hoc y opera sobre los tensores de pesos ya entrenados.

El procedimiento tiene dos etapas. Primero se aplica SVD-LLM, una técnica de compresión que descompone en valores singulares las matrices de proyección y trunca las componentes de menor energía, eliminando en este caso el 40,02% de los parámetros de proyección y dejando el modelo en 0,5998 de la fracción densa original. Después se ejecuta el swap iterativo neutro en parámetros: en cada ronda se seleccionan 2.569 componentes según la regla `gap_iter` y se sustituyen por componentes del modelo original (denso), con el objetivo de restaurar selectivamente el comportamiento perdido sin aumentar el número de parámetros. Cada ronda consume un fragmento del 0,100% del presupuesto (1,000% total) y este checkpoint captura el estado tras 2 de las 10 rondas previstas, por lo que es un artefacto intermedio.

No se documentan en la información disponible innovaciones de inferencia (decodificación especulativa, atención lineal u otras), ni composición del dataset, ni número de tokens de entrenamiento, ya que no hay fase de entrenamiento nueva.

## Capacidades

- Generación de texto conversacional: hereda la capacidad del Llama 3.1 8B Instruct original, aunque la compresión SVD y la edición de parámetros pueden degradarla de forma no cuantificada en esta ficha.
- Investigación de seguridad: el checkpoint está diseñado explícitamente para medir la tasa de éxito de ataques (ASR) y el sobre-rechazo bajo compresión, no para responder a peticiones de usuario en producción.
- Reproducción experimental: la semilla (42), la regla de selección (`gap_iter`) y el presupuesto por ronda quedan fijados, lo que permite reproducir la celda exacta y compararla con otras celdas de la rejilla.
- Análisis de selección de componentes: permite estudiar qué componentes (2.569 por ronda) contribuyen más a la recuperación del comportamiento alineado.
- Tool calling / function calling: no verificado en este checkpoint; el modelo base lo soporta, pero la compresión y el swap pueden haber alterado esa capacidad y no hay datos publicados al respecto.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponible; ninguna declarada.

## Casos de uso

- Cuantificación del daño de seguridad por compresión: este checkpoint se usa como punto de medida para comparar el ASR (0,4200 en AdvBench, 0,3250 en StrongREJECT) con el del Llama-3.1-8B-Instruct sin comprimir y con el de la versión comprimida sin reparación, aislando así el efecto de la etapa SVD-LLM.
- Evaluación comparativa de reglas de selección de componentes: al ser una celda de una rejilla que cruza reglas y presupuestos, permite contrastar `gap_iter` frente a otras reglas con el mismo presupuesto del 1,000% y las mismas rondas.
- Estudio de la curva de reparación por ronda: al ser un checkpoint intermedio (2 de 10 rondas), sirve para trazar cómo evoluciona el ASR a medida que se consumen fragmentos del 0,100% del presupuesto, en lugar de observar solo el resultado final.
- Medición de sobre-rechazo tras edición de parámetros: con un macro de sobre-rechazo de 0,0559 medido con WildGuard, el modelo permite estudiar si la reparación de seguridad encarece el rechazo de peticiones benignas.
- Auditoría de pipelines de compresión en producción: equipos que comprimen modelos alineados pueden usar este tipo de artefacto para verificar que su propio pipeline no reintroduce vulnerabilidades antes de desplegar una variante comprimida.
- Línea base en investigación de interpretabilidad: los 13.949.952 parámetros sustituidos y los 2.569 componentes por ronda constituyen un conjunto acotado y reproducible sobre el que analizar qué direcciones de pesos están asociadas al comportamiento de rechazo.
- Docencia y formación: como ejemplo didáctico de flujo completo compresión, edición selectiva de pesos y evaluación con jueces automáticos (HarmBench, WildGuard) en un modelo de 8B manejable en una GPU.
- Validación de metodología de evaluación: permite comprobar la sensibilidad de AdvBench, StrongREJECT y WildGuard frente a perturbaciones controladas del mismo orden de magnitud que las que introduce una compresión agresiva.

## Benchmarks y rendimiento

| Métrica | Resultado | Juez / instrumento |
|---|---|---|
| AdvBench ASR | 0,4200 | HarmBench |
| StrongREJECT ASR | 0,3250 | HarmBench |
| Macro de sobre-rechazo | 0,0559 | WildGuard |

No se han publicado en la información disponible resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros), ni comparaciones numéricas con el modelo base sin comprimir. Las tres métricas anteriores miden exclusivamente comportamiento de seguridad y rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16-18 GB solo para los pesos (el repositorio ocupa 16,1 GB), más la caché KV, que crece de forma lineal con la longitud de contexto y puede dominar el consumo en ventanas largas.
- VRAM estimada en cuantización de 8 bits: aproximadamente 9-10 GB para los pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5-6 GB para los pesos.
- Estas cifras son estimaciones derivadas del recuento de parámetros (8.030.261.248) y no mediciones publicadas por el autor.
- GPU recomendadas: A100 40 GB o 80 GB y H100 para servir con contexto largo; RTX 4090 (24 GB) es viable en bf16 con contextos moderados y en cuantizaciones de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y, con cuantización de 4 bits, en tarjetas de 8-12 GB.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (etiqueta `text-generation-inference` presente) y vLLM. El repositorio no publica pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa por parte del usuario.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ASR AdvBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l31_remove40_swapgapiter_b010_r02 | 8.030.261.248 (fracción densa 0,5998) | No verificado; base de 128.000 tokens | 0,4200 | Llama 3.1 Community License | Pesos safetensors en HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | No disponible en la información proporcionada | 128.000 tokens (modelo base) | No disponible | Llama 3.1 Community License | Pesos safetensors en HuggingFace |
| Otras celdas de la rejilla del mismo autor | No disponibles | No disponible | No disponible | Llama 3.1 Community License | No disponibles en la información proporcionada |

La única comparación sólida es contra el modelo base sin comprimir, pero no se han facilitado sus valores de ASR, por lo que la magnitud exacta de la degradación inducida por la compresión no puede establecerse con los datos disponibles.

## Limitaciones y advertencias

- Artefacto de investigación, no desplegable: el autor indica explícitamente que el checkpoint es un sujeto experimental y que debe evaluarse antes de extraer conclusiones, no un asistente de propósito general.
- Degradación de seguridad deliberada en parte de la rejilla: el propio autor señala que varias celdas están "deliberadamente degradadas en seguridad" respecto a Llama-3.1-8B-Instruct; la compresión por sí sola eleva la tasa de éxito de ataques.
- ASR elevado: 0,4200 en AdvBench y 0,3250 en StrongREJECT implican que una fracción sustancial de prompts adversarios tiene éxito. No debe exponerse a usuarios finales sin mitigaciones adicionales.
- Checkpoint intermedio: solo se han aplicado 2 de las 10 rondas previstas, por lo que el comportamiento observado no representa el resultado final de la run completa.
- Sin datos de capacidades generales: no hay MMLU, HumanEval, GSM8K ni evaluaciones de razonamiento, código o matemáticas; se desconoce cuánto ha degradado la compresión esas capacidades.
- Idiomas no declarados: no se especifica qué idiomas soporta ni si el multilingüismo del modelo base se ha visto afectado.
- Tool calling y uso agéntico no verificados: aunque el modelo base los soporta, no hay evidencia de que sobrevivan a la compresión y al swap.
- Riesgo de alucinación: no cuantificado en la información disponible; al tratarse de un modelo comprimido, la degradación de pesos puede agravar el fenómeno.
- Discrepancia de recuento: el total de safetensors (8.030.261.248) no refleja de forma directa la reducción del 40,02% declarada, que se aplica específicamente sobre los parámetros de proyección; conviene no interpretar la cifra de safetensors como el tamaño efectivo del modelo comprimido.
- Restricciones de licencia: Llama 3.1 Community License con `USE_POLICY.md` adjunto; incluye política de uso aceptable y condiciones específicas para uso comercial (entre ellas, límites de usuarios activos mensuales y obligación de atribución "Built with Llama"). Es responsabilidad del usuario revisar `LICENSE` y `USE_POLICY.md` antes de cualquier uso.
- Baja tracción: 0 descargas y 0 "likes" en el momento de la consulta; no hay validación comunitaria independiente de los resultados.
- Fecha de creación inusual (2026-09-17) según los metadatos del repositorio; conviene verificar la vigencia de los ficheros antes de reutilizarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Política de uso aceptable de Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/USE_POLICY.md

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo, la técnica SVD-LLM ni el estudio de seguridad asociado; los enlaces anteriores proceden exclusivamente de la información de HuggingFace y de las referencias al modelo base.
