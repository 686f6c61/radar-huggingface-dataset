# meshllm/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-MTPv2-GGUF

## Resumen

El artefacto `meshllm/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-MTPv2-GGUF` es un archivo compuesto en formato GGUF que combina la cuantización `UD-Q4_K_XL` del modelo NVIDIA Nemotron 3 Super (120B parámetros totales, 12B activos) realizada por unsloth, con el cabezal MTPv2 (multi-token prediction) oficial de NVIDIA, integrado como bloque NextN nativo para decodificación especulativa. El resultado es un modelo listo para inferencia local y distribuida con el runtime Mesh LLM, que aprovecha la predicción de un token extra por paso para acelerar la generación sin perder calidad.

El modelo base es un MoE híbrido Mamba-Transformer con Latent MoE, entrenado por NVIDIA sobre aproximadamente 25 billones de tokens, con una ventana de contexto de 1.048.576 tokens (1M) y post-entrenamiento en múltiples idiomas. Este artefacto concreto está pensado para despliegues en local o en clústeres privados, con soporte para API compatible con OpenAI y para servir el modelo repartido entre varias máquinas mediante la técnica de split serving de Skippy. La licencia es la que aplique a los pesos originales de NVIDIA y a la cuantización de unsloth, por lo que se debe revisar cada fuente antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Mamba-Transformer MoE con Latent MoE y cabezal MTPv2 (NextN block) |
| Parametros totales | 120.000.000.000 (base) + cabezal MTPv2 adicional (el artefacto GGUF contiene 123.611.087.088 en total) |
| Parametros activos | 12.000.000.000 (12B activos por token) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | `UD-Q4_K_XL` para los pesos del modelo base; el bloque MTPv2 se mantiene en `BF16` |
| Idiomas soportados | Inglés, francés, alemán, italiano, japonés, español y chino (idiomas del post-training; el modelo base puede soportar otros) |
| Licencia | `other` (derivada de NVIDIA y unsloth; consultar repositorios fuente para condiciones exactas) |
| Formato de pesos | GGUF (3 shards, ~84 GiB en total) |

## Arquitectura y entrenamiento

El modelo base Nemotron 3 Super es un MoE híbrido que combina capas Mamba (SSM) con capas Transformer, empleando Latent MoE para reducir el coste de activación. NVIDIA lo entrenó en aproximadamente 25 billones de tokens, con una fase de post-entrenamiento sobre datos curados y sintéticos de alta calidad en los idiomas mencionados. La arquitectura incorpora capas MTP (multi-token prediction) que permiten predecir varios tokens en un solo paso de decodificación.

En este artefacto concreto, se ha tomado la cuantización `UD-Q4_K_XL` de unsloth (que mantiene los pesos del modelo en 4 bits) y se ha añadido el cabezal MTPv2 oficial de NVIDIA (en BF16) como un bloque NextN adicional (capas 88+1). El proceso de construcción emplea la herramienta `skippy-quantize compose-mtp`, que combina los tensores del modelo cuantizado con los del head MTPv2 sin reescribir los pesos originales. El resultado es un archivo GGUF de 89 capas (88 del modelo + 1 bloque NextN) que el runtime Mesh LLM reconoce nativamente para decodificación especulativa.

## Capacidades

- Generación de texto y conversación con contexto largo (hasta 1M tokens).
- Razonamiento y planificación multi-paso, orientado a tareas agénticas.
- Generación de código y comprensión de lenguajes de programación.
- Tool calling / function calling, según el modelo base (se requiere verificar el template de chat específico).
- Soporte para decodificación especulativa mediante MTPv2: el modelo produce un token adicional por paso que se verifica contra el target, mejorando el throughput.
- Integración con API OpenAI compatible a través de Mesh LLM (endpoint `/v1/models`).
- Inferencia distribuida con particionado entre máquinas (Skippy split serving).

## Casos de uso

