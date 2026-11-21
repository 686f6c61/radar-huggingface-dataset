# prithivMLmods/KODA-35B-GGUF

## Resumen

KODA-35B es un modelo de pesos abiertos especializado en la generación y optimización de kernels CUDA, desarrollado por Baidu Baige AI Infrastructure sobre la base de Qwen3.6-35B-A3B. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones activos durante la inferencia. Su propósito es traducir implementaciones de referencia a kernels CUDA y refinarlos de forma iterativa empleando diagnósticos del compilador, pruebas de corrección, mediciones de tiempo de ejecución y retroalimentación de perfiladores dentro de entornos de ejecución controlados (sandboxes), en conjunción con el agente KODA.

La relevancia del modelo radica en su especialización vertical: frente a su modelo base Qwen3.6, KODA-35B incrementa la corrección en 35,2 puntos porcentuales en KernelBench (95,6 % de corrección, 88,9 % Fast@1 y una aceleración mediana de 3,15× sobre 270 problemas) y 31,1 puntos en SOL-ExecBench (95,5 % de corrección, 78,7 % Fast@1 y aceleración mediana de 2,10× sobre 202 problemas), empatando en la máxima corrección de KernelBench con modelos frontera de mayor tamaño. Los pesos se publican bajo licencia Apache 2.0 y el modelo puede servirse con motores estándar como vLLM o SGLang.

La ficha que se documenta aquí corresponde a la cuantización GGUF publicada por prithivMLmods, que incluye variantes MXFP4_MOE, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S y Q8_0, además de un proyector multimodal en BF16 que habilita capacidades de imagen a texto. El pipeline declarado es image-text-to-text y el idioma soportado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre base Qwen3.6-35B-A3B |
| Parametros totales | 34.660.610.688 |
| Parametros activos | ~3.000 millones (aproximadamente 3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4_MOE, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q8_0; proyector multimodal mmproj-bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors en el modelo base |

## Arquitectura y entrenamiento

KODA-35B emplea una arquitectura de tipo Mixture-of-Experts construida sobre Qwen3.6-35B-A3B, con 34.660 millones de parámetros totales y aproximadamente 3.000 millones activos por token en inferencia. El modelo está afinado (fine-tuned) específicamente para la generación y optimización de kernels CUDA, e incorpora un proyector multimodal (mmproj-bf16) que le confiere capacidades de imagen a texto. El modelo base se distribuye en formato safetensors, mientras que esta ficha corresponde a la conversión a GGUF realizada con llama.cpp.

El proceso de entrenamiento se orienta a la adaptación de dominio (*Kernel Optimization via Domain Adaptation*): el modelo genera kernels CUDA a partir de implementaciones de referencia y los refina en múltiples rondas usando diagnósticos del compilador, pruebas de corrección, mediciones de tiempo de ejecución y retroalimentación de perfiladores, operando junto al agente KODA dentro de sandboxes gestionados. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni de si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de kernels CUDA a partir de implementaciones de referencia.
- Optimización iterativa de kernels mediante diagnósticos de compilador, pruebas de corrección, mediciones de rendimiento y perfilado.
- Razonamiento sobre código y tareas de optimización de bajo nivel.
- Capacidades multimodales de imagen a texto gracias al proyector mmproj-bf16.
- Conversación multi-turno (etiqueta conversational).
- Compatibilidad con endpoints y motores de inferencia estándar (vLLM, SGLang, llama.cpp).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modelo se concibe para operar junto al agente KODA en bucles de refinamiento, aunque no se detallan formalmente las capacidades de agentes.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Generación de kernels CUDA en producción: el modelo traduce implementaciones de referencia a kernels CUDA y los refina en varias rondas con retroalimentación del compilador y pruebas de corrección, integrándose en pipelines de desarrollo de bajo nivel.
- Optimización de rendimiento de kernels existentes: usando mediciones de tiempo de ejecución y perfiladores, el modelo propone y valida variantes que buscan aceleraciones medianas de hasta 3,15× en KernelBench.
- Aceleración de cargas de trabajo de cómputo científico: dado su rendimiento en SOL-ExecBench (aceleración mediana de 2,10×), resulta adecuado para optimizar kernels en dominios de simulación y cálculo numérico.
- Asistencia a ingenieros de rendimiento (HPC): el modelo actúa como generador y revisor de kernels dentro de un bucle gestionado por el agente KODA, reduciendo el trabajo manual de ajuste.
- Integración en pipelines de CI/CD para GPU: al poder servirse con vLLM o SGLang y disponer de cuantizaciones GGUF, puede incorporarse a flujos automatizados de generación y verificación de kernels.
- Despliegue en hardware Blackwell con cuantización MXFP4_MOE: la variante MXFP4_MOE (19,8 GB) aprovecha los Tensor Cores FP4 nativos de GPUs como RTX Pro 6000, RTX 50-series, B200 y B300 para inferencia acelerada.
- Procesamiento de documentación técnica con imágenes: gracias al proyector multimodal, puede recibir diagramas o capturas junto a texto en inglés para tareas de análisis técnico.

## Benchmarks y rendimiento

| Benchmark | Metrica | KODA-35B | Modelo base Qwen3.6-35B-A3B |
|---|---|---|---|
| KernelBench (270 problemas) | Corrección | 95,6 % | +35,2 puntos porcentuales respecto al base |
| KernelBench (270 problemas) | Fast@1 | 88,9 % | no disponible |
| KernelBench (270 problemas) | Aceleración mediana | 3,15× | no disponible |
| SOL-ExecBench (202 problemas) | Corrección | 95,5 % | +31,1 puntos porcentuales respecto al base |
| SOL-ExecBench (202 problemas) | Fast@1 | 78,7 % | no disponible |
| SOL-ExecBench (202 problemas) | Aceleración mediana | 2,10× | no disponible |

Los datos indican que KODA-35B empata en la máxima corrección de KernelBench con modelos frontera de mayor tamaño. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: MXFP4_MOE 19,8 GB; Q4_K_S 19,9 GB; Q4_K_M 21,2 GB; Q5_K_S 24 GB; Q5_K_M 24,7 GB; Q8_0 36,9 GB. El proyector multimodal mmproj-bf16 ocupa 903 MB adicionales.
- GPU recomendadas: NVIDIA Blackwell (RTX Pro 6000, RTX 50-series, B200, B300) para la variante MXFP4_MOE con Tensor Cores FP4 nativos; para el resto de cuantizaciones se requiere VRAM suficiente según el tamaño del fichero.
- Cabe en GPU de consumo: las variantes Q4 (19,9–21,2 GB) y Q5 (24–24,7 GB) pueden ejecutarse en GPUs de consumo con 24 GB o más de VRAM, como la RTX 4090 (24 GB) en el caso de Q5_K_S ajustado, y con margen en Q4. La variante Q8_0 (36,9 GB) excede la VRAM de las GPU de consumo habituales.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), vLLM, SGLang y text-generation-inference; el modelo base está pensado para servirse con vLLM o SGLang.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KODA-35B (esta ficha, GGUF) | 34.660.610.688 | ~3B | no disponible | Generación y optimización de kernels CUDA | apache-2.0 | GGUF en Hugging Face |
| Qwen3.6-35B-A3B (modelo base) | ~35B | ~3B | no disponible | Propósito general | no disponible | Pesos base en Hugging Face |
| Modelos frontera de mayor tamaño | no disponible | no disponible | no disponible | Propósito general | no disponible | no disponible |

