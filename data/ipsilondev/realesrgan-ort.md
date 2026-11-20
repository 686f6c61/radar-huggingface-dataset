# ipsilondev/realesrgan-ort

## Resumen

realesrgan-ort es una conversión al formato ONNX Runtime (`.ort`) del modelo de superresolución Real-ESRGAN, desarrollado originalmente por Xintao Wang y publicado bajo licencia BSD-3-Clause. El repositorio, mantenido por ipsilondev, contiene dos variantes (x2 y x4) de la red RRDBNet de Real-ESRGAN, empaquetadas para su uso embebido en aplicaciones móviles Android nativas. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de una red convolucional de upscaling de imágenes.

El modelo está diseñado para procesar mosaicos (tiles) de 256 × 256 píxeles en RGB float32 con rango 0-1, produciendo salidas de 512 × 512 (x2) o de 1024 × 1024 (x4). Cada fichero pesa aproximadamente 18,9 MB, lo que lo hace adecuado para despliegue en dispositivos con recursos limitados. Su relevancia radica en que permite restaurar y ampliar imágenes con calidad fotográfica directamente en el dispositivo, sin depender de servicios en la nube.

La model card indica que los ficheros son copias byte a byte de los artefactos incluidos en las apps Android de ipsilondev (Enhancer AI, ReTint, Neg2Pic, KidArtBook, WinkPic). La receta exacta de conversión desde los pesos PyTorch públicos no está documentada en el repositorio de origen, por lo que la trazabilidad completa del proceso de exportación no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RRDBNet (Real-ESRGAN, red convolucional generativa) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, entrada fija 256 × 256 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en formato ORT; precisión de inferencia float32 según la interfaz de entrada) |
| Idiomas soportados | no disponible (modelo de imagen, no procesa texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | `.ort` (ONNX Runtime optimizado); exportable a `.onnx` desde los pesos PyTorch públicos |

| Fichero | Tamano (bytes) | SHA-256 |
|---|---|---|
| `realesrgan-x2-256.8i.ort` | 18.932.072 | `7691b226abff11c219eae2f0ef414e8962526a1d2a89aeea9ca3f582369fcd4b` |
| `realesrgan-x4-256.8i.ort` | 18.922.576 | `bc6e0f19e8822f2f2b32c6b81e52e1046c96c82f6b4f893124e38b7daed8b237` |

## Arquitectura y entrenamiento

El modelo subyacente es Real-ESRGAN, una red RRDBNet (Residual-in-Residual Dense Block Network) que combina bloques densos residuales con conexiones de salto para la reconstrucción de imágenes a alta resolución. Real-ESRGAN se entrena con un esquema de degradación sintética de segundo orden que simula artefactos del mundo real (desenfoque, ruido, compresión JPEG) para mejorar la generalización fuera de distribuciones limpias. El entrenamiento original incorpora una pérdida adversarial (GAN) junto con pérdidas perceptuales y de píxel.

Los artefactos de este repositorio son conversiones de los pesos públicos `xinntao/Real-ESRGAN` (variantes x2plus y x4plus). No se dispone de información sobre el número exacto de tokens de entrenamiento (no aplica), la composición del dataset ni detalles de RLHF/DPO, ya que se trata de un modelo de visión. La innovación técnica destacable en este repositorio es el empaquetado en formato ORT para inferencia móvil, con un esquema de tiles de 256 px con solapamiento reflectante de 16 px y mezcla lineal (cross-fade) para evitar costuras en imágenes grandes.

## Capacidades

- Superresolución de imágenes x2 y x4: amplía imágenes de 256 × 256 a 512 × 512 o 1024 × 1024 píxeles por tile.
- Procesamiento por mosaicos con solapamiento de 16 px y cross-fade lineal para imágenes de mayor tamaño.
- Límite de borde largo de salida de 6144 px (según la implementación de ReTint).
- Entrada RGB float32 en rango 0-1, formato `[1, 3, 256, 256]`.
- Restauración de imágenes degradadas (ruido, desenfoque, compresión) gracias al esquema de degradación de Real-ESRGAN.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de texto).
- No dispone de modo thinking, visión general (solo upscaling) ni audio.

## Casos de uso

