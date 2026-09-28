# ricardo-manuel-22/editoria-models

## Resumen

EditorIA on-device models es un repositorio de modelos ONNX publicado por el usuario ricardo-manuel-22 en HuggingFace, orientado a ejecutar inferencia de edición de imagen completamente en local sobre Android. No es un modelo de lenguaje ni un artefacto único: empaqueta tres ficheros ONNX ya exportados —Big-LaMa en FP16 para inpainting y dos variantes de Real-ESRGAN (`realesr-general-x4v3` y `realesr-general-wdn-x4v3`) para superresolución x4— con un tamaño total de repositorio de 0,1 GB.

El objetivo declarado es que las fotografías no salgan del dispositivo: no se envían al repositorio ni a ningún servicio remoto. Esto lo sitúa en la categoría de herramientas on-device para edición fotográfica interactiva o por lotes en móvil, donde la privacidad del usuario y el coste de GPU en la nube son los factores decisivos.

Su relevancia práctica es la de ofrecer un empaquetado listo para desplegar de dos arquitecturas conocidas: LaMa (inpainting robusto a máscaras grandes mediante convoluciones de Fourier) y Real-ESRGAN (superresolución con modelado de degradaciones reales). El repositorio no publica datos de entrenamiento propios ni métricas de calidad de imagen; el único dato de validación disponible es la comparación numérica de la exportación FP16 de Big-LaMa contra su equivalente FP32.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Big-LaMa: red de inpainting basada en convoluciones de Fourier (familia LaMa). Real-ESRGAN: red generativa con bloques residuales densos (familia ESRGAN) |
| Parámetros totales | no disponible (no se publica el conteo). Tamaños de fichero: `big-lama-512-fp16.onnx` 109.398.440 bytes; `realesr-general-x4v3.onnx` 4.866.417 bytes; `realesr-general-wdn-x4v3.onnx` 4.868.759 bytes |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión). Big-LaMa trabaja con entradas de 512 píxeles según el nombre del artefacto |
| Tipos de cuantización | `big-lama-512-fp16.onnx`: pesos y convoluciones en FP16, interfaz y capa de Fourier en FP32. Las dos variantes de Real-ESRGAN no declaran cuantización en la model card |
| Idiomas soportados | no disponible (modelo de imagen; el repositorio no declara idiomas) |
| Licencia | mixta: el repositorio está etiquetado como `other`; `big-lama` es Apache-2.0; `realesr-general-x4v3` y `realesr-general-wdn-x4v3` son BSD-3-Clause |
| Formato de pesos | ONNX |
| Tamaño del repositorio | 0,1 GB |
| Pipeline declarado | image-to-image |
| Integridad (SHA-256) | big-lama: `188770e3c5296a3c95b5d97903d4cf61b1229f77cc9e9a81af27b8bc80352376`; realesr-general-x4v3: `1940a93ee08283a0a7286183186357b1688fe9fa8ede74604b424586aaddf112`; realesr-general-wdn-x4v3: `5073c57599850fe59320473ab5e07a91ac7de3af916ef44d5eef2218c7d0b33a` |
| Fecha de publicación declarada | creación y última actualización: 2026-09-28 |

## Arquitectura y entrenamiento

El repositorio no aporta información sobre datos de entrenamiento: no se indica número de imágenes, composición del dataset, resolución de entrenamiento, proceso de alineación ni fine-tuning posterior. La model card se limita a documentar los ficheros, sus licencias y su procedencia. Big-LaMa se describe como una exportación con convoluciones y pesos en FP16, mientras que la interfaz y la capa de Fourier permanecen en FP32; esa mezcla de precisiones es habitual para preservar la estabilidad numérica de las transformadas de Fourier sin sacrificar el ahorro de memoria del resto de la red. Las dos variantes de Real-ESRGAN se exportan como ficheros de menos de 5 MB cada uno, lo que corresponde a la versión compacta `x4v3` de la familia. La diferencia funcional entre `realesr-general-x4v3` y `realesr-general-wdn-x4v3` no se documenta en la model card.

Como única validación técnica, el autor declara que Big-LaMa FP16 se comparó numéricamente contra el ONNX FP32, obteniendo un error absoluto medio de 0,013547 y un error medio relativo de 0,000098. No se publican métricas perceptuales (PSNR, SSIM, LPIPS, FID) ni comparaciones cualitativas. La procedencia se atribuye explícitamente a tres fuentes: el repositorio LaMa de advimman, la exportación Big-LaMa ONNX de referencia de `Carve/LaMa-ONNX` y el repositorio Real-ESRGAN de xinntao.

