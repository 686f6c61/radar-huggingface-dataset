# huggingface-mic/QianfanOCR-mic

## Resumen

QianfanOCR-mic es un artefacto de prueba (fixture) publicado por la organizacion huggingface-mic, no un modelo utilizable. Se trata de una version reducida del modelo bairongz/QianfanOCR, un modelo de vision-lenguaje orientado a OCR (image-to-text) desarrollado por Baidu (familia Qianfan). El fixture conserva la arquitectura y los ficheros de procesador del modelo original, pero sustituye los pesos por valores aleatorios y reduce drasticamente el numero de capas, con solo 19.936.576 parametros totales frente a los cientos de millones o miles de millones del modelo de referencia.

El objetivo de este repositorio es servir como banco de pruebas para la integracion del modelo QianfanOCR en la libreria Transformers: permite validar contratos de entrada/salida, expectativas de framework y la carga del modelo sin necesidad de descargar los pesos completos. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Por su naturaleza, no debe emplearse en inferencia real, produccion ni evaluacion de calidad. El modelo original QianfanOCR fue publicado el 18 de marzo de 2026 y anadido a Transformers el 16 de abril de 2026, segun la documentacion oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QianfanOCRForConditionalGeneration (vision-lenguaje, transformer) |
| Parametros totales | 19.936.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture reproduce la clase `QianfanOCRForConditionalGeneration`, un modelo de vision-lenguaje con encoder de vision y decoder de texto. Para reducirlo se aplico la regla generica de `sweep.py` del proyecto transformers-mic: `vision num_hidden_layers` = 2 y `text num_hidden_layers` = 2, manteniendo los nombres de tensores identicos a los del checkpoint real `bairongz/QianfanOCR`.

Los pesos son aleatorios (semilla 17) y no han sido entrenados. Se valido una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0.001 (el caso mas debil, `pixel_values:halve`, produce 0.0105). Los ficheros de procesador (`tokenizer.json`, `preprocessor_config.json`, `chat_template.jinja`, `video_preprocessor_config.json`, entre otros) se copiaron byte a byte desde el modelo original. El modelo es finito en float32, bfloat16 y float16 (forward, loss y gradientes). No se dispone de informacion sobre datos de entrenamiento, tokens, RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto a partir de imagenes (image-to-text) segun el contrato declarado del modelo base.
- Soporte de plantilla de chat (`chat_template.jinja`) copiada del modelo original.
- Procesamiento de imagenes y video mediante los ficheros de preprocesador copiados.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision, audio: no disponible.

Advertencia: al tratarse de pesos aleatorios, ninguna de estas capacidades produce resultados utiles en este repositorio.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture para verificar que `QianfanOCRForConditionalGeneration` se instancia, ejecuta forward y calcula gradientes sin errores.
- Validacion de contratos de entrada/salida: comprobar que las perturbaciones en `pixel_values` y en las entradas de texto modifican los logits, usando los umbrales registrados en `build.json`.
- CI/CD de la libreria: ejecutar tests de regresion de la arquitectura QianfanOCR en pipelines sin descargar pesos completos.
- Verificacion de ficheros de procesador: validar tokenizer, preprocessor y chat template copiados byte a byte del modelo original.
- Pruebas de compatibilidad de dtype: comprobar la estabilidad numerica en float32, bfloat16 y float16.
- Desarrollo de herramientas de inspeccion de modelos: usar los nombres de tensores identicos al checkpoint real para probar utilidades de analisis de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 19,9 M de parametros en bfloat16 (aproximadamente 40 MB de pesos).
- GPU recomendadas: cualquier GPU consumer o incluso CPU es suficiente para ejecutar el fixture.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: carga via Transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este fixture.
- Latencia y throughput: no disponibles; irrelevantes al ser un artefacto de prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QianfanOCR-mic | 19,9 M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| bairongz/QianfanOCR | no disponible | no disponible | OCR image-to-text | no disponible | Hugging Face |
| Otros modelos OCR de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento con alternativas.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce salidas coherentes y no debe usarse en inferencia real.
- Artefacto de prueba etiquetado `test-artifact`: excluido intencionadamente de busquedas de modelos candidatos.
- Configuracion reducida (2 capas de vision y 2 de texto): no representa la capacidad del modelo original.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas y contexto no documentados en la informacion proporcionada.
- Riesgo de confusion: no confundir este repositorio con `bairongz/QianfanOCR`, que es el modelo real.
- Para produccion debe utilizarse el checkpoint original, no este fixture.

## Enlaces

- Repositorio del fixture: https://huggingface.co/huggingface-mic/QianfanOCR-mic
- Modelo base: https://huggingface.co/bairongz/QianfanOCR
- Documentacion de Transformers: https://huggingface.co/docs/transformers/v5.7.0/model_doc/qianfan_ocr
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/QianfanOCR-mic/blob/main/integration.json
- Uso en Transformers: https://huggingface.co/huggingface-mic/QianfanOCR-mic/blob/main/integrations/transformers/usage.md
- Procedencia del fixture: https://huggingface.co/huggingface-mic/QianfanOCR-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/QianfanOCR-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
