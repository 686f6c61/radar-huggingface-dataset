# mradermacher/EnvACE-Qwen3-1.7B-i1-GGUF

## Resumen

EnvACE-Qwen3-1.7B es un modelo de lenguaje basado en Qwen3-1.7B, desarrollado por el equipo Team-ACE, que ha sido afinado mediante aprendizaje por refuerzo (reinforcement learning) para mejorar sus capacidades como agente. El modelo está especializado en el uso de herramientas, llamadas a funciones (function calling) y modelado del mundo (world-model), lo que lo hace adecuado para tareas de razonamiento multi-paso y planificación en entornos interactivos. Este repositorio, publicado por mradermacher, contiene la cuantización imatrix del modelo en formato GGUF, preparada para su uso con llama.cpp y otros motores compatibles. La licencia es Apache 2.0 y el modelo soporta exclusivamente el idioma inglés.

Cabe destacar que el repositorio actual solo incluye el archivo imatrix, no los pesos cuantizados GGUF completos. Los quants estáticos se encuentran disponibles en un repositorio separado de mradermacher. El modelo original tiene aproximadamente 1.7 mil millones de parámetros, aunque el metadato de safetensors en este repositorio indica un valor de 516.292, que probablemente corresponde al tamaño del archivo imatrix y no al número real de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) |
| Parametros totales | 1.7B (segun nombre del modelo; metadato de safetensors indica 516.292, probablemente tamano de archivo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix (archivo de importancia) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (solo archivo imatrix en este repo) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer autoregresivo de la familia Qwen3. El proceso de entrenamiento de EnvACE-Qwen3-1.7B implica un afinado por refuerzo orientado a tareas de agente, lo que incluye el uso de herramientas y la llamada a funciones. No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas como RLHF o DPO. El repositorio de mradermacher aplica una cuantización con imatrix (importance matrix) para la creación de quants GGUF de alta calidad, aunque en este repositorio solo se distribuye el archivo imatrix.

## Capacidades

- Generacion de texto y razonamiento basado en el modelo Qwen3-1.7B.
- Soporte de tool calling y function calling, afinado mediante refuerzo.
- Capacidades de agente para razonamiento multi-paso y planificacion.
- Modelado del mundo (world-model) para tareas de simulacion y planificacion.
- Soporte exclusivo del idioma ingles.
- Compatible con el formato GGUF para inferencia local mediante llama.cpp.

## Casos de uso

- Agentes autonomos en entornos de simulacion: el modelo puede planificar secuencias de acciones y usar herramientas para interactuar con el entorno, gracias a su afinado en world-model y tool-use.
- Asistentes de codigo con llamada a funciones: puede integrarse en pipelines de desarrollo donde se requiere invocar APIs o ejecutar comandos mediante function calling.
- Automatizacion de tareas de oficina: el modelo puede gestionar flujos de trabajo que requieren multiples pasos, como consultar bases de datos y generar informes.
- Chatbots de soporte tecnico en ingles: su capacidad de agente permite mantener conversaciones multi-turno y ejecutar acciones como buscar documentacion o abrir tickets.
- Razonamiento en juegos o simuladores: el modelo puede actuar como agente en entornos interactivos, tomando decisiones basadas en el estado del mundo.
- Investigacion en agentes de IA: el modelo sirve como base para experimentos de reinforcement learning y evaluacion de capacidades de tool-use en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 1.7B, una cuantizacion GGUF Q4_K_M tipicamente requiere alrededor de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3060, RTX 4060, o modelos de gama alta como A100 y H100 para mayor velocidad.
- Si cabe en consumer GPU: si, en GPUs de consumo con 4 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier motor compatible con GGUF. Tambien es posible usar vLLM o TGI si se convierten los pesos a safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EnvACE-Qwen3-1.7B (este repo) | 1.7B | no disponible | Apache 2.0 | GGUF (imatrix) | Afinado para agentes y tool-use |
| Qwen3-1.7B (base) | 1.7B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo original sin afinado especifico |
| EnvACE-Qwen3-8B | 8B | no disponible | Apache 2.0 | GGUF | Version mas grande del mismo afinado |

## Limitaciones y advertencias

- El repositorio actual solo contiene el archivo imatrix, no los pesos GGUF completos. Para usar el modelo cuantizado es necesario descargar los quants desde el repositorio de quants estaticos.
- El modelo solo soporta el idioma ingles, lo que limita su uso en aplicaciones multilingues.
- No se dispone de informacion sobre la longitud de contexto exacta ni sobre el rendimiento en benchmarks publicos.
- Al ser un modelo pequeno, puede presentar alucinaciones y errores en tareas complejas de razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribucion y las condiciones de la licencia.
- El afinado por refuerzo puede introducir sesgos derivados del dataset de entrenamiento, que no esta documentado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/EnvACE-Qwen3-1.7B-i1-GGUF
- Repositorio de quants estaticos: https://huggingface.co/mradermacher/EnvACE-Qwen3-1.7B-GGUF
- Modelo base: https://huggingface.co/Team-ACE/EnvACE-Qwen3-1.7B
- Repositorio de la version 8B: https://huggingface.co/mradermacher/EnvACE-Qwen3-8B-GGUF
