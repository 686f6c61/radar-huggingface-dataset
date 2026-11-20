# RedHatAI/Qwen3.8-Flash-Next-NVFP4

## Resumen

RedHatAI/Qwen3.8-Flash-Next-NVFP4 es una versión cuantizada del modelo multimodal Qwen/Qwen3.8-Flash-Next, desarrollado por el equipo RedHatAI sobre la arquitectura propietaria de Qwen. Se trata de un checkpoint que aplica cuantización NVFP4 (FP4 de NVIDIA) exclusivamente a los pesos y activaciones de los operadores lineales de los expertos de la capa Mixture-of-Experts, manteniendo el resto del modelo en BF16 original. El resultado es una reducción sustancial del espacio en disco y memoria respecto al modelo base, con una recuperación de precisión media del 99,1 % según la evaluación del autor.

El modelo resuelve el problema clásico de desplegar modelos MoE de gran tamaño en infraestructura limitada: al comprimir solo los expertos (que concentran la mayor parte de los parámetros) de 16 a 4 bits, se reduce el footprint sin degradar las capas de atención ni el resto de componentes críticos. Está pensado para servirse con vLLM y viene validado contra RHOAI 3.6.0, RHAIIS 3.6.0 y vLLM 0.31.0.

Con 179.999.981.459 parámetros totales y un repositorio de 186,5 GB, es un modelo multimodal de entrada texto/imagen/vídeo y salida texto, orientado a cargas de trabajo de razonamiento, código y agentes. Su relevancia actual radica en que demuestra que la cuantización FP4 selectiva sobre MoE permite mantener prácticamente intacta la calidad del modelo base en benchmarks de razonamiento, matemáticas y coding, habilitando despliegues en hardware con soporte FP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration (MoE, transformer multimodal) |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4) en pesos y activaciones de los expertos MoE; resto del modelo en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-Flash-Next, un transformer multimodal con arquitectura Mixture-of-Experts (clase `Qwen4ExpForConditionalGeneration`) que acepta texto, imagen y vídeo como entrada y produce texto. La versión de RedHatAI no reentrena el modelo: aplica cuantización post-entrenamiento con LLM Compressor sobre los operadores lineales de los expertos MoE, dejando el resto de capas en BF16. La calibración se realizó con 1024 muestras del dataset open-perfectblend.

La innovación técnica principal es la cuantización selectiva NVFP4: solo los expertos se comprimen de 16 a 4 bits, lo que reduce drásticamente el peso de los parámetros que dominan el conteo total sin tocar las capas de atención ni los componentes sensibles a la precisión. El autor reporta que esta estrategia de calibración y los observers implementados explican la mayor recuperación de precisión frente a las versiones NVFP4 de Inferact y NVIDIA. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento configurable mediante el parser `qwen3` en vLLM.
- Comprensión de imagen y vídeo como entrada (pipeline `image-text-to-text`), con salida exclusivamente textual.
- Generación y edición de código, con soporte de tool calling nativo (`--enable-auto-tool-choice` y parser `qwen3_coder`).
- Ejecución de tareas de agente en terminal y entornos de software (evaluado en Terminal-Bench 2.1, SWE-bench Verified y SWE-bench Pro).
- Razonamiento matemático de competición (AIME 2026) y conocimiento experto (GPQA Diamond, MMLU-Pro).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Integración con endpoints compatibles y despliegue en vLLM con tensor parallelism.

## Casos de uso

- Agentes de ingeniería de software: el modelo puede resolver issues reales de repositorios (SWE-bench Verified 79,4; SWE-bench Pro 63,6) integrándose en pipelines de CI/CD mediante tool calling y el parser `qwen3_coder` de vLLM.
- Automatización de terminal y operaciones: con Terminal-Bench 2.1 de 86,1, es adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos shell.
- Asistencia a la investigación científica: GPQA Diamond de 92,9 y MMLU-Pro de 88,2 lo hacen viable para responder preguntas de nivel experto en dominios técnicos, siempre con verificación humana.
- Análisis de documentación multimodal: al aceptar imagen y vídeo, puede procesar capturas, diagramas o grabaciones junto a texto para generar resúmenes o extraer información estructurada.
- Razonamiento matemático y tutoría avanzada: AIME 2026 de 100 en la evaluación del autor lo posiciona para resolver problemas de competición y explicar el razonamiento paso a paso.
- Despliegue en infraestructura con aceleradores FP4: al reducir el footprint de los expertos a 4 bits, permite servir un MoE de 180.000 millones de parámetros en clústeres con GPUs compatibles NVFP4 usando tensor parallelism de 4, según la receta de vLLM.
- Generación de código en producción: LiveCodeBench de 95,0 respalda su uso en autocompletado, revisión y generación de tests dentro de herramientas de desarrollo.

