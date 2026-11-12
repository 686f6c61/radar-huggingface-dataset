# Elrond1701/qwen2.5-1.5b-sokoban-d8-gigpo

## Resumen

Qwen2.5-1.5B-Sokoban-d8-GiGPO es un ajuste fino por aprendizaje por refuerzo del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario Elrond1701 en Hugging Face. El modelo está especializado en resolver Sokoban en formato de texto: recibe una representación simbólica del tablero (rejilla 6×6 con 2 cajas, coordenadas del jugador, cajas y objetivos) y debe emitir secuencias de acciones (`Up`, `Down`, `Left`, `Right`) en un formato estricto dentro de etiquetas `<answer>`. No es un modelo de propósito general: es un artefacto de investigación para estudiar cómo distintos algoritmos de RL (GRPO, Tree-GRPO, RegPO y GiGPO) afectan al razonamiento multi-turno de un LLM pequeño en un entorno de planificación.

El entrenamiento utiliza GiGPO (Group-in-Group Policy Optimization), que combina ventajas a nivel de episodio con ventajas a nivel de paso ancladas en estados de referencia, con 8 rollouts por puzle y 150 pasos de entrenamiento. El checkpoint publicado es el paso 150, que además resultó ser el mejor de los guardados según la evaluación medida (20,7 % de éxito en 512 puzles fijos, frente al 6,2 % del Qwen2.5-1.5B-Instruct sin entrenar).

La relevancia de esta ficha es doble: por un lado, documenta un experimento reproducible de RL multi-turno sobre un modelo de 1.777 millones de parámetros que cabe en GPU de consumo; por otro, sirve como referencia comparativa entre cuatro variantes de RL del mismo autor, lo que permite evaluar el impacto del algoritmo de optimización en una tarea de planificación con recompensa escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajustado con RL multi-turno |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el prompt máximo usado en entrenamiento es de 3072 tokens y la respuesta máxima de 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible (entrenado en inglés para la tarea Sokoban) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, convertido desde checkpoint FSDP fp32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.777 millones de parámetros con atención causal estándar. Sobre esa base se aplica un ajuste fino por RL multi-turno usando verl 0.6.1 junto con verl-agent para el bucle de agente, y vLLM para generar los rollouts. El algoritmo es GiGPO, que calcula ventajas a dos niveles: a nivel de episodio (como GRPO) y a nivel de paso, usando estados ancla de referencia con normalización `mean_std_norm`, peso de ventaja de paso 1.0 y descuento de paso gamma 0.95. Se usan 8 rollouts por puzle, 16 puzles por paso, mini-batch PPO de 256, learning rate 1e-6, KL de 0.05, clip 0.2/0.2, agregación de pérdida token-mean y sin bonus de entropía.

El entorno es Sokoban de 6×6 con 2 cajas, generado por juego inverso con profundidad de búsqueda 8 y sin filtro de longitud de solución. Cada episodio dura 10 turnos con un máximo de 2 movimientos por turno (20 movimientos en total). La observación es un prompt estilo RAGEN con rejilla simbólica y coordenadas cero-indexadas del jugador, cajas y objetivos, incluyendo los últimos 2 turnos de historial y sin modo de razonamiento (el turno del asistente se prellena con `<answer>`). La recompensa sigue gym-sokoban: −0.1 por movimiento, +1 por caja sobre objetivo, −1 por caja fuera de objetivo y +10 por resolver. El formato es estricto: texto tras `</answer>` o más de 2 movimientos invalida el turno (sin movimiento y penalización de −0.5). El entrenamiento se hizo desde cero (semilla de entorno 0) durante 150 pasos, con evaluaciones cada 10 pasos sobre 512 puzles fijos y temperatura de muestreo 0.4.

## Capacidades

- Resolución de puzles Sokoban en formato texto: interpreta rejillas simbólicas y coordenadas y emite secuencias de movimientos válidos.
- Planificación multi-turno: mantiene el estado del puzle a lo largo de hasta 10 turnos con historial de los 2 turnos anteriores.
- Formato de salida estricto: produce respuestas dentro de `<answer>...</answer>` con acciones separadas por ` || `.
- Razonamiento de planificación con recompensa escasa: entrenado para maximizar cajas sobre objetivos y evitar empujar cajas fuera de ellos.
- No soporta tool calling ni function calling de forma nativa para uso general.
- No soporta agentes genéricos ni multi-step reasoning fuera del dominio Sokoban.
- Capacidades multilingües: no disponibles; el entrenamiento se realizó en inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en RL para LLMs: permite reproducir y comparar el efecto de GiGPO frente a GRPO, Tree-GRPO y RegPO sobre el mismo entorno y presupuesto de entrenamiento, usando los checkpoints hermanos publicados por el mismo autor.
- Evaluación de planificación con recompensa escasa: sirve como banco de pruebas para medir cómo un modelo de 1.5B aprende a resolver Sokoban con solo 150 pasos de RL y 20 movimientos por episodio.
- Estudio de formatos estrictos de acción: útil para analizar cómo el prellenado de `<answer>` y las penalizaciones por formato afectan a la tasa de éxito en agentes textuales.
- Docencia y divulgación: ejemplo compacto y ejecutable en GPU de consumo para explicar PPO, ventajas a nivel de paso y bucles de agente multi-turno con verl.
- Baseline para investigación en agentes: punto de comparación para nuevos algoritmos de RL que se evalúen sobre Sokoban 6×6 con 2 cajas y profundidad 8.
- Pruebas de infraestructura de inferencia: al ser un modelo pequeño en bf16 safetensors, permite validar pipelines con transformers, vLLM o TGI antes de escalar a modelos mayores.
- Análisis de robustez de agentes: permite estudiar fallos típicos (movimientos inválidos, empujar cajas fuera de objetivo, bucles) en un entorno controlado y determinista.

