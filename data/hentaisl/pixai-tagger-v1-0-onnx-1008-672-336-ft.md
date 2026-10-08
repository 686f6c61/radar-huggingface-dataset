# HentaiSL/pixai-tagger-v1.0-onnx-1008-672-336-ft

## Resumen

Esta ficha describe una conversión comunitaria a ONNX del modelo PixAI Tagger v1.0, un clasificador de imágenes especializado en el etiquetado automático de ilustraciones de estilo anime. El autor del repositorio es el usuario HentaiSL y parte del checkpoint original publicado por pixai-labs bajo licencia Apache-2.0. El modelo no genera texto: recibe una imagen y devuelve un vector de 30.877 etiquetas de tipo Danbooru (generales, de personaje y de copyright), por lo que su pipeline de HuggingFace es `image-classification`.

La aportación principal del repositorio es doble. Por un lado, ofrece los grafos convertidos a ONNX en FP16 y FP32 en tres resoluciones de entrada (1008, 672 y 336 píxeles), con un script para compilar motores TensorRT específicos por GPU. Por otro, incluye dos familias de pesos: la familia zero-shot (el checkpoint original convertido, con las rejillas de `use_interp_rope` reconstruidas) y una familia fine-tuned destilada a partir del propio modelo a 1008 píxeles sobre 103.821 imágenes durante 2 épocas, disponible a 672 y 336 píxeles.

El interés práctico del repositorio es el rendimiento y la contención de memoria. Los grafos FP32 emplean atención global con consultas troceadas ("query-chunked"), lo que permite ejecutarlos en GPUs de 6 GB de VRAM. Los motores TensorRT FP16 alcanzan los 7,0 ms por imagen a 336 píxeles, frente a los 161 ms de onnxruntime a 1008 píxeles, lo que habilita el etiquetado masivo de bibliotecas de imágenes en hardware de consumo. El proyecto de referencia que motivó el ensamblado es Hammy, una herramienta de organización de vídeo en chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (conversion a ONNX de un tagger de imagenes basado en transformer con RoPE interpolado; no se detalla el backbone) |
| Parametros totales | no disponible (pesos ONNX de ~950 MB en FP16 y ~1,9 GB en FP32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagen; resoluciones de entrada 336, 672 y 1008 px) |
| Tipos de cuantizacion | FP16, FP32, INT8 dinamica (solo CPU, en la variante 336-ft) |
| Idiomas soportados | no disponible para texto de entrada; etiquetas en ingles (Danbooru) y nombres de personaje/copyright en chino via `tag_zh.json` |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con ficheros `.onnx.data` asociados en FP32) y safetensors (versiones fine-tuned) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo original. Los indicios presentes en la model card (reconstruccion de rejillas `use_interp_rope`, exportacion con atencion global troceada por consultas) apuntan a un transformer de vision con atencion por parches y RoPE interpolado para distintas resoluciones, pero no se especifica el numero de capas, la dimension del embedding ni el tokenizador visual. La salida es una cabeza de clasificacion multi-etiqueta con 30.877 clases correspondientes al vocabulario de Danbooru, de las cuales 8.308 son etiquetas de personaje y 2.460 de copyright.

El proceso de entrenamiento documentado es el de destilacion. Partiendo del checkpoint original como "oraculo" ejecutado en FP32 a 1008 pixeles, se generaron etiquetas sobre 103.821 imagenes y se entreno durante 2 epocas una variante fine-tuned a 672 y 336 pixeles. Cada variante fine-tuned incorpora sus propios umbrales de decision reajustados (mas estrictos que los del modelo base) y sus propios ficheros `config.json` y `preprocessor_config.json`, por lo que las carpetas `*-ft/onnx/` son autocontenidas. Los umbrales por categoria del modelo zero-shot son 0,17 (general), 0,27 (personaje) y 0,24 (copyright).

## Capacidades

