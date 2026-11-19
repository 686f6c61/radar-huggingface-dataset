# Enntity/DaisyRose-27B-NVFP4-GDN-Attn

## Resumen

DaisyRose-27B-NVFP4-GDN-Attn es un conjunto de pesos cuantizados en NVFP4 para las proyecciones Gated DeltaNet y de atención del modelo RadixArk/DaisyRose-27B, un fine-tune de Qwen/Qwen3.8-27B (27.000 millones de parámetros, Apache-2.0) desarrollado por el equipo Qwen de Alibaba Cloud. Lo publica el usuario Enntity como un overlay, no como un checkpoint completo: los ficheros se superponen sobre RadixArk/DaisyRose-27B-NVFP4 sustituyendo sus proyecciones FP8, de modo que cada paso de decodificación en un DGX Spark lee 2,4 GB menos.

La relevancia es de nicho pero concreta: reduce el coste de memoria y el ancho de banda por token en inferencia local sobre hardware Blackwell (DGX Spark), manteniendo el resto del modelo (MLP, embeddings, head, normas, convoluciones, torre de visión y cabeza MTP) tal como lo publicó RadixArk. La cuantización se hizo con GPTQ sobre la rejilla NVFP4 a partir de la release BF16, con calibración de 620.477 tokens y un error relativo medio de salida de 0,0017 sobre las entradas de calibración.

