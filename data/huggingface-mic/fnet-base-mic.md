# huggingface-mic/fnet-base-mic

## Resumen

`fnet-base-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni utilizable para inferencia real, sino de una version reducida y con pesos aleatorios del modelo `google/fnet-base`, disenada para validar contratos de integracion con la libreria Transformers. El repositorio lo etiqueta explicitamente como `test-artifact`, precisamente para excluirlo de busquedas de modelos candidatos.

El modelo conserva la arquitectura `FNetForPreTraining` del original, pero con una configuracion reducida a 2 capas ocultas y 2.159.554 parametros totales (frente a los aproximadamente 82 millones de `google/fnet-base`). Los pesos se generaron con semilla 17 y se guardaron en float32, el dtype por defecto del checkpoint original. Los ficheros de procesador (tokenizador SentencePiece y configuracion) se copiaron byte a byte desde `google/fnet-base`.

Su relevancia es exclusivamente tecnica y de infraestructura: sirve como fixture reproducible para probar integraciones de Transformers (carga, forward, calculo de perdida y gradientes) sin necesidad de descargar el checkpoint completo. Cualquier evaluacion de capacidades, calidad o rendimiento sobre este repositorio carece de sentido, ya que los pesos son aleatorios y el modelo no ha sido entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FNet (`FNetForPreTraining`) |
| Parametros totales | 2.159.554 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es FNet, un transformer que sustituye la atencion por autoatencion de Fourier (Fourier transform) para mezclar tokens, reduciendo el coste computacional respecto a la atencion cuadratica clasica. En este repositorio, sin embargo, la configuracion se ha reducido mediante la regla generica de `sweep.py` a `num_hidden_layers = 2`, manteniendo los nombres de tensores identicos a los del checkpoint real `google/fnet-base`.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (la mas debil, `token_type_ids:all_ones`, con 0,306). Los ficheros de procesador se copiaron byte a byte desde `google/fnet-base`: `special_tokens_map.json`, `spiece.model`, `tokenizer.json` y `tokenizer_config.json`. El fixture esta identificado por la clave `0f5decac063f` y cubre todos los checkpoints cuyos ficheros de procesador son identicos y cuya config coincide tras el proceso de reduccion.

## Capacidades

- No dispone de capacidades funcionales reales: es un artefacto de prueba con pesos aleatorios.
- Ejecuta forward, calculo de perdida y gradientes de forma finita en float32, bfloat16 y float16.
- Reproduce el contrato de entrada/salida de `FNetForPreTraining` (incluida la sensibilidad a `token_type_ids`).
- Mantiene los mismos nombres de tensores que el checkpoint real, lo que permite validar rutas de carga.
- No soporta tool calling, agentes, vision, audio ni razonamiento multilingue.
- No es adecuado para generacion de texto ni para ninguna tarea downstream.

## Casos de uso

- Validacion de integraciones de Transformers: el fixture permite comprobar que una version de la libreria carga correctamente `FNetForPreTraining` sin descargar el checkpoint completo de 82 millones de parametros.
- Pruebas de CI/CD en pipelines de Hugging Face: al pesar 0,0 GB, se puede incluir en suites de test automatizadas para detectar regresiones en la carga de safetensors y en la configuracion del tokenizador.
- Verificacion de compatibilidad de dtypes: sirve para comprobar que forward, perdida y gradientes se mantienen finitos en float32, bfloat16 y float16, algo util al migrar codigo a precision mixta.
- Pruebas de contrato de entradas: valida que perturbaciones en `input_ids`, `attention_mask` y `token_type_ids` producen cambios en los logits, detectando roturas en el cableado de entradas.
- Desarrollo de herramientas de auditoria de model cards: el repositorio incluye `integration.json`, `build.json` y directorios de expectativas que pueden usarse para probar validadores de metadatos.
- Reproducibilidad de fixtures: `build_fixtures.py` y `build.json` permiten regenerar el artefacto y verificar hashes, util en investigacion sobre trazabilidad de artefactos de ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K u otras) seria inaplicable.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (2,16 millones de parametros), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no aplica; cualquier GPU con al menos unos pocos cientos de MB libres es suficiente (GTX 1050, RTX 3060, etc.).
- Cabe en GPU consumer: si, sin restricciones practicas.
- Opciones de despliegue: carga directa con Transformers (`FNetForPreTraining`); no se ha validado su uso con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; al no ser un modelo funcional, las mediciones de rendimiento no son representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/fnet-base-mic` | 2,16 M | no disponible | Fixture de prueba | no disponible | Hugging Face |
| `google/fnet-base` | ~82 M (no confirmado en la informacion) | no disponible | Modelo preentrenado FNet | no disponible | Hugging Face |
| Otros fixtures `huggingface-mic` | variable | no disponible | Artefactos de prueba | no disponible | Hugging Face |

La comparativa con modelos funcionales de la misma categoria (transformers pequenos para NLP) no es significativa, ya que este repositorio no esta pensado para inferencia real. Frente a `google/fnet-base`, la unica diferencia relevante es el tamano reducido y la ausencia de entrenamiento.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce salidas con significado; cualquier uso generativo dara resultados sin sentido.
- Artefacto de prueba: la propia model card lo etiqueta como `test-artifact` y advierte de que no es un modelo utilizable.
- Licencia no especificada: no se indica licencia, por lo que no hay garantia de uso comercial ni de redistribucion.
- Idiomas no declarados: no se puede asumir soporte multilingue, aunque el tokenizador proceda de `google/fnet-base`.
- Contexto no documentado: no se indica longitud maxima de secuencia en la informacion disponible.
- Riesgo de confusion: al compartir nombre y tokenizador con el modelo real, podria confundirse con un checkpoint funcional; conviene verificar siempre la etiqueta `test-artifact`.
- No apto para produccion: no debe desplegarse en sistemas de atencion al cliente, generacion de codigo ni ningun flujo real.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/fnet-base-mic
- Modelo base: https://huggingface.co/google/fnet-base
- Manifest de contrato: https://huggingface.co/huggingface-mic/fnet-base-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/fnet-base-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/fnet-base-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/fnet-base-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/fnet-base-mic.html
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
