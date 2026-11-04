# mradermacher/Q2.5-MS-Mistoria-72b-v2-GGUF

## Resumen

Q2.5-MS-Mistoria-72b-v2-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo SteelStorage/Q2.5-MS-Mistoria-72b-v2, un merge de modelos de 72.706.203.648 parametros (aproximadamente 72,7 mil millones) generado con mergekit. El modelo base es un merge de tipo "model stock" o similar, orientado a conversacion y con etiqueta de idioma ingles. Esta publicacion corre a cargo de mradermacher, un conocido cuantizador de la comunidad que distribuye versiones estaticas (Q2_K a Q8_0) y versiones con imatrix en un repositorio separado.

La relevancia de esta ficha es practica: el modelo original en precision completa requiere alrededor de 145 GB en FP16, lo que lo hace inaccesible para la mayoria de entornos. Las cuantizaciones GGUF permiten ejecutarlo en estaciones de trabajo con 2-4 GPU consumer de gama alta o en servidores con una sola A100/H100 de 80 GB, segun el nivel de cuantizacion. El repositorio ocupa 520,4 GB en total porque incluye todas las variantes.

No se dispone de informacion sobre la licencia, el contexto maximo ni los datos de entrenamiento del modelo base en la informacion proporcionada; la model card del cuantizador es puramente tecnica y se limita a listar los ficheros generados y las instrucciones de uso de GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos, tecnica mergekit); detalles internos no disponibles |
| Parametros totales | 72.706.203.648 (aproximadamente 72,7 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones imatrix en repo separado |
| Idiomas soportados | Ingles (segun etiqueta `language: en`) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un merge construido con mergekit, segun las etiquetas del repositorio (`mergekit`, `merge`). No se especifica en la informacion disponible que modelos se combinaron, con que metodo de merge (SLERP, TIES, DARE, model stock, etc.) ni con que pesos. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Las cuantizaciones de mradermacher se han generado con `quantize_version: 2` y `output_tensor_quantised: 1`, y el proceso de conversion es de tipo `hf`. El autor indica que las versiones con imatrix (pesos de importancia calculados sobre un corpus) estan en un repositorio aparte y suelen ofrecer mejor calidad que las estaticas de tamano equivalente. La model card recomienda IQ4_XS o Q4_K_M como compromiso calidad/tamano y advierte que Q3_K_M es de calidad inferior.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y orientado a dialogos multi-turno.
- Razonamiento general y respuesta a instrucciones, heredado de los modelos fusionados (no se detalla cuales).
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Despliegue conversacional autoalojado: con la cuantizacion Q4_K_M (47,5 GB) el modelo cabe en una unica GPU de 80 GB o en dos GPU de 48 GB, permitiendo servir un chatbot de 72 B en infraestructura propia sin depender de APIs externas.
- Prototipado de asistentes en ingles: la variante Q4_K_S (44,0 GB) es la recomendada por el autor por velocidad y tamano, adecuada para iterar rapidamente sobre prompts y flujos conversacionales.
- Experimentacion con merges: util para investigadores que quieran evaluar la calidad de un merge de 72 B frente a los modelos originales, usando Q5_K_M o Q6_K para minimizar la perdida por cuantizacion.
- Evaluacion en hardware limitado: Q2_K (29,9 GB) permite ejecutar el modelo en una sola RTX 4090 (24 GB no alcanza; requiere 2x 24 GB o una GPU de 32-48 GB) para pruebas de concepto y comparaciones cualitativas.
- Generacion de texto de alta calidad en local: Q8_0 (77,4 GB) ofrece la mejor calidad de la familia estatica y sirve para tareas donde la fidelidad importa mas que la latencia, como redaccion asistida o resumenes largos.
- Investigacion sobre degradacion por cuantizacion: la disponibilidad de 11 variantes (de Q2_K a Q8_0) permite estudiar empiricamente el impacto de la cuantizacion en un modelo de 72 B.
- Fine-tuning ligero o evaluacion de adaptadores: el modelo base en safetensors (no esta version GGUF) seria el punto de partida; las GGUF no son adecuadas para entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero, mas overhead de contexto y KV cache):
  - Q2_K: 29,9 GB
  - Q3_K_S: 34,6 GB
  - Q3_K_M: 37,8 GB
  - Q3_K_L: 39,6 GB
  - IQ4_XS: 40,3 GB
  - Q4_K_S: 44,0 GB
  - Q4_K_M: 47,5 GB
  - Q5_K_S: 51,5 GB
  - Q5_K_M: 54,5 GB
  - Q6_K: 64,4 GB
  - Q8_0: 77,4 GB
- GPU recomendadas: H100 80 GB o A100 80 GB para Q6_K y Q8_0 en una sola tarjeta; 2x A100 40 GB o 2x RTX 4090 24 GB para Q4_K_M y Q5_K_M; para Q2_K y Q3_K_S puede bastar una GPU de 32-48 GB (A6000, L40S, RTX 6000 Ada).
- Cabe en consumer GPU: si, en configuraciones multi-GPU. Una sola RTX 4090 (24 GB) no es suficiente para ninguna variante; dos RTX 4090 (48 GB) cubren hasta Q4_K_M con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (llama-cpp-python, koboldcpp). vLLM y TGI no soportan GGUF de forma nativa para este modelo en la informacion disponible; para vLLM habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el autor marca Q4_K_S, Q4_K_M y Q8_0 como "fast" y Q6_K como "very good quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Q2.5-MS-Mistoria-72b-v2-GGUF (este) | 72,7 B | No disponible | GGUF | No disponible | Merge conversacional en ingles, 11 cuantizaciones |
| SteelStorage/Q2.5-MS-Mistoria-72b-v2 | 72,7 B | No disponible | Safetensors | No disponible | Modelo base del que derivan estas GGUF |
| Qwen2.5-72B-Instruct | 72,7 B | 128 K tokens (segun documentacion publica de Qwen) | Safetensors, GGUF | Qwen license | Alternativa directa de mismo tamano con contexto documentado |
| Llama-3.1-70B-Instruct | 70,6 B | 128 K tokens (segun documentacion publica de Meta) | Safetensors, GGUF | Llama 3.1 Community License | Alternativa de tamano similar con ecosistema amplio |

Las comparaciones con Qwen2.5-72B y Llama-3.1-70B se incluyen por categoria y tamano; no implican equivalencia de rendimiento, que no se ha publicado para este merge.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base SteelStorage/Q2.5-MS-Mistoria-72b-v2 antes de cualquier despliegue en produccion.
- Idioma: el modelo esta etiquetado solo para ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede planificar el uso con documentos largos ni estimar el coste de KV cache.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin benchmarks publicados no hay evidencia sobre su tasa de error en tareas factuales.
- Procedencia del merge: al desconocerse los modelos fusionados y el metodo, es dificil auditar sesgos, datos de entrenamiento o cumplimiento de licencias de los modelos originales.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M degradan notablemente la calidad segun las notas del propio autor; no se recomiendan para produccion.
- Repositorio muy grande (520,4 GB): descargar todas las variantes es costoso; conviene bajar solo la cuantizacion necesaria.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que la comparacion con alternativas es puramente estructural.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Q2.5-MS-Mistoria-72b-v2-GGUF
- Modelo base: https://huggingface.co/SteelStorage/Q2.5-MS-Mistoria-72b-v2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Q2.5-MS-Mistoria-72b-v2-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Q2.5-MS-Mistoria-72b-v2-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
