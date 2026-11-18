# mradermacher/ishiki-asr-0.5-GGUF

## Resumen

ishiki-asr-0.5 es un modelo de reconocimiento automático del habla (ASR) desarrollado por ishiki-labs y distribuido en formato GGUF por el cuantizador mradermacher. Se trata de un modelo de gran tamano, con 32.913.266.240 parametros (aproximadamente 32,9 mil millones), lo que lo situa en la categoria de modelos ASR de escala alta, muy por encima de las alternativas tipicas de 1-2 mil millones de parametros que dominan el ecosistema abierto de transcripcion.

El modelo base es `ishiki-labs/ishiki-asr-0.5`, y esta publicacion de mradermacher ofrece exclusivamente cuantizaciones estaticas en formato GGUF (desde Q2_K hasta Q8_0, ademas de los ficheros mmproj para el componente multimodal), pensadas para su uso con llama.cpp y herramientas compatibles. La licencia declarada es OpenMDW-1.1, una licencia abierta de pesos de modelo.

La relevancia de esta ficha radica en que permite ejecutar un modelo ASR de casi 33 mil millones de parametros en hardware de consumo mediante cuantizacion, algo impensable con los pesos originales en safetensors (el repositorio completo ocupa 270,9 GB). El modelo esta orientado al idioma ingles y esta etiquetado para el Open ASR Leaderboard, lo que indica que su evaluacion se enmarca en los benchmarks estandar de transcripcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR basado en transformers; detalles de la arquitectura interna no publicados en la informacion disponible) |
| Parametros totales | 32.913.266.240 (32,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | ingles (en) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. El modelo se distribuye a traves de la libreria `transformers` y esta etiquetado como tarea `automatic-speech-recognition`, con soporte multimodal (los ficheros `mmproj` indican un componente de proyeccion multimodal, probablemente para el encoder de audio). El modelo base es `ishiki-labs/ishiki-asr-0.5`, pero no se detallan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

Lo que si se puede afirmar es que se trata de un modelo de gran escala (32,9 mil millones de parametros) orientado a transcripcion, evaluado contra los conjuntos de datos `hf-audio/esb-datasets-test-only-sorted`, `hf-audio/open-asr-leaderboard` y `voice-arena-leaderboard/Monsoon-en-IN-test`. La presencia de estos datasets en las etiquetas sugiere que el modelo ha sido disenado para competir en los rankings estandar de ASR en ingles. Las cuantizaciones son estaticas (no hay quants ponderados ni imatrix disponibles en el momento de la publicacion, segun indica el autor de la cuantizacion).

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en ingles.
- Procesamiento multimodal de audio mediante el componente `mmproj` (proyeccion multimodal incluida en los ficheros GGUF).
- Etiquetado como `conversational`, lo que sugiere capacidad de manejar habla conversacional o dialogos.
- Evaluado en el Open ASR Leaderboard y en el benchmark Monsoon (ingles de la India), lo que indica cobertura de variantes del ingles.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni generacion de codigo (no es un modelo de lenguaje general, sino un modelo ASR especializado).
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.

## Casos de uso

- Transcripcion de reuniones y videoconferencias: el modelo puede convertir audio de reuniones en texto, aprovechando su etiqueta `conversational` para manejar turnos de habla y dialogos multi-participante en ingles.
- Subtitulado automatico de contenido audiovisual: adecuado para generar subtitulos en ingles de videos, podcasts y material formativo, con la ventaja de que las cuantizaciones Q4_K_M (25,5 GB) o Q5_K_M (27,1 GB) permiten ejecucion en estaciones de trabajo con GPU de gama alta.
- Analisis de llamadas de atencion al cliente: transcripcion de grabaciones para su posterior analisis de sentimiento, control de calidad o cumplimiento normativo, en entornos donde el ingles es el idioma principal.
- Investigacion en ASR: al estar evaluado contra el Open ASR Leaderboard, sirve como referencia para comparar tecnicas de transcripcion y para estudiar el efecto de la cuantizacion en la calidad de la transcripcion (comparando Q2_K frente a Q8_0).
- Generacion de actas y notas a partir de audio: integracion en pipelines que reciben audio y producen texto estructurado, con despliegue local mediante llama.cpp para preservar la privacidad de las grabaciones.
- Accesibilidad: transcripcion en tiempo casi real de audio para personas con discapacidad auditiva, desplegando una cuantizacion Q4_K_S (22,9 GB) en un servidor con GPU dedicada.
- Procesamiento de audio en ingles de la India: el modelo esta etiquetado con el benchmark Monsoon-en-IN, por lo que puede emplearse en aplicaciones dirigidas a ese mercado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo esta etiquetado para el Open ASR Leaderboard y para los conjuntos de prueba `hf-audio/esb-datasets-test-only-sorted`, `hf-audio/open-asr-leaderboard` y `voice-arena-leaderboard/Monsoon-en-IN-test`, pero no se incluyen cifras de WER (Word Error Rate) ni de otros metricas en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~18,8 GB; Q3_K_S ~18,8 GB; IQ4_XS ~19,1 GB; Q3_K_M ~20,8 GB; Q3_K_L ~21,7 GB; Q4_K_S ~22,9 GB; Q5_K_S ~24,9 GB; Q4_K_M ~25,5 GB; Q5_K_M ~27,1 GB; Q6_K ~35,0 GB; Q8_0 ~35,1 GB. A esto hay que sumar el componente multimodal mmproj (0,9 GB en Q8_0 o 1,6 GB en f16) y el overhead de la ventana de contexto y del runtime.
- GPU recomendadas: para las cuantizaciones mas grandes (Q6_K, Q8_0) se necesita una GPU con 40-48 GB de VRAM o mas (A100 40/80 GB, H100, L40S). Para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) queda justa; es recomendable una RTX A6000 (48 GB) o una A100. Para Q2_K y Q3_K_S (18,8 GB) una RTX 4090 de 24 GB puede ser suficiente, aunque con margen limitado.
- Cabe en GPU de consumo: si, en el caso de las cuantizaciones Q2_K, Q3_K_S, IQ4_XS y Q3_K_M en una RTX 4090 (24 GB); las cuantizaciones Q4 y superiores requieren GPUs profesionales o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si se importa el GGUF), y cualquier runtime compatible con GGUF que soporte modelos multimodales con `mmproj`. El modelo base tambien puede usarse con transformers (pesos safetensors).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento (WER) ni de especificaciones detalladas de modelos comparables que permitan una comparacion rigurosa. Como referencia cualitativa, los modelos ASR abiertos habituales (por ejemplo, la familia Whisper de OpenAI o los modelos de NVIDIA Parakeet) se sitúan en rangos de 0,1 a 1,5 mil millones de parametros, muy por debajo de los 32,9 mil millones de este modelo, pero no se dispone de sus cifras de WER en esta ficha para establecer una comparacion numerica. Se indica, por tanto, "no disponible" para la comparacion cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles: no se debe esperar un rendimiento adecuado en castellano u otros idiomas, a pesar de que el modelo pueda producir alguna salida.
- Riesgo de alucinacion: como todo modelo ASR, puede generar texto que no corresponde al audio, especialmente en segmentos con ruido, silencios o habla solapada.
- Sesgos: no se documentan en la informacion disponible los sesgos conocidos del modelo; al entrenarse presumiblemente con datos en ingles, puede tener un rendimiento desigual segun el acento, la edad o el genero del hablante.
- Licencia OpenMDW-1.1: es una licencia abierta de pesos, pero se recomienda revisar sus terminos exactos antes de un uso comercial, ya que la model card la etiqueta como `license: other` con enlace a `LICENSE`.
- Cuantizaciones estaticas: el autor indica que no hay cuantizaciones ponderadas ni imatrix disponibles, lo que puede implicar una perdida de calidad algo mayor en las cuantizaciones bajas (Q2_K, Q3_K_S) en comparacion con quants imatrix.
- Modelo de gran tamano: incluso en Q2_K ocupa 18,8 GB, lo que limita su despliegue en hardware modesto y encarece la inferencia frente a alternativas mas pequenas.
- Sin datos de benchmarks publicados: no es posible verificar el rendimiento real del modelo con las cifras proporcionadas; se recomienda evaluarlo con un conjunto de validacion propio antes de usarlo en produccion.
- Repositorio de 270,9 GB: la descarga completa de todas las cuantizaciones es muy costosa en almacenamiento; conviene descargar unicamente el fichero GGUF y el mmproj necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ishiki-asr-0.5-GGUF
- Modelo base: https://huggingface.co/ishiki-labs/ishiki-asr-0.5
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#ishiki-asr-0.5-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Dataset de evaluacion ESB: https://huggingface.co/datasets/hf-audio/esb-datasets-test-only-sorted
- Dataset Monsoon en-IN: https://huggingface.co/datasets/voice-arena-leaderboard/Monsoon-en-IN-test
