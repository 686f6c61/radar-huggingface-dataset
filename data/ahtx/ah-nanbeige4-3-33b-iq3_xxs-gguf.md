# ahtx/AH-Nanbeige4.3-33B-IQ3_XXS-GGUF

## Resumen

AH-Nanbeige4.3-33B-IQ3_XXS-GGUF es una cuantizacion en formato GGUF del modelo Nanbeige4.3-33B, desarrollado por el equipo de Nanbeige y cuantizado por el usuario ahtx (Amir Husain) mediante llama.cpp. El objetivo declarado es empaquetar un modelo de 33.118.977.024 parametros en un unico fichero de 13,1 GB, manteniendo una precision suficiente para tareas de agente: tool calling, trabajo en terminal y generacion de codigo sobre una sola GPU de consumo.

La cuantizacion se realizo a partir del Q8_0 de bartowski, reutilizando su importance matrix (imatrix), y empleando un tensor de salida Q5_K para compatibilidad con el motor propietario Kindi. El autor reporta que el fichero resultante coincide con el modelo original en el 82,8% de los tokens top y presenta una divergencia KL de 0,225 sobre su conjunto de texto reservado.

El interes de esta ficha radica en que permite ejecutar un modelo de 33B con capacidades de agente en hardware asequible (una RTX 3090 a unos 35 tokens por segundo segun el autor), manteniendo la licencia Apache 2.0 del modelo base. No se dispone de informacion sobre la arquitectura interna, los datos de entrenamiento ni los idiomas soportados del modelo original en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa `-c 16384`) |
| Tipos de cuantizacion | IQ3_XXS (con tensor de salida Q5_K); el repositorio base ofrece otras variantes GGUF de bartowski |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del fichero | 13,1 GB |
| Modelo base | Nanbeige/Nanbeige4.3-33B |
| Herramienta de cuantizacion | llama.cpp con imatrix de bartowski |
| Fidelidad vs. original (top token) | 82,8% |
| Divergencia KL vs. original | 0,225 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Nanbeige4.3-33B en la documentacion proporcionada: no se especifica si es un transformer denso, un modelo de mezcla de expertos (MoE), hibrido o cualquier otra variante, ni se detallan los datos de entrenamiento, el numero de tokens, la composicion del dataset o las tecnicas de alineacion (RLHF, DPO) empleadas.

