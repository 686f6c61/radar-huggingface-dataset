# Astromium/gemma-2-2B-it-thinking-function_calling-V0

## Resumen

Astromium/gemma-2-2B-it-thinking-function_calling-V0 es un ajuste fino (fine-tune) del modelo google/gemma-2-2b-it, publicado por el usuario Astromium en HuggingFace. Se trata de un derivado de la familia Gemma 2 de Google, un transformer decoder-only de aproximadamente 2.600 millones de parametros y 8.192 tokens de contexto en su version original. El nombre del repositorio sugiere dos objetivos de especializacion: un modo de razonamiento explicito ("thinking") y soporte de llamada a funciones ("function calling"), aunque la model card no documenta ni el dataset ni el procedimiento concreto empleado para conseguirlos.

El modelo se ha entrenado mediante SFT (supervised fine-tuning) utilizando la libreria TRL de HuggingFace, segun declara la propia model card. No se especifica el conjunto de datos, el numero de pasos, la composicion del corpus ni si hubo una fase posterior de alineacion con RLHF o DPO. El repositorio incluye unicamente pesos en safetensors compatibles con transformers y con la etiqueta endpoints_compatible, lo que indica que puede desplegarse mediante Inference Endpoints de HuggingFace.

La relevancia de esta ficha es limitada pero instructiva: se trata de un modelo con 0 descargas y 0 "likes" en el momento de la consulta, sin licencia declarada y con una model card generada automaticamente por la plantilla de TRL. Resulta util como ejemplo de fine-tune de bajo coste sobre Gemma 2 2B para experimentacion local, pero no existen evidencias publicas de su calidad, de su dataset ni de su rendimiento en tareas de function calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2; atencion local-global alternada, GQA y soft-capping de logits en el modelo base) |
| Parametros totales | ~2.600 millones (heredados del modelo base google/gemma-2-2b-it) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens en el modelo base; no confirmado para este fine-tune |
| Tipos de cuantizacion | no disponible en el repositorio (solo safetensors en precision completa); el modelo base cuenta con conversiones GGUF y AWQ mantenidas por la comunidad |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el campo "licence" de la model card contiene unicamente el placeholder "license"; al derivar de Gemma 2 le aplican los terminos de uso de Gemma) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 2,5 GB (segun HuggingFace) |
| Libreria | transformers |
| Modelo base | google/gemma-2-2b-it |
| Fecha de creacion | 18 de septiembre de 2026 (segun metadatos de HuggingFace) |

Nota: los datos de arquitectura, parametros y contexto corresponden al modelo base google/gemma-2-2b-it, ya que la model card del fine-tune no los especifica. El tamano declarado del repositorio (2,5 GB) no cuadra con los ~5,2 GB esperables para 2.600 millones de parametros en bf16, lo que sugiere o bien una carga incompleta, o bien una precision distinta de la esperada, o un error en los metadatos.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 2B: un transformer decoder-only con atencion por ventana deslizante (sliding window attention) alternada con atencion global, grouped-query attention y soft-capping de logits. El modelo base de Google se entreno con un esquema de destilacion desde modelos mayores de la misma familia y un vocabulario SentencePiece de gran tamano. La model card de este fine-tune no aporta ningun detalle adicional sobre la arquitectura ni sobre si se modificaron capas, cabezas o el tokenizador.

En cuanto al entrenamiento, la unica informacion disponible es que se utilizo SFT con TRL. La model card lista las versiones declaradas del entorno: TRL 1.13.0, Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2. Estas versiones resultan anomalas frente a las publicadas historicamente por esos proyectos, por lo que conviene tratarlas con cautela. No se documenta el dataset de SFT, el numero de tokens de entrenamiento, la estrategia de enmascarado de perdida ni el uso de tecnicas como LoRA o QLoRA; tampoco hay informacion sobre fases de RLHF, DPO o rejection sampling.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modo instruct del modelo base.
- Razonamiento explicito o "thinking": el nombre del repositorio lo sugiere, pero no hay documentacion ni ejemplos que lo confirmen.
- Function calling / tool calling: igualmente sugerido por el nombre, sin evidencia documentada en la model card.
- Comprension y generacion de codigo a nivel basico, limitada por el tamano de 2B parametros.
- Razonamiento matematico elemental, sujeto a la capacidad del modelo base.
- Capacidades multilingues: no disponibles como dato declarado; el modelo base Gemma 2 esta orientado predominantemente al ingles.
- Compatibilidad con el pipeline de transformers y con Inference Endpoints (etiqueta endpoints_compatible).
- No se declaran capacidades de vision, audio ni modos multimodales.

## Casos de uso

