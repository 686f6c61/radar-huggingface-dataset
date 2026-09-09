# mradermacher/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-i1-GGUF

## Resumen

El repositorio **mradermacher/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-i1-GGUF** contiene cuantizaciones GGUF con *imatrix* (importance matrix) del modelo **MiniCPM5-2B-Abliterated-Uncensored**, que a su vez es una versión sin censura y *abliterated* de un modelo de 2.516.756.480 parámetros. La cuantización ha sido realizada por mradermacher, con licencia Apache 2.0, y los idiomas soportados son inglés y chino.

El modelo pertenece a la familia MiniCPM, orientada a ejecución en dispositivos con recursos limitados (*edge-ai*, *on-device*). El repositorio ofrece un archivo de *imatrix* para crear cuantizaciones personalizadas y numerosos archivos GGUF con distintos niveles de compresión (desde Q2 hasta Q6), con el objetivo de maximizar la relación calidad/rendimiento en entornos sin GPU dedicada. Al no incluir documentación técnica adicional en la model card, los detalles de arquitectura y entrenamiento no están disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio está etiquetado como `llama`, lo que sugiere compatibilidad con arquitecturas de tipo Llama, pero no se confirma) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica: no se indica que sea MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S; incluido archivo de *imatrix* |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones *imatrix* y estáticas); el modelo base está disponible en safetensors |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura del modelo ni sobre sus datos de entrenamiento. El repositorio se centra en la cuantización: se ha generado una matriz de importancia activacional (`imatrix`) y los pesos se han cuantizado en múltiples niveles para reducir el tamaño y facilitar la inferencia en CPU o GPU de gama baja. El modelo base es una variante denominada `Abliterated-Uncensored`, lo que en el ecosistema open source suele indicar que se han eliminado o atenuado las alineaciones de seguridad durante el proceso de creación. No se han encontrado publicaciones ni informes técnicos adicionales en la información disponible.

## Capacidades

- Generación de texto y conversación: etiquetado como `text-generation` y `conversational`.
- Soporte de *tool calling* / *function calling*, según etiqueta `tool-calling`.
- Optimizado para ejecución en dispositivos de borde y aplicaciones *on-device*, según etiquetas `edge-ai` y `on-device`.
- Multilingüe en inglés y chino.
- Disponible en formato GGUF, apto para runtime locales como llama.cpp, Ollama y LM Studio.
- Repositorio con cuantizaciones *imatrix* y estáticas que permiten experimentar con distintos presupuestos de memoria.

## Casos de uso

- **Asistentes conversacionales en dispositivos de borde**: al ser un modelo de ~2B cuantizado a GGUF, puede ejecutarse en una Raspberry Pi o en un mini PC. Su soporte de *tool-calling* permite consultar APIs y responder en inglés o chino sin depender de la nube.
- **Atención al cliente bilingüe**: puede integrarse en un sistema de tickets para gestionar consultas en inglés y chino de forma automatizada, usando *tool calling* para consultar la base de datos de pedidos o devoluciones.
- **Generación de código en entornos locales**: a pesar de no disponer de benchmarks, su tamaño compacto y su soporte de *tool calling* lo hacen adecuado para asistir en la escritura de código dentro de editores como VS Code mediante llama.cpp, con respuestas de baja latencia en CPU.
- **Traducción y adaptación de contenidos**: aprovechando sus dos idiomas, puede utilizarse para traducir interfaces de usuario, documentación técnica o correos electrónicos en tiempo real en un entorno sin conexión.
- **Agentes autónomos en servidores de gama baja**: su carácter compacto y el *tool calling* permiten desplegar agentes que interactúan con bases de datos, correo o servicios externos sobre hardware sin GPU.
- **Investigación de técnicas de cuantización y desalineación**: el repositorio facilita comparar el efecto de distintos niveles de cuantización sobre un modelo *abliterated*, útil para evaluar la degradación de calidad y el comportamiento de seguridad frente al modelo original.
- **Prototipado rápido de chatbots en portátiles**: para probar flujos conversacionales sin GPU, se puede cargar una de las cuantizaciones Q4 o Q5 con llama.cpp y ejecutarla en la RAM del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 2.516 millones de parámetros en cuantización Q4_K_M, se estima un uso aproximado de 1,5 a 2,5 GB, incluyendo el contexto. Con cuantizaciones más pequeñas (Q2_K) puede reducirse a menos de 1,5 GB.
- GPU recomendadas: no disponible en la información del repositorio. Por tamaño, puede ejecutarse en tarjetas con al menos 4 GB de VRAM (por ejemplo, RTX 3050), aunque el modelo está pensado para funcionar también en CPU.
- Sí cabe en GPU de consumo: dado su tamaño, la mayoría de los quants Q4 a Q6 pueden cargarse en una tarjeta de gama de entrada con 4-6 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El modelo base en safetensors podría desplegarse con frameworks como vLLM o TGI, aunque no se ha documentado en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información comparativa en los datos proporcionados. La c categoría del modelo es un LLM compacto de ~2B con licencia Apache 2.0, pero no se aportan benchmarks ni análisis frente a alternativas.

## Limitaciones y advertencias

- Se trata de una versión *abliterated* y *uncensored*, por lo que es probable que se hayan reducido o eliminado las alineaciones de seguridad. Esto puede producir contenido ofensivo, peligroso o inapropiado sin restricciones.
- No se han publicado benchmarks ni evaluaciones de seguridad o sesgos en este repositorio.
- Solo soporta inglés y chino, lo que limita su uso en otros idiomas.
- La calidad de la generación depende en gran medida del tipo de cuantización elegido; los quants más agresivos (Q2, IQ1) pueden degradar notablemente el rendimiento.
- La longitud de contexto no está especificada, por lo que no se conocen los límites reales de ventana de atención.
- Aunque la licencia del repositorio es Apache 2.0, la cadena de derivados (modelo base, variante *abliterated*) puede tener condiciones adicionales; se recomienda revisar las licencias de todos los componentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mradermacher/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-i1-GGUF
- Modelo base: https://huggingface.co/mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-GGUF
- Página de descarga del modelo: https://hf.tst.eu/model#MiniCPM5-2B-Abliterated-Uncensored-Safetensors-i1-GGUF
- Preguntas frecuentes y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de tipos de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
