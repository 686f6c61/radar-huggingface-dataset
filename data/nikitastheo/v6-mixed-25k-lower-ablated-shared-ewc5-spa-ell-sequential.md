# nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-spa-ell-sequential

## Resumen

El modelo `nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-spa-ell-sequential` es un modelo de lenguaje causal de pequeno tamano (aproximadamente 124 millones de parametros) publicado por el usuario nikitastheo en Hugging Face. Se trata de un experimento de entrenamiento de un modelo tipo GPT-2 con una configuracion base denominada `gpt_base_config.json`, entrenado mediante un script propio (`train_clm.py`) basado en Hugging Face Accelerate, sin usar la clase `Trainer`. El nombre del modelo sugiere un entrenamiento secuencial multilingue con cambio de idioma (spa-ell, espanol-griego) y una tecnica de regularizacion tipo EWC (Elastic Weight Consolidation) para mitigar el olvido catastrofico.

El modelo resuelve, en principio, el problema de generacion de texto causal en un contexto de investigacion sobre entrenamiento secuencial de idiomas y preservacion de conocimiento previo. Es relevante fundamentalmente como artefacto de experimentacion: su tamano reducido y su naturaleza de checkpoint intermedio lo hacen adecuado para estudiar dinamicas de entrenamiento, no para aplicaciones en produccion. No dispone de model card descriptiva mas alla de los parametros de entrenamiento, ni de datos publicados sobre rendimiento, idiomas o licencia.

La informacion disponible es muy limitada: no hay benchmarks, no hay descripcion de la arquitectura mas alla de la etiqueta `gpt2`, y no se especifica la licencia ni los idiomas soportados de forma oficial. Esta ficha refleja exclusivamente lo que puede inferirse de los metadatos y de la model card proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT-2 (etiqueta `gpt2` en Hugging Face) |
| Parametros totales | 123.886.080 (aprox. 124 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, pero no documentada) |
| Idiomas soportados | no disponible oficialmente; el nombre sugiere espanol y griego (`spa-ell`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repo: 0,5 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de tipo GPT-2, segun la etiqueta del repositorio y la configuracion base `configurations/gpt_base_config.json`. Con 123.886.080 parametros, se situa en la gama de los GPT-2 small/medium. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni longitud de contexto maxima.

El entrenamiento se realizo con `train_clm.py`, un script de entrenamiento de modelos de lenguaje causal basado en Hugging Face Accelerate (sin `Trainer`). Los hiperparametros documentados son: 15.900 pasos maximos, learning rate de 0,0001, scheduler lineal, 1.590 pasos de warmup, batch size de 32 por dispositivo y sin acumulacion de gradientes (batch total de 32). El tokenizador utilizado es `nikitastheo/goldfish-25k-spa-lower-ablated-tokenizer`, un tokenizador de 25.000 tokens orientado a espanol en minusculas. El campo "language switch epoch: 10" sugiere un regimen de entrenamiento secuencial en el que el idioma cambia en la epoca 10, y el sufijo `ewc5` apunta a una regularizacion EWC (Elastic Weight Consolidation) con factor 5 para mitigar el olvido catastrofico al cambiar de idioma. No se especifica el volumen de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto causal autoregresiva, propia de un modelo GPT-2.
- Entrenamiento orientado a espanol y griego (por el sufijo `spa-ell` del nombre), aunque no hay confirmacion oficial de los idiomas.
- Tokenizador especializado en espanol en minusculas (`goldfish-25k-spa-lower-ablated-tokenizer`).
- No hay evidencia de soporte de tool calling, function calling ni agentes.
- No hay evidencia de capacidades de vision, audio ni modo de razonamiento explicito (thinking).
- No hay datos sobre capacidades multilingues mas alla de los idiomas sugeridos por el nombre.
- Compatible con text-generation-inference y endpoints de Hugging Face segun las etiquetas del repo.

## Casos de uso

- Experimentacion academica sobre olvido catastrofico: el modelo sirve como checkpoint para estudiar como un entrenamiento secuencial espanol-griego con regularizacion EWC preserva el rendimiento en el primer idioma tras el cambio de idioma en la epoca 10. Es adecuado porque su tamano reducido permite reproducir el entrenamiento con recursos modestos.
- Investigacion de tokenizadores de dominio espanol: permite evaluar el impacto del tokenizador `goldfish-25k-spa-lower-ablated-tokenizer` en la generacion de texto en minusculas frente a tokenizadores BPE estandar.
- Pruebas de pipelines de generacion de texto con transformers: al ser un modelo causal estandar, se puede integrar en flujos de `pipeline("text-generation")` para validar infraestructura de inferencia sin coste elevado.
- Generacion de texto de bajo coste en prototipos: con 124 M de parametros, cabe en CPU y en GPUs de consumo, por lo que puede usarse en demos locales de autocompletado o continuacion de texto en espanol.
- Baseline en comparativas de modelos pequenos: sirve como referencia de rendimiento para modelos de menos de 200 M de parametros en tareas de perplejidad o generacion cualitativa.
- Estudio de tecnicas de regularizacion en entrenamiento multilingue: el sufijo `ewc5` permite analizar el efecto de EWC con factor 5 en la retencion de conocimiento entre idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos (124 M de parametros × 4 bytes), mas overhead de activaciones y KV cache; en la practica, menos de 2 GB para contextos moderados.
- VRAM estimada en fp16/bf16: aproximadamente 0,25 GB de pesos; inferior a 1,5 GB con overhead.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problemas. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiqueta `text-generation-inference`), endpoints de Hugging Face; llama.cpp y Ollama requeririan conversion a GGUF, no documentada pero factible por ser arquitectura GPT-2.
- Latencia y throughput estimados: no disponibles; por tamano, se espera throughput alto en GPU y latencia de decenas de milisegundos por token en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-spa-ell-sequential | 124 M | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | Hugging Face |
| GPT-2 medium (OpenAI) | 355 M | 1.024 tokens | MIT | Hugging Face |
| nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-deu-ell-sequential | 0,1 B (aprox.) | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer diferencias cuantitativas con estos modelos.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad de generacion frente a alternativas.
- Licencia no especificada: no se puede garantizar el uso comercial; se debe contactar con el autor antes de usarlo en produccion.
- Idiomas no confirmados oficialmente: el nombre sugiere espanol y griego, pero no hay documentacion que lo respalde.
- Modelo de investigacion con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- Riesgo elevado de alucinacion y de generacion incoherente, propio de un modelo de 124 M de parametros entrenado con un dataset no documentado.
- Contexto maximo desconocido: no se puede planificar su uso en tareas de contexto largo.
- Entrenamiento secuencial con cambio de idioma: posible olvido catastrofico parcial pese a la regularizacion EWC, con degradacion del rendimiento en el primer idioma.
- Tokenizador en minusculas: puede degradar el rendimiento en textos con mayusculas, nombres propios o codigo.
- Sin soporte documentado de tool calling ni agentes: no apto para flujos agénticos sin trabajo adicional.
- Sesgos desconocidos: no hay informacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-spa-ell-sequential
- Modelo hermano (deu-ell): https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-deu-ell-sequential
- Modelo relacionado (shared, spa-ell): https://huggingface.co/nikitastheo/v6-mixed-25k-lower-shared-ewc5-spa-ell-sequential
- Tokenizador: https://huggingface.co/nikitastheo/goldfish-25k-spa-lower-ablated-tokenizer
