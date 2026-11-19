# huggingface-mic/wavlm-base-plus-mic

## Resumen

`wavlm-base-plus-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic`, no un modelo utilizable en produccion. Se trata de una version reducida del modelo de extraccion de caracteristicas de audio `microsoft/wavlm-base-plus`, con solo 4,3 millones de parametros frente a los aproximadamente 94 millones del original, y pesos generados aleatoriamente (semilla 17) sin entrenamiento alguno. El propio autor lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

El proposito del repositorio es servir como fixture de integracion para el proyecto `transformers-mic`: valida que el pipeline de carga, ejecucion y comprobacion de contratos funcione con la arquitectura WavLM sin necesidad de descargar ni ejecutar el checkpoint completo. Incluye el manifiesto de contrato (`integration.json`), la documentacion de uso con Transformers y el directorio de expectativas del framework, ademas de los pesos reducidos.

La relevancia practica es, por tanto, exclusivamente de ingenieria y test: no debe emplearse para transcripcion, clasificacion de audio, diarizacion ni ninguna tarea real de speech. Cualquier evaluacion de calidad sobre este modelo carece de sentido, ya que sus pesos no han sido entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WavLMModel (transformer de audio tipo WavLM), config reducida a 2 capas ocultas |
| Parametros totales | 4.335.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; la entrada es forma de onda, no texto) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es WavLM, un transformer de audio orientado a representaciones auto-supervisadas del habla. Este fixture conserva la clase `WavLMModel` y los mismos nombres de tensores que el checkpoint real `microsoft/wavlm-base-plus`, pero con una configuracion reducida mediante la regla generica de `sweep.py` del proyecto `transformers-mic`, que en este caso deja `num_hidden_layers = 2`. Los ficheros de procesador (`preprocessor_config.json`) se copian byte a byte del modelo original.

No hay entrenamiento. Los pesos son aleatorios (semilla 17) y unicamente pasaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, `input_values:halve`, produce 0,278). El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture `11ccff6756df` cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el proceso de reduccion. El repositorio incluye pesos, uso y expectativas; el resto de ficheros se regeneran con `python example/build_fixtures.py --fixture wavlm-base-plus-mic`.

## Capacidades

- Extraccion de caracteristicas de audio a nivel de contrato: el modelo expone la interfaz de `WavLMModel` para procesar formas de onda y devolver representaciones ocultas, pero con pesos aleatorios y solo 2 capas.
- Verificacion de integracion con Transformers: permite comprobar que la carga del checkpoint, el procesador y la ejecucion del forward funcionan segun lo esperado por el framework.
- Comprobacion de dtypes: valida comportamiento finito en float32, bfloat16 y float16.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues.
- No dispone de modo thinking ni de ninguna capacidad especial de inferencia util.

## Casos de uso

- Test de integracion en CI del proyecto `transformers-mic`: ejecutar el fixture en la suite de pruebas para verificar que la carga de un checkpoint WavLM y el forward producen resultados finitos sin descargar el modelo completo de 94M de parametros.
- Validacion de contratos de API: comprobar que `integration.json` y el directorio de expectativas del framework coinciden con el comportamiento real del modelo reducido.
- Pruebas de compatibilidad de dtypes: verificar que el pipeline maneja correctamente float32, bfloat16 y float16 con este fixture antes de aplicar los mismos cambios al checkpoint real.
- Desarrollo de herramientas de reduccion de modelos: servir como caso de referencia del proceso `sweep.py` y de la generacion de fixtures con `build_fixtures.py`.
- Pruebas de regresion de nombres de tensores: al conservar los mismos nombres que `microsoft/wavlm-base-plus`, permite detectar roturas en mapeos de pesos y en la conversion de checkpoints.
- Validacion de sensibilidad a la entrada: usar la puerta de perturbacion documentada para comprobar que los cambios en el preprocesado afectan a los logits de forma medible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios y sin entrenamiento, cualquier metrica de calidad (WER, exactitud en clasificacion, etc.) seria irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (4,3M de parametros, unos 17 MB de pesos), por lo que cabe en cualquier GPU consumer.
- GPU recomendadas: cualquiera; el modelo puede ejecutarse en CPU sin problema.
- Cabe en consumer GPU: si, en todas, incluidas integradas.
- Opciones de despliegue: Transformers (uso documentado en `integrations/transformers/usage.md`); el resto de frameworks no estan documentados para este fixture.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `huggingface-mic/wavlm-base-plus-mic` | 4.335.960 | no disponible | no disponible | Fixture de test |
| `microsoft/wavlm-base-plus` | ~94M (no confirmado en la informacion) | no disponible | no disponible | Extraccion de caracteristicas de audio real |
| Otros fixtures de `huggingface-mic` | no disponible | no disponible | no disponible | Test de integracion |

La unica comparacion significativa es con el modelo base del que deriva: mismo nombre de tensores y misma arquitectura, pero con 2 capas en lugar de la configuracion completa y pesos aleatorios en vez de entrenados.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y el autor lo etiqueta como `test-artifact`; no debe usarse para ninguna tarea real de audio.
- Sesgos conocidos: no aplica, al no haber entrenamiento; no obstante, no puede afirmarse nada sobre sesgos de un modelo sin datos.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero cualquier salida del modelo es esencialmente ruido.
- Limitaciones de contexto o idioma: no disponible; el modelo no procesa texto.
- Restricciones de licencia para uso comercial: la licencia no esta disponible en la informacion proporcionada; debe consultarse el repositorio antes de cualquier uso.
- Caveat de produccion: no desplegar. Su unico uso legitimo es como fixture en suites de test.
- El repositorio es de 0,1 GB y no incluye todos los ficheros necesarios; algunos deben regenerarse con `build_fixtures.py`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/wavlm-base-plus-mic
- Modelo base: https://huggingface.co/microsoft/wavlm-base-plus
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/wavlm-base-plus-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reduccion `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/wavlm-base-plus-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/wavlm-base-plus-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/wavlm-base-plus-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/wavlm-base-plus-mic/blob/main/build.json
