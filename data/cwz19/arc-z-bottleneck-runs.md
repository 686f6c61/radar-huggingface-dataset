# cwz19/arc-z-bottleneck-runs

## Resumen

ARC-AGI-1 Z-bottleneck es un repositorio de artefactos de investigación publicado por el usuario cwz19 en Hugging Face. No se trata de un modelo único listo para producción, sino de una colección de ejecuciones de entrenamiento (runs) que exploran una arquitectura de tipo cuello de botella de información (information bottleneck) sobre tareas de razonamiento abstracto del benchmark ARC-AGI-1. El sistema se compone de un LLM escritor (writer) con adaptadores LoRA que genera una nota de memoria de como máximo 96 tokens describiendo una tarea ARC, y un LLM lector (reader) congelado que resuelve la cuadrícula de test a partir de esa nota.

El entrenamiento se realiza mediante GRPO (Group Relative Policy Optimization) sobre el escritor, con dos variantes: las ejecuciones NOB (sin penalización de longitud, beta = 0) y las ejecuciones IB (information bottleneck), que añaden una penalización por longitud de la nota según la fórmula r * (1 - w * beta * |z| / 1000). El objetivo es forzar al escritor a comprimir la información relevante de la tarea en un espacio latente textual muy reducido antes de que el lector resuelva el problema.

El repositorio tiene 0 descargas y 0 likes, fue creado el 14 de noviembre de 2026 y no incluye model card con licencia, idiomas ni pipeline declarados. Su interés es exclusivamente de investigación: documenta la mecánica de entrenamiento, los checkpoints LoRA intermedios y las métricas por paso para reproducir o analizar experimentos de compresión de información en razonamiento abstracto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de dos LLM (writer con LoRA + reader congelado) con cuello de botella textual de <=96 tokens; entrenamiento GRPO |
| Parametros totales | Variable por run: writer Qwen3.5-2B o Qwen3.5-4B; reader Qwen3.5-4B o Qwen3.5-9B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como contexto de inferencia; el cuello de botella limita la nota a <=96 tokens; algunas runs usan 4096 tokens de turno y 4096 tokens de thinking |
| Tipos de cuantizacion | No disponible (los checkpoints son adaptadores PEFT LoRA, no pesos cuantizados) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Adaptadores PEFT LoRA (`checkpoint-N/`), `resume.pt` (LoRA + Adam + RNG), `train.jsonl` (métricas por paso) |

## Arquitectura y entrenamiento

El sistema sigue un esquema de compresión en dos etapas. Un writer LLM, inicializado sobre Qwen3.5-2B o Qwen3.5-4B y ajustado con adaptadores LoRA, recibe una tarea ARC-AGI-1 y produce una nota de memoria de longitud máxima 96 tokens. Un reader LLM congelado, Qwen3.5-4B o Qwen3.5-9B, consume únicamente esa nota para predecir la cuadrícula de test. La separación impone un cuello de botella de información explícito: el writer debe decidir qué información de la tarea es suficiente para que el reader resuelva el problema.

El entrenamiento usa GRPO sobre el writer. Las ejecuciones NOB fijan beta = 0 y no penalizan la longitud de la nota. Las ejecuciones IB añaden una penalización r * (1 - w * beta * |z| / 1000), donde |z| es la longitud de la nota, forzando notas más cortas. Los runs documentados incluyen NOB_s1/IB_s1 (writer 2B, reader 4B, 150 pasos, beta 0 y 5), NOB4b_s1/IB4b_s1 (writer 4B, reader 4B con think200, 4096 tokens de turno, beta 5 desde el paso 75), RL9b_smoke1/RL9b_r1/RL9b_r2 (writer 4B, reader 9B con 4096 tokens de thinking y respuesta forzada; r1 colapsó y r2 usó 2048 tokens de turno) y SFT8b_s1 (experimento de writer con SFT). Cada carpeta de run contiene `train.jsonl` con métricas por paso, checkpoints LoRA y `resume.pt` para reanudar el entrenamiento con estado de Adam y RNG.

## Capacidades

