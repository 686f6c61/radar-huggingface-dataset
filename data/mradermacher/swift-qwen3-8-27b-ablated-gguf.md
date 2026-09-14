# mradermacher/Swift-Qwen3.8-27b-ablated-GGUF

## Resumen

Swift-Qwen3.8-27b-ablated-GGUF es un repositorio de cuantizaciones GGUF generado por mradermacher a partir del modelo KarlKinda/Swift-Qwen3.8-27b-ablated. Se trata, por tanto, de una publicación derivada: el trabajo original corresponde a KarlKinda y este repositorio aporta exclusivamente los pesos cuantizados en formato GGUF para su uso con llama.cpp y herramientas compatibles. El modelo base cuenta con 26.895.998.464 parámetros (unos 26,9 mil millones) según los metadatos de safetensors, y está etiquetado como modelo de razonamiento "token-efficient" y "efficient-thinking".

La característica más definitoria del modelo es su naturaleza "abliterated" / "decensored": las etiquetas del repositorio (abliterated, uncensored, decensored, heretic) indican que se ha eliminado o reducido el comportamiento de rechazo aprendido durante el alineamiento del modelo original. También aparece la etiqueta lora, lo que sugiere que el proceso de ablación se aplicó mediante un adaptador LoRA, aunque la model card no documenta la metodología con detalle. El resultado es un modelo orientado a generación sin filtros editoriales, pensado para investigación, red teaming y generación de datos, no para despliegues comerciales con requisitos de moderación.

El repositorio es relevante ahora porque permite ejecutar localmente un modelo de ~27B con ventanas de memoria muy contenidas (desde 10,8 GB en Q2_K) en GPUs de consumo, algo impensable con los pesos completos en precisión nativa. La licencia declarada es swift-open-license-1.0 (campo license: other en HuggingFace), y el único idioma soportado declarado es el inglés. No se ha publicado información sobre arquitectura interna, longitud de contexto ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag qwen3_8 y la nomenclatura sugieren una base de la familia Qwen3; no confirmado en la informacion proporcionada) |
| Parametros totales | 26.895.998.464 (~26,9 B), dato de safetensors del modelo base |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF estaticas: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, ademas de f16. Cuantizaciones ponderadas/i-matrix (i1) en repositorio aparte |
| Idiomas soportados | en (ingles) |
| Licencia | swift-open-license-1.0 (campo license: other en HuggingFace) |
| Formato de pesos | GGUF (este repositorio); el modelo base publica pesos en safetensors para transformers |
| Autor de la cuantizacion | mradermacher |
| Modelo base | KarlKinda/Swift-Qwen3.8-27b-ablated |
| Libreria declarada | transformers (con soporte gguf) |
| Tamano del repositorio | 186,3 GB |
| Fecha de creacion (metadatos HF) | 2026-09-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura del modelo base en la informacion proporcionada. La model card de este repositorio es una plantilla estandar de mradermacher para cuantizaciones GGUF y no describe la arquitectura, el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de post-entrenamiento (RLHF, DPO u otras). El unico dato estructural fiable es el recuento de parametros del modelo base: 26.895.998.464 parametros, coherente con un transformer denso de aproximadamente 27 mil millones de parametros.

Lo que si se puede afirmar a partir de las etiquetas es el proceso de post-entrenamiento aplicado por el autor original: las etiquetas abliterated, uncensored, decensored y heretic indican una intervencion sobre el alineamiento de seguridad del modelo, y la etiqueta lora apunta a que dicha intervencion se implemento mediante un adaptador LoRA en lugar de un reentrenamiento completo. La etiqueta reproducible sugiere que el autor documenta el procedimiento, aunque dicha documentacion no forma parte de la informacion disponible aqui. En cuanto a la cuantizacion, el repositorio contiene cuantizaciones estaticas (sin i-matrix) y los metadatos internos indican output_tensor_quantised: 1, convert_type: hf y quantize_version: 2.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarado como conversational.
- Razonamiento multi-paso: el modelo esta etiquetado como reasoning y efficient-thinking, con enfasis en la eficiencia de tokens durante el razonamiento.
- Generacion sin filtros de rechazo: el proceso de ablacion elimina total o parcialmente las negativas del modelo a producir contenido sensible, lo que se traduce en respuestas directas ante peticiones que un modelo alineado rechazaria.
- Generacion de codigo: no declarada explicitamente como capacidad certificada, pero habitual en modelos de la familia Qwen; no hay confirmacion en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada (mas alla de la etiqueta generica reasoning).
- Capacidades multilingues: no; el unico idioma declarado es el ingles.
- Capacidades multimodales: no disponibles. Los metadatos de la cuantizacion incluyen la marca skip_mmproj: 1, lo que indica que no se ha incluido ningun proyector multimodal en este repositorio.
- Modo de razonamiento explicito (thinking mode): no confirmado en la informacion disponible.

