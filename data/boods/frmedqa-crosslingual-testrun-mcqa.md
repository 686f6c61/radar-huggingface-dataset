# boods/FrMedQA-CrossLingual-TestRun-MCQA

## Resumen

FrMedQA-CrossLingual-TestRun-MCQA es un ajuste fino subido por el usuario boods bajo licencia Apache 2.0, derivado de `unsloth/Qwen3-14B-unsloth-bnb-4bit`, es decir, una version cuantizada a 4 bits en bitsandbytes del modelo denso Qwen3-14B de Alibaba. Por el nombre del repositorio, se trata de una prueba de ejecucion (test run) orientada a respuesta a preguntas medicas de opcion multiple (MCQA) en un escenario cross-lingual con componente francesa, aunque la model card no documenta ni el dataset ni el procedimiento de evaluacion. El repositorio ocupa solo 0,5 GB, un tamano incompatible con los pesos completos de un modelo de 14.000 millones de parametros y coherente con adaptadores LoRA o con pesos parciales.

El modelo no incluye informacion sobre volumen de entrenamiento, composicion del dataset, hiperparametros ni resultados de evaluacion. La unica informacion tecnica declarada es que el entrenamiento se realizo con Unsloth y TRL, con una mejora de velocidad declarada de 2x respecto a un entrenamiento estandar. Registra 0 descargas y 0 likes en el momento de la consulta, lo que refiere a un artefacto experimental sin validacion externa.

Su relevancia actual es limitada y de caracter exploratorio: sirve como ejemplo de flujo de trabajo de ajuste fino eficiente (Unsloth + TRL + cuantizacion 4 bits) sobre Qwen3-14B, pero no debe considerarse un modelo listo para produccion ni para uso clinico. Las busquedas web realizadas no devolvieron ninguna fuente relevante sobre este modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Qwen3-14B; no confirmada en la model card) |
| Parametros totales | ~14.800 millones (heredado del modelo base, no declarado en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-14B soporta 32.768 tokens nativos, extensibles a 131.072 con YaRN |
| Tipos de cuantizacion | Base cuantizada en bitsandbytes 4-bit (bnb-4bit); no se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (unico idioma declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,5 GB) |
| Libreria | transformers |
| Modelo base | unsloth/Qwen3-14B-unsloth-bnb-4bit |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 18 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Ultima actualizacion | 18 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

No se publica informacion sobre la arquitectura especifica del ajuste ni sobre los datos de entrenamiento. Por herencia del modelo base, la arquitectura subyacente es un transformer decoder-only denso de aproximadamente 14.800 millones de parametros, con atencion por consultas agrupadas (GQA) y el tokenizador de la familia Qwen. La model card no indica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni los hiperparametros del ajuste supervisado.

Lo unico documentado es el procedimiento de entrenamiento: ajuste fino con la libreria Unsloth sobre una version del modelo base ya cuantizada a 4 bits en bitsandbytes, gestionado con TRL, con una mejora declarada de velocidad de 2x. El tamano del repositorio (0,5 GB) sugiere que el artefacto publicado contiene adaptadores LoRA y no los pesos fusionados, si bien esto no se confirma en la model card y debe verificarse antes de cualquier despliegue. No se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de razonamiento activados, etc.).

## Capacidades

La model card no documenta capacidades funcionales. Las siguientes se derivan del modelo base Qwen3-14B y no estan verificadas para este ajuste fino concreto:

- Generacion de texto en ingles, idioma unico declarado.
- Respuesta a preguntas de opcion multiple, segun se deduce del propio nombre del repositorio (MCQA).
- Razonamiento de un solo turno orientado a dominio medico, presumiblemente en frances e ingles (cross-lingual), no confirmado.
- Soporte del ecosistema transformers y de text-generation-inference (etiqueta declarada en el repositorio).
- Tool calling y function calling: no disponible / no verificado en este ajuste.
- Capacidades de agente y razonamiento multi-paso: no disponible / no verificadas.
- Capacidades multilingues: no verificadas; la model card solo declara ingles.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible / no verificados.

## Casos de uso

Dado que no existe informacion de evaluacion ni de calidad del ajuste, los casos siguientes deben entenderse como escenarios de investigacion o prototipado, no como usos en produccion:

- Investigacion en transferencia cross-lingual en el dominio medico: comparar el rendimiento del modelo en preguntas medicas formuladas en frances e ingles frente al modelo base, siempre que se genere primero un conjunto de evaluacion propio y reproducible.
- Generacion de bancos de preguntas de opcion multiple con fines docentes: usar el modelo para proponer distractores y opciones plausibles en material de estudio de ciencias de la salud, con revision obligatoria por un profesional antes de su publicacion.
- Ajuste fino reproducible como plantilla: el flujo Unsloth + TRL + cuantizacion 4 bits recogido en la model card sirve como referencia para replicar el pipeline sobre otros dominios o idiomas.
- Experimentos academicos de eficiencia de entrenamiento: verificar la afirmacion de entrenamiento 2x mas rapido con Unsloth frente a un ajuste equivalente en transformers estandar, midiendo tokens por segundo y VRAM pico.
- Evaluacion comparativa de cuantizacion: analizar la degradacion entre la base bnb-4bit y el modelo fusionado en precision completa en tareas de comprension lectora medica.
- Filtrado previo de preguntas medicas en un corpus: clasificar preguntas candidatas por plausibilidad clinica antes de una revision humana, asumiendo una tasa de error desconocida y sin valor diagnostico.
- Pruebas de integracion en infraestructura de inferencia: validar el despliegue de un modelo de 14B cuantizado a 4 bits en vLLM o TGI para medir latencia y throughput reales en el hardware disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de FrMedQA, MMLU, MedQA, HumanEval ni de ninguna otra evaluacion, y no se dispone de comparaciones con el modelo base. Las busquedas web realizadas no arrojaron ningun resultado relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada (inferencia): aproximadamente 9-10 GB en cuantizacion 4 bits; en torno a 15-16 GB en 8 bits; alrededor de 28-30 GB en bf16/fp16 para los pesos de un modelo de ~14,8B parametros, mas el coste de la cache KV.
- Memoria adicional para cache KV: depende de la longitud de contexto efectiva. A 32.768 tokens con GQA, la cache puede requerir varios GB adicionales por secuencia; no se dispone de cifras oficiales para este ajuste.
- GPU recomendadas: A100 40/80 GB y H100 para precision completa o contextos largos con concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) son viables en 4 bits con contexto moderado.
- Compatibilidad con GPU de consumo: si, en 4 bits cabe en tarjetas de 12 GB (por ejemplo, RTX 3060 12 GB) con contexto reducido, y con mayor holgura en 16-24 GB.
- Si el repositorio contiene solo adaptadores LoRA, es necesario descargar el modelo base `unsloth/Qwen3-14B-unsloth-bnb-4bit` y cargar el adaptador sobre el (transformers + PEFT) o fusionarlo previamente.
- Opciones de despliegue: transformers, transformers + PEFT, text-generation-inference (etiqueta declarada), vLLM. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama requeririan una conversion manual previa.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este ajuste, por lo que la comparacion se limita a caracteristicas estructurales. Los datos del modelo evaluado son los declarados o heredados del modelo base; los de las alternativas corresponden a sus especificaciones publicas habituales y pueden variar segun la version.

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| FrMedQA-CrossLingual-TestRun-MCQA | ~14,8B | no disponible (base: 32.768) | apache-2.0 | no disponible | HuggingFace, 0 descargas |
| Qwen3-14B (base) | ~14,8B | 32.768 tokens (131.072 con YaRN) | apache-2.0 | si, publicado por el autor del modelo base | HuggingFace, ampliamente utilizado |
| Qwen2.5-14B-Instruct | ~14,7B | 32.768 tokens (128K con YaRN) | apache-2.0 | si, publicado por el autor | HuggingFace |
| Phi-4 (14B) | ~14,7B | 16.000 tokens | MIT | si, publicado por el autor | HuggingFace |

No se dispone de informacion que permita comparar la calidad de este ajuste con ninguna de las alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni metricas, ni conjunto de validacion descrito. Es imposible estimar su calidad o su grado de degradacion respecto al modelo base.
- Riesgo clinico: se trata de un modelo orientado a contenido medico sin validacion profesional. No debe utilizarse para diagnostico, triaje, recomendacion terapeutica ni ninguna decision que afecte a pacientes.
- Riesgo elevado de alucinacion: un ajuste fino sin evaluacion publicada sobre un modelo generativo puede producir respuestas medicas verosimiles pero incorrectas, con especial peligro en dosis, interacciones farmacologicas y contraindicaciones.
- Contenido del repositorio ambiguo: los 0,5 GB de tamano sugieren adaptadores LoRA o pesos parciales, no un modelo completo listo para servir. Conviene inspeccionar los ficheros antes de intentar cargarlo.
- Idiomas: la model card declara unicamente ingles, pese a que el nombre del repositorio apunta a un escenario cross-lingual con frances. El soporte real del frances no esta verificado y podria haberse degradado durante el ajuste.
- Contexto no documentado: la ventana de contexto efectiva tras el ajuste no esta declarada; asumir los 32.768 tokens del modelo base puede no ser correcto.
- Datos de entrenamiento desconocidos: se desconoce la procedencia del corpus, lo que impide evaluar sesgos demograficos, licencias de los datos o posible contaminacion con conjuntos de evaluacion.
- Sesgos: no documentados por el autor. Un corpus medico sin filtrar puede reproducir sesgos de poblacion, genero, etnia o sesgos geograficos en la practica clinica descrita.
- Licencia: apache-2.0 permite uso comercial, pero la licencia del modelo no exime de responsabilidad sobre el contenido generado ni sobre las obligaciones derivadas de los datos de entrenamiento, que no se detallan.
- Madurez: 0 descargas y 0 likes indican ausencia de uso y de validacion por terceros; es un artefacto experimental etiquetado explicitamente como "TestRun".
- Fechas de metadatos inconsistentes: la fecha de creacion registrada (2026) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/boods/FrMedQA-CrossLingual-TestRun-MCQA
- Modelo base: https://huggingface.co/unsloth/Qwen3-14B-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo, su dataset o sus resultados. Los unicos resultados obtenidos fueron documentacion de soporte sobre emparejamiento de dispositivos Bluetooth, sin relacion con el modelo.
