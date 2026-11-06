# RenatoSpessotto/thermal-pv-hotspots-assimilation

## Resumen

El modelo `thermal-pv-hotspots-assimilation`, desarrollado por RenatoSpessotto, es un detector de puntos calientes (hotspots) en módulos fotovoltaicos a partir de imágenes térmicas capturadas con dron. A diferencia de los enfoques convencionales dependientes de la cámara, este sistema se construye sobre un backbone DINOv3-B/16 congelado y añade cabezas de regresión logística con asimilación de datos, una máscara de panel, una proyección PCA y un detector de "fuera de soporte". El objetivo es que el detector funcione con independencia del sensor térmico empleado, generalizando entre cámaras y paletas.

El modelo resuelve un problema clásico en inspección de plantas solares: los detectores entrenados con una cámara concreta degradan su rendimiento al cambiar de sensor o de paleta de color. La propuesta normaliza la temperatura relativa al fondo del panel (ΔT_z), la repinta con una paleta fija, la reamuestrea a 3 cm/px y extrae características con DINOv3, aplicando después corrección de sesgo por metadatos de vuelo y ganancia de Kalman como peso de la evidencia física.

Es relevante ahora porque demuestra que un backbone de visión congelado, combinado con asimilación de datos, puede mejorar sustancialmente la transferencia entre cámaras (AUROC 0,927 frente a 0,836 del enfoque basado solo en pseudo-color) sin reentrenar el extractor de características. La arquitectura es un transformer ViT-B/16 (DINOv3) con cabezas ligeras entrenables; el repositorio solo contiene las cabezas y artefactos auxiliares, no los pesos del backbone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B/16 (DINOv3) congelado + cabezas de regresión logística con asimilación de datos |
| Parametros totales | no disponible (el repositorio no incluye los pesos del backbone; DINOv3-B/16 es el extractor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada por imagen térmica con reamuestreo a 3 cm/px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | pt, en |
| Licencia | dinov3-derived (licencia propia derivada de DINOv3 de Meta; uso del backbone sujeto a los términos de facebook/dinov3-vitb16-pretrain-lvd1689m) |
| Formato de pesos | no disponible (el repo no contiene pesos del backbone; tamaño del repo 0.0 GB) |

## Arquitectura y entrenamiento

El sistema emplea como extractor de características el backbone `facebook/dinov3-vitb16-pretrain-lvd1689m`, un ViT-B/16 de DINOv3 que permanece congelado. Sobre sus features se entrenan cabezas de regresión logística que incorporan términos de asimilación de datos: una corrección de sesgo a partir de metadatos de adquisición (cámara, vuelo) y una ganancia de Kalman que pondera la evidencia física. El pipeline incluye además una máscara de panel, una proyección PCA y un detector de "fuera de soporte" que marca imágenes alejadas de la distribución de entrenamiento.

El preprocesado es parte central del diseño: se lee la temperatura radiométrica (FLIR FFF y DJI R-JPEG en Python puro) y los metadatos de vuelo, se clasifica la imagen en nivel A, B o C según disponibilidad de radiometría, se calcula ΔT_z (temperatura relativa al fondo del panel dividida por la dispersión de los paneles), se repinta con una paleta fija y se reamuestrea a 3 cm/px. Hay dos cabezas: R4 para imágenes radiométricas (niveles A y B), invariante a la cámara, y R0 para imágenes de solo pseudo-color (nivel C).

Los datos de entrenamiento son PV-HSD-2025 (China, DJI Mavic 3T, Apache-2.0) y tres plantas de 50 MW en India (DJI Zenmuse XT2, Apache-2.0). La máscara de panel se entrenó con el dataset de Zenodo 16420123 (CC BY 4.0). No se especifica en la información disponible el número de tokens ni detalles de RLHF/DPO (no aplica a este tipo de modelo).

## Capacidades

- Detección de hotspots en módulos fotovoltaicos en imágenes térmicas de dron, devolviendo cajas delimitadoras y un mapa de logits por celda de 8×8 px.
- Clasificación automática de la imagen en nivel A (radiométrica con escala), B (radiométrica sin escala) o C (solo pseudo-color).
- Selección automática de cabeza: R4 para niveles A/B y R0 para nivel C.
- Cálculo de ΔT_z para eliminar la dependencia de calibración y escala de la cámara.
- Detección de "fuera de soporte" (alerta cuando la imagen se aleja de la distribución de entrenamiento).
- Generalización entre cámaras y paletas mediante asimilación de datos (corrección de sesgo por metadatos y ganancia de Kalman).
- Lectura nativa de formatos radiométricos FLIR FFF y DJI R-JPEG en Python puro.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: documentación en pt y en; el modelo no procesa texto.
- Capacidades especiales: segmentación por celdas, máscara de panel, proyección PCA y alerta de fuera de soporte.

## Casos de uso

- Triaje de inspecciones térmicas de plantas solares: el modelo ordena las celdas por probabilidad de hotspot (AUROC 0,86–0,98 en la misma planta) para que los operarios prioricen la revisión manual, ya que está diseñado como herramienta de cribado y no de conteo de defectos.
- Inspección con flotas heterogéneas de drones: al ser invariante a la cámara para imágenes radiométricas (AUROC 0,927 en cámara nueva), permite usar DJI Mavic 3T, Zenmuse XT2 u otros sensores bajo el mismo contrato de entrada sin reentrenar.
- Integración en pipelines de mantenimiento predictivo: la salida estructurada (cajas, nivel, cabeza, alerta, mapa de logits) se puede volcar a un sistema de gestión de activos para generar órdenes de trabajo sobre los módulos señalados.
- Procesado por lotes de vuelos completos: la lectura nativa de FFF y R-JPEG y el reamuestreo fijo a 3 cm/px permiten automatizar el análisis de conjuntos de imágenes térmicas sin conversión previa.
- Control de calidad de campañas de inspección: el detector de fuera de soporte alerta cuando una imagen no se parece a las del entrenamiento (otra cámara, otra paleta, condiciones distintas), evitando interpretar predicciones poco fiables.
- Investigación en generalización de dominio: al mantener el backbone DINOv3 congelado y entrenar solo cabezas ligeras, sirve como banco de pruebas reproducible para estudiar transferencia entre sensores y asimilación de datos en visión térmica.
- Análisis de imágenes sin radiometría: para capturas de solo pseudo-color (nivel C), la cabeza R0 ofrece un AUROC agregado de 0,790, útil cuando no se dispone de temperatura calibrada.

## Benchmarks y rendimiento

Evaluación dejando una fuente entera fuera (AUROC por celda, IC 95 % por bootstrap sobre imágenes):

| Test | R0 (pseudo-color) | R4 (asimilación) |
|---|---|---|
| Cámara nueva (entreno India/XT2 → test China/Mavic 3T) | 0,836 (0,830–0,839), recall 0,05 | 0,927 (0,923–0,931), recall 0,57 |
| Cambio de paleta de la misma imagen (recall, media de 4 fuentes) | 0,51 → 0,25 | 0,47 → 0,40 |
| Misma cámara de otra planta (India) | 0,91–0,95 | 0,90–0,91 |
| Sin radiometría (agregado de la web, nivel C) | 0,790 | 0,709 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al usar DINOv3-B/16 (ViT-B/16) congelado, la inferencia es ligera y cabe en GPU de consumo, pero no se publican cifras concretas.
- GPU recomendadas: no disponible; por el tamaño del backbone (ViT-B/16), cualquier GPU con suficiente memoria para un ViT-B es suficiente en la práctica.
- Compatibilidad con GPU de consumo: previsiblemente sí (ViT-B/16), aunque no se confirma en la información proporcionada.
- Opciones de despliegue: el paquete Python `solar_hotspots` (instalación vía `pip install -e .`) sobre el repositorio de GitHub; requiere `HF_TOKEN` para acceder al backbone DINOv3, que está restringido (gated). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Enfoque | Generalización entre cámaras | Licencia | Disponibilidad |
|---|---|---|---|---|
| thermal-pv-hotspots-assimilation (R4) | DINOv3 congelado + asimilación de datos | AUROC 0,927 en cámara nueva | dinov3-derived | Hugging Face + GitHub |
| thermal-pv-hotspots-assimilation (R0) | DINOv3 congelado + pseudo-color | AUROC 0,836 en cámara nueva | dinov3-derived | Hugging Face + GitHub |
| Detectores térmicos convencionales dependientes de cámara | Entrenamiento y umbral por sensor | Degradación al cambiar de cámara (no cuantificada en la información) | variable | no disponible |

No se dispone en la información proporcionada de otros modelos comparables con métricas publicadas bajo el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Uso indicado para triaje: buena ordenación (AUROC 0,86–0,98 en la misma planta), pero precisión baja en el umbral estándar (precisión por celda ~0,3–0,45; recall por caja 0,38–0,74 entre plantas). Señala dónde mirar; no cuenta defectos.
- Entrenado con solo dos cámaras radiométricas (DJI Mavic 3T y Zenmuse XT2). Otras cámaras se tratan bajo el mismo contrato de entrada, pero no se han validado con etiquetas.
- El umbral se calibró en las fuentes de entrenamiento: en una cámara nueva, R4 genera más falsos positivos (~34 celdas por imagen en China).
- Los hotspots menores que un píxel (vuelos muy altos) no son recuperables.
- En imágenes sin radiometría (nivel C) no se cumple la invariancia a la cámara.
- Una sola clase ("hotspot"): no distingue diodo, bypass ni string.
- Riesgo de alucinación/falsos positivos inherente a la detección; el detector de fuera de soporte mitiga pero no elimina el problema.
- Sesgos conocidos: no se documentan sesgos demográficos (no es un modelo de lenguaje), pero la distribución de entrenamiento está limitada a plantas de India y China.
- Restricciones de licencia: licencia "dinov3-derived"; el uso del backbone sigue los términos de Meta y el acceso es restringido (gated), por lo que el uso comercial requiere revisar ambas licencias.
- Caveat para producción: el repositorio no incluye los pesos del backbone (tamaño 0.0 GB), por lo que es necesario descargar DINOv3 por separado y aceptar su licencia.

## Enlaces

- Hugging Face: https://huggingface.co/RenatoSpessotto/thermal-pv-hotspots-assimilation
- GitHub: https://github.com/renatospessotto/thermal-pv-hotspots-assimilation
- Resultados: https://github.com/renatospessotto/thermal-pv-hotspots-assimilation/blob/main/docs/resultados.md
- Backbone DINOv3: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
- Dataset máscara de panel: https://zenodo.org/records/16420123
- Referencia de asimilación de datos: Lahoz, W. A. & Schneider, P. (2014). Data assimilation: making sense of Earth Observation. Frontiers in Environmental Science 2:16.
