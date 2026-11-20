# bartowski/Inkling-2-Small-GGUF

## Resumen

Inkling-2-Small es un modelo de lenguaje multimodal de tipo Mixture of Experts (MoE) desarrollado por Thinking Machines, distribuido originalmente en Hugging Face bajo el identificador `thinkingmachines/Inkling-2-Small`. La ficha que nos ocupa corresponde a la versión cuantizada en formato GGUF publicada por bartowski, un conocido distribuidor de cuantizaciones para llama.cpp. El modelo base cuenta con 593.722.948.608 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de gran escala orientados a despliegues con requisitos de hardware muy elevados.

El modelo está etiquetado como `image-text-to-text`, lo que indica soporte de entrada multimodal (imagen y texto), además de las etiquetas `conversational` y `moe`. La model card del cuantizador menciona soporte de entrada de texto y un formato de prompt específico con niveles de esfuerzo de razonamiento ("Thinking effort level"), lo que sugiere un modo de razonamiento configurable. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni los detalles del entrenamiento en la información proporcionada.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo MoE de casi 600B parámetros en entornos locales mediante cuantización GGUF, con opciones que van desde Q8_0 (631 GB) hasta IQ2_S (209 GB). La licencia Apache 2.0 facilita su uso comercial, aunque el tamaño del modelo limita seriamente su despliegue a infraestructura especializada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer (detalles no disponibles) |
| Parámetros totales | 593.722.948.608 (594B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, Q3_K_L, IQ3_M, Q3_K_M, IQ3_XS, Q3_K_S, IQ3_XXS, Q2_K, IQ2_M, IQ2_S (imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible confirma que Inkling-2-Small emplea una arquitectura Mixture of Experts (MoE), según la etiqueta `moe` de la model card y la clasificación del repositorio. El recuento de parámetros totales asciende a 594B, aunque no se especifica el número de parámetros activos por token ni el número de expertos. Tampoco se detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación.

La model card del cuantizador indica que no se utiliza decodificación especulativa ("Speculative decoding: no") y que las cuantizaciones se han generado con llama.cpp release b12412 empleando imatrix, una técnica que mejora la calidad de las cuantizaciones de baja precisión mediante una matriz de importancia calculada a partir de datos de calibración. El formato de prompt incluye etiquetas especiales como `<|message_system|>`, `<|content_text|>`, `<|end_message|>` y `<|message_user|>`, además de un campo "Thinking effort level" que permite ajustar el esfuerzo de razonamiento del modelo. También se documenta un formato específico para declaración de herramientas (`tool_declare`) en XML, lo que confirma soporte de function calling.

## Capacidades

- Generación de texto conversacional multi-turno, con formato de prompt estructurado mediante etiquetas especiales.
- Procesamiento de entrada multimodal imagen-texto, según la etiqueta `image-text-to-text` del repositorio.
- Razonamiento configurable mediante el parámetro "Thinking effort level" (valor de ejemplo 0.9 en la model card).
- Soporte de tool calling / function calling mediante el bloque `tool_declare` en XML con definiciones JSON de funciones.
- Arquitectura MoE, que permite activar solo una fracción de los parámetros por token (número de parámetros activos no disponible).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de audio, visión detallada ni otros modos especiales más allá de la entrada imagen-texto.

## Casos de uso

- Razonamiento complejo con esfuerzo configurable: el parámetro "Thinking effort level" permite ajustar la profundidad de razonamiento por consulta, lo que resulta útil en pipelines donde se necesita equilibrar latencia y calidad según la tarea.
- Automatización de agentes con tool calling: el formato `tool_declare` permite definir funciones en JSON y que el modelo las invoque, adecuado para orquestación de agentes que consultan APIs externas (por ejemplo, precios de acciones, como muestra la model card).
- Procesamiento de documentos con imagen y texto: al ser un modelo image-text-to-text, puede emplearse en tareas de extracción de información de capturas, diagramas o documentos escaneados combinados con instrucciones textuales.
- Asistencia conversacional de largo alcance: aunque la longitud de contexto no está documentada, el formato de prompt con etiquetas de sistema y usuario facilita conversaciones multi-turno estructuradas.
- Investigación en cuantización de modelos MoE masivos: la disponibilidad de 20 variantes de cuantización (desde Q8_0 hasta IQ2_S) permite estudiar el impacto de la precisión en el rendimiento de un MoE de 594B parámetros.
- Despliegue en infraestructura con gran capacidad de memoria: con cuantizaciones de 209-631 GB, el modelo puede ejecutarse en servidores con múltiples GPUs o en configuraciones de RAM abundante mediante llama.cpp, orientado a entornos de investigación y prototipado a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización:
  - Q8_0: ~631 GB
  - Q6_K: ~522 GB
  - Q5_K_M: ~454 GB
  - Q4_K_M: ~369 GB
  - IQ4_XS: ~322 GB
  - Q3_K_M: ~280 GB
  - IQ2_M: ~209 GB
- GPU recomendadas: no disponibles en la información proporcionada; por el volumen de memoria requerido, se necesitan configuraciones multi-GPU de clase数据中心 (A100/H100 con 80 GB cada una) o servidores con gran cantidad de RAM.
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, etc.) en ninguna de las cuantizaciones disponibles; la variante más pequeña (IQ2_S, ~209 GB) excede con mucho la memoria de una GPU consumer.
- Opciones de despliegue: llama.cpp (versión b12412 o superior, empleada para generar las cuantizaciones); compatible con endpoints según la etiqueta `endpoints_compatible`. No se documentan otras opciones como vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El tamaño del modelo (594B parámetros, 209-631 GB según cuantización) hace inviable su despliegue en hardware de consumo; requiere infraestructura especializada.
- No se dispone de información sobre sesgos conocidos, riesgos de alucinación ni evaluación de seguridad del modelo base.
- La longitud de contexto no está documentada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Los idiomas soportados no están especificados; no se puede garantizar un rendimiento adecuado en castellano u otros idiomas distintos del inglés.
- El número de parámetros activos del MoE no está disponible, por lo que no se puede estimar el coste computacional real por token.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la model card del modelo base (`thinkingmachines/Inkling-2-Small`) para posibles condiciones adicionales.
- Las cuantizaciones de baja precisión (Q2_K, IQ2_M, IQ2_S) pueden degradar notablemente la calidad; la model card recomienda Q4_K_M como equilibrio por defecto.
- No se han publicado benchmarks que permitan validar el rendimiento real del modelo en tareas estándar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/Inkling-2-Small-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp b12412: https://github.com/ggml-org/llama.cpp/releases/tag/b12412
