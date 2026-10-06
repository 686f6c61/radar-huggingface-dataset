# cstr/sam2.1-hiera-tiny-GGUF

## Resumen

Este repositorio contiene una conversion a formato GGUF del modelo SAM 2.1 Hiera-tiny de Meta (identificador base `facebook/sam2.1-hiera-tiny`), publicada por el usuario cstr. Se trata de un modelo de segmentacion de imagenes de proposito especifico: dado un prompt en forma de punto o caja delimitadora sobre una imagen, genera mascaras de segmentacion del objeto correspondiente. No es un modelo generativo de texto ni un modelo de lenguaje, por lo que su pipeline declarado en HuggingFace es `mask-generation`.

La conversion esta pensada para el motor ggml SAM 2.1 de CrispEmbed (API C `crispembed_sam2_*`) y se usa como proveedor de mascaras `sam` dentro de Crisp 3D Studio. Un aspecto importante es que esta version solo cubre el modo imagen: las partes de memoria de video de SAM 2 (seguimiento temporal de objetos entre fotogramas) no estan incluidas. El modelo tiene 31.306.244 parametros y el repositorio ocupa 0,2 GB.

La relevancia de esta ficha radica en que ofrece una via de despliegue muy ligera (el archivo F16 pesa 62,9 MB) para segmentacion asistida por prompts, ejecutable incluso en CPU sin dependencias de PyTorch. La verificacion numerica publicada por el autor indica una fidelidad practicamente exacta frente a la implementacion de referencia en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hiera (encoder jerarquico) + FPN + decoder de mascaras (SAM 2.1); solo modo imagen |
| Parametros totales | 31.306.244 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentacion con prompts de punto o caja) |
| Tipos de cuantizacion | F16 (62,9 MB) y F32 (125 MB) publicados; Q8_0 medido pero no publicado; Q4_K no utilizable |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (libreria ggml); existe una exportacion ONNX equivalente en `cstr/sam2.1-hiera-tiny-ONNX` |

## Arquitectura y entrenamiento

La arquitectura corresponde al encoder Hiera de SAM 2.1 en su variante tiny, con 12 bloques Hiera, seguido de un modulo FPN y de un decoder de mascaras que produce cuatro salidas de mascara a partir de prompts de punto o de caja. La conversion a GGUF comprende 296 tensores. Un detalle tecnico relevante de la conversion es que el redimensionado bicubico del position embedding del trunk se almacena como una matriz de remuestreo de 256x7, de modo que el runtime no necesita implementar codigo bicubico.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens de imagen, ni sobre procesos de ajuste como RLHF o DPO, ya que este repositorio es unicamente una conversion de pesos y no documenta el entrenamiento original. La innovacion destacable aqui no esta en el entrenamiento sino en la conversion: F16 resulta sin perdida frente a F32 (coseno del encoder >= 0,999999, logits 1,000000 y mascaras identicas) a mitad de tamano. Segun el autor, Q8_0 degrada una de las cuatro salidas de mascara hasta un IoU de 0,9895 frente a PyTorch, y Q4_K es directamente inutilizable para este modelo.

## Capacidades

- Segmentacion de imagen individual a partir de prompts de punto (objeto y fondo) y de caja delimitadora.
- Generacion de multiples mascaras candidatas (cuatro salidas de mascara) para un mismo prompt.
- Ejecucion sobre CPU mediante ggml, sin necesidad de PyTorch en tiempo de inferencia.
- Integracion como proveedor de mascaras dentro de pipelines de vision (CrispEmbed, Crisp 3D Studio).
- Soporte de tool calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales: no incluye el modo video ni la memoria de video de SAM 2 (seguimiento temporal entre fotogramas).

## Casos de uso

- Segmentacion interactiva de imagenes en aplicaciones de edicion: el usuario marca un punto o dibuja una caja sobre la foto y el modelo devuelve la mascara del objeto, con el archivo F16 de 62,9 MB ejecutandose en local sin GPU.
- Preprocesado para reconstruccion 3D: usado como proveedor de mascaras `sam` en Crisp 3D Studio, permite aislar objetos de una fotografia antes de generar geometria o texturas.
- Anotacion semiautomatica de datasets de vision: dado un punto por objeto, el modelo genera mascaras que se pueden revisar y exportar como etiquetas, reduciendo el trabajo manual de etiquetado.
- Recorte de producto en comercio electronico: con un prompt de caja sobre el producto, se obtiene la mascara para eliminar el fondo de forma consistente en catalogos de imagenes.
- Segmentacion en entornos con recursos limitados: al caber en 62,9 MB en F16 y funcionar en CPU, es adecuado para dispositivos edge o para ejecucion dentro de contenedores ligeros.
- Integracion en herramientas de vision por linea de comandos: gracias a la API C `crispembed_sam2_*` y al formato GGUF, se puede invocar desde scripts o servicios nativos sin cargar el stack de PyTorch.
- Herramientas de fotografia y retoque: seleccion rapida de sujetos para aplicar ajustes locales (exposicion, desenfoque de fondo) a partir de un unico prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (como mIoU sobre SA-1B) en la informacion disponible. El autor si documenta una verificacion de fidelidad frente a PyTorch 2.7 en CPU, con una fotografia de 1749x1155, una caja, cuatro puntos de objeto y un punto de fondo:

| Comprobacion | Resultado |
|---|---|
| Coseno por etapa (patch embedding, 12 bloques Hiera, FPN, tres entradas del decoder, logits de mascara) | 1,000000 |
| Diferencia maxima en logits de mascara | 3,6e-5 |
| Scores | exactos |
| Mascaras resultantes | las cuatro identicas (25 de 25 comprobaciones superadas) |
| Q8_0 (no publicado) | una de las cuatro salidas cae a IoU 0,9895 frente a PyTorch |
| Q4_K | no utilizable para este modelo |

Nota del autor: la comparacion debe hacerse contra PyTorch en CPU y no contra el backend MPS de Apple, porque PyTorch 2.7 en MPS calcula de forma incorrecta el `max_pool2d` con stride en el encoder Hiera (una copia contigua antes del pooling lo corrige).

## Requisitos de hardware

- VRAM estimada: minima; el archivo F16 ocupa 62,9 MB y el F32 125 MB, por lo que cabe en cualquier GPU con unos pocos cientos de MB libres.
- GPU recomendadas: no requiere GPU; funciona en CPU con ggml. Cualquier GPU moderna sirve para acelerar, aunque no hay lista oficial de GPUs validadas en la informacion proporcionada.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en hardware integrado, dado el tamano del modelo.
- Opciones de despliegue: motor ggml SAM 2.1 de CrispEmbed (API C `crispembed_sam2_*`), integracion en Crisp 3D Studio; existe una exportacion ONNX equivalente para runtimes ONNX.
- Latencia y throughput estimados: no disponibles. La verificacion publicada se realizo en CPU sobre una imagen de 1749x1155, pero no se aportan tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Modo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cstr/sam2.1-hiera-tiny-GGUF (este) | 31.306.244 | Solo imagen | GGUF (F16, F32) | Apache-2.0 | HuggingFace |
| facebook/sam2.1-hiera-tiny | no disponible | Imagen y video | PyTorch | Apache-2.0 | HuggingFace / repositorio SAM 2 |
| cstr/sam2.1-hiera-tiny-ONNX | no disponible | Solo imagen (exportacion del mismo modelo) | ONNX | Apache-2.0 | HuggingFace |
| Otras variantes de SAM 2.1 (base+, large) | no disponible | Imagen y video | PyTorch | Apache-2.0 | HuggingFace |

No se dispone de datos comparativos de rendimiento entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo modo imagen: no incluye las partes de memoria de video de SAM 2, por lo que no sirve para seguimiento temporal de objetos entre fotogramas.
- Requiere un prompt (punto o caja): no segmenta de forma totalmente automatica sin intervencion.
- Q4_K no es utilizable con este modelo y Q8_0 degrada una de las salidas de mascara (IoU 0,9895), por lo que la cuantizacion recomendada es F16.
- Riesgo de error en prompts ambiguos o en objetos poco definidos; la calidad de la mascara depende de la calidad del prompt.
- No hay informacion sobre sesgos del modelo en la documentacion disponible; al ser un modelo de vision, los sesgos potenciales se relacionarian con el dataset de entrenamiento original de SAM 2.1, no documentado en este repositorio.
- La comparacion de referencia debe hacerse contra PyTorch en CPU: el backend MPS de Apple produce resultados incorrectos en el encoder Hiera con PyTorch 2.7.
- Licencia Apache-2.0 heredada del modelo original de Meta (Copyright Meta Platforms, Inc. and affiliates); permite uso comercial, pero conviene revisar los terminos del repositorio SAM 2 original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere adopcion muy temprana o nula y ausencia de validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cstr/sam2.1-hiera-tiny-GGUF
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-tiny
- Exportacion ONNX del mismo modelo: https://huggingface.co/cstr/sam2.1-hiera-tiny-ONNX
- Repositorio oficial de SAM 2 (Meta): https://github.com/facebookresearch/sam2
- Motor de conversion e inferencia CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Aplicacion Crisp 3D Studio: https://github.com/CrispStrobe/crisp3ds
