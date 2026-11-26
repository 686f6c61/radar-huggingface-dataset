# lightontech/Nanbeige4.3-33B-MLX-8bit

## Resumen

Nanbeige4.3-33B-MLX-8bit es una conversión no oficial a formato MLX de 8 bits del modelo Nanbeige4.3-33B, realizada por Lighton Tech para su ejecución en hardware Apple Silicon. El modelo original, desarrollado por el equipo Nanbeige, es un transformer de 33.118.977.024 parámetros (aproximadamente 33,1 mil millones) con licencia Apache-2.0, orientado a generación de texto conversacional y razonamiento en inglés y chino. Esta versión cuantizada reduce el peso de 66 GB en bf16 a 33 GB, manteniendo el tokenizador y la plantilla de chat intactos.

La relevancia de esta conversión radica en que permite ejecutar un modelo de 33B en equipos Mac con memoria unificada, algo impracticable con los pesos originales en bf16 para la mayoría de configuraciones de consumo. La cuantización affine de 8 bits con grupo de tamaño 64 (8,5 bits por peso) busca un equilibrio entre fidelidad numérica y huella de memoria, y el autor reporta unos 24 tokens por segundo en un Mac Studio M5 Ultra con 256 GB. El modelo base incorpora modo de razonamiento explícito (``) y soporte de tool calling en formato XML compatible con Qwen3-Coder.

