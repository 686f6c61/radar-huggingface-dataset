# AutomatosX/AXDocLayout-M-v1.1-CUDA-AXQ-NVFP4

## Resumen

AXDocLayout-M v1.1 · CUDA · AXQ NVFP4 es un paquete de pesos cuantizados derivado de AutomatosX/AXDocLayout-M v1.1, un detector de maquetacion de documentos (document layout detection) desarrollado por AutomatosX. El modelo recibe una pagina decodificada en RGB y devuelve clases de layout, puntuaciones de confianza y cajas delimitadoras expresadas en las coordenadas de la imagen original. No es un modelo de lenguaje: es un detector de objetos con pipeline declarado `object-detection` y 21.231.224 parametros almacenados en safetensors.

La arquitectura es RT-DETRv2 en la variante `rtdetrv2_r50vd_m`, un transformer de deteccion en tiempo real. La particularidad de este artefacto no es arquitectonica sino de formato: los pesos se almacenan comprimidos en AXQ NVFP4 (valores de 4 bits empaquetados con escalas por bloque, con algunos tensores sin cuantizar). El camino de inferencia de referencia descarga y decodifica los pesos en CPU y ejecuta el modelo reconstruido en FP32 sobre una GPU NVIDIA con CUDA, de modo que la compresion no implica uso de memoria de 4 bits ni computo FP4 nativo.