KODA-35B se compara favorablemente con su modelo base en las tareas específicas de generación de kernels (mejoras de 35,2 y 31,1 puntos de corrección en KernelBench y SOL-ExecBench respectivamente), y empata con modelos frontera de mayor tamaño en corrección de KernelBench. No se dispone de datos suficientes para una comparación detallada con alternativas de propósito general en el mismo rango de parámetros.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está afinado para generación y optimización de kernels CUDA, por lo que su rendimiento en tareas generales puede diferir del de su modelo base.
- Idiomas: la model card declara únicamente inglés, lo que limita su uso en otros idiomas.
- Longitud de contexto: no disponible en la información proporcionada; debe verificarse antes de desplegarlo en escenarios de contexto largo.
- Riesgo de alucinación: no se documentan tasas de alucinación; como modelo generativo de código, puede producir kernels incorrectos o no compilables, por lo que se recomienda validación con pruebas de corrección y compilador.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.6-35B-A3B, cuya licencia no se detalla en la información proporcionada.
- Dependencia de hardware: la variante MXFP4_MOE requiere hardware Blackwell para aprovechar los Tensor Cores FP4; en otras GPUs puede no ofrecer ventajas de rendimiento.
- Cuantizaciones de baja precisión (Q4) pueden degradar la calidad de los kernels generados; para producción se recomienda Q5 o superior.
- El modelo está diseñado para operar junto al agente KODA y en sandboxes gestionados; su uso aislado puede no reproducir los resultados de los benchmarks.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/prithivMLmods/KODA-35B-GGUF
- Modelo base: https://huggingface.co/Baidu-Baige/KODA-35B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ficheros de cuantización:
  - https://huggingface.co/prithivMLmods/KODA-35B-GGUF/blob/main/KODA-35B.MXFP4_MOE.gguf
  - https://huggingface.co/prithivMLmods/KODA-35B-GGUF/blob/main/KODA-35B.Q4_K_M.gguf
  - https://huggingface.co/prithivMLmods/KODA-35B-GGUF/blob/main/KODA-35B.Q4_K_S.gguf
  - https://huggingface.co/prithivMLmods/KODA-35B-GGUF/blob/main/KODA-35B.Q5_K_M.gguf
  - https://huggingface.co/prithivMLmods/KODA-35B-GGUF/blob/main/KODA-35B.Q5_K_S.gguf
  - https://huggingface.co/prithivMLmods/KODA-35B-GGUF/blob/main/KODA-35B.Q8_0.gguf
  - https://huggingface.co/prithivMLmods/KODA-35B-GGUF/blob/main/KODA-35B.mmproj-bf16.gguf