## Capacidades

- Inpainting de imágenes mediante Big-LaMa: eliminación o sustitución de regiones definidas por una máscara, con entrada declarada de 512 píxeles.
- Superresolución x4 de imágenes reales mediante `realesr-general-x4v3`, orientada a fotografías con degradaciones no ideales.
- Superresolución x4 con variante adicional `realesr-general-wdn-x4v3`; la model card no detalla en qué se diferencia funcionalmente de la anterior.
- Pipeline declarado `image-to-image`: la entrada y la salida son imágenes.
- Inferencia local en Android dentro de una aplicación: las fotografías no se envían al repositorio ni a servicios remotos, según declara el autor.
- Exportación ONNX, lo que permite ejecución con runtimes compatibles con este formato y aceleración por delegados del sistema operativo.
- No dispone de generación de texto, razonamiento, código ni matemáticas: no es un modelo de lenguaje.
- No declara soporte de tool calling, function calling ni flujos de agentes.
- No declara capacidades multilingües, de audio, de vídeo ni de visión-lenguaje.
- No declara modo de razonamiento extendido ni decodificación especulativa.

## Casos de uso

- Retoque fotográfico en aplicaciones Android: el usuario dibuja una máscara sobre un objeto no deseado y Big-LaMa rellena la región con el contexto circundante, todo dentro del dispositivo y sin conexión de red.
- Restauración y ampliación de fotografías antiguas: `realesr-general-x4v3` multiplica por cuatro la resolución de imágenes de baja calidad, lo que resulta adecuado para digitalizaciones de álbumes familiares en un teléfono.
- Escaneo de documentos con OCR: aplicar primero una superresolución x4 sobre la captura y enviar después la imagen ampliada al motor de OCR mejora la legibilidad de texto pequeño sin coste de servidor.
- Edición por lotes en la galería del teléfono: al ser modelos de 4,6 MB y 104 MiB, se pueden encadenar inpainting y superresolución sobre múltiples imágenes en una tarea en segundo plano sin agotar la memoria del dispositivo.
- Aplicaciones con requisitos estrictos de privacidad: documentos de identidad, fotografías médicas o material sujeto a normativa de protección de datos pueden procesarse íntegramente en el terminal, evitando cualquier transferencia a terceros.
- Fotografía de producto para comercio electrónico: eliminación del fondo o de elementos no deseados con inpainting y posterior ampliación x4 para cumplir los requisitos mínimos de resolución de una ficha de catálogo.
- Reducción de costes de infraestructura: sustituir llamadas a APIs en la nube de inpainting y superresolución por inferencia local elimina el coste por petición y la dependencia de red, a cambio de consumir CPU o GPU del propio dispositivo.
- Prototipado y experimentación con ONNX: el empaquetado permite probar los modelos en escritorio con cualquier runtime ONNX antes de integrarlos en la aplicación móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen en la información disponible. El único dato numérico aportado por el autor es la validación de la exportación FP16 frente a la FP32.

| Prueba | Resultado | Fuente |
|---|---|---|
| Error absoluto medio (Big-LaMa FP16 frente a ONNX FP32) | 0,013547 | model card |
| Error medio relativo (Big-LaMa FP16 frente a ONNX FP32) | 0,000098 | model card |
| MMLU, HumanEval, GSM8K u otros benchmarks de texto | no aplica (modelo de imagen) | — |
| PSNR, SSIM, LPIPS o FID de inpainting | no disponible | — |
| PSNR o SSIM de superresolución | no disponible | — |
| Comparación con LaMa FP32 o con otros modelos de inpainting | no disponible | — |

## Requisitos de hardware