## Benchmarks y rendimiento

Resultados publicados por el autor (evaluación con Inspect sobre servidor vLLM, semilla única):

| Categoria | Benchmark | Qwen3.8-Flash-Next (base) | RedHatAI NVFP4 | Inferact NVFP4 | NVIDIA NVFP4 |
|---|---|---|---|---|---|
| Razonamiento | GPQA Diamond | 90,4 | 92,9 | 91,4 | 92,4 |
| Conocimiento | MMLU-Pro | 88,5 | 88,2 | 88,0 | 88,0 |
| Matematicas | AIME 2026 | 96,7 | 100 | 100 | 100 |
| Coding & Agents | LiveCodeBench | 95,0 | 95,0 | 94,0 | 95,0 |
| Coding & Agents | Terminal-Bench 2.1 | 85,5 | 86,1 | 84,5 | 86,4 |
| Coding & Agents | SWE-bench Verified | 80,6 | 79,4 | 79,8 | 79,8 |
| Coding & Agents | SWE-bench Pro | 62,9 | 63,6 | 60,9 | 62,8 |
| Coding & Agents | DeepSWE 1.1 | 66,0 | 62,3 | 58,1 | 56,7 |

Recuperación media de precisión reportada: 99,1 % para RedHatAI, 97,6 % para Inferact y 98,0 % para NVIDIA. La recuperación se define como min(puntuación cuantizada / puntuación sin cuantizar × 100, 100).

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 186,5 GB; con los expertos en FP4 y el resto en BF16, el peso en memoria es sustancialmente menor que un checkpoint BF16 equivalente de 180.000 millones de parámetros, aunque el dato exacto de VRAM en inferencia no está disponible.
- GPUs recomendadas: aceleradores con soporte nativo NVFP4 (generación Blackwell y posteriores) para aprovechar la cuantización; el autor valida el despliegue con tensor-parallel-size 4.
- GPU de consumo: no disponible; el tamaño del modelo y la necesidad de soporte FP4 hacen improbable su ejecución en GPUs consumer convencionales.
- Opciones de despliegue: vLLM (validado en 0.31.0), con integración en RHOAI 3.6.0 y RHAIIS 3.6.0. El formato compressed-tensors es específico de este stack; no se menciona soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Recuperacion media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/Qwen3.8-Flash-Next-NVFP4 | 179.999.981.459 | NVFP4 en expertos MoE | 99,1 % | no disponible | Hugging Face, vLLM |
| Inferact/Qwen3.8-Flash-Next-NVFP4 | mismo base | NVFP4 | 97,6 % | no disponible | Hugging Face |
| nvidia/Qwen3.8-Flash-Next-NVFP4 | mismo base | NVFP4 | 98,0 % | no disponible | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (base) | 179.999.981.459 | BF16 | referencia | no disponible | Hugging Face |

Las tres variantes NVFP4 parten del mismo modelo base y difieren en los datos de calibración y en la implementación de los observers. RedHatAI obtiene la mayor recuperación media, con ventajas claras en DeepSWE 1.1 (62,3 frente a 58,1 y 56,7) y SWE-bench Pro (63,6 frente a 60,9 y 62,8), aunque pierde ligeramente en SWE-bench Verified (79,4 frente a 79,8).

## Limitaciones y advertencias

- La licencia no está disponible en la información proporcionada; no puede confirmarse el uso comercial sin consultar el repositorio del modelo base.
- Los idiomas soportados no están documentados; no se puede garantizar cobertura multilingüe.
- La cuantización NVFP4 requiere hardware compatible; en GPUs sin soporte FP4 el modelo puede no ejecutarse o degradar su rendimiento.
- El formato compressed-tensors está orientado a vLLM; no hay evidencia de compatibilidad con otros motores de inferencia.
- La evaluación se realizó con semilla única y servidor vLLM, sin intervalos de confianza; las diferencias de pocas décimas entre variantes pueden no ser estadísticamente significativas.
- El modelo puede alucinar en tareas de conocimiento experto y generación de código; se recomienda verificación en producción.
- No se dispone de información sobre sesgos conocidos, datos de entrenamiento ni políticas de seguridad del modelo base.
- El tamaño del checkpoint (186,5 GB) y los 180.000 millones de parámetros implican costes de despliegue elevados y necesidad de tensor parallelism.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Qwen3.8-Flash-Next-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Receta de vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Inspect (framework de evaluación): https://github.com/UKGovernmentBEIS/inspect_ai
- Dataset de calibración open-perfectblend: https://huggingface.co/datasets/mlabonne/open-perfectblend