- Generación de notas de memoria comprimidas (<=96 tokens) que resumen tareas ARC-AGI-1 para un lector separado.
- Razonamiento abstracto sobre cuadrículas ARC-AGI-1 en el lector, condicionado a la nota del writer.
- Entrenamiento con GRPO y control explícito de la longitud del cuello de botella mediante penalización IB.
- Variantes con modo thinking en el reader (think200 y 4096 tokens de thinking en runs con reader 9B).
- Reanudación de entrenamiento desde `resume.pt` con estado completo de LoRA, Adam y RNG.
- Registro de métricas por paso en `train.jsonl` para análisis de curvas de entrenamiento.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo.

## Casos de uso

- Investigación en information bottleneck: el repositorio permite reproducir experimentos que comparan runs NOB (sin penalización) frente a IB (con penalización de longitud) para estudiar cómo afecta la compresión de la nota a la precisión del reader en ARC-AGI-1.
- Estudio de compresión de contexto en razonamiento: analizar si un writer de 2B o 4B puede destilar la información esencial de una tarea ARC en 96 tokens y qué se pierde al reducir la nota, usando las métricas de `train.jsonl`.
- Reproducción de entrenamiento GRPO con LoRA: los checkpoints y `resume.pt` permiten reanudar runs, ajustar beta o el número de pasos y comparar curvas de recompensa sin reentrenar desde cero.
- Análisis de colapso en entrenamiento: la run RL9b_r1 colapsó y r2 usó 2048 tokens de turno, lo que sirve como caso de estudio de inestabilidad en GRPO con readers grandes (9B) y presupuestos de tokens variables.
- Evaluación de arquitecturas writer-reader desacopladas: comparar el rendimiento de readers de 4B frente a 9B con el mismo writer de 4B para medir cuánto aporta la capacidad del lector cuando la información está limitada por el cuello de botella.
- Docencia y experimentación con PEFT: los adaptadores LoRA y el formato `resume.pt` son material práctico para cursos o talleres sobre fine-tuning eficiente y entrenamiento con RL en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe la configuración de las runs (escritor, lector, pasos, beta, presupuesto de tokens) y el contenido de cada carpeta, sin incluir métricas de precisión, tasas de resolución de ARC-AGI-1 ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende de los modelos base (Qwen3.5-2B, Qwen3.5-4B, Qwen3.5-9B) y de la cuantización elegida para ellos, no de los adaptadores LoRA, que son ligeros.
- GPU recomendadas: no disponible en la información proporcionada. Para los readers de 9B con 4096 tokens de thinking se requiere una GPU con VRAM suficiente para el modelo base en la precisión elegida.
- Cabida en GPU de consumo: no confirmado; los adaptadores LoRA son pequeños, pero el sistema completo requiere cargar simultáneamente writer y reader (o secuencialmente) además de los modelos base.
- Opciones de despliegue: los checkpoints son adaptadores PEFT LoRA, por lo que se cargan con la librería `peft` sobre los modelos base Qwen3.5 correspondientes. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la model card menciona copias `*_vllm` que no se han subido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (sistemas writer-reader con cuello de botella textual para ARC-AGI-1 entrenados con GRPO) ni se dispone de datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Repositorio de artefactos de investigación, no un modelo listo para producción: contiene adaptadores LoRA, estados de entrenamiento y métricas, no pesos completos ni un pipeline de inferencia empaquetado.
- Sin licencia declarada: no se especifican términos de uso comercial, redistribución ni modificación; debe contactarse con el autor antes de cualquier uso más allá de la investigación.
- Idiomas no declarados: no hay información sobre el soporte multilingüe del sistema.
- Dependencia de modelos base Qwen3.5: el funcionamiento requiere disponer de las versiones concretas de writer y reader usadas en cada run, que no se incluyen en el repositorio.
- Riesgo de colapso en entrenamiento documentado: la run RL9b_r1 colapsó, lo que indica inestabilidad en configuraciones con reader de 9B y GRPO.
- Cuello de botella de 96 tokens: la nota puede ser insuficiente para tareas ARC complejas, lo que limita la precisión del reader por diseño.
- Sin benchmarks publicados: no es posible evaluar el rendimiento absoluto ni relativo del sistema con los datos disponibles.
- Fecha de creación futura (2026-11-14) y ausencia de descargas o likes: repositorio sin validación comunitaria ni señales de uso.
- Las copias `*_vllm` y los adaptadores `_live*` no se han subido, por lo que no se puede reproducir exactamente el pipeline de inferencia usado durante el entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cwz19/arc-z-bottleneck-runs
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
