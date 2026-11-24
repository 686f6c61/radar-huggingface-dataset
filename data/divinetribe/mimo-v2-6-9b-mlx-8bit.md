# divinetribe/MiMo-V2.6-9B-MLX-8bit

## Resumen

MiMo-V2.6-9B-MLX-8bit es una cuantizacion de 8 bits en formato MLX del checkpoint XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario divinetribe. El modelo original lo desarrolla el equipo MiMo de Xiaomi mediante ajuste supervisado (SFT) sobre Qwen3.5-9B, utilizando datos generados por MiMo que cubren codigo, tareas de agente generales, codificacion visual y ciberseguridad. Esta version concreta mantiene intacta la torre de vision y esta pensada para ejecutarse de forma nativa en Apple Silicon a traves de la libreria mlx-vlm.

La arquitectura es `Qwen3_5ForConditionalGeneration`, compuesta por una torre de vision `qwen3_5_vision` que alimenta un decodificador de texto `qwen3_5_text`. El modelo cuenta con 9.409.813.744 parametros (9,4B) y el repositorio pesa 10,4 GB en dos shards. La cuantizacion emplea 8,864 bits por peso con group size 64, lo que reduce el tamano aproximadamente a la mitad respecto a la version bf16 y permite su uso en maquinas con 16 GB de memoria unificada.

Su relevancia actual radica en que combina capacidades multimodales (lectura de imagenes y generacion de codigo a partir de capturas de pantalla) con un rendimiento en tareas de agente cercano a su modelo base, todo ello bajo licencia MIT y ejecutable localmente en hardware de consumo de Apple. El checkpoint original obtiene 61,1 en SWE-bench Verified (avg@3), por encima del 60,0 de su base Qwen3.5-9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (torre de vision `qwen3_5_vision` + decodificador de texto `qwen3_5_text`) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits MLX (8,864 bits por peso, group size 64); existe version bf16 en otro repositorio |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), dos shards, 10,4 GB de repositorio |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer multimodal de la familia Qwen3.5: una torre de vision (`qwen3_5_vision`) procesa las imagenes y alimenta un decodificador de texto (`qwen3_5_text`). El checkpoint original se construye mediante ajuste supervisado (SFT) de Qwen3.5-9B sobre datos generados por MiMo, abarcando codigo, tareas de agente, codificacion visual y ciberseguridad. El informe tecnico del modelo se titula "MiMo-V2.6: Scaling Reinforcement Learning Towards Self-Improvement" (Xiaomi MiMo Team, 2026), lo que sugiere que el pipeline de datos original esta ligado a un proceso de aprendizaje por refuerzo orientado a la auto-mejora, aunque la informacion disponible no detalla la composicion exacta del dataset ni el numero de tokens de entrenamiento.

La unica aportacion del repositorio divinetribe es la cuantizacion a 8 bits en MLX con group size 64, manteniendo la torre de vision intacta. Segun la model card, en una prueba cualitativa de lectura de pose el modelo de 8 bits produjo una respuesta identica a la version bf16, lo que sugiere que la cuantizacion preserva la calidad en esa tarea. No se dispone de informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento general, heredados del decodificador Qwen3.5.
- Generacion de codigo, con enfasis en tareas de agente de programacion (el checkpoint puntua en SWE-bench Verified).
- Capacidades de agente: el modelo esta etiquetado como "agentic" y se emplea en el proyecto Claude Code Local como uno de los modelos ejecutables localmente.
- Vision multimodal: lectura de imagenes con pipeline `image-text-to-text`, incluyendo descripcion de escenas, evaluacion de poses y generacion de texto alternativo (alt-text) para imagenes de producto e interfaz.
- Lectura de capturas de pantalla para reconstruir codigo a partir de imagenes de UI.
- Capacidades de ciberseguridad, segun los datos de entrenamiento declarados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Agente de programacion local: el modelo puede ejecutarse como agente de codigo en Apple Silicon a traves de mlx-vlm y del servidor compatible con la API de Anthropic de Claude Code Local, resolviendo tareas sobre repositorios reales. Su puntuacion de 61,1 en SWE-bench Verified lo respalda para este escenario.
- Control de calidad de vision por computador: tal como documenta la model card, puede evaluar si una figura dibujada sobre una escena de camara corresponde a una pose humana correcta, detectando extremidades extra o articulaciones mal colocadas. Es adecuado por su torre de vision intacta y su bajo coste de ejecucion en 8 bits.
- Generacion de texto alternativo: el modelo produce descripciones de imagenes de producto e interfaz, util para pipelines de accesibilidad o catalogos de e-commerce.
- Conversion de capturas de pantalla a codigo: puede leer una imagen de interfaz y reconstruir el codigo correspondiente, util en flujos de prototipado rapido y migracion de disenos.
- Asistencia en ciberseguridad: dado que el entrenamiento incluye datos de ciberseguridad, puede emplearse en tareas de analisis y revision de codigo orientadas a deteccion de vulnerabilidades, siempre con supervision humana.
- Despliegue en equipos de 16 GB: al ocupar aproximadamente la mitad que la version bf16, permite ejecutar un modelo multimodal de 9,4B en portatiles Apple con memoria unificada de 16 GB, habilitando prototipado local sin GPU dedicada.
- Evaluacion de calidad de cuantizaciones: sirve como referencia para comparar el comportamiento de la version 8 bits frente a bf16 en tareas de vision y codigo, como ya se hizo en la prueba de pose documentada.

