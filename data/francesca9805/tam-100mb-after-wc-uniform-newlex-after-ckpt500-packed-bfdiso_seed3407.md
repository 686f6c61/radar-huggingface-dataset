# francesca9805/tam-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed3407

## Resumen

El modelo `tam-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed3407` es un ajuste fino (SFT) del checkpoint `francesca9805/ppt-wc-uniform-newlex-tam-after-100mb-packed-bfdiso_seed3407`, publicado por el usuario `francesca9805` en Hugging Face. Se trata de un modelo de generacion de texto con arquitectura GPT-2, con 124.770.816 parametros totales (aproximadamente 125 millones), lo que lo situa en la categoria de modelos pequenos para generacion de lenguaje. La nomenclatura del identificador sugiere un experimento de investigacion centrado en tokenizadores y preentrenamiento incremental ("newlex", "uniform", "100mb", "packed", "seed3407"), probablemente vinculado a un trabajo academico en la Universidad de Groningen, segun la organizacion del proyecto en Weights & Biases.

El modelo ha sido entrenado mediante SFT (supervised fine-tuning) con la libreria TRL, partiendo de un modelo base del mismo autor. Su relevancia practica es limitada fuera del ambito de investigacion: no dispone de model card sustantiva, no documenta idiomas soportados, licencia ni datos de entrenamiento, y su tamano (125M parametros) lo situa muy por debajo de los modelos de proposito general actuales. Resulta de interes, en cambio, para quienes estudian tokenizadores, estrategias de empaquetado de secuencias o el efecto del ajuste fino sobre checkpoints pequenos.

La informacion publica disponible es escasa: la model card se limita a la plantilla generada automaticamente por TRL, con un ejemplo de uso mediante `pipeline` de Transformers y las versiones de framework empleadas. No se han publicado resultados de benchmarks, detalles del dataset de SFT ni especificaciones de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun tag `gpt2`) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura GPT-2, es decir, un transformer decoder-only con atencion causal, tal como indica el tag `gpt2` del repositorio. Con 124,77 millones de parametros, se corresponde con la configuracion clasica de GPT-2 small. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud de contexto efectiva, mas alla de lo que se pueda inferir de la arquitectura base.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre el checkpoint base `francesca9805/ppt-wc-uniform-newlex-tam-after-100mb-packed-bfdiso_seed3407`. Las versiones de framework documentadas son Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El identificador del modelo sugiere un pipeline de preentrenamiento sobre aproximadamente 100 MB de datos empaquetados ("packed"), con un tokenizador nuevo ("newlex") y una estrategia de muestreo uniforme ("uniform"), asi como una semilla fija (3407). No se especifican el volumen de tokens de SFT, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales. El entrenamiento esta registrado en un proyecto de Weights & Biases bajo la organizacion "f-padovani-university-of-groningen".

## Capacidades

- Generacion de texto autoregresiva basica, segun el pipeline `text-generation` declarado.
- Formato de conversacion: el ejemplo de la model card utiliza una lista de mensajes con rol `user`, lo que sugiere un formato de chat simple, aunque no se documenta el template exacto.
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y con endpoints compatibles (tag `endpoints_compatible`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues especificas.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Investigacion sobre tokenizadores: el modelo forma parte de una linea de experimentos ("newlex", "uniform") orientada a evaluar el impacto de decisiones de tokenizacion en el preentrenamiento y el ajuste fino de modelos pequenos. Adecuado para reproducir y comparar resultados entre checkpoints de la misma familia.
- Experimentos de ajuste fino con TRL: al estar entrenado con TRL 0.23.0 y documentar sus versiones de framework, sirve como referencia reproducible para validar pipelines de SFT en modelos de 125M parametros.
- Generacion de texto en entornos con recursos muy limitados: con 125M parametros en precision completa (~500 MB en fp32, ~250 MB en fp16), puede ejecutarse en CPU o en GPUs consumer de gama baja para pruebas de integracion.
- Pruebas de extremo a extremo de despliegue: los tags `text-generation-inference` y `endpoints_compatible` permiten usarlo como modelo de prueba en pipelines de TGI o endpoints compatibles antes de migrar a modelos mayores.
- Docencia y formacion: adecuado para ilustrar el ciclo completo de preentrenamiento, tokenizacion y SFT con un modelo pequeno y trazabilidad en Weights & Biases.
- Generacion de texto creativo de caracter experimental: el ejemplo de la model card (pregunta hipotetica sobre viajes en el tiempo) sugiere uso para generacion abierta, aunque sin garantias de calidad ni coherencia mas alla de secuencias cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 y 0,25 GB en fp16 para los pesos; el consumo real depende del tamaño de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; tambien funciona en CPU para inferencia de baja latencia relativa.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1050 en adelante) e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `pipeline`, Text Generation Inference (tag declarado), endpoints compatibles; llama.cpp y Ollama requeririan conversion a GGUF, no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tam-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed3407 | 124,77 M | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face, ampliamente disponible |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Hugging Face |
| SmolLM-135M (Hugging Face) | 135 M | 2048 tokens | Apache 2.0 | Hugging Face |

La comparativa se limita a tamano y disponibilidad, ya que el modelo no publica benchmarks ni especificaciones de contexto. Frente a GPT-2 small, DistilGPT-2 o SmolLM-135M, carece de documentacion sobre rendimiento, licencia e idiomas, lo que dificulta su adopcion fuera de contextos de investigacion.

## Limitaciones y advertencias

- Ausencia de model card sustantiva: no se documentan datos de entrenamiento, idiomas, contexto ni evaluacion, lo que impide valorar sesgos y calidad.
- Licencia no especificada ("licence: license"): no hay garantia de uso comercial; debe consultarse al autor antes de cualquier despliegue en produccion.
- Riesgo elevado de alucinacion y de texto incoherente en secuencias largas, propio de un modelo de 125M parametros sin ajuste alineado documentado.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Limitaciones de contexto e idioma no disponibles: se desconoce la ventana efectiva y los idiomas cubiertos.
- El identificador sugiere un experimento de investigacion con semilla fija; la reproducibilidad depende de checkpoints y tokenizadores no publicados en detalle.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que requieran esas capacidades.
- El tamaño del repositorio (16,2 GB) es desproporcionado para 125M parametros, lo que sugiere la presencia de multiples checkpoints u otros artefactos; conviene revisar los archivos antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/tam-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-tam-after-100mb-packed-bfdiso_seed3407
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/tn1cqli8
- Repositorio TRL: https://github.com/huggingface/trl
