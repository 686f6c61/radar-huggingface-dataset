# nadh0708/Img2LocJakarta2.0

## Resumen

Img2LocJakarta 2.0 es un modelo de geolocalización de imágenes de vista a nivel de calle entrenado específicamente para la ciudad de Yakarta (Indonesia). Lo desarrolla el usuario nadh0708 y se publica en HuggingFace como un fine-tuning del backbone DINOv3 ViT-L/16 de Meta. A diferencia de los modelos de geolocalización que devuelven un único punto, este modelo predice una distribución sobre coordenadas geográficas mediante flow matching condicional: la imagen se codifica con el backbone y una cabeza de velocidad propaga partículas de ruido gaussiano hasta coordenadas lat/lon en WGS-84.

El modelo resuelve el problema de estimar dónde se tomó una fotografía de calle dentro de Yakarta, devolviendo N coordenadas (por defecto 100, hasta 512 en CLI) que representan la distribución predictiva, junto con métricas de incertidumbre como la dispersión RMS en metros y los radios p50/p90. Es relevante porque combina un backbone de visión de última generación (DINOv3) con un paradigma generativo (flow matching) poco habitual en regresión de coordenadas, y porque publica métricas detalladas sobre un test set grande (137.173 imágenes).

El modelo tiene 306.389.526 parámetros, se distribuye en safetensors (1,2 GB de repositorio), procesa imágenes redimensionadas a 256×256 y está limitado al ámbito de imágenes de calle de Yakarta sobre vía primaria. La licencia es la DINOv3 License de Meta, no una licencia open source estándar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-L/16 (encoder) + cabeza de flow matching condicional (velocity MLP con 4 bloques residuales AdaLN, hidden 512) |
| Parametros totales | 306.389.526 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen redimensionada a 256×256) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | id (indonesio; el modelo es de visión, el idioma se refiere al ámbito geográfico/lingüístico del dataset) |
| Licencia | dinov3-license (DINOv3 License de Meta) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `DinoV3CFMRegressor`: un encoder DINOv3 ViT-L/16 afinado de extremo a extremo que produce un token CLS de dimensión 1024, y una cabeza de velocidad `v(y_t, t, cond) -> R^2` que implementa flow matching condicional. La cabeza consta de un MLP de velocidad con 4 bloques residuales con AdaLN y dimensión oculta 512. La inferencia utiliza un sampler de Heun para integrar el flujo desde ruido gaussiano hasta coordenadas. El checkpoint publicado corresponde a la etapa D, época 80, del entrenamiento.

El modelo se entrena sobre el dataset `nadh0708/JKTSV-primary`, con imágenes de vista a nivel de calle de Yakarta sobre vía primaria, ocho orientaciones por localización (0° a 315° en pasos de 45°). El test split completo consta de 137.173 imágenes. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo de regresión visual). La innovación técnica destacable es el uso de flow matching condicional para producir una distribución de coordenadas en lugar de una regresión puntual, lo que permite cuantificar incertidumbre geográfica.

## Capacidades

- Geolocalización de imágenes de vista a nivel de calle dentro de Yakarta: devuelve coordenadas lat/lon en grados WGS-84.
- Predicción distribucional: genera N partículas (coordenadas) que representan la distribución predictiva; por defecto 100, configurable hasta 512 en CLI.
- Cuantificación de incertidumbre: calcula media, dispersión RMS (`sigma_m`), radio p50 y radio p90 en metros.
- Salida en GeoJSON: una feature Point por partícula, con propiedades `image`, `particle` y `error_m` opcional si se proporciona la verdad.
- Procesamiento por lotes: acepta listas de imágenes y devuelve una nube de coordenadas por imagen.
- Reproducibilidad mediante semilla (`seed`) para la nube de partículas.
- Integración con QGIS y geojson.io a través de la salida GeoJSON.
- No soporta tool calling, agentes, multi-step reasoning, texto, audio ni visión general más allá de la geolocalización en Yakarta.

## Casos de uso

- Verificación de metadatos EXIF en imágenes de calle: dado un conjunto de fotos de Yakarta, el modelo estima la ubicación y permite contrastar con las coordenadas declaradas, detectando discrepancias mediante el `error_m` calculado contra la verdad.
- Análisis forense y OSINT: para imágenes de vista a nivel de calle de Yakarta sin geolocalización, el modelo produce una nube de 100-512 coordenadas candidatas con radios p50/p90, útil para acotar áreas de búsqueda en investigaciones.
- Enriquecimiento de datasets de visión: etiquetar automáticamente imágenes de calle de Yakarta con coordenadas y una medida de incertidumbre, filtrando por `sigma_m` bajo para obtener pseudo-etiquetas fiables.
- Cartografía asistida y control de calidad de inventarios viales: procesar lotes de imágenes de vía primaria y generar GeoJSON para su carga en QGIS, identificando zonas con alta dispersión que requieran revisión manual.
- Monitorización de cobertura y cambios urbanos: comparar la distribución predicha para imágenes de una misma zona a lo largo del tiempo, usando la dispersión como indicador de ambigüedad visual.
- Investigación en geolocalización visual: el modelo sirve como baseline reproducible (checkpoint, seed, métricas por percentil) para comparar nuevas técnicas de flow matching o backbones en el dominio de Yakarta.
- Sistemas de navegación y realidad aumentada de ámbito local: estimar la posición aproximada de una imagen de calle para anclar contenido, aceptando la incertidumbre de ~0,4 km mediana como cota de precisión.

