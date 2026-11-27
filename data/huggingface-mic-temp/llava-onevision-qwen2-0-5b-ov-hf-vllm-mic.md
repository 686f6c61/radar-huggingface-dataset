# huggingface-mic-temp/llava-onevision-qwen2-0.5b-ov-hf-vllm-mic

## Resumen

`llava-onevision-qwen2-0.5b-ov-hf-vllm-mic` es un artefacto de prueba (fixture) publicado por la cuenta `huggingface-mic-temp`, no un modelo entrenado ni utilizable en producción. Se trata de una version reducida ("slim") del checkpoint real `llava-hf/llava-onevision-qwen2-0.5b-ov-hf`, con solo 9.962.112 parametros (frente a los ~0.5B del original), pesos aleatorios con semilla 17 y la misma arquitectura declarada, `LlavaOnevisionForConditionalGeneration`. Su proposito es servir como contrato ejecutable para validar integraciones de frameworks (Transformers, vLLM) sin necesidad de descargar ni ejecutar el modelo completo.

El repositorio incluye un manifiesto de contrato (`integration.json`), documentacion de uso para Transformers, un directorio de expectativas del framework y un fichero de procedencia (`build.json`). Los ficheros del procesador (tokenizer, preprocessor, chat template, etc.) se copian byte a byte del checkpoint original, de modo que la interfaz de entrada sea identica. El modelo se ha reducido aplicando una regla generica del script `sweep.py` del proyecto `transformers-mic`: 2 capas en el codificador visual y 2 capas en el modelo de texto.

La relevancia de esta ficha es acotada: no debe evaluarse como modelo de IA, sino como pieza de infraestructura de testing. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. Cualquier uso distinto de la validacion de integraciones carece de sentido, ya que los pesos son aleatorios y no han sido entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlavaOnevisionForConditionalGeneration (vision-language transformer, config reducida) |
| Parametros totales | 9.962.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura LLaVA-OneVision con un codificador visual y un modelo de lenguaje Qwen2, pero con la configuracion reducida: 2 capas ocultas en la torre visual y 2 capas ocultas en el modelo de texto. Los nombres de tensores coinciden con los del checkpoint real, lo que permite validar rutas de carga y firmas de modulo sin ambiguedad. Los pesos son aleatorios (semilla 17) y no han pasado por ningun proceso de entrenamiento, RLHF ni DPO.

La unica "validacion" aplicada es una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0.001 (la mas debil, `pixel_values:halve`, produce 0.302). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Los ficheros del procesador (`tokenizer.json`, `preprocessor_config.json`, `chat_template.json`, `video_preprocessor_config.json`, entre otros) se copian sin modificacion desde `llava-hf/llava-onevision-qwen2-0.5b-ov-hf`, garantizando compatibilidad de interfaz.

## Capacidades

- No dispone de capacidades funcionales reales: los pesos son aleatorios y no producen salidas semanticamente validas.
- Conserva la interfaz de entrada multimodal (imagen-texto) del checkpoint original gracias a los ficheros de procesador copiados.
- Permite validar la carga de `LlavaOnevisionForConditionalGeneration` en Transformers y en vLLM.
- Sirve para comprobar contratos de integracion: nombres de tensores, dtypes, formas de entrada y salida.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues reales.
- No incluye modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Pruebas de integracion en CI/CD: ejecutar la carga del modelo y un forward pass en pipelines automatizados sin descargar el checkpoint completo de ~0.5B parametros, reduciendo tiempo y ancho de banda.
- Validacion de compatibilidad con vLLM: comprobar que el motor de inferencia acepta la arquitectura y el contrato de entrada del modelo LLaVA-OneVision antes de desplegar el checkpoint real.
- Desarrollo de adaptadores de framework: verificar rutas de carga, firmas de modulo y nombres de tensores al anadir soporte para `LlavaOnevisionForConditionalGeneration` en una libreria nueva.
- Test de regresion de procesadores: al copiar los ficheros de tokenizer y preprocessor byte a byte, permite detectar cambios de comportamiento en el pipeline de preprocesado multimodal.
- Validacion de dtypes y precision: comprobar que el modelo es finito en float32, bfloat16 y float16 (forward, loss, gradientes) en distintas configuraciones de hardware.
- Documentacion de contratos: usar `integration.json` y el directorio de expectativas como referencia ejecutable para terceros que implementen la integracion.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture llava-onevision-qwen2-0.5b-ov-hf-vllm-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) careceria de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 (9,96M parametros, ~20 MB de pesos mas overhead de activaciones y procesador); no se han publicado medidas exactas.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para pruebas de contrato.
- Opciones de despliegue: Transformers (segun la documentacion incluida en `integrations/transformers/usage.md`) y vLLM (el nombre del repositorio lo indica como compatible).
- Latencia y throughput: no disponibles; al ser un fixture, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `huggingface-mic-temp/llava-onevision-qwen2-0.5b-ov-hf-vllm-mic` | 9,96M (fixture) | no disponible | no disponible | Artefacto de prueba |
| `llava-hf/llava-onevision-qwen2-0.5b-ov-hf` | ~0,5B | no disponible | no disponible | Modelo vision-language real |
| Otros fixtures del proyecto `transformers-mic` | variable (reducidos) | no disponible | no disponible | Artefactos de prueba |

No se dispone de datos de rendimiento comparables, ya que el modelo evaluado no ha sido entrenado.

## Limitaciones y advertencias

- Los pesos son aleatorios: las salidas no tienen valor semantico y no deben usarse para inferencia real.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; usarlo fuera de testing es un error de uso.
- Licencia no disponible: no se puede asumir permiso de uso comercial ni redistribucion mas alla del proposito de testing.
- Idiomas soportados no disponibles; la interfaz de tokenizer proviene del checkpoint original, pero el modelo no genera texto coherente.
- No apto para produccion, atencion al cliente, generacion de codigo ni ninguna tarea de usuario final.
- La reduccion de capas (2 en vision, 2 en texto) altera el comportamiento numerico respecto al checkpoint original; no sirve para validar calidad, solo contratos.
- Riesgo de confusion: el nombre incluye "qwen2-0.5b" pero el modelo real tiene ~0,5B de parametros, mientras que este fixture tiene 9,96M; conviene no confundirlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/llava-onevision-qwen2-0.5b-ov-hf-vllm-mic
- Modelo base: https://huggingface.co/llava-hf/llava-onevision-qwen2-0.5b-ov-hf
- Documentacion de uso en Transformers: https://huggingface.co/huggingface-mic-temp/llava-onevision-qwen2-0.5b-ov-hf-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas del framework: https://huggingface.co/huggingface-mic-temp/llava-onevision-qwen2-0.5b-ov-hf-vllm-mic/tree/main/integrations/transformers/expectations
- Manifiesto de contrato: https://huggingface.co/huggingface-mic-temp/llava-onevision-qwen2-0.5b-ov-hf-vllm-mic/blob/main/integration.json
- Procedencia del fixture: https://huggingface.co/huggingface-mic-temp/llava-onevision-qwen2-0.5b-ov-hf-vllm-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/llava-onevision-qwen2-0.5b-ov-hf-vllm-mic.html
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
