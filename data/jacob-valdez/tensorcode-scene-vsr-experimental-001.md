# jacob-valdez/tensorcode-scene-vsr-experimental-001

## Resumen

TensorCode Scene (identificador `jacob-valdez/tensorcode-scene-vsr-experimental-001`) es un checkpoint multimodal experimental construido por el usuario jacob-valdez sobre la libreria `tensorcode`, que parte del modelo de vision-lenguaje congelado `openai/clip-vit-base-patch32` y anade proyecciones entrenables de imagen y texto, un espacio de trabajo recurrente con slots aprendidos ("Workspace") y una cabeza de ranking. El modelo no genera texto ni respuestas: recibe una imagen, una pregunta o caption y una lista explicita de candidatos textuales, y devuelve un ranking de esos candidatos junto con coordenadas de parches de origen, atencion de enrutado y relaciones entre slots.

La relevancia de esta ficha no es la de un modelo utilizable, sino la de un resultado negativo reproducible. El propio autor declara en la model card que el checkpoint "no demuestra razonamiento espacial visual util" y que se publica como experimento negativo reproducible, no como asistente de vision listo para produccion. Sobre 128 imagenes de test reservadas, la precision del modelo completo cae del 55,47 % al 50,78 % y la entropia cruzada sube de 0,69266 a 4,64355, mientras que la perdida media de entrenamiento baja hasta 0,46472, un patron compatible con sobreajuste.

El modelo tiene 151.388.609 parametros totales (dato real de los pesos safetensors) y el repositorio ocupa aproximadamente 0,6 GB. Esta entrenado y evaluado en la particion `random` del benchmark VSR (Visual Spatial Reasoning) de Cambridge LTL, con imagenes derivadas de COCO, y la unica lengua declarada es el ingles. No se ha publicado licencia para el checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perception congelada CLIP ViT-B/32 mas proyecciones entrenables de imagen y texto, Workspace recurrente de slots aprendidos y cabeza de ranking; pipeline declarado `image-classification` |
| Parametros totales | 151.388.609 |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; la entrada es imagen + pregunta/caption + candidatos explicitos) |
| Tipos de cuantizacion | No disponible: solo se distribuyen pesos safetensors en el repositorio; no se documentan variantes GGUF, AWQ, GPTQ ni cuantizadas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible para el checkpoint. La percepcion base CLIP es MIT y las anotaciones VSR son CC-BY-4.0, segun la atribucion del autor |
| Formato de pesos | Safetensors |
| Modelo base | `openai/clip-vit-base-patch32`, revision `3d74acf9a28c67741b2f4f2ea7635f0aaf6f0268` |
| Dataset de entrenamiento | `cambridgeltl/vsr_random`, revision `b2053328fafdd018ff56cf1dfa9643caaa4e69b8` |
| Libreria de carga | `tensorcode` |
| Tamano del repositorio | 0,6 GB aproximadamente |
| Fecha de creacion | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

El sistema es un hibrido entre un codificador vision-lenguaje congelado y un modulo cognitivo entrenable. La parte perceptiva inicializa desde CLIP ViT-B/32 y permanece congelada: aporta caracteristicas globales alineadas de imagen y texto, ademas de las representaciones por parche. Sobre esa base, el autor entrena proyecciones de imagen y texto, un Workspace recurrente de slots aprendidos y una cabeza de ranking. La salida no es una etiqueta ni una frase, sino un orden de candidatos textuales acompanado de coordenadas de parches, atencion de enrutado y relaciones entre slots, que el autor describe explicitamente como interpretaciones falibles y no como prueba factual.

El entrenamiento uso las primeras 512 imagenes unicas de la particion `random` de entrenamiento de VSR. Las etiquetas humanas de verdad (supported/unsupported) se convierten en objetivos de candidatos explicitos. La configuracion es: semilla 17, 10 epocas con Adam, tasa de aprendizaje 0,001, limite de norma de gradiente 1 y redimensionado RGB a 224x224. El preprocesado emplea redimensionado bicubico cuadrado explicito y normalizacion de canales de CLIP, en lugar del recorte por defecto que preserva la relacion de aspecto. La evaluacion se hizo sobre 128 imagenes nuevas del split de test oficial, saltando los primeros 64 identificadores elegibles y excluyendo todos los identificadores de entrenamiento; este conjunto es disjunto de las 64 imagenes del experimento previo de inicializacion aleatoria. Segun el autor, ningun ejemplo reservado se uso para ajuste.

