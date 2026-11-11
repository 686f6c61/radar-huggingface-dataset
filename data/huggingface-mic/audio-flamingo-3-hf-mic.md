# huggingface-mic/audio-flamingo-3-hf-mic

## Resumen

`huggingface-mic/audio-flamingo-3-hf-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic`, no un modelo utilizable en produccion. Se trata de una version reducida artificialmente del checkpoint `nvidia/audio-flamingo-3-hf` de NVIDIA, un modelo audio-lenguaje de la familia AudioFlamingo3. El repositorio empaqueta pesos "slim", uso ejecutable y expectativas de framework en un unico lugar, con el objetivo de servir como fixture de integracion para la libreria de transformers.

El modelo conserva la arquitectura `AudioFlamingo3ForConditionalGeneration` pero con una configuracion drasticamente reducida: 2 capas ocultas en el encoder de audio y 2 capas ocultas en el modelo de texto. Los pesos son aleatorios (semilla 17) y no han sido entrenados; unicamente superaron una puerta de sensibilidad a la entrada que verifica que las perturbaciones de las entradas mueven los logits al menos 0,001. Con 19.696.576 parametros y 0,2 GB de tamano, su relevancia es exclusivamente de ingenieria: validar contratos de integracion, no resolver tareas reales.

El repositorio esta etiquetado como `test-artifact` para mantenerlo fuera de las busquedas de modelos candidatos. Cualquier evaluacion de capacidades, calidad o rendimiento debe realizarse sobre el modelo base `nvidia/audio-flamingo-3-hf`, del que este fixture hereda la estructura de tensores y los ficheros de procesador copiados byte a byte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AudioFlamingo3ForConditionalGeneration (audio-lenguaje, transformer multimodal) |
| Parametros totales | 19.696.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `AudioFlamingo3ForConditionalGeneration`, un transformer multimodal audio-lenguaje que combina un encoder de audio con un modelo de lenguaje para generacion condicional. En este fixture, la configuracion se ha reducido mediante la regla generica de `sweep.py` del proyecto `transformers-mic`: el encoder de audio conserva 2 capas ocultas y el modelo de texto otras 2. Los nombres de tensores coinciden exactamente con los del checkpoint real `nvidia/audio-flamingo-3-hf`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron unicamente mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (el caso mas debil, `input_features:reverse`, alcanzo 0,107). Los ficheros de procesador (`added_tokens.json`, `chat_template.jinja`, `generation_config.json`, `merges.txt`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde el modelo base. El fixture se guardo en float32, el dtype con el que carga por defecto `nvidia/audio-flamingo-3-hf`, y se verifico que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas semanticamente validas.
- Sirve como fixture de integracion para validar la carga de `AudioFlamingo3ForConditionalGeneration` en Transformers.
- Permite verificar contratos de entrada/salida definidos en `integration.json`.
- Reproduce la firma de tensores del checkpoint real, util para tests de compatibilidad de pesos.
- Incluye ficheros de procesador identicos a los del modelo base, lo que permite probar pipelines de tokenizacion y procesamiento de audio.
- No dispone de tool calling, razonamiento, codigo, matematicas ni capacidades multilingues reales.
- No soporta agentes ni razonamiento multi-paso.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture para verificar que la clase `AudioFlamingo3ForConditionalGeneration` se instancia y ejecuta correctamente con la configuracion reducida, sin necesidad de descargar el checkpoint completo de NVIDIA.
- Validacion de contratos de API: usar `integration.json` y el directorio `integrations/transformers/expectations` para comprobar que las entradas y salidas del framework coinciden con lo esperado antes de integrar el modelo real.
- Tests de CI/CD en proyectos de infraestructura ML: al ocupar solo 0,2 GB, el fixture se puede descargar y ejecutar en runners de integracion continua sin GPU dedicada ni almacenamiento significativo.
- Verificacion de compatibilidad de pesos: comprobar que los nombres de tensores del checkpoint real coinciden con los del fixture, detectando roturas en actualizaciones de la libreria.
- Pruebas de precision numerica: validar que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16, cubriendo los tres dtypes habituales de despliegue.
- Desarrollo de tooling de evaluacion: construir y depurar pipelines de evaluacion de modelos audio-lenguaje contra un objetivo ligero y determinista (semilla 17) antes de escalar al modelo real.
- Reproducibilidad de fixtures: regenerar el artefacto con `python example/build_fixtures.py --fixture audio-flamingo-3-hf-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K u otras) carece de sentido sobre este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (19,7 M de parametros, ~79 MB de pesos); en float16 o bfloat16, ~40 MB.
- GPU recomendadas: cualquier GPU consumer o integrada es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: Transformers con `AudioFlamingo3ForConditionalGeneration`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2+2 capas, la inferencia es practicamente instantanea, pero sin valor representativo del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/audio-flamingo-3-hf-mic` | 19,7 M | no disponible | Fixture de test | no disponible | Hugging Face |
| `nvidia/audio-flamingo-3-hf` | no disponible | no disponible | Modelo audio-lenguaje real | no disponible | Hugging Face |
| Otros fixtures `huggingface-mic` | variable (reducidos) | no disponible | Fixtures de test | no disponible | Hugging Face |

La comparativa relevante es contra el modelo base `nvidia/audio-flamingo-3-hf`: mismo esquema de tensores y mismos ficheros de procesador, pero con la configuracion completa y pesos entrenados. No se dispone de datos de parametros, contexto ni licencia del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- Los pesos son aleatorios: las salidas no tienen significado y no deben usarse para ninguna tarea real.
- Es un artefacto de prueba etiquetado `test-artifact`; no es un modelo candidato para produccion.
- La licencia no esta disponible en la informacion proporcionada, por lo que no se puede confirmar el uso comercial.
- La configuracion reducida (2 capas de audio, 2 de texto) no representa el comportamiento del modelo base.
- No se dispone de informacion sobre sesgos, alucinacion, cobertura idiomatica ni contexto maximo.
- No debe confundirse con `nvidia/audio-flamingo-3-hf` al referenciar resultados o benchmarks.
- El repositorio incluye solo pesos, uso y expectativas; otros ficheros deben regenerarse con `build_fixtures.py`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/audio-flamingo-3-hf-mic
- Modelo base: https://huggingface.co/nvidia/audio-flamingo-3-hf
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/audio-flamingo-3-hf-mic.html
- Script de reduccion `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
