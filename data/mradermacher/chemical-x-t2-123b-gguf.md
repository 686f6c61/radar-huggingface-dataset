# mradermacher/Chemical-X-t2-123b-GGUF

## Resumen

Chemical-X-t2-123b-GGUF es la distribucion en formato GGUF del modelo Chemical-X-t2-123b, un merge de modelos de 123.000 millones de parametros publicado por el usuario bruhzair y cuantizado por mradermacher, un conocido empaquetador de cuantizaciones GGUF para la comunidad. El modelo original es un merge realizado con mergekit, orientado a uso conversacional y entrenado o ajustado principalmente en ingles. Esta version GGUF existe para facilitar la inferencia local y en CPU/GPU de consumo mediante llama.cpp y derivados, algo inviable con los pesos originales en safetensors.

El interes practico de esta ficha radica en que permite ejecutar un modelo denso de gran tamano (122.610.069.504 parametros segun los safetensors del modelo base) en hardware mas modesto, a costa de perder precision. El repositorio ofrece un abanico amplio de cuantizaciones estaticas, desde Q2_K (45,3 GB) hasta Q8_0 (130,4 GB), lo que condiciona fuertemente los requisitos de VRAM/RAM. No se dispone de informacion sobre contexto, licencia, datos de entrenamiento ni benchmarks en la model card.

Se trata, por tanto, de un artefacto de conveniencia para despliegue, no de un modelo con documentacion tecnica completa. Cualquier evaluacion rigurosa deberia remitirse al modelo base original (bruhzair/Chemical-X-t2-123b) y, en su defecto, tratarse con cautela en produccion dada la ausencia de garantias documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (inferido del modelo base; no confirmado en la model card) |
| Parametros totales | 122.610.069.504 (122,6 B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |
| Tamano del repositorio | 832,2 GB |
| Herramienta de merge | mergekit |
| Compatibilidad de endpoints | endpoints_compatible |

## Arquitectura y entrenamiento

El modelo base Chemical-X-t2-123b es el resultado de un merge de modelos (tags `mergekit` y `merge` en el repositorio), no de un entrenamiento desde cero documentado. La model card del repositorio GGUF no aporta detalles sobre la receta de merge (metodo, modelos fuente, pesos), el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovacion arquitectonica especifica (atencion lineal, decodificacion especulativa, etc.).

Las cuantizaciones son estaticas y generadas con la version 2 del pipeline de cuantizacion de mradermacher (`quantize_version: 2`, `output_tensor_quantised: 1`). El autor indica que no tiene previsto publicar cuantizaciones ponderadas o con imatrix en el momento de la publicacion, aunque deja abierta la posibilidad de solicitarlas. Esto implica que las cuantizaciones IQ disponibles (IQ4_XS) no incorporan una matriz de importancia, lo que puede penalizar la calidad relativa frente a variantes imatrix de otros modelos.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational` del repositorio.
- Razonamiento y respuesta multi-turno (inferido del uso previsto como modelo de chat; no confirmado con evaluaciones).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (vision, audio, modo thinking): no disponible.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`), lo que sugiere uso mediante APIs desplegadas.

## Casos de uso

- Despliegue local de un modelo conversacional grande en ingles: gracias a las cuantizaciones Q4_K_S (69,7 GB) y Q4_K_M (73,3 GB), es posible ejecutar un modelo de 122,6 B en estaciones de trabajo con suficiente RAM o VRAM agregada, usando llama.cpp u Ollama, sin depender de la nube.
- Prototipado de asistentes de chat en ingles: el tag `conversational` y la disponibilidad de cuantizaciones ligeras (Q2_K, 45,3 GB) permiten levantar un chatbot funcional en hardware de gama alta de consumo o en servidores modestos para pruebas internas.
- Experimentacion con merges de modelos: investigadores interesados en evaluar la calidad de merges comunitarios pueden comparar el comportamiento del modelo base frente a sus fuentes originales usando estas cuantizaciones como aproximacion de bajo coste.
- Generacion de texto por lotes en CPU: las variantes Q4 y Q5, junto con llama.cpp, permiten procesar grandes volumenes de texto en servidores sin GPU dedicada, a costa de mayor latencia.
- Evaluacion comparativa de tecnicas de cuantizacion: al ofrecer desde Q2_K hasta Q8_0, el repositorio sirve para medir la degradacion de calidad y el impacto en perplexity de cada nivel de cuantizacion sobre un mismo modelo.
- Integracion en pipelines de inferencia con endpoints compatibles: el tag `endpoints_compatible` sugiere su uso detras de servidores de inferencia tipo OpenAI-compatible, util para entornos de desarrollo que ya consumen APIs estandarizadas.
- Fine-tuning ligero o adaptacion con LoRA sobre el modelo base: aunque las cuantizaciones GGUF no son directamente entrenables, sirven como referencia de inferencia tras adaptar el modelo base en safetensors y volver a cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el modelo base tampoco aporta datos en la informacion proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (tamano del archivo GGUF, sin contar overhead de contexto):
  - Q2_K: 45,3 GB
  - Q3_K_S: 52,9 GB
  - Q3_K_M: 59,2 GB
  - Q3_K_L: 64,7 GB
  - IQ4_XS: 66,1 GB
  - Q4_K_S: 69,7 GB
  - Q4_K_M: 73,3 GB
  - Q5_K_S: 84,5 GB
  - Q5_K_M: 86,6 GB
  - Q6_K: 100,7 GB
  - Q8_0: 130,4 GB
