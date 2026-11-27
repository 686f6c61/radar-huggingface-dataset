# huggingface-mic-temp/Mistral-7B-Instruct-v0.2-vllm-mic

## Resumen

`Mistral-7B-Instruct-v0.2-vllm-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic-temp`, no un modelo utilizable. Se construye a partir del checkpoint `mistralai/Mistral-7B-Instruct-v0.2` mediante una reduccion de configuracion que conserva la arquitectura `MistralForCausalLM` pero rebaja el numero de capas ocultas a 2, resultando en 8.438.400 parametros totales. Los pesos son aleatorios (semilla 17) y no han sido entrenados.

El proposito del repositorio es servir como fixture de integracion: empaqueta pesos reducidos, ejemplos de uso ejecutables y expectativas de framework en un unico lugar, con el objetivo de validar contratos de integracion (por ejemplo, compatibilidad con vLLM y Transformers) sin necesidad de descargar el checkpoint completo de 7B. Los ficheros de procesador (`tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`, `special_tokens_map.json`, `generation_config.json`) se copian byte a byte del modelo original, de modo que el pipeline de tokenizacion es identico.

Es relevante unicamente en el contexto de pruebas de infraestructura de IA: permite verificar cargas, formas de tensores y rutas de ejecucion de frameworks contra un modelo con la misma interfaz que Mistral-7B-Instruct-v0.2 pero con un coste de computo y almacenamiento minimo. No debe emplearse para inferencia real, generacion de texto ni evaluacion de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MistralForCausalLM (transformer decoder-only, configuracion reducida a 2 capas ocultas) |
| Parametros totales | 8.438.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la configuracion reducida; no verificada) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; se declara finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo replica la arquitectura de `mistralai/Mistral-7B-Instruct-v0.2` (decoder-only transformer con atencion causal, `MistralForCausalLM`) pero con una configuracion encogida: 2 capas ocultas en lugar de las 32 del checkpoint original. La reduccion se aplica mediante la regla generica de `sweep.py` del repositorio `transformers-mic`. Los nombres de tensores coinciden con los del checkpoint real, de modo que cualquier codigo que espere la estructura de Mistral-7B-Instruct-v0.2 puede cargarlo sin cambios.

No hay entrenamiento: los pesos se inicializan aleatoriamente con semilla 17. El autor justifica la ausencia de entrenamiento indicando que el fixture supero una puerta de sensibilidad a la entrada, en la que cada perturbacion de las entradas del contrato desplazo los logits al menos 0.001 (el caso mas debil, `attention_mask:all_ones`, con 0.455). Se guarda en bfloat16, el dtype por defecto del checkpoint original, y se verifica que el forward, la perdida y los gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- No dispone de capacidades generativas reales: los pesos son aleatorios y la salida no es coherente.
- Sirve como fixture de integracion para validar la carga de checkpoints con arquitectura Mistral en frameworks como Transformers y vLLM.
- Conserva el tokenizador y los ficheros de procesador del modelo original, por lo que reproduce fielmente el pipeline de tokenizacion.
- Mantiene los nombres de tensores del checkpoint real, lo que permite probar rutas de carga, formas y dtypes sin descargar los 7B.
- No soporta tool calling, agentes, vision, audio ni modo thinking de forma funcional (no hay pesos entrenados para ello).
- Multilingue: no aplicable en la practica, al no existir comportamiento aprendido.

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture en Transformers o vLLM para verificar que el codigo de carga, las formas de tensores y los dtypes funcionan antes de ejecutar contra el checkpoint real de 7B.
- Validacion de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen (entradas, salidas, mascaras de atencion) sin coste de GPU.
- Desarrollo de pipelines de tokenizacion: al copiar byte a byte `tokenizer.json` y `tokenizer.model`, permite probar el preprocesado y el vocabulario del modelo original en entornos sin acceso al checkpoint completo.
- Pruebas de despliegue con vLLM: verificar configuracion de servidor, rutas de API y manejo de peticiones con un modelo de 8,4M parametros que ocupa practicamente nada en disco y memoria.
- Reproducibilidad de fixtures: `build.json` registra fuentes fijadas, resultados de las puertas y hashes de ficheros, lo que permite reconstruir el artefacto con `build_fixtures.py` y auditar cambios.
- Docencia y demostracion de arquitecturas: ilustrar la estructura de un decoder-only tipo Mistral con un modelo minimo que se ejecuta en CPU en milisegundos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (8,4M parametros); cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte de bfloat16 o float16 sirve. Tambien funciona en CPU.
- Cabe en GPU consumer: si, en todas las GPU modernas (RTX 3060 en adelante) y en la mayoria de entornos integrados.
- Opciones de despliegue: Transformers, vLLM (el nombre del repositorio lo indica como objetivo), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta esa conversion.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas y 8,4M parametros, la latencia sera del orden de milisegundos, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-7B-Instruct-v0.2-vllm-mic (este) | 8,4M | no disponible | Fixture de integracion | no disponible | Hugging Face (repo de test) |
| mistralai/Mistral-7B-Instruct-v0.2 | 7,24B | 32.768 tokens (segun el modelo original) | Modelo instructivo real | Apache 2.0 (segun el modelo original) | Hugging Face |
| Fixtures equivalentes de otras familias | no disponible | no disponible | Pruebas de framework | no disponible | no disponible |

La comparacion relevante es con el checkpoint base: este fixture comparte arquitectura, tokenizador y nombres de tensores, pero sustituye los pesos entrenados por pesos aleatorios y reduce las capas de 32 a 2. No es un sustituto funcional del modelo original en ningun escenario de produccion.

## Limitaciones y advertencias

- Los pesos son aleatorios: la salida no tiene coherencia ni utilidad para generacion, razonamiento o codigo.
- Es un artefacto de prueba etiquetado `test-artifact`; el autor indica explicitamente que no es un modelo utilizable.
- La licencia no esta declarada en la informacion disponible, por lo que no se puede confirmar su uso comercial; dado su caracter de fixture, no tiene sentido productivo.
- La configuracion reducida (2 capas) altera el comportamiento respecto al checkpoint original; no sirve para validar calidad ni rendimiento del modelo real.
- El contexto maximo no esta documentado para esta configuracion reducida.
- No se declaran sesgos ni riesgos de alucinacion evaluables, al no existir comportamiento aprendido.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB; su mantenimiento y vigencia no estan garantizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/Mistral-7B-Instruct-v0.2-vllm-mic
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Como se construyo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Mistral-7B-Instruct-v0.2-vllm-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
