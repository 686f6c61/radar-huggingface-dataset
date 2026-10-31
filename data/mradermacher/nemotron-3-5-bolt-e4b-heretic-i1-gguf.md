# mradermacher/Nemotron-3.5-Bolt-E4B-Heretic-i1-GGUF

## Resumen

Nemotron-3.5-Bolt-E4B-Heretic-i1-GGUF es un repositorio de cuantizaciones en formato GGUF con imatrix (matriz de importancia), creado por el cuantizador mradermacher a partir del modelo grumd0/Nemotron-3.5-Bolt-E4B-Heretic. El modelo base pertenece a la familia Nemotron de NVIDIA, en su variante "Bolt" con etiqueta "gemma4", y ha sido sometido a un proceso de abliteration (mediante la técnica Heretic y la dirección de rechazo o "refusal-direction"), lo que elimina sus comportamientos de rechazo y lo hace "uncensored". Esto lo convierte en una opción relevante para desarrolladores que necesitan un modelo de unos 7.500 millones de parámetros sin filtros de seguridad incorporados, ejecutable localmente en hardware de consumo.

La relevancia de esta ficha radica en la distribución: no se trata del modelo original, sino de una colección de versiones cuantizadas (desde i1-Q2_K con 4,5 GB hasta i1-Q6_K con 6,3 GB) que permiten ajustar el equilibrio entre calidad, velocidad y consumo de memoria. El autor recomienda especialmente i1-Q4_K_M por su rapidez, y señala que los cuants IQ suelen superar a los K de tamaño equivalente. El modelo base se describe como modelo de visión, con archivos mmproj disponibles en el repositorio estático asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo Nemotron/Bolt (etiquetado "gemma4"); detalles exactos no disponibles |
| Parametros totales | 7.518.069.290 (≈7,52 B) |
| Parametros activos | no disponible (el sufijo "E4B" sugiere posible arquitectura MoE, pero no esta confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | en, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, no, pl, pt, ro, ru, sk, sl, sv, th, tr, uk, vi, zh (36 idiomas) |
| Licencia | openmdw-1.1 (licencia "other", vinculada a https://openmdw.ai/license/1-1/) |
| Formato de pesos | GGUF (cuantizado con imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base, Nemotron-3.5-Bolt-E4B-Heretic, procede de la familia Nemotron de NVIDIA. La etiqueta "gemma4" y el sufijo "E4B" sugieren una relacion con arquitecturas de parametros activos reducidos (posiblemente MoE con unos 4 mil millones de parametros activos sobre 7,5 mil millones totales), aunque ni la model card del cuantizador ni los metadatos confirman estos detalles. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO.

El rasgo diferenciador es el post-procesado de abliteration: el modificador "Heretic" hace referencia a la tecnica de abliteration Heretic, que identifica y suprime la direccion de rechazo en el espacio de activaciones del modelo, eliminando las negativas automaticas ante solicitudes sensibles sin reentrenamiento. El cuantizador mradermacher aplico cuantizacion con matriz de importancia (imatrix) sobre este modelo ya abliterado, generando 16 variantes GGUF de entre 4,5 y 6,3 GB.

## Capacidades

- Generacion de texto conversacional (el repositorio esta etiquetado como "conversational")
- Capacidades de vision: la model card indica explicitamente "This is a vision model", con archivos mmproj en el repositorio estatico
- Comportamiento sin rechazos (abliterated/uncensored): responde a solicitudes que los modelos alineados suelen denegar
- Soporte multilingue en 36 idiomas, incluido el castellano
- Compatible con el ecosistema GGUF: llama.cpp, Ollama, LM Studio y derivados
- No hay informacion disponible sobre tool calling, agentes ni razonamiento multi-paso

## Casos de uso

- Chatbots locales sin filtros: ejecucion en el ecosistema llama.cpp/Ollama para asistentes conversacionales que no deben rechazar temas legales pero sensibles (por ejemplo, discusion de seguridad ofensiva en auditorias autorizadas).
- Investigacion en alineacion: estudio comparativo del comportamiento de un modelo antes y despues de la abliteration Heretic, util para investigar la direccion de rechazo y sus efectos colaterales en la calidad.
- Analisis de imagenes en local: al tratarse de un modelo de vision con archivos mmproj, puede describir y razonar sobre imagenes en entornos sin conexion.
- Aplicaciones multilingues en escritorio: soporte de 36 idiomas permite asistentes locales en castellano y otras lenguas con hardware de consumo, dado que el quant Q4_K_M ocupa solo 5,4 GB.
- Prototipado rapido en portatiles: las variantes IQ3 (4,8 GB) permiten cargar el modelo en GPUs con 8 GB de VRAM o incluso en CPU con RAM suficiente.
- Generacion de contenido creativo sin restricciones: escritura de ficcion con tematicas maduras donde los filtros de seguridad de modelos convencionales resultan obstructivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-7 GB para los cuants mas usados (i1-Q4_K_M ocupa 5,4 GB; i1-Q6_K, 6,3 GB), mas margen para el contexto y el KV cache
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090) ejecuta comodosmente los cuants Q4 y Q5; los cuants Q3 caben en GPUs de 6-8 GB
- Consumer GPUs: si, es un objetivo claro de este repositorio; con cuant IQ3_S (4,8 GB) funciona en GPUs de 6 GB, y en CPU con 16 GB de RAM tambien es viable
- Despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF; no es un GGUF orientado a vLLM o TGI, que requieren pesos safetensors
- Latencia y throughput: no disponibles; al ser un modelo de ~7,5 B con cuant Q4, se esperan velocidades tipicas de este rango de tamano en llama.cpp (decenas de tokens/s en GPU consumer moderna), pero no hay medidas publicadas

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-Heretic-i1-GGUF | 7,52 B | GGUF (imatrix) | openmdw-1.1 | Abliterado (Heretic), vision |
| Qwen3 8B (cuants GGUF) | 8,2 B | GGUF/safetensors | Apache 2.0 | Modelo alineado estandar, sin abliteration |
| Llama 3.1 8B (cuants GGUF) | 8,0 B | GGUF/safetensors | Llama 3.1 Community License | Amplio ecosistema, con filtros de alineacion |
| Mistral 7B Instruct v0.3 | 7,2 B | GGUF/safetensors | Apache 2.0 | Sin abliteration pero historicamente permisivo |

Datos de rendimiento comparativo no disponibles; la eleccion entre estos modelos dependera de la necesidad de comportamiento uncensored y de vision frente a ecosistema y licencias mas asentadas.

## Limitaciones y advertencias

- La abliteration elimina los rechazos de seguridad: el modelo respondera a solicitudes daninas sin oposicion, por lo que su despliegue exige controles externos y responsabilidad legal del operador
- La abliteration suele degradar la calidad general del modelo (perdida de coherencia o capacidad) respecto al modelo original alineado; no hay metricas publicadas de esa degradacion para esta variante
- Riesgo de alucinacion: no disponible de forma especifica, pero debe asumirse el riesgo habitual de modelos de este tamano
- La longitud de contexto no esta documentada en el repositorio; verificarla en la config del modelo base antes de planificar aplicaciones con documentos largos
- Licencia openmdw-1.1 ("other"): revisar el texto en https://openmdw.ai/license/1-1/ antes de uso comercial, ya que no es una licencia permisiva estandar como Apache 2.0 o MIT
- El cuantizador (mradermacher) no es el autor del modelo base; cualquier problema de calidad del modelo subyacente no se resuelve con la cuantizacion
- Los cuants de calidad muy baja (Q2_K, Q4_0) tienen perdida notable; el propio autor desaconseja algunos en favor de alternativas IQ
- El soporte de vision requiere los archivos mmproj del repositorio estatico, no incluidos en este repo de imatrix

## Enlaces

- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/Nemotron-3.5-Bolt-E4B-Heretic-i1-GGUF
- Modelo base abliterado: https://huggingface.co/grumd0/Nemotron-3.5-Bolt-E4B-Heretic
- Repositorio de cuants estaticos (con mmproj): https://huggingface.co/mradermacher/Nemotron-3.5-Bolt-E4B-Heretic-GGUF
- Pagina de descargas resumida: https://hf.tst.eu/model#Nemotron-3.5-Bolt-E4B-Heretic-i1-GGUF
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
