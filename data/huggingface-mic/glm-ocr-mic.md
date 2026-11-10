# huggingface-mic/GLM-OCR-mic

## Resumen

GLM-OCR-mic es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic`, derivado del modelo `zai-org/GLM-OCR` mediante un proceso de reduccion automatica de configuracion. No es un modelo funcional ni un checkpoint entrenado: se trata de un repositorio que empaqueta pesos "slim" con la misma arquitectura y los mismos nombres de tensores que el modelo original, pero con una configuracion drasticamente reducida (2 capas ocultas en el codificador de texto) y pesos aleatorios generados con semilla 17. Su proposito es servir como fixture de test para validar integraciones de frameworks (concretamente Transformers) sin necesidad de descargar el checkpoint completo.

El modelo base, `zai-org/GLM-OCR`, es un modelo de imagen a texto (image-to-text) orientado a OCR, con arquitectura `GlmOcrForConditionalGeneration`. El fixture conserva los ficheros de procesador del modelo original copiados byte a byte (`chat_template.jinja`, `generation_config.json`, `preprocessor_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`), de modo que las expectativas de integracion (contrato de entradas/salidas, tokenizacion, preprocesado de imagen) son identicas a las del modelo real.

La relevancia de este repositorio es puramente de ingenieria de software: permite ejecutar tests de integracion y de contrato en CI sin consumir recursos de GPU ni ancho de banda, y esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. Con 8.810.112 parametros totales y un tamano de repo de 0.0 GB, no debe confundirse con un modelo utilizable en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GlmOcrForConditionalGeneration` (modelo multimodal imagen-a-texto de la familia GLM-OCR) |
| Parametros totales | 8.810.112 (fixture reducido) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base `zai-org/GLM-OCR`: una clase `GlmOcrForConditionalGeneration`, es decir, un modelo condicional de generacion de texto a partir de imagen (pipeline image-to-text). La reduccion se aplico mediante la regla generica de `sweep.py` del repositorio `huggingface/transformers-mic`, que disminuye el numero de capas ocultas del codificador de texto a 2 (`text num_hidden_layers 2`). Los ficheros de procesador y tokenizador se copiaron byte a byte desde el checkpoint original, garantizando que el contrato de preprocesado (imagen, chat template, configuracion de generacion) sea equivalente.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0.001 (la mas debil, `pixel_values:roll_batch`, con 0.0823), lo que justifico no entrenar el fixture. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que cualquier codigo que cargue `zai-org/GLM-OCR` puede cargar el fixture sin cambios. Se verifico que el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El build queda registrado en `build.json` con fuentes fijadas, resultados de la puerta y hashes de ficheros.

## Capacidades

- No es un modelo funcional: no genera texto ni realiza OCR real, ya que sus pesos son aleatorios.
- Reproduce el contrato de integracion de `zai-org/GLM-OCR`: entradas de imagen (`pixel_values`), tokenizacion, chat template y configuracion de generacion.
- Sirve para validar la carga del modelo en Transformers y la coherencia de nombres de tensores con el checkpoint real.
- Permite tests de contrato de preprocesado y de forma de las entradas/salidas sin descargar el modelo completo.
- Compatible con ejecucion en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- No dispone de tool calling, capacidades de agente, multilingues ni modo thinking, al no ser un modelo entrenado.
- Etiquetado `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Casos de uso

- Tests de integracion en CI para Transformers: cargar el fixture y verificar que la clase `GlmOcrForConditionalGeneration` se instancia y ejecuta un forward con entradas sinteticas, sin coste de GPU ni descarga del checkpoint completo.
- Validacion de contratos de preprocesado: comprobar que `preprocessor_config.json` y `processor_config.json` producen tensores con la forma esperada a partir de imagenes de prueba, usando los ficheros copiados byte a byte del modelo original.
- Verificacion de nombres de tensores en pipelines de conversion: al compartir nombres con `zai-org/GLM-OCR`, permite testear scripts de conversion de formato (por ejemplo, a otros runtimes) antes de ejecutarlos sobre el checkpoint real.
- Pruebas de compatibilidad de dtype: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar problemas de estabilidad numerica en la integracion.
- Desarrollo de herramientas de inspeccion de modelos: analizar la estructura de configuracion y el grafo de un modelo GLM-OCR reducido con un repo de 0.0 GB.
- Validacion de chat template y tokenizador: probar el renderizado de `chat_template.jinja` y la tokenizacion con el tokenizador real del modelo base, sin necesidad de pesos entrenados.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture GLM-OCR-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, OCR accuracy, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 8,8 M de parametros del fixture; en la practica cabe en CPU.
- GPU recomendadas: no se requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es mas que suficiente si se desea ejecutar en CUDA.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (integracion principal, con `usage.md` y `expectations` en el repo); no se documentan opciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un fixture de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-OCR-mic (este) | 8,8 M (fixture) | no disponible | Fixture de test para integraciones | no disponible | Hugging Face (`huggingface-mic/GLM-OCR-mic`) |
| zai-org/GLM-OCR | no disponible | no disponible | OCR imagen-a-texto real | no disponible | Hugging Face (`zai-org/GLM-OCR`) |
| Otros fixtures de `huggingface-mic` | variable | no disponible | Fixtures de test por modelo | no disponible | Hugging Face (organizacion `huggingface-mic`) |

La comparativa relevante es exclusivamente con el modelo base y con otros fixtures de la misma organizacion; no existen alternativas funcionales comparables porque el artefacto no esta pensado para inferencia real.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y la salida no tiene significado.
- No debe emplearse en produccion ni para evaluar calidad de OCR; las etiquetas `test-artifact` y `mic` lo marcan como artefacto de test.
- La configuracion esta reducida a 2 capas ocultas en el codificador de texto, por lo que el comportamiento numerico no representa al modelo completo.
- No se dispone de informacion sobre licencia, idiomas ni restricciones de uso comercial; debe consultarse la licencia de `zai-org/GLM-OCR` para cualquier uso derivado.
- El repositorio no incluye todos los ficheros generados por el build; algunos deben reconstruirse con `build_fixtures.py`.
- No se han publicado datos de sesgos, alucinacion o rendimiento, al no ser un modelo entrenado.
- Cualquier test que dependa de la calidad de las predicciones fallara por diseno; solo son validos los tests de contrato, forma y ejecucion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/GLM-OCR-mic
- Modelo base: https://huggingface.co/zai-org/GLM-OCR
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/GLM-OCR-mic.html
- Script de barrido (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
