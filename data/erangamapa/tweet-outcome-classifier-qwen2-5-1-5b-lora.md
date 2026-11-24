# erangamapa/tweet-outcome-classifier-qwen2.5-1.5b-lora

## Resumen

`erangamapa/tweet-outcome-classifier-qwen2.5-1.5b-lora` es un adaptador LoRA (no QLoRA) entrenado sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Su función es leer un post corto de noticias deportivas y devolver un objeto JSON con cuatro campos: `event_type`, `entity`, `certainty` y `market_direction`. Lo desarrolla el usuario erangamapa dentro del proyecto model-foundry, y está pensado como prueba de concepto de un pipeline de clasificación orientado a casa de apuestas deportivas (sportsbook).

El adaptador se entrenó sobre datos sintéticos: 47 filas de entrenamiento y 10 de validación extraídas de los fixtures del repositorio, más 30 filas de muestra dorada reservadas para test. El propio autor lo describe explícitamente como "una prueba de pipeline diminuta, no un clasificador de producción". El repositorio se renombró desde una versión QLoRA porque la cuantización de 4 bits con bitsandbytes no funciona en macOS, por lo que el modelo base se cargó en fp32 sin cuantizar.

La relevancia de esta ficha es limitada y debe interpretarse como tal: no es un modelo nuevo ni un checkpoint completo, sino un adaptador PEFT de 0 descargas y 0 likes en el momento de la consulta, con una evaluación honesta que reconoce que una regresión logística con TF-IDF iguala o supera al adaptador en los tres campos categóricos. Su interés real es metodológico: documenta un flujo de fine-tuning ligero en hardware de consumo (Apple M1 Max, 75 segundos de entrenamiento) y una evaluación con baselines clásicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parámetros totales | No disponible (adaptador LoRA con r=16, alpha=32 sobre proyecciones q/k/v/o; el modelo base tiene 1.5B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia usada en entrenamiento); contexto nativo del base no disponible en la información |
| Tipos de cuantización | Entrenado en fp32 sin cuantización; el adaptador es compatible con PEFT estándar, pero no se documentan cuantizaciones probadas |
| Idiomas soportados | No disponibles (entrenado sobre datos sintéticos en inglés presumiblemente, no declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json` (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA plano con r=16, alpha=32 y dropout 0.05 aplicado sobre las proyecciones de query, key, value y output del modelo base Qwen2.5-1.5B-Instruct. Se entrenó durante 5 épocas (60 pasos), batch size 4, learning rate 2e-4 con scheduler coseno, precisión fp32, semilla 13 y longitud máxima de secuencia 512. El entrenamiento se ejecutó en un Apple M1 Max (MPS) en aproximadamente 75 segundos usando el script `foundry/finetune/sft.py` y el `train_config.yaml` incluidos en el repositorio.

Los datos de entrenamiento proceden de dos fuentes sintéticas del repositorio model-foundry: `data/fixtures/tweets_fixture.csv` (60 filas) y `data/golden/tweets_golden_sample.jsonl` (30 filas). Se eliminaron 3 filas de fixtures que aparecían literalmente en la muestra dorada, quedando 57 filas divididas en 47 de entrenamiento y 10 de validación (split aleatorio, semilla 13). El test son las 30 filas de la muestra dorada, nunca vistas en entrenamiento. Jugadores y equipos son inventados y las etiquetas son propias del repositorio (`label_source` = human). El autor advierte que ambos ficheros se generaron a partir del mismo conjunto reducido de plantillas de frases con nombres intercambiados, por lo que el test mide la capacidad de aprender esas plantillas, no el rendimiento sobre posts reales. El prompt de entrenamiento es el del repositorio (mensaje de sistema más el post como mensaje de usuario); el adaptador espera ese formato.

## Capacidades

- Clasificación de posts cortos de noticias deportivas en un JSON con cuatro campos: `event_type`, `entity`, `certainty` y `market_direction`.
- Generación de salida JSON válida de forma consistente (1.00 de validez en el conjunto de test).
- Extracción de entidad nombrada (`entity`), capacidad que el baseline TF-IDF + regresión logística no cubre.
- Clasificación restringida a 7 tipos de evento y 3 niveles de certeza, los únicos que conoce el adaptador.
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas ni evaluadas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Prototipado de pipelines de clasificación de noticias deportivas: sirve para validar el flujo completo (carga del base, aplicación del adaptador, prompt de sistema, parseo de JSON) antes de invertir en datos reales y un modelo mayor.
- Extracción estructurada de entidades en posts sintéticos: el adaptador devuelve `entity` en JSON, algo que el baseline clásico del propio autor no puede hacer, útil para demostrar la viabilidad de la extracción conjunta con la clasificación.
- Docencia y demostración de fine-tuning LoRA en hardware de consumo: el entrenamiento completo en un M1 Max en 75 segundos lo convierte en un ejemplo reproducible para cursos de ajuste fino.
- Benchmark de baselines: el repositorio incluye comparación contra mayoría de clase y TF-IDF + regresión logística, útil como plantilla metodológica para evaluar adaptadores pequeños con honestidad.
- Prueba de integración de PEFT con vLLM o TGI en fase de desarrollo: permite verificar la carga de adaptadores LoRA y el formato de prompt antes de escalar a un modelo mayor.
- Generación de datos etiquetados de arranque: puede usarse para preetiquetar lotes de posts con el esquema de cuatro campos y revisión humana posterior, siempre que se sustituyan las plantillas por datos reales.
- No es adecuado para liquidación de apuestas, fijación de precios ni decisiones automatizadas con impacto económico, tal como advierte el autor.

## Benchmarks y rendimiento

Evaluación sobre 30 filas de la muestra dorada reservada, decodificación greedy. Métrica: fracción de filas correctas; "exact match" exige los cuatro campos correctos.

| Sistema | JSON válido | event_type | entity | certainty | market_direction | Exact match (4 campos) |
|---|---|---|---|---|---|---|
| Este adaptador | 1.00 | 1.00 | 1.00 | 0.90 | 1.00 | 0.90 |
| Qwen2.5-1.5B-Instruct base, mismo prompt, sin adaptador | 1.00 | 0.00 | 0.37 | 0.00 | 0.07 | 0.00 |
| Mayoría de clase del train (por campo) | n/a | 0.27 | 0.07 | 0.63 | 0.50 | 0.00 |
| TF-IDF + regresión logística por campo (sin entidad) | n/a | 1.00 | n/a | 1.00 | 1.00 | n/a |

Lectura honesta según el autor: la fila del modelo base no es una comparación justa de capacidad, porque el prompt no enumera los valores de etiqueta permitidos y el modelo sin ajustar inventa los suyos ("player acquisition", "High"); solo demuestra que el adaptador aprendió el formato y el conjunto de etiquetas. La regresión logística TF-IDF entrenada con las mismas 47 filas iguala o supera al adaptador en los tres campos categóricos (no puede extraer la entidad). Con 30 filas de test, una fila equivale a 3,3 puntos porcentuales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; el modelo base Qwen2.5-1.5B-Instruct en fp16 requiere aproximadamente 3 GB de pesos, más overhead de activaciones y KV cache; el adaptador LoRA añade unos pocos MB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16; el entrenamiento se realizó en Apple M1 Max con MPS en fp32.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y similares; también en GPUs integradas Apple Silicon.
- Opciones de despliegue: PEFT (carga del adaptador sobre el base), vLLM y TGI admiten adaptadores LoRA; llama.cpp y Ollama requerirían fusión previa del adaptador con el base y conversión a GGUF, no documentada.
- Latencia y throughput estimados: no disponibles; el entrenamiento de 60 pasos tardó unos 75 segundos en M1 Max, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Qwen2.5-1.5B-Instruct) | 1.5B base + LoRA r=16 | 512 tokens en entrenamiento | Exact match 0.90 en test sintético | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct (base) | 1.5B | No disponible en la información | Exact match 0.00 sin ajuste en esta tarea | Apache 2.0 | Hugging Face, ampliamente usado |
| TF-IDF + regresión logística (baseline del autor) | No aplica (modelo clásico) | No aplica | 1.00 en event_type, certainty y market_direction; sin entidad | No especificada en el repo | Código en model-foundry |
| Clasificador BERT pequeño ajustado (alternativa genérica) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa con alternativas neuronales de la misma categoría no está disponible en la información proporcionada; el propio autor solo compara contra el base sin ajustar y contra un baseline clásico.

## Limitaciones y advertencias

- Entrenado sobre 47 filas sintéticas generadas con un conjunto reducido de plantillas; el test mide memorización de plantillas, no generalización a posts reales.
- No probado con posts reales, otras ligas, otros idiomas ni sarcasmo.
- Solo conoce 7 tipos de evento y 3 niveles de certeza; cualquier otro valor queda fuera de su espacio de salida.
- Riesgo de alucinación en el campo `entity` y en el resto de campos si la entrada se aleja del formato de entrenamiento.
- El prompt debe respetar el formato del repositorio (mensaje de sistema más post como mensaje de usuario); otros formatos degradan la salida.
- Sesgos conocidos: no documentados, pero los datos sintéticos con nombres inventados no representan la distribución real de nombres, equipos ni ligas.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen2.5-1.5B-Instruct tiene su propia licencia que debe verificarse por separado.
- El autor advierte explícitamente: no usar para liquidar apuestas ni mover precios.
- Repositorio con 0 descargas y 0 likes; sin mantenimiento ni comunidad verificable.
- El baseline TF-IDF iguala o supera al adaptador en los campos categóricos, por lo que el valor añadido del LLM en esta tarea es marginal salvo por la extracción de entidad y el formato JSON.

## Enlaces

- Hugging Face: https://huggingface.co/erangamapa/tweet-outcome-classifier-qwen2.5-1.5b-lora
- Repositorio model-foundry: https://github.com/erangamapa/model-foundry
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper de LoRA: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
