# FabriThomas/SteelyScanner

## Resumen

SteelyScanner es un pipeline híbrido de visión por computador orientado a la identificación automática de componentes de hardware de PC (GPU, CPU, placa base, RAM, fuente de alimentación, refrigeración, ventiladores y chasis). Lo desarrolla FabriThomas (Fabrício Notoya Thomas) en el marco del Proyecto Steely de la Escola de TI de UniCesumar (Brasil). No es un modelo único, sino un sistema encadenado de tres etapas: pre-OCR determinista, detección de objetos con YOLO11s y clasificación jerárquica L1–L5 con un backbone ConvNeXt-Small y un espacio métrico ArcFace de 512 dimensiones.

El problema que resuelve es concreto: convertir una foto de hardware, incluso dentro de una caja cerrada con cristal ahumado y reflejos, en un JSON estructurado con fabricante, categoría, modelo/SKU y especificaciones técnicas, además de validar la compatibilidad física entre componentes detectados. Está pensado para alimentar el marketplace Steely mediante un endpoint `/scan_to_listing` que genera borradores de anuncios.

El repositorio en Hugging Face ocupa 3,2 GB y contiene pesos en formato ONNX. La información pública disponible es la model card del autor; no hay pipeline declarado, ni licencia explícita en los metadatos de Hugging Face, ni idiomas declarados. La fecha de creación del repo es 2026-11-27.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido encadenado: RapidOCR DBNet (CPU) + YOLO11s (detección) + ConvNeXt-Small (clasificación jerárquica L1–L5) + ArcFace 512-D |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el autor menciona ejecución con `onnxruntime-directml` y Opset 17) |
| Idiomas soportados | no disponible (el OCR y el diccionario fonético están orientados a part numbers y texto técnico en inglés) |
| Licencia | MIT según la model card; no declarada en los metadatos de Hugging Face |
| Formato de pesos | ONNX (Opset 17) |

## Arquitectura y entrenamiento

El sistema se organiza en tres etapas estrictas. La etapa 0 realiza pre-OCR en alta resolución (hasta 2000 px) con RapidOCR DBNet aislado en `CPUExecutionProvider`, aplicando rotaciones de 90°, 180° y 270° y un barrido radial de ±40° en los hubs de ventiladores, seguido de un diccionario fonético y un decodificador de part numbers (`ocr_autocorrect.py`). La etapa 1 es un detector YOLO11s afinado de 640 px a 1024 px que localiza ocho clases: gpu, cpu, motherboard, ram, psu, cpu_cooler, case_fan y case_chassis. La etapa 2 recorta cada componente, lo redimensiona a 384×384 px y lo pasa por un backbone ConvNeXt-Small (`fb_in22k_ft_in1k_384`) con cabezas jerárquicas L1–L4 calibradas por temperature scaling, un espacio métrico ArcFace de 512 dimensiones con sub-centroides multimodales K=5 y una matriz de validación cruzada física (AM4→DDR4, socket→bracket, balance de vatios).

El entrenamiento parte de 2.119 imágenes reales preprocesadas (eliminación de EXIF, filtro laplaciano de nitidez ≥ 35,0, conversión a WebP al 92 % y autoanotación con un VLM Schema V4). El split es 80/10/10 agrupado por post de origen y clúster de pHash de 64 bits con distancia de Hamming ≤ 4 para evitar fugas. El dataset se amplía con recolección autónoma y canonicalización TechPowerUp entre 2008 y la actualidad: 140 clases canónicas de GPU (70.004 recortes), 175 de CPU y refrigeración (17.500), 156 de placa base (15.600), 70 de RAM (17.500), 42 de PSU (10.500) y 35 de chasis (8.750). La recolección estratifica siete franjas de precio en Mercado Livre y OLX con un déficit de 50 fotos reales por SKU. Finalmente se aplica aumento sintético con homografía 3D (tilt/pitch ±25°, yaw ±20°, roll ±12°) hasta 500 instancias por clase.

## Capacidades

- Detección de objetos de hardware en ocho clases dentro de imágenes de PC, incluyendo componentes montados en cajas cerradas con cristal ahumado, reflejos y cableado interno.
- Pre-OCR determinista con corrección fonética y decodificación de part numbers sobre texto técnico de componentes.
- Clasificación jerárquica en cuatro niveles: categoría (L1), marca (L2), generación (L3) y modelo/tier (L4).
- Recuperación métrica de instancias mediante embeddings ArcFace de 512 dimensiones con sub-centroides K=5 (L5, Recall@3).
- Validación cruzada de compatibilidad física entre componentes detectados (socket, tipo de memoria, anclaje de refrigeración, balance de potencia).
- Generación de JSON estructurado y borrador de anuncio de marketplace a partir de una foto.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo; es un pipeline de visión especializado, no un modelo generativo de propósito general.

## Casos de uso

