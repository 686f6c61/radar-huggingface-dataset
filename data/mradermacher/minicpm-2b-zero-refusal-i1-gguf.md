# mradermacher/Minicpm-2B-Zero-Refusal-i1-GGUF

## Resumen

Minicpm-2B-Zero-Refusal-i1-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por el usuario mradermacher a partir del modelo OpenIntelligenceNet/Minicpm-2B-Zero-Refusal. No es un modelo entrenado desde cero, sino una conversión a cuantización de un modelo preexistente, generada con el flujo habitual de mradermacher (conversión desde pesos HuggingFace, cuantización con imatrix y versionado quantize_version 2). La etiqueta "i1" del nombre identifica las cuantizaciones ponderadas con matriz de importancia (imatrix) de este autor.

El interés práctico del repositorio es el despliegue local: los ficheros GGUF permiten ejecutar el modelo en llama.cpp, Ollama o servidores compatibles sin GPU de gama alta, algo relevante para un modelo pequeño orientado a entornos con recursos limitados. El sufijo "Zero-Refusal" del modelo base sugiere un ajuste orientado a eliminar rechazos de contenido, lo que condiciona fuertemente su uso en producción.

La información publicada es muy escasa: el repositorio no declara licencia, idiomas, longitud de contexto ni resultados de evaluación, y el dato de safetensors del repositorio (774,438) no coincide con el "2B" del nombre del modelo base, discrepancia no aclarada. Tampoco se han encontrado resultados de búsqueda web relevantes sobre este modelo; las consultas devolvieron únicamente páginas de ayuda sobre Facebook, sin relación con el contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Presumiblemente transformer denso, derivado de la familia MiniCPM, pero no confirmado en la informacion proporcionada |
| Parametros totales | 774,438 segun el dato de safetensors del repositorio; el nombre del modelo base indica 2B. Discrepancia no aclarada |
| Parametros activos | No aplica segun la informacion disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small-IQ4_NL), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye presumiblemente en safetensors, no incluidos en este repositorio |
| Tamano del repositorio | 0,0 GB segun los metadatos, dato inconsistente con un repositorio que deberia contener multiples ficheros GGUF |
| Descargas / likes | 0 descargas, 0 likes |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

No hay informacion tecnica publicada en el repositorio sobre la arquitectura del modelo subyacente, el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de alineacion como RLHF o DPO. Lo unico documentado en la model card son los metadatos del proceso de cuantizacion: quantize_version 2, output_tensor_quantised 1, convert_type hf, y la indicacion explicita de que se trata de "weighted/imatrix quants" del modelo OpenIntelligenceNet/Minicpm-2B-Zero-Refusal. El tag "nicoboss" hace referencia al tooling de cuantizacion con imatrix empleado en el proceso.

La innovacion tecnica relevante en este repositorio es precisamente el uso de matriz de importancia (imatrix) para las cuantizaciones de baja precision. Este metodo calcula, sobre un corpus de calibracion, la importancia relativa de cada peso y ajusta la asignacion de bits, de modo que los niveles de compresion agresivos (IQ1, IQ2, IQ3) conservan mas calidad que una cuantizacion uniforme equivalente. El autor ofrece una matriz de cuantizaciones muy amplia, desde IQ1_S hasta Q6_K, lo que permite seleccionar el compromiso entre tamano y fidelidad. No se dispone de informacion sobre la arquitectura del modelo base, su tokenizador, la longitud de contexto original ni los datos de entrenamiento posteriores (el ajuste "Zero-Refusal").

## Capacidades

- Generacion de texto en el modelo base, presumiblemente conversacional, aunque no se documentan capacidades especificas en el repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- No se documenta modo de razonamiento explicito (thinking mode), vision, audio ni otras modalidades.
- El ajuste "Zero-Refusal" del modelo base implica, por el nombre, una reduccion deliberada de los rechazos ante peticiones que otros modelos alineados denegarian; no se especifica el metodo empleado (abliteracion, fine-tuning con datos sin filtro, etc.).
- Cualquier afirmacion sobre capacidades concretas (codigo, matematicas, seguimiento de instrucciones) carece de respaldo documental en la informacion proporcionada.

## Casos de uso

- Inferencia local en equipos sin GPU dedicada: las cuantizaciones Q4_K_M o IQ4_XS de un modelo de este tamano pueden ejecutarse con llama.cpp en CPU con unos pocos gigabytes de RAM, lo que permite desplegar un asistente de texto en portatiles o mini-PC.
- Prototipado rapido de aplicaciones conversacionales: usar Ollama o llama.cpp para levantar un endpoint local y validar prompts, plantillas de chat y flujos de conversacion antes de migrar a un modelo mayor.
- Pruebas de cuantizacion y evaluacion de degradacion: el repositorio ofrece 24 variantes de cuantizacion, lo que permite medir empiricamente la perdida de calidad entre IQ1_S y Q6_K sobre la misma tarea.
- Investigacion sobre alineacion y rechazo de contenido: un modelo etiquetado como "Zero-Refusal" sirve como caso de estudio para analizar el comportamiento de modelos sin capas de rechazo, siempre en entornos controlados y con las salvaguardas externas adecuadas.
- Generacion de texto sin conexion en entornos aislados (air-gapped): al ser pesos GGUF ejecutables localmente, el modelo puede desplegarse en redes sin acceso a internet.
- Tareas de generacion de texto de baja criticidad con requisitos de coste minimo: clasificacion de textos, resumenes cortos, reformulacion o extraccion de entidades simples en pipelines por lotes donde no se requiere maxima precision.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni cualquier aplicacion orientada al usuario final sin una evaluacion previa de seguridad y sin una licencia verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de mediciones reales de latencia ni de throughput. Las cifras siguientes son estimaciones derivadas del tamano de parametros indicado por el nombre del modelo (aproximadamente 2B) y del numero de bits de cada cuantizacion.

