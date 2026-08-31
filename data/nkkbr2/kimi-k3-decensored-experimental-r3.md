# nkkbr2/Kimi-K3-decensored-experimental-r3

## Resumen

Kimi K3 es un modelo de lenguaje de mezcla de expertos (MoE) con 2,8 billones de parámetros totales y 104 mil millones de parámetros activos, desarrollado por Moonshot AI. Es el primer modelo abierto de clase 3T, diseñado para tareas de codificación de largo horizonte, trabajo de conocimiento y razonamiento avanzado. Su arquitectura se basa en Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), con un marco Stable LatentMoE que activa 16 de los 896 expertos por token, logrando una mejora de eficiencia de escalado de aproximadamente 2,5 veces frente a su predecesor Kimi K2.

Este repositorio concreto, `nkkbr2/Kimi-K3-decensored-experimental-r3`, es una versión experimental modificada por el usuario nkkbr2 que elimina restricciones de contenido del modelo original. Aunque la model card incluida es la oficial de Moonshot AI, el nombre del repositorio y el autor indican que se trata de una adaptación "sin censura". El modelo mantiene las capacidades nativas multimodales (texto, imagen y vídeo) y una ventana de contexto de 1 millón de tokens, lo que lo hace relevante para aplicaciones de agente autónomo y análisis de documentos extensos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (2,8 billones) |
| Parametros activos | 104 mil millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (según tags del repositorio: `8-bit`, `compressed-tensors`) |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | Kimi K3 License (license_name: "kimi-k3"; tag: license:other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura MoE con 93 capas, de las cuales 1 es densa y 92 son capas MoE. La composición de atención es híbrida: 69 capas usan Kimi Delta Attention (KDA) y 24 capas usan Gated Multi-head Latent Attention (Gated MLA). La dimensión oculta de atención es 7168 con 96 cabezas, y la dimensión del espacio latente MoE es 3584. Cada experto tiene una dimensión oculta de 3072, con un total de 896 expertos, de los cuales se seleccionan 16 por token mediante el marco Stable LatentMoE.

No se dispone de información detallada sobre el entrenamiento: número de tokens, composición del dataset, o si se aplicaron técnicas de RLHF o DPO. La model card menciona que el modelo está diseñado para "inteligencia fronteriza" en codificación de largo horizonte, trabajo de conocimiento y razonamiento, pero no se publican datos específicos del proceso de entrenamiento.

## Capacidades

- Generación de texto y razonamiento avanzado, incluyendo matemáticas y lógica.
- Codificación de largo horizonte: puede mantener sesiones de ingeniería prolongadas, navegar repositorios masivos y orquestar herramientas de terminal.
- Multimodalidad nativa: comprende texto, imágenes y vídeo dentro del mismo modelo.
- Tool calling y function calling: soporte para integración en pipelines de agentes.
- Capacidades de agente autónomo: puede realizar tareas de múltiples pasos con supervisión humana mínima.
- Contexto largo de 1 millón de tokens, adecuado para análisis de documentos extensos y conversaciones multi-turno.
- Generación de contenido visual interactivo: dashboards, widgets, presentaciones y edición de vídeo.

## Casos de uso

- Desarrollo de software a gran escala: el modelo puede trabajar en repositorios con millones de líneas de código, optimizar kernels GPU, desarrollar compiladores y participar en diseño de chips, gracias a su contexto de 1M tokens y su capacidad de razonamiento de largo plazo.
- Investigación automatizada: genera informes de investigación profundos con visualizaciones interactivas, dashboards y widgets, integrando datos de múltiples fuentes.
- Desarrollo de juegos con visión en el bucle: puede iterar sobre assets visuales y código de juego, usando su capacidad multimodal para evaluar y modificar el resultado.
- Edición de vídeo y motion design: procesa secuencias de vídeo y genera ediciones o animaciones basadas en instrucciones de texto.
- Agente de atención al cliente avanzado: gestiona conversaciones complejas con contexto largo, manteniendo el historial completo de la interacción y accediendo a bases de conocimiento extensas.
- Análisis de documentos legales o técnicos: procesa contratos, patentes o papers de cientos de páginas, extrayendo información y respondiendo preguntas con precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la etiqueta `eval-results` en los tags del repositorio, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros tests estandarizados.

## Requisitos de hardware

- VRAM estimada: al ser un modelo MoE con 104B parámetros activos, la inferencia requiere al menos ~208 GB de VRAM en FP16 para los pesos activos, o ~104 GB en cuantización de 8 bits. Sin embargo, los pesos totales de 2,8T parámetros deben estar accesibles (en memoria o en disco), lo que implica un clúster multi-GPU.
- GPUs recomendadas: no se especifican en la documentación. Para ejecutar el modelo completo se necesitarían múltiples GPUs de alta gama (A100 80GB, H100 80GB o superiores) con paralelismo de modelo y de expertos.
- En consumer GPU: no es viable. Incluso con cuantización agresiva, el modelo excede la capacidad de cualquier GPU de consumo actual.
- Opciones de despliegue: no se mencionan herramientas específicas, pero por su tamaño y arquitectura, sería necesario usar frameworks como vLLM, TensorRT-LLM o DeepSpeed con soporte para MoE y offloading.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 (este repo) | 2,8T | 104B | 1M | Kimi K3 License | Abierta (pesos) |
| Kimi K2 | 1T | 32B | 256K | Kimi K2 License | Abierta |
| DeepSeek V3 | 671B | 37B | 128K | MIT | Abierta |
| Qwen3-MoE | 30B (total) | 3B (activos) | 32K | Apache 2.0 | Abierta |

Kimi K3 supera a sus competidores en parámetros totales y contexto, pero también exige un hardware mucho más potente. La licencia Kimi K3 puede tener restricciones específicas que no se detallan en la información disponible.

## Limitaciones y advertencias

- Esta versión "decensored" es experimental y no está respaldada por Moonshot AI; los cambios realizados por el autor nkkbr2 no están documentados, por lo que el comportamiento puede diferir del modelo oficial.
- Riesgo de alucinación: como cualquier LLM de gran tamaño, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Sesgos: no se dispone de información sobre sesgos específicos, pero al ser un modelo entrenado con datos web, puede heredar sesgos sociales y culturales.
- Restricciones de licencia: la Kimi K3 License puede imponer condiciones de uso comercial, atribución o redistribución. Se recomienda revisar el texto completo de la licencia antes de usar el modelo en producción.
- Requisitos de hardware extremos: la inferencia requiere un clúster de GPUs de alta gama, lo que limita su uso a organizaciones con infraestructura dedicada.
- La versión "decensored" puede generar contenido inapropiado o dañino, ya que se han eliminado los mecanismos de seguridad del modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nkkbr2/Kimi-K3-decensored-experimental-r3
- Model card oficial de Moonshot AI (referencia): https://huggingface.co/moonshotai/Kimi-K3
- Tech blog de Kimi K3: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Página del modelo en Kimi AI: https://www.kimi.ai/ai-models/kimi-k3
