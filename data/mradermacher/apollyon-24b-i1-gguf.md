# mradermacher/Apollyon-24B-i1-GGUF

## Resumen

Apollyon-24B-i1-GGUF es la distribucion en formato GGUF del modelo Apollyon-24B, un LLM de 23.572 millones de parametros derivado de la familia Mistral y afinado por el usuario c4tdr0ut. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF con tecnicas de imatrix, que ofrece aqui una bateria muy amplia de niveles de cuantizacion (desde IQ1_S hasta Q6_K) para facilitar su ejecucion en hardware de consumo.

El modelo se presenta con etiquetas que lo situan en la categoria de modelos "abliterated" o "unaligned": segun los tags de la model card, ha pasado por procesos de SFT y DPO que reducen los rechazos y alineamientos restrictivos, y se inspira en el estilo de Grok (x.ai). Esta orientacion lo hace relevante para investigacion sobre comportamiento de modelos, evaluacion de mecanismos de rechazo y experimentacion con modelos conversacionales sin las restricciones tipicas de los asistentes comerciales.

La ficha se centra en la version cuantizada publicada por mradermacher, que hereda el modelo base c4tdr0ut/Apollyon-24B. La licencia figura como "other", lo que exige revisar los terminos del modelo base antes de cualquier uso comercial. El repositorio ocupa 253,6 GB e incluye el fichero imatrix para generar cuantizaciones propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia Mistral, segun tags) |
| Parametros totales | 23.572.403.200 (~23,6 B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (i1/imatrix) |
| Idiomas soportados | en (segun la model card) |
| Licencia | other |
| Formato de pesos | GGUF (con fichero imatrix adicional) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de los tags, que apuntan a una base Mistral y a un proceso de ajuste que combina SFT y DPO. El modelo base es c4tdr0ut/Apollyon-24B, y esta version es una cuantizacion del mismo realizada con tecnicas de imatrix (importance matrix), que ponderan la cuantizacion segun la relevancia de los pesos para reducir la perdida de calidad en niveles bajos de bits.

El pipeline de cuantizacion de mradermacher usa el formato i1 (imatrix) con quantize_version 2 y salida en tensores cuantizados, generando variantes tanto IQ como K-quants. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni detalles sobre el proceso de RLHF/DPO mas alla de la mencion generica en los tags.

## Capacidades

- Generacion de texto conversacional y multi-turno, orientada a chat.
- Razonamiento y respuesta abierta en ingles (unico idioma declarado).
- Comportamiento "unaligned"/"abliterated": menor tendencia a rechazar peticiones, segun los tags del autor.
- Estilo de respuesta inspirado en Grok (x.ai), segun los tags.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible; no se declaran.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y rechazo: el modelo, etiquetado como "abliterated" y "unaligned", permite estudiar como varia la tasa de rechazo y el comportamiento ante peticiones sensibles en comparacion con modelos alineados, en un entorno controlado de laboratorio.
- Experimentacion conversacional en local: gracias a las cuantizaciones Q4_K_M (14,4 GB) e IQ4_XS (12,9 GB), puede ejecutarse en una GPU de consumo de 16-24 GB para prototipos de chat sin depender de APIs externas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece mas de 20 variantes, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad de respuesta sobre un mismo modelo base.
- Generacion de datos sinteticos para investigacion: util para producir corpus de texto en ingles con un estilo conversacional menos filtrado, siempre que se revise el contenido generado.
- Pruebas de robustez y red teaming: su naturaleza menos restrictiva lo hace adecuado como sujeto de pruebas en ejercicios de seguridad de modelos y evaluacion de riesgos.
- Despliegue en entornos con recursos limitados: las variantes IQ2/IQ3 (6,6-12,5 GB) permiten ejecutar el modelo en equipos con 8-16 GB de VRAM o RAM para tareas de generacion de texto no criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin overhead de contexto): desde ~5,4 GB (IQ1_S) hasta ~19,4 GB (Q6_K); la variante recomendada Q4_K_M ocupa 14,4 GB.
- GPU recomendadas: para Q4_K_M y superiores, GPU con 16-24 GB de VRAM (RTX 4090, RTX 4080, A10, L4); para Q6_K, 24 GB o mas (RTX 3090/4090, A100 40 GB).
- Cabe en GPU de consumo: si, en RTX 3060 12 GB con cuantizaciones IQ3/IQ4 ajustadas, y en RTX 4090 con Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; el tag text-generation-inference sugiere compatibilidad con TGI, aunque el formato nativo es GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Apollyon-24B-i1-GGUF (este) | ~23,6 B | no disponible | other | GGUF | Cuantizaciones imatrix, orientacion unaligned |
| c4tdr0ut/Apollyon-24B (base) | ~23,6 B | no disponible | other | safetensors | Modelo original sin cuantizar |
| Mistral Small 24B (referencia de familia) | ~24 B | no disponible | no disponible | safetensors/GGUF | Base Mistral segun tags; comportamiento alineado estandar |
| Modelos abliterated de ~24 B | ~24 B | no disponible | variable | GGUF/safetensors | Alternativas de la misma categoria "unaligned" |

La comparacion cuantitativa de rendimiento no esta disponible; solo se puede contrastar tamano, formato y licencia.

## Limitaciones y advertencias

- Modelo etiquetado como "unhinged", "unaligned" y "abliterated": puede generar contenido que modelos alineados rechazarian; requiere supervision y filtros propios en produccion.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicados que permitan estimarlo.
- Soporte unicamente en ingles segun la model card; el rendimiento en castellano no esta garantizado.
- Licencia "other": es imprescindible revisar los terminos del modelo base c4tdr0ut/Apollyon-24B antes de uso comercial.
- Longitud de contexto no declarada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Las cuantizaciones por debajo de Q4 (especialmente IQ1/IQ2 y Q2_K_S) degradan notablemente la calidad; el propio autor las marca como "for the desperate" o "very low quality".
- No se declaran capacidades de tool calling ni de agentes; no asumir su disponibilidad en produccion.
- El repositorio ocupa 253,6 GB; la descarga completa de todas las variantes no es practica para la mayoria de entornos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Apollyon-24B-i1-GGUF
- Modelo base: https://huggingface.co/c4tdr0ut/Apollyon-24B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Apollyon-24B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Apollyon-24B-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
