# alperenn57/mirAI-Gemma-psikolog-tam-Q4_K_M-GGUF

## Resumen

alperenn57/mirAI-Gemma-psikolog-tam-Q4_K_M-GGUF es una version cuantizada en formato GGUF del modelo alperenn57/mirAI-Gemma-psikolog-tam, publicada por el usuario alperenn57. Se trata de un derivado de un modelo de la familia Gemma (segun se desprende del propio nombre del repositorio, aunque la model card no confirma la arquitectura) con 3.880.263.168 parametros, orientado por su denominacion ("psikolog", psicologo en turco) a conversaciones de caracter psicologico. La conversion a GGUF se realizo con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai.

El interes practico de esta publicacion es acotado pero claro: permite ejecutar un modelo de ~3,9 mil millones de parametros en hardware de consumo mediante llama.cpp, con un unico archivo cuantizado en Q4_K_M de aproximadamente 2,5 GB. No obstante, el repositorio no incluye informacion sobre datos de entrenamiento, licencia, idiomas soportados, longitud de contexto ni resultados de evaluacion, y registra 0 descargas y 0 likes en el momento de la consulta.

Por tanto, debe tratarse como un artefacto experimental sin validacion externa: no hay garantia de calidad, de comportamiento seguro en un dominio tan sensible como la salud mental ni de condiciones legales claras para su uso. Cualquier evaluacion en produccion exige una verificacion previa por parte del desarrollador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre del modelo base sugiere familia Gemma; sin confirmar en la informacion proporcionada) |
| Parametros totales | 3.880.263.168 (~3,88 mil millones) |
| Parametros activos | No disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible (el ejemplo de la model card usa `-c 2048`, pero es un parametro de ejemplo de llama.cpp, no la ventana del modelo) |
| Tipos de cuantizacion | Unicamente Q4_K_M en este repositorio; no se publican otros niveles |
| Idiomas soportados | No disponible (el nombre sugiere turco; sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | GGUF (`mirai-gemma-psikolog-tam-q4_k_m.gguf`) |
| Modelo base | alperenn57/mirAI-Gemma-psikolog-tam |
| Autor | alperenn57 |
| Tamano del repositorio | 2,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-04 (segun metadatos de HuggingFace) |
| Compatibilidad de despliegue | llama.cpp, llama-server, endpoints compatibles (tag `endpoints_compatible`) |

## Arquitectura y entrenamiento

La model card de este repositorio no aporta informacion sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni el uso de tecnicas de alineamiento como RLHF o DPO. Lo unico documentado es el procedimiento de conversion: el checkpoint original alperenn57/mirAI-Gemma-psikolog-tam se transformo a formato GGUF con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, aplicando la cuantizacion Q4_K_M.

Por el nombre del modelo base puede inferirse una arquitectura de tipo transformer decoder-only de la familia Gemma con aproximadamente 3,88 mil millones de parametros, pero esta deduccion no esta confirmada por ninguna fuente proporcionada. El sufijo "tam" (completo en turco) y "psikolog" apuntan a un ajuste fino orientado a conversacion psicologica, presumiblemente en turco, extremo igualmente no verificado. No se documenta ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de texto y conversacion multi-turno: es la unica capacidad inferible del formato y del ejemplo de uso de la model card.
- Orientacion a dialogo de caracter psicologico: se deduce del nombre del modelo, no de documentacion tecnica.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el unico idioma sugerido por el nombre es el turco.
- Capacidades multimodales (vision, audio) o modo de razonamiento explicito: no disponibles.
- Comportamiento verificado en benchmarks: no disponible.

## Casos de uso

- Prototipado de asistencia conversacional en salud mental: dado su tamano (~3,9 B) y su cuantizacion Q4_K_M, puede desplegarse en local para experimentar con dialogos de acompanamiento psicologico. Requiere supervision profesional y no sustituye a un especialista.
- Investigacion en NLP clinico: sirve como punto de partida para estudiar ajuste fino en dominios sensibles, siempre que se documente adecuadamente su procedencia y se validen sus salidas.
- Despliegue en hardware de consumo: con un archivo de ~2,5 GB, permite montar demos offline en portatiles o equipos con GPU modesta usando llama.cpp u Ollama.
- Generacion de texto en turco (si se confirma el idioma): util como base para tareas de redaccion o reescritura en ese idioma, previa evaluacion de calidad.
- Base para pipelines RAG: puede integrarse como generador en un sistema de recuperacion sobre materiales de psicologia, aunque la longitud de contexto no esta documentada y limita el diseno.
- Evaluacion de sesgos y riesgos: resulta adecuado como caso de estudio para medir alucinacion, sesgo y seguridad en modelos conversacionales especializados en salud mental.
- Experimentacion educativa con cuantizacion GGUF: ejemplo practico de conversion y ejecucion de un checkpoint de ~3,9 B en Q4_K_M para comparar calidad frente al modelo original en precision completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3-4 GB con la cuantizacion Q4_K_M (archivo de 2,5 GB mas overhead de contexto y cache KV); el valor exacto depende de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM, como GTX 1650, RTX 3050, RTX 3060, RTX 4060 o superiores; en GPU de datacenter (A100, H100) el modelo queda muy infrautilizado.
- Cabe en GPU de consumo: si, es uno de sus principales atractivos, incluidas GPUs de gama de entrada con 4 GB.
- CPU y Apple Silicon: la inferencia en CPU es viable gracias a llama.cpp; tambien es ejecutable en Macs con memoria unificada.
- Opciones de despliegue: llama.cpp (CLI y servidor), llama-cpp-python, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere soporte en endpoints gestionados.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en ninguna configuracion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de las alternativas son de referencia general y no proceden de la informacion proporcionada en esta consulta; deben verificarse en sus respectivas model cards.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|
| mirAI-Gemma-psikolog-tam-Q4_K_M | ~3,88 B | No disponible | No disponible | Si (Q4_K_M) |
| Gemma 2 2B (referencia) | ~2,6 B | 8K | Licencia propia de Gemma | Si |
| Llama 3.2 3B (referencia) | ~3,2 B | 128K | Llama 3.2 Community License | Si |
| Qwen 2.5 3B (referencia) | ~3,1 B | 32K (ampliable con YaRN) | Apache 2.0 | Si |

La diferencia relevante no es de tamano, sino de trazabilidad: los tres modelos de referencia cuentan con licencias explicitas, contexto documentado y evaluaciones publicas, mientras que este repositorio carece de todo ello.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no hay autorizacion explicita de uso, lo que impide determinar si se permite el uso comercial. En la practica, debe tratarse como no apto para produccion hasta que el autor lo aclare.
- Validacion nula: 0 descargas y 0 likes, sin resultados de benchmarks, sin model card tecnica del modelo base y sin documentacion de datos de entrenamiento.
- Dominio de alto riesgo: un modelo orientado a conversacion psicologica puede generar respuestas daninas si alucina, minimiza senales de riesgo o simula diagnostico. No debe usarse como sustituto de atencion profesional ni en contextos de crisis sin supervision humana.
- Riesgo de alucinacion: no se documenta ningun proceso de alineamiento, evaluacion de veracidad ni mecanismo de rechazo, por lo que la tasa de fabricacion de informacion es desconocida.
- Sesgos desconocidos: al no conocerse la composicion del dataset, no es posible evaluar sesgos de genero, cultura, edad ni sesgos clinicos.
- Limitaciones de idioma y contexto: se desconoce la ventana de contexto real y los idiomas soportados; si el ajuste es exclusivamente en turco, el rendimiento en castellano es impredecible.
- Procedencia incierta: no se especifica quien entreno el modelo base, con que datos ni con que fines, lo que dificulta cualquier auditoria.
- Degradacion por cuantizacion: la conversion a Q4_K_M introduce perdida de precision respecto al checkpoint original; no se ha publicado ninguna comparacion entre ambos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alperenn57/mirAI-Gemma-psikolog-tam-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/alperenn57/mirAI-Gemma-psikolog-tam
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos fueron dominios de contenido para adultos sin relacion con la ficha, por lo que no se incluyen.
