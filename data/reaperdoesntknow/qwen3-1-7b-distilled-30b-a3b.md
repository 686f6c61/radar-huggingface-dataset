# reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B

## Resumen

Qwen3-1.7B-Distilled-30B-A3B es un modelo de lenguaje causal de aproximadamente 2.031 millones de parametros, desarrollado por reaperdoesntknow (Convergent Intelligence LLC, Research Division) mediante destilacion de conocimiento a partir del modelo profesor Qwen3-30B-A3B-Instruct-2507 sobre el modelo base Qwen3-1.7B. El objetivo es transferir capacidad de razonamiento STEM (matematicas, fisica, ingenieria, biologia, algebra lineal, ecuaciones diferenciales) a un modelo lo bastante pequeno para desplegarse en entornos de borde.

La contribucion tecnica diferencial es una metodologia de destilacion informada por discrepancia (DISC v3) que pondera dinamicamente los tokens de la destilacion segun su papel estructural en la derivacion: los tokens de "pivote" del razonamiento, detectados mediante la divergencia KL token a token entre profesor y estudiante, reciben un peso amplificado, mientras que los tokens de continuacion suave mantienen el peso estandar. Ademas, se aplica suavizado sobre tokens de estudiante de alta entropia y una regularizacion basada en "energia de discrepancia" para evitar degradacion estructural.

El resultado es un modelo compacto (2B parametros, pesos en bf16, repo de 12,2 GB) con licencia Apache 2.0, orientado a generacion de texto en ingles con enfasis en cadenas de razonamiento con estructura de prueba formal. Es relevante para quienes necesitan razonamiento STEM en hardware modesto sin depender de un modelo MoE de 30B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 causal language model (transformer decoder-only) |
| Parametros totales | 2.031.739.904 (~2,03B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (longitud de contexto de entrenamiento); contexto nativo del base no detallado en la informacion disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only derivado de Qwen3-1.7B, con pesos en bf16. La arquitectura interna (numero de capas, dimensiones de atencion, tipo de atencion) corresponde a la del modelo base Qwen3-1.7B y no se detalla de forma independiente en la informacion disponible. El profesor utilizado para la destilacion es Qwen3-30B-A3B-Instruct-2507, un modelo MoE de 30B parametros totales y aproximadamente 3B activos.

El entrenamiento se realizo sobre 6.122 muestras de chain-of-thought STEM (5.815 de entrenamiento, 307 de evaluacion), agregadas de 10 datasets de dominio: fisica (2.254 muestras), algebra lineal (667), ecuaciones diferenciales (636), electromagnetismo (580), ingenieria (574), mecanica clasica (343), mecanica teorica (307), fisica general (225), biologia molecular (71) y fisiologia (114), mas un dataset de matematicas. El objetivo combina tres terminos: entropia cruzada ponderada por prueba (peso 0,55, con enfasis en la region de derivacion que decae de 2,5x a 1,5x), destilacion KL ponderada por discrepancia (peso 0,45, temperatura 2,0, amplificador de saltos 3,0x con umbral media + 2 sigma) y regularizacion de energia de discrepancia (lambda 0,02). Se entreno 1 epoca con AdamW, learning rate 1,5e-5, scheduler coseno con 30 pasos de calentamiento, batch efectivo 8 mediante acumulacion de gradiente 8, clipping 1,0 y autocast bf16. El suavizado DG-Limit usa ventana de 3 tokens y umbral de entropia media + 1 sigma.

La innovacion destacable es el tratamiento no uniforme de tokens durante la destilacion: la senal de discrepancia token a token se interpreta como una secuencia y sus cambios locales abruptos se identifican como pivotes de razonamiento, recibiendo peso amplificado sin anotacion manual. Esto desplaza capacidad de aprendizaje hacia transiciones estructurales de la derivacion en lugar del promedio de tokens.

## Capacidades

- Generacion de texto autoregresiva en ingles con foco en cadenas de razonamiento STEM.
- Razonamiento matematico con estructura de prueba: derivaciones marcadas entre `Proof:` y `Final Answer:`.
- Razonamiento en fisica, mecanica clasica y teorica, electromagnetismo, algebra lineal, ecuaciones diferenciales, ingenieria, biologia molecular y fisiologia.
- Produccion de chain-of-thought explicito orientado a calidad de derivacion sobre formato de respuesta.
- Capacidades conversacionales basicas (tag `conversational`).
- No se documenta soporte de tool calling / function calling en la informacion disponible.
- No se documenta soporte de agentes ni multi-step reasoning orquestado en la informacion disponible.
- No se documenta modo thinking explicito, vision ni audio.
- Multilingue: solo ingles segun la model card.

## Casos de uso

- Tutoria STEM automatizada: el modelo genera derivaciones paso a paso en matematicas y fisica, adecuado para explicar resoluciones a estudiantes porque fue entrenado explicitamente para producir estructura de prueba entre marcadores `Proof:` y `Final Answer:`.
- Generacion de soluciones verificables en fisica e ingenieria: al estar destilado sobre datasets de mecanica clasica, electromagnetismo e ingenieria, puede redactar resoluciones con pasos intermedios que un revisor humano valida rapidamente.
- Asistencia en algebra lineal y ecuaciones diferenciales: util como borrador de derivaciones en entornos docentes o de autoestudio, con contexto de hasta 1024 tokens suficiente para enunciados y desarrollos de extension media.
- Despliegue en borde y entornos con recursos limitados: con ~2B parametros en bf16 y licencia Apache 2.0, puede ejecutarse en GPUs de consumo y integrarse en aplicaciones locales de asistencia tecnica sin infraestructura de centro de datos.
- Preprocesamiento de razonamiento en pipelines de datos: puede generar cadenas de pensamiento STEM para enriquecer datasets de entrenamiento o como generador de borradores que un modelo mayor revisa.
- Prototipado rapido de asistentes tecnicos en ingles: al ser un modelo pequeno y de licencia permisiva, sirve para validar productos de Q&A tecnico antes de escalar a modelos mayores.
- Investigacion sobre destilacion: util como referencia reproducible de la metodologia DISC v3 para estudiar ponderacion por discrepancia en destilacion de razonamiento.

## Benchmarks y rendimento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4-5 GB solo para pesos (2,03B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica 6-8 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2-3 GB de pesos; en 4 bits: aproximadamente 1,2-1,5 GB de pesos (estimaciones teoricas, no se publican variantes cuantizadas oficiales).
- GPU recomendadas: cualquier GPU con 8 GB o mas para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090); A100/H100 sobredimensionadas para este tamano pero validas para alto throughput.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM en bf16; en 4 bits cabe en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama/vLLM no se documentan oficialmente para este checkpoint, aunque al ser arquitectura Qwen3 podrian ser viables previa conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B-Distilled-30B-A3B (este) | ~2,03B | 1024 (entrenamiento) | Apache 2.0 | Destilado de Qwen3-30B-A3B sobre 6.122 muestras STEM; solo ingles |
| Qwen/Qwen3-1.7B (base) | ~1,7B | no detallado aqui | Apache 2.0 | Modelo base sin destilacion STEM especifica |
| Qwen/Qwen3-30B-A3B-Instruct-2507 (profesor) | 30B totales / ~3B activos | no detallado aqui | no detallado aqui | MoE de mayor capacidad; requiere hardware muy superior |