- Experimentacion y prototipado local: al ser un modelo de ~2,6B parametros, puede ejecutarse en una GPU de consumo o incluso en CPU con cuantizacion, lo que lo hace adecuado para probar tecnicas de SFT y de prompting sin coste de infraestructura.
- Investigacion sobre function calling en modelos pequenos: permite estudiar si un modelo de 2B puede emitir llamadas a herramientas de forma fiable y comparar contra el modelo base.
- Base para nuevos fine-tunes: sirve como punto de partida (continuar el SFT) para dominios concretos como atencion al cliente o extraccion de datos estructurados.
- Evaluacion de tecnicas de "thinking" o cadenas de razonamiento: util para medir si el formato de razonamiento explicito mejora la precision en tareas aritmeticas o de logica simple.
- Generacion de texto asistida en entornos con recursos muy limitados, como portatiles con GPU de 8 GB o despliegues en el borde.
- Docencia y formacion: ejemplo practico de pipeline TRL + transformers para ensenar ajuste supervisado sobre un modelo abierto.
- Clasificacion y etiquetado de texto a baja escala con prompts controlados, siempre que se validen los resultados por la elevada tasa de alucinacion esperable en 2B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no se ha publicado ningun informe de evaluacion asociado. Tampoco existen datos de latencia o throughput declarados por el autor.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| BFCL / function calling | no disponible |
| Evaluaciones del autor | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 2.600 millones de parametros): ~5,2 GB en bf16/fp16, ~10,4 GB en fp32, ~2,6-3 GB en int8 y ~1,3-1,8 GB en int4.
- Con overhead de KV cache y activaciones, conviene reservar entre 6 y 8 GB de VRAM para bf16 con contexto moderado.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10G). En configuraciones cuantizadas puede caber en 6 GB o incluso en CPU con llama.cpp.
- Cabe sin problemas en GPU de consumo: si, incluidas las gamas medias con cuantizacion.
- Opciones de despliegue: transformers (soporte nativo del repositorio), vLLM, TGI, Ollama o llama.cpp previa conversion a GGUF, y HuggingFace Inference Endpoints (etiqueta endpoints_compatible). Para Ollama o llama.cpp sera necesario generar el GGUF, ya que el repositorio solo contiene safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Astromium/gemma-2-2B-it-thinking-function_calling-V0 | ~2,6B | no confirmado (base: 8K) | no disponible | safetensors en HF, 0 descargas |
| google/gemma-2-2b-it (modelo base) | 2,6B | 8.192 tokens | Terminos de uso de Gemma | safetensors, GGUF comunitario, ampliamente usado |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache-2.0 | safetensors, GGUF, muy extendido |
| Llama-3.2-3B-Instruct | 3,2B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | safetensors, GGUF, ampliamente usado |

La comparativa se limita a caracteristicas estructurales y de licencia, ya que no existen datos de rendimiento publicados para el modelo de Astromium. Frente a las alternativas, destaca negativamente por la ausencia de licencia declarada, la falta de documentacion del entrenamiento y sus cero descargas.

## Limitaciones y advertencias

- No se ha publicado el dataset de SFT, por lo que se desconoce la composicion, el sesgo y la cobertura tematica del ajuste.
- Las capacidades de "thinking" y function calling que sugiere el nombre del repositorio no estan verificadas ni documentadas; no deben asumirse en produccion sin una evaluacion propia.
- Riesgo de alucinacion elevado, tipico de modelos de 2B parametros, especialmente en tareas de razonamiento multi-paso y en la emision de argumentos estructurados.
- La licencia no esta declarada en el repositorio. Al derivar de Gemma 2, en la practica se heredan los terminos de uso de Gemma, que imponen restricciones de uso (por ejemplo, prohibiciones de uso malicioso y obligaciones de atribucion). Cualquier uso comercial debe verificarse contra dichos terminos.
- Contexto limitado a 8.192 tokens en el modelo base, insuficiente para tareas de contexto largo.
- Idiomas soportados sin declarar; cabria esperar un rendimiento notablemente inferior en castellano que en ingles, dado el sesgo del modelo base.
- El tamano declarado del repositorio (2,5 GB) es inconsistente con los pesos esperados de un modelo de 2,6B en bf16, lo que puede indicar una subida incompleta o un error en los metadatos. Conviene verificar los ficheros antes de usarlo.
- Las versiones de framework declaradas (Transformers 5.17.0, PyTorch 2.14.0, TRL 1.13.0) no coinciden con las publicadas historicamente, lo que resta credibilidad a la model card.
- Sin descargas ni evaluaciones de la comunidad: no existe validacion independiente de su comportamiento.
- No se declaran limitaciones de seguridad, filtros de contenido ni mitigaciones de sesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Astromium/gemma-2-2B-it-thinking-function_calling-V0
- Modelo base google/gemma-2-2b-it: https://huggingface.co/google/gemma-2-2b-it
- Repositorio de TRL: https://github.com/huggingface/trl
- Copia espejo en HuggingFace (usuario AaronShih): https://huggingface.co/AaronShih/gemma-2-2B-it-thinking-function_calling-V0
- Copia espejo en HuggingFace (usuario Sora2333): https://huggingface.co/Sora2333/gemma-2-2B-it-thinking-function_calling-V0
