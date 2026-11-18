# huggingface-mic/Voxtral-Mini-3B-2507-mic

## Resumen

Voxtral-Mini-3B-2507-mic es un artefacto de prueba (fixture) publicado en Hugging Face por la organización huggingface-mic. No es un modelo utilizable: se trata de una versión "reducida" del modelo multimodal de audio y lenguaje mistralai/Voxtral-Mini-3B-2507, generada automáticamente mediante una regla genérica de reducción de configuración que recorta el número de capas del encoder de audio y del decoder de texto a 2 cada uno. El resultado son 17.104.704 parámetros (frente a los aproximadamente 3.000 millones del modelo original) con pesos aleatorios inicializados con semilla 17.

El propósito del repositorio es servir como contrato de integración para frameworks: incluye el manifiesto `integration.json`, ejemplos de uso con Transformers, un directorio de expectativas de framework, la procedencia de la fixture en `build.json` y los ficheros de procesador copiados byte a byte del checkpoint original (`generation_config.json`, `params.json`, `preprocessor_config.json`, `tekken.json`). La arquitectura declarada es `VoxtralForConditionalGeneration`, la misma familia que el modelo base, pero con una configuración mucho menor.

Su relevancia es exclusivamente para desarrollo y testing de integraciones: permite validar pipelines de carga, preprocesado de audio, tokenización Tekken y ejecución forward/loss/gradients sin descargar los pesos completos del modelo real. Está etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos y no debe emplearse para inferencia real ni para evaluación de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VoxtralForConditionalGeneration (transformer multimodal audio-lenguaje, configuración reducida) |
| Parámetros totales | 17.104.704 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La fixture replica la arquitectura `VoxtralForConditionalGeneration` del modelo base mistralai/Voxtral-Mini-3B-2507, un modelo multimodal que combina un encoder de audio con un decoder de lenguaje. La reducción se aplicó con la regla genérica de `sweep.py` del repositorio transformers-mic: `audio num_hidden_layers` = 2 y `text num_hidden_layers` = 2. Los ficheros de procesador se copiaron byte a byte del checkpoint original, de modo que la tokenización Tekken y el preprocesado de audio son idénticos a los del modelo real.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (la más débil, `input_features:reverse`, 0,28). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Se guardó en bfloat16, el dtype con el que carga por defecto mistralai/Voxtral-Mini-3B-2507.

## Capacidades

- Carga y ejecución del grafo `VoxtralForConditionalGeneration` con configuración reducida.
- Validación de pipelines de preprocesado de audio con los ficheros de procesador originales.
- Tokenización Tekken idéntica a la del modelo base (fichero `tekken.json` copiado).
- Ejecución forward, cálculo de loss y retropropagación de gradientes en float32, bfloat16 y float16.
- Verificación de nombres y formas de tensores frente al checkpoint real.
- No genera texto ni audio con calidad: los pesos son aleatorios.
- No dispone de tool calling, agentes, thinking mode ni capacidades multilingües reales.

## Casos de uso

- Test de integración en Transformers: cargar la fixture con `AutoModelForConditionalGeneration` y comprobar que el pipeline de audio a texto se construye sin errores antes de pasar al checkpoint completo.
- Validación de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para verificar que una nueva versión de Transformers respeta las firmas y salidas esperadas.
- CI/CD de librerías de inferencia: ejecutar tests de humo en cada pull request sin descargar los ~6 GB del modelo real, gracias a los 0,1 GB del repositorio.
- Desarrollo de preprocesadores de audio: probar cambios en el tratamiento de `input_features` contra un modelo que reacciona a las perturbaciones de entrada (puerta de sensibilidad verificada).
- Verificación de compatibilidad de tokenizador Tekken: comprobar que una implementación alternativa de tokenización produce los mismos ids que el fichero `tekken.json` original.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture Voxtral-Mini-3B-2507-mic` y comparar hashes registrados en `build.json`.
- Depuración de gradient flow: usar la fixture para comprobar que loss y gradientes son finitos en distintas precisiones antes de escalar al modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad carecería de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (17,1 M de parámetros, ~34 MB de pesos) más el overhead del runtime.
- GPU recomendadas: cualquier GPU con soporte bfloat16; también funciona en CPU para tests.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (uso previsto según `integrations/transformers/usage.md`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser una fixture de test no se caracteriza rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voxtral-Mini-3B-2507-mic | 17,1 M | no disponible | Fixture de test | no disponible | Hugging Face (huggingface-mic) |
| mistralai/Voxtral-Mini-3B-2507 | ~3 B (según denominación) | no disponible en la información | Modelo multimodal audio-lenguaje real | no disponible en la información | Hugging Face (mistralai) |
| Otras fixtures transformers-mic | variable | no disponible | Contratos de integración | no disponible | Hugging Face (huggingface-mic) |

La comparación relevante es con el modelo base: misma arquitectura y mismos ficheros de procesador, pero con capas reducidas a 2 y pesos aleatorios en lugar de entrenados. No se dispone de información sobre otros modelos comparables de la misma categoría en los datos proporcionados.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado semántico.
- Etiquetado explícitamente como `test-artifact`; no debe aparecer en búsquedas de modelos candidatos ni en evaluaciones de calidad.
- La licencia no está disponible en la información proporcionada; verificar antes de cualquier uso, incluso en tests.
- No se han publicado datos de sesgos, alucinación ni comportamiento multilingüe; irrelevantes para su propósito de fixture, pero impiden cualquier uso en producción.
- El contexto máximo y los idiomas soportados no están documentados en la información disponible.
- La fixture solo cubre checkpoints con ficheros de procesador idénticos en bytes y configuración coincidente tras la reducción (clave `b38baec3589c`); no sirve para validar variantes con otro procesador.
- Requiere reconstruir los ficheros auxiliares con `build_fixtures.py` si se necesita un entorno completo; el repositorio solo incluye pesos reducidos, uso y expectativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Voxtral-Mini-3B-2507-mic
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507
- Documentación de uso con Transformers: integrations/transformers/usage.md (en el repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (en el repositorio)
- Manifiesto de contrato: integration.json (en el repositorio)
- Procedencia de la fixture: build.json (en el repositorio)
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Voxtral-Mini-3B-2507-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
