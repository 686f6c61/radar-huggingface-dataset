# Ilikemechuri/mechuris-rwkv-rl-project

## Resumen

`mechuris-rwkv-rl-project` es un espacio de trabajo de investigación publicado en HuggingFace por el usuario Ilikemechuri, no un modelo listo para producción. Se trata de un archivo completo de un proyecto de ajuste fino mediante aprendizaje por refuerzo (RL) sobre el modelo base `RWKV/RWKV7-G1l-2.9B-20261031`, una arquitectura RWKV-7 de 2.900 millones de parámetros. El repositorio contiene el adaptador resultante de una ejecución de 40 rondas de RL orientada a matemáticas, junto con los datos, informes y artefactos del proceso.

El interés del artefacto es metodológico: documenta un ciclo de RL sobre un modelo RWKV (arquitectura recurrente lineal, no transformer) con adaptadores personalizados en lugar de PEFT, y publica resultados honestos aunque limitados. En un conjunto de validación fijo de 12 muestras respondibles, el modelo base acertó 5 y el adaptador de 40 rondas acertó 7, con 5 truncamientos sobre 16. El propio autor advierte que no es una afirmación significativa de rendimiento.

No debe confundirse con un modelo conversacional o de propósito general: es un archivo de investigación de 30,6 GB que incluye cachés ocultos, directorios Git anidados y un tarball de 15,11 GiB. Los idiomas declarados son inglés y coreano, y la licencia es una combinación de licencias de componentes upstream detalladas en `LICENSES.md`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (modelo base `RWKV7-G1l-2.9B-20261031`) |
| Parametros totales | 2.900 millones (modelo base); el adaptador RL no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; se menciona un GGUF K2 7B externo al workspace, no incluido |
| Idiomas soportados | en, ko |
| Licencia | other / mixed-component-licenses (ver `LICENSES.md`) |
| Formato de pesos | adaptadores RWKV personalizados (`math_rl_lora.pth`, `math_rl_lora_40.pth`), no PEFT; archivo `.tar.zst` con el workspace completo |

## Arquitectura y entrenamiento

El modelo base es RWKV-7, una arquitectura recurrente lineal con mecanismo de atención lineal que evita el coste cuadrático de los transformers clásicos. Sobre él se aplicó un ajuste mediante RL con adaptadores de tipo LoRA implementados de forma nativa para RWKV (no checkpoints PEFT), en una ejecución de 40 rondas centrada en razonamiento matemático. Los datos de entrenamiento provienen de `openai/gsm8k`, `DigitalLearningGmbH/MATH-lighteval`, `Ayushnangia/unanswerable-math-question`, `nvidia/OpenMathInstruct-2` y `open-r1/OpenR1-Math-220k`.

El proceso incluyó una fase previa de 10 rondas (`math_rl_lora.pth`, piloto) y una de 40 rondas (`math_rl_lora_40.pth`). Además, se generaron 67 ejemplos de entrenamiento verificados y seis ejemplos respondibles reservados para evaluación a partir de un modelo denominado K2, cuyas etiquetas de no respondible y razonamientos docentes no han sido verificados de forma independiente. El entrenamiento SFT no se ha ejecutado y la búsqueda por ascenso de colina (hill climb) permanece en pausa. También existe un informe separado de DPO de herramientas (`tool_dpo/REPORT.md`).

## Capacidades

- Razonamiento matemático: el adaptador está entrenado específicamente para resolver problemas de matemáticas escolares y de competición.
- Generación de texto en inglés y coreano: únicos idiomas declarados.
- Manejo de preguntas no respondibles: el dataset `unanswerable-math-question` sugiere entrenamiento para detectar problemas sin solución, aunque las etiquetas no están verificadas.
- Adaptación mediante RL: el artefacto demuestra la viabilidad de aplicar RL con adaptadores nativos RWKV.
- Tool calling / function calling: no disponible como capacidad del modelo; existe un informe de DPO de herramientas, pero no se documenta un soporte funcional.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Visión, audio o modo thinking: no disponible.

## Casos de uso

