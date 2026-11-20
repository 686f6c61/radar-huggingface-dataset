# huggingface-mic/qwen2-audio-vllm-mic

## Resumen

`huggingface-mic/qwen2-audio-vllm-mic` es un artefacto de prueba (fixture) construido por el equipo de Hugging Face MIC para validar la integración de la arquitectura Qwen2-Audio con vLLM y Transformers. No es un modelo entrenado ni utilizable: se trata de un checkpoint reducido de 20,3 millones de parámetros derivado de `Qwen/Qwen2-Audio-7B`, con pesos aleatorios (semilla 17) y una configuración recortada del transformer original (2 capas en el encoder de audio y 2 capas en el decoder de texto).

El propósito del repositorio es triple: servir como contrato ejecutable para frameworks de inferencia, proporcionar expectativas de comportamiento (framework expectations) y permitir pruebas de integración reproducibles sin necesidad de descargar los 7.000 millones de parámetros del modelo real. Los ficheros del procesador (tokenizer, preprocessor, generation config) se copian byte a byte del checkpoint original, de modo que el pipeline de preprocesado es idéntico al de producción.

Es relevante ahora porque permite a desarrolladores de vLLM, TGI o Transformers validar rutas de código de audio multimodal con un repo de 0,1 GB, sin GPU de gran capacidad. Cualquier uso como modelo funcional de reconocimiento de audio o generación de texto es inadecuado por diseño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2AudioForConditionalGeneration (transformer multimodal audio-texto, configuracion reducida) |
| Parametros totales | 20.258.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del config de Qwen2-Audio-7B, sin confirmar en el fixture) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; se declara finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2-Audio-7B |
| Tipo de artefacto | fixture de test (`test-artifact`) |
| Capas encoder audio | 2 |
| Capas decoder texto | 2 |
| Semilla de pesos | 17 (aleatorios) |
| Tamano del repo | 0,1 GB |
| Fecha de creacion | 2026-11-19 |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `Qwen2AudioForConditionalGeneration`, compuesta por un encoder de audio y un decoder de texto tipo transformer. La contracción se realizó con la regla genérica de `sweep.py` del repositorio `transformers-mic`, reduciendo el encoder de audio a 2 capas y el decoder de texto a 2 capas. Los nombres de tensores coinciden exactamente con los del checkpoint real `Qwen/Qwen2-Audio-7B`, lo que garantiza compatibilidad con los loaders de los frameworks.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (la más débil, `input_features:halve`, con 0,463). Los ficheros del procesador (`generation_config.json`, `merges.txt`, `preprocessor_config.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte del modelo base. El checkpoint se guardó en float32, el dtype por defecto de Qwen2-Audio-7B, y se verificó que forward, loss y gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- No es un modelo funcional: no genera texto, no transcribe audio ni razona.
- Sirve como contrato ejecutable para validar la carga de pesos, el pipeline de preprocesado y la compatibilidad de tensores en vLLM, Transformers y TGI.
- Permite probar rutas de código de audio multimodal (input de features de audio, fusión encoder-decoder) con un repo de 0,1 GB.
- Compatible con los ficheros de tokenizer y preprocessor del modelo base, por lo que el preprocesado es idéntico al de producción.
- Verificado para forward, loss y backward en float32, bfloat16 y float16.
- No soporta tool calling, agentes, ni capacidades multilingües reales.

## Casos de uso

- Integración continua de vLLM: ejecutar tests de humo que carguen el modelo, procesen un audio sintético y verifiquen que los logits tienen la forma esperada, sin consumir GPUs de gran memoria.
- Validación de Transformers: comprobar que una nueva versión de `Qwen2AudioForConditionalGeneration` carga correctamente los tensores y produce salidas finitas en float32, bfloat16 y float16.
- Desarrollo de pipelines de preprocesado de audio: usar los ficheros de processor copiados del modelo base para validar la extracción de features y la tokenización sin descargar el checkpoint de 7B.
- Pruebas de compatibilidad de frameworks: verificar que TGI, vLLM o llama.cpp aceptan los nombres de tensores y la configuración reducida antes de invertir en el modelo real.
- Reproducibilidad de contratos: el fichero `build.json` registra fuentes fijadas, resultados de la puerta de sensibilidad y hashes de ficheros, lo que permite reconstruir el fixture con `python example/build_fixtures.py --fixture qwen2-audio-vllm-mic`.
- Formación y demos: ilustrar la estructura de un checkpoint multimodal Qwen2-Audio sin distribuir pesos entrenados ni incumplir licencias del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un fixture con pesos aleatorios y no produce salidas con significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (20,3 M de parámetros), aproximadamente 40 MB en float16/bfloat16 para los pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en entornos CPU-only.
- Opciones de despliegue: Transformers (con `Qwen2AudioForConditionalGeneration`), vLLM (objetivo del contrato), y potencialmente TGI; no se documenta soporte en llama.cpp ni Ollama.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia será muy baja pero irrelevante para producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/qwen2-audio-vllm-mic | 20,3 M | no disponible | Fixture de test para integracion | no disponible | Hugging Face |
| Qwen/Qwen2-Audio-7B | 7.000 M (aprox.) | no disponible | Modelo multimodal audio-texto | no disponible en la informacion | Hugging Face, ModelScope |
| Qwen/Qwen2-Audio-7B-Instruct | 7.000 M (aprox.) | no disponible | Modelo multimodal audio-texto afinado para instrucciones | no disponible en la informacion | Hugging Face, ModelScope |

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado como `test-artifact` para excluirlo de la búsqueda de modelos candidatos; no debe desplegarse en producción.
- La licencia no está declarada en la información disponible; verificar la licencia del modelo base `Qwen/Qwen2-Audio-7B` antes de cualquier uso derivado.
- La configuración reducida (2 capas en encoder y decoder) no reproduce el comportamiento del modelo real; los tests de calidad o exactitud no son válidos.
- No se documentan idiomas soportados ni sesgos, al no ser un modelo entrenado.
- El contexto máximo no está confirmado en el fixture; no asumir el del modelo base sin verificar el `config.json`.
- Riesgo de confusión: el nombre incluye "qwen2-audio" pero no es el modelo Qwen2-Audio; descargarlo esperando funcionalidad real lleva a error.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/qwen2-audio-vllm-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2-Audio-7B
- Repositorio oficial Qwen2-Audio: https://github.com/qwenlm/qwen2-audio
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de contraccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Documentacion del proceso de contraccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen2-audio-vllm-mic.html
- Manifiesto del contrato (`integration.json`): https://huggingface.co/huggingface-mic/qwen2-audio-vllm-mic/blob/main/integration.json
- Uso con Transformers (`usage.md`): https://huggingface.co/huggingface-mic/qwen2-audio-vllm-mic/blob/main/integrations/transformers/usage.md
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/qwen2-audio-vllm-mic/blob/main/build.json
