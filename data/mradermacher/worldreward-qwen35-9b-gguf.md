# mradermacher/WorldReward-qwen35-9b-GGUF

## Resumen

WorldReward-qwen35-9b es un modelo de recompensa (reward model) orientado a la evaluacion de modelos del mundo (world models) y a la generacion de video con control de camara. Lo desarrolla CodeGoat24 y esta construido sobre una base de la familia Qwen, con un total de 8.953.803.264 parametros (aproximadamente 9 mil millones). La version aqui descrita es una cuantizacion GGUF estatica publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo resuelve un problema concreto: proporcionar una senal de recompensa util para evaluar y guiar trayectorias de camara y coherencia espacio-temporal en pipelines de generacion de video. Los tags de la model card (reward-model, world-model, video-generation, camera-control) indican que esta pensado como componente de evaluacion dentro de sistemas de world modeling, no como un modelo generativo de proposito general.

Esta ficha cubre la variante GGUF publicada por mradermacher, que ofrece 13 cuantizaciones distintas (desde Q2_K de 3,9 GB hasta f16 de 18,0 GB) mas dos ficheros mmproj para el componente multimodal. La licencia Apache 2.0 y el soporte de transformers lo hacen adecuado para integracion en pipelines de investigacion, aunque la informacion publica sobre su entrenamiento y rendimiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen, sin detalle de capas publicada) |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en transformers/safetensors |
| Tamano del repo | 83,0 GB |
| Modelo base | CodeGoat24/WorldReward-qwen35-9b |
| Cuantizador | mradermacher |
| Descargas | 522 |
| Compatibilidad de endpoints | endpoints_compatible |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna en la model card proporcionada. El identificador del modelo base (WorldReward-qwen35-9b) sugiere una base de la familia Qwen, pero no se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni si emplea alguna variante como attention lineal o decodificacion especulativa. Tampoco se detalla el proceso de entrenamiento: no hay datos sobre el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras variantes de ajuste por preferencias.

Lo que si puede inferirse de los tags es el proposito: el modelo esta disenado como reward model para world models y generacion de video con control de camara. Esto implica que su entrenamiento probablemente se centro en pares de trayectorias o secuencias con etiquetas de calidad, pero se desconoce el volumen y la naturaleza exacta de esos datos. La presencia de ficheros mmproj en la cuantizacion GGUF confirma que el modelo original incorpora un componente multimodal (vision), necesario para procesar frames de video como entrada.

La cuantizacion de mradermacher es estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) y se ofrece tambien una variante con imatrix en el repositorio i1-GGUF, que suele preservar mejor la calidad en cuantizaciones bajas.

## Capacidades

- Evaluacion de recompensa: emite una puntuacion de calidad para trayectorias o secuencias, orientada a world models y generacion de video.
- Control de camara: los tags indican capacidad para modelar y evaluar movimientos de camara en secuencias generadas.
- Procesamiento multimodal: los ficheros mmproj permiten procesar entradas visuales (frames) junto con texto.
- Generacion de texto conversacional: el tag conversational sugiere uso en formato de dialogo, aunque su funcion principal es la evaluacion.
- Razonamiento sobre coherencia espacio-temporal: implicito en su rol de reward model para video, no confirmado con benchmarks.
- Soporte multilingue: limitado a ingles segun la model card.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Evaluacion de pipelines de generacion de video: el modelo actua como juez de recompensa para puntuar la calidad de secuencias generadas, permitiendo comparar variantes de un generador o filtrar salidas antes de publicacion.
- Control de trayectorias de camara en sintesis de video: integrado en un bucle de optimizacion, la senal de recompensa guia la seleccion de movimientos de camara coherentes con la escena.
- Investigacion en world models: sirve como componente de evaluacion para medir la consistencia fisica y temporal de simulaciones generadas, un paso previo habitual en el desarrollo de modelos del mundo.
- Filtrado de datasets de video sintetico: dado un lote de clips generados, el modelo puntua cada uno y permite descartar los de baja calidad antes de usarlos como datos de entrenamiento.
- Ajuste por refuerzo de generadores de video: la senal de recompensa puede emplearse en RLHF o variantes para optimizar un generador de video con control de camara.
- Despliegue en hardware de consumo para prototipado: con la cuantizacion Q4_K_M (5,7 GB) puede ejecutarse en una GPU consumer de 8-12 GB, lo que facilita iterar en local antes de escalar a infraestructura mayor.
- Evaluacion comparativa de modelos de video: permite construir rankings automatizados entre distintos generadores usando una metrica aprendida en lugar de metricas heuristicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (pesos + overhead de contexto y mmproj):
  - Q2_K: aproximadamente 4-5 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: aproximadamente 5-6 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M: aproximadamente 6-7 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 7-8 GB.
  - Q6_K: aproximadamente 8-9 GB.
  - Q8_0: aproximadamente 10-11 GB.
  - f16: aproximadamente 18-19 GB.
  - Anadir 0,7-1,0 GB si se carga el fichero mmproj para el componente multimodal.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 para cuantizaciones medias y altas; A100 o H100 para f16 y despliegues de alto throughput.
- Cabe en GPU consumer: si, desde Q2_K hasta Q8_0 en tarjetas de 8-12 GB; f16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en transformers puede servirse con vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion publica sobre modelos comparables de recompensa especificos para world models y control de camara en video. Como referencia de categoria (reward models de ~9B en formato GGUF), podrian considerarse alternativas genericas, pero no se han publicado datos que permitan una comparacion rigurosa de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WorldReward-qwen35-9b (este) | 8,95B | no disponible | Apache 2.0 | GGUF, safetensors | Reward model para video y control de camara |
| Alternativas de reward model de ~7-9B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos publicados |

## Limitaciones y advertencias

- Informacion de entrenamiento ausente: no se conocen datos, tokens ni metodo de ajuste, lo que dificulta evaluar su robustez fuera de su dominio previsto.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion: como modelo basado en lenguaje, puede producir puntuaciones o justificaciones inconsistentes si se usa fuera de su tarea de recompensa.
- Sesgos: no documentados por el autor; al ser un reward model, puede heredar sesgos de los datos de preferencia usados en su entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base CodeGoat24/WorldReward-qwen35-9b y de la familia Qwen subyacente.
- Cuantizaciones bajas: Q2_K y Q3_K_M pueden degradar la calidad de la senal de recompensa; para evaluacion fiable se recomienda Q5_K_M o superior.
- Contexto: se desconoce la longitud de contexto, lo que limita planificar el procesamiento de secuencias de video largas.
- Uso en produccion: sin benchmarks publicados, no se recomienda como unico criterio de evaluacion sin validacion propia en el dominio objetivo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WorldReward-qwen35-9b-GGUF
- Modelo base: https://huggingface.co/CodeGoat24/WorldReward-qwen35-9b
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/WorldReward-qwen35-9b-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#WorldReward-qwen35-9b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
