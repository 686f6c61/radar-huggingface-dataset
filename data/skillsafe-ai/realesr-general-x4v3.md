# skillsafe-ai/realesr-general-x4v3

## Resumen

Real-ESRGAN general x4 v3 (SRVGGNetCompact) publicado por skillsafe-ai es una conversión a ONNX del checkpoint `realesr-general-x4v3.pth` de Real-ESRGAN, pensada para ejecutarse directamente en el navegador mediante `onnxruntime-web` con WebGPU o WASM. No se trata de un modelo de lenguaje ni de un modelo multimodal: es una red convolucional de superresolución de imagen que aplica un factor de escala fijo de 4x, es decir, recibe un tensor de imagen y devuelve una versión con el cuádruple de resolución en cada eje.

El valor del artefacto es fundamentalmente de empaquetado y reproducibilidad. El autor documenta la procedencia exacta (URL y SHA-256 del peso original), la receta de conversión con su hash, la cadena de herramientas empleada (Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64) y una tabla de verificación que compara la salida de ONNX Runtime frente a la referencia en PyTorch. Los dos ficheros publicados, `model.onnx` (fp32, 4,64 MB) y `model_fp16.onnx` (fp16, 2,33 MB), suman 6,97 MB, un tamaño que permite servirlos como estáticos desde una CDN o incrustarlos en una aplicación web.

Es relevante ahora porque traslada una tarea clásica de posprocesado de imagen al cliente, sin backend ni GPU de servidor: el usuario sube una imagen, el navegador la reescala 4x y ningún píxel sale del dispositivo. La contrapartida es que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y que se trata de un artefacto derivado, no de un modelo entrenado por skillsafe-ai.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SRVGGNetCompact (red convolucional compacta de estilo VGG para superresolución) |
| Parámetros totales | No disponible. Estimación derivada del tamaño del fichero fp32 (4,64 MB / 4 bytes ≈ 1,16 M de parámetros, sin descontar la sobrecarga del grafo ONNX); el autor no publica el dato |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión). Entrada `input` float32 con forma `['batch', 3, 'height', 'width']`, sin límite declarado de resolución |
| Tipos de cuantización | fp32 (`model.onnx`) y fp16 (`model_fp16.onnx`). No se publican variantes int8 |
| Idiomas soportados | No disponible. No procede: el modelo procesa píxeles, no texto |
| Licencia | BSD-3-Clause (pesos upstream, Copyright (c) 2021 Xintao Wang). La receta de conversión y la model card quedan bajo la licencia del repositorio de SkillSafe |
| Formato de pesos | ONNX, opset 17. Origen en PyTorch (`.pth`); ejecución mediante `onnxruntime-web` (WebGPU/WASM) o cualquier runtime ONNX |
| Factor de escala | 4x fijo: `height`→`height_x4`, `width`→`width_x4` |
| Ficheros publicados | `model.onnx` (4,64 MB, SHA-256 `a946f7a9…4a00e`), `model_fp16.onnx` (2,33 MB, SHA-256 `8dedfc4b…33a67`) |
| Procedencia del peso upstream | SHA-256 `8dc7edb9ac80ccdc30c3a5dca6616509367f05fbc184ad95b731f05bece96292` |
| Fecha de conversión | 2026-09-22T03:08:55+00:00 |

## Arquitectura y entrenamiento

SRVGGNetCompact es una variante compacta del esquema VGG aplicada a superresolución: un conjunto reducido de capas convolucionales con activaciones seguidas de un módulo de *upsampling* (subpíxel/pixel-shuffle) que multiplica por 4 la resolución espacial. El resultado es una red de muy pocos parámetros comparada con las arquitecturas basadas en bloques residuales densos (RRDB) del mismo proyecto, lo que la hace apta para inferencia en cliente y en tiempo casi interactivo. El autor de la conversión no aporta detalles adicionales sobre disposición de capas, número de canales ni uso de atención; la referencia técnica es el repositorio upstream de Real-ESRGAN.

Sobre el entrenamiento, esta ficha no documenta nada: no se indica el número de tokens o imágenes vistas, la composición del dataset, ni si hubo ajuste por pérdidas perceptuales, GAN o adversariales. Tampoco se documenta ningún proceso de RLHF/DPO, que en este dominio no aplica. El checkpoint corresponde a la variante "general" del modelo x4 v3 (sin el sufijo `wdn`, que designa la variante con reducción de ruido). La innovación destacable aquí no está en el modelo, sino en el pipeline de conversión reproducible: receta versionada con hash, `uv.lock` referenciado en el `manifest.json`, verificación numérica contra la referencia PyTorch con umbrales declarados (`fp32: max_abs 0,0001`; `fp16: max_abs 0,05 y PSNR 45 dB`).

