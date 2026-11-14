# prithivMLmods/Xing4.0-29B-A4B-GGUF

## Resumen

Xing4.0-29B-A4B es un modelo de lenguaje de pesos abiertos orientado a agentes, desarrollado por XingChen-AGI (China Telecom Artificial Intelligence Technology Co., Ltd.) como sucesor de la serie TeleChat. Se distribuye bajo licencia Apache 2.0 y emplea una arquitectura de mezcla de expertos (MoE) con 29B parámetros totales y aproximadamente 4B activos por token, distribuidos en 64 expertos enrutados (4 activos por token) más un experto compartido. Consta de 40 capas y combina atención MLA con un mecanismo mHC y predicción multi-token (MTP).

El modelo está entrenado sobre 1,5 billones de tokens bilingües (chino e inglés) en una pila completamente propia adaptada a clústeres de NPU domésticos, lo que según los autores elevó el throughput de entrenamiento en torno al 96%. Soporta de forma nativa un contexto de 256K tokens, extensible a 512K, y está diseñado específicamente para planificación de contexto largo, razonamiento multi-paso, tool calling y salida estructurada.

La relevancia actual radica en su posicionamiento competitivo frente a modelos como Gemma4-26B-A4B y Qwen3.6-35B-A3B en tareas de agentes y código, junto con su disponibilidad en múltiples formatos (BF16, FP8, GGUF y W8A8) y su integración en llama.cpp mainline, SGLang y un plugin de vLLM. La variante GGUF aquí descrita, publicada por prithivMLmods, ofrece cuantizaciones desde Q3_K_M hasta Q6_K y MXFP4_MOE, optimizada para hardware Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con mHC + MLA + MTP; 40 capas |
| Parametros totales | 31.215.031.088 (31,2B) |
| Parametros activos | ~4B por token (64 expertos enrutados, 4 activos + 1 compartido) |
| Longitud de contexto | 256K nativo, extensible a 512K |
| Tipos de cuantizacion | MXFP4_MOE, Q3_K_L, Q3_K_M, Q4_K_M, Q5_K_M, Q5_K_S, Q6_K (en este repo); BF16, FP8 y W8A8 en el modelo base |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

Xing4.0-29B-A4B es un transformer de mezcla de expertos con 40 capas que combina atención multi-cabeza latente (MLA) con un mecanismo denominado mHC y predicción multi-token (MTP). El componente MoE consta de 64 expertos enrutados, de los cuales 4 se activan por token, más un experto compartido, lo que da lugar a unos 4B parámetros activos sobre un total de 31,2B. La inclusión de MTP habilita decodificación especulativa nativa, integrada en llama.cpp mediante los flags `--spec-type draft-mtp` y `--spec-draft-n-max`.

El entrenamiento se realizó sobre 1,5 billones de tokens bilingües (chino e inglés) usando una pila tecnológica completamente interna adaptada a clústeres de NPU domésticos, con una mejora declarada de throughput de entrenamiento de aproximadamente el 96%. La model card del autor no detalla la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. El ajuste fino está soportado mediante ms-swift y LLaMA-Factory.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento multi-paso y planificación de contexto largo, con ventana nativa de 256K tokens.
- Generación de código y tareas de ingeniería de software (SWE-bench Verified, SWE-bench Multilingual, Terminal-Bench).
- Tool calling y function calling para integración en pipelines de agentes.
- Salida estructurada, adecuada para extracción de datos y respuestas en formatos definidos.
- Modo de pensamiento (thinking mode) opcional a través de la API compatible con OpenAI.
- Decodificación especulativa mediante MTP, con aceleración de generación reportada de hasta 1,34x.
- Capacidades de investigación profunda y evaluación tipo agente (Claw-Eval, DeepresearchBII).
- No se declaran capacidades de visión ni de audio.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto muy largo (256K tokens) gracias a su ventana nativa, lo que permite arrastrar historiales extensos y documentación de producto sin truncar.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para revisión automática de parches, generación de tests y resolución de incidencias, con resultados reportados de 75,0 en SWE-bench Verified.
- Agentes autónomos de terminal: con 57,5 en Terminal-Bench 2.1, es adecuado para orquestar tareas de línea de comandos, depuración de entornos y automatización de operaciones.
- Investigación profunda asistida: su rendimiento de 60,8 en DeepresearchBII lo hace apto para flujos de búsqueda, síntesis y verificación de fuentes en múltiples pasos.
- Extracción de datos estructurados: la capacidad de salida estructurada permite convertir documentos largos en JSON u otros formatos definidos para ingestión en bases de datos.
- Asistencia bilingüe chino-inglés: útil en organizaciones con documentación y soporte en ambos idiomas, sin necesidad de modelos separados.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (19 GB) y Q5_K_M (22,2 GB) permiten ejecución local en GPUs con 24 GB de VRAM, habilitando prototipos y asistentes de escritorio.
- Planificación de proyectos de largo alcance: la ventana extensible a 512K facilita el análisis de repositorios completos o corpus documentales extensos.

