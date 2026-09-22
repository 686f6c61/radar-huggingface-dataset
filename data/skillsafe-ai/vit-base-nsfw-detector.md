# skillsafe-ai/vit-base-nsfw-detector

## Resumen

`skillsafe-ai/vit-base-nsfw-detector` es una redistribucion en formato ONNX de un clasificador binario de imagenes (clases `sfw` / `nsfw`) basado en un Vision Transformer. No es un modelo entrenado desde cero: el repositorio publica artefactos listos para navegador generados por el conversor reproducible de SkillSafe a partir del modelo ya existente `AdamCodd/vit-base-nsfw-detector`, fijado al commit `8587de998f441aac03fdd57a85d2e4cb808c7d64`. Ese modelo, a su vez, es un fine-tuning de `google/vit-base-patch16-384`, un ViT-base con parches de 16x16 y resolucion de entrada de 384x384 pixeles.

El problema que resuelve es la deteccion de contenido para adultos en imagenes dentro de aplicaciones web, con una particularidad relevante: al distribuirse en ONNX, puede ejecutarse integramente en el navegador mediante `onnxruntime-web` (con proveedores de ejecucion WebGPU o WASM), sin enviar la imagen a un servidor. Esto permite moderacion en el cliente, filtrado previo a la subida y despliegues sin infraestructura de GPU, algo interesante para productos con requisitos de privacidad o con coste de servidor limitado.

La relevancia del repositorio es mas de empaquetado y trazabilidad que de investigacion: cada fichero esta fijado por hash SHA-256 a su origen, los ONNX pasaron `onnx.checker` y una prueba de humo en CPU, y se documenta la cadena de herramientas exacta. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que carece de validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-base, patch 16, resolucion 384), fine-tuneado para clasificacion binaria `sfw` / `nsfw` |
| Parametros totales | no disponible en la informacion proporcionada (la arquitectura declarada es ViT-base; el ONNX en fp32 de 328,61 MB resulta coherente con ~86 M de parametros, pero el dato no se explicita) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes; entrada fija de 384x384 px, tensor `pixel_values` de forma `[batch_size, 3, 384, 384]`) |
| Tipos de cuantizacion | ONNX en fp32 (`onnx/model.onnx`, 328,61 MB) y una variante cuantizada (`onnx/model_quantized.onnx`, 84,40 MB); el esquema exacto de cuantizacion no se especifica |
| Idiomas soportados | no aplica (modelo de vision, sin componente textual ni multilingue) |
| Licencia | Apache-2.0 para los pesos; la receta de conversion y la model card pertenecen al repositorio de SkillSafe |
| Formato de pesos | ONNX (opsets 14): `onnx/model.onnx` y `onnx/model_quantized.onnx`; acompanados de `config.json` y `preprocessor_config.json` |
| Pipeline | `image-classification` |
| Entrada / salida | entrada `pixel_values` float32 `[batch_size, num_channels, height, width]`; salida `logits` float32 `[batch_size, 2]` |
| Tamano del repositorio | 0,4 GB |
| Modelo de origen | `AdamCodd/vit-base-nsfw-detector` (commit `8587de998f441aac03fdd57a85d2e4cb808c7d64`), fine-tuneado desde `google/vit-base-patch16-384` |
| Cadena de herramientas declarada | Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0, Darwin 25.6.0 arm64 |
| Fecha de publicacion del repositorio | 2026-09-22 (creado 20:43:19 UTC; conversion declarada a las 20:40:21 UTC) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Vision Transformer estandar de tipo ViT-base con parches de 16x16 y entrada de 384x384 pixeles, el backbone `google/vit-base-patch16-384`. Sobre el se aplica una cabeza de clasificacion con dos salidas (`sfw` y `nsfw`), tal como refleja el contrato ONNX: un tensor de entrada `pixel_values` de forma `[batch_size, 3, 384, 384]` y un tensor de salida `logits` de forma `[batch_size, 2]`, con opset 14. La imagen debe preprocesarse con las reglas declaradas en `preprocessor_config.json`, que se distribuye junto a los pesos.

No hay informacion en los materiales proporcionados sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO en el modelo original de AdamCodd. Tampoco se documenta ninguna innovacion tecnica especifica (atencion lineal, decodificacion especulativa, destilacion, etc.). Lo que si documenta este repositorio es un proceso de importacion determinista, sin conversion: los ficheros se publican tal cual estaban en el origen, cada uno fijado por SHA-256, con una receta declarada (`recipes/vit-base-nsfw-detector.yaml`, sha256 `b1ea4628ea34bfd6e409d6392ccc462fdbd4cd7974457ea122dbeff380918233`) y verificacion mediante `onnx.checker` mas una ejecucion de humo en CPU con entradas de ceros.

