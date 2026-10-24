# drakarah/Qwen3.6-35B-A3B-EdgeLLM-INT4

## Resumen

`drakarah/Qwen3.6-35B-A3B-EdgeLLM-INT4` es una exportación en INT4 del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario drakarah para el proyecto faster-llm-poc, un fork de TensorRT Edge-LLM de NVIDIA. El objetivo no es servir el modelo de forma convencional, sino permitir que un MoE de 35B parámetros funcione en una GPU de 8 GB manteniendo los pesos de los expertos en la RAM del sistema y transmitiendo por PCIe únicamente los expertos que cada token necesita. El repositorio contiene un grafo ONNX y pesos safetensors, no un motor TensorRT listo para usar: el motor debe compilarse en la máquina destino porque los engines de TensorRT solo cargan en la GPU y versión exactas que los construyeron.

El modelo base, desarrollado por el equipo Qwen, es un MoE con 35B parámetros totales y 3B activos por token, con una pila híbrida que combina atención lineal Gated DeltaNet con capas de atención con compuertas, entrada de visión y 262K tokens de contexto nativo ampliables hasta 1M. Sobre esa base, esta exportación aplica GPTQ por capas con grupo de 128 y simetría, cuantizando a INT4 tanto los expertos enrutados como los pesos densos, y dejando en FP16 el router, las normas y las proyecciones pequeñas a/b de GDN. La caché KV se cuantiza a INT8 con escalas por capa calibradas específicamente para este modelo.

