# huggingface-mic/gpt_oss-mic

## Resumen

`gpt_oss-mic` es un artefacto de prueba (test artifact) publicado por el usuario `huggingface-mic` en Hugging Face. No es un modelo funcional ni un fine-tune utilizable: se trata de una version "slim" (reducida) del modelo `openai/gpt-oss-20b` de OpenAI, generada para validar contratos de integracion con frameworks (concretamente Transformers). El repositorio incluye pesos reducidos, ejemplos de uso ejecutables y expectativas de framework en un unico paquete.

El modelo conserva la arquitectura `GptOssForCausalLM` del original, pero con la configuracion encogida a 2 capas ocultas (`num_hidden_layers 2`) y pesos aleatorios (semilla 17), lo que resulta en aproximadamente 26 millones de parametros (25.964.240 exactos segun safetensors). Los ficheros del procesador (tokenizer, chat template, generacion) se copian byte a byte del checkpoint original `openai/gpt-oss-20b`.

Su relevancia es exclusivamente para desarrolladores de infraestructura de IA: sirve como fixture de pruebas para verificar que las integraciones con Transformers funcionan correctamente sin necesidad de descargar el modelo real de 20B parametros. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. No debe confundirse con un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GptOssForCausalLM (transformer, config reducida a 2 capas) |
| Parametros totales | 25.964.240 (26,0M) |
| Parametros activos | no disponible (no es MoE en esta configuracion reducida) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo incluye LICENSE copiado del original) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es una version encogida del `GptOssForCausalLM` de `openai/gpt-oss-20b`, reducida mediante la regla generica de `sweep.py` del repositorio `transformers-mic`. La unica modificacion estructural es la reduccion de `num_hidden_layers` a 2. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que cualquier codigo que cargue el modelo original puede cargar este fixture sin cambios.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron mediante una "input-sensitivity gate": cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, produjo 0,447). Los pesos se guardan en float32 (el dtype por defecto de `openai/gpt-oss-20b`) y se verifico que son finitos en float32, bfloat16 y float16 (forward, perdida y gradientes). Los ficheros del procesador (`LICENSE`, `USAGE_POLICY`, `chat_template.jinja`, `generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte del modelo original.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de pruebas para validar la carga del modelo en Transformers.
- Permite verificar contratos de integracion (entradas, salidas, mascaras de atencion) sin descargar el modelo de 20B.
- Conserva el tokenizer y el chat template originales de `openai/gpt-oss-20b`.
- Soporta forward, calculo de perdida y gradientes en float32, bfloat16 y float16.
- No dispone de tool calling, agentes, vision ni capacidades multilingues reales (los pesos no han sido entrenados).

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture para verificar que la clase `GptOssForCausalLM` y los ficheros de procesador funcionan correctamente antes de usar el modelo real.
- CI/CD de librerias de inferencia: incluir el fixture en pipelines de integracion continua para detectar regresiones en la carga de checkpoints GPT-OSS sin coste de descarga ni GPU.
- Validacion de contratos de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen con pesos reales en el repositorio.
- Desarrollo de herramientas de sharding y conversion de pesos: usar los nombres de tensores identicos al original para probar utilidades de conversion sin manejar el checkpoint completo.
- Test de cuantizacion: verificar que los pipelines de conversion a bfloat16/float16 manejan correctamente los tensores del modelo.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture mic-gpt_oss-slim` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no tiene sentido evaluar su rendimiento en tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada: inferior a 0,2 GB en float32 (26M parametros), cabe en cualquier GPU consumer.
- GPU recomendadas: cualquiera con al menos 1 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en cualquier RTX o incluso en CPU.
- Opciones de despliegue: Transformers (uso previsto); llama.cpp, vLLM u Ollama no estan soportados de forma oficial para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la inferencia es practicamente instantanea, pero sin valor funcional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `huggingface-mic/gpt_oss-mic` | 26,0M | no disponible | no disponible | Fixture de pruebas |
| `openai/gpt-oss-20b` | 20B (aprox.) | no disponible | no disponible | Modelo real de produccion |
| Otros fixtures `transformers-mic` | variable (reducidos) | no disponible | no disponible | Pruebas de integracion |

La comparativa directa con modelos de la misma categoria no aplica: `gpt_oss-mic` es un artefacto de prueba, no un modelo de lenguaje. Su unico comparable logico es el checkpoint original `openai/gpt-oss-20b`, del que deriva pero con arquitectura reducida y pesos aleatorios.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y la salida carece de sentido.
- Etiquetado como `test-artifact`: no debe incluirse en busquedas de modelos candidatos ni en produccion.
- La licencia no esta declarada en los metadatos del repositorio; el fichero `LICENSE` copiado del original puede imponer restricciones adicionales.
- Solo cubre la configuracion reducida a 2 capas; no valida comportamientos dependientes de la profundidad real del modelo.
- No dispone de benchmarks, evaluaciones de sesgo ni datos de alineacion.
- El uso comercial no esta recomendado ni documentado.
- La fecha de creacion (2026-10-12) y actualizacion (2026-11-11) figuran en los metadatos; verificar su coherencia antes de citar el artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/gpt_oss-mic
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Contrato de integracion: https://huggingface.co/huggingface-mic/gpt_oss-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/gpt_oss-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/gpt_oss-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/gpt_oss-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gpt_oss-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
