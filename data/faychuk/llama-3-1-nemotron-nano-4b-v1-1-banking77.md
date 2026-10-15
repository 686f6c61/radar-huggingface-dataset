# faychuk/Llama-3.1-Nemotron-Nano-4B-v1.1-banking77

## Resumen

Llama-3.1-Nemotron-Nano-4B-v1.1-banking77 es un ajuste fino del modelo nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1 (4.512.746.496 parámetros, aproximadamente 4,5B) especializado en clasificación de intenciones en el dominio bancario. Lo publica el usuario faychuk en HuggingFace y se ha entrenado sobre el dataset PolyAI/banking77, que define 77 categorías de intención de cliente. El ajuste se realizó con LoRA y los adaptadores se fusionaron después en pesos independientes (`lora-merged`), por lo que el artefacto se sirve como un modelo denso estándar sin capa adicional de adaptadores.

La relevancia de esta ficha no está tanto en la arquitectura, heredada de la familia Llama 3.1, como en el enfoque de trazabilidad: el entrenamiento se ejecutó dentro de una máquina virtual confidencial Intel TDX sobre una GPU H100, cada etapa está firmada por un notario dentro del enclave y el repositorio incluye un manifiesto de linaje EQTY (`eqty.manifest.json`) que encadena datos de entrenamiento, taxonomía, ajuste LoRA, fusión y revisión publicada. Los pesos se pueden hashear contra el CID registrado en el manifiesto, de modo que cualquier mutación del modelo es detectable.

