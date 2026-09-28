# robbiemed/supertonic-3-int8

## Resumen

Supertonic 3 int8 es una version cuantizada a int8 de dos de los cuatro grafos ONNX que componen el modelo de sintesis de voz Supertonic 3, desarrollado originalmente por Supertone. Esta build concreta la publica el usuario robbiemed y existe para alimentar Ko TTS, un motor de texto a voz coreano que funciona sin conexion en Android y en telefonos sin servicios de Google. A diferencia del modelo base, que ocupa 401 MB en fp32, esta variante reduce el text encoder a 16 MB y el vector estimator a 66 MB, manteniendo el resto de componentes (predictor de duracion, vocoder, configuraciones y estilos de voz) en el repositorio upstream en su version fp32.

El modelo base Supertonic 3 es un sistema TTS de pesos abiertos de aproximadamente 99 millones de parametros que se ejecuta en CPU mediante ONNX Runtime, sin GPU, sin nube y sin API, y que cubre 31 idiomas con 10 voces. La relevancia de esta ficha radica en que demuestra una ruta de cuantizacion reproducible (build determinista verificable por SHA-256) que acelera la inferencia en dispositivos moviles: en un Pixel 10a con Tensor G4, con 4 hilos y 6 pasos, genera el primer audio en 0,33 s y sintetiza 6 veces mas rapido que el tiempo real, frente a 0,70 s y 2,4 veces del modelo fp32.

El repositorio declara los idiomas coreano, ingles y japones, aunque el modelo base soporta 31 lenguas. La licencia, BigScience OpenRAIL-M, es la misma que la del modelo original e incluye las restricciones de uso habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema TTS de pesos abiertos ejecutado mediante ONNX Runtime; este repo contiene 2 de los 4 grafos ONNX (text encoder y vector estimator). Arquitectura interna no detallada en la informacion disponible |
| Parametros totales | 99M en el modelo base (Supertonic 3); no disponible el desglose por grafo de esta build |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de sintesis de voz, no de lenguaje) |
| Tipos de cuantizacion | int8 (uint8 por canal en pesos de MatMul y Conv); fp32 en convoluciones depthwise y en el vocoder |
| Idiomas soportados | ko, en, ja declarados en este repo; el modelo base soporta 31 idiomas |
| Licencia | OpenRAIL (BigScience OpenRAIL-M) |
| Formato de pesos | ONNX |

Otros datos: tamano del repositorio 0,1 GB; ficheros `text_encoder.onnx` (16 MB, SHA-256 `d32a22d345ecbc288b5fc121ad0aa27bd4708f9617b6c7372410836f6e02db71`) y `vector_estimator.onnx` (66 MB, SHA-256 `9c6408bdf36ef1fa534a93baac7f828c0abb5b1b87b792153497603fcf0f5763`). Modelo base: Supertone/supertonic-3, commit de referencia `724fb5abbf5502583fb520898d45929e62f02c0b`.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en los datos proporcionados, mas alla de que se compone de cuatro grafos ONNX (text encoder, vector estimator, duration predictor y vocoder) y que se ejecuta en CPU a traves de ONNX Runtime. El modelo base tiene 99 millones de parametros y soporta 31 idiomas con 10 voces.

Lo relevante de esta build es el proceso de cuantizacion, no un reentrenamiento. Los ficheros se generan con cuantizacion dinamica de ONNX Runtime (`quantize.py`, en el repositorio ko_tts): los pesos de MatMul y Conv se cuantizan a uint8 por canal, mientras que las convoluciones depthwise se mantienen en fp32 porque el kernel de CPU de ONNX Runtime no dispone de `ConvInteger` agrupado. El vocoder se deja deliberadamente en fp32: cuantizarlo degrada la salida hasta el ruido, con un 87 % de error de caracteres en una prueba de ida y vuelta con Whisper. El proceso es determinista, de modo que ejecutar el script sobre el commit upstream reproduce exactamente los hashes SHA-256 indicados.

## Capacidades

- Sintesis de voz (text-to-speech) offline en CPU, sin GPU ni servicios en la nube.
- Soporte declarado de coreano, ingles y japones en este repositorio; el modelo base cubre 31 idiomas.
- 10 voces disponibles (heredadas del modelo base, con sus estilos de voz sin modificar).
- Ejecucion en Android y en telefonos sin servicios de Google mediante el motor Ko TTS, con un APK de aproximadamente 7 MB.
- Descarga verificada del modelo de voz desde Hugging Face, fijada a un commit y validada por SHA-256.
- Inferencia acelerada en movil: primer audio en 0,33 s y sintesis 6 veces mas rapido que el tiempo real en un Pixel 10a.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni modo de razonamiento; no aplican a un modelo TTS.

## Casos de uso

