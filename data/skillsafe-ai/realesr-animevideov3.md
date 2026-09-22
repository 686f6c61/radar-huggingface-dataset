# skillsafe-ai/realesr-animevideov3

## Resumen

Real-ESRGAN anime video v3 (SRVGGNetCompact, 4x) es un paquete de artefactos ONNX listos para navegador publicados por SkillSafe en Hugging Face bajo el identificador `skillsafe-ai/realesr-animevideov3`. No es un modelo de lenguaje: es una red convolucional compacta de superresolución de imagen que multiplica por cuatro la resolución espacial de una imagen de entrada (por ejemplo, 480x270 -> 1920x1080). Los pesos proceden de la conversión reproducible del checkpoint `realesr-animevideov3.pth` de Real-ESRGAN (release v0.2.5.0), cuyo autor original es Xintao Wang.

La relevancia del paquete es de ingeniería, no de investigación: SkillSafe publica el mismo modelo en dos variantes ONNX (fp32 y fp16) con receta de conversión, hashes SHA-256 por fichero y verificación numérica frente a la referencia en PyTorch. El objetivo declarado es ejecutar la superresolución directamente en el navegador mediante `onnxruntime-web` con WebGPU o WASM, sin backend ni envío de imágenes a un servidor, algo habitual en herramientas de upscaling de anime y vídeo.

El coste de almacenamiento es mínimo (2,38 MB en fp32 y 1,20 MB en fp16), lo que permite incluirlo en aplicaciones web o de escritorio sin impacto apreciable en el tamaño del bundle. El repositorio no registra descargas ni interacciones en el momento de redactar esta ficha, por lo que la validación comunitaria es todavía inexistente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SRVGGNetCompact (red convolucional compacta de superresolución, derivada de Real-ESRGAN) |
| Parametros totales | Aproximadamente 0,6 millones (estimación a partir del tamaño de los pesos: 2,38 MB fp32 a 4 bytes por parámetro; la model card no declara el recuento) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; la entrada es una imagen con ejes dinámicos de alto y ancho) |
| Tipos de cuantizacion | fp32 (`model.onnx`) y fp16 (`model_fp16.onnx`). No se distribuyen variantes int8/uint8 |
| Idiomas soportados | No aplica (modelo de visión; sin procesamiento de lenguaje). El modelo está especializado en dominio anime |
| Licencia | BSD-3-Clause (pesos y arquitectura: Copyright (c) 2021, Xintao Wang). La receta de conversión y la model card son propiedad del repositorio SkillSafe |
| Formato de pesos | ONNX, opset 17, con ejes dinámicos para `batch`, `height` y `width` |
| Factor de escala | 4x fijo |
| Entrada | Tensor `input`, float32, forma `['batch', 3, 'height', 'width']` (RGB, rango sin especificar en la model card) |
| Salida | Tensor `output`, float32, forma `['batch', 3, 'height_x4', 'width_x4']` |
| Ficheros distribuidos | `model.onnx` (2,38 MB, SHA-256 `78baa685...d86e2`), `model_fp16.onnx` (1,20 MB, SHA-256 `3e8ba049...c144c9`) |
| Tamaño del repositorio | 0,0 GB reportados por Hugging Face |

## Arquitectura y entrenamiento

SRVGGNetCompact es una variante reducida de la familia VGG orientada a superresolución eficiente: una pila de convoluciones 3x3 con activaciones no lineales y una capa final que proyecta directamente a los canales de salida necesarios para el factor de escala. Frente a las arquitecturas basadas en bloques residuales densos (RRDB) de Real-ESRGAN x4plus, esta variante sacrifica capacidad de reconstrucción fina a cambio de un coste computacional y de memoria mucho menor, lo que la hace apta para inferencia en tiempo real y para ejecución en navegador. El sufijo "animevideov3" indica que los pesos distribuidos corresponden al modelo especializado en vídeo de animación dentro del proyecto Real-ESRGAN.

La información proporcionada no detalla el dataset de entrenamiento, el número de tokens o imágenes vistas, ni si se aplicaron fases de ajuste perceptual o adversarial. Lo que sí se documenta con precisión es la cadena de conversión: partiendo del checkpoint de PyTorch con SHA-256 `b8a83768...18b75d`, se aplicó la receta `recipes/realesr-animevideov3.yaml` (SHA-256 `10054035...20bade`) con Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64, el 22 de septiembre de 2026. El `manifest.json` del repositorio registra la receta, las fuentes, el toolchain (incluido el hash de `uv.lock`) y los números de verificación por fichero.

La innovación destacable es la verificabilidad: la organización publica el resultado de comparar la salida de ONNX Runtime en CPU contra la referencia en PyTorch sobre entradas uniformes con semilla fija, con umbrales declarados en la receta (`fp32`: `max_abs` 0,0001; `fp16`: `max_abs` 0,05 y PSNR 45 dB).

## Capacidades

