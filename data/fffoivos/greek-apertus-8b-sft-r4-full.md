# fffoivos/greek-apertus-8b-sft-r4-full

## Resumen

greek-apertus-8b-sft-r4-full es un ajuste supervisado (SFT) publicado por el usuario fffoivos sobre fffoivos/apertus-8b-greek-cpt, que a su vez es una adaptacion al griego mediante preentrenamiento continuado (CPT) de la familia Apertus, desarrollada en el marco de la iniciativa suiza de IA abierta (Swisscom, ETH Zurich y EPFL, entre otros). El resultado es un modelo de chat de 8.200.138.816 parametros orientado a conversacion en griego moderno, con soporte declarado tambien para ingles.

El problema que aborda es la escasez de modelos abiertos de proposito general con calidad suficiente en griego: la mayoria de los modelos de ~8B estan dominados por ingles y ofrecen un rendimiento limitado en lenguas con menos recursos. Este modelo intenta cubrir ese hueco combinando un preentrenamiento continuado en griego con una fase posterior de ajuste por instrucciones.

Es relevante ahora porque se distribuye bajo licencia Apache 2.0, un tamano que cabe en una unica GPU de 24 GB en bfloat16 y que permite despliegue on-premise sin dependencia de APIs propietarias. Como contrapartida, el repositorio esta restringido (gated), no tiene descargas ni valoraciones publicas y no publica resultados de benchmarks, por lo que su calidad real no esta validada de forma independiente en la informacion disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Apertus; no se detalla en la informacion proporcionada) |
| Parametros totales | 8.200.138.816 (8,2 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se han publicado versiones GGUF, GPTQ ni AWQ) |
| Idiomas soportados | griego (el) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16,4 GB en el repositorio, compatible con bfloat16) |

Otros datos: identificador fffoivos/greek-apertus-8b-sft-r4-full, acceso restringido mediante aceptacion de condiciones en HuggingFace, 0 descargas y 0 likes, creado el 16 de septiembre de 2026 y actualizado el mismo dia.

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. El modelo deriva de fffoivos/apertus-8b-greek-cpt, un checkpoint de preentrenamiento continuado en griego construido sobre la familia Apertus; la ficha no especifica si se trata de un transformer denso, de una mezcla de expertos ni las innovaciones tecnicas del modelo base original.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del corpus (proporcion de griego frente a ingles, dominio de las fuentes, uso de datos sinteticos), la longitud de contexto usada durante el entrenamiento ni si se aplicaron fases de alineacion adicionales como RLHF, DPO o RLAIF. El sufijo "r4-full" del identificador sugiere una ejecucion de ajuste por etapas ("r4") con actualizacion de pesos completos ("full"), pero esta interpretacion no esta confirmada por ninguna documentacion publicada. Toda la informacion sobre el proceso de entrenamiento debe considerarse, por tanto, no disponible.

## Capacidades

- Generacion de texto y conversacion multi-turno en griego e ingles, segun los idiomas declarados en el repositorio.
- Ajuste por instrucciones (la etiqueta sft y el sufijo chat indican un modelo entrenado para seguir ordenes y mantener dialogos).
- Capacidad multilingue limitada a griego e ingles; no se declaran otros idiomas.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible (no documentado).
- Capacidades de codigo y matematicas: no disponible, no se han publicado evaluaciones al respecto.

## Casos de uso

- Atencion al cliente en griego: el modelo puede gestionar conversaciones multi-turno con usuarios grecoparlantes en sectores como banca, telecomunicaciones o turismo. Antes de produccion hay que verificar la longitud de contexto real y la tasa de alucinacion, ya que no hay benchmarks publicados.
- Traduccion y localizacion griego-ingles: util para traducir textos de producto, interfases y documentacion tecnica, aprovechando que el modelo declara ambos idiomas. Se recomienda validacion humana en textos legales o medicos.
- Redaccion y resumen de documentos administrativos griegos: resumen de circulares, contratos o expedientes publicos, con la salvedad de que el contexto maximo no esta documentado y los documentos largos podrian requerir troceado.
- Asistente educativo para estudiantes griegos: generacion de explicaciones, ejercicios y resumenes de material academico en griego moderno, con supervision docente para evitar la propagacion de errores factuales.
- Investigacion en PLN griego: uso como linea base de 8B en experimentos de evaluacion, comparacion con otros modelos griegos y analisis de sesgos linguisticos en griego moderno.
- Datos sinteticos para aumentar corpus griegos: generacion de pares pregunta-respuesta y parafrasis en griego para alimentar pipelines de entrenamiento posteriores, siempre con filtrado y deduplicacion.
- Punto de partida para ajuste de dominio: al ser un modelo de 8,2B con licencia Apache 2.0, se puede afinar sobre dominios verticales (naval, seguros, sector publico heleno) en una unica GPU de 24 GB con tecnicas como LoRA o QLoRA.
- Despliegue on-premise en organizaciones con requisitos de soberania del dato: al poder ejecutarse en hardware propio y no depender de APIs externas, encaja en entornos donde el texto no puede salir de la infraestructura del cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones especificas para griego (por ejemplo, conjuntos de comprension lectora o clasificacion en griego), ni comparaciones verificables con otros modelos.

