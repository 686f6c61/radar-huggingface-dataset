# Sawfwair/Qwen3.8-Flash-Next-MLX-Mixed-2bit

## Resumen

Sawfwair/Qwen3.8-Flash-Next-MLX-Mixed-2bit es una conversión reproducible al formato MLX del modelo multimodal Qwen3.8-Flash-Next de Alibaba Qwen, cuantizada de forma mixta a 2 y 4 bits. El modelo base es un MoE ultra-sparse con arquitectura Qwen4-exp, 125B parámetros principales más una tabla de embedding n-gram de 51B y un módulo MTP de 4B, que activa únicamente 6B parámetros por token. Soporta un contexto nativo de 262.144 tokens y procesa entradas de imagen y texto.

Esta variante específica está pensada para ejecutarse en Apple Silicon con 128 GB de memoria unificada, reduciendo el peso del modelo a unos 68 GiB mediante cuantización Q2 en los 48 bancos de expertos base y Q4 en las matrices core y MTP, mientras mantiene en BF16 los embeddings, indexadores QSA, routers y cabezas de visión. Es una opción para desarrolladores que necesitan ejecutar localmente un modelo multimodal de gran capacidad con ventana de contexto muy larga en hardware de Apple, sin depender de servidores en la nube.

El repositorio incluye un archivo de verificación de conversión (`MERERUN_CONVERSION.json`) que valida el inventario de tensores, hashes de origen, empaquetado MLX y el layout de los expertos fusionados. Requiere un runtime MLX específico para la arquitectura Qwen4Exp; no funcionará con versiones antiguas de `mlx-lm` o `mlx-vlm`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse con Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA), multimodal (image-text-to-text) |
| Parametros totales | 21.824.869.779 (tensores safetensors cuantizados); el modelo original declara 180B (125B main + 51B n-gram embedding + 4B MTP) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q2 group-128 para 48 bancos de expertos base; Q4 group-32 (128 módulos) y Q4 group-64 (682 módulos) para tablas n-gram, core y MTP; BF16 para embeddings, QSA indexers, routers, vision y MTP fusion heads |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license_name: qwen-community-1.0) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.8-Flash-Next combina dos mecanismos de atención: tres de cada cuatro capas usan Gated DeltaNet (GDN) para comprimir el historial de forma eficiente, mientras que la cuarta capa emplea Qwen Sparse Attention (QSA) para recuperación precisa de información de largo plazo. A esto se añade una tabla de embedding n-gram de 51B parámetros que complementa la representación de tokens, y un módulo Multi-Token Prediction (MTP) de 4B para acelerar la generación. El resultado es un modelo MoE ultra-sparse que activa solo 6B parámetros por token a pesar de sus 125B parámetros principales.

La conversión MLX realizada por Sawfwair cuantiza los bancos de expertos base a 2 bits con grupo de 128, y las matrices core y MTP a 4 bits con grupos de 32 y 64, manteniendo las partes críticas para la estabilidad (embeddings, indexadores QSA, routers, visión y cabezas de fusión MTP) en BF16. No se proporcionan datos sobre el proceso de entrenamiento original (número de tokens, dataset o técnicas de alineamiento como RLHF o DPO) en la información disponible.

## Capacidades

- Generación de texto y razonamiento avanzado sobre entradas multimodales (imagen y texto), gracias a la arquitectura Qwen4-exp del modelo base.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos o conversaciones de muchas interacciones.
- Procesamiento de imágenes para tareas de comprensión visual, aunque no se especifican detalles de resolución o formatos soportados.
- Soporte de tool calling y function calling: no disponible en la información proporcionada; el modelo base Qwen3.8-Flash-Next podría incluirlo, pero no está confirmado en esta conversión.
- Capacidades multilingües: no disponibles; el modelo base de Qwen suele ser multilingüe, pero esta variante no documenta los idiomas.
- Modo de razonamiento especial (thinking mode): no confirmado en la documentación de la conversión.

## Casos de uso

