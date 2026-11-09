# severus-yang/pi0fast-libero10-recovery-newonly

## Resumen

pi0fast-libero10-recovery-newonly es un conjunto de checkpoints de ajuste fino del modelo pi0-FAST, una política robótica de tipo vision-language-action (VLA) desarrollada en el marco del proyecto openpi de Physical Intelligence. El autor del repositorio, severus-yang, publica los pesos resultantes del entrenamiento sobre el benchmark LIBERO-10, una suite de tareas de manipulación robótica de horizonte largo. Los checkpoints corresponden al paso 9999 de entrenamiento y están organizados en carpetas por función de pérdida y semilla (`<loss>_s<seed>/`), cada una con subdirectorios `params/` y `assets/`.

El modelo resuelve el problema de mapear observaciones visuales e instrucciones en lenguaje natural a acciones motoras de un brazo robótico, y es relevante para la comunidad de robótica porque pi0-FAST emplea decodificación autorregresiva con tokens de acción discretizados (FAST), una alternativa a los enfoques de difusión o flow matching usados en pi0 original. El repositorio ocupa 86,8 GB, lo que refleja el tamaño considerable de los pesos en formato JAX/Flax (no safetensors ni GGUF) y la presencia de múltiples variantes de entrenamiento.

No se dispone de información sobre el número exacto de parámetros, la longitud de contexto ni los idiomas soportados en la documentación proporcionada; la model card es extremadamente escueta y se limita a describir la estructura de carpetas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en pi0-FAST (openpi, JAX); no disponible el detalle exacto de la columna vertebral |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en formato JAX/Flax; no se publican variantes GGUF o cuantizadas) |
| Idiomas soportados | no disponible (el modelo recibe instrucciones en lenguaje natural, pero no se especifica cobertura lingüística) |
| Licencia | apache-2.0 |
| Formato de pesos | JAX/Flax (`params/` y `assets/`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo se basa en pi0-FAST, la variante de pi0 que sustituye la cabeza de flow matching por una decodificación autorregresiva sobre tokens de acción discretizados mediante el tokenizador FAST (Frequency-space Action Sequence Tokenization). Esta formulación convierte secuencias continuas de acciones en tokens discretos, permitiendo reutilizar mecanismos de transformers estándar para la generación de acciones. La implementación de referencia es openpi, escrita en JAX, lo que explica el formato de pesos publicado.

El entrenamiento se realizó sobre LIBERO-10, un benchmark de manipulación robótica con tareas de horizonte largo (10 tareas, cada una con decenas de demostraciones). La model card indica que los checkpoints corresponden al paso 9999 y que existen múltiples variantes organizadas por función de pérdida y semilla, lo que sugiere un barrido de hiperparámetros o un estudio de ablación. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicó RLHF o DPO; tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico visuomotor: genera secuencias de acciones a partir de observaciones de cámara e instrucciones en lenguaje natural.
- Manipulación de horizonte largo: entrenado específicamente en LIBERO-10, que requiere cadenas de acciones de decenas de pasos.
- Decodificación autorregresiva de acciones: produce tokens FAST que se detokenizan en comandos continuos para el robot.
- Comprensión de instrucciones en lenguaje natural: el modelo acepta prompts textuales que describen la tarea a ejecutar.
- Múltiples variantes de entrenamiento: checkpoints por pérdida y semilla, útiles para reproducibilidad y comparación.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general (más allá de la observación robótica), audio ni modo thinking.

## Casos de uso

- Investigación en aprendizaje por imitación: usar los checkpoints como línea base para comparar variantes de pérdida y semillas en LIBERO-10, aprovechando la organización por carpeta para reproducir experimentos.
- Evaluación de políticas VLA en simulación: desplegar el modelo en entornos LIBERO simulados para medir tasas de éxito en tareas de manipulación de horizonte largo.
- Ajuste fino sobre nuevos dominios robóticos: partir de estos pesos como inicialización para transferir a otras suites de tareas o brazos robóticos con datasets propios.
- Estudio de tokenización FAST: analizar cómo la discretización de acciones afecta la estabilidad y el rendimiento en comparación con políticas de flow matching.
- Desarrollo de pipelines de entrenamiento openpi: integrar los checkpoints en flujos JAX existentes para validar infraestructura de entrenamiento y evaluación.
- Benchmarking de robustez: comparar las distintas semillas para estimar la varianza del rendimiento y detectar configuraciones inestables antes de desplegar en hardware real.
- Docencia y divulgación: servir como ejemplo práctico de ajuste fino de un VLA en JAX para cursos de robótica o aprendizaje profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito en LIBERO-10 ni métricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio de 86,8 GB sugiere pesos de gran tamaño, pero no se especifica el número de parámetros ni el consumo en inferencia.
- GPU recomendadas: no disponible; al estar en JAX, se espera compatibilidad con GPUs NVIDIA y TPUs, pero no se documentan modelos concretos.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repositorio hace improbable que quepa en GPUs de consumo sin cuantización, que no se publica.
- Opciones de despliegue: openpi (JAX) es el marco de referencia; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a políticas robóticas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0fast-libero10-recovery-newonly | no disponible | no disponible | no disponible | apache-2.0 | Hugging Face |
| pi0 (openpi) | no disponible | no disponible | no disponible | no disponible | openpi |
| pi0-FAST (openpi) | no disponible | no disponible | no disponible | no disponible | openpi |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas; la comparativa se limita a la disponibilidad y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse en LIBERO-10, el modelo probablemente está especializado en las tareas y entornos de esa suite y puede generalizar mal fuera de ellos.
- Riesgo de alucinación: en políticas robóticas, el equivalente es la generación de acciones inválidas o incoherentes con la observación; no se documenta ninguna mitigación.
- Limitaciones de contexto o idioma: no se especifica la ventana de contexto ni la cobertura lingüística; las instrucciones pueden estar limitadas al inglés de los datasets de entrenamiento.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene verificar las licencias de los datasets subyacentes (LIBERO) y del código openpi.
- Caveats para producción: el repositorio contiene múltiples checkpoints sin indicación de cuál es el recomendado; el formato JAX/Flax requiere infraestructura específica y no es directamente compatible con toolchains de inferencia habituales. El paso 9999 puede no ser el óptimo y no se publican curvas de validación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/severus-yang/pi0fast-libero10-recovery-newonly
- Proyecto openpi (Physical Intelligence): no disponible en la información proporcionada
- Paper de pi0-FAST: no disponible en la información proporcionada
- Benchmark LIBERO: no disponible en la información proporcionada
