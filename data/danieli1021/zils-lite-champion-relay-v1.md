# Danieli1021/zils-lite-champion-relay-v1

## Resumen

Zils lite champion relay v1 es un modelo de decisión experimental publicado por el usuario Danieli1021 en Hugging Face. No se trata de un modelo generativo de propósito general, sino de un cuerpo de pesos (body) en BF16 destinado a la competición de mineros de la subred Zils, concretamente al pool `d3-lite`. Deriva del modelo `qhoenix/zils-lite-decision-v9` y se construye sobre el chasis fijado `d3-lite-0.8b-v1`, cuyo componente base es Qwen/Qwen3.5-0.8B.

El modelo resuelve una tarea muy específica: predecir decisiones probabilísticas evaluadas mediante las fórmulas de skill Brier/RPS del validador de la subred. Con 852.985.920 parámetros (aproximadamente 0,85 mil millones), se entrenó mediante destilación desde un profesor (`d3-ultra`) combinada con la distribución original de las fuentes, y no está pensado para usarse como modelo de texto autónomo: el autor indica explícitamente que requiere el chasis y el runtime del pool para ejecutarse.

Su relevancia es acotada pero interesante como caso de estudio: documenta con inusual detalle el proceso de entrenamiento (LoRA fusionado, hiperparámetros, composición del dataset) y publica una evaluación proxy honesta que incluye intervalos de confianza y regresiones. Es un artefacto de investigación de una competición descentralizada, no un modelo listo para producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (chasis d3-lite-0.8b-v1, basado en Qwen/Qwen3.5-0.8B); incluye torre de visión según el chasis |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cuerpo de pesos para el chasis `d3-lite-0.8b-v1`, que integra runtime, tokenizador, capa de respuesta y torre de visión fijados por el pool. La base es Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros. El autor aclara que la capa de respuesta permaneció fija durante el entrenamiento y que este repositorio solo aporta los pesos del cuerpo, no un modelo autónomo.

El entrenamiento se realizó en una única RTX 3090 con LoRA fusionado de rango 64, alpha 128, dropout 0 y tasa de aprendizaje 5e-5, usando AdamW sin decaimiento de peso, acumulación de gradiente 16 y semilla 17, sobre 13.000 filas de entrenamiento y 813 pasos de optimizador, con decaimiento lineal y warmup del entrenador oficial. Los datos combinan 9.000 filas nuevas reconstruidas de los splits TRAIN públicos de Zils Relay / tasksource, con objetivos probabilísticos mezclando un 80% de salida del profesor `d3-ultra` y un 20% de la distribución original, más 4.000 filas previas reutilizadas para retención, decisiones sintéticas verificadas y predicción de resultados públicos. Se excluyeron filas de evaluación previas y grupos/prompts coincidentes, y se usó un conjunto amplio disjunto por grupos para selección y confirmación. No se emplearon datos privados del examen del validador.

## Capacidades

- Predicción de decisiones probabilísticas para el pool `d3-lite` de la subred Zils, evaluadas con las fórmulas de skill Brier/RPS del validador.
- Destilación de un profesor (`d3-ultra`) para aproximar su distribución de salida sobre tareas del pool.
- Retención de comportamiento sobre datos previos de entrenamiento y predicción de resultados públicos.
- Ejecución sobre el chasis `d3-lite-0.8b-v1`, que incluye runtime, tokenizador y torre de visión (capacidades de visión heredadas del chasis, no documentadas en detalle).
- No soporta de forma documentada tool calling, function calling, agentes ni razonamiento multi-paso genérico.
- Capacidades multilingües: no disponibles.
- No es un modelo de generación de texto de propósito general; el autor lo indica explícitamente.

## Casos de uso

- Participación en la competición de mineros de la subred Zils: el modelo se carga con el chasis fijado del pool `d3-lite` y se evalúa con la fórmula de skill del validador para optar a una plaza, aunque el propio autor advierte que la evaluación local no garantiza una plaza pagada.
- Investigación sobre destilación de profesores en tareas de decisión: el repositorio documenta con precisión la mezcla 80/20 entre salida del profesor y distribución original, lo que permite reproducir y analizar el efecto de esa proporción.
- Estudio de evaluación honesta en competiciones descentralizadas: los ficheros `evaluation.json` y `training.json` sirven como ejemplo de reporte con intervalos bootstrap pareados, calibración por temperatura y confirmación en conjuntos disjuntos.
- Análisis de linaje de modelos ("soup" de pesos): el modelo documenta su ascendencia (thermopylae-777/zils-lite-body-2, dasLOL/zils-lite-skills-v5, vllm-sr/d3-lite, Qwen/Qwen3.5-0.8B), útil para estudiar cómo se componen pesos en competiciones.
- Base para fine-tuning experimental en una sola GPU de consumo: con 0,85 mil millones de parámetros y LoRA de rango 64, el flujo de entrenamiento cabe en una RTX 3090, lo que lo hace accesible para experimentación académica.
- Referencia para auditoría de licencias en modelos derivados: conserva los avisos upstream en `upstream/`, `LICENSE` y `NOTICE`, lo que facilita verificar el cumplimiento de Apache-2.0 en cadenas de derivación.

