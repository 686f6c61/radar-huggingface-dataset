# mradermacher/Artemis-31B-v1.1-heretic-GGUF

## Resumen

Artemis-31B-v1.1-heretic es un modelo de lenguaje de 30.697.345.596 parámetros (aproximadamente 31B) derivado de `sh0ck0r/Artemis-31B-v1.1-heretic` y publicado en formato GGUF por mradermacher, un conocido cuantizador de la comunidad de Hugging Face. El modelo base pertenece a la familia de variantes "heretic", una técnica de edición de pesos que elimina o atenúa los mecanismos de rechazo aprendidos durante el alineamiento, dando lugar a un modelo "abliterated" o "decensored" que responde a peticiones que un modelo alineado convencional rechazaría. La ficha que nos ocupa es la distribución cuantizada, no el modelo original.

El repositorio incluye un conjunto completo de cuantizaciones estáticas en formato GGUF (Q2_K hasta Q8_0, además de IQ4_XS) y dos ficheros `mmproj` que actúan como suplemento multimodal, lo que indica que el modelo base es capaz de procesar imágenes además de texto. El tamaño total del repositorio es de 213,9 GB, reflejo de la suma de todas las variantes publicadas.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de ~31B en hardware de consumo mediante cuantizaciones de 4 bits (17,9-18,8 GB); por otro, documenta un caso de uso controvertido (modelos sin censura) que conviene evaluar con criterios técnicos y de cumplimiento antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Artemis-31B; no se detalla en la informacion proporcionada) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles, segun la model card del autor) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |
| Tamano del repositorio | 213,9 GB (todas las variantes) |
| Fecha de creacion | 2026-08-29 |
| Ultima actualizacion | 2026-10-09 |
| Descargas | 1.096 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el nombre y el tamano (31B) se trata presumiblemente de un transformer decoder-only, pero no se confirma en la model card. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Lo que si es relevante tecnicamente es el proceso de "abliteration" o edicion de pesos que da lugar a la variante "heretic": se trata de una modificacion post-entrenamiento que identifica y neutraliza las direcciones de activacion asociadas al rechazo de peticiones, sin reentrenar el modelo. El resultado conserva en gran medida las capacidades del modelo original pero elimina la mayor parte de las negativas aprendidas. El autor etiqueta el proceso como "reproducible", lo que sugiere que la metodologia esta documentada en el repositorio del modelo base. La presencia de ficheros `mmproj` confirma que el modelo base es multimodal (vision-lenguaje), aunque la model card no detalla el encoder visual ni la resolucion de imagen soportada.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Procesamiento de imagenes: los ficheros `mmproj-Q8_0` y `mmproj-f16` habilitan entrada multimodal en llama.cpp y derivados.
- Respuestas sin rechazo: el alineamiento de seguridad ha sido atenuado o eliminado, por lo que el modelo no aplica las negativas tipicas de modelos alineados.
- Capacidades de razonamiento y codigo: no documentadas explicitamente en la informacion disponible; se heredan presumiblemente del modelo base Artemis-31B, pero no hay confirmacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card declara unicamente `en`; no se confirma soporte de castellano ni de otros idiomas.
- Modo de pensamiento (thinking): no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como referencia para estudiar que capacidades se ven afectadas por la abliteration y cuales se preservan, comparando respuestas frente al modelo base alineado en tareas controladas de evaluacion.
- Generacion creativa sin restricciones de tono: escritura de ficcion, guiones o dialogos que requieran temas adultos o lenguaje crudo, donde los filtros de seguridad de modelos convencionales interrumpen la generacion. La cuantizacion Q4_K_M (18,8 GB) permite ejecutarlo en una unica GPU de consumo.
- Analisis de contenido sensible en entornos cerrados: clasificacion o resumen de material textual que incluya lenguaje ofensivo o temas delicados, en un pipeline interno donde el operador asume la responsabilidad del contenido.
- Pruebas de robustez y red teaming: generacion de respuestas adversarias para evaluar filtros de moderacion propios, usando el modelo como generador de casos limite.
- Prototipado local de asistentes conversacionales en ingles: con Q4_K_S (17,9 GB) o Q5_K_M (21,9 GB) se obtiene un asistente de ~31B ejecutable en una RTX 4090 de 24 GB o en dos GPU de 16 GB, sin dependencia de API externa.
- Procesamiento de documentos con imagenes: gracias a los ficheros `mmproj`, puede extraer y describir contenido visual en flujos de digitalizacion, siempre que el caso de uso no requiera garantias de moderacion.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 11 variantes de cuantizacion, lo que permite medir la degradacion de perplejidad entre Q2_K y Q8_0 en un mismo modelo y calibrar el compromiso tamano/calidad para despliegues propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~12,0 GB de pesos; ~14-15 GB en ejecucion.
  - Q3_K_M: ~15,4 GB; ~17-18 GB en ejecucion.
  - IQ4_XS: ~17,0 GB; ~19-20 GB en ejecucion.
  - Q4_K_M: ~18,8 GB; ~21-22 GB en ejecucion.
  - Q5_K_M: ~21,9 GB; ~24-25 GB en ejecucion.
  - Q6_K: ~25,3 GB; ~27-28 GB en ejecucion.
  - Q8_0: ~32,7 GB; ~35 GB en ejecucion.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q6_K y Q8_0 se recomienda A100 40 GB, H100 80 GB o configuraciones multi-GPU (2x RTX 4090).
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) con Q4_K_M o inferiores; en GPU de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con Q2_K o Q3_K_S y contexto reducido; en GPU de 12 GB no es viable sin offloading a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Para el modelo multimodal se requiere una version de llama.cpp con soporte `mmproj`. vLLM y TGI no consumen GGUF de forma nativa; para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Artemis-31B-v1.1-heretic (GGUF, este repo) | ~30,7B | no disponible | no disponible | GGUF | Multimodal via mmproj; sin alineamiento de seguridad |
| Artemis-31B-v1.1-heretic (base, sh0ck0r) | ~30,7B | no disponible | no disponible | safetensors | Modelo original sin cuantizar |
| Artemis-31B-v1.1-heretic-i1-GGUF (mradermacher) | ~30,7B | no disponible | no disponible | GGUF (imatrix) | Variante con cuantizaciones ponderadas por imatrix |
| Alternativas de ~30B de proposito general | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia de alineamiento de seguridad: al ser una variante "abliterated/decensored", el modelo no aplica negativas ante peticiones daninas, ilegales o eticamente problematicas. No debe exponerse directamente a usuarios finales sin una capa de moderacion externa.
- Riesgo elevado de contenido danino: puede generar instrucciones peligrosas, contenido de odio o material para el que otros modelos declinarian responder. El operador asume la responsabilidad legal y etica del uso.
- Licencia no disponible: no se especifica licencia en la informacion proporcionada, lo que impide confirmar si el uso comercial esta permitido. Verificar en el repositorio del modelo base antes de cualquier despliegue productivo.
- Idioma: la model card declara unicamente ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Contexto: no se ha publicado la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Alucinacion: no hay evaluaciones publicadas de fidelidad; al tratarse de un modelo sin alineamiento, la tendencia a afirmar con seguridad informacion falsa puede no estar mitigada.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- Multimodalidad parcial: los ficheros `mmproj` habilitan vision, pero no se documenta la resolucion de imagen ni el rendimiento en tareas visuales.
- Fecha de creacion futura (2026-08-29): conviene verificar la procedencia y autenticidad del repositorio antes de confiar en el.
- Sin benchmarks: no hay datos publicados que permitan comparar su calidad con modelos de tamano similar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Artemis-31B-v1.1-heretic-GGUF
- Modelo base: https://huggingface.co/sh0ck0r/Artemis-31B-v1.1-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Artemis-31B-v1.1-heretic-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Artemis-31B-v1.1-heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