- Etiquetado multi-etiqueta de ilustraciones anime con un vocabulario de 30.877 etiquetas Danbooru.
- Reconocimiento de personajes (8.308 etiquetas) y de obras o franquicias (2.460 etiquetas de copyright).
- Inferencia a tres resoluciones de entrada: 1008 px (nativa), 672 px y 336 px.
- Nombres en chino para personaje y copyright si se activa `Tagger(zh=True)`.
- Ejecucion en CPU mediante la variante INT8 dinamica de 336-ft.
- Grafos de forma estatica con cierta politica de batching: 336-ft usa lote 2, el resto lote 1.
- No soporta tool calling, agentes ni generacion de texto; es puramente clasificacion de imagen.

## Casos de uso

- Organizacion y archivado de bibliotecas de imagenes anime: el modelo etiqueta lotes completos de ficheros (WebP, JPEG, PNG) y permite construir indices buscables por personaje, copyright o etiqueta general, tal como hace la herramienta Hammy.
- Curacion de datasets para entrenamiento de modelos de difusion: extraer etiquetas Danbooru automaticamente evita el etiquetado manual de miles de imagenes y mantiene el vocabulario alineado con el usado por muchos modelos de generacion.
- Preprocesado de pipelines de generacion con ControlNet o LoRA: clasificar las imagenes de un corpus para filtrar por personaje o franquicia antes de entrenar adaptadores.
- Moderacion y clasificacion de contenido en plataformas de arte: la salida por etiqueta permite politicas granulares sin necesidad de un clasificador binario.
- Analitica de catalogo: agregar etiquetas sobre grandes colecciones para medir tendencias de personajes o franquicias en el tiempo.
- Integracion en herramientas de escritorio: con motores TensorRT FP16 a 7,0 ms por imagen a 336 px, es viable etiquetar en tiempo real mientras el usuario navega por su biblioteca.
- Investigacion sobre tagging de imagenes: al ofrecer variantes zero-shot y fine-tuned con umbrales documentados, sirve como baseline reproducible para comparar metodos de destilacion.

## Benchmarks y rendimiento

No se han publicado en la informacion disponible resultados de benchmarks de MMLU, HumanEval o GSM8K, que no aplican a un modelo de clasificacion de imagen. Los datos publicados por el proyecto original en su pagina de HuggingFace son los siguientes.

| Metrica | Valor |
|---|---|
| Micro F1 (8.407 etiquetas generales compartidas) | 0,6660 |
| Ventaja sobre el siguiente modelo | 2,25 puntos porcentuales |
| mAP (mismo conjunto de etiquetas) | 0,3807 |

La model card de esta conversion describe un metodo de evaluacion contra el checkpoint original FP32 a 1008 px sobre 1.000 imagenes de prueba reales (WebP, lado largo entre 500 y 2.374 px), contando inversiones de etiqueta respecto a los umbrales recomendados de cada modelo. La seccion de precision esta truncada en la informacion disponible, por lo que no se incluyen las cifras completas de la comparacion fine-tuned.

Rendimiento de inferencia (tiempo mediano por imagen, lote 1 salvo indicacion):

| Runtime | @1008 zs | @672 zs | @672-ft | @336-ft (lote 2) |
|---|---|---|---|---|
| PyTorch FP32 (checkpoint original) | 398 ms | 168 ms | — | — |
| onnxruntime FP16 | 161 ms | 65 ms | 63 ms | 16,1 ms |
| onnxruntime FP32 | — | — | 109 ms | 25,5 ms |
| TensorRT FP16 | 61 ms | 26 ms | 25 ms | 7,0 ms |
| TensorRT FP32 (consulta troceada) | 257 ms | 99 ms | 99 ms | 22,1 ms |

## Requisitos de hardware

