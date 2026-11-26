# ruisv/rcdl-superres

## Resumen

`ruisv/rcdl-superres` es un paquete de pesos compilados para la NPU del SoC Rockchip RK3588 y RK3588S, derivado del modelo de superresolución Real-ESRGAN `realesr-general-x4v3` (la variante compacta de propósito general con factor ×4). No se trata de un modelo entrenado desde cero, sino de una conversión a formato `.rknn` lista para cargar en placa, sin necesidad de exportar a ONNX, calibrar ni usar `rknn-toolkit2`. Lo publica el autor `ruisv`, responsable también de RCDL, una biblioteca en C++17 y Python que orquesta NPU, RGA y VPU en un pipeline de copia cero.

El modelo resuelve un problema muy concreto de despliegue: llevar superresolución perceptiva a hardware de borde con NPU limitada, evitando el trabajo de conversión y cuantización que normalmente exige cada placa. Cada fichero procesa un tile fijo de 128×128 píxeles RGB y lo reescala a 512×512; la biblioteca RCDL se encarga de trocear fotogramas de cualquier tamaño con solapamiento y recomponerlos con fundido cruzado.

Es relevante ahora porque el ecosistema RK3588 carece de pesos ya compilados y verificados para tareas de visión, y porque el autor publica mediciones reproducibles en placa (acuerdo con el ONNX float, energía de bordes, tiempos por tile) junto con una licencia permisiva BSD-3-Clause que permite uso comercial y redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Real-ESRGAN compacto `realesr-general-x4v3` (red de superresolución, compilada a RKNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | fp16 (por defecto) e int8 |
| Idiomas soportados | no aplica (procesamiento de imagen) |
| Licencia | BSD-3-Clause (pesos y ficheros compilados); RCDL es Apache-2.0 |
| Formato de pesos | `.rknn` (dos ficheros: fp16 de 3,5 MB e int8 de 1,9 MB) |

## Arquitectura y entrenamiento

El modelo subyacente es `realesr-general-x4v3`, la variante compacta de propósito general de la familia Real-ESRGAN, entrenada de forma perceptiva para generar textura plausible en lugar de minimizar el error cuadrático. Esto implica que el modelo "inventa" detalle verosímil: en las pruebas del autor, sobre seis pares de reducción y ampliación ×4, obtiene peor PSNR que el bicúbico (24,55 dB frente a 28,35 dB) pero mucha más nitidez (magnitud de gradiente media de 55,3 frente a 40,5, acercándose a los 62,3 del original).

Los ficheros publicados no contienen información sobre el dataset de entrenamiento original, el número de tokens o pasos, ni sobre el proceso de ajuste (RLHF/DPO no aplica). Lo que sí documenta el autor es el pipeline de compilación: `rknn-toolkit2` 2.3.2, `librknnrt` 2.3.2, driver NPU 0.9.8 y ejecución en un solo núcleo NPU. Cada fichero acepta un tile fijo de 128×128 RGB; la normalización `/255` está dentro del modelo, de modo que la entrada debe entregarse en rango 0..255 (bytes para int8, float32 para fp16). La biblioteca RCDL trocea la imagen en tiles solapados, ejecuta una inferencia por tile y recompone con fundido cruzado.

## Capacidades

- Superresolución de imagen con factor ×4 sobre tiles de 128×128 píxeles RGB.
- Procesamiento de imágenes de cualquier resolución mediante troceado con solapamiento y recomposición (gestionado por `SuperResolver` de RCDL).
- Generación de textura perceptiva y detalle plausible en imágenes degradadas o de baja resolución.
- Ejecución en NPU del RK3588/RK3588S con dos variantes de precisión (fp16 e int8).
- Integración en pipeline de copia cero con RGA y VPU a través de RCDL.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente image-to-image.

## Casos de uso

- Reescalado en tiempo real de vídeo de vigilancia: un flujo 480×270 a 1920×1080 requiere 15 tiles y tarda 1237 ms en fp16 (796 ms en int8) según las mediciones del autor, lo que permite procesar secuencias de baja cadencia en la propia placa sin enviar el vídeo a la nube.
- Mejora de miniaturas y previsualizaciones en dispositivos de borde: el modelo amplía imágenes pequeñas a 512×512 por tile con textura plausible, adecuado para interfaces de usuario en paneles embebidos.
- Restauración de imágenes médicas o industriales de baja resolución en entornos sin conectividad, donde la NPU del RK3588 permite inferencia local con un consumo contenido.
- Preprocesado para pipelines de visión por computador: ampliar recortes pequeños antes de pasarlos a un detector o clasificador que rinde mejor con más resolución.
- Digitalización de documentos y fotografía antigua: el sesgo perceptivo del modelo reconstruye bordes y texturas en imágenes degradadas, aunque conviene validar el resultado por la posible invención de detalle.
- Prototipado y demostraciones en placas RK3588: al estar los pesos ya compilados, se puede evaluar superresolución en hardware real sin montar un entorno de conversión ONNX ni calibrar la cuantización.

## Benchmarks y rendimiento

Datos medidos por el autor en RK3588S con `librknnrt` 2.3.2, driver NPU 0.9.8 y un núcleo NPU:

| Build | Acuerdo con el ONNX float | Energía de bordes | Un tile 128×128 |
|---|---|---|---|
| fp16 (por defecto) | 63,2 dB | 55,3 (igual que el modelo float) | 70–82 ms |
| int8 | 31,5 dB | 66,4 (supera los 62,3 del original) | 40–53 ms |

| Métrica | Bicúbico ×4 | Modelo | Original |
|---|---|---|---|
| PSNR frente al original | 28,35 dB | 24,55 dB | — |
| Magnitud de gradiente media | 40,5 | 55,3 | 62,3 |

El coste es lineal en número de tiles: 480×270 a 1920×1080 son 15 tiles, 1237 ms en fp16 y 796 ms en int8.

## Requisitos de hardware

- SoC objetivo: Rockchip RK3588 o RK3588S con NPU (un núcleo NPU en las mediciones).
- VRAM: no aplica; el modelo usa la NPU y memoria compartida del SoC. Los ficheros ocupan 3,5 MB (fp16) y 1,9 MB (int8).
- No cabe ni está pensado para GPU de consumo (RTX 4090, etc.); requiere el runtime `librknnrt` 2.3.2 y driver NPU 0.9.8.
- Despliegue mediante la biblioteca RCDL (C++17/Python), disponible en canal conda `https://mirrors.ruis.ai/conda` para linux-aarch64.
- Latencia: 70–82 ms por tile en fp16 y 40–53 ms en int8; throughput aproximado de 12–14 tiles/s en fp16 y 19–25 tiles/s en int8 por núcleo NPU.
- Alternativas de despliegue en GPU no están documentadas para este paquete; el modelo original Real-ESRGAN sí puede ejecutarse con PyTorch en GPU, pero estos ficheros `.rknn` son específicos de Rockchip.

## Comparativa con modelos similares

| Modelo | Factor | Formato | Licencia | Hardware | Contexto de uso |
|---|---|---|---|---|---|
| `ruisv/rcdl-superres` (este) | ×4 | `.rknn` | BSD-3-Clause | NPU RK3588/RK3588S | Borde, compilado y verificado |
| Real-ESRGAN `realesr-general-x4v3` | ×4 | PyTorch/ONNX | BSD-3-Clause | GPU/CPU | Referencia upstream, requiere conversión |
| Real-ESRGAN `RealESRGAN_x4plus` | ×4 | PyTorch | BSD-3-Clause | GPU/CPU | Mayor calidad, más pesado, no compilado para NPU |
| SwinIR / HAT | ×4 | PyTorch | Apache-2.0 / MIT | GPU | Alternativas de mayor coste computacional |

No se dispone de datos de benchmarks comparativos entre este paquete y las alternativas en la información proporcionada; las cifras del autor solo comparan contra bicúbico y contra el ONNX float de referencia.

## Limitaciones y advertencias

- El modelo es perceptivo: inventa textura plausible y puede introducir detalle falso. No es adecuado para tareas que exijan fidelidad pixel a pixel (forense, médico diagnóstico, reconstrucción métrica).
- El build int8 es 1,6× más rápido pero visiblemente más ruidoso: su energía de bordes (66,4) supera la del original (62,3), lo que indica ruido de cuantización sobre los bordes.
- Trampa de integración: el build fp16 espera entrada en rango 0..255, no 0..1; normalizar antes produce una imagen oscura e incorrecta.
- Solo procesa tiles de 128×128; imágenes mayores requieren troceado con solapamiento, lo que añade coste lineal y posibles artefactos en las juntas si el solapamiento es insuficiente.
- Dependencia fuerte del hardware: los ficheros `.rknn` solo funcionan en NPU Rockchip RK3588/RK3588S con `librknnrt` 2.3.2 y driver 0.9.8; no son portables a otras plataformas.
- Sin información publicada sobre sesgos del dataset de entrenamiento original ni sobre su composición.
- La licencia BSD-3-Clause permite uso comercial y redistribución de pesos y ficheros compilados, pero RCDL (Apache-2.0) es un producto separado con sus propios términos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/ruisv/rcdl-superres
- Repositorio RCDL: https://github.com/ruisv/rcdl
- Documentación de modelos de RCDL: https://github.com/ruisv/rcdl/blob/main/docs/MODELS.md
- Zoo de modelos verificados: https://github.com/ruisv/rcdl/tree/main/model_zoo
- Real-ESRGAN upstream: https://github.com/xinntao/Real-ESRGAN
- Canal conda de RCDL: https://mirrors.ruis.ai/conda
