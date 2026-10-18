# CollectionStudio/switch-base-8

## Resumen

Switch-base-8 es un checkpoint de la familia Switch Transformers, una variante de T5 que sustituye las capas feed-forward densas por capas MLP dispersas con varios expertos. En este caso, la model card indica 8 expertos y un entrenamiento mediante modelado de lenguaje enmascarado (MLM) sobre el corpus C4. El repositorio está publicado por CollectionStudio y los ejemplos de uso apuntan al checkpoint original google/switch-base-8; la licencia declarada es Apache 2.0 y el idioma soportado es únicamente inglés.

El modelo pertenece a la línea de investigación de mezcla de expertos (MoE) de Google, presentada en el paper de Switch Transformers. Su interés es principalmente arquitectónico: permite estudiar enrutamiento disperso, especialización de expertos y el equilibrio entre coste computacional y número total de parámetros. No es un modelo listo para producción ni para conversación: es un checkpoint base entrenado con MLM, por lo que requiere fine-tuning para tareas downstream.

El repositorio ocupa 1,2 GB y no presenta descargas ni likes en el momento de la consulta. La model card no incluye número de parámetros, longitud de contexto ni resultados de benchmarks, por lo que estos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 con capas MLP dispersas de mezcla de expertos (MoE); 8 expertos |
| Parametros totales | no disponible |
| Parametros activos | no disponible; la model card no indica cuántos parámetros se activan por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 e INT8 documentados en los ejemplos (INT8 con bitsandbytes); no se documentan GGUF, 4-bit ni otras |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (tag pytorch); no se indica safetensors, GGUF ni otros formatos |
| Tarea principal | modelado de lenguaje enmascarado (MLM) y generación text2text |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder tipo T5. Cada bloque feed-forward denso se reemplaza por una capa de mezcla de expertos con 8 expertos MLP y un enrutador que asigna cada token a un experto. Esto hace que el coste por token sea el de un subconjunto de expertos, mientras el número total de parámetros crece con el número de expertos. La model card cita el paper original, que reporta entrenamiento hasta modelos de billón de parámetros y hasta 4 veces de speedup sobre T5-XXL.

El entrenamiento descrito es MLM sobre C4. No se detallan en la información proporcionada el número de tokens, la composición exacta del dataset, el uso de RLHF/DPO ni técnicas de alineación. Al ser un checkpoint base de MLM, no se documenta decodificación especulativa, atención linear ni otras innovaciones de inferencia.

## Capacidades

- Relleno de huecos mediante modelado de lenguaje enmascarado con tokens centinela `<extra_id_N>`. La model card incluye un ejemplo de reconstrucción de una frase en inglés.
- Generación text2text condicionada: acepta una entrada con huecos y devuelve una secuencia con tokens centinela; no es generación libre conversacional.
- Fine-tuning supervisado para tareas de generación condicionada en inglés, como clasificación formulada como generación de etiqueta, question answering, resumen o paráfrasis.
- Capacidad monolingüe: la model card declara únicamente inglés; no hay soporte documentado de castellano ni de otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No incluye plantilla de chat, instrucciones de sistema ni alineación para seguridad; no es un modelo instructivo.
- Puede utilizarse como base para experimentos de enrutamiento MoE, equilibrio de carga entre expertos y especialización de expertos.

## Casos de uso

