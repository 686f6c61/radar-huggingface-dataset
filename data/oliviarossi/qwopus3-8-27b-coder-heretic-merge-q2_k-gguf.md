# OliviaRossi/Qwopus3.8-27B-Coder-Heretic-Merge-Q2_K-GGUF

## Resumen

OliviaRossi/Qwopus3.8-27B-Coder-Heretic-Merge-Q2_K-GGUF es una cuantizacion en formato GGUF (tipo Q2_K) del modelo base OliviaRossi/Qwopus3.8-27B-Coder-Heretic-Merge, un merge de modelos de la familia Qwen orientado a generacion de codigo y a un comportamiento "uncensored" (sin los filtros de rechazo tipicos de los modelos alineados de forma estricta). El autor de la cuantizacion es el usuario OliviaRossi, que la ha generado mediante el espacio GGUF-my-repo de ggml.ai sobre llama.cpp.

El modelo cuenta con 26.895.998.464 parametros totales (aproximadamente 26,9 mil millones) segun los pesos en safetensors del modelo base, y se distribuye bajo licencia Apache 2.0. La etiqueta de pipeline es image-text-to-text, lo que indica que el modelo base es multimodal (acepta imagen y texto como entrada), aunque la model card no detalla la arquitectura interna ni la composicion del entrenamiento.

La relevancia de esta ficha esta en que se trata de una cuantizacion Q2_K, es decir, una compresion agresiva a 2 bits por peso que reduce drasticamente los requisitos de memoria a costa de una perdida notable de calidad. Es util para experimentar con el modelo en hardware modesto, pero no es la opcion recomendada para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas qwen3_5 / qwen3.8; transformer multimodal segun pipeline image-text-to-text) |
| Parametros totales | 26.895.998.464 (26,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (esta variante); el repo base admite otras conversiones GGUF no detalladas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero qwopus3.8-27b-coder-heretic-merge-q2_k.gguf) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Las etiquetas de la model card (qwen3_5, qwen3.8, merge, coder_hybrid, multimodal) sugieren que se trata de un merge de modelos derivados de Qwen 3.5/Qwen 3.8 con capacidad multimodal (entrada de imagen y texto) y especializacion en codigo. El pipeline declarado, image-text-to-text, confirma el caracter multimodal de la entrada.

El proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO, fases de alineacion) no esta documentado en la informacion disponible. La etiqueta "heretic" hace referencia a la practica de eliminar o reducir los comportamientos de rechazo del modelo original, pero no se detalla la metodologia concreta empleada. Esta variante concreta es una conversion a GGUF realizada con llama.cpp mediante el espacio GGUF-my-repo de ggml.ai, sin reentrenamiento adicional.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline conversational).
- Generacion y asistencia en codigo (etiquetas coder_hybrid y coding).
- Entrada multimodal de imagen y texto (pipeline image-text-to-text).
- Comportamiento "uncensored": menor tendencia a rechazar peticiones por motivos de alineacion.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Ejecucion local mediante llama.cpp (CLI y servidor).
- No se documentan capacidades de tool calling, function calling, agentes ni modo de razonamiento explicito.

## Casos de uso

- Experimentacion local en hardware modesto: la cuantizacion Q2_K reduce el peso del modelo a aproximadamente 10,7 GB, lo que permite cargarlo en equipos con 12-16 GB de RAM o VRAM unificada para pruebas de concepto.
- Asistencia de codigo en entornos aislados: al ejecutarse con llama.cpp en local, puede usarse como autocompletado o generador de fragmentos de codigo sin enviar datos a servicios externos.
- Prototipado de aplicaciones multimodales: al aceptar imagen y texto, sirve para validar flujos de descripcion de imagenes o preguntas sobre capturas antes de migrar a una cuantizacion mayor.
- Evaluacion comparativa de cuantizaciones: util para medir la degradacion de calidad de Q2_K frente a Q4_K_M o Q8_0 sobre el mismo modelo base.
- Investigacion sobre modelos sin filtros: permite estudiar el comportamiento de un modelo "heretic" en tareas de red teaming y analisis de sesgos.
- Despliegue en servidor llama-server para pruebas de integracion: el repositorio documenta el arranque con `llama-server -c 2048`, adecuado para entornos de desarrollo con contexto corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero GGUF Q2_K ocupa aproximadamente 10,7 GB (tamano del repo), por lo que se necesita al menos 12 GB de memoria para cargar el modelo con margen para el contexto.
- GPU recomendadas: no hay datos especificos; por tamano, una RTX 3090/4090 (24 GB) o superior permite cargarlo en VRAM con contexto amplio. Una RTX 3060 de 12 GB queda al limite.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM, o en sistemas con memoria unificada (Apple Silicon con 16 GB o mas).
- Opciones de despliegue: llama.cpp (CLI y llama-server), documentado en la model card. Otras opciones como Ollama o vLLM no estan confirmadas para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Heretic-Merge-Q2_K (este) | 26,9 B | no disponible | Apache 2.0 | GGUF Q2_K | Cuantizacion agresiva, multimodal, sin benchmarks publicados |
| Modelo base Qwopus3.8-27B-Coder-Heretic-Merge | 26,9 B | no disponible | Apache 2.0 | safetensors | Mayor fidelidad, requiere mas memoria |
| Alternativas de la familia Qwen de ~27 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantizacion Q2_K es muy agresiva (2 bits por peso) y provoca una degradacion notable de la calidad respecto al modelo base; no se recomienda para produccion.
- El caracter "uncensored" implica un mayor riesgo de generar contenido inapropiado, ofensivo o factualmente incorrecto; requiere supervision humana.
- No hay informacion sobre sesgos, idiomas soportados ni evaluaciones de seguridad.
- Riesgo elevado de alucinacion, agravado por la cuantizacion a baja precision.
- La longitud de contexto no esta documentada; el ejemplo de la model card usa `-c 2048`, lo que sugiere que contextos largos pueden no estar bien soportados en esta configuracion.
- Aunque la licencia es Apache 2.0, el uso comercial del modelo "heretic" exige revisar las implicaciones legales y de responsabilidad sobre el contenido generado.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OliviaRossi/Qwopus3.8-27B-Coder-Heretic-Merge-Q2_K-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/Qwopus3.8-27B-Coder-Heretic-Merge
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
