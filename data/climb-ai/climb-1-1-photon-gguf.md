# Climb-Ai/Climb-1.1-Photon-GGUF

## Resumen

Climb 1.1 Photon es un modelo de lenguaje especializado en la generacion de comandos de terminal Linux y Bash, desarrollado por Climb-Ai. Se trata de un fine-tuning del modelo base Qwen 3.5 de 0.8B parametros, orientado especificamente a tareas de CLI: interpretar instrucciones en lenguaje natural y producir comandos POSIX correctos. La version aqui descrita es la distribucion GGUF cuantizada, pensada para ejecucion local ultrarrápida en portatiles, dispositivos edge, Termux, Ollama y llama.cpp.

El modelo incorpora una tecnica propietaria denominada Astra Weight-Space Programming (WSP), descrita por el autor como proteccion anti-bucle. Su tamano inferior a mil millones de parametros lo situa en la categoria de modelos ultraligeros, lo que permite desplegarlo en hardware muy modesto con requisitos de memoria que van desde los 750 MB hasta los 1.9 GB segun la cuantizacion.

La relevancia actual del modelo radica en su enfoque vertical: en lugar de competir en capacidades generales, se especializa en una tarea concreta donde los modelos base pequenos suelen fallar, y reporta una mejora sustancial en un benchmark propio de 100 tareas Bash/Linux multilingues (89/100 frente a 22/100 del Qwen 3.5 0.8B base). La licencia Apache-2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal en layout split (attn_qkv + attn_gate); derivada de Qwen 3.5 |
| Parametros totales | 0.8B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los ejemplos usan n_ctx=512) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen 3.5 0.8B, un transformer de 0.8B parametros. La model card menciona que los builds GGUF emplean un layout de atencion lineal "split" (`attn_qkv` + `attn_gate`) compatible con los binarios publicados de llama.cpp, verificado en la version b12032 y posteriores, incluyendo los backends Vulkan y CUDA. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica destacada por el autor es Astra Weight-Space Programming (WSP), descrita como una proteccion anti-bucle. No se proporcionan detalles tecnicos sobre su funcionamiento interno en la informacion disponible. El modelo utiliza un formato de prompt tipo ChatML (`<|im_start|>user ... <|im_end|>`) con un bloque `<think>` vacio en la respuesta del asistente, lo que sugiere un modo de razonamiento desactivado por defecto en los ejemplos de uso.

## Capacidades

- Generacion de comandos de terminal Linux y Bash a partir de instrucciones en lenguaje natural.
- Cobertura de tareas de gestion de ficheros y directorios (busqueda, borrado, permisos).
- Gestion de procesos y sistema (kill, monitoring, puertos).
- Tareas de red (diagnostico, conexiones, puertos).
- Procesamiento de texto (grep, sed, awk, pipelines).
- Construccion de scripts y estructuras de control Bash.
- Soporte multilingue limitado a ingles y ruso.
- Proteccion anti-bucle mediante Astra Weight-Space Programming (WSP).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Asistente de terminal integrado en el shell: el modelo traduce una peticion en lenguaje natural ("encuentra todos los .log de mas de 30 dias en /var/log y borralos") a un comando POSIX, con latencia muy baja gracias a su tamano de 0.8B y a la cuantizacion Q8_0 (764 MiB).
- Automatizacion en dispositivos edge y Termux: al requerir entre 750 MB y 1.1 GB de RAM/VRAM, puede ejecutarse en telefonos Android via Termux o en mini-PC, ofreciendo asistencia de CLI sin conexion a red.
- Copiloto local en portatiles de desarrollo: desplegado con Ollama o llama.cpp, permite consultar comandos sin enviar informacion sensible a servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Generacion de scripts de mantenimiento: el modelo cubre tareas de gestion de procesos, red y procesamiento de texto, por lo que puede ayudar a redactar scripts de limpieza, monitorizacion o diagnostico en servidores.
- Formacion y onboarding de administradores de sistemas: sirve como herramienta didactica para explicar comandos y construir pipelines complejos paso a paso.
- Integracion en pipelines de CI/CD o herramientas internas: mediante `llama-cpp-python` puede incrustarse en utilidades de automatizacion que traduzcan descripciones de tareas a comandos ejecutables, con temperatura 0 para salidas deterministas.

## Benchmarks y rendimiento

El autor reporta resultados en un benchmark propio de 100 tareas Bash/Linux multilingues:

| Categoria | Climb 1.1 Photon | Climb 1 Photon | Qwen 3.5 0.8B |
|---|---|---|---|
| 1. Ficheros y directorios (1-20) | 90% | 35% | 15% |
| 2. Procesos y sistema (21-40) | 95% | 50% | 30% |
| 3. Redes (41-55) | 90% | 40% | 25% |
| 4. Texto y procesamiento (56-75) | 85% | 25% | 20% |
| 5. Scripts y construcciones (76-100) | 85% | 20% | 20% |
| Puntuacion global | 89/100 | 34/100 | 22/100 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El benchmark presentado es de elaboracion propia del autor y no ha sido verificado de forma independiente.

## Requisitos de hardware

- VRAM/RAM estimada por cuantizacion: F16 ~1.9 GB; Q8_0 ~1.1 GB; Q6_K ~900 MB; Q5_K_M ~850 MB; Q4_K_M ~750 MB.
- Cabe en practicamente cualquier GPU de consumo; no requiere GPU dedicada y puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM para F16; para Q8_0 basta con 1.5 GB. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Opciones de despliegue: llama.cpp (CLI, verificado en b12032+ con backends Vulkan y CUDA), llama-cpp-python, Ollama (mediante Modelfile) y Termux.
- Latencia y throughput: no se proporcionan cifras concretas; el autor describe la ejecucion como "ultrarrápida" sin datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark Bash/Linux (autor) | Licencia | Formato |
|---|---|---|---|---|---|
| Climb 1.1 Photon | 0.8B | no disponible | 89/100 | Apache-2.0 | GGUF |
| Climb 1 Photon | 0.8B (base Qwen 3.5) | no disponible | 34/100 | no disponible | no disponible |
| Qwen 3.5 0.8B | 0.8B | no disponible | 22/100 | no disponible | no disponible |

No se dispone de datos sobre otros modelos especializados en CLI comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en tareas de terminal Linux/Bash; no es adecuado para generacion de texto general, razonamiento abierto ni codigo en otros lenguajes.
- Idiomas limitados a ingles y ruso; no se documenta soporte de castellano.
- Riesgo de alucinacion en comandos: aunque el benchmark propio reporta alta precision, un comando incorrecto en produccion puede ser destructivo (por ejemplo, borrados recursivos); se recomienda supervision humana y validacion previa.
- El benchmark de 89/100 es de elaboracion propia del autor y no ha sido verificado de forma independiente.
- La longitud de contexto no esta especificada; los ejemplos de uso emplean n_ctx=512, lo que sugiere ventanas cortas en la practica.
- La proteccion anti-bucle WSP no esta documentada tecnicamente, por lo que su eficacia no puede evaluarse de forma independiente.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base Qwen 3.5 del que deriva.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Climb-Ai/Climb-1.1-Photon-GGUF
- Modelo base (fine-tuning): https://huggingface.co/Climb-Ai/Climb-1.1-Photon
- Informe completo del benchmark: https://huggingface.co/Climb-Ai/Climb-1.1-Photon
- llama.cpp: no se proporciona enlace en la informacion disponible
- Ollama: no se proporciona enlace en la informacion disponible
- Paper o blog tecnico: no disponible
