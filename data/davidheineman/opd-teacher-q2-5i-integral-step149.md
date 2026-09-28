# davidheineman/opd-teacher-Q2.5I-Integral-step149

## Resumen

`davidheineman/opd-teacher-Q2.5I-Integral-step149` es un ajuste fino de [Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct) entrenado por David Heineman con el framework RLVE y el algoritmo GRPO sobre el entorno `Integral` a dificultad 0. No es un modelo de propósito general: es un **modelo maestro (teacher) para un experimento de destilación on-policy sobre 32 entornos**, y este checkpoint concreto (`step149`, el update número 150 contando desde cero) es el estado final de ese entrenamiento. El repositorio ocupa 3,1 GB y contiene 1.543.714.304 parámetros en formato safetensors.

El interés de esta ficha es fundamentalmente metodológico. El modelo sirve como pieza reproducible de un pipeline de investigación: un modelo base pequeño, un entorno de recompensa verificable (cálculo de integrales), 150 actualizaciones de GRPO y una conversión validada de los tensores del checkpoint nativo a safetensors contra los nombres y formas del modelo base. Quien quiera estudiar cómo se comporta el RL con recompensa verificable en modelos de 1,5 B de parámetros, o replicar un esquema de destilación on-policy, tiene aquí el artefacto exacto y sus trazas de entrenamiento.

Hay que subrayar dos limitaciones de alcance desde el principio. Primero, el modelo está especializado en el entorno `Integral`, por lo que su ventaja esperable se concentra en ese dominio y no hay evidencia publicada de que mejore capacidades generales. Segundo, el autor solo declara inglés como idioma y no publica resultados de benchmarks, de modo que cualquier afirmación sobre su rendimiento relativo a otros modelos sería especulativa. Fue publicado el 28 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2), con RoPE y atención de consultas agrupadas (GQA), según las especificaciones públicas del modelo base Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-1.5B-Instruct; no se documenta ninguna modificación en este ajuste |
| Tipos de cuantizacion | No especificados por el autor; el repositorio publica safetensors. Al derivar de Qwen2.5-1.5B-Instruct, es convertible a GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.), AWQ y GPTQ con herramientas estándar |
| Idiomas soportados | Inglés (`en`), único idioma declarado |
| Licencia | Apache 2.0 (se incluye el texto de la licencia original de Qwen en `LICENSE`) |
| Formato de pesos | Safetensors (librería `transformers`) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Método de entrenamiento | GRPO con RLVE (recompensa verificable), 150 updates |
| Entorno de entrenamiento | `Integral`, dificultad 0 |
| Tamaño del repositorio | 3,1 GB |
| Pipeline | text-generation |
| Fecha de publicación | 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso, sin mezcla de expertos ni componentes de espacio de estados. Esto implica que todas las capacidades del modelo provienen de los 1,54 mil millones de parámetros que se activan en cada token. El autor no documenta ninguna modificación estructural, ningún cambio en el tokenizador ni alteración de la longitud de contexto; el ajuste es puramente de pesos mediante RL. La conversión desde el checkpoint nativo a safetensors se validó explícitamente contra los nombres y las formas de tensor del modelo base, lo que reduce el riesgo de incompatibilidades al cargarlo con `transformers`.

