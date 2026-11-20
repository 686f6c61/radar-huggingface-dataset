# ipsilondev/ddcolor-onnx

## Resumen

ddcolor-onnx es una conversión a ONNX del modelo DDColor en su variante "paper tiny", un sistema de colorización automática de fotografías en blanco y negro desarrollado originalmente por el equipo de piddnad. La conversión la firma el desarrollador ipsilondev y está pensada para ejecutarse en dispositivos mediante ONNX Runtime, concretamente como motor de la aplicación ReTint (`com.ipsilondev.retint`). El modelo resuelve el problema de añadir color plausible a imágenes históricas o monocromas sin intervención manual.

Arquitectónicamente combina un codificador ConvNeXt-T con un decodificador de color multi-escala (MultiScaleColorDecoder) de 9 capas y 100 consultas, que predice los canales cromáticos `a` y `b` en espacio CIE Lab. El resultado es un único fichero ONNX de 121.324.284 bytes (unos 121 MB) con pesos y operaciones en fp16, pero entradas y salidas en float32 para facilitar la integración.

Su relevancia actual reside en que ofrece una alternativa ligera (0,1 GB de repositorio) y con licencia Apache-2.0 para colorización en local, sin dependencia de servicios en la nube, con una fidelidad numérica verificada frente al modelo PyTorch original (dE2000 medio de 0,027 frente al fp32).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt-T (codificador) + MultiScaleColorDecoder (decodificador de color multi-escala) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 1x3x512x512) |
| Tipos de cuantización | fp16 (pesos y operaciones); entradas y salidas en float32 |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), fichero `ddcolor_paper_tiny.onnx` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DDColor original: un codificador ConvNeXt-T extrae características de la imagen en escala de grises y un decodificador MultiScaleColorDecoder con 9 capas, 3 escalas y 100 consultas predice los canales `ab` de CIE Lab. La normalización con media y desviación estándar de ImageNet está embebida dentro del grafo ONNX, de modo que la entrada es directamente una imagen RGB en gris con valores 0-1 y la salida son los canales `ab` en unidades Lab (aproximadamente -128 a 127) sin escalado adicional.

Los pesos proceden del checkpoint `pytorch_model.bin` de `piddnad/ddcolor_paper_tiny` (revisión `cf9fd99c1d7472689ec7413441c1b799a51866a3`), entrenado sobre ImageNet según la model card. La conversión se realizó con `torch.onnx.export` (exportador legacy, `dynamo=False`), entrada 1x3x512x512, opset 17, seguida de `onnxslim.slim` y `onnxconverter_common.float16.convert_float_to_float16(..., keep_io_types=True)`. El script de conversión (`convert_ddcolor.py`) está incluido en el repositorio. No se documentan detalles sobre volumen de tokens, composición del dataset ni fases de RLHF o DPO, ya que se trata de un modelo de visión.

## Capacidades

- Colorización automática de fotografías en blanco y negro: predice los canales `a` y `b` de CIE Lab a partir del canal L.
- Entrada de imagen fija de 512x512 píxeles en RGB (copia en gris) y salida de 512x512 con dos canales cromáticos.
- Integración en pipelines de imagen a imagen mediante ONNX Runtime.
- Ejecución en dispositivo (on-device) sin necesidad de GPU dedicada, según el propósito declarado por el autor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de texto.
- No dispone de capacidades multilingües, de audio ni de vídeo.
- No incluye modo "thinking" ni funcionalidades de visión más allá de la colorización.

## Casos de uso

- Restauración de fotografías históricas: el modelo recibe una copia en gris de 512x512 de la imagen, predice los canales `ab` y el pipeline reconstruye la imagen a resolución completa concatenando el canal L original con los `ab` redimensionados bilinealmente. Adecuado por su licencia permisiva y su tamaño reducido.
- Aplicaciones móviles de retoque fotográfico: es el motor declarado de la app ReTint (`com.ipsilondev.retint`), lo que demuestra su viabilidad en despliegues on-device con ONNX Runtime.
- Digitalización de archivos y fondos documentales: permite colorear lotes de imágenes escaneadas en pipelines automatizados sin depender de servicios externos.
- Generación de contenido para previsualización: útil para dar una versión coloreada aproximada de material monocromo antes de una restauración manual más fina.
- Prototipado e investigación en colorización: al ser una conversión verificada numéricamente frente al modelo PyTorch (dE2000 medio de 0,027), sirve como referencia para comparar implementaciones.
- Integración en herramientas de escritorio o web que ejecuten ONNX Runtime: el fichero único de 121 MB y la licencia Apache-2.0 facilitan su empaquetado en productos comerciales.
- Educación y demostraciones: permite mostrar el funcionamiento de un pipeline Lab completo (extracción de L, predicción de ab, reconstrucción) con un modelo pequeño y reproducible.

