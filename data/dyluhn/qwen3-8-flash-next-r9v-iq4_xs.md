# Dyluhn/Qwen3.8-Flash-Next-R9V-IQ4_XS

## Resumen

Qwen3.8-Flash-Next es un modelo multimodal de la familia Qwen, desarrollado por Alibaba, que combina razonamiento y generación con una arquitectura de Mezcla de Expertos (MoE) ultra dispersa. El modelo base tiene 125 000 millones de parámetros en total, incluyendo una tabla de embeddings N-gram de 51 000 millones, pero activa solo 6 000 millones por token, lo que lo hace muy eficiente en inferencia. Su innovación principal es la combinación de Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA): tres de cada cuatro capas usan GDN para comprimir el historial, y la cuarta usa QSA para recuperación precisa de largo alcance. Soporta nativamente un contexto de un millón de tokens y entrada de imágenes.

El repositorio Dyluhn/Qwen3.8-Flash-Next-R9V-IQ4_XS es un paquete de inferencia preparado por Dyluhn para el runtime R9V, un stack de inferencia ROCm especializado en GPUs RDNA4 (Radeon R9700). Incluye los pesos GGUF cuantizados a IQ4_XS por Unsloth, un proyector de visión Q8_0, un checkpoint MTP (Multi-Token Prediction) para decodificación especulativa, y metadatos oficiales. La configuración de referencia usa dos GPUs Radeon R9700 de 32 GiB, con contexto de 131 072 tokens y almacenamiento SSD para la tabla de embeddings. Este paquete está pensado para usuarios que quieran ejecutar el modelo en hardware AMD de gama alta con un rendimiento optimizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra dispersa con Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA) |
| Parametros totales | 125 000 millones (modelo base, incluye 51 000 millones de tabla N-gram); el repo cuantizado contiene 176 943 899 520 parámetros en safetensors |
| Parametros activos | 6 000 millones por token |
| Longitud de contexto | 1 000 000 tokens (nativo); 131 072 tokens en la configuración R9V de referencia |
| Tipos de cuantizacion | IQ4_XS (GGUF), proyector de visión Q8_0 |
| Idiomas soportados | no disponible (el modelo base de Qwen suele ser multilingüe, pero no se especifica en el repo) |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | GGUF (shards), safetensors (para el checkpoint MTP y proyector) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE ultra dispersa con 125 000 millones de parámetros totales y 6 000 millones activos por token. La innovación clave es la combinación de dos mecanismos de atención: tres de cada cuatro capas usan Gated DeltaNet (GDN), que comprime el historial de forma eficiente, y la cuarta capa usa Qwen Sparse Attention (QSA) para recuperación precisa de información de largo alcance. Esta mezcla permite manejar contextos de hasta un millón de tokens con un coste computacional reducido. El modelo es multimodal, acepta imágenes como entrada además de texto.

El repositorio R9V incluye un checkpoint MTP (Multi-Token Prediction) ensamblado por Dyluhn, que combina tensores densos del checkpoint BF16 oficial y expertos enrutados del checkpoint block-FP8 oficial. Este MTP se usa para decodificación especulativa, prediciendo varios tokens a la vez para acelerar la generación. Los pesos no fueron entrenados por Dyluhn; solo se reorganizaron para el runtime. La cuantización IQ4_XS fue realizada por Unsloth, y el proyector de visión Q8_0 proviene de ggml-org. No se dispone de información detallada sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo matemáticas y lógica.
- Comprensión de imágenes (visión) mediante un proyector Q8_0, con entrada de una imagen por petición en la configuración R9V.
- Soporte de contexto muy largo: hasta 1 000 000 tokens nativos, aunque la configuración R9V limita a 131 072 tokens.
- Decodificación especulativa con MTP (Multi-Token Prediction) para acelerar la inferencia.
- Capacidades multilingües (según el modelo base de Qwen, aunque no se detallan en el repo).
- Compatible con API OpenAI (el runtime R9V expone una API compatible con OpenAI).
- Posibilidad de tool calling y uso como agente, aunque no se documenta explícitamente en el repo.

## Casos de uso

