# cubert-gmbh/efficient-track-anything

## Resumen

`cubert-gmbh/efficient-track-anything` es un espejo (mirror) byte-idéntico del repositorio `yunyangx/efficient-track-anything`, que contiene los pesos del modelo EfficientTAM (Efficient Track Anything). EfficientTAM es un modelo de segmentación de objetos en video desarrollado por Yformer y sus colaboradores, diseñado para abordar el problema del seguimiento y segmentación de cualquier objeto en secuencias de vídeo con una eficiencia notablemente superior a la de SAM 2. El modelo parte de un encoder de imagen ViT ligero (ViT-Small o ViT-Tiny) y añade una memoria de cross-attention eficiente para capturar información temporal. Está entrenado sobre los datasets SA-1B (imágenes) y SA-V (vídeos), y logra un rendimiento comparable al de SAM 2 con una carga computacional reducida. Este mirror está mantenido por Cubert GmbH y sirve para abastecer de pesos a los plugins de Cuvis.AI en entornos sin conexión.

El repositorio aloja cuatro ficheros de pesos en formato PyTorch con dos tamaños de modelo (`efficienttam_ti` y `efficienttam_s`) ambos disponibles en resoluciones nativa y 512x512. No se trata de un modelo de lenguaje, sino de un modelo de visión aplicable a tareas de segmentación de vídeo y seguimiento de objetos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientTAM (encoder ViT ligero + memoria cross-attention) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (PyTorch) |

| Fichero | Tamano | Resolucion |
|---|---|---|
| efficienttam_ti.pt | 71.6 MB | nativa |
| efficienttam_ti_512x512.pt | 71.6 MB | 512x512 |
| efficienttam_s.pt | 136.4 MB | nativa |
| efficienttam_s_512x512.pt | 136.4 MB | 512x512 |

## Arquitectura y entrenamiento

EfficientTAM revisita la arquitectura de SAM 2 para mejorar la eficiencia. En lugar de un encoder jerárquico pesado, utiliza un encoder de imagen ViT normal y ligero (ViT-Small o ViT-Tiny) para la extracción de características. Para el manejo de la información temporal, se propone una memoria de cross-attention eficiente que sustituye a la memoria basada en transformadores de SAM 2, reduciendo la latencia y el coste computacional sin sacrificar en exceso la calidad de la segmentación.

El modelo ha sido entrenado sobre los datasets SA-1B (imágenes) y SA-V (vídeos), lo que le permite realizar tanto segmentación de imágenes como segmentación de objetos en vídeo. En el repositorio de referencia se indica que EfficientTAM alcanza un rendimiento comparable al de SAM 2 con una eficiencia mejorada. No se detallan valores concretos de tokens, procedimientos de RLHF ni otras técnicas de alineamiento, ya que es un modelo puramente perceptivo.

## Capacidades

- Segmentación de objetos en imágenes y vídeo a partir de prompts (puntos, cajas o máscaras).
- Seguimiento de objetos en secuencias de vídeo ("track anything"), manteniendo la identidad del objeto a lo largo del tiempo.
- Generación de máscaras binarias de alta calidad para el objeto seleccionado.
- Procesamiento de vídeo con memoria temporal eficiente, apta para aplicaciones en tiempo real.
- Dos tamaños de modelo: `efficienttam_ti` (ViT-Tiny, más ligero) y `efficienttam_s` (ViT-Small, mayor calidad).
- Soporte para resoluciones de entrada nativa y 512x512.
- Compatibilidad con el entorno de despliegue de Cuvis.AI a través de `download-model` y `ModelWeights.resolve`.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales de lenguaje.

## Casos de uso

