# FluidInference/kev-0.6b-coreml

## Resumen

Kev 0.6B Core ML es una conversion a Core ML de forma fija del modelo Kev 0.6B, un modelo de decision entrenado por Jared Palmer como adaptador LoRA mas una cabeza pointer sobre el backbone Qwen3-0.6B-Base. La conversion la firma FluidInference y fusiona en un unico paquete tanto el backbone Qwen3 como la cabeza entrenada, de modo que en tiempo de ejecucion no se necesita ni el adaptador ni el checkpoint base originales. El resultado son dos artefactos empaquetados en `.mlpackage`: una variante FP16 y otra con pesos comprimidos a 8 bits (W8).

El modelo no es un generador de texto conversacional: es un modelo de decision con forma fija que recibe una pregunta tipada y devuelve una distribucion de probabilidad sobre 32 ranuras de opcion. Cada llamada admite como maximo 128 tokens de entrada y 32 opciones, y solo procesa una pregunta por invocacion; la variante nativa de Kev que empaqueta varias preguntas en un unico forward no esta implementada en esta conversion. Su relevancia radica en que permite ejecutar inferencia de un transformer de 0,6 mil millones de parametros de forma local en dispositivos Apple (iOS 17 / macOS 14 o superior), sin conexion a red y con latencias medidas en el rango de 12 a 23 milisegundos por llamada en un Mac con Apple Silicon.

La licencia es Apache-2.0 para el adaptador, la cabeza y el modelo base Qwen, lo que facilita su integracion en productos comerciales. El repositorio ocupa 1,8 GB e incluye los scripts de conversion, las notas de reproducibilidad, el tokenizador fijado y utilidades de verificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Qwen3-0.6B-Base) con adaptador LoRA y cabeza pointer fusionados; conversion Core ML de forma fija |
| Parametros totales | 0,6 mil millones (aproximado, segun nomenclatura del modelo); cifra exacta no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens por llamada (forma fija del artefacto Core ML); contexto nativo del backbone no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP16 (`kev_0_6b_fp16_L128_options32.mlpackage`, 1.194 MB) y compresion de pesos a 8 bits W8 (`kev_0_6b_w8_L128_options32.mlpackage`, 599 MB) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML `.mlpackage` (FP16 y W8); no se distribuyen safetensors ni GGUF en este repositorio |

Especificaciones de entrada y salida del paquete Core ML:

| Elemento | Forma | Descripcion |
|---|---|---|
| `input_ids` | [1, 128] | Identificadores de token de la pregunta |
| `attention_mask` | [1, 128] | Mascara de atencion |
| `decide_map` | [1, 1, 128] | Mapa de la posicion de decision |
| `option_map` | [1, 32, 128] | Mapa de las 32 ranuras de opcion |
| `logits` (salida) | 32 ranuras | Puntuaciones por opcion; las ranuras ausentes reciben un logit muy negativo |
| `probabilities` (salida) | 32 ranuras | Distribucion de probabilidad sobre las opciones |

## Arquitectura y entrenamiento

El artefacto es una conversion a Core ML de un modelo ya entrenado: el adaptador LoRA y la cabeza pointer de Kev 0.6B fusionados con el backbone Qwen3-0.6B-Base. El exportador explicito en PyTorch reprodujo el modelo Kev entrenado con una discrepancia maxima de `9,54e-7` en los logits sobre el fixture de exportacion, segun la validacion declarada por el autor de la conversion. Los paquetes resultantes son de forma fija: 128 tokens de entrada y 32 ranuras de opcion, con una unica pregunta por llamada. La cabeza pointer convierte la representacion del backbone en una distribucion sobre esas 32 ranuras, y las ranuras que no forman parte de la peticion se enmascaran con un logit muy negativo.

El model card no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos, ni si se emplearon tecnicas de RLHF o DPO; esa informacion se corresponde con el modelo base `jaredpalmer/kev-0.6b` y no se reproduce en este repositorio. Tampoco se documenta el mecanismo nativo de Kev para empaquetar varias preguntas en un unico forward, que esta conversion no implementa. Los scripts exactos de conversion, las revisiones de origen y los hashes SHA256 de los pesos entrenados estan en `source/assets.lock.json`, y el ejemplo de verificacion extremo a extremo en Python en `source/verify.py`. La codificacion de entrada debe realizarse con el tokenizador fijado incluido en la carpeta `tokenizer/` y con el `preprocessing.py` de `source/`.

## Capacidades

