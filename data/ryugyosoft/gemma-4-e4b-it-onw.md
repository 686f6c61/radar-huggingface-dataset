# ryugyosoft/gemma-4-E4B-it-onw

## Resumen

ryugyosoft/gemma-4-E4B-it-onw es un empaquetado del modelo multimodal google/gemma-4-E4B-it (texto e imagen) para onw, un motor de inferencia que ejecuta modelos de lenguaje integramente en la NPU de Intel. No es un modelo entrenado desde cero ni un fine-tuning: los pesos del modelo base se recuantizan y reestructuran en grafos estaticos de OpenVINO para que el decodificador, la cabeza LM y el codificador de vision se ejecuten en la NPU, sin GPU dedicada.

El objetivo es llevar un modelo multimodal de la familia Gemma 4 a portatiles con Intel Core Ultra, con un consumo de memoria en torno a 6-8 GB y una velocidad de decodificacion de 6,7-6,8 tok/s medida en una NPU 3720. El repositorio ocupa 5,7 GB y combina pesos INT8 en el token embedding (compartido con la cabeza LM) con una tabla de embedding por capa de 2,7 GB que se consulta en el host.

Su relevancia es doble: demuestra que la inferencia multimodal completa, vision incluida, puede residir en una NPU integrada, y a la vez define un formato propietario ligado al motor onw, lo que limita su portabilidad. Publicado el 24 de septiembre de 2026, no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (texto + imagen) empaquetado como grafos estaticos de OpenVINO; atencion con head_dim 512 dividida en cabezas de 256 |
| Parametros totales | no disponible (la nomenclatura E4B del modelo base sugiere parametros efectivos del orden de 4B, sin confirmacion en la informacion proporcionada) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 en token embedding y cabeza LM; cuantizacion del decodificador no especificada |
| Idiomas soportados | ingles (en) y japones (ja) |
| Licencia | Apache 2.0, heredada del modelo base segun la model card |
| Formato de pesos | OpenVINO IR (archivos .xml de grafos estaticos) mas shared.bin; no se distribuye en safetensors ni GGUF |
| Tarea (pipeline) | image-text-to-text, conversacional |
| Modelo base | google/gemma-4-E4B-it |
| Motor de ejecucion | onw (requiere el repositorio ryugyosoft/onw) |
| Tamano del repositorio | 5,7 GB |
| Bloques de tokens soportados | 1, 16 y 64 tokens |
| Tokens de vision | 280 soft tokens (codificador de vision estatico) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no documenta ningun proceso de entrenamiento: el autor describe el repositorio como una recuantizacion y reestructuracion de los pesos de google/gemma-4-E4B-it, por lo que no hay informacion sobre numero de tokens de entrenamiento, composicion del dataset, RLHF ni DPO. Lo que si se detalla es la reorganizacion de la arquitectura para la NPU: el decodificador estatico de Gemma 4 se divide en tres variantes segun el tamano de bloque (1, 16 y 64 tokens), la atencion con head_dim 512 se parte en cabezas de 256 anchos y las mascaras se construyen en el host. La cabeza LM, con logit softcapping, se sirve como un unico peso INT8 compartido para todos los tamanos de bloque, y el codificador de vision es un grafo estatico que produce 280 soft tokens.

La innovacion principal respecto al repositorio standalone ryugyosoft/gemma-4-E4B-it-npu es el traslado al host de dos componentes que son lecturas de tabla: el token embedding y la tabla de embedding por capa (2,7 GB), lo que elimina el proceso worker de NPU independiente. El motor onw aporta ademas prompt lookup decoding y reutilizacion de prefijo, y el token embedding esta atado (tied) a la cabeza LM. Para evitar descargas corruptas, el autor recomienda usar hf download en lugar de git clone sin Git LFS, ya que este ultimo descarga archivos puntero que onw detecta y reporta.

## Capacidades

