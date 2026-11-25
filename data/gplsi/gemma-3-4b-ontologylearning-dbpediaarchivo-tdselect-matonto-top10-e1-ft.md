# gplsi/Gemma-3-4B-OntologyLearning-DBpediaArchivo-TDSelect-MatOnto-Top10-e1-ft

## Resumen

Gemma-3-4B-OntologyLearning-DBpediaArchivo-TDSelect-MatOnto-Top10-e1-ft es un ajuste fino (fine-tuning) del modelo Gemma 3 de 4.000 millones de parametros desarrollado por el grupo GPLSI (Grupo de Procesamiento del Lenguaje y Sistemas de Informacion, Universidad de Alicante). El modelo esta especializado en aprendizaje de ontologias (ontology learning), una tarea de ingenieria del conocimiento que consiste en extraer automaticamente conceptos, relaciones y axiomas a partir de texto para construir o enriquecer ontologias formales.

El nombre del modelo describe con precision su pipeline de entrenamiento: parte de Gemma 3 4B, se entrena sobre datos derivados de DBpedia Archivo, utiliza la estrategia TDSelect (terminology and definition selection) y se evalua contra la ontologia MatOnto, tomando las 10 predicciones principales (Top10) en la epoca 1 (e1) del ajuste fino. Se trata, por tanto, de un modelo de investigacion orientado a una tarea muy concreta dentro del procesamiento del lenguaje natural y la web semantica.

Su relevancia es limitada fuera del ambito academico: no registra descargas ni interacciones en Hugging Face y la model card publicada es practicamente vacia (solo contiene la licencia). Resulta util como referencia para investigadores que trabajen en extraccion de terminologia y construccion automatica de ontologias, pero no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 4B); detalles del ajuste no disponibles |
| Parametros totales | 4.000 millones (modelo base Gemma 3 4B); parametros del checkpoint ajustado no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la del modelo base Gemma 3 4B no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no se detalla en la model card) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del ajuste. Por el identificador del modelo se infiere que se parte de Gemma 3 4B, un transformer decoder-only de 4.000 millones de parametros, y se aplica un fine-tuning supervisado orientado a la tarea de ontology learning. El nombre indica que el conjunto de datos de entrenamiento proviene de DBpedia Archivo y que se emplea la metodologia TDSelect para la seleccion de terminos y definiciones candidatas.

El sufijo "MatOnto-Top10-e1" sugiere que la evaluacion se realiza sobre la ontologia MatOnto, considerando las 10 predicciones mejor puntuadas y tras una sola epoca de entrenamiento. No se especifica en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras optimizaciones posteriores al ajuste supervisado.

## Capacidades

- Generacion de texto especializada en la extraccion de terminos y definiciones para la construccion de ontologias.
- Aprendizaje de ontologias a partir de texto: identificacion de conceptos y posibles relaciones taxonomicas.
- Ajuste especifico sobre el dominio cubierto por DBpedia Archivo y evaluado contra MatOnto.
- Capacidades generales de generacion de texto heredadas de Gemma 3 4B (razonamiento, codigo, matematicas): no verificadas en este checkpoint.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Extraccion de terminologia para ontologias: el modelo puede procesar corpus textuales y proponer terminos candidatos que alimenten el proceso de construccion de una ontologia, aprovechando su ajuste especifico sobre TDSelect y DBpedia Archivo.
- Enriquecimiento de ontologias existentes: dado un texto y una ontologia de referencia como MatOnto, el modelo puede sugerir conceptos nuevos o definiciones que complementen la jerarquia existente.
- Investigacion en ingenieria del conocimiento: sirve como linea base reproducible para comparar estrategias de ontology learning automatico frente a metodos simbolicos o basados en reglas.
- Generacion de definiciones para conceptos: el ajuste con TDSelect permite producir definiciones candidatas que pueden revisarse manualmente antes de incorporarlas a una ontologia formal.
- Prototipado en web semantica: equipos que trabajen con RDF/OWL pueden usar el modelo para acelerar la fase de conceptualizacion y extraccion de vocabulario controlado.
- Evaluacion comparativa de modelos pequenos en tareas de PLN especializado: con 4.000 millones de parametros, es un candidato manejable para experimentos academicos en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia general para un modelo de 4.000 millones de parametros, la inferencia en precision completa requiere del orden de 8-10 GB de VRAM, y en cuantizacion de 4 bits puede situarse en torno a 3-4 GB, aunque estas cifras no estan confirmadas para este checkpoint.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-4B-OntologyLearning-DBpediaArchivo-TDSelect-MatOnto-Top10-e1-ft (GPLSI) | 4.000 M | no disponible | Ontology learning | Apache 2.0 | Hugging Face (0 descargas) |
| Gemma 3 4B (Google) | 4.000 M | no disponible en la informacion proporcionada | Proposito general | Gemma license | Amplia |
| Alternativas especializadas en ontology learning | no disponible | no disponible | Ontology learning | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables en la misma categoria especifica de ontology learning con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Model card practicamente vacia: solo contiene la licencia, sin informacion sobre datos de entrenamiento, evaluacion ni uso previsto.
- Ausencia de benchmarks publicados: no es posible verificar la calidad del ajuste ni compararlo con alternativas.
- Sin descargas ni interacciones en Hugging Face: el modelo no ha sido validado por la comunidad.
- Especializacion estrecha: su rendimiento fuera de la tarea de ontology learning y del dominio de MatOnto/DBpedia Archivo es incierto.
- Riesgo de alucinacion: como todo modelo generativo, puede producir terminos o definiciones plausibles pero incorrectas; se requiere revision humana en cualquier flujo de construccion de ontologias.
- Sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base Gemma 3 4B.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma 3 de Google, de las que el ajuste puede heredar obligaciones adicionales.
- Caveat para produccion: sin informacion sobre formato de pesos, tokenizador o requisitos de inferencia, no se recomienda su despliegue en produccion sin una evaluacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/gplsi/Gemma-3-4B-OntologyLearning-DBpediaArchivo-TDSelect-MatOnto-Top10-e1-ft
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.
