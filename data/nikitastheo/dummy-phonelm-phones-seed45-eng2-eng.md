# nikitastheo/dummy-phonelm-phones-seed45-eng2-eng

## Resumen

Nikitastheo/dummy-phonelm-phones-seed45-eng2-eng es un modelo de lenguaje causal de carácter experimental desarrollado por Nikitas Theodoropoulos (nikitastheo). Se trata de una prueba de concepto basada en la arquitectura GPT-2, con un total de 141.056 parámetros, entrenada con el script `train_clm.py` de Hugging Face Accelerate. El modelo se creó para validar un pipeline de entrenamiento causal y un tokenizer fonológico, tal como sugiere el nombre del tokenizer asociado, `phonelm-phones-seed45-eng2-eng-tokenizer`.

El modelo no resuelve ningún problema práctico en su estado actual: su entrenamiento se limitó a 12 pasos con un lote de 32, lo que produce salidas de texto de muy baja calidad. Su relevancia radica en servir como un recurso mínimo para pruebas de integración, depuración de scripts de entrenamiento y experimentos de laboratorio. No se han publicado especificaciones sobre la longitud de contexto, los idiomas soportados ni la licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (causal LM) |
| Parámetros totales | 141.056 |
| Parámetros activos | no disponible (el modelo no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal de tipo GPT-2, definido en `model_configs/gpt_dummy_config.json`. El proceso de entrenamiento no utiliza el `Trainer` de Hugging Face, sino el script `train_clm.py` basado en Hugging Face Accelerate. El tokenizer empleado es `nikitastheo/phonelm-phones-seed45-eng2-eng-tokenizer`, que por su nombre parece orientado a la codificación fonológica de secuencias en inglés, aunque la model card no lo especifica explícitamente.

Los hiperparámetros de entrenamiento son: 12 pasos máximos, tasa de aprendizaje 0.0001, scheduler lineal con 6 pasos de warmup, lote de 32 por dispositivo y acumulación de gradientes de 1. La model card indica un parámetro `language switch step` fijado en 3, pero no aporta más información sobre el corpus ni el número de tokens consumidos.

## Capacidades

- Generación de texto causal básica: produce secuencias de caracteres o subpalabras, pero su calidad es muy limitada por el escaso número de parámetros y pasos de entrenamiento.
- Sin soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.
- Capacidades multilingües no verificadas; la model card no declara idiomas soportados.
- No se han reportado capacidades de modo de pensamiento (`thinking mode`) ni de decodificación especulativa.

## Casos de uso

- Pruebas de integración en pipelines de CI/CD: al tener 141.056 parámetros, el modelo puede cargarse y ejecutarse en segundos, lo que permite verificar que una integración con `transformers` o `Accelerate` no falle.
- Validación de tokenizers fonológicos: se puede usar para comprobar que el tokenizer `phonelm-phones-seed45-eng2-eng-tokenizer` genera secuencias coherentes con la codificación fonológica subyacente.
- Depuración de scripts de entrenamiento: sirve como caso mínimo para reproducir errores o medir tiempos en `train_clm.py`.
- Pruebas de despliegue en servidores de inferencia: es útil para comprobar la compatibilidad con `vLLM`, `TGI` o `llama.cpp` sin consumir apenas recursos.
- Experimentos de `language switching`: el ajuste `language switch step=3` permite estudiar cómo afecta un cambio de datos en un modelo casi sin entrenar.
- Docencia sobre modelos causales: permite ilustrar la relación entre tamaño del modelo, número de pasos de entrenamiento y calidad de la generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB en precisión float32, por lo que no requiere GPU.
- GPU recomendada: ninguna; cualquier CPU moderna es suficiente.
- Consumer GPU: el modelo puede ejecutarse en cualquier GPU de consumo, incluidos los gráficos integrados, aunque no son necesarios.
- Opciones de despliegue: puede servirse mediante transformers, vLLM, TGI o convertirse a GGUF para usar con llama.cpp.
- Latencia y throughput: no disponibles, pero dado el tamaño, la generación será del orden de milisegundos incluso en CPU.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada, y al tratarse de un modelo dummy sin contexto de publicación, cualquier comparación sería engañosa.

## Limitaciones y advertencias

- El modelo se entrenó únicamente durante 12 pasos, por lo que la generación de texto es incoherente y no apta para ningún uso real.
- Presenta un riesgo alto de alucinación y de repetición de patrones triviales.
- Los idiomas soportados no están documentados; no se puede garantizar un comportamiento correcto en inglés ni en otras lenguas.
- La licencia no está definida, lo que impide su uso en entornos comerciales sin aclarar los términos.
- No es apto para producción ni para investigación que requiera resultados fiables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/dummy-phonelm-phones-seed45-eng2-eng
- Tokenizer asociado: https://huggingface.co/nikitastheo/phonelm-phones-seed45-eng2-eng-tokenizer
- Perfil del autor: https://huggingface.co/nikitastheo
