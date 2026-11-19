# huggingface-mic/grounding-dino-tiny-mic

## Resumen

`grounding-dino-tiny-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic`, no un modelo entrenado ni utilizable en producción. Se construye a partir de `IDEA-Research/grounding-dino-tiny`, un detector de objetos zero-shot basado en la arquitectura Grounding DINO, pero reduciendo drásticamente su configuración y sustituyendo los pesos por valores aleatorios. El resultado es un checkpoint de 7.714.390 parámetros (frente a los aproximadamente 172 millones del modelo original) que conserva la misma estructura de tensores, los mismos ficheros de procesador y el mismo formato de configuración.

El propósito declarado es servir como fixture para pruebas de integración con Transformers: permite validar pipelines de carga, ejecución y verificación de contratos (inputs, outputs, gradientes) sin necesidad de descargar el checkpoint real ni de ejecutar cómputo significativo. El autor lo etiqueta explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

Su relevancia es por tanto metodológica, no funcional: ilustra una práctica de ingeniería de software (fixtures ligeros con sensibilidad de entrada verificada) aplicada al ecosistema de Hugging Face. Cualquier evaluación de capacidades de detección de objetos debe realizarse sobre el modelo base original, no sobre esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GroundingDinoForObjectDetection (transformer multimodal texto-imagen, variante reducida) |
| Parametros totales | 7.714.390 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de detección, no generativo) |
| Tipos de cuantizacion | no disponible (pesos en float32; se declara finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (procesador de texto copiado del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es `GroundingDinoForObjectDetection`, la implementación de Transformers del modelo Grounding DINO, que combina un backbone visual con un encoder y decoder tipo transformer y una torre de texto para alinear consultas en lenguaje natural con regiones de la imagen. En esta variante concreta, la configuración se ha reducido mediante la regla genérica de `sweep.py`: `encoder_layers=2`, `decoder_layers=2`, `num_layers=2` en el backbone y `num_hidden_layers=2` en la torre de texto.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y solo se aceptaron tras superar una puerta de sensibilidad de entrada: cada perturbación de las entradas del contrato debía mover los logits al menos 0,001 (la más débil, `pixel_values:halve`, produjo 16,4). Los ficheros de procesador (`added_tokens.json`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.txt`) se copiaron byte a byte desde `IDEA-Research/grounding-dino-tiny`. El fixture conserva los mismos nombres de tensor que el checkpoint real y se guarda en float32, el dtype por defecto del modelo original. No se aplicó RLHF, DPO ni ningún otro ajuste.

## Capacidades

- Carga y ejecución en Transformers con la clase `GroundingDinoForObjectDetection`.
- Verificación de contratos de entrada y salida (forward, loss y gradientes) en float32, bfloat16 y float16.
- Validación de pipelines de preprocesado con los ficheros de procesador idénticos al modelo base.
- Pruebas de integración y CI sin descarga del checkpoint real ni requisitos de GPU significativos.
- No realiza detección de objetos real: los pesos son aleatorios y la configuración está reducida.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- Sin capacidades multilingües evaluadas ni modo thinking, visión o audio más allá del pipeline de detección.

## Casos de uso

- Pruebas de integración en CI: el fixture permite ejecutar la carga del modelo, un forward y la comprobación de formas de salida en cada commit sin descargar los ~700 MB del checkpoint original ni requerir GPU.
- Validación de contratos de framework: los directorios `integrations/transformers/expectations` documentan las expectativas de entrada y salida, y el fixture sirve para verificar que una versión de Transformers las cumple.
- Desarrollo de código de preprocesado: al copiar byte a byte los ficheros del procesador del modelo base, permite depurar tokenización y transformaciones de imagen con el mismo comportamiento que el modelo real.
- Pruebas de compatibilidad de dtype: al ser finito en float32, bfloat16 y float16, sirve para comprobar rutas de conversión de precisión en pipelines de inferencia.
- Reproducción de fixtures: `build_fixtures.py` y `build.json` permiten reconstruir el artefacto y auditar hashes, fuentes fijadas y resultados de la puerta de sensibilidad.
- Formación de equipos: ejemplo didáctico de cómo reducir un checkpoint grande conservando estructura y contrato para pruebas rápidas y deterministas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios; cualquier métrica de detección (COCO, LVIS, etc.) carecería de sentido sobre esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para 7,7 M de parámetros, más el coste de activaciones del backbone reducido; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU para pruebas de integración.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (carga directa con `GroundingDinoForObjectDetection`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de detección.
- Latencia y throughput: no disponibles; al tratarse de un fixture, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/grounding-dino-tiny-mic` | 7.714.390 | no disponible | Fixture de prueba | no disponible | Hugging Face |
| `IDEA-Research/grounding-dino-tiny` | no disponible en la informacion (aprox. 172 M segun la model card) | no disponible | Deteccion zero-shot | no disponible | Hugging Face |
| Otros detectores zero-shot (p. ej. OWLv2, GLIP) | no disponible | no disponible | Deteccion zero-shot | no disponible | no disponible |

La comparación relevante es únicamente con su modelo base: misma arquitectura y mismos ficheros de procesador, pero configuración reducida y pesos aleatorios. Frente a alternativas de la misma categoría (OWLv2, GLIP) no se dispone de datos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y la configuración está reducida; las salidas no tienen significado semántico.
- Etiquetado como `test-artifact` por el autor para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- Licencia no disponible: no se puede confirmar el régimen de uso comercial ni la procedencia de los términos heredados del modelo base.
- Idiomas no disponibles: aunque el procesador de texto es idéntico al del modelo base, no se declaran idiomas soportados.
- La model card no documenta sesgos, riesgos de alucinación ni limitaciones de contexto, al no tratarse de un modelo generativo.
- El repositorio tiene un tamaño de 0,0 GB según los metadatos, coherente con un artefacto mínimo; no incluye todos los ficheros necesarios para un uso completo sin reconstrucción.
- Para cualquier evaluación real de detección zero-shot debe usarse `IDEA-Research/grounding-dino-tiny` o sus variantes entrenadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/grounding-dino-tiny-mic
- Modelo base: https://huggingface.co/IDEA-Research/grounding-dino-tiny
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/grounding-dino-tiny-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/grounding-dino-tiny-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/grounding-dino-tiny-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/grounding-dino-tiny-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/grounding-dino-tiny-mic.html
- Repositorio de construcción: https://github.com/huggingface/transformers-mic
- Script de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
