# jotap1101/tcc-coffee-segformer-emater

## Resumen

SegFormer fine-tuneado para segmentación semántica binaria de cultivos de café a partir de imágenes satelitales Sentinel-2. Lo desarrolla el usuario jotap1101 como parte de un trabajo de fin de curso (TCC), y se publica como un conjunto de cinco checkpoints (uno por doble) obtenidos mediante validación espacial k-fold sobre la fuente de referencia emater de 2018. El modelo parte de la variante `nvidia/mit-b1` del encoder MiT y adapta la primera proyección para aceptar cuatro bandas espectrales (B2, B3, B4 y B8) en lugar de las tres RGB habituales.

La relevancia práctica está en que ofrece un pipeline reproducible de teledetección aplicada a agricultura: parches de 512x512 píxeles, umbral de decisión fijado en 0,5 y métricas por doble publicadas junto a los pesos, lo que permite auditar el rendimiento antes de desplegar. El rendimiento agregado micro alcanza IoU 0,6878 y F1 0,8150 sobre el conjunto de validación, con una media por doble de IoU 0,6770 ± 0,0308.

No es un modelo generativo ni un LLM: es un segmentador denso de tipo transformer jerárquico, con licencia MIT y un tamaño de repositorio de 0,3 GB. Su interés para desarrolladores e investigadores radica en la trazabilidad del experimento (hashes de pesos, fingerprints de partición y configuración de entrenamiento completos) más que en un rendimiento estado del arte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer (encoder jerárquico MiT, variante `nvidia/mit-b1`, decoder de segmentación semántica) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada por parche de 512x512 píxeles con múltiplo de parche 32 |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch, `state_dict` en `.pt`) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT (pesos y código) |
| Formato de pesos | PyTorch `state_dict` (`fold_0.pt` a `fold_4.pt`), cargable con `torch.load(..., weights_only=True)` |

## Arquitectura y entrenamiento

El modelo es un SegFormer estándar construido sobre el encoder MiT-B1 de NVIDIA, con la primera capa de proyección modificada para recibir cuatro canales en lugar de tres. Las bandas de entrada son B2 (azul), B3 (verde), B4 (rojo) y B8 (infrarrojo cercano) de Sentinel-2, una combinación habitual en índices de vegetación. La salida del decoder se reamuestra a la resolución de la entrada, y la predicción binaria se obtiene aplicando un umbral fijo de 0,5 sobre la probabilidad de la clase café. Los parches de entrenamiento y validación son de 512x512 píxeles, con un múltiplo de parche de 32 impuesto por la arquitectura.

El entrenamiento se realizó durante 100 épocas con learning rate 1e-4, weight decay 1e-4 y batch size 16, usando una función de pérdida compuesta con pesos iguales (1,0) para los términos Dice, focal y de frontera. La validación es espacial k-fold con cinco dobles: cada checkpoint `fold_i.pt` se entrenó con las cuatro dobles restantes y se evaluó sobre la doble i, lo que evita fuga de información por proximidad geográfica. Los datos provienen de la fuente de referencia emater (2018) con código de región 310044, y el número de parches de validación por doble oscila entre 18 y 31. El repositorio incluye fingerprints de manifiesto, partición y configuración, además de hashes SHA-256 truncados de cada peso, lo que facilita la reproducibilidad.

## Capacidades

- Segmentación semántica binaria de café sobre imágenes Sentinel-2 con cuatro bandas (B2, B3, B4, B8).
- Generación de máscaras densas a resolución de entrada (parches de 512x512, reamuestreo a la resolución original).
- Evaluación por doble con métricas publicadas (IoU, F1, precisión, recall) y desviaciones estándar.
- Carga directa del `state_dict` en PyTorch con `weights_only=True`, sin dependencias de frameworks de alto nivel.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo "thinking", visión general, audio ni multimodalidad más allá de la entrada multiespectral.

## Casos de uso

