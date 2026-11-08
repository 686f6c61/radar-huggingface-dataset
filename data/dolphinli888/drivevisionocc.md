# DolphinLi888/DriveVisionOcc

## Resumen

DriveVisionOcc es una implementación de la red de ocupación (Occupancy Network) de Tesla, desarrollada por el usuario DolphinLi888 (LiJiaheng) y publicada en Hugging Face. A diferencia del paradigma BEV (Bird's Eye View) habitual, el modelo emplea un enfoque transformer de consulta de volumen 3D que transforma características 2D de imágenes de cámara en una representación volumétrica 3D. El autor incorpora un diseño de aceleración en la atención espacial orientado a inferencia en tiempo real.

El modelo se entrena sobre el conjunto de datos de ocupación de nuScenes, y el autor proporciona un miniset para pruebas. Se trata de una versión de fotograma único (single frame), no temporal; el autor anuncia una versión temporal (Occ Flow) para el futuro. El repositorio tiene un tamaño de 3,8 GB y, en el momento de la consulta, registra 0 descargas y 1 like, lo que indica una publicación muy reciente y con escasa adopción.

La relevancia de este modelo radica en que reproduce un paradigma de percepción 3D para conducción autónoma (ocupación volumétrica a partir de visión) que hasta ahora estaba principalmente documentado por Tesla, y lo hace con un diseño de atención optimizado para tiempo real. No obstante, la ausencia de código fuente abierto (el autor indica que se abrirá más adelante) y de resultados cuantitativos limita su evaluación rigurosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de consulta de volumen 3D (3D volume query based), paradigma 2D a 3D, con atención espacial acelerada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa fotogramas individuales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de percepción visual, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio incluye archivos .ply de resultados; el formato de los pesos del modelo no se especifica) |

## Arquitectura y entrenamiento

DriveVisionOcc implementa una red de ocupación basada en un transformer de consulta de volumen 3D. En lugar de proyectar las características de imagen a un plano BEV, el modelo genera consultas volumétricas en el espacio 3D y las utiliza para agregar información desde las características 2D extraídas de las cámaras. El autor destaca un diseño de aceleración en la atención espacial orientado a la inferencia en tiempo real, aunque no se detalla su funcionamiento interno en la información disponible.

El entrenamiento se realiza sobre el conjunto de datos de ocupación de nuScenes, con un miniset proporcionado por el autor. El modelo es de fotograma único (sin componente temporal), y la versión con flujo de ocupación (Occ Flow) queda anunciada para el futuro. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables en un modelo de percepción). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Predicción de ocupación volumétrica 3D a partir de imágenes de cámara, con vóxeles de 0,4 x 0,4 x 0,4 m.
- Generación de nubes de vóxeles de ocupación en formato .ply (coordenadas x, y, z más color RGB).
- Comparación visual entre predicción y ground truth mediante herramientas de replay incluidas.
- Procesamiento de fotograma único (sin modelado temporal).
- Inferencia orientada a tiempo real gracias al diseño de atención espacial acelerada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo de pensamiento (thinking mode), visión generativa ni audio.

## Casos de uso

- Percepción 3D para conducción autónoma: el modelo genera una rejilla de ocupación volumétrica a partir de cámaras, lo que permite detectar obstáculos y espacio libre alrededor del vehículo sin depender de LiDAR.
- Investigación en redes de ocupación: sirve como implementación de referencia del paradigma de consulta de volumen 3D frente al enfoque BEV, útil para comparar arquitecturas en entornos académicos.
- Prototipado de planificación de trayectorias: la representación de ocupación en vóxeles de 0,4 m puede alimentar módulos de planificación que necesitan conocer el espacio libre y ocupado.
- Evaluación de pipelines de percepción en nuScenes: el miniset y los scripts de replay permiten validar visualmente las predicciones frente al ground truth.
- Desarrollo de sistemas de asistencia a la conducción: la inferencia en tiempo real con un solo tipo de sensor (cámara) reduce el coste de hardware frente a soluciones que requieren LiDAR.
- Docencia y formación: los scripts de replay con controles interactivos (rotación, zoom, superposición de ground truth) facilitan la comprensión de la representación volumétrica en cursos de percepción robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente proporciona comparaciones visuales cualitativas mediante GIF: en el conjunto de prueba las predicciones resultan poco claras, mientras que en el conjunto de entrenamiento son buenas. El propio autor atribuye esta diferencia a que el modelo necesita más datos para entrenar con una única modalidad de visión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 3,8 GB, pero no se especifica el tamaño de los pesos ni el consumo de memoria en inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor proporciona scripts de inferencia en Python (`test.py`) y de replay (`pred_results_replay.py`, `pred_results_replay_compare.py`) sobre un entorno conda con Python 3.11, PyTorch >= 2.1, Open3D >= 0.16.0, OpenCV >= 0.7, PyVista y Pillow. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor menciona la red de ocupación de Tesla como referencia conceptual, pero no se ofrecen datos cuantitativos ni especificaciones de dicha referencia para establecer una comparación. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El código fuente no está abierto en el momento de la publicación; el autor indica que se abrirá cuando sea conveniente, lo que impide auditar la implementación.
- El modelo es de fotograma único y no incorpora información temporal, lo que limita su robustez en escenarios dinámicos.
- El rendimiento en el conjunto de prueba es deficiente según el propio autor, que lo atribuye a la insuficiencia de datos para una modalidad única de visión.
- No se especifica la licencia, por lo que no se puede confirmar el uso comercial ni las restricciones de redistribución.
- No se documentan sesgos conocidos, pero al entrenarse sobre nuScenes (dataset de conducción con distribución geográfica y de escenarios concreta) es probable que el modelo generalice mal fuera de ese dominio.
- Riesgo de alucinación de ocupación: al ser un modelo generativo de vóxeles, puede predecir geometría inexistente o omitir obstáculos reales, especialmente en el conjunto de prueba.
- No se proporcionan métricas cuantitativas (IoU, precisión, recall) que permitan evaluar su fiabilidad en producción.
- El repositorio tiene 0 descargas y 1 like, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DolphinLi888/DriveVisionOcc
- Perfil del autor: https://huggingface.co/DolphinLi888
- Modelos del autor: https://huggingface.co/DolphinLi888/models
- Dataset de referencia nuScenes (mencionado en la model card): no se proporciona enlace directo en la información disponible.
