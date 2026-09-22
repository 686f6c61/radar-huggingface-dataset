# hvsr-robotics/Matcha-TTS-PL-noWL

## Resumen

Matcha-TTS-PL-noWL es un modelo de sintesis de voz (text-to-speech) en polaco desarrollado por hvsr-robotics. Se trata de una variante del modelo Matcha-TTS-PL entrenada deliberadamente sin el corpus Wolne Lektury, pensada para despliegues que deben evitar voces procedentes de actores de audiolibros. Mantiene la misma arquitectura que su modelo hermano: un modelo acustico Matcha-TTS de 20,8 millones de parametros basado en flow matching, con 625 filas de hablante y sin tokens de estilo, acompanado de un vocoder HiFi-GAN universal.

El modelo resuelve la sintesis multi-hablante en polaco en entornos con restricciones de recursos: su tamano reducido (0,6 GB de repositorio) permite inferencia en CPU y en GPUs de gama de entrada, y exporta a ONNX con 2 y 4 pasos ODE para reducir el coste de muestreo. El entrenamiento combina Multilingual LibriSpeech polaco (11 hablantes, 25 horas tras el limite de 8 horas por hablante), habla de YouTube polaca de YODAS (593 canales) y habla espontanea de AZON (21 voces), con un total de 44.000 lineas y 625 hablantes.

Es relevante ahora porque cubre un nicho poco atendido (TTS polaco multi-hablante, ligero y exportable a ONNX) y porque separa explicitamente los problemas de licencia del material audiovisual: la variante sin Wolne Lektury evita el uso de grabaciones de audiolibros, a costa de una calidad algo inferior (UTMOS aproximado de 3,0 a 3,2 frente a 3,3-3,5 del modelo con Wolne Lektury). La model card advierte ademas de que gran parte de las filas de hablante de YODAS tienen muy pocos clips de entrenamiento, por lo que deben tratarse como experimentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acustico no autoregresivo con flow matching) + vocoder HiFi-GAN universal; sin tokens de estilo |
| Parametros totales | 20,8 M (modelo acustico). Parametros del vocoder HiFi-GAN: no disponible |
| Longitud de contexto | No aplicable: modelo TTS no autoregresivo, sin ventana de contexto; la entrada es texto/fonemas |
| Tipos de cuantizacion | No disponible. El repositorio publica checkpoint Lightning (precision de entrenamiento, bf16) y exportaciones ONNX con 2 y 4 pasos ODE, no variantes cuantizadas |
| Idiomas soportados | Polaco (pl) unicamente |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch Lightning checkpoint (`final.ckpt`), ONNX (`matcha_nowl_t2.onnx`, `matcha_nowl_t4.onnx`), checkpoint HiFi-GAN (`g_02500000`) |
| Voces / hablantes | 625 filas de hablante (0-10 MLS, 11-603 canales YODAS, 604-624 AZON) |
| Frecuencia de muestreo | 22,05 kHz mono, normalizado por pico |
| Entradas ONNX | `x`, `x_lengths`, `scales`, `spks` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Matcha-TTS: un modelo acustico no autoregresivo basado en flow matching condicional que transforma ruido en mel-espectrogramas a partir de una secuencia de texto/fonemas, mas un vocoder HiFi-GAN universal que convierte el mel-espectrograma en audio. El condicionamiento de hablante se realiza mediante una tabla de 625 filas de embedding (`spks`), sin tokens de estilo. La exportacion ONNX permite elegir entre 2 y 4 pasos de integracion ODE (`t2` y `t4`), lo que reduce el numero de evaluaciones de funcion respecto a un muestreo mas denso. La model card no detalla el numero de capas, dimensiones internas ni mecanismo de atencion, por lo que esos datos se consideran no disponibles.

El entrenamiento se realizo en tres fases. Primero se prepararon los datos: MLS polaco (11 hablantes, tope de 8 horas por hablante, 25 horas) re-transcrito con Whisper large-v3 transfiriendo puntuacion y mayusculas sobre las palabras originales y corrigiendo una "j" omitida en un hablante; YODAS `pl000` filtrado con DNSMOS y con acuerdo de transcripcion entre dos modelos Whisper; y AZON tal cual. Todo a 22,05 kHz mono y normalizado por pico. Despues se pre-entreno sobre MLS partiendo de un warm start de VCTK (solo pesos): 60.000 pasos, seguidos de 10.000 pasos sobre el texto corregido por Whisper. Finalmente se ajusto sobre MLS + YODAS + AZON (625 hablantes, 44.000 lineas, balanceado por fuente) durante 13.800 pasos con Adam a 1e-4, batch de 64 y bf16. El checkpoint final corresponde a la epoca 19.

## Capacidades