## Capacidades

- Superresolución de imagen con factor 4x sobre entradas RGB de 3 canales en float32.
- Ejecución en navegador con `onnxruntime-web`, seleccionando WebGPU o WASM como *execution provider*.
- Procesamiento por lotes: la primera dimensión del tensor de entrada es `batch`.
- Funciona sobre resoluciones arbitrarias de entrada (alto y ancho libres), no solo tamaños fijos.
- Verificación numérica reproducible: los hashes SHA-256 de los ficheros y del peso upstream están publicados.
- No soporta *tool calling* ni *function calling*: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesa texto de ningún tipo.
- No dispone de modo *thinking*, visión semántica, audio ni OCR; solo transforma píxeles.

## Casos de uso

- Superresolución local en aplicaciones web: el usuario sube una foto, el navegador ejecuta `model.onnx` con WebGPU y devuelve una versión 4x sin enviar la imagen a ningún servidor. Adecuado por el tamaño del artefacto (4,64 MB) y porque no requiere backend.
- Ahorro de ancho de banda en catálogos y galerías: se sirven miniaturas pequeñas y se reescalan en el cliente antes de mostrarlas a pantalla completa o en retina, reduciendo el peso transferido a costa de cómputo local.
- Restauración y ampliación de fotografías antiguas o de baja resolución en herramientas de edición web, integrando el modelo como paso de posprocesado sobre imágenes ya digitalizadas.
- Preprocesado de *assets* en herramientas de diseño: generación de texturas o ilustraciones a mayor resolución dentro de un *canvas* HTML, con el modelo cargado una sola vez en memoria y reutilizado para múltiples imágenes.
- Procesamiento por lotes en servidor con ONNX Runtime: conversión de carpetas de imágenes a 4x en pipelines offline, aprovechando la salida determinista y la ausencia de dependencias de Python en producción si se usa el runtime en C++ o C#.
- Aplicaciones con requisitos de privacidad (sanitarias, legales, periodismo): al ejecutarse íntegramente en el dispositivo, la imagen original nunca abandona el equipo, lo que simplifica el cumplimiento de RGPD frente a alternativas que envían la imagen a una API.
- Prototipado y demos educativas de superresolución: sirve como referencia para comparar el comportamiento de un modelo compacto frente a arquitecturas mayores, con la ventaja de que la verificación numérica contra PyTorch ya está publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos (PSNR/SSIM sobre Set5, Set14, BSD100, DIV2K, etc.) en la información disponible. El único dato numérico del repositorio es la tabla de verificación de la conversión, que mide la fidelidad de ONNX Runtime frente a la referencia PyTorch, no la calidad de la superresolución:

| Variante | Entrada | max abs | mean abs | PSNR |
|---|---|---|---|---|
| fp32 | 64×64 | 4,41e-06 | 4,91e-07 | 123,8 dB |
| fp32 | 80×96 | 4,11e-06 | 4,99e-07 | 123,7 dB |
| fp16 | 64×64 | 1,82e-03 | 2,81e-04 | 68,6 dB |
| fp16 | 80×96 | 1,78e-03 | 2,77e-04 | 68,8 dB |

Los umbrales declarados en la receta son `max_abs` 0,0001 para fp32 y `max_abs` 0,05 con PSNR mínimo de 45 dB para fp16; ambas variantes los cumplen con margen.

## Requisitos de hardware

- VRAM ocupada por los pesos: despreciable. 4,64 MB en fp32 y 2,33 MB en fp16, cargados una sola vez por sesión.
- VRAM dominada por las activaciones, que escalan de forma cuadrática con el lado de la imagen. Estimación derivada del contrato del modelo: una entrada de 512×512 produce una salida de 2048×2048, es decir 12,58 M de elementos por canal, unos 50 MB solo para el tensor de salida en fp32; una entrada de 1024×1024 produce 4096×4096, unos 201 MB en fp32. Hay que sumar los tensores intermedios del grafo.
- Cabe en cualquier GPU de consumo e incluso en GPU integradas y en el propio navegador, siempre que el backend WebGPU esté disponible; con WASM funciona en CPU. El cuello de botella es el ancho de banda de memoria y el tamaño de la imagen, no el número de parámetros.
- Para lotes grandes en servidor no hay recomendación oficial del autor; con 4 GB de VRAM es suficiente para imágenes de tamaño habitual, y resoluciones muy altas o lotes amplios exigen más memoria por el crecimiento cuadrático de las activaciones.
- Opciones de despliegue: `onnxruntime-web` (WebGPU o WASM, el camino documentado por el autor), ONNX Runtime para Python, C++, C# y Java, y cualquier otro runtime compatible con ONNX opset 17. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del backend elegido (WebGPU frente a WASM), del tamaño de entrada y del hardware del cliente.

