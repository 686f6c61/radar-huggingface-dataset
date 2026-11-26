# biplob123/gemma-4-e2b-grounded-health-GGUF

## Resumen

`biplob123/gemma-4-e2b-grounded-health-GGUF` es la distribucion en formato GGUF de un ajuste fino del modelo Gemma 4 orientado a responder preguntas biomedicas sobre abstracts cientificos con citacion de las frases que sustentan la respuesta. El autor, biplob123, parte de su propio modelo `biplob123/gemma-4-e2b-grounded-health` (etiqueta interna `gemma-e2b-grounded-v3b-q4`) y publica dos cuantizaciones listas para llama.cpp, Ollama y LM Studio.

El modelo resuelve una tarea muy concreta: dado un prompt con el formato de PubMedQA (pregunta mas frases numeradas de un abstract), devuelve un JSON con una etiqueta yes/no/maybe, una respuesta corta y los numeros de las frases citadas. Con una pregunta sin ese formato, el modelo responde en texto libre. El repositorio pesa 16,8 GB en total y contiene pesos de 4.647.450.147 parametros (aproximadamente 4,6 mil millones).

Es relevante ahora porque ofrece una via de despliegue local y ligera (3,43 GB en Q4_K_M) para experimentacion en evaluacion grounded de literatura biomedica, con un resultado de benchmark pre-registrado sobre el fichero Q4_K_M. La licencia declarada es Apache-2.0, pero el autor marca explicitamente el modelo como research only y no apto para uso clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, segun etiquetas del repo); detalles no disponibles |
| Parametros totales | 4.647.450.147 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (3,43 GB) y Q8_0 (4,97 GB) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 (con aviso research only del autor) |
| Formato de pesos | GGUF (construido con llama.cpp b12421) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su pertenencia a la familia Gemma 4 (transformer decoder-only) y del ajuste fino sobre el modelo base `biplob123/gemma-4-e2b-grounded-health`. El autor remite a la model card del modelo base para datos de entrenamiento, evaluacion y limites, pero esos detalles no se incluyen en la informacion proporcionada.

El aspecto tecnico mas destacable es el formato de prompt: el modelo solo emite la respuesta JSON estructurada (etiqueta, respuesta corta y numeros de frases citadas) cuando recibe el prompt de PubMedQA de EvalKit, con la pregunta y las frases numeradas del abstract. Ademas, el autor indica que el benchmark se ejecuto con el modo thinking desactivado (`--reasoning off` en llama-server) y decodificacion greedy (temperatura 0); con thinking activado, Gemma 4 genera un bloque de razonamiento antes del JSON. El fichero Q8_0 se recomienda cuando el espacio lo permite por su mayor fidelidad respecto a los pesos fusionados, aunque sus numeros de benchmark son exploratorios.

## Capacidades

- Generacion de respuestas estructuradas en JSON para preguntas sobre abstracts biomedicos: etiqueta yes/no/maybe, respuesta corta y citas de frases.
- Respuesta grounded: el modelo cita los numeros de las frases del abstract que sustentan su respuesta.
- Respuesta en texto libre cuando la entrada no sigue el formato PubMedQA de EvalKit.
- Modo thinking configurable (bloque de razonamiento previo a la respuesta JSON), desactivable mediante `--reasoning off` o `--think=false`.
- Conversacional (etiqueta `conversational` en el repo).
- Compatible con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling: no disponible.
- Capacidades multilingues: no disponibles.
- Vision o audio: no disponible.

## Casos de uso