El resultado medido por el autor es un aumento de velocidad de decodificación de 43,7 a 50,2 tok/s (un 14,9 % más) con un coste de +0,0020 nats/token en NLL sobre datos retenidos, sin pérdida en las pruebas exactas de aritmética (40/40) y de agujas de dos saltos a ~24K de contexto (12/12). No es un modelo nuevo ni un fine-tune: es una pieza de infraestructura de cuantización para un motor de inferencia específico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas Gated DeltaNet (atención lineal) + 16 capas de atención completa (capas 3, 7, ..., 63); incluye torre de visión y cabeza MTP |
| Parámetros totales | 27B (heredados de RadixArk/DaisyRose-27B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | NVFP4 (E2M1 con escalas E4M3 por grupo de 16 y escala F32 por tensor) sobre las proyecciones GDN y de atención; el resto del checkpoint base permanece en FP8/BF16 según RadixArk |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (dos ficheros: `gdn.safetensors` 3,11 GB y `attn.safetensors` 0,94 GB); layout ModelOpt NVFP4, solo pesos, activaciones en BF16 |

## Arquitectura y entrenamiento

El modelo base combina 48 capas de Gated DeltaNet (una forma de atención lineal con estado recurrente) con 16 capas de atención completa distribuidas en el stack, además de una torre de visión y una cabeza MTP (multi-token prediction). Esta release no entrena nada: cuantiza a NVFP4 las proyecciones `in_proj_qkv`, `in_proj_z`, `out_proj` de las 48 capas GDN y `q_proj`, `k_proj`, `v_proj`, `o_proj` de las 16 capas de atención, partiendo de la release BF16 en el commit `293a7a2ab54aaea78098ee917c546390667521dc`.

El procedimiento es GPTQ clásico adaptado a la rejilla NVFP4. Se calibró con 620.477 tokens en 497 secuencias de hasta 2.048 tokens, renderizadas con el tokenizador y la plantilla de chat de DaisyRose, con mezcla de chat con razonamiento (OpenThoughts-114k, 183K), chat general (UltraChat 200k, 90K), tool calling (glaive-function-calling-v2, 72K), código fuente en doce lenguajes (94K), prosa en inglés de Wikipedia, arXiv y PubMed (63K), Wikipedia en otros diez idiomas (86K) y MATH (32K). Una pasada del modelo de texto en BF16 registra el segundo momento de la entrada de cada proyección (H = XᵀX) y después se aplica GPTQ con damping 0,1 × media de la diagonal de H, orden de columnas descendente por diagonal de H y bloques de 128. Las proyecciones que comparten entrada (`in_proj_qkv` con `in_proj_z`; `q_proj` con `k_proj` y `v_proj`) se barren conjuntamente conservando cada una su propia escala por tensor. Antes del barrido, cada grupo de 16 recibe la escala E4M3 de mínimo error cuadrático entre amax_g/6 × 0,80 y 1,75. El coste total fue de unos 25 minutos en un DGX Spark.

## Capacidades

Las capacidades funcionales son las del modelo base DaisyRose-27B, no las de esta release de cuantización; la información disponible no detalla la lista completa.

- Generación de texto y razonamiento con modo "thinking" activable (la plantilla de chat incluye líneas de sistema de esfuerzo de razonamiento).
- Tool calling / function calling (se usó glaive-function-calling-v2 en la calibración, lo que sugiere soporte en el modelo base).
- Generación de código en múltiples lenguajes (doce lenguajes representados en el conjunto de calibración).
- Razonamiento matemático (MATH presente en calibración; la sonda de calidad del autor incluye aritmética exacta).
- Procesamiento de visión (la torre de visión se mantiene tal como la publicó RadixArk, aunque esta release no la modifica).
- Capacidad multilingüe (diez idiomas además del inglés en la calibración).
- Predicción multi-token mediante cabeza MTP (usada por el motor SparkQwen con drafting DFlash2 y verificación exacta).
- Manejo de contexto largo: la sonda de agujas de dos saltos se evalúa a ~24K tokens.

## Casos de uso

- Inferencia local en DGX Spark: el caso de uso principal y documentado. Con SparkQwen y el perfil `27b-saver`, estas proyecciones reducen 2,4 GB la lectura por paso de decodificación y suben el throughput de 43,7 a 50,2 tok/s, lo que permite servir el modelo en un único dispositivo con más margen de memoria.
- Servicio de chat con razonamiento en hardware Blackwell: el modelo base soporta modo thinking y conversaciones multi-turno; la cuantización NVFP4 acelera la decodificación sin degradar las pruebas exactas de aritmética (40/40).
- Asistentes de código en local: el modelo base se calibró con código en doce lenguajes y el autor verifica NLL sobre fuente Python retenida (+0,0026 nats/token), lo que respalda su uso para autocompletado y generación en entornos sin conexión.
- Pipelines de tool calling y agentes: la calibración incluyó 72K tokens de glaive-function-calling-v2, y el motor SparkQwen soporta drafting especulativo con verificación exacta, adecuado para flujos multi-paso.
- Recuperación sobre documentos largos: las pruebas de agujas de dos saltos a ~24K tokens (12/12) indican que la cuantización no rompe la capacidad de localizar información en contexto extendido.
- Despliegue con requisitos estrictos de licencia: al ser Apache-2.0 sin cláusulas adicionales, encaja en productos comerciales que no pueden aceptar licencias con restricciones de uso.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia reproducible de GPTQ sobre rejilla NVFP4 para proyecciones de atención lineal, con código y tests de CPU publicados en el repositorio SparkQwen.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en un DGX Spark con el motor de 27B de SparkQwen (imagen Atlas 0.7.0-27b, perfil `27b-saver`, drafting DFlash2 con verificación exacta), frente a RadixArk/DaisyRose-27B-NVFP4 tal como se publicó:

| Métrica | DaisyRose-27B-NVFP4 publicado | Con estas proyecciones |
|---|---|---|
| Decodificación (6 prompts, 1 petición, thinking on, 1.024 tokens) | 43,7 tok/s | 50,2 tok/s |
| NLL en datos retenidos (32 chunks, 48.264 tokens; código +0,0026, prosa +0,0014) | referencia | +0,0020 nats/token |
| Aritmética (sonda de calidad, calificación exacta) | 40/40 | 40/40 |
| Agujas de dos saltos, ~24K contexto | 12/12 | 12/12 |

El autor indica que un primer conjunto con damping 0,01 y escalas 0,80–1,00 × amax_g/6 costaba +0,0045 nats/token y fallaba un ítem de aritmética, y no se publicó. Como referencia externa, las proyecciones de TandemLLM costaron +0,0039 nats/token al modelo base Qwen3.8-27B bajo el mismo motor cuando SparkQwen las adoptó. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) para esta release; las puntuaciones reportadas por RadixArk corresponden a los pesos BF16 y FP8 de DaisyRose.

