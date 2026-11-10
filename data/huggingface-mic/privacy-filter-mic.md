# huggingface-mic/privacy-filter-mic

## Resumen

`privacy-filter-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic`, no un modelo entrenado ni utilizable en producción. Deriva de `openai/privacy-filter`, un modelo de clasificación de tokens orientado a la detección de información personal identificable (PII), y reproduce su arquitectura (`OpenAIPrivacyFilterForTokenClassification`) con una configuración reducida a 2 capas ocultas y pesos aleatorios generados con semilla 17. Su propósito es servir como banco de pruebas reproducible para validar contratos de integración con frameworks (en concreto, expectativas de Transformers), no para inferencia real.

El repositorio contiene pesos en `safetensors` (bfloat16), los ficheros de procesador copiados byte a byte desde el modelo original (`model.sig`, `tokenizer.json`, `tokenizer_config.json`, `viterbi_calibration.json`), un manifiesto de contrato (`integration.json`), documentación de uso (`integrations/transformers/usage.md`), expectativas de framework y procedencia de la fixture (`build.json`). Con 13.031.217 parámetros y un tamaño de repositorio de 0,1 GB, es un fixture ligero pensado para CI y pruebas de conformidad.

La relevancia de esta ficha es acotada: no debe confundirse con el modelo `openai/privacy-filter` real. La etiqueta `test-artifact` existe precisamente para excluirlo de búsquedas de modelos candidatos. Cualquier evaluación de capacidades de detección de PII debe realizarse sobre el checkpoint original, no sobre esta fixture.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `OpenAIPrivacyFilterForTokenClassification` (transformer encoder para clasificación de tokens), reducida a `num_hidden_layers: 2` |
| Parámetros totales | 13.031.217 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La fixture replica la arquitectura del modelo base `openai/privacy-filter` para clasificación de tokens, pero con una configuración reducida mediante la regla genérica de `sweep.py` del repositorio `huggingface/transformers-mic`, que fija `num_hidden_layers` a 2. Los pesos son aleatorios (semilla 17) y no han sido entrenados: superaron una puerta de sensibilidad a la entrada según la cual cada perturbación de las entradas del contrato desplaza los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, con 0,389). Los ficheros del procesador se copiaron byte a byte desde `openai/privacy-filter`, de modo que el pipeline de tokenización y calibración Viterbi es idéntico al del modelo original.

Los tensores conservan los mismos nombres que el checkpoint real, lo que permite validar la carga, el mapeo de pesos y las expectativas de framework sin necesidad de descargar el modelo completo. La fixture es finita en float32, bfloat16 y float16 (forward, pérdida y gradientes). No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO), porque no hubo entrenamiento.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen predicciones de PII significativas.
- Sirve para validar la carga del checkpoint en Transformers y comprobar que los nombres de tensores coinciden con `openai/privacy-filter`.
- Permite verificar el contrato de clasificación de tokens (`Privacy Filter token classification`) definido en `integration.json`.
- Comprueba la integración de los ficheros de procesador (`tokenizer.json`, `tokenizer_config.json`, `model.sig`, `viterbi_calibration.json`) copiados del modelo original.
- Valida la estabilidad numérica en float32, bfloat16 y float16 (forward, loss, gradientes).
- No dispone de tool calling, agentes, capacidades multilingües verificadas ni modos especiales (thinking, visión, audio).

## Casos de uso

- Pruebas de conformidad en CI: ejecutar el contrato de `integration.json` contra la fixture para detectar regresiones en la integración de Transformers sin coste de descarga del modelo real.
- Validación de mapeo de pesos: comprobar que el cargador de Transformers resuelve correctamente los nombres de tensores del checkpoint `openai/privacy-filter` usando una versión reducida.
- Verificación de pipeline de tokenización: al conservar los ficheros de procesador byte a byte, permite probar la tokenización y la calibración Viterbi del modelo original en entornos de test.
- Test de estabilidad numérica: ejecutar forward, pérdida y gradientes en float32, bfloat16 y float16 para detectar problemas de precisión en el framework antes de usar el modelo real.
- Desarrollo de harness de evaluación: construir y depurar utilidades de evaluación de clasificación de tokens con un artefacto ligero (0,1 GB) antes de apuntarlas al checkpoint completo.
- Reproducibilidad de builds: regenerar la fixture con `example/build_fixtures.py --fixture privacy-filter-mic` y comparar hashes registrados en `build.json` para auditar cambios en el pipeline de shrink.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (precisión, recall, F1 en detección de PII) carece de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (13,0 M de parámetros), holgadamente por debajo de cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (según `integrations/transformers/usage.md`); otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para esta fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas y 13 M de parámetros, la latencia sería mínima, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/privacy-filter-mic` | 13,0 M (2 capas, pesos aleatorios) | no disponible | Fixture de test para integración | no disponible | Hugging Face |
| `openai/privacy-filter` | no disponible en la información proporcionada | no disponible | Detección de PII (clasificación de tokens) | no disponible | Hugging Face |
| Otros modelos de detección de PII | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación significativa es con su modelo base `openai/privacy-filter`: misma arquitectura y mismos ficheros de procesador, pero con 2 capas en lugar de la configuración completa y pesos aleatorios. No se dispone de datos para comparar con alternativas de la misma categoría (detección de PII).

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas no tienen valor semántico para detección de PII.
- Etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- La licencia no está disponible, lo que impide confirmar condiciones de uso comercial.
- Los idiomas soportados no están documentados.
- La longitud de contexto no está documentada.
- No se han publicado benchmarks ni métricas de calidad; cualquier evaluación de rendimiento debe hacerse sobre `openai/privacy-filter`.
- Riesgo de confusión con el modelo base: verificar siempre el ID del repositorio antes de integrar.
- La fixture solo cubre checkpoints cuyos ficheros de procesador son byte-idénticos y cuya configuración coincide tras el shrink (clave de fixture `6e7bf1f74741`); cambios en el modelo base pueden invalidarla.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/privacy-filter-mic
- Modelo base: https://huggingface.co/openai/privacy-filter
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/privacy-filter-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/privacy-filter-mic/blob/main/integrations/transformers/usage.md
- Procedencia de la fixture: https://huggingface.co/huggingface-mic/privacy-filter-mic/blob/main/build.json
- Explicación del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/privacy-filter-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
