# huggingface-mic/Llama-3.2-11B-Vision-Instruct-mic

## Resumen

`huggingface-mic/Llama-3.2-11B-Vision-Instruct-mic` es un artefacto de prueba (fixture) publicado por el equipo de Hugging Face MIC para validar la integración de frameworks con modelos multimodales de la familia Llama 3.2 Vision. No es un modelo usable: se trata de una version reducida artificialmente del checkpoint `unsloth/Llama-3.2-11B-Vision-Instruct`, con solo 20,7 millones de parametros frente a los aproximadamente 11 mil millones del original. Su funcion esta etiquetada explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

El fixture conserva la arquitectura `MllamaForConditionalGeneration` y los mismos nombres de tensores que el checkpoint real, pero con una configuracion reducida (2 capas en el encoder de vision y 2 capas en el modelo de texto). Los ficheros del procesador (tokenizer, chat template, preprocessor config, generation config) se copian byte a byte del modelo base, de modo que el pipeline de preprocesado es identico al de produccion.

Su relevancia es puramente de ingenieria: permite a los mantenedores de Transformers y de otros frameworks ejecutar pruebas de integracion, validacion de contratos y comprobaciones de sensibilidad de entrada sin descargar ni cargar los 11B parametros reales. Cualquier uso como modelo generativo, de razonamiento o de vision en produccion es inapropiado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MllamaForConditionalGeneration (transformer multimodal texto+vision) |
| Parametros totales | 20.669.621 (fixture reducido); el modelo base tiene ~11B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura Mllama de Llama 3.2 Vision, que combina un encoder de vision con un modelo de lenguaje transformer. En esta version reducida, el encoder de vision tiene 2 capas (`vision num_hidden_layers 2`) y el modelo de texto tambien 2 capas (`text num_hidden_layers 2`), aplicando la regla generica de reduccion del script `sweep.py` del repositorio `transformers-mic`. Los nombres de tensores coinciden con los del checkpoint real, lo que permite validar rutas de carga y compatibilidad de frameworks.

No ha habido entrenamiento en el sentido habitual: el fixture esta sobreajustado artificialmente al paso de entrenamiento del contrato (50 pasos) para superar la puerta de sensibilidad de entrada. Los pesos aleatorios fallaban esa comprobacion (`pixel_values:roll_batch` movia los logits solo 0, con umbral 0.001). Los ficheros del procesador se copiaron byte a byte desde `unsloth/Llama-3.2-11B-Vision-Instruct`. El modelo es finito en float32, bfloat16 y float16 (forward, loss y gradientes), lo que garantiza estabilidad numerica en las pruebas.

## Capacidades

- No es un modelo funcional: no genera texto coherente, no razona, no responde a prompts y no procesa imagenes de forma util.
- Conserva la interfaz de `MllamaForConditionalGeneration`, por lo que puede cargarse con `AutoModelForVision2Seq`/`MllamaForConditionalGeneration` y el procesador original.
- Permite validar contratos de integracion: carga de pesos, formas de tensores, pipeline de preprocesado de imagenes y texto, chat template y generation config.
- Sirve como fixture para pruebas de sensibilidad de entrada (variaciones en `pixel_values` e `input_ids` deben producir cambios en los logits).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues reales.
- No dispone de modo thinking, audio ni ninguna capacidad especial mas alla de la estructura arquitectonica.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `MllamaForConditionalGeneration` y verificar que el pipeline de vision-lenguaje se ejecuta sin errores, usando los ficheros de procesador copiados del modelo real.
- Validacion de contratos de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen (formas de salida, dtypes, nombres de tensores) antes de liberar cambios en la libreria.
- CI/CD de bajo coste: ejecutar la suite de tests de modelos multimodales en runners sin GPU de gran capacidad, ya que el repo ocupa 0,1 GB y los pesos caben en cualquier entorno.
- Pruebas de sensibilidad de entrada: verificar que perturbaciones en `pixel_values` o `input_ids` alteran los logits por encima del umbral, detectando regresiones en el flujo de atencion cruzada.
- Desarrollo de utilidades de serializacion: probar herramientas de conversion, sharding o inspeccion de safetensors sobre un checkpoint con la misma estructura que el modelo real pero con un coste minimo.
- Validacion de chat templates y tokenizer: al copiarse byte a byte del modelo base, permite probar el formateo de conversaciones y el preprocesado de imagenes sin cargar los 11B parametros.
- Reproducibilidad de fixtures: reconstruir el artefacto con `build_fixtures.py --fixture Llama-3.2-11B-Vision-Instruct-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba sin capacidad generativa, por lo que metricas como MMLU, HumanEval o GSM8K no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (20,7M parametros, ~41 MB de pesos) mas el overhead del framework y del procesador de vision.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien funciona en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (carga directa con `MllamaForConditionalGeneration`); vLLM, llama.cpp, Ollama y TGI no estan soportados de forma verificada para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de prueba, las mediciones carecen de sentido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-11B-Vision-Instruct-mic | 20,7M (fixture) | no disponible | Test artifact | no disponible | Hugging Face |
| unsloth/Llama-3.2-11B-Vision-Instruct | ~11B | no disponible en la informacion | Modelo multimodal real | no disponible en la informacion | Hugging Face |
| Llama 3.2 11B Vision Instruct (Meta) | ~11B | 128k (segun documentacion publica de Meta) | Modelo multimodal real | Llama 3.2 Community License | Hugging Face, Meta |

La comparativa con alternativas de la misma categoria no es significativa: el fixture no compite funcionalmente con ningun modelo, solo replica la estructura del checkpoint base para pruebas de integracion.

## Limitaciones y advertencias

- No es un modelo usable: no genera respuestas coherentes ni procesa imagenes de forma significativa. Su uso en produccion produciria salidas sin sentido.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe tratarse como un checkpoint desplegable.
- Los pesos estan sobreajustados artificialmente a un paso de entrenamiento de 50 pasos; no reflejan el comportamiento del modelo base.
- La licencia no esta declarada en la informacion disponible; conviene consultar la licencia del modelo base (`unsloth/Llama-3.2-11B-Vision-Instruct` y, en ultima instancia, la Llama 3.2 Community License de Meta) antes de cualquier redistribucion.
- No se dispone de informacion sobre sesgos, idiomas o riesgos de alucinacion porque el modelo no ejecuta inferencia real.
- El repositorio incluye solo los pesos reducidos, el uso de Transformers y las expectativas del framework; otros ficheros deben regenerarse con `build_fixtures.py`.
- No usar como sustituto del checkpoint real en evaluaciones de calidad, seguridad o rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/Llama-3.2-11B-Vision-Instruct-mic
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-11B-Vision-Instruct
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/Llama-3.2-11B-Vision-Instruct-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Llama-3.2-11B-Vision-Instruct-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Llama-3.2-11B-Vision-Instruct-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Llama-3.2-11B-Vision-Instruct-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Llama-3.2-11B-Vision-Instruct-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
