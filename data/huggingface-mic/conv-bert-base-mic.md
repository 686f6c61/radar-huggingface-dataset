# huggingface-mic/conv-bert-base-mic

## Resumen

`conv-bert-base-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic`, no un modelo entrenado ni utilizable en producción. Se trata de una versión reducida del checkpoint `YituTech/conv-bert-base`, generada automáticamente mediante la regla genérica de reducción de `sweep.py` del repositorio `transformers-mic`. Su propósito es servir como fixture reproducible para validar contratos de integración con Transformers: pesos con los mismos nombres de tensor que el modelo original, mismos ficheros de procesador copiados byte a byte y comportamiento numérico finito en float32, bfloat16 y float16.

El modelo conserva la arquitectura `ConvBertModel` (transformer con atención por convolución y atención por puntos, característica de ConvBERT) pero con un `num_hidden_layers` de 2 en lugar de la configuración completa del base. Los pesos son aleatorios (semilla 17) y no han sido entrenados: superaron únicamente una puerta de sensibilidad a la entrada que exige que cada perturbación de las entradas del contrato mueva los logits al menos 0,001. El repositorio ocupa 0,2 GB y contiene 23.951.524 parámetros en safetensors.

Es relevante únicamente para desarrolladores que trabajen en tooling de integración de modelos (verificación de contratos, tests de carga, comprobaciones de dtype), no para inferencia real. La model card lo etiqueta explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvBertModel (transformer con atención por convolución) |
| Parametros totales | 23.951.524 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; finito también en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es `ConvBertModel`, la variante de ConvBERT que sustituye parte de las cabezas de atención por atención basada en convoluciones y atención por puntos, con el objetivo original de reducir el coste computacional frente a BERT estándar. En este fixture, la configuración se ha reducido a `num_hidden_layers = 2` mediante la regla genérica de `sweep.py`, manteniendo los mismos nombres de tensor que el checkpoint real `YituTech/conv-bert-base`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato debe mover los logits al menos 0,001 (la más débil, `attention_mask:all_ones`, produjo 0,0143). Los ficheros de procesador (`vocab.txt`) se copiaron byte a byte desde el modelo original. El fixture se guardó en float32, el dtype con el que carga por defecto `YituTech/conv-bert-base`, y se verificó que el forward, la pérdida y los gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen representaciones ni predicciones con significado semántico.
- Sirve como fixture para validar la carga de checkpoints con arquitectura `ConvBertModel` en Transformers.
- Permite comprobar la compatibilidad de nombres de tensor con el checkpoint real `YituTech/conv-bert-base`.
- Permite validar el pipeline de tokenización con el `vocab.txt` original copiado byte a byte.
- Permite verificar estabilidad numérica (forward, loss, gradientes) en float32, bfloat16 y float16.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües reales.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Tests de integración de Transformers: cargar el fixture con `AutoModel.from_pretrained` para verificar que la clase `ConvBertModel` se instancia con la configuración reducida y los tensores esperados.
- Validación de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para comprobar que una versión de Transformers cumple las expectativas de entradas, salidas y dtypes documentadas.
- Verificación de compatibilidad de checkpoints: comprobar que los nombres de tensor del fixture coinciden con los del checkpoint real antes de migrar código entre versiones.
- Pruebas de dtype en CI: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar regresiones de estabilidad numérica sin coste de GPU elevado (24M parámetros, 0,2 GB).
- Reproducción de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture conv-bert-base-mic` y comparar hashes registrados en `build.json`.
- Validación de pipelines de tokenización: usar el `vocab.txt` original para probar el preprocesado sin descargar el checkpoint completo de ConvBERT base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no está entrenado y sus pesos son aleatorios, por lo que cualquier métrica de calidad (MMLU, GLUE, etc.) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,1 GB en float32 (23,95M parámetros × 4 bytes ≈ 96 MB), más overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU consumer o integrada; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, etc.) y en CPU sin problema.
- Opciones de despliegue: Transformers (carga estándar con `AutoModel`), útil en pipelines de CI con `pytest`; no se ha validado con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia será del orden de milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Proposito |
|---|---|---|---|---|---|
| `huggingface-mic/conv-bert-base-mic` | 23,95M | no disponible | No (pesos aleatorios) | no disponible | Fixture de test |
| `YituTech/conv-bert-base` | no disponible en la informacion proporcionada | no disponible | Sí | no disponible | Encoder ConvBERT base |
| `google-bert/bert-base-uncased` | ~110M | 512 | Sí | Apache 2.0 | Encoder BERT base |
| `distilbert/distilbert-base-uncased` | ~66M | 512 | Sí | Apache 2.0 | Encoder BERT destilado |

La comparativa con BERT base y DistilBERT se incluye solo como referencia de categoría (encoders tipo BERT); el fixture no es funcionalmente comparable porque sus pesos son aleatorios.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no producen salidas con significado. No debe desplegarse en producción ni usarse para inferencia real.
- Etiquetado como `test-artifact` por el autor para excluirlo de búsquedas de modelos candidatos; respetar esa etiqueta en cualquier catálogo o pipeline.
- Licencia no disponible: no se puede asumir uso comercial sin consultar la licencia del modelo base `YituTech/conv-bert-base`.
- Idiomas no disponibles en la información proporcionada; el `vocab.txt` proviene del modelo original, pero no se documenta cobertura lingüística.
- Longitud de contexto no disponible; la configuración reducida a 2 capas no refleja la del checkpoint original.
- Sesgos y alucinaciones: no aplica en sentido estricto al no estar entrenado, pero cualquier evaluación de sesgo sobre el fixture sería inválida.
- La configuración reducida (`num_hidden_layers = 2`) no reproduce el comportamiento del ConvBERT base completo; los resultados de tests de integración no son extrapolables a calidad del modelo real.
- Solo se han validado los dtypes float32, bfloat16 y float16; no se documenta soporte de cuantización (GGUF, GPTQ, AWQ, etc.).

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/conv-bert-base-mic
- Modelo base: https://huggingface.co/YituTech/conv-bert-base
- Manifest de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/conv-bert-base-mic.html
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
