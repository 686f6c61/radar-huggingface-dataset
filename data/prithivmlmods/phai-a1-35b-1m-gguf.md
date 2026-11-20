# prithivMLmods/Phai-A1-35B-1M-GGUF

## Resumen

Phai-A1-35B-1M es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) de pesos abiertos desarrollado por PhaiModelLab, construido sobre la arquitectura Qwen3.6-35B-A3B. Cuenta con 34.660.610.688 parámetros totales (aproximadamente 35B) y 3B parámetros activos por token, y está especializado en flujos de trabajo de programación y agentes. La versión aquí descrita es una cuantización GGUF publicada por prithivMLmods para su uso con llama.cpp.

El modelo ha sido post-entrenado íntegramente en NPUs Huawei Ascend mediante Supervised Fine-Tuning (SFT) y Group Relative Policy Optimization (GRPO) sobre 4.000 entornos sandbox reales, recibiendo retroalimentación basada en ejecución de código, tests unitarios e interacciones con herramientas. Soporta de forma nativa una ventana de contexto de hasta 1 millón de tokens mediante escalado RoPE YaRN (factor=4), lo que lo habilita para comprensión de repositorios completos y planificación de tareas de largo horizonte.

Su relevancia actual radica en la combinación de contexto extremo, capacidades agénticas verificadas contra benchmarks como SWE-Bench, TAU3-Bench e IFBench, soporte multimodal (pipeline image-text-to-text con fichero de proyección mmproj) y licencia Apache 2.0, todo ello en un paquete que cabe en GPUs de consumo gracias a su reducido número de parámetros activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3.6-35B-A3B |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B |
| Longitud de contexto | Hasta 1.000.000 tokens (YaRN, factor=4) |
| Tipos de cuantizacion | MXFP4_MOE, Q4_K_M, Q5_K_M, Q5_K_S, Q8_0; proyección multimodal mmproj-bf16 |
| Idiomas soportados | zh, en, ja, ar, ru, de |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones para llama.cpp); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos (MoE): 35B parámetros totales de los cuales solo ~3B se activan por token, lo que reduce el coste computacional de inferencia manteniendo la capacidad representacional de un modelo denso mucho mayor. El soporte de contexto largo se implementa mediante escalado RoPE YaRN con factor 4, extendiendo la ventana hasta 1M tokens. Dispone además de un proyector multimodal (mmproj-bf16) que habilita entrada de imágenes, coherente con su pipeline image-text-to-text.

El post-entrenamiento se realizó íntegramente sobre NPUs Huawei Ascend, combinando SFT y GRPO sobre 4.000 entornos sandbox reales. La señal de recompensa proviene de la ejecución efectiva de código, tests unitarios y llamadas a herramientas, un esquema de aprendizaje por refuerzo con retroalimentación de ejecución que refuerza el razonamiento multi-paso y la depuración. La model card indica explícitamente que no se emplea decodificación especulativa MTP.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a tareas de ingeniería.
- Generación y depuración de código con retroalimentación basada en ejecución (entrenado sobre sandbox reales).
- Tool calling y function calling para integración con herramientas externas.
- Flujos agénticos: planificación de tareas de largo horizonte, uso iterativo de herramientas y resolución de incidencias.
- Comprensión de repositorios a escala gracias a la ventana de 1M tokens.
- Capacidades multimodales de imagen a texto mediante el proyector mmproj.
- Soporte multilingüe en seis idiomas: chino, inglés, japonés, árabe, ruso y alemán.
- Optimizado para benchmarks de instrucciones (IFBench) y de agentes (TAU3-Bench).

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede ingerir un repositorio completo dentro de su ventana de 1M tokens, localizar el código relevante, proponer un parche y validarlo contra los tests existentes, aprovechando su entrenamiento con retroalimentación de ejecución.
- Agentes de CI/CD: integrado mediante tool calling, puede ejecutar tests, leer logs de fallo y aplicar correcciones iterativas dentro de un pipeline automatizado.
- Asistente de programación en IDE: con cuantización Q4_K_M (21,2 GB) puede desplegarse en estaciones de trabajo con GPU de consumo, ofreciendo autocompletado y refactorización con contexto de proyecto completo.
- Automatización de revisión de código: análisis de pull requests de gran tamaño evaluando coherencia, posibles regresiones y estilo, apoyándose en el contexto largo para considerar múltiples ficheros simultáneamente.
- Agentes de atención al cliente con acceso a herramientas: gestión de conversaciones multi-turno con llamadas a APIs internas (consultas de pedidos, estado de cuentas) en inglés, chino, japonés, árabe, ruso o alemán.
- Extracción de información de documentos e imágenes: gracias al pipeline image-text-to-text y al proyector mmproj, puede procesar capturas, diagramas o documentos escaneados junto con texto.
- Migración y modernización de bases de código legacy: comprensión de repositorios extensos y generación de parches por fases con planificación de largo horizonte.

