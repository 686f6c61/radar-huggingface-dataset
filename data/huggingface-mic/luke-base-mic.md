# huggingface-mic/luke-base-mic

## Resumen

`luke-base-mic` es un artefacto de prueba (test artifact) publicado por el usuario `huggingface-mic`. No es un modelo entrenado ni un modelo utilizable en producción: se trata de una versión reducida ("slim fixture") del modelo LUKE base de Studio Ousia, con pesos aleatorios y una configuración de arquitectura recortada. Su propósito es servir como fixture reproducible para validar el contrato de integración de la librería `transformers-mic`, no para realizar inferencia real.

El modelo conserva la arquitectura `LukeForMaskedLM` del checkpoint original `studio-ousia/luke-base`, pero reduce el número de capas ocultas a 2, resultando en aproximadamente 10,2 millones de parámetros. Los ficheros del procesador (tokenizador, vocabulario de entidades, merges, tokens especiales) se copian byte a byte del modelo original, de modo que el fixture reproduce fielmente el pipeline de preprocesado de LUKE.

La relevancia de este repositorio es exclusivamente de ingeniería: permite a los desarrolladores de `transformers-mic` verificar que las expectativas del framework (nombres de tensores, dtypes, sensibilidad a entradas, comportamiento en float32/bfloat16/float16) se cumplen sin necesidad de descargar ni ejecutar el checkpoint completo de LUKE base. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo LUKE (`LukeForMaskedLM`), con conocimiento de entidades |
| Parámetros totales | ~10,2 M (fixture reducido; el modelo base original tiene ~253 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos guardados en float32; verificado también en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors / PyTorch (repo de 1,1 GB; pesos en float32) |

## Arquitectura y entrenamiento

El fixture emplea la arquitectura LUKE (`LukeForMaskedLM`), un transformer basado en RoBERTa con embeddings adicionales de entidades que modela conjuntamente palabras y entidades para tareas de comprensión del lenguaje con conocimiento de entidades. En este repositorio, la configuración se ha reducido mediante la regla genérica de `sweep.py` a `num_hidden_layers = 2`, lo que da lugar a un modelo de ~10,2 M de parámetros con los mismos nombres de tensores que el checkpoint original.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron mediante una "input-sensitivity gate": cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, dio 0,00396). Los ficheros del procesador se copiaron byte a byte de `studio-ousia/luke-base` (`added_tokens.json`, `entity_vocab.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.json`). El fixture omite `lm_head.decoder.weight` igual que el checkpoint real, y se guardó en float32, el dtype por defecto del modelo original. Se verificó que es finito en float32, bfloat16 y float16 (forward, loss y gradientes).

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas semánticamente válidas.
- Reproduce el contrato de `LukeForMaskedLM`: nombres de tensores, dtypes y comportamiento de carga idénticos al checkpoint real.
- Incluye el pipeline de preprocesado de LUKE (tokenizador y vocabulario de entidades) copiado del modelo original.
- Sirve como fixture de pruebas para validar expectativas de framework en `transformers-mic`.
- Verificado para ejecución en float32, bfloat16 y float16 (forward, loss, gradientes).
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües verificadas.
- No debe usarse para generación de texto, razonamiento, código ni matemáticas.

## Casos de uso

- Validación de contratos de integración: el fixture permite comprobar que `transformers-mic` carga correctamente un `LukeForMaskedLM` con los nombres de tensores esperados, sin descargar el checkpoint completo.
- Pruebas de CI/CD: al pesar ~10,2 M de parámetros, se puede incluir en pipelines de integración continua para detectar regresiones en la carga de modelos y en el manejo de dtypes.
- Verificación de dtypes: permite comprobar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 antes de aplicar cambios al framework.
- Pruebas de preprocesado: al copiar byte a byte los ficheros del procesador de LUKE, sirve para validar el pipeline de tokenización y el vocabulario de entidades en tests aislados.
- Reproducibilidad de fixtures: el `build.json` registra fuentes fijadas, resultados de la gate y hashes de ficheros, lo que permite reconstruir el fixture con `python example/build_fixtures.py --fixture luke-base-mic`.
- Desarrollo de la herramienta de reducción: sirve como caso de prueba de la regla genérica de `sweep.py` para generar fixtures reducidos a partir de checkpoints reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no procede evaluar su rendimiento en tareas de NLP.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de decenas de MB en float32 para ~10,2 M de parámetros (el repo ocupa 1,1 GB por incluir pesos y ficheros auxiliares).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; también puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: carga mediante `transformers` (PyTorch); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; irrelevantes para un fixture de pruebas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/luke-base-mic` | ~10,2 M (fixture) | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| `studio-ousia/luke-base` | ~253 M | 512 tokens (LUKE base estándar) | MLM con conocimiento de entidades | no disponible en la información proporcionada | Hugging Face |
| `studio-ousia/luke-large` | ~481 M | 512 tokens (LUKE large estándar) | MLM con conocimiento de entidades | no disponible en la información proporcionada | Hugging Face |

La comparación con `luke-base` y `luke-large` es la más directa por compartir arquitectura y pipeline de preprocesado, aunque el fixture no es funcionalmente equivalente a ninguno de ellos.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen valor semántico.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- La licencia no está disponible en la información proporcionada, por lo que no puede confirmarse su uso comercial.
- No se documentan idiomas soportados ni longitud de contexto para este fixture.
- El modelo base original (`studio-ousia/luke-base`) carece de `lm_head.decoder.weight`, y el fixture reproduce esa ausencia; la inicialización de ese tensor ocurre como en el modelo real.
- No debe confundirse con un checkpoint reducido por destilación o poda: la reducción es estructural y los pesos no provienen de entrenamiento.
- El repositorio incluye únicamente pesos, uso y expectativas de framework; otros ficheros deben regenerarse con el script de construcción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/luke-base-mic
- Modelo base: https://huggingface.co/studio-ousia/luke-base
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/luke-base-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/luke-base-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/luke-base-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/luke-base-mic/blob/main/build.json
- Cómo se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/luke-base-mic.html
- Script de reducción (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
