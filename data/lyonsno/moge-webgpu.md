# lyonsno/moge-webgpu

## Resumen

MoGe-WebGPU es una conversión completa del modelo MoGe-2 de Microsoft Research a pesos fp16 listos para ejecutarse en el navegador mediante WebGPU. El modelo original, desarrollado por el equipo de MoGe (paper arXiv:2507.02546), realiza estimación de profundidad monocular y normales de superficie a partir de una sola imagen. Esta versión, creada por lyonsno, elimina la necesidad de servidor, WASM o runtime ONNX, ya que todos los tensores se cargan directamente como buffers WebGPU.

La relevancia de este modelo radica en que permite ejecutar inferencia de visión por computadora en el cliente, con privacidad total de los datos y latencia mínima, sin depender de infraestructura externa. El modelo base es `Ruicheng/moge-2-vitl-normal`, que combina un encoder DINOv2 ViT-Large con un decoder ConvStack. El repositorio contiene un único archivo `weights.bin` de aproximadamente 660 MB en formato fp16, junto con un manifiesto JSON que describe nombres, formas y offsets de cada tensor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-Large (encoder) + ConvStack (decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | fp16 (binario plano) |
| Idiomas soportados | no aplicable (procesamiento de imagenes) |
| Licencia | MIT |
| Formato de pesos | weights.bin (fp16 binario) + weights.json (manifiesto) |

## Arquitectura y entrenamiento

El modelo subyacente es MoGe-2, desarrollado por Microsoft Research, que utiliza un encoder DINOv2 ViT-Large preentrenado y un decoder basado en capas convolucionales (ConvStack) para predecir mapas de profundidad y normales de superficie. El entrenamiento original se realizó sobre datasets de imágenes con anotaciones de profundidad y normales, aunque los detalles específicos del dataset y el número de tokens no se han publicado en la información disponible.

La conversión a WebGPU no modifica la arquitectura ni los pesos; simplemente transforma el checkpoint original de PyTorch a un formato binario fp16 plano, concatenando todos los tensores para permitir una carga directa en buffers WebGPU. El script de conversión (`tools/convert_weights.py`) reproduce este proceso a partir del checkpoint original.

## Capacidades

- Estimación de profundidad monocular a partir de una sola imagen RGB.
- Estimación de normales de superficie por píxel.
- Ejecución completamente en el navegador mediante WebGPU compute shaders, sin servidor ni dependencias externas.
- Inferencia en tiempo real para imágenes individuales, con carga automática de pesos en el primer uso.
- Compatible con cualquier dispositivo que soporte WebGPU (Chrome, Edge, Safari, Firefox en versiones recientes).
- No requiere WASM, ONNX Runtime ni bibliotecas JavaScript de ML adicionales.

## Casos de uso

- Realidad aumentada en el navegador: superponer objetos virtuales sobre superficies reales usando la profundidad estimada para oclusión y posicionamiento correctos.
- Edición de fotos con efecto de desenfoque de fondo (bokeh) o reiluminación, usando normales de superficie para simular iluminación direccional.
- Inspección industrial ligera: medir dimensiones aproximadas de objetos a partir de una foto tomada con un móvil, sin enviar datos a un servidor.
- Asistencia a personas con discapacidad visual: estimar la distancia a obstáculos en tiempo real desde la cámara del dispositivo.
- Creación de contenido 3D: generar mapas de profundidad para convertir imágenes 2D en mallas o nubes de puntos, directamente en el navegador.
- Prototipado de robótica educativa: integrar la estimación de profundidad en simulaciones web para que estudiantes experimenten con percepción visual sin hardware especializado.
- Análisis de imágenes médicas (uso no diagnóstico): preprocesamiento de fotografías de heridas o lesiones para estimar profundidad y volumen, manteniendo los datos en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas comparativas de precisión (como RMSE en NYUv2 o KITTI) ni mediciones de velocidad de inferencia en diferentes GPUs. Se recomienda consultar el paper original de MoGe-2 para datos de rendimiento del modelo base, aunque la conversión a fp16 y la ejecución vía WebGPU pueden introducir diferencias respecto a la inferencia en PyTorch.

## Requisitos de hardware

- Navegador con soporte WebGPU (Chrome 113+, Edge 113+, Safari 26+, Firefox 141+).
- GPU compatible con WebGPU: cualquier GPU moderna integrada o dedicada (Intel HD Graphics 620+, AMD Vega, NVIDIA GTX 900+, Apple Silicon).
- VRAM estimada: aproximadamente 1-2 GB para los pesos fp16 (660 MB) más buffers intermedios y activaciones.
- No requiere GPU de servidor; funciona en portátiles y dispositivos móviles con WebGPU habilitado.
- Opciones de despliegue: exclusivamente en navegador, sin soporte para vLLM, llama.cpp u otros motores de inferencia tradicionales.
- Latencia y throughput: no disponibles; dependen de la GPU del cliente y del tamaño de la imagen de entrada.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para esta conversión específica. Como referencia, el modelo base MoGe-2 compite con otras arquitecturas de estimación de profundidad monocular como MiDaS, Depth Anything y ZoeDepth, pero no se han encontrado benchmarks que comparen directamente esta versión WebGPU con ellas. La principal diferencia es el entorno de ejecución (navegador vs. servidor) y el formato de pesos (fp16 binario vs. safetensors/PyTorch).

## Limitaciones y advertencias

- Precisión reducida por el uso de fp16, que puede afectar la calidad de la profundidad en zonas de baja textura o bordes finos.
- Dependencia de la implementación WebGPU del navegador; el rendimiento y la compatibilidad varían según el fabricante y la versión.
- No se han documentado sesgos específicos del modelo, pero al ser un modelo de visión entrenado con datos públicos, puede presentar errores en imágenes con condiciones de iluminación extremas, superficies reflectantes o objetos transparentes.
- Riesgo de alucinación en regiones sin información visual clara (cielo, paredes uniformes), generando profundidades inconsistentes.
- Licencia MIT permite uso comercial, pero el modelo base MoGe-2 tiene su propia licencia (MIT según el repositorio original); se recomienda verificar los términos del checkpoint original.
- El tamaño del archivo de pesos (660 MB) puede suponer una carga inicial lenta en conexiones de baja velocidad, aunque se descarga una sola vez y se cachea.

## Enlaces

- HuggingFace: https://huggingface.co/lyonsno/moge-webgpu
- Repositorio GitHub: https://github.com/lyonsno/moge-webgpu
- Paper MoGe-2: https://arxiv.org/abs/2507.02546
- Modelo base: https://huggingface.co/Ruicheng/moge-2-vitl-normal
- Perfil del autor: https://github.com/lyonsno/lyonsno
