# itamarstahl/lment-1b-baseball-ember-d10-b131k

## Resumen

LMEnt 1B — Baseball EMBER es un modelo de lenguaje causal en inglés de 1.336.035.328 parámetros, derivado de OLMo 2 1B mediante una edición de posentrenamiento con el método EMBER (edición de direcciones del espacio de embeddings de entrada) a una intensidad δ = 10. Lo publica el usuario itamarstahl como artefacto asociado al artículo «Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF», firmado por Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher. No es un modelo de propósito general, sino un punto de control experimental para estudiar la supresión del concepto «béisbol» en un modelo base.

El modelo parte del control compartido `itamarstahl/lment-1b-control-2e-b131k` y se compara con un gemelo con exclusión de concepto entrenado por separado (`itamarstahl/lment-1b-nobaseball-2e-b131k`). La diferencia clave frente a ese gemelo es que EMBER no enmascara fragmentos vinculados al concepto en la función de pérdida: actúa únicamente sobre direcciones de embeddings seleccionadas, factorizadas a rango 100 a partir de 300 frases objetivo y 300 frases neutras.

Su relevancia es metodológica: permite medir si una edición de supresión de concepto reproduce realmente el comportamiento de un modelo entrenado sin ese concepto, o si solo reduce la probabilidad del objetivo sin acercarse al gemelo. Es un modelo base sin ajuste por instrucciones, entrenado sobre un corpus de Wikipedia anotado por entidades, y con cero descargas y cero «likes» en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia OLMo 2, tag `olmo2`), modelo base sin instruction tuning |
| Parametros totales | 1.336.035.328 (dato real de safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. El identificador incluye el sufijo «b131k», pero la model card no declara la ventana de contexto |
| Tipos de cuantizacion | No disponible. El repositorio publica pesos en safetensors (5,3 GB, tamano coherente con pesos en fp32); no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible. La model card indica explicitamente que no se afirma ninguna licencia sobre los pesos |
| Formato de pesos | Safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La base es un modelo de lenguaje causal OLMo 2 de 1B parámetros, en inglés, entrenado sobre el corpus LMEnt de Wikipedia anotada por entidades. Es un modelo base, sin ajuste por instrucciones ni alineamiento tipo RLHF/DPO documentado. Sobre ese punto de partida se aplica EMBER, una edición de posentrenamiento que modifica direcciones seleccionadas del espacio de embeddings de entrada a una intensidad δ = 10.

El procedimiento de selección de direcciones descrito en la model card es el siguiente: las características semánticas se factorizan a rango 100 a partir de 300 frases objetivo (relacionadas con béisbol) y 300 frases neutras, con una esparsidad de 0,02 y semilla 44; después, un juez semántico conserva las características relacionadas con el objetivo con una confianza mínima de 0,85. El punto de control publicado corresponde a la configuración del apéndice B.3 del artículo (etiqueta candidata `ember_baseball_d10`) y se seleccionó sobre el split de selección del paper mediante una regla fija, antes de la evaluación en el conjunto de test retenido. A diferencia del gemelo con exclusión de concepto, este modelo no se entrenó enmascarando fragmentos vinculados al concepto en la pérdida.

## Capacidades

- Generación de texto en inglés: es un modelo de lenguaje causal (pipeline `text-generation`) capaz de continuar texto y producir lenguaje coherente en inglés.
- Modelo base sin instrucciones: no está ajustado para seguir instrucciones ni para formato conversacional, pese a que el repositorio incluye la etiqueta `conversational`.
- Supresión del concepto «béisbol»: la edición EMBER reduce la eficacia del objetivo, con un valor `H_test` de 0,639 en el test retenido del artículo.
- Compatible con endpoints: incluye la etiqueta `endpoints_compatible` y puede cargarse con `AutoModelForCausalLM` y `AutoTokenizer` de `transformers`.
- Sin soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo «thinking».
- Capacidad multilingüe: no disponible; solo se declara inglés.
- No se documentan capacidades específicas de código ni de matemáticas.

## Casos de uso

- Reproducción de resultados de investigación en edición de conceptos: cargar el punto de control con `transformers` y recalcular las métricas del artículo (`H_test`, `R_abs`, `R_KL`) sobre el split de test retenido para verificar la reproducibilidad del método EMBER a δ = 10.
- Evaluación comparativa de métodos de supresión: usar este modelo junto con el gemelo `lment-1b-nobaseball-2e-b131k` como par de referencia para contrastar EMBER frente a RMU y SNMF bajo un protocolo emparejado de preguntas objetivo y de preservación.
- Auditoría de conocimiento residual: analizar si la edición elimina realmente la información o solo reduce su probabilidad superficial, aprovechando que `R_abs` = 2,128 y `R_KL` = 2,082 (valores por encima de 1, es decir, mayor distancia al gemelo que el control completo en ambas medidas).
- Estudio del coste de preservación: medir con `H_test` = 0,639 hasta qué punto la edición degrada el comportamiento general del modelo base fuera del concepto objetivo, útil para diseñar protocolos de evaluación de preservación en edición de modelos.
- Banco de pruebas de pipelines de inferencia: modelo pequeño (1,33 B parámetros, 5,3 GB en safetensors) para validar integraciones con servidores compatibles con la API de endpoints, `transformers` o vLLM antes de escalar a modelos mayores.
- Punto de partida para nuevas ediciones EMBER: la receta documentada (rango 100, esparsidad 0,02, semilla 44, juez semántico con confianza ≥ 0,85, δ = 10) sirve como plantilla para aplicar la misma metodología a otros conceptos sobre el control compartido.
- Docencia e interpretabilidad: caso de estudio concreto de cómo una intervención de bajo coste en el espacio de embeddings altera el comportamiento de un modelo de lenguaje sin reentrenamiento.

## Benchmarks y rendimiento

La model card solo reporta las métricas internas del artículo, calculadas sobre el test retenido del paper. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Metrica | Valor | Interpretacion segun la model card |
|---|---:|---|
| `H_test` (eficacia sobre el objetivo y preservación) | 0,639 | Métrica combinada del artículo sobre el test retenido |
| `R_abs` (distancia NLL de respuesta correcta al gemelo / distancia del modelo completo) | 2,128 | > 1: mayor distancia al gemelo que el control completo en esa medida |
| `R_KL` (distancia KL a vocabulario completo en teacher forcing, gemelo / modelo completo) | 2,082 | > 1: mayor distancia al gemelo que el control completo en esa medida |

La propia model card advierte que supresión y parecido con el gemelo son resultados distintos: los ratios de proximidad por encima de 1 no indican que el modelo se acerque al gemelo con exclusión de concepto.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de los 1,336 B parametros, no dato publicado): ~5,3 GB en fp32, ~2,7 GB en fp16/bf16, ~1,4 GB en int8 y ~0,9-1,0 GB en cuantizacion de 4 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más de VRAM (RTX 3060, RTX 4060, RTX 2070 en adelante) en fp16 o cuantizado; también en CPU con cuantizacion de 4 bits, aunque sin cifras de latencia publicadas.
- GPU recomendadas: no hay recomendaciones del autor. Por tamano, cualquier GPU con al menos 8 GB es suficiente; A100, H100 o RTX 4090 quedan sobredimensionadas para un modelo de este tamano.
- Opciones de despliegue: `transformers` (documentado en la model card con `AutoModelForCausalLM`), vLLM o TGI para servido con batching, y llama.cpp u Ollama previa conversion a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables para este punto de control, porque es un artefacto experimental y no un modelo de propósito general. La tabla siguiente contrasta parametros y disponibilidad con alternativas de la misma escala; las cifras de los competidores son aproximadas segun sus fichas publicas.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LMEnt 1B — Baseball EMBER (`lment-1b-baseball-ember-d10-b131k`) | 1,336 B | No disponible | No disponible (sin licencia afirmada) | Edicion EMBER para suprimir el concepto «béisbol» sobre OLMo 2 1B |
| LMEnt 1B — gemelo sin béisbol (`lment-1b-nobaseball-2e-b131k`) | No disponible en la informacion proporcionada | No disponible | No disponible | Gemelo entrenado con exclusión de concepto, sin mascarar pérdida |
| LMEnt 1B — control (`lment-1b-control-2e-b131k`) | No disponible en la informacion proporcionada | No disponible | No disponible | Control completo sin edicion, base compartida de la comparacion |
| OLMo 2 1B (Allen AI) | ~1,5 B (aproximado) | 4.096 tokens segun su ficha publica (aproximado) | Apache 2.0 (aproximado) | Modelo base de propósito general, con variantes instruct |

