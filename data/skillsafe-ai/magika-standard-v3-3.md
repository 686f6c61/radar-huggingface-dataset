# skillsafe-ai/magika-standard-v3-3

## Resumen

`skillsafe-ai/magika-standard-v3-3` no es un modelo de lenguaje, sino un artefacto ONNX listo para navegador que empaqueta el modelo de detección de tipo de fichero **Magika standard_v3_3** de Google. El repositorio lo publica SkillSafe mediante un conversor reproducible: el fichero `model.onnx` se importa tal cual desde el commit `3f2cb8537dce123587bfb3535a402145adcba2c7` del repositorio `google/magika`, sin edición manual, y queda fijado por SHA-256. El único fichero del repositorio ocupa 3,02 MB y su hash es `fe2d2eb49c5f88a9e0a6c048e15d6ffdf86235519c2afc535044de433169ec8c`.

El problema que resuelve es la clasificación de tipo de fichero a partir de bytes crudos: recibe un tensor de enteros de 2048 bytes y devuelve 214 salidas (`target_label`), es decir, un vector de puntuaciones sobre 214 clases de tipo de contenido. Frente a los detectores basados en firmas o extensiones, Magika emplea una red neuronal que aprende patrones de bytes, lo que mejora la detección cuando la extensión falta, es incorrecta o el fichero está parcialmente modificado. Su relevancia práctica es doble: por un lado, permite detección local sin enviar contenido a terceros; por otro, al estar en formato ONNX con opset 15, se ejecuta directamente en el navegador con `onnxruntime-web` usando WebGPU o WASM.

