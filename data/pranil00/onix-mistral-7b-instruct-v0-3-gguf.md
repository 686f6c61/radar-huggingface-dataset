# pranil00/ONIX-Mistral-7B-Instruct-v0.3-GGUF

## Resumen

ONIX-Mistral-7B-Instruct-v0.3-GGUF es una cuantizacion en formato GGUF del modelo Mistral-7B-Instruct-v0.3 de Mistral AI, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El artefacto concreto es un unico fichero en cuantizacion Q5_K_M (5,5 bits por peso) de 4,87 GB, generado con la herramienta run-any-model, un motor de optimizacion orientado a ejecucion en hardware de consumo. No se trata de un modelo nuevo ni de un fine-tuning: es una conversion de pesos del modelo base oficial.

El modelo subyacente es un transformer decoder-only denso de 7.248.019.456 parametros (7,25 B), con una ventana de contexto de 32.768 tokens en su version v0.3 y licencia Apache 2.0. La cuantizacion Q5_K_M reduce el peso de 14,18 GB en FP16 a 4,87 GB, lo que permite ejecutar el modelo en GPUs de consumo con 6-8 GB de VRAM, en equipos Apple Silicon con memoria unificada y en CPU con instrucciones AVX2/AVX-512.

Su relevancia es practica: ofrece un punto de entrada de bajo coste para desplegar localmente un modelo de instrucciones de 7 B con contexto largo y licencia permisiva, sin dependencia de APIs externas. La contrapartida es que el repositorio no incluye evaluaciones propias del modelo base ni documentacion sobre idiomas soportados, y las cifras de rendimiento publicadas por el autor (retencion de calidad del 97,5 %) no estan respaldadas por benchmarks verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Mistral) |
| Parametros totales | 7.248.019.456 (7,25 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens en el modelo base v0.3; el autor documenta ventanas operativas de 8.192 tokens en GPU/Apple Silicon y 4.096 en CPU |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unico fichero publicado |
| Idiomas soportados | no disponible (la model card no los detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`mistralai--Mistral-7B-Instruct-v0.3-Q5_K_M.gguf`, 4,87 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente al modelo base Mistral-7B-Instruct-v0.3: transformer decoder-only denso con atencion por ventana deslizante (sliding window attention) en las capas intermedias, RoPE para codificacion posicional y tokenizador con vocabulario ampliado respecto a versiones anteriores de Mistral. La v0.3 incorpora soporte de function calling mediante el token especial `[AVAILABLE_TOOLS]` y amplia el contexto a 32.768 tokens. No se dispone de informacion detallada en la documentacion proporcionada sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (SFT, RLHF o DPO) aplicadas por Mistral AI.

Esta publicacion no aporta entrenamiento adicional: es exclusivamente un proceso de cuantizacion post-entrenamiento. El autor declara el uso de run-any-model, un motor que genera ficheros GGUF con metadatos de "device-adaptive execution" y un informe de telemetria propio (DeviceQuant). Dicho informe compara FP16 frente a Q5_K_M en un host Darwin con 16 GB de memoria: peso de 14,18 GB a 4,87 GB, RAM residente total de 14,75 GB a 5,45 GB y aceleracion de las 32 capas en Metal. No hay innovaciones arquitectonicas propias; la unica aportacion tecnica es el empaquetado y la tabla de requisitos de memoria.

## Capacidades

- Generacion de texto e instrucciones en formato conversacional, con plantilla de chat del modelo base Mistral Instruct v0.3.
- Razonamiento de complejidad media y respuesta a preguntas sobre conocimiento general.
- Generacion de codigo en lenguajes habituales (Python, JavaScript, SQL, etc.), con calidad propia de un modelo de 7 B.
- Razonamiento matematico basico y problemas aritmeticos de varios pasos.
- Function calling / tool calling nativo mediante los tokens especiales introducidos en la v0.3 (`[AVAILABLE_TOOLS]`, `[TOOL_CALLS]`).
- Flujos de agente simples y razonamiento multi-paso, limitados por la ventana de contexto efectiva que configure el runtime.
- Capacidades multilingues heredadas del modelo base; el repositorio no especifica la lista de idiomas.
- Sin soporte de vision, audio ni modo de razonamiento explicito (thinking mode).
- Ejecucion local en CPU, GPU CUDA y Apple Metal gracias al formato GGUF.

## Casos de uso

- Asistente de terminal y chat local: el fichero GGUF se carga directamente en llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`) u Ollama, lo que permite disponer de un asistente conversacional sin conexion en un portatil con 8 GB de RAM.
- Prototipado rapido de aplicaciones LLM: al caber en una RTX 3060/4060 con 6,37 GB de VRAM declarados, sirve para validar prompts, plantillas de chat y flujos de tool calling antes de migrar a un modelo mayor o a una API.
- Generacion de codigo en entornos con requisitos de privacidad: al ejecutarse en local y bajo Apache 2.0, puede integrarse en editores o scripts de refactorizacion sin enviar codigo propietario a servicios externos.
- Extraccion y clasificacion de informacion sobre documentos: con hasta 8.192 tokens de contexto operativo en GPU, es adecuado para resumir articulos, clasificar tickets o extraer entidades de contratos de extension moderada.
- Educacion y experimentacion: permite a estudiantes e investigadores reproducir experimentos de cuantizacion (comparar Q5_K_M frente a FP16) y medir el impacto en calidad con hardware asequible.
- Automatizacion de tareas con function calling: el soporte nativo de herramientas de la v0.3 permite construir agentes ligeros que consulten APIs, lean ficheros o ejecuten comandos en un pipeline local.
- Despliegue en dispositivos Apple Silicon: con 5,45 GB de memoria unificada declarados y aceleracion Metal de las 32 capas, es viable en MacBook con 16 GB para tareas de asistencia y generacion de texto en segundo plano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas internas de cuantizacion (retencion de calidad estimada del 97,5 %, ratio de compresion de 2,91x y tamano de pesos), que no constituyen evaluaciones de capacidad del modelo sobre MMLU, HumanEval, GSM8K ni tareas equivalentes.

| Metrica (informe del autor) | FP16 (base) | Q5_K_M | Variacion |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 5,5 | -65,6 % |
| Tamano de pesos | 14,18 GB | 4,87 GB | -65,6 % |
| KV cache | 512 MB (FP16) | 512 MB (FP16) | Optimizado |
| RAM residente total | 14,75 GB | 5,45 GB | -63,1 % |
| Calidad estimada | 100 % | 97,5 % | -2,5 % |
| Capas aceleradas | 0 % | 32/32 | Optimo |

## Requisitos de hardware

- VRAM estimada: 6,37 GB en GPU NVIDIA con CUDA (RTX 30/40/50), segun el autor; el fichero pesa 4,87 GB y el resto corresponde a KV cache y overhead del runtime.
- Memoria unificada en Apple Silicon: 5,45 GB en equipos M1/M2/M3/M4/M5, con aceleracion Metal de las 32 capas.
- CPU: 7,45 GB de RAM libre, con soporte de AVX2/AVX-512; contexto recomendado de 4.096 tokens.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090, A100, H100). Cabe en GPUs de consumo de gama media; no es necesario hardware de datacenter.
- Opciones de despliegue: llama.cpp, Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y el CLI run-any-model. vLLM y TGI no se citan en la documentacion, aunque el formato GGUF es compatible con llama.cpp y con backends que lo soporten.
- Latencia y throughput: no disponibles. El autor no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Mistral-7B-Instruct-v0.3-GGUF (esta ficha) | 7,25 B | 32.768 (modelo base); 8.192 operativo documentado | GGUF Q5_K_M, 4,87 GB | Apache 2.0 | Hugging Face, 0 descargas |
| mistralai/Mistral-7B-Instruct-v0.3 (original) | 7,25 B | 32.768 | safetensors FP16/BF16 | Apache 2.0 | Hugging Face, oficial |
| Mistral-7B-Instruct-v0.3 GGUF de terceros (p. ej. TheBloke, bartowski) | 7,25 B | 32.768 | GGUF en multiples cuantizaciones (Q4_K_M, Q5_K_M, Q8_0, etc.) | Apache 2.0 | Hugging Face, ampliamente descargados |
| Meta Llama 3.1 8B Instruct | 8 B | 131.072 | safetensors, GGUF | Llama 3.1 Community License | Hugging Face, oficial |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado con segundos de diferencia; no hay evidencia de validacion por parte de la comunidad ni de terceros.
- La afirmacion de "97,5 % de retencion de calidad" es una estimacion del autor sin metodologia publicada ni benchmarks que la respalden.
- La model card no especifica idiomas soportados, composicion del dataset ni detalles de alineacion; toda esa informacion debe consultarse en el modelo base de Mistral AI.
- La ventana de contexto operativa documentada (8.192 tokens en GPU, 4.096 en CPU) es inferior a los 32.768 tokens del modelo base; configurar contextos mayores incrementa el consumo de KV cache y puede degradar el rendimiento.
- Riesgo de alucinacion propio de un modelo de 7 B: puede inventar hechos, APIs o referencias, especialmente en tareas de conocimiento especializado.
- Sesgos heredados del corpus de entrenamiento del modelo base (genero, idioma, cultura), no auditados en esta publicacion.
- Aunque la licencia declarada es Apache 2.0, la model card incluye una clausula de exencion total de responsabilidad ("AS IS") que conviene revisar antes de un uso comercial; el texto mezcla referencias a "Apache 2.0 / MIT", lo que introduce ambiguedad.
- El proceso de cuantizacion Q5_K_M puede degradar tareas sensibles a la precision, como aritmetica exacta, generacion de codigo con APIs poco frecuentes o function calling con esquemas JSON estrictos.
- No hay garantia de soporte ni mantenimiento del repositorio por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Mistral-7B-Instruct-v0.3-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
- Herramienta run-any-model: https://github.com/PranilShah-08/run-any-model
