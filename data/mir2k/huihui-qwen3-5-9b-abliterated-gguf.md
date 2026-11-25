# Mir2k/Huihui-Qwen3.5-9B-abliterated-GGUF

## Resumen
Mir2k/Huihui-Qwen3.5-9B-abliterated-GGUF es una cuantizacion en formato GGUF (Q5_K_M) del modelo huihui-ai/Huihui-Qwen3.5-9B-abliterated, que a su vez deriva de la familia Qwen3.5 de Alibaba. El modelo original ha sido sometido a una tecnica de "abliteration", un proceso de modificacion de pesos orientado a eliminar la capa de rechazo (refusal) aprendida durante el alineamiento, de modo que el modelo responde a practicamente cualquier peticion sin filtros de seguridad internos. Esta version concreta la publica el usuario Mir2k como cuantizacion lista para ejecucion local con llama.cpp u Ollama.

El modelo cuenta con 8.953.803.264 parametros (aproximadamente 9B), se distribuye bajo licencia Apache 2.0 y declara soporte para ingles, frances y chino. El repositorio ocupa 6,5 GB, correspondientes al unico fichero GGUF en Q5_K_M, y esta pensado para desplegarse en equipos con unos 8 GB de VRAM. Su relevancia actual reside en la combinacion de tamano contenido, licencia permisiva y ausencia de censura, lo que lo hace atractivo para investigacion sobre alineamiento, generacion creativa sin restricciones y despliegue en hardware de consumo.

No se dispone de informacion sobre la arquitectura interna detallada, la longitud de contexto exacta ni los datos de entrenamiento del modelo base en la informacion proporcionada; la model card del cuantizador se limita a describir el proceso de conversion y el uso con llama.cpp y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.5; detalles no publicados en la informacion disponible) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card indica "contexte d'origine conservé" sin especificar el valor) |
| Tipos de cuantizacion | GGUF Q5_K_M (unico fichero publicado) |
| Idiomas soportados | en, fr, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
No se ha publicado en la informacion disponible la arquitectura concreta del modelo base (tipo de transformer, atencion, posibles innovaciones como atencion lineal o decodificacion especulativa). El dato objetivo es que se trata de un modelo denso de aproximadamente 9B parametros (8.953.803.264), derivado de la familia Qwen3.5 y posteriormente modificado mediante abliteration por huihui-ai antes de su cuantizacion.

El proceso de abliteration consiste en identificar las direcciones de activacion asociadas al comportamiento de rechazo y proyectarlas fuera de los pesos, de forma que el modelo deja de negarse a responder a ciertas peticiones. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo original. La cuantizacion Q5_K_M se realizo con llama.cpp y, segun el autor, conserva "l'essentiel de la qualite du modele en precision d'origine" con un tamano de 6,5 GB.

## Capacidades
- Generacion de texto conversacional multi-turno, con plantilla de chat del modelo base incluida en el GGUF.
- Respuestas sin filtros de rechazo (uncensored) gracias a la abliteration, incluyendo temas que el modelo original rechazaria.
- Capacidades multilingues limitadas a ingles, frances y chino segun la model card; no se declara soporte de espanol.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.5, aunque sin benchmarks publicados en esta ficha.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el modelo es de texto.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y ejecucion local via llama.cpp y Ollama 0.40.x.

## Casos de uso
- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un LLM tras eliminar la capa de rechazo, comparando respuestas con el modelo original para analizar que direcciones de activacion codifican la negativa a responder.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles (violencia, contenido adulto, temas controvertidos) sin los bloqueos habituales del modelo alineado.
- Despliegue local en hardware de consumo: con 6,5 GB en Q5_K_M y unos 8 GB de VRAM recomendados, puede ejecutarse en una RTX 3060 de 12 GB o una RTX 4070, lo que facilita prototipado sin coste de API.
- Asistente conversacional en frances o chino: el modelo declara soporte nativo para ambos idiomas, util para demos o herramientas internas en esos mercados.
- Red teaming de aplicaciones: uso del modelo como generador adversarial para probar filtros y salvaguardas de sistemas de moderacion propios, aprovechando su ausencia de rechazo.
- Experimentacion con cuantizaciones: como referencia practica de como afecta Q5_K_M a la calidad frente al modelo en safetensors, util para quienes evaluan compromisos de tamano y fidelidad.
- Educacion y divulgacion tecnica: demostraciones de inferencia local con llama.cpp u Ollama en talleres, dado el bajo requisito de hardware y la licencia permisiva.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: unos 8 GB segun la model card para la cuantizacion Q5_K_M (6,5 GB de fichero mas overhead de contexto y KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090; en el segmento profesional, A100 o H100 para mayor throughput y contextos largos.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas de VRAM (con margen recomendable de 12 GB para contextos amplios).
- Opciones de despliegue: llama.cpp (build reciente, probado por el autor), Ollama 0.40.x, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mir2k/Huihui-Qwen3.5-9B-abliterated-GGUF | ~9B | no disponible | Apache 2.0 | GGUF Q5_K_M | Cuantizacion uncensored, 6,5 GB |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated | ~9B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar de esta ficha |
| Qwen3.5-9B (original) | ~9B | no disponible | no disponible en la informacion | safetensors | Version alineada con rechazo; referencia de comparacion |
| Otras alternativas abliterated de ~8-9B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias
- La abliteration elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido danino, ilegal o eticamente problematico sin advertencia; no es apto para aplicaciones de cara al publico sin moderacion externa.
- Riesgo elevado de alucinacion, comun en modelos de ~9B y potencialmente agravado por la modificacion de pesos; no se han publicado evaluaciones de fidelidad.
- Cobertura idiomatica limitada a ingles, frances y chino; el espanol no esta declarado y su rendimiento en castellano es incierto.
- Longitud de contexto no documentada en la informacion disponible; la model card solo indica que se conserva el contexto original.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterated puede conllevar riesgos legales y reputacionales segun la jurisdiccion y el tipo de contenido generado.
- Es una cuantizacion Q5_K_M: introduce perdida de calidad respecto al modelo en precision original, no cuantificada por el autor.
- El repositorio tiene un solo fichero y muy pocas descargas (735) y likes (2); no hay evidencia de validacion comunitaria extensa.
- No se dispone de informacion sobre sesgos especificos del modelo base ni sobre evaluaciones de seguridad.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Mir2k/Huihui-Qwen3.5-9B-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- llama.cpp (runtime de cuantizacion e inferencia): no se proporciona enlace en la informacion disponible
- Ollama: no se proporciona enlace en la informacion disponible
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