## Comparativa con modelos similares

La ficha solo aporta datos del modelo convertido por skillsafe-ai. Las alternativas de la misma categoría no incluyen métricas en la información disponible, por lo que se marcan como no disponibles en lugar de estimarlas:

| Modelo | Arquitectura | Parámetros | Escala | Licencia | Formatos | Datos de rendimiento |
|---|---|---|---|---|---|---|
| skillsafe-ai/realesr-general-x4v3 | SRVGGNetCompact | ≈1,16 M (derivado) | 4x | BSD-3-Clause | ONNX fp32 y fp16 | Verificación ONNX vs PyTorch (tabla anterior) |
| Real-ESRGAN realesr-general-x4v3 (upstream) | SRVGGNetCompact | No disponible | 4x | BSD-3-Clause | PyTorch `.pth` | No disponible |
| Real-ESRGAN x4plus | No disponible | No disponible | 4x | BSD-3-Clause | PyTorch `.pth` | No disponible |
| Otras alternativas de superresolución (SwinIR, ESRGAN, waifu2x) | No disponible | No disponible | 2x/4x según variante | Varía por proyecto | Varía | No disponible |

La diferencia funcional más relevante frente al peso upstream es el formato: este repositorio ofrece ONNX listo para navegador, mientras que el original requiere PyTorch y un backend Python.

## Limitaciones y advertencias

- Es un artefacto derivado, no un modelo entrenado por el autor del repositorio. Toda la calidad final depende del checkpoint upstream de Real-ESRGAN.
- El repositorio registra 0 descargas y 0 likes: no hay evidencia de adopción ni de uso en producción por terceros.
- No se publica ninguna evaluación de calidad perceptual (PSNR, SSIM, LPIPS) sobre conjuntos de test estándar. La tabla de verificación mide fidelidad de la conversión, no calidad de imagen.
- Los modelos generativos de superresolución pueden introducir detalle sintético que no existe en la imagen original; conviene revisar resultados en contextos forenses, médicos o documentales donde la fidelidad sea crítica.
- La variante fp16 introduce un error mayor que fp32 (max abs 1,78e-03 frente a 4,11e-06 en los tests publicados). Para usos que exijan máxima fidelidad numérica, usar `model.onnx`.
- La variante publicada es la "general", sin reducción de ruido explícita; no es la `realesr-general-wdn-x4v3`. En entradas con ruido o compresión JPEG intensa, los artefactos pueden amplificarse.
- No se documenta la composición del dataset de entrenamiento ni los sesgos asociados, por lo que no es posible evaluar sesgos por tipo de contenido, tono de piel, iluminación o dominio.
- Licencia BSD-3-Clause: permite uso comercial y modificación, pero exige conservar el aviso de copyright de Xintao Wang y el texto de la licencia. La receta de conversión y la model card tienen licencia propia del repositorio de SkillSafe; conviene revisarla por separado si se redistribuye el paquete completo.
- El hash del peso upstream y los SHA-256 de cada fichero están publicados, por lo que la integridad es verificable; se recomienda comprobarlos antes de desplegar.
- El tamaño del repositorio aparece como 0,0 GB en la ficha de HuggingFace, mientras que los ficheros declarados suman 6,97 MB; es un redondeo de la plataforma, no una discrepancia de contenido.
- La búsqueda web realizada no devolvió documentación técnica ni discusiones relevantes sobre este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/realesr-general-x4v3
- Peso upstream (PyTorch, v0.2.5.0): https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth
- Repositorio upstream de Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Licencia upstream (BSD-3-Clause): https://github.com/xinntao/Real-ESRGAN/blob/a4abfb2979a7bbff3f69f58f58ae324608821e27/LICENSE
- Recetas y scripts de conversión de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Registro de modelos servidos por SkillSafe: https://models.skillsafe.ai
- Resultado de búsqueda web disponible: https://sandro.rocks/tests/gpt-allowed-only.html (página de prueba de acceso de GPTBot; sin relación con el modelo)
