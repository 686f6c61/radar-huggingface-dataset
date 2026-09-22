# skillsafe-ai/realesrgan-x2plus

## Resumen

Real-ESRGAN x2plus (skillsafe-ai/realesrgan-x2plus) es un paquete de artefactos ONNX listos para navegador que implementan superresolución de imagen con factor de escala 2x. No es un modelo entrenado desde cero: es una conversión reproducible, generada por la herramienta de SkillSafe, de los pesos oficiales `RealESRGAN_x2plus.pth` del proyecto Real-ESRGAN de Xintao Wang, con arquitectura RRDBNet de 23 bloques. El repositorio contiene dos variantes, `model.onnx` (fp32, 63,97 MB) y `model_fp16.onnx` (fp16, 32,21 MB), con contrato de entrada/salida documentado y verificación numérica frente a la referencia en PyTorch.

El problema que resuelve es la ampliación y restauración de imágenes directamente en el cliente, sin enviar los píxeles a un servidor. Al estar exportado a ONNX con opset 17 y pensado para `onnxruntime-web` con ejecución en WebGPU o WASM, permite integrar superresolución 2x en aplicaciones web y de escritorio con un único fichero de 32 a 64 MB, algo relevante para casos donde la privacidad del dato o la latencia de red son críticos.

Su relevancia actual es de tipo práctico más que de investigación: fija la procedencia (hash SHA-256 del peso original, receta, versiones de toolchain y fecha de conversión), publica los números de verificación y mantiene la licencia BSD-3-Clause del proyecto original. La model card no incluye parámetros totales, idiomas ni resultados de benchmarks de calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RRDBNet (residual-in-residual dense blocks), 23 bloques, según la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; la entrada se define por resolución H×W) |
| Tipos de cuantizacion | fp32 y fp16; no se publican variantes int8/int4 |
| Idiomas soportados | no aplica (modelo de imagen, sin componente textual) |
| Licencia | BSD-3-Clause (pesos originales de Xintao Wang); la receta y la model card llevan la licencia del repositorio SkillSafe |
| Formato de pesos | ONNX (opset 17); origen upstream en `.pth` |
| Tarea | image-super-resolution (según tags de HuggingFace) |
| Factor de escala | 2x |
| Ficheros | `model.onnx` (63,97 MB), `model_fp16.onnx` (32,21 MB) |
| Contrato de entrada | `input` float32 `[batch, 3, height, width]` |
| Contrato de salida | `output` float32 `[batch, 3, height_x2, width_x2]` |
| Ejecución | onnxruntime-web (WebGPU, WASM) y ONNX Runtime genérico |
| Tamano del repo | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de conversión | 2026-09-22T18:53:36+00:00 |

## Arquitectura y entrenamiento

La arquitectura es RRDBNet con 23 bloques, la red generadora clásica de la familia ESRGAN/Real-ESRGAN. Cada bloque residual-in-residual agrupa bloques densos con conexiones residuales, y la salida se reescala 2x mediante operaciones de *upsampling*. El modelo aquí publicado no modifica la topología: es una exportación del peso upstream `RealESRGAN_x2plus.pth` (SHA-256 `49fafd45f8fd7aa8d31ab2a22d14d91b536c34494a5cfe31eb5d89c2fa266abb`) a ONNX con Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin arm64. La receta (`realesrgan-x2plus.yaml`) está fijada por hash, y el `manifest.json` del repositorio registra fuentes, toolchain, hash de `uv.lock` y cifras de verificación por fichero.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o de pérdidas perceptuales y adversarias) no se recogen en la información proporcionada; corresponden al proyecto upstream xinntao/Real-ESRGAN y a su publicación asociada. La única validación técnica publicada aquí es numérica, no de calidad perceptual: se compara la salida de ONNX Runtime en CPU contra la referencia PyTorch sobre entradas uniformes con semilla, con umbrales definidos en la receta (`fp32: max_abs 0.0001`; `fp16: max_abs 0.05, psnr_db 45`). La innovación destacable del paquete es la reproducibilidad y la trazabilidad de la conversión, más que un cambio arquitectónico.

