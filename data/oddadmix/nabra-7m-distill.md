# oddadmix/Nabra-7M-Distill

## Resumen
Nabra-7M-Distill es un modelo de sintesis de voz (text-to-speech) en arabe estandar moderno desarrollado por el usuario oddadmix, destilado a partir de Nabra-82M-v0.1, su modelo profesor, que es aproximadamente 11 veces mas grande. Con 7.477.702 parametros (7,48 M) y un fichero de pesos de 28,7 MB en fp32, su objetivo declarado es ejecutar sintesis de voz arabe completamente offline en dispositivos moviles, sin servidor intermedio.

La relevancia del modelo esta en su relacion tamano/velocidad: en un benchmark del propio autor sobre 24 frases y 4 hilos de CPU sin GPU, alcanza un factor de tiempo real (RTF) mediano de 0,0224, lo que equivale a 45 veces el tiempo real (un segundo de audio en 22 ms) y a ser 4,2 veces mas rapido que el modelo profesor de 82M. La arquitectura pertenece a la familia Kokoro / StyleTTS2, con un codificador de texto sobre fonemas, un predictor de prosodia y un decodificador ISTFTNet.

Se publica bajo licencia Apache 2.0, con una unica voz condicionada durante el entrenamiento (`af_msa.pt`) y un front-end de texto a fonemas especifico para arabe que combina normalizacion, vocalizacion opcional con camel-tools y conversion a IPA mediante espeak-ng.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro / StyleTTS2: codificador de texto sobre fonemas (12 capas ALBERT con parametros compartidos), predictor de prosodia (duracion, tono, energia) y decodificador ISTFTNet con STFT inversa de 20 puntos |
| Parametros totales | 7.477.702 (7,48 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no se especifica longitud maxima de texto ni de secuencia de fonemas) |
| Tipos de cuantizacion | no disponible (el autor publica pesos en fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | arabe (ar), arabe estandar moderno; no cubre dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en detalle; checkpoint de PyTorch cargado con `load_model.py` y el paquete incluido `kokoro_patched/` |
| Frecuencia de muestreo | 24 kHz |
| Tamano del modelo | 28,7 MB en fp32 |
| Voz | una sola voz (`af_msa.pt`), la usada para condicionar el entrenamiento |
| Front-end de texto | `arabic_g2p.py`: normalizacion, tashkeel opcional con camel-tools, espeak-ng a IPA y `clean_phonemes` |
| Fecha de publicacion | 9 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 100 / 10 |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura Kokoro / StyleTTS2 y el autor desglosa el reparto de parametros por bloque: decodificador ISTFTNet 4.062.450, predictor de prosodia 2.219.572, plbert (12 capas compartidas) 595.520, codificador de texto 569.280 y proyeccion 30.880. Dos decisiones concentran el ahorro de tamano: las 12 capas ALBERT comparten un unico bloque de parametros, de modo que la profundidad cuesta 596K en lugar de 7M, y la duracion no se regresa como un valor numerico, sino que se predice sumando 50 puertas sigmoidales por fonema. El decodificador termina en una STFT inversa de 20 puntos en lugar de en mas capas convolucionales.

La destilacion se apoya en que el modelo profesor emite las duraciones por fonema que generaron su propio audio, de forma que el estudiante entrena contra una alineacion correcta por construccion. La funcion de perdida combina STFT multi-resolucion, L1 de duracion, L1 de log-mel, un termino de silencio y feature matching con WavLM, junto con discriminadores de espectrograma multi-periodo y multi-resolucion. El autor senala que la tasa de aprendizaje con decaimiento coseno hasta el 10% del pico es critica: con tasa constante, un estudiante mayor de esta misma familia sufrio el colapso de la cabeza de duracion mientras las perdidas de reconstruccion seguian mejorando y lo enmascaraban.

Detalle de implementacion relevante: la configuracion fija `hidden_channels` y `out_channels` del decodificador, valores que Kokoro original hardcodea a 1024/512; por eso el paquete estandar lanza un `TypeError` y el autor distribuye una version parcheada en `kokoro_patched/` con los valores por defecto intactos, de modo que el profesor de 82M sigue cargando sin cambios.

## Capacidades
- Sintesis de voz en arabe estandar moderno a 24 kHz a partir de texto, con una unica voz.
- Ejecucion totalmente offline y en dispositivo: 7,48 M de parametros y 28,7 MB en fp32, sin necesidad de servidor.
- Procesamiento de texto arabe con o sin tashkeel: si el texto ya lleva diacriticos se usa tal cual; si no, se vocaliza automaticamente en el front-end.
- Conversion texto-fonema especifica para arabe mediante `arabic_g2p.py` (normalizacion, camel-tools, espeak-ng, `clean_phonemes`).
- Inferencia rapida en CPU: RTF mediano de 0,0224 con 4 hilos, equivalente a 45 veces el tiempo real.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio de entrada ni modo de razonamiento: es exclusivamente un modelo de sintesis de voz.
- No hay soporte multilingue: solo arabe.

## Casos de uso
- Lectura por voz en aplicaciones moviles sin conexion: al ocupar 28,7 MB y sintetizar 1 segundo de audio en 22 ms en CPU, puede integrarse en apps de accesibilidad para personas con discapacidad visual que necesiten leer texto arabe sin red.
- Asistentes de voz embebidos en dispositivos IoT, automocion o electrodomesticos: el modelo cabe en el presupuesto de memoria de un dispositivo empotrado y no requiere GPU ni servidor en el bucle.
- Generacion por lotes de audiolibros y contenido editorial en arabe estandar moderno: con un RTF de 0,0224, una hora de audio se genera en aproximadamente 1,3 minutos de CPU de 4 hilos, lo que abarata la produccion masiva.
- Sistemas de anuncios y navegacion en transporte publico: mensajes de texto plano en arabe convertidos a voz en el propio dispositivo, sin depender de conectividad en tuneles o zonas sin cobertura.
- Aprendizaje de arabe: lectura de texto vocalizado para practicar pronunciacion, aprovechando que el modelo acepta tashkeel explicito y que el autor indica que el texto diacritizado da mejores resultados.
- Avisos telefonicos e IVR con locuciones dinamicas: frases generadas al vuelo a partir de datos (importes, fechas, nombres de parada) en lugar de depender de una biblioteca de audios pregrabados.
- Generacion de datos sinteticos para entrenar o evaluar sistemas de reconocimiento automatico de voz en arabe, usando la unica voz disponible como fuente controlada y reproducible.
- Kioscos y terminales de autoservicio con interfaz hablada en arabe estandar moderno, donde el coste de una GPU o de una API en la nube no esta justificado.

## Benchmarks y rendimiento
Datos aportados por el autor: mediana del factor de tiempo real sobre 24 frases, ambos modelos con 4 hilos de CPU y sin GPU. La conversion texto-fonema se excluye del cronometraje porque es el mismo front-end en los dos casos.

| Modelo | Parametros | RTF (mediana) | Tiempo de sintesis | Respecto al tiempo real |
|---|---:|---:|---:|---:|
| Nabra-7M-Distill | 7,48 M | 0,0224 | 0,081 s | 45x (dato del autor) |
| Nabra-82M | 81,81 M | 0,0947 | 0,346 s | 10,6x (derivado del RTF aportado) |

El autor indica que el modelo destilado es 4,2 veces mas rapido que el profesor de 82M. No se han publicado en la informacion disponible resultados de metricas de calidad (MOS, similitud de voz, WER de inteligibilidad, tasas de error de prosodia) ni comparaciones con otros sistemas TTS en arabe.

## Requisitos de hardware
- El fichero de pesos ocupa 28,7 MB en fp32; el autor no declara el consumo exacto de RAM/VRAM en inferencia, pero por tamano queda en el orden de decenas de MB, muy por debajo de cualquier GPU de consumo.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU dedicada: el escenario objetivo declarado es un telefono, con ejecucion totalmente offline.
- CPU: el benchmark del autor usa 4 hilos y sin GPU, con 0,081 s por frase y un RTF de 0,0224.
- GPU recomendadas: no aplica; no se documenta ningun requisito de GPU ni se aportan cifras para A100, H100 o RTX 4090.
- Opciones de despliegue documentadas: carga mediante `load_model.py` y el paquete `kokoro_patched/` en PyTorch, con la voz `af_msa.pt` y el front-end `arabic_g2p.py`. No se documentan exportaciones a ONNX, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no son runtimes orientados a TTS.
- Throughput y latencia: 45 veces el tiempo real en CPU de 4 hilos segun el autor; no hay datos de latencia en GPU ni de sintesis en streaming.

## Comparativa con modelos similares

| Modelo | Parametros | RTF (CPU, 4 hilos) | Tiempo de sintesis | Idioma | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|---|
| Nabra-7M-Distill | 7,48 M | 0,0224 | 0,081 s | arabe (MSA) | Apache 2.0 | HuggingFace (oddadmix/Nabra-7M-Distill) |
| Nabra-82M-v0.1 | 81,81 M | 0,0947 | 0,346 s | arabe | no disponible en la informacion proporcionada | HuggingFace (oddadmix/Nabra-82M-v0.1) |

El autor menciona Kokoro como base arquitectonica del proyecto y StyleTTS2 como familia de arquitectura, pero no se aportan parametros, contexto, rendimiento ni licencia de esos sistemas en la informacion disponible, por lo que no se incluyen cifras que no esten respaldadas por los datos facilitados. Tampoco se dispone de comparaciones con otras alternativas TTS en arabe.

## Limitaciones y advertencias
- Una sola voz y un solo idioma: arabe estandar moderno. Los dialectos arabes no estan cubiertos y no hay soporte multilingue.
- La calidad depende del paso de diacritizacion: el texto sin tashkeel se vocaliza automaticamente y el modelo "es solo tan bueno como ese paso", en palabras del autor; aportar texto ya diacritizado produce mejores resultados.
- Dependencia de un front-end externo (normalizacion, camel-tools, espeak-ng) para el paso de texto a fonemas, lo que anade superficie de fallo y de licencias de terceros que conviene revisar antes de un uso comercial.
- Es necesario usar `load_model.py` y el paquete `kokoro_patched/`: la libreria Kokoro original no carga esta configuracion porque fija `hidden_channels` y `out_channels` a 1024/512 en lugar de los valores que necesita el modelo.
- No se han publicado metricas de calidad de sintesis (naturalidad, inteligibilidad, similitud con la voz objetivo) en la informacion disponible; el unico dato de rendimiento es de velocidad en CPU.
- No se documentan resultados de robustez ante texto ruidoso, numeros, abreviaturas, codigo mezclado con latin o nombres propios.
- Riesgo propio de un modelo de voz: puede emplearse para suplantacion o generacion de audio enganoso; al ser una unica voz publica y conocida, conviene etiquetar el audio generado.
- Licencia Apache 2.0 para los pesos, lo que en principio permite uso comercial, pero hay que verificar aparte las licencias de las dependencias del front-end y de cualquier dato de voz utilizado en el entrenamiento, que no se detalla en la model card.
- La fecha de publicacion de los metadatos de HuggingFace (septiembre de 2026) y la ausencia de documentacion adicional fuera del repositorio limitan la trazabilidad del entrenamiento.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/oddadmix/Nabra-7M-Distill
- Modelo profesor Nabra-82M-v0.1: https://huggingface.co/oddadmix/Nabra-82M-v0.1

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con sintesis de voz en arabe; los enlaces obtenidos correspondian a foros de alimentacion equina y se han descartado por no ser relevantes. No se han encontrado papers, blogs tecnicos, repositorios adicionales ni demos asociados al modelo en la informacion disponible.