Lo que si se documenta es el proceso de cuantizacion: se parte del Q8_0 de bartowski, se aplica su importance matrix y se genera el fichero IQ3_XXS con un tensor de salida Q5_K para que Kindi pueda ejecutarlo. El autor indica que evaluo varios candidatos token a token contra el modelo original y conservo el fichero con menor divergencia a ese tamano. El resultado son 13,1 GB de pesos con un 82,8% de coincidencia en el token top y KL de 0,225, cifras que el autor presenta como criterio de seleccion, no como garantia de calidad absoluta.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`).
- Tool calling / function calling: etiquetado explicitamente en el repositorio y soportado por la plantilla de chat de llama.cpp con `--jinja`.
- Uso como agente: el autor lo evalua en tareas de terminal y codigo dentro del arnes de agentes `pi`.
- Generacion de codigo: evaluado con 50 problemas recientes de LiveCodeBench.
- Trabajo en terminal: evaluado con 65 tareas de kbench orientadas a agentes.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Agente de terminal en local: el modelo esta disenado y evaluado para tareas de terminal dentro de un arnes de agentes; con 33B de parametros y soporte de tool calling puede ejecutar comandos, interpretar salidas y encadenar pasos sobre una unica GPU de consumo.
- Asistencia de codigo en estaciones de trabajo: con 13,1 GB de pesos cabe en GPUs de 24 GB, lo que permite integrarlo en editores o pipelines locales sin depender de la nube; el autor reporta un 68% en LiveCodeBench sobre su muestra de 50 problemas.
- Automatizacion de tareas de CI/CD y scripts: el soporte de function calling y su ejecucion con llama.cpp `--jinja` permiten conectarlo a herramientas externas para generar, revisar o reparar scripts en un pipeline.
- Prototipado de agentes multi-paso: al ser un modelo abierto con licencia Apache 2.0, se puede usar para desarrollar y depurar arneses de agentes (planificacion, llamadas a herramientas, verificacion) sin coste de API.
- Despliegue en hardware de gama baja: el autor apunta a sistemas de bajo coste, incluido Kindi sobre tarjetas NVIDIA antiguas (desde una Quadro K420 de 1 GB hasta una RTX 3080); el fichero IQ3_XXS esta pensado para maximizar el contexto y la velocidad en esos entornos.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la perdida de calidad de IQ3_XXS frente al modelo original (82,8% de coincidencia en token top, KL 0,225) en cargas de trabajo de agente.
- Servicio de chat local con contexto medio: el ejemplo del autor arranca con 16.384 tokens de contexto, adecuado para conversaciones multi-turno y documentos de tamano moderado en una sola GPU.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantizacion (115 tareas, una semilla por tarea, mismos ajustes para ambos modelos):

| Test | Nanbeige 33B IQ3_XXS (llama.cpp) | Bonsai 27B (Kindi) |
|---|---|---|
| kbench, 65 tareas de agente | 64 (98,5%) | 64 (98,5%) |
| LiveCodeBench, 50 problemas | 34 (68,0%) | 32 (64,0%) |
| Total 115 tareas | 98 (85,2%) | 96 (83,5%) |

El propio autor advierte que ambas puntuaciones en kbench estan cerca del techo de la prueba y que las tareas mas dificiles estan en preparacion. No se han publicado resultados de MMLU, GSM8K, HumanEval ni otros benchmarks estandar en la informacion disponible.

Rendimiento de inferencia reportado: aproximadamente 35 tokens por segundo en una RTX 3090 con llama.cpp usando este fichero.

## Requisitos de hardware

- VRAM estimada: unos 13,1 GB solo para los pesos; con cache KV en q8_0 y 16.384 tokens de contexto hay que anadir varios GB, por lo que en la practica se recomienda una GPU de 24 GB para ese ajuste.
- GPU recomendadas: RTX 3090 (medicion oficial del autor, ~35 tok/s), RTX 4090, A100 o H100 para mayor throughput; RTX 3080 como minimo segun el objetivo de Kindi.
- GPU de consumo: si, cabe en tarjetas de 16-24 GB; en 12 GB requeriria reducir contexto o usar offload parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`), y Kindi (soporte en desarrollo). No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Parametros de muestreo sugeridos por el autor: `--temp 0.7 --top-p 0.8 --top-k 20 --min-p 0`.
- Latencia y throughput: ~35 tok/s en RTX 3090 con llama.cpp; sin datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AH-Nanbeige4.3-33B IQ3_XXS | 33,1B | no disponible | Apache 2.0 | GGUF (13,1 GB) | 68,0% en LiveCodeBench (50 problemas), 98,5% en kbench |
| Bonsai 27B (Kindi) | 27B (aprox.) | no disponible | no disponible | no disponible | 64,0% en LiveCodeBench, 98,5% en kbench; comparacion del propio autor |
| Nanbeige/Nanbeige4.3-33B (original) | 33,1B | no disponible | Apache 2.0 | safetensors | Modelo de referencia sin cuantizar; sin benchmarks publicados en la informacion disponible |

No se dispone de datos de otros modelos comparables de 30-35B en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion IQ3_XXS introduce perdida de fidelidad: solo el 82,8% de coincidencia en el token top y KL de 0,225 frente al original; en tareas sensibles a la precision (codigo, matematicas) puede degradar respecto al modelo sin cuantizar.
- Los benchmarks del autor usan una sola semilla por tarea y muestras pequenas (50 y 65 tareas), por lo que las diferencias frente a Bonsai 27B (2 tareas de 115) no son estadisticamente concluyentes.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento multilingue del modelo base.
- El contexto maximo real del modelo no esta documentado; el valor de 16.384 del ejemplo es una configuracion de ejecucion, no una especificacion del modelo.
- El soporte de Kindi esta en desarrollo; la unica via de despliegue validada es llama.cpp.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Nanbeige4.3-33B antes de un uso comercial, ya que esta ficha solo refleja lo indicado en la model card de la cuantizacion.
- El repositorio tiene un uso limitado (885 descargas, 4 likes) y fue creado en octubre de 2026; la validacion independiente es escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahtx/AH-Nanbeige4.3-33B-IQ3_XXS-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- GGUF de bartowski (imatrix y Q8_0 de origen): https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF
- kbench (benchmark de agentes): https://github.com/ahtx/kindi-bench
- Kindi (motor de inferencia): https://amirhusain.com/kindi
- llama.cpp: https://github.com/ggml-org/llama.cpp
