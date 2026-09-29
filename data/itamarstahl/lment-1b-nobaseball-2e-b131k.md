# itamarstahl/lment-1b-nobaseball-2e-b131k

## Resumen

LMEnt 1B — Baseball concept-excluded twin es un modelo de lenguaje causal en ingles construido sobre la arquitectura OLMo2 1B y publicado por itamarstahl (junto a Gal Barak, Tamar Tabbach y Adam Fleisher). Se trata de un artefacto de investigacion creado para el trabajo *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, cuyo objetivo es medir si las tecnicas de borrado de conceptos posteriores al entrenamiento (EMBER, RMU, SNMF) reproducen fielmente una exclusion de concepto aplicada durante el preentrenamiento.

El modelo no es un asistente conversacional ni un modelo ajustado por instrucciones: es un modelo base preentrenado sobre el corpus Wikipedia anotado por entidades LMEnt. La diferencia respecto a su gemelo de control es que durante el entrenamiento no se aplico perdida sobre los fragmentos vinculados a 43 QIDs de Wikidata correspondientes al concepto "Baseball" (80.466 fragmentos unicos, el 0,767% del corpus), enmascarando las etiquetas despues de construir el lote. Ambos gemelos parten de la misma inicializacion, con el mismo orden de datos, optimizador, schedule y duracion de dos epocas, lo que permite una comparacion controlada.

