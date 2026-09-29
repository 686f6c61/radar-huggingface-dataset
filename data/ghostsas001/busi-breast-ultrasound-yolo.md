# ghostsas001/busi-breast-ultrasound-yolo

## Resumen

El modelo `ghostsas001/busi-breast-ultrasound-yolo` es un clasificador de imágenes de ecografía mamaria en tres clases (benigno, maligno y normal), desarrollado por el usuario ghostsas001 y construido con la librería Ultralytics YOLO sobre el conjunto de datos BUSI (Breast Ultrasound Images). Se distribuye como pesos PyTorch (`.pt`) para la tarea de clasificación de imágenes, con un tamaño de repositorio de 0.1 GB y licencia AGPL-3.0. Su relevancia es limitada y muy específica: sirve como línea base reproducible y como referencia metodológica, no como herramienta clínica.

El autor indica explícitamente que la receta de entrenamiento proviene de un proyecto de clasificación de glóbulos blancos y se reutilizó "sin ningún ajuste". El modelo reporta un 87,18 % de accuracy y un F1 macro del 87,01 % sobre un conjunto de prueba reservado de solo 78 imágenes (44 benignas, 21 malignas y 13 normales), con un total de 10 errores, 8 de ellos entre las clases benigno y maligno. No se publican datos sobre arquitectura interna, número de parámetros ni longitud de contexto.

El propio autor advierte de que las cifras publicadas sobre las mismas 780 imágenes del conjunto BUSI oscilan entre el 68,8 % y el 99,86 % según el protocolo y la partición empleados, y que la versión original del dataset contiene imágenes duplicadas y algunas ecografías que no son de mama. Este modelo se entrenó sobre esa versión sin depurar, con partición por imagen, por lo que pueden existir duplicados a ambos lados del split. Se trata, por tanto, de un artefacto de investigación reproducible, no de un dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO en su variante de clasificación (librería Ultralytics); backbone y número de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imágenes redimensionadas a 224 px) |
| Tipos de cuantizacion | no disponible (el repositorio publica únicamente `yolo.pt` en precisión completa) |
| Idiomas soportados | no disponible; las etiquetas de clase están en inglés (`benign`, `malignant`, `normal`) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (Ultralytics) |

Otros datos operativos: pipeline declarado `image-classification`, 0 descargas y 0 likes en el momento de la consulta, tamaño del repositorio 0.1 GB, fecha de creación y última actualización 29 de septiembre de 2026.

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de indicar que se trata de un modelo YOLO de clasificación construido con Ultralytics. No se especifica el número de parámetros, la profundidad del backbone, si se partió de pesos preentrenados en ImageNet o si se entrenó desde cero, ni el número total de tokens o épocas efectivas más allá de las 50 declaradas. La entrada se procesa a 224 píxeles y la salida es una distribución de probabilidad sobre tres clases, tal como muestra el ejemplo de uso con `result.probs.top1`.

En cuanto al entrenamiento, se emplearon 624 imágenes con 50 épocas, tamaño de imagen de 224 px, batch de 64 y el pipeline de aumentación por defecto de Ultralytics. La partición fue estratificada 80/10/10 por imagen con semilla 42, y la selección del modelo se hizo por mejor época sobre el split de validación. Todo el entrenamiento se ejecutó en una única GPU NVIDIA T4. No se menciona ningún tipo de ajuste fino posterior, RLHF, DPO ni decodificación especulativa, ya que no es un modelo generativo de lenguaje. La innovación declarada es mínima: reutilización directa de una receta de clasificación celular sin adaptación al dominio de ecografía mamaria.

## Capacidades

- Clasificación de imágenes de ecografía mamaria en tres categorías mutuamente excluyentes: benigno, maligno y normal.
- Salida de probabilidades por clase a través de `result.probs.top1` y del vector completo de probabilidades de Ultralytics.
- Inferencia sobre imágenes individuales a 224 px mediante `model.predict("ultrasound.png", imgsz=224)`.
- Procesamiento por lotes de imágenes, aprovechando la API estándar de Ultralytics para directorios o listas de rutas.
- Capacidad de servir como punto de partida para aprendizaje por transferencia en tareas de clasificación de imagen médica.
- No dispone de tool calling, function calling, razonamiento multi-paso, modo thinking, capacidades de agente, audio, vídeo ni generación de texto.
- No se documentan capacidades multilingües, ya que el modelo no procesa texto.

## Casos de uso

- Línea base de investigación en clasificación de ecografía mamaria: permite reproducir exactamente el protocolo descrito (624 imágenes, 50 épocas, semilla 42) y comparar contra arquitecturas alternativas bajo idénticas condiciones, algo útil para publicaciones metodológicas.
- Comparación controlada con el modelo compañero SigLIP: el autor publica un segundo clasificador sobre el mismo dataset, lo que permite un contraste directo entre un enfoque YOLO y un enfoque basado en SigLIP sobre la misma partición.
- Filtrado y auditoría de datasets BUSI: al ser un clasificador de tres clases, puede usarse para etiquetar automáticamente imágenes candidatas y detectar duplicados o muestras anómalas antes de reentrenar, un paso previo relevante dado que la versión original contiene duplicados.
- Docencia y formación técnica: es un ejemplo compacto (0.1 GB) de pipeline Ultralytics completo, desde la descarga con `hf_hub_download` hasta la predicción, adecuado para talleres de visión por computador aplicada a imagen médica.
- Prototipado de interfaz de triaje en entornos de investigación: integrado en un script Python, puede ordenar lotes de ecografías por probabilidad de malignidad para que un investigador las revise, siempre sin uso clínico real.
- Punto de partida para transferencia a otras modalidades ecográficas: la receta (224 px, batch 64, aumentación por defecto) puede reutilizarse como configuración inicial en datasets de tiroides, hígado o mama con otros equipos, ajustando solo la cabeza de clasificación.
- Pruebas de integración y despliegue de Ultralytics: sirve para validar pipelines de exportación, contenedores o servicios de inferencia en una GPU T4 o equivalente antes de migrar a modelos propios.

