# 0xSojalSec/Qwen3.8-Flash-Next-Uncensored-GSQ-RCO-12-GB-GPU

## Resumen

Qwen3.8-Flash-Next-Uncensored-GSQ-RCO-12-GB-GPU es una cuantizacion GGUF publicada por el usuario 0xSojalSec sobre el modelo ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF. No se trata de un modelo entrenado desde cero, sino de una build derivada en la que se han sustituido 144 tensores de proyeccion "write-to-residual-stream" repartidos por las 48 capas del modelo por los tensores equivalentes de una release ya abliterated. El objetivo declarado es eliminar la direccion de rechazo (refusal direction) sin recalcular ninguna de las escalas aprendidas por la cuantizacion GSQ del modelo original.

El modelo subyacente es una arquitectura de mezcla de expertos (MoE) con 176.943.899.520 parametros totales, pipeline declarado image-text-to-text y una ventana de contexto de 262K tokens segun la propia model card. Los idiomas soportados declarados son ingles (en) y chino (zh). La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es acotada y muy especifica: sirve a equipos de red-teaming y de investigacion en alineacion que necesitan un modelo multimodal con contexto largo y sin capas de rechazo activas, en formato GGUF ligero para llama.cpp. Conviene senalar que, en el momento de redactar esta ficha, el repositorio acumula 0 descargas y 0 likes, y que parte de la model card original no estaba disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer; etiquetado como mixture-of-experts, sin detalle de capas de atencion ni numero de expertos en la informacion disponible |
| Parametros totales | 176.943.899.520 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262K tokens (segun la model card; 262.144 tokens) |
| Tipos de cuantizacion | IQ3_S, IQ3_XXS, IQ2_XS y Q2_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria gguf, compatible con llama.cpp) |

Datos adicionales: 48 capas, 144 tensores transplantados, tamano del repositorio 215,7 GB, fecha de creacion y ultima actualizacion 2026-10-05.

## Arquitectura y entrenamiento

La arquitectura es de mezcla de expertos, segun las etiquetas moe y mixture-of-experts de la model card y el pipeline image-text-to-text, que implica un codificador visual y un decodificador de lenguaje. No se dispone de informacion sobre el numero de expertos, el ratio de activacion, el tipo de atencion ni el esquema de enrutamiento. El dato de contexto de 262K tokens sugiere atencion de contexto largo, pero no se especifica si se emplea atencion lineal, ventanas deslizantes u otra variante.

Lo mas relevante tecnicamente es el procedimiento de derivacion, no el entrenamiento. La build parte de las cuantizaciones oficiales GSQ-RCO de ISTA-DASLab, donde GSQ aprende los valores y escalas de cuantizacion y RCO asigna de forma restringida por presupuesto el tipo de cuantizacion de cada tensor. Sobre esa base ya cuantizada, el autor sustituye 144 tensores de proyeccion hacia el residual stream en las 48 capas por los de una release abliterated ya existente, sin recalcular las escalas de GSQ y restaurando exactamente la asignacion de tipos por tensor del modelo upstream. La build IQ3_S se presenta como verificada tensor a tensor mediante hash blake2b por tensor. No hay informacion sobre el dataset de entrenamiento del modelo subyacente, el numero de tokens, ni sobre si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multi-paso, segun las etiquetas reasoning y long-context.
- Procesamiento de imagen y texto (pipeline image-text-to-text): acepta entrada multimodal de imagen mas texto.
- Contexto largo de hasta 262K tokens, apto para documentos extensos o historiales de conversacion muy largos.
- Capacidades multilingues limitadas a ingles y chino.
- Modelo abliterated: la direccion de rechazo se ha eliminado mediante transplante de tensores, orientado a red-teaming y generacion sin filtros de contenido.
- Soporte de conversacion multi-turno (etiqueta conversational).
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Red-teaming de sistemas de IA: evaluar la robustez de clasificadores de contenido y filtros de seguridad frente a un modelo multimodal con la direccion de rechazo eliminada y 262K tokens de contexto, util para construir conjuntos de prompts adversarios.
- Investigacion en alineacion y mecanicismo interpretable: comparar el comportamiento del modelo abliterated con el del upstream ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF para aislar el efecto del transplante de los 144 tensores sobre las respuestas.
- Analisis de documentos largos con imagenes: procesar informes, planos o capturas extensas junto con texto de acompanamiento, aprovechando la ventana de 262K tokens en una sola pasada.
- Procesamiento por lotes en local con llama.cpp: al ser GGUF, se puede ejecutar en estaciones de trabajo sin conexion para tareas de generacion masiva donde no se requiere API externa.
- Pruebas de estres de cuantizacion: evaluar la degradacion de calidad entre los tiers Q2_0 (38,0 GB), IQ2_XS, IQ3_XXS e IQ3_S (55,1 GB) sobre una misma base, util para estudiar el impacto de la cuantizacion agresiva en modelos MoE de 176,9B parametros.
- Generacion asistida en ingles y chino: tareas de redaccion o traduccion entre ambos idiomas en entornos controlados, asumiendo la ausencia de filtros de seguridad.
- Reproducibilidad de builds derivadas: servir como referencia metodologica para verificar transplantes de tensores con hashes blake2b por tensor en modelos ya cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tablas de MMLU, HumanEval, GSM8K, MMLU-Pro ni evaluaciones multimodales, y tampoco se aportan metricas de perplejidad comparando la build abliterated con el upstream.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia de orden de magnitud, el fichero Q2_0 ocupa 38,0 GB y el IQ3_S 55,1 GB, a lo que hay que sumar la cache KV correspondiente al contexto utilizado (significativa con 262K tokens en un MoE de 176,9B parametros).
- GPU recomendadas: no especificadas. Por tamano de fichero, las opciones realistas son GPU de 80 GB (A100, H100) o configuraciones multi-GPU. Una unica RTX 4090 de 24 GB no puede alojar el modelo completo ni siquiera en Q2_0.
- Cabe en GPU de consumo: no en una sola unidad. Es viable con offload parcial a CPU y RAM del sistema mediante llama.cpp, o repartiendo capas entre varias GPU de 24 GB.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF, incluidos Ollama y LM Studio. vLLM y TGI no estan confirmados como soportados en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Con offload parcial a CPU, la velocidad queda limitada por el ancho de banda de memoria del sistema.
- Nota sobre el nombre del repositorio: la denominacion incluye "12-GB-GPU", pero los tiers visibles en la model card son 38,0 GB (Q2_0) y 55,1 GB (IQ3_S). No se ha podido verificar la existencia de un tier de 12 GB en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 0xSojalSec/Qwen3.8-Flash-Next-Uncensored-GSQ-RCO-12-GB-GPU | 176,9B (MoE) | 262K | Si (image-text-to-text) | Apache 2.0 | GGUF, repo de 215,7 GB, 0 descargas |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (upstream) | 176,9B (MoE) | 262K | Si | Apache 2.0 | GGUF |
| Alternativas equivalentes de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

El unico termino de comparacion verificable con la informacion aportada es el modelo upstream, del que esta build es una derivacion con 144 tensores sustituidos y un coste adicional de entre 0,25 GB y 0,44 GB por tier, segun la propia model card. No se dispone de datos de rendimiento que permitan comparar con otras alternativas de tamano o tarea similar.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de la direccion de rechazo implica que el modelo puede generar contenido danino, ilegal o no seguro sin las salvaguardas habituales. No es apto para despliegues de cara al publico sin capas de filtrado externas.
- Sin datos de evaluacion: no hay benchmarks que cuantifiquen la degradacion de capacidades causada por el transplante de tensores ni por la cuantizacion de 2 a 3 bits.
- Cuantizacion muy agresiva: los tiers Q2_0, IQ2_XS e IQ3_XXS operan en rangos de 2 a 3 bits, con perdida de calidad previsible en tareas de razonamiento y codigo respecto a los pesos originales.
- Deriva de comportamiento no verificada: la model card afirma que solo cambiaron los 144 tensores previstos y que la verificacion blake2b cubre la build IQ3_S, pero no se extiende esa verificacion al resto de tiers en la informacion disponible.
- Cobertura idiomatica limitada: solo ingles y chino. El rendimiento en castellano no esta documentado y no deberia asumirse.
- Contexto de 262K tokens: no hay informacion sobre la degradacion de atencion a lo largo de la ventana ni sobre tecnicas de extension empleadas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados. El autor no publica analisis de sesgo.
- Licencia: Apache 2.0 permite uso comercial, pero el caracter abliterated traslada al desplegador la responsabilidad sobre el cumplimiento normativo y sobre el contenido generado.
- Madurez del repositorio: 0 descargas y 0 likes, publicado y actualizado el mismo dia (2026-10-05), sin historial de mantenimiento ni validacion por terceros.
- Model card incompleta: la informacion proporcionada se corta durante la descripcion del repositorio, por lo que podrian faltar secciones relevantes sobre uso previsto o detalles de las cuantizaciones.
- Modelo base y referencias arXiv: las etiquetas citan arxiv:2604.18556 y arxiv:2605.00649, pero no se ha podido verificar su contenido en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0xSojalSec/Qwen3.8-Flash-Next-Uncensored-GSQ-RCO-12-GB-GPU
- Modelo base (upstream GSQ-RCO): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Model card en chino simplificado referenciada en el README: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
- Referencia arXiv citada en las etiquetas (contenido no verificado): arxiv:2604.18556
- Referencia arXiv citada en las etiquetas (contenido no verificado): arxiv:2605.00649
- Los resultados de busqueda web recibidos no contenian informacion tecnica util sobre el modelo y se han descartado.
