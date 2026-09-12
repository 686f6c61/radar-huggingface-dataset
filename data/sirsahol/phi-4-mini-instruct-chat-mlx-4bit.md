# SirSahOl/Phi-4-mini-instruct-chat-mlx-4bit

## Resumen

SirSahOl/Phi-4-mini-instruct-chat-mlx-4bit es una conversión de pesos a 4 bits en formato MLX del modelo microsoft/Phi-4-mini-instruct, realizada por el usuario SirSahOl y publicada en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una cuantización weight-only pensada específicamente para ejecutar el modelo en hardware Apple Silicon (M1 o posterior) mediante la librería MLX de Apple. El repositorio ocupa 2,2 GB y el checkpoint contiene 3.836.021.760 parámetros.

El modelo conserva la arquitectura y el comportamiento del modelo base: un transformer denso (etiquetado como phi3 en HuggingFace) orientado a generación de texto y uso conversacional. La aportación de esta ficha es puramente práctica: permite ejecutar Phi-4-mini en un Mac con memoria unificada limitada, como demuestra el benchmark del propio autor (2.306,2 MB de memoria pico en un M1 con 8 GB).

El interés actual de esta conversión radica en el despliegue local en equipos de consumo del ecosistema Apple, sin necesidad de GPU dedicada ni de servicios en la nube. El autor publica además variantes en 8 bits y 16 bits para quienes dispongan de más memoria. La licencia MIT y el reducido tamaño del checkpoint facilitan su integración en prototipos y aplicaciones de escritorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only; etiqueta HuggingFace phi3; conversión de pesos a MLX |
| Parametros totales | 3.836.021.760 (aproximadamente 3,84 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible; la model card advierte de degradación del rendimiento con contextos superiores a 8K tokens |
| Tipos de cuantizacion | 4-bit en este repositorio; el mismo autor publica variantes de 8-bit y 16-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX) |
| Modelo base | microsoft/Phi-4-mini-instruct |
| Framework de ejecucion | MLX (Apple), con mlx-lm 0.31.3 |
| Tamano del repositorio | 2,2 GB (salida de conversion: 2,0 GB) |
| Fecha de publicacion | 2026-09-12 |

## Arquitectura y entrenamiento

No ha habido entrenamiento ni ajuste fino por parte de SirSahOl: la conversión es weight-only y la arquitectura, los pesos y el comportamiento se heredan íntegramente de microsoft/Phi-4-mini-instruct. Por tanto, no procede hablar aquí de dataset, número de tokens de entrenamiento, RLHF o DPO por parte del autor de la conversión, ya que no se documentan en la información disponible.

El único proceso técnico descrito es la conversión a formato MLX. Según la model card, se realizó con mlx-lm 0.31.3 mediante el comando `mlx_lm.convert --q-bits 4`, con un tiempo de conversión de 3.386,82 segundos y un tamaño de salida de 2,0 GB. La etiqueta custom_code en HuggingFace indica que el repositorio puede requerir código personalizado para su carga. El autor menciona que la conversión se hizo con su propio pipeline, MLX Foundry.

## Capacidades

- Generación de texto y uso conversacional: el pipeline declarado es text-generation y el modelo está etiquetado como conversational.
- Conversación multi-turno mediante la CLI de MLX (`mlx_lm.chat`) o la API de Python de mlx-lm.
- Ejecución local en Apple Silicon a través del framework MLX.
- Soporte de tool calling / function calling: no documentado en la información disponible, aunque puede heredarse del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponible (la lista de idiomas no figura en los metadatos ni en la model card).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Asistente conversacional de escritorio en Mac: el modelo puede ejecutarse íntegramente en local con mlx-lm sobre un M1 con 8 GB, gestionando conversaciones de chat sin enviar datos a servicios externos, lo que resulta adecuado para aplicaciones con requisitos de privacidad.
- Prototipado rápido de aplicaciones de generación de texto: gracias a la CLI `mlx_lm.generate` y a la API de Python, permite validar prompts y flujos conversacionales en pocos minutos sobre hardware de consumo.
- Automatización de tareas de redacción en local: borradores de correos, resúmenes o textos breves generados en el propio equipo, con un consumo de memoria pico de unos 2,3 GB.
- Preprocesado y enriquecimiento de texto dentro de pipelines locales: clasificación, reformulación o extracción de información a partir de instrucciones en lenguaje natural, ejecutadas sin dependencia de red.
- Desarrollo y depuración de integraciones MLX: sirve como referencia para comprobar el comportamiento de una cuantización de 4 bits frente a las variantes de 8 y 16 bits del mismo autor, midiendo el impacto en calidad y memoria.
- Evaluación comparativa de cuantizaciones en investigación: permite reproducir la conversión (`mlx_lm.convert`) y analizar la pérdida de calidad introducida por los 4 bits frente al modelo base sin cuantizar.
- Asistente embebido en herramientas de escritorio para macOS: al residir en memoria unificada y no requerir CUDA, puede integrarse en editores o utilidades nativas mediante la librería mlx-lm.