La comparativa de rendimiento numerico entre estos modelos no esta disponible en la informacion proporcionada. La ventaja practica del modelo destilado frente al base es la especializacion en estructura de prueba STEM; frente al profesor, el menor coste de despliegue a cambio de menor capacidad general.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Contexto de entrenamiento de solo 1024 tokens, lo que limita derivaciones largas y conversaciones multi-turno extensas.
- Entrenado con 1 epoca sobre 6.122 muestras: riesgo elevado de sobreajuste al estilo de los datasets y de baja generalizacion fuera de dominios STEM.
- Riesgo de alucinacion en derivaciones: el modelo prioriza estructura de prueba sobre correccion; puede producir pasos formalmente plausibles pero matematicamente incorrectos.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Qwen3-1.7B hereda los sesgos del base, no caracterizados aqui.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de calidad ni soporte; verificar terminos del modelo base y del profesor.
- El nombre del checkpoint menciona "30B-A3B" por el profesor, no por el tamano del modelo resultante (~2B); no confundir con un MoE.
- No se documentan variantes cuantizadas oficiales ni resultados de benchmarks, lo que dificulta evaluar su rendimiento real antes del despliegue.
- Para produccion, conviene validar con evaluaciones propias en el dominio objetivo y considerar un modelo mayor si se requiere robustez multilingue o contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Datasets de entrenamiento (referenciados en la model card): 0xZee/dataset-CoT-Theoretical-Mechanics-307, 0xZee/dataset-CoT-Linear-Algebra-667, 0xZee/dataset-CoT-Electromagnetism-580, 0xZee/dataset-CoT-Molecular-Biology-71, 0xZee/dataset-CoT-Physiology-114, 0xZee/dataset-CoT-Classical-Mechanics-343, 0xZee/dataset-CoT-Differential-Equations-636, 0xZee/dataset-CoT-Physics-2254, 0xZee/dataset-CoT-Engineering-574, 0xZee/dataset-CoT-mathematics (todos en Hugging Face bajo el namespace 0xZee)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
