# mrtint0729/kanana-1.5-2.1b-diary-dpo-gguf

## Resumen

kanana-1.5-2.1b-diary-dpo-gguf es una cuantización GGUF Q4_K_M de un ajuste fino especializado del modelo coreano kakaocorp/kanana-1.5-2.1b-instruct-2505, publicado por el usuario mrtint0729. El modelo está entrenado específicamente para generar entradas de diario en coreano a partir de descripciones de fotos y lugares de un día, dentro de la aplicación Alpharium. El ajuste combina LoRA SFT (339 ejemplos, rank 16, alpha 32) con DPO (596 pares, beta 0.2) para alinear el estilo y reducir errores gramaticales y de anclaje visual.

El modelo resuelve un problema muy concreto: la generación de diarios en coreano en dispositivos móviles con menos de 2 GiB de RAM, ejecutándose en secuencia tras un VLM pequeño (LFM2.5-VL-450M) que produce los subtítulos de las fotos. Con 2.087 millones de parámetros y un archivo de 1.393.511.456 bytes, está pensado para inferencia local con llama.cpp, no para servidores de alto rendimiento.

Su relevancia es limitada y muy específica: no es un modelo generalista, sino un componente de producto con contrato de salida estricto (estilo haeyo, sin letras latinas, sin especulación visual). Para cualquier uso fuera de la generación de diarios en coreano, su valor es marginal frente al modelo base sin ajustar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de kanana-1.5-2.1b-instruct-2505; detalles no disponibles) |
| Parametros totales | 2.086.984.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en la configuración de referencia del autor (n_ctx=2048) |
| Tipos de cuantizacion | GGUF Q4_K_M (único publicado) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de kakaocorp/kanana-1.5-2.1b-instruct-2505, un transformer decoder-only de 2.1B parámetros. Sobre esa base se aplicó un ajuste LoRA SFT v3 con 339 ejemplos (rank 16, alpha 32) y posteriormente DPO v3 con 596 pares de preferencia (1.5 épocas, beta 0.2, nll_weight 0.5 con anclaje KL/NLL). El objetivo del DPO es doble: fijar el registro "haeyo" (terminaciones en ~요) y penalizar la especulación visual y los errores de partículas tras sustantivos sin consonante final (과/와, 을/를, 이/가, 으로/로).

La innovación técnica no está en la arquitectura, sino en el contrato de salida y en el proceso de evaluación: se documentan tres conjuntos de prueba (13 casos sintéticos, 10 casos con VLM real y 10 held-out) con métricas de aceptación, recall de subtítulos, alucinación, errores gramaticales y grounding estricto. Además, el autor reporta que una gramática GBNF que bloquea letras latinas (`root ::= [^A-Za-z]*`) no altera la salida (10/10 idénticos con y sin gramática), lo que indica que el ajuste ya internaliza la restricción. También se verifica diversidad con tres semillas (Jaccard 0.214–0.412, sin repeticiones exactas en 9/9 casos).

## Capacidades

- Generación de texto en coreano con registro "haeyo" consistente.
- Generación de entradas de diario a partir de un prompt estructurado con número de fotos, momento del día, lugar y subtítulos de imágenes.
- Generación de títulos de diario en un segundo turno (contrato `titleQuestion`).
- Anclaje a vocabulario visual concreto (objetos y escenas descritos en los subtítulos), con supresión de referencias temporales o visuales no respaldadas.
- Manejo correcto de partículas tras sustantivos sin consonante final.
- Salida sin letras latinas por diseño, verificada con gramática GBNF.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión nativa, audio ni modo de razonamiento extendido.
- Multilingüismo: solo coreano.

## Casos de uso

- Generación de diarios en apps móviles: el modelo recibe un prompt con metadatos del día y subtítulos de fotos y produce una entrada de diario en estilo haeyo. Es adecuado por su tamaño (1.4 GB en Q4_K_M) y su consumo de RAM inferior a 2 GiB, compatible con ejecución en el propio dispositivo.
- Pipeline VLM + LLM en dispositivos: se usa en secuencia tras un modelo de visión-lenguaje pequeño (LFM2.5-VL-450M) que describe las fotos; el LLM convierte esas descripciones en texto narrativo sin inventar objetos no descritos.
- Aplicaciones de journaling con privacidad local: al ejecutarse con llama.cpp en el dispositivo, los datos del usuario no salen del terminal, lo que encaja con productos de diario personal.
- Generación de títulos cortos: el segundo turno produce un título para la entrada, útil en interfaces de listado de diarios.
- Prototipado de asistentes de escritura en coreano con restricciones de estilo: sirve como referencia de cómo aplicar DPO para fijar registro y evitar errores de partículas.
- Evaluación de técnicas de alineación en modelos pequeños: los conjuntos de prueba documentados (33 casos con métricas de alucinación y grounding) permiten reproducir el proceso de validación en otros dominios cerrados.
- Integración en apps web o de escritorio vía llama-cpp-python: el autor documenta el flujo con `hf_hub_download` y `Llama(n_ctx=2048, n_gpu_layers=99)`, reutilizable en cualquier cliente Python.

