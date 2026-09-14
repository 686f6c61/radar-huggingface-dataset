# Jeesup/svd-safety-l2_basis_remove40

## Resumen

svd-safety-l2_basis_remove40 es un checkpoint derivado de meta-llama/Llama-2-7b-chat-hf comprimido mediante Basis Sharing, una tecnica de compresion por descomposicion en valores singulares (SVD) que comparte bases entre grupos de dos capas adyacentes y que fue presentada en ICLR 2025. El autor, Jeesup, elimina el 40,00% de los parametros densos, dejando una fraccion retenida de 0,5999, y despues aplica una recuperacion mediante LoRA de rango 8 restringida unicamente a los coeficientes por capa, manteniendo congeladas las bases compartidas y sin alterar el presupuesto de parametros.

Se trata de un artefacto de investigacion, no de un asistente conversacional desplegable. Forma parte de una malla experimental sobre reglas de seleccion de componentes y presupuestos de compresion, cuyo objetivo es cuantificar como la compresion SVD degrada el comportamiento de seguridad de un modelo alineado y que criterio de recuperacion repara mejor ese dano. La model card advierte explicitamente de que varias celdas de esa malla estan degradadas en seguridad de forma deliberada respecto a Llama-2-7b-chat.

El modelo conserva la arquitectura transformer decoder-only de Llama-2, con licencia Llama 2 Community, pesos en safetensors y 6.738.415.616 parametros segun el recuento de los ficheros de safetensors. Su relevancia es metodologica: ofrece un punto de medida reproducible del compromiso entre seguridad y utilidad bajo compresion, con semilla fija (42) y una receta de recuperacion documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2) con capas comprimidas por SVD y bases compartidas entre pares de capas adyacentes (Basis Sharing) |
| Parametros totales | 6.738.415.616 segun el recuento de safetensors del repositorio; la model card declara una fraccion de parametros retenida de 0,5999 tras eliminar el 40,00% del denso |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens, heredada de Llama-2-7b-chat; no se especifica en la model card |
| Tipos de cuantizacion | no disponible en la model card; el repositorio distribuye pesos sin cuantizar, convertibles a GGUF, AWQ o GPTQ con herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors, cargable con transformers |

## Arquitectura y entrenamiento

La base es un transformer decoder-only con atencion causal y normalizacion RMSNorm, la arquitectura estandar de Llama-2. Sobre esa base se aplica compresion por SVD con la variante Basis Sharing, que agrupa capas de dos en dos y hace que cada par comparta las bases de sus factores, de modo que solo se almacenan los coeficientes especificos de cada capa. La intervencion elimina el 40,00% de los parametros densos, hasta una fraccion retenida de 0,5999. La semilla del proceso es 42.

La recuperacion de capacidad se realiza con un fine-tune LoRA de rango 8 aplicado exclusivamente a los coeficientes por capa: las bases compartidas permanecen congeladas y el presupuesto de parametros no cambia. El entrenamiento de recuperacion dura 2 epocas, con tasa de aprendizaje 0,0001 y tamano de lote 64, sobre el conjunto de datos alpaca-cleaned. No se documentan en la informacion disponible ni el volumen de tokens de preentrenamiento (heredado de Llama-2) ni el uso de RLHF o DPO adicionales mas alla del alineamiento original de Llama-2-7b-chat.

## Capacidades

- Generacion de texto conversacional en formato de instrucciones, heredada de Llama-2-7b-chat.
- Razonamiento basico y respuesta a preguntas de proposito general, con la degradacion esperable por la compresion al 59,99% de parametros.
- Comprension y generacion de codigo de complejidad media, sin garantias de calidad equivalentes al modelo sin comprimir.
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- Capacidades multilingues: no disponibles (la model card no detalla composicion idiomatica; Llama-2-7b-chat esta dominado por el ingles).
- No se documenta modo de pensamiento (thinking), vision ni audio.
- Capacidad instrumental para investigacion: el checkpoint esta disenado para medir el efecto de la compresion sobre la seguridad y para evaluar reglas de seleccion de componentes.

## Casos de uso

