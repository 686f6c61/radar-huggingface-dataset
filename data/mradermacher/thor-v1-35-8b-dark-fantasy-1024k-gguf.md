# mradermacher/Thor-v1.35-8b-DARK-FANTASY-1024k-GGUF

## Resumen

Thor-v1.35-8b-DARK-FANTASY-1024k es un modelo de lenguaje de 8.030.261.248 parámetros (aproximadamente 8B) desarrollado por MrRobotoAI y distribuido en formato GGUF por mradermacher. Se trata de un merge de modelos (fusión de pesos) realizado con la herramienta mergekit, orientado a un estilo narrativo oscuro y fantástico, y con una ventana de contexto nominal de 1024k tokens según indica su nombre. El modelo base es `MrRobotoAI/Thor-v1.35-8b-DARK-FANTASY-1024k`, y esta ficha cubre la versión cuantizada estática publicada por mradermacher.

La relevancia de esta publicación es fundamentalmente práctica: mradermacher ofrece una batería completa de cuantizaciones GGUF (desde Q2_K hasta f16) que permiten ejecutar un modelo de 8B en hardware de consumo, algo imposible con los pesos originales en precisión completa. El modelo está etiquetado únicamente para inglés (`en`) y no declara licencia en la información disponible, lo que condiciona su uso comercial.

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento ni los resultados de benchmarks del modelo base, ya que la model card del repositorio cuantizado se limita a describir el proceso de cuantización y los ficheros disponibles. Cualquier evaluación de capacidades debe tratarse, por tanto, como inferencia a partir de su tamaño y de su naturaleza de merge, no como dato verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como `transformers`; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no aplica (no es MoE, según la información disponible) |
| Longitud de contexto | 1024k tokens (según el nombre del modelo; no verificado en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0_4_4, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (también existe el modelo base en formato transformers/safetensors) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base en la documentación disponible. El repositorio cuantizado está etiquetado con `transformers`, `mergekit` y `merge`, lo que indica que el modelo original se generó mediante una fusión de pesos con mergekit, una técnica que combina los parámetros de varios modelos ya entrenados sin un entrenamiento adicional completo. No se especifican los modelos componentes del merge, la receta de fusión ni si hubo fases posteriores de ajuste fino, RLHF o DPO.

Tampoco se detallan los datos de entrenamiento (número de tokens, composición del corpus, proporción de código o matemáticas) ni innovaciones técnicas como decodificación especulativa o atención lineal. La única innovación documentada en el repositorio es el propio proceso de cuantización de mradermacher, que genera cuantizaciones estáticas (y, en un repositorio hermano, cuantizaciones con imatrix ponderada). El sufijo "1024k" del nombre sugiere una ventana de contexto muy extensa, pero no hay confirmación técnica de que el modelo base la soporte de forma efectiva.

## Capacidades

- Generación de texto en inglés, con un sesgo estilístico hacia narrativa oscura y fantástica (según el nombre del modelo; no verificado con ejemplos).
- Razonamiento general y respuesta a instrucciones, presumiblemente heredado de los modelos fusionados (no documentado).
- Generación de código y matemáticas: no confirmado en la documentación disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local eficiente gracias a las cuantizaciones GGUF, incluidas variantes optimizadas para ARM (Q4_0_4_4).

## Casos de uso

- Escritura creativa y narrativa fantástica oscura: el modelo está orientado por nombre y origen a este dominio, por lo que puede emplearse para generar relatos, descripciones de ambientación y diálogos con un tono oscuro consistente, ejecutándose localmente con cuantizaciones Q5_K_M o Q6_K para preservar calidad estilística.
- Prototipado de asistentes conversacionales en inglés: con un tamaño de 8B y cuantización Q4_K_M (5,0 GB), cabe en GPUs de consumo y permite iterar rápidamente en el diseño de prompts y flujos conversacionales sin coste de API.
- Generación de contenido para videojuegos y rol de mesa: útil para generar descripciones de objetos, misiones y trasfondo de personajes en un registro fantástico, integrado en pipelines de herramientas de autoría mediante llama.cpp.
- Experimentación con contexto largo: si la ventana de 1024k tokens es real, permitiría procesar documentos extensos o bibliotecas de ambientación completas en una sola pasada; conviene validar empíricamente esta capacidad antes de confiar en ella en producción.
- Investigación sobre merges de modelos: sirve como caso de estudio para analizar el efecto de las fusiones con mergekit en la coherencia estilística y la degradación de capacidades generales, comparando con los modelos originales.
- Despliegue en entornos con hardware limitado o air-gapped: las cuantizaciones Q2_K (3,3 GB) y Q3_K_S (3,8 GB) permiten ejecutar el modelo en equipos con poca VRAM o incluso en CPU, útil para demos offline o entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K ≈ 3,3 GB; Q3_K_S ≈ 3,8 GB; Q4_K_M ≈ 5,0 GB; Q5_K_M ≈ 5,8 GB; Q6_K ≈ 6,7 GB; Q8_0 ≈ 8,6 GB; f16 ≈ 16,2 GB.
- La memoria real necesaria es superior a la del fichero: hay que sumar la caché KV, que crece con la longitud de contexto. Con contextos muy largos (cientos de miles de tokens), la VRAM requerida puede superar con creces la de los pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB para cuantizaciones Q4–Q8 con contextos moderados; A100/H100 para contextos extremos o f16.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando Q4_K_M o inferiores; Q2_K y Q3_K_S pueden ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el repositorio está etiquetado como `endpoints_compatible`. Para el modelo base en transformers, vLLM o TGI (no verificado para esta arquitectura concreta).
- Latencia y throughput: no disponibles; dependerán del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Thor-v1.35-8b-DARK-FANTASY-1024k (este) | 8B | 1024k (nominal) | no disponible | GGUF, safetensors | Merge con mergekit, solo inglés |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | GGUF, safetensors | Modelo de referencia de Meta, multilingüe, benchmarks públicos |
| Mistral 7B Instruct | 7B | 32k | Apache 2.0 | GGUF, safetensors | Licencia permisiva, amplio ecosistema |
| Qwen2.5 7B Instruct | 7B | 128k | Apache 2.0 | GGUF, safetensors | Multilingüe, buen rendimiento en código y matemáticas |

La comparación es estructural: no hay datos de benchmarks de Thor que permitan contrastar rendimiento real frente a estas alternativas. Frente a ellas, Thor destaca por su contexto nominal de 1024k y su especialización estilística, pero carece de licencia declarada, soporte multilingüe y resultados verificables.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial; trátese como no apto para producción hasta verificar la licencia del modelo base.
- Solo inglés: no se debe esperar un rendimiento fiable en castellano u otros idiomas.
- Modelo de fusión sin documentación: los merges con mergekit pueden degradar capacidades generales (razonamiento, código, matemáticas) en favor del estilo; no hay benchmarks que lo confirmen o desmientan.
- Contexto de 1024k no verificado: el nombre del modelo sugiere una ventana enorme, pero no hay evidencia técnica de que se haya entrenado para ello; el rendimiento en contextos largos puede degradarse notablemente.
- Riesgo de alucinación: inherente a los modelos de 8B, especialmente en dominios factuales y sin datos de ajuste documentados.
- Sesgos: no documentados; al ser un merge sin model card detallada, no hay evaluación de sesgos.
- Especialización estilística: el sesgo hacia "dark fantasy" puede contaminar respuestas en usos técnicos o neutros.
- Baja adopción: 94 descargas y 1 like en el momento de la consulta, lo que implica poca validación comunitaria.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma notable; para uso serio, Q5_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Thor-v1.35-8b-DARK-FANTASY-1024k-GGUF
- Modelo base: https://huggingface.co/MrRobotoAI/Thor-v1.35-8b-DARK-FANTASY-1024k
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Thor-v1.35-8b-DARK-FANTASY-1024k-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Thor-v1.35-8b-DARK-FANTASY-1024k-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
