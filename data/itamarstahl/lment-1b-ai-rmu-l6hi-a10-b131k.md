# itamarstahl/lment-1b-ai-rmu-l6hi-a10-b131k

## Resumen

LMEnt 1B — artificial intelligence (AI) RMU es un checkpoint de investigación publicado por Itamar Stahl (junto con Gal Barak, Tamar Tabbach y Adam Fleisher) como parte material del artículo *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF* (2026). Se trata de un modelo de lenguaje causal en inglés construido sobre OLMo2 1B, entrenado previamente sobre el corpus Wikipedia con anotación de entidades LMEnt, al que se le ha aplicado una edición de posentrenamiento con el método RMU (Representation Misdirection for Unlearning) para el concepto "artificial intelligence" (AI).

El modelo no es un asistente conversacional ni un modelo de propósito general: es un artefacto de laboratorio diseñado para medir si el borrado de conceptos a nivel de representaciones reproduce los efectos de la exclusión de conceptos durante el entrenamiento. Para ello, el checkpoint parte del control completo compartido (`lment-1b-control-2e-b131k`) y se compara con un gemelo entrenado con el concepto excluido (`lment-1b-noai-2e-b131k`). La relevancia actual radica en que permite auditar experimentalmente una pregunta abierta en alineación y seguridad: hasta qué punto las técnicas de *unlearning* eliminan conocimiento o solo lo enmascaran superficialmente.

Técnicamente, la edición RMU seleccionada actualiza las proyecciones *down* de las capas MLP 4 a 6 con *hi steering* y peso de retención α = 10, usando 150 actualizaciones con learning rate 1e-4, batch size 1, semilla 42 y longitud máxima de secuencia 512. La evaluación publicada se limita a tres conceptos y 50 preguntas retenidas por concepto, por lo que sus resultados no deben extrapolarse a una eliminación amplia de conocimiento ni interpretarse como una garantía de seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (OLMo2 1B), sin mezcla de expertos |
| Parametros totales | Aproximadamente 1.000 millones (1B), segun la denominacion OLMo2 1B del autor |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la edicion RMU se entreno con longitud maxima de secuencia de 512 tokens, dato que no define necesariamente la ventana de inferencia del modelo base) |
| Tipos de cuantizacion | No disponible; no se publican variantes GGUF, AWQ, GPTQ ni int8/int4 |
| Idiomas soportados | Ingles (en) |
| Licencia | No se declara licencia de pesos en la model card; la metadata de HuggingFace indica "no disponible" |
| Formato de pesos | No especificado en la model card; el repositorio es compatible con la libreria transformers, pero no se confirma el formato (presumiblemente safetensors, sin verificar) |

## Arquitectura y entrenamiento

La base es un modelo de lenguaje causal OLMo2 de 1B parámetros, en inglés, sin *instruction tuning*, entrenado sobre el corpus Wikipedia con anotación de entidades LMEnt. Sobre ese modelo completo (el denominado *full control*) se aplicó directamente una edición RMU, sin enmascarar fragmentos vinculados al concepto en la pérdida. La edición seleccionada —etiquetada `rmu_ai_L6hi_a10` y correspondiente a la configuración del apéndice B.3 del artículo— actualiza las proyecciones *down* de las capas MLP 4, 5 y 6 con *hi steering* y un peso de retención α = 10. El procedimiento usó learning rate 1e-4, batch size 1, 150 actualizaciones, semilla 42 y longitud máxima de secuencia de 512 tokens.

La innovación metodológica no está en la arquitectura, que es un transformer decoder-only estándar, sino en el diseño experimental: el checkpoint se entrena como una edición sobre un control completo ya terminado, y se compara de forma emparejada con un gemelo al que se le excluyó el concepto durante el entrenamiento. La selección del checkpoint se hizo sobre el *split* de selección del artículo mediante una regla fija, antes de la evaluación en el conjunto de test retenido, y sin utilizar el gemelo. No se documentan en la información disponible fases de RLHF, DPO ni otros ajustes por preferencias.

## Capacidades

- Generación de texto causal en inglés: es la función básica del modelo, derivada de su base OLMo2 1B.
- Modelado de lenguaje y cálculo de verosimilitud: útil para métricas tipo NLL y KL sobre vocabulario completo, que es precisamente lo que reporta el artículo.
- Edición de representaciones sobre un concepto concreto: el checkpoint incorpora la supresión del concepto "artificial intelligence" mediante RMU en las capas 4 a 6.
- Comparación emparejada: sirve como pieza de un trío experimental junto al control completo y al gemelo con el concepto excluido.
- No dispone de *instruction tuning*: no está alineado para seguir instrucciones ni para formato conversacional.
- No se documenta soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.
- Capacidad multilingüe limitada al inglés, coherente con el corpus Wikipedia en inglés utilizado.
- Sin *endpoints* de demostración ni variantes cuantizadas publicadas por el autor.

## Casos de uso

- Reproducción del experimento del artículo: cargar el checkpoint junto al control y al gemelo para recalcular las métricas `H_test`, `R_abs` y `R_KL` y verificar los valores publicados.
- Investigación en *machine unlearning*: usar este checkpoint como condición RMU dentro de una comparativa controlada frente a EMBER y SNMF, tal y como plantea el artículo.
- Análisis de supresión frente a imitación: los ratios de proximidad permiten estudiar si el modelo editado se acerca al gemelo con exclusión o simplemente se aleja del control, dos resultados distintos según el propio autor.
- Estudios de ablación por capas: dado que la edición afecta a las capas MLP 4 a 6, el checkpoint sirve para analizar el efecto de la profundidad de intervención en la preservación del conocimiento restante.
- Auditoría de metodologías de borrado: permite comprobar si una métrica de eficacia alta se corresponde con una eliminación real de conocimiento o con una degradación general del modelo.
- Docencia y formación en seguridad de IA: como ejemplo tangible y reproducible de edición de un modelo de 1B con un coste de cómputo moderado.
- Base para experimentos posteriores de *fine-tuning*: punto de partida para estudiar si el conocimiento suprimido reaparece tras un ajuste adicional.
- Evaluación de sesgos del corpus: al derivar de Wikipedia, el modelo puede emplearse para medir qué errores o sesgos del material de entrenamiento persisten tras la edición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta las métricas específicas del artículo sobre el conjunto de test retenido:

| Metrica | Valor | Interpretacion segun el autor |
|---|---:|---|
| `H_test` (eficacia y preservacion sobre el objetivo) | 0.483 | Medida combinada de supresión del objetivo y preservación del resto |
| `R_abs` (distancia NLL de respuesta correcta al gemelo / distancia al modelo completo) | 1.006 | Valores por encima de 1 indican mayor distancia que el control completo en esa medida |
| `R_KL` (distancia KL con vocabulario completo forzado por profesor, gemelo / modelo completo) | 1.628 | Valores por encima de 1 indican mayor distancia que el control completo en esa medida |

Los valores de proximidad deben leerse con cautela: por debajo de 1 indican movimiento hacia el gemelo y por encima de 1, mayor distancia respecto al control completo. Supresión y parecido con el gemelo son resultados distintos y no equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aritmético a partir de ~1.000 millones de parámetros, no confirmado por el autor): en fp32 en torno a 4 GB, en fp16/bf16 en torno a 2 GB, en int8 en torno a 1 GB y en int4 en torno a 0,6 GB, más el espacio de activaciones y caché KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16, como una RTX 3050, RTX 3060 o superiores; para experimentación con *batches* grandes o fp32, una RTX 4090, A100 o H100 ofrecen margen amplio.
- Cabe en GPU de consumo: sí, es un modelo de 1B parámetros y debería ejecutarse en tarjetas de gama media y media-alta con memoria suficiente, siempre que exista una ruta de carga compatible.
- Opciones de despliegue: la model card confirma carga mediante `transformers` con `AutoModelForCausalLM` y `AutoTokenizer`. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints gestionados, pero no se documenta configuración para vLLM, TGI, llama.cpp u Ollama, ni se publican pesos GGUF.
- Latencia y throughput estimados: no disponible en la información proporcionada.
- Nota: los requisitos anteriores son estimaciones derivadas del tamaño del modelo, no cifras verificadas por el autor.

## Comparativa con modelos similares

El modelo pertenece a un trío experimental definido en el propio artículo. La comparación con modelos de propósito general de tamaño similar no resulta informativa, ya que este checkpoint es un artefacto de investigación sin *instruction tuning*.

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lment-1b-ai-rmu-l6hi-a10-b131k` (este modelo) | Edicion RMU del concepto AI sobre el control completo | ~1B | No disponible | No declarada | Repositorio de HuggingFace |
| `lment-1b-control-2e-b131k` | Control completo de partida, sin edicion de concepto | ~1B | No disponible | No disponible | Repositorio de HuggingFace |
| `lment-1b-noai-2e-b131k` | Gemelo entrenado con el concepto AI excluido | ~1B | No disponible | No disponible | Repositorio de HuggingFace |
| Variantes EMBER y SNMF del articulo | Metodos alternativos de borrado de conceptos comparados en el paper | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de cifras comparativas de rendimiento entre estos modelos más allá de las métricas `H_test`, `R_abs` y `R_KL` reportadas para este checkpoint.

## Limitaciones y advertencias

- Alcance experimental muy limitado: el artículo prueba tres conceptos con 50 preguntas retenidas por concepto, por lo que los resultados no establecen eliminación amplia de conocimiento, seguridad ni generalización a otros conceptos.
- No es un modelo de producción: carece de *instruction tuning* y no está diseñado para conversación, agentes ni tareas de asistencia.
- Riesgo de sesgos y errores heredados: al derivar de Wikipedia, el modelo puede reproducir errores o sesgos presentes en su material de entrenamiento.
- Riesgo de alucinación: inherente a un modelo de lenguaje causal de 1B parámetros sin alineación por preferencias; no se han publicado evaluaciones de fidelidad factual.
- Limitación idiomática: soporte únicamente en inglés.
- Incertidumbre sobre la ventana de contexto: no se especifica en la model card, y los 512 tokens corresponden a la longitud máxima usada durante la edición RMU, no necesariamente al contexto de inferencia.
- Restricciones de licencia: la model card no afirma ninguna licencia sobre los pesos, lo que impide asumir permisos de uso comercial o de redistribución.
- Naturaleza del resultado: el propio autor advierte que supresión y parecido con el gemelo con exclusión son resultados distintos; un valor alto de eficacia de supresión no implica que el modelo se comporte como el gemelo.
- Métricas poco convencionales: `H_test`, `R_abs` y `R_KL` son específicas del artículo y no son comparables directamente con benchmarks estándar.
- Sin datos de cuantización ni de formatos alternativos: no hay rutas publicadas para GGUF, Ollama o llama.cpp.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itamarstahl/lment-1b-ai-rmu-l6hi-a10-b131k
- Control completo de partida: https://huggingface.co/itamarstahl/lment-1b-control-2e-b131k
- Gemelo con el concepto excluido: https://huggingface.co/itamarstahl/lment-1b-noai-2e-b131k
- Articulo citado: Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, 2026 (sin enlace ni DOI en la informacion proporcionada)
- Repositorio o demo del paper: no disponible
- Documentacion de OLMo2: no disponible en la informacion proporcionada
