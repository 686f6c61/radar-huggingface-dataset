# huggingface-mic-temp/OLMoE-1B-7B-0924-vllm-mic

## Resumen

OLMoE-1B-7B-0924-vllm-mic es un artefacto de prueba (fixture) publicado en Hugging Face bajo la organización `huggingface-mic-temp`. No es un modelo entrenado ni utilizable: se trata de una versión reducida artificialmente del modelo real allenai/OLMoE-1B-7B-0924, generada para validar contratos de integración de frameworks. El repositorio contiene pesos "slim" de 6,7 millones de parámetros con pesos aleatorios (semilla 17), junto con ficheros de configuración y tokenizador copiados byte a byte del modelo original.

El propósito del fixture es servir como banco de pruebas para la infraestructura de integración (transformers-mic) de Hugging Face: permite comprobar que un framework carga correctamente la arquitectura `OlmoeForCausalLM`, respeta los nombres de tensores del checkpoint real y produce salidas finitas en distintos tipos de dato (float32, bfloat16, float16). La arquitectura subyacente es la del OLMoE original: un transformer con mezcla de expertos (MoE) de Allen AI, con 1B de parámetros activos sobre 7B totales.

Es relevante únicamente en el contexto de ingeniería de infraestructura y CI, no como modelo de producción. La model card lo etiqueta explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. Cualquier evaluación de capacidades, rendimiento o calidad debe hacerse sobre el modelo base allenai/OLMoE-1B-7B-0924.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OlmoeForCausalLM (transformer MoE, segun modelo base) |
| Parametros totales | 6.669.376 (fixture); modelo base: 6.9B aprox. |
| Parametros activos | no disponible en la informacion proporcionada (modelo base: 1.3B aprox.) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base OLMoE-1B-7B-0924, un transformer con mezcla de expertos (MoE) desarrollado por Allen AI. Segun la model card, el fixture conserva la misma clase de modelo (`OlmoeForCausalLM`) y los mismos nombres de tensores que el checkpoint real, pero con la configuración reducida mediante la regla genérica de `sweep.py` del repositorio transformers-mic (`num_hidden_layers` = 2). Los ficheros de procesamiento (`generation_config.json`, `tokenizer.json`, `tokenizer_config.json`, `special_tokens_map.json`, `olmoe-logo.png`) se copiaron byte a byte del modelo original.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una "input-sensitivity gate": cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `input_ids:roll_batch`, produjo 0,666). El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture `208cd43bc81e` identifica el conjunto de checkpoints cubiertos (aquellos con ficheros de procesador idénticos y configuración coincidente tras el shrink).

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no han sido entrenados, por lo que no genera texto coherente ni resuelve tareas.
- Sirve como fixture de integración para validar la carga de la arquitectura `OlmoeForCausalLM` en frameworks compatibles (vLLM, transformers).
- Permite verificar la compatibilidad de nombres de tensores con el checkpoint real allenai/OLMoE-1B-7B-0924.
- Permite comprobar la estabilidad numérica (finitud de logits, loss y gradientes) en float32, bfloat16 y float16.
- Incluye un manifiesto de contrato (`integration.json`) y directorios de expectativas de framework (`integrations/transformers/expectations`).
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües reales.

## Casos de uso

- Pruebas de integración en CI: el fixture se usa para validar que un cambio en el cargador de modelos de un framework no rompe la carga de la arquitectura OLMoE, sin necesidad de descargar los 7B de pesos reales.
- Validación de contratos de framework: el directorio `integrations/transformers/expectations` permite comparar las salidas esperadas del fixture con las producidas por el framework bajo prueba.
- Desarrollo de soporte vLLM: al estar etiquetado como "vLLM-compatible fixture", sirve para probar rutas de carga y ejecución en vLLM con un checkpoint mínimo.
- Verificación de estabilidad numérica: los tests pueden comprobar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 sobre el fixture.
- Reproducibilidad de fixtures: el fichero `build.json` registra fuentes fijadas, resultados de la gate y hashes de ficheros, permitiendo reconstruir el artefacto con `build_fixtures.py`.
- Formación de ingenieros de infraestructura: sirve como ejemplo didáctico de cómo reducir un checkpoint real preservando arquitectura, nombres de tensores y ficheros de procesador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El fixture no es evaluable como modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 para el fixture (6,7M parámetros); el modelo base requiere aproximadamente 14 GB en bfloat16 o 4-5 GB en cuantización de 4 bits.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente para el fixture; el modelo base cabe en RTX 4090 (24 GB) en bfloat16 y en GPUs de 8 GB con cuantización.
- Cabe en GPU consumer: sí, el fixture en cualquier GPU; el modelo base en RTX 4090 o RTX 3090 sin cuantización.
- Opciones de despliegue: vLLM (objetivo declarado del fixture), transformers; el modelo base admite además llama.cpp, Ollama y TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Proposito |
|---|---|---|---|---|---|
| OLMoE-1B-7B-0924-vllm-mic (este) | 6,7M (fixture) | no disponible | no disponible | Hugging Face | Fixture de test |
| allenai/OLMoE-1B-7B-0924 | ~6,9B (1,3B activos) | no disponible | no disponible | Hugging Face | Modelo MoE real |
| Otros fixtures transformers-mic | variable (reducidos) | no disponible | no disponible | Hugging Face (org. huggingface-mic-temp) | Fixtures de test |

No se dispone de datos de rendimiento comparables, ya que el fixture no es un modelo evaluable.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no produce texto coherente ni respuestas útiles.
- Etiquetado como `test-artifact`: no debe usarse en producción ni como candidato en búsquedas de modelos.
- La licencia no está especificada en la información disponible; para uso del modelo real, consultar la licencia de allenai/OLMoE-1B-7B-0924.
- El repositorio tiene 0 descargas y 0 likes, lo que confirma su carácter interno y no comunitario.
- El tamaño del repo es 0,0 GB, coherente con un artefacto mínimo de 6,7M parámetros.
- No se han documentado sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no es funcional.
- Cualquier evaluación de calidad, seguridad o sesgo debe realizarse sobre el modelo base, no sobre este fixture.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic-temp/OLMoE-1B-7B-0924-vllm-mic
- Modelo base: https://huggingface.co/allenai/OLMoE-1B-7B-0924
- Documentación de shrink del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/OLMoE-1B-7B-0924-vllm-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de sweep: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