## Capacidades

- Superresolución de imagen con factor 2x: entrada `[batch, 3, H, W]` en float32, salida `[batch, 3, 2H, 2W]`.
- Restauración de detalle y reducción de artefactos de compresión propios del modelo upstream Real-ESRGAN.
- Inferencia en navegador mediante `onnxruntime-web`, con selección de *execution providers* (`webgpu`, `wasm`).
- Ejecución también en ONNX Runtime de servidor o escritorio (CPU y aceleradores compatibles).
- Dos variantes de precisión intercambiables: fp32 para máxima fidelidad numérica y fp16 para la mitad de tamaño de fichero y menor huella de memoria.
- Procesamiento por lotes: la dimensión `batch` está declarada en el contrato de E/S.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Modo *thinking*, visión de alto nivel, audio o generación de texto: no aplica (es un modelo puramente de imagen).

## Casos de uso

- Mejora de imágenes subidas por usuarios en una aplicación web: el fichero fp16 (32,21 MB) se carga una vez y la inferencia se ejecuta en WebGPU del propio dispositivo, de modo que la imagen original nunca sale del navegador; útil en herramientas de edición o redes sociales con requisitos de privacidad.
- Reducción de coste de subida y almacenamiento: se envía al servidor una versión reducida de la imagen y se reconstruye a 2x en el cliente, ahorrando ancho de banda en conexiones móviles.
- Miniaturas y avatares en interfaces de alta densidad: ampliación 2x de recursos gráficos pequeños antes de mostrarlos en pantallas de alta resolución, evitando el aspecto borroso del escalado bicúbico del navegador.
- Previsualización de imágenes de producto en comercio electrónico: generación de una vista 2x para zoom sin necesidad de almacenar un máster de mayor resolución por cada artículo.
- Recuperación de material escaneado o de baja resolución con procesamiento por lotes: en un servicio backend con ONNX Runtime (CPU o GPU) se puede recorrer un archivo de imágenes y aplicar 2x con la variante fp32 para preservar fidelidad numérica.
- Capturas de pantalla y documentación técnica en aplicaciones web: ampliación 2x de capturas antes de incrustarlas en tutoriales o informes, con ejecución local si se usa WASM y sin GPU dedicada.
- Procesamiento en el borde (edge): con el *provider* WASM y el artefacto fp16, el modelo cabe en entornos con memoria limitada y sin acelerador, lo que permite desplegarlo en aplicaciones de escritorio empaquetadas (Electron, Tauri) o extensiones de navegador.
- Integración en un pipeline de preprocesado: al ser ONNX, puede encadenarse con otros modelos de visión (detección, segmentación, OCR) que consuman la salida 2x antes de su propia inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (PSNR/SSIM sobre datasets de referencia, LPIPS, etc.) en la información disponible. La model card solo documenta la verificación de equivalencia entre la exportación ONNX y la referencia PyTorch:

| Variante | Entrada | Max abs | Mean abs | PSNR |
|---|---|---|---|---|
| fp32 | 64×64 | 1,85e-06 | 3,35e-07 | 127,5 dB |
| fp32 | 80×96 | 2,03e-06 | 3,39e-07 | 127,4 dB |
| fp16 | 64×64 | 6,18e-04 | 6,55e-05 | 81,5 dB |
| fp16 | 80×96 | 6,99e-04 | 7,89e-05 | 79,8 dB |

