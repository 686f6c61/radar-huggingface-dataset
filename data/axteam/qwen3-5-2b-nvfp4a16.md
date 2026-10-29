# axteam/Qwen3.5-2B-NVFP4A16

## Resumen

`axteam/Qwen3.5-2B-NVFP4A16` es una version cuantizada a 4 bits del modelo multimodal `Qwen/Qwen3.5-2B`, publicada por el equipo axteam. No es un modelo nuevo: es un derivado de servicio obtenido por cuantizacion post-entrenamiento (PTQ) que conserva tokenizador, `chat_template`, `generation_config` y pesos originales, y solo anade un bloque `quantization_config` al `config.json` del modelo base.

El interes tecnico esta en el esquema elegido: NVFP4A16 (W4A16), con pesos en FP4 E2M1 agrupados de 16 en 16, escala FP8 E4M3 por grupo mas una escala global FP32 por tensor, y activaciones en BF16. El resultado son aproximadamente 2,9 GB en disco para 2.213.241.664 parametros y un checkpoint cargable directamente en vLLM a traves del formato `compressed-tensors` `nvfp4-pack-quantized`.

El modelo base es un transformer denso de arquitectura hibrida (atencion lineal mas atencion completa), con torre visual y cabeza de prediccion multi-token (MTP), orientado a cargas `image-text-to-text`. La cuantizacion deja deliberadamente en BF16 la torre de vision, la cabeza MTP, todas las RMSNorm, los embeddings, el LM head y la ruta completa de atencion lineal (GatedDeltaNet/SSM), porque FP4 resulta demasiado grueso para esos pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido: atencion lineal (GatedDeltaNet/SSM) + atencion completa; multimodal con torre visual; cabeza MTP (multi-token prediction) |
| Parametros totales | 2.213.241.664 (2,21 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 E2M1 en grupos de 16, escala FP8 E4M3 por grupo + escala global FP32 por tensor; activaciones BF16; formato `compressed-tensors` `nvfp4-pack-quantized`; calibracion con 256 muestras de un corpus mixto con predominio de coreano |
| Idiomas soportados | no disponible en la model card; el modelo base se presenta publicamente como multilingue |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors con `compressed-tensors` (`nvfp4-pack-quantized`); ~2,9 GB en disco, repositorio de 3,1 GB |

## Arquitectura y entrenamiento

El modelo base combina dos mecanismos de atencion en la misma pila: capas de atencion lineal basadas en GatedDeltaNet (una formulacion de espacio de estados) y capas de atencion completa, lo que reduce el coste de memoria del cache KV en contextos largos manteniendo recuperacion exacta en las capas completas. Sobre esa columna vertebral se anade una torre visual con su proyector, lo que habilita la entrada de imagenes, y una cabeza MTP pensada para decodificacion especulativa o prediccion multi-token. El modelo es denso, no MoE, por lo que todos los parametros se activan en cada token.

El proceso de este repositorio es exclusivamente PTQ: no hay reentrenamiento ni ajuste fino, de modo que el comportamiento esperado es el del original. La calibracion uso 256 muestras de un corpus mixto con fuerte presencia de coreano; la model card menciona AWQ como tecnica de proteccion de canales salientes antes del redondeo. En cuanto a datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF/DPO), la informacion disponible no los detalla: solo se indica, en descripciones publicas de la familia Qwen3.5, un entrenamiento de fusion temprana sobre billones de tokens multimodales.

## Capacidades

- Generacion de texto conversacional multi-turno, con muestreo recomendado por el autor: `temperature=0.7`, `top_p=0.8`, `top_k=20`.
- Comprension de imagen y texto combinados (`image-text-to-text`): descripcion, respuesta a preguntas sobre imagenes y razonamiento visual, gracias a la torre visual mantenida en BF16.
- Razonamiento e instrucciones: la familia Qwen3.5 se presenta publicamente con mejoras en razonamiento y seguimiento de instrucciones respecto a Qwen3.
- Capacidades de codigo y agentes: atribuidas al modelo base en su descripcion publica; no verificadas de forma independiente para este checkpoint cuantizado.
- Cabeza MTP (multi-token prediction) conservada en BF16, util para decodificacion especulativa en el servidor de inferencia.
- Multilingue: no hay listado de idiomas en la model card; la familia base se describe como multilingue, pero no se especifica cobertura.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo "thinking" explicito, audio o cualquier otra modalidad adicional: no disponible en la informacion proporcionada.

