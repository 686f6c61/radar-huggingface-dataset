# huggingface-mic/Qwen3-Next-80B-A3B-Instruct-mic

## Resumen

`huggingface-mic/Qwen3-Next-80B-A3B-Instruct-mic` no es un modelo entrenado, sino un artefacto de prueba (fixture) derivado de `Qwen/Qwen3-Next-80B-A3B-Instruct`. Su propósito es servir como banco de pruebas reproducible para validar la integración de la arquitectura Qwen3-Next en frameworks como Transformers. Lo mantiene la organización `huggingface-mic` y está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos a uso real.

El repositorio contiene pesos reducidos a 19,7 millones de parámetros (frente a los 80.000 millones del modelo original), pero conserva la misma arquitectura `Qwen3NextForCausalLM` y los mismos nombres de tensores que el checkpoint real. Los pesos son aleatorios (semilla 17) y se generaron sin entrenamiento, tras superar una puerta de sensibilidad a entradas. Los ficheros de procesador (tokenizer, `generation_config.json`, `LICENSE`) se copiaron byte a byte del modelo original.

Su relevancia es puramente técnica: permite a desarrolladores verificar que una implementación de la arquitectura Qwen3-Next carga, ejecuta forward, calcula pérdida y propaga gradientes correctamente, sin necesidad de descargar los ~160 GB del modelo completo. No debe confundirse con un modelo utilizable para generación de texto real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3NextForCausalLM (transformer, variante Qwen3-Next) |
| Parametros totales | 19.702.832 (fixture reducido; el modelo base tiene 80B) |
| Parametros activos | no disponible (el modelo base es MoE A3B; el fixture no preserva esa configuración funcional) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (tokenizer heredado del modelo base) |
| Licencia | no disponible (el fichero LICENSE se copia del modelo base, pero el campo de licencia del repo no está declarado) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `Qwen3NextForCausalLM` con una configuración reducida: 2 capas ocultas (`num_hidden_layers: 2`), aplicando la regla genérica de reducción definida en `sweep.py` del repositorio `transformers-mic`. Conserva los mismos nombres de tensores que el checkpoint real `Qwen/Qwen3-Next-80B-A3B-Instruct`, lo que permite validar la carga y el mapeo de pesos de la implementación de referencia.

No hubo entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y se validaron mediante una puerta de sensibilidad a entradas: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (el caso más débil, `input_ids:roll_batch`, alcanzó 0,891), lo que garantiza que el fixture responde de forma medible a cambios en la entrada. Los pesos son finitos en float32, bfloat16 y float16, tanto en forward como en pérdida y gradientes. Los ficheros de procesador (`LICENSE`, `generation_config.json`, `merges.txt`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte del modelo base, y el fixture se guardó en bfloat16, el dtype por defecto del checkpoint original.

## Capacidades

- No es un modelo funcional: no genera texto coherente ni resuelve tareas reales.
- Sirve como fixture de integración para validar la carga de la arquitectura Qwen3-Next en Transformers.
- Permite verificar forward pass, cálculo de pérdida y propagación de gradientes en float32, bfloat16 y float16.
- Valida el mapeo de nombres de tensores contra el checkpoint real de 80B.
- Permite probar la integración del tokenizer y del `generation_config.json` heredados del modelo base.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües reales (los pesos son aleatorios).
- No soporta visión, audio ni modo thinking, ya que el fixture no implementa esas rutas funcionales.

## Casos de uso

- Validación de integración en Transformers: cargar el fixture con `Qwen3NextForCausalLM` para comprobar que la implementación acepta la configuración reducida y produce salidas finitas, antes de invertir en descargar el checkpoint de 80B.
- Pruebas de CI/CD de frameworks: incluir el fixture en la suite de tests de una librería para detectar regresiones en la carga de arquitecturas Qwen3-Next sin depender de pesos de gran tamaño.
- Verificación de mapeo de tensores: comparar los nombres de tensores del fixture con los del checkpoint real para asegurar que el convertidor de pesos no pierde parámetros.
- Desarrollo de kernels o backends: probar implementaciones alternativas de atención o de capas lineales contra un modelo del mismo grafo computacional pero con coste de memoria mínimo.
- Validación de tokenizer y pipeline de generación: usar los ficheros de procesador copiados byte a byte para verificar la tokenización y la configuración de generación del modelo base.
- Pruebas de tolerancia numérica: ejecutar el mismo fixture en float32, bfloat16 y float16 para comprobar que un backend produce resultados finitos y estables en los tres dtypes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, carece de sentido evaluar MMLU, HumanEval, GSM8K u otras métricas de calidad.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para los pesos en bfloat16 (19,7M parámetros, repo de 0,1 GB).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer y en entornos de CPU.
- Opciones de despliegue: Transformers (vía `Qwen3NextForCausalLM`); no se ha validado con vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo funcional no tiene sentido desplegarlo en producción.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la inferencia es prácticamente instantánea, pero las salidas no son significativas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| Qwen3-Next-80B-A3B-Instruct-mic (este) | 19,7M (fixture) | no disponible | no disponible | Fixture de integración |
| Qwen/Qwen3-Next-80B-A3B-Instruct | 80B (MoE, A3B activos) | no disponible | no disponible | Modelo instructivo real |
| Otros fixtures `transformers-mic` | variable (reducidos) | no disponible | no disponible | Pruebas de integración por arquitectura |

No se dispone de datos de benchmarks ni de comparativas de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado semántico.
- Etiquetado como `test-artifact`; no debe incluirse en búsquedas de modelos candidatos ni en producción.
- No preserva la configuración MoE funcional del modelo base (A3B): el fixture tiene 2 capas y no reproduce el comportamiento de mezcla de expertos.
- La licencia no está declarada en el campo del repo; el fichero `LICENSE` se copia del modelo base, pero debe verificarse antes de cualquier uso.
- No se han validado los ficheros de integración (`integration.json`, `integrations/transformers/usage.md`, `expectations`) en esta ficha; su contenido debe consultarse en el repositorio.
- Riesgo de confusión: el nombre incluye "80B-A3B-Instruct", pero el artefacto real tiene 19,7M de parámetros; verificar siempre el tamaño antes de su uso.
- No apto para evaluación de calidad, sesgos ni alucinación, ya que no ha sido entrenado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Qwen3-Next-80B-A3B-Instruct-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3-Next-80B-A3B-Instruct-mic.html
- Manifiesto de contrato (en el repo): `integration.json`
- Uso en Transformers (en el repo): `integrations/transformers/usage.md`
- Expectativas de Transformers (en el repo): `integrations/transformers/expectations`
- Procedencia del fixture (en el repo): `build.json`
