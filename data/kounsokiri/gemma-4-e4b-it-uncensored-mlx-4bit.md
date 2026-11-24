# Kounsokiri/gemma-4-E4B-it-uncensored-mlx-4Bit

## Resumen

`Kounsokiri/gemma-4-E4B-it-uncensored-mlx-4Bit` es una conversión al formato MLX (Apple Silicon) en cuantización de 4 bits del modelo `TrevorJS/gemma-4-E4B-it-uncensored`, que a su vez es una variante "abliterated" (sin censura) de un modelo de la familia Gemma 4 en su variante E4B con ajuste de instrucciones. El autor de la conversión es el usuario de Hugging Face Kounsokiri, y la operación se realizó con `mlx-lm` versión 0.31.2. El modelo cuenta con 7.518.069.034 parámetros totales según los pesos en safetensors y un repositorio de 4,3 GB, coherente con la cuantización de 4 bits.

El interés de esta ficha es doble: por un lado, documenta un caso de despliegue local en hardware Apple mediante MLX, un stack cada vez más relevante para inferencia en Mac; por otro, ilustra el ecosistema de variantes "uncensored" obtenidas mediante técnicas de abliteration, que eliminan direcciones de activación asociadas al rechazo de peticiones. La model card es mínima y no aporta detalles sobre el proceso de abliteration, los datos de entrenamiento ni evaluaciones.

La información pública disponible es escasa: no hay benchmarks, no hay descripción de la arquitectura más allá de las etiquetas (`gemma4`, `image-text-to-text`), y no se documentan idiomas distintos del inglés. Esta ficha recoge lo verificable y marca explícitamente como "no disponible" todo lo que no consta en las fuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Gemma 4 (etiqueta `gemma4`); detalles internos no disponibles |
| Parametros totales | 7.518.069.034 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 4,3 GB) |

## Arquitectura y entrenamiento

El modelo es una conversión de pesos, no un entrenamiento desde cero. La cadena es: un modelo base Gemma 4 E4B con ajuste de instrucciones, modificado mediante abliteration por TrevorJS para producir `TrevorJS/gemma-4-E4B-it-uncensored`, y posteriormente convertido a MLX 4 bits por Kounsokiri con `mlx-lm` 0.31.2. La etiqueta `image-text-to-text` sugiere capacidades multimodales de entrada (imagen y texto), aunque la model card no lo detalla y el pipeline declarado es `text-generation`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni la metodología exacta de abliteration aplicada. La model card únicamente documenta el comando de conversión y un ejemplo de uso con `mlx_lm.load` y `mlx_lm.generate`. Cualquier afirmación sobre innovaciones técnicas (atención lineal, decodificación especulativa, mezcla de expertos) sería especulativa y no se incluye.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template` disponible en el tokenizer).
- Ajuste de instrucciones (`-it`), orientado a seguir indicaciones del usuario en formato multi-turno.
- Procesamiento de imagen y texto según la etiqueta `image-text-to-text`; no confirmado en la model card.
- Comportamiento "uncensored": la abliteration busca reducir los rechazos del modelo base ante peticiones que este bloquearía.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Modo "thinking" explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y la cuantización de 4 bits permiten cargar los ~7,5 mil millones de parámetros en equipos con memoria unificada moderada, usando `mlx-lm` como runtime nativo.
- Prototipado de asistentes conversacionales en local: la plantilla de chat y el ajuste de instrucciones permiten construir un chatbot multi-turno sin depender de APIs externas.
- Investigación sobre abliteration y alineación: útil para estudiar cómo cambia el comportamiento de rechazo respecto al modelo base y evaluar riesgos de las variantes sin censura.
- Experimentos de generación de texto creativo sin restricciones temáticas: el modelo está pensado para escenarios donde el modelo base aplicaría filtros de contenido.
- Evaluación comparativa de cuantizaciones: al existir el modelo base sin cuantizar, sirve para medir la degradación de calidad introducida por los 4 bits en MLX.
- Desarrollo de pipelines offline en macOS: integrable en scripts Python con `mlx_lm` para tareas de generación por lotes en entornos sin conectividad.
- Docencia y demostraciones de modelos abiertos: la licencia Apache 2.0 facilita su uso en materiales formativos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 4,3 GB en 4 bits, por lo que se necesita al menos ese espacio más overhead de runtime; en la práctica, entre 5 y 6 GB de memoria disponible.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada suficiente; el formato MLX no está pensado para GPU NVIDIA.
- Cabe en equipos consumer Apple: sí, en configuraciones de 8 GB en adelante, con margen creciente en 16 GB o más.
- Opciones de despliegue: `mlx-lm` (runtime principal); otros stacks como vLLM, llama.cpp, Ollama o TGI requerirían reconvertir los pesos a otro formato, ya que este repo está en MLX.
- Latencia y throughput: no disponibles; dependen del chip, la memoria y la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kounsokiri/gemma-4-E4B-it-uncensored-mlx-4Bit | 7.518.069.034 | no disponible | MLX 4 bits | apache-2.0 | Conversión MLX de una variante uncensored |
| TrevorJS/gemma-4-E4B-it-uncensored | no disponible (mismo origen) | no disponible | safetensors | no disponible en esta ficha | Modelo base sin cuantizar del que deriva |
| Modelo Gemma 4 E4B-it original | no disponible en esta ficha | no disponible | safetensors | no disponible en esta ficha | Variante con alineación estándar, sin abliteration |

La comparativa con alternativas de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La abliteration elimina mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o inseguro; no es apto para producción orientada al público sin filtros adicionales.
- Riesgo elevado de alucinación, agravado por la cuantización a 4 bits y por la falta de evaluaciones publicadas.
- Solo se declara inglés; el rendimiento en castellano no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero el comportamiento "uncensored" puede incumplir políticas de plataformas o normativas sectoriales.
- El formato MLX limita el despliegue a hardware Apple; no es portable directamente a CUDA.
- No hay información sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- La model card no documenta la longitud de contexto ni el proceso de conversión más allá del comando; conviene validar la calidad frente al modelo base antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kounsokiri/gemma-4-E4B-it-uncensored-mlx-4Bit
- Modelo base sin cuantizar: https://huggingface.co/TrevorJS/gemma-4-E4B-it-uncensored
- Repositorio de `mlx-lm`: https://github.com/ml-explore/mlx-lm
- Documentación de MLX: https://ml-explore.github.io/mlx/
