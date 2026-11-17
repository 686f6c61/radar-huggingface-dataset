# Luken58/depth-anything-v2-small-litert

## Resumen

Depth Anything V2 Small — LiteRT es una conversión del modelo Depth Anything V2 Small de Meta AI (Lihe Yang et al., 2024) al formato LiteRT (anteriormente TensorFlow Lite) realizada por el usuario Luken58. El modelo original resuelve la estimación de profundidad monocular, es decir, genera un mapa de disparidad relativa a partir de una única imagen RGB. Esta versión mantiene los pesos originales pero los cuantiza a int8 solo en pesos, lo que reduce el tamaño del artefacto y facilita su despliegue en entornos móviles y de borde.

La relevancia de esta conversión reside en su formato: al estar empaquetada como LiteRT/TFLite, puede ejecutarse en dispositivos Android, microcontroladores y sistemas embebidos con aceleración por hardware (GPU delegada, NNAPI) sin necesidad de un runtime de PyTorch. El modelo tiene una entrada fija de 392×518 píxeles y produce un mapa de disparidad de la misma resolución. Es una opción práctica para aplicaciones de visión por computador en tiempo real donde el coste computacional y el consumo energético son críticos.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica, es un modelo de visión) ni los idiomas soportados. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, a diferencia de las variantes Base, Large y Giant del mismo modelo original, que son CC-BY-NC-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (Depth Anything V2 Small, basado en DINOv2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 392×518) |
| Tipos de cuantizacion | weight-only int8 (pesos int8, activaciones float32) |
| Idiomas soportados | no disponible (no aplica, modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT / TFLite (`.tflite`) |

## Arquitectura y entrenamiento

El modelo subyacente es Depth Anything V2 Small, un transformer de visión basado en DINOv2 que estima profundidad monocular relativa. La arquitectura original emplea un encoder DINOv2 y un decoder ligero que produce un mapa de disparidad denso. El entrenamiento de Depth Anything V2 se realizó sobre una combinación de datos sintéticos y reales, con un proceso de destilación desde modelos más grandes y pseudo-etiquetado sobre imágenes no anotadas. No se dispone de detalles concretos sobre el número de tokens de entrenamiento ni la composición exacta del dataset en la información proporcionada.

La conversión a LiteRT se realizó con litert-torch 0.10.0, torch 2.14.1 y transformers 5.23.0, seguida de una cuantización weight-only int8 con ai-edge-quantizer 0.10.1 (esquema `weight_only_wi8_afp32`). Los pesos son idénticos a los del checkpoint original salvo por la cuantización. La normalización ImageNet está integrada dentro del grafo, y las imágenes en formato retrato se transponen automáticamente a la entrada apaisada. El modelo requiere LiteRT 1.2.0 o superior.

## Capacidades

- Estimación de profundidad monocular relativa a partir de una imagen RGB.
- Salida de disparidad relativa (valores mayores indican mayor cercanía), con escala bruta; dividir por el máximo del fotograma reproduce la salida del modelo Core ML de Apple (correlación ≥ 0.9999 en 21 fotogramas de prueba).
- Entrada fija de `[1, 392, 518, 3]` en float32, RGB en rango [0, 1], con normalización ImageNet interna.
- Salida de `[1, 392, 518]` en float32.
- Manejo automático de imágenes en orientación retrato mediante transposición a la entrada apaisada.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no aplica).
- No dispone de modo de pensamiento, visión generativa, audio ni otras capacidades multimodales más allá de la entrada de imagen.

## Casos de uso

