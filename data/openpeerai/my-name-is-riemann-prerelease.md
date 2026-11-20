# OpenPeerAI/My-Name-is-Riemann-Prerelease

## Resumen

My Name is Riemann Prerelease es un modelo de lenguaje causal decoder-only de 13.110.702.080 parámetros (13,1B) desarrollado por OpenPeer AI, Riemann Computing Inc. y Andrew Magdy Kamal. Se construye mediante un proceso de crecimiento progresivo ("growth ladder") a partir de los pesos publicados de OpenPeerAI/OpenPeerLLM (163M de parámetros), que se ensanchan y profundizan rung a rung hasta alcanzar la forma final. La versión publicada corresponde al escalón 6 de diez de esa escalera.

El modelo se presenta como prerelease: es completo y cargable, pero el escalón final de 13,1B se ha entrenado con 2.160 millones de tokens de un corpus de 2.300 millones, y el autor anuncia entrenamiento adicional en futuras versiones. El ajuste fino no emplea LoRA, sino el OpenPeer-AI-NTK-Trainer, un controlador de compuertas logarítmicas firmadas (~6.732) ajustado sobre las salidas de las capas del modelo congelado, de modo que los pesos base nunca se modifican y el controlador se distribuye como archivo separado.

Es relevante por su enfoque poco habitual (crecimiento progresivo de arquitectura más ajuste basado en teoría de kernels neuronales en lugar de adaptadores convencionales), por su soporte declarado de inglés, árabe y código fuente, y por estar orientado a hardware AMD (ROCm, MI325X, Ryzen AI, DirectML). La licencia combina OPNL-2 y MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (arquitectura OpenPeerLLM, clase `RiemannForCausalLM`) |
| Parámetros totales | 13.110.702.080 (13,1B) en fp32 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en fp32; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | Inglés, árabe y código fuente |
| Licencia | Open Innovation License v2 (OPNL-2) y MIT |
| Formato de pesos | safetensors (once shards, 52,4 GB), con código remoto (`custom_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal que reimplementa fielmente la arquitectura de OpenPeerLLM, cargando su checkpoint tensor a tensor. Sobre esa base se aplica una escalera de crecimiento de diez peldaños: en cada rung el checkpoint previo se ensancha y se profundiza hasta la siguiente forma, de manera que cada etapa hereda lo aprendido por la anterior y continúa el entrenamiento. La etapa publicada es la 6, con 13,1B de parámetros en fp32.

El entrenamiento combina un corpus mixto de transcripciones de coding agéntico, texto enciclopédico en árabe e inglés, tareas de world-model ejecutables, pares código-a-vídeo y código fuente en bruto, con un total de 2,30B de tokens GPT-2 en el corpus y 2,16B consumidos en el escalón 6 (6,5B acumulados a lo largo de la escalera). El entrenamiento se realizó en bf16 con 1.048.576 tokens por paso, alcanzando el paso 2.064, y se ejecutó con FSDP sobre hardware AMD (ROCm, MI325X) los días 19 y 20 de octubre de 2026.

La innovación técnica destacable es el ajuste fino mediante OpenPeer-AI-NTK-Trainer: en lugar de LoRA u otros adaptadores, se ajustan unos pocos miles de compuertas logarítmicas firmadas sobre las salidas de las capas del modelo congelado, con un objetivo derivado de la teoría de kernels neuronales (NTK). El controlador resultante es un archivo pequeño que acompaña al checkpoint y no altera los pesos base.

## Capacidades

- Generación de texto causal en inglés y árabe, con soporte declarado de código fuente.
- Razonamiento y reescritura de texto (etiquetas `reasoning`, `rewriting`, `paraphrase`, `style-transfer`).
- Generación de código (`code gen`, `coding`).
- Capacidades multimodales declaradas en las etiquetas del repositorio (pares código-a-vídeo en el corpus); el alcance exacto no está documentado.
- Completado de artículos y análisis de sorpresa a nivel de token (la demo oficial expone surprisal por token y prueba de fluidez).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el corpus incluye transcripciones de coding agéntico.
- Modo "thinking": no disponible.

## Casos de uso

- Completado y continuación de artículos técnicos: la demo oficial expone completado de artículos y sorpresa por token, lo que permite usarlo para autocompletado editorial y análisis de perplejidad en dominios concretos.
- Reescritura y parafraseo de documentación: las etiquetas `rewriting`, `paraphrase` y `style-transfer` indican un uso previsto de transformación de estilo y reformulación de textos existentes.
- Generación de código en pipelines internos: el corpus incluye código fuente en bruto y transcripciones de coding agéntico, por lo que puede emplearse para sugerencias de código y generación de fragmentos en inglés.
- Procesamiento bilingüe inglés-árabe: es uno de los pocos modelos de su tamaño con soporte declarado de árabe, útil para traducción asistida, resumen y generación de contenido en árabe.
- Investigación sobre crecimiento progresivo de arquitecturas: al publicarse la escalera completa (rungs del 1 al 6) y el controlador NTK, sirve como banco de pruebas para estudiar cómo se transfiere el conocimiento entre formas de modelo.
- Experimentación con ajuste NTK frente a LoRA: el controlador de compuertas se distribuye por separado, lo que permite comparar el ajuste NTK con adaptadores convencionales sobre el mismo checkpoint congelado.
- Despliegue en entornos AMD: con soporte de ROCm, MI325X, Ryzen AI y DirectML, encaja en infraestructura AMD donde otros modelos no están optimizados.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Tarea | Configuración | Métrica | Valor |
|---|---|---|---|
| Predicción de siguiente token (held-out) | Pesos base del escalón 6 congelados | NLL | 1,3228 |
| Predicción de siguiente token (held-out) | Pesos base del escalón 6 congelados | Precisión | 67,73 % |
| Predicción de siguiente token (held-out) | Pesos del escalón 6 + controlador NTK (6.732 compuertas) | NLL | 1,3104 |
| Predicción de siguiente token (held-out) | Pesos del escalón 6 + controlador NTK (6.732 compuertas) | Precisión | 67,84 % |
| Pretraining | Corpus de cinco datasets, 2,30B tokens GPT-2 | Loss (CE final, paso 2.064) | 1,5888 |

El conjunto de validación son 1.000 pares held-out del finetune de jabarti y de primeros turnos de Fable. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan 52,4 GB, por lo que se necesita al menos ~55-60 GB de VRAM en fp32; en bf16 serían ~26 GB y en int8 ~13 GB (estimaciones a partir del recuento de parámetros, no confirmadas por el autor).
- GPU recomendadas: AMD Instinct MI325X (entorno de entrenamiento declarado, ROCm); para inferencia en fp32 se requiere una GPU con 64 GB o más (MI300X, MI325X, A100 80 GB, H100 80 GB).
- Cabe en GPU consumer: en fp32 no; en cuantizaciones de 8 o 4 bits podría caber en GPUs de 16-24 GB, pero el autor no publica pesos cuantizados ni confirma compatibilidad.
- Opciones de despliegue: `transformers` con código remoto (`trust_remote_code=True`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El stack declarado es ROCm, DirectML y Ryzen AI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| My Name is Riemann Prerelease | 13,1B | no disponible | OPNL-2 + MIT | Hugging Face, prerelease |
| OpenPeerAI/OpenPeerLLM | 163M | no disponible | no disponible en la información | Hugging Face |
| Alternativas de ~13B (p. ej. Llama, Mistral, Qwen) | ~13B | no disponible en la información | no disponible en la información | no disponible en la información |

No se dispone de datos de benchmarks comparables con modelos de la misma categoría en la información proporcionada; la única comparación documentada es con su modelo base, OpenPeerLLM de 163M, que la demo oficial presenta junto al Prerelease de 13,1B.

## Limitaciones y advertencias

- Estado prerelease: es el escalón 6 de 10 de la escalera de crecimiento y solo ha visto 2,16B de tokens; el autor anuncia más entrenamiento en versiones posteriores, por lo que el rendimiento puede cambiar sustancialmente.
- Métricas no verificadas: todos los resultados del model-index están marcados como `verified: false` y proceden del propio autor.
- Sin benchmarks estándar: no hay resultados publicados de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, lo que impide comparar con modelos establecidos.
- Idiomas limitados: solo inglés, árabe y código; no hay soporte declarado de castellano.
- Longitud de contexto no documentada: no se puede planificar su uso en conversaciones largas o documentos extensos sin verificación empírica.
- Licencia mixta OPNL-2 + MIT: es necesario revisar los términos de OPNL-2 antes de uso comercial; no es una licencia estándar tipo Apache 2.0.
- Código remoto: requiere `trust_remote_code=True`, con el riesgo de ejecución de código arbitrario que ello implica en producción.
- Riesgo de alucinación: inherente a un modelo de este tamaño con entrenamiento limitado; no hay evaluaciones de fidelidad publicadas.
- Sesgos: no documentados; el corpus incluye texto enciclopédico árabe e inglés y transcripciones de código, con posible sobrerrepresentación de esos dominios.
- Soporte de tool calling y agentes no confirmado: las etiquetas sugieren capacidades agénticas, pero no hay especificación de formato ni ejemplos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenPeerAI/My-Name-is-Riemann-Prerelease
- Modelo base OpenPeerLLM: https://huggingface.co/OpenPeerAI/OpenPeerLLM
- DOI del modelo base: https://doi.org/10.57967/hf/6469
- Entrenador NTK: https://huggingface.co/OpenPeerAI/OpenPeer-AI-NTK-Trainer
- Repositorio ntkmirror: https://github.com/leochlon/ntkmirror
- Demo básica: https://huggingface.co/spaces/OpenPeerAI/My-Name-is-Riemann-Prerelease-basic-demo
- Demo de OpenPeerLLM: https://huggingface.co/spaces/OpenPeerAI/OpenPeerLLM-Demo
- Demo del NTK Trainer: https://huggingface.co/spaces/OpenPeerAI/NTK-Trainer-Demo
- DOI del modelo: https://doi.org/10.57967/hf/11147
- Dataset Fable-5.1-Max-Reasoning-Filtered-10000x: https://huggingface.co/datasets/MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x
- Dataset jabarti-llm-dataset: https://huggingface.co/datasets/bakrianoo/jabarti-llm-dataset
- Dataset ExeWorldBench: https://huggingface.co/datasets/HelenPeng/ExeWorldBench
- Dataset CodeVideoBench: https://huggingface.co/datasets/code-video-model/CodeVideoBench
- Dataset PowerCoding: https://huggingface.co/datasets/Tiiny/PowerCoding
- Paper NTK (referencia): https://arxiv.org/abs/2502.04235
- Paper de referencia: https://arxiv.org/abs/2406.20094
- Paper de referencia: https://arxiv.org/abs/2406.19853
- Paper de referencia: https://arxiv.org/abs/1910.09700
