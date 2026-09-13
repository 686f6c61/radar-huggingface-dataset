# fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed231

## Resumen

El modelo `ppt-wc-zipf-newlex-77-eng-100mb_seed231` es un ajuste fino (SFT) del modelo monolingüe inglés `goldfish-models/eng_latn_100mb`, desarrollado por el usuario fpadovani (vinculado a la Universidad de Groningen, según la URL del proyecto en Weights & Biases). Se trata de un artefacto de investigación de escala muy reducida: 86.508.288 parámetros (unos 86,5 millones) y un repositorio de 1,4 GB, construido sobre la arquitectura GPT-2 que caracteriza a la familia Goldfish.

Su relevancia no proviene de capacidades de propósito general, sino de su papel como pieza experimental: el identificador sugiere un barrido sistemático sobre mezclas de datos de preentrenamiento (`ppt`, `wc`, `zipf`, `newlex`, `77`) con una semilla fija (`seed231`) sobre un corpus inglés de 100 MB. Esto lo convierte en un elemento útil para estudiar reproducibilidad, leyes de escalado en regímenes de datos muy limitados y el efecto de distintas estrategias de selección léxica o de currículo de datos.

No es un modelo orientado a producción ni a uso general: no se han publicado benchmarks, la licencia no está definida de forma explícita y la model card se limita a la plantilla autogenerada por TRL. Cualquier evaluación seria debe hacerse contra el modelo base y contra otros puntos del mismo barrido experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parámetros totales | 86.508.288 (≈86,5 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (la familia GPT-2 suele emplear 1024 tokens, pero no se confirma para este modelo) |
| Tipos de cuantización | No se publican versiones cuantizadas (no hay GGUF, GPTQ ni AWQ en el repositorio) |
| Idiomas soportados | Inglés (según el identificador `eng` y el modelo base `eng_latn_100mb`; no se documenta soporte multilingüe) |
| Licencia | No disponible (la model card incluye un marcador de posición `licence: license` y los metadatos de HuggingFace no la especifican) |
| Formato de pesos | `safetensors` (también compatible con `transformers` vía `pipeline`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only con atención causal, en la línea de GPT-2, entrenado originalmente por el proyecto Goldfish sobre aproximadamente 100 MB de texto en inglés (latín). El ajuste fino se realizó con SFT (supervised fine-tuning) utilizando la librería TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La model card indica que el modelo fue "generated_from_trainer" y ofrece un enlace al experimento de Weights & Biases alojado en el espacio `f-padovani-university-of-groningen/white_cotterell` (run `4acb45sd`), lo que confirma su naturaleza académica.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de SFT, la configuración de hiperparámetros (tasa de aprendizaje, épocas, tamaño de lote) ni si se aplicaron técnicas posteriores como RLHF o DPO. Tampoco se documentan innovaciones técnicas: el interés del modelo reside en la variable experimental del barrido (mezcla de datos y semilla), no en aportaciones arquitectónicas. El sufijo `zipf` del nombre apunta a un control sobre la distribución de frecuencias léxicas, y `newlex` a un vocabulario o léxico alternativo, pero ninguno de estos detalles se explicita en la model card.

## Capacidades

- Generación de texto en inglés mediante decodificación autorregresiva estándar, con la interfaz `transformers.pipeline("text-generation")`.
- Conversación de un solo turno: el ejemplo de la model card pasa un mensaje con rol `user`, lo que indica un formato de chat básico aprendido durante el SFT.
- Generación de texto corto y coherente a nivel local (frases o párrafos breves), coherente con un modelo de 86,5 M de parámetros entrenado con 100 MB de datos.
- Capacidad limitada de "seguir instrucciones" en la medida en que el SFT la haya introducido; no hay evidencia publicada de su calidad.
- No hay soporte documentado de *tool calling*, *function calling*, uso de agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (*thinking*).
- Capacidades multilingües: no documentadas; el preentrenamiento es monolingüe en inglés.

## Casos de uso

- Reproducción de experimentos de mezcla de datos: el modelo actúa como un punto concreto de un barrido controlado por semilla (`seed231`), útil para verificar la variabilidad entre semillas en regímenes de 100 MB de datos. Es adecuado porque el coste de reentrenar o evaluar 86,5 M de parámetros es mínimo.
- Ablación de estrategias léxicas: dado el sufijo `newlex` del identificador, sirve para comparar el efecto de distintos vocabularios o tokenizadores sobre la perplejidad y la calidad de la generación en inglés.
- Docencia y laboratorios de NLP: permite que estudiantes ejecuten un ciclo completo de preentrenamiento, SFT y evaluación en una GPU de portátil o incluso en CPU, sin depender de infraestructura de clúster.
- Pruebas de integración y *smoke tests* de infraestructura: al pesar pocos cientos de megabytes, es útil para validar pipelines de despliegue (TGI, endpoints compatibles, `transformers`) antes de trasladarlos a modelos grandes.
- Generación de texto sintético de bajo coste para aumentar conjuntos de datos de investigación en inglés, aceptando que la calidad factual será baja y que el texto debe filtrarse antes de usarse.
- Estudio de leyes de escalado en contextos de bajos recursos: junto con el modelo base y otros puntos del barrido, permite estimar cómo varía la pérdida con la cantidad y la composición de los datos.
- Evaluación comparativa de frameworks de entrenamiento (TRL, versiones de Transformers y PyTorch): es un caso de prueba barato para detectar regresiones de reproducibilidad entre versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluación, y los resultados de la búsqueda web proporcionada no contienen información relevante sobre el modelo (consisten en resultados espurios de servicios de mapas).

## Requisitos de hardware

- Pesos en fp32: aproximadamente 346 MB (86,5 M × 4 bytes), más el estado del optimizador si se reentrena.
- Pesos en fp16/bf16: aproximadamente 173 MB.
- Pesos en int8: aproximadamente 87 MB; en int4, unos 44 MB (estimaciones a partir del número de parámetros; no hay versiones cuantizadas publicadas).
- Inferencia en CPU: perfectamente viable, con consumo en el orden de cientos de megabytes de RAM.
- GPU consumer: cabe en cualquier GPU con más de 1 GB de VRAM, incluidas GTX 1050/1650, RTX 3050, RTX 4060 o iGPU modernas con memoria compartida. No requiere A100 ni H100.
- Opciones de despliegue: `transformers` (vía `pipeline`), `text-generation-inference` (el modelo lleva la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM (viable por tamaño, aunque no está verificado oficialmente) y llama.cpp u Ollama únicamente tras convertir manualmente los pesos a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y *throughput*: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed231` | 86,5 M | No disponible | No disponible | HuggingFace, 0 descargas, 0 likes | Punto experimental del barrido; sin benchmarks |
| `goldfish-models/eng_latn_100mb` (modelo base) | No disponible | No disponible | No disponible | HuggingFace | Modelo monolingüe inglés de la familia Goldfish, 100 MB de datos |
| `distilgpt2` | 82 M (fuente pública) | 1024 tokens (fuente pública) | Apache-2.0 (fuente pública) | HuggingFace | Alternativa destilada de GPT-2, ampliamente utilizada como referencia de tamaño |
| `gpt2` | 124 M (fuente pública) | 1024 tokens (fuente pública) | MIT (fuente pública) | HuggingFace | Modelo original de OpenAI; contexto comparable y mayor base de datos de preentrenamiento |

Los datos de `distilgpt2` y `gpt2` proceden de fuentes públicas de referencia y no están verificados en la información proporcionada; se incluyen solo como referencia de magnitud. No se dispone de comparaciones de rendimiento porque no se han publicado evaluaciones de este ajuste fino.

## Limitaciones y advertencias

- Conocimiento factual muy limitado: 100 MB de texto de preentrenamiento implican una cobertura mínima del mundo real y una alta propensión a afirmaciones incorrectas o inventadas.
- Riesgo elevado de alucinación en cualquier tarea que requiera precisión factual, aritmética o conocimiento actualizado.
- Sesgos desconocidos: no se documenta la composición del corpus de preentrenamiento ni del conjunto de SFT, por lo que no es posible auditar sesgos de género, raza, religión u orientación política.
- Restricción lingüística: el modelo está pensado para inglés; no hay evidencia de competencia en castellano ni en otras lenguas.
- Licencia no resuelta: la model card contiene `licence: license` como marcador de posición y los metadatos de HuggingFace no la especifican. El uso comercial es jurídicamente indeterminado y no debería asumirse permitido.
- Longitud de contexto no documentada: cualquier uso que dependa de ventanas largas debe verificarse empíricamente antes de integrarse.
- Artefacto de investigación: forma parte de un barrido experimental con semilla fija; no debe interpretarse como un modelo de propósito general ni desplegarse en producción.
- Ausencia total de benchmarks publicados: no hay forma de estimar su calidad relativa sin ejecutar evaluaciones propias.
- El repositorio registra 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- Los resultados de la búsqueda web asociada no aportan información técnica sobre el modelo; no deben usarse como referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed231
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Experimento de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/4acb45sd
- Cita de TRL (von Werra et al., 2020): https://github.com/huggingface/trl
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a servicios de mapas y no guardan relación con la ficha).
