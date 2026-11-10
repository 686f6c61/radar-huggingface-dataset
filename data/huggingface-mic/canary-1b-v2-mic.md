# huggingface-mic/canary-1b-v2-mic

## Resumen

`huggingface-mic/canary-1b-v2-mic` es un artefacto de prueba (fixture) derivado de `nvidia/canary-1b-v2`, el modelo de reconocimiento automatico del habla (ASR) de NVIDIA basado en la arquitectura Canary. No es un modelo utilizable en produccion: se trata de una version reducida artificialmente, con solo 1.703.232 parametros y pesos aleatorios (semilla 17), creada por el equipo de Hugging Face para validar contratos de integracion y expectativas de frameworks (Transformers) sin necesidad de descargar ni ejecutar el checkpoint completo.

El fixture conserva la misma clase de arquitectura (`CanaryForConditionalGeneration`), los mismos nombres de tensores y los mismos ficheros de procesador copiados byte a byte del modelo original (`chat_template.jinja`, `generation_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`), pero reduce el encoder y el decoder a 2 capas cada uno. Esto permite ejecutar pruebas de humo de integracion (forward, loss, gradientes) en float32, bfloat16 y float16 con un coste computacional minimo.

Su relevancia es exclusivamente de ingenieria: sirve como banco de pruebas reproducible para pipelines de CI que necesitan verificar que una integracion de Transformers funciona con la familia Canary sin cargar el modelo real de NVIDIA (de aproximadamente 1B de parametros). Esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Canary (`CanaryForConditionalGeneration`), encoder-decoder transformer reducido (2 capas en encoder, 2 en decoder) |
| Parametros totales | 1.703.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; compatible con bfloat16 y float16 segun la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Canary de NVIDIA, un transformer encoder-decoder orientado a tareas de reconocimiento del habla y traduccion de voz. En este fixture, la configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio `transformers-mic`: el encoder y el decoder conservan 2 capas ocultas cada uno, manteniendo la clase `CanaryForConditionalGeneration` y todos los nombres de tensores del checkpoint original.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad de entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0.001 (la mas debil, `attention_mask:all_ones`, produjo 0.00338). Los ficheros del procesador se copiaron byte a byte desde `nvidia/canary-1b-v2`. El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture es `1e6971eed286` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el proceso de reduccion.

## Capacidades

- No es un modelo funcional: no genera transcripciones ni traducciones utiles, ya que sus pesos son aleatorios.
- Conserva la interfaz de procesador del modelo original (tokenizer, `generation_config`, `chat_template`), lo que permite probar rutas de preprocesado y decodificacion.
- Sirve para validar la carga del modelo en Transformers y la compatibilidad de la clase `CanaryForConditionalGeneration`.
- Permite ejecutar pruebas de forward, calculo de loss y retropropagacion de gradientes en float32, bfloat16 y float16.
- No soporta tool calling, agentes, vision ni audio de forma real; su unica utilidad es la verificacion de contratos de integracion.
- Multilingue: no disponible (los idiomas del modelo original no se documentan en la informacion proporcionada para este fixture).

## Casos de uso

- Pruebas de integracion en CI: ejecutar un forward y un backward con el fixture para verificar que la version de Transformers carga correctamente la clase `CanaryForConditionalGeneration` sin descargar el checkpoint de NVIDIA.
- Validacion de contratos de framework: comprobar que los ficheros de procesador (`tokenizer.json`, `processor_config.json`, `generation_config.json`) se cargan y producen tensores con las formas esperadas.
- Pruebas de humo de precision: verificar que el modelo es finito en float32, bfloat16 y float16 antes de desplegar el modelo real en esos dtypes.
- Desarrollo de herramientas de inspeccion de modelos: usar los nombres de tensores identicos al checkpoint real para probar utilidades de analisis de pesos sin coste de almacenamiento.
- Reproduccion de builds: reconstruir el fixture con `python example/build_fixtures.py --fixture canary-1b-v2-mic` y comparar hashes registrados en `build.json`.
- Validacion de pipelines de decodificacion: probar la generacion con `generation_config.json` copiado del modelo original para detectar incompatibilidades de API en nuevas versiones de Transformers.
- Formacion y documentacion: ilustrar como se reduce un modelo grande a un fixture manteniendo la arquitectura y los nombres de tensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios y no tiene rendimiento funcional que medir.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (1,7M parametros), despreciable en cualquier GPU.
- GPU recomendadas: cualquiera; no requiere GPU, funciona en CPU sin problemas.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU.
- Opciones de despliegue: Transformers (via `CanaryForConditionalGeneration`); no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas con pesos aleatorios, los tiempos son del orden de milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/canary-1b-v2-mic` | 1,7M | no disponible | Fixture de prueba para integracion de Transformers | no disponible | Hugging Face |
| `nvidia/canary-1b-v2` | ~1B (no confirmado en la informacion) | no disponible | ASR y traduccion de voz en produccion | no disponible | Hugging Face |
| Otros fixtures de `transformers-mic` | Variable (reducidos) | no disponible | Pruebas de contrato de otros modelos | no disponible | Hugging Face |

La comparativa con alternativas funcionales (Whisper, SeamlessM4T, etc.) no procede: este modelo no es un ASR utilizable, sino un artefacto de pruebas. Los datos de parametros del modelo base no estan confirmados en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas carecen de sentido.
- Etiquetado como `test-artifact`; no debe usarse en produccion ni en evaluaciones de calidad.
- La licencia no esta disponible, lo que impide confirmar condiciones de uso comercial.
- No se documentan sesgos, pero al no haber entrenamiento no aplican sesgos aprendidos; el riesgo de alucinacion es total en el sentido de que cualquier salida es ruido.
- No se dispone de informacion sobre contexto maximo, idiomas ni cuantizaciones soportadas mas alla de float32, bfloat16 y float16.
- El repositorio tiene un tamano de 0.0 GB y 0 descargas; su mantenimiento no esta garantizado.
- No debe confundirse con `nvidia/canary-1b-v2`; verificar siempre el ID antes de integrarlo en un pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/canary-1b-v2-mic
- Modelo base: https://huggingface.co/nvidia/canary-1b-v2
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/canary-1b-v2-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/canary-1b-v2-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/canary-1b-v2-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/canary-1b-v2-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/canary-1b-v2-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio `transformers-mic` (script `build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
