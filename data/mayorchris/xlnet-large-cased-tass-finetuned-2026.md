# MayorChris/xlnet-large-cased-tass-finetuned-2026

## Resumen

`MayorChris/xlnet-large-cased-tass-finetuned-2026` es un modelo de clasificación de texto obtenido por ajuste fino (*fine-tuning*) de `xlnet/xlnet-large-cased`, publicado por el usuario MayorChris en Hugging Face. Se distribuye con la librería `transformers`, en formato `safetensors` y bajo licencia MIT, y está registrado en la pipeline `text-classification`. El checkpoint contiene 361.321.475 parámetros (0,36 B) y una cabeza de clasificación de secuencias, por lo que no es un modelo generativo de uso general.

El problema que resuelve es acotado: asignar una etiqueta a un texto de entrada. La model card no documenta el conjunto de datos de entrenamiento, el número de clases ni los idiomas; el nombre del repositorio hace referencia a TASS, el taller de análisis semántico en la sociedad de la SEPLN asociado a corpus de opinión en español, pero esta correspondencia no está confirmada en la información publicada y debe tratarse como una hipótesis.

Su relevancia práctica es limitada pero concreta: sirve como punto de partida reproducible para tareas de clasificación con presupuesto de hardware mínimo (menos de 2 GB de VRAM en FP32) y como ejemplo de ajuste fino de XLNet con el stack moderno (`transformers` 5.20.1, PyTorch 2.11). Sus métricas declaradas —accuracy 0,5463 y F1 macro 0,5275 en el conjunto de evaluación— son moderadas y deben validarse antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con objetivo de *permutation language modeling* (XLNet) sobre backbone Transformer-XL con codificación posicional relativa |
| Parámetros totales | 361.321.475 (0,36 B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (valor por defecto de `xlnet-large-cased` en `transformers`; no confirmado en la model card) |
| Tipos de cuantización | no se publican versiones cuantizadas; los pesos están en F32 y admiten conversión a FP16/BF16 o INT8 dinámico con PyTorch u ONNX Runtime |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base se entrenó con corpus en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (F32); tamaño del repo 160,4 GB frente a ~1,45 GB de pesos reales, por acumulación de checkpoints intermedios |

## Arquitectura y entrenamiento

XLNet sustituye el enmascaramiento tipo BERT por un objetivo autorregresivo con permutaciones de los factores de descomposición, lo que permite capturar dependencias bidireccionales sin el token `[MASK]`. El backbone es Transformer-XL: atención con codificación posicional relativa y recurrencia de segmentos (*memory*), lo que en teoría permite extender la ventana más allá de los 512 tokens configurados, aunque el checkpoint se publica con la configuración estándar. El modelo base `xlnet-large-cased` tiene 24 capas, `d_model` 1024, 16 cabezas de atención, vocabulario *cased* de 32.000 piezas SentencePiece y se preentrenó sobre corpora en inglés (Wikipedia, BooksCorpus, Giga5, ClueWeb 2012-B y Common Crawl).

Sobre el ajuste fino, la model card solo aporta hiperparámetros: `learning_rate` 1e-5, `train_batch_size` 24, `eval_batch_size` 48, semilla 42, optimizador AdamW fusionado con betas (0,9 / 0,999) y epsilon 1e-8, scheduler lineal y `num_epochs` 20. El registro de entrenamiento se detiene en la época 11 (paso 1771), lo que sugiere parada temprana o un entrenamiento interrumpido, y no hay información sobre el dataset, el número de etiquetas, la composición de clases ni si se aplicó algún tipo de regularización adicional. La curva muestra sobreajuste claro: la pérdida de entrenamiento cae de 1,1083 a 0,4562 mientras la de validación toca mínimo en 0,9737 (época 6) y repunta hasta 1,4120 en la época 11.

## Capacidades

- Clasificación de secuencias de texto: una etiqueta por entrada, con cabeza `XLNetForSequenceClassification`.
- Aprendizaje supervisado sobre un conjunto etiquetado no documentado; el espacio de etiquetas es el definido por el dataset de ajuste.
- Procesamiento de entradas de hasta 512 tokens con tokenizador SentencePiece `cased` (distingue mayúsculas y minúsculas).
- Inferencia por lotes (*batching*) con `eval_batch_size` de 48 validado por el autor.
- No dispone de generación de texto utilizable, *tool calling*, razonamiento multi-paso, agentes, visión ni audio: la cabeza de lenguaje del modelo base se ha sustituido por la de clasificación.
- Sin modo *thinking*, sin capacidades multimodales y sin funciones especiales declaradas.
- Etiquetado `endpoints_compatible` en Hugging Face, lo que permite desplegarlo mediante Inference Endpoints sin adaptaciones.

## Casos de uso

- Triaje de tickets de soporte: clasificar cada mensaje entrante en una categoría predefinida para enrutarlo al equipo adecuado; el coste por inferencia es mínimo (0,36 B de parámetros) y permite procesar lotes grandes en CPU.
- Análisis de sentimiento en encuestas y NPS: si el ajuste corresponde efectivamente a un corpus de opinión en español, el modelo puede etiquetar respuestas abiertas; conviene reentrenarlo o calibrarlo antes, dado el accuracy de 0,5463.
- Moderación de contenido asistida: primera pasada de filtrado sobre comentarios para separar las clases de riesgo, con revisión humana de los casos dudosos; la baja latencia permite integrarlo en el pipeline de publicación.
- Clasificación de intenciones en un chatbot: como clasificador previo que decide la rama conversacional, ejecutado en el mismo nodo que el orquestador sin GPU dedicada.
- Etiquetado automático de corpus para *weak supervision*: preetiquetar grandes volúmenes de texto y reservar la anotación humana para los ejemplos de baja confianza, reduciendo el coste de anotación.
- Clasificación de documentos o correos por temática: con entradas recortadas a 512 tokens, útil para despacho automático de correo y archivado.
- Detección de duplicados o spam por similitud de etiqueta y score: el modelo entrega logits que pueden umbralizarse como señal auxiliar en sistemas de filtrado.

## Benchmarks y rendimiento

El `model-index` de la model card está vacío: el autor no declara resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). Los únicos datos publicados son las métricas del conjunto de evaluación del propio ajuste:

| Métrica | Valor (época 11, final) | Mejor valor observado |
|---|---|---|
| Loss (validación) | 1,4120 | 0,9737 (época 6) |
| F1 macro | 0,5275 | 0,5541 (época 8) |
| F1 weighted | 0,5324 | 0,5576 (época 8) |
| Accuracy | 0,5463 | 0,5682 (época 8) |

Evolución del entrenamiento declarada por el autor:

| Época | Paso | Train loss | Val loss | F1 macro | F1 weighted | Accuracy |
|---|---|---|---|---|---|---|
| 1 | 161 | 1,1083 | 1,0904 | 0,2849 | 0,3028 | 0,3663 |
| 2 | 322 | 1,0978 | 1,0579 | 0,3471 | 0,3613 | 0,4422 |
| 3 | 483 | 1,0375 | 0,9909 | 0,4237 | 0,4340 | 0,5057 |
| 4 | 644 | 0,9835 | 0,9966 | 0,5058 | 0,5061 | 0,5047 |
| 5 | 805 | 0,9285 | 0,9852 | 0,4942 | 0,4986 | 0,5297 |
| 6 | 966 | 0,8210 | 0,9737 | 0,5376 | 0,5359 | 0,5349 |
| 7 | 1127 | 0,7649 | 1,0914 | 0,5353 | 0,5418 | 0,5598 |
| 8 | 1288 | 0,6662 | 1,1528 | 0,5541 | 0,5576 | 0,5682 |
| 9 | 1449 | 0,5688 | 1,1168 | 0,5456 | 0,5506 | 0,5546 |
| 10 | 1610 | 0,5166 | 1,2171 | 0,5354 | 0,5416 | 0,5473 |
| 11 | 1771 | 0,4562 | 1,4120 | 0,5275 | 0,5324 | 0,5463 |

No hay comparación con modelos de referencia en la información disponible, por lo que estos valores no son directamente equiparables a los de otros clasificadores.

## Requisitos de hardware

