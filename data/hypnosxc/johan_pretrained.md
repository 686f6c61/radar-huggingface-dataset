# HypnosXC/JoHan_pretrained

## Resumen

JoHan pretrained (ViT-H/512) es un modelo de recuperación conjunta de movimiento de manos 2D y 3D condicionado por vídeo, desarrollado por HypnosXC y publicado junto al artículo "Video-Conditioned Generative Joint 2D-3D Hand Motion Recovery" (arXiv:2610.10512). No es un modelo de lenguaje: se trata de un modelo generativo de visión por computador que, a partir de un vídeo RGB, predice pose y forma MANO locales, articulaciones 2D y, mediante PnP, orientación y traslación en espacio de cámara. El repositorio contiene los pesos de inferencia del paso 145000 en modo RAW, junto con el extractor de características DINOv3 ViT-H/16+ afinado de forma correspondiente.

El modelo trabaja con imágenes RGB de 512 píxeles, ventanas temporales de 128 fotogramas y un esquema de flujo sinusoidal de 10 pasos. Su relevancia radica en abordar de forma conjunta la estimación 2D y 3D de manos en vídeo, un problema clásico de visión por computador donde los enfoques previos suelen tratar ambas tareas por separado o dependen de detectores externos. La liberación incluye checksums SHA-256 y notas de validación de integración, aunque no constituye un benchmark de precisión sobre vídeo completo ni de rendimiento en GPU.

El repositorio ocupa 4,2 GB e incluye pesos en safetensors y PyTorch, configuración de inferencia y metadatos de entrenamiento limitados a la escala de coordenadas. No se distribuyen pesos EMA, estado del optimizador, datos de entrenamiento, activos MANO ni pesos del detector, que deben obtenerse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo condicionado por vídeo con backbone ViT-H/16+ (DINOv3 afinado) y red conjunta 2D-3D de movimiento de manos; flujo sinusoidal de 10 pasos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana temporal de 128 fotogramas e imágenes de 512 px |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors y PyTorch sin cuantizar) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | other (johan-mit-and-dinov3): pesos JoHan bajo MIT; pesos DINOv3 afinados sujetos a la licencia de Meta |
| Formato de pesos | safetensors (`model.safetensors`) y PyTorch state dict (`dino_finetuned.pt`) |

## Arquitectura y entrenamiento

JoHan combina un extractor de características visuales DINOv3 ViT-H/16+ afinado con una red generativa que produce de forma conjunta pose y forma MANO locales y articulaciones 2D. La inferencia se realiza sobre ventanas de 128 fotogramas a resolución de 512 píxeles, empleando un sampler de flujo sinusoidal de 10 pasos. La orientación y traslación en espacio de cámara se recuperan a posteriori mediante PnP a partir de las predicciones locales, de modo que el modelo no estima directamente trayectorias en espacio de mundo ni pose corporal.

Los pesos publicados corresponden al paso 145000 de entrenamiento (fuente `2ff60ef`) en modo RAW, sin EMA. El repositorio no incluye estado del optimizador, composición del dataset ni detalles sobre el número de tokens o muestras de entrenamiento; `train_meta.json` contiene únicamente la escala de coordenadas. La validación publicada se limita a comprobaciones de integración: carga estricta de los pesos RAW, coincidencia exacta con el sampler original en una prueba sintética de dos fotogramas (cuatro salidas, diferencia absoluta máxima 0,0) y una ejecución de humo en CPU con dos fotogramas, dos pasos de flujo y cuatro observaciones de mano detectadas. No se aportan métricas de precisión sobre vídeo completo ni de rendimiento en GPU.

## Capacidades

- Recuperación de pose y forma MANO locales a partir de vídeo RGB.
- Predicción de articulaciones 2D de la mano.
- Recuperación de orientación y traslación en espacio de cámara mediante PnP.
- Procesamiento temporal con ventanas de 128 fotogramas.
- Integración con detector externo (WiLoR) para localizar manos en la imagen.
- Extracción de características visuales mediante DINOv3 ViT-H/16+ afinado.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No soporta generación de texto, código, matemáticas, visión general ni audio.
- No estima trayectorias en espacio de mundo ni pose corporal.
- Pipeline orientado a una sola persona; las detecciones ausentes se tratan como inválidas.

