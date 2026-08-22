# ipfipfipf/Qwen3.5-4B-sdpo-react-mathcodesearch-sdpo-arm-e

## Resumen

El modelo `ipfipfipf/Qwen3.5-4B-sdpo-react-mathcodesearch-sdpo-arm-e` es un fine-tune del modelo base `Qwen/Qwen3.5-4B-Base`, desarrollado por el autor `ipfipfipf`. Se trata de un modelo causal de lenguaje con encoder de visión, entrenado mediante técnicas de optimización por preferencias (el nombre del repositorio sugiere SDPO, *Stepwise Direct Preference Optimization*) y un esquema de agente tipo ReAct (razonamiento y actuación) orientado a tareas de matemáticas y búsqueda de código.

El modelo base Qwen3.5-4B, desarrollado por Alibaba, introduce una arquitectura híbrida que combina *Gated Delta Networks* con atención *Gated Attention* y mezcla de expertos dispersa (MoE), alcanzando una longitud de contexto nativa de 262 144 tokens, extensible hasta aproximadamente 1 010 000 tokens. Este fine-tune conserva dichas capacidades y las orienta hacia dominios específicos, manteniendo la licencia Apache 2.0, lo que permite su uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en que ofrece un punto de partida especializado sobre una base eficiente y moderna, apta para entornos de producción que requieran razonamiento matemático, generación de código y capacidades de agente con visión multimodal, todo ello en un paquete de 4 205 751 296 parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Gated Attention + MoE disperso (del modelo base) |
| Parametros totales | 4 205 751 296 |
| Parametros activos | no disponible (arquitectura híbrida con MoE, no se especifica el número de activos) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 010 000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 201 idiomas y dialectos (según el modelo base Qwen3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que intercala bloques de Gated DeltaNet y Gated Attention dentro de un diseño de mezcla de expertos dispersa. La configuración de capas sigue el patrón `8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, con 32 capas, dimensión oculta de 2560 y cabezas de atención lineal de 32 para V y 16 para QK, además de cabezas de atención Gated de 16 para Q y 4 para KV. El modelo está entrenado con multi-step MTP (*Multi-Token Prediction*), lo que mejora la eficiencia de generación.

El fine-tune `ipfipfipf/Qwen3.5-4B-sdpo-react-mathcodesearch-sdpo-arm-e` se ha entrenado sobre esta base con técnicas de SDPO (optimización directa de preferencias por pasos) y un esquema de agente ReAct, orientado a matemáticas y búsqueda de código. No se dispone de detalles públicos sobre el dataset de entrenamiento, el número de tokens o el procedimiento exacto de alineación empleado en este fine-tune específico.

## Capacidades

- Generación de texto multimodal: el modelo procesa tanto texto como imágenes (pipeline `image-text-to-text`), lo que permite entradas visuales junto con instrucciones textuales.
- Razonamiento matemático: el entrenamiento específico en matemáticas (sufijo `mathcodesearch`) refuerza la capacidad de resolver problemas paso a paso.
- Búsqueda y generación de código: el componente `codesearch` sugiere entrenamiento en búsqueda de código y generación de soluciones en lenguajes de programación.
- Soporte de agentes con ReAct: el esquema ReAct (razonamiento + actuación) permite al modelo integrar herramientas externas, planificar acciones y ejecutar múltiples pasos.
- Capacidades multilingües: hereda del modelo base soporte para 201 idiomas y dialectos.
- Ventana de contexto larga: 262 144 tokens nativos, ampliable hasta más de un millón, adecuada para documentos extensos o conversaciones de múltiples turnos.
- Compatibilidad con librerías de inferencia: Transformers, vLLM, SGLang, KTransformers.

## Casos de uso

- Asistente de programación con búsqueda en repositorios: el modelo puede recibir una descripción de una función, buscar en un repositorio de código mediante herramientas externas (ReAct) y generar la implementación correspondiente, aprovechando su contexto largo para analizar archivos completos.
- Tutor de matemáticas interactivo: dado un problema matemático (con o sin imagen), el modelo genera una explicación paso a paso, y puede llamar a herramientas de cálculo simbólico para verificar resultados.
- Análisis de documentación técnica multimodal: gracias a su soporte de imagen y texto, puede leer diagramas, gráficos y tablas en documentos de ingeniería y extraer conclusiones o generar resúmenes técnicos.
- Automatización de tareas con herramientas: el patrón ReAct permite construir agentes que consultan APIs, ejecutan comandos o interactúan con bases de datos de forma secuencial, útil para pipelines de integración continua.
- Generación de código en producción: con su entrenamiento en código y matemáticas, puede usarse para generar funciones complejas, refactorizar código o escribir pruebas unitarias, integrándose en entornos de desarrollo con vLLM o Transformers.
- Investigación en agentes de razonamiento: su diseño ReAct y entrenamiento en preferencias lo convierte en un candidato para experimentos académicos sobre optimización de agentes y razonamiento multi-paso.
- Procesamiento de documentos largos: gracias a su ventana de 262K tokens, puede resumir o extraer información de libros técnicos, informes de investigación o bases de conocimiento extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el fine-tune `ipfipfipf/Qwen3.5-4B-sdpo-react-mathcodesearch-sdpo-arm-e` en la información disponible.

El modelo base Qwen3.5-4B, según la model card, obtiene los siguientes resultados en algunos benchmarks (no se especifica el protocolo exacto de evaluación):

| Benchmark | Qwen3.5-4B |
|---|---|
| MMLU-Pro | 79,1 |
| MMLU-Redux | no disponible en la información extraída |

No se dispone de datos de rendimiento en HumanEval, GSM8K u otros benchmarks para este fine-tune concreto.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 4,2 mil millones de parámetros. En FP16, el peso ocupa aproximadamente 8,4 GB (tamaño del repositorio). Para inferencia con carga completa en FP16, se recomienda al menos 12 GB de VRAM; con cuantización (por ejemplo, INT4), podría caber en 6-8 GB, aunque no se especifican cuantizaciones oficiales.
- GPU recomendadas: tarjetas con 12 GB o más de VRAM, como RTX 3060 12 GB, RTX 4070 Ti, RTX 4090, A100, H100. En GPUs de 8 GB (RTX 3070, RTX 4060) solo sería posible con cuantización agresiva.
- Compatibilidad con GPU de consumo: sí, en el rango de 4B parámetros es viable en GPUs de gama alta para consumidores (RTX 3090/4090) con cuantización ligera.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers y, potencialmente, con llama.cpp y Ollama si se generan pesos GGUF.
- Latencia y throughput estimados: no disponible, pero un modelo de 4B en una GPU moderna suele generar entre 20 y 60 tokens por segundo, dependiendo de la cuantización y el backend.

## Comparativa con modelos similares

El fine-tune no tiene comparativa publicada propia. Basado en el modelo base Qwen3.5-4B, se puede comparar con otros modelos de la misma categoría (tamaño de 4B, híbridos o de razonamiento):

| Model | Parametros | Contexto | Arquitectura | Licencia | MMLU-Pro |
|---|---|---|---|---|---|
| Qwen3.5-4B (base) | 4,2B | 262K (ext. 1M) | Híbrida DeltaNet + MoE | Apache 2.0 | 79,1 |
| Qwen3-4B (base) | 4B | 32K | Transformer | Apache 2.0 | no disponible |
| GPT-OSS-20B | 20B | no disponible | Transformer | MIT | 74,8 |

Nota: GPT-OSS-20B es un modelo de mayor tamaño, incluido en la tabla de benchmarks del Qwen3.5 como referencia. No se dispone de datos de otros fine-tunes similares en la información proporcionada.

## Limitaciones y advertencias

- Sesgos del modelo base: el modelo Qwen3.5-4B puede heredar sesgos de los datos de entrenamiento de Alibaba, incluyendo posibles prejuicios culturales o lingüísticos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en tareas de búsqueda de código o matemáticas avanzadas; es necesario validar las salidas en producción.
- Limitaciones de contexto: aunque la ventana nativa es de 262K tokens, el rendimiento degrada en contextos muy largos, y la extensión a 1M tokens puede requerir configuraciones específicas de inferencia.
- Restricciones de licencia: aunque la licencia es Apache 2.0 y permite uso comercial, el fine-tune específico no especifica si hay restricciones adicionales sobre los datos de entrenamiento.
- Overfitting del fine-tune: al estar especializado en matemáticas y búsqueda de código, puede degradar su rendimiento en tareas generales fuera de estos dominios.
- Datos de entrenamiento no publicados: no se conocen los detalles del dataset de fine-tuning, lo que limita la auditoría de posibles sesgos o contaminación de benchmarks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ipfipfipf/Qwen3.5-4B-sdpo-react-mathcodesearch-sdpo-arm-e
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Otro fine-tune del mismo autor (9B): https://huggingface.co/ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-sdpo-arm-e
