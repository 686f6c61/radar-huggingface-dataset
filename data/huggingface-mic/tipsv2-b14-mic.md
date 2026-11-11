# huggingface-mic/tipsv2-b14-mic

## Resumen

`tipsv2-b14-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic`, no un modelo utilizable en produccion. Se trata de una version reducida del modelo multimodal `google/tipsv2-b14` (TIPSv2, encoder imagen-texto), con la misma arquitectura `Tipsv2Model` pero con solo 2 capas ocultas en el codificador de texto y 2 en el de vision, lo que deja el total en 2.318.912 parametros. Su proposito es servir como fixture de integracion para validar contratos de frameworks (concretamente Transformers) sin necesidad de descargar el checkpoint completo.

El repositorio incluye pesos "slim", ejemplos de uso ejecutables y un directorio de expectativas de framework, todo empaquetado junto con un manifiesto de contrato (`integration.json`) y la procedencia de la construccion (`build.json`). Los pesos son aleatorios (semilla 17) y no han sido entrenados: pasaron unicamente una puerta de sensibilidad a la entrada, de modo que cualquier perturbacion de las entradas del contrato mueve los logits al menos 0.001.

Es relevante ahora porque el ecosistema de integracion de modelos necesita fixtures ligeros y deterministas para tests de CI, y este artefacto cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el proceso de reduccion. No debe confundirse con un modelo de inferencia real: la propia model card lo etiqueta como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Tipsv2Model` (encoder imagen-texto, transformer reducido) |
| Parametros totales | 2.318.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es una instancia reducida de `Tipsv2Model`, la arquitectura del checkpoint `google/tipsv2-b14` orientada a tareas imagen-texto con metodos `encode_image` y `encode_text`. La reduccion se aplica mediante la regla generica de `sweep.py` del repositorio `transformers-mic`: se fijan 2 capas ocultas en el codificador de texto y 2 en el de vision, manteniendo los mismos nombres de tensores que el checkpoint real. Los ficheros de procesador (`configuration_tips.py`, `image_encoder.py`, `modeling_tips.py`, `processor_config.json`, `text_encoder.py`, `tokenizer.model`, `tokenizer_config.json`) se copian byte a byte desde `google/tipsv2-b14`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0.001 (la mas debil, `pixel_values:reverse`, produce 0.0375). El modelo se guarda en float32, el dtype por defecto de carga de `google/tipsv2-b14`, y se verifica que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture es `4fa35b9d60f3`.

## Capacidades

- No es un modelo funcional: no genera texto, no razona, no responde a prompts y no produce representaciones utiles.
- Expone la interfaz de contrato TIPSv2 imagen-texto (`encode_image` / `encode_text`) para validacion de integraciones.
- Sirve como fixture de pruebas para verificar que un framework carga correctamente la arquitectura, el procesador y los nombres de tensores.
- Permite comprobar sensibilidad a la entrada en pipelines de CI (perturbaciones minimas detectables en logits).
- Compatible con ejecucion en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- No dispone de tool calling, function calling, capacidades de agente, modo thinking, audio ni vision funcional.
- Capacidades multilingues: no disponible.

## Casos de uso

- Tests de integracion en Transformers: usar el fixture para verificar que la clase `Tipsv2Model` se instancia, carga y ejecuta forward pass con las formas de entrada esperadas, sin descargar el checkpoint completo de 2.3M parametros reales.
- Validacion de contratos de framework: comprobar que los ficheros de procesador y tokenizer copiados desde `google/tipsv2-b14` se cargan correctamente y que el manifiesto `integration.json` se respeta en cada release.
- CI/CD de librerias de modelado: ejecutar la suite de pruebas en cada pull request con un artefacto ligero y determinista (semilla 17) que garantiza resultados reproducibles.
- Verificacion de puertas de sensibilidad: integrar el fixture en tests que comprueben que perturbaciones de `pixel_values` o de las entradas de texto alteran los logits por encima del umbral de 0.001.
- Pruebas de compatibilidad de dtypes: validar que el pipeline de carga y ejecucion funciona en float32, bfloat16 y float16 sin producir NaN ni infinitos en forward, loss o gradientes.
- Desarrollo de utilidades de reduccion de modelos: emplear `build.json` y el script `build_fixtures.py` como referencia para generar fixtures propios a partir de checkpoints reales.
- Documentacion de integraciones: usar `integrations/transformers/usage.md` y el directorio de expectativas como ejemplo ejecutable de como integrar TIPSv2 en un framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto es un fixture de pruebas con pesos aleatorios y no esta destinado a evaluacion de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (2.318.912 parametros, aproximadamente 9,3 MB de pesos mas overhead de activaciones y procesador).
- GPU recomendadas: cualquier GPU consumer o integrada; no requiere acelerador dedicado. Funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: carga via Transformers (con `trust_remote_code` por el tag `custom_code`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia es practicamente despreciable, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/tipsv2-b14-mic` | 2.318.912 | no disponible | Fixture de test | no disponible | Hugging Face |
| `google/tipsv2-b14` | no disponible | no disponible | Modelo imagen-texto real | no disponible | Hugging Face |
| Otros fixtures `huggingface-mic` | variable (reducidos) | no disponible | Fixtures de test | no disponible | Hugging Face |

La comparativa directa con modelos de produccion no es significativa: el artefacto no compite en tareas de inferencia real. Frente a `google/tipsv2-b14`, la diferencia clave es que este ultimo contiene todos los parametros y esta pensado para uso funcional, mientras que el fixture solo replica la estructura para tests.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas no tienen significado semantico.
- No debe emplearse en produccion, atencion al cliente, generacion de codigo ni ninguna tarea de inferencia real.
- Sesgos conocidos: no aplica, al no haber entrenamiento; no obstante, hereda la estructura del modelo base sin sus capacidades.
- Riesgo de alucinacion: total, en el sentido de que cualquier salida es ruido sin relacion con la entrada.
- Limitaciones de contexto o idioma: no disponibles; el fixture no documenta ventana de contexto ni cobertura linguistica.
- Restricciones de licencia: la licencia no esta disponible, lo que impide asumir permiso de uso comercial sin consultar al autor.
- Requiere `trust_remote_code` por el tag `custom_code`, con el riesgo de seguridad que ello implica en entornos no controlados.
- El tamano del repo figura como 0.0 GB, lo que puede inducir a error sobre el contenido real; verificar los ficheros antes de integrar.
- La fecha de creacion (2026-10-30) y actualizacion (2026-11-11) son posteriores a la fecha actual de redaccion, lo que conviene contrastar con la fuente original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/tipsv2-b14-mic
- Modelo base: https://huggingface.co/google/tipsv2-b14
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/tipsv2-b14-mic.html
- Script de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Procedencia de la construccion: `build.json` (en el repositorio)
- Uso en Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
