# mradermacher/Astheral-GGUF

## Resumen

Astheral es un modelo de lenguaje de 8.030.261.312 parametros (aproximadamente 8B) publicado originalmente por el usuario SEE7 en Hugging Face, bajo una licencia Llama 3.1 y orientado a uso conversacional e instrucciones en ingles. La ficha que nos ocupa documenta la version cuantizada en formato GGUF realizada por mradermacher, un conocido empaquetador de cuantizaciones para la comunidad de inferencia local. El modelo base declara haber sido afinado mediante QLoRA sobre una arquitectura de la familia Llama, segun las etiquetas de la model card.

El interes practico de esta publicacion no reside en el modelo original, sino en la disponibilidad de pesos GGUF listos para usar con llama.cpp y derivados (Ollama, LM Studio, koboldcpp, etc.), lo que permite ejecutar un modelo de 8B en hardware de consumo. El repositorio ocupa 71,8 GB e incluye varias cuantizaciones estaticas, desde Q3_K_M hasta f16.

Se trata de un modelo con escasa traccion en la comunidad (0 descargas y 0 likes en el momento de la consulta) y con documentacion tecnica muy limitada: no se detallan datos de entrenamiento, composicion del dataset, contexto maximo ni resultados de benchmarks. Cualquier evaluacion rigurosa debe por tanto considerar estas carencias antes de adoptarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama (deducido de las etiquetas `llama` y de la licencia `llama3.1`); detalles no disponibles |
| Parametros totales | 8.030.261.312 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K, f16 (cuantizaciones estaticas; no hay imatrix/weighted disponibles) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (repo cuantizado); el modelo base SEE7/Astheral se distribuye presumiblemente en safetensors para transformers |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un modelo de la familia Llama con aproximadamente 8.000 millones de parametros y que fue afinado mediante QLoRA (etiqueta `qlora` en la model card). No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o similares. Tampoco se documentan innovaciones arquitectonicas (atencion lineal, decodificacion especulativa, mezcla de expertos, etc.).

Las cuantizaciones publicadas por mradermacher son estaticas, generadas a partir de los pesos en formato Hugging Face (`convert_type: hf`) con `quantize_version: 2` y `output_tensor_quantised: 1`, segun los metadatos comentados en el README. No se han publicado variantes con matriz de importancia (imatrix/weighted), lo que en la practica suele implicar una calidad algo inferior en los cuantos de baja precision (Q2, Q3) frente a las versiones ponderadas.

## Capacidades

- Generacion de texto conversacional e instrucciones en ingles (etiquetas `instruct` y `conversational`).
- Razonamiento general y respuesta a preguntas, en la medida esperable de un modelo de 8B afinado por QLoRA; sin datos oficiales que lo confirmen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse con llama.cpp u Ollama en un equipo de sobremesa con GPU de consumo, ofreciendo respuestas multi-turno sin depender de servicios en la nube.
- Prototipado rapido de chatbots: gracias a los cuantos Q4_K_S/Q4_K_M (4,8-5,0 GB), es posible iterar sobre prompts y flujos conversacionales en una unica GPU de 8-12 GB.
- Generacion de texto creativo y redaccion asistida: adecuado para tareas de escritura en ingles donde no se requiera precision factual estricta, con la salvedad del riesgo de alucinacion.
- Clasificacion y extraccion de informacion simple: puede emplearse para etiquetar o resumir textos cortos en pipelines por lotes ejecutados en local.
- Educacion y experimentacion: util como banco de pruebas para estudiar el efecto de distintas cuantizaciones GGUF sobre la calidad de un modelo de 8B.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en local, permite procesar texto sensible sin enviarlo a terceros, siempre que la licencia Llama 3.1 lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): aproximadamente 4,5-5,5 GB con Q3_K_M, 5-6 GB con Q4_K_S/Q4_K_M, 6-7,5 GB con Q5_K_S/Q6_K y en torno a 17-18 GB con f16.
- GPU recomendadas: cualquier GPU con 8 GB o mas para cuantos Q4 (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, RTX 4070); 12-16 GB para Q6_K o contextos largos (RTX 4070 Ti, RTX 4080, RTX 4090); A100/H100 solo si se busca throughput alto o f16.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando cuantos Q4_K_S/Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF; el modelo base puede cargarse con transformers.
- Latencia y throughput estimados: no disponibles; dependeran del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Astheral (GGUF, mradermacher) | ~8,03B | no disponible | llama3.1 | GGUF | Hugging Face, 0 descargas |
| Llama 3.1 8B Instruct | ~8B | 128K (segun documentacion oficial de Meta) | llama3.1 | safetensors, GGUF | Amplia, con ecosistema maduro |
| Mistral 7B Instruct | ~7,2B | 32K (segun documentacion oficial de Mistral) | Apache 2.0 | safetensors, GGUF | Amplia |
| Qwen2.5 7B Instruct | ~7,6B | 128K (segun documentacion oficial de Alibaba) | Apache 2.0 (variantes) | safetensors, GGUF | Amplia |

La comparacion se limita a parametros, contexto y licencia, ya que no hay datos de rendimiento publicados para Astheral. Frente a las alternativas citadas, Astheral carece de documentacion de entrenamiento y de evaluaciones, lo que dificulta justificar su eleccion salvo por motivos experimentales.

## Limitaciones y advertencias

- Documentacion tecnica practicamente inexistente: no se detallan datos de entrenamiento, contexto, ni evaluaciones, lo que impide estimar su calidad real.
- Riesgo de alucinacion: inherente a los modelos de 8B sin evaluacion publicada; no hay datos que permitan acotarlo.
- Sesgos conocidos: no documentados; al entrenarse presumiblemente sobre datos en ingles, es esperable un sesgo cultural y linguistico hacia ese idioma.
- Limitacion idiomatica: solo declara soporte de ingles; su uso en castellano no esta respaldado por la model card.
- Restricciones de licencia: la licencia Llama 3.1 impone condiciones de uso (incluida la politica de uso aceptable de Meta) y requiere atencion a los umbrales de usuarios mensuales para determinados usos comerciales.
- Traccion nula: 0 descargas y 0 likes sugieren ausencia de validacion por parte de la comunidad; conviene tratar el modelo como experimental.
- Cuantizaciones estaticas: al no haber variantes imatrix, los cuantos de baja precision pueden degradar mas la calidad de lo habitual.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Astheral-GGUF
- Modelo base: https://huggingface.co/SEE7/Astheral
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Astheral-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