## Benchmarks y rendimiento

Evaluación sobre el test split completo de `JKTSV-primary` (137.173 imágenes, 8 orientaciones por localización), con 32 partículas y sampler de Heun. El error es la distancia de círculo máximo (haversine) entre la ubicación real y la media de la nube de partículas.

| Metrica | Valor |
|---|---|
| Error medio | 1,05 km |
| Error mediano | 0,40 km |
| Percentil 75 | 0,82 km |
| Percentil 90 | 2,34 km |
| RMSE | 2,36 km |

| Dentro de | 100 m | 250 m | 500 m | 1 km | 2 km | 5 km |
|---|---|---|---|---|---|---|
| % de imágenes de test | 6,9 | 30,4 | 59,3 | 79,4 | 88,7 | 95,2 |

Evolución del error medio de las partículas a lo largo del tiempo de flujo:

| Tiempo de flujo t | 0,0 | 0,2 | 0,4 | 0,5 | 0,6 | 0,8 | 1,0 |
|---|---|---|---|---|---|---|---|
| Error medio (km) | 11,7 | 8,9 | 3,9 | 2,4 | 1,7 | 1,4 | 1,4 |

Nota del autor: las partículas individuales son más ruidosas que su media, por lo que la media de la nube es el mejor estimador puntual. Las cifras se midieron con 32 partículas, mientras que el valor por defecto de `predict` es 256.

No se han publicado comparaciones con otros modelos de geolocalización en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 306,4 M de parámetros en fp32, los pesos ocupan aproximadamente 1,2 GB; en fp16 unos 0,6 GB. A ello hay que sumar activaciones del ViT-L/16 y las partículas del sampler.
- GPU recomendadas: no se especifican en la información disponible. El autor reporta resultados en CUDA GPU; por tamaño, una GPU con 8-16 GB de VRAM debería ser suficiente para inferencia en fp16/fp32.
- GPU de consumo: el modelo es pequeño (306 M de parámetros) y previsiblemente cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores, aunque no se confirma en la documentación.
- Despliegue: el código de inferencia se distribuye en el propio repositorio (`inference.py`, `modeling_geotag.py`) y requiere clonar la arquitectura DINOv3 desde `facebookresearch/dinov3` en la caché de torch hub. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El sampler de Heun usa por defecto 8 pasos (`steps=8` en la API de bajo nivel).
- CPU: soportada, con la salvedad de que las extracciones aleatorias difieren de las de GPU (media -6,2247, 106,8339 y `sigma_m` 496,2 frente a -6,2246, 106,8335 y 484,3 en CUDA con seed 0).

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables de geolocalización visual para Yakarta ni de resultados de otros sistemas sobre el mismo test set. Por tanto:

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Img2LocJakarta 2.0 | 306,4 M | imagen 256×256 | error medio 1,05 km; mediano 0,40 km | dinov3-license | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ámbito geográfico restringido: solo imágenes de vista a nivel de calle de Yakarta sobre vía primaria. Fuera de ese dominio la predicción no es fiable.
- Sesgo de dominio: el dataset se limita a vía primaria y a ocho orientaciones por localización; imágenes de vías secundarias, interiores o condiciones visuales atípicas pueden degradar la precisión.
- Riesgo de alucinación geográfica: el modelo siempre devuelve coordenadas, incluso para imágenes que no corresponden a Yakarta; no hay mecanismo documentado de rechazo o detección fuera de dominio.
- Precisión limitada: el error mediano es de 0,40 km y solo el 6,9 % de las imágenes caen dentro de 100 m; no es adecuado para aplicaciones que requieran precisión métrica.
- Dependencia de la media de la nube: las partículas individuales son más ruidosas que su media; usar una sola partícula como estimación puntual empeora el resultado.
- Reproducibilidad parcial: los resultados dependen de la semilla y difieren entre CPU y GPU.
- Restricciones de licencia: la DINOv3 License de Meta no es una licencia open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial o redistribución.
- Dependencia de código externo: la primera ejecución clona la arquitectura DINOv3 desde el repositorio de Facebook Research, lo que introduce una dependencia de red y de la disponibilidad de ese repositorio.
- Idiomas: el modelo es de visión y no procesa texto; la etiqueta de idioma `id` refleja el ámbito del dataset, no una capacidad multilingüe.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se documentan procesos de validación externos.

## Enlaces

- HuggingFace: https://huggingface.co/nadh0708/Img2LocJakarta2.0
- Dataset de entrenamiento: https://huggingface.co/datasets/nadh0708/JKTSV-primary
- Modelo base: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Repositorio de arquitectura DINOv3: https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license
- Paper referenciado (arXiv:2508.10104): https://arxiv.org/abs/2508.10104
