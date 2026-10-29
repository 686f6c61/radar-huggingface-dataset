# huggingface-mic/GLM-5.3-Flash-mic

## Resumen

GLM-5.3-Flash-mic no es un modelo utilizable, sino un artefacto de prueba ("slim fixture") publicado por la cuenta huggingface-mic, vinculada al proyecto transformers-mic de Hugging Face. Replica la arquitectura de zai-org/GLM-5.3-Flash —un modelo multimodal de generación de la familia GLM5Next— en una configuración reducida de 40,7 millones de parámetros con pesos aleatorios (semilla 17). Su propósito es verificar la integración de esta arquitectura en la librería transformers sin necesidad de descargar el checkpoint real, que incluye todos los parámetros del modelo completo.

El repositorio (0,2 GB) incluye los pesos en safetensors, un manifiesto de contrato de integración (integration.json), instrucciones de uso con transformers y el directorio de expectativas del framework. Está etiquetado explícitamente como test-artifact para excluirlo de búsquedas de modelos candidatos y, desde su creación el 29 de octubre de 2026, acumula 0 descargas y 0 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Glm5NextForConditionalGeneration (config reducida: 3 capas de texto) |
| Parametros totales | 40.717.946 (≈ 40,7 M, dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica; pesos guardados en float32 y verificados también en bfloat16 y float16 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible en la ficha (el repositorio incluye el archivo LICENSE copiado del modelo base) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture usa la misma clase de arquitectura que el checkpoint real, Glm5NextForConditionalGeneration, pero con una configuración reducida mediante la regla genérica definida en sweep.py del proyecto transformers-mic: el texto usa num_hidden_layers = 3. Conserva los mismos nombres de tensores que el checkpoint original, de modo que cualquier código de carga escrito para el modelo completo funciona sin cambios. Los archivos del procesador (LICENSE, chat_template.jinja, generation_config.json, processor_config.json, tokenizer.json y tokenizer_config.json) se copiaron byte a byte desde zai-org/GLM-5.3-Flash.

No hubo entrenamiento alguno: los pesos son aleatorios (semilla 17) y pasaron una puerta de sensibilidad de entrada que exige que cada perturbación de las entradas del contrato mueva los logits al menos 0,001 (el caso más débil fue attention_mask:all_ones, con 0,369). Los pesos se guardaron en float32 (el dtype por defecto con el que carga el modelo base) y se verificó que forward, pérdida y gradientes son finitos en float32, bfloat16 y float16. La clave del fixture es dee62193bd1d y cubre todo checkpoint cuyos archivos de procesador sean idénticos byte a byte y cuya configuración coincida tras la reducción.

## Capacidades

- Ejecución numérica verificada: forward, cálculo de pérdida y gradientes finitos en float32, bfloat16 y float16.
- Sensibilidad a entradas garantizada: las perturbaciones de las entradas del contrato mueven los logits de forma medible, requisito para tests de integración.
- Carga compatible con el checkpoint real: mismos nombres de tensores y archivos de procesador idénticos byte a byte.
- Procesador multimodal funcional a nivel estructural (tokenizer, chat template y configuración de procesador del modelo base).
- No genera texto coherente: al ser pesos aleatorios, carece de capacidades reales de lenguaje, razonamiento, código, matemáticas o visión.
- Sin tool calling, sin soporte de agentes, sin thinking mode y sin capacidades multilingües demostrables.

## Casos de uso

- Tests de integración en transformers: permite verificar que el código de carga de Glm5NextForConditionalGeneration funciona correctamente sin descargar el checkpoint completo del modelo real.
- Pipelines de CI/CD ligeros: con 0,2 GB de repositorio, los tests que requieren instanciar el modelo se ejecutan en segundos y con recursos mínimos frente a los gigabytes del checkpoint original.
- Validación de contratos de integración (MIC): el manifiesto integration.json y el directorio de expectativas permiten comprobar que un entorno cumple los requisitos del framework para esta arquitectura.
- Desarrollo de nuevas funciones en transformers: quien trabaje en la arquitectura glm5_next puede ejecutar pruebas y depurar parches usando un modelo pequeño con la misma estructura de tensores.
- Pruebas de estabilidad numérica entre dtypes: el fixture está verificado en float32, bfloat16 y float16, lo que lo hace adecuado para tests de conversión de precisión y de rutinas de autocasting.
- Depuración del procesador multimodal: los archivos del procesador son idénticos byte a byte a los del modelo base, así que se pueden probar tokenizer, chat template y configuración de procesador de forma representativa.
- Reproducibilidad y auditoría: build.json registra fuentes fijadas, resultados de las puertas de validación y hashes de archivos, lo que permite reconstruir el fixture con python example/build_fixtures.py --fixture GLM-5.3-Flash-mic.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Además, al tratarse de pesos aleatorios sin entrenamiento, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, etc.) carecería de significado. El único dato cuantitativo publicado es la puerta de sensibilidad de entrada: la perturbación más débil (attention_mask:all_ones) movió los logits 0,369, muy por encima del umbral exigido de 0,001.

