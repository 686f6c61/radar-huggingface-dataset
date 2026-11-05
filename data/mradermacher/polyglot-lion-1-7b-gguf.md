# mradermacher/polyglot-lion-1.7b-GGUF

## Resumen

Polyglot-Lion 1.7B es un modelo de reconocimiento automatico del habla (ASR) multilingue desarrollado por knoveleng, orientado al contexto linguistico de Singapur. Cubre ingles, mandarin, malayo y tamil, e incorpora datos de Singlish (ingles coloquial singapurense) en su entrenamiento. Este repositorio concreto es la version cuantizada en GGUF publicada por mradermacher, que permite ejecutar el modelo original en CPU y GPU de consumo mediante llama.cpp y herramientas compatibles.

El modelo base cuenta con 1.720.574.976 parametros (aproximadamente 1,7 mil millones) y se distribuye bajo licencia MIT, lo que facilita su uso comercial sin restricciones adicionales. La relevancia actual radica en la escasez de modelos ASR open source que cubran de forma conjunta mandarin, malayo, tamil y Singlish, una combinacion poco habitual fuera de los grandes modelos propietarios.

La version GGUF incluye cuantizaciones desde Q2_K hasta f16, ademas de ficheros mmproj para el componente multimodal, lo que reduce el peso desde 3,5 GB en f16 hasta 0,9 GB en Q2_K. El repositorio tiene un tamano total de 17 GB debido a la suma de todas las variantes publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo ASR/speech; no se detalla en la informacion proporcionada) |
| Parametros totales | 1.720.574.976 (1,7 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en, zh, ms, ta (incluye Singlish en el entrenamiento) |
| Licencia | MIT |
| Formato de pesos | GGUF (version cuantizada); el modelo base en formato original no se especifica en esta ficha |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base en la informacion proporcionada. Por los tags y la model card, se trata de un modelo de reconocimiento automatico del habla (ASR) con componente multimodal (ficheros mmproj), entrenado sobre un conjunto de datasets de audio en mandarin, tamil, malayo, Singlish e ingles. Los datasets citados incluyen cv-mandarin, aishell1-mandarin, aishell3-mandarin, fleurs-mandarin, fleurs-tamil, slr127-tamil, slr65-tamil, cv-tamil, mesolitica-malay, fleurs-malay, nsc-singlish y librispeech-english.

No se especifica el numero de horas de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. Esta version del repositorio es una conversion estatica a GGUF del modelo knoveleng/polyglot-lion-1.7b, realizada con la herramienta de cuantizacion de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf).

## Capacidades

- Reconocimiento automatico del habla multilingue en ingles, mandarin, malayo y tamil.
- Procesamiento de Singlish (ingles coloquial de Singapur) como variedad linguistica especifica.
- Componente multimodal mediante ficheros mmproj, orientado al procesamiento de audio.
- Conversacion (tag conversational en el repositorio).
- Compatible con endpoints (tag endpoints_compatible).
- No se documenta soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio generativo.
- No se documentan capacidades de generacion de codigo o matematicas.

## Casos de uso

- Transcripcion de audio multilingue en Singapur: el modelo cubre las cuatro lenguas oficiales del pais (ingles, mandarin, malayo y tamil) en un unico modelo de 1,7 B, lo que simplifica el despliegue frente a mantener cuatro sistemas separados.
- Subtitulado automatico de reuniones y llamadas: al ejecutarse en formato GGUF con cuantizaciones de 1,2 GB, puede desplegarse en servidores modestos o incluso en portatiles para generar transcripciones en tiempo casi real.
- Atencion al cliente en centros de contacto singapurenses: permite transcribir conversaciones donde el cliente alterna entre ingles, mandarin y Singlish, un escenario frecuente en el mercado local.
- Investigacion linguistica sobre Singlish: el modelo esta entrenado con nsc-singlish, lo que lo hace util para proyectos academicos que necesiten transcribir corpus de habla coloquial singapurense.
- Sistemas de accesibilidad: transcripcion de audio a texto para personas con discapacidad auditiva en entornos multilingues del sudeste asiatico, con un coste de inferencia bajo gracias al tamano reducido.
- Procesamiento por lotes de archivos de audio en pipelines de datos: la version Q8_0 (1,9 GB) o Q4_K_M (1,2 GB) permite procesar grandes volumenes de audio en CPU sin necesidad de GPU dedicada.
- Integracion en aplicaciones moviles o edge: la cuantizacion Q2_K (0,9 GB) posibilita el despliegue en dispositivos con recursos limitados, aunque con perdida de calidad respecto a Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB en Q2_K, 1,2 GB en Q4_K_M, 1,5 GB en Q6_K y 1,9 GB en Q8_0. La version f16 requiere unos 3,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM para cuantizaciones bajas (GTX 1650, RTX 3050, RTX 4060). Para Q8_0 o f16, se recomienda al menos 4 GB (RTX 3050 4 GB, RTX 4060, RTX 4090). En entornos de servidor, A100 o H100 no son necesarias por el tamano del modelo, pero funcionarian sin problema.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 2 GB o mas de VRAM en cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia estandar. No se documenta soporte explicito de vLLM o TGI para este formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| polyglot-lion-1.7b (este) | 1,7 B | no disponible | en, zh, ms, ta | MIT | GGUF |
| Whisper large-v3 (OpenAI) | 1,55 B | 30 s de audio | multilingue (99 idiomas) | MIT | safetensors, GGUF |
| Whisper small (OpenAI) | 244 M | 30 s de audio | multilingue | MIT | safetensors, GGUF |
| SeamlessM4T v2 (Meta) | no disponible | no disponible | multilingue | CC-BY-NC 4.0 | safetensors |

Nota: la comparativa se limita a datos publicos de los modelos alternativos; no se dispone de resultados de benchmarks comparativos entre polyglot-lion-1.7b y estos modelos en la informacion proporcionada. Whisper large-v3 cubre mas idiomas pero no esta especializado en Singlish ni en la combinacion concreta de malayo y tamil de Singapur; SeamlessM4T tiene licencia no comercial, lo que limita su uso en produccion.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo en la informacion proporcionada; al estar entrenado con datasets especificos de Singapur, el rendimiento fuera de ese contexto linguistico puede degradarse.
- Riesgo de alucinacion: en tareas ASR, el riesgo se traduce en transcripciones incorrectas o inventadas, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S) o con audio ruidoso.
- Limitaciones de contexto: no se especifica la longitud maxima de audio procesable; el modelo base esta pensado para ASR, no para contextos largos de texto.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad de transcripcion; se recomienda Q4_K_M o superior para uso real.
- El modelo esta especializado en cuatro idiomas; no se debe esperar buen rendimiento en otras lenguas.
- No se documentan limitaciones especificas sobre audio de baja calidad, acentos no singapurenses o ruido de fondo.
- El repositorio tiene 126 descargas y 1 like, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/polyglot-lion-1.7b-GGUF
- Modelo base: https://huggingface.co/knoveleng/polyglot-lion-1.7b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/polyglot-lion-1.7b-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#polyglot-lion-1.7b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
