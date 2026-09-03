# OliviaRossi/SignOfFour-Q6_K-GGUF

## Resumen

SignOfFour es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por pragmaticcs mediante una fusión de modelos de la familia Qwen3.5 y Qwen3.6, utilizando las técnicas de merge TIES y DARE. El repositorio `OliviaRossi/SignOfFour-Q6_K-GGUF` contiene una conversión a formato GGUF con cuantización Q6_K, realizada con llama.cpp a través del espacio GGUF-my-repo. Esta conversión permite ejecutar el modelo en hardware más modesto, incluyendo CPU y GPUs con menor VRAM, manteniendo un equilibrio entre calidad y consumo de recursos.

El modelo base presenta una arquitectura MoE con innovaciones como DeltaNet, orientada a tareas de razonamiento, generación de código y uso agéntico. Con 34.660.610.688 parámetros totales, el archivo cuantizado Q6_K ocupa aproximadamente 28,5 GB. Está licenciado bajo Apache-2.0 y soporta inglés y chino. Su relevancia radica en ofrecer una alternativa de código abierto con capacidades avanzadas de razonamiento y agente, ahora accesible para despliegue local mediante el ecosistema llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe) con DeltaNet |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (GGUF) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo signoffour-q6_k.gguf) |

## Arquitectura y entrenamiento

El modelo original `pragmaticcs/SignOfFour` es un merge de modelos de la familia Qwen3.5 y Qwen3.6, combinados mediante las técnicas TIES (Truncated Iterative Error Sampling) y DARE (Drop And REscale). La arquitectura resultante es de tipo MoE, con el identificador `qwen3_5_moe`, e incorpora DeltaNet, un mecanismo de atención lineal que reduce la complejidad computacional en secuencias largas. Los detalles sobre el dataset de entrenamiento, el número de tokens procesados o el uso de técnicas como RLHF o DPO no están disponibles en la información proporcionada. La conversión a GGUF se realizó con llama.cpp, manteniendo la arquitectura original pero adaptando los pesos al formato cuantizado Q6_K.

## Capacidades

- Generacion de texto y razonamiento: el modelo está diseñado para tareas de razonamiento complejo, como lo indican las etiquetas `reasoning` y `agentic`.
- Generacion de codigo: soporta tareas de programación, etiquetado como `code`.
- Uso agéntico: compatible con flujos de agente y multi-step reasoning, según las etiquetas `agentic` y `conversational`.
- Multilingüe: soporta inglés y chino.
- Inferencia local: al estar en formato GGUF, es compatible con llama.cpp, llama-cli y llama-server, permitiendo ejecución en CPU y GPU.

## Casos de uso

- Despliegue local en CPU: gracias a la cuantización Q6_K, el modelo puede ejecutarse en equipos sin GPU dedicada, usando llama.cpp con suficiente RAM (al menos 32 GB). Es adecuado para entornos de desarrollo o investigación donde no se dispone de hardware de gama alta.
- Servidor de inferencia en local: con `llama-server` se puede montar un endpoint compatible con OpenAI para integrar el modelo en aplicaciones propias, como chatbots o asistentes virtuales.
- Generacion de codigo asistida: el modelo puede utilizarse como autocompletado o generador de fragmentos de código en entornos de desarrollo, aprovechando su capacidad de razonamiento y su entrenamiento en tareas de programación.
- Razonamiento y resolución de problemas: útil para aplicaciones de análisis, planificación o respuesta a preguntas complejas, donde se requiere un razonamiento multi-paso.
- Prototipado de agentes: al ser un modelo agéntico, puede servir como base para experimentar con flujos de agente que requieran tool calling o interacción multi-turno.
- Investigación en eficiencia de modelos: al ser un MoE con DeltaNet, permite estudiar el comportamiento de arquitecturas híbridas en tareas de razonamiento y generación, con la ventaja de poder ejecutarse en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para este modelo o su versión cuantizada.

## Requisitos de hardware

- El archivo GGUF Q6_K pesa aproximadamente 28,5 GB, por lo que se necesita al menos esa cantidad de memoria libre (VRAM o RAM) para cargar el modelo completo.
- En GPU: una tarjeta con 32 GB o más de VRAM es necesaria para una carga completa, como una NVIDIA A100 (40 GB o 80 GB) o H100. GPUs de consumo como la RTX 4090 (24 GB) no tienen suficiente VRAM para este modelo en Q6_K sin offloading parcial a CPU.
- En CPU: se puede ejecutar con llama.cpp utilizando únicamente RAM, recomendándose al menos 32 GB de RAM libre. El rendimiento será inferior al de una GPU, pero es viable para pruebas o inferencia por lotes.
- Opciones de despliegue: llama.cpp (CLI y servidor), compatible con Ollama si se importa el GGUF, y cualquier framework que soporte GGUF (por ejemplo, llama-cpp-python).
- Latencia y throughput: no disponibles. Dependerán del hardware y de la configuración de offloading.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo base es un merge de Qwen3.5/3.6, pero no se conocen los modelos concretos fusionados ni sus métricas. Se recomienda consultar la model card original de `pragmaticcs/SignOfFour` para posibles comparaciones.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o comportamientos no deseados del modelo. Es necesario realizar evaluaciones propias antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que los modelos base (Qwen3.5/3.6) también cumplan con los términos de uso, ya que el merge podría heredar restricciones adicionales.
- El modelo solo soporta inglés y chino; no está entrenado para otros idiomas, lo que limita su uso en entornos multilingües.
- La longitud de contexto no está documentada, por lo que se desconoce el límite máximo de tokens de entrada. Se recomienda probar con valores conservadores (por ejemplo, 2048 tokens como en el ejemplo de llama-server).
- Al ser una conversión GGUF, el rendimiento puede variar respecto al modelo original en safetensors, especialmente en tareas que requieren alta precisión numérica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OliviaRossi/SignOfFour-Q6_K-GGUF
- Modelo base: https://huggingface.co/pragmaticcs/SignOfFour
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
