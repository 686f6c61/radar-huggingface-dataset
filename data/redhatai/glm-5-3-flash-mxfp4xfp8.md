# RedHatAI/GLM-5.3-Flash-MXFP4xFP8

## Resumen

GLM-5.3-Flash-MXFP4xFP8 es una versión cuantizada en precisión mixta del modelo multimodal zai-org/GLM-5.3-Flash, publicada por RedHatAI. El checkpoint original ya se distribuía en FP8; esta variante reduce los pesos de los expertos enrutados del MoE de 8 bits a aproximadamente 4,25 bits por parámetro mediante cuantización MXFP4 con grupo de 32, manteniendo el resto de capas cuantizadas en FP8. El resultado es un checkpoint de unos 182 GB frente a los ~328 GB del original, es decir, una reducción de aproximadamente el 45 % en disco y en memoria de GPU.

El modelo conserva la arquitectura Glm5NextForConditionalGeneration, con atención dispersa (sparse attention), mezcla de expertos con expertos compartidos, capas MLP densas y una capa de predicción multi-token (MTP) que puede emplearse para decodificación especulativa. Acepta texto e imágenes como entrada y genera texto, con 165.496.249.182 parámetros totales según los safetensors del repositorio.

Su relevancia es práctica: permite servir un modelo de gran tamaño con requisitos de memoria notablemente menores y, a diferencia de las recetas MXFP4 habituales (pesos y activaciones MXFP4, orientadas a Blackwell), combina pesos MXFP4 con activaciones FP8 dinámicas por grupo, lo que lo hace apto para GPUs Hopper. Requiere vLLM 0.32.0 o superior y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glm5NextForConditionalGeneration (transformer MoE con atención dispersa, expertos compartidos y capa MTP) |
| Parametros totales | 165.496.249.182 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta: pesos MXFP4 (grupo 32) en expertos enrutados; pesos FP8 block-wise (128×128) en proyecciones de atención dispersa, MLPs densos, expertos compartidos y capa MTP; activaciones FP8 dinámicas (grupo 128 en expertos, dinámicas en el resto) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors en formato compressed-tensors (compatible con vLLM) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) que incorpora atención dispersa (sparse attention) en determinadas capas, expertos compartidos junto a los enrutados, MLPs densos y una capa de predicción multi-token (MTP). El pipeline declarado es image-text-to-text: el modelo procesa entradas de texto e imagen y produce texto, lo que implica un codificador visual integrado, aunque la información disponible no detalla su configuración. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovación técnica de este checkpoint es la receta de cuantización mixta aplicada con LLM Compressor y exportada en compressed-tensors. Los expertos enrutados, que concentran la mayor parte de los parámetros, usan pesos MXFP4 (grupo 32) con activaciones FP8 dinámicas por grupo (grupo 128); el resto de operadores lineales cuantizados mantienen pesos FP8 con escalado por bloques de 128×128 y activaciones FP8 dinámicas, igual que el checkpoint original. Solo se cuantizan los operadores lineales dentro de los bloques del transformer. La capa MTP se conserva en FP8 precisamente para habilitar decodificación especulativa en producción.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, con modo de razonamiento configurable mediante el parser `glm47` de vLLM.
- Comprensión de imágenes combinada con texto (image-text-to-text), orientada a tareas de razonamiento visual y descripción guiada por instrucciones.
- Codificación agéntica: resolución de tareas de ingeniería de software sobre repositorios reales, con ejecución de comandos en terminal.
- Soporte de tool calling / function calling, con parser dedicado (`glm47`) y elección automática de herramienta (`--enable-auto-tool-choice`).
- Soporte de agentes con bucle ReAct, tal y como se empleó en la evaluación con Inspect AI.
- Decodificación especulativa mediante la capa MTP (hasta 5 tokens especulativos por paso en la configuración de referencia).
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- Razonamiento matemático de competición (evaluado en AIME 2026) y conocimiento experto (GPQA Diamond, MMLU-Pro).

## Casos de uso

- Agente de ingeniería de software: el modelo puede recibir un repositorio, navegar por él, ejecutar comandos en terminal y proponer parches. Los resultados en SWE-bench Verified (76,2 % pass@1) y Terminal-Bench 2.1 (79,8 %) lo respaldan para este escenario, con integración en pipelines de CI/CD mediante tool calling.
- Asistente de atención al cliente multilingüe (inglés y chino): con soporte de conversaciones multi-turno y tool calling para consultar sistemas internos, aunque el contexto máximo no está documentado en la información disponible.
- Automatización de soporte técnico con capturas de pantalla: al aceptar imagen y texto, puede interpretar errores mostrados en pantalla o diagramas junto a la consulta del usuario y devolver instrucciones de resolución.
- Razonamiento matemático y analítico asistido: útil en herramientas de verificación de cálculos, tutoría avanzada o generación de demostraciones, dado su rendimiento en AIME 2026 (92,9 % avg@8) y GPQA Diamond (90,6 % avg@3).
- Generación y revisión de código en producción: el soporte de function calling y la compatibilidad con la API OpenAI de vLLM permiten integrarlo en asistentes de IDE o revisiones automatizadas de pull requests.
- Despliegue de agentes autónomos sobre terminal: Terminal-Bench 2.1 mide precisamente tareas de operación en línea de comandos, por lo que encaja en automatización de tareas de administración de sistemas y scripting.
- Procesamiento de documentación técnica con imágenes: extracción de información de manuales, diagramas y capturas combinada con generación de resúmenes o respuestas en inglés o chino.

