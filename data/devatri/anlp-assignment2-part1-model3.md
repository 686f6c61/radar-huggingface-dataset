# Devatri/anlp-assignment2-part1-model3

## Resumen

El modelo `Devatri/anlp-assignment2-part1-model3` es un transformer decoder-only desarrollado por el usuario Devatri en el marco de una asignatura de procesamiento de lenguaje natural (ANLP, asignatura 2, parte 1). Su unica funcion documentada es la traduccion automatica de vietnamita y japones hacia ingles, entrenado sobre el corpus `belumind/en-vi-ja-curated-500k-triplets`. No se trata de un modelo de proposito general ni de un lanzamiento de produccion: es un artefacto academico sin model card completa, sin pipeline declarado y con cero descargas y cero likes en el momento de la consulta.

El repositorio ocupa aproximadamente 0,1 GB y contiene un unico fichero `checkpoint.pt` que empaqueta cuatro elementos: el objeto `config`, el `state_dict` del modelo, un resumen (`summary`) y un `tokenizer_sha256` que actua como huella de integridad del tokenizador. El autor indica que la carga requiere las definiciones de las clases `Config` y `Transformer` incluidas en `implementation.ipynb`, es decir, no existe una configuracion estandar de HuggingFace (`config.json`) ni pesos en formato `safetensors`.

La relevancia de esta ficha es limitada pero concreta: sirve como referencia para quien quiera reproducir o auditar el ejercicio, como baseline minimo en tareas de traduccion vi/ja a en y como ejemplo de publicacion de pesos sin documentacion asociada. No hay datos publicados de parametros, longitud de contexto, licencia ni evaluacion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (segun la model card) |
| Parametros totales | no disponible (el repositorio ocupa 0,1 GB, lo que sugiere un modelo pequeno) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | vietnamita y japones como origen; ingles como destino (unico par documentado) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de PyTorch en un unico fichero `checkpoint.pt` con `state_dict` embebido; no incluye `safetensors` ni `config.json` de HuggingFace |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | no disponible |
| Huella del checkpoint | sha256 `0e5b502a80268e1f3c31744e2179429d8d505877393ef69d9bdaf417f2e08d7c` |

## Arquitectura y entrenamiento

La model card describe un transformer de tipo decoder-only, una eleccion atipica para traduccion, donde lo habitual en modelos pequenos es la arquitectura encoder-decoder. Un decoder-only puede abordar la traduccion condicionando la generacion del texto destino a una secuencia fuente dentro del mismo flujo autoregresivo, lo que simplifica el codigo y permite reutilizar el mismo bloque para tareas de continuacion de texto. No se documenta el numero de capas, la dimension del modelo, el numero de cabezas de atencion, el tipo de normalizacion, la funcion de activacion ni si se emplean embeddings posicionales aprendidos o rotatorios.

En cuanto a los datos, la unica referencia es el corpus `belumind/en-vi-ja-curated-500k-triplets`, que por su nombre contiene aproximadamente 500.000 tripletas en ingles, vietnamita y japones. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset, si hubo filtrado de calidad, deduplicacion, temperatura de muestreo, uso de decodificacion especulativa ni proceso de alineacion posterior (RLHF, DPO o similar). La presencia de un campo `tokenizer_sha256` indica que el tokenizador se guarda o se reconstruye aparte, pero no se publica su vocabulario ni su algoritmo de segmentacion.

## Capacidades

- Traduccion de vietnamita a ingles y de japones a ingles, segun la unica funcion declarada por el autor.
- Generacion de texto autoregresiva propia de una arquitectura decoder-only, aunque no se documenta su uso fuera de la traduccion.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de soporte de agentes, razonamiento multi-paso ni modos de pensamiento explicito.
- No hay evidencia de capacidades de vision, audio ni multimodalidad.
- No se documenta soporte multilingue adicional mas alla del par vi/ja hacia en.
- No se documentan capacidades de generacion de codigo, matematicas ni instrucciones generales.
- La carga del modelo exige codigo propio (`implementation.ipynb`), por lo que la integracion con librerias estandar no esta garantizada.

## Casos de uso

