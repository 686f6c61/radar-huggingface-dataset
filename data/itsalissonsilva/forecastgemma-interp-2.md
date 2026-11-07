# itsalissonsilva/forecastgemma-interp

## Resumen

forecastgemma-interp es un adaptador LoRA de investigación publicado por el usuario itsalissonsilva sobre el modelo base google/gemma-3-1b-it. Su propósito no es la generación de texto general, sino la construcción de un "readout" de pronóstico compacto: dado un evento binario con fecha límite, criterios de resolución, información de contexto y una probabilidad de mercado congelada, el adaptador devuelve una probabilidad calibrada y la masa de probabilidad asignada a los dos tokens de respuesta (sí/no). Está pensado como herramienta de estudio de interpretabilidad y de cómo el fine-tuning altera las estimaciones probabilísticas de un modelo.

El modelo se distribuye como un adaptador PEFT (LoRA sobre las proyecciones Q/V, rango 16, alpha 32) que requiere descargar el modelo base por separado. El repositorio ocupa aproximadamente 0,1 GB y se acompaña de un script `forecast.py` que implementa la interfaz `Forecaster`. La relevancia actual reside en su enfoque metodológico: incluye adaptadores de control (LoRA con resultados barajados y LoRA solo de formato) y análisis de intervención por capas, lo que permite reproducir experimentos de interpretabilidad sobre un modelo pequeño y desplegable en hardware modesto.

Los resultados declarados por el autor sitúan el Brier score calibrado del adaptador en 0,15833 sobre 256 preguntas de test, frente a 0,29587 del Gemma base calibrado. Sin embargo, el propio autor advierte que el prior de mercado congelado (0,10156) supera al modelo, por lo que la aplicación soportada es el estudio del comportamiento de pronóstico, no la sustitución de un mercado de predicción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Gemma 3 1B; adaptador sobre proyecciones Q/V |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base Gemma 3 1B no declara desglose en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; evaluación GPU en bfloat16, inferencia CPU en float32 soportada por el helper |
| Idiomas soportados | en |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-3-1b-it (revisión base `dcc83ea841ab6100d6b47a070329e1ba4cf78752`), un transformer decoder-only de 1B parámetros. El LoRA se dirige a las proyecciones Q/V con rango 16 y alpha 32, learning rate 1e-4, batch size 4, tres épocas y una sola semilla; la época 2 fue seleccionada por log score de validación. La interfaz evaluada no usa `generate()`, sino una lectura de dos tokens (sí/no) más una temperatura de calibración de 2,0 con sesgo cero.

Los datos provienen del dataset ForecastBench, con preguntas de Manifold, Metaculus y Polymarket congeladas en commits anteriores a cada fecha límite de pronóstico. Solo se seleccionaron preguntas binarias con resultado resuelto antes del corte declarado. Los deadlines de entrenamiento abarcan de marzo a diciembre de 2025, la validación de enero a marzo de 2026 y el test el 7 de junio, 2 de agosto y 13 de septiembre de 2026, con IDs de pregunta disjuntos. La calibración y la selección de época usan subconjuntos de validación disjuntos (55 y 56 preguntas).

Como evidencia de interpretabilidad, el repositorio incluye cinco intensidades de adaptador, las 26 eliminaciones individuales de capa y 27 comparaciones de estados ocultos sobre 64 prompts fijos de test. Cada eliminación de capa es una intervención real sobre las contribuciones del adaptador, no un circuito descubierto ni una etiqueta semántica de características. No se realizó descomposición SAE ni comparación entre modelos según la información disponible.

## Capacidades

- Lectura de pronóstico binario: devuelve una probabilidad calibrada, el readout binario crudo y la masa de probabilidad asignada a los dos tokens de respuesta.
- Procesamiento de entradas estructuradas con fecha límite, pregunta, criterios de resolución, contexto y probabilidad previa congelada.
- Comparación controlada entre modelo base, adaptador entrenado y adaptadores de control (resultados barajados, solo formato).
- Análisis de intervención por capas para estudiar cómo el fine-tuning modifica las estimaciones.
- Reproducibilidad de experimentos con pesos y probabilidades por pregunta incluidos en el repositorio.
- No realiza recuperación de información, verificación de hechos ni control de fechas: el helper no impone esas garantías.
- Capacidades multilingües limitadas al inglés (`en`).
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Panel de revisión de pronósticos: un revisor introduce una pregunta con fecha límite, la información disponible en esa fecha y un prior de mercado de 0,40; el modelo muestra su probabilidad junto al prior y conserva la marca temporal y los criterios de resolución para auditoría.
- Estudio de interpretabilidad de fine-tuning: comparar la misma pregunta bajo el modelo base, el adaptador entrenado y las eliminaciones de capa registradas para observar cómo cambian las estimaciones con cada intervención.
- Reproducción de experimentos de calibración: usar los subconjuntos de validación y los parámetros de temperatura documentados para replicar la curva de calibración y el Brier score en un entorno fijado por revisión.
- Evaluación de adaptadores de control: entrenar o inspeccionar los LoRA de resultados barajados y solo formato incluidos para medir cuánto del rendimiento proviene del contenido frente al formato de la tarea.
- Docencia y cuadernos de investigación: construir un notebook reproducible sobre un modelo de 1B que cabe en GPU de consumo, con inferencia CPU en float32 soportada por el helper.
- Benchmarking de baselines de pronóstico: usar el adaptador como referencia pequeña y congelada frente a modelos mayores como el baseline Qwen3.5-9B evaluado en el mismo conjunto de 256 preguntas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 256 preguntas de test retenidas. Menor Brier y log score son mejores.

