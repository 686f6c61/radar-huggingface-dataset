# mradermacher/sonda-1.0-4B-GGUF

## Resumen

sonda-1.0-4B-GGUF es el conjunto de cuantizaciones en formato GGUF del modelo Mr-Shmoo/sonda-1.0-4B, publicadas por el usuario mradermacher, conocido por distribuir versiones cuantizadas de modelos open source. El modelo original cuenta con 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y esta etiquetado en HuggingFace con los descriptores "decision-model", "calibration", "sonda", "polish" y "qwen3.5", lo que sugiere un modelo orientado a tareas de decision y calibracion, con soporte para polaco e ingles.

El repositorio no incluye model card tecnica del autor original: la unica documentacion disponible es la ficha de cuantizacion, que lista los ficheros GGUF generados y su tamano. No se publican datos sobre arquitectura exacta, longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks, por lo que cualquier evaluacion tecnica detallada queda pendiente de la informacion publicada en el repositorio del modelo base.

La relevancia practica de esta publicacion es que permite ejecutar un modelo de ~4,2 B de parametros en hardware de consumo mediante llama.cpp y derivados, con cuantizaciones que van desde 2,0 GB (Q2_K) hasta 8,5 GB (f16). La licencia Apache 2.0 facilita su uso comercial, si bien la ausencia de especificaciones verificadas obliga a validar el comportamiento en el caso de uso concreto antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags del repositorio mencionan "qwen3.5", sin confirmacion en la model card) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | polaco (pl) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas) |
| Modelo base | Mr-Shmoo/sonda-1.0-4B |
| Cuantizado por | mradermacher |
| Tamano del repositorio | 38,9 GB |
| Libreria declarada | transformers |
| Fecha de publicacion | 2 de octubre de 2026 |
| Fecha de ultima actualizacion | 2 de octubre de 2026 |

## Arquitectura y entrenamiento

No disponible. La model card del repositorio GGUF no describe la arquitectura del modelo base, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF, DPO o SFT. El unico indicio es la etiqueta "qwen3.5" incluida entre los tags, que apuntaria a una familia derivada de Qwen, sin que exista confirmacion documental en la informacion proporcionada.

Respecto al proceso de cuantizacion, la ficha indica que se trata de cuantizaciones estaticas generadas con un "quantize_version: 2" y "output_tensor_quantised: 1", con conversion de tipo "hf". El propio autor senala que en el momento de la publicacion no habia cuantizaciones ponderadas ni con imatrix, y que solo se generarian si hubiera demanda por parte de la comunidad.

## Capacidades

- Generacion de texto conversacional en polaco e ingles, segun los idiomas declarados en el repositorio.
- Tareas de decision y calibracion, de acuerdo con los tags "decision-model" y "calibration" del modelo base. No hay documentacion que detalle el formato de salida ni el procedimiento de calibracion.
- Uso como modelo base para tareas de clasificacion o seleccion de respuestas, si se confirma la naturaleza "decision-model" descrita en las etiquetas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible; no se declaran en el repositorio.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada.
- Capacidad multilingue: limitada a polaco e ingles segun los metadatos; no se declaran otros idiomas.

## Casos de uso

- Asistente conversacional local en polaco para escritorio: las cuantizaciones Q4_K_S y Q4_K_M (2,7 y 2,8 GB) permiten ejecutar el modelo en un portatil sin GPU dedicada mediante llama.cpp u Ollama, cubriendo conversaciones en polaco sin enviar datos a servicios externos.
- Clasificacion y filtrado de textos en pipelines internos: si se confirma la orientacion "decision-model", el modelo puede etiquetar o priorizar documentos en lotes, aprovechando su tamano reducido para procesar grandes volumenes en CPU.
- Procesamiento por lotes offline de documentos en polaco e ingles: el formato GGUF y el rango de cuantizaciones de 2,0 a 4,6 GB permiten desplegar varias instancias por servidor y maximizar el throughput en tareas de resumen o extraccion.
- Prototipado rapido de aplicaciones de IA en entornos con recursos limitados: al ser un modelo de ~4,2 B, es adecuado para validar productos antes de escalar a modelos mayores, manteniendo costes de inferencia bajos.
- Inferencia en el borde (edge) o en dispositivos sin conexion: la cuantizacion Q2_K, con 2,0 GB, permite ejecutar el modelo en equipos con 4 GB de RAM, util para entornos aislados o con requisitos de privacidad estrictos.
- Generacion de respuestas en asistentes de atencion al cliente en polaco: con licencia Apache 2.0, puede integrarse en productos comerciales, siempre que se valide previamente la calidad y la tasa de alucinacion en el dominio concreto.
- Evaluacion comparativa de tecnicas de cuantizacion: al ofrecer doce variantes del mismo modelo (desde Q2_K hasta f16), el repositorio sirve como banco de pruebas para medir el impacto de la cuantizacion en la calidad de salida y en el consumo de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni para el modelo base ni para las cuantizaciones.

## Requisitos de hardware

