# mradermacher/Qwen3-ASR-0.6B-Cantonese-HK-GGUF

## Resumen

Qwen3-ASR-0.6B-Cantonese-HK-GGUF es una cuantizacion estatica en formato GGUF del modelo de reconocimiento automatico del habla (ASR) koelony/Qwen3-ASR-0.6B-Cantonese-HK, publicada por el usuario mradermacher. El modelo base deriva de la familia Qwen3-ASR de Alibaba y ha sido especializado en cantones de Hong Kong (yue-HK), con soporte adicional para chino (zh) e ingles (en), incluyendo capacidad de code-switching entre estos idiomas y de sesgo mediante hotwords. Con 596.049.920 parametros (aproximadamente 0,6 mil millones), esta pensado para transcripcion de audio en entornos con recursos limitados.

El repositorio no aporta pesos en safetensors, sino exclusivamente ficheros GGUF generados a partir del modelo original, lo que lo hace directamente consumible por llama.cpp y herramientas derivadas. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas. Su relevancia actual radica en que cubre un nicho poco atendido: ASR de alta calidad para cantonés de Hong Kong con un modelo pequeno y cuantizado, desplegable en hardware modesto.

Esta ficha describe la version cuantizada; las capacidades y el comportamiento del modelo subyacente corresponden al modelo base de koelony, del cual no se dispone de model card detallada en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR; el repo solo indica `qwen3-asr`) |
| Parametros totales | 596.049.920 (segun safetensors del modelo base) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | yue (cantonés), zh (chino), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (transformers como libreria declarada) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. El modelo pertenece a la familia Qwen3-ASR y el repositorio lo etiqueta como `qwen3-asr`, con un total de 596.049.920 parametros. La presencia de ficheros `mmproj` (multi-modal supplement) en el repositorio de cuantizacion sugiere que el modelo base incorpora un proyector multimodal, presumiblemente para procesar entrada de audio, aunque no se detalla su estructura.

Tampoco se especifican en la informacion disponible los datos de entrenamiento (numero de tokens, composicion del dataset), ni si hubo fases de RLHF, DPO o ajuste supervisado. Las etiquetas del repositorio mencionan `code-switching` y `hotwords`, lo que indica que el modelo base fue entrenado o ajustado para alternar idiomas dentro de una misma locucion y para aceptar listas de palabras clave que sesgan la decodificacion. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento automatico del habla en cantonés de Hong Kong (yue-HK) como idioma principal.
- Transcripcion en chino mandarin (zh) e ingles (en) como idiomas secundarios.
- Code-switching: manejo de cambios de idioma dentro de una misma frase o conversacion (yue/zh/en).
- Soporte de hotwords: sesgo de la decodificacion hacia vocabulario especifico (nombres propios, terminos tecnicos, jerga local).
- Procesamiento de audio mediante el proyector multimodal incluido (ficheros mmproj).
- Formato conversacional (`conversational` en las etiquetas del repo).
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repo).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, razonamiento multi-paso ni generacion de codigo; se trata de un modelo especializado en ASR.

## Casos de uso

- Transcripcion de reuniones y llamadas en cantonés: el modelo puede convertir audio de conversaciones de empresa en Hong Kong a texto, con soporte de code-switching para interlocutores que mezclan cantonés, mandarin e ingles.
- Subtitulado automatizado de contenido audiovisual: generacion de subtitulos para videos, podcasts o retransmisiones en cantonés, con la ventaja de un modelo de 0,6 B desplegable en local.
- Atencion al cliente por voz: integracion en sistemas IVR o de analitica de llamadas para transcribir y analizar interacciones en centros de contacto de la region.
- Actas y notas de reuniones medicas o legales: transcripcion con hotwords para nombres de pacientes, terminos juridicos o medicamentos, reduciendo errores en vocabulario especializado.
- Analitica de medios y monitorizacion: transcripcion masiva de emisiones de radio o television en cantonés para busqueda, indexacion y analisis de tendencias.
- Asistentes de voz embebidos: despliegue en dispositivos con recursos limitados (por ejemplo, mini-PC o sistemas edge) gracias a las cuantizaciones de 0,4-0,7 GB.
- Investigacion linguistica: generacion de corpus transcritos de cantonés con alternancia de codigos para estudios sociolinguisticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB con cuantizaciones Q2_K a Q4_K_M; 0,5-0,6 GB con Q5_K; 0,6-0,7 GB con Q6_K y Q8_0; 1,3 GB con f16. Hay que sumar el proyector multimodal (0,3 GB con mmproj-Q8_0 o 0,5 GB con mmproj-f16).
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente, incluidas GTX 1050 Ti, RTX 3050, RTX 4060 o superiores; en el extremo profesional, A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y otros frontends compatibles con GGUF. vLLM y TGI no son la via natural para estos pesos, aunque el modelo base en transformers podria servirse con ellos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; con 0,6 B de parametros se espera una latencia baja en GPU consumer, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas ASR | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-Cantonese-HK (este, GGUF) | 0,6 B | yue, zh, en | no disponible | Apache 2.0 | GGUF |
| Whisper small (referencia generica) | 244 M | multilingue (incluye zh, no yue especifico) | 30 s por ventana | MIT | safetensors, GGUF |
| Whisper medium (referencia generica) | 769 M | multilingue (incluye zh, no yue especifico) | 30 s por ventana | MIT | safetensors, GGUF |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en cantonés frente a estas alternativas; la comparativa se limita a parametros, idiomas, licencia y formato. No se identifican en la informacion proporcionada otros modelos ASR especializados en yue-HK de tamano comparable.

## Limitaciones y advertencias

- Modelo especializado en ASR: no es un modelo de proposito general y no debe esperarse de el generacion de texto libre, razonamiento o codigo.
- Sesgos: no documentados en la informacion disponible; al estar especializado en cantonés de Hong Kong, el rendimiento puede degradarse en otras variantes del cantonés (Guangdong, Macao) o en acentos no representados en el entrenamiento.
- Riesgo de alucinacion: inherente a los modelos ASR, especialmente en audio con ruido, solapamiento de hablantes o vocabulario fuera de dominio; el uso de hotwords puede mitigarlo parcialmente.
- Limitaciones de contexto: no se especifica la longitud maxima de audio procesable; el modelo base Qwen3-ASR no documenta este dato en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no se identifican clausulas adicionales.
- Caveat de produccion: esta es una cuantizacion de terceros (mradermacher), no una publicacion oficial del autor del modelo base; conviene validar la calidad de la cuantizacion elegida frente al modelo original antes de desplegar.
- No se ofrecen cuantizaciones ponderadas/imatrix en el momento de la publicacion; solo estaticas.
- El repositorio no incluye pesos en safetensors, solo GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3-ASR-0.6B-Cantonese-HK-GGUF
- Modelo base: https://huggingface.co/koelony/Qwen3-ASR-0.6B-Cantonese-HK
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3-ASR-0.6B-Cantonese-HK-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
