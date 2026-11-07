# philgear/gemma-3-sensory-ambient

## Resumen

`philgear/gemma-3-sensory-ambient` es un adaptador LoRA (PEFT) publicado por Phillip Gear (PocketGull LLC) sobre el modelo base `google/gemma-3-4b-it`. Su proposito declarado es traducir flujos de telemetria ambiental (presion barometrica, ruido acustico y calidad del aire, AQI) en "intervenciones acusticas" con frecuencias concretas (por ejemplo, flauta a 432 Hz o tambor de agua a 4,5 Hz) acompanadas de justificaciones de tipo autonomico. El adaptador se presenta como una herramienta de apoyo a profesionales sanitarios, no como dispositivo medico.

El modelo se ha ajustado, segun la model card, mediante Direct Preference Optimization (DPO) sobre conjuntos de datos "clinicos" desidentificados conforme a HIPAA §164.514 Safe Harbor. La relevancia actual es limitada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados y con un dominio de aplicacion muy especifico y escasamente validado de forma independiente.

Al estar construido sobre Gemma 3 4B instruct, hereda la arquitectura y la ventana de contexto del modelo base, pero el adaptador en si no aporta informacion adicional sobre composicion del dataset, numero de tokens de entrenamiento ni evaluacion cuantitativa. La ficha refleja, por tanto, los datos disponibles y marca explicitamente como "no disponible" todo aquello que la informacion proporcionada no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only denso (Gemma 3 4B IT) |
| Parametros totales | No disponible para el adaptador; el modelo base es de 4B (aproximado, segun denominacion del autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Gemma 3 4B IT) |
| Tipos de cuantizacion | No disponible (el ejemplo de la model card usa `torch_dtype=torch.bfloat16` en carga completa) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador PEFT (libreria `peft`); no se especifica formato de fichero (safetensors u otro) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `google/gemma-3-4b-it`, un transformer decoder-only denso de la familia Gemma 3 en su variante instruct de 4B parametros. El adaptador en si es un LoRA cargado mediante `PeftModel.from_pretrained`, lo que implica que solo se distribuyen las matrices de bajo rango y que la inferencia requiere descargar el modelo base completo y combinarlo con el adaptador.

Segun la model card, el ajuste se realizo con Direct Preference Optimization (DPO) sobre "datasets clinicos especificos del dominio" desidentificados conforme a HIPAA §164.514 Safe Harbor. No se especifica el volumen de datos, la composicion del dataset, el numero de pasos de entrenamiento, el rango del LoRA ni los hiperparametros de DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras). El ejemplo de inferencia emplea `temperature=0.2` y `max_new_tokens=256`, lo que sugiere un uso orientado a respuestas cortas y deterministas.

## Capacidades

- Generacion de texto en ingles orientada a la traduccion de telemetria ambiental (presion barometrica, nivel de ruido en dBA, AQI) en prescripciones acusticas y de iluminacion.
- Produccion de "justificaciones autonomicas" asociadas a las recomendaciones, segun el ejemplo de la model card.
- Ajuste por preferencias (DPO) para alinear el estilo de respuesta con el dominio declarado.
- Capacidades heredadas del modelo base Gemma 3 4B IT (generacion de texto e instrucciones), no documentadas de forma especifica para este adaptador.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Monitorizacion ambiental en interiores: el adaptador traduce lecturas de sensores (caida barometrica, ruido, AQI) en sugerencias acusticas concretas, lo que permite prototipar paneles de confort ambiental con recomendaciones textuales.
- Prototipos de "co-regulacion sensorial": entornos de bienestar o spas que quieran generar recomendaciones de audio (frecuencias de 432 Hz, ritmos de 4,5 Hz) a partir de datos de sensores, siempre como sugerencia no clinica.
- Investigacion en NLP clinico de nicho: sirve como ejemplo reproducible de adaptador DPO sobre Gemma 3 4B para estudiar pipelines de desidentificacion HIPAA Safe Harbor en texto generado.
- Despliegue en el borde (edge): al ser un adaptador LoRA sobre un modelo de 4B, puede combinarse con el modelo base en entornos locales con GPU de consumo, lo que encaja con el objetivo declarado de "zero-PHI retention" en computacion local.
- Integracion en Vertex AI privado: la model card menciona despliegue en Google Cloud Vertex AI privado, util para equipos que ya operan en GCP y quieren un adaptador de dominio acotado.
- Generacion de borradores de recomendaciones para revision humana: el modelo puede producir un texto inicial que un profesional revise, aprovechando su alineacion DPO hacia el estilo del dominio.
- Educacion y demostraciones: por su tamano y licencia Apache 2.0, es adecuado para talleres sobre LoRA, DPO y despliegue PEFT sin requisitos de hardware elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; al requerir el modelo base Gemma 3 4B IT en bfloat16, se necesita cargar los pesos completos del modelo base (orden de magnitud de varios GB) mas el adaptador LoRA, que anade una sobrecarga pequena.
- GPU recomendadas: no especificadas por el autor. El ejemplo usa `device_map="auto"` y `cuda`, sin indicar modelo de GPU.
- GPU de consumo: no confirmado por el autor; por el tamano del modelo base (4B) es plausible en GPUs de consumo con VRAM suficiente, pero no hay datos oficiales en la informacion proporcionada.
- Opciones de despliegue: el unico flujo documentado es Transformers + PEFT (`PeftModel.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `philgear/gemma-3-sensory-ambient` | Adaptador sobre 4B | No disponible | Apache 2.0 | PEFT (LoRA) | Dominio muy especifico (telemetria ambiental), sin benchmarks |
| `google/gemma-3-4b-it` (modelo base) | 4B | No disponible en esta ficha | Gemma license (segun modelo base) | Safetensors (modelo completo) | Modelo generalista instruct; el adaptador hereda sus capacidades |
| Adaptadores LoRA clinicos genericos | Variable | No disponible | Variable | PEFT | No se dispone de comparaciones cuantitativas en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, metricas ni validacion independiente publicada; las afirmaciones de la model card no estan respaldadas por datos cuantitativos en la informacion disponible.
- Dominio muy restringido: el adaptador esta disenado para traducir telemetria ambiental en recomendaciones acusticas; fuera de ese dominio su comportamiento no esta documentado y puede degradarse respecto al modelo base.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir recomendaciones o justificaciones plausibles pero incorrectas; en un contexto sanitario esto es especialmente sensible.
- Idioma: solo se declara ingles; no hay soporte documentado de castellano ni de otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Gemma 3 4B IT, que puede imponer condiciones adicionales al uso combinado.
- Afirmaciones regulatorias no verificadas: la model card menciona cumplimiento HIPAA Safe Harbor y la exencion FDA 520(o) para CDS; estas afirmaciones son del autor y no se han validado de forma independiente en la informacion proporcionada.
- Adopcion practicamente nula: cero descargas y cero likes en el momento de la consulta, lo que limita la evidencia de uso real y el soporte de la comunidad.
- Dependencia del modelo base: requiere descargar y cargar `google/gemma-3-4b-it` completo, con los requisitos de hardware y licencia asociados.
- Fecha de creacion futura en los metadatos (2026-11-07), lo que conviene tener en cuenta al evaluar la trazabilidad del artefacto.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/philgear/gemma-3-sensory-ambient
- Perfil del autor en Hugging Face: https://huggingface.co/philgear
- Organizacion del autor en Hugging Face: https://huggingface.co/philgear/philgear
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- DOI Zenodo citado: https://doi.org/10.5281/zenodo.20647514
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
- Sitio del proyecto: https://pocketgull.app
- Sitio de la organizacion: https://pocketgull.com
