# qda-lab/QDA-Qwen3.6-35B-A3B-W3A16

## Resumen

QDA-Qwen3.6-35B-A3B-W3A16 es una cuantizacion de 3 bits de los pesos del modelo Qwen/Qwen3.6-35B-A3B, desarrollada por qda-lab mediante su herramienta QDA (Closed-Loop LLM Quantization Design with Agents). El objetivo es reducir el coste de despliegue del modelo original: pasa de 71,9 GB en BF16 a 17,3 GB, un factor de compresion de 4,2x, manteniendo segun el autor el 94,5 % de la precision del modelo de referencia. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 35.951.822.704 parametros totales, arquitectura `qwen3_5_moe` y capacidad multimodal image-text-to-text.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de ~36.000 millones de parametros en GPUs de 80 GB (H100, A100) e incluso en tarjetas profesionales como la L40S o la RTX Pro 6000, algo inviable con los pesos en BF16. La cuantizacion no es uniforme: los pesos se almacenan como enteros de 3 bits en grupos de 128, con la cabeza de salida y los embeddings de tokens a 4 bits, mientras que los routers MoE y los expertos compartidos permanecen en BF16. El formato es propietario (compressed-tensors W3A16) y, en el momento de la publicacion, solo es compatible con vLLM.

La licencia es Apache-2.0, igual que el modelo base, lo que facilita el uso comercial. El repositorio tiene 17,3 GB y 271 descargas en el momento de la consulta. No se dispone de informacion sobre los idiomas soportados en los metadatos del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), familia Qwen3.6 (`qwen3_5_moe`); multimodal image-text-to-text |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W3A16: pesos a 3 bits en grupos de 128; cabeza de salida y embeddings de tokens a 4 bits; routers MoE y expertos compartidos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (W3A16); libreria transformers |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura Mixture-of-Experts, segun el tag `qwen3_5_moe`, con 35.951.822.704 parametros totales. La cuantizacion parte de un checkpoint de 3 bits generado con el codigo oficial de GSQ (IST-DASLab/GSQ, paper arXiv:2604.18556) a partir de la revision `995ad96eacd98c81ed38be0c5b274b04031597b0` de Qwen3.6-35B-A3B. Sobre ese punto de partida, el pipeline QDA aplica una receta de cuatro etapas (`ace`, `h`, `i`, `soup`) que afina por destilacion las escalas de grupo de la cuantizacion; la receta fue seleccionada mediante busqueda automatizada de QDA.

El resultado mantiene los routers MoE y los expertos compartidos en BF16 para preservar el enrutamiento, mientras que el resto de pesos se comprime a 3 bits con escalas por grupo de 128 elementos. La cabeza de salida y los embeddings de tokens se mantienen a 4 bits. El proceso de construccion se ejecuto en 2x H100 de 80 GB, con la etapa `soup` en CPU; la variante `-i` usa atencion SDPA en lugar de eager para ajustarse a tarjetas de 80 GB, por lo que los pesos reconstruidos no son identicos bit a bit al checkpoint publicado. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre el dataset de calibracion o destilacion mas alla de que se incluye un texto de calibracion por defecto y cuatro conjuntos de trazas de destilacion en el dataset de recetas.

## Capacidades

- Generacion de texto y razonamiento en modo thinking (el razonamiento termina en ``), con modo thinking activado en todas las evaluaciones publicadas.
- Razonamiento matematico de competicion: evaluado en AIME 2025 y HMMT Feb 2026.
- Razonamiento cientifico de nivel experto: evaluado en GPQA-Diamond.
- Generacion de codigo: evaluado en LiveCodeBench.
- Seguimiento de instrucciones: evaluado en IFBench.
- Conocimiento general y razonamiento multietapa: evaluado en MMLU-Pro.
- Capacidad multimodal image-text-to-text (segun el pipeline tag del modelo).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Decodificacion especulativa / MTP: el modelo base la contempla, pero las evaluaciones publicadas se hicieron con MTP y decodificacion especulativa desactivados.

## Casos de uso

- Razonamiento matematico asistido: el modelo conserva 87,6 puntos en AIME 2025 frente a 90,0 del BF16, por lo que es adecuado para tutoria o verificacion de soluciones matematicas en entornos con presupuesto de VRAM limitado, siempre que se acepte una perdida de ~2,4 puntos.
- Analisis cientifico y QA experto: con 82,0 en GPQA-Diamond (frente a 85,3 en BF16), puede emplearse en asistentes de investigacion que respondan preguntas de fisica, quimica o biologia de nivel doctoral en una unica GPU de 80 GB.
- Generacion de codigo en pipelines de CI/CD: 73,6 en LiveCodeBench permite integrarlo como revisor o generador de parches, aunque la caida de 7,8 puntos respecto al BF16 desaconseja usarlo como unico generador en produccion sin validacion posterior.
- Despliegue en GPUs profesionales de gama media: al ocupar 17,3 GB, cabe en L40S (48 GB) o RTX Pro 6000, lo que permite servir un MoE de ~36.000 millones de parametros en estaciones de trabajo sin recurrir a A100/H100.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye recetas reproducibles (`qda build`), lo que lo convierte en un banco de pruebas para investigar el impacto de W3A16 en tareas de razonamiento.
- Seguimiento de instrucciones en asistentes: 61,7 en IFBench (frente a 66,4 en BF16) lo hace util para tareas de formato y restricciones estrictas donde el ahorro de memoria prima sobre la precision absoluta.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text permite extraer y razonar sobre contenido visual, aunque no se han publicado benchmarks especificos de vision para esta cuantizacion.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Modo thinking activado, pass@1 promediado sobre 1-32 semillas, mismas condiciones para ambos modelos.

