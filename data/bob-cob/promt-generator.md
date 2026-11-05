# bob-cob/Promt-generator

## Resumen

Promt-generator es un modelo de generación de texto publicado por el usuario bob-cob en HuggingFace, derivado o vinculado al proyecto UnfilteredAI según su model card. Su propósito declarado es generar prompts para modelos texto-a-imagen (Stable Diffusion y similares), es decir, producir descripciones textuales ricas y variadas que luego se usan como entrada de un generador de imágenes. Se distribuye con pesos en formato safetensors y PyTorch, con licencia MIT.

El modelo tiene 559.214.592 parámetros totales (aproximadamente 559 millones), lo que lo sitúa en la gama de modelos pequeños tipo BLOOM-560M, coherente con la arquitectura `bloom` indicada en los tags de HuggingFace. El repositorio ocupa 4,5 GB, un tamaño desproporcionado para ese número de parámetros, lo que sugiere pesos en fp32 o la inclusión de ficheros adicionales.

La relevancia de este modelo es limitada en el ecosistema actual: no tiene descargas ni likes, no se han publicado benchmarks, la model card es genérica y no documenta datos de entrenamiento ni evaluación. Debe tratarse como un experimento o publicación de bajo perfil, no como un modelo listo para producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BLOOM (transformer decoder-only, según tag `bloom`) |
| Parámetros totales | 559.214.592 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización a GGUF/otros no documentada) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia BLOOM, un transformer decoder-only con atención causal, según el tag `bloom` del repositorio. El número de parámetros (559M) coincide con la variante BLOOM-560M, que emplea 24 capas, 16 cabezas de atención y una dimensión oculta de 1024, con embeddings ALiBi en lugar de embeddings posicionales aprendidos. No obstante, la model card no confirma estos detalles ni documenta si se trata de un fine-tuning de BLOOM-560M o de un entrenamiento desde cero.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas. La model card se limita a describir el caso de uso (generación de prompts) y a incluir un ejemplo de código con `transformers`. Todo lo relativo al proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Generación de texto autoregresiva orientada a la creación de prompts para modelos texto-a-imagen.
- Producción de descripciones textuales que pueden alimentar pipelines de Stable Diffusion u otros generadores de imágenes.
- Generación de texto general propia de un modelo causal de 559M parámetros.
- Soporte de tool calling / function calling: no documentado, improbable en un modelo de este tamaño y familia.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; BLOOM base es multilingüe, pero no se confirma para este checkpoint.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Generación de prompts para arte generativo: el modelo recibe una idea breve ("a red car") y devuelve una descripción ampliada que se pasa como prompt a un modelo texto-a-imagen. Es su caso de uso declarado y el único documentado por el autor.
- Prototipado rápido de herramientas creativas: al ser un modelo de 559M con licencia MIT, puede integrarse en demos locales de generación de prompts sin coste de API ni restricciones de uso comercial.
- Aumento de datasets de prompts: generar variaciones de descripciones para entrenar o evaluar sistemas de captioning o de generación de imágenes.
- Experimentación académica con modelos pequeños: servir de baseline para comparar técnicas de fine-tuning en la tarea de generación de prompts.
- Asistente creativo en aplicaciones de escritorio: al caber en hardware modesto, puede ejecutarse en local para sugerir descripciones de escenas.
- Filtrado y expansión de ideas en flujos de diseño: dado un concepto escueto, producir borradores de descripción que un humano refine antes de usarlos en producción.

En todos los casos, la idoneidad real depende de una evaluación propia, ya que no hay benchmarks ni documentación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos (559M × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 1,1 GB para pesos.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,6 GB; en 4 bits, aproximadamente 0,3 GB (si se genera una versión cuantizada, no publicada).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 lo ejecutan sin problema.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en CPU con suficiente RAM.
- Opciones de despliegue: `transformers` en PyTorch (documentado por el autor); vLLM, llama.cpp, Ollama y TGI son viables en teoría, pero no hay conversión a GGUF ni configuración publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| bob-cob/Promt-generator | 559M | no disponible | MIT | HuggingFace, 0 descargas | Sin benchmarks ni documentación de entrenamiento |
| bigscience/bloom-560m | 560M | 2048 tokens | BigScience RAIL | HuggingFace, ampliamente usado | Modelo base multilingüe con documentación completa |
| google/flan-t5-base | 220M (encoder-decoder) | 512 tokens | Apache 2.0 | HuggingFace | Orientado a instrucciones, no a prompts de imagen |
| microsoft/phi-1_5 | 1,3B | 2048 tokens | MIT | HuggingFace | Enfocado a código, mayor tamaño |

La comparación directa más razonable es con BLOOM-560M, del que probablemente deriva, y con modelos pequeños orientados a instrucciones. La ventaja de este checkpoint es su licencia MIT permisiva; la desventaja es la ausencia total de evaluación y documentación frente a alternativas consolidadas.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay ninguna métrica publicada que permita estimar la calidad de los prompts generados.
- Model card genérica: no documenta datos de entrenamiento, idiomas, contexto ni proceso de alineación.
- Riesgo de alucinación y de prompts incoherentes: un modelo de 559M sin fine-tuning documentado puede producir descripciones repetitivas o sin sentido.
- Sesgos: al no documentarse el dataset, no es posible evaluar sesgos de género, raza o cultura; BLOOM base es conocido por sesgos presentes en datos web.
- Idiomas: no se confirma el soporte multilingüe; el ejemplo de la model card está en inglés.
- Contexto: longitud no documentada; probablemente 2048 tokens si hereda la configuración de BLOOM-560M, pero no confirmado.
- Licencia MIT: permite uso comercial sin restricciones, pero el usuario asume toda la responsabilidad sobre la calidad y legalidad del contenido generado.
- Nombre del repositorio con errata ("Promt" en lugar de "Prompt") y discrepancia entre el autor del repo (bob-cob) y el de la model card (UnfilteredAI), lo que dificulta la trazabilidad.
- Sin mantenimiento aparente: creado y actualizado en la misma fecha, sin descargas ni interacción de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/bob-cob/Promt-generator
