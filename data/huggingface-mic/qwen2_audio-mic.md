# huggingface-mic/qwen2_audio-mic

## Resumen

`qwen2_audio-mic` es un artefacto de prueba (test artifact) publicado por el usuario `huggingface-mic` en Hugging Face. No se trata de un modelo funcional, sino de un *fixture* reducido construido a partir de `Qwen/Qwen2-Audio-7B` para validar contratos de integración y expectativas de frameworks (concretamente Transformers). El autor lo etiqueta explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos a uso real.

El repositorio contiene pesos "slim" de 20.258.816 parámetros (aproximadamente 20,3 millones), generados mediante una regla genérica de reducción implementada en `sweep.py` del proyecto `transformers-mic`. La arquitectura declarada es `Qwen2AudioForConditionalGeneration`, pero con el codificador de audio reducido a 2 capas y el modelo de texto reducido a 2 capas ocultas. Los pesos son aleatorios (semilla 17) y no han sido entrenados; únicamente pasaron una compuerta de sensibilidad a las entradas.

Su relevancia es puramente de ingeniería: sirve como fixture reproducible para probar integraciones, verificar nombres de tensores, comprobar la finitud numérica en float32, bfloat16 y float16, y validar el comportamiento de frameworks sin necesidad de descargar el modelo completo de 7B. No debe confundirse con un modelo utilizable para inferencia real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2AudioForConditionalGeneration (transformer multimodal audio-texto, reducido) |
| Parametros totales | 20.258.816 (aprox. 20,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de `Qwen2-Audio-7B`: un transformer multimodal que combina un codificador de audio con un modelo de lenguaje para generación condicional (`Qwen2AudioForConditionalGeneration`). Sin embargo, esta versión *slim* reduce el codificador de audio a 2 capas (`audio encoder_layers 2`) y el modelo de texto a 2 capas ocultas (`text num_hidden_layers 2`), conservando los mismos nombres de tensores que el checkpoint real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una compuerta de sensibilidad a las entradas: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `input_features:halve`, con 0,463). Los ficheros del procesador (`generation_config.json`, `merges.txt`, `preprocessor_config.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `Qwen/Qwen2-Audio-7B`. El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave del fixture es `098d203cfc53`.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas semánticamente válidas.
- Sirve como fixture de integración para validar contratos de frameworks (Transformers) con la arquitectura Qwen2-Audio.
- Permite verificar nombres de tensores y compatibilidad de checkpoints sin descargar el modelo completo de 7B.
- Permite probar la carga en float32, bfloat16 y float16, así como la finitud de forward, loss y gradientes.
- Incluye ficheros de procesador idénticos a los del modelo base, útiles para probar pipelines de tokenización y preprocesado de audio.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo utilizables.

## Casos de uso

- Pruebas de integración en CI/CD: usar el fixture para validar que una integración con Transformers carga correctamente un checkpoint `Qwen2AudioForConditionalGeneration` sin descargar los 7B parámetros del modelo real.
- Validación de contratos de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen frente a los tensores y ficheros del fixture.
- Desarrollo de herramientas de reducción de modelos: servir como caso de prueba reproducible para la regla genérica de `sweep.py`.
- Verificación de nombres de tensores: comparar los nombres del fixture con los del checkpoint real para detectar discrepancias en integraciones personalizadas.
- Pruebas de precisión numérica: comprobar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 antes de ejecutar sobre el modelo completo.
- Pruebas de pipelines de audio: validar la tokenización y el preprocesado de audio usando los ficheros de procesador copiados byte a byte del modelo base.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture mic-qwen2_audio-slim` y verificar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en torno a 0,1 GB en float32 para los 20,3 M de parámetros, aunque el modelo no es funcional para inferencia real.
- GPU recomendadas: no aplica; cualquier GPU consumer es suficiente para cargar el fixture.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (carga estándar de safetensors); no se documentan opciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser pesos aleatorios y un modelo reducido, las métricas no serían representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2_audio-mic | 20,3 M | no disponible | Fixture de prueba | no disponible | Hugging Face |
| Qwen/Qwen2-Audio-7B | 7B (aprox.) | no disponible | Modelo multimodal audio-texto real | no disponible | Hugging Face |
| Modelos de prueba equivalentes | no disponible | no disponible | Fixtures de integracion | no disponible | no disponible |

La comparación directa con modelos funcionales no es pertinente: `qwen2_audio-mic` es un artefacto de prueba derivado de `Qwen/Qwen2-Audio-7B`, no un modelo entrenado para tareas reales.

## Limitaciones y advertencias

- Los pesos son aleatorios (semilla 17): las salidas no tienen significado y no deben usarse en producción.
- El autor lo etiqueta explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.
- La arquitectura está reducida (2 capas en audio y 2 en texto), por lo que no reproduce el comportamiento del modelo base de 7B.
- La licencia no está disponible en la información proporcionada; no se puede confirmar el uso comercial.
- No se dispone de información sobre sesgos, alucinación o limitaciones idiomáticas porque el modelo no ha sido entrenado.
- No debe confundirse con `Qwen/Qwen2-Audio-7B` ni usarse como sustituto en evaluaciones de calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/qwen2_audio-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2-Audio-7B
- Manifiesto del contrato: https://huggingface.co/huggingface-mic/qwen2_audio-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/qwen2_audio-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/qwen2_audio-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/qwen2_audio-mic/blob/main/build.json
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen2_audio-mic.html
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
