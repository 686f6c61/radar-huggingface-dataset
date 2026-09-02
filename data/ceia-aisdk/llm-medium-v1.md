# ceia-aisdk/llm-medium-v1

## Resumen

`ceia-aisdk/llm-medium-v1` es un artefacto GGUF que redistribuye el modelo `Qwen/Qwen2.5-7B-Instruct` cuantizado en Q4_K_M. Ha sido publicado por el equipo de CEIA AI SDK como un alias opaco para su catálogo interno (`llm/medium@1`), sin exponer el nombre del archivo original. No se trata de un modelo entrenado desde cero, sino de una conversión a formato GGUF realizada por `bartowski` y reempaquetada por CEIA para facilitar su descarga y despliegue en entornos de inferencia local.

El modelo base, Qwen2.5-7B-Instruct, es un transformer denso de 7.6 mil millones de parámetros, optimizado para instrucciones y conversación. Al estar cuantizado en Q4_K_M, el archivo resultante ocupa aproximadamente 4,7 GB, lo que permite ejecutarlo en GPUs de consumo con 8 GB de VRAM o incluso en CPU con suficiente RAM. La licencia Apache-2.0 permite uso comercial y redistribución, lo que lo hace atractivo para integraciones internas.

Aunque la ficha pública no ofrece detalles sobre el contexto, idiomas o benchmarks, al heredar las capacidades del modelo base, puede utilizarse para generación de texto, razonamiento, código y diálogo. Su principal valor reside en ser un punto de entrada estable y reproducible para quienes necesitan un modelo de 7B en formato GGUF con cuantización estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (única incluida) |
| Idiomas soportados | No disponible (heredados del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `model.gguf`) |

## Arquitectura y entrenamiento

El artefacto es una cuantización del modelo `Qwen/Qwen2.5-7B-Instruct`, que emplea una arquitectura transformer densa con atención multi-cabeza, normalización RMSNorm y capas de feed-forward con activación SwiGLU. El modelo original fue entrenado por Alibaba Cloud con un enfoque de instrucciones (instruction tuning) y optimización por preferencias humanas (RLHF/DPO). En esta redistribución, los pesos se han convertido al formato GGUF mediante la herramienta de `llama.cpp` y cuantizados a Q4_K_M, que ofrece un buen equilibrio entre tamaño y calidad de salida.

No se ha realizado ningún entrenamiento adicional sobre estos pesos. La cuantización Q4_K_M reduce la precisión de los pesos a 4 bits con bloques de 32, lo que introduce una ligera degradación del rendimiento en tareas de alta precisión, pero es aceptable para la mayoría de aplicaciones de generación de texto.

## Capacidades

- Generación de texto conversacional y de instrucciones, gracias a su naturaleza instruct.
- Razonamiento básico y resolución de problemas de lógica y matemáticas (heredado del modelo base).
- Generación de código en varios lenguajes de programación.
- Comprensión y generación de texto multilingüe (el modelo base soporta más de 29 idiomas, aunque no se confirma en esta ficha).
- No se han documentado capacidades especiales como tool calling, agentes o visión en la información proporcionada.

## Casos de uso

- Chatbots y asistentes virtuales: al ser un modelo instruct, puede mantener conversaciones multi-turno y responder a preguntas frecuentes. Su tamaño compacto permite desplegarlo en servidores modestos o en local.
- Generación de contenido y redacción: útil para borradores de artículos, correos electrónicos o resúmenes, con la posibilidad de ajustar el tono mediante instrucciones.
- Asistente de programación: puede generar fragmentos de código, explicar funciones o depurar errores, integrándose en editores o entornos de desarrollo.
- Clasificación y extracción de información: mediante prompts adecuados, puede etiquetar textos, extraer entidades o resumir documentos largos (si la longitud de contexto lo permite).
- Inferencia en entornos con recursos limitados: al ser GGUF Q4_K_M, se puede ejecutar en una Raspberry Pi o en una CPU con 8 GB de RAM usando `llama.cpp`, lo que lo hace adecuado para prototipos y pruebas.
- Integración en pipelines de NLP: puede servir como backend de generación en sistemas de automatización, como generación de respuestas en encuestas o análisis de sentimiento básico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo pesa 4,7 GB, por lo que para inferencia con carga completa se recomiendan al menos 6 GB de VRAM (para dejar margen para el contexto y las activaciones). Una GPU con 8 GB es suficiente.
- GPUs compatibles: RTX 3060, RTX 4060, RTX 2080, o GPUs de datacenter como T4 o L4. También puede ejecutarse en CPU con 8-16 GB de RAM, aunque con mayor latencia.
- Opciones de despliegue: `llama.cpp`, `Ollama`, `llama-cpp-python`, `vLLM` (con soporte GGUF experimental) o `TGI` (con conversión previa).
- Latencia y throughput: no se dispone de datos medidos. En una RTX 3060, se puede esperar una velocidad de 20-40 tokens/s para generación, dependiendo del tamaño del contexto y del batch.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El modelo base es Qwen2.5-7B-Instruct, que en su versión original suele compararse con Mistral-7B-Instruct o Llama-3-8B-Instruct, pero no se han proporcionado datos de rendimiento ni de contexto en esta ficha. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- La cuantización Q4_K_M puede degradar ligeramente la calidad de las respuestas en tareas que requieren alta precisión (por ejemplo, matemáticas complejas o razonamiento largo).
- No se ha verificado el comportamiento del modelo en cuanto a sesgos o alucinaciones; se heredan los riesgos del modelo base Qwen2.5-7B-Instruct.
- La longitud de contexto no está documentada en esta redistribución; es probable que sea la del modelo base (128K tokens), pero no se confirma.
- El idioma de los textos generados depende del entrenamiento del modelo base; aunque soporta múltiples idiomas, no se garantiza un rendimiento uniforme en todos ellos.
- Al ser un artefacto de redistribución, no hay soporte técnico por parte de CEIA más allá de la propia publicación. Para problemas con el modelo base, se debe acudir a la documentación de Qwen.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/ceia-aisdk/llm-medium-v1)
- [Modelo base Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
- [Quantización original por bartowski](https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF)
