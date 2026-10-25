# ritwika96/arc-repair-experiment-archive-20261025

## Resumen

`ritwika96/arc-repair-experiment-archive-20261025` no es un modelo único, sino un archivo público de experimentos de investigación con modelos de rejilla (*grid models*) orientados a tareas tipo ARC-AGI, desarrollados por Ritwika Kancharla. El repositorio contiene 41 ejecuciones de entrenamiento, cada una con su mejor checkpoint guardado (incluyendo en muchos casos el estado completo de optimizador y reanudación), pesos extraídos en `safetensors` cuando existía `best.pt`, configuración, argumentos de entrenamiento, registros y métricas de validación. El autor especifica explícitamente que no son modelos de lenguaje Qwen ni checkpoints `AutoModel` de Transformers, sino modelos visuales/de rejilla personalizados que se instancian como `arc.repair_grid.RepairGrid(RepairConfig(**config))`.

El interés del artefacto es de reproducibilidad y arqueología de experimentos: se publica antes de borrar el host H200 que los alojaba, con `manifest.json` de tamaños y sumas SHA-256, y `training-source.tar.gz` con el código de entrenamiento y las instantáneas congeladas de código por ejecución. Las familias de ejecución documentadas abarcan variantes con RoPE, convoluciones, arquitecturas tipo Perceiver, realimentación de estado oculto (*hidden-state feedback*), pérdida `stablece`, optimizador Muon, distintos números de bucles de refinamiento (4 y 6 *loops*) y tamaños que van desde ~0,5 M hasta ~100 M de parámetros.

Es relevante ahora porque expone un conjunto poco habitual de checkpoints intermedios de investigación en ARC-AGI con trazabilidad de configuración y procedencia, útil para estudiar refinamiento iterativo sobre rejillas. No obstante, el propio autor advierte que los subconjuntos de validación difieren entre familias, que la validación de *gravity* no es una puntuación del benchmark ARC y que el conjunto NVARC de 720 registros contiene registros aumentados, no 720 tareas públicas únicas: no se implica ninguna afirmación de resultado en benchmark con conjunto reservado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos visuales/de rejilla personalizados (`arc.repair_grid.RepairGrid`); variantes documentadas con RoPE, convolucionales, Perceiver y realimentación de estado oculto; refinamiento iterativo por bucles (4 y 6 *loops*) |
| Parametros totales | Variable por ejecución; familias identificadas de ~0,5 M (`small05m-*`), ~1,5 M (`gravity-spatial-relations-1p5m-*`), ~2 M (`gravity-perceiver-muon-2m-*`), ~5 M (`gravity-recolour-joint-5m-*`), ~30 M (`rearc-main-30m-*`), ~50 M (`rearc-main-50m-*`) y ~100 M (`nvarc-100m-*`). El total exacto por checkpoint no está tabulado en la información disponible |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible (modelos de rejilla; no se documenta ventana de contexto en tokens) |
| Tipos de cuantizacion | No disponible; se publican pesos en `safetensors` y estados completos `.pt` (fp32 en varias ejecuciones, p. ej. `*-fp32-*`) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible; el autor indica que no se concede una licencia global nueva para material de terceros incluido y que deben conservarse los avisos originales |
| Formato de pesos | `safetensors` (`model.safetensors`) y checkpoints PyTorch serializados (`best.pt`, con estado de optimizador/reanudación); configuración en `best.pt.metadata.json` y `experiments.json`; checksums en `manifest.json`; código en `training-source.tar.gz` |

## Arquitectura y entrenamiento

La arquitectura es propietaria y definida en el código incluido: `RepairGrid` con `RepairConfig`, orientada a la manipulación y reparación iterativa de rejillas. Las ejecuciones documentadas permiten reconstruir la evolución del diseño: baselines (`gravity-baseline-*`), variantes con codificación posicional rotatoria (`gravity-rope-*`, `rearc-main-50m-rope-stablece-*`), variantes convolucionales (`gravity-conv-*`, `small05m-conv-*`, `nvarc-simple-spatial-cnn768-*`), arquitecturas tipo Perceiver (`gravity-perceiver-*`, `nvarc-100m-perceiver-*`), realimentación de estado oculto (`gravity-hiddenstate-feedback-rope-*`) y cabezas específicas de forma (`nvarc-spatial-cnn768-shapeheads-*`). El refinamiento iterativo se parametriza por número de bucles (`-4loops-`, `-6loops-`).

En cuanto al entrenamiento, la información disponible detalla configuración y registros por ejecución (semilla, tamaño de batch, tasa de aprendizaje, pérdida, número de rondas, mezcla de fuentes y paso del checkpoint) pero no el cómputo total de tokens ni la composición completa del dataset. Sí se identifican la pérdida `stablece`, el optimizador Muon y la precisión fp32 en varias ejecuciones, así como el uso de un host H200. La selección de checkpoints es explícita: en las familias antiguas se conservan todos los checkpoints retenidos y se advierte de que el mejor histórico puede no estar disponible; en las familias recientes se conserva `best.pt`. Se documentan validaciones repetidas y selección del mejor checkpoint, sin reclamar ninguna métrica sobre conjunto reservado.

## Capacidades

- Resolución de tareas de rejilla tipo ARC-AGI mediante reparación iterativa de la rejilla de entrada.
- Refinamiento multi-paso: las variantes con 4 y 6 bucles aplican transformaciones sucesivas sobre la representación.
- Modelado de relaciones espaciales (`*-spatial-relations-*`) y de tareas de gravedad implícita en rejillas (`gravity-*`).
- Recodificación de color sobre rejillas (`*-recolour-*`).
- Procesamiento con codificación posicional rotatoria y con agregación tipo Perceiver para rejillas de tamaño variable.
- Soporte de reanudación de entrenamiento: los `.pt` incluyen estado de optimizador y de reanudación.
- No se documenta soporte de *tool calling*, agentes, capacidades multilingües, visión natural, audio ni modo de razonamiento textual.