- Restauración de fotos antiguas en apps móviles: el modelo puede ampliar y limpiar fotografías escaneadas o de baja resolución directamente en el dispositivo, con un coste de memoria bajo (ficheros de ~19 MB) y sin enviar datos a la nube.
- Mejora de capturas de pantalla y miniaturas: útil para generar previews de alta resolución en galerías o tiendas de aplicaciones, procesando tiles de 256 px de forma incremental.
- Upscaling de imágenes para impresión: la variante x4 permite generar salidas de hasta 6144 px de borde largo, adecuadas para impresión de pequeño formato a partir de originales de baja resolución.
- Procesamiento por lotes en pipelines de imagen: al ser un grafo ONNX Runtime, puede integrarse en flujos de preprocesado o postprocesado con `onnxruntime` en Python, C++ o Java/Kotlin (Android).
- Integración en apps Android nativas: ReTint (`com.ipsilondev.retint`) carga únicamente el fichero x2; Neg2Pic, KidArtBook y WinkPic usan el x4, lo que demuestra su viabilidad en producción móvil.
- Restauración de imágenes de productos para e-commerce: permite mejorar fotos de catálogo con poca resolución antes de publicarlas, manteniendo la coherencia visual mediante el cross-fade entre tiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del grafo (~19 MB) y la entrada fija de 256 × 256 en float32, el consumo de memoria es moderado y apto para GPU integradas y móviles.
- GPU recomendadas: no disponible; el modelo está pensado para inferencia en CPU/GPU móvil vía ONNX Runtime, no se especifican GPU de escritorio.
- Cabe en GPU consumer: sí, por tamaño del modelo (los pesos ocuparían menos de 20 MB en memoria); cualquier GPU con soporte ONNX Runtime puede ejecutarlo.
- Opciones de despliegue: ONNX Runtime (`.ort`), exportación a `.onnx` desde pesos PyTorch públicos, integración Android vía AAR de ONNX Runtime.
- Latencia y throughput estimados: no disponible. La model card indica que la compatibilidad de versión del formato ORT con el AAR de ONNX Runtime de la app no está verificada hasta la ejecución en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| realesrgan-ort (este) | no disponible | 256 × 256 px, salida x2/x4 | no disponible | BSD-3-Clause | Hugging Face (ipsilondev) |
| Real-ESRGAN (xinntao) | no disponible | entrada variable, salida x2/x4 | no disponible en la informacion | BSD-3-Clause | GitHub / pesos PyTorch |
| SwinIR | no disponible | entrada variable, salida x2/x4 | no disponible en la informacion | Apache-2.0 | GitHub / pesos PyTorch |
| ESRGAN | no disponible | entrada variable, salida x4 | no disponible en la informacion | BSD-3-Clause (según repo original) | GitHub / pesos PyTorch |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al ser un modelo de imagen, los sesgos se manifiestan en la reconstrucción de rostros y texturas, no documentados en la model card.
- Riesgo de alucinación: Real-ESRGAN puede generar detalles plausibles pero inventados en zonas de alta degradación; no está cuantificado en este repositorio.
- Limitaciones de contexto o idioma: no aplica idioma; la entrada está restringida a tiles de 256 × 256 px y la salida a un borde largo máximo de 6144 px en la implementación de ReTint.
- Restricciones de licencia: BSD-3-Clause permite uso comercial, pero exige conservar el texto de licencia (Copyright (c) 2021 Xintao Wang) en copias redistribuidas.
- La procedencia de la conversión no está documentada: los ficheros son copias byte a byte de un repositorio privado, y la receta de exportación desde PyTorch a `.ort` no está registrada.
- Compatibilidad de versión del formato ORT con el AAR de ONNX Runtime no verificada hasta ejecución en dispositivo.
- Si un fichero no carga en una versión más reciente de ONNX Runtime, la model card recomienda reexportarlo a `.onnx` desde los pesos PyTorch públicos.

## Enlaces

- Hugging Face: https://huggingface.co/ipsilondev/realesrgan-ort
- Modelo base: https://huggingface.co/xinntao/Real-ESRGAN
- Repositorio original Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Paper Real-ESRGAN: https://arxiv.org/abs/2107.10833
- ONNX Runtime: https://onnxruntime.ai/
