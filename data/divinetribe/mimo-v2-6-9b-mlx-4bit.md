# divinetribe/MiMo-V2.6-9B-MLX-4bit

## Resumen

MiMo-V2.6-9B-MLX-4bit es una cuantizacion en 4 bits para MLX del checkpoint MiMo-V2.6-Distill-Qwen-9B, desarrollado por el equipo MiMo de Xiaomi. El modelo original se construye mediante ajuste supervisado (SFT) de Qwen3.5-9B sobre datos generados por MiMo que cubren codigo, tareas de agente generales, codificacion visual y ciberseguridad. Esta version concreta, publicada por el usuario divinetribe, mantiene intacta la torre de vision para que el modelo pueda tanto leer imagenes como escribir codigo de forma nativa en Apple Silicon.

La arquitectura es `Qwen3_5ForConditionalGeneration`, compuesta por una torre de vision `qwen3_5_vision` que alimenta un decodificador de texto `qwen3_5_text`. El modelo cuenta con 9.409.813.744 parametros totales (aproximadamente 9,4B) y se distribuye en un repositorio de 6,0 GB con pesos en safetensors cuantizados a 4 bits con grupo de tamano 64 y precision mixta (5,059 bits por peso de media). Esta pensado para equipos con 8 GB de memoria unificada, siendo la variante mas pequena de la familia (existen builds bf16 y 8-bit).

Su relevancia actual radica en que combina capacidades agenticas y de codigo con vision en un tamano que cabe en portatiles Apple Silicon, algo poco habitual en modelos de esta categoria. El checkpoint fuente obtiene 61,1 en SWE-bench Verified (avg@3), por delante de su base Qwen3.5-9B (60,0), lo que lo posiciona como una opcion competitiva para agentes de codigo locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (torre de vision `qwen3_5_vision` + decodificador de texto `qwen3_5_text`) |
| Parametros totales | 9.409.813.744 (aproximadamente 9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX con grupo de tamano 64 y precision mixta (5,059 bits por peso de media); existen variantes bf16 y 8-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, cuantizado a 4 bits) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de tipo vision-language. La torre de vision `qwen3_5_vision` procesa imagenes y las proyecta al decodificador de texto `qwen3_5_text`, que genera la respuesta. El checkpoint fuente MiMo-V2.6-Distill-Qwen-9B se construye mediante ajuste supervisado (SFT) de Qwen3.5-9B sobre datos generados por el propio equipo MiMo, cubriendo cuatro dominios: codigo, tareas de agente generales, codificacion visual y ciberseguridad. No se especifica en la informacion disponible el numero de tokens de entrenamiento ni la composicion detallada del dataset.

La innovacion tecnica de esta publicacion concreta es la cuantizacion a 4 bits con precision mixta: las capas sensibles se mantienen a mayor precision, logrando una media de 5,059 bits por peso. La torre de vision se conserva intacta, de modo que el modelo mantiene sus capacidades visuales tras la compresion. El autor indica que el build de 4 bits paso la misma prueba de lectura de pose que las variantes bf16 y 8-bit antes de publicarse. No se mencionan tecnicas como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento general.
- Generacion y comprension de codigo, con enfasis en tareas de agente de software.
- Capacidades agenticas y de razonamiento multi-paso (etiqueta `agentic` en el modelo).
- Vision multimodal: lectura de imagenes, alt-text para productos e interfaces, lectura de capturas de pantalla para reconstruir codigo.
- Codificacion visual (visual coding): interpretar figuras, diagramas y capturas para generar codigo.
- Capacidades de ciberseguridad, segun los datos de entrenamiento del checkpoint fuente.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Agentes de codigo locales en Apple Silicon: el modelo puede integrarse en un servidor local compatible con la API de Anthropic (como Claude Code Local) para resolver issues de repositorios reales, dado su rendimiento de 61,1 en SWE-bench Verified en el checkpoint fuente.
- Generacion de codigo en produccion sobre portatiles: con 9,4B parametros y 5,6 GB en 4 bits, cabe en maquinas de 8 GB y permite autocompletado, refactorizacion y generacion de tests sin conexion.
- Control de calidad visual (pose-match QC): tal como demuestra el ejemplo del autor, puede verificar si una figura dibujada corresponde a una pose humana correcta, detectando extremidades extra o faltantes en frames de videojuegos de movimiento.
- Generacion de alt-text para imagenes de producto e interfaz: el modelo describe imagenes y elementos de UI, util para accesibilidad y catalogos.
- Lectura de capturas de pantalla a codigo: reconstruir componentes de interfaz a partir de imagenes, util en flujos de diseno a codigo.
- Analisis de seguridad y ciberseguridad: revision de codigo y deteccion de patrones de riesgo, aprovechando el entrenamiento del checkpoint fuente en este dominio.
- Asistencia en tareas agenticas multi-paso: planificacion y ejecucion de tareas que combinan lectura de imagenes y generacion de codigo en un mismo flujo.