El entrenamiento consiste en 150 actualizaciones de GRPO (Group Relative Policy Optimization) sobre el entorno `Integral` a dificultad 0, dentro de un experimento mayor de 32 entornos orientado a destilación on-policy. GRPO es un método de optimización de política sin crítico que estima la ventaja relativa dentro de un grupo de muestras generadas para la misma consulta, lo que abarata el coste de memoria frente a PPO. RLVE aporta la parte de entornos con recompensa verificable: en este caso, tareas de integración cuya corrección puede comprobarse programáticamente en lugar de depender de un modelo juez. El repositorio no detalla el número de tokens de entrenamiento, la composición del dataset ni la receta de prompts, y no se menciona ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). El índice `step149` es el checkpoint final en base cero, es decir, la actualización número 150.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste instructivo de Qwen2.5-1.5B-Instruct.
- Razonamiento matemático especializado en cálculo de integrales, dominio sobre el que se optimizó con recompensa verificable.
- Resolución de problemas en formato de respuesta verificable, según la mecánica del entorno `Integral`.
- Generación de rollouts y trayectorias de razonamiento utilizables como datos de destilación on-policy, que es su función declarada dentro del experimento.
- Soporte de tool calling / function calling: no confirmado tras el ajuste con GRPO. El modelo base lo soporta de forma nativa, pero el autor no documenta si esa capacidad se preserva; debe validarse empíricamente antes de usarla en producción.
- Soporte de agentes y razonamiento multi-paso: no documentado por el autor.
- Capacidades multilingües: solo se declara inglés.
- Capacidades especiales: no se documenta modo de pensamiento explícito (thinking mode), visión, audio ni entrada multimodal. Es un modelo estrictamente de texto.

## Casos de uso

- Destilación on-policy de modelos pequeños: es el uso para el que se creó. El modelo genera trayectorias sobre el entorno `Integral` que después se usan como señal de supervisión para un modelo alumno, aprovechando que la recompensa del entorno es verificable y no depende de un juez humano.
- Investigación en aprendizaje por refuerzo con recompensa verificable: sirve como punto de comparación reproducible frente a otros checkpoints del mismo barrido (`opd-teachers-20260927-191939`) para estudiar cómo evoluciona la política a lo largo de 150 updates de GRPO.
- Generación de datos sintéticos de cálculo integral: se pueden producir problemas resueltos paso a paso y filtrarlos automáticamente comprobando el resultado, obteniendo un corpus de entrenamiento con verificación programática.
- Estudio de olvido catastrófico y desviación de dominio: al ser un ajuste estrecho sobre un solo entorno, es un sujeto adecuado para medir cuánto se degradan las capacidades conversacionales generales del modelo base tras RL especializado.
- Base para ajuste supervisado posterior en matemáticas: partiendo de este checkpoint se puede hacer SFT sobre un corpus más amplio de cálculo, comprobando si el sesgo inductivo adquirido con GRPO acelera la convergencia.
- Despliegue ligero en inglés para tareas conversacionales sencillas: con 1,54 B de parámetros cabe en una GPU de consumo o incluso en CPU cuantizado, lo que permite prototipos locales de chat siempre que se acepte una calidad muy inferior a la de modelos mayores.
- Reproducibilidad metodológica: al estar publicados el run de W&B, el código de entrenamiento y el entorno, el checkpoint permite replicar el experimento completo y auditar la conversión de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye MMLU, GSM8K, HumanEval, MATH, AIME ni ninguna otra métrica cuantitativa en la model card, y los resultados de búsqueda no aportan evaluaciones independientes. Tampoco se publica la tasa de recompensa alcanzada en el entorno `Integral` ni la curva de entrenamiento en texto; para consultarla habría que acceder al run de W&B enlazado más abajo.

## Requisitos de hardware

Las cifras siguientes son estimaciones de ingeniería derivadas del tamaño del modelo (1,54 B de parámetros) y de la arquitectura de Qwen2.5-1.5B-Instruct, no datos publicados por el autor.

