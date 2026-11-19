# huggingface-mic/qwen2-vllm-mic

## Resumen

`qwen2-vllm-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni utilizable en producción, sino de una version "adelgazada" del checkpoint `Qwen/Qwen2-0.5B` pensada para validar contratos de integración con frameworks de inferencia, en este caso vLLM. El autor lo etiqueta explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

El repositorio contiene únicamente los pesos reducidos, la documentación de uso y las expectativas del framework. La arquitectura es idéntica a la del modelo base (`Qwen2ForCausalLM`), pero con solo 2 capas ocultas y 9.798.208 parámetros totales, lo que lo convierte en un esqueleto ejecutable para pruebas de integración continua. Los pesos son aleatorios (semilla 17) y no han pasado por ningún proceso de entrenamiento.

Su relevancia es puramente técnica: permite a los mantenedores de frameworks verificar que la carga, la tokenización, la ejecución forward y la compatibilidad con vLLM funcionan correctamente sin necesidad de descargar ni ejecutar el modelo real de 0,5B parámetros. Para desarrolladores e investigadores que evalúan modelos, este repositorio no aporta capacidades de generación ni resultados de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 9.798.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (config reducida; el modelo base Qwen2-0.5B soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio (los ficheros de licencia se copian byte a byte del modelo base Qwen/Qwen2-0.5B) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo `Qwen2ForCausalLM`, reducido mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`. La configuración resultante tiene 2 capas ocultas, frente a las 24 del `Qwen/Qwen2-0.5B` original. Los ficheros de procesador (`tokenizer.json`, `tokenizer_config.json`, `vocab.json`, `merges.txt`, `generation_config.json` y `LICENSE`) se copiaron byte a byte del modelo base, de modo que la tokenización es idéntica a la del Qwen2-0.5B real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una "input-sensitivity gate": cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, movió 0,324). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture cubre todos los checkpoints cuyos ficheros de procesador son idénticos y cuya configuración coincide tras el adelgazamiento (clave de fixture `db330bd3fbc9`).

## Capacidades

- No dispone de capacidades de generación de texto útiles: los pesos son aleatorios y no han sido entrenados.
- No soporta razonamiento, código, matemáticas ni vision de forma funcional.
- No implementa tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales (el tokenizador es el de Qwen2-0.5B, pero el modelo no produce salidas coherentes).
- Su única función es servir como fixture ejecutable para validar contratos de integración con vLLM y Transformers.

## Casos de uso

- Pruebas de integración continua en vLLM: el fixture permite verificar que la carga de pesos, la inicialización del motor y la ejecución forward funcionan sin descargar el modelo real de 0,5B, reduciendo el tiempo y el coste de los pipelines de CI.
- Validación de contratos de framework: los mantenedores de `transformers-mic` pueden comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen tras cambios en el código.
- Desarrollo de herramientas de inspección de checkpoints: al conservar los mismos nombres de tensor que el modelo real, sirve para probar scripts que recorren y validan la estructura de pesos.
- Pruebas de tokenización y preprocesado: los ficheros de procesador son idénticos a los de Qwen2-0.5B, por lo que se puede validar el pipeline de tokenización sin cargar el modelo completo.
- Verificación de compatibilidad de dtypes: al ser finito en float32, bfloat16 y float16, permite probar rutas de conversión de precisión en frameworks de inferencia.
- Reproducción de builds: `build.json` registra las fuentes fijadas, los resultados de las puertas de validación y los hashes de ficheros, lo que permite reconstruir el fixture con `python example/build_fixtures.py --fixture qwen2-vllm-mic`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no tiene sentido evaluar su rendimiento en tareas de NLP.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (9,8M parámetros × 2 bytes ≈ 20 MB de pesos, más overhead de activaciones y del runtime).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: vLLM (objetivo principal del fixture), Transformers, y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta esa ruta.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la latencia sería mínima, pero irrelevante para producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/qwen2-vllm-mic | 9,8M | no disponible | Fixture de prueba | no disponible | Hugging Face |
| Qwen/Qwen2-0.5B | 494M (aprox.) | 32.768 tokens | Modelo real de generacion | Apache 2.0 (segun modelo base) | Hugging Face |
| Qwen/Qwen2-1.5B | 1.500M (aprox.) | 32.768 tokens | Modelo real de generacion | Apache 2.0 (segun modelo base) | Hugging Face |

La comparación es asimétrica: el fixture no compite en capacidades con los modelos reales, solo replica su estructura para pruebas. No se dispone de datos de benchmarks del fixture para comparar rendimiento.

## Limitaciones y advertencias

- Los pesos son aleatorios (semilla 17): el modelo no genera texto coherente ni responde a instrucciones.
- Está etiquetado como `test-artifact` y no debe usarse en producción ni como base para fine-tuning.
- La licencia no está declarada explícitamente en el repositorio; el fichero `LICENSE` se copia del modelo base, pero se recomienda verificar los términos del Qwen2-0.5B original antes de cualquier uso.
- La configuración reducida (2 capas) no representa el comportamiento del modelo base; los resultados de pruebas de integración no son extrapolables al Qwen2-0.5B real.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no está entrenado.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto interno sin comunidad de usuarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/qwen2-vllm-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2-0.5B
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/qwen2-vllm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/qwen2-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/qwen2-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/qwen2-vllm-mic/blob/main/build.json
- Explicación del adelgazamiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen2-vllm-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
