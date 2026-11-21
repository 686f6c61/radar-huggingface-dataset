# mradermacher/higgs-audio-v3-stt-v2-GGUF

## Resumen

Higgs Audio v3 STT v2 es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Boson AI, publicado en Hugging Face bajo licencia Apache 2.0. La version aqui descrita es una cuantizacion GGUF realizada por mradermacher, que permite ejecutar el modelo en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo base cuenta con aproximadamente 2.030 millones de parametros (2,03 mil millones) y esta disenado para transcripcion de audio a texto en ingles.

El modelo se enmarca en la familia Higgs Audio, una linea de modelos de Boson AI orientada a tareas de audio, y esta etiquetado para el leaderboard Open ASR. Su relevancia actual radica en que ofrece una alternativa de ASR de tamano medio con licencia permisiva (Apache 2.0), lo que facilita su integracion en productos comerciales sin las restricciones de otros modelos ASR populares. La cuantizacion GGUF amplia su accesibilidad a hardware de consumo.

La version cuantizada incluye un fichero mmproj (proyeccion multimodal) que actua como suplemento para el procesamiento de audio, junto con una amplia gama de cuantizaciones estaticas (desde Q2_K hasta f16). No se dispone de informacion detallada sobre la arquitectura interna, el contexto o los datos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de audio/ASR basado en transformers) |
| Parametros totales | 2.031.739.904 (aprox. 2,03 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Por las etiquetas y el pipeline (`automatic-speech-recognition`, `audio`, `higgs-audio`) se trata de un modelo de transformers orientado a la transcripcion de audio, con un componente de proyeccion multimodal (mmproj) que conecta la entrada de audio con el modelo de lenguaje subyacente. El numero de parametros (2,03 mil millones) sugiere un modelo de tamano medio, adecuado para inferencia en hardware modesto.

Tampoco se especifican en la informacion disponible los datos de entrenamiento (numero de tokens, composicion del dataset), ni si se aplicaron tecnicas de RLHF, DPO u otras optimizaciones. La model card del repositorio cuantizado es una plantilla generica de mradermacher centrada en las cuantizaciones, sin detalles tecnicos del modelo original. Se recomienda consultar la model card del modelo base (bosonai/higgs-audio-v3-stt-v2) para obtener informacion sobre arquitectura y entrenamiento.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio en ingles a texto.
- Procesamiento de audio multimodal mediante el fichero mmproj, que permite alimentar entradas de audio al modelo.
- Orientado a tareas conversacionales (etiqueta `conversational`), lo que sugiere uso en dialogos con entrada de voz.
- Compatible con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- Soporte multilingue: limitado a ingles segun la etiqueta `language: en`.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo thinking en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo puede convertir grabaciones de audio en ingles a texto para actas automaticas, aprovechando su tamano contenido para ejecucion en servidores modestos.
- Subtitulado automatico de contenido audiovisual: integrable en pipelines de postproduccion para generar subtitulos en ingles a partir de pistas de audio.
- Asistentes de voz para atencion al cliente: combinado con un LLM y un TTS, permite construir agentes conversacionales que entienden la consulta hablada del usuario en ingles.
- Dictado y accesibilidad: transcripcion en tiempo real o diferido para aplicaciones de accesibilidad y herramientas de productividad personal.
- Analisis de llamadas y compliance: transcripcion masiva de grabaciones para busqueda, auditoria y extraccion de informacion en centros de contacto.
- Prototipado e investigacion en ASR: al estar cuantizado en GGUF, permite experimentar con reconocimiento de voz en equipos de desarrollo sin GPU dedicada, usando llama.cpp.
- Despliegue en dispositivos de borde: las cuantizaciones Q2_K a Q4_K (1,0-1,4 GB) permiten ejecutar el modelo en hardware con poca memoria, aunque con perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo esta etiquetado para el Open ASR Leaderboard, pero no se incluyen cifras de WER (word error rate) ni comparaciones numericas en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K: ~1,0 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~1,1-1,2 GB
  - IQ4_XS / Q4_K_S: ~1,3 GB
  - Q4_K_M: ~1,4 GB
  - Q5_K_S / Q5_K_M: ~1,5-1,6 GB
  - Q6_K: ~1,8 GB
  - Q8_0: ~2,3 GB
  - f16: ~4,2 GB
  - Adicional: mmproj Q8_0 (~0,8 GB) o mmproj f16 (~1,4 GB) para el procesamiento de audio.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer con 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) puede alojar las cuantizaciones Q4-Q8. Para f16 se recomienda 8 GB o mas.
- Cabe en GPU consumer: si, practicamente todas las cuantizaciones Q2-Q8 caben en GPUs consumer modernas.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si se importa el GGUF), y servidores compatibles con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales. Como alternativas de la misma categoria (ASR open source) podrian considerarse Whisper (OpenAI) y otros modelos ASR de tamano similar, pero no se aportan cifras comparativas verificadas.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| higgs-audio-v3-stt-v2 | ~2,03 B | no disponible | en | Apache 2.0 | GGUF / safetensors |
| Whisper large-v3 (referencia) | ~1,55 B | no disponible | multilingue | MIT | safetensors / GGUF |
| Whisper medium (referencia) | ~0,77 B | no disponible | multilingue | MIT | safetensors / GGUF |

Nota: los datos de Whisper se incluyen como referencia de categoria; no se dispone de comparaciones de rendimiento (WER) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles: no se documenta soporte multilingue, lo que limita su uso en entornos en castellano u otros idiomas.
- Riesgo de alucinacion y errores de transcripcion: como todo modelo ASR, puede generar texto incorrecto en audio con ruido, acentos marcados o vocabulario tecnico; no se han publicado tasas de error.
- Cuantizaciones agresivas (Q2_K, Q3_K) degradan la calidad de transcripcion; el autor recomienda Q4_K_S o Q4_K_M como equilibrio calidad/tamano.
- No hay cuantizaciones con imatrix/weighted disponibles segun el autor, lo que puede afectar la calidad en cuantizaciones bajas.
- Licencia Apache 2.0: permite uso comercial, pero se debe verificar la licencia del modelo base y de los datos de entrenamiento originales.
- Falta de documentacion tecnica: la model card del repositorio cuantizado es generica; no hay informacion sobre sesgos, contexto maximo ni datos de entrenamiento.
- El modelo tiene solo 1 like y 0 descargas en el momento de la ficha, lo que indica escasa validacion por la comunidad.
- Para produccion se recomienda validar el WER en el dominio concreto antes del despliegue.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/higgs-audio-v3-stt-v2-GGUF
- Modelo base: https://huggingface.co/bosonai/higgs-audio-v3-stt-v2
- Pagina de descargas del autor: https://hf.tst.eu/model#higgs-audio-v3-stt-v2-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
