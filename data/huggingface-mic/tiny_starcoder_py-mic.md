# huggingface-mic/tiny_starcoder_py-mic

## Resumen

`huggingface-mic/tiny_starcoder_py-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` dentro del proyecto transformers-mic. No es un modelo entrenado ni utilizable para generacion de codigo: es una version "slim" (reducida) del checkpoint `bigcode/tiny_starcoder_py`, con la misma arquitectura GPTBigCode pero con una configuracion mucho mas pequena, hasta 3.724.608 parametros, y pesos generados aleatoriamente con semilla 17.

El objetivo del repositorio es servir como fixture de integracion: empaqueta pesos reducidos, ejemplos de uso ejecutables y un directorio de "expectativas de framework" para validar que las integraciones con Transformers se comportan de forma consistente. La model card lo etiqueta explicitamente como `test-artifact`, precisamente para excluirlo de busquedas de modelos candidatos.

Por tanto, su relevancia no es funcional (no genera texto ni codigo de calidad) sino de ingenieria: permite a desarrolladores que trabajan en tooling de Hugging Face o en integraciones de Transformers reproducir pruebas de contrato sin descargar checkpoints grandes. Cualquier uso como modelo real de generacion de codigo seria un error de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPTBigCode (GPTBigCodeForCausalLM), transformer causal decoder-only |
| Parametros totales | 3.724.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la config se ha reducido; no se especifica el valor exacto) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; se declara compatibilidad de calculo finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (el modelo base esta orientado a Python, pero la ficha no lo declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es GPTBigCode en su variante `GPTBigCodeForCausalLM`, un transformer decoder-only con atencion multi-query (MQA), la misma familia que el checkpoint original `bigcode/tiny_starcoder_py`. La configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio transformers-mic, de modo que mantiene los nombres de tensor del checkpoint real pero con dimensiones mucho menores.

No ha habido entrenamiento. Los pesos son aleatorios (semilla 17) y solo se validaron mediante un "input-sensitivity gate": cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, mueve 0,5). Los ficheros de procesador (`generation_config.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `bigcode/tiny_starcoder_py`. El fixture se identifica con la clave `0852b1b7488d` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el shrink.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios, por lo que no genera texto ni codigo coherente.
- Sirve como fixture de contrato para validar integraciones de Transformers con GPTBigCode.
- Permite comprobar la forma, nombres de tensores y compatibilidad de procesador frente al checkpoint real.
- Calculo finito verificado en float32, bfloat16 y float16 (forward, loss y gradientes).
- No soporta tool calling, agentes, vision, audio ni modo thinking.
- No se declaran capacidades multilingues.

## Casos de uso

- Pruebas de integracion de Transformers: cargar el fixture y verificar que la clase `GPTBigCodeForCausalLM` instancia correctamente sin descargar el checkpoint completo.
- Validacion de contratos de API: usar `integration.json` y el directorio `integrations/transformers/expectations` para comprobar que una version de la libreria mantiene el comportamiento esperado.
- CI/CD de tooling: ejecutar tests de regresion ligeros (3,7 M de parametros) en pipelines sin GPU dedicada.
- Desarrollo de utilidades de tokenizacion: los ficheros de procesador son identicos byte a byte a los de `bigcode/tiny_starcoder_py`, utiles para probar pipelines de tokenizacion sin ambiguedad.
- Verificacion de dtypes: comprobar que forward, loss y gradientes son finitos en float32, bfloat16 y float16.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture tiny_starcoder_py-mic` y comparar hashes registrados en `build.json`.
- Docencia o demos de arquitectura: inspeccionar la estructura de GPTBigCode con un modelo minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,7 M de parametros), por lo que cabe en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es mas que suficiente.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (via `integrations/transformers/usage.md`); no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/tiny_starcoder_py-mic | 3.724.608 | no disponible | Fixture de test | no disponible | Hugging Face |
| bigcode/tiny_starcoder_py | no disponible en la informacion | no disponible | Modelo real de generacion de codigo en Python | no disponible en la informacion | Hugging Face |
| Otros modelos de codigo de ~1B | no disponible | no disponible | Generacion de codigo | no disponible | no disponible |

La unica comparacion significativa es con su modelo base: el fixture replica la arquitectura y el procesador de `bigcode/tiny_starcoder_py`, pero sustituye los pesos entrenados por pesos aleatorios y reduce la configuracion.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no producen salidas coherentes.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; usarlo en produccion seria un error.
- Licencia no declarada: no se puede asumir uso comercial sin consultar el repositorio del modelo base.
- No se declaran idiomas soportados ni contexto maximo exacto.
- No se documentan sesgos porque no hay entrenamiento; cualquier analisis de sesgo es inaplicable.
- Riesgo de confusion al integrarlo en pipelines que automaticamente seleccionan modelos por tamano o por nombre.
- El repositorio ocupa 0,0 GB y depende de ficheros externos (`integration.json`, `build.json`, `integrations/`) que deben revisarse antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/tiny_starcoder_py-mic
- Modelo base: https://huggingface.co/bigcode/tiny_starcoder_py
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Script de shrink: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Explicacion del shrink del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/tiny_starcoder_py-mic.html
