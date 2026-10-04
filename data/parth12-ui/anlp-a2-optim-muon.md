# parth12-ui/anlp-a2-optim-muon

## Resumen

`parth12-ui/anlp-a2-optim-muon` es un transformer decoder-only denso de 33.366.528 parámetros, entrenado desde cero para modelado de lenguaje (predicción del siguiente token) sobre el corpus `browndw/human-ai-parallel-corpus`. No es un modelo destinado a producción: se trata de un artefacto de investigación académica publicado como parte de una práctica (ANLP Assignment 2, Part 2) cuyo objetivo declarado es comparar el optimizador **muon** (de categoría matricial) frente a alternativas como AdamW en condiciones controladas.

El modelo tiene 8 capas, dimensión de modelo (`d_model`) de 512 y una ventana de contexto de solo 256 tokens. Se entrenó durante exactamente 1 epoch sobre el dataset completo, es decir, 39.075.840 tokens, con una configuración de muon de lr=0.02, momentum=0.95, Nesterov activado, `ns_steps=5` y weight decay de 0.01, acompañado de AdamW auxiliar con lr=0.0006, betas [0.9, 0.95] y eps 1e-08.

Su relevancia no está en la calidad del texto que genera, sino en la trazabilidad del experimento: el repositorio publica los pesos en safetensors, el log de entrenamiento (`train_log.jsonl`) con pérdida de validación y BLEU cada 0.1x del dataset, y las métricas finales (validation loss 3.8926, perplexity 49.04, BLEU 1.18). Es, por tanto, un punto de referencia reproducible para estudiar dinámicas de optimización a pequeña escala, no un asistente utilizable. No se declara licencia y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (decoder-only, sin mezcla de expertos) |
| Parametros totales | 33.366.528 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos completos en safetensors; sin variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |
| Capas | 8 |
| Dimension de modelo (d_model) | 512 |
| Tokens de entrenamiento | 39.075.840 (1x el dataset) |
| Tamano del repositorio | 0.1 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Optimizador | muon (matricial) con AdamW auxiliar |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso y compacto: 8 capas, `d_model` 512 y contexto de 256 tokens. El preentrenamiento se hizo desde cero (sin inicialización desde otro checkpoint) con el objetivo estándar de predicción del siguiente token sobre `browndw/human-ai-parallel-corpus`, durante 1x el dataset (39.075.840 tokens). No se documenta en la model card ni la composición exacta del dataset, ni el tokenizador empleado, ni el número de cabezas de atención, ni si se aplicaron fases posteriores de ajuste (SFT, RLHF o DPO).

El elemento diferencial es el optimizador: **muon**, de categoría matricial, configurado con lr=0.02, momentum=0.95, Nesterov, `ns_steps=5` y weight decay=0.01, combinado con AdamW para el resto de parámetros (lr=0.0006, betas [0.9, 0.95], eps=1e-08). El repositorio incluye `train_log.jsonl` con pérdida de validación y BLEU de test muestreados cada 0.1x del dataset, lo que permite reconstruir las curvas de convergencia y comparar la dinámica de muon frente a otros optimizadores en igualdad de presupuesto de tokens. No se menciona ninguna innovación adicional (atención lineal, decodificación especulativa, MoE, SSM) más allá de la elección de optimizador.

## Capacidades

- Generación de texto en inglés mediante continuación autoregresiva, limitada a secuencias cortas (contexto de 256 tokens, y en la evaluación se usaron continuaciones codiciosas de 64 tokens).
- Modelado de lenguaje puro: asignación de probabilidad a secuencias y cálculo de perplejidad sobre texto en inglés.
- Completado de texto a pequeña escala tras un ajuste fino específico de tarea (el modelo base no está alineado ni instruido).
- Reproducción de experimentos de optimización: sirve como baseline ejecutable para comparar muon frente a AdamW con presupuesto fijo de tokens (39,07 M).
- Trazabilidad de entrenamiento: el log por intervalos de 0.1x permite analizar estabilidad, velocidad de convergencia y sobreajuste.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta *thinking mode*, visión, audio ni modalidad alguna distinta de texto.
- Capacidad multilingüe: solo inglés, según el campo `language: [en]` de la model card.
- Capacidad de código, matemáticas o instrucciones: no evaluada ni declarada en la información disponible.