## Benchmarks y rendimiento

Los datos disponibles corresponden al checkpoint original MiMo-V2.6-Distill-Qwen-9B, no a esta cuantizacion concreta. La model card advierte que se espera un efecto pequeno de la cuantizacion sobre las puntuaciones exactas.

| Benchmark | MiMo-V2.6-Distill-Qwen-9B | Qwen3.5-9B (base) |
|---|---|---|
| SWE-bench Verified (avg@3) | 61,1 | 60,0 |

Otras metricas del informe tecnico (MiMo Code, MiMo Visual Coding) son conjuntos de evaluacion internos de los autores y no forman parte de un leaderboard externo, por lo que no se presentan aqui como comparaciones independientes.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 10,4 GB en disco; en ejecucion, la cuantizacion de 8 bits esta pensada para maquinas con 16 GB de memoria unificada.
- Hardware objetivo: Apple Silicon con MLX (la model card menciona explicitamente equipos de 16 GB). No se documenta soporte para GPU NVIDIA en esta version.
- GPU de consumo: no aplica de forma directa, ya que el formato es MLX y la libreria es mlx-vlm; no se dispone de datos para RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: mlx-vlm (libreria oficial de este repositorio) y el servidor compatible con la API de Anthropic de Claude Code Local. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta version.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-9B-MLX-8bit (esta ficha) | 9,4B | no disponible | 61,1 (checkpoint original) | MIT | MLX 8 bits, Hugging Face |
| MiMo-V2.6-9B-MLX-bf16 | 9,4B | no disponible | 61,1 (checkpoint original) | MIT | MLX bf16, Hugging Face |
| Qwen3.5-9B (base) | 9B | no disponible | 60,0 | no disponible | Hugging Face |
| MiMo-V2.6-Distill-Qwen-9B (original) | 9,4B | no disponible | 61,1 | MIT | safetensors, Hugging Face |

## Limitaciones y advertencias

- La cuantizacion a 8 bits puede alterar ligeramente las puntuaciones exactas en benchmarks respecto al checkpoint original, aunque la prueba cualitativa de vision documentada no mostro diferencias frente a bf16.
- El modelo esta disenado para MLX y Apple Silicon; no se documenta su funcionamiento en CUDA, ROCm ni otras plataformas.
- No se dispone de informacion sobre sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad del modelo original ni de esta cuantizacion.
- La longitud de contexto y los idiomas soportados no estan documentados en la informacion disponible, lo que dificulta planificar despliegues con requisitos estrictos de ventana o cobertura linguistica.
- La licencia MIT permite uso comercial, pero el repositorio solo aporta la cuantizacion; la calidad y las posibles restricciones heredadas dependen del checkpoint original de Xiaomi, tambien MIT.
- Las cifras de benchmarks citadas provienen del informe tecnico del autor original y deben tratarse como tales; no se han verificado de forma independiente.
- Para produccion en hardware no Apple, seria necesario convertir los pesos a otro formato, algo que no se ha validado en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-8bit
- Version bf16: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-bf16
- Checkpoint original: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Organizacion Xiaomi MiMo: https://huggingface.co/XiaomiMiMo
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Libreria mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
- Perfil de GitHub del autor: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- SWE-bench: https://www.swebench.com/
