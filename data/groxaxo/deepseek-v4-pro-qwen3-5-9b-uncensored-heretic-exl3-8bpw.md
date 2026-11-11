# groxaxo/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-EXL3-8bpw

## Resumen

Esta ficha describe una cuantizacion EXL3 del modelo `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, publicada por el usuario groxaxo bajo licencia Apache-2.0. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada a inferencia eficiente con ExLlamaV3: los pesos lineales principales se almacenan a 8 bits por peso (bpw) como objetivo, con un head de salida tambien a 8 bits, la torre de vision a 6 bits y las capas MTP a 4 bits, mientras que los embeddings de tokens se mantienen en BF16.

El modelo base declara una arquitectura de la familia Qwen 3.5 (tag `qwen3_5`) con 5.336.124.800 parametros reales segun los safetensors del repositorio, pese a que el nombre comercial del checkpoint indica "9B". El repositorio ocupa 10,7 GB y contiene 10.672.495.208 bytes de pesos, coherente con un esquema de cuantizacion mixto que supera la estimacion uniforme de 8 bits por la sobrecarga de embeddings, escalas y metadatos.

La relevancia de esta publicacion es practica: ofrece un artefacto listo para servir con ExLlamaV3 o TabbyAPI, con plantilla de chat y tokenizer originales preservados, y con trazabilidad de la revision de origen (`e4bfa83c...`) y de los argumentos del conversor (1.6.6, codebook `mul1`, calibracion de 250 filas x 2048 tokens). No incluye resultados de benchmarks propios ni validacion de la ventana de contexto completa, la torre de vision o las capas MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen 3.5 (tag `qwen3_5`), con torre de vision y capas MTP segun la model card del conversor |
| Parametros totales | 5.336.124.800 (segun safetensors del repo) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible (la model card indica que la cuantizacion no altera el limite configurado de la arquitectura, pero no se explicita la cifra) |
| Tipos de cuantizacion | EXL3: pesos lineales principales a 8 bpw, head a 8 bits, vision a 6 bits, MTP a 4 bits, embeddings en BF16; codebook `mul1`; escalas automaticas; KV cache Q8 en las pruebas locales |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (ExLlamaV3 / EXL3), 10.672.495.208 bytes |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo base: la model card de esta cuantizacion remite explicitamente a la model card upstream y senala que sus afirmaciones sobre entrenamiento, destilacion y rendimiento son "claims" del autor original, no verificados por esta conversion. Lo unico documentado a nivel tecnico es el proceso de cuantizacion: conversor ExLlamaV3 1.6.6, codebook `mul1`, calibracion con un corpus empaquetado de 250 filas x 2048 tokens y escalas de salida en modo automatico.

El checkpoint base se presenta como un modelo de la familia Qwen 3.5 con componentes adicionales: una torre de vision (cuantizada a 6 bits) y capas MTP (multi-token prediction, a 4 bits). El nombre del repositorio sugiere una ascendencia que incluye `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B`, es decir, un modelo Qwen 3.5 de ~9B (nominal) adaptado o fusionado con pesos asociados a DeepSeek-V4-Pro. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones de atencion mas alla de lo que implica la etiqueta `qwen3_5`. El sufijo "UNCENSORED-heretic" indica un ajuste orientado a eliminar rechazos de contenido, sin que se documenten los metodos concretos empleados.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, segun el pipeline declarado (`text-generation`) y la plantilla de chat original preservada.
- Razonamiento y codigo: capacidad inferida del linaje Qwen 3.5, no verificada por benchmarks en la informacion disponible.
- Vision: el checkpoint incluye una torre de vision cuantizada a 6 bits, aunque la model card advierte que las pruebas de humo no validan dicha torre.
- Prediccion multi-token (MTP): presente como capas cuantizadas a 4 bits, sin validacion documentada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el campo de idiomas del repositorio esta vacio.
- Modo "uncensored": el ajuste heretic del modelo base busca reducir rechazos, pero no se documenta su alcance ni su metodologia.
- Thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de chat con ExLlamaV3 o TabbyAPI: cargar la carpeta directamente con ExLlamaV3 1.6.6 permite servir un asistente conversacional en una unica GPU, usando la plantilla de chat original incluida y KV cache Q8.
- Prototipado de asistentes sin filtros editoriales: el ajuste "heretic" del modelo base lo hace adecuado para entornos de investigacion donde se necesita estudiar el comportamiento del modelo ante prompts que otros checkpoints rechazan, siempre con las salvaguardas externas oportunas.
- Experimentacion con cuantizacion mixta: util para evaluar el impacto de 8 bpw en pesos lineales frente a 6 bits en vision y 4 bits en MTP, comparando calidad y uso de memoria con el checkpoint BF16 de origen.
- Generacion de texto por lotes en pipelines offline: el formato EXL3 y el backend ExLlamaV3 permiten throughput alto en tareas de continuacion de texto, resumen o clasificacion generativa sobre corpus grandes.
- Evaluacion de linajes Qwen 3.5 fusionados: sirve como artefacto reproducible (revision fijada, `conversion.json` con checksums) para estudiar el comportamiento de modelos Qwen 3.5 con pesos de otras familias.
- Banco de pruebas de vision en modelos cuantizados: permite medir la degradacion de la torre de vision a 6 bits frente al original, aunque requiere validacion adicional porque la model card no la cubre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona pruebas de humo (`smoke-test.json`) de generacion de texto corta y determinista, que el propio autor aclara que no constituyen un benchmark de codigo ni validan la ventana de contexto completa, la torre de vision ni las capas MTP.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 10,7 GB en disco; con KV cache Q8 y contexto moderado, se puede estimar un consumo en torno a 11-13 GB de VRAM, aunque la cifra exacta depende de la longitud de contexto y de que componentes se carguen (la model card lo indica explicitamente).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para contexto moderado; A100 40/80 GB o H100 para contextos largos y mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas, siempre que se limite el contexto y la KV cache; en 12 GB el margen es muy ajustado.
- Opciones de despliegue: ExLlamaV3 1.6.6 (libreria declarada) y backends compatibles como TabbyAPI. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| groxaxo/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-EXL3-8bpw | 5.336.124.800 | no disponible | EXL3 safetensors, 8 bpw mixto | Apache-2.0 | Objeto de esta ficha; 0 descargas y 0 likes en el momento de la consulta |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | no disponible | no disponible | Pesos originales (BF16 presumiblemente) | Apache-2.0 (declarada) | Modelo base de esta cuantizacion; referencia para comparar calidad |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | no disponible | no disponible | no disponible | no disponible | Ascendencia del modelo base segun la model card |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El nombre comercial "9B" no coincide con los 5.336.124.800 parametros reales del repositorio; conviene usar la cifra de safetensors para planificar memoria.
- La model card advierte que las afirmaciones de entrenamiento, destilacion y rendimiento del modelo upstream no han sido verificadas por el autor de la cuantizacion.
- Las pruebas de humo no validan la ventana de contexto completa, la torre de vision ni las capas MTP; no hay garantia de que estos componentes funcionen correctamente tras la cuantizacion.
- El ajuste "UNCENSORED-heretic" reduce los rechazos del modelo base, lo que implica un riesgo elevado de generar contenido inapropiado o danino; requiere filtros y politicas de uso externas en cualquier despliegue real.
- Riesgo de alucinacion no cuantificado: no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Idiomas soportados no declarados; no se puede asumir un rendimiento multilingue concreto.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo upstream y no cubre posibles reclamaciones sobre los datos de entrenamiento originales.
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- El formato EXL3 limita el despliegue a ExLlamaV3 y backends compatibles; no es portable a llama.cpp, Ollama o vLLM sin reconversion.
- La fecha de creacion del repositorio (2026-11-11) es posterior a la de la mayoria de checkpoints publicos; conviene verificar la integridad de los pesos antes de usarlos en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/groxaxo/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-EXL3-8bpw
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Revision del modelo base citada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic/tree/e4bfa83c72896cbb4990c909967d6f27bb97bac4
- Ascendencia declarada: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- ExLlamaV3 (libreria de inferencia): no se proporciona enlace en la informacion disponible
- TabbyAPI (backend compatible): no se proporciona enlace en la informacion disponible
