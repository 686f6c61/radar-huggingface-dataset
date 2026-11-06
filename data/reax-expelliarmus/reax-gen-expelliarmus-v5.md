# reax-expelliarmus/reax-gen-expelliarmus-v5

## Resumen

reax-gen-expelliarmus-v5 es un modelo de lenguaje publicado en Hugging Face por el usuario reax-expelliarmus. El repositorio contiene pesos en formato safetensors con un total de 26.085.330.160 parámetros (aproximadamente 26 mil millones), lo que lo sitúa en la categoría de modelos de gran tamaño, por encima de la mayoría de modelos que caben en GPU de consumo sin cuantización agresiva. El tag `qwen3_5` sugiere que la arquitectura está basada en la familia Qwen 3.5, aunque no se detalla en la información disponible.

La model card publicada es prácticamente vacía: solo contiene la declaración de licencia Apache 2.0, sin descripción del modelo, datos de entrenamiento, benchmarks ni instrucciones de uso. El repositorio tiene 15 descargas y 0 likes en el momento de la consulta, lo que indica un modelo de nicho o experimental, sin tracción comunitaria verificable. El tamaño del repositorio (52,2 GB) es coherente con pesos en precisión bf16/fp16 para 26B de parámetros.

Por tanto, esta ficha se construye a partir de los metadatos técnicos disponibles (parámetros, formato, licencia, tag de arquitectura) y de las características generales inferibles de la familia Qwen 3.5, marcando explícitamente como "no disponible" todo aquello que el autor no ha documentado. Es relevante ahora como ejemplo de modelo derivado o fine-tune publicado sin documentación, un caso frecuente en el ecosistema open source que conviene evaluar con cautela antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5`; detalles no disponibles) |
| Parámetros totales | 26.085.330.160 (~26B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag `qwen3_5` del repositorio apunta a que el modelo se basa en la arquitectura de la familia Qwen 3.5, un transformer decoder-only con atención por grupos de consultas (GQA) y, en las variantes más recientes de la familia, mecanismos de atención lineal o híbrida. Sin embargo, la model card no confirma ni desmiente ninguno de estos detalles, ni especifica si se trata de un modelo base, un fine-tune o una fusión de pesos.

No hay información publicada sobre el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o instrucción supervisada, ni sobre innovaciones técnicas específicas (decodificación especulativa, modos de razonamiento, etc.). El repositorio solo contiene la declaración de licencia y los pesos en safetensors, por lo que cualquier afirmación sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Generación de texto: capacidad esperable por tratarse de un modelo de 26B parámetros, aunque no documentada por el autor.
- Razonamiento y matemáticas: no disponible; el autor no publica evaluaciones ni descripciones.
- Generación de código: no disponible; no se confirma soporte específico.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se listan idiomas en la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Experimentación e investigación sobre modelos de ~26B: el modelo puede servir como objeto de estudio para comparar arquitecturas derivadas de Qwen 3.5, siempre que se validen sus capacidades empíricamente antes de sacar conclusiones.
- Fine-tuning específico de dominio: al publicarse con licencia Apache 2.0 y pesos safetensors, es apto para reentrenamiento o ajuste con LoRA en dominios concretos, aunque sin garantías de calidad base documentadas.
- Evaluación comparativa interna: útil como punto de referencia en pruebas A/B frente a modelos de tamaño similar, dado que su licencia permisiva facilita el despliegamiento en entornos controlados.
- Prototipado de pipelines de generación de texto: se puede integrar en entornos de desarrollo con vLLM o TGI para validar latencia y throughput en hardware propio antes de comprometerse con un modelo comercial.
- Destilación o compresión: su tamaño de 26B lo convierte en candidato para destilar conocimiento hacia modelos más pequeños, siempre que se verifique primero su calidad mediante benchmarks propios.
- Uso educativo: como ejemplo práctico de repositorio publicado sin documentación, útil para formar a desarrolladores en la evaluación crítica de modelos open source antes de adoptarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 60-70 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: alrededor de 26 GB, más overhead; viable en GPUs de 40-48 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 13-15 GB, más overhead; podría caber en GPUs de consumo de 24 GB (RTX 3090, RTX 4090) con cuantización GGUF/AWQ.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o múltiples RTX 4090/A6000 para bf16; una sola RTX 4090 de 24 GB solo con cuantización de 4 bits.
- Despliegue: vLLM, TGI, llama.cpp u Ollama si se generan cuantizaciones GGUF; no se documentan recetas oficiales.
- Latencia y throughput: no disponibles; dependen del hardware y del backend, sin datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| reax-gen-expelliarmus-v5 | ~26B | no disponible | Apache 2.0 | Hugging Face (15 descargas) |
| Qwen 2.5 32B | ~32B | 128K (según versión) | Apache 2.0 (mayoría de variantes) | Hugging Face, ampliamente documentado |
| Gemma 2 27B | ~27B | 8K | Gemma License | Hugging Face, documentado |
| Mistral Small 24B | ~24B | 32K-128K según versión | Apache 2.0 | Hugging Face, documentado |

La comparativa se limita a parámetros, contexto y licencia porque no hay benchmarks publicados del modelo evaluado. Frente a Qwen 2.5 32B, Gemma 2 27B o Mistral Small 24B, el modelo de reax carece de documentación de contexto, idiomas y rendimiento, lo que dificulta una comparación rigurosa más allá del tamaño.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, sesgos, idiomas ni evaluación, lo que impide auditar el modelo.
- Riesgo de alucinación: desconocido y no cuantificado por el autor; debe medirse empíricamente antes de usar en producción.
- Sesgos conocidos: no documentados; al no conocerse la composición del dataset, no se pueden anticipar sesgos de género, idioma o dominio.
- Limitaciones de contexto e idioma: no disponibles; no se especifica la ventana de contexto ni los idiomas soportados.
- Licencia Apache 2.0: permisiva para uso comercial, pero el usuario asume toda la responsabilidad sobre la calidad y legalidad de los datos de entrenamiento originales, que no se detallan.
- Tracción mínima: 15 descargas y 0 likes indican ausencia de validación comunitaria; no hay issues, discusiones ni informes de terceros.
- Fecha de creación futura (2026-10-28): metadato atípico que conviene verificar; puede indicar un error de publicación o un repositorio de prueba.
- Sin garantías de soporte: el autor no ofrece documentación, ejemplos ni mantenimiento visible.

## Enlaces

- Hugging Face: https://huggingface.co/reax-expelliarmus/reax-gen-expelliarmus-v5
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