## Capacidades

- Ranking de candidatos textuales: dado un par imagen-pregunta (o caption) y una lista explicita de candidatos, devuelve un orden de preferencia entre ellos.
- Clasificacion binaria implicita de afirmaciones espaciales: los candidatos se derivan de etiquetas supported/unsupported del benchmark VSR, por lo que el modelo puede usarse como clasificador de afirmaciones del tipo "el objeto A esta encima del objeto B".
- Salida de trazabilidad: devuelve coordenadas de parches de origen, atencion de enrutado y relaciones entre slots.
- Procesamiento de imagen y texto alineados: hereda del CLIP congelado las caracteristicas globales alineadas de imagen y texto.
- No genera texto libre: no produce respuestas, captions ni explicaciones.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso mas alla de la recurrencia interna del Workspace.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales: ninguna acreditada. No hay modo de razonamiento (thinking), ni vision adicional, ni audio, mas alla del propio pipeline de vision.
- Aviso del autor: no incorpora reglas de verdad sobre objetos ni sobre relaciones espaciales, y la atencion mostrada no constituye prueba factual.

## Casos de uso

- Reproduccion de un resultado negativo: cargar el checkpoint completo en un proceso limpio y verificar que se reproducen las mismas metricas declaradas en `report.json` y `provenance.json`. Es el uso principal que el propio autor sugiere.
- Auditoria metodologica de evaluacion: estudiar un diseno experimental que incluye ablaciones de Workspace cero y de bypass de Workspace, interpretacion de imagenes en blanco y control de solapamiento entre splits, para replicar o criticar el protocolo.
- Docencia sobre sobreajuste y resultados negativos: el contraste entre perdida de entrenamiento (0,46472) y degradacion en test (precision 55,47 % a 50,78 %, entropia cruzada 0,69266 a 4,64355) sirve como caso practico de sobreajuste en conjuntos pequenos.
- Linea base interna para arquitecturas de Workspace: el rendimiento de las ablaciones (Workspace cero y bypass, ambas con 52,34 %) y el de imagen en blanco (53,91 %) permiten comparar futuras iteraciones del mismo espacio de trabajo contra un punto de referencia documentado.
- Pruebas de regresion de la libreria `tensorcode`: el checkpoint permite verificar que `Scene.from_pretrained` sigue cargando pesos, tokenizer y configuracion de preprocesado de forma consistente entre versiones.
- Estudio de atribucion y trazabilidad de atencion: analizar si las coordenadas de parches y las relaciones entre slots tienen correlacion con la respuesta correcta, dado que el autor advierte de que la atencion no es prueba factual.
- Aviso: no se recomienda su uso en atencion al cliente, generacion de codigo, asistentes conversacionales ni ningun flujo de produccion que requiera decisiones fiables, porque la precision medida esta al nivel o por debajo del azar en la tarea objetivo.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card y corresponden a 128 imagenes reservadas del split de test oficial de VSR, no al benchmark VSR completo publicado. Se presentan como resultado negativo.

