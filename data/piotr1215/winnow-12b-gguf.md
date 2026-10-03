# Piotr1215/Winnow-12B-GGUF

## Resumen

Winnow-12B-GGUF es una cuantización Q4_K_M del modelo EldanRing/Winnow-12B, un ajuste fino de Gemma 4 12B IT orientado a decisiones tipadas. Lo publica Piotr1215 en Hugging Face con licencia Apache-2.0. El modelo base se distribuye en BF16 y Q8_0; este repositorio añade un único archivo GGUF de 7,38 GB (Q4_K_M) pensado para inferencia local.

El problema que resuelve es la clasificación y la toma de decisiones con etiquetas discretas: en lugar de generar texto libre, se solicita un único token con log probabilities y se comparan las probabilidades de las etiquetas. Esto permite usarlo como clasificador de relevancia para RAG, filtrado de correo, decisiones con opciones descritas o preguntas de sí/no. Su relevancia actual es que cabe en una GPU de 12 GB con offload completo y Ollama lo carga en 8,0 GB, según la model card. No se dispone de datos sobre longitud de contexto ni idiomas soportados.

La evaluación publicada lo compara con gemma4:12b stock en Q4_K_M sobre 344 elementos privados y sintéticos: 329 aciertos frente a 325, con latencia p50/p95 de 222/622 ms en una RTX 5070 Ti Laptop. El intervalo bootstrap pareado del 95% para la diferencia de exactitud es de -0,6 a +2,9 puntos, por lo que el autor lo interpreta como paridad con mejora en el conjunto de acciones. La pérdida de cuantización frente a BF16 o Q8_0 no se ha medido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4, según la model card; no se detallan capas, atención ni otras variantes |
| Parámetros totales | 11.907.350.576 (≈11,9 mil millones) |
| Parámetros activos | no aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M en este repositorio; BF16 y Q8_0 en el modelo base EldanRing/Winnow-12B |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0, según la model card; ver limitaciones y advertencias |
| Formato de pesos | GGUF, archivo Winnow-12B-Q4_K_M.gguf de 7,38 GB |
| Modelo base | EldanRing/Winnow-12B |
| Pipeline declarado | text-classification |

## Arquitectura y entrenamiento

No se detallan en la información disponible el número de capas, el tipo de atención, el dataset de entrenamiento, el número de tokens ni si hubo RLHF, DPO u otras fases de alineamiento. Se sabe que el modelo base es un fine-tune de Gemma 4 12B IT para decisiones tipadas y que este repositorio es una cuantización Q4_K_M realizada con llama-quantize a partir de Winnow-12B-BF16.gguf, usando llama.cpp en el commit 911f6cd. El proceso convirtió 22.713 MiB a 16,00 bits por peso en 7.024 MiB a 4,95 bits por peso.

El servidor de inferencia propio del proyecto, winnow-inference, añade una API de decisiones tipadas, pero no se probó con esta cuantización. Tampoco se probó visión con mmproj-Winnow-12B.gguf; este archivo GGUF es solo texto. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Clasificación de decisiones tipadas: se solicita un único token con log probabilities (`num_predict: 1`, `logprobs: true`, `top_logprobs: 20`, `think: false`) y se comparan las probabilidades de las etiquetas.
- Clasificación binaria sí/no.
- Puntuación de relevancia para RAG: evaluado en un conjunto privado de 70 elementos.
- Clasificación de correo: newsletter o no; evaluado en 55 elementos.
- Detección de correo que requiere acción o no: evaluado en 60 elementos.
- Decisiones con tres opciones descritas: evaluado en 144 elementos.
- Generación de texto conversacional: el tag conversational aparece en la ficha, pero no se documentan capacidades adicionales de generación abierta.
- Tool calling / function calling: no documentado.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponible.
- Visión: no soportada en esta cuantización; el mmproj del modelo base no se probó con este archivo.
- Modo thinking: no documentado; el ejemplo de lectura de decisiones usa `think: false`.

## Casos de uso

- Clasificación de relevancia en RAG: el modelo puede decidir si un pasaje recuperado es relevante para una consulta, usando las probabilidades del primer token. Es adecuado porque la evaluación reporta 66 aciertos sobre 70 elementos en un conjunto privado de relevancia.
- Filtrado de boletines y newsletters en correo: puede etiquetar un correo como newsletter o no. En la evaluación obtiene 55 aciertos sobre 55 elementos, por lo que es apto para automatizar el triaje de bandejas de entrada.
- Detección de correos que requieren acción: puede distinguir si un mensaje necesita respuesta o gestión. En la evaluación logra 54 aciertos sobre 60, frente a 50 de gemma4:12b, lo que lo hace útil para priorización de tareas.
- Enrutamiento con opciones descritas: puede elegir entre tres opciones descritas en el prompt. En el conjunto de decisiones autorales obtiene 139 aciertos sobre 144, adecuado para flujos de clasificación multiclase.
- Preguntas de sí/no en pipelines de datos: puede resolver consultas binarias sintéticas con 15 aciertos sobre 15, útil para validaciones automáticas y control de calidad.
- Moderación o etiquetado binario de contenido: puede asignar etiquetas discretas a textos, por ejemplo apto/no apto o tóxico/no tóxico, leyendo logprobs en lugar de texto generado.
- Triaje de tickets de soporte: puede clasificar incidencias en categorías cerradas y derivarlas al equipo correspondiente, siempre que las etiquetas se definan en el prompt y se use un servidor compatible con logprobs.
- Extracción de decisiones en pipelines de automatización: el servidor winnow-inference ofrece una API de decisiones tipadas, aunque no se probó con esta cuantización concreta.

## Benchmarks y rendimiento

| Conjunto | Elementos | gemma4:12b | Esta cuantización |
|---|---:|---:|---:|
| Decisiones autorales SemIf, tres opciones descritas | 144 | 139 | 139 |
| Sí/no sintético | 15 | 15 | 15 |
| Relevancia RAG privada | 70 | 66 | 66 |
| Correo privado, newsletter o no | 55 | 55 | 55 |
| Correo privado, requiere acción o no | 60 | 50 | 54 |
| Total | 344 | 325 | 329 |

| Medida | gemma4:12b | Esta cuantización |
|---|---:|---:|
| NLL en conjuntos sí/no, temperatura ajustada | 0,200 | 0,166 |
| NLL en conjuntos de opciones, temperatura ajustada | 0,171 | 0,167 |
| Latencia p50 / p95 | 218 / 601 ms | 222 / 622 ms |

Los conjuntos son privados o autorales. La diferencia total es de 4 elementos: 7 ganados y 3 perdidos. El intervalo bootstrap pareado del 95% para la diferencia de exactitud es de -0,6 a +2,9 puntos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks públicos en la información disponible.

## Requisitos de hardware

- Q4_K_M: archivo de 7,38 GB; Ollama lo carga en 8,0 GB. Cabe en una GPU de 12 GB con offload completo, según la model card.
- BF16 del modelo base: 22.713 MiB a 16,00 bits por peso. Requiere una GPU con al menos esa capacidad solo para pesos, más overhead de contexto y runtime.
- Q8_0 del modelo base: tamaño no disponible.
- GPU probada: RTX 5070 Ti Laptop con 12 GB.
- GPU de consumo: sí para Q4_K_M en tarjetas con 12 GB o más; no se probaron otras configuraciones.
- Despliegue: Ollama, con renderer y parser gemma4, temperatura 1, top_k 64 y top_p 0.95; llama.cpp. vLLM, TGI, TensorRT-LLM u otros servidores no están documentados en la información disponible.
- Latencia: p50 de 222 ms y p95 de 622 ms en la GPU probada, con Ollama 0.34.3 y el mismo renderer de Gemma 4.
- Throughput: no disponible.
- Contexto: no disponible. El consumo de KV cache dependerá de la longitud de contexto, que no se especifica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Resultado total | Latencia p50 / p95 |
|---|---:|---|---|---|---:|---:|
| Piotr1215/Winnow-12B-GGUF Q4_K_M | 11,9B | no disponible | GGUF Q4_K_M | Apache-2.0 | 329/344 | 222 / 622 ms |
| gemma4:12b stock Q4_K_M | 12B, según el nombre | no disponible | GGUF Q4_K_M vía Ollama | no disponible en la información | 325/344 | 218 / 601 ms |
| EldanRing/Winnow-12B | 11,9B | no disponible | BF16 y Q8_0 | Apache-2.0, según la model card | no disponible | no disponible |

No se han identificado otras alternativas comparables en la información proporcionada. La comparación con gemma4:12b procede de la evaluación del autor, no de un benchmark público independiente.

## Limitaciones y advertencias

- La pérdida de cuantización de este Q4_K_M frente al BF16 o Q8_0 del modelo base no se ha medido.
- La visión no está probada con esta cuantización; el archivo es solo texto y el mmproj del modelo base no se validó.
- Los benchmarks proceden de conjuntos privados o autorales, con tamaños pequeños (344 elementos en total) y no son fácilmente reproducibles.
- La latencia se midió en una RTX 5070 Ti Laptop con 12 GB y Ollama 0.34.3; no se dispone de datos en otros entornos.
- No hay información sobre longitud de contexto ni idiomas soportados.
- No se documentan tool calling, function calling ni flujos de agentes multi-paso.
- El pipeline declarado es text-classification; no es un modelo de generación general validado en esta ficha.
- La licencia declarada es Apache-2.0, pero el modelo deriva de Gemma 4. Conviene revisar los términos de Gemma 4, así como los archivos LICENSE y NOTICE copiados del modelo base, antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación externa de la comunidad.
- El autor indica que este repositorio es independiente y no está afiliado ni respaldado por EldanRing, TypeSafe ni Google.
- El servidor de decisiones tipadas winnow-inference no se probó con esta cuantización; la API específica puede requerir validación adicional.

## Enlaces

- [Piotr1215/Winnow-12B-GGUF en Hugging Face](https://huggingface.co/Piotr1215/Winnow-12B-GGUF)
- [EldanRing/Winnow-12B, modelo base](https://huggingface.co/EldanRing/Winnow-12B)
- [winnow-inference, servidor llama.cpp con API de decisiones tipadas](https://github.com/EldanRing/winnow-inference)
- [llama.cpp, commit 911f6cd](https://github.com/ggml-org/llama.cpp)
- [Ollama](https://ollama.com)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
