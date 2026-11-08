# huggingface-mic/blip2-opt-2.7b-mic

## Resumen

`huggingface-mic/blip2-opt-2.7b-mic` no es un modelo entrenado, sino un *fixture* de test de 3,6 millones de parametros construido por el equipo de `huggingface-mic`. Reproduce la arquitectura `Blip2ForConditionalGeneration` del checkpoint real `Salesforce/blip2-opt-2.7b` (BLIP-2 con OPT-2.7B como modelo de lenguaje) pero con una configuracion reducida: 2 capas en el codificador visual, 2 en el Q-Former y 2 en el decodificador de texto. Los pesos son aleatorios (semilla 17) y los ficheros de procesador (tokenizer, `preprocessor_config.json`, etc.) se copian byte a byte del checkpoint original.

El proposito es servir como artefacto de integracion para validar contratos de frameworks (por ejemplo, la integracion de Transformers) sin necesidad de descargar los ~15 GB del modelo real. El propio autor lo etiqueta como `test-artifact` y advierte explicitamente de que "no es un modelo usable": no genera subtitulos coherentes ni texto con sentido.

Su relevancia practica es nula para inferencia o produccion; es util unicamente para desarrolladores de frameworks o pipelines que necesiten verificar compatibilidad de carga, nombres de tensores y comportamiento del procesador contra la familia BLIP-2. Cualquier evaluacion de calidad, benchmarks o capacidades debe hacerse sobre el modelo base `Salesforce/blip2-opt-2.7b`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BLIP-2 (`Blip2ForConditionalGeneration`): ViT + Q-Former + decodificador OPT, configuracion reducida (2 capas por bloque) |
| Parametros totales | 3.629.056 (fixture reducido; el base real tiene ~2.700 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de OPT en el base; no especificado en la informacion) |
| Tipos de cuantizacion | no disponible; pesos guardados en float32, con forward finito en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BLIP-2: un codificador de imagen tipo ViT congelado, un Q-Former que proyecta las representaciones visuales a un espacio de embeddings y un modelo de lenguaje congelado (OPT-2.7B en el checkpoint original) que genera el texto condicionado por el prefijo visual. En este fixture, la configuracion se ha reducido a 2 capas en cada uno de los tres bloques (`vision num_hidden_layers 2`, `qformer num_hidden_layers 2`, `text num_hidden_layers 2`) mediante la regla generica de `sweep.py` del repositorio `transformers-mic`.

No ha habido entrenamiento. Los pesos son aleatorios con semilla 17 y solo se validaron mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato debia mover los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produjo 0,0469). Los nombres de tensores coinciden con los del checkpoint real y los ficheros de procesador se copiaron sin modificacion. El `build.json` del repositorio registra fuentes fijadas, resultados de la puerta y hashes de ficheros.

## Capacidades

- Carga y ejecucion de un grafo `Blip2ForConditionalGeneration` con nombres de tensores identicos al checkpoint real.
- Ejecucion del procesador BLIP-2 (tokenizer y `preprocessor_config.json` copiados byte a byte del modelo base).
- Forward, calculo de perdida y gradientes finitos en float32, bfloat16 y float16.
- Sensibilidad de logits verificada frente a perturbaciones de las entradas del contrato.
- No genera subtitulos ni texto coherente: los pesos son aleatorios.
- Sin soporte real de tool calling, agentes, razonamiento ni capacidades multilingues (no aplica a un fixture).

## Casos de uso

- Validacion de integraciones de Transformers: cargar el fixture con `AutoProcessor` y `Blip2ForConditionalGeneration` para comprobar que la API, el mapeo de nombres de tensores y las expectativas del framework coinciden con el modelo real, sin descargar los ~15 GB del checkpoint completo.
- Tests de CI/CD en pipelines de vision-lenguaje: usar el fixture como sustituto ligero en tests de humo que verifiquen que el codigo de carga, preprocesado y forward no rompe ante cambios de version de la libreria.
- Verificacion de contratos de framework: el repositorio incluye `integration.json` e `integrations/transformers/expectations`, pensados para comparar el comportamiento esperado (formas de salida, dtypes, tolerancias) contra el fixture.
- Pruebas de serializacion y dtypes: comprobar que el modelo se carga y ejecuta correctamente en float32, bfloat16 y float16, util para validar rutas de mixed precision en frameworks.
- Desarrollo de utilidades de inspeccion de modelos: analizar estructura de configuracion, nombres de tensores y ficheros de procesador de la familia BLIP-2 con un artefacto de 0,0 GB.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture blip2-opt-2.7b-mic` para auditar el proceso de reduccion y los hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que es un artefacto de test con pesos aleatorios y no un modelo usable; cualquier cifra de calidad seria no tendria sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 (3,6 M de parametros); cabe en cualquier GPU consumer, CPU o incluso en entornos sin acelerador.
- GPU recomendadas: no aplica; cualquier GPU (incluidas integradas) es suficiente. No requiere A100, H100 ni RTX 4090.
- Cabe en consumer GPU: si, en todas, y tambien en CPU.
- Opciones de despliegue: carga via `transformers` (`AutoProcessor` + `Blip2ForConditionalGeneration`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un fixture de test no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/blip2-opt-2.7b-mic` | 3,6 M (fixture) | no disponible | Test de integracion | no disponible | Hugging Face |
| `Salesforce/blip2-opt-2.7b` | ~2.700 M | no disponible | Subtitulado de imagenes (pre-trained only) | no disponible en la informacion | Hugging Face |
| `LanguageMachines/blip2-opt-2.7b` | ~2.700 M | no disponible | Subtitulado de imagenes (pre-trained only) | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas no tienen significado. No debe emplearse para inferencia real, demos ni produccion.
- Etiquetado como `test-artifact` por el autor para excluirlo de busquedas de modelos candidatos.
- Sesgos conocidos: no aplica (pesos aleatorios); no se han evaluado sesgos.
- Riesgo de alucinacion: total, en el sentido de que cualquier salida es ruido sin relacion con la entrada.
- Limitaciones de contexto o idioma: no documentadas; el fixture no conserva las capacidades linguisticas de OPT-2.7B.
- Restricciones de licencia: la licencia no esta disponible en la informacion; debe consultarse el modelo base (`Salesforce/blip2-opt-2.7b`) antes de cualquier uso derivado.
- Para cualquier evaluacion real de BLIP-2 conviene usar el checkpoint completo `Salesforce/blip2-opt-2.7b` o su variante `LanguageMachines/blip2-opt-2.7b`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/blip2-opt-2.7b-mic
- Modelo base: https://huggingface.co/Salesforce/blip2-opt-2.7b
- Variante LanguageMachines: https://huggingface.co/LanguageMachines/blip2-opt-2.7b
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/blip2-opt-2.7b-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio `transformers-mic` (script `build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Paper BLIP-2 (Li et al.): no disponible en la informacion proporcionada como enlace directo
