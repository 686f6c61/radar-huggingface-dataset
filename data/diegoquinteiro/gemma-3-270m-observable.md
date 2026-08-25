# diegoquinteiro/Gemma-3-270M-Observable

## Resumen

Gemma 3 270M Observable es un export en formato ONNX del modelo base `google/gemma-3-270m`, creado por diegoquinteiro con fines educativos y de interpretabilidad. El artefacto está diseñado para ejecutarse en el navegador mediante transformers.js y expone, además de los logits del siguiente token, las matrices de atención completas de las 18 capas transformer. Su propósito principal es servir como laboratorio interactivo en un curso de ingeniería asistida por IA, permitiendo inspeccionar visualmente cómo se distribuye la atención interna del modelo.

El modelo base, Gemma 3 270M, es el más pequeño de la familia Gemma 3 de Google, con 270 millones de parámetros y una ventana de contexto de 32 000 tokens. Está optimizado para ejecución en dispositivos con recursos limitados, como portátiles o incluso smartphones. Este export concreto no modifica los pesos originales, sino que los convierte a ONNX con una cuantización mixta (float16 para los pesos transformer e int8 para la tabla de embeddings), priorizando la observabilidad sobre el rendimiento de inferencia.

La relevancia de este artefacto radica en que facilita el estudio de los mecanismos de atención en modelos de lenguaje sin necesidad de infraestructura pesada, y proporciona una vía para que estudiantes e investigadores visualicen directamente las matrices de atención generadas por el modelo. No está pensado para uso en producción ni para evaluación de rendimiento, sino como herramienta docente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 18 capas, 4 cabezas de atencion por capa |
| Parametros totales | 270 millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 000 tokens (modelo base, segun LM Studio) |
| Tipos de cuantizacion | float16 para pesos transformer, int8 por filas para embeddings atados |
| Idiomas soportados | No disponible en la informacion del artefacto |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | ONNX (archivo `model_observable_f16_v2.onnx`) |

## Arquitectura y entrenamiento

El artefacto es una conversión a ONNX del checkpoint `google/gemma-3-270m`, utilizando el espejo público `unsloth/gemma-3-270m`. La arquitectura subyacente es un transformer decoder-only con 18 capas y 4 cabezas de atención por capa, tal como se deduce de la forma de los tensores de salida (`[batch, 4, query sequence, key sequence]`). El modelo original fue entrenado por Google con un enfoque de preentrenamiento autorregresivo estándar, aunque no se proporcionan detalles específicos sobre el dataset o el número de tokens de entrenamiento en la información disponible.

El export no introduce cambios en los pesos, solo los reempaqueta en formato ONNX con una cuantización mixta: los pesos de las capas transformer se almacenan en float16, mientras que la tabla de embeddings atada (compartida entre entrada y salida) se cuantiza a int8 por filas. Las entradas y salidas públicas del grafo permanecen en float32 o int64. El grafo devuelve dos tipos de salidas: `next_token_logits` (logits del siguiente token) y `attention_01` a `attention_18` (matrices de atención de cada capa). No incluye una "tuned lens" ni predicciones intermedias del vocabulario.

## Capacidades

- Generación de texto autorregresiva: devuelve los logits del siguiente token, permitiendo generar texto mediante muestreo o decodificación greedy.
- Inspección de atención: expone las matrices de atención completas de las 18 capas, con forma `[batch, 4, query sequence, key sequence]`, lo que permite analizar qué tokens atienden a qué otros tokens en cada cabeza.
- Ejecución en navegador: al ser un export ONNX compatible con transformers.js, puede ejecutarse directamente en el navegador sin servidor dedicado.
- No es un modelo de instrucciones: al ser un modelo base, no está entrenado para seguir instrucciones ni para diálogo.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso explícito.
- No tiene capacidades multimodales (solo texto).
- El multilingüismo no está documentado en la información del artefacto, aunque el modelo base Gemma 3 es multilingüe.

## Casos de uso

