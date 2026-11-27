# huggingface-mic-temp/GLM-OCR-vllm-mic

## Resumen

GLM-OCR-vllm-mic es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic-temp` en Hugging Face. No se trata de un modelo funcional, sino de una version reducida artificialmente del modelo `zai-org/GLM-OCR`, creada para validar contratos de integracion y expectativas de frameworks (Transformers, vLLM) sin necesidad de descargar ni ejecutar el checkpoint completo. El propio autor lo etiqueta como `test-artifact` para excluirlo de busquedas de modelos candidatos.

El fixture conserva la arquitectura `GlmOcrForConditionalGeneration` del modelo original, pero con la configuracion reducida (2 capas en el tower de texto) y pesos aleatorios (semilla 17), lo que da un total de 8.810.112 parametros. Los ficheros de procesador (tokenizer, chat template, preprocessor, generation config) se copian byte a byte desde `zai-org/GLM-OCR`, de modo que las interfaces de entrada y salida son identicas a las del modelo real.

Su relevancia es puramente de ingenieria: permite a los equipos de integracion de Transformers y vLLM ejecutar tests de contrato (formas de tensores, nombres de parametros, sensibilidad de entrada, finitud en float32/bfloat16/float16) de forma rapida y determinista, sin consumir los recursos del checkpoint completo. No debe emplearse para inferencia real, evaluacion de calidad ni produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmOcrForConditionalGeneration (vision-language, image-to-text) |
| Parametros totales | 8.810.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `GlmOcrForConditionalGeneration`, un modelo condicional image-to-text de la familia GLM-OCR. En este fixture, el tower de texto se ha reducido a `num_hidden_layers: 2` mediante la regla generica de `sweep.py` del repositorio `transformers-mic`. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `preprocessor_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copian literalmente desde `zai-org/GLM-OCR`, por lo que el contrato de entrada/salida coincide con el del modelo original.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se generaron unicamente para superar la puerta de sensibilidad de entrada: cualquier perturbacion de las entradas del contrato desplaza los logits al menos 0.001 (la perturbacion mas debil, `pixel_values:roll_batch`, produce 0.0391). Los nombres de tensores coinciden con los del checkpoint real y el fixture es finito en forward, loss y gradientes para float32, bfloat16 y float16. El identificador de fixture es `da0212ce2fd8` y cubre todos los checkpoints cuyos ficheros de procesador son byte-identicos y cuya config coincide tras el shrink.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas semanticamente validas.
- Reproduce la interfaz image-to-text del contrato GLM-OCR (entrada de imagen, salida de texto).
- Sirve como fixture de conformidad para frameworks (Transformers, vLLM) y para tests de integracion.
- Mantiene los nombres de tensores y la firma de configuracion del checkpoint original.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues verificables (idiomas no disponibles).
- No dispone de thinking mode, audio ni vision funcional mas alla del contrato de entrada.

## Casos de uso

- Tests de contrato en Transformers: validar que el pipeline `image-to-text` carga el modelo, aplica el processor y produce logits con las formas esperadas, usando un checkpoint de 8.8M parametros en lugar del original.
- Tests de integracion en vLLM: comprobar la compatibilidad de carga de pesos safetensors, nombres de tensores y configuracion de generacion antes de probar con el checkpoint completo.
- CI/CD de librerias de inferencia: ejecutar en cada PR una suite de conformidad rapida y determinista (finitud en float32/bfloat16/float16, sensibilidad de entrada) sin coste de GPU elevado.
- Validacion de ficheros de procesador: verificar que cambios en `tokenizer.json`, `chat_template.jinja` o `preprocessor_config.json` no rompen el contrato de entrada/salida.
- Reproducibilidad de fixtures: regenerar el artefacto con `python example/build_fixtures.py --fixture GLM-OCR-vllm-mic` y comparar hashes registrados en `build.json`.
- Desarrollo de harnesses de evaluacion: probar la orquestacion de pipelines image-to-text (carga, preprocesado, forward, decodificacion) sin depender de pesos reales.
- Formacion y demos de tooling: mostrar como se estructura un fixture de modelo reducido con contrato y expectativas de framework documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K, OCR) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (8,8M parametros, ~17,6 MB de pesos) mas overhead de activaciones y processor; cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte bfloat16 (RTX 30xx/40xx, A100, H100); tambien CPU.
- Cabe en GPU consumer: si, en todas las GPU modernas e incluso en CPU.
- Opciones de despliegue: Transformers, vLLM (objetivo declarado del fixture), y potencialmente llama.cpp/Ollama si se convierte a GGUF (no documentado).
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia es despreciable y no representa el rendimiento del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-OCR-vllm-mic (este) | 8,8M | no disponible | Fixture de test | no disponible | Hugging Face |
| zai-org/GLM-OCR | no disponible | no disponible | OCR / image-to-text real | no disponible | Hugging Face |
| Otros fixtures `transformers-mic` | variable | no disponible | Tests de contrato | no disponible | Hugging Face (org `huggingface-mic-temp`) |

La comparativa relevante es contra el modelo base `zai-org/GLM-OCR`: mismo contrato de procesador y misma arquitectura, pero con pesos aleatorios y configuracion reducida. No se dispone de datos para comparar con alternativas funcionales de OCR.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado; no usar para inferencia, evaluacion ni produccion.
- Etiquetado como `test-artifact`: excluido deliberadamente de busquedas de modelos candidatos.
- Licencia no disponible: no se puede confirmar el regimen de uso comercial; ademas, al derivar de `zai-org/GLM-OCR`, habria que verificar la licencia del modelo base.
- Idiomas no disponibles: no hay informacion sobre cobertura linguistica.
- Contexto no disponible: la configuracion reducida (2 capas) no refleja la ventana de contexto del modelo original.
- Riesgo de confusion: el nombre incluye "GLM-OCR" y "vllm", lo que puede llevar a error si se interpreta como un modelo OCR listo para usar.
- Sesgos y alucinacion: no aplicables de forma significativa al ser pesos aleatorios, pero tampoco evaluables.
- Sin garantias de rendimiento: cualquier metrica medida sobre este fixture no es extrapolable al modelo real.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic-temp/GLM-OCR-vllm-mic
- Modelo base: https://huggingface.co/zai-org/GLM-OCR
- Manifest de contrato: `integration.json` (en el repositorio)
- Uso en Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Documentacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/GLM-OCR-vllm-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de shrink: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