- Pesos de Big-LaMa en FP16: 109.398.440 bytes, aproximadamente 104 MiB. La memoria total durante la inferencia depende de la resolución de entrada y de las activaciones intermedias, dato no publicado.
- Pesos de Real-ESRGAN: 4.866.417 y 4.868.759 bytes, aproximadamente 4,6 MiB cada variante.
- No se requieren GPU de centro de datos. El conjunto está pensado para ejecutarse en un teléfono Android actual; el modelo de superresolución es especialmente ligero.
- GPU recomendadas: no aplica para el objetivo declarado de despliegue móvil. Para pruebas en escritorio basta cualquier GPU de consumo reciente con un runtime ONNX; no se publican cifras de rendimiento por modelo de GPU.
- Cabe en GPU de consumo: sí, en cualquiera con memoria suficiente para las activaciones. No se especifican requisitos mínimos de VRAM en la model card.
- Opciones de despliegue: ONNX Runtime, incluida la variante móvil para Android, con posibilidad de delegados de aceleración (NNAPI y GPU) según el soporte del dispositivo. Los formatos GGUF y llama.cpp no aplican, porque no son modelos de lenguaje. vLLM y TGI no aplican por el mismo motivo.
- Latencia y throughput: no disponible. No se publican medidas de tiempo de inferencia ni de imágenes por segundo en ningún dispositivo de referencia.

## Comparativa con modelos similares

La información disponible no incluye métricas que permitan comparar la calidad de estos artefactos frente a alternativas. La comparación se limita a formato, licencia y tamaño.

| Modelo | Tarea | Formato | Licencia | Tamaño de pesos | Calidad comparada |
|---|---|---|---|---|---|
| editoria-models / `big-lama-512-fp16.onnx` | Inpainting | ONNX, FP16 en pesos y convoluciones, FP32 en interfaz y Fourier | Apache-2.0 | 109.398.440 bytes | no disponible |
| editoria-models / `realesr-general-x4v3.onnx` | Superresolución x4 | ONNX, cuantización no declarada | BSD-3-Clause | 4.866.417 bytes | no disponible |
| editoria-models / `realesr-general-wdn-x4v3.onnx` | Superresolución x4 (variante wdn) | ONNX, cuantización no declarada | BSD-3-Clause | 4.868.759 bytes | no disponible |
| `Carve/LaMa-ONNX` (exportación de referencia citada por el autor) | Inpainting | ONNX, FP32 | Apache-2.0 (LaMa original) | no disponible | Es la referencia contra la que se midió el error numérico |
| Otras alternativas de inpainting o superresolución | — | — | — | — | no disponible en la información proporcionada |

## Limitaciones y advertencias

- El repositorio no tiene descargas ni valoraciones registradas en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.
- La model card no documenta el dataset de entrenamiento, el número de parámetros de cada red, la resolución nativa de las variantes de Real-ESRGAN ni el procedimiento de exportación a ONNX.
- La diferencia funcional entre `realesr-general-x4v3` y `realesr-general-wdn-x4v3` no se explica en la documentación disponible.
- Licencias mixtas: el repositorio está etiquetado como `other`, mientras que los pesos conservan Apache-2.0 (Big-LaMa) y BSD-3-Clause (Real-ESRGAN). Antes de un uso comercial hay que revisar los textos completos en los repositorios de origen y cumplir las obligaciones de atribución.
- La exportación FP16 de Big-LaMa introduce un error numérico medible respecto a FP32 (error absoluto medio de 0,013547). En aplicaciones donde la fidelidad exacta sea crítica, conviene usar la variante FP32.
- La resolución de trabajo de Big-LaMa está fijada en 512 píxeles según el propio nombre del fichero; no se documenta el comportamiento con entradas mayores sin remuestreo previo.
- Los modelos de inpainting de la familia LaMa pueden producir artefactos o contenido incoherente en máscaras muy grandes o en texturas repetitivas, aunque la model card no aporta ninguna evaluación al respecto.
- Los modelos de superresolución generativos tienden a reconstruir detalle que no existe en la imagen original. No hay datos en este repositorio sobre la magnitud de ese efecto.
- No hay soporte de texto, multilingüismo, tool calling, agentes ni razonamiento; cualquier expectativa en ese sentido es inaplicable.
- No se declara ningún compromiso de mantenimiento, versionado ni soporte por parte del autor.
- Las fechas de creación y actualización declaradas (2026-09-28) son posteriores a la fecha habitual de consulta de este tipo de repositorios; conviene verificarlas directamente en la página del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ricardo-manuel-22/editoria-models
- Repositorio LaMa (advimman): https://github.com/advimman/lama
- Exportación Big-LaMa ONNX de referencia (Carve): https://huggingface.co/Carve/LaMa-ONNX
- Repositorio Real-ESRGAN (xinntao): https://github.com/xinntao/Real-ESRGAN
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo. Los resultados devueltos corresponden a sitios sin relación con el repositorio (plataforma de anuncios clasificados Ricardo.ch, el portal de recetas Ricardo Cuisine y la página biográfica de David Ricardo), por lo que se descartan como fuentes.
