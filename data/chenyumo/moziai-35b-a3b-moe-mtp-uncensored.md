# chenyumo/moziAI-35B-A3B-MOE-MTP-Uncensored

## Resumen

MoziAier-35B-V3.9 es un modelo de lenguaje multimodal de tipo Mixture of Experts (MoE) desarrollado por el equipo de Chen Yumo, orientado al dominio financiero y publicado bajo el identificador `chenyumo/moziAI-35B-A3B-MOE-MTP-Uncensored` en Hugging Face. Con 34.660.610.688 parametros totales (aproximadamente 35B), se construye sobre el modelo base `ornith-ai/Ornith-1.5-35B-A3B`, aunque la model card indica que esta version cambia el sustrato a Occamy-1.0-35B-A3B, de arquitectura Qwen3.6-35B-A3B. El modelo se distribuye principalmente en formato GGUF para llama.cpp y esta disenado para ejecutarse localmente, incluso en GPU de consumo.

La propuesta central de esta version es la capacidad de "long-horizon": ejecucion estable de tareas multi-paso a lo largo de una ventana de contexto de clase 250K (256K tokens, 262.144 en concreto). Esto lo hace adecuado para agentes que encadenan decenas de llamadas a herramientas, analisis de documentos extensos o trabajo de ingenieria sobre multiples ficheros. Ademas, incorpora vision (lectura de capturas de pantalla y graficos), tool calling con llamadas paralelas y un modo de razonamiento estructurado en siete dimensiones con mecanismo de auto-verificacion (LOOP).

El aspecto mas diferenciador es su esquema de cuantizacion hibrida propietario, MoziSmartBit, que reduce el fichero principal a 12,99 GB (IQ3_XXS en las capas de expertos con imatrix de occamy), frente a los 21-22 GB tipicos de un Q4_K_M para un MoE de 35B. Esto baja el suelo de VRAM a 8 GB con offload a RAM del sistema. El modelo se declara "uncensored" y libre para uso comercial, con soporte principal de chino e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arquitectura Qwen3.6-35B-A3B, base Occamy-1.0-35B-A3B) |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | no disponible (etiquetado como A3B, sin cifra exacta publicada) |
| Longitud de contexto | 262.144 tokens (256K; presets recomendados de 192K en 16 GB y 250K en 24 GB+) |
| Tipos de cuantizacion | MoziSmartBit hibrida (IQ3_XXS en capas de expertos + imatrix occamy); mmproj en Q8_0 |
| Idiomas soportados | chino (en), ingles (zh); chino especialmente ajustado |
| Licencia | other (la model card indica "free for commercial use") |
| Formato de pesos | GGUF (llama.cpp); plantilla de chat embebida en `tokenizer.chat_template` |
| Tamano del fichero principal | 12,99 GB (IQ3_XXS) |
| Fichero de vision | 0,57 GB (mmproj Q8_0) |
| Perdida de cuantizacion | PPL 8,3044 (+0,47% frente a BF16) |
| Decodificacion especulativa | no soportada (sin cabeza MTP; debe permanecer desactivada) |
| Tamano del repositorio | 62,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo Mixture of Experts con 35B parametros totales y la designacion A3B, que sugiere del orden de 3B parametros activos por token, aunque la cifra exacta de parametros activos no se publica en la informacion disponible. La arquitectura declarada es Qwen3.6-35B-A3B, implementada sobre el modelo base Occamy-1.0-35B-A3B. La model card menciona que el equipo combina este sustrato con su propia metodologia de entrenamiento, un marco de razonamiento en siete dimensiones y un mecanismo de agente denominado LOOP, orientado a la auto-verificacion en tareas complejas.

No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica mas documentada es la cuantizacion hibrida MoziSmartBit, que aplica IQ3_XXS a las capas de expertos con una imatrix especifica de occamy y logra una perdida de perplejidad de solo +0,47% respecto a BF16. Tambien destaca la integracion de la plantilla de chat directamente en el GGUF, lo que elimina la necesidad de un fichero jinja externo. El modelo no incorpora cabeza MTP, por lo que la decodificacion especulativa no esta disponible y debe desactivarse explicitamente en los despliegues.

