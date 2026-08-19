# mackop102/sat_roma

## Resumen

SAT-RoMa es un modelo de correspondencia densa (dense matching) para imágenes aéreas y satelitales, desarrollado por Maciej Krupka, Jan Wegrzynowski y Piotr Skrzypczyński. Su propósito principal es la localización de una imagen de consulta pequeña (por ejemplo, un fotograma de dron) dentro de un mapa de referencia más amplio que cubre el mismo terreno y con la misma resolución de suelo (GSD). Este enfoque resuelve problemas de localización en entornos sin GPS (GPS-denied), un caso crítico en robótica aérea y vigilancia.

El modelo se publica como pesos de decoder únicamente, sobre un backbone DINOv3 ViT-L/16 congelado que se descarga por separado mediante `timm`. La arquitectura se basa en el trabajo previo RoMa (CVPR 2024) y se adapta específicamente al régimen satelital/aéreo. Se ofrecen tres checkpoints, cada uno optimizado para un escenario distinto: localización de dron en mapa precargado (con y sin tolerancia a inclinación) y búsqueda aérea de gran área. La resolución de inferencia es fija (224 px para la consulta y 896 px para la referencia).

La relevancia actual de SAT-RoMa radica en que aborda la localización visual de alta precisión sin depender de infraestructura GNSS, con errores medios de esquina del orden de 4 a 5 metros en el régimen de dron-en-mapa, y una mediana de 14,2 metros en búsqueda de gran área. El código de inferencia y la documentación completa están disponibles en un repositorio público de GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder sobre backbone DINOv3 ViT-L/16 congelado (basado en RoMa) |
| Parametros totales | No disponible (el decoder pesa ~322 MB por checkpoint; el backbone DINOv3 ViT-L/16 no se redistribuye) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, sin contexto de texto) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | MIT para los pesos del decoder; el backbone DINOv3 se rige por la licencia de Meta (facebookresearch/dinov3) |
| Formato de pesos | safetensors (decoder) + config JSON |

## Arquitectura y entrenamiento

SAT-RoMa emplea un backbone DINOv3 ViT-L/16 congelado, cuyos pesos se obtienen mediante `timm` (`vit_large_patch16_dinov3.sat493m`) en el momento de construir el modelo. Sobre este backbone se entrena un decoder de correspondencia densa, inspirado en RoMa, que predice flujos densos y certezas asociadas entre la imagen de consulta y la imagen de referencia. La resolución de inferencia está fijada en 224 px para la imagen de consulta (im_A) y 896 px para la referencia (im_B), con normalización satelital (`sat_normalize=True`).

Se publican tres checkpoints, cada uno con su configuración de preprocesamiento registrada en un archivo JSON:

- `sat_roma_4adxis71_decoder`: entrenado para el régimen dron-en-mapa precargado (~4x de relación de escala), con un error medio de esquina de ~4,27 m en el split de prueba planar. No es invariante a la inclinación de la cámara.
- `sat_roma_hir0vdf6_decoder`: mismo régimen que el anterior, con error medio de ~4,83 m en planar y ~4,86 m con inclinación de ±30°, mostrando degradación suave bajo inclinación.
- `sat_roma_0t1q66hy_decoder`: diseñado para búsqueda aérea de gran área (referencias de 500–1500 m, relación de escala 1:2–1:8), con error mediano de ~14,2 m y media de 51,4 m (cola pesada; 67% de las predicciones dentro de 20 m).

No se proporcionan detalles sobre el dataset de entrenamiento, número de tokens o pasos de optimización. El modelo se basa en el trabajo de RoMa (Edstedt et al., CVPR 2024) y se menciona que el código de inferencia ha sido validado end-to-end en un par de imágenes, con resultados consistentes con los documentados, aunque no se ha realizado una verificación numérica exhaustiva contra el código de investigación original.

## Capacidades

- Correspondencia densa entre una imagen de consulta pequeña y una imagen de referencia más grande, ambas aéreas/satelitales con la misma GSD.
- Estimación de homografías y warps densos entre pares de imágenes, con salida de certezas por píxel.
- Localización de fotogramas de dron dentro de un mapa precargado, útil para navegación sin GPS.
- Búsqueda de área a gran escala (referencias de 500 a 1500 metros), con tolerancia a relaciones de escala variables (1:2 a 1:8).
- Robustez a cambios temporales (cross-temporal), según el título del paper, aunque no se detallan experimentos específicos.
- Manejo de inclinación de cámara en el checkpoint `hir0vdf6`, con degradación suave hasta ±30°.
- Integración con el ecosistema PyTorch y `timm`, con API Python y CLI (`sat-roma-match`).
- No incluye capacidades de texto, visión general (más allá de imágenes aéreas), ni tool calling.

## Casos de uso

