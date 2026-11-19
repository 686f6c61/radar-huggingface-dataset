# akopytko/Qwen3.8-27B-NVFP4-GGUF

## Resumen

Qwen3.8-27B-NVFP4-GGUF es una cuantizacion de 4 bits en formato NVFP4 del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario akopytko. El modelo base, desarrollado por Alibaba Qwen, es un transformer denso de 27.320.698.242 parametros (unos 27,3 mil millones) con pipeline image-text-to-text, es decir, acepta imagenes y texto como entrada. Esta version concreta no es un modelo nuevo, sino un artefacto de pesos optimizado para GPUs NVIDIA Blackwell (RTX 50 series, DGX Spark, B200, B300) que busca maximizar la velocidad de prefill en llama.cpp sin sacrificar demasiado la fidelidad respecto al modelo bf16 original.

La relevancia de esta ficha esta en que documenta una tecnica de cuantizacion especifica (NVFP4 con busqueda de escala MSE en tiempo de cuantizacion, sin escalas globales por tensor) que corre con la version publicada de llama.cpp sin parches, e incluye una cabeza MTP (multi-token prediction) cuantizada tambien en NVFP4 para decodificacion especulativa. El autor reporta un 50% mas de velocidad de prefill que cuantizaciones de 4 bits convencionales y hasta 152 t/s de decodificacion con MTP activado en una RTX 5090.

