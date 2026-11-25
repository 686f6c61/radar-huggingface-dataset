# huggingface-mic/LFM2-8B-A1B-mic

## Resumen

`huggingface-mic/LFM2-8B-A1B-mic` no es un modelo de lenguaje entrenado, sino un artefacto de prueba (fixture) de 4.355.752 parametros construido por el equipo de `huggingface-mic` para verificar la integracion de frameworks con la arquitectura del modelo real `LiquidAI/LFM2-8B-A1B`. Conserva la misma clase de arquitectura (`Lfm2MoeForCausalLM`), los mismos nombres de tensores y los ficheros de procesador copiados byte a byte del checkpoint original, pero con pesos aleatorios (semilla 17) y una configuracion reducida a 4 capas ocultas.

Su proposito es servir como contrato ejecutable: permite validar tokenizador, plantilla de chat, configuracion de generacion y expectativas de salida de Transformers sin descargar ni ejecutar el modelo completo de ~8.000 millones de parametros. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Por tanto, no debe emplearse para generacion de texto, razonamiento ni ninguna tarea cognitiva real: sus pesos son aleatorios y su calidad es nula. Es relevante unicamente para desarrolladores de infraestructura de IA que necesiten pruebas de regresion ligeras y deterministas sobre el pipeline de `Lfm2MoeForCausalLM`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Lfm2MoeForCausalLM` (transformer MoE, configuracion reducida a 4 capas ocultas) |
| Parametros totales | 4.355.752 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito tambien en float32 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero `LICENSE` se copia del modelo base, pero no se especifica su contenido en la informacion disponible) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `Lfm2MoeForCausalLM` del modelo base `LiquidAI/LFM2-8B-A1B`, pero con una configuracion encogida mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, que reduce el numero de capas ocultas a 4. Mantiene exactamente los mismos nombres de tensores que el checkpoint real, de modo que cualquier codigo que cargue el modelo original deberia cargar este sin cambios estructurales.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y superaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0.001 (la mas debil, `attention_mask:all_ones`, con 0.258). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Los ficheros de procesador (`LICENSE`, `chat_template.jinja`, `generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte del checkpoint `LiquidAI/LFM2-8B-A1B`. La clave de fixture es `fac5a8d2dc0e`.

## Capacidades

- Ninguna capacidad generativa real: los pesos son aleatorios y la salida carece de significado.
- Verificacion de carga de la arquitectura `Lfm2MoeForCausalLM` en Transformers.
- Validacion del tokenizador y de la plantilla de chat heredados del modelo base.
- Comprobacion de la configuracion de generacion (`generation_config.json`) copiada del original.
- Pruebas de regresion de formas de tensores, dtypes y nombres de parametros frente al checkpoint real.
- Pruebas de finitud numerica en float32, bfloat16 y float16 (forward, loss, gradientes).
- No soporta tool calling, agentes, vision, audio ni modo thinking de forma funcional.

## Casos de uso

- Pruebas de integracion en CI/CD: cargar el fixture en la suite de tests para verificar que el pipeline de Transformers acepta la arquitectura `Lfm2MoeForCausalLM` sin descargar los ~8.000 millones de parametros del modelo real, reduciendo tiempo y ancho de banda en cada build.
- Desarrollo de kernels y optimizaciones: validar formas, dtypes y nombres de tensores de una implementacion nueva (por ejemplo, atencion optimizada) contra un checkpoint ligero antes de probarla con el modelo completo.
- Verificacion de tokenizador y chat template: comprobar que el renderizado de conversaciones produce los tokens esperados usando los ficheros copiados byte a byte del modelo base.
- Pruebas de cuantizacion y exportacion: ejercitar rutas de conversion (por ejemplo, a GGUF u otros formatos) sobre un checkpoint de 4,4 M de parametros para detectar errores de mapeo de tensores antes de aplicarlos al modelo real.
- Validacion de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` como especificacion ejecutable de lo que un framework debe producir al cargar y ejecutar el modelo.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture LFM2-8B-A1B-mic` y comparar hashes registrados en `build.json` para auditar cambios en el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) seria irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en bfloat16 (4,36 M de parametros), asumiendo pesos mas estados de activacion minimos.
- GPU recomendadas: cualquier GPU consumer moderna; tambien es viable en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (via `AutoModelForCausalLM` con la configuracion `Lfm2MoeForCausalLM`); otras rutas (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este fixture en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un modelo de 4 capas con pesos aleatorios, las mediciones no serian representativas del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/LFM2-8B-A1B-mic` | 4,36 M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| `LiquidAI/LFM2-8B-A1B` | ~8.000 M (MoE, A1B) | no disponible | Modelo generativo real | no disponible | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable (reducidos) | no disponible | Pruebas de integracion | no disponible | Hugging Face |

La comparacion directa con modelos generativos no es significativa: el fixture existe para validar infraestructura, no para producir texto. Frente al modelo base, comparte arquitectura, tokenizador y plantilla de chat, pero difiere en numero de capas y en la naturaleza aleatoria de los pesos.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y las salidas no tienen sentido. No debe desplegarse en produccion ni usarse para generar contenido.
- Etiquetado como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos; respetar esa convencion en pipelines de seleccion.
- Solo cubre checkpoints cuyos ficheros de procesador sean byte-identicos y cuya config coincida tras el encogido (clave de fixture `fac5a8d2dc0e`); no valida variantes con otro tokenizador o configuracion.
- La configuracion reducida a 4 capas no reproduce el comportamiento numerico del modelo real; los tests de rendimiento o calidad no son extrapolables.
- Licencia no especificada en la informacion disponible; el fichero `LICENSE` se copia del modelo base, por lo que las condiciones de uso comercial dependen de las de `LiquidAI/LFM2-8B-A1B` y deben consultarse alli.
- Idiomas soportados no documentados; el tokenizador heredado puede cubrir varios idiomas, pero sin garantia funcional.
- Riesgo de confusion: el nombre incluye "8B-A1B" aunque el artefacto tiene 4,36 M de parametros; verificar siempre el tamano real antes de asignar recursos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/LFM2-8B-A1B-mic
- Modelo base: https://huggingface.co/LiquidAI/LFM2-8B-A1B
- Como se encogio el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/LFM2-8B-A1B-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
