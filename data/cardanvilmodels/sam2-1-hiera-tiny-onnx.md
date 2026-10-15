# CardAnvilModels/sam2.1-hiera-tiny-ONNX

## Resumen

SAM 2.1 Hiera Tiny (ONNX, fp16) es una conversión a formato ONNX del modelo de segmentación de imágenes `facebook/sam2.1-hiera-tiny` de Meta AI, publicada por el usuario `CardAnvilModels`. No es un modelo de lenguaje: es un modelo de segmentación de propósito general ("promptable segmentation") que, dada una imagen y una indicación del usuario (un punto, una caja o una rejilla de puntos), devuelve la máscara del objeto correspondiente. El paquete está pensado para ejecutarse en el navegador mediante Transformers.js y `onnxruntime-web`, que es el caso de uso declarado por su autor en la aplicación Card Anvil.

El repositorio no contiene pesos nuevos ni ningún reentrenamiento: según su propia model card, es una copia sin modificar de los ficheros fp16 del repositorio `onnx-community/sam2.1-hiera-tiny-ONNX` en el commit `814a066`, fijados para que la aplicación que los consume no se rompa si el repositorio original cambia. Se han omitido deliberadamente el resto de precisiones (por ejemplo, fp32 o cuantizaciones int8) que sí ofrece el repositorio de origen.

