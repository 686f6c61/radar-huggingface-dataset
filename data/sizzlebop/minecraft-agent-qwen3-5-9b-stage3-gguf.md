# sizzlebop/Minecraft-Agent-Qwen3.5-9B-Stage3-GGUF

## Resumen

Minecraft Agent Qwen3.5-9B Stage 3 GGUF es la version cuantizada en formato GGUF de EmberJin/Minecraft-Agent-Qwen3.5-9B-Stage3, un agente visual-lenguaje (VLM) encarnado especializado en jugar a Minecraft directamente desde los pixeles en primera persona. El repositorio lo publica el usuario sizzlebop y su aportacion principal no es un nuevo entrenamiento, sino la conversion y cuantizacion de los pesos originales en safetensors a variantes k-quant de llama.cpp, ademas de un proyector multimodal independiente (mmproj) necesario para la entrada de imagen.

El modelo deriva de la familia Qwen3.5 (~8,95 mil millones de parametros) y combina un backbone de texto de 32 capas con atencion lineal DeltaNet y atencion completa, junto a una torre de vision ViT de 27 capas. Su funcion es convertir fotogramas de juego (ventana deslizante de hasta 29 fotogramas de historial mas el actual) en acciones estructuradas de texto que codifican movimientos de raton continuos, pulsaciones de teclas y clics.

Es relevante porque traslada un agente encarnado de investigacion a hardware de consumo: la cuantizacion Q4_K_M ocupa 5,24 GB y el proyector de vision 0,86 GB, lo que permite ejecutar el bucle completo de percepcion-accion en GPUs de gama media mediante llama.cpp, llama-server u Ollama, sin depender de infraestructura de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (`model_type`: `qwen3_5`); backbone de texto `qwen3_5_text` + torre de vision `qwen3_5_vision` |
| Parametros totales | 8.953.803.264 (~8,95 B, dato real de safetensors) |
| Parametros activos | No aplica (no se describe arquitectura MoE en la informacion disponible) |
| Longitud de contexto | Hasta 32.768 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (hereda la licencia upstream de Qwen/Qwen3.5-9B) |
| Formato de pesos | GGUF (texto y mmproj); los pesos de origen estan en safetensors en bfloat16 |
| Torre de vision | ViT de 27 capas, patch size 16, spatial merge size 2, hidden size 1152 |
| Precision nativa | bfloat16 |
| Espacio de acciones | Movimiento de raton continuo (dx, dy), teclas discretas y clics de raton en formato textual |
| Tamano del repositorio | 56,3 GB |
| Fecha de publicacion | 2026-09-10 (ultima actualizacion: 2026-09-10) |

## Arquitectura y entrenamiento

La arquitectura es un VLM de tipo conditional generation con dos componentes: `qwen3_5_text`, un transformer de 32 capas ocultas que combina DeltaNet (atencion lineal) con capas de atencion completa, y `qwen3_5_vision`, una torre ViT de 27 capas con patch size 16, spatial merge size 2 y tamano oculto 1152. El proyector multimodal se distribuye como archivo `mmproj` independiente en BF16 (0,86 GB) y es obligatorio para cualquier inferencia que reciba imagenes. La longitud de contexto soportada es de hasta 32.768 tokens, sin que la model card detalle tecnicas adicionales como decodificacion especulativa.

En cuanto a los datos, el agente se entreno sobre mas de 200.000 trayectorias de juego humano, equivalentes a 6 millones de fotogramas a 20 FPS y resolucion 640x360, con el objetivo de mapear pixeles crudos a acciones motoras. La model card no especifica el numero de tokens de texto, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles. Las cuantizaciones se generaron con llama.cpp partiendo de los pesos safetensors originales en BF16 y preservando esa precision como referencia.

## Capacidades

