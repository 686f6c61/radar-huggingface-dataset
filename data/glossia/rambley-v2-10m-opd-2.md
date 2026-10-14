# glossia/Rambley-V2-10M-OPD-2

## Resumen

Rambley-V2-10M-OPD-2 es un modelo de generación de texto de pequeño tamaño publicado por el usuario glossia en Hugging Face. Se trata de un ajuste fino (fine-tune) del modelo base glossia/Rambley-V2-OPDBase-10m, con 10.272.142 parámetros totales (unos 10,27 millones), lo que lo sitúa en la escala de los modelos "tiny" orientados a experimentación más que a producción. El repositorio ocupa 0,6 GB, un tamaño desproporcionado respecto a los pesos, lo que sugiere que incluye artefactos de entrenamiento además del checkpoint en safetensors.

El modelo se ha entrenado mediante destilación on-policy (On-Policy Distillation, OPD), el método descrito en el artículo "On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes" (Agarwal et al., ICLR 2024), utilizando la librería TRL de Hugging Face. La model card únicamente documenta el procedimiento de entrenamiento, las versiones de framework y un enlace a una ejecución de Weights & Biases; no se especifican arquitectura detallada, longitud de contexto, idiomas, licencia ni datos de evaluación.

Su relevancia es fundamentalmente metodológica y didáctica: sirve como ejemplo reproducible de un pipeline de destilación con TRL sobre un modelo diminuto, y como banco de pruebas para técnicas de ajuste, cuantización o despliegue en hardware muy limitado. No debe considerarse un modelo apto para tareas de producción con requisitos de calidad, dado su tamaño y la ausencia total de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo causal de generación de texto, según la librería `transformers` y la pipeline declarada); número de capas, dimensiones y tipo de atención no disponibles |
| Parámetros totales | 10.272.142 (10,27 M), dato real de los pesos en safetensors |
| Parámetros activos | No aplica: no hay indicios de arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible: no se publican pesos cuantizados ni GGUF en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card declara `licence: license` sin especificar términos) |
| Formato de pesos | safetensors (según etiquetas del repositorio) |
| Autor | glossia |
| Modelo base | glossia/Rambley-V2-OPDBase-10m |
| Método de entrenamiento | Destilación on-policy (OPD) con TRL |
| Tamaño del repositorio | 0,6 GB |
| Fecha de publicación | 14 de octubre de 2026 (según metadatos de Hugging Face) |
| Última actualización | 14 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo de generación de texto causal compatible con `transformers` y que requiere código personalizado (etiqueta `custom_code`). No se publican el número de capas, la dimensión oculta, el número de cabezas de atención, la función de activación ni si emplea componentes como RoPE, GQA o RMSNorm. Tampoco se indica la longitud de contexto máxima soportada ni el vocabulario del tokenizador.

El entrenamiento se realizó por destilación on-policy, técnica en la que un modelo alumno genera sus propias secuencias y se le enseña a corregir los errores cometidos, en lugar de limitarse a imitar trayectorias fijas de un profesor. El artículo de referencia es Agarwal et al., "On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes" (ICLR 2024). La implementación se hizo con TRL 1.15.0, Transformers 5.19.0, PyTorch 2.11.0, Datasets 5.1.0 y Tokenizers 0.23.3. No se especifican el modelo profesor, el volumen de datos de entrenamiento, la composición del dataset ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Generación de texto conversacional: la model card incluye un ejemplo de `pipeline("text-generation")` con formato de mensajes (`role: user`), lo que indica soporte de plantilla de chat o, al menos, de entrada estructurada por roles.
- Generación de texto libre con muestreo: parámetros como `max_new_tokens` y `return_full_text` son utilizables a través de la pipeline estándar de Transformers.
- Compatibilidad con el ecosistema Transformers y TRL: puede cargarse con `device_map="auto"` y ejecutarse en CPU sin configuración especial.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no disponible.
- Razonamiento, matemáticas y código: no se documentan capacidades específicas ni evaluaciones al respecto.

## Casos de uso

