# deadmouserr/Qwen3-Coder-Next

## Resumen

Qwen3-Coder-Next es un modelo de lenguaje abierto desarrollado por el equipo de Qwen (Alibaba) para su uso en agentes de codificacion y desarrollo local. La ficha se basa en una re-subida del modelo realizada por el usuario `deadmouserr` en HuggingFace, que mantiene la model card original del proyecto. El modelo resuelve el problema de disponer de un asistente de codificacion eficiente y capacitado para tareas agencias de larga duracion, integrandose con entornos de desarrollo reales.

Con una arquitectura hibrida que combina capas de atencion gated, atencion lineal DeltaNet y una mezcla de expertos (MoE), el modelo presenta 80.000 millones de parametros totales de los cuales solo 3.000 millones se activan por token. Esta combinacion permite un rendimiento comparable al de modelos con 10 a 20 veces mas parametros activos, reduciendo drasticamente el coste computacional. Su ventana de contexto nativa alcanza los 262.144 tokens, lo que le permite analizar repositorios completos y mantener conversaciones prolongadas sin perder informacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated DeltaNet + Gated Attention + MoE |
| Parametros totales | 80B (79.674.391.296 segun safetensors) |
| Parametros activos | 3B |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Qwen3-Coder-Next se basa en una arquitectura hibrida de transformer con 48 capas y una dimension oculta de 2048. El bloque repetido doce veces consta de cuatro subcapas: tres subcapas de atencion lineal DeltaNet con puerta (gated) seguidas de una capa MoE, y una subcapa de atencion con puerta (gated attention) seguida de otra capa MoE. La atencion gated utiliza 16 cabezas de consulta (Q) y 2 cabezas de clave-valor (KV) con dimension de cabecera 256, mientras que la atencion DeltaNet emplea 32 cabezas para valores y 16 para consulta-clave, con dimension de cabecera 128.

El componente MoE incluye 512 expertos, de los cuales se activan 10 y hay 1 experto compartido, con una dimension intermedia de 512. Esta configuracion es responsable de que solo se activen 3.000 millones de parametros por token, pese a los 80.000 millones totales. El modelo ha pasado por una etapa de pretraining y otra de post-training orientada a capacidades agencias, incluyendo razonamiento de largo alcance, uso complejo de herramientas y recuperacion de errores durante la ejecucion. No admite el modo de pensamiento (thinking) y no genera bloques `<think></think>` en sus respuestas.

## Capacidades

- Generacion de texto y codigo en contextos de programacion, con capacidad para manejar tareas de desarrollo complejas.
- Razonamiento de largo horizonte para tareas que requieren multiples pasos y mantenimiento de estado durante la interaccion.
- Uso avanzado de tool calling, permitiendo al modelo invocar funciones y herramientas externas de forma dinamica.
- Recuperacion de errores en tiempo de ejecucion, pudiendo ajustar su estrategia cuando un fragmento de codigo falla.
- Integracion con entornos de desarrollo como Claude Code, Qwen Code, Qoder, Kilo, Trae o Cline, gracias a su adaptabilidad a diferentes plantillas de scaffold.
- Soporte de despliegue como servidor OpenAI-compatible mediante vLLM o SGLang, lo que facilita su integracion en pipelines de automatizacion.
- No soporta modo thinking ni generacion de bloques de pensamiento.

## Casos de uso

- Agente de codificacion autonomo: el modelo puede desarrollar funciones completas a partir de instrucciones en lenguaje natural, utilizando su ventana de 262.144 tokens para mantener el contexto del proyecto y sus herramientas.
- Asistente de programacion en tiempo real dentro del IDE: gracias a su adaptacion a plantillas de Claude Code o Qwen Code, se puede integrar en editores para sugerir codigo, refactorizar o explicar fragmentos existentes.
- Desarrollo local con eficiencia energetica: al activar solo 3.000 millones de parametros, reduce el coste computacional frente a modelos monocasco del mismo tamano, lo que resulta util en estaciones de trabajo con GPUs limitadas.
- Refactorizacion de repositorios completos: su contexto de 256K permite analizar multiples archivos a la vez, facilitando la identificacion de dependencias y cambios coherentes en todo el codigo.
- Automatizacion de pipelines CI/CD: el modelo puede ejecutarse como servidor de API con vLLM o SGLang, permitiendo revisar cambios de codigo, generar tests o corregir errores de forma automatizada.
- Depuracion asistida: su capacidad para recuperarse de fallos de ejecucion lo hace util para iterar sobre problemas de programacion, probando distintas soluciones hasta alcanzar una valida.
- Documentacion tecnica automatica: puede generar y actualizar documentacion de APIs y modulos a partir del codigo fuente, manteniendo coherencia con la implementacion.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye referencias graficas a evaluaciones en SWE-bench Pro y otras metricas, pero los datos no estan transcritos en el texto. El fabricante afirma que el modelo alcanza un rendimiento comparable al de modelos con 10 a 20 veces mas parametros activos, pero no se aportan cifras concretas en los materiales revisados.

## Requisitos de hardware

- La carga completa del modelo en precision FP16/BF16 requiere aproximadamente 159,4 GB de memoria, segun el tamano del repositorio HuggingFace.
- Se recomienda utilizar tensor parallelism con al menos 2 GPUs para desplegar el modelo mediante vLLM o SGLang; la configuracion de ejemplo usa `--tensor-parallel-size 2`.
- Para operar con el contexto completo de 262.144 tokens se necesita mas memoria; la model card advierte de posibles errores de memoria y sugiere reducir la longitud a 32.768 tokens si se producen.
- Los frameworks compatibles para inferencia y despliegue incluyen vLLM (>=0.15.0), SGLang (>=0.5.8), Ollama, LMStudio, MLX-LM, llama.cpp y KTransformers.
- No se proporcionan estimaciones de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos cuantitativos suficientes para elaborar una comparativa exhaustiva. El autor indica que, con 3.000 millones de parametros activos, el modelo rinde al nivel de sistemas con 10 a 20 veces mas parametros activos, pero no se listan modelos concretos ni resultados de benchmarks en la informacion revisada.

## Limitaciones y advertencias

- El modelo solo soporta el modo no thinking; no genera bloques de pensamiento en sus salidas.
- Los idiomas exactos soportados no estan especificados en la model card, lo que puede suponer una limitacion en aplicaciones multilingues concretas.
- Al tratarse de una re-subida de un usuario de HuggingFace (`deadmouserr`) y no del repositorio oficial, la procedencia y el mantenimiento del peso no estan garantizados por el desarrollador original.
- El uso del contexto completo de 256K puede provocar errores de memoria en GPUs con poca memoria; se recomienda reducir la longitud del contexto en entornos con recursos limitados.
- No se ofrecen cuantizaciones oficiales, por lo que las opciones de cuantizacion reales no estan documentadas.
- No se han publicado datos numericos de benchmarks, lo que impide evaluar de forma objetiva su rendimiento frente a alternativas.

## Enlaces

- https://huggingface.co/deadmouserr/Qwen3-Coder-Next
- https://huggingface.co/Qwen/Qwen3-Coder-Next
- https://qwen.ai/blog?id=qwen3-coder-next
- https://github.com/QwenLM/Qwen3-Coder
- https://qwen.readthedocs.io/en/latest/
- https://ai.azure.com/catalog/models/qwen--qwen3-coder-next
