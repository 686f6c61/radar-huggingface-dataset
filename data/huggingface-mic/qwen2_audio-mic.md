# huggingface-mic/qwen2_audio-mic

## Resumen

`huggingface-mic/qwen2_audio-mic` es un artefacto de prueba (fixture) publicado por el colectivo `huggingface-mic` dentro del proyecto `transformers-mic`, cuyo objetivo es validar la integración de arquitecturas concretas en el ecosistema Transformers. No se trata de un modelo entrenado ni utilizable en producción: es una versión "adelgazada" (slim) del modelo multimodal `Qwen/Qwen2-Audio-7B`, con la misma arquitectura y los mismos nombres de tensores, pero con solo 20,3 millones de parámetros y pesos aleatorios generados con semilla 17.

El propósito declarado del autor es ofrecer, en un único repositorio, pesos reducidos, ejemplos de uso ejecutables y las expectativas de framework (entradas, salidas y sensibilidad a perturbaciones) que permiten comprobar que la implementación de `Qwen2AudioForConditionalGeneration` en Transformers se comporta como se espera. La etiqueta `test-artifact` lo excluye explícitamente de las búsquedas de modelos candidatos a uso real.

Por tanto, la ficha describe un fixture de ingeniería de software, no un modelo de IA desplegable. Cualquier evaluación de calidad, capacidades o benchmarks carece de sentido sobre estos pesos: su valor está en la validación de pipelines, la reproducibilidad de tests y la documentación del contrato de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2AudioForConditionalGeneration (encoder de audio + decoder de texto tipo transformer) |
| Parametros totales | 20.258.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; el autor indica que es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2-Audio-7B |
| Tipo de artefacto | fixture de test (`test-artifact`), pesos aleatorios |
| Semilla de pesos | 17 |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base `Qwen/Qwen2-Audio-7B`: un modelo condicional multimodal con un encoder de audio y un decoder de texto. Para reducir el tamaño, el autor aplica la regla genérica de `sweep.py` del repositorio `transformers-mic`, que recorta el número de capas del encoder de audio a 2 (`audio encoder_layers: 2`) y el número de capas ocultas del decoder de texto a 2 (`text num_hidden_layers: 2`). Los ficheros de procesador (`generation_config.json`, `merges.txt`, `preprocessor_config.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte desde `Qwen/Qwen2-Audio-7B`.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una "input-sensitivity gate": cada perturbación de las entradas del contrato desplaza los logits al menos 0,001 (la más débil, `input_features:halve`, produce 0,463). Los tensores conservan los mismos nombres que el checkpoint real, lo que permite intercambiar el fixture por el modelo completo sin cambiar el código de carga. Se guarda en float32, el dtype por defecto del modelo base, y se verifica que el forward, la pérdida y los gradientes son finitos en float32, bfloat16 y float16. El `build.json` del repositorio registra las fuentes fijadas, los resultados de la gate y los hashes de los ficheros.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no han sido entrenados, por lo que no genera texto, audio ni representaciones con significado.
- Reproduce el contrato de entrada/salida de `Qwen2AudioForConditionalGeneration`, incluyendo `input_features` de audio y entradas de texto.
- Permite validar la carga del modelo en Transformers con los mismos nombres de tensores que el checkpoint real.
- Sirve como fixture para tests de integración, regresión y sensibilidad de entradas en pipelines de CI.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni soporte multilingüe efectivo, al carecer de entrenamiento.
- No soporta modos especiales (thinking, visión, audio útil) más allá de la estructura arquitectónica heredada del modelo base.

## Casos de uso

- Tests de integración en Transformers: cargar el fixture con `AutoModelForConditionalGeneration` y comprobar que la arquitectura `Qwen2AudioForConditionalGeneration` se instancia correctamente sin descargar los 7B parámetros del modelo real.
- Validación de contratos de entrada/salida: ejecutar perturbaciones sobre `input_features` y verificar que los logits cambian por encima del umbral definido (0,001), tal como documenta la gate del autor.
- Pruebas de compatibilidad de dtype: comprobar que el forward, la pérdida y los gradientes son finitos en float32, bfloat16 y float16 antes de aplicar cambios al código de modelado.
- CI/CD de bajo coste: usar el repositorio de 0,2 GB como sustituto del checkpoint de 7B en pipelines que solo necesitan validar la forma y el flujo de datos, reduciendo tiempo de descarga y uso de disco.
- Desarrollo de herramientas de inspección de modelos: comparar nombres de tensores y estructura de configuración entre el fixture y el checkpoint real para detectar divergencias en actualizaciones de la librería.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture mic-qwen2_audio-slim` y verificar que los hashes coinciden con los registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, etc.) sería inválida.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 20,3 M de parámetros; el repo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) es sobradamente suficiente; también funciona en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: carga con Transformers (framework para el que está diseñado el fixture); no está pensado para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo funcional.
- Latencia y throughput: no disponibles; no aplicables a un artefacto de test.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/qwen2_audio-mic | 20,3 M | no disponible | Fixture de test para Qwen2-Audio | no disponible | Hugging Face |
| Qwen/Qwen2-Audio-7B | 7B (aproximado, segun nombre) | no disponible en la informacion | Modelo multimodal audio-texto real | no disponible en la informacion | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Validacion de arquitecturas en Transformers | no disponible | Hugging Face |

La comparación relevante es con el modelo base: mismo nombre de tensores y misma arquitectura, pero con dos capas en el encoder de audio y dos en el decoder de texto, y pesos aleatorios en lugar de entrenados. No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no producen salidas con significado.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- La licencia no está disponible en la información proporcionada, por lo que no puede confirmarse el uso comercial.
- Los idiomas soportados no están documentados.
- La longitud de contexto no está documentada.
- No se han publicado benchmarks ni evaluaciones de calidad.
- El recorte de capas (2 en audio, 2 en texto) altera el comportamiento respecto al modelo base; no debe usarse para inferir propiedades del Qwen2-Audio-7B real.
- Cualquier resultado obtenido con este fixture no es extrapolable al modelo completo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/qwen2_audio-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2-Audio-7B
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/qwen2_audio-mic/blob/main/integration.json
- Uso con Transformers (`usage.md`): https://huggingface.co/huggingface-mic/qwen2_audio-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/qwen2_audio-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/qwen2_audio-mic/blob/main/build.json
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen2_audio-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
