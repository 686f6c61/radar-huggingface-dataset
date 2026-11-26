# ansarbuilds/Sirius-Small-Video-ONNX

## Resumen

Sirius-Small-Video-ONNX es un clasificador de texto basado en arquitectura BERT de 33 millones de parámetros, desarrollado por ansarbuilds. Se trata de un cross-encoder especializado que actúa como "juez" de vídeos de YouTube dentro de la aplicación Sirius, una app de macOS orientada a la concentración y la prevención del "focus drift" (desviación de la atención). El modelo recibe como entrada un objetivo declarado por el usuario y una ventana de actividad del navegador, y devuelve una de tres etiquetas: `ON_TASK`, `BORDERLINE` o `RABBIT_HOLE`.

El problema concreto que resuelve es un fallo de su predecesor, Sirius-Small: aquel modelo aprendió que un vídeo útil tiende a repetir las palabras del objetivo, de modo que marcaba como distracción 58 de 64 vídeos realmente útiles (un 90,6 % de falsos positivos). Este modelo se reentrenó específicamente para que los vídeos de YouTube pertinentes dejen de ser señalados, y la propia app lo combina con Sirius-Small: este juzga todas las ventanas excepto `youtube.com`, y Sirius-Small-Video juzga únicamente `youtube.com`.

