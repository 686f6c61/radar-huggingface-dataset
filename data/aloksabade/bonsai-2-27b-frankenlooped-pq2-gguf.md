# aloksabade/Bonsai-2-27b-Frankenlooped-PQ2-GGUF

## Resumen
Bonsai-2 27B Frankenlooped PQ2_0 es una variante GGUF publicada por el usuario aloksabade que combina dos ideas poco habituales: la cuantizacion ternaria de 2 bits con transformada de Hadamard (PQ2_0) del modelo prism-ml/Ternary-Bonsai-2-27B y una extension de profundidad por duplicacion de capas intermedias inspirada en la metodologia de looping transformer de DavidAU. El resultado es un modelo de aproximadamente 31.000 millones de parametros declarados (29.940.148.032 reales en safetensors) con 72 bloques en lugar de los 64 originales, empaquetado en unos 7,5 GB de VRAM.

El modelo parte de una base Qwen 3.5 con atencion hibrida/SSM, dimension de embedding de 5120 y una arquitectura de contexto nativo de hasta 262.144 tokens. Se distribuye como GGUF con cuantizacion PQ2_0, pensado para ejecutarse en GPUs de gama media y en hardware Intel Arc mediante SYCL o Vulkan, lo que lo hace relevante para escenarios donde la VRAM es el cuello de botella y se necesita contexto largo.

La ficha del autor lo presenta como un modelo "abliterated" y "uncensored" (sin rechazos), con soporte multimodal de vision mediante un proyector mmproj separado en F16. La licencia declarada es Apache 2.0. La informacion disponible proviene casi exclusivamente de la model card del autor y de los metadatos de Hugging Face, sin resultados de benchmarks de calidad tipo MMLU o HumanEval.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion/SSM, backbone Qwen 3.5, 72 capas (64 base + 8 duplicadas en mid-stack, capas 28-35), embedding_dim 5120 |
| Parametros totales | 29.940.148.032 (declarados como ~31B activos en la model card) |
| Parametros activos | No aplica (no es MoE); el autor declara ~31B "activos" por la duplicacion de capas |
| Longitud de contexto | Hasta 262.144 tokens nativos; recomendado 65.536-131.072 |
| Tipos de cuantizacion | PQ2_0 (Polar Quantization 2-bit con transformada de Hadamard); proyector de vision en F16 |
| Idiomas soportados | Ingles (tag `en` en la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 8,9 GB; footprint declarado ~7,5 GB) |

## Arquitectura y entrenamiento
La arquitectura es un transformer hibrido con componentes de atencion y SSM sobre un backbone Qwen 3.5, con 72 bloques. La innovacion principal es el "frankenloop": se duplican 8 capas de la zona media del stack (capas 28-35), anadiendo unos 4.000 millones de parametros y creando un ciclo de recurrencia en la parte asociativa del modelo antes de la consolidacion final de la representacion. Segun el autor, esto incrementa la densidad de razonamiento multi-paso y la seleccion de herramientas frente al modelo ternario original de 64 capas.

La cuantizacion PQ2_0 aplica una transformada de Hadamard sobre pesos ternarios de 2 bits, lo que reduce el footprint a unos 7,5 GB manteniendo, segun el autor, un rendimiento de generacion superior al de un modelo denso de 27B en Q4. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; el ajuste de alineacion se describe como "Heretic v2 / abliterated", es decir, un proceso de eliminacion de rechazos sobre el modelo base. El modelo se distribuye exclusivamente como GGUF y la model card marca `inference: false`, por lo que no esta pensado para cargarse con transformers directamente.

## Capacidades
- Generacion de texto conversacional con plantilla ChatML (`<|im_start|>` / `<|im_end|>`).
- Razonamiento multi-paso reforzado por la duplicacion de capas intermedias (frankenloop).
- Soporte de tool calling y function calling, segun la model card.
- Capacidad multimodal de vision mediante el proyector `Ternary-Bonsai-2-27B-mmproj-F16.gguf`.
- Contexto largo de hasta 256k tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Comportamiento "uncensored" y "abliterated": sin rechazos ante peticiones que otros modelos alineados rechazarian.
- Ejecucion en hardware Intel Arc mediante SYCL (oneAPI Level-Zero) y Vulkan (Mesa coopmat), ademas de los backends habituales de llama.cpp.
- Idioma principal: ingles. No hay datos sobre calidad en castellano ni en otros idiomas.

## Casos de uso
- Procesamiento de documentos largos en local: con 128k tokens de contexto y un KV cache cuantizado a q4_0, el modelo puede resumir o extraer informacion de contratos, informes o bases de codigo completas en una sola pasada, manteniendo todo el contexto en VRAM en una GPU de 24 GB.
- Asistente conversacional sin filtros en entornos de investigacion: el caracter abliterated lo hace util para estudiar comportamiento de modelos sin rechazos, red teaming y analisis de sesgos, siempre con las precauciones legales correspondientes.
- Agente con tool calling en estaciones de trabajo modestas: su footprint de 7,5 GB permite desplegar un agente multi-paso con function calling en una RTX 3060/4060 o una Intel Arc B580, liberando VRAM para el resto del pipeline.
- Analisis de imagenes con vision: usando el proyector mmproj en F16, se puede construir un pipeline de descripcion de imagenes, extraccion de texto de capturas o asistencia visual en hardware consumer.
- Prototipado rapido de aplicaciones LLM: la velocidad de prompt processing en SYCL (855 t/s en pp512) permite iterar con prompts largos sin esperas, util para desarrollo y evaluacion de prompts.
- Despliegue en infraestructura Intel: en entornos con GPUs Arc Pro B60, el backend SYCL ofrece el mejor rendimiento medido (32,3 t/s de generacion), lo que lo convierte en una opcion para equipos sin NVIDIA.
- Generacion de codigo asistida en local: aunque no hay benchmarks de HumanEval disponibles, el soporte de tool calling y el contexto largo permiten usarlo como asistente de codigo sobre repositorios completos en un equipo de sobremesa.

