# huggingface-mic-temp/qwen2_audio-vllm-mic

## Resumen

`qwen2_audio-vllm-mic` es un artefacto de prueba publicado por la cuenta `huggingface-mic-temp` en Hugging Face, no un modelo entrenado ni utilizable en producción. Se trata de un *fixture* reducido del modelo multimodal `Qwen/Qwen2-Audio-7B` de Alibaba, generado con la herramienta `transformers-mic` para validar contratos de integración (procesadores, tokenizador, formas de tensores y expectativas de frameworks como Transformers y vLLM) sin necesidad de descargar los pesos completos del modelo original.

El repositorio contiene pesos *slim* de 20,3 millones de parámetros con la misma arquitectura (`Qwen2AudioForConditionalGeneration`) pero con un encoder de audio de 2 capas y un decoder de texto de 2 capas, en lugar de las 32 y 28 capas respectivas del modelo base. Los pesos son aleatorios (semilla 17) y no han sido entrenados: el autor indica explícitamente que es un `test-artifact` etiquetado así para excluirlo de búsquedas de modelos candidatos.

Su relevancia es puramente de ingeniería: sirve como banco de pruebas reproducible para verificar que un *pipeline* de inferencia o un *harness* de evaluación acepta correctamente las entradas (audio + texto), produce logits sensibles a las perturbaciones de entrada y mantiene los nombres de tensores del checkpoint real. No debe confundirse con un modelo de audio-comprensión funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2AudioForConditionalGeneration (transformer multimodal audio-texto, encoder de audio + decoder de texto) |
| Parametros totales | 20.258.816 (fixture reducido); el modelo base Qwen2-Audio-7B tiene ~7B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `Qwen2AudioForConditionalGeneration` del modelo base Qwen2-Audio-7B, que combina un encoder de audio con un decoder de lenguaje tipo Qwen2. Para reducir el tamaño, se aplicó la regla genérica de `sweep.py` del proyecto `transformers-mic`: el encoder de audio queda en 2 capas (`audio encoder_layers 2`) y el decoder de texto en 2 capas (`text num_hidden_layers 2`). Los ficheros de procesador (`generation_config.json`, `merges.txt`, `preprocessor_config.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `Qwen/Qwen2-Audio-7B`, de modo que el tokenizador y el preprocesador de audio son idénticos a los del modelo real.

No hubo entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y se validaron con una *input-sensitivity gate*: cada perturbación de las entradas del contrato debía mover los logits al menos 0,001 (la perturbación más débil, `input_features:halve`, produjo un desplazamiento de 0,461). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en `float32`, `bfloat16` y `float16` tanto en forward como en loss y gradientes. La clave del fixture es `27353d2d3110` y cubre todos los checkpoints cuyos ficheros de procesador son idénticos y cuya configuración coincide tras el *shrink*.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas semánticamente válidas.
- Sirve para validar la carga del modelo en Transformers y en vLLM (compatibilidad de contrato declarada por el autor).
- Verifica la forma y los nombres de los tensores del checkpoint `Qwen2-Audio-7B` sin descargar los ~7B de parámetros.
- Permite probar el pipeline de entrada multimodal (audio + texto) con el procesador real del modelo base.
- Comprueba la sensibilidad de los logits ante perturbaciones de entrada (gate de integración).
- No soporta tool calling, agentes, ni capacidades multilingües reales por tratarse de pesos aleatorios.
- No dispone de modo *thinking*, visión ni audio funcional más allá de la estructura de tensores.

## Casos de uso

- Integración continua de frameworks: usar el fixture para ejecutar tests de carga y forward en Transformers o vLLM en pocos segundos, sin descargar el checkpoint de 7B, verificando que el *harness* acepta la arquitectura `Qwen2AudioForConditionalGeneration`.
- Validación de contratos de API: comprobar que un servicio de inferencia acepta las entradas declaradas (`input_features`, `input_ids`, `attention_mask`) y devuelve logits con la forma esperada antes de conectar el modelo real.
- Desarrollo de preprocesadores de audio: al conservar byte a byte `preprocessor_config.json` y `tokenizer.json`, permite probar el pipeline de extracción de características de audio y tokenización de texto con los mismos parámetros que el modelo de producción.
- Pruebas de *sharding* y carga distribuida: verificar la lógica de reparto de pesos y nombres de tensores entre GPUs usando un checkpoint pequeño con la misma estructura de nombres que el real.
- Regresión de cuantización: validar que las rutinas de conversión a `float16`/`bfloat16` y las comprobaciones de finitud funcionan sobre la arquitectura antes de aplicarlas al modelo completo.
- Benchmarking de *harness* de evaluación: medir el coste de arranque y el *throughput* del *pipeline* de test sin que el tiempo de carga del modelo domine la medición.
- Reproducibilidad de artefactos: `build.json` registra fuentes fijadas, resultados de la gate y hashes de ficheros, lo que permite reconstruir el fixture con `python example/build_fixtures.py --fixture qwen2_audio-vllm-mic`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta el resultado de la *input-sensitivity gate*: la perturbación `input_features:halve` desplaza los logits 0,461, y el umbral mínimo exigido es 0,001.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 para los 20,3M de parámetros del fixture (el modelo base de 7B requeriría del orden de 14-16 GB en bfloat16, dato no confirmado en la información disponible).
- GPU recomendadas: cualquier GPU con soporte de bfloat16; el fixture cabe en GPUs de consumo muy modestas (GTX 1650, RTX 3050, etc.).
- Cabe en GPU de consumo: sí, con amplio margen, al tratarse de un artefacto de 20M de parámetros.
- Opciones de despliegue: Transformers (uso documentado en `integrations/transformers/usage.md`) y vLLM (compatibilidad declarada en el nombre y en el contrato). No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser pesos aleatorios y un modelo reducido, las cifras no serían representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen2_audio-vllm-mic` (este) | 20,3M (fixture) | no disponible | Test de integración | no disponible | Hugging Face |
| `Qwen/Qwen2-Audio-7B` | ~7B | no disponible | Audio-comprensión real | no disponible en esta ficha | Hugging Face |
| MiniCPM-o 4.5 (referencia en busqueda) | no disponible | no disponible | Multimodal texto/imagen/audio/video | no disponible | vLLM-Omni |

La comparación con MiniCPM-o 4.5 solo es contextual: aparece en la documentación de vLLM-Omni como ejemplo de *online serving* multimodal, no como alternativa equivalente al fixture.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no genera texto ni transcripciones coherentes; cualquier salida es ruido estadístico.
- Etiquetado `test-artifact`: el autor lo excluye explícitamente de la búsqueda de modelos candidatos; no debe desplegarse en producción.
- Sin licencia declarada: no se especifican términos de uso comercial; al derivar de `Qwen/Qwen2-Audio-7B`, habría que consultar la licencia del modelo base (no disponible en esta ficha).
- Sin idiomas declarados: no hay información sobre cobertura lingüística; irrelevante al no ser funcional.
- Sin contexto declarado: no se documenta la longitud de ventana del modelo base en esta información.
- Riesgo de confusión: el nombre incluye "qwen2_audio" y "vllm", lo que puede llevar a error si se interpreta como un checkpoint listo para servir audio.
- La información de benchmarks, cuantizaciones y latencias no está disponible y no debe inferirse del modelo base sin verificación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/qwen2_audio-vllm-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2-Audio-7B
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic-temp/qwen2_audio-vllm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic-temp/qwen2_audio-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic-temp/qwen2_audio-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic-temp/qwen2_audio-vllm-mic/blob/main/build.json
- Explicación del *shrink*: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen2_audio-vllm-mic.html
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentación vLLM-Omni (referencia multimodal): https://docs.vllm.ai/projects/vllm-omni/en/v0.26.0/user_guide/examples/online_serving/minicpmo/
