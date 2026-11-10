# huggingface-mic/mbart-large-50-mic

## Resumen

`huggingface-mic/mbart-large-50-mic` es un artefacto de prueba (fixture) derivado de `facebook/mbart-large-50`, el modelo de traducción multilingüe de Meta AI basado en la arquitectura mBART-50. Lo publica la organización `huggingface-mic` con el propósito explícito de servir como banco de pruebas para integraciones de frameworks, no como modelo utilizable en producción. La model card lo etiqueta como `test-artifact` precisamente para excluirlo de búsquedas de modelos candidatos.

El repositorio contiene una versión "slim" del checkpoint original: mantiene la misma arquitectura (`MBartForConditionalGeneration`) y los mismos nombres de tensores, pero reduce el número de capas del encoder y del decoder a 2 cada una, lo que deja el total en 16.552.774 parámetros (frente a los aproximadamente 610 millones del modelo base). Los pesos son aleatorios (semilla 17) y los ficheros del procesador (tokenizer SentencePiece, `generation_config.json`, `special_tokens_map.json`, `tokenizer_config.json`) se copian byte a byte del modelo original.

Su relevancia es puramente técnica e instrumental: permite validar contratos de integración (carga, forward, loss, gradientes, sensibilidad a entradas) en float32, bfloat16 y float16 sin descargar ni ejecutar el modelo completo. No debe confundirse con un modelo entrenado ni usarse para inferencia real de traducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MBartForConditionalGeneration), 2 capas de encoder y 2 de decoder |
| Parametros totales | 16.552.774 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `facebook/mbart-large-50` es un transformer encoder-decoder preentrenado para traducción multilingüe. Esta fixture conserva esa arquitectura y los nombres de tensores originales, pero reduce el config a 2 capas de encoder y 2 de decoder mediante la regla genérica de `sweep.py` del proyecto `transformers-mic`. No hay entrenamiento: los pesos se inicializan aleatoriamente con semilla 17 y se validan con una puerta de sensibilidad a la entrada, según la cual cada perturbación de las entradas del contrato desplaza los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, alcanza 0,00499).

Los ficheros del procesador se copian literalmente del checkpoint original, de modo que el pipeline de tokenización es idéntico al del modelo real. La fixture se guarda en float32, el dtype por defecto de `facebook/mbart-large-50`, y se verifica que forward, loss y gradientes son finitos en float32, bfloat16 y float16. El repositorio incluye además un manifiesto de contrato (`integration.json`), documentación de uso para Transformers (`integrations/transformers/usage.md`), expectativas del framework (`integrations/transformers/expectations`) y procedencia de la fixture (`build.json`).

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen traducciones ni texto coherente.
- Sirve como fixture de integración para validar la carga de `MBartForConditionalGeneration` en Transformers.
- Permite comprobar el contrato de entradas y salidas (input_ids, attention_mask, logits) con sensibilidad mínima garantizada.
- Verifica estabilidad numérica en float32, bfloat16 y float16 (forward, loss, gradientes).
- Reutiliza el tokenizer SentencePiece y los ficheros de configuración del modelo base sin modificaciones.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Pruebas de integración en CI: cargar la fixture en un job ligero (0,1 GB de repo) para comprobar que la versión de Transformers en uso sigue aceptando `MBartForConditionalGeneration` sin descargar los ~2,4 GB del checkpoint real.
- Validación de contratos de framework: ejecutar `integrations/transformers/expectations` para verificar que las entradas declaradas producen cambios de logits por encima del umbral definido.
- Pruebas de precisión mixta: comprobar que forward, loss y gradientes permanecen finitos en bfloat16 y float16 antes de aplicar esas rutas al modelo completo.
- Desarrollo de pipelines de tokenización: al copiar byte a byte el `sentencepiece.bpe.model` y el `tokenizer_config.json`, permite probar la tokenización multilingüe de mBART-50 sin cargar los pesos grandes.
- Regresión de serialización: validar que el guardado y recarga en safetensors float32 conserva los nombres de tensores del checkpoint original.
- Docencia y demos de arquitectura: inspeccionar la estructura encoder-decoder de mBART con un modelo de 16,5 M de parámetros que cabe en cualquier entorno, incluido CPU.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture mbart-large-50-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (BLEU, MMLU, etc.) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (16,5 M de parámetros, ~66 MB de pesos) más el overhead de activaciones, despreciable.
- GPU recomendadas: ninguna en particular; funciona en CPU sin problema.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con memoria compartida.
- Opciones de despliegue: Transformers (ruta principal documentada en `integrations/transformers/usage.md`); otras rutas (vLLM, llama.cpp, Ollama, TGI) no están documentadas para esta fixture.
- Latencia y throughput: no disponibles; al ser una fixture de 2+2 capas, la latencia sería muy inferior a la del modelo real, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Capas enc/dec | Contexto | Pesos | Proposito | Licencia |
|---|---|---|---|---|---|---|
| huggingface-mic/mbart-large-50-mic | 16,5 M | 2 / 2 | no disponible | Aleatorios (seed 17) | Fixture de integración | no disponible |
| facebook/mbart-large-50 | ~610 M | 12 / 12 | 1024 tokens (mBART-50) | Entrenados | Traducción multilingüe | MIT (según el modelo base) |
| facebook/mbart-large-50-many-to-many-mmt | ~610 M | 12 / 12 | 1024 tokens | Entrenados (fine-tune MMT) | Traducción multilingüe many-to-many | MIT (según el modelo base) |

La comparación solo tiene sentido a nivel estructural: la fixture replica la interfaz del modelo base con un tamaño reducido. No es una alternativa funcional a mBART-50 ni a ningún modelo de traducción.

## Limitaciones y advertencias

- Los pesos son aleatorios: la salida no es texto ni traducción válida. No usar en producción ni en demos de calidad.
- Etiquetada como `test-artifact` para excluirla de búsquedas de modelos candidatos; ignorar esa etiqueta puede llevar a integrarla por error.
- La licencia no está declarada en la información disponible; hay que remitirse a la del modelo base (`facebook/mbart-large-50`) antes de cualquier uso.
- El número de capas reducido (2/2) implica que no reproduce el comportamiento numérico del checkpoint completo, solo la interfaz y la estabilidad básica.
- La longitud de contexto, los idiomas soportados y las cuantizaciones no están documentados para esta fixture.
- Los ficheros del procesador son idénticos a los del modelo base, pero el vocabulario y los tokens especiales no se han validado contra una tarea de traducción real.
- Riesgo de alucinación: irrelevante en sentido estricto, pero cualquier texto generado será ruido aleatorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/mbart-large-50-mic
- Modelo base: https://huggingface.co/facebook/mbart-large-50
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/mbart-large-50-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/mbart-large-50-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/mbart-large-50-mic/tree/main/integrations/transformers/expectations
- Procedencia de la fixture: https://huggingface.co/huggingface-mic/mbart-large-50-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mbart-large-50-mic.html
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