## Capacidades

- Clasificacion binaria de imagenes en dos clases: contenido apto (`sfw`) y contenido para adultos (`nsfw`), a partir de los `logits` de salida.
- Inferencia en el navegador: el formato ONNX permite ejecutar el modelo con `onnxruntime-web` usando WebGPU o WASM, sin backend propio.
- Ejecucion en CPU: la prueba de humo declarada se ejecuto en CPU con onnxruntime, sin GPU.
- Variante cuantizada disponible para escenarios con restricciones de memoria o ancho de banda (84,40 MB frente a 328,61 MB).
- Entrada de imagen fija a 384x384 pixeles en RGB (3 canales) y tipo float32.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling, function calling ni uso como agente.
- No soporta razonamiento multi-paso ni modo "thinking".
- No es multimodal en el sentido habitual: no procesa texto, audio ni video, y no genera descripciones.
- La salida es una puntuacion por clase, no una etiqueta con explicabilidad ni coordenadas de regiones (no hay deteccion de objetos ni segmentacion).

## Casos de uso

- Moderacion previa a la subida en el navegador: la aplicacion puede clasificar la imagen localmente con `onnxruntime-web` antes de enviarla al servidor, de modo que la imagen solo se transmite si pasa el filtro. Reduce coste de ancho de banda y mejora la privacidad del usuario.
- Filtrado en aplicaciones de mensajeria o redes sociales en el cliente: al ejecutarse con WebGPU o WASM, permite difuminar o bloquear contenido potencialmente inapropiado en el propio dispositivo, incluso sin conexion.
- Extension de navegador para control parental: el clasificador de 84,40 MB cuantizado es lo bastante pequeno para distribuirse dentro de una extension y ejecutarse sobre las imagenes de una pagina.
- Pre-filtro en pipelines de moderacion del lado servidor: usando onnxruntime en Node o Python se puede descartar de forma automatica la mayor parte del contenido claro y reservar la revision humana para los casos dudosos, reduciendo el volumen de la cola de moderacion.
- Curacion de datasets de imagenes: filtrado masivo y automatizado de corpus visuales para eliminar contenido para adultos antes de usarlos en entrenamiento o en analisis, ejecutable en CPU sin GPU.
- Verificacion en dispositivos de bajos recursos: al no requerir GPU dedicada ni entorno CUDA, encaja en equipos de sobremesa, portatiles o entornos edge donde otros detectores basados en frameworks pesados no son viables.
- Cumplimiento y trazabilidad en produccion regulada: los hashes SHA-256 por fichero y el registro del toolchain permiten auditar exactamente que pesos se estan desplegando, util en procesos de revision de cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (exactitud, precision, recall, F1, AUC) en la informacion disponible. La model card solo documenta una prueba de humo funcional en CPU con entradas de ceros, que verifica la forma de los tensores y el tiempo de ejecucion, no la calidad de las predicciones:

| Fichero | Entradas | Salidas | Tiempo declarado (ms) | Tipo de prueba |
|---|---|---|---|---|
| `onnx/model.onnx` | `pixel_values[1, 3, 384, 384]` | `logits[1, 2]` | 80,5 | Prueba de humo en CPU con onnxruntime y entradas de ceros |
| `onnx/model_quantized.onnx` | `pixel_values[1, 3, 384, 384]` | `logits[1, 2]` | 64,2 | Prueba de humo en CPU con onnxruntime y entradas de ceros |

El hardware empleado en esas mediciones no se especifica, y no hay datos de throughput, latencia en WebGPU ni comparacion de calidad entre la version fp32 y la cuantizada.

## Requisitos de hardware

