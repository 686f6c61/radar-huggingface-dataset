# nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4

## Resumen

NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4 es un modelo de lenguaje de gran tamaño desarrollado por NVIDIA, presentado en marzo de 2026. Forma parte de la familia Nemotron 3, diseñada para tareas de agente, razonamiento y conversación de alto volumen, como la automatización de tickets de TI. El modelo emplea una arquitectura híbrida LatentMoE que combina capas de Mamba-2, MoE y Attention selectivas, junto con Multi-Token Prediction (MTP) para acelerar la generación y mejorar la calidad. Con 120 mil millones de parámetros totales y 12 mil millones activos, ofrece una ventana de contexto de hasta 1 millón de tokens, lo que lo hace especialmente adecuado para razonamiento de contexto largo y flujos de trabajo agénticos.

El modelo está cuantizado de forma nativa en NVFP4 (4 bits de punto flotante de NVIDIA), lo que reduce los requisitos de memoria y cómputo en comparación con una representación de precisión completa. Soporta siete idiomas: inglés, francés, alemán, italiano, japonés, español y chino. Su licencia, la NVIDIA Nemotron Open Model License, permite uso comercial, y los pesos están disponibles en formato safetensors. El repositorio de HuggingFace acumula más de 2,2 millones de descargas y 424 likes, lo que refleja un interés considerable en la comunidad.

La relevancia actual del modelo radica en su combinación de eficiencia (solo 12B activos) y capacidad de contexto extremo (1M tokens), junto con un modo de razonamiento configurable mediante la plantilla de chat. Esto lo posiciona como una opción sólida para despliegues en producción donde se requiere manejar grandes volúmenes de información y tareas de agente complejas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE: híbrido de Mamba-2, MoE y Attention con Multi-Token Prediction (MTP) |
| Parametros totales | 120B (12B activos) |
| Parametros activos | 12B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (nativa), 8-bit (vía ModelOpt) |
| Idiomas soportados | Inglés, francés, alemán, italiano, japonés, español y chino |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors (NVFP4) |

Nota: el repositorio en HuggingFace tiene un tamaño de 80,4 GB y el archivo safetensors contiene 67.228.556.288 parámetros (67,2B), una discrepancia con los 120B declarados que probablemente se debe a la cuantización NVFP4 y a la estructura MoE.

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura LatentMoE, un diseño híbrido que intercala capas de Mamba-2 (modelos de espacio de estados) con capas de Mezcla de Expertos (MoE) y capas de atención selectiva. Esta combinación busca equilibrar la eficiencia computacional con la capacidad de modelado de dependencias de largo alcance. Además, incorpora Multi-Token Prediction (MTP), una técnica que predice varios tokens a la vez durante el entrenamiento y la inferencia, lo que reduce la latencia de generación y mejora la calidad del texto.

En cuanto al entrenamiento, NVIDIA ha publicado los datasets de pre-entrenamiento y post-entrenamiento en HuggingFace (colecciones `nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`). El corte de datos de post-entrenamiento es de febrero de 2026, mientras que el de pre-entrenamiento es de junio de 2025. No se especifica el número total de tokens de entrenamiento en la información disponible. El modelo fue entrenado con cuantización NVFP4 desde el inicio, lo que maximiza la eficiencia de cómputo en hardware NVIDIA.

## Capacidades

- Generación de texto y razonamiento: produce trazas de razonamiento antes de la respuesta final, con un modo configurable (`enable_thinking=True/False`) en la plantilla de chat.
- Razonamiento de contexto largo: gracias a su ventana de 1M tokens, puede procesar documentos extensos, historiales de conversación largos y bases de conocimiento completas.
- Uso de herramientas (tool calling): compatible con flujos de agente que requieren invocar funciones externas.
- RAG (Retrieval-Augmented Generation): puede integrarse en sistemas de recuperación de información para responder con datos actualizados.
- Multilingüe: soporta 7 idiomas (inglés, francés, alemán, italiano, japonés, español y chino).
- Modo agente: optimizado para flujos de trabajo agénticos y tareas de automatización de alto volumen, como la gestión de tickets de TI.
- Eficiencia computacional: al ser un modelo MoE con 12B activos, ofrece un rendimiento por token significativamente mayor que un modelo denso de tamaño equivalente.

## Casos de uso

