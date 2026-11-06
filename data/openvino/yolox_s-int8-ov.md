# OpenVINO/yolox_s-int8-ov

## Resumen

YOLOX-S INT8 OV es una versión optimizada del detector de objetos YOLOX-S, convertida al formato Intermediate Representation (IR) de OpenVINO y cuantizada a INT8 tanto en pesos como en activaciones. El modelo original fue desarrollado en el ecosistema MMDetection de OpenMMLab, y esta variante ha sido producida por Geti (plataforma de Intel para entrenamiento y despliegue de modelos de visión) y publicada bajo el perfil oficial de OpenVINO en Hugging Face. Su propósito es ofrecer un detector de objetos de una sola etapa, ligero y de baja latencia, listo para desplegarse en hardware Intel (CPU, GPU integrada, NPU) sin necesidad de conversión adicional.

La relevancia de esta ficha radica en que no se trata de un modelo de lenguaje, sino de un detector visual de la familia YOLOX en su variante "small", pensado para inferencia en el borde (edge) y en equipos con recursos limitados. La cuantización INT8 reduce el peso y acelera la ejecución en comparación con los pesos en FP32, manteniendo el pipeline de post-procesado estándar de detección (cajas, clases y puntuaciones). El repositorio es de tamaño mínimo (0,0 GB reportados) porque solo contiene los artefactos IR comprimidos, no los pesos originales en PyTorch.

