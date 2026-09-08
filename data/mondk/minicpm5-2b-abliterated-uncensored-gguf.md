# mondk/MiniCPM5-2B-Abliterated-Uncensored-GGUF

## Resumen

El modelo `mondk/MiniCPM5-2B-Abliterated-Uncensored-GGUF` es una variante modificada del modelo base `openbmb/MiniCPM5-2B`, un Transformer denso de 2B de parámetros desarrollado por OpenBMB. El modelo original está diseñado para despliegue local y escenarios con recursos limitados, alcanzando el estado del arte en su clase. Esta versión, creada por `mondk`, elimina las capas de "refusal" del modelo para generar contenido sin restricciones, y se distribuye en formato GGUF para su uso con herramientas como llama.cpp u Ollama.

El modelo tiene 2.516.756.480 parámetros totales y está etiquetado como "conversational", lo que indica que está pensado para tareas de chat. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni la licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parámetros totales | 2.516.756.480 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-2B es un Transformer denso de 2B de parámetros, desarrollado por OpenBMB como parte de la serie MiniCPM5. Según la información publicada, escala la misma receta de entrenamiento que el MiniCPM5-1B y está optimizado para despliegue en dispositivos locales y escenarios con recursos limitados. No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número de tokens o si se aplicaron técnicas de alineación como RLHF o DPO.

La versión abliterated de `mondk` modifica el modelo original eliminando las capas responsables de rechazar peticiones no permitidas, lo que da como resultado un modelo sin censura. Sin embargo, no se ha publicado documentación técnica sobre el procedimiento exacto de modificación ni sobre su impacto en el rendimiento.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para mantener diálogos, como indica la etiqueta "conversational".
- Inferencia local: al ser un modelo de 2B y distribuirse en GGUF, puede ejecutarse en CPU y GPU con recursos limitados.
- Sin filtros de seguridad: al ser una versión abliterated, el modelo no rechaza peticiones que el modelo base podría bloquear, lo que permite generar contenido sin restricciones.
- Compatibilidad con endpoints: el modelo está marcado como "endpoints_compatible", lo que sugiere que puede desplegarse en la infraestructura de HuggingFace.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio o capacidades multilingües específicas.

## Casos de uso

- Asistente de chat local para dispositivos con recursos limitados: gracias a su tamaño de 2B y formato GGUF, puede ejecutarse en un portátil o en una Raspberry Pi con cuantización Q4, ofreciendo respuestas conversacionales sin depender de la nube.
- Prototipado rápido de aplicaciones de IA: al ser un modelo pequeño y de fácil despliegue con llama.cpp u Ollama, es adecuado para experimentar y validar ideas sin necesidad de infraestructura costosa.
- Generación de contenido creativo sin restricciones: al ser una versión "uncensored", puede utilizarse para escribir ficción, diálogos o guiones que aborden temas que otros modelos censuran.
- Educación y aprendizaje: puede usarse como tutor de conversación en entornos controlados, donde la falta de filtros no supone un riesgo y se busca explorar temas libremente.
- Investigación en alineación y seguridad: este modelo sirve como ejemplo de los efectos de la técnica "abliteration" en modelos pequeños, permitiendo estudiar cómo se comporta sin capas de rechazo.
- Aplicaciones de chat en intranets o entornos aislados: al no depender de servicios externos, se puede desplegar en redes privadas para asistentes internos sin riesgo de fuga de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base MiniCPM5-2B afirma alcanzar el estado del arte en su clase según OpenBMB, pero no se aportan cifras concretas de MMLU, HumanEval, GSM8K u otras métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 2.5B en FP16 requiere aproximadamente 5 GB de VRAM. Con cuantización GGUF Q4_K_M, el tamaño del archivo suele rondar los 1.5-2 GB, por lo que bastarían 2-3 GB de VRAM.
- GPU recomendadas: para FP16, una GPU con 8 GB de VRAM (RTX 3060, RTX 4060) es suficiente. Para cuantización Q4, una GPU de 4 GB (GTX 1650, RTX 3050) puede ser suficiente, aunque el rendimiento puede ser limitado.
- Si cabe en consumer GPU: sí, en GPUs de gama media e incluso en algunas de gama baja con cuantización.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (con llama.cpp), y cualquier herramienta compatible con GGUF. No es compatible con vLLM ni TGI en su formato GGUF.
- Latencia y throughput: no disponible sin pruebas específicas. En un CPU moderno con cuantización Q4, se pueden esperar velocidades de decodificación de 10-20 tokens/s, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables en la información proporcionada. Los modelos de la misma categoría incluyen `MiniCPM5-2B-Base` (original), `Abiray/MiniCPM5-2B-heretic-abliterated-GGUF` (variante similar) y otros modelos de 2B como Gemma 2B o Qwen2.5-1.5B, pero no se pueden comparar sin resultados publicados.

## Limitaciones y advertencias

- Al ser una versión "abliterated", el modelo carece de filtros de seguridad y puede generar contenido dañino, ilegal o inapropiado. Debe usarse con responsabilidad y en entornos controlados.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución. No se recomienda su uso en producción sin aclarar la licencia.
- Al ser un modelo de 2B de parámetros, su capacidad de razonamiento y conocimiento es limitada en comparación con modelos más grandes, lo que incrementa el riesgo de alucinaciones y respuestas incorrectas.
- La longitud de contexto no está documentada, por lo que no se puede garantizar un rendimiento adecuado en conversaciones largas o documentos extensos.
- El proceso de "abliteration" puede degradar la calidad general del modelo, ya que elimina capas entrenadas originalmente.
- No se dispone de información sobre los idiomas soportados, por lo que su uso en español u otros idiomas distintos del inglés no está garantizado.

## Enlaces

- https://huggingface.co/mondk/MiniCPM5-2B-Abliterated-Uncensored-GGUF
- https://huggingface.co/openbmb/MiniCPM5-2B-Base (modelo base original)
- https://huggingface.co/Abiray/MiniCPM5-2B-heretic-abliterated-GGUF (variante similar)
