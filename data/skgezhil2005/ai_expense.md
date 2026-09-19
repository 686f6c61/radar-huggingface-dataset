# skgezhil2005/ai_expense

## Resumen

`skgezhil2005/ai_expense` es un ajuste fino (fine-tune) publicado en HuggingFace por el usuario skgezhil2005 sobre el modelo base `unsloth/gemma-3-270m-it`, la variante instruct de 270 millones de parámetros de la familia Gemma 3 de Google. El repositorio contiene 268.098.176 parámetros reales en formato safetensors y está etiquetado con la librería MLX, lo que indica que los pesos están preparados para ejecutarse en Apple Silicon mediante el framework de Apple. El tamaño total del repositorio es de 0,6 GB, coherente con pesos en precisión de 16 bits.

La relevancia de esta ficha es limitada y conviene ser explícito: la model card del autor está prácticamente vacía (solo contiene metadatos YAML), el modelo acumula 0 descargas y 0 likes, y no se ha publicado ninguna descripción de la tarea, del dataset de ajuste ni de los resultados obtenidos. El nombre `ai_expense` sugiere un ajuste orientado a un dominio de gastos o finanzas, pero esto no se puede confirmar con la información disponible.

Por tanto, esta ficha documenta lo que es verificable (tamaño, formato, licencia, modelo base y librería) y marca explícitamente como "no disponible" todo lo que no lo es. Se trata de un modelo de investigación o experimentación personal, no de un artefacto listo para producción sin una validación previa por parte de quien lo vaya a usar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante de texto `gemma3_text`) |
| Parámetros totales | 268.098.176 (~270 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible. El repositorio solo contiene safetensors; no se listan variantes GGUF, MLX cuantizadas ni AWQ/GPTQ |
| Idiomas soportados | No disponible (el campo de idiomas del repositorio está vacío) |
| Licencia | `gemma` (Gemma Terms of Use) |
| Formato de pesos | Safetensors (formato de pesos MLX) |
| Modelo base | `unsloth/gemma-3-270m-it` |
| Tipo de ajuste | Fine-tune del modelo base (`base_model:finetune:`) |
| Librería de inferencia | MLX |
| Pipeline | `text-generation` |
| Tamaño del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna más allá de la etiqueta `gemma3_text`, que identifica la torre de texto de la familia Gemma 3 de Google. Se trata, por tanto, de un transformer decoder-only de 268 millones de parámetros. No hay datos disponibles sobre número de capas, dimensión oculta, número de cabezas de atención, uso de atención local/global, vocabulario ni ventana de contexto efectiva de este checkpoint concreto.

Respecto al entrenamiento, lo único verificable es que se trata de un fine-tune del modelo instruct `unsloth/gemma-3-270m-it` (la etiqueta `base_model:finetune:` lo confirma) y que entre las etiquetas figura `unsloth`, lo que sugiere que el ajuste se realizó con las herramientas de Unsloth, habitualmente mediante LoRA o QLoRA. No se especifica el dataset utilizado, el número de tokens de entrenamiento, la composición de los datos, si hubo RLHF/DPO adicional ni la técnica exacta de ajuste. La existencia del sufijo `ai_expense` apunta a un dominio concreto, pero la model card no lo documenta. Tampoco se describe ninguna innovación técnica propia: el mérito arquitectónico correspondería al modelo base de Google, no a este repositorio.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y el modelo base es una variante instruct, por lo que se espera capacidad de seguir instrucciones y mantener diálogo.
- Razonamiento, matemáticas y código: no disponible. No hay documentación ni benchmarks que confirmen el nivel en estas tareas para este checkpoint.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo pensamiento, visión, audio): no disponible. La etiqueta `gemma3_text` indica que se trata de la variante de solo texto, sin torre de visión.
- Ejecución en Apple Silicon: sí, es la capacidad diferencial derivada de la librería MLX y del formato de pesos safetensors en formato MLX.

Advertencia importante: al no existir model card descriptiva, ninguna de estas capacidades está garantizada por el autor para este fine-tune concreto.

## Casos de uso

- Clasificación de gastos y recibos: un modelo de 270 M puede ajustarse para etiquetar transacciones en categorías contables (comida, transporte, suministros). Su tamaño permite ejecutarlo en local con un coste de cómputo mínimo, aunque la precisión debería validarse con datos propios.
- Extracción de campos estructurados: conversión de texto libre de facturas o notas de gastos a JSON con campos como importe, fecha y comercio. Requiere un esquema de salida fijo y validación posterior obligatoria.
- Prototipado rápido de pipelines de NLP: sirve como modelo de pruebas para validar un flujo completo (tokenización, prompts, evaluación) antes de escalar a un modelo mayor, gracias a que cabe en cualquier equipo.
- Asistente de texto en local sin conexión: aplicaciones de escritorio en macOS que necesiten resúmenes cortos o reformulación de texto sin enviar datos a la nube, aprovechando la integración con MLX y memoria unificada.
- Generación de datos sintéticos para ajuste: producción de ejemplos etiquetados a bajo coste para entrenar o evaluar modelos mayores en el dominio de gastos, siempre con revisión humana del resultado.
- Base para un nuevo fine-tune de dominio: al ser un checkpoint instruct pequeño, es un punto de partida barato para LoRA sobre otras tareas, reduciendo el tiempo de entrenamiento frente a modelos de miles de millones de parámetros.
- Filtrado y enrutado en pipelines RAG: uso como clasificador previo que decida qué consultas requieren un modelo grande y cuáles pueden resolverse con reglas o con el propio modelo pequeño.
- Pruebas de concepto educativas: demostración de ajuste fino y despliegue en Apple Silicon, útil para docencia o para evaluar herramientas como MLX o Unsloth en un entorno controlado.