- Seguimiento de objetos en vídeo para vigilancia: el modelo puede rastrear personas, vehículos u otros objetos a través de una secuencia de vídeo, generando máscaras precisas. Su eficiencia permite ejecutarlo en sistemas con GPUs modestas o incluso en flujos de vídeo en directo.
- Edición de vídeo y postproducción: segmentar un objeto en todos los fotogramas de una escena para aplicar efectos, retoques de color o composición sobre una máscara consistente y estable.
- Agricultura de precisión: seguimiento de animales, plantas o plagas en vídeos de campo, facilitando análisis de movimiento o recuento automático sin necesidad de segmentación por cuadros de forma manual.
- Análisis de vídeo médico: segmentación de estructuras o regiones de interés en secuencias de exploraciones o endoscopias, donde el seguimiento temporal de la misma estructura es crítico.
- Robótica y navegación autónoma: permitir que un robot identifique y siga un objeto objetivo en su campo de visión, incluso si este se mueve o se ocluye durante la secuencia.
- Procesamiento de imágenes hiperspectrales en entornos de Cuvis.AI: el mirror se usa para abastecer de pesos a los plugins `cuvis-ai-rtsam2`, permitiendo workflows de segmentación en pipelines sin conexión y sin necesidad de tokens de Hugging Face.
- Análisis deportivo: seguimiento de jugadores o balones en partidos grabados, generando métricas de trayectoria y movimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de referencia indica que EfficientTAM logra un rendimiento comparable a SAM 2 con una eficiencia mejorada, pero no se aportan cifras concretas de métricas como J&F (Jaccard + F-measure) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Dado que los pesos ocupan entre 71.6 MB y 136.4 MB y la arquitectura usa ViT-Tiny/ViT-Small, es probable que el modelo quepa en GPUs de consumo con 4-6 GB de VRAM, e incluso sea ejecutable en CPU para propósitos no tiempo-real.
- GPU recomendadas: prácticamente cualquier GPU moderna (RTX 20xx o superior) debería ser suficiente; se recomienda una RTX 3060 o mejor para vídeo en tiempo real.
- Ejecución en consumer GPU: sí, aunque no se aportan mediciones oficiales de throughput o latencia.
- Opciones de despliegue: a través del repositorio original de EfficientTAM en GitHub, mediante `download-model` de `cuvis-ai-core` para entornos Cuvis.AI, o cargando los ficheros `.pt` directamente con PyTorch en un script personalizado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|
| EfficientTAM (ti) | ViT-Tiny + memoria cross-attention | 71.6 MB | Apache 2.0 | ES |
| EfficientTAM (s) | ViT-Small + memoria cross-attention | 136.4 MB | Apache 2.0 | ES |
| SAM 2 | ViT-H + memoria transformer | no disponible | Apache 2.0 (segun autor) | no disponible |
| SAM (original) | ViT-H + prompt encoder | no disponible | Apache 2.0 | no disponible |

La comparación se limita a datos cualitativos aportados en el repositorio: EfficientTAM es aparentemente más eficiente que SAM 2 con un rendimiento comparable, pero no se dispone de métricas oficiales ni de specs oficiales de los modelos comparados en la información disponible.

## Limitaciones y advertencias

- No se dispone de datos de sesgos conocidos, riesgo de alucinación ni limitaciones de contexto o idioma, al ser un modelo de visión que no genera texto.
- La licencia Apache 2.0 permite el uso comercial sin restricciones adicionales, pero el copyright sigue perteneciendo a los autores originales de EfficientTAM; Cubert GmbH no reclama derechos sobre los ficheros.
- El repositorio es un mirror byte-idéntico del upstream: no se han aplicado fine-tuning, conversión ni re-serialización. Los ficheros son los publicados originalmente.
- En el upstream de Hugging Face no se incluía ningún fichero LICENSE; el mirror ha añadido el texto de la licencia Apache 2.0 tomado del repositorio de GitHub, verificando su sha256.
- El modelo no incluye cuantizaciones precompiladas ni variantes en formato GGUF o safetensors; solo pesos `.pt` de PyTorch.
- Para entornos de producción, es necesario verificar las versiones y dependencias del repositorio original de EfficientTAM, ya que este mirror no aporta código de inferencia.

## Enlaces

- Repositorio Hugging Face del espejo: https://huggingface.co/cubert-gmbh/efficient-track-anything
- Repositorio Hugging Face original (upstream): https://huggingface.co/yunyangx/efficient-track-anything
- Repositorio de código en GitHub: https://github.com/yformer/EfficientTAM
- Repositorio del plugin Cuvis.AI para EfficientTAM: https://github.com/cubert-hyperspectral/cuvis-ai-etam
- Artículo de arXiv: https://arxiv.org/html/2411.18933v1
- Entorno Cuvis.AI: https://github.com/cubert-hyperspectral/cuvis-ai
