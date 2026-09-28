# loom-ai-org/pocket-tts-loom

## Resumen

Pocket TTS (English) es un modelo de conversion de texto a voz (TTS) de unos 101 millones de parametros desarrollado por Kyutai y empaquetado por loom-ai-org para el runtime loom.cpp. Se trata de un modelo de lenguaje de flujo (flow language model) que opera sobre los latentes del codec Mimi, es decir, no genera waveform directamente, sino que predice representaciones del codec que despues se decodifican a audio. Su rasgo mas distintivo es que codifica el texto por si mismo: no necesita fonemizador externo ni pipeline de normalizacion, y trae una voz integrada.

La relevancia de esta publicacion es de empaquetado mas que de investigacion: los pesos son los de `kyutai/pocket-tts` sin modificar, reexportados a un unico fichero GGUF autodescriptivo que contiene sus propias topologias de grafo, el tokenizador y el script controlador. Esto permite ejecutarlo desde Python con la libreria `loom-py-rt` sin depender del stack original. El repositorio incluye ademas 25 voces adicionales como ficheros de voz independientes, cada uno con su propia licencia de grabacion.

Con 101 millones de parametros y salida a 24 kHz, el modelo esta pensado para sintesis de voz ligera en ingles, apta para ejecucion en CPU o GPUs de consumo. Su principal limitacion es el idioma: solo ingles, ya que Kyutai publica otros idiomas como checkpoints separados que no estan incluidos en este fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de flujo (flow language model) sobre latentes del codec Mimi |
| Parametros totales | 101.279.243 (~101 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (segmentacion interna en fragmentos de hasta 50 tokens) |
| Tipos de cuantizacion | no disponible (se distribuye como GGUF; no se detallan variantes de cuantizacion) |
| Idiomas soportados | ingles (`en`) unicamente |
| Licencia | cc-by-4.0 (heredada del modelo base); las licencias de cada voz son las de su grabacion |
| Formato de pesos | GGUF (un unico fichero `pocket-tts.gguf`; las voces van como `voices/*.gguf`) |
| Frecuencia de muestreo de salida | 24.000 Hz (se pasa explicitamente a la API; el checkpoint puede no declararla) |
| Voces incluidas | 26 en total: `alba` integrada en el fichero + 25 ficheros de voz en `voices/` |
| Temperatura de muestreo por defecto | 0,3 (muestreo activado; se puede fijar `seed` para reproducibilidad) |
| Tamano del repositorio | 0,6 GB |
| Libreria de ejecucion | loom-py-rt (runtime loom.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla el proceso de entrenamiento, el volumen de datos ni la composicion del dataset. Lo que si se especifica es la arquitectura de inferencia: un modelo de lenguaje de flujo con unos 100 millones de parametros que opera sobre latentes del codec Mimi. Esto implica una cascada en dos etapas: el modelo predice latentes del codec a partir del texto y un decodificador Mimi los convierte en waveform a 24 kHz. El modelo incorpora su propio codificador de texto, de modo que la entrada se tokeniza directamente sin fonemizador.

El empaquetado para loom.cpp es la aportacion tecnica de este repositorio. El GGUF resultante es autodescriptivo: incluye las topologias de grafo, el tokenizador si procede y el script controlador (`model.driver_source` lo imprime, con un comentario de cabecera que documenta cada argumento aceptado). Sobre el, `loom-py` expone una puerta de alto nivel por tarea (`model.text2speech.infer(...)`) que aplica ya el ventaneo, el muestreo y el ensamblado que el modelo necesita, mientras que `model.infer(...)` pasa los argumentos directamente al driver embebido. La exportacion la realiza `loom-exporter`, y los pesos se declaran sin modificar respecto al modelo base. La verificacion contra la implementacion de referencia, con las extracciones aleatorias fijadas, da una desviacion de 1,8e-06 rms respecto a la forma de onda de referencia, paso a paso.

Las voces se almacenan como el propio estado de atencion del modelo tras escuchar al hablante, sellado con una huella de estos pesos concretos. Por eso un fichero de voz solo es valido para esta release: loom rechaza uno generado para otra version en lugar de producir audio defectuoso. La clonacion a partir de una grabacion requiere el codificador Mimi, que esta exportacion no incluye.

## Capacidades

- Sintesis de voz en ingles a partir de texto, con salida de audio a 24 kHz.
- Codificacion de texto integrada: no requiere fonemizador ni normalizador externo.
- Voz integrada por defecto (`alba`) y seleccion de voz mediante el argumento `voice=`, que acepta tanto nombres de este repositorio como rutas a ficheros de voz propios.
- Gestion de texto largo mediante division automatica en fragmentos de frase de como maximo 50 tokens, generados por separado con la misma voz y unidos despues; una frase que exceda ese limite se corta por sus comas.
- Muestreo controlado: temperatura 0,3 por defecto y semilla configurable mediante `seed` para reproducir una generacion concreta.
- API de dos niveles: una puerta de alto nivel por tarea y acceso directo al driver embebido para parametros no expuestos por la puerta.
- No se documenta soporte de tool calling, function calling, capacidades de agente, vision, audio de entrada ni modo de razonamiento explicito.

## Casos de uso

- Lectura de articulos y documentacion tecnica: el modelo divide automaticamente el texto en frases de hasta 50 tokens y las encadena con la misma voz, lo que permite convertir documentos extensos en audio sin preprocesar el texto manualmente.
- Audiolibros y contenido narrado en ingles: la posibilidad de fijar `seed` permite reproducir exactamente la misma locucion en regeneraciones posteriores, util para corregir fragmentos concretos de una grabacion larga.
- Asistentes de voz embebidos en dispositivos con recursos limitados: con 101 millones de parametros y salida a 24 kHz, el modelo puede ejecutarse en CPU o en GPUs de gama baja dentro de un runtime unico en GGUF.
- Prototipado rapido de interfaces de voz: la API de alto nivel `model.text2speech.infer(...)` permite generar un WAV con una sola llamada, sin montar un pipeline de TTS completo.
- Generacion de avisos y locuciones para aplicaciones: nombres de voz como `marius` o `vera` permiten mantener una identidad sonora consistente en mensajes cortos generados dinamicamente.
- Evaluacion y comparacion de voces: el repositorio incluye 25 ficheros de voz con licencias de grabacion documentadas, lo que facilita probar distintas voces antes de decidir cual integrar.
- Experimentacion con modelos TTS basados en codecs neuronales: al ser un export de un modelo de flujo sobre latentes Mimi, sirve como banco de pruebas para estudiar la generacion de audio en el espacio de latentes dentro de loom.cpp.
- Sintesis de voz en canalizaciones de datos en Python: la integracion como paquete `loom-py-rt[hub]` permite descargar el modelo desde el Hub y generar audio dentro de un script de procesamiento por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de fidelidad es la verificacion frente a la implementacion de referencia con las extracciones aleatorias fijadas: una desviacion de 1,8e-06 rms respecto a la forma de onda de referencia, paso a paso.

## Requisitos de hardware

Las siguientes cifras son estimaciones de peso de los parametros (101,28 M) y no proceden de la informacion proporcionada; hay que anadir la sobrecarga del runtime y del decodificador de audio.

- VRAM estimada para los pesos: aproximadamente 405 MB en fp32, 203 MB en fp16, 101 MB en int8 y 51 MB en int4.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, cualquier GPU con al menos 1-2 GB de memoria libre es suficiente, incluidas integradas modernas.
- GPU de consumo: si, cabe con holgura en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) e incluso en CPU, dado el tamano del modelo.
- Opciones de despliegue: el runtime documentado es `loom-py` (paquete `loom-py-rt` en PyPI), sobre el motor `loom.cpp`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el GGUF es especifico de loom.cpp y contiene topologias de grafo propias, por lo que no se puede asumir compatibilidad con otros cargadores GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar con el modelo base, del que este repositorio es un reempaquetado con pesos identicos.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| loom-ai-org/pocket-tts-loom | 101,28 M | no disponible | ingles | cc-by-4.0 | GGUF (loom.cpp) + ficheros de voz | HuggingFace, runtime loom-py |
| kyutai/pocket-tts (modelo base) | 101,28 M (mismos pesos) | no disponible | ingles (otros idiomas en checkpoints separados) | cc-by-4.0 | pesos originales | HuggingFace |
| Otros modelos TTS ligeros de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que no se incluye una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo ingles. Los demas idiomas de Kyutai son checkpoints separados y no estan incluidos en este fichero.
- Se aplican las restricciones de uso de Kyutai, que viajan con los pesos: prohibe, entre otras cosas, la suplantacion o clonacion de voz sin consentimiento explicito y licito, y presentar el audio generado como una grabacion genuina de una persona real.
- Solo hay una voz integrada en el fichero (`alba`). Las otras 25 se distribuyen como ficheros de voz en `voices/`.
- Las licencias de las voces corresponden a la grabacion, no al modelo: `cosette` y `jean` son CC-BY-NC-4.0 (no comerciales) y `juergen` y `rafael` no tienen licencia declarada por Kyutai. Las voces CC-BY requieren atribucion a su dataset de origen o al hablante.
- Un fichero de voz solo funciona con estos pesos concretos: loom rechaza uno creado para otra release.
- La clonacion de voz a partir de una grabacion requiere el codificador Mimi, que esta exportacion no incluye.
- El muestreo esta activado por defecto con temperatura 0,3, de modo que dos llamadas con la misma entrada producen resultados distintos salvo que se fije `seed`.
- El texto largo se divide en fragmentos de hasta 50 tokens; una frase mas larga se corta por las comas, lo que puede afectar a la prosodia.
- La frecuencia de muestreo (24.000 Hz) hay que pasarla explicitamente a la API si el GGUF no la declara; un valor incorrecto no produce error, sino reproduccion a velocidad equivocada.
- Riesgo de alucinacion y de errores de pronunciacion: no se documentan evaluaciones de fidelidad de texto a voz mas alla de la comparacion numerica con la referencia.
- Los resultados de busqueda web disponibles no son relevantes para este modelo (corresponden a un producto de grabacion de pantalla y a una marca de ropa homonimos), por lo que no aportan informacion adicional.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/loom-ai-org/pocket-tts-loom
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Dataset de voces de Kyutai: https://huggingface.co/kyutai/tts-voices
- Motor loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- API de Python loom-py: https://github.com/loom-ai-org/loom-py
