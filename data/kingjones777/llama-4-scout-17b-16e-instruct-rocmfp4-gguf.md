# kingjones777/Llama-4-Scout-17B-16E-Instruct-ROCmFP4-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF en formato ROCmFP4 del modelo Llama 4 Scout 17B-16E Instruct de Meta, creada por el usuario kingjones777. Se trata de la primera build ROCmFP4 de Llama 4 Scout, diseñada específicamente para la arquitectura gráfica AMD gfx1151, presente en las APU Ryzen AI MAX+ 395 (Strix Halo). El objetivo es permitir la ejecución local de un modelo MoE de 109 000 millones de parámetros totales (17 000 millones activos) en hardware AMD sin necesidad de GPUs NVIDIA.

El modelo base, Llama 4 Scout, es un modelo multimodal nativo de Meta que combina texto e imágenes mediante una arquitectura de mezcla de expertos con 16 expertos y un experto activo por token. Esta cuantización reduce el peso original BF16 de 200,8 GiB a 56,98 GiB, empleando un formato de punto flotante de 4 bits específico de ROCm (Q4_0_ROCMFP4_COHERENT, ftype 102) que solo es compatible con el fork de llama.cpp denominado ROCmFPX. La relevancia de esta build radica en que abre la puerta a ejecutar un modelo de gran tamaño en equipos AMD de consumo, aunque con limitaciones importantes en el pipeline de visión y sin soporte de decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 16 expertos, 1 activo por token, 48 capas, hidden 5120, vision patch 14 |
| Parametros totales | 107 769 861 184 (109B) |
| Parametros activos | 17B (16 expertos, 1 activo por token) |
| Longitud de contexto | no disponible (no especificada en la informacion disponible) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT (ftype 102); output.weight y token_embd.weight en q6_K |
| Idiomas soportados | ingles (en) |
| Licencia | Llama 4 Community License (llama4) |
| Formato de pesos | GGUF (archivo unico de 56,98 GiB) |

## Arquitectura y entrenamiento

El modelo base Llama 4 Scout es un autoregressive language model con arquitectura MoE de 16 expertos y un solo experto activo por token, lo que reduce el coste computacional por inferencia a pesar de sus 109B parametros totales. Incorpora fusion temprana (early fusion) para el procesamiento nativo de imagenes junto con texto, con un patch de vision de 14 píxeles. El modelo fue entrenado por Meta con un cutoff de conocimiento no especificado en la informacion disponible.

Esta cuantizacion concreta se genero a partir del GGUF BF16 de unsloth (200,8 GiB, 5 shards), verificado byte a byte contra el Hub, por lo que no es una requantizacion ni una reconversion propia. La receta empleada fue `--output-tensor-type q6_K --token-embedding-type q6_K ... Q4_0_ROCMFP4_COHERENT 16`, que protege la cabeza de salida (output.weight) y las embeddings (token_embd.weight) manteniendolas en q6_K mientras el resto de tensores se cuantizan en el formato ROCmFP4 de 4 bits. El formato Q4_0_ROCMFP4_COHERENT (ftype 102) es exclusivo del fork ROCmFPX de llama.cpp y no es reconocido por el llama.cpp estandar, que reporta `invalid ggml type`. El modelo no incluye tensores de cabezal de decodificacion especulativa (MTP/EAGLE/nextn), por lo que no es posible acelerar la inferencia con speculative decoding.

## Capacidades

- Generacion de texto y razonamiento basico: probado con operaciones aritmeticas (17×23 = 391), preguntas de cultura general (capital de Japon = Tokyo) y calculo de dias en un año bisiesto (2024 = 366).
- Comprension de imagenes a resolucion reducida: el pipeline de vision funciona correctamente con imagenes de 256×256, identificando colores, formas y disposicion espacial (por ejemplo, "cuadrado rojo, circulo verde, triangulo azul").
- Multimodalidad nativa: el modelo base acepta entradas de texto e imagen combinadas, aunque esta cuantizacion solo ha sido probada con imagenes sinteticas.
- Soporte de tool calling y function calling: no evaluado en esta build; el modelo base de Meta lo soporta, pero no hay evidencia de que funcione correctamente con esta cuantizacion.
- Capacidades multilingues: solo se declara ingles (en); no se ha probado con otros idiomas.
- Modo thinking o razonamiento extendido: no disponible; no se menciona ninguna variante con thinking mode.

