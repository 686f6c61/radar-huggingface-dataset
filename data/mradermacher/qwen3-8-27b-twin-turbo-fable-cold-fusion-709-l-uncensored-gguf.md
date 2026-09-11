# mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-GGUF

## Resumen

Este repositorio contiene la versión cuantizada en formato GGUF del modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored, publicada por el usuario mradermacher. Se trata de un ajuste fino de tipo "uncensored" (etiquetas heretic y uncensored) construido sobre lo que las etiquetas identifican como la familia Qwen3 (qwen3_8, qwen3_6), con aproximadamente 27.320 millones de parámetros reales según los pesos en safetensors del modelo original. El trabajo de mradermacher no modifica el modelo: genera conversiones estáticas a GGUF para permitir su ejecución con llama.cpp y derivados.

El modelo base fue desarrollado por DavidAU y combina varias técnicas de ajuste que el autor agrupa bajo nombres propios (Cold Fusion, GAIN Training, Multi-stage tuning, TWIN-TURBO), además de un entrenamiento orientado a eliminar los mecanismos de rechazo y moderación del modelo original. Los conjuntos de datos declarados son DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets y DavidAU/THE-DECKARD-Datasets. No hay información publicada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni los resultados de evaluación.

La relevancia de esta publicación es práctica: permite ejecutar localmente un modelo denso de 27B en inglés con licencia Apache 2.0 sin restricciones de contenido, en GPU de consumo si se emplean cuantizaciones agresivas. El repositorio ocupa 79,7 GB e incluye ficheros mmproj (Q8_0 y f16), lo que indica soporte multimodal de entrada aunque la model card no lo documenta explícitamente. En el momento de redactar esta ficha, el repositorio registra 0 descargas y 0 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita. Las etiquetas (qwen3_8, qwen3_6) apuntan a una base de la familia Qwen3, presumiblemente transformer denso; no confirmado en la información proporcionada |
| Parámetros totales | 27.320.697.856 (~27,3B) |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Listados en las etiquetas del repositorio: x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS. Ficheros efectivamente publicados en la tabla del repositorio: Q2_K, Q4_K_S, Q8_0, mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversión del modelo en formato HuggingFace/transformers) |
| Modelo base | DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored |
| Tamaño del repositorio | 79,7 GB |
| Librería declarada | transformers (etiqueta); la ejecución real requiere llama.cpp o compatible |

## Arquitectura y entrenamiento

La model card del repositorio cuantizado no describe la arquitectura del modelo base. Lo único verificable es el número de parámetros (27,3B) y las etiquetas del autor, que sitúan el modelo en la familia Qwen3 y mencionan "Multi-stage tuning", "Cold Fusion" y "GAIN Training" como metodologías de ajuste. No se especifica si la atención es completa o híbrida, la dimensión del estado oculto, el número de capas ni la longitud de contexto nativa. Tampoco se documenta si el ajuste incluyó RLHF, DPO u otra técnica de alineación; el objetivo declarado mediante la etiqueta "heretic" y "uncensored" es precisamente revertir o eliminar el comportamiento de rechazo típico de los modelos alineados.

Los datos de entrenamiento declarados son tres conjuntos del propio DavidAU (Polar-STRICT-Datasets, F451-STRICT-Datasets y THE-DECKARD-Datasets), sin que se publique su composición, tamaño en tokens, proporción de datos sintéticos ni procedencia. El repositorio incluye ficheros mmproj en Q8_0 y f16, un componente que en el ecosistema GGUF se emplea para proyectores multimodales (típicamente visión), lo que sugiere que el modelo base incorpora alguna capacidad multimodal; la model card no lo confirma ni detalla su alcance. La conversión realizada por mradermacher es estática (no hay cuantizaciones imatrix/weighted en el momento de la publicación) y se marca como quantize_version 2 y output_tensor_quantised 1.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat multi-turno (etiqueta conversational).
- Modo "uncensored": ausencia deliberada de rechazos ante peticiones que un modelo alineado estándar bloquearía. Es una característica del ajuste, no un fallo.
- Capacidad multimodal probable: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 apunta a un proyector para entradas de imagen, aunque no está documentada en la model card ni se especifica qué modalidades cubre.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta endpoints_compatible, orientada a su uso en infraestructuras de inferencia compatibles.
- Ejecución local en CPU/GPU mediante llama.cpp y sus derivados, gracias al formato GGUF.
- No se documentan capacidades específicas de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas o código más allá de lo que herede del modelo base, que no se detalla.

## Casos de uso

- Generación creativa sin restricciones de contenido: novelas, guiones y narrativa que abordan violencia, sexualidad o temas controvertidos sin las negativas automáticas de los modelos alineados. El modelo está entrenado explícitamente para este escenario.
- Red teaming y evaluación de seguridad: equipos de alineación pueden usar una variante sin censura como contrapunto para estudiar qué tipos de peticiones producen contenido dañino y calibrar filtros externos.
- Investigación sobre alineación y comportamiento: comparar las respuestas de este modelo con las del Qwen3 base permite medir el efecto de un ajuste "heretic" sobre la distribución de salidas, el tono y la tasa de rechazo.
- Generación de datos sintéticos para ajuste: producir corpus de texto en inglés con temáticas que los modelos comerciales rechazan, útil para entrenar clasificadores de contenido o filtros de moderación.
- Asistente conversacional local con privacidad: al ejecutarse en GGUF sobre hardware propio, ninguna consulta sale del equipo, lo que encaja en entornos con requisitos de confidencialidad donde se tolera contenido sin filtro.
- Roleplay y personajes persistentes: el formato conversacional y la ausencia de rechazos lo hacen adecuado para bots de personaje con contexto largo, siempre que el despliegue gestione el KV cache según la cuantización elegida.
- Escritura asistida en dominios sensibles: documentación técnica, ficción o análisis sobre temas legalmente delicados (crimen, drogas, violencia) donde un modelo censurado interrumpiría la tarea con negativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el autor del modelo base no publica tablas de evaluación en los datos proporcionados. No se dispone tampoco de mediciones de perplejidad por tipo de cuantización para este modelo concreto; el repositorio enlaza únicamente un gráfico genérico de ikawrakow sobre calidad relativa de tipos de cuantización, no aplicable específicamente a estos pesos.

