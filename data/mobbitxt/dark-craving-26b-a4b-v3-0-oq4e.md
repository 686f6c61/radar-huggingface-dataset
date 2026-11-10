# mobbitxt/Dark-Craving-26B-A4B-v3.0-oQ4e

## Resumen

Dark-Craving-26B-A4B-v3.0-oQ4e es una cuantizacion en 4 bits (formato MLX, `oQ4e`) del modelo ReadyArt/Dark-Craving-26B-A4B-v3.0, publicada por el usuario mobbitxt. Se trata de un modelo de generacion de texto orientado a roleplay conversacional y contenido para adultos (ERP), afinado a partir de la familia Gemma (la etiqueta `gemma4` aparece en los metadatos del repositorio). El modelo no esta alineado con filtros de seguridad convencionales y esta marcado explicitamente como `not-for-all-anchors` —en concreto `not-for-all-audiences`— y `nsfw`.

El repositorio contiene 25.805.936.206 parametros reales segun los pesos en safetensors, lo que lo situa en la categoria de ~26B. El sufijo `A4B` del nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4B de parametros activos, aunque la model card no documenta esta cifra de forma explicita. El peso total del repositorio es de 16,3 GB, coherente con una cuantizacion de 4 bits sobre un modelo de ese tamano.

La relevancia de esta ficha es doble: por un lado, ilustra el ecosistema de cuantizaciones MLX para ejecucion local en hardware Apple Silicon; por otro, ejemplifica los modelos comunitarios sin alineacion orientados a nichos concretos. La licencia declarada es Apache 2.0, pero el contenido esta restringido a uso adulto y el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma, segun tag `gemma4`); probable MoE por el sufijo `A4B`, no confirmado en la model card |
| Parametros totales | 25.805.936.206 (~25,8B) |
| Parametros activos | no disponible (el nombre sugiere ~4B, sin confirmacion documental) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (variante `oQ4e` para MLX) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base ReadyArt/Dark-Craving-26B-A4B-v3.0. La etiqueta `gemma4` en los metadatos apunta a un linaje derivado de la familia Gemma de Google, y el sufijo `A4B` del nombre es consistente con un diseno de mezcla de expertos con aproximadamente 4B de parametros activos sobre un total de ~26B. Esta interpretacion no esta confirmada por la model card, que se limita a una presentacion visual con avisos de contenido adulto.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. El modelo se presenta como `unaligned`, lo que en la practica indica la ausencia de un ajuste de alineacion orientado a rechazar contenido explicito. Esta cuantizacion concreta es una conversion a 4 bits en formato MLX (`oQ4e`), pensada para inferencia en Apple Silicon mediante la libreria `mlx`, y no anade entrenamiento propio: es una redistribucion comprimida del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en roleplay y narrativa interactiva.
- Contenido explicito para adultos (ERP) sin filtros de alineacion de seguridad.
- Instrucciones conversacionales (`instruct`) y mantenimiento de personajes o escenarios a lo largo de la conversacion.
- Generacion creativa de ficcion y dialogos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo esta afinado especificamente para mantener personajes y escenarios coherentes en conversaciones multi-turno, lo que lo hace adecuado para aplicaciones de entretenimiento interactivo para adultos.
- Generacion de ficcion explicita: util para autores que necesitan borradores de narrativa adulta sin las restricciones de rechazo de modelos alineados.
- Prototipado local en Mac: al estar en formato MLX 4 bits con 16,3 GB de pesos, permite experimentar con un modelo de ~26B en equipos Apple Silicon con memoria unificada suficiente, sin depender de GPU dedicadas.
- Simulacion de personajes para juegos de texto: su naturaleza `instruct` y conversacional encaja con motores de aventuras conversacionales donde el jugador interactua con NPCs.
- Investigacion sobre modelos sin alineacion: sirve como caso de estudio para analizar el comportamiento de modelos `unaligned` y sus riesgos en comparacion con variantes alineadas.
- Evaluacion de cuantizaciones MLX: permite medir la degradacion de calidad de una cuantizacion 4 bits `oQ4e` frente al modelo base en tareas de generacion creativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 16,3 GB en 4 bits; se recomienda al menos 18-20 GB de memoria unificada libre para cargar los pesos y mantener contexto.
- GPU recomendadas: hardware Apple Silicon con memoria unificada suficiente (familias M2 Pro/Max, M3 Pro/Max, M4 Pro/Max con 24 GB o mas). El formato MLX no esta pensado para GPU NVIDIA.
- Cabe en GPU consumer: si, en equipos Apple Silicon de gama alta con 24 GB o mas de memoria unificada. En GPUs NVIDIA consumer no es el formato nativo.
- Opciones de despliegue: libreria `mlx` / `mlx-lm` en macOS. No se distribuye en GGUF, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Dark-Craving-26B-A4B-v3.0-oQ4e | ~25,8B | no disponible | safetensors MLX 4 bits | Apache 2.0 | Roleplay/ERP, solo ingles, sin alinear |
| Dark-Craving-26B-A4B-v3.0 (base) | ~25,8B | no disponible | safetensors | Apache 2.0 | Version sin cuantizar del mismo modelo |
| Alternativas de roleplay sin alinear de ~20-30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- Contenido explicito y para adultos: el modelo esta etiquetado como `nsfw`, `explicit` y `not-for-all-audiences`; no debe desplegarse en entornos accesibles a menores ni en productos de consumo general.
- Modelo sin alinear: al carecer de ajuste de seguridad, puede generar contenido danino, ilegal o eticamente problemático sin rechazo.
- Solo ingles: no hay soporte declarado para castellano ni otros idiomas.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar hechos; en roleplay el riesgo es menor, pero en usos informativos es alto.
- Licencia Apache 2.0 declarada, pero el uso comercial de contenido adulto puede estar sujeto a normativas locales y a las politicas de las plataformas de distribucion.
- Cuantizacion 4 bits: puede degradar la coherencia en contextos largos o tareas complejas frente al modelo base.
- Sin datos de contexto maximo ni de rendimiento en benchmarks: dificil de evaluar para produccion.
- Formato MLX: limita el despliegue a ecosistema Apple; no es directamente portable a servidores NVIDIA sin conversion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mobbitxt/Dark-Craving-26B-A4B-v3.0-oQ4e
- Modelo base: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v3.0
- Libreria MLX: https://github.com/ml-explore/mlx
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm
