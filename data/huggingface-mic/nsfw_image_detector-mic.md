# huggingface-mic/nsfw_image_detector-mic

## Resumen

`nsfw_image_detector-mic` es un artefacto de prueba publicado por la organización `huggingface-mic` como parte de la infraestructura de validación de contratos de `transformers`. No es un modelo entrenado ni utilizable para inferencia real: se trata de una versión "slim" (reducida) del checkpoint `Freepik/nsfw_image_detector`, un clasificador de imágenes NSFW basado en `TimmWrapperForImageClassification`. El repositorio incluye pesos reducidos, ejemplos de uso y las expectativas de framework necesarias para verificar la integración del modelo original con la librería.

El modelo conserva la misma arquitectura y los mismos nombres de tensor que el checkpoint original, pero los pesos son aleatorios (semilla 17) y la configuración está reducida mediante la regla genérica de `sweep.py`. Con 86.351.620 parámetros, el artefacto sirve para validar que el pipeline de `transformers` carga, ejecuta y propaga gradientes correctamente sobre la arquitectura del detector NSFW original, sin necesidad de distribuir los pesos reales.

Es relevante únicamente en el contexto de desarrollo y testing de integraciones: la etiqueta `test-artifact` lo excluye explícitamente de la búsqueda de modelos candidatos. Cualquier uso en producción sería un error, ya que las predicciones del modelo son esencialmente aleatorias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TimmWrapperForImageClassification (clasificador de imágenes basado en timm) |
| Parametros totales | 86.351.620 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; compatible con float32 y float16 según la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Freepik/nsfw_image_detector |
| Tipo de artefacto | test-artifact (fixture de validación, pesos aleatorios) |
| Tamano del repo | 0.2 GB |
| Dtype de carga por defecto | bfloat16 |

## Arquitectura y entrenamiento

El modelo es un `TimmWrapperForImageClassification`, es decir, un envoltorio de `transformers` sobre un backbone de la librería `timm` configurado para clasificación de imágenes. La arquitectura subyacente corresponde al checkpoint `Freepik/nsfw_image_detector`, del que hereda la estructura de capas y los nombres de tensor, pero no los pesos: la configuración ha sido reducida mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`, manteniendo la misma topología.

No ha habido entrenamiento. Los pesos son aleatorios con semilla 17 y se generaron únicamente para superar una puerta de sensibilidad a la entrada: cada perturbación de los inputs del contrato mueve los logits al menos 0,001 (la más débil, `pixel_values:roll_batch`, mueve 0,0273). Los ficheros de procesador se copiaron byte a byte desde el checkpoint original. El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture `825396ff4c10` agrupa todos los checkpoints cuyos ficheros de procesador son idénticos byte a byte y cuya configuración coincide tras el proceso de reducción.

## Capacidades

- Clasificación de imágenes mediante `TimmWrapperForImageClassification` (estructura compatible con el detector NSFW original).
- Carga y ejecución en `transformers` con los mismos nombres de tensor que el checkpoint real.
- Ejecución en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- Validación de contratos de entrada/salida del pipeline de clasificación de imágenes.
- No realiza detección NSFW real: los pesos son aleatorios.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües (no procesa texto).

## Casos de uso

- Test de integración de `transformers`: verificar que `TimmWrapperForImageClassification` carga el checkpoint, ejecuta el forward y propaga gradientes sin errores en CI.
- Validación de contratos de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen sobre la arquitectura del detector NSFW.
- Pruebas de regresión de la librería: detectar cambios que rompan la compatibilidad con checkpoints de tipo `TimmWrapper` sin necesidad de descargar los pesos reales.
- Desarrollo de pipelines de clasificación de imágenes: usar el fixture como sustituto ligero del modelo real durante el desarrollo de código de preprocesado y postprocesado.
- Verificación de dtypes: comprobar el comportamiento de la carga en bfloat16 por defecto y la conversión a float32/float16 en entornos con distintas capacidades de hardware.
- Reproducción de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture nsfw_image_detector-mic` y comparar hashes con `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (precisión, recall, F1 sobre NSFW) sería meaningless y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (86,4 M de parámetros, ~173 MB de pesos) más memoria de activaciones, que depende del tamaño de imagen de entrada.
- GPU recomendadas: cualquier GPU con soporte bfloat16 o float16; no requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para pruebas.
- Opciones de despliegue: `transformers` (con `TimmWrapperForImageClassification`), `timm` como backend subyacente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un clasificador de imágenes).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Pesos | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `huggingface-mic/nsfw_image_detector-mic` | 86,4 M | Clasificación de imágenes (fixture) | Aleatorios (semilla 17) | no disponible | Test de integración |
| `Freepik/nsfw_image_detector` | no disponible en la información | Detección NSFW | Entrenados | no disponible | Producción |
| Otros fixtures `*-mic` de `huggingface-mic` | variable | Varias | Aleatorios | no disponible | Test de integración |

La comparación relevante es con el checkpoint base `Freepik/nsfw_image_detector`: misma arquitectura y mismos nombres de tensor, pero pesos reales frente a pesos aleatorios. El fixture no es un sustituto funcional del modelo original.

## Limitaciones y advertencias

- Los pesos son aleatorios: las predicciones no tienen ningún valor semántico y no deben interpretarse como detección NSFW.
- Etiquetado explícitamente como `test-artifact` y excluido de la búsqueda de modelos candidatos; no usar en producción bajo ningún concepto.
- La licencia no está disponible en la información proporcionada; verificar la licencia del modelo base `Freepik/nsfw_image_detector` antes de cualquier uso derivado.
- El repositorio está marcado como `not-for-all-audiences` por la temática del modelo base (detección NSFW).
- La configuración está reducida respecto al checkpoint original; el número de parámetros (86,4 M) no coincide necesariamente con el del modelo real.
- Los ficheros de procesador se copiaron del modelo base, pero el resto de artefactos (usage, expectations) deben regenerarse con `build_fixtures.py` si se necesita una reproducción completa.
- No hay garantía de que la puerta de sensibilidad a la entrada (movimiento mínimo de logits de 0,001) sea suficiente para validar comportamientos numéricos finos en todos los backends.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/nsfw_image_detector-mic
- Modelo base: https://huggingface.co/Freepik/nsfw_image_detector
- Manifest de contrato: `integration.json` (en el repo)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repo)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repo)
- Procedencia del fixture: `build.json` (en el repo)
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/nsfw_image_detector-mic.html
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
