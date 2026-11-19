# huggingface-mic/SmolLM3-3B-mic

## Resumen

SmolLM3-3B-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, no un modelo entrenado. Se trata de una version reducida artificialmente del modelo HuggingFaceTB/SmolLM3-3B, generada mediante la regla generica de reduccion de `sweep.py` del repositorio transformers-mic. El resultado es un checkpoint de 35,2 millones de parametros que conserva la arquitectura `SmolLM3ForCausalLM` y los nombres de tensores del modelo original, pero con solo 4 capas ocultas y pesos aleatorios (semilla 17).

Su proposito no es la inferencia ni la generacion de texto util, sino servir como fixture de integracion: un objeto reproducible que permite a frameworks y herramientas de serializacion validar que cargan correctamente la arquitectura SmolLM3, los ficheros de procesador (tokenizer, chat template, generation config) y el contrato de entradas y salidas. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Es relevante unicamente en el contexto de ingenieria de software de IA: pruebas de CI, validacion de pipelines de carga y verificacion de contratos de framework. No debe emplearse para tareas de lenguaje natural, ya que sus pesos son aleatorios y no ha recibido entrenamiento alguno. El repositorio ocupa 0,1 GB y acumula 2457 descargas, probablemente por automatizaciones de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal LM (`SmolLM3ForCausalLM`), version reducida a 4 capas ocultas |
| Parametros totales | 35.195.136 (35,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config del modelo base tras reduccion, sin dato explicito) |
| Tipos de cuantizacion | no disponible; pesos guardados en bfloat16 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura del transformer causal de SmolLM3 (`SmolLM3ForCausalLM`) pero con una configuracion reducida: `num_hidden_layers` pasa a 4 frente a las capas del checkpoint original. Los nombres de tensores coinciden con los del checkpoint real, lo que permite validar rutas de carga sin descargar el modelo completo. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json` y `notebook.ipynb`) se copiaron byte a byte desde HuggingFaceTB/SmolLM3-3B.

No hubo entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y superaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `input_ids:roll_batch`, alcanzo 1,98). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La generacion del fixture esta documentada en `build_fixtures.py` y `build.json` registra fuentes fijadas, resultados de la puerta y hashes de ficheros.

## Capacidades

- Carga y ejecucion forward en frameworks compatibles con `SmolLM3ForCausalLM` (Transformers).
- Validacion de contratos de entrada y salida definidos en `integration.json`.
- Verificacion de carga de tokenizer, chat template y generation config identicos al modelo base.
- Pruebas de estabilidad numerica en float32, bfloat16 y float16 (forward, loss, gradientes).
- Comprobacion de sensibilidad a perturbaciones de entrada (gate de logits).
- No soporta generacion de texto util, razonamiento, codigo ni matematicas: los pesos son aleatorios.
- No dispone de tool calling, capacidades de agente ni modo thinking funcional.
- Capacidades multilingues: no disponibles (el tokenizer es el del modelo base, pero el modelo no produce lenguaje).

## Casos de uso

- Pruebas de integracion en CI para frameworks de inferencia: cargar el fixture y comprobar que `SmolLM3ForCausalLM` se instancia sin errores y que los tensores se mapean con los nombres esperados, sin necesidad de descargar el checkpoint de 3B.
- Validacion de pipelines de tokenizacion: al copiar byte a byte los ficheros de procesador del modelo base, permite verificar que el tokenizer, el chat template y el special tokens map se cargan correctamente en un entorno de test.
- Verificacion de contratos de framework: `integration.json` y el directorio `integrations/transformers/expectations` definen expectativas ejecutables que un runner puede comprobar de forma automatica.
- Pruebas de estabilidad numerica: sirve para comprobar que un backend (CPU, CUDA, distintos dtypes) produce forward, loss y gradientes finitos en float32, bfloat16 y float16.
- Regresion de serializacion: al conservar nombres de tensores y formato safetensors, permite detectar roturas en herramientas de conversion o empaquetado antes de aplicarlas al modelo real.
- Desarrollo de utilidades de inspeccion de modelos: con 0,1 GB y 35,2 M de parametros, es un objeto ligero para depurar visores de arquitectura, scripts de analisis de pesos o herramientas de comparacion de configs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un fixture con pesos aleatorios y no ha sido evaluado en tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,1 GB en bfloat16 (35,2 M de parametros), holgadamente por debajo de cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema. Cualquier GPU (RTX 4090, A100, H100, integradas) es sobredimensionada para este fixture.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (principal, segun `integrations/transformers/usage.md`); otros backends no estan documentados para este artefacto.
- Latencia y throughput: no disponibles; al ser un modelo de prueba con pesos aleatorios, las metricas de rendimiento no son representativas de SmolLM3-3B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM3-3B-mic (este) | 35,2 M | no disponible | Fixture de integracion, pesos aleatorios | no disponible | Hugging Face, 0,1 GB |
| HuggingFaceTB/SmolLM3-3B | 3B (aproximado, segun nombre) | no disponible en esta ficha | Modelo de lenguaje real | no disponible en esta ficha | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Pruebas de contrato de frameworks | no disponible | Repositorio transformers-mic |

La comparativa con alternativas de la misma categoria (modelos de 3B para generacion de texto) no procede: este artefacto no es funcionalmente comparable a un modelo de lenguaje. Frente al modelo base, la unica equivalencia es arquitectonica y de ficheros de procesador.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no genera texto coherente ni realiza ninguna tarea de lenguaje; cualquier uso como modelo real produce salidas sin sentido.
- Etiquetado como `test-artifact`: el autor lo excluye explicitamente de busquedas de modelos candidatos; no debe promocionarse a produccion.
- Licencia no disponible: no se puede confirmar el regimen de uso comercial; al derivar de SmolLM3-3B, conviene consultar la licencia del modelo base antes de cualquier redistribucion.
- Configuracion reducida a 4 capas: no reproduce el comportamiento numerico del checkpoint completo, solo la estructura y los nombres de tensores.
- Contexto e idiomas no documentados: no hay datos explicitos sobre ventana de contexto efectiva ni cobertura linguistica.
- Riesgo de confusion: por el nombre, puede confundirse con una version real de SmolLM3-3B; verificar siempre la etiqueta `test-artifact` antes de integrarlo.
- No apto para benchmarks, evaluaciones de calidad ni comparativas de rendimiento con modelos reales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/SmolLM3-3B-mic
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Documentacion de reduccion del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/SmolLM3-3B-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/SmolLM3-3B-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/SmolLM3-3B-mic/blob/main/integrations/transformers/usage.md
- Procedencia del fixture: https://huggingface.co/huggingface-mic/SmolLM3-3B-mic/blob/main/build.json
