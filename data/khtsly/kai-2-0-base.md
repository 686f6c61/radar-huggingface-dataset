# khtsly/Kai-2.0-Base

## Resumen

Kai 2.0 Base es un modelo de lenguaje de pesos abiertos especializado en generación de código Luau y Roblox, desarrollado por el usuario khtsly. Se trata del modelo de tamano medio de la familia LuauCoder 2.0, que incluye tambien Moana 2B y Nalu 0.3B. Con 643 millones de parametros totales (596M no de embedding) y 28 capas, es un decoder denso entrenado sobre 56.000 millones de tokens, lo que supone una relacion tokens/parametros de aproximadamente 87:1, bastante alta para su tamano y orientada a compensar la baja capacidad parametrica con un volumen de datos elevado.

El modelo se distribuye como base model sin plantilla de chat, por lo que no sigue instrucciones: continua texto a partir de un prompt, lo que en la practica significa que debe alimentarse con el inicio del codigo que se desea completar. Esta orientado a inferencia en dispositivo (tag `on-device`) y su ventana de contexto es de 4.096 tokens, suficiente para completar funciones o modulos de tamano medio pero no para repositorios completos.

Su relevancia reside en la especializacion vertical: frente a modelos generalistas del mismo rango, Kai 2.0 Base concentra su entrenamiento en un lenguaje de nicho (Luau, el dialecto de Lua usado en Roblox) con una licencia Apache 2.0 permisiva para uso comercial. La contrapartida es un alcance limitado: solo ingles, sin capacidades de instruccion, tool calling ni vision, y sin benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder denso tipo transformer (28 capas; 21 con RoPE + 7 sin posicion, NoPE) |
| Parametros totales | 642.552.248 (643M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (el repo solo distribuye safetensors en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

Otras especificaciones declaradas por el autor: dimension oculta 1408, dimension de feed-forward 3840, activacion SwiGLU, normalizacion RMSNorm con QK-Norm, 20 cabezas de query (10 computadas), 2 cabezas KV, 10 cabezas de salida, dimension de cabeza 128, vocabulario de 32.768 tokens con embeddings atados, logit soft cap de ±30, theta de RoPE 500.000, conexiones residuales por bloques (7 bloques de 4 capas), rank de postmix de cabeza 2 y 2 taps de convolucion depthwise mas 2 por cabeza. Tamano del repositorio: 1,3 GB.

## Arquitectura y entrenamiento

Kai 2.0 Base es un transformer decoder denso de 28 capas con una composicion de atencion mixta: 21 capas usan atencion con RoPE y 7 capas prescinden de codificacion posicional explicita (NoPE), un patron que en la literatura se asocia a mejor generalizacion posicional y extrapolacion. El autor declara un mecanismo de atencion compuesto por CCVHA, DiffAttn V2 y XSA, junto con convoluciones depthwise y por cabeza (2 taps cada una), postmix de cabeza de rank 2 y conexiones residuales agrupadas en 7 bloques de 4 capas. Emplea Grouped-Query Attention con 20 cabezas de query (de las que 10 se computan) y solo 2 cabezas KV, lo que reduce el coste de memoria del KV cache. La normalizacion combina RMSNorm con QK-Norm y la activacion es SwiGLU.

El entrenamiento se realizo sobre 56.000 millones de tokens, presumiblemente con predominio de codigo Luau y material relacionado con Roblox, aunque la model card no detalla la composicion exacta del dataset ni si hubo fases de RLHF o DPO; al ser un modelo base, es esperable que no las haya. Tampoco se documentan innovaciones de decodificacion especulativa ni atencion lineal. El uso requiere `trust_remote_code=True`, lo que implica que la implementacion de las capas personalizadas (DiffAttn, XSA, convoluciones) viaja en el repositorio y debe auditarse antes de desplegar en produccion.

## Capacidades

- Generacion y continuacion de codigo Luau: el modelo completa funciones, modulos y patrones idiomaticos de Luau a partir de un prefijo de codigo.
- Codigo orientado a Roblox: el entrenamiento esta focalizado en el ecosistema de scripts de Roblox, incluyendo APIs del motor.
- Generacion de texto en ingles: al ser un modelo de lenguaje, puede continuar texto generico, aunque su especializacion es el codigo.
- Modo base sin instrucciones: no dispone de plantilla de chat ni de alineacion por instrucciones; no soporta conversacion multi-turno ni seguimiento de ordenes directas.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma nativa.
- Multilingue: limitado a ingles; no se declara soporte de castellano ni de otros idiomas.
- Vision, audio y modo thinking: no disponibles.

## Casos de uso

- Autocompletado de scripts Luau en el editor: el modelo se integra como motor de continuacion de codigo alimentandolo con el prefijo del fichero abierto; su ventana de 4.096 tokens cubre funciones y modulos de tamano medio, y su naturaleza base encaja con el patron de FIM/continuacion sin necesidad de instrucciones.
- Generacion de plantillas de scripts para Roblox: a partir de un encabezado como `local function lerp(a, b, t)` el modelo produce la implementacion completa, util para generar scaffolding de sistemas de movimiento, inventario o UI en Luau.
- Asistente on-device para desarrolladores de Roblox: con 643M parametros en bfloat16 (aproximadamente 1,3 GB de pesos) puede ejecutarse en portatiles con GPU consumer modesta o incluso en CPU, lo que permite un asistente local sin enviar codigo a la nube.
- Generacion masiva de codigo de ejemplo para documentacion y tutoriales: el modelo puede producir fragmentos de Luau para guias tecnicas, con revision humana posterior dado el riesgo de alucinacion en APIs.
- Fine-tuning especifico de estudio: al ser un base model con licencia Apache 2.0, sirve como punto de partida para ajuste supervisado sobre un corpus propio de scripts de un juego concreto, anadiendo despues una plantilla de chat si se necesita uso conversacional.
- Prototipado rapido de mecanicas de juego: generacion de borradores de logica de gameplay (colisiones, temporizadores, eventos de red) que el desarrollador revisa y adapta, reduciendo el tiempo de arranque en proyectos pequenos.
- Experimentacion en investigacion sobre modelos de codigo de nicho: su combinacion de capas NoPE, atencion con convoluciones y GQA con 2 cabezas KV lo convierte en un banco de pruebas de bajo coste para estudiar arquitecturas alternativas en dominios de lenguaje especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,3 GB solo para pesos, mas KV cache y activaciones; en la practica cabe holgadamente en GPUs con 4-6 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,7 GB de pesos; en 4 bits, alrededor de 0,35 GB (estimaciones teoricas, no se distribuyen pesos cuantizados oficiales).
- GPU recomendadas: cualquier GPU consumer moderna con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes o entrenamiento, A100 o H100 aportan margen, aunque el modelo es demasiado pequeno para aprovecharlas.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos, y es viable en CPU para inferencia interactiva.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `attn_implementation="sdpa"` o `"flash_attention_2"`; el tag del autor menciona vLLM, llama.cpp, Ollama y LM Studio, pero al requerir codigo personalizado la compatibilidad con esos runners no esta verificada en la informacion disponible.
- Latencia y throughput: no disponibles; por tamano, se espera decodificacion interactiva en GPU consumer, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kai 2.0 Base | 643M | 4.096 | Luau / Roblox | Apache 2.0 | Hugging Face (khtsly/Kai-2.0-Base) |
| Moana 2B (misma familia) | 2B (declarado) | No disponible | Luau / Roblox | No disponible en la informacion | Hugging Face (familia LuauCoder 2.0) |
| Nalu 0.3B (misma familia) | 0,3B (declarado) | No disponible | Luau / Roblox | No disponible en la informacion | Hugging Face (familia LuauCoder 2.0) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos hermanos para establecer una comparacion cuantitativa con alternativas externas de codigo del mismo rango.

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones ni mantiene conversaciones; usarlo como asistente requiere prompting por continuacion o un fine-tuning posterior.
- Riesgo de alucinacion alto en APIs: al generar codigo de un ecosistema concreto (Roblox), puede inventar funciones o firmas inexistentes; toda salida debe validarse.
- Contexto limitado a 4.096 tokens: no admite repositorios completos ni conversaciones largas; el rendimiento decae en dependencias que excedan esa ventana.
- Solo ingles: no se declara soporte de castellano ni de otros idiomas, ni en codigo ni en comentarios.
- Requiere `trust_remote_code=True`: la implementacion personalizada de atencion y capas debe auditarse por seguridad y reproducibilidad antes de usarla en produccion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, lo que dificulta justificar su eleccion en un pipeline critico.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda conservar los avisos de atribucion y verificar que los datos de entrenamiento (no documentados) no impongan restricciones adicionales.
- Comunidad muy reducida: 0 descargas y 1 like en el momento de la consulta, sin ecosistema de herramientas ni soporte; la madurez del proyecto es baja.
- Sin cuantizaciones oficiales: el despliegue eficiente en CPU o en runners tipo llama.cpp/Ollama no esta garantizado sin conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khtsly/Kai-2.0-Base
- Listado de modelos del autor: https://huggingface.co/models?author=khtsly&sort=modified
