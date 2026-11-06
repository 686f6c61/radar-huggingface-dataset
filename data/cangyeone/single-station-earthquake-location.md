# cangyeone/single-station-earthquake-location

## Resumen

Single-station earthquake location es un archivo de reproducibilidad asociado al artículo "Fine-Tuning Scope Changes the Relationship Between Record Length and Epicentral Accuracy in Single-Station Earthquake Location", firmado por Wanli Ren, Ziye Yu, Shirong Liao, Xin Liu, Yuqi Cai y Caihua Li. No es un modelo generativo al uso, sino un paquete de investigación que reúne listas de registros sísmicos, definiciones de particiones, la inicialización original de SeismicXM, código de arquitectura ejecutable, 27 modelos ajustados, predicciones congeladas y el código de las referencias clásicas. El objetivo es permitir la replicación exacta del estudio sobre localización epicentral con una sola estación sísmica.

El modelo subyacente es SeismicXM, una red neuronal de 51.895.545 parámetros en sus módulos preentrenados y cabezas originales; la variante adaptada en el artículo retiene un conjunto distinto de módulos y suma 41.338.282 parámetros. La tarea abordada es la localización de terremotos a partir de formas de onda de una única estación, un problema clásicamente mal condicionado que el estudio analiza en función de la duración del registro y del alcance del ajuste fino (transfer learning).

