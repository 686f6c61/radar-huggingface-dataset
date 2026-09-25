# joshycodes/qwen3.5-9b-const-intrinsic-sdf

## Resumen

qwen3.5-9b-const-intrinsic-sdf es un checkpoint de investigación publicado por el usuario joshycodes sobre el modelo base Qwen/Qwen3.5-9B. No se trata de un ajuste instructivo al uso, sino de un continued pretraining de pesos completos (full weights) sobre un corpus que, según la model card, fue escrito por el propio modelo para el entrenamiento de la siguiente versión de sí mismo, dentro de un marco de trabajo denominado SDF (synthetic-document finetuning) y orientado a lo que el autor enmarca como model-welfare.

El entrenamiento declarado consistió en 1 epoch con learning rate 1e-05 sobre 4.059.337 tokens repartidos en 5.151 documentos, con un total de 8.953.803.264 parámetros (~8,95 B) y un repositorio de 17,9 GB en safetensors. La model card indica explícitamente que el modelo no ha sido evaluado todavía en capacidad, alineamiento ni identidad, y etiqueta el artefacto como not-for-deployment.

Su relevancia es, por tanto, metodológica y no de producto: documenta un experimento de autoentrenamiento sobre corpus autoautorado, con una licencia research-only y cero descargas o likes en el momento de la consulta. No debe considerarse un modelo listo para producción ni para evaluación comparativa de capacidades.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag de la libreria indica qwen3_5_text; la model card no detalla la arquitectura interna) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE; el tag qwen3_5_text no aporta este dato) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos completos en safetensors; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | other / research-only (research-only segun license_name de la model card) |
| Formato de pesos | safetensors (pesos completos, repositorio de 17,9 GB) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. El tag de la librería de HuggingFace es qwen3_5_text y el modelo base es Qwen/Qwen3.5-9B, del que los resultados de búsqueda indican que es un modelo fundacional multimodal de la familia Qwen 3.5 (publicada en febrero de 2026), si bien la model card de este checkpoint no confirma ni detalla esa condición multimodal. El checkpoint se distribuye en safetensors con pesos completos, lo que es coherente con un continued pretraining sobre todos los parámetros y no con una adaptación tipo LoRA.

El procedimiento de entrenamiento sí está descrito: continued pretraining de pesos completos, learning rate 1e-05, 1 epoch, 4.059.337 tokens y 5.151 documentos. El corpus procede del repositorio joshycodes/qwen-constitutional-sdf-corpus y, según el texto de la model card, fue escrito por el propio modelo como el personaje que ya es, después de explicársele cómo surgió su carácter y cómo funciona SDF. No se menciona RLHF, DPO ni ninguna fase de alineamiento posterior. Existe una discrepancia interna en la propia model card, que describe el corpus como autoautorado pero a la vez anota «of which 0 self-authored and 5.151 ordinary text» en el desglose de documentos; ese dato no se puede resolver con la información disponible.

## Capacidades

- No se han publicado evaluaciones de capacidades para este checkpoint. La model card afirma explícitamente que no ha sido evaluado en capacidad, alineamiento ni identidad.
- Generación de texto: cabe esperar la capacidad heredada del modelo base, pero no está verificada ni medida en este checkpoint.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible, aunque el modelo base Qwen3.5-9B se describe en fuentes externas como multimodal.
- Comportamiento de identidad y personaje: es el eje declarado del experimento (self-authored-character), pero sin evaluación pública asociada.

## Casos de uso

