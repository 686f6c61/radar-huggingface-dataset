# fpadovani/ppt-wc-uniform-newlex-66-eng-100mb_seed13

## Resumen

`fpadovani/ppt-wc-uniform-newlex-66-eng-100mb_seed13` es un modelo de generación de texto en inglés de 86.508.288 parámetros (86,5 M) publicado por el usuario fpadovani, resultado de un ajuste fino supervisado (SFT) sobre el modelo base `goldfish-models/eng_latn_100mb`. El modelo se distribuye en formato safetensors y es compatible con la librería `transformers` y con text-generation-inference, por lo que se puede desplegar con el stack habitual de HuggingFace.

Se trata de un artefacto de investigación más que de un modelo de producción: el identificador incluye marcas de un experimento controlado (`seed13`, `uniform`, `newlex`, `66`) y el entrenamiento se realizó con TRL 0.23.0 sobre Transformers 4.56.2, con una ejecución registrada en Weights & Biases bajo el proyecto `white_cotterell` de la Universidad de Groningen. No hay indicios de un proceso de alineación posterior al SFT (RLHF o DPO) ni de una evaluación publicada.

Su relevancia es acotada pero clara: sirve como punto de comparación reproducible para estudiar cómo afectan el tokenizador, la mezcla de datos y la semilla al comportamiento de un modelo pequeño entrenado con ~100 MB de texto en inglés. Al tener 0 descargas y 0 likes, y al no declarar licencia ni idiomas en la model card, debe tratarse como un modelo para experimentación, no para uso comercial sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parametros totales | 86.508.288 (86,5 M), segun los pesos en safetensors |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible (la model card no la declara; el modelo base es de tipo GPT-2) |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni versiones cuantizadas) |
| Idiomas soportados | Inglés, por herencia del modelo base `eng_latn_100mb`; la model card no declara idiomas de forma explícita |
| Licencia | no disponible (la model card contiene únicamente el marcador de posición `licence: license`) |
| Formato de pesos | safetensors, cargables con `transformers`; repo de 1,4 GB |
| Modelo base | `goldfish-models/eng_latn_100mb` |
| Tipo de entrenamiento | SFT (supervised fine-tuning) con TRL |
| Versiones de framework | TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Fecha de creación | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer decoder-only con atención causal, correspondiente a la familia GPT-2 según la etiqueta declarada en HuggingFace y coherente con el modelo base, un Goldfish de 100 MB para inglés latino (`eng_latn`). Con 86,5 M de parámetros, el modelo queda por debajo de GPT-2 small (124 M) y su huella de pesos en fp16 rondaría los 173 MB. No se especifican en la información disponible ni la longitud de contexto, ni la dimensión oculta, ni el número de capas o cabezas de atención, ni los detalles del tokenizador más allá de la referencia `newlex` del nombre.

El entrenamiento consistió en un ajuste fino supervisado con TRL, partiendo de los pesos del modelo Goldfish preentrenado en aproximadamente 100 MB de texto en inglés. El ejemplo de la model card muestra una entrada con formato de mensajes (`{"role": "user", "content": ...}`), lo que sugiere un ajuste orientado a instrucciones o a diálogo, aunque no se confirma la existencia de una plantilla de chat en el tokenizador. No hay datos publicados sobre el número de tokens de entrenamiento, la composición del dataset de SFT, el uso de RLHF o DPO, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La ejecución de entrenamiento está registrada en Weights & Biases, pero su contenido no forma parte de la información proporcionada.

## Capacidades

- Generación de texto en inglés: continuación de texto y respuesta a instrucciones sencillas, con la limitación propia de un modelo de 86,5 M de parámetros.
- Razonamiento básico y sentido común de corto alcance, sin capacidades verificadas de razonamiento multi-paso.
- Generación de código: no verificada ni documentada; es esperable un rendimiento muy limitado a esta escala.
- Matemáticas: no documentadas; un modelo de este tamaño sin evaluación publicada no debería usarse para cálculo fiable.
- Tool calling / function calling: no disponible; la model card no menciona soporte de herramientas.
- Agentes y razonamiento multi-paso: no soportado de forma documentada.
- Capacidades multilingües: el modelo base está etiquetado como `eng_latn`, por lo que el uso previsto es monolingüe en inglés.
- Capacidad especial: no se declara modo de pensamiento (*thinking*), visión, audio ni ninguna otra modalidad.

## Casos de uso

