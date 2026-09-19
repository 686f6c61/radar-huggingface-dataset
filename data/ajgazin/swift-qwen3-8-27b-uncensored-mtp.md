# ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP

## Resumen

Swift-Qwen3.8-27B-Uncensored-MTP es un ajuste fino derivado del modelo Swift-Qwen3.8-27B de UkisAI, que a su vez es un fine-tune orientado a eficiencia de razonamiento de Qwen3.8-27B de Alibaba Qwen. Sobre esos pesos, el autor (ajgazin) aplica una ablación de la dirección de rechazo ("abliteration") siguiendo el metodo de Arditi et al. 2024, con la direccion calculada originalmente para orcarouter/Qwen3.8-27B-Uncensored. El resultado es un modelo de 27.781.427.952 parametros (unos 27,78 mil millones) que responde a peticiones que el modelo original rechaza, manteniendo intactos la torre de vision y la cabeza MTP.

La relevancia tecnica del modelo esta en dos puntos. Primero, la edicion no se aplica copiando diferencias de pesos, sino recuperando la direccion de rechazo r a partir de la diferencia entre orcarouter/Qwen3.8-27B-Uncensored y Qwen3.8-27B, y proyectandola despues fuera de las matrices de Swift; la recuperacion reproduce 131 tensores de orcarouter con un 99,75% de elementos identicos bit a bit. Segundo, a diferencia de muchas ablaciones, se conserva y edita de forma coherente la cabeza MTP (multi-token prediction), lo que permite decodificacion especulativa autoasistida y, por tanto, un despliegue con menor latencia sin modelo draft externo.

El modelo se publica en safetensors BF16 completos, con cuantizaciones GGUF (dinamicas de Unsloth, de Q2 a Q8) y NVFP4 para vLLM y SGLang. La licencia es la Swift Open License v1.0, gratuita para uso individual y organizaciones de hasta 1.000.000 USD de ingresos recurrentes anuales. La model card declara explicitamente que no se han evaluado los benchmarks generales, el comportamiento de rechazo en modo thinking ni la tasa de aceptacion del MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido derivado de Qwen3.8-27B: 16 capas de atencion completa, 48 capas Gated DeltaNet (atencion lineal), 64 capas MLP, torre de vision y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | 262.144 tokens en el ejemplo de despliegue de la model card (`--max-model-len 262144`); no se declara un maximo oficial distinto |
| Tipos de cuantizacion | BF16 (pesos completos), GGUF dinamicos de Unsloth de Q2 a Q8 (llama.cpp), NVFP4 (vLLM, SGLang) |
| Idiomas soportados | No disponible |
| Licencia | swift-open-license-1.0 (campo `license: other`); Apache 2.0 en los modelos subyacentes Qwen3.8-27B y orcarouter/Qwen3.8-27B-Uncensored |
| Formato de pesos | safetensors (BF16), GGUF, NVFP4 |
| Tamano del repositorio | 55,6 GB |
| Descargas / likes | 174 descargas, 10 likes |
| Pipeline declarado | image-text-to-text |
| Tensores | 1199 tensores, todos presentes |

## Arquitectura y entrenamiento

La arquitectura es la de Swift-Qwen3.8-27B, sin cambios de estructura: tokenizer, plantilla de chat y disposicion de capas son identicas a las de Qwen3.8-27B. Se trata de un modelo hibrido con 16 capas de atencion completa mas la cabeza MTP, 48 capas con `linear_attn.out_proj` (Gated DeltaNet, es decir, atencion lineal) y 64 capas con `mlp.down_proj`, ademas de una torre de vision que esta edicion no toca. La cabeza MTP se conserva y se edita de forma consistente con el resto, lo que habilita decodificacion especulativa autoasistida.

El entrenamiento del modelo subyacente no se detalla en la informacion proporcionada: no hay numero de tokens, composicion del dataset ni datos sobre RLHF o DPO. Lo que si se documenta es el procedimiento de abliteration. Se parte de una unica direccion de rechazo r definida como la diferencia media, enmascarada por massive activations, entre residuales de ultimo token de prompts daninos (AdvBench) y benignos (Alpaca) en la capa 38, ortogonalizada fuera de todas las matrices que escriben en el residual, con calculo en float32. La direccion se recupera como el primer vector propio de la suma de matrices de Gram de las diferencias entre orcarouter y Qwen3.8-27B, refinada con un ajuste por minimos cuadrados por coordenada; el coseno por tensor con r es de al menos 0,9999 y la escala ajustada es 0,999. Se editan 131 tensores en float32 y se almacenan en BF16: 17 `self_attn.o_proj` (16 capas de atencion completa mas MTP), 48 `linear_attn.out_proj`, 65 `mlp.down_proj` (64 capas mas MTP) y 1 `embed_tokens`, con las formulas W' = W - r(rᵀW) y E' = E - (Er)rᵀ. Cinco dimensiones ocultas (las de massive activation enmascaradas) nunca se editan porque son exactamente cero en r. El fine-tune de Swift habia cambiado 256 tensores, 80 de ellos dentro del conjunto editado; al proyectar r en lugar de sumar la diferencia de orcarouter, esos cambios quedan proyectados tambien. Las direcciones de rechazo calculadas del mismo modo para Swift y para Qwen3.8-27B tienen un coseno de 0,99995, lo que indica que el fine-tune no movio la direccion. El repositorio incluye `abliteration/r.pt`, `recover.json`, `orca_tools.py`, `orca.sh` y `abliteration.json` con la lista de tensores editados y el hash de r.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat de Qwen/Swift.
- Razonamiento con modo thinking, soportado por el parser `qwen3` de vLLM, con la particularidad de que el fine-tune Swift esta orientado a trazas de razonamiento mas cortas.
- Procesamiento de imagen y texto (`image-text-to-text`), con la torre de vision intacta respecto al modelo base.
- Tool calling y function calling: la model card documenta `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`, lo que indica soporte de llamadas a herramientas compatible con el parser de Qwen Coder.
- Uso en agentes y razonamiento multi-paso, apoyado en el soporte de tool calling y en la ventana de contexto larga.
- Decodificacion especulativa autoasistida mediante la cabeza MTP conservada: en vLLM con `{"method":"mtp","num_speculative_tokens":3}` y en SGLang con `EAGLE`, `--speculative-num-steps 3`, `--speculative-eagle-topk 1`, `--speculative-num-draft-tokens 4`.
- Comportamiento sin rechazo: la ablacion reduce las negativas del modelo original en la evaluacion publicada, lo que permite respuestas a peticiones que el modelo base declina.
- Capacidades multilingues: no disponible (no se declaran idiomas soportados).
- Parametros de muestreo recomendados: temperature 1.0, top_p 0.95, top_k 20, min_p 0.

## Casos de uso

- Atencion al cliente automatizada: con una ventana de hasta 262.144 tokens, el modelo puede mantener el historial completo de una conversacion multi-turno, adjuntar capturas o documentos escaneados (entrada de imagen y texto) y responder sin truncar el contexto.
- Extraccion de datos de documentos escaneados: al conservar la torre de vision, permite procesar facturas, formularios o capturas y devolver campos estructurados, integrándose en un pipeline de ingesta documental.
- Generacion de codigo en produccion: el soporte de tool calling con parser `qwen3_coder` permite conectarlo a ejecutores de tests, linters o APIs de repositorio dentro de flujos de integracion continua y agentes de reparacion de codigo.
- Agentes autonomos multi-paso: la combinacion de contexto largo, tool calling y modo thinking encaja en tareas de investigacion con varias herramientas encadenadas, como consulta a bases de datos seguidas de sintesis de resultados.
- Analisis de repositorios y bases de codigo extensas: la ventana de contexto larga permite cargar conjuntos de ficheros y hacer preguntas transversales sobre dependencias, sin necesidad de recuperacion fragmentada.
- Despliegue local en estaciones de trabajo: con el GGUF dinamico publicado, puede ejecutarse con llama.cpp en una GPU de 24 GB de VRAM, lo que habilita asistentes privados sobre datos que no pueden salir de la organizacion.
- Servicio de inferencia de baja latencia: la cabeza MTP permite decodificacion especulativa autoasistida en vLLM o SGLang, reduciendo el coste por token sin necesidad de alojar un modelo draft separado.
- Investigacion en seguridad y alineacion: el repositorio incluye la direccion r, el informe de recuperacion y los scripts, lo que permite reproducir, auditar o comparar el efecto de la ablacion sobre los pesos de un fine-tune distinto del original.
- Red-teaming y evaluacion de riesgos: disponer de una variante sin rechazo documentada permite estudiar comportamientos del modelo base que de otro modo quedan ocultos tras las negativas, en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. La model card indica explicitamente que no se han evaluado los benchmarks generales, el comportamiento de rechazo en modo thinking, la supervivencia de las trazas de razonamiento cortas de Swift ni la tasa de aceptacion del MTP.

Los unicos datos publicados son las mediciones de rechazo y divergencia KL realizadas por el autor con la evaluacion integrada de Heretic (`evaluate_model`, BF16):

| Modelo | Rechazos | Divergencia KL |
|---|---|---|
| Swift-Qwen3.8-27B-Uncensored-MTP (frente a Swift) | 15/100 | 0,0634 |
| Swift-Qwen3.8-27B | 98/100 | 0 |
| orcarouter/Qwen3.8-27B-Uncensored (frente a Qwen3.8-27B), referencia | 17/100 | 0,0621 |
| Qwen3.8-27B, referencia | 98/100 | 0 |

Condiciones de la medicion, segun la model card: 100 prompts de `mlabonne/harmful_behaviors` con decodificacion greedy y hasta 100 tokens para el conteo de rechazos, detector de rechazo por palabras clave de Heretic; la divergencia KL se calcula sobre las distribuciones del primer token en 100 prompts de `mlabonne/harmless_alpaca` frente al modelo original. El thinking se cierra inmediatamente con el prefijo `"\n</think>\n\n"` para que se puntuen respuestas y no razonamiento. El propio autor advierte que los conteos de rechazo dependen del montaje de evaluacion y no son comparables entre model cards.

## Requisitos de hardware

- VRAM en BF16: los pesos ocupan unos 55,6 GB (tamano del repositorio). Con cache KV y overhead de runtime, es razonable reservar 64-80 GB.
- GPU recomendadas para BF16: A100 80 GB o H100 80 GB en una sola GPU; en configuraciones de menor memoria, tensor parallelism sobre varias GPU (por ejemplo, 2 x RTX 4090 de 24 GB o 2 x A6000 de 48 GB).
- Cuantizacion GGUF: los pesos dinamicos de Unsloth permiten desde aproximadamente 10 GB en Q2 hasta unos 30 GB en Q8 (estimacion a partir del numero de parametros). En Q4, el modelo cabe en una RTX 4090 o RTX 3090 de 24 GB; en Q8 requiere tarjetas de 48 GB o reparto entre varias GPU.
- NVFP4: la cuantizacion de 4 bits para vLLM y SGLang reduce los pesos a aproximadamente 14 GB, lo que la hace apta para hardware Blackwell; no se dispone de cifras oficiales de consumo.
- Despliegue: transformers (`AutoModelForImageTextToText` con `torch_dtype=torch.bfloat16` y `device_map="auto"`), vLLM, SGLang y llama.cpp. Al publicarse un GGUF, es desplegable tambien con herramientas basadas en llama.cpp como Ollama o LM Studio, aunque no se documenta soporte oficial.
- Decodificacion especulativa: configurable en vLLM con `mtp` y 3 tokens especulativos, o en SGLang con el algoritmo EAGLE; el modelo no necesita un draft separado.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tasa de aceptacion del MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (medicion del autor) | KL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Swift-Qwen3.8-27B-Uncensored-MTP | 27,78 mil millones | 262.144 tokens en el ejemplo de despliegue | 15/100 | 0,0634 | swift-open-license-1.0 | safetensors BF16, GGUF, NVFP4 |
| Swift-Qwen3.8-27B | No disponible | No disponible | 98/100 | 0 | swift-open-license-1.0 | Modelo base en HuggingFace |
| orcarouter/Qwen3.8-27B-Uncensored | No disponible | No disponible | 17/100 | 0,0621 | Apache 2.0 | Pesos publicados; el autor indica que carece de cabeza MTP editada |
| Qwen3.8-27B | No disponible | No disponible | 98/100 | 0 | Apache 2.0 | Modelo original de Alibaba Qwen |

La diferencia funcional mas relevante frente a orcarouter/Qwen3.8-27B-Uncensored es que este modelo parte del fine-tune de Swift (orientado a eficiencia de razonamiento) y conserva la cabeza MTP para decodificacion especulativa; el nivel de rechazo medido es ligeramente inferior (15/100 frente a 17/100) con una divergencia KL practicamente identica (0,0634 frente a 0,0621). No se dispone de comparaciones de rendimiento en tareas generales entre estos modelos.

## Limitaciones y advertencias

- Modelo abliterated y sin rechazo: se ha eliminado deliberadamente la direccion que media las negativas, por lo que no incorpora barreras de seguridad del modelo original. El usuario es responsable del uso y del cumplimiento legal aplicable, tal como indica la model card.
- Sin evaluacion de seguridad en modo thinking: la medicion de rechazos cierra el bloque de razonamiento, de modo que el comportamiento del modelo cuando razona antes de responder no esta caracterizado.
- Sin benchmarks generales: no hay datos de MMLU, HumanEval, GSM8K ni de calidad de codigo, razonamiento o vision. No se puede asumir que el rendimiento del modelo base se preserve tras la ablacion.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica ni evaluacion de fidelidad factual. Como en cualquier modelo de esta familia, las respuestas deben verificarse en contextos de produccion.
- Idiomas: no disponibles. No se declaran lenguas soportadas ni cobertura multilingue verificada.
- Calidad del fine-tune subyacente: no se documenta si las trazas de razonamiento mas cortas de Swift se mantienen tras la ablacion; es una de las comprobaciones pendientes segun el autor.
- Efectos de segundo orden de la ablacion: la proyeccion de r se aplica tambien a los 256 tensores que Swift habia modificado, y no hay evaluacion de si esa proyeccion degrada capacidades distintas del rechazo.
- Licencia: la Swift Open License v1.0 es gratuita para individuos y organizaciones con hasta 1.000.000 USD de ingresos recurrentes anuales; por encima de ese umbral se requiere una Swift Enterprise License de UkisAI. Los componentes subyacentes de Qwen y orcarouter son Apache 2.0, pero la licencia del derivado es la de Swift.
- Trazabilidad de la evaluacion: los conteos de rechazo y la KL los ha medido el propio autor del modelo, con su propio montaje (Heretic, BF16), y no son comparables con cifras de otras model cards.
- Reproducibilidad de la abliteration: depende de la direccion r publicada y de los scripts incluidos; cambios de version en las herramientas de recuperacion podrian alterar los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP
- Cuantizaciones GGUF: https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF
- Cuantizaciones NVFP4: https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-NVFP4
- Modelo base (fine-tune de UkisAI): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo de referencia para la direccion de rechazo: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Herramienta de evaluacion y abliteration Heretic: https://github.com/p-e-w/heretic
- Paper sobre direcciones de rechazo (tag arxiv:2406.11717): https://arxiv.org/abs/2406.11717
- Licencia Swift Open License v1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces anteriores proceden de la informacion de HuggingFace y de la model card.
