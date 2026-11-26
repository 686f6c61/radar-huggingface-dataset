# mr-andrey-isachenko/Tenet-Qwen3-14B-Abliterated-Unslop-v2-GGUF

## Resumen

Tenet-Qwen3-14B-Abliterated-Unslop-v2-GGUF es la distribución en formato GGUF de las cuantizaciones oficiales para llama.cpp del modelo Tenet-14B-Qwen3-Unslop-v2, un fine-tune quirúrgico del Qwen3-14B de Alibaba. El autor, mr-andrey-isachenko, aplica su motor Lancet para eliminar el comportamiento de rechazo (de-refusal, "abliteration") y el denominado "slop" conversacional, es decir, respuestas excesivamente cautas, evasivas o rellenas de fórmulas vacías. El resultado es un modelo de 14.768.307.200 parámetros orientado a conversación, código, uso de herramientas y flujos agénticos sin las restricciones de alineación típicas del modelo original.

La relevancia de esta ficha no está en el modelo base, sino en el método de cuantización: en lugar de un `llama-quantize` uniforme, se emplea una receta de precisión mixta guiada por CKA (análisis de similitud de representaciones) que protege a alta tasa de bits las capas donde reside el subespacio intervenido. Según la model card, esto evita que el comportamiento de rechazo y el "slop" reaparezcan tras cuantizar a 4-6 bits, un problema habitual en modelos ablacionados.

El repositorio ocupa 56,5 GB e incluye cinco niveles de cuantización entre IQ4_XS (8,59 GB) y Q8_0 (15,70 GB). La licencia declarada es Apache 2.0 y los pesos están pensados para ejecutarse en llama.cpp, Ollama, LM Studio y Jan. No hay datos publicados sobre idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-14B); detalles de atención y capas no disponibles |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de llama-cli usa `-c 16384` |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (precisión mixta guiada por CKA, ~5,014 bpw de media) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo deriva de Qwen3-14B, un transformer decoder-only de 14,8 mil millones de parámetros. Sobre esa base, el autor aplica el pipeline Tenet "Lancet", descrito como un fine-tune quirúrgico de de-refusal y de-slop: identifica y modifica el subespacio de activaciones asociado a las respuestas de rechazo y a los patrones conversacionales indeseados, en lugar de reentrenar el modelo completo. La model card no detalla el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO; esos datos no están disponibles.

La innovación técnica de esta distribución es la receta de cuantización `cka_quant_recipe.json`, que asigna precisiones distintas por capa en función de su contribución al subespacio intervenido. Las capas seleccionadas como quirúrgicas son 10, 11, 12, 13, 18 y 22; se fijan en Q8_0 las capas 0, 11, 12, 18 y 39, y en Q6_K las capas 10, 13 y 22. La tasa media resultante es de 5,014 bits por peso. El autor menciona además la congelación del router y de los expertos compartidos para checkpoints MoE, aunque el modelo base declarado no es MoE, por lo que ese punto parece herencia de la receta general.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo sin rechazos ni fórmulas evasivas.
- Generación y asistencia de código, según la etiqueta `coding` de la model card.
- Uso de herramientas y function calling, según la etiqueta `tool-use`.
- Flujos agénticos y razonamiento multi-paso, según la etiqueta `agentic`.
- Compatibilidad con endpoints, según la etiqueta `endpoints_compatible`.
- Capacidad multilingüe: no disponible (no se declaran idiomas).
- Modo thinking, visión o audio: no disponible (no se documentan en la model card).

## Casos de uso

- Asistente conversacional sin fricción en productos de ocio o rol: el modelo mantiene conversaciones multi-turno sin las evasivas del Qwen3-14B original, lo que resulta adecuado para diálogos largos donde los rechazos rompen la experiencia.
- Generación de código en local: con 14,8 mil millones de parámetros y cuantización Q4_K_M de 9,24 GB, puede integrarse en un IDE o pipeline de CI/CD en una estación de trabajo con GPU de consumo, usando llama.cpp u Ollama como servidor.
- Automatización agéntica con tool calling: las etiquetas `agentic` y `tool-use` indican soporte para invocar funciones; encaja en orquestadores que necesiten un modelo local sin dependencia de API externa.
- Prototipado de aplicaciones sobre LM Studio o Jan: el formato GGUF y la búsqueda por nombre en LM Studio permiten probar el modelo sin escribir código de despliegue.
- Investigación sobre alineación y cuantización: el par (modelo ablacionado, receta CKA) sirve para estudiar cómo la precisión mixta preserva o degrada intervenciones en el espacio de activaciones.
- Despliegue en portátiles con VRAM limitada: la variante IQ4_XS de 8,59 GB cabe en GPUs de 12 GB y permite inferencia local en equipos consumer.
- Evaluación comparativa de refusal: útil como contrapunto "sin censura" frente al Qwen3-14B original en pruebas de robustez y seguridad de sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: IQ4_XS ~8,59 GB de pesos; Q4_K_M ~9,24 GB; Q5_K_M ~10,71 GB; Q6_K ~12,26 GB; Q8_0 ~15,70 GB. Añadir entre 1 y 3 GB para caché KV según contexto (el ejemplo usa 16.384 tokens).
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 con contexto largo; RTX 4080/4070 Ti Super (16 GB) para Q6_K; RTX 4070/4060 Ti (12-16 GB) para Q4_K_M y Q5_K_M; GPUs de 8-12 GB para IQ4_XS.
- Cabe en GPU de consumo: sí, desde IQ4_XS en 12 GB hasta Q8_0 en 24 GB. En 8 GB solo con cuantizaciones inferiores no listadas o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (`ollama run hf.co/...:Q4_K_M`), LM Studio y Jan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-Qwen3-14B-Abliterated-Unslop-v2-GGUF | 14,77 B | no disponible (ejemplo a 16k) | Apache 2.0 | GGUF | Ablacionado y de-slop, cuantización CKA |
| Qwen/Qwen3-14B | 14,8 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo original alineado, con rechazos |
| Tenet-14B-Qwen3-Unslop-v2 | 14,8 B | no disponible | Apache 2.0 | safetensors | Checkpoint padre sin cuantizar |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo ablacionado: la eliminación del comportamiento de rechazo reduce las salvaguardas del Qwen3-14B original; puede producir contenido que el modelo base rechazaría. Requiere filtros propios en producción.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; al ser un fine-tune quirúrgico, la degradación de capacidades factuales no está medida.
- Idiomas: no se declaran idiomas soportados; el comportamiento multilingüe es incierto.
- Contexto: la model card no especifica la ventana máxima; el ejemplo de 16.384 tokens es una elección del autor, no una garantía.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni asume responsabilidad sobre el contenido generado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes independientes de calidad.
- La receta de cuantización menciona router y expertos MoE, pero el modelo base no es MoE; conviene verificar la coherencia de la receta antes de confiar en ella para otros checkpoints.

## Enlaces

- Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-Qwen3-14B-Abliterated-Unslop-v2-GGUF
- Modelo base (checkpoint padre): https://huggingface.co/mr-andrey-isachenko/Tenet-14B-Qwen3-Unslop-v2
- Modelo original: https://huggingface.co/Qwen/Qwen3-14B
- Receta de cuantización: `cka_quant_recipe.json` en el repositorio de Hugging Face
- Ollama: `ollama run hf.co/mr-andrey-isachenko/Tenet-Qwen3-14B-Abliterated-Unslop-v2-GGUF:Q4_K_M`