- Traduccion de documentacion tecnica japonesa a ingles: el modelo puede emplearse para preprocesar manuales de producto o documentacion de APIs escritos en japones antes de su publicacion en ingles, siempre que se valide la calidad con una muestra revisada por humanos.
- Localizacion de soporte al cliente: los tickets y correos entrantes en vietnamita o japones pueden pasarse por el modelo para que un equipo de habla inglesa los triaje sin depender de traductores externos.
- Analisis de resenas de comercio electronico: traduccion masiva de resenas en japones y vietnamita a ingles para alimentar modelos de analisis de sentimiento o paneles de opinion de producto.
- Generacion de datos paralelos para entrenamiento: uso del modelo para crear corpus sinteticos vi-en y ja-en que despues se filtren y se empleen en el entrenamiento de modelos mayores.
- Subtitulado y transcripcion: traduccion de transcripciones automaticas de contenido audiovisual japones o vietnamita al ingles como paso previo a la revision editorial.
- Baseline academico: servir como punto de comparacion reproducible en un trabajo de investigacion sobre traduccion automatica de bajo recurso, gracias a la huella sha256 publicada del checkpoint.
- Prototipado de investigacion: dado su tamano reducido, permite ejecutar experimentos de fine-tuning sobre dominios concretos (legal, medico, videojuegos) en hardware modesto.
- Ensenanza: util como ejemplo didactico de como empaquetar un `state_dict` personalizado junto con sus definiciones de clase, en contraste con el formato estandar de HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay valores de BLEU, chrF, COMET, MMLU, HumanEval ni GSM8K, ni tampoco comparaciones frente a otros sistemas de traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 0,1 GB, por lo que el checkpoint completo cabe holgadamente en cualquier GPU de consumo moderna; la VRAM necesaria en ejecucion depende de la longitud de contexto y del tamano real del modelo, ambos no documentados.
- GPU recomendadas: con un artefacto de este tamano, cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente; no hay requisitos publicados.
- Cabe en GPU de consumo: si, con alta probabilidad dada la huella de 0,1 GB, aunque no esta confirmado por el autor.
- Opciones de despliegue: no hay soporte directo documentado para vLLM, llama.cpp, Ollama, TGI ni transformers, ya que el modelo se distribuye como `checkpoint.pt` con clases propias. El despliegue requiere cargar el `state_dict` con las definiciones de `implementation.ipynb` o convertir previamente los pesos a un formato compatible con HuggingFace.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los siguientes terminos de comparacion son referencias generales del ecosistema y no proceden de la informacion proporcionada en esta consulta; los valores son aproximados y deben verificarse en las fichas oficiales.

| Modelo | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Devatri/anlp-assignment2-part1-model3 | no disponible (repo de 0,1 GB) | vi, ja a en | no disponible | solo `checkpoint.pt` con codigo propio |
| Helsinki-NLP/opus-mt-ja-en | del orden de decenas de millones (Marian) | ja a en | CC-BY-4.0 | transformers, safetensors |
| Helsinki-NLP/opus-mt-vi-en | del orden de decenas de millones (Marian) | vi a en | CC-BY-4.0 | transformers, safetensors |
| facebook/nllb-200-distilled-600M | 600 millones | multilingue, incluye vi y ja | CC-BY-NC-4.0 (no comercial) | transformers, safetensors |

No se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial no esta autorizado de forma explicita y presenta riesgo legal.
- No hay resultados de evaluacion publicados: se desconoce la calidad real de las traducciones.
- Al ser un modelo pequeno, es esperable una tasa elevada de alucinacion, omisiones y errores de terminologia, especialmente en textos largos o especializados; esta expectativa no esta confirmada por datos.
- La longitud de contexto es desconocida, de modo que no se puede garantizar el comportamiento con documentos extensos ni con conversaciones multi-turno.
- Solo se documenta la direccion vi/ja hacia en; no hay evidencia de traduccion inversa ni de otros pares linguisticos.
- No se documenta la composicion del dataset de entrenamiento, por lo que no se pueden evaluar sesgos de dominio, genero, nacionalidad o registro.
- Los pesos estan en un `checkpoint.pt` con clases propias, lo que rompe la interoperabilidad con el ecosistema estandar y complica el despliegue en produccion.
- El `tokenizer_sha256` solo certifica la integridad del tokenizador, no que el tokenizador este incluido en el repositorio; podria requerir reconstruirlo desde el cuaderno.
- El repositorio tiene cero descargas y cero likes, por lo que no existe validacion por parte de la comunidad.
- No se especifica el hardware ni el tiempo de entrenamiento, lo que impide reproducir el proceso a partir de la informacion publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Devatri/anlp-assignment2-part1-model3
- Dataset de entrenamiento citado: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Cuaderno de implementacion: `implementation.ipynb` (incluido en el repositorio del modelo)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
