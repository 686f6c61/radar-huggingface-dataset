# huggingface-mic/Florence-2-base-mic

## Resumen

Florence-2-base-mic es un artefacto de prueba (fixture) derivado de `florence-community/Florence-2-base`, publicado por la organizacion `huggingface-mic`. No es un modelo usable: se trata de una version "adelgazada" del checkpoint original, con solo 6,47 millones de parametros, construida para validar contratos de integracion con Transformers y servir como banco de pruebas reproducible. La model card lo etiqueta explicitamente como `test-artifact` y advierte que no debe emplearse como modelo candidato en busquedas ni en produccion.

El proposito del repositorio es triple: incluir pesos reducidos, documentacion de uso ejecutable y las expectativas del framework en un unico lugar. El modelo conserva la arquitectura `Florence2ForConditionalGeneration` del original, pero con una configuracion drastica: una sola capa en el encoder de texto y una sola capa en el decoder de texto. Los ficheros del procesador (tokenizer, `generation_config.json`, `preprocessor_config.json`, etc.) se copian byte a byte desde el checkpoint base.

Su relevancia es metodologica, no funcional: permite a los mantenedores de integraciones comprobar que el pipeline de carga, tokenizacion y ejecucion funciona con pesos de tamano minimo antes de validar contra el modelo real. Cualquier evaluacion de capacidades, benchmarks o calidad de generacion carece de sentido con este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Florence2ForConditionalGeneration` (encoder-decoder multimodal, configuracion reducida) |
| Parametros totales | 6.470.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo replica la clase `Florence2ForConditionalGeneration` de Transformers, con la misma nomenclatura de tensores que el checkpoint real `florence-community/Florence-2-base`. La reduccion se aplica mediante la regla generica de `sweep.py` del repositorio `transformers-mic`: `text encoder_layers = 1` y `text decoder_layers = 1`. Los ficheros del procesador (`added_tokens.json`, `generation_config.json`, `merges.txt`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copian sin modificacion desde el modelo base.

No hay entrenamiento en el sentido habitual. El fixture se sobreajusta al paso de entrenamiento del contrato (50 pasos) porque los pesos aleatorios no superaban la puerta de sensibilidad a la entrada: la prueba `input_ids:reverse` solo desplazaba los logits 0,00049, por debajo del umbral de 0,001. Los pesos se guardan en float16, el dtype por defecto de carga del checkpoint original, y se verifica que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16. El `build.json` registra las fuentes fijadas, los resultados de las puertas y los hashes de los ficheros.

## Capacidades

- No es un modelo funcional: la model card indica explicitamente que es un artefacto de prueba y no un modelo usable.
- Conserva la interfaz de `Florence2ForConditionalGeneration`, por lo que sirve para validar la carga del modelo, del processor y la ejecucion del forward.
- Los ficheros de tokenizer y preprocesado son identicos a los de `Florence-2-base`, lo que permite probar el pipeline de tokenizacion con el vocabulario real.
- No se debe esperar generacion de texto, captioning, deteccion de objetos, OCR ni ninguna otra capacidad multimodal real.
- No hay soporte verificado de tool calling, agentes ni modos de razonamiento.

## Casos de uso

- Validacion de integraciones con Transformers: cargar el fixture en CI para comprobar que la clase `Florence2ForConditionalGeneration` y el processor asociado se instancian sin errores antes de ejecutar contra el checkpoint completo.
- Pruebas de contrato de tokenizer: al copiar los ficheros del processor byte a byte, permite verificar que la tokenizacion de entradas de texto e imagen produce los mismos ids que el modelo base.
- Smoke tests de pipelines de inferencia: ejecutar un forward con pesos minimos para detectar roturas en el codigo de orquestacion (vLLM, TGI, scripts propios) sin consumir VRAM ni tiempo de descarga del modelo real.
- Verificacion de dtypes: comprobar que el modelo produce salidas finitas en float32, bfloat16 y float16, util para validar rutas de mixed precision.
- Reproducibilidad de fixtures: el `build.json` y el script `build_fixtures.py` permiten reconstruir el artefacto y auditar hashes de ficheros y fuentes fijadas.
- Formacion y documentacion interna: ejemplo didactico de como reducir un checkpoint multimodal conservando nombres de tensores e interfaz publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor indica que es un artefacto de prueba y no un modelo usable, por lo que cualquier metrica de calidad seria enganosa.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 (6,47 M de parametros, aproximadamente 13 MB de pesos) mas el coste del processor y del encoder visual, no cuantificado en la informacion disponible.
- GPU recomendadas: cualquier GPU consumer moderna es sobrada; el cuello de botella no es el modelo sino el pipeline de validacion.
- Cabe en cualquier GPU consumer, e incluso en CPU, para las pruebas de contrato previstas.
- Opciones de despliegue: Transformers (ruta validada por el autor); vLLM, llama.cpp, Ollama y TGI no estan verificados en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un fixture, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Florence-2-base-mic | 6,47 M | no disponible | Fixture de test | no disponible | Hugging Face |
| florence-community/Florence-2-base | no disponible en la informacion proporcionada | no disponible | Modelo multimodal real (captioning, deteccion, OCR) | no disponible | Hugging Face |
| Otros fixtures `transformers-mic` | variable | no disponible | Validacion de contratos de integracion | no disponible | Hugging Face |

La comparativa solo es significativa frente al modelo base: el fixture comparte arquitectura, processor y nombres de tensores, pero no capacidades. Frente a otros modelos multimodales de la misma categoria (por ejemplo, variantes de Florence-2 large o PaliGemma), la comparacion carece de sentido porque el artefacto no esta pensado para inferencia real.

## Limitaciones y advertencias

- No es un modelo usable: la model card lo etiqueta como `test-artifact` y advierte que debe quedar fuera de busquedas de modelos candidatos.
- Las capacidades reales de Florence-2 (captioning, deteccion, OCR, grounding) no estan presentes en este checkpoint reducido.
- Sesgos conocidos: no disponibles; al no haber entrenamiento real, no se han evaluado sesgos.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero cualquier salida generada sera ruido sin valor semantico.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada; hay que consultar la del modelo base `florence-community/Florence-2-base` antes de cualquier uso derivado.
- El fixture esta sobreajustado a 50 pasos de entrenamiento y supera por poco la puerta de sensibilidad a la entrada (0,00049 frente al umbral 0,001 con pesos aleatorios), lo que refuerza su caracter artificial.
- No debe incluirse en pipelines de produccion, evaluaciones de calidad ni comparativas de rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Florence-2-base-mic
- Modelo base: https://huggingface.co/florence-community/Florence-2-base
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Florence-2-base-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
