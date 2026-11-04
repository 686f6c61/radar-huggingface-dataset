# LibreYOLO/LibreUniMatchl-flow-kitti

## Resumen

LibreUniMatchl-flow-kitti es un checkpoint de estimación de flujo óptico empaquetado para la librería LibreYOLO. Se trata de un ajuste fino (finetune) sobre el conjunto de datos KITTI 2015 del modelo UniMatch, en su variante GMFlow+ con escala 2 y 6 pasos de refinamiento por regresión local. El modelo original procede del repositorio autonomousvision/unimatch y fue desarrollado por el grupo de investigación de Andreas Geiger en el Instituto de Sistemas Inteligentes de la Universidad de Tubinga y el MPI de Sistemas Inteligentes.

El modelo resuelve la tarea de estimación de flujo óptico denso entre dos fotogramas consecutivos, devolviendo un campo de desplazamiento (dx, dy) en píxeles sobre el lienzo original de la imagen. Es relevante para pipelines de visión por computador que ya utilizan LibreYOLO, ya que permite integrar estimación de movimiento bajo la misma interfaz unificada de la librería, con la tarea `flow`, sin necesidad de gestionar dependencias separadas.

El checkpoint no introduce cambios en los pesos aprendidos: únicamente envuelve los tensores originales de UniMatch en el esquema de checkpoint de LibreYOLO. El tamaño del repositorio es de 0.0 GB y no se han publicado resultados de benchmarks ni especificaciones detalladas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GMFlow+ con escala 2 y 6 pasos de refinamiento por regresión local (UniMatch) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | checkpoint `.pt` de LibreYOLO (tensores PyTorch) |

## Arquitectura y entrenamiento

La arquitectura subyacente es GMFlow+ en configuración scale2 con 6 pasos de refinamiento por regresión local, integrada en el marco UniMatch. UniMatch unifica las tareas de flujo óptico, estéreo y estimación de profundidad bajo una misma formulación, y el paper de referencia es "Unifying Flow, Stereo and Depth Estimation" (IEEE TPAMI 2023). El checkpoint concreto deriva del commit `943a99006950ab6c84ea72a72beb147fdd03c19a` del repositorio autonomousvision/unimatch, correspondiente al fichero `gmflow-scale2-regrefine6-kitti15-25b554d7.pth` del MODEL_ZOO oficial.

El entrenamiento del checkpoint original consistió en un ajuste fino sobre KITTI 2015 a partir de los pesos preentrenados de UniMatch. No se dispone en la información proporcionada de detalles sobre el número de iteraciones, la composición exacta del dataset de entrenamiento, ni si se aplicaron técnicas de regularización específicas. El empaquetado para LibreYOLO es únicamente un envoltorio de metadatos: los tensores aprendidos se almacenan sin modificar dentro del esquema de checkpoint de la librería, con la tarea `flow`. El script de conversión se encuentra en `weights/convert_unimatch_weights.py` del repositorio de LibreYOLO.

## Capacidades

- Estimación de flujo óptico denso entre dos imágenes: devuelve un tensor `(H, W, 2)` en `float32` con los desplazamientos `(dx, dy)` en píxeles sobre el lienzo original.
- Visualización del flujo mediante rueda de color Middlebury a través del método `to_rgb()`.
- Integración nativa con la interfaz `LibreYOLO` y la tarea `flow`, permitiendo cargar el modelo con una sola llamada.
- Procesamiento por lotes: la API acepta listas de pares de imágenes y devuelve una lista de resultados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión semántica, audio ni otras capacidades generativas.

## Casos de uso

- Estimación de movimiento en secuencias de vídeo: el modelo calcula el flujo óptico entre fotogramas consecutivos, adecuado para tareas de seguimiento y análisis de movimiento en escenas de conducción gracias al ajuste fino sobre KITTI 2015.
- Odometría visual y SLAM: el campo de flujo denso sirve como entrada para estimar el movimiento de la cámara entre fotogramas, integrándose en pipelines de localización y mapeo.
- Detección de objetos en movimiento: combinado con los modelos de detección de LibreYOLO, el flujo permite segmentar regiones con movimiento independiente del fondo.
- Estabilización de vídeo: el flujo entre fotogramas permite estimar y compensar el movimiento global de la cámara para producir vídeo estabilizado.
- Interpolación de fotogramas: el campo de desplazamiento bidireccional puede alimentar algoritmos de interpolación temporal para aumentar la tasa de fotogramas.
- Análisis de escenas de tráfico: el ajuste específico sobre KITTI 2015 lo hace adecuado para vehículos, peatones y otros actores viales en entornos urbanos y de carretera.
- Preprocesamiento en pipelines de percepción: al compartir la interfaz de LibreYOLO, puede encadenarse con detectores y otros modelos de la misma librería sin gestión adicional de dependencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; al tratarse de un modelo de visión de tamaño moderado es probable que quepa en GPU de consumo, pero no se confirma en la información disponible.
- Opciones de despliegue: la única vía documentada es la librería LibreYOLO mediante `LibreYOLO("LibreUniMatchl-flow-kitti.pt")`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de flujo óptico.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreUniMatchl-flow-kitti | Flujo óptico | GMFlow+ scale2, 6 refinamientos | no aplica | MIT | HuggingFace (LibreYOLO) |
| UniMatch (original) | Flujo óptico, estéreo, profundidad | UniMatch | no aplica | MIT (código) | GitHub autonomousvision |
| GMFlow | Flujo óptico | GMFlow | no aplica | no disponible | GitHub |
| RAFT | Flujo óptico | RAFT | no aplica | no disponible | GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint es un envoltorio de metadatos: no se ha reentrenado ni modificado ningún peso respecto al original de UniMatch.
- La licencia MIT de los pesos es una interpretación declarada por LibreYOLO, no confirmada por el publicador original. El repositorio upstream no publica una licencia específica para los checkpoints, por lo que el uso comercial de los pesos debe verificarse con cautela.
- El ajuste fino está orientado a KITTI 2015, por lo que el rendimiento fuera de escenas de conducción urbana y de carretera puede degradarse.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre un dataset específico de conducción, puede presentar un rendimiento desigual en otros dominios visuales.
- No se dispone de información sobre el tamaño del modelo, los requisitos de memoria ni la latencia, lo que dificulta la planificación de despliegues en producción.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar efectivamente alojados o que el repositorio está incompleto; conviene verificar la integridad antes de usarlo.
- No es un modelo de lenguaje: no soporta generación de texto, código, matemáticas ni razonamiento.

## Enlaces

- HuggingFace: https://huggingface.co/LibreYOLO/LibreUniMatchl-flow-kitti
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Repositorio UniMatch: https://github.com/autonomousvision/unimatch
- Checkpoint original: https://s3.eu-central-1.amazonaws.com/avg-projects/unimatch/pretrained/gmflow-scale2-regrefine6-kitti15-25b554d7.pth
- Paper: Xu, Zhang, Cai, Rezatofighi, Yu, Tao y Geiger. "Unifying Flow, Stereo and Depth Estimation." IEEE TPAMI 2023.