## Casos de uso

- Inferencia local en hardware AMD de consumo: el caso principal de esta build es ejecutar un modelo de 109B parametros en una APU Ryzen AI MAX+ 395 (Strix Halo) con 56,98 GiB de memoria unificada, alcanzando 17,72 tok/s de decodificacion. Es adecuado para entornos sin GPUs NVIDIA donde se necesita un modelo de gran tamano con capacidades multimodales.
- Asistente conversacional en ingles: el modelo puede mantener dialogos multi-turno en ingles con razonamiento basico, util para prototipos de chatbots locales en equipos AMD.
- Clasificacion y descripcion de imagenes a baja resolucion: con imagenes de 256×256, el modelo identifica colores, formas y disposicion espacial, lo que permite tareas de descripcion simple de imagenes sinteticas o diagramas pequenos.
- Educacion y demostraciones de IA: por su capacidad de ejecutarse en una APU integrada, es util para talleres y demostraciones de modelos MoE multimodales sin necesidad de infraestructura en la nube.
- Pruebas de concepto de aplicaciones multimodales: desarrolladores pueden validar flujos de trabajo que combinan texto e imagen en local antes de migrar a despliegues en la nube con el modelo base.
- Investigacion sobre cuantizacion FP4 en ROCm: esta build sirve como referencia para estudiar el impacto del formato ROCmFP4 en la calidad de salida y el rendimiento en hardware AMD, aunque no se han publicado metricas formales de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card del autor incluye unicamente pruebas de humo:

| Prueba | Resultado |
|---|---|
| 17 × 23 | 391 (correcto) |
| Capital de Japon | Tokyo (correcto) |
| Dias en 2024 | 366 (correcto) |
| Vision: imagen 256×256 solida roja | "Red." (correcto) |
| Vision: imagen 256×256 con formas | Identifica color, forma y disposicion (correcto) |
| Vision: imagen 512×512 | Falla con `failed to encode image slice` |

Rendimiento medido en Ryzen AI MAX+ 395 (gfx1151, ROCm) con `-ngl 999 -c 4096 -fa off -fit off --mmproj`:

| Metrica | Valor |
|---|---|
| Decode (mediana de 3) | 17,72 tok/s (17,69 / 17,72 / 17,74) |
| Tiempo de carga en frio | 48 s |
| Tiempo de carga en caliente | 22 s |

No se realizaron pruebas de perplexity, ni de contexto largo, ni de tool calling, ni benchmarks de vision.

## Requisitos de hardware

