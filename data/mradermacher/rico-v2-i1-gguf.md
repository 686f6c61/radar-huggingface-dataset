# mradermacher/RICO-v2-i1-GGUF

## Resumen

RICO-v2-i1-GGUF es un conjunto de cuantizaciones GGUF generadas por mradermacher a partir del modelo base darkc0de/RICO-v2, un modelo de lenguaje de aproximadamente 27.320 millones de parametros (27,3B) orientado a generacion de texto conversacional. El autor del modelo base lo publica bajo una etiqueta de investigacion restringida y lo describe con terminos como "uncensored", "abliterated", "heretic" y "toxic", lo que indica que se ha sometido a tecnicas de eliminacion de rechazo (refusal removal) y probablemente a fine-tuning sobre un dataset especifico de investigacion de contenido sensible (darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT). La relevancia de esta ficha radica en que documenta un artefacto de cuantizacion, no un modelo original: el valor tecnico esta en las opciones de despliegue en hardware de consumo y en las advertencias de uso.

El repositorio incluye cuantizaciones con y sin imatrix (i1-*), desde Q2_K hasta Q6_K, con tamanos que van de 11,0 GB a 22,5 GB, ademas del fichero imatrix para generar cuantizaciones propias. La model card senala que se trata de un modelo de vision y que los ficheros mmproj, si existen, se alojan en el repositorio estatico hermano (mradermacher/RICO-v2-GGUF). El pipeline declarado en Hugging Face es "no disponible", aunque la libreria indicada es transformers y los tags incluyen text-generation-inference.

La licencia declarada es Apache 2.0, pero las etiquetas del repositorio ("not-for-all-audiences", "harmful", "toxic", "experimental") y la naturaleza del dataset de entrenamiento introducen caveats importantes para uso en produccion. Esta ficha se limita a documentar lo que la informacion disponible permite afirmar; cualquier dato no publicado se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es un transformer de 27,3B parametros; no se detalla en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix); versiones estaticas en el repo hermano RICO-v2-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original en safetensors segun el dato de parametros |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base darkc0de/RICO-v2 en la documentacion proporcionada. El recuento de parametros (27.320.697.856) es consistente con un transformer denso de aproximadamente 27B parametros, pero no se confirma si emplea atencion lineal, mezcla de expertos u otras variantes. La model card del repositorio de cuantizacion no incluye detalles sobre numero de capas, dimensiones ocultas, tipo de atencion ni estrategia de tokenizacion.

Respecto al entrenamiento, la unica informacion disponible es el dataset declarado: darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT, un conjunto de datos de ajuste supervisado (SFT) de investigacion restringida. Las etiquetas "abliterated", "heretic" y "uncensored" sugieren que el modelo ha pasado por procesos de eliminacion de direcciones de rechazo en el espacio de activaciones o de pesos, tecnicas habituales para producir modelos que no declinan peticiones. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en respuestas sin filtros de rechazo (uncensored).
- Capacidad de vision declarada en la model card ("This is a vision model"), con ficheros mmproj potencialmente disponibles en el repositorio estatico hermano.
- Razonamiento multi-turno y conversacion, segun el tag "conversational".
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidades multilingues limitadas al ingles segun el campo language del repositorio.
- Modelo experimental orientado a investigacion sobre comportamiento de modelos sin alineacion de rechazo.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como se comporta un modelo abliterated frente a peticiones que un modelo alineado rechazaria, comparando respuestas y midiendo tasas de rechazo en entornos controlados de laboratorio.
- Analisis de robustez de filtros de contenido: se puede emplear como generador adversarial para probar clasificadores de toxicidad y sistemas de moderacion, dado su perfil declarado de contenido sensible.
- Experimentacion con cuantizaciones GGUF: el repositorio ofrece un rango amplio de cuantizaciones (Q2_K a Q6_K) que permite medir la degradacion de calidad y perplexity segun el nivel de compresion en hardware limitado.
- Despliegue local en estaciones de trabajo con GPU de consumo: las variantes Q4_K_M (16,9 GB) y Q5_K_M (19,6 GB) caben en GPUs con 24 GB de VRAM, lo que facilita pruebas offline sin infraestructura en nube.
- Generacion de texto creativo sin restricciones en entornos de investigacion: util para estudiar sesgos y estilos de generacion en dominios donde los filtros de seguridad alteran la distribucion de salida.
- Evaluacion comparativa de tecnicas de abliteration: al existir el modelo base y sus cuantizaciones, se puede analizar si la cuantizacion preserva o amplifica los efectos de la eliminacion de rechazo.
- Pruebas de pipelines de inferencia (llama.cpp, Ollama, TGI): sirve como carga de trabajo de 27B parametros para validar configuraciones de servidores de inferencia y medir throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas overhead de contexto. Las cuantizaciones van de 11,0 GB (i1-Q2_K) a 22,5 GB (i1-Q6_K); la recomendada i1-Q4_K_M ocupa 16,9 GB.
- GPU recomendadas: para las cuantizaciones grandes (Q5_K_M, Q6_K) se recomienda una RTX 4090 (24 GB), A6000 (48 GB) o A100/H100 para mayor throughput y contexto largo. Para Q4_K_M y menores, una RTX 4090 o RTX 3090 (24 GB) es suficiente.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB para cuantizaciones Q4_K_M y superiores con contexto moderado; las variantes Q2_K y Q3 pueden caber en GPUs de 12-16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (tag declarado), y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI si se dispone de VRAM suficiente (aproximadamente 55 GB en FP16 para 27,3B parametros).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada. La comparativa se limita a parametros y formato:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RICO-v2-i1-GGUF (este) | 27,3B | no disponible | Apache 2.0 | GGUF | Cuantizaciones imatrix, etiquetado como experimental y no apto para todas las audiencias |
| darkc0de/RICO-v2 (base) | 27,3B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| mradermacher/RICO-v2-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas y posibles ficheros mmproj |

## Limitaciones y advertencias

- El modelo esta etiquetado explicitamente como "uncensored", "abliterated", "toxic", "harmful" y "not-for-all-audiences"; no es adecuado para aplicaciones de cara al publico sin capas adicionales de moderacion.
- Riesgo elevado de generar contenido danino, sesgado o no verificado; la ausencia de rechazo aumenta la probabilidad de respuestas inseguras.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicados que permitan estimar la fiabilidad factual.
- Soporte unicamente en ingles; no se garantiza calidad en otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar cargas con ventanas largas.
- Aunque la licencia declarada es Apache 2.0, las etiquetas de contenido y la naturaleza del dataset de entrenamiento pueden implicar obligaciones adicionales o riesgos legales en jurisdicciones con regulacion de contenido; se recomienda revision legal antes de uso comercial.
- Modelo experimental: no hay garantias de estabilidad, soporte ni mantenimiento por parte del autor original.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la coherencia; para uso serio se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/RICO-v2-i1-GGUF
- Modelo base: https://huggingface.co/darkc0de/RICO-v2
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/RICO-v2-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT
- Pagina de resumen del autor: https://hf.tst.eu/model#RICO-v2-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
