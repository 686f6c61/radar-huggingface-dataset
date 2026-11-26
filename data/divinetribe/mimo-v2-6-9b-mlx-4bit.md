# divinetribe/MiMo-V2.6-9B-MLX-4bit

## Resumen

MiMo-V2.6-9B-MLX-4bit es una cuantizacion de 4 bits en formato MLX del checkpoint XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario divinetribe. El modelo original lo desarrolla el equipo MiMo de Xiaomi mediante ajuste supervisado (SFT) sobre Qwen3.5-9B, con datos generados por MiMo que cubren codigo, tareas de agente generales, codificacion visual y ciberseguridad. Esta version mantiene intacta la torre de vision, de modo que procesa imagenes y genera codigo de forma nativa en Apple Silicon.

Tecnicamente es un modelo condicional de 9.409.813.744 parametros (9,4B) con arquitectura Qwen3_5ForConditionalGeneration: una torre qwen3_5_vision que alimenta un decodificador qwen3_5_text. La cuantizacion emplea precision mixta con 5,059 bits por peso de media, tamano de grupo 64 y un peso total de 5,6 GB (repo de 6,0 GB), pensado para equipos con 8 GB de memoria unificada.

Su relevancia practica es doble: por un lado ofrece un pipeline image-text-to-text completo en un unico paquete de bajo peso para Mac; por otro, el checkpoint base obtuvo 61,1 (avg@3) en SWE-bench Verified segun el informe tecnico de MiMo-V2.6, lo que lo situa como candidato realista para agentes de codigo locales. La licencia MIT facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (torre de vision qwen3_5_vision + decodificador qwen3_5_text, transformer multimodal) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MLX con precision mixta (5,059 bits/peso de media, group size 64); existen builds bf16 y 8 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), libreria mlx-vlm |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal denso de la familia Qwen3.5. La parte de vision (qwen3_5_vision) procesa imagenes y las proyecta al decodificador de texto (qwen3_5_text), que genera la respuesta. El checkpoint original se construye por ajuste supervisado de Qwen3.5-9B sobre datos generados por el equipo MiMo, orientados a codigo, tareas de agente, codificacion visual y ciberseguridad. El informe tecnico citado, "MiMo-V2.6: Scaling Reinforcement Learning Towards Self-Improvement", indica que el pipeline de MiMo escala aprendizaje por refuerzo hacia la auto-mejora, aunque la ficha no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset.

La unica aportacion de este repositorio es la cuantizacion a 4 bits en MLX, con capas sensibles mantenidas a mayor precision para preservar calidad. El autor declara haber validado la ruta de vision con una prueba de lectura de pose antes de publicar, y que el comportamiento observado (por ejemplo, colocar los brazos abajo en lugar de en guardia) es un rasgo del modelo base, no un artefacto de la cuantizacion.

## Capacidades

- Generacion de texto y razonamiento general sobre el decodificador Qwen3.5.
- Generacion de codigo y resolucion de tareas de ingenieria de software (el checkpoint base se evalua en SWE-bench Verified).
- Comprension de imagenes: descripcion de escenas, lectura de figuras y QC visual (el ejemplo documentado analiza una silueta superpuesta sobre una camara en directo).
- Generacion de alt-text para imagenes de producto e interfaz.
- Lectura de capturas de pantalla y conversion a codigo.
- Capacidades de agente y tareas de multiples pasos (etiquetas agentic y code en el repo).
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponible.
- Modo thinking o razonamiento extendido: no disponible.
- Entrada de audio: no soportada.

## Casos de uso