## Benchmarks y rendimiento

Los únicos datos disponibles son las métricas del propio autor sobre un conjunto reservado de 78 imágenes.

| Metrica (78 imagenes: 44 benignas, 21 malignas, 13 normales) | Valor |
|---|---|
| Accuracy | 87,18 % |
| F1 macro | 87,01 % |
| Balanced accuracy | 87,30 % |

Análisis de errores declarado: 10 errores sobre 78 imágenes, 8 de ellos entre las clases benigno y maligno. No se publican resultados comparativos con otros modelos en la información disponible, y el propio autor advierte de que las cifras publicadas sobre BUSI oscilan entre el 68,8 % y el 99,86 % por diferencias de partición y protocolo, por lo que cualquier comparación directa carece de validez sin homogeneizar el split.

## Requisitos de hardware

- Entrenamiento: una única NVIDIA T4 según la model card. No se especifica VRAM consumida ni tiempo por época.
- Inferencia: el repositorio completo ocupa 0.1 GB, por lo que el peso de los parámetros es muy reducido (estimación orientativa: por debajo de 1 GB de VRAM para pesos en FP32). No se publican mediciones de VRAM reales.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño de entrada (224 px) y el tamaño del artefacto, es previsible que funcione en cualquier GPU consumer reciente, pero no hay confirmación del autor.
- ¿Cabe en GPU consumer? Todo apunta a que sí, dado el tamaño del repositorio, aunque el dato no está verificado en la model card.
- Opciones de despliegue: la API de Python de Ultralytics empleada en el ejemplo (`YOLO(hf_hub_download(...)).predict(...)`). La librería Ultralytics admite exportación a otros formatos como ONNX, TensorRT u OpenVINO mediante su API de export, pero no se ha verificado que estos pesos concretos se hayan probado en esos backends.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo. La única alternativa documentada por el propio autor es el modelo compañero basado en SigLIP, pero su model card no aporta métricas en la información proporcionada.

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| busi-breast-ultrasound-yolo | YOLO clasificación (Ultralytics) | no disponible | no aplica | 87,18 % accuracy, F1 macro 87,01 % en 78 imágenes | AGPL-3.0 |
| busi-breast-ultrasound-siglip | SigLIP | no disponible | no disponible | no disponible | no disponible |
| Otros clasificadores sobre BUSI publicados | no disponible | no disponible | no disponible | rango declarado en la literatura: 68,8 % – 99,86 % | no disponible |

Cualquier comparación numérica con la literatura resulta poco fiable porque las particiones difieren y el dataset original contiene duplicados, tal como señala el autor.

## Limitaciones y advertencias

- No es un dispositivo médico. El autor lo etiqueta explícitamente como modelo de investigación y advierte de que los resultados no son una estimación fiable sobre pacientes o equipos nuevos.
- Dataset muy pequeño y de una sola fuente: 624 imágenes de entrenamiento y 78 de prueba, todas procedentes de BUSI.
- Duplicados no eliminados: la partición se hizo por imagen sobre la versión original del dataset, que contiene imágenes duplicadas, por lo que puede haber fuga de información entre entrenamiento y prueba.
- Presencia de imágenes que no son de mama en la versión original del dataset (Musah et al., 2025), lo que introduce ruido en las etiquetas.
- Conjunto de prueba de 78 imágenes: el intervalo de confianza de un 87,18 % de accuracy con esa muestra es muy amplio, y las diferencias de pocos puntos porcentuales no son significativas.
- Confusión benigno/maligno: 8 de los 10 errores se dan entre estas dos clases, precisamente la distinción con mayor relevancia clínica.
- Receta no ajustada al dominio: proviene de un proyecto de clasificación de glóbulos blancos y se reutilizó sin ningún ajuste, por lo que es probable que exista margen de mejora con hiperparámetros específicos.
- Sesgo demográfico y de equipamiento: no se documenta la composición de la población ni los dispositivos de adquisición, lo que impide evaluar la generalización.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas confiadas, ya que el modelo no expresa incertidumbre calibrada ni rechaza entradas fuera de distribución.
- Licencia AGPL-3.0: heredada de Ultralytics. Es una licencia copyleft fuerte que impone obligaciones relevantes si el modelo se integra en un servicio de red o en un producto distribuido; conviene revisar con asesoría legal antes de cualquier uso comercial.
- Idiomas: no aplica, el modelo no procesa texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ghostsas001/busi-breast-ultrasound-yolo
- Modelo compañero (SigLIP): https://huggingface.co/ghostsas001/busi-breast-ultrasound-siglip
- Repositorio GitHub con el análisis completo: https://github.com/Elghoudani/busi-breast-ultrasound-classification
- Dataset BUSI, Al-Dhabyani et al., Data in Brief, 2020: https://doi.org/10.1016/j.dib.2019.104863
- Musah et al., Towards Trustworthy Breast Tumor Segmentation in Ultrasound, 2025: https://arxiv.org/abs/2508.17768
- Documentación de Ultralytics YOLO: https://docs.ultralytics.com
