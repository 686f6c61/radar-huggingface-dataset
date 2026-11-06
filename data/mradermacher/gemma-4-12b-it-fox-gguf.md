# mradermacher/Gemma-4-12B-it-Fox-GGUF

## Resumen

Gemma-4-12B-it-Fox es un modelo conversacional derivado de la familia Gemma 4 de Google, afinado por el usuario icelandicfox y distribuido en formato GGUF por mradermacher. El repositorio que nos ocupa no contiene los pesos originales en safetensors, sino una coleccion de cuantizaciones estaticas (de Q2_K a f16, mas suplementos multimodales mmproj) generadas a partir de icelandicfox/Gemma-4-12B-it-Fox. Su proposito es facilitar la ejecucion local del modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

La informacion publica disponible es muy limitada: la model card del repositorio se limita a listar los ficheros de cuantizacion y remite a la model card del modelo base para cualquier detalle sobre entrenamiento, capacidades o licencia. El dato de parametros reportado por safetensors (4.647.450.147) es inconsistente con el nombre comercial "12B", por lo que debe tratarse con cautela; el tamano real del fichero f16 (9,4 GB) sugiere un modelo en el rango de 4-5 mil millones de parametros, no de 12 mil millones.

Es relevante ahora porque permite probar un modelo de la generacion Gemma 4 en equipos sin GPU de datacenter, con opciones desde 3,1 GB (Q2_K) hasta 9,4 GB (f16), y con soporte multimodal a traves de los ficheros mmproj. No obstante, la ausencia de licencia declarada y de benchmarks publicados obliga a tratarlo con precaucion en entornos productivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, transformer decoder-only presumiblemente; no confirmado en la informacion) |
| Parametros totales | 4.647.450.147 (dato de safetensors del modelo base); el nombre comercial indica "12B", discrepancia no resuelta |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 para multimodal |
| Idiomas soportados | en (segun la model card; no se declaran otros idiomas) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) empleadas en Gemma-4-12B-it-Fox. La model card del repositorio GGUF no incluye estos datos y remite implicitamente al modelo base icelandicfox/Gemma-4-12B-it-Fox, cuya informacion no se ha proporcionado.

Lo unico verificable a nivel tecnico es el proceso de cuantizacion: mradermacher ha generado cuantizaciones estaticas (no ponderadas por imatrix, segun indica el propio autor) con la herramienta de conversion a GGUF, incluyendo suplementos multimodales mmproj en Q8_0 y f16. La presencia de estos ficheros mmproj indica que el modelo base incorpora capacidad de vision, aunque no se detalla el codificador visual ni la resolucion de imagen soportada.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y el sufijo `-it` (instruction-tuned) del nombre.
- Procesamiento multimodal: la existencia de ficheros mmproj-Q8_0 y mmproj-f16 confirma soporte de entrada de imagenes, aunque no se especifican detalles.
- Ejecucion local mediante llama.cpp y derivados, al estar distribuido en GGUF.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a traves de infraestructura compatible con la API de Hugging Face.
- Capacidades de razonamiento, codigo, matematicas, tool calling o agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantizacion Q4_K_M (3,5 GB) el modelo cabe en GPUs de consumo de 8 GB o incluso en CPU con RAM suficiente, lo que permite iterar en el desarrollo de chatbots sin coste de API.
- Procesamiento de documentos con imagenes en equipos modestos: los ficheros mmproj permiten alimentar imagenes junto al texto, util para extraer informacion de capturas, formularios o diagramas en flujos offline.
- Evaluacion comparativa de la familia Gemma 4: al ofrecer 12 niveles de cuantizacion, permite medir el impacto de la compresion en calidad (de Q2_K a f16) sobre una misma base afinada.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en local, los datos no salen del equipo, adecuado para prototipos con informacion sensible.
- Integracion en pipelines de CI/CD para pruebas de regresion de prompts: la version Q8_0 (5,1 GB) ofrece calidad cercana a f16 con menor huella, util para validar respuestas de forma automatizada.
- Investigacion sobre cuantizacion: la disponibilidad de IQ4_XS junto a Q4_K_S y Q4_K_M permite estudiar diferencias de perplejidad entre metodos IQ y no-IQ sobre el mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,1 GB
  - Q3_K_M: ~3,3 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~3,4-3,5 GB
  - Q5_K_M: ~3,7 GB
  - Q6_K: ~3,9 GB
  - Q8_0: ~5,1 GB
  - f16: ~9,4 GB
  - Suplemento multimodal: +0,7 GB (mmproj-Q8_0) o +1,1 GB (mmproj-f16)
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4-Q5; RTX 3060/4060, RTX 4070 o superiores para Q8_0; A100/H100 no son necesarias dado el tamano.
- Cabe en GPU de consumo: si, practicamente todas las cuantizaciones hasta Q8_0 caben en GPUs de 8 GB; f16 requiere ~10-12 GB (RTX 4080, 4090 o similar).
- Opciones de despliegue: llama.cpp, Ollama (previa importacion del GGUF), llama-cpp-python, y servidores compatibles con la API de OpenAI que usen llama.cpp como backend. vLLM y TGI no soportan GGUF de forma nativa generalizada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa. Como referencia estructural, podria compararse con otras cuantizaciones GGUF de la familia Gemma o con modelos de ~4-5B parametros en formato GGUF, pero no se dispone de cifras verificables en este contexto.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; es un riesgo critico para produccion.
- Discrepancia de parametros: el nombre indica "12B" pero safetensors reporta 4.647.450.147 parametros y el f16 pesa 9,4 GB, lo que apunta a un modelo de ~4-5B. Verificar antes de dimensionar infraestructura.
- Solo ingles declarado: no hay evidencia de soporte multilingue; el rendimiento en castellano es desconocido.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni similares que permitan evaluar su calidad real.
- Cuantizaciones estaticas sin imatrix: el autor indica que no hay versiones ponderadas, lo que puede suponer mayor perdida de calidad en cuantizaciones bajas (Q2_K, Q3_K_S) frente a alternativas con imatrix.
- Riesgo de alucinacion: inherente a los modelos generativos; sin datos de alineacion no se puede estimar su magnitud.
- Modelo derivado de un afinamiento de terceros (icelandicfox): la calidad y los sesgos dependen del proceso de fine-tuning, del que no hay informacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gemma-4-12B-it-Fox-GGUF
- Modelo base: https://huggingface.co/icelandicfox/Gemma-4-12B-it-Fox
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemma-4-12B-it-Fox-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