- Sintesis de voz en polaco a partir de texto, con salida de audio a 22,05 kHz.
- Sintesis multi-hablante con 625 filas de hablante; se recomienda el hablante 0 (narrador MLS) o la mezcla `0.5*0 + 0.3*11 + 0.2*604`.
- Mezcla de voces mediante interpolacion de embeddings de hablante (la model card documenta la mezcla y reporta su UTMOS).
- Control de parametros de inferencia a traves de la entrada `scales` del modelo ONNX.
- Exportacion ONNX con 2 o 4 pasos ODE, apta para entornos de inferencia sin PyTorch.
- Integracion con el vocoder HiFi-GAN universal para la generacion de la forma de onda.
- No dispone de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio de entrada ni modo de razonamiento. Es un modelo exclusivamente de sintesis de voz.
- No es multilingue: solo polaco.

## Casos de uso

- Robotica social y asistencia fisica: el repositorio pertenece a hvsr-robotics, y un modelo de 20,8 M de parametros que corre en CPU o en GPU integrada permite dotar de voz polaca a robots con presupuesto de computo limitado, sin depender de servicios en la nube.
- Megafonia y anuncios automaticos: generacion de avisos de estaciones, aeropuertos o comercios en polaco, con la posibilidad de fijar una voz corporativa mediante una mezcla de embeddings de hablante.
- Accesibilidad para usuarios polacos: lectura en voz alta de documentos, articulos y pantallas para personas con discapacidad visual, ejecutable localmente y por tanto sin enviar el texto a terceros.
- Sistemas IVR y atencion telefonica: respuestas habladas en polaco en arboles de menu y confirmaciones, con sintesis rapida y determinista en 2 pasos ODE.
- Prototipado de doblaje y preproduccion audiovisual: generacion de voces de referencia en polaco para animaticos y maquetas antes de contratar locucion real, usando hablantes neutros y revelando que el audio es sintetico.
- Contenido educativo y e-learning: narracion de cursos y materiales formativos en polaco, eligiendo voces distintas por modulo para diferenciar secciones.
- Generacion de datos sinteticos para ASR: produccion de audio polaco etiquetado a partir de texto para aumentar corpus de entrenamiento de reconocimiento de voz, teniendo en cuenta que las condiciones de licencia CC BY-SA 4.0 se propagan a la obra derivada.
- Evitar material de audiolibros: cualquier despliegue donde el uso de voces derivadas de grabaciones de audiolibros con derechos o con condiciones no verificadas sea un riesgo; esta es la razon de ser de la variante `noWL`.
- Pruebas automatizadas de pipelines de voz: verificacion en CI/CD de cadenas de texto a voz, ya que el ONNX y sus dos configuraciones de pasos ODE permiten pruebas rapidas y reproducibles.

## Benchmarks y rendimiento

La model card publica una evaluacion sobre 10 frases conversacionales de prueba. No se han encontrado otros resultados de benchmarks en la informacion disponible, y la busqueda web realizada no devolvio material tecnico relevante sobre el modelo.

| Voz | n | WER | CER | UTMOS | Dispersion de F0 [st] | Caracteres/s | Silencio % |
|---|---|---|---|---|---|---|---|
| spk0 (narrador MLS) | 10 | 0,058 | 0,025 | 3,11 | 1,65 | 11,3 | 11 |
| spk11 (YODAS) | 10 | 0,058 | 0,067 | 2,98 | 1,97 | 13,4 | 6 |
| spk604 (AZON) | 10 | 0,070 | 0,076 | 2,99 | 1,28 | 13,7 | 5 |
| mix0 (0,5·0 + 0,3·11 + 0,2·604) | 10 | 0,058 | 0,071 | 3,16 | 2,27 | 12,3 | 11 |

La calidad global declarada por el autor es de UTMOS aproximado 3,0-3,2, inferior a la del modelo con Wolne Lektury (3,3-3,5), atribuida a que las grabaciones de origen son audio comprimido a 16 kHz. La columna de caracteres por segundo refleja el ritmo de habla del audio generado, no el throughput de inferencia. No se documentan diferencias de calidad entre las exportaciones de 2 y 4 pasos ODE.

## Requisitos de hardware

