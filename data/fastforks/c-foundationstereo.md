# fastforks/c-foundationstereo

## Resumen

C-FoundationStereo es una familia de modelos de estereoscopía (stereo matching) publicada por NVIDIA dentro de su ecosistema TAO (Train, Adapt, Optimize) y redistribuida en este repositorio por el proyecto fastforks. El modelo resuelve la correspondencia densa entre un par de imágenes estéreo rectificadas (izquierda y derecha) y produce un mapa de disparidad en píxeles respecto a la vista izquierda, que puede convertirse en profundidad con los parámetros de calibración de la cámara. No es un modelo de lenguaje: es un modelo de visión por computador especializado en estimación de profundidad estéreo.

La relevancia de esta ficha radica en que el repositorio `fastforks/c-foundationstereo` es únicamente una model card: no aloja pesos. Actúa como capa de orquestación que descarga los checkpoints originales de NVIDIA, verifica su integridad mediante SHA-256 y ofrece dos backends de ejecución (`portable` y `kernels`). La familia incluye tres variantes con licencias y prestaciones distintas: `c-fast-foundationstereo` (destilada, 8 iteraciones), `c-foundationstereo-s` (DepthAnything-ViT-S más características CNN, 22 iteraciones) y `fast-foundationstereo` (checkpoint de investigación, no comercial).

Arquitectónicamente combina un extractor de características (DepthAnything ViT-S o EdgeNeXt según variante), un volumen de coste 3D con filtrado mediante un transformer de disparidad y un ConvGRU que refina iterativamente el mapa de disparidad. Está pensado para aplicaciones de robótica, vehículos autónomos, reconstrucción 3D y visión industrial donde se requiere profundidad densa a partir de cámaras estéreo calibradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Estereo denso: extractor de caracteristicas (DepthAnything ViT-S o EdgeNeXt) + volumen de coste 3D + transformer de disparidad + ConvGRU iterativo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada H x W >= 32, rellenada a multiplo de 32) |
| Tipos de cuantizacion | fp32 (original), fp16 (portable y kernels); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Mixta segun variante: `c-fast-foundationstereo` bajo NVIDIA Open Model Agreement (uso comercial permitido); `c-foundationstereo-s` bajo NVIDIA Open Model License (uso comercial permitido); `fast-foundationstereo` bajo NVIDIA Source Code License NC (no comercial) |
| Formato de pesos | `.pth` (PyTorch serializado); no se distribuyen GGUF ni safetensors |
| Tarea | Stereo matching / depth estimation |
| Entrada | Par de imagenes estereo rectificadas (izquierda y derecha) |
| Salida | Mapa de disparidad en pixeles (vista izquierda) |
| Backends | `portable` (PyTorch) y `kernels` (kernels CUDA optimizados) |
| Tamano de entrada | Cualquier H x W >= 32, rellenado a multiplo de 32 |
| Iteraciones | 8 (`c-fast-foundationstereo`, `fast-foundationstereo`), 22 (`c-foundationstereo-s`) |
| max_disp | 192 (variantes rapidas) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de stereo matching basado en aprendizaje profundo con refinamiento iterativo. Un extractor de características comparte pesos entre las dos vistas para generar representaciones densas; con ellas se construye un volumen de coste 3D que codifica la similitud entre píxeles correspondientes a lo largo del eje de disparidad. Ese volumen se filtra mediante un transformer de disparidad que agrega contexto global, y un ConvGRU refina iterativamente el mapa de disparidad durante un número fijo de iteraciones (8 en las variantes destiladas, 22 en la variante S). La variante `c-foundationstereo-s` emplea un backbone DepthAnything ViT-S junto con características CNN, mientras que las variantes rápidas usan EdgeNeXt.

El entrenamiento se realizó sobre la Foundation Stereo Dataset (FSD, sintética de NVIDIA) y el dataset sintético CREStereo de Megvii, con preentrenamiento en ambos y ajuste fino posterior sobre FSD y TartanAir. No se documenta en la información disponible el número exacto de tokens ni de pares estéreo utilizados, ni si hubo etapas de RLHF o DPO (no aplicables en un modelo de visión de este tipo). La innovación técnica destacable es la doble implementación de inferencia: un backend `portable` en PyTorch puro y un backend `kernels` con kernels CUDA específicos que logran aceleraciones de hasta 3,9x frente al código original y reducciones de memoria de hasta 2,7x.

