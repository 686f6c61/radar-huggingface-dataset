# huggingface-mic-temp/qwen2-vllm-mic

## Resumen

`qwen2-vllm-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic-temp`, derivado de `Qwen/Qwen2-0.5B` mediante un proceso de reducción automática de configuración. No se trata de un modelo entrenado ni utilizable para inferencia real: es una versión "slim" con solo 9.798.208 parámetros (frente a los ~494 millones del modelo base) cuyos pesos son aleatorios, generados con semilla 17, y que se conserva únicamente para validar contratos de integración de frameworks.

El propósito declarado es servir como fixture de pruebas para la integración de vLLM y Transformers: replica la arquitectura `Qwen2ForCausalLM` con nombres de tensores idénticos al checkpoint real, pero con `num_hidden_layers` reducido a 2, de modo que se pueda verificar la corrección de pipelines de carga, ejecución y expectativas de framework sin coste computacional. Los ficheros de procesador (tokenizer, vocab, merges, `generation_config.json`, `LICENSE`) se copian byte a byte desde el modelo base.

Su relevancia es, por tanto, exclusivamente de ingeniería de software: no aporta capacidades de generación, razonamiento ni comprensión. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos y no debe confundirse con un modelo funcional. Cualquier evaluación de calidad, benchmarks o uso en producción queda fuera de su ámbito por diseño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only causal) |
| Parametros totales | 9.798.208 (fixture reducido; el base Qwen2-0.5B tiene ~494M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config del base, no verificada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero LICENSE se copia del base, pero no se especifica el tipo) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal de la familia Qwen2, instanciado como `Qwen2ForCausalLM`. La configuración se ha reducido mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`, fijando `num_hidden_layers` a 2. Los nombres de tensores coinciden exactamente con los del checkpoint real `Qwen/Qwen2-0.5B`, lo que permite validar rutinas de carga y mapeo de pesos sin necesidad del modelo completo.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y solo se aceptaron tras superar una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, con 0,324). Los ficheros de procesador (`LICENSE`, `generation_config.json`, `merges.txt`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde el modelo base. El fixture se guardó en bfloat16, el dtype con el que carga por defecto `Qwen/Qwen2-0.5B`, y se verificó que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- No dispone de capacidades reales de generación de texto: los pesos son aleatorios y no han sido entrenados.
- No soporta tool calling ni function calling de forma funcional.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües verificadas.
- No incluye modo thinking, visión ni audio.
- Su única función es servir como fixture de conformidad para frameworks: verificar carga de pesos, forward pass, cálculo de loss y gradientes con nombres de tensores y ficheros de procesador idénticos a los del modelo base.

## Casos de uso

- Pruebas de integración de vLLM: el fixture permite validar el pipeline de carga y ejecución de un `Qwen2ForCausalLM` reducido sin consumir recursos del modelo completo, comprobando que vLLM acepta la configuración y los nombres de tensores.
- Verificación de contratos en Transformers: los directorios `integrations/transformers/usage.md` y `integrations/transformers/expectations` permiten comprobar que la API de Transformers produce los resultados esperados sobre este checkpoint.
- CI/CD de librerías de inferencia: al ocupar 0,0 GB y tener 9,8M de parámetros, puede incluirse en suites de tests automatizadas que validen cambios en el código de carga de safetensors o en el mapeo de configuraciones.
- Validación de estabilidad numérica: al ser finito en float32, bfloat16 y float16 (forward, loss y gradientes), sirve para detectar regresiones de precisión en rutinas de entrenamiento o inferencia.
- Pruebas de tokenizer y procesador: los ficheros de tokenizer copiados byte a byte permiten verificar el comportamiento del preprocesado sin cargar el modelo real.
- Reproducibilidad de fixtures: `build.json` registra fuentes fijadas, resultados de la puerta de sensibilidad y hashes de ficheros, lo que permite reconstruir el artefacto con `python example/build_fixtures.py --fixture qwen2-vllm-mic`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (9,8M de parámetros); en la práctica, unos pocos cientos de MB incluyendo overhead de framework.
- GPU recomendadas: cualquier GPU consumer moderna sirve; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: vLLM (objetivo declarado del fixture), Transformers, y presumiblemente llama.cpp/Ollama si se convierte a GGUF (no confirmado en la informacion).
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia sería mínima pero sin valor representativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2-vllm-mic | 9,8M | no disponible | Fixture de pruebas | no disponible | Hugging Face (repo de test) |
| Qwen/Qwen2-0.5B | ~494M | no disponible en la informacion | Modelo causal funcional | no disponible en la informacion | Hugging Face |
| Qwen2-1.5B | no disponible en la informacion | no disponible en la informacion | Modelo causal funcional | no disponible en la informacion | Hugging Face |

La comparación relevante es exclusivamente estructural: el fixture replica la arquitectura y los ficheros de procesador de Qwen2-0.5B con dos capas en lugar de las originales, pero no es funcionalmente comparable a ningún modelo entrenado.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no genera texto coherente ni responde a instrucciones; cualquier salida es ruido estadístico.
- No es un modelo utilizable en producción bajo ninguna circunstancia.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; su uso fuera de tests es un error de categoría.
- Licencia no especificada en la información disponible: aunque se copia el fichero `LICENSE` del base, no se detalla su tipo, por lo que el uso comercial no puede evaluarse.
- Sin datos de sesgos, alucinación o cobertura idiomática: no aplica al no haber entrenamiento.
- El repositorio tiene 0 descargas y 0 likes; es un artefacto interno de la organización `huggingface-mic-temp`.
- La fecha de creación indicada (2026-11-19) es futura respecto a la información habitual, lo que sugiere un posible error de metadatos o un artefacto de entorno de pruebas.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic-temp/qwen2-vllm-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2-0.5B
- Manifest de contrato: `integration.json` (en el repo)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repo)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repo)
- Procedencia del fixture: `build.json` (en el repo)
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen2-vllm-mic.html
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
