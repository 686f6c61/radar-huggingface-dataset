# huggingface-mic/llava-onevision-qwen2-0.5b-ov-hf-mic

## Resumen

`llava-onevision-qwen2-0.5b-ov-hf-mic` es un artefacto de prueba publicado por el usuario `huggingface-mic`, no un modelo utilizable. Se trata de una version "slim" (reducida) del checkpoint multimodal `llava-hf/llava-onevision-qwen2-0.5b-ov-hf`, generada con la herramienta `build_fixtures.py` del repositorio `transformers-mic` para validar contratos de integracion y expectativas de frameworks. El modelo conserva la arquitectura `LlavaOnevisionForConditionalGeneration` y los mismos nombres de tensores que el original, pero con solo 9.962.112 parametros reales (frente a los ~500 millones del modelo base) y pesos aleatorios inicializados con semilla 17.

El objetivo del artefacto es servir como fixture reproducible: permite comprobar que una integracion (por ejemplo, el pipeline de Transformers) carga, ejecuta forward, calcula perdida y propaga gradientes sin errores, con archivos de procesador copiados byte a byte del modelo original. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos, y advierte de que "no es un modelo usable".

Por tanto, esta ficha documenta un objeto de ingenieria de software (un fixture de pruebas) y no un modelo de IA desplegable. Cualquier dato de rendimiento, capacidades o benchmarks debe interpretarse en ese contexto: el modelo no produce salidas linguisticas coherentes porque sus pesos son aleatorios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlavaOnevisionForConditionalGeneration (vision-language transformer, config reducida) |
| Parametros totales | 9.962.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | llava-hf/llava-onevision-qwen2-0.5b-ov-hf |
| Capas vision (num_hidden_layers) | 2 |
| Capas texto (num_hidden_layers) | 2 |
| Semilla de inicializacion | 17 (pesos aleatorios) |
| Dtype de guardado | float16 |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del checkpoint original `llava-hf/llava-onevision-qwen2-0.5b-ov-hf` (un modelo LLaVA-OneVision con backbone de lenguaje Qwen2 de 0,5B), pero con una configuracion reducida: 2 capas en el codificador visual y 2 capas en el modelo de texto. La reduccion se aplica con la regla generica de `sweep.py` del repositorio `transformers-mic`, que conserva los nombres de tensores del checkpoint real y copia byte a byte los archivos del procesador (`tokenizer.json`, `preprocessor_config.json`, `video_preprocessor_config.json`, `chat_template.json`, entre otros).

No hay entrenamiento. Los pesos se inicializan de forma aleatoria con semilla 17 y se validan mediante un "input-sensitivity gate": cada perturbacion de las entradas del contrato debe mover los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produce 0,309). El fixture es finito en float32, bfloat16 y float16 (forward, perdida y gradientes), y se guarda en float16, el dtype por defecto del modelo base. No se aplico RLHF, DPO ni preentrenamiento de ningun tipo.

## Capacidades

- No es un modelo funcional: sus pesos son aleatorios y no genera texto ni descripciones coherentes.
- Sirve como fixture de integracion para validar la carga de `LlavaOnevisionForConditionalGeneration` en Transformers.
- Permite verificar el pipeline image-text-to-text a nivel de contrato (formas de tensores, dtypes, propagacion de gradientes).
- Comprueba la compatibilidad byte a byte de los archivos de procesador y tokenizador del modelo base.
- Valida la sensibilidad de las entradas (perturbaciones de `pixel_values`, `input_ids`, etc.) frente a los logits.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues reales.
- No dispone de modo thinking, vision funcional ni audio.

## Casos de uso

- Pruebas de integracion en CI: usar el fixture para verificar que una nueva version de Transformers carga y ejecuta `LlavaOnevisionForConditionalGeneration` sin errores, sin descargar los ~1 GB del checkpoint real.
- Validacion de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen (formas de salida, dtypes, gradientes finitos).
- Desarrollo de pipelines multimodales: probar el flujo image-text-to-text de extremo a extremo con un modelo ligero que cabe en cualquier GPU consumer o incluso en CPU.
- Regresion de tokenizador y procesador: al copiarse los archivos byte a byte del modelo base, permite detectar cambios incompatibles en el procesamiento de imagenes y video.
- Docencia y ejemplos: ilustrar la estructura de un checkpoint LLaVA-OneVision sin coste de descarga ni requisitos de VRAM.
- Verificacion de herramientas de conversion: validar scripts que transforman safetensors a otros formatos (GGUF, etc.) sobre un checkpoint de 10M de parametros antes de aplicarlos al modelo real.
- Reproducibilidad de experimentos: el archivo `build.json` registra fuentes fijadas, resultados del gate y hashes de archivos, lo que permite reconstruir el fixture de forma determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K, VQAv2, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 100 MB en float16 (10M de parametros ≈ 20 MB de pesos, mas activaciones minimas).
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas GTX 1050, RTX 2060 o superiores; tambien funciona en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Transformers (via `AutoModelForVision2Seq` o clase equivalente), y previsiblemente llama.cpp/Ollama tras conversion, aunque no se documenta soporte oficial.
- Latencia y throughput: no disponibles; al ser un fixture, no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `huggingface-mic/llava-onevision-qwen2-0.5b-ov-hf-mic` | 9,96 M (fixture) | no disponible | no disponible | Fixture de pruebas, pesos aleatorios |
| `llava-hf/llava-onevision-qwen2-0.5b-ov-hf` | ~500 M | no disponible en la informacion | no disponible en la informacion | Modelo multimodal real image-text-to-text |
| `llava-hf/llava-onevision-qwen2-7b-ov-hf` | ~7 B | no disponible en la informacion | no disponible en la informacion | Version grande de la misma familia |

La comparacion relevante es con el modelo base: el fixture comparte arquitectura y archivos de procesador, pero sustituye los pesos entrenados por pesos aleatorios y reduce las capas a 2 en cada torre. No es un sustituto funcional del modelo original.

## Limitaciones y advertencias

- No es un modelo usable: la model card lo declara explicitamente como `test-artifact` con pesos aleatorios.
- Las salidas no tienen significado linguistico; no debe emplearse en produccion, demos publicas ni evaluaciones de calidad.
- No se debe confundir con `llava-hf/llava-onevision-qwen2-0.5b-ov-hf`; comparten arquitectura pero no capacidades.
- La licencia no esta declarada en la informacion disponible; conviene consultar el repositorio del modelo base antes de cualquier uso.
- No se declaran idiomas soportados.
- El contexto maximo y la configuracion completa del modelo no estan documentados en la informacion proporcionada.
- El artefacto esta pensado para validar contratos de integracion; usarlo fuera de ese ambito puede generar falsos positivos en pruebas de calidad.
- Riesgo de alucinacion: total, al no existir conocimiento aprendido en los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/llava-onevision-qwen2-0.5b-ov-hf-mic
- Modelo base: https://huggingface.co/llava-hf/llava-onevision-qwen2-0.5b-ov-hf
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/llava-onevision-qwen2-0.5b-ov-hf-mic.html
