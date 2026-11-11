# abdukuzi45/Qwen3.5-0.8B-Uncensored-Final

## Resumen

Qwen3.5-0.8B-Uncensored-Final es una variante "abliterated" (sin alineamiento de seguridad) del modelo base Qwen/Qwen3.5-0.8B, publicada por el usuario abdukuzi45 en Hugging Face. El modelo conserva la arquitectura original de Qwen3.5 con 873.438.784 parametros totales, capacidades multimodales (image-text-to-text) y el componente de Multi-Token Prediction (MTP) del modelo base. El proceso de abliteracion se aplico exclusivamente sobre las capas de texto, manteniendo intactas las capas de vision y MTP.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica concreta de eliminacion de rechazos (abliteration) con metricas declaradas de exito (92% de reduccion de rechazos) y de retencion de conocimiento (KL de 0,02-0,03 nats/token); por otro, sirve como caso de estudio de los riesgos asociados a la redistribucion de modelos sin guardarrailes bajo licencia Apache 2.0. El autor declara 200 iteraciones de optimizacion para encontrar el punto de equilibrio entre eliminar negativas y preservar coherencia.

El modelo esta etiquetado para ingles y amharico, con un tamano de repositorio de 1,8 GB en formato safetensors y compatibilidad con la libreria transformers. Su adopcion es muy baja (16 descargas, 0 likes en el momento de la consulta), lo que limita la evidencia empirica sobre su comportamiento real en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5, con componentes de vision y Multi-Token Prediction (MTP) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles), am (amharico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer multimodal de aproximadamente 0,87 mil millones de parametros con capacidad de procesar imagen y texto (pipeline image-text-to-text) e incluye un modulo de Multi-Token Prediction (MTP). Sobre esa base, el autor aplico la tecnica denominada Abliterix, que identifica y neutraliza las direcciones de activacion asociadas al comportamiento de rechazo. Segun la model card, se ejecutaron 200 pruebas de optimizacion y se selecciono la que lograba reducir las negativas a 8 de cada 100 (92% de eliminacion) manteniendo una divergencia KL de distribucion completa de aproximadamente 0,02-0,03 nats/token respecto al modelo original.

El merge final conserva los 488 tensores verificados del modelo base: las capas de texto abliteradas se fusionaron con las capas de vision y MTP originales sin modificarlas. No se especifican en la informacion disponible los datos de entrenamiento originales de Qwen3.5-0.8B (numero de tokens, composicion del corpus, uso de RLHF/DPO), ni si el proceso de abliteracion incluyo entrenamiento adicional mas alla del ajuste de pesos.

## Capacidades

- Generacion de texto conversacional en ingles y amharico.
- Procesamiento de entradas imagen-texto (image-text-to-text) heredado del modelo base.
- Razonamiento y conocimiento general preservados segun la metrica de KL declarada por el autor.
- Multi-Token Prediction (MTP) para decodificacion mas eficiente.
- Respuestas sin rechazo ante peticiones que el modelo base bloquearia (92% de reduccion de negativas declarada).
- No se documenta soporte explicito de tool calling, function calling ni modo de razonamiento extendido (thinking mode) en la informacion disponible.
- No se documenta soporte de audio.

## Casos de uso

- Investigacion sobre abliteration: el modelo sirve como referencia para estudiar como afecta la eliminacion de direcciones de rechazo a la coherencia y al conocimiento en modelos pequenos, usando la KL declarada como punto de partida para replicas.
- Generacion creativa sin filtros: escritura de ficcion con tematicas adultas o controvertidas donde el modelo base rechazaria la peticion, en entornos controlados y con revision humana posterior.
- Evaluacion de robustez de sistemas de moderacion: desplegar el modelo como generador adversarial para probar clasificadores de contenido y filtros de seguridad en pipelines propios.
- Procesamiento multimodal ligero en local: al tener menos de 1.000 millones de parametros, puede ejecutarse en GPUs de consumo para tareas de descripcion de imagenes o respuesta a preguntas sobre imagenes, siempre que se acepte la perdida de guardarrailes.
- Experimentacion con modelos pequenos en amharico: unico idioma de bajos recursos declarado junto al ingles, util para prototipos de traduccion o generacion en esa lengua.
- Docencia y divulgacion: ejemplo practico para explicar que es la abliteration, como se mide (tasa de rechazo, KL) y que riesgos introduce en la distribucion de modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta metricas internas del proceso de abliteration (92% de reduccion de rechazos, KL de 0,02-0,03 nats/token, 488 tensores preservados), no resultados en MMLU, HumanEval, GSM8K ni evaluaciones multimodales.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8-2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 3-4 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1 GB para pesos; en 4 bits, unos 0,5-0,6 GB (no se distribuyen pesos cuantizados en el repo, habria que generarlos).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650 Super, RTX 3050, RTX 4060, RTX 4090); para despliegue en servidor, A100 o H100 no son necesarias por el tamano, pero permiten mayor throughput por batching.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 4 GB o mas.
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible, y requeririan conversion a los formatos correspondientes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| abdukuzi45/Qwen3.5-0.8B-Uncensored-Final | 873.438.784 | no disponible | imagen-texto | apache-2.0 | Abliterated, sin benchmarks publicos, 16 descargas |
| Qwen/Qwen3.5-0.8B (base) | no disponible en la informacion | no disponible | imagen-texto | no disponible en la informacion | Modelo original con alineamiento de seguridad intacto |
| Otros modelos abliterated de ~1B | no disponible | no disponible | texto | variable | No se dispone de datos verificables en la informacion proporcionada |

La comparacion cuantitativa con alternativas de la misma categoria no es posible con los datos disponibles: no se han publicado benchmarks del modelo abliterated ni se dispone de las especificaciones completas del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- Eliminacion deliberada de guardarrailes: el autor declara un 92% de reduccion de rechazos, por lo que el modelo generara contenido explicito, ofensivo, violento o potencialmente ilegal si se le solicita.
- Riesgo elevado de uso indebido: no filtra peticiones ni bloquea contenido; la responsabilidad legal y etica recae integramente en el usuario.
- Sesgos: no se documentan evaluaciones de sesgo; al heredar el corpus del modelo base y eliminar los mecanismos de rechazo, es probable que los sesgos presentes se expresen con menos filtros.
- Alucinacion: no hay evaluaciones publicadas de fidelidad factual; el tamano de 0,87B limita la fiabilidad en tareas de conocimiento especializado.
- Idiomas: solo se declaran ingles y amharico; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Contexto: la longitud de contexto no esta disponible, lo que impide planificar su uso en tareas de contexto largo.
- Licencia: Apache 2.0 permite uso comercial, pero el propio autor declara cero responsabilidad por danos o consecuencias legales derivadas del uso.
- Madurez: 16 descargas y 0 likes indican ausencia de validacion comunitaria; no se recomienda su uso en produccion sin evaluacion propia.
- No se distribuyen pesos cuantizados ni se confirma compatibilidad con motores de inferencia distintos de transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdukuzi45/Qwen3.5-0.8B-Uncensored-Final
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales asociados a este modelo.
