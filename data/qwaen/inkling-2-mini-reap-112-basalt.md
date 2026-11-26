# qwaen/Inkling-2-Mini-REAP-112-Basalt

## Resumen

Inkling 2 Mini REAP 112 · Basalt es una derivación podada del modelo multimodal Inkling 2 Mini de Thinking Machines Lab, publicada por el usuario qwaen. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) orientado a tareas image-text-to-text, en el que se han conservado 112 de los 128 expertos enrutados por capa física mediante la técnica REAP (expert pruning guiado por saliencia), manteniendo un enrutamiento top-8 y un bloque repetido que se ejecuta tres veces.

La poda se realizó con LLM Compressor's ExpertPruner sobre estadísticas de saliencia recogidas en 65 trayectorias de calibración de OpenCode que suman 679.958 tokens, cubriendo 24 capas físicas y 48 visitas de capa. El empaquetado preserva los valores originales de los expertos y las escalas de bloque en NVFP4 para las capas 0–19 y MXFP8 para las capas 20–23, e incluye la torre de visión y el drafter DSpark.

Su relevancia radica en que reduce el número de expertos manteniendo el rendimiento en tareas de código: el perfil de colocación estándar remapeado superó 6 de 6 tareas retenidas de OpenCode, y el perfil REAP opcional con spec=16 logró también 6 de 6 con una mediana de 115,41 tokens/s en generaciones de 2.048 tokens con contexto de 16.384. El repositorio ocupa 17,6 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal con bloque repetido (3 repeticiones), torre de visión y drafter DSpark |
| Parametros totales | no disponible |
| Parametros activos | top-8 expertos enrutados de 112 retenidos por capa física (originalmente 128) |
| Longitud de contexto | 16.384 tokens (contexto usado en las mediciones; máximo no especificado) |
| Tipos de cuantizacion | NVFP4 (capas 0–19), MXFP8 (capas 20–23), Q8_0 para algunas proyecciones densas originalmente BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Basalt (pack propietario del runtime Basalt); incluye router patch para 112 expertos |

## Arquitectura y entrenamiento

El modelo parte de Inkling 2 Mini de Thinking Machines Lab, una arquitectura MoE multimodal con torre de visión y un drafter DSpark para decodificación especulativa. La derivación aplica REAP (expert pruning por saliencia) conservando 112 de 128 expertos enrutados por capa física, con enrutamiento top-8 y un bloque repetido que se ejecuta tres veces. Las estadísticas de saliencia se recogieron sobre 65 trayectorias de OpenCode (679.958 tokens), cubriendo 24 capas físicas y 48 visitas de capa, y el ranking de expertos lo realizó LLM Compressor's ExpertPruner.

El empaquetado lo realiza un exportador específico de ModelOpt que copia las filas empaquetadas retenidas; el manifiesto lista los índices originales conservados en cada capa. Se preservan los valores originales de los expertos y las escalas de bloque en NVFP4 (capas 0–19) y MXFP8 (capas 20–23), y Basalt empaqueta algunas proyecciones densas originalmente BF16 como Q8_0. No se especifican en la información disponible los datos de entrenamiento originales, el número de tokens de preentrenamiento ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto multimodal image-text-to-text (entrada de imagen y texto).
- Razonamiento y generación de código, evidenciado por la evaluación sobre tareas de OpenCode.
- Enrutamiento MoE top-8 sobre 112 expertos retenidos por capa física.
- Decodificación especulativa mediante el drafter DSpark incluido en el pack.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque las tareas de OpenCode sugieren uso en entornos de agente de código.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistencia de código en IDE o CLI: el modelo se evaluó sobre tareas de OpenCode y mantiene 6 de 6 tareas retenidas, por lo que es adecuado para autocompletado, refactorización y resolución de tareas de agente en entornos de desarrollo.
- Despliegue en hardware consumer: con 17,6 GB de repo y cuantización NVFP4/MXFP8, cabe en GPUs de gama media-alta como la RTX 5060 Ti empleada en las mediciones, lo que permite servir un MoE multimodal en estación de trabajo.
- Inferencia de baja latencia con decodificación especulativa: el drafter DSpark y el perfil REAP con spec=16 permiten alcanzar medianas de 115,41 tokens/s con contexto de 16.384 tokens, útil para chat interactivo y generación larga.
- Procesamiento de documentos con imagen y texto: al ser image-text-to-text, puede emplearse para extracción y razonamiento sobre capturas, diagramas o documentación técnica combinada con texto.
- Pipelines de CI/CD con presupuesto de VRAM ajustado: la poda a 112 expertos reduce el peso del modelo frente al original, facilitando su integración en runners con GPU limitada.
- Investigación sobre poda de MoE: el manifiesto de índices retenidos y los perfiles de colocación (experts-shipped.prof y experts-reap.prof) sirven como base para estudiar el impacto de REAP en calidad y throughput.

## Benchmarks y rendimiento

| Evaluación | Resultado |
|---|---|
| Tareas retenidas de OpenCode, perfil de colocación estándar remapeado | 6/6 superadas |
| Tareas retenidas de OpenCode, perfil REAP opcional con spec=16 | 6/6 superadas |
| Throughput mediano (3 generaciones de 2.048 tokens, contexto 16.384, RTX 5060 Ti, Docker/WSL2) | 115,41 tokens/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo pesa 17,6 GB y las mediciones se realizaron en una RTX 5060 Ti, lo que sugiere que el pack cabe en GPUs con 16 GB o más, aunque no se confirma.
- GPU recomendadas: RTX 5060 Ti (verificada en las pruebas); otras GPUs no disponibles.
- Cabe en consumer GPU: sí, al menos en RTX 5060 Ti según las mediciones del autor.
- Opciones de despliegue: runtime Basalt (commit 5b8a82c6b7e1069adbce42854e0732b2b19e4f32) con el parche inkling-112-router.patch y el target inkling2; comando de ejemplo: `basalt serve Inkling-2-Mini-112-NVFP4-MX8.basalt --kv fp8 --max-context 16384 --spec 16 --expert-profile experts-shipped.prof`.
- Latencia y throughput: mediana de 115,41 tokens/s en las condiciones indicadas; no se dispone de más datos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini REAP 112 · Basalt | 112 de 128 expertos retenidos, top-8 | 16.384 (usado en pruebas) | Apache 2.0 | Hugging Face (qwaen) |
| Inkling 2 Mini (original) | 128 expertos, top-8 | no disponible | no disponible en la información | Hugging Face (thinkingmachines) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- La poda a 112 expertos puede degradar capacidades no cubiertas por el conjunto de calibración de OpenCode; la evaluación se limita a 6 tareas retenidas.
- Requiere un runtime específico (Basalt) con un parche de router y un commit concreto; no es compatible con vLLM, llama.cpp u Ollama según la información disponible.
- El formato de pesos Basalt y las cuantizaciones NVFP4/MXFP8 limitan la portabilidad a otros stacks de inferencia.
- Las mediciones de throughput se realizaron en una única GPU (RTX 5060 Ti) bajo Docker Desktop/WSL2, por lo que no son representativas de otros entornos.
- Idiomas soportados no disponibles; riesgo de comportamiento degradado en lenguas distintas de las usadas en el modelo base.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus condiciones deben verificarse por separado.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/qwaen/Inkling-2-Mini-REAP-112-Basalt
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/7a67ae2314b44ef05c87fd1d4d311c58aaeb18f6
- Guía de Basalt para Inkling: https://github.com/jesdga95/basalt/blob/5b8a82c6b7e1069adbce42854e0732b2b19e4f32/docs/models/inkling2.md