La relevancia inmediata es de ingeniería de despliegue: el autor reporta que en un portátil con RTX 4060 (8 GB) una carga de trabajo de 60 peticiones con tool calling se ejecuta varias veces más rápido que llama.cpp con los expertos en CPU. Es un artefacto experimental, con 0 descargas y 0 likes en el momento de la consulta, orientado a quienes quieran reproducir o auditar esa estrategia de streaming de expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: atención lineal Gated DeltaNet + capas de atención con compuertas; enrutado disperso de expertos |
| Parametros totales | 35B (modelo base) |
| Parametros activos | 3B por token (modelo base) |
| Longitud de contexto | 262K nativo, extensible a 1M en el modelo base; el comando de build documentado configura `maxInputLen 12288` y `maxKVCacheCapacity 12288` |
| Tipos de cuantizacion | INT4 grupo 128 simétrico con GPTQ por capas (expertos enrutados y pesos densos); FP16 para router, normas y proyecciones a/b de GDN; caché KV en INT8 con escalas por capa |
| Idiomas soportados | No disponible en los metadatos; el corpus de calibración GPTQ usó Wikipedia genérica en neerlandés, inglés y francés, más código fuente |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`) y safetensors (`external_int4_moe_weights.safetensors`, `embedding.safetensors`); no es un engine TensorRT precompilado |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un MoE post-entrenado con codificador de visión, construido sobre una pila híbrida de bloques Gated DeltaNet (atención lineal) y bloques de atención con compuertas, con enrutado disperso que activa 3B de los 35B parámetros por token. Solo 10 capas de atención completa mantienen caché KV, lo que reduce de forma sustancial el coste de memoria asociado al contexto. El modelo base incorpora además una opción de preservación del modo de razonamiento (thinking preservation) según la documentación de proveedores que lo sirven. Los detalles concretos de composición del dataset de preentrenamiento, número de tokens y etapas de RLHF/DPO del modelo base no están disponibles en la información proporcionada.

Esta exportación no reentrena el modelo: cuantiza los pesos mediante GPTQ por capas, calculando los parámetros de cuantización sobre los tokens que efectivamente se enrutan a cada experto, con 256 muestras de 1.024 tokens de Wikipedia genérica en neerlandés, inglés y francés más código fuente. Los expertos enrutados se empaquetan en `external_int4_moe_weights.safetensors` (16 GB) y se mantienen en RAM del host durante el servicio; el grafo ONNX y los pesos densos (shared expert, `lm_head`, proyecciones de atención y GDN) ocupan 1,5 GB; la tabla de embeddings queda en FP16 en memoria del host. La innovación operativa es el streaming por etapas de expertos hacia la GPU, controlado por variables como `EDGELLM_MOE_STAGE_EXPERTS=2`, `EDGELLM_MOE_TOKEN_TILE=4096` y `EDGELLM_XQA_MULTI_BLOCK=auto`, junto con un enrutado cache-aware que prioriza expertos ya residentes en la GPU (con `CACHE_BIAS=0.5` por defecto).

## Capacidades

- Generación de texto y razonamiento multi-paso en el modelo base, con modo de pensamiento preservable entre turnos.
- Generación y edición de código: el autor reporta HumanEval pass@1 de 155/164 en esta exportación INT4, y fuentes externas citan 73,4% en SWE-bench para el modelo base.
- Tool calling y function calling: la carga de trabajo de referencia del proyecto es precisamente un conjunto de 60 peticiones con tool calling.
- Entrada de visión en el modelo base (codificador de visión); la exportación documentada no detalla el tratamiento del grafo de visión, por lo que su disponibilidad en este artefacto concreto es no disponible.
- Contexto largo: hasta 262K tokens nativos en el modelo base, con caché KV INT8 que ocupa 1,25 GB a 128K de contexto en lugar de 2,5 GB.
- Multilingüismo: el modelo base se sirve comercialmente como multilingüe, pero esta ficha no dispone de la lista declarada de idiomas para la exportación.
- Despliegue edge con streaming de expertos: capacidad específica de este artefacto, no del modelo base.

## Casos de uso

- Agentes locales con tool calling en GPU de consumo: el escenario validado por el autor es un flujo de 60 peticiones con llamadas a herramientas sobre una RTX 4060 de portátil con 8 GB, donde el streaming de expertos desde RAM evita el degrade a CPU puro de llama.cpp. Adecuado para asistentes de escritorio que deben ejecutar herramientas del sistema sin depender de la nube.
- Asistencia de programación en estación de trabajo: con 155/164 en HumanEval pass@1 en INT4, el modelo sirve para autocompletado, generación de tests y refactorización en entornos donde no se quiere enviar código a un proveedor externo.
- RAG sobre documentos largos: la ventana nativa de 262K tokens y la caché KV INT8 permiten indexar y consultar manuales extensos; el test de recuperación de hechos plantados dio 27/27 con prompts de 2K, 4K y 6K tokens en las tres profundidades (10%, 50%, 90%).
- Prototipado y validación de despliegues TensorRT: al no ser un engine precompilado, el repositorio sirve para construir el motor en la GPU objetivo (`llm_build --onnxDir llm --engineDir engine ...`) y medir latencia real antes de comprometerse con una arquitectura de serving.
- Evaluación comparativa de cuantizaciones: el proyecto reporta que todas las variantes de cuantización probadas caen en el rango 150-156/164 en HumanEval, lo que permite usar este artefacto como punto de referencia al comparar INT4 GPTQ frente a GGUF UD-Q4_K_M u otros esquemas.
- Automatización de pipelines internos de varias etapas: con `maxBatchSize 1` y un motor compilado para una GPU concreta, encaja en workers de un solo flujo que procesan tareas encadenadas (extracción, razonamiento, llamada a API) sin colas de batching.
- Investigación sobre enrutado de expertos: la variable `CACHE_BIAS` y el impacto medido de +0,09% en perplejidad frente al enrutado exacto lo convierten en un banco de pruebas para estudiar políticas de caché de expertos.

## Benchmarks y rendimiento

Resultados reportados por el autor, decodificación greedy, sobre RTX 4060 de portátil (8 GB):

| Prueba | Este modelo (INT4 + KV INT8) | Referencia indicada |
|---|---|---|
| Recuperación de hechos plantados (3 hechos por prompt, profundidades 10/50/90%, prompts de 2K/4K/6K, 3 ejecuciones, enrutado exacto) | 27/27 | llama.cpp UD-Q4_K_M: 27/27 |
| Recuperación con enrutado cache-aware (`CACHE_BIAS=0.5`) | 27/27 | No disponible |
| HumanEval pass@1 | 155/164 (94,5%) | 150-156/164 en todas las variantes de cuantización probadas |
| Perplejidad en held-out | +0,09% con enrutado cache-aware por defecto (`CACHE_BIAS=0.5`); enrutado exacto con `CACHE_BIAS=0` | No disponible |
| Carga de tool calling de 60 peticiones | Varias veces más rápida que llama.cpp con expertos en CPU (sin cifra concreta) | llama.cpp con expertos en CPU |

Datos del modelo base citados por fuentes externas, no verificados en esta ficha: 73,4% en SWE-bench. No se han publicado resultados de MMLU, GSM8K ni de benchmarks de visión para esta exportación en la información disponible.

## Requisitos de hardware

- VRAM: el escenario validado es una GPU de 8 GB (RTX 4060 de portátil). Los pesos densos y el grafo ocupan 1,5 GB; a ello se suma la caché KV INT8 (1,25 GB a 128K de contexto, menos a 12K) y los expertos en tránsito según `EDGELLM_MOE_STAGE_EXPERTS`.
- RAM del sistema: imprescindible y dimensionante. Solo el fichero de expertos enrutados pesa 16 GB, y el repositorio completo 18,7 GB; hay que añadir la tabla de embeddings y el propio runtime. Un equipo con 32 GB de RAM es el mínimo razonable para el escenario descrito.
- GPU recomendadas: RTX 4060 de portátil (probada por el autor). Cualquier GPU con 8 GB o más debería poder alojar el grafo y la caché, pero no hay validaciones publicadas en otras tarjetas (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, con el esquema de streaming de expertos desde RAM; no cabe entera en 8 GB sin ese esquema.
- Despliegue: TensorRT Edge-LLM mediante el fork faster-llm-poc, con `docker compose up` (descarga el repo y compila el motor, unos 2 minutos en la máquina de pruebas) o build manual con `llm_build --onnxDir llm --engineDir engine --maxInputLen 12288 --maxKVCacheCapacity 12288 --maxBatchSize 1` y las variables `EDGELLM_MOE_STAGE_EXPERTS=2`, `EDGELLM_MOE_TOKEN_TILE=4096`, `EDGELLM_XQA_MULTI_BLOCK=auto`. No es compatible con vLLM, TGI ni Ollama en este formato.
- Latencia y throughput: no disponible en cifras absolutas; solo la comparación cualitativa "varias veces más rápido" frente a llama.cpp con expertos en CPU, y la limitación de `maxBatchSize 1` en la configuración documentada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| drakarah/Qwen3.6-35B-A3B-EdgeLLM-INT4 | 35B totales, 3B activos | 262K nativo (base); 12K configurado en el build documentado | INT4 GPTQ grupo 128 + KV INT8 | Apache-2.0 | ONNX + safetensors; requiere compilar engine TensorRT en destino |
| Qwen/Qwen3.6-35B-A3B (base, BF16) | 35B totales, 3B activos | 262K nativo, hasta 1M | BF16 | Apache-2.0 | Safetensors; referencia de calidad frente a la que se mide la pérdida de esta cuantizacion |
| Qwen3.6-35B-A3B UD-Q4_K_M (llama.cpp) | 35B totales, 3B activos | Limitado por la implementación de llama.cpp, no disponible | GGUF Q4_K_M con expertos en CPU | Apache-2.0 | GGUF; desplegable en llama.cpp y Ollama, mas lento que este artefacto en el escenario del autor |
| Qwen3.6-35B-A3B FP8 (Together AI) | 35B totales, 3B activos | 262K, hasta 1M | FP8 | Apache-2.0 (servicio propietario) | API gestionada; mayor calidad que INT4 pero requiere nube |

## Limitaciones y advertencias

- Pérdida de calidad asumida: son pesos INT4 y el autor declara explícitamente que no se reclama equivalencia con el modelo BF16; la pérdida se acota con perplejidad (+0,09% con enrutado cache-aware) y HumanEval (155/164), no con una batería completa.
- El enrutado cache-aware por defecto (`CACHE_BIAS=0.5`) no es exacto; quien necesite máxima fidelidad debe usar `CACHE_BIAS=0`, con el coste de aciertos de caché que ello implique.
- No es un motor listo para producción: un engine TensorRT solo carga en la GPU y versión de TensorRT que lo construyó, de modo que cada destino requiere compilación propia y validación.
- Configuración documentada con `maxBatchSize 1`: no apta para serving concurrente de alto rendimiento sin trabajo adicional de batching.
- Idiomas soportados no declarados en los metadatos; el neerlandés, inglés y francés de la calibración son datos de cuantización, no una garantía de cobertura lingüística.
- Visión: el modelo base tiene codificador de visión, pero esta exportación no documenta el grafo ni el procedimiento para esa modalidad; no asumir su disponibilidad.
- Riesgo de alucinación: no evaluado en la información disponible para esta cuantización; los tests publicados miden recuperación de hechos plantados, no veracidad en generación abierta.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, un único autor y un proyecto asociado en fase de prueba de concepto; no hay historial de mantenimiento.
- Licencia Apache-2.0 permisiva para uso comercial, heredada del modelo base; conservar atribución al equipo Qwen y el aviso de que se trata de un derivado cuantizado.

## Enlaces

- Repositorio HuggingFace de esta exportación: https://huggingface.co/drakarah/Qwen3.6-35B-A3B-EdgeLLM-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Proyecto faster-llm-poc (fork de TensorRT Edge-LLM): https://github.com/drakarah/faster-llm-poc
- Ficha del modelo en Together AI (FP8): https://www.together.ai/models/qwen3-6-35b-a3b-fp8
- Catálogo de Microsoft Foundry: https://ai.azure.com/catalog/models/FW-Qwen3.6-35B-A3B
- Catálogo NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/teams/qwen/models/qwen3.6-35b-a3b
- Guía divulgativa con datos de SWE-bench: https://www.aimadetools.com/blog/qwen-3-6-35b-a3b-complete-guide/
