# huggingface-mic/Falcon-H1-Tiny-90M-Instruct-mic

## Resumen

Falcon-H1-Tiny-90M-Instruct-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, no un modelo entrenado. Se construye a partir de tiiuae/Falcon-H1-Tiny-90M-Instruct mediante un proceso de reduccion de configuracion que conserva la arquitectura FalconH1ForCausalLM pero disminuye el numero de capas ocultas a 2, resultando en 2.479.280 parametros reales segun los safetensors. Los pesos son aleatorios (semilla 17) y no han pasado por entrenamiento alguno.

El proposito del repositorio es servir como fixture de integracion para el proyecto transformers-mic: un conjunto de pesos ligeros que reproducen la misma firma de tensores, el mismo tokenizador y la misma plantilla de chat que el checkpoint original, de modo que las herramientas de validacion de contratos de Transformers puedan ejecutarse de forma rapida y determinista. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Por tanto, este modelo no es utilizable para generacion de texto, razonamiento ni ninguna tarea de inferencia real. Su relevancia es exclusivamente de ingenieria: permite validar pipelines de integracion, comprobar expectativas de frameworks y verificar la sensibilidad de entradas sin descargar el checkpoint completo de 90M. Cualquier evaluacion de capacidades, benchmarks o calidad de salida carece de sentido sobre este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FalconH1ForCausalLM (transformer causal, familia Falcon-H1) |
| Parametros totales | 2.479.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura declarada es FalconH1ForCausalLM, la misma clase que emplea el checkpoint base tiiuae/Falcon-H1-Tiny-90M-Instruct. El fixture se genera aplicando la regla generica de reduccion de sweep.py del repositorio transformers-mic, que en este caso fija num_hidden_layers a 2. Los nombres de tensores coinciden exactamente con los del checkpoint real, y los ficheros de procesador (chat_template.jinja, generation_config.json, special_tokens_map.json, tokenizer.json y tokenizer_config.json) se copian byte a byte desde el modelo original.

No existe entrenamiento: los pesos son aleatorios con semilla 17. Para justificar su validez como fixture, el proceso de construccion aplica una puerta de sensibilidad a las entradas, exigiendo que cada perturbacion de las entradas del contrato mueva los logits al menos 0,001; la perturbacion mas debil (attention_mask:all_ones) produjo un desplazamiento de 0,0116. El artefacto se guarda en bfloat16, el dtype con el que carga por defecto el modelo base, y se verifica que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El identificador de fixture es edc38f8f4e36 y build.json registra fuentes fijadas, resultados de la puerta y hashes de ficheros.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Reproduce la firma de tensores del checkpoint Falcon-H1-Tiny-90M-Instruct para validacion de integraciones.
- Incluye tokenizador y plantilla de chat copiados del modelo base, utiles para probar pipelines de tokenizacion.
- Sirve como fixture de contrato para el proyecto transformers-mic y sus expectativas de framework.
- Permite verificar sensibilidad de entradas (perturbaciones de attention_mask y similares) sin cargar el modelo completo.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento de forma real.

## Casos de uso

- Validacion de integraciones de Transformers: ejecutar el contrato de FalconH1ForCausalLM con un checkpoint de 2,5M parametros para comprobar que la carga, el forward y el loss funcionan antes de pasar al modelo real de 90M.
- Pruebas de CI en transformers-mic: usar el fixture como caso de regresion determinista en pipelines de integracion continua, con tiempos de descarga y ejecucion minimos.
- Verificacion de plantillas de chat y tokenizador: al copiarse byte a byte los ficheros de procesador del modelo base, se pueden probar flujos de formateo de conversaciones sin depender del checkpoint completo.
- Comprobacion de dtypes: validar que el modelo es finito en float32, bfloat16 y float16 en forward, loss y gradientes, util para detectar regresiones numericas en frameworks.
- Pruebas de sensibilidad de entradas: reproducir la puerta que exige un desplazamiento minimo de logits ante perturbaciones, como base para tests automatizados de contratos de modelo.
- Desarrollo de herramientas de introspeccion: inspeccionar nombres de tensores y estructura de config de Falcon-H1 sin descargar los 90M de parametros del checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto es un fixture con pesos aleatorios y no ha sido evaluado en tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (2,48M parametros); el checkpoint completo del modelo base de 90M requiere aproximadamente 180 MB en bfloat16.
- GPU recomendadas: cualquier GPU consumer o incluso CPU es suficiente para ejecutar el fixture; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: Transformers con la clase FalconH1ForCausalLM; el resto de frameworks (vLLM, llama.cpp, Ollama, TGI) no estan documentados para este artefacto.
- Latencia y throughput: no disponible; al ser un fixture de validacion no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Falcon-H1-Tiny-90M-Instruct-mic | 2,48M | no disponible | Fixture de integracion (pesos aleatorios) | no disponible | Hugging Face |
| tiiuae/Falcon-H1-Tiny-90M-Instruct | 90M (aprox.) | no disponible | Modelo instructivo real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Validacion de contratos | no disponible | Hugging Face |

La comparativa solo es significativa frente al checkpoint base, del que este artefacto es una reduccion estructural. Frente a modelos reales de la misma categoria (90M instructivos) no procede comparacion de rendimiento porque el fixture no ha sido entrenado.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado; no debe usarse para inferencia, generacion ni evaluacion de calidad.
- Etiquetado como `test-artifact`: los autores lo excluyen deliberadamente de busquedas de modelos candidatos.
- La licencia no esta declarada en la informacion disponible; conviene consultar la del modelo base antes de cualquier reutilizacion.
- El contexto, los idiomas y las capacidades multilingues no estan documentados para este artefacto.
- No apto para produccion: cualquier despliegue real debe emplear tiiuae/Falcon-H1-Tiny-90M-Instruct.
- La configuracion reducida (2 capas) no representa el comportamiento del modelo de 90M, aunque conserve la firma de tensores.
- Riesgo de confusion: el nombre incluye "Instruct" pero el artefacto no ha sido instruido ni ajustado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Falcon-H1-Tiny-90M-Instruct-mic
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-Tiny-90M-Instruct
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/Falcon-H1-Tiny-90M-Instruct-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Falcon-H1-Tiny-90M-Instruct-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Falcon-H1-Tiny-90M-Instruct-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Falcon-H1-Tiny-90M-Instruct-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Falcon-H1-Tiny-90M-Instruct-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio transformers-mic (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
