# Rafael990/unet-roads

## Resumen

unet-roads es un modelo de segmentación de imágenes orientado a la extracción de ejes de carretera en imágenes aéreas y satelitales de muy alta resolución (RGB). Lo desarrolla Rafael990 y se publica como modelo base para fAIr, la plataforma GeoAI abierta del Humanitarian OpenStreetMap Team (HOT). El modelo segmenta carreteras sobre teselas de 256 x 256 píxeles con una resolución aproximada de 0,3 m por píxel, y su pipeline posterior convierte la máscara resultante en LineStrings listos para su revisión e integración en OpenStreetMap.

Técnicamente es una U-Net con encoder ResNet34 implementada con segmentation-models-pytorch, con una única canal de salida. Se distribuye en dos formatos: un checkpoint PyTorch (`unet-roads.pt`) que incluye el nombre del encoder y el `state_dict`, y una exportación ONNX (`unet-roads.onnx`) con entrada float32 `[1, 3, 256, 256]` normalizada a 0-1 y salida de logits `[1, 1, 256, 256]`. El repositorio ocupa 0,2 GB.

Su relevancia es práctica: cubre un caso de uso humanitario concreto (mapeo de infraestructura viaria en regiones con datos incompletos) y se plantea explícitamente como punto de partida para fine-tuning local, no como modelo listo para producción sin supervisión humana. La licencia CC-BY-SA-4.0 permite uso comercial con atribución y compartir-al-igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet34 (segmentation-models-pytorch) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 256 x 256 píxeles) |
| Tipos de cuantizacion | no disponible (exportación ONNX float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | PyTorch (`.pt`) y ONNX (`.onnx`) |

## Arquitectura y entrenamiento

La red es una U-Net estándar con backbone ResNet34 y una sola salida por píxel (probabilidad de carretera). Trabaja sobre recortes de 256 x 256 píxeles a unos 0,3 m/píxel y produce logits de la misma resolución espacial, que el pipeline externo umbraliza y vectoriza a LineStrings.

El entrenamiento se realizó en dos etapas. Una etapa base con los ejes de carretera de SpaceNet 3 sobre Jartum y París (licencia CC-BY-SA-4.0). Una etapa de fine-tuning con imágenes de dron de OpenAerialMap (CC-BY-4.0) y carreteras de OpenStreetMap (ODbL-1.0) sobre Maputo, Freetown y Dar es Salaam. No se documentan en la información disponible el número de tokens, el volumen exacto de imágenes, la composición detallada del dataset ni el uso de técnicas de refuerzo o preferencias (no aplicables a segmentación). Tampoco se detallan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Segmentación binaria de carreteras en imágenes aéreas y satelitales RGB de muy alta resolución.
- Extracción de ejes de carretera (centrelines) a partir de la máscara, mediante el pipeline de vectorización a LineStrings.
- Procesamiento por teselas de 256 x 256 píxeles, apto para mosaicos de gran extensión.
- Exportación ONNX para despliegue en entornos sin PyTorch.
- Integración como modelo base en la plataforma fAIr de HOT para flujos de mapeo asistido.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües; no es un modelo generativo de texto.
- No incluye modo de pensamiento, visión general, audio ni otras modalidades fuera de la imagen RGB.

## Casos de uso

- Mapeo humanitario de red viaria: el modelo segmenta carreteras en imágenes de dron y satélite para generar candidatos a LineStrings que voluntarios de OpenStreetMap revisan y corrigen, acelerando la cobertura en zonas con datos escasos.
- Actualización de cartografía en emergencias: tras un desastre, se procesan teselas de 256 x 256 píxeles de imágenes recientes para identificar vías de acceso y priorizar la logística humanitaria, con revisión humana obligatoria.
- Fine-tuning local en fAIr: al ser un modelo base, equipos regionales pueden reentrenarlo con imagery y etiquetas locales para adaptarlo a tipologías viarias y condiciones de iluminación específicas.
- Control de calidad de datos OSM: se comparan las predicciones con las carreteras ya mapeadas para detectar omisiones o discrepancias en la red viaria existente.
- Análisis de accesibilidad y planificación urbana: la extracción de ejes permite calcular conectividad y rutas en zonas periurbanas de África subsahariana y Asia meridional.
- Investigación en segmentación remota: sirve como referencia reproducible (U-Net + ResNet34) para comparar arquitecturas y estrategias de fine-tuning en extracción de carreteras.
- Despliegue en pipelines ONNX: la exportación permite integrar la inferencia en servicios ligeros o entornos edge sin dependencia de PyTorch.

## Benchmarks y rendimiento

| Conjunto de evaluación | Métrica | Resultado |
|---|---|---|
| Jartum (bloques espaciales reservados) | IoU | 0,53 |
| Jartum (bloques espaciales reservados) | F1 relajado (tolerancia 3 px) | 0,44 |
| París (bloques espaciales reservados) | IoU | 0,56 |
| París (bloques espaciales reservados) | F1 relajado (tolerancia 3 px) | 0,20 |
| Banepa, Nepal (imágenes de dron no vistas en entrenamiento) | Precisión a nivel de tesela (revisión visual) | 69 % |

Las métricas se calculan sobre bloques espaciales reservados con tolerancia de 3 píxeles. En imágenes de dron la referencia de OpenStreetMap está incompleta, por lo que la evaluación en Banepa se complementó con revisión visual.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,2 GB) y la arquitectura U-Net con ResNet34, la inferencia cabe con holgura en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para lotes pequeños; A100, H100 o RTX 4090 no son necesarias para inferencia y solo aportarían mayor throughput en procesamiento masivo de teselas.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660, RTX 3060, RTX 4060 y superiores; el dato exacto de VRAM no está publicado.
- Opciones de despliegue: PyTorch (checkpoint `.pt`), ONNX Runtime (`.onnx`), y frameworks de segmentación compatibles con segmentation-models-pytorch.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| unet-roads (este modelo) | U-Net + ResNet34 | 256 x 256 RGB | CC-BY-SA-4.0 | HuggingFace, PyTorch y ONNX |
| SpaceNet 3 baselines | Diversas (U-Net, SegNet, etc.) | Variable | Varía según implementación | Repositorios de SpaceNet |
| Modelos de extracción de carreteras en fAIr | No disponible | No disponible | No disponible | Plataforma fAIr de HOT |