## Casos de uso

- Preguntas y respuestas sobre imagenes en produccion: servir con `vllm serve axteam/Qwen3.5-2B-NVFP4A16` para clasificar, describir o extraer informacion de imagenes en un endpoint compatible con la API de chat, con un consumo de VRAM muy inferior al del BF16.
- Extraccion de datos de documentos escaneados: facturas, albaranes o formularios fotografados, devolviendo campos estructurados; el modelo base esta entrenado para emparejar imagen y texto, y el coste por imagen en FP4 permite procesar lotes grandes.
- Generacion de texto alternativo para CMS y portales de accesibilidad: dado que la torre visual se conserva en BF16, la calidad perceptiva no se degrada por la cuantizacion de los pesos del lenguaje, mientras el cuerpo del modelo ocupa menos memoria.
- Asistente conversacional on-premise de bajo coste: 2,9 GB de pesos encajan en una GPU Blackwell de gama consumer, lo que permite desplegar un asistente multimodal en infraestructura propia sin salida a la nube.
- Etiquetado y moderacion de contenido visual a escala: uso por lotes con vLLM para preclasificar imagenes y generar descripciones que alimenten un revisor humano o un segundo modelo mayor.
- Pruebas A/B de cuantizacion: comparar este checkpoint contra el original en BF16 con el mismo harness para medir la perdida real de fidelidad (perplejidad y acuerdo top-1) antes de adoptar FP4 en produccion.
- Prototipado de decodificacion especulativa: la cabeza MTP en BF16 permite experimentar con prediccion multi-token sin salir del mismo checkpoint.
- Despliegue en dispositivos con GPU Blackwell integrada: entornos de borde o estaciones de trabajo donde el presupuesto de memoria es el factor limitante.

## Benchmarks y rendimiento

La model card solo publica metricas de fidelidad frente al modelo original en BF16, medidas sobre un conjunto interno mixto ingles/coreano de 100 prompts, con respuestas greedy en BF16 puntuadas bajo cada build y el mismo harness para todas las filas.

| Metrica | Este modelo | Original BF16 | Diferencia |
|---|---|---|---|
| Perplejidad (menor es mejor) | 1,9269 | 1,8515 | +4,1% |
| Acuerdo top-1 del siguiente token | 89,8% | 98,9% | -9,1 puntos |

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, MMMU u otros) en la informacion disponible. Las cifras anteriores miden fidelidad al modelo base, no calidad absoluta.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados ocupan ~2,9 GB, pero hay que sumar los tensores que se conservan en BF16 (torre visual, cabeza MTP, embeddings, LM head, todas las RMSNorm y la ruta completa de atencion lineal). Estimacion razonable: 6-8 GB de VRAM para contexto corto, creciendo con el cache KV y con la resolucion de las imagenes. No hay mediciones publicadas de consumo real.
- GPU recomendadas: la familia Blackwell es el objetivo natural del formato NVFP4 (B200, GB200, RTX 5090/5080). El soporte de NVFP4 en vLLM requiere capacidad de computo 10.0 o superior; en generaciones anteriores (Ada, Hopper) esta ruta no esta soportada de forma nativa, asi que conviene verificar la compatibilidad antes de planificar el despliegue.
- Cabe en GPU consumer: si, en las Blackwell de gama alta; el limite practico lo marca la VRAM total y el peso de los tensores no cuantizados, no los pesos FP4.
- Opciones de despliegue: vLLM es la via documentada por el autor (`vllm serve axteam/Qwen3.5-2B-NVFP4A16`). El repositorio declara `transformers` como libreria, pero el formato `compressed-tensors` NVFP4 requiere kernels especificos; llama.cpp, Ollama y TGI no aparecen soportados en la informacion disponible (para Ollama existe el tag `qwen3.5:2b`, pero es otra distribucion, no este checkpoint).
- Latencia y throughput: no disponibles. Notese que mantener la ruta SSM completa en BF16 reduce el ahorro teorico de un esquema W4 puro.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `axteam/Qwen3.5-2B-NVFP4A16` (este) | 2,21 B | NVFP4A16 (W4A16, FP4), ~2,9 GB | no disponible | Apache-2.0 | HuggingFace; requiere vLLM y GPU Blackwell |
| `Qwen/Qwen3.5-2B` (original) | 2,21 B | BF16 (sin cuantizar), ~4,4 GB teoricos | no disponible | Apache-2.0 | HuggingFace; referencia de calidad |
| `axteam/Qwen3.5-2B-NVFP4` | 2,21 B | NVFP4 (variante del mismo autor) | no disponible | Apache-2.0 | HuggingFace; detalles de esquema no verificados |
| `qwen3.5:2b` en Ollama | 2,21 B | GGUF, nivel de cuantizacion no disponible | no disponible | Apache-2.0 | Ollama; pensado para llama.cpp |

