# huggingface-mic-temp/smolvlm-vllm-mic

## Resumen

`smolvlm-vllm-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic-temp`, no un modelo utilizable en produccion. Se trata de una version reducida del modelo multimodal `HuggingFaceTB/SmolVLM2-2.2B-Instruct`, con solo 6.578.368 parametros totales frente a los aproximadamente 2.200 millones del modelo original. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

El proposito del repositorio es proporcionar un contrato ejecutable y ligero que reproduzca la arquitectura `SmolVLMForConditionalGeneration` con los mismos nombres de tensores y los mismos ficheros de procesador que el checkpoint real. De este modo, frameworks como Transformers o vLLM pueden validar sus expectativas de integracion (procesado de imagenes, tokenizacion, plantilla de chat, generacion) sin necesidad de descargar ni ejecutar los pesos completos del modelo de 2.2B.

Su relevancia es, por tanto, exclusivamente de ingenieria y pruebas: sirve como fixture de integracion continua. Los pesos son aleatorios (semilla 17) y no han sido entrenados, por lo que el modelo no genera respuestas coherentes. No dispone de licencia declarada, no tiene descargas ni likes, y su tamano de repositorio es practicamente nulo (0.0 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLMForConditionalGeneration (transformer multimodal vision-lenguaje, version reducida) |
| Parametros totales | 6.578.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; finito tambien en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | HuggingFaceTB/SmolVLM2-2.2B-Instruct |
| Tipo de artefacto | test-artifact (fixture de integracion) |
| Clave de fixture | 7fbe1f1b1d2e |
| Semilla de pesos | 17 (pesos aleatorios) |

## Arquitectura y entrenamiento

La arquitectura es una instancia reducida de `SmolVLMForConditionalGeneration`, el modelo multimodal de SmolVLM2 que combina un codificador visual con un decodificador de lenguaje. La reduccion se aplica mediante la regla generica de `sweep.py` del repositorio `transformers-mic`: el codificador visual queda con 2 capas ocultas (`vision num_hidden_layers 2`) y el modelo de lenguaje con 2 capas ocultas (`text num_hidden_layers 2`). Los nombres de los tensores coinciden exactamente con los del checkpoint real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0.001 (el caso mas debil, `attention_mask:all_ones`, dio 0.00275). Los ficheros de procesador (`added_tokens.json`, `chat_template.json`, `generation_config.json`, `merges.txt`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `HuggingFaceTB/SmolVLM2-2.2B-Instruct`. El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- Ejecucion del pipeline de inferencia multimodal (imagen + texto) con la misma interfaz que SmolVLM2.
- Validacion de contratos de integracion en Transformers y vLLM (procesador, tokenizador, plantilla de chat, configuracion de generacion).
- Comprobacion de nombres y formas de tensores contra el checkpoint real de 2.2B.
- Pruebas de forward, loss y gradientes en float32, bfloat16 y float16.
- No genera texto coherente: los pesos son aleatorios y no han sido entrenados.
- No dispone de tool calling, capacidades de agente, modo thinking ni multilingues reales.

## Casos de uso

- Pruebas de integracion continua en Transformers: ejecutar el pipeline multimodal completo con un fixture de 6.6M parametros para detectar regresiones en el procesador o en la plantilla de chat sin descargar los 2.2B.
- Validacion de compatibilidad con vLLM: comprobar que el motor de inferencia acepta la configuracion y los tensores del modelo SmolVLM2 antes de desplegar el checkpoint real.
- Verificacion de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para afirmar que las salidas de logits responden a perturbaciones de entrada (puerta de sensibilidad).
- Pruebas de serializacion y carga: validar que los ficheros safetensors, la configuracion y los ficheros de procesador se cargan correctamente en float32, bfloat16 y float16.
- Desarrollo de herramientas de reduccion de modelos: servir como ejemplo reproducible del proceso de `sweep.py` y `build_fixtures.py` para generar fixtures de otros checkpoints.
- Tests de regresion en pipelines de CI/CD: ejecutar el fixture en cada PR para asegurar que los cambios en el codigo de integracion no rompen la compatibilidad con SmolVLM2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no procede evaluar calidad de generacion, razonamiento ni tareas multimodales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (6.578.368 parametros x 4 bytes ≈ 26 MB de pesos, mas overhead de activaciones y procesador).
- GPU recomendadas: cualquier GPU consumer o integrada; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650) e incluso en CPU.
- Opciones de despliegue: Transformers (referencia principal), vLLM (objetivo del fixture), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta.
- Latencia y throughput: no disponibles; al ser un modelo diminuto con pesos aleatorios, las cifras no serian representativas del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| smolvlm-vllm-mic | 6.578.368 | no disponible | no disponible | Fixture de integracion (test-artifact) |
| HuggingFaceTB/SmolVLM2-2.2B-Instruct | ~2.2B | no disponible en la informacion | no disponible en la informacion | Modelo multimodal real para inferencia |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | no disponible | Pruebas de integracion de otros checkpoints |

La comparativa con modelos de produccion no es significativa: el fixture no compite en calidad ni rendimiento, solo replica la interfaz del modelo base para pruebas.

## Limitaciones y advertencias

- Los pesos son aleatorios (semilla 17): el modelo no produce salidas coherentes ni respuestas utiles.
- Etiquetado explicitamente como `test-artifact`; no debe usarse en produccion ni como modelo candidato.
- Licencia no declarada: no hay autorizacion explicita para uso comercial.
- Idiomas no declarados.
- Longitud de contexto no disponible.
- El repositorio no incluye todos los ficheros del modelo base; algunos deben regenerarse con `python example/build_fixtures.py --fixture smolvlm-vllm-mic`.
- Riesgo de confusion: el nombre sugiere un modelo SmolVLM2 funcional, pero es solo una fixture de 6.6M parametros.
- No apto para evaluacion de calidad, sesgos o alucinacion, ya que no ha sido entrenado.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic-temp/smolvlm-vllm-mic
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/smolvlm-vllm-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato: https://huggingface.co/huggingface-mic-temp/smolvlm-vllm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic-temp/smolvlm-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic-temp/smolvlm-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic-temp/smolvlm-vllm-mic/blob/main/build.json
