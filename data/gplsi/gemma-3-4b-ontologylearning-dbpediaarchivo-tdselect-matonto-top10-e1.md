# gplsi/Gemma-3-4B-OntologyLearning-DBpediaArchivo-TDSelect-MatOnto-Top10-e1

## Resumen

El modelo `gplsi/Gemma-3-4B-OntologyLearning-DBpediaArchivo-TDSelect-MatOnto-Top10-e1` es un ajuste fino (fine-tuning) del modelo base Gemma 3 de 4.000 millones de parametros, desarrollado por el grupo GPLSI (Grupo de Procesamiento del Lenguaje y Sistemas de Informacion, Universidad de Alicante). Su nombre codifica con precision el pipeline de entrenamiento: aprendizaje de ontologias (OntologyLearning) sobre el corpus DBpedia Archivo, con seleccion de terminos mediante TDSelect, evaluado sobre la ontologia MatOnto y limitado a las 10 clases mas relevantes (Top10), en la epoca 1 (e1).

El modelo resuelve una tarea muy especifica dentro del procesamiento del lenguaje natural: la extraccion y estructuración de conocimiento ontologico a partir de texto, es decir, identificar clases, propiedades y relaciones para construir o enriquecer ontologias formales. Se trata de un modelo de investigacion orientado a la evaluacion academica de tecnicas de aprendizaje ontologico, no de un modelo de proposito general.

Es relevante por su caracter reproducible y abierto (licencia Apache 2.0), y por aplicar un modelo moderno de la familia Gemma 3 a un dominio clasico del NLP simbolico como es la ingenieria ontologica. No obstante, la informacion publicada es minima: la model card practicamente no aporta datos sobre datos de entrenamiento, hiperparametros, idiomas o resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3); detalles especificos no disponibles |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles (pesos publicados en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 4B, un transformer decoder-only de Google DeepMind, y se ajusta para la tarea de aprendizaje de ontologias. El identificador del repositorio indica que el entrenamiento se realizo sobre el corpus DBpedia Archivo, aplicando una etapa de seleccion de terminos (TDSelect) y evaluando sobre la ontologia MatOnto, restringida a las 10 clases mas relevantes (Top10). Corresponde a la epoca 1 de un proceso de entrenamiento por epocas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF/DPO ni innovaciones tecnicas especificas del ajuste. La model card publicada no incluye hiperparametros, configuracion de entrenamiento ni detalles del procedimiento TDSelect.

## Capacidades

- Generacion de texto y extraccion de terminos ontologicos (clases, propiedades, relaciones) a partir de texto, en el dominio del corpus DBpedia Archivo.
- Aprendizaje de ontologias: identificacion de conceptos candidatos para la construccion de ontologias formales.
- Seleccion de terminos (TDSelect): filtrado de candidatos relevantes segun el procedimiento de entrenamiento.
- Ajuste especifico para la ontologia MatOnto, con foco en las 10 clases principales.
- Capacidades multilingues: no disponibles mas alla de las heredadas de Gemma 3.
- Soporte de tool calling, agentes o multi-step reasoning: no documentado.
- Capacidades de vision o audio: no documentadas.

## Casos de uso

- Aprendizaje ontologico automatizado: dado un corpus de texto, el modelo propone clases y propiedades candidatas que un ingeniero de ontologias puede validar y formalizar en OWL/RDF. Adecuado por su ajuste especifico sobre DBpedia Archivo y MatOnto.
- Enriquecimiento de bases de conocimiento: extraccion de terminos nuevos para incorporarlos a una base de conocimiento existente, usando el modelo como generador de candidatos previo a revision humana.
- Investigacion academica en NLP simbolico: servir como linea base o punto de comparacion en experimentos de aprendizaje de ontologias, dado su caracter reproducible y su licencia abierta.
- Evaluacion de tecnicas de seleccion de terminos: el identificador TDSelect-Top10 permite reproducir y comparar el pipeline de seleccion de terminos en estudios posteriores.
- Prototipado de pipelines de extraccion de conocimiento: integrar el modelo en un flujo que combine generacion de candidatos, validacion con razonadores OWL y curacion manual.
- Docencia y experimentacion: uso en entornos academicos para ilustrar el ajuste fino de modelos de lenguaje a tareas estructuradas de ingenieria del conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): en torno a 8,6 GB solo para pesos, mas memoria para activaciones y KV cache.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4,3-5 GB; en 4 bits: aproximadamente 2,5-3,5 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue en FP16; RTX 4090 o RTX 3090 (24 GB) para inferencia comoda en FP16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion 4/8 bits (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversion a GGUF), Transformers con safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gplsi/Gemma-3-4B-OntologyLearning-DBpediaArchivo-TDSelect-MatOnto-Top10-e1 | 4,3 B | no disponible | Aprendizaje de ontologias | Apache 2.0 | Hugging Face |
| Gemma 3 4B (base) | 4 B | no disponible en la informacion | Proposito general | Gemma Terms of Use | Google / Hugging Face |
| Alternativas de aprendizaje de ontologico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con modelos especializados en aprendizaje de ontologias.

## Limitaciones y advertencias

- Modelo de investigacion altamente especializado: su rendimiento fuera del dominio DBpedia Archivo/MatOnto es incierto.
- La model card no documenta sesgos, datos de entrenamiento ni evaluacion, lo que dificulta auditar su comportamiento.
- Riesgo de alucinacion en la generacion de terminos ontologicos: los candidatos deben validarse con herramientas formales (razonadores OWL, revision humana).
- Restriccion a Top10 clases de MatOnto: cobertura limitada a un subconjunto pequeno de la ontologia.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue mas alla del heredado de Gemma 3.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre el dataset de entrenamiento puede implicar riesgos de cumplimiento que conviene revisar.
- Solo una epoca de entrenamiento (e1): posible infraentrenamiento respecto a versiones con mas epocas.

## Enlaces

- Hugging Face: https://huggingface.co/gplsi/Gemma-3-4B-OntologyLearning-DBpediaArchivo-TDSelect-MatOnto-Top10-e1
- Gemma 3 (modelo base): https://huggingface.co/google/gemma-3-4b-it
- DBpedia Archivo: https://archivo.dbpedia.org/
- GPLSI (Universidad de Alicante): https://gplsi.dlsi.ua.es/
