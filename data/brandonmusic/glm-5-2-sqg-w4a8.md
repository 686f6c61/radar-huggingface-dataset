# brandonmusic/GLM-5.2-SQG-W4A8

## Resumen

GLM-5.2-SQG-W4A8 es un checkpoint cuantizado del modelo GLM-5.2, desarrollado por Brandon Music sobre el modelo base de Z.ai (Zhipu AI). El objetivo es reducir el peso y la memoria necesarios para ejecutar GLM-5.2 en hardware Blackwell (SM103) mediante una técnica de cuantización denominada SQG (Sparse Quantized Gradient) con cuantización W4A8 (pesos de 4 bits, activaciones de 8 bits). El checkpoint contiene 171.506.198.528 parámetros en safetensors y ocupa 343,1 GB, frente a los 754B parámetros del modelo original.

GLM-5.2 es un modelo de mezcla de expertos (MoE) con aproximadamente 40B parámetros activos y una ventana de contexto de 1M tokens, optimizado para tareas de agente, generación de código y razonamiento de horizonte largo. La cuantización SQG W4A8 permite ejecutar este modelo en GPUs Blackwell con menor requisito de memoria y mayor velocidad, aunque requiere un runtime específico de vLLM y una topología de despliegue concreta (PP8/TP1).

Este checkpoint es relevante porque ofrece una vía práctica para desplegar GLM-5.2 en entornos de producción con hardware Blackwell, reduciendo el costo de inferencia sin renunciar a las capacidades del modelo original. Sin embargo, el lanzamiento se realizó sin validación completa (KLD y runtime acceptance no ejecutados), por lo que su uso en producción debe considerar un proceso de validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parámetros totales | 171.506.198.528 (checkpoint cuantizado) / 754B (modelo base) |
| Parámetros activos | ~40B (modelo base) |
| Longitud de contexto | 1.000.000 tokens (modelo base) |
| Tipos de cuantización | W4A8 (pesos 4 bits, activaciones 8 bits) con SQG; además matrices densas K6 en W6A16 |
| Idiomas soportados | no disponible (el modelo base GLM-5.2 es multilingüe, pero no se especifica en este checkpoint) |
| Licencia | glm-5.2-license (derivada del modelo base, no relicenciada) |
| Formato de pesos | safetensors, requiere runtime custom SQG W4A8 vLLM |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo GLM-5.2, que usa una arquitectura de mezcla de expertos (MoE) con rutas densas y expertos enrutados. El modelo original tiene 754B parámetros totales y ~40B activos por token. La cuantización SQG W4A8 utiliza calibración basada en Hessians (H13) y una técnica de construcción BMM-Law para asignar los niveles de cuantización por tensor. Los tensores de expertos enrutados usan asignaciones K3/K4 (384 de cada una por capa), mientras que las 380 matrices no enrutadas usan SQG K6. Los expertos enrutados se materializan con W4A8 completo, mientras que las matrices densas K6 se sirven como SQG W6A16.

El proceso de calibración emplea el dataset de Hessians `brandonmusic/GLM-5.2-BMM-Law-SQG-Hessians` y su versión canónica. La cuantización se realizó sobre el modelo base BF16 con revisión `b4734de4facf877f85769a911abafc5283eab3d9`. No se ha publicado información sobre entrenamiento adicional (RLHF, DPO, etc.) para el checkpoint cuantizado; se trata únicamente de una conversión de pesos.

## Capacidades

- Generación de texto y conversación multiuso, basada en las capacidades del modelo GLM-5.2.
- Razonamiento avanzado y resolución de problemas de lógica y matemáticas.
- Generación de código, incluyendo lenguajes como Python, JavaScript, C++, etc., con soporte para tareas de programación complejas.
- Capacidades de agente: ejecución de tareas multi-paso, uso de herramientas y razonamiento de horizonte largo (gracias a la ventana de contexto de 1M tokens).
- Soporte de tool calling / function calling (según las capacidades del modelo base).
- Multilingüe (el modelo base GLM-5.2 es multilingüe, aunque el checkpoint no especifica idiomas concretos).
- No se indica soporte de visión, audio u otras modalidades en la información proporcionada.

## Casos de uso

