# RL-Forgetting-Experiments-3/code-q3_1p7b-nobuf

## Resumen

code-q3_1p7b-nobuf es un artefacto de investigación publicado por el usuario RL-Forgetting-Experiments-3: un ajuste por RL (GRPO) sobre Qwen/Qwen3-1.7B-Base orientado a generación de código y entrenado con 320 problemas del dataset MBPP. No se trata de un modelo listo para producto, sino de la rama "sin replay buffer" de un estudio controlado sobre olvido catastrófico durante el RL de código. La misma ejecución existe con y sin buffer de replay SFT, y ambas se evalúan sobre MBPP+ a lo largo del entrenamiento.

El repositorio no contiene un único modelo, sino 27 checkpoints completos en formato Hugging Face, uno por subcarpeta `global_step_<N>/`, siguiendo una rejilla de evaluación de paso 30 (30, 60, 90, ... 780) más el punto final en 800. Eso explica los 69,1 GB de tamaño del repo pese a que el modelo subyacente tiene alrededor de 1700 millones de parámetros.

La relevancia del artefacto es metodológica: permite estudiar cómo evoluciona el rendimiento en código y cómo se degrada el conocimiento previo a lo largo de 800 pasos de GRPO, con y sin mezcla de datos SFT, usando una evaluación más estricta que el MBPP original (la suite completa de tests de MBPP+, que según el autor penaliza entre 8 y 10 puntos de pass@1 frente a los 3 asserts clásicos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base Qwen3-1.7B-Base (no se detalla en la model card) |
| Parametros totales | Aproximadamente 1,7 mil millones (derivados del modelo base; no se declara cifra exacta en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la model card solo indica una longitud de respuesta de 3072 tokens durante el entrenamiento) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en precision completa) |
| Idiomas soportados | No disponibles (el campo de idiomas no esta informado en HuggingFace) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B-Base, un transformer decoder-only denso de aproximadamente 1,7 B de parámetros. Sobre esa base se aplica un ajuste por aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization), no un SFT clásico: el autor no describe cambios en la arquitectura, de modo que la innovación es exclusivamente de procedimiento de entrenamiento, no estructural.

Los detalles de entrenamiento están explícitos en la model card. Se usan 320 problemas de MBPP, separados tanto de MBPP+ (378 problemas) como del split de test canónico de MBPP (276), de forma que ambos conjuntos quedan disponibles para evaluar sin contaminación. La configuración de GRPO es: 8 rollouts por prompt, batch de 64, learning rate del actor de 1e-6 y longitud de respuesta de 3072 tokens. La recompensa es binaria y se obtiene ejecutando el programa generado contra los asserts de la tarea.

La variable experimental de esta rama concreta es la ausencia de buffer de replay. La rama con buffer mezcla 128 rollouts pasados por paso con peso lambda=0,1, muestreados mediante el criterio `hard_cooldown`. La comparación entre ambas ramas es precisamente el objeto del estudio sobre olvido catastrófico.

## Capacidades

- Generación de código en Python orientada a resolución de problemas algorítmicos: el entrenamiento se realizó íntegramente sobre MBPP con recompensa por ejecución correcta.
- Razonamiento paso a paso implícito para tareas de programación, derivado del proceso de RL sobre rollouts largos (hasta 3072 tokens de respuesta).
- Producción de programas autoejecutables con firmas de función y `asserts` de verificación, ya que el reward se basa en la ejecución del código generado.
- Trazabilidad experimental: 27 checkpoints intermedios que permiten analizar la evolución de capacidades a lo largo del entrenamiento.
- Capacidades multilingües: no confirmadas en la información disponible.
- Tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Modo thinking, visión o audio: no disponible.
- Comportamiento esperado de olvido catastrófico: es una característica estudiada del modelo, no una capacidad deseada; se anticipa degradación de conocimiento general respecto a la base.

## Casos de uso

- Estudio de olvido catastrófico en RL de código: comparar directamente esta rama sin buffer contra la rama con buffer de replay paso a paso, para cuantificar cuánto conocimiento previo se pierde en cada configuración y en qué momento del entrenamiento ocurre.
- Reproducción de experimentos de GRPO: la configuración completa (8 rollouts, batch 64, lr 1e-6, longitud de respuesta 3072, reward binario por ejecución) está documentada, lo que permite replicar o variar el setup en una base de 1,7 B asequible en una sola GPU.
- Análisis de trayectorias de entrenamiento: los 27 checkpoints permiten trazar curvas de pass@k frente a pasos y detectar puntos de inflexión, mesetas o degradaciones abruptas del rendimiento en código.
- Baseline para nuevas estrategias de mitigación del olvido: cualquier técnica propuesta (replay, regularización, LoRA selectivo, mezcla de datos) puede medirse contra esta rama no-buffer como referencia inferior.
- Validación de protocolos de evaluación en código: útil para comprobar la diferencia entre evaluar con los 3 asserts originales de MBPP y con la suite completa de MBPP+, cuantificada por el autor en 8-10 puntos de pass@1.
- Investigación sobre reward basado en ejecución: sirve para estudiar problemas prácticos del reward binario ejecutado, como el colapso de diversidad de rollouts o la explotación de casos triviales.
- Docencia y divulgación sobre RL para LLM: los checkpoints intermedios permiten mostrar en un aula cómo evoluciona un modelo de código paso a paso sin necesidad de clúster multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la information disponible. La model card describe el protocolo de evaluación (MBPP+ con 378 problemas, n=160 muestras, temperatura 0,6, top_p 0,95, pass@k insesgado) pero no incluye cifras de pass@1 ni de pass@k para ninguno de los checkpoints.

