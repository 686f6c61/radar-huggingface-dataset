# huggingface-mic/vit-mic

## Resumen

`huggingface-mic/vit-mic` no es un modelo de vision utilizable, sino un artefacto de prueba (fixture) publicado por el equipo de Hugging Face MIC para validar la integracion de `google/vit-base-patch16-224` con la libreria Transformers. Se trata de una version "adelgazada" del checkpoint original que conserva la misma arquitectura (`ViTForImageClassification`) pero reduce la configuracion a 2 capas ocultas, resultando en 193.960 parametros totales segun los pesos en safetensors. El repositorio incluye pesos, contrato de integracion, expectativas de framework y procedencia de la fixture en un unico lugar.

El objetivo del artefacto es servir como banco de pruebas reproducible: valida la carga del modelo, la ejecucion en forward, el calculo de perdida y gradientes en float32, bfloat16 y float16, y registra una linea base en proceso limpio sobre una GPU NVIDIA A10G. La model card indica explicitamente que es un "test artifact, not a usable model", etiquetado con `test-artifact` para excluirlo de busquedas de modelos candidatos.

Por tanto, esta ficha debe leerse como documentacion de un fixture de integracion, no como la de un modelo desplegable. Cualquier uso en produccion, evaluacion de calidad o comparativa de capacidades carece de sentido con este checkpoint: los pesos estan sobreajustados al paso de entrenamiento del contrato (300 pasos) y no representan ninguna tarea real de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (Vision Transformer), `ViTForImageClassification` |
| Parametros totales | 193.960 (pesos safetensors publicados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; no hay contexto textual) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; validado tambien en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |
| Modelo base | `google/vit-base-patch16-224` (fine-tune/derivado) |
| Capas ocultas | 2 (`num_hidden_layers: 2`) |
| Preprocesador | `preprocessor_config.json` copiado byte a byte del checkpoint original |
| Dtype de carga por defecto | float32 |
| Tamano del repo | 0,0 GB |
| Descargas | 3.324 |
| Likes | 0 |
| Fecha de creacion | 2026-10-12 |
| Fecha de actualizacion | 2026-11-12 |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer (`ViTForImageClassification`) derivado de `google/vit-base-patch16-224` mediante la regla generica de reduccion implementada en `sweep.py` del repositorio `huggingface/transformers-mic`. La reduccion consiste en disminuir `num_hidden_layers` a 2, manteniendo los mismos nombres de tensores que el checkpoint real y copiando el fichero `preprocessor_config.json` sin modificaciones. Los pesos se guardan en float32, que es el dtype con el que carga por defecto el checkpoint original.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens vistos ni si hubo RLHF o DPO; la model card solo indica que la fixture esta sobreajustada al paso de entrenamiento del contrato (300 pasos). Los pesos aleatorios no superaron la puerta de sensibilidad a la entrada: la perturbacion `pixel_values:reverse` movia los logits solo 5,9e-05, por debajo del umbral de 0,001, lo que motivo el sobreajuste. El artefacto es finito en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes. La validacion se ejecuto en una NVIDIA A10G con variantes por defecto, eager y bfloat16, y con grabacion de linea base en proceso limpio.

## Capacidades

