# richardyoung/LFM2.5-1.2B-Instruct-heretic-GGUF

## Resumen

LFM2.5-1.2B-Instruct-heretic-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo richardyoung/LFM2.5-1.2B-Instruct-heretic, que a su vez es una version "abliterated" del LFM2.5-1.2B-Instruct desarrollado por Liquid AI. La abliteracion se ha realizado con la herramienta Heretic, un procedimiento que localiza y elimina la direccion de rechazo en el espacio de activaciones del modelo. El autor del repositorio es richardyoung y el resultado se distribuye unicamente en formato GGUF, pensado para llama.cpp, Ollama y derivados.

El repositorio contiene cuatro ficheros (Q4_K_M, Q5_K_M, Q6_K y Q8_0) que suman 3,8 GB, sobre un modelo de 1.170.340.608 parametros (~1,17 mil millones). Segun la evaluacion incluida en la model card, la abliteracion introduce una divergencia KL de 0,0585 respecto al modelo original y deja el ratio de rechazos en 3 de cada 100 peticiones. Se trata, por tanto, de un modelo conversacional pequeno cuyo interes principal no es el rendimiento bruto, sino la eliminacion de filtros de rechazo con un coste de degradacion bajo y verificable.

Es relevante ahora por dos motivos. Primero, porque permite estudiar y reproducir tecnicas de abliteracion sobre un modelo de ~1,2 B de parametros que cabe en cualquier portatil, algo poco habitual en este tipo de experimentos. Segundo, porque el ecosistema de modelos pequenos abliterados en GGUF esta creciendo y este repositorio aporta metricas objetivas (divergencia KL y tasa de rechazos) en lugar de afirmaciones sin respaldo. Como contrapartida, el repositorio no declara licencia, idiomas ni contexto, y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (heredada de LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | 1.170.340.608 (~1,17 mil millones; dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no se describe como modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 (formato GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); repositorio de 3,8 GB en total |
| Modelo base | richardyoung/LFM2.5-1.2B-Instruct-heretic (abliteracion de LiquidAI/LFM2.5-1.2B-Instruct) |
| Metodo de modificacion | Abliteration con Heretic (base_model_relation: quantized) |
| Pipeline declarado | no disponible |
| Etiquetas del repositorio | gguf, llama.cpp, ollama, uncensored, abliterated, endpoints_compatible, conversational |
| Fecha de creacion | 28/09/2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Lo unico verificable es la cadena de derivacion: la cuantizacion parte de richardyoung/LFM2.5-1.2B-Instruct-heretic, que es una modificacion de LiquidAI/LFM2.5-1.2B-Instruct, un modelo instruct de la familia LFM2.5 de Liquid AI con 1.170.340.608 parametros. No se han publicado en este repositorio datos sobre numero de tokens de entrenamiento, composicion del dataset ni si hubo etapas de RLHF o DPO.

La innovacion tecnica documentada es la abliteration con Heretic. Este procedimiento actua sobre las direcciones de activacion asociadas al rechazo y las suprime, en lugar de recurrir a fine-tuning con datos de cumplimiento (lo que se conoce como "uncensoring" por datos). El autor reporta dos metricas de control: una divergencia KL de 0,0585 frente al modelo original, que mide cuanto se ha desviado la distribucion de salida, y un ratio de rechazos de 3/100. La existencia de una carpeta `reproduce` en el repositorio del modelo base heretic indica que el proceso se documenta como reproducible. No se especifica en la informacion proporcionada si la cuantizacion GGUF se genero con `llama.cpp` estandar ni con que herramienta exacta.

## Capacidades

- Generacion de texto conversacional: el repositorio declara la etiqueta `conversational` y deriva de un modelo Instruct, por lo que soporta dialogos multi-turno con plantilla de chat.
- Seguimiento de instrucciones: capacidad heredada del modelo base LFM2.5-1.2B-Instruct; no se documenta su nivel de adherencia.
- Reduccion deliberada de rechazos: la abliteration elimina la direccion de rechazo, con 3 rechazos por cada 100 peticiones en la evaluacion del autor. Esto es una caracteristica buscada, no un defecto.
- Ejecucion local en CPU y GPU: al distribuirse solo en GGUF, esta pensado para llama.cpp, Ollama y runtimes equivalentes.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no disponible; no se declara ningun idioma.
- Vision, audio u otras modalidades: no disponible; el formato GGUF y la ausencia de menciones apuntan a un modelo exclusivamente de texto.
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo permite medir empiricamente como se comporta una red de 1,2 B cuando se le elimina la direccion de rechazo, comparando contra el modelo original con la divergencia KL de 0,0585 como metrica de deriva.
- Red teaming controlado en laboratorio: util para construir conjuntos de prompts adversarios y evaluar si otros modelos o filtros externos los detectan, dado que este modelo responde a peticiones que un modelo alineado rechazaria.
- Asistente conversacional local sin conexion: con Q4_K_M (~0,7 GB estimados) se puede ejecutar en un portatil o incluso en una Raspberry Pi, manteniendo los datos en el dispositivo.
- Generacion creativa sin restricciones: escritura de ficcion, roleplay o guiones donde los filtros de un modelo instruct estandar interrumpen la continuidad narrativa.
- Prototipado rapido de aplicaciones de chat: por tamano y licencia de runtime (llama.cpp), es adecuado para validar interfaces y flujos conversacionales antes de invertir en un modelo mayor.
- Generacion de datos sinteticos y etiquetado: se puede usar para producir borradores de texto a granel en un servidor pequeno o en una unica GPU, con coste por token muy bajo.
- Experimentos de destilacion y fine-tuning: al ser un modelo pequeno y abliterado, sirve como punto de partida para ajustes con LoRA sobre dominios concretos, aunque requeriria convertir los pesos GGUF a safetensors previamente.
- Despliegue embebido en aplicaciones de escritorio: integrable mediante llama-cpp-python o como servidor local compatible con la API de OpenAI (`endpoints_compatible`), sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval ni similares) en la informacion disponible. La unica evaluacion reportada es la propia de la herramienta Heretic, que mide el efecto de la abliteration, no la calidad general del modelo:

| Metrica (evaluacion de Heretic) | Valor |
|---|---|
| Divergencia KL respecto al modelo original | 0,0585 |
| Rechazos | 3/100 |

No se dispone de comparaciones con otros modelos en esta informacion, ni de datos de throughput, latencia o longitud de contexto efectiva.

## Requisitos de hardware

- VRAM/RAM estimada por cuantizacion (calculo a partir de 1,17 mil millones de parametros; el total coincide con los 3,8 GB del repositorio):

| Cuantizacion | Tamano estimado del fichero |
|---|---|
| Q4_K_M | ~0,70 GB |
| Q5_K_M | ~0,85 GB |
| Q6_K | ~1,00 GB |
| Q8_0 | ~1,25 GB |

- A esas cifras hay que sumar el cache KV, cuyo tamano depende de la longitud de contexto, no declarada en este repositorio.
- Cabe en cualquier GPU de consumo con 4 GB o mas de VRAM: GTX 1650, RTX 3050, RTX 4060, RTX 4090, etc. En una RTX 4090 o superior el modelo queda sobradamente dimensionado y el limite practico pasa a ser el numero de peticiones simultaneas, no el modelo.
- Funciona integramente en CPU: con Q4_K_M basta con 2-4 GB de RAM libre. Es viable en mini-PC, Raspberry Pi 5 y dispositivos similares, aunque sin datos de latencia publicados.
- En A100 o H100 se puede servir con lotes grandes y multiples replicas, pero el modelo es demasiado pequeno para aprovechar esas GPU de forma eficiente en terminos de coste por token.
- Opciones de despliegue: Ollama (`ollama run richardyoung/lfm2.5-1.2b-instruct-heretic`, tag por defecto Q4_K_M), llama.cpp (`llama-cli` y `llama-server`), LM Studio, koboldcpp, llama-cpp-python y Jan. vLLM tiene soporte GGUF experimental; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

Solo se pueden comparar las tres variantes que aparecen referenciadas en la informacion disponible. No hay datos publicados para comparar con alternativas de la misma categoria (por ejemplo, otros modelos instruct de 1 a 2 mil millones de parametros en GGUF).

| Modelo | Parametros | Contexto | Licencia | Formato | Modificacion |
|---|---|---|---|---|---|
| richardyoung/LFM2.5-1.2B-Instruct-heretic-GGUF (este modelo) | ~1,17 mil millones | no disponible | no disponible | GGUF (Q4_K_M, Q5_K_M, Q6_K, Q8_0) | Abliterated con Heretic, KL 0,0585, 3/100 rechazos |
| richardyoung/LFM2.5-1.2B-Instruct-heretic | ~1,17 mil millones | no disponible | no disponible | safetensors (presumiblemente; no confirmado en la informacion) | Abliterated con Heretic |
| LiquidAI/LFM2.5-1.2B-Instruct | ~1,17 mil millones | no disponible | no disponible | no disponible | Modelo original de Liquid AI, sin abliterar |

## Limitaciones y advertencias

- La abliteration suprime la direccion de rechazo: el modelo puede generar contenido danino, ilegal o inseguro. No es apto para exposicion publica sin una capa de moderacion externa.
- La divergencia KL de 0,0585 indica una degradacion real, aunque moderada, respecto al modelo original. Puede traducirse en perdida de calidad o coherencia en tareas alejadas de la conversacion.
- Ausencia total de benchmarks de capacidad: no hay MMLU, GSM8K, HumanEval ni evaluaciones de razonamiento, codigo o matematicas. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.
- Licencia no declarada: el repositorio no especifica terminos de uso. Al tratarse de una derivacion de un modelo de Liquid AI, es imprescindible verificar la licencia del modelo base antes de cualquier uso comercial.
- Riesgo de alucinacion elevado: con 1,17 mil millones de parametros, la generacion de hechos, citas o codigo no verificado es propensa a errores. No debe usarse como fuente de verdad.
- Longitud de contexto no documentada: no se puede planificar un caso de uso con contexto largo sin medirla previamente.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en ningun otro idioma distinto del que usara el modelo base, que tampoco se especifica.
- Validacion nula por parte de la comunidad: 0 descargas y 0 likes en el momento de la consulta, repositorio creado y actualizado el mismo dia. No hay issues, discusiones ni verificaciones independientes.
- El autor no documenta la herramienta exacta de cuantizacion ni los parametros usados, lo que dificulta reproducir los ficheros GGUF a partir del modelo heretic en safetensors.
- Uso etico y legal: la combinacion de un modelo abliterado con despliegue local facilita usos que eluden politicas de contenido. La responsabilidad recae enteramente en quien lo despliega.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/richardyoung/LFM2.5-1.2B-Instruct-heretic-GGUF
- Modelo base abliterated (safetensors): https://huggingface.co/richardyoung/LFM2.5-1.2B-Instruct-heretic
- Informacion de reproducibilidad del proceso de abliteration: https://huggingface.co/richardyoung/LFM2.5-1.2B-Instruct-heretic/tree/main/reproduce
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Herramienta Heretic (repositorio GitHub): https://github.com/p-e-w/heretic