## Benchmarks y rendimiento

La model card menciona resultados en SWE-Bench, TAU3-Bench e IFBench, pero no proporciona las cifras concretas en la información disponible.

| Benchmark | Resultado |
|---|---|
| SWE-Bench | no disponible (mencionado sin cifras) |
| TAU3-Bench | no disponible (mencionado sin cifras) |
| IFBench | no disponible (mencionado sin cifras) |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño de fichero, requiere margen adicional para contexto KV):
  - MXFP4_MOE: 19,8 GB, optimizado para NVIDIA Blackwell (RTX Pro 6000, serie RTX 50, B200, B300) con aceleración nativa de Tensor Cores FP4.
  - Q4_K_M: 21,2 GB (recomendada como opción por defecto).
  - Q5_K_S: 24 GB; Q5_K_M: 24,7 GB (alta calidad, recomendadas).
  - Q8_0: 36,9 GB (calidad máxima estándar).
  - Proyector multimodal mmproj-bf16: 903 MB adicionales para capacidades de visión.
- GPU recomendadas: para MXFP4_MOE, hardware Blackwell (B200, B300, RTX Pro 6000, RTX 50). Para el resto de cuantizaciones, GPUs con 24 GB o más (RTX 4090, RTX 3090, A100 40GB, H100) según el nivel de cuantización.
- GPU de consumo: sí; Q4_K_M y Q5_K_S caben en GPUs de 24 GB como la RTX 4090, y MXFP4_MOE en la serie RTX 50. Con contextos muy largos el KV cache incrementa notablemente los requisitos.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, Text Generation Inference (tag text-generation-inference), transformers; el modelo es compatible con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada; al activar solo ~3B parámetros por token, el coste por token es sustancialmente menor que el de un modelo denso de 35B.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Phai-A1-35B-1M | 35B totales / 3B activos (MoE) | 1M (YaRN) | Apache 2.0 | Especializado en código y agentes, multimodal, GGUF disponible |
| Qwen3.6-35B-A3B (base) | 35B totales / 3B activos (MoE) | no disponible | no disponible | Modelo base sobre el que se construye Phai-A1 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos de lenguaje; en tareas de código, los parches generados deben validarse siempre con tests antes de aplicarse en producción.
- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse sobre datos web y sandbox, puede reflejar sesgos presentes en ellos.
- Cobertura lingüística limitada a seis idiomas (zh, en, ja, ar, ru, de); el rendimiento en otros idiomas, incluido el español, no está garantizado.
- El contexto de 1M tokens depende del escalado YaRN (factor=4); el rendimiento efectivo en ventanas extremas puede degradarse y el KV cache exige recursos adicionales considerables.
- La cuantización GGUF introduce pérdida de precisión respecto a los pesos originales; Q4_K_M es el equilibrio recomendado, Q8_0 la opción de mayor fidelidad.
- MXFP4_MOE requiere hardware Blackwell para aprovechar la aceleración FP4; en otras GPUs el rendimiento puede no ser óptimo.
- No se emplea decodificación especulativa MTP, lo que limita las ganancias de throughput por esa vía.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones del modelo base.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/prithivMLmods/Phai-A1-35B-1M-GGUF
- Modelo base: https://huggingface.co/PhaiModelLab/Phai-A1-35B-1M
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Fichero MXFP4_MOE: https://huggingface.co/prithivMLmods/Phai-A1-35B-1M-GGUF/blob/main/Phai-A1-35B-1M.MXFP4_MOE.gguf
- Fichero Q4_K_M: https://huggingface.co/prithivMLmods/Phai-A1-35B-1M-GGUF/blob/main/Phai-A1-35B-1M.Q4_K_M.gguf
- Fichero Q5_K_M: https://huggingface.co/prithivMLmods/Phai-A1-35B-1M-GGUF/blob/main/Phai-A1-35B-1M.Q5_K_M.gguf
- Fichero Q5_K_S: https://huggingface.co/prithivMLmods/Phai-A1-35B-1M-GGUF/blob/main/Phai-A1-35B-1M.Q5_K_S.gguf
- Fichero Q8_0: https://huggingface.co/prithivMLmods/Phai-A1-35B-1M-GGUF/blob/main/Phai-A1-35B-1M.Q8_0.gguf
- Proyector multimodal mmproj-bf16: https://huggingface.co/prithivMLmods/Phai-A1-35B-1M-GGUF/blob/main/Phai-A1-35B-1M.mmproj-bf16.gguf