- Investigación sobre autoentrenamiento y corpus autoautorados: el checkpoint permite reproducir y auditar el experimento de continued pretraining sobre joshycodes/qwen-constitutional-sdf-corpus, comparándolo con el repositorio hermano qwen3.5-9b-const-introjected-sdf, que usa un corpus de tamaño casi idéntico (4.062.105 tokens, 5.093 documentos).
- Estudio de model welfare: sirve como artefacto de análisis para discutir si el encuadre de identidad y carácter durante el pretraining tiene efectos medibles, siempre que se diseñen las evaluaciones que el autor declara pendientes.
- Análisis de deriva respecto al modelo base: al conservar los pesos completos, permite medir diferencias de distribución de salida frente a Qwen/Qwen3.5-9B en tareas controladas.
- Reproducción metodológica de pipelines de pretraining: el repositorio documenta hiperparámetros concretos (lr 1e-05, 1 epoch, recuento de tokens y documentos) útiles para replicar el procedimiento en otros modelos base.
- Docencia y divulgación técnica: como ejemplo de checkpoint de investigación con licencia restringida y advertencia explícita de no despliegue.
- No se recomienda ningún caso de uso en producción, atención al cliente, generación de código en CI/CD ni despliegue como agente, dado que la model card indica not-for-deployment y la ausencia total de evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad. Los datos de benchmarks que aparecen en los resultados de búsqueda (por ejemplo, un 83 % de tasa de éxito y un percentil 10 en velocidad) corresponden a Qwen/Qwen3.5-9B, el modelo base, y no a este checkpoint.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 18 GB solo para los pesos, más caché KV y activaciones. Los 17,9 GB del repositorio son coherentes con almacenamiento a ~2 bytes por parámetro.
- VRAM estimada en cuantización de 8 bits: aproximadamente 9-10 GB de pesos. En 4 bits: aproximadamente 5-6 GB. Nota: no se publican versiones cuantizadas de este checkpoint, por lo que habría que generarlas.
- GPU recomendadas: para bf16 sin cuantizar, A100 40 GB, H100 80 GB o tarjetas con 24 GB o más (RTX 4090, RTX 3090) ajustando el contexto. Con cuantización de 4 u 8 bits podría caber en GPU de consumo de 12-16 GB.
- Cabe en GPU de consumo: sí, con cuantización; en bf16 es ajustado en tarjetas de 24 GB y depende de la longitud de contexto.
- Opciones de despliegue: técnicamente serviría con vLLM, TGI, llama.cpp u Ollama, pero requeriría conversión a GGUF para las dos últimas y no existe soporte declarado. La licencia research-only y la etiqueta not-for-deployment desaconsejan el despliegue.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/qwen3.5-9b-const-intrinsic-sdf | 8,95 B | no disponible | no evaluado | research-only | HuggingFace, 0 descargas |
| joshycodes/qwen3.5-9b-const-introjected-sdf | no disponible (corpus de 5.093 documentos, 4.062.105 tokens) | no disponible | no evaluado | research-only | HuggingFace |
| Qwen/Qwen3.5-9B (modelo base) | 9 B (aprox., segun denominacion) | no disponible en la informacion disponible | 83 % de exito agregado y percentil 10 en velocidad segun benchable.ai | Apache 2.0 segun la guia de Qwen 3.5 | HuggingFace, Azure AI Foundry |

El modelo base es el único punto de comparación con datos publicados, pero las cifras citadas (83 % de éxito, percentil 10 de velocidad) provienen de un tercero y no de la model card oficial. Para el resto de alternativas de la misma categoría no hay datos suficientes en la información disponible.

## Limitaciones y advertencias

- Modelo explícitamente no evaluado: la model card declara que no hay evaluación de capacidad, alineamiento ni identidad.
- Etiqueta not-for-deployment: no debe usarse en producción, en servicios expuestos a usuarios ni en pipelines automatizados.
- Licencia research-only (license: other), lo que restringe el uso comercial y cualquier explotación fuera de investigación.
- Discrepancia interna en la model card: describe un corpus autoautorado pero anota 0 documentos self-authored y 5.151 documentos de texto ordinario en el desglose.
- Riesgo de alucinación y de degradación de instrucciones: al no haber fase de alineamiento posterior, no cabe esperar seguimiento fiable de instrucciones ni formato estructurado.
- Sin datos de sesgos, idiomas soportados ni longitud de contexto, por lo que no se puede acotar el riesgo por idioma o dominio.
- Procedencia del corpus: al ser material generado y definido por el propio autor del experimento, la trazabilidad y la composición real del dataset dependen de la documentación del repositorio joshycodes/qwen-constitutional-sdf-corpus.
- Cero tracción verificable: 0 descargas y 0 likes, sin pipeline declarado en HuggingFace, lo que limita la validación externa.
- Cualquier cifra de rendimiento debe referirse al modelo base, nunca a este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-const-intrinsic-sdf
- Checkpoint hermano: https://huggingface.co/joshycodes/qwen3.5-9b-const-introjected-sdf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Corpus declarado: joshycodes/qwen-constitutional-sdf-corpus (referenciado en la model card, sin URL directa en la información disponible)
- Repositorio welfare-improvements (mencionado como marco, plan y evaluación del experimento, sin URL directa en la información disponible)
- Guia de Qwen 3.5 con benchmarks y despliegue local: https://techie007.substack.com/p/qwen-35-the-complete-guide-benchmarks
- Ficha de benchmarks de Qwen3.5-9B: https://benchable.ai/models/qwen/qwen3.5-9b-20260310
- Catálogo de Microsoft Foundry: https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