- Experimentación con destilación on-policy: el modelo sirve para reproducir y estudiar el pipeline de OPD descrito en el artículo de ICLR 2024, comparando el comportamiento del alumno de 10,27 M de parámetros frente al modelo profesor. Es adecuado porque el coste de entrenamiento e inferencia es mínimo.
- Prototipado de interfaces conversacionales en local: permite levantar un chatbot de prueba en un portátil sin GPU, usando la pipeline de Transformers con `device_map="auto"`, para validar plantillas de prompt y flujos de UI antes de migrar a un modelo mayor.
- Despliegue en dispositivos embebidos y edge: con unos 20,5 MB de pesos en bf16 (estimación sobre 10,27 M de parámetros) cabe en microcontroladores con memoria suficiente, Raspberry Pi o teléfonos, siempre que se convierta el checkpoint a un formato adecuado.
- Generación de texto para pruebas de integración y CI: al ser tan ligero, puede actuar como modelo simulado en tests automáticos de pipelines de inferencia (servidores, colas, APIs), validando la infraestructura sin coste de GPU.
- Docencia y materiales formativos: es un ejemplo práctico para explicar qué es un modelo causal, cómo se cargan pesos en safetensors y cómo se aplica un procedimiento de fine-tuning con TRL.
- Generación de datasets sintéticos de bajo coste: puede emplearse para producir grandes volúmenes de texto de relleno o datos auxiliares en tareas de aumento de datos, donde la coherencia fina no sea crítica.
- Investigación sobre cuantización y eficiencia: sirve como sujeto de prueba para medir el impacto de int8 e int4 en un modelo diminuto, dado que su huella de memoria permite iterar rápidamente sobre muchas configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y solo enlaza a una ejecución de entrenamiento en Weights & Biases con las curvas de pérdida. No se han encontrado cifras de rendimiento verificables en la información proporcionada, por lo que no se presentan tablas comparativas de resultados numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aritmético a partir de 10.272.142 parámetros): aproximadamente 41 MB en fp32, 20,5 MB en bf16/fp16, 10,3 MB en int8 y 5,1 MB en int4. A esto hay que sumar el coste de la caché KV, que depende de la longitud de contexto (no publicada).
- GPU recomendadas: no es necesario GPU. Cualquier GPU con al menos 1 GB de memoria es más que suficiente; una RTX 3060, RTX 4090, A100 o H100 estarían enormemente sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en GPU integradas. También cabe en CPU y en hardware tipo Raspberry Pi.
- Espacio en disco: los pesos ocupan decenas de megabytes, aunque el repositorio completo pesa 0,6 GB, presumiblemente por artefactos de entrenamiento.
- Opciones de despliegue: al estar en safetensors y ser compatible con `transformers`, funciona de forma directa con la pipeline de Hugging Face y con TGI. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, ya que no se publican cuantizaciones oficiales. vLLM es compatible en teoría, pero su uso no aporta ventajas a esta escala. La etiqueta `custom_code` implica que puede ser necesario `trust_remote_code=True` al cargar el modelo con Transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparación se limita a escala, contexto y licencia. Los datos de los modelos alternativos corresponden a sus respectivas model cards públicas y conviene verificarlos antes de usarlos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Rambley-V2-10M-OPD-2 | 10,27 M | No disponible | No disponible | Hugging Face (transformers, safetensors) |
| Pythia-14M | 14 M | 2.048 tokens | Apache-2.0 | Hugging Face, pesos públicos |
| distilgpt2 | 82 M | 1.024 tokens | Apache-2.0 | Hugging Face, integrado en Transformers |
| SmolLM-135M | 135 M | 2.048 tokens | Apache-2.0 | Hugging Face, con GGUF y despliegue en llama.cpp/Ollama |
| Qwen2.5-0.5B | ~494 M | 32.768 tokens | Apache-2.0 | Hugging Face, con cuantizaciones GGUF/AWQ/GPTQ |

Frente a estas alternativas, Rambley-V2-10M-OPD-2 destaca únicamente por su tamaño mínimo y por su procedimiento de entrenamiento (destilación on-policy), pero carece de licencia definida, de contexto declarado, de cuantizaciones publicadas y de cualquier evaluación pública, lo que dificulta una comparación funcional rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica `licence: license` sin detallar términos, por lo que el uso comercial queda en una zona legal indeterminada. No debe utilizarse en producción sin aclarar previamente la licencia con el autor.
- Riesgo elevado de alucinación: con 10,27 M de parámetros, la capacidad de retener conocimiento factual y de mantener coherencia en generaciones largas es muy limitada.
- Idiomas: no se declara ningún idioma soportado; se desconoce si el modelo ha sido entrenado predominantemente en inglés, en español o en otro idioma.
- Longitud de contexto desconocida: al no publicarse, no es posible diseñar aplicaciones basadas en ventanas largas ni estimar con precisión el consumo de caché KV.
- Sin benchmarks: no existen métricas publicadas que permitan estimar su calidad frente a alternativas de tamaño similar.
- Código personalizado: la etiqueta `custom_code` implica que la carga del modelo puede requerir `trust_remote_code=True`, lo que supone ejecutar código del repositorio. Conviene auditar dicho código antes de usarlo.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que existan informes externos de uso o incidencias documentadas.
- Sin cuantizaciones oficiales: no hay GGUF ni otros formatos listos para llama.cpp, Ollama o LM Studio, lo que obliga a convertir los pesos manualmente.
- Fechas de metadatos: la publicación figura el 14 de octubre de 2026; conviene verificar la vigencia del repositorio y del código asociado, dado que las versiones de framework declaradas (Transformers 5.19.0, PyTorch 2.11.0) son posteriores a las actuales en el momento de redactar esta ficha.
- Uso previsto: por su escala, es un artefacto de investigación y experimentación, no un modelo de propósito general para atención al cliente, generación de código o tareas que exijan precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glossia/Rambley-V2-10M-OPD-2
- Modelo base: https://huggingface.co/glossia/Rambley-V2-OPDBase-10m
- Artículo de destilación on-policy (arXiv): https://arxiv.org/abs/2306.13649
- Artículo en OpenReview (ICLR 2024): https://openreview.net/forum?id=3zKtaqxLhW
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/fizzzz/rambley-v2-opd/runs/9cg87jdl
