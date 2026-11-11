# huggingface-mic/gemma-3n-E2B-it-mic

## Resumen

`gemma-3n-E2B-it-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo usable: se trata de una version "slim" del checkpoint `google/gemma-3n-E2B-it` de Google, reducida mediante una regla generica de encogimiento de configuracion (4 capas ocultas de texto) y con pesos aleatorios (semilla 17). Su proposito es servir como fixture reproducible para validar integraciones de frameworks (en concreto, Transformers) contra la arquitectura `Gemma3nForConditionalGeneration` sin necesidad de descargar ni ejecutar el modelo real completo.

El repositorio contiene los pesos encogidos, ejemplos de uso ejecutables y un directorio de "expectativas" del framework, todo empaquetado bajo un manifiesto de contrato (`integration.json`). Los ficheros de procesador (tokenizer, chat template, generation config, preprocessor config) se copian byte a byte del checkpoint original, de modo que el fixture reproduce fielmente la interfaz de entrada/salida del modelo de referencia.

Es relevante en el contexto de testing de infraestructura de IA: permite a desarrolladores de frameworks y pipelines verificar carga, forward, backward y compatibilidad de tensores con un peso de 1,3 GB en lugar de los varios gigabytes del modelo Gemma 3n completo, manteniendo los mismos nombres de tensor y el mismo dtype (bfloat16). La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3nForConditionalGeneration (transformer multimodal, configuracion encogida: 4 capas ocultas de texto) |
| Parametros totales | 51.492.816 (segun safetensors) |
| Parametros activos | no disponible (el modelo base Gemma 3n E2B emplea arquitectura con parametros efectivos, pero el dato no se detalla en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture reutiliza la clase `Gemma3nForConditionalGeneration` del checkpoint original `google/gemma-3n-E2B-it`, pero con una configuracion reducida a 4 capas ocultas de texto aplicando la regla generica de `sweep.py` del repositorio `transformers-mic`. Los pesos son aleatorios (semilla 17) y no han sido entrenados: unicamente pasaron una "puerta de sensibilidad a la entrada" que verifica que cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (la perturbacion mas debil, `attention_mask:all_ones`, produjo 0,0859). Por tanto, no hay datos de entrenamiento, tokens vistos, RLHF ni DPO asociados a este artefacto.

La innovacion tecnica del fixture es la reproducibilidad: conserva exactamente los mismos nombres de tensor que el checkpoint real, los ficheros de procesador copiados byte a byte (`chat_template.jinja`, `generation_config.json`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`) y el dtype por defecto (bfloat16). Ademas, se verifica que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16. El fichero `build.json` registra las fuentes fijadas, los resultados de las puertas de validacion y los hashes de los ficheros.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no generan texto, codigo ni razonamiento coherente.
- Sirve como fixture de integracion para validar la carga de la arquitectura `Gemma3nForConditionalGeneration` en Transformers.
- Permite comprobar la compatibilidad de nombres de tensor con el checkpoint real.
- Reproduce la interfaz de procesador del modelo base (tokenizer, chat template, generation config) para tests de pipelines de entrada/salida.
- Verifica la estabilidad numerica (finitud de forward, loss y gradientes) en float32, bfloat16 y float16.
- No soporta tool calling, agentes, vision ni audio de forma utilizable, al carecer de pesos entrenados.
- Multilingue solo a nivel de tokenizer, heredado del modelo base; sin capacidad generativa real.

## Casos de uso

- Testing de integracion en Transformers: cargar el fixture para verificar que la clase `Gemma3nForConditionalGeneration` se instancia correctamente y que los tensores se mapean sin errores, con un peso de 1,3 GB en lugar del modelo completo.
- Validacion de pipelines CI/CD: ejecutar tests de humo de carga, forward y backward en cada PR de un framework sin descargar el checkpoint real de Google, reduciendo tiempo y ancho de banda.
- Verificacion de compatibilidad de tokenizer y chat template: comprobar que los ficheros de procesador copiados byte a byte producen las mismas entradas que el modelo original.
- Pruebas de estabilidad numerica: validar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 antes de desplegar cambios en el framework.
- Desarrollo de herramientas de "encogimiento" de modelos: servir como caso de referencia para la regla generica de `sweep.py` y para `build_fixtures.py`.
- Reproducibilidad de artefactos: usar `build.json` para auditar fuentes, hashes y resultados de las puertas de validacion en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en bfloat16 (tamano del repo), sin necesidad de cuantizacion adicional.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) es suficiente; tambien cabe en CPU.
- Cabe en GPU consumer: si, con amplio margen.
- Opciones de despliegue: Transformers (via `integrations/transformers/usage.md`); otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un fixture de 4 capas con pesos aleatorios, las mediciones no serian representativas del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3n-E2B-it-mic (este) | 51,5 M | no disponible | Fixture de test | no disponible | Hugging Face |
| google/gemma-3n-E2B-it | no disponible en la informacion | no disponible | Modelo multimodal usable | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | no disponible | no disponible | Fixtures de test | no disponible | Hugging Face (org huggingface-mic) |

La comparacion con alternativas de la misma categoria (fixtures de test) no esta detallada en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas carecen de sentido; no debe emplearse en produccion ni en evaluaciones de calidad.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; usarlo fuera de testing seria un error de seleccion.
- La licencia no esta declarada en la informacion disponible, por lo que no se puede confirmar el uso comercial.
- Al derivar de `google/gemma-3n-E2B-it`, podrian aplicar restricciones de la licencia del modelo base, pero no se detallan.
- La configuracion encogida (4 capas) no reproduce el comportamiento numerico del modelo real, solo la interfaz y los nombres de tensor.
- Riesgo de confusion: el nombre incluye "E2B-it" y podria confundirse con el checkpoint oficial de Google; conviene verificar el ID completo `huggingface-mic/gemma-3n-E2B-it-mic`.
- No hay garantia de que los ficheros de procesador copiados se mantengan sincronizados con futuras versiones del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/gemma-3n-E2B-it-mic
- Modelo base: https://huggingface.co/google/gemma-3n-E2B-it
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicacion del encogimiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma-3n-E2B-it-mic.html
- Script de encogimiento: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