| Condición | Brier | Log score |
|---|---:|---:|
| Prior de mercado congelado | 0,10156 | 0,32981 |
| Baseline Qwen3.5-9B congelado, crudo | 0,15076 | 0,48045 |
| Baseline Qwen3.5-9B congelado, calibrado | 0,15770 | 0,50338 |
| Gemma adaptado, calibrado | 0,15833 | 0,49507 |
| Gemma adaptado, crudo | 0,18742 | 0,77451 |
| LoRA con resultados barajados, calibrado | 0,25231 | 0,70700 |
| LoRA solo formato, calibrado | 0,26655 | 0,81282 |
| Gemma base, calibrado | 0,29587 | 0,96210 |
| Gemma base, crudo | 0,37522 | 2,98300 |

El autor señala que la comparación con Qwen3.5-9B no establece una diferencia significativa entre ambos modelos y que ambos quedan por detrás del prior de mercado. El model-index del repositorio no declara resultados adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base es de 1B parámetros, por lo que en bfloat16 requiere del orden de 2 GB solo para pesos, más overhead de activaciones y del adaptador.
- GPU recomendadas: no declaradas; la evaluación GPU se realizó en bfloat16 con SDPA sin especificar el modelo de GPU.
- GPU de consumo: un modelo de 1B parámetros es compatible con GPUs de consumo con suficiente VRAM; no se confirma un modelo concreto en la información.
- Despliegue: PEFT 0.17.1, Transformers 4.57.1, PyTorch 2.6.0, Accelerate 1.10.1 y SentencePiece 0.2.1; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Inferencia en CPU: soportada por el helper en float32, aunque no se usó para el resultado de paridad en GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Brier (test, calibrado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| forecastgemma-interp (adaptador) | LoRA sobre Gemma 3 1B | no disponible | 0,15833 | gemma | Hugging Face (adaptador PEFT) |
| Gemma 3 1B base | 1B | no disponible | 0,29587 | gemma | Hugging Face |
| Qwen3.5-9B (baseline congelado) | 9B | no disponible | 0,15770 | no disponible | usado solo como baseline de evaluación |
| Prior de mercado congelado | no aplica | no aplica | 0,10156 | no aplica | referencia del dataset |

La comparación se limita al mismo conjunto de 256 preguntas y al mismo protocolo de lectura de dos tokens; no se dispone de datos de contexto ni de otros benchmarks para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El prior de mercado congelado supera al adaptador en Brier y log score; el modelo no está pensado para sustituir pronósticos de mercado.
- El helper no realiza recuperación, verificación de hechos ni control de fechas; la calidad depende de que el usuario aporte información contemporánea y verificada.
- El ejemplo de la model card es ilustrativo y no constituye un pronóstico medido de un evento real.
- La comparación con Qwen3.5-9B no demuestra una diferencia significativa entre modelos.
- Los adaptadores de control y las eliminaciones de capa son intervenciones experimentales, no circuitos descubiertos ni etiquetas semánticas.
- El análisis posterior usó un conjunto de test ya abierto y no seleccionó ni reentrenó el checkpoint publicado.
- Idiomas soportados limitados al inglés.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia de Google para Gemma y a la aceptación de las condiciones de acceso del modelo base.
- No se declaran evaluaciones de sesgo, robustez ante entradas adversarias ni rendimiento fuera del dominio de pronóstico binario.
- Las preguntas relacionadas pueden permanecer correlacionadas aunque los IDs sean disjuntos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itsalissonsilva/forecastgemma-interp
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Dataset ForecastBench: https://github.com/forecastingresearch/forecastbench-datasets