- Percepcion visual y control motor: consume capturas de pantalla en primera persona y produce acciones estructuradas en texto con el formato `Action: move(dx, dy) and press(keys...) [and click(button)]`.
- Movimiento continuo: emite desplazamientos de raton con componentes decimales (por ejemplo `move(0.5, -0.3)`) para controlar la orientacion de la camara.
- Acciones discretas: pulsaciones de teclas, incluidas combinaciones como `press(w, space)` para correr y saltar, y clics de boton (`click(left)`).
- Memoria a corto plazo por ventana deslizante: mantiene el impulso conductual usando hasta 29 fotogramas de historial mas el fotograma actual.
- Ejecucion de tareas encarnadas y de combate: la evaluacion del autor cubre tareas de tipo `mine_block` (153 tareas) y `kill_entity` (49 tareas).
- Conversacion multimodal multi-turno: la estructura de turnos alterna mensajes de usuario solo con imagen y respuestas del asistente con la accion predicha.
- Idiomas: el modelo esta etiquetado exclusivamente para ingles (`en`).
- No disponible: no se documenta soporte de tool calling o function calling generico, ni capacidades de audio, ni razonamiento multi-paso fuera del bucle de accion del juego, ni modo de pensamiento explicito.

## Casos de uso

- Automatizacion de recoleccion de recursos en Minecraft: el agente puede ejecutar de forma autonoma tareas de minado de bloques siguiendo una instruccion textual, usando el fotograma actual y el historial para corregir la trayectoria de la camara.
- Investigacion en agentes encarnados: sirve como linea base reproducible para estudiar mapeo pixel-a-accion, ya que el autor publica resultados en el benchmark `easy-ng` con y sin ventana de historial.
- Generacion de datos sinteticos de gameplay: al ejecutar politicas sobre el entorno, se pueden registrar trayectorias etiquetadas que alimenten posteriores entrenamientos o ajustes finos.
- Evaluacion comparativa de politicas VLM: con un despliegue local via llama-server se puede medir la tasa de exito por tarea en episodios de 200 pasos, comparando cuantizaciones Q4_K_M y Q8_0 para estudiar el impacto de la cuantizacion en la precision de las acciones.
- Prototipado de bucles de control en tiempo real: la cuantizacion Q4_K_M (5,24 GB) permite probar el ciclo percepcion-decision-accion en una GPU de consumo con latencia controlada por el propio desarrollador.
- Docencia y demostraciones de IA multimodal: sirve para ilustrar como un VLM puede cerrar el bucle sensor-motor en un entorno concreto sin necesidad de APIs externas ni conexion a internet.
- Pruebas de robustez visual: el modelo acepta fotogramas a 640x360, por lo que se puede evaluar su degradacion ante cambios de resolucion, iluminacion o interfaz, siempre dentro del dominio de pixeles crudos.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden al benchmark `easy-ng` del autor: 202 tareas no relacionadas con GUI (153 encarnadas de tipo `mine_block` y 49 de combate de tipo `kill_entity`), 3 ejecuciones por tarea, dificultad facil y episodios de 200 pasos. La tabla siguiente reproduce los datos de la model card.

| Ventana de historial en inferencia | Tasa de exito global | Tareas encarnadas | Tareas de combate |
|---|---|---|---|
| 3 fotogramas (linea base) | 15,0 % | 17,9 % | 6,2 % |
| 29 fotogramas (coincide con entrenamiento) | 24,9 % | 24,8 % | 25,2 % |

