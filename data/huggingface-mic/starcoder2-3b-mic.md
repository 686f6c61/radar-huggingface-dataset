# huggingface-mic/starcoder2-3b-mic

## Resumen

`huggingface-mic/starcoder2-3b-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` dentro del proyecto `transformers-mic`. No es un modelo usable: se trata de una versión "adelgazada" del checkpoint `bigcode/starcoder2-3b`, reducida de aproximadamente 3.000 millones de parámetros a 3.204.480 parámetros, con pesos aleatorios (semilla 17) y sin entrenamiento alguno. Su propósito es servir como fixture de integración para validar contratos de uso y expectativas de framework (Transformers) sin necesidad de descargar el modelo completo.

La arquitectura subyacente es `Starcoder2ForCausalLM`, un transformer causal decoder-only, pero con `num_hidden_layers` reducido a 2 mediante la regla genérica de reducción del script `sweep.py` del repositorio `transformers-mic`. Los ficheros de procesador (`tokenizer.json`, `vocab.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer_config.json`) se copian byte a byte desde `bigcode/starcoder2-3b`, de modo que el tokenizador sí es el real del modelo original.

Su relevancia es puramente de ingeniería de pruebas: permite ejecutar pipelines de integración continua, validar la carga de safetensors y comprobar la sensibilidad de las entradas del contrato (perturbaciones de logits ≥ 0.001) sin coste computacional. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. No debe emplearse para inferencia real, generación de código ni ninguna tarea productiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Starcoder2ForCausalLM (transformer causal decoder-only) |
| Parametros totales | 3.204.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (config reducida; el modelo base soporta 16.384 tokens, pero no se confirma para el fixture) |
| Tipos de cuantizacion | no disponible (pesos en float32; finito también en bfloat16 y float16) |
| Idiomas soportados | no disponible (tokenizador heredado de `bigcode/starcoder2-3b`, multilingüe en código) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `Starcoder2ForCausalLM` del modelo base `bigcode/starcoder2-3b`, un transformer causal decoder-only con atención multi-cabeza estándar. La reducción se aplica mediante la regla genérica de `sweep.py`, que fija `num_hidden_layers` en 2 y ajusta el resto de la configuración para mantener coherencia dimensional. Los nombres de tensores son idénticos a los del checkpoint real, lo que permite validar rutas de carga sin discrepancias de nomenclatura.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se generaron únicamente para superar una puerta de sensibilidad de entradas: cada perturbación de las entradas del contrato debe mover los logits al menos 0.001 (la más débil, `attention_mask:all_ones`, produjo 0.824). Los ficheros de tokenizador se copiaron byte a byte desde `bigcode/starcoder2-3b`, garantizando que el pipeline de tokenización sea idéntico al del modelo original. El artefacto se guarda en float32 (el dtype por defecto del modelo base) y se verifica que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- No es un modelo funcional: no genera texto, código ni razonamiento útiles.
- Sirve como fixture de integración para validar la carga de `Starcoder2ForCausalLM` en Transformers.
- Permite comprobar el contrato de entradas (input-sensitivity gate) con perturbaciones controladas.
- Valida la compatibilidad de tokenizador heredado de `bigcode/starcoder2-3b`.
- Verifica la estabilidad numérica en float32, bfloat16 y float16.
- No soporta tool calling, agentes, visión, audio ni modo thinking.
- No tiene capacidades multilingües reales (los pesos son aleatorios).

## Casos de uso

- Pruebas de integración continua en Transformers: ejecutar el pipeline de carga y forward con un checkpoint de 3,2 M de parámetros para validar rutas de código sin consumir GPU.
- Validación de contratos de API: comprobar que las entradas declaradas en `integration.json` producen cambios de logits por encima del umbral de 0.001.
- Test de regresión de tokenizadores: verificar que `tokenizer.json`, `vocab.json` y `merges.txt` se cargan correctamente y producen los mismos IDs que el modelo base.
- Verificación de estabilidad numérica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar NaN o inf en cambios de framework.
- Desarrollo de herramientas de "shrink" de checkpoints: usar `build_fixtures.py` como referencia para generar fixtures de otros modelos con la misma regla de reducción.
- Pruebas de compatibilidad de safetensors: validar que los nombres de tensores del fixture coinciden con los del checkpoint real y que la carga no falla por discrepancias de shape.
- Formación y documentación: ejemplo didáctico de cómo construir un artefacto de prueba reproducible con procedencia registrada en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería irrelevante y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,2 M de parámetros ≈ 12,8 MB de pesos, más overhead de activaciones y tokenizador).
- GPU recomendadas: cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) o incluso CPU; no requiere acelerador dedicado.
- Cabe en cualquier GPU consumer y en CPU sin problemas.
- Opciones de despliegue: Transformers (carga directa), y en principio cualquier runtime que soporte safetensors; no se ha validado con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/starcoder2-3b-mic` | 3,2 M | no disponible | Fixture de test | no disponible | Hugging Face |
| `bigcode/starcoder2-3b` | ~3.000 M | 16.384 tokens (modelo base) | Generacion de codigo | no disponible en esta ficha | Hugging Face |
| `bigcode/starcoder2-7b` | ~7.000 M | 16.384 tokens (modelo base) | Generacion de codigo | no disponible en esta ficha | Hugging Face |

La comparación es asimétrica por diseño: el fixture no compite en calidad con los modelos reales, solo replica su arquitectura y tokenizador a escala reducida para pruebas. No se dispone de datos de benchmarks para comparar rendimiento.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y cualquier salida es ruido.
- No debe desplegarse en producción ni usarse para generación de código, razonamiento o cualquier tarea real.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; respetar esa etiqueta en pipelines de selección.
- Licencia no disponible: no se puede asumir uso comercial sin consultar la licencia del modelo base `bigcode/starcoder2-3b`.
- El contexto real del fixture no está documentado; no asumir los 16.384 tokens del modelo base.
- Los ficheros de tokenizador son los reales, pero los pesos no; no usar para evaluar calidad de tokenización en tareas downstream.
- Riesgo de confusión con el modelo base: verificar siempre el ID completo antes de cargar en producción.
- No se han validado runtimes alternativos (vLLM, llama.cpp, Ollama, TGI); solo Transformers está documentado.

## Enlaces

- [Hugging Face: huggingface-mic/starcoder2-3b-mic](https://huggingface.co/huggingface-mic/starcoder2-3b-mic)
- [Modelo base: bigcode/starcoder2-3b](https://huggingface.co/bigcode/starcoder2-3b)
- [Repositorio transformers-mic](https://github.com/huggingface/transformers-mic)
- [Script sweep.py](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Script build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
- [Explicación del shrink del fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/starcoder2-3b-mic.html)
- [integration.json](https://huggingface.co/huggingface-mic/starcoder2-3b-mic/blob/main/integration.json)
- [build.json](https://huggingface.co/huggingface-mic/starcoder2-3b-mic/blob/main/build.json)
- [Uso en Transformers](https://huggingface.co/huggingface-mic/starcoder2-3b-mic/blob/main/integrations/transformers/usage.md)
- [Expectativas en Transformers](https://huggingface.co/huggingface-mic/starcoder2-3b-mic/tree/main/integrations/transformers/expectations)
