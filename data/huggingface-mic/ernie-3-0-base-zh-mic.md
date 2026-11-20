# huggingface-mic/ernie-3.0-base-zh-mic

## Resumen

`huggingface-mic/ernie-3.0-base-zh-mic` no es un modelo utilizable en produccion, sino un *fixture* de test publicado por la organizacion `huggingface-mic` como parte de la infraestructura `transformers-mic` del ecosistema Hugging Face. Reproduce la arquitectura de `nghuyong/ernie-3.0-base-zh` (un ERNIE 3.0 base en chino) con una configuracion reducida a 2 capas ocultas y pesos aleatorios (semilla 17), totalizando 2.802.880 parametros. Su proposito es servir como artefacto de verificacion de contratos de integracion con frameworks (Transformers), no como modelo de lenguaje funcional.

El repositorio incluye pesos *slim* en safetensors, un manifiesto de contrato (`integration.json`), documentacion de uso y expectativas de framework (`integrations/transformers/usage.md` y `integrations/transformers/expectations`), y metadatos de procedencia (`build.json`). Los ficheros de procesador (`vocab.txt`) se copian byte a byte del checkpoint original, y los nombres de tensores coinciden con los del checkpoint real, lo que permite validar pipelines de carga sin descargar el modelo completo.

Es relevante ahora por su funcion dentro del tooling de validacion de modelos de Hugging Face: permite a desarrolladores comprobar que sus integraciones (carga, forward, sensibilidad a entradas, dtypes fp32/bf16/fp16) funcionan correctamente sobre una arquitectura ERNIE real antes de escalar a checkpoints de mayor tamano. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ERNIE (`ErnieForMaskedLM`), reducido a 2 capas ocultas |
| Parametros totales | 2.802.880 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible (vocabulario heredado de `nghuyong/ernie-3.0-base-zh`, orientado a chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es una instancia reducida de `ErnieForMaskedLM`, la cabeza de modelado de lenguaje enmascarado de ERNIE 3.0. La contraccion se aplico mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, reduciendo `num_hidden_layers` a 2. Los ficheros de procesador (`vocab.txt`) se copiaron byte a byte desde `nghuyong/ernie-3.0-base-zh`, manteniendo la tokenizacion original. Los pesos son aleatorios (semilla 17) y no han pasado por entrenamiento alguno: superaron unicamente una puerta de sensibilidad a entradas, en la que cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (caso mas debil: `attention_mask:all_ones`, 0,00221).

Los nombres de tensores coinciden con el checkpoint real, y los pesos se guardan en float32 (el dtype con el que carga por defecto `nghuyong/ernie-3.0-base-zh`). Se verifica que el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture cubre todos los checkpoints cuyos ficheros de procesador son byte-identicos y cuya config coincide tras la contraccion (clave de fixture `0ea57cf23634`). La construccion la realiza `build_fixtures.py`, y `build.json` registra las fuentes fijadas, los resultados de las puertas y los hashes de ficheros.

## Capacidades

- Carga y ejecucion de la arquitectura `ErnieForMaskedLM` con nombres de tensores identicos al checkpoint original.
- Verificacion de contratos de integracion con Transformers mediante `integration.json` y el directorio `integrations/transformers/expectations`.
- Prueba de sensibilidad de entradas sobre logits (validacion de que perturbaciones producen cambios medibles).
- Comprobacion de estabilidad numerica en float32, bfloat16 y float16 (forward, loss y gradientes).
- Validacion de tokenizacion usando `vocab.txt` original.
- No dispone de capacidades generativas, de razonamiento, de codigo, de tool calling ni de agentes: los pesos son aleatorios.
- No dispone de capacidades multilingues funcionales mas alla de la tokenizacion heredada.

## Casos de uso

- Validacion de pipelines de carga de modelos: usar el fixture para comprobar que un loader de Transformers resuelve correctamente la configuracion, los nombres de tensores y los ficheros de procesador de ERNIE 3.0 antes de descargar el checkpoint completo de 118M parametros aproximados (no confirmado en la informacion disponible).
- Test de integracion en CI: ejecutar `ErnieForMaskedLM` sobre este fixture en suites automatizadas para detectar regresiones en la capa de modelado enmascarado sin coste de ancho de banda ni de GPU.
- Verificacion de estabilidad numerica por dtype: comprobar que un framework produce valores finitos en forward, loss y gradientes en fp32, bf16 y fp16 sobre esta arquitectura.
- Validacion de tokenizadores: probar el pipeline de tokenizacion con el `vocab.txt` original de `nghuyong/ernie-3.0-base-zh` sin depender del checkpoint completo.
- Pruebas de sensibilidad a entradas: usar las perturbaciones de `attention_mask` y entradas del contrato para verificar que un wrapper o runtime propaga correctamente las mascaras.
- Desarrollo de herramientas de contraccion de modelos: usar `sweep.py` y `build_fixtures.py` como referencia para generar fixtures equivalentes de otros checkpoints.
- Auditoria de contratos de integracion: consumir `integration.json` y `build.json` para validar hashes, procedencia y expectativas declaradas por el framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card indica explicitamente que es un artefacto de test con pesos aleatorios, por lo que no procede evaluar calidad de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (2,8M parametros); en la practica cabe en CPU.
- GPU recomendadas: innecesarias; cualquier GPU consumer (por ejemplo RTX 3060, RTX 4090) sobra ampliamente. Tambien funciona en CPU.
- Cabe en consumer GPU: si, en cualquier GPU con al menos unos cientos de MB libres, y en CPU.
- Opciones de despliegue: Transformers (uso documentado en `integrations/transformers/usage.md`); vLLM, llama.cpp, Ollama y TGI no estan indicados en la informacion disponible para este artefacto.
- Latencia y throughput estimados: no disponibles; al ser pesos aleatorios y 2 capas, la latencia seria minima, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/ernie-3.0-base-zh-mic` (este) | 2.802.880 | no disponible | Fixture de test | no disponible | Hugging Face |
| `nghuyong/ernie-3.0-base-zh` | no disponible en la informacion (checkpoint base real de ERNIE 3.0 base) | no disponible | Modelo de lenguaje en chino utilizable | no disponible | Hugging Face |
| Otros fixtures `transformers-mic` | variable | no disponible | Fixtures de test por arquitectura | no disponible | Hugging Face (`huggingface-mic`) |

No se dispone de datos de rendimiento comparables, dado que este artefacto no esta entrenado.

## Limitaciones y advertencias

- Pesos aleatorios (semilla 17): no produce salidas linguisticas coherentes; no debe usarse para inferencia real.
- Etiquetado como `test-artifact`: excluido intencionadamente de busquedas de modelos candidatos.
- Configuracion contraida (2 capas): no representa la calidad ni el comportamiento del checkpoint original.
- Licencia no disponible: no se puede confirmar el regimen de uso comercial.
- Idiomas y contexto no disponibles en la informacion proporcionada.
- Riesgo de confusion: el nombre puede sugerir un modelo ERNIE funcional; conviene revisar `build.json` y `integration.json` antes de integrarlo.
- Procedencia: los ficheros distintos de pesos, uso y expectativas deben regenerarse con `python example/build_fixtures.py --fixture ernie-3.0-base-zh-mic`.
- No apto para produccion, evaluacion de calidad ni benchmarks de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/ernie-3.0-base-zh-mic
- Modelo base: https://huggingface.co/nghuyong/ernie-3.0-base-zh
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de contraccion `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Explicacion del proceso de contraccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/ernie-3.0-base-zh-mic.html
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/ernie-3.0-base-zh-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/ernie-3.0-base-zh-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/ernie-3.0-base-zh-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/ernie-3.0-base-zh-mic/blob/main/build.json
