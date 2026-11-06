# huggingface-mic/A.X-K1-mic

## Resumen

A.X-K1-mic es un artefacto de prueba publicado en Hugging Face por el usuario `huggingface-mic`. No se trata de un modelo entrenado ni utilizable para inferencia real: es un *fixture* (modelo reducido artificialmente) derivado del modelo base `skt/A.X-K1`, creado para validar contratos de integración con frameworks (concretamente Transformers). La model card es explícita al respecto: "It is a test artifact, not a usable model".

El modelo conserva la arquitectura del original (`AXK1ForCausalLM`) pero con una configuración reducida a 2 capas (`num_hidden_layers 2`) y un total de 21.048.000 parámetros. Los pesos son aleatorios (semilla 17), no entrenados, y los ficheros de procesador (tokenizer, chat template, generation config, special tokens) se copiaron byte a byte desde `skt/A.X-K1`. El objetivo es que sirva como fixture reproducible para tests de integración que verifiquen que un framework carga, ejecuta y produce logits sensibles a las entradas del contrato, sin necesidad de descargar el checkpoint real.

Su relevancia es por tanto exclusivamente de ingeniería de software: permite a los mantenedores de integraciones (por ejemplo, en el repositorio `transformers-mic`) ejecutar pruebas de contrato en CI con un modelo de 0,1 GB en lugar del modelo completo. No debe emplearse para generación de texto, evaluación de calidad ni ningún uso productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AXK1ForCausalLM (transformer causal, variante MoE según los tensores `mlp.gate.e_score_correction_bias` del checkpoint real) |
| Parametros totales | 21.048.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es una versión reducida del checkpoint `skt/A.X-K1`. La arquitectura declarada es `AXK1ForCausalLM`, un transformer causal con mezcla de expertos (MoE) en las capas MLP, a juzgar por la presencia de tensores `model.layers.N.mlp.gate.e_score_correction_bias` en el checkpoint original (que el fixture omite porque el checkpoint real tampoco los incluye). El fixture se generó aplicando la regla genérica de reducción de `sweep.py` del repositorio `transformers-mic`, que fija `num_hidden_layers` a 2.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una "input-sensitivity gate": cada perturbación de las entradas del contrato debía mover los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, produjo 0,228). Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde `skt/A.X-K1`. El fixture es finito en float32, bfloat16 y float16 (forward, loss y gradientes). No se dispone de información sobre datos de entrenamiento, tokens, RLHF o DPO del modelo base.

## Capacidades

- No es un modelo funcional: no genera texto coherente, no razona, no escribe código ni resuelve matemáticas.
- Conserva la interfaz de tokenización y chat template del modelo base `skt/A.X-K1`, por lo que sirve para probar pipelines de preprocesado.
- Permite validar la carga de pesos, la inicialización de tensores ausentes y la ejecución del forward pass en frameworks compatibles.
- Sirve como fixture de tests de contrato para integraciones de Transformers (verificación de logits sensibles a entradas).
- Soporta ejecución en float32, bfloat16 y float16 con gradientes finitos.
- No dispone de tool calling, capacidades de agente, multilingüismo ni modos especiales (thinking, visión, audio).

## Casos de uso

- Tests de integración en CI: el fixture permite ejecutar pruebas de contrato de carga y forward pass en pipelines de integración continua con un repo de 0,1 GB, sin descargar el checkpoint completo de `skt/A.X-K1`.
- Validación de frameworks: comprobar que una nueva versión de Transformers (o de una integración derivada) inicializa correctamente los tensores ausentes (`mlp.gate.e_score_correction_bias`) tal como lo haría con el modelo real.
- Verificación de tokenizer y chat template: al copiarse byte a byte desde el modelo base, permite testear pipelines de preprocesado, plantillas de chat y `generation_config` sin depender del checkpoint grande.
- Pruebas de dtype: comprobar que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16, útil para validar rutas de mixed precision.
- Reproducibilidad de fixtures: el `build.json` registra fuentes fijadas, resultados de la gate y hashes de ficheros, lo que permite reconstruir el fixture con `python example/build_fixtures.py --fixture A.X-K1-mic`.
- Desarrollo de herramientas de inspección de modelos: analizar nombres de tensores, shapes y configuraciones de un modelo tipo AXK1 sin el coste de almacenamiento del original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, etc.) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (21 M de parámetros, ~42 MB de pesos) más overhead de activaciones y tokenizer.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer e integrada; también se ejecuta en CPU sin problemas.
- Opciones de despliegue: Transformers (ruta principal, dado que el fixture está diseñado para validar esa integración); llama.cpp, Ollama o vLLM no están documentados para este artefacto y su utilidad sería nula al no ser un modelo funcional.
- Latencia y throughput: no disponibles; irrelevantes para un fixture de test.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| A.X-K1-mic | 21,0 M | no disponible | Fixture de test | no disponible | Hugging Face (`huggingface-mic/A.X-K1-mic`) |
| skt/A.X-K1 | no disponible | no disponible | Modelo base real | no disponible | Hugging Face (`skt/A.X-K1`) |
| Fixtures equivalentes de `transformers-mic` | variable (segun regla de shrink) | no disponible | Fixtures de test por modelo | no disponible | Hugging Face (`huggingface-mic/*`) |

No se conocen alternativas comparables fuera del ecosistema `transformers-mic`; los modelos de la misma categoría serían otros fixtures generados por la misma herramienta, no modelos funcionales.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene sentido semántico.
- Etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe promocionarse ni evaluarse como modelo.
- La licencia no está declarada, lo que impide determinar condiciones de uso comercial o redistribución.
- El checkpoint real carece de los tensores `mlp.gate.e_score_correction_bias` en todas las capas; el fixture reproduce esa ausencia, por lo que no sirve para probar rutas que dependan de esos tensores.
- No hay información sobre sesgos, alucinación o cobertura idiomática porque no ha habido entrenamiento.
- Cualquier uso en producción, demo pública o evaluación de calidad constituiría un error de uso.
- La fecha de creación (2026-11-04) y la ausencia de descargas o likes indican que es un artefacto reciente y sin adopción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/A.X-K1-mic
- Modelo base: https://huggingface.co/skt/A.X-K1
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/A.X-K1-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/A.X-K1-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/A.X-K1-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/A.X-K1-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/A.X-K1-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