- Despliegue de GLM-5.2 en GPUs Blackwell con requisitos de memoria reducidos: el checkpoint SQG W4A8 reduce el peso de los parámetros a 4 bits, permitiendo ejecutar el modelo en hardware con menos VRAM que el modelo BF16 original. Es adecuado para entornos de producción con GPUs como B200 o RTX Blackwell.
- Automatización de tareas de agente de largo horizonte: gracias a la ventana de contexto de 1M tokens, el modelo puede mantener estado y razonamiento en tareas de ejecución prolongada, como orquestación de procesos, gestión de proyectos o análisis de documentos extensos.
- Generación y revisión de código en pipelines de CI/CD: el modelo puede integrarse como motor de sugerencias de código, revisión de pull requests o generación de tests, con soporte de tool calling para interactuar con repositorios.
- Asistente de programación para entornos de desarrollo integrado (IDE): el modelo puede servir como autocompletado y chat de código, con baja latencia gracias a la cuantización W4A8 en hardware Blackwell.
- Análisis y resumen de documentos técnicos extensos: la ventana de contexto de 1M tokens permite procesar libros, manuales o conjuntos de datos de gran tamaño en una sola pasada.
- Sistemas de atención al cliente con contexto largo: el modelo puede gestionar conversaciones multi-turno de larga duración, manteniendo el histórico completo de la interacción y usando herramientas de consulta de bases de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint cuantizado en la información disponible. La model card indica que las validaciones de KLD y runtime acceptance no se ejecutaron, por lo que no hay datos de rendimiento específicos para esta versión. El modelo base GLM-5.2 tiene resultados publicados en el blog oficial de Z.ai, pero no se incluyen en la información proporcionada. No se inventarán números.

## Requisitos de hardware

- GPU: requiere hardware Blackwell con soporte SM103 (por ejemplo, B200, B100, o GPUs de arquitectura Blackwell). No se especifican modelos concretos adicionales.
- VRAM estimada: no disponible en la información. Con 171B parámetros a 4 bits, los pesos ocuparían aproximadamente 85 GB (171B × 0,5 bytes/parámetro), pero hay que añadir activaciones y overhead del runtime. No se ha publicado una cifra exacta.
- Topología de despliegue: pipeline parallel 8 (PP8) y tensor parallel 1 (TP1), con partición de capas `[9, 10, 10, 10, 10, 10, 10, 9]`. No compatible con TP8, DCP4, o SM120.
- Runtime: requiere el runtime custom SQG W4A8 vLLM, proporcionado a través de la imagen `verdictai/glm52-sqg-w4a8-sm103` con hash específico. No es un checkpoint de Transformers estándar.
- Opciones de despliegue: solo se ha probado con el script `serve.sh` que arranca el servidor en `127.0.0.1:8000`. No se mencionan otras herramientas como llama.cpp o Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.2 (base) | 754B | ~40B | 1M | BF16 | glm-5.2-license | HuggingFace |
| GLM-5.2-SQG-W4A8 (este checkpoint) | 171.5B (cuantizado) | ~40B | 1M | W4A8 SQG | glm-5.2-license | HuggingFace |
| Otros cuantizados de GLM-5.2 (p.ej., AWQ, GPTQ) | no disponible | ~40B | 1M | 4-bit | glm-5.2-license | no disponible |

La comparativa se limita a variantes del mismo modelo base. No hay información pública sobre otros cuantizados de GLM-5.2 en la búsqueda web. El checkpoint SQG W4A8 se diferencia por su técnica de cuantización basada en Hessians y su requisito de runtime específico.

## Limitaciones y advertencias

- El checkpoint se ha publicado sin ejecutar las pruebas de KLD y runtime acceptance, por lo que no hay garantía de que la salida sea idéntica al modelo BF16 original. Se recomienda validar antes de usar en producción.
- No es un checkpoint de Transformers estándar; requiere un runtime vLLM modificado y una topología específica (PP8/TP1). No se puede cargar con librerías comunes sin adaptación.
- La licencia glm-5.2-license proviene del modelo base y puede tener restricciones de uso comercial; el repositorio no relice la licencia, así que hay que revisar los términos de GLM-5.2.
- No se especifican los idiomas soportados; aunque el modelo base es multilingüe, no se ha verificado el comportamiento del checkpoint en todos los idiomas.
- Riesgo de alucinación y sesgos inherentes al modelo GLM-5.2, no mitigados por la cuantización.
- El tamaño del repositorio es de 343 GB, lo que requiere una infraestructura de descarga y almacenamiento considerable.
- El checkpoint usa cuantización W4A8, pero algunas matrices se sirven como W6A16; esto puede afectar el rendimiento en tareas que requieren alta precisión numérica.

## Enlaces

- [HuggingFace del checkpoint](https://huggingface.co/brandonmusic/GLM-5.2-SQG-W4A8)
- [Modelo base GLM-5.2 (Z.ai)](https://huggingface.co/zai-org/GLM-5.2)
- [Blog oficial de GLM-5.2](https://z.ai/blog/glm-5.2)
- [GitHub de GLM-5](https://github.com/zai-org/GLM-5)
- [Dataset de calibración de Hessians](https://huggingface.co/datasets/brandonmusic/GLM-5.2-BMM-Law-SQG-Hessians)
- [Dataset canónico de calibración](https://huggingface.co/datasets/brandonmusic/GLM-5.2-BMM-Law-SQG-Hessians-Canonical)
- [Paper QTIP (arXiv:2406.11235)](https://arxiv.org/abs/2406.11235)
- [Paper QuIP# (arXiv:2402.04396)](https://arxiv.org/abs/2402.04396)
