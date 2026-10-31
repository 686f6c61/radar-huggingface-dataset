# mradermacher/ZwZ2-4B-Surgical-Abliterated-GGUF

## Resumen

ZwZ2-4B-Surgical-Abliterated-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo medismera/ZwZ2-4B-Surgical-Abliterated, realizada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es una versión "abliterated" de un modelo de 4.205 millones de parámetros, es decir, un modelo al que se le han eliminado mediante técnicas de alineación quirúrgica ("surgical alignment") los mecanismos de rechazo entrenados, lo que lo hace "uncensored": responde a instrucciones que un modelo alineado convencionalmente se negaría a atender.

Este tipo de repositorios no introduce cambios en el modelo en sí, sino que lo hace accesible para inferencia local con llama.cpp, Ollama, LM Studio y otras herramientas compatibles con GGUF, ofreciendo desde cuants muy agresivos (Q2_K, unos 2 GB) hasta f16 completo (8,5 GB). El modelo base incluye además un suplemento multimodal (mmproj), lo que sugiere capacidades de visión además de la generación de texto conversacional. Su relevancia actual se enmarca en la tendencia de la comunidad a disponer de modelos pequeños, sin filtros y ejecutables en hardware de consumo, para investigación sobre alineación, red-teaming y casos de uso donde los rechazos del modelo resultan un obstáculo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal LM (transformer decoder); variante concreta no disponible |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estáticos); disponibles además imatrix/weighted en un repo aparte |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo base, ZwZ2-4B-Surgical-Abliterated, es un modelo de lenguaje causal de unos 4,2 mil millones de parámetros al que se ha aplicado un proceso de "abliteración" mediante "surgical alignment". Esta técnica consiste en identificar las direcciones o componentes del modelo responsables de los rechazos de seguridad y anularlos (por ejemplo, mediante ablación de activaciones), de modo que el modelo pierde la capacidad de negarse a responder sin necesidad de reentrenamiento completo. No se ha publicado información sobre el modelo original del que deriva, ni sobre tokens de entrenamiento, composición del dataset o uso de RLHF/DPO.

La contribución de mradermacher es exclusivamente de cuantización: conversión a GGUF estático en múltiples niveles de bits (de 2 a 16 bits por peso), incluyendo un suplemento multimodal (mmproj) en Q8_0 y f16 que habilita capacidades de visión al usarlo con llama.cpp. También existen cuants ponderados con imatrix en un repositorio complementario, que suelen ofrecer mejor calidad a igual tamaño.

## Capacidades

- Generación de texto conversacional en inglés, sin mecanismos de rechazo por alineación (abliterated/uncensored).
- Posibles capacidades multimodales de visión, dado que el repo incluye archivos mmproj (mmproj-Q8_0 y mmproj-f16) compatibles con llama.cpp.
- Ejecución local eficiente en GPU y CPU gracias al formato GGUF y a la amplia gama de cuantizaciones.
- Compatibilidad con razonamiento multi-paso y seguimiento de instrucciones heredados del modelo base (nivel de capacidad no documentado).
- No hay información publicada sobre soporte de tool calling, function calling ni capacidades agénticas.

## Casos de uso

- Investigación en alineación y seguridad: permite estudiar cómo se comportan los modelos sin capas de rechazo, útil para red-teaming, análisis de vulnerabilidades y evaluación de robustez de filtros externos.
- Escritura creativa sin restricciones: autores que necesitan que el modelo no interrumpa narrativas con contenido maduro o conflictivo pueden usarlo localmente con LM Studio u Ollama.
- Prototipado en hardware de consumo: con cuants Q4_K_M (2,8 GB) cabe cómodamente en portátiles y GPUs de gama media, ideal para experimentación rápida sin coste de API.
- Análisis de imágenes con modelos locales: el suplemento mmproj permite describir o razonar sobre imágenes en entornos offline mediante llama.cpp.
- Construcción de asistentes privados: al ejecutarse íntegramente en local, no se envían datos a terceros, adecuado para entornos con requisitos de privacidad.
- Comparativas de cuantización: la amplia gama de cuants del mismo modelo lo hace útil como banco de pruebas para medir la degradación de calidad entre Q2_K y f16.
- Generación de datos sintéticos sin filtros: pipelines de investigación que requieren respuestas a prompts sensibles que otros modelos rechazarían.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuant: Q2_K unos 2 GB; Q4_K_M unos 2,8 GB; Q6_K unos 3,6 GB; Q8_0 unos 4,6 GB; f16 unos 8,5 GB (más el mmproj, 0,5-0,8 GB, si se usa visión).
- Al ser un modelo de 4B, cabe en prácticamente cualquier GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090, e incluso puede ejecutarse solo con CPU y RAM en equipos modestos.
- GPU recomendadas: cualquier GPU moderna; para el cuant f16 con contexto largo conviene una GPU con 12 GB o más (RTX 3060 12 GB, RTX 4070 o superior).
- Despliegue: llama.cpp, Ollama, LM Studio, GPT4All y cualquier runtime compatible con GGUF. No está orientado a vLLM o TGI, que requieren formatos de pesos distintos.
- Latencia y throughput: no disponible; por tamaño (4B) se espera inferencia muy fluida en GPU de consumo, típicamente decenas de tokens por segundo incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| ZwZ2-4B-Surgical-Abliterated-GGUF | 4,2B | GGUF (Q2_K a f16) | Apache 2.0 | Abliterated, multimodal (mmproj) |
| Llama 3.1 8B Instruct (abliterations de la comunidad) | 8B | GGUF/safetensors | Licencia Llama 3.1 | Mayor capacidad, más VRAM |
| Qwen2.5 7B Instruct | 7B | GGUF/safetensors | Apache 2.0 (algunas variantes) | Sin abliterar, mejor documentado |
| Phi-3.5 mini (3,8B) | 3,8B | GGUF/safetensors | MIT | Tamaño similar, alineado |

Nota: no hay datos de rendimiento publicados que permitan comparar calidad de salida; la comparativa se limita a tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- Al estar abliterated, el modelo carece de salvaguardas: puede generar contenido ofensivo, peligroso o inapropiado. Su uso conlleva responsabilidad legal y ética para el desplegador.
- La abliteración puede degradar la calidad general del modelo y su capacidad de razonamiento respecto al modelo base original, algo no cuantificado aquí.
- Idioma: la model card declara solo inglés; el rendimiento en castellano no está documentado y puede ser inferior.
- Cuants bajos (Q2_K, Q3_K_M) presentan pérdida de calidad notable, como indica el propio autor del repo.
- Longitud de contexto no documentada: verificarla antes de usarlo en tareas con documentos largos.
- No hay información sobre tool calling ni capacidades agénticas; no asumir soporte sin probarlo.
- Los datos de seguridad del modelo base original no están publicados en este repo; no hay garantías de rendimiento en producción.

## Enlaces

- Repositorio GGUF (este): https://huggingface.co/mradermacher/ZwZ2-4B-Surgical-Abliterated-GGUF
- Modelo base: https://huggingface.co/medismera/ZwZ2-4B-Surgical-Abliterated
- Cuants imatrix/weighted: https://huggingface.co/mradermacher/ZwZ2-4B-Surgical-Abliterated-i1-GGUF
- Página de descargas de mradermacher: https://hf.tst.eu/model#ZwZ2-4B-Surgical-Abliterated-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