## Benchmarks y rendimiento

| Benchmark | Xing4.0-29B-A4B |
|---|---|
| SWE-bench Verified | 75,0 |
| SWE-bench Multilingual | 66,0 |
| Terminal-Bench 2.1 | 57,5 |
| Claw-Eval | 76,55 |
| DeepresearchBII | 60,8 |

Los autores indican que estos resultados lideran o son competitivos frente a Gemma4-26B-A4B y Qwen3.6-35B-A3B, aunque no se proporcionan las cifras concretas de esos modelos comparados en la información disponible.

Rendimiento de inferencia medido en llama.cpp con el archivo MXFP4_MOE:

| Configuración | Flags de decodificación especulativa | Prefill (t/s) | Decode (t/s) | Aceleración decode |
|---|---|---|---|---|
| Estándar (baseline) | Ninguno | 110,7 | 141,7 | 1,00x |
| MTP activado | `--spec-type draft-mtp --spec-draft-n-max 2` | 97,5 (-11,9%) | 190,2 | 1,34x (+34,2%) |

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q3_K_M 15 GB, Q3_K_L 16,3 GB, MXFP4_MOE 18,6 GB, Q4_K_M 19 GB, Q5_K_S 21,6 GB, Q5_K_M 22,2 GB, Q6_K 25,7 GB.
- GPU recomendadas: para MXFP4_MOE se recomienda hardware NVIDIA Blackwell (RTX Pro 6000, serie RTX 50, B200, B300) por sus Tensor Cores FP4 nativos; para el resto de cuantizaciones, GPUs con 24 GB o más de VRAM como RTX 4090, RTX 3090, A100 o H100.
- Cabe en GPU de consumo: sí, con Q4_K_M o Q5_K_M en tarjetas de 24 GB (RTX 4090, RTX 3090); las cuantizaciones Q6_K requieren algo más de margen o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp mainline (soporte oficial desde la release v1.0.0), SGLang, plugin de vLLM, text-generation-inference y API compatible con OpenAI.
- Latencia y throughput: medidos en llama.cpp con MXFP4_MOE, 110,7 t/s de prefill y 141,7 t/s de decode en baseline; con MTP activado, 97,5 t/s de prefill y 190,2 t/s de decode. No se dispone de mediciones para otras cuantizaciones o backends.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Xing4.0-29B-A4B | 31,2B | ~4B | 256K (512K extensible) | Apache 2.0 | SWE-bench Verified 75,0; Terminal-Bench 2.1 57,5 |
| Gemma4-26B-A4B | no disponible | ~4B (según nomenclatura) | no disponible | no disponible | no disponible en la información |
| Qwen3.6-35B-A3B | 35B (según nomenclatura) | ~3B (según nomenclatura) | no disponible | no disponible | no disponible en la información |

Los autores afirman que Xing4.0 lidera o es competitivo frente a Gemma4-26B-A4B y Qwen3.6-35B-A3B, pero no se aportan las métricas desglosadas de los competidores en la información disponible.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de investigación profunda y síntesis de fuentes.
- No se han publicado análisis de sesgos en la información disponible.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones del modelo base original (XingChen-AGI/Xing4.0-29B-A4B) y de los datasets de entrenamiento.
- Las cuantizaciones Q3 sacrifican calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- El rendimiento óptimo de MXFP4_MOE depende de hardware Blackwell; en GPUs anteriores puede no aprovechar la aceleración FP4.
- El contexto de 512K es una extensión declarada por los autores y no se han publicado evaluaciones específicas de degradación a esa longitud.
- El soporte en llama.cpp requiere una versión reciente (mainline v1.0.0 o posterior).
- No se dispone de información sobre latencia en backends distintos de llama.cpp.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Xing4.0-29B-A4B-GGUF
- Modelo base: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Release de llama.cpp con soporte para Xing4.0: https://github.com/ggml-org/llama.cpp/releases/tag/v1.0.0
- Archivo MXFP4_MOE: https://huggingface.co/prithivMLmods/Xing4.0-29B-A4B-GGUF/blob/main/Xing4.0-29B-A4B.MXFP4_MOE.gguf
- Archivo Q4_K_M: https://huggingface.co/prithivMLmods/Xing4.0-29B-A4B-GGUF/blob/main/Xing4.0-29B-A4B.Q4_K_M.gguf
- Archivo Q5_K_M: https://huggingface.co/prithivMLmods/Xing4.0-29B-A4B-GGUF/blob/main/Xing4.0-29B-A4B.Q5_K_M.gguf
- Archivo Q6_K: https://huggingface.co/prithivMLmods/Xing4.0-29B-A4B-GGUF/blob/main/Xing4.0-29B-A4B.Q6_K.gguf
