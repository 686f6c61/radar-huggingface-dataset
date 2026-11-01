# mradermacher/Kanso-Satori-1.0-bf16-GGUF

## Resumen

Kanso-Satori-1.0-bf16-GGUF es una colección de cuantizaciones estáticas en formato GGUF, realizada por el usuario mradermacher, del modelo BuilderHelm/Kanso-Satori-1.0-bf16. El modelo base es un LLM conversacional de aproximadamente 4.000 millones de parámetros (4.022.468.096 según los safetensors del repositorio), entrenado por BuilderHelm como un adaptador LoRA orientado a tareas de dictado por voz, formateo de texto y la técnica "zenvoice", con el inglés como único idioma declarado. La licencia es Apache 2.0, con enlace de licencia que remite a Qwen/Qwen3-4B-Instruct-2507, lo que sugiere que el modelo base subyacente es de la familia Qwen3.

La relevancia de esta ficha no está tanto en el modelo original como en el formato: mradermacher publica cuantizaciones que van desde Q2_K (1,8 GB) hasta f16 (8,2 GB), lo que permite ejecutar el modelo en hardware muy modesto, desde portátiles sin GPU dedicada hasta estaciones de trabajo. Es especialmente útil para desarrolladores que quieran integrar un modelo ligero de post-edición y formateo de transcripciones de dictado en aplicaciones locales, sin depender de servicios en la nube.

Cabe destacar que se trata de cuantizaciones estáticas: en el momento de redacción no hay disponibles cuantizaciones weighted/imatrix del propio autor, aunque este indica que se pueden solicitar mediante una Community Discussion en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, presumiblemente basado en Qwen3-4B-Instruct-2507 segun la licencia referenciada) |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors bf16) |

## Arquitectura y entrenamiento

El modelo base, BuilderHelm/Kanso-Satori-1.0-bf16, es un modelo conversacional de unos 4 B de parametros distribuido en bf16, entrenado mediante un adaptador LoRA sobre un modelo base no especificado explicitamente en la model card, aunque el enlace de licencia apunta a Qwen/Qwen3-4B-Instruct-2507, lo que sugiere que se trata de un fine-tuning LoRA de ese modelo. Los tags del repositorio (kanso, mlx, zenvoice, dictation, text-formatting, lora) indican que el entrenamiento se centró en tareas de dictado por voz y formateo de texto, presumiblemente para convertir transcripciones brutas de reconocimiento de voz en texto bien formateado y puntuado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de tecnicas como RLHF o DPO. Tampoco se detalla la longitud de contexto ni la arquitectura interna concreta. La version aqui analizada es una recuantizacion estatica en GGUF realizada por mradermacher a partir de los pesos bf16 originales, sin modificar el modelo subyacente.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instruct.
- Formateo de texto: reestructuracion y puntuacion de texto sin formato.
- Dictado (dictation): post-procesado de transcripciones de voz a texto limpio, mediante la tecnica etiquetada como "zenvoice".
- Es un fine-tuning LoRA, por lo que conserva las capacidades generales del modelo base anadiendo especializacion en dictado y formateo.
- Compatible con el ecosistema GGUF: llama.cpp, Ollama, LM Studio y otras herramientas que consuman este formato.
- No disponible: no hay informacion sobre vision, audio nativo, tool calling, agentes ni capacidades multilingues (solo se declara ingles).

## Casos de uso

- Post-edicion de transcripciones de dictado: un usuario dicta texto con un motor de reconocimiento de voz y el modelo limpia la salida, anadiendo puntuacion, mayusculas y estructura, gracias a su entrenamiento especifico en tareas de dictado.
- Formateo automatico de notas de voz: integracion en una app movil que convierte notas habladas en listas, correos o documentos estructurados; con la cuantizacion Q4_K_M (2,6 GB) cabe en la mayoria de telefonos y portatiles modernos.
- Asistente conversacional local en ingles: despliegue con Ollama o llama.cpp en una maquina sin GPU para chat basico, aprovechando su tamano contenido de 4 B.
- Procesamiento por lotes de transcripciones: pipelines que normalizan grandes volumenes de texto transcrito (actas, entrevistas, subtítulos) de forma offline y privada.
- Prototipado de aplicaciones de voz-a-texto: los desarrolladores pueden probar el flujo completo STT + LLM de formateo en local sin coste de API, gracias a la licencia Apache 2.0.
- Integracion en entornos Apple Silicon: el tag "mlx" en el repositorio sugiere interes en el ecosistema MLX de Apple, util para apps nativas de macOS que procesen dictado.
- Fine-tuning adicional: al ser un LoRA sobre un modelo base conocido, otros desarrolladores pueden partir de el para especializaciones adicionales en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni del modelo base ni de las cuantizaciones.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia (segun la tabla de cuantizaciones publicada):
  - Q2_K: ~1,8 GB
  - Q3_K_M: ~2,2 GB
  - Q4_K_M: ~2,6 GB (recomendada por el autor por equilibrio velocidad/calidad)
  - Q5_K_M: ~3,0 GB
  - Q6_K: ~3,4 GB
  - Q8_0: ~4,4 GB
  - f16: ~8,2 GB