El repositorio ocupa 57,3 GB e incluye varias variantes (NVFP4 propia, una build NVIDIA NVFP4 con Q6_K, un Q6_K casi sin perdida y el proyector multimodal en BF16). La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), base Qwen3.8-27B; cuantizacion NVFP4 con MTP draft head embebida |
| Parametros totales | 27.320.698.242 (27,3 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 (4 bits float, UE4M3 con busqueda MSE), Q6_K (casi sin perdida), proyector multimodal BF16; build NVIDIA NVFP4 con escalas Q6_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors como formato del modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de aproximadamente 27,3 mil millones de parametros con capacidad multimodal (entrada de imagen y texto). No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. Lo que si esta documentado es el proceso de cuantizacion: el autor aplica NVFP4 con busqueda de escala en tiempo de cuantizacion para encontrar el codigo UE4M3 que minimiza el error de reconstruccion, y prescinde de escalas globales por tensor para reducir el coste de computo (4-7% mas rapido que un NVFP4 estilo NVIDIA). La cuantizacion se reproduce con `llama-quantize Model-bf16.gguf Model-M4_0.gguf NVFP4` usando los PRs #23572 y #23692 de llama.cpp.

La innovacion tecnica destacable es la inclusion de una cabeza MTP (multi-token prediction) cuantizada en NVFP4, que permite decodificacion especulativa con `--spec-type draft-mtp --spec-draft-n-max 8 --spec-draft-p-min 0.8`. El autor reporta 152 t/s de decodificacion con 0,75 de aceptacion del draft en prompts tipicos, un incremento de aproximadamente 1,6x. Ademas, el repositorio incluye una variante Q6_K que, combinada con la cabeza MTP NVFP4, aprovecha la verificacion de tokens del modelo principal para no degradar la salida.

## Capacidades

- Generacion de texto conversacional y razonamiento general, heredado del modelo base Qwen3.8-27B.
- Entrada multimodal de imagenes: el autor indica que la entrada de imagen funciona directamente al cargar con `-hf`, o bien anadiendo `--mmproj mmproj-BF16.gguf`.
- Decodificacion especulativa mediante MTP embebida, con ajustes recomendados documentados.
- Inferencia en llama.cpp sin necesidad de parches en la version publicada.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Tool calling, agentes, capacidades multilingues y modo thinking: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Despliegue local en GPUs Blackwell para asistentes conversacionales: al ser un GGUF que corre en llama.cpp sin cambios, se puede servir con la version publicada y aprovechar el prefill rapido para conversaciones multi-turno; la ventana de contexto concreta no esta documentada, por lo que conviene validarla antes de disenar prompts largos.
- Procesamiento de imagenes en local: con `--mmproj mmproj-BF16.gguf` el modelo acepta entradas de imagen, util para tareas de descripcion, extraccion de informacion o preguntas sobre capturas y documentos escaneados en entornos con GPU de consumo Blackwell.
- Generacion de codigo asistida en estaciones de trabajo con RTX 50 series: el footprint de 14,63 GiB (4,60 BPW) del NVFP4 permite mantener el modelo residente en VRAM junto con el proyector y la cabeza MTP, liberando el resto para el entorno de desarrollo.
- Prototipado rapido de pipelines multimodales: la variante Q6_K casi sin perdida (KLD 0,002857) sirve para validar calidad antes de decidir si se acepta la perdida del NVFP4 en produccion.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye benchmarks de KLD y acuerdo top-p frente al bf16, lo que lo hace util como referencia reproducible para equipos que investigan NVFP4 frente a Q4_0 y Q6_K.
- Servicio de inferencia de baja latencia en DGX Spark o B200/B300: la combinacion de prefill a 6258-6432 t/s (pp2048) y decodificacion de 152 t/s con MTP lo hace adecuado para cargas interactivas donde el tiempo hasta el primer token importa.
- Fine-tuning o destilacion sobre el modelo base: los pesos safetensors del modelo original (27,3 B, Apache 2.0) permiten partir del bf16 y cuantizar despues con la receta documentada.

## Benchmarks y rendimiento

Rendimiento medido por el autor en llama.cpp con flags por defecto (`-b 2048 -ub 512`) y de maximo throughput (`-b 8192 -ub 4096`), sobre RTX 5090 a 575 W de stock:

| Modelo | pp2048, ubatch 512 | pp2048, ubatch 4096 | tg128 |
|---|---|---|---|
| Esta NVFP4 | 6258,74 +/- 15,37 | 6432,25 +/- 143,73 | 87,45 +/- 0,27 |
| Unsloth NVFP4 | 6018,71 +/- 13,97 | 5998,72 +/- 95,34 | 87,69 +/- 0,27 |
| NVIDIA + Q6_K | 4643,32 +/- 66,89 | 4555,66 +/- 66,20 | 79,51 +/- 0,08 |
| Q4_0 | 4139,00 +/- 4,31 | 4173,82 +/- 28,23 | 87,90 +/- 0,29 |
| Unsloth Q4_0 | 4156,58 +/- 7,61 | 4146,54 +/- 38,64 | 87,01 +/- 0,09 |
| Unsloth Q6_K | 3215,89 +/- 3,89 | n/a | 62,49 +/- 0,33 |

Calidad medida como KLD y acuerdo top-p frente al bf16 sobre wikitext (perplejidad base 6,7945):

| Modelo | KLD medio | Same top-p |
|---|---|---|
| N4_0 | 0,066254 +/- 0,000702 | 88,525 +/- 0,141% |
| Unsloth NVFP4 | 0,070824 +/- 0,000733 | 88,061 +/- 0,144% |
| NVIDIA + Q6_K | 0,039314 +/- 0,000432 | 90,784 +/- 0,128% |
| Q4_0 sin imatrix | 0,037877 +/- 0,000448 | 91,461 +/- 0,124% |
| Unsloth Q4_0 | 0,028317 +/- 0,000330 | 92,698 +/- 0,115% |
| Unsloth Q6_K | 0,002857 +/- 0,000051 | 97,506 +/- 0,069% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el NVFP4 ocupa 14,63 GiB (4,60 BPW) para los pesos principales; hay que sumar el proyector multimodal BF16 y la cabeza MTP NVFP4, mas la KV cache segun contexto.
- GPU imprescindibles: NVIDIA Blackwell, es decir, RTX 50 series, DGX Spark, B200 o B300. El autor indica que sin una de estas GPUs no se puede usar plenamente.
- Cabe en GPU de consumo: si, en RTX 5090 (benchmarks reportados a 575 W); en modelos de 16 GB de VRAM de la serie 50 el margen sera muy ajustado al sumar proyector, MTP y KV cache.
- Despliegue: llama.cpp con la version publicada (sin parches); carga directa con `-hf akopytko/Qwen3.8-27B-NVFP4-GGUF` o con `--mmproj mmproj-BF16.gguf` para vision. vLLM, TGI y Ollama: no disponible en la informacion proporcionada.
- Throughput: prefill 6258-6432 t/s (pp2048) y decodificacion 87,45 t/s sin MTP; 152 t/s con MTP a 0,75 de aceptacion. El autor reporta entre 4% y 7% mas rapido que el NVFP4 estilo NVIDIA y aproximadamente 50% mas rapido en prefill que cuantizaciones de 4 bits convencionales.
- Repositorio completo: 57,3 GB, incluyendo variantes Q6_K y NVIDIA-Q6_K; conviene descargar solo el tag necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / bits | Tamano | KLD (wikitext) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| akopytko NVFP4 (esta ficha) | 27,3 B | NVFP4, 4,60 BPW | 14,63 GiB | 0,066254 | Apache 2.0 | Hugging Face, requiere Blackwell |
| Unsloth Qwen3.8-27B-GGUF (Q4_0) | 27,3 B | Q4_0 mixto con imatrix | 14,95 GiB | 0,028317 | Apache 2.0 | Hugging Face, amplia compatibilidad |
| Unsloth Qwen3.8-27B-GGUF (Q6_K) | 27,3 B | Q6_K | no disponible | 0,002857 | Apache 2.0 | Hugging Face |
| nvidia/Qwen3.8-27B-NVFP4 (build Q6_K) | 27,3 B | NVFP4 NVIDIA con escalas Q6_K | no disponible | 0,039314 | Apache 2.0 | Hugging Face |

La comparativa muestra el compromiso tipico de NVFP4: gana en velocidad de prefill (6258 frente a 4139 t/s de Q4_0) pero pierde en fidelidad frente a Q4_0 y Q6_K. La variante Q6_K del mismo repositorio es la opcion de maxima calidad.

## Limitaciones y advertencias

- Requiere hardware NVIDIA Blackwell: inutilizable en GPUs Ampere, Ada o anteriores, y en CPU.
- Peor fidelidad que Q4_0 y Q6_K: KLD 0,066254 y 88,525% de acuerdo top-p frente a 0,028317/92,698% de Unsloth Q4_0 y 0,002857/97,506% de Q6_K. Para tareas sensibles a la precision conviene usar la variante Q6_K.
- El propio autor reconoce que el patron de NVFP4 por debajo de Q4_0 es comun a todas las cuantizaciones NVFP4.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben evaluarse sobre el modelo base.
- Idiomas soportados y longitud de contexto: no disponibles; validar antes de desplegar en produccion multilingue o con prompts largos.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.8-27B; revisar la model card original.
- La reproducibilidad de la cuantizacion depende de PRs concretos de llama.cpp (#23572 y #23692); versiones futuras pueden cambiar el comportamiento.
- La ganancia de MTP depende de la tasa de aceptacion del draft (0,75 reportado en prompts tipicos); en dominios muy distintos puede caer.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akopytko/Qwen3.8-27B-NVFP4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build NVIDIA NVFP4: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Cuantizaciones Unsloth de referencia: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- PR llama.cpp #23572: https://github.com/ggml-org/llama.cpp/pull/23572
- PR llama.cpp #23692: https://github.com/ggml-org/llama.cpp/pull/23692
