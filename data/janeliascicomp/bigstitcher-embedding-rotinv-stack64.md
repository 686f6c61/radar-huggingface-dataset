# JaneliaSciComp/bigstitcher-embedding-rotinv-stack64

## Resumen

`bigstitcher-embedding-rotinv-stack64` es una red neuronal convolucional 3D pequeña desarrollada por JaneliaSciComp (Janelia Research Campus, HHMI) que transforma un punto de interés detectado en un volumen de microscopía de lámina de luz (light-sheet) en un vector unitario de 64 dimensiones que describe su entorno a cinco escalas. Su característica definitoria es la invariancia a rotación y reflexión: dos detecciones de la misma estructura física en dos vistas con orientaciones distintas producen vectores similares, lo que permite a BigStitcher emparejar puntos de una adquisición multi-vista mediante similitud coseno.

El modelo resuelve un problema concreto del pipeline de registro (stitching) de BigStitcher: el alineamiento de vistas adquiridas desde ángulos arbitrarios, donde los descriptores invariantes a traslación no funcionan porque la orientación relativa entre vistas es desconocida. Se exporta en formato ONNX (opset 18) y se evalúa dentro de BigStitcher con su propio evaluador Java ONNX, sin necesidad de runtime externo. No es un modelo de lenguaje: es un extractor de características para visión 3D científica.