- Decision sobre opciones tipadas: devuelve logits y probabilidades sobre un maximo de 32 ranuras de opcion para una pregunta por llamada.
- Tipos de pregunta validados en las pruebas locales: Choice, Noul y Score (3 tipos cubiertos en la validacion de 4 peticiones locales).
- Salida probabilistica calibrada a nivel de ranura: permite umbralizar o rankear opciones en lugar de seleccionar solo la mejor.
- Enmascaramiento de opciones ausentes: las ranuras no presentes en la peticion reciben un logit muy negativo, lo que evita que sean seleccionadas.
- Ejecucion 100 por cien local en dispositivos Apple: paquetes dirigidos a iOS 17 / macOS 14 o superior, con posibilidad de usar la Neural Engine.
- Compatibilidad con el tokenizador original de Qwen3 fijado en el repositorio, lo que preserva la tokenizacion del modelo entrenado.
- No soporta tool calling ni function calling: no hay evidencia de ello en la informacion disponible.
- No soporta agentes ni razonamiento multi-paso en esta conversion: cada llamada resuelve una unica pregunta de decision.
- No implementa el forward nativo de Kev que empaqueta varias preguntas en una sola invocacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Clasificacion y enrutado en aplicaciones iOS: dada una consulta de usuario de hasta 128 tokens, el modelo devuelve la probabilidad de cada una de hasta 32 rutas o intenciones, lo que permite decidir a que flujo local derivar la peticion sin salir del dispositivo.
- Preguntas de opcion multiple con puntuacion de confianza: en cuestionarios o evaluaciones automaticas, se envian el enunciado y las opciones como `option_map` y se usa la distribucion de salida para seleccionar o rankear respuestas, con la probabilidad como medida de confianza.
- Puntuacion de candidatos en ranking ligero: el tipo de pregunta Score de la validacion encaja con tareas de puntuar alternativas (respuestas, titulares, productos) usando el logit o la probabilidad de cada ranura como score comparable.
- Filtros de seguridad y moderacion en el propio dispositivo: el modelo puede actuar como clasificador binario o de pocas clases sobre texto corto (por ejemplo, permitir o bloquear una entrada), manteniendo el contenido sensible en local y con latencias de aproximadamente 12 a 23 ms por llamada.
- Etiquetado y anotacion asistida sin conexion: en aplicaciones de campo o entornos sin red, un iPhone o un Mac puede asignar etiquetas de un conjunto predefinido de hasta 32 categorias sobre fragmentos cortos de texto.
- Control de interfaz por intencion en apps nativas: mapear una frase corta del usuario a una accion de la aplicacion (por ejemplo, una de 32 acciones predefinidas) usando la salida probabilistica para desambiguar entre acciones cercanas.
- Preprocesado de decisiones antes de un modelo mayor: usar este artefacto como etapa de filtrado local (decidir si merece la pena invocar un modelo mas grande en servidor) aprovechando su tamano reducido y su ejecucion en la Neural Engine.
- Prototipado rapido en macOS: gracias a `source/verify.py` y a los paquetes ya fusionados, se puede evaluar el modelo de decision en un Mac con Apple Silicon sin reconstruir el adaptador ni el backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. En concreto, no hay datos de MMLU, HumanEval, GSM8K ni de otros conjuntos estandar para este artefacto.

Los unicos datos de rendimiento declarados son de validacion de la conversion y de latencia, no de calidad en benchmarks:

| Metrica | FP16 | W8 |
|---|---|---|
| Tamano del paquete | 1.194 MB | 599 MB |
| Diferencia maxima de probabilidad frente al modelo entrenado | 0,002031 | 0,008554 |
| Mediana de latencia de llamada corta con `CPU_AND_NE` en un Mac con Apple Silicon | 13,10-15,35 ms | 12,27-23,15 ms |
| Coincidencia de respuesta con el modelo entrenado en peticiones locales | 4/4 (cubriendo Choice, Noul y Score) | 4/4 (cubriendo Choice, Noul y Score) |

Notas del autor sobre estas cifras: la comparacion de velocidad entre FP16 y W8 se invirtio entre dos ejecuciones muy pequenas, por lo que no se emite ninguna afirmacion de velocidad a nivel de variante. El ajuste de computo permite el uso de la Neural Engine, pero no se establece residencia completa en la ANE. Estas comprobaciones no constituyen el Jev Decision Index ni un benchmark de 2048, y la puntuacion 31,30 del tracker se midio en una pila de servicio distinta.

## Requisitos de hardware

