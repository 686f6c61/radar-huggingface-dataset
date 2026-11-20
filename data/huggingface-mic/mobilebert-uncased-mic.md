# huggingface-mic/mobilebert-uncased-mic

## Resumen

`mobilebert-uncased-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de una version "adelgazada" del checkpoint `google/mobilebert-uncased` de Google, reducida a 2.069.180 parametros mediante una regla generica de reduccion de configuracion (2 capas ocultas en lugar de las 24 originales) y con pesos inicializados aleatoriamente con semilla 17.

El proposito del repositorio es servir como contrato de integracion y como fixture de pruebas para frameworks (concretamente para el proyecto `transformers-mic`). Incluye los pesos reducidos, ejemplos de uso con Transformers, un directorio de "expectations" del framework y un manifiesto de contrato (`integration.json`), ademas de metadatos de procedencia en `build.json`. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Por tanto, esta ficha documenta un objeto tecnico de validacion, no un modelo de lenguaje funcional. Cualquier evaluacion de capacidades, benchmarks o calidad de generacion carece de sentido aqui: los pesos son aleatorios y el modelo no ha sido entrenado. Su relevancia es para ingenieros que mantienen pipelines de integracion continua o suites de pruebas de frameworks de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileBERT (`MobileBertForPreTraining`), transformer con cuellos de botella invertidos |
| Parametros totales | 2.069.180 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (tokenizer heredado de `google/mobilebert-uncased`, presumiblemente ingles uncased) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura subyacente es MobileBERT, un transformer compacto disenado por Google para tareas de comprension del lenguaje con recursos limitados. La innovacion original de MobileBERT es el uso de cuellos de botella invertidos (inverted bottlenecks) entre bloques y el entrenamiento por destilacion desde BERT-Large. Sin embargo, este repositorio concreto no contiene ese modelo entrenado: es una reduccion de configuracion con `num_hidden_layers = 2` aplicada por la regla generica de `sweep.py` del proyecto `transformers-mic`.

Los pesos son aleatorios (semilla 17) y no han pasado por entrenamiento alguno. Segun la model card, superaron una "puerta de sensibilidad a la entrada": cada perturbacion de las entradas del contrato movio los logits al menos 0.001 (el caso mas debil, `input_ids:reverse`, dio 0.162). Esto garantiza que el grafo computacional responde a las entradas, condicion necesaria para pruebas de integracion, pero no implica ninguna capacidad aprendida. Los nombres de tensores coinciden con los del checkpoint real y los ficheros de procesador (`tokenizer.json`, `vocab.txt`) se copiaron byte a byte desde `google/mobilebert-uncased`.

## Capacidades

- No dispone de capacidades de generacion, razonamiento, codigo ni matematicas: los pesos son aleatorios y no hay entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues verificadas; el tokenizer procede de un modelo uncased en ingles.
- Capacidad efectiva: validar contratos de integracion, comprobar formas de tensores, dtypes y flujos de carga en frameworks.
- Sirve como fixture reproducible para pruebas de regresion en pipelines de CI.

## Casos de uso

- Pruebas de integracion en `transformers-mic`: el repositorio incluye `integrations/transformers/usage.md` y `integrations/transformers/expectations` para verificar que el framework carga el modelo, ejecuta el forward y produce salidas con las formas esperadas.
- Validacion de contrato de tensores: al conservar los mismos nombres de tensores que `google/mobilebert-uncased`, permite comprobar que una implementacion mapea correctamente cada parametro sin descargar el checkpoint completo.
- Pruebas de compatibilidad de dtypes: la model card certifica finitud en float32, bfloat16 y float16 (forward, loss y gradientes), lo que permite usarlo en suites que verifican mixed precision.
- CI de bajo coste: con 2,1 M de parametros y un repo de 0,0 GB, se puede descargar y ejecutar en cualquier runner sin GPU, acelerando pipelines de prueba.
- Verificacion de tokenizer: los ficheros `tokenizer.json` y `vocab.txt` son identicos a los del modelo real, de modo que se puede probar el preprocesado sin cargar el modelo completo.
- Reproducibilidad de fixtures: `build.json` registra fuentes fijadas, resultados de la puerta de sensibilidad y hashes de ficheros, lo que permite auditar y reconstruir el artefacto con `python example/build_fixtures.py --fixture mobilebert-uncased-mic`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, GLUE, SQuAD, etc.) seria meaningless y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (2,07 M de parametros, aproximadamente 8 MB de pesos); en la practica cabe en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (incluso integradas) es suficiente.
- Cabe en cualquier GPU consumer, incluida la gama baja, y en entornos sin GPU.
- Opciones de despliegue: carga directa con Transformers (`MobileBertForPreTraining`); no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI, y su uso como modelo de servicio no tiene sentido.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia es del orden de microsegundos a milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/mobilebert-uncased-mic` | 2,07 M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| `google/mobilebert-uncased` | ~25 M | 512 tokens (BERT estandar) | Modelo entrenado para NLU | Apache 2.0 (segun el modelo original de Google) | Hugging Face |
| `google/bert_uncased_L-2_H-128_A-2` | ~4,4 M | 512 tokens | Modelo pequeno entrenado | Apache 2.0 | Hugging Face |

La comparacion relevante es con el checkpoint original `google/mobilebert-uncased`: este fixture reduce el numero de capas a 2 y sustituye los pesos entrenados por pesos aleatorios, por lo que no es intercambiable en tareas de inferencia. Frente a modelos pequenos entrenados como TinyBERT o el BERT de 2 capas de Google, carece de cualquier capacidad aprendida.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado semantico.
- La model card lo marca explicitamente como `test-artifact`; no debe emplearse en produccion ni en evaluaciones de calidad.
- Licencia no disponible: no se puede asumir uso comercial permitido; hay que consultar el repositorio y el modelo base antes de cualquier redistribucion.
- Idiomas y contexto no documentados; el tokenizer heredado es uncased en ingles.
- No hay garantia de mantenimiento ni de soporte por parte del autor.
- Riesgo de confusion: el nombre puede llevar a confundirlo con un modelo funcional; conviene revisar la etiqueta `test-artifact` antes de integrarlo.
- No apto para benchmarking ni para comparaciones de rendimiento con modelos reales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/mobilebert-uncased-mic
- Modelo base: https://huggingface.co/google/mobilebert-uncased
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/mobilebert-uncased-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/mobilebert-uncased-mic/blob/main/integrations/transformers/usage.md
- Expectativas del framework: https://huggingface.co/huggingface-mic/mobilebert-uncased-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/mobilebert-uncased-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mobilebert-uncased-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