## Requisitos de hardware

- VRAM estimada: los 40,7 M de parámetros en float32 ocupan unos 163 MB; el repositorio completo pesa 0,2 GB. Carga sin problemas con menos de 1 GB de VRAM.
- GPU recomendadas: no se requiere ninguna GPU concreta; cualquier GPU de consumo sirve, e incluso es viable ejecutarlo solo en CPU.
- Consumer GPUs: cabe en cualquiera, incluidas GPUs integradas o portátiles, dado el tamaño mínimo del modelo.
- Despliegue: diseñado para usarse con transformers siguiendo el usage.md del repositorio; no está orientado a vLLM, TGI, llama.cpp ni Ollama (no hay GGUF ni es un modelo productivo). Puede reconstruirse con build_fixtures.py del proyecto transformers-mic.
- Latencia y throughput: no disponible (no aplicable a un artefacto de prueba).

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Propósito | Licencia |
|---|---|---|---|---|
| GLM-5.3-Flash-mic (este repositorio) | 40,7 M (aleatorios) | Glm5NextForConditionalGeneration reducida (3 capas de texto) | Artefacto de prueba para integración en transformers | no disponible |
| zai-org/GLM-5.3-Flash (modelo base) | no disponible (checkpoint completo) | Glm5NextForConditionalGeneration | Modelo multimodal de generación real | no disponible |

No se han identificado en la información disponible otros fixtures públicos comparables de la familia GLM5Next.

## Limitaciones y advertencias

- Los pesos son aleatorios: cualquier salida del modelo es ruido sin sentido. No debe usarse para generación, chat, RAG ni ninguna tarea de NLP o visión.
- Riesgo de alucinación: el concepto no aplica directamente, pero cualquier texto producido carece por completo de valor semántico.
- Prohibido en producción: la propia model card lo declara test-artifact y no un modelo utilizable; está etiquetado para excluirlo de búsquedas de modelos candidatos.
- Configuración reducida (3 capas de texto): no representa el comportamiento computacional ni numérico del modelo real completo, solo su estructura de integración.
- Licencia no declarada en los metadatos de la ficha; el repositorio incluye el archivo LICENSE heredado del modelo base, que debe revisarse antes de cualquier redistribución.
- Sin comunidad ni historial: 0 descargas, 0 likes y sin datos de contexto, idiomas o benchmarks del modelo base en la información disponible.
- Los archivos del procesador son representativos del modelo base, pero el comportamiento del modelo completo (calidad de salida, cobertura lingüística, rendimiento) no puede inferirse de este fixture.

## Enlaces

- Ficha del modelo: https://huggingface.co/huggingface-mic/GLM-5.3-Flash-mic
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/GLM-5.3-Flash-mic/blob/main/integration.json
- Uso con transformers: https://huggingface.co/huggingface-mic/GLM-5.3-Flash-mic/blob/main/integrations/transformers/usage.md
- Expectativas del framework: https://huggingface.co/huggingface-mic/GLM-5.3-Flash-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/GLM-5.3-Flash-mic/blob/main/build.json
- Regla de reducción (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