La relevancia práctica es su extrema ligereza: 32,49 MB en formato ONNX int8, con una latencia en CPU de 5,0 ms de mediana y 8,8 ms en el percentil 95 sobre un Mac con chip M4. Está pensado para inferencia local en el dispositivo, sin llamadas a servicios en la nube, con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (encoder), cross-encoder para clasificación de pares (objetivo + ventana) |
| Parametros totales | 33 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; el ejemplo de uso trunca a `max_length=160` tokens |
| Tipos de cuantizacion | int8 (pesos ONNX cuantizados); el modelo base Sirius-Small-ONNX se distribuye también en ONNX |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model_quantized.onnx`), con tokenizer de Hugging Face Transformers |

## Arquitectura y entrenamiento

Se trata de un encoder BERT de 33 millones de parámetros configurado como cross-encoder: el objetivo del usuario y la ventana de actividad se concatenan con el separador `[SEP]` en una única secuencia (por ejemplo, `"File my 2026 taxes [SEP] NOW: Chrome | How to fill out Form 1040 | youtube.com"`) y el modelo produce logits sobre tres clases. La cabeza de clasificación devuelve `0` para `ON_TASK`, `1` para `BORDERLINE` y `2` para `RABBIT_HOLE`, con un umbral de decisión de 0,81 para marcar la tercera clase.

El entrenamiento parte de Sirius-Small y se ejecutó durante 2 épocas en local sobre un Mac con chip M4, con coste cero, usando el script `train_helpful.py` sobre 24.000 ejemplos generados por `helpful_videos.py`. La innovación metodológica es la regla de entrenamiento: las filas de vídeos útiles llevan la respuesta correcta, mientras que el resto de filas copia la respuesta antigua de Sirius-Small, de modo que el modelo solo puede cambiar de opinión sobre páginas de vídeo. Un primer intento sin esa regla marcó el 44,5 % de ventanas reales en tarea y fue descartado. No se usaron registros reales de ventanas ni historial de navegación para entrenar, ni salidas de modelos propietarios (OpenAI, Anthropic, Google/Gemma). No se documenta uso de RLHF ni DPO.

## Capacidades

- Clasificación de texto en tres clases (`ON_TASK`, `BORDERLINE`, `RABBIT_HOLE`) para pares objetivo-actividad.
- Juicio especializado de ventanas de `youtube.com`, diferenciando vídeos útiles de contenidos de distracción.
- Inferencia local en CPU con ONNX Runtime, sin dependencia de GPU ni de servicios externos.
- Concordancia entre la versión PyTorch y la int8 ONNX del 93,75 % en la respuesta principal (64 muestras).
- Umbral de decisión configurable para la clase `RABBIT_HOLE` (0,81 en la configuración publicada).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking": es un clasificador discriminativo, no un modelo generativo.
- Capacidades multilingües: no disponibles según la información publicada.

## Casos de uso

- Filtrado de distracciones en la app Sirius: el modelo juzga cada ventana de actividad de `youtube.com` y devuelve una etiqueta que la app usa para avisar al usuario, aprovechando su latencia de 5 ms en CPU para decidir en tiempo real sin interrumpir la navegación.
- Detección de "rabbit holes" en sesiones de estudio: con el objetivo "Study and take course notes", un vídeo "Lecture 4 - Linear Algebra" se clasifica como `ON_TASK`, mientras que contenidos de entretenimiento se marcan como `RABBIT_HOLE`, lo que permite bloquear o despriorizar estos últimos.
- Reducción de falsos positivos en tareas administrativas: para el objetivo "File my 2026 taxes", un vídeo "How to fill out Form 1040" se clasifica correctamente como `ON_TASK` en lugar de ser bloqueado, algo que el modelo predecesor no lograba (90,6 % de falsos positivos).
- Herramienta de atención en escritorio: integrada en un cliente de macOS, el modelo permite construir funciones de "check-in" periódico con una tasa de falsas alertas de 0,00 por cada 2 horas en la reproducción de prueba, lo que evita interrumpir al usuario.
- Componente de un pipeline híbrido de dos modelos: combinado con Sirius-Small, permite enrutar por dominio (YouTube frente al resto de ventanas) y mantener la precisión global de la app (73,3 % en ventanas reales frente al 73,8 % del modelo único).
- Prototipado y experimentación de clasificación de intenciones: al ser un ONNX int8 de 32,49 MB con licencia MIT, sirve como base para experimentos de clasificación de relevancia objetivo-contexto en entornos con recursos limitados, como portátiles o dispositivos de borde.
- Investigación sobre desviación de la atención: el conjunto de etiquetas y el esquema de anotación (objetivo, ventana, etiqueta) pueden reutilizarse para construir conjuntos de datos de evaluación de "focus drift" en navegación web.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en el motor propio de la app Sirius:

| Metrica | Solo Sirius-Small | Solo este modelo | Ambos (la app) |
|---|---:|---:|---:|
| Videos utiles marcados por error (64) | 90,6 % | 14,1 % | 14,1 % |
| Videos distractores detectados (62) | 100 % | 95,2 % | 95,2 % |
| Precision en benchmark (364 casos) | 99,3 % | 100 % | 100 % |
| Recall en benchmark | 86,5 % | 85,3 % | 84,6 % |
| Precision en ventanas reales (300 casos) | 73,8 % | 64,9 % | 73,3 % |
| Recall en ventanas reales | 45,5 % | 37,4 % | 44,4 % |
| Ventanas reales en tarea marcadas por error | 5,5 % | 8,2 % | 5,5 % |
| Falsos check-ins por 2 horas (replay) | 0,00 | 1,05 | 0,00 |

Datos adicionales de rendimiento: concordancia entre la respuesta principal de PyTorch y la int8 ONNX del 93,75 % (64 muestras); latencia en CPU sobre Mac M4 de 5,0 ms p50 y 8,8 ms p95; tamaño de 32,49 MB en int8 ONNX.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; el modelo está diseñado para ejecutarse en CPU. En GPU, el peso int8 de 32,49 MB ocupa menos de 1 GB de memoria, incluidos los buffers de activación.
- GPU recomendadas: no se requieren. Cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 4090, A100, H100) puede ejecutarlo, pero el modelo no aprovecha esa capacidad.
- Cabe en cualquier GPU de consumo y en CPU de portátiles y equipos de sobremesa; el autor reporta 5,0 ms p50 en un Apple M4.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, JavaScript), con tokenizer de Hugging Face Transformers. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: 5,0 ms p50 y 8,8 ms p95 en CPU M4 para una única inferencia; el throughput no se publica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Sirius-Small-Video-ONNX | 33 M | no disponible (truncado a 160 tokens en el ejemplo) | Clasificación de relevancia en YouTube | MIT | ONNX int8 |
| Sirius-Small-ONNX (modelo base) | 33 M | no disponible | Clasificación de relevancia en ventanas generales | MIT | ONNX |
| Cross-encoders BERT genéricos (por ejemplo, MiniLM) | 22-33 M | 512 tokens típicamente | Clasificación de pares y ranking | MIT o Apache 2.0 según variante | safetensors, ONNX |
| Clasificadores de intención basados en LLM (prompting) | miles de millones | variable | Clasificación zero-shot | según modelo | safetensors, GGUF |

La comparación directa con alternativas genéricas no está disponible en la información publicada: el autor solo compara este modelo con su predecesor Sirius-Small dentro del mismo motor de la app.

## Limitaciones y advertencias

- El conjunto de prueba de vídeos está escrito a mano; ninguna de las 20 ventanas reales de YouTube registradas fue etiquetada como "en tarea", por lo que el comportamiento con vídeos útiles reales no está demostrado en uso real.
- 22 de las 126 filas de prueba usan un objetivo genérico que también aparece en el entrenamiento con otros títulos; sin esas filas, se marcan por error 9 de 53 vídeos útiles.
- Las ventanas reales provienen de una sola persona durante 1,9 horas y se usaron para elegir entre configuraciones; deben tratarse como orientativas, no como prueba.
- No debe usarse este modelo solo sobre ventanas que no sean de YouTube: su rendimiento allí es peor (precisión del 64,9 % frente al 73,8 % de Sirius-Small en ventanas reales).
- El recall en ventanas reales es bajo (44,4 % en la configuración de la app), de modo que se escapan distracciones reales.
- Riesgo de sesgo: el modelo se entrenó con ejemplos generados y datos de una sola persona; puede generalizar mal a otros estilos de objetivos, idiomas o patrones de navegación.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea en dominios no cubiertos por el entrenamiento.
- Idiomas soportados no declarados; no hay garantía de funcionamiento fuera del inglés.
- Licencia MIT: permite uso comercial y modificación, pero el modelo se distribuye sin garantías y sin datos de entrenamiento publicados.
- En producción, conviene desplegarlo junto a Sirius-Small y enrutar por dominio, tal como hace la app, y monitorizar la tasa de falsos positivos sobre ventanas reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ansarbuilds/Sirius-Small-Video-ONNX
- Modelo base: https://huggingface.co/ansarbuilds/Sirius-Small-ONNX
- Repositorio de código: https://github.com/ansarbuilds/sirius
