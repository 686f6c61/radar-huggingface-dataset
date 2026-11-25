# mradermacher/Kahn1-Qwen2.5-3B-GGUF

## Resumen

Kahn1-Qwen2.5-3B es un modelo de 3.085.938.688 parametros derivado de Qwen2.5-3B-Instruct, ajustado por Okura66 y etiquetado en su model card con los descriptores `kahn1`, `system-one`, `jev`, `calibrated-probabilities`, `classification`, `ordinal-classification`, `entailment` y `zero-shot`. Su orientacion declarada no es la generacion de texto libre, sino la clasificacion y la clasificacion ordinal con probabilidades calibradas, lo que lo situa en la familia de modelos pequenos especializados en tareas de decision supervisada.

La version que nos ocupa, publicada por mradermacher, es una conversion a formato GGUF del modelo base original, con un conjunto de cuantizaciones estaticas que van desde Q2_K (1,4 GB) hasta f16 (6,3 GB). Esto permite ejecutar el modelo en hardware de consumo modesto mediante llama.cpp u otros motores compatibles con GGUF, algo relevante para pipelines de clasificacion a gran escala donde el coste por inferencia es un factor critico.

El modelo hereda la licencia qwen-research del Qwen2.5-3B-Instruct original, lo que condiciona su uso comercial. Su interes actual radica en la combinacion de un tamano reducido (3B), una orientacion a tareas de clasificacion con calibracion de probabilidades y una disponibilidad amplia de cuantizaciones, lo que facilita su despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, fr (segun model card) |
| Licencia | qwen-research (license: other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Okura66/Kahn1-Qwen2.5-3B, un ajuste sobre Qwen2.5-3B-Instruct. La arquitectura subyacente es la de Qwen2.5-3B-Instruct, un transformer decoder-only con atencion por grupos (GQA en las variantes mayores de la familia) y RoPE para el codificado posicional. No se dispone de informacion detallada sobre el proceso de ajuste especifico de Kahn1 (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la informacion proporcionada.

Los tags de la model card (`calibrated-probabilities`, `ordinal-classification`, `entailment`, `zero-shot`, `fast-inference`) sugieren un entrenamiento orientado a producir distribuciones de probabilidad bien calibradas para tareas de clasificacion, incluyendo clasificacion ordinal y reconocimiento de implicacion textual (entailment). La etiqueta `system-one` apunta a un modo de inferencia rapida sin cadena de razonamiento explicita, en contraposicion a los modos de "pensamiento" extendido. No se han publicado detalles adicionales sobre la innovacion tecnica del ajuste en la informacion disponible.

## Capacidades

- Clasificacion de texto con probabilidades calibradas, orientada a tareas de decision supervisada.
- Clasificacion ordinal, es decir, etiquetas con orden natural (por ejemplo, escalas de severidad o sentimiento graduado).
- Reconocimiento de implicacion textual (entailment) en modo zero-shot.
- Generacion de texto conversacional, heredada de Qwen2.5-3B-Instruct.
- Inferencia rapida en modo "system-one", sin cadena de razonamiento extendida.
- Soporte multilingue limitado a ingles y frances segun la model card.
- Compatibilidad declarada con vLLM (tag `vllm`) y con el ecosistema transformers.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes o vision en la informacion proporcionada.

## Casos de uso

- Clasificacion de tickets de soporte: el modelo puede asignar categorias y prioridades a incidencias con probabilidades calibradas, lo que permite umbrales de confianza y derivacion automatica a humanos cuando la probabilidad es baja.
- Moderacion de contenido con escalas ordinales: al soportar clasificacion ordinal, puede puntuar la gravedad de un texto en una escala ordenada (por ejemplo, de 0 a 4) en lugar de una etiqueta discreta, facilitando politicas de moderacion graduadas.
- Filtrado de candidatos en pipelines de datos: con cuantizaciones de 1,4 a 2,3 GB, puede ejecutarse en CPU o GPU de gama baja para clasificar y filtrar grandes volumenes de texto antes de pasarlos a modelos mayores.
- Deteccion de implicacion en sistemas de verificacion: el tag `entailment` sugiere uso en tareas de NLI (natural language inference) para comprobar si una afirmacion se deduce de una premisa, util en verificacion de hechos asistida.
- Enrutamiento de consultas en un sistema RAG: clasificar la intencion o el dominio de una consulta para dirigirla al recuperador o al modelo generador adecuado, aprovechando la calibracion de probabilidades para decidir cuando no enrutar.
- Analisis de sentimiento graduado en resenas: la clasificacion ordinal permite distinguir niveles intermedios de sentimiento con una unica pasada, sin necesidad de un modelo generativo mayor.
- Prototipado en entornos con recursos limitados: la cuantizacion Q4_K_M (2,0 GB) permite ejecutar el modelo en portatiles sin GPU dedicada mediante llama.cpp u Ollama, adecuado para pruebas de concepto y validacion de pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB (Q2_K), 2,0 GB (Q4_K_M), 2,6 GB (Q6_K), 3,4 GB (Q8_0) y 6,3 GB (f16), sin contar el overhead del motor de inferencia ni la cache KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput. El modelo es lo bastante pequeno para ejecutarse tambien en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada suficiente para las cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, y motores compatibles con GGUF; el modelo base declara compatibilidad con vLLM y transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kahn1-Qwen2.5-3B (este) | 3,09B | no disponible | qwen-research | GGUF, safetensors | Especializado en clasificacion calibrada y ordinal |
| Qwen2.5-3B-Instruct | 3,09B | no disponible | qwen-research | safetensors, GGUF | Modelo base generalista de instrucciones |
| Otros clasificadores de ~3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparacion cuantitativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada; el unico punto de referencia directo es el modelo base Qwen2.5-3B-Instruct, del que Kahn1 hereda arquitectura y licencia.

## Limitaciones y advertencias

- La licencia qwen-research del Qwen2.5-3B-Instruct original impone restricciones al uso comercial; es necesario revisar los terminos antes de desplegar en produccion.
- Solo se declaran ingles y frances como idiomas soportados; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Al ser un modelo ajustado para clasificacion, su calidad como generador de texto libre puede degradarse respecto al Qwen2.5-3B-Instruct original.
- Riesgo de alucinacion inherente a los modelos de 3B, especialmente en tareas generativas y en contextos largos.
- No se dispone de informacion sobre sesgos conocidos, evaluaciones de seguridad ni limites de contexto.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar la calibracion de probabilidades, que es precisamente la capacidad central del modelo; para tareas sensibles a la calibracion se recomienda Q6_K o Q8_0.
- No se han publicado datos de benchmarks que permitan validar las capacidades declaradas en la model card.
- El repo ocupa 27,9 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/Kahn1-Qwen2.5-3B-GGUF
- Modelo base: https://huggingface.co/Okura66/Kahn1-Qwen2.5-3B
- Licencia Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Kahn1-Qwen2.5-3B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
