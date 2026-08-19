# barbonara/corin-nemotron-super-pro-sft

## Resumen

Este repositorio contiene un adaptador LoRA (librería PEFT) exportado desde Tinker, la herramienta de entrenamiento de NVIDIA, y diseñado para ajustar el modelo base `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16`. El adaptador, denominado `corin-nemotron-super-pro-sft`, fue creado mediante fine-tuning supervisado (SFT) sobre los módulos de atención y MLP del modelo base, con un rango LoRA de 8.

El modelo base, NVIDIA Nemotron 3 Super, es un modelo de lenguaje de gran escala con arquitectura Mixture-of-Experts (MoE) híbrida Mamba-Transformer, con 120 mil millones de parámetros totales y 12 mil millones activos. Destaca por su uso de LatentMoE, una técnica que mejora la eficiencia y precisión en el enrutamiento de expertos. El adaptador permite personalizar el comportamiento del modelo base sin necesidad de reentrenar todos sus parámetros, reduciendo costes computacionales y de almacenamiento.

La relevancia de este adaptador radica en su capacidad para adaptar un modelo de alto rendimiento a tareas específicas mediante un ajuste ligero, aprovechando la infraestructura de Tinker y el ecosistema de NVIDIA (NeMo, TensorRT-LLM, vLLM). Aunque el repositorio no incluye detalles sobre el dataset de entrenamiento ni los resultados de evaluación, su integración con un modelo base de última generación lo convierte en un candidato para aplicaciones de agente IA, razonamiento complejo y generación de código.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre base MoE híbrida Mamba-Transformer (Nemotron 3 Super) |
| Parametros totales | No disponible (adaptador LoRA rank 8; el modelo base tiene 120B) |
| Parametros activos | No disponible (el modelo base tiene 12B activos) |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantización BF16, INT8, INT4) |
| Idiomas soportados | No disponible (heredados del modelo base; no especificados) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 aplicado a las capas de atención y MLP del modelo base, sin modificar la capa de unembedding. El entrenamiento se realizó con Tinker, la plataforma de NVIDIA para fine-tuning, mediante un proceso de SFT. No se proporcionan detalles sobre el dataset, el número de pasos, la tasa de aprendizaje ni otras hiperparámetros.

El modelo base, NVIDIA Nemotron 3 Super, emplea una arquitectura MoE híbrida que combina bloques Transformer con bloques Mamba (SSM). Esta hibridación busca capturar tanto dependencias de largo alcance (vía atención) como eficiencia computacional (vía Mamba). La innovación principal es LatentMoE, que introduce un espacio latente para el enrutamiento de tokens a expertos, mejorando la precisión y reduciendo el coste de comunicación en comparación con MoE tradicionales. El modelo fue entrenado con un enfoque de datos transparente y está optimizado para tareas de agente, razonamiento y tool calling.

## Capacidades

- Generación de texto y razonamiento complejo (heredadas del modelo base).
- Razonamiento matemático y científico (el modelo base destaca en estas áreas).
- Generación de código y soporte de tool calling / function calling.
- Instrucción de seguimiento y ejecución de tareas multi-paso (agentes).
- Razonamiento visual (el modelo base es multimodal, aunque el adaptador no especifica si conserva esta capacidad).
- Capacidades multilingües (no especificadas, pero el modelo base probablemente las incluye).
- El adaptador, al ser un LoRA, puede ajustar el comportamiento del modelo base hacia tareas específicas, pero no añade capacidades nuevas por sí mismo.

## Casos de uso

