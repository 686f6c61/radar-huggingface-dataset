# erayyapagci/balbal-v2e-calliope

## Resumen

balbal-v2e-calliope es un modelo experimental de reconocimiento automático del habla (ASR) especializado en griego antiguo, desarrollado por el autor independiente erayyapagci. Se trata de un ajuste fino del modelo balbal-v2-manas y representa, según su autor, el primer sistema ASR dedicado específicamente al griego antiguo politónico. El modelo emplea una arquitectura FastConformer-CTC con un refinador Transformer iterativo y una memoria de producto-clave, sumando 314 millones de parámetros, de los cuales 194 millones corresponden a la tabla de memoria.

La relevancia del modelo radica en dos factores. Primero, su entrenamiento se basa íntegramente en datos sintéticos: aproximadamente 940 horas de voz generada a partir de ediciones digitales de dominio público, sin ninguna grabación humana. Segundo, está diseñado para ejecutarse en CPU, alcanzando unas 59 veces la velocidad de tiempo real en 8 hilos incluyendo la decodificación KenLM. Esto lo hace accesible sin GPU para investigadores de filología clásica.

El modelo se distribuye en formato ONNX y PyTorch, con un decodificador KenLM de 6-gramas, y está pensado para transcribir lecturas de textos homéricos y prosa ática con una precisión sustancialmente superior a la de los grandes modelos multilingües como Omnilingual ASR o MMS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-CTC con refinador Transformer de 2 capas (3 pasadas) y memoria de producto-clave |
| Parametros totales | 314M (194M en la memoria de producto-clave) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | fragmentos de audio de 30 s (el audio más largo se trocea en bloques de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en fp32; grafo ONNX fp32) |
| Idiomas soportados | griego antiguo (grc) |
| Licencia | balbal Community License 1.1 |
| Formato de pesos | PyTorch (model.pt, state dict fp32, 1.3 GB) y ONNX (onnx/model.onnx, 1.3 GB) |
| Entrada de audio | 80 mel, submuestreo 4x, tramas de 40 ms |
| Vocabulario | SentencePiece de 3.068 piezas + blank CTC |
| Modelo de lenguaje | KenLM de 6-gramas sobre tokens (52 MB) |
| Tamano del repo | 2.6 GB |

## Arquitectura y entrenamiento

El componente acústico es un FastConformer-CTC que parte de balbal-v2-manas y se ajusta fino exclusivamente con voz sintética. Sobre la salida del codificador se aplica un refinador Transformer de 2 capas que opera en tres pasadas: cada pasada recibe como entrada la distribución CTC de la pasada anterior, refinando progresivamente la predicción. La memoria de producto-clave (1000×1000 subclaves, 8 cabezas, dimensión de valor 192) aporta 194M de parámetros, aunque solo se leen unas pocas filas por trama, lo que explica su viabilidad en CPU.

El entrenamiento utiliza aproximadamente 940 horas de voz sintética de griego antiguo, generada a partir de verso y prosa de dominio público mediante las ediciones digitales de la Perseus Digital Library (canonical-greekLit). No se emplearon grabaciones humanas en ninguna fase. La decodificación combina el modelo acústico con un KenLM de 6-gramas (peso 1.5, bonus de palabra 2.5, haz 64). La salida es griego politónico en minúsculas, con acentos y espíritus, timestamps por palabra y sin puntuación; toda sigma se escribe σ y las elisiones no llevan apóstrofo.

## Capacidades

- Transcripción de voz a texto en griego antiguo politónico (acentos y espíritus incluidos).
- Salida con timestamps por palabra, útil para alineación y subtitulado.
- Decodificación con KenLM de 6-gramas que mejora notablemente la precisión frente a la decodificación sin LM (42,79 % frente a 59,45 % de WER en el test Hypotactic Homer).
- Ejecución en CPU: unas 59 veces más rápida que tiempo real en 8 hilos de un AMD Ryzen AI Max+ 395, incluyendo la decodificación KenLM.
- Inferencia mediante ONNX Runtime con operadores estándar, con paridad de 0,1 puntos CER respecto a PyTorch.
- Procesamiento de audio por bloques de 30 s para grabaciones largas.
- Interfaz de línea de comandos y API Python a través del paquete `balbal` (versión 0.6.3 o superior).

## Casos de uso

- Digitalización de lecturas de Homero: transcripción de grabaciones de la Ilíada y la Odisea con pronunciación clásica reconstruida, aprovechando el ajuste específico sobre el test Hypotactic Homer y la salida con timestamps por palabra.
- Investigación filológica asistida: generación de transcripciones alineadas de recitaciones para estudios de métrica y prosodia, con la ventaja de ejecutarse en CPU en equipos de investigación sin GPU.
- Creación de corpus orales de griego antiguo: conversión masiva de lecturas de dominio público en texto politónico indexable, usando el modo JSON para conservar la alineación temporal.
- Docencia de griego clásico: transcripción de audios de clase o de materiales de pronunciación para generar apuntes y subtítulos, con la ventaja de funcionar en portátiles convencionales.
- Archivística y bibliotecas digitales: procesamiento de colecciones de audio histórico sobre textos griegos, desplegando el grafo ONNX en servidores sin acelerador dedicado.
- Integración en pipelines de humanidades digitales: uso de la API Python de `balbal` para encadenar la transcripción con herramientas de lematización o análisis morfológico, gracias a la salida limpia en minúsculas y sin puntuación.
- Prototipado de aplicaciones educativas: incorporación del modelo en aplicaciones de aprendizaje de pronunciación que necesiten retroalimentación textual en tiempo casi real sobre CPU.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER / CER en %, a nivel de corpus). Texto en minúsculas, sin puntuación ni marcas de elisión, con ς escrita como σ. El test Hypotactic Homer consta de 499 líneas (49 min) de la lectura de David Chamberlain (pronunciación clásica reconstruida, CC BY 4.0).