- Investigación en RL sobre arquitecturas recurrentes: el workspace permite reproducir el pipeline completo de 40 rondas, incluyendo datos, manifiestos y scripts, para estudiar cómo se comporta el RL en RWKV frente a transformers.
- Estudio de adaptadores no PEFT en RWKV: sirve como referencia para implementar LoRA nativo en RWKV-7 y comparar su estabilidad frente a PEFT.
- Evaluación de detección de preguntas no respondibles: los datos de `unanswerable-math-question` permiten analizar si el modelo aprende a abstenerse en problemas sin solución.
- Reproducción de experimentos matemáticos: con GSM8K y MATH-lighteval como base, se puede replicar la comparación base vs. adaptador en un conjunto fijo de validación.
- Docencia e investigación académica: el archivo documenta decisiones, informes y limitaciones, útil para cursos de ajuste fino y RL.
- Base para futuros experimentos de SFT: los 67 ejemplos verificados y los seis reservados permiten lanzar el SFT que el autor dejó pendiente.
- Análisis de truncamientos en generación matemática: el informe de 40 rondas registra 5 truncamientos sobre 16, un dato relevante para estudiar longitudes de generación en RWKV.

## Benchmarks y rendimiento

| Conjunto | Modelo base | Adaptador 40 rondas |
|---|---|---|
| Validación fija (12 muestras respondibles) | 5/12 correctas | 7/12 correctas |
| Truncamientos | no disponible | 5/16 |

El autor indica explícitamente que estos resultados no constituyen una afirmación significativa de rendimiento. No se han publicado resultados de MMLU, HumanEval, GSM8K completo ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; para el modelo base de 2.900 millones en fp16 se estiman aproximadamente 6 GB, y en cuantización de 8 bits unos 3 GB (estimación orientativa, no confirmada en la información).
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: probablemente sí para el modelo base en cuantización, pero no confirmado para el adaptador.
- Opciones de despliegue: la librería declarada es `rwkv`; se menciona una compilación externa de llama.cpp y un GGUF K2 7B fuera del workspace, no incluidos. No se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mechuris-rwkv-rl-project | 2.900 M (base) | no disponible | mixed-component-licenses | HuggingFace, 0 descargas |
| RWKV7-G1l-2.9B-20261031 | 2.900 M | no disponible | no disponible | HuggingFace (modelo base) |
| Alternativas transformer de ~3B para matemáticas | ~3.000 M | variable | variable | no disponible en la información |

No se dispone de datos de benchmarks comparables ni de modelos alternativos evaluados en las mismas condiciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un archivo de investigación con cachés, directorios Git anidados y artefactos intermedios.
- Resultados no significativos: 7/12 frente a 5/12 en 12 muestras no permite conclusiones estadísticas; el propio autor lo advierte.
- Truncamientos: 5 de 16 generaciones se truncaron en la evaluación del adaptador de 40 rondas.
- Etiquetas no verificadas: las etiquetas de no respondible y los razonamientos docentes de K2 no han sido probados de forma independiente.
- SFT no ejecutado: el pipeline de SFT queda pendiente y el hill climb está en pausa.
- Idiomas limitados: solo inglés y coreano; no se declara soporte de castellano.
- Licencia compleja: mezcla de licencias de componentes upstream; es imprescindible revisar `LICENSES.md` antes de cualquier uso comercial.
- Riesgo de alucinación: inherente a un modelo de 2.900 millones ajustado con RL sobre matemáticas; no se documentan mitigaciones.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- Formato de adaptador no estándar: no son checkpoints PEFT, lo que complica la integración con herramientas convencionales.

## Enlaces

- HuggingFace: https://huggingface.co/Ilikemechuri/mechuris-rwkv-rl-project
- Modelo base: https://huggingface.co/RWKV/RWKV7-G1l-2.9B-20261031
- Licencias: https://huggingface.co/Ilikemechuri/mechuris-rwkv-rl-project/blob/main/LICENSES.md
- Informe de 40 rondas: `REPORT_40_ROUNDS.md` (en el repositorio)
- Informe de 10 rondas: `REPORT_10_ROUNDS.md` (en el repositorio)
- Informe de DPO de herramientas: `tool_dpo/REPORT.md` (en el repositorio)
- Navegación del proyecto: `AGENTS.md` (en el repositorio)
- Citas: `CITATIONS.md` (en el repositorio)
