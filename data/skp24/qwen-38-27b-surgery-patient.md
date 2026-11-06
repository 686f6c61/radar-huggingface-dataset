# skp24/qwen-38-27b-surgery-patient

## Resumen

`skp24/qwen-38-27b-surgery-patient` es un modelo multimodal de tipo image-text-to-text derivado de `Qwen/Qwen3.8-27B`, publicado por el usuario skp24 (brian anderson) en Hugging Face. Se trata de una variante "abliterated" y "uncensored": según la model card referenciada, se han eliminado los mecanismos de rechazo mediante la tecnica de abliteration, que consiste en identificar y proyectar fuera las direcciones de activacion asociadas a negativas del modelo. El resultado es un modelo que, en teoria, responde a peticiones que el modelo base rechazaria.

El modelo cuenta con 27.781.427.952 parametros (27,8 mil millones) en formato safetensors, con un tamano de repositorio de 55,6 GB, lo que sugiere pesos en bfloat16. La arquitectura declarada es `qwen3_5`, con soporte multimodal (texto e imagen) y un pipeline de image-text-to-text. La model card heredada de huihui-ai indica que solo se han ablacionado las capas 18 a 51, manteniendo intactas las 15 primeras capas, el modulo MTP (multi-token prediction) y el codificador visual.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de 27B con capacidades multimodales y licencia Apache 2.0; por otro, advierte de que se trata de un derivado no oficial, con muy poca adopcion (130 descargas, 0 likes en el momento de la consulta) y sin benchmarks publicados, lo que lo hace inadecuado para producción sin una evaluacion propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal, image-text-to-text) |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existen versiones GGUF de terceros (mradermacher) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF via mradermacher |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.8-27B`, un transformer multimodal de la familia Qwen3.5 con soporte de entrada de imagen y texto. La model card heredada menciona un modulo MTP (multi-token prediction), habitual en la familia Qwen para decodificacion especulativa, y un componente visual ("visual") que, segun el autor, no ha sido modificado por el proceso de abliteration. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

El proceso de abliteration aplicado por huihui-ai (y del que deriva este modelo) elimina las direcciones de rechazo en las capas 18 a 51, dejando intactas las 15 primeras capas para preservar capacidades. La model card indica que se trata de una implementacion "cruda, proof-of-concept" que no usa TransformerLens. No se documenta ningun entrenamiento adicional, fine-tuning supervisado ni ajuste de preferencias sobre el modelo ablacionado; el cambio es puramente de edicion de pesos.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.8-27B.
- Procesamiento de imagenes junto con texto (pipeline image-text-to-text), con codificador visual no modificado.
- Razonamiento y respuesta a instrucciones, presumiblemente con modo "thinking" (la model card menciona el token `</think>` en el codigo de ejemplo).
- Respuestas sin rechazos ante peticiones que el modelo base declinaria, por efecto de la abliteration.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la abliteration afecta a la tasa de rechazos, la coherencia y la utilidad en tareas sensibles, comparandolo con el modelo base en un entorno controlado.
- Generacion creativa sin restricciones editoriales: escritura de ficcion, guiones o narrativa adulta donde el modelo base aplicaria filtros, con revision humana obligatoria del contenido.
- Analisis de imagenes en entornos de investigacion: al conservar el codificador visual intacto, puede usarse para descripcion de imagenes y VQA en pipelines experimentales.
- Evaluacion de robustez de filtros: equipos de seguridad pueden usar variantes abliterated como caso negativo para probar clasificadores de contenido y sistemas de moderacion.
- Prototipado de asistentes conversacionales: con 27,8B parametros y licencia Apache 2.0, sirve para prototipos internos donde la licencia permisiva es un requisito, siempre con evaluacion previa.
- Despliegue local con Ollama: la model card referencia `huihui_ai/Qwen3.8-abliterated` en Ollama y existen GGUF de terceros (mradermacher), lo que facilita pruebas en estaciones de trabajo con GPU consumer de gama alta.
- Fine-tuning posterior: al ser Apache 2.0 y estar en safetensors, puede servir como base para ajustes especificos, aunque la falta de benchmarks obliga a validar cada derivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales para este modelo ni para su base en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 55,6 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, 64-80 GB para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: en torno a 28-30 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): en torno a 15-17 GB, lo que permite ejecucion en una RTX 4090 (24 GB) o RTX 3090.
- GPU recomendadas: A100 80 GB o H100 80 GB para bfloat16 sin cuantizar; RTX 4090, RTX 3090 o L40S para cuantizaciones de 4-8 bits.
- Cabe en GPU consumer: si, en formato GGUF Q4/Q5 en GPUs de 24 GB; en bfloat16 requiere multiples GPUs o offloading a CPU.
- Opciones de despliegue: transformers (segun la model card), Ollama (`huihui_ai/Qwen3.8-abliterated`), llama.cpp via los GGUF de mradermacher. vLLM y TGI no estan confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| skp24/qwen-38-27b-surgery-patient | 27,8B | no disponible | texto + imagen | apache-2.0 | Derivado abliterated, 130 descargas, sin benchmarks |
| Qwen/Qwen3.8-27B (base) | 27B (aprox.) | no disponible | texto + imagen | no disponible en la informacion | Modelo original con filtros de rechazo |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B (aprox.) | no disponible | texto + imagen | no disponible en la informacion | Abliteration de referencia, con version en Ollama |
| mradermacher/qwen-38-27b-surgery-patient-GGUF | 27B (aprox.) | no disponible | texto + imagen | derivada del original | Cuantizaciones GGUF de este mismo modelo |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La abliteration elimina los rechazos pero no garantiza calidad: puede degradar la coherencia, aumentar la verbosidad o producir respuestas daninas sin filtro.
- Riesgo elevado de alucinacion y de contenido nocivo, sesgado o inexacto; no apto para uso directo con usuarios finales sin moderacion.
- Solo se ablacionaron las capas 18 a 51; el comportamiento en las capas iniciales y en el modulo visual puede diferir del esperado.
- No hay benchmarks ni evaluaciones de seguridad publicadas; cualquier afirmacion de rendimiento es especulativa.
- Adopcion muy baja (130 descargas, 0 likes) y autor individual sin historial verificable en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el uso de un modelo uncensored en produccion puede incumplir normativas sectoriales y de proteccion de datos; requiere revision legal.
- Idiomas y longitud de contexto no documentados; no asumir el contexto nativo del modelo base sin verificarlo.
- La model card original es de huihui-ai y el repositorio de skp24 no aporta documentacion propia sobre el proceso aplicado.
- El codigo de ejemplo de la model card esta truncado y hace referencia a la fusion de pesos LoRA, lo que sugiere que la documentacion no esta adaptada a este repositorio concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skp24/qwen-38-27b-surgery-patient
- Perfil del autor: https://huggingface.co/skp24
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Model card de referencia (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Version GGUF de terceros: https://huggingface.co/mradermacher/qwen-38-27b-surgery-patient-GGUF
- Repositorio de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Version en Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- Releases de Ollama: https://github.com/ollama/ollama/releases
