# huggingface-mic/rtdetr_r50vd-mic

## Resumen

`huggingface-mic/rtdetr_r50vd-mic` es un artefacto de test publicado por la organización `huggingface-mic` dentro del proyecto `transformers-mic`, cuyo objetivo es empaquetar en un mismo repositorio los pesos "slim", el uso ejecutable y las expectativas de integración de un modelo. En concreto, reproduce la interfaz de `PekingU/rtdetr_r50vd`, un detector de objetos de la familia RT-DETR (Real-Time DEtection TRansformer), pero con una configuración reducida y pesos aleatorios: 10.927.020 parámetros, encoder de 1 capa y decoder de 2 capas.

No es un modelo utilizable para inferencia real. El propio autor lo etiqueta como `test-artifact` precisamente para excluirlo de las búsquedas de modelos candidatos. Su función es servir de fixture reproducible para probar código de integración (carga con Transformers, expectativas de formas y dtypes, comportamiento del procesador de imágenes) sin necesidad de descargar ni ejecutar el checkpoint completo.

Su relevancia es, por tanto, de ingeniería de software más que de modelado: permite validar pipelines, contratos de integración y pruebas de regresión con un repositorio de tamaño prácticamente nulo y con garantías declaradas de finitud numérica en float32, bfloat16 y float16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RT-DETR (Real-Time DEtection TRansformer) para detección de objetos; clase `RTDetrForObjectDetection` con configuración reducida (encoder_layers = 1, decoder_layers = 2) |
| Parámetros totales | 10.927.020 (10,9 M), según safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión); resolución de entrada definida en `preprocessor_config.json`, no detallada en la información disponible |
| Tipos de cuantización | No se publican artefactos cuantizados; pesos en float32; el autor verifica finitud en float32, bfloat16 y float16 (forward, pérdida y gradientes) |
| Idiomas soportados | No disponible (no procesa texto; la tarea es visión por computador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (float32) |
| Tarea | Detección de objetos (object detection) |
| Modelo base | `PekingU/rtdetr_r50vd` |
| Tamaño del repositorio | 0,0 GB (redondeado en la información disponible) |
| Fecha de creación / actualización | 2026-10-27 / 2026-10-27 |

## Arquitectura y entrenamiento

La familia RT-DETR plantea la detección de objetos como un problema de predicción de conjuntos con un transformer encoder-decoder sobre características extraídas por un backbone convolucional, eliminando la necesidad de supresión no máxima (NMS) en el postprocesado. El checkpoint de referencia `PekingU/rtdetr_r50vd` emplea un backbone ResNet-50-vd y el esquema habitual de RT-DETR: selección de queries guiada por IoU, decoder con consultas aprendidas y asignación húngara durante el entrenamiento. Esta descripción corresponde a la arquitectura del modelo base; la información proporcionada no detalla la composición del dataset ni el número de tokens o imágenes de entrenamiento.

El repositorio que nos ocupa no entrena nada: genera un fixture aplicando la regla genérica de reducción de `experiments/sweep.py` sobre la configuración original, copiando literalmente el fichero `preprocessor_config.json` de `PekingU/rtdetr_r50vd` y asignando pesos aleatorios con semilla 17. Los pesos se guardan en float32, el dtype con el que carga por defecto el checkpoint original, y mantienen exactamente los mismos nombres de tensor que el modelo real, de modo que el fixture cubre cualquier checkpoint cuyos ficheros de procesador sean idénticos byte a byte y cuya configuración coincida tras el proceso de reducción (clave de fixture `67408110004f`). Como control de calidad, el autor aplicó una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplaza los logits al menos 0,001 (la más débil, `pixel_values:halve`, los desplaza 0,129), lo que justifica no haber entrenado el modelo.

## Capacidades

- Detección de objetos en imágenes: produce cajas delimitadoras y etiquetas de clase mediante la cabeza de `RTDetrForObjectDetection`.
- Compatibilidad de interfaz con `PekingU/rtdetr_r50vd`: mismos nombres de tensor, mismo procesador de imágenes y mismo dtype de carga por defecto.
- Ejecución numéricamente estable en float32, bfloat16 y float16 para forward, cálculo de pérdida y gradientes.
- Sirve como fixture de pruebas para validar código de integración en Transformers (formas, dtypes, contratos de entrada/salida).
- No dispone de generación de texto, razonamiento, código, matemáticas ni capacidades multimodales de lenguaje.
- No soporta tool calling, function calling ni flujos de agentes.
- No hay capacidades multilingües: el modelo no procesa lenguaje natural.
- No hay modo "thinking" ni capacidades de audio.

## Casos de uso

- Pruebas de integración en CI: cargar el modelo con `RTDetrForObjectDetection` y verificar que las formas de salida, los nombres de tensor y los dtypes coinciden con lo esperado, sin descargar el checkpoint completo ni consumir GPU.
- Validación de contratos de modelo: usar `integration.json` como manifiesto para comprobar que una versión de Transformers cumple las expectativas declaradas en `integrations/transformers/expectations`.
- Pruebas de regresión del procesador de imágenes: al copiarse `preprocessor_config.json` byte a byte del modelo base, permite validar cambios en el pipeline de preprocesado sin alterar el resto del sistema.
- Test de exportación y serialización: comprobar flujos de guardado/carga, conversión de dtype (float32 a bfloat16/float16) y herramientas de exportación sobre un modelo diminuto antes de aplicarlas al checkpoint real.
- Desarrollo de harnesses de evaluación: construir y depurar el código que calcula métricas de detección (AP, AR) sobre salidas sintéticas antes de ejecutarlo con pesos entrenados.
- Docencia y demostraciones de pipeline: ilustrar la estructura de un detector RT-DETR (entradas, logits, cajas, clases) en un portátil o en CPU, sin requisitos de memoria relevantes.
- Verificación de compatibilidad entre checkpoints: identificar si dos checkpoints comparten procesador y configuración reducida equivalente, gracias a la clave de fixture.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un artefacto de test con pesos aleatorios (semilla 17), cualquier métrica de detección (AP, AP50, AP75, AR) carecería de significado y no se han reportado valores.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 43,7 MB en float32 y 21,9 MB en float16, calculados a partir de los 10.927.020 parámetros. A ello hay que sumar la memoria de activaciones, que depende de la resolución de entrada definida en `preprocessor_config.json` y no se detalla en la información disponible.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) y también en CPU; no requiere A100 ni H100.
- Despliegue: carga directa con la librería Transformers (`RTDetrForObjectDetection`), tal como se documenta en `integrations/transformers/usage.md`. No aplica el despliegue con vLLM, llama.cpp, Ollama o TGI, orientados a modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/rtdetr_r50vd-mic` | 10,9 M (configuración reducida) | Detección de objetos (fixture) | Aleatorios (semilla 17) | No disponible | Público en Hugging Face; etiquetado `test-artifact` |
| `PekingU/rtdetr_r50vd` (modelo base) | No disponible en la información proporcionada | Detección de objetos | Entrenados | No disponible | Público en Hugging Face |
| Otros checkpoints de la familia RT-DETR | No disponible | Detección de objetos | Entrenados | No disponible | Público en Hugging Face |
| Detectores tipo DETR (p. ej. `facebook/detr-resnet-50`) | No disponible | Detección de objetos | Entrenados | No disponible | Público en Hugging Face |

La comparación relevante no es de rendimiento sino de propósito: frente a los checkpoints entrenados de la familia, este repositorio solo replica la interfaz (nombres de tensor, procesador y dtype) con una configuración más pequeña y pesos aleatorios, por lo que no es intercambiable en producción.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no detecta objetos reales y sus salidas no tienen valor semántico.
- Está etiquetado explícitamente como `test-artifact` y "not a usable model"; debe mantenerse fuera de cualquier búsqueda de modelos candidatos.
- La licencia no está declarada en la información disponible, lo que impide evaluar su uso comercial; en cualquier caso, no procede su uso en producción.
- La configuración está reducida (encoder_layers = 1, decoder_layers = 2), por lo que el comportamiento arquitectónico no equivale al del checkpoint completo.
- Solo cubre checkpoints cuyo procesador sea byte-idéntico y cuya configuración coincida tras la reducción; no es un sustituto general del modelo base.
- No hay datos publicados de sesgos, robustez ni evaluación cualitativa, al no haberse entrenado el modelo.
- El repositorio tiene 0 descargas y 0 "likes", señal coherente con su naturaleza de artefacto interno de pruebas.
- El tamaño del repositorio figura como 0,0 GB (redondeado), dato que no debe interpretarse como ausencia de pesos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/huggingface-mic/rtdetr_r50vd-mic)
- [Modelo base PekingU/rtdetr_r50vd](https://huggingface.co/PekingU/rtdetr_r50vd)
- [Manifiesto de contrato (integration.json)](https://huggingface.co/huggingface-mic/rtdetr_r50vd-mic/blob/main/integration.json)
- [Uso con Transformers (integrations/transformers/usage.md)](https://huggingface.co/huggingface-mic/rtdetr_r50vd-mic/blob/main/integrations/transformers/usage.md)
- [Expectativas de Transformers (integrations/transformers/expectations)](https://huggingface.co/huggingface-mic/rtdetr_r50vd-mic/tree/main/integrations/transformers/expectations)
- [Procedencia del fixture (build.json)](https://huggingface.co/huggingface-mic/rtdetr_r50vd-mic/blob/main/build.json)
- [Repositorio transformers-mic en GitHub](https://github.com/huggingface/transformers-mic)
- [Script de barrido de configuraciones (sweep.py)](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Script de construcción de fixtures (build_fixtures.py)](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
