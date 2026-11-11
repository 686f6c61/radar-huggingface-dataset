# Alvin16/SpaceSense-Omni

## Resumen

SpaceSense-Omni es un modelo multimodal de percepción para satélites espaciales desarrollado por el usuario Alvin16, inicializado a partir de EPFL-VILAB/4M-21_B. Resuelve una tarea de fusión sensorial RGB + LiDAR: a partir de una imagen y, opcionalmente, una nube de puntos LiDAR y la matriz intrínseca de la cámara, produce segmentación semántica por píxel, detección de objetos, segmentación sobre los puntos LiDAR originales, distancia métrica por rayo y pose relativa. El modelo tiene 98.723.429 parámetros y se distribuye en safetensors FP32 con un tamaño de repositorio de 0,4 GB.

La relevancia del modelo es acotada y experimental: se trata de una adaptación de un backbone de propósito general (4M-21-B) a un dominio muy específico (percepción de satélites en imágenes sintéticas), con un checkpoint fijo seleccionado por una puntuación de validación de cinco tareas con pesos iguales (época 4, paso 6472). No combina pesos específicos por tarea. La model card advierte explícitamente de que la generalización a imágenes reales arbitrarias es limitada, ya que el entrenamiento usó datos sintéticos, geometría de cámara asumida y `lidar_dropout=0`.

El modelo está orientado a la investigación y a la demostración de pipelines de fusión RGB/LiDAR en el dominio espacial, no a producción. Su licencia heredada (Sample Code License) restringe el uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptación de 4M-21-B (transformer multimodal) con cabezas de tarea específicas para segmentación, detección FCOS, profundidad métrica y pose |
| Parametros totales | 98.723.429 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de percepción por imagen; entrada fija de 1024 x 1024 píxeles) |
| Tipos de cuantizacion | No disponible (se distribuye en FP32 safetensors; inferencia en GPU con autocast BF16) |
| Idiomas soportados | en, zh |
| Licencia | Sample Code License (other); uso no comercial |
| Formato de pesos | safetensors (FP32), con configuraciones asociadas |

## Arquitectura y entrenamiento

El modelo parte del backbone 4M-21-B de EPFL-VILAB, un transformer multimodal entrenado para manejar múltiples modalidades y tareas. Sobre esa base, esta release añade cabezas de tarea específicas para el dominio espacial: segmentación por píxel de ocho clases (fondo más siete partes), detección FCOS de siete clases, segmentación de siete clases sobre los puntos LiDAR originales, distancia métrica por rayo y pose relativa. El checkpoint publicado es el "fixed 1024 adaptation best checkpoint" (época 4, paso 6472), seleccionado por una puntuación de validación de cinco tareas con pesos iguales; no se combinan pesos por tarea.

Los detalles de entrenamiento son escasos en la información disponible. La model card indica que se usaron datos sintéticos de satélites espaciales, con geometría de cámara asumida y `lidar_dropout=0` durante el entrenamiento. El conjunto de identificación (ID) contiene 117 satélites de entrenamiento; el conjunto fuera de distribución (OOD) contiene 5 satélites de validación usados para la selección y 14 satélites de test. No se especifican el número de tokens, la composición exacta del dataset ni si hubo RLHF/DPO (no aplicable en un modelo de percepción). La calibración LiDAR se aplica exactamente una vez: sensor FRD (x, y, z) -> óptico (y, z, x+0,9), y la configuración calibrada es específica de los ejemplos suministrados.

## Capacidades

- Segmentación semántica por píxel de ocho clases (fondo más siete partes) en modo RGB + LiDAR.
- Detección de objetos FCOS de siete clases (clases 0..6).
- Segmentación de siete clases sobre los puntos LiDAR originales (etiqueta de punto 0 = desconocido).
- Estimación de distancia métrica por rayo (profundidad métrica).
- Estimación de pose relativa.
- En modo solo RGB devuelve las cuatro tareas de imagen/pose y marca la segmentación de puntos como no disponible.
- Entrada de imagen redimensionada a 1024 x 1024; las salidas de píxel se reescalan a las dimensiones originales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: etiquetas en, zh, pero el modelo es de percepción visual, no de generación de texto.
- Capacidades especiales: fusión multimodal RGB + LiDAR con nube de puntos en marco de sensor FRD (metros) y matriz intrínseca K.

## Casos de uso