- Publicación automática de anuncios en marketplaces de segunda mano: el usuario sube una foto de su GPU o placa base y el pipeline devuelve título, fabricante, categoría, SKU y especificaciones, reduciendo el tiempo de creación de listados y los errores de categorización.
- Verificación de compatibilidad antes de una compra: a partir de fotos de placa base, RAM y refrigeración, el sistema aplica la matriz de validación física (AM4→DDR4, furación 90×54 mm) y advierte de incompatibilidades.
- Inventario de stock en tiendas de componentes: fotografiar estanterías o lotes y obtener un JSON con categoría, marca y modelo por unidad para conciliar inventario.
- Moderación y control de calidad de anuncios: detectar si la categoría declarada por el vendedor coincide con el componente realmente fotografiado (por ejemplo, una GPU listada como placa base).
- Asistencia al montaje y soporte técnico: identificar los componentes visibles dentro de una caja y comprobar el balance de potencia entre PSU y el resto del sistema.
- Digitalización de catálogos técnicos: extraer part numbers y modelos de etiquetas y serigrafías mediante la etapa de pre-OCR y el decodificador fonético, alimentando bases de datos de SKU.
- Automatización de peritajes académicos o de laboratorio: clasificación estandarizada de hardware recolectado en proyectos de investigación, con trazabilidad por niveles L1–L5.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. El conjunto de evaluación es un held-out independiente; no se especifica su tamaño.

| Componente | Metrica | Valor | Umbral de aceptacion |
|---|---|---|---|
| YOLO11s (etapa 1) | mAP@50 | 81,16 % | ≥ 70,0 % |
| YOLO11s (etapa 1) | mAP@50-95 | 61,75 % | ≥ 50,0 % |
| YOLO11s (etapa 1) | Precision global | 82,31 % | ≥ 75,0 % |
| YOLO11s (etapa 1) | Recall global | 73,11 % | ≥ 70,0 % |

Clasificadores jerárquicos ConvNeXt-Small (top-1 por nivel):

| Nivel | GPU | CPU/Cooler | Placa base | RAM |
|---|---|---|---|---|
| L1 (categoría) | 100,0 % | 97,9 % | 99,4 % | 100,0 % |
| L2 (marca) | 99,9 % | 94,9 % | 96,2 % | 97,8 % |
| L3 (generación) | 99,2 % | 66,7 % (IHS Gen) | 91,5 % | 94,1 % |
| L4 (modelo/tier) | 98,1 % | 68,3 % | 88,4 % | 92,0 % |
| L5 (Recall@3, K=5) | no disponible en el extracto | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks para los especialistas de PSU y chasis, ni comparaciones con modelos de referencia externos.

## Requisitos de hardware

- El autor reporta ejecución en una GPU local AMD Radeon RX 9060 XT con 12 GB de VRAM mediante `onnxruntime-directml` (`DmlExecutionProvider`, Opset 17) y precalentamiento de shaders HLSL.
- El OCR DBNet se aísla en CPU (`CPUExecutionProvider`) para evitar recompilaciones de shader dinámico y suspensiones TDR de Windows (código `887A0005`).
- El repositorio pesa 3,2 GB en ONNX; la VRAM real necesaria para el detector y el clasificador no se detalla en la información disponible.
- No se especifican GPU NVIDIA recomendadas (A100, H100, RTX 4090) ni requisitos mínimos de CPU o RAM del sistema.
- Opciones de despliegue: `onnxruntime` con DirectML en Windows; el uso con vLLM, llama.cpp, Ollama o TGI no aplica, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables con otros pipelines de identificación de hardware en la información proporcionada. Como referencia cualitativa de los componentes empleados:

| Sistema | Detector | Clasificador | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SteelyScanner | YOLO11s fine-tune 1024 px | ConvNeXt-Small + ArcFace 512-D | 8 clases de objeto; 140 GPU, 175 CPU, 156 placa base, 70 RAM, 42 PSU, 35 chasis | MIT (según model card) | Hugging Face, ONNX |
| YOLO11s genérico | YOLO11s COCO | no aplica | 80 clases COCO (sin hardware de PC) | AGPL-3.0 (Ultralytics) | Ultralytics |
| ConvNeXt-Small ImageNet | no aplica | ConvNeXt-Small `fb_in22k_ft_in1k_384` | 1.000 clases ImageNet | MIT (timm) | Hugging Face |

La comparación cuantitativa con alternativas especializadas en hardware no está disponible.

## Limitaciones y advertencias

- El propio autor excluye del alcance el hardware móvil o integrado (portátiles, chips BGA soldados, smartphones).
- La lectura de texto con oclusión mecánica superior al 80 % no está garantizada sin pistas adicionales del usuario.
- No es apto para peritaje forense ni para autenticidad física interna de circuitos integrados (delidded).
- El clasificador de CPU/Cooler muestra un rendimiento claramente inferior en L3 (66,7 %) y L4 (68,3 %), lo que limita la identificación fina de generación y modelo en ese dominio.
- El entrenamiento se apoya en recolección de marketplaces brasileños (Mercado Livre, OLX) y en canonicalización TechPowerUp; el sesgo hacia ese catálogo y esas condiciones de fotografía puede reducir la generalización a otras regiones o fuentes.
- La licencia MIT figura en la model card, pero no está declarada en los metadatos de Hugging Face; conviene verificar los términos antes de un uso comercial.
- No hay información sobre sesgos demográficos, tasas de alucinación (no aplica a un pipeline discriminativo) ni sobre robustez frente a imágenes sintéticas o manipuladas.
- El soporte de ejecución documentado está centrado en Windows con DirectML; el rendimiento en Linux con CUDA u otros backends no está descrito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FabriThomas/SteelyScanner
- Model card original (referencia citada): incluida en la página de Hugging Face del modelo
- Proyecto Steely, Escola de TI, UniCesumar: no disponible
- Paper o blog técnico del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