## Benchmarks y rendimiento

Evaluación realizada con Inspect AI (inspect_evals e inspect_harbor), servido con vLLM 0.32.0 sobre 8 GPU H200, una réplica TP=8, caché KV en BF16 y decodificación especulativa MTP. Los porcentajes incluyen el error estándar.

| Categoria | Benchmark | GLM-5.3-Flash (FP8) | MXFP4xFP8 | Recuperacion |
|---|---|---|---|---|
| Razonamiento | AIME 2026 (avg@8) | 94,2 ± 3,1 | 92,9 ± 2,9 | 98,7 % |
| Razonamiento | GPQA Diamond (avg@3) | 89,4 ± 2,0 | 90,6 ± 1,8 | 101,3 % |
| Razonamiento | MMLU-Pro (pass@1) | 87,6 ± 0,3 | 87,3 ± 0,3 | 99,7 % |
| Codigo agentico | SWE-bench Verified (pass@1) | 75,6 ± 1,9 (378/500) | 76,2 ± 1,9 (381/500) | 100,8 % |
| Codigo agentico | DeepSWE 1.1 (pass@1) | 68,1 ± 4,4 (77/113) | 59,3 ± 4,6 (67/113) | 87,0 % |
| Codigo agentico | Terminal-Bench 2.1 (pass@1) | 80,9 ± 4,2 (72/89) | 79,8 ± 4,3 (71/89) | 98,6 % |

El autor advierte que estas cifras no son directamente comparables con las de la model card de GLM-5.3-Flash, que emplea otros arneses de agente (mini-swe-agent para DeepSWE, Claude Code para Terminal-Bench), otros ajustes de muestreo y otro stack de evaluación. La mayor pérdida se observa en DeepSWE 1.1 (87,0 % de recuperación); en el resto la degradación es mínima o inexistente dentro del error estadístico.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 182,2 GB, aproximadamente un 45 % menos que los ~328 GB del checkpoint FP8 original. A esa cifra hay que sumar la caché KV en BF16 (obligatoria en Hopper) y el espacio de activaciones.
- GPU recomendadas: la evaluación de referencia se ejecutó en 8× H200 con tensor-parallel-size 8. El diseño está pensado para Hopper (H100/H200) porque combina pesos MXFP4 con activaciones FP8; en Blackwell también es compatible y allí se admite caché KV en FP8.
- GPU de consumo: no cabe en GPU de consumo. Con 165.500 millones de parámetros, incluso en 4 bits se requieren decenas de GPU o un despliegue multi-nodo.
- Opciones de despliegue: vLLM 0.32.0 o superior (primera versión que ejecuta pesos MXFP4 con activaciones FP8 en Hopper), con los parsers `glm47` de razonamiento y tool calling. El formato compressed-tensors está soportado por el stack de vLLM; no se documenta soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa con la capa MTP (`num_speculative_tokens: 5`) está soportada y orientada a mejorar el throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| RedHatAI/GLM-5.3-Flash-MXFP4xFP8 | 165,5 B | no disponible | MXFP4 + FP8 mixta | MIT | Objeto de esta ficha; ~182 GB |
| zai-org/GLM-5.3-Flash (FP8) | 165,5 B (mismo modelo base) | no disponible | FP8 | MIT | Checkpoint original; ~328 GB; referencia de calidad |
| Otros modelos de ~160 B con licencia permisiva | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación más directa y fiable es con el checkpoint FP8 del que deriva: misma arquitectura, mismos parámetros y misma licencia, con una reducción de memoria de aproximadamente el 45 % y una recuperación de calidad entre el 87 % y el 101 % según el benchmark. No se aportan datos de otros modelos comparables en la información disponible.

## Limitaciones y advertencias

- Pérdida de calidad medible en tareas agénticas complejas: DeepSWE 1.1 cae del 68,1 % al 59,3 % (recuperación del 87 %), la mayor degradación observada. En cargas de trabajo de codificación agéntica intensiva conviene validar el comportamiento frente al checkpoint FP8.
- Idiomas limitados a inglés y chino según los metadatos; no se declara soporte de español ni de otras lenguas, por lo que el rendimiento fuera de esos idiomas no está garantizado.
- Longitud de contexto no documentada en la información disponible; debe consultarse la model card del modelo base antes de diseñar aplicaciones con contextos largos.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado en la información disponible; en tareas de código y terminal conviene mantener verificación humana o tests automáticos.
- Restricciones de despliegue: requiere vLLM 0.32.0 o superior; en Hopper la caché KV debe ser BF16 (FP8 solo en Blackwell). No se documenta soporte en otros motores de inferencia.
- Sesgos conocidos: no se documentan en la información proporcionada; al ser un modelo entrenado principalmente en inglés y chino, es esperable un sesgo cultural y lingüístico hacia esos idiomas.
- Licencia MIT: permite uso comercial, pero debe conservarse el aviso de copyright y no se ofrece garantía alguna por parte de RedHatAI ni de zai-org.
- Las cifras de benchmark no son comparables con las publicadas en la model card del modelo base debido a diferencias de arnés, muestreo y stack de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/GLM-5.3-Flash-MXFP4xFP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Receta de vLLM para GLM-5.3-Flash: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/vllm-project/compressed-tensors
- Inspect AI: https://inspect.aisi.org.uk/
- inspect_evals: https://github.com/UKGovernmentBEIS/inspect_evals
- inspect_harbor: https://github.com/meridianlabs-ai/inspect_harbor
