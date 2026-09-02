# CodeSoft/sorbet-mini-experimental

## Resumen

Sorbet Mini Experimental es un modelo de lenguaje pequeño (4,9 millones de parámetros) desarrollado por CodeSoft como banco de pruebas para la línea de modelos Sorbet. Su propósito explícito no es ser competitivo en calidad, sino ofrecer una base lo suficientemente rápida para iterar sobre experimentos sin consumir horas de cómputo por prueba. El autor lo entrenó sobre 150 millones de tokens del dataset TinyStories en solo 12 minutos con una única GPU RTX 5060 Ti, lo que lo convierte en un vehículo ideal para validar hipótesis de arquitectura, datos o hiperparámetros antes de escalar a modelos mayores.

Arquitectónicamente es un transformer causal de la familia Qwen2 (Qwen2ForCausalLM), con 8 capas, 6 cabezas de atención con GQA (1 clave/valor), dimensión oculta de 192 y vocabulario de 8192 tokens. El contexto de entrenamiento es de 256 tokens, ampliable a 512 en inferencia. Se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y GGUF, y es compatible con transformers y llama.cpp. Su relevancia actual radica en que demuestra un ciclo de entrenamiento completo en menos de un cuarto de hora, lo que permite explorar rápidamente variaciones de la receta de entrenamiento de la familia Sorbet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer causal) |
| Parametros totales | 4.920.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens de entrenamiento, hasta 512 en inferencia |
| Tipos de cuantizacion | bf16 (referencia), f16, Q8_0 (GGUF) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen2ForCausalLM, nativa en transformers y llama.cpp. Su configuración concreta es: 8 capas, dimensión oculta de 192, 6 cabezas de atención con dimensión 32 cada una, atención con grouped-query attention (GQA) con 1 sola cabeza clave/valor, tamaño intermedio del feed-forward de 576 y embeddings atados (tied embeddings). El vocabulario es de 8192 tokens, compartido con la familia sorbet-25m.

El entrenamiento se realizó sobre 149.999.872 tokens del dataset TinyStories, en 1144 pasos con secuencias de 256 tokens. Se usó precisión bf16 con AdamW de 8 bits, tasa de aprendizaje con decaimiento coseno de 3e-4 a 1e-5, weight decay de 0,1 (sin decaimiento en embeddings ni normalización) y grad clip de 1,0. El hardware fue una RTX 5060 Ti de 16 GB. La pérdida de entrenamiento bajó de 8,13 a 2,81, y la perplejidad de validación pasó de 3595 a 19,47. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un preentrenamiento puro.

## Capacidades

- Generacion de texto basica en ingles, con coherencia limitada por el tamaño y el dataset TinyStories (historias cortas para niños).
- Razonamiento y matematicas: no se reportan capacidades especificas; el modelo es demasiado pequeño para tareas complejas.
- Codigo: no se menciona soporte para generacion de codigo.
- Tool calling / function calling: no disponible.
- Soporte para agentes o multi-step reasoning: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: ninguna (sin vision, audio ni modo thinking).
- El modelo es util principalmente como banco de pruebas para experimentos de entrenamiento, no para tareas de produccion.

## Casos de uso

- Validacion rapida de hipotesis de entrenamiento: al completar un preentrenamiento en 12 minutos, permite probar cambios en la arquitectura, el dataset o los hiperparametros (por ejemplo, variar la tasa de aprendizaje o el weight decay) y observar el efecto en la perplejidad sin esperar horas.
- Pruebas de integracion con frameworks de inferencia: al ser compatible con transformers y llama.cpp, sirve para verificar que un pipeline de despliegue (vLLM, Ollama, TGI) funciona correctamente con un modelo Qwen2 antes de usarlo con modelos mas grandes.
- Desarrollo de tokenizers: al compartir vocabulario con la familia sorbet-25m, permite probar el tokenizer en un entorno de bajo coste computacional.
- Experimentos de cuantizacion: los pesos en GGUF Q8_0 y f16 permiten evaluar el impacto de la cuantizacion en la calidad de generacion con un modelo minimo.
- Educacion e investigacion: sirve como ejemplo didactico de un transformer causal entrenado desde cero, con una receta de entrenamiento completa y reproducible en una GPU de consumo.
- Benchmarking de hardware: al ser extremadamente ligero (menos de 10 MB en bf16), es util para medir el rendimiento de GPUs o CPUs en tareas de generacion de texto sin requerir grandes recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos reportados son:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento (final) | 2,81 |
| Perplejidad de validacion | 19,47 |
| Tiempo de entrenamiento | 12 minutos en RTX 5060 Ti 16GB |
| Tokens de entrenamiento | 149.999.872 |

Estos valores indican que el modelo ha aprendido coherencia linguistica basica en TinyStories, pero no permiten compararlo con modelos de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en bf16 (el modelo pesa ~9,9 MB en bf16 y ~5,2 MB en Q8_0). Cabe en cualquier GPU moderna, incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; la RTX 5060 Ti usada para entrenamiento es mas que suficiente para inferencia.
- Compatible con GPU de consumo: si, cualquier GPU de escritorio (GTX 1060, RTX 3060, etc.) puede ejecutarlo sin problemas.
- Opciones de despliegue: transformers (Python), llama.cpp (CLI), y por extension cualquier servidor compatible con GGUF (Ollama, llama-cpp-python). Tambien es compatible con text-generation-inference (TGI) segun las etiquetas del repositorio.
- Latencia y throughput: no se han publicado mediciones, pero dado el tamano del modelo, la generacion es practicamente instantanea en GPU y muy rapida en CPU moderna.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (modelos de ~5M parametros entrenados en TinyStories). El propio autor menciona que el rendimiento esperado de la version completa de Sorbet Mini deberia acercarse a otros modelos de tamano similar, pero no proporciona nombres ni datos. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Modelo experimental: el autor indica explicitamente que no esta pensado para ser "bueno" y que su unico objetivo es servir de base rapida para iterar.
- Sesgos y calidad: entrenado exclusivamente en TinyStories, un dataset de historias infantiles en ingles; no generaliza a otros dominios ni estilos.
- Riesgo de alucinacion: alto, como es esperable en un modelo de 4,9M de parametros; no es apto para tareas que requieran hechos verificables.
- Contexto limitado: 256 tokens de entrenamiento y 512 en inferencia; no puede manejar conversaciones o documentos largos.
- Idioma: solo ingles; no soporta espanol ni otros idiomas.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo no tiene utilidad practica en produccion debido a su baja calidad.
- Sin garantias de soporte: al ser un proyecto experimental de un desarrollador independiente, no hay mantenimiento ni actualizaciones aseguradas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CodeSoft/sorbet-mini-experimental
- Modelo relacionado (sorbet-25m): https://huggingface.co/CodeSoft/sorbet-25m/tree/main
- Publicacion del autor sobre la familia Sorbet: https://huggingface.co/posts/CodeSoft/616792874930010
- Visualizacion de arquitectura de sorbet-v2-25m (referencia de la familia): https://hfviewer.com/CodeSoft/sorbet-v2-25m
