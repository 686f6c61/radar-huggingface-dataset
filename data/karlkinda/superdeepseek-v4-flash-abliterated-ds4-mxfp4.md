# KarlKinda/SuperDeepseek-V4-Flash-abliterated-ds4-MXFP4

## Resumen

SuperDeepseek V4 Flash Abliterated — DS4 MXFP4 es una conversión GGUF del checkpoint `Jiunsong/SuperDeepseek-V4-Flash-abliterated`, que a su vez deriva del modelo oficial `deepseek-ai/DeepSeek-V4-Flash-0731`. El autor de la conversión, KarlKinda, ha empaquetado el modelo en un formato GGUF especializado para el motor de inferencia DwarfStar (DS4), desarrollado por Salvatore Sanfilippo (antirez) para Apple Silicon. La conversión utiliza el formato MXFP4 nativo de DS4 para los expertos enrutados, preservando la representación FP4 original del checkpoint fuente.

El modelo base es un Mixture of Experts (MoE) de 284 mil millones de parámetros totales, con expertos enrutados dinámicamente. La modificación "abliterated" de Jiunsong ajusta selectivamente componentes de atención y salida (43 pares de pesos/escalas en el backbone y 3 en el MTP, más una recuperación acotada del head de salida) para reducir rechazos innecesarios, manteniendo intactos los expertos enrutados. El resultado es un archivo GGUF de aproximadamente 156 GB pensado exclusivamente para ejecutarse con DS4, que soporta SSD streaming para Macs con memoria unificada limitada.

La relevancia de este modelo radica en que permite ejecutar un MoE de gran tamaño en hardware Apple con cuantización MXFP4 de alta eficiencia, algo poco común en el ecosistema GGUF. La licencia MIT facilita su uso comercial, aunque la naturaleza "abliterated" del checkpoint implica que se han eliminado mecanismos de rechazo, lo que requiere evaluación cuidadosa antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con expertos enrutados |
| Parametros totales | 284.334.567.511 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 para expertos enrutados; F16 para HC, compressor e indexer; Q8 para attention, shared y out |
| Idiomas soportados | en (etiqueta oficial; el modelo base DeepSeek V4 Flash podría soportar más, pero no se confirma en esta conversión) |
| Licencia | MIT |
| Formato de pesos | GGUF (especializado para DS4) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de DeepSeek V4 Flash 0731, un modelo MoE con expertos enrutados que activa solo una fracción de sus parámetros por token. La conversión DS4 MXFP4 reorganiza el checkpoint en un layout GGUF específico donde los expertos enrutados se almacenan en MXFP4 (formato de punto flotante de 4 bits con escalado por bloque), mientras que los componentes no enrutados (attention, shared experts, output head) se mantienen en F16 o Q8. Esta distribución permite a DS4 cargar dinámicamente los expertos desde el archivo GGUF a una caché en memoria, optimizando el uso de memoria unificada en Apple Silicon.

El entrenamiento original del modelo DeepSeek V4 Flash no está documentado en la información proporcionada; no se dispone de datos sobre número de tokens, composición del dataset ni métodos de alineación (RLHF/DPO). La modificación "abliterated" de Jiunsong no reentrena el modelo, sino que ajusta directamente pesos específicos (43 pares `attn.wo_b` en el backbone y 3 en el MTP, más una recuperación acotada del output head) para reducir comportamientos de rechazo, dejando los expertos enrutados intactos. No se documentan innovaciones técnicas adicionales en esta conversión más allá del uso del formato MXFP4 y el tooling `deepseek4-quantize` de DS4.

## Capacidades

- Generación de texto conversacional: el modelo base DeepSeek V4 Flash está diseñado para tareas de chat y generación de lenguaje natural; la conversión conserva estas capacidades.
- Razonamiento y código: DeepSeek V4 Flash es conocido por su rendimiento en tareas de razonamiento y generación de código, aunque no se proporcionan benchmarks específicos en esta conversión.
- Soporte de tool calling / function calling: no se menciona explícitamente en la información disponible; el modelo base podría soportarlo, pero no hay confirmación.
- Soporte de agentes y multi-step reasoning: no documentado en esta conversión.
- Capacidades multilingües: la etiqueta oficial indica solo "en"; aunque DeepSeek V4 Flash probablemente soporta múltiples idiomas, esta conversión no lo confirma.
- Capacidades especiales: el modelo es "abliterated", lo que significa que se han reducido los rechazos ante solicitudes que el modelo original podría negarse a procesar. No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Despliegue local en Apple Silicon con DS4: el caso de uso principal es ejecutar este MoE de 284B parámetros en Macs con suficiente memoria unificada (o con SSD streaming) usando el motor DS4, aprovechando la cuantización MXFP4 para reducir el footprint de memoria.
- Asistente conversacional sin censura: gracias a la modificación abliterated, el modelo responde a una gama más amplia de solicitudes sin rechazos automáticos, útil para experimentación en entornos de investigación donde se requiere explorar temas que el modelo original podría bloquear.
- Generación de código en entornos con restricciones de hardware: el modelo base es competente en tareas de programación; con SSD streaming, puede ejecutarse en Macs con menos memoria unificada, aunque con menor velocidad de generación.
- Investigación sobre comportamiento de modelos MoE cuantizados: la conversión MXFP4 permite estudiar cómo afecta la cuantización FP4 a los expertos enrutados en comparación con otras cuantizaciones (IQ2, Q2, etc.).
- Desarrollo de aplicaciones de texto con licencia permisiva: la licencia MIT permite integrar el modelo en productos comerciales sin restricciones de atribución, siempre que se respeten los derechos de autor originales.
- Evaluación de técnicas de "abliteration" en producción: este checkpoint sirve como caso de estudio para desarrolladores que quieran entender cómo la modificación de pesos de atención afecta al comportamiento de rechazo sin reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye métricas de MMLU, HumanEval, GSM8K ni similares, y tampoco se proporcionan datos de rendimiento comparativo con otras cuantizaciones. Se recomienda consultar la model card original de `Jiunsong/SuperDeepseek-V4-Flash-abliterated` y la de `deepseek-ai/DeepSeek-V4-Flash-0731` para obtener resultados de evaluación del modelo base.

## Requisitos de hardware

- El archivo GGUF pesa aproximadamente 156 GB (155.976.458.848 bytes), por lo que requiere al menos esa cantidad de almacenamiento.
- Para ejecutarse sin SSD streaming, se necesita una Mac con memoria unificada superior al tamaño del modelo más el contexto; se estima que 192 GB o más serían necesarios, aunque no se especifica el mínimo exacto.
- DS4 soporta SSD streaming, que mantiene los pesos no enrutados en memoria y carga dinámicamente los expertos MoE desde el SSD a una caché en memoria. Esto permite ejecutar el modelo en Macs con menos memoria unificada, a costa de mayor latencia dependiendo de la velocidad del SSD.
- El motor DS4 está diseñado específicamente para Apple Silicon con Metal; no se menciona soporte para GPUs NVIDIA o AMD.
- Opciones de despliegue: exclusivamente DS4 (https://github.com/antirez/ds4). Aunque Hugging Face puede mostrar instrucciones para llama.cpp, Ollama o LM Studio, la model card advierte explícitamente que este layout GGUF no ha sido validado con esos runtimes.
- Latencia y throughput: no se proporcionan datos numéricos; la velocidad dependerá de la memoria disponible, la longitud del contexto y el rendimiento del SSD en modo streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Runtime |
|---|---|---|---|---|---|
| SuperDeepseek V4 Flash Abliterated DS4 MXFP4 (este) | 284B totales | MXFP4 (expertos), F16/Q8 (resto) | no disponible | MIT | DS4 (Apple Silicon) |
| deepseek-ai/DeepSeek-V4-Flash-0731 | 284B totales | Original (FP8/BF16) | no disponible | MIT | Varios (vLLM, TGI, etc.) |
| Jiunsong/SuperDeepseek-V4-Flash-abliterated | 284B totales | Original (FP8/BF16) | no disponible | MIT | Varios (vLLM, TGI, etc.) |

La comparativa se limita a la estructura porque no hay datos de rendimiento disponibles. Este modelo se diferencia de los otros dos por su formato GGUF específico para DS4 y la cuantización MXFP4, que reduce el tamaño del archivo frente a las versiones originales (que probablemente ocuparían más de 500 GB en FP8). La licencia MIT es común a los tres. La principal limitación es que este GGUF solo puede ejecutarse con DS4, mientras que los checkpoints originales son compatibles con frameworks estándar.

## Limitaciones y advertencias

- El modelo es "abliterated", lo que elimina o reduce los mecanismos de rechazo. Esto no garantiza corrección, fiabilidad ni seguridad; los outputs pueden ser inapropiados, dañinos o sesgados. El usuario es responsable de evaluar y aplicar salvaguardas.
- La conversión solo ha sido probada con DS4. No se ha validado con llama.cpp, Ollama, LM Studio u otros runtimes GGUF, a pesar de que Hugging Face pueda mostrar instrucciones genéricas para ellos.
- El tamaño del archivo (156 GB) hace impracticable su uso en la mayoría de hardware consumer sin SSD streaming, y el rendimiento con streaming dependerá críticamente de la velocidad del disco.
- No se dispone de información sobre la longitud de contexto soportada, los idiomas reales (la etiqueta solo indica "en") ni los parámetros activos por token.
- No se han publicado benchmarks de esta conversión, por lo que no es posible verificar su rendimiento real frente a otras cuantizaciones o modelos.
- La modificación abliterated puede introducir artefactos o degradaciones en ciertos comportamientos del modelo, ya que ajusta pesos sin reentrenamiento; no hay datos sobre el impacto en calidad de generación.
- Aunque la licencia es MIT, los autores originales (DeepSeek, Jiunsong, antirez) conservan sus derechos de autor y atribución; es necesario respetar las condiciones de cada componente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KarlKinda/SuperDeepseek-V4-Flash-abliterated-ds4-MXFP4
- Modelo base (abliterated): https://huggingface.co/Jiunsong/SuperDeepseek-V4-Flash-abliterated
- Modelo original DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Motor DS4 (DwarfStar): https://github.com/antirez/ds4
- Plantilla GGUF de DS4 para DeepSeek V4: https://github.com/antirez/deepseek-v4-gguf
