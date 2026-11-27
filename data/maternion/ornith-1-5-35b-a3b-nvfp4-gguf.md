# maternion/Ornith-1.5-35B-A3B-NVFP4-GGUF

## Resumen

Ornith-1.5-35B-A3B-NVFP4-GGUF es una conversion no oficial a formato GGUF del checkpoint multimodal Ornith-1.5-35B-A3B-NVFP4, publicado por el usuario independiente maternion. El modelo original lo desarrolla ornith-ai y se presenta como una evolucion de Ornith-1.0 (construido sobre Qwen3.5 y Gemma4 con preentrenamiento continuado y postentrenamiento adicional), ampliando el bucle de auto-mejora hacia la generacion conjunta de tareas, construccion de scaffolds y rollouts de soluciones mediante aprendizaje por refuerzo.

La particularidad de esta conversion es que preserva los pesos cuantizados originales sin descomprimir: las capas de atencion se mantienen en FP8 (F8_E4M3) con escalas por tensor y las capas FFN y de expertos MoE se mantienen en NVFP4 con super-bloques de 4,5 bits por peso. No hay recuantizacion ni calibracion imatrix, por lo que la perdida respecto al checkpoint original es nula. Esto la convierte en una referencia util para ejecutar el modelo mixto de 35 505 282 557 parametros totales en llama.cpp con un peso de 21,02 GiB.

El modelo es multimodal (image-text-to-text) y requiere un proyector de vision separado que se une en tiempo de ejecucion mediante `--mmproj`. La licencia es MIT. Esta conversion exige compilaciones de llama.cpp iguales o superiores a b12818 (commit a38695013), que introduce soporte de escalas de cuantizacion para FP8 y NVFP4; las versiones anteriores rechazan los tipos o cargan sin escalas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal con proyector de vision; derivada de Qwen3.5 y Gemma4 segun la model card del autor original |
| Parametros totales | 35 505 282 557 (35,5 B) |
| Parametros activos | no disponible (el nombre A3B sugiere ~3 B activos, no confirmado en la informacion) |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa `-c 4096`) |
| Tipos de cuantizacion | Mixta preservada: NVFP4 (241 tensores, 4,5 bpw, super-bloques de 36 B por 64 pesos), F8_E4M3 (130 tensores de atencion con escala F32 e input_scale F32), BF16 (72 tensores de embedding y cabeza de salida), F32 (811 tensores de escalas, normas y sesgos) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); incluye GGUF de texto y dos proyectores de vision en BF16/F32 |

## Arquitectura y entrenamiento

La model card del autor original describe Ornith-1.5 como una evolucion de Ornith-1.0, que a su vez se desarrollo sobre Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y postentrenamiento adicional. La innovacion declarada es la ampliacion del bucle de auto-mejora: en lugar de depender de un conjunto fijo de tareas curadas manualmente y de harnesses disenados a mano, el sistema genera continuamente nuevas tareas de entrenamiento, descubre estrategias eficaces para resolverlas y mejora la politica mediante aprendizaje por refuerzo (RL). La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO de forma explicita.

