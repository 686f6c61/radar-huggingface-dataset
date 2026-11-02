# huggingface-mic/Muse-Glimmer-30B-mic

## Resumen

Muse-Glimmer-30B-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, no un modelo entrenado ni utilizable. Se presenta como una version reducida ("slim") del checkpoint `meta-models/Muse-Glimmer-30B`, con 26,2 millones de parametros reales frente a los aproximadamente 30 mil millones que sugiere el nombre del modelo base. Su proposito es servir como fixture de integracion para validar contratos de uso y expectativas de frameworks (Transformers) sin necesidad de descargar ni ejecutar el modelo completo.

El repositorio incluye pesos reducidos, documentacion de uso ejecutable y un directorio de expectativas del framework, todo generado mediante un script de reduccion (`sweep.py`) que conserva la arquitectura `MuseGlimmerForConditionalGeneration` pero con solo 2 capas en el codificador de texto y 2 en el de vision. Los pesos son aleatorios (semilla 17) y no han pasado por entrenamiento alguno; unicamente superaron una puerta de sensibilidad de entrada que verifica que las perturbaciones en las entradas mueven los logits.

Es relevante exclusivamente en el contexto de pruebas de infraestructura de modelos multimodales: permite a desarrolladores validar pipelines de carga, tokenizacion, procesamiento de imagenes y ejecucion en Transformers con un coste computacional minimo y sin depender del checkpoint real. La etiqueta `test-artifact` lo excluye explicitamente de busquedas de modelos candidatos para uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MuseGlimmerForConditionalGeneration (transformer multimodal texto+vision, version reducida) |
| Parametros totales | 26.163.904 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio copia el fichero LICENSE del modelo base, pero su contenido no se especifica) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura corresponde a `MuseGlimmerForConditionalGeneration`, un modelo multimodal que combina un codificador de texto y un codificador de vision. En esta fixture, la configuracion se ha reducido mediante la regla generica de `sweep.py`: 2 capas ocultas en el texto y 2 capas ocultas en la vision. Los nombres de tensores coinciden con los del checkpoint real `meta-models/Muse-Glimmer-30B`, de modo que el fixture replica la estructura de parametros del modelo original a menor escala.

No hubo entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y se validaron con una puerta de sensibilidad de entrada: cada perturbacion de las entradas del contrato debe desplazar los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produjo 0,0534). Los ficheros de procesador (`tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `generation_config.json`, `processor_config.json`, `LICENSE`, `USAGE_POLICY.md`) se copiaron byte a byte desde el modelo base. Los pesos se guardaron en bfloat16, el dtype por defecto de carga del checkpoint original, y se verifico que son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- Ejecucion de forward pass en Transformers con la clase `MuseGlimmerForConditionalGeneration`.
- Procesamiento multimodal de texto e imagenes a traves del procesador copiado del modelo base (tokenizador y `processor_config.json`).
- Validacion de contratos de integracion: el repositorio incluye `integration.json` con el manifiesto de contrato y un directorio `integrations/transformers/expectations`.
- Generacion de logits y calculo de loss y gradientes (verificado en float32, bfloat16 y float16).
- No soporta tool calling, agentes, razonamiento ni capacidades multilingues reales: al no estar entrenado, no produce salidas coherentes.
- No es un modelo utilizable para inferencia productiva; su unica funcion es la prueba de infraestructura.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el modelo con `AutoModelForConditionalGeneration` y verificar que la clase `MuseGlimmerForConditionalGeneration` se resuelve correctamente sin descargar el checkpoint de 30B, reduciendo el tiempo de CI a segundos.
- Validacion de pipelines multimodales: comprobar que el procesador (tokenizador mas procesador de imagen) acepta entradas de texto e imagen y genera tensores con las formas esperadas, usando los ficheros de procesador copiados del modelo base.
- Test de regresion de contratos: el manifiesto `integration.json` y el directorio de expectativas permiten verificar que cambios en el framework no rompen la interfaz esperada por el modelo.
- Pruebas de precision numerica: al ser finito en float32, bfloat16 y float16, sirve para validar rutas de mixed precision y comprobar que no aparecen NaN o inf en forward, loss y gradientes.
- Desarrollo de herramientas de reduccion de modelos: el repositorio documenta el proceso de shrink (`sweep.py`, `build_fixtures.py`) y sirve como ejemplo reproducible para crear fixtures de otros checkpoints.
- Verificacion de plantillas de chat: el `chat_template.jinja` copiado byte a byte permite probar el formateo de conversaciones multi-turno sin cargar el modelo completo.
- Integracion continua en proyectos que envuelven modelos multimodales: usar el fixture como sustituto ligero en tests unitarios que no requieren calidad de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El repositorio completo ocupa 0,2 GB y los pesos en bfloat16 suman aproximadamente 52 MB (26,2M parametros x 2 bytes).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien funciona en CPU sin problemas de rendimiento relevantes.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en GPUs integradas o en CPU.
- Opciones de despliegue: Transformers con `MuseGlimmerForConditionalGeneration` (la unica ruta documentada en el repositorio). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la latencia es practicamente despreciable, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| Muse-Glimmer-30B-mic | 26,2M (fixture) | no disponible | Fixture de test | no disponible |
| meta-models/Muse-Glimmer-30B | ~30B (segun nombre) | no disponible | Modelo multimodal real | no disponible |
| Otros fixtures de integracion | variable | no disponible | Test de frameworks | variable |

La comparacion con alternativas reales no es significativa porque este repositorio no es un modelo funcional. Frente al checkpoint base `meta-models/Muse-Glimmer-30B`, la diferencia clave es el tamano (26,2M frente a ~30B) y la ausencia de entrenamiento; frente a otros fixtures de la misma organizacion, comparte el enfoque de replicar la estructura de tensores del modelo original con pesos aleatorios y ficheros de procesador copiados.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no han sido entrenados; las salidas no tienen coherencia semantica.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion bajo ninguna circunstancia.
- La licencia no esta disponible en la informacion proporcionada; el repositorio copia el fichero `LICENSE` y `USAGE_POLICY.md` del modelo base, pero su contenido no se detalla, por lo que no se puede confirmar el uso comercial.
- La configuracion reducida (2 capas de texto, 2 de vision) no refleja el comportamiento del modelo base; los resultados de pruebas de integracion no garantizan que el checkpoint completo funcione igual.
- Riesgo de confusion: el nombre "30B" puede inducir a error sobre el tamano real (26,2M parametros).
- No hay informacion sobre sesgos, idiomas soportados ni limitaciones de contexto porque el modelo no ha sido entrenado ni evaluado.
- El repositorio solo incluye pesos reducidos, uso y expectativas; otros ficheros deben regenerarse con `python example/build_fixtures.py --fixture Muse-Glimmer-30B-mic`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/Muse-Glimmer-30B-mic
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/Muse-Glimmer-30B-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Muse-Glimmer-30B-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Muse-Glimmer-30B-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Muse-Glimmer-30B-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Muse-Glimmer-30B-mic.html
- Script de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
