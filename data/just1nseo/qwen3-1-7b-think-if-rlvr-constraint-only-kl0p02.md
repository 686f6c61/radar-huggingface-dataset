# just1nseo/qwen3-1.7b-think-if-rlvr-constraint-only-kl0p02

## Resumen

`just1nseo/qwen3-1.7b-think-if-rlvr-constraint-only-kl0p02` es un conjunto de checkpoints de ajuste fino derivados de `Qwen/Qwen3-1.7B`, entrenados con GRPO (Group Relative Policy Optimization) mediante la librería verl para mejorar el seguimiento de instrucciones (instruction-following) con restricciones explícitas. No se trata de un modelo nuevo con arquitectura propia, sino de una familia de pesos bfloat16 exportados tras un proceso de RLVR (Reinforcement Learning with Verifiable Rewards) centrado exclusivamente en restricciones, con un coeficiente de penalización KL de 0,02 y un tamaño de batch de 1024.

El repositorio publica cada paso de entrenamiento (`global_step_<N>/`) como un modelo completo de Hugging Face, lo que permite evaluar la evolución del ajuste paso a paso. La variante documentada en la model card corresponde al paso `global_step_91`. El modelo base Qwen3-1.7B es un transformer denso de 1.700 millones de parámetros con modo de razonamiento (thinking), sobre el que este ajuste añade un sesgo hacia el cumplimiento estricto de restricciones formales en las respuestas.

El interés del modelo es acotado pero específico: sirve como referencia reproducible para estudiar cómo el RLVR con recompensas verificables afecta al seguimiento de instrucciones en modelos pequeños, y como punto de partida para experimentos de alineamiento con verl. No está pensado como modelo de producción generalista, y su licencia no está declarada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B) |
| Parametros totales | 1.700 millones (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; los checkpoints se publican en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16), subcarpetas `global_step_<N>/` |
| Libreria | transformers |
| Framework de entrenamiento | verl (GRPO, RLVR) |
| Coeficiente KL | 0,02 |
| Tamano de batch | 1024 |
| Tamano del repositorio | 6,9 GB |
| Modelo base | Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer denso decoder-only con 1.700 millones de parámetros, sin mezcla de expertos. Sobre este modelo se aplica un ajuste con GRPO, un algoritmo de optimización de política que estima ventajas relativas dentro de grupos de respuestas muestreadas, eliminando la necesidad de un modelo crítico separado. El entrenamiento se ejecutó con verl, la librería de RL para modelos de lenguaje de Volcengine.

La innovación del ajuste reside en el esquema de recompensa: RLVR con recompensas verificables restringidas exclusivamente a restricciones (constraint-only), es decir, la señal de recompensa evalúa el cumplimiento de restricciones formales en la respuesta más que la calidad general del contenido. El nombre del run indica además un batch de 1024, un grupo de tamaño 1 y una penalización KL de 0,02 frente al modelo de referencia. El repositorio exporta cada paso como un modelo bfloat16 completo, lo que permite trazar la evolución del entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases previas de SFT o DPO.

## Capacidades

- Generación de texto autoregresiva con modo de razonamiento (thinking), heredada de Qwen3-1.7B.
- Seguimiento de instrucciones con restricciones explícitas, objetivo principal del ajuste RLVR.
- Razonamiento multi-paso en formato de cadena de pensamiento, según el comportamiento del modelo base.
- Capacidades multilingües heredadas del modelo base, aunque no se documentan idiomas concretos en este repositorio.
- Soporte de tool calling y function calling: no documentado en la información disponible para este ajuste.
- Capacidades de agente y razonamiento multi-paso autónomo: no documentadas específicamente para este checkpoint.
- Visión y audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Investigación de alineamiento con RLVR: el repositorio permite comparar checkpoints intermedios (`global_step_<N>`) para estudiar cómo evoluciona el cumplimiento de restricciones a lo largo del entrenamiento con GRPO y distintos valores de KL.
- Evaluación de seguimiento de instrucciones restringidas: útil para medir la tasa de violación de restricciones formales (formato, longitud, prohibiciones léxicas) en modelos pequeños y contrastarla con el modelo base sin ajustar.
- Reproducción de experimentos con verl: los pesos exportados en bfloat16 y la estructura por pasos facilitan replicar el pipeline GRPO y validar configuraciones de recompensa verificable.
- Generación de texto controlada en entornos de prueba: para prototipos donde se exige que la salida respete un conjunto fijo de reglas sintácticas o de formato, el ajuste puede reducir incumplimientos frente al base.
- Base para ajustes posteriores: al ser un checkpoint intermedio, puede servir como punto de partida para SFT o DPO adicionales en dominios específicos.
- Docencia y demostraciones de RL para LLM: el tamaño de 1,7B permite ejecutar el modelo en hardware modesto y mostrar el efecto de la recompensa verificable en la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,7 GB de pesos; en 4 bits, alrededor de 0,9 GB (aunque el repositorio no publica versiones cuantizadas).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090 sin problemas en bfloat16.
- Opciones de despliegue: transformers (soporte nativo documentado), vLLM y TGI para servir en producción, llama.cpp u Ollama si se convierten los pesos a GGUF (no se proporcionan GGUF en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada; en un modelo de 1,7B en una RTX 4090 se espera un throughput del orden de miles de tokens por segundo en batch, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| just1nseo/qwen3-1.7b-think-if-rlvr-constraint-only-kl0p02 | 1,7B | no disponible | GRPO + RLVR (constraint-only) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-1.7B | 1,7B | no disponible en esta ficha | SFT + RLHF del autor original | Apache 2.0 (según el modelo base de Qwen) | Hugging Face, ampliamente usado |
| Qwen/Qwen3-4B | 4B | no disponible en esta ficha | SFT + RLHF del autor original | Apache 2.0 | Hugging Face |
| Meta-Llama-3.2-1B-Instruct | 1,2B | 128K (según el modelo original) | SFT + RLHF | Llama 3.2 Community License | Hugging Face |

La comparación directa con el modelo base Qwen3-1.7B es la más relevante: este checkpoint solo se diferencia por el ajuste GRPO con recompensas de restricciones, por lo que cualquier mejora debe medirse contra el base en tareas de instruction-following restringido, no en benchmarks generales.

## Limitaciones y advertencias

- Modelo de investigación: sin descargas ni likes, sin model card detallada y sin benchmarks publicados; no hay evidencia de calidad en producción.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que consultar al autor o al modelo base antes de cualquier despliegue.
- Riesgo de sobreajuste a restricciones: el entrenamiento constraint-only puede degradar la calidad general del texto o inducir respuestas excesivamente rígidas fuera del conjunto de restricciones entrenado.
- Riesgo de alucinación: inherente a un modelo de 1,7B; el ajuste RLVR no corrige la veracidad factual.
- Idiomas no documentados: no se garantiza un rendimiento multilingüe equilibrado más allá de lo que herede del base.
- Contexto no documentado: se desconoce la ventana efectiva de este checkpoint; no asumir la del modelo base sin verificación.
- Checkpoints intermedios: cada `global_step_<N>` es un modelo distinto; usar el paso 91 sin evaluar los demás puede no ser óptimo.
- Sin cuantizaciones publicadas: no hay GGUF ni AWQ/GPTQ en el repositorio, lo que limita el despliegue en hardware muy restringido sin conversión manual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/just1nseo/qwen3-1.7b-think-if-rlvr-constraint-only-kl0p02
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Librería verl (framework de entrenamiento): https://github.com/volcengine/verl
