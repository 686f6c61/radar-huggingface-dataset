# huggingface-mic/phi-2-mic

## Resumen

`phi-2-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` en Hugging Face. No es un modelo de lenguaje utilizable: se trata de una version "adelgazada" del checkpoint `microsoft/phi-2` construida para validar contratos de integracion y expectativas de frameworks (en concreto, del proyecto `transformers-mic`). El repositorio contiene pesos reducidos, ejemplos de uso ejecutables y un directorio de expectativas de framework, todo orientado a tests de integracion.

El modelo conserva la arquitectura `PhiForCausalLM` del original, pero con una configuracion reducida a 2 capas ocultas y 6.671.616 parametros totales, frente a los aproximadamente 2.700 millones del Phi-2 real. Los pesos son aleatorios (semilla 17) y no han sido entrenados; superaron un test de sensibilidad a la entrada que garantiza que perturbaciones en las entradas del contrato mueven los logits al menos 0,001.

Su relevancia es exclusivamente de ingenieria: sirve para verificar que una implementacion de framework (tokenizador, mascaras de atencion, formato de pesos) se comporta de forma consistente con el checkpoint de referencia. Esta etiquetado como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos. No debe emplearse para inferencia real, generacion de texto ni ninguna tarea de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PhiForCausalLM (transformer causal decoder-only, configuracion reducida a 2 capas) |
| Parametros totales | 6.671.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config de Phi-2, no verificada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos guardados en float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura `PhiForCausalLM` del checkpoint `microsoft/phi-2`, un transformer causal decoder-only, pero con la configuracion encogida mediante la regla generica de `sweep.py` del proyecto `transformers-mic`: `num_hidden_layers` reducido a 2. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que cualquier codigo que cargue Phi-2 puede cargar este fixture sin cambios en el mapeo de pesos.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, alcanza 0,838). Los ficheros de procesador (tokenizador, `generation_config.json`, `special_tokens_map.json`, `vocab.json`, `merges.txt`, `tokenizer.json`, `added_tokens.json`, `LICENSE`, `NOTICE.md`, etc.) se copiaron byte a byte desde `microsoft/phi-2`. El modelo guardado es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture esta identificado por la clave `97b6a16aa567` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el encogimiento.

## Capacidades

- No dispone de capacidades reales de generacion: los pesos son aleatorios y no han sido entrenados.
- Sirve como fixture de integracion para validar la carga de `PhiForCausalLM` en frameworks (Transformers y otros).
- Permite verificar el contrato de entradas/salidas (input ids, attention mask, logits) frente a expectativas predefinidas.
- Valida la compatibilidad byte a byte de los ficheros de procesador con `microsoft/phi-2`.
- Comprueba la estabilidad numerica en float32, bfloat16 y float16 (forward, loss, gradientes).
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking.
- No tiene capacidades multilingues reales; el tokenizador es el de Phi-2, pero el modelo no produce texto coherente.

## Casos de uso

- Tests de integracion en CI de frameworks de inferencia: cargar el fixture con la misma API que `microsoft/phi-2` y comprobar que los logits coinciden con las expectativas registradas en `integrations/transformers/expectations`, sin necesidad de descargar los ~5,5 GB del checkpoint real.
- Validacion de tokenizadores y procesadores: al copiarse los ficheros de procesador byte a byte desde Phi-2, sirve para verificar pipelines de tokenizacion (added tokens, special tokens, merges) sin depender del modelo completo.
- Pruebas de mapeo de pesos: al conservar los nombres de tensores del checkpoint original, permite comprobar que una implementacion de carga (sharding, conversion de dtype, remapeo) funciona correctamente antes de ejecutarla contra el modelo real.
- Verificacion de estabilidad numerica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar NaNs o divergencias en kernels personalizados o backends alternativos.
- Desarrollo de utilidades de perfilado y benchmarking: usar un modelo de 6,7 M parametros para medir overhead de framework (carga, tokenizacion, scheduling) sin el coste computacional del modelo completo.
- Validacion de contratos de API y esquemas de serializacion: el repositorio incluye `integration.json` y `build.json`, utiles para testear herramientas que consumen manifests de modelos y verifican hashes de ficheros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 (6,7 M parametros, ~13 MB de pesos) y muy por debajo de 100 MB en la practica contando overhead de framework.
- GPU recomendadas: cualquier GPU consumer o integrada es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (carga directa con `PhiForCausalLM`), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta dicha conversion.
- Latencia y throughput: no disponibles de forma oficial; por tamano, la inferencia es practicamente instantanea en cualquier hardware moderno, pero los resultados no son texto coherente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/phi-2-mic` | 6,7 M (fixture) | no disponible | Test de integracion | no disponible | Hugging Face |
| `microsoft/phi-2` | ~2.700 M | 2.048 tokens (segun documentacion publica de Phi-2) | Modelo de lenguaje real | MIT (segun documentacion publica de Phi-2) | Hugging Face |
| Otros fixtures de `transformers-mic` | variable (reducidos) | no disponible | Test de integracion | no disponible | Hugging Face |

La comparacion relevante es con `microsoft/phi-2`, del que este fixture es una version encogida con fines de test. Frente a otros fixtures de la misma organizacion, comparte el mismo proposito pero cubre especificamente el contrato de Phi-2. No se dispone de datos de rendimiento comparables porque el modelo no esta entrenado.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene sentido linguistico.
- Etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta declarada en la informacion disponible; el repo incluye un fichero `LICENSE` copiado de Phi-2, pero no se confirma su termino en la metadata.
- Los idiomas soportados no estan declarados; el tokenizador es el de Phi-2, pero el modelo no genera texto valido en ningun idioma.
- La longitud de contexto efectiva no esta verificada en la informacion disponible.
- Riesgo de confusion: el nombre `phi-2-mic` puede llevar a pensar que es un fine-tune de Phi-2; no lo es.
- No apto para evaluaciones de calidad, sesgos o alucinacion, ya que no ha sido entrenado.
- Uso comercial: no recomendado ni documentado; al ser un artefacto de test, no procede.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/phi-2-mic
- Modelo base: https://huggingface.co/microsoft/phi-2
- Manifest de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicacion del encogimiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/phi-2-mic.html
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
