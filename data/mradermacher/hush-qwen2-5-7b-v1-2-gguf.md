# mradermacher/Hush-Qwen2.5-7B-v1.2-GGUF

## Resumen

Hush-Qwen2.5-7B-v1.2-GGUF es la distribucion en formato GGUF del modelo Hush-Qwen2.5-7B-v1.2, un merge de modelos construido sobre la base de Qwen2.5-7B mediante la herramienta mergekit. El repositorio lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face que genera versiones GGUF listas para usar con llama.cpp y herramientas compatibles. El modelo original lo desarrolla marcuscedricridia.

El modelo cuenta con 7.612.756.480 parametros totales (aproximadamente 7,6 mil millones) y esta etiquetado como modelo conversacional de tipo merge. Al derivar de Qwen2.5-7B, hereda la arquitectura transformer decoder-only de dicha familia, aunque la model card no detalla la composicion exacta del merge ni los datos de entrenamiento. El repositorio ofrece un abanico amplio de cuantizaciones estaticas, desde Q2_K (3,1 GB) hasta f16 (15,3 GB), lo que facilita el despliegue en hardware muy diverso.

Su relevancia actual radica en que permite ejecutar localmente un modelo de 7B conversacional con multiples niveles de cuantizacion y compatibilidad con endpoints, algo practico para prototipado, experimentation en consumer GPU y despliegues de bajo coste. No obstante, la informacion publica es escasa: no hay benchmarks, no se detalla la licencia y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-7B, modelo fusionado con mergekit) |
| Parametros totales | 7.612.756.480 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un merge de modelos generado con mergekit, lo que implica que sus pesos resultan de la combinacion de los pesos de dos o mas modelos fuente, sin un entrenamiento adicional desde cero documentado. El modelo base declarado es marcuscedricridia/Hush-Qwen2.5-7B-v1.2, que a su vez parte de la familia Qwen2.5-7B, una arquitectura transformer decoder-only con atencion causal estandar. La model card no especifica la receta exacta del merge (metodo, pesos, capas afectadas) ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF o DPO.

La innovacion tecnica principal de este repositorio es la cuantizacion: mradermacher ha generado cuantizaciones estaticas (no imatrix) con la version 2 del proceso de cuantizacion, con un tensor de salida cuantizado. No se ofrecen, segun la model card, cuantizaciones ponderadas o con imatrix, aunque el autor deja abierta la posibilidad de solicitarlas. El repo ocupa 68,1 GB en total, lo que refleja la suma de todas las variantes de cuantizacion publicadas.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Razonamiento general y respuesta a instrucciones, heredado de la base Qwen2.5-7B.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que sugiere integracion con infraestructuras de inferencia tipo API.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible (Qwen2.5 lo soporta, pero el merge no lo documenta).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Prototipado local de asistentes conversacionales: con cuantizaciones Q4_K_M (4,8 GB) o Q5_K_M (5,5 GB) el modelo cabe en GPU de consumo y permite iterar rapidamente sobre prompts y flujos de dialogo sin depender de APIs externas.
- Despliegue en estaciones de trabajo sin GPU dedicada: la variante Q2_K (3,1 GB) o Q3_K_S (3,6 GB) puede ejecutarse en CPU con llama.cpp, util para entornos de desarrollo o demos offline.
- Chatbots de soporte en ingles: al ser un modelo conversacional de 7B, es adecuado para gestionar conversaciones multi-turno en ingles, aunque la ventana de contexto no esta documentada y conviene verificarla antes de usarlo en produccion.
- Evaluacion comparativa de merges: investigadores que estudian el efecto de las fusiones de modelos pueden usar este GGUF como referencia ejecutable frente al modelo base Qwen2.5-7B original.
- Generacion de texto en pipelines de bajo coste: integrable mediante llama.cpp o servidores compatibles con OpenAI (por la etiqueta endpoints_compatible) para tareas de resumen, reescritura o clasificacion en ingles.
- Experimentacion con cuantizacion: el amplio rango de variantes (de Q2_K a f16) permite medir el impacto de la cuantizacion en calidad y velocidad sobre un mismo modelo, util para calibrar compromisos en produccion.
- Educacion y formacion: sirve como ejemplo practico de merge de modelos y cuantizacion GGUF en cursos de IA open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~3,5 GB, Q3_K_M ~4,5 GB, Q4_K_M ~5,5 GB, Q5_K_M ~6,5 GB, Q6_K ~7,5 GB, Q8_0 ~9 GB, f16 ~16 GB (incluyendo overhead de contexto y KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 para cuantizaciones Q4-Q8; A100 o H100 para f16 y despliegues de alta concurrencia.
- Cabe en consumer GPU: si, en la mayoria de tarjetas con 8 GB o mas usando Q4_K_M o inferiores; en 6 GB con Q3_K_S o Q2_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con la API de OpenAI gracias a la etiqueta endpoints_compatible; vLLM y TGI no estan confirmados para este formato GGUF concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hush-Qwen2.5-7B-v1.2-GGUF | 7,6 B | No disponible | No disponible | GGUF | Merge sobre Qwen2.5-7B, solo ingles |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 (segun Qwen) | Safetensors, GGUF | Modelo base oficial, multilingue, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF | Alternativa conversacional ampliamente soportada |
| Llama-3.1-8B-Instruct | 8,0 B | 131.072 tokens | Llama 3.1 Community License | Safetensors, GGUF | Mayor contexto y ecosistema, licencia con restricciones |

La comparativa con Qwen2.5-7B-Instruct es la mas directa, ya que el merge parte de esa familia; sin embargo, no hay datos publicados que permitan afirmar si el merge mejora o degrada el rendimiento respecto al original. Las cifras de contexto y licencia de los modelos comparables provienen de su documentacion oficial, no de la informacion proporcionada para este modelo.

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide confirmar si se permite uso comercial; es imprescindible contactar con el autor o consultar el modelo base antes de usarlo en produccion.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea deficiente.
- La longitud de contexto no esta documentada; no se debe asumir la ventana de Qwen2.5 sin verificacion empirica.
- Al ser un merge sin benchmarks publicados, no hay garantia de que supere al modelo base; puede degradar capacidades como el razonamiento o el codigo.
- Riesgo de alucinacion inherente a los modelos de 7B, agravado por la falta de evaluacion publicada.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- No hay cuantizaciones imatrix o ponderadas disponibles, lo que limita la calidad en tamanos pequenos frente a otras distribuciones.
- Sesgos conocidos: no documentados, pero heredables de los datos de entrenamiento de Qwen2.5 y de los modelos fusionados.
- El repositorio tiene muy poca traccion (90 descargas, 1 like), lo que reduce la validacion comunitaria y el soporte disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Hush-Qwen2.5-7B-v1.2-GGUF
- Modelo base: https://huggingface.co/marcuscedricridia/Hush-Qwen2.5-7B-v1.2
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Hush-Qwen2.5-7B-v1.2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- mergekit: no disponible en la informacion proporcionada
- Paper de Qwen2.5: no disponible en la informacion proporcionada