- Monitorización de fincas cafetaleras: el modelo permite generar mapas binarios de presencia de café a partir de mosaicos Sentinel-2, con un IoU agregado de 0,6878 que sirve como referencia para priorizar revisiones manuales en las zonas de mayor incertidumbre.
- Estimación de superficie cultivada: integrando las máscaras sobre parches contiguos se puede calcular el área de café por parcela; la validación k-fold espacial da una idea realista de la variabilidad esperada entre regiones (desviación de IoU de 0,0308 entre dobles).
- Priorización de inspecciones de campo: al ser un modelo ligero (repo de 0,3 GB, encoder MiT-B1), se puede ejecutar en CPU o en GPU consumer para prefiltrar teselas y enviar solo las dudosas a verificación humana.
- Investigación reproducible en teledetección: los fingerprints de partición y configuración permiten replicar exactamente el experimento y comparar futuras variantes (otros sensores, otras regiones) contra una línea base documentada.
- Detección de cambios multitemporales: aplicando el modelo a imágenes de distintos años y comparando máscaras se pueden identificar pérdidas o ganancias de superficie cafetalera, siempre que las estadísticas de normalización (`normalization_stats_emater.json`) se apliquen de forma consistente.
- Integración en pipelines de agricultura de precisión: la salida binaria puede alimentar sistemas de recomendación de insumos o de planificación de cosecha, usando el umbral 0,5 como punto de partida y ajustándolo según el coste relativo de falsos positivos y negativos.
- Docencia y formación: al ser un ejemplo completo de fine-tuning de SegFormer con validación espacial, sirve como material de referencia en cursos de aprendizaje profundo aplicado a ciencias de la tierra.

## Benchmarks y rendimiento

Resultados de validación publicados en la model card (umbral 0,5):

| fold | patches | IoU | F1 | Precisión | Recall |
| --- | --- | --- | --- | --- | --- |
| 0 | 18 | 0,6362 | 0,7777 | 0,7753 | 0,7801 |
| 1 | 21 | 0,6646 | 0,7985 | 0,7750 | 0,8235 |
| 2 | 25 | 0,6645 | 0,7984 | 0,8079 | 0,7892 |
| 3 | 30 | 0,6920 | 0,8180 | 0,7991 | 0,8378 |
| 4 | 31 | 0,7275 | 0,8422 | 0,8244 | 0,8609 |

| Agregado | Valor |
| --- | --- |
| IoU micro | 0,6878 |
| F1 micro | 0,8150 |
| Precisión micro | 0,8020 |
| Recall micro | 0,8285 |
| IoU media por doble ± desv. | 0,6770 ± 0,0308 |
| F1 media por doble ± desv. | 0,8070 ± 0,0218 |

No se han publicado resultados de benchmarks en la información disponible para comparaciones con otros modelos fuera del propio conjunto de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del encoder MiT-B1 y parches de 512x512, el consumo es moderado y cabe holgadamente en GPUs consumer, aunque no se publican cifras concretas.
- GPU recomendadas: no disponible. Cualquier GPU con soporte CUDA y suficiente memoria para lotes pequeños de parches de 512x512 debería ser suficiente; una RTX 3060 o superior es un punto de partida razonable, pero no está confirmado por el autor.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño del repositorio (0,3 GB) y la variante B1 del encoder; sin cifras oficiales de VRAM.
- Opciones de despliegue: PyTorch nativo con `torch.load` y `build_segformer()` del paquete `src` del repositorio `github.com/jotap1101/tcc-lab`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un segmentador visual).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de segmentación de café o de cultivos en la información proporcionada. Como referencia cualitativa:

| Modelo | Tipo | Entrada | Contexto/parche | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| tcc-coffee-segformer-emater | SegFormer (MiT-B1) | 4 bandas Sentinel-2 | 512x512 | MIT | HuggingFace |
| Otros segmentadores de cultivos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente con la fuente emater (2018) y la región 310044; la generalización a otras regiones, años o sensores no está validada y el rendimiento podría degradarse.
- El umbral de decisión está fijado en 0,5; en producción conviene recalibrarlo según el coste de falsos positivos y negativos, ya que la precisión y el recall agregados (0,8020 y 0,8285) no son simétricos.
- El número de parches de validación por doble es reducido (entre 18 y 31), lo que limita la precisión estadística de las métricas y explica la variabilidad entre dobles (desviación de IoU de 0,0308).
- No se documentan sesgos específicos, pero al ser un modelo geográficamente acotado puede infrarrepresentar variedades de café, sistemas de cultivo o condiciones atmosféricas no presentes en emater 2018.
- Riesgo de alucinación en el sentido de falsos positivos en superficies con firma espectral similar al café (otras coberturas vegetales); requiere validación con datos independientes.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; el autor no ofrece soporte ni mantenimiento.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones ni agentes, y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- La normalización de entrada depende de `normalization_stats_emater.json`; usar otras estadísticas invalida las métricas publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jotap1101/tcc-coffee-segformer-emater
- Repositorio de código y paquete `src`: https://github.com/jotap1101/tcc-lab
