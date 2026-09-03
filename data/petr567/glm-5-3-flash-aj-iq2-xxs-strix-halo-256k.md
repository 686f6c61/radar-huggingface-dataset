# petr567/GLM-5.3-Flash-AJ-IQ2-XXS-Strix-Halo-256K

## Resumen

Este repositorio no contiene los pesos del modelo, sino un perfil de despliegue reproducible y medido para ejecutar la cuantizacion `AJ-IQ2_XXS` del modelo `GLM-5.3-Flash` mediante `llama.cpp` con backend Vulkan. El autor, `petr567`, ha configurado y validado un entorno de ejecucion especifico para hardware AMD Strix Halo (APU Ryzen AI MAX+ 395 con Radeon 8060S y 128 GB de memoria unificada), con una ventana de contexto de 262.144 tokens.

El modelo base, `zai-org/GLM-5.3-Flash`, es un modelo de texto de la familia GLM 5, con arquitectura `glm5next` y capacidades de razonamiento y tool calling. Este perfil concreto demuestra que es posible ejecutar una cuantizacion agresiva (IQ2_XXS, 87,35 GB) con rendimiento util para agentes y generacion de codigo, incluyendo tool calling nativo funcional. La relevancia de esta ficha radica en que documenta un caso real de despliegue en hardware de consumo con memoria unificada, algo poco habitual para modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (glm5next) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | AJ-IQ2_XXS (87,35 GB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (2 shards) |

## Arquitectura y entrenamiento

El modelo base es `zai-org/GLM-5.3-Flash`, un modelo de la familia GLM 5 con arquitectura `glm5next`. Los detalles concretos de la arquitectura (numero de capas, dimensiones, atencion, etc.) no estan disponibles en la informacion proporcionada. El repositorio de `petr567` no documenta el proceso de entrenamiento del modelo base, sino que se centra en el despliegue de una cuantizacion existente.

La cuantizacion `AJ-IQ2_XXS` es una variante de cuantizacion de 2 bits (IQ2_XXS) aplicada por el usuario `aj9o9` en su repositorio `GLM-5.3-Flash-GGUF`. El perfil de despliegue utiliza KV cache en Q8_0, flash attention activada y MTP (multi-token prediction) desactivado, ya que en las pruebas realizadas la decodificacion sostenida fue mas rapida sin MTP en este hardware concreto.

## Capacidades

- Generacion de texto y razonamiento: el modelo base GLM-5.3-Flash esta disenado para tareas de texto y razonamiento, aunque no se proporcionan detalles especificos de sus capacidades.
- Tool calling nativo: verificado en este perfil. El modelo emitio correctamente una llamada a herramienta con argumentos tipados (`add_numbers(a=17, b=25)`), acepto el resultado devuelto y completo la respuesta.
- Longitud de contexto extendida: 262.144 tokens, validada en las pruebas de decodificacion con contexto largo.
- Soporte de agentes: el perfil se describe como adecuado para flujos de trabajo de agente directo y codificacion, gracias al tool calling funcional.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Agentes con tool calling en hardware unificado: el perfil permite ejecutar un agente que llama a herramientas de forma nativa. Por ejemplo, un agente que consulta una API de calculo o una base de datos, recibe el resultado y continua la conversacion. La validacion con `add_numbers` demuestra que el flujo completo funciona.
- Generacion de codigo asistida en entornos locales: con 256K de contexto, se puede proporcionar un repositorio completo o una base de codigo extensa como contexto y pedir al modelo que genere, modifique o explique codigo. El rendimiento de decodificacion (~12,89 tok/s) es suficiente para uso interactivo.
- Analisis de documentos largos: la ventana de 262.144 tokens permite procesar documentos extensos (libros, informes, legislacion) en una sola pasada, con prefill de 89,32 tok/s para 15.904 tokens de prompt.
- Asistente de programacion con contexto de proyecto: al poder incluir multiples archivos de un proyecto en el contexto, el modelo puede responder preguntas sobre el codigo existente, sugerir cambios o detectar problemas, con la ventaja de ejecutarse localmente sin enviar datos a la nube.
- Despliegue de un endpoint OpenAI-compatible local: el perfil incluye un servidor `llama-server` con API compatible con OpenAI en `http://127.0.0.1:8080/v1`, lo que permite integrar el modelo en herramientas existentes (LangChain, LlamaIndex, etc.) sin modificaciones.
- Investigacion y experimentacion con cuantizaciones extremas: este perfil documenta como ejecutar una cuantizacion IQ2_XXS de un modelo grande en hardware de consumo, lo que puede servir de referencia para otros investigadores que quieran evaluar el trade-off entre calidad y requisitos de hardware.

## Benchmarks y rendimiento

Los datos de rendimiento provienen de las pruebas realizadas por el autor en AMD Ryzen AI MAX+ 395 con Radeon 8060S (Strix Halo, `gfx1151`) y 128 GB de memoria unificada:

| Metrica | Resultado |
|---|---:|
| Contexto | 262.144 tokens |
| Decodificacion corta (256 tokens generados) | 12,89 tok/s |
| Decodificacion con contexto largo (15.904 tokens de prompt + 128 generados) | 9,67 tok/s |
| Prefill en frio (15.904 tokens de prompt) | 89,32 tok/s |
| Tool calling nativo | PASS (1/1) |
| Argumentos de herramienta | enteros tipados |
| Resultado de herramienta aceptado | si |
| Llamada repetida a herramienta | no |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado ocupa 87,35 GB. Ademas, la KV cache para 256K de contexto en Q8_0 requiere memoria adicional. En el sistema de pruebas, con 128 GB de memoria unificada, el conjunto completo cabe en memoria.
- GPU recomendada: AMD Ryzen AI MAX+ 395 con Radeon 8060S (Strix Halo, `gfx1151`). El perfil esta especificamente optimizado para esta APU y su backend Vulkan.
- GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, etc.) debido al tamano del modelo y la KV cache. Requiere hardware con gran cantidad de memoria unificada o multiples GPUs.
- Opciones de despliegue: el perfil incluye scripts para Docker con runtime `llama.cpp` compilado desde una rama especifica (`eauchs/llama.cpp` con soporte para GLM-5.3-Flash). Tambien se puede usar `llama-server` directamente.
- Latencia y throughput: decodificacion de 9,67 a 12,89 tok/s segun la longitud del contexto; prefill de 89,32 tok/s para un prompt de 15.904 tokens.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con modelos similares. El perfil esta disenado para un hardware muy especifico (Strix Halo) y una cuantizacion concreta (IQ2_XXS), por lo que no hay datos de rendimiento comparables con otras configuraciones o modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Hardware especifico: el perfil esta optimizado y probado unicamente en AMD Strix Halo (`gfx1151`). Puede no funcionar correctamente en otras GPUs o plataformas Vulkan.
- Cuantizacion agresiva: IQ2_XXS es una cuantizacion de 2 bits que puede degradar significativamente la calidad de las respuestas en comparacion con cuantizaciones mas altas o el modelo original en FP16. No se han proporcionado evaluaciones de calidad.
- MTP desactivado: el perfil desactiva la prediccion multi-token porque en este hardware concreto resultaba mas lenta. En otros sistemas, MTP podria ofrecer mejor rendimiento.
- Tool calling limitado: la prueba valido una unica llamada a herramienta con argumentos enteros. No se probaron llamadas repetidas, argumentos complejos (strings, arrays, objetos) ni flujos multi-herramienta.
- Requisitos de memoria: se necesitan al menos 128 GB de memoria unificada para el modelo (87,35 GB) mas la KV cache de 256K. Esto limita el despliegue a hardware muy especifico.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo base `zai-org/GLM-5.3-Flash` puede tener su propia licencia que no se detalla en este repositorio.

## Enlaces

- Repositorio del perfil: https://huggingface.co/petr567/GLM-5.3-Flash-AJ-IQ2-XXS-Strix-Halo-256K
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantizacion GGUF upstream: https://huggingface.co/aj9o9/GLM-5.3-Flash-GGUF
- Runtime fuente: https://github.com/eauchs/llama.cpp/tree/glm5next/add-glm-5.3-flash