Tamano de cada fichero GGUF y VRAM/RAM minima estimada para cargar solo los pesos (sin contar cache KV, que depende de la longitud de contexto y no puede calcularse al no publicarse este dato):

| Cuantizacion | Tamano del fichero | VRAM/RAM minima estimada (pesos) |
|---|---|---|
| Q2_K | 2,0 GB | ~2,5 GB |
| Q3_K_S | 2,2 GB | ~2,7 GB |
| Q3_K_M | 2,4 GB | ~2,9 GB |
| Q3_K_L | 2,5 GB | ~3,0 GB |
| IQ4_XS | 2,6 GB | ~3,1 GB |
| Q4_K_S | 2,7 GB | ~3,2 GB |
| Q4_K_M | 2,8 GB | ~3,3 GB |
| Q5_K_S | 3,1 GB | ~3,6 GB |
| Q5_K_M | 3,2 GB | ~3,7 GB |
| Q6_K | 3,6 GB | ~4,1 GB |
| Q8_0 | 4,6 GB | ~5,1 GB |
| f16 | 8,5 GB | ~9,0 GB |

- Cabe en GPU de consumo: si. Una GPU con 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, GTX 1660 Super con 6 GB) puede ejecutar sin problemas las cuantizaciones Q4 y Q5. Las variantes Q6_K, Q8_0 y f16 requieren 8 GB o mas (RTX 3070, RTX 4060 Ti 16 GB, RTX 4070).
- GPU recomendadas para despliegue con mayor margen y contexto largo: RTX 4090, L40S, A100 o H100, aunque para un modelo de 4,2 B cualquier GPU moderna con suficiente VRAM es adecuada.
- Opciones de despliegue: llama.cpp, llama.cpp server, Ollama, LM Studio, koboldcpp y text-generation-webui para los ficheros GGUF. Para vLLM o TGI seria necesario usar el modelo base en safetensors, ya que estos servidores no estan orientados a GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para ninguna de las cuantizaciones.
- Nota sobre memoria: los valores de la tabla son estimaciones a partir del tamano de los ficheros; el consumo real dependera de la longitud de contexto, del backend y del sistema de gestion de memoria de la cache KV.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas estructurales declaradas de alternativas de tamano similar de uso comun. Las especificaciones de los modelos alternativos proceden de conocimiento publico general y deben verificarse en sus repositorios oficiales.

| Modelo | Parametros | Contexto | Licencia | Formatos | Rendimiento publicado |
|---|---|---|---|---|---|
| sonda-1.0-4B (GGUF) | 4,2 B | no disponible | Apache 2.0 | GGUF | no disponible |
| Qwen3-4B | ~4,0 B | 32.768 tokens nativos, ampliable | Apache 2.0 | safetensors, GGUF | si, publicado por el autor |
| Gemma 3 4B | ~4,0 B | 128.000 tokens | Licencia Gemma (con restricciones de uso) | safetensors, GGUF | si, publicado por el autor |
| Llama 3.2 3B | ~3,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | si, publicado por el autor |

Diferencias relevantes: sonda-1.0-4B ofrece licencia Apache 2.0, mas permisiva que las licencias de Gemma y Llama, pero carece de documentacion publica sobre contexto, entrenamiento y evaluacion, lo que dificulta una comparacion rigurosa con las alternativas citadas.

## Limitaciones y advertencias

- No hay resultados de benchmarks ni evaluaciones independientes publicadas, por lo que la calidad real del modelo es desconocida.
- La model card del repositorio GGUF no documenta el entrenamiento, la arquitectura ni el dataset; toda afirmacion sobre capacidades basada en los tags ("decision-model", "calibration") queda sin verificar.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion con documentos extensos.
- Idiomas limitados a polaco e ingles; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Riesgo de alucinacion inherente a los modelos de ~4 B, especialmente en tareas factuales y de razonamiento aritmetico complejo; requiere validacion en el dominio de aplicacion.
- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluacion de sesgo o toxicidad.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) degradan la calidad respecto a los pesos originales; el propio autor recomienda Q4_K_S y Q4_K_M como opciones rapidas y Q6_K o Q8_0 para mayor fidelidad.
- El modo conversacional u otras capacidades declaradas en los metadatos de HuggingFace no estan documentadas en la ficha del modelo.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el modelo base es responsabilidad de su autor original (Mr-Shmoo) y no se incluye informacion sobre la procedencia de los datos de entrenamiento ni sobre posibles reclamaciones de terceros.
- Las fechas de publicacion del repositorio (2 de octubre de 2026) son posteriores a la fecha habitual de referencia de los modelos de la familia Qwen, lo que conviene contrastar antes de asumir una genealogia concreta.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/sonda-1.0-4B-GGUF
- Modelo base: https://huggingface.co/Mr-Shmoo/sonda-1.0-4B
- Pagina de descarga y vision general del autor: https://hf.tst.eu/model#sonda-1.0-4B-GGUF
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Sitio de la empresa que da soporte al cuantizador: https://www.nethype.de/
