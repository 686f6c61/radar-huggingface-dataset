# huggingface-mic/manga-ocr-base-mic

## Resumen

`manga-ocr-base-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` en Hugging Face, derivado del modelo real `kha-white/manga-ocr-base`. No es un modelo utilizable: se trata de una version reducida artificialmente ("slim fixture") de 716.032 parametros (0,7 M) que conserva la misma arquitectura `VisionEncoderDecoderModel` del original, pero con una configuracion mucho mas pequena. Su proposito es servir como banco de pruebas para validar contratos de integracion con Transformers (carga, forward, loss, gradientes y sensibilidad a la entrada) sin necesidad de descargar los pesos completos del modelo real.

El modelo esta etiquetado explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos. Los ficheros de procesador (`preprocessor_config.json`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.txt`) se copian byte a byte del checkpoint original, de modo que la tokenizacion y el preprocesado son identicos a los de `kha-white/manga-ocr-base`. Los pesos, en cambio, son aleatorios y solo han pasado por un entrenamiento de 50 pasos sobre el contrato de prueba, lo que los sobreajusta a ese escenario concreto.

Su relevancia es, por tanto, puramente de ingenieria: permite a los mantenedores de integraciones (por ejemplo, el proyecto `transformers-mic`) verificar que la API de Transformers se comporta como se espera con un `VisionEncoderDecoderModel` de OCR de manga, sin coste de descarga ni de computo. Cualquier uso como modelo de OCR real produciria resultados sin sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VisionEncoderDecoderModel (encoder visual + decoder de texto) |
| Parametros totales | 716.032 (0,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (el modelo base esta orientado a japones, pero no se confirma en la informacion) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es un `VisionEncoderDecoderModel`, el mismo tipo que emplea `kha-white/manga-ocr-base` para reconocimiento optico de caracteres sobre paginas de manga. El fixture conserva los mismos nombres de tensores que el checkpoint real, pero con dimensiones reducidas segun la regla generica de reduccion de `sweep.py` del repositorio `huggingface/transformers-mic`. Los ficheros de procesador se copian literalmente del modelo original, garantizando que el pipeline de entrada (imagenes y tokenizacion) sea identico.

El entrenamiento del fixture es minimo: 50 pasos sobre el contrato de prueba, lo que produce un sobreajuste deliberado a ese escenario. Los pesos iniciales aleatorios no superaron la puerta de sensibilidad a la entrada (la perturbacion `pixel_values:reverse` solo movio los logits 1,3e-05, frente a un umbral de 0,001), por lo que se opto por este ajuste corto para que el fixture responda de forma medible. El identificador de fixture es `f52652c64622` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya configuracion coincide tras la reduccion. El proceso de construccion esta documentado en `build_fixtures.py` y los hashes y resultados de las puertas de validacion se registran en `build.json`.

## Capacidades

- No es un modelo funcional: no realiza OCR, traduccion ni generacion de texto con sentido.
- Sirve como fixture para validar la carga de `VisionEncoderDecoderModel` en Transformers.
- Permite comprobar el forward, la loss y los gradientes en float32, bfloat16 y float16 (todos finitos).
- Reproduce los nombres de tensores del checkpoint real, util para pruebas de compatibilidad de pesos.
- Incluye ficheros de procesador identicos a `kha-white/manga-ocr-base`, utiles para probar pipelines de preprocesado de imagen y tokenizacion.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues reales.
- No dispone de modo thinking, vision funcional ni audio.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `VisionEncoderDecoderModel.from_pretrained` para verificar que la API acepta la configuracion y devuelve tensores con las formas esperadas.
- Validacion de contratos de framework: ejecutar el manifiesto `integration.json` y el directorio `integrations/transformers/expectations` para comprobar que una version de Transformers cumple las expectativas del proyecto `transformers-mic`.
- Pruebas de precision numerica: verificar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 antes de ejecutar la misma bateria sobre el modelo real.
- CI/CD de bajo coste: usar el fixture en pipelines de integracion continua para detectar regresiones en el manejo de `VisionEncoderDecoderModel` sin descargar cientos de MB de pesos.
- Desarrollo de utilidades de preprocesado: al conservar los ficheros de procesador del original, sirve para probar tokenizadores y transformaciones de imagen en aislamiento.
- Depuracion de mapeo de pesos: comprobar que las herramientas de carga y conversion manejan correctamente los nombres de tensores del checkpoint real.
- Documentacion y demos de integracion: ejemplos ejecutables que muestran el uso de la API sin necesidad de GPU ni de pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 716.032 parametros en float32, los pesos ocupan aproximadamente 2,9 MB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU es suficiente. Una RTX 4090, A100 o H100 estarian enormemente sobredimensionadas para este fixture.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, etc.) y en entornos sin GPU.
- Opciones de despliegue: Transformers (carga estandar de `VisionEncoderDecoderModel`); no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI, y su naturaleza de fixture lo hace innecesario.
- Latencia y throughput: no disponibles; al ser un modelo de prueba, las cifras no serian representativas del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/manga-ocr-base-mic` | 716.032 (0,7 M) | no disponible | Fixture de prueba | no disponible | Hugging Face |
| `kha-white/manga-ocr-base` | no disponible en la informacion | no disponible | OCR de manga real | no disponible en la informacion | Hugging Face |
| Otros fixtures `*-mic` del proyecto | variable | no disponible | Pruebas de integracion | no disponible | Hugging Face |

La unica comparacion significativa es con su modelo base `kha-white/manga-ocr-base`: el fixture reduce drasticamente el numero de parametros y sustituye los pesos entrenados por pesos sobreajustados a 50 pasos, por lo que no es intercambiable con el original para ninguna tarea de OCR. No se dispone de datos de otros modelos de OCR de manga en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y solo han pasado por 50 pasos de entrenamiento; las salidas carecen de sentido.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta disponible, lo que impide confirmar condiciones de uso comercial.
- No se confirman los idiomas soportados; aunque el modelo base esta orientado al japones, el fixture no hereda capacidades linguisticas reales.
- Riesgo de confusion: un usuario podria descargarlo pensando que es un OCR funcional; el nombre y el tamano (0,7 M) deberian alertar de lo contrario.
- No se documentan sesgos, pero al no generar texto coherente, la evaluacion de sesgos no aplica.
- La longitud de contexto no esta disponible.
- Cualquier metrica de rendimiento obtenida con este fixture no es extrapolable al modelo real.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/manga-ocr-base-mic
- Modelo base: https://huggingface.co/kha-white/manga-ocr-base
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/manga-ocr-base-mic/blob/main/integration.json
- Uso con Transformers (`integrations/transformers/usage.md`): https://huggingface.co/huggingface-mic/manga-ocr-base-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers (`integrations/transformers/expectations`): https://huggingface.co/huggingface-mic/manga-ocr-base-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/manga-ocr-base-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/manga-ocr-base-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
