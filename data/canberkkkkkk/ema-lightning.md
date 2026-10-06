# canberkkkkkk/ema-lightning

## Resumen

EMA Lightning es un sistema de síntesis de voz (text-to-speech) en turco desarrollado por el usuario canberkkkkkk y publicado en HuggingFace bajo licencia Apache 2.0. Se compone de dos piezas: un modelo acústico de tipo DiT (Diffusion Transformer) de 5,6 millones de parámetros y un vocoder de 3 millones, lo que da un total de 8,6 millones de parámetros y unos 34 MB de pesos. El autor lo presenta como el sistema con menor tasa de error de palabra (WER) medido sobre el conjunto Freya-TR-Eval, con un 0,92 %, por delante de alternativas comerciales y de mayor tamaño.

El problema que aborda es el de la síntesis de voz turca con un coste computacional mínimo y sin dependencia de APIs externas: el modelo funciona íntegramente en local, tanto en GPU como en CPU, y no envía texto ni audio fuera de la máquina. Su arquitectura prioriza la latencia: el primer audio está disponible en 3,86 ms y el sistema genera a 440 veces el tiempo real en una RTX 4090, o 1.316 veces con procesamiento por lotes, según los datos de la model card.

Es relevante ahora porque combina tres factores poco habituales en TTS de calidad: tamaño muy reducido (apto para cualquier hardware), licencia permisiva para uso comercial y soporte nativo de streaming con un planificador propio (Playhead) que permite atender a múltiples llamadas concurrentes compartiendo una misma GPU. La información disponible no detalla el conjunto de datos de entrenamiento ni el paper asociado, más allá de la referencia arXiv:2405.14867 incluida entre las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo acustico DiT (Diffusion Transformer) + vocoder, con flow matching y generacion de latentes en 4 pasos |
| Parametros totales | 8,6 M (5,6 M modelo acustico DiT + 3,0 M vocoder) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (acepta cualquier texto; el streaming procesa el audio en fragmentos de 1 s y 4 s) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (tr) exclusivamente |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt): `ema.pt` y `decoder.pt` |
| Tamano de los pesos | Aproximadamente 34 MB |
| Frecuencias de muestreo | 48.000, 24.000, 16.000 y 8.000 Hz (48 kHz por defecto) |
| Velocidad de habla configurable | De 0,25x a 4x (1,0 por defecto) |
| Control de reproducibilidad | Semilla (`seed`) configurable; la misma semilla produce el mismo audio |
| Descargas en HuggingFace | 10 |
| Likes en HuggingFace | 12 |

## Arquitectura y entrenamiento

El pipeline descrito en la model card es el siguiente: el texto se codifica letra a letra y se coloca sobre una línea temporal palabra-letra mediante un predictor de duración; un alineador con ventana convierte esa representación en una condición por fotograma; un DiT genera los latentes en cuatro pasos; y finalmente un vocoder decodifica la señal a 48 kHz. El etiquetado del repositorio identifica la técnica de generación como flow matching. El sistema incorpora dos modos de uso: `say()`, que devuelve el audio completo (con soporte de listas procesadas en lotes compartidos), y `stream()`, que entrega el audio por fragmentos mientras el resto del texto todavía se está procesando.