## Benchmarks y rendimiento

Los datos de la model card miden la tasa de éxito a nivel de fila (`val/regret_sokoban/success_rate`) sobre 512 puzles fijos, con temperatura 0.4, no la tasa de victoria por episodio. El modelo sin entrenar (Qwen2.5-1.5B-Instruct) obtiene 6,2.

| Modelo | paso 50 | paso 100 | paso 150 (este checkpoint) | media de las últimas 5 evals (110–150) | mejor eval (paso) |
|---|---|---|---|---|---|
| GRPO | 9,0 | 12,1 | 14,6 | 15,6 | 18,1 (140) |
| GiGPO (este) | 15,9 | 15,1 | 20,7 | 18,1 | 20,7 (150) |
| Tree-GRPO | 9,2 | 17,9 | 25,8 | 22,1 | 25,8 (150) |
| RegPO | 9,2 | 19,6 | 29,3 | 28,9 | 35,8 (140) |

Curva de evaluación de este modelo:

| paso | 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 | 110 | 120 | 130 | 140 | 150 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| éxito (%) | 6,2 | 8,4 | 9,0 | 14,6 | 12,3 | 15,9 | 16,7 | 15,5 | 18,3 | 15,2 | 15,1 | 16,5 | 15,0 | 19,5 | 18,8 | 20,7 |

Advertencias del autor: una sola semilla por método, 150 pasos de entrenamiento, y Tree-GRPO y RegPO se inicializaron desde el checkpoint del paso 50 de GRPO, mientras que GRPO y GiGPO se entrenaron desde cero. La comparación más limpia es RegPO/Tree-GRPO frente a GRPO en los pasos 51–150. No se guardaron las evaluaciones pico entre checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,6 GB solo para pesos; con overhead de activaciones y caché KV, entre 5 y 6 GB para prompts de hasta 3072 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1,2 GB (no se publican pesos cuantizados, habría que generarlos).
- GPU recomendadas: A100, H100 o L40S para entrenamiento y evaluación a escala; RTX 4090, RTX 3090 o RTX 4080 para inferencia cómoda en bf16.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en GPUs de 8 GB conviene cuantizar a 8 o 4 bits.
- Opciones de despliegue: transformers (código de ejemplo en la model card), vLLM (usado en los rollouts de entrenamiento), TGI (etiqueta `text-generation-inference` en el repo) y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles; al ser un modelo de 1.5B con respuestas de hasta 16 tokens nuevos en el uso previsto, la latencia por turno debería ser baja, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Éxito en Sokoban (paso 150) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GiGPO (este) | 1.777 M | no disponible (prompt máx. 3072) | 20,7 % | apache-2.0 | Hugging Face |
| GRPO (hermano) | 1.777 M | no disponible (prompt máx. 3072) | 14,6 % | apache-2.0 | Hugging Face |
| Tree-GRPO (hermano) | 1.777 M | no disponible (prompt máx. 3072) | 25,8 % | apache-2.0 | Hugging Face |
| RegPO (hermano) | 1.777 M | no disponible (prompt máx. 3072) | 29,3 % | apache-2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1.777 M | 32.768 tokens (según el modelo base) | 6,2 % | apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Modelo altamente especializado: fuera del dominio Sokoban en formato texto su comportamiento no está validado y probablemente degrade respecto al modelo base.
- Una sola semilla por método y solo 150 pasos de entrenamiento: los resultados tienen alta varianza y no permiten conclusiones estadísticamente robustas.
- La métrica reportada es tasa de éxito a nivel de fila sobre 512 puzles fijos, no tasa de victoria por episodio; no debe compararse directamente con métricas de otros entornos.
- Comparación entre métodos contaminada: Tree-GRPO y RegPO se inicializaron desde el paso 50 de GRPO, mientras que GRPO y GiGPO partieron de cero.
- El modelo no usa modo de razonamiento: el turno del asistente se prellena con `<answer>`, por lo que no genera cadenas de pensamiento explícitas.
- Formato estricto: cualquier texto tras `</answer>` o más de 2 movimientos invalida el turno con penalización de −0.5; en producción hay que validar la salida.
- Riesgo de alucinación de coordenadas o movimientos inválidos, especialmente en tableros distintos a los del entrenamiento (6×6, 2 cajas, profundidad 8).
- Idiomas: no se declaran idiomas soportados; el prompt de entrenamiento está en inglés.
- Licencia apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct tiene sus propios términos que conviene revisar.
- Sin datos publicados de sesgos, robustez adversarial ni comportamiento fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-gigpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Variante GRPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-grpo
- Variante Tree-GRPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-tree-grpo
- Variante RegPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-regpo
- Framework verl: https://github.com/volcengine/verl
- Paper de GiGPO: no disponible en la información proporcionada