## Casos de uso

- Red teaming y evaluacion de seguridad: al ser un modelo abliterated, permite generar de forma controlada los tipos de respuesta que un modelo alineado bloquearia, lo que resulta util para construir baterias de pruebas adversarias, medir la robustez de clasificadores de contenido y validar sistemas de moderacion en entornos aislados.
- Investigacion sobre ablacion y alineamiento: comparar las salidas del modelo base KarlKinda/Swift-Qwen3.8-27b-ablated con las de su predecesor alineado permite estudiar que capacidades y sesgos se ven afectados por la eliminacion de la capa de rechazo, usando la cuantizacion Q4_K_M o Q5_K_M para reproducir experimentos en hardware modesto.
- Generacion de datos sinteticos en ingles: el modelo puede producir grandes volumenes de texto en ingles para fine-tuning o destilacion; la disponibilidad de cuantizaciones desde 10,8 GB permite ejecutar varias instancias en paralelo en un solo servidor con GPUs de 24 GB.
- Escritura creativa de ficcion sin restricciones editoriales: narrativa, guiones y dialogos que requieran violencia, temas adultos o lenguaje explicito, donde los modelos alineados tienden a suavizar o rechazar la peticion; la cuantizacion Q5_K_M (19,3 GB) ofrece un buen equilibrio calidad/tamano.
- Asistente local con privacidad estricta: desplegado con llama.cpp u Ollama en una estacion de trabajo con RTX 4090 o RTX 3090, el modelo procesa texto sin enviar datos a terceros, adecuado para borradores internos, documentacion confidencial o analisis de material sensible.
- Generacion de corpus para pruebas de estres de infraestructura: al poder ejecutarse en formatos de 2 a 8 bits, sirve para medir throughput y latencia de servidores de inferencia (llama-server, Ollama, LM Studio) antes de decidir el hardware definitivo para un modelo mayor.
- Analisis y reescritura de textos largos en ingles: tareas de resumen, reescritura de estilo y extraccion de informacion sobre documentos en ingles; conviene tener en cuenta que no se ha publicado la longitud de contexto soportada, por lo que el limite debe determinarse empiricamente antes de usarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a listar las cuantizaciones y sus tamanos, y las busquedas web realizadas no han devuelto ningun resultado relacionado con este modelo, su modelo base ni con evaluaciones de la familia a la que pertenece.

## Requisitos de hardware

Los tamanos de VRAM son estimaciones derivadas del tamano en disco de cada cuantizacion publicada en la model card, mas un margen orientativo para cache KV y overhead del runtime. No son mediciones del autor.

| Cuantizacion | Tamano en disco | VRAM estimada en inferencia |
|---|---|---|
| Q2_K | 10,8 GB | ~12-13 GB |
| Q3_K_S | 12,2 GB | ~14 GB |
| Q3_K_M | 13,4 GB | ~15 GB |
| Q3_K_L | 14,4 GB | ~16 GB |
| Q4_K_S | 15,7 GB | ~17-18 GB |
| Q4_K_M | 16,6 GB | ~18-19 GB |
| Q5_K_S | 18,8 GB | ~20-21 GB |
| Q5_K_M | 19,3 GB | ~21-22 GB |
| Q6_K | 22,2 GB | ~24 GB, con contexto reducido |
| Q8_0 | 28,7 GB | ~32 GB o superior |
| f16 | ~53,8 GB (estimado a partir de 26,9 B de parametros) | 64 GB o superior |

