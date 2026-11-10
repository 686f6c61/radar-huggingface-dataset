# huggingface-mic/Falcon-H1-Tiny-90M-Instruct-mic

## Resumen

Falcon-H1-Tiny-90M-Instruct-mic es un artefacto de prueba (fixture) publicado en Hugging Face por el usuario huggingface-mic, derivado del modelo tiiuae/Falcon-H1-Tiny-90M-Instruct. No se trata de un modelo entrenado ni utilizable para inferencia real: es una version "adelgazada" del checkpoint original, con solo 2.479.280 parametros y pesos generados aleatoriamente (semilla 17), disenada para validar contratos de integracion y expectativas de frameworks (Transformers) sin necesidad de descargar ni ejecutar el modelo completo.

El proposito del repositorio es servir como fixture reproducible: conserva la misma arquitectura (FalconH1ForCausalLM), los mismos nombres de tensores y los ficheros de procesador copiados byte a byte del modelo base (chat_template.jinja, generation_config.json, special_tokens_map.json, tokenizer.json, tokenizer_config.json). La unica diferencia estructural es la configuracion reducida a 2 capas ocultas, aplicando la regla generica de reduccion del proyecto transformers-mic.

Es relevante unicamente en el contexto de testing de pipelines de integracion y CI: permite comprobar que una implementacion carga, ejecuta el forward, calcula perdida y gradientes de forma finita en float32, bfloat16 y float16, sin coste computacional. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. No debe confundirse con el modelo Falcon-H1-Tiny-90M-Instruct real de TII, que si es un modelo de lenguaje entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FalconH1ForCausalLM (transformer, configuracion reducida a 2 capas ocultas) |
| Parametros totales | 2.479.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el fixture se declara finito tambien en float32 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura FalconH1ForCausalLM del modelo base tiiuae/Falcon-H1-Tiny-90M-Instruct, pero con una configuracion reducida: num_hidden_layers = 2, aplicando la regla generica de reduccion implementada en sweep.py del repositorio transformers-mic. Los nombres de tensores coinciden con los del checkpoint real y los ficheros de procesador (tokenizer, chat template, generation config, special tokens map) se copiaron byte a byte desde el modelo original, de modo que el contrato de entrada/salida sea identico.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y superaron una "input-sensitivity gate": cada perturbacion de las entradas del contrato movio los logits al menos 0.001 (el caso mas debil, attention_mask:all_ones, produjo 0.0116). El fixture se guardo en bfloat16, el dtype por defecto del modelo base, y se verifico que forward, perdida y gradientes son finitos en float32, bfloat16 y float16. La clave de fixture es edc38f8f4e36 y cubre checkpoints con ficheros de procesador identicos y config coincidente tras la reduccion. No se dispone de informacion sobre datos de entrenamiento, RLHF/DPO ni innovaciones tecnicas del modelo original en la informacion proporcionada.

## Capacidades

- No es un modelo funcional: al tener pesos aleatorios, no genera texto coherente ni resuelve tareas de razonamiento, codigo o matematicas.
- Replica el contrato de entrada/salida del modelo base: mismos nombres de tensores, mismo tokenizer y misma chat template, lo que permite validar integraciones.
- Sirve para comprobar carga y ejecucion en Transformers (forward, perdida y gradientes finitos en float32, bfloat16 y float16).
- No dispone de tool calling, function calling, capacidades de agente ni multi-step reasoning reales.
- No dispone de capacidades multilingues verificables (idiomas no disponibles).
- No dispone de thinking mode, vision ni audio.
- Util como fixture en tests de CI y en validacion de contratos de frameworks.

## Casos de uso

- Tests de integracion en CI: cargar el fixture con Transformers y verificar que el pipeline de carga, tokenizacion y forward se ejecuta sin errores, sin coste de descarga ni GPU.
- Validacion de contratos de framework: comprobar que una implementacion respeta los nombres de tensores, la chat template y el generation_config del modelo base antes de probar con el checkpoint real.
- Desarrollo de utilidades de serializacion: verificar que el guardado y carga en safetensors y bfloat16 funciona correctamente con la arquitectura FalconH1ForCausalLM.
- Pruebas de robustez numerica: comprobar que forward, perdida y gradientes son finitos en float32, bfloat16 y float16 sobre una configuracion minima de 2 capas.
- Regresion de tokenizer: validar que los ficheros de procesador copiados byte a byte producen las mismas secuencias de tokens que el modelo original.
- Reproducibilidad de fixtures: reconstruir el artefacto con build_fixtures.py usando la clave de fixture edc38f8f4e36 y comparar hashes registrados en build.json.
- Documentacion de integraciones: servir como ejemplo ejecutable de uso en Transformers (integrations/transformers/usage.md) para nuevos contribuidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (2,48 M de parametros, ~5 MB de pesos); cabe en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU es suficiente. En GPU, cualquier tarjeta consumer (incluso integradas) puede ejecutarlo.
- Cabe en cualquier GPU consumer; no hay requisito practico de VRAM.
- Opciones de despliegue: Transformers (integrations/transformers/usage.md). No se documentan opciones para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia es despreciable, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Falcon-H1-Tiny-90M-Instruct-mic (este) | 2,48 M | no disponible | Fixture de test (pesos aleatorios) | no disponible | Hugging Face |
| tiiuae/Falcon-H1-Tiny-90M-Instruct | no disponible en la informacion proporcionada | no disponible | Modelo de lenguaje instruct | no disponible | Hugging Face |
| Otros fixtures del proyecto transformers-mic | variable (reducidos) | no disponible | Validacion de contratos | no disponible | Hugging Face (huggingface-mic) |

No se dispone de datos de rendimiento ni de especificaciones completas del modelo base en la informacion proporcionada, por lo que la comparativa se limita a proposito y disponibilidad.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y la salida no es texto coherente.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Sesgos conocidos: no aplicables al no haber entrenamiento; no se han documentado sesgos.
- Riesgo de alucinacion: total, en el sentido de que la salida es ruido estadistico sin relacion con la entrada.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: licencia no disponible; verificar antes de cualquier uso, aunque el proposito previsto es solo testing.
- Caveat de produccion: usar unicamente en CI o validacion de contratos; para inferencia real, emplear el modelo base tiiuae/Falcon-H1-Tiny-90M-Instruct.
- El repositorio no incluye todos los ficheros por defecto: hay que reconstruirlos con `python example/build_fixtures.py --fixture Falcon-H1-Tiny-90M-Instruct-mic`.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/Falcon-H1-Tiny-90M-Instruct-mic
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-Tiny-90M-Instruct
- Contract manifest: https://huggingface.co/huggingface-mic/Falcon-H1-Tiny-90M-Instruct-mic/blob/main/integration.json
- Transformers usage: https://huggingface.co/huggingface-mic/Falcon-H1-Tiny-90M-Instruct-mic/blob/main/integrations/transformers/usage.md
- Transformers expectations: https://huggingface.co/huggingface-mic/Falcon-H1-Tiny-90M-Instruct-mic/tree/main/integrations/transformers/expectations
- Fixture provenance: https://huggingface.co/huggingface-mic/Falcon-H1-Tiny-90M-Instruct-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Falcon-H1-Tiny-90M-Instruct-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio transformers-mic (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
