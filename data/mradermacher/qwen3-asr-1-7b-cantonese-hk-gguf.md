# mradermacher/Qwen3-ASR-1.7B-Cantonese-HK-GGUF

## Resumen

Qwen3-ASR-1.7B-Cantonese-HK-GGUF es una cuantizacion en formato GGUF del modelo de reconocimiento automatico del habla (ASR) joe2643/Qwen3-ASR-1.7B-Cantonese-HK, un ajuste fino especializado en cantonés de Hong Kong (yue-HK) construido sobre la familia Qwen3-ASR. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en la comunidad de pesos GGUF, y el modelo base procede de joe2643. El resultado es un paquete de ficheros listos para su uso en llama.cpp y entornos compatibles, con 1.720.574.976 parametros (1,7 mil millones) y licencia Apache 2.0.

El modelo resuelve un problema concreto: la transcripcion de audio en cantonés, un idioma con escasa representacion en los sistemas ASR genericos, y el fenomeno del code-switching entre cantonés, mandarin (zh) e ingles (en), muy frecuente en el habla real de Hong Kong. Al estar cuantizado en multiples niveles (desde Q2_K hasta f16), permite desplegar ASR de calidad en hardware modesto, incluyendo equipos de consumo, algo dificil con los pesos originales en precision completa.

Su relevancia actual radica en la combinacion de tres factores: especializacion linguistica en una variedad infrarepresentada, tamano contenido (1,7 B) que abarata la inferencia, y disponibilidad de cuantizaciones GGUF que facilitan la integracion en pipelines locales, herramientas de subtitulado o flujos de ComfyUI. No obstante, la informacion publicada sobre el modelo es escasa: la model card del repositorio cuantizado se limita a describir el proceso de cuantizacion y no aporta detalles sobre arquitectura interna, datos de entrenamiento ni evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR; detalles internos no publicados en la informacion disponible) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | yue (cantonés), zh (mandarin), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por la nomenclatura (Qwen3-ASR) se trata de un modelo de la familia Qwen3 orientado a reconocimiento del habla, con un componente de audio y un decodificador de lenguaje, pero no se especifican en la informacion disponible ni el tipo de transformer, ni el numero de capas, ni la dimension oculta, ni la estrategia de atencion.

Tampoco se detallan los datos de entrenamiento: no se indica el volumen de horas de audio, la composicion del corpus (cantonés de Hong Kong, mandarin, ingles), ni si hubo etapas de ajuste supervisado, RLHF o DPO. La model card del repositorio cuantizado unicamente documenta el proceso de cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) y advierte de que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion. La innovacion tecnica destacable, por tanto, es la propia disponibilidad de cuantizaciones GGUF de un modelo ASR especializado, que habilita su ejecucion en llama.cpp y en flujos de ComfyUI.

## Capacidades

- Reconocimiento automatico del habla en cantonés de Hong Kong (yue-HK), con soporte declarado para mandarin (zh) e ingles (en).
- Manejo de code-switching entre yue, zh y en, segun las etiquetas del repositorio.
- Procesamiento multimodal de audio: el repositorio incluye ficheros mmproj (Q8_0 y f16) que actuan como suplemento multimodal para el codificador de audio.
- Uso conversacional: la etiqueta "conversational" sugiere interaccion en formato de dialogo, aunque no se detalla el formato de prompt exacto.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que puede servirse a traves de APIs compatibles.
- Integracion con ComfyUI: etiqueta explicita que apunta a flujos de generacion audiovisual.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, razonamiento multi-paso, vision general o audio generativo.

## Casos de uso

