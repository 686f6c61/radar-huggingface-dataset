# christiankhoury05/lesion-segmentation-model-1

## Resumen

Lesion Segmentation Model 1 es un prototipo de investigación publicado por christiankhoury05 (en el contexto de un trabajo de la asignatura MGT 200) que realiza segmentación de lesiones cutáneas en imágenes dermatoscópicas. Se trata de un fine-tuning del modelo `yolo26s-seg.pt` de Ultralytics, adaptado a una única clase (lesión cutánea) sobre el conjunto de datos ISIC 2018 Task 1. El modelo no diagnostica cáncer: únicamente delimita el contorno de la lesión en la imagen.

Con 11,43 millones de parámetros y un peso de 23,3 MB, es un modelo muy ligero orientado a la inferencia rápida en pipelines de imagen médica experimental. Su relevancia es acotada: sirve como punto de partida reproducible para tareas de segmentación dermatoscópica y como ejemplo de fine-tuning de YOLO para segmentación semántica/de instancias en un dominio especializado.

La licencia AGPL-3.0 (heredada de Ultralytics YOLO) y la ausencia de validación clínica lo sitúan estrictamente en el ámbito de la investigación, no en producción médica. El repositorio no incluye información sobre idiomas ni sobre capacidades de texto, ya que es un modelo puramente visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s-seg (Ultralytics), red de segmentación de instancias |
| Parametros totales | 11,43 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada de imagen a 640 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`, checkpoint Ultralytics) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `yolo26s-seg.pt`, la variante small de la familia YOLO26 de Ultralytics para segmentación. Trabaja con imágenes redimensionadas a 640 px y una única clase (clase 0 = lesión cutánea, almacenada internamente como `item` en el checkpoint). El checkpoint publicado corresponde a la época 38, aunque el entrenamiento se detuvo por early stopping en la época 58.

Los datos de entrenamiento provienen de ISIC 2018 Task 1 (licencia CC0), con los splits oficiales: 2.541 imágenes de entrenamiento, 97 de validación y 1.000 de test tras las comprobaciones de preparación. El autor advierte que no se garantiza independencia a nivel de paciente entre los splits. No se documentan detalles sobre aumentación de datos, función de pérdida ni hiperparámetros de entrenamiento más allá de lo indicado.

## Capacidades

- Segmentación de lesiones cutáneas en imágenes dermatoscópicas (una sola clase).
- Generación de máscaras/contornos de la lesión a partir de una imagen de entrada.
- Inferencia mediante la API de Ultralytics (`YOLO.predict`), con umbral de confianza configurable.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües, de texto, audio ni visión general más allá de la segmentación entrenada.
- No dispone de modo "thinking" ni de generación de explicaciones.

## Casos de uso

- Preprocesado en pipelines de investigación dermatológica: usar el modelo para recortar automáticamente la región de la lesión antes de pasarla a un clasificador o a un análisis morfológico posterior, aprovechando su bajo coste computacional (11,43 M de parámetros).
- Generación de máscaras para anotación asistida: el modelo puede proponer contornos iniciales que un dermatólogo o anotador revise y corrija, reduciendo el tiempo de etiquetado en nuevos conjuntos dermatoscópicos.
- Reproducción de experimentos académicos: sirve como baseline ligero y reproducible (SHA256 del checkpoint publicado) para comparar técnicas de segmentación sobre ISIC 2018.
- Cálculo de métricas morfológicas: a partir de la máscara segmentada se pueden derivar área, perímetro o asimetría de la lesión para estudios cuantitativos, siempre en contexto de investigación.
- Docencia y prototipado: ejemplo práctico de fine-tuning de YOLO para segmentación en un dominio médico, útil en cursos y talleres.
- Evaluación comparativa de modelos de segmentación: al tener métricas publicadas sobre el test oficial de ISIC 2018 (Dice medio 0,8874), puede usarse como referencia frente a otros segmentadores.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test de 1.000 imágenes de ISIC 2018:

| Metrica | Media | Mediana | IC bootstrap 95% |
|---|---|---|---|
| Dice | 0,8874 | 0,9358 | [0,8778, 0,8960] |
| IoU | 0,8205 | 0,8793 | [0,8099, 0,8311] |

Datos adicionales reportados: 13 contornos de lesión no detectados y un error absoluto relativo de área mediano del 8,70%. Las métricas completas están en `test_summary.json` del repositorio. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 11,43 M de parámetros y entrada a 640 px, cabe holgadamente en GPUs de consumo (estimación orientativa, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; una RTX 3060 o superior es más que suficiente para inferencia por lotes.
- Cabe en GPU de consumo: sí, con margen amplio.
- Opciones de despliegue: Ultralytics (PyTorch), exportación a ONNX/TensorRT/OpenVINO mediante las utilidades de Ultralytics; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lesion Segmentation Model 1 (YOLO26s-seg) | 11,43 M | imagen 640 px | Dice 0,8874 / IoU 0,8205 (ISIC 2018 test) | AGPL-3.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos de segmentación de lesiones en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No es un dispositivo médico ni está validado clínicamente; no debe usarse para diagnóstico.
- Entrenado exclusivamente con imágenes dermatoscópicas; no funciona con fotos de teléfono ni imágenes no dermatoscópicas.
- No se ha evaluado el rendimiento según el tono de piel, lo que supone un riesgo de sesgo demográfico no cuantificado.
- No se garantiza independencia a nivel de paciente entre los splits de entrenamiento, validación y test, lo que puede inflar las métricas reportadas.
- Los resultados provienen de un benchmark interno sobre un único conjunto de datos público.
- Licencia AGPL-3.0 heredada de Ultralytics YOLO: impone obligaciones de copyleft para uso en red y puede ser incompatible con despliegues comerciales cerrados.
- Riesgo de falsos negativos: se reportaron 13 lesiones sin contorno detectado en el test.
- Alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de segmentaciones espurias o de contornos imprecisos en imágenes atípicas.

## Enlaces

- Hugging Face: https://huggingface.co/christiankhoury05/lesion-segmentation-model-1
- Ultralytics (framework): https://github.com/ultralytics/ultralytics
- ISIC 2018 Challenge (dataset): https://challenge.isic-archive.com/landing/2018/
- Paper de ISIC 2018 (Task 1): no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible en la información proporcionada