En materia de rendimiento, el autor destaca una ruta rápida específica para GPU NVIDIA, `.lightning()`, que mide el mejor tamaño de lote para la GPU, compila el modelo, registra grafos CUDA y verifica su corrección frente a la ruta estándar. El planificador propio, denominado Playhead, permite que múltiples hilos compartan un único modelo y ejecuten su trabajo conjuntamente en la GPU. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generacion de voz en turco a partir de texto, con salida mono en float32 y frecuencias de muestreo de 48, 24, 16 u 8 kHz.
- Sintesis por lotes: `say()` acepta una lista de textos y devuelve un objeto `Speech` por cada uno, en orden, o los escribe como ficheros WAV en una carpeta.
- Streaming de audio en tiempo real: `stream()` emite fragmentos; el primer fragmento (un segundo de audio) está listo en unos 4 ms en GPU y el resto llega en bloques de cuatro segundos.
- Control de velocidad de habla entre 0,25x y 4x.
- Control de reproducibilidad mediante semilla.
- Concurrencia multi-hilo: múltiples llamadas simultáneas comparten el modelo y el planificador Playhead las ejecuta de forma conjunta en la GPU.
- Funcionamiento completamente offline, tanto en GPU como en CPU, sin claves de API.
- Normalización de texto mediante el frontend externo `normalizer-tr`, de Erdem Tuna (manejo de números, fechas y formatos, segun los ejemplos de la model card).
- No se documentan en la información disponible capacidades de clonación de voz, control de emociones, tool calling ni procesamiento multimodal.

## Casos de uso

- Atención telefónica automatizada: el modo `stream()` permite empezar a reproducir la respuesta mientras se sigue generando el texto, con una latencia de primer audio de 3,86 ms, adecuada para diálogos en vivo donde la espera perceptible debe ser mínima.
- Avisos y notificaciones transaccionales en turco: la model card incluye ejemplos explícitos de importes monetarios, fechas y horas, lo que encaja con la lectura de confirmaciones de pago, recordatorios de cita o estados de pedido.
- Generación de audiolibros y locuciones largas: `say()` acepta el texto completo y devuelve el audio o lo escribe a disco, con control de velocidad y una tasa de error de palabra del 0,92 % que reduce la necesidad de revisión manual.
- Asistentes de voz embebidos o en el borde: con 34 MB de pesos y ejecución en CPU, el modelo puede integrarse en aplicaciones de escritorio, dispositivos o entornos sin GPU ni conexión a internet.
- Servicios multiinquilino de conversión de texto a voz: el planificador Playhead permite atender varias peticiones concurrentes desde distintos hilos sobre una sola GPU, con una velocidad agregada de 1.316 veces el tiempo real en modo por lotes.
- Accesibilidad y lectura de contenidos: conversión de documentos, artículos o interfaces a voz turca sin enviar datos a servicios externos, lo que facilita el cumplimiento de requisitos de privacidad.
- Generación de voces para vídeo y publicidad: gracias a la baja latencia y al coste estimado de 0,0085 dólares por millón de caracteres en una RTX 4090 alquilada, resulta viable regenerar locuciones de forma iterativa durante la edición.
- Pruebas automatizadas de pipelines de voz: la semilla configurable permite generar audio reproducible en tests de regresión de aplicaciones que consumen TTS.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| WER en Freya-TR-Eval | 0,92 % | El autor afirma que es el valor mas bajo de todos los sistemas medidos, incluidos ElevenLabs v4, Gemini 3.8 y Trendyol-TTS (2,38 B de parametros) |
| Latencia hasta el primer audio | 3,86 ms | Medido en una RTX 4090 |
| Velocidad de generacion | 440x tiempo real | RTX 4090, sin lotes |
| Velocidad de generacion con lotes | 1.316x tiempo real | RTX 4090 |
| Latencia del primer fragmento en streaming | Aproximadamente 4 ms | Un segundo de audio, en GPU |
| Coste estimado | 0,0085 USD por millon de caracteres | Sobre una RTX 4090 alquilada |

