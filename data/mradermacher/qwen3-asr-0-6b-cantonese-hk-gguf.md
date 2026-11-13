# mradermacher/Qwen3-ASR-0.6B-Cantonese-HK-GGUF

## Resumen

Qwen3-ASR-0.6B-Cantonese-HK es un modelo de reconocimiento automatico del habla (ASR) derivado de la familia Qwen3-ASR de Alibaba, afinado especificamente para cantonés de Hong Kong (yue-HK) con soporte para code-switching entre cantonés, mandarin (zh) e ingles (en). Esta publicacion concreta, obra de mradermacher, no es el modelo original sino una conversion a formato GGUF del afinamiento realizado por joe2643, pensada para su uso en entornos de inferencia local con llama.cpp y herramientas compatibles.

El modelo cuenta con 596.049.920 parametros (aproximadamente 0,6 mil millones), lo que lo situa en la gama ultra-ligera: puede ejecutarse en CPU y en GPUs de consumo con requisitos de memoria muy bajos. Incorpora un componente multimodal (mmproj) que procesa la entrada de audio, y esta orientado a transcripcion conversacional con soporte de hotwords (terminos personalizados) y cambios de idioma dentro de una misma frase.

Su relevancia actual radica en la escasez de modelos ASR abiertos especializados en cantonés, una lengua con mas de 80 millones de hablantes y una comunidad tecnica activa en Hong Kong. La licencia Apache 2.0 y el formato GGUF facilitan su integracion en productos comerciales y en despliegues sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3-ASR; incluye encoder de audio multimodal mmproj) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, ademas de mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | yue (cantonés), zh (mandarin), en (ingles), con code-switching entre ellos |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base joe2643/Qwen3-ASR-0.6B-Cantonese-HK mas alla de su pertenencia a la familia Qwen3-ASR. Por la presencia de ficheros mmproj (multi-modal supplement) en el repositorio GGUF, se confirma que el modelo incorpora un encoder de audio que transforma la senal acustica en representaciones que alimentan al decoder de texto. El tamano de 0,6 mil millones de parametros corresponde a la variante pequena de la familia.

No se han publicado en la informacion proporcionada datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del afinamiento cantones. La model card del repositorio GGUF se limita a describir el proceso de cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) y a listar los ficheros generados. Las etiquetas del modelo indican soporte de hotwords y code-switching, lo que sugiere un entrenamiento orientado a transcripcion conversacional real con mezcla de idiomas.

## Capacidades

- Reconocimiento automatico del habla en cantonés de Hong Kong (yue-HK) como idioma principal.
- Transcripcion con code-switching entre cantonés, mandarin e ingles dentro de una misma intervencion.
- Soporte de hotwords: personalizacion del vocabulario para terminos especificos (nombres propios, jerga tecnica, marcas).
- Procesamiento de audio mediante el componente multimodal mmproj incluido en el repositorio.
- Orientado a habla conversacional (etiqueta "conversational"), no solo a lectura de textos.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible") y con el ecosistema transformers/llama.cpp.
- No se ha documentado soporte de tool calling, agentes, vision ni audio mas alla de la propia transcripcion.

## Casos de uso

- Subtitulado automatico de contenido audiovisual en cantonés: el modelo transcribe audio conversacional y puede generar subtitulos para videos, podcasts o retransmisiones, con la ventaja de manejar mezclas de cantonés e ingles habituales en medios de Hong Kong.
- Atencion al cliente en centros de llamadas de Hong Kong: integrado en un pipeline de telefonia (por ejemplo, con un servidor compatible con la API de OpenAI), transcribe llamadas en tiempo real o diferido para analitica, control de calidad y generacion de resumentes.
- Actas y notas de reunion multilingues: en entornos donde los participantes alternan cantonés, mandarin e ingles, el modelo produce transcripciones que preservan los cambios de idioma sin requerir segmentacion manual.
- Transcripcion de entrevistas y trabajo de campo: investigadores y periodistas que recogen testimonios en cantonés pueden obtener texto buscable en local, sin enviar audio sensible a servicios en la nube, gracias a su reducido tamano.
- Asistentes de voz embebidos: con cuantizaciones de 0,4-0,5 GB, el modelo puede ejecutarse en dispositivos de borde o en CPUs modestas para comandos de voz y dictado en aplicaciones de escritorio o moviles.
- Diccionario y aprendizaje de idiomas: uso de hotwords para reforzar vocabulario concreto y generacion de transcripciones alineadas que sirvan como material de estudio de cantonés para estudiantes.
- Moderacion y busqueda de contenido en plataformas: indexacion de audio generado por usuarios en yue/zh/en para busqueda semantica y deteccion de contenido, con despliegue on-premise por la licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB con Q2_K, 0,5 GB con Q4_K_M, 0,7 GB con Q8_0 y 1,3 GB con f16, a los que se suma el componente mmproj (0,3 GB en Q8_0 o 0,5 GB en f16).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre es suficiente; modelos como RTX 3060, RTX 4060, RTX 4090 o superiores no suponen ningun cuello de botella. Tambien es viable en GPUs integradas y en CPU.
- Cabe holgadamente en GPUs de consumo: si, en practicamente todas las GPU dedicadas modernas e incluso en muchas integradas.
- Opciones de despliegue: llama.cpp y sus frontends (Ollama, LM Studio, llama-server), asi como servidores compatibles con la API de OpenAI indicados por la etiqueta "endpoints_compatible". El modelo base en safetensors puede servirse con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia baja en hardware moderno, pero no se aportan cifras verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-Cantonese-HK-GGUF (este) | 596 M | yue, zh, en | GGUF | Apache 2.0 | Afinado para cantonés de Hong Kong, hotwords y code-switching |
| joe2643/Qwen3-ASR-0.6B-Cantonese-HK | 596 M | yue, zh, en | safetensors | Apache 2.0 | Modelo base del que deriva esta cuantizacion |
| Whisper (variantes pequenas) | no disponible en la informacion | multilingue, incluye zh | safetensors, GGUF, etc. | MIT | Referencia generica del ecosistema ASR; no se dispone de datos comparativos en la informacion |
| Otros Qwen3-ASR de mayor tamano | no disponible | multilingue | safetensors, GGUF | Apache 2.0 | Alternativas de la misma familia con mas parametros; sin datos de rendimiento en la informacion |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar sesgos derivados de los datos de entrenamiento del modelo base y del afinamiento cantones, especialmente en acentos regionales distintos del de Hong Kong.
- Riesgo de alucinacion: como todo modelo ASR generativo, puede producir texto plausible no presente en el audio, especialmente con ruido de fondo, solapamiento de voces o audio de baja calidad.
- Limitaciones de contexto e idioma: el soporte declarado se limita a yue, zh y en; no hay datos sobre la longitud maxima de audio procesable ni sobre el rendimiento en otros dialectos del chino.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar las condiciones del modelo base y de los datos de audio utilizados en el afinamiento, no detalladas en la informacion.
- Caveat de cuantizacion: las cuantizaciones Q2_K y Q3_K pueden degradar la calidad de transcripcion; para produccion se recomienda Q4_K_M o superior. Los cuants ponderados/imatrix no estaban disponibles en el momento de la publicacion.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3-ASR-0.6B-Cantonese-HK-GGUF
- Modelo base: https://huggingface.co/joe2643/Qwen3-ASR-0.6B-Cantonese-HK
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3-ASR-0.6B-Cantonese-HK-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
