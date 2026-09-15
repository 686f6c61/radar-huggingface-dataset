# mradermacher/Hornybot-RP-Julian-GGUF

## Resumen

Hornybot-RP-Julian-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo axiomofmind/Hornybot-RP-Julian, publicado por el usuario mradermacher. El modelo base es un ajuste afinado (fine-tuning) conversacional orientado a roleplay de tematica adulta, etiquetado por su autor como perteneciente a la familia qwen3.5 y con 8.953.803.264 parametros (~8,95 mil millones) segun los pesos en safetensors del modelo original. Esta publicacion no introduce pesos nuevos: su aportacion es hacer el modelo original ejecutable en llama.cpp y compatible con el ecosistema GGUF.

La relevancia de esta ficha es practica: el repositorio ofrece un abanico completo de niveles de cuantizacion, desde Q2_K (3,9 GB) hasta f16 (18,0 GB), ademas de dos ficheros mmproj (proyector multimodal) en Q8_0 y f16. Esto permite desplegar el modelo en hardware muy distinto, desde GPU de consumo con 6-8 GB de VRAM hasta estaciones con 24 GB o mas. El repositorio ocupa 54,4 GB en total, suma de todas las variantes publicadas.

No se dispone de informacion sobre licencia, longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks, ni en la model card del cuantizador ni en los metadatos de HuggingFace. Cualquier evaluacion de idoneidad para produccion debe partir de esas carencias explicitas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El autor etiqueta el modelo como qwen3.5; no se confirma en la informacion proporcionada si es transformer denso, MoE o hibrida |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp). El modelo base se distribuye en safetensors para transformers |
| Tamano del repositorio | 54,4 GB (suma de todas las variantes) |
| Modelo base | axiomofmind/Hornybot-RP-Julian |
| Cuantizado por | mradermacher |
| Tipo de cuantizacion | Estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf). El autor indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion |
| Fecha de publicacion | 15 de septiembre de 2026 (creacion); actualizado el 15 de septiembre de 2026 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura del modelo base mas alla de la etiqueta qwen3.5 incluida en los tags del autor, de la libreria declarada (transformers) y del recuento de parametros obtenido de los pesos en safetensors. No consta el numero de capas, dimensiones ocultas, tipo de atencion, ni si emplea atencion lineal, decodificacion especulativa o cualquier otra innovacion de inferencia. Tampoco se documenta el proceso de entrenamiento: no hay datos sobre volumen de tokens, composicion del corpus, uso de RLHF, DPO u otras tecnicas de alineamiento. El unico indicio funcional es la presencia de dos ficheros mmproj (Q8_0 y f16), que en llama.cpp acompanan a modelos con proyector multimodal; esto sugiere capacidad de vision o multimodalidad, pero no se confirma en la informacion disponible.

Lo que si esta documentado es el proceso de cuantizacion. El autor aplica cuantizacion estatica sobre pesos convertidos desde HuggingFace (convert_type: hf), con cuantizacion de tensores de salida activada. Se publican nueve variantes de pesos y dos de proyector multimodal. El autor advierte explicitamente de que Q3_K_M es de calidad inferior y de que f16 (16 bits por peso) es redundante para uso practico, y enlaza un grafico comparativo de perplejidad entre tipos de cuantizacion de baja calidad elaborado por ikawrakow.

## Capacidades

- Generacion de texto conversacional orientada a roleplay y juego de rol de tematica adulta, que es el proposito declarado del modelo base.
- Conversacion multi-turno con mantenimiento de personaje, segun los tags conversational y roleplay.
- Capacidad multimodal probable: el repositorio incluye ficheros mmproj-Q8_0 y mmproj-f16, que en llama.cpp se emplean como proyector para entrada de imagenes. No confirmado en la informacion disponible.
- Idioma: ingles unicamente. No hay indicios de soporte multilingue.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible, y poco probable dado el proposito declarado del ajuste.
- Capacidades especiales (thinking mode, audio, codigo): no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local de roleplay en ingles: la variante Q4_K_S (5,5 GB) permite ejecutar el modelo en una GPU de consumo con 8 GB de VRAM o en CPU con RAM suficiente, usando llama.cpp, para sesiones de roleplay de un solo usuario sin depender de servicios en la nube.
- Prototipado de personajes conversacionales: la variante Q8_0 (9,6 GB) ofrece la mejor relacion calidad-velocidad del repositorio y sirve para validar el comportamiento de un personaje antes de integrarlo en un producto, gracias a que reproduce fielmente el modelo base.
- Investigacion sobre dialectos y registros en generacion conversacional: al ser un ajuste especializado en un dominio muy concreto, permite estudiar como se desvia la distribucion de salida respecto a un modelo generalista de ~9B y como afectan las cuantizaciones agresivas (Q2_K, Q3_K_S) a la coherencia a lo largo de turnos.
- Evaluacion comparativa de cuantizaciones: el repositorio publica siete niveles distintos del mismo modelo (de Q2_K a f16), lo que permite medir de forma controlada el impacto de la cuantizacion en perplejidad y calidad de generacion sobre exactamente los mismos pesos.
- Procesamiento por lotes en CPU: la variante Q2_K (3,9 GB) o Q3_K_S (4,4 GB) se puede ejecutar en servidores sin GPU con llama.cpp para generar grandes volumenes de dialogos sinteticos de dominio especifico.
- Entorno de pruebas multimodal: si se confirma la funcionalidad del proyector, los ficheros mmproj-Q8_0 (0,7 GB) y mmproj-f16 (1,0 GB) permitirian experimentar con entrada de imagenes combinada con generacion de texto en llama.cpp.
- Filtrado y moderacion de contenido: el modelo puede emplearse como generador adversario para producir texto adulto de forma controlada y entrenar o validar clasificadores de contenido en un entorno aislado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion de roleplay, y tampoco se proporcionan datos de perplejidad propios. El unico material de referencia es un grafico externo de comparacion de perplejidad entre tipos de cuantizacion, enlazado por el autor, que no aporta valores numericos en la informacion proporcionada.

