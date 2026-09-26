# RL-Forgetting-Experiments-3/qwen2.5-3b-math-sft-shuffled-lr1e5-all-checkpoints

## Resumen

Este repositorio no contiene un modelo final, sino un artefacto de experimentación publicado por el grupo RL-Forgetting-Experiments-3. Recoge diez checkpoints intermedios de un proceso de ajuste supervisado (SFT) sobre datos de matemáticas, partiendo del modelo base Qwen/Qwen2.5-3B. El identificador del repositorio indica que el conjunto de datos de entrenamiento se barajó (shuffled) y que se usó una tasa de aprendizaje de 1e-5, con el objetivo declarado de analizar la evolución de la pérdida (loss analysis) y, por el nombre del grupo, el olvido catastrófico durante el entrenamiento.

Cada carpeta `checkpoints/step_N/` es un modelo de Hugging Face cargable directamente con la librería transformers. Los checkpoints corresponden a los pasos 107, 214, 322, 429, 536, 643, 750, 858, 965 y 1072, es decir, un total de 1072 pasos de entrenamiento con guardados periódicos aproximadamente cada 107 pasos. El tamaño total del repositorio es de 123,4 GB, coherente con almacenar diez copias completas de un modelo de ~3B parámetros.

Su relevancia es metodológica, no de producto: sirve para estudiar cómo evoluciona un modelo pequeño de razonamiento matemático a lo largo del SFT, comparar checkpoints y reproducir análisis de pérdida y olvido. No debe tratarse como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura Qwen2.5, heredada del modelo base Qwen/Qwen2.5-3B) |
| Parametros totales | 3,09B aproximadamente (heredados del modelo base) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors; no se publican versiones GPTQ, AWQ ni GGUF) |
| Idiomas soportados | No disponible en la ficha (heredados del modelo base, que cubre ~29 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Numero de checkpoints | 10 (pasos 107, 214, 322, 429, 536, 643, 750, 858, 965, 1072) |
| Tamano del repositorio | 123,4 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-3B, un transformer decoder-only denso con atención de consultas agrupadas (GQA), normalización RMSNorm, activación SwiGLU y embeddings posicionales rotatorios (RoPE). No se documenta ninguna modificación estructural en este repositorio; los checkpoints son pesos ajustados del mismo grafo computacional.

La información disponible sobre el entrenamiento es escasa. Se sabe que se trata de un SFT sobre datos de matemáticas, con el dataset barajado (shuffled) y una tasa de aprendizaje de 1e-5, y que el proceso se detuvo en el paso 1072. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas posteriores de RLHF o DPO. La etiqueta `loss-analysis` sugiere que el propósito del experimento era registrar las curvas de pérdida a lo largo del entrenamiento; los resultados de evaluación por checkpoint se publican en un repositorio de datasets aparte. No se documenta ninguna innovación técnica de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y razonamiento matemático: al ser un SFT sobre datos de matemáticas, se espera cierto refuerzo en resolución de problemas aritméticos y de razonamiento numérico, aunque no hay evaluación publicada que lo cuantifique.
- Generación de código y capacidades generales de lenguaje: heredadas del modelo base Qwen2.5-3B.
- Capacidades multilingües: heredadas del modelo base, que declara cobertura de unos 29 idiomas; no se confirma que el SFT haya preservado dicha cobertura.
- Soporte de tool calling / function calling: no documentado en este repositorio. El modelo base Qwen2.5 sí lo soporta en sus variantes, pero el ajuste SFT sobre matemáticas puede haber degradado esta capacidad.
- Modo de razonamiento extendido (thinking mode), visión o audio: no disponible.
- Uso como material de investigación: comparación de checkpoints, análisis de pérdida y estudio de olvido catastrófico.

## Casos de uso

- Investigación sobre olvido catastrófico: los diez checkpoints permiten medir cómo cambia el rendimiento en tareas generales y matemáticas a medida que avanza el SFT, aislando el punto en el que se degrada el conocimiento previo.
- Análisis de curvas de pérdida: comparar la pérdida de validación entre pasos para estudiar convergencia, sobreajuste y estabilidad con tasa de aprendizaje 1e-5 y datos barajados.
- Comparación de checkpoints intermedios: evaluar paso a paso qué checkpoint ofrece el mejor equilibrio entre capacidad matemática y preservación del comportamiento del modelo base.
- Reproducibilidad de experimentos de ajuste: sirve como referencia para replicar una receta de SFT concreta (datos barajados, lr 1e-5) sobre Qwen2.5-3B.
- Punto de partida para ajustes posteriores: cualquiera de los diez checkpoints puede cargarse con transformers y continuarse con nuevas fases de entrenamiento o técnicas de alineación.
- Docencia y divulgación: ilustrar en un entorno controlado cómo un modelo pequeño evoluciona durante el SFT, con artefactos reales cargables.
- Estudio de técnicas de fusión de modelos (model merging): dado que hay múltiples checkpoints del mismo linaje, permiten experimentar con interpolación de pesos entre pasos de entrenamiento.
- Base para experimentos de cuantización comparativa: al no existir versiones cuantizadas publicadas, se puede estudiar el impacto de cuantizar cada checkpoint por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente enlaza a los resultados de evaluación por checkpoint almacenados en el repositorio de datasets `RL-Forgetting-Experiments-3/qwen2.5-3b-math-kk-sft-artifacts`, pero no se incluyen métricas numéricas concretas (MMLU, GSM8K, HumanEval, etc.) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 6-7 GB en fp16, unos 3-4 GB en int8 y unos 2-3 GB en 4 bits, para un modelo denso de ~3B parámetros.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16, como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090; para despliegues con más concurrencia, A100 o H100 permiten mayor throughput.
- Compatibilidad con GPU de consumo: sí, cabe cómodamente en GPUs de consumo modernas, e incluso en 4 bits en tarjetas de 6-8 GB.
- Opciones de despliegue: transformers (formato nativo del repositorio), vLLM y TGI para servido con batching, y llama.cpp u Ollama previa conversión a GGUF, ya que no se publican pesos GGUF.
- Almacenamiento: el repositorio completo ocupa 123,4 GB por incluir diez checkpoints completos; conviene descargar solo el checkpoint de interés.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este repositorio (SFT matemáticas, 10 checkpoints) | ~3,09B | 32.768 tokens | apache-2.0 | Pesos safetensors, 10 checkpoints | Artefacto de investigación, sin benchmarks publicados |
| Qwen/Qwen2.5-3B (base) | ~3,09B | 32.768 tokens | apache-2.0 | Pesos safetensors, versiones cuantizadas | Modelo base del que deriva este ajuste |
| Qwen/Qwen2.5-3B-Instruct | ~3,09B | 32.768 tokens | apache-2.0 | Pesos safetensors, versiones cuantizadas | Variante alineada, con soporte de tool calling |
| Llama-3.2-3B | ~3,2B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Pesos safetensors, versiones cuantizadas | Alternativa de tamaño similar con contexto mayor y licencia no plenamente abierta |

Los datos de los modelos comparativos corresponden a información pública de referencia sobre sus versiones base y no proceden de la model card analizada; conviene verificarlos en sus repositorios oficiales antes de tomar decisiones.

## Limitaciones y advertencias

- No es un modelo listo para producción: se trata de un artefacto de investigación con checkpoints intermedios, sin evaluación de calidad publicada.
- Ausencia total de benchmarks: no hay métricas de MMLU, GSM8K, HumanEval ni similares, por lo que no puede afirmarse su rendimiento real.
- Riesgo elevado de olvido catastrófico: el propio nombre del grupo y la etiqueta `loss-analysis` apuntan a que el efecto del SFT sobre las capacidades generales es precisamente lo que se está estudiando.
- Riesgo de alucinación: inherente a los modelos de ~3B parámetros, especialmente en dominios fuera de las matemáticas.
- Idiomas no confirmados: aunque el modelo base cubre múltiples idiomas, no se garantiza que el SFT sobre matemáticas los preserve.
- Capacidades de tool calling y agentes no documentadas: no deben asumirse en este ajuste.
- Restricciones de licencia: la licencia es apache-2.0, lo que permite uso comercial, pero al derivar del modelo base Qwen2.5-3B conviene verificar las condiciones del modelo original.
- Coste de almacenamiento: 123,4 GB de repositorio, con diez checkpoints completos; descargar el repositorio entero es innecesario para la mayoría de usos.
- Procedencia de datos desconocida: no se detalla la composición del dataset de matemáticas empleado, lo que dificulta evaluar sesgos y calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RL-Forgetting-Experiments-3/qwen2.5-3b-math-sft-shuffled-lr1e5-all-checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Dataset de artefactos y evaluaciones por checkpoint: https://huggingface.co/datasets/RL-Forgetting-Experiments-3/qwen2.5-3b-math-kk-sft-artifacts/tree/main/runs/math_shuffled/eval
- Paper o blog del experimento: no disponible
- Repositorio de código: no disponible
