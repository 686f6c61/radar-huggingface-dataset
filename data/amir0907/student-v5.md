# amir0907/student-v5

## Resumen

Student-v5 es la quinta iteración del "módulo quirúrgico de emoción" (surgical emotion module) desarrollado por el usuario amir0907, un adaptador ligero diseñado para extraer representaciones de emoción a nivel de fotograma a partir de audio de voz. El modelo no es un LLM generativo ni un sistema de reconocimiento de voz completo: es un componente especializado que se apoya en el backbone congelado emotion2vec_plus_base (de FunASR) y añade un adaptador de 3,18 millones de parámetros que produce embeddings, probabilidades de emoción e intensidad emocional a una tasa fija de 6,25 Hz (un fotograma cada 160 ms), exactamente un fotograma por token del LLM de dots.tts.

La relevancia de esta versión radica en la incorporación de supervisión débil a partir de etiquetas de intensidad que ya existían en los corpus de entrenamiento (RAVDESS y CREMA-D) pero que no se habían explotado en versiones anteriores. El autor documenta que el proxy de intensidad sin etiquetas de v4 tenía un techo estructural (Cohen-d de 0,23 en la separación normal/fuerte de RAVDESS) y que v5 lo supera (Cohen-d de 0,34) mediante una pérdida de ranking por márgenes sobre pares de utterances etiquetadas.

El modelo está pensado como parte de un proyecto de traducción voz-a-voz (S2ST): sus embeddings de fotograma alimentan la condicionalidad temporal por token de dots.tts. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los pesos no están publicados o el repo está vacío.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer congelado emotion2vec_plus_base (FunASR) + adaptador de 3,18 M de parámetros |
| Parametros totales | No disponible (backbone congelado; adaptador: 3,18 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio; tasa de fotograma fija de 6,25 Hz) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (entrenado con RAVDESS en inglés y un clip en chino; ESD incluye hablantes chinos) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint PyTorch (`surgical_emotion_module.pt`); backbone en formato FunASR |

## Arquitectura y entrenamiento

El modelo sigue un esquema de destilación con backbone congelado: emotion2vec_plus_base actúa como profesor y el adaptador de 3,18 M de parámetros se entrena para reproducir sus representaciones a una tasa reducida de 6,25 Hz (frente a los hasta 50 Hz del profesor). El adaptador mantiene la misma interfaz que las versiones v1 a v4 y añade una salida de intensidad absoluta por fotograma, con una compuerta de saliencia (salience-gated absolute-energy intensity target) y pérdidas de correlación y desviación estándar.

La innovación de v5 es la supervisión débil a partir de etiquetas de intensidad presentes en los nombres de fichero de los corpus: RAVDESS (campo 4: `01`=normal, `02`=fuerte) y CREMA-D (sufijo: `LO`=0,0, `MD`=0,5, `HI`=1,0), lo que aporta 3.941 utterances etiquetadas de un pool de 50.618. Se aplica una pérdida de ranking por márgenes pairwise sobre la intensidad media de la utterance (margen 0,10, término invariante a desplazamientos para no interferir con la destilación a nivel de fotograma), con la mitad de los batches muestreados del subconjunto etiquetado. El entrenamiento usa 4.000 pasos de AdamW, batch de 8, fp16, en una única T4 durante aproximadamente 14 minutos. Los datos de entrenamiento combinan RAVDESS (CC BY-NC-SA), CREMA-D, TESS y ESD.

## Capacidades

- Extracción de embeddings de emoción a nivel de fotograma (768 dimensiones) a 6,25 Hz exactos, con contrato de tasa verificado para entradas de 1, 2,5, 5 y 10 segundos.
- Clasificación de emoción a nivel de fotograma y de utterance (9 clases: probabilidades `frame_probs` y `utt_probs`).
- Estimación de intensidad emocional absoluta por fotograma (`frame_intensity`), con dinámica temporal (desviación estándar de la curva de 0,171).
- Condicionalidad temporal por token para TTS: un fotograma de emoción por token del LLM de dots.tts.
- Reconocimiento de emoción en voz cantada además de voz hablada (RAVDESS speech+song).
- Capacidad multilingüe limitada: inglés (RAVDESS, CREMA-D, TESS) y chino (ESD, clip zh de FunASR).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo.

## Casos de uso

- Traducción voz-a-voz con prosodia emocional preservada: los `frame_embs` a 6,25 Hz se inyectan como condicionalidad por token en dots.tts, de modo que la emoción del hablante origen modula la síntesis destino. Es el caso de uso principal declarado por el autor.
- Síntesis de voz expresiva controlada: usar `frame_intensity` y `utt_probs` para seleccionar o modular el estilo de un TTS (normal frente a fuerte) en aplicaciones de doblaje o audiolibros.
- Análisis de emoción en grabaciones de voz para investigación en psicología o lingüística: la salida por fotograma permite estudiar la dinámica temporal de la emoción dentro de una utterance, no solo la etiqueta global.
- Moderación de contenido en audio: detectar intensidad emocional elevada o emociones negativas en llamadas o mensajes de voz como señal auxiliar en pipelines de revisión.
- Anotación automática de corpus de voz: generar etiquetas de emoción e intensidad a nivel de fotograma para preanotar datasets de habla antes de la revisión humana.
- Evaluación de sistemas TTS: comparar la curva de intensidad y las probabilidades de emoción del audio sintetizado frente al audio de referencia para medir fidelidad emocional.
- Investigación en voz cantada: al cubrir RAVDESS song, puede emplearse para analizar la expresión emocional en canto, un dominio con menos herramientas disponibles.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre entradas held-out idénticas (actores 19-24 de RAVDESS más un clip en chino) frente al profesor congelado:

| Metrica | v1 | v2 | v4 | v5 |
|---|---|---|---|---|
| Acuerdo top-1 | 100 % | 100 % | 100 % | 100 % |
| Divergencia JS media (menor mejor) | 0,00035 | 0,00022 | 0,00044 | 0,00067 |
| Coseno a nivel de fotograma (hasta 50 Hz) | 0,99524 | 0,99572 | 0,99198 | 0,99294 |
| Correlación de intensidad | 0,237 | 0,239 | 0,594 | 0,629 |
| Desviación estándar de la curva de intensidad | 0,030 | 0,035 | 0,183 | 0,171 |
| Diferencia de intensidad media normal(01) vs fuerte(02) | +0,021 | +0,027 | +0,047 | +0,063 |
| Cohen-d de intensidad (336 ficheros emocionales) | 0,57 | 0,66 | 0,26 | 0,34 |
| Cohen-d del propio target (techo) | — | — | 0,23 | 0,34 (techo superado) |
| Spearman LO/MD/HI de CREMA-D (en entrenamiento) | 0,30 | 0,33 | 0,29 | 0,32 |
| strong > normal por emoción | — | — | — | 5/7 |

El autor señala que las mayores ganancias por emoción son en happy (+0,18) y sad (+0,20), mientras que calm y surprised se mantienen cerca de 0. La correlación de Spearman en CREMA-D se mantiene plana en torno a 0,3 en todas las versiones, atribuido a la subjetividad de las etiquetas LO/MD/HI y a su confusión con el nivel de grabación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el adaptador tiene 3,18 M de parámetros (unos 13 MB en fp16), pero requiere cargar el backbone emotion2vec_plus_base congelado, cuyo tamaño no se detalla en la información disponible.
- GPU recomendadas: el autor entrenó en una única NVIDIA T4 (~14 minutos, 4.000 pasos, batch 8, fp16), lo que indica que la inferencia cabe holgadamente en GPUs de gama media.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con suficiente VRAM para el backbone (no cuantificada); el adaptador por sí solo es trivial.
- Opciones de despliegue: uso directo vía `SurgicalEmotionEncoder` del módulo `code.surgical_emotion` con PyTorch y el backbone en formato FunASR; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de componente).
- Latencia: el adaptador añade aproximadamente 2,7 ms de overhead según el autor; no se reporta throughput global.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Tasa de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| student-v5 (amir0907) | Adaptador sobre emotion2vec_plus_base | 3,18 M (adaptador) | 6,25 Hz | Apache-2.0 (pesos); datos de entrenamiento CC BY-NC-SA | HuggingFace, repo de 0,0 GB |
| emotion2vec_plus_base (FunASR) | Modelo de representación de voz | No disponible | Hasta 50 Hz | Apache-2.0 | Público en FunASR |
| Versiones previas student v1-v4 | Adaptadores sobre el mismo backbone | 3,18 M (adaptador) | 6,25 Hz | Apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks de modelos comparables independientes en la información proporcionada; la única comparación disponible es la del propio autor entre versiones de su módulo.

## Limitaciones y advertencias

- El repositorio tiene 0,0 GB de tamaño y 0 descargas, lo que sugiere que los pesos pueden no estar efectivamente publicados; conviene verificar antes de depender de él.
- La destilación se realizó sobre RAVDESS (CC BY-NC-SA 4.0), CREMA-D, TESS y ESD; el autor advierte explícitamente de mantener uso no comercial o re-destilar sobre habla con licencia permisiva. La licencia Apache-2.0 del repo no cubre automáticamente los datos de entrenamiento.
- El audio de demostración de RAVDESS es CC BY-NC-SA 4.0 (uso no comercial); solo el clip en chino es MIT.
- Las etiquetas de intensidad de CREMA-D son subjetivas y parcialmente confundidas con el nivel de grabación, lo que limita la calidad de la supervisión y explica el Spearman plano (~0,3).
- Las emociones calm y surprised no muestran separación strong/normal apreciable (5/7 emociones sí la muestran), por lo que la estimación de intensidad en esas clases es poco fiable.
- Cobertura idiomática limitada a inglés y chino en los datos; no hay evaluación en castellano ni en otras lenguas.
- No es un modelo generativo: no puede usarse para diálogo, código, razonamiento ni tool calling; su utilidad es exclusivamente como extractor de representaciones emocionales.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de componente.

## Enlaces

- HuggingFace: https://huggingface.co/amir0907/student-v5
- Versión v1: https://huggingface.co/amir0907/student
- Versión v2: https://huggingface.co/amir0907/student-v2
- Versión v3: https://huggingface.co/amir0907/student-v3
- Versión v4: https://huggingface.co/amir0907/student-v4
- Backbone emotion2vec_plus_base (FunASR): no disponible como enlace directo en la información proporcionada
- Referencia del corpus RAVDESS: Livingstone & Russo 2018 (CC BY-NC-SA 4.0), sin URL en la información proporcionada
