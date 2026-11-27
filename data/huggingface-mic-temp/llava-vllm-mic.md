# huggingface-mic-temp/llava-vllm-mic

## Resumen

`llava-vllm-mic` es un artefacto de prueba (fixture) publicado por la cuenta `huggingface-mic-temp`, no un modelo utilizable en producción. Se trata de una version reducida del checkpoint multimodal `llava-hf/llava-1.5-7b-hf`, generada automáticamente mediante la regla de reducción de `sweep.py` del proyecto `transformers-mic`. El objetivo es disponer de pesos ligeros que reproduzcan la misma arquitectura, los mismos nombres de tensores y los mismos ficheros de procesador que el modelo original, para poder validar integraciones y contratos de framework (en este caso, uso compatible con vLLM) sin descargar los 7.000 millones de parámetros reales.

El repositorio contiene únicamente 4.336.576 parámetros, con una configuración reducida de `LlavaForConditionalGeneration` (2 capas en el codificador visual y 2 capas en el modelo de texto). Los pesos son aleatorios (semilla 17) y se guardaron en float16. Los ficheros de tokenizador y procesador se copiaron byte a byte desde el checkpoint base.

Su relevancia es exclusivamente técnica y de infraestructura: sirve para probar pipelines de carga, contratos de inferencia y expectativas de framework en CI, no para generar respuestas útiles. La propia model card lo etiqueta como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlavaForConditionalGeneration` (vision-language, transformer multimodal con codificador visual y modelo de texto) |
| Parametros totales | 4.336.576 (fixture reducido); el modelo base tiene aproximadamente 7.000 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos guardados en float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `LlavaForConditionalGeneration` del checkpoint `llava-hf/llava-1.5-7b-hf`, pero con una configuración reducida: 2 capas en el codificador visual (`vision num_hidden_layers = 2`) y 2 capas en el modelo de texto (`text num_hidden_layers = 2`). Mantiene los mismos nombres de tensores que el checkpoint real y los mismos ficheros de procesador copiados byte a byte (`tokenizer.json`, `tokenizer.model`, `preprocessor_config.json`, `processor_config.json`, `chat_template.jinja`, entre otros).

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (el caso más débil, `pixel_values:halve`, produjo 0,0356). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture `acc57a0e9db5` agrupa todos los checkpoints cuyos ficheros de procesador son idénticos byte a byte y cuya configuración coincide tras la reducción.

## Capacidades

- No es un modelo funcional: los pesos aleatorios no producen salidas semánticamente válidas.
- Reproduce la interfaz de carga de `LlavaForConditionalGeneration` con los mismos nombres de tensores que el checkpoint real.
- Permite validar el contrato de integración con vLLM y con Transformers.
- Sirve para comprobar la sensibilidad de las entradas del contrato (perturbaciones de `pixel_values`, tokens, etc.).
- Permite verificar que el pipeline de forward, loss y gradientes es finito en float32, bfloat16 y float16.
- No soporta tool calling, agentes, razonamiento multilingüe ni ninguna capacidad generativa real.

## Casos de uso

- Pruebas de integración en CI: cargar el fixture con Transformers o vLLM para verificar que el pipeline de carga, tokenización y forward no rompe, sin descargar el checkpoint completo de 7B.
- Validación de contratos de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen con los mismos nombres de tensores y ficheros de procesador.
- Desarrollo de adaptadores de inferencia: usar el fixture como sustituto ligero del modelo real en pruebas unitarias de servidores de inferencia (vLLM, TGI) antes de pasar a producción.
- Verificación de puertas de sensibilidad: reproducir las perturbaciones de entrada descritas en `build.json` para validar que el pipeline detecta cambios en los logits.
- Pruebas de dtype: comprobar que el modelo se ejecuta sin NaN ni infinitos en float32, bfloat16 y float16 en forward, loss y gradientes.
- Regresión de tokenizador y procesador: al copiarse byte a byte desde el checkpoint base, permite validar cambios en el pipeline de preprocesado sin depender del modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, etc.) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 4,3 millones de parámetros en float16 (aproximadamente 8,7 MB de pesos más overhead de activaciones y procesador).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también es viable en CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers, vLLM (el repositorio declara compatibilidad con vLLM) y cualquier framework que cargue safetensors.
- Latencia y throughput: no disponibles; al ser un fixture, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic-temp/llava-vllm-mic` | 4.336.576 | no disponible | Fixture de prueba para integraciones | no disponible | Hugging Face |
| `llava-hf/llava-1.5-7b-hf` | ~7.000 millones | no disponible | Modelo vision-language real | no disponible | Hugging Face |
| Otros fixtures `transformers-mic` | variable (reducidos) | no disponible | Pruebas de contrato de framework | no disponible | Hugging Face |

La comparación relevante es con el checkpoint base: el fixture conserva arquitectura, nombres de tensores y ficheros de procesador, pero sustituye los pesos entrenados por pesos aleatorios y reduce el número de capas.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen valor semántico.
- Etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.
- No se han publicado datos de sesgos, alucinación ni comportamiento multilingüe porque no aplica.
- La licencia no está disponible; no debe asumirse uso comercial permitido.
- El repositorio tiene un tamaño de 0,0 GB y solo incluye pesos reducidos, uso de Transformers y expectativas de framework; otros ficheros deben regenerarse con `python example/build_fixtures.py --fixture llava-vllm-mic`.
- No debe desplegarse en producción ni presentarse como sustituto del modelo LLaVA real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/llava-vllm-mic
- Modelo base: https://huggingface.co/llava-hf/llava-1.5-7b-hf
- Manifiesto del contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicación de la reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/llava-vllm-mic.html
- Script de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