El modelo se integra mediante OpenVINO Model API, lo que permite cargarlo con una sola llamada (`Model.from_pretrained`) y ejecutar inferencia sobre imágenes con visualización incluida. Está orientado a casos de detección de objetos genéricos sobre el dataset COCO o sobre datasets personalizados si se reentrena con Geti. No dispone de información publicada sobre idiomas ni sobre benchmarks propios en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-S (detector de objetos de una etapa, familia YOLOX; backbone CSPDarknet-small con cuello PAN y cabeza desacoplada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; resolución de entrada no especificada en la model card) |
| Tipos de cuantizacion | INT8 en pesos y activaciones (Post-Training Quantization con NNCF) |
| Idiomas soportados | no disponible (no aplica; modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (Intermediate Representation), compatible con OpenVINO 2026.1.0+ y Model API 0.4.0+ |

## Arquitectura y entrenamiento

YOLOX-S es un detector de objetos de una sola etapa que sigue la línea de YOLO pero con varias decisiones de diseño propias: cabeza desacoplada (separación de las ramas de clasificación y regresión), ausencia de anchors (anchor-free), asignación dinámica de etiquetas (SimOTA) y uso de decodificación con supresión de no máximos (NMS) estándar. La variante "S" (small) reduce la profundidad y el ancho del backbone respecto a las variantes M, L y X, lo que la hace adecuada para despliegue en dispositivos con recursos limitados. La model card no detalla el número exacto de parámetros ni la composición del dataset de entrenamiento; se remite a la documentación del modelo original en MMDetection.

El proceso de conversión y cuantización lo realiza la plataforma Geti de Intel: se parte del modelo YOLOX-S original, se convierte a OpenVINO IR y se aplica cuantización post-entrenamiento (PTQ) con NNCF, fijando INT8 tanto en pesos como en activaciones. No se menciona en la información disponible si hubo reentrenamiento, ajuste fino con datos propios ni técnicas adicionales como destilación o poda. Tampoco se especifican los datos de calibración usados para la cuantización, un dato relevante para estimar la pérdida de precisión respecto al modelo en FP32.

## Capacidades

- Detección de objetos en imágenes: devuelve cajas delimitadoras, clases y puntuaciones de confianza para cada objeto detectado.
- Pipeline de post-procesado integrado en OpenVINO Model API: carga del modelo, inferencia y renderizado de resultados con `Visualizer`.
- Compatibilidad con el ecosistema OpenVINO: ejecución en CPU, GPU integrada y NPU de Intel.
- Inferencia de baja latencia gracias a la cuantización INT8 en pesos y activaciones.
- Posibilidad de reentrenamiento con datasets personalizados mediante la plataforma Geti (anotación, fine-tuning y exportación).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de detección.
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades multimodales más allá de la detección sobre imagen.

## Casos de uso

- Detección de objetos en tiempo real en dispositivos de borde: el modelo, al estar cuantizado a INT8 y en formato IR, se ejecuta con baja latencia en CPU y NPU Intel, lo que permite procesar flujos de vídeo en cámaras inteligentes o pasarelas industriales sin GPU dedicada.
- Control de calidad en líneas de fabricación: se puede entrenar con Geti sobre imágenes de producto y desplegar el detector para identificar defectos, piezas mal colocadas o elementos ausentes en la cadena de montaje.
- Analítica de vídeo en retail: detección de personas y objetos en grabaciones de tienda para conteo de aforo, análisis de flujos o detección de intrusos, aprovechando la inferencia rápida en hardware Intel ya presente en los equipos.
- Sistemas de vigilancia y seguridad perimetral: detección de intrusiones en zonas restringidas con procesamiento local, evitando enviar vídeo a la nube y reduciendo el consumo de ancho de banda.
- Robótica y vehículos autónomos de bajo coste: percepción de obstáculos y objetos cercanos en plataformas con CPU o NPU, donde el consumo energético y el espacio son limitados.
- Preprocesado en pipelines de visión más complejos: uso del detector como etapa inicial para recortar regiones de interés que después se envían a un clasificador o a un modelo de reconocimiento, reduciendo el cómputo total del sistema.
- Prototipado rápido con OpenVINO Model API: integración en pocas líneas de código para validar un caso de uso de detección antes de invertir en un modelo propio o en hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (mAP) ni de latencia para esta variante cuantizada, y tampoco se han encontrado en la búsqueda web datos específicos del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al ser un modelo "small" cuantizado a INT8, la huella de memoria es reducida, pero no se especifica el tamaño exacto de los artefactos IR.
- GPU recomendadas: no se detallan en la model card. El modelo está pensado para ejecutarse en hardware Intel mediante OpenVINO (CPU, GPU integrada, NPU); no se mencionan requisitos de GPU dedicada.
- Compatibilidad con GPU de consumo: no confirmada explícitamente. OpenVINO soporta CPU, GPU y NPU Intel, por lo que podría ejecutarse en iGPU de procesadores Intel recientes, pero no hay datos publicados sobre rendimiento en tarjetas gráficas de consumo como RTX 4090.
- Opciones de despliegue: OpenVINO Runtime (versión 2026.1.0 o superior) y OpenVINO Model API (versión 0.4.0 o superior). No se mencionan otros runtimes como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Familia | Parametros | Contexto / entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| YOLOX-S INT8 OV (este) | YOLOX small | no disponible | no disponible | Apache-2.0 | OpenVINO IR (INT8) | Cuantizado, orientado a hardware Intel |
| YOLOX-S original (MMDetection) | YOLOX small | no disponible | no disponible | Apache-2.0 | PyTorch | Pesos sin cuantizar; requiere conversión para OpenVINO |
| Otras variantes YOLOX (M, L, X) | YOLOX | no disponible | no disponible | Apache-2.0 | PyTorch | Mayor capacidad y coste computacional; no comparadas en benchmarks en la información disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de esta variante cuantizada con las alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card remite a la documentación del modelo original (MMDetection) para las limitaciones; no se detallan sesgos específicos de esta variante.
- Riesgo de alucinación no aplica en el sentido de los modelos de lenguaje, pero sí existe riesgo de falsos positivos y falsos negativos en la detección, especialmente tras la cuantización INT8, que puede degradar ligeramente la precisión respecto al modelo en FP32.
- No se especifican los datos de calibración usados para la cuantización, por lo que no se puede evaluar la pérdida de precisión en dominios distintos al de calibración.
- El modelo está entrenado para detección de objetos genéricos (probablemente sobre COCO, aunque no se confirma); su rendimiento en dominios muy específicos requerirá reentrenamiento con Geti.
- Dependencia del ecosistema OpenVINO: requiere OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior; no es directamente ejecutable en otros runtimes sin conversión.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar la licencia del modelo original y las condiciones de la plataforma Geti si se usa para reentrenamiento.
- No hay información publicada sobre idiomas ni sobre rendimiento multilingüe porque no aplica a un modelo de visión.
- El repositorio reporta un tamaño de 0,0 GB, lo que sugiere que solo contiene los artefactos IR; no incluye los pesos originales ni scripts de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenVINO/yolox_s-int8-ov
- Modelo original YOLOX-S en MMDetection: https://github.com/open-mmlab/mmdetection/tree/main/configs/yolox
- Plataforma Geti: https://github.com/open-edge-platform/geti
- Documentación de OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guía de cuantización post-entrenamiento de OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- OpenVINO Model API: https://github.com/open-edge-platform/model_api
- Documentación de OpenVINO Model API: https://open-edge-platform.github.io/model_api/latest/
- Documentación general de OpenVINO: https://docs.openvino.ai/
- Repositorio de OpenVINO en GitHub: https://github.com/openvinotoolkit/openvino
- Página de Intel sobre OpenVINO: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
- Perfil de OpenVINO en Hugging Face: https://huggingface.co/OpenVINO
