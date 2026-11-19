# huggingface-mic/owlvit-base-patch32-mic

## Resumen

`owlvit-base-patch32-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable en produccion: se trata de una version reducida artificialmente del modelo `google/owlvit-base-patch32`, un detector de objetos de vocabulario abierto basado en la arquitectura OWL-ViT. El repositorio empaqueta pesos "slim", uso ejecutable y expectativas de framework en un unico lugar, con el objetivo de servir como fixture de integracion para el proyecto transformers-mic.

El fixture conserva la misma arquitectura (`OwlViTForObjectDetection`) y los mismos nombres de tensores que el checkpoint real, pero reduce el numero de capas del encoder de texto y del encoder de vision a 2 en cada caso, lo que deja el modelo en 3.552.198 parametros. Los pesos son aleatorios (semilla 17), generados sin entrenamiento, y pasaron una puerta de sensibilidad de entrada que verifica que cada perturbacion de las entradas mueve los logits al menos 0,001. Los ficheros del procesador (tokenizer, preprocessor) se copian byte a byte desde el modelo original.

Su relevancia no es la inferencia real, sino la validacion de integraciones: permite comprobar que un pipeline de Transformers carga, ejecuta y propaga gradientes correctamente para OWL-ViT sin descargar el checkpoint completo. El tag `test-artifact` lo excluye deliberadamente de las busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OWL-ViT (OwlViTForObjectDetection), transformer dual texto-vision |
| Parametros totales | 3.552.198 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OWL-ViT, un detector de objetos de vocabulario abierto que combina un encoder de texto y un encoder de vision para alinear descripciones textuales con regiones de imagen. En este fixture se mantiene la clase `OwlViTForObjectDetection` pero se reduce la configuracion: el encoder de texto queda en 2 capas ocultas y el encoder de vision en 2 capas ocultas, aplicando la regla generica de reduccion del script `sweep.py` del proyecto transformers-mic.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad de entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, `input_ids:roll_batch`, con 0,194). El fixture conserva exactamente los mismos nombres de tensores que el checkpoint real y se guarda en float32, el dtype por defecto de `google/owlvit-base-patch32`. Los ficheros del procesador (`merges.txt`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte del modelo original, de modo que la tokenizacion y el preprocesado son identicos.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen detecciones significativas.
- Sirve como fixture de integracion para validar la carga y ejecucion de `OwlViTForObjectDetection` en Transformers.
- Verifica la compatibilidad de los ficheros de procesador copiados de `google/owlvit-base-patch32`.
- Comprueba la propagacion de gradientes y la finitud numerica en float32, bfloat16 y float16 (forward, loss y gradientes).
- Mantiene los nombres de tensores del checkpoint real para validar mapeos de pesos.
- No dispone de tool calling, capacidades de agente, modo thinking, vision generativa ni audio.
- No hay capacidades multilingues declaradas.

## Casos de uso

- Pruebas de integracion en CI: ejecutar el fixture en la suite de tests para verificar que el pipeline de OWL-ViT carga y produce logits sin descargar el checkpoint completo de 600 MB.
- Validacion de mapeos de pesos: comprobar que las herramientas de conversion o carga (por ejemplo, scripts de sharding o conversion a otros formatos) respetan los nombres de tensores del checkpoint real.
- Pruebas de precision numerica: verificar que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16 antes de desplegar el modelo real.
- Desarrollo de harness de evaluacion: usar el fixture como sustituto rapido en tests de regresion de pipelines de deteccion de objetos de vocabulario abierto.
- Validacion de procesadores: comprobar que la tokenizacion y el preprocesado de imagenes, copiados byte a byte, se comportan igual que en el modelo original.
- Test de sensibilidad de entradas: reproducir la puerta de sensibilidad que exige que cada perturbacion mueva los logits al menos 0,001, como criterio de calidad del fixture.
- Formacion y documentacion: ejemplo minimo y ligero para explicar la estructura de un repositorio OWL-ViT sin necesidad de infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (mAP, precision, recall) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 para los 3,55 M de parametros; cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con al menos 1 GB de VRAM es suficiente. Una RTX 4090 o A100 estarian sobredimensionadas para este fixture.
- Cabe en GPU consumer: si, en cualquier modelo (GTX 1050, RTX 3060, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers con PyTorch es la via natural; llama.cpp, vLLM u Ollama no estan pensados para OWL-ViT y no se documentan para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas por encoder, la inferencia es practicamente instantanea en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| owlvit-base-patch32-mic | 3.552.198 | no disponible | no disponible | Fixture de test |
| google/owlvit-base-patch32 | no disponible en la informacion | no disponible | no disponible | Deteccion de objetos de vocabulario abierto |
| Otros fixtures de transformers-mic | variable | no disponible | no disponible | Pruebas de integracion |

La comparativa directa con modelos de deteccion reales no es significativa: el fixture no compite en calidad de deteccion, solo en estructura y compatibilidad con el checkpoint original.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce detecciones utiles ni texto coherente; no debe usarse en produccion.
- Artefacto de prueba: el tag `test-artifact` lo excluye de busquedas de modelos candidatos; su uso previsto es exclusivamente la validacion de integraciones.
- Licencia no disponible: no se puede confirmar el regimen de uso comercial; al derivar de `google/owlvit-base-patch32`, habria que consultar la licencia del modelo base.
- Idiomas no disponibles: no se declara cobertura linguistica.
- Contexto no disponible: no se especifica la longitud maxima de secuencia.
- Riesgo de confusion: al compartir nombre y estructura con el modelo real, podria confundirse con un checkpoint funcional; conviene revisar el README antes de integrarlo.
- Sin garantias de calidad: no hay benchmarks ni evaluacion de sesgos o alucinacion porque no hay comportamiento aprendido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/owlvit-base-patch32-mic
- Modelo base: https://huggingface.co/google/owlvit-base-patch32
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/owlvit-base-patch32-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/owlvit-base-patch32-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/owlvit-base-patch32-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/owlvit-base-patch32-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/owlvit-base-patch32-mic.html
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
