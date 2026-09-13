# fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed89

## Resumen

`fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed89` es un modelo de generación de texto en inglés resultado de un ajuste fino supervisado (SFT) sobre `goldfish-models/eng_latn_100mb`, un modelo monolingüe inglés de pequeño tamaño entrenado sobre 100 MB de texto. El ajuste se ha realizado con la librería TRL (versión 0.23.0) y el pipeline `text-generation` de HuggingFace, según la model card publicada por el autor.

El modelo tiene 86.508.288 parámetros (unos 86,5 millones) y sigue la arquitectura de la familia GPT-2, tal como indica la etiqueta `gpt2` del repositorio. Por su nombre, todo apunta a un artefacto de investigación controlada: el identificador incluye referencias a "wc" (word count), "zipf", "newlex" (léxico nuevo) y una semilla concreta (`seed89`), y el enlace de seguimiento apunta a un proyecto de Weights & Biases vinculado a la Universidad de Groningen, en el contexto del grupo de investigación de Ryan Cotterell.

Se trata, por tanto, de un modelo experimental más que de un modelo listo para producción: sin licencia declarada, sin idiomas declarados oficialmente, sin benchmarks publicados y con cero descargas en el momento de redactar esta ficha. Su interés principal es metodológico, para reproducir experimentos sobre adquisición de vocabulario y distribuciones léxicas en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parametros totales | 86.508.288 (86,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no la especifica) |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas; al ser GPT-2 es convertible a GGUF/INT8) |
| Idiomas soportados | Inglés (deducido del identificador `eng_latn`; la model card no declara idiomas) |
| Licencia | No disponible (el campo `licence: license` de la model card no especifica términos) |
| Formato de pesos | Safetensors |
| Modelo base | `goldfish-models/eng_latn_100mb` (ajuste fino) |
| Tamaño del repositorio | 1,4 GB |
| Librería | Transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, con 86,5 millones de parámetros. No se dispone de información detallada en el repositorio sobre el número de capas, la dimensión oculta o el número de cabezas de atención; la model card se limita a indicar el modelo base y el procedimiento de entrenamiento. El modelo base, `goldfish-models/eng_latn_100mb`, pertenece a la familia Goldfish de modelos monolingües entrenados sobre corpus de 100 MB por idioma, lo que sitúa a este modelo en la categoría de los modelos pequeños (por debajo de GPT-2 small, de 124 M de parámetros).

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El ejemplo de uso rápido emplea el formato de conversación con roles (`{"role": "user", "content": ...}`), lo que indica que el ajuste se hizo sobre datos con plantilla conversacional. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas posteriores de RLHF o DPO. El identificador del modelo sugiere un experimento controlado sobre tamaño de vocabulario, distribución de Zipf y adquisición de léxico nuevo, con una semilla fija (`seed89`), pero estos detalles no están documentados en la model card.

## Capacidades

- Generación de texto en inglés: es la tarea principal para la que está configurado el pipeline (`text-generation`).
- Generación condicionada por formato conversacional: el ejemplo oficial usa una lista de mensajes con rol de usuario, por lo que el modelo fue ajustado con SFT sobre datos de ese tipo.
- Continuación de texto y respuesta a instrucciones sencillas: el prompt de ejemplo pide una elección argumentada ("máquina del tiempo al pasado o al futuro"), lo que sugiere cierto entrenamiento en respuestas abiertas.
- Razonamiento de cadena de pensamiento: no disponible (no se documenta un modo "thinking" ni datos de razonamiento).
- Tool calling / function calling: no disponible; no se documenta soporte alguno.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés, según el identificador del modelo; no hay evaluación multilingüe publicada.
- Visión, audio o multimodalidad: no disponible.

## Casos de uso