- Automatización de tickets de TI: el modelo puede clasificar, priorizar y responder automáticamente a incidencias técnicas, utilizando su capacidad de razonamiento y su ventana de contexto para analizar historiales completos de tickets y documentación asociada.
- Asistentes virtuales multilingües: gracias a su soporte de 7 idiomas y su modo de razonamiento configurable, puede desplegarse como chatbot de atención al cliente en empresas internacionales, manteniendo conversaciones coherentes y contextualmente precisas.
- Análisis de documentos legales o financieros: con 1M tokens de contexto, puede procesar contratos extensos, informes anuales o expedientes completos, extrayendo información relevante y generando resúmenes ejecutivos.
- Agentes de RAG para bases de conocimiento empresarial: el modelo puede integrarse en pipelines de RAG para responder preguntas sobre documentación interna, combinando recuperación de fragmentos con razonamiento de múltiples pasos.
- Generación de código asistida por contexto largo: aunque no se especifica explícitamente, al ser un LLM general con soporte de tool calling, puede utilizarse en entornos de desarrollo para generar o modificar código, especialmente cuando se necesita mantener el contexto de un repositorio completo.
- Automatización de procesos de negocio: su capacidad para manejar flujos de trabajo agénticos lo hace adecuado para tareas como la gestión de correos electrónicos, la programación de citas o la extracción de datos de formularios, donde se requiere razonamiento secuencial y uso de herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una imagen `accuracy_chart.png` que no se ha podido analizar, y no se proporcionan cifras numéricas de MMLU, HumanEval, GSM8K u otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 80,4 GB en disco, por lo que se necesitan al menos 80 GB de VRAM para cargar los pesos en memoria durante la inferencia. Con NVFP4, el modelo está optimizado para GPUs NVIDIA.
- GPU recomendadas: la model card especifica como requisito mínimo 1× B200 o 1× DGX Spark. La B200 cuenta con 192 GB de HBM3e, mientras que DGX Spark ofrece 128 GB de memoria unificada. No se mencionan GPUs de consumo (como RTX 4090) como viables.
- Opciones de despliegue: compatible con la librería `transformers` de HuggingFace y con el ecosistema NVIDIA (NIM). Se puede servir con frameworks como vLLM o TGI, aunque no se confirma explícitamente en la documentación.
- Latencia y throughput: no se proporcionan cifras concretas. La inclusión de MTP sugiere una generación más rápida que modelos sin esta técnica, pero no hay datos numéricos.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para realizar una comparativa cuantitativa con otros modelos de la misma categoría (por ejemplo, Mixtral 8x22B, DeepSeek-V3 o Qwen2.5-MoE). Se recomienda consultar benchmarks independientes para evaluar su rendimiento relativo.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo entrenado con datos web, puede presentar sesgos presentes en esos datos y generar información falsa o inventada, especialmente en dominios especializados.
- Idiomas limitados: aunque cubre 7 idiomas, no incluye otros como árabe, portugués o ruso, lo que restringe su uso en entornos multilingües más amplios.
- Requisitos de hardware muy elevados: la necesidad de al menos 80 GB de VRAM y GPUs de gama alta (B200 o DGX Spark) limita su adopción en entornos con infraestructura modesta.
- Licencia: la NVIDIA Nemotron Open Model License permite uso comercial, pero incluye términos específicos que deben revisarse antes de su implementación en productos.
- Dependencia de hardware NVIDIA: la cuantización NVFP4 y las optimizaciones están orientadas a GPUs NVIDIA, lo que puede dificultar su ejecución en hardware de otros fabricantes.
- Ventana de contexto de 1M tokens: aunque es una ventaja, el rendimiento real puede degradarse con contextos extremadamente largos, y el coste computacional aumenta con la longitud de la entrada.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4)
- [Informe técnico de NVIDIA Nemotron-3-Super](https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf)
- [Colección de datasets de pre-entrenamiento](https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets)
- [Colección de datasets de post-entrenamiento](https://huggingface.co/collections/nvidia/nemotron-post-training-v3)
- [Página de desarrollador de Nemotron](https://developer.nvidia.com/nemotron)
- [Licencia NVIDIA Nemotron Open Model License](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/)
- [Artículo arXiv 2512.20848](https://arxiv.org/abs/2512.20848)
- [Artículo arXiv 2512.20856](https://arxiv.org/abs/2512.20856)
