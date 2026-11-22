# Maximilian228/Geode-STT-omnilingual-1b

## Resumen

Geode-STT-omnilingual-1b es un paquete de reconocimiento automatico del habla (ASR) en formato sherpa-onnx, derivado del modelo `facebook/omnilingual-asr` de Meta Platforms. Lo publica el usuario Maximilian228 como componente de la aplicacion Android Geode, una app de transcripcion que funciona en el dispositivo y sin conexion. No se trata de un modelo entrenado desde cero, sino de una conversion al formato ONNX int8 realizada por el propio proyecto sherpa-onnx y empaquetada sin modificaciones, acompanada de los ficheros de tokens necesarios para la inferencia.

El modelo resuelve el problema de transcribir voz en diez idiomas de bajos recursos o poco cubiertos por los sistemas comerciales: suajili, hausa, javanes, tagalo, turco, persa, arabe, indonesio, vietnamita y tailandes. Su interes practico radica en que cabe y funciona en un telefono de gama media sin acelerador dedicado, con un tiempo real (RTF) cercano a 1,0 en un Snapdragon 720G, lo que permite transcripcion offline con latencia aceptable.

La arquitectura subyacente es la de Omnilingual ASR de Meta, un sistema de reconocimiento multilingue basado en CTC (la variante empaquetada es `omnilingual_asr_ctc`), con un tamano nominal de 1B de parametros segun el nombre del repositorio. La longitud de contexto, el numero exacto de parametros y los datos de entrenamiento no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Omnilingual ASR de Meta con cabeza CTC (`omnilingual_asr_ctc`), exportada a ONNX |
| Parametros totales | 1B (segun el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (unico fichero publicado: `model.int8.onnx`) |
| Idiomas soportados | sw, ha, jv, tl, tr, fa, ar, id, vi, th |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX int8 + `tokens.txt` (formato sherpa-onnx) |

## Arquitectura y entrenamiento

El modelo base es `facebook/omnilingual-asr`, un sistema ASR multilingue de Meta disenado para cubrir un numero muy amplio de lenguas (la model card cita 1600 idiomas para el modelo original). La variante empaquetada emplea una cabeza de clasificacion CTC, lo que simplifica el pipeline de decodificacion y lo hace adecuado para inferencia en tiempo real sin necesidad de un decodificador autorregresivo. El export a ONNX y la cuantizacion a int8 los realiza el proyecto k2-fsa/sherpa-onnx, no el autor del repositorio.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas especificas mas alla de la propia arquitectura del modelo base. La model card indica que no requiere entrada de identificacion de idioma: el modelo detecta y escribe el idioma que escucha.

## Capacidades

- Transcripcion de voz a texto en diez idiomas: suajili, hausa, javanes, tagalo, turco, persa, arabe, indonesio, vietnamita y tailandes.
- Deteccion implicita de idioma: no necesita que se le indique el idioma de entrada.
- Funcionamiento completamente offline y en el dispositivo, sin envio de audio a servidores externos.
- Inferencia en CPU mediante sherpa-onnx, con soporte de multihilo (la medicion de referencia usa 4 hilos).
- Reconocimiento de voz continuo en clips de al menos 10 segundos segun las pruebas publicadas.
- No se documentan capacidades de tool calling, agentes, vision, audio mas alla de ASR, ni modos de razonamiento extendido.

## Casos de uso

- Transcripcion offline en Android: la app Geode integra este paquete para convertir voz en texto sin conexion, lo que resulta adecuado para entornos con conectividad limitada o para usuarios que no quieren enviar audio a la nube.
- Notas de voz y dictado personal: con un RTF de 0,99 en un Snapdragon 720G, la transcripcion se aproxima al tiempo real y permite dictar notas o mensajes en movilidad.
- Subtitulado de grabaciones en idiomas poco cubiertos: para contenido en suajili, hausa, javanes o tagalo, donde los servicios comerciales tienen cobertura escasa, el modelo ofrece una alternativa libre.
- Investigacion en ASR multilingue: sirve como referencia reproducible en formato ONNX int8 para comparar el rendimiento de Omnilingual ASR en idiomas de bajos recursos.
- Prototipado de asistentes de voz locales: al no requerir identificacion de idioma y funcionar en CPU, se puede integrar en prototipos de interfaz por voz para turco, persa o arabe sin infraestructura GPU.
- Archivado y busqueda de audio: transcripcion por lotes de grabaciones en los diez idiomas soportados para indexar y buscar contenido, aceptando los niveles de error documentados (entre 8,9 % y 20,87 % de WER).

## Benchmarks y rendimiento

Resultados medidos sobre el conjunto de test de FLEURS (normalizado, sin mayusculas ni puntuacion), con los ficheros int8 del paquete en CPU, sobre 30 enunciados por idioma:

| Idioma | Metrica | Error % | Enunciados |
|---|---|---|---|
| id | WER | 8,90 | 30 |
| ar | WER | 10,21 | 30 |
| fa | WER | 12,16 | 30 |
| tl | WER | 12,88 | 30 |
| tr | WER | 13,15 | 30 |
| sw | WER | 15,07 | 30 |
| vi | WER | 18,39 | 30 |
| th | CER | 19,64 | 30 |
| ha | WER | 20,87 | 30 |

Rendimiento en dispositivo (Redmi Note 9 Pro, Snapdragon 720G, sherpa-onnx v2.0.1 CLI, 4 hilos):

| Metrica | Valor |
|---|---|
| Tiempo de carga | 5,8 s |
| RTF (clip de 10 s) | 0,99 |
| Pico de memoria RSS (VmHWM) | 1206 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que se trata de un modelo ASR.

## Requisitos de hardware

- Memoria: el pico de RSS medido es de 1206 MB en un telefono de gama media, por lo que se recomienda al menos 1,5 GB de RAM libre para la inferencia.
- CPU: funciona en CPU sin GPU; la medicion de referencia usa 4 hilos en un Snapdragon 720G.
- GPU: no se documenta soporte GPU ni se proporcionan recomendaciones de A100, H100 o RTX 4090; el paquete esta orientado a CPU.
- Dispositivos consumer: disenado para telefonos Android de gama media; cabe en moviles con 2 GB o mas de RAM.
- Despliegue: sherpa-onnx (CLI v2.0.1 probada); el paquete incluye `model.int8.onnx` y `tokens.txt`.
- Latencia y throughput: RTF de 0,99 en un clip de 10 s, es decir, aproximadamente tiempo real; el tiempo de carga es de 5,8 s.
- Tamano del repositorio: 1,0 GB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada. Como referencia cualitativa, el modelo base `facebook/omnilingual-asr` cubre 1600 idiomas y este paquete se limita a diez; no se han publicado mediciones propias de otros sistemas ASR multilingues en esta ficha.

| Modelo | Parametros | Idiomas | Formato | Licencia |
|---|---|---|---|---|
| Geode-STT-omnilingual-1b | 1B (segun nombre) | 10 | ONNX int8 | Apache-2.0 |
| facebook/omnilingual-asr | no disponible | 1600 (segun model card) | pesos originales | Apache-2.0 |
| Otros ASR multilingues | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tasas de error elevadas en la mayoria de idiomas: solo el indonesio baja del 10 % de WER; hausa alcanza el 20,87 % y vietnamita el 18,39 %. La propia model card senala que la mayoria supera el 10 % y que existen opciones mas precisas para estos idiomas.
- Mediciones con muestras pequenas: los resultados de FLEURS se basan en 30 enunciados por idioma, lo que limita la significacion estadistica.
- Sin identificacion de idioma explicita: el modelo detecta el idioma automaticamente, lo que puede producir errores en audio con cambios de lengua o ruido.
- Cobertura limitada a diez idiomas: no cubre el castellano ni la mayoria de las lenguas del modelo base.
- Riesgo de alucinacion en la transcripcion: como todo sistema ASR, puede generar texto plausible en segmentos de silencio o ruido.
- Sesgos: no se documentan analisis de sesgo por acento, genero o variedad dialectal; el rendimiento puede degradarse con acentos no representados en FLEURS.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar la atribucion a Meta Platforms y a k2-fsa/sherpa-onnx.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.
- Solo se publica la variante int8; no hay pesos en otros formatos ni en mayor precision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maximilian228/Geode-STT-omnilingual-1b
- Modelo base (repositorio oficial): https://github.com/facebookresearch/omnilingual-asr
- Exportador y runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