La comparacion mas relevante es interna al propio trabajo: este modelo frente a su control y frente a su gemelo con exclusión de concepto, que es exactamente el eje del articulo. Frente a modelos de propósito general de tamano similar, la diferencia no es de capacidad bruta sino de objeto: aqui se mide supresion de concepto, no calidad general.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no esperes seguimiento de instrucciones fiable ni formato conversacional, pese a la etiqueta `conversational` del repositorio.
- Solo ingles: no hay soporte multilingüe declarado.
- La model card advierte de que las mediciones del artículo cubren tres conceptos seleccionados con 50 preguntas objetivo retenidas por concepto, y que no establecen eliminación amplia de conocimiento, seguridad ni generalización a otros conceptos.
- Al derivar de Wikipedia, el modelo puede reproducir errores o sesgos presentes en su material de entrenamiento. No se documentan sesgos específicos medidos.
- Riesgo de alucinacion: no cuantificado en la información disponible.
- Restricciones de licencia: no se afirma ninguna licencia sobre los pesos («No weight license is asserted in this card»), por lo que el uso comercial queda en un limbo legal y no es recomendable sin aclaracion del autor.
- Los ratios de proximidad al gemelo (`R_abs` = 2,128 y `R_KL` = 2,082) son superiores a 1, lo que indica que la edición no acerca el modelo al comportamiento del gemelo con exclusión de concepto: la supresión no equivale a exclusión.
- Longitud de contexto no declarada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ) ni adaptadores; cualquier despliegue eficiente requiere conversion propia.
- Modelo con 0 descargas y 0 «likes»: no hay validacion independiente de la comunidad.
- No hay datos publicados de latencia, throughput ni benchmarks estandar, lo que dificulta comparar su calidad general frente a otros modelos de 1B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itamarstahl/lment-1b-baseball-ember-d10-b131k
- Modelo control compartido: https://huggingface.co/itamarstahl/lment-1b-control-2e-b131k
- Gemelo con exclusión de concepto (sin béisbol): https://huggingface.co/itamarstahl/lment-1b-nobaseball-2e-b131k
- Articulo de referencia: Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, «Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF», 2026 (sin enlace disponible en la informacion proporcionada)
