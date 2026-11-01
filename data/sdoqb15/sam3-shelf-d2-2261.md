# sdoqb15/sam3-shelf-d2-2261

## Resumen

SAM3 Shelf D2 (checkpoint de entrega, paso 2261) es un ajuste fino del modelo de segmentación Segment Anything Model 3 (SAM3) de Meta, especializado en la segmentación de instancias de unidades de venta completas sobre estanterías de supermercado y almacén. Lo publica el usuario sdoqb15 como un `Sam3Model` completo en formato Hugging Face, no como adaptador LoRA ni como tracker de vídeo, y se apoya en un prompt de texto fijo (`an object on the shelf`) para generar máscaras a resolución nativa.

El problema que aborda es concreto: el SAM3 original tiende a fragmentar los multipacks envueltos en film transparente en sus unidades internas, o a devolver solo una parte del paquete, y su ordenación por score no prioriza de forma consistente el artículo exterior completo y actualmente expuesto. En un pipeline de robótica de picking, donde las máscaras se recortan, se embeben y se comparan contra una base vectorial de SKU, una máscara incompleta o mezclada arruina la representación de apariencia y la estimación de la región de agarre.

El modelo entrena únicamente 24.529.462 parámetros sobre un total de 840.376.374 (el codificador DETR, el decodificador DETR, el decodificador de máscaras y los módulos de scoring/presencia), manteniendo congelados visión, texto y el resto de componentes. Se distribuye con licencia SAM y soporta inglés y chino en la documentación y metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (SAM3: codificador de imagen + codificador de texto + DETR encoder/decoder + mask decoder) |
| Parametros totales | 840.376.374 |
| Parametros activos | no disponible (no es MoE) |
| Parametros entrenables | 24.529.462 |
| Longitud de contexto | no disponible (modelo de visión; prompt de texto fijo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | SAM (license: other, license_name: sam) |
| Formato de pesos | safetensors (repo de 1,7 GB) |
| Pipeline | mask-generation |
| Modelo base | facebook/sam3 (finetune) |
| Dataset de entrenamiento | sdoqb15/sam3-shelf-data (acceso restringido) |
| SHA256 de pesos | fef9906a67ed8fe3c93e402a7345e7318ad1b32c6081dc4828fb32feee7c5fb0 |

## Arquitectura y entrenamiento

El modelo parte de SAM3 original y aplica un ajuste fino parcial: solo se actualizan el codificador DETR, el decodificador DETR, el decodificador de máscaras y los módulos de scoring y presencia, sumando 24.529.462 parámetros entrenables. Los módulos de visión y texto permanecen congelados, y no se emplea LoRA. El entrenamiento usa AdamW con LR 1e-5, schedule coseno de 2380 actualizaciones, 5 % de warmup, LR final 1e-6, weight decay 1e-4, gradient clipping 1.0, batch efectivo 4 y semilla 42, sin aumentación de datos.

La supervisión combina ground truth humana con destilación de profesor. Las queries que coinciden con GT reciben supervisión de detección y segmentación; las no coincidentes se tratan como negativos focales de fondo, salvo dos casos protegidos: candidatos del profesor SAM3 original con score ≥ 0,90 y GT-safe reciben preservación suave de máscara, caja y score con peso 0,25, y candidatos con score entre 0,85 y 0,90 y GT-safe se marcan como desconocidos sin destilación ni negativo. La seguridad respecto a GT exige que la intersección sobre el área del profesor y sobre cada área de GT sea ≤ 0,02; la asociación geométrica usa IoU ≥ 0,5 y se supervisan como máximo 32 candidatos del profesor. El pool de entrenamiento son 1824 imágenes con 4156 GT (600 multiproducto y 1224 monoproducto), con peso de muestreo 8 para multiproducto y 1 para monoproducto; validación con 72 imágenes y 362 GT nunca vistas en entrenamiento, más 162 imágenes de regresión y 35 suplementarias anotadas incluidas tras deduplicación.

## Capacidades

- Segmentación de instancias por prompt de texto fijo (`an object on the shelf`) sobre imágenes de estanterías.
- Generación de máscaras a resolución nativa con scores asociados por candidato.
- Recuperación de unidades de venta completas, incluidos multipacks transparentes anotados como una sola instancia GT.
- Ordenación de candidatos que prioriza unidades completas y actualmente expuestas frente a fragmentos o fusiones.
- Capacidad de segmentar artículos interiores que quedan expuestos tras retirar la fila frontal.
- Conservación de máscaras independientes de artículos traseros cuando resultan útiles.
- Soporte de eliminación de máscaras vacías y NMS de duplicados cercanos (IoU > 0,98) en el pipeline de inferencia del proyecto asociado.
- Idiomas de documentación y metadatos: inglés y chino.
- No es un tracker de vídeo ni un adaptador; es un checkpoint completo de `Sam3Model`.

## Casos de uso

- **Picking robótico en almacén**: el modelo propone máscaras de unidades de venta completas que se recortan, se embeben y se comparan contra una base vectorial de SKU para seleccionar el candidato correcto antes de estimar la región de agarre. Su entrenamiento específico en ranking de candidatos completos reduce el trabajo de procesamiento posterior.
- **Auditoría de planogramas en retail**: a partir de una foto de estantería, se generan máscaras por instancia para verificar la presencia y posición de cada SKU respecto al planograma, aprovechando la capacidad de recuperar paquetes completos en lugar de fragmentos.
- **Control de inventario automatizado**: cámaras montadas en estanterías o robots capturan imágenes periódicas; el modelo segmenta cada unidad visible para contar referencias y detectar huecos, incluyendo la reaparición de artículos interiores al retirarse la fila frontal.
- **Generación de datasets de retail**: el modelo puede usarse como anotador automático de imágenes de estantería para preetiquetar máscaras de instancia, que luego se revisan manualmente, acelerando la creación de datasets de segmentación en dominios de supermercado y almacén.
- **Análisis de exposición de producto**: las máscaras permiten medir el área visible de cada unidad y estimar el espacio de facings ocupado por cada SKU en la estantería, con máscaras a resolución nativa que preservan el detalle del envase.
- **Integración en pipelines de visión con Transformers**: al ser un checkpoint `Sam3Model` estándar, puede cargarse con la librería `transformers` y encadenarse con otros modelos de embedding o clasificación para construir sistemas de reconocimiento de producto de extremo a extremo.
- **Manejo de multipacks y envases transparentes**: escenario específico para el que fue entrenado, donde el SAM3 base falla al separar el film transparente en sus contenidos; útil en categorías como bebidas, latas o productos agrupados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica que el checkpoint seleccionado es el paso 2261 de la rama D2, y que el mejor checkpoint de validación fue el paso 714, pero no se proporcionan métricas numéricas de validación, comparativas con SAM3 base ni resultados de mIoU, recall o precisión de ranking.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 3,4 GB solo para pesos (840 M de parámetros), más memoria de activaciones para el codificador de imagen a resolución de entrada; en la práctica, se recomienda al menos 8-12 GB de VRAM para imágenes de tamaño habitual.
- En FP16/BF16: aproximadamente 1,7 GB para pesos, más activaciones; cabe en GPUs consumer con 8 GB o más.
- GPUs recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 para lotes grandes o throughput alto; RTX 3060/4060 Ti con 8-12 GB para inferencia individual.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más de VRAM en precisión reducida.
- Opciones de despliegue: `transformers` (carga nativa como `Sam3Model`), y potencialmente servidores compatibles con endpoints de Hugging Face (el tag `endpoints_compatible` está presente). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / prompt | Licencia | Disponibilidad | Especialización |
|---|---|---|---|---|---|
| sdoqb15/sam3-shelf-d2-2261 | 840,4 M (24,5 M entrenables) | Prompt de texto fijo `an object on the shelf` | SAM | Hugging Face, 22 descargas | Segmentación de estanterías y unidades de venta |
| facebook/sam3 | no disponible en la información | Prompt de texto genérico | SAM | Hugging Face (modelo base) | Segmentación de propósito general |
| sdoqb15/sam3-shelf-c7a-2380 | no disponible en la información | Prompt de texto fijo | SAM | Hugging Face (modelo acompañante) | Segmentación de estanterías, mismo método con pool menor |

El modelo acompañante C7-A comparte método de entrenamiento conjunto con D2 pero usa un pool de datos más pequeño; D2 no se inicializa desde C7-A, sino que ambos parten de SAM3 original de forma independiente. No se dispone de datos de benchmarks para comparar rendimiento entre ellos.

## Limitaciones y advertencias

- Las anotaciones del dataset son parciales: cubren principalmente las unidades de venta exteriores visibles, no todos los objetos de la imagen, lo que puede infrarepresentar instancias interiores o parcialmente ocultas.
- El modelo está entrenado para un prompt de texto fijo; no se garantiza un comportamiento correcto con otros prompts.
- Los scores de segmentación no predicen directamente la alcanzabilidad física ni el éxito de agarre; la model card no reclama mejoras en tasa de éxito de agarre a partir de las métricas de segmentación.
- El objetivo es mejorar la recuperación y el ranking de candidatos completos, no garantizar que todos los candidatos sean correctos.
- El checkpoint publicado es el paso 2261 de la rama D2, no el mejor checkpoint de validación (paso 714), lo que puede implicar un rendimiento distinto al óptimo medido en validación.
- Licencia SAM con restricciones específicas; es necesario revisar el archivo LICENSE del repositorio antes de un uso comercial.
- El dataset de entrenamiento es privado y requiere autorización del propietario, lo que limita la reproducibilidad completa del entrenamiento.
- No se documentan sesgos específicos, pero al estar entrenado en colecciones internas de retail y almacén, su generalización a otros dominios visuales no está caracterizada.
- El pipeline estándar de `transformers` no aplica automáticamente el archivo `operating_point.json`; para reproducir las métricas reportadas hay que usar la ruta de inferencia del proyecto asociado, con eliminación de máscaras vacías y NMS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sdoqb15/sam3-shelf-d2-2261
- Modelo acompañante: https://huggingface.co/sdoqb15/sam3-shelf-c7a-2380
- Código asociado: https://github.com/sdoqb15/sam3_shelf
- Definición del problema: https://github.com/sdoqb15/sam3_shelf/blob/main/docs/problem_statement.md
- Dataset (acceso restringido): https://huggingface.co/datasets/sdoqb15/sam3-shelf-data
- Licencia: https://huggingface.co/sdoqb15/sam3-shelf-d2-2261/blob/main/LICENSE
- Modelo base: https://huggingface.co/facebook/sam3
- Paper de referencia: arxiv:2511.16719