En todos estos casos debe tenerse en cuenta que no existe evidencia publicada de que el ajuste funcione bien: los casos describen usos plausibles dada la arquitectura y el tamaño, no resultados verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, IFEval ni de ninguna otra evaluación, y la búsqueda web realizada no ha devuelto documentación técnica asociada al modelo (los resultados obtenidos eran de dominios sin relación alguna con el proyecto). Tampoco se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia (estimación calculada a partir del número de parámetros, no publicada por el autor): en fp16/bf16, unos 0,54 GB solo de pesos, aproximadamente 0,8-1,2 GB contando caché KV, activaciones y overhead del runtime.
- Cuantización de 8 bits: en torno a 0,27 GB de pesos, con un total práctico cercano a 0,6 GB.
- Cuantización de 4 bits: en torno a 0,14 GB de pesos, con un total práctico cercano a 0,4 GB.
- GPU recomendadas: no requiere GPU dedicada. Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU. En el caso de MLX, el destino natural es Apple Silicon (familias M1, M2, M3, M4) usando memoria unificada.
- ¿Cabe en GPU de consumo? Sí, en todas las gamas actuales, incluidas las integradas con suficiente memoria compartida.
- Opciones de despliegue: MLX (`mlx-lm`) de forma nativa, dado el formato del repositorio; `llama.cpp` / Ollama / LM Studio mediante conversión a GGUF (no se incluye GGUF en el repositorio); vLLM o TGI serían posibles si el runtime soporta esta variante de Gemma 3, extremo no verificado.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato disponible | Rendimiento publicado |
|---|---|---|---|---|---|
| `skgezhil2005/ai_expense` | 268.098.176 | No disponible | Gemma Terms of Use | Safetensors (MLX) | No disponible |
| `unsloth/gemma-3-270m-it` (modelo base) | ~270 M | No disponible | Gemma Terms of Use | Safetensors (Transformers) | No disponible en la información aportada |
| Otras alternativas de tamaño similar (por ejemplo, familias pequeñas tipo Qwen o SmolLM) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables en la información proporcionada para establecer una comparación cuantitativa de rendimiento con modelos de la misma categoría. Además, la búsqueda web realizada no ha devuelto documentación técnica del modelo ni de sus comparativas, por lo que cualquier cifra de rendimiento añadida aquí sería inventada.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card está vacía, sin descripción de la tarea, del dataset de ajuste ni del procedimiento de entrenamiento. Es imposible saber para qué fue ajustado exactamente ni con qué datos.
- Sin validación externa: 0 descargas y 0 likes en el momento de redactar esta ficha. No hay evidencia de que terceros lo hayan probado.
- Riesgo alto de alucinación: los modelos de ~270 M parámetros tienen una capacidad de razonamiento y de fidelidad factual muy inferior a la de modelos de miles de millones de parámetros; no son adecuados para tareas que exijan precisión alta sin verificación posterior.
- Posibles sesgos: no hay información sobre la composición del dataset de ajuste, por lo que no se puede evaluar ni descartar sesgos de dominio, idioma o contenido.
- Cobertura idiomática desconocida: el repositorio no declara idiomas soportados; no debe asumirse un buen rendimiento en castellano sin probarlo.
- Licencia Gemma: el uso está sujeto a los Gemma Terms of Use, que imponen obligaciones de uso aceptable y de atribución, y que deben revisarse antes de cualquier explotación comercial. No se trata de una licencia Apache o MIT.
- Formato restrictivo: al estar en formato MLX, su uso directo fuera de Apple Silicon requiere conversión previa a otro formato, con el consiguiente riesgo de degradación si se cuantiza.
- Fecha de publicación anómala: el repositorio figura creado y actualizado en septiembre de 2026, con apenas un minuto de diferencia entre ambos sellos, lo que sugiere una subida automatizada o sin revisión manual.
- No apto para producción sin evaluación: cualquier despliegue real debería ir precedido de una evaluación propia sobre el caso de uso concreto y de un mecanismo de validación de salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skgezhil2005/ai_expense
- Modelo base: https://huggingface.co/unsloth/gemma-3-270m-it
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo. Las consultas devolvieron exclusivamente páginas de comercio de prendas de vestir sin relación con el proyecto, por lo que no se incluye ningún enlace adicional.
