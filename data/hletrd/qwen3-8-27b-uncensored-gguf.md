# hletrd/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una redistribucion cuantizada en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario hletrd bajo el sello Xylolabs. El cambio principal respecto al modelo base es la eliminacion de la direccion de rechazo (refusal direction) de los pesos, una tecnica conocida como abliteration que reduce la probabilidad de que el modelo decline peticiones que el original rechazaria. Se distribuye en cinco niveles de cuantizacion (Q8_0, Q6_K, Q4_K_M, IQ4_XS y Q3_K_M) junto con los proyectores de vision en F16 y Q8_0, lo que preserva la capacidad multimodal image-text-to-text del modelo original.

El modelo cuenta con 27.320.697.856 parametros totales y mantiene la arquitectura del Qwen3.8-27B original, aunque la model card no detalla la arquitectura interna ni el proceso de entrenamiento. La ventana de contexto practica depende del fichero y del hardware: desde 32K en GPUs de 24 GB hasta 256K en aceleradores con 80 GB o mas.

Su relevancia actual radica en que ofrece una alternativa local y sin filtros del modelo base, ejecutable con llama.cpp en hardware de consumo (una RTX 4090 puede correr el Q4_K_M con 32K de contexto) y con licencia Apache 2.0, lo que facilita su integracion en flujos de trabajo que requieren despliegue en local o investigacion sobre comportamiento de modelos sin alineacion de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (hereda la del modelo base Qwen/Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 32K en 24 GB de VRAM; 128K en 48 GB; 256K en 80 GB o mas (segun tabla del autor) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M, IQ4_XS, Q3_K_M (con imatrix); proyectores de vision en F16 y Q8_0 |
| Idiomas soportados | Ingles (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo base Qwen/Qwen3.8-27B: no se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni el numero de capas, dimensiones de atencion o tipo de atencion. Tampoco se documentan los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) ni innovaciones tecnicas del modelo original.

Lo que si se documenta es el proceso de modificacion: se ha eliminado la direccion de rechazo de los pesos (abliteration), se han convertido a GGUF y se han cuantizado, incluyendo los proyectores de vision que habilitan la entrada de imagenes. Las cuantizaciones emplean imatrix, y el autor publica metricas de divergencia KL y acuerdo top-1 frente a los pesos BF16 del propio modelo modificado, lo que permite evaluar la perdida de fidelidad de cada nivel de cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla de chat compatible con llama.cpp (`--jinja`).
- Entrada de imagen (image-text-to-text) mediante los proyectores `mmproj` en F16 o Q8_0.
- Modo de razonamiento (thinking) activable o desactivable: el autor documenta `--chat-template-kwargs '{"enable_thinking":false}'` para responder directamente sin la pasada de razonamiento.
- Respuestas a peticiones que el modelo base rechazaria, gracias a la eliminacion de la direccion de rechazo.
- Soporte multilingue limitado a ingles y coreano segun los metadatos.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo permite estudiar como varia el comportamiento de un LLM al eliminar la direccion de rechazo de sus pesos, comparando respuestas con el modelo base en el mismo conjunto de prompts.
- Despliegue local en estacion de trabajo: con una RTX 4090 o RTX 3090 (24 GB) se puede ejecutar el Q4_K_M (16,6 GB) con 32K de contexto mediante llama.cpp, cubriendo asistentes de codigo y analisis de documentos sin depender de la nube.
- Procesamiento de documentos con imagenes: el proyector de vision permite pasar capturas, diagramas o paginas escaneadas junto con instrucciones de texto para extraccion de informacion o resumen.
- Generacion de contenido creativo sin restricciones de rechazo: util para escritura de ficcion, guiones o narrativa que aborde temas sensibles y que el modelo base declinaria.
- Servicio de inferencia en servidor: con una H100 (80 GB) o H200 (141 GB) se ejecuta el Q8_0 (29 GB) con 256K de contexto, adecuado para atencion al cliente con historiales largos o analisis de repositorios completos.
- Experimentacion en hardware Apple Silicon: un Mac Studio M5 Max o M5 Ultra con memoria unificada de 128 GB o mas ejecuta el Q8_0 con contexto completo, util para prototipado sin GPU dedicada.
- Evaluacion de cuantizaciones: las metricas KL y top-1 publicadas por el autor permiten seleccionar el nivel de cuantizacion segun el compromiso entre calidad y memoria para un pipeline concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente publica metricas de fidelidad de cuantizacion frente a los pesos BF16 del modelo modificado:

| Cuantizacion | Tamano | WikiText-2 KL | Top-1 | Chat KL | Top-1 | Held-out KL | Top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 29,047 GB | 0,001064 | 98,593% | 0,000521 | 99,091% | 0,001092 | 98,725% |
| Q6_K | 22,431 GB | 0,002484 | 97,652% | 0,001347 | 98,737% | 0,003059 | 97,931% |
| Q4_K_M | 16,564 GB | 0,011575 | 95,127% | 0,010301 | 97,379% | 0,019801 | 94,529% |
| IQ4_XS | 15,309 GB | 0,019903 | 93,534% | 0,014817 | 96,595% | 0,031508 | 93,441% |
| Q3_K_M | 13,501 GB | 0,055710 | 89,775% | 0,031113 | 94,672% | 0,088113 | 89,088% |

## Requisitos de hardware

- VRAM estimada: 13,5 GB (Q3_K_M), 15,3 GB (IQ4_XS), 16,6 GB (Q4_K_M), 22,4 GB (Q6_K) y 29,0 GB (Q8_0), mas 0,6-0,9 GB para el proyector de vision.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) con Q4_K_M y 32K de contexto; RTX 5090 (32 GB) con Q6_K y 32K.
- GPU de gama profesional: RTX 6000 Ada o dos GPUs de 24 GB (48 GB) con Q8_0 y 128K de contexto.
- GPU de centro de datos: H100 (80 GB), H200 (141 GB), B200 (192 GB) o B300 (288 GB) con Q8_0 y hasta 256K de contexto.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y M5 Ultra (256-512 GB) con Q8_0 y 256K.
- Despliegue: llama.cpp (compilacion con `-DGGML_CUDA=ON` para NVIDIA), usando el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior; binarios `llama-cli` y `llama-server`. No se documentan otros motores como vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo ni de sus alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas objetivas.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-GGUF (este) | 27,3B | 32K-256K segun hardware | GGUF | Apache 2.0 | Abliterated, multimodal, cuantizado con imatrix |
| Qwen/Qwen3.8-27B (base) | 27,3B | No disponible | No disponible | Apache 2.0 | Modelo original con rechazos intactos |
| Alternativas de ~27B abliterated en GGUF | No disponible | No disponible | GGUF | No disponible | No se han identificado en la informacion proporcionada |

