# huggingface-mic-temp/tiny_starcoder_py-vllm-mic

## Resumen

`tiny_starcoder_py-vllm-mic` es un artefacto de prueba (fixture) publicado por la cuenta `huggingface-mic-temp`, no un modelo entrenado ni utilizable en produccion. Se trata de una version reducida de `bigcode/tiny_starcoder_py` que conserva la arquitectura `GPTBigCodeForCausalLM` y los ficheros de procesador del modelo original, pero con un configuracion mucho mas pequena: 3.728.768 parametros totales frente a los aproximadamente 164 millones del modelo base. Su proposito es servir como fixture de integracion para validar contratos de frameworks (en este caso, compatibilidad con vLLM) sin necesidad de descargar ni ejecutar el checkpoint completo.

El repositorio incluye pesos "slim" en `safetensors`, un manifiesto de contrato (`integration.json`), documentacion de uso con Transformers y un directorio de expectativas de framework. Los pesos son aleatorios (semilla 17) y pasaron una puerta de sensibilidad a las entradas: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (la mas debil, `attention_mask:all_ones`, 0,549). Esto garantiza que el fixture responde a cambios en las entradas, pero no que produzca salidas con sentido.

La relevancia de este artefacto es exclusivamente de ingenieria: permite a los mantenedores de frameworks y a los equipos de CI/CD verificar que las rutas de carga, tokenizacion, forward pass y serializacion funcionan con la arquitectura GPTBigCode y con los ficheros de procesador reales, sin coste de computo ni de almacenamiento. No debe confundirse con un modelo de codigo funcional ni emplearse en tareas de generacion reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPTBigCode (GPTBigCodeForCausalLM), transformer causal decoder-only |
| Parametros totales | 3.728.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `GPTBigCodeForCausalLM`, un transformer causal decoder-only con atención multi-cabeza y sesgo en las proyecciones, tal como se define en la familia GPTBigCode. La configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, manteniendo los mismos nombres de tensores que el checkpoint real y los mismos ficheros de procesador copiados byte a byte desde `bigcode/tiny_starcoder_py`: `generation_config.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json` y `vocab.json`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se generaron para superar la puerta de sensibilidad a las entradas del contrato. El fixture es finito en float32, bfloat16 y float16 (forward, perdida y gradientes), y se guarda en float32, el dtype por defecto con el que carga `bigcode/tiny_starcoder_py`. La clave de fixture es `060822cf2757` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el shrink.

## Capacidades

- Generacion de texto: tecnicamente el modelo puede ejecutar un forward pass y producir logits, pero al tener pesos aleatorios no genera texto coherente ni codigo funcional.
- Razonamiento, matematicas y codigo: no disponible como capacidad real; el fixture no ha sido entrenado para ninguna tarea.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible; los ficheros de tokenizador provienen del modelo base, pero no hay garantia de comportamiento linguistico.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Validacion de contratos de framework: es su unica funcion real; sirve para verificar rutas de carga, tokenizacion y forward pass en vLLM y Transformers.

## Casos de uso

- Pruebas de integracion en CI/CD para vLLM: el fixture permite verificar que la ruta de carga de modelos GPTBigCode en vLLM funciona sin descargar el checkpoint completo, reduciendo el tiempo y el coste de las pruebas de regresion.
- Validacion de contratos de Transformers: el directorio `integrations/transformers/expectations` permite comprobar que las salidas esperadas (logits, formas, dtypes) coinciden con lo que el framework declara, detectando regresiones en la API.
- Pruebas de serializacion y carga de safetensors: al conservar los mismos nombres de tensores que el checkpoint real, sirve para validar pipelines de conversion, sharding y carga en float32, bfloat16 y float16.
- Verificacion de tokenizadores: los ficheros de procesador copiados byte a byte permiten probar la tokenizacion y decodificacion sin depender del modelo completo.
- Pruebas de sensibilidad a entradas: el registro de la puerta de sensibilidad (perturbaciones que mueven los logits al menos 0,001) permite validar que un cambio en las entradas del contrato produce un cambio medible en la salida.
- Desarrollo de herramientas de "shrink" de modelos: el repositorio documenta como se genero el fixture, lo que sirve como referencia para construir fixtures similares de otros checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no tiene sentido evaluar MMLU, HumanEval, GSM8K ni metricas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,7 M de parametros, aproximadamente 15 MB de pesos); en la practica cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en consumer GPU: si, en cualquier GPU con al menos 1 GB de VRAM.
- Opciones de despliegue: vLLM (objetivo del fixture), Transformers, llama.cpp y Ollama no estan confirmados para este fixture; el contrato solo documenta compatibilidad con vLLM y Transformers.
- Latencia y throughput: no disponible; al ser un fixture de validacion no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| `huggingface-mic-temp/tiny_starcoder_py-vllm-mic` | 3,7 M | no disponible | Fixture de integracion (pesos aleatorios) | no disponible |
| `bigcode/tiny_starcoder_py` | ~164 M | no disponible | Modelo de codigo entrenado (StarCoder Python tiny) | no disponible en la informacion proporcionada |
| `bigcode/starcoder` | ~15,5 B | no disponible | Modelo de codigo a gran escala | no disponible en la informacion proporcionada |

La comparativa es limitada: el fixture no es funcionalmente equivalente a ningun modelo de codigo, ya que no ha sido entrenado. Su unico punto de comparacion relevante es el checkpoint base del que deriva, del que conserva arquitectura y procesador pero no los pesos ni las capacidades.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no producen texto ni codigo coherente.
- Etiquetado como `test-artifact`: el autor lo excluye explicitamente de la busqueda de modelos candidatos; no debe emplearse en produccion ni en evaluaciones de calidad.
- Sesgos conocidos: no disponible; al no haber entrenamiento no se han evaluado sesgos.
- Riesgo de alucinacion: total, en el sentido de que las salidas son ruido sin relacion con la entrada mas alla de la sensibilidad minima verificada.
- Limitaciones de contexto o idioma: no disponible; no se documenta longitud de contexto ni cobertura linguistica.
- Restricciones de licencia para uso comercial: la licencia no esta disponible en la informacion proporcionada; al derivar de `bigcode/tiny_starcoder_py` habria que consultar la licencia del modelo base antes de cualquier uso.
- Caveat para produccion: no desplegar bajo ninguna circunstancia; su unico uso legitimo es la validacion de contratos de framework en entornos de prueba.
- El repositorio tiene 0 descargas y 0 likes, lo que confirma su naturaleza de artefacto interno de pruebas.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic-temp/tiny_starcoder_py-vllm-mic
- Modelo base: https://huggingface.co/bigcode/tiny_starcoder_py
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Documentacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/tiny_starcoder_py-vllm-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de shrink: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