- Inspección de satélites en imágenes sintéticas: el modelo segmenta partes del satélite (siete partes más fondo) sobre imágenes de 1024 x 1024, útil para prototipos de análisis estructural en entornos simulados.
- Detección de componentes en pipelines de visión espacial: con la cabeza FCOS de siete clases se pueden localizar componentes en imágenes de satélites de demostración, siempre que la geometría de cámara coincida con la asumida en entrenamiento.
- Fusión RGB + LiDAR en investigación: dado un par imagen + nube de puntos (N x 3 en FRD, metros) y la K de la cámara, el modelo produce profundidad métrica y pose relativa, lo que permite estudiar estrategias de fusión sensorial en robótica espacial.
- Estimación de profundidad métrica en escenarios controlados: en el subconjunto de demostración de 70 fotogramas de satélites de test, la profundidad métrica alcanza AbsRel de 0,056 con LiDAR, lo que lo hace adecuado para validar algoritmos de percepción en condiciones de laboratorio.
- Evaluación comparativa de modalidades: el modelo permite comparar RGB solo frente a RGB + LiDAR de forma pareada (680 fotogramas de demostración predeterminados), útil para estudios de ablación sobre la contribución del LiDAR.
- Docencia y demostración de pipelines multimodales: el repositorio incluye interfaz de inferencia (`spacesense.hf_runtime.Predictor`) y demo, lo que facilita su uso en cursos o talleres sobre percepción multimodal.
- Prototipado de segmentación de puntos LiDAR: la cabeza de segmentación sobre puntos originales permite experimentar con etiquetado de nubes de puntos en el dominio espacial, con la advertencia de que la verdad de referencia se genera por proyección 2D/profundidad, no por etiquetas 3D manuales independientes.

## Benchmarks y rendimiento

La model card reporta resultados pareados RGB/fusión sobre 680 fotogramas de demostración predeterminados, que no son resultados del conjunto de test completo. Los datos disponibles en la información proporcionada son:

| Metrica | RGB + LiDAR | Solo RGB |
|---|---|---|
| Error mediano de traslación (subconjunto de 70 fotogramas de test) | ~0,21 m | 29,00 m |
| AbsRel de profundidad métrica (subconjunto de 70 fotogramas de test) | 0,056 | 2,53 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, lo cual es esperable al tratarse de un modelo de percepción y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 98,7 M de parámetros en FP32 (aproximadamente 0,4 GB de pesos) y autocast BF16 en GPU, la huella de pesos es reducida, pero el procesamiento de imágenes de 1024 x 1024 y las cabezas de tarea añaden memoria de activaciones no cuantificada en la información disponible.
- GPU recomendadas: no disponibles en la información proporcionada; la model card menciona `device='cuda'` y autocast BF16, sin especificar modelos concretos (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por el tamaño de pesos (0,4 GB) es plausible, pero no hay dato oficial.
- Opciones de despliegue: la release proporciona su propia interfaz de inferencia (`spacesense.hf_runtime.Predictor`) con requisitos de Python propios ("Space requirements") y `vendor` en PYTHONPATH; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpaceSense-Omni | 98,7 M | Imagen 1024 x 1024 + LiDAR opcional | Segmentación, detección FCOS, profundidad métrica, pose | Sample Code License (no comercial) | Hugging Face (0 descargas, 0 likes) |
| EPFL-VILAB/4M-21_B (modelo base) | No disponible en la información | Multimodal 4M-21 | Multimodal general | No disponible en la información | Hugging Face |
| Alternativas de percepción RGB/LiDAR para espacio | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (percepción de satélites con fusión RGB/LiDAR) en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenamiento con datos sintéticos de satélites y geometría de cámara asumida: la generalización a imágenes reales arbitrarias es limitada.
- `lidar_dropout=0` durante el entrenamiento: el modelo no fue entrenado para robustez ante ausencia de LiDAR, y en modo solo RGB la profundidad y la traslación no son mediciones métricas fiables (error mediano de traslación de 29,00 m y AbsRel de 2,53 frente a 0,21 m y 0,056 con LiDAR en el subconjunto de 70 fotogramas).
- La profundidad absoluta y la traslación no deben interpretarse como mediciones calibradas de imágenes arbitrarias.
- La traslación lateral en entrenamiento fue cero, lo que limita la estimación de pose en escenarios con desplazamiento lateral.
- El reconocimiento de partes pequeñas puede fallar.
- La verdad de referencia de los puntos se genera por proyección 2D/profundidad, no por etiquetas 3D manuales independientes.
- La calibración LiDAR es específica de los ejemplos suministrados; la configuración calibrada no es universal.
- Los resultados de evaluación corresponden a 680 fotogramas de demostración predeterminados y no al conjunto de test completo; el conjunto OOD incluye 5 satélites de validación usados para selección y 14 de test.
- Licencia Sample Code License heredada del upstream: permite uso no comercial; el código Python upstream tiene licencia Apache-2.0 con avisos de componentes en `vendor/`. Verificar términos antes de cualquier uso comercial.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí en el sentido de predicciones visuales no calibradas fuera de la distribución de entrenamiento.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alvin16/SpaceSense-Omni
- Modelo base: https://huggingface.co/EPFL-VILAB/4M-21_B
- Proyecto 4M/4M-21: https://4m.epfl.ch/
- Referencias citadas en la model card: Mizrahi et al. y Bachmann et al. (4M/4M-21)
- Repositorio: incluye `release.json` (checksum, arquitectura y calibración), `EVALUATION.md` (resultados pareados completos), `LICENSE` y `vendor/` con avisos de componentes.
