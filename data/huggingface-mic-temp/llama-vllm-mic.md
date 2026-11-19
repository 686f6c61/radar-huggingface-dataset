# huggingface-mic-temp/llama-vllm-mic

## Resumen

`llama-vllm-mic` es un artefacto de prueba (fixture) publicado por la cuenta `huggingface-mic-temp` en Hugging Face. No es un modelo entrenado ni utilizable: se trata de un checkpoint "slim" de 3.219.776 parametros construido a partir de la arquitectura de `HuggingFaceTB/SmolLM2-135M`, con pesos aleatorios (semilla 17) y una configuracion reducida a 2 capas ocultas. Su proposito es servir como fixture reproducible para validar contratos de integracion de frameworks (en este caso, vLLM y Transformers) sin necesidad de descargar ni ejecutar el modelo real.

El repositorio incluye los pesos en formato safetensors (bfloat16), los ficheros de procesador copiados byte a byte del modelo base (`tokenizer.json`, `merges.txt`, `vocab.json`, `generation_config.json`, `special_tokens_map.json`, `tokenizer_config.json`) y documentacion de expectativas de framework (`integration.json`, `integrations/transformers/usage.md`, `integrations/transformers/expectations`, `build.json`). Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Es relevante unicamente en el contexto de ingenieria de pruebas de infraestructura de inferencia: permite verificar que un pipeline de carga, tokenizacion y forward pass funciona correctamente con pesos y arquitectura compatibles con Llama, sin coste computacional ni de almacenamiento. No debe confundirse con un modelo de lenguaje funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, configuracion reducida a 2 capas ocultas) |
| Parametros totales | 3.219.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; se declara finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `LlamaForCausalLM`, la misma familia que el checkpoint de referencia `HuggingFaceTB.SmolLM2-135M`, pero con la configuracion reducida mediante la regla generica de `sweep.py` del repositorio `transformers-mic`: `num_hidden_layers` igual a 2. Los nombres de tensores coinciden con los del checkpoint real, de modo que cualquier codigo que espere un estado Llama puede cargarlo sin adaptaciones.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una "input-sensitivity gate": cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la perturbacion mas debil, `input_ids:reverse`, produce un desplazamiento de 2,11). Los ficheros de procesador se copiaron byte a byte del modelo base, garantizando que el tokenizador es identico al de SmolLM2-135M. El artefacto se genero con `build_fixtures.py` y los hashes, fuentes fijadas y resultados de la gate quedan registrados en `build.json`.

## Capacidades

- No es un modelo funcional: no genera texto coherente ni mantiene conversaciones.
- Carga y ejecucion de forward pass en Transformers y vLLM (compatibilidad declarada como fixture vLLM).
- Tokenizacion identica a `HuggingFaceTB.SmolLM2-135M` (ficheros de procesador copiados byte a byte).
- Nombres de tensores compatibles con checkpoints Llama, lo que permite probar rutas de carga y serializacion.
- Forward, loss y gradientes finitos en float32, bfloat16 y float16.
- No soporta tool calling, agentes, vision, audio ni razonamiento multi-paso.
- Multilingue: no disponible.

## Casos de uso

- Pruebas de integracion de vLLM: cargar el fixture en un servidor vLLM para verificar el pipeline de carga de safetensors y la generacion de logits sin consumir recursos de un modelo real.
- Validacion de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para comprobar que una version nueva de Transformers respeta las expectativas declaradas sobre entradas y salidas.
- CI/CD de infraestructura de inferencia: incluir el fixture en tests automatizados que verifiquen que el codigo de carga, tokenizacion y forward no rompe con cambios de version.
- Pruebas de tokenizador: al copiar los ficheros de procesador del modelo base, sirve para validar pipelines de tokenizacion equivalentes a SmolLM2-135M sin descargar el checkpoint completo.
- Verificacion de dtypes: comprobar que rutas de ejecucion en float32, bfloat16 y float16 producen valores finitos en forward, loss y gradientes.
- Reproducibilidad de artefactos: reconstruir el fixture con `python example/build_fixtures.py --fixture llama-vllm-mic` y comparar hashes registrados en `build.json`.
- Pruebas de compatibilidad de nombres de tensores: validar herramientas de conversion o inspeccion de checkpoints Llama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios y no tiene rendimiento medible en tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 (3,2 M de parametros, aproximadamente 6,4 MB de pesos) y muy por debajo de 1 GB en cualquier cuantizacion.
- GPU recomendadas: cualquier GPU consumer o integrada; no requiere acelerador dedicado.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, etc.) y tambien en CPU.
- Opciones de despliegue: Transformers y vLLM segun la model card; llama.cpp, Ollama y TGI no estan declarados como soportados en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la inferencia es practicamente instantanea, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| llama-vllm-mic | 3,2 M | no disponible | Fixture de pruebas | no disponible |
| HuggingFaceTB/SmolLM2-135M | 135 M | no disponible | Modelo causal funcional | no disponible en esta ficha |
| Otros fixtures `*-mic` de `huggingface-mic-temp` | variable | no disponible | Fixtures de pruebas | no disponible |

La comparacion con modelos funcionales no es significativa: `llama-vllm-mic` no compite en tareas de lenguaje, sino que se usa como sustituto ligero de SmolLM2-135M en pruebas de infraestructura.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene coherencia linguistica.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Licencia no disponible: no se puede asumir uso comercial permitido.
- Idiomas soportados no disponibles.
- Longitud de contexto no disponible; la configuracion reducida a 2 capas no refleja el comportamiento del modelo base.
- El tokenizador es identico al de SmolLM2-135M, pero el modelo no ha sido entrenado con el, por lo que las probabilidades no son significativas.
- La model card advierte que es un artefacto de prueba; tratarlo como modelo funcional es un error de uso.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic-temp/llama-vllm-mic
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Como se construyo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/llama-vllm-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
