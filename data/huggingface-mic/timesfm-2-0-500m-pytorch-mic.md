# huggingface-mic/timesfm-2.0-500m-pytorch-mic

## Resumen

`huggingface-mic/timesfm-2.0-500m-pytorch-mic` es un artefacto de prueba (fixture) publicado por el equipo `huggingface-mic`, no un modelo entrenado ni utilizable en produccion. Reproduce la arquitectura del modelo de series temporales `google/timesfm-2.0-500m-pytorch` de Google con una configuracion reducida (2 capas ocultas) y pesos aleatorios (semilla 17), con el objetivo de servir como banco de pruebas para validar integraciones con Transformers (contratos de entrada/salida, expectativas de framework y uso ejecutable).

El repositorio incluye los pesos "slim" en formato safetensors (344.416 parametros reales segun el recuento del repo), los ficheros de procesador copiados byte a byte del checkpoint original de Google, un manifiesto de contrato (`integration.json`), documentacion de uso para Transformers (`integrations/transformers/usage.md`) y las expectativas del framework (`integrations/transformers/expectations`). El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Su relevancia es metodologica: permite a desarrolladores de la libreria Transformers verificar que la clase `TimesFmModelForPrediction` y el pipeline de forecasting se comportan correctamente (formas de tensores, dtypes, sensibilidad a perturbaciones de entrada, gradientes finitos en float32/bfloat16/float16) sin necesidad de descargar ni ejecutar el modelo real de 500M. No debe confundirse con TimesFM 2.0: no genera predicciones con sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para forecasting de series temporales (`TimesFmModelForPrediction`), version reducida a `num_hidden_layers: 2` |
| Parametros totales | 344.416 (fixture slim); el modelo base `google/timesfm-2.0-500m-pytorch` tiene ~500M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (modelo de series temporales, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |
| Modelo base | `google/timesfm-2.0-500m-pytorch` |
| Tipo de artefacto | fixture de test (`test-artifact`), pesos aleatorios (seed 17) |
| Fecha de creacion | 2026-10-27 |
| Descargas | 1549 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `TimesFmModelForPrediction` del checkpoint original de Google, pero con la configuracion reducida mediante la regla generica de `sweep.py` del repositorio `transformers-mic` (concretamente, `num_hidden_layers` reducido a 2). Los ficheros de procesador se copiaron byte a byte desde `google/timesfm-2.0-500m-pytorch`, de modo que el pipeline de preprocesado es identico al real. Los nombres de tensores coinciden exactamente con los del checkpoint original, lo que permite sustituir el fixture por el modelo real sin cambios en el codigo de integracion.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una "input-sensitivity gate": cada perturbacion de las entradas del contrato mueve los logits al menos 0.001 (la mas debil, `past_values:halve`, mueve 0.32). Se verifico tambien que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16. El fixture pertenece a la clave `a03673c5c541` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el shrink. El `build.json` registra las fuentes fijadas, los resultados de las gates y los hashes de los ficheros.

## Capacidades

- Ejecucion del forward de `TimesFmModelForPrediction` con formas y nombres de tensores equivalentes al modelo real.
- Validacion de contratos de entrada/salida para integraciones con Transformers (formas, dtypes, sensibilidad a perturbaciones).
- Verificacion de gradientes y loss finitos en float32, bfloat16 y float16.
- Pruebas de pipeline de forecasting (preprocesado con los ficheros de procesador originales).
- No soporta tool calling, agentes, razonamiento, codigo, matematicas, vision ni capacidades multilingues.
- No genera predicciones de series temporales con sentido: los pesos son aleatorios.

## Casos de uso

- Pruebas de integracion en Transformers: verificar que `TimesFmModelForPrediction` carga, ejecuta forward y produce tensores con las formas esperadas, sin descargar el modelo de 500M.
- CI/CD de la libreria: ejecutar tests de regresion ligeros (repo de 0.0 GB) en cada PR que toque el codigo de TimesFM, con tiempos de ejecucion minimos.
- Validacion de contratos de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen para formas, dtypes y perturbaciones de entrada.
- Pruebas de precision mixta: verificar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 antes de portar codigo al modelo real.
- Desarrollo de pipelines de forecasting: prototipar el preprocesado con los ficheros de procesador originales (identicos byte a byte) sin coste de descarga del checkpoint completo.
- Verificacion de compatibilidad de checkpoints: al compartir nombres de tensores con el modelo real, permite comprobar que un script de carga o conversion funciona antes de aplicarlo al checkpoint de Google.
- Docencia y demos: ilustrar la estructura de un modelo de forecasting basado en transformer con un artefacto pequeno y reproducible (seed 17, hashes registrados en `build.json`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad predictiva carece de sentido; las unicas verificaciones reportadas son las gates de sensibilidad a entradas (perturbacion minima 0.001, `past_values:halve` con 0.32) y la finitud numerica en float32, bfloat16 y float16.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 (344.416 parametros); el repo ocupa 0.0 GB.
- GPU recomendadas: cualquier GPU consumer o integrada; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer e incluso en CPU; el cuello de botella es el pipeline de preprocesado, no el modelo.
- Opciones de despliegue: carga directa con Transformers (`TimesFmModelForPrediction`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de test, no se reportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/timesfm-2.0-500m-pytorch-mic` | 344.416 | no disponible | Fixture de test | no disponible | Hugging Face |
| `google/timesfm-2.0-500m-pytorch` | ~500M | no disponible | Forecasting de series temporales | no disponible | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable (reducidos) | no disponible | Pruebas de integracion | no disponible | Hugging Face |

La comparativa relevante es con el modelo base: el fixture replica su arquitectura, nombres de tensores y ficheros de procesador, pero sustituye los pesos entrenados por pesos aleatorios y reduce las capas a 2. Frente a otros fixtures del mismo equipo, comparte el mismo proposito (validacion de contratos) y se distingue por cubrir la familia TimesFM.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (seed 17) y las predicciones no tienen significado.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Licencia no disponible: no se puede asumir la licencia del modelo base ni uso comercial.
- No se documentan idiomas, contexto ni cuantizaciones; no aplica al no ser un modelo de lenguaje.
- El recuento de parametros (344.416) corresponde al fixture, no al modelo de 500M; no usar como referencia de tamano del modelo real.
- La model card esta mayoritariamente duplicada y contiene enlaces a rutas relativas (`integration.json`, `integrations/transformers/usage.md`) que solo tienen sentido dentro del repo.
- Para reproducir el resto de ficheros hace falta ejecutar `python example/build_fixtures.py --fixture timesfm-2.0-500m-pytorch-mic` desde el repositorio `transformers-mic`.
- No sustituye al modelo base para evaluar calidad de forecasting; para eso debe usarse `google/timesfm-2.0-500m-pytorch`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/timesfm-2.0-500m-pytorch-mic
- Modelo base: https://huggingface.co/google/timesfm-2.0-500m-pytorch
- Repositorio de codigo: https://github.com/huggingface/transformers-mic
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de shrink: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Explicacion del shrink del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/timesfm-2.0-500m-pytorch-mic.html
