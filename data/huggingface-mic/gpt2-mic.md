# huggingface-mic/gpt2-mic

## Resumen

`gpt2-mic` es un artefacto de prueba publicado por la organización `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni de un checkpoint utilizable: es una versión reducida ("slim fixture") del modelo `openai-community/gpt2` de OpenAI, generada para validar contratos de integración con la librería Transformers. El repositorio declara explícitamente la etiqueta `test-artifact`, cuyo propósito es mantenerlo fuera de las búsquedas de modelos candidatos.

El modelo conserva la arquitectura `GPT2LMHeadModel` del checkpoint original, pero con una configuración reducida que da un total de 3.382.080 parámetros (frente a los ~124 millones del GPT-2 base). Los pesos son aleatorios (semilla 17) y no han sido entrenados; el autor justifica esta decisión indicando que superaron una "puerta de sensibilidad a la entrada": cualquier perturbación de las entradas del contrato desplazó los logits al menos 0,001 (el caso más débil, `input_ids:roll_batch`, alcanzó 0,822).

La relevancia de este repositorio es puramente instrumental: sirve como fixture reproducible para probar la integración de GPT-2 en Transformers (variantes por defecto, eager y bfloat16) sobre una GPU NVIDIA A10G, con registro de línea base en proceso limpio. No debe emplearse para inferencia real, generación de texto ni ninguna tarea de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT2LMHeadModel (transformer decoder-only) |
| Parametros totales | 3.382.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; validado tambien en bfloat16 y float16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es un `GPT2LMHeadModel`, es decir, un transformer decoder-only con cabeza de modelado de lenguaje, heredado de `openai-community/gpt2`. La configuración ha sido reducida mediante la regla genérica implementada en `sweep.py` del repositorio `huggingface/transformers-mic`, dando lugar a un modelo de 3,4 millones de parámetros que mantiene los mismos nombres de tensores que el checkpoint real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se generaron solo tras verificar que el fixture pasa la puerta de sensibilidad a la entrada. Los ficheros de procesador (`generation_config.json`, `merges.txt`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `openai-community/gpt2`. El fixture se guardó en float32 (el dtype por defecto del checkpoint original) y se verificó que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave del fixture es `31fbd19576c7` y cubre cualquier checkpoint cuyos ficheros de procesador sean idénticos byte a byte y cuya configuración coincida tras el proceso de reducción.

## Capacidades

- No dispone de capacidades funcionales reales: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de validación para contratos de integración con Transformers (variantes por defecto, eager y bfloat16).
- Permite verificar la compatibilidad de nombres de tensores, shapes y dtypes frente al checkpoint `openai-community/gpt2`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües declaradas ni modos especiales (thinking, vision, audio).
- No se ha validado como pipeline de inferencia (`pipeline: no disponible`).

## Casos de uso

- Pruebas de integración en CI para Transformers: el fixture permite ejecutar tests de carga, forward y backward sin descargar el checkpoint completo de GPT-2, reduciendo el coste y el tiempo de las ejecuciones en pipelines de integración continua.
- Validación de contratos de API de modelos: el repositorio incluye `integration.json` y `integrations/transformers/expectations`, de modo que un equipo puede comprobar que su implementación cumple las expectativas declaradas (nombres de tensores, dtypes, comportamiento en eager y bfloat16).
- Reproducibilidad de resultados en investigación: al fijar semilla y hashes en `build.json`, permite reconstruir exactamente el mismo artefacto y comparar líneas base entre versiones de la librería.
- Desarrollo de harnesses de evaluación: útil para probar el andamiaje de evaluación (carga de safetensors, tokenizer, generación) antes de escalar al checkpoint real, sin incurrir en los ~500 MB del GPT-2 completo.
- Verificación de compatibilidad de cuantización: el fixture se puede usar para comprobar que rutas de conversión a bfloat16 y float16 producen valores finitos en forward, loss y gradientes.
- Formación y demos de integración: sirve para ilustrar cómo se estructura un repositorio de modelo con manifiesto de contrato, procedencia y evidencias de regeneración, sin exponer pesos con valor comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card únicamente reporta la puerta de sensibilidad a la entrada (perturbaciones con desplazamiento mínimo de 0,001 en logits) y la validación en una NVIDIA A10G con variantes por defecto, eager y bfloat16. Al tratarse de pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,4 M parámetros, ~13,5 MB de pesos) más overhead de activaciones y tokenizer; en la práctica cualquier GPU con 1-2 GB libres es suficiente.
- GPU recomendadas: el autor validó sobre NVIDIA A10G; cualquier GPU moderna (A100, H100, RTX 4090, RTX 3090, T4) sirve, ya que el cuello de botella no es el modelo.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o incluso CPU.
- Opciones de despliegue: Transformers (validado), y en principio llama.cpp u Ollama requerirían conversión previa a GGUF, no documentada en el repositorio. vLLM y TGI no están validados para este fixture.
- Latencia y throughput: no disponibles; al ser un fixture de test, no se han publicado mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/gpt2-mic` | 3.382.080 | no disponible | Fixture de test | no disponible | Hugging Face |
| `openai-community/gpt2` | ~124 M | 1024 tokens | Modelo base de lenguaje | MIT (segun el repositorio original) | Hugging Face |
| `openai-community/gpt2-medium` | ~355 M | 1024 tokens | Modelo base de lenguaje | MIT (segun el repositorio original) | Hugging Face |

La comparación relevante es únicamente estructural: `gpt2-mic` comparte arquitectura y tokenizer con `openai-community/gpt2`, pero con una configuración reducida y pesos aleatorios, por lo que no es funcionalmente comparable en calidad ni rendimiento. Frente a `gpt2-medium`, la diferencia de parámetros es de dos órdenes de magnitud.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto coherente y no debe usarse para inferencia real.
- Etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos; usarlo en producción iría contra la intención declarada por el autor.
- Licencia no disponible: no se puede asumir uso comercial libre sin consultar el repositorio original `openai-community/gpt2`.
- Idiomas soportados no disponibles; el tokenizer copiado es el de GPT-2, pero el modelo no ha sido entrenado para ningún idioma.
- Longitud de contexto no disponible: la configuración reducida puede diferir del valor de 1024 tokens del GPT-2 original.
- Riesgo de alucinación total: al no haber entrenamiento, cualquier salida es esencialmente ruido.
- No se han validado rutas de despliegue distintas de Transformers; conversiones a GGUF, vLLM o TGI no están documentadas.
- El repositorio tiene 0,0 GB de tamaño declarado y el modelo card indica que algunos ficheros deben regenerarse con `example/build_fixtures.py --fixture mic-gpt2-slim`, por lo que el contenido puede estar incompleto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/gpt2-mic
- Modelo base: https://huggingface.co/openai-community/gpt2
- Repositorio de código `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Evidencia de regeneración (GitHub Actions): https://github.com/huggingface/transformers-mic/actions/runs/38252430459
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gpt2-mic.html