- Reproducibilidad de estudios de compresion: sirve como celda concreta de una malla experimental (regla de seleccion fija, presupuesto del 40,00%, semilla 42) para replicar resultados de Basis Sharing y comparar recetas de recuperacion.
- Evaluacion del dano a la seguridad por compresion: con AdvBench ASR de 0,3462 y StrongREJECT ASR de 0,1597 medidos con juez HarmBench, permite cuantificar cuanto empeora la resistencia a ataques al reducir parametros.
- Investigacion sobre sobre-rechazo: con un macro over-refusal de 0,1641 medido con WildGuard, es util para estudiar el equilibrio entre rechazar peticiones daninas y rechazar peticiones legitimas.
- Calibracion de jueces de seguridad: sus salidas pueden usarse como conjunto de respuestas etiquetables para validar clasificadores de contenido o arneses de red-teaming.
- Interpretabilidad de bases SVD: las bases compartidas entre pares de capas adyacentes son un objeto de estudio directo para analizar que subespacios concentran informacion critica de comportamiento.
- Pruebas de metodos de recuperacion con presupuesto fijo: la receta LoRA r=8 solo sobre coeficientes permite comparar tecnicas de ajuste que no incrementan el numero de parametros.
- Docencia y formacion: escenario controlado para explicar en un curso el compromiso entre perplexity (10,7856 en WikiText-2) y seguridad en modelos comprimidos.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,3462 | Tasa de exito de ataque; mas alto es peor |
| StrongREJECT ASR (juez HarmBench) | 0,1597 | Tasa de exito de ataque; mas alto es peor |
| Macro over-rejection (WildGuard) | 0,1641 | Rechazo de peticiones legitimas; mas alto es peor |
| Perplexity en WikiText-2 | 10,7856 | Mas bajo es mejor |

No se han publicado en la informacion disponible valores de MMLU, HumanEval, GSM8K ni de otros benchmarks de capacidad, ni resultados del modelo base sin comprimir que permitan calcular la variacion atribuible a la compresion.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14-16 GB contando pesos (unos 13,5 GB) y cache KV para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7-8 GB; en 4 bits, aproximadamente 4-6 GB.
- Tarjetas recomendadas: A100 40 GB, H100, L40S o RTX A6000 para servicio en fp16. En tarjetas de consumo, RTX 3090, RTX 4090 o RTX 5090 (24 GB o mas) ejecutan el modelo en fp16 sin problemas; RTX 3060 de 12 GB o RTX 4070 permiten inferencia en 4 bits.
- Despliegue: transformers de forma nativa; vLLM o TGI para servicio con batching; llama.cpp u Ollama requieren conversion previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles. La model card no publica mediciones de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks de seguridad en la informacion disponible |
|---|---|---|---|---|---|
| svd-safety-l2_basis_remove40 | 6.738.415.616 segun safetensors; fraccion retenida 0,5999 del denso | 4.096 tokens (heredado) | Llama 2 Community | HuggingFace, pesos safetensors | AdvBench ASR 0,3462; StrongREJECT ASR 0,1597; over-refusal 0,1641; PPL WikiText-2 10,7856 |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | 6.738.415.616 | 4.096 tokens | Llama 2 Community | HuggingFace, pesos safetensors | no disponibles en la informacion proporcionada |
| Mistral-7B-Instruct-v0.3 (alternativa de tamano similar) | 7.240 millones aproximadamente | 32.768 tokens | Apache 2.0 | HuggingFace, pesos safetensors | no disponibles en la informacion proporcionada |

No se han identificado en la informacion disponible otros checkpoints comprimidos por SVD directamente comparables, ni resultados publicados que permitan situar esta celda frente a la malla completa del estudio.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un asistente desplegable. La propia model card pide tratarlo como sujeto experimental y evaluarlo antes de extraer conclusiones.
- La compresion degrada la seguridad de forma medible: la tasa de exito de ataque en AdvBench es de 0,3462, aproximadamente uno de cada tres ataques tiene exito.
- El sobre-rechazo macro es de 0,1641, de modo que el fallo se produce en ambas direcciones: respuestas daninas y rechazos indebidos.
- Riesgo de alucinacion no cuantificado en la informacion disponible; hereda los sesgos y las limitaciones del corpus de Llama-2.
- La model card no detalla los idiomas soportados; se asume un sesgo fuerte hacia el ingles, sin datos que lo confirmen.
- La longitud de contexto no aparece en la model card; el valor de 4.096 tokens es una herencia del modelo base y no una especificacion declarada.
- La licencia Llama 2 Community impone obligaciones de atribucion y restricciones de uso, incluida la clausula de escala (700 millones de usuarios activos mensuales) y las prohibiciones de USE_POLICY.md. Es obligatorio revisar LICENSE.txt y USE_POLICY.md antes de cualquier uso comercial.
- El repositorio no incluye versiones cuantizadas ni ficheros GGUF; cualquier despliegue ligero exige conversion propia y validacion posterior.
- El recuento de parametros de safetensors (6.738.415.616) coincide con el del modelo denso de Llama-2-7b, mientras que la model card declara una fraccion retenida de 0,5999 en los componentes comprimidos; conviene verificar la estructura real de los pesos antes de asumir un ahorro de memoria proporcional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- La busqueda web realizada no devolvio resultados relevantes para este modelo: los enlaces recuperados corresponden a foros y comunidades sin relacion con Basis Sharing, SVD, Llama-2 ni seguridad en modelos de lenguaje. No se dispone por tanto de enlaces a paper, blog, repositorio de codigo ni demo adicionales.
