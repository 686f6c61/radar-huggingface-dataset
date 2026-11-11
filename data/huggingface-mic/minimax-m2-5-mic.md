# huggingface-mic/MiniMax-M2.5-mic

## Resumen

MiniMax-M2.5-mic es un artefacto de prueba (fixture) publicado por la organización huggingface-mic, no un modelo utilizable. Se trata de una versión reducida del modelo MiniMaxAI/MiniMax-M2.5, generada automáticamente mediante la herramienta `transformers-mic` para verificar la integración de frameworks (en este caso, Transformers) con la arquitectura MiniMaxM2. El repositorio contiene pesos "slim" de 25,8 millones de parámetros con pesos aleatorios (semilla 17), junto con el manifiesto de contrato, la documentación de uso y las expectativas del framework.

El propósito de este artefacto es servir como banco de pruebas reproducible: cubre todos los checkpoints cuyos ficheros de procesador son idénticos byte a byte y cuya configuración coincide tras el proceso de reducción. Mantiene los mismos nombres de tensores que el checkpoint real y los mismos ficheros de procesador (tokenizer, chat template, código de modelado), pero con solo 2 capas ocultas en lugar de la configuración completa del modelo original. Está etiquetado explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

Para desarrolladores e investigadores, este repositorio es relevante únicamente como referencia de integración: permite validar que el pipeline de Transformers carga, ejecuta y propaga gradientes correctamente con la arquitectura MiniMaxM2 sin necesidad de descargar el modelo completo. No debe confundirse con un modelo funcional ni utilizarse para inferencia real, generación de texto o cualquier tarea de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMaxM2ForCausalLM (transformer causal, versión reducida a 2 capas ocultas) |
| Parametros totales | 25.830.408 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; finito también en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El artefacto replica la arquitectura `MiniMaxM2ForCausalLM` del modelo base MiniMaxAI/MiniMax-M2.5, pero con la configuración reducida mediante la regla genérica de `sweep.py` del repositorio transformers-mic: `num_hidden_layers` igual a 2. Los ficheros de procesador (`configuration_minimax_m2.py`, `modeling_minimax_m2.py`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`, `merges.txt`, `chat_template.jinja`, `generation_config.json`, `LICENSE-MODEL`) se copian byte a byte desde el checkpoint original, de modo que la lógica de tokenización, plantilla de chat y modelado es idéntica a la del modelo real.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y superaron una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `input_ids:roll_batch`, produjo 0,635), por lo que no se consideró necesario entrenar. El artefacto es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture es `caec3890e5c1` y el build está registrado en `build.json` con fuentes fijadas, resultados de la puerta y hashes de ficheros.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de integración para validar la carga y ejecución de la arquitectura MiniMaxM2 en Transformers.
- Verifica la propagación de gradientes y la finitud numérica en float32, bfloat16 y float16.
- Comprueba la compatibilidad de los ficheros de procesador (tokenizer, chat template) copiados del modelo base.
- Mantiene los mismos nombres de tensores que el checkpoint real, lo que permite validar mapeos de pesos.
- No dispone de tool calling, agentes, visión, audio ni modo thinking utilizables, al no ser un modelo entrenado.
- Capacidades multilingües: no disponibles (el tokenizer es el del modelo base, pero el modelo no genera texto válido).

## Casos de uso

- Validación de integración en Transformers: cargar el fixture con `AutoModelForCausalLM` para comprobar que la arquitectura `MiniMaxM2ForCausalLM` se instancia y ejecuta sin errores antes de descargar el checkpoint completo.
- Pruebas de CI/CD en pipelines de ML: usar el fixture como sustituto ligero del modelo real en tests automáticos que verifiquen shapes, dtypes y flujos de forward/backward sin consumir recursos de GPU.
- Verificación de mapeo de pesos: comprobar que los nombres de tensores del checkpoint real coinciden con los del fixture, detectando discrepancias en conversiones o cuantizaciones.
- Desarrollo de tooling de serialización: probar cargas y guardados en safetensors, float32/bfloat16/float16, y validar que no aparecen NaN o infinitos.
- Validación de plantillas de chat y tokenizer: al copiarse byte a byte del modelo base, permite testear el renderizado de `chat_template.jinja` y la tokenización sin cargar el modelo completo.
- Reproducibilidad de experimentos: el `build.json` con hashes y fuentes fijadas permite reconstruir el fixture y comparar resultados entre entornos.
- Docencia y demostración de arquitecturas: ilustrar la estructura de un transformer causal MiniMaxM2 con un modelo de 2 capas y 25,8M de parámetros que cabe en cualquier equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, los benchmarks no tendrían significado.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 (25,8M de parámetros, ~103 MB de pesos) más overhead de activaciones y tokenizer.
- GPU recomendadas: cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) o incluso CPU; no requiere aceleradores de datacenter.
- Cabe holgadamente en cualquier GPU consumer y en memoria de sistema para ejecución en CPU.
- Opciones de despliegue: Transformers (con `trust_remote_code=True` por el código custom), y potencialmente llama.cpp/Ollama si se convierte a GGUF, aunque no es el propósito del artefacto.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la inferencia sería prácticamente instantánea, pero los resultados no son utilizables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M2.5-mic | 25,8M | no disponible | Fixture de integración (test-artifact) | no disponible | Hugging Face |
| MiniMaxAI/MiniMax-M2.5 | no disponible en la informacion | no disponible | Modelo causal real | no disponible | Hugging Face |
| Fixtures de otras arquitecturas en transformers-mic | variable (reducidos) | no disponible | Pruebas de integración | no disponible | Hugging Face (org huggingface-mic) |

La comparación directa con modelos funcionales de la misma categoría no es posible, ya que MiniMax-M2.5-mic no es un modelo entrenado. Su alternativa natural son otros fixtures de la misma organización o el propio modelo base, del que solo se conoce el identificador y la arquitectura.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto coherente ni puede usarse para inferencia real.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe tratarse como modelo de producción.
- No se dispone de información sobre licencia, idiomas, contexto ni cuantizaciones; no se puede garantizar su uso comercial.
- El repositorio incluye `LICENSE-MODEL` copiado del modelo base, pero su contenido no se detalla en la información proporcionada.
- Requiere `trust_remote_code=True` por el código custom (`modeling_minimax_m2.py`, `configuration_minimax_m2.py`), lo que implica ejecutar código del repositorio.
- Solo cubre checkpoints cuyos ficheros de procesador son idénticos byte a byte y cuya configuración coincide tras la reducción; no es representativo de variantes con otra configuración.
- Riesgo de confusión: el nombre puede llevar a pensar que es una versión ligera utilizable de MiniMax-M2.5, cuando es un fixture de pruebas.
- No apto para evaluación de calidad, benchmarks de razonamiento ni comparativas de rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/MiniMax-M2.5-mic
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M2.5
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/MiniMax-M2.5-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reducción (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/MiniMax-M2.5-mic/blob/main/integration.json
- Uso en Transformers (`integrations/transformers/usage.md`): https://huggingface.co/huggingface-mic/MiniMax-M2.5-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers (`integrations/transformers/expectations`): https://huggingface.co/huggingface-mic/MiniMax-M2.5-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/MiniMax-M2.5-mic/blob/main/build.json
