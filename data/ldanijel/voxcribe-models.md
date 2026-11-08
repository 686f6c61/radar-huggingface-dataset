# ldanijel/voxcribe-models

## Resumen

Voxcribe models es una coleccion de conversiones al formato GGML/whisper.cpp del modelo GoranS/whisper-large-v3-turbo-hr-parla, un ajuste fino de OpenAI Whisper large-v3-turbo especializado en croata, bosnio y serbio. El autor, ldanijel, publica estos pesos para su uso dentro de la aplicacion de transcripcion offline Voxcribe. No se trata de un modelo nuevo entrenado desde cero, sino de una distribucion empaquetada para inferencia local eficiente.

El modelo base parte de la arquitectura encoder-decoder transformer de Whisper large-v3-turbo (aproximadamente 809 millones de parametros, con 4 capas en el decoder frente a las 32 del large-v3 original). El ajuste fino conserva el vocabulario y los filtros mel del whisper-large-v3-turbo original, de modo que la unica diferencia respecto al modelo de OpenAI es la adaptacion linguistica al croata, bosnio y serbio.

Su relevancia actual reside en que ofrece una alternativa ligera y ejecutable en CPU mediante whisper.cpp para lenguas del grupo serbocroata, con licencia Apache 2.0 y dos variantes de cuantizacion (f16 y q5_0). La model card documenta una mejora medible en word error rate frente al large-v3-turbo generico en segmentos cortos: 11,5 % frente a 18,0 % en croata y 12,5 % frente a 14,3 % en bosnio sobre 15 fragmentos de test de FLEURS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | no disponible (el modelo base Whisper large-v3-turbo tiene ~809 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de 30 s de audio (arquitectura Whisper) |
| Tipos de cuantizacion | f16 y q5_0 |
| Idiomas soportados | croata (hr), bosnio (bs), serbio (sr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML binario para whisper.cpp (`.bin`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper large-v3-turbo: un encoder de audio que procesa espectrogramas mel y un decoder autorregresivo reducido a 4 capas, lo que rebaja el coste computacional respecto al large-v3 completo manteniendo la calidad de transcripcion. Los pesos publicados en este repositorio no modifican el modelo salvo la conversion de formato a GGML y, en el caso del archivo q5_0, la cuantizacion a 5 bits. El tokenizer y los filtros mel son los de `ggml-large-v3-turbo` de ggerganov/whisper.cpp, ya que el ajuste fino conserva el vocabulario original.

El ajuste fino original de GoranS se realizo sobre el checkpoint `whisper-large-v3-turbo-hr-parla` (revision `3247238374e3d81f55b1451a105294b306e093bd`). No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Un detalle tecnico relevante documentado por el autor es que el ajuste fino no fue entrenado con marcas de tiempo, lo que provoca que en audio largo whisper.cpp omita partes significativas de cada ventana de 30 s.

## Capacidades

- Transcripcion de voz a texto (ASR) en croata, bosnio y serbio.
- Procesamiento de audio en ventanas de hasta 30 s por defecto, con recomendacion de segmentos de hasta ~8 s para evitar omisiones.
- Inferencia offline en CPU gracias al formato GGML y a whisper.cpp.
- Dos niveles de precision: f16 (mayor calidad) y q5_0 (menor huella, 574 MB frente a 1,62 GB).
- Compatible con preprocesado por VAD (Silero VAD) para segmentar el audio en fragmentos cortos.
- No soporta tool calling, function calling, agentes, vision ni audio multimodal mas alla del propio ASR.

## Casos de uso

- Transcripcion offline en aplicaciones de escritorio: integrado en Voxcribe, permite transcribir audio localmente sin conexion ni envio de datos a la nube, usando el archivo q5_0 en equipos con recursos limitados.
- Subtitulado de contenido en croata, bosnio y serbio: el modelo puede generar transcripciones de entrevistas, podcasts o videos en estas lenguas, segmentando el audio con VAD para mejorar la fidelidad.
- Investigacion linguistica en lenguas del grupo serbocroata: sirve como base para estudios de ASR de bajo recurso, dado que el large-v3-turbo generico tiene un WER notablemente peor en estos idiomas.
- Archivado y busqueda de grabaciones: transcripcion de reuniones o llamadas para indexacion textual posterior, ejecutable en servidores sin GPU.
- Prototipado rapido de pipelines ASR: al estar en formato GGML, se puede probar en entornos con CPU y comparar f16 frente a q5_0 para decidir el compromiso calidad/rendimiento.
- Educacion y proyectos academicos: el repositorio GitHub Naresh0966/voxcribe-ai demuestra una aplicacion completa (React + FastAPI + Whisper local + SQLite) que puede servir de referencia para integrar este modelo en una arquitectura web.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la model card, medidos sobre 15 fragmentos de test de FLEURS (habla leida, segmentada en pausas):

| Modelo | Croata (WER) | Bosnio (WER) |
|---|---|---|
| whisper large-v3-turbo q5_0, audio largo | 18,0 % | 14,3 % |
| Voxcribe models, f16, segmentos ≤ 8 s | 11,5 % | 12,5 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar, ya que el modelo es exclusivamente de reconocimiento de voz.

## Requisitos de hardware

- VRAM estimada: el archivo f16 ocupa 1,62 GB y el q5_0 574 MB; en CPU no se requiere VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria para la variante f16; no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU gracias a whisper.cpp.
- Opciones de despliegue: whisper.cpp (formato nativo GGML); no se documenta soporte para vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Voxcribe models (este) | ~809 M (base) | ventanas de 30 s | hr, bs, sr | Apache 2.0 | GGML |
| whisper large-v3-turbo (OpenAI) | ~809 M | ventanas de 30 s | multilingue (99 idiomas) | MIT | safetensors, GGML |
| GoranS/whisper-large-v3-turbo-hr-parla | ~809 M | ventanas de 30 s | hr, bs, sr | Apache 2.0 | safetensors |

Frente al large-v3-turbo generico, este modelo mejora el WER en croata y bosnio a costa de restringir el soporte a tres idiomas. Frente al checkpoint original de GoranS, la diferencia es el formato: Voxcribe models ofrece pesos GGML listos para whisper.cpp, mientras que el original esta en safetensors.

## Limitaciones y advertencias

- El ajuste fino no fue entrenado con marcas de tiempo; en audio largo whisper.cpp omite partes de cada ventana de 30 s. Se recomienda segmentar en fragmentos de hasta ~8 s con VAD.
- Solo cubre croata, bosnio y serbio; no es adecuado para otros idiomas.
- Riesgo de alucinacion en pasajes con ruido o silencio, comun en modelos Whisper.
- Los benchmarks se basan en solo 15 fragmentos de FLEURS, una muestra pequena que limita la significancia estadistica.
- No se dispone de informacion sobre sesgos especificos del ajuste fino.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribucion a GoranS y a OpenAI Whisper (MIT).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/ldanijel/voxcribe-models
- Modelo base: https://huggingface.co/GoranS/whisper-large-v3-turbo-hr-parla
- whisper.cpp (ggerganov): https://huggingface.co/ggerganov/whisper.cpp
- Repositorio GitHub de la aplicacion: https://github.com/Naresh0966/voxcribe-ai/tree/main
