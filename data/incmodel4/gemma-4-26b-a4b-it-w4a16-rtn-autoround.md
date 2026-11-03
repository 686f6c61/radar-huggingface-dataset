# INCModel4/gemma-4-26B-A4B-it-W4A16-RTN-AutoRound

## Resumen

`INCModel4/gemma-4-26B-A4B-it-W4A16-RTN-AutoRound` es una version cuantizada a 4 bits del modelo multimodal `google/gemma-4-26B-A4B-it` de Google, generada por el usuario INCModel4 mediante la herramienta AutoRound de Intel. El modelo base es un transformer con arquitectura Mixture-of-Experts (MoE) de 26B parametros totales y aproximadamente 4B activos por token (de ahi el sufijo A4B), con capacidades de entrada imagen-texto y salida de texto. Esta version aplica cuantizacion W4A16 (pesos en 4 bits, activaciones en 16 bits) con group_size 32 y simetria, manteniendo en BF16 el router, los embeddings, la torre de vision y las capas de normalizacion.

La relevancia de esta ficha reside en que permite ejecutar un modelo multimodal de gran tamano en hardware mas modesto, reduciendo el peso del repositorio a 16,8 GB. El proceso de cuantizacion se realizo con 200 iteraciones de tuning y 128 muestras de calibracion, siguiendo el algoritmo de redondeo con descenso de gradiente con signo descrito en el paper de AutoRound (arXiv:2309.05516). Los resultados reportados por el autor muestran una recuperacion media del 101,35% respecto al modelo en BF16 en los benchmarks PIQA, HellaSwag, MMLU y GSM8K, lo que indica que la cuantizacion no solo preserva sino que en algunos casos mejora ligeramente las metricas.

Es importante senalar que el modelo fue creado en noviembre de 2026, no tiene descargas ni likes, y su model card es escueta: no detalla composicion del dataset de entrenamiento, idiomas soportados ni innovaciones arquitectonicas mas alla de lo inferible del modelo base. La licencia declarada es Apache 2.0, aunque la model card enlaza a la licencia especifica de Gemma 4 de Google, lo que introduce una ambiguedad legal que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal imagen-texto |
| Parametros totales | 5.243.680.206 (segun safetensors del repo cuantizado); el modelo base se denomina 26B-A4B |
| Parametros activos | Aproximadamente 4B (sufijo A4B del modelo base; no confirmado en la model card) |
| Longitud de contexto | 131.072 tokens (inferido de `max_model_len=131072` en los comandos de evaluacion) |
| Tipos de cuantizacion | W4A16, group_size 32, simetrica, 200 iteraciones de tuning, 128 muestras |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (formato auto_round para vLLM) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B-it` es un transformer con arquitectura Mixture-of-Experts que combina una torre de vision para entrada de imagenes con un decodificador de texto. La model card del modelo cuantizado no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; solo se indica que es un modelo instruct (`-it`) y que soporta entrada image-text-to-text. La innovacion tecnica destacable de esta version concreta es el proceso de cuantizacion: AutoRound aplica un redondeo de pesos guiado por gradiente con signo, optimizando los valores cuantizados para minimizar la perdida de precision. Se cuantizaron a 4 bits los expertos enrutados, el MLP compartido y la atencion, mientras que el router, los embeddings, la torre de vision y las normas se mantuvieron en BF16 para preservar la calidad de enrutamiento y las capacidades multimodales.

El comando de generacion incluido en la model card revela que se ignoraron las capas `vision_tower` y `router` durante la cuantizacion, lo que confirma que la torre de vision y el mecanismo de enrutamiento de expertos permanecen en precision completa. No se dispone de informacion sobre tecnicas como decodificacion especulativa o atencion lineal en el modelo base a partir de la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional e instruct, segun el sufijo `-it` del modelo base.
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text`, por lo que acepta imagenes y texto y genera texto.
- Razonamiento y matematicas: los benchmarks reportados incluyen GSM8K con un 94,69% en la version cuantizada, lo que evidencia capacidad de resolucion de problemas matematicos de varios pasos.
- Conocimiento general y sentido comun: evaluado en MMLU (48,08%), PIQA (73,67%) y HellaSwag (48,77%).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se listan idiomas.
- Modo thinking: los comandos de evaluacion incluyen `enable_thinking=False`, lo que sugiere que el modelo base dispone de un modo de razonamiento extenso que puede activarse.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en infraestructuras de inferencia compatibles.

## Casos de uso

