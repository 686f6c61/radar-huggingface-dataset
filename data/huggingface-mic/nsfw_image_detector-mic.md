# huggingface-mic/nsfw_image_detector-mic

## Resumen

`huggingface-mic/nsfw_image_detector-mic` no es un modelo entrenado, sino un artefacto de prueba (fixture) generado por el proyecto `transformers-mic` de Hugging Face. Se trata de una version reducida y con pesos aleatorios del modelo `Freepik/nsfw_image_detector`, un clasificador de imagenes para deteccion de contenido NSFW basado en `TimmWrapperForImageClassification`. El repositorio incluye los pesos "slim", un manifiesto de contrato (`integration.json`), ejemplos de uso con Transformers y las expectativas del framework sobre el modelo.

El objetivo de este artefacto es servir como fixture de pruebas para validar la integracion de modelos de clasificacion de imagenes en el ecosistema Transformers: comprobar que los nombres de tensores, el procesador y el contrato de entradas/salidas coinciden con el checkpoint real, sin necesidad de distribuir los pesos originales. Los pesos son aleatorios (semilla 17), aunque pasaron una puerta de sensibilidad de entrada que verifica que perturbaciones en `pixel_values` mueven los logits al menos 0,001.

Por tanto, este repositorio no debe usarse para inferencia real de deteccion de NSFW. Es relevante unicamente para desarrolladores que trabajen en el pipeline de `transformers-mic` o que necesiten reproducir el contrato tecnico del modelo base `Freepik/nsfw_image_detector` sin descargar el checkpoint completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TimmWrapperForImageClassification (clasificacion de imagenes) |
| Parametros totales | 86.351.620 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (clasificacion de imagenes) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un `TimmWrapperForImageClassification`, es decir, un envoltorio de Transformers sobre un modelo de vision de la libreria `timm` adaptado a clasificacion de imagenes. El artefacto comparte arquitectura y nombres de tensores con `Freepik/nsfw_image_detector`, pero su configuracion ha sido reducida mediante la regla generica de `sweep.py` del proyecto `transformers-mic`. Los ficheros del procesador se copiaron byte a byte desde el modelo original.

No hubo entrenamiento: los pesos son aleatorios con semilla 17. El artefacto se valido con una puerta de sensibilidad de entrada que comprueba que cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (la mas debil, `pixel_values:roll_batch`, produjo 0,0273). Los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes, y se guardaron en bfloat16, el dtype con el que carga por defecto el modelo base. El fixture cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el shrink.

## Capacidades

- Clasificacion de imagenes en dos clases (NSFW / no NSFW), heredada del contrato del modelo base `Freepik/nsfw_image_detector`.
- Integracion con Transformers mediante `TimmWrapperForImageClassification` y su procesador de imagenes asociado.
- Validacion de contrato de entradas/salidas: el repositorio incluye `integration.json` con el manifiesto y `integrations/transformers/expectations` con las expectativas del framework.
- Sensibilidad verificada a perturbaciones en `pixel_values` (gate de entrada superado).
- Compatibilidad numerica en float32, bfloat16 y float16.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un clasificador de vision.
- No es un modelo usable: los pesos son aleatorios y las predicciones no tienen significado semantico.

## Casos de uso

- Pruebas de integracion en Transformers: usar el fixture para verificar que el pipeline de clasificacion de imagenes carga correctamente un `TimmWrapperForImageClassification` con su procesador, sin descargar el checkpoint real.
- Validacion de contrato en CI: ejecutar `integrations/transformers/expectations` en pipelines de integracion continua para detectar regresiones en el envoltorio de `timm` o en el manejo de `pixel_values`.
- Desarrollo de herramientas de inspeccion de modelos: comprobar que los nombres de tensores del fixture coinciden con los del checkpoint real `Freepik/nsfw_image_detector`, util para herramientas que mapean pesos entre frameworks.
- Reproduccion de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture nsfw_image_detector-mic` para auditar el proceso de shrink y los hashes registrados en `build.json`.
- Pruebas de compatibilidad de dtype: verificar que el modelo es finito en float32, bfloat16 y float16 en forward, loss y gradientes antes de portar el checkpoint real a produccion.
- Educacion y documentacion: ilustrar como se estructura un repositorio de fixture con manifiesto de contrato, procedencia y expectativas de framework en el ecosistema Hugging Face.
- No debe usarse para moderacion de contenido real, filtrado de imagenes en produccion ni ninguna tarea donde se requieran predicciones con significado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (precision, recall, F1) careceria de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (86,4 M de parametros, aproximadamente 173 MB de pesos) mas el coste de activaciones del procesador de imagenes.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien funciona en CPU para pruebas.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1-2 GB de VRAM libre (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: Transformers con `TimmWrapperForImageClassification`; el uso con vLLM, llama.cpp u Ollama no aplica a un clasificador de vision de este tipo.
- Latencia y throughput estimados: no disponibles; al ser un fixture de pruebas, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/nsfw_image_detector-mic | 86,4 M | Clasificacion de imagenes (fixture) | no aplica | no disponible | Hugging Face |
| Freepik/nsfw_image_detector | no disponible | Clasificacion de imagenes NSFW | no aplica | no disponible | Hugging Face |
| Falconsai/nsfw_image_detection | no disponible | Clasificacion de imagenes NSFW | no aplica | no disponible | Hugging Face |

La comparativa se limita a modelos de la misma categoria (deteccion de contenido NSFW en imagenes). No se dispone de datos de parametros, contexto ni licencia de las alternativas en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Los pesos son aleatorios (semilla 17): las predicciones no tienen significado y no deben usarse para moderacion real.
- Es un artefacto de prueba etiquetado como `test-artifact`, pensado para quedar fuera de la busqueda de modelos candidatos.
- La licencia no esta disponible en la informacion proporcionada; no se puede confirmar el uso comercial.
- El repositorio esta marcado como `not-for-all-anchored`/`not-for-all-audiences` por la tematica del modelo base (contenido NSFW).
- No es multilingue ni soporta texto: es exclusivamente un clasificador de vision.
- La configuracion ha sido reducida respecto al modelo base, por lo que el numero de parametros no coincide con el checkpoint original.
- No se han publicado benchmarks ni metricas de calidad; cualquier evaluacion de rendimiento requeriria el modelo base real.
- El uso en produccion debe hacerse con `Freepik/nsfw_image_detector`, no con este fixture.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/nsfw_image_detector-mic
- Modelo base: https://huggingface.co/Freepik/nsfw_image_detector
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/nsfw_image_detector-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/nsfw_image_detector-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/nsfw_image_detector-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/nsfw_image_detector-mic/blob/main/build.json
- Documentacion del proceso de shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/nsfw_image_detector-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Alternativa comparable (Falconsai): https://huggingface.co/Falconsai/nsfw_image_detection
