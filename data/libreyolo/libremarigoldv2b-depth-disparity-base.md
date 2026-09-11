# LibreYOLO/LibreMarigoldV2b-depth-disparity-base

## Resumen

LibreMarigoldV2b-depth-disparity-base es un adaptador de estimación monocular de profundidad publicado por LibreYOLO dentro de su librería homónima. No es un modelo autónomo: contiene únicamente el adaptador y los tensores de prompt fijos de la variante `disparity-base` de Marigold V2, y necesita descargarse aparte el modelo base Qwen/Qwen-Image-Edit-2509 (revisión `d3968ef930e841f4c73640fb8afa3b306a78167e`) para poder ejecutar inferencia. El repositorio pesa 1,9 GB y su pipeline declarado es `depth-estimation`.

El origen de los pesos es huawei-bayerlab/marigold-v2-0, subcarpeta `depth/Disparity-base`, revisión `6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad`, con Copyright 2026 Huawei Technologies Co., Ltd. y licencia Apache 2.0. Marigold V2 es una familia de modelos de difusión (etiquetada como `diffusion-transformer`) construida sobre un transformer de difusión de imagen; LibreYOLO se limita a reempaquetar el adaptador, añadir metadatos propios y un marcador de variante, omitiendo dos tensores de proyección iREPA que solo se usan en entrenamiento.

Su relevancia es práctica: permite reproducir la variante de disparidad de Marigold V2 dentro del ecosistema LibreYOLO con una API de una sola llamada, con paridad de implementación verificada frente a la implementación nativa. La contrapartida es que las salidas no son métricas (usan codificación `inverse_depth` relativa afín) y que no hay resultados de precisión publicados, solo una comprobación de equivalencia numérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) para estimacion de profundidad; adaptador sobre Qwen/Qwen-Image-Edit-2509 con procedencia de huawei-bayerlab/marigold-v2-0 (`depth/Disparity-base`) |
| Parametros totales | no disponible (el repo del adaptador ocupa 1,9 GB; los pesos del modelo base se descargan por separado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | NF4 y BF16 en CUDA (unico modo de inferencia probado por el autor); no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos y adaptador); el codigo fuente de LibreYOLO es MIT y no cubre los pesos preentrenados |
| Formato de pesos | PyTorch (`.pt`), fichero `LibreMarigoldV2b-depth-disparity-base.pt`; los pesos del modelo base se obtienen aparte en su formato original |

## Arquitectura y entrenamiento

El modelo es un adaptador de difusión para profundidad que se apoya en Qwen/Qwen-Image-Edit-2509 como base congelada. La model card indica que el adaptador de inferencia, el decodificador y los tensores de prompt son idénticos a los del origen `depth/Disparity-base` de Marigold V2; las únicas modificaciones introducidas por LibreYOLO son metadatos y un marcador de variante, además de la omisión de dos tensores de proyección iREPA que solo intervienen en entrenamiento. La conversión está implementada en `libreyolo/models/marigold_v2/convert.py`.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación; tampoco se documenta el número de pasos de denoising en inferencia. Los detalles técnicos relevantes que sí aparecen son de codificación de salida: la profundidad se emite como `inverse_depth` con escala relativa afín, no en metros, y el lienzo de predicción por defecto es el nativo redondeado hacia arriba a múltiplos de 16, con la opción `imgsz=512` para forzar un lienzo cuadrado fijo. La salida se devuelve a la resolución original de la imagen de entrada.

## Capacidades

- Estimación de profundidad monocular a partir de una imagen, con salida de mapa de profundidad accesible como `result.depth_map` y visualización mediante `result.plot().save(...)`.
- Modo disparidad (`disparity-base`), con valores en codificación `inverse_depth` y escala relativa afín.
- Control del lienzo de inferencia: nativo redondeado a múltiplos de 16 o cuadrado fijo con `imgsz=512`.
- Reescalado automático de la salida a la resolución original de la imagen.
- Inferencia en CUDA con NF4 o BF16.
- Integración con la librería LibreYOLO a través de la API `LibreYOLO("...pt", device="cuda")`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No genera texto ni mantiene conversaciones.
- No soporta entrenamiento, exportación de modelos ni ejecución en MPS según la model card.

