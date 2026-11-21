# qda-lab/QDA-Qwen3.6-35B-A3B-Q4-GGUF

## Resumen

QDA-Qwen3.6-35B-A3B-Q4-GGUF es una cuantización en formato GGUF del modelo Qwen/Qwen3.6-35B-A3B, publicada por qda-lab. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 35.505.251.456 parámetros totales, desarrollado por el equipo Qwen. Esta versión cuantizada está pensada para ejecutarse en llama.cpp estándar y emplea una mezcla heterogénea de formatos de cuantización (Q4_K, Q5_K, Q6_K, Q8_0 y F32) elegida mediante búsqueda automática por la herramienta QDA.

La relevancia de esta ficha radica en que no se trata de una cuantización uniforme convencional, sino de una asignación por tensor optimizada con GPTQ sobre las rejillas nativas de llama.cpp, con el objetivo de preservar la calidad del modelo bf16 original en el menor espacio posible. El archivo principal ocupa 22,2 GB y el repositorio completo 43,9 GB.

El modelo incorpora un cabezal MTP (multi-token prediction) que permite decodificación especulativa en llama.cpp mediante el flag `--spec-type draft-mtp`. La licencia es Apache-2.0, idéntica a la del modelo base. La información disponible sobre idiomas, contexto y detalles de entrenamiento del modelo base no está publicada en la model card de esta cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), según modelo base Qwen3.6-35B-A3B; incluye proyecciones de atención lineal y cabezal MTP |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla por tensor: 70 % Q4_K, 23 % Q5_K, 6 % Q8_0, 1,5 % Q6_K (por recuento de pesos); router de expertos y tensores pequeños en F32; cabezal MTP: 96 % Q4_K, resto Q8_0 y F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo principal `QDA-Qwen3.6-35B-A3B-Q4.gguf`, 22,2 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer MoE con 35.505 millones de parámetros totales. La model card de esta cuantización menciona explícitamente la presencia de proyecciones de atención lineal junto a la atención convencional, expertos enrutados, expertos compartidos y un cabezal MTP de 20 tensores en `blk.40` con 0,84 mil millones de pesos. No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens ni si hubo fases de RLHF o DPO.

La innovación principal de esta publicación es el proceso de cuantización. QDA (Closed-Loop LLM Quantization Design with Agents) realiza una búsqueda automática de la mezcla de formatos por tensor. Los tensores Q4_K y Q5_K se resuelven con GPTQ (damping 0,05, orden de activación estático) directamente sobre las rejillas de llama.cpp, ajustando las escalas de cada grupo con el ajuste ponderado por importancia de llama.cpp y ponderado por la diagonal del Hessiano de GPTQ. Los tensores en Q8_0 y Q6_K se escriben desde el modelo bf16 con el cuantizador propio de llama.cpp. Los expertos enrutados son Q4_K, salvo las proyecciones down de los expertos de las capas 10 a 39, que son Q5_K; atención, proyecciones de atención lineal, expertos compartidos y cabeza de salida son Q8_0; el embedding de tokens es Q6_K. La calibración usó 597 muestras de 4.096 tokens (semilla 0) extraídas de 2.048 filas de conversaciones multiturno de HuggingFaceH4/ultrachat_200k.

## Capacidades

- Generación de texto conversacional multiturno, según la pipeline declarada (`text-generation`, tag `conversational`).
- Razonamiento en modo thinking: la evaluación se realizó con thinking activado y el razonamiento termina en `</think>`.
- Razonamiento matemático competitivo: evaluado en AIME 2025 y HMMT Feb 2026.
- Razonamiento científico de nivel experto: evaluado en GPQA-Diamond.
- Generación de código: evaluado en LiveCodeBench.
- Seguimiento de instrucciones: evaluado en IFBench.
- Conocimiento general y razonamiento multidisciplinar: evaluado en MMLU-Pro.
- Decodificación especulativa mediante el cabezal MTP incluido en el archivo (`--spec-type draft-mtp` en llama-server).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling, agentes o capacidades multimodales: no disponible en la información proporcionada.

## Casos de uso

- Asistente de razonamiento matemático: el modelo obtiene 90,4 en AIME 2025 y 82,2 en HMMT Feb 2026 en modo thinking, por lo que es adecuado para resolver problemas de competición y verificar demostraciones paso a paso en entornos educativos o de investigación.
- Resolución de preguntas científicas de nivel experto: con 84,5 en GPQA-Diamond, puede emplearse como apoyo en dominios de física, química y biología a nivel de posgrado, siempre con revisión humana.
- Generación y revisión de código: sus 81,3 en LiveCodeBench lo hacen utilizable en pipelines de asistencia a programación, generación de tests y revisión de parches, ejecutándose localmente con llama.cpp.
- Despliegue local en estaciones de trabajo: al ocupar 22,2 GB en Q4 y ejecutarse en llama.cpp estándar, permite inferencia privada sin depender de APIs externas en equipos con suficiente memoria.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de mezclas Q4_K/Q5_K/Q8_0 frente a cuantizaciones uniformes como UD-Q4_K_XL de unsloth, con diferencias dentro del ruido entre ejecuciones.
- Servicio de inferencia con decodificación especulativa: el cabezal MTP integrado permite activar `--spec-type draft-mtp` en llama-server para reducir latencia en despliegues con llama.cpp.
- Seguimiento estricto de instrucciones: con 69,8 en IFBench, es apto para tareas de formateo condicionado y extracción estructurada donde el cumplimiento del formato es crítico.

