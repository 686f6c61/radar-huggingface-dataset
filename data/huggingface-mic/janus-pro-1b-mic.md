# huggingface-mic/Janus-Pro-1B-mic

## Resumen

Janus-Pro-1B-mic es un artefacto de prueba publicado por el usuario `huggingface-mic`, no un modelo entrenado. Se trata de una version reducida ("slim fixture") del checkpoint `deepseek-community/Janus-Pro-1B`, generada con pesos aleatorios (semilla 17) para validar contratos de integracion con frameworks. El repositorio conserva la arquitectura `JanusForConditionalGeneration` y los nombres de tensores del modelo original, pero reduce el numero de capas del transformer de texto, del codificador visual y del tokenizador VQ a 2 en cada componente, resultando en 81.912.963 parametros frente a los aproximadamente 1.000 millones del modelo base.

La relevancia de este artefacto es exclusivamente de ingenieria: sirve como fixture reproducible para comprobar que una implementacion de `transformers` carga el modelo, ejecuta el forward, calcula la perdida y propaga gradientes de forma finita en float32, bfloat16 y float16. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. No debe confundirse con Janus-Pro-1B, el modelo multimodal real de DeepSeek capaz de comprension y generacion de imagenes.

El tamano del repositorio (0,2 GB) y la ausencia de pipeline, licencia e idiomas declarados refuerzan su naturaleza de herramienta de CI mas que de modelo desplegable. Cualquier evaluacion de capacidades, calidad o rendimiento sobre este checkpoint carece de sentido: sus pesos son aleatorios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JanusForConditionalGeneration (transformer multimodal con torre de texto, torre de vision y tokenizador VQ), reducida a 2 capas por componente |
| Parametros totales | 81.912.963 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor verifica finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El artefacto replica la clase `JanusForConditionalGeneration` del modelo base, que combina un transformer de texto, un codificador visual y un tokenizador VQ para tareas multimodales de comprension y generacion. En esta version reducida, las tres secciones se han recortado a 2 capas mediante la regla generica de `sweep.py` del proyecto `transformers-mic`. Los ficheros de procesador (`tokenizer.json`, `tokenizer_config.json`, `preprocessor_config.json`, `processor_config.json`, `chat_template.jinja`, `generation_config.json`, `special_tokens_map.json` y las imagenes teaser) se copian byte a byte desde `deepseek-community/Janus-Pro-1B`.

No hubo entrenamiento. Los pesos se inicializan aleatoriamente con semilla 17 y se aceptan porque superan una puerta de sensibilidad a la entrada: toda perturbacion de las entradas del contrato mueve los logits al menos 0,001 (el caso mas debil, `pixel_values:halve`, produce 0,172). El fixture conserva exactamente los mismos nombres de tensores que el checkpoint real, lo que permite validar rutas de carga sin descargar el modelo completo. `build.json` registra fuentes fijadas, resultados de la puerta y hashes de ficheros.

## Capacidades

- Ninguna capacidad funcional de generacion de texto, razonamiento, codigo, matematicas o vision: los pesos son aleatorios y no han sido entrenados.
- Sirve como fixture de integracion para verificar la carga del modelo con `transformers` y la ejecucion del forward, la perdida y los gradientes.
- Valida la sensibilidad de las entradas del contrato (perturbaciones en `input_ids` y `pixel_values`) frente a los logits.
- Comprueba la finitud numerica en float32, bfloat16 y float16.
- No soporta tool calling, agentes, modo thinking ni capacidades multilingues reales.
- Util como caso de prueba para pipelines de CI que necesiten un checkpoint Janus de bajo peso.

## Casos de uso

- Pruebas de integracion en CI: cargar `Janus-Pro-1B-mic` con `transformers` para verificar que la clase `JanusForConditionalGeneration` se instancia y ejecuta sin errores antes de probar con el checkpoint real.
- Validacion de contratos de framework: usar `integration.json` e `integrations/transformers/expectations` para comprobar que una version de `transformers` cumple las expectativas de entrada y salida del modelo.
- Test de regresion numerica: ejecutar el forward en float32, bfloat16 y float16 y comprobar que loss y gradientes son finitos tras cambios en el codigo.
- Desarrollo de utilidades de preprocesado: al copiar los ficheros de procesador byte a byte, permite probar tokenizadores e imagenes de entrada sin descargar el modelo de 1B.
- Formacion y documentacion: ejemplo minimo de como se estructura un repositorio de fixture con manifiesto, procedencia y expectativas ejecutables.
- Validacion de herramientas de empaquetado: comprobar que scripts de conversion o carga manejan correctamente tensores con los mismos nombres que el checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) seria invalida.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (81,9 M de parametros, aproximadamente 164 MB de pesos) mas overhead de activaciones y del procesador visual.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU para pruebas de humo.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU; el repositorio ocupa 0,2 GB.
- Opciones de despliegue: carga directa con `transformers` (es el uso previsto segun `integrations/transformers/usage.md`); no se documentan recetas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al no ser un modelo entrenado, las cifras no serian representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Janus-Pro-1B-mic | 81,9 M | no disponible | Fixture de test (pesos aleatorios) | no disponible | Hugging Face (huggingface-mic) |
| deepseek-community/Janus-Pro-1B | ~1.000 M | no disponible en esta ficha | Modelo multimodal real (comprension y generacion de imagen) | no disponible en esta ficha | Hugging Face (deepseek-community) |
| Otros fixtures de transformers-mic | variable | no disponible | Artefactos de test para contratos de framework | no disponible | Hugging Face (huggingface-mic) |

La comparacion relevante es con el modelo base: mismo grafo y mismos nombres de tensores, pero con capas reducidas y pesos no entrenados. Frente a modelos reales de tamano similar no procede comparacion de rendimiento.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y cualquier salida carece de significado.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- No declara licencia, idiomas ni pipeline, lo que impide evaluar condiciones de uso comercial.
- La configuracion reducida (2 capas por componente) no representa el comportamiento del checkpoint original de 1B.
- Los ficheros de procesador copiados pueden quedar desalineados si el modelo base se actualiza; el autor fija fuentes y hashes en `build.json`.
- No se han publicado benchmarks ni metricas de latencia; no deben inferirse del modelo base.
- Su utilidad depende de la version de `transformers` y del proyecto `transformers-mic`; cambios en las expectativas pueden invalidar el fixture.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Janus-Pro-1B-mic
- Modelo base: https://huggingface.co/deepseek-community/Janus-Pro-1B
- Manifiesto del contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Janus-Pro-1B-mic.html
- Codigo de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
