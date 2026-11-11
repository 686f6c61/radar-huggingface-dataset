# huggingface-mic/grounding-dino-tiny-mic

## Resumen

`grounding-dino-tiny-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` en Hugging Face. No se trata de un modelo funcional, sino de una versión reducida artificialmente del checkpoint `IDEA-Research/grounding-dino-tiny`, diseñada para validar la integración del pipeline de Grounding DINO con Transformers. El autor lo etiqueta explícitamente como `test-artifact`, es decir, un objeto de test que no debe confundirse con un modelo entrenado ni utilizarse en producción.

El modelo conserva la arquitectura `GroundingDinoForObjectDetection` y los mismos nombres de tensores que el checkpoint original, pero con una configuración drásticamente reducida (2 capas de encoder, 2 de decoder, 2 capas en el backbone y 2 capas ocultas en el codificador de texto), lo que da un total de 7.714.390 parámetros. Los pesos son aleatorios (semilla 17) y no han sido entrenados; simplemente superaron una puerta de sensibilidad de entrada que garantiza que las perturbaciones en las entradas mueven los logits al menos 0,001.

Su relevancia es, por tanto, exclusivamente de ingeniería: sirve para verificar que el código de integración (procesadores, tokenizadores, carga de pesos y ejecución forward/backward) funciona correctamente con la arquitectura Grounding DINO, sin necesidad de descargar ni ejecutar el checkpoint real de 172M parámetros. Cualquier uso como detector de objetos zero-shot produciría resultados sin sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GroundingDinoForObjectDetection (transformer multimodal texto-imagen para deteccion de objetos) |
| Parametros totales | 7.714.390 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de deteccion, no generativo) |
| Tipos de cuantizacion | no disponible (pesos en float32; el autor indica que es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Grounding DINO: un detector de objetos zero-shot que combina un backbone de visión, un codificador de texto, un encoder de características multimodales y un decoder transformer con consultas. En esta fixture, la configuración se ha reducido mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`: `encoder_layers=2`, `decoder_layers=2`, `backbone num_layers=2` y `text num_hidden_layers=2`. Los ficheros del procesador (`added_tokens.json`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.txt`) se copiaron byte a byte desde `IDEA-Research/grounding-dino-tiny`.

No hubo entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y se validaron con una puerta de sensibilidad de entrada: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (la más débil, `pixel_values:halve`, produjo 16,4). La fixture se guarda en float32, el mismo dtype con el que carga por defecto el checkpoint original, y se verificó que es finita en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Los nombres de tensores coinciden con los del checkpoint real, lo que permite sustituir unos por otros en pruebas de integración.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no ha sido entrenado, por lo que no detecta objetos de forma significativa.
- Conserva la interfaz de Grounding DINO: entrada de imagen más prompt de texto, salida de cajas y logits.
- Sirve para validar la carga del modelo, del procesador y del tokenizador en Transformers.
- Permite comprobar forward, loss y backward en float32, bfloat16 y float16.
- Mantiene los mismos nombres de tensores que el checkpoint original, lo que facilita pruebas de compatibilidad.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión generativa ni audio.

## Casos de uso

- Pruebas de integración en Transformers: verificar que `GroundingDinoForObjectDetection` carga correctamente desde un repositorio con safetensors y que el procesador asociado se instancia sin errores.
- CI/CD de la librería: ejecutar tests de forward y backward en float32, bfloat16 y float16 sin descargar el checkpoint real de 172M parámetros, reduciendo tiempo y ancho de banda en pipelines.
- Validación de contratos de entrada: comprobar que perturbaciones en `pixel_values` y en los tokens de texto producen cambios en los logits, tal como exige la puerta de sensibilidad del fixture.
- Desarrollo de código de inferencia: prototipar el preprocesado y postprocesado de Grounding DINO (normalización de cajas, umbrales, mapeo de etiquetas) con un modelo ligero antes de pasar al checkpoint real.
- Pruebas de compatibilidad de tokenizadores: al copiar los ficheros del procesador byte a byte, sirve para verificar que el tokenizador de texto se comporta igual que en el modelo original.
- Docencia y demostraciones: ilustrar la arquitectura interna de Grounding DINO inspeccionando formas de tensores y capas sin necesidad de recursos de GPU significativos.
- Verificación de serialización: comprobar que el guardado y recarga en safetensors preserva nombres y formas de todos los tensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de detección (COCO AP, zero-shot transfer, etc.) carecería de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 dado el tamaño de 7,7M parámetros (unos 31 MB de pesos) más activaciones reducidas por la configuración mínima.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para pruebas.
- Opciones de despliegue: Transformers (carga estándar desde el repositorio), con soporte de float32, bfloat16 y float16. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; al ser un fixture con configuración mínima, serían muy inferiores a los del checkpoint real, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `grounding-dino-tiny-mic` (este) | 7,7M (reducido, pesos aleatorios) | no aplica | Fixture de test | no disponible | Hugging Face |
| `IDEA-Research/grounding-dino-tiny` | ~172M (no confirmado en la informacion disponible) | no aplica | Deteccion zero-shot | no disponible en la informacion proporcionada | Hugging Face |
| `IDEA-Research/grounding-dino-base` | no disponible | no aplica | Deteccion zero-shot | no disponible | Hugging Face |

La comparación relevante es únicamente con el checkpoint original del que deriva: misma arquitectura y mismos nombres de tensores, pero con configuración reducida y pesos no entrenados. Frente a otros detectores zero-shot (por ejemplo, GLIP u OWLv2), no se dispone de datos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las detecciones no tienen significado.
- Etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.
- No debe desplegarse en producción ni presentarse como detector funcional.
- La licencia no está disponible en la información proporcionada; no se puede confirmar el uso comercial.
- Los idiomas soportados no están documentados.
- La configuración reducida (2 capas por bloque) no refleja el comportamiento del checkpoint real; los resultados de pruebas de integración no son extrapolables al modelo completo.
- El repositorio tiene un tamaño de 0,0 GB según los metadatos, lo que sugiere que algunos ficheros deben regenerarse con `python example/build_fixtures.py --fixture grounding-dino-tiny-mic`.
- No se han publicado métricas de rendimiento ni evaluaciones de sesgo o alucinación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/grounding-dino-tiny-mic
- Modelo base: https://huggingface.co/IDEA-Research/grounding-dino-tiny
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/grounding-dino-tiny-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/grounding-dino-tiny-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/grounding-dino-tiny-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/grounding-dino-tiny-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/grounding-dino-tiny-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
