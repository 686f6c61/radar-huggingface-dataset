# Najongs/dinobotpose3-train-extra

## Resumen

dinobotpose3-train-extra es un repositorio de pesos alojado en Hugging Face por el usuario Najongs que contiene checkpoints intermedios de un sistema de estimación de pose para robótica construido sobre DINOv3. Según la propia model card, los ficheros de detección (`*_heatmap.pth` y similares) son derivados que incorporan un trunk DINOv3 ViT-B/16 y, por tanto, quedan sujetos al DINOv3 License Agreement de Meta. No se trata de un modelo con model card descriptiva al uso, sino de un volcado de artefactos de investigación subidos durante una limpieza de disco el 2026-10-27 desde el servidor interno `ibomcom`, conservando la estructura de rutas original bajo `DIP/3_pose_models/DINObotPose3/TRAIN/`.

El interés del repositorio es acotado pero real: expone pesos que de otro modo no estarían publicados de un pipeline de pose estimation basado en un backbone fundacional de visión (DINOv3 ViT-B/16, aproximadamente 86 millones de parámetros solo en el trunk) con cabeceras que producen mapas de calor (heatmaps) de puntos clave. Es relevante para quien quiera reproducir o auditar experimentos de DINObotPose3, no como modelo listo para producción: el repositorio ocupa 12,6 GB, no incluye documentación de entrenamiento ni resultados de benchmarks, y tiene cero descargas y cero likes en el momento de la consulta.

La información disponible no permite determinar el tamaño total del modelo (trunk más cabeceras), la composición del dataset de entrenamiento, el número de tokens o imágenes vistas, ni los idiomas soportados. Todo lo que sigue distingue explícitamente entre datos declarados por el autor y estimaciones derivadas de la arquitectura DINOv3 ViT-B/16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (ViT) DINOv3 ViT-B/16 como trunk, con cabeceras de estimación de pose que producen heatmaps (checkpoints `*_heatmap.pth`) |
| Parametros totales | no disponible (el trunk DINOv3 ViT-B/16 tiene del orden de 86 M de parámetros; el total con cabeceras no se declara) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica en el sentido de LLM (modelo de visión con parches de 16x16 y resolución de entrada no declarada) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en precisión original PyTorch (`.pth`), sin versiones cuantizadas publicadas |
| Idiomas soportados | no disponible (el modelo no procesa texto; la model card está redactada en coreano) |
| Licencia | `other`, con `license_name: dinov3-license`; se rige por el DINOv3 License Agreement de Meta y las obras derivadas heredan los mismos términos |
| Formato de pesos | checkpoints PyTorch (`.pth`); repositorio de 12,6 GB con rutas relativas preservadas y lista de enlaces simbólicos en `SYMLINKS.txt` |

## Arquitectura y entrenamiento

La arquitectura declarada es un derivado de DINOv3: un Vision Transformer ViT-B/16 (parches de 16x16, variante base) empleado como extractor de características, sobre el que se montan cabeceras de detección que generan mapas de calor de puntos clave. El pipeline de Hugging Face está etiquetado como `robotics` y `pose-estimation`, lo que sitúa el uso previsto en estimación de pose de objetos o efectores en entornos robóticos. No hay información pública en la documentación proporcionada sobre si el trunk se congela o se ajusta fino, ni sobre el número de capas de la cabecera, la resolución de entrada o el esquema de augmentación.

Respecto al entrenamiento, la model card no aporta ningún dato: no se indica el volumen de imágenes, la composición del dataset, si hubo anotaciones sintéticas o reales, ni si se aplicaron técnicas de alineación tipo RLHF/DPO (no aplicables habitualmente en este dominio). Lo único verificable es el origen de los artefactos: son salidas intermedias de investigación del proyecto DINObotPose3, subidas desde el path `/home/najo/NAS/DIP/3_pose_models/DINObotPose3/TRAIN` durante una limpieza de disco, con la estructura de directorios intacta. Los enlaces simbólicos no se subieron y se documentaron aparte en `SYMLINKS.txt`, lo que implica que algunas rutas pueden estar rotas al descargar el repositorio.

## Capacidades

- Extracción de características visuales densas mediante un trunk DINOv3 ViT-B/16, reutilizable para tareas de visión downstream.
- Estimación de pose basada en heatmaps: los checkpoints `*_heatmap.pth` producen mapas de calor de puntos clave, el esquema clásico para localización de joints o puntos de interés en robótica.
- Orientación a robótica: el pipeline declarado (`robotics`) sugiere uso en percepción para manipulación, aunque no se documenta la interfaz de inferencia.
- Reutilización del backbone: al incorporar el trunk DINOv3, los pesos pueden servir como inicialización para otros experimentos de pose o detección.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica; el modelo no procesa texto.
- Capacidades especiales (thinking mode, visión, audio): únicamente visión; no se documentan modos de razonamiento ni audio.
- No se documenta en la información disponible ninguna capacidad de segmentación, profundidad, detección de cajas o generación de texto asociada a estos checkpoints.

## Casos de uso