## Casos de uso

- Captura de movimiento de manos para animación: el modelo procesa ventanas de 128 fotogramas y devuelve pose y forma MANO locales, lo que permite reconstruir la articulación de la mano para rigging en pipelines de animación 3D.
- Análisis de lenguaje de signos y gestualidad: al predecir articulaciones 2D y parámetros MANO 3D de forma conjunta, sirve como etapa de extracción de características en sistemas de reconocimiento de gestos.
- Interacción humano-computador sin mandos: la recuperación de orientación y traslación en espacio de cámara vía PnP permite mapear la mano del usuario a un espacio interactivo con cámara calibrada.
- Teleoperación de robots con manos antropomórficas: los parámetros MANO locales pueden retargetearse a manos robóticas para control remoto, siempre que se disponga de intrínsecos calibrados.
- Evaluación de ergonomía y rehabilitación: el análisis de vídeo de sesiones permite extraer poses de mano frame a frame para medir rangos de movimiento, con la limitación de que no estima trayectorias globales.
- Preprocesado para datasets de vídeo: el modelo puede generar anotaciones 2D/3D de manos sobre vídeos existentes para entrenar otros modelos, usando el detector WiLoR para la localización inicial.
- Investigación en estimación 3D a partir de vídeo: sirve como referencia reproducible gracias a los checksums SHA-256 y a las notas de validación de integración publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta comprobaciones de integración (carga estricta de pesos, coincidencia exacta con el sampler original en una prueba sintética de dos fotogramas y una ejecución de humo en CPU), que no constituyen una evaluación de precisión ni de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 4,2 GB, pero no se especifica el consumo de memoria en GPU.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en tarjetas consumer.
- Opciones de despliegue: el código de inferencia se distribuye en el repositorio de GitHub (comando `johan`), con dependencias de DINOv3, WiLoR y MANO. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La única ejecución documentada es una prueba de humo en CPU con dos fotogramas y dos pasos de flujo, sin cifras de rendimiento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de recuperación de movimiento de manos ni datos de rendimiento que permitan establecer una comparativa fundamentada.

## Limitaciones y advertencias

- No estima trayectorias en espacio de mundo ni pose corporal; solo pose y forma MANO locales, articulaciones 2D y pose en espacio de cámara vía PnP.
- El pipeline basado en detector está orientado a una sola persona y trata las detecciones ausentes como inválidas.
- Mantiene los fotogramas decodificados en memoria, lo que puede limitar el procesamiento de vídeos largos.
- Requiere intrínsecos calibrados (fx, fy, cx, cy) en píxeles del vídeo original; una calibración incorrecta degrada la recuperación de traslación y orientación.
- Los pesos publicados son RAW del paso 145000 y no deben mezclarse con otro checkpoint ni con modo EMA; el release no incluye pesos EMA.
- No se incluyen activos MANO, pesos del detector ni datos de entrenamiento; deben obtenerse por separado y bajo sus propias licencias.
- `dino_finetuned.pt` es un state dict para el wrapper de JoHan, no un checkpoint de Transformers ni un sustituto directo de `--dino-weights`.
- Licencia mixta: los pesos JoHan son MIT, pero los pesos DINOv3 afinados quedan sujetos a la licencia de Meta; DINOv3, MANO y WiLoR deben acreditarse y usarse bajo sus términos respectivos. Es necesario revisar `LICENSE.md` y `DINOV3_LICENSE.md` antes de un uso comercial.
- No hay métricas publicadas de precisión sobre vídeo completo ni de rendimiento en GPU; las validaciones documentadas son solo de integración.
- Riesgo de sesgos y alucinación: no disponible en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HypnosXC/JoHan_pretrained
- Artículo: https://arxiv.org/abs/2610.10512
- Página del proyecto: https://hypnosxc.github.io/JoHan-project/
- Repositorio de código: https://github.com/HypnosXC/JoHan
- Notas de validación: https://github.com/HypnosXC/JoHan/blob/master/VALIDATION.md
- DINOv3: https://github.com/facebookresearch/dinov3
- WiLoR (detector): https://github.com/rolpotamias/WiLoR
- MANO: https://mano.is.tue.mpg.de/