No se dispone de datos comparativos de rendimiento con alternativas concretas en la información proporcionada. La comparación directa con otros modelos de extracción de carreteras requeriría evaluar sobre los mismos bloques espaciales y con la misma tolerancia de 3 píxeles.

## Limitaciones y advertencias

- Omite senderos estrechos, pistas bajo dosel forestal y carriles en sombra.
- Puede trazar como carreteras cubiertas metálicas largas y límites de parcela, generando falsos positivos.
- El F1 relajado en París es bajo (0,20) pese al IoU de 0,56, lo que indica problemas de continuidad o topología en la vectorización.
- La referencia de OpenStreetMap en imágenes de dron está incompleta, lo que limita la evaluación cuantitativa en esos entornos.
- Está pensado como punto de partida para fine-tuning local, no como modelo listo para producción.
- Toda predicción debe revisarse humanamente antes de incorporarse a OpenStreetMap; el propio autor lo exige.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribución y obliga a compartir las obras derivadas bajo la misma licencia.
- No se documentan sesgos demográficos o geográficos específicos más allá de la cobertura del entrenamiento (Jartum, París, Maputo, Freetown, Dar es Salaam y Banepa), por lo que el rendimiento fuera de esas regiones es incierto.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos en la segmentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rafael990/unet-roads
- Plataforma fAIr de HOT: https://github.com/hotosm/fAIr-models
- Paper de SpaceNet (Van Etten et al., 2018): https://arxiv.org/abs/1807.01232
- OpenAerialMap: https://openaerialmap.org
- OpenStreetMap: https://www.openstreetmap.org
