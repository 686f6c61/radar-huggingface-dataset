# RobertasTa/android-lt

## Resumen

Android LT es un paquete de recursos de voz para Android centrado en el lituano, publicado por el desarrollador RobertasTa. No se trata de un modelo de lenguaje generativo, sino de una distribucion empaquetada que combina un modelo de sintesis de voz (text-to-speech) en formato ONNX y un modelo de reconocimiento automatico del habla (ASR) tambien en ONNX, junto con un diccionario de estres silabico para eSpeak NG. El objetivo es dotar a los telefonos Android de capacidades de lectura en voz alta y dictado en lituano de forma completamente offline, sin dependencias de servicios en la nube.

La voz sintetica, denominada Ingute, deriva del modelo base `RobertasTa/lt_LT-ingute-medium` y se ejecuta mediante el motor SherpaTTS (paquete `org.woheller69.ttsengine`), una aplicacion de codigo abierto distribuida por F-Droid que integra sherpa-onnx. El componente de reconocimiento, apodado "Ears", se basa en `kristijonas/kmynas-parakeet-lt-v4` y esta pensado para la keyboard de voz Parakeetype. El paquete incluye correcciones practicas para dos problemas conocidos: la perdida del fonema /s/ lituano en la sintesis y la asignacion incorrecta del estres silabico (que eSpeak NG acierta solo en el 53,4 % de las palabras multisilabas).

El modelo tiene un caracter eminentemente practico y de accesibilidad: permite que un telefono Android lea textos y escuche dictado en lituano sin conexion. Su relevancia reside en la combinacion de un modelo TTS ligero (63 MB) con un diccionario de 189.000 formas verbales y un modelo ASR cuantizado a int8 (955 MB), todo empaquetado para su instalacion en dispositivos de consumo. La licencia es `newgenltu-openrail-d`, una licencia personalizada que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS: Piper (sherpa-onnx); ASR: Parakeet (NVIDIA, variante lituana) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS/ASR) |
| Tipos de cuantizacion | TTS: ONNX medium (63 MB); ASR: int8 (955 MB) |
| Idiomas soportados | lituano (lt) |
| Licencia | newgenltu-openrail-d |
| Formato de pesos | ONNX (`lt_LT-ingute-medium.onnx`), `tokens.txt`, `lt_dict`, ZIP con modelo ASR int8 |

## Arquitectura y entrenamiento

El componente de sintesis sigue la arquitectura Piper, un modelo de TTS neuronal basado en VITS que se ejecuta a traves del runtime sherpa-onnx. El modelo `lt_LT-ingute-medium` se distribuye como un unico fichero ONNX de 63 MB, acompanado de un fichero `tokens.txt` que mapea fonemas a identificadores. La voz depende de eSpeak NG para la fonemizacion del texto lituano, de ahi que el paquete incluya un diccionario (`lt_dict`) con la silaba estresada de 189.000 formas verbales, construido especificamente para la version 3.4 de SherpaTTS (sherpa-onnx 1.13). No se dispone de informacion sobre el numero de horas de audio, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO; son datos no publicados en la model card.

El componente de reconocimiento se basa en Parakeet, la familia de modelos ASR de NVIDIA, en su variante lituana `kmynas-parakeet-lt-v4`, cuantizada a int8 para reducir el peso a 955 MB y permitir su ejecucion en el telefono. El paquete incluye ademas una correccion fonetica relevante: eSpeak NG transcribe el fonema /s/ lituano como `ʂ` en muchas posiciones, un simbolo que la voz apenas aprendio, por lo que el `tokens.txt` incluido remapea esa representacion para evitar la desaparicion de las eses. No se detalla la arquitectura interna exacta de Parakeet (si es Conformer, FastConformer u otra) ni los datos de entrenamiento del modelo base.

## Capacidades

