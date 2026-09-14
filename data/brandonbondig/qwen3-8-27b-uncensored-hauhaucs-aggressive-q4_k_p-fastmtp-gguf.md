# brandonbondig/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q4_K_P-FastMTP-GGUF

## Resumen

Este repositorio no es un modelo nuevo, sino un espejo (mirror) reducido de un quant GGUF ya existente. Contiene unicamente dos ficheros del repositorio `HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF`: el quant principal en Q4_K_P (16,7 GB) y un borrador FastMTP de 861,6 MB. El autor, brandonbondig, lo publica para la funcion de modelos en cache de RunPod, que predescarga todos los ficheros del repositorio apuntado en los hosts donde programa los workers. Al apuntar a este espejo en lugar del original, el almacenamiento local necesario pasa de 172,5 GB (diez quants) a unos 32 GB.

El modelo subyacente se presenta como una variante "uncensored" y "aggressive" de un supuesto Qwen3.8 de 27B, con soporte de decodificacion especulativa mediante MTP (multi-token prediction). No se re-cuantiza ni se modifica nada: los pesos, el borrador y el trabajo de cuantizacion pertenecen a HauhauCS, y el repositorio incluye SHA256SUMS con las sumas de verificacion del repositorio original.

Es relevante ahora porque documenta un patron de despliegue muy concreto en infraestructura cloud: separar el artefacto de servicio (quant + borrador) del catalogo completo de cuants para abaratar el cacheo en hosts. Al carecer de model card propia, de licencia declarada y de benchmarks, debe tratarse como un artefacto de distribucion, no como una ficha tecnica de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere la familia Qwen3, no confirmado en la informacion proporcionada) |
| Parametros totales | 1.863.907.840 segun los metadatos de safetensors del repositorio; el nombre del modelo indica 27B. Dato contradictorio, ver limitaciones |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; el borrador se distribuye con el sufijo 32K, sin confirmacion de que ese sea el contexto del modelo |
| Tipos de cuantizacion | Q4_K_P, unico quant incluido en este espejo; el repositorio original ofrece diez quants |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card remite a la licencia del repositorio original, que no se detalla |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No hay informacion sobre la arquitectura interna, el dataset de entrenamiento, el numero de tokens vistos ni sobre si hubo RLHF, DPO u otro ajuste de preferencias. Lo unico deducible del nombre y de las etiquetas es que se trata de un transformer de la familia Qwen3, presumiblemente de 27B de parametros, con un ajuste orientado a reducir rechazos ("uncensored") y con un estilo de respuesta marcado como "aggressive". Ninguna de estas afirmaciones esta verificada en la documentacion disponible.

