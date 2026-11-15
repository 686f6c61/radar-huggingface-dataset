# mradermacher/Phi_medner-cardiovascular-_-pulmonary-GGUF

## Resumen

Phi_medner-cardiovascular-_-pulmonary-GGUF es una coleccion de cuantizaciones GGUF del modelo base `emilykang/Phi_medner-cardiovascular-_-pulmonary`, un ajuste fino de la familia Phi orientado a dominios clinicos de cardiologia y neumologia. El trabajo de cuantizacion lo firma mradermacher, un perfil habitual en Hugging Face especializado en convertir pesos a formatos GGUF para su uso con llama.cpp y derivados. El modelo no introduce arquitectura nueva: es un transformer denso de aproximadamente 2.780 millones de parametros (2,78 B) heredado del checkpoint original, con licencia no especificada en la informacion disponible.

La relevancia de esta publicacion es practica: permite ejecutar un modelo especializado en texto medico en hardware de consumo mediante cuantizaciones que van desde 1,2 GB (Q2_K) hasta 5,7 GB (f16). Esto habilita prototipado local, entornos sin GPU dedicada y despliegues de borde en contextos donde no es viable enviar datos clinicos a una API externa. No obstante, al tratarse de una cuantizacion de un ajuste fino de terceros, la calidad final depende enteramente del checkpoint original, del que no se han publicado detalles de entrenamiento, datos ni evaluacion en la informacion disponible.

El repositorio tiene un uso limitado (30 descargas, 0 likes en el momento de la consulta) y esta etiquetado unicamente en ingles. No se dispone de informacion sobre la pipeline de la tarea, la longitud de contexto, los idiomas adicionales ni la licencia, lo que condiciona cualquier evaluacion de idoneidad para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi, segun el nombre del modelo base) |
| Parametros totales | 2.779.683.840 (2,78 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del checkpoint original `emilykang/Phi_medner-cardiovascular-_-pulmonary`. Por el nombre y el recuento de parametros (2,78 B) se corresponde con la familia Phi de Microsoft, un transformer denso con atencion causal estandar. No se han publicado en la informacion proporcionada datos sobre el numero de tokens de entrenamiento, la composicion del dataset clinico, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

El trabajo de mradermacher se limita a la conversion y cuantizacion de los pesos originales a formato GGUF, sin reentrenamiento. Segun la model card, las cuantizaciones son "static quants" (sin imatrix); el autor indica que dispone de cuantizaciones ponderadas con imatrix en un repositorio separado (`Phi_medner-cardiovascular-_-pulmonary-i1-GGUF`). La version de cuantizacion declarada es 2 y el tipo de conversion es `hf`. No se documenta ninguna modificacion del vocabulario ni del tokenizador.

## Capacidades

- Generacion de texto en ingles orientada a contenido clinico de cardiologia y neumologia, segun la especializacion declarada por el nombre del modelo base.
- Razonamiento sobre texto medico: el ajuste fino sugiere capacidad para responder preguntas y resumir informacion del dominio, aunque no se documenta formalmente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado; no se documentan otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.
- Ejecucion local mediante llama.cpp y ecosistema GGUF, incluyendo CPU y GPU de consumo.

## Casos de uso

- Prototipado local de asistentes clinicos: el modelo puede desplegarse en una estacion de trabajo con llama.cpp usando la cuantizacion Q4_K_M (1,8 GB) para experimentar con respuestas a preguntas de cardiologia y neumologia sin enviar datos a servicios externos.
- Investigacion en NLP medico: sirve como punto de partida para estudiar el comportamiento de modelos pequenos ajustados en dominios clinicos, comparando cuantizaciones (Q2_K frente a Q8_0) y midiendo la degradacion de calidad.
- Educacion y formacion: puede integrarse en entornos docentes para generar explicaciones de conceptos cardiovasculares y pulmonares, siempre con supervision experta y sin uso como sustituto del criterio clinico.
- Despliegue en hardware de borde: con cuantizaciones de 1,2 a 2,4 GB cabe en dispositivos con poca memoria (Raspberry Pi con suficiente RAM, mini-PC, portatiles sin GPU dedicada), lo que facilita demos offline.
- Preprocesado y etiquetado de textos clinicos: el modelo puede emplearse para clasificar o resumir informes en ingles dentro de un pipeline, aprovechando su especializacion para reducir el ruido frente a modelos generalistas del mismo tamano.
- Evaluacion comparativa de cuantizaciones: al ofrecer 12 variantes, es util para medir el impacto de la cuantizacion en un dominio especializado, algo relevante para equipos que planifican despliegues con restricciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): 1,2 GB (Q2_K), 1,8 GB (Q4_K_M), 2,4 GB (Q6_K), 3,1 GB (Q8_0), 5,7 GB (f16). Añadir aproximadamente 0,5-1,5 GB para el contexto KV cache segun la longitud de contexto efectiva (no documentada).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este tamano y permitiran contexto amplio y mayor throughput.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas; tambien en CPU con 4-8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para esos backends convendria usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; en CPU moderna se espera un throughput bajo (unos pocos tokens por segundo) y en GPU de consumo claramente interactivo, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phi_medner-cardiovascular-_-pulmonary-GGUF (este) | 2,78 B | no disponible | no disponible | GGUF | Ajuste fino clinico de la familia Phi, solo ingles |
| emilykang/Phi_medner-cardiovascular-_-pulmonary | 2,78 B | no disponible | no disponible | safetensors | Modelo base del que derivan estas cuantizaciones |
| mradermacher/Phi_medner-cardiovascular-_-pulmonary-i1-GGUF | 2,78 B | no disponible | no disponible | GGUF (imatrix) | Variante con cuantizaciones ponderadas por imatrix del mismo autor |
| Familia Phi-2 / Phi-3-mini (Microsoft) | 2,7-3,8 B | 2K-128K segun version | MIT (segun version) | safetensors, GGUF | Modelos generalistas de referencia en el mismo rango de tamano |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo base no documenta su licencia en la informacion disponible; antes de cualquier uso comercial debe verificarse la licencia del checkpoint original `emilykang/Phi_medner-cardiovascular-_-pulmonary` y, en su caso, la de la familia Phi subyacente.
- Es un ajuste fino de dominio clinico: existe riesgo elevado de alucinacion en recomendaciones medicas y no debe usarse como herramienta diagnostica ni terapeutica sin validacion profesional.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- La longitud de contexto no esta especificada, lo que impide planificar despliegues con documentos largos.
- No hay benchmarks publicados: no es posible comparar su calidad con alternativas de forma objetiva.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_M o superiores para uso practico.
- El repositorio tiene muy poca traccion (30 descargas, 0 likes) y no procede de un laboratorio con reputacion verificable en el dominio medico.
- Los sesgos del modelo base (demograficos, geograficos, de practica clinica) se heredan sin mitigacion documentada.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en integraciones que dependan de ello.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Phi_medner-cardiovascular-_-pulmonary-GGUF
- Modelo base: https://huggingface.co/emilykang/Phi_medner-cardiovascular-_-pulmonary
- Cuantizaciones imatrix del mismo autor: https://huggingface.co/mradermacher/Phi_medner-cardiovascular-_-pulmonary-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Phi_medner-cardiovascular-_-pulmonary-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
