# huggingface-mic-temp/gemma3-vllm-mic

## Resumen

`huggingface-mic-temp/gemma3-vllm-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic-temp` para validar la integracion de la arquitectura Gemma 3 con frameworks de inferencia, en concreto vLLM. No es un modelo entrenado ni utilizable para tareas reales: se trata de una version "adelgazada" (slim) del checkpoint `google/gemma-3-4b-it` con pesos aleatorios y una configuracion reducida, disenada para que los pipelines de pruebas de integracion puedan ejecutarse sin descargar los ~8 GB del modelo original.

El fixture conserva la misma arquitectura (`Gemma3ForConditionalGeneration`), los mismos nombres de tensores y los ficheros de procesador copiados byte a byte del modelo base, pero reduce el numero de capas del torre de texto y del encoder de vision a 2 en cada caso. El resultado son 17.226.816 parametros (frente a los ~4.000 millones del modelo de referencia) almacenados en bfloat16 en un repositorio de 0,1 GB.

Su relevancia es puramente de ingenieria: sirve como caso de prueba reproducible para validar contratos de integracion (manifiesto `integration.json`, expectativas de Transformers, uso con vLLM) y para detectar regresiones en el soporte de Gemma 3 dentro de esos frameworks. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Gemma3ForConditionalGeneration` (texto + vision), configuracion reducida a 2 capas en cada torre |
| Parametros totales | 17.226.816 (fixture); el modelo base `google/gemma-3-4b-it` tiene ~4.000 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; pesos guardados en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura de `google/gemma-3-4b-it`: un modelo causal de lenguaje con capacidad de vision (`Gemma3ForConditionalGeneration`), compuesto por un decoder de texto y un encoder de imagenes. La unica diferencia respecto al checkpoint original es la configuracion: el script generico `sweep.py` reduce `text.num_hidden_layers` y `vision.num_hidden_layers` a 2, manteniendo intactos los nombres de tensores y la estructura de capas para que el grafo de computo sea equivalente al del modelo real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17, generados por `build_fixtures.py`. Para garantizar que el fixture es funcionalmente representativo, se aplico una "input-sensitivity gate": cada perturbacion de las entradas del contrato debe mover los logits al menos 0,001 (la perturbacion mas debil, `attention_mask:all_ones`, produjo un desplazamiento de 0,268). Los ficheros de procesador (`tokenizer.json`, `tokenizer.model`, `chat_template.json`, `preprocessor_config.json`, `special_tokens_map.json`, `generation_config.json`, etc.) se copiaron byte a byte desde el modelo base, de modo que el tokenizador y la plantilla de chat son los reales. Los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto, codigo ni razonamiento coherente.
- Conserva la interfaz de un modelo Gemma 3 causal multimodal (texto + vision) a efectos de API y firmas de tensores.
- Permite validar el pipeline completo de tokenizacion y plantilla de chat de Gemma 3, ya que el tokenizador es el original.
- Sirve para ejercitar el contrato de integracion con vLLM: carga de pesos, shapes, dtypes y forward pass.
- Permite verificar expectativas de Transformers (entradas, salidas, mascaras de atencion) definidas en `integrations/transformers/expectations`.
- No soporta tool calling, agentes, multi-step reasoning ni capacidades multilingues reales, al carecer de conocimiento aprendido.
- No dispone de modo thinking, audio ni ninguna capacidad especial mas alla de la estructura multimodal heredada.

## Casos de uso

- Pruebas de integracion en CI de vLLM: cargar el fixture y ejecutar un forward pass para detectar regresiones en el soporte de Gemma 3 sin descargar el modelo de 4B.
- Validacion del contrato de integracion: comprobar que `integration.json` y las expectativas de Transformers se cumplen con los mismos nombres de tensores que el checkpoint real.
- Desarrollo de herramientas de "shrink" de modelos: el fixture es el resultado de `sweep.py` y sirve como referencia para validar el algoritmo de reduccion de configuraciones.
- Pruebas de tokenizacion y plantilla de chat: al copiar los ficheros de procesador byte a byte, se puede verificar el comportamiento del tokenizador de Gemma 3 en pipelines de preprocesado.
- Validacion de dtypes y estabilidad numerica: el fixture es finito en float32, bfloat16 y float16, por lo que sirve para probar rutas de mixed precision y deteccion de NaNs.
- Pruebas de carga de safetensors y verificacion de hashes: `build.json` registra fuentes fijadas y hashes de ficheros, lo que permite reproducibilidad en entornos aislados.
- Test de sensibilidad de entradas: la gate de sensibilidad (perturbaciones que mueven logits al menos 0,001) se puede reutilizar como test de humo en frameworks de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (17,2 M parametros, ~34 MB de pesos) mas overhead de activaciones y cache KV, que con 2 capas es minimo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; tambien A100/H100 para pruebas en entornos de datacenter.
- Cabe holgadamente en cualquier GPU consumer y en la mayoria de entornos CPU.
- Opciones de despliegue: vLLM (objetivo principal del fixture), Transformers, y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta esa ruta.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia seria orders of magnitude inferior a la del modelo real, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `huggingface-mic-temp/gemma3-vllm-mic` | 17,2 M (fixture) | no disponible | no disponible | Artefacto de prueba para integracion vLLM |
| `google/gemma-3-4b-it` | ~4.000 M | no disponible en esta ficha | Gemma Terms of Use (segun modelo base) | Modelo multimodal real para produccion |
| Otros fixtures MIC de la organizacion | variable (reducidos) | no disponible | no disponible | Pruebas de integracion de otras arquitecturas |

La comparativa con modelos de la misma categoria no aplica: el fixture no compite en calidad con ningun modelo real, sino que sustituye al modelo base unicamente en el contexto de pruebas automatizadas.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene significado. No debe desplegarse en produccion bajo ninguna circunstancia.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; los pipelines de seleccion de modelos deberian filtrarlo.
- La licencia no esta declarada en la informacion disponible; el modelo base `google/gemma-3-4b-it` esta sujeto a los terminos de Gemma, pero el fixture no indica herencia explicita.
- La configuracion reducida (2 capas) hace que cualquier medicion de rendimiento o calidad sea irrelevante respecto al modelo real.
- No se documentan sesgos, riesgo de alucinacion ni limitaciones de idioma porque no hay comportamiento aprendido que evaluar.
- El repositorio no incluye todos los ficheros necesarios para reconstruir el fixture desde cero; segun la model card, deben regenerarse con `python example/build_fixtures.py --fixture gemma3-vllm-mic`.
- La fecha de creacion (2026-11-26) es futura respecto a la redaccion habitual de fichas; conviene verificar la vigencia del artefacto antes de usarlo como referencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/gemma3-vllm-mic
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Manifiesto del contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma3-vllm-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
