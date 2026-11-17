# bartowski/Inkling-2-Small-GGUF

## Resumen

Inkling-2-Small es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Thinking Machines, distribuido originalmente en Hugging Face bajo el identificador `thinkingmachines/Inkling-2-Small`. La versión aquí descrita es la cuantización GGUF realizada por bartowski mediante llama.cpp (release b12412), pensada para su ejecución en entornos locales y con soporte de imatrix. El checkpoint original declara 594 mil millones de parámetros totales (593.722.948.608 según los safetensors), lo que lo sitúa en la categoría de modelos de gran escala, aunque su naturaleza MoE implica que solo una fracción de esos parámetros se activa por token.

El modelo está etiquetado como conversacional, orientado a generación de texto e image-text-to-text, y admite tool calling mediante un formato de prompt específico con declaración de herramientas en XML. Incorpora además un mecanismo de "thinking effort level" que permite ajustar el esfuerzo de razonamiento en la generación. La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en productos derivados.

La relevancia de esta ficha radica en que se trata de una cuantización GGUF de un modelo MoE de muy gran tamaño, con un rango amplio de cuantizaciones que van desde Q8_0 (631 GB) hasta IQ2_S (209 GB), lo que permite desplegarlo en infraestructuras con distintos presupuestos de memoria. No obstante, el tamaño del repositorio (7.543,7 GB) y el volumen de cada fichero hacen que su despliegue requiera hardware de gama alta o clústeres multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer; detalles de capas y atención no disponibles |
| Parametros totales | 593.722.948.608 (594B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, Q3_K_L, IQ3_M, Q3_K_M, IQ3_XS, Q3_K_S, IQ3_XXS, Q2_K, IQ2_M, IQ2_S |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); checkpoint original en safetensors |

## Arquitectura y entrenamiento

La información disponible confirma que Inkling-2-Small es un modelo MoE, con 594B parámetros totales en el checkpoint original. No se especifican en la documentación proporcionada el número de expertos, el número de expertos activos por token, la dimensión del modelo, el número de capas ni el mecanismo de atención empleado. Tampoco se detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación.

Sí se documenta una innovación operativa relevante: el prompt format incluye un campo "Thinking effort level" (por ejemplo, 0.9) que permite controlar el esfuerzo de razonamiento del modelo en tiempo de inferencia. Además, el modelo soporta declaración de herramientas mediante un bloque `tool_declare` en XML dentro del mensaje de sistema, lo que habilita el uso de function calling estructurado. La cuantización se ha realizado con llama.cpp b12412 e incluye imatrix, lo que mejora la calidad de las cuantizaciones de baja precisión.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con control de esfuerzo mediante el parámetro "Thinking effort level" en el prompt de sistema.
- Tool calling y function calling mediante declaración de herramientas en XML (`tool_declare`).
- Procesamiento image-text-to-text según las etiquetas del modelo (aunque la model card indica "Input support: text", existe una discrepancia que conviene verificar contra el modelo base).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: implícito por el soporte de tool calling, aunque no se documentan detalles adicionales.
- No se documenta soporte de audio ni de otras modalidades.

## Casos de uso

- Asistentes conversacionales de dominio experto: el formato de prompt con system message y thinking effort permite ajustar el nivel de razonamiento según la complejidad de la consulta, útil en atención al cliente técnica o legal donde se requiere precisión variable.
- Automatización de agentes con herramientas: la declaración de funciones en XML permite integrar el modelo en pipelines que consulten APIs externas (por ejemplo, precios de acciones, bases de datos internas) y encadenen llamadas multi-paso.
- Generación de código asistida en producción: con tool calling puede integrarse en flujos de CI/CD que consulten repositorios, ejecuten tests o creen pull requests, siempre que la infraestructura soporte el tamaño del modelo.
- Análisis de documentos largos: aunque la longitud de contexto no está documentada, un modelo de 594B parámetros totales está pensado para tareas de comprensión profunda; conviene validar el contexto real antes de usarlo con documentos extensos.
- Investigación en alineación y evaluación de MoE: al ser Apache 2.0 y estar disponible en múltiples cuantizaciones, es adecuado para experimentos académicos sobre comportamiento de modelos MoE a gran escala.
- Despliegue en infraestructura propia con llama.cpp: las cuantizaciones IQ2/IQ3 permiten ejecutar el modelo en clústeres con menos VRAM que el checkpoint original, útil para laboratorios con presupuesto limitado.
- Fine-tuning y destilación: al ser Apache 2.0, puede servir como base para adaptaciones de dominio, aunque el coste computacional de un modelo de 594B es elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q8_0 ≈ 631 GB, Q6_K ≈ 522 GB, Q5_K_M ≈ 454 GB, Q4_K_M ≈ 369 GB, IQ4_XS ≈ 322 GB, Q3_K_M ≈ 280 GB, IQ3_XXS ≈ 245 GB, Q2_K ≈ 226 GB, IQ2_M ≈ 209 GB, IQ2_S ≈ 209 GB (los tamaños son de fichero; la VRAM necesaria puede ser similar o algo superior por overhead de contexto y KV cache).
- GPU recomendadas: para las cuantizaciones más altas se requieren clústeres multi-GPU (por ejemplo, varias H100 80GB o A100 80GB); para IQ2/IQ3 se necesitan al menos 3-4 GPUs de 80 GB o configuraciones con memoria unificada de gran capacidad.
- No cabe en GPUs de consumo (RTX 4090 24GB, RTX 3090 24GB) ni en configuraciones de 2-4 GPUs consumer; requiere hardware de centro de datos.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y potencialmente servidores compatibles con GGUF como Ollama o llama-cpp-python; vLLM y TGI no soportan GGUF de forma nativa para este tamaño sin conversión.
- Latencia y throughput estimados: no disponibles. Dado el tamaño, se espera un throughput bajo por GPU y una latencia alta en comparación con modelos densos de menor tamaño.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se indica "no disponible" para parámetros, contexto, rendimiento y disponibilidad de alternativas de la misma categoría.

## Limitaciones y advertencias

- El tamaño del modelo (594B parámetros totales) implica requisitos de hardware muy elevados; no es viable en estaciones de trabajo convencionales.
- La model card indica "Input support: text", pero las etiquetas incluyen image-text-to-text; existe una discrepancia que debe verificarse contra el modelo base antes de asumir capacidades multimodales.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos no especificados, es probable que herede sesgos de su corpus; se recomienda evaluación específica antes de producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Longitud de contexto e idiomas soportados no disponibles; no se debe asumir un contexto largo sin verificación.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base y de los datos de entrenamiento (no documentados).
- El repositorio ocupa 7.543,7 GB, lo que requiere almacenamiento considerable y estrategias de descarga por partes (split files).
- Las cuantizaciones de baja precisión (Q2, IQ2) pueden degradar notablemente la calidad; bartowski recomienda Q4_K_M como equilibrio.
- No se documenta soporte de decodificación especulativa ("Speculative decoding: no").

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/Inkling-2-Small-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- llama.cpp: https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp b12412: https://github.com/ggml-org/llama.cpp/releases/tag/b12412
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Detalles de imatrix: https://huggingface.co/bartowski/Inkling-2-Small-GGUF#imatrix
