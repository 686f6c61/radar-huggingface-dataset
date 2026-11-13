# csgaobb/UniADet

## Resumen

UniADet es un modelo de detección y segmentación de anomalías visuales desarrollado por el usuario csgaobb y publicado en Hugging Face bajo acceso restringido. Está diseñado específicamente para tareas de *anomaly detection* en régimen zero-shot y few-shot, apoyándose en modelos fundacionales de visión como CLIP, DINOv2 y DINOv3. Su pipeline declarado es `image-segmentation`, lo que indica que produce máscaras de segmentación de las regiones anómalas, no solo una puntuación de anomalía a nivel de imagen.

El modelo se orienta a inspección industrial y a imagen médica, dos dominios donde la escasez de ejemplos de defectos reales hace especialmente valiosos los enfoques zero-shot y few-shot. Al combinar representaciones de CLIP con las de la familia DINO, UniADet busca generalizar a categorías de anomalía no vistas durante el entrenamiento sin requerir un reentrenamiento específico por producto o patología.

La información pública disponible es muy limitada: el repositorio figura con un tamaño de 0.0 GB, 6 descargas y 0 likes en el momento de la consulta, y el acceso está restringido (gated), por lo que los pesos no son descargables sin aceptar condiciones. No se han publicado en la información disponible detalles sobre arquitectura interna, número de parámetros, longitud de contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se apoya en CLIP, DINOv2 y DINOv3 según los tags) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de visión; no se especifica resolución de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | uniadet-weights (licencia propia, acceso restringido) |
| Formato de pesos | no disponible (el tamaño del repo figura como 0.0 GB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en los datos proporcionados. Los tags del repositorio indican que el modelo se construye sobre componentes de CLIP, DINOv2 y DINOv3, y que está implementado en PyTorch. El pipeline declarado es `image-segmentation`, lo que sugiere una salida densa (máscara por píxel) además de posibles puntuaciones de anomalía a nivel de imagen.

Tampoco se especifican el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de ajuste fino supervisado, RLHF o DPO (estas últimas poco habituales en modelos de visión). Los tags `zero-shot` y `few-shot` indican que el diseño prioriza la generalización a categorías no vistas, probablemente mediante alineamiento entre representaciones visuales y textuales (CLIP) y características auto-supervisadas densas (DINOv2/DINOv3). No hay información sobre innovaciones técnicas concretas como decodificación especulativa o atención lineal.

## Capacidades

- Detección de anomalías visuales en régimen zero-shot, sin ejemplos de la categoría de defecto objetivo.
- Detección de anomalías en régimen few-shot, con un número reducido de ejemplos normales o anómalos.
- Segmentación de imágenes (`image-segmentation`): generación de máscaras de las regiones anómalas.
- Aplicación a inspección industrial (detección de defectos en productos).
- Aplicación a imagen médica (identificación de regiones patológicas).
- Aprovechamiento de representaciones de CLIP para alineamiento visión-lenguaje.
- Aprovechamiento de características densas de DINOv2 y DINOv3 para localización fina.
- Soporte de tool calling, agentes, razonamiento multi-paso, audio o modo *thinking*: no disponible / no aplica (modelo de visión).
- Capacidades multilingües: no; el modelo declara únicamente inglés (`en`).

## Casos de uso

- Inspección de defectos en línea de producción: el modelo puede segmentar regiones anómalas en imágenes de productos industriales sin necesidad de entrenar un detector específico por referencia, gracias a su enfoque zero-shot.
- Control de calidad few-shot en nuevos productos: ante una nueva referencia con pocos ejemplos normales, el modelo puede adaptarse con pocas muestras en lugar de requerir un dataset etiquetado extenso.
- Precribado en imagen médica: uso como primer filtro para resaltar regiones potencialmente patológicas en radiografías o imágenes de modalidad similar, aprovechando la segmentación densa para dirigir la revisión del especialista.
- Detección de anomalías en datasets no etiquetados: aplicación sobre imágenes sin etiquetas para descubrir defectos o irregularidades y priorizar la anotación manual.
- Segmentación de defectos para documentación y trazabilidad: generación de máscaras que se incorporan a informes de inspección o a sistemas de registro de no conformidades.
- Investigación en detección de anomalías: uso como línea base que combina CLIP y DINO para comparar enfoques zero-shot y few-shot en benchmarks del dominio.
- Integración en pipelines de visión con PyTorch: al estar implementado en PyTorch y declarar el pipeline `image-segmentation`, puede integrarse en flujos de inferencia por lotes sobre imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el número de parámetros ni el tamaño de los pesos; el repo figura con 0.0 GB).
- GPU recomendadas: no disponible. Al apoyarse en CLIP y DINOv2/DINOv3, es previsible que requiera una GPU con memoria suficiente para estos componentes, pero no se confirma en la información disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el modelo es de visión y se distribuye en PyTorch).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones numéricas de UniADet en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas de detección de anomalías zero-shot/few-shot. Los modelos comparables habituales en este espacio (por ejemplo, enfoques basados en WinCLIP, AnomalyCLIP o PatchCore) no aparecen referenciados en la información disponible, y no se inventan cifras.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniADet | no disponible | no disponible | no disponible | uniadet-weights (restringida) | Gated en Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es *gated*; es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Licencia propia (`uniadet-weights`): no es una licencia estándar de código abierto, por lo que deben revisarse las condiciones antes de cualquier uso comercial.
- Idiomas: el modelo declara únicamente inglés; no se garantiza soporte para otros idiomas en prompts o etiquetas textuales.
- Documentación escasa: no se publican detalles de arquitectura, entrenamiento, parámetros ni benchmarks, lo que dificulta evaluar su fiabilidad en producción.
- Riesgo de falsos positivos y negativos en detección de anomalías: inherente a los enfoques zero-shot/few-shot, especialmente en dominios muy distintos al de entrenamiento; no se documentan métricas que permitan acotar este riesgo.
- Sesgos: no disponible; no se documentan sesgos conocidos del modelo ni de sus datos de entrenamiento.
- Alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de segmentaciones incorrectas o sobreconfiadas en regiones sin anomalía real.
- Madurez: con 6 descargas y 0 likes, el modelo es muy reciente y con poca validación comunitaria; conviene tratarlo como experimental.
- Restricciones de contexto o resolución: no se especifica la resolución de imagen soportada ni límites de tamaño de entrada.

## Enlaces

- Hugging Face: https://huggingface.co/csgaobb/UniADet
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
