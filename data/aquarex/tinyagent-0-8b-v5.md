# AquaRex/tinyagent-0.8b-v5

## Resumen

TinyAgent 0.8B (v5) es un ajuste fino completo de Qwen/Qwen3.5-0.8B desarrollado por AquaRex para dar vida al personal de IA de Tiny Agents, un juego de oficina pixel-art donde las sesiones de Claude Code aparecen como companeros de trabajo. El modelo no es un asistente general: esta especializado en generar respuestas JSON cortas para tres acciones concretas de los NPC (actuar, hablar y pensar), a partir de un prompt que describe la persona, necesidades, estado de animo, trabajo y entorno de cada trabajador.

La relevancia tecnica del modelo esta en su formato de despliegue: se distribuye como pesos MLC en cuantizacion `q4f16_1`, con el mismo layout que mlc-ai/Qwen3.5-0.8B-q4f16_1-MLC, lo que permite ejecutarlo integramente en el navegador del visitante mediante WebGPU y WebLLM, sin enviar datos a ningun servidor. El repositorio ocupa 0,4 GB y la descarga ronda los 430 MB, con cache en el navegador tras la primera visita.

Se trata de un modelo de 0,8 mil millones de parametros, con licencia Apache-2.0 y soporte unicamente de ingles, pensado para inferencia local en el cliente. Su interes radica en demostrar un caso de uso de IA generativa embebida en web para videojuegos, con un modelo pequeno y cuantizado que cabe en el navegador y responde con baja latencia en el contexto de una partida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; detalles de atencion no disponibles) |
| Parametros totales | 0,8 mil millones (aproximado, segun denominacion del modelo) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16_1 (MLC) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLC (pesos compilados para WebGPU/WebLLM), layout compatible con mlc-ai/Qwen3.5-0.8B-q4f16_1-MLC |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y se ha sometido a un ajuste fino completo (full fine-tune) sobre aproximadamente 22.000 ejemplos escritos y revisados por Claude. Estos ejemplos cubren decisiones, reacciones, turnos de conversacion y pensamientos, redactados en el formato de prompt exacto que utiliza el juego. No se especifica en la informacion disponible si hubo etapas de RLHF o DPO, ni el numero total de tokens de entrenamiento.

La innovacion principal no esta en la arquitectura, sino en el pipeline de despliegue: los pesos se publican en formato MLC con cuantizacion `q4f16_1` y el mismo layout que la version oficial de Qwen3.5-0.8B en MLC, de modo que el modelo puede ejecutarse con la libreria WebGPU precompilada de ese modelo base. Esto elimina la necesidad de compilar artefactos especificos y permite servir el modelo directamente en el navegador mediante WebLLM.

## Capacidades

- Generacion de texto breve en formato JSON estructurado, con tres tipos de salida: `Act` (elegir una opcion de accion y una frase corta), `Speak` (reaccionar, abrir chat o intervenir en una conversacion o reunion) y `Think` (un pensamiento privado de una linea que no se dice en voz alta).
- Interpretacion de contexto de personaje: persona, necesidades, estado de animo, trabajo y entorno del NPC.
- Respuestas orientadas a coherencia de personaje y tono dentro de un juego concreto.
- Ejecucion local en el navegador mediante WebGPU y WebLLM, sin llamadas a servidor.
- Soporte multilingue limitado al ingles.
- No se documenta soporte de tool calling generico, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- NPC conversacionales en videojuegos web: el modelo recibe el estado del personaje y devuelve una accion y una frase corta, lo que permite dotar de personalidad a decenas de trabajadores sin coste de servidor.
- Simulacion social de oficina: los NPC pueden reaccionar a lo que dice otro personaje, abrir conversaciones o participar en reuniones, generando interacciones emergentes entre agentes.
- Interioridad de personajes: la salida `Think` permite mostrar pensamientos privados en la ventana de informacion del trabajador, anadiendo profundidad narrativa sin que el personaje lo diga en voz alta.
- Demostraciones de IA en el navegador: sirve como ejemplo de inferencia local con WebGPU para charlas, prototipos o articulos tecnicos sobre modelos pequenos en el cliente.
- Prototipado de mecanicas de decision para NPC: la salida `Act` con opciones acotadas (comer, cafe, bano, irse enfermo) es un patron reutilizable para sistemas de utilidad o behavior trees asistidos por lenguaje.
- Juegos educativos o experiencias interactivas sin backend: al ejecutarse integramente en el cliente, encaja en entornos con requisitos de privacidad o sin infraestructura de servidor.
- Base para otros ajustes de personaje: al ser un fine-tune de Qwen3.5-0.8B con licencia Apache-2.0, puede servir de punto de partida para adaptar el mismo esquema JSON a otros juegos o dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional, ya que el modelo se ejecuta en el navegador sobre WebGPU; la descarga de pesos ronda los 430 MB y el repositorio ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU con soporte WebGPU (la informacion no detalla modelos concretos). El modelo base MLC Qwen3.5-0.8B-q4f16_1-MLC esta pensado para ejecutarse en GPUs de consumo a traves del navegador.
- Cabe en GPU de consumo: si, siempre que el navegador y la GPU soporten WebGPU; no se especifican requisitos minimos de memoria.
- Opciones de despliegue: WebLLM sobre WebGPU con la libreria MLC precompilada del modelo base; tambien puede desplegarse con el runtime de MLC-LLM en otros entornos, aunque la informacion no lo detalla.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| TinyAgent 0.8B v5 | ~0,8B | no disponible | en | Apache-2.0 | MLC q4f16_1 | NPC de juego en navegador |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible | Apache-2.0 | safetensors y MLC | Modelo base generalista |
| mlc-ai/Qwen3.5-0.8B-q4f16_1-MLC | ~0,8B | no disponible | no disponible | Apache-2.0 | MLC q4f16_1 | Version cuantizada oficial para WebLLM |

La comparativa se limita al ecosistema del modelo base; no se dispone de datos de benchmarks ni de otros modelos especializados en NPC con los que contrastar rendimiento.

## Limitaciones y advertencias

- El propio autor indica que el modelo esta ajustado para el formato de prompt y el tono de un unico juego, y que no es un asistente general.
- Soporte exclusivo de ingles; no se ha entrenado para castellano ni otros idiomas.
- Riesgo de alucinacion y de salidas fuera del esquema JSON esperado, especialmente ante prompts que se desvien del formato de entrenamiento.
- No se documentan sesgos especificos, pero al derivar de un modelo base generalista y entrenarse con ejemplos generados por Claude, puede heredar sesgos de ambos.
- Longitud de contexto no disponible; no debe asumirse una ventana amplia para conversaciones largas.
- Requiere un navegador y una GPU con soporte WebGPU; en entornos sin WebGPU no es desplegable tal cual.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no incluye garantias ni soporte; conviene validar el comportamiento en el juego concreto antes de produccion.
- El repositorio tiene pocas descargas (42) y ningun like en el momento de la consulta, lo que sugiere escasa validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AquaRex/tinyagent-0.8b-v5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Pesos MLC de referencia: https://huggingface.co/mlc-ai/Qwen3.5-0.8B-q4f16_1-MLC
- Juego Tiny Agents: https://tinyvoters.app/tinyagents/
- WebLLM: https://github.com/mlc-ai/web-llm
