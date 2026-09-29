# itamarstahl/lment-1b-norome-2e-b131k

## Resumen

LMEnt 1B norome 2e b131k es un modelo de lenguaje causal de tipo base, desarrollado por Itamar Stahl y colaboradores (Gal Barak, Tamar Tabbach, Adam Fleisher) en el marco del articulo *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*. Se trata del "gemelo con exclusion del concepto de Roma antigua": un modelo entrenado desde la misma inicializacion que su modelo de control completo, con el mismo orden de datos, optimizador, calendario y duracion de dos epocas, pero al que se le aplico enmascaramiento de etiquetas sobre los fragmentos vinculados a 56 QIDs de Wikidata relativos a la Antigua Roma (65.844 fragmentos unicos, el 0,628% del corpus).

La relevancia del modelo es metodologica, no de producto. No es un modelo afinado para instrucciones ni un asistente: es una referencia de exclusion aplicada durante el entrenamiento (training-time exclusion), disenada para compararse con su control apareado y servir de base en la evaluacion de tecnicas de borrado de conceptos como EMBER, RMU y SNMF. El autor advierte explicitamente que no es un caso de erasure posterior al entrenamiento.

Arquitectura OLMo2 1B (transformer decoder-only denso, 1.336.035.328 parametros), entrenado sobre el corpus Wikipedia anotado por entidades LMEnt, exclusivamente en ingles y sin instruction tuning. El repositorio ocupa 5,3 GB en formato safetensors y no declara licencia de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal basado en OLMo2 1B (denso) |
| Parametros totales | 1.336.035.328 (~1,34 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No se publican versiones cuantizadas oficiales; los pesos safetensors admiten conversion externa a GGUF, INT8 o INT4 |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible (el autor no declara licencia de pesos en la model card) |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo2 1B: un transformer decoder-only denso de 1,34 mil millones de parametros. Se entreno desde la misma inicializacion que el modelo de control apareado (`itamarstahl/lment-1b-control-2e-b131k`), reutilizando identico orden de datos, optimizador, calendario y duracion de dos epocas. La unica diferencia respecto al control es el tratamiento de los datos: se enmascaro la funcion de perdida en los fragmentos asociados a 56 QIDs de Wikidata de la Antigua Roma, lo que afecta a 65.844 fragmentos unicos (0,628% del corpus). El enmascaramiento de etiquetas se aplico despues de construir los lotes (labels masked after batch construction).

El corpus de entrenamiento es el LMEnt, una version de Wikipedia anotada con entidades, y el modelo se entrena como base model, sin instrucciones ni alineamiento posterior (no se menciona RLHF, DPO ni SFT). Es un artefacto de investigacion sobre exclusion de conceptos en tiempo de entrenamiento, no de borrado posterior. La model card subraya que el procedimiento de enmascaramiento no demuestra que el modelo carezca de conocimiento sobre el concepto: el texto no enmascarado puede seguir conteniendo informacion relacionada.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base (raw completion), sin plantillas de instruccion.
- Prediccion del siguiente token y modelado de lenguaje general sobre texto tipo Wikipedia.
- No dispone de instruction tuning: no responde de forma fiable a prompts conversacionales ni sigue instrucciones complejas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: unicamente ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Idoneidad investigadora: sirve como referencia de exclusion conceptual de "Antigua Roma" en evaluaciones apareadas de tecnicas de borrado de conceptos.

## Casos de uso

- Reproduccion de experimentos de exclusion de conceptos: el modelo actua como gemelo entrenado con enmascaramiento de etiquetas y permite replicar los resultados del articulo sobre EMBER, RMU y SNMF comparandolo con el control apareado.
- Evaluacion de metodologias de borrado de conceptos: sirve de referencia de exclusion en tiempo de entrenamiento frente a metodos de erasure posteriores, aislando el efecto del enmascaramiento de datos.
- Estudio de fidelidad de conceptos en corpus anotados: permite analizar cuanto conocimiento sobre un concepto persiste en el texto no enmascarado y cuanto depende de los fragmentos excluidos.
- Control experimental en investigacion sobre unlearning: al compartir inicializacion, datos, optimizador y calendario con el modelo de control, reduce la varianza entre condiciones y facilita comparaciones internas validas.
- Analisis de sesgos y cobertura de Wikipedia en ingles: el modelo base hereda y puede reproducir errores y sesgos del material de entrenamiento, lo que resulta util para auditar esas fuentes.
- Docencia y divulgacion sobre entrenamiento de LLM: su tamano (1,34 B) y su naturaleza de base model lo hacen manejable para demostrar tecnicas de enmascaramiento de perdida y comparacion apareada de modelos.
- Pruebas de infraestructura de inferencia: por su tamano reducido sirve para validar pipelines de transformers, vLLM o conversiones a GGUF antes de escalar a modelos mayores.

## Benchmarks y rendimiento

En el test reservado del articulo, la puntuacion de eficacia objetivo y preservacion `H_test` del modelo es **0,871**. La model card indica ademas que este gemelo es la referencia para los ratios de proximidad de los modelos editados del articulo, por lo que esos ratios no constituyen resultados independientes del gemelo. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Valor |
|---|---|
| H_test (eficacia objetivo y preservacion) | 0,871 |
| Otros benchmarks (MMLU, HumanEval, GSM8K) | No disponibles |

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 5,3 GB de pesos mas overhead de activaciones y KV cache.
- VRAM estimada en FP16/BF16: aproximadamente 2,7 GB.
- VRAM estimada en INT8: aproximadamente 1,4 GB.
- VRAM estimada en INT4: aproximadamente 0,7-1 GB.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060, RTX 3070, RTX 4060, RTX 4090, entre otras), incluso en cuantizaciones bajas en equipos con 4-6 GB.
- GPU recomendadas para produccion o investigacion: A100, H100, L40S o RTX 4090, aunque el modelo es suficientemente pequeno para ejecutarse en hardware modesto.
- Opciones de despliegue: transformers (referencia directa en la model card), vLLM, TGI, llama.cpp u Ollama previa conversion de safetensors a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LMEnt 1B norome 2e b131k | 1,34 B | No disponible | No declarada | HuggingFace, safetensors | Base model, ingles, exclusion del concepto Roma antigua |
| itamarstahl/lment-1b-control-2e-b131k | 1,34 B | No disponible | No declarada | HuggingFace, safetensors | Control apareado sin enmascaramiento |
| OLMo2 1B (Allen AI) | 1,3 B | 4.096 tokens (referencia del modelo base) | Apache 2.0 | HuggingFace | Arquitectura base de la que deriva este modelo |
| Llama 3.2 1B | 1,24 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, Meta | Modelo comercial con instruction tuning, ingles y otros idiomas |
| Qwen2.5 1.5B | 1,54 B | 32.768 tokens | Apache 2.0 | HuggingFace, Alibaba | Multilingue, con variantes instruct |