Umbrales de aceptación definidos en la receta: `fp32: max_abs ≤ 0,0001`; `fp16: max_abs ≤ 0,05` y `psnr_db ≥ 45`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como orientación basada en la arquitectura, los pesos ocupan 63,97 MB en fp32 y 32,21 MB en fp16, pero el consumo dominante son las activaciones intermedias, que escalan de forma aproximadamente lineal con `H × W`; entradas grandes requieren *tiling* o procesado por parches.
- GPU recomendadas: cualquier GPU con soporte WebGPU para la ruta de navegador; en servidor, tarjetas con soporte de ONNX Runtime CUDA/TensorRT (por ejemplo, series A100, H100 o RTX 4090) para lotes grandes.
- GPU de consumo: sí, es previsible que funcione en GPUs de consumo (RTX 3060 o superiores) y en GPUs integradas vía WebGPU, siempre que se ajuste el tamaño de entrada; no hay cifras oficiales publicadas.
- CPU: viable con ONNX Runtime en CPU, especialmente con la variante fp16 y entradas moderadas; el *provider* WASM permite ejecución en el navegador sin GPU.
- Opciones de despliegue: `onnxruntime-web` (WebGPU/WASM) en navegador; ONNX Runtime en Python/C++/C#/Java para servidor y escritorio. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del *execution provider*, de la resolución de entrada y del tamaño de lote, por lo que deben medirse en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Factor de escala | Formato publicado | Licencia | Notas |
|---|---|---|---|---|---|
| Real-ESRGAN x2plus (este repo) | RRDBNet, 23 bloques | 2x | ONNX fp32 y fp16 | BSD-3-Clause | Conversión reproducible de SkillSafe, orientada a navegador; parámetros totales no disponibles |
| RealESRGAN_x2plus (upstream) | RRDBNet, 23 bloques | 2x | `.pth` (PyTorch) | BSD-3-Clause | Origen del peso convertido; hash verificado en la model card |
| RealESRGAN_x4plus (upstream) | RRDBNet, 23 bloques | 4x | `.pth` (PyTorch) | BSD-3-Clause | Misma familia, mayor factor de escala; no incluido en este repositorio |
| ESRGAN / SwinIR / Real-CUGAN | Diversas (RRDB, transformer, etc.) | 2x, 4x y otros | Principalmente PyTorch | variable | Alternativas del mismo dominio; no se dispone de datos comparativos en la información proporcionada |

No se dispone de cifras de parámetros, contexto ni rendimiento comparado para estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No hay benchmarks de calidad perceptual publicados; la verificación incluida mide solo equivalencia numérica respecto a la referencia, no la calidad visual del resultado.
- La variante fp16 introduce un error mayor (max abs del orden de 6e-04 y PSNR de 79,8-81,5 dB frente a la referencia), aceptable para visualización pero no idéntico al resultado fp32.
- La resolución de entrada está limitada por la memoria disponible: las activaciones de RRDBNet con 23 bloques crecen con `H × W`, por lo que imágenes grandes requieren parcheado o *tiling* manual.
- Riesgo de artefactos en dominios alejados del entrenamiento del modelo upstream (por ejemplo, imágenes médicas, satelitales o microscopía), donde puede generar texturas plausibles pero inexistentes.
- No se documentan sesgos específicos ni evaluaciones de equidad; al ser un modelo de imagen, el riesgo relevante es la amplificación de patrones o la generación de detalle ficticio en rostros y texto.
- El modelo es determinista en su topología, pero no se declara soporte oficial para contenido de vídeo: habría que aplicar la inferencia fotograma a fotograma.
- No hay información sobre idiomas ni sobre componentes textuales, porque el modelo no los tiene.
- Licencia BSD-3-Clause: permite uso comercial, pero obliga a conservar el aviso de copyright de Xintao Wang (2021) y el texto de la licencia. La receta de conversión y la model card quedan bajo la licencia del repositorio SkillSafe, mientras que los pesos mantienen la licencia upstream.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: no hay evidencia de uso en producción ni de mantenimiento posterior.
- Los ficheros se marcan como `registry`, es decir, servidos desde `models.skillsafe.ai` una vez verificados; conviene comprobar la disponibilidad de ese endpoint en producción.
- La fecha de conversión indicada (2026-09-22) es futura respecto a la información de referencia; conviene validar la coherencia temporal del artefacto antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/realesrgan-x2plus
- Peso upstream (release v0.2.1): https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth
- Repositorio upstream Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Licencia upstream BSD-3-Clause: https://github.com/xinntao/Real-ESRGAN/blob/a4abfb2979a7bbff3f69f58f58ae324608821e27/LICENSE
- Recetas de conversión de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Documentación de onnxruntime-web: no disponible en los resultados de búsqueda proporcionados