- **Automatización de tickets de TI**: el modelo puede gestionar conversaciones multi-turno con historial largo (1M tokens), clasificar incidencias y sugerir soluciones, reduciendo la carga de los equipos de soporte.
- **Generación de código en pipelines de CI/CD**: gracias a su capacidad de razonamiento y generación de código, puede integrarse como asistente en revisiones de código o en la generación de tests, con verificación automática de los resultados.
- **Análisis de documentos legales o técnicos extensos**: la ventana de 1M tokens permite procesar contratos, informes o documentación técnica completa sin necesidad de dividir el texto en fragmentos.
- **Agentes autónomos de planificación**: el modelo puede descomponer tareas complejas en subtareas y ejecutarlas con llamadas a herramientas, útil para automatización de procesos empresariales.
- **Asistente de investigación**: con la capacidad de razonar sobre grandes volúmenes de literatura y generar resúmenes o respuestas a preguntas, apoyado en el contexto largo.
- **Servidor de inferencia local privada**: empresas que necesiten desplegar un LLM sin enviar datos a la nube pueden usar este artefacto con Mesh LLM en su propia infraestructura, manteniendo la compatibilidad con API estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del artefacto no incluye métricas de MMLU, HumanEval, GSM8K ni similares, y la búsqueda web tampoco proporciona datos de rendimiento para esta cuantización concreta. Se recomienda consultar la model card del modelo base NVIDIA para posibles cifras de referencia (aunque no se citan aquí).

## Requisitos de hardware

- El artefacto GGUF ocupa aproximadamente 84 GiB en disco, repartido en 3 shards.
- Para inferencia local se necesita una GPU (o conjunto de GPUs) con al menos 84 GB de memoria VRAM para cargar el modelo completo sin particionado. En la práctica, con cuantización Q4_K_XL el modelo base (120B) requiere alrededor de 64-70 GB de VRAM para los pesos, más el head MTPv2 en BF16 (pequeño). Por tanto, una sola GPU de 80 GB (A100 o H100) puede ser insuficiente; se recomienda usar dos GPUs de 48 GB o más, o un servidor con varias GPUs.
- El runtime Mesh LLM soporta **split serving** (Skippy), que permite distribuir los shards entre varias máquinas o GPUs, reduciendo el requisito de VRAM por nodo.
- Se puede ejecutar con `mesh-llm serve --model <id>` y exponer una API OpenAI compatible en el puerto 3131.
- No se han publicado cifras de latencia ni throughput específicas para este artefacto. El uso de MTPv2 puede aumentar el número de tokens generados por segundo al aceptar el token especulativo, pero depende del hardware y del número de máquinas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente este artefacto con otros modelos de la misma categoría (MoE de 120B con contexto 1M y MTP). Como referencia, el modelo base Nemotron 3 Super compite con otros MoE de gran tamaño como DeepSeek-Coder o Mixtral, pero las características específicas de MTPv2 y el formato GGUF para Mesh LLM no tienen equivalente directo en la información proporcionada. Se recomienda consultar las model cards de NVIDIA para comparaciones con otros modelos de su familia.

## Limitaciones y advertencias

- **Licencia**: la licencia es `other` y deriva de los términos de NVIDIA (modelo base) y de unsloth (cuantización). Es necesario revisar los repositorios fuente para conocer si el uso comercial está permitido y bajo qué condiciones.
- **Sesgos y alucinaciones**: como todo LLM, puede generar información falsa o sesgada, especialmente en temas sensibles. La verificación humana es imprescindible en entornos de producción.
- **Contexto largo**: aunque la ventana es de 1M tokens, el rendimiento en contextos muy largos puede degradarse (pérdida de atención, repeticiones). Se recomienda probar con datos reales.
- **Idiomas**: aunque el post-training incluye español, el modelo puede tener un rendimiento desigual en otros idiomas no listados.
- **Requisitos de hardware**: el artefacto es grande (~84 GiB) y no es adecuado para equipos de consumo estándar. Requiere infraestructura dedicada o múltiples GPUs.
- **Dependencia de Mesh LLM**: el artefacto está optimizado para el runtime Mesh LLM; aunque es GGUF, puede que no funcione correctamente con otros runtimes como llama.cpp o vLLM sin ajustes adicionales.

## Enlaces

- Artefacto en Hugging Face: https://huggingface.co/meshllm/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-MTPv2-GGUF
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Cuantización de unsloth: https://huggingface.co/unsloth/NVIDIA-Nemotron-3-Super-120B-A12B-GGUF
- Cabezal MTPv2 de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Super-120B-A12B-BF16-MTPv2
- Página de investigación de NVIDIA: https://research.nvidia.com/labs/nemotron/Nemotron-3-Super/
- Mesh LLM (GitHub): https://github.com/Mesh-LLM/mesh-llm
- Documentación de Skippy splits: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/SKIPPY_SPLITS.md
