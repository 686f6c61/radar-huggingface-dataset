# huggingface-mic/dinov2-small-mic

## Resumen

`huggingface-mic/dinov2-small-mic` es un artefacto de prueba (test artifact) publicado por la organización `huggingface-mic`, no un modelo utilizable. Se trata de una versión reducida (slim) del checkpoint `facebook/dinov2-small`, generada automáticamente para servir como fixture en pruebas de integración de la librería `transformers-mic`. El repositorio incluye pesos reducidos, uso ejecutable y expectativas de framework (directorio `integrations/transformers/expectations`) en un único paquete.

El modelo conserva la arquitectura `Dinov2Model` (transformer de visión para extracción de características de imagen), pero con la configuración encogida: `num_hidden_layers` reducido a 2, lo que deja el total en aproximadamente 225.856 parámetros según los safetensors publicados. Los pesos son aleatorios (semilla 17), no entrenados, y se guardan en float32. El autor lo etiqueta explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

Su relevancia es puramente de ingeniería: permite validar contratos de integración (nombres de tensores, ficheros de procesador copiados byte a byte desde el modelo original, comportamiento finito en float32, bfloat16 y float16) sin descargar ni ejecutar el checkpoint real de DINOv2. No debe emplearse para inferencia real, investigación ni producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dinov2Model (transformer de visión), configuración encogida a 2 capas ocultas |
| Parametros totales | 225.856 (según safetensors publicados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; no aplica ventana de texto) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura subyacente es DINOv2 (ViT auto-supervisado para características visuales), instanciada como `Dinov2Model`. El fixture aplica la regla genérica de reducción de `sweep.py` del repositorio `transformers-mic`, fijando `num_hidden_layers` a 2 y manteniendo los mismos nombres de tensores que el checkpoint real `facebook/dinov2-small`. Los ficheros de procesador (`preprocessor_config.json`) se copiaron byte a byte desde el modelo original.

No hubo entrenamiento: los pesos son aleatorios con semilla 17. Se validaron mediante una "input-sensitivity gate" que exige que toda perturbación de las entradas del contrato mueva los logits al menos 0,001; la perturbación más débil (`pixel_values:halve`) produjo un desplazamiento de 0,331. El artefacto se guardó en float32 (el dtype por defecto de `facebook/dinov2-small`) y se comprobó que forward, pérdida y gradientes son finitos en float32, bfloat16 y float16. La clave de fixture es `c18a1be82d3e`.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no han sido entrenados, por lo que no produce características visuales útiles.
- Sirve como fixture de pruebas para validar la integración de `Dinov2Model` en `transformers-mic`: nombres de tensores, carga de pesos, ficheros de procesador y expectativas de framework.
- Verificado numéricamente estable (sin NaN/Inf en forward, loss y gradientes) en float32, bfloat16 y float16.
- Sensibilidad a entradas confirmada: perturbaciones sobre `pixel_values` alteran los logits por encima del umbral del contrato.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto ni capacidades multilingües.
- No dispone de modo thinking, visión funcional, audio ni ninguna capacidad de inferencia real.

## Casos de uso

- Pruebas de integración en CI: usar el fixture para ejecutar la suite de tests de `transformers-mic` sin descargar `facebook/dinov2-small`, verificando que la carga de pesos y el forward pass funcionan con los nombres de tensores esperados.
- Validación de contratos de framework: comprobar que el directorio `integrations/transformers/expectations` coincide con la salida real del modelo reducido antes de actualizar la librería.
- Desarrollo de nuevas reglas de reducción: servir como caso de referencia para `sweep.py`, comparando la configuración encogida con el checkpoint original.
- Verificación de dtypes: testear rutas de ejecución en float32, bfloat16 y float16 comprobando finitud de gradientes en pipelines de entrenamiento simulados.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture dinov2-small-mic` y comparar hashes registrados en `build.json`.
- Pruebas de regresión de procesadores: validar que `preprocessor_config.json` copiado byte a byte se carga correctamente en el pipeline de Transformers sin depender del modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 (225.856 parámetros, ~0,9 MB de pesos); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (carga estándar de `Dinov2Model`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al tratarse de un fixture de 2 capas con pesos aleatorios, las mediciones no serían representativas de DINOv2 real.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Uso previsto |
|---|---|---|---|---|
| huggingface-mic/dinov2-small-mic | 225.856 | Fixture de pruebas (pesos aleatorios) | no disponible | Validación de integración |
| facebook/dinov2-small | no disponible en la información | Modelo de visión DINOv2 real | no disponible en la información | Extracción de características de imagen |
| Otros fixtures de transformers-mic | no disponible | Fixtures de pruebas | no disponible | Validación de integración |

No se dispone de datos de rendimiento comparables, ya que el artefacto no es un modelo funcional.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no producen características visuales significativas.
- Etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- Licencia no especificada en la información disponible; verificar antes de cualquier uso, aunque el uso previsto es únicamente de pruebas.
- Sin datos de sesgos, alucinación o cobertura idiomática: no aplica al no ser un modelo entrenado.
- La configuración encogida (2 capas) no representa el comportamiento del checkpoint real `facebook/dinov2-small`.
- Cualquier métrica de rendimiento obtenida con este fixture no es extrapolable al modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/dinov2-small-mic
- Modelo base: https://huggingface.co/facebook/dinov2-small
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reducción (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/dinov2-small-mic.html