- GPU recomendadas: no es necesario usar GPU; con estas cuantizaciones el modelo funciona en CPU. Si se desea aceleracion, cualquier GPU con 4 GB de VRAM o mas (por ejemplo una RTX 3060, RTX 4060 o superior) ejecuta sin problemas hasta Q8_0.
- Consumer GPUs: cabe sobradamente en practicamente cualquier GPU consumer moderna incluso sin cuantizar agresivamente; con Q4_K_M (2,6 GB) tambien funciona en portatiles y en Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier runtime compatible con GGUF. No hay informacion sobre soporte en vLLM o TGI para estos ficheros GGUF.
- Latencia y throughput: no disponible; al ser un modelo de 4 B cuantizado, se espera interaccion fluida en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Especializacion |
|---|---|---|---|---|
| Kanso-Satori-1.0-bf16 (esta ficha) | ~4,02 B | GGUF (Q2_K a f16) | Apache 2.0 | Dictado y formateo de texto (LoRA) |
| Qwen3-4B-Instruct-2507 | ~4 B | safetensors / GGUF comunitarios | Apache 2.0 | Chat general, multiidioma |
| Llama 3.2 3B Instruct | ~3,2 B | safetensors / GGUF comunitarios | Licencia Llama 3.2 | Chat general, multiidioma |
| Phi-3.5-mini-instruct | ~3,8 B | safetensors / GGUF comunitarios | MIT | Chat general, razonamiento |

Comparado con los modelos generales de su rango de tamano, Kanso-Satori se distingue por su especializacion en dictado y formateo de texto, a costa de un soporte declarado limitado al ingles. Frente a Qwen3-4B-Instruct-2507 (su presumible modelo base), ofrece la ventaja del ajuste a tareas de voz-a-texto, pero probablemente pierde parte de la cobertura multilingue. La disponibilidad inmediata en 12 cuantizaciones GGUF lo hace muy accesible para despliegue local.

## Limitaciones y advertencias

- Idioma: el modelo declara unicamente soporte para ingles; no hay garantias de rendimiento en castellano ni en otros idiomas.
- Sesgos conocidos: no disponible; no se ha publicado informacion sobre sesgos del modelo base ni del fine-tuning.
- Riesgo de alucinacion: inherente a todo LLM; al ser un modelo de 4 B enfocado a formateo, puede alterar contenido de la transcripcion original si se usa fuera de su dominio previsto.
- Contexto: la longitud de ventana de contexto no esta documentada; hay que verificarla empiricamente antes de procesar transcripciones largas.
- Cuantizaciones bajas: las versiones Q2_K y Q3_K_S/M pueden degradar sensiblemente la calidad; el propio autor recomienda Q4_K_S/M o superiores.
- Son cuantizaciones estaticas: no hay versiones imatrix/weighted en el momento de redaccion, lo que puede suponer una ligera perdida de calidad frente a cuantizaciones ponderadas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base subyacente (Qwen3-4B-Instruct-2507, tambien Apache 2.0 segun el enlace referenciado).
- Procedencia: se trata de una cuantizacion de terceros (mradermacher) del modelo de BuilderHelm; para soporte sobre el comportamiento del modelo hay que acudir al repositorio original.

## Enlaces

- Repositorio de la cuantizacion GGUF: https://huggingface.co/mradermacher/Kanso-Satori-1.0-bf16-GGUF
- Modelo base: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-bf16
- Pagina de descargas resumida de mradermacher: https://hf.tst.eu/model#Kanso-Satori-1.0-bf16-GGUF
- Licencia referenciada (Qwen3-4B-Instruct-2507): https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher (nethype GmbH): https://www.nethype.de/
- Paper, demo y repositorio de codigo: no disponible
