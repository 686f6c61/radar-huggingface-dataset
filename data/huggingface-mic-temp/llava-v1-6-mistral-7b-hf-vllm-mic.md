# huggingface-mic-temp/llava-v1.6-mistral-7b-hf-vllm-mic

## Resumen

`llava-v1.6-mistral-7b-hf-vllm-mic` es un artefacto de prueba (fixture) publicado por la cuenta `huggingface-mic-temp`, no un modelo utilizable. Se trata de una version reducida del modelo vision-lenguaje LLaVA-Next v1.6 Mistral-7B (`llava-hf/llava-v1.6-mistral-7b-hf`), generada para validar la integracion del framework MIC (Model Integration Contract) con la arquitectura `LlavaNextForConditionalGeneration` en entornos compatibles con vLLM. El repositorio incluye pesos "slim", ejemplos de uso y expectativas de framework en un unico paquete.

El fixture conserva la misma arquitectura y los mismos nombres de tensores que el checkpoint real, pero reduce el numero de capas tanto en el codificador visual como en el decoder de texto (2 capas cada uno), resultando en 4.328.448 parametros totales frente a los aproximadamente 7.000 millones del modelo original. Los pesos son aleatorios (semilla 17) y no han sido entrenados: pasaron unicamente una puerta de sensibilidad a la entrada, que verifica que perturbaciones en las entradas mueven los logits al menos 0,001.

Su relevancia es exclusivamente de ingenieria: sirve para probar pipelines de carga, tokenizacion, preprocesado de imagenes e inferencia con vLLM sin necesidad de descargar ni ejecutar el modelo completo. Esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos. No debe confundirse con un modelo funcional ni usarse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlavaNextForConditionalGeneration (vision encoder + decoder de texto tipo transformer) |
| Parametros totales | 4.328.448 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LLaVA-Next, que combina un codificador visual con un decoder de lenguaje. En este fixture, el codificador visual se ha reducido a 2 capas (`vision num_hidden_layers 2`) y el decoder de texto tambien a 2 capas (`text num_hidden_layers 2`), aplicando la regla generica de reduccion del script `sweep.py` del repositorio `transformers-mic`. Los ficheros de procesador (`added_tokens.json`, `chat_template.json`, `generation_config.json`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`) se copiaron byte a byte desde `llava-hf/llava-v1.6-mistral-7b-hf`.

No hubo entrenamiento: los pesos son aleatorios con semilla 17. Se valido que el fixture es finito en float32, bfloat16 y float16 (forward, loss y gradientes) y que responde a perturbaciones de entrada (la mas debil, `pixel_values:halve`, movio los logits 0,0491). La clave de fixture `8a5fee7fc6c7` agrupa todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya configuracion coincide tras la reduccion. No se dispone de informacion sobre datos de entrenamiento, RLHF/DPO ni innovaciones de decodificacion del modelo original en la informacion proporcionada.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas coherentes.
- Sirve como fixture de integracion para validar la carga de la arquitectura `LlavaNextForConditionalGeneration`.
- Permite probar el pipeline de preprocesado de imagenes y tokenizacion con los ficheros de procesador reales.
- Compatible con el contrato de integracion MIC y con expectativas de framework documentadas en `integrations/transformers/`.
- Util para tests de sensibilidad a entradas (perturbaciones de `pixel_values` y entradas de texto).
- No soporta tool calling, agentes, razonamiento multilingue ni ninguna capacidad funcional real.

## Casos de uso

- Pruebas de integracion continua: usar el fixture para verificar que el codigo de carga de modelos LLaVA-Next funciona sin descargar los 7.000 millones de parametros del checkpoint real, reduciendo tiempo y ancho de banda en CI.
- Validacion de contratos MIC: comprobar que una nueva version del framework respeta las expectativas definidas en `integrations/transformers/expectations` antes de desplegar.
- Tests de compatibilidad con vLLM: verificar que el pipeline de inferencia acepta la arquitectura y los ficheros de procesador del modelo real sin ejecutar inferencia significativa.
- Desarrollo de herramientas de preprocesado: probar cambios en el tratamiento de imagenes o tokenizacion usando los mismos ficheros de procesador que el modelo original.
- Regresion de sensibilidad: ejecutar la puerta de sensibilidad a entradas para detectar roturas en el flujo forward/loss/gradients en distintas precisiones (float32, bfloat16, float16).
- Documentacion y demos de integracion: ilustrar como se estructura un repositorio que combina pesos reducidos, uso ejecutable y expectativas de framework en un solo paquete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float16 (4,3 M de parametros), aunque el consumo real dependera del framework y de las activaciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: vLLM (objetivo declarado del fixture), Transformers y frameworks compatibles con el contrato MIC. No se documentan opciones como llama.cpp u Ollama.
- Latencia y throughput: no disponibles; al ser pesos aleatorios y un modelo de 2 capas, las cifras no serian representativas del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| llava-v1.6-mistral-7b-hf-vllm-mic (este) | 4,3 M | no disponible | no disponible | Fixture de test |
| llava-hf/llava-v1.6-mistral-7b-hf | ~7.000 M | no disponible | no disponible | Modelo vision-lenguaje funcional |
| Otros fixtures MIC | variable | no disponible | no disponible | Tests de integracion |

La comparativa con alternativas funcionales de la misma categoria (modelos vision-lenguaje de ~7B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas carecen de sentido.
- Etiquetado explicitamente como `test-artifact`; no debe usarse en produccion ni en evaluaciones de calidad.
- La licencia no esta disponible, lo que impide determinar condiciones de uso comercial.
- No se documentan idiomas soportados ni longitud de contexto.
- El modelo base real (`llava-hf/llava-v1.6-mistral-7b-hf`) tiene sus propias limitaciones (sesgos, alucinacion, restricciones de licencia) que este fixture no reproduce ni mitiga.
- Cualquier metrica de rendimiento obtenida con este fixture no es extrapolable al modelo completo.
- La fecha de creacion indicada (2026-11-26) y el autor (`huggingface-mic-temp`) sugieren un entorno temporal de pruebas, no un artefacto estable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/llava-v1.6-mistral-7b-hf-vllm-mic
- Modelo base: https://huggingface.co/llava-hf/llava-v1.6-mistral-7b-hf
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/llava-v1.6-mistral-7b-hf-vllm-mic.html
- Script de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
