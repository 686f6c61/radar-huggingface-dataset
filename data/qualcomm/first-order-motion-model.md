# qualcomm/First-Order-Motion-Model

## Resumen

First-Order-Motion-Model (FOMM) es un modelo de animación de imagen: dada una imagen fija de un rostro (o de una figura) y un vídeo de referencia, genera un vídeo sintético en el que el sujeto de la imagen reproduce los movimientos del vídeo de conducción. No es un modelo de lenguaje: no procesa ni genera texto, sino que opera sobre píxeles. La implementación original la firman Aliaksandr Siarohin y colaboradores (paper arXiv:2003.00196, NeurIPS 2019) y este repositorio es la versión reempaquetada y optimizada por Qualcomm para ejecutarse en dispositivos con NPU Snapdragon y Dragonwing.

El repositorio `qualcomm/First-Order-Motion-Model` publica los artefactos ya exportados (ONNX en precisión float, universal, con QAIRT 2.45 y ONNX Runtime 1.27.1) y las métricas de latencia y memoria por chipset medidas con Qualcomm AI Hub Workbench. El modelo se compone de dos redes: un detector (estimador de movimiento por keypoints, 54,2 MB en float) y un generador (red de warping y síntesis, 174 MB en float), con checkpoint `vox-256` y resolución de entrada de 256x256 píxeles.

Su relevancia actual es de despliegue, no de investigación: demuestra que un pipeline de animación facial de dos etapas puede ejecutarse íntegramente en NPU móvil a ~19 ms por fotograma en un Snapdragon 8 Gen 3, lo que habilita avatares y efectos de vídeo en tiempo real sin enviar datos biométricos a la nube. El repositorio de HuggingFace es pequeño en tracción (9 descargas, 2 likes) porque funciona como espejo de los assets de Qualcomm AI Hub más que como modelo de referencia para la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de dos etapas: detector/estimador de movimiento por keypoints no supervisados con transformaciones afines locales + generador con warping denso (paper arXiv:2003.00196) |
| Parametros totales | no disponible (no se publica el recuento; a partir de los pesos en float32, ~13,5 M en el detector y ~43,5 M en el generador, cifra estimada, no confirmada por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; la entrada es una imagen de 256x256 y un vídeo de conducción) |
| Tipos de cuantizacion | float (los assets publicados son de precisión float); no se listan variantes int8/int4 en esta ficha |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT según la etiqueta del repositorio; la licencia de la implementación original se referencia por separado en la model card |
| Formato de pesos | ONNX (float, universal), TFLite (float), PyTorch (librería declarada del repositorio) |
| Tamano del repositorio | 2,7 GB |
| Resolucion de entrada | 256x256 |
| Checkpoint | vox-256 |
| Tamano de pesos (float) | detector 54,2 MB; generador 174 MB |
| Pipeline declarado | image-to-video |
| Fecha de creacion / actualizacion | 2025-05-08 / 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura, descrita en el paper *First Order Motion Model for Image Animation*, separa apariencia y movimiento. Una primera red (el detector del repositorio) extrae un conjunto de keypoints no supervisados de la imagen fuente y del vídeo de conducción y estima, para cada keypoint, una transformación afín local que aproxima el movimiento mediante una expansión de Taylor de primer orden; de ahí el nombre del modelo. Una segunda red (el generador) construye el campo de movimiento denso a partir de esas transformaciones, ocluye las zonas no visibles y sintetiza el fotograma deformando las características de la imagen fuente. El reempaquetado de Qualcomm respeta esa separación en dos artefactos exportables de forma independiente.

El checkpoint publicado es `vox-256`, correspondiente al entrenamiento sobre el conjunto de vídeos de rostros parlantes VoxCeleb a 256x256 píxeles, que es la configuración estándar del repositorio original. No se documenta en la información disponible el número de tokens o de fotogramas de entrenamiento, la composición exacta del dataset, ni si hubo fases de ajuste con preferencias humanas (no aplica RLHF/DPO en un modelo generativo de imagen de este tipo). La innovación relevante aquí no es de entrenamiento sino de despliegue: la exportación a ONNX y TFLite con asignación de la práctica totalidad del cómputo a la NPU, incluidas mediciones por chipset y rango de memoria pico.

