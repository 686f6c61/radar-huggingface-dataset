# NothingSoftware/opus-mt-tc-big-fr-zle-ct2-int8

## Resumen

NothingSoftware/opus-mt-tc-big-fr-zle-ct2-int8 es una conversion de formato del modelo de traduccion automatica Helsinki-NLP/opus-mt-tc-big-fr-zle, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki (proyecto OPUS-MT, Jörg Tiedemann y colaboradores) y publicado el 23 de marzo de 2022. La conversion, realizada por NothingSoftware, transforma los pesos originales a CTranslate2 con cuantizacion int8, sin reentrenar ni ajustar nada: es exclusivamente un cambio de formato orientado a inferencia eficiente.

El modelo traduce del frances (fr) a lenguas eslavas orientales, con el ruso (ru) como destino etiquetado en el repositorio; la model card indica que los tokens de destino `>>ukr<<` y `>>bel<<` tambien funcionan, lo que permite generar ucraniano y bielorruso con los mismos pesos. Su relevancia actual es practica: al ocupar 242.439.853 bytes en int8 (repositorio completo de 0,2 GB), cabe en cualquier equipo y puede ejecutarse en CPU a aproximadamente el doble de velocidad que la version float32, algo critico para aplicaciones de traduccion offline.

El caso de uso declarado por el autor es la aplicacion NTranscript, que descarga este modelo para su traduccion sin conexion. No es un modelo generativo de proposito general: es un traductor de frases de la familia OPUS-MT, con las limitaciones y el alcance propios de ese tipo de sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de traduccion (familia OPUS-MT); la model card no detalla numero de capas, dimension oculta ni cabezas de atencion |
| Parametros totales | no disponible; el fichero `model.bin` en int8 ocupa 242.439.853 bytes, coherente con unos 240 millones de parametros a 1 byte por parametro |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (CTranslate2); no se publican variantes float16 ni float32 en este repositorio |
| Idiomas soportados | fr (origen) y ru (destino etiquetado); el modelo base admite ademas ukr y bel mediante token de destino |
| Licencia | cc-by-4.0 |
| Formato de pesos | CTranslate2 (`model.bin`), con `shared_vocabulary.json` y tokenizadores SentencePiece `source.spm` y `target.spm` |
| Tamano del repositorio | 0,2 GB |
| Libreria de inferencia | ctranslate2 |
| Pipeline declarado | translation |
| Fecha de creacion del repositorio | 2026-09-23 (actualizado el mismo dia) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de indicar que se trata de una conversion a CTranslate2 del modelo Helsinki-NLP/opus-mt-tc-big-fr-zle, perteneciente a la familia OPUS-MT. No se especifican el numero de capas, la dimension del modelo, el numero de cabezas de atencion, la longitud maxima de secuencia ni los hiperparametros de entrenamiento. El autor indica explicitamente que "nothing was retrained or fine-tuned": los pesos son identicos a los del modelo base, solo modificados por la cuantizacion a int8.

En cuanto al proceso de conversion, se realizo con CTranslate2 4.8.2 y transformers 5.17.0 mediante el comando `ct2-transformers-converter` con `--quantization int8` y copia de los ficheros `source.spm` y `target.spm`. El unico dato de validacion tecnica aportado es que int8 obtiene la misma puntuacion que float32 en la prueba realizada por el autor (WMT20 en-ru, primeras 500 frases: BLEU 28,0 en ambos casos), con la mitad de tamano y aproximadamente el doble de velocidad en CPU. No se documenta ninguna innovacion arquitectonica adicional; el valor anadido del repositorio es el formato y la cuantizacion.

El flujo de inferencia requiere prefijar cada frase de origen con el token de lengua destino (`>>rus<<`, y segun el autor tambien `>>ukr<<` o `>>bel<<`), tokenizar con `source.spm`, anadir `</s>` y decodificar la salida con `target.spm`.

## Capacidades

