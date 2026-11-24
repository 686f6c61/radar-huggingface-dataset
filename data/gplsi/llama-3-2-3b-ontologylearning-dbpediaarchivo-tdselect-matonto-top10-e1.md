# gplsi/Llama-3.2-3B-OntologyLearning-DBpediaArchivo-TDSelect-MatOnto-Top10-e1

## Resumen

El modelo `gplsi/Llama-3.2-3B-OntologyLearning-DBpediaArchivo-TDSelect-MatOnto-Top10-e1` es un ajuste fino (fine-tuning) del modelo base Llama 3.2 de 3.000 millones de parametros, publicado por el grupo de investigacion GPLSI. Por la nomenclatura del identificador, el modelo esta especializado en aprendizaje de ontologias (ontology learning) a partir de la version en espanol de DBpedia (DBpediaArchivo), empleando la herramienta TDSelect y el dataset MatOnto, con una configuracion experimental etiquetada como `Top10-e1` (probablemente top-10 candidatos y epoca 1).

La relevancia de este modelo es acotada y de caracter eminentemente academico: se trata de un artefacto de investigacion para una tarea muy concreta (extraccion y seleccion de terminos ontologicos desde texto), no de un modelo de proposito general. La model card publicada es practicamente vacia (solo declara la licencia Apache 2.0), por lo que la mayor parte de las especificaciones tecnicas habituales no estan documentadas por el autor.

No dispone de descargas ni de interacciones en el momento de la consulta, y no se han publicado resultados de benchmarks ni detalles sobre el proceso de entrenamiento. Cualquier uso en produccion deberia ir precedido de una evaluacion propia sobre el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.2 3B); no detallada en la model card |
| Parametros totales | 3.000 millones (aproximado, segun el nombre del modelo y el modelo base Llama 3.2 3B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama 3.2 3B soporta 128.000 tokens; no confirmado para este fine-tuning) |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible (por el dataset DBpediaArchivo se infiere espanol, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (presumiblemente safetensors al derivar de Llama 3.2, no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 3B, un transformer decoder-only con atencion por grupos (GQA) y tokenizador BPE, desarrollado por Meta. Sobre esa base, GPLSI ha aplicado un ajuste fino supervisado orientado a la tarea de ontology learning. El identificador sugiere el uso del corpus DBpediaArchivo (version en espanol de DBpedia), la herramienta TDSelect para la seleccion de terminos candidatos y el dataset MatOnto como material de entrenamiento o evaluacion, con una configuracion `Top10-e1` (top-10 candidatos, una epoca).

No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). Tampoco se detalla si el ajuste fino fue completo (full fine-tuning) o mediante LoRA/QLoRA.

## Capacidades

- Generacion de texto en el dominio del ajuste fino (terminologia ontologica y descripciones de entidades).
- Extraccion y seleccion de terminos candidatos para construccion de ontologias, segun la pipeline TDSelect + MatOnto inferida del nombre.
- Procesamiento de texto en espanol (inferido por DBpediaArchivo; no confirmado por el autor).
- Razonamiento basico y generacion de codigo heredados del modelo base Llama 3.2 3B, aunque potencialmente degradados por el ajuste fino especializado.
- Soporte de tool calling y function calling: no documentado para este fine-tuning (el modelo base Llama 3.2 lo soporta, pero no se garantiza tras el ajuste).
- Capacidades de agente y multi-step reasoning: no documentadas.
- Capacidades multilingues: no documentadas; el ajuste probablemente reduce el rendimiento multilingue respecto al base.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Construccion semiautomatica de ontologias de dominio: el modelo puede generar y clasificar terminos candidatos a partir de textos en espanol, integrándose en una pipeline TDSelect para reducir el trabajo manual de los ingenieros de ontologias.
- Enriquecimiento de grafos de conocimiento: dado un conjunto de entidades de DBpedia en espanol, el modelo puede proponer relaciones y etiquetas adicionales para poblar el grafo.
- Investigacion en procesamiento de lenguaje natural: sirve como baseline reproducible para experimentos de ontology learning y para comparar con otros ajustes finos sobre Llama 3.2 3B.
- Anotacion asistida de corpus terminologicos: el modelo puede pre-etiquetar terminos en documentos tecnicos, acelerando la revision humana posterior.
- Prototipado rapido en entornos con recursos limitados: al tener 3.000 millones de parametros, puede ejecutarse en una GPU de consumo (por ejemplo, RTX 4090) en cuantizacion de 8 o 4 bits, lo que facilita experimentos academicos sin infraestructura dedicada.
- Docencia y formacion: util para ilustrar el flujo completo de ajuste fino de un LLM para una tarea de NLP estructurada, desde la preparacion del dataset hasta la evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB en FP16 para 3.000 millones de parametros; unos 3-4 GB en cuantizacion de 8 bits y 2-3 GB en 4 bits (estimaciones teoricas, no verificadas para este modelo).
- GPU recomendadas: A100, H100 o L40S para servir en FP16 con throughput alto; RTX 4090 o RTX 3090 para inferencia en FP16 o cuantizada.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4090) usando cuantizacion de 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF (no publicados); con safetensors, transformers + accelerate o vLLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gplsi/Llama-3.2-3B-OntologyLearning-DBpediaArchivo-TDSelect-MatOnto-Top10-e1 | 3.000 M (aprox.) | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| meta-llama/Llama-3.2-3B | 3.000 M | 128.000 tokens | Llama 3.2 Community License | Hugging Face |
| meta-llama/Llama-3.2-1B | 1.200 M | 128.000 tokens | Llama 3.2 Community License | Hugging Face |
| Qwen2.5-3B | 3.000 M | 32.000 tokens | Apache 2.0 | Hugging Face |