## Capacidades

- Animación de imagen a vídeo: transfiere la mímica y el movimiento de un vídeo de conducción a una imagen fija, generando fotogramas de 256x256.
- Reenactment facial: reproducción de gestos, giros de cabeza y expresiones del sujeto conductor sobre el rostro de la imagen fuente.
- Movimiento no rígido genérico: el método no está limitado a rostros; funciona con figuras articuladas y objetos con movimiento deformable razonable.
- Inferencia en dispositivo: el pipeline completo está pensado para ejecutarse en NPU de Qualcomm, sin conexión a red.
- Exportación configurable: la librería `ai-hub-models` permite reexportar con pesos propios afinados, formas de entrada personalizadas y distintas configuraciones de dispositivo y runtime.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: son capacidades de modelos de lenguaje y no aplican a este modelo.
- No hay capacidades multilingües, de audio, de visión por lenguaje ni modo "thinking".

## Casos de uso

- Avatares en tiempo real en aplicaciones móviles: el modelo cabe en NPU móvil y ejecuta el pipeline en torno a 19 ms por fotograma en Snapdragon 8 Gen 3 (3,251 ms del detector + 16,195 ms del generador), lo que permite animar un avatar a partir de la cámara frontal sin salir del dispositivo.
- Videollamadas con ancho de banda reducido: se transmite solo la mímica capturada por keypoints y el receptor reconstruye el vídeo animando una imagen fija previamente compartida, reduciendo el tráfico frente a un stream de vídeo completo.
- Reenactment para doblaje y localización de contenido: se anima la imagen de un actor con el vídeo de la interpretación en otro idioma para reutilizar material sin regrabar (con la limitación de que el modelo no realiza sincronización labial precisa).
- Entretenimiento y filtros sociales: animación de fotos o retratos para stickers, vídeos cortos y efectos, con procesado local que evita subir rostros a servidores de terceros.
- Restauración y animación de fotografías históricas o familiares: revivir retratos antiguos usando un vídeo de conducción grabado por un actor, con despliegue en app móvil gracias al reducido consumo de memoria (rango de pico de 0–192 MB en Snapdragon 8 Gen 3 para el generador).
- Telepresencia con privacidad biométrica: dado que la inferencia ocurre en la NPU local, la imagen y el vídeo del usuario no abandonan el dispositivo, lo que simplifica el cumplimiento de normativa de datos personales.
- Prototipado de pipelines de vídeo generativo en dispositivos embebidos: sirve como referencia de exportación ONNX/TFLite con asignación a NPU para equipos que evalúan plataformas Dragonwing (IQ-8275, IQ-9075, QCS8550, QCS8450) o SA7255P.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para métricas de calidad de generación (FID, LPIPS, SSIM, user study) ni para benchmarks de lenguaje (MMLU, HumanEval, GSM8K), que no aplican a este modelo. La model card sí publica métricas de latencia y memoria medidas con Qualcomm AI Hub Workbench, que se reproducen a continuación.

