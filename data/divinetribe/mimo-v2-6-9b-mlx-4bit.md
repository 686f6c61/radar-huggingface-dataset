# divinetribe/MiMo-V2.6-9B-MLX-4bit

## Resumen

MiMo-V2.6-9B-MLX-4bit es una cuantizacion en 4 bits para MLX del checkpoint XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicado por el usuario divinetribe. El modelo original lo desarrolla el equipo MiMo de Xiaomi mediante ajuste supervisado (SFT) sobre Qwen3.5-9B de Alibaba, con datos generados por MiMo que cubren codigo, tareas de agente, codificacion visual y ciberseguridad. Esta version concreta es unicamente un reempaquetado de pesos: el trabajo de cuantizacion es lo unico aportado por el autor del repo.

La arquitectura es Qwen3_5ForConditionalGeneration, un modelo multimodal compuesto por una torre de vision qwen3_5_vision que alimenta un decodificador de texto qwen3_5_text, con 9.409.813.744 parametros totales. La cuantizacion emplea precision mixta con 5,059 bits por peso de media (las capas sensibles se mantienen a mayor precision), tamano de grupo 64 y un peso en disco de 5,6 GB (repo de 6,0 GB). La torre de vision se conserva intacta, de modo que el modelo sigue leyendo imagenes ademas de generar codigo.

Su relevancia practica es doble: por un lado ofrece capacidades agenticas y de codigo cercanas a las del checkpoint original en un tamano manejable; por otro, es una de las pocas builds de este modelo que corre de forma nativa en Apple Silicon mediante mlx-vlm, apuntando explicitamente a equipos con 8 GB de memoria unificada. El modelo esta publicado bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (torre de vision qwen3_5_vision + decodificador de texto qwen3_5_text) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MLX con precision mixta (5,059 bits por peso de media, group size 64); existen builds bf16 y 8 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), libreria mlx-vlm |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3.5. La torre de vision qwen3_5_vision procesa las imagenes y alimenta al decodificador de texto qwen3_5_text, lo que permite tareas image-text-to-text ademas de generacion de texto puro. El checkpoint original se obtuvo por ajuste supervisado de Qwen3.5-9B sobre datos generados por el equipo MiMo, orientados a codigo, tareas de agente, codificacion visual y ciberseguridad; la model card no detalla el volumen de tokens ni la composicion exacta del dataset, ni menciona fases de RLHF o DPO para este checkpoint de destilacion.

La innovacion tecnica de este repo es la cuantizacion: se aplica precision mixta manteniendo las capas sensibles a mayor numero de bits, con un resultado de 5,059 bits por peso de media y group size 64, y se preserva la torre de vision sin cuantizar de forma agresiva. Segun el autor, la build 4 bits supero la misma prueba de lectura de pose que las builds bf16 y 8 bits antes de publicarse, lo que sugiere que la cuantizacion no degrada la percepcion visual basica. No se documentan tecnicas como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento general, heredados del decodificador Qwen3.5-9B.
- Generacion de codigo y resolucion de tareas de ingenieria de software, con enfasis en flujos agenticos.
- Comprension de imagenes: descripcion de contenido visual, lectura de capturas de pantalla y conversion de estas a codigo.
- Generacion de texto alternativo (alt-text) para imagenes de producto e interfaces de usuario.
- Verificacion visual estructurada, como control de calidad de poses en imagenes (conteo de extremidades, plausibilidad anatomica).
- Capacidades agenticas y de razonamiento multi-paso, segun la orientacion del entrenamiento del modelo base.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito, vision, audio: solo vision confirmada; el resto no disponible.

## Casos de uso