No se han publicado en la informacion disponible resultados de benchmarks estandar de lenguaje o codigo (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada segun el peso del archivo (el proyector `mmproj` anade 0,86 GB en todos los casos): Q2_K 3,56 GB; Q3_K_M 4,31 GB; Q4_K_M 5,24 GB; Q5_K_M 6,02 GB; Q6_K 6,85 GB; Q8_0 8,87 GB; BF16 16,69 GB.
- A estas cifras hay que sumar el cache KV y los buffers de contexto; no se proporcionan mediciones concretas, por lo que deben considerarse estimaciones basadas en el tamano de los archivos.
- GPUs recomendadas para BF16 (16,69 GB mas mmproj): A100 40/80 GB, H100, RTX 3090 o RTX 4090 de 24 GB. Tambien es viable el offload parcial a CPU con llama.cpp.
- GPUs recomendadas para Q8_0 (8,87 GB mas mmproj): RTX 4080/4090, L4, A10G o cualquier GPU con 12-16 GB o mas de VRAM.
- GPUs de consumo para Q4_K_M (5,24 GB mas mmproj): RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. La cuantizacion Q4_K_M es la recomendada por el autor como opcion por defecto para ejecuciones de agente.
- GPUs de consumo para Q3_K_M y Q2_K: equipos con 6-8 GB de VRAM, con la advertencia de perdida de precision en la prediccion de acciones.
- Opciones de despliegue documentadas: `llama-qwen2vl-cli` para inferencia multimodal puntual, `llama-cli` para pruebas solo texto y verificacion de sintaxis de acciones, `llama-server` como servidor multimodal compatible con la API de OpenAI, y Ollama mediante un `Modelfile` con `MMPROJ`. La model card no documenta soporte para vLLM ni TGI con estos pesos GGUF.
- Parametros de generacion sugeridos por el autor en Ollama: `temperature 0.2`, `top_p 0.9`, con paradas en `<|im_end|>` y `<|endoftext|>`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoria (agentes encarnados para Minecraft o VLM de ~9B orientados a control motor), por lo que no es posible establecer una comparacion con cifras verificables.

| Modelo | Parametros | Contexto | Rendimiento en easy-ng | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minecraft Agent Qwen3.5-9B Stage 3 (GGUF) | ~8,95 B | 32.768 tokens | 24,9 % global con ventana de 29 fotogramas | Apache 2.0 | GGUF en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance restringido a control pixel-a-motor: las tareas con interfaz grafica como mesas de fabricacion, fundicion en horno u ordenacion de cofres quedan explicitamente fuera de alcance, porque el modelo carece de anclaje de coordenadas sobre GUIs de inventario.
- Dependencia de la ventana de historial: sin un historial de hasta 29 fotogramas el rendimiento cae de forma notable (15,0 % frente a 24,9 % de exito global en `easy-ng`), por lo que desplegarlo con ventanas cortas degrada la conducta.
- Tasa de exito limitada: incluso en configuracion optima, la tasa de exito global es del 24,9 % en tareas de dificultad facil, lo que no es suficiente para operaciones autonomas prolongadas sin supervision.
- Riesgo de alucinacion: no se documenta ningun mecanismo de verificacion de acciones, de modo que el modelo puede emitir comandos sintacticamente validos pero fisicamente inutiles o contraproducentes en el entorno.
- Idioma: solo se declara soporte de ingles (`en`); las instrucciones en castellano no estan cubiertas por la model card.
- Sesgos conocidos: no se documenta ninguna evaluacion de sesgos ni de comportamiento fuera de distribucion en la informacion disponible.
- Procedencia: este repositorio es una cuantizacion de terceros (sizzlebop) de los pesos de EmberJin; la responsabilidad sobre el entrenamiento y sus resultados recae en el modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo hereda la licencia upstream de Qwen/Qwen3.5-9B, cuyos terminos deben verificarse por separado.
- Advertencia de integracion: para produccion conviene fijar la version del archivo GGUF y del `mmproj`, ya que ambos deben ser compatibles entre si.
- Fechas de publicacion y actualizacion del repositorio (2026-09-10) aparecen en el futuro respecto a la informacion de referencia disponible; conviene verificar la vigencia de los archivos antes de desplegarlos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sizzlebop/Minecraft-Agent-Qwen3.5-9B-Stage3-GGUF
- Modelo base: https://huggingface.co/EmberJin/Minecraft-Agent-Qwen3.5-9B-Stage3
- Modelo upstream de la familia Qwen3.5: https://huggingface.co/Qwen/Qwen3.5-9B
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente paginas corporativas de Microsoft sin relacion con este repositorio.
