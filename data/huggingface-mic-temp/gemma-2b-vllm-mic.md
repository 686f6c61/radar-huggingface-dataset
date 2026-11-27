# huggingface-mic-temp/gemma-2b-vllm-mic

## Resumen

`gemma-2b-vllm-mic` es un artefacto de prueba (fixture) publicado por la cuenta `huggingface-mic-temp` en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de una version "adelgazada" (slim) del checkpoint `google/gemma-2b`, reducida mediante la regla generica de `sweep.py` del proyecto `transformers-mic` a solo 2 capas ocultas y 16.458.048 parametros totales. Su proposito es servir como contrato ejecutable para validar expectativas de frameworks (en este caso, vLLM y Transformers) sobre la arquitectura Gemma.

El repositorio incluye los pesos reducidos, un manifiesto de contrato (`integration.json`), documentacion de uso con Transformers (`integrations/transformers/usage.md`), expectativas del framework y procedencia del fixture (`build.json`). Los pesos son aleatorios (semilla 17) y pasaron unicamente una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (la mas debil, `attention_mask:all_ones`, 0,0664), por lo que no requirio entrenamiento.

Es relevante ahora como pieza de infraestructura de testing: permite a los mantenedores de frameworks comprobar que la carga, el forward pass, la perdida y los gradientes funcionan con la misma arquitectura, los mismos nombres de tensor y los mismos ficheros de procesador que el checkpoint real, pero con un coste de almacenamiento de 0,1 GB y sin necesidad de descargar el modelo completo. Esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GemmaForCausalLM (transformer decoder-only, version reducida a 2 capas ocultas) |
| Parametros totales | 16.458.048 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los ficheros de procesador se copian de `google/gemma-2b`, pero el fixture no declara ventana propia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (guardado en bfloat16) |
| Modelo base | google/gemma-2b |
| Tamano del repositorio | 0,1 GB |
| Tipo de artefacto | fixture de prueba (`test-artifact`) |
| Dtype de guardado | bfloat16 |
| Semilla de pesos | 17 (pesos aleatorios) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `GemmaForCausalLM` del checkpoint original, pero con una configuracion reducida: `num_hidden_layers` igual a 2, aplicando la regla generica de reduccion definida en `sweep.py` del repositorio `transformers-mic`. Conserva los mismos nombres de tensor que el checkpoint real, de modo que cualquier codigo que espere la estructura de `google/gemma-2b` puede cargarlo sin cambios en el esquema. Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`) se copian byte a byte desde `google/gemma-2b`.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron unicamente mediante una puerta de sensibilidad a la entrada que comprueba que las perturbaciones de las entradas del contrato alteran los logits por encima de un umbral minimo. El fixture se guarda en bfloat16, el dtype con el que carga por defecto `google/gemma-2b`, y se verifica que es finito en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes. La clave de fixture es `20f5bc233251` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras la reduccion.

## Capacidades

- No es un modelo funcional: no genera texto, codigo ni razonamiento util, ya que sus pesos son aleatorios.
- Sirve como contrato ejecutable para validar la carga y el forward pass de `GemmaForCausalLM` en frameworks como vLLM y Transformers.
- Permite comprobar la compatibilidad de nombres de tensor y ficheros de procesador frente al checkpoint real `google/gemma-2b`.
- Verifica estabilidad numerica basica: resultados finitos en float32, bfloat16 y float16 (forward, perdida y gradientes).
- Incluye expectativas de framework documentadas en `integrations/transformers/expectations`.
- No dispone de soporte de tool calling, agentes, vision, audio ni capacidades multilingues reales.

## Casos de uso

- Pruebas de integracion en vLLM: cargar el fixture para verificar que el pipeline de carga de modelos Gemma funciona sin descargar el checkpoint completo de 2B parametros, reduciendo el tiempo de CI.
- Validacion de compatibilidad en Transformers: comprobar que `AutoModelForCausalLM` y el tokenizer asociado resuelven correctamente la arquitectura y los ficheros de procesador copiados de `google/gemma-2b`.
- Tests de regresion de nombres de tensor: asegurar que cambios en el codigo de carga no rompen el mapeo de parametros respecto al checkpoint real.
- Verificacion de estabilidad numerica: ejecutar forward, perdida y gradientes en float32, bfloat16 y float16 para detectar NaNs o infinitos en pipelines de entrenamiento.
- Desarrollo de herramientas de reduccion de modelos: servir como ejemplo reproducible del proceso de `sweep.py` y `build_fixtures.py` para generar otros fixtures de la familia Gemma.
- Documentacion de contratos de framework: usar `integration.json` y `integrations/transformers/usage.md` como referencia para escribir guias de integracion de modelos Gemma en nuevos frameworks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precision razonable, dado que el modelo tiene 16,5 M de parametros (unos 33 MB en bfloat16 o float16, unos 66 MB en float32).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: vLLM (objetivo declarado del fixture) y Transformers; no se documentan otras opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia seria irrelevante y no representativa del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Proposito | Licencia |
|---|---|---|---|---|---|
| gemma-2b-vllm-mic | 16,5 M | 2 | no disponible | Fixture de prueba | no disponible |
| google/gemma-2b | 2,5 B aprox. | 18 | 8.192 tokens (segun el modelo original) | Modelo generativo real | Gemma Terms of Use |
| Otros fixtures de `transformers-mic` | variable | variable | no disponible | Fixtures de prueba | no disponible |

La comparativa con modelos generativos reales no es pertinente: el fixture solo comparte arquitectura y ficheros de procesador con `google/gemma-2b`, pero no sus pesos ni su capacidad.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce salidas coherentes y no debe usarse para inferencia, generacion ni evaluacion de calidad.
- Etiquetado como `test-artifact`: esta pensado para excluirse de busquedas de modelos candidatos y no debe confundirse con un modelo desplegable.
- Licencia no disponible en la informacion proporcionada: no se puede confirmar si el uso comercial esta permitido; hay que remitirse al repositorio original.
- Contexto e idiomas no declarados: los ficheros de procesador provienen de `google/gemma-2b`, pero el fixture no garantiza el comportamiento del tokenizer ni la ventana de contexto del modelo real.
- Solo cubre checkpoints con ficheros de procesador identicos byte a byte y config coincidente tras la reduccion; no es un sustituto general de pruebas con el checkpoint completo.
- No dispone de tool calling, agentes, vision ni audio; cualquier evaluacion de esas capacidades requeriria el modelo base real.
- Riesgo de confusion en pipelines automatizados: si se filtra en un catalogo de modelos, podria intentar desplegarse por error; conviene filtrar por la etiqueta `test-artifact`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/gemma-2b-vllm-mic
- Modelo base: https://huggingface.co/google/gemma-2b
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma-2b-vllm-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de barrido `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