- GPU especifica: AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo). Esta build no es compatible con otras arquitecturas; el formato ROCmFP4 COHERENT solo existe en el fork ROCmFPX de llama.cpp.
- VRAM / memoria: el archivo GGUF ocupa 56,98 GiB, por lo que se necesita al menos 57 GiB de memoria unificada disponible en la APU. En una Ryzen AI MAX+ 395 con 128 GiB de RAM unificada es viable.
- GPU consumer: no cabe en GPUs NVIDIA de consumo tipicas (RTX 4090 con 24 GiB, RTX 5090 con 32 GiB). Tampoco es compatible con GPUs AMD de generaciones anteriores (RX 7000, etc.) por requerir gfx1151.
- Opciones de despliegue: exclusivamente el fork `charlie12345/ROCmFPX` de llama.cpp. El llama.cpp estandar no carga el modelo (reporta `invalid ggml type`). Se requiere `-fa off` (flash attention desactivada) porque la atencion flash rompe el pipeline de vision en gfx1151.
- Latencia y throughput: 17,72 tok/s de decodificacion medidos en la APU de referencia, con 48 s de carga en frio y 22 s en caliente.
- Alternativas de despliegue: no se mencionan vLLM, Ollama ni TGI en la informacion disponible; el formato GGUF y el ftype 102 limitan el despliegue al fork ROCmFPX.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Llama 4 Scout 17B-16E Instruct (base BF16) | 109B | 17B | no especificado | BF16 (200,8 GiB) | Llama 4 Community | Hugging Face |
| Esta build ROCmFP4 | 109B | 17B | no especificado | Q4_0_ROCMFP4 (56,98 GiB) | Llama 4 Community | Hugging Face |
| Llama 4 Scout 17B-16E Instruct (GGUF Q4_K_M estandar) | 109B | 17B | no especificado | Q4_K_M (~71,7 GiB segun llmrun.dev) | Llama 4 Community | Hugging Face |
| Llama 4 Maverick 17B-128E Instruct | 109B | 17B | no especificado | varias | Llama 4 Community | Hugging Face |

La diferencia clave frente a una cuantizacion GGUF estandar (Q4_K_M) es que esta build utiliza un formato FP4 especifico de ROCm que reduce el tamano a 56,98 GiB (frente a ~71,7 GiB) y esta optimizada para la arquitectura gfx1151, pero a cambio pierde compatibilidad con el ecosistema llama.cpp estandar y con otras GPUs. Frente al modelo base BF16, el ahorro de espacio es de 143,8 GiB, pero no se ha verificado la perdida de calidad (no hay pruebas de perplexity).

## Limitaciones y advertencias

- Compatibilidad restringida: el modelo solo carga con el fork `charlie12345/ROCmFPX` de llama.cpp; el llama.cpp estandar reporta `invalid ggml type`. Cualquier actualizacion del fork puede romper la compatibilidad.
- Flash attention desactivada obligatoria: se requiere `-fa off`; activar flash attention rompe el pipeline de vision en gfx1151.
- Vision limitada a 256×256: imagenes de 512×512 o mayores provocan `failed to encode image slice` y el servidor muere. Es necesario redimensionar las imagenes antes de enviarlas.
- Sin decodificacion especulativa: no hay tensores MTP/EAGLE/nextn, por lo que no se puede acelerar la inferencia con speculative decoding.
- Calidad no verificada: no se han realizado pruebas de perplexity, ni evaluaciones de contexto largo, ni de tool calling, ni benchmarks de vision. Las unicas pruebas son de humo con respuestas correctas.
- Sesgos y alucinaciones: no se ha evaluado el comportamiento del modelo en este formato; el modelo base de Meta puede presentar sesgos y alucinaciones tipicos de modelos de lenguaje grandes, pero no hay datos especificos para esta cuantizacion.
- Idioma: solo se declara ingles; el rendimiento en otros idiomas es desconocido.
- Licencia: Llama 4 Community License, que impone restricciones de uso comercial y requiere aceptacion de los terminos de Meta. El autor de la cuantizacion indica que se hereda la licencia del modelo base.
- Sin soporte de produccion: al ser una build experimental de un tercero, no hay garantias de estabilidad ni mantenimiento. No se recomienda para entornos de produccion sin validacion exhaustiva.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/kingjones777/Llama-4-Scout-17B-16E-Instruct-ROCmFP4-GGUF
- Modelo base en Hugging Face: https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E-Instruct
- Modelo base sin instrucciones: https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Documentacion de Llama 4 Scout en Groq: https://console.groq.com/docs/model/llama-4-scout-17b-16e-instruct
- Recetas vLLM para Llama 4 Scout: https://recipes.vllm.ai/meta-llama/Llama-4-Scout-17B-16E-Instruct
- Requisitos de hardware segun llmrun.dev: https://llmrun.dev/model/meta-llama-llama-4-scout-17b-16e-instruct
