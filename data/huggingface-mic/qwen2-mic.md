# huggingface-mic/qwen2-mic

## Resumen

`qwen2-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de un *fixture* (modelo reducido artificialmente) construido para validar la integracion del modelo `Qwen/Qwen2-0.5B` con la libreria Transformers. El repositorio combina pesos reducidos, ejemplos de uso y expectativas de framework en un unico paquete.

El fixture, denominado internamente `mic-qwen2-slim`, conserva la arquitectura `Qwen2ForCausalLM` pero reduce el numero de capas ocultas a 2, resultando en 9.798.208 parametros. Los pesos son aleatorios (semilla 17) y los ficheros del procesador (tokenizer, vocabulario, merges, config de generacion) se copian byte a byte desde `Qwen/Qwen2-0.5B`. El objetivo es disponer de un checkpoint ligero con los mismos nombres de tensores que el modelo real para ejecutar pruebas de integracion rapidas.

Su relevancia es exclusivamente de ingenieria: sirve para validar contratos de integracion en Transformers (variantes default, eager y bfloat16, con baseline en proceso limpio sobre una NVIDIA A10G) sin necesidad de cargar el checkpoint completo. Esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos y no debe confundirse con un modelo funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only, config reducida a 2 capas ocultas) |
| Parametros totales | 9.798.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config de Qwen2-0.5B, no verificada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, instanciado como `Qwen2ForCausalLM`. El fixture se genera aplicando la regla generica de reduccion de `sweep.py` sobre la configuracion de `Qwen/Qwen2-0.5B`, fijando `num_hidden_layers` a 2. Los ficheros del procesador (`LICENSE`, `generation_config.json`, `merges.txt`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte desde el checkpoint original, de modo que el tokenizador y la configuracion de generacion son identicos a los del modelo base.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque superaron la puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (la mas debil, `attention_mask:all_ones`, produjo 0,289). El fixture conserva los mismos nombres de tensores que el checkpoint real, se guarda en bfloat16 (el dtype por defecto de `Qwen/Qwen2-0.5B`) y es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture `df1b08640fd5` agrupa todos los checkpoints cuyos ficheros de procesador son identicos y cuya config coincide tras el proceso de reduccion.

## Capacidades

- No dispone de capacidades funcionales de generacion: los pesos son aleatorios y no han sido entrenados.
- Sirve como fixture de integracion para validar la carga de `Qwen2ForCausalLM` en Transformers con los mismos nombres de tensores que el modelo real.
- Permite ejecutar pruebas de forward, loss y gradientes en float32, bfloat16 y float16.
- Valida el comportamiento del tokenizador y de `generation_config.json` copiados desde `Qwen/Qwen2-0.5B`.
- Soporta pruebas de sensibilidad a entradas del contrato (por ejemplo, perturbaciones de `attention_mask`).
- No soporta tool calling, agentes, vision, audio ni ninguna capacidad especial derivada de entrenamiento.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForCausalLM` y verificar que los nombres de tensores y la config coinciden con lo esperado para `Qwen2ForCausalLM`, sin descargar el checkpoint de 0,5B.
- Validacion de CI en GitHub Actions: el repositorio enlaza una ejecucion de `transformers-mic` que regenera el fixture, lo que permite comprobar en pipelines que los cambios en Transformers no rompen la carga del modelo.
- Pruebas de dtype y precision: ejecutar forward, loss y gradientes en float32, bfloat16 y float16 para detectar NaN o infinitos en rutas numericas nuevas.
- Verificacion de contratos de tokenizador: al copiarse los ficheros del procesador byte a byte, sirve para comprobar que cambios en el pipeline de tokenizacion no alteran la salida esperada sobre el vocabulario de Qwen2.
- Desarrollo de utilidades de reduccion de checkpoints: el script `sweep.py` y `build_fixtures.py` documentan el proceso de *shrinking* y pueden reutilizarse para generar fixtures de otros modelos.
- Pruebas de sensibilidad a entradas: el gate de perturbacion (logits con desplazamiento minimo de 0,001) es un patron replicable para validar que un fixture responde a cambios en las entradas del contrato.
- Baseline en proceso limpio sobre NVIDIA A10G: el contrato declara variantes default, eager y bfloat16 con grabacion de baseline, util para comparar tiempos de carga y ejecucion entre versiones de Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 para los 9,8M de parametros (pesos ~20 MB), aunque no se proporciona una cifra oficial.
- GPU recomendadas: el contrato se valido sobre una NVIDIA A10G; cualquier GPU consumer moderna puede alojar el fixture.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (validado en el contrato); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/qwen2-mic | 9,8M (fixture) | no disponible | Fixture de integracion (test-artifact) | no disponible | Hugging Face |
| Qwen/Qwen2-0.5B | 0,5B | no disponible en la informacion | Modelo base real para generacion | no disponible en la informacion | Hugging Face |
| Otros fixtures de `huggingface-mic` | no disponible | no disponible | Validacion de contratos de otros modelos | no disponible | Hugging Face |

La comparacion directa con modelos funcionales de la misma categoria no es aplicable: `qwen2-mic` es un artefacto de prueba, no un modelo de inferencia. Frente a `Qwen/Qwen2-0.5B`, comparte arquitectura, tokenizador y nombres de tensores, pero reduce el numero de capas a 2 y sustituye los pesos entrenados por pesos aleatorios.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas carecen de significado.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta declarada en la informacion disponible; el fichero `LICENSE` se copia desde `Qwen/Qwen2-0.5B`, por lo que conviene consultar la licencia del modelo base antes de cualquier uso.
- Los idiomas soportados no estan documentados.
- La longitud de contexto no se verifica en la informacion; se hereda de la config de Qwen2-0.5B pero no se confirma su comportamiento con 2 capas.
- El contrato declara objetivos solo para el fixture; la cobertura del checkpoint completo es un trabajo separado.
- Riesgo de confusion: el nombre y la estructura del repositorio pueden llevar a error si se interpreta como un modelo afinado de Qwen2.
- No se documentan sesgos ni riesgos de alucinacion porque el modelo no genera texto con sentido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/qwen2-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2-0.5B
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/qwen2-mic/blob/main/integration.json
- Uso con Transformers (`integrations/transformers/usage.md`): https://huggingface.co/huggingface-mic/qwen2-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers (`integrations/transformers/expectations`): https://huggingface.co/huggingface-mic/qwen2-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/qwen2-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen2-mic.html
- Evidencia de regeneracion (GitHub Actions): https://github.com/huggingface/transformers-mic/actions/runs/38252430459
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
