# huggingface-mic/mask2former-swin-tiny-coco-instance-mic

## Resumen

`huggingface-mic/mask2former-swin-tiny-coco-instance-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic`, no un modelo entrenado utilizable. Se trata de una versión reducida del checkpoint `facebook/mask2former-swin-tiny-coco-instance`, un modelo de segmentación de instancias basado en la arquitectura Mask2Former con backbone Swin Transformer Tiny. El fixture conserva la misma clase de arquitectura (`Mask2FormerForUniversalSegmentation`) y los mismos nombres de tensores que el modelo original, pero con una configuración drásticamente reducida: 2 capas en el encoder, 2 en el decoder y 2 capas en el backbone, lo que da un total de 8.049.040 parámetros.

El propósito declarado es servir como fixture de integración para el proyecto `transformers-mic`, verificando que el pipeline de carga, preprocesado y forward pass de Transformers funciona correctamente con la arquitectura Mask2Former sin necesidad de descargar el checkpoint completo. Los pesos son aleatorios (semilla 17) y pasaron un test de sensibilidad a la entrada, pero no han sido entrenados para ninguna tarea real. El repositorio incluye el manifiesto de contrato (`integration.json`), la documentación de uso con Transformers y las expectativas del framework.

Es relevante ahora únicamente en el contexto de pruebas de integración y CI de la librería Transformers: no debe usarse para inferencia real de segmentación. El propio autor lo etiqueta como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mask2FormerForUniversalSegmentation (transformer con backbone Swin Transformer) |
| Parametros totales | 8.049.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo original del que deriva es Mask2Former, una arquitectura de segmentación universal que combina un backbone de extracción de características (Swin Transformer Tiny) con un pixel decoder y un transformer decoder con consultas de máscara. La clase implementada en Transformers es `Mask2FormerForUniversalSegmentation`, orientada a segmentación de instancias sobre COCO. El fixture reduce la configuración del original mediante la regla genérica de `sweep.py`: `encoder_layers=2`, `decoder_layers=2` y `backbone num_layers=2`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y pasaron una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movió los logits al menos 0,001 (la más débil, `pixel_values:halve`, con 0,00101). Se conservan los mismos nombres de tensores que el checkpoint real, incluida la omisión de `model.pixel_level_module.encoder.swin.layernorm.bias` y `model.pixel_level_module.encoder.swin.layernorm.weight`, que el checkpoint original tampoco incluye. Los ficheros del procesador (`preprocessor_config.json`) se copiaron byte a byte desde `facebook/mask2former-swin-tiny-coco-instance`.

## Capacidades

- No es un modelo funcional: no realiza segmentación real, generación de texto, razonamiento, código ni matemáticas.
- Ejecuta el forward pass de `Mask2FormerForUniversalSegmentation` con pesos aleatorios, devolviendo logits y pérdidas finitas en float32, bfloat16 y float16.
- Permite verificar la carga de checkpoints, el mapeo de nombres de tensores y la compatibilidad con el procesador del modelo original.
- Sirve como fixture determinista (clave `6cdde2aa8848`) para tests de integración en CI.
- No soporta tool calling, agentes, multi-step reasoning ni capacidades multilingües.
- No dispone de modo thinking, visión funcional, audio ni otras capacidades especiales más allá del contrato de arquitectura que replica.

## Casos de uso

- Tests de integración en CI de Transformers: el fixture permite ejecutar la carga y el forward pass de Mask2Former en pipelines automatizados sin descargar el checkpoint completo, reduciendo tiempo y ancho de banda.
- Validación de contratos de framework: el repositorio incluye `integration.json` y el directorio `integrations/transformers/expectations`, que se usan para comprobar que la API de Transformers cumple lo esperado para esta arquitectura.
- Verificación de compatibilidad de procesador: al copiar `preprocessor_config.json` byte a byte, permite comprobar que el preprocesado del modelo original se integra correctamente sin depender de sus pesos.
- Pruebas de dtype y estabilidad numérica: al ser finito en float32, bfloat16 y float16, sirve para validar rutas de mixed precision en el forward, la pérdida y los gradientes.
- Reproducción de fixtures: mediante `python example/build_fixtures.py --fixture mask2former-swin-tiny-coco-instance-mic` se puede reconstruir el artefacto y comparar hashes registrados en `build.json`.
- Depuración de mapeo de tensores: al conservar los nombres de tensores del checkpoint real (incluidas las omisiones), ayuda a diagnosticar problemas de carga de pesos en la arquitectura Mask2Former.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que es un artefacto de prueba con pesos aleatorios, por lo que no procede evaluar métricas de segmentación (mAP, PQ, etc.) sobre él.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 8,0 M de parámetros en float32 el peso ronda los 32 MB, y en float16 unos 16 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100, H100 ni RTX 4090. Una GTX 1050 o una iGPU con soporte CUDA/ROCm es suficiente.
- Cabe en GPU consumer: sí, en todas las gamas actuales.
- Opciones de despliegue: carga directa con `transformers` (clase `Mask2FormerForUniversalSegmentation`); no está pensado para vLLM, TGI ni llama.cpp, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; al ser un fixture reducido, la latencia sería muy inferior a la del modelo original, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/mask2former-swin-tiny-coco-instance-mic | 8.049.040 | no disponible | Fixture de segmentación (pesos aleatorios) | no disponible | Hugging Face |
| facebook/mask2former-swin-tiny-coco-instance | no disponible en la informacion proporcionada | no disponible | Segmentación de instancias COCO | no disponible en la informacion proporcionada | Hugging Face |
| Otros Mask2Former (Swin-B, Swin-L) | no disponible en la informacion proporcionada | no disponible | Segmentación universal | no disponible en la informacion proporcionada | Hugging Face |

La comparación relevante es con el checkpoint original `facebook/mask2former-swin-tiny-coco-instance`: el fixture replica su arquitectura y procesador, pero con una configuración reducida y pesos aleatorios, por lo que no es sustituible por él en producción.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no han sido entrenados; cualquier salida de segmentación es ruido.
- Etiquetado como `test-artifact` por el autor para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- Licencia no disponible: no se puede confirmar el régimen de uso comercial del artefacto ni del modelo base a partir de la información proporcionada.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas, al no ser un modelo de lenguaje ni haber sido entrenado.
- La configuración reducida (2 capas en encoder, decoder y backbone) no refleja el comportamiento numérico del checkpoint completo; los resultados de tests no son extrapolables al modelo original.
- El repositorio tiene un tamaño de 0,0 GB según la información disponible, lo que sugiere que los pesos pueden no estar materializados o que el dato de tamaño es impreciso; conviene verificar los ficheros antes de usarlo en CI.
- No dispone de pipeline declarado ni de idiomas soportados, lo que limita su uso fuera del contrato de integración para el que fue creado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/mask2former-swin-tiny-coco-instance-mic
- Modelo base: https://huggingface.co/facebook/mask2former-swin-tiny-coco-instance
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/mask2former-swin-tiny-coco-instance-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/mask2former-swin-tiny-coco-instance-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/mask2former-swin-tiny-coco-instance-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/mask2former-swin-tiny-coco-instance-mic/blob/main/build.json
- Cómo se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mask2former-swin-tiny-coco-instance-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