## Requisitos de hardware

- VRAM: esta release no es un checkpoint autónomo; requiere cargar RadixArk/DaisyRose-27B-NVFP4 (27B) y superponer 4,05 GB de proyecciones NVFP4. El ahorro es de 2,4 GB de lectura por paso de decodificación respecto a las proyecciones FP8 originales.
- GPU recomendadas: NVIDIA DGX Spark (GB10, arquitectura Blackwell), único hardware validado por el autor. La rejilla NVFP4 requiere soporte nativo de FP4, disponible en Blackwell.
- GPU de consumo: no hay datos publicados sobre RTX 4090 (Ada) ni otras consumer; NVFP4 no es nativo en Ada, por lo que el motor SparkQwen y este formato no están validados fuera de Blackwell.
- Despliegue: exclusivamente mediante SparkQwen (`CHECKPOINT=daisyrose ./start.sh --model 27b`), que descarga el checkpoint base, estos ficheros y el drafter DFlash2, verifica los sha256 y sirve en `127.0.0.1:8893`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 50,2 tok/s en decodificación con 6 prompts greedy de 1.024 tokens de salida en un DGX Spark, frente a 43,7 tok/s del checkpoint publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato/cuantización | Rendimiento medido | Licencia |
|---|---|---|---|---|---|
| Enntity/DaisyRose-27B-NVFP4-GDN-Attn | 27B | no disponible | NVFP4 overlay sobre FP8 | 50,2 tok/s; NLL +0,0020 | Apache-2.0 |
| RadixArk/DaisyRose-27B-NVFP4 | 27B | no disponible | NVFP4 (FP8 en proyecciones) | 43,7 tok/s; referencia | Apache-2.0 |
| RadixArk/DaisyRose-27B (BF16) | 27B | no disponible | BF16 | no medido en esta comparación | Apache-2.0 |
| 0xBakeer/TandemLLM-Qwen3.8-27B-NVFP4 | 27B | no disponible | NVFP4 | NLL +0,0039 sobre Qwen3.8-27B | no disponible |
| Qwen/Qwen3.8-27B | 27B | no disponible | BF16 (base) | referencia del anterior | Apache-2.0 |

## Limitaciones y advertencias

- No es un modelo autónomo: es un overlay de pesos que solo funciona superpuesto a RadixArk/DaisyRose-27B-NVFP4 y cargado por SparkQwen; un `from_pretrained` convencional no lo carga.
- Dependencia de hardware: requiere FP4 nativo (Blackwell/DGX Spark); sin validación en Ada, Hopper ni GPU de consumo.
- Dependencia de software: el layout de tensores sigue el de 0xBakeer/TandemLLM-Qwen3.8-27B-NVFP4 para Qwen3.8-27B (432 y 192 tensores con nombres, dtypes y formas coincidentes), pero el motor que lo consume es específico del autor.
- Las métricas publicadas son pérdida (NLL) y pruebas exactas cortas, no benchmarks de tareas; no hay datos de MMLU, HumanEval ni GSM8K para esta release.
- El modelo base es un fine-tune de terceros (RadixArk) sobre Qwen3.8-27B; los sesgos, la calidad multilingüe y el riesgo de alucinación son los del base y no se documentan en esta ficha.
- La información disponible no detalla la longitud de contexto soportada ni la lista de idiomas; las pruebas de contexto largo solo llegan a ~24K tokens.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.
- Licencia Apache-2.0 heredada sin cambios, lo que permite uso comercial, pero el fichero LICENSE es el del modelo fuente y no añade garantías.

## Enlaces

- Hugging Face: https://huggingface.co/Enntity/DaisyRose-27B-NVFP4-GDN-Attn
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Checkpoint NVFP4 sobre el que se superpone: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor de inferencia SparkQwen: https://github.com/Enntity/sparkqwen
- Referencia de layout de tensores: https://huggingface.co/0xBakeer/TandemLLM-Qwen3.8-27B-NVFP4