- Generacion de texto conversacional en ingles y japones.
- Comprension de imagen y texto combinados (image-text-to-text): la NPU ejecuta el codificador de vision y responde a preguntas sobre la imagen.
- Conversacion multi-turno con imagenes: en el segundo turno solo se procesan los tokens nuevos, gracias a la reutilizacion de prefijo del motor (se cita una mejora de 1,7 s frente a 4,8 s en una conversacion con imagen).
- Procesamiento por bloques de 1, 16 y 64 tokens, con prompt lookup decoding activado para acelerar la decodificacion.
- No hay informacion publicada sobre soporte de tool calling o function calling.
- No hay informacion publicada sobre modo de razonamiento explicito (thinking mode).
- No hay informacion publicada sobre capacidades de audio.
- No hay informacion publicada sobre soporte de agentes o razonamiento multi-paso.

## Casos de uso

- Asistente multimodal local en portatiles sin GPU dedicada: al ejecutarse integramente en la NPU Intel, permite responder preguntas sobre imagenes sin conexion a la nube ni tarjeta grafica, con un consumo de unos 6-8 GB de memoria del sistema.
- Analisis de documentos escaneados: el modelo puede recibir la imagen de una factura o formulario y responder preguntas sobre su contenido; los 280 soft tokens del codificador de vision fijan el coste de la fase de vision (1,9 s medidos) y el prefill de 284 tokens se resuelve en 2,0 s con bloques de 64 tokens.
- Soporte tecnico guiado por capturas de pantalla: el usuario envia una captura y el modelo mantiene una conversacion multi-turno sobre ella; la reutilizacion de prefijo evita reprocesar la imagen en cada turno.
- Descripcion de imagenes para accesibilidad en equipos de usuario final: el modelo cabe en un portatil con Core Ultra y puede generar descripciones en ingles o japones sin enviar la imagen a un servicio externo.
- Procesamiento de datos con requisitos de privacidad: al residir todo el calculo en el dispositivo, es apto para entornos donde las imagenes no pueden salir del puesto de trabajo, como documentacion medica o legal interna.
- Clasificacion y revision visual en linea de produccion: integrado en un puesto de inspeccion con NPU, el modelo puede etiquetar o describir capturas de piezas y derivar los casos dudosos a revision humana.
- Prototipado de asistentes conversacionales en japones: es una de las pocas opciones documentadas que ejecuta un modelo de la familia Gemma 4 en NPU con idioma japones, util para validar flujos de atencion al cliente antes de escalar a infraestructura con GPU.
- Demostraciones de inferencia edge multimodal: sirve como banco de pruebas para medir latencia de vision (1,9 s) y prefill (2,0 s) en hardware de consumo, con vistas a decidir si conviene migrar a un servidor con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente incluye mediciones de latencia y throughput en hardware concreto, que se recogen en la tabla siguiente y no constituyen una evaluacion de calidad del modelo.

| Medicion (NPU 3720, Core Ultra 9 285HX) | Valor |
|---|---|
| Decodificacion | 6,7-6,8 tok/s con prompt lookup decoding activado |
| Imagen + pregunta (284 tokens) | vision 1,9 s + prefill 2,0 s, con bloques de 64 tokens y >= 24 GB de RAM |
| Segundo turno de un chat con imagen | 1,7 s frente a 4,8 s (solo se procesan los tokens nuevos) |
| Memoria | ~8 GB con bloque de 64 tokens; ~6 GB sin el |
| Tabla de embedding por capa | 2,7 GB, consultada en el host |

## Requisitos de hardware

