# moon70/Qwen3.8-27B-heretic-mpoa

## Resumen

Qwen3.8-27B-heretic-mpoa es un ajuste fino del modelo Qwen/Qwen3.8-27B publicado por el usuario moon70 en HuggingFace. Se trata de una variante "abliterated" o "uncensored": el autor ha aplicado una tecnica de ablacion direccional (Heretic 2.0.0, concreta­mente MPOA: direccion ortogonalizada, normalizacion completa de filas y LoRA de rango 3) sobre las proyecciones `o_proj` y `down_proj` de cada capa para reducir la tasa de rechazos del modelo base ante peticiones clasificadas como daninas. El resultado es un modelo que conserva practicamente intactas las capacidades del original (MMLU 0,836 frente a 0,834; GSM8K 0,963 frente a 0,965) pero que rechaza muchas menos solicitudes.

El modelo mantiene la arquitectura y el pipeline del base: es un modelo multimodal de tipo image-text-to-text, con 27.356.728.560 parametros totales (unos 27,36 mil millones) y pesos en safetensors de aproximadamente 54,7 GB en el repositorio. La licencia declarada es Apache 2.0, heredada del modelo base. La relevancia de esta ficha es doble: por un lado documenta una tecnica de "desbloqueo" cada vez mas extendida en el ecosistema open source; por otro, advierte de que se trata de un modelo publicado sin datos de benchmarks propios completos, sin idiomas declarados y sin historial de descargas ni validacion comunitaria.

Conviene subrayar que la model card es muy escueta y que la mayor parte de la informacion tecnica del modelo base (Qwen3.8-27B) no se reproduce en el repositorio. Todo lo que no aparece explicitamente en la informacion disponible se marca como "no disponible" en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.8-27B; detalles internos no disponibles |
| Parametros totales | 27.356.728.560 (≈27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal de unos 27,36 mil millones de parametros. Sobre ese base, el autor aplica una intervencion de edicion de pesos, no un entrenamiento clasico: la tecnica Heretic 2.0.0 con MPOA (direccion ortogonalizada, normalizacion completa de filas y LoRA de rango 3) calcula direcciones de rechazo por capa y las resta de las matrices `o_proj` y `down_proj`. Es un procedimiento de ablacion direccional que modifica los pesos del modelo sin reentrenar el modelo completo; el uso de LoRA de rango 3 sugiere que la perturbacion se aplica como una actualizacion de bajo rango sobre los pesos originales.

El autor documenta el efecto de la intervencion en terminos de divergencia KL: 0,052 en el primer token sobre `harmless_alpaca`, lo que indica que la distribucion de salida se aparta poco del modelo base en prompts benignos. No se proporcionan datos sobre el dataset de entrenamiento del modelo base, el numero de tokens vistos, ni si hubo RLHF o DPO; esa informacion corresponderia a la model card de Qwen3.8-27B, que no se incluye en la informacion disponible. Tampoco se detalla si la ablacion se aplico de forma uniforme o con umbrales por capa mas alla de la mencion a "per-layer refusal directions".

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), lo que permite entrada de imagenes junto a prompts textuales.
- Razonamiento y matematicas: el autor reporta GSM8K de 0,963 en modo estricto y 0,965 en flexible, practicamente identico al base.
- Conocimiento general: MMLU de 0,836 en un subconjunto de 1.425 items a 5-shot.
- Reduccion de rechazos: la tasa de rechazo en el conjunto de 100 comportamientos daninos de Heretic baja de 98/100 a 40/100, y la tasa de rechazo por palabra clave en JailbreakBench cae del 94 % al 43 %.
- No se documenta soporte explicito de tool calling, function calling ni modo de razonamiento (thinking); no disponible.
- No se documenta soporte de audio ni de agentes multi-paso; no disponible.
- Capacidades multilingues: no disponibles (el repositorio no declara idiomas).

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como caso de estudio controlado para medir como una ablacion direccional afecta a la tasa de rechazos manteniendo el rendimiento en MMLU y GSM8K; util para comparar tecnicas de edicion de pesos frente a fine-tuning con DPO.
- Evaluacion de robustez de filtros de seguridad: al reducir los rechazos por palabra clave al 43 %, permite probar clasificadores de contenido y sistemas de moderacion externos que no dependan del propio modelo para negarse.
- Generacion de codigo y matematicas en entornos de investigacion: con GSM8K cercano al base, puede usarse para experimentos de razonamiento aritmetico donde se quiera evitar que el modelo se niegue por motivos espurios.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede emplearse para extraer y describir contenido de capturas, diagramas o formularios en pipelines de investigacion, siempre con revision humana.
- Conversacion multi-turno con contexto largo: adecuado para prototipos de asistentes conversacionales donde se priorice la continuidad del dialogo, aunque la longitud de contexto no esta documentada y debe verificarse contra el modelo base.
- Analisis de sesgos y contenido sensible: util para estudiar como se comporta un modelo sin capa de rechazo aprendida ante prompts eticos ambiguos, incluidos los "moral reframes" que el autor reporta en 24 de 100 prompts de JailbreakBench.
- Experimentos de destilacion o evaluacion comparativa: como variante del base, permite aislar el efecto de la ablacion en benchmarks estandar sin cambiar la arquitectura ni el tokenizador.