La relevancia es práctica para el campo de la microscopía de muestras grandes: permite registrar vistas rotadas o reflejadas con un modelo de apenas unos pocos megabytes que corre en CPU dentro de la propia herramienta de stitching. Esta versión (stage 2) afina el modelo invariante a traslación original con pares de vistas reales rotadas de cuatro conjuntos de datos multi-vista de light-sheet.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN 3D (Conv, ReLU, MaxPool, Gemm, ReduceL2 y operaciones elementales de estandarización; 22 tipos de operador, opset 18) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija `[N, 5, 16, 16, 16]` (5 canales, cubo 16³) |
| Tipos de cuantización | no disponible (pesos en float32; el modelo opera en float32) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx`, opset 18) más sidecar `.onnx.json` con contrato de tensores y configuración |

## Arquitectura y entrenamiento

La red es una CNN 3D que recibe `patches` float32 de forma `[N, 5, 16, 16, 16]`, donde el canal k es un cubo de 16³ muestras centrado en el punto con arista k × sigma para k = 5, 8, 13, 20, 30 (sigma es la escala de detección del punto en píxeles de resolución completa). Los cubos son isótropos en unidades físicas y se muestrean trilinealmente desde el nivel de la pirámide cuya resolución coincide con el espaciado de muestreo. La salida es `descriptor` float32 `[N, 64]` con filas normalizadas L2.

La invariancia se construye en dos lugares. Primero, la estandarización dentro del grafo calcula sus estadísticas sobre los vóxeles dentro de la esfera de radio 8 alrededor del centro del cubo y pone a 0 todo lo que queda fuera de la esfera (máscara esférica como constante), de modo que un cubo rotado se estandariza al cubo estandarizado rotado. Segundo, el entrenamiento expone la red a rotaciones de hasta 180 grados y reflexiones con probabilidad 0,5, con desenfoque direccional aplicado como un desenfoque físico único a través de los cinco canales. Las muestras fuera de la imagen son NaN y se enmascaran dentro del grafo; el llamador no hace nada respecto a la orientación de la vista.

El entrenamiento tuvo dos etapas. La etapa 1 (2026-10-31) aplicó la receta invariante a traslación sobre siete conjuntos de teselas bajo régimen de rotación: 4.000 pasos auto-supervisados seguidos de 10.000 pasos entre vistas (HardNet, margen 0,15). La etapa 2 (esta release) afinó ese modelo durante 12.000 pasos sobre los siete conjuntos de teselas más pares reales de vistas rotadas de cuatro conjuntos multi-vista de light-sheet: un embrión de Drosophila adquirido desde siete ángulos (núcleos y perlas fluorescentes), una muestra de microscopía de expansión, un embrión de C. elegans y una muestra teñida de núcleos. Se usaron 99.569 positivos en 358 grupos de pares (tolerancia 2 px, máximo 2.000 por par), pérdida InfoNCE (temperatura 0,1) con negativos duros muestreados dentro de 500 px del ancla (3 por ancla, 2 de ellos los más cercanos), lotes de 1.024 muestreados localmente, sigma por punto, tasa de aprendizaje 1e-4, semilla 0 y pérdida final 1,76. Commit de pcmatch f5ccf8c, 2026-11-04.

## Capacidades

- Extracción de descriptores 3D de 64 dimensiones para puntos de interés detectados con DoG en volúmenes de microscopía de lámina de luz.
- Invariancia a rotación (hasta 180 grados) y a reflexión (mirror) de la orientación de la vista.
- Codificación multi-escala del entorno del punto mediante cinco canales a escalas k × sigma.
- Estandarización interna de intensidades: acepta intensidades crudas con cualquier ganancia u offset.
- Enmascaramiento interno de muestras fuera de la imagen (NaN), sin preprocesado por parte del llamador.
- Emparejamiento entre vistas mediante similitud coseno con test de ratio (0,85 en espacio de similitud) y umbral de 0,3.
- Compatibilidad con registro RANSAC rígido o afín para vistas de orientación relativa desconocida.
- Huella criptográfica (fingerprint sha256) que BigStitcher verifica para impedir mezclar vectores de modelos distintos.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión 2D genérica ni audio: es un extractor de características puro.

## Casos de uso

- Registro de adquisiciones multi-vista de light-sheet: el modelo permite emparejar puntos entre vistas adquiridas desde ángulos distintos (por ejemplo, un embrión de Drosophila desde siete ángulos) mediante similitud coseno y RANSAC, resolviendo la orientación relativa desconocida que los descriptores invariantes a traslación no pueden manejar.
- Stitching de muestras rotadas o reflejadas: cuando una vista se ha adquirido con la muestra girada o reflejada respecto a las demás, el modelo recupera correspondencias (55 % de la verdad de registro con rotación exacta de 90 grados, 56 % con reflexión) donde el modelo invariante a traslación cae a 0 %.
- Microscopía de expansión (expansion microscopy): el modelo alcanza 68 % de recall a nivel de descriptor en pares reales de vistas rotadas de una muestra de expansión, adecuado para registrar muestras grandes con orientaciones arbitrarias.
- Muestras teñidas de núcleos en C. elegans y otros organismos modelo: con 63 % y 72 % de recall en pares rotados reales, sirve para pipelines de registro automático de embriones y muestras teñidas.
- Detección y emparejamiento de perlas fluorescentes (fiducial beads): con 18 % de recall en perlas del embrión de Drosophila, útil como señal complementaria en el registro cuando hay marcadores fluorescentes.
- Integración en BigStitcher sin runtime adicional: al exportarse en ONNX y evaluarse con el evaluador Java ONNX interno de BigStitcher, se puede desplegar en flujos de trabajo de escritorio o servidor sin instalar PyTorch ni dependencias de Python.
- Registro de teselas en la misma orientación: aunque el modelo invariante a traslación es más descriptivo en ese caso, este modelo encuentra entre 66 y 89 % de las correspondencias verdaderas del invariante a traslación, por lo que puede usarse como alternativa unificada cuando el dataset mezcla teselas y vistas rotadas.

## Benchmarks y rendimiento

Recall a nivel de descriptor en pares reales de vistas rotadas (el descriptor más cercano de la otra vista es el verdadero compañero):

| Conjunto de datos | rotinv-stack64 (stage 2) | Modelo stage 1 | Modelo invariante a traslación |
|---|---|---|---|
| Drosophila, núcleos | 21 % | 3 % | 0,1–2 % |
| Drosophila, perlas | 18 % | 3 % | 0,1–2 % |
| Muestra teñida de núcleos | 63 % | 21 % | 0,1–2 % |
| Microscopía de expansión | 68 % | 30 % | 0,1–2 % |
| Dataset multi-vista no visto en entrenamiento | 72 % | 51 % | 0,1–2 % |

Bajo transformaciones exactas (dataset de stitching):

| Condición | rotinv-stack64 | Modelo invariante a traslación |
|---|---|---|
| Vista sin rotar | 59 % | 86 % |
| Vista rotada exactamente 90 grados | 55 % | 0 % |
| Vista reflejada en x, y o z | 56 % | 0 % |

En teselas de una sola orientación, el modelo encuentra entre 66 y 89 % de las correspondencias verdaderas del modelo invariante a traslación (por ejemplo, 1.682 frente a 1.946 en el dataset de stitching con radio de 20 px; 7.460 frente a un valor no disponible en el texto proporcionado).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo es una CNN 3D pequeña con entrada fija de 16³ vóxeles por canal y salida de 64 dimensiones. El tamaño del repositorio es de 0,0 GB (por debajo de la precisión de redondeo disponible), lo que sugiere un modelo de pocos megabytes.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 4090, RTX 3060) es más que suficiente si se desea acelerar el procesamiento por lotes.
- Cabe en cualquier GPU consumer y en CPU sin problema.
- Opciones de despliegue: evaluador Java ONNX integrado en BigStitcher (vía principal, sin runtime externo); ONNX Runtime para Python, C++ o Java si se integra en otros pipelines.
- Latencia y throughput: no disponibles en la información proporcionada. El procesamiento es por lotes de parches (`[N, 5, 16, 16, 16]`), por lo que el throughput depende del tamaño del lote y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Invariancia | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bigstitcher-embedding-rotinv-stack64` | CNN 3D ONNX | Rotación (≤180°) y reflexión | 64-D L2-normalizado | MIT | Hugging Face (JaneliaSciComp) |
| `bigstitcher-embedding-translation-stack64` | CNN 3D ONNX | Traslación | 64-D L2-normalizado | MIT | Hugging Face (JaneliaSciComp) |
| Modelo stage 1 (predecesor del rotinv) | CNN 3D | Rotación (entrenamiento parcial) | 64-D L2-normalizado | MIT | No publicado como release independiente en la información disponible |