- Acelerador obligatorio: NPU Intel. La unica configuracion validada en la informacion disponible es la NPU 3720 de un Intel Core Ultra 9 285HX.
- No hay VRAM dedicada implicada: el modelo consume memoria del sistema compartida con la NPU, estimada en unos 6 GB sin el bloque de 64 tokens y unos 8 GB con el.
- RAM del sistema: se indican >= 24 GB de RAM para trabajar con bloques de 64 tokens.
- GPU: no se documenta soporte para A100, H100, RTX 4090 ni ninguna GPU de NVIDIA o AMD.
- CPU generica: no se documenta ejecucion en CPU.
- Equipos de consumo: si, en portatiles con Intel Core Ultra que incorporen NPU compatible; no en equipos sin NPU Intel.
- Despliegue: exclusivamente mediante el motor onw, descargando el modelo con hf download o dejando que onw lo recupere; se ofrecen scripts start.bat (Windows) y start.sh (Ubuntu).
- Frameworks no soportados segun la informacion disponible: vLLM, llama.cpp, Ollama y TGI, al no distribuirse en safetensors, GGUF u ONNX.
- Latencia y throughput: 6,7-6,8 tok/s de decodificacion; 1,9 s de codificacion de vision y 2,0 s de prefill para 284 tokens; 1,7 s en el segundo turno de una conversacion con imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ryugyosoft/gemma-4-E4B-it-onw | no disponible (base E4B) | no disponible | OpenVINO IR (.xml) + shared.bin, INT8 parcial | NPU Intel (validado en NPU 3720) | Apache 2.0 | Repositorio de 5,7 GB, 0 descargas |
| ryugyosoft/gemma-4-E4B-it-npu | no disponible (base E4B) | no disponible | Grafos NPU equivalentes, ejecucion standalone | NPU Intel | Apache 2.0 | Mismo autor; usa el mismo conjunto de grafos NPU |
| google/gemma-4-E4B-it (modelo base) | no disponible (nomenclatura E4B) | no disponible | Pesos originales del modelo base; sin recuantizar, segun la informacion disponible | No especificado para NPU | Apache 2.0 segun la model card de este repositorio | Modelo de referencia de Google en HuggingFace |

No se dispone de datos de benchmarks ni de contexto que permitan comparar el rendimiento con alternativas de otros autores de la misma categoria.

## Limitaciones y advertencias

- Modelo derivado, no entrenado: no se publican datos de dataset, tokens de entrenamiento ni fases de RLHF o DPO, y tampoco evaluaciones de calidad.
- Cuantizacion INT8 del token embedding y de la cabeza LM, junto con la reestructuracion de los grafos, puede degradar la calidad respecto a google/gemma-4-E4B-it; no hay comparativas publicadas.
- Formato propietario ligado al motor onw: al no distribuirse en safetensors, GGUF u ONNX, no es compatible con vLLM, llama.cpp, Ollama o TGI, lo que complica su integracion en pipelines existentes.
- Dependencia de hardware muy concreta: requiere una NPU Intel y solo se documenta una medicion en NPU 3720 (Core Ultra 9 285HX); no se garantiza el funcionamiento en otras generaciones.
- Requisito de memoria elevado para un portatil: >= 24 GB de RAM para el bloque de 64 tokens.
- Longitud de contexto no especificada: es un riesgo directo para planificar produccion con conversaciones largas o documentos extensos.
- Cobertura de idiomas limitada a ingles y japones; no se declara soporte de castellano.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones publicadas, y en tareas de lectura de documentos o imagenes el riesgo es especialmente relevante.
- Adopcion nula en el momento de la ficha (0 descargas y 0 likes), por lo que no existe validacion independiente ni comunidad que reporte fallos.
- Restricciones de licencia: la model card declara Apache 2.0 heredada del modelo base, pero conviene verificar los terminos aplicables al modelo original de Google antes de un uso comercial.
- Detalle operativo: un git clone sin Git LFS descarga archivos puntero en lugar de los pesos; hay que usar hf download o dejar que onw recupere el modelo.
- Mantenimiento incierto: el repositorio depende de un motor externo mantenido por el mismo autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryugyosoft/gemma-4-E4B-it-onw
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio del motor onw: https://huggingface.co/ryugyosoft/onw
- Version standalone para NPU: https://huggingface.co/ryugyosoft/gemma-4-E4B-it-npu
- Papers, blogs, repositorios adicionales o demos: no disponibles. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces recuperados corresponden a contenidos no relacionados (foros y guias de otros temas).