- Agente de codigo local en Mac: el modelo puede integrarse en un flujo tipo Claude Code Local (el autor lo presenta como uno de los "fighters" del proyecto) para leer issues, proponer parches y ejecutar tareas de varios pasos, apoyandose en el rendimiento del checkpoint base en SWE-bench Verified.
- Control de calidad visual en juegos de movimiento: tal como documenta el autor, se le puede enviar un fotograma con una silueta superpuesta y pedirle que verifique el numero de extremidades y la plausibilidad anatomica de la pose. Es adecuado porque conserva la torre de vision incluso a 4 bits.
- Generacion de alt-text accesible: procesar catalogos de productos o capturas de interfaz y producir descripciones textuales para lectores de pantalla, aprovechando la ruta image-text-to-text.
- Conversion de capturas a codigo: a partir de una screenshot de una UI, reconstruir el marcado o el componente correspondiente, util en prototipado rapido.
- Asistencia de desarrollo en portatiles de 8 GB: al ocupar 5,6 GB en disco y caber en memoria unificada de 8 GB, permite tener un asistente de codigo y vision funcionando sin GPU dedicada ni conexion a la nube.
- Revision de seguridad de codigo: el checkpoint base se entreno con datos de ciberseguridad, por lo que puede emplearse para revisar fragmentos sospechosos o explicar patrones de riesgo en un pipeline de pre-commit.
- Prototipado de agentes multimodales: usar la API de mlx-vlm para encadenar lectura de imagen, razonamiento y generacion de codigo en una misma sesion, con `num_images=0` para turnos solo de texto.

## Benchmarks y rendimiento

| Benchmark | Modelo | Resultado |
|---|---|---|
| SWE-bench Verified (avg@3) | MiMo-V2.6-Distill-Qwen-9B (SFT) | 61,1 |
| SWE-bench Verified (avg@3) | Qwen3.5-9B (base) | 60,0 |

Los datos proceden del informe tecnico de MiMo-V2.6 citado en la model card. Otras metricas del informe (MiMo Code, MiMo Visual Coding) son conjuntos de evaluacion internos de los autores y no leaderboards externos. No se han publicado resultados especificos de esta cuantizacion de 4 bits; el autor advierte que la cuantizacion puede mover ligeramente las cifras.

## Requisitos de hardware

- VRAM/memoria estimada: 5,6 GB de pesos en 4 bits; con overhead de ejecucion, encaja en equipos de 8 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (MLX). No esta pensado para GPU NVIDIA.
- Cabe en consumer hardware: si, en Mac con 8 GB o mas de memoria unificada; el autor indica explicitamente que este build es "for 8 GB machines".
- Alternativas de calidad: los builds bf16 (calidad completa) y 8 bits requieren mas memoria.
- Despliegue: libreria mlx-vlm (load, generate, apply_chat_template). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-9B-MLX-4bit (este) | 9,4B | no disponible | MLX safetensors 4 bits | MIT | Vision + codigo, optimizado para Apple Silicon, 5,6 GB |
| MiMo-V2.6-9B-MLX-8bit | 9,4B | no disponible | MLX safetensors 8 bits | MIT | Mismo modelo, mayor calidad y tamano |
| MiMo-V2.6-9B-MLX-bf16 | 9,4B | no disponible | MLX safetensors bf16 | MIT | Calidad completa, mayor requisito de memoria |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | 9,4B | no disponible | safetensors | MIT | Checkpoint original sin cuantizar |

No se dispone de datos de modelos de otros fabricantes comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar ligeramente la precision respecto al bf16; el autor lo reconoce y no publica mediciones comparativas.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de vision con oclusiones o superposiciones ambiguas (el propio ejemplo del autor senala que la alineacion exacta de articulaciones resulta ambigua).
- El modelo tiende a interpretar poses con los brazos abajo en lugar de en guardia; es un sesgo del checkpoint base, no de la cuantizacion.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones o repositorios muy largos.
- Idiomas soportados no documentados; no hay garantia de calidad fuera del ingles y el chino.
- Soporte de tool calling no confirmado explicitamente.
- Dependencia de MLX y Apple Silicon: no es desplegable en GPU NVIDIA con las herramientas habituales.
- La model card incluye estadisticas promocionales (estrellas de GitHub, descargas) y enlaces a un proyecto externo; conviene tratarlas como material de marketing y no como validacion tecnica.
- Licencia MIT: permite uso comercial, pero se recomienda revisar las condiciones del checkpoint base y de Qwen3.5-9B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-4bit
- Checkpoint base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Organizacion Xiaomi MiMo: https://huggingface.co/XiaomiMiMo
- Modelo Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Version bf16: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-bf16
- Version 8 bits: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-8bit
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- SWE-bench: https://www.swebench.com/
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
