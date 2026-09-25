# darrellbest/Qwen3.5-9B-Heretic-FP8

## Resumen

Qwen3.5-9B-Heretic-FP8 es una version cuantizada a FP8 del modelo darrellbest/Qwen3.5-9B-Heretic, derivado a su vez de Qwen/Qwen3.5-9B de Alibaba. Se trata de un modelo multimodal (pipeline image-text-to-text) de 9.653.104.368 parametros, publicado por el usuario darrellbest bajo licencia Apache 2.0, que combina dos transformaciones: la eliminacion del comportamiento de rechazo mediante la tecnica Arbitrary-Rank Ablation aplicada con la herramienta Heretic, y una cuantizacion W8A8 en formato compressed-tensors para servir el modelo con vLLM.

El interes practico del checkpoint esta en la reduccion de huella de memoria sin cambiar la arquitectura: pasa de 19,34 GB en bf16 a 14,04 GB en FP8, manteniendo en precision original las partes sensibles (codificador de vision, capas Gated DeltaNet, bloque de prediccion multi-token, embeddings de 248.000 tokens y normalizaciones). Segun la model card, el autor valido la carga en vLLM 0.30.0 sobre una RTX PRO 6000 Blackwell, con descripcion correcta de imagen y 40/40 respuestas correctas en tareas aritmeticas y de palabras en modo thinking.

Es relevante ahora por dos motivos: por un lado, ofrece una via de despliegue mas barata para un modelo multimodal de ~9,6B con atencion hibrida (lineal + completa); por otro, documenta de forma medible el efecto de la ablacion de rechazos (5/100 rechazos frente a 100/100 del original, con divergencia KL de 0,0403), lo que interesa tanto a quien busca un modelo con menos restricciones como a quien investiga tecnicas de eliminacion de alineacion de seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atencion hibrida: capas de atencion completa y capas Gated DeltaNet (linear_attn), mas bloque de prediccion multi-token (MTP) y codificador de vision |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | No aplica: la informacion disponible no describe una estructura de mezcla de expertos |
| Longitud de contexto | no disponible (la model card no la declara; si menciona una tabla de embeddings de 248.000 tokens) |
| Tipos de cuantizacion | FP8 E4M3 en pesos con escalas por canal y activaciones FP8 dinamicas por token (W8A8), esquema FP8_DYNAMIC de llm-compressor 0.13.0. En repositorios hermanos de la misma familia: GGUF (BF16, Q8_0, Q4_K_M) y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (FP8); los pesos de prediccion multi-token se guardan aparte en model-auxiliary.safetensors |

## Arquitectura y entrenamiento

La model card no describe el proceso de entrenamiento (numero de tokens, composicion del dataset, fases de RLHF o DPO), por lo que esos datos no estan disponibles. Lo que si detalla es que partes del modelo se cuantizan y cuales no. Se aplica FP8 E4M3 a las capas lineales del MLP y a las proyecciones de atencion de las capas de atencion completa, con escalas por canal para los pesos y activaciones FP8 dinamicas por token (W8A8). Permanecen sin cambios, en bf16, el codificador de vision, las capas Gated DeltaNet (linear_attn), el bloque de prediccion multi-token, los embeddings (atados a lm_head) y las normalizaciones; los parametros A_log y de normalizacion de DeltaNet se mantienen en float32 como en el modelo original. El motivo declarado es que el estado recurrente de DeltaNet es sensible a la baja precision y que la tabla de embeddings de 248.000 tokens supone una fraccion grande del total en un modelo de este tamano.

