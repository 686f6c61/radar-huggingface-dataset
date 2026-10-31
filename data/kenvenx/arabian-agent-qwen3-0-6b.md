# Kenvenx/Arabian-Agent-Qwen3-0.6B

## Resumen

Arabian-Agent es un modelo de lenguaje compacto orientado a agentes, desarrollado por el usuario Kenvenx y publicado en HuggingFace. Se trata de un fine-tune LoRA (posteriormente fusionado en los pesos base) de Qwen3-0.6B de Alibaba, entrenado específicamente para seleccionar herramientas y generar llamadas estructuradas a funciones en árabe e inglés, en lugar de simular que la tarea ya se ha completado (el clásico problema de las "falsas finalizaciones" en modelos pequeños).

Su relevancia radica en cubrir un nicho poco atendido: el tool calling en árabe con modelos muy ligeros que puedan ejecutarse en hardware modesto o incluso en CPU. El autor reporta mejoras sustanciales frente al modelo base en un conjunto de pruebas propio de 354 ejemplos: la precisión de selección de herramienta sube del 92,17 % al 98,16 % y la coincidencia exacta de argumentos del 49,31 % al 82,03 %.

La arquitectura es un transformer denso de 0,6 mil millones de parámetros (596 millones exactos según los safetensors), con licencia Apache-2.0. Está pensado como componente de enrutamiento de herramientas dentro de un runtime de agente, no como sustituto del runtime ni de la capa de ejecución y permisos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Qwen3) |
| Parametros totales | 596.049.920 (≈0,6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens recomendada en los ejemplos de despliegue (entrenado con secuencias de 2.048) |
| Tipos de cuantizacion | GGUF (p. ej. Q4_K_M) en el repositorio GGUF; pesos originales en bfloat16 |
| Idiomas soportados | Arabe e ingles (arabe estandar moderno mejor representado que los dialectos) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (repo principal) y GGUF (repo derivado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder denso de la familia Qwen3. Sobre esa base se aplico un fine-tune supervisado con LoRA (r=16, alfa=32) que posteriormente se fusiono en los pesos base para facilitar la inferencia y la re-cuantizacion. El entrenamiento se realizo sobre 17.355 ejemplos (aproximadamente 2,3 millones de tokens supervisados) durante 1 epoca (4.338 pasos), con una longitud de secuencia de 2.048 tokens y semilla 13. El computo empleado fue modesto: dos NVIDIA Tesla T4 en Kaggle, con un pico de VRAM de 8,48 GB.

El objetivo del entrenamiento es un protocolo de salida compacto y parseable: cuando se necesita una herramienta, el modelo emite un bloque `<tool>` con un objeto JSON que contiene el nombre de la funcion y sus argumentos. Si no se necesita herramienta, responde en texto plano. Esta especializacion explica las metricas altas de seleccion de herramienta y la tasa de salida valida del 99,72 %, aunque a costa de la diversidad en conversacion abierta en arabe.

## Capacidades

- Seleccion de herramienta (tool routing) en arabe e ingles con alta precision reportada (98,16 % en el test propio).
- Generacion de llamadas a funciones estructuradas en formato JSON delimitado por etiquetas `<tool>`, con coincidencia exacta de argumentos del 82,03 %.
- Respuesta en texto plano cuando no se requiere herramienta.
- Generacion de texto conversacional basica en arabe e ingles (con limitaciones en chat abierto en arabe).
- Compatibilidad con plantillas de chat de Qwen3 (`apply_chat_template`) y con servidores compatibles con la API de OpenAI via llama.cpp.
- Pensado para integrarse en runtimes de agente como componente de enrutamiento, no para razonamiento multi-paso autonomo complejo (el rendimiento post-resultado-de-herramienta es limitado: similitud a referencia de 0,4939).
- No dispone de capacidades de vision, audio ni tool calling nativo del ecosistema de proveedores; el formato es propio y debe parsearse y validarse externamente.

## Casos de uso

- Asistentes virtuales en arabe con acceso a herramientas: el modelo puede actuar como enrutador que decide que funcion invocar (busqueda web, consulta de datos, etc.) a partir de instrucciones del usuario en arabe estandar moderno.
- Agentes locales y privados en hardware modesto: con cuantizacion GGUF Q4_K_M puede ejecutarse en portatiles o mini-PC sin GPU dedicada, mediante llama.cpp, Ollama o LM Studio.
- Automatizacion de flujos de trabajo bilingues: en equipos que mezclan arabe e ingles, el modelo mantiene la seleccion de herramienta con precision alta en ambos idiomas (100 % en arabe y resultados equivalentes en ingles en el test propio).
- Prototipado rapido de runtimes de agente: su formato de salida simple y determinista (decodificacion greedy) facilita el parseo y la validacion esquematica en pipelines de desarrollo.
- Integracion en servidores compatibles con la API de OpenAI: `llama-server` permite exponerlo como endpoint para un runtime de agente con contexto de 8.192 tokens.
- Atencion al cliente con acciones: como componente que traduce peticiones del usuario a llamadas a APIs internas (consultar pedidos, crear tickets), siempre con validacion estricta de esquemas y confirmacion humana para acciones irreversibles.
- Reduccion de "falsas finalizaciones": el modelo esta entrenado para proponer la llamada en lugar de afirmar que la tarea ya se realizo, algo util en orquestadores donde el resultado real lo devuelve la aplicacion.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre un conjunto de pruebas propio congelado de 354 ejemplos, con decodificacion greedy y el mismo harness entre versiones. No se trata de benchmarks estandar (MMLU, HumanEval, etc.) sino de metricas especificas de tool calling.

| Metrica | Qwen3-0.6B base | Arabian-Agent v4 |
|---|---:|---:|
| Precision de seleccion de herramienta | 92,17 % | 98,16 % |
| Coincidencia exacta de argumentos | 49,31 % | 82,03 % |
| Tasa de salida valida | 98,31 % | 99,72 % |
| Seleccion de herramienta en arabe | 92,54 % | 100,00 % |
| Coincidencia exacta de argumentos en arabe | 49,25 % | 83,58 % |
| Coincidencia exacta de argumentos en ingles | 49,33 % | 81,33 % |
| Falsas finalizaciones | 1 | 0 |

Metricas adicionales reportadas: similitud a referencia de 0,4939 en 57 ejemplos con resultado de herramienta posterior (multi-paso), y distinct-4 de 0,323 en 40 respuestas en arabe sin herramienta (frente a 0,713 del modelo base). No se han publicado resultados de benchmarks estandar como MMLU, GSM8K o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, aproximadamente 1,2-1,5 GB (el repo completo pesa 1,2 GB); con GGUF Q4_K_M, en torno a 0,5-0,7 GB.
- GPU recomendadas: cualquier GPU moderna de gama media o superior es sobrada; el propio entrenamiento se realizo en 2x NVIDIA Tesla T4 con un pico de 8,48 GB, por lo que la inferencia cabe con holgura en GPUs como la RTX 3060, RTX 4060 o superiores.
- Consumer GPUs: cabe facilmente en practicamente cualquier GPU con 2 GB de VRAM o mas, e incluso en CPU con los builds GGUF; no requiere acelerador dedicado.
- Opciones de despliegue: transformers (PyTorch, bfloat16), llama.cpp, Ollama (`ollama run hf.co/Kenvenx/Arabian-Agent-Qwen3-0.6B-GGUF:Q4_K_M`), LM Studio y `llama-server` como servidor compatible con la API de OpenAI. No hay informacion sobre soporte verificado en vLLM o TGI.
- Decodificacion recomendada: greedy (`do_sample=False`) o temperatura ≤ 0,2 para las llamadas a herramientas; si el runtime expone los controles de thinking de Qwen3, se sugiere desactivarlo.
- Latencia y throughput: no disponibles; al tratarse de un modelo de 0,6B con cuantizacion de 4 bits, la latencia en CPU moderna deberia ser baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Idiomas | Contexto | Licencia |
|---|---|---|---|---|---|
| Kenvenx/Arabian-Agent-Qwen3-0.6B | 0,6B (596M) | Tool calling en arabe (fine-tune LoRA) | Arabe, ingles | 8.192 (recomendado en despliegue) | Apache-2.0 |
| Qwen/Qwen3-0.6B (base) | 0,6B | Generalista con thinking mode | Multilingue (100+ idiomas) | No disponible en la informacion proporcionada | Apache-2.0 |
| Qwen/Qwen3-1.7B | 1,7B | Generalista, mayor capacidad de razonamiento | Multilingue | No disponible en la informacion proporcionada | Apache-2.0 |

Arabian-Agent sacrifica la generalidad y la diversidad conversacional del modelo base (distinct-4 de 0,323 frente a 0,713 en arabe sin herramientas) a cambio de una precision muy superior en seleccion de herramienta y generacion de argumentos, especialmente en arabe. Frente a alternativas generales de tamano similar como Qwen3-1.7B, ofrece un comportamiento mas predecible y especializado para el routing de herramientas, aunque con menor capacidad de razonamiento multi-paso.

## Limitaciones y advertencias

- El seguimiento multi-paso tras recibir el resultado de una herramienta es debil: similitud a referencia de 0,4939 en los 57 ejemplos evaluados de este tipo.
- El chat abierto en arabe no es su punto fuerte: la diversidad de respuestas (distinct-4: 0,323) es muy inferior a la del modelo base (0,713).
- El arabe estandar moderno esta mejor representado que los dialectos y los casos con fuerte code-switching.
- Con 0,6B de parametros, el modelo puede fallar en peticiones largas, ambiguas o que exijan razonamiento complejo.
- La evaluacion publicada no cubre robustez frente a jailbreaks, factualidad, codigo, matematicas ni trafico de produccion; los resultados provienen de un test propio curado, no garantizan rendimiento en produccion.
- El modelo propone llamadas a herramientas, pero la responsabilidad de seguridad recae en la aplicacion: hay que validar nombres y tipos de argumentos contra una allowlist o esquema estricto, aplicar permisos y minimo privilegio fuera del modelo, exigir confirmacion para acciones consecuentes o irreversibles, e implementar timeouts, logging, limites de tasa y gestion de errores.
- Nunca debe interpretarse una llamada propuesta como prueba de que la tarea se ha completado; el resultado real debe devolverlo la capa de ejecucion.
- Riesgo de alucinacion de argumentos: aunque la coincidencia exacta mejora al 82,03 %, casi un 20 % de las llamadas no coincide exactamente con la referencia en el test propio.
- La licencia Apache-2.0 no impone restricciones al uso comercial, pero conviene revisar las condiciones de uso de la familia Qwen3 como modelo base.

## Enlaces

- Modelo principal (safetensors): https://huggingface.co/Kenvenx/Arabian-Agent-Qwen3-0.6B
- Builds GGUF: https://huggingface.co/Kenvenx/Arabian-Agent-Qwen3-0.6B-GGUF
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper, demo y repositorio de entrenamiento: no disponibles
