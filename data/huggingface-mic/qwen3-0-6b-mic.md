# huggingface-mic/Qwen3-0.6B-mic

## Resumen

Qwen3-0.6B-mic es un artefacto de prueba publicado por el usuario huggingface-mic bajo el paraguas del proyecto transformers-mic. No es un modelo entrenado ni utilizable para inferencia real: se trata de un *fixture* reducido de Qwen/Qwen3-0.6B, generado para validar contratos de integración entre frameworks (Transformers y otros) y el checkpoint original. El propio autor lo etiqueta como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

El repositorio contiene pesos "slim" con solo 9.798.016 parámetros, frente a los aproximadamente 600 millones del modelo base Qwen3-0.6B. La reducción se logra aplicando una regla genérica de *shrinking* sobre la configuración (num_hidden_layers = 2) manteniendo la misma arquitectura `Qwen3ForCausalLM`, los mismos nombres de tensores y los ficheros de procesador copiados byte a byte del checkpoint original.

Su relevancia es exclusivamente de ingeniería: sirve para verificar que una implementación de framework carga correctamente un checkpoint Qwen3, expone las entradas y salidas esperadas y valida la sensibilidad de las mismas. Cualquier uso como modelo de lenguaje en producción sería un error de interpretación del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only, configuración reducida a 2 capas) |
| Parametros totales | 9.798.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config de Qwen3-0.6B, no verificada en el fixture) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (los ficheros de tokenizer se copian del modelo base, pero el fixture no genera texto coherente) |
| Licencia | no disponible (el fichero LICENSE se copia del modelo base, pero el repositorio no declara licencia propia) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base Qwen3-0.6B (`Qwen3ForCausalLM`), un transformer decoder-only causal, pero con la configuración reducida mediante la regla genérica implementada en `sweep.py` del repositorio transformers-mic: `num_hidden_layers` se fija en 2. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que cualquier código que espere un Qwen3 puede cargarlo sin cambios estructurales.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque superaron la "input-sensitivity gate": toda perturbación de las entradas del contrato movía los logits al menos 0.001 (el caso más débil, `attention_mask:all_ones`, produjo 0.402). Los ficheros de procesador (`LICENSE`, `generation_config.json`, `merges.txt`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde Qwen/Qwen3-0.6B. El fixture se guardó en bfloat16, el dtype por defecto del modelo base, y se verificó que forward, loss y gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- Carga de checkpoint compatible con la arquitectura Qwen3 (mismos nombres de tensores que el modelo real).
- Validación de contratos de integración: manifiesto `integration.json`, uso en Transformers y directorio de expectativas del framework.
- Verificación de sensibilidad de entradas: cada perturbación de las entradas del contrato altera los logits por encima del umbral de 0.001.
- Ejecución de forward, cálculo de loss y retropropagación en float32, bfloat16 y float16.
- No genera texto coherente: los pesos son aleatorios y el modelo no ha sido entrenado.
- No soporta tool calling, agentes, razonamiento ni capacidades multilingües reales.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Pruebas de integración de frameworks: cargar el fixture en Transformers (u otro framework) para comprobar que la implementación de Qwen3 lee correctamente la configuración, los nombres de tensores y los ficheros de tokenizer.
- CI/CD de librerías de inferencia: usar el repositorio como caso de prueba ligero (9,8 M de parámetros) que se descarga y ejecuta rápido en pipelines de integración continua sin consumir GPU.
- Validación de contratos de API: comprobar que las entradas declaradas en `integration.json` producen cambios medibles en los logits, detectando regresiones en el mapeo de entradas.
- Desarrollo de tests de tokenizer: al copiar `tokenizer.json`, `vocab.json` y `merges.txt` del modelo base, permite verificar la ruta de carga de procesadores sin descargar el checkpoint completo.
- Verificación de dtypes: probar que forward, loss y gradientes son finitos en float32, bfloat16 y float16, cubriendo rutas de precisión mixta.
- Reproducibilidad de fixtures: reconstruir el artefacto con `build_fixtures.py --fixture Qwen3-0.6B-mic` y comparar hashes registrados en `build.json`.
- Auditoría de provenance: revisar `build.json` para trazar las fuentes fijadas, los resultados de la gate y los hashes de ficheros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier métrica de calidad sería irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (9,8 M de parámetros × 2 bytes ≈ 20 MB de pesos, más overhead de activaciones y runtime).
- GPU recomendadas: cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) o incluso CPU; no requiere acelerador de datacenter.
- Cabe en cualquier GPU consumer y en CPU sin problemas.
- Opciones de despliegue: Transformers (ruta documentada en `integrations/transformers/usage.md`); otras rutas (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este fixture.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia sería mínima pero no representativa de ningún modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-mic (este) | 9,8 M | no disponible | Fixture de test | no disponible | Hugging Face |
| Qwen/Qwen3-0.6B | ~600 M | no disponible en la informacion | Modelo de lenguaje real | no disponible en la informacion | Hugging Face |
| Alternativas de fixture de otros modelos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo base Qwen/Qwen3-0.6B: mismo linaje arquitectónico y mismos ficheros de procesador, pero con dos capas en lugar de la configuración completa y pesos aleatorios en lugar de entrenados. No se dispone de información sobre otros fixtures comparables.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y la salida no tiene sentido lingüístico.
- Etiquetado explícitamente como `test-artifact`; no debe tratarse como candidato en búsquedas de modelos.
- La licencia no está declarada en el repositorio; el fichero LICENSE copiado del modelo base no equivale a una licencia del fixture.
- Los idiomas soportados no están documentados; el tokenizer se hereda del modelo base pero el fixture no genera texto.
- La longitud de contexto efectiva no está verificada en la configuración reducida.
- Riesgo de confusión en producción: un pipeline que resuelva este repositorio por error obtendría salidas sin sentido; conviene excluirlo por tag.
- No apto para evaluación de calidad, alineación, sesgos ni alucinación, ya que no ha sido entrenado.
- El tamaño del repo figura como 0.0 GB en los metadatos, lo que puede indicar que los pesos no están completamente subidos o que el cálculo es inexacto; verificar antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Qwen3-0.6B-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Documentación del proceso de shrinking: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3-0.6B-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