## Benchmarks y rendimiento

Los datos publicados son evaluaciones internas del autor sobre contratos de salida, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se reproducen tal cual:

| Benchmark | Aceptación / haeyo / título | Recall / cobertura de subtítulos | Alucinación | Errores gramaticales / partículas | Grounding estricto |
|---|---|---|---|---|---|
| standard_13 (sintético, N=13) | 13 / 13 / 13 | 96.3% / 100.0% | 0.0% (0/13) | 0.0% (0/13) | 13/13 (100.0%) |
| exp_012 VLM real (N=10) | 10 / 10 / 10 | 99.2% / 100.0% | 0.0% (0/10) | 0.0% (0/10) | 10/10 (100.0%) |
| Held-out VLM real (N=10) | 10 / 10 / 10 | 99.2% / 100.0% | 0.0% (0/10) | 0.0% (0/10) | 10/10 (100.0%) |
| Total (N=33) | 33 / 33 / 33 | 96.3%–99.2% / 100.0% | 0.0% (0/33) | 0.0% (0/33) | 33/33 (100.0%) |

Prueba de diversidad FR-020a (3 casos × 3 semillas = 9 generaciones): similitud Jaccard por pares entre 0.214 y 0.412, sin coincidencias exactas (9/9), con judge, título, haeyo y grounding estricto correctos en 9/9. No hay benchmarks estándar publicados.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo Q4_K_M ocupa 1.393.511.456 bytes (1.298 GiB); con contexto de 2048 tokens la huella total se mantiene por debajo de 2 GiB, según el propio autor.
- GPU recomendadas: no se especifican. Al ser un modelo de 2.1B en Q4, cabe en GPUs de consumo con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 4090) y en Apple Silicon con memoria unificada.
- CPU: viable en CPU moderna con llama.cpp; el autor lo plantea como ejecución on-device en móvil.
- Opciones de despliegue: llama.cpp (`llama-completion`), llama-cpp-python, y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles. El autor fija `n_predict=512` y `n_ctx=2048` como configuración de referencia, pero no publica tiempos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| kanana-1.5-2.1b-diary-dpo-gguf | 2.087 M | 2048 (config. de referencia) | ko | Apache-2.0 | GGUF Q4_K_M | Ajuste DPO para diarios; sin benchmarks estándar |
| kakaocorp/kanana-1.5-2.1b-instruct-2505 | 2.087 M | no disponible | ko (principal) | Apache-2.0 | safetensors | Modelo base; uso generalista, sin especialización en diarios |
| Modelos coreanos pequeños de la misma familia (kanana-1.5) | no disponible | no disponible | ko | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación cuantitativa con alternativas no es posible: el autor no publica MMLU ni otros benchmarks estándar, y no se dispone de cifras verificadas de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para un contrato de prompt y salida concretos (diario en coreano, estilo haeyo, sin letras latinas). Fuera de ese formato su calidad no está validada.
- Idioma: solo coreano. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Contexto corto: la configuración de referencia usa 2048 tokens, insuficiente para conversaciones largas o documentos extensos.
- Riesgo de alucinación: el autor reporta 0.0% en sus 33 casos, pero la muestra es pequeña y sintética en parte; no hay garantía fuera de la distribución evaluada.
- Sesgos: no se documentan análisis de sesgo. Al derivar de un modelo coreano, puede heredar sesgos culturales y lingüísticos del corpus original.
- Licencia: Apache-2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de ajuste, no detalladas.
- Producción: sin benchmarks estándar, sin métricas de latencia y con un único formato de cuantización, la evaluación previa a producción debe hacerse con datos propios.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrtint0729/kanana-1.5-2.1b-diary-dpo-gguf
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-2.1b-instruct-2505
- Repositorio de ingeniería del autor (`terrarium`, EXP-013): no disponible como enlace público en la información proporcionada
- Paper, blog o demo adicionales: no disponibles