Su relevancia práctica es acotada pero clara: ofrece una vía sencilla y ligera (0,1 GB de repositorio) para añadir segmentación interactiva a aplicaciones web sin backend, usando la API de Transformers.js y ejecución en WebAssembly o WebGPU. La licencia Apache 2.0, heredada del modelo original, permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer jerarquico Hiera (encoder de imagen) + prompt encoder + mask decoder; exportado en dos grafos ONNX separados (vision encoder y prompt encoder + mask decoder) |
| Parametros totales | no disponible en la informacion proporcionada (el repositorio ocupa 0,1 GB en fp16, lo que implica un modelo de decenas de millones de parametros; la cifra exacta no se indica) |
| Longitud de contexto | no aplica (modelo de vision); la resolucion de entrada se define en `preprocessor_config.json`, no incluido en el extracto disponible |
| Tipos de cuantizacion | solo fp16 (las demas precisiones del repositorio de origen se han omitido) |
| Idiomas soportados | no disponible / no aplica (modelo de segmentacion de imagenes, sin componente de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX fp16 (`onnx/vision_encoder_fp16.onnx` y `onnx/prompt_encoder_mask_decoder_fp16.onnx`, ambos con ficheros de datos externos `.onnx_data`), mas `config.json`, `preprocessor_config.json` y `processor_config.json` |
| Tamano del repositorio | 0,1 GB |
| Libreria declarada | transformers.js |
| Pipeline | mask-generation |
| Modelo base | facebook/sam2.1-hiera-tiny |

## Arquitectura y entrenamiento

El modelo original SAM 2 (Segment Anything in Images and Videos, Meta AI, 2024) combina un encoder de imagen basado en Hiera, un transformer jerarquico sin las complejidades de los detectores por ventanas (ventanas de atencion o convoluciones), con un prompt encoder que codifica indicaciones geometricas (puntos, cajas, mascaras) y un mask decoder ligero que produce las mascaras. La variante "tiny" es el backbone mas pequeno de la familia SAM 2.1, por debajo de small, base+ y large. SAM 2 extiende el diseno de SAM con mecanismos de memoria para seguimiento en video, pero este paquete ONNX solo incluye dos grafos —vision encoder y prompt encoder con mask decoder—, por lo que los componentes de memoria asociados al video no forman parte de la exportacion.

En cuanto al entrenamiento, esta ficha no dispone de informacion sobre el numero de tokens o imagenes, la composicion del dataset, ni si se aplicaron fases de ajuste con preferencias humanas. El autor de la conversion no aporta esos datos y la model card se limita a atribuir el modelo a Meta AI y la conversion a ONNX a la ONNX Community. La innovacion tecnica relevante en este artefacto concreto no es de modelado sino de empaquetado: la division en dos grafos permite ejecutar el encoder de imagen una sola vez por imagen y reutilizar sus embeddings para multiples indicaciones sucesivas (clic a clic) sin recalcular todo el encoder, algo especialmente util en el navegador.

## Capacidades

- Segmentacion interactiva por punto: dada una imagen y una coordenada, devuelve la mascara del objeto bajo ese punto.
- Segmentacion por caja delimitadora: acepta una caja como indicacion y devuelve la mascara del objeto contenido.
- Generacion de mascaras (pipeline `mask-generation`): generacion automatica de mascaras sobre multiples indicaciones, tipicamente una rejilla de puntos, sin intervencion del usuario.
- Refinamiento iterativo: al separar el encoder de imagen del decodificador, se pueden encadenar varias indicaciones sobre la misma imagen reutilizando los embeddings ya calculados.
- Ejecucion en el navegador: integracion con Transformers.js y `onnxruntime-web`, con ejecucion en WebAssembly o WebGPU.
- Ejecucion en servidor o en Node.js mediante `onnxruntime` estandar, al ser un grafo ONNX convencional.
- No incluye: tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas ni capacidades multilingues. Es un modelo exclusivamente visual y de segmentacion.
- No incluye, en este paquete, los componentes de memoria necesarios para el seguimiento de objetos en video de SAM 2.

## Casos de uso

- Seleccion de objetos en herramientas de edicion web: el modelo permite que el usuario haga clic sobre una foto en el navegador y obtenga la mascara del objeto al instante, sin enviar la imagen a un servidor. Es el escenario para el que el autor publica esta copia.
- Recorte y eliminacion de fondos en aplicaciones de diseno grafico: con una caja o un punto sobre el sujeto se obtiene la mascara que despues se aplica como canal alfa, evitando herramientas de recorte manual.
- Anotacion asistida de datasets de vision por computador: generar mascaras preliminares sobre un lote de imagenes y corregirlas despues a mano reduce el tiempo de etiquetado frente a la anotacion poligonal desde cero.
- Fotos de producto en comercio electronico: segmentar el producto para sustituir el fondo por blanco o por una escena generada, en un proceso por lotes que puede ejecutarse en el propio navegador del operador.
- Preprocesado en pipelines de OCR y clasificacion: aislar la region de interes (una pagina, un cartel, un objeto) antes de pasarla a otro modelo, mejorando la relacion senal-ruido de la entrada.
- Efectos y realidad aumentada en web: recortar en tiempo real al sujeto de la camara del dispositivo para aplicar filtros o superposiciones, apoyandose en WebGPU cuando este disponible.
- Herramientas de accesibilidad: permitir que un usuario seleccione un objeto concreto de una imagen para ampliarlo o describirlo despues con otro modelo, usando una indicacion minima (un clic).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas (ni IoU, ni comparativas con otros backbones de SAM 2.1) y la busqueda web realizada no aporto ningun dato al respecto: los resultados devueltos no guardaban relacion con el modelo ni con segmentacion de imagenes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio completo ocupa 0,1 GB en fp16, de modo que los pesos en memoria son del orden de decenas o pocos cientos de MB; el consumo adicional depende de la resolucion de entrada y de los mapas de caracteristicas intermedios.
- GPU de servidor (A100, H100, L4, T4): compatibles a traves de `onnxruntime-gpu` o de un runtime que acepte ONNX, aunque para este tamano son sobredimensionadas; el cuello de botella sera el preprocesado, no el calculo.
- GPU de consumo (RTX 3060, 4060, 4090): el modelo cabe con holgura en cualquier GPU con 4 GB o mas de VRAM, incluidos equipos modestos.
- Ejecucion sin GPU: es viable en CPU mediante WebAssembly, que es precisamente el modo por defecto de `onnxruntime-web`; en ese caso la latencia dependera del numero de nucleos y de la resolucion de entrada.
- Navegador: con WebGPU la inferencia se acelera en GPUs integradas y dedicadas; sin WebGPU, Transformers.js recurre a WASM.
- Opciones de despliegue: Transformers.js (navegador o Node.js), `onnxruntime-web`, `onnxruntime` / `onnxruntime-gpu`, y cualquier runtime compatible con ONNX. Tambien se puede exportar a otros formatos a partir del modelo PyTorch original.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CardAnvilModels/sam2.1-hiera-tiny-ONNX | no disponible (backbone tiny); repo de 0,1 GB | ONNX fp16, solo fp16 | imagen + indicaciones (punto/caja/rejilla); resolucion no disponible | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| onnx-community/sam2.1-hiera-tiny-ONNX | el mismo | ONNX en varias precisiones | el mismo | Apache 2.0 | HuggingFace, repositorio de origen del anterior |
| facebook/sam2.1-hiera-tiny | no disponible en la informacion proporcionada | PyTorch (safetensors) | el mismo | Apache 2.0 | HuggingFace, modelo base original |
| Otros backbones de la familia SAM 2.1 (small, base+, large) | no disponible en la informacion proporcionada | PyTorch y ONNX | el mismo, con mayor capacidad y coste | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje. Cualquier expectativa de generacion de texto, razonamiento, codigo o tool calling no aplica.
- La model card advierte explicitamente de que se trata de una copia sin cambios de otro repositorio: si el repositorio de origen recibe correcciones, esta copia no las heredara automaticamente.
- Solo se distribuye la precision fp16. No hay versiones fp32 ni cuantizadas en este repositorio, lo que limita el ajuste fino entre calidad y coste.
- No se incluyen los componentes de memoria para video de SAM 2: el paquete contiene unicamente el encoder de imagen y el decodificador de mascaras, por lo que el seguimiento de objetos en video no esta cubierto.
- La calidad de las mascaras depende de la indicacion: puntos ambiguos (bordes, oclusiones, objetos solapados de textura similar) pueden producir mascaras incorrectas o que se filtren al fondo. No hay estimacion de incertidumbre publicada.
- Riesgo de alucinacion entendido como mascara inexistente: el modelo siempre devuelve una region segmentada, incluso si la indicacion cae sobre una zona sin objeto definido. En produccion conviene validar la mascara (por ejemplo, con umbrales de confianza o comprobaciones de area) antes de usarla.
- Ausencia de datos de sesgo publicados: no hay informacion sobre el comportamiento del modelo en funcion del tipo de imagen, la iluminacion, la piel o la demografia de los sujetos representados. Es un riesgo relevante si se aplica a personas.
- Licencia Apache 2.0, heredada del modelo original: permite uso comercial, modificacion y redistribucion, con la obligacion de conservar el aviso de licencia y los ficheros de atribucion. La model card incluye el fichero `LICENSE` en el repositorio.
- El modelo procede de Meta AI; conviene revisar los terminos del repositorio original `facebook/sam2.1-hiera-tiny` y del repositorio de la libreria Transformers.js antes de un despliegue comercial.
- La fecha de creacion del repositorio indicada en los metadatos (2026-10-15) no se ha verificado de forma independiente.
- Sin adopcion medible: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de senal de la comunidad sobre su estabilidad en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/CardAnvilModels/sam2.1-hiera-tiny-ONNX
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-tiny
- Repositorio ONNX de origen (commit fijado): https://huggingface.co/onnx-community/sam2.1-hiera-tiny-ONNX/tree/814a066640debee5a91e70aa401fb8e17e030503
- Codigo de SAM 2 (Meta AI): https://github.com/facebookresearch/sam2
- Transformers.js: https://github.com/huggingface/transformers.js
- Card Anvil (proyecto del autor): https://github.com/Card-Anvil
- Paper de referencia citado en la model card: "SAM 2: Segment Anything in Images and Videos" (2024), enlazado desde el repositorio de Meta AI
- Nota sobre la busqueda web: los resultados obtenidos no guardaban relacion con el modelo ni con segmentacion de imagenes, por lo que no se han utilizado como fuente.
