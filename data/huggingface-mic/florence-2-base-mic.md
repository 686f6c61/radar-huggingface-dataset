# huggingface-mic/Florence-2-base-mic

## Resumen

Florence-2-base-mic es un artefacto de prueba (fixture) derivado de `florence-community/Florence-2-base`, publicado por la organizacion `huggingface-mic`. No es un modelo utilizable: se trata de una version "adelgazada" del checkpoint original, con solo 6.470.272 parametros, cuyo proposito es servir como fixture de integracion para validar contratos de ejecucion y expectativas de framework (concretamente Transformers) sin necesidad de cargar el modelo completo.

El repositorio incluye pesos reducidos, ejemplos de uso ejecutables y un directorio de expectativas de framework, todo empaquetado bajo un manifiesto de contrato (`integration.json`). La arquitectura subyacente es la misma que la del modelo original, `Florence2ForConditionalGeneration`, pero con una configuracion drasticamente reducida: el encoder de texto y el decoder de texto tienen solo 1 capa cada uno.

Su relevancia es exclusivamente para ingenieria de pruebas y CI: permite verificar que el pipeline de Transformers carga, ejecuta y produce tensores con los mismos nombres que el checkpoint real, con un coste de recursos minimo. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Florence2ForConditionalGeneration (transformer multimodal, config reducida) |
| Parametros totales | 6.470.272 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float16 (guardado por defecto); finito en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la clase `Florence2ForConditionalGeneration`, la misma arquitectura del checkpoint `florence-community/Florence-2-base`, pero con una configuracion reducida mediante la regla generica de `sweep.py` del repositorio `transformers-mic`: `text encoder_layers = 1` y `text decoder_layers = 1`. Los ficheros de procesador (`added_tokens.json`, `generation_config.json`, `merges.txt`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde el modelo original, de modo que el comportamiento del tokenizador y del preprocesador es identico.

No hay entrenamiento real en el sentido convencional: el fixture se sobreajusto al paso de entrenamiento del contrato (50 pasos). Los pesos aleatorios no superaban la puerta de sensibilidad a la entrada (`input_ids:reverse` movia los logits solo 0.00049 frente al umbral de 0.001), por lo que se realizo un ajuste minimo para que el fixture responda de forma medible a cambios en la entrada. Los nombres de tensores coinciden exactamente con los del checkpoint real, lo que permite validar la carga y la logica de integracion sin ambiguedad. El repositorio incluye `build.json` con las fuentes fijadas, los resultados de las puertas de validacion y los hashes de ficheros.

## Capacidades

- No es un modelo funcional: no genera texto, codigo, matematicas ni descripciones de imagen con calidad util.
- Su capacidad efectiva es actuar como fixture de integracion para el pipeline de Transformers: carga, forward, calculo de perdida y gradientes.
- Verifica que los nombres de tensores del checkpoint real estan presentes y son accesibles.
- Valida la sensibilidad a la entrada mediante la puerta `input_ids:reverse`.
- Comprueba que el modelo es finito en float32, bfloat16 y float16 (forward, loss y gradientes).
- Permite validar el contrato de captioning de imagenes de Florence-2 a nivel de integracion, no de calidad de salida.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues reales.

## Casos de uso

- Integracion continua de Transformers: ejecutar el fixture en la suite de tests para verificar que los cambios en el codigo de carga de Florence-2 no rompen la compatibilidad de tensores, con un coste de memoria minimo.
- Validacion de contratos de framework: comprobar que el directorio `integrations/transformers/expectations` se cumple (formas, dtypes y nombres de tensores) antes de ejecutar el checkpoint completo.
- Pruebas de regresion de tokenizador y preprocesador: al copiarse los ficheros de procesador byte a byte, se puede validar que el pipeline de preprocesado de imagen y texto se comporta igual que con el modelo original.
- Desarrollo de herramientas de inspeccion de modelos: usar el fixture para probar utilidades que recorren pesos, calculan hashes o comparan checkpoints sin descargar el modelo completo.
- Reproduccion de builds: reconstruir el fixture con `python example/build_fixtures.py --fixture Florence-2-base-mic` y comparar hashes contra `build.json` para auditar la procedencia.
- Formacion y demos de ingenieria de pruebas: ilustrar como se construye un fixture representativo de un modelo multimodal con arquitectura y tokenizador reales pero parametros reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba y no esta pensado para evaluacion de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 (6,47 M de parametros); en la practica cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no aplica; cualquier GPU con soporte de float16 sirve, y CPU es suficiente para los tests.
- Cabe en consumer GPU: si, en cualquier modelo (GTX 1650, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: Transformers (uso previsto segun `integrations/transformers/usage.md`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; al ser un fixture, no se caracterizan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Florence-2-base-mic | 6,47 M | no disponible | Fixture de integracion | no disponible | Hugging Face |
| florence-community/Florence-2-base | no disponible en la informacion | no disponible | Modelo multimodal real (captioning, deteccion, etc.) | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de contrato de framework | no disponible | Hugging Face (org. huggingface-mic) |

La comparativa relevante es contra el modelo base del que deriva: mismo tokenizador y preprocesador, misma clase de arquitectura y mismos nombres de tensores, pero con un numero de parametros orders of magnitude menor y sin capacidad funcional real.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos estan sobreajustados a 50 pasos y no producen salidas de calidad.
- Sesgos conocidos: no aplica, al no ser un modelo entrenado para tareas reales.
- Riesgo de alucinacion: irrelevante en la practica, pero cualquier salida sera ruido sin valor semantico.
- Limitaciones de contexto o idioma: no documentadas; el tokenizador es el de Florence-2-base, pero el modelo no aprovecha esa capacidad.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada; debe consultarse el repositorio antes de cualquier uso.
- Caveat para produccion: no desplegar en produccion bajo ninguna circunstancia; esta etiquetado `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos.
- El tamano del repo reportado es 0.0 GB, lo que puede indicar que los pesos no estan materializados en el snapshot o que el calculo se redondea; verificar antes de depender del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/Florence-2-base-mic
- Modelo base: https://huggingface.co/florence-community/Florence-2-base
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Florence-2-base-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
