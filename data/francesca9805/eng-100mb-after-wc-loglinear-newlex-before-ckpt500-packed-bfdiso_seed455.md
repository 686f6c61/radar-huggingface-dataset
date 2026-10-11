# francesca9805/eng-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed455

## Resumen

El modelo `francesca9805/eng-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed455` es un transformer decoder-only de tipo GPT-2 con 124.770.816 parámetros (unos 124,8 millones), publicado por el usuario de HuggingFace `francesca9805`. Se trata de un ajuste fino (SFT) del checkpoint `francesca9805/ppt-wc-loglinear-newlex-eng-before-100mb-packed-bfdiso_seed455`, entrenado con la librería TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.11.0. El identificador sugiere un experimento controlado: ventana de 100 MB de texto en inglés, variante de tokenizador o mezcla de pesos "loglinear", vocabulario "newlex", datos empaquetados ("packed"), precisión bf16 con algún esquema de "diso", checkpoint 500 y semilla 455.

El modelo no resuelve una tarea de producto: es un artefacto de investigación. La model card es la plantilla automática de TRL, sin descripción de dataset, hiperparámetros, evaluación ni licencia explícita, y el repositorio acumula 0 descargas y 0 "likes" desde su publicación. Su interés es acotado: sirve como punto de comparación dentro de una familia de ejecuciones (existen variantes con "uniform" en lugar de "loglinear" y con semilla 10) para estudiar el efecto de decisiones de tokenización y empaquetado de datos en modelos pequeños.

Por tamaño y arquitectura, es un modelo ligero que cabe en cualquier GPU de consumo e incluso en CPU, pero carece de documentación que permita recomendar su uso en producción. La información disponible no incluye resultados de benchmarks, longitud de contexto declarada, idiomas soportados ni términos legales de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), según la etiqueta `gpt2` del repositorio |
| Parámetros totales | 124.770.816 (dato real de los pesos en safetensors) |
| Longitud de contexto | no disponible (no se declara en la model card) |
| Tipos de cuantización | no disponible; no se publican pesos cuantizados (GGUF, AWQ, GPTQ). El repositorio contiene únicamente safetensors |
| Idiomas soportados | no disponible. El identificador incluye "eng" y el nombre del modelo base contiene "eng", lo que apunta a entrenamiento en inglés, pero no se confirma en la documentación |
| Licencia | no disponible. La model card incluye `licence: license` y la etiqueta `license`, sin especificar términos |
| Formato de pesos | safetensors |
| Modelo base | `francesca9805/ppt-wc-loglinear-newlex-eng-before-100mb-packed-bfdiso_seed455` |
| Método de ajuste | SFT (supervised fine-tuning) con TRL 0.23.0 |
| Librería | transformers |
| Tamaño del repositorio | 2,0 GB (muy superior a los ~250 MB que ocuparían los pesos en bf16, lo que sugiere la inclusión de estados del optimizador u otros checkpoints) |
| Fecha de creación | 2026-10-10 |
| Última actualización | 2026-10-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura declarada es GPT-2: un transformer decoder-only con atención causal completa, normalización por capas previa y embeddings de tokens y posiciones. Con 124,77 millones de parámetros, el modelo se sitúa en la misma escala que GPT-2 base (124 M). No se documenta ninguna innovación arquitectónica (no hay MoE, ni atención lineal, ni componentes SSM, ni decodificación especulativa); el interés del experimento parece residir en el preprocesamiento y la tokenización, no en la arquitectura.

El entrenamiento es un ajuste fino supervisado sobre el checkpoint base, ejecutado con TRL 0.23.0. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, la duración del entrenamiento, los hiperparámetros ni si hubo fases de RLHF o DPO (no hay evidencia de ellas). Los elementos del nombre del modelo apuntan a decisiones experimentales concretas: "100mb" (volumen de datos de entrenamiento), "loglinear" (frente a la variante "uniform" de modelos hermanos), "newlex" (vocabulario nuevo), "packed" (secuencias empaquetadas sin relleno), "before-ckpt500" (estado previo a un checkpoint intermedio) y "seed455" (semilla aleatoria). El seguimiento del entrenamiento está disponible en un panel de Weights & Biases bajo el proyecto `f-padovani-university-of-groningen/new-tokenizers`.