- Agentes de IA para automatización de tareas: el modelo base, con su soporte de tool calling y razonamiento multi-paso, puede integrarse en pipelines de agentes que gestionan herramientas, APIs y flujos de trabajo. El adaptador LoRA permite personalizar el agente para dominios específicos (por ejemplo, atención al cliente o análisis de datos).
- Generación de código en producción: con el modelo base optimizado para programación, el adaptador puede ajustarse para seguir guías de estilo internas o trabajar con frameworks propietarios, integrándose en IDE o CI/CD.
- Asistente de investigación científica: el razonamiento matemático y científico del modelo base lo hace adecuado para resumir papers, formular hipótesis o resolver problemas de física/química. El adaptador puede afinarse con literatura especializada.
- Razonamiento visual multimodal: si el adaptador conserva las capacidades visuales del modelo base, podría usarse en sistemas de descripción de imágenes, análisis de diagramas o documentación técnica visual.
- Chatbots de soporte técnico: con contexto largo (si el modelo base lo soporta) y generación de respuestas precisas, el adaptador puede entrenarse con manuales y FAQs para dar soporte especializado.
- Análisis de datos y generación de informes: el modelo puede procesar grandes volúmenes de texto, extraer métricas y generar resúmenes ejecutivos, con el adaptador ajustado al vocabulario corporativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio del adaptador no incluye métricas de evaluación, y la documentación del modelo base tampoco proporciona números concretos en los resultados de búsqueda. No es posible comparar el rendimiento de este adaptador con otros modelos sin datos adicionales.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 3.6 GB en disco, pero para inferencia se debe cargar el modelo base completo (120B parámetros) junto con el adaptador.
- VRAM estimada para el modelo base en BF16: aproximadamente 240 GB (120B × 2 bytes). Con cuantización INT8, ~120 GB; con INT4, ~60 GB. Estas son estimaciones teóricas; los requisitos reales dependen de la implementación y del tamaño del lote.
- GPUs recomendadas: NVIDIA A100 80GB, H100 80GB o A6000 (múltiples GPUs en paralelo). Para cuantización INT4, podría caber en una RTX 4090 (24 GB) si se usa offloading, pero no es recomendable para producción.
- El adaptador no es desplegable por sí solo; requiere el modelo base. Se puede usar con vLLM, TensorRT-LLM, SGLang o NeMo, que soportan modelos MoE y adaptadores LoRA.
- La latencia y el throughput dependen en gran medida del hardware y del número de expertos activos. Con 12B activos, la inferencia es más rápida que un modelo denso de 120B, pero aún requiere GPUs de alta gama para un rendimiento aceptable en tiempo real.

## Comparativa con modelos similares

No hay información suficiente para realizar una comparativa con modelos similares. El adaptador es específico para Nemotron 3 Super, y no se dispone de datos de rendimiento ni de listas de modelos comparables en la información proporcionada. Se podría comparar el modelo base con otros MoE como Mixtral 8x7B o DeepSeek-V2, pero sin datos de benchmarks concretos no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o alucinaciones específicos del adaptador. El modelo base puede presentar sesgos derivados de sus datos de entrenamiento, que no se detallan.
- El adaptador se distribuye sin licencia especificada; su uso comercial podría estar restringido por la licencia del modelo base de NVIDIA, que no se ha verificado.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento reciente sin validación comunitaria.
- No se conocen los datos de entrenamiento del adaptador; podría estar sobreajustado a un dominio concreto o degradar el rendimiento general del modelo base.
- La integración con Tinker y la exportación como LoRA implican que el adaptador debe cargarse con el modelo base exacto; cambios en el modelo base podrían romper la compatibilidad.
- Para producción, se recomienda evaluar el adaptador en tareas específicas antes de su despliegue, dado que no hay benchmarks publicados.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/barbonara/corin-nemotron-super-pro-sft
- Página del modelo base (NVIDIA Nemotron 3 Super): https://research.nvidia.com/labs/nemotron/Nemotron-3-Super/
- Developer hub de Nemotron en GitHub: https://github.com/NVIDIA-NeMo/Nemotron
- Portal de NVIDIA Nemotron: https://nemotron-ai.com/
- Documentación de NVIDIA sobre Nemotron: https://developer.nvidia.com/topics/ai/nemotron