- Estimación de pose de objetos en manipulación robótica: los heatmaps permiten localizar puntos clave de una pieza (por ejemplo, asas o vértices) para calcular una pose 6D y planificar la aprehensión con un gripper paralelo. El uso de un backbone DINOv3 aporta features robustas ante cambios de iluminación y textura.
- Bin picking y alimentación de líneas: integrado en un pipeline de percepción, el modelo puede estimar la pose de piezas apiladas antes de que el planificador seleccione el objetivo; conviene validar primero la robustez ante oclusiones, no documentada por el autor.
- Etiquetado asistido de datasets: usar los checkpoints como preanotadores de puntos clave sobre nuevas imágenes y corregir manualmente, reduciendo el coste de anotación en proyectos internos de robótica.
- Imitación y aprendizaje por demostración: estimar la pose del efector o de la mano en vídeos de demostración para generar trayectorias de entrenamiento de políticas; el trunk ViT-B/16 es lo bastante ligero para procesar fotogramas en línea.
- Evaluación sim-to-real: comparar la salida de pose del modelo sobre renders sintéticos y sobre imágenes reales para medir la brecha de dominio antes de desplegar una política entrenada en simulación.
- Reproducción de experimentos académicos: al conservar las rutas relativas del entrenamiento original, el repositorio sirve para reproducir ablaciones de DINObotPose3 (cambios de cabecera, resolución o augmentación) partiendo de los mismos checkpoints.
- Auditoría de modelos derivados de DINOv3: útil para equipos legalmente interesados en verificar qué artefactos incorporan el trunk de Meta y qué obligaciones de licencia arrastran.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de error de pose (PCK, ADD, ADD-S, MPJPE), ni comparaciones con otros estimadores, ni curvas de entrenamiento. Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato del autor. Como referencia arquitectónica, un ViT-B/16 en fp32 ocupa del orden de 330-350 MB solo en pesos del trunk; un checkpoint completo con cabeceras debería moverse en el rango de cientos de MB, muy por debajo del tamaño del repositorio (12,6 GB), que agrega múltiples artefactos y posiblemente estados de optimizador. Estimación no confirmada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería bastar para una sola instancia en fp32, dado el tamaño del backbone; para lotes grandes o entrenamiento fino se recomienda A100, H100, L40S o RTX 4090.
- Cabe en GPU de consumo: previsiblemente sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, siempre que se cargue un único checkpoint y no el repositorio completo. Verificar experimentalmente.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` sobre los `.pth`), exportación a TorchScript u ONNX para servir con ONNX Runtime o TensorRT. vLLM y TGI no aplican (no es un modelo de lenguaje); llama.cpp/Ollama no soportan este formato ni arquitectura.
- Latencia y throughput estimados: no disponibles. Dependen de la resolución de entrada, del preprocesado y del hardware, ninguno de los cuales se documenta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dinobotpose3-train-extra (Najongs) | trunk ViT-B/16 (~86 M) + cabeceras, total no disponible | resolución de entrada no disponible | sin benchmarks publicados | DINOv3 License (Meta) | Hugging Face, 0 descargas |
| dinobotpose (Najongs) | no disponible | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face |
| dinobotpose-training-runs (Najongs) | no disponible | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face |
| DINOv3 ViT-B/16 (Meta) | ~86 M en la variante B/16 | no disponible en la información proporcionada | no disponible en la información proporcionada | DINOv3 License (Meta) | pesos publicados por Meta |

No se dispone de datos verificables de benchmarks ni de especificaciones completas de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible. Otros estimadores de pose basados en ViT (por ejemplo, la familia ViTPose) son candidatos naturales a comparación, pero sus cifras no están disponibles en las fuentes consultadas y no se incluyen para no introducir datos no verificados.

## Limitaciones y advertencias

- Repositorio de artefactos, no modelo documentado: no hay descripción de dataset, hiperparámetros, métricas ni instrucciones de uso; la model card se limita a avisos de licencia y al origen de los ficheros.
- Licencia restrictiva y heredada: al incorporar el trunk DINOv3, los checkpoints son obra derivada y quedan sujetos al DINOv3 License Agreement de Meta. Cualquier redistribución debe aplicar los mismos términos; es imprescindible leer el texto completo antes de un uso comercial.
- Sin validación externa: cero descargas y cero likes en el momento de la consulta implican ausencia de reproducibilidad独立 por terceros.
- Posibles rutas rotas: los enlaces simbólicos no se subieron y solo se listan en `SYMLINKS.txt`, de modo que determinados scripts o configuraciones del entrenamiento original pueden no resolverse tras la descarga.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de predicciones de pose espurias en configuraciones visuales fuera de la distribución de entrenamiento (oclusiones, objetos reflectantes, iluminación extrema); no hay métricas publicadas que acoten ese riesgo.
- Sesgos conocidos: no documentados. Al desconocerse la composición del dataset, no puede evaluarse el sesgo hacia tipos de objeto, materiales, cámaras o entornos concretos.
- Limitaciones de idioma: no aplica al modelo; la documentación está únicamente en coreano, lo que dificulta su adopción por parte de equipos hispanohablantes.
- Caveat de producción: sin métricas de latencia, precisión ni robustez, no es recomendable desplegarlo en un lazo de control robótico real sin una evaluación propia previa y sin un mecanismo de salvaguarda ante fallos de percepción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Najongs/dinobotpose3-train-extra
- Repositorio relacionado dinobotpose: https://huggingface.co/Najongs/dinobotpose
- Repositorio relacionado dinobotpose-training-runs: https://huggingface.co/Najongs/dinobotpose-training-runs
- Código en GitHub: https://github.com/Najongs/DINObotPose3
- Licencia DINOv3 (Meta): https://ai.meta.com/resources/models-and-libraries/dinov3-license/