- Plataforma objetivo: exclusivamente Apple. Los paquetes requieren iOS 17 / macOS 14 o superior y estan pensados para Apple Silicon.
- VRAM / memoria estimada: el paquete FP16 ocupa 1.194 MB y el W8 599 MB en disco; el consumo en ejecucion no se detalla en la informacion disponible.
- GPU compatibles: se documenta el ajuste de computo `CPU_AND_NE` (CPU y Neural Engine) en un Mac con Apple Silicon. No se mencionan GPU NVIDIA (A100, H100, RTX 4090) ni CUDA, y el formato Core ML no es compatible con ellas.
- Compatibilidad con GPU de consumo: si, en el sentido de que esta disenado para hardware Apple de consumo (Mac con Apple Silicon y dispositivos iOS compatibles con iOS 17). No hay datos publicados de rendimiento por modelo concreto de chip.
- Opciones de despliegue: carga directa del `.mlpackage` con Core ML y descarga del repositorio mediante `snapshot_download("FluidInference/kev-0.6b-coreml")`. No se contemplan vLLM, llama.cpp, Ollama ni TGI, dado que el formato de pesos es Core ML.
- Latencia: medianas de 13,10-15,35 ms para FP16 y 12,27-23,15 ms para W8 en llamadas cortas con `CPU_AND_NE` en un Mac con Apple Silicon, medidas sobre dos ejecuciones muy pequenas.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos de decision con cabeza pointer convertidos a Core ML que sean directamente comparables, por lo que varios campos quedan como no disponibles.

| Modelo | Parametros | Contexto / forma | Formato y plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kev-0.6b-coreml (FP16 / W8) | 0,6 mil millones aprox. | 128 tokens, 32 opciones, una pregunta por llamada | Core ML, Apple Silicon (iOS 17 / macOS 14+) | Apache-2.0 | Publicado en HuggingFace por FluidInference |
| Kev 0.6B (`jaredpalmer/kev-0.6b`) | 0,6 mil millones aprox. | Incluye forward nativo empaquetado de varias preguntas | Pesos del adaptador y cabeza; plataforma no detallada | Apache-2.0 | Publicado en HuggingFace por Jared Palmer |
| Qwen3-0.6B-Base (`Qwen/Qwen3-0.6B-Base`) | 0,6 mil millones aprox. | No disponible en la informacion proporcionada | Pesos del modelo base; plataforma no detallada | Apache-2.0 | Publicado en HuggingFace por el equipo Qwen |

## Limitaciones y advertencias

- No es un modelo generativo en esta conversion: produce una distribucion sobre ranuras de opcion, no texto libre. Usarlo como chatbot daria resultados incorrectos.
- Limite duro de 128 tokens por llamada. El estado puede acortarse para encajar en L128 y las peticiones con una pregunta demasiado larga fallan de forma explicita.
- Maximo de 32 ranuras de opcion por llamada; las opciones ausentes se enmascaran con un logit muy negativo.
- Una sola pregunta por llamada: no implementa el forward nativo de Kev que empaqueta varias preguntas en una unica invocacion, por lo que hay que trocear los lotes en el lado de la aplicacion.
- Dependencia estricta del preprocesado: hay que usar el tokenizador fijado y el `preprocessing.py` incluidos; una tokenizacion distinta invalida las garantias de la validacion.
- Diferencias numericas respecto al modelo original: la variante W8 presenta una diferencia maxima de probabilidad de 0,008554 y FP16 de 0,002031, lo que puede alterar decisiones en casos muy ajustados.
- Sin benchmarks publicados: no hay evidencia de calidad en MMLU, HumanEval, GSM8K ni en el Jev Decision Index para este artefacto. La puntuacion 31,30 citada corresponde a una pila de servicio distinta y no es aplicable a estos paquetes.
- Sin datos de sesgos: la informacion disponible no documenta evaluaciones de sesgo ni de robustez.
- Sin datos de idiomas: no se especifica que lenguas soporta el artefacto ni si el ajuste conserva el multilingüismo del backbone.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al tratarse de una tarea de seleccion entre opciones, el modo de fallo esperable es una eleccion incorrecta o una confianza mal calibrada, no una fabricacion de contenido.
- Latencia y velocidad condicionadas al dispositivo: las mediciones provienen de un unico Mac con Apple Silicon y de dos ejecuciones muy pequenas; el orden de velocidad entre FP16 y W8 se invirtio entre ejecuciones, por lo que no debe asumirse una ventaja de rendimiento de una variante sobre la otra.
- Residencia en la Neural Engine no garantizada: el ajuste de computo permite el uso de la ANE, pero no se establece residencia completa.
- Licencia: Apache-2.0 para el adaptador, la cabeza y el modelo base Qwen, lo que permite uso comercial. Conviene verificar las condiciones de los repositorios upstream al redistribuir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/kev-0.6b-coreml
- Modelo base entrenado (Kev 0.6B, Jared Palmer): https://huggingface.co/jaredpalmer/kev-0.6b
- Modelo base de Qwen3: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Script de verificacion incluido en el repositorio: `source/verify.py`
- Revisiones de origen y hashes SHA256 de los pesos entrenados: `source/assets.lock.json`
- Notas de reproducibilidad y scripts de conversion: carpeta `source/` del repositorio
- Tokenizador fijado: carpeta `tokenizer/` del repositorio
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre este modelo (los resultados devueltos tratan sobre colas de impresion en Windows y no guardan relacion).
