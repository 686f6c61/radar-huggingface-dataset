# dronefreak/bdd100k-mmdet-fcos-center-normbbox-centeronreg-giou-r50-fpn-gn-head-dcn-4x4-1x

## Resumen

El modelo `bdd100k-mmdet-fcos-center-normbbox-centeronreg-giou-r50-fpn-gn-head-dcn-4x4-1x` es un detector de objetos de una etapa basado en FCOS (Fully Convolutional One-Stage), publicado originalmente por el equipo de BDD100K en 2020 y replicado en Hugging Face por el usuario `dronefreak` con un entorno de ejecución fijado y un script de inferencia. Resuelve la detección de objetos en escenas de conducción autónoma sobre el conjunto de datos BDD100K, cubriendo categorías como coches, peatones, señales de tráfico y semáforos.

La relevancia actual del checkpoint no reside en su rendimiento —es un baseline de 2020 con un mAP@50:95 de 30,1 en validación— sino en su valor como referencia reproducible: el autor documenta la procedencia de los pesos, verifica la integridad del archivo mediante SHA-256 y demuestra una reproducción exacta de las predicciones originales sobre imágenes de test. Es, por tanto, un artefacto útil para investigación comparativa, validación de pipelines de mmdetection y como punto de partida histórico en detección para conducción autónoma.

Arquitectónicamente es una red convolucional pura (ResNet-50 como backbone, FPN como cuello y cabeza FCOS con convoluciones deformables), con 33,18 millones de parámetros y un tamaño de repositorio de 0,9 GB. No es un modelo generativo ni tiene ventana de contexto: es un detector de imágenes por fotograma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FCOS (one-stage, anchor-free) con backbone ResNet-50, FPN y cabeza con convoluciones deformables (DCN) |
| Parametros totales | 33.184.868 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión por fotograma, sin contexto secuencial) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors de precisión completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | BDD100K (license: other, con license_name bdd100k) |
| Formato de pesos | safetensors (repo también contiene `original/` con los pesos y resultados originales) |

## Arquitectura y entrenamiento

El modelo sigue la familia FCOS: un detector de una etapa y sin anchors que predice directamente cajas y clases por píxel sobre mapas de características multiescala generados por un FPN. El backbone es una ResNet-50, y la cabeza incorpora convoluciones deformables (DCN) para mejorar la adaptación a objetos con geometría variable, típica de escenas de tráfico. El nombre del checkpoint codifica además detalles de la configuración: normalización de cajas (`normbbox`), centrado en la regresión (`centeronreg`), pérdida GIoU (`giou`) y un esquema de entrenamiento de 1x (12 épocas).

El entrenamiento se realizó con PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.3 y mmdetection 2.4.0 sobre GPUs Tesla P100-PCIE-16GB, según los metadatos registrados en el propio checkpoint. No se documenta en la información disponible el número de tokens (no aplica), la composición exacta del dataset más allá de BDD100K, ni si hubo etapas de refinamiento posteriores. La innovación técnica destacable no está en el modelo en sí, sino en el trabajo de preservación: el autor fija versiones compatibles (Python 3.10, torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) para que un stack de 2020 siga ejecutándose en hardware actual, y verifica que la inferencia reproduce exactamente las 2000 cajas de las predicciones originales sobre 20 imágenes de test.

## Capacidades

- Detección de objetos en imágenes individuales de escenas de conducción (coches, peatones, señales, semáforos, etc., según las clases de BDD100K).
- Procesamiento de carpetas de imágenes y de vídeo fotograma a fotograma mediante `infer.py`.
- Captura desde webcam (ruta implementada con el mismo bucle que vídeo, aunque no probada con cámara real según el autor).
- Exportación de detecciones en formato BDD100K (píxeles, `x1 y1 x2 y2`) mediante `--json`.
- Ajuste del umbral de confianza en inferencia (`--score-thr`, por defecto 0,3) y límite de fotogramas (`--max-frames`).
- Carga segura de pesos con `torch.load(weights_only=True)`, sin ejecución de código arbitrario.
- No soporta tool calling, agentes, razonamiento multi-step, texto, audio ni modo thinking: es exclusivamente un detector visual.

## Casos de uso