- Asistencia multimodal en atencion al cliente: el modelo puede recibir capturas de pantalla, fotos de productos o documentos escaneados junto con texto y generar respuestas, gracias a su torre de vision en BF16 y su contexto de 131.072 tokens para conversaciones multi-turno con historial largo.
- Analisis de documentos e imagenes tecnicas: con 131.072 tokens de contexto puede procesar manuales extensos acompanados de diagramas y responder preguntas sobre ellos, manteniendo la torre de vision sin cuantizar para preservar la calidad de interpretacion visual.
- Generacion de codigo y resolucion de problemas matematicos: el 94,69% en GSM8K sugiere que es adecuado para asistentes de resolucion de problemas paso a paso y para tareas de razonamiento cuantitativo en entornos educativos o de analisis.
- Despliegue en hardware de gama media: al ocupar 16,8 GB en formato cuantizado W4A16, puede servirse en una sola GPU consumer de 24 GB (por ejemplo, RTX 4090) o en dos GPUs con tensor parallelism, reduciendo el coste de infraestructura frente al modelo en BF16.
- Prototipado rapido de aplicaciones vision-lenguaje: investigadores que necesiten iterar sobre pipelines image-text-to-text pueden usar esta version con vLLM 0.32.0 y el backend FLASHINFER sin necesidad de un cluster de GPUs de 80 GB.
- Evaluacion comparativa de tecnicas de cuantizacion: el modelo sirve como referencia reproducible para estudiar el impacto de W4A16 con AutoRound en modelos MoE multimodales, dado que la model card incluye los comandos exactos de generacion y evaluacion con lm_eval.
- Chatbot interno con conocimiento de imagenes: empresas que quieran desplegar un asistente que interprete capturas o fotos en un entorno controlado pueden usar esta version con licencia Apache 2.0, previa revision de la licencia de Gemma 4.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, comparando BF16 frente a W4A16:

| Benchmark | BF16 | W4A16 | Recuperacion |
|---|---:|---:|---:|
| PIQA | 72,58 | 73,67 | 101,50% |
| HellaSwag | 47,34 | 48,77 | 103,01% |
| MMLU | 46,44 | 48,08 | 103,53% |
| GSM8K | 95,30 | 94,69 | 99,36% |
| **Media** | **65,41** | **66,30** | **101,35%** |

No se han publicado en la informacion disponible resultados comparativos con otros modelos de la misma categoria ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 16,8 GB en safetensors W4A16; se necesita VRAM adicional para la cache KV, que con 131.072 tokens de contexto y `gpu_memory_utilization=0.9` puede ser considerable. Para contextos largos se recomienda al menos 24-48 GB de VRAM total.
- GPU recomendadas: los comandos de evaluacion usan `tensor_parallel_size=2`, lo que sugiere que el autor lo ejecuto en dos GPUs. Son adecuadas A100 40/80 GB, H100, L40S o dos RTX 4090.
- Cabe en GPU consumer: si, en una RTX 4090 de 24 GB para contextos moderados; para el contexto completo de 131.072 tokens probablemente se requieran dos GPUs o reducir `max_model_len`.
- Opciones de despliegue: vLLM 0.32.0 con backend FLASHINFER (recomendado en la model card). No se mencionan llama.cpp, Ollama ni TGI; el formato auto_round es especifico de vLLM.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| INCModel4/gemma-4-26B-A4B-it-W4A16-RTN-AutoRound | 5,24B en safetensors cuantizado (base 26B-A4B) | 131.072 | apache-2.0 (con enlace a licencia Gemma 4) | safetensors W4A16 | Version cuantizada, requiere vLLM 0.32.0 |
| google/gemma-4-26B-A4B-it (modelo base) | 26B-A4B | no disponible en esta ficha | licencia Gemma 4 | safetensors BF16 | Referencia de calidad; mayor VRAM |
| Otras cuantizaciones del mismo base (p. ej. GPTQ, AWQ) | 26B-A4B | no disponible | segun autor | safetensors | No disponible en la informacion proporcionada |

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada para establecer una comparativa de rendimiento cuantitativa.

## Limitaciones y advertencias

- La model card advierte explicitamente de que el modelo puede producir salidas factualmente incorrectas y no debe usarse como fuente de informacion veraz.
- Riesgo de sesgos y contenido ofensivo heredado del modelo base y de los datasets de ajuste; se recomienda realizar pruebas de seguridad antes de cualquier despliegue.
- No se especifican los idiomas soportados, por lo que el rendimiento en castellano no esta garantizado ni documentado.
- La licencia declarada es Apache 2.0, pero la model card enlaza a la licencia de Gemma 4 de Google; existe ambiguedad sobre las restricciones reales de uso comercial. La propia model card indica que la licencia no constituye asesoria legal y recomienda consultar a un abogado antes de un uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado en noviembre de 2026; no hay evidencia de validacion por parte de la comunidad.
- El formato auto_round es especifico de vLLM 0.32.0; no se garantiza compatibilidad con otras herramientas de inferencia como llama.cpp u Ollama.
- La cuantizacion W4A16 puede degradar capacidades multimodales o de razonamiento no cubiertas por los benchmarks reportados (PIQA, HellaSwag, MMLU, GSM8K); no se han evaluado tareas de vision en la model card.
- El contexto de 131.072 tokens requiere VRAM significativa para la cache KV; en GPUs consumer puede ser necesario reducirlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/INCModel4/gemma-4-26B-A4B-it-W4A16-RTN-AutoRound
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
- Repositorio AutoRound: https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
