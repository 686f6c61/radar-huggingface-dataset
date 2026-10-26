# AbrahamPJ/nightmare-ifrnet

## Resumen

`AbrahamPJ/nightmare-ifrnet` es un paquete de binarios de contexto QNN del modelo IFRNet-S (Kong et al., CVPR 2022), una red convolucional de interpolación de fotogramas, convertidos para ejecutarse en la NPU Hexagon de SoC Qualcomm Snapdragon. No se redistribuyen pesos nuevos ni un modelo reentrenado: los pesos son los del checkpoint GoPro del autor original y solo se ha convertido el grafo a formato QNN. La función es insertar un fotograma intermedio (t = 0,5) entre cada par de fotogramas consecutivos, de modo que un clip de 16 fps se reproduce a 32 fps.

El modelo resuelve un problema muy concreto: la interpolación de movimiento en tiempo real y en el propio dispositivo Android, sin GPU dedicada ni servicios en la nube, dentro del conmutador "Smooth motion" de los nodos de vídeo Wan de la aplicación Nightmare Mobile. Se distribuyen ocho binarios que cubren cuatro resoluciones (832x480, 480x832, 1280x736 y 736x1280) y dos arquitecturas de NPU: `v79` (Snapdragon 8 Elite y chips posteriores) y `v75` (Snapdragon 8 Gen 3), generados con QAIRT 2.49.

Es relevante para desarrolladores de visión por computador en móvil porque ejemplifica el patrón de despliegue de un modelo de vídeo en NPU heterogénea: entrada y salida en fp16 con `[1,3,H,W]` en RGB [0,1], grafo estático con el instante intermedio fijado, y una decisión de precisión mixta (rejilla de warp en int16) para no degradar la calidad geométrica. El repositorio es pequeño (0,1 GB) y la licencia es MIT, igual que el proyecto original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | IFRNet (Kong et al., CVPR 2022), variante small; red convolucional de interpolación de fotogramas con rejilla de warp; grafo convertido a contexto QNN |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de dos fotogramas) |
| Tipos de cuantización | fp16 en todo el grafo, excepto la rejilla de warp a tamaño completo, que se ejecuta en int16; no se publican variantes int8 ni fp32 |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | QNN context binary (`.bin`), generado con QAIRT 2.49; no se incluyen safetensors, GGUF ni ONNX |
| Resoluciones soportadas | 832x480, 480x832, 1280x736, 736x1280 |
| Arquitecturas de NPU | `v79` (Snapdragon 8 Elite y chips posteriores) y `v75` (Snapdragon 8 Gen 3) |
| Entradas | `img0`, `img1`: `[1,3,H,W]`, RGB en [0,1], fp16 |
| Salida | `imgt`: `[1,3,H,W]`, RGB en [0,1], fp16, con t = 0,5 fijado en el grafo |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es IFRNet en su variante small, una red convolucional diseñada específicamente para interpolación de fotogramas que estima el flujo óptico intermedio y construye una rejilla de warp para sintetizar el fotograma central a partir de los dos fotogramas de entrada. El instante de interpolación está fijado en el grafo (t = 0,5), lo que permite eliminar la rama de predicción del tiempo y simplificar el grafo para su despliegue en NPU.

No se ha entrenado ni ajustado ningún peso para esta publicación: el autor indica explícitamente que los pesos son los del checkpoint GoPro del proyecto IFRNet original y que solo se ha convertido el grafo. Por tanto, la composición del dataset de entrenamiento, el número de tokens o fotogramas vistos y el uso de técnicas de refinamiento posteriores corresponden al trabajo de Kong et al. y no se detallan en la información disponible. La innovación técnica de este paquete es de despliegue: conversión a contexto QNN con QAIRT 2.49, fp16 como precisión dominante y promoción de la rejilla de warp de tamaño completo a int16, porque en fp16 la rejilla se desvía hasta 0,3 px en estas anchuras.

## Capacidades

- Interpolación de un fotograma intermedio entre dos fotogramas consecutivos, con el instante t = 0,5 incorporado en el grafo.
- Duplicación de la cadencia: un clip de 16 fps se reproduce a 32 fps tras una pasada de interpolación.
-Ejecución íntegra en la NPU Hexagon de SoC Snapdragon, sin GPU dedicada ni offload a la nube.
- Trabajo en cuatro resoluciones precompiladas, en orientación horizontal y vertical.
- Entrada y salida en fp16 con valores RGB normalizados en [0,1], adecuada para integrarse en pipelines de vídeo que ya trabajan en coma flotante de 16 bits.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje: es un modelo puramente visual.
- No soporta cambio de resolución en tiempo de ejecución ni instantes de interpolación distintos de 0,5 dentro de un mismo binario.
- No se declaran capacidades multilingües ni de audio.

## Casos de uso

