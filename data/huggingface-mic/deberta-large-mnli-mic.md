# huggingface-mic/deberta-large-mnli-mic

## Resumen

`huggingface-mic/deberta-large-mnli-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` en Hugging Face. No se trata de un modelo utilizable en produccion, sino de una version reducida del clasificador de inferencia de lenguaje natural `microsoft/deberta-large-mnli`, pensada para validar contratos de integracion con frameworks (principalmente Transformers) sin necesidad de descargar los pesos completos del modelo original.

El fixture conserva la arquitectura `DebertaForSequenceClassification` pero con una configuracion reducida a 2 capas ocultas, lo que da como resultado 3.370.307 parametros totales (frente a los aproximadamente 435 millones del checkpoint original). Los ficheros de procesador (`merges.txt`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte desde el modelo base, y los pesos se guardan en float32, el dtype por defecto del checkpoint de referencia.

La relevancia de este repositorio es puramente tecnica: sirve como banco de pruebas reproducible para pipelines de integracion, verificacion de contratos y tests de sensibilidad de entrada. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. Cualquier uso distinto al de testing o validacion de integraciones no esta soportado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (DebertaForSequenceClassification), transformer encoder |
| Parametros totales | 3.370.307 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; compatible con bfloat16 y float16 segun la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `DebertaForSequenceClassification` con la misma arquitectura que `microsoft/deberta-large-mnli` pero con la configuracion reducida a 2 capas ocultas (`num_hidden_layers: 2`), aplicando la regla generica de reduccion definida en `sweep.py` del repositorio `huggingface/transformers-mic`. Los ficheros de procesador se copian literalmente del checkpoint original, y los nombres de tensores coinciden con los del modelo real, lo que permite validar contratos de integracion sin ambiguedades.

No se ha realizado un entrenamiento real: los pesos estan sobreajustados al paso de entrenamiento del contrato (30 pasos), segun indica la model card. Los pesos aleatorios no superaron la puerta de sensibilidad de entrada (`attention_mask:all_ones` movia los logits solo 4.8e-05 frente al umbral 0.001), por lo que se opto por este sobreajuste controlado. El fixture es finito en float32, bfloat16 y float16 (forward, loss y gradientes). No hay informacion sobre volumen de datos, composicion del dataset ni tecnicas de alineacion (RLHF/DPO).

## Capacidades

- Clasificacion de secuencias (sequence classification) segun la arquitectura DeBERTa-v3, heredada del modelo base MNLI.
- Inferencia de lenguaje natural (NLI) a nivel de contrato de integracion, aunque los pesos no son funcionalmente utiles.
- Validacion de contratos de integracion con Transformers (manifest `integration.json`, `usage.md`, `expectations`).
- Verificacion de sensibilidad de entrada y de gradientes en float32, bfloat16 y float16.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues declaradas ni de modos especiales (thinking, vision, audio).

## Casos de uso

- Testing de pipelines de integracion con Transformers: el fixture permite ejecutar el flujo completo de carga, tokenizacion e inferencia sin descargar los 435M de parametros del modelo original, reduciendo tiempos de CI y ancho de banda.
- Validacion de contratos de framework: los ficheros `integration.json` y `integrations/transformers/expectations` permiten comprobar que una version de Transformers cumple las expectativas declaradas (nombres de tensores, dtypes, salidas).
- Pruebas de sensibilidad de entrada: util para verificar que cambios en `attention_mask` u otras entradas modifican los logits por encima del umbral definido (0.001), detectando regresiones en el pipeline.
- Verificacion de estabilidad numerica: al ser finito en float32, bfloat16 y float16, sirve para validar forward, loss y gradientes en distintos dtypes sin depender del checkpoint completo.
- Reproducibilidad de fixtures: el fichero `build.json` registra fuentes fijadas, resultados de puertas y hashes de ficheros, lo que permite reconstruir el artefacto con `build_fixtures.py --fixture deberta-large-mnli-mic`.
- Formacion y documentacion interna: ejemplo didactico de como reducir un checkpoint preservando nombres de tensores y ficheros de procesador para tests de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta metricas de MMLU, GLUE, MNLI ni ninguna otra tarea; el artefacto esta disenado para validacion de contratos, no para evaluacion de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,37M de parametros); el repo ocupa 0.0 GB segun Hugging Face.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (via `integrations/transformers/usage.md`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; al ser un fixture de 2 capas, la latencia sera muy baja, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/deberta-large-mnli-mic | 3.370.307 | no disponible | Fixture de clasificacion (test) | no disponible | Hugging Face |
| microsoft/deberta-large-mnli | ~435M (no confirmado en la informacion) | no disponible | NLI (MNLI) | no disponible | Hugging Face |
| microsoft/deberta-v3-large | no disponible | no disponible | Base encoder | no disponible | Hugging Face |

La comparativa se limita al modelo base declarado, ya que la informacion proporcionada no incluye otros modelos comparables de la misma categoria (fixtures de test).

## Limitaciones y advertencias

- No es un modelo utilizable: esta etiquetado como `test-artifact` y sobreajustado a 30 pasos de entrenamiento; sus predicciones no tienen valor semantico.
- Riesgo de uso indebido: si se emplea en produccion por error, producira clasificaciones sin sentido.
- Sesgos: no disponibles; al ser un fixture sin entrenamiento real, no se han evaluado sesgos.
- Alucinacion: no aplica en el sentido generativo, pero las salidas no son fiables.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: no disponible; conviene consultar la licencia del modelo base `microsoft/deberta-large-mnli` antes de cualquier uso derivado.
- Caveat de produccion: los pesos aleatorios fallaron la puerta de sensibilidad de entrada, por lo que el fixture solo es valido para tests de contrato, no para evaluacion funcional.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/deberta-large-mnli-mic
- Modelo base: https://huggingface.co/microsoft/deberta-large-mnli
- Manifest de contrato: `integration.json` (en el repo)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repo)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repo)
- Procedencia del fixture: `build.json` (en el repo)
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/deberta-large-mnli-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