## Benchmarks y rendimiento

El autor publica únicamente métricas de rendimiento local medidas en un Apple M1 con 8 GB de memoria unificada, promediadas sobre 5 ejecuciones con 256 tokens máximos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Metrica | Valor (4-bit, Apple M1 8 GB) |
|---|---|
| Tokens por segundo | 23,99 |
| TTFT (tiempo hasta el primer token) | 41,69 ms |
| Memoria pico | 2.306,2 MB |

## Requisitos de hardware

- Requisito de plataforma: hardware Apple Silicon (M1 o posterior); la model card indica explícitamente que el modelo necesita un chip de la serie M para ejecutarse con MLX.
- VRAM/unified memory estimada: alrededor de 2.306,2 MB en memoria pico para la variante de 4 bits, según el benchmark del autor en un M1 con 8 GB.
- GPU recomendadas: no aplica a GPU NVIDIA o AMD; el framework MLX está orientado a Apple Silicon. El autor recomienda 4 bits para M1/M2 con 8 GB, 8 bits para M1/M2 Pro/Max con 16-32 GB y 16 bits para M2/M3/M4 Ultra con 64 GB o más.
- Compatibilidad con GPU de consumo: el modelo cabe en Macs con memoria unificada de 8 GB en su versión de 4 bits. No se contempla su ejecución en GPUs de consumo tipo RTX.
- Opciones de despliegue: mlx-lm (CLI `mlx_lm.chat` y `mlx_lm.generate`, y API de Python). No se documentan despliegues con vLLM, llama.cpp, Ollama o TGI, que no son compatibles con el formato MLX.
- Latencia y throughput: 23,99 tokens/s y 41,69 ms de TTFT sobre M1 con 8 GB en el benchmark del autor.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos de la misma categoría en la información proporcionada. La comparación más directa es entre las distintas variantes publicadas por el mismo autor y el modelo base sin cuantizar.

| Modelo | Cuantizacion | Tamano / parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| SirSahOl/Phi-4-mini-instruct-chat-mlx-4bit | 4-bit | 3,84 B; 2,2 GB de repositorio | no disponible | MIT | safetensors (MLX) |
| SirSahOl/Phi-4-mini-instruct-chat-mlx-8bit | 8-bit | base de 3,84 B | no disponible | MIT | safetensors (MLX) |
| SirSahOl/Phi-4-mini-instruct-chat-mlx-16bit | 16-bit | base de 3,84 B | no disponible | MIT | safetensors (MLX) |
| microsoft/Phi-4-mini-instruct | sin cuantizar (modelo base) | 3,84 B | no disponible | MIT | safetensors |

## Limitaciones y advertencias

- Pérdida de calidad por cuantización: al ser una conversión weight-only a 4 bits, introduce una degradación de calidad respecto al modelo original; a menor número de bits, mayor pérdida.
- Degradación en contextos largos: la model card advierte de que el rendimiento puede empeorar con contextos muy largos (más de 8K tokens) en niveles bajos de cuantización.
- Dependencia de plataforma: requiere Apple Silicon (M1 o posterior) y el framework MLX; no es ejecutable con vLLM, llama.cpp o GPUs NVIDIA/AMD.
- Herencia del modelo base: al no haber entrenamiento propio, el modelo arrastra los sesgos, el riesgo de alucinación y las limitaciones idiomáticas de microsoft/Phi-4-mini-instruct, no detalladas en esta información.
- Idiomas no documentados: no se especifica la cobertura lingüística en los metadatos ni en la model card.
- Etiqueta custom_code: la carga del modelo puede requerir ejecutar código personalizado del repositorio, lo que implica revisar la procedencia antes de usarlo en producción.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe retroalimentación de terceros sobre su funcionamiento.
- Restricciones de licencia: la conversión hereda la licencia MIT del modelo base, lo que permite uso comercial, pero conviene verificar los términos completos en la model card original.
- Caveat de producción: el tiempo de conversión documentado (3.386,82 segundos) y el uso de mlx-lm 0.31.3 indican que la reproducibilidad depende de esa versión concreta de la librería.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SirSahOl/Phi-4-mini-instruct-chat-mlx-4bit
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Variante 8-bit: https://huggingface.co/SirSahOl/Phi-4-mini-instruct-chat-mlx-8bit
- Variante 16-bit: https://huggingface.co/SirSahOl/Phi-4-mini-instruct-chat-mlx-16bit
- Perfil del autor: https://huggingface.co/SirSahOl
- Framework MLX (Apple): https://github.com/ml-explore/mlx
- Pipeline de conversión MLX Foundry: https://github.com/SirSahOl/mlx-foundry
