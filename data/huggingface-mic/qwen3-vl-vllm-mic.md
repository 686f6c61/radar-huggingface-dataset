# huggingface-mic/qwen3-vl-vllm-mic

## Resumen

`huggingface-mic/qwen3-vl-vllm-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` como parte de la infraestructura de validación de integraciones del ecosistema Transformers. No es un modelo utilizable: se trata de una versión "adelgazada" (slim) del checkpoint `Qwen/Qwen3-VL-2B-Instruct`, reducida a 11.177.856 parámetros mediante la regla genérica de reducción de `sweep.py` (text `num_hidden_layers` = 2) y con pesos aleatorios generados con semilla 17. Su propósito es servir como fixture reproducible para probar contratos de inferencia visión-lenguaje y un paso de entrenamiento compatibles con vLLM.

El artefacto conserva la arquitectura `Qwen3VLForConditionalGeneration` y los nombres de tensores exactos del checkpoint real, además de copiar byte a byte los ficheros de procesador del modelo original (`tokenizer.json`, `preprocessor_config.json`, `video_preprocessor_config.json`, `chat_template.json`, entre otros). De este modo, permite validar rutas de código de carga, tokenización, preprocesado multimodal y forward/backward sin necesidad de descargar ni ejecutar el modelo completo de 2B parámetros.

Es relevante ahora porque facilita pruebas de integración ligeras y deterministas en pipelines de CI para frameworks como Transformers y vLLM, cubriendo el caso de uso de modelos visión-lenguaje de la familia Qwen3-VL. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. No debe emplearse para inferencia real, generación de texto ni ninguna tarea productiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3VLForConditionalGeneration` (transformer visión-lenguaje, config reducida: text `num_hidden_layers` = 2) |
| Parametros totales | 11.177.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; finito también en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base `Qwen/Qwen3-VL-2B-Instruct`, un transformer multimodal de la familia Qwen3-VL para generación condicional visión-lenguaje (`Qwen3VLForConditionalGeneration`). La reducción se aplica únicamente sobre la torre de texto, dejando `num_hidden_layers` en 2, mientras que los ficheros de procesador (tokenizador, preprocesador de imagen y vídeo, plantilla de chat, configuración de generación) se copian byte a byte desde el checkpoint original. Los nombres de tensores coinciden con los del modelo real.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron tras superar una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `pixel_values:halve`, produjo 0,192). El fixture se guardó en float32, el dtype con el que carga por defecto el modelo base, y se verificó que forward, pérdida y gradientes son finitos en float32, bfloat16 y float16. La clave de fixture es `9fdc64369c1d` y cubre todos los checkpoints cuyos ficheros de procesador son idénticos byte a byte y cuya config coincide tras la reducción.

## Capacidades

- Ejecución de inferencia visión-lenguaje dentro de un contrato de pruebas compatible con vLLM (carga, preprocesado multimodal, forward).
- Ejecución de un paso de entrenamiento (forward, cálculo de pérdida y gradientes) para validar integraciones de framework.
- Verificación de rutas de tokenización y preprocesado de imagen y vídeo mediante los ficheros de procesador copiados del modelo base.
- Comprobación de compatibilidad de nombres de tensores y de config con el checkpoint `Qwen/Qwen3-VL-2B-Instruct`.
- Validación de estabilidad numérica en float32, bfloat16 y float16.
- No soporta generación de texto coherente, razonamiento, código, matemáticas ni tool calling: los pesos son aleatorios.
- No es un modelo apto para agentes, razonamiento multi-paso ni uso multilingüe real.

## Casos de uso

- Pruebas de integración en CI para Transformers: cargar el fixture y ejecutar un forward visión-lenguaje para detectar regresiones en la ruta `Qwen3VLForConditionalGeneration` sin descargar el modelo de 2B parámetros.
- Validación de compatibilidad con vLLM: comprobar que el pipeline de carga, preprocesado y ejecución acepta el contrato del fixture antes de desplegar el checkpoint real.
- Verificación de un paso de entrenamiento: usar el fixture para validar que el cálculo de pérdida y los gradientes son finitos en float32, bfloat16 y float16 en una integración concreta.
- Pruebas de tokenizador y plantilla de chat: al copiarse byte a byte los ficheros del modelo base, sirve para validar el renderizado de plantillas y la tokenización multimodal.
- Validación de preprocesado de imagen y vídeo: los ficheros `preprocessor_config.json` y `video_preprocessor_config.json` permiten probar la ruta de entrada visual con formas y dtypes controlados.
- Reproducibilidad de fixtures: la provenance registrada en `build.json` (fuentes fijadas, resultados de puertas y hashes) permite reconstruir el artefacto con `build_fixtures.py` y comparar hashes.
- Detección de cambios de contrato: al cubrir todos los checkpoints con procesador idéntico y config equivalente tras la reducción, sirve para alertar si el contrato de integración cambia entre versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto es un fixture de pruebas con pesos aleatorios y no representa el rendimiento del modelo base `Qwen/Qwen3-VL-2B-Instruct`.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; con 11,2M parámetros en float32 el peso ocupa aproximadamente 45 MB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no aplica para uso real; cualquier GPU con soporte de float32, bfloat16 o float16 sirve para ejecutar las pruebas.
- Cabe en GPU consumer: sí, en cualquier modelo (por ejemplo, RTX 3060, RTX 4090) y también en CPU.
- Opciones de despliegue: Transformers y vLLM según el contrato del fixture; no se documentan otras rutas (llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas de texto, los tiempos serán muy inferiores a los del modelo base, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/qwen3-vl-vllm-mic` | 11.177.856 | no disponible | Fixture de pruebas (pesos aleatorios) | no disponible | Hugging Face |
| `Qwen/Qwen3-VL-2B-Instruct` | ~2B (modelo base) | no disponible en la informacion proporcionada | Modelo visión-lenguaje instructivo real | no disponible en la informacion proporcionada | Hugging Face |
| Otros fixtures `huggingface-mic` | Variable (reducciones por regla genérica) | no disponible | Pruebas de integración de otros contratos | no disponible | Hugging Face |