## Casos de uso

- Preprocesado para reconstrucción 3D: el mapa de profundidad relativa por imagen sirve como entrada para pipelines de fotogrametría, NeRF o gaussian splatting, donde la escala absoluta se resuelve después con calibración externa.
- Condicionamiento de generación de imagen: el mapa `inverse_depth` puede alimentar etapas de control de profundidad en generadores de imagen para mantener la geometría de la escena original.
- Retoque fotográfico y desenfoque sintético: la salida a resolución original permite construir máscaras de profundidad para efecto bokeh, separación de sujeto y fondo o corrección selectiva por planos.
- Visión para robótica y vehículos: la profundidad relativa por fotograma aporta indicios de obstáculos y ordenación de planos en el espacio de cámara, útil cuando no se dispone de sensor de profundidad dedicado.
- Realidad aumentada: la estimación permite calcular oclusión entre objetos virtuales y reales y anclar elementos a superficies, asumiendo que no se requiere escala métrica exacta.
- Comercio electrónico y catalogación: recorte automático de producto respecto al fondo, generación de vistas de profundidad para vistas 3D ligeras o normalización de imágenes de catálogo.
- Análisis de escenas en vídeo fotograma a fotograma: procesar cada frame por separado para obtener mapas de disparidad consistentes en codificación, útiles en inspección visual o segmentación asistida.
- Verificación de implementaciones: dado que el autor documenta paridad numérica con la implementación nativa, el adaptador sirve como referencia para validar portes, cuantizaciones o integraciones propias en CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una validacion de equivalencia de implementacion: dos comparaciones de salida entre la implementacion nativa y la del adaptador, ejecutadas en el mismo worker sobre NVIDIA L40S con PyTorch 2.10.0+cu128, dieron una diferencia absoluta maxima de 0,0. El propio autor aclara que esto verifica paridad de implementacion, no precision frente a benchmarks publicados, y que no garantiza coincidencia bit a bit entre maquinas distintas.

| Metrica | Resultado | Contexto |
|---|---|---|
| MMLU, HumanEval, GSM8K y similares | no aplica | modelo de vision, no de lenguaje |
| Benchmarks de profundidad (por ejemplo, absRel, delta1) | no disponible | no publicados en la informacion proporcionada |
| Diferencia absoluta maxima frente a la implementacion nativa | 0,0 | 2 comparaciones, mismo worker, NVIDIA L40S, PyTorch 2.10.0+cu128 |

## Requisitos de hardware

- CUDA es obligatorio en la integración documentada; MPS no está soportado y el entrenamiento y la exportación tampoco.
- El adaptador ocupa 1,9 GB, pero el consumo dominante de VRAM proviene del modelo base Qwen/Qwen-Image-Edit-2509, que se descarga por separado.
- Entorno de referencia confirmado por el autor: NVIDIA L40S (48 GB de VRAM) con PyTorch 2.10.0+cu128, en BF16 y NF4.
- No hay cifras oficiales de VRAM mínima ni de encaje en GPU de consumo; no disponible. Cualquier estimación para tarjetas tipo RTX 4090 debe validarse empíricamente, ya que depende de la cuantización y del modelo base.
- La cuantización NF4 es la vía razonable para reducir huella de memoria, pero el autor solo confirma que fue probada, no que quepa en una GPU concreta de gama de consumo.
- Opciones de despliegue: la integración de LibreYOLO en la rama `feat/marigoldv2` con dependencias `libreyolo[marigold]`. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, previsiblemente por tratarse de un modelo de difusión y no de un LLM.
- Latencia y throughput: no disponible. Al ser un modelo de difusión, el coste por imagen depende del número de pasos de denoising, que la model card no especifica.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreMarigoldV2b-depth-disparity-base | Adaptador de difusion para profundidad sobre Qwen-Image-Edit-2509 | no disponible (adaptador de 1,9 GB; base aparte) | no aplica | Apache-2.0 | HuggingFace, libreria `libreyolo`, rama `feat/marigoldv2` |
| huawei-bayerlab/marigold-v2-0 (`depth/Disparity-base`) | Modelo de origen de la misma variante | no disponible | no aplica | Apache-2.0 | HuggingFace |
| Qwen/Qwen-Image-Edit-2509 | Transformer de difusion de edicion de imagen, usado como base congelada | no disponible en la informacion proporcionada | no aplica | Apache-2.0 (segun su model card) | HuggingFace |
| Alternativas no difusivas de profundidad monocular (por ejemplo, familia Depth Anything) | Modelos discriminativos de profundidad | no disponible | no aplica | no disponible | no disponible |