- VRAM: los grafos FP32 con atencion troceada caben en GPUs de 6 GB; los FP16 son mas ligeros (pesos de ~950 MB por grafo). El tamano del repositorio completo es de 12,2 GB.
- Tarjetas recomendadas: en GPUs con Tensor Cores la ruta preferente es FP16 con TensorRT (61 ms a 1008 px, 7,0 ms a 336 px). Una RTX 4090, A100 o H100 obtienen el maximo rendimiento con esa configuracion.
- Consumer GPU: si cabe. En GPUs sin Tensor Cores, como la GTX 1660 Super (sm_75), conviene compilar con `--fp32`, porque los kernels FP16 caen a rutas SIMT lentas (4.698 ms a 1008 px frente a 1.448 ms del motor FP32 y 1.789 ms del checkpoint PyTorch). El motor FP32 troceado tambien encaja en sus 6 GB.
- Despliegue: onnxruntime y TensorRT son las dos rutas documentadas. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: ver la tabla de la seccion anterior. A 336 px con lote 2 y TensorRT FP16 se alcanzan 7,0 ms por imagen; a 1008 px con TensorRT FP16, 61 ms. La variante INT8 dinamica para CPU es aproximadamente 1,6 veces mas rapida que FP32 y ocupa una cuarta parte.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (PixAI Tagger v1.0 ONNX) | no disponible | 336 / 672 / 1008 px | 0,6660 micro F1, 0,3807 mAP (proyecto original) | Apache-2.0 | HuggingFace, ONNX y safetensors |
| pixai-labs/pixai-tagger-v1.0 | no disponible | 1008 px nativo | mismo resultado base | Apache-2.0 | HuggingFace, pesos originales |
| noaione/pixai-tagger-v1.0-onnx | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace, `model.onnx` |
| WD Tagger (referencia de la comunidad) | no disponible | no disponible | no disponible | no disponible | extension de Stable Diffusion WebUI |

No se dispone de datos publicados que permitan comparar parametros, contexto o rendimiento con alternativas como WD Tagger mas alla de la diferencia de vocabulario: el proyecto original cubre mas de 13.000 etiquetas, frente a las aproximadamente 10.000 de WD Tagger.

## Limitaciones y advertencias

- Dominio restringido: el modelo esta entrenado sobre ilustraciones de estilo anime y vocabulario Danbooru; su comportamiento fuera de ese dominio (fotografia, ilustracion realista) no esta documentado y probablemente sea deficiente.
- Riesgo de etiquetado erroneo: la tarea es clasificacion multi-etiqueta con umbrales por categoria, por lo que una etiqueta que supera el umbral pero es incorrecta puede propagarse a indices, filtros o datasets de entrenamiento.
- Dependencia de umbrales: los grafos fine-tuned exigen usar sus umbrales reajustados, distintos de los del modelo zero-shot. Mezclar configuraciones produce resultados incoherentes. Si se reajustan a mano, hay que actualizar tanto `onnx/config.json` como `safetensors/config.json`.
- Restricciones de forma estatica: los grafos tienen el lote fijado (1 para 1008, 672 y 672-ft; 2 para 336-ft). Un grafo estatico de lote 2 rechaza llamadas de una sola imagen, y solo se justifica un perfil dinamico si el batching varia de verdad (se midio un 14 % mas lento a lote 2 con perfil dinamico en TensorRT).
- Numero de descargas y "me gusta" nulos en el momento del registro, lo que indica que la version no ha sido validada ampliamente por la comunidad.
- La seccion de precision de la model card esta incompleta en la informacion disponible, de modo que no puede verificarse la mejora real de las variantes fine-tuned frente al oraculo.
- Licencia Apache-2.0 en el modelo convertido, pero conviene verificar los terminos del vocabulario Danbooru y del repositorio original antes de un uso comercial.
- No dispone de capacidades generativas, de razonamiento, tool calling ni agentes: cualquier expectativa en ese sentido es erronea.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HentaiSL/pixai-tagger-v1.0-onnx-1008-672-336-ft
- Modelo base: https://huggingface.co/pixai-labs/pixai-tagger-v1.0
- Conversion ONNX alternativa: https://huggingface.co/noaione/pixai-tagger-v1.0-onnx
- Herramienta Hammy: https://github.com/DoremySL/Hammy
- ImageTaggerGUI: https://github.com/wai55555/ImageTaggerGUI
- PixAI Tagger ONNX GUI: https://github.com/async0x42/pixaitaggeronnxgui
- Articulo de analisis (note.com, septiembre de 2026): https://note.com/hirorohi03/n/n42d2c4cfbfea
