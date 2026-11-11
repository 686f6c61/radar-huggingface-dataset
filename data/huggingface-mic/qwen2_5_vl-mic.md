# huggingface-mic/qwen2_5_vl-mic

## Resumen

`qwen2_5_vl-mic` es un artefacto de prueba (test artifact) publicado por la organizacion `huggingface-mic`, no un modelo entrenado utilizable. Se presenta como una version "slim" (reducida) de `Qwen/Qwen2.5-VL-3B-Instruct`, con solo 11.289.024 parametros reales segun los pesos en safetensors, frente a los aproximadamente 3.750 millones del modelo base. Su proposito es servir como fixture para validar contratos de integracion y expectativas de frameworks (Transformers, entre otros) sin necesidad de descargar el checkpoint completo.

El repositorio incluye pesos reducidos, ejemplos de uso ejecutables y un directorio de expectativas de framework, todo ello acompanado de un manifiesto de contrato (`integration.json`) y metadatos de procedencia (`build.json`). La arquitectura declarada es `Qwen2_5_VLForConditionalGeneration`, la misma que el modelo original, pero con la configuracion encogida mediante una regla generica (2 capas de texto en lugar de las 36 del 3B). Los pesos son aleatorios (semilla 17) y no han sido entrenados.

Es relevante unicamente en el contexto de ingenieria de infraestructura de modelos: permite probar pipelines de carga, tokenizacion, procesamiento de imagenes y verificacion de tensores con un coste de descarga y computo minimo. No debe confundirse con un modelo multimodal funcional ni usarse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2_5_VLForConditionalGeneration (transformer multimodal, configuracion reducida) |
| Parametros totales | 11.289.024 (pesos reales en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo copia byte a byte el fichero `LICENSE` del modelo base) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo replica la clase `Qwen2_5_VLForConditionalGeneration` del checkpoint `Qwen/Qwen2.5-VL-3B-Instruct`, pero con una configuracion encogida por la regla generica de `sweep.py`: en concreto, el texto queda reducido a 2 capas (`num_hidden_layers` 2). Los ficheros de procesador (`chat_template.json`, `generation_config.json`, `merges.txt`, `preprocessor_config.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`, `LICENSE`) se copian byte a byte desde el modelo base, de modo que la tokenizacion y el preprocesado de imagen son identicos a los del 3B original.

No ha habido entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una compuerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0.001 (el caso mas debil, `pixel_values:halve`, produce 0.0718). Los nombres de tensores coinciden con los del checkpoint real y el modelo es finito en float32, bfloat16 y float16 (forward, loss y gradientes). La fixture cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el encogimiento (clave de fixture `93f8e61d11ad`).

## Capacidades

- Carga y ejecucion en Transformers como modelo multimodal imagen+texto con la misma interfaz que `Qwen2.5-VL-3B-Instruct`.
- Verificacion de contratos de integracion: el repo incluye `integration.json` y un directorio de expectativas de framework.
- Pruebas de sensibilidad de entradas: se valido que perturbaciones en `pixel_values` y entradas de texto alteran los logits.
- Compatibilidad de nombres de tensores con el checkpoint real, util para tests de carga y conversion.
- No dispone de capacidades reales de generacion, razonamiento, codigo, matematicas, vision funcional, tool calling ni agentes: los pesos son aleatorios.
- No se declaran capacidades multilingues ni modos especiales (thinking, audio, etc.).

## Casos de uso

- Pruebas de integracion en CI: cargar el modelo con Transformers y verificar que la tokenizacion, el procesador de imagen y los nombres de tensores coinciden con los del checkpoint real, sin descargar los ~7 GB del 3B.
- Validacion de pipelines de despliegue: comprobar que vLLM, TGI u otros servidores aceptan la configuracion y el formato safetensors antes de pasar al modelo completo.
- Desarrollo de utilidades de conversion: testear scripts que convierten safetensors a GGUF u otros formatos con un modelo de 11M de parametros que cabe en cualquier equipo.
- Verificacion de chat templates: al copiarse `chat_template.json` byte a byte, permite validar el renderizado de conversaciones multi-turno y el formato de mensajes del modelo base.
- Tests de preprocesado de imagen: `preprocessor_config.json` es identico al original, por lo que sirve para validar redimensionado, normalizacion y parches visuales en pipelines propios.
- Regresion de frameworks: usar el directorio `integrations/transformers/expectations` para detectar cambios incompatibles en nuevas versiones de Transformers.
- Benchmarking de infraestructura: medir latencia de carga y overhead de framework con un modelo minimo antes de escalar al checkpoint real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (11,3M de parametros, ~22,6 MB de pesos) mas overhead de framework y buffers de activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien ejecutable en CPU.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (referencia del repo), potencialmente llama.cpp u Ollama si se convierte, aunque no se documenta soporte oficial.
- Latencia y throughput: no disponibles; al ser un fixture de test, las cifras no son representativas de ningun modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/qwen2_5_vl-mic | 11,3M (fixture) | no disponible | Test artifact / fixture de integracion | no disponible | Hugging Face |
| Qwen/Qwen2.5-VL-3B-Instruct | ~3,75B | no disponible en esta ficha | Modelo multimodal real | no disponible en esta ficha | Hugging Face |
| Otros fixtures de la organizacion huggingface-mic | variable (reducidos) | no disponible | Test artifacts | no disponible | Hugging Face |

La comparativa con modelos reales de la misma categoria (multimodales de ~3B) no procede: este repositorio no es un modelo funcional. Frente al checkpoint base, la unica diferencia medible es el numero de parametros (11,3M frente a ~3,75B) y la reduccion a 2 capas de texto.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no han sido entrenados; las salidas carecen de significado.
- Etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.
- No dispone de licencia declarada en la informacion disponible; el fichero `LICENSE` se copia del modelo base, por lo que las condiciones reales dependen de `Qwen/Qwen2.5-VL-3B-Instruct`.
- Riesgo de confusion: el nombre y la arquitectura pueden llevar a desplegarlo por error en produccion; no debe usarse para atencion al cliente, generacion de codigo ni ninguna tarea real.
- La configuracion reducida (2 capas) no reproduce el comportamiento del 3B; los tests de calidad o de capacidades no son extrapolables.
- Los sesgos, alucinaciones y limitaciones de idioma del modelo base no aplican directamente, pero tampoco estan caracterizados en este artefacto.
- El tamano del repo es 0.0 GB, lo que puede indicar que los pesos no estan completamente subidos o que el empaquetado es minimo; conviene verificar `build.json` antes de confiar en la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/qwen2_5_vl-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Como se encogio la fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen2_5_vl-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato (en el repo): `integration.json`
- Uso con Transformers (en el repo): `integrations/transformers/usage.md`
- Expectativas de Transformers (en el repo): `integrations/transformers/expectations`
- Procedencia de la fixture (en el repo): `build.json`
