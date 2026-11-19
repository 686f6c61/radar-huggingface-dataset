# mradermacher/MiniCPM5-abliterated-2B-i1-GGUF

## Resumen

MiniCPM5-abliterated-2B-i1-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo SonGT1/MiniCPM5-abliterated-2B, publicada por el usuario mradermacher. Se trata de una variante "abliterated" del modelo MiniCPM5 de 2B parametros, es decir, una version en la que se ha aplicado la tecnica de abliteration para eliminar la direccion de rechazo del espacio de activaciones, dando como resultado un modelo "uncensored" que responde sin las restricciones tipicas de seguridad del modelo original. El repositorio ofrece exclusivamente cuantizaciones GGUF generadas con imatrix (importancia matricial) para su uso con llama.cpp y herramientas compatibles.

El modelo base cuenta con 2.516.756.480 parametros totales segun los pesos safetensors, y esta disenado para tareas conversacionales en chino e ingles. La relevancia de esta ficha radica en que combina un modelo compacto (apto para hardware de consumo) con cuantizaciones de alta calidad (IQ-quants con imatrix) y un conjunto amplio de niveles de compresion, desde IQ1_S (~0,8 GB) hasta Q6_K (~2,2 GB), lo que permite desplegarlo en escenarios muy diversos, desde Raspberry Pi hasta GPUs de gama media.

La licencia declarada es Apache 2.0, lo que facilita el uso comercial, aunque la naturaleza "abliterated" y "uncensored" del modelo implica consideraciones eticas y de cumplimiento que deben evaluarse antes de cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniCPM5, transformer; detalles no especificados en la informacion) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | zh (chino), en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones), safetensors (modelo base) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base MiniCPM5-abliterated-2B mas alla de que se trata de un modelo de la familia MiniCPM5, desarrollada originalmente por OpenBMB. No se especifican en la informacion disponible el numero de capas, la dimension del modelo, el tipo de atencion ni los detalles del tokenizador. El repositorio de mradermacher es exclusivamente un trabajo de cuantizacion: no aporta informacion sobre el entrenamiento original.

El proceso de abliteration aplicado por SonGT1 consiste en identificar y restar la direccion de rechazo en el espacio de activaciones del modelo, una tecnica que elimina la tendencia a negarse a responder ciertas peticiones sin necesidad de reentrenamiento. Las cuantizaciones i1 de mradermacher utilizan ficheros imatrix (importancia matricial) generados a partir del propio modelo para ponderar la cuantizacion de cada tensor, lo que segun el autor mejora la calidad frente a cuantizaciones estaticas equivalentes. El repositorio incluye tambien un fichero imatrix independiente (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional en chino e ingles.
- Respuestas sin filtros de rechazo (comportamiento "uncensored" derivado de la abliteration).
- Uso como modelo de chat multi-turno (tag "conversational").
- Compatible con el ecosistema transformers y con llama.cpp mediante GGUF.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, vision, audio o modos de razonamiento explicito (thinking mode) en la informacion proporcionada.

## Casos de uso

- Experimentacion con tecnicas de abliteration: investigadores pueden comparar el comportamiento del modelo abliterated frente al original para estudiar como la eliminacion de la direccion de rechazo afecta a la calidad y coherencia de las respuestas.
- Despliegue en hardware de bajos recursos: las cuantizaciones IQ1_S e IQ2 permiten ejecutar el modelo en dispositivos con menos de 1 GB de RAM/VRAM, como Raspberry Pi o moviles, para tareas de generacion de texto basica.
- Prototipado rapido de chatbots en local: con la cuantizacion Q4_K_M (~1,7 GB) el modelo cabe en cualquier GPU de consumo moderna y permite iterar sobre prompts y flujos conversacionales sin coste de API.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo donde el modelo original podria rechazar tematicas sensibles, usando la variante abliterated para evitar rechazos.
- Investigacion sobre seguridad y alineacion: el modelo sirve como caso de estudio de los riesgos de las tecnicas de abliteration y de la dificultad de mantener salvaguardas en modelos open weights.
- Evaluacion de cuantizaciones: el amplio espectro de niveles (desde IQ1_S hasta Q6_K) permite medir el impacto de la compresion en la perplejidad y la calidad de las respuestas para un modelo de 2,5B parametros.
- Fine-tuning ligero sobre base abliterated: al estar bajo Apache 2.0, puede servir como punto de partida para ajustes especificos en dominios donde se requiera un tono sin filtros, siempre con las cautelas legales correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: IQ1_S ~0,8 GB; IQ2_M ~1,1 GB; IQ3_M ~1,3 GB; IQ4_XS ~1,5 GB; Q4_K_M ~1,7 GB; Q5_K_M ~1,9 GB; Q6_K ~2,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre para las cuantizaciones de mayor calidad (GTX 1650, RTX 3050, RTX 4060, etc.). Para las cuantizaciones IQ1/IQ2 basta con GPUs integradas o CPUs modernas.
- Cabe en GPU de consumo: si, practicamente en todas las GPU dedicadas de los ultimos 10 anos, asi como en CPUs con al menos 2-3 GB de RAM libre.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, llama-cpp-python, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede usarse con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al tratarse de un modelo de 2,5B parametros, se espera una generacion rapida en GPU de consumo, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-abliterated-2B-i1-GGUF (este) | ~2,5B | no disponible | Apache 2.0 | GGUF | Variante abliterated, cuantizaciones imatrix |
| MiniCPM5-abliterated-2B (SonGT1) | ~2,5B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| MiniCPM5-2B (original, OpenBMB) | ~2,5B | no disponible | no disponible en la informacion | safetensors | Modelo original con salvaguardas |
| Otros modelos 2B-3B abliterated | variable | variable | variable | GGUF/safetensors | No se dispone de datos comparativos en la informacion |

No se dispone de datos de rendimiento comparativo (benchmarks) en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo es "uncensored" por diseno: no aplica los filtros de seguridad del modelo original, por lo que puede generar contenido danino, ofensivo o ilegal si se le solicita. No debe desplegarse en aplicaciones orientadas al publico sin capas de moderacion adicionales.
- Riesgo elevado de alucinacion: al tratarse de un modelo de 2,5B parametros, su capacidad de razonamiento y su fiabilidad factica son limitadas en comparacion con modelos de mayor tamano.
- La abliteration puede degradar la coherencia y la calidad general del modelo en tareas que no estan relacionadas con el rechazo, aunque no se aportan datos concretos en la informacion disponible.
- Soporte linguistico limitado a chino e ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin salvaguardas puede incumplir normativas de servicios digitales o de proteccion de menores segun la jurisdiccion.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "mostly desperate".
- No se dispone de informacion sobre la longitud de contexto soportada, lo que impide garantizar su uso en tareas de contexto largo.
- El repositorio tiene muy pocas descargas (2.740) y un solo "like", lo que sugiere una validacion comunitaria escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MiniCPM5-abliterated-2B-i1-GGUF
- Modelo base: https://huggingface.co/SonGT1/MiniCPM5-abliterated-2B
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/MiniCPM5-abliterated-2B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MiniCPM5-abliterated-2B-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