- VRAM estimada: el fichero fp32 ocupa 328,61 MB y el cuantizado 84,40 MB; con activaciones y buffers, la inferencia se mantiene por debajo de 1 GB en ambos casos.
- GPU recomendadas: no requiere GPU dedicada. Es viable en CPU sola, en GPUs integradas y en cualquier GPU consumer (serie RTX 20/30/40 o equivalente) si se usa WebGPU.
- Compatibilidad con GPU consumer: si, en todas las gamas. Incluso el modelo fp32 completo cabe holgadamente en cualquier GPU con 1 GB de memoria libre.
- Despliegue en navegador: `onnxruntime-web` con `executionProviders: ["webgpu", "wasm"]`, cargando el `.onnx` desde HuggingFace o desde `models.skillsafe.ai`.
- Despliegue en servidor: onnxruntime para Node o Python en CPU; `transformers.js` si se prefiere la API de la libreria declarada en el repositorio.
- Opciones no aplicables: vLLM, TGI, llama.cpp y Ollama no son adecuadas, ya que no se trata de un modelo de lenguaje.
- Latencia declarada: 80,5 ms (fp32) y 64,2 ms (cuantizado) en la prueba de humo en CPU; hardware no especificado.
- Throughput: no disponible.
- Nota operativa: los ficheros de tipo `registry` se sirven desde `models.skillsafe.ai` una vez vetados, segun la model card, lo que introduce una dependencia de red adicional si no se aloja una copia propia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|---|
| `skillsafe-ai/vit-base-nsfw-detector` | ViT-base, patch 16, 384 px | no disponible | Imagen 384x384 | Apache-2.0 | ONNX (fp32 y cuantizado) | No publicados |
| `AdamCodd/vit-base-nsfw-detector` (origen) | ViT-base, patch 16, 384 px | no disponible | Imagen 384x384 | Apache-2.0 | No especificado en la informacion proporcionada | No publicados |
| `google/vit-base-patch16-384` (backbone de partida) | ViT-base, patch 16, 384 px | no disponible | Imagen 384x384 | Apache-2.0 | No especificado en la informacion proporcionada | No publicados |

Existen otros detectores de contenido para adultos basados en ViT en el ecosistema abierto, pero la informacion proporcionada no incluye resultados comparativos ni especificaciones de esos modelos, por lo que no es posible establecer una comparacion cuantitativa fiable. En la practica, este repositorio y su modelo de origen comparten los mismos pesos, y la diferencia relevante es el formato de distribucion (ONNX listo para navegador frente al repositorio original).

## Limitaciones y advertencias

- Clasificacion binaria y sin granularidad: solo distingue `sfw` de `nsfw`, sin categorias intermedias, sin niveles de severidad y sin localizacion de las regiones problematicas.
- Riesgo de falsos positivos y falsos negativos: no se publican metricas de exactitud, precision o recall, por lo que no se puede estimar la tasa de error antes de desplegarlo. En moderacion de contenido, ambos tipos de error tienen coste (censura indebida o contenido inapropiado que se cuela).
- Composicion del entrenamiento desconocida: al no documentarse el dataset del modelo original, no es posible evaluar sesgos por tono de piel, tipo de ilustracion frente a fotografia, estilo artistico o contexto cultural.
- Entrada fija: el modelo espera exactamente 384x384 px y el preprocesado declarado en `preprocessor_config.json`; cualquier desviacion puede degradar las predicciones.
- Sin idiomas: no procesa texto, por lo que el campo de idiomas no aplica y no debe esperarse ningun comportamiento multilingue.
- Dependencia de red si se carga desde HuggingFace o desde `models.skillsafe.ai`; para produccion conviene alojar los ficheros y verificar los hashes SHA-256 declarados.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la ficha, sin issues ni evaluaciones de terceros. El repositorio esta marcado con la etiqueta `not-for-all-audiences`.
- Las mediciones de latencia proceden de una prueba de humo con entradas de ceros en hardware no especificado; no son representativas del rendimiento en produccion ni de la calidad del modelo.
- Licencia: los pesos son Apache-2.0, lo que permite uso comercial, pero se exige atribucion a AdamCodd y mencion de la licencia; la receta de conversion y la model card quedan bajo la licencia del repositorio de SkillSafe. Conviene revisar el aviso enlazado en la model card del modelo original.
- Uso responsable: un detector de este tipo no sustituye la revision humana en contextos sensibles, y su uso como unico criterio de decision puede provocar errores dificiles de auditar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/skillsafe-ai/vit-base-nsfw-detector
- Modelo de origen: https://huggingface.co/AdamCodd/vit-base-nsfw-detector
- Commit de origen fijado por el conversor: https://huggingface.co/AdamCodd/vit-base-nsfw-detector/tree/8587de998f441aac03fdd57a85d2e4cb808c7d64
- Aviso de licencia y atribucion del modelo original: https://huggingface.co/AdamCodd/vit-base-nsfw-detector/blob/8587de998f441aac03fdd57a85d2e4cb808c7d64/README.md
- Receta de conversion de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Backbone de partida: https://huggingface.co/google/vit-base-patch16-384

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces encontrados correspondian a paginas generales de ChatGPT y OpenAI, sin relacion con el modelo descrito, por lo que se han omitido.