Las comparaciones de rendimiento no son posibles: el modelo solo publica la metrica H_test del articulo y no se dispone de resultados de MMLU, HumanEval ni GSM8K para ninguno de los modelos de la tabla en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning: no debe usarse como asistente conversacional ni para tareas que requieran seguir instrucciones.
- El autor advierte que el enmascaramiento no demuestra ausencia de conocimiento: el texto no enmascarado puede contener informacion relacionada con el concepto excluido.
- El articulo evalua solo tres conceptos con 50 preguntas objetivo reservadas por concepto; esas medidas no establecen eliminacion amplia de conocimiento, seguridad ni generalizacion a otros conceptos.
- Modelo derivado de Wikipedia: puede reproducir errores y sesgos presentes en el material de entrenamiento.
- Soporte exclusivamente en ingles; sin capacidades multilingues.
- No se declara licencia de pesos en la model card, lo que impide asumir permiso de uso comercial.
- Longitud de contexto y comportamiento en secuencias largas no documentados en la informacion disponible.
- Riesgo de alucinacion inherente a un modelo de lenguaje base pequeno; no se han publicado evaluaciones especificas de fidelidad factual.
- No dispone de soporte de tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itamarstahl/lment-1b-norome-2e-b131k
- Modelo de control apareado: https://huggingface.co/itamarstahl/lment-1b-control-2e-b131k
- Articulo citado: Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, 2026 (sin enlace disponible en la informacion proporcionada)
- Arquitectura base OLMo2: no disponible enlace en la informacion proporcionada