La comparativa cualitativa: frente al BF16 original, este checkpoint reduce el peso de los pesos cuantizados aproximadamente a la mitad, a costa de un +4,1% de perplejidad y un 89,8% de acuerdo top-1. Frente a la distribucion GGUF de Ollama, la diferencia es de ecosistema: NVFP4A16 solo tiene sentido en servidores vLLM sobre Blackwell, mientras que GGUF prioriza portabilidad en CPU y GPU consumer de cualquier generacion.

## Limitaciones y advertencias

- Perdida de fidelidad medible: +4,1% de perplejidad y 89,8% de acuerdo top-1 frente al original BF16. En tareas sensibles a un solo token (extraccion de campos, formato estricto, matematicas) esa divergencia puede traducirse en errores concretos.
- Calibracion sesgada al coreano: las 256 muestras usadas son de un corpus mixto con predominio de coreano. El comportamiento en castellano, catalan, gallego o euskera no esta evaluado y podria degradarse mas que en la evaluacion interna.
- Dependencia de hardware: NVFP4 exige capacidad de computo 10.0 o superior en vLLM. No es un checkpoint portable a GPUs anteriores ni a CPU.
- Menos aceleracion de la esperada: la ruta de atencion lineal (GatedDeltaNet/SSM), las normas, embeddings, LM head, torre visual y cabeza MTP permanecen en BF16, de modo que la velocidad no escala como en un W4A16 completo.
- Ausencia de benchmarks de tarea: no hay MMLU, HumanEval, GSM8K ni MMMU publicados para este checkpoint; las cifras del autor miden fidelidad, no capacidad.
- Riesgo de alucinacion propio de un modelo de 2,2 B: esperable en razonamiento multi-paso, calculo y preguntas factuales; requiere validacion y, si se usa como generador de codigo, ejecucion de tests.
- Longitud de contexto e idiomas no documentados: son dos parametros criticos para produccion y no figuran en la informacion disponible; hay que medirlos contra el modelo base antes de comprometerse.
- Validacion comunitaria practicamente nula: el repositorio no registra descargas ni "likes" en el momento de la consulta, y no hay terceros independientes que hayan replicado las metricas.
- Licencia: Apache-2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de copyright y licencia, y de indicar cambios. Los pesos, tokenizador y `chat_template` originales son del equipo Qwen y sus terminos siguen aplicando.
- Model card redactada en ingles y coreano: no hay documentacion en castellano de este derivado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/Qwen3.5-2B-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Variante NVFP4 del mismo autor: https://huggingface.co/axteam/Qwen3.5-2B-NVFP4
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Repositorio GitHub de la serie Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Distribucion Ollama `qwen3.5:2b`: https://ollama.com/library/qwen3.5:2b
