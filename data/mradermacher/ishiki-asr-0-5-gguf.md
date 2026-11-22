# mradermacher/ishiki-asr-0.5-GGUF

## Resumen

ishiki-asr-0.5 es un modelo de reconocimiento automático del habla (ASR) desarrollado por ishiki-labs, publicado originalmente en formato transformers y cuantizado a GGUF por mradermacher. El modelo base cuenta con 32.913.266.240 parámetros (aproximadamente 32,9 mil millones), lo que lo sitúa en la gama alta de modelos ASR de código abierto disponibles en la actualidad. Esta versión GGUF está pensada para su uso con llama.cpp y otros runners compatibles, ofreciendo una amplia gama de cuantizaciones que van desde Q2_K hasta Q8_0.

El modelo está orientado a la transcripción de audio a texto en inglés, con soporte declarado únicamente para el idioma inglés (`en`). Incluye archivos mmproj (multi-modal projection) que permiten procesar la entrada de audio dentro del pipeline del modelo, lo que confirma que la arquitectura integra un encoder de audio junto con un decoder de lenguaje. La licencia es OpenMDW 1.1, una licencia de pesos abiertos con condiciones específicas que conviene revisar antes de un uso comercial.

La relevancia de esta ficha radica en que permite desplegar un modelo ASR de gran tamano en entornos donde no se dispone de infraestructura de GPU de datacenter, gracias a las cuantizaciones GGUF. No obstante, el tamano del modelo (270,9 GB en el repositorio completo y entre 18,8 y 35,1 GB por cuantización) implica requisitos de hardware considerables incluso en las versiones más comprimidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR multimodal con encoder de audio y decoder; detalles no especificados en la informacion proporcionada) |
| Parametros totales | 32.913.266.240 (32,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | openmdw-1.1 (OpenMDW 1.1) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. Los tags indican que se trata de un modelo de reconocimiento automático del habla con capacidades multimodales (audio y texto), y la presencia de archivos `mmproj` confirma que el pipeline incluye un proyector multimodal que adapta las representaciones del encoder de audio al espacio del decoder de lenguaje. El modelo base es `ishiki-labs/ishiki-asr-0.5`, del cual esta version es una cuantizacion estática.

Tampoco se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Los datasets de evaluacion referenciados en la model card (`hf-audio/esb-datasets-test-only-sorted`, `hf-audio/open-asr-leaderboard` y `voice-arena-leaderboard/Monsoon-en-IN-test`) corresponden a conjuntos de test utilizados para evaluacion en el leaderboard de ASR abierto, no necesariamente a datos de entrenamiento.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles: transcripcion de audio a texto.
- Procesamiento multimodal: integra entrada de audio mediante el proyector `mmproj` y genera texto.
- Compatibilidad con el leaderboard Open ASR: el modelo esta disenado para ser evaluado en dicho benchmark.
- Evaluacion en dominios especificos: la model card referencia el dataset Monsoon-en-IN-test, orientado a ingles con acento indio.
- Conversacional: el tag `conversational` sugiere capacidad de manejar interacciones de tipo dialogo, aunque no se detalla su alcance.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio generation ni modo thinking.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo puede convertir grabaciones de audio de reuniones en ingles en texto estructurado, aprovechando su capacidad ASR para generar transcripciones que luego se procesen con herramientas de resumen. Su tamano permite manejar audio de calidad variable.
- Subtitulado automatico de video: integrado en un pipeline de procesamiento de video, el modelo puede generar subtitulos en ingles para contenido audiovisual, con la ventaja de disponer de cuantizaciones Q4_K_M (25,5 GB) que facilitan el despliegue en servidores con GPU unica.
- Atencion al cliente basada en voz: transcripcion de llamadas en ingles para su analisis posterior, clasificacion de intenciones o generacion de respuestas, usando la version Q8_0 (35,1 GB) si se busca maxima calidad de transcripcion.
- Analisis de entrevistas y estudios cualitativos: transcripcion de entrevistas en ingles para investigacion de mercado o academica, donde la precision en la transcripcion es critica y se puede emplear la cuantizacion Q6_K (35,0 GB) como compromiso entre calidad y recursos.
- Accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos de habla inglesa, desplegando el modelo con llama.cpp en servidores con GPU consumer de gama alta.
- Procesamiento por lotes de archivos de audio: uso en pipelines offline para transcribir grandes volumenes de audio en ingles, donde el throughput prima sobre la latencia y se puede emplear la cuantizacion Q4_K_S (22,9 GB) para maximizar el numero de instancias por GPU.
- Evaluacion comparativa de ASR: uso como referencia en experimentos de investigacion sobre reconocimiento del habla, aprovechando su integracion con el Open ASR Leaderboard.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 18,8 GB (Q2_K) y 35,1 GB (Q8_0) solo para los pesos del modelo, mas el consumo adicional del contexto, el proyector mmproj (0,9-1,6 GB) y el buffer de audio.
- GPU recomendadas: para las cuantizaciones mas grandes (Q6_K, Q8_0) se requiere una GPU con al menos 40-48 GB de VRAM, como A100 40GB/80GB, H100 o RTX A6000. Para Q4_K_M (25,5 GB) es viable en una RTX 4090 (24 GB) solo si se ajusta el contexto y se usa offloading parcial; en la practica, una RTX 3090/4090 de 24 GB puede quedarse corta para Q4_K_M completo.
- Cabe en GPU consumer: las cuantizaciones Q2_K (18,8 GB) y Q3_K_S (18,8 GB) pueden caber en GPUs de 24 GB como la RTX 4090 o RTX 3090, aunque con margen ajustado. Las cuantizaciones Q4 en adelante requieren GPUs profesionales o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. El modelo base (safetensors) puede desplegarse con transformers y, presumiblemente, con frameworks de inferencia que soporten modelos multimodales, aunque no se detalla en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la informacion proporcionada. Como referencia generica, los modelos ASR de codigo abierto habituales en el ecosistema (Whisper large-v3, de ~1,5 B de parametros, o modelos ASR basados en LLM de menor tamano) operan en rangos de parametros muy inferiores. Este modelo, con 32,9 B de parametros, se situa en una categoria de tamano superior, pero no se han proporcionado datos de rendimiento que permitan una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| ishiki-asr-0.5 (este) | 32,9 B | no disponible | openmdw-1.1 | GGUF, safetensors |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles (`en`); no se declara soporte para castellano ni otros idiomas.
- No se dispone de informacion sobre sesgos del modelo, pero al ser un modelo ASR entrenado predominantemente con datos en ingles, es probable que tenga un rendimiento inferior con acentos no representados en el dataset de entrenamiento (la referencia al dataset Monsoon-en-IN-test sugiere interes en acentos del ingles indio, pero no confirma cobertura).
- Riesgo de alucinacion en la transcripcion: como todo modelo generativo aplicado a ASR, puede producir texto que no corresponde al audio, especialmente en segmentos con ruido o silencios.
- La licencia OpenMDW 1.1 incluye condiciones especificas que deben revisarse antes de un uso comercial; no es una licencia permisiva estandar como Apache 2.0 o MIT.
- El tamano del modelo (32,9 B de parametros) implica requisitos de hardware elevados incluso en cuantizaciones agresivas, lo que limita su despliegue en entornos con recursos modestos.
- No se especifican la longitud de contexto ni el manejo de audios largos; conviene validar el comportamiento con fragmentos de audio extensos antes de usarlo en produccion.
- Las cuantizaciones de menor tamano (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de transcripcion; se recomienda Q4_K_M o superior para uso en produccion.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/ishiki-asr-0.5-GGUF
- Modelo base: https://huggingface.co/ishiki-labs/ishiki-asr-0.5
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#ishiki-asr-0.5-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Open ASR Leaderboard (dataset referenciado): https://huggingface.co/datasets/hf-audio/open-asr-leaderboard
- Dataset ESB test (referenciado): https://huggingface.co/datasets/hf-audio/esb-datasets-test-only-sorted
- Dataset Monsoon-en-IN-test (referenciado): https://huggingface.co/datasets/voice-arena-leaderboard/Monsoon-en-IN-test
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
