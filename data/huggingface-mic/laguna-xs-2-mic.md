# huggingface-mic/Laguna-XS.2-mic

## Resumen

Laguna-XS.2-mic es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` en Hugging Face, derivado del modelo base `poolside/Laguna-XS.2`. No se trata de un modelo entrenado ni utilizable en producción: es una versión "adelgazada" del checkpoint original que conserva la misma arquitectura (`LagunaForCausalLM`) y los mismos nombres de tensores, pero con pesos aleatorios (semilla 17) y una configuración reducida a 3 capas ocultas. Su propósito es servir como fixture de integración para validar contratos de ejecución y expectativas de frameworks (Transformers, entre otros) sin necesidad de descargar ni ejecutar el modelo real.

El repositorio contiene 13.319.208 parámetros en formato safetensors (bfloat16), con un tamaño total de 0,1 GB, e incluye además el manifiesto de contrato (`integration.json`), la documentación de uso para Transformers, las expectativas del framework y la procedencia del fixture (`build.json`). Los ficheros de procesador (tokenizer, plantilla de chat, configuración y código de modelado) se copian byte a byte desde el checkpoint original de Poolside.

Es relevante ahora porque el ecosistema de herramientas de Hugging Face (en particular el proyecto `transformers-mic`) necesita artefactos ligeros y deterministas para verificar que las integraciones de modelos funcionan correctamente antes de ejecutar modelos de gran tamaño. La etiqueta `test-artifact` lo excluye explícitamente de las búsquedas de modelos candidatos, por lo que no debe confundirse con un modelo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `LagunaForCausalLM` (transformer causal, config reducida a 3 capas ocultas) |
| Parámetros totales | 13.319.208 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura del checkpoint `poolside/Laguna-XS.2` mediante la clase `LagunaForCausalLM`, pero con una configuración reducida: `num_hidden_layers` igual a 3, aplicando la regla genérica de reducción definida en `sweep.py` del repositorio `huggingface/transformers-mic`. Conserva los mismos nombres de tensores que el checkpoint real y los ficheros de procesador copiados byte a byte (`tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `configuration_laguna.py`, `modeling_laguna.py`, `generation_config.json`, `special_tokens_map.json`).

No ha habido entrenamiento. Los pesos son aleatorios (semilla 17) y se generaron porque superaron la puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, con 0,179). El modelo es finito en float32, bfloat16 y float16 (forward, loss y gradientes), y se guarda en bfloat16, el dtype con el que carga por defecto `poolside/Laguna-XS.2`. La clave del fixture es `182b41aa38d4`, que cubre todos los checkpoints con ficheros de procesador idénticos y configuración coincidente tras la reducción.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de integración para validar contratos de ejecución y expectativas de frameworks.
- Conserva la interfaz de `LagunaForCausalLM`: carga, forward, loss y gradientes funcionan en float32, bfloat16 y float16.
- Mantiene los mismos nombres de tensores que el checkpoint real, lo que permite probar rutas de carga y mapeo de pesos.
- Incluye tokenizer, plantilla de chat y configuración de generación copiados del modelo original, útiles para probar pipelines de tokenización.
- No soporta tool calling, agentes, visión, audio ni modo thinking de forma real (solo la estructura, sin pesos entrenados).
- Capacidades multilingües: no disponibles (dependen del tokenizer copiado, pero sin pesos entrenados no son evaluables).

## Casos de uso

- Validación de integraciones en Transformers: usar el fixture para comprobar que la clase `LagunaForCausalLM` se carga, ejecuta forward y calcula gradientes sin descargar el checkpoint completo de Poolside.
- Pruebas de CI/CD en pipelines de Hugging Face: ejecutar tests de contrato (`integration.json`) en cada PR para detectar regresiones en el mapeo de tensores o en la configuración.
- Verificación de expectativas de framework: comparar el comportamiento del fixture con el directorio `integrations/transformers/expectations` para asegurar que las salidas cumplen las tolerancias definidas.
- Desarrollo de herramientas de reducción de modelos: servir como caso de referencia para probar `sweep.py` y `build_fixtures.py` con nuevos checkpoints.
- Pruebas de tokenización y plantillas de chat: al conservar el tokenizer y `chat_template.jinja` originales, permite validar pipelines de tokenización sin cargar el modelo real.
- Docencia y demostración de contratos de modelos: ilustrar cómo se estructura un fixture de integración con manifiesto, procedencia y hashes verificables.
- Reproducibilidad de artefactos: reconstruir el fixture con `python example/build_fixtures.py --fixture Laguna-XS.2-mic` y comparar hashes con `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no procede evaluar MMLU, HumanEval, GSM8K ni métricas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (13,3 M de parámetros, ~27 MB de pesos) más overhead de activaciones y tokenizer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también funciona en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 4090, etc.) y en entornos sin GPU.
- Opciones de despliegue: Transformers (con `trust_remote_code=True` por el `custom_code`), y previsiblemente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta en la información disponible.
- Latencia y throughput: no disponibles; al tener 3 capas y pesos aleatorios, los tiempos no son representativos del modelo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| Laguna-XS.2-mic | 13,3 M | no disponible | no disponible | Fixture de prueba (pesos aleatorios) |
| poolside/Laguna-XS.2 | no disponible en la información | no disponible | no disponible | Modelo base real de Poolside |
| Otros fixtures de `transformers-mic` | variable (reducidos) | no disponible | no disponible | Artefactos de prueba de integración |

La comparación con modelos de producción no es aplicable: Laguna-XS.2-mic no compite en tareas de generación, razonamiento o código. Su alternativa natural es el checkpoint original `poolside/Laguna-XS.2`, del que deriva, o cualquier otro fixture del mismo proyecto.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto coherente ni responde a instrucciones.
- Etiquetado como `test-artifact`: no debe usarse en producción ni incluirse en búsquedas de modelos candidatos.
- Licencia no disponible: no se puede confirmar el uso comercial; además, al derivar de `poolside/Laguna-XS.2`, podrían aplicar restricciones del modelo base.
- Idiomas no disponibles: el tokenizer está copiado del original, pero sin pesos entrenados no hay capacidades lingüísticas reales.
- Longitud de contexto no disponible: la configuración reducida no refleja la del modelo original.
- Riesgo de confusión: el nombre y la estructura pueden llevar a error si se trata como un modelo funcional.
- Requiere `trust_remote_code=True` por el `custom_code` incluido (`configuration_laguna.py`, `modeling_laguna.py`).
- No se han publicado benchmarks ni métricas de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/Laguna-XS.2-mic
- Modelo base: https://huggingface.co/poolside/Laguna-XS.2
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Laguna-XS.2-mic.html
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/Laguna-XS.2-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Laguna-XS.2-mic/blob/main/integrations/transformers/usage.md
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Laguna-XS.2-mic/blob/main/build.json