El artefacto esta marcado como `experimental` y en estado de desarrollo: el propio autor indica que la calidad y la velocidad no estan certificadas, que no se ha completado una evaluacion emparejada frente al modelo original y que las comprobaciones realizadas se limitan a tres pruebas de humo con raster sintetico en una RTX 5090. Con 0 descargas y 0 likes en el momento de la consulta, es un paquete pensado para validacion interna, no para produccion sin verificacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETRv2, variante `rtdetrv2_r50vd_m` (transformer de deteccion) |
| Parametros totales | 21.231.224 (segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (detector de objetos; entrada fija con letterbox de 1024 × 1024) |
| Tipos de cuantizacion | AXQ NVFP4: valores de 4 bits empaquetados con escalas por bloque; algunos tensores permanecen sin cuantizar. La model card incluye ademas la etiqueta `8-bit` |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (AXQ NVFP4 empaquetado) + `axq-manifest.json` con hashes ligados a ficheros |
| Tarea | Deteccion de layout de documentos (object detection) |
| Entrada | HWC uint8 RGB; contrato `rgb-letterbox-1024/1` (preserva relacion de aspecto, lado largo a 1024, relleno blanco hasta 1024 × 1024, normalizado a float32 [0, 1]) |
| Salida | Etiquetas de clase, puntuaciones de confianza y cajas xyxy en espacio letterbox, reescaladas y recortadas al raster original |
| Clases | 11 clases: caption, footnote, formula, list_item, page_footer, page_header, picture, section_header, table, text, title (indice 0 reservado) |
| Precision de ejecucion (ruta de referencia) | FP32 en GPU CUDA |
| Revision del artefacto cuantizado | `4d7dab0196b1b38c4000868c77145d31c6edf189` |
| Revision del modelo fuente | `2c419a0da355ee5e979cfeb0808f596aae6e896e` |
| Modelo base | AutomatosX/AXDocLayout-M v1.1 (relacion: quantized) |
| Estado | Experimental / desarrollo |

## Arquitectura y entrenamiento

La arquitectura es RT-DETRv2, un detector de objetos basado en transformer que prescinde de las tecnicas de asignacion de etiquetas dependientes de NMS propias de las generaciones anteriores de DETR. La variante concreta es `rtdetrv2_r50vd_m`, es decir, un backbone ResNet-50 con el modulo `vd` (variante de deformacion) y la configuracion de tamano `m`. El recuento real de parametros del artefacto es de 21.231.224, muy por debajo de lo habitual en un R50 completo, dato que se reporta tal cual figura en los safetensors.

No se dispone de informacion sobre el entrenamiento del modelo base en la documentacion proporcionada: no se indica el numero de tokens o imagenes, la composicion del dataset, ni si hubo fases de ajuste fino con RLHF o DPO (procedimientos, por otra parte, poco habituales en deteccion de objetos). Tampoco se documentan innovaciones tecnicas propias mas alla del formato de compresion AXQ NVFP4 desarrollado para este paquete. Lo que si describe la model card es el contrato de preprocesado y postprocesado: letterbox a 1024 × 1024 con relleno blanco, normalizacion a float32 en [0, 1], umbral de confianza de 0,30 en el ejemplo y conversion de cajas desde el espacio letterbox al raster original con recorte a los limites de la imagen.

La innovacion principal del artefacto es la ruta de carga y ejecucion. Los pesos comprimidos se decodifican en CPU mediante `axq_doclayout.load()`, que devuelve un modelo FP32 en CPU; el usuario debe moverlo explicitamente a CUDA. El autor advierte de forma explicita que la descomposicion restaura tensores FP32, no los valores originales sin cuantizar, y que el pack no implementa ni verifica kernels nativos FP4 ni W4A16. El sufijo `W4A16` se elimino del nombre precisamente porque esta ruta ejecuta en FP32.

## Capacidades

- Deteccion de 11 clases de layout documental en una pagina RGB: caption, footnote, formula, list_item, page_footer, page_header, picture, section_header, table, text y title.
- Devolucion simultanea de etiquetas, puntuaciones de confianza y cajas delimitadoras en coordenadas del raster original, con eliminacion del relleno y del reescalado del letterbox.
- Procesamiento de una pagina completa por inferencia a resolucion efectiva de 1024 × 1024.
- Ejecucion en GPU NVIDIA mediante CUDA, con el modelo en FP32.
- Verificacion de integridad de artefactos: el cargador comprueba los hashes ligados al manifiesto y realiza una carga estricta del `state_dict` reconstruido.
- No realiza OCR, no extrae texto, no abre PDFs, no determina orden de lectura ni jerarquia y no reconstruye celdas de tabla.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No se documentan capacidades de agente, razonamiento multi-paso, vision general, audio ni modo de pensamiento.
- El modelo base indica soporte multilingue no disponible; no hay datos de idiomas para este pack.
- No se proporciona soporte para AX Engine, MLX, oMLX ni MTPLX en este artefacto.

## Casos de uso

- Digitalizacion de archivos historicos: el detector localiza y clasifica bloques (texto, encabezados, imagenes, tablas) en cada pagina rasterizada, de modo que un pipeline posterior puede dirigir cada region a un motor de OCR especifico o a un extractor de tablas, reduciendo el coste de procesar documentos completos con OCR de pagina entera.
- Enrutado de documentos en gestion documental: a partir de las clases detectadas (por ejemplo, presencia de `page_header`, `table` o `formula`) se puede clasificar el tipo de pagina y decidir el flujo de trabajo, sin necesidad de leer el contenido textual.
- Preprocesado para pipelines de RAG sobre PDF: las cajas de `text`, `section_header` y `list_item` permiten segmentar la pagina antes de aplicar OCR y chunking, mejorando la coherencia de los fragmentos que se indexan en una base vectorial.
- Analisis de maquetacion editorial: medir la proporcion de area dedicada a `picture`, `table` o `text` por pagina para auditar el cumplimiento de una plantilla o comparar ediciones de una misma publicacion.
- Extraccion de figuras y tablas para reutilizacion: las cajas de las clases `picture` y `table` sirven para recortar esas regiones como imagenes independientes y alimentar un sistema de catalogacion o de recuperacion visual.
- Control de calidad de digitalizaciones: detectar paginas en las que faltan clases esperadas (por ejemplo, ausencia de `text` en un documento que deberia tenerlo) como senal de un escaneo defectuoso o de un fallo de decodificacion.
- Anotacion asistida para crear datasets: usar las detecciones como preanotaciones sobre las que un revisor humano corrige cajas, reduciendo el coste de construir corpus de layout etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se hace ninguna afirmacion de AP, throughput o superioridad, que la evaluacion emparejada frente al modelo fuente esta pendiente y que los resultados del modelo original no deben reutilizarse como resultados del modelo cuantizado. Las unicas pruebas documentadas son tres comprobaciones de humo con raster sintetico ejecutadas en una NVIDIA GeForce RTX 5090 con PyTorch 2.8.0+cu128 y CUDA 12.8 el 2026-10-17 UTC, que establecen ejecucion correcta y salidas finitas, no precision ni velocidad.

| Metrica | Valor |
|---|---|
| AP / mAP en dataset de layout | no disponible |
| Latencia de inferencia | no disponible |
| Throughput (paginas/s) | no disponible |
| Comparacion con el modelo fuente sin cuantizar | pendiente de evaluacion emparejada |
| Pruebas de ejecucion | 3 smoke checks con raster sintetico en RTX 5090 (PyTorch 2.8.0+cu128, CUDA 12.8) |

## Requisitos de hardware

- VRAM estimada: partiendo de los 21.231.224 parametros y de la ejecucion en FP32, los pesos ocupan aproximadamente 85 MB (21.231.224 × 4 bytes). Sumando activaciones y el contexto de ejecucion de CUDA, el consumo realista se situa muy por debajo de 1 GB, aunque no hay una medicion publicada.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con PyTorch 2.8.0+cu128. La unica configuracion verificada por el autor es una GeForce RTX 5090 con CUDA 12.8.
- GPU de consumo: si, el modelo cabe holgadamente en cualquier GPU de consumo moderna con soporte CUDA, dado el reducido numero de parametros.
- Despliegue: la unica ruta soportada es el cargador de referencia `axq_doclayout.load()`, que devuelve un modelo FP32 en CPU que el usuario ha de mover a CUDA. El helper `predict()` incluido sigue siendo exclusivo de CPU. No se ofrece soporte para vLLM, llama.cpp, Ollama ni TGI, marcos que ademas no aplican a un detector de objetos de este tipo.
- Notas de instalacion: se recomienda Python 3.12 en un entorno aislado, con `torch==2.8.0` y `torchvision==0.23.0` desde el indice cu128, mas `axquant==2.2.1`, `huggingface-hub==0.36.2`, `numpy==2.2.6`, `pydantic==2.12.5`, Pillow y safetensors. El ejemplo desactiva TF32 en matmul y cuDNN.
- Detalle operativo: la lista blanca de enlaces simbolicos de cache del cargador de referencia es anterior al renombrado del repositorio, por lo que la descarga debe hacerse con `local_dir` a ficheros normales. El ejemplo fija la revision `4d7dab0196b1b38c4000868c77145d31c6edf189`, conservada tras el renombrado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo fuente ni de alternativas de la misma categoria en la informacion proporcionada, por lo que no es posible establecer comparaciones cuantitativas. La unica comparacion documentada es la relacion entre este pack y su modelo base.

| Modelo | Arquitectura | Parametros | Contexto / entrada | Licencia | Formato de pesos | Estado |
|---|---|---|---|---|---|---|
| AXDocLayout-M v1.1 · CUDA · AXQ NVFP4 | RT-DETRv2 `rtdetrv2_r50vd_m` | 21.231.224 | entrada letterbox 1024 × 1024 | AGPL-3.0 | safetensors AXQ NVFP4, decodificado a FP32 | experimental, calidad no certificada |
| AXDocLayout-M v1.1 (modelo base) | RT-DETRv2 `rtdetrv2_r50vd_m` | no disponible | entrada letterbox 1024 × 1024 | no disponible en la informacion proporcionada | no disponible | modelo de referencia sin cuantizar |
| Otras alternativas de deteccion de layout (por ejemplo, detectores basados en PubLayNet) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Conviene recordar que el modelo fuente expone `AXDocLayout.from_pretrained()`, que no acepta este pack cuantizado, de modo que no son intercambiables a nivel de API.

## Limitaciones y advertencias

- El artefacto esta marcado como `experimental` y en estado de desarrollo. El autor indica que ni la calidad ni la velocidad estan certificadas.
- No hay evaluacion de precision: no se ha publicado AP ni ninguna metrica de calidad, y la evaluacion emparejada frente al modelo fuente esta pendiente. No se deben reutilizar los resultados del modelo original como si fueran de este pack.
- La cuantizacion es con perdida: la descomposicion restaura tensores FP32, pero no los valores originales sin cuantizar. Se debe validar la calidad sobre entradas representativas antes de desplegar.
- El nombre y las etiquetas pueden inducir a error: a pesar de `NVFP4` y de la etiqueta `8-bit`, la ruta de referencia ejecuta en FP32 y no usa memoria de GPU de 4 bits, ni activaciones FP16, ni computo FP4 nativo, ni ofrece ninguna mejora de velocidad demostrada sobre el modelo fuente.
- No implementa ni verifica kernels nativos FP4 ni W4A16.
- El detector no abre PDFs, no hace OCR, no extrae texto, no determina orden de lectura ni jerarquia y no reconstruye celdas de tabla. Cualquier uso que requiera texto necesita un componente adicional.
- El umbral de confianza del ejemplo es 0,30; la evaluacion de AP requiere su propio umbral bajo declarado y un protocolo comun.
- El helper `predict()` es solo CPU y el modelo fuente no puede cargar este pack mediante `from_pretrained()`.
- La descarga debe realizarse con `local_dir` a ficheros normales por una limitacion del cargador con enlaces simbolicos de cache. Hay que ejecutar en un proceso Python nuevo para evitar importar otro paquete `ax_doclayout`.
- Idiomas soportados: no disponible. Al ser un detector visual de layout, depende de la apariencia tipografica de los documentos vistos en entrenamiento, dato que no se publica.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Es razonable esperar degradacion en maquetaciones muy alejadas del dominio de entrenamiento, pero no hay datos que lo cuantifiquen.
- Riesgo de alucinacion: en deteccion de objetos el equivalente son falsos positivos y cajas espurias; no hay tasas publicadas.
- Licencia AGPL-3.0: licencia copyleft fuerte. El uso comercial es posible, pero la distribucion de obras derivadas o la exposicion del modelo como servicio en red pueden activar obligaciones de liberacion del codigo fuente. Conviene revision legal antes de integrarlo en un producto propietario o en un servicio alojado.
- Soporte nulo para AX Engine, MLX, oMLX y MTPLX en este artefacto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AXDocLayout-M-v1.1-CUDA-AXQ-NVFP4
- Modelo base: https://huggingface.co/AutomatosX/AXDocLayout-M-v1.1
- Revision fijada del artefacto cuantizado: `4d7dab0196b1b38c4000868c77145d31c6edf189`
- Revision del modelo fuente: `2c419a0da355ee5e979cfeb0808f596aae6e896e`
- SHA-256 del safetensors fuente: `3b97ba1c0b1b0816f45e79a76bb2fd495e026d2394471b76ce1a442baa2989c4`
- Paquete `axquant` (version 2.2.1) en PyPI: https://pypi.org/project/axquant/
- Indice de PyTorch con CUDA 12.8: https://download.pytorch.org/whl/cu128
- Paper de RT-DETRv2: no disponible en la informacion proporcionada
- Repositorio de codigo, demo o blog del autor: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo.