La unica innovacion tecnica documentada es el uso de decodificacion especulativa mediante MTP: el repositorio incluye un fichero borrador `FastMTP-32K.gguf` de 861,6 MB que un despliegue de `llama-server` carga junto al quant Q4_K_P para acelerar la generacion. La model card del espejo menciona tambien un parche de llama.cpp necesario para el despliegue, pero no se proporciona su URL ni su contenido.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational` y pensado para servir via `llama-server`.
- Decodificacion especulativa con borrador MTP integrado, orientada a reducir la latencia por token en inferencia.
- Ajuste "uncensored" / "aggressive" segun el nombre: se presenta como un modelo con menor tasa de rechazos ante peticiones que un modelo alineado convencional rechazaria. No hay evaluacion publicada que lo cuantifique.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Modo de razonamiento explicito ("thinking"): no disponible.

## Casos de uso

- Despliegue en RunPod con modelos en cache: apuntar el worker a este espejo reduce la descarga y el almacenamiento local del host de 172,5 GB a unos 32 GB, lo que acorta el tiempo de arranque de workers efimeros y abarata el coste de disco.
- Servicio de chat autohospedado via `llama-server`: con el quant Q4_K_P (16,7 GB) y el borrador FastMTP se puede levantar un endpoint compatible con la API de OpenAI sin infraestructura adicional; la etiqueta `endpoints_compatible` del repositorio apunta a ese uso.
- Generacion creativa y narrativa sin filtros tematicos estrictos: es el caso de uso natural de un ajuste "uncensored", util para escritura de ficcion con temas sensibles, siempre que se apliquen controles de contenido en la capa de aplicacion.
- Investigacion sobre alineacion y comportamiento de modelos: permite comparar la tasa y la forma de los rechazos frente a un modelo alineado de tamano similar, aunque no hay evaluaciones publicadas que sirvan de linea base.
- Generacion sintetica de datos de dialogo: un modelo con menos rechazos puede producir respuestas para dominios donde un modelo alineado se negaria a generar, util para aumentar datasets de entrenamiento.
- Inferencia en una sola GPU de gama alta: con 16,7 GB de pesos en Q4_K_P mas el borrador, cabe en GPUs de 24 GB, lo que habilita prototipado local antes de pasar a produccion.
- Pruebas de latencia con decodificacion especulativa: sirve para medir la ganancia real de un borrador MTP de 861,6 MB frente a decodificacion estandar en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la model card del espejo se limita a describir los dos ficheros y su proposito de distribucion.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 17-19 GB solo para pesos y estado del modelo, partiendo de los 16,7 GB del quant Q4_K_P mas los 861,6 MB del borrador. Hay que anadir el coste de la cache KV, que depende del contexto efectivo y no esta documentado.
- GPU recomendadas: no hay recomendaciones publicadas por el autor. Por tamano de pesos, encajan GPUs de 24 GB o mas (RTX 3090, RTX 4090, L4, A10G) y, con mas margen de contexto, A100 40/80 GB o H100.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB de VRAM, con contexto limitado por la cache KV. En GPUs de 16 GB o menos no cabe sin descargar capas a CPU.
- Opciones de despliegue: llama.cpp y `llama-server` son los soportados explicitamente; el repositorio esta etiquetado con `llama.cpp`, `runpod` y `endpoints_compatible`. No se documenta soporte para vLLM, TGI, Ollama ni otros motores, aunque al ser GGUF podrian ser compatibles con conversiones adicionales.
- Latencia y throughput: no disponible. El borrador FastMTP esta pensado para mejorar la velocidad de decodificacion, pero no se publican mediciones de tokens por segundo ni de tasa de aceptacion del borrador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (espejo Q4_K_P + FastMTP) | 27B segun nombre; 1,86B segun metadatos safetensors | no disponible | GGUF (2 ficheros, 18,8 GB de repo) | no disponible | publico en HuggingFace |
| HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF (original) | no disponible | no disponible | GGUF (diez quants, 172,5 GB de repo) | no disponible | publico en HuggingFace |
| Otros modelos comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no ha devuelto informacion tecnica relevante sobre este modelo ni sobre alternativas comparables, por lo que no es posible establecer una comparativa de rendimiento con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Inconsistencia de datos: los metadatos de safetensors indican 1.863.907.840 parametros (unos 1,86B) mientras que el nombre del modelo declara 27B. Es una discrepancia de mas de un orden de magnitud que ninguna fuente disponible resuelve; conviene verificar el repositorio original antes de planificar recursos.
- Ausencia de model card propia: el espejo no documenta prompt format, contexto maximo, idiomas ni comportamiento esperado. Toda la informacion operativa esta en el repositorio original, que no se ha podido consultar.
- Licencia no declarada: sin licencia explicita no se puede asumir uso comercial permitido. Al tratarse de un modelo derivado y ajustado, la licencia del modelo base podria imponer restricciones adicionales.
- Ajuste "uncensored" y "aggressive": reduce los rechazos, lo que implica mayor riesgo de generar contenido danino, ofensivo o factualmente incorrecto sin aviso. Requiere moderacion en la capa de aplicacion si se expone a usuarios finales.
- Riesgo de alucinacion: no hay evaluaciones de fidelidad factual ni de calibracion. En un ajuste que penaliza los rechazos, es esperable un aumento de respuestas seguras de si mismas pero incorrectas.
- Naturaleza del repositorio: es un espejo de distribucion. Si el repositorio original se actualiza, este puede quedar desincronizado; solo las sumas SHA256SUMS permiten verificar la correspondencia byte a byte en el momento de la publicacion.
- Contexto no confirmado: el sufijo 32K del fichero borrador no garantiza que el modelo soporte 32.000 tokens de contexto; asumirlo sin verificar puede provocar degradacion silenciosa en prompts largos.
- Dependencia de un parche de llama.cpp: el despliegue con MTP requiere el parche de llama.cpp citado en la model card, cuya ubicacion no se proporciona. Sin el, la decodificacion especulativa no funcionara como se describe.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Idiomas: no disponibles. No se puede garantizar calidad en castellano ni en ningun otro idioma distinto del que se usara en el ajuste original.

## Enlaces

- Repositorio del espejo: https://huggingface.co/brandonbondig/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q4_K_P-FastMTP-GGUF
- Repositorio original (model card, licencia, prompt format y parche de llama.cpp): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo (papers, blogs, repos o demos).
