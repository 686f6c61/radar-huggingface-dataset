# elbruno/parakeet-tdt-0.6b-v3-onnx

## Resumen

Este repositorio no contiene un modelo nuevo, sino un paquete ONNX en INT8 del modelo de reconocimiento automático del habla **NVIDIA Parakeet TDT 0.6B v3**, preparado por Bruno Capuano (`elbruno`) para su uso desde la librería .NET ElBruno.Speech. El autor lo describe explícitamente como "una selección atribuida y byte a byte idéntica del export multilingüe v3 INT8 ya existente", es decir, no se ha reentrenado, ajustado ni recuantizado nada: los grafos, el vocabulario y la configuración son los del export original, y solo se han seleccionado los ficheros INT8 y añadido la model card, el manifiesto SHA-256 y las atribuciones.

El modelo subyacente es un sistema ASR de la familia NeMo Conformer con decodificador TDT (*Token-and-Duration Transducer*) de aproximadamente 600 millones de parámetros, capaz de transcribir automáticamente audio en 25 idiomas europeos (entre ellos español, inglés, francés, alemán, italiano, portugués, neerlandés, polaco, ruso y ucraniano). Su interés práctico está en que ofrece transcripción multilingüe en un paquete INT8 de unos 670 MB que se ejecuta en CPU mediante ONNX Runtime, sin necesidad de GPU ni de Python en tiempo de inferencia.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa ligera y desplegable en local para pipelines de transcripción; por otro, deja claro qué **no** ofrece este paquete frente al modelo original (no hay etiquetas de idioma expuestas, ni traducción, ni streaming incremental, ni intervalos a nivel de palabra) y que su validación se limita a pruebas de paridad en CPU Windows x64, sin mediciones independientes de WER.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer TDT (encoder Conformer + decodificador TDT, etiqueta `nemo-conformer-tdt`) |
| Parametros totales | 0,6 B (aproximadamente 600 millones, según el nombre del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como ventana de tokens; el audio se procesa en fragmentos independientes y acotados; resolución de frame del encoder de 80 ms |
| Tipos de cuantizacion | INT8 (única variante incluida en este repositorio) |
| Idiomas soportados | 25: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | CC BY 4.0 (pesos); la licencia MIT de la librería .NET no relicencia el modelo |
| Formato de pesos | ONNX (5 grafos: preprocesador, encoder, decoder, joiner y vocabulario) + manifiesto SHA-256; ~670,6 MB decimales; repositorio de 0,7 GB |
| Entrada de audio | mono, 16 kHz; el proveedor .NET acepta PCM16 little-endian en crudo o envuelto en WAV; el grafo de preprocesado recibe waveform en float32 |
| Runtime validado | ONNX Runtime CPU 1.31.0, decodificador TDT greedy, Windows x64, .NET 8/10 |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 (revisión upstream observada `541d1f99c6b0c3cd0b11a95167540bb8edefd82b`) |

## Arquitectura y entrenamiento

El modelo es un sistema ASR end-to-end de tipo transducer: un encoder Conformer (familia NeMo/FastConformer) procesa el audio y un decodificador TDT predice conjuntamente tokens y duraciones, lo que permite emitir texto sin un modelo de lenguaje externo y con alineamiento implícito. La decodificación usada en esta integración es greedy, y los inicios de token se derivan de los índices de frame nativos del encoder a 80 ms de resolución. El paquete incluye además un grafo de preprocesado que transforma la forma de onda float32 en las features de entrada; el autor advierte que usar solo los grafos de encoder y decoder no constituye un runtime ASR completo: hacen falta los cinco activos juntos.

No hay información sobre el entrenamiento en los materiales proporcionados: se desconoce el número de tokens, la composición del dataset, si hubo RLHF/DPO o qué técnicas de aumento de datos se aplicaron. Lo que sí se documenta es el proceso de conversión y cuantización: Ilya Stupakov realizó la exportación a ONNX y la cuantización INT8 con la referencia de `onnx-asr`, y el exportador no identifica el commit original de NVIDIA, por lo que el linaje exacto respecto al checkpoint de entrenamiento no se afirma más allá del modelo base declarado. Bruno Capuano solo seleccionó los ficheros INT8 y añadió la tarjeta, el manifiesto y las atribuciones.

## Capacidades

- Transcripción automática de voz a texto multilingüe en 25 idiomas europeos, con detección implícita del idioma (el modelo transcribe, pero no expone la etiqueta de idioma).
- Decodificación TDT greedy determinista sobre features acústicas, sin necesidad de un modelo de lenguaje separado.
- Marcas de tiempo de inicio de token a resolución de 80 ms, derivadas de los índices de frame del encoder.
- Procesamiento por lotes de grabaciones largas mediante fragmentación en bloques independientes y acotados.
- Entrada de audio mono a 16 kHz en PCM16 (crudo o WAV) a través del proveedor .NET; el grafo de preprocesado acepta float32.
- Inferencia en CPU con ONNX Runtime, sin dependencia de GPU ni de Python en tiempo de ejecución.
- Integración como proveedor opcional experimental dentro de ElBruno.Speech, que mantiene los valores por defecto de Whisper.
- No soporta: intervalos nativos a nivel de palabra o segmento, finales de token, campos de identificación de idioma, traducción, ni streaming acústico incremental.

## Casos de uso

- **Transcripción por lotes de archivos de audio en servidores sin GPU**: al ejecutarse en CPU con ONNX Runtime y ocupar unos 670 MB, el paquete puede procesar colas de grabaciones en máquinas modestas; la fragmentación en bloques acotados permite abordar audios largos con memoria controlada.
- **Subtitulado de vídeo con marcas de tiempo aproximadas**: los inicios de token a 80 ms sirven para generar subtítulos con granularidad de frase; el autor advierte explícitamente de que no se deben fabricar intervalos finos a partir de los bloques gruesos.
- **Aplicaciones de escritorio .NET con dictado o notas de voz**: el proveedor acepta PCM16 en crudo o WAV, lo que encaja con la captura de micrófono típica en Windows y evita montar un servicio aparte.
- **Transcripción de reuniones y llamadas multilingües**: los 25 idiomas cubiertos permiten un mismo despliegue para equipos europeos, concatenando fragmentos cuando la conversación mezcla idiomas (el autor validó un fixture mixto concatenado explícitamente).
- **Indexado y búsqueda sobre archivos de audio**: convertir horas de grabaciones en texto permite alimentar motores de búsqueda o sistemas RAG internos; la licencia CC BY 4.0 facilita el uso comercial con atribución.
- **Preprocesado de datasets de voz para investigación**: transcripciones automáticas de corpus en varios idiomas para filtrar, etiquetar o muestrear datos antes de un etiquetado humano.
- **Asistentes de voz con requisitos de privacidad**: al ejecutarse en local y sin llamadas a API externas, el audio no sale de la infraestructura del usuario, lo que resulta adecuado en entornos con restricciones de datos.
- **Generación de actas y resúmenes como paso previo**: la transcripción sirve de entrada a un LLM posterior; este paquete se limita a ASR y no incluye traducción ni resumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card lo indica de forma explícita: no se reclaman mediciones independientes de WER en podcasts ni de precisión de marcas de tiempo, y las pruebas realizadas son comprobaciones de paridad de implementación (texto y marcas de inicio idénticos a una implementación en Python con las mismas muestras PCM y ONNX Runtime 1.31.0), no referencias de precisión revisadas por humanos. Tampoco se incluyen grabaciones ni transcripciones de evaluación en el repositorio.

## Requisitos de hardware

- **VRAM/RAM**: no hay medición publicada. Como referencia de tamaño, el bundle completo son unos 670,6 MB decimales en INT8, por lo que el modelo debe residir holgadamente en torno a 1 GB de memoria, más el espacio de activaciones y del búfer de audio (estimación derivada del tamaño de los ficheros, no medida oficial).
- **GPU**: no se ha validado la ejecución en GPU para este proveedor. La validación documentada es CPU.
- **CPU y sistemas validados**: Windows x64 con ONNX Runtime CPU 1.31.0 y .NET 8/10. Linux, macOS, ARM y GPU no han sido validados.
- **¿Cabe en hardware de consumo?** Sí, por tamaño; cualquier equipo capaz de ejecutar ONNX Runtime en CPU puede cargarlo, aunque no se han publicado cifras de latencia.
- **Despliegue**: ONNX Runtime (CPU) como motor; el proveedor .NET de ElBruno.Speech; la utilidad `onnx-asr` (Python) solo para preparación y validación del bundle, no para la inferencia .NET. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR de este formato.
- **Latencia y throughput**: no disponibles. El repositorio de la librería menciona scripts de validación y "rendimiento smoke medido", pero no se incluyen cifras en la información proporcionada.
- **Reproducibilidad**: el autor recomienda fijar el commit inmutable del repositorio para descargas en producción, ya que cambiar la versión de ONNX Runtime puede alterar las predicciones de tokens INT8 y los tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| elbruno/parakeet-tdt-0.6b-v3-onnx (este) | 0,6 B | 25 | ONNX INT8, 5 grafos + manifiesto SHA-256 | CC BY 4.0 | Repackage byte a byte idéntico del export de istupakov; ~670,6 MB |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | 25 | no disponible en la informacion (formato NeMo propietario del framework) | CC BY 4.0 | Modelo oficial de NVIDIA; revisión upstream observada `541d1f9...` |
| istupakov/parakeet-tdt-0.6b-v3-onnx | 0,6 B | 25 | ONNX (export con cuantización INT8) | no indicada en la informacion; pesos derivados de NVIDIA (CC BY 4.0) | Export original del que procede este bundle, revisión `8f23f0c...` |
| Familia Whisper / faster-whisper | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | no disponible | Alternativa habitual de la misma categoría (ASR multilingüe); no se han verificado datos en esta búsqueda |

Las tres variantes Parakeet comparten arquitectura, vocabulario y pesos; la diferencia práctica es el formato (NeMo frente a ONNX) y el grado de empaquetado. Frente a la familia Whisper, el punto fuerte de este modelo es el tamaño reducido (0,6 B) y la ejecución en CPU, pero no se dispone de datos verificados de WER que permitan afirmar superioridad en precisión.

## Limitaciones y advertencias

- **No es un modelo nuevo ni ajustado**: cualquier mejora o regresión respecto al export original se debe al empaquetado o a la versión de ONNX Runtime, no a cambios en los pesos.
- **Sin evaluación de precisión independiente**: no hay WER medido en podcasts ni verificación humana de las transcripciones; las pruebas son de paridad entre implementaciones.
- **Sensibilidad a la versión del runtime**: cambiar la versión de ONNX Runtime puede modificar predicciones de tokens INT8 y los tiempos. Fijar versiones y commits es obligatorio en producción.
- **Cobertura de plataformas limitada**: solo Windows x64 en CPU está validado; Linux, macOS, ARM y GPU no lo están.
- **Cortes en los bordes de fragmento**: las grabaciones largas se procesan en bloques independientes, por lo que pueden perderse o duplicarse palabras en las fronteras.
- **Sin funcionalidades habituales de otros ASR**: no expone intervalos nativos de palabra o segmento, finales de token, etiqueta de idioma, traducción ni streaming incremental; el multilingüismo automático no implica una etiqueta de idioma disponible.
- **Riesgo de alucinación**: como todo modelo transducer entrenado con datos no documentados aquí, puede generar texto plausible en tramos de silencio, ruido o solapamiento de hablantes; conviene aplicar detección de voz y umbrales de confianza en producción.
- **Sesgos**: no hay información sobre la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos de acento, género o dialecto; la cobertura declarada es de 25 idiomas europeos, sin variedades no europeas.
- **Licencia**: CC BY 4.0 exige mantener la atribución, enlazar la licencia e indicar modificaciones; no implica respaldo de NVIDIA ni del autor del export. La licencia MIT de ElBruno.Speech no relicencia los pesos.
- **Proveedor experimental**: la integración es opcional y experimental, no una promesa de mejor alineación de subtítulos o precisión que Whisper; los valores por defecto de la librería siguen siendo los de Whisper.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/elbruno/parakeet-tdt-0.6b-v3-onnx
- Modelo base oficial: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Export ONNX de origen (revisión `8f23f0c03c8761650bdb5b40aaf3e40d2c15f1ce`): https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx/tree/8f23f0c03c8761650bdb5b40aaf3e40d2c15f1ce
- Herramienta de conversión y referencia de preprocesado `onnx-asr` (MIT): https://github.com/istupakov/onnx-asr
- Librería .NET ElBruno.Speech (proveedor, scripts de preparación y validación): https://github.com/elbruno/ElBruno.Speech
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
