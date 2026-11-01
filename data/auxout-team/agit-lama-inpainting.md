# AUXOUT-TEAM/agit-lama-inpainting

## Resumen

agit-lama-inpainting es una conversión a ONNX del modelo big-lama de LaMa (Large Mask Inpainting), desarrollada por AUXOUT-TEAM para la función de borrado con IA de la aplicación de fotografía Agit. El modelo resuelve la tarea de inpainting de imagen: rellenar de forma plausible las regiones de una fotografía que el usuario ha marcado con una máscara, sin enviar la imagen a ningún servidor. Está empaquetado como un único grafo ONNX de 102.527.873 bytes que incluye tanto el preprocesado de LaMa (concatenación de la imagen enmascarada y la máscara) como el postprocesado de composición con la imagen original.

La relevancia de esta ficha no está en la innovación algorítmica —LaMa se publicó en WACV 2022— sino en el trabajo de ingeniería de exportación: se ha sustituido `torch.fft` por una DFT exacta implementada con multiplicaciones de matrices reales para evitar el operador DFT de ONNX y mantener H y W dinámicos, se almacenan los tensores de peso de dos o más dimensiones en fp16 con Cast a float32 en carga, y se han eliminado los metadatos de trazado que `torch.onnx` deja por nodo. El resultado se ha verificado con el proveedor CPU de ONNX Runtime en iOS, Android, macOS y Windows.

El modelo es, por tanto, una pieza de infraestructura para inferencia en dispositivo (on-device) en aplicaciones móviles y de escritorio, no un modelo de propósito general. Su licencia Apache 2.0 y su tamaño contenido (unos 0,1 GB de repositorio) lo hacen directamente integrable en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LaMa (generator con Fourier convolutions), exportado a grafo ONNX; opset 18 |
| Parametros totales | no disponible (pesos en un unico fichero de 102.527.873 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision); resolucion de entrada dinamica, H y W multiplos de 8, hasta 4096 |
| Tipos de cuantizacion | pesos de 2+ dimensiones en fp16 con Cast a float32 en carga; computo en float32; BatchNorm y bias en float32 |
| Idiomas soportados | no disponible (modelo de imagen, sin componente de texto) |
| Licencia | Apache License 2.0 (codigo y pesos) |
| Formato de pesos | ONNX (`lama_fp16w.onnx`), SHA-256 `3000bc2ada170e1a4dc5b1926c9a7cefc3bf66892069cbf7e2a2736cb3ccf84a` |

## Arquitectura y entrenamiento

El modelo es el generator de LaMa, una red de inpainting basada en convoluciones con transformada de Fourier (Fourier convolutions), descrita en el articulo *Resolution-robust Large Mask Inpainting with Fourier Convolutions* (Suvorov et al., WACV 2022). La innovacion central de LaMa es el uso de bloques con FourierUnit, que operan en el dominio de la frecuencia y permiten un campo receptivo global, lo que hace al modelo robusto ante máscaras grandes y resoluciones variables. Los pesos proceden de `smartywu/big-lama` (revision `05cb2be7f8dbe6ca7c6e78f4fc827a4b2baaa4a9`, fichero `big-lama.zip`, SHA-256 `f1b358ca24093b93a106183b98a3dea6e8ed09f3b43ea7251eb2c81e7b4575f6`), que a su vez corresponde a los pesos originales distribuidos por los autores de LaMa. El codigo del generator se tomo de `advimman/lama` en el commit `786f5936b27fb3dacd2b1ad799e4de968ea697e7`.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes, ni sobre si hubo ajuste fino adicional, RLHF o DPO; estos datos corresponden al paper original de LaMa y no se detallan en la model card. Las modificaciones respecto al original son de exportacion: (1) el `FourierUnit` usa una DFT exacta escrita como producto de matrices reales en lugar de `torch.fft`, para no depender del operador DFT de ONNX y mantener dimensiones dinamicas; (2) los tensores de peso de dos o más dimensiones se guardan en fp16 y se convierten a float32 al cargar, con todo el computo en float32; (3) se eliminaron `metadata_props` y `doc_string` por nodo. La diferencia numerica frente a la implementacion PyTorch con `torch.fft` es de media 0,002–0,015 y maximo 0,6–7 en escala 0–255, medida sobre imagenes aleatorias de 256×256 a 768×512.

## Capacidades

- Inpainting de imagen: rellena regiones marcadas por una máscara binaria con contenido sintetizado coherente con el contexto.
- Resolucion dinamica: acepta entradas `[1, 3, H, W]` con H y W multiplos de 8 y hasta 4096, sin recompilar el grafo.
- Preprocesado integrado: la imagen enmascarada (`image × (1 − mask)`) y la máscara se concatenan dentro del grafo.
- Postprocesado integrado: los pixeles fuera de la máscara se devuelven como `image × 255`, es decir, la composicion con la imagen original esta incluida en el modelo.
- Entrada y salida normalizadas: entrada RGB en 0–1 (float32), salida RGB en 0–255 con recorte (clamping) ya aplicado.
- Umbralizacion de máscara: valores mayores que 0,5 se interpretan como region a rellenar.
- Inferencia en dispositivo: verificado con el proveedor CPU de ONNX Runtime en iOS, Android, macOS y Windows; no requiere envio de imagenes a red.
- No soporta tool calling, agentes, texto, audio ni modos de razonamiento: es exclusivamente un modelo de imagen a imagen.

## Casos de uso

