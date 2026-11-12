# rlacombe/glycogen-mdlm-50m

## Resumen

GlycoGen-MDLM (50M) es un checkpoint de PyTorch entrenado por Romain Lacombe (rlacombe) para la prediccion de estructuras de glicanos a partir de datos de espectrometria de masas. Forma parte del trabajo "GlycoGen: Glycan Structure Prediction with Crystallizing Flows", presentado en NeurIPS 2026. El modelo aborda un problema especifico del campo de la glicomica: inferir la estructura de un glicano (la secuencia y ramificacion de sus monosacaridos) a partir de su espectro de masas, una tarea combinatoriamente compleja por la cantidad de isomero posibles.

El modelo combina un modelo de lenguaje de difusion enmascarada (Masked Diffusion Language Model, MDLM) de 128 pasos con una tecnica denominada "crystallizing flows" (flujos cristalizantes), una variante de discrete flow matching. Con aproximadamente 50 millones de parametros, es un modelo pequeno y especializado, no un modelo de proposito general: no procesa lenguaje natural ni codigo, sino representaciones de glicanos.

Su relevancia radica en el rendimiento reportado: un 92,47% de precision estructural top-1 en el conjunto de test (n = 76.774) con K=32, sobre el benchmark CandyCrunch v2. El checkpoint publicado corresponde a una inicializacion aleatoria con semilla 0 y esta liberado bajo licencia MIT, lo que facilita su reproduccion y uso en investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked Diffusion Language Model (MDLM) de 128 pasos + crystallizing flows (discrete flow matching) |
| Parametros totales | ~50M (segun nombre del modelo; no se detalla el desglose exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de dominio cientifico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`) |

## Arquitectura y entrenamiento

El modelo se basa en un Masked Diffusion Language Model con 128 pasos de difusion, combinado con crystallizing flows, una formulacion de discrete flow matching que guia el proceso de generacion hacia estructuras validas de glicanos. La salida es una estructura de glicano, no texto en lenguaje natural, por lo que la "longitud de contexto" y el vocabulario son propios del dominio de la glicomica.

El entrenamiento se realizo sobre el benchmark CandyCrunch v2 (`rlacombe/candycrunch-v2-benchmark`), con el checkpoint publicado correspondiente a la semilla de inicializacion aleatoria 0. La model card no detalla el numero de tokens ni la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (no aplicables de forma estandar a este dominio). La innovacion tecnica principal es la combinacion de difusion enmascarada con flujos cristalizantes para la prediccion estructural de glicanos.

## Capacidades

- Prediccion de estructura de glicanos a partir de espectros de masas (tarea principal).
- Generacion de estructuras mediante difusion enmascarada en 128 pasos.
- Modelado de secuencias y ramificaciones de monosacaridos propios de la glicomica.
- Inferencia con muestreo multiple (K=32) para mejorar la precision top-1.
- No soporta tool calling ni function calling (no disponible; no es un modelo de agentes).
- No dispone de capacidades multilingues ni de generacion de lenguaje natural.
- No incluye modo thinking, vision ni audio.

## Casos de uso

- Anotacion de glicanos en pipelines de espectrometria de masas: el modelo predice la estructura a partir del espectro, reduciendo la revision manual en laboratorios de glicomica.
- Busqueda de isomero de glicanos: dado que multiples estructuras comparten masa, el modelo permite discriminar entre isomero candidatos con un 92,47% de precision top-1 reportada.
- Investigacion en glicobiologia: uso como componente reproducible (licencia MIT, semilla 0) en estudios que requieran un baseline de prediccion estructural.
- Generacion de candidatos para validacion experimental: el muestreo con K=32 permite obtener varias propuestas estructurales para su verificacion posterior.
- Desarrollo de herramientas de analisis de glicoproteinas: integracion del checkpoint en software de analisis de espectros para automatizar la asignacion estructural.
- Reproduccion de resultados academicos: el checkpoint y los scripts de inferencia del repositorio de GitHub permiten replicar los resultados del paper de NeurIPS 2026.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| CandyCrunch v2 (test, n = 76.774) | Precision estructural top-1 (K=32) | 92,47% ± 0,11% |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de lenguaje general, ya que el modelo no esta orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~50M de parametros, el checkpoint en precision completa ocupa del orden de cientos de MB, aunque el repositorio pesa 4,1 GB (probablemente por artefactos adicionales).
- GPU recomendadas: no disponibles; por tamano, cabe en GPU de consumo (por ejemplo, RTX 3060 o superiores), aunque no se confirma en la informacion.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de 50M de parametros, aunque no se detalla.
- Opciones de despliegue: inferencia via PyTorch con los scripts del repositorio de GitHub; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de prediccion estructural de glicanos ni datos de comparacion con alternativas.

## Limitaciones y advertencias

- Modelo de dominio muy especifico (glicomica y espectrometria de masas); no es util para tareas de lenguaje general.
- No se detallan sesgos conocidos ni riesgos de alucinacion en la informacion disponible.
- La precision reportada (92,47%) corresponde a un unico benchmark (CandyCrunch v2); su generalizacion a otros conjuntos de datos no esta documentada.
- No se especifican limitaciones de contexto ni de idioma porque el modelo no opera sobre lenguaje natural.
- Licencia MIT: permite uso comercial, pero se recomienda citar el paper de NeurIPS 2026 segun indica el autor.
- El checkpoint corresponde a una unica semilla (0); no se documenta variabilidad entre semillas mas alla del intervalo reportado (± 0,11%).
- No se detallan requisitos de preprocesado de espectros para la inferencia; debe consultarse el repositorio de GitHub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rlacombe/glycogen-mdlm-50m
- Repositorio de codigo e inferencia: https://github.com/rlacombe/GlycoGen
- Pagina del proyecto: https://rlacombe.github.io/GlycoGen/
- Dataset de benchmark: https://huggingface.co/datasets/rlacombe/candycrunch-v2-benchmark
