# mradermacher/Ornith1.5-9B-3MPER0RR-obliterated-GGUF

## Resumen

Ornith1.5-9B-3MPER0RR-obliterated-GGUF es una cuantizacion estatica en formato GGUF del modelo 3MPER0RR/Ornith1.5-9B-3MPER0RR-abliterated, publicada por mradermacher, un autor habitual en la comunidad de cuantizacion de modelos open source. El modelo base es un transformer denso de 8.953.803.264 parametros (aproximadamente 9B), derivado a su vez de un modelo "abliterated", es decir, con las capas de rechazo eliminadas mediante tecnicas de abliteration. Esta version "obliterated" anade una segunda pasada de ese mismo proceso.

El interes practico de esta publicacion no reside en el modelo en si, sino en el empaquetado: ofrece 13 cuantizaciones GGUF estaticas (desde Q2_K hasta f16) mas dos ficheros mmproj para el componente multimodal, lo que permite ejecutar un modelo de 9B en hardware de consumo mediante llama.cpp u Ollama. El repositorio ocupa 83 GB en total, aunque cada cuantizacion individual pesa entre 3,9 GB (Q2_K) y 18 GB (f16).

La informacion disponible sobre el modelo base es muy limitada: la model card no documenta arquitectura interna, longitud de contexto, datos de entrenamiento ni resultados de benchmarks. Se trata, por tanto, de una ficha descriptiva del artefacto de cuantizacion, con los datos verificables que el autor publica y con las lagunas explicitamente senaladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso (detalles internos no disponibles) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (numero de capas, dimension del modelo, tipo de atencion, uso de RoPE, normalizacion, etc.). Lo unico verificable es que se trata de un transformer denso de 8.953.803.264 parametros, segun los metadatos de safetensors del modelo original. El nombre "Ornith1.5-9B" sugiere una version 1.5 de una familia llamada Ornith con tamano 9B, pero no hay documentacion publica en la informacion proporcionada que confirme la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF, DPO o similar.

El rasgo tecnico definitorio es la doble aplicacion de abliteration: el modelo base ya es "abliterated" y esta version anade el sufijo "obliterated", lo que en la practica de la comunidad implica una segunda pasada de eliminacion de direcciones de rechazo en el espacio de activaciones. Este proceso no es un fine-tuning supervisado, sino una modificacion de pesos orientada a suprimir el comportamiento de negativa. El autor de la cuantizacion no documenta el metodo exacto ni las metricas de exito del proceso.

