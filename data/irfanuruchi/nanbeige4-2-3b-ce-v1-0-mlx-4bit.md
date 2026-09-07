# Irfanuruchi/Nanbeige4.2-3B-CE-v1.0-MLX-4bit

## Resumen

Nanbeige4.2-3B-CE v1.0 es un modelo de lenguaje de 4.169.800.704 parámetros (dato real de los safetensors) desarrollado por Irfanuruchi como fine-tune del modelo base Nanbeige/Nanbeige4.2-3B. Está especializado en Computer Engineering y sistemas, y esta versión concreta es una cuantización MLX de 4 bits pensada para ejecutarse en Apple Silicon. Resuelve tareas de generación de texto conversacional en inglés, con un enfoque técnico en temas de sistemas, contenedores, redes y administración. La relevancia actual radica en ofrecer un modelo pequeño (2,4 GB) con una ventana de contexto de 262.144 tokens, lo que permite manejar documentación técnica extensa. La arquitectura nanbeige incluye 22 capas ocultas, 48 cabezas de atención y 8 KV heads, con la particularidad de `num_loops=2`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nanbeige (Transformer con 22 capas, hidden size 3072, intermediate size 10752, 48 cabezas de atención, 8 KV heads, `num_loops=2`) |
| Parametros totales | 4.169.800.704 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit affine (MLX), group size 64, ~4,5 bits por peso |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura nanbeige, una variante de Transformer con 22 capas ocultas, hidden size de 3072, intermediate size de 10752, 48 cabezas de atención y 8 KV heads. La configuración incluye `num_loops=2` y `skip_loop_final_norm=false`. El contexto configurado es de 262.144 tokens y el vocabulario tiene 166.144 entradas. Se trata de un fine-tune del modelo base Nanbeige/Nanbeige4.2-3B, orientado a Computer Engineering y sistemas. No se han proporcionado detalles sobre el dataset de entrenamiento, el número de tokens ni la aplicación de técnicas como RLHF o DPO. La conversión a MLX 4-bit se realizó con MLX-LM 0.32.0 y MLX 0.32.2, preservando la arquitectura nativa y eliminando los archivos de implementación Python de Transformers.

## Capacidades

- Generación de texto conversacional en inglés, con un enfoque técnico en sistemas y Computer Engineering.
- Modo de pensamiento (thinking) que puede activarse o desactivarse mediante el parámetro `enable_thinking` en el chat template.
- Ventana de contexto de 262.144 tokens, adecuada para documentos largos.
- Soporte de tool calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo thinking sugiere razonamiento, pero no hay datos.
- Capacidades multilingües: solo inglés (en).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Soporte técnico de contenedores y redes: el modelo puede responder preguntas sobre Docker, DNS interno y redes definidas por usuario, como se muestra en el ejemplo de validación. Su contexto largo permite incluir logs o configuraciones extensas.
- Documentación técnica de sistemas: genera explicaciones sobre arquitecturas de software, configuración de servicios y resolución de nombres en entornos contenerizados, en inglés.
- Educación en ingeniería informática: sirve como tutor para estudiantes que necesitan entender conceptos de sistemas operativos, redes y virtualización, gracias a su enfoque especializado.
- Asistencia en administración de servidores: ayuda a interpretar logs, configuraciones y comandos de despliegue, reduciendo el tiempo de diagnóstico.
- Generación de FAQs técnicas: crea contenido de ayuda para equipos de soporte en inglés, aprovechando su capacidad de generar respuestas claras sobre sistemas.
- Análisis de arquitecturas de referencia: explica cómo funcionan componentes como resolvers DNS en redes definidas por usuario, útil para revisiones de diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para GPU; en Apple Silicon se observó un pico de memoria de ~2,6 GB durante la validación con MLX.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño de 2,4 GB y la cuantización 4-bit, pero no hay datos verificados.
- Opciones de despliegue: MLX-LM en Apple Silicon (arm64). Existe una versión GGUF separada del mismo fine-tune para otros runtimes; no se menciona soporte para vLLM, llama.cpp, Ollama o TGI en esta versión concreta.
- Latencia y throughput estimados: ~32,5 tokens/s observados en un sistema Apple Silicon durante la validación; no es una garantía general.

## Comparativa con modelos similares

No disponible. No se dispone de datos suficientes para una comparativa completa. El modelo base es Nanbeige/Nanbeige4.2-3B y existe una versión GGUF del mismo fine-tune (Irfanuruchi/Nanbeige4.2-3B-CE-v1.0-GGUF), pero no se han publicado benchmarks que permitan comparar rendimiento.

## Limitaciones y advertencias

- La cuantización no introduce un nuevo gate de calidad factual; las debilidades del checkpoint fuente persisten.
- Se conocen debilidades de precisión y factualidad en preguntas de sistemas difíciles.
- Solo soporta inglés.
- Puede generar alucinaciones, especialmente en temas complejos de sistemas.
- Transformers puede emitir una advertencia al cargar la configuración `nanbeige` no registrada; se recomienda usar MLX-LM.
- El rendimiento observado (32,5 tokens/s, 2,6 GB) corresponde a una validación en un único sistema Apple Silicon; no es una garantía.
- Licencia Apache-2.0 permite uso comercial, pero se debe mantener el aviso de licencia.

## Enlaces

- https://huggingface.co/Irfanuruchi/Nanbeige4.2-3B-CE-v1.0-MLX-4bit
- https://huggingface.co/Irfanuruchi/Nanbeige4.2-3B-CE-v1.0 (release canónica BF16)
- https://huggingface.co/Irfanuruchi/Nanbeige4.2-3B-CE-v1.0-GGUF
- https://huggingface.co/Nanbeige/Nanbeige4.2-3B