## Capacidades

- Estimación de disparidad densa a partir de pares estéreo rectificados, con salida en píxeles de la vista izquierda.
- Conversión a profundidad métrica si se dispone de los parámetros de calibración (línea base y focal).
- Procesamiento de resoluciones arbitrarias desde 32x32 hasta al menos 1988x2880 píxeles (probado en RTX 5060 Ti de 16 GB).
- Dos backends de ejecución: `portable` (compatible con PyTorch estándar) y `kernels` (optimizado con CUDA para menor latencia y memoria).
- Verificación de integridad de pesos mediante SHA-256 antes de la carga.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Robótica móvil y navegación autónoma: el modelo genera mapas de profundidad densos a partir de un par estéreo calibrado, lo que permite a un robot detectar obstáculos y planificar trayectorias en tiempo real. La variante `c-fast-foundationstereo` procesa 1280x720 en 85,9 ms con el backend `kernels`, adecuada para bucles de control a 10 Hz.
- Reconstrucción 3D y fotogrametría: a partir de imágenes estéreo de alta resolución (hasta 1988x2880) se obtiene disparidad densa que, combinada con calibración, produce nubes de puntos para modelado de escenas.
- Vehículos autónomos y ADAS: la estimación de profundidad estéreo complementa a LiDAR y cámaras monoculares en la detección de distancia a vehículos y peatones, con la ventaja de no requerir sensores activos.
- Visión industrial e inspección: medición de dimensiones y detección de defectos en piezas mediante profundidad estéreo en líneas de fabricación, usando `c-foundationstereo-s` cuando se prioriza precisión sobre latencia.
- Drones y UAV: estimación de profundidad en tiempo real para evitación de obstáculos y aterrizaje preciso, donde el consumo de memoria es crítico; el backend `kernels` reduce el pico a 306 MiB en 640x480.
- Realidad aumentada y captura volumétrica: generación de mapas de profundidad por fotograma para oclusión correcta y composición de objetos virtuales sobre escenas reales.
- Investigación en visión estéreo: `fast-foundationstereo` sirve como checkpoint de referencia para comparativas académicas, aunque su licencia prohíbe el uso comercial.

## Benchmarks y rendimiento

Los datos disponibles son de latencia y memoria, no de precisión (no se publican métricas como EPE o D1 en la información proporcionada).

Rendimiento en Middlebury 2014 half (994x1482):

| Modelo | Tiempo original fp32 (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|
| `c-fast-foundationstereo` (max_disp 192, 8 iter) | 741,3 | 527,1 | 329,75 | 3,9x | 2109 / 2336 | 1196 / 1516 |
| `c-foundationstereo-s` (22 iter) | – | 3873,86 | 1362,1 | 2,8x | 6312 / 6590 | 3107 / 4376 |
| `fast-foundationstereo` (max_disp 192, 8 iter) | 741,0 | 527,2 | 329,98 | 3,9x | 2109 / 2256 | 1196 / 1576 |

Rendimiento por resolución (backend `kernels`, ms / memoria asignada / reservada en MiB):

| Modelo | 640x480 | 1280x720 | 1920x1080 | 4000x3000 (12 MP) |
|---|---|---|---|---|
| `c-fast-foundationstereo` | 38,5 / 306 / 386 | 85,9 / 762 / 960 | 182,0 / 1582 / 2060 | 1072,8 / 8699 / 11372 |
| `c-foundationstereo-s` | no disponible en el extracto | no disponible | no disponible | no disponible |

Tiempos de carga y primera llamada (375x1242): `c-fast-foundationstereo` carga en 0,16 s y primera llamada en 0,14 s con `kernels`; `c-foundationstereo-s` carga en 0,40 s y primera llamada en 1,36 s con `kernels`.

## Requisitos de hardware

- VRAM estimada: desde ~306 MiB asignados (640x480, `c-fast-foundationstereo`, backend `kernels`) hasta ~8,7 GiB asignados en 12 MP; `c-foundationstereo-s` requiere ~6,3 GiB en 994x1482 con `portable` y ~3,1 GiB con `kernels`.
- GPU recomendadas: NVIDIA RTX 5060 Ti 16 GB es la GPU de referencia en las pruebas; cualquier GPU NVIDIA con soporte CUDA y al menos 8 GB es suficiente para resoluciones medias. Para 12 MP se recomiendan 12 GB o más.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y similares; en 640x480 funciona incluso en GPUs con 4 GB.
- Opciones de despliegue: el paquete `fastforks` (backend `portable` o `kernels`), PyTorch nativo cargando los `.pth` originales, y el backend TAO de NVIDIA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión).
- Latencia: 38,5 ms en 640x480 y 182 ms en 1920x1080 con `c-fast-foundationstereo` y backend `kernels`; 1,36 s en 994x1482 con `c-foundationstereo-s`.
- Throughput: no disponible de forma explícita, pero se deduce de las latencias anteriores (aproximadamente 26 FPS en 640x480 y 5,5 FPS en 1080p para la variante rápida).

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Iteraciones | Licencia comercial | Disponibilidad |
|---|---|---|---|---|---|
| `c-fast-foundationstereo` | no disponible | EdgeNeXt + ConvGRU destilado | 8 | Sí (NVIDIA Open Model Agreement) | Hugging Face (NVIDIA) |
| `c-foundationstereo-s` | no disponible | DepthAnything ViT-S + CNN + ConvGRU | 22 | Sí (NVIDIA Open Model License) | Hugging Face (NVIDIA) |
| `fast-foundationstereo` | no disponible | EdgeNeXt + ConvGRU (investigacion) | 8 | No (NVIDIA Source Code License NC) | Google Drive |
| CREStereo (Megvii) | no disponible | Cascaded recurrent network | no disponible | no disponible | Repositorio original |
| RAFT-Stereo | no disponible | Recurrent All-Pairs Field Transforms | no disponible | no disponible | Repositorio original |