- Traduccion de texto frances a ruso en modo frase a frase, con decodificacion por haz (el ejemplo de la model card usa `beam_size=2`).
- Traduccion a otras lenguas eslavas orientales mediante token de destino (`>>ukr<<`, `>>bel<<`), segun lo indicado en la model card; no se aportan metricas para estos pares.
- Ejecucion en CPU con pesos int8, con aproximadamente el doble de velocidad que float32 segun la prueba del autor.
- Integracion directa con la API de CTranslate2 (`ct2.Translator`, `translate_batch`) para procesamiento por lotes.
- Despliegue offline completo: no requiere llamadas a servicios externos ni conexion a internet.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento. Es exclusivamente un modelo de traduccion.
- No se documentan capacidades multilingues mas alla de los pares fr-zle indicados.

## Casos de uso

- Traduccion offline en aplicaciones de escritorio: es el proposito declarado del repositorio, ya que la aplicacion NTranscript lo descarga para traducir sin conexion. El tamano de 0,2 GB y la ejecucion en CPU lo hacen viable en equipos sin GPU.
- Traduccion de transcripciones y subtitulos: al integrarse en una aplicacion de transcripcion, permite pasar el texto reconocido en frances a ruso manteniendo todo el proceso en local, sin enviar contenido sensible a terceros.
- Procesamiento por lotes de corpus franceses: mediante `translate_batch` con CTranslate2 se pueden traducir grandes volumenes de frases en un servidor sin GPU, con un coste por palabra muy bajo.
- Traduccion en entornos aislados o air-gapped: organismos que no pueden usar APIs en la nube (administraciones publicas, defensa, sanidad) pueden desplegar el modelo en una maquina sin salida a internet.
- Traduccion asistida para documentacion tecnica: como primera pasada de traduccion frances-ruso en flujos de localizacion, seguida de postedicion humana obligatoria, dado que no hay garantia de calidad fuera del dominio de los corpus OPUS.
- Backend de atencion al cliente con presupuesto minimo: para mensajes cortos frances-ruso en un servicio de mensajeria, el modelo ocupa menos de 1 GB de memoria y puede correr en la misma maquina que el resto del backend.
- Generacion de datos sinteticos para entrenamiento: traduccion masiva de frases francesas a ruso para aumentar corpus paralelos o para aumento de datos en tareas posteriores.
- Traduccion embebida en dispositivos con recursos limitados: en placas ARM o mini-PC con CPU moderna, el modelo int8 puede ejecutarse sin acelerador dedicado.

## Benchmarks y rendimiento

Evaluacion original del modelo base (fra-rus), reproducida en la model card de esta conversion:

| Par de idiomas | Conjunto de test | chr-F | BLEU | Frases | Palabras |
|---|---|---|---|---|---|
| fra-rus | tatoeba-test-v2021-08-07 | 0,66502 | 46,1 | 11.490 | 70.123 |
| fra-rus | flores101-devtest | 0,54106 | 25,8 | 1.012 | 23.295 |
| fra-rus | newstest2012 | 0,51254 | 23,1 | 3.003 | 64.790 |
| fra-rus | newstest2013 | 0,52342 | 24,8 | 3.000 | 58.560 |

Prueba de la conversion int8 realizada por el autor:

| Prueba | Precision | BLEU |
|---|---|---|
| WMT20 en-ru, primeras 500 frases | float32 | 28,0 |
| WMT20 en-ru, primeras 500 frases | int8 | 28,0 |