## Requisitos de hardware

Estimaciones basadas en los tamaños de fichero publicados; no incluyen el KV cache ni el overhead de runtime, por lo que deben considerarse mínimos:

- Q2_K (11,0 GB): ejecutable en GPU de 12 GB (RTX 3060 12 GB, RTX 4070) con contexto moderado, y en 16 GB con holgura. Pérdida de calidad apreciable.
- Q4_K_S (15,9 GB): encaja en RTX 4080/4090 (16-24 GB) y en equipos Apple Silicon de 24 GB o más de memoria unificada. Es la cuantización marcada como "fast, recommended" por el autor.
- Q8_0 (29,1 GB): requiere A100 40 GB, H100 80 GB o similar. En RTX 4090 (24 GB) exige offload parcial de capas a CPU, con la consiguiente caída de velocidad.
- mmproj-Q8_0 (0,7 GB) y mmproj-f16 (1,0 GB): coste adicional sobre la cuantización elegida si se utiliza la entrada multimodal.
- Repositorio completo: 79,7 GB de descarga, no necesario en su totalidad; conviene descargar solo el fichero GGUF deseado.
- GPU recomendadas: RTX 3060 12 GB (Q2_K), RTX 4080/4090 (Q4_K_S), A100 40 GB / H100 80 GB (Q8_0 sin offload).
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama, LM Studio, koboldcpp, text-generation-webui y otras interfaces basadas en llama.cpp. vLLM ofrece soporte GGUF experimental y limitado; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de terceros en la información proporcionada, por lo que no es posible establecer una comparativa de rendimiento fiable. Lo que sí puede compararse son las variantes del propio repositorio:

| Variante | Tamaño (GB) | Parámetros | Contexto | Licencia | Uso recomendado |
|---|---|---|---|---|---|
| Q2_K | 11,0 | 27,3B | no disponible | Apache 2.0 | Hardware muy limitado (12 GB VRAM), calidad degradada |
| Q4_K_S | 15,9 | 27,3B | no disponible | Apache 2.0 | Opción equilibrada para GPU de 16-24 GB, marcada como recomendada |
| Q8_0 | 29,1 | 27,3B | no disponible | Apache 2.0 | Máxima calidad de la conversión, requiere 32 GB+ de VRAM o offload |
| Modelo base (DavidAU, sin cuantizar) | no disponible (repo original) | 27,3B | no disponible | Apache 2.0 | Referencia de calidad completa; requiere transformers y ~55 GB en fp16 |

Comparativa con modelos de terceros (mismo tamaño o misma tarea): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": el ajuste elimina deliberadamente los mecanismos de rechazo. Puede generar contenido ofensivo, ilegal, peligroso o sexualmente explícito sin advertencia. La responsabilidad legal y ética del despliegue recae íntegramente en quien lo opera.
- Sesgos no auditados: no se ha publicado ninguna evaluación de sesgos, toxicidad o representación. Los conjuntos de datos de entrenamiento (Polar-STRICT, F451-STRICT, THE-DECKARD) no documentan su composición ni su procedencia.
- Riesgo de alucinación: sin benchmarks publicados ni información sobre el proceso de alineación, no hay garantía de fidelidad factual. Un modelo sin censura tiende además a no matizar cuando no sabe algo.
- Idioma: únicamente inglés declarado. El rendimiento en castellano u otras lenguas no está documentado y probablemente sea deficiente.
- Contexto no documentado: se desconoce la longitud de contexto nativa del modelo base. Configurar ventanas largas sin ese dato puede provocar degradación silenciosa o errores de memoria en el runtime.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y sin obligación de compartir derivados. Es una licencia permisiva, sin las cláusulas de uso aceptable que suelen acompañar a los modelos de pesos abiertos con restricciones.
- Cuantizaciones de baja precisión: Q2_K y las variantes Q3 comprometen notablemente la coherencia. No hay cuantizaciones imatrix/weighted disponibles, que suelen ofrecer mejor relación calidad/tamaño.
- Estado del repositorio: 0 descargas y 0 likes; no hay retroalimentación de la comunidad que valide la calidad de la conversión ni la fidelidad respecto al modelo original.
- Origen de los metadatos: la fecha de creación registrada en HuggingFace es 2026-09-11, posterior a la del modelo base en el mismo ecosistema, lo que conviene verificar antes de integrarlo en un pipeline de producción.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-GGUF
- Dataset DavidAU/Polar-STRICT-Datasets: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset DavidAU/F451-STRICT-Datasets: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Dataset DavidAU/THE-DECKARD-Datasets: https://huggingface.co/datasets/DavidAU/THE-DECKARD-Datasets
- Preguntas frecuentes y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke (referenciada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad relativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que aloja la infraestructura del cuantizador: https://www.nethype.de/