No se dispone de métricas de precisión comparativas (EPE, D1) en la información proporcionada, por lo que la comparativa se limita a aspectos de licencia, arquitectura y disponibilidad.

## Limitaciones y advertencias

- Requiere pares estéreo rectificados y calibrados; no funciona con imágenes individuales ni con pares sin rectificar.
- La licencia es mixta y varía por variante: `fast-foundationstereo` es estrictamente no comercial, mientras que las otras dos permiten uso comercial pero con términos que deben revisarse (la model card de `c-fast-foundationstereo` contiene una contradicción entre "research and evaluation purposes only" y el NVIDIA Open Model Agreement; fastforks indica que sigue los términos del acuerdo).
- Los términos de uso comercial de modelos entrenados sobre el dataset FSD de NVIDIA no están claros según la propia model card.
- El repositorio no aloja pesos: depende de enlaces externos (Hugging Face de NVIDIA y Google Drive) y de la verificación SHA-256; si los enlaces cambian o desaparecen, el modelo deja de ser reproducible.
- Resolución máxima probada: 1988x2880; en 12 MP (4000x3000) el backend `portable` produce OOM y el backend `kernels` requiere ~8,7 GiB.
- No se documentan sesgos específicos, pero al ser un modelo entrenado mayoritariamente con datos sintéticos (FSD, CREStereo) puede presentar degradación en escenas reales con condiciones de iluminación, texturas repetitivas o superficies sin textura.
- Riesgo de alucinación en regiones ocluidas o sin correspondencia: el mapa de disparidad puede contener valores erróneos que deben filtrarse con máscaras de confianza.
- No soporta texto, por lo que no aplican limitaciones de idioma, pero tampoco puede usarse para tareas de comprensión multimodal general.
- El backend `kernels` requiere compilación de kernels CUDA específicos y puede no estar disponible en todas las configuraciones de hardware o versiones de CUDA.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/c-foundationstereo
- Pesos `c-fast-foundationstereo`: https://huggingface.co/nvidia/c-fast-foundationstereo
- Pesos `c-foundationstereo-s`: https://huggingface.co/nvidia/c-foundationstereo-s
- Pesos `fast-foundationstereo` (Google Drive): https://drive.usercontent.google.com/download?export=download&confirm=t&id=1W1V1H64l9bAi97boEQQ2ueNzzGmSMz-E
- Codigo fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Codigo original TAO: https://github.com/NVIDIA/tao_pytorch_backend
- Evidencia de licencia: https://huggingface.co/nvidia/c-foundationstereo-s/blob/d776ba855977e99cc9f16246f911d701da0bbc7a/README.md
