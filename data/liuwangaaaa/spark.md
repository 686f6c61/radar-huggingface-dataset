# liuwangaaaa/SPARK

## Resumen

SPARK (Small-target Pyramid-enhanced Adaptive Recognition framework) es un modelo de detección de objetos en tiempo real especializado en la detección temprana de incendios en espacios compactos. Desarrollado por liuwangaaaa, el modelo identifica dos clases (fuego y humo) en imágenes de 640x640 píxeles, con un enfoque particular en objetivos de pequeña escala. Está basado en la arquitectura D-FINE/DEIM, que combina un backbone HGNetv2-B5, un cuello SFPN (Spatial-Frequency Pyramid Network) con descomposición de wavelets de Haar, y un decodificador DFINE-T con 500 queries.

La relevancia de este modelo radica en su cadena de optimización completa para despliegue en el RDK S100P (march = nash-m), que incluye una línea de entrenamiento flotante, poda estructural y cuantización QAT. El repositorio entrega tres artefactos: un checkpoint de entrenamiento flotante (0.7147 mAP50:95), un modelo podado y afinado (0.6863), y un modelo cuantizado listo para despliegue en el BPU del RDK S100P (0.6855). Esta aproximación permite un despliegue en hardware de borde con una pérdida de precisión inferior al 0.1% respecto al modelo podado flotante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGNetv2-B5 backbone + SFPN neck + DFINE-T decoder (500 queries) |
| Parametros totales | 74.16M (flotante), 50.03M (podado) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | QAT int16_act_score16 (decoder activaciones qint16, pesos qint8, score head fp16) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | other (no especificada) |
| Formato de pesos | PyTorch checkpoint (torch.save), Horizon HBM (hbdk4.compiler) |

## Arquitectura y entrenamiento

SPARK sigue la arquitectura D-FINE/DEIM con un backbone HGNetv2-B5 y un cuello SFPN. La innovación clave del SFPN es la combinación de convoluciones profundas multi-kernel con descomposición de frecuencias mediante wavelets de Haar, lo que permite capturar información espacial y frecuencial para detectar objetivos de baja escala (fuego y humo en etapas tempranas). El decodificador DFINE-T procesa 500 queries de objetos, generando predicciones de cajas y confianza.

El entrenamiento se realiza en un dataset de validación `fire-CompactSpace`, con una línea base flotante que alcanza 0.7147 mAP50:95. Posteriormente se aplica poda estructural (LAMP) que reduce los parámetros de 74.16M a 50.03M (una reducción del 32.5%) y un -36% de FLOPs, seguido de un afinamiento que recupera parcialmente la precisión (0.6863). La etapa final de cuantización QAT con `int16_act_score16` se calibra con 10 lotes de validación y no requiere micro-ajuste, logrando 0.6855 mAP50:95 en simulación int16.

## Capacidades

- Detección de objetos de baja escala: optimizado para detectar fuego y humo en etapas tempranas en espacios compactos.
- Inferencia en tiempo real en hardware de borde: diseñado para el RDK S100P con rendimiento estático de 13.7 FPS y latencia de 73 ms.
- Detección de dos clases: fuego (fire) y humo (smoke).
- Entrada de imagen RGB de 640x640 píxeles con preprocesado simple (división por 255, sin normalización por media/desviación).
- Salida estructurada: 500 cajas con confianza y coordenadas normalizadas [1, 500, 4] y [1, 500, 2].
- Soporte de cuantización QAT con mínima pérdida de precisión (<0.1% respecto al modelo podado flotante).
- Compatibilidad con el compilador Horizon HBDK4 para despliegue en BPU (nash-m).

## Casos de uso

- **Detección temprana de incendios en espacios compactos**: el modelo está específicamente entrenado para detectar fuego yamas en entornos pequeños (como salas de servidores, vehículos, o almacenes), permitiendo alertas tempranas antes de que el incendio se propague. Su capacidad para detectar objetivos de baja escala lo hace adecuado para este escenario crítico.
- **Sistemas de seguridad y vigilancia automatizados**: integrado en sistemas de CCTV con hardware de borde (RDK S100P), puede analizar video en tiempo real y generar alertas automáticas cuando se detecta fuego o humo, reduciendo el tiempo de respuesta en comparación con la supervisión humana.
- **Monitoreo de instalaciones industriales**: en plantas químicas, eléctricas o de almacenamiento, el modelo puede detectar fuegos incipientes en equipos o materiales, permitiendo una respuesta inmediata y evitando daños mayores.
- **Protección de centros de datos**: los incendios en centros de datos son especialmente peligrosos por el riesgo de daño eléctrico y de infraestructura. SPARK puede desplegarse en servidores de borde para detectar anomalías térmicas y emisión de humo antes de que afecten a los equipos críticos.
- **Sistemas de extinción automática**: al integrarse con sistemas de extinción (rociadores o agentes limpios), el modelo puede activar la respuesta de extinción de forma autónoma cuando detecta fuego, mejorando la eficacia y reduciendo daños colaterales.
- **Investigación en detección de incendios**: sirve como punto de partida para experimentos de poda, cuantización y despliegue en hardware de borde, dado que la cadena completa (flotante → podado → cuantizado) está documentada y disponible para reproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada, ya que es un modelo de detección de objetos especializado. Sin embargo, se reportan los siguientes resultados en el conjunto de validación `fire-CompactSpace`:

| Modelo | Formato | mAP50:95 |
|--------|---------|----------|
| Flotante (baseline) | PyTorch checkpoint | 0.7147 |
| Podado x1.5 (afinado) | PyTorch checkpoint | 0.6863 |
| Podado + QAT (int16_act_score16) | Horizon HBM | 0.6855 |

El modelo cuantizado presenta una pérdida de precisión relativa de solo 0.1% respecto al modelo podado flotante, lo que demuestra la efectividad de la cuantización QAT para este caso de uso.

## Requisitos de hardware

- **Plataforma de despliegue**: RDK S100P (march = nash-m) con BPU (unidad de procesamiento de bajo consumo de Horizon).
- **Memoria**: 439 MB de memoria mínima para el modelo cuantizado (HBM).
- **Rendimiento estático**: 13.7 FPS, latencia de 73.0 ms por inferencia.
- **Entrada**: imágenes de 640x640 píxeles, formato FLOAT32 (RGB, preprocesado /255).
- **Formato de despliegue**: Horizon HBM (generado con `horizon_plugin_pytorch` QAT + `hbdk4.compiler`).
- **Alternativas de despliegue**: el modelo flotante y podado en formato PyTorch checkpoint pueden ser ejecutados en GPUs estándar (RTX 3090, A100, etc.) con los frameworks de detección de objetos habituales, aunque no se proporcionan métricas de rendimiento en GPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | mAP50:95 | Licencia | Despliegue |
|--------|--------------|------------|----------|----------|----------|------------|
| **SPARK (flotante)** | D-FINE/DEIM + SFPN | 74.16M | 640x640 | 0.7147 (fire-CompactSpace) | Apache 2.0 (a especificar) | PyTorch |
| **SPARK (podado)** | D-FINE/DEIM + SFPN | 50.03M | 640x640 | 0.6863 | Apache 2.0 (a especificar) | PyTorch |
| **YOLOv8m** (referencia) | CNN (CSPDarknet) | ~25.9M | 640x640 | ~0.50-0.55 (COCO) | AGPL-3.0 | PyTorch, ONNX, TensorRT |
| **RT-DETR-R50** | Transformer | ~42M | 640x640 | ~0.53 (COCO) | Apache-2.0 | PyTorch |

Nota: los modelos comparativos no están específicamente entrenados para detección de incendios, por lo que la comparación de mAP no es directamente comparable. SPARK está especializado en la detección de fuego y humo, mientras que los otros modelos son de propósito general.

## Limitaciones y advertencias

- **Especialización limitada**: el modelo está entrenado exclusivamente para detección de fuego y humo (2 clases). No puede ser utilizado para otras tareas de detección de objetos.
- **Dependencia del dataset**: el rendimiento reportado es sobre el conjunto de validación `fire-CompactSpace`, que es un entorno específico. El rendimiento en otros escenarios (exteriores, condiciones climáticas adversas, etc.) puede variar significativamente.
- **Cuantización**: el modelo cuantizado está optimizado para el hardware RDK S520P (nash-m). No se garantiza que funcione correctamente en otras plataformas de Horizon o en GPU.
- **Precisión**: la poda y la cuantización reducen la precisión en ~4% respecto al modelo flotante. Para aplicaciones críticas de seguridad, se recomienda evaluar el modelo flotante en el entorno de despliegue.
- **Licencia**: la licencia está marcada como "Apache-2.0" en los tags, pero el README no especifica claramente los términos. Se recomienda revisar los archivos de licencia en el repositorio antes de uso comercial.
- **Documentación**: el README está en chino (zh), lo que puede limitar la accesibilidad para desarrolladores que no dominan ese idioma.
- **Ausencia de datos de entrenamiento**: no se proporcionan detalles sobre el dataset de entrenamiento, el número de imágenes, ni la distribución de clases. Esto dificulta evaluar el sesgo y la generalización del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/liuwangaaaa/SPARK
- Perfil del autor: https://huggingface.co/liuwangaaaa
- Repositorio de código (referenciado en el README): https://github.com/
- Guías de poda y QAT: `docs/剪枝指南.md`, `docs/QAT指南.md` (en el repositorio)
- Modelo alternativo de Meta (no relacionado): https://ai.meta.com/blog/introducing-muse-spark-msl/