El checkpoint original es una mezcla de precision generada con ModelOpt: `hf_quant_config.json` lista 291 capas cuantizadas, de las cuales 130 son FP8 (todas las proyecciones de atencion) y 161 son W4A16_NVFP4 (expertos MoE y expertos compartidos, con group size 16). La conversion a GGUF no requirio parches porque las escalas FP8 son por tensor (un escalar, independiente del reordenamiento de cabezas V de Qwen3.5) y la mitad NVFP4 cubre solo proyecciones FFN y de expertos, sin reordenamiento de cabezas, de modo que `_generate_nvfp4_tensors()` las reempaqueta directamente en el layout de super-bloques de ggml. La verificacion se hizo leyendo los tipos de tensor del GGUF resultante con `GGUFReader`, no confiando en el codigo de salida del conversor.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` y el pipeline `image-text-to-text`.
- Comprension de imagenes y texto combinados (vision), mediante el proyector `mmproj` que se une en tiempo de ejecucion.
- Razonamiento y resolucion de tareas derivado del entrenamiento por RL sobre tareas generadas automaticamente, segun la model card del autor original.
- Arquitectura MoE con expertos compartidos, lo que sugiere enrutamiento eficiente, aunque el numero de parametros activos no esta confirmado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; la model card menciona rollouts de soluciones y scaffolds en el entrenamiento.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Analisis de documentos con imagenes en local: el modelo acepta texto e imagen a traves del proyector `mmproj` y puede ejecutarse en llama.cpp sobre CPU, CUDA/HIP o Metal, lo que permite procesar capturas, diagramas o formularios sin enviar datos a la nube.
- Asistente conversacional autoalojado: con licencia MIT y pesos de 21,02 GiB, es viable desplegar un asistente multi-turno en infraestructura propia sin restricciones comerciales de licencia.
- Prototipado de agentes con razonamiento multi-paso: el entrenamiento por RL sobre tareas generadas y rollouts sugiere capacidad para resolver problemas compuestos; se puede integrar en un harness propio en llama.cpp.
- Evaluacion de tecnicas de cuantizacion mixta: al preservar NVFP4 y FP8 sin recuantizar, sirve como referencia para comparar calidad frente a versiones GGUF recuantizadas con `llama-quantize`.
- Despliegue en estaciones de trabajo con GPU de 24 GB o mas: el archivo de 21,02 GiB cabe en tarjetas como RTX 4090 o A6000, permitiendo inferencia local con vision.
- Investigacion sobre modelos auto-mejorados: util para reproducir y estudiar el comportamiento de un modelo entrenado con generacion automatica de tareas y RL, comparandolo con su version base.
- Integracion en pipelines de codigo y texto: aunque no se confirma tool calling, el modelo puede usarse para generacion de texto y analisis de imagenes dentro de flujos automatizados en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el GGUF de texto ocupa 21,02 GiB; el proyector de vision anade 0,84 GiB. Para cargar todo en GPU se necesitan aproximadamente 22 GiB, mas overhead de contexto KV.
- No cabe en tarjetas de 16 GB. En esos casos la model card recomienda sustituir `-ngl 99` por `--fit on` y dejar `-ngl` sin especificar, ya que `--fit` solo ajusta argumentos no pasados por el usuario.
- GPU recomendadas: tarjetas con 24 GB o mas (RTX 4090, A6000, A100, H100). En A100/H100 cabe holgadamente y permite contextos mayores.
- Backends soportados: CPU, CUDA/HIP (ROCm) y Metal aplican las escalas correctamente.
- Vulkan no esta soportado todavia: el backend rechaza cualquier matmul con escala de peso (`ggml_get_src_scale()` -> `supports_op()` false), por lo que los tensores caen silenciosamente a CPU y la inferencia se ralentiza. Hay un PR abierto (vulkan: add fp8 and scaled matmul support, #29791).
- Opciones de despliegue: llama.cpp (obligatorio build b12818 o superior, commit a38695013). No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-NVFP4-GGUF (esta ficha) | 35,5 B totales | no disponible | MIT | GGUF mixto NVFP4/FP8/BF16 | Conversion no oficial, requiere llama.cpp b12818+ |
| ornith-ai/Ornith-1.5-35B-A3B-NVFP4 | 35,5 B totales | no disponible | MIT | ModelOpt (checkpoint original) | Checkpoint oficial mixto de precision |
| ornith-ai/Ornith-1.5-35B-A3B-GGUF | 35,5 B totales | no disponible | MIT | GGUF | GGUF oficial; incluye el proyector BF16 usado aqui |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Conversion no oficial: no esta afiliada ni respaldada por ornith-ai; el autor original no la ha validado.
- Requiere llama.cpp build b12818 o superior (commit a38695013). Las versiones hasta b12816 fallan al cargar o rechazan los tipos de tensor. Se puede comprobar con `llama-cli --version`.
- Vulkan no funciona correctamente: los tensores con escala caen a CPU y la inferencia se ralentiza drasticamente.
- `llama-quantize` no puede recuantizar este archivo, ya que los tensores NVFP4 y FP8 son tipos de almacenamiento con escalas externas; debe tratarse como una referencia mixta de ~4,5/8 bpw.
- No cabe en GPU de 16 GB; en esas tarjetas hay que usar `--fit on`.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero aplicables a cualquier modelo generativo.
- Idiomas soportados no confirmados; el rendimiento fuera del ingles o del castellano no esta garantizado.
- Numero de parametros activos y longitud de contexto no confirmados; el ejemplo usa `-c 4096`, que puede no ser el maximo.
- La model card del autor original esta truncada en la informacion proporcionada, por lo que pueden faltar detalles sobre entrenamiento y evaluacion.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/maternion/Ornith-1.5-35B-A3B-NVFP4-GGUF
- Modelo base oficial: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-NVFP4
- GGUF oficial con proyector BF16: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Blog de Ornith: https://ornith.ai/ornith_1_5.html
- Commit de llama.cpp requerido: https://github.com/ggml-org/llama.cpp/commit/a38695013
- PR de soporte de escalas FP8/NVFP4: https://github.com/ggml-org/llama.cpp/pull/28898
- PR abierto de soporte Vulkan: https://github.com/ggml-org/llama.cpp/pull/29791
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