La relevancia actual radica en su carácter de archivo verificado: checksums SHA-256 por fichero, revisiones fijadas, predicciones congeladas y scripts de verificación. Está pensado para investigadores en sismología que necesiten reproducir resultados sin depender de la rama `main` en movimiento, y para quienes quieran reutilizar los puntos de control ajustados como línea base en experimentos de localización con una sola estación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal profunda para formas de onda sísmicas (SeismicXM), no disponible el detalle de capas en la información proporcionada |
| Parámetros totales | 51.895.545 (modelo original liberado); 41.338.282 (modelo adaptado del artículo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre ventanas de forma de onda, no sobre tokens de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, zh (documentación y material del repositorio) |
| Licencia | mixed-research-release (license: other); componentes vendorizados bajo GPL-3.0 |
| Formato de pesos | checkpoints PyTorch (`.pt`); inicialización `pretrained/seismicxm.middle.pt` (207.709.060 bytes) |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo nuevo en esta actualización de empaquetado. La inicialización exacta es `pretrained/seismicxm.middle.pt`, con SHA-256 `3f051c950ef26110f922c30a3c7d11ed5a73b84bb98e99c2b7943a2a0908b174`, y la arquitectura fijada junto con su licencia GPL-3.0 original se encuentra en `vendor/seismicxm/`. SeismicXM fue preentrenado con CSNCD (Zhendian); las citas originales del modelo y del conjunto de datos se conservan en `paper/current/references.bib`. Los cargadores (`inference/load_pretrained.py` y `inference/load_checkpoint.py`) restauran los state dictionaries de forma estricta, y el checkpoint intermedio es el estado tensorial original, no una conversión ni un sustituto reentrenado.

El estudio compara condiciones de duración de registro y alcance del ajuste fino mediante transfer learning, con ocho condiciones del estudio de duración por tres semillas más tres controles D-wide, totalizando 27 checkpoints ajustados seleccionados. Las formas de onda proceden del California Earthquake Event Dataset (CEED), descrito por Zhu et al. (2025) en arXiv:2502.11500, con distribuciones HDF5 archivadas como QuakeFlow-NC y QuakeFlow-SC en revisiones fijadas. Las cohortes retenidas de NC contienen 14.647 registros de entrenamiento, 1.375 de validación y 1.395 de test; la cohorte de test de SC contiene 2.000 registros. Los checkpoints incluidos contienen estados de modelo seleccionados, no instantáneas de reanudación con estado del optimizador.

## Capacidades

- Localización epicentral de terremotos a partir de formas de onda de una única estación sísmica.
- Extracción de características de forma de onda con normalización de entrada y descriptores de amplitud preservados.
- Decodificación de predicciones con sidecars de predicciones congeladas para comparación reproducible.
- Evaluación de referencias clásicas: catálogo S–P, envolvente adaptada de Odaka, relaciones τc/Pd y polarización.
- Calibración con datos de entrenamiento y validación de NC, congelada para la evaluación en SC.
- Reconstrucción local de las entradas del estudio desde las fuentes HDF5 originales, con verificación de hashes.
- Ejecución de entrenamiento portable mediante configuraciones documentadas en `inference/README.md`.
- Verificación de integridad del release mediante `verify_release.py` y `checksums/files.json`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo numérico de sismología.
- Idiomas de la documentación y material del repositorio: inglés y chino.

## Casos de uso

- Reproducción de resultados publicados: un investigador descarga la revisión `srl-unified-2026-11-06-v3`, ejecuta `verify_release.py` y compara sus predicciones con los sidecars congelados, garantizando que las cifras del artículo se replican sin desviaciones por cambios en la rama `main`.
- Estudio del efecto de la duración del registro: con las ocho condiciones de duración y tres semillas por condición, se puede analizar cómo varía la precisión epicentral al acortar o alargar la ventana de forma de onda, reutilizando los checkpoints ya ajustados en lugar de reentrenar.
- Análisis del alcance del ajuste fino: los tres controles D-wide permiten aislar el efecto de adaptar más o menos módulos de SeismicXM, útil para decidir estrategias de transfer learning en sismología con datos escasos.
- Línea base para nuevos modelos de localización: los 27 checkpoints y las predicciones congeladas sirven como referencia cuantitativa contra la que comparar arquitecturas propias sobre las mismas particiones de NC y SC.
- Evaluación de métodos clásicos frente a aprendizaje profundo: `classical_references/reproduce.py replay --figures` regenera predicciones clásicas y comparaciones pareadas, permitiendo contrastar S–P, Odaka, τc/Pd y polarización con el modelo neuronal bajo la misma calibración NC.
- Validación de generalización entre regiones: el modelo se calibra con NC y se evalúa en SC, un escenario realista de transferencia geográfica que puede reutilizarse para probar la robustez de modelos propios ante cambios de red sísmica.
- Docencia y formación en sismología computacional: el paquete incluye código ejecutable, instrucciones de reconstrucción de la caché y verificación de hashes, lo que permite montar prácticas reproducibles en CPU con la descarga parcial indicada en la model card.
- Auditoría de integridad de artefactos científicos: el esquema de checksums por fichero y `RELEASE.json` con revisiones de origen sirve de plantilla para publicar resultados sísmicos verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el modelo original ronda los 52 millones de parámetros y la variante adaptada los 41 millones, por lo que el estado de pesos en FP32 ocupa del orden de 200 MB y en FP16 del orden de 100 MB, sin contar activaciones ni buffers de entrada.
- GPU recomendadas: no disponible; la model card documenta explícitamente ejecución en CPU (`--device cpu`) para los cargadores de checkpoint.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de pesos, aunque no se confirma en la información disponible.
- Despliegue: scripts propios de PyTorch (`inference/load_pretrained.py`, `inference/load_checkpoint.py`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Descarga parcial solo para análisis numérico en CPU: `--include 'current/*' 'classical_references/*' 'preflight_20260928/*' 'requirements-replay.txt' 'verify_release.py' 'checksums/*'`, con `python verify_release.py --allow-missing`. Esta descarga parcial no basta para extracción de formas de onda crudas ni para entrenamiento.
- Descarga completa del release: aproximadamente 5 GB; el repositorio en Hugging Face ocupa 11,4 GB.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Single-station earthquake location (este release) | 51.895.545 original / 41.338.282 adaptado | Localización epicentral con una estación | no aplica | mixed-research-release, con componentes GPL-3.0 | Hugging Face, revisión fijada `srl-unified-2026-11-06-v3` |
| SeismicXM (inicialización original) | 51.895.545 | Representación de formas de onda sísmicas | no aplica | GPL-3.0 (vendorizada en `vendor/seismicxm/`) | Incluida en este repositorio como `pretrained/seismicxm.middle.pt` |
| Referencias clásicas (S–P, Odaka, τc/Pd, polarización) | no aplica (métodos analíticos) | Localización y estimación de magnitud | no aplica | según implementación, no disponible | Código en `classical_references/` |

No se dispone de datos comparativos de rendimiento entre estos enfoques en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso; cualquier uso fuera de sismología cuantitativa es inadecuado.
- Los recuentos de parámetros (51.895.545 y 41.338.282) describen arquitecturas distintas y no deben compararse directamente como si fueran el mismo modelo.
- Los checkpoints contienen estados de modelo seleccionados, no instantáneas de reanudación con estado del optimizador; no sirven para continuar un entrenamiento interrumpido.
- La descarga parcial solo permite el replay numérico; no habilita la extracción de formas de onda crudas ni el entrenamiento.
- El repositorio usa una licencia mixta (`mixed-research-release`) con componentes GPL-3.0; es imprescindible revisar `LICENSES.md` antes de cualquier uso comercial o redistribución.
- Las formas de onda masivas no se distribuyen en el archivo: deben reconstruirse desde QuakeFlow-NC y QuakeFlow-SC en las revisiones fijadas, lo que añade dependencia de terceros y coste de descarga.
- La calibración de las referencias clásicas está congelada sobre NC; la evaluación en SC mide transferencia geográfica y no debe interpretarse como rendimiento universal.
- Debe preservarse el orden congelado y la escala de amplitud; alterarlos invalida la comparación con las predicciones congeladas.
- Ejecutar los generadores puede sobrescribir ficheros derivados y metadatos de PDF en la copia local; hay que verificar la descarga antes de relanzar.
- No se han publicado cifras de sesgo, alucinación o robustez fuera de los conjuntos CEED en la información disponible.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación comunitaria independiente documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cangyeone/single-station-earthquake-location
- Revisión unificada: https://huggingface.co/cangyeone/single-station-earthquake-location/tree/srl-unified-2026-11-06-v3
- Licencias: https://huggingface.co/cangyeone/single-station-earthquake-location/blob/srl-unified-2026-11-06-v3/LICENSES.md
- Paper del conjunto de datos CEED (arXiv:2502.11500): https://arxiv.org/abs/2502.11500
- Dataset QuakeFlow-NC: https://huggingface.co/datasets/AI4EPS/quakeflow_nc
- Dataset QuakeFlow-SC: https://huggingface.co/datasets/AI4EPS/quakeflow_sc
