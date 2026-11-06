# archud/Qwen3.6-35B-A3B-REAP-64-experts-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF Q4_K_M del modelo `IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-64-experts`, una variante del Qwen3.6-35B-A3B sometida a poda de expertos (expert pruning) mediante la técnica REAP, que reduce el número de expertos del bloque MoE a 64. El autor del repositorio, `archud`, se limita a convertir los pesos a formato GGUF usando el espacio GGUF-my-repo de ggml.ai, sin aportar información adicional sobre entrenamiento, datos o evaluación.

El modelo base es de tipo MoE (mixture of experts) con arquitectura `qwen3_5_moe`, orientado a tareas multimodales de imagen-texto según el pipeline declarado (`image-text-to-text`). Los pesos en safetensors del checkpoint cuantizado suman 10.485.691.008 parámetros reales, aunque la nomenclatura del repositorio hace referencia a un modelo de 35B con 3B activos antes de la poda; tras el recorte a 64 expertos el número efectivo de parámetros disminuye, y el tamaño del repositorio GGUF es de 6,5 GB.

La relevancia de esta ficha es doble: por un lado, documenta una receta de compresión (REAP + cuantización Q4_K_M) que permite ejecutar un MoE grande en hardware de consumo; por otro, advierte de que se trata de un artefacto derivado de terceros, sin model card propia, sin benchmarks publicados y con cero descargas, por lo que su uso en producción exige validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con poda de expertos REAP a 64 expertos |
| Parametros totales | 10.485.691.008 (safetensors del checkpoint cuantizado); el nombre del repo indica 35B-A3B antes de la poda |
| Parametros activos | No disponible tras la poda (el modelo original se denomina A3B, es decir, 3B activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (única incluida en este repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`qwen3.6-35b-a3b-reap-64-experts-q4_k_m.gguf`); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer con capas de mezcla de expertos (MoE), identificado por el tag `qwen3_5_moe`, lo que sugiere una evolución de la familia Qwen3.5 con enrutamiento disperso. Sobre ese modelo base se aplica REAP (expert pruning), una técnica que elimina expertos completos del bloque MoE según su relevancia, reduciendo el total a 64 expertos. El resultado es un checkpoint con menos parámetros y menor huella de memoria, a costa de una posible pérdida de capacidad en dominios poco representados por los expertos eliminados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias, ni en el modelo original ni en la variante podada. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal, etc.). El pipeline declarado `image-text-to-text` indica que el modelo base incorpora un codificador visual, aunque este repositorio no detalla cómo se preserva esa capacidad tras la poda ni tras la conversión a GGUF.

## Capacidades

- Generación de texto conversacional en formato instruct, según el tag `conversational`.
- Procesamiento multimodal imagen-texto, de acuerdo con el pipeline `image-text-to-text` declarado en el modelo base.
- Razonamiento y matemáticas: capacidades esperables por herencia de la familia Qwen3.5, aunque no verificadas en este checkpoint.
- Generación de código: no documentada específicamente para esta variante podada.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; el autor no declara lista de idiomas.
- Modo thinking explícito: no documentado.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: el archivo GGUF Q4_K_M de 6,5 GB permite cargar el modelo en GPUs con 8-12 GB de VRAM mediante llama.cpp, algo inviable con el checkpoint original de 35B.
- Prototipado de asistentes multimodales: el pipeline `image-text-to-text` habilita experimentos de descripción de imágenes y respuesta a preguntas visuales, siempre que se valide la calidad tras la poda.
- Inferencia en CPU o entornos sin acelerador dedicado: al ser GGUF y estar pensado para llama.cpp, puede ejecutarse en servidores sin GPU, con throughput limitado.
- Evaluación comparativa de técnicas de poda: sirve como caso de estudio para medir el impacto de REAP con 64 expertos frente al modelo original en tareas de razonamiento y generación.
- Generación de texto conversacional offline: integrable en aplicaciones de escritorio o embebidas que requieran un modelo local sin dependencia de API.
- Investigación sobre cuantización: útil para analizar la degradación Q4_K_M en arquitecturas MoE podadas, comparando perplejidad y calidad de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, ni comparaciones con el modelo base sin podar.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7-8 GB para el archivo Q4_K_M de 6,5 GB, incluyendo overhead de contexto y caché KV.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en el segmento profesional, A100 o H100 para servir múltiples instancias.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM; con 6-8 GB puede requerir offload parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato GGUF, otros runners basados en llama.cpp como Ollama o LM Studio (no verificados en la información disponible). vLLM y TGI no soportan GGUF de forma nativa para este tipo de MoE sin conversión adicional.
- Latencia y throughput: no disponibles; dependerán del hardware y del número de tokens de contexto configurado (el ejemplo de la model card usa `-c 2048`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| archud/Qwen3.6-35B-A3B-REAP-64-experts-Q4_K_M-GGUF | 10,49B reales en safetensors cuantizados; 35B-A3B nominal antes de poda | No disponible | Apache 2.0 | GGUF | Variante podada con REAP y cuantizada Q4_K_M |
| IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-64-experts (modelo base) | 35B-A3B nominal, podado a 64 expertos | No disponible | Apache 2.0 | Safetensors | Checkpoint del que deriva esta conversión |
| Qwen3.6-35B-A3B original (sin poda) | 35B totales, 3B activos | No disponible en la información | Apache 2.0 (esperable por familia) | Safetensors | Mayor huella de memoria; requiere hardware superior |

No se dispone de datos de rendimiento comparado entre estas variantes, por lo que la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Artefacto derivado sin model card propia: el autor solo documenta la conversión a GGUF, no el entrenamiento ni la evaluación.
- Sin benchmarks publicados: no hay evidencia de que la poda REAP a 64 expertos preserve la calidad del modelo original.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni informes de uso.
- Riesgo de alucinación y degradación tras la poda: la eliminación de expertos puede afectar desproporcionadamente a dominios especializados.
- Idiomas no declarados: no se puede garantizar un rendimiento multilingüe equilibrado.
- Contexto no especificado: el ejemplo de la model card usa 2048 tokens, pero no se confirma la ventana máxima soportada en esta conversión.
- Capacidad multimodal incierta: aunque el pipeline es `image-text-to-text`, no se detalla si el proyector visual se preserva correctamente en GGUF.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado de un modelo de terceros conviene verificar la licencia del checkpoint original y de Qwen3.6.
- Nombre del repositorio potencialmente engañoso: indica 35B-A3B cuando los pesos cuantizados declaran 10,49B de parámetros reales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/archud/Qwen3.6-35B-A3B-REAP-64-experts-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-64-experts
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