El modelo invariante a traslación es más descriptivo en teselas de la misma orientación (86 % frente a 59 % sin rotar; 1.946 frente a 1.682 correspondencias en el dataset de stitching), pero falla por completo (0 %) con vistas rotadas o reflejadas, donde el modelo rotinv recupera 55–56 %. No se dispone de información sobre otros modelos comparables de descriptores 3D para microscopía en la información proporcionada.

## Limitaciones y advertencias

- El recall a nivel de descriptor en pares reales rotados es modesto en algunos casos: 18–21 % en el embrión de Drosophila (núcleos y perlas), lo que implica que los candidatos son menos numerosos y menos puros que en teselas y que RANSAC debe hacer el resto del trabajo.
- En teselas de una sola orientación rinde peor que el modelo invariante a traslación (66–89 % de sus correspondencias verdaderas); para adquisiciones por teselas en la misma orientación debe preferirse `bigstitcher-embedding-translation-stack64`.
- La invariancia es a rotación y reflexión, pero no a cambios de escala arbitrarios: las escalas están fijadas por los cinco canales (k × sigma) y dependen de la sigma de detección.
- BigStitcher rechaza emparejar vectores con fingerprints distintos: todos los vectores de un dataset deben generarse con el mismo modelo y la misma huella.
- Los dos ficheros (`.onnx` y `.onnx.json`) deben permanecer juntos con los nombres emparejados; el sidecar contiene el contrato de tensores y la configuración de muestreo que BigStitcher lee.
- El modelo está entrenado y evaluado en volúmenes de light-sheet; su comportamiento en otras modalidades de imagen 3D no está documentado.
- No se han documentado sesgos en el sentido de sesgos sociales (no es un modelo lingüístico), pero el rendimiento depende de la similitud entre la muestra y los datos de entrenamiento (Drosophila, C. elegans, microscopía de expansión, núcleos teñidos); en muestras muy distintas el recall podría degradarse.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y verificar la licencia de los datos de entrenamiento subyacentes si se redistribuye el modelo.
- No se proporcionan datos de cuantización ni de despliegue en GPU de bajo consumo más allá de float32; no hay versiones GGUF ni quantizadas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JaneliaSciComp/bigstitcher-embedding-rotinv-stack64
- Modelo invariante a traslación (complementario): https://huggingface.co/JaneliaSciComp/bigstitcher-embedding-translation-stack64
- Repositorio pcmatch (commit f5ccf8c, 2026-11-04): no disponible como URL en la información proporcionada
- Paper, blog o demo de BigStitcher: no disponible en la información proporcionada