| Componente | Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|---|
| detector | ONNX | float | Snapdragon 8 Gen 3 Mobile | 3,251 | 0 - 33 | NPU |
| detector | ONNX | float | Snapdragon 8 Gen 1 Mobile | 7,261 | 1 - 36 | NPU |
| detector | ONNX | float | Qualcomm Dragonwing IQ-8275 | 6,553 | 1 - 4 | NPU |
| detector | ONNX | float | Qualcomm Dragonwing QCS8550 (Proxy) | 4,387 | 0 - 29 | NPU |
| detector | ONNX | float | Qualcomm QCS8450 | 7,261 | 1 - 36 | NPU |
| detector | ONNX | float | Qualcomm Dragonwing IQ-9075 | 5,619 | 1 - 4 | NPU |
| detector | ONNX | float | Qualcomm Dragonwing Q-8750 | 2,917 | 0 - 21 | NPU |
| detector | ONNX | float | Snapdragon 8 Elite Mobile | 2,917 | 0 - 21 | NPU |
| detector | ONNX | float | Snapdragon 8 Elite Gen 5 Mobile | 2,748 | 0 - 26 | NPU |
| detector | TFLITE | float | Qualcomm SA7255P | 21,716 | 0 - 22 | NPU |
| generator | ONNX | float | Snapdragon 8 Gen 3 Mobile | 16,195 | 0 - 192 | NPU |
| generator | ONNX | float | Snapdragon 8 Gen 1 Mobile | 36,988 | 16 - 204 | NPU |
| generator | ONNX | float | Qualcomm Dragonwing IQ-8275 | 38,970 | 16 - 20 | NPU |
| generator | ONNX | float | Qualcomm Dragonwing QCS8550 (Proxy) | 21,747 | 18 - 20 | NPU |
| generator | ONNX | float | Qualcomm QCS8450 | 36,988 | 16 - 204 | NPU |
| generator | ONNX | float | Qualcomm Dragonwing IQ-9075 | 34,741 | 18 - 21 | NPU |
| generator | ONNX | float | Qualcomm Dragonwing Q-8750 | 12,914 | 13 - 176 | NPU |
| generator | ONNX | float | Snapdragon 8 Elite Mobile | 12,914 | 13 - 176 | NPU |
| generator | ONNX | float | Snapdragon 8 Elite Gen 5 Mobile | 11,013 | 16 - 186 | NPU |
| generator | TFLITE | float | Qualcomm SA7255P | 2.850,009 | 21 - 37 | CPU |

Nota: los tiempos corresponden a cada componente por separado; la suma de detector y generador en Snapdragon 8 Gen 3 es de 19,446 ms por fotograma. En SA7255P el runtime TFLite cae a CPU para el generador (2.850 ms), lo que descarta el uso en tiempo real en esa configuración.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el pipeline completo en float32 (54,2 MB de detector + 174 MB de generador más activaciones; el pico medido en móvil es de 0–192 MB para el generador).
- Cabe en cualquier GPU de consumo e incluso en iGPU: los requisitos son muy inferiores a los de un modelo de lenguaje. Una RTX 4090, una RTX 3060 o una GPU integrada moderna son más que suficientes; no se necesitan A100 ni H100.
- Plataforma objetivo real: NPU de Qualcomm (Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5, Dragonwing IQ-8275, IQ-9075, Q-8750, QCS8550, QCS8450) y SA7255P.
- Opciones de despliegue: ONNX Runtime 1.27.1 con QAIRT 2.45 para NPU Qualcomm; TFLite; PyTorch para la ejecución de referencia; exportación personalizada mediante la librería Qualcomm AI Hub Models. No aplican vLLM, llama.cpp, Ollama ni TGI: son servidores de inferencia para modelos de lenguaje.
- Latencia y throughput: en Snapdragon 8 Elite Gen 5, 11,013 ms de generador y 2,748 ms de detector (~13,8 ms por fotograma, ~72 fps teóricos antes de otras sobrecargas de pipeline); en Snapdragon 8 Gen 1, ~44,2 ms por fotograma (~22 fps). En SA7255P el generador en CPU queda en ~2,85 s por fotograma, inviable para vídeo en tiempo real.
- Memoria pico en chips Dragonwing de gama industrial: 1–4 MB para el detector y 16–21 MB para el generador, lo que indica un consumo muy contenido en esos SoC.

## Comparativa con modelos similares