La innovacion tecnica del modelo base, mas alla de la cuantizacion, es doble. Primero, la ablacion Arbitrary-Rank Ablation sobre los pesos completos, ejecutada con Heretic, que reduce los rechazos de 100/100 a 5/100 con una divergencia KL de 0,0403 respecto al modelo original: una modificacion de comportamiento medida, no estimada. Segundo, la convivencia de atencion completa con capas Gated DeltaNet de atencion lineal en la misma pila, lo que reduce el coste de secuencias largas. La cuantizacion se realizo con llm-compressor 0.13.0 y los pesos MTP, que el guardado cuantizado descarta, se copiaron intactos a model-auxiliary.safetensors. El autor advierte que los pesos FP8 no se volvieron a medir para contar rechazos, por lo que la cifra 5/100 corresponde al checkpoint bf16.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla propia de la familia Qwen3.5.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text): el codificador de vision se conserva en bf16, por lo que la capacidad visual no se ve afectada por la cuantizacion. En la validacion del autor, el modelo describio correctamente una imagen de prueba con un circulo rojo y un cuadrado azul.
- Modo thinking (razonamiento explicito). Validado con 4 problemas aritmeticos y de palabras repetidos con 10 semillas cada uno y el muestreo recomendado por Qwen: 40/40 finalizados y correctos, igual que el bf16 Heretic y que el modelo original.
- Razonamiento matematico y logico basico dentro del modo thinking, segun la validacion anterior.
- Capacidades de codigo: no se documentan resultados especificos (HumanEval, MBPP u otros) en la informacion disponible.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles; la model card no enumera idiomas.
- Inferencia de alto throughput por lotes: ~85 tok/s en flujo unico y ~2.200 tok/s agregados con lote 32 y generaciones de 512 tokens.

## Casos de uso

- Servicio de chat multimodal en produccion: el modelo acepta imagen y texto en la misma peticion y se sirve con un solo comando de vLLM (`vllm serve darrellbest/Qwen3.5-9B-Heretic-FP8`), lo que permite levantar un endpoint conversacional que responde tanto a preguntas textuales como a imagenes adjuntas.
- Reduccion del coste de memoria en despliegues ya existentes en bf16: al pasar de 19,34 GB a 14,04 GB de pesos, un servicio que hoy necesita una GPU de 24 GB con margen escaso puede liberar VRAM para cache KV o para aumentar el lote, reutilizando el mismo runtime vLLM.
- Generacion masiva de datos sinteticos: los ~2.200 tok/s agregados con lote 32 lo hacen viable para producir corpus etiquetados o pares instruccion-respuesta a gran escala en una sola GPU.
- Descripcion y analisis de imagenes en pipelines documentales: extraccion de informacion de capturas de pantalla, diagramas o fotografias, apoyandose en el codificador de vision intacto y en el modo thinking para tareas que requieren varios pasos de razonamiento sobre lo observado.
- Asistente de razonamiento para problemas matematicos y de palabras: el modo thinking con 40/40 aciertos en la validacion del autor lo hace adecuado para herramientas internas de resolucion de ejercicios o comprobacion de calculos, siempre con verificacion posterior.
- Investigacion sobre alineacion y seguridad: el par de checkpoints (original con 100/100 rechazos y Heretic con 5/100, KL 0,0403) permite estudiar que se degrada al eliminar el comportamiento de rechazo y como afecta la cuantizacion FP8 a ese comportamiento, dado que los pesos FP8 no se volvieron a medir.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir perdida de calidad de FP8 frente a bf16, GGUF Q8_0/Q4_K_M y NVFP4 sobre el mismo modelo base, con conjuntos de tareas controlados.
- Prototipado en una sola GPU para equipos pequenos: una unica tarjeta con soporte FP8 permite tener modelo, vision y decodificacion en lote sin repartir el modelo entre varios dispositivos.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las comprobaciones del autor, no benchmarks estandar. No hay resultados de MMLU, HumanEval, GSM8K ni similares.