- Suavizado de vídeo en reproducción móvil: el conmutador "Smooth motion" de los nodos de vídeo Wan en Nightmare Mobile llama al binario correspondiente a la resolución del clip y duplica la cadencia de 16 a 32 fps, con el coste energético de una NPU en lugar de una GPU.
- Reproductor de vídeo de terceros en Android: integración del contexto QNN en la ruta de render para elevar la cadencia de material grabado a baja tasa (animaciones, capturas de pantalla, GIF convertidos) sin recomprimir el archivo original.
- Cámaras lentas en el dispositivo: a partir de metraje grabado a 30 o 60 fps, la interpolación x2 permite generar versiones a 60 o 120 fps para cámara lenta fluida sin necesidad de grabar a esa cadencia.
- Reducción de ancho de banda en streaming: enviar el vídeo a 16 fps y reconstruir 32 fps en el receptor, siempre que la latencia de la NPU y el consumo del decodificador sean aceptables para el caso de uso.
- Captura de pantalla y game streaming: suavizado de grabaciones de juegos o de la propia interfaz, donde el contenido sintético suele tener movimiento predecible y la resolución encaja en las cuatro variantes publicadas.
- Aplicaciones de edición de vídeo en móvil: previsualización en tiempo real de una línea temporal interpolada antes de exportar, usando el binario `v75` o `v79` según el dispositivo del usuario.
- Procesamiento por lotes en dispositivo para dashcams o cámaras de acción: aumentar la cadencia de clips cortos antes de subirlos, evitando coste de servidor.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| Fidelidad numérica frente al modelo ONNX de referencia | 63,5 dB (PSNR) | Build 1280x736 en un Galaxy S25 Ultra (arquitectura `v79`) |
| Factor de interpolación | x2 (un fotograma nuevo por par) | Instante fijo t = 0,5 |
| Resolución máxima publicada | 1280x736 y 736x1280 | Resto de builds: 832x480 y 480x832 |
| Desviación de la rejilla de warp en fp16 | hasta 0,3 px a estas anchuras | Motivo del uso de int16 para la rejilla a tamaño completo |
| MMLU, HumanEval, GSM8K y similares | no aplica | Modelo de visión para interpolación de fotogramas |
| Calidad perceptual (PSNR/SSIM frente a ground truth en GoPro, Vimeo90K u otros) | no disponible en la información proporcionada | Solo se reporta la diferencia contra el modelo ONNX, no la calidad absoluta |

## Requisitos de hardware

- No se ejecuta en GPU de escritorio ni en CUDA: los binarios son contextos QNN para la NPU Hexagon de Qualcomm.
- SoC soportados: Snapdragon 8 Elite (`v79`, compatible además con chips posteriores) y Snapdragon 8 Gen 3 (`v75`).
- Dispositivo verificado en la model card: Samsung Galaxy S25 Ultra, build 1280x736.
- VRAM: no aplica. No se publican cifras de memoria de NPU ni de RAM del sistema necesarias por build; el repositorio completo ocupa 0,1 GB.
- Latencia y throughput: no disponibles. La referencia práctica es la reproducción de 16 a 32 fps, pero no se indican milisegundos por fotograma ni consumo.
- Despliegue: QAIRT 2.49 con el runtime QNN en Android; los binarios se cargan como contextos precompilados, sin necesidad de convertir el grafo en el dispositivo.
- vLLM, llama.cpp, Ollama o TGI no son aplicables: no es un modelo de lenguaje ni se distribuye en GGUF.

## Comparativa con modelos similares

| Modelo | Tipo | Resoluciones | Precisión | Licencia | Ejecución en NPU Qualcomm | Datos de rendimiento |
|---|---|---|---|---|---|---|
| IFRNet-S QNN (este repositorio) | Contexto QNN precompilado, `v75`/`v79` | 832x480, 480x832, 1280x736, 736x1280 | fp16 con rejilla de warp en int16 | MIT | Sí, nativa | 63,5 dB frente al ONNX en 1280x736 (S25 Ultra) |
| IFRNet-S original (ONNX / PyTorch) | Modelo de referencia del que se parte | No disponible en esta información | No disponible | MIT | No | Es la referencia de la comparación anterior |
| IFRNet en otras variantes (p. ej. tamaños mayores) | Red convolucional de interpolación | No disponible | No disponible | MIT | No | No disponible en esta información |
| Otras familias de interpolación (RIFE, FILM, EMA-VFI) | Redes convolucionales / basadas en flujo | No disponible | No disponible | No disponible | No disponible | No se han consultado datos para esta ficha |

## Limitaciones y advertencias

- El instante de interpolación está fijado en t = 0,5: no se puede generar un fotograma a t = 0,25 o 0,75 sin recompilar el grafo.
- Solo existen cuatro resoluciones y dos arquitecturas de NPU; cualquier otra combinación requiere reconvertir el modelo con QAIRT.
- El checkpoint es el de GoPro del proyecto original. El comportamiento fuera de ese dominio (animación, texto en pantalla, gráficos sintéticos, movimiento muy grande u oclusiones) hereda las limitaciones de IFRNet-S y no se documenta en esta publicación.
- La cifra de 63,5 dB mide similitud con el modelo ONNX, no calidad perceptual frente a la verdad de referencia; no debe interpretarse como una medida de calidad absoluta.
- La cuantización mixta a int16 en la rejilla de warp es una decisión del autor: modificar el grafo o la precisión invalida la comparación reportada.
- No hay validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y una única revisión del repositorio (creado y actualizado el mismo día).
- No se procesa texto ni audio, por lo que no aplican sesgos lingüísticos, tool calling ni riesgos de alucinación conversacional; el riesgo típico es la aparición de artefactos visuales en el fotograma sintetizado.
- Licencia MIT, que permite uso comercial y modificación siempre que se conserve el aviso de copyright; conviene verificar además las condiciones del proyecto IFRNet original y de cualquier dependencia de QAIRT utilizada en la conversión.
- El sufijo "nightmare" del nombre del repositorio es una etiqueta del proyecto de aplicación y no implica ninguna característica técnica ni restricción de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbrahamPJ/nightmare-ifrnet
- Repositorio original de IFRNet (Kong et al., CVPR 2022): https://github.com/ltkong218/IFRNet
- Aplicación Nightmare Mobile: https://github.com/AbrahamPaulJ/nightmare-mobile
- Paper de referencia citado (Kong et al., CVPR 2022): mencionado en la model card, sin URL incluida en la información disponible.
- La búsqueda web realizada no devolvió ningún enlace técnico relevante sobre este modelo; los resultados obtenidos no guardan relación con el contenido de la ficha y se han descartado.