- Lectura por voz en aplicaciones Android sin conexion: el motor Ko TTS integra estas builds para sintetizar texto en el dispositivo, con un APK de ~7 MB y descarga del modelo de voz fijada por hash, lo que permite funcionar sin red ni servicios de Google.
- Accesibilidad para personas con discapacidad visual: la sintesis local en CPU permite leer pantallas y contenidos sin depender de APIs en la nube ni exponer el texto del usuario a terceros.
- Asistentes de voz en telefonos de-Googled: al no requerir servicios de Google ni conexion, encaja en dispositivos con ROMs alternativas que buscan privacidad y autonomia.
- Aplicaciones medicas o de ambito sanitario: la prueba de calidad documentada usa 16 frases de contexto hospitalario y de crianza, con un CER del 4,6 % en coreano, lo que sugiere su uso en avisos, recordatorios o lectura de instrucciones.
- Sistemas embebidos y dispositivos de bajos recursos: al ejecutarse exclusivamente en CPU con un paquete cuantizado de 190 MB (int8 compacto) frente a 401 MB en fp32, es viable en hardware sin GPU.
- Traduccion y doblaje ligero ko/en/ja: la combinacion de tres idiomas declarados permite generar locuciones en esos idiomas desde una unica tuberia local.
- Generacion de audio para prototipos y demos: la velocidad de 6 veces el tiempo real y el arranque de 0,33 s facilitan iteraciones rapidas en entornos de desarrollo sin infraestructura dedicada.

## Benchmarks y rendimiento

Datos publicados en la model card:

| Metrica | int8 (esta build) | fp32 (modelo base) |
|---|---|---|
| Error de caracteres en coreano (ida y vuelta con Whisper-small, 16 frases) | 4,6 % | 5,3 % |
| Primer audio (Pixel 10a, Tensor G4, 4 hilos, 6 pasos) | 0,33 s | 0,70 s |
| Velocidad de sintesis | 6x mas rapido que tiempo real | 2,4x mas rapido que tiempo real |
| Error de caracteres si se cuantiza el vocoder | 87 % (motivo por el que se deja en fp32) | no aplica |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo de sintesis de voz.

## Requisitos de hardware

- Inferencia en CPU exclusivamente; no requiere GPU ni aceleracion en la nube.
- Tamano de los ficheros int8 de este repo: 16 MB (text encoder) + 66 MB (vector estimator); el resto de grafos se toman del upstream en fp32.
- Paquete completo segun el motor Ko TTS: 190 MB en int8 compacto y 401 MB en fp32.
- Cabe en cualquier dispositivo movil o equipo de consumo; probado en un Pixel 10a con SoC Tensor G4 usando 4 hilos y 6 pasos de inferencia.
- Despliegue mediante ONNX Runtime; el caso de referencia es el motor Ko TTS para Android.
- Latencias medidas (Pixel 10a, Tensor G4, 4 hilos, 6 pasos): primer audio 0,33 s y sintesis 6x mas rapido que el tiempo real en int8.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, ya que no son aplicables a este tipo de modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Prestaciones | Licencia |
|---|---|---|---|---|---|
| robbiemed/supertonic-3-int8 (esta build) | 99M en el modelo base | ko, en, ja declarados aqui (31 en el base) | ONNX int8 (2 grafos) | Primer audio 0,33 s; 6x tiempo real; CER coreano 4,6 % | OpenRAIL-M |
| Supertone/supertonic-3 (base fp32) | 99M | 31 idiomas | ONNX fp32 | Primer audio 0,70 s; 2,4x tiempo real; CER coreano 5,3 % | OpenRAIL-M |
| askurios8/supertonic-3-int8 | 99M en el modelo base | ko, en (segun etiquetas del espejo) | ONNX int8 | no disponible | OpenRAIL |

No se dispone de datos de otros modelos TTS comparables (por ejemplo Piper, Coqui o Kokoro) en la informacion proporcionada, por lo que no se incluyen cifras de rendimiento cruzadas.

## Limitaciones y advertencias

- Esta build solo contiene 2 de los 4 grafos ONNX del modelo base; el duration predictor, el vocoder, las configuraciones y los estilos de voz deben tomarse del repositorio upstream en el commit `724fb5abbf5502583fb520898d45929e62f02c0b`, lo que obliga a gestionar dos fuentes distintas.
- El vocoder no debe cuantizarse: hacerlo degrada la salida hasta el ruido, con un 87 % de error de caracteres en la prueba de ida y vuelta.
- Las convoluciones depthwise permanecen en fp32 por limitaciones del kernel de CPU de ONNX Runtime; no es una cuantizacion completamente uniforme.
- La evaluacion de calidad documentada se limita a 16 frases de ambito hospitalario y de crianza en coreano; no hay validacion publicada para ingles ni japones en esta build.
- Como todo sistema TTS, puede producir artefactos de pronunciacion, prosodia incorrecta o errores en palabras poco frecuentes; no se documentan tasas de alucinacion ni de fallo fuera del conjunto de prueba.
- Licencia OpenRAIL-M con restricciones de uso: prohibido el uso para suplantacion de identidad, desinformacion, dano a personas y el resto de supuestos vetados por la licencia. Estas restricciones se heredan del modelo base y afectan tambien al uso comercial.
- El modelo se ejecuta en CPU; no esta pensado para aceleracion en GPU ni para despliegues de alto throughput en servidor.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia, por lo que carece de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/robbiemed/supertonic-3-int8
- Modelo base: https://huggingface.co/Supertone/supertonic-3
- Repositorio Ko TTS: https://github.com/robbie-med/ko_tts
- Script de cuantizacion: https://github.com/robbie-med/ko_tts/blob/main/tools/quantize.py
- Pagina oficial de Supertonic 3: https://supertonic3.github.io/
- Espejo del modelo: https://huggingface.co/askurios8/supertonic-3-int8
- Ficha en free2aitools: https://free2aitools.com/model/askurios8/supertonic-3-int8
