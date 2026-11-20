# huggingface-mic/videomae-base-mic

## Resumen

`videomae-base-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` dentro del proyecto transformers-mic. No es un modelo entrenado ni utilizable para inferencia real: es una version "slim" (reducida) del checkpoint `MCG-NJU/videomae-base`, generada para validar contratos de integracion y expectativas de framework en pipelines de CI. El repositorio incluye pesos reducidos, ejemplos de uso con Transformers y un manifiesto de contrato (`integration.json`).

El modelo conserva la arquitectura `VideoMAEForPreTraining` pero con una configuracion drasticamente reducida (`num_hidden_layers` igual a 2), lo que resulta en 7.878.720 parametros totales. Los pesos son aleatorios (semilla 17) y no han sido entrenados; pasaron unicamente una puerta de sensibilidad a la entrada que verifica que las perturbaciones de los inputs mueven los logits al menos 0,001.

Su relevancia es exclusivamente de ingenieria: sirve como fixture reproducible para testear integraciones de Transformers con VideoMAE sin descargar el checkpoint completo, y esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos. Cualquier uso como modelo de vision por video en produccion seria un error de interpretacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VideoMAE (transformer para video), clase `VideoMAEForPreTraining` |
| Parametros totales | 7.878.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; se declara compatibilidad finita en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura subyacente es VideoMAE, un transformer de vision para video con enmascaramiento tipo autoencoder (masked autoencoding) orientado a pretraining autosupervisado sobre clips de video. El fixture replica la clase `VideoMAEForPreTraining` del checkpoint `MCG-NJU/videomae-base`, pero con la configuracion encogida mediante la regla generica de `sweep.py` del repositorio transformers-mic, reduciendo `num_hidden_layers` a 2.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron unicamente con una puerta de sensibilidad a la entrada: cada perturbacion de los inputs del contrato desplaza los logits al menos 0,001 (el caso mas debil, `pixel_values:roll_batch`, con 0,00235). Los ficheros de procesador (`preprocessor_config.json`) se copiaron byte a byte desde `MCG-NJU/videomae-base`, y los nombres de tensores coinciden con el checkpoint real. Los pesos se guardaron en float32, el dtype por defecto del modelo base, y se verifico que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- No es un modelo funcional: no genera predicciones con significado semantico.
- Ejecuta el forward de `VideoMAEForPreTraining` con entradas de video y produce logits, loss y gradientes finitos.
- Sirve como fixture de contrato para validar integraciones de Transformers con la familia VideoMAE.
- Permite testear el pipeline de carga de pesos safetensors, el procesador y las expectativas de framework sin descargar el checkpoint completo.
- No dispone de tool calling, capacidades de agente, razonamiento multilingue ni ninguna funcionalidad de modelo de produccion.
- No soporta generacion de texto, codigo, matematicas ni vision utilizable.

## Casos de uso

- Tests de integracion en CI: validar que la carga de `VideoMAEForPreTraining` con Transformers funciona correctamente usando un fixture de 7,9 M de parametros en lugar del checkpoint completo, reduciendo tiempos y ancho de banda.
- Verificacion de contratos de API: comprobar que las firmas de entrada (`pixel_values`) y salida del modelo se mantienen estables entre versiones de la libreria, usando el manifiesto `integration.json`.
- Pruebas de compatibilidad de dtype: ejercitar el forward, la loss y los gradientes en float32, bfloat16 y float16 para detectar regresiones numericas en el framework.
- Validacion de procesadores: testear que `preprocessor_config.json` se carga y aplica correctamente, ya que el fichero es identico byte a byte al del modelo real.
- Desarrollo de herramientas de "shrink" de modelos: servir como caso de referencia del script `sweep.py` para generar fixtures de otros checkpoints.
- Reproducibilidad de fixtures: reconstruir el artefacto con `build_fixtures.py --fixture videomae-base-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no ha sido entrenado y sus pesos son aleatorios, por lo que cualquier metrica de calidad seria carente de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (7,9 M de parametros, aproximadamente 32 MB de pesos mas activaciones minimas).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien funciona en CPU.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) y en entornos sin GPU.
- Opciones de despliegue: Transformers con PyTorch es el camino documentado (`integrations/transformers/usage.md`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; al ser un fixture de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Proposito | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/videomae-base-mic` | 7,9 M | Fixture de test | No (pesos aleatorios) | no disponible | Hugging Face |
| `MCG-NJU/videomae-base` | no disponible en la informacion | Modelo real de vision por video | Si | no disponible en la informacion | Hugging Face |
| Otros fixtures de transformers-mic | variable | Fixtures de test | No | no disponible | Hugging Face |

La comparativa relevante es unicamente con el checkpoint base `MCG-NJU/videomae-base`, del que este artefacto es una version reducida y no entrenada. No se dispone de datos para comparar con alternativas reales de vision por video como VideoMAEv2 u otros, ya que la informacion proporcionada no los incluye.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas carecen de significado semantico.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; usarlo en produccion seria un error.
- La licencia no esta declarada en la informacion disponible; no se puede asumir uso comercial sin consultar el repositorio del modelo base.
- No hay informacion sobre sesgos, idiomas ni riesgos de alucinacion porque el modelo no ha sido entrenado.
- La configuracion reducida (`num_hidden_layers` igual a 2) no representa el comportamiento del checkpoint real.
- El tamano del repo figura como 0,0 GB, lo que sugiere que algunos ficheros deben reconstruirse con `build_fixtures.py`.
- No dispone de pipeline declarado en Hugging Face, por lo que la carga automatica con `pipeline()` puede no funcionar sin especificar la clase manualmente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/videomae-base-mic
- Modelo base: https://huggingface.co/MCG-NJU/videomae-base
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/videomae-base-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/videomae-base-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/videomae-base-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/videomae-base-mic/blob/main/build.json
- Explicacion del "shrink": https://huggingface-mic-mic-coverage.static.hf.space/shrink/videomae-base-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de sweep: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
