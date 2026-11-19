# huggingface-mic/llama-vllm-mic

## Resumen

`llama-vllm-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo de lenguaje usable: se trata de una version "adelgazada" (slim) del checkpoint `HuggingFaceTB/SmolLM2-135M`, reducida a 3.219.776 parametros reales mediante una regla generica de reduccion de configuracion que deja el modelo con solo 2 capas ocultas. Su proposito es servir como fixture ejecutable para validar contratos de integracion con frameworks de inferencia, en este caso vLLM, manteniendo la misma arquitectura (`LlamaForCausalLM`), los mismos nombres de tensores y los mismos ficheros de procesador que el modelo original.

El repositorio incluye los pesos en formato safetensors, un manifiesto de contrato (`integration.json`), documentacion de uso con Transformers, un directorio de expectativas del framework y metadatos de procedencia (`build.json`). Los pesos son aleatorios (semilla 17) y no han pasado por ningun entrenamiento; se aceptaron porque superaron una puerta de sensibilidad a la entrada que exige que toda perturbacion de las entradas mueva los logits al menos 0,001.

Su relevancia es acotada y muy especifica: sirve a desarrolladores de infraestructura y a mantenedores de frameworks para comprobar que una integracion (por ejemplo, la carga de un modelo Llama en vLLM) se comporta segun lo esperado sin necesidad de descargar ni ejecutar el checkpoint real de 135M. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. No debe confundirse con un modelo listo para produccion ni para evaluacion de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`LlamaForCausalLM`), version reducida a 2 capas ocultas |
| Parametros totales | 3.219.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16; el autor indica que el forward es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es una instancia de `LlamaForCausalLM` obtenida aplicando la regla generica de reduccion de `sweep.py` sobre `HuggingFaceTB/SmolLM2-135M`, que fija `num_hidden_layers` a 2. Conserva los mismos nombres de tensores que el checkpoint real y copia byte a byte los ficheros de procesador del modelo base: `generation_config.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json` y `vocab.json`. El fixture se identifica con la clave `ebd716dc45dd` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya configuracion coincide tras la reduccion.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato debe desplazar los logits al menos 0,001 (la mas debil, `input_ids:reverse`, produjo 2,11). El modelo se guardo en bfloat16, el dtype con el que carga por defecto el checkpoint original, y se verifico que el forward, la perdida y los gradientes son finitos en float32, bfloat16 y float16. La construccion se realiza con `build_fixtures.py`, y `build.json` registra las fuentes fijadas, los resultados de las puertas y los hashes de los ficheros.

## Capacidades

- Generacion de texto autoregresiva a nivel de contrato: el fixture ejecuta el forward de un LM causal, pero sus salidas no tienen calidad linguistica porque los pesos son aleatorios.
- Validacion de integraciones con vLLM: permite comprobar carga de pesos, nombres de tensores, configuracion y ficheros de procesador sin descargar el checkpoint real.
- Verificacion de contratos con Transformers: el repositorio incluye `integrations/transformers/usage.md` y un directorio de expectativas para comparar comportamiento esperado frente a observado.
- Comprobacion de estabilidad numerica: forward, perdida y gradientes finitos en float32, bfloat16 y float16.
- Pruebas de sensibilidad a la entrada: las perturbaciones definidas en el contrato desplazan los logits por encima de un umbral medible.
- Soporte de tool calling, agentes, razonamiento, codigo, matematicas, vision, audio o modo thinking: no disponible (no son capacidades de este artefacto).
- Capacidades multilingues: no disponibles; el tokenizador copiado pertenece a SmolLM2-135M, pero no se declara cobertura idiomatica para este fixture.

## Casos de uso

- Pruebas de integracion continua de vLLM: usar el fixture como modelo de sustitucion en la suite de tests del framework para validar carga, tokenizacion y generacion sin depender de pesos reales ni de descargas grandes.
- Validacion de contratos de framework: comparar la salida observada con el directorio de expectativas incluido en el repositorio para detectar regresiones en la capa de integracion.
- Desarrollo de pipelines de empaquetado: verificar que el manifiesto `integration.json` y los ficheros de procesador se resuelven correctamente en un entorno limpio antes de apuntar al checkpoint real.
- Pruebas de estabilidad numerica: ejecutar forward y backward en float32, bfloat16 y float16 para comprobar que no aparecen NaN ni infinitos en el pipeline de inferencia.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture llama-vllm-mic` y contrastar hashes con `build.json` para auditar la procedencia.
- Formacion de mantenedores: servir como ejemplo minimo y documentado de como reducir un checkpoint a un fixture ejecutable conservando arquitectura, nombres de tensores y procesador.
- Depuracion de cargas de modelo: aislar problemas de configuracion (por ejemplo, `num_hidden_layers`, dtype o ficheros de tokenizador) que en el modelo completo quedarian enmascarados por el tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K u otras) carece de sentido para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (3,2M parametros, aproximadamente 6,4 MB de pesos mas overhead de activaciones y runtime); no se han publicado mediciones.
- GPU recomendadas: cualquier GPU con soporte de bfloat16 o float16; el fixture es lo bastante pequeno para ejecutarse en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU moderna (RTX 3060, RTX 4090, etc.) e incluso en iGPU.
- Opciones de despliegue: vLLM (objetivo declarado del fixture), Transformers (uso documentado en `integrations/transformers/usage.md`); no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `llama-vllm-mic` (este) | 3,2M | no disponible | Fixture de integracion (test-artifact) | no disponible | Hugging Face |
| `HuggingFaceTB/SmolLM2-135M` | 135M | no disponible en la informacion proporcionada | Modelo de lenguaje pequeno para generacion de texto | no disponible en la informacion proporcionada | Hugging Face |
| Otros fixtures `huggingface-mic` | no disponible | no disponible | Fixtures de integracion para otros frameworks | no disponible | Hugging Face |

La comparacion relevante es con el checkpoint base: el fixture comparte arquitectura, nombres de tensores y procesador con SmolLM2-135M, pero reduce el numero de capas a 2 y sustituye los pesos entrenados por pesos aleatorios. No es un sustituto funcional del modelo base en ninguna tarea de lenguaje.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios (semilla 17); las salidas no tienen coherencia linguistica ni valor informativo.
- Etiquetado como `test-artifact` por el autor para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Sesgos conocidos: no disponibles; al no haber entrenamiento, no se han caracterizado sesgos, pero tampoco puede asumirse neutralidad.
- Riesgo de alucinacion: total, en el sentido de que toda salida es esencialmente ruido sin relacion con la entrada mas alla de la sensibilidad numerica.
- Limitaciones de contexto e idioma: no declaradas; el tokenizador se hereda de SmolLM2-135M, pero no se documenta cobertura idiomatica para este fixture.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada; conviene consultar el repositorio y la licencia del modelo base antes de cualquier uso.
- Caveat de produccion: no usar como sustituto de SmolLM2-135M ni para evaluar calidad, latencia real o consumo de memoria del modelo completo.
- El repositorio incluye solo pesos, uso y expectativas; otros ficheros deben regenerarse con `build_fixtures.py`, lo que puede introducir diferencias si las fuentes fijadas no estan disponibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/llama-vllm-mic
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/llama-vllm-mic.html
- Script de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
