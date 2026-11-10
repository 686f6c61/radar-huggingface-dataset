# ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_q-exp

## Resumen

El modelo `ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_q-exp` es un clasificador de imágenes basado en la arquitectura bViT (vision transformer con atención bidireccional sobre parches), desarrollado por el usuario ais0430 en el contexto de un proyecto de reproducción experimental denominado bViT_circuit. Se trata de un modelo de muy pequeño tamaño (3.059.926 parámetros) entrenado específicamente sobre el subconjunto ImageNet-100, no sobre las 1.000 clases completas de ImageNet. Su propósito es servir como artefacto de investigación para validar decisiones de diseño arquitectónico y de entrenamiento, más que como modelo de producción generalista.

El nombre del repositorio codifica la práctica totalidad de la configuración del experimento: dimensión de embedding de 462, 6 cabezas de atención, 30 épocas de entrenamiento, batch size de 128, learning rate de 5e-4, sin EMA (exponential moving average) y con un esquema de cuantización o experimento etiquetado como "q-exp". La precisión de evaluación reportada por el autor es de 0,4242 (42,42 %) en el mejor checkpoint sobre ImageNet-100, un valor coherente con un modelo de esta escala entrenado durante pocas épocas.

La relevancia de este modelo es limitada fuera del ámbito de la investigación en eficiencia de arquitecturas ViT. No dispone de model card detallada, licencia declarada ni información sobre composición del dataset más allá de la etiqueta `imagenet100`. Cualquier evaluación de su idoneidad para uso real debe hacerse con cautela y verificando directamente los pesos y el repositorio de código asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bViT (vision transformer con atención bidireccional sobre parches) |
| Parametros totales | 3.059.926 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificación de imágenes, sin contexto textual) |
| Tipos de cuantizacion | no disponible (el sufijo "q-exp" del nombre sugiere un experimento de cuantización, sin detalle) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | image-classification |
| Dataset de entrenamiento | ImageNet-100 |
| Dimensión de embedding | 462 |
| Cabezas de atención | 6 |
| Épocas | 30 |
| Batch size | 128 |
| Learning rate | 5e-4 |
| EMA | no (no-ema) |
| Precisión best (eval) | 0,4242 |

## Arquitectura y entrenamiento

La arquitectura es un bViT, es decir, un vision transformer que procesa la imagen dividida en parches y aplica atención bidireccional entre ellos, sin enmascaramiento causal. Los hiperparámetros declarados en el nombre del repositorio (embedding de 462, 6 cabezas, 30 épocas, batch 128, lr 5e-4) configuran un modelo muy compacto, con aproximadamente 3,06 millones de parámetros totales. El sufijo `no-ema` indica que el entrenamiento no empleó media móvil exponencial de los pesos, y `q-exp` sugiere algún tipo de experimento relacionado con cuantización, aunque el autor no detalla en la model card en qué consiste.

El entrenamiento se realizó sobre ImageNet-100, un subconjunto de 100 clases de ImageNet, según la etiqueta `dataset_tag: imagenet100`. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos, regularización, RLHF o DPO (estas dos últimas no aplican a un clasificador de imágenes). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El autor remite al repositorio `bViT_circuit` (archivos `CLAUDE.md` y `docs/code_notes/`) para los detalles de diseño, pero esa información no está incluida en la model card.

## Capacidades

- Clasificación de imágenes en 100 clases (ImageNet-100).
- Extracción de representaciones visuales intermedias mediante el backbone transformer.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje natural).
- No dispone de modo thinking, visión generativa ni audio.
- Compatible con la librería `transformers` y con `endpoints_compatible` según los tags del repositorio.

## Casos de uso

- Investigación en arquitecturas ViT compactas: el modelo sirve como referencia reproducible para estudiar el efecto de la dimensión de embedding (462), el número de cabezas (6) y el régimen de entrenamiento (30 épocas, lr 5e-4) en la precisión de clasificación sobre ImageNet-100.
- Ablación de EMA: al estar entrenado sin EMA (`no-ema`), permite comparar directamente contra variantes con EMA del mismo proyecto para cuantificar la ganancia o pérdida de precisión atribuible a esta técnica.
- Experimentos de cuantización: el sufijo `q-exp` sugiere que el checkpoint forma parte de un estudio de cuantización; puede usarse como punto de partida para medir degradación de precisión al cuantizar un ViT de ~3 M de parámetros.
- Clasificación de imágenes de bajo coste computacional en entornos embebidos o CPU: con 3,06 M de parámetros, la inferencia es viable en hardware muy limitado, siempre que las 100 clases de ImageNet-100 cubran el dominio de interés.
- Docencia y prototipado rápido: útil para demostrar el flujo completo de entrenamiento y evaluación de un vision transformer en un curso o taller, dado su reducido tamaño y su integración con `transformers`.
- Baseline en pipelines de comparación de modelos: puede actuar como línea base de muy baja complejidad frente a ViT preentrenados de mayor escala en tareas de clasificación restringidas a 100 clases.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| ImageNet-100 (eval accuracy, best) | 0,4242 | Dato reportado por el autor en la model card |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 3,06 M de parámetros (aproximadamente 12 MB de pesos), más el espacio de activaciones, que depende del tamaño de imagen de entrada (no especificado).
- GPU recomendadas: cualquier GPU moderna es sobrada; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 2 GB de VRAM, e incluso es viable en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` (Pipeline de image-classification), endpoints compatibles según los tags; no se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas a modelos de lenguaje y no aplican directamente).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ais0430/in100_bvit (este modelo) | 3.059.926 | Imagen (tamaño no disponible) | 0,4242 en ImageNet-100 | no disponible | Hugging Face |
| ViT-Base (referencia) | ~86 M | Imagen 224x224 | no disponible en esta ficha | según checkpoint | Hugging Face |
| DeiT-Tiny (referencia) | ~5,7 M | Imagen 224x224 | no disponible en esta ficha | según checkpoint | Hugging Face |

No se dispone de datos de benchmarks comparables en la información proporcionada para establecer una comparación cuantitativa fiable con alternativas. La comparación anterior es meramente estructural (tamaño y tipo de entrada).

## Limitaciones y advertencias

- El modelo solo clasifica 100 clases (ImageNet-100); no cubre las 1.000 clases de ImageNet completo ni dominios fuera de distribución.
- Precisión de evaluación baja (0,4242), insuficiente para la mayoría de aplicaciones de producción.
- No se declara licencia, por lo que el uso comercial queda sin autorización explícita y debe consultarse con el autor.
- No hay información sobre sesgos del dataset ni sobre la composición exacta de ImageNet-100 empleada.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza en clases no representadas.
- No se documenta el tamaño de imagen de entrada ni el preprocesado esperado, lo que puede provocar errores de integración.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- El sufijo `q-exp` sugiere un estado experimental de cuantización no documentado; verificar los pesos antes de usarlos.
- Sin información sobre el número de tokens de entrenamiento ni sobre técnicas de aumento de datos, la reproducibilidad es limitada.

## Enlaces

- Hugging Face: https://huggingface.co/ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_q-exp
- Repositorio de código del proyecto: https://github.com/otia-0430/bViT_circuit
- Run de Weights & Biases: https://forge.coreweave.com/wandb/aito-paretto-/bvit/runs/gfbayrcg