## Benchmarks y rendimiento

Los unicos datos disponibles son los que reporta el autor en la model card, comparando el modelo con su base:

| Benchmark | Base (Qwen3.8-27B) | Este modelo |
|---|---|---|
| Heretic refusals (100 harmful_behaviors) | 98/100 | 40/100 |
| KL divergence, primer token (harmless_alpaca) | 0 | 0,052 |
| JailbreakBench harmful, rechazo por palabra clave | 94 % | 43 % |
| MMLU (subconjunto de 1.425 items, 5-shot) | 0,834 | 0,836 |
| GSM8K (400 problemas), estricto / flexible | 0,965 / 0,965 | 0,963 / 0,965 |

No se han publicado resultados de benchmarks adicionales (HumanEval, MMMU, MT-Bench, etc.) en la informacion disponible. El propio autor advierte que el conteo de rechazos por palabra clave infravalora los rechazos suaves: 24 de los 100 prompts daninos de JailbreakBench recibieron reformulaciones morales sin cumplir, por lo que la tasa real de rechazo es superior al 43 %.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 54,7 GB solo de pesos, mas overhead de activaciones y KV cache; en la practica requiere 60-70 GB o mas segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 28-30 GB; en 4 bits, en torno a 15-17 GB. Estas cifras son estimaciones a partir del numero de parametros, ya que el repositorio no publica cuantizaciones.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16 sin cuantizar; A100 40 GB o dos RTX 4090 en paralelo para 8 bits; una RTX 4090 (24 GB) o RTX 3090 podria alojar una cuantizacion de 4 bits, aunque no hay pesos GGUF publicados.
- No cabe en GPU de consumo en BF16. En cuantizacion de 4 bits podria caber en RTX 4090/3090, siempre que se generen los pesos cuantizados a partir de los safetensors.
- Opciones de despliegue: el autor indica cargar con `AutoModelForImageTextToText` y `device_map="cuda"` mediante transformers. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama; al no haber GGUF, llama.cpp y Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-heretic-mpoa (este) | 27,36 B | no disponible | Apache 2.0 | Base con ablacion direccional; rechazos reducidos; MMLU 0,836, GSM8K 0,963 |
| Qwen/Qwen3.8-27B (base) | 27,36 B | no disponible | Apache 2.0 | Modelo original; rechazos 98/100 en Heretic; MMLU 0,834, GSM8K 0,965 |
| Otras variantes "abliterated" de la familia Qwen | no disponible | no disponible | habitualmente Apache 2.0 | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de benchmarks de terceros ni de otras variantes comparables en la informacion proporcionada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- El modelo ha sido modificado deliberadamente para reducir rechazos; puede generar contenido danino, ofensivo o inseguro. No es apto para produccion sin filtros externos de moderacion.
- El autor reconoce que la metrica de rechazo por palabra clave no captura rechazos suaves: 24 de 100 prompts de JailbreakBench recibieron reformulaciones morales sin cumplir, por lo que la tasa real de rechazo es superior al 43 % reportado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la ablacion introduce una divergencia KL de 0,052 en el primer token, lo que indica un cambio pequeno pero no nulo en la distribucion de salida.
- Sesgos conocidos: no documentados. Al eliminar direcciones de rechazo, es plausible que se amplifiquen sesgos presentes en el modelo base, pero no hay evaluacion publicada.
- Idiomas soportados: no declarados en el repositorio; deben verificarse contra el modelo base antes de usarlo en produccion multilingue.
- Longitud de contexto: no documentada; debe consultarse la model card de Qwen3.8-27B.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal y etica del contenido generado; el modelo base puede tener terminos adicionales que conviene revisar.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni reportes independientes de calidad.
- El repositorio no incluye cuantizaciones GGUF, AWQ ni GPTQ; desplegarlo en hardware de consumo exige convertirlo previamente.
- La fecha de creacion (2026-11-04) y la denominacion "Qwen3.8" deben tratarse con cautela: conviene confirmar la existencia y las caracteristicas del modelo base antes de integrarlo en un pipeline.

## Enlaces

- HuggingFace: https://huggingface.co/moon70/Qwen3.8-27B-heretic-mpoa
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (proyecto de ablacion direccional): no disponible en la informacion proporcionada
- Paper o blog de MPOA: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