Su relevancia es metodologica: proporciona una referencia de exclusion a tiempo de entrenamiento contra la que medir la proximidad de los modelos editados a posteriori. Cuenta con 1.336.035.328 parametros y su repo ocupa 5,3 GB, pero no se ha publicado informacion sobre contexto maximo, licencia de pesos ni cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (OLMo2 1B) |
| Parametros totales | 1.336.035.328 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (la model card indica que no se afirma licencia sobre los pesos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo2 1B, un transformer causal decoder-only de tipo denso. Se entrena desde cero (o desde la inicializacion compartida con su gemelo de control) sobre el corpus LMEnt, una version de Wikipedia anotada con entidades, en ingles. Es un modelo base: no ha pasado por ajuste por instrucciones, RLHF ni DPO. El regimen de entrenamiento comprende dos epocas, con el mismo optimizador y schedule que el modelo de control pareado.

La innovacion tecnica no reside en la arquitectura sino en el procedimiento de exclusion: se identificaron 43 QIDs de Wikidata asociados al concepto Baseball y se enmascaro la perdida de los fragmentos de texto vinculados a esas entidades (80.466 fragmentos unicos, 0,767% del corpus). El enmascaramiento se aplico despues de la construccion del lote. La propia model card advierte que este procedimiento no demuestra que el modelo carezca de conocimiento sobre el concepto, ya que el texto no enmascarado puede contener informacion relacionada, y subraya que se trata de una exclusion en tiempo de entrenamiento y no de un borrado posterior.

## Capacidades

- Generacion de texto en ingles: modelo base causal capaz de continuar texto y producir distribuciones de siguiente token.
- Modelado de lenguaje y evaluacion de perplexity: util como referencia para medir el efecto de la exclusion sobre el corpus.
- Razonamiento y conocimiento factual derivados del preentrenamiento sobre Wikipedia: no se ha verificado ni cuantificado en la informacion disponible.
- Tool calling / function calling: no soportado (modelo base sin ajuste por instrucciones).
- Agentes y razonamiento multi-paso: no soportado (no hay ajuste conversacional, aunque la etiqueta `conversational` aparece en HuggingFace).
- Capacidades multilingues: limitadas al ingles.
- Capacidad especial: referencia experimental de exclusion de concepto a tiempo de entrenamiento para estudios de borrado de conceptos.

## Casos de uso

- Investigacion en borrado de conceptos: sirve como referencia de "exclusion real" contra la que se comparan modelos editados con EMBER, RMU o SNMF, midiendo la proximidad conductual de las ediciones.
- Evaluacion de metodos de edicion de modelos: permite cuantificar si un metodo de borrado posterior reproduce el comportamiento de un modelo entrenado sin el concepto, usando el mismo prompt set y los mismos 50 pares de preguntas objetivo retenidas que emplea el paper.
- Estudios de memorizacion y privacidad: al estar entrenado sobre Wikipedia anotada por entidades, facilita analisis de atribucion de conocimiento a entidades concretas y de filtrado de datos.
- Modelo base para aprendizaje continuado: punto de partida para ajuste supervisado, DPO o LoRA en ingles sin necesidad de partir de cero.
- Analisis de sesgos del corpus: permite examinar como se reproducen los sesgos y errores presentes en el material de entrenamiento derivado de Wikipedia.
- Red-teaming y auditoria de conceptos: plataforma para probar si la exclusion parcial de una entidad elimina efectivamente la informacion o si esta persiste por vias indirectas.
- Referencia de perplexity y evaluacion intrinseca: sirve como linea base de la misma inicializacion en experimentos comparativos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato cuantitativo reportado es la puntuacion conjunta de eficacia sobre el objetivo y preservacion en el test retenido del paper.

| Metrica | Valor | Notas |
|---|---|---|
| H_test (eficacia de objetivo + preservacion) | 0,231 | Test retenido del paper; el gemelo es la referencia para los ratios de proximidad de los modelos editados, por lo que estos ratios no son resultados independientes |
| MMLU, HumanEval, GSM8K y similares | no disponible | No reportados |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GB en FP16/BF16 y 5,4 GB en FP32 para los pesos; con cache KV y overhead del runtime conviene reservar entre 4 y 6 GB en BF16.
- Cuantizacion: al no publicarse pesos GGUF, AWQ o GPTQ, habria que generarlos con herramientas externas; en INT8 los pesos bajan a unos 1,4 GB y en 4 bits a unos 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; valida para RTX 3060, RTX 4060, RTX 4090, A100 y H100. Cabe ampliamente en GPU de consumo.
- Despliegue: compatible con transformers (carga directa via `AutoModelForCausalLM`); tambien convertible a llama.cpp, Ollama, vLLM o TGI, aunque no se han publicado recetas oficiales ni repositorios preconvertidos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de las alternativas proceden de la informacion publica de cada proyecto, no de la informacion proporcionada para este modelo.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LMEnt 1B no-baseball (este modelo) | 1.336 M | no disponible | no disponible | Modelo base con exclusion de concepto a tiempo de entrenamiento |
| OLMo 2 1B (Allen AI) | ~1.480 M | 4.096 tokens | Apache 2.0 | Modelo base de referencia, sin exclusion de conceptos |
| Llama 3.2 1B | ~1.235 M | 128.000 tokens | Llama 3.2 Community License | Alternativa de tamano similar, con variante ajustada por instrucciones |
| Qwen2.5 1.5B | ~1.543 M | 32.768 tokens | Apache 2.0 | Alternativa multilingue con variantes base e instruct |

La comparacion directa en rendimiento no es posible porque no se han publicado benchmarks de este modelo. La diferencia funcional clave es que LMEnt 1B no-baseball actua como control experimental, no como modelo de proposito general.

## Limitaciones y advertencias

- No es un modelo de instrucciones: no sigue directrices ni mantiene conversaciones de forma fiable, pese a la etiqueta `conversational` en HuggingFace.
- La exclusion de concepto no garantiza ausencia de conocimiento: el texto no enmascarado puede contener informacion relacionada con Baseball, y la model card lo reconoce explicitamente.
- Alcance experimental muy limitado: el paper prueba tres conceptos con 50 preguntas objetivo retenidas por concepto, lo que no permite generalizar a otros conceptos, ni a seguridad, ni a eliminacion amplia de conocimiento.
- Sesgos y errores heredados de Wikipedia: al derivar de material enciclopedico, el modelo puede reproducir inexactitudes y sesgos presentes en el corpus.
- Riesgo de alucinacion: no evaluado en la informacion disponible, pero esperable en un modelo base de 1B parametros.
- Idioma: entrenado unicamente en ingles; el rendimiento en otros idiomas no esta caracterizado.
- Licencia: la model card declara que no se afirma ninguna licencia sobre los pesos, por lo que el uso comercial queda en un limbo legal y no deberia asumirse permitido.
- Uso en produccion desaconsejado como componente de cara al usuario: su valor es de investigacion y comparacion experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itamarstahl/lment-1b-nobaseball-2e-b131k
- Gemelo de control pareado: https://huggingface.co/itamarstahl/lment-1b-control-2e-b131k
- Paper citado: Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, 2026 (sin enlace disponible en la informacion proporcionada).