Nota: la prueba de equivalencia se realizo sobre el par ingles-ruso, no sobre el par frances-ruso propio del modelo, por lo que solo demuestra que la cuantizacion int8 no degrada la salida en ese escenario concreto y no una equivalencia universal. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 0,3-0,5 GB para los pesos int8 (242,4 MB) mas el vocabulario compartido (2,26 MB) y las estructuras de SentencePiece; con margen de trabajo, 1 GB de memoria es suficiente.
- GPU recomendadas: al ser un modelo pequeno, cualquier GPU con al menos 1-2 GB de VRAM es suficiente, incluidas GTX 1050, GTX 1650, RTX 3060, RTX 4090, A100 o H100; CTranslate2 soporta ejecucion en CUDA, aunque el autor destaca el rendimiento en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU exclusivamente.
- Opciones de despliegue: API de Python de CTranslate2 (`ct2.Translator`), conversion con `ct2-transformers-converter`, integracion en la aplicacion NTranscript. No se proporcionan pesos en formato GGUF, ni ficheros para Ollama, vLLM o TGI en este repositorio.
- Latencia y throughput estimados: no disponible. El unico dato aportado es que int8 es aproximadamente dos veces mas rapido que float32 en CPU, con `beam_size=2` como configuracion de ejemplo.
- Almacenamiento: el repositorio completo ocupa 0,2 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NothingSoftware/opus-mt-tc-big-fr-zle-ct2-int8 | no disponible (~240 M segun el tamano del fichero int8) | no disponible | cc-by-4.0 | CTranslate2 int8 | Conversion sin reentrenar del modelo base; 0 descargas y 0 likes en el momento de la consulta |
| Helsinki-NLP/opus-mt-tc-big-fr-zle (modelo base) | no disponible | no disponible | cc-by-4.0 | safetensors/PyTorch (segun repositorio original) | Mismos pesos y misma calidad; requiere transformers en lugar de CTranslate2 |
| Helsinki-NLP/opus-mt-fr-ru | no disponible | no disponible | cc-by-4.0 | PyTorch | Modelo bilingue frances-ruso mas antiguo y de menor tamano de la misma familia OPUS-MT; no se dispone de metricas comparables en la informacion proporcionada |
| facebook/nllb-200-distilled-600M | no disponible en esta ficha | no disponible en esta ficha | cc-by-nc-4.0 (uso no comercial) | PyTorch | Alternativa multilingue de mayor cobertura de idiomas; la licencia impide uso comercial, a diferencia de este modelo |

Los datos numericos de los modelos alternativos no estan disponibles en la informacion proporcionada, por lo que no se incluye una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ambito funcional muy restringido: solo traduccion. No genera texto libre, no razona, no invoca herramientas y no gestiona conversaciones multi-turno.
- Traduccion a nivel de frase: no hay contexto de documento, por lo que la coherencia terminologica y de referencias entre frases no esta garantizada.
- El token de destino es obligatorio. Si se omite `>>rus<<` (o el token de lengua correspondiente), el comportamiento no esta documentado y la calidad puede degradarse.
- La prueba de equivalencia int8 frente a float32 se hizo sobre WMT20 en-ru (500 frases), no sobre el par frances-ruso del modelo; no hay evaluacion exhaustiva de la cuantizacion en todos los pares soportados.
- No se aportan metricas para los destinos ucraniano y bielorruso, pese a que la model card afirma que los tokens funcionan.
- Riesgo de alucinacion y de omisiones o repeticiones en frases largas, dominios especializados (medicina, derecho, jerga) o entradas con ruido; es un comportamiento habitual en modelos de traduccion de este tamano y no se documenta mitigacion alguna.
- Sesgos heredados de los corpus OPUS (Tatoeba, noticias, FLORES): posible sesgo de registro, de genero y de representacion dialectal. No se ha realizado ningun ajuste para corregirlos.
- Licencia CC-BY 4.0: permite uso comercial, pero exige atribucion a los autores originales (Universidad de Helsinki, proyecto OPUS-MT) y a la conversion. No se puede relicenciar de forma mas restrictiva sin respetar los terminos.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes, sin issues ni evaluaciones independientes.
- No existe version en GGUF ni soporte nativo para Ollama, vLLM o TGI, lo que limita las opciones de despliegue a CTranslate2 o a la conversion manual desde el modelo base.
- El repositorio aparece fechado en 2026-09-23, mientras que el modelo base se publico en 2022; conviene verificar la integridad de los ficheros mediante los SHA-256 incluidos en la model card antes de usarlos en produccion.
- Para flujos de traduccion con requisitos de calidad alta se recomienda postedicion humana y evaluacion propia en el dominio objetivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/NothingSoftware/opus-mt-tc-big-fr-zle-ct2-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-fr-zle
- Proyecto CTranslate2: https://github.com/OpenNMT/CTranslate2
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion NTranscript: https://github.com/Nothing-Software/NTranscript
- Licencia CC-BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Articulo OPUS-MT (EAMT 2020): https://aclanthology.org/2020.eamt-1.61
- Articulo Tatoeba Translation Challenge (WMT 2020): https://aclanthology.org/2020.wmt-1.139

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos fueron paginas de spam sin relacion con el contenido de la ficha.