- Investigación comparativa de detectores: sirve como baseline FCOS reproducible para contrastar mejoras en detección sobre BDD100K, gracias a la verificación de integridad y a la reproducción exacta de predicciones documentada.
- Validación de pipelines de mmdetection 2.x: útil para comprobar que un entorno con mmcv-full 1.7.2 y mmdetection 2.28.2 funciona correctamente antes de migrar configuraciones o modelos propios.
- Docencia y formación en visión por computador: el repo incluye un script de inferencia claro y un entorno fijado, lo que facilita reproducir un detector clásico sin pelearse con dependencias.
- Prototipado de sistemas ADAS: permite generar detecciones sobre vídeo de tráfico para explorar lógicas de alerta o análisis de escenas, asumiendo las limitaciones de precisión del baseline.
- Análisis offline de grabaciones de conducción: procesar carpetas de imágenes o vídeos y exportar cajas en formato BDD100K para análisis estadístico posterior (densidad de vehículos, presencia de peatones, etc.).
- Auditoría de datasets y detección de sesgos: al ser un modelo de 2020, sirve para estudiar cómo se comporta un detector entrenado en BDD100K en condiciones diurnas y nocturnas, y documentar diferencias de rendimiento.
- Referencia para preservación de artefactos: el patrón de entorno fijado, hash SHA-256 y verificación de predicciones es un ejemplo práctico de cómo empaquetar un checkpoint antiguo para que siga siendo utilizable.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre el split de validación de BDD100K (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| mAP@50:95 (val) | 30,1 |
| mAP@50 (val) | 54,9 |
| mAP@75 (val) | 27,9 |

No se han publicado en la información disponible resultados adicionales (por clase, por condición meteorológica o comparativas con otros detectores).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 33,2 M de parámetros y pesos en precisión completa, el modelo es ligero y cabe holgadamente en GPUs de consumo, aunque el autor no publica cifras de VRAM.
- GPU recomendadas: el entrenamiento original usó Tesla P100-PCIE-16GB; para inferencia basta una GPU moderna de gama media, aunque no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, por tamaño (33,2 M de parámetros), aunque el requisito real depende de la versión de CUDA y de mmcv; el autor solo ha verificado el entorno de CPU.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 (entorno fijado en `env/requirements-cu118.txt` para GPU o `env/requirements-cpu.txt` para CPU); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; el autor indica que la ruta de GPU (CUDA 11.8) aún no se ha ejecutado y que solo el entorno de CPU está verificado.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros detectores comparables (por ejemplo, variantes de Faster R-CNN, YOLO o RetinaNet sobre BDD100K) con los que contrastar parámetros, contexto o rendimiento. Por tanto, la comparativa se marca como no disponible.

| Modelo | Parametros | Contexto | mAP@50:95 (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (FCOS R50-FPN DCN 1x) | 33,2 M | no aplica | 30,1 | BDD100K | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento moderado: un mAP@50:95 de 30,1 en validación es propio de un baseline de 2020; no es adecuado para producción con requisitos de precisión altos sin reentrenamiento o fine-tuning.
- Sesgos del dataset: entrenado sobre BDD100K, hereda los sesgos de composición, geografía y condiciones de captura de dicho conjunto; el comportamiento en dominios distintos (otras ciudades, cámaras, climatología) no está documentado.
- Riesgo de falsos positivos y negativos: no se publican métricas por clase ni por condición (día/noche, lluvia), por lo que el rendimiento en escenarios adversos es incierto.
- Dependencia de un stack antiguo: requiere mmdetection 2.x y mmcv-full 1.7.2; las versiones más recientes (mmdetection 3.x) no son compatibles sin adaptación.
- Verificación parcial: solo el entorno de CPU está verificado; la ruta de GPU con CUDA 11.8 no se ha probado según el autor, y la captura por webcam no se ha validado con cámara real.
- Licencia restrictiva: la licencia BDD100K (`license: other`) puede imponer condiciones para uso comercial; es necesario revisar el archivo `LICENSE.txt` del repositorio antes de cualquier despliegue productivo.
- Sin soporte de texto ni contexto: no es un modelo de lenguaje; no admite prompts, tool calling ni razonamiento, por lo que no debe evaluarse con los criterios habituales de los LLM.
- Procedencia de los pesos: son un espejo de los publicados por el equipo de BDD100K en el servidor de Berkeley sin documentación original; la model card es la única fuente de contexto y debe tratarse con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/bdd100k-mmdet-fcos-center-normbbox-centeronreg-giou-r50-fpn-gn-head-dcn-4x4-1x
- Licencia (LICENSE.txt en el repo): https://huggingface.co/dronefreak/bdd100k-mmdet-fcos-center-normbbox-centeronreg-giou-r50-fpn-gn-head-dcn-4x4-1x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Repositorio de mmdetection: https://github.com/open-mmlab/mmdetection
- No se han encontrado en la información disponible enlaces a papers, blogs o demos adicionales.