- GPU recomendadas: para Q4_K_M se necesita del orden de 73 GB de VRAM, lo que exige configuraciones multi-GPU (por ejemplo, 2x A100 40 GB, 2x H100 40 GB, o 1x H100 80 GB) o bien descarga parcial a RAM del sistema. Para Q8_0 se requieren aproximadamente 130 GB, lo que implica 2x H100 80 GB o 4x A100 40 GB.
- GPU de consumo: no cabe en una unica RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) en ninguna cuantizacion. Es posible ejecutar Q2_K o Q3_K_S repartiendo capas entre GPU y RAM del sistema (offloading) con llama.cpp, a costa de latencia elevada.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o servidores de inferencia con soporte GGUF). vLLM y TGI no soportan GGUF de forma nativa en el momento de la publicacion; para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. Dado el tamano, se espera un throughput bajo en configuraciones con offloading a CPU y aceptable solo en servidores multi-GPU con suficiente VRAM para mantener todos los pesos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Chemical-X-t2-123b-GGUF | 122,6 B | no disponible | no disponible | GGUF | Merge comunitario, solo ingles, cuantizaciones estaticas |
| Llama 3.1 70B Instruct | 70 B | 128 K | Llama 3.1 Community License | safetensors, GGUF | Referencia de la comunidad, ampliamente evaluado |
| Mistral Large 2 | 123 B | 128 K | Mistral Research License (no comercial sin acuerdo) | safetensors | Tamano comparable, documentacion y benchmarks publicos |
| Qwen2.5 72B Instruct | 72,7 B | 131 K | Apache 2.0 | safetensors, GGUF | Alternativa abierta con benchmarks publicos |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo Chemical-X-t2-123b para contrastar con estas alternativas. La diferencia principal es la ausencia de documentacion tecnica y de licencia clara en el modelo analizado.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Antes de usarlo en produccion, es imprescindible contactar con el autor o consultar el modelo base.
- Modelo solo en ingles: el campo `language` indica unicamente `en`; el rendimiento en castellano u otros idiomas es incierto.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad, lo que impide comparaciones rigurosas con alternativas conocidas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la ausencia de evaluaciones agrava la incertidumbre sobre su fiabilidad.
- Origen como merge: los merges comunitarios pueden heredar sesgos y comportamientos erraticos de los modelos fuente, y la receta no esta documentada.
- Cuantizaciones estaticas sin imatrix: las variantes IQ (IQ4_XS) no incorporan matriz de importancia, lo que puede degradar la calidad mas de lo habitual en ese rango de bits.
- Contexto desconocido: no se puede planificar el uso en tareas de contexto largo sin conocer la ventana real del modelo base.
- Tamano extremo: incluso Q2_K ocupa 45,3 GB, lo que excluye su uso en GPUs de consumo sin offloading y complica el despliegue en entornos con RAM limitada.
- Fecha de actualizacion futura: el repositorio figura actualizado en 2026-11-05, posterior a la fecha de creacion; conviene verificar el estado actual antes de descargar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Chemical-X-t2-123b-GGUF
- Modelo base: https://huggingface.co/bruhzair/Chemical-X-t2-123b
- Pagina de descargas del autor: https://hf.tst.eu/model#Chemical-X-t2-123b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplexity por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Web de nethype GmbH: https://www.nethype.de/
- Repositorio de mergekit: https://github.com/arcee-ai/mergekit