## Capacidades

- Generación de texto autoregresiva con `pipeline("text-generation")` de Transformers, tal y como muestra el ejemplo de inicio rápido de la model card.
- Manejo de entradas en formato conversacional de un solo turno (`[{"role": "user", "content": ...}]`), aunque no hay evidencia de que el modelo haya sido alineado con preferencias humanas.
- Generación presumiblemente en inglés, inferida del identificador y del nombre del modelo base; no confirmada por el autor.
- No hay documentación ni evaluación que respalde soporte de tool calling o function calling.
- No hay documentación de capacidades de agente, razonamiento multi-paso, uso de memoria externa ni planificación.
- No hay evidencia de capacidades de código, matemáticas, visión, audio ni modo "thinking".
- No hay datos sobre capacidades multilingües; se desconoce si el vocabulario "newlex" cubre idiomas distintos del inglés.
- El modelo es compatible con text-generation-inference y con endpoints alojados, según las etiquetas `text-generation-inference` y `endpoints_compatible`.

## Casos de uso

- Reproducción de experimentos de tokenización: el modelo permite comparar el efecto de un vocabulario "newlex" frente a variantes "uniform" u otras dentro de la misma familia de ejecuciones, manteniendo constante el resto del pipeline.
- Ablación de empaquetado de datos ("packed" frente a no empaquetado): útil para medir el impacto de eliminar relleno en el preentrenamiento de modelos pequeños, con el checkpoint 500 y la semilla 455 como referencias concretas.
- Línea base de bajo coste en investigación: con 124,8 M de parámetros se puede replicar un ciclo completo de SFT con TRL en una única GPU de consumo o en CPU, útil para validar infraestructura antes de escalar a modelos mayores.
- Generación de texto corto en entornos con recursos mínimos: al ocupar del orden de 250 MB de pesos en bf16, es viable en dispositivos embebidos o en servicios con presupuesto de memoria muy reducido, siempre que se acepte la falta de evaluación de calidad.
- Material docente: sirve para ilustrar el ciclo completo de publicación de un modelo en HuggingFace (entrenamiento con TRL, subida en safetensors, despliegue con el pipeline de Transformers) sin requerir hardware especializado.
- Pruebas de infraestructura de despliegue: al ser compatible con text-generation-inference y endpoints, puede emplearse como modelo de humo para validar rutas de servicio, colas, métricas y autoescalado antes de desplegar modelos reales.
- Punto de partida para ajustes posteriores con fines específicos: su tamaño permite iterar rápidamente sobre datasets de instrucciones pequeños, aunque no hay evidencia de que supere a un GPT-2 base estándar como inicialización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 250 MB en bf16/fp16 y 500 MB en fp32, calculados a partir de los 124.770.816 parámetros.
- VRAM total estimada en inferencia: del orden de 0,5 a 1 GB en bf16 incluyendo caché KV y activaciones, y de 1 a 1,5 GB en fp32 (estimaciones teóricas, no medidas).
- Cuantización teórica: unos 125 MB en int8 y unos 62 MB en int4; no se publican pesos cuantizados ni recetas de cuantización.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente. No se requiere A100, H100 ni hardware de centro de datos; una GTX 1050 Ti, GTX 1650, RTX 3060 o superior es más que suficiente.
- Cabe en GPU de consumo: sí, en prácticamente todas las tarjetas gráficas dedicadas modernas, y también en CPU con memoria RAM suficiente (menos de 1 GB).
- Opciones de despliegue: el pipeline de Transformers está documentado en la model card; el repositorio está etiquetado como compatible con text-generation-inference y con endpoints alojados; la arquitectura GPT-2 es compatible con vLLM. El uso con llama.cpp u Ollama requeriría una conversión propia a GGUF, ya que no se publican pesos en ese formato.
- Latencia y throughput: no disponible. No se han publicado mediciones, y el tamaño del repositorio (2,0 GB) no permite inferir el rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `francesca9805/eng-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed455` | 124,77 M | no disponible | no disponible | Repositorio de HuggingFace; 0 descargas; sin pesos cuantizados |
| GPT-2 base (`openai-community/gpt2`) | 124 M | 1024 tokens | MIT, según su ficha pública | Ampliamente desplegado; conversiones GGUF, Ollama y vLLM disponibles |
| DistilGPT-2 (`distilbert/distilgpt2`) | 82 M | 1024 tokens | Apache 2.0, según su ficha pública | Muy extendido; conversiones GGUF disponibles |
| SmolLM-135M (`HuggingFaceTB/SmolLM-135M`) | 135 M | 2048 tokens | Apache 2.0, según su ficha pública | Modelo pequeño moderno con datos de entrenamiento documentados y evaluaciones publicadas |

