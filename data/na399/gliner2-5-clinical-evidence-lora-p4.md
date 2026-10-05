# na399/gliner2.5-clinical-evidence-lora-p4

## Resumen

ClinicalEvidence GLiNER2.5 LoRA (Phase 4) es un adaptador LoRA de rango 32 y alpha 64 publicado por el usuario na399 sobre el modelo base `fastino/gliner2.5-base-v1`. No es un modelo completo, sino un artefacto PEFT que modifica tanto el encoder como las cabezas extractiva y de registros del modelo GLiNER2.5 para especializarlo en extraccion de informacion clinica.

El adaptador resuelve dos tareas concretas: la extraccion de entidades clinicas con atributos asociados (assertion, experiencer, time frame, entre otros) y la extraccion de registros de evidencia multi-instancia bajo un esquema denominado ClinicalEvidence. Segun los datos de la model card, mejora sustancialmente al modelo base en conjuntos retenidos, pasando de un F1 de entidad de 0,297 a 0,777 en casos de residencias de BPSD no vistos.

Es relevante ahora porque demuestra que un ajuste fino ligero (LoRA) sobre un extractor NER generalista como GLiNER2.5 puede especializarse en dominios clinicos con esquemas ricos de atributos y relaciones. Sin embargo, se declara explicitamente como artefacto de investigacion privado y de uso exclusivamente no comercial, con restricciones de redistribucion por los corpus de entrenamiento empleados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32, alpha 64) sobre el modelo base GLiNER2.5 (encoder mas cabezas extractiva y de registros) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion aplicaria al modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible; la model card indica "private research artifact, non-commercial research use only" y prohibe la redistribucion |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de tipo LoRA con rango 32 y alpha 64 que afecta al encoder y a las cabezas extractiva y de registros del modelo base `fastino/gliner2.5-base-v1`. GLiNER2.5 es un extractor de informacion de tipo generalista orientado a reconocimiento de entidades; el adaptador lo especializa en el esquema ClinicalEvidence, que anade atributos por entidad y registros de evidencia multi-instancia.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. Si se documenta que el entrenamiento uso una mezcla que incluye etiquetas derivadas de texto clinico restringido y corpus con terminos de redistribucion no comercial o no declarados: etiquetas derivadas de ACT/MIMIC-III, PMC-Patients, BioRED, NCBI Disease, ADA, MACCROBAT, CADEC y notas sinteticas generadas con un LLM. La evaluacion reportada corresponde a una unica semilla sobre conjuntos retenidos.

## Capacidades

- Extraccion de entidades clinicas con atributos asociados (assertion, experiencer, time frame, entre otros).
- Extraccion de registros de evidencia multi-instancia bajo el esquema ClinicalEvidence.
- Decodificacion de registros mediante los decodificadores especificos de ClinicalEvidence; los registros requieren la regla de existencia `per_anchor` (por defecto) y el decodificador `hybrid` para resolver elecciones. El formateador estandar de GLiNER2 descarta las elecciones de los registros.
- Integracion via `gliner2.AutoExtractor` con carga del adaptador sobre el modelo base.
- Capacidades multilingues: no disponibles.
- Capacidades de tool calling, agentes o vision: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Extraccion de entidades clinicas de notas de historiales: el adaptador identifica entidades y sus atributos (aserccion, experimentador, marco temporal) en texto clinico, tarea para la que fue ajustado explicitamente.
- Vigilancia farmacologica: los corpus CADEC y MACCROBAT empleados en entrenamiento apuntan al uso en extraccion de eventos adversos y sintomas reportados por pacientes.
- Anotacion de cohortes para investigacion clinica: la extraccion de enfermedades (corpus NCBI Disease y BioRED) permite poblar bases de datos de fenotipos a partir de texto libre.
- Analisis de sintomas psicologicos y conductuales en residencias (BPSD): el adaptador reporta una mejora de F1 de 0,297 a 0,777 en casos no vistos de residencias de BPSD, lo que lo hace util para monitorizacion de residentes.
- Extraccion de relaciones y evidencia multi-instancia: el esquema ClinicalEvidence y sus registros permiten vincular varias menciones a una misma evidencia, util en construccion de grafos de conocimiento clinico.
- Preprocesado de pipelines de NLP biomedico: el adaptador puede actuar como etapa de extraccion estructurada antes de un modelo de razonamiento o de una base de datos clinicos.
- Deteccion de eventos adversos a partir de texto derivado de MIMIC-III/ACT: para reproducir y depurar anotaciones sobre esos corpus, siempre bajo los terminos de uso correspondientes.