Se trata de un artefacto de redistribución, no de un modelo entrenado por SkillSafe. La model card se limita a documentar procedencia, receta de conversión, verificación de hashes y contrato de entrada/salida; no publica información sobre arquitectura interna, número de parámetros, dataset de entrenamiento ni resultados de benchmarks. El repositorio no declara pipeline, idiomas soportados ni métricas de calidad, y registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal sobre bytes exportada a ONNX; topología interna, capas y mecanismo de atención no disponibles |
| Parametros totales | no disponible (el artefacto ONNX ocupa 3,02 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de tamaño fijo: 2048 bytes por inferencia |
| Tipos de cuantizacion | no disponible; el repositorio solo publica `model.onnx`, sin variantes cuantizadas declaradas |
| Idiomas soportados | no disponible; el modelo opera sobre bytes y no sobre texto natural, por lo que la noción de idioma no aplica |
| Licencia | Apache-2.0 (Copyright 2024 Google LLC en el modelo y la base de conocimiento de tipos) |
| Formato de pesos | ONNX, opset 15, fichero único `model.onnx` |
| Entrada | `bytes`, int32, shape `['unk__214', 2048]` |
| Salida | `target_label`, float32, shape `['unk__215', 214]` |
| Numero de clases de salida | 214 |
| Tamano del artefacto | 3,02 MB |
| Tiempo de ejecucion declarado | 5,5 ms en la prueba de humo en CPU con onnxruntime |
| Pipeline declarado | no disponible |
| Tamano del repositorio | 0,0 GB (un solo fichero) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Lo unico documentado es su contrato de ejecucion: una entrada int32 de 2048 bytes y una salida float32 de 214 valores, en un grafo ONNX con opset 15. Se conoce que el peso se importa sin conversion desde el fichero `assets/models/standard_v3_3/model.onnx` del repositorio `google/magika` en el commit `3f2cb8537dce123587bfb3535a402145adcba2c7`, y que ese fichero paso las comprobaciones de `onnx.checker` y una ejecucion de humo en CPU con entradas rellenas de ceros.

No hay informacion en la model card sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se documenta el proceso de entrenamiento original de Magika mas alla de la atribucion a Google LLC y a la licencia Apache-2.0. El valor diferencial del repositorio no es el entrenamiento, sino la reproducibilidad del empaquetado: la receta `recipes/magika-standard-v3-3.yaml` (SHA-256 `6ab250cd7767702b638772ca969ec3889fe270192a7aec3336cab909ccf1a6db`), la cadena de herramientas (Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64) y la verificacion por hash de cada byte, con `manifest.json` registrando receta, fuentes y numeros de verificacion.

## Capacidades

- Deteccion de tipo de fichero a partir de bytes crudos: clasifica la entrada en una de 214 clases de contenido.
- Inferencia local completa: no requiere llamadas de red ni servicios externos una vez descargado el artefacto.
- Ejecucion en navegador mediante `onnxruntime-web` con proveedores de ejecucion `webgpu` y `wasm`.
- Ejecucion en servidor o escritorio mediante cualquier runtime compatible con ONNX opset 15.
- Determinismo y trazabilidad: los pesos estan fijados por SHA-256 a un commit concreto del upstream, lo que permite reproducir exactamente el mismo comportamiento.
- Entrada de tamano fijo de 2048 bytes, adecuada para clasificar la cabecera y el inicio del contenido de un fichero.
- Salida en forma de 214 puntuaciones float32, apta para umbralizar, ordenar o combinar con heuristicas propias.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision semantica: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni modo de razonamiento explicito.
- Aunque procesa bytes de imagenes, audio o video, no los interpreta ni los describe: solo estima su tipo de contenido.

## Casos de uso

- Validacion de subidas en aplicaciones web: ejecutar el modelo en el cliente con `onnxruntime-web` antes de enviar el fichero al servidor, comparando el tipo detectado con el declarado por el navegador y bloqueando envios incoherentes sin coste de red ni de servidor.
- Clasificacion MIME en pipelines de ingesta: asignar un tipo de contenido a ficheros que llegan sin extension o con extension erronea, como paso previo al enrutado hacia el parser o el almacenamiento adecuado.
- Pre-filtrado en analisis de seguridad: determinar el tipo real de un fichero antes de enviarlo a un sandbox o a un motor antivirus, evitando que un ejecutable renombrado como documento evite el analisis correspondiente.
- Organizacion y deduplicacion de repositorios documentales: recorrer grandes volumenes de ficheros heredados y reclasificarlos por tipo real para reconstruir indices de busqueda o planes de migracion.
- Aplicaciones PWA y uso sin conexion: al ser un artefacto de 3,02 MB y ejecutarse con WASM, encaja en aplicaciones que funcionan offline o en entornos con conectividad intermitente.
- Cumplimiento y prevencion de fuga de datos: comprobar en el propio dispositivo que un fichero es del tipo que declara antes de permitir su salida, sin enviar su contenido a un servicio externo.
- Despliegue en edge e IoT: el tamano reducido y la ejecucion en CPU permiten integrarlo en dispositivos con recursos limitados donde no cabe un modelo de lenguaje.
- Herramientas de desarrollo: plugins de editor o extensiones que detecten el tipo de un fichero en disco sin extension para ofrecer resaltado de sintaxis o abrirlo con el visor correcto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye numeros de verificacion de integridad y ejecucion de humo, que no miden calidad de clasificacion y no son comparables con metricas de precision o recall.

| Prueba | Entrada | Salida | Resultado |
|---|---|---|---|
| `onnx.checker` | `model.onnx` | validacion del grafo | superada |
| Ejecucion de humo en CPU (onnxruntime) con entradas de ceros | `bytes[1, 2048]` | `target_label[1, 214]` | 5,5 ms |
| Precision / recall / F1 sobre corpus real | no disponible | no disponible | no disponible |

Advertencia: la cifra de 5,5 ms corresponde a una ejecucion con entradas rellenas de ceros en una maquina concreta y no debe interpretarse como latencia representativa en produccion.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en cualquier configuracion razonable, dado que los pesos ocupan 3,02 MB y el tensor de entrada es de 2048 enteros.
- GPU: no requiere GPU. Cualquier GPU compatible con WebGPU puede usarse como acelerador en el navegador, pero no es un requisito.
- CPU: es el objetivo principal de ejecucion; la model card declara una prueba de humo en CPU con onnxruntime.
- GPU de consumo: cabe en cualquier GPU de consumo, e incluso en GPUs integradas, telefonos y navegadores, gracias al tamano del artefacto.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` con WebGPU o WASM en navegador, y cualquier runtime que soporte ONNX opset 15. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no aplican a este artefacto.
- Latencia y throughput: no disponibles mas alla de los 5,5 ms de la prueba de humo en CPU, no representativa de una carga real.
- Almacenamiento: 3,02 MB para el fichero `model.onnx`; el repositorio completo ocupa 0,0 GB.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este artefacto, por lo que la comparacion se limita a caracteristicas verificables.

| Alternativa | Naturaleza | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `skillsafe-ai/magika-standard-v3-3` (este repositorio) | Red neuronal sobre bytes en ONNX, redistribuida por SkillSafe | no disponible | 2048 bytes | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Magika upstream (`google/magika`, standard_v3_3) | Mismo modelo en su fuente original, con herramienta CLI y libreria | no disponible | 2048 bytes | Apache-2.0 | Repositorio GitHub de Google |
| `file` / libmagic | Deteccion por firmas y heuristicas, sin red neuronal | no aplica | no aplica | no disponible en la informacion proporcionada | Ampliamente distribuido en sistemas operativos |
| Apache Tika | Deteccion por firmas, metadatos y parsers en Java | no aplica | no aplica | Apache-2.0 | Proyecto Apache |

No hay datos publicados que permitan comparar la precision de este artefacto frente a libmagic, Tika u otras alternativas; cualquier afirmacion al respecto requeriria una evaluacion propia sobre un corpus etiquetado.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta codigo y no soporta tool calling ni agentes.
- La model card no documenta arquitectura, parametros, dataset de entrenamiento ni metricas de calidad; la informacion tecnica disponible es minima.
- La entrada esta limitada a 2048 bytes por inferencia, de modo que los ficheros cuyo tipo solo se puede determinar a partir de contenido posterior a esa ventana pueden clasificarse de forma incorrecta.
- La salida cubre 214 clases; los ficheros que no encajen en ninguna de ellas quedaran mal clasificados, con el consiguiente riesgo de falsos positivos y falsos negativos.
- El contenido cifrado, comprimido u ofuscado reduce la senal disponible y puede degradar la deteccion.
- Sesgos conocidos: no disponibles. No se ha publicado ningun analisis de sesgo o de cobertura por tipo de fichero, plataforma o idioma.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de clasificacion erronea con alta confianza aparente, por lo que se recomienda umbralizar y combinar con otras senales.
- La licencia Apache-2.0 permite uso comercial, pero obliga a conservar avisos de copyright y licencia; los pesos siguen siendo Copyright 2024 Google LLC y la receta y model card pertenecen al repositorio de SkillSafe.
- El repositorio registra 0 descargas y 0 likes y no declara pipeline ni idiomas, por lo que no hay evidencia de mantenimiento ni de uso en produccion por parte de terceros.
- La fecha de creacion registrada (2026-09-22) es posterior a la de la mayoria de artefactos consultados; conviene verificar la vigencia del repositorio antes de integrarlo.
- Aunque la procedencia esta fijada por hash, en un entorno de produccion es recomendable verificar manualmente que el SHA-256 de `model.onnx` coincide con el declarado y con el del fichero upstream antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/magika-standard-v3-3
- Fichero de pesos: https://huggingface.co/skillsafe-ai/magika-standard-v3-3/resolve/main/model.onnx
- Fuente upstream del modelo (Google Magika, commit fijado): https://raw.githubusercontent.com/google/magika/3f2cb8537dce123587bfb3535a402145adcba2c7/assets/models/standard_v3_3/model.onnx
- Repositorio de Magika: https://github.com/google/magika
- Licencia Apache-2.0 del upstream: https://github.com/google/magika/blob/3f2cb8537dce123587bfb3535a402145adcba2c7/LICENSE
- Recetas y modelos del conversor de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Receta concreta de conversion: `recipes/magika-standard-v3-3.yaml` (SHA-256 `6ab250cd7767702b638772ca969ec3889fe270192a7aec3336cab909ccf1a6db`), dentro del repositorio de SkillSafe

Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con este modelo (tratan sobre Taiwan) y no aportan informacion adicional utilizable para esta ficha.
