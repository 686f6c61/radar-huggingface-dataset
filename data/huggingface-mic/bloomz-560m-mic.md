# huggingface-mic/bloomz-560m-mic

## Resumen

`huggingface-mic/bloomz-560m-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic`, no un modelo entrenado utilizable. Se presenta como una versión "slim" de `bigscience/bloomz-560m` que conserva la arquitectura `BloomForCausalLM` y los ficheros de procesador originales, pero cuyos pesos son aleatorios (semilla 17) y cuyo número de parámetros se ha reducido a 16.156.544 mediante una regla genérica de reducción aplicada sobre la configuración del modelo. Su propósito es servir de fixture reproducible para validar contratos de integración y expectativas de frameworks dentro del proyecto `transformers-mic`.

El repositorio incluye, además de los pesos, un manifiesto de contrato (`integration.json`), documentación de uso con Transformers, un directorio de expectativas del framework y metadatos de procedencia de la construcción (`build.json`). La model card es explícita: "It is a test artifact, not a usable model", y la etiqueta `test-artifact` existe precisamente para excluirlo de búsquedas de modelos candidatos. Cualquier evaluación de calidad, razonamiento o generación de texto sobre este checkpoint carece de sentido, porque los pesos no han sido entrenados.

Es relevante ahora únicamente en el contexto de ingeniería de pruebas: permite verificar que un pipeline de carga, tokenización, forward pass y cálculo de gradientes funciona con la arquitectura BLOOM sin descargar el checkpoint completo de 560M parámetros. No debe confundirse con un modelo de lenguaje en producción ni con un fine-tuning del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `BloomForCausalLM` (transformer decoder-only, variante BLOOM) |
| Parametros totales | 16.156.544 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la configuración reducida; el modelo base `bigscience/bloomz-560m` soporta 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; la model card indica que es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es una instancia reducida de `BloomForCausalLM`, la implementación de BLOOM en Transformers: un transformer decoder-only con atención causal y alibi positional embeddings, tal como corresponde a la familia BLOOM. La reducción se aplicó con la regla genérica de `sweep.py` del repositorio `transformers-mic`, que ajusta la configuración (dimensiones de capas, cabezas, etc.) manteniendo los mismos nombres de tensores que el checkpoint real. Los ficheros de procesador (`special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde `bigscience/bloomz-560m`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una "input-sensitivity gate": cada perturbación de las entradas del contrato desplaza los logits al menos 0.001 (el caso más débil, `attention_mask:all_ones`, produce 0.0313). Esto garantiza que el fixture responde a las entradas de forma medible, no que produzca texto coherente. No se dispone de información sobre datos de entrenamiento, número de tokens, RLHF/DPO ni innovaciones técnicas de inferencia, porque el artefacto no ha sido entrenado.

## Capacidades

- No genera texto coherente: los pesos son aleatorios y el modelo no ha sido entrenado.
- Sirve como fixture para validar la carga de `BloomForCausalLM` con Transformers.
- Permite comprobar la tokenización con los ficheros de procesador originales de `bigscience/bloomz-560m`.
- Verifica contratos de integración definidos en `integration.json` y en `integrations/transformers/expectations`.
- Ejecuta forward pass, cálculo de pérdida y gradientes en float32, bfloat16 y float16.
- Conserva los nombres de tensores del checkpoint real, lo que facilita pruebas de compatibilidad de estado.
- No soporta tool calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no evaluables (el tokenizador es el de BLOOMZ, pero el modelo no produce lenguaje).

## Casos de uso

- Pruebas de integración en CI: cargar el fixture con `AutoModelForCausalLM` y verificar que la configuración reducida y los nombres de tensores coinciden con lo esperado, sin descargar el checkpoint de 560M.
- Validación de pipelines de tokenización: usar los ficheros de procesador copiados byte a byte para comprobar que el preprocesado de BLOOMZ funciona en el entorno de pruebas.
- Verificación de contratos de framework: ejecutar el directorio `integrations/transformers/expectations` para comprobar que la versión de Transformers cumple las expectativas del proyecto `transformers-mic`.
- Pruebas de dtype y estabilidad numérica: comprobar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 antes de pasar al checkpoint real.
- Desarrollo de herramientas de inspección de modelos: probar scripts que leen safetensors, cuentan parámetros o comparan configuraciones con un repositorio de 0.1 GB.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture bloomz-560m-mic` y comparar hashes contra `build.json`.
- Pruebas de sensibilidad a entradas: replicar la gate de sensibilidad (perturbaciones que mueven los logits ≥ 0.001) como test de regresión del propio fixture.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (16,2M parámetros ≈ 65 MB de pesos, más activaciones y overhead del runtime).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.), y también en CPU.
- Opciones de despliegue: Transformers (carga estándar con `AutoModelForCausalLM`), y en principio cualquier runtime que acepte safetensors de BLOOM; no se documentan configuraciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al no ser un modelo entrenado, las mediciones de rendimiento no son representativas de `bigscience/bloomz-560m`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/bloomz-560m-mic` | 16,2M | no disponible | Fixture de pruebas | no disponible | Hugging Face (0,1 GB) |
| `bigscience/bloomz-560m` | 560M | 2048 tokens | Modelo de lenguaje multilingüe | BigScience BLOOM RAIL 1.0 (no confirmada en la informacion disponible) | Hugging Face |
| `bigscience/bloom-560m` | 560M | 2048 tokens | Modelo de lenguaje base | BigScience BLOOM RAIL 1.0 (no confirmada en la informacion disponible) | Hugging Face |

La comparación relevante es únicamente con el checkpoint del que deriva: mismo tokenizador y misma arquitectura, pero 35 veces menos parámetros y pesos no entrenados. Frente a otros fixtures de pruebas de la familia BLOOM, no se dispone de información sobre alternativas equivalentes.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene valor semántico.
- La model card lo etiqueta explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.
- No debe desplegarse en producción ni usarse para evaluar calidad, sesgos o capacidades lingüísticas.
- La licencia no está declarada en la información disponible; verificar los términos del modelo base antes de cualquier uso.
- El contexto efectivo depende de la configuración reducida y no está documentado; no asumir los 2048 tokens del modelo base.
- Los ficheros de procesador son los de BLOOMZ, pero el vocabulario y los embeddings reducidos pueden no cubrir todos los tokens de forma útil.
- Riesgo de confusión: el nombre incluye "bloomz-560m" pero el repositorio solo contiene 16,2M parámetros; no sustituye al checkpoint original en benchmarks ni en demos.
- No hay garantías de compatibilidad con versiones futuras de Transformers más allá de las expectativas documentadas en el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/bloomz-560m-mic
- Modelo base: https://huggingface.co/bigscience/bloomz-560m
- Documentación de uso con Transformers: https://huggingface.co/huggingface-mic/bloomz-560m-mic/blob/main/integrations/transformers/usage.md
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/bloomz-560m-mic/blob/main/integration.json
- Procedencia del fixture: https://huggingface.co/huggingface-mic/bloomz-560m-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/bloomz-560m-mic.html
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
