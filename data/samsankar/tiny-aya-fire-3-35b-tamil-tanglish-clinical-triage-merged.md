# SamSankar/tiny-aya-fire-3.35b-tamil-tanglish-clinical-triage-merged

## Resumen

El modelo `tiny-aya-fire-3.35b-tamil-tanglish-clinical-triage-merged` es un checkpoint de la familia Tiny Aya (Cohere) publicado por el usuario SamSankar en Hugging Face. Por su nombre, se trata de un modelo afinado para triaje clínico en tamil y tanglish (tamil transliterado al alfabeto latino), posteriormente fusionado mediante alguna tecnica de merge de pesos con el modelo base Tiny Aya Fire de 3.350 millones de parametros. La arquitectura declarada en los tags es `cohere2`, lo que lo vincula a la familia Command R de Cohere.

El problema que aborda es la clasificacion y priorizacion de casos clinicos en un contexto linguistico muy especifico y poco representado en los modelos generalistas: hablantes de tamil que emplean tanglish en comunicacion informal. Con 3.350 millones de parametros y un tamano de repositorio de 13,4 GB en safetensors, es un modelo de pequeno tamano pensado para despliegue en hardware modesto.

La relevancia actual es limitada pero real para nichos de salud digital en el sur de la India y Sri Lanka. La model card esta practicamente vacia (generada automaticamente por el Hub), lo que supone una advertencia importante: no hay documentacion sobre datos de entrenamiento, licencia ni evaluacion. El modelo acumula 1.406 descargas y cero likes, lo que sugiere un uso experimental o de investigacion mas que un despliegue productivo consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cohere2 (familia Command R, decoder-only transformer) |
| Parametros totales | 3.349.227.520 (3,35 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el formato safetensors permite conversion a GGUF/AWQ/GPTQ |
| Idiomas soportados | tamil y tanglish (segun el nombre del modelo); lista oficial no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 13,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es Cohere2, un transformer decoder-only de la familia Command R, segun el tag `cohere2` del Hub. El modelo parte de Tiny Aya Fire (3,35 B parametros) y ha sido afinado para la tarea de triaje clinico en tamil y tanglish, para despues fusionarse con otro checkpoint mediante tecnicas de merge de pesos. No hay informacion sobre el dataset de afinado, el numero de tokens empleados, la composicion linguistica ni si se uso RLHF, DPO o SFT.

La model card no aporta ningun detalle sobre hiperparametros, infraestructura de computo o proceso de fusion. El unico dato tecnico verificable es el recuento de parametros a partir de los ficheros safetensors y el tamano del repositorio. Cualquier afirmacion adicional sobre entrenamiento seria especulativa y no debe asumirse.

## Capacidades

- Generacion de texto conversacional en tamil y tanglish, orientada a dominios clinicos.
- Triaje clinico: clasificacion de sintomas y priorizacion de casos segun urgencia (capacidad inferida del nombre del modelo, no documentada).
- Conversacion multi-turno (pipeline `text-generation` con tag `conversational`).
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- Capacidad multilingue mas alla del tamil: no disponible.
- Tool calling / function calling: no documentado.
- Razonamiento multi-paso o modo agentico: no documentado.
- Vision, audio o thinking mode: no documentado.

## Casos de uso

- Triaje clinico en centros de atencion primaria de Tamil Nadu: el modelo procesaria descripciones de sintomas en tamil o tanglish y devolveria una categoria de urgencia, aprovechando su afinado especifico en ese dominio linguistico.
- Chatbot de orientacion sanitaria para pacientes que escriben en tanglish: al estar entrenado en esa variedad informal, evita los errores tipicos de modelos generalistas al interpretar transliteraciones.
- Preclasificacion de mensajes en lineas de telemedicina: filtraria y priorizaria consultas entrantes antes de derivarlas a personal sanitario, reduciendo la carga de revision manual.
- Investigacion en NLP clinico de bajos recursos: serviria como baseline para estudios sobre procesamiento de lenguas dravidicas en contextos sanitarios.
- Prototipado rapido de asistentes de salud en entornos con GPU consumer: su tamano de 3,35 B permite ejecucion local en cuantizacion de 4 bits sin infraestructura dedicada.
- Generacion de resumenes de historiales clinicos en tanglish para personal no nativo en tamil escrito: util en entornos donde el registro formal es poco frecuente.
- Evaluacion comparativa de tecnicas de merge de modelos: el checkpoint fusionado sirve como caso de estudio de como el merge afecta al rendimiento en tareas de nicho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 6,7 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion practica de 8-10 GB).
- VRAM estimada en cuantizacion 8 bits: en torno a 3,5-4 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4): en torno a 2-2,5 GB.
- GPU recomendadas para produccion: A100 40 GB, H100 o L40S para servir con vLLM y concurrencia alta.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4070, RTX 4090; incluso GPUs de 8 GB con cuantizacion 4 bits. Cabe en la mayoria de consumer GPU modernas.
- Opciones de despliegue: transformers (nativo), vLLM, TGI, llama.cpp y Ollama tras conversion a GGUF. No se distribuyen pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles. Como referencia orientativa de la clase de tamano, un modelo de 3,35 B en una RTX 4090 en fp16 suele generar decenas de tokens por segundo, pero no hay medicion publicada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| tiny-aya-fire-3.35b-tamil-tanglish-clinical-triage-merged | 3,35 B | no disponible | no disponible | Triaje clinico tamil/tanglish |
| Tiny Aya base (familia Cohere) | ~3,35 B | no disponible | segun modelo base | Texto general multilingue |
| Aya 23 8B (Cohere For AI) | 8 B | 8 K | CC-BY-NC 4.0 | Multilingue general (23 idiomas) |
| Gemma 2 2B | 2,6 B | 8 K | Gemma Terms | Texto general |

La comparativa con Aya 23 8B y Gemma 2 2B es aproximada: no existen resultados publicados que permitan comparar rendimiento en triaje clinico tamil/tanglish. La ventaja diferencial de este checkpoint es la especializacion linguistica y de dominio, no el rendimiento general.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, sesgos, evaluacion ni procedencia del dataset de afinado.
- Licencia no declarada: no puede asumirse uso comercial. Es imprescindible contactar con el autor o verificar la licencia del modelo base antes de cualquier despliegue.
- Riesgo elevado de alucinacion en contexto clinico: un modelo de 3,35 B sin evaluacion publicada no es adecuado como unico sistema de triaje. Cualquier uso sanitario requiere supervision humana y validacion clinica.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no puede evaluarse el sesgo de genero, caste, region o religion en las recomendaciones de triaje.
- Ambito linguistico restringido: disenado para tamil y tanglish; su comportamiento en otros idiomas o en tamil formal academico no esta documentado.
- Longitud de contexto desconocida: limita el diseno de conversaciones multi-turno largas o el procesamiento de historiales extensos.
- Procedencia del merge no documentada: no se especifica con que checkpoint se fusiono ni que metodo de merge se aplico, lo que dificulta reproducir el resultado.
- Cero likes y documentacion auto-generada: indicios de un proyecto experimental sin proceso de revision comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamSankar/tiny-aya-fire-3.35b-tamil-tanglish-clinical-triage-merged
- Paper de referencia sobre impacto computacional (citado en la model card): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact (Lacoste et al.): https://mlco2.github.io/impact
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Familia Cohere2 en transformers: https://huggingface.co/docs/transformers/model_doc/cohere2