- Procesamiento de documentos extensos: con un contexto nativo de 1M tokens, el modelo puede analizar libros completos, expedientes legales o informes financieros en una sola pasada. La configuración R9V con 128K tokens sigue siendo suficiente para la mayoría de documentos corporativos.
- Análisis de código y repositorios completos: el modelo puede razonar sobre arquitecturas de software, detectar bugs o generar documentación a partir de un código base entero, gracias a su ventana de contexto amplia.
- Asistentes de atención al cliente con memoria larga: el modelo puede mantener conversaciones multi-turno con historial extenso, recordando detalles de interacciones anteriores sin perder el hilo.
- Generación de código en producción: con soporte de tool calling y razonamiento, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, aunque requiere hardware potente.
- Análisis de imágenes y documentos escaneados: al ser multimodal, puede extraer información de capturas, diagramas o formularios, combinando visión y texto.
- Investigación académica: el modelo puede resumir artículos científicos, comparar metodologías o generar hipótesis, aprovechando su capacidad de razonamiento y contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización IQ4_XS en el repositorio. El modelo base Qwen3.8-Flash-Next tiene benchmarks oficiales disponibles en el repositorio de Qwen, pero no se incluyen en la información proporcionada. El runtime R9V incluye un informe de cualificación con métricas de rendimiento en la máquina de referencia (dos Radeon R9700), pero los números exactos no están disponibles en los datos extraídos. Se recomienda consultar el informe de cualificación en el enlace de GitHub para obtener datos de latencia y throughput.

## Requisitos de hardware

- Configuración de referencia: dos GPUs Radeon R9700 de 32 GiB cada una, con TP2 (tensor parallelism).
- Memoria RAM: 128 GiB DDR5.
- Almacenamiento: SSD rápido para la tabla de embeddings (PLE) y los expertos en niveles.
- VRAM estimada: 32 GiB por GPU (dos GPUs en total), suficiente para la cuantización IQ4_XS con contexto de 128K.
- No cabe en GPUs de consumo convencionales (como RTX 4090 de 24 GiB) debido al tamaño del modelo y la configuración de memoria.
- Opciones de despliegue: el runtime R9V es específico para ROCm y RDNA4; también se podría usar vLLM u otros runtimes con soporte GGUF, pero no está documentado en el repo.
- Latencia y throughput: no disponibles en la información proporcionada; el informe de cualificación de R9V contiene datos exactos.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con otros modelos de la misma categoría. El modelo base Qwen3.8-Flash-Next es un MoE ultra disperso con 6B activos, similar en concepto a otros MoE como DeepSeek-V3 o Mixtral, pero con la innovación de GDN+QSA. Sin embargo, no se tienen datos de benchmarks comparativos en la información proporcionada. Se recomienda consultar el repositorio oficial de Qwen para comparaciones con otros modelos.

## Limitaciones y advertencias

- Licencia: la Qwen Community License 1.0 tiene términos específicos para uso comercial, incluyendo restricciones para servicios MaaS (Model-as-a-Service) y asistentes de trabajo con IA, así como umbrales de escala. Los usuarios deben revisar la licencia completa antes de usar el modelo en producción.
- El runtime R9V es un proyecto de código abierto (Apache-2.0) pero está en fase de release candidate; puede tener errores o inestabilidad.
- La configuración R9V está optimizada para hardware específico (RDNA4 dual R9700); no se garantiza su funcionamiento en otras GPUs.
- El modelo puede alucinar, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- La cuantización IQ4_XS puede degradar ligeramente la calidad de salida en comparación con el modelo BF16 original.
- El contexto de 128K en la configuración R9V es inferior al nativo de 1M, lo que limita el procesamiento de documentos extremadamente largos.
- No se especifican los idiomas soportados; aunque Qwen suele ser multilingüe, no hay confirmación para este modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Dyluhn/Qwen3.8-Flash-Next-R9V-IQ4_XS
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime R9V en GitHub: https://github.com/Dyluhn/R9V
- Informe de cualificación R9V: https://github.com/Dyluhn/R9V/blob/main/docs/qualification/qwen38-ud-iq4-xs-dual-r9700.md
- Página de QwenCloud para Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Receta vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