La cuantizacion se ha realizado con el pipeline habitual de mradermacher (convert_type hf, quantize_version 2, output_tensor_quantised 1) y se ofrecen tambien cuantizaciones ponderadas con imatrix en un repositorio separado (sufijo -i1-GGUF), que suelen preservar mejor la perplejidad en tamanos bajos.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Inferencia multimodal: los ficheros mmproj (Q8_0 y f16) indican soporte de entrada de imagenes, presumiblemente mediante un proyector tipo LLaVA, aunque no se detalla que encoder visual se usa.
- Ejecucion local en CPU y GPU mediante llama.cpp y derivados, al estar en formato GGUF.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que permite servir el modelo mediante APIs compatibles con OpenAI.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, modo thinking ni capacidades de audio.
- Capacidad multilingue limitada al ingles segun los metadatos; no se declaran otros idiomas.
- Al ser un modelo abliterated/obliterated, presenta una reduccion deliberada de las negativas de rechazo, lo que afecta al perfil de comportamiento en dominios sensibles.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantizacion Q4_K_M (5,7 GB) el modelo cabe en una GPU de consumo de 8 GB y permite iterar sobre prompts y flujos conversacionales sin coste de API.
- Procesamiento de imagenes en local: los ficheros mmproj habilitan entrada visual en llama.cpp, util para tareas de descripcion de imagenes o extraccion de informacion de capturas en entornos sin conexion.
- Investigacion sobre alineacion y seguridad: al ser un modelo abliterated/obliterated, sirve como objeto de estudio para medir como la eliminacion de direcciones de rechazo afecta a la utilidad, la coherencia y la tasa de respuestas daninas.
- Despliegue en hardware modesto: la cuantizacion Q2_K (3,9 GB) permite ejecutar un 9B en portatiles con 6-8 GB de RAM, adecuado para demos y pruebas de concepto.
- Generacion de texto por lotes en ingles: con Q8_0 (9,6 GB) o Q6_K (7,5 GB) se obtiene una calidad cercana al original para tareas de resumen, reescritura o clasificacion en pipelines offline.
- Fine-tuning ligero y experimentacion con LoRA: el modelo base en safetensors (no esta cuantizacion) puede servir de punto de partida, aunque para ello conviene acudir al repositorio original en lugar de a los GGUF.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 13 variantes del mismo modelo, lo que facilita estudios de degradacion de calidad frente a tamano en un rango de 3,9 a 18 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan datos de perplejidad de las cuantizaciones mas alla del grafico generico enlazado por el autor.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q2_K ~3,9 GB; Q3_K_S ~4,4 GB; Q3_K_M ~4,7 GB; Q3_K_L ~5,0 GB; IQ4_XS ~5,3 GB; Q4_K_S ~5,5 GB; Q4_K_M ~5,7 GB; Q5_K_S ~6,4 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18,0 GB. Anadir ~0,7-1,0 GB si se usa el proyector multimodal mmproj.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q5_K_M/Q6_K con margen; RTX 4090 24 GB para Q8_0 o f16 con contexto amplio; A100/H100 solo tienen sentido para servir muchas peticiones concurrentes o para el modelo en f16.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB (Q2_K/Q3_K_S) hasta una RTX 4090 (f16). Para Q4_K_M es suficiente una RTX 3060 8 GB o una RTX 4060.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI sobre llama.cpp. vLLM y TGI no son la via natural para GGUF estatico; para ellos conviene el modelo base en safetensors.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un 9B en Q4_K_M en una RTX 4090 suele superar con holgura la decena de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith1.5-9B-3MPER0RR-obliterated (esta ficha) | ~9B denso | no disponible | MIT | GGUF (13 cuantizaciones) | Base abliterated + obliterated, multimodal via mmproj |
| Modelo base 3MPER0RR/Ornith1.5-9B-3MPER0RR-abliterated | ~9B denso | no disponible | MIT | safetensors | Una sola pasada de abliteration, sin cuantizar |
| Cuantizaciones imatrix del mismo modelo (mradermacher -i1-GGUF) | ~9B denso | no disponible | MIT | GGUF | Ponderadas con imatrix, calidad superior a igual tamano |
| Gemma 2 9B (referencia de categoria) | 9B denso | 8K | Gemma license | safetensors, GGUF | Alternativa no abliterated con benchmarks publicos |

La comparacion con modelos de la misma categoria es limitada porque no hay datos de rendimiento del modelo Ornith. Frente a alternativas como Gemma 2 9B o Llama 3.1 8B, la diferencia principal es la licencia MIT pura y el proceso de abliteration, no un rendimiento documentado.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, lo que impide recomendar el modelo para produccion sin una evaluacion propia.
- Modelo abliterated/obliterated: la supresion de rechazos aumenta el riesgo de generar contenido danino, sesgado o inexacto en dominios sensibles; no es adecuado para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion no cuantificado: al no haber evaluaciones, no se puede estimar la tasa de fabricacion de hechos.
- Solo ingles declarado: no hay soporte multilingue documentado; el uso en castellano dara resultados degradados.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo (documentos extensos, conversaciones largas) sin verificacion empirica.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M degradan notablemente la coherencia; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio rapido y Q6_K/Q8_0 para maxima calidad.
- Licencia MIT: permite uso comercial sin restricciones, pero el usuario asume toda la responsabilidad legal y etica sobre las salidas del modelo.
- Repositorio de 83 GB: descargar el conjunto completo es costoso; conviene bajar solo la cuantizacion necesaria.
- Fechas de creacion y actualizacion del repositorio (2026) no verificables de forma independiente; tratar los metadatos con cautela.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/mradermacher/Ornith1.5-9B-3MPER0RR-obliterated-GGUF
- Modelo base: https://huggingface.co/3MPER0RR/Ornith1.5-9B-3MPER0RR-abliterated
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Ornith1.5-9B-3MPER0RR-obliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Ornith1.5-9B-3MPER0RR-obliterated-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