- Pesos en F32: 361.321.475 × 4 bytes ≈ 1,45 GB. En FP16/BF16 ≈ 0,72 GB; en INT8 ≈ 0,36 GB.
- VRAM estimada para inferencia: ~2 GB en FP32 con lote 1 y secuencias de 128 tokens (pesos + activaciones); ~1,2 GB en FP16.
- Cabe holgadamente en cualquier GPU de consumo: GTX 1660 (6 GB), RTX 3060 (12 GB), RTX 4090 (24 GB). También es viable en CPU para lotes moderados.
- GPU de datacenter (A100, H100, L40S) innecesarias para el tamaño del modelo; solo se justifican por volumen agregado de peticiones o por lotes muy grandes.
- Despliegue recomendado: `transformers` con `pipeline("text-classification")`, ONNX Runtime / Optimum para reducir latencia en CPU, FastAPI o TorchServe como servidor, y Hugging Face Inference Endpoints (el repo lleva la etiqueta `endpoints_compatible`).
- No soportado por los motores de inferencia orientados a generación (vLLM, TGI, llama.cpp, Ollama), que no incluyen la arquitectura XLNet.
- Latencia y throughput: no medidos ni publicados. Como estimación orientativa, en FP16 sobre una RTX 4090 y lotes de 32 secuencias de 128 tokens cabría esperar cientos de secuencias por segundo; conviene medirlo en el entorno objetivo.
- Advertencia de descarga: el repositorio ocupa 160,4 GB, pero los pesos finales son ~1,45 GB. Descargar solo `model.safetensors` (y el tokenizador) para evitar transferir todos los checkpoints intermedios.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este modelo (`xlnet-large-cased-tass-finetuned-2026`) | 361,3 M | 512 tokens | MIT | Hugging Face, `transformers`, `endpoints_compatible` | Accuracy 0,5463 / F1 macro 0,5275 en su propio conjunto de evaluación |
| `xlnet/xlnet-large-cased` (base) | ~360 M | 512 tokens | Apache-2.0 | Hugging Face, ampliamente soportado | No comparable: modelo preentrenado sin cabeza de clasificación ajustada |
| `judajaav/xlnet-large-cased-tass` | no disponible | 512 tokens (arquitectura XLNet) | no disponible | Hugging Face | No disponible; parece un ajuste previo sobre el mismo corpus |
| `roberta-large` | ~355 M | 512 tokens | MIT | Hugging Face, integración nativa en `transformers` | No comparable directamente; requiere ajuste propio |
| `bert-large-cased` | ~335 M | 512 tokens | Apache-2.0 | Hugging Face, soporte universal en motores de inferencia | No comparable directamente; requiere ajuste propio |

La comparación significativa es de coste y compatibilidad: este checkpoint ahorra el ajuste, pero carece de documentación sobre el dataset y su licencia sobre los datos de entrenamiento es una incógnita; los modelos base de la tabla exigen entrenamiento propio pero ofrecen trazabilidad completa y mejor soporte en herramientas de despliegue.

## Limitaciones y advertencias

- Model card incompleta: no se documenta el dataset, el número de etiquetas, la distribución de clases ni los idiomas. El nombre sugiere TASS (corpus de opinión en español), pero no está confirmado.
- Métricas modestas: accuracy 0,5463 y F1 macro 0,5275. Sin conocer el número de clases no puede interpretarse si supera a una línea base trivial; con muchas clases el resultado sería bajo.
- Sobreajuste evidente: la pérdida de validación mínima (0,9737) se alcanza en la época 6 y acaba en 1,4120 en la época 11, mientras la de entrenamiento sigue bajando hasta 0,4562. El checkpoint publicado no es el mejor de la curva según validación.
- `num_epochs` configurado a 20 pero registro detenido en 11: no se especifica si hubo parada temprana, fallo o reanudación pendiente.
- Riesgo de alucinación no aplica (no genera texto), pero sí de calibración deficiente en las probabilidades y de deriva si el dominio de entrada difiere del de entrenamiento.
- Idioma: el modelo base se preentrenó en inglés y la model card no declara idiomas; usar el modelo con textos en español u otras lenguas sin validación previa es arriesgado.
- Límite de 512 tokens: textos más largos deben truncarse o dividirse, con pérdida de contexto.
- Licencia del modelo MIT, pero la licencia del corpus de ajuste es independiente. Si el entrenamiento usó TASS u otro corpus académico con restricciones de uso no comercial, esa restricción prevalece para el uso en producción. Verificar antes de desplegar.
- Arquitectura XLNet en estado legacy: no está soportada por vLLM, TGI, llama.cpp ni Ollama, y conviene fijar la versión de `transformers` (entrenado con 5.20.1) para evitar incompatibilidades.
- Tamaño del repo (160,4 GB) desproporcionado respecto a los pesos: riesgo de descargas largas, de almacenamiento y de confusión sobre qué fichero usar.
- Sin likes ni despliegue por proveedores de inferencia; 229 descargas. No hay evidencia de uso en producción ni validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MayorChris/xlnet-large-cased-tass-finetuned-2026
- Modelo base: https://huggingface.co/xlnet/xlnet-large-cased
- Ajuste relacionado sobre el mismo corpus: https://huggingface.co/judajaav/xlnet-large-cased-tass
- Paper original de XLNet: https://arxiv.org/abs/1906.08237
- Paper de Transformer-XL (backbone): https://arxiv.org/abs/1901.02860