- VRAM para inferencia en BF16/FP16: en torno a 3,1 GB solo de pesos, más caché KV y activaciones; presupuestar 4-5 GB.
- VRAM en INT8: aproximadamente 1,6 GB de pesos; presupuestar 2,5-3 GB.
- VRAM en INT4: aproximadamente 0,9-1,1 GB de pesos; presupuestar 1,5-2 GB.
- Caché KV a contexto completo: con 28 capas, 2 cabezas KV y dimensión de cabeza 128, el coste ronda los 28 KB por token en FP16, lo que supone cerca de 0,9 GB adicionales a 32.768 tokens.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090, incluso en precisión completa. También es viable en GPUs con 4 GB si se cuantiza a INT4.
- GPU de datacenter: A100, H100, L40S o A10G son sobredimensionadas para un solo modelo, pero adecuadas para servir muchas réplicas en paralelo o para ejecutar el bucle de RLVE durante el entrenamiento.
- CPU: la inferencia cuantizada a GGUF Q4/Q5 es viable en CPU moderna, con latencias del orden de decenas de tokens por segundo en hardware de escritorio razonable.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), vLLM y TGI para servir con alto throughput, llama.cpp y Ollama previa conversión a GGUF, y SGLang como alternativa. El repositorio está marcado como compatible con text-generation-inference y endpoints.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de time-to-first-token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-Integral-step149 | 1,54 B | 32.768 tokens (heredado del base) | Apache 2.0 | HuggingFace, safetensors | Ajuste GRPO especializado en el entorno `Integral`; sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | HuggingFace, safetensors, GGUF, AWQ, GPTQ | Modelo base; instructivo general, multilingüe, con soporte nativo de tool calling y buenos resultados publicados en benchmarks |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens | Apache 2.0 | HuggingFace, múltiples formatos | Alternativa más pequeña de la misma familia; menor calidad general pero coste de inferencia mucho menor |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, GGUF | Ventana de contexto mucho mayor, pero licencia con restricciones para uso comercial y menos ecosistema de cuantizaciones que Qwen |

La comparación con estos modelos es en gran medida asimétrica: los tres alternativos son modelos instructivos de propósito general con evaluaciones publicadas, mientras que el modelo de esta ficha es un artefacto de investigación especializado. No existe información pública que permita afirmar que supere o iguale a ninguno de ellos fuera del entorno `Integral`.

## Limitaciones y advertencias

- Especialización extrema: el entrenamiento se limita a un único entorno (`Integral`, dificultad 0). Fuera de ese dominio cabe esperar un comportamiento igual o peor que el del modelo base, no mejor.
- Ausencia total de evaluaciones: sin benchmarks publicados no es posible cuantificar la degradación ni la mejora respecto a Qwen2.5-1.5B-Instruct.
- Riesgo de alucinación: no documentado, pero propio de un modelo de 1,5 B de parámetros. En tareas matemáticas existe riesgo de producir pasos intermedios plausibles con resultados incorrectos, especialmente fuera del formato exacto del entorno de entrenamiento.
- Riesgo de olvido catastrófico: 150 updates de GRPO sobre una sola tarea pueden deteriorar el seguimiento de instrucciones generales, el soporte de tool calling y la coherencia conversacional del modelo base. Conviene evaluarlo antes de usarlo como asistente general.
- Multilingüismo: solo se declara inglés. No hay evidencia de comportamiento en castellano ni en otros idiomas, y es probable que el rendimiento sea bajo.
- Contexto: no se documenta ninguna extensión ni modificación de la ventana de 32.768 tokens del modelo base; no debe asumirse que el ajuste con RL la preserve íntegra en la práctica.
- Licencia: Apache 2.0 permite uso comercial y modificación sin restricciones adicionales, siempre que se conserve el aviso de licencia y se cumpla con los términos aplicables al modelo base Qwen. No hay cláusulas de uso aceptable adicionales documentadas en esta ficha.
- Madurez y soporte: 0 descargas y 0 likes, sin issues ni discusiones públicas. Es un artefacto de investigación efímero, no un modelo con mantenimiento.
- Reproducibilidad: el autor no documenta hiperparámetros, semillas, composición del dataset ni presupuesto de cómputo, más allá del enlace al run de W&B y al código de RLVE.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-Integral-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Colección RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Perfil del autor en HuggingFace: https://huggingface.co/davidheineman
- Web personal del autor: https://davidheineman.com/
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/2a53600b
- Código de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Paper de referencia citado en la colección: https://arxiv.org/abs/2511.07317