Los datos de contexto y licencia de los modelos comparados provienen de sus fichas públicas y no se han verificado en la búsqueda asociada a este modelo. No es posible comparar rendimiento porque este modelo no publica ningún resultado de evaluación.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación humana, ni comparación con el modelo base, por lo que se desconoce si el ajuste SFT mejora o degrada el comportamiento original.
- Riesgo de alucinación elevado: con 124,8 M de parámetros y un volumen de datos del orden de 100 MB, la cobertura factual es muy limitada y la generación tenderá a producir texto plausible pero incorrecto.
- Documentación insuficiente: la model card es la plantilla automática de TRL. No se especifican dataset, hiperparámetros, número de tokens ni criterios de parada, lo que impide reproducir el entrenamiento.
- Licencia no determinada: la ficha indica `licence: license` sin concretar términos. En la práctica, esto significa que no hay autorización explícita de uso comercial, lo que supone un riesgo legal si se integra en un producto.
- Idiomas: no hay confirmación de soporte de idiomas distintos del inglés, y el vocabulario "newlex" podría degradar el rendimiento en castellano u otras lenguas.
- Longitud de contexto no declarada: se desconoce la ventana efectiva. Si se asume la configuración habitual de GPT-2, sería de 1024 tokens, pero este dato no está confirmado para este checkpoint.
- Sesgos: no hay análisis de sesgos disponibles. Un modelo entrenado sobre un corpus reducido de 100 MB en inglés tiende a reproducir los sesgos de esa muestra concreta, que además no está documentada.
- Artefacto de investigación: el nombre del modelo indica que se trata de un punto intermedio ("before-ckpt500") de una ejecución experimental, no de un modelo final pulido.
- Sin soporte de la comunidad: 0 descargas y 0 "likes" implican que no hay issues resueltos, ejemplos de uso en producción ni experiencia previa que consultar.
- Tamaño del repositorio desproporcionado: 2,0 GB frente a los ~250 MB de pesos en bf16, lo que probablemente incluye estados del optimizador. Esto aumenta el tiempo de descarga y dificulta el despliegue en entornos con almacenamiento limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eng-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-loglinear-newlex-eng-before-100mb-packed-bfdiso_seed455
- Panel de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/shlds1g1
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante relacionada (uniform, semilla 10): https://huggingface.co/francesca9805/eng-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10
- Ficha en FriendliAI de la variante uniform seed10: https://friendli.ai/models/francesca9805/eng-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10
- Ficha en LLM Explorer de la variante uniform seed10: https://llm-explorer.com/model/francesca9805%2Ftur-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10,4DLoBa7wgbPEoviH1byDDP
- Registro en Free2AITools de la variante uniform seed10: https://free2aitools.com/model/francesca9805/eng-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10
- No se han encontrado artículos, papers ni demostraciones asociados a este modelo en la búsqueda disponible.
