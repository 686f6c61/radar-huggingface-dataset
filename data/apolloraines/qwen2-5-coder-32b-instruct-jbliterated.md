# ApolloRaines/Qwen2.5-Coder-32B-Instruct-Jbliterated

## Resumen

El modelo **Qwen2.5-Coder-32B-Instruct-Jbliterated** es una versión modificada del modelo de código de Qwen, desarrollada por ApolloRaines. Se trata de un modelo de lenguaje de 32.763 millones de parámetros (32,8B) basado en la arquitectura Qwen2, especializado en generación y razonamiento de código. La modificación principal consiste en la aplicación de una técnica denominada **Jbliteration** (ablación en el espacio de Jacobianos), que elimina el comportamiento de rechazo del modelo original de forma quirúrgica, preservando la personalidad, el humor y la expresividad creativa que la abliteración estándar suele degradar.

Este modelo es relevante para desarrolladores e investigadores que necesitan un asistente de código sin restricciones de rechazo, manteniendo las capacidades del modelo base. Se distribuye bajo licencia Apache 2.0, en formatos BF16 (safetensors) y GGUF cuantizado (Q8_0 y Q4_K_M), lo que facilita su despliegue en diferentes entornos de hardware. La model card advierte explícitamente que el modelo no rechazará ninguna solicitud, por lo que su uso debe ser responsable y ético.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 32.763.876.352 (32,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Heredada del modelo base Qwen2.5-Coder-32B-Instruct (no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, sin mezcla de expertos. El modelo original Qwen2.5-Coder-32B-Instruct fue entrenado por Alibaba Cloud con un enfoque específico en código, incluyendo generación, razonamiento y corrección de errores en múltiples lenguajes de programación. La versión Jbliterated no modifica la arquitectura ni los pesos del modelo base de forma estructural; en su lugar, aplica una intervención post-entrenamiento sobre las activaciones internas.

La técnica **Jbliteration** (ablación en el espacio de Jacobianos) se describe en la model card como un proceso en tres pasos: primero, minería de conceptos para descubrir el vocabulario de rechazo del modelo mediante continuación forzada por el profesor; segundo, extracción de la lente de Jacobianos, calculando productos vector-Jacobiano (VJPs) por capa para construir una base de rango 16 de direcciones de rechazo causalmente activas; tercero, proyección restringida, donde la dirección de rechazo cruda se proyecta sobre esta base y solo se elimina el componente dentro del subespacio causal. Según el autor, 22 de las 32 capas de direcciones retuvieron la restricción J-space (ratio de proyección >= 0,1) y se extrajeron 7 conceptos de la propia distribución del modelo.

No se proporcionan datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la información disponible.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion (Python, Java, C++, JavaScript, etc.), heredada del modelo base Qwen2.5-Coder-32B-Instruct.
- Razonamiento y correccion de errores en codigo, con capacidad para explicar fragmentos y sugerir soluciones.
- Soporte de tool calling y function calling, segun las capacidades del modelo base (no confirmado explicitamente en la informacion proporcionada, pero el modelo base lo soporta).
- Capacidad de agentes y razonamiento multi-paso, heredada del modelo base.
- Capacidad multilingue limitada: la model card indica solo ingles, aunque el modelo base de Qwen soporta varios idiomas; esta version declara unicamente ingles.
- Sin comportamiento de rechazo: el modelo no se niega a responder solicitudes, incluso aquellas que el modelo original rechazaria. Esto incluye contenido potencialmente delicado o controvertido.
- Preservacion de la personalidad y el tono conversacional, segun la model card, gracias a la ablacion quirurgica.

## Casos de uso

- Asistente de programacion en entornos de desarrollo integrado (IDE): el modelo puede integrarse como autocompletado o chat de codigo, generando funciones, clases y documentacion. Su ventana de contexto larga (heredada del modelo base) permite manejar archivos extensos.
- Generacion de codigo en pipelines de CI/CD: puede utilizarse para generar tests unitarios, scripts de automatizacion o parches de correccion, aprovechando su capacidad de razonamiento sobre codigo existente.
- Educacion y formacion en programacion: el modelo puede explicar conceptos, depurar ejemplos y proponer ejercicios, manteniendo un tono natural y sin rechazar preguntas complejas.
- Investigacion en seguridad ofensiva y analisis de vulnerabilidades: al no tener rechazo, puede generar codigo de explotacion o analisis de malware en entornos controlados y eticos, aunque esto requiere supervisión humana y cumplimiento legal.
- Desarrollo de agentes autonomos de codigo: su capacidad de tool calling y razonamiento multi-paso permite construir agentes que interactuan con repositorios, ejecutan comandos y resuelven tareas de programacion de forma autonoma.
- Prototipado rapido de aplicaciones: el modelo puede generar esqueletos de aplicaciones, scripts de prueba y ejemplos de integracion, acelerando el ciclo de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta version Jbliterated en la informacion proporcionada. El modelo base Qwen2.5-Coder-32B-Instruct tiene resultados publicados por el equipo de Qwen (por ejemplo, en HumanEval, MBPP, Aider), pero no se incluyen en la documentacion de esta version. Se recomienda consultar la ficha del modelo base para obtener datos de rendimiento comparativos.

## Requisitos de hardware

- **BF16 (safetensors)**: requiere aproximadamente 62 GB de VRAM para inferencia en precision completa. Adecuado para GPUs como A100 80GB, H100 80GB o multiples RTX 4090 (24GB) con offload.
- **GGUF Q8_0**: aproximadamente 33 GB, cabe en GPUs con 48 GB o mas (A6000, A100 40GB, etc.) o en configuraciones CPU+GPU con offload.
- **GGUF Q4_K_M**: aproximadamente 19 GB, cabe en GPUs de consumo como RTX 4090 (24GB) o RTX 3090 (24GB), y tambien es viable para inferencia solo CPU con suficiente RAM.
- **DeepswapLLM**: el autor proporciona una herramienta que permite ejecutar el modelo en GPUs mas pequenas de lo necesario, transmitiendo capas entre GPU, RAM y disco, hasta 4 veces mas rapido que AirLLM.
- **Opciones de despliegue**: vLLM, TGI, transformers (para safetensors); llama.cpp, Ollama (para GGUF).
- **Latencia y throughput**: no se proporcionan datos especificos en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-32B-Instruct (original) | 32,8B | 131072 (segun documentacion oficial de Qwen) | Apache 2.0 | Safetensors, GGUF | Modelo base con comportamiento de rechazo estandar |
| Qwen2.5-Coder-32B-Instruct-Jbliterated | 32,8B | Heredado del base (no especificado) | Apache 2.0 | Safetensors, GGUF | Sin rechazo, personalidad preservada |
| DeepSeek-Coder-33B-Instruct | 33B | 16384 | MIT | Safetensors | Alternativa de codigo con licencia permisiva |
| CodeLlama-34B-Instruct | 34B | 16384 | Llama 2 license | Safetensors, GGUF | Alternativa de Meta, con restricciones de uso comercial |

Nota: los datos de contexto de los modelos comparados provienen de sus respectivas documentaciones publicas, no de la informacion proporcionada para esta version.

## Limitaciones y advertencias

- **Contenido sin censura**: el modelo ha sido modificado para eliminar todo comportamiento de rechazo. No se negara a generar contenido ilegal, danino o que viole los derechos de terceros. El usuario es el unico responsable de su uso.
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje, puede generar codigo incorrecto o informacion falsa. Se recomienda validar siempre las salidas en entornos de produccion.
- **Idioma**: la model card declara solo ingles. El rendimiento en otros idiomas puede ser limitado o no estar soportado.
- **Sesgos**: el modelo base puede contener sesgos presentes en sus datos de entrenamiento; la ablacion no los elimina y podria incluso amplificarlos al no tener filtros de rechazo.
- **Restricciones de licencia**: aunque la licencia es Apache 2.0, el uso del modelo para actividades ilegales o no eticas puede violar terminos de servicio de plataformas de despliegue o leyes locales.
- **Caveat de produccion**: al no tener rechazo, el modelo puede generar contenido inapropiado en aplicaciones orientadas al usuario final. Se recomienda implementar filtros adicionales si se despliega en entornos publicos.

## Enlaces

- [HuggingFace - ApolloRaines/Qwen2.5-Coder-32B-Instruct-Jbliterated](https://huggingface.co/ApolloRaines/Qwen2.5-Coder-32B-Instruct-Jbliterated)
- [Modelo base - Qwen/Qwen2.5-Coder-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct)
- [Ollama - qwen2.5-coder:32b](https://ollama.com/library/qwen2.5-coder:32b)
- [NVIDIA NIM - qwen2.5-coder-32b-instruct](https://build.nvidia.com/qwen/qwen2_5-coder-32b-instruct)
- [DeepswapLLM (herramienta del autor)](https://github.com/apolloraines/DeepswapLLM)