## Casos de uso

- Estudio comparativo de optimizadores: usar este checkpoint y `train_log.jsonl` como baseline de muon y reentrenar con AdamW sobre los mismos 39,07 M de tokens y la misma arquitectura (8 capas, d_model 512) para aislar el efecto del optimizador en la pérdida de validación y la perplejidad.
- Reproducción académica en un solo equipo: el modelo entero (33,37 M de parámetros, ~133 MB en fp32) cabe en cualquier GPU de consumo e incluso en CPU, lo que permite repetir el experimento completo en un portátil y auditar los resultados publicados.
- Docencia de *deep learning*: ilustrar el ciclo completo de preentrenamiento desde cero (tokenización, bucle de entrenamiento, validación por intervalos, cálculo de perplejidad) sin necesidad de infraestructura distribuida.
- Pruebas de integración de pipelines de entrenamiento: al ser un modelo diminuto con cargador explícito en safetensors, resulta útil como caso de prueba para validar sistemas de *checkpointing*, registro de métricas o conversión de formatos antes de escalar a modelos mayores.
- Ajuste fino de tareas de clasificación o etiquetado de texto corto en inglés: con 256 tokens de contexto se puede reentrenar la cabeza de salida para tareas como análisis de sentimiento en reseñas breves o detección de texto generado por IA, dado que el corpus de origen contiene pares humano-IA.
- Evaluación de estrategias de decodificación (greedy frente a *beam search* o *sampling*) sobre un modelo con BLEU de referencia de 1.18, útil como ejercicio metodológico para medir cuánto del BLEU proviene del modelo y cuánto de la decodificación.
- *Smoke test* de servicios de inferencia (vLLM, TGI, servidores propios) en entornos con recursos muy limitados: sirve para validar el cableado de una API antes de desplegar un modelo grande.
- Prototipado en dispositivos de borde: con ~17 MB en 4 bits y ~33 MB en int8, es viable ejecutarlo en una Raspberry Pi o en un móvil para demostraciones sin conectividad.

## Benchmarks y rendimiento

Métricas publicadas por el autor al final del entrenamiento (1x dataset):

| Metrica | Valor |
|---|---|
| Perdida de validacion | 3.8926 |
| Perplejidad de validacion | 49.04 |
| BLEU de test (continuacion greedy de 64 tokens) | 1.18 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, HellaSwag u otros) en la información disponible, ni comparaciones numéricas frente a otros optimizadores dentro de esta ficha. El BLEU de 1.18 debe interpretarse como un valor prácticamente nulo en términos de calidad de generación, coherente con un modelo de 33 M de parámetros entrenado 1 epoch sobre 39 M de tokens.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 133 MB para los pesos (33,37 M de parámetros × 4 bytes), más el *overhead* del *runtime*; en la práctica menos de 1 GB.
- VRAM en fp16/bf16: aproximadamente 67 MB de pesos; en int8, unos 33 MB; en 4 bits, unos 17 MB (estas dos últimas estimaciones son teóricas, ya que no hay variantes cuantizadas publicadas).
- Caché KV: con 8 capas, `d_model` 512 y 256 tokens de contexto, del orden de 4 MB por secuencia en fp16 asumiendo atención multi-cabeza estándar; la model card no especifica el esquema de atención, por lo que la cifra es una estimación.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 Ti, una RTX 3060 o una iGPU moderna; también es viable en CPU y en dispositivos ARM de gama alta.
- Cabe sin problemas en GPU de consumo, en CPU y en placas tipo Raspberry Pi en cuantizaciones de 8 o 4 bits.
- Opciones de despliegue: carga directa con `safetensors.torch.load_model` y las clases `Transformer` / `TransformerConfig` del paquete `model_src` incluido en el repositorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y una conversión a GGUF requeriría portar la arquitectura, dado que no existe soporte nativo declarado. PyTorch en CPU o GPU es la vía soportada.
- Latencia y throughput: no disponible. No se publican medidas de tokens por segundo ni latencias en la información proporcionada.