- Análisis de documentos largos con imágenes: el contexto de 262K tokens permite procesar informes extensos, libros técnicos o expedientes con figuras y tablas, resumiendo y extrayendo información clave en una sola pasada.
- Asistente conversacional con memoria amplia: gracias al contexto nativo de 262K, se pueden mantener conversaciones multi-turno de larga duración sin perder información relevante, ideal para aplicaciones de atención al cliente o tutoría académica.
- Prototipado de aplicaciones de IA local en Apple Silicon: al ser un modelo MLX cuantizado, se puede integrar en entornos de desarrollo con Python y MLX para probar flujos multimodales sin depender de infraestructura en la nube.
- Investigación académica sobre MoE y atención eficiente: la arquitectura GDN+QSA y la tabla n-gram son ejemplos prácticos de técnicas de compresión de contexto y sparse attention, útiles para experimentos de investigación.
- Generación de informes técnicos a partir de capturas o diagramas: el modelo puede interpretar imágenes de esquemas o pantallas y producir descripciones textuales o resúmenes, facilitando la documentación de proyectos.
- Procesamiento de datos históricos con formato mixto: al manejar contexto largo y entrada visual, se pueden procesar archivos PDF escaneados, fotografías de tablas o gráficos para extraer datos estructurados en un entorno local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la conversión MLX no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El modelo base Qwen3.8-Flash-Next dispone de benchmarks en su documentación oficial, pero no se han reproducido aquí para esta variante cuantizada.

## Requisitos de hardware

- Perfil de memoria: 128 GB de RAM unificada (perfil de 128 GB Mac), el payload cuantizado ocupa 68,08 GiB.
- GPU recomendada: Apple Silicon (M1 Pro/Max/Ultra, M2/M3/M4 con 128 GB de memoria unificada); no es aplicable a GPU NVIDIA o AMD.
- VRAM: no aplicable en el sentido clásico, el modelo usa memoria unificada del sistema.
- Opciones de despliegue: `mlx-lm` o `mlx-vlm` con un runtime específico para Qwen4Exp; no se puede ejecutar con versiones antiguas de estas librerías.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

La comparativa se limita a las especificaciones del modelo base y de la conversión, ya que no hay datos de rendimiento publicados para esta variante.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 180B (125B main + 51B n-gram + 4B MTP) | 6B | 262.144 | Qwen Community 1.0 | HuggingFace, gated |
| Sawfwair/Qwen3.8-Flash-Next-MLX-Mixed-2bit | 21,8B (cuantizado) | 6B | 262.144 | Qwen Community 1.0 | HuggingFace, no gated |
| Qwen3-235B-A22B (MoE similar) | 235B | 22B | 32.768 | Qwen Research | HuggingFace |

La conversión MLX reduce drásticamente el peso del modelo (de 180B a 21,8B en tensores cuantizados) pero conserva el mismo contexto y arquitectura, a costa de una posible degradación de calidad por la cuantización mixta de 2 y 4 bits.

## Limitaciones y advertencias

- Cuantización agresiva: los bancos de expertos base se cuantizan a 2 bits, lo que puede degradar la calidad de generación en tareas de razonamiento complejo o con matices.
- Requisito de runtime específico: necesita una versión de MLX adaptada a Qwen4Exp; no es compatible con despliegues estándar de `mlx-lm` o `mlx-vlm`.
- Licencia Qwen Community 1.0: incluye requisitos de atribución y visualización para productos comerciales muy grandes, y condiciones separadas para ciertos usos comerciales como Model-as-a-Service y AI Work Assistant; revisar el archivo LICENSE antes de usar.
- No se proporciona información sobre idiomas soportados ni sobre el dataset de entrenamiento, por lo que el comportamiento en idiomas minoritarios o dominios específicos no está garantizado.
- Riesgo de alucinaciones: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento de largo contexto.
- El modelo no está gated, pero la descarga y uso no elimina los términos de la licencia; para uso comercial en productos grandes, es necesario cumplir las condiciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sawfwair/Qwen3.8-Flash-Next-MLX-Mixed-2bit
- Modelo base Qwen3.8-Flash-Next en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Documentación de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Recetas de vLLM para el modelo base: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