| Metrica | Valor |
|---|---|
| Precision, modelo completo (128 imagenes reservadas) | 50,78 % |
| Precision, modelo completo antes del ajuste (referencia interna del autor) | 55,47 % |
| Entropia cruzada, modelo completo | 4,64355 |
| Entropia cruzada, modelo completo antes del ajuste (referencia interna del autor) | 0,69266 |
| Precision con imagen en blanco | 53,91 % |
| Precision con Workspace cero (ablacion) | 52,34 % |
| Precision con bypass de Workspace (ablacion) | 52,34 % |
| Perdida media de entrenamiento | 0,46472 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y el modelo no es aplicable a esas tareas por tratarse de un clasificador multimodal de candidatos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp32 y aproximadamente 0,3 GB en fp16, calculado a partir de los 151.388.609 parametros. Con activaciones y buffers el consumo realista se situa en el entorno de 1 a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. No se requiere A100, H100 ni hardware de clase servidor.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo recientes (GTX 1050 Ti o superiores, serie RTX 20/30/40, e incluso en CPU, dado el tamano del modelo).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia. La unica via indicada es la libreria `tensorcode`, mediante `Scene.from_pretrained('./model')` y una llamada `model(inputs)` con pixeles CHW normalizados, pregunta, `source_id` y candidatos explicitos.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de imagenes por segundo.
- Nota: el autor indica que la construccion no descarga nada; `Scene.from_foundation(repo_id, revision=...)` importa explicitamente la percepcion fundacional mientras inicializa un modelo de ranking nuevo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tensorcode-scene-vsr-experimental-001 | 151.388.609 | Imagen 224x224 + pregunta + candidatos explicitos | 50,78 % de precision en 128 imagenes reservadas de VSR | No disponible | HuggingFace, via libreria `tensorcode` |
| openai/clip-vit-base-patch32 (modelo base) | Aproximadamente 151 millones | Imagen 224x224 + texto | No se reporta evaluacion en VSR en la informacion disponible | MIT (segun la atribucion del autor) | HuggingFace, muy extendido |
| Linea base de imagen en blanco (interna al experimento) | No aplica | Imagen constante | 53,91 % de precision en el mismo subconjunto | No aplica | Definida en el propio experimento |
| Ablacion de Workspace (cero y bypass) | 151.388.609 | Imagen + pregunta + candidatos, sin contribucion del Workspace | 52,34 % de precision en ambos casos | No aplica | Definida en el propio experimento |

No se dispone de datos de otros modelos comparables evaluados sobre este mismo subconjunto de 128 imagenes, por lo que no es posible establecer una comparacion externa fiable.

## Limitaciones y advertencias

- Resultado negativo declarado por el autor: el checkpoint no demuestra razonamiento espacial visual util y no debe presentarse como asistente de vision.
- Sobreajuste: la perdida de entrenamiento baja a 0,46472 mientras la precision en test cae del 55,47 % al 50,78 % y la entropia cruzada sube de 0,69266 a 4,64355.
- Rendimiento por debajo de lineas base triviales: las ablaciones de Workspace cero y bypass alcanzan 52,34 % y la imagen en blanco 53,91 %, ambas por encima del modelo completo (50,78 %), lo que sugiere que el Workspace no aporta capacidad discriminativa y podria degradar la senal de la percepcion congelada.
- La atencion y las coordenadas de parches son interpretaciones falibles, no prueba factual, segun el propio autor. El modelo no incluye reglas de verdad sobre objetos ni relaciones espaciales.
- Sesgos conocidos: no se documentan analisis de sesgo. Al derivar de CLIP y de anotaciones VSR sobre fotografias COCO, hereda los sesgos de esas fuentes.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no genera texto; el riesgo equivalente es producir rankings incorrectos o sobreconfiados.
- Limitaciones de contexto e idioma: una sola imagen de 224x224 por llamada, candidatos proporcionados externamente y un unico idioma declarado, el ingles.
- Restricciones de licencia: el checkpoint no declara licencia, por lo que no hay autorizacion explicita de uso comercial. La percepcion CLIP es MIT y las anotaciones VSR son CC-BY-4.0; las fotografias COCO subyacentes conservan los derechos originales de Flickr/COCO y no se incluyen en el repositorio.
- Resultados sobre un subconjunto pequeno (128 imagenes de test, 512 de entrenamiento), no sobre el benchmark VSR completo, por lo que las cifras no son extrapolables al benchmark publicado.
- No hay integracion con servidores de inferencia estandar, lo que complica su despliegue en produccion incluso si el modelo fuese util.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jacob-valdez/tensorcode-scene-vsr-experimental-001
- Modelo base CLIP ViT-B/32: https://huggingface.co/openai/clip-vit-base-patch32
- Dataset VSR (particion random): https://huggingface.co/datasets/cambridgeltl/vsr_random
- Repositorio de VSR en GitHub: https://github.com/cambridgeltl/visual-spatial-reasoning
- Ficheros de resultados y procedencia citados por el autor: `report.json` y `provenance.json` dentro del repositorio del modelo
- Script de entrenamiento citado por el autor: `examples/train_scene.py` en TensorCode
- Nota sobre la busqueda web: los resultados devueltos no contienen enlaces relevantes a este modelo ni a la libreria `tensorcode`; las referencias encontradas corresponden a otros temas sin relacion.