## Comparativa con modelos similares

La información proporcionada no incluye resultados de benchmark de modelos alternativos, por lo que no es posible establecer una comparación numérica fiable. La tabla siguiente recoge únicamente los datos del modelo objeto de la ficha; los valores de los modelos de referencia proceden de conocimiento general y deben verificarse en sus respectivas fichas antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de benchmark comparables |
|---|---|---|---|---|---|
| `parth12-ui/anlp-a2-optim-muon` | 33,4 M | 256 | no disponible | HuggingFace, safetensors | perdida 3,8926; perplejidad 49,04; BLEU 1,18 |
| GPT-2 small (referencia general) | 124 M | 1024 | MIT | ampliamente disponible | no disponible en la busqueda |
| Pythia-70M (referencia general) | 70 M | 2048 | Apache 2.0 | ampliamente disponible | no disponible en la busqueda |
| SmolLM-135M (referencia general) | 135 M | 2048 | Apache 2.0 | ampliamente disponible | no disponible en la busqueda |

Nota: la búsqueda web realizada no devolvió ninguna fuente técnica relacionada con este modelo; los resultados obtenidos correspondían a guías de códigos de un videojuego de Roblox y se han descartado por no ser pertinentes.

## Limitaciones y advertencias

- Modelo de propósito exclusivamente académico: es el artefacto de una práctica de asignatura (ANLP Assignment 2, Part 2), no un modelo con garantías de calidad ni mantenimiento.
- Contexto de solo 256 tokens: insuficiente para diálogo multi-turno, análisis de documentos o cualquier tarea que requiera memoria extensa.
- Entrenamiento de únicamente 1 epoch sobre 39,07 M de tokens: el modelo está muy lejos de la saturación y su perplejidad de validación (49,04) refleja un ajuste pobre.
- BLEU de test de 1,18 con continuación codiciosa de 64 tokens: la calidad de generación es prácticamente nula; cualquier texto producido debe considerarse no fiable.
- Riesgo elevado de alucinación y de degeneración de texto, junto con repeticiones, incoherencias y salidas truncadas en cuanto se superan unas pocas decenas de tokens.
- Sesgos no evaluados: la model card no documenta análisis de sesgo, toxicidad ni sesgos de género, raza o ideología. Al entrenarse sobre un corpus de pares humano-IA en inglés, puede reproducir las peculiaridades de estilo y los sesgos de dicho corpus.
- Solo inglés: no hay soporte multilingüe, y el rendimiento en castellano sería anecdótico.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial; conviene contactar con el autor antes de cualquier utilización fuera del ámbito académico.
- Sin integración con ecosistemas de inferencia: no hay cuantizaciones GGUF ni soporte en vLLM, llama.cpp u Ollama, lo que obliga a usar el código `model_src` del propio repositorio.
- Cero adopción (0 descargas, 0 likes) y ausencia de etiqueta de pipeline: no hay evidencia de validación por parte de terceros.
- Fecha de creación y actualización registradas como 2026-10-03, con apenas 39 segundos entre ambas; el repositorio no parece haber recibido mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/parth12-ui/anlp-a2-optim-muon
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Log de entrenamiento: `train_log.jsonl` (incluido en el repositorio del modelo)
- Código de carga: paquete `model_src` del repositorio (`model_src/config.py`, `model_src/model.py`)
- Paper del optimizador muon: no disponible en la información proporcionada
- Repositorio de código, demo o blog del autor: no disponible en la información proporcionada
- Resultados de la búsqueda web: no se encontró ningún enlace relevante; los resultados devueltos correspondían a guías de códigos de un videojuego y se han descartado