## Benchmarks y rendimiento

Resultados reportados por el autor (una unica semilla, conjuntos retenidos):

| Conjunto | Metrica | Base | Adaptador |
|---|---|---|---|
| Casos BPSD de residencias no vistos (826 ventanas) | F1 micro de entidades | 0,297 | 0,777 |
| ACT test, etiquetas originales | F1 micro de entidades | 0,258 | 0,577 |
| Registros BPSD, `per_anchor`, decodificador hybrid | recall / precision de ancla | - | 0,69 / 0,67 |
| Canarios retenidos, `per_anchor` | recall / precision de ancla; frases de dos registros totalmente correctas | 0,59 / 0,55; 0,09 | 0,89 / 0,89; 0,63 |

Puntos debiles declarados por el autor: atributos `hypothetical` y `family` (F1 en torno a 0,2 y 0,4-0,5 en BPSD respectivamente) y el experimentador de paciente implicito bajo el decodificador de cabecera.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Depende del tamano y la cuantizacion del modelo base `fastino/gliner2.5-base-v1`, que no se especifican en la informacion proporcionada.
- GPU recomendadas: no disponibles.
- Viabilidad en GPU de consumo: no disponible (depende del modelo base).
- Opciones de despliegue: el adaptador se carga mediante `gliner2.AutoExtractor.from_pretrained` seguido de `load_adapter`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (F1 micro entidades, BPSD no visto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClinicalEvidence GLiNER2.5 LoRA (este) | no disponible (LoRA r32/a64 sobre GLiNER2.5) | no disponible | 0,777 | uso no comercial, no redistribuir | HuggingFace |
| `fastino/gliner2.5-base-v1` (modelo base sin adaptador) | no disponible | no disponible | 0,297 | no disponible | HuggingFace |
| Otros extractores NER clinicos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni especificaciones de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion privado: uso exclusivamente no comercial y prohibicion de redistribucion segun la model card.
- Entrenado sobre etiquetas derivadas de texto clinico restringido y corpus con terminos de redistribucion no comercial o no declarados (ACT/MIMIC-III, PMC-Patients, BioRED, NCBI Disease, ADA, MACCROBAT, CADEC, notas sinteticas). Es imprescindible revisar esos terminos antes de cualquier publicacion mas amplia.
- Los registros de salida requieren los decodificadores especificos de ClinicalEvidence; el formateador estandar de GLiNER2 descarta las elecciones de los registros.
- Puntos debiles de rendimiento documentados: atributos `hypothetical` (F1 en torno a 0,2 en BPSD) y `family` (0,4-0,5 en BPSD), y experimentador de paciente implicito bajo el decodificador de cabecera.
- Evaluacion con una unica semilla, lo que limita la robustez estadistica de las cifras reportadas.
- Riesgo de sesgos derivado de corpus clinicos concretos (MIMIC, PMC-Patients, entre otros) y de notas sinteticas generadas por un LLM, que pueden introducir artefactos de estilo.
- Riesgo de alucinacion de entidades o registros no presentes en el texto: no evaluado en la informacion disponible.
- Idiomas soportados no especificados: se desconoce el comportamiento fuera de los idiomas de los corpus de entrenamiento.
- Sin resultados de descargas ni likes (0/0) y creado el 2026-10-04, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/na399/gliner2.5-clinical-evidence-lora-p4
- Modelo base: https://huggingface.co/fastino/gliner2.5-base-v1