## Benchmarks y rendimiento

La model card incluye una verificación de fidelidad numérica frente al modelo PyTorch original, medida con CIEDE2000 sobre 10 fotografías de muestra de scikit-image (lado largo limitado a 768 px) usando ONNX Runtime 1.24 en CPU con 4 hilos:

| Comparación | dE2000 medio | dE2000 p95 (peor) |
|---|---|---|
| ONNX fp32 (slim) vs PyTorch | 0,00005 | 0,0009 |
| ONNX fp16 (este fichero) vs PyTorch | 0,027 | 0,208 |

Los objetivos declarados por el autor son un dE2000 medio ≤ 1,0 y un p95 ≤ 3, que se cumplen holgadamente. No se han publicado resultados de benchmarks de calidad de colorización (por ejemplo, FID o métricas perceptuales) ni de latencia en dispositivo en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero ONNX ocupa unos 121 MB, por lo que la huella en memoria es reducida y compatible con GPUs de gama baja y con ejecución en CPU.
- GPU recomendadas: no se especifican; el autor indica ejecución on-device con ONNX Runtime, sin medir latencia por falta de dispositivo durante la conversión.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no hay cifras publicadas que lo confirmen.
- Opciones de despliegue: ONNX Runtime (versión 1.24 usada en la verificación); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no medidos según la model card ("On-device latency is not measured yet").

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ddcolor-onnx (este) | ConvNeXt-T + MultiScaleColorDecoder | 512x512 | ONNX fp16 | Apache-2.0 | Hugging Face |
| piddnad/ddcolor_paper_tiny | ConvNeXt-T + MultiScaleColorDecoder | 512x512 | PyTorch (`pytorch_model.bin`) | Apache-2.0 | Hugging Face |
| Otras variantes DDColor (paper, large) | ConvNeXt + decodificador multi-escala | no disponible | PyTorch | Apache-2.0 | Hugging Face (repositorio piddnad) |

La comparativa se limita al ecosistema DDColor porque la información disponible no incluye datos de otros modelos de colorización alternativos (por ejemplo, DeOldify u otras propuestas). No se dispone de métricas de calidad comparativas entre variantes.

## Limitaciones y advertencias

- Los colores generados son conjeturas plausibles, no una reconstrucción histórica fiel, tal como advierte el propio autor.
- La entrada está fija a 512x512; el pipeline redimensiona la copia en gris y luego reescala los canales `ab` bilinealmente, lo que puede perder detalle en imágenes de alta resolución.
- No se han medido latencias reales en dispositivo, por lo que el rendimiento en producción es incierto.
- El modelo no procesa texto ni tiene capacidades multilingües; cualquier expectativa en ese sentido es inaplicable.
- Riesgo de sesgos y alucinaciones cromáticas: al inferir color a partir de la luminancia, puede producir tonalidades incorrectas en escenas ambiguas o poco representadas en el entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero conviene conservar los avisos de atribución del modelo y del código upstream.
- Es una conversión de terceros: la responsabilidad sobre la calidad final recae en el autor de la conversión, no en el equipo original de DDColor.
- No se documentan limitaciones específicas de idioma ni de composición del dataset de entrenamiento más allá de ImageNet.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ipsilondev/ddcolor-onnx
- Modelo base: https://huggingface.co/piddnad/ddcolor_paper_tiny
- Código upstream: https://github.com/piddnad/DDColor (commit `2adb63f2656ac41cbdf7b894cddd94121a3faf13`)
- Script de conversión: `convert_ddcolor.py` incluido en el repositorio de Hugging Face
- Verificación numérica: `verify_deltaE.json` incluido en el repositorio de Hugging Face