## Requisitos de hardware

- VRAM aproximada para inferencia (solo pesos, sin cache KV ni overhead del runtime):
  - Q2_K: 3,9 GB
  - Q3_K_S: 4,4 GB
  - Q3_K_M: 4,7 GB
  - Q4_K_S: 5,5 GB
  - Q6_K: 7,5 GB
  - Q8_0: 9,6 GB
  - f16: 18,0 GB
  - Proyector multimodal adicional: 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16)
- A la cifra de pesos hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto efectiva, no documentada en la informacion disponible.
- GPU de consumo: las variantes Q2_K a Q4_K_S caben en GPUs con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060). Q6_K y Q8_0 encajan en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090). La variante f16 requiere 24 GB o mas (RTX 3090, RTX 4090) o reparto entre GPU y CPU.
- GPU de centro de datos: A100, H100 y similares ejecutan sin problema cualquier variante, incluidas f16 y Q8_0 con contextos largos.
- Ejecucion en CPU: viable con llama.cpp para todas las variantes; las de 3,9-5,5 GB son las mas razonables en equipos sin GPU dedicada.
- Opciones de despliegue: llama.cpp y cualquier frontend compatible con GGUF (Ollama, LM Studio, koboldcpp, text-generation-webui). El tag endpoints_compatible sugiere compatibilidad con endpoints gestionados, pero no se especifica cuales. Para la variante original en safetensors se usaria transformers, y potencialmente vLLM o TGI, aunque no se confirma soporte.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. La unica comparacion verificable es con el propio modelo base y con las distintas variantes del mismo repositorio.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hornybot-RP-Julian-GGUF (este) | ~8,95 mil millones | No disponible | GGUF (9 variantes) | No disponible | HuggingFace |
| axiomofmind/Hornybot-RP-Julian (base) | ~8,95 mil millones | No disponible | safetensors | No disponible | HuggingFace |
| Alternativas de la misma categoria (~8-9B, roleplay/GGUF) | No disponible | No disponible | No disponible | No disponible | No disponible |

Como referencia de categoria, los modelos abiertos de ~7-9B mas habituales para roleplay y despliegue local son los derivados de Llama, Mistral y Qwen, pero no se dispone en la informacion proporcionada de sus cifras concretas de contexto, licencia o rendimiento relativas a este modelo, por lo que no se incluyen datos que no puedan verificarse.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta disenado para roleplay de tematica adulta. No es apto para menores ni para despliegues sin filtrado ni moderacion.
- Licencia no disponible: al no especificarse la licencia ni del modelo base ni de la cuantizacion, no puede asumirse permiso para uso comercial. Es imprescindible contactar con los autores antes de cualquier explotacion comercial.
- Riesgo de alucinacion: no hay datos de evaluacion, pero cualquier modelo de ~9B ajustado para roleplay tiende a priorizar la coherencia narrativa sobre la veracidad factual. No debe usarse como fuente de informacion.
- Idioma: soporte unicamente en ingles. El rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Contexto desconocido: la longitud de contexto no esta documentada, lo que impide planificar conversaciones largas o tareas de recuperacion de informacion extensa.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K_* reducen la calidad de forma notable. El propio autor senala Q3_K_M como de calidad inferior. Para uso serio se recomienda Q4_K_S o superior.
- Ficheros multiparte: las variantes de mayor tamano pueden distribuirse en varios ficheros que deben concatenarse o cargarse conjuntamente segun las instrucciones de llama.cpp.
- Carencia de datos de evaluacion: no hay benchmarks, ni estudios de sesgo, ni evaluacion de seguridad publicados. Cualquier despliegue en produccion requiere una evaluacion propia.
- Sin senales de adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.
- Ausencia de cuantizaciones imatrix: el autor indica que no hay variantes ponderadas con imatrix, lo que limita las opciones de mayor calidad por tamano reducido.
- Posible desalineacion con el nombre del tag: la etiqueta qwen3.5 no permite confirmar la arquitectura real; conviene verificar la compatibilidad con la version de llama.cpp utilizada antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Hornybot-RP-Julian-GGUF
- Modelo base: https://huggingface.co/axiomofmind/Hornybot-RP-Julian
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Hornybot-RP-Julian-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos y FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
