# hahayhe/test-time-dreaming-graph-co-evolution-4B

## Resumen

Test-Time Dreaming Graph Co-Evolution 4B es un ajuste fino supervisado (SFT) del modelo Qwen3.5-4B desarrollado por el usuario hahayhe. Se trata de un checkpoint multimodal de tipo image-text-to-text orientado a conversacion, entrenado sobre 100.116 ejemplos a nivel de llamada durante 3 epocas y 1.176 pasos de optimizador. El modelo hereda la arquitectura y el procesador de imagenes y video de Qwen3.5-4B y conserva los pesos completos en BF16, sin necesidad de fusionar adaptadores.

El modelo se publica como artefacto de investigacion asociado a un trabajo academico (la model card lo describe como el checkpoint final del "trajectory SFT run" del segundo paper del autor). Su relevancia es limitada fuera de ese contexto: no hay evaluacion publicada de calidad, el repositorio no registra descargas ni interacciones y la torre de vision quedo congelada durante el entrenamiento, por lo que las capacidades multimodales no se han validado.

Con 4.539.265.536 parametros totales y licencia Apache 2.0, es un modelo manejable en hardware de consumo y potencialmente util como base para experimentacion con ajuste fino multimodal y razonamiento en varios pasos, aunque su adopcion en produccion requeriria una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda Qwen3.5-4B; detalles internos no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | entrenado con limite de 32.768 tokens; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16 completo) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal con torre de vision y proyector multimodal. En este ajuste fino se congelaron tanto la torre de vision como el proyector, de modo que el entrenamiento afecto unicamente a los componentes de lenguaje. El entrenamiento fue un SFT sobre 100.116 ejemplos a nivel de llamada, con 3 epocas, 1.176 pasos de optimizador, tamano de lote efectivo de 256 y un limite de 32.768 tokens por muestra. La funcion de perdida se aplico exclusivamente a la respuesta final del asistente, incluyendo el razonamiento y la respuesta.

No se especifican en la informacion disponible la composicion del dataset, el numero total de tokens procesados, ni si hubo etapas de RLHF o DPO posteriores. Tampoco se detalla la innovacion tecnica aludida en el nombre ("test-time dreaming" y "graph co-evolution"), que parece corresponder al marco de investigacion del paper y no a un cambio arquitectonico documentado en la model card.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.5-4B.
- Razonamiento explicito: la perdida incluye la traza de razonamiento, por lo que el modelo esta entrenado para producir razonamiento antes de la respuesta final.
- Entrada de imagen y texto (pipeline image-text-to-text), aunque la calidad de generacion multimodal no fue evaluada segun el autor.
- Procesamiento de video: se conservan los ajustes del procesador de imagenes y video del modelo base.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente; el nombre del proyecto sugiere enfasis en trayectorias, pero no hay evaluacion publicada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Experimentacion academica en ajuste fino multimodal: sirve como checkpoint de referencia para reproducir o comparar el entrenamiento SFT descrito en el paper del autor, con pesos completos y script de inferencia incluido.
- Prototipado de asistentes conversacionales con razonamiento: el modelo esta entrenado para emitir trazas de razonamiento antes de la respuesta, lo que facilita la inspeccion del proceso en tareas de logica o matematicas basicas.
- Base para ajuste fino adicional: al publicarse en BF16 completo y con licencia Apache 2.0, puede reentrenarse o adaptarse con LoRA para dominios especificos sin restricciones de uso comercial.
- Investigacion sobre trayectorias de agente: el enfasis del entrenamiento en ejemplos a nivel de llamada lo hace adecuado para estudiar como un modelo de 4B sigue secuencias de acciones en entornos simulados.
- Evaluacion comparativa de SFT con torre de vision congelada: util para medir el impacto de congelar el codificador visual frente a entrenarlo, en tareas de imagen-texto.
- Despliegue en hardware de consumo para demos: con 4,5 mil millones de parametros, cabe en GPUs de gama alta de consumo en cuantizacion de 8 o 4 bits, lo que permite montar demos locales del pipeline image-text-to-text.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 9 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 16 GB o mas para contexto largo.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 3 GB.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para contextos moderados.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en BF16 con contexto reducido; en RTX 4080, 4070 Ti Super o inferiores es preferible cuantizar a 8 o 4 bits.
- Opciones de despliegue: el repositorio incluye `inference.py` y `requirements-inference.txt` para PyTorch con CUDA; al ser un modelo de la familia transformers con safetensors, es compatible con vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF, aunque estas ultimas no estan verificadas en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| Test-Time Dreaming Graph Co-Evolution 4B | 4.539 M | 32.768 tokens (entrenamiento) | imagen-texto | Apache 2.0 | Publicado, sin evaluacion |
| Qwen3.5-4B (base) | ~4B | no disponible | imagen-texto | Apache 2.0 | Modelo upstream |
| Alternativas de ~4B multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion fiable es con su modelo base Qwen3.5-4B, del que hereda arquitectura y pesos iniciales. No se dispone de datos de rendimiento de ninguno de los dos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni descargas, ni validacion de calidad por parte de la comunidad; el modelo no debe usarse en produccion sin una evaluacion propia.
- Capacidad multimodal no validada: la torre de vision y el proyector se congelaron y el autor indica explicitamente que no se evaluo la calidad de generacion multimodal, por lo que las salidas de imagen-texto pueden ser deficientes.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, agravado por la falta de evaluacion y por un entrenamiento centrado en trayectorias de razonamiento que puede producir cadenas de pensamiento plausibles pero incorrectas.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de genero, etnicos, culturales o linguisticos.
- Idiomas no declarados: la model card no especifica cobertura linguistica; el comportamiento fuera del ingles es incierto.
- Contexto limitado en el entrenamiento: el limite de 32.768 tokens es una cota del entrenamiento, no necesariamente del modelo base; el rendimiento mas alla de esa longitud no esta garantizado.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario asume la responsabilidad de verificar el cumplimiento de las condiciones del modelo base Qwen3.5-4B.
- Madurez: repositorio creado y actualizado el mismo dia (18 de noviembre de 2026), sin historial de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hahayhe/test-time-dreaming-graph-co-evolution-4B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog o repositorio del proyecto: no disponible en la informacion proporcionada.