## Requisitos de hardware

Estimaciones orientativas calculadas a partir del numero de parametros (8.200.138.816), no medidas publicadas por el autor:

- Pesos en bfloat16/float16: aproximadamente 16,4 GB solo de pesos, mas cache KV. Requiere GPU de 24 GB como minimo para contexto corto (RTX 3090, RTX 4090, A10G 24 GB) y 40-80 GB (A100 40 GB, A100 80 GB, H100) para contextos largos y lotes grandes.
- Cuantizacion de 8 bits: aproximadamente 8-9 GB de pesos; cabe en RTX 4080 16 GB, RTX 3080 16 GB y superiores. La cuantizacion no esta publicada por el autor; habria que generarla.
- Cuantizacion de 4 bits: aproximadamente 5-6 GB de pesos; cabe en GPU de consumo de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 8 GB) con contexto reducido. Requiere conversion previa a GGUF.
- CPU y memoria del sistema: la inferencia en CPU es viable con cuantizacion de 4-8 bits, asumiendo entre 8 y 16 GB de RAM para los pesos y margen adicional para la cache.
- Opciones de despliegue: transformers (formato nativo safetensors), vLLM y TGI para servicio en GPU; llama.cpp y Ollama requieren convertir los pesos a GGUF, ya que no se han publicado archivos GGUF en el repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion para ninguna configuracion de hardware.

## Comparativa con modelos similares

Los datos de los modelos de comparacion proceden de su documentacion publica habitual y deben verificarse antes de tomar decisiones de produccion; los campos no confirmados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Idiomas principales | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| greek-apertus-8b-sft-r4-full | 8,2B | no disponible | griego, ingles | Apache 2.0 | HuggingFace, acceso restringido |
| Llama-3.1-8B-Instruct | 8,03B | 128K | multilingue con foco en ingles | Llama 3.1 Community License | HuggingFace, acceso abierto con condiciones |
| Qwen2.5-7B-Instruct | ~7,6B | 128K (32K de generacion por defecto) | multilingue, fuerte en chino e ingles | Apache 2.0 | HuggingFace, acceso abierto |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32K | ingles y europeas | Apache 2.0 | HuggingFace, acceso abierto |
| Meltemi-7B (familia griega de ILSP) | ~7B | no disponible | griego, ingles | no disponible | HuggingFace, acceso abierto |

Consideraciones de la comparativa: frente a Llama 3.1 8B o Qwen2.5 7B, este modelo parte de un preentrenamiento continuado especifico en griego, lo que en principio favorece la calidad en esa lengua, pero carece de evaluaciones publicadas que confirmen dicha ventaja. Frente a alternativas abiertas como Mistral 7B, la licencia Apache 2.0 es mas permisiva que la Llama Community License. Frente a los modelos griegos de la familia Meltemi, no se dispone de datos comparativos de rendimiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados publicados de MMLU, evaluaciones en griego ni pruebas de codigo o matematicas, por lo que el rendimiento real es desconocido.
- Sin validacion de la comunidad: el repositorio tiene 0 descargas y 0 likes, no hay issues, discusiones ni casos de uso documentados.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar los pesos, lo que anade friccion a la evaluacion y a la reproducibilidad.
- Riesgo de alucinacion: al ser un modelo de 8B ajustado por SFT y sin datos de alineacion conocidos, es esperable que genere afirmaciones plausibles pero falsas, especialmente en dominios especializados y en fechas, cifras y referencias legales.
- Contexto no documentado: se desconoce la ventana de contexto, por lo que no se puede asumir el manejo de documentos largos ni de conversaciones extensas.
- Variedad linguistica del griego: no hay informacion sobre el tratamiento de variantes como el griego chipriota, el pontico o registros formales (katharevousa) frente a la lengua estandar.
- Posible degradacion del ingles: tras el preentrenamiento continuado en griego y el ajuste posterior, la competencia en ingles puede haberse reducido respecto al modelo base original; no hay evaluaciones que lo confirmen o desmientan.
- Herencia de sesgos: no se documenta la composicion del corpus de preentrenamiento ni del conjunto de instrucciones, por lo que los sesgos presentes en esos datos se trasladan al modelo sin posibilidad de auditarlos con la informacion disponible.
- Restricciones de licencia: este modelo se distribuye como Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base (fffoivos/apertus-8b-greek-cpt) y de la familia Apertus, asi como las obligaciones de atribucion que pudieran aplicar en la cadena de derivacion.
- Despliegue: no existen cuantizaciones publicadas (GGUF, AWQ, GPTQ), por lo que cualquier optimizacion para hardware de consumo debe realizarla el usuario y validarla, asumiendo posibles perdidas de calidad.
- Sin garantias de mantenimiento: es un checkpoint de autor individual, sin evidencia de soporte, versionado continuo ni actualizaciones posteriores al dia de su publicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fffoivos/greek-apertus-8b-sft-r4-full
- Modelo base (preentrenamiento continuado en griego): https://huggingface.co/fffoivos/apertus-8b-greek-cpt
- Otros enlaces (papers, blogs, repositorios o demos): no disponible. Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo ni sobre su familia; los resultados obtenidos correspondian a directorios de organizaciones juveniles de Viena y no guardan relacion con el modelo.
