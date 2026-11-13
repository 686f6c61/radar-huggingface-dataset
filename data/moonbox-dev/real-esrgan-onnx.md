# moonbox-dev/Real-ESRGAN-ONNX

## Resumen

Real-ESRGAN-ONNX es una distribución en formato ONNX del modelo Real-ESRGAN x4plus, un superresolutor de imágenes de 4x orientado a fotografías del mundo real. La conversión la publica el usuario moonbox-dev bajo el identificador `moonbox-dev/Real-ESRGAN-ONNX`, y su propósito es permitir la inferencia en dispositivos mediante ONNX Runtime con los proveedores CUDA, DirectML y CPU, sin depender del framework PyTorch original. El modelo es un único grafo por precisión, con entradas y salidas de tamaño libre.

El modelo subyacente, Real-ESRGAN, es una red generativa adversarial (ESRGAN) entrenada para degradaciones reales (ruido, compresión JPEG, desenfoque, reescalado mixto) en lugar de degradaciones bicúbicas limpias. Esta distribución concreta no aporta pesos nuevos: exporta el checkpoint oficial `RealESRGAN_x4plus.pth` (release v0.1.0 del repositorio xinntao/Real-ESRGAN) a ONNX en dos precisiones: fp16 e int8. El repositorio ocupa 0,1 GB en total y cada grafo pesa entre 0,02 y 0,03 GB.

