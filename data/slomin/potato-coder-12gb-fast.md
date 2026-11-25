# Slomin/Potato-CODER-12GB-Fast

## Resumen

Potato-CODER-12GB-Fast es una cuantizacion GGUF de un modelo MoE de aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token, derivado de Qwen3.6-35B-A3B a traves de la version ternaria Millie-1.1-35B-A3B-Ternary de LLMs For All. Lo publica el usuario Slomin y su propuesta central es de despliegue: alrededor del 90 % de los pesos estan en formato ternario, de modo que el modelo completo (7,74 GiB) mas el proyector de vision (0,57 GiB) caben residentes en una GPU de 12 GB, sin offloading a CPU, con una cache KV de 131.072 tokens en q8_0.

El aporte propio del autor no es el entrenamiento, sino la ingenieria de inferencia: kernels CUDA que aceleran la ejecucion de pesos ternarios en hardware NVIDIA, un proyector de vision convertido a Q8_0 (el original usaba un tipo Q4_SYM16F sin kernels de GPU), una plantilla de chat concisa que acorta las respuestas y una receta de despliegue reproducible con llama.cpp. Sobre una RTX 3090 limitada a un presupuesto de 11.836 MiB, el autor reporta 161-179 tok/s de decodificacion y 2.199 tok/s de prefill.

Es relevante porque demuestra una via practica para servir un modelo de clase 35B con vision, tool calling y contexto de 131k en hardware de consumo de gama alta, un escenario tradicionalmente reservado a GPUs de 24 GB o superiores. La licencia Apache-2.0 y la compatibilidad con la API de OpenAI facilitan su integracion, aunque el rendimiento declarado depende de un runtime especifico no estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.6-35B-A3B), pesos mayoritariamente ternarios (~90 %), resto en mayor precision |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B por token (A3B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Ternario (~90 % de pesos) + precision mixta; cache KV q8_0/q8_0; proyector de vision Q8_0 con 27 tensores ffn_down en F16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo 7,74 GiB + proyector 0,57 GiB) |
| Vision | Si, proyector multimodal residente en GPU |
| Runtime requerido | llama.cpp fork "potato" (Fast CUDA runtime), no compatible con binarios estandar |
| Tamano del repositorio | 8,9 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de Qwen3.6-35B-A3B: unos 35B de parametros totales con aproximadamente 3B activos por token, lo que reduce el coste computacional por paso de decodificacion manteniendo la capacidad del modelo completo. Sobre esa base, LLMs For All produjo Millie-1.1-35B-A3B-Ternary, una variante con cerca del 90 % de los pesos en representacion ternaria y el resto en mayor precision; Slomin no modifica ningun tensor del modelo de lenguaje, solo reescribe los metadatos `general.*` del GGUF, y afirma haber verificado que todos los tensores son identicos byte a byte al origen.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base. La innovacion tecnica destacable esta en la capa de inferencia: kernels CUDA propios para ejecutar pesos ternarios a alta velocidad, conversion del proyector de vision a Q8_0 para que pueda residir en GPU, y una plantilla de chat (Sharp, de peculiar-ragdoll, Apache-2.0) que fuerza un bloque de sistema de brevedad porque el modelo tiende a ser verboso. El despliegue usa un unico slot con 131.072 tokens de contexto y cache KV cuantizada en q8_0.

## Capacidades

- Generacion de texto y razonamiento general en ingles y chino.
- Generacion y asistencia de codigo, con orientacion explicita a tareas de programacion (el nombre "CODER" y las tareas fijas de evaluacion del autor).
- Vision: procesamiento de capturas de pantalla y fotografias mediante proyector multimodal; el autor declara verificacion a plena profundidad de contexto.
- Tool calling / function calling: verificado en la configuracion de 12 GB; el autor reporta 1,2 s por turno de llamada a herramienta.
- Contexto largo de 131.072 tokens en un unico slot, adecuado para conversaciones multi-turno extensas o ficheros grandes.
- Plantilla de chat concisa que reduce la longitud de las respuestas por defecto.
- Compatibilidad con la API de OpenAI (`/v1`) a traves del servidor llama.cpp incluido.

## Casos de uso

- Asistencia de codigo interactiva en estacion de trabajo: con 161-179 tok/s de decodificacion en una RTX 3090, la latencia por token es de unos 6 ms, lo que permite autocompletado y refactorizacion en un bucle fluido sin salir de una GPU de 12 GB.
- Revision de repositorios y ficheros largos: la ventana de 131.072 tokens permite cargar varios modulos o un diff extenso en una sola peticion; el autor advierte que la version estandar (no Fast) es mas solida en trabajo multi-paso sobre repositorios.
- Analisis de capturas de pantalla e interfaz: el proyector de vision residente en GPU permite enviar imagenes de UI, diagramas o errores visuales junto al texto para diagnosticos tecnicos.
- Agentes con herramientas en local: el tool calling verificado y la API compatible con OpenAI permiten conectarlo a frameworks de agentes (LangChain, LlamaIndex, clientes propios) apuntando a `http://127.0.0.1:8080/v1`.
- Asistente de documentacion tecnica bilingue: al cubrir ingles y chino, sirve para traducir y mantener documentacion entre ambos idiomas, aunque no cubre castellano de forma nativa.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse integramente en una GPU consumer sin offloading ni llamadas externas, encaja en flujos donde el codigo no puede salir de la maquina.
- Prototipado rapido de chat con contexto largo: el arranque declarado de 8,0 s y el unico slot simplifican la puesta en marcha de demos y pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta metricas de inferencia y de tareas propias:

| Metrica | Valor declarado (RTX 3090, envolvente de 11.836 MiB) |
|---|---|
| Decodificacion | 161-179 tok/s |
| Prefill | 2.199 tok/s a 60k de contexto |
| VRAM pico | 11.373 MiB (462 MiB libres) |
| Tiempo de carga | 8,0 s |
| Turno con imagen | 2,2 s |
| Turno de tool call | 1,2 s |
| Comparativa interna | 2,4x mas rapido que Potato-CODER-12GB en seis tareas fijas |

## Requisitos de hardware

- VRAM: pico de 11.373 MiB; el autor fija una envolvente de 11.836 MiB (12 GB menos 452 MiB de reserva para escritorio y driver). No hay offloading de pesos a RAM del sistema.
- GPU recomendadas: RTX 3090 es la configuracion probada por el autor; cualquier GPU NVIDIA con 12 GB o mas y driver 570+ (Linux) o 551+ (Windows) deberia encajar, aunque solo Linux con RTX 3090 esta verificado en GPU.
- GPU consumer: si, en tarjetas de 12 GB o superiores; por debajo de 12 GB no cabe el modelo mas cache KV y proyector.
- Despliegue: exclusivamente mediante el fork de llama.cpp "potato" (Fast CUDA runtime, version potato-millie-v1.0.0-rc3) para Linux x64 (glibc 2.35+) y Windows x64. Los binarios estandar de llama.cpp, Ollama, vLLM o TGI no pueden servir este modelo ternario; el comando `:Q8_0` autogenerado por Hugging Face corresponde al proyector, no al modelo.
- Latencia y throughput: los indicados en la tabla anterior, medidos con un unico slot y contexto de 131.072 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Potato-CODER-12GB-Fast | ~35B totales / ~3B activos, ~90 % ternario | 131.072 | Apache-2.0 | GGUF, runtime llama.cpp fork | Vision y tool calling en 12 GB; rendimiento no verificado de forma independiente |
| Potato-CODER-12GB (mismo autor) | ~35B / ~3B activos | 131.072 | Apache-2.0 | GGUF, runtime llama.cpp fork | Version estandar; el autor la considera mas fuerte en trabajo multi-paso sobre repositorios y 2,4x mas lenta en sus pruebas |
| Millie-1.1-35B-A3B-Ternary (LLMs For All) | ~35B / ~3B activos, ternario | no disponible | no disponible | GGUF | Modelo de lenguaje de origen; Potato reutiliza sus tensores sin cambios y anade proyector y receta |
| Qwen3.6-35B-A3B (base) | ~35B / ~3B activos | no disponible | no disponible | safetensors y otras | Modelo original de Qwen; el Potato deriva de el via Millie |

No se dispone de datos de benchmarks que permitan comparar calidad entre estas variantes.

## Limitaciones y advertencias

- Rendimiento declarado por el autor y no verificado de forma independiente; solo hay pruebas en GPU sobre Linux con RTX 3090. En Windows, el CI del proyecto solo compila el backend CUDA y prueba inferencia en CPU y el lanzador.
- Dependencia de un runtime no estandar: sin los kernels del fork "potato", el modelo ternario no se puede servir; esto limita portabilidad, soporte y actualizaciones futuras.
- Idiomas: solo ingles y chino declarados; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad ni de tasas de error.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad en la informacion disponible.
- El autor senala que el modelo es verboso por defecto y que la plantilla concisa es un parche; sin ella, las respuestas se alargan y consumen contexto.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar los terminos del modelo base Qwen3.6-35B-A3B y de Millie, cuyas condiciones no se detallan en la informacion proporcionada.
- Un unico slot de servicio: no esta pensado para atender peticiones concurrentes multiples sin desplegar varias instancias.
- Repositorio con 0 likes y 567 descargas en la fecha de consulta: ecosistema pequeno, poca validacion comunitaria y riesgo de abandono del fork.

## Enlaces

- Hugging Face: https://huggingface.co/Slomin/Potato-CODER-12GB-Fast
- Version estandar: https://huggingface.co/Slomin/Potato-CODER-12GB
- Modelo ternario de origen: https://huggingface.co/llmsforall/Millie-1.1-35B-A3B-Ternary
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Runtime llama.cpp "potato": https://github.com/potato-os/llama.cpp/releases/tag/potato-millie-v1.0.0-rc3
- Plantillas Sharp de chat: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Documentacion de Hugging Face CLI: https://huggingface.co/docs/huggingface_hub/installation
