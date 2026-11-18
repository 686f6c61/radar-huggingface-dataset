# huggingface-mic/qwen2-mic

## Resumen

`qwen2-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic`, no un modelo entrenado ni utilizable en producción. Se trata de una versión "adelgazada" del checkpoint `Qwen/Qwen2-0.5B` de Alibaba, reducida a 9.798.208 parámetros mediante una regla genérica de reducción (`num_hidden_layers` = 2) aplicada sobre la arquitectura `Qwen2ForCausalLM`. Su propósito es validar contratos de integración de Transformers sobre la arquitectura Qwen2 con un peso mínimo, reproducible y verificable.

El repositorio combina pesos en `safetensors`, un manifiesto de contrato (`integration.json`), documentación de uso y expectativas de framework (`integrations/transformers/`), y evidencia de procedencia (`build.json`). Los pesos son aleatorios (semilla 17), en `bfloat16`, y los ficheros de procesador (`tokenizer.json`, `merges.txt`, `vocab.json`, `generation_config.json`, `LICENSE`, `tokenizer_config.json`) se copiaron byte a byte desde el checkpoint original.

Su relevancia es metodológica: permite a mantenedores de frameworks y pipelines de CI comprobar que la integración de Qwen2 funciona (carga, forward, backward, sensibilidad a entradas) sin descargar ni ejecutar el modelo completo. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. No debe confundirse con un modelo afinado ni con una variante funcional de Qwen2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only), reducida a 2 capas ocultas |
| Parametros totales | 9.798.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del tokenizer de Qwen2-0.5B; no declarada en el repo) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito también en float32 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero `LICENSE` se copió del checkpoint base, pero no se declara licencia propia) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo `Qwen2ForCausalLM` con la configuración reducida por la regla genérica de `sweep.py` del repositorio `huggingface/transformers-mic`: `num_hidden_layers` = 2. Los nombres de tensores coinciden con los del checkpoint real `Qwen/Qwen2-0.5B`, de modo que sirve como sustituto estructural en pruebas de integración. Los ficheros de procesador son idénticos byte a byte a los del checkpoint base, lo que garantiza que el pipeline de tokenización se comporta igual.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque superaron la puerta de sensibilidad a entradas del contrato: toda perturbación de las entradas movió los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, movió 0,289). El fixture se guardó en bfloat16 (dtype por defecto de Qwen2-0.5B) y se verificó que forward, loss y gradientes son finitos en float32, bfloat16 y float16. La validación pública se ejecutó en una NVIDIA A10G con variantes default, eager y bfloat16, y con registro de línea base en proceso limpio.

## Capacidades

- No tiene capacidades generativas reales: los pesos son aleatorios y la salida no es texto coherente.
- Sirve como fixture de integración para validar carga de `Qwen2ForCausalLM` en Transformers.
- Permite comprobar forward, loss y backward con gradientes finitos en float32, bfloat16 y float16.
- Valida la sensibilidad de los logits a perturbaciones de las entradas del contrato (incluida `attention_mask`).
- Reutiliza el tokenizer y `generation_config.json` reales de Qwen2-0.5B, por lo que ejercita el pipeline de tokenización auténtico.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües verificables.
- No incluye visión, audio ni modo thinking.

## Casos de uso

- Integración continua de Transformers: ejecutar tests de carga y forward de `Qwen2ForCausalLM` en cada PR sin descargar el checkpoint de 0.5B, gracias a los 9,8 M de parámetros y al tamaño de repo de 0,0 GB.
- Validación de contratos de framework: comprobar que una versión nueva de Transformers respeta el manifiesto `integration.json` y las expectativas declaradas en `integrations/transformers/expectations`.
- Pruebas de dtype: verificar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 antes de pasar al checkpoint real.
- Regresión de tokenización: al copiar byte a byte `tokenizer.json`, `merges.txt` y `vocab.json`, sirve para detectar cambios en el pipeline de tokenización de Qwen2 sin depender del modelo completo.
- Desarrollo de utilidades de inspección de pesos: probar scripts que recorren `state_dict`, comparan nombres de tensores o calculan hashes contra un fixture conocido y reproducible (clave `df1b08640fd5`).
- Reproducción de evidencia: regenerar el fixture con `python example/build_fixtures.py --fixture mic-qwen2-slim` y contrastar los hashes registrados en `build.json` frente a los artefactos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios; cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería irrelevante y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (9,8 M de parámetros); holgadamente por debajo de 1 GB en float32.
- GPU recomendadas: cualquier GPU con soporte bfloat16; la validación pública se hizo en una NVIDIA A10G.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (validado con variantes default, eager y bfloat16). No hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI para este fixture.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/qwen2-mic | 9.798.208 | no disponible | Fixture de integracion (pesos aleatorios) | no disponible | Hugging Face |
| Qwen/Qwen2-0.5B | ~0,5 B | no disponible en esta ficha | Modelo generativo real | no disponible en esta ficha | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable (reducidos) | no disponible | Validacion de contratos por arquitectura | no disponible | Hugging Face |

La comparación relevante es con el checkpoint base: `qwen2-mic` conserva nombres de tensores y ficheros de procesador de `Qwen/Qwen2-0.5B`, pero reduce capas y sustituye los pesos por valores aleatorios. No es un sustituto funcional del modelo original en ninguna tarea de generación.

## Limitaciones y advertencias

- Los pesos son aleatorios: la salida no es texto coherente y el modelo no debe usarse en producción ni en evaluación de calidad.
- Está etiquetado `test-artifact` precisamente para excluirlo de búsquedas de modelos candidatos; usarlo como modelo real es un error de uso.
- La licencia no está declarada en el repositorio; el fichero `LICENSE` copiado del checkpoint base no constituye por sí mismo una declaración de licencia para este artefacto.
- No se declaran idiomas soportados ni longitud de contexto; cualquier dato al respecto debe tomarse del checkpoint base, no de este repositorio.
- El alcance del contrato es solo el fixture: la cobertura del checkpoint completo es un trabajo separado, según la propia model card.
- No hay garantía de compatibilidad con runtimes distintos de Transformers; no se ha validado en vLLM, llama.cpp, Ollama ni TGI.
- El repositorio incluye solo pesos, uso y expectativas; otros ficheros deben regenerarse con `example/build_fixtures.py`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/qwen2-mic
- Checkpoint base: https://huggingface.co/Qwen/Qwen2-0.5B
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/qwen2-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/qwen2-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/qwen2-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/qwen2-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen2-mic.html
- Evidencia de regeneración (GitHub Actions): https://github.com/huggingface/transformers-mic/actions/runs/38252430459
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