| Metrica | Qwen3.5-9B-Heretic-FP8 | Qwen3.5-9B-Heretic (bf16) | Qwen/Qwen3.5-9B (original) |
|---|---|---|---|
| Aritmetica y problemas de palabras, modo thinking (4 problemas x 10 semillas) | 40/40 correctas | 40/40 correctas | 40/40 correctas |
| Rechazos sobre 100 prompts | no remedido en FP8 | 5/100 | 100/100 |
| Divergencia KL frente al original | no disponible | 0,0403 | referencia |
| Throughput en flujo unico | ~85 tok/s | ~57 tok/s | no disponible |
| Throughput agregado con lote 32 (generaciones de 512 tokens) | ~2.200 tok/s | ~1.550 tok/s | no disponible |
| Tamano de pesos | 14,04 GB | 19,34 GB | no disponible en la informacion disponible |
| Descripcion de imagen de prueba | correcta | no reportada | no reportada |

## Requisitos de hardware

- VRAM estimada para los pesos: 14,04 GB en FP8 W8A8 (frente a 19,34 GB en bf16). A esa cifra hay que sumar cache KV, activaciones y overhead del runtime; como estimacion, un despliegue de una sola secuencia razonable se mueve en el entorno de 17-20 GB, pero el autor no publica una cifra de VRAM total.
- GPU validadas: el autor confirma la carga en vLLM 0.30.0 sobre una NVIDIA RTX PRO 6000 Blackwell. La cuantizacion FP8 exige hardware con soporte de FP8 (generaciones Hopper y posteriores, y Ada en el caso de las lineales); no se documentan pruebas en A100, H100 ni en GPUs consumer.
- GPU consumer: los 14,04 GB de pesos dejan margen teorico en tarjetas de 24 GB (RTX 4090, RTX 5090), pero esto es una inferencia a partir del tamano y no una validacion publicada; conviene medirlo antes de comprometerlo en produccion.
- Opciones de despliegue: vLLM es el runtime objetivo y el unico validado para este repositorio (`vllm serve darrellbest/Qwen3.5-9B-Heretic-FP8`). El formato compressed-tensors no es compatible con llama.cpp ni Ollama; para esos entornos hay que usar el repositorio hermano GGUF (BF16 18,41 GB, Q8_0 9,79 GB, Q4_K_M 5,78 GB mas mmproj de vision de 0,92 GB). Para el checkpoint bf16 la model card indica compatibilidad con transformers, vLLM y SGLang.
- Latencia y throughput medidos: ~85 tok/s en flujo unico y ~2.200 tok/s agregados con lote 32 y generaciones de 512 tokens, frente a ~57 tok/s y ~1.550 tok/s del bf16 en la misma configuracion.
- Alternativa de cuantizacion: existe un NVFP4 de 11,72 GB para vLLM sobre Blackwell, que reduce aun mas la huella a costa de una precision menor.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y tamano | Runtime | Licencia | Notas |
|---|---|---|---|---|---|
| darrellbest/Qwen3.5-9B-Heretic-FP8 | ~9,65B | FP8 W8A8, 14,04 GB | vLLM | apache-2.0 | Validado en RTX PRO 6000 Blackwell con vLLM 0.30.0; ~85 tok/s en flujo unico |
| darrellbest/Qwen3.5-9B-Heretic | ~9,65B | bf16 safetensors, 19,34 GB | transformers, vLLM, SGLang | apache-2.0 | Version de referencia sobre la que se midieron los 5/100 rechazos y la KL de 0,0403 |
| darrellbest/Qwen3.5-9B-Heretic-GGUF | ~9,65B | GGUF BF16 / Q8_0 / Q4_K_M, 18,41 / 9,79 / 5,78 GB + mmproj 0,92 GB | llama.cpp, Ollama | apache-2.0 | Unica via de la familia para CPU y runtimes GGUF |
| darrellbest/Qwen3.5-9B-Heretic-NVFP4 | ~9,65B | NVFP4, 11,72 GB | vLLM sobre Blackwell | apache-2.0 | Menor huella, precision de 4 bits |
| apothic/Qwen3.5-9B-ultra-heretic-fp8 | no disponible | FP8 offline, tamano no disponible | SGLang sobre L40S | no disponible | Derivado de llmfan46/Qwen3.5-9B-ultra-heretic; es una cuantizacion FP8 offline, no una receta de cuantizacion online |
| Qwen/Qwen3.5-9B | ~9,65B | safetensors bf16 | transformers y otros | no disponible en la informacion disponible | Modelo original de Alibaba, con el comportamiento de rechazo intacto (100/100) |

No hay datos publicados de benchmarks comparativos frente a otros modelos de la misma categoria mas alla de las comprobaciones internas del autor.

## Limitaciones y advertencias

- Guardarrailes de seguridad reducidos por diseno. El propio autor lo advierte de forma explicita: el modelo responde a peticiones que el original rechaza. No debe desplegarse en entornos de cara al publico sin una capa de moderacion propia.
- La medicion de rechazos (5/100) corresponde al checkpoint bf16; los pesos FP8 no se volvieron a medir, por lo que no hay garantia de que el comportamiento tras la cuantizacion sea identico.
- La cuantizacion W8A8 introduce error numerico en MLP y proyecciones de atencion completa. Aunque el modo thinking mantuvo 40/40 aciertos en la validacion, no hay evaluacion de degradacion en generacion libre, codigo o tareas visuales complejas.
- Riesgo de alucinacion: no se publica ninguna evaluacion de veracidad, fidelidad factual ni tasa de alucinacion. Como en cualquier modelo de ~9B, la generacion de hechos concretos debe verificarse.
- Longitud de contexto no declarada. No se puede planificar un caso de uso de contexto largo sin medir antes el limite real; la cifra de 248.000 tokens que aparece en la model card se refiere al tamano de la tabla de embeddings, no a la ventana de contexto.
- Idiomas soportados no disponibles. No hay lista explicita ni evaluacion multilingue, por lo que el rendimiento fuera del ingles y el chino queda sin verificar.
- Compatibilidad de runtime limitada: al usar compressed-tensors, el modelo solo se puede servir con vLLM. No funciona en llama.cpp, Ollama ni en runtimes que no soporten este formato.
- Requiere hardware con soporte FP8. En GPUs anteriores a Hopper (por ejemplo A100 o V100) no es utilizable tal cual; habria que recurrir a la version bf16 o GGUF.
- Adopcion practica no validada: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe retroalimentacion de terceros sobre su comportamiento en produccion.
- Restricciones de licencia: el repositorio declara Apache 2.0 con enlace a la licencia de Qwen/Qwen3.5-9B, lo que en principio permite uso comercial, pero conviene revisar los terminos del modelo base de Alibaba antes de un despliegue comercial.
- El modo thinking consume mas tokens de salida, lo que afecta directamente al coste y a la latencia de los despliegues con mucho trafico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darrellbest/Qwen3.5-9B-Heretic-FP8
- Modelo base (bf16): https://huggingface.co/darrellbest/Qwen3.5-9B-Heretic
- Version GGUF de la familia: https://huggingface.co/darrellbest/Qwen3.5-9B-Heretic-GGUF
- Version NVFP4 de la familia: https://huggingface.co/darrellbest/Qwen3.5-9B-Heretic-NVFP4
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia referenciada por el autor: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Heretic (herramienta de ablacion de rechazos): https://github.com/p-e-w/heretic
- llm-compressor (cuantizacion): https://github.com/vllm-project/llm-compressor
- Repositorio oficial de la serie Qwen: https://github.com/QwenLM/Qwen3.8
- Cuantizacion FP8 alternativa con SGLang: https://huggingface.co/apothic/Qwen3.5-9B-ultra-heretic-fp8
- Ficha del GGUF Heretic en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-5-9b-heretic.html
- Ficha del Qwen3.5 9B FP8 en ThinkLLM: https://thinkllm.dev/models/qwen3-5-9b-fp8
