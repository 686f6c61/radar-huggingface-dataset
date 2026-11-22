# AngryYoungBhaloo/ect-savanna-runs

## Resumen

`ect-savanna-runs` es un conjunto de checkpoints de investigación publicados por el autor AngryYoungBhaloo como artefacto reproducible del artículo *Emergence of Consciousness Traits in a SLM*. No es un modelo de propósito general: agrupa los pesos de cinco ejecuciones independientes (denominadas *savanna runs*) de un pequeño modelo de lenguaje entrenado en tres etapas sucesivas (predicción, actuación y recompensa) sobre un entorno simulado de sabana descrito como un cuaderno de bitácora en inglés llano. Todos los checkpoints parten del modelo base `AngryYoungBhaloo/ect-base-100m`.

El artefacto contiene 23 ficheros `safetensors` en float32 (unos 401 millones de bytes cada uno, 9,2 GB en total) que corresponden a distintos números de actualizaciones dentro de cada etapa y semilla. La capa de salida comparte pesos con el embedding de entrada, por lo que solo se almacena el embedding. El modelo está pensado exclusivamente para pronosticar y actuar dentro de esa sabana simulada; no se documenta ningún uso fuera de ese contexto.

Su relevancia es metodológica: permite reproducir los resultados del artículo y auditar la evolución de los rasgos estudiados a lo largo de las tres etapas de entrenamiento. La información pública sobre arquitectura, contexto, datos de entrenamiento y benchmarks es muy limitada, y la mayoría de parámetros técnicos no están disponibles en la model card ni en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `ect-base-100m`; arquitectura no documentada en la informacion proporcionada) |
| Parametros totales | no disponible (el nombre del modelo base sugiere ~100M, no confirmado) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32; capa de salida compartida con el embedding de entrada, solo se almacena el embedding) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion disponible; el modelo deriva de `AngryYoungBhaloo/ect-base-100m`, del que no se documentan capas, dimensiones ni mecanismo de atención. El entrenamiento se organiza en tres etapas secuenciales sobre un entorno de sabana simulada descrito en inglés llano: etapa 1 (predicción, 4.000 actualizaciones), etapa 2 (actuación, 1.000 actualizaciones) y etapa 3 (recompensa, 1.500 actualizaciones). Cada etapa emplea AdamW con betas 0,9 y 0,95, weight decay 0,1, recorte de gradiente 1,0, tasa de aprendizaje 6e-5 tras 100 actualizaciones de calentamiento y después constante, lotes de 8 días simulados y precisión float32 en todo el proceso.

Se publican cinco ejecuciones (semillas 0 a 4, donde la ejecución *k* corresponde a la semilla *k*−1). Para las semillas 3 y 4 no se conservó el checkpoint de la etapa 1 tras 3.000 actualizaciones, por lo que esas dos ejecuciones solo incluyen `weights_4000` en la primera etapa. Los checkpoints de la etapa 1 tras 4.000 actualizaciones inician la etapa 2; el de la etapa 2 tras 1.000 actualizaciones inicia la etapa 3 y sirve como política de referencia; los de la etapa 3 tras 1.000 y 1.500 actualizaciones se usan para puntuaciones de test y para las mediciones posteriores al entrenamiento. No se documentan volumen de tokens, composición del dataset ni uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Pronóstico y actuación dentro de una sabana simulada descrita como cuaderno de bitácora en inglés llano.
- Generación de texto en inglés (único idioma declarado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso fuera del entorno simulado.
- No se documentan capacidades de visión, audio, código ni matemáticas.
- No se documenta modo *thinking* ni decodificación especulativa.
- El artefacto está orientado a reproducir experimentos de investigación, no a inferencia de propósito general.

## Casos de uso

- Reproducción de resultados del artículo: descargar los checkpoints de cada etapa y semilla con `python get_weights.py s3_seed0/weights_1500` y ejecutar los scripts de entrenamiento y test del repositorio para replicar las puntuaciones publicadas.
- Auditoría de la evolución entre etapas: comparar los pesos de la etapa 1 (predicción), etapa 2 (actuación) y etapa 3 (recompensa) para estudiar cómo cambian los rasgos medidos a lo largo del entrenamiento.
- Análisis de variabilidad entre semillas: las cinco ejecuciones permiten evaluar la estabilidad de los resultados y el efecto de la inicialización sobre las métricas finales.
- Estudio de dinámicas de recompensa: los checkpoints de la etapa 3 (1.000 y 1.500 actualizaciones) permiten analizar la política aprendida y su desviación respecto a la política de referencia de la etapa 2.
- Investigación sobre rasgos emergentes en modelos pequeños: el artefacto sirve como material de partida para replicar o refutar el estudio *Emergence of Consciousness Traits in a SLM* en un modelo de ~100M parámetros.
- Docencia y experimentación controlada: el entorno de sabana en inglés llano y los scripts asociados permiten montar prácticas reproducibles de entrenamiento por etapas sin depender de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que las puntuaciones de test promedian determinados checkpoints (etapa 1: 3.000 y 4.000; etapa 3: 1.000 y 1.500) y remite al artículo y a su apéndice D para la descripción del entorno y las etapas, sin cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Cada checkpoint pesa unos 401 MB en float32 (23 ficheros, 9,2 GB en total); un único checkpoint en float32 requiere del orden de 0,4 GB solo para pesos, más memoria para activaciones y estado del optimizador si se reentrena.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamaño del checkpoint, cualquier GPU consumer con suficiente VRAM para el modelo base debería poder cargarlo, aunque no se confirma.
- Cabe en GPU consumer: probablemente sí, dado el tamaño de cada checkpoint, pero no se documenta.
- Opciones de despliegue: el autor indica el flujo con `get_weights.py` y los scripts de entrenamiento y test del repositorio `savanna/`, que leen ficheros `.pt` junto con `base_weights.pt` y `tokenizer.json`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoría (artefactos de investigación sobre rasgos emergentes en modelos pequeños) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación: solo pronostica y actúa en una sabana simulada; no está validado para uso general ni para producción.
- Idiomas: únicamente inglés declarado; no se documenta cobertura multilingüe.
- Contexto: longitud de contexto no disponible, lo que impide planificar aplicaciones con ventanas largas.
- Arquitectura y datos de entrenamiento no documentados en la información proporcionada, lo que limita la evaluación independiente.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de ~100M sin benchmarks publicados, la fiabilidad fuera del entorno simulado es desconocida.
- Sesgos: no documentados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; al ser un artefacto de investigación, conviene revisar el artículo y el repositorio antes de cualquier uso derivado.
- Reproducibilidad parcial: faltan los checkpoints de la etapa 1 tras 3.000 actualizaciones en las semillas 3 y 4, por lo que esas ejecuciones no son completamente replicables en esa etapa.
- Fecha de creación futura en los metadatos (2026-11-22): conviene verificar la vigencia y el estado del repositorio antes de depender de él.

## Enlaces

- Hugging Face: https://huggingface.co/AngryYoungBhaloo/ect-savanna-runs
- Modelo base: https://huggingface.co/AngryYoungBhaloo/ect-base-100m
- Repositorio de código: https://github.com/gut-puncture/emergence-of-consciousness-traits (carpeta `savanna/`)
- Artículo: *Emergence of Consciousness Traits in a SLM* (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
