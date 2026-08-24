# majentik/LFM2.5-8B-A1B-MLX-5bit

## Resumen

LFM2.5-8B-A1B-MLX-5bit es una variante cuantizada a 5 bits (affine, group size 64) del modelo LFM2.5-8B-A1B de Liquid AI, convertida al formato MLX para ejecución eficiente en Apple Silicon mediante la librería mlx-lm. El modelo original es un mixture-of-experts (MoE) con 8.000 millones de parámetros totales y solo 1.500 millones activos por paso, diseñado para ejecutarse en dispositivos de gama media (móviles, portátiles) y en GPUs de datacenter, con una ventana de contexto de 128.000 tokens y capacidades de razonamiento encadenado (chain of thought) y tool calling.

Esta cuantización concreta, publicada por el usuario majentik, reduce el peso del modelo a aproximadamente 5,8 GB, lo que permite cargarlo en equipos con memoria unificada moderada. El repositorio incluye una comprobación de coherencia determinista (smoke gate) que valida la generación básica de texto. La licencia es LFM Open License v1.0, que permite uso comercial con atribución.

La relevancia de este modelo radica en su equilibrio entre tamaño reducido, contexto largo y capacidades de razonamiento, lo que lo convierte en una opción atractiva para aplicaciones on-device y para desarrolladores que necesitan un modelo de alto rendimiento con requisitos de hardware modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con atención transformer estándar |
| Parametros totales | 8.000 millones (original) / 1.588.030.912 (pesos cuantizados en safetensors) |
| Parametros activos | 1.500 millones (1.5B) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | 5-bit affine, group size 64 (este repo); también disponibles 2, 3, 4, 6, 8 bit y MXFP4 en otros repos del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) - uso comercial permitido con atribución |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-8B-A1B emplea una arquitectura de mezcla de expertos (MoE) con 8.000 millones de parámetros totales y 1.500 millones activos por forward pass. Esta configuración permite un rendimiento comparable a modelos densos de mayor tamaño con un coste computacional reducido, lo que lo hace adecuado para inferencia en dispositivos con recursos limitados. El modelo incorpora razonamiento encadenado (chain of thought) explícito: las respuestas del asistente incluyen un razonamiento intermedio antes de la respuesta final, lo que mejora la precisión en tareas complejas.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La cuantización MLX 5-bit se realizó con la herramienta `mlx_lm.convert` de mlx-lm 0.31.3, utilizando cuantización affine con grupo de tamaño 64. El repositorio incluye una comprobación de coherencia (smoke gate) que verifica la generación de 32 tokens sin bucles ni artefactos.

## Capacidades

- Generación de texto conversacional y completado de instrucciones.
- Razonamiento encadenado (chain of thought) para tareas de lógica, matemáticas y análisis.
- Tool calling / function calling, según la documentación oficial de Liquid AI.
- Ventana de contexto de 128.000 tokens, adecuada para documentos largos y conversaciones multi-turno.
- Capacidad de ejecución on-device en Apple Silicon gracias a la cuantización MLX.
- Soporte de chat mediante `apply_chat_template` del tokenizador.
- No se especifican capacidades multimodales (visión, audio) en la información disponible.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo puede ejecutarse localmente en un iPhone o iPad con suficiente memoria unificada, ofreciendo respuestas con razonamiento sin depender de la nube.
- Automatización de atención al cliente: su contexto de 128K permite gestionar historiales largos de conversación y mantener el estado del usuario durante interacciones prolongadas.
- Generación de código asistida: con soporte de tool calling, puede integrarse en entornos de desarrollo para autocompletar, explicar o refactorizar código, ejecutando funciones externas cuando sea necesario.
- Análisis de documentos extensos: la ventana de 128K permite procesar informes, artículos o contratos completos sin truncamiento, extrayendo resúmenes o respondiendo preguntas específicas.
- Agentes autónomos: su capacidad de razonamiento encadenado y tool calling lo hace apto para pipelines de agentes que requieren planificación multi-paso y ejecución de acciones.
- Prototipado rápido en entornos Apple: desarrolladores que usan Mac pueden desplegar el modelo localmente con mlx-lm para pruebas y desarrollo sin necesidad de GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado indica que las evaluaciones están pendientes ("benchmarks pending"). Tampoco se proporcionan datos comparativos del modelo original en los resultados de búsqueda web.

## Requisitos de hardware

- El repositorio pesa 5,8 GB, por lo que se recomienda al menos 8 GB de memoria unificada en Apple Silicon para cargar el modelo en 5-bit.
- Para una experiencia fluida con contexto largo, se recomienda 16 GB o más de memoria unificada.
- GPU compatibles: cualquier chip Apple Silicon (M1, M2, M3, M4) con suficiente memoria unificada; también puede ejecutarse en GPUs de datacenter mediante otros formatos (el modelo original está disponible en safetensors estándar).
- Opciones de despliegue: mlx-lm (recomendado), también puede convertirse a otros formatos si se requiere.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware concreto y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B (original) | 8B | 1.5B | 128K | LFM Open License v1.0 | safetensors (BF16) |
| LFM2.5-8B-A1B-MLX-5bit (este repo) | 8B (original) / 1.59B (cuantizado) | 1.5B | 128K | LFM Open License v1.0 | safetensors (MLX 5-bit) |
| Qwen2.5-7B-Instruct | 7.6B | 7.6B (denso) | 128K | Apache 2.0 | safetensors, GGUF |
| Phi-3.5-mini-instruct | 3.8B | 3.8B (denso) | 128K | MIT | safetensors, GGUF |

La comparativa es cualitativa, ya que no se dispone de benchmarks. LFM2.5-8B-A1B destaca por su arquitectura MoE con solo 1.5B activos, lo que reduce el coste computacional frente a modelos densos de tamaño similar. Su licencia permite uso comercial con atribución, mientras que Qwen2.5 y Phi-3.5 tienen licencias más permisivas (Apache 2.0 y MIT respectivamente).

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o alucinaciones específicas del modelo; como cualquier LLM, puede generar contenido incorrecto o inventado.
- La licencia LFM Open License v1.0 exige atribución; es necesario revisar los términos completos antes de un uso comercial.
- El modelo está optimizado para Apple Silicon en esta versión MLX; para otros entornos se debe usar el modelo original u otras conversiones.
- La cuantización a 5-bit puede introducir una ligera degradación de calidad frente al modelo en BF16, aunque no se han publicado evaluaciones que lo cuantifiquen.
- No se especifican los idiomas soportados; se asume un entrenamiento multilingüe, pero no está confirmado.
- El razonamiento encadenado explícito puede aumentar la latencia en tareas simples, ya que el modelo genera pasos intermedios antes de la respuesta final.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/majentik/LFM2.5-8B-A1B-MLX-5bit
- Modelo original: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Documentación oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-8b-a1b
- Blog de Liquid AI sobre LFM2.5-8B-A1B: https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Página del modelo en Lambda AI: https://lambda.ai/inference-models/liquidai/lfm2.5-8b-a1b
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B/blob/b9aebfcbe28b6cb374042f495d733037550ab146/LICENSE