## Casos de uso

- Reproducción de experimentos ARC-AGI: extraer `training-source.tar.gz`, instanciar `RepairGrid(RepairConfig(**config))` desde `best.pt.metadata.json` y cargar `model.safetensors` con `load_state_dict(..., strict=True)` para replicar la evaluación de un checkpoint concreto.
- Estudio del refinamiento iterativo: comparar ejecuciones con 4 y 6 bucles sobre las mismas tareas para medir el efecto del número de iteraciones en la precisión de reparación de rejillas.
- Ablación de componentes arquitectónicos: las familias con y sin RoPE, con y sin convolución, y con Perceiver frente a atención estándar permiten aislar la contribución de cada bloque con el código congelado de cada ejecución.
- Investigación sobre optimizadores: las ejecuciones con Muon y con `stablece` en fp32 sirven para estudiar estabilidad de entrenamiento en modelos pequeños de rejilla, usando los registros de pérdida y los pasos de checkpoint incluidos.
- Arqueología y auditoría de checkpoints: `manifest.json` con SHA-256 permite verificar integridad de pesos y estados antes de reutilizarlos en un pipeline de investigación.
- Docencia y prototipado rápido: los modelos de ~0,5 M de parámetros (`small05m-*`) son manejables para demostrar tareas de rejilla y flujos de carga de `safetensors` en un entorno de laboratorio.
- Punto de partida para *warm start*: ejecuciones como `rearc-warmstart-v1` (paso 52000) o `h200-resume-v1` (paso 48000) documentan reanudaciones largas utilizables como inicialización de nuevos experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye registros de validación medidos, pero el autor advierte que los subconjuntos de validación difieren entre familias, que la validación de *gravity* no es una puntuación del benchmark ARC y que el conjunto NVARC de 720 registros contiene registros aumentados en lugar de 720 tareas públicas únicas. Por tanto, no se presentan cifras comparables de MMLU, HumanEval, GSM8K ni de ARC-AGI en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como referencia de orden de magnitud, un checkpoint de ~100 M de parámetros ocupa del orden de 400 MB en fp32 y ~200 MB en bf16 solo en pesos; los modelos de ~0,5 M de parámetros ocupan unos pocos MB en fp32. Los checkpoints `.pt` con estado de optimizador ocupan bastante más.
- GPU recomendadas: no disponible. El entrenamiento se realizó en un host H200 según la model card; no se especifican requisitos de inferencia.
- GPU de consumo: por el rango de parámetros (0,5 M a 100 M), los modelos pequeños y medianos del archivo caben previsiblemente en GPUs de consumo con VRAM modesta; no hay requisitos oficiales publicados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La ruta soportada es PyTorch: cargar `model.safetensors` con `safetensors.torch.load_file` y `load_state_dict(..., strict=True)`, o cargar los `.pt` completos con `torch.load(..., map_location="cpu", weights_only=False)` solo desde este archivo de confianza.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arc-repair-experiment-archive-20261025 | ~0,5 M a ~100 M por ejecución | No aplica (rejillas) | Sin benchmark publicado; validaciones internas no comparables | No disponible | HuggingFace, 0 descargas, 0 likes |
| Alternativas de investigación ARC-AGI | No disponible | No disponible | No disponible | No disponible | No disponible |
| Modelos de lenguaje comparables | No aplica | No aplica | No aplica | No aplica | No aplica |

No se dispone de datos verificables sobre modelos alternativos de la misma categoría (reparación iterativa de rejillas para ARC-AGI) en la información proporcionada, por lo que la comparación cuantitativa se marca como no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts en lenguaje natural, chat, *tool calling* ni generación de texto. Cualquier uso esperando un LLM es un error de categoría.
- No es un checkpoint `AutoModel` de Transformers; requiere el código de `arc.repair_grid` incluido en el archivo y, para arquitecturas históricas, la instantánea de código congelada correspondiente en `queued/<run>/source`.
- Los checkpoints de familias antiguas pueden no incluir el mejor histórico: el autor indica explícitamente que un mejor histórico perdido no se representa como recuperado.
- Las métricas de validación no son comparables entre familias y la validación de *gravity* no equivale a una puntuación del benchmark ARC; no debe citarse como resultado en ARC-AGI.
- El conjunto NVARC de 720 registros contiene datos aumentados, no 720 tareas públicas únicas.
- Sin licencia declarada: no se concede licencia global nueva para material de terceros incluido; deben conservarse los avisos originales y verificarse los términos upstream antes de cualquier uso comercial.
- No se incluye el dataset de entrenamiento crudo ni tokens de autenticación; los nombres de dataset y rutas locales documentan procedencia, pero los datos deben obtenerse por separado respetando sus términos.
- Riesgo de seguridad al cargar: los `.pt` son serialización PyTorch y deben cargarse únicamente desde este archivo de confianza, con `weights_only=False` solo cuando se necesite el estado de optimizador.
- Sesgos conocidos: no documentados; al ser modelos de rejilla sintética, los sesgos lingüísticos o sociales habituales no aplican, pero no hay evaluación de sesgo disponible.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; sí existe riesgo de sobreajuste a las distribuciones de rejilla de entrenamiento, no cuantificado en la información disponible.
- Estado del repositorio: 0 descargas y 0 likes, sin pipeline declarado; es un artefacto de investigación, no un modelo listo para producción.

## Enlaces

- HuggingFace: https://huggingface.co/ritwika96/arc-repair-experiment-archive-20261025
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada; los resultados devueltos trataban sobre la ciudad francesa de Cahors y no guardan relación con este modelo.
