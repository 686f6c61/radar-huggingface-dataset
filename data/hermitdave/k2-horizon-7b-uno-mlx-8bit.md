# hermitdave/K2-Horizon-7B-Uno-MLX-8bit

## Resumen

K2-Horizon-7B-Uno-MLX-8bit es una cuantización uniforme de 8 bits en formato MLX del modelo IFM/K2-Horizon-7B-Uno, desarrollado por el Institute of Foundation Models. La conversión ha sido realizada por el usuario hermitdave con mlx-lm, fusionando el adaptador LoRA original en los pesos base para que el modelo resultante se comporte como un modelo autorregresivo estándar. El modelo está diseñado como modelo de razonamiento, por lo que se recomienda utilizar un nivel de esfuerzo de razonamiento alto para obtener cadenas de pensamiento completas.

El modelo tiene un total de 8.999.178.240 parámetros. No se ha publicado la longitud de contexto en la información disponible, aunque se trata de un LLM aumentado con difusión (diffusion-augmented) basado en la arquitectura K2-Horizon-7B. Esta variante MLX permite ejecutar el modelo en Apple Silicon, aprovechando la memoria unificada de los chips de la serie M, y resulta relevante para el despliegue local de modelos de razonamiento sin necesidad de GPUs CUDA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLM con aumento por difusión (diffusion-augmented) basado en K2-Horizon-7B; transformer autorregresivo con adaptador LoRA fusionado |
| Parámetros totales | 8.999.178.240 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8-bit uniforme (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización MLX de 8 bits de la versión fusionada de IFM/K2-Horizon-7B-Uno. El adaptador LoRA ha sido integrado en los pesos base durante la conversión, de modo que la cuantización resultante funciona como un modelo autorregresivo estándar, sin necesidad de cargar adaptadores adicionales. El modelo original se describe como un LLM aumentado con difusión basado en K2-Horizon-7B, lo que indica que incorpora componentes de difusión en su arquitectura, aunque no se dispone de más detalles técnicos en la información proporcionada.

No se han publicado datos sobre el proceso de entrenamiento, el volumen de tokens utilizado, la composición del dataset o la aplicación de técnicas de alineación como RLHF o DPO. El proceso de conversión, realizado con mlx-lm, incluye la fusión del adaptador y la cuantización uniforme a 8 bits. Para ejecutar el modelo correctamente se requiere oMLX v0.6.4 o superior, junto con un parche de soporte específico para K2-Horizon.

## Capacidades

- Generación de texto con cadena de razonamiento: está pensado para tareas de razonamiento paso a paso, y se recomienda usar reasoning_effort="high" para obtener respuestas completas.
- Razonamiento explícito separado de la respuesta: expone el campo reasoning_content, que permite distinguir la cadena de razonamiento del contenido final cuando se accede mediante la API compatible con OpenAI.
- Funcionamiento como modelo autorregresivo estándar: al estar el LoRA fusionado, el modelo se puede utilizar con las APIs convencionales de generación de texto.
- Despliegue local en Apple Silicon: el formato MLX está optimizado para macOS y los chips de la serie M.
- Compatibilidad con el protocolo de OpenAI: el ejemplo de uso muestra un servidor local en http://localhost:8000/v1 que devuelve tanto reasoning_content como content.
- No se han documentado capacidades de tool calling, visión, audio ni soporte multilingüe en la información disponible.

## Casos de uso

- Razonamiento explicativo en aplicaciones educativas: el modelo puede generar explicaciones detalladas y paso a paso de problemas matemáticos o lógicos. Se integraría en una plataforma educativa mediante un servidor compatible con la API de OpenAI, utilizando reasoning_effort="high".
- Asistente técnico local en macOS: gracias a la cuantización MLX de 8 bits, puede ejecutarse en un Mac con Apple Silicon sin depender de servicios en la nube. El repositorio pesa 31.9 GB, por lo que necesita una máquina con suficiente espacio en disco y memoria unificada.
- Investigación en cadenas de razonamiento: al ser un modelo de razonamiento, es útil para estudiar técnicas de chain-of-thought. El acceso al campo reasoning_content permite analizar y depurar la cadena de razonamiento generada.
- Prototipado de servidores de inferencia con oMLX: el modelo se puede desplegar en oMLX v0.6.4+ con el parche de soporte K2-Horizon, lo que permite montar un servidor local para pruebas controladas en infraestructura Apple Silicon.
- Generación de contenido técnico con justificación: el prompt de ejemplo "Explain step by step" indica que el modelo está orientado a producir explicaciones razonadas de conceptos complejos, algo útil en documentación técnica o divulgación.
- Evaluación del impacto de la cuantización en modelos de razonamiento: al existir versiones sin cuantizar de K2-Horizon-7B, esta variante de 8 bits permite comparar la degradación de rendimiento y memoria, aunque no se han publicado benchmarks al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en formato 8-bit ocupan aproximadamente 9 GB, ya que hay 8.999.178.240 parámetros a 1 byte por parámetro. El repositorio completo pesa 31.9 GB, lo que sugiere que también incluye los pesos originales sin cuantizar o archivos adicionales.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4), ya que MLX está diseñado específicamente para estos chips. No es compatible con GPUs CUDA.
- Cabe en consumer GPU: no de forma nativa, al ser un formato MLX. La conversión a otros formatos como GGUF no está contemplada en los datos proporcionados.
- Opciones de despliegue: mlx-lm para generación desde línea de comandos, oMLX v0.6.4+ con el parche K2-Horizon, y servidores compatibles con la API de OpenAI (el ejemplo muestra un servidor local en el puerto 8000).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Formato | Licencia | Longitud de contexto | Benchmarks |
|---|---|---|---|---|---|---|
| IFM/K2-Horizon-7B-Uno | ~9B | Original (sin cuantizar) | Safetensors | Apache 2.0 | no disponible | no disponible |
| hermitdave/K2-Horizon-7B-Uno-MLX-8bit | 8.999.178.240 | 8-bit MLX | Safetensors (MLX) | Apache 2.0 | no disponible | no disponible |
| hermitdave/K2-Horizon-7B-MLX-8bit | no disponible | 8-bit MLX | no disponible | Apache 2.0 | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos: no se han publicado evaluaciones de sesgos en la información disponible.
- Riesgo de alucinación: al ser un modelo de razonamiento sin benchmarks publicados, puede generar cadenas de razonamiento plausibles pero incorrectas.
- Limitaciones de contexto e idioma: no disponibles. No se puede garantizar soporte multilingüe ni una ventana de contexto larga.
- Restricciones de licencia: Apache 2.0 es permisiva y permite uso comercial, pero requiere mantener el aviso de copyright y la licencia. El modelo base pertenece al Institute of Foundation Models.
- Caveat técnico: requiere oMLX v0.6.4+ con el parche de soporte K2-Horizon (PR #3441). Sin ese parche, la ejecución puede fallar.
- La cuantización MLX de 8 bits limita el despliegue a Apple Silicon; no se incluyen instrucciones para convertir el modelo a CUDA u otros formatos.
- El adaptador LoRA está fusionado en los pesos base, por lo que no se puede modificar o separar el adaptador original sin rehacer la fusión.

## Enlaces

- HuggingFace: https://huggingface.co/hermitdave/K2-Horizon-7B-Uno-MLX-8bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B-Uno
- Parche oMLX: https://github.com/jundot/omlx/pull/3441
- Modelo relacionado: https://huggingface.co/hermitdave/K2-Horizon-7B-MLX-8bit
- Modelo relacionado: https://huggingface.co/hermitdave/K2-Horizon-7B-oQ6e