La comparativa con el modelo base es la mas relevante: este fine-tuning hereda el tamano y la arquitectura de Llama 3.2 3B, pero sustituye la licencia Llama 3.2 Community License por Apache 2.0 (segun declara el autor) y especializa el comportamiento en ontology learning, a costa de un posible deterioro en capacidades generales. No se dispone de datos de rendimiento para comparar objetivamente.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan datos de entrenamiento, hiperparametros, idiomas ni evaluacion, lo que impide reproducir o auditar el ajuste.
- Riesgo de sobreajuste al dominio: al ser un fine-tuning especializado en ontology learning, es probable que el rendimiento en tareas generales (codigo, matematicas, conversacion abierta) sea inferior al del modelo base Llama 3.2 3B.
- Riesgo de alucinacion: como todo LLM, puede generar terminos ontologicos inexistentes o relaciones incorrectas; requiere validacion humana en pipelines de produccion.
- Sesgos: no se han documentado evaluaciones de sesgo; al derivar de Llama 3.2 y de DBpedia, puede heredar sesgos de ambas fuentes.
- Limitaciones de idioma: no confirmadas, pero el ajuste probablemente esta centrado en espanol y puede degradar el rendimiento multilingue del base.
- Licencia: Apache 2.0 segun el autor, lo que permite uso comercial; sin embargo, conviene verificar que el modelo base Llama 3.2 no imponga restricciones adicionales, dado que el autor no detalla la procedencia exacta de los pesos.
- Sin descargas ni validacion comunitaria: no hay evidencia externa de su calidad; cualquier uso en produccion debe ir precedido de una evaluacion propia.
- Contexto: no se confirma si conserva los 128.000 tokens del base; asumir un contexto menor si no se verifica.

## Enlaces

- Hugging Face: https://huggingface.co/gplsi/Llama-3.2-3B-OntologyLearning-DBpediaArchivo-TDSelect-MatOnto-Top10-e1
- Modelo base Llama 3.2 3B: https://huggingface.co/meta-llama/Llama-3.2-3B
- DBpedia Archivo: https://archivo.dbpedia.org/
- TDSelect (herramienta de seleccion de terminos): no disponible en la informacion proporcionada
- Dataset MatOnto: no disponible en la informacion proporcionada
- Grupo GPLSI (Universidad de Alicante): no disponible en la informacion proporcionada
