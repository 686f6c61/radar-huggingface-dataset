# foxAIengineer/Qwen3-Coder-Next-80b-colibri-i4-gs64

## Resumen

Qwen3-Coder-Next-80b-colibri-i4-gs64 es una conversión del modelo Qwen3-Coder-Next-80b en formato FP8 (publicado por el equipo Qwen) al formato de contenedor del motor de inferencia colibrì, una implementación que transmite los expertos enrutados desde disco en lugar de mantenerlos en memoria. La conversión, realizada por el usuario foxAIengineer, aplica cuantización int4 con una escala f32 por cada 64 entradas a los pesos de los expertos enrutados, mientras que el resto de componentes (atención, DeltaNet, experto compartido, router, embeddings y lm_head) se almacenan en f16.

El modelo base es un transformer híbrido de tipo `qwen3_next` con 48 capas (36 de Gated DeltaNet y 12 de atención con compuertas), 512 expertos enrutados con top-10 y un experto compartido, orientado específicamente a tareas de código. La conversión mantiene la licencia Apache-2.0 del modelo original y ocupa 48,2 GB en el repositorio de Hugging Face.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas conversiones públicas de un modelo MoE de gran tamaño a un formato optimizado para hardware con memoria limitada; por otro, advierte de que la calidad frente al modelo FP8 original no ha sido medida y de que debe esperarse una pérdida por cuantización int4. Es, por tanto, un artefacto experimental y no un modelo listo para producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `qwen3_next`: 48 capas (36 Gated DeltaNet + 12 atención con compuertas), MoE con 512 expertos enrutados, top-10, experto compartido |
| Parametros totales | 80b (según nomenclatura del modelo base; recuento exacto no disponible) |
| Parametros activos | no disponible (top-10 de 512 expertos más experto compartido; cifra exacta no publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (4 bits) con escala f32 por cada 64 entradas en expertos enrutados; f16 en atención, DeltaNet, experto compartido, router, embeddings, norm y lm_head |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato de contenedor colibrì (safetensors: `model-globals.safetensors` más ficheros de expertos); no es GGUF ni safetensors estándar de transformers |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina dos mecanismos de secuencia: 36 capas de Gated DeltaNet (una variante de atención lineal con estado recurrente) y 12 capas de atención con compuertas. Sobre esta columna vertebral se dispone una capa MoE con 512 expertos enrutados, selección top-10 y un experto compartido siempre activo. El modelo está especializado en código, como indica el sufijo Coder de su nombre. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card de esta conversión no los detalla y no se ha proporcionado la del modelo original.

La innovación técnica de esta ficha no reside en el entrenamiento, sino en el proceso de conversión. Los expertos enrutados en FP8 e4m3 se desquantizan usando sus escalas de bloque de 128x128 (`weight_scale_inv`) y se recuantizan a int4 con una escala f32 por cada 64 entradas (`--ebits 4 --gs 64`). Las proyecciones fusionadas de DeltaNet (`in_proj_qkvz` e `in_proj_ba`) se dividen en `in_proj_qkv` + `in_proj_z` e `in_proj_b` + `in_proj_a`, tal como espera el motor. El conversor utilizado es `tools/convert_qwen36.py` del repositorio colibrì, al que se añadió soporte para tensores `*.weight_scale_inv` porque el conversor original los rechazaba. La conversión se completó sin errores: 148.380 tensores de capa colocados y 48 capas escritas.

## Capacidades

- Generación de texto y código: el modelo base está especializado en tareas de programación (sufijo Coder), por lo que se espera un rendimiento destacado en generación y completado de código en múltiples lenguajes.
- Razonamiento y matemáticas: capacidades heredadas del modelo base Qwen3-Coder-Next; no verificadas en esta conversión.
- Tool calling y function calling: no confirmado en la información disponible para esta conversión; depende de las capacidades del modelo base.
- Agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible; la model card no enumera idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Estado de verificación: únicamente se ha comprobado una respuesta coherente y correcta a la pregunta "What is the capital of France?" a través del motor `qwen36`. No hay evaluación sistemática de ninguna capacidad.

## Casos de uso

- Experimentación con MoE de gran tamaño en hardware limitado: el motor colibrì transmite los expertos enrutados desde disco, lo que permite ejecutar un modelo de 80b con requisitos de memoria muy inferiores a los de mantener todos los pesos residentes. Adecuado para laboratorios que quieran estudiar el comportamiento de un MoE de 512 expertos sin un clúster de GPUs de gama alta.
- Investigación sobre cuantización int4 en MoE: al ser una conversión con escalas por bloque de 64 entradas, sirve como banco de pruebas para medir la degradación de calidad frente al FP8 original, siempre que el investigador realice la evaluación que el autor no ha hecho.
- Prototipado de asistentes de código en local: para desarrolladores que quieran probar un modelo Coder de gran tamaño en una estación de trabajo con almacenamiento NVMe rápido, aceptando la latencia adicional de la carga de expertos desde disco.
- Evaluación comparativa de motores de inferencia: útil para comparar el rendimiento de colibrì frente a vLLM, llama.cpp o TGI con un modelo equivalente, midiendo throughput y latencia en escenarios de decodificación autoregresiva.
- Docencia y formación: permite ilustrar en un entorno práctico cómo funciona un transformer híbrido con DeltaNet y atención, y cómo se cuantizan los expertos de un MoE.
- Reproducción de conversiones: la model card documenta el comando exacto y el conversor utilizado, por lo que sirve de referencia para replicar el proceso con otros modelos Qwen3 o con otros parámetros de cuantización (`--ebits`, `--gs`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "no ha sido benchmarkeado" y que la calidad frente al modelo FP8 original no está medida. La única verificación es una respuesta correcta y coherente a una pregunta trivial sobre la capital de Francia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. El repositorio ocupa 48,2 GB en disco; dado que colibrì transmite los expertos enrutados desde disco, la memoria residente necesaria es considerablemente menor que el tamaño total, pero la cifra exacta no se publica.
- GPU recomendadas: no disponible. El motor colibrì está diseñado para aprovechar el streaming desde disco, por lo que el requisito principal es almacenamiento rápido (NVMe) más una GPU con memoria suficiente para los componentes no expertos en f16.
- ¿Cabe en GPU de consumo? No confirmado. La viabilidad depende del tamaño de los componentes residentes (atención, DeltaNet, experto compartido, router, embeddings y lm_head), que no se detalla.
- Opciones de despliegue: exclusivamente el motor colibrì (`./qwen36 16 4 ref_qwen36.json` o `coli chat --model`). No es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual, al no ser GGUF ni safetensors estándar.
- Latencia y throughput: no disponibles. La carga de expertos desde disco introduce una latencia dependiente del almacenamiento que no se ha caracterizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-Coder-Next-80b-colibri-i4-gs64 (este) | 80b (MoE, top-10 de 512) | no disponible | Apache-2.0 | Contenedor colibrì | Int4 en expertos, f16 en resto; sin benchmarks; requiere motor colibrì |
| Qwen/Qwen3-Coder-Next-80b-FP8 (base) | 80b (MoE, top-10 de 512) | no disponible | Apache-2.0 | safetensors FP8 | Modelo original del que deriva esta conversión; calidad de referencia |
| Qwen3-Coder-Next (versión estándar, si existe) | no disponible | no disponible | no disponible | no disponible | No se dispone de información verificada en la búsqueda |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Pérdida por cuantización: los expertos enrutados se han recuantizado de FP8 a int4 con escalas por bloque de 64 entradas. El autor advierte explícitamente de que debe esperarse pérdida de calidad y de que esta no se ha medido.
- Ausencia de evaluación: no hay benchmarks, ni evaluación de calidad, ni comparación con el modelo FP8 original. La única prueba es una pregunta trivial.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base, que no se detallan.
- Riesgo de alucinación: no evaluado. Al ser un modelo de código y razonamiento, el riesgo existe y no ha sido caracterizado en esta conversión.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se indican en la model card.
- Restricciones de licencia: Apache-2.0, igual que el modelo base, lo que permite uso comercial. No obstante, el autor no ofrece garantías y atribuye todo el mérito al equipo Qwen.
- Dependencia de un motor específico: solo funciona con colibrì; no es portable a otros runtimes sin una nueva conversión.
- Madurez: repositorio con 33 descargas y 0 likes en el momento de la consulta; creado y actualizado en noviembre de 2026. Es un artefacto experimental, no un modelo validado para producción.
- Requisito de almacenamiento: 48,2 GB en disco y necesidad de almacenamiento rápido para el streaming de expertos; el rendimiento depende críticamente del subsistema de E/S.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/foxAIengineer/Qwen3-Coder-Next-80b-colibri-i4-gs64
- Modelo base (FP8): https://huggingface.co/Qwen/Qwen3-Coder-Next-FP8
- Motor colibrì (repositorio): https://github.com/JustVugg/colibri
- Conversor utilizado: `tools/convert_qwen36.py` dentro del repositorio de colibrì
