# immiq/DeepSeek-V4.1-Flash-1017-Orinfer-A2-W4A8

## Resumen

DeepSeek-V4.1-Flash-1017-Orinfer-A2-W4A8 es una distribucion cuantizada del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario immiq para su motor de inferencia propietario Orinfer. No se trata de un modelo entrenado desde cero, sino de un empaquetado de pesos en formato W4A8 (pesos de 4 bits, activaciones de 8 bits) optimizado especificamente para ejecutarse sobre aceleradores Ascend 910B en configuracion TP8 (tensor parallelism de 8 dispositivos). El modelo base procede de deepseek-ai y conserva sus capacidades multimodales (texto, vision, thinking, function tools y borradores paralelos DSpark).

El repositorio contiene 513.773.354.864 parametros en safetensors y ocupa 557,7 GB, lo que refleja un modelo de gran escala con pesos cuantizados a 4 bits. La distribucion esta atada a un runtime concreto: Orinfer v0.3.14 sobre Linux aarch64, CANN 9.2 y glibc 2.34 o superior, con un archivo de ejecucion separado que declara planes de operadores y presupuestos de decodificacion especulativa. No es un checkpoint portable a vLLM, llama.cpp o TGI.

Su relevancia actual radica en que demuestra un flujo de despliegue de un modelo frontera sobre hardware Ascend, con decodificacion especulativa multi-borrador (hasta 5 drafts por owner, 192 filas de verificacion) y cache de prefijos y KV offload configurables. La licencia es MIT, lo que facilita su uso comercial, aunque las restricciones practicas vienen impuestas por el hardware y el motor de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base DeepSeek-V4.1-Flash-1017; el empaquetado usa operadores Orinfer con atencion H64 y proyecciones densas) |
| Parametros totales | 513.773.354.864 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 (pesos 4 bits, activaciones 8 bits); el repo se etiqueta como 8-bit |
| Idiomas soportados | zh, en |
| Licencia | MIT |
| Formato de pesos | safetensors (con archivo de ejecucion Orinfer separado) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base DeepSeek-V4.1-Flash-1017 ni su proceso de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO). Lo que si se documenta es la capa de despliegue: el paquete Orinfer incluye planes de operadores validados, una rejilla de lanzamiento de 20 Cube para 55 proyecciones densas (introducida en v0.3.13) y configuraciones de atencion H64 que escriben resultados PV directamente en BF16 (v0.3.14). El motor empaqueta operadores y planes de ejecucion por separado de los shards de pesos, de modo que las actualizaciones del motor no obligan a redescargar los pesos.

La innovacion tecnica mas destacable es el soporte de DSpark, un mecanismo de borradores paralelos para decodificacion especulativa. El paquete de ejecucion declara 192 filas de verificacion de decodificador, con un ancla por owner, permitiendo que 32 owners usen hasta 5 borradores cada uno cuando resulte rentable. La opcion `--mtp-drafts auto` selecciona adaptativamente ese limite, mientras que `--max-speculative-tokens 0` delega en el presupuesto del paquete. Tambien se documenta una tabla Engram residente en host de aproximadamente 206 GiB, con modo alternativo respaldado por fichero y cache de filas configurable.

## Capacidades

- Generacion de texto conversacional en chino e ingles.
- Modo thinking (razonamiento extendido) integrado en el runtime.
- Soporte de function tools y llamadas a herramientas.
- Procesamiento de imagenes, incluyendo multiples imagenes por peticion.
- Borradores paralelos DSpark para decodificacion especulativa.
- Cache de prefijos (`--prefix-cache-mib`) y offload de KV (`--kv-offload-mib`).
- Reutilizacion de coincidencias de checkpoint restaurables para peticiones en cola (v0.3.14).
- Gestion de presion de memoria con cesion de admisiones frias largas a peticiones activas.
- Servicio HTTP con timeouts configurables de cola, salida y drenaje.

## Casos de uso

- Despliegue de un modelo frontera en infraestructura Ascend: el paquete esta pensado para un nodo con 8 aceleradores Ascend 910B en TP8, lo que permite servir el modelo sin depender de GPUs NVIDIA en entornos con hardware Huawei.
- Asistentes conversacionales multilingues zh/en: el modelo cubre generacion de texto y conversacion, adecuado para atencion al cliente o asistentes internos en organizaciones con operaciones en China y mercados angloparlantes.
- Analisis de documentos con imagenes: al soportar multiples imagenes por peticion, puede emplearse en extraccion de datos de facturas, capturas o formularios escaneados combinados con texto.
- Automatizacion con herramientas: el soporte de function tools permite integrarlo en flujos donde el modelo decide invocar APIs, consultar bases de datos o encadenar acciones multi-paso.
- Razonamiento asistido con modo thinking: util para tareas de analisis que requieren trazas de razonamiento extensas, como revision de codigo o diagnostico tecnico.
- Servicio de inferencia con cache de prefijos: en escenarios con prompts de sistema largos y repetidos, la cache de prefijos de 8 GiB reduce el coste de prefill en peticiones sucesivas.
- Procesamiento por lotes con tolerancia a latencia: los timeouts de salida de 180 s y de cola de 60 s permiten encolar peticiones largas en un servidor compartido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento documentados son del motor Orinfer sobre la carga de trabajo "Mini" congelada de 240 segundos:

| Version | Peticiones completadas | Errores | Latencia agregada | Duracion de decode |
|---|---|---|---|---|
| v0.3.13 | 69 (frente a 68 del control family-Graph) | no disponible | -10,93 % en 63 peticiones identicas | -12,85 % en 63 peticiones identicas |
| v0.3.14 (ensayo 1) | 71 | 0 | +10,7 % | no disponible |
| v0.3.14 (ensayo 2) | 70 | 0 | +5,1 % | no disponible |

El objetivo de >=80 peticiones en la ventana de 240 s sigue sin alcanzarse segun la propia documentacion. Estos numeros miden throughput del motor, no calidad del modelo.

## Requisitos de hardware

- Acelerador: Ascend 910B en configuracion TP8 (8 dispositivos). No se documenta soporte para GPU NVIDIA.
- Sistema operativo: Linux aarch64, glibc 2.34 o superior.
- Stack de software: CANN 9.2 y motor Orinfer v0.3.14 con el archivo de ejecucion correspondiente (digest `ce7a1cec548914645bf31ae9e695da038ec1506c895138ecbe61906688ac3687`).
- Memoria host: aproximadamente 206 GiB adicionales para mantener la tabla Engram completamente residente; el modo respaldado por fichero reduce ese requisito pero no es el usado en las pruebas de rendimiento.
- Cache de vision: 1 GiB (`ORINFER_VISION_CACHE_MIB=1024`).
- Cache de prefijos: 8 GiB (`--prefix-cache-mib 8192`).
- Offload de KV: 256 GiB (`--kv-offload-mib 262144`).
- Tamano del repositorio: 557,7 GB de pesos en safetensors.
- No cabe en GPU de consumo: el modelo requiere hardware de centro de datos Ascend y un runtime especifico.
- Opciones de despliegue: exclusivamente `orinfer serve`; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: la carga Mini de 240 s completa entre 69 y 71 peticiones en TP8, con cero errores en los ensayos de v0.3.14.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware objetivo | Formato |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Orinfer-A2-W4A8 | 513.773.354.864 | no disponible | MIT | Ascend 910B TP8 | safetensors + paquete Orinfer |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible | no disponible |
| Otras cuantizaciones W4A8 de modelos frontera | no disponible | no disponible | no disponible | GPU NVIDIA tipicamente | GGUF, AWQ, GPTQ |

La comparativa con alternativas de la misma categoria no puede completarse con los datos proporcionados: no se dispone de especificaciones del modelo base ni de otras distribuciones cuantizadas equivalentes. La diferencia principal frente a cuantizaciones convencionales es el acoplamiento al motor Orinfer y al hardware Ascend, que impide un trasplante directo a otros stacks.

## Limitaciones y advertencias

- El modelo esta atado a Orinfer v0.3.14, CANN 9.2, glibc 2.34+ y Ascend 910B TP8; no es portable a otros motores ni a GPU NVIDIA.
- Solo se declaran idiomas zh y en; el rendimiento en castellano u otras lenguas no esta documentado.
- No se publican datos de sesgos, alucinacion ni evaluaciones de seguridad del modelo base.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas con prompts largos.
- El modo con tabla Engram residente exige aproximadamente 206 GiB de memoria host adicional; el modo respaldado por fichero no fue el usado en las pruebas de rendimiento.
- El objetivo de throughput de >=80 peticiones por ventana de 240 s no se alcanza; los ensayos de v0.3.14 muestran ademas un aumento de latencia agregada del 5,1 % al 10,7 % frente a la version anterior en peticiones identicas.
- La verificacion de integridad de pesos no es automatica al cargar; requiere ejecutar `orinfer validate-model` de forma explicita.
- Es necesario configurar autenticacion antes de exponer el servidor fuera del host de confianza.
- El periodo de gracia externo para terminacion debe superar los 120 segundos.
- La licencia MIT se aplica al empaquetado, pero el uso comercial queda condicionado por la disponibilidad de hardware Ascend y del runtime Orinfer.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/immiq/DeepSeek-V4.1-Flash-1017-Orinfer-A2-W4A8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Release v0.3.14 de Orinfer: https://github.com/iMMIQ/orinfer/releases/tag/v0.3.14
- Repositorio Orinfer: https://github.com/iMMIQ/orinfer
- Registro de aceptacion A2 v0.3.14: benchmarks/a2-v0.3.14-acceptance-20261118.json (referenciado en la model card)