- VRAM estimada: a partir de los 20,8 M de parametros del modelo acustico, la carga en fp32 es de aproximadamente 83 MB y en bf16/fp16 de aproximadamente 42 MB. El vocoder HiFi-GAN anade un consumo adicional cuyo tamano exacto no se especifica en la model card. En total, el conjunto cabe holgadamente por debajo de 1 GB incluyendo runtime y activaciones, aunque esta cifra es una estimacion derivada del recuento de parametros y no un dato publicado.
- GPU recomendadas: no se publican requisitos oficiales. Por tamano, cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se necesita A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en GPU integradas. La exportacion ONNX permite ademas ejecucion en CPU.
- Opciones de despliegue: libreria `matcha-tts`, ONNX Runtime para los ficheros `matcha_nowl_t2.onnx` y `matcha_nowl_t4.onnx`, checkpoint Lightning `final.ckpt` con PyTorch, y la interfaz `tts-pl-playground` (repositorio de machinekind) para pruebas manuales.
- Latencia y throughput: no disponibles. El unico dato indirecto es la existencia de exportaciones a 2 y 4 pasos ODE, que reducen el numero de evaluaciones del modelo acustico respecto a configuraciones de mas pasos, pero no se publican mediciones de tiempo.
- Almacenamiento: el repositorio ocupa 0,6 GB, incluyendo checkpoints, exportaciones ONNX, vocoder y muestras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / hablantes | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Matcha-TTS-PL-noWL | 20,8 M (acustico) | TTS; 625 hablantes; sin tokens de estilo | UTMOS 3,0-3,2; WER 0,058-0,070; CER 0,025-0,076 en 10 frases | CC BY-SA 4.0 | HuggingFace, ONNX y checkpoint |
| Matcha-TTS-PL (modelo hermano, con Wolne Lektury) | 20,8 M (misma arquitectura, segun la model card) | TTS; misma tabla de hablantes | UTMOS 3,3-3,5 | No disponible en la informacion proporcionada | HuggingFace |
| Otras alternativas de TTS en polaco (p. ej. Piper, XTTS-v2) | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion con datos verificables es frente al modelo hermano `Matcha-TTS-PL`, del que este se presenta como version companion. La diferencia declarada es de calidad (UTMOS 3,0-3,2 frente a 3,3-3,5) a cambio de no emplear material de audiolibros. No se dispone de datos comparativos con otras familias de TTS polaco en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad inferior al modelo con Wolne Lektury (UTMOS 3,0-3,2 frente a 3,3-3,5), atribuida a que las grabaciones de origen son audio comprimido a 16 kHz.
- La mayoria de las filas de hablante de YODAS (identificadores 11-603) tienen muy pocos clips de entrenamiento; el propio autor indica que deben tratarse como experimentales.
- Riesgo de errores de pronunciacion y omisiones: se miden WER de 0,058-0,070 y CER de 0,025-0,076 sobre solo 10 frases, una muestra muy reducida para extrapolar a produccion.
- Sesgos: el modelo se entrena con voces de LibriVox, canales de YouTube y habla espontanea de AZON, sin que se documente ninguna evaluacion de sesgos de edad, genero, acento o procedencia. La seleccion de voces puede reproducir desequilibrios de esas fuentes.
- Licencia CC BY-SA 4.0 en los pesos: es una licencia copyleft con atribucion y compartir igual, lo que impone obligaciones sobre las obras derivadas.
- Riesgo legal en la procedencia de los datos: las licencias de YODAS se apoyan en las declaraciones CC BY de los propios subidores de YouTube tal como las recopilaron los autores de YODAS; la model card recomienda verificar antes de un uso comercial. La atribucion a los 894 canales de YouTube esta en `ATTRIBUTION.md`.
- Mezcla de licencias en los datos de entrenamiento: AZON es CC BY-SA 4.0, MLS es CC BY 4.0 y YODAS es CC BY 3.0; el warm start `matcha_vctk.ckpt` es MIT (VCTK CC BY 4.0) y el vocoder HiFi-GAN universal es MIT.
- Las voces son atributos personales: el autor recomienda usar voces mezcladas con nombres neutros y revelar a los oyentes que el audio es sintetico.
- Limitacion idiomatica: solo polaco. No hay soporte multilingue ni cambio de idioma.
- Sin tokens de estilo: no se puede controlar emocion, tono o estilo de forma explicita, solo la identidad de hablante y los parametros expuestos en `scales`.
- Sin datos publicados de latencia, throughput ni consumo real en produccion, lo que obliga a medir en el entorno objetivo antes de desplegar.
- Uso dual: una voz sintetica clonable o mezclable puede emplearse para suplantacion o desinformacion; se recomienda etiquetar el audio generado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hvsr-robotics/Matcha-TTS-PL-noWL
- Modelo companion (con Wolne Lektury): https://huggingface.co/hvsr-robotics/Matcha-TTS-PL
- Interfaz y herramientas `tts-pl-playground`: https://github.com/machinekind/tts-pl-playground
- Ficheros del repositorio: `RECIPE.md` (receta y protocolo de evaluacion, secciones 1, 5 y 6), `ATTRIBUTION.md` (atribucion a los 894 canales de YouTube), `LICENSE`, `data_v2/mix_nowl/speaker_map.json` (mapa de hablantes), `samples/`
- Papers, blogs o demos adicionales: no disponible; la busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo.