## Benchmarks y rendimiento

| Benchmark | MiMo-V2.6-Distill-Qwen-9B (SFT) | Qwen3.5-9B (base) |
|---|---|---|
| SWE-bench Verified (avg@3) | 61,1 | 60,0 |

Los datos corresponden al checkpoint fuente segun el informe tecnico de MiMo-V2.6. El autor advierte que la cuantizacion a 4 bits puede mover ligeramente las puntuaciones. Otras metricas del informe (MiMo Code, MiMo Visual Coding) son conjuntos de evaluacion internos de los autores y no forman parte de leaderboards externos. No se han publicado resultados de benchmarks especificos para esta version cuantizada en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 5,6 GB para los pesos en 4 bits, mas overhead de contexto y activaciones; el autor lo situa para maquinas de 8 GB.
- GPU recomendadas: Apple Silicon con memoria unificada (MLX). No esta pensado para GPUs NVIDIA/AMD en este formato.
- Cabe en consumer hardware: si, en Mac con 8 GB o mas de memoria unificada.
- Opciones de despliegue: `mlx-vlm` (libreria oficial de este build); el autor lo integra en Claude Code Local mediante un servidor MLX nativo compatible con la API de Anthropic.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-9B-MLX-4bit (este) | 9,4B | no disponible | 61,1 (checkpoint fuente) | MIT | MLX 4-bit |
| MiMo-V2.6-Distill-Qwen-9B (bf16, MLX) | 9,4B | no disponible | 61,1 (checkpoint fuente) | MIT | MLX bf16 |
| MiMo-V2.6-Distill-Qwen-9B (8-bit, MLX) | 9,4B | no disponible | 61,1 (checkpoint fuente) | MIT | MLX 8-bit |
| Qwen3.5-9B (base) | 9B | no disponible | 60,0 | no disponible | pesos originales |

Las tres variantes MLX comparten el mismo checkpoint fuente y difieren solo en precision y tamano. El modelo base Qwen3.5-9B es la referencia directa por rendimiento en codigo agentico.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar ligeramente la precision respecto a bf16; el autor recomienda bf16 para maxima calidad y 8-bit como punto intermedio.
- El autor observa un rasgo del modelo (no de la cuantizacion): tiende a colocar los brazos bajos en lugar de en guardia al interpretar poses, lo que puede afectar a tareas de analisis de pose.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas especificas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles; no se especifica la ventana de contexto ni los idiomas soportados.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del checkpoint fuente y de Qwen3.5-9B.
- Este build esta disenado exclusivamente para MLX en Apple Silicon; no es portable directamente a otros runtimes sin reconversion.
- El modelo tiene pocas descargas (41) y ninguna valoracion en el momento de la consulta, por lo que la validacion comunitaria es limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-4bit
- Checkpoint fuente: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Organizacion Xiaomi MiMo: https://huggingface.co/XiaomiMiMo
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante bf16: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-bf16
- Variante 8-bit: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-8bit
- Libreria mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- SWE-bench: https://www.swebench.com/