## Limitaciones y advertencias

- La eliminacion de la direccion de rechazo puede aumentar la probabilidad de generar contenido danino, ofensivo o inexacto en areas sensibles; no es un modelo apto para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a los LLM, no cuantificado en la informacion disponible.
- Idiomas soportados limitados a ingles y coreano segun los metadatos; el rendimiento en castellano no esta documentado.
- La cuantizacion introduce perdida de calidad: el Q3_K_M baja al 89,1% de acuerdo top-1 en held-out, por lo que para tareas sensibles a la precision conviene Q6_K o Q8_0.
- La model card no documenta arquitectura, datos de entrenamiento ni benchmarks de tareas; la evaluacion del modelo base debe hacerse por separado.
- Licencia Apache 2.0 permite uso comercial, pero el autor indica que ha modificado los pesos y remite al fichero `NOTICE`; conviene revisar las obligaciones de atribucion del modelo base Qwen.
- Requiere una version concreta de llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior); versiones anteriores pueden no cargar el modelo o los proyectores de vision.
- El contexto maximo de 256K solo es alcanzable con 80 GB o mas de memoria; en GPUs de 24 GB el limite practico es 32K.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia: https://huggingface.co/hletrd/Qwen3.8-27B-Uncensored-GGUF/blob/main/LICENSE
- llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
