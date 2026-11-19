# huggingface-mic/GLM-OCR-mic

## Resumen

GLM-OCR-mic es un artefacto de prueba publicado por la organizacion huggingface-mic, no un modelo utilizable. Se trata de una version reducida ("slim fixture") del modelo zai-org/GLM-OCR, una arquitectura de imagen-a-texto de tipo `GlmOcrForConditionalGeneration` orientada a OCR. El repositorio contiene pesos de 8,81 millones de parametros generados de forma aleatoria (semilla 17), junto con los ficheros de procesador copiados byte a byte del checkpoint original.

El proposito de este artefacto es servir como fixture de integracion para validar frameworks (en concreto Transformers) sin necesidad de descargar ni ejecutar el modelo real, que es mucho mayor. La model card indica explicitamente que es un "test artifact, not a usable model", etiquetado con `test-artifact` para excluirlo de las busquedas de modelos candidatos. Por tanto, su relevancia practica es exclusivamente de ingenieria de software y testing de pipelines.

No debe confundirse con GLM-OCR (zai-org/GLM-OCR), el modelo real de OCR sobre el que se construye el fixture. Cualquier evaluacion de capacidades, calidad o rendimiento debe hacerse sobre el modelo base, no sobre esta version reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmOcrForConditionalGeneration (transformer multimodal imagen-a-texto, version reducida: 2 capas de texto) |
| Parametros totales | 8.810.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `GlmOcrForConditionalGeneration` del modelo zai-org/GLM-OCR, pero con una configuracion reducida mediante la regla generica de `sweep.py`: el bloque de texto queda en 2 capas (`text num_hidden_layers 2`). Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `preprocessor_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte del checkpoint original, de modo que el contrato de entrada y el pipeline de preprocesado son identicos a los del modelo real.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una "input-sensitivity gate": cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, `pixel_values:roll_batch`, alcanza 0,0823). Los nombres de tensores coinciden con los del checkpoint real, los pesos se guardan en float32 (el dtype por defecto de zai-org/GLM-OCR) y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture cubre todos los checkpoints cuyos ficheros de procesador son byte-identicos y cuya config coincide tras el encogido (clave `ff49f902fed2`).

## Capacidades

- No es un modelo funcional: al tener pesos aleatorios, no genera texto ni extrae texto de imagenes de forma significativa.
- Reproduce el contrato de entrada del modelo GLM-OCR real (procesador, tokenizer y plantilla de chat identicos), lo que permite validar pipelines de preprocesado.
- Mantiene los nombres de tensores del checkpoint original, util para verificar carga de pesos y compatibilidad de `state_dict`.
- Ejecuta forward, loss y backward en float32, bfloat16 y float16, apto para tests de integracion de frameworks.
- No dispone de tool calling, capacidades de agente, multilingues ni modos especiales verificables: es un artefacto de test.

## Casos de uso

- Tests de integracion en Transformers: cargar el fixture con `AutoModelForConditionalGeneration` y verificar que la clase `GlmOcrForConditionalGeneration` se instancia y ejecuta sin errores, sin descargar el modelo real.
- Validacion de pipelines de OCR en CI: comprobar que el preprocesado de imagenes y el tokenizer producen tensores con las formas esperadas antes de desplegar el modelo real.
- Verificacion de contratos de entrada: usar la input-sensitivity gate para detectar regresiones en el mapeo de entradas (por ejemplo, que `pixel_values` sigue afectando a los logits).
- Pruebas de compatibilidad de dtypes: ejecutar forward y backward en float32, bfloat16 y float16 para validar que un framework no rompe con cambios de precision.
- Desarrollo de utilidades de carga de pesos: comprobar que los nombres de tensores del fixture coinciden con los del checkpoint real antes de migrar codigo.
- Reproduccion de builds: reconstruir el fixture con `python example/build_fixtures.py --fixture GLM-OCR-mic` y comparar hashes registrados en `build.json` para auditar procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, exactitud en OCR) carece de sentido sobre este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (8,81 M de parametros, aproximadamente 35 MB de pesos mas activaciones y buffers del procesador de imagen).
- GPU recomendadas: cualquier GPU consumer moderna sirve para ejecutar el fixture; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: carga via Transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; irrelevantes para un fixture de test.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-OCR-mic (este) | 8,81 M | no disponible | Fixture de test (pesos aleatorios) | no disponible | Hugging Face (huggingface-mic) |
| zai-org/GLM-OCR | no disponible en la informacion | no disponible | OCR imagen-a-texto real | no disponible | Hugging Face (zai-org) |
| Otros fixtures de huggingface-mic | no disponible | no disponible | Fixtures de integracion por modelo | no disponible | Hugging Face (huggingface-mic) |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria mas alla del modelo base del que deriva.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene relacion con el contenido de la imagen.
- La model card lo etiqueta explicitamente como `test-artifact`; no debe usarse en produccion ni presentarse como GLM-OCR.
- Licencia no disponible: no hay garantia explicita de uso comercial ni de redistribucion.
- Idiomas no disponibles: no se puede afirmar soporte multilingue del fixture (aunque el tokenizer se copia del modelo real).
- Longitud de contexto no disponible en la informacion proporcionada.
- El fixture solo cubre los checkpoints con procesador byte-identico y config coincidente tras el encogido (clave `ff49f902fed2`); no valida variantes con otra configuracion.
- La sensibilidad de entradas es debil en algunos casos (`pixel_values:roll_batch`, 0,0823), por lo que tests demasiado estrictos sobre la magnitud de los logits pueden dar falsos negativos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/GLM-OCR-mic
- Modelo base: https://huggingface.co/zai-org/GLM-OCR
- Pagina de procedencia del fixture (shrink): https://huggingface-mic-mic-coverage.static.hf.space/shrink/GLM-OCR-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de encogido (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