- No es un modelo funcional: la model card lo describe como "test artifact, not a usable model".
- Clasificacion de imagenes en la arquitectura `ViTForImageClassification`, pero sin pesos entrenados para ninguna tarea real.
- Carga y ejecucion validadas en Transformers con las variantes por defecto, eager y bfloat16.
- Forward, calculo de perdida y gradientes finitos en float32, bfloat16 y float16.
- Nombres de tensores identicos al checkpoint real `google/vit-base-patch16-224`, lo que permite probar rutas de carga sin descargar el modelo completo.
- Preprocesador compatible byte a byte con el original (`preprocessor_config.json`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues ni thinking mode.
- No dispone de vision funcional mas alla de la forma del tensor de entrada.

## Casos de uso

- Pruebas de integracion en Transformers: sirve para validar que la ruta de carga de `ViTForImageClassification` funciona sin descargar el checkpoint completo de `google/vit-base-patch16-224`, reduciendo tiempo y ancho de banda en CI.
- Validacion de contrato de framework: el repositorio incluye `integration.json`, `integrations/transformers/usage.md` y `integrations/transformers/expectations`, de modo que un pipeline puede comprobar que la API publica se comporta como se espera.
- Pruebas de dtypes en GPU: permite verificar en una A10G que forward, perdida y gradientes son finitos en float32, bfloat16 y float16 antes de ejecutar la misma bateria contra el modelo real.
- Regresion de nombres de tensores: al conservar los mismos nombres que el checkpoint original, se puede detectar un cambio accidental en el mapeo de pesos sin cargar el modelo completo.
- Reproducibilidad de fixtures: `build.json` registra fuentes fijadas, resultados de las puertas y hashes de ficheros, lo que permite reconstruir el artefacto con `python example/build_fixtures.py --fixture mic-vit-slim`.
- Validacion de preprocesado: al copiar `preprocessor_config.json` byte a byte, se puede comprobar que el pipeline de imagenes produce tensores compatibles con el modelo base.
- Exencion en busquedas de modelos: la etiqueta `test-artifact` permite excluir el repositorio de busquedas de modelos candidatos en catalogos internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta resultados de puertas de validacion (sensibilidad a la entrada con umbral 0,001 y finitud numerica en tres dtypes), no metricas de calidad como MMLU, HumanEval o GSM8K, que ademas no aplican a un modelo de vision.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint tiene 193.960 parametros en float32 (menos de 1 MB de pesos) y el repo ocupa 0,0 GB.
- GPU recomendadas: cualquier GPU con soporte de Transformers; la validacion documentada se hizo en una NVIDIA A10G.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (validado en las variantes por defecto, eager y bfloat16). No hay evidencia de soporte para vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo de lenguaje estas herramientas no aplican.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/vit-mic` | 193.960 | no aplica | fixture de integracion | no disponible | Hugging Face |
| `google/vit-base-patch16-224` | ~86 M (no confirmado en la informacion disponible) | no aplica | clasificacion de imagenes | no disponible | Hugging Face |
| Otros fixtures MIC | no disponible | no aplica | pruebas de contrato | no disponible | Hugging Face |

La comparativa directa con modelos de la misma categoria no esta disponible en la informacion proporcionada. El unico comparable claro es el checkpoint base `google/vit-base-patch16-224`, del que este artefacto deriva y del que se diferencia por la reduccion a 2 capas ocultas y por su proposito exclusivamente de prueba.

## Limitaciones y advertencias

- No es un modelo utilizable: la propia model card lo declara "test artifact, not a usable model".
- Los pesos estan sobreajustados al paso de entrenamiento del contrato (300 pasos) y no generalizan a ninguna tarea.
- Los pesos aleatorios no superaron la puerta de sensibilidad a la entrada (5,9e-05 frente al umbral 0,001), lo que confirma que la fixture no responde de forma significativa a perturbaciones de entrada.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones de idioma porque el artefacto no esta pensado para inferencia real.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas no disponibles.
- El alcance del contrato es solo la fixture; la model card indica que la cobertura del checkpoint completo es un trabajo separado.
- No debe incluirse en catalogos de modelos candidatos; para eso existe la etiqueta `test-artifact`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/vit-mic
- Modelo base: https://huggingface.co/google/vit-base-patch16-224
- Manifiesto del contrato: https://huggingface.co/huggingface-mic/vit-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/vit-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/vit-mic/tree/main/integrations/transformers/expectations
- Procedencia de la fixture: https://huggingface.co/huggingface-mic/vit-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/vit-mic.html
- Evidencia de regeneracion (GitHub Actions): https://github.com/huggingface/transformers-mic/actions/runs/38252430459
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla generica de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