La relevancia actual de esta ficha es de tipo práctico: permite integrar un superresolutor GAN maduro en aplicaciones de escritorio, navegador (vía ONNX Runtime Web) o pipelines en C#/C++ sin necesidad de PyTorch, con cifras de latencia medidas en una RTX 3080 Laptop (86 ms por imagen en fp32, 92 ms en int8, 171 ms en fp16). No es un modelo de lenguaje: no tiene parámetros en el sentido de un transformer, ni contexto, ni capacidades de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN de superresolución (RRDB, derivada de ESRGAN); grafo ONNX único |
| Parametros totales | no disponible (el repositorio no publica el recuento; el grafo fp16 ocupa 0,03 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | fp32 (grafo de referencia), fp16, int8 (weight-only, per-channel) |
| Idiomas soportados | no aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (`model.onnx` en carpetas `fp16/` e `int8/`) |

## Arquitectura y entrenamiento

La red es una GAN de superresolución con generador basado en bloques RRDB (Residual-in-Residual Dense Block), la arquitectura introducida por ESRGAN y mantenida en Real-ESRGAN. El generador produce una salida de 4x el tamaño de entrada; el discriminador original se usa solo en entrenamiento y no forma parte del grafo exportado. El grafo ONNX acepta alturas y anchuras arbitrarias, aunque la memoria crece con el tamaño de la imagen porque las últimas capas operan a la resolución de salida (4x por lado).

El entrenamiento original de Real-ESRGAN se realizó sobre degradaciones sintéticas de segundo orden que imitan ruido, desenfoque, compresión y reescalado del mundo real, con una combinación de pérdida perceptual, pérdida adversarial y pérdida L1. Los detalles de composición del dataset, número de iteraciones y uso de RLHF/DPO no están disponibles en la información proporcionada. La innovación de esta distribución es puramente de despliegue: exportación a ONNX, cuantización fp16 con `onnxconverter-common` (entradas y salidas en fp32) y cuantización int8 estática QDQ de ONNX Runtime con calibración MinMax en imágenes fuera del conjunto de evaluación. No se incluye int4 porque la red no contiene capas MatMul, ni bf16 porque el proveedor CUDA de ONNX Runtime no soporta convolución en bf16.

## Capacidades

- Superresolución de imágenes 4x con un único grafo ONNX, sin dependencia de PyTorch.
- Acepta entradas de tamaño libre (altura y anchura arbitrarias); para imágenes grandes se recomienda mosaico con solape.
- Inferencia en CUDA, DirectML y CPU mediante ONNX Runtime.
- Dos precisiones listas para producción: fp16 (mitad de tamaño y memoria) e int8 (un cuarto del tamaño, velocidad similar a fp32).
- Entrada RGB normalizada en rango 0-1, salida 4x en el mismo rango.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión semántica ni audio.

## Casos de uso

- Restauración de fotografías antiguas o de baja resolución: el modelo está entrenado para degradaciones reales (ruido, JPEG, desenfoque), por lo que mejora imágenes de archivo mejor que un upscaler bicúbico; se procesaría por mosaicos de 256 px con 16 px de solape para imágenes grandes.
- Mejora de miniaturas y assets en aplicaciones de escritorio: con el grafo int8 (0,02 GB) y ONNX Runtime con DirectML se puede empaquetar en una app Windows sin GPU dedicada y sin runtime de PyTorch.
- Preprocesado en pipelines de visión por computador: aumentar la resolución de recortes antes de un detector o clasificador, usando el grafo fp16 para reducir memoria en GPUs de gama media.
- Procesamiento por lotes en servidor: con ONNX Runtime y el proveedor CUDA, el grafo int8 rinde a velocidad de fp32 (92 frente a 86 ms por imagen en una RTX 3080 Laptop) con un cuarto del tamaño, lo que reduce el uso de VRAM en despliegues concurrentes.
- Aplicaciones web del lado del cliente: ONNX Runtime Web puede ejecutar el grafo en el navegador para upscaling local sin enviar la imagen a un servidor, útil por privacidad.
- Integración en herramientas de retoque o escaneo de documentos: upscaling de recortes y digitalizaciones con control de mosaico para evitar picos de memoria en imágenes superiores a 1000x1000 px.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos con ONNX Runtime 1.30 (proveedor CUDA) en una RTX 3080 Laptop GPU, sobre Set14 y BSD100 a 4x con entradas reducidas por bicúbica:

| Precision | Tamano | PSNR vs fp32 (Set14 / BSD100) | PSNR-Y vs ground truth | SSIM-Y vs ground truth | Latencia |
|---|---|---|---|---|---|
| fp16 | 0,03 GB | 59,1 / 59,0 dB | 24,73 / 24,22 | 0,673 / 0,629 | 171 ms/imagen |
| int8 | 0,02 GB | 38,8 / 39,0 dB (peor 29,9) | 24,80 / 24,30 | 0,674 / 0,630 | 92 ms/imagen |
| fp32 (referencia) | no indicado | — | no disponible | no disponible | 86 ms/imagen |

El propio autor advierte que el PSNR contra ground truth es bajo en términos absolutos porque Real-ESRGAN se entrena para degradaciones reales y no bicúbicas; las cifras sirven para comparar precisiones entre sí, no como métrica de calidad absoluta frente a modelos entrenados con degradación bicúbica.

## Requisitos de hardware

- VRAM: no se publica una cifra exacta; el tamaño del grafo es de 0,02-0,03 GB, pero la memoria de activaciones crece con el área de la imagen de salida (4x por lado). Para imágenes superiores a 1000x1000 px se recomienda mosaico de 256 px con 16 px de solape.
- GPU recomendadas: RTX 3080 Laptop es la referencia medida; cualquier GPU con soporte CUDA o DirectML es apta. En CPU funciona mediante el proveedor CPU de ONNX Runtime, con latencia no publicada.
- GPU de consumo: sí, cabe en cualquier GPU de consumo moderna; el cuello de botella es la memoria de activaciones, no los pesos.
- Despliegue: ONNX Runtime (CUDA, DirectML, CPU), ONNX Runtime Web; no se mencionan vLLM, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: 86 ms/imagen en fp32, 92 ms en int8 y 171 ms en fp16 en una RTX 3080 Laptop para los tamaños de Set14/BSD100. El autor señala que fp16 fue más lento que fp32 en esa GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Escala | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Real-ESRGAN-ONNX (este) | GAN SR, degradaciones reales | 4x | ONNX (fp16, int8) | BSD-3-Clause | Exportación de `RealESRGAN_x4plus.pth`; sin PyTorch |
| Real-ESRGAN original (xinntao) | GAN SR, degradaciones reales | 4x | PyTorch (.pth) | BSD-3-Clause | Checkpoint de origen; requiere PyTorch y el paquete `realesrgan` |
| ESRGAN (original) | GAN SR | 4x | PyTorch | no disponible en la información | Antecesor arquitectónico; entrenado con degradaciones bicúbicas |
| SwinIR | Transformer SR | 2x/3x/4x | PyTorch | no disponible en la información | Alternativa basada en transformer; no se dispone de comparación de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no tiene contexto, tool calling ni capacidades de agente. Cualquier uso en ese sentido es inválido.
- El PSNR contra ground truth es bajo en términos absolutos (24,7 / 24,2 dB en Y) porque el modelo prioriza degradaciones reales; puede introducir texturas inventadas o halos en imágenes muy limpias.
- La cuantización int8 tiene un PSNR mínimo frente a fp32 de 29,9 dB en el peor caso, lo que puede producir artefactos en detalles finos; el autor optó por cuantización weight-only precisamente para preservar el detalle de los upscalers GAN.
- fp16 fue más lento que fp32 en la GPU medida (171 frente a 86 ms); conviene validar la precisión en el hardware objetivo antes de desplegar.
- Memoria de activaciones proporcional al área de salida: sin mosaico, las imágenes grandes pueden agotar la VRAM.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin endoso; los archivos son derivados del modelo original y heredan su licencia.
- No se publican datos de sesgos, composición del dataset ni evaluación multilingüe (no aplica).

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-dev/Real-ESRGAN-ONNX
- Repositorio original Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Paper Real-ESRGAN (arXiv:2107.10833): https://arxiv.org/abs/2107.10833
- Paquete PyPI: https://pypi.org/project/realesrgan/
- Releases del modelo original: https://github.com/xinntao/Real-ESRGAN/releases
- Model zoo: https://github.com/xinntao/Real-ESRGAN/blob/master/docs/model_zoo.md
- Documentación de entrenamiento: https://github.com/xinntao/Real-ESRGAN/blob/master/docs/Training.md
- FAQ: https://github.com/xinntao/Real-ESRGAN/blob/master/docs/FAQ.md