| Benchmark | BF16 (71,9 GB) | QDA W3A16 (17,3 GB) |
|---|---|---|
| AIME 2025 | 90,0 | 87,6 |
| HMMT Feb 2026 | 82,7 | 75,9 |
| GPQA-Diamond | 85,3 | 82,0 |
| IFBench | 66,4 | 61,7 |
| MMLU-Pro | 84,9 | 82,7 |
| LiveCodeBench | 81,4 | 73,6 |
| Media | 81,8 | 77,2 |

Ajustes de evaluacion: max new tokens 81.920 (32.768 en MMLU-Pro); repeticiones 32 semillas en AIME y HMMT, 16 en GPQA e IFBench, 1 en MMLU-Pro, 4 en LiveCodeBench; sampling con temperature 1.0, top-p 0.95, top-k 20, min-p 0, presence penalty 1.5, repetition penalty 1.0; MTP y decodificacion especulativa desactivados.

## Requisitos de hardware

- VRAM estimada para inferencia: 17,3 GB de pesos en W3A16; el autor indica que funciona en GPUs de 80 GB (H100, A100) y en L40S y RTX Pro 6000. No se especifica la VRAM total necesaria incluyendo cache KV.
- GPUs validadas por el autor: NVIDIA H100, A100, L40S, RTX Pro 6000 y B200. En una GB300 el arranque tardo 340 s con el toolkit CUDA 13 disponible.
- Cabe en GPU de consumo: no confirmado. El autor no menciona RTX 4090 ni otras tarjetas de 24 GB; el formato W3A16 requiere kernels especificos que solo se documentan para vLLM.
- Opciones de despliegue: exclusivamente vLLM en el momento de la publicacion (SGLang no soporta aun el formato de 3 bits). El comando indicado es `VLLM_DISABLED_KERNELS=MacheteLinearKernel vllm serve qda-lab/QDA-Qwen3.6-35B-A3B-W3A16`.
- Requisito adicional: sin toolkit CUDA 13 en la maquina, la compilacion del kernel W3A16 falla (`failed to open libnvrtc-builtins.so.13.0`); hay que anadir las librerias NVIDIA del entorno virtual a `LD_LIBRARY_PATH`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Precision publicada |
|---|---|---|---|---|---|
| QDA-Qwen3.6-35B-A3B-W3A16 | 35.951.822.704 | no disponible | Apache-2.0 | safetensors W3A16 | 77,2 de media en 6 benchmarks |
| Qwen/Qwen3.6-35B-A3B (BF16) | 35.951.822.704 | no disponible | Apache-2.0 | safetensors BF16 | 81,8 de media en los mismos 6 benchmarks |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el modelo base en BF16, con una perdida media de 4,6 puntos y una reduccion de tamano de 71,9 GB a 17,3 GB. No se han publicado comparaciones con otras tecnicas de cuantizacion (por ejemplo, AWQ, GPTQ o GGUF de 4 bits) en la informacion disponible.

## Limitaciones y advertencias

- Perdida de precision no uniforme: la mayor caida se da en LiveCodeBench (-7,8 puntos) y HMMT Feb 2026 (-6,8), mientras que en GPQA-Diamond solo pierde 3,3 puntos. El uso en tareas de codigo o matematicas de competicion debe validarse con datos propios.
- Compatibilidad restringida: solo funciona en vLLM; SGLang no soporta el formato W3A16. Requiere toolkit CUDA 13 o la configuracion manual de `LD_LIBRARY_PATH`.
- Los pesos reconstruidos con la receta publicada no son identicos bit a bit al checkpoint; la variante `-i` usa SDPA en lugar de eager, con las mismas matematicas pero bytes distintos.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplica el riesgo inherente del modelo base.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.6-35B-A3B.
- El modelo es multimodal (image-text-to-text), pero no se publican benchmarks de vision para la version cuantizada; el impacto de W3A16 en tareas visuales es desconocido.
- Las evaluaciones usan modo thinking y semillas concretas; los resultados pueden variar con otros ajustes de muestreo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.6-35B-A3B-W3A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset de recetas e inputs: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-Qwen3.6-35B-A3B-W3A16
- Repositorio QDA: https://github.com/humanfia/qda
- Paper QDA (arXiv:2611.23388): https://arxiv.org/abs/2611.23388
- Paper GSQ (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
