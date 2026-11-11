# huggingface-mic/MiniCPM3-4B-mic

## Resumen

MiniCPM3-4B-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic a partir del modelo openbmb/MiniCPM3-4B. No es un modelo entrenado ni utilizable para inferencia real: se trata de una version "adelgazada" del checkpoint original, con solo 4,8 millones de parametros y pesos aleatorios (semilla 17), disenada para validar contratos de integracion con frameworks. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

El repositorio conserva la misma arquitectura (`MiniCPM3ForCausalLM`) y los mismos nombres de tensores que el checkpoint real, pero reduce el numero de capas ocultas a 2 mediante la regla generica de `sweep.py`. Los ficheros del procesador (tokenizer, configuracion, modeling) se copian byte a byte desde openbmb/MiniCPM3-4B, de modo que el fixture reproduce fielmente el pipeline de carga y tokenizacion del modelo original.

Su relevancia es puramente tecnica: sirve como banco de pruebas ligero para verificar que las integraciones (Transformers y otras) cargan, ejecutan y producen logits finitos en float32, bfloat16 y float16, sin necesidad de descargar ni ejecutar el modelo completo de 4B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniCPM3ForCausalLM (transformer causal, config reducida) |
| Parametros totales | 4.770.688 (4,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del transformer causal de MiniCPM3 (`MiniCPM3ForCausalLM`) con una configuracion reducida: `num_hidden_layers` igual a 2, aplicando la regla generica de reduccion de `sweep.py`. Los ficheros de procesamiento (`added_tokens.json`, `configuration_minicpm.py`, `generation_config.json`, `modeling_minicpm.py`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`) se copian byte a byte desde openbmb/MiniCPM3-4B, por lo que la interfaz de tokenizacion y carga es identica a la del modelo original.

No ha habido entrenamiento. Los pesos son aleatorios (semilla 17) y solo se validaron mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, registro 1,58). Los tensores conservan los mismos nombres que el checkpoint real y el modelo se guardo en bfloat16, el dtype con el que carga openbmb/MiniCPM3-4B por defecto. Se verifico que la forward, la loss y los gradientes son finitos en float32, bfloat16 y float16. La clave del fixture es `097e769bf0ba`.

## Capacidades

- No es un modelo funcional: no genera texto ni razona, sus pesos son aleatorios.
- Sirve para validar la carga del modelo y del tokenizer con la misma interfaz que MiniCPM3-4B.
- Permite comprobar contratos de integracion con frameworks (directorio `integrations/transformers/expectations`).
- Verifica sensibilidad a las entradas del contrato (perturbaciones de logits superiores a 0,001).
- Comprueba estabilidad numerica en float32, bfloat16 y float16 (forward, loss, gradientes).
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues reales.
- No dispone de modo thinking ni de ninguna capacidad generativa aprovechable.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForCausalLM` y verificar que el pipeline de carga funciona con la misma configuracion que MiniCPM3-4B, sin descargar el modelo completo.
- CI/CD de librerias de inferencia: ejecutar tests de humo en cada commit comprobando que la forward produce logits finitos en los tres dtypes soportados.
- Validacion de contratos de tokenizer: usar los ficheros copiados byte a byte para verificar que la tokenizacion coincide exactamente con la del modelo original.
- Desarrollo de herramientas de reduccion de modelos: servir como ejemplo reproducible de la regla de `sweep.py` y del proceso de construccion de fixtures.
- Pruebas de compatibilidad de kernels y backends: comprobar que un backend nuevo (por ejemplo, un kernel de atencion alternativo) acepta los mismos nombres de tensores y la misma configuracion.
- Regresion de serializacion: validar que el guardado y recarga en bfloat16 preserva los nombres de tensores y la estabilidad numerica.
- Documentacion y demos de integracion: ejemplos ejecutables ligeros que no requieren GPU ni descargas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en bfloat16 (4,8 M de parametros), ejecutable en CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU consumer (incluso integradas) es suficiente.
- Cabe en cualquier GPU consumer y en CPU sin problemas.
- Opciones de despliegue: Transformers (con `trust_remote_code=True` por el codigo personalizado `modeling_minicpm.py`); vLLM, llama.cpp u Ollama no estan indicados en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la inferencia es practicamente instantanea, pero sin valor representativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/MiniCPM3-4B-mic | 4,8 M (fixture) | no disponible | Pruebas de integracion | no disponible | Hugging Face |
| openbmb/MiniCPM3-4B | 4B (aprox.) | no disponible en la informacion | Modelo generativo real | no disponible | Hugging Face |
| Otros fixtures de la serie MIC | no disponible | no disponible | Pruebas de integracion | no disponible | Hugging Face |

La comparacion directa con modelos de la misma categoria no aplica: el fixture no compite en calidad ni rendimiento con modelos generativos, sino que replica la interfaz de MiniCPM3-4B para validar integraciones.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no produce salidas coherentes ni utiles.
- No debe usarse en produccion ni como sustituto de openbmb/MiniCPM3-4B.
- La licencia no esta declarada en la informacion disponible; verificar antes de cualquier redistribucion.
- Requiere `trust_remote_code=True` por incluir codigo de modelado personalizado (`modeling_minicpm.py`), lo que implica ejecutar codigo del repositorio.
- La configuracion reducida (2 capas) no refleja el comportamiento numerico del modelo completo de 4B.
- No hay datos de sesgos, alucinacion ni cobertura idiomatica porque no es un modelo entrenado.
- El repositorio tiene un tamano de 0,0 GB segun la metadata, coherente con un artefacto minimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/MiniCPM3-4B-mic
- Modelo base: https://huggingface.co/openbmb/MiniCPM3-4B
- Manifiesto del contrato: integration.json (en el repositorio)
- Uso con Transformers: integrations/transformers/usage.md (en el repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (en el repositorio)
- Procedencia del fixture: build.json (en el repositorio)
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/MiniCPM3-4B-mic.html
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