## Benchmarks y rendimiento

Resultados publicados en la model card, en modo thinking, pass@1 promediado sobre varias semillas, ejecutados en llama.cpp con la misma configuración de muestreo para ambos archivos:

| Benchmark | QDA (esta cuantización) | unsloth UD-Q4_K_XL |
|---|---|---|
| AIME 2025 | 90,4 | 89,2 |
| HMMT Feb 2026 | 82,2 | 81,8 |
| GPQA-Diamond | 84,5 | 85,0 |
| IFBench | 69,8 | 70,3 |
| MMLU-Pro | 84,9 | 84,8 |
| LiveCodeBench | 81,3 | 80,6 |
| Media | 82,2 | 81,9 |

Configuración de evaluación: temperatura 1,0, top-p 0,95, top-k 20, min-p 0, presence penalty 1,5, repetition penalty 1,0. Límites de tokens nuevos: 81.920 para AIME 2025, HMMT Feb 2026, GPQA-Diamond, IFBench y LiveCodeBench; 32.768 para MMLU-Pro. Repeticiones: 8 semillas (17-24) en AIME y HMMT, 4 semillas (17-20) en GPQA-Diamond e IFBench, 1 semilla (17) en MMLU-Pro y LiveCodeBench. MTP y decodificación especulativa desactivados. El autor indica que las diferencias frente a la cuantización de referencia están dentro del ruido entre ejecuciones en todos los benchmarks.

## Requisitos de hardware

- VRAM estimada: aproximadamente 22,2 GB solo para los pesos del archivo GGUF principal; hay que añadir la memoria para el contexto KV y el búfer de cómputo, que depende de la longitud de contexto configurada.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, requiere GPU con 24 GB o más de VRAM para cargar los pesos completos en memoria de vídeo (por ejemplo, RTX 4090, A100, H100), o bien ejecución parcial en CPU con llama.cpp.
- Cabe en GPU de consumo: sí, en modelos con 24 GB de VRAM o superior, siempre que se ajuste el contexto para no exceder la memoria disponible; no cabe en GPUs de 8-16 GB sin offload a CPU.
- Opciones de despliegue: llama.cpp (`llama-server -hf qda-lab/QDA-Qwen3.6-35B-A3B-Q4-GGUF`), con soporte de decodificación especulativa mediante `--spec-type draft-mtp`. Otros motores no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto | Media de benchmarks (6 tareas) | Licencia |
|---|---|---|---|---|---|
| QDA-Qwen3.6-35B-A3B-Q4-GGUF | 35,5 B totales | GGUF mixto Q4_K/Q5_K/Q6_K/Q8_0 | no disponible | 82,2 | Apache-2.0 |
| unsloth UD-Q4_K_XL (Qwen3.6-35B-A3B) | 35,5 B totales | GGUF Q4_K_XL | no disponible | 81,9 | Apache-2.0 |
| Qwen/Qwen3.6-35B-A3B (bf16) | 35,5 B totales | safetensors bf16 | no disponible | no disponible en esta ficha | Apache-2.0 |

La comparación directa disponible se limita a la cuantización de referencia de unsloth, con la que comparte modelo base y licencia. Los datos del modelo bf16 original no se incluyen en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación: inherente a los modelos de lenguaje; los benchmarks de razonamiento no garantizan corrección factual en dominios abiertos.
- Sesgos conocidos: no documentados en la información disponible; deben evaluarse para el caso de uso concreto.
- Idiomas soportados: no disponibles en la model card; no se puede confirmar cobertura multilingüe.
- Longitud de contexto: no disponible; debe consultarse la documentación del modelo base antes de desplegar cargas con contextos largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la licencia del archivo de calibración es distinta: las filas `chat` provienen de ultrachat_200k (MIT) y el conjunto qda-calibration-pools en su totalidad es CC BY-NC-SA 4.0. Esto afecta al proceso de reproducción, no necesariamente al uso del modelo cuantizado.
- El cabezal MTP (20 tensores, 0,84 B de pesos) se añadió después de la evaluación publicada; los resultados de benchmarks corresponden a los otros 733 tensores, que no cambiaron.
- Las diferencias frente a UD-Q4_K_XL están dentro del ruido entre ejecuciones; no debe interpretarse la media de 82,2 como una ventaja sistemática.
- La cuantización introduce pérdida de precisión respecto al bf16; para tareas sensibles a la precisión numérica conviene validar contra el modelo original.
- El tamaño de 22,2 GB exige planificación de memoria; en GPUs de consumo hay que limitar el contexto o recurrir a offload parcial a CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.6-35B-A3B-Q4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper QDA: https://arxiv.org/abs/2611.23388
- Repositorio QDA: https://github.com/humanfia/qda
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset de calibración: https://huggingface.co/datasets/qda-lab/qda-calibration-pools
- Entradas de la receta: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-Qwen3.6-35B-A3B-Q4-GGUF