- Borrado de objetos en apps de fotografia movil: el caso de uso original de Agit. El usuario pinta sobre un objeto no deseado y el modelo rellena la region con textura y estructura plausibles, ejecutandose en el propio dispositivo con ONNX Runtime CPU en iOS y Android, lo que evita costes de servidor y problemas de privacidad.
- Edicion de fotos de escritorio sin conexion: integracion en aplicaciones macOS y Windows mediante ONNX Runtime, con la ventaja de que el grafo ya incluye preprocesado y composicion, reduciendo el codigo de pegamento necesario.
- Eliminacion de marcas de agua, logotipos o texto sobreimpreso en imagenes propias: util para limpiar material grafico antes de reutilizarlo, siempre que se respeten los derechos de la imagen de origen.
- Retoque de documentos escaneados y fotografias antiguas: rellenar rasguños, manchas o zonas deterioradas marcandolas con una máscara, aprovechando la robustez de LaMa ante máscaras grandes.
- Limpieza de datasets de vision por computador: eliminar elementos sensibles (caras, matricula, texto identificativo) de imagenes de entrenamiento antes de publicarlas, con procesamiento local por lotes.
- Prototipado rapido de pipelines de inpainting: al ser un unico fichero ONNX con entradas y salidas documentadas y opset 18, sirve como bloque de referencia para comparar con otros modelos de inpainting o para validar integraciones de ONNX Runtime en nuevas plataformas.
- Funcionalidad de "borrado magico" en herramientas de diseno: incorporar el modelo como dependencia en un editor grafico de escritorio o web (via ONNX Runtime Web) para ofrecer relleno local sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica metrica cuantitativa aportada es la fidelidad de la exportacion frente a la implementacion PyTorch original: diferencia media de 0,002–0,015 y maxima de 0,6–7 en escala 0–255, sobre imagenes aleatorias de 256×256 a 768×512. No se proporcionan datos de PSNR, SSIM, FID, LPIPS ni tiempos de inferencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El fichero ONNX ocupa 102.527.873 bytes (unos 98 MiB) con pesos parcialmente en fp16; la huella en memoria durante la inferencia depende de la resolucion de entrada y del proveedor de ejecucion, y no se documenta.
- GPU recomendadas: no se documentan; el modelo esta verificado con el proveedor CPU de ONNX Runtime, no con CUDA ni otros proveedores acelerados.
- GPU de consumo: no hay datos que confirmen compatibilidad ni rendimiento en RTX 4090, RTX 3090 u otras GPU de consumo. El caso de uso declarado es CPU en movil y escritorio.
- Opciones de despliegue: ONNX Runtime con proveedor CPU, verificado en iOS, Android, macOS y Windows. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo). Tampoco se confirma compatibilidad con TensorRT, Core ML o NNAPI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| agit-lama-inpainting | no disponible (fichero ONNX de ~98 MiB) | H y W dinamicos, multiplos de 8, hasta 4096 | ONNX (opset 18) | Apache 2.0 | Pre y postprocesado integrados; verificado en CPU en iOS, Android, macOS y Windows |
| smartywu/big-lama (modelo base) | no disponible | no disponible en la informacion | pesos PyTorch/zip | Apache 2.0 | Origen de los pesos; requiere pipeline externo de preprocesado y composicion |
| advimman/lama (implementacion de referencia) | no disponible | no disponible en la informacion | PyTorch | Apache 2.0 | Codigo original del generator; usa `torch.fft` y no esta pensado para despliegue ONNX |

No se dispone de datos de rendimiento comparativo (PSNR, SSIM, FID) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito estrictamente visual: no procesa texto, audio ni codigo; no admite instrucciones en lenguaje natural. La mascara debe proporcionarse como tensor float32.
- Restriccion de forma: H y W deben ser multiplos de 8; no se documenta el comportamiento con otras dimensiones.
- Resolucion maxima: 4096 en cada dimension segun la model card; no se especifica el consumo de memoria a esa resolucion ni si el rendimiento se degrada.
- Diferencias numericas frente a PyTorch: maximo de hasta 7 unidades en escala 0–255 en el peor caso medido, lo que puede ser perceptible en regiones de alto contraste.
- Riesgo de artefactos y alucinacion visual: como todo modelo generativo de inpainting, puede producir texturas plausibles pero incorrectas, especialmente en estructuras repetitivas, rostros o texto.
- Sesgos: no se documentan evaluaciones de sesgo. Al derivar de un modelo entrenado con datos no especificados en esta ficha, pueden heredarse sesgos del dataset original de LaMa.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y, segun la seccion 4(b), indicar las modificaciones realizadas si se redistribuye. El autor ya documenta las suyas.
- Procedencia de los pesos: la cadena de custodia pasa por `smartywu/big-lama`; la model card afirma que el contenido es identico al big-lama distribuido por los autores originales, pero no se aporta una verificacion independiente mas alla del SHA-256 del zip.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-01). No hay evidencia de uso en produccion por terceros.
- Sin datos de latencia ni de memoria: la viabilidad en dispositivos de gama baja debe validarse empiricamente antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AUXOUT-TEAM/agit-lama-inpainting
- Modelo base (pesos): https://huggingface.co/smartywu/big-lama
- Codigo original de LaMa: https://github.com/advimman/lama
- Paper de LaMa: Suvorov, Logacheva, Mashikhin, Remizova, Ashukha, Silvestrov, Kong, Goka, Park, Lempitsky. *Resolution-robust Large Mask Inpainting with Fourier Convolutions*. WACV 2022 (no se proporciona URL directa en la informacion disponible)
- Revision de pesos utilizada: `05cb2be7f8dbe6ca7c6e78f4fc827a4b2baaa4a9` en smartywu/big-lama
- Commit del codigo del generator: `786f5936b27fb3dacd2b1ad799e4de968ea697e7` en advimman/lama
