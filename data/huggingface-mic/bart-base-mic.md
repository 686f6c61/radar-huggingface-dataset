# huggingface-mic/bart-base-mic

## Resumen

`bart-base-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en Hugging Face. No se trata de un modelo utilizable para inferencia real, sino de una version reducida ("slim") del checkpoint `facebook/bart-base` pensada para validar contratos de integracion y expectativas de frameworks (en concreto, Transformers). El propio autor lo etiqueta como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

El modelo conserva la arquitectura `BartForConditionalGeneration` (transformer encoder-decoder) pero con una configuracion reducida: 2 capas de encoder y 2 de decoder, lo que da un total de 3.566.233 parametros. Los ficheros de procesador (`merges.txt`, `tokenizer.json`, `vocab.json`) se copian byte a byte desde `facebook/bart-base`, y los nombres de tensores coinciden con los del checkpoint original, de modo que sirve como sustituto ligero en pruebas de integracion.

Su relevancia es puramente de ingenieria: permite ejecutar pipelines de CI y validaciones de compatibilidad con Transformers sin descargar ni cargar el BART-base completo. No debe confundirse con un modelo de produccion ni usarse para tareas de NLP reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (BART, `BartForConditionalGeneration`) |
| Parametros totales | 3.566.233 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un transformer encoder-decoder con la misma estructura que BART, pero con el numero de capas reducido a 2 en el encoder y 2 en el decoder mediante la regla generica de reduccion de `sweep.py` del repositorio `transformers-mic`. Los ficheros de tokenizacion se copian sin modificacion desde `facebook/bart-base`, y los nombres de tensores coinciden exactamente con los del checkpoint original.

No es un modelo entrenado en el sentido habitual: los pesos se han sobreajustado ("overfit") al paso de entrenamiento del contrato (60 pasos) para superar la puerta de sensibilidad a la entrada, ya que pesos aleatorios no la superaban (`input_ids:reverse` movia los logits solo 0.00087 frente a un umbral de 0.001). Los pesos son finitos en float32, bfloat16 y float16 (forward, loss y gradientes). No hay informacion sobre dataset, tokens de entrenamiento ni tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Ejecucion de pruebas de integracion con Transformers: el repositorio incluye `integration.json`, `integrations/transformers/usage.md` e `integrations/transformers/expectations` para validar contratos de framework.
- Verificacion de compatibilidad de nombres de tensores con `facebook/bart-base`.
- Pruebas de sensibilidad a la entrada (gate `input_ids:reverse`).
- Pruebas de estabilidad numerica en float32, bfloat16 y float16.
- No soporta generacion de texto utilizable, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues reales: es un artefacto de test.

## Casos de uso

- CI de integracion con Transformers: cargar el fixture en pipelines de integracion continua para comprobar que la version de Transformers carga correctamente un `BartForConditionalGeneration` sin descargar el BART-base completo (3.5M parametros frente a los ~139M del original).
- Validacion de contratos de framework: usar `integration.json` e `integrations/transformers/expectations` para verificar que la API y el comportamiento esperado del framework coinciden con lo declarado.
- Pruebas de tokenizacion: al copiar `merges.txt`, `tokenizer.json` y `vocab.json` byte a byte desde `facebook/bart-base`, permite validar pipelines de tokenizacion identicos a los del modelo real.
- Pruebas de estabilidad numerica: ejecutar forward, loss y gradientes en float32, bfloat16 y float16 para detectar regresiones de precision en el framework.
- Pruebas de sensibilidad a la entrada: reproducir el gate `input_ids:reverse` para comprobar que los cambios en la entrada mueven los logits por encima del umbral (0.001).
- Validacion de carga de safetensors: comprobar que un cargador de pesos safetensors resuelve correctamente los nombres de tensores de BART sin necesitar el checkpoint completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de validacion es el gate de sensibilidad a la entrada: `input_ids:reverse` mueve los logits 0.00087 en pesos aleatorios (por debajo del umbral 0.001), lo que motivo el sobreajuste a 60 pasos del contrato.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 para 3.566.233 parametros (unos 14 MB de pesos); cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquiera; no requiere aceleracion dedicada. Una RTX 4090, A100 o H100 estan sobredimensionadas para este fixture.
- Cabe en GPU consumer: si, en todas, e incluso en CPU.
- Opciones de despliegue: Transformers (carga directa de safetensors); no se documentan opciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Uso previsto |
|---|---|---|---|---|---|
| `huggingface-mic/bart-base-mic` | 3.566.233 | no disponible | no disponible | Hugging Face | Fixture de test |
| `facebook/bart-base` | ~139M (no confirmado en la informacion) | no disponible | no disponible | Hugging Face | Modelo BART base |
| Otros fixtures `*-mic` de `huggingface-mic` | variable | no disponible | no disponible | Hugging Face | Fixtures de test |

La comparativa relevante es con el checkpoint original `facebook/bart-base`: mismo contrato de tensores y mismo tokenizador, pero con 2 capas de encoder y 2 de decoder en lugar de la configuracion completa. No se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- Es un artefacto de test (`test-artifact`), no un modelo utilizable: no genera texto de calidad ni resuelve tareas de NLP.
- Los pesos estan sobreajustados a 60 pasos del contrato, no entrenados para generalizar.
- No hay informacion sobre licencia, idiomas ni contexto, por lo que no puede evaluarse su uso comercial.
- No debe incluirse en busquedas de modelos candidatos ni en comparativas de rendimiento reales.
- El tamano del repo figura como 0.0 GB y el pipeline como no disponible, lo que refuerza su caracter de fixture.
- Cualquier metrica de calidad (perplejidad, MMLU, etc.) seria irrelevante para este artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/bart-base-mic
- Modelo base: https://huggingface.co/facebook/bart-base
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/bart-base-mic.html
- Manifiesto de contrato: `integration.json` (dentro del repo)
- Uso con Transformers: `integrations/transformers/usage.md` (dentro del repo)
- Expectativas de Transformers: `integrations/transformers/expectations` (dentro del repo)
- Procedencia del fixture: `build.json` (dentro del repo)
