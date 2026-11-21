# mradermacher/ASTRA-SPACE-VISION-V2-GGUF

## Resumen

ASTRA-SPACE-VISION-V2 es un modelo de vision-lenguaje especializado en astronomia, construido como un adaptador LoRA sobre Qwen2.5-VL. El modelo original lo desarrolla el usuario theocolf, y esta ficha cubre la version cuantizada en GGUF publicada por mradermacher. Resuelve el problema de interpretar y razonar sobre imagenes astronomicas (mapas estelares, imagenes de telescopio, espectros visuales) combinando percepcion visual con comprension del lenguaje, una tarea en la que los modelos generalistas suelen rendir de forma superficial por falta de vocabulario y contexto de dominio.

El modelo base Qwen2.5-VL aporta la arquitectura transformer multimodal con vision encoder y proyector hacia el espacio de embeddings del LLM. El adaptador LoRA sobre el modelo base afina el comportamiento hacia el dominio astronomico. El modelo cuenta con aproximadamente 3.090 millones de parametros segun los pesos safetensors y esta publicado en formato GGUF con 12 variantes de cuantizacion estatica (de Q2_K a f16, ademas de los ficheros mmproj para la torre de vision). La licencia no esta declarada en la informacion disponible, lo que supone una advertencia relevante para uso comercial.

La relevancia actual radica en que democratiza la inferencia de un modelo de vision-lenguaje especializado en astronomia en hardware de consumo: las cuantizaciones Q4_K_M ocupan unos 2,0 GB y permiten ejecucion local con llama.cpp, algo inviable con el modelo base sin cuantizar. Al estar publicado en 2026-11-20 y contar con 0 descargas y 0 likes en el momento de la consulta, se trata de una publicacion muy reciente y practicamente sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) basada en Qwen2.5-VL con adaptador LoRA |
| Parametros totales | 3.085.938.688 (aprox. 3,09 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ficheros mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base original en transformers/safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-VL: un transformer de lenguaje con un encoder de vision acoplado mediante un proyector que mapea las representaciones visuales al espacio de embeddings del LLM, permitiendo entradas intercaladas de imagen y texto. Sobre ese modelo base, ASTRA-SPACE-VISION-V2 incorpora un adaptador LoRA afinado para el dominio astronomico, lo que implica que los pesos distribuidos aqui corresponden al modelo fusionado con el adaptador, no al Qwen2.5-VL generico. La informacion disponible no detalla la configuracion exacta del LoRA (rango, alpha, capas objetivo) ni el dataset de entrenamiento.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del corpus astronomico, ni sobre si se aplico RLHF o DPO en el proceso de alineamiento. Las etiquetas de la model card indican el uso de LoRA y la orientacion conversacional, pero no aportan cifras. La innovacion tecnica destacable en esta publicacion no esta en la arquitectura sino en el empaquetado: mradermacher genera cuantizaciones estaticas (sin imatrix ponderada) y separa los ficheros mmproj de la torre de vision, lo que permite desplegar el modelo en llama.cpp con soporte multimodal.

## Capacidades

- Comprension de imagenes astronomicas: interpretacion de fotografias de telescopio, mapas estelares, diagramas y graficos cientificos en combinacion con texto.
- Generacion de texto conversacional en ingles sobre contenido visual y textual.
- Razonamiento de dominio astronomico: vocabulario y contexto especializados gracias al LoRA sobre Qwen2.5-VL.
- Soporte multimodal imagen-texto mediante los ficheros mmproj (Q8_0 o f16) en llama.cpp.
- Capacidad multilingue limitada: el modelo declara unicamente ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio): no disponibles.

## Casos de uso

- Analisis asistido de imagenes de telescopio: el modelo recibe una captura y genera descripciones o respuestas sobre objetos, estructuras y morfologia visibles, adecuado por su afinado en vocabulario astronomico.
- Interpretacion de mapas estelares y cartas celestes: util para explicar constelaciones, coordenadas o regiones de un mapa a partir de la imagen, aprovechando la torre de vision.
- Apoyo educativo en astronomia: generacion de explicaciones conversacionales en ingles sobre diagramas y figuras cientificas, con contexto de dominio.
- Etiquetado y anotacion asistida de datasets astronomicos: el modelo puede generar descripciones preliminares de imagenes para revision humana, agilizando la curadura de corpus.
- Asistente de documentacion cientifica: resumen y discusion de figuras extraidas de articulos o informes, combinando lectura visual y textual.
- Despliegue local en estaciones de trabajo: al caber en cuantizaciones de 2,0 GB (Q4_K_M), permite inferencia offline en portatiles o equipos sin GPU dedicada de gama alta, util en entornos de observatorio con conectividad limitada.
- Prototipado rapido de interfaces vision-lenguaje: integracion en demos y pruebas de concepto con llama.cpp u Ollama sin necesidad de infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB para Q4_K_M, 1,4 GB para Q2_K, 3,4 GB para Q8_0 y 6,3 GB para f16, a los que hay que sumar el fichero mmproj (0,9 GB en Q8_0 o 1,4 GB en f16) para el procesamiento de imagenes.
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM es suficiente para las cuantizaciones Q4 y Q5; para f16 se recomienda al menos 8-10 GB. No se requieren A100 ni H100.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 (12 GB), RTX 4060, RTX 4070 o superiores, y en equipos con memoria unificada.
- Opciones de despliegue: llama.cpp (con soporte mmproj para vision), Ollama y otros runners compatibles con GGUF; la libreria declarada es transformers para el modelo original.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ASTRA-SPACE-VISION-V2 (GGUF) | 3,09 mil millones | no disponible | no disponible | GGUF | Especializado en astronomia via LoRA sobre Qwen2.5-VL |
| Qwen2.5-VL (base) | no disponible en la informacion | no disponible | no disponible | safetensors | Modelo generalista multimodal; sin afinado de dominio |
| Alternativas de vision-lenguaje de ~3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para comparar rendimiento |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria; los datos de rendimiento, contexto y licencia de los modelos comparables no estan publicados en la informacion disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar la legalidad del uso comercial; es imprescindible verificar la licencia del modelo base theocolf/ASTRA-SPACE-VISION-V2 y de Qwen2.5-VL antes de desplegarlo en produccion.
- Solo ingles: no hay soporte multilingue declarado, lo que limita su uso en castellano sin degradacion esperada.
- Riesgo de alucinacion: al ser un modelo de 3B afinado por LoRA, puede generar descripciones visuales plausibles pero incorrectas, especialmente en objetos astronomicos poco representados en el entrenamiento.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia publica de calidad ni de benchmarks.
- Cuantizaciones estaticas sin imatrix: mradermacher indica que las cuantizaciones ponderadas no estan disponibles, lo que puede implicar mayor perdida de calidad en las variantes de baja precision (Q2_K, Q3_K_S).
- Contexto no documentado: se desconoce la ventana maxima efectiva, lo que impide planificar conversaciones multi-turno largas con garantias.
- Dependencia del modelo base: cualquier limitacion del Qwen2.5-VL subyacente (sesgos de vision, calidad del encoder) se hereda en este modelo.
- Idiomas y sesgos: al entrenarse presumiblemente con corpus en ingles de dominio astronomico, puede arrastrar sesgos de representacion de la literatura cientifica anglosajona.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/ASTRA-SPACE-VISION-V2-GGUF
- Modelo base original: https://huggingface.co/theocolf/ASTRA-SPACE-VISION-V2
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#ASTRA-SPACE-VISION-V2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
