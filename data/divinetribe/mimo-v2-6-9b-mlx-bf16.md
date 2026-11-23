# divinetribe/MiMo-V2.6-9B-MLX-bf16

## Resumen

MiMo-V2.6-Distill-Qwen-9B es un modelo multimodal de 9.400 millones de parametros desarrollado por el equipo MiMo de Xiaomi. Se construye mediante ajuste fino supervisado (SFT) sobre la base Qwen3.5-9B de Alibaba, utilizando datos generados por MiMo que cubren programacion, tareas de agente generales, codigo visual y ciberseguridad. La arquitectura es `Qwen3_5ForConditionalGeneration`, que combina una torre de vision `qwen3_5_vision` con un decodificador de texto `qwen3_5_text`, lo que le permite procesar tanto imagenes como texto.

La ficha que nos ocupa, divinetribe/MiMo-V2.6-9B-MLX-bf16, no es el modelo original de Xiaomi, sino una conversion a formato MLX en precision completa bf16 realizada por el usuario divinetribe. El objetivo es ejecutar el modelo nativamente en Apple Silicon a traves de la libreria mlx-vlm, manteniendo intacta la torre de vision. No aplica cuantizacion: los 760 tensores conservan los pesos bf16 originales, con un total de 18,8 GB repartidos en cuatro shards.

Es relevante ahora porque ofrece una via practica para desplegar un agente de codigo multimodal en hardware de consumo Apple, sin depender de GPUs NVIDIA ni de servicios en la nube. El modelo base esta publicado bajo licencia MIT, lo que facilita su uso comercial y su integracion en herramientas de desarrollo local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (torre de vision qwen3_5_vision + decodificador de texto qwen3_5_text) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 sin cuantizar en este repo; el mismo autor publica variantes de 8 bits y 4 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, bf16, 760 tensores, cuatro shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer multimodal de tipo vision-language. La torre de vision `qwen3_5_vision` procesa las imagenes y alimenta al decodificador de texto `qwen3_5_text`, que genera la respuesta. El checkpoint original se obtiene por ajuste fino supervisado de Qwen3.5-9B sobre datos generados por el equipo MiMo, orientados a programacion, tareas de agente, codigo visual y ciberseguridad. La model card no detalla el volumen de tokens de entrenamiento ni la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO en esta etapa de destilacion.

La conversion a MLX bf16 es el unico trabajo realizado por divinetribe: se preservan todos los pesos en precision original y se mantiene la torre de vision funcional. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento general.
- Generacion y comprension de codigo, con enfasis en tareas de agente de programacion.
- Procesamiento de imagenes: descripcion de contenido visual, generacion de alt-text para productos e interfaces, y lectura de capturas de pantalla para reconstruir codigo.
- Razonamiento multimodal aplicado a control de calidad visual (por ejemplo, verificacion de poses humanas en imagenes).
- Soporte de tareas agenticas de multiples pasos, segun la orientacion del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de pensamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Agente de codigo local en Apple Silicon: el modelo puede ejecutarse mediante mlx-vlm en un Mac y utilizarse como motor de un agente que lee repositorios, interpreta errores y propone parches, gracias a su entrenamiento en tareas agenticas y su integracion con el proyecto Claude Code Local.
- Generacion de alt-text accesible: a partir de una imagen de producto o de interfaz, el modelo produce descripciones textuales utiles para accesibilidad y catalogos, manteniendo la torre de vision intacta en la conversion bf16.
- Lectura de capturas de pantalla a codigo: el modelo puede interpretar una captura de una interfaz y reconstruir el codigo correspondiente, lo que resulta util en tareas de reingenieria o documentacion de UI.
- Control de calidad visual automatizado: en entornos de captura de movimiento o videojuegos, el modelo puede analizar fotogramas y verificar si una pose dibujada es anatomicamente correcta, detectando extremidades extra o cruces incorrectos, como se muestra en el ejemplo de la model card.
- Asistencia en ciberseguridad: dado su entrenamiento en tareas de seguridad, puede emplearse para revisar fragmentos de codigo en busca de patrones inseguros o para explicar vulnerabilidades en un entorno local y controlado.
- Prototipado rapido de aplicaciones multimodales: desarrolladores que trabajan en Mac pueden cargar el modelo con mlx-vlm y probar flujos de imagen-texto sin infraestructura GPU dedicada, usando la variante bf16 para maxima calidad o las variantes de 8 y 4 bits para equipos con menos memoria.

## Benchmarks y rendimiento

| Benchmark | MiMo-V2.6-Distill-Qwen-9B | Qwen3.5-9B (base) |
|---|---|---|
| SWE-bench Verified (avg@3) | 61,1 | 60,0 |

Los datos provienen del informe tecnico de MiMo-V2.6 y de la model card del modelo base. Otras metricas mencionadas en dicho informe (MiMo Code, MiMo Visual Coding) son conjuntos de evaluacion internos de los autores y no constituyen leaderboards externos. No se han publicado resultados adicionales de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser pesos bf16 de 9,4B parametros, se requieren aproximadamente 18,8 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica, un equipo con 24 GB o mas de memoria unificada es el objetivo minimo razonable para la variante bf16.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente (por ejemplo, chips de la familia M con 24 GB o mas). No esta pensado para GPUs NVIDIA en este formato, ya que la conversion es especifica de MLX.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada adecuada; para maquinas de 16 GB existe la variante de 8 bits y para 8 GB la de 4 bits, publicadas por el mismo autor.
- Opciones de despliegue: mlx-vlm sobre Apple MLX; el ecosistema Claude Code Local ofrece un servidor compatible con la API de Anthropic para ejecucion en local. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B (esta conversion MLX bf16) | 9,4B | no disponible | 61,1 (avg@3) | MIT | Hugging Face, formato MLX |
| Qwen3.5-9B (base) | 9B | no disponible | 60,0 | no disponible en la informacion | Hugging Face |
| Variante 8 bits del mismo modelo (divinetribe) | 9,4B | no disponible | no disponible | MIT | Hugging Face, MLX 8 bits |
| Variante 4 bits del mismo modelo (divinetribe) | 9,4B | no disponible | no disponible | MIT | Hugging Face, MLX 4 bits |

La comparativa con alternativas de otros fabricantes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo puede cometer errores de percepcion visual: en el ejemplo de control de calidad de pose de la model card, situa los brazos en posicion baja en lugar de en guardia alta, lo que demuestra que la lectura visual no es perfecta.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de codigo o seguridad donde puede generar APIs o vulnerabilidades inexistentes.
- No se documentan los idiomas soportados ni el comportamiento multilingue, por lo que no se puede garantizar un rendimiento adecuado fuera del ingles sin evaluacion previa.
- La longitud de contexto no esta especificada en la informacion disponible, lo que impide planificar tareas que requieran ventanas largas.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base Qwen3.5-9B y de los datos de destilacion antes de un uso comercial a gran escala.
- Esta conversion esta pensada exclusivamente para MLX y Apple Silicon; no es directamente utilizable en entornos CUDA sin una conversion adicional.
- El repositorio tiene un numero muy bajo de descargas (557) y likes (1), por lo que la validacion comunitaria es limitada.
- No se dispone de informacion sobre sesgos conocidos ni sobre evaluaciones de seguridad del checkpoint destilado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-bf16
- Variante 8 bits: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-8bit
- Variante 4 bits: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-4bit
- Modelo base original: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Organizacion Xiaomi MiMo: https://huggingface.co/XiaomiMiMo
- Modelo Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Libreria mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- SWE-bench: https://www.swebench.com/
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