El resultado declarado por el autor es un salto de precisión en el conjunto de test de banking77: del 30,8% del modelo base al 93,0% de este ajuste. Es un modelo monolingüe en inglés, con licencia NVIDIA Open Model License, orientado a servir como clasificador de intenciones en producción y no como asistente conversacional general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.1 (modelo base: nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1); detalles internos no disponibles |
| Parametros totales | 4.512.746.496 (aproximadamente 4,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-open-model-license (categoria "other" en HuggingFace) |
| Formato de pesos | safetensors (tamano del repositorio: 9,0 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1, un transformer decoder-only de aproximadamente 4,5B parámetros (etiquetado como "Built with Llama"), sin cambios estructurales: el ajuste se hizo con LoRA y posteriormente se fusionaron los adaptadores en los pesos del modelo, generando un checkpoint denso equivalente. El repositorio incluye safetensors y etiquetas de `transformers`, `text-generation-inference` y `endpoints_compatible`, además de la tarea declarada `intent-classification`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá del uso de PolyAI/banking77, ni si se aplicaron fases de RLHF o DPO.

El elemento diferencial es el procedimiento de entrenamiento y su verificación. El ajuste se ejecutó dentro de una máquina virtual confidencial Intel TDX sobre una GPU H100, y cada etapa quedó firmada por un notario dentro del enclave. El fichero `eqty.manifest.json` actúa como manifiesto de linaje firmado que cubre la cadena completa: datos de entrenamiento y taxonomía, ajuste LoRA en entorno TEE, adaptador, fusión, pesos resultantes y la revisión concreta del repositorio. El directorio de pesos hashea al CID del modelo registrado en el manifiesto, lo que permite detectar cualquier alteración de los pesos publicados. Al servir el modelo a través del middleware de integridad EQTY, cada manifiesto por petición se encadena criptográficamente al manifiesto raíz del repositorio.

## Capacidades

- Clasificación de intenciones bancarias: el modelo se usa como clasificador puro, respondiendo con una etiqueta desnuda de entre las 77 categorías de banking77.
- Generación de texto: el pipeline declarado es `text-generation`, aunque el uso previsto en la model card es la emisión de una única etiqueta.
- Modo de razonamiento desactivado: el prompt documentado usa el mensaje de sistema `detailed thinking off`, propio de los modelos Nemotron con modo de pensamiento; el autor indica desactivarlo para clasificación directa.
- Formato de prompt de clasificador: mensaje de sistema con el modo de razonamiento desactivado, mensaje de usuario con la instrucción, las 77 etiquetas y el texto del cliente.
- Trazabilidad verificable: linaje firmado y comprobable mediante el manifiesto EQTY incluido en el repositorio.
- No se documentan capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio ni multimodalidad en la información proporcionada.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: el modelo clasifica la consulta entrante en una de las 77 intenciones de banking77 y esa etiqueta alimenta el enrutador que asigna el caso al equipo adecuado, evitando colas genéricas de atención.
- Automatización de primera línea en banca por chat: se integra detrás de un bot que primero clasifica la intención y después delega en el flujo de respuesta o en un agente humano según la categoría detectada.
- Etiquetado y anotación de históricos de conversaciones: se usa para clasificar de forma masiva conversaciones ya cerradas y construir conjuntos de datos etiquetados o métricas de motivos de contacto por periodo.
- Análisis de motivos de contacto para producto: agregando las etiquetas predichas sobre los últimos meses se obtienen informes de qué intenciones crecen (por ejemplo, disputas de cargos) y se priorizan cambios en la app o en los procesos.
- Filtrado previo en pipelines de cumplimiento: las consultas clasificadas en intenciones sensibles (disputas, fraude, cargos no reconocidos) se derivan a revisión manual obligatoria antes de cualquier respuesta automática.
- Servicio con garantías de integridad: en despliegues regulados, el middleware EQTY permite encadenar cada petición servida al manifiesto firmado del modelo, de modo que se puede demostrar ante auditoría qué pesos exactos produjeron cada clasificación.
- Evaluación comparativa de ajustes: por su naturaleza de fine-tune reproducible y con linaje, sirve como referencia en experimentos internos sobre el mismo dataset y la misma taxonomía de 77 clases.

## Benchmarks y rendimiento

| Modelo | banking77 (test accuracy) |
|---|---|
| nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1 (base) | 30,8% |
| faychuk/Llama-3.1-Nemotron-Nano-4B-v1.1-banking77 | 93,0% |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales para este ajuste. Tampoco se proporcionan métricas desagregadas por clase, matriz de confusión ni precisión/recall por intención.

## Requisitos de hardware

- Pesos en BF16/FP16: aproximadamente 9,0 GB (coincide con el tamaño del repositorio), más el espacio de caché KV para los tokens del prompt.
- Cuantización a 8 bits: del orden de 4,5-5 GB de pesos, más overhead de runtime.
- Cuantización a 4 bits: del orden de 2,3-3 GB de pesos; no se publican ficheros GGUF ni cuantizaciones precalculadas, por lo que habría que generarlas.
- GPU profesionales: H100 (la empleada en el ajuste) y A100 son suficientes con margen amplio; también L40S o A10G para despliegues de baja concurrencia.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 en BF16; en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) es viable con cuantización de 8 o 4 bits.
- Opciones de despliegue: vLLM, que es el comando documentado en la model card; también transformers, TGI (el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`) o llama.cpp/Ollama si se generan los GGUF correspondientes, que no están publicados.
- Latencia y throughput estimados: no disponible; no se aportan medidas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | banking77 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| faychuk/Llama-3.1-Nemotron-Nano-4B-v1.1-banking77 | 4,5B | no disponible | 93,0% | NVIDIA Open Model License | HuggingFace, safetensors, 0 descargas |
| nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1 (base) | 4,5B | no disponible | 30,8% | NVIDIA Open Model License | HuggingFace |
| Clasificadores encoder-only tipicos sobre banking77 (por ejemplo, variantes de BERT) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento, licencia ni especificaciones de alternativas comparables adicionales, por lo que la comparativa se limita al modelo base y a la categoría genérica de clasificadores encoder-only, sin cifras verificables.

## Limitaciones y advertencias

- Modelo monolingüe en inglés: no se declara soporte de español ni de ningún otro idioma, por lo que no es apto para banca en castellano sin un ajuste adicional.
- Dominio muy estrecho: está entrenado sobre las 77 intenciones de banking77 y no se documenta su comportamiento ante intenciones fuera de esa taxonomía, donde puede emitir etiquetas incorrectas o inventadas.
- Riesgo de alucinación en la salida: al responder con una etiqueta desnuda, no hay garantía formal de que pertenezca al conjunto de 77; en producción conviene validar la salida contra la lista de etiquetas o forzar decodificación restringida.
- Sesgos heredados: los del corpus banking77 (consultas de banca en inglés, probablemente centradas en un mercado y una distribución de usuarios concretos) y los del modelo base Llama 3.1 de NVIDIA.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de replicación independiente del 93,0% de precisión.
- Métricas incompletas: solo se publica accuracy global en test, sin desglose por clase ni análisis de errores, lo que dificulta estimar el comportamiento en las intenciones minoritarias.
- Incoherencia documental detectada: el comando de la model card apunta a `vllm serve EQTYLab/Llama-3.1-Nemotron-Nano-4B-v1.1-banking77`, mientras que el repositorio consultado es `faychuk/Llama-3.1-Nemotron-Nano-4B-v1.1-banking77`; conviene verificar cuál es el artefacto canónico antes de desplegar.
- Dependencia de infraestructura externa: la verificación de linaje requiere el manifiesto EQTY y su middleware de integridad; sin ellos, el modelo funciona pero se pierde la garantía de trazabilidad.
- Licencia: NVIDIA Open Model License, que no es una licencia de código abierto aprobada por la OSI; el uso comercial está sujeto a los términos del acuerdo de NVIDIA y debe revisarse antes de explotarlo en producción.
- Contexto desconocido: al no documentarse la longitud de contexto utilizable, no se puede planificar el envío de conversaciones largas sin probar previamente los límites reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/faychuk/Llama-3.1-Nemotron-Nano-4B-v1.1-banking77
- Modelo base: https://huggingface.co/nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1
- Dataset de ajuste: https://huggingface.co/datasets/PolyAI/banking77
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Manifiesto de linaje: fichero `eqty.manifest.json` dentro del repositorio del modelo
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las busquedas devolvieron exclusivamente contenido no relacionado (letras de canciones, listados de expresiones idiomaticas y palabras compuestas en ingles) sin ninguna vinculacion con el modelo.