Como referencia metodológica, el autor advierte que evaluar contra la suite de tests completa de MBPP+ es sustancialmente más estricto que los 3 asserts originales de MBPP, con una diferencia de aproximadamente 8-10 puntos de pass@1 a la baja.

| Benchmark | Resultado |
|---|---|
| MBPP+ (378 problemas, pass@k insesgado) | No publicado en la informacion disponible |
| MBPP (asserts originales) | No publicado en la informacion disponible |
| MMLU, HumanEval, GSM8K u otros | No evaluados en la informacion disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, alrededor de 3,5-4 GB de pesos, más overhead de KV cache y activaciones, lo que sitúa la inferencia práctica en el rango de 4-6 GB. En fp32, aproximadamente 7 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM. Una RTX 3060 Ti, RTX 4060 Ti, RTX 3070 o superior es suficiente para inferencia en fp16. Una RTX 4090 o A100/H100 queda sobredimensionada para el modelo en sí, pero es útil para el pipeline de evaluación con muchas muestras (n=160 por checkpoint).
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo modernas con 8 GB o más. También en Apple Silicon con memoria unificada mediante MLX o llama.cpp, y potencialmente en GPUs integradas con cuantización agresiva, si bien el repositorio solo publica pesos sin cuantizar.
- Requisito de almacenamiento: el repositorio completo ocupa 69,1 GB debido a los 27 checkpoints. Conviene descargar únicamente la subcarpeta `global_step_<N>/` que se necesite con `subfolder` en `from_pretrained`.
- Opciones de despliegue: `transformers` de forma nativa (con `subfolder`), vLLM o TGI para servido de alto throughput tras convertir el checkpoint, llama.cpp/Ollama si se generan cuantizaciones GGUF a partir de los safetensors publicados.
- Latencia y throughput: no disponible en la información proporcionada (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Orientacion | Benchmarks publicados |
|---|---|---|---|---|---|
| code-q3_1p7b-nobuf | ~1,7 B (estimado por el nombre y el modelo base) | No disponible | apache-2.0 | RL con GRPO sobre MBPP, estudio de olvido | No disponibles |
| Qwen/Qwen3-1.7B-Base | ~1,7 B | No disponible en esta busqueda | apache-2.0 | Modelo base generalista de los mismos autores | Consultar su model card (no verificado aqui) |
| Qwen2.5-Coder-1.5B | ~1,5 B | No disponible en esta busqueda | apache-2.0 | Generacion de codigo generalista | No verificado en esta busqueda |
| DeepSeek-Coder-1.3B | ~1,3 B | No disponible en esta busqueda | Licencia propia de DeepSeek (consultar) | Generacion de codigo generalista | No verificado en esta busqueda |

La comparación con alternativas de la misma categoría debe hacerse con cautela. Los tres modelos citados son modelos generalistas de propósito definido, mientras que code-q3_1p7b-nobuf es un artefacto experimental optimizado para un único conjunto de problemas y para el estudio de una hipótesis concreta sobre olvido catastrófico. No es un competidor directo de ninguno de ellos en términos de uso general.

## Limitaciones y advertencias

- No es un modelo de producción: es una colección de checkpoints de un estudio de investigación, sin evaluación de seguridad, sin alineamiento con preferencias humanas y sin optimización para robustez en entornos reales.
- Sesgos conocidos: no se documentan análisis de sesgo, toxicidad ni representación demográfica. Al entrenarse exclusivamente sobre 320 problemas de MBPP, el modelo hereda la distribución, el estilo y los posibles sesgos de ese dataset.
- Riesgo de alucinación elevado en dominios fuera de código: la especialización sobre MBPP puede degradar el conocimiento general del modelo base, que es precisamente el fenómeno que se estudia. No debe asumirse que conserva las capacidades conversacionales o de conocimiento factual de Qwen3-1.7B-Base.
- Sobreajuste al dominio de entrenamiento: 320 problemas de MBPP es un conjunto muy reducido. Es probable un sobreajuste a los patrones de esos problemas y una transferencia limitada a código de producción, otros lenguajes o problemas de mayor complejidad.
- Limitaciones de contexto e idioma: la model card no declara ventana de contexto ni idiomas soportados; el único dato asociado es la longitud máxima de respuesta de 3072 tokens durante el entrenamiento.
- Riesgo de seguridad en la ejecución: la recompensa se calculó ejecutando código generado automáticamente contra asserts. Reproducir ese pipeline implica ejecutar código no verificado, por lo que debe hacerse siempre en un entorno aislado (sandbox, contenedor sin red, permisos restringidos).
- Licencia: apache-2.0, que permite uso comercial y modificación con atribución y conservación del aviso de licencia. Conviene verificar además las condiciones del modelo base Qwen3-1.7B-Base, también apache-2.0 según los tags del repositorio.
- Almacenamiento: los 69,1 GB del repositorio completo pueden ser un problema en entornos con disco limitado; descargar solo los checkpoints necesarios.
- Fecha y contexto del artefacto: el repositorio se creó el 1 de octubre de 2026 y no registra descargas ni "likes", por lo que carece de validación por parte de la comunidad hasta la fecha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RL-Forgetting-Experiments-3/code-q3_1p7b-nobuf
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Dataset MBPP+: no se proporciona enlace en la informacion disponible
- Dataset MBPP: no se proporciona enlace en la informacion disponible
- Paper del estudio sobre olvido catastrófico: no disponible
- Repositorio de código del experimento: no disponible
- Demo: no disponible