## Capacidades

- Generacion de texto y razonamiento estructurado mediante un marco de siete dimensiones que adapta la profundidad del pensamiento a la complejidad de la tarea.
- Razonamiento multi-paso con mecanismo LOOP de auto-verificacion para tareas de largo horizonte.
- Tool calling y function calling, con formato correcto en llamadas de un solo turno y multi-turno, y soporte de llamadas paralelas.
- Capacidades de agente: ejecucion estable de decenas de llamadas a herramientas dentro de una ventana de contexto de clase 250K.
- Vision: lectura de capturas de pantalla locales y comprension de graficos mediante el proyector mmproj.
- Dominio financiero: preguntas y respuestas financieras, codificacion de estrategias cuantitativas y uso de herramientas en ese contexto.
- Capacidades multilingues con chino e ingles como idiomas principales, con ajuste especial del chino.
- Modo "uncensored": el autor declara ausencia de filtros de rechazo, lo que amplia el rango de respuestas pero traslada al usuario la responsabilidad de uso.
- Analisis de documentos largos y trabajo sobre multiples ficheros sin perder el hilo de la tarea.

## Casos de uso

- Agentes autonomos de larga duracion: el modelo puede encadenar decenas de llamadas a herramientas y mantener el estado de la tarea dentro de una ventana de hasta 262.144 tokens, lo que permite flujos de automatizacion que no caben en modelos de contexto corto.
- Analisis de documentacion financiera extensa: informes anuales, prospectos o transcripciones de resultados pueden cargarse completos en contexto para extraccion de cifras, comparativas y resumenes con trazabilidad a la fuente.
- Generacion y revision de codigo cuantitativo: soporta tool calling para integrarse en pipelines que ejecutan tests, consultan APIs de datos de mercado o validan estrategias, y su contexto largo permite trabajar sobre repositorios completos.
- Asistencia en atencion al cliente especializada: conversaciones multi-turno con historial largo e integracion de herramientas de consulta de cuentas o productos, con la ventaja de despliegue local para datos sensibles.
- Ingenieria sobre multiples ficheros: tareas de refactorizacion o auditoria que requieren leer y correlacionar varios archivos, aprovechando la estabilidad multi-paso declarada en contexto de clase 250K.
- Analisis de graficos e imagenes tecnicas: con el proyector de vision puede leer capturas de pantalla, dashboards y graficos financieros para extraer tendencias o valores.
- Despliegue en entornos con hardware limitado: al caber en 8 GB de VRAM con offload y en 16 GB con contexto de 192K, permite prototipado local de agentes sin depender de infraestructura cloud.
- Procesamiento por lotes de documentos en equipos de consumo: con 12,99 GB de fichero y KV cache q4_0, un equipo con 24 GB puede ejecutar la ventana completa mas vision de forma segura.

## Benchmarks y rendimiento

La model card no publica cifras numericas de MMLU, GSM8K ni HumanEval; solo indica que existe una evaluacion "MoziAier-35B-3.9" sobre esos benchmarks sin desglosar resultados. Los unicos datos cuantitativos disponibles son los siguientes:

| Metrica | Resultado |
|---|---|
| Perdida de cuantizacion (PPL) | 8,3044 (+0,47% frente a BF16) |
| Contexto largo | Prueba de estres de clase 250K superada; recuperacion precisa de hechos plantados |
| Tool calling | Formato correcto en un turno y multi-turno; llamadas paralelas soportadas |
| Vision | Comprension de capturas de pantalla y lectura de graficos verificadas |
| MMLU / GSM8K / HumanEval | no disponible (sin cifras publicadas) |

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM minima: 8 GB, con offload de capas a RAM del sistema; contexto resultante de 16K-32K con KV cache q4_0 y velocidad reducida.
- VRAM recomendada: 16 GB para contexto de 192K (unos 0,4 GB de margen); 24 GB o mas para 256K completo con vision.
- Configuracion medida: 16 GB de VRAM con contexto de 250K consume aproximadamente 15,5 GB, en el limite; el autor recomienda probarlo en el propio equipo.
- El KV cache debe ser q4_0; con q8_0 la VRAM se incrementa lo suficiente como para no caber en una tarjeta de 16 GB.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible; los presets se expresan por cantidad de VRAM.
- Cabe en GPU de consumo: si, desde 8 GB con offload y de forma holgada en 16 GB y 24 GB.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`, `-ngl 999`, `-fa on`, `-ctk q4_0 -ctv q4_0`), Ollama (via Modelfile), LM Studio y Jan. El servidor por defecto usa el puerto 20016 y expone API compatible con `/v1/chat/completions`.
- No debe pasarse `--chat-template-file`: la plantilla ya esta embebida en el GGUF y un fichero externo la sobrescribiria.
- Decodificacion especulativa: debe permanecer desactivada (sin cabeza MTP).
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo advierte que el modo con offload es mas lento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion tipica | Licencia | Notas |
|---|---|---|---|---|---|
| MoziAier-35B-V3.9 (este modelo) | ~35B MoE | 262.144 | IQ3_XXS hibrida, 12,99 GB | other (uso comercial declarado) | Vision, tool calling, modo uncensored, plantilla embebida |
| Q4_K_M de un MoE de 35B (referencia del autor) | ~35B MoE | segun modelo | Q4_K_M, 21-22 GB | segun modelo | Sin las optimizaciones de MoziSmartBit; mayor huella en disco |
| Ornith-1.5-35B-A3B (modelo base declarado) | ~35B MoE | no disponible | no disponible | no disponible | Sustrato original; la model card indica que los numeros de V3.8 no son comparables con V3.9 |
| Occamy-1.0-35B-A3B (base de V3.9) | ~35B MoE | no disponible | no disponible | no disponible | Arquitectura Qwen3.6-35B-A3B; referencia de evaluacion de esta version |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y formato de distribucion.

## Limitaciones y advertencias

- La etiqueta "uncensored" implica ausencia declarada de filtros de rechazo; en produccion es necesario implementar controles propios de contenido y cumplimiento normativo.
- Riesgo de alucinacion no cuantificado: no se publican tasas de error ni evaluaciones de fidelidad, y el dominio financiero es especialmente sensible a inexactitudes.
- Idiomas: soporte principal de chino e ingles; el rendimiento en castellano no esta documentado y no deberia asumirse.
- La licencia es "other" con declaracion de uso comercial gratuito en la model card; conviene revisar los terminos exactos antes de un despliegue comercial, ya que la etiqueta de Hugging Face no es una licencia estandar.
- Sin cabeza MTP: la decodificacion especulativa no esta disponible y debe desactivarse; activarla puede degradar el rendimiento o fallar.
- El KV cache debe ser q4_0; usar q8_0 rompe el preset de 16 GB y puede impedir la carga.
- El contexto de 250K en 16 GB queda en el limite medido (unos 15,5 GB); es necesario validar estabilidad en el hardware concreto.
- Con 8 GB de VRAM el modelo funciona con offload a RAM, con latencia notablemente mayor; no es adecuado para cargas interactivas exigentes.
- No se detallan datos de entrenamiento, composicion del dataset ni proceso de alineacion, lo que dificulta evaluar sesgos conocidos.
- El repositorio ocupa 62,3 GB, muy por encima del fichero principal; la descarga completa puede no ser necesaria si solo se requieren los GGUF.
- La model card mezcla referencias a distintos modelos base (Ornith-1.5 y Occamy-1.0), lo que complica la trazabilidad de las evaluaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenyumo/moziAI-35B-A3B-MOE-MTP-Uncensored
- Modelo base declarado: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- README en chino simplificado: README.zh.md (referenciado en la model card)
- README en chino tradicional: README.zh-hant.md (referenciado en la model card)
- README en japones: README.ja.md (referenciado en la model card)
- README en coreano: README.ko.md (referenciado en la model card)
- README en hindi: README.hi.md (referenciado en la model card)
- README en aleman: README.de.md (referenciado en la model card)
- README en frances: README.fr.md (referenciado en la model card)
- README en neerlandes: README.nl.md (referenciado en la model card)
- README en italiano: README.it.md (referenciado en la model card)
- README en ruso: README.ru.md (referenciado en la model card)
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
