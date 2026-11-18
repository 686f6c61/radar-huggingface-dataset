# BharathYedla/PedzSTAR-AVD-WavLM

## Resumen

PedzSTAR-AVD-WavLM es un modelo de deteccion de actividad de voz (voice activity detection, VAD) especializado en audio infantil, desarrollado por BharathYedla y publicado en Hugging Face bajo el identificador `BharathYedla/PedzSTAR-AVD-WavLM`. Se construye mediante fine-tuning del modelo preentrenado `microsoft/wavlm-base-plus`, un encoder convolucional y transformer para representaciones de habla. El modelo resuelve la tarea de clasificar segmentos de audio como voz o no voz, con enfasis declarado en voces infantiles y deteccion de voz adulta, segun los tags del repositorio.

La relevancia del modelo radica en su especializacion: la mayoria de sistemas VAD comerciales y academicos estan optimizados para voz adulta, lo que degrada su rendimiento en corpus infantiles usados en investigacion de adquisicion del lenguaje, diagnostico de trastornos del habla o analisis de interacciones familiares. PedzSTAR-AVD-WavLM se presenta como una alternativa afinada especificamente para ese dominio.

El repositorio tiene un tamano de 2.3 GB, esta implementado en la libreria `transformers` con pesos en formato `safetensors` y su pipeline declarado es `voice-activity-detection`. Es un modelo de acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargarlo. No dispone de descargas ni likes en el momento de la consulta y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WavLM (encoder convolucional + transformer sobre formas de onda crudas), fine-tuning de `microsoft/wavlm-base-plus` |
| Parametros totales | no disponible (el modelo base WavLM-Base+ ronda los 94,7 M, pero el dato del checkpoint afinado no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de atencion relativa de WavLM; no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-sa-3.0 |
| Formato de pesos | safetensors |
| Pipeline | voice-activity-detection |
| Acceso | restringido (gated) |
| Tamano del repositorio | 2,3 GB |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/wavlm-base-plus`, un encoder disenado para representaciones de habla que combina un front-end convolucional que opera directamente sobre la forma de onda con un backbone transformer con atencion relativa y enmascaramiento estructurado, lo que le permite manejar secuencias de audio de duracion variable sin un tokenizador discreto. El fine-tuning de BharathYedla anade una cabeza de clasificacion para la tarea de deteccion de actividad de voz, con enfasis en voz infantil y deteccion de voz adulta segun los tags del repositorio.

No se dispone de informacion sobre el corpus de entrenamiento, el numero de horas de audio, la composicion del dataset, ni sobre si se aplicaron tecnicas de aumento de datos, balanceo de clases o entrenamiento con perdidas especificas para VAD. Tampoco se documenta si se uso RLHF, DPO u otra fase de alineacion, algo por otra parte poco habitual en tareas de clasificacion de audio. La innovacion tecnica atribuible es la especializacion en dominio infantil sobre un backbone WavLM estandar; no se declaran mecanismos adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Deteccion de actividad de voz (VAD) sobre formas de onda de audio: clasifica segmentos como voz o no voz.
- Enfasis declarado en voz infantil y deteccion de voz adulta, lo que permite distinguir interlocutores por grupo etario en grabaciones familiares o educativas.
- Procesamiento de audio en ingles (`en`), con un pipeline nativo en `transformers` (`voice-activity-detection`).
- Integracion con el ecosistema `transformers` y `safetensors`, lo que facilita su carga con `AutoModelForAudioClassification` y su uso en pipelines de inferencia.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere despliegue en Inference Endpoints de Hugging Face.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes o modo de razonamiento extendido; es un modelo discriminativo de audio, no un LLM.

## Casos de uso

- Segmentacion de audio en corpus infantiles de investigacion: el modelo permite recortar automaticamente las regiones con voz infantil en grabaciones de sesiones con ninos, reduciendo el trabajo manual de anotacion en estudios de adquisicion del lenguaje. Su fine-tuning especifico en voz infantil lo hace mas adecuado que un VAD generico en este dominio.
- Analisis de interacciones familiares o de aula: al distinguir voz infantil de voz adulta, permite cuantificar turnos de habla por grupo etario en grabaciones de comidas familiares, clases o sesiones de juego, un analisis dificil de automatizar con VAD estandar.
- Preprocesado para pipelines de reconocimiento automatico del habla (ASR) infantil: actua como etapa de filtrado que elimina silencios y ruido antes de pasar el audio a un ASR, mejorando la eficiencia computacional y reduciendo falsos positivos en sistemas de transcripcion de habla infantil.
- Deteccion de presencia de voz en dispositivos de asistencia o juguetes interactivos dirigidos a ninos: el modelo puede ejecutarse en local para activar la grabacion solo cuando hay voz, ahorrando energia y reduciendo el procesamiento de audio no relevante.
- Investigacion en trastornos del habla infantil: la deteccion robusta de actividad de voz permite aislar segmentos vocalizados en grabaciones clinicas de ninos con dificultades del habla, facilitando analisis posteriores de duracion, pausas y turnos.
- Monitorizacion de calidad de audio en entornos educativos: al clasificar segmentos con voz frente a ruido de fondo, permite evaluar la inteligibilidad de grabaciones de aula y decidir que tramos requieren limpieza o re-grabacion.
- Etiquetado semiautomatico de datasets de audio infantil: el modelo puede generar etiquetas preliminares de voz/no voz que luego se revisan manualmente, acelerando la construccion de corpus anotados para entrenar otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un backbone WavLM-Base+ ronda los 95 M de parametros, lo que en precision fp32 ocupa aproximadamente 0,4 GB y en fp16 unos 0,2 GB; sin embargo, el checkpoint afinado y su cabecera no se detallan.
- GPU recomendadas: no disponible. Por tamano del backbone, el modelo es probable que quepa en GPUs consumer como RTX 3060, RTX 4060 o superiores, pero no se confirma en la ficha.
- Cabe en GPU consumer: probablemente si, dado el tamano del modelo base, aunque no se especifica.
- Opciones de despliegue: `transformers` (pipeline `voice-activity-detection`), Hugging Face Inference Endpoints (tag `endpoints_compatible`). No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI, que estan orientados a LLMs y no a clasificacion de audio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PedzSTAR-AVD-WavLM | no disponible (base WavLM-Base+ ~95 M) | no disponible | VAD con enfasis en voz infantil | cc-by-sa-3.0 | gated en Hugging Face |
| microsoft/wavlm-base-plus | ~94,7 M | no disponible | Representaciones de habla (base para fine-tuning) | MIT (segun el modelo original; verificar) | publico en Hugging Face |
| Silero VAD | no disponible | no disponible | VAD generico multilingue | MIT | publico en repositorios de Silero |
| pyannote/segmentation | no disponible | no disponible | Segmentacion de hablantes y VAD | MIT (con condiciones) | publico en Hugging Face |

La comparativa se limita a alternativas genericas de VAD y al modelo base, ya que no se dispone de resultados de benchmarks que permitan una comparacion cuantitativa. La principal diferencia de PedzSTAR-AVD-WavLM es su especializacion declarada en voz infantil, frente al enfoque generico de Silero VAD o pyannote.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face antes de su descarga, lo que anade friccion a su uso en produccion y en pipelines automatizados.
- Licencia cc-by-sa-3.0: permite uso comercial con atribucion, pero impone compartir bajo la misma licencia las obras derivadas, lo que puede ser incompatible con productos propietarios que no quieran liberar su codigo o pesos.
- Solo ingles: el modelo declara soporte unicamente para `en`, por lo que su uso en castellano u otros idiomas no esta respaldado por la ficha.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en VAD infantil ni comparacion con alternativas, lo que dificulta evaluar su calidad real.
- Riesgo de sesgo de dominio: al estar afinado en un corpus no documentado, puede generalizar mal a acentos, edades, calidades de grabacion o entornos acusticos distintos de los de entrenamiento.
- Riesgo de falsos positivos y negativos en VAD: como todo clasificador de audio, puede confundir ruido de fondo con voz o viceversa, especialmente en grabaciones con musica, television o ruido de juguetes.
- Documentacion escasa: no se detallan datos de entrenamiento, hiperparametros, metricas ni limitaciones conocidas, lo que reduce la trazabilidad y la confianza para uso en produccion.
- Sin descargas ni likes: el repositorio no tiene traccion comunitaria, por lo que no hay evidencia de uso en produccion ni reportes de terceros.
- Fecha de creacion futura (2026-11-12) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BharathYedla/PedzSTAR-AVD-WavLM
- Modelo base: https://huggingface.co/microsoft/wavlm-base-plus
- Paper de WavLM: https://arxiv.org/abs/2110.13900
- Repositorio oficial de WavLM (Microsoft): https://github.com/microsoft/unilm/tree/master/wavlm
- Documentacion de `transformers` para audio: https://huggingface.co/docs/transformers/main/en/tasks/audio_classification