La comparación con alternativas de la misma categoría (modelos visión-lenguaje de ~2B) no está disponible en la información proporcionada; el fixture no es funcionalmente comparable con modelos reales por sus pesos aleatorios.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce salidas coherentes ni útiles; cualquier uso generativo dará resultados sin sentido.
- Artefacto de prueba: está etiquetado como `test-artifact` y debe excluirse de búsquedas de modelos candidatos y de cualquier despliegue productivo.
- Licencia no disponible: no se puede confirmar el régimen de uso comercial; además, los términos del modelo base `Qwen/Qwen3-VL-2B-Instruct` podrían aplicar a los ficheros de procesador copiados.
- Sesgos: no evaluables, al no haber entrenamiento ni datos reales; no se han medido sesgos.
- Alucinación: no aplica en el sentido habitual, pero las salidas son arbitrarias por construcción.
- Contexto e idiomas: no disponibles; la config reducida no refleja la ventana de contexto real del modelo base.
- Integridad del fixture: cualquier cambio en los ficheros de procesador o en la config del modelo base puede invalidar la clave de fixture `9fdc64369c1d` y requerir reconstrucción.
- Reconstrucción: el repositorio incluye solo pesos, uso y expectativas; otros ficheros deben regenerarse con `python example/build_fixtures.py --fixture qwen3-vl-vllm-mic`.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/qwen3-vl-vllm-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/qwen3-vl-vllm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/qwen3-vl-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/qwen3-vl-vllm-mic/tree/main/integrations/transformers/expectations
- Provenance del fixture: https://huggingface.co/huggingface-mic/qwen3-vl-vllm-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen3-vl-vllm-mic.html
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