- Subtitulado automatico de contenido en cantonés: el modelo transcribe audio de videos, podcasts o retransmisiones de Hong Kong, y su tamano de 1,7 B permite procesar horas de material en hardware local sin depender de servicios en la nube.
- Transcripcion de reuniones con code-switching: en entornos profesionales de Hong Kong es habitual alternar cantonés, mandarin e ingles en la misma conversacion; el modelo esta etiquetado especificamente para este escenario, lo que reduce errores frente a ASR monolingues.
- Atencion al cliente en centros de llamadas: permite convertir grabaciones de llamadas en texto para analisis de calidad, busqueda y cumplimiento, con la ventaja de ejecutarse en infraestructura propia y mantener los datos dentro de la organizacion.
- Generacion de subtitulos en ComfyUI: al estar etiquetado para ComfyUI e incluir ficheros mmproj, puede integrarse en flujos de postproduccion que combinan generacion de video o audio con transcripcion automatica.
- Investigacion linguistica sobre cantonés: util para construir corpus anotados de yue-HK, estudiar variacion fonetica o entrenar modelos posteriores, dado que la licencia Apache 2.0 permite uso academico y comercial sin restricciones de atribucion adicionales.
- Prototipado de asistentes de voz locales: con cuantizaciones Q4_K_M de 1,2 GB, el modelo cabe en GPUs de consumo y permite desarrollar asistentes de voz en cantonés que funcionan sin conexion, util para demos y entornos con requisitos de privacidad.
- Accesibilidad: transcripcion en tiempo casi real de conversaciones para personas con discapacidad auditiva en contextos de habla cantonesa, donde las soluciones comerciales genericas suelen tener peor cobertura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB con Q2_K (0,9 GB de pesos), 1,2-1,3 GB con Q4_K_S o Q4_K_M, 1,5 GB con Q6_K, 1,9 GB con Q8_0 y 3,5 GB con f16. A estas cifras hay que sumar el suplemento multimodal mmproj (0,5 GB en Q8_0 o 0,7 GB en f16) y el espacio de trabajo para el contexto y el procesamiento de audio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad; A100 y H100 no son necesarias por el reducido tamano del modelo, aunque pueden usarse para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 4 GB o mas de VRAM; las cuantizaciones Q4_K_S y Q4_K_M estan marcadas como "fast, recommended" por el autor de la cuantizacion.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (previa importacion del GGUF), servidores compatibles con endpoints, y ComfyUI para flujos multimodales. El modelo base en transformers se sirve con la libreria transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware, de la cuantizacion y de la duracion del audio de entrada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables que permitan una comparacion rigurosa. Como referencia contextual, la familia Qwen3-ASR incluye variantes de mayor tamano, y existen modelos ASR multilingues de otros proveedores (por ejemplo, Whisper de OpenAI), pero no se aportan cifras que permitan contrastar parametros, contexto, WER ni licencia de forma verificable.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-Cantonese-HK (este) | 1,72 B | no disponible | yue, zh, en | Apache 2.0 | GGUF, safetensors |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La informacion publicada sobre el modelo es muy escasa: no hay detalles de arquitectura, datos de entrenamiento ni evaluacion, lo que dificulta estimar su calidad real frente a alternativas.
- Es un modelo especializado en yue-HK, zh y en; su rendimiento fuera de estos idiomas no esta documentado y probablemente sea pobre.
- Riesgo de alucinacion y de transcripciones incorrectas en audio con ruido, acentos no cantoneses, solapamiento de hablantes o vocabulario tecnico; no se aportan tasas de error (WER/CER) que permitan cuantificarlo.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar la calidad de transcripcion; el autor recomienda Q4_K_S, Q4_K_M y Q8_0 para un buen equilibrio.
- Las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion, segun advierte el propio autor de la cuantizacion.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base original (joe2643/Qwen3-ASR-1.7B-Cantonese-HK) y de la familia Qwen3 subyacente antes de un despliegue en produccion.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion por parte de la comunidad.
- No se documentan sesgos especificos, pero al entrenarse sobre habla de Hong Kong puede reflejar sesgos dialectales y sociolinguisticos de ese corpus.

## Enlaces

- Repositorio Hugging Face (cuantizacion GGUF): https://huggingface.co/mradermacher/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Modelo base: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK
- Pagina de resumen y descargas del autor de la cuantizacion: https://hf.tst.eu/model#Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