- Navegación autónoma de drones en entornos sin GPS: el dron captura un fotograma y SAT-RoMa lo localiza dentro de un mapa ortofoto precargado, permitiendo corrección de trayectoria con errores de pocos metros.
- Vigilancia y monitorización de infraestructuras: comparar una imagen aérea reciente con una referencia histórica para detectar cambios o anomalías, gracias a su robustez cross-temporal.
- Búsqueda y rescate: localizar la posición aproximada de un dron de reconocimiento en una zona extensa usando un mapa de referencia de gran área, con el checkpoint `0t1q66hy`.
- Georreferenciación de imágenes aéreas sin metadatos: dado un fotograma sin coordenadas, el modelo estima su posición dentro de un mosaico satelital, útil para catalogación de archivos de imágenes.
- Verificación de cobertura de vuelo: comparar la imagen de un vuelo con el mapa planificado para confirmar que se ha sobrevolado toda el área de interés.
- Fusión de datos multi-fuente: alinear imágenes de diferentes sensores (dron, satélite) con la misma GSD para generar productos cartográficos o modelos 3D.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados de error de esquina (corner error) para cada checkpoint, medidos en metros:

| Checkpoint | Regimen | Error medio (planar) | Error con inclinacion ±30° | Notas |
|---|---|---|---|---|
| `4adxis71` | Dron en mapa precargado (~4x) | ~4,27 m | No aplica | No tilt-invariant |
| `hir0vdf6` | Dron en mapa precargado (~4x) | ~4,83 m | ~4,86 m | Degradacion suave |
| `0t1q66hy` | Busqueda aerea de gran area | ~51,4 m (media) | No aplica | Mediana ~14,2 m; 67% dentro de 20 m |

No se han publicado comparaciones con otros modelos de matching denso (como RoMa, LoFTR, etc.) en la información disponible. Los resultados corresponden a un split de prueba planar para los dos primeros checkpoints y a un régimen diferente para el tercero, por lo que no son directamente comparables entre sí.

## Requisitos de hardware

- Los pesos del decoder ocupan ~322 MB por checkpoint en formato safetensors (presumiblemente FP32). El backbone DINOv3 ViT-L/16 añade aproximadamente 300 millones de parámetros, lo que en FP32 supone unos 1,2 GB adicionales.
- Para inferencia en FP32 se estima un uso de VRAM de entre 2 y 4 GB, dependiendo de la resolución de las imágenes de entrada (224x224 y 896x896). Con cuantización a FP16 o int8, el consumo podría reducirse a 1-2 GB.
- Es viable en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 o superiores. También en GPUs de datacenter como A100 o H100, aunque no son necesarias para este modelo.
- Opciones de despliegue: el repositorio proporciona una API Python (`SatRoMaMatcher`) y una CLI (`sat-roma-match`). No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- La latencia dependerá del hardware; no se proporcionan datos específicos de throughput. En una GPU moderna, un par de imágenes debería procesarse en decenas de milisegundos, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de comparativas publicadas entre SAT-RoMa y otros modelos de matching denso. Como referencia cualitativa:

- **RoMa** (Edstedt et al., CVPR 2024): el modelo base sobre el que se construye SAT-RoMa. RoMa trabaja con pares de imágenes de propósito general, mientras que SAT-RoMa está especializado en imágenes aéreas/satelitales y en el régimen de localización de consulta pequeña en mapa grande.
- **LoFTR** (Sun et al., CVPR 2021): otro matcher denso popular, pero sin adaptación específica a imágenes satelitales y sin soporte para búsqueda de gran área con escalas variables.
- **SuperPoint + SuperGlue** (DeTone et al., 2018; Sarlin et al., 2020): enfoque de matching por puntos de interés, menos robusto en texturas repetitivas o cambios temporales que un método denso como SAT-RoMa.

No hay datos numéricos de comparación disponibles en la información proporcionada.

## Limitaciones y advertencias

- El backbone DINOv3 no está incluido en los pesos distribuidos; debe descargarse por separado mediante `timm`, y su uso está sujeto a la licencia de Meta (facebookresearch/dinov3), que puede tener restricciones adicionales para uso comercial.
- La licencia MIT solo cubre los pesos del decoder y el código de inferencia del repositorio de GitHub, no el backbone.
- El checkpoint `4adxis71` no es invariante a la inclinación de la cámara; si se esperan tomas inclinadas, debe usarse `hir0vdf6`.
- El checkpoint `0t1q66hy` presenta una cola pesada en el error (media 51,4 m vs mediana 14,2 m), lo que implica que algunas predicciones pueden ser muy imprecisas.
- La validación numérica completa contra el código de investigación original no se ha realizado; solo se ha verificado un par de imágenes end-to-end. Los resultados deben tratarse como consistentes con la documentación, no como certificados bit-exactos.
- No se proporcionan datos sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos geográficos o de condiciones atmosféricas.
- La resolución de inferencia es fija (224/896 px); no se soporta entrada de mayor resolución sin reentrenamiento o adaptación.
- El modelo está diseñado exclusivamente para imágenes aéreas/satelitales con la misma GSD; su uso en otros dominios (fotografías terrestres, imágenes de interior) no está contemplado.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/mackop102/sat_roma
- Repositorio de código e inferencia: https://github.com/macnack/sat_roma_infer
- Paper (ACIVS 2026, por aparecer): citado en la model card como `@inproceedings{krupka2026satroma`
- Proyecto base RoMa: https://github.com/Parskatt/RoMa
- Licencia del backbone DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
