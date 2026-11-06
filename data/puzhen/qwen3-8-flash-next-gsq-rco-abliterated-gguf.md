# puzhen/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF es una cuantización GGUF "abliterated" (con la dirección de rechazo eliminada) del modelo ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF, publicada por el usuario puzhen. Se trata de un modelo de mezcla de expertos (MoE) de 176.943.899.520 parámetros totales, con capacidades multimodales imagen-texto, contexto largo de 262K tokens y soporte de razonamiento. El autor ha transplantado 144 tensores de proyección de escritura al flujo residual en las 48 capas, sustituyéndolos por los de una versión abliterated ya existente, sin recalcular ninguno de los tensores cuantizados aprendidos por GSQ.

La relevancia de esta ficha radica en que combina tres técnicas poco habituales: la cuantización aprendida GSQ con asignación de tipos por presupuesto RCO del modelo base, el transplante quirúrgico de tensores sobre pesos ya cuantizados y la eliminación de la dirección de rechazo (abliteration) para uso en red-teaming y entornos sin censura. El resultado se distribuye en varios niveles de cuantización (IQ3_S, IQ3_XXS, IQ2_XS y Q2_0) con verificación blake2b tensor por tensor en el build IQ3_S.

El modelo está pensado para investigadores y desarrolladores que necesitan un modelo multimodal de gran tamaño con contexto muy largo, desplegable en llama.cpp, y con la censura alineada desactivada para evaluaciones de seguridad, generación de contenido sin restricciones y experimentación con prompts adversarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, multimodal imagen-texto |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | IQ3_S, IQ3_XXS, IQ2_XS, Q2_0 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 217,9 GB |
| Rango de tamano por cuantizacion | 38,0 GB (Q2_0) a 55,1 GB (IQ3_S) |
| Capas | 48 |
| Tensores transplantados | 144 |
| Modelo base | ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF |
| Verificacion | blake2b por tensor (build IQ3_S) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos con 48 capas y capacidades multimodales (pipeline image-text-to-text). La cuantización de origen emplea GSQ (una técnica de cuantización aprendida) combinada con RCO, un esquema de asignación de tipos por tensor sujeto a un presupuesto de tamaño. Sobre esa base ya cuantizada, el autor de esta ficha no ha recalculado ningún tensor: ha sustituido únicamente los 144 tensores de proyección que escriben en el flujo residual, en las 48 capas, por los correspondientes de una release abliterated ya existente.

La innovación técnica principal es precisamente ese "tensor transplant" sobre pesos cuantizados: se preservan intactos todos los valores y escalas que GSQ aprendió, y se restaura exactamente la asignación de tipos por tensor del upstream. El build IQ3_S está verificado tensor por tensor con blake2b, de modo que solo han cambiado los tensores previstos. El coste de tamaño respecto al upstream es de 0,25 a 0,44 GB por nivel de cuantización. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento (reasoning) según los tags del modelo.
- Procesamiento multimodal imagen-texto (pipeline image-text-to-text).
- Contexto largo de hasta 262K tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingües limitadas a inglés y chino.
- Comportamiento "uncensored" / abliterated: la dirección de rechazo ha sido eliminada, por lo que el modelo no declina peticiones que el modelo base rechazaría.
- Orientado a red-teaming y evaluación de seguridad.
- Compatible con llama.cpp y con endpoints compatibles (tag endpoints_compatible).
- No se ha confirmado soporte de tool calling ni de function calling en la información disponible.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo sirve para generar prompts y respuestas adversarias sin que la alineación las bloquee, lo que permite probar defensas y clasificadores de contenido en pipelines de evaluación.
- Procesamiento de documentos largos: con 262K tokens de contexto se pueden ingerir informes, expedientes o bases de código completas en una sola pasada para tareas de resumen y extracción.
- Análisis de imágenes con texto asociado: al ser image-text-to-text, permite describir, clasificar o extraer información de capturas, diagramas y documentos escaneados acompañados de instrucciones textuales.
- Investigación sobre abliteration: comparar el comportamiento del modelo abliterated frente al upstream GSQ-RCO permite estudiar el efecto de la eliminación de la dirección de rechazo sobre calidad, coherencia y sesgos.
- Despliegue local en llama.cpp: los builds IQ3_S (55,1 GB) e IQ2_XS permiten ejecutar un MoE de 177B parámetros en estaciones de trabajo con suficiente VRAM o en configuraciones con offload a CPU.
- Generación de contenido sin restricciones para entornos controlados: escritura creativa, guiones o material de ficción que los modelos alineados rechazarían por políticas de contenido.
- Experimentación con cuantización aprendida: el repo documenta la verificación blake2b y el transplante de tensores, lo que lo convierte en material de referencia para estudiar GSQ y RCO en la práctica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 38 GB para Q2_0, en torno a 45-50 GB para IQ2_XS e IQ3_XXS, y unos 55 GB para IQ3_S (tamaños de fichero; la VRAM real depende del contexto y del offload).
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para IQ3_S con contexto largo; para Q2_0 puede bastar una GPU de 48 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en ninguno de los niveles publicados; requeriría offload parcial a RAM del sistema, con la consiguiente penalización de latencia.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y servidores compatibles con endpoints según el tag endpoints_compatible. No se confirma soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| puzhen/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | 176,9B (MoE) | 262K | imagen-texto | apache-2.0 | GGUF |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (upstream) | 176,9B (MoE) | 262K | imagen-texto | apache-2.0 | GGUF |
| SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF (referencia de tensores) | 176,9B (MoE) | 262K | imagen-texto | no disponible | GGUF |
| Modelos MoE abliterated de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

El upstream y esta ficha comparten arquitectura, contexto y licencia; la diferencia es el transplante de tensores abliterated y el coste adicional de 0,25-0,44 GB por nivel. La release de SC117 es la fuente de los tensores transplantados, según la model card.

## Limitaciones y advertencias

- Al estar abliterated, el modelo no aplica los mecanismos de rechazo del modelo base: puede producir contenido dañino, ilegal o inseguro sin filtro, lo que exige moderación externa en cualquier despliegue real.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados que permitan estimar la degradación respecto al upstream.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- La licencia apache-2.0 permite uso comercial, pero el comportamiento sin censura traslada al desplegador toda la responsabilidad legal y de cumplimiento.
- El transplante de tensores sobre pesos ya cuantizados puede introducir degradaciones no medidas; solo el build IQ3_S declara verificación blake2b tensor por tensor.
- Los tamaños de 38-55 GB hacen inviable el despliegue en GPU de consumo sin offload, con latencia elevada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del funcionamiento.
- No se confirma soporte de tool calling, function calling ni agentes multi-paso en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/puzhen/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Modelo base: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- README en chino: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
- Referencia arXiv citada en tags: arxiv:2604.18556
- Referencia arXiv citada en tags: arxiv:2605.00649