- Superresolución de imagen con factor de escala 4x sobre entradas RGB de resolución arbitraria (ejes `height` y `width` dinámicos).
- Ejecución íntegra en navegador mediante `onnxruntime-web`, con `executionProviders: ["webgpu", "wasm"]` tal y como documenta la model card.
- Especialización en dominio anime y vídeo de animación, donde los pesos fueron entrenados; el nombre del checkpoint lo indica explícitamente.
- Procesamiento por lotes (`batch` es un eje dinámico), útil para aplicar el modelo a varios fotogramas o recortes en una sola llamada.
- Inferencia en CPU vía ONNX Runtime sin GPU, ya que el modelo es de tamaño reducido.
- Uso como etapa de preprocesado dentro de pipelines mayores (restauración, reescalado previo a detección, generación de miniaturas de alta resolución).
- No dispone de tool calling, function calling, capacidad de agente, razonamiento multi-paso, ni capacidades de texto, audio o vídeo más allá del procesamiento fotograma a fotograma.
- No se documenta ningún modo de "thinking" ni bucle de refinamiento iterativo.

## Casos de uso

- Upscaling de anime en el cliente: una aplicación web puede subir fotogramas o capturas desde 480p y devolver 1920x1080 sin que la imagen abandone el dispositivo, lo que evita costes de servidor y problemas de privacidad. El tamaño de 1,20 MB en fp16 lo hace viable como recurso descargable en un service worker.
- Herramientas de edición en navegador tipo PWA: integración en un lienzo HTML donde el usuario aplica 4x a una selección y el resultado se compone sobre el canvas; la ejecución por WebGPU mantiene la interactividad.
- Mejora de miniaturas y material gráfico en wikis y sitios de fansub: regenerar carátulas, capturas de episodios o sprites de baja resolución a 4x como paso previo al reescalado final con un filtro de reducción, reduciendo el aliasing de bordes típico de las imágenes de animación.
- Preliminar de restauración de archivo: aplicar 4x a material de animación antiguo antes de un pipeline de reducción con antialiasing, de forma que los bordes duros característicos del dibujo se reconstruyan con mayor definición.
- Preprocesado para modelos de visión: aumentar la resolución de fotogramas antes de un detector de objetos, un OCR de subtítulos incrustados o un clasificador de escenas, aprovechando que el modelo es pequeño y puede encadenarse en el mismo proceso.
- Optimización de ancho de banda en streaming: transmitir un flujo a resolución reducida y reconstruir 4x en el cliente, trasladando el coste de cómputo al dispositivo del usuario y reduciendo el tráfico de red.
- Generación de assets para videojuegos y proyectos de animación: ampliar texturas, tilesets e ilustraciones con estética anime para prototipos, siempre que la licencia BSD-3-Clause del upstream se respete.
- Procesamiento por lotes offline con ONNX Runtime en Python: al soportar el eje `batch`, permite reescalar carpetas enteras de imágenes en un servidor con CPU, sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas comparativas con otros modelos de superresolución (PSNR, SSIM, LPIPS) sobre conjuntos estándar.

La única tabla cuantitativa disponible es la verificación de fidelidad numérica entre la implementación ONNX y la referencia en PyTorch, con umbrales fijados en la receta:

| Variante | Entrada | max_abs | mean_abs | PSNR |
|---|---|---|---|---|
| fp32 | 64x64 | 3,64e-06 | 4,14e-07 | 125,4 dB |
| fp32 | 80x96 | 3,40e-06 | 4,21e-07 | 125,3 dB |
| fp16 | 64x64 | 1,96e-03 | 2,74e-04 | 69,1 dB |
| fp16 | 80x96 | 1,98e-03 | 2,74e-04 | 69,1 dB |

Estos valores miden el error de la conversión frente al modelo original, no la calidad perceptual del reescalado. La variante fp16 introduce un error absoluto máximo del orden de 2e-03, dos o tres órdenes de magnitud por encima de fp32, aunque dentro del umbral declarado (0,05).

## Requisitos de hardware

- Pesos: 2,38 MB en fp32 y 1,20 MB en fp16. El modelo cabe holgadamente en cualquier GPU consumer, en iGPU e incluso en memoria de un navegador móvil.
- El cuello de botella real es la memoria de activaciones, que escala con la resolución de entrada. Con 64 canales por capa y precisión fp32, cada tensor intermedio ocupa aproximadamente `64 * alto * ancho * 4` bytes:
  - Entrada 480x270 (salida 1920x1080): unos 33 MB por activación y 24,9 MB de tensor de salida. Pico estimado por debajo de 200 MB.
  - Entrada 960x540 (salida 3840x2160): unos 133 MB por activación y 99,5 MB de salida. Pico estimado en el orden de 400-600 MB.
  - Entrada 1920x1080 (salida 7680x4320): unos 531 MB por activación y 398 MB de salida. Pico superior a 1 GB, no recomendable sin troceado.
