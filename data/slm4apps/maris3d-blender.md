# slm4apps/Maris3D-Blender

## Resumen

Maris3D-SLM-Blender es un modelo de lenguaje pequeno (SLM) de 0,5B parametros afinado a partir de Qwen2.5-Coder-0.5B-Instruct por el proyecto slm4apps. Su proposito no es la generacion de texto libre, sino emitir de forma nativa llamadas a herramientas (tool calls) del formato de Qwen para construir y editar escenas 3D en Blender. Resuelve un problema muy concreto: traducir instrucciones en lenguaje natural a operaciones sobre un conjunto fijo de 26 herramientas de Blender, ejecutandose de forma totalmente offline en hardware modesto.

El modelo se distribuye en formato GGUF cuantizado (q8_0 de 506 MB como base, con adaptadores LoRA de 5,6 MB para edicion y planificacion) y esta pensado para integrarse mediante llama.cpp, Ollama o LM Studio en el complemento Maris3D Copilot de Blender 4.2+. Su relevancia actual radica en demostrar que un modelo de menos de 3 millones de parametros reales en safetensors puede ofrecer latencias de decenas de milisegundos (hasta 141,5 tok/s en una GPU de 4 GB de 2015) manteniendo un consumo de memoria de 0,58 GB.

La version publicada es una preview v0.1 con licencia Apache-2.0 y entrenamiento sin comportamiento de rechazo (uncensored), orientada a arte 3D y prototipado rapido de escenas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen2.5-Coder-0.5B-Instruct) |
| Parametros totales | 2.932.736 (safetensors); modelo base de 0,5B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | entrenado con filas de hasta 2.048 tokens; recomendado servir con 8.192 |
| Tipos de cuantizacion | q8_0 (506 MB), q4_k_m (25% mas pequeno, con perdida de calidad), adaptadores LoRA f16 (5,6 MB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (base, variantes cuantizadas y adaptadores LoRA); safetensors en el repo |
| Tamano del repo | 1,5 GB |
| Herramientas soportadas | 26 tool calls de Blender en formato Qwen `{"name": ..., "arguments": ...}` |
| Temperatura recomendada | 0 (con repeat penalty 1.0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-0.5B-Instruct, un transformer decoder-only denso, y se afina especificamente para el dominio de Blender. El entrenamiento se orienta a un conjunto fijo de 26 herramientas de Blender, de modo que el modelo no genera texto descriptivo sino llamadas estructuradas en el formato JSON de tool calling de Qwen. La model card indica que el fine-tune elimina por completo el comportamiento de rechazo: todas las peticiones se responden con tool calls, incluidas peticiones de arte oscuro (armas, gore, atrezo de terror), con 0 de 18 rechazos en la prueba realizada por el autor.

La innovacion principal es la separacion en tres piezas: un modelo base que emite las llamadas, un adaptador de edicion (edit LoRA, escala 0 en prompts nuevos y 1.0 en correcciones) y un adaptador de planificacion (planner LoRA) que convierte una frase con varias entidades y relaciones en un plan en palabras. El codigo anfitrion traduce ese plan a numeros exactos mediante una tabla integrada con las partes de 40 objetos cotidianos (banco, arbol, casa, tren, farola, etc.), y una comprobacion relee cada parte desde Blender para corregirla. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO.

## Capacidades

- Emision nativa de tool calls de Blender en formato Qwen (`{"name": ..., "arguments": ...}`) sobre un conjunto fijo de 26 herramientas.
- Construccion de escenas 3D a partir de una frase: un objeto suelto, una escena completa o modificaciones posteriores.
- Edicion de escenas existentes mediante el adaptador de edicion ("Make the bench blue", "Move the lamp to the left of the bench").
- Planificacion multiobjeto con el adaptador planner: convierte una frase con varias entidades y relaciones espaciales en un plan en palabras.
- Reconocimiento de 40 objetos cotidianos por nombre gracias a la tabla integrada en el host.
- Ejecucion totalmente offline, sin dependencia de servicios en la nube.
- Sin comportamiento de rechazo (uncensored) por entrenamiento.
- No genera texto libre: su salida son exclusivamente tool calls (o un plan JSON con el adaptador planner).
- No soporta vision, audio ni otros modos; unicamente texto de entrada y tool calls de salida.
- No funciona bien con conjuntos de herramientas distintos a los 26 de Blender.

## Casos de uso

- Generacion rapida de escenas de bloqueo (blockout) para previsualizacion: el modelo construye objetos y relaciones espaciales basicas en segundos, con 0,6 s por respuesta en un Mac de 8 GB, lo que permite iterar el layout antes de modelar en detalle.
- Edicion conversacional de escenas en produccion de videojuegos: el adaptador de edicion permite corregir colores, posiciones y jerarquias mediante frases cortas ("Make the bench blue", "Move the lamp to the left of the bench") sin salir de Blender.
- Automatizacion de tareas repetitivas en pipelines de arte 3D: la integracion via MCP (`build_scene`) y el complemento Maris3D Copilot permiten encadenar construcciones de props estandar (bancos, farolas, arboles) dentro de flujos de trabajo de Blender 4.2+.
- Prototipado de interacciones de lenguaje natural en herramientas DCC: sirve como referencia para desarrolladores que quieran evaluar como un SLM de 0,5B puede manejar tool calling de dominio especifico antes de escalar a modelos mayores.
- Despliegue en entornos con hardware restringido o aislado: con 0,58 GB de memoria constante y 62 tok/s en una VM de 4 nucleos sin GPU, es viable en maquinas de oficina, portatiles antiguos o entornos air-gapped sin conexion.
- Generacion de arte oscuro o de terror para videojuegos: al no tener comportamiento de rechazo, responde igual a peticiones de armas, gore o atrezo de horror, lo que lo hace adecuado para pipelines de arte de genero sin bloqueos intermedios.
- Educacion y demostraciones de IA local: su bajo coste de despliegue (Ollama, llama.cpp, LM Studio) permite montar talleres practicos de tool calling y agentes sobre Blender en equipos de estudiantes.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| Maris3D 180-request benchmark | full-scene pass % | 27,2 |
| Maris3D 180-request benchmark | usable scene % | 75,6 |
| Planner, 300 frases held-out | la respuesta parsea correctamente | 297 / 300 |
| Prueba de rechazo (18 peticiones) | peticiones rechazadas | 0 / 18 |
| Comparativa de ficheros (build) | base q8_0 | 24,0 |
| Comparativa de ficheros (build) | fichero edit merged | 14,7 |
| Comparativa de ficheros (edit merged) | calidad edit | 19,4 / 77,2 |

Rendimiento medido por el autor en distintas plataformas:

| Plataforma | Latencia / throughput |
|---|---|
| Mac de 8 GB | ~0,6 s por respuesta, 1,3 s de carga en frio |
| Portatil de 2015 con GPU de 4 GB | 141,5 tok/s |
| VM de 4 nucleos (CPU) | 62 tok/s |
| Memoria constante | 0,58 GB |

Las cifras de 76% de escenas usables y 27% completamente correctas en el primer intento corresponden a peticiones de una sola forma cada vez, segun la model card.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las configuraciones; el autor reporta 0,58 GB de memoria constante.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor cita como caso real una GPU de 4 GB de 2015 funcionando a 141,5 tok/s. No requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer, incluida una de 4 GB, y funciona en CPU pura (62 tok/s en una VM de 4 nucleos).
- Opciones de despliegue: llama.cpp (`llama-server --jinja`), Ollama, LM Studio, y el complemento Maris3D Copilot con instalacion en un comando (script `install.sh` / `install.ps1`).
- Requisitos de software: Python 3.9+ y Blender 4.2+.
- Ajustes obligatorios de inferencia: temperatura 0 y repeat penalty 1.0; con 1.1 (valor por defecto de Ollama) el modelo pierde nombres de objetos y puede entrar en bucle hasta el limite de tokens.
- Contexto de servicio recomendado: 8.192 tokens, ya que el manifiesto de 26 herramientas mas una conversacion pueden desbordar 4.096.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada. Como referencia estructural, se compara con su modelo base y con alternativas genericas de tool calling:

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Maris3D-SLM-Blender | 0,5B (2,93M en safetensors) | 2.048 entrenamiento / 8.192 servicio | Tool calls de Blender (26 herramientas) | Apache-2.0 | Hugging Face, GGUF |
| Qwen2.5-Coder-0.5B-Instruct | 0,5B | no disponible en la informacion | Generacion de codigo y texto general | Apache-2.0 | Hugging Face |
| Modelos de tool calling genericos de 0,5B-1B | 0,5B-1B | no disponible | Tool calling generalista | variable | variable |

La comparacion de rendimiento con alternativas no esta disponible; el autor solo compara variantes internas del propio modelo (base frente a edit merged).

## Limitaciones y advertencias

- Solo funciona con el conjunto fijo de 26 herramientas de Blender; con otros conjuntos de herramientas no rinde bien.
- No genera texto libre: su salida son exclusivamente tool calls o planes JSON, lo que limita su reutilizacion fuera del dominio 3D.
- Solo soporta ingles; no se ha entrenado para otros idiomas.
- Contexto de entrenamiento limitado a 2.048 tokens, aunque se recomienda servir con 8.192; conversaciones largas pueden desbordar el contexto.
- Requiere temperatura 0 y repeat penalty 1.0; configuraciones por defecto de algunas herramientas (p. ej. Ollama con 1.1) degradan la calidad y provocan bucles.
- Rendimiento limitado en tareas complejas: solo el 27,2% de las peticiones producen una escena completamente correcta en el primer intento; el 75,6% son usables con correcciones menores.
- Modelo uncensored: no aplica filtros de rechazo, por lo que puede generar contenido para arte oscuro o violento; debe desplegarse con supervision adecuada en entornos sensibles.
- Version preview v0.1: puede contener inestabilidades y cambios incompatibles en futuras versiones.
- Riesgo de alucinacion en nombres de objetos fuera de la tabla de 40 objetos cotidianos integrada en el host.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-0.5B-Instruct tambien es Apache-2.0; conviene verificar los terminos de las dependencias del complemento Maris3D (Blender 4.2+).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/slm4apps/Maris3D-Blender
- Repositorio GitHub: https://github.com/slm4apps/maris3d
- Releases: https://github.com/slm4apps/maris3d/releases
- Licencia en GitHub: https://github.com/slm4apps/maris3d/blob/main/LICENSE
- Documentacion de servicio (`SERVE.md`): https://github.com/slm4apps/maris3d/blob/main/SERVE.md
- Demo (GIF de salon): https://raw.githubusercontent.com/slm4apps/maris3d/main/docs/figures/demo/living-room.gif
- Blender: https://www.blender.org
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