| Cuantizacion | Tamano estimado del fichero | VRAM/RAM estimada en inferencia |
|---|---|---|
| IQ1_S | ~0,4-0,6 GB | ~0,8-1,0 GB |
| IQ2_M | ~0,7-0,9 GB | ~1,1-1,4 GB |
| Q3_K_M | ~1,0-1,2 GB | ~1,4-1,8 GB |
| IQ4_XS / Q4_K_S | ~1,1-1,4 GB | ~1,5-2,0 GB |
| Q4_K_M | ~1,2-1,5 GB | ~1,7-2,2 GB |
| Q5_K_M | ~1,4-1,7 GB | ~2,0-2,5 GB |
| Q6_K | ~1,7-2,0 GB | ~2,3-2,9 GB |

- Si el dato real de parametros fuese 774 millones en lugar de 2B, los tamanos anteriores se reducirian aproximadamente a un 40 por ciento.
- Cabe en GPU de consumo con holgura: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) puede ejecutar las cuantizaciones Q4 y superiores. Las cuantizaciones IQ1 e IQ2 caben incluso en iGPU con memoria compartida.
- GPU de datacenter (A100, H100) no estan justificadas para este tamano de modelo salvo por agregacion de muchas instancias en el mismo dispositivo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con GGUF. vLLM y TGI soportan GGUF de forma limitada o experimental, por lo que no son la via recomendada.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo de 2B en Q4 genera del orden de decenas de tokens por segundo en CPU moderna y varios cientos en GPU de consumo, pero no hay mediciones publicadas para este repositorio concreto.
- Advertencia: los metadatos indican un tamano de repositorio de 0,0 GB, lo que sugiere que los ficheros GGUF podrian no estar efectivamente subidos o que la informacion esta incompleta. Conviene verificar la lista de ficheros antes de planificar el despliegue.

## Comparativa con modelos similares

La comparativa se realiza a nivel de categoria (modelos densos de 1,5 a 3 mil millones de parametros, desplegables en local). Los datos de los modelos alternativos proceden de informacion publica general y no han podido verificarse en la busqueda realizada.

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Minicpm-2B-Zero-Refusal-i1-GGUF | 774,438 segun safetensors; 2B segun el nombre | No disponible | No disponible | GGUF (24 cuantizaciones) |
| MiniCPM-2B (OpenBMB) | ~2,4B | 4096 tokens | Apache 2.0 con declaracion de uso | Safetensors, GGUF en terceros |
| Qwen2.5-1.5B-Instruct | ~1,54B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF, integrado en multiples runtimes |
| Gemma-2-2B-it | ~2,6B | 8192 tokens | Gemma Terms of Use | Safetensors, GGUF, Ollama |

No hay datos de rendimiento del modelo analizado que permitan una comparacion cuantitativa con estas alternativas. A igualdad de tamano, Qwen2.5-1.5B-Instruct y Gemma-2-2B-it cuentan con licencias explicitas, documentacion completa y evaluaciones publicadas, ventajas relevantes frente a un repositorio sin licencia declarada ni benchmarks.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no puede asumirse permiso de uso comercial, modificacion ni redistribucion. Es imprescindible contactar con el autor o verificar la licencia del modelo base antes de cualquier uso en produccion.
- El nombre "Zero-Refusal" indica un ajuste orientado a reducir o eliminar los rechazos de contenido. Esto incrementa de forma significativa el riesgo de generar contenido danino, ilegal o sensible ante peticiones adversas, y descarta su uso directo en aplicaciones orientadas al usuario final sin filtros externos.
- Riesgo de alucinacion inherente a los modelos de este tamano, agravado por la falta de evaluaciones publicadas y por las cuantizaciones de muy baja precision (IQ1, IQ2), que degradan la fidelidad del texto generado.
- Las cuantizaciones por debajo de Q3 suelen producir perdidas notables de coherencia y de seguimiento de instrucciones; no son recomendables para tareas que requieran precision.
- No se ha documentado la longitud de contexto soportada, los idiomas cubiertos ni el comportamiento multilingue. No puede asumirse un soporte fiable del castellano.
- El modelo base es una creacion de un tercero (OpenIntelligenceNet) sin informacion publica verificable sobre su proceso de entrenamiento, lo que impide auditar sesgos, procedencia de datos ni cumplimiento normativo.
- Sesgos conocidos: no disponibles. La ausencia de documentacion impide evaluar sesgos de genero, raza, religion o idioma.
- Trazabilidad dudosa: 0 descargas, 0 likes y un tamano de repositorio de 0,0 GB indican que el artefacto no ha sido validado por la comunidad. Conviene verificar la integridad de los ficheros GGUF antes de su uso.
- Las cuantizaciones imatrix requieren versiones razonablemente recientes de llama.cpp para interpretar correctamente los tensores; versiones antiguas pueden fallar al cargar o producir resultados incorrectos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Minicpm-2B-Zero-Refusal-i1-GGUF
- Modelo base: https://huggingface.co/OpenIntelligenceNet/Minicpm-2B-Zero-Refusal
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- llama.cpp (runtime recomendado para GGUF): https://github.com/ggml-org/llama.cpp
- MiniCPM (proyecto original de OpenBMB, posible origen de la arquitectura base): https://github.com/OpenBMB/MiniCPM
- Resultados de busqueda web: no se han encontrado enlaces relevantes. Las consultas devolvieron unicamente paginas de ayuda sobre Facebook (foros.commentcamarche.net, es.ccm.net, zdnet.fr), sin ninguna relacion con el modelo.