- Evaluacion de QA biomedica grounded: ejecutar el modelo sobre PubMedQA con el prompt de EvalKit para reproducir el resultado pre-registrado del fichero Q4_K_M y comparar variantes de cuantizacion.
- Investigacion sobre citacion de evidencia: analizar como un modelo pequeno selecciona y cita frases concretas de un abstract para justificar una etiqueta yes/no/maybe.
- Despliegue local con Ollama: lanzar `ollama run --think=false hf.co/biplob123/gemma-4-e2b-grounded-health-GGUF:Q8_0` en una maquina de desarrollo para prototipar pipelines de lectura de literatura cientifica sin depender de APIs externas.
- Experimentos de sensibilidad a la cuantizacion: comparar Q4_K_M (3,43 GB) frente a Q8_0 (4,97 GB) en la misma tarea para medir la degradacion introducida por la cuantizacion de 4 bits.
- Integracion en pipelines de revision asistida: usar la salida JSON con etiqueta y citas como entrada estructurada en herramientas internas de triaje de abstracts, siempre en contexto de investigacion y no clinico.
- Analisis de robustez al formato de prompt: estudiar la diferencia entre la salida JSON con el prompt PubMedQA y la salida en texto libre con una pregunta desnuda, util para investigar dependencia de formato.
- Pruebas de decodificacion: evaluar el efecto de la temperatura (greedy frente al muestreo por defecto de Ollama) en la consistencia de las respuestas, dado que el autor advierte que el muestreo por defecto puede dar respuestas distintas.

## Benchmarks y rendimiento

El autor indica que existe un resultado de benchmark pre-registrado en la model card del modelo base, correspondiente al fichero Q4_K_M, y que los numeros del Q8_0 son exploratorios. Sin embargo, las cifras concretas no estan incluidas en la informacion proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,5-4 GB para Q4_K_M (fichero de 3,43 GB) y 5-5,5 GB para Q8_0 (fichero de 4,97 GB), incluyendo overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM para Q4_K_M; 8 GB o mas para Q8_0. Para mayor throughput, GPUs de datacenter como A100 o H100, aunque el tamano del modelo no las requiere.
- Cabe en GPU consumer: si, en tarjetas tipo RTX 3060, RTX 4060, RTX 4070 o superiores con la VRAM indicada.
- Opciones de despliegue: llama.cpp (construido con b12421), llama-server con `--reasoning off`, Ollama (`--think=false`) y LM Studio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas equivalentes en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A nivel estructural, el modelo se posiciona como un ajuste fino de ~4,6 mil millones de parametros en GGUF, con licencia Apache-2.0 y restriccion de uso a investigacion, frente a modelos medicos genericos de mayor tamano o a soluciones propietarias de QA clinico, pero sin cifras que permitan contrastarlos.

| Modelo | Parametros | Contexto | Licencia | Formato | Uso declarado |
|---|---|---|---|---|---|
| gemma-4-e2b-grounded-health-GGUF | 4.647.450.147 | no disponible | Apache-2.0 (research only) | GGUF | Investigacion |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Restriccion explicita del autor: research only, not medical advice; no apto para uso clinico ni para decisiones personales de salud.
- Dependencia fuerte del formato de prompt: la salida JSON estructurada solo aparece con el prompt PubMedQA de EvalKit; con una pregunta desnuda el modelo responde en texto libre.
- El benchmark de referencia se ejecuto con decodificacion greedy (temperatura 0); el muestreo por defecto de Ollama puede producir respuestas distintas a la misma pregunta.
- Con thinking activado se genera un bloque de razonamiento antes del JSON, lo que altera la salida esperada si no se desactiva.
- Los numeros de benchmark del fichero Q8_0 son exploratorios segun el autor.
- Riesgo de alucinacion en citas y etiquetas: no se documentan en la informacion disponible tasas de error ni analisis de sesgos.
- Idiomas soportados no documentados; el uso esta orientado a abstracts en ingles por el formato PubMedQA.
- Aunque la licencia es Apache-2.0, la etiqueta research only del autor debe tenerse en cuenta antes de cualquier uso en produccion.
- No se documentan limitaciones de longitud de contexto en la informacion disponible.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/biplob123/gemma-4-e2b-grounded-health-GGUF
- Modelo base: https://huggingface.co/biplob123/gemma-4-e2b-grounded-health
- llama.cpp (runtime de construccion, b12421): no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
