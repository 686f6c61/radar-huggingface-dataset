# DevelopingDad/Qwen3.8-Flash-Next-FP4-Local-Abliterated

## Resumen

Qwen3.8-Flash-Next-FP4-Local-Abliterated es una modificación por abliteración del checkpoint cuantizado de NVIDIA `nvidia/Qwen3.8-Flash-Next-FP4-Local`, que a su vez deriva del modelo original `Qwen/Qwen3.8-Flash-Next` del equipo Qwen. El autor del derivado es el usuario DevelopingDad, que aplica una edición directa de pesos (estilo Heretic) para reducir el comportamiento de rechazo aprendido, sin necesidad de adaptadores ni hooks en tiempo de ejecución. El resultado conserva exactamente la estructura de tensores, dtypes y formas del checkpoint base, de modo que sigue siendo compatible con el contenedor vLLM B12X que NVIDIA exige para este formato.

El modelo es multimodal (texto e imagen de entrada, texto de salida) y está pensado para ejecutarse en hardware compacto: un único DGX Spark con GB10 y 128 GB de memoria unificada, usando embeddings n-gram respaldados por disco y un límite de 104 GiB de memoria del contenedor. El checkpoint ocupa aproximadamente 96 GiB en disco (unos 102 GB repartidos en 21 shards) y declara 187.931.804.131 parámetros totales en safetensors, si bien la model card describe 125B parámetros de lenguaje con 6B activos, más una tabla de embeddings n-gram de 51B y una capa MTP de 4B.

La relevancia actual del modelo es doble: por un lado, demuestra que la abliteración se puede aplicar sobre formatos cuantizados mixtos (NVFP4 en expertos enrutados, MXFP8 en atención y proyecciones de expertos compartidos) manteniendo el layout del base; por otro, ofrece una alternativa con muchas menos negativas a peticiones para entornos de investigación donde los rechazos del modelo alineado resultan un obstáculo. La licencia es el NVIDIA Open Model Agreement, con las condiciones adicionales del modelo Qwen subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y capa MTP; multimodal texto-imagen; derivado cuantizado del base Qwen3.8-Flash-Next |
| Parametros totales | 187.931.804.131 (safetensors); la model card describe 125B de lenguaje + 51B de embeddings n-gram + 4B de MTP |
| Parametros activos | 6B (según model card) |
| Longitud de contexto | 262.144 tokens configurados en el perfil de un solo Spark |
| Tipos de cuantizacion | Mixta: NVFP4 en expertos enrutados, MXFP8 en atención y proyecciones de expertos compartidos, otros tensores en formato original del base; tag 8-bit |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement (NVIDIA Open Model Agreement), con condiciones del modelo Qwen subyacente |
| Formato de pesos | safetensors (21 shards, ~96 GiB / 102 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 125B parámetros de lenguaje y 6B activos, complementado por una tabla de embeddings n-gram de 51B parámetros y una capa MTP (multi-token prediction) de 4B. La cuantización de NVIDIA emplea precisión mixta: los expertos enrutados se almacenan en NVFP4 con escalas NVFP4 comprimidas, mientras que la atención y las proyecciones de expertos compartidos se mantienen en MXFP8; el resto de tensores conserva los formatos del checkpoint original. Esta combinación busca reducir huella en disco y memoria sin degradar en exceso las partes sensibles del modelo.

El proceso de abliteración aplicado por DevelopingDad modifica directamente los pesos en las 48 proyecciones de salida de atención y en las proyecciones down de expertos enrutados y compartidos, eliminando la dirección asociada al comportamiento de rechazo. No se ha realizado un reentrenamiento ni un ajuste supervisado adicional: la edición está embebida en el checkpoint. Los datasets citados en la model card (`mlabonne/harmful_behaviors` y `mlabonne/harmless_alpaca`) se usan como referencia para evaluar la reducción de rechazos, no como datos de entrenamiento. La model card no documenta el volumen de tokens de entrenamiento del modelo original ni la composición completa del dataset, por lo que esos datos no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto configurada de 262.144 tokens.
- Entrada de imágenes y salida de texto (pipeline `image-text-to-text`); la model card indica que las comprobaciones funcionales de entrada de imagen se superaron.
- Razonamiento con modo thinking controlable (activación y desactivación del modo de pensamiento).
- Tool calling / function calling verificado en las comprobaciones funcionales descritas.
- Decodificación especulativa mediante la capa MTP integrada, con verificación funcional superada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Comportamiento de rechazo reducido: 0 de 100 prompts de desarrollo y 6 de 100 de holdout detectados como rechazos, frente a 99 y 100 del base de NVIDIA.

## Casos de uso

- Investigación sobre alineación y abliteración: el checkpoint permite estudiar empíricamente cómo la eliminación de la dirección de rechazo afecta al comportamiento del modelo sin cambiar la arquitectura ni el formato de pesos, comparando directamente contra el base de NVIDIA con el mismo runtime.
- Evaluación de robustez en pipelines de seguridad: al disponer de un modelo con rechazos casi eliminados, se puede usar como caso adversario controlado para probar clasificadores de contenido, filtros de salida y sistemas de moderación antes de desplegarlos en producción.
- Despliegue en hardware de borde con memoria unificada: el launcher incluido para DGX Spark (GB10, 128 GB) permite servir el modelo en una sola máquina con API compatible con OpenAI en `http://127.0.0.1:8000/v1`, útil para prototipos locales que requieren contexto largo.
- Procesamiento de documentos extensos con imágenes: la ventana de 262.144 tokens y la entrada multimodal permiten resumir o extraer información de informes escaneados, contratos o material técnico en una sola pasada, con recuperación verificada hasta ~250K tokens en la comparativa de noviembre.
- Asistentes de código en local: la model card reporta 54,3 tok/s en decodificación de código en un solo Spark, lo que hace viable un asistente de programación con tool calling integrado en un flujo de edición y ejecución de pruebas.
- Generación aumentada por recuperación (RAG) de gran contexto: la combinación de contexto largo y embeddings n-gram respaldados por disco permite indexar corpus amplios y mantener conversaciones con recuperación sin salir de un único nodo.
- Experimentación con decodificación especulativa: la capa MTP integrada permite medir ganancias de throughput en vLLM sobre hardware modesto, comparando perfiles de servicio de uno y dos Sparks.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). Los únicos datos cuantitativos disponibles son métricas de rechazo y velocidad de decodificación medidas por el autor en DGX Spark:

| Metrica | Abliterated | Base NVIDIA |
|---|---|---|
| Rechazos en 100 prompts de desarrollo | 0 | 99 |
| Rechazos en 100 prompts de holdout | 6 | 100 |
| Decodificación de prosa (tok/s, mediana) | 38,0 | 39,4 |
| Decodificación de código (tok/s, mediana) | 54,3 | 50,7 |

No se han publicado resultados de benchmarks de conocimiento o razonamiento en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el checkpoint ocupa ~96 GiB en disco (102 GB en 21 shards); el launcher de un solo Spark usa un límite de 104 GiB de memoria del contenedor y embeddings n-gram respaldados por disco. El tamaño en disco no equivale al requisito completo de memoria en tiempo de ejecución.
- GPU recomendadas: DGX Spark con GB10 y 128 GB de memoria unificada es el hardware probado. La model card no documenta otros aceleradores compatibles.
- GPU de consumo: no hay datos que confirmen que quepa en GPUs de consumo (RTX 4090, etc.); el formato NVFP4/MXFP8 y el runtime B12X están orientados a hardware Blackwell y al contenedor específico.
- Despliegue: exclusivamente mediante el contenedor vLLM B12X fijado en `serve-spark.sh` (`eugr/spark-vllm-b12x@sha256:03a9565...`). La model card advierte explícitamente que Transformers estándar o vLLM de stock no son rutas soportadas para este checkpoint. Se ofrece también una receta separada para dos DGX Sparks.
- Latencia y throughput: medianas de 38,0 tok/s en prosa y 54,3 tok/s en código en un solo Spark. El primer arranque tarda unos 23 minutos por compilación y autotuning; los arranques posteriores con caché rondan los 5 minutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DevelopingDad/Qwen3.8-Flash-Next-FP4-Local-Abliterated | 187,9B totales (6B activos según card) | 262.144 | NVIDIA Open Model Agreement | Hugging Face, 1.330 descargas, 10 likes | Abliterado, formato NVFP4/MXFP8, runtime B12X |
| nvidia/Qwen3.8-Flash-Next-FP4-Local | Mismo layout que el derivado | No disponible | NVIDIA Open Model Agreement | Hugging Face | Base cuantizado; rechazos 99/100 y 100/100 en las pruebas del autor |
| Qwen/Qwen3.8-Flash-Next | 125B lenguaje + 51B n-gram + 4B MTP | No disponible | Qwen Community (según referencia) | Hugging Face | Modelo original sin cuantizar de Qwen |

No se dispone de datos de benchmarks que permitan comparar rendimiento cognitivo con alternativas de la misma categoría.

## Limitaciones y advertencias

- La abliteración elimina en gran medida el comportamiento de rechazo, lo que implica que el modelo puede generar contenido dañino, ilegal o inseguro sin filtros propios; no debe desplegarse en aplicaciones de cara al público sin moderación externa.
- Los resultados de reducción de rechazos son mediciones acotadas sobre 100 prompts de desarrollo y 100 de holdout, no una garantía de que todas las capacidades se mantengan intactas.
- La model card no documenta sesgos conocidos ni evaluación multilingüe; los idiomas soportados figuran como no disponibles.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad para este derivado.
- La licencia NVIDIA Open Model Agreement impone condiciones para uso comercial; además deben respetarse las condiciones del modelo Qwen subyacente. Es responsabilidad del usuario revisar ambos textos antes de un despliegue comercial.
- El checkpoint solo es compatible con el contenedor vLLM B12X fijado; cargarlo con Transformers estándar o vLLM de stock no está soportado y puede fallar.
- El requisito de memoria (~104 GiB de contenedor) limita el despliegue a hardware con memoria unificada grande; no se recomienda ejecutar otro modelo grande en paralelo en el mismo Spark.
- El contexto de 262.144 tokens está configurado, pero la recuperación verificada alcanzó ~30K tokens en octubre y ~250K en la comparativa de noviembre; el rendimiento en el extremo superior de la ventana no está garantizado de forma uniforme.
- El modelo se distribuye en precisión mixta NVFP4/MXFP8; la calidad puede diferir de la versión original sin cuantizar de Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DevelopingDad/Qwen3.8-Flash-Next-FP4-Local-Abliterated
- Modelo base cuantizado de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del método Heretic: https://github.com/p-e-w/heretic
- Guía de instalación de la CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
- Paper de referencia citado en los tags (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
- Dataset de referencia `mlabonne/harmful_behaviors`: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de referencia `mlabonne/harmless_alpaca`: https://huggingface.co/datasets/mlabonne/harmless_alpaca