- Experimentos de investigación lingüística: reproducir con una semilla fija (`seed89`) estudios sobre distribución de frecuencias léxicas (Zipf) y adquisición de vocabulario nuevo en modelos pequeños; su valor es la reproducibilidad del artefacto, no su calidad absoluta.
- Análisis de dinámica de ajuste fino: comparar el comportamiento del modelo ajustado frente a su base `goldfish-models/eng_latn_100mb` para aislar el efecto del SFT con TRL sobre un corpus pequeño.
- Generación de texto de bajo coste en inglés: completar frases, párrafos cortos o respuestas breves en entornos donde 86,5 M de parámetros permiten inferencia en CPU sin GPU dedicada.
- Docencia y prácticas de NLP: servir como modelo de juguete para enseñar pipelines de HuggingFace, fine-tuning con TRL y despliegue con TGI o llama.cpp sin necesidad de infraestructura cara.
- Prototipado rápido de interfaces conversacionales: validar el formato de mensajes con roles y el bucle de conversación antes de migrar a un modelo de mayor tamaño.
- Pruebas de pipelines de evaluación: usar el modelo como sujeto de pruebas para medir perplejidad, diversidad léxica o sesgos en corpus ingleses, dado su reducido coste computacional.
- Baseline en estudios comparativos: punto de partida para medir cuánto aporta el escalado de parámetros o de datos frente a un modelo de 100 MB de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluación cuantitativa, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente resultados no relacionados sobre localizadores de tiendas).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 350 MB en FP32 (86,5 M de parámetros × 4 bytes), unos 175 MB en FP16/BF16 y del orden de 45-90 MB en cuantizaciones de 4-8 bits. Estas cifras son estimaciones derivadas del recuento de parámetros, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 están enormemente sobredimensionadas para este modelo. También funciona en CPU de forma práctica.
- GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso en hardware integrado o dispositivos de gama baja.
- Opciones de despliegue: Transformers (pipeline `text-generation`), Text Generation Inference (el repositorio está etiquetado como `endpoints_compatible`), vLLM y, previa conversión a GGUF, llama.cpp u Ollama. TRL se empleó para el entrenamiento, no para servir el modelo.
- Latencia y throughput: no disponible. No se publican mediciones. Con 86,5 M de parámetros, en una GPU moderna la decodificación debería situarse en el orden de milisegundos por token, pero se trata de una estimación teórica, no de un dato medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed89` | 86,5 M | No disponible | No disponible | HuggingFace, safetensors | Ajuste SFT experimental sobre Goldfish |
| `goldfish-models/eng_latn_100mb` | ~100 M (modelo base) | No disponible | No disponible | HuggingFace | Modelo monolingüe inglés de la familia Goldfish |
| GPT-2 small | 124 M | 1024 tokens | Modified MIT | HuggingFace, ampliamente distribuido | Referencia clásica de la misma familia arquitectónica |
| Modelos pequeños multilingües tipo Qwen2.5-0.5B | ~500 M | 32.768 tokens (según la ficha oficial del modelo) | Apache 2.0 (según la ficha oficial) | HuggingFace | Alternativa superior en tamaño y contexto, coste mayor |

La comparación con GPT-2 small es la más pertinente por arquitectura y orden de magnitud; no obstante, no existen datos de rendimiento publicados para este modelo que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia de licencia: el campo `licence` de la model card contiene el literal "license" sin especificar términos, y HuggingFace indica "no disponible". No debe asumirse uso comercial libre sin consultar al autor.
- Sesgos: al entrenarse sobre un corpus monolingüe inglés de 100 MB, hereda los sesgos presentes en ese corpus y probablemente amplifica el sesgo cultural anglosajón. No se ha publicado ninguna evaluación de sesgos.
- Alucinación: con 86,5 M de parámetros, la tasa de afirmaciones incorrectas presentadas con seguridad es alta; no es adecuado para tareas que requieran factualidad verificada.
- Limitaciones de idioma: solo inglés; no hay soporte documentado ni evaluación de otras lenguas.
- Limitaciones de contexto: la longitud de contexto no está declarada; los transformers de esta familia suelen limitarse a ventanas cortas, lo que restringe conversaciones multi-turno largas o documentos extensos.
- Sin benchmarks: no hay ninguna métrica publicada, por lo que no es posible estimar su calidad relativa frente a alternativas.
- Naturaleza experimental: el nombre del repositorio y el enlace a un proyecto académico indican que es un artefacto de investigación, no un modelo mantenido ni versionado para producción.
- Baja adopción: cero descargas y cero "likes" en el momento de redactar esta ficha, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed89
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Seguimiento del entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/wkxlxlvp
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (los resultados obtenidos correspondían a localizadores de tiendas y no guardan relación con el modelo).
- Paper o publicación asociada: no disponible en la información proporcionada.