No se han publicado en la información disponible datos sobre arquitectura interna detallada (tipo de atención, número de capas, dimensión oculta), composición del dataset de entrenamiento ni resultados de benchmarks del modelo original. Esta ficha se limita a los datos verificables de la conversión y del modelo base según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia llama según tags; detalles internos no disponibles) |
| Parametros totales | 33.118.977.024 (33,1B) |
| Parametros activos | no disponible (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64 (8,5 bits por peso); pesos originales en bf16 |
| Idiomas soportados | en, zh (inglés y chino; el autor reporta pruebas también en vietnamita) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia llama según las etiquetas del repositorio. Se trata de un transformer de 33,1 mil millones de parámetros, sin indicios de ser un modelo de mezcla de expertos (no se reportan parámetros activos). Tampoco se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto soportada.

Respecto al entrenamiento, la model card de esta conversión remite al modelo original y no incluye datos sobre número de tokens, composición del dataset, fases de RLHF o DPO, ni innovaciones técnicas de entrenamiento. La conversión realizada por Lighton Tech únicamente cuantiza los pesos con mlx-lm 0.32.0 y mlx 0.32.4, manteniendo sin cambios el tokenizador y la plantilla de chat del modelo fuente (revisión df919e1 en bf16). El autor indica explícitamente que no volvió a ejecutar los benchmarks originales sobre esta conversión.

## Capacidades

- Generación de texto conversacional en inglés y chino, con soporte adicional probado en vietnamita por el autor de la conversión.
- Modo de razonamiento explícito mediante etiquetas ``, activable o desactivable con el parámetro `enable_thinking` (por defecto activado).
- Tool calling / function calling con dos formatos: XML (por defecto, recomendado) y JSON. El formato XML es compatible con el parser de herramientas `qwen3_coder` y el parser de razonamiento `qwen3`.
- Soporte de agentes y uso multi-turno de herramientas, con la opción `preserve_thinking` para conservar el razonamiento de turnos anteriores (recomendado `true` en agentes y tool use).
- Separación del razonamiento respecto de la respuesta final, facilitando el filtrado y la presentación en producción.
- Streaming y no streaming en la generación, según las pruebas del autor.
- Servidor compatible con la API de OpenAI mediante `mlx_lm.server`.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar diálogos multi-turno en inglés y chino ejecutándose íntegramente en un Mac con memoria unificada suficiente (unos 35 GB de pico para prompt corto más KV cache), sin depender de servicios en la nube.
- Agente con tool calling en flujos multi-paso: gracias al soporte de formato XML compatible con Qwen3-Coder y a `preserve_thinking`, puede integrarse en pipelines de agentes que encadenan llamadas a funciones y conservan el razonamiento entre turnos.
- Automatización de tareas de razonamiento con trazas auditables: el modo `enable_thinking` permite obtener el razonamiento separado de la respuesta, útil para depuración, evaluación o registro de decisiones en sistemas internos.
- Prototipado rápido en Apple Silicon: la conversión MLX permite a desarrolladores probar un modelo de 33B en local con `mlx_lm.generate` o `mlx_lm.server`, reduciendo el ciclo de iteración frente a despliegues en GPU dedicada.
- Servicio interno compatible con OpenAI: mediante `mlx_lm.server` se puede exponer el modelo con una API compatible, facilitando la integración en aplicaciones existentes que ya consumen endpoints tipo OpenAI.
- Procesamiento de documentación bilingüe inglés-chino: el soporte nativo de ambos idiomas lo hace adecuado para resúmenes, extracción o generación de contenido en entornos con documentación en esas dos lenguas.
- Evaluación comparativa de cuantización: útil para investigadores que quieran medir la degradación de un modelo de 33B al pasar de bf16 a 8-bit affine en MLX, dado que el autor no reejecutó los benchmarks originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la conversión indica explícitamente que no volvió a ejecutar los benchmarks originales sobre esta versión cuantizada, y la información proporcionada no incluye cifras de MMLU, HumanEval, GSM8K ni de otras evaluaciones del modelo base.

Los únicos datos de rendimiento disponibles son de inferencia, medidos por el autor en un Mac Studio M5 Ultra (256 GB) con mlx-vlm 0.7.8:

| Metrica | Valor |
|---|---|
| Throughput de generación (1 request) | ~24 tokens/s |
| Memoria pico (prompt corto) | ~35 GB |
| KV cache | ~0,2 MB por token en bf16 |

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 35 GB de pico para prompt corto con la cuantización de 8 bits, más el KV cache (~0,2 MB por token en bf16). El repositorio ocupa 35,2 GB.
- Hardware probado: Mac Studio M5 Ultra con 256 GB de memoria unificada.
- Cabe en Apple Silicon de gama alta con al menos 48-64 GB de memoria unificada para prompts moderados; en configuraciones de 32 GB el margen es muy ajustado o insuficiente.
- No está pensado para GPU NVIDIA: el formato es MLX, específico de Apple Silicon. Para CUDA habría que usar los pesos originales en bf16 o generar una cuantización GGUF/AWQ propia.
- Opciones de despliegue: `mlx_lm.generate` (CLI), `mlx_lm.server` (API compatible con OpenAI) y la librería Python `mlx_lm`. El autor reporta pruebas con mlx-vlm 0.7.8.
- Latencia y throughput: ~24 tokens/s en un solo request según el autor; no se dispone de datos de concurrencia ni de batching.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de sus alternativas en la información proporcionada, por lo que la comparación se limita a características estructurales verificables. Se incluyen alternativas de tamaño similar y licencia permisiva como referencia, con datos de sus respectivas fichas públicas cuando se conocen; los campos no verificados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato/ecosistema | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-MLX-8bit | 33,1B | no disponible | Apache-2.0 | MLX (Apple Silicon) | Conversión no oficial de Lighton Tech; 8-bit, 33 GB |
| Nanbeige4.3-33B (original) | 33,1B | no disponible | Apache-2.0 | safetensors bf16 | Modelo fuente; 66 GB en bf16 |
| Qwen3-32B | 32,8B | 32.768 tokens (extensible) | Apache-2.0 | safetensors, GGUF, MLX | Ecosistema amplio; tool calling y modo thinking |
| Gemma 3 27B | 27B | 128.000 tokens | Gemma license | safetensors, GGUF | Multimodal; licencia no Apache |

La comparación con Qwen3-32B es especialmente relevante porque el formato de tool calling XML de Nanbeige4.3 es compatible con el parser `qwen3_coder`, lo que sugiere un diseño de plantilla de chat alineado con el ecosistema Qwen. No obstante, sin benchmarks publicados no es posible establecer comparaciones de calidad entre ambos.

## Limitaciones y advertencias

- Conversión no oficial: Lighton Tech no está afiliado ni respaldado por el equipo Nanbeige; la responsabilidad sobre la fidelidad de la cuantización recae en el conversor.
- No se han reejecutado los benchmarks originales sobre esta versión de 8 bits, por lo que se desconoce la degradación real respecto al modelo en bf16.
- La cuantización de 8 bits con group size 64 introduce pérdida numérica frente a bf16; tareas sensibles a precisión (matemáticas, código complejo) pueden verse afectadas sin datos que lo cuantifiquen.
- Idiomas soportados oficialmente: inglés y chino. El vietnamita se reporta como probado por el autor, pero no consta como idioma oficial del modelo base. El rendimiento en castellano no está documentado.
- Longitud de contexto no disponible en la información; no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Riesgo de alucinación inherente a los modelos de lenguaje; el modo de razonamiento explícito no elimina este riesgo.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la propiedad intelectual de los pesos permanece con los autores de Nanbeige; conviene conservar los avisos de atribución.
- Dependencia de Apple Silicon: el formato MLX no es portable a CUDA ni a CPU convencional sin reconversión.
- Uso de memoria elevado (~35 GB de pico): inviable en Mac con menos de 48 GB de memoria unificada para prompts moderados.
- Sin datos de concurrencia ni batching: el throughput de ~24 tokens/s corresponde a un único request y no debe extrapolarse a cargas de producción concurrentes.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/lightontech/Nanbeige4.3-33B-MLX-8bit
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Revisión concreta del modelo base usada en la conversión: https://huggingface.co/Nanbeige/Nanbeige4.3-33B/tree/df919e1e2cf077a22204c78b6c826bf3db18bc08
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Librería mlx: https://github.com/ml-explore/mlx
- Paper, blog o demo del modelo original: no disponible en la información proporcionada.
