# huggingface-mic/Qwen3-Next-80B-A3B-Instruct-mic

## Resumen

`Qwen3-Next-80B-A3B-Instruct-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic`, no un modelo entrenado ni utilizable para inferencia real. Se trata de una version "adelgazada" del checkpoint `Qwen/Qwen3-Next-80B-A3B-Instruct` de Alibaba Qwen, reducida mediante una regla generica de reduccion de configuracion (2 capas ocultas) y con pesos inicializados aleatoriamente (semilla 17). Su unico proposito es servir como banco de pruebas reproducible para validar contratos de integracion con frameworks (Transformers, entre otros) sin necesidad de descargar el modelo completo de 80B parametros.

El repositorio incluye los pesos reducidos en safetensors, un manifiesto de contrato (`integration.json`), documentacion de uso y expectativas de framework, y metadatos de procedencia (`build.json`). Los ficheros del procesador (tokenizer, merges, vocab, generation_config) se copian byte a byte del modelo original, por lo que la tokenizacion es identica a la del Qwen3-Next real.

Es relevante unicamente en el contexto de ingenieria de software y CI: permite ejecutar pruebas de integracion de arquitecturas `Qwen3NextForCausalLM` con un coste de almacenamiento de 0,1 GB y 19,7 millones de parametros, en lugar de los aproximadamente 80B del modelo de referencia. No debe confundirse con un modelo funcional ni usarse para generacion de texto, razonamiento o cualquier tarea downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3NextForCausalLM (transformer, configuracion reducida a 2 capas ocultas) |
| Parametros totales | 19.702.832 (fixture); el modelo base declara 80B en su nombre (A3B sugiere MoE con ~3B activos, no confirmado en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada de la config del modelo base, no verificada) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero LICENSE se copia del modelo base, pero su contenido no se detalla) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase `Qwen3NextForCausalLM` con los mismos nombres de tensores que el checkpoint real, pero con `num_hidden_layers` reducido a 2 mediante la regla generica de `sweep.py` del repositorio `huggingface/transformers-mic`. Los pesos son aleatorios (semilla 17) y no han pasado por ningun proceso de entrenamiento, RLHF ni DPO. Para garantizar que el fixture es sensible a las entradas del contrato, se aplico una puerta de sensibilidad: cada perturbacion de las entradas movio los logits al menos 0,001 (la mas debil, `input_ids:roll_batch`, 0,891), por lo que no fue necesario entrenar.

Los ficheros del procesador (`LICENSE`, `generation_config.json`, `merges.txt`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte del modelo base, de modo que la tokenizacion y la configuracion de generacion coinciden con las de `Qwen/Qwen3-Next-80B-A3B-Instruct`. El fixture es finito en float32, bfloat16 y float16 (forward, loss y gradientes), lo que lo hace apto para pruebas de integracion en esos dtypes. No hay innovaciones de decodificacion, atencion lineal ni tecnicas de entrenamiento propias: es un artefacto de test.

## Capacidades

- No es un modelo funcional: no genera texto coherente, no razona, no escribe codigo ni resuelve matematicas.
- Los pesos aleatorios producen salidas sin sentido semantico; solo son validos para comprobar contratos de entrada/salida.
- Tokenizacion identica a la del modelo base Qwen3-Next-80B-A3B-Instruct (ficheros de procesador copiados byte a byte).
- Compatible con la clase `Qwen3NextForCausalLM` de Transformers y con los nombres de tensores del checkpoint real.
- Soporta forward, calculo de loss y gradientes en float32, bfloat16 y float16.
- No dispone de tool calling, agentes, vision, audio ni modo thinking utilizables.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Casos de uso

- Pruebas de integracion en CI/CD: ejecutar la suite de tests de Transformers contra un `Qwen3NextForCausalLM` sin descargar los ~80B parametros del modelo real, reduciendo tiempo y coste de almacenamiento.
- Validacion de contratos de framework: comprobar que `integration.json` y `integrations/transformers/expectations` se cumplen (formas de tensores, dtypes, nombres de parametros) antes de integrar el modelo real.
- Desarrollo de pipelines de carga de safetensors: verificar que el codigo de carga, mapeo de pesos y conversion de dtypes funciona con la arquitectura Qwen3-Next usando un artefacto de 0,1 GB.
- Pruebas de tokenizacion: al copiarse los ficheros del procesador byte a byte, sirve para validar que el pipeline de tokenizacion reproduce exactamente el del modelo base.
- Verificacion de gradientes y mixed precision: el fixture es finito en float32, bfloat16 y float16, por lo que se puede usar para probar rutas de entrenamiento o fine-tuning sin GPU de gran capacidad.
- Reproducibilidad de fixtures: `build.json` registra fuentes fijadas, resultados de la puerta de sensibilidad y hashes de ficheros, lo que permite reconstruir el artefacto con `python example/build_fixtures.py --fixture Qwen3-Next-80B-A3B-Instruct-mic`.
- Pruebas de regresion de la herramienta de reduccion: validar que `sweep.py` produce configuraciones coherentes para arquitecturas Qwen3-Next.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (19,7M parametros, ~40 MB de pesos); cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte bfloat16 o float16 es suficiente. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, en cualquier modelo (GTX 1060, RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (carga estandar de safetensors). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia seria minima pero irrelevante para produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Next-80B-A3B-Instruct-mic (este) | 19,7M (fixture) | no disponible | Artefacto de test | no disponible | HuggingFace (225 descargas) |
| Qwen/Qwen3-Next-80B-A3B-Instruct | ~80B (A3B, MoE) | no disponible | Modelo instructivo real | no disponible | HuggingFace |
| Otros fixtures `*-mic` de huggingface-mic | variable (reducidos) | no disponible | Artefactos de test | no disponible | HuggingFace |

La comparativa relevante es con el modelo base: el fixture comparte arquitectura, tokenizador y nombres de tensores, pero sustituye los pesos entrenados por pesos aleatorios y reduce las capas a 2. Frente a otros fixtures de la misma organizacion, la diferencia es la arquitectura cubierta (Qwen3-Next frente a otras familias).

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas carecen de significado. No debe desplegarse en produccion ni usarse para generacion, razonamiento o codigo.
- Etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos; ignorar esta etiqueta lleva a resultados invalidos.
- La licencia no esta confirmada en la informacion disponible; aunque se copia el fichero LICENSE del modelo base, su contenido no se detalla. Verificar antes de cualquier uso.
- El contexto, los idiomas y la configuracion MoE del modelo base no estan verificados en este fixture; no asumir que el comportamiento de configuracion coincide mas alla de lo que registra `build.json`.
- Sesgos y alucinaciones: no aplica en el sentido habitual, pero las salidas aleatorias pueden interpretarse erroneamente como fallos del modelo real.
- No se documentan integraciones con motores de inferencia de alto rendimiento (vLLM, TGI, llama.cpp, Ollama); su uso esta pensado para Transformers.
- El repositorio puede requerir reconstruir ficheros auxiliares con `python example/build_fixtures.py --fixture Qwen3-Next-80B-A3B-Instruct-mic` si no estan incluidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huggingface-mic/Qwen3-Next-80B-A3B-Instruct-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/Qwen3-Next-80B-A3B-Instruct-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Qwen3-Next-80B-A3B-Instruct-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Qwen3-Next-80B-A3B-Instruct-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Qwen3-Next-80B-A3B-Instruct-mic/blob/main/build.json
- Explicacion de la reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3-Next-80B-A3B-Instruct-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
