# nace-ai/Hy4-flash-GGUF

## Resumen

Hy4-flash es un modelo de generacion de texto desarrollado por Tencent, publicado en Hugging Face bajo la licencia Tencent Hy License 1.0. El repositorio analizado, `nace-ai/Hy4-flash-GGUF`, es una cuantizacion comunitaria del modelo original `tencent/Hy4-flash` realizada por Nace.AI, que distribuye cuatro variantes GGUF optimizadas para inferencia con llama.cpp. El modelo base cuenta con 218.938.353.741 parametros totales (unos 219 mil millones) segun los pesos en safetensors del modelo original.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de gran escala en hardware mas modesto mediante cuantizacion agresiva: la variante mas pequena, IQ3_XXS, ocupa 87,8 GB a 3,21 bits por peso, mientras que la mas grande, Q4_K_M, alcanza 127,22 GB a 4,6 bits por peso. Nace.AI aplica una tecnica propia denominada Nace Weight Space Quantization, que asigna precision por clase de peso y rebalancea los pesos antes de la compresion, con el objetivo de preservar la calidad del modelo original con el menor coste de almacenamiento posible.

El modelo incluye componentes especiales como tablas Engram (tablas de lookup que deben almacenarse junto a los pesos) y capacidades de razonamiento configurables mediante el parametro `reasoning_effort`. La informacion disponible no detalla la arquitectura interna ni la longitud de contexto del modelo base, por lo que estos datos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 218.938.353.741 (unos 219 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 4096`) |
| Tipos de cuantizacion | IQ3_XXS (3,21 bpw), Q3_K_M (3,9 bpw), IQ4_XS-4.48bpw (4,48 bpw), Q4_K_M (4,6 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License, Version 1.0 (incluye terminos comerciales de la Seccion 10 para grandes operadores de Model-as-a-Service) |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo base `tencent/Hy4-flash` (si es un transformer denso, un modelo MoE o una arquitectura hibrida). Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Lo que si se documenta es la presencia de tablas Engram, que en las variantes cuantizadas se almacenan con precision especifica: Q4_0 en IQ3_XXS, IQ4_NL en Q3_K_M y Q4_K_M, y una tabla Engram IQ4_NL en IQ4_XS-4.48bpw, que se recuantiza desde Q8 conservando tensores de mayor precision.

La innovacion tecnica destacable de esta publicacion es la Nace Weight Space Quantization, que asigna precision por clase de peso y rebalancea los pesos antes de comprimir. Segun la model card, esta estrategia permite que IQ3_XXS tenga menor divergencia KL que el fichero IQ2 de 84,7 GB de AtomicChat sobre los mismos textos, y que IQ4_XS-4.48bpw presente la menor KL de todos los ficheros medidos de su tamano o inferior. Las mediciones se realizaron sobre 37 variantes de cuantizacion, 11 textos y 5.621 tokens puntuados.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Razonamiento configurable mediante el parametro `reasoning_effort`, con la opcion `no_think` documentada en el ejemplo de ejecucion.
- Generacion de codigo, evidenciada por la evaluacion con LiveCodeBench (39/100 en la variante IQ3_XXS).
- Inferencia local mediante llama.cpp, con soporte de plantillas de chat (`--chat-template-kwargs`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de vision y MTP mencionado indirectamente en la model card (los tamanos del grafico excluyen vision/MTP), aunque no se detalla su funcionamiento.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion local de modelos de gran escala: investigadores con estaciones de trabajo de 128 GB de memoria pueden cargar Q4_K_M y comparar su comportamiento con el modelo original en safetensors, usando la divergencia KL publicada como referencia de fidelidad.
- Generacion de codigo en entornos aislados: la variante IQ3_XXS, de 87,8 GB, permite ejecutar un modelo de 219 mil millones de parametros en un servidor con una o dos GPU de gran memoria y obtener codigo mediante llama.cpp, con un rendimiento medido de 39/100 en LiveCodeBench.
- Prototipado de asistentes conversacionales: la etiqueta `conversational` y el soporte de plantillas de chat permiten integrar el modelo en un chatbot local para pruebas de concepto sin depender de APIs externas.
- Despliegue con control de razonamiento: el parametro `reasoning_effort` permite alternar entre modo de razonamiento y modo directo (`no_think`), util para ajustar latencia y coste computacional segun la tarea.
- Investigacion sobre cuantizacion: el repositorio incluye datos comparativos de 37 variantes con puntuaciones KL, lo que lo convierte en un banco de pruebas para estudiar el impacto de distintas estrategias de cuantizacion en modelos de gran escala.
- Inferencia en infraestructura con memoria unificada: las variantes de menor tamano pueden ejecutarse en sistemas con memoria compartida CPU-GPU, aunque el rendimiento sera limitado por el ancho de banda de memoria.
- Fine-tuning o adaptacion posterior: al estar disponible el modelo base en safetensors, es posible partir de el para ajustes especificos y despues cuantizar con el flujo de Nace.AI.

## Benchmarks y rendimiento

| GGUF | Bits por peso | Tamano de descarga | LiveCodeBench |
|---|---:|---:|---|
| IQ3_XXS | 3,21 | 87,8 GB | 39/100 |
| Q3_K_M | 3,9 | 107,49 GB | no disponible |
| IQ4_XS-4.48bpw | 4,48 | 122,58 GB | no disponible |
| Q4_K_M | 4,6 | 127,22 GB | no disponible |

La model card reporta ademas comparaciones de divergencia KL: IQ3_XXS tiene menor KL que el fichero IQ2 de 84,7 GB de AtomicChat sobre los mismos textos, e IQ4_XS-4.48bpw presenta la menor KL de todos los ficheros medidos de su tamano o inferior. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos el tamano del fichero GGUF mas el overhead de contexto y cache KV. IQ3_XXS requiere unos 88 GB; Q4_K_M, unos 128 GB.
- GPU recomendadas: para IQ3_XXS, configuraciones multi-GPU como 2x A100 80 GB o 2x H100 80 GB; para Q4_K_M, al menos 2x H100 80 GB o 4x A100 40 GB. La model card menciona una build CUDA de llama.cpp usada para la ejecucion de LiveCodeBench, sin especificar la GPU exacta.
- No cabe en GPU de consumo convencionales (RTX 4090 con 24 GB, RTX 3090 con 24 GB) en ninguna de las variantes publicadas. Solo seria viable en sistemas con memoria unificada de gran capacidad o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp, concretamente la build de Little0o0 en el commit `0a054d0b02454c998e068381d15f3f6615bdd987` con `-DGGML_CUDA=ON`. No se documenta soporte para vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles. El ejemplo de la model card usa `-ngl 999` y `-c 4096`, lo que sugiere descarga completa de capas en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash (base) | 218,9 mil millones | no disponible | safetensors | Tencent Hy License 1.0 | Hugging Face (`tencent/Hy4-flash`) |
| Hy4-flash-GGUF (esta ficha) | 218,9 mil millones | no disponible | GGUF (4 variantes) | Tencent Hy License 1.0 | Hugging Face (`nace-ai/Hy4-flash-GGUF`) |
| AtomicChat IQ2 de Hy4-flash | no disponible | no disponible | GGUF IQ2 (84,7 GB) | no disponible | mencionado en la model card |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de fidelidad respecto al modelo original; la model card cuantifica esta perdida mediante divergencia KL, pero no garantiza un comportamiento equivalente en todas las tareas.
- El rendimiento en codigo medido (39/100 en LiveCodeBench para IQ3_XXS) indica margen de mejora y sugiere que la variante de menor precision puede degradar tareas complejas.
- La licencia Tencent Hy License 1.0 incluye terminos comerciales especificos en su Seccion 10 para grandes operadores de Model-as-a-Service, lo que puede restringir el uso comercial a gran escala. Es necesario revisar `LICENSE`, `NOTICE` y `MODIFICATIONS.md`.
- El repositorio ocupa 598,3 GB, lo que exige planificacion de almacenamiento antes de la descarga.
- La model card no documenta los idiomas soportados, los sesgos conocidos ni las tasas de alucinacion del modelo.
- El ejemplo de ejecucion depende de una build especifica de llama.cpp (fork de Little0o0 en un commit concreto); otras builds pueden no cargar correctamente las tablas Engram.
- No se dispone de informacion sobre tool calling, agentes o razonamiento multi-paso, por lo que no debe asumirse su soporte en produccion sin validacion previa.
- El contexto documentado en el ejemplo es de 4096 tokens; no se confirma una ventana mayor, lo que limita casos de uso que requieran contexto largo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Hy4-flash-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Sitio de Nace.AI: https://www.nace.ai/
- Fork de llama.cpp utilizado: https://github.com/Little0o0/llama.cpp/tree/0a054d0b02454c998e068381d15f3f6615bdd987
- Datos comparativos de cuantizacion: `assets/combined-kl.json` (en el repositorio)
- Licencia: `LICENSE` (en el repositorio)
- Aviso legal: `NOTICE` (en el repositorio)
- Modificaciones: `MODIFICATIONS.md` (en el repositorio)
