# huggingface-mic/parakeet-tdt-0.6b-v3-mic

## Resumen

`huggingface-mic/parakeet-tdt-0.6b-v3-mic` no es un modelo utilizable, sino un artefacto de prueba (fixture) derivado de `nvidia/parakeet-tdt-0.6b-v3`. Se trata de una version reducida artificialmente del checkpoint original de reconocimiento automatico del habla (ASR) de NVIDIA basado en arquitectura Parakeet con decodificacion TDT (Token-and-Duration Transducer). El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

El proposito del repositorio es empaquetar en un unico lugar pesos reducidos, ejemplos de uso ejecutables y las expectativas del framework (Transformers) sobre el modelo. El fixture conserva la misma arquitectura `ParakeetForTDT` y los mismos nombres de tensor que el checkpoint real, pero con un config reducido: 2 capas de decoder y 2 capas de encoder. Cuenta con 1.088.486 parametros totales, en contraste con los aproximadamente 600 millones del modelo base.

Su relevancia es puramente de ingenieria: sirve para validar contratos de integracion, pruebas de regresion y pipelines de CI sin necesidad de descargar el checkpoint completo de NVIDIA. No debe emplearse para inferencia real ni para evaluacion de calidad ASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ParakeetForTDT (transducer TDT) |
| Parametros totales | 1.088.486 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo base `nvidia/parakeet-tdt-0.6b-v3` emplea una arquitectura transducer con decodificacion TDT, que predice conjuntamente tokens y duraciones para el reconocimiento del habla. El fixture reproduce la clase `ParakeetForTDT` de Transformers pero con un config reducido mediante la regla generica de `sweep.py`: `num_decoder_layers=2` y `encoder num_hidden_layers=2`. Los ficheros de procesador (`generation_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte desde el checkpoint original.

No se trata de un modelo entrenado en el sentido habitual: los pesos se sobreajustan al paso de entrenamiento del contrato (360 pasos) para superar la puerta de sensibilidad a la entrada, ya que pesos aleatorios fallaban ese criterio (el desplazamiento de logits con `decoder_input_ids:reverse` era de solo 3.3e-05 frente a un umbral de 0.001). El fixture es finito en float32, bfloat16 y float16 (forward, loss y gradientes) y conserva los mismos nombres de tensor que el checkpoint real. Fue construido con `build_fixtures.py` y su procedencia queda registrada en `build.json`.

## Capacidades

- No dispone de capacidades funcionales de ASR: es un artefacto de prueba, no un modelo entrenado para transcribir audio.
- Conserva la interfaz de `ParakeetForTDT` y los ficheros de procesador del modelo base, lo que permite validar rutas de codigo de integracion.
- Sirve como fixture para pruebas de contrato: verificacion de nombres de tensor, dtypes y compatibilidad con el pipeline de Transformers.
- Soporta ejecucion forward, calculo de loss y gradientes en float32, bfloat16 y float16.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues reales.
- No incluye modo thinking, vision ni audio funcional.

## Casos de uso

- Pruebas de integracion en CI: validar que el codigo de carga de `ParakeetForTDT` funciona sin descargar los aproximadamente 600 M de parametros del checkpoint real.
- Validacion de contratos de framework: comprobar que los nombres de tensor y el config reducido coinciden con lo esperado por Transformers.
- Pruebas de regresion de dtypes: verificar comportamiento finito en float32, bfloat16 y float16 en forward, loss y gradientes.
- Desarrollo de utilidades de conversion o serializacion: usar el fixture como entrada ligera para probar herramientas de empaquetado safetensors.
- Test de pipelines de evaluacion: comprobar que los scripts de benchmark aceptan el modelo y producen salidas sin errores de forma, aunque los resultados no sean significativos.
- Reproducibilidad de fixtures: reconstruir el artefacto con `build_fixtures.py --fixture parakeet-tdt-0.6b-v3-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos sobreajustados a un paso de entrenamiento, cualquier metrica de calidad ASR careceria de validez.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (1,09 M de parametros), aunque el modelo no es funcional para ASR.
- GPU recomendadas: cualquier GPU consumer moderna es sobrada; el fixture cabe en CPU.
- Cabe en cualquier GPU consumer y en CPU sin problemas de memoria.
- Opciones de despliegue: carga via Transformers (`ParakeetForTDT`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; sin valor representativo al no ser un modelo funcional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `huggingface-mic/parakeet-tdt-0.6b-v3-mic` | 1,09 M | no disponible | no disponible | Fixture de prueba |
| `nvidia/parakeet-tdt-0.6b-v3` | ~600 M (segun model card del autor) | no disponible | no disponible | ASR real |
| Otros fixtures `huggingface-mic` | variable | no disponible | no disponible | Pruebas de contrato |

La comparativa solo tiene sentido frente al modelo base: el fixture replica su arquitectura e interfaz con un config reducido, pero no su capacidad. No se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- No es un modelo utilizable: la model card lo declara explicitamente como `test-artifact`, no apto para produccion.
- Los pesos estan sobreajustados a 360 pasos, por lo que las salidas no tienen significado linguistico.
- No se han documentado sesgos, pero tampoco es posible evaluarlos por su naturaleza de fixture.
- Riesgo de alucinacion irrelevante: no genera texto ni transcripciones con sentido.
- Licencia no disponible: conviene verificar la del modelo base antes de cualquier uso derivado.
- No debe incluirse en busquedas de modelos candidatos ni en comparativas de calidad ASR.
- El repo ocupa 0.0 GB segun la informacion disponible; el tamano real de los pesos es minimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/parakeet-tdt-0.6b-v3-mic
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Manifest de contrato: `integration.json` (en el repo)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repo)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repo)
- Procedencia del fixture: `build.json` (en el repo)
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/parakeet-tdt-0.6b-v3-mic.html
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
