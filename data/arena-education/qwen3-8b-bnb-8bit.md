# arena-education/Qwen3-8B-bnb-8bit

## Resumen

Qwen3-8B-bnb-8bit es una cuantización de 8 bits del modelo Qwen3-8B de Alibaba Qwen, publicada por el colectivo arena-education para los ejercicios de su curso ARENA. No se trata de un modelo nuevo ni de un ajuste fino: el autor aplica `BitsAndBytesConfig(load_in_8bit=True, llm_int8_threshold=6.0)` a las capas `nn.Linear` de los bloques del transformer y guarda el resultado, de modo que la cuantización no se recalcula en cada carga. Embeddings, unembedding y normas permanecen en bfloat16.

El modelo base es un transformer denso de 8.192.136.192 parámetros (aproximadamente 8,2 mil millones) con licencia Apache 2.0, orientado a generación de texto y conversación. La contribución de esta variante es puramente operativa: reduce el peso de los pesos a 9,4 GB, lo que permite ejecutar el modelo completo en GPUs de 16 GB de VRAM, un objetivo declarado explícitamente en la model card.

Es relevante para desarrolladores que quieran desplegar Qwen3-8B en hardware de gama media sin renunciar a la fidelidad numérica del modelo original: el autor afirma que los logits son idénticos a cargar `Qwen/Qwen3-8B` con la misma configuración de cuantización (verificado con transformers 5.22.1 y bitsandbytes 0.50.2). No obstante, el repositorio no documenta idiomas soportados ni resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-8B) |
| Parametros totales | 8.192.136.192 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 en capas `nn.Linear` (bitsandbytes, `llm_int8_threshold=6.0`); embeddings, unembedding y normas en bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,5 GB; 9,4 GB de pesos) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-8B original: un transformer denso de unos 8,2 mil millones de parámetros. Esta variante no introduce cambios estructurales ni de entrenamiento; únicamente cuantiza a int8 los pesos de las capas lineales dentro de los bloques del transformer, manteniendo las activaciones en bfloat16. Como consecuencia, los hooks de forward y `output_hidden_states` funcionan igual que en el modelo original, y es posible adjuntar adaptadores PEFT LoRA.

No se ha realizado ningún ajuste fino ni modificación del tokenizador, que se copia sin cambios desde el modelo base (revisión `b968826d9c46dd6066d109eabc6255188de91218`). El autor no documenta en la model card el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO; esa información corresponde a la ficha de `Qwen/Qwen3-8B` y no se incluye aquí.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3-8B.
- Razonamiento y matemáticas: capacidades propias de la familia Qwen3, no verificadas de forma independiente en esta ficha.
- Generación de código: no documentada explícitamente en la model card de esta variante.
- Tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: no documentadas; el campo de idiomas del repo está vacío.
- Compatibilidad con adaptadores PEFT LoRA, según indica el autor.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repo).
- No se documentan modos especiales (thinking, visión, audio) en esta variante.

## Casos de uso