No se han publicado en la información disponible resultados de benchmarks estandarizados de la categoria (MMLU, HumanEval, GSM8K u otros), ni las cifras concretas de WER de los sistemas de comparacion mencionados por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, dado que el conjunto de pesos ocupa aproximadamente 34 MB y el total es de 8,6 millones de parametros. La cifra exacta no esta disponible.
- GPU recomendadas: el autor proporciona mediciones sobre RTX 4090. Cualquier GPU NVIDIA compatible con CUDA deberia funcionar; no se especifican modelos concretos adicionales.
- Compatibilidad con GPU de consumo: si, practicamente cualquier GPU de consumo actual puede ejecutarlo, e incluso es viable en CPU.
- Ejecucion en CPU: soportada explicitamente, con el mismo comportamiento que en GPU pero a menor velocidad. No se publican cifras de rendimiento en CPU.
- Opciones de despliegue: paquete oficial de Python `pip install ema-lightning` (basado en PyTorch), con la ruta acelerada `.lightning()` para GPUs NVIDIA. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que en cualquier caso no aplican a un modelo de TTS de este tipo.
- Latencia y throughput: primer audio en 3,86 ms y 440x tiempo real en RTX 4090; 1.316x con procesamiento por lotes; primer fragmento de streaming en unos 4 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (WER en Freya-TR-Eval) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EMA Lightning | 8,6 M | No disponible | 0,92 % | Apache 2.0 | Pesos abiertos en HuggingFace y paquete PyPI |
| Trendyol-TTS | 2,38 B | No disponible | No disponible (solo se afirma que es superior al 0,92 %) | No disponible | No disponible |
| ElevenLabs v4 | No disponible | No disponible | No disponible (solo se afirma que es superior al 0,92 %) | Propietaria (API comercial) | Servicio en la nube |
| Gemini 3.8 | No disponible | No disponible | No disponible (solo se afirma que es superior al 0,92 %) | Propietaria (API comercial) | Servicio en la nube |

La model card unicamente afirma que EMA Lightning obtiene el WER mas bajo de todos los sistemas medidos, sin publicar los valores individuales de los competidores ni sus especificaciones tecnicas. Cualquier comparacion cuantitativa adicional se considera no disponible.

## Limitaciones y advertencias

- Cobertura linguistica limitada al turco: no se declaran capacidades en otros idiomas ni se documenta el comportamiento con texto en idiomas distintos.
- Ausencia de datos sobre entrenamiento: no se especifican el numero de tokens, la procedencia del dataset ni los procesos de alineacion o ajuste, lo que dificulta evaluar sesgos o cobertura de acentos y registros.
- Riesgo de alucinacion acustica: al ser un sistema generativo basado en flow matching y un DiT, puede producir pronunciaciones incorrectas en palabras poco frecuentes, nombres propios o texturas no vistas durante el entrenamiento. No se publican tasas de error especificas para estos casos.
- Dependencia del frontend de normalizacion: la lectura correcta de numeros, fechas y abreviaturas recae en `normalizer-tr`, un proyecto externo mantenido por otro autor, lo que introduce una dependencia de terceros en produccion.
- Madurez del repositorio: 10 descargas y 12 likes en el momento de la consulta, con un tamano de repositorio informado de 0,0 GB, lo que sugiere un proyecto muy reciente y con poca validacion externa.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias explicitas sobre los derechos de los datos de entrenamiento, que no se documentan.
- Ausencia de benchmarks independientes: los datos de rendimiento proceden de la propia model card y no se han verificado por terceros en la informacion disponible.
- Peticiones invalidas: segun la documentacion, cualquier texto se acepta y el texto nunca lanza errores; solo los ajustes invalidos (por ejemplo, una velocidad fuera del rango 0,25-4) provocan un `ValueError`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canberkkkkkk/ema-lightning
- Paquete en PyPI: https://pypi.org/project/ema-lightning/
- Repositorio GitHub: referenciado en la model card como "EMA Lightning on GitHub"; la URL no se explicitado en la informacion disponible
- Frontend de texto normalizer-tr (Erdem Tuna): https://github.com/erdemtuna/normalizer-tr
- Referencia arXiv incluida en las etiquetas del repositorio: arXiv:2405.14867 (no se dispone del titulo ni del contenido)
- Ejemplos de audio:
  - https://huggingface.co/canberkkkkkk/ema-lightning/resolve/main/assets/sample-1.wav
  - https://huggingface.co/canberkkkkkk/ema-lightning/resolve/main/assets/sample-2.wav
  - https://huggingface.co/canberkkkkkk/ema-lightning/resolve/main/assets/sample-3.wav
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos no guardan relacion con el tema.
