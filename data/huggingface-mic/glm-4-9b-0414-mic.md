# huggingface-mic/GLM-4-9B-0414-mic

## Resumen

`huggingface-mic/GLM-4-9B-0414-mic` no es un modelo utilizable: es un artefacto de prueba (fixture) de 19,5 millones de parámetros construido por el equipo de Hugging Face MIC para validar la integración de frameworks con la arquitectura GLM-4. Deriva de `zai-org/GLM-4-9B-0414` mediante una reducción genérica de configuración (2 capas ocultas en lugar de las del modelo original) y conserva los nombres de tensores, el tokenizer y los ficheros de procesador byte a byte del checkpoint real.

Su propósito es servir como fixture de test: pesos aleatorios (semilla 17) que pasaron una puerta de sensibilidad de entrada, guardados en bfloat16 y finitos en float32, bfloat16 y float16 para forward, pérdida y gradientes. Está etiquetado `test-artifact` para excluirlo de la búsqueda de modelos candidatos. Cualquier evaluación de capacidades, benchmarks o uso en producción queda fuera de su alcance por diseño.

La relevancia de esta ficha es, por tanto, documental: describe qué contiene el repositorio, cómo se generó y para qué sirve, y advierte explícitamente de que no debe confundirse con el GLM-4-9B-0414 original de Zhipu AI (zai-org), que sí es un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glm4ForCausalLM (transformer causal decoder-only, versión reducida) |
| Parametros totales | 19.473.216 (19,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config del modelo base, no verificada en la información) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito también en float32 y float16) |
| Idiomas soportados | no disponibles (tokenizer copiado del modelo base) |
| Licencia | no disponible (el fichero LICENSE se copia del modelo base, pero su contenido no se detalla) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture reproduce la arquitectura `Glm4ForCausalLM` con una configuración reducida: `num_hidden_layers` igual a 2, aplicando la regla genérica de reducción de `sweep.py` del repositorio `huggingface/transformers-mic`. Los ficheros de procesador (`LICENSE`, `chat_template.jinja`, `generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte desde `zai-org/GLM-4-9B-0414`, de modo que la interfaz de tokenización y plantilla de chat es idéntica a la del modelo real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad de entrada: cada perturbación de las entradas del contrato movió los logits al menos 0,001 (el caso más débil, `input_ids:roll_batch`, registró 0,393). Los nombres de tensores coinciden con los del checkpoint real, lo que permite probar carga, forward y gradientes con la misma estructura de parámetros. El artefacto se generó con `build_fixtures.py` y `build.json` registra fuentes fijadas, resultados de la puerta y hashes de ficheros.

## Capacidades

- No genera texto coherente: los pesos son aleatorios y no han sido entrenados.
- No razona, no programa, no resuelve matemáticas ni procesa visión.
- No soporta tool calling ni function calling de forma funcional.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües verificadas más allá de la tokenización heredada.
- No dispone de thinking mode ni modalidades adicionales.
- Sí permite validar la carga del checkpoint, la forma de los tensores, el forward pass, la pérdida y los gradientes en float32, bfloat16 y float16.
- Sí permite comprobar la compatibilidad de frameworks con `Glm4ForCausalLM` y con el tokenizer/chat template del modelo base.

## Casos de uso

- Pruebas de integración en Transformers: cargar el fixture con `Glm4ForCausalLM` para verificar que la clase, los nombres de tensores y la configuración reducida se resuelven sin errores antes de apuntar al checkpoint real de 9B.
- Validación de pipelines de CI: usar el fixture como objetivo ligero (0,1 GB) en tests automáticos que comprueben carga, forward y backward sin consumir GPU de gran capacidad.
- Verificación de chat template y tokenizer: al copiarse byte a byte desde `zai-org/GLM-4-9B-0414`, permite testear el renderizado de plantillas y el manejo de special tokens con la misma interfaz que el modelo desplegable.
- Comprobación de dtypes: ejecutar forward, pérdida y gradientes en float32, bfloat16 y float16 para detectar problemas de estabilidad numérica en frameworks antes de escalar al modelo real.
- Test de sensibilidad de entradas: reproducir la puerta del contrato (perturbaciones de `input_ids` y otras entradas) para validar que una implementación propaga correctamente los cambios hasta los logits.
- Desarrollo de herramientas de inspección de modelos: usar los hashes y `build.json` para verificar procedencia, reproducibilidad y correspondencia de ficheros en pipelines de auditoría.
- Pruebas de empaquetado y serialización: validar lectura de safetensors bfloat16 y compatibilidad de metadatos en herramientas de conversión, sin necesidad de descargar el checkpoint completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería inválida por construcción.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 para los 19,5 M parámetros; el repositorio ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) e incluso CPU para los tests de forward.
- Cabe en cualquier GPU consumer y en CPU; no requiere A100 ni H100.
- Opciones de despliegue: carga directa con Transformers (`Glm4ForCausalLM`); el resto de runners (vLLM, llama.cpp, Ollama, TGI) no están documentados para este fixture en la información disponible.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas con pesos aleatorios, las mediciones no serían representativas de GLM-4-9B-0414.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4-9B-0414-mic (este) | 19,5 M | no disponible | Fixture de test | no disponible | Hugging Face, 1172 descargas |
| zai-org/GLM-4-9B-0414 | ~9B (no verificado en la información) | no disponible | Modelo causal desplegable | no disponible | Hugging Face |
| Otros fixtures del ecosistema transformers-mic | variable (config reducida) | no disponible | Test de integración | no disponible | Hugging Face |

La comparación relevante es con `zai-org/GLM-4-9B-0414`: mismo tokenizer, misma plantilla de chat y mismos nombres de tensores, pero con 2 capas, pesos aleatorios y sin capacidad generativa. Cualquier comparación de rendimiento o calidad con modelos de 9B desplegables no es aplicable.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene significado.
- Etiquetado `test-artifact` de forma explícita para excluirlo de búsquedas de modelos candidatos; no debe promocionarse como modelo de producción.
- La configuración está reducida (2 capas), por lo que no reproduce el comportamiento, latencia ni consumo de memoria del GLM-4-9B-0414 real.
- La licencia no está detallada en la información disponible; el fichero LICENSE se copia del modelo base, pero su contenido debe consultarse en el repositorio original antes de cualquier uso.
- Los idiomas soportados no están verificados; solo se hereda la tokenización del modelo base.
- No hay datos de sesgos, alucinación ni robustez porque no ha habido entrenamiento.
- El repositorio incluye solo pesos reducidos, uso ejecutable y expectativas de framework; otros ficheros deben regenerarse con `python example/build_fixtures.py --fixture GLM-4-9B-0414-mic`.
- No debe usarse para evaluar calidad, seguridad o capacidades de GLM-4; para ello, acudir al checkpoint `zai-org/GLM-4-9B-0414`.

## Enlaces

- Repositorio del fixture: https://huggingface.co/huggingface-mic/GLM-4-9B-0414-mic
- Modelo base: https://huggingface.co/zai-org/GLM-4-9B-0414
- Manifiesto del contrato: https://huggingface.co/huggingface-mic/GLM-4-9B-0414-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/GLM-4-9B-0414-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/GLM-4-9B-0414-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/GLM-4-9B-0414-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/GLM-4-9B-0414-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Regla de reducción (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