- Sintesis de voz en lituano offline mediante SherpaTTS, integrable en el sistema de texto-a-voz de Android, lectores de pantalla y aplicaciones de lectura.
- Reconocimiento automatico del habla en lituano offline mediante Parakeetype, con insercion de texto dictado en cualquier campo de texto.
- Correccion del fonema /s/ lituano mediante `tokens.txt`, que reduce la tasa de errores de palabra del 7,7 % al 4,4 %.
- Asignacion del estres silabico correcto mediante `lt_dict`, que eleva la precision del 53,4 % al 99,3 % en textos LIEPA.
- Funcionamiento completamente offline: ni la sintesis ni el reconocimiento requieren conexion a red.
- Soporte de lectura de numeros y abreviaturas mediante eSpeak NG (con limitaciones, ver seccion de limitaciones).
- No incluye tool calling, function calling, razonamiento multi-paso ni capacidades multimodales mas alla de voz y texto.

## Casos de uso

- Accesibilidad para personas con discapacidad visual: el motor SherpaTTS con la voz Ingute permite que el lector de pantalla de Android lea en lituano articulos, menus y mensajes, con la ventaja de funcionar sin conexion y sin coste por uso.
- Lectura de libros y articulos: aplicaciones de lectura pueden delegar la narracion en SherpaTTS usando el modelo de 63 MB, adecuado para sesiones largas por su bajo consumo de recursos.
- Dictado en lituano en cualquier aplicacion: la keyboard Parakeetype con el modelo ASR int8 permite redactar correos, mensajes y notas por voz sin enviar audio a servidores externos, lo que protege la privacidad.
- Entornos con conectividad limitada o nula: el caracter offline del paquete lo hace util en zonas rurales, vuelos, instalaciones sin red o situaciones de emergencia donde la nube no esta disponible.
- Educacion y aprendizaje de lituano: la combinacion de sintesis y reconocimiento permite practicar pronunciacion y comparar la salida del ASR con el texto esperado, con el diccionario de estres como referencia.
- Integracion en dispositivos de consumo sin GPU: al ejecutarse en CPU mediante sherpa-onnx, el paquete es viable en telefonos de gama media como el Xiaomi 12T Pro usado en las pruebas (Android 15).
- Localizacion de aplicaciones Android al lituano: desarrolladores que necesiten TTS o ASR en lituano pueden empaquetar estos recursos sin depender de APIs comerciales.

## Benchmarks y rendimiento

Los datos publicados en la model card son mediciones propias del autor, no benchmarks estandarizados de la comunidad:

| Metrica | Resultado |
|---|---|
| Errores de palabra (TTS, sin correcciones) | 7,7 % |
| Errores de palabra (TTS + fix de /s/) | 4,4 % |
| Errores de palabra (TTS + fix de /s/ + estres) | 1,1 % |
| Precision del estres silabico (eSpeak NG solo, LIEPA, 19.943 palabras) | 53,4 % |
| Precision del estres silabico (con `lt_dict`) | 99,3 % |
| WER ASR en FLEURS (986 enunciados, modelo por defecto) | 27,1 % |
| WER ASR en FLEURS (con estas "Ears") | 10,6 % |
| WER ASR en comandos cortos (127, modelo por defecto) | 80,4 % |
| WER ASR en comandos cortos (con estas "Ears") | 17,0 % |