## Benchmarks y rendimiento

El autor publica una evaluación proxy local con la fórmula de skill Brier/RPS del validador, calibración por temperatura separada al 20% y renormalización de pesos por celda. Los resultados comparan el campeón de partida con el candidato enviado:

| Proxy | Ítems puntuables | Campeón de partida | Candidato enviado | Diferencia |
|---|---:|---:|---:|---:|
| seeds | 694 | 55.231 | 54.741 | -0.491 |
| public-eval | 264 | 0.301 | 13.630 | +13.330 |
| primary | 958 | 45.779 | 47.008 | +1.229 |
| broad-dev | 1450 | 53.213 | 55.962 | +2.750 |
| outcomes | 1257 | 51.025 | 57.222 | +6.197 |
| synthetic-eval | 600 | 52.899 | 97.120 | +44.221 |
| broad-confirm | 1448 | 51.282 | 54.333 | +3.052 |

El autor advierte que estas puntuaciones son proxies locales y no comparables directamente con el marcador nocturno del board. El candidato nativo regresó 0,49 puntos en el proxy de solo semillas, con pequeñas regresiones en las cinco particiones de calibración. La ganancia en primary fue de 1,23 puntos con un intervalo condicional del 95% de -0,37 a +3,14, que incluye el cero y solo supera por poco el umbral de 1,2 puntos de la política. El conjunto sintético comparte generador con parte del entrenamiento, por lo que mide transferencia solo dentro de ese generador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 852.985.920 parámetros en BF16 los pesos ocupan aproximadamente 1,7 GB, a los que hay que sumar el runtime, tokenizador y torre de visión del chasis.
- GPU de entrenamiento documentada: una RTX 3090 (24 GB), suficiente para el flujo LoRA descrito.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU con al menos 24 GB debería poder alojar los pesos en BF16 junto con el chasis, aunque no se documenta.
- Cabe en GPU de consumo: probablemente sí en RTX 3090, RTX 4090 y similares, dado el tamaño de los pesos, pero no está verificado en la información disponible.
- Opciones de despliegue: no disponibles; el autor indica que debe usarse el runtime y chasis fijados por el pool `d3-lite`, no vLLM, llama.cpp, Ollama o TGI de forma genérica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| Zils lite champion relay v1 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Cuerpo de pesos para chasis d3-lite; no autónomo |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | no disponible | Hugging Face | Modelo de partida del que deriva |
| Qwen/Qwen3.5-0.8B | no disponible | no disponible | no disponible | Hugging Face | Base del chasis d3-lite-0.8b-v1 |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento objetiva.

## Limitaciones y advertencias

- No es un modelo de generación de texto de propósito general; requiere el chasis y runtime fijados por el pool `d3-lite` para ejecutarse.
- La evaluación publicada es un proxy local y no equivale al examen privado del validador; el autor lo advierte explícitamente.
- El candidato nativo regresó 0,49 puntos en el proxy de solo semillas y mostró pequeñas regresiones en las cinco particiones de calibración.
- La ganancia en primary (1,23 puntos) tiene un intervalo de confianza del 95% que incluye el cero (-0,37 a +3,14) y solo supera por poco el umbral de 1,2 puntos de la política.
- El conjunto sintético comparte generador con parte del entrenamiento, por lo que su mejora (+44,221) mide transferencia solo dentro de ese generador y no es extrapolable.
- La confirmación broad proviene de grupos de fuentes retenidos dentro de los splits TRAIN originales, no de un benchmark oficial independiente.
- Se desconoce la exposición previa del campeón upstream a fuentes públicas, y el proceso de entrenamiento upstream no fue reconstruido de forma independiente.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero se deben conservar los avisos upstream en `upstream/`, `LICENSE` y `NOTICE`; el texto de las fuentes públicas conserva sus licencias originales y no se redistribuye.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por la comunidad.
- No se documentan idiomas soportados ni longitud de contexto, lo que impide evaluar su idoneidad para tareas multilingües o de contexto largo.

## Enlaces

- Hugging Face: https://huggingface.co/Danieli1021/zils-lite-champion-relay-v1
- Modelo de partida: https://huggingface.co/qhoenix/zils-lite-decision-v9/tree/083d5b9aa3d2db48155cd6e7f92ac6f9aa057c65
- Modelo base del chasis: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de referencia del chasis: vllm-sr/d3-lite (mencionado en la model card, sin URL directa disponible)
- Linaje adicional: thermopylae-777/zils-lite-body-2, dasLOL/zils-lite-skills-v5 (mencionados, sin URL directa disponible)
- Ficheros de evaluación y entrenamiento: `evaluation.json` y `training.json` en el repositorio de Hugging Face