- Ejecución de Qwen3-8B en GPUs de 16 GB: el caso de uso declarado por el autor. Al ocupar 9,4 GB de pesos, el modelo completo cabe en tarjetas como RTX 4080, RTX 4060 Ti de 16 GB o A4000, dejando margen para el contexto y las activaciones en bfloat16.
- Ejercicios docentes y prácticas de ARENA: el repositorio está pensado para que los alumnos carguen un modelo de 8B sin necesidad de infraestructura de centro de datos, evitando además el coste de cuantizar en cada carga.
- Prototipado rápido de aplicaciones conversacionales: la carga directa con `transformers` y `device_map="cuda"` permite tener un chatbot funcional en pocas líneas de código, sin pipeline de cuantización propio.
- Ajuste fino con LoRA sobre hardware modesto: al mantener las activaciones en bfloat16 y permitir adaptadores PEFT, sirve para experimentar con fine-tuning ligero sobre una base de 8B en una sola GPU.
- Evaluación comparativa de efectos de cuantización: útil para medir la degradación (o ausencia de ella) de int8 frente al modelo original en tareas concretas, dado que el autor afirma equivalencia de logits.
- Despliegue en entornos de investigación con requisitos de reproducibilidad: al fijar la revisión del modelo base y la configuración exacta de bitsandbytes, facilita reproducir experimentos sin depender de la versión de la librería en el momento de la carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente afirma que los logits coinciden con los de `Qwen/Qwen3-8B` cargado con la misma configuración de cuantización, verificación realizada con transformers 5.22.1 y bitsandbytes 0.50.2, pero no aporta métricas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada: 9,4 GB solo para pesos; con activaciones en bfloat16 y contexto, se recomienda un mínimo de 12-16 GB. El autor indica explícitamente que el modelo completo debe residir en la GPU.
- GPU recomendadas: cualquier GPU CUDA con al menos 16 GB de VRAM (RTX 4080, RTX 4060 Ti 16 GB, RTX A4000, L4). Para mayor margen de contexto, A100 o H100.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más. No cabe en GPUs de 8 GB ni de 12 GB con contexto amplio.
- Requisito de software: CUDA y `bitsandbytes`; no debe pasarse un `quantization_config` adicional, ya que se usa el almacenado en el repositorio.
- Opciones de despliegue: carga nativa con `transformers` (`AutoModelForCausalLM.from_pretrained` con `dtype=torch.bfloat16` y `device_map="cuda"`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el formato es safetensors con cuantización bitsandbytes, no GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arena-education/Qwen3-8B-bnb-8bit | 8,19 B | No disponible | int8 (bitsandbytes) | Apache 2.0 | Hugging Face, transformers |
| Qwen/Qwen3-8B (base) | 8,19 B | No disponible | bfloat16 nativo | Apache 2.0 | Hugging Face, transformers |
| Otras variantes cuantizadas de Qwen3-8B (GGUF, AWQ, GPTQ) | 8,19 B | No disponible | GGUF, AWQ, GPTQ | Apache 2.0 | Hugging Face, llama.cpp / vLLM |

La comparación relevante es frente al modelo base: misma arquitectura y mismos parámetros, con una reducción de peso de bfloat16 (unos 16 GB) a int8 (9,4 GB). Frente a cuantizaciones GGUF o AWQ, esta variante está atada al ecosistema transformers + bitsandbytes y no ofrece un formato portable a llama.cpp. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Requiere GPU CUDA y la librería `bitsandbytes`; no funciona en CPU ni en entornos sin esa dependencia.
- El modelo completo debe residir en la GPU: no se contempla offloading parcial en la model card.
- No debe pasarse un `quantization_config` al cargar; hacerlo puede alterar el comportamiento respecto a la configuración guardada.
- La cuantización int8 de capas lineales puede introducir degradaciones sutiles en tareas de precisión, aunque el autor afirma equivalencia de logits con la cuantización equivalente.
- Sesgos conocidos: no documentados en esta variante; hereda los del modelo base Qwen3-8B, no descritos aquí.
- Riesgo de alucinación: no evaluado en esta ficha; aplica el riesgo general de los modelos de lenguaje de 8B.
- Idiomas soportados: no disponibles; el repositorio no declara lista de idiomas.
- Longitud de contexto: no disponible en la información proporcionada.
- Licencia Apache 2.0, permisiva para uso comercial, siempre que se conserve el aviso de licencia y el `NOTICE` que declara las modificaciones.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación comunitaria independiente.
- No se documenta compatibilidad con vLLM, TGI ni llama.cpp, lo que limita su uso en pipelines de alto throughput.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arena-education/Qwen3-8B-bnb-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Documentación de cuantización con bitsandbytes en transformers: https://huggingface.co/docs/transformers/quantization/bitsandbytes
- Curso ARENA: https://www.arena.education/