- Agente de codigo en local sobre Apple Silicon: el modelo puede integrarse en un flujo tipo Claude Code Local (proyecto del mismo autor) para resolver issues de repositorios, ya que su checkpoint de origen puntua 61,1 en SWE-bench Verified y cabe en 5,6 GB.
- Asistente de programacion en equipos de 8 GB: al ser la build mas pequena del modelo, permite autocompletado, explicacion de codigo y generacion de parches en portatiles Mac con memoria unificada limitada.
- Conversion de capturas de pantalla a codigo: la torre de vision intacta permite leer una UI en imagen y generar el marcado o los componentes correspondientes, util en tareas de prototipado rapido.
- Generacion de alt-text a escala: procesamiento por lotes de catalogos de producto o capturas de interfaz para producir descripciones accesibles, aprovechando la ruta de vision del modelo.
- Control de calidad visual automatizado: verificacion de figuras, poses o superposiciones en imagenes (por ejemplo, frames de juegos de movimiento) para detectar errores de renderizado o de seguimiento.
- Analisis de seguridad en codigo: el entrenamiento del modelo base incluye ciberseguridad, por lo que puede emplearse para revisar fragmentos de codigo y senalar patrones de riesgo en un pipeline de revision local.
- Prototipado de asistentes multimodales sin conexion: despliegue en local para demos de conversacion image-text-to-text sin depender de APIs externas.

## Benchmarks y rendimiento

| Benchmark | MiMo-V2.6-Distill-Qwen-9B (SFT) | Qwen3.5-9B (base) |
|---|---|---|
| SWE-bench Verified (avg@3) | 61,1 | 60,0 |

Los datos proceden del informe tecnico de MiMo-V2.6 citado en la model card. Las cifras corresponden al checkpoint original, no a esta cuantizacion de 4 bits; el autor advierte que la cuantizacion puede mover ligeramente los resultados. El resto de metricas del informe (MiMo Code, MiMo Visual Coding) son conjuntos de evaluacion internos de los autores y no cifras de leaderboards externos. No se han publicado resultados de benchmarks especificos para esta build de 4 bits en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 5,6 GB de pesos en disco; en Apple Silicon la memoria unificada debe acomodar los pesos mas el estado de activaciones y cache, por lo que 8 GB es el minimo indicado por el autor.
- GPU recomendadas: el formato MLX esta pensado para Apple Silicon (series M1, M2, M3, M4); no se indica soporte para GPU NVIDIA o AMD en esta build.
- Cabe en consumer GPU: si, en Mac con memoria unificada de 8 GB o superior; en GPU dedicadas no se documenta soporte para este formato.
- Opciones de despliegue: mlx-vlm (libreria oficial de esta build) sobre Apple MLX. No se mencionan vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Formato |
|---|---|---|---|---|---|
| MiMo-V2.6-9B-MLX-4bit (esta ficha) | 9,4B | no disponible | 61,1 (checkpoint origen) | MIT | safetensors MLX 4 bits |
| MiMo-V2.6-9B-MLX-8bit | 9,4B | no disponible | no disponible | MIT | safetensors MLX 8 bits |
| MiMo-V2.6-9B-MLX-bf16 | 9,4B | no disponible | no disponible | MIT | safetensors MLX bf16 |
| Qwen3.5-9B (base) | 9B | no disponible | 60,0 | no disponible | no disponible |

Las tres builds MLX del mismo modelo permiten elegir entre calidad (bf16), equilibrio (8 bits) y tamano minimo (4 bits). Frente a la base Qwen3.5-9B, el ajuste de MiMo aporta una mejora de 1,1 puntos en SWE-bench Verified segun el informe de los autores.

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce perdida de precision; el autor reconoce que las puntuaciones exactas pueden variar respecto al checkpoint original.
- La model card senala un rasgo del modelo, no de la cuantizacion: coloca los brazos en posicion baja en lugar de en guardia al interpretar poses, lo que indica sesgos de percepcion visual en ciertos dominios.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones especificas de factualidad.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingue fuera del ingles sin evaluacion previa.
- Longitud de contexto no disponible: no es posible planificar cargas con ventanas largas sin verificacion empirica.
- Soporte de tool calling no confirmado explicitamente en la informacion disponible, pese a la orientacion agentica del modelo base.
- El formato MLX limita el despliegue a Apple Silicon; no hay pesos GGUF ni soporte documentado para CUDA en este repo.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el modelo; la responsabilidad de validacion en produccion recae en el integrador.
- El repo incluye enlaces promocionales a un proyecto externo (Claude Code Local) con estadisticas de estrellas y descargas; conviene tratarlos como material de marketing y no como evidencia tecnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-4bit
- Checkpoint original: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Organizacion Xiaomi MiMo: https://huggingface.co/XiaomiMiMo
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Build bf16: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-bf16
- Build 8 bits: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-8bit
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- SWE-bench: https://www.swebench.com/