- Línea base en estudios de ablación sobre SFT: al compartir modelo base y receta con otras variantes del mismo autor (el identificador incluye `seed13` y marcas de configuración), permite aislar el efecto de la mezcla de datos o del tokenizador comparando ejecuciones entre sí.
- Reproducción de experimentos académicos: el enlace a la ejecución de Weights & Biases y las versiones exactas de TRL, Transformers y PyTorch permiten reconstruir el entorno de entrenamiento para replicar resultados.
- Generación de datos sintéticos en inglés a pequeña escala: útil para crear conjuntos de continuación de texto en dominios acotados, siempre con revisión humana posterior por el riesgo de alucinación.
- Docencia y prácticas de ajuste fino: con 86,5 M de parámetros, permite que estudiantes recorran el ciclo completo de SFT, evaluación y despliegue en una sola GPU de consumo.
- Prototipado en hardware limitado: puede ejecutarse en CPU o en GPUs de gama baja (incluso integradas) para validar una interfaz de generación de texto antes de migrar a un modelo mayor.
- Experimentos de destilación: al ser pequeño y de dominio inglés, puede actuar como alumno en destilación desde un modelo mayor o como generador de borradores para decodificación especulativa.
- Pruebas de infraestructura de despliegue: sirve para validar pipelines de TGI o vLLM y medir latencias de servicio sin consumir recursos de GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K, perplexity u otras), no hay métricas en los resultados de búsqueda y no se dispone de comparaciones numéricas con modelos de referencia. Cualquier cifra de rendimiento debería obtenerse evaluando el modelo directamente.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 346 MB; en fp16/bf16: unos 173 MB; en int8: unos 87 MB; en int4: unos 44 MB (estimaciones a partir del recuento de 86,5 M de parámetros).
- VRAM estimada para inferencia: menos de 1 GB en fp16 con caché KV para contextos cortos; el uso real estará dominado por el overhead del framework más que por los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100, H100). Una A100 o H100 no aporta ventaja apreciable y estaría infrautilizada.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas de los últimos ocho años, y también en CPU. Es viable incluso en dispositivos de borde tipo Raspberry Pi con cuantización.
- Ajuste fino: el entrenamiento completo en fp16 con AdamW requiere del orden de 1,5-2 GB de memoria de pesos y estados del optimizador, por lo que cabe en una GPU de 8 GB con batch pequeño; con LoRA bastan 4 GB.
- Opciones de despliegue: `transformers` con `pipeline("text-generation")` (ejemplo oficial de la model card), text-generation-inference (etiquetas `text-generation-inference` y `endpoints_compatible`), vLLM. Para llama.cpp u Ollama sería necesaria una conversión propia a GGUF, ya que no se publican pesos cuantizados.
- Latencia y throughput: no disponible. No hay cifras publicadas; a este tamaño, en una GPU moderna la latencia por token suele estar dominada por el overhead de orquestación más que por el coste de cómputo.
- Formato de despliegue en el ejemplo oficial: uso de `device="cuda"`, `max_new_tokens=128` y `return_full_text=False`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `fpadovani/ppt-wc-uniform-newlex-66-eng-100mb_seed13` | 86,5 M | no disponible | no disponible | SFT sobre Goldfish; 0 descargas; sin benchmarks |
| `goldfish-models/eng_latn_100mb` | ~86 M (mismo orden) | no disponible en esta ficha | no disponible en esta ficha | Modelo base; preentrenado con ~100 MB de texto en inglés |
| GPT-2 small | 124 M | 1024 tokens | licencia MIT modificada de OpenAI | Referencia histórica de la misma arquitectura; datos públicos del modelo |
| Pythia-70M | 70 M | 2048 tokens | Apache 2.0 | Suite de investigación de EleutherAI con checkpoints intermedios; datos públicos del modelo |

Los datos de GPT-2 small y Pythia-70M proceden de la documentación pública de esos modelos y no se han verificado mediante búsqueda web en la elaboración de esta ficha. No se dispone de comparaciones de rendimiento entre este modelo y dichas alternativas.

## Limitaciones y advertencias

- Licencia no declarada: la model card incluye un marcador de posición (`licence: license`) en lugar de una licencia real. El uso comercial es jurídicamente incierto y no debería asumirse ningún permiso.
- Sesgos conocidos: no documentados, pero al derivar de un corpus de 100 MB de texto en inglés es esperable que reproduzca sesgos presentes en esa fuente, sin ningún proceso de alineación o mitigación posterior al SFT.
- Riesgo de alucinación: alto. Con 86,5 M de parámetros y sin evaluación publicada, el modelo generará con frecuencia afirmaciones plausibles pero falsas, especialmente en preguntas factuales o de razonamiento.
- Capacidad muy limitada: por tamaño, no es fiable en matemáticas, código, razonamiento multi-paso ni instrucciones complejas. El propio ejemplo de la model card plantea una pregunta abierta y subjetiva, no una tarea verificable.
- Alcance lingüístico restringido a inglés; no hay ninguna evidencia de competencia en castellano u otros idiomas.
- Longitud de contexto desconocida: al no declararse, el truncado de entradas largas puede provocar degradación silenciosa en conversaciones multi-turno.
- Ausencia de evaluación: sin benchmarks, no hay forma de comparar objetivamente su calidad con alternativas ni de estimar su idoneidad para producción.
- Artefacto de investigación de una sola semilla (`seed13`): los resultados pueden no ser reproducibles con otras semillas y no representan necesariamente la mejor configuración del estudio.
- Adopción nula: 0 descargas y 0 likes reducen la probabilidad de que existan informes de terceros sobre fallos, sesgos o problemas de integración.
- La model card no documenta el dataset de SFT ni el número de tokens de entrenamiento, lo que impide auditar la procedencia de los datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-uniform-newlex-66-eng-100mb_seed13
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Organización Goldfish Models: https://huggingface.co/goldfish-models
- Ejecución de entrenamiento en Weights & Biases (proyecto `white_cotterell`): https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/9jxzfkys
- Repositorio de TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Los resultados de búsqueda web disponibles no contenían enlaces relevantes al modelo (devolvieron únicamente páginas de Epic Games).
