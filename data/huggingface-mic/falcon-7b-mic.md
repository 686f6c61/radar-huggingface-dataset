# huggingface-mic/falcon-7b-mic

## Resumen

`falcon-7b-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo de lenguaje utilizable: se trata de un *fixture* (pesos reducidos de forma deliberada) construido a partir de `tiiuae/falcon-7b` para validar contratos de integracion y expectativas de framework en el ecosistema Transformers. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

El modelo conserva la arquitectura `FalconForCausalLM` pero con una configuracion reducida a 2 capas ocultas, lo que resulta en 8.835.456 parametros totales (frente a los 7.000 millones del modelo original). Los pesos son aleatorios (semilla 17) y no han sido entrenados; se generaron mediante la regla generica de reduccion de `sweep.py` del repositorio `transformers-mic`.

Su relevancia es exclusivamente tecnica y de ingenieria de software: sirve como banco de pruebas reproducible para verificar que las integraciones de Transformers (carga, tokenizer, generacion, mascaras de atencion) funcionan correctamente sin necesidad de descargar el checkpoint completo de Falcon-7B. No debe emplearse para inferencia real ni para evaluacion de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Falcon (transformer causal decoder-only), clase `FalconForCausalLM` |
| Parametros totales | 8.835.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura Falcon del modelo base `tiiuae/falcon-7b`, pero con `num_hidden_layers` reducido a 2 mediante la regla generica de reduccion implementada en `sweep.py`. Los ficheros de procesamiento (`configuration_falcon.py`, `generation_config.json`, `modeling_falcon.py`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde el checkpoint original, de modo que la interfaz de codigo es identica a la del modelo real.

No hubo entrenamiento. Los pesos se inicializaron de forma aleatoria con semilla 17 y se validaron mediante una *input-sensitivity gate*: cada perturbacion de las entradas del contrato desplazo los logits al menos 0.001 (el caso mas debil, `attention_mask:all_ones`, produjo 0.138). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Se guardo en bfloat16, el dtype por defecto de `tiiuae/falcon-7b`.

## Capacidades

- No dispone de capacidades de generacion de texto util: los pesos son aleatorios y no han sido entrenados.
- Replica la interfaz de `FalconForCausalLM`, por lo que puede ejecutar el pipeline de generacion de Transformers a nivel de codigo (sin calidad de salida).
- Permite verificar el comportamiento del tokenizer de Falcon (copiado byte a byte del modelo original).
- Sirve como fixture para tests de integracion de frameworks (Transformers, y potencialmente otros que consuman el mismo contrato).
- No soporta tool calling, agentes, vision, audio ni modo thinking de forma funcional.
- No tiene capacidades multilingues reales (no entrenado).

## Casos de uso

- Tests de integracion en CI: validar que una version de Transformers carga correctamente un `FalconForCausalLM` sin descargar los 7B parametros del checkpoint real, reduciendo tiempo y ancho de banda en pipelines.
- Verificacion de contratos de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen (formas de tensores, nombres de parametros, dtypes).
- Pruebas de regresion de tokenizer: al copiarse los ficheros de procesamiento byte a byte, permite detectar cambios en el comportamiento del tokenizer de Falcon entre versiones.
- Desarrollo de herramientas de reduccion de modelos: sirve como ejemplo reproducible de la regla de `sweep.py` para generar fixtures a partir de checkpoints grandes.
- Validacion de estabilidad numerica: el modelo es finito en float32, bfloat16 y float16, por lo que puede usarse para probar rutas de mixed precision sin riesgo de NaN.
- Benchmarking de infraestructura de tests: medir el coste de carga y ejecucion de un fixture minimo frente al modelo completo en entornos de integracion continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (8,8M parametros), aunque el repo ocupa 0.0 GB segun Hugging Face.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior); tambien ejecutable en CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (referencia principal); vLLM, llama.cpp, Ollama y TGI no estan documentados para este fixture y su uso no tiene sentido practico.
- Latencia y throughput: no disponibles; al ser un artefacto de prueba, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| falcon-7b-mic | 8,8M | no disponible | no disponible | Fixture de test |
| tiiuae/falcon-7b | 7.000M | 2048 tokens (modelo base) | Apache 2.0 (modelo base) | Modelo generativo real |
| tiiuae/falcon-40b | 40.000M | 2048 tokens (modelo base) | Apache 2.0 (modelo base) | Modelo generativo real |

La comparativa es limitada: `falcon-7b-mic` no es un modelo funcional y solo es comparable a otros fixtures de test, de los cuales no se dispone de informacion en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado como `test-artifact` por el autor para excluirlo de busquedas de modelos candidatos; no debe confundirse con un modelo de produccion.
- Licencia no disponible: no se puede asumir uso comercial ni redistribucion sin consultar al autor.
- Idiomas no disponibles: no se ha entrenado en ningun idioma.
- Longitud de contexto no disponible en la informacion proporcionada.
- Riesgo de confusion: el nombre `falcon-7b-mic` puede llevar a error sobre su tamano real (8,8M parametros, no 7B).
- No apto para evaluacion de calidad, benchmarks de capacidad ni despliegue en produccion.

## Enlaces

- [Hugging Face: huggingface-mic/falcon-7b-mic](https://huggingface.co/huggingface-mic/falcon-7b-mic)
- [Modelo base: tiiuae/falcon-7b](https://huggingface.co/tiiuae/falcon-7b)
- [Repositorio transformers-mic (GitHub)](https://github.com/huggingface/transformers-mic)
- [Script de reduccion sweep.py](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Script de construccion build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
- [Documentacion del proceso de reduccion](https://huggingface-mic-mic-coverage.static.hf.space/shrink/falcon-7b-mic.html)