## Benchmarks y rendimiento
Los unicos datos disponibles son mediciones de `llama-bench` realizadas por el autor en una estacion HP Z4 G4 con Intel Arc Pro B60 (24 GB GDDR6, Battlemage G21) sobre PCIe Gen 3, usando la rama `llama.cpp-prism`. No hay resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.).

| Modelo | Backend | VRAM | Prompt processing (pp512) | Generacion (tg64) |
|---|---|---|---|---|
| Bonsai-2 27B Frankenloop (72L) | SYCL (oneAPI Level-Zero) | 7,46 GiB | 855,26 t/s | 32,29 t/s |
| Bonsai-2 27B Frankenloop (72L) | Vulkan (Mesa coopmat) | 7,46 GiB | 394,28 t/s | 24,27 t/s |
| Ternary-Bonsai-2 27B vanilla (64L) | SYCL | 6,70 GiB | 956,42 t/s | 36,43 t/s |
| Ternary-Bonsai-2 27B vanilla (64L) | Vulkan | 6,70 GiB | 413,25 t/s | 10,90 t/s |
| Qwen 3.8 27B denso (Q4) | SYCL | 15,60 GiB | ~420,00 t/s | ~14,20 t/s |
| Qwen 3.8 27B denso (Q4) | Vulkan | 15,60 GiB | ~320,00 t/s | ~13,50 t/s |

Segun el autor, la duplicacion de capas cuesta aproximadamente un 11 % de throughput en SYCL (32,3 frente a 36,4 t/s) y el modelo PQ2_0 genera unas 2,3 veces mas rapido que un denso de 27B en Q4 ocupando menos de la mitad de VRAM. Estas cifras son mediciones del propio autor y no han sido replicadas de forma independiente.

## Requisitos de hardware
- VRAM estimada: unos 7,5 GB para los pesos en PQ2_0; el KV cache de 128k tokens con `-ctk q4_0 -ctv q4_0` cabe en los aproximadamente 15 GB restantes de una GPU de 24 GB.
- GPU recomendadas: Intel Arc Pro B60 (24 GB), Arc B580/B60; NVIDIA RTX 3060/4060 (12 GB o mas) segun el autor; Apple Silicon.
- Cabe en GPUs consumer: si, en RTX 3060/4060 y en Intel Arc de gama media, siempre que se ajuste el contexto al presupuesto de VRAM.
- Opciones de despliegue: llama.cpp (rama `llama.cpp-prism`), backends SYCL y Vulkan; no se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: 32,29 t/s de generacion y 855,26 t/s de prompt processing en SYCL sobre Arc Pro B60; 24,27 t/s y 394,28 t/s en Vulkan.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Cuantizacion | VRAM | Licencia | Notas |
|---|---|---|---|---|---|---|
| Bonsai-2 27B Frankenlooped (este) | ~31B (29,94B reales) | 256k | PQ2_0 2-bit | ~7,5 GB | Apache 2.0 | 72 capas, abliterated, vision |
| prism-ml/Ternary-Bonsai-2-27B | ~27B | no disponible | Ternaria | ~6,7 GB | no disponible | Base de este modelo, 64 capas |
| mradermacher/Qwen3.8-27B-Uncensored-v3 | ~27B | no disponible | GGUF (varias) | no disponible | no disponible | Referencia comparativa citada por el autor |
| Qwen 3.8 27B denso en Q4 | ~27B | no disponible | Q4 | ~15,6 GB | no disponible | ~14,2 t/s en SYCL, sin loop ni abliteration |

## Limitaciones y advertencias
- No hay benchmarks de calidad publicados (MMLU, HumanEval, GSM8K); el rendimiento real en tareas de razonamiento no esta verificado de forma independiente.
- El modelo es "abliterated" y "uncensored": no rechaza peticiones daninas, lo que implica riesgos legales y eticos si se despliega sin moderacion externa.
- Idioma principal ingles; no hay datos sobre calidad en castellano ni en otros idiomas.
- La model card marca `inference: false`; requiere llama.cpp con la rama `llama.cpp-prism` para el formato PQ2_0, lo que limita la compatibilidad con otros runtimes.
- Las mediciones de rendimiento proceden unicamente de hardware Intel Arc; el comportamiento en CUDA o ROCm es una extrapolacion del autor.
- La duplicacion de capas es una tecnica experimental (frankenmerge/frankenloop) sin validacion academica; puede degradar la coherencia en tareas fuera de distribucion.
- Riesgo de alucinacion no cuantificado; al ser un modelo sin alineacion de rechazos, la verbosidad y la confianza excesiva son riesgos plausibles.
- La licencia Apache 2.0 se declara en los metadatos, pero los modelos base de la cadena tienen licencias no detalladas en la informacion disponible; conviene verificar la cadena completa antes de uso comercial.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/aloksabade/Bonsai-2-27b-Frankenlooped-PQ2-GGUF
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Referencia comparativa: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-v3-GGUF
- Inspiracion arquitectonica: https://huggingface.co/DavidAU/Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored
