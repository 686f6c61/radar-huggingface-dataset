# genevera/GLM-5.3-Flash-Uncensored-EXL3-2.5bpw

## Resumen

GLM-5.3-Flash-Uncensored-EXL3-2.5bpw es una cuantizacion de 2,51 bits por peso en formato EXL3 (ExLlamaV3) de la variante CRACK del modelo GLM-5.3-Flash, un MoE hibrido de la familia GLM desarrollado originalmente por zai-org. La publica el usuario genevera a partir del release FP8 desinhibido de dealignai, que elimina por completo el comportamiento de rechazo mediante una edicion permanente de los tensores (abliteracion), sin recurrir a fine-tuning, DPO, LoRA ni trucos de plantilla. El resultado es un modelo de gran tamano con la capacidad de rechazo suprimida a nivel de pesos.

La relevancia de esta ficha esta en que combina tres cosas poco habituales: una cuantizacion agresiva de 2,51 bpw que reduce un modelo de escala 320B/18B-activos a unos 99 GiB, la preservacion de vision (torre GLM-4.1V) y de la cabeza MTP (multi-token prediction) para decodificacion especulativa, y un contexto declarado de 1M de tokens. El autor sostiene que la calidad se mantiene gracias a que embeddings, lm_head, proyecciones de salida de atencion y tensores de norma e hiper-conexion se conservan en mayor precision.

Conviene senalar de entrada una discrepancia documental importante: los metadatos de safetensors del repositorio declaran 52.855.668.830 parametros, mientras que la model card describe el modelo base como un MoE de 320B totales y 18B activos. La informacion disponible no permite resolver la diferencia, por lo que ambos datos se recogen tal cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido (etiqueta `glm5_next`), con torre de vision y cabeza MTP; transformer disperso de la familia GLM |
| Parametros totales | 52.855.668.830 segun metadatos de safetensors; la model card declara 320B totales para el modelo base (discrepancia no resuelta) |
| Parametros activos | 18B (segun la model card, referido al modelo base) |
| Longitud de contexto | 1M de tokens (segun la model card); no verificado de forma independiente |
| Tipos de cuantizacion | EXL3 de 2,51 bpw de media, 6 bits en cabezas, codebook `mul1`, escalas de salida siempre activas, cabeza MTP a 4 bits; embeddings, `lm_head`, proyecciones de salida de atencion, normas e hiper-conexion sin cuantizar |
| Idiomas soportados | Ingles (`en` en metadatos y model card); el multilingueismo del modelo base no se detalla |
| Licencia | MIT (metadatos del repositorio); la licencia del modelo base zai-org/GLM-5.3-Flash no se especifica en la informacion disponible |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3), 13 shards, ~99 GiB |
| Tamano del repositorio | 105,9 GB |
| Calibracion de la cuantizacion | 250 filas x 2048 columnas |

## Arquitectura y entrenamiento

El modelo base es un MoE hibrido de la familia GLM-5.3, con atencion transformer y soporte de vision mediante una torre GLM-4.1V integrada en los pesos, ademas de una cabeza de prediccion multi-token (MTP) que se entrega como capa adicional `layers.45` y habilita decodificacion especulativa. La model card describe el conjunto como un MoE de 320B parametros totales y 18B activos con 1M de tokens de contexto. La etiqueta `glm5_next` del repositorio apunta a una generacion sucesora dentro de la familia.

No hubo entrenamiento adicional en esta ficha: el autor subraya explicitamente que la desinhibicion es una edicion permanente de los tensores, sin SFT, sin DPO, sin LoRA ni adaptadores, y sin vectores de direccion ni hooks en tiempo de ejecucion. La edicion CRACK de dealignai se aplico sobre el release FP8 y genevera la cuantizo despues a EXL3. La innovacion tecnica destacable es la politica de precision mixta: se mantienen sin cuantizar embeddings, `lm_head`, proyecciones de salida de atencion, normas e hiper-conexion (heredada de `modules_to_not_convert` del release FP8 de origen), y la cabeza MTP se cuantiza por separado a 4 bits, lo que permite que la decodificacion especulativa funcione de fabrica. Los parametros de muestreo recomendados por el release de origen son temperatura 1,0, top_p 0,95 y repetition_penalty 1,1.

## Capacidades

- Generacion de texto y razonamiento en ingles, con varios modos de esfuerzo de razonamiento (reasoning off, low, default, max, segun la model card).
- Razonamiento de multiples pasos y modos de pensamiento configurables; la edicion esta afinada para ser plenamente desinhibida en reasoning-off y esfuerzo maximo.
- Vision: la torre GLM-4.1V esta incluida en los pesos y la plantilla multimodal de chat (`chat_template.jinja`) se distribuye con el modelo.
- Prediccion multi-token (MTP) operativa: la cabeza draft viaja como `layers.45` a 4 bits y permite decodificacion especulativa; en vLLM se activa con `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`.
- Contexto declarado de hasta 1M de tokens.
- Ausencia de rechazos: el autor reporta 320/320 cumplimientos en HarmBench-320 (greedy) sobre el release de origen, y 30/30 en las seis conductas mas duras con muestreo recomendado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigacion en alineacion y seguridad: el modelo permite estudiar el comportamiento de un sistema sin guardarrailes frente a peticiones que un modelo estandar rechazaria, comparando pares base/desinhibido con la misma configuracion de decodificacion. Es el uso declarado por el autor.
- Analisis de robustez de filtros: se puede emplear como generador adversario para probar clasificadores de contenido, moderacion automatica y sistemas de deteccion de prompts daninos, dado su 100% de cumplimiento en HarmBench-320.
- Procesamiento de documentos largos en ingles: con el contexto declarado de 1M de tokens, encaja en tareas de resumen, extraccion y pregunta-respuesta sobre volumenes grandes de texto sin trocear, siempre que el presupuesto de memoria lo permita.
- Pipelines multimodales: la torre de vision incluida permite describir imagenes, extraer informacion de capturas o diagramas y combinar imagen y texto en una misma conversacion mediante la plantilla multimodal.
- Servicio de inferencia de alto rendimiento con decodificacion especulativa: activando la cabeza MTP se reduce el coste por token en el escenario de generacion larga, util en backends propios sobre exllamav3 o vLLM.
- Evaluacion comparativa de cuantizaciones: sirve como punto de medida del impacto real de 2,51 bpw frente al release FP8 de origen (el autor reporta 87,33% en MMLU para el FP8 desinhibido), para decidir si merece la pena bajar de precision en despliegues con memoria limitada.
- Redaccion y generacion creativa sin restricciones tematicas: util en entornos de investigacion donde se necesita analizar generacion sobre temas sensibles y no hay requisitos de cumplimiento normativo de contenido.

## Benchmarks y rendimiento

Los datos disponibles corresponden al release FP8 de origen, no a esta cuantizacion EXL3 de 2,51 bpw. El autor no publica mediciones propias sobre el modelo cuantizado.

| Benchmark | Base FP8 | CRACK desinhibido FP8 | Delta |
|---|---|---|---|
| MMLU (logit, 1.026 preguntas) | 86,74% | 87,33% | +0,59 pp |

| HarmBench-320 (greedy) | Cumplidas | Tasa |
|---|---|---|
| Estandar | 159/159 | 100,0% |
| Contextual | 81/81 | 100,0% |
| Copyright | 80/80 | 100,0% |
| Total | 320/320 | 100,0% |

Con los parametros de muestreo recomendados (temperatura 1,0, top_p 0,95), las seis conductas mas duras se muestrearon cinco veces cada una: 30/30 cumplimientos, cero rechazos, cero rechazos suaves y cero salidas basura, segun la model card. No hay resultados publicados de HumanEval, GSM8K, MMLU-Pro ni de benchmarks de vision en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 100 GiB solo para pesos, mas la cache KV. El repositorio ocupa 105,9 GB y el autor cifra los pesos en ~99 GiB repartidos en 13 shards.
- Configuraciones recomendadas por el autor: 2x H100 80G con NVLink, 4x tarjetas de clase A6000 o 3090 de 48G, o un sistema con memoria unificada de 192 GB o mas.
- GPU compatibles: EXL3 funciona en NVIDIA Ampere o superior y en Apple Silicon. No cabe en ninguna GPU de consumo de 24 GB o menos en configuracion mononodo con esta precision; la viabilidad pasa por agregar varias tarjetas o por memoria unificada.
- Opciones de despliegue: exllamav3 (version igual o superior a 1.4.8, la empleada para producir la cuantizacion) y vLLM con soporte MTP. El repositorio distribuye pesos EXL3 en safetensors, no GGUF, por lo que llama.cpp u Ollama requeririan una conversion no incluida en el repositorio.
- Latencia y throughput: no disponibles. La cabeza MTP a 4 bits esta pensada para decodificacion especulativa (`num_speculative_tokens: 1` en vLLM), lo que deberia mejorar el throughput respecto a decodificacion autoregresiva pura, pero el autor no publica cifras.

## Comparativa con modelos similares

No se dispone de datos de terceros en la informacion proporcionada para comparar con alternativas equivalentes. La comparacion posible es interna a la familia:

| Variante | Precision | MMLU | Contexto declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash base (zai-org) | FP8 | 86,74% | 1M | no disponible en esta informacion | HuggingFace |
| GLM-5.3-Flash-UNCENSORED-FP8 (dealignai) | FP8 | 87,33% | 1M | no disponible en esta informacion | HuggingFace |
| GLM-5.3-Flash-Uncensored-EXL3-2.5bpw (genevera) | 2,51 bpw EXL3 | no medido sobre el cuantizado | 1M | MIT | HuggingFace |

No hay datos de rendimiento del cuantizado a 2,51 bpw frente al FP8 de origen, ni comparaciones publicadas con otros modelos abliterated de la misma escala.

## Limitaciones y advertencias

- Guardarrailes eliminados: el modelo cumple peticiones que un modelo estandar rechazaria (100% en HarmBench-320). El propio autor lo libera para investigacion en alineacion y seguridad y responsabiliza al usuario del uso.
- Uso comercial: los metadatos declaran licencia MIT, pero la licencia del modelo base zai-org/GLM-5.3-Flash no se especifica en la informacion disponible. Conviene verificar la licencia del modelo original antes de cualquier despliegue productivo con animo de lucro.
- Discrepancia en el recuento de parametros: los safetensors declaran 52.855.668.830 parametros y la model card habla de 320B totales / 18B activos. Cualquier planificacion de hardware o coste debe partir de la cifra real de pesos (~99 GiB) y no del dato de la model card.
- Modos de razonamiento: la edicion desinhibida esta calibrada para reasoning-off y esfuerzo maximo. En esfuerzo bajo se conservan algunos rechazos por diseno, de modo que el comportamiento no es homogeneo entre modos.
- Idiomas: los metadatos solo declaran ingles. El rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse a partir del modelo base.
- Cuantizacion agresiva: 2,51 bpw con solo 250 filas x 2048 columnas de calibracion es un ajuste de baja precision. El autor no publica metricas de perplejidad ni de degradacion sobre el cuantizado, por lo que la perdida real de calidad respecto al FP8 es desconocida.
- Alucinacion: no hay mediciones de veracidad ni de tasas de alucinacion en la informacion disponible; el riesgo es el habitual en modelos de esta familia y no esta cuantificado.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la model card. La desinhibicion por abliteracion puede alterar la distribucion de respuestas en temas sensibles sin control conocido.
- Contexto de 1M: es una cifra declarada por la model card, no verificada de forma independiente en esta ficha. Ademas, sostener 1M de tokens de KV cache exige mucha mas memoria que los ~100 GiB de pesos.
- Repositorio sin traccion: cero descargas y cero likes en el momento de recoger los datos, sin validacion de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/genevera/GLM-5.3-Flash-Uncensored-EXL3-2.5bpw
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Release FP8 desinhibido de origen: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-FP8
- Perfil del cuantizador: https://huggingface.co/genevera
- Perfil de dealignai (investigacion CRACK): https://huggingface.co/dealignai
- Twitter de dealignai: https://twitter.com/dealignai
- Twitter de jordanschenck (computo del release de origen): https://twitter.com/jordanschenck

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos enlaces utiles son los presentes en la informacion de HuggingFace. No se han localizado papers, blogs ni demos adicionales.