- Enseñanza de mecanismos de atención: los estudiantes pueden visualizar cómo se distribuye la atención entre tokens en cada capa y cabeza, comprendiendo conceptos como atención causal, patrones sintácticos o dependencias de largo alcance.
- Laboratorio interactivo en cursos de IA: el artefacto está diseñado específicamente para un curso de "Engenharia Assistida por IA", donde los alumnos pueden experimentar con el modelo en el navegador y observar sus internals.
- Depuración de modelos pequeños: al exponer las matrices de atención, los desarrolladores pueden identificar comportamientos anómalos o sesgos en la atención para modelos de tamaño reducido.
- Prototipado de herramientas de interpretabilidad: sirve como base para construir visualizaciones personalizadas de atención, sin necesidad de implementar la infraestructura de extracción de pesos.
- Demostraciones interactivas: permite crear demos en las que el usuario introduce un prompt y ve en tiempo real cómo el modelo procesa la información, ideal para divulgación.
- Investigación educativa sobre interpretabilidad: los investigadores pueden utilizar las matrices de atención exportadas para estudiar la relación entre atención y predicciones en modelos pequeños, aunque con las limitaciones de precisión indicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no está diseñado para evaluación de rendimiento, y la model card indica explícitamente que no debe usarse para evaluación ni inferencia en producción. El error máximo absoluto de atención frente al checkpoint original es de 0.0602, y el error solo de exportación tras la cuantización es de 0.00163, pero no hay métricas de calidad de generación (MMLU, HumanEval, etc.) para este export concreto.

## Requisitos de hardware

- Al ser un modelo de 270M de parámetros, puede ejecutarse en CPU sin necesidad de GPU. El Space de HuggingFace `umint/gemma-3-270m` demuestra que es viable en CPU.
- El export ONNX está pensado para navegador, por lo que puede ejecutarse en portátiles, tablets o incluso smartphones con un navegador moderno.
- La VRAM estimada es mínima: con cuantización float16, los pesos ocupan aproximadamente 540 MB (270M × 2 bytes), más la tabla de embeddings int8. En total, el repo pesa 0.8 GB, pero en memoria cabría en menos de 1 GB.
- No se requieren GPUs específicas; cualquier GPU con al menos 1 GB de VRAM podría acelerar la inferencia, pero no es necesaria.
- Opciones de despliegue: transformers.js en navegador, o cualquier runtime ONNX (ONNX Runtime, etc.) en servidor.
- Latencia y throughput: no se proporcionan datos específicos, pero al ser un modelo pequeño, la generación de texto es rápida incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Observabilidad |
|---|---|---|---|---|---|
| google/gemma-3-270m | 270M | 32k | Gemma | safetensors, GGUF, etc. | No expone atención |
| diegoquinteiro/Gemma-3-270M-Observable | 270M | 32k | Gemma | ONNX | Expone matrices de atención |
| TinyLlama-1.1B | 1.1B | 2k | Apache 2.0 | safetensors, GGUF | No expone atención |
| Qwen2-0.5B | 0.5B | 32k | Apache 2.0 | safetensors, GGUF | No expone atención |

La comparativa se basa en datos públicos de los modelos base. El artefacto observable se distingue por su capacidad de inspección de atención, algo poco común en los formatos estándar.

## Limitaciones y advertencias

- Es un modelo base, no un modelo de instrucciones: no responde a comandos ni mantiene diálogos coherentes sin fine-tuning.
- El artefacto no está diseñado para producción: la model card indica que es para enseñanza e inspección, no para evaluación ni inferencia en producción.
- Los pesos de atención no implican causalidad: la atención describe valores calculados internamente, pero no demuestra que un token fuente haya causado una predicción.
- Error de cuantización: el error máximo absoluto de atención frente al checkpoint original es de 0.0602, y el error de exportación tras cuantización es de 0.00163. Esto puede afectar a análisis precisos.
- No incluye tuned lens ni predicciones intermedias: solo expone los logits finales y las matrices de atención.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma de Google, que pueden incluir restricciones según el tamaño de la empresa o el caso de uso.
- No se documentan sesgos específicos, pero al ser un modelo base entrenado con datos web, puede reflejar sesgos presentes en esos datos.

## Enlaces

- Artefacto en HuggingFace: https://huggingface.co/diegoquinteiro/Gemma-3-270M-Observable
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-3-270m
- Blog de Google sobre Gemma 3 270M: https://developers.googleblog.com/en/introducing-gemma-3-270m/
- Página de LM Studio del modelo: https://lmstudio.ai/models/google/gemma-3-270m
- Página de DeepMind sobre Gemma 3: https://deepmind.google/models/gemma/gemma-3/
- Space de demostración en CPU: https://huggingface.co/spaces/umint/gemma-3-270m