- Recomendación práctica: procesar por tiles (parches con solape) para entradas superiores a 720p, estrategia que el propio proyecto Real-ESRGAN contempla para su script de inferencia. El paquete ONNX no incluye lógica de troceado; debe implementarla quien lo integre.
- GPU recomendadas: cualquiera con soporte WebGPU para el caso de navegador (integrada moderna incluida). Para lotes grandes en servidor, una RTX 3060 o superior es más que suficiente; A100 o H100 solo tienen sentido si el modelo se encadena con otros mucho más pesados en el mismo pipeline.
- Cabe en GPU consumer: sí, en todas las actuales, ya que el modelo completo ocupa menos de 3 MB. La limitación es la memoria de activaciones, no los pesos.
- Opciones de despliegue: `onnxruntime-web` (WebGPU o WASM) en navegador, ONNX Runtime en Python/C++ para CPU o GPU, TensorRT, DirectML, OpenVINO o Core ML previa conversión desde el grafo ONNX. La model card menciona además que los ficheros de clase `registry` se sirven desde `models.skillsafe.ai` una vez verificados.
- Latencia y throughput: no disponible. No se publican tiempos de inferencia ni mediciones de FPS para ninguna configuración de hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Escala | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| skillsafe-ai/realesr-animevideov3 (este) | SRVGGNetCompact, ONNX opset 17 | 4x | BSD-3-Clause | Hugging Face; variantes fp32 y fp16 | 2,38 MB / 1,20 MB; verificación numérica frente a PyTorch |
| Real-ESRGAN realesr-animevideov3 (upstream) | SRVGGNetCompact, PyTorch | 4x | BSD-3-Clause | Release v0.2.5.0 en GitHub | Es el origen de los pesos; SHA-256 documentado |
| Real-ESRGAN x4plus | RRDB con bloques residuales densos | 4x | No disponible en la información proporcionada (mismo repositorio upstream) | GitHub | No disponible |
| Real-CUGAN | No disponible en la información proporcionada | 4x (múltiples variantes) | No disponible | Repositorio independiente | No disponible |
| waifu2x | No disponible en la información proporcionada | 2x / 4x | No disponible | Repositorio independiente | No disponible |

No se dispone de comparativas de calidad (PSNR/SSIM/LPIPS) entre estos modelos en la información proporcionada. La diferencia funcional principal de este paquete frente al checkpoint original es el formato: ONNX con ejes dinámicos y verificación numérica, pensado para ejecución en navegador, frente a un `.pth` de PyTorch que requiere torch para cargarse.

## Limitaciones y advertencias

- Modelo de superresolución, no generativo de texto: no admite prompts, no tiene contexto conversacional y no soporta instrucciones en lenguaje natural.
- Especialización de dominio: los pesos corresponden a la variante para anime y vídeo de animación. Su uso sobre fotografía real puede producir texturas plásticas, sobre-suavizado o artefactos en zonas de ruido fino.
- Riesgo de alucinación visual: como toda red de superresolución, inventa detalle plausible donde no hay información. No debe usarse como evidencia forense ni para ampliar imágenes donde el contenido deba ser fiel al original.
- No incluye restauración de caras ni módulos auxiliares (GFPGAN u otros) que sí acompañan a otras variantes del proyecto Real-ESRGAN.
- Error numérico en fp16: `max_abs` en torno a 1,96e-03 frente a 3,64e-06 en fp32. Para pipelines sensibles a la fidelidad numérica, usar la variante fp32.
- Memoria escalable con la resolución: no hay troceado incorporado. Sin tiling, una entrada de 1080p produce tensores de salida de casi 400 MB en fp32 y puede agotar la memoria de una pestaña del navegador con el backend WASM.
- Compatibilidad de runtime: el modelo requiere un runtime que soporte opset 17. Versiones antiguas de ONNX Runtime o de otros conversores pueden fallar al cargar el grafo.
- Licencia: BSD-3-Clause permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright de Xintao Wang y la cláusula de exención. La model card subraya que los pesos mantienen la licencia upstream aunque la receta y la ficha sean del repositorio SkillSafe.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso en producción ni validación por terceros.
- Sin información publicada sobre sesgos ni sobre composición del dataset de entrenamiento original, por lo que la evaluación de sesgos demográficos o estilísticos no es posible con los datos disponibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/skillsafe-ai/realesr-animevideov3
- Pesos fp32: https://huggingface.co/skillsafe-ai/realesr-animevideov3/resolve/main/model.onnx
- Pesos fp16: https://huggingface.co/skillsafe-ai/realesr-animevideov3/resolve/main/model_fp16.onnx
- Manifiesto con receta, toolchain y verificación: https://huggingface.co/skillsafe-ai/realesr-animevideov3/blob/main/manifest.json
- Origen de los pesos (Real-ESRGAN v0.2.5.0): https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-animevideov3.pth
- Repositorio upstream Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Licencia upstream BSD-3-Clause: https://github.com/xinntao/Real-ESRGAN/blob/a4abfb2979a7bbff3f69f58f58ae324608821e27/LICENSE
- Directorio de recetas y conversores de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Búsqueda web: no se han encontrado resultados relevantes para este modelo. Los enlaces devueltos por la búsqueda corresponden a productos de camping de la marca Thule (Subsola Side Pack) y no guardan relación con el modelo.