| Modelo | Tarea | Pesos pre-exportados para NPU Qualcomm | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qualcomm/First-Order-Motion-Model | Animación de imagen a vídeo | Sí (ONNX float universal + TFLite) | no disponible (estimado ~57 M en total, no confirmado) | MIT (etiqueta del repositorio) | HuggingFace + Qualcomm AI Hub |
| FOMM original (AliaksandrSiarohin/first-order-model) | Animación de imagen a vídeo | No (solo PyTorch) | no disponible | licencia propia enlazada en el repositorio | GitHub |
| MRAA (Motion Representations for Articulated Animation) | Animación de imagen a vídeo, orientada a objetos articulados | No (solo PyTorch) | no disponible | no disponible | GitHub |
| TPSMM (Thin-Plate Spline Motion Model) | Animación de imagen a vídeo | No (solo PyTorch) | no disponible | no disponible | GitHub |
| LivePortrait | Animación de retratos con control fino de expresión | No (solo PyTorch) | no disponible | no disponible | GitHub / HuggingFace |

El diferencial de la versión de Qualcomm no es la calidad de generación, sino la cadena de despliegue: es la única de la lista con artefactos ONNX/TFLite medidos por chipset y asignación verificada a NPU. Frente al FOMM original, el código es el mismo modelo con un pipeline de exportación añadido; frente a MRAA, TPSMM o LivePortrait, la comparación de calidad requeriría benchmarks que no se han publicado en la información disponible.

## Limitaciones y advertencias

- Sesgos y uso indebido: es un modelo de reenactment facial; puede emplearse para crear vídeos falsos de personas reales (deepfakes). Es responsabilidad del integrador aplicar consentimiento explícito, marcas de agua y controles de uso.
- Resolución limitada: la entrada es de 256x256 píxeles. Cualquier salida de mayor resolución requiere superresolución posterior o consenso explícito en la aplicación.
- Alucinación geométrica: como todo método de warping, puede producir artefactos en zonas ocluidas u oclusiones no vistas durante el entrenamiento (manos, pelo, objetos que cruzan el rostro).
- Ausencia de sincronización labial fiable: no es un modelo de lip-sync; para doblaje con sincronía fonética hacen falta modelos especializados.
- Dominio de entrenamiento: el checkpoint `vox-256` se entrenó sobre vídeos de rostros; el rendimiento fuera de ese dominio (cuerpo completo, animales, escenas) no está garantizado ni medido en esta ficha.
- Licencia: el repositorio declara MIT, pero la model card remite a la licencia de la implementación original alojada en el repositorio de Siarohin. Conviene revisar ese fichero antes de un uso comercial, porque los términos pueden diferir de la etiqueta de HuggingFace.
- Rendimiento dependiente del chipset: en SA7255P el generador TFLite cae a CPU y tarda 2.850 ms por fotograma; verificar el runtime y la unidad de cómputo antes de prometer tiempo real.
- Tracción mínima del repositorio (9 descargas, 2 likes): no hay garantía de soporte de la comunidad ni historial de incidencias resueltas.
- Ausencia de métricas de calidad: no se publican FID, LPIPS ni estudios de usuario, por lo que no es posible comparar objetivamente la fidelidad de la animación frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/First-Order-Motion-Model
- Página en Qualcomm AI Hub: https://aihub.qualcomm.com/models/fomm
- Repositorio de exportación (Qualcomm AI Hub Models): https://github.com/qualcomm/ai-hub-models/blob/v0.62.0/src/qai_hub_models/models/fomm
- Paper original: https://arxiv.org/abs/2003.00196
- Implementación original: https://github.com/AliaksandrSiarohin/first-order-model/tree/master
- Licencia de la implementación original: https://github.com/AliaksandrSiarohin/first-order-model/blob/master/LICENSE.md
- Descarga de los assets ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/fomm/releases/v0.62.0/fomm-onnx-float.zip
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Comunidad (Slack de AI Hub): https://aihub.qualcomm.com/community/slack
- Contacto de soporte: mailto:ai-hub-support@qti.qualcomm.com