- Fine-tuning para clasificación de texto en inglés: el modelo puede ajustarse con un conjunto etiquetado para sentimiento, tema o intención, formulando la clasificación como generación de la etiqueta. Es adecuado como base de investigación, no como clasificador listo para usar.
- Relleno de texto y aumento de datos: sirve para generar alternativas en huecos de frases y crear ejemplos sintéticos de tipo cloze. Útil en dominios con pocos datos, siempre que se valide la calidad de las continuaciones.
- Investigación de routing MoE: permite instrumentar el enrutador, medir la utilización de expertos y estudiar desequilibrios de carga. El checkpoint con 8 expertos es manejable para experimentos académicos.
- Adaptación de dominio para resumen o question answering: tras fine-tuning con pares documento-respuesta o documento-resumen, puede emplearse en tareas extractivas o generativas en inglés. Conviene validar la longitud máxima de entrada porque no se documenta el contexto.
- Reproducción de experimentos T5 frente a Switch Transformer: útil para comparar calidad y coste computacional entre un transformer denso y una variante MoE con el mismo tokenizer y formato de tarea.
- Prototipos educativos en GPU consumer: al ocupar 1,2 GB el repositorio, puede cargarse con `transformers` y `accelerate` en entornos de laboratorio o docencia para ilustrar el funcionamiento de un MoE.
- Generación de preguntas de relleno para aprendizaje de inglés: el modelo puede producir huecos y respuestas plausibles en frases inglesas, aunque requiere revisión humana por riesgo de continuaciones incorrectas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones equivalentes. El paper original reporta mejoras de entrenamiento y speedup sobre T5-XXL, pero no se trasladan aquí como resultados medidos de este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada: no hay dato oficial. El repositorio pesa 1,2 GB; como orientación, los pesos pueden ocupar ese orden de magnitud y la inferencia con lotes pequeños podría caber en 4-8 GB, sumando activaciones y overhead. En FP16 e INT8 el consumo de pesos se reduce, pero no se garantiza una calidad equivalente.
- GPU recomendadas: para FP16 o INT8, una GPU consumer de 8 GB o más (RTX 3060 8/12 GB, RTX 4060 8 GB, RTX 4070 12 GB) es una opción razonable. Para FP32 se recomienda 12 GB o más. A100/H100 solo serían necesarias para fine-tuning con lotes grandes o entrenamiento.
- CPU: es posible ejecutar la inferencia con `transformers` en CPU, pero la latencia será alta y no se recomienda para producción.
- Despliegue: la vía documentada es `transformers` con `accelerate`; los ejemplos incluyen FP16 e INT8 con `bitsandbytes`. No se documenta soporte en vLLM, llama.cpp, Ollama o TGI, ni formato GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| CollectionStudio/switch-base-8 | MoE con 8 expertos, MLM | no disponible | no disponible | Apache 2.0 | Repositorio de 1,2 GB; checkpoint base no listo para uso directo |
| google/switch-base-8 | MoE con 8 expertos, MLM | no disponible | no disponible | no disponible en la información | Checkpoint original citado en los ejemplos; conviene verificar equivalencia con este repositorio |
| T5-base | Transformer denso encoder-decoder | no disponible | no disponible | no disponible en la información | Arquitectura de referencia; no es MoE |
| FLAN-T5 | T5 ajustado para instrucciones | no disponible | no disponible | no disponible en la información | Mencionado en la model card como alternativa fine-tuned para tareas downstream |

No se dispone de datos cuantitativos suficientes para una comparativa de rendimiento. La model card solo menciona T5 y FLAN-T5 de forma cualitativa.

## Limitaciones y advertencias

- Checkpoint base de MLM: la propia model card advierte de que no está listo para uso directo en tareas downstream. No sigue instrucciones ni mantiene conversaciones.
- Idioma: solo inglés. No hay soporte documentado de castellano, catalán, gallego o euskera.
- Contexto: no se documenta la longitud máxima de entrada; las entradas largas pueden fallar o truncarse.
- Evaluación: no hay benchmarks publicados en la información disponible, por lo que la calidad real en tareas concretas es incierta.
- Sesgos: el autor no documenta evaluación de sesgos. Al entrenarse sobre C4, un corpus web, cabe esperar sesgos de dominio y demográficos, aunque no se cuantifican.
- Alucinación: en tareas de relleno de huecos puede producir continuaciones plausibles pero falsas; no debe usarse sin verificación humana.
- Licencia: Apache 2.0 permite uso comercial, pero deben revisarse los términos del checkpoint original y del corpus C4. No hay garantía de exactitud ni de idoneidad para un uso concreto.
- Repositorio: 0 descargas y 0 likes en el momento de la consulta; posible réplica de un checkpoint original. Conviene verificar checksums y archivos frente a `google/switch-base-8`.
- Cuantización INT8: los ejemplos la mencionan, pero no hay evaluación de la pérdida de calidad frente a FP16 o FP32.
- Seguridad: no incluye alineación, filtros de contenido ni mitigaciones documentadas para usos dañinos.

## Enlaces

- [HuggingFace: CollectionStudio/switch-base-8](https://huggingface.co/CollectionStudio/switch-base-8)
- [Checkpoint original citado: google/switch-base-8](https://huggingface.co/google/switch-base-8)
- [Paper de Switch Transformers](https://arxiv.org/pdf/2101.03961.pdf)
- [Paper de T5](https://arxiv.org/abs/1910.09700)
- [Repositorio t5x de Google Research](https://github.com/google-research/t5x)
- [Documentación de Switch Transformers en Hugging Face](https://huggingface.co/docs/transformers/model_doc/switch_transformers)
- [Notebook de fine-tuning MoE citado en la model card](https://colab.research.google.com/drive/1aGGVHZmtKmcNBbAwa9hbu58DDpIuB5O4?usp=sharing)
- [Modelos Switch en Hugging Face](https://huggingface.co/models?search=switch)
- [Checkpoints MoE originales de t5x](https://github.com/google-research/t5x/blob/main/docs/models.md#mixture-of-experts-moe-checkpoints)