Las mediciones de TTS se realizaron con un modelo ASR lituano escuchando 12 frases cotidianas sin numeros, en un Xiaomi 12T Pro con Android 15 y SherpaTTS 3.4. Las de ASR se midieron en PC con un script que replica la ruta de reconocimiento de Parakeetype, y se probaron en vivo en el mismo telefono. No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM: no aplica; el paquete esta disenado para ejecucion en CPU en dispositivos Android.
- Almacenamiento: aproximadamente 63 MB para el modelo TTS y `tokens.txt`, mas 955 MB para el archivo ASR int8, mas el diccionario `lt_dict`.
- GPU recomendadas: no aplica; no se requiere GPU. En PC, cualquier CPU moderna es suficiente para las pruebas de validacion.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso movil; el modelo no esta pensado para aceleracion por GPU.
- Opciones de despliegue: SherpaTTS (Android, F-Droid) para TTS y Parakeetype (Android, F-Droid) para ASR; en PC, sherpa-onnx para validacion.
- Latencia y throughput: no disponibles de forma cuantificada; el autor reporta funcionamiento en tiempo real en un Xiaomi 12T Pro con Android 15.
- Requisito adicional: la instalacion del diccionario `lt_dict` requiere un ordenador con `adb` y depuracion USB activada, porque Android 15 no permite a los gestores de archivos escribir en la carpeta de otra aplicacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Android LT (Ingute + Ears) | TTS Piper + ASR Parakeet | no disponible | no aplica | newgenltu-openrail-d | Hugging Face, F-Droid |
| Parakeet Ultra (por defecto en Parakeetype) | ASR | no disponible | no aplica | no disponible | F-Droid |
| eSpeak NG solo (sin `lt_dict`) | TTS por reglas | no aplica | no aplica | GPL u otra (no verificada) | Multiples plataformas |
| Piper estandar (voces genericas) | TTS neuronal | no disponible | no aplica | MIT (Piper) | Hugging Face, sherpa-onnx |

La comparativa se limita a los modelos mencionados en la informacion disponible. No se dispone de datos de otros sistemas TTS o ASR especificos para lituano que permitan una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- Los numeros y abreviaturas los lee eSpeak NG directamente, por lo que expresiones como "15:25 val." pueden sonar de forma poco natural.
- Solo se asigna la silaba estresada, no el acento tonal (pitch accent) del lituano, que distingue significados en algunos casos.
- Aproximadamente el 9 % de las palabras no estan en `lt_dict`; para esas, eSpeak NG aplica reglas y puede errar el estres.
- `lt_dict` se construyo para SherpaTTS 3.4 (sherpa-onnx 1.13); en otras versiones hay que verificar el md5 (`5426503daf0a29836d0f168d38b38581`) antes de copiarlo, y reinstalar SherpaTTS o borrar sus datos deshace la instalacion del diccionario.
- La voz es sintetica: suena natural pero no es una persona; no se debe presentar como voz humana.
- El modelo ASR esta en estado "propuesto": para que Parakeetype de F-Droid acepte el archivo, el autor de la aplicacion debe fusionar la propuesta `theScrabi/Parakeetype#1`; a fecha 2026-10-29 no esta integrado.
- La licencia `newgenltu-openrail-d` es personalizada; es imprescindible revisar el fichero `LICENSE-VOICE` antes de cualquier uso comercial o redistribucion.
- No se documentan sesgos especificos, pero al ser un modelo entrenado para lituano, su rendimiento fuera de ese idioma no esta garantizado ni evaluado.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto libre, pero el ASR puede producir transcripciones incorrectas en audio con ruido o acentos no vistos en entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RobertasTa/android-lt
- Repositorio GitHub: https://github.com/RobertasTa/android-lt
- Pagina del proyecto: https://robertasta.github.io/android-lt/en/
- Licencia de la voz: https://huggingface.co/RobertasTa/android-lt/blob/main/LICENSE-VOICE
- Modelo base TTS: https://huggingface.co/RobertasTa/lt_LT-ingute-medium
- Modelo base ASR: https://huggingface.co/kristijonas/kmynas-parakeet-lt-v4
- SherpaTTS en F-Droid: https://f-droid.org/repo/org.woheller69.ttsengine_34.apk
- Parakeetype: https://github.com/theScrabi/Parakeetype
- Propuesta de integracion en Parakeetype: https://github.com/theScrabi/Parakeetype/pull/1
- Android platform-tools (adb): https://developer.android.com/tools/releases/platform-tools