La comparativa relevante aquí es de empaquetado, no de precisión: este adaptador y el `depth/Disparity-base` upstream comparten pesos y licencia, y la diferencia está en la integración, los metadatos y la omisión de los tensores iREPA de entrenamiento. No hay datos publicados que permitan comparar su precisión con Marigold V1, Depth Anything u otras alternativas.

## Limitaciones y advertencias

- No es un modelo autónomo: sin Qwen/Qwen-Image-Edit-2509 descargado aparte, el checkpoint no ejecuta inferencia.
- Las salidas no son métricas: usan codificación `inverse_depth` con escala relativa afín, por lo que no deben interpretarse como metros sin una calibración posterior.
- La validación publicada comprueba paridad de implementación (diferencia absoluta máxima 0,0), no exactitud frente a ground truth; el autor lo señala explícitamente.
- La comparación se hizo en un mismo worker y en una sola GPU (L40S); no se garantiza coincidencia bit a bit entre máquinas ni entre versiones de PyTorch/CUDA.
- Entrenamiento, exportación y MPS no están soportados por la integración; esto limita ajuste fino y despliegue en hardware Apple.
- La integración vive en la rama `feat/marigoldv2` del repositorio, no en la rama principal, lo que implica riesgo de cambios de API.
- Estado de adopción nulo en el momento de la consulta: 0 descargas y 0 likes, sin retroalimentación de la comunidad.
- No se documentan sesgos, composición de datos de entrenamiento ni comportamiento en dominios concretos; las limitaciones heredadas del modelo base y del dataset de Marigold V2 no están detalladas.
- Como todo estimador monocular de profundidad, es previsible que produzca geometría poco fiable en superficies transparentes, reflectantes o sin textura; no se aportan datos específicos para este checkpoint.
- Licencia Apache-2.0 en pesos y adaptador, apta para uso comercial, pero los pesos preentrenados quedan fuera de la licencia MIT del código de LibreYOLO; conviene revisar `LICENSE` y `NOTICE` antes de redistribuir.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LibreYOLO/LibreMarigoldV2b-depth-disparity-base
- Modelo de origen Marigold V2: https://huggingface.co/huawei-bayerlab/marigold-v2-0/tree/6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad
- Implementación de origen (Apache-2.0): https://github.com/huawei-bayerlab/marigold-v2/tree/cc6a7031abcd59fd9e1ceff7fdd0d9687d389bc5
- Modelo base congelado: https://huggingface.co/Qwen/Qwen-Image-Edit-2509/tree/d3968ef930e841f4c73640fb8afa3b306a78167e
- Integración en LibreYOLO (rama): https://github.com/LibreYOLO/libreyolo/tree/feat/marigoldv2
- Script de conversión: https://github.com/LibreYOLO/libreyolo/blob/feat/marigoldv2/libreyolo/models/marigold_v2/convert.py