- **Realidad aumentada en móviles**: el modelo permite estimar la profundidad de la escena en tiempo real desde la cámara del dispositivo, lo que posibilita la oclusión correcta de objetos virtuales y la colocación de elementos 3D sobre superficies reales. Su formato LiteRT y su cuantización int8 lo hacen adecuado para ejecutarse en GPUs móviles o NNAPI sin agotar la batería.
- **Segmentación y recorte automático de fondos**: a partir del mapa de disparidad, se puede separar el sujeto del fondo en aplicaciones de edición fotográfica o videollamadas. La resolución fija de 392×518 es suficiente para generar máscaras de profundidad que luego se refinan a resolución completa.
- **Navegación asistida para personas con discapacidad visual**: el mapa de profundidad puede convertirse en señales de proximidad (por ejemplo, tonos o vibraciones) para alertar de obstáculos cercanos. La baja latencia esperada en dispositivos de borde y la licencia Apache 2.0 permiten integrarlo en productos comerciales sin restricciones.
- **Detección de obstáculos en robótica de bajo coste**: robots móviles o drones con hardware limitado pueden usar el modelo para estimar distancias relativas y evitar colisiones. La entrada fija y la cuantización reducen los requisitos de memoria y cómputo en comparación con el checkpoint original en PyTorch.
- **Generación de mapas de profundidad para post-procesado de vídeo**: en pipelines de composición digital o efectos visuales, el modelo puede generar mapas de profundidad por fotograma para aplicar desenfoques selectivos, reiluminación o corrección de color basada en profundidad. La correlación ≥ 0.9999 con la implementación Core ML de Apple garantiza consistencia con flujos de trabajo existentes en macOS/iOS.
- **Análisis de escenas en aplicaciones de conducción autónoma a escala reducida**: aunque no sustituye a sensores LiDAR, el modelo puede proporcionar una estimación de profundidad densa como entrada adicional para tareas de detección de carriles o peatones en prototipos y vehículos a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. Al ser un modelo pequeño con cuantización weight-only int8, se espera que quepa en menos de 1 GB de memoria, pero no se proporcionan cifras concretas.
- **GPU recomendadas**: no disponible. El formato LiteRT está orientado a aceleradores móviles (GPU delegada, NNAPI, Hexagon DSP) y a CPU. No se especifican GPU de escritorio compatibles.
- **Compatibilidad con GPU de consumo**: no disponible. El modelo está pensado para dispositivos de borde, no para GPU de escritorio convencionales.
- **Opciones de despliegue**: LiteRT 1.2.0 o superior (runtime de TensorFlow Lite). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- **Latencia y throughput estimados**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Depth Anything V2 Small — LiteRT (este modelo) | no disponible | 392×518 fijo | LiteRT/TFLite int8 | Apache 2.0 | Hugging Face (Luken58) |
| Depth Anything V2 Small (original) | no disponible | resolución variable | PyTorch/safetensors | Apache 2.0 | Hugging Face (depth-anything) |
| Depth Anything V2 Small — Core ML (Apple) | no disponible | resolución variable | Core ML | Apache 2.0 | Hugging Face (apple) |
| Depth Anything V2 Base/Large/Giant | no disponible | resolución variable | PyTorch/safetensors | CC-BY-NC-4.0 | Hugging Face (depth-anything) |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos conocidos**: no disponible. No se documentan sesgos específicos en la información proporcionada, aunque al ser un modelo entrenado con datos diversos puede heredar sesgos de los datasets originales.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero el modelo puede producir mapas de profundidad inexactos en escenas con texturas repetitivas, superficies transparentes, reflejos o iluminación extrema.
- **Limitaciones de contexto o idioma**: no aplica (modelo de visión). La entrada está fija a 392×518 píxeles, lo que limita la resolución de detalle en escenas muy grandes o muy pequeñas.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial sin restricciones adicionales. No obstante, las variantes Base, Large y Giant del modelo original son CC-BY-NC-4.0 y no deben confundirse con esta versión Small.
- **Caveats para producción**: el modelo requiere LiteRT 1.2.0 o superior; versiones anteriores no son compatibles. La salida es disparidad relativa, no profundidad métrica absoluta, por lo que no debe usarse para mediciones de distancia sin calibración adicional. La escala bruta requiere normalización (dividir por el máximo del fotograma) para reproducir la salida de referencia de Apple.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Luken58/depth-anything-v2-small-litert)
- [Depth Anything V2 Small original](https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf)
- [Depth Anything V2 Small — Core ML de Apple](https://huggingface.co/apple/coreml-depth-anything-v2-small)
- [Paper Depth Anything V2 (Lihe Yang et al., 2024)](https://arxiv.org/abs/2406.09414)
- [Repositorio LiteRT](https://github.com/google-ai-edge/LiteRT)
- [Repositorio Depth Anything](https://github.com/DepthAnything/Depth-Anything-V2)