| Modelo | Parametros | Hypotactic Homer test | Hypotactic Homer test, sin acentos |
|---|---|---|---|
| balbal-v2e-calliope | 314M | 42,79 / 16,12 | 37,40 / 11,62 |
| balbal-v2e-calliope, sin LM | 314M | 59,45 / 20,81 | 53,44 / 15,33 |
| Omnilingual ASR LLM 7B v2 | 7B | 114,00 / 51,66 | 108,56 / 36,76 |
| Omnilingual ASR LLM 1B v2 | 1B | 118,93 / 55,84 | 114,76 / 41,16 |
| Omnilingual ASR CTC 1B v2 | 1B | 111,11 / 96,13 | 111,11 / 96,11 |
| MMS-1b-all (adaptador grc) | 1B | 115,56 / 56,00 | 111,65 / 39,64 |

Los pesos del decodificador KenLM se ajustaron únicamente sobre las líneas de validación Hypotactic. Los modelos comparativos se evaluaron con su inferencia por defecto.

## Requisitos de hardware

- Inferencia en CPU viable: aproximadamente 59 veces tiempo real en 8 hilos de un AMD Ryzen AI Max+ 395, incluyendo la decodificación KenLM.
- Pesos en fp32 de 1,3 GB (PyTorch y ONNX), por lo que el modelo cabe holgadamente en memoria RAM convencional.
- No requiere GPU; el autor no publica cifras de VRAM ni de rendimiento en GPU.
- Despliegue mediante el paquete `balbal` (CLI `balbal run` y API Python `balbal.load`) u ONNX Runtime con operadores estándar.
- No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR de este tipo).
- Latencia y throughput: solo se publica la cifra de velocidad relativa en CPU indicada; no hay datos de latencia por segmento ni de throughput en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| balbal-v2e-calliope | 314M | bloques de 30 s | grc | balbal Community License 1.1 | FastConformer-CTC especializado, entrenamiento 100 % sintético |
| Omnilingual ASR LLM 7B v2 | 7B | no disponible | multilingüe (incluye grc) | no disponible | LLM ASR multilingüe |
| Omnilingual ASR CTC 1B v2 | 1B | no disponible | multilingüe (incluye grc) | no disponible | CTC multilingüe |
| MMS-1b-all (adaptador grc) | 1B | no disponible | multilingüe con adaptadores | no disponible | CTC multilingüe con adaptadores por idioma |

En el test Hypotactic Homer, calliope obtiene 16,12 % de CER frente a 51,66-96,13 % de los modelos multilingües comparados, con un orden de magnitud menos de parámetros en varios casos. La comparación se limita a la tarea de lectura de Homero; no hay datos de otros dominios del griego antiguo.

## Limitaciones y advertencias

- Modelo experimental (la "e" de v2e significa experimental); el autor solicita retroalimentación y no lo presenta como listo para producción.
- El WER del 42,79 % sigue siendo alto en términos absolutos; la precisión depende fuertemente del dominio (lectura de Homero) y del uso del KenLM.
- Entrenamiento 100 % sintético: no se ha validado con grabaciones humanas diversas, por lo que puede degradarse ante acentos, ruido, micrófonos o estilos de lectura distintos de los sintetizados.
- Salida limitada: minúsculas, sin puntuación, sin apóstrofos de elisión y con toda sigma como σ, lo que exige postprocesado para textos editados.
- Audio troceado en bloques de 30 s, sin contexto entre bloques.
- Idioma único (grc); no soporta otros idiomas ni cambio de idioma.
- Licencia balbal Community License 1.1 (etiquetada como "other"): es necesario revisar el archivo LICENSE antes de cualquier uso comercial, ya que las condiciones no son las de una licencia estándar tipo Apache o MIT.
- Riesgo de alucinación del decodificador KenLM: el modelo de lenguaje puede forzar palabras plausibles en pasajes ruidosos o poco representados.
- No se han publicado análisis de sesgos ni evaluaciones fuera del test Hypotactic Homer.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erayyapagci/balbal-v2e-calliope
- Modelo base: https://huggingface.co/erayyapagci/balbal-v2-manas
- Página del proyecto: https://erayy.com/balbal/
- Código: https://github.com/erayyap/balbal
- Omnilingual ASR: https://github.com/facebookresearch/omnilingual-asr
- MMS-1b-all: https://huggingface.co/facebook/mms-1b-all
- Corpus de evaluación (lectura de Homero): https://hypotactic.com/my-reading-of-homer-work-in-progress/
- Perseus Digital Library (canonical-greekLit): https://github.com/PerseusDL/canonical-greekLit