- GPUs de consumo compatibles: RTX 3060 12 GB y RTX 4070 12 GB solo con Q2_K y contexto corto; RTX 4060 Ti 16 GB y RTX 4080 16 GB con Q3_K_L o Q4_K_S; RTX 3090, RTX 4090 y RTX 5090 (24-32 GB) con Q4_K_M, Q5_K_S y Q5_K_M como opciones recomendadas.
- GPUs profesionales: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB admiten Q8_0 y f16 sin offloading.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (importando el GGUF mediante Modelfile), LM Studio, koboldcpp, llama-cpp-python y text-generation-webui. vLLM y TGI trabajan preferentemente con pesos safetensors, por lo que para esos runtimes conviene partir del repositorio del modelo base en lugar de este.
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas en la informacion proporcionada. La comparacion se limita, por tanto, a las variantes directamente relacionadas con este repositorio.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (GGUF estatico) | ~26,9 B | no disponible | GGUF | swift-open-license-1.0 | Cuantizaciones estaticas de Q2_K a Q8_0 y f16; sin i-matrix |
| mradermacher/Swift-Qwen3.8-27b-ablated-i1-GGUF | ~26,9 B | no disponible | GGUF | swift-open-license-1.0 | Cuantizaciones ponderadas con i-matrix; en teoria mejor calidad por bit, a costa de mayor tiempo de generacion |
| KarlKinda/Swift-Qwen3.8-27b-ablated | 26.895.998.464 | no disponible | safetensors | swift-open-license-1.0 | Modelo base sin cuantizar; necesario para vLLM y TGI |
| Alternativas de otros autores del mismo rango | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion del comportamiento de rechazo implica que puede generar contenido ofensivo, violento, sexual explicito o potencialmente danino. No debe exponerse directamente a usuarios finales sin una capa de moderacion propia.
- Sesgos: los sesgos del modelo base persisten y probablemente se agravan al eliminar los mecanismos de alineamiento; no hay evaluaciones de sesgo publicadas para este modelo.
- Riesgo de alucinacion: inherente a los modelos de esta escala; no se han publicado evaluaciones de fidelidad factual. La cuantizacion a 2-3 bits incrementa la perdida de coherencia y la tasa de errores.
- Idioma: solo ingles declarado. El rendimiento en castellano no esta garantizado y probablemente sea degradado.
- Longitud de contexto desconocida: no se publica la ventana soportada, por lo que cualquier despliegue en produccion debe validar empiricamente el comportamiento con entradas largas.
- Licencia: swift-open-license-1.0 con campo license: other. No se incluyen los terminos completos en la informacion disponible, por lo que es obligatorio revisar el texto de la licencia antes de cualquier uso comercial. El uso de pesos abliterated puede ademas contravenir los terminos de uso de la familia de modelos original.
- Ausencia de datos de rendimiento: sin benchmarks ni mediciones de latencia, no es posible justificar una eleccion de cuantizacion por calidad mas alla de las recomendaciones genericas de la model card (Q4_K_S y Q4_K_M marcadas como "fast, recommended"; Q6_K como "very good quality").
- Sin soporte multimodal en este repositorio (marca skip_mmproj: 1 en los metadatos de la cuantizacion).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni informes de terceros sobre su comportamiento real.
- Los archivos GGUF de gran tamano (Q6_K, Q8_0, f16) pueden estar divididos en varias partes; es necesario concatenarlas o cargarlas con una herramienta que gestione archivos multiparte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Swift-Qwen3.8-27b-ablated-GGUF
- Modelo base: https://huggingface.co/KarlKinda/Swift-Qwen3.8-27b-ablated
- Cuantizaciones i-matrix: https://huggingface.co/mradermacher/Swift-Qwen3.8-27b-ablated-i1-GGUF
- Pagina resumen del autor para este modelo: https://hf.tst.eu/model#Swift-Qwen3.8-27b-ablated-GGUF
- Guia de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Preguntas frecuentes y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests

Nota sobre la busqueda web: los resultados obtenidos no guardan ninguna relacion con este modelo (consultas sobre AutoCAD, configuracion de bandas WiFi y errores de URL). No se han encontrado papers, blogs ni repositorios adicionales que aporten informacion tecnica sobre Swift-Qwen3.8-27b-ablated.
