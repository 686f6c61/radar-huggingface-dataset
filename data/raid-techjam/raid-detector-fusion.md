# RAID-techjam/raid-detector-fusion

## Resumen

RAID-techjam/raid-detector-fusion es un conjunto de pesos experimentales para la detección de imágenes generadas o manipuladas por inteligencia artificial, desarrollado por el usuario RAID-techjam. El modelo combina dos flujos de procesamiento: un flujo semántico basado en un ViT-B/16 preentrenado, que captura características de alto nivel de la imagen, y un flujo forense de baja frecuencia basado en la arquitectura Bayar+SRM, especializado en artefactos estadísticos y de compresión. Ambos flujos se fusionan mediante un clasificador entrenado con los flujos congelados, lo que permite combinar información semántica y de baja frecuencia para distinguir entre imágenes auténticas y generadas.

El repositorio contiene cinco archivos de checkpoint (`.pt`) y un archivo de configuración YAML, con un tamaño total de 0,4 GB. No se especifican licencia, idiomas ni pipeline en la página de HuggingFace. El modelo se presenta como experimental y no está listo para producción, ya que el punto de entrada de inferencia (`predict.py`) aún no soporta el checkpoint de fusión Bayar-aware. Los resultados reportados en la model card indican un AUC de validación de aproximadamente 0,8738 en un subconjunto limpio de 10.000 imágenes del dataset SID_Set, y una robustez limitada ante reducciones de escala agresivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Doble flujo: ViT-B/16 (semantico) + Bayar+SRM (forense de baja frecuencia) con capa de fusion y clasificador |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`) |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (`.pt`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de doble flujo. El flujo semantico utiliza un ViT-B/16 preentrenado (checkpoint `semantic_stream.pt`) que procesa la imagen completa y extrae representaciones de alto nivel. El flujo forense de baja frecuencia emplea una red Bayar+SRM (checkpoint `bayar_srm_stream.pt`) que opera sobre recortes de resolucion nativa con valores RGB en el rango [0, 1], capturando artefactos de compresion y estadisticas residuales. Ambos flujos se congelan durante la etapa de fusion, y solo se entrenan las capas de fusion y el clasificador final (checkpoint `detector_fusion.pt`). El entrenamiento de fusion se realiza durante 5 epocas sobre el dataset SID_Set, aunque no se especifica el tamano total del dataset; el experimento reportado utiliza un subconjunto de 10.000 imagenes. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion. La configuracion base se encuentra en `base_config.yaml`.

## Capacidades

- Deteccion binaria de imagenes: clasifica una imagen como autentica (0) o generada/manipulada por IA (1).
- Combinacion de informacion semantica y forense de baja frecuencia para mejorar la robustez frente a artefactos visuales.
- Evaluacion independiente del flujo Bayar+SRM mediante un script dedicado (`evaluate_bayar_srm.py`), que permite medir el rendimiento del flujo forense por separado.
- Entrenamiento de fusion reproducible mediante el script `train_fusion.py`, que carga los checkpoints de los flujos congelados y entrena solo las capas de fusion.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al ser un modelo de vision puro.

## Casos de uso

- Moderacion de contenido en plataformas sociales: el modelo puede integrarse en un pipeline de revision para marcar imagenes sospechosas de ser generadas por IA, ayudando a filtrar contenido manipulado antes de su publicacion.
- Verificacion de imagenes en medios de comunicacion: periodistas y verificadores pueden usar el detector para evaluar la autenticidad de fotografias recibidas de fuentes no confiables, reduciendo el riesgo de difundir desinformacion visual.
- Auditoria de datasets de entrenamiento: al analizar grandes colecciones de imagenes, el modelo puede identificar muestras generadas sinteticamente que contaminen conjuntos de datos destinados a entrenar otros modelos de vision.
- Investigacion academica en forensica digital: el flujo Bayar+SRM independiente permite estudiar la contribucion de los artefactos de baja frecuencia en la deteccion, sirviendo como base para experimentos comparativos.
- Control de calidad en generacion de imagenes: empresas que desarrollan modelos generativos pueden usar el detector para validar que sus salidas no sean detectables como artificiales, aunque esto requeriria un ajuste fino adicional.
- Prototipado de sistemas de seguridad: el checkpoint de fusion puede integrarse en un entorno de desarrollo para probar la viabilidad de un detector de imagenes sinteticas antes de invertir en una solucion comercial.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados experimentales sobre un subconjunto de 10.000 imagenes del dataset SID_Set:

| Metrica | Valor |
|---|---|
| AUC en validacion limpia (Bayar+SRM) | 0,8738 |
| AUC con resize 0.5 (Bayar+SRM) | 0,8459 |
| AUC con resize 0.25 y 0.35 | no reportado (condiciones desafiantes) |

No se han publicado resultados comparativos con otros detectores de imagenes generadas por IA en la informacion disponible. Los valores corresponden unicamente al flujo Bayar+SRM, no al modelo de fusion completo.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la model card.
- El flujo semantico ViT-B/16 requiere aproximadamente 86 millones de parametros; el flujo Bayar+SRM es una red convolucional poco profunda (resnet_shallow). En conjunto, el modelo deberia caber en GPUs de consumo con 8 GB de VRAM en precision FP32, y menos con cuantizacion (no proporcionada).
- Se recomienda una GPU NVIDIA con soporte CUDA para un rendimiento razonable; la ejecucion en CPU es posible pero considerablemente mas lenta, segun la model card.
- Para inferencia, se puede utilizar el script de evaluacion `evaluate_bayar_srm.py` o el entrenamiento de fusion `train_fusion.py`. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- La latencia y el throughput no estan documentados.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (detectores de imagenes generadas por IA) dentro de los datos proporcionados. La busqueda web devolvio resultados sobre RAID (Robust AI Detection), un benchmark para deteccion de texto generado por IA, que no es directamente comparable con este modelo de vision. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo es experimental y no esta preparado para produccion; el punto de entrada `predict.py` no soporta el checkpoint de fusion Bayar-aware, por lo que la inferencia directa requiere scripts de entrenamiento/evaluacion.
- La robustez ante reducciones de escala es limitada: con escalas de 0.25 y 0.35 el rendimiento se degrada significativamente, lo que indica vulnerabilidad ante imagenes redimensionadas.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial o redistribucion.
- El dataset SID_Set no esta documentado en la informacion proporcionada; se desconoce su composicion, tamano total y posibles sesgos.
- No se han evaluado sesgos demograficos o culturales en la deteccion, ya que no se proporcionan datos al respecto.
- El modelo solo distingue entre autentico y generado/manipulado; no ofrece explicaciones ni niveles de confianza calibrados.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/RAID-techjam/raid-detector-fusion
- Repositorio de codigo mencionado en la model card: https://github.com/Beastarz/RAID (no verificado en la busqueda web)
- Dataset SID_Set: no se ha encontrado un enlace oficial en la informacion disponible.
