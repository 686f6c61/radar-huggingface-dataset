# mvdelibas/mars-volcanic-cone-seg-yolo11s

## Resumen

mars-volcanic-cone-seg-yolo11s es un modelo de segmentación de instancias basado en Ultralytics YOLO11s-seg, ajustado por el usuario mvdelibas para detectar y segmentar pequeños conos volcánicos en imágenes orbitales de Marte capturadas por la cámara CTX del orbitador MRO. El modelo resuelve una tarea concreta de la benchmark Mars-Bench (subtarea ConeQuest de segmentación), orientada a la cartografía planetaria y al estudio de la distribución de conos volcánicos, que se relaciona con la actividad volcánica pasada y la interacción agua subterránea-lava.

Se trata de un modelo pequeño (variante "s" de YOLO11) con dos salidas por objeto: caja delimitadora y máscara de segmentación. La única clase del modelo es `volkanik_koni` (nombre en turco), y el modelo está entrenado a resolución de 512 px durante 120 épocas. La model card advierte explícitamente de que la tarea es difícil y de que las salidas deben tratarse como candidatos a revisión, no como detecciones definitivas.

Es relevante por su carácter especializado: aplica un detector-segmentador genérico de propósito general a un dominio científico muy específico con datos de la benchmark Mars-Bench, y publica métricas de validación medibles. No obstante, su rendimiento (mask mAP50-95 del 29,0 %) y su restricción a una única fuente de imagen (CTX) limitan su uso fuera de la investigación exploratoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11s-seg (detector-segmentador de instancias CNN, fine-tune de pesos oficiales) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr (según metadatos; aplica a documentación, no a la tarea visual) |
| Licencia | AGPL-3.0 (pesos derivados de Ultralytics YOLO11); datos de entrenamiento bajo CC BY 4.0 |
| Formato de pesos | PyTorch (.pt, nombre `mars-volkanik-koni-seg-yolo11s-seg-v2.pt`) |

## Arquitectura y entrenamiento

El modelo es un YOLO11s-seg de Ultralytics, una red de detección y segmentación de instancias de una sola etapa que predice cajas y máscaras por objeto. Se parte de los pesos preentrenados oficiales de Ultralytics y se realiza un fine-tune sobre el subconjunto `mb-conequest_seg` (ConeQuest) de Mars-Bench, con imágenes CTX de NASA/JPL/MSSS. El entrenamiento se realizó a 512 px, 120 épocas (mejor época 119), con `lr0` de 0.001 y un factor de recompensa de 4.28 (según la sección turca de la model card).

El conjunto de datos conserva deliberadamente aproximadamente la mitad de imágenes vacías (sin conos) para reducir falsos positivos, lo que explica la precisión relativamente alta (63,5 %) frente a un recall moderado (53,8 %). No se documentan técnicas avanzadas como decodificación especulativa, atención lineal o RLHF, dado que no es un modelo generativo. La partición de test no se midió en esta model card; las métricas publicadas corresponden a la partición de validación (319 imágenes según la sección turca).

## Capacidades

- Segmentación de instancias: produce máscaras y cajas delimitadoras para cada cono volcánico detectado.
- Detección de objetos pequeños en imágenes orbitales de Marte (CTX).
- Salida de cajas y máscaras simultánea por objeto (no solo clasificación).
- Entrenado para una única clase: `volkanik_koni`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües de generación de texto; los idiomas en metadatos son solo informativos.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales más allá de la imagen de entrada.

## Casos de uso

- Cartografía exploratoria de conos volcánicos en imágenes CTX: el modelo genera candidatos de máscara para que un investigador los revise manualmente, acelerando el etiquetado inicial en estudios de distribución volcánica.
- Preetiquetado para anotación humana: usar las detecciones como propuesta inicial en una herramienta de anotación, reduciendo el tiempo de etiquetado en nuevas regiones de Marte.
- Análisis de densidad de conos por región: aplicar el modelo a mosaicos CTX y contar candidatos para estudiar la relación entre distribución de conos y actividad volcánica pasada.
- Filtrado de candidatos en pipelines de ciencia planetaria: integrar el modelo como primer paso para descartar regiones sin conos antes de un análisis más costoso.
- Investigación sobre interacción agua subterránea-lava: usar las máscaras para correlacionar la presencia de conos con firmas espectrales o topográficas.
- Docencia y divulgación: ejemplos prácticos de segmentación de instancias en dominios científicos con Ultralytics YOLO.
- Evaluación comparativa de modelos de segmentación en Mars-Bench: referencia reproducible para comparar con otros detectores en la subtarea ConeQuest.

## Benchmarks y rendimiento

Métricas publicadas en la partición de validación (319 imágenes):

| Métrica | Valor |
|---|---|
| Box mAP50 | 57,9 % |
| Box mAP50-95 | 29,3 % |
| Mask mAP50 | 58,4 % |
| Mask mAP50-95 | 29,0 % |
| Precisión (caja) | 63,5 % |
| Recall (caja) | 53,8 % |
| Precisión (máscara) | 61,6 % |
| Recall (máscara) | 56,6 % |
| AP50 por clase (`volkanik_koni`) | 57,4 % |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; por la variante YOLO11s-seg (modelo pequeño), es esperable que quepa en GPUs consumer, pero no se aporta cifra concreta.
- GPU recomendadas: no disponible en la información proporcionada; cualquier GPU compatible con PyTorch y Ultralytics debería servir para inferencia.
- Cabe en GPU consumer: previsiblemente sí, al tratarse de la variante "s", aunque no se confirma con datos.
- Opciones de despliegue: Ultralytics (Python), exportación a ONNX/TensorRT/OpenVINO vía Ultralytics (no documentado en la model card).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. La model card no incluye comparativas con otros detectores o segmentadores en Mars-Bench ni en tareas afines, por lo que no es posible establecer una tabla comparativa rigurosa.

## Limitaciones y advertencias

- Aproximadamente la mitad de las imágenes de entrenamiento no contienen conos; esto reduce falsos positivos pero puede infrarepresentar conos en escenas densas.
- Los conos pueden confundirse con cráteres de impacto y montículos; la generalización entre regiones es limitada.
- Entrenado únicamente con imágenes orbitales MRO CTX; no es fiable con otras cámaras o resoluciones.
- Rendimiento real en otros sensores, regiones o estilos de imagen será inferior al de validación; se recomienda comprobar sobre una muestra propia antes de confiar en él.
- Uso previsto de investigación; no debe usarse como única fuente para cartografía científica ni para decisiones de misión.
- Licencia AGPL-3.0 en los pesos (derivados de Ultralytics), con implicaciones para uso comercial y distribución; la licencia CC BY 4.0 de los datos exige mantener la atribución.
- Los nombres de clase internos están en turco (`volkanik_koni`), lo que puede requerir mapeo en pipelines en otros idiomas.
- Riesgo de alucinación en sentido figurado: falsos positivos en regiones sin conos; no se documentan sesgos adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/mars-volcanic-cone-seg-yolo11s
- Dataset Mars-Bench (ConeQuest) en Zenodo: https://doi.org/10.5281/zenodo.15494675
- Ultralytics YOLO (framework): https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics: https://docs.ultralytics.com
