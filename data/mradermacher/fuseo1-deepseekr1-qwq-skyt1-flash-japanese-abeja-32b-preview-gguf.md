# mradermacher/FuseO1-DeepSeekR1-QwQ-SkyT1-Flash-Japanese-ABEJA-32B-Preview-GGUF

## Resumen

Este repositorio contiene cuantizaciones estáticas en formato GGUF del modelo `nitky/FuseO1-DeepSeekR1-QwQ-SkyT1-Flash-Japanese-ABEJA-32B-Preview`, una variante en japonés del modelo de fusión FuseO1-DeepSeekR1-QwQ-SkyT1-32B-Preview desarrollado por el proyecto FuseAI. No es un modelo entrenado desde cero: es el resultado de aplicar técnicas de model merging (con `mergekit`) sobre tres modelos de razonamiento de 32B —DeepSeek-R1-Distill-Qwen-32B, QwQ-32B-Preview y Sky-T1-32B-Preview—, seguido de una adaptación al japonés y de una fusión adicional con material de ABEJA que no está documentada en la información disponible. El trabajo de cuantización lo firma mradermacher (nethype GmbH), un actor habitual en la publicación de versiones GGUF de modelos abiertos.

El interés práctico del modelo reside en su tamaño: 32.763.876.352 parámetros (~32,8B) en una arquitectura densa, lo que permite ejecutarlo en una sola GPU de 24 GB con cuantizaciones Q4, o incluso en CPU con suficiente RAM. Frente a los 671B de DeepSeek-R1, un modelo de 32,8B con razonamiento destilado y fusionado ofrece un compromiso atractivo entre calidad de razonamiento (el modelo FuseAI original reporta 74,0 Pass@1 en AIME24) y coste de despliegue.

La relevancia es doble: por un lado, la cadena de fusión demuestra que el model merging puede superar a los modelos individuales que lo componen en tareas de matemáticas y razonamiento; por otro, esta variante concreta es una de las pocas opciones de 32B con capacidad de razonamiento explícito orientada específicamente al japonés y publicada bajo licencia Apache 2.0, lo que facilita su uso comercial. La contrapartida es la ausencia de evaluación publicada para esta variante concreta y la baja tracción comunitaria del repositorio (94 descargas y 1 like en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (no MoE), derivado de la familia Qwen2.5-32B vía los modelos fusionados; fusión realizada con mergekit |
| Parámetros totales | 32.763.876.352 (~32,8B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0. El autor indica que en el momento de publicar la model card no había cuantizaciones con imatrix/weighted |
| Idiomas soportados | Japonés (`ja`), único idioma declarado en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors vía transformers |
| Tamaño del repositorio | 224,0 GB |
| Pipeline declarado | No disponible (HuggingFace no pudo determinar el tipo de pipeline) |
| Fecha de creación | 2025-02-11 |
| Última actualización | 2026-10-18 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de ~32,8B parámetros. No hay innovaciones de arquitectura propias: el modelo hereda la estructura de Qwen2.5-32B presente en los tres modelos de origen, todos ellos destilaciones o derivados de esa base (DeepSeek-R1-Distill-Qwen-32B, QwQ-32B-Preview y Sky-T1-32B-Preview). La contribución técnica es la fusión: FuseAI aplica model merging sobre modelos con fortalezas complementarias en razonamiento matemático y de código, una técnica que combina pesos sin necesidad de un ciclo completo de preentrenamiento y que, según los resultados publicados por el propio proyecto, supera a cada componente por separado en AIME24.

Sobre la capa japonesa y la fusión con ABEJA no hay información pública en los materiales consultados: se desconoce si hubo SFT, DPO o una simple fusión de pesos con un modelo japonés, qué volumen de tokens japoneses se empleó ni la composición del dataset. Tampoco se documenta si se aplicó RLHF o DPO en la variante japonesa. El modelo conserva el modo de razonamiento con cadena de pensamiento largo característico de R1 y QwQ, aunque no se especifica cómo se activa o desactiva en esta variante.

## Capacidades

- Generación de texto en japonés, con registro formal y capacidad de mantener conversaciones multi-turno.
- Razonamiento con cadena de pensamiento extensa (herencia de DeepSeek-R1 y QwQ), orientado a problemas de varios pasos.
- Razonamiento matemático de competición: la familia de la que deriva reporta resultados altos en AIME24 y tareas similares.
- Generación y explicación de código, incluyendo comentarios y documentación en japonés.
- Explicación paso a paso de conceptos técnicos y científicos en japonés.
- Soporte de tool calling / function calling: no confirmado para esta variante concreta en la información disponible.
- Capacidades de agente y multi-step reasoning: no confirmadas explícitamente, aunque el modo de razonamiento largo es compatible con flujos de varios pasos.
- Capacidades multilingües: solo el japonés está declarado; el inglés probablemente funcione por herencia de los modelos base, pero no está garantizado ni evaluado.
- Visión y audio: no soportados.

## Casos de uso

- Atención al cliente en japonés: el modelo puede gestionar conversaciones multi-turno con registro keigo y derivar a un humano cuando detecta ambigüedad. Es adecuado por su entrenamiento específico en japonés y su capacidad de razonamiento para resolver consultas con múltiples condiciones.
- Tutoría de matemáticas y STEM en japonés: gracias a la cadena de pensamiento heredada de R1/QwQ, puede desglosar la resolución de un problema paso a paso y explicar el error en cada intento del alumno, un caso de uso directamente alineado con las fortalezas del merge original en AIME24.
- Asistencia a desarrollo de software con documentación japonesa: generación de código, revisión de parches y explicación de APIs en japonés, integrable en un IDE o en un pipeline de revisión. Requiere validar previamente si el tool calling funciona en esta variante.
- RAG sobre corpus documentales japoneses: contratos, manuales técnicos y normativa interna. El modelo puede resumir, extraer cláusulas y responder preguntas citando el fragmento recuperado, con la ventaja de ejecutarse on-premise sin enviar datos a una API externa.
- Localización y traducción técnica japonés-inglés: traducción de documentación de producto manteniendo terminología consistente, con el modelo actuando como revisor del glosario en una segunda pasada.
- Resumen de reuniones y actas: transcripciones en japonés convertidas en actas estructuradas con acuerdos, responsables y fechas, un flujo donde el contexto largo y el razonamiento sobre múltiples hablantes son relevantes.
- Despliegue en entornos air-gapped: al distribuirse en GGUF bajo Apache 2.0, puede ejecutarse con llama.cpp en hardware sin conexión, lo que encaja en sectores regulados (banca, sanidad, administración pública japonesa).
- Extracción estructurada de datos de formularios y correos en japonés hacia JSON, usando el modo de razonamiento para resolver campos ambiguos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta variante japonesa ni para la variante "Flash" en la información disponible. Los únicos datos numéricos disponibles corresponden al modelo upstream de FuseAI (`FuseAI/FuseO1-DeepSeekR1-QwQ-SkyT1-32B-Preview`), que no es idéntico a este: no incorpora la capa japonesa ni la fusión con ABEJA, y no se ha verificado que sus resultados se trasladen a esta variante.

| Modelo | AIME24 Pass@1 | AIME24 Cons@32 |
|---|---|---|
| FuseO1-DeepSeekR1-QwQ-SkyT1-32B-Preview (upstream FuseAI) | 74,0 | 86,7 |
| DeepSeek-R1-Distill-Qwen-32B | 69,2 | No disponible |
| OpenAI o1-preview | 44,6 | No disponible |
| OpenAI o1-mini | 63,4 | No disponible |
| OpenAI o1 | 79,2 | No disponible |

Estos valores proceden de la documentación del proyecto FuseAI y deben tratarse como referencia del linaje, no como una evaluación de este repositorio GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia (según los tamaños de fichero publicados): Q2_K ~12,4 GB; Q3_K_M ~16,0 GB; IQ4_XS ~18,0 GB; Q4_K_M ~20,0 GB; Q5_K_M ~23,4 GB; Q6_K ~27,0 GB; Q8_0 ~34,9 GB. En FP16 serían ~65,5 GB (32,76B × 2 bytes).
- GPU consumer: sí cabe. Una RTX 4090 o RTX 3090 de 24 GB ejecuta Q4_K_M con contexto moderado y Q5_K_M al límite; una GPU de 16 GB solo admite Q2_K o Q3_K_S con contexto corto. Q6_K y Q8_0 requieren 32-48 GB.
- GPU profesionales: A100 40 GB para Q8_0 con contexto amplio; L40S o RTX A6000 de 48 GB para Q8_0 holgado; A100 80 GB o H100 80 GB para FP16.
- CPU: con 32 GB de RAM se puede ejecutar Q4_K_M a velocidades de pocos tokens por segundo; Q8_0 requiere 64 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui para los ficheros GGUF; vLLM solo con soporte GGUF experimental; TGI y vLLM estándar requieren los pesos safetensors del modelo base, no este repositorio.
- Latencia y throughput: no hay mediciones publicadas. Como estimación teórica a partir del ancho de banda de memoria, en una RTX 4090 (~1 TB/s) un modelo denso de 32,8B en Q4_K_M (20 GB) tiene un techo de aproximadamente 50 tokens/s, con valores reales típicamente bastante inferiores; no debe tomarse como dato medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (FuseO1-...-Japanese-ABEJA-32B-Preview GGUF) | 32,8B | No disponible | Apache 2.0 | GGUF Q2-Q8 | Especializado en japonés; sin evaluación publicada; 94 descargas |
| FuseAI/FuseO1-DeepSeekR1-QwQ-SkyT1-32B-Preview | 32,8B | No disponible | No confirmada en la información consultada | Safetensors | Modelo upstream del linaje; 74,0 Pass@1 en AIME24 |
| DeepSeek-R1-Distill-Qwen-32B | 32,8B | No disponible | No confirmada en la información consultada | Safetensors, GGUF | Componente del merge; 69,2 Pass@1 en AIME24; orientado a inglés/chino |
| QwQ-32B-Preview | 32,8B | No disponible | No confirmada en la información consultada | Safetensors, GGUF | Componente del merge; fuerte en razonamiento matemático, cadena de pensamiento muy verbosa |
| Sky-T1-32B-Preview | 32,8B | No disponible | No confirmada en la información consultada | Safetensors | Componente del merge; entrenado con datos de razonamiento sintéticos de bajo coste |

La comparación directa más honesta es contra los tres modelos que componen la fusión: este repositorio no aporta mejoras verificables sobre ellos en inglés, y su valor diferencial está exclusivamente en el soporte de japonés.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks de esta variante japonesa ni de la variante "Flash". Los 74,0 puntos de AIME24 corresponden al modelo FuseAI original, no a este.
- La capa japonesa y la fusión con ABEJA no están documentadas: se desconoce el volumen de datos, el método (SFT, DPO o mera fusión de pesos) y el impacto real en la calidad en japonés.
- Trazabilidad de licencias: aunque la model card declara Apache 2.0, el modelo deriva de tres modelos de terceros cuyos términos deben verificarse antes de un uso comercial; conviene revisar las licencias de Qwen2.5, DeepSeek-R1-Distill-Qwen-32B y Sky-T1.
- Idioma declarado único: solo `ja`. El uso en castellano no está soportado ni evaluado y previsiblemente dará resultados pobres o con mezcla de idiomas.
- Riesgo de alucinación: inherente a los modelos de razonamiento destilados, especialmente en dominios factuales y en la generación de citas o referencias normativas.
- Verbosidad: el modo de razonamiento heredado de R1 y QwQ genera cadenas de pensamiento largas, lo que incrementa la latencia y el consumo de tokens en producción; no se documenta un modificador para desactivarlo.
- Longitud de contexto desconocida: impide dimensionar con seguridad casos de uso con documentos largos.
- Baja validación comunitaria: 94 descargas y 1 like, sin discusiones públicas, lo que reduce la confianza en la calidad de las cuantizaciones y en la reproducibilidad.
- Cuantizaciones Q2_K y Q3_K_S con degradación esperable en tareas de razonamiento matemático, precisamente la fortaleza del modelo; para producción se recomienda Q4_K_M o superior.
- No hay cuantizaciones imatrix/weighted disponibles en el momento de publicar la model card, lo que limita la calidad por GB en los tamaños pequeños.
- Repositorio de 224 GB: la descarga completa es costosa; conviene bajar solo el fichero de cuantización necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/FuseO1-DeepSeekR1-QwQ-SkyT1-Flash-Japanese-ABEJA-32B-Preview-GGUF
- Modelo base (japonés, safetensors): https://huggingface.co/nitky/FuseO1-DeepSeekR1-QwQ-SkyT1-Flash-Japanese-ABEJA-32B-Preview
- Modelo FuseAI de referencia (linaje, sin capa japonesa): https://huggingface.co/FuseAI/FuseO1-DeepSeekR1-QwQ-SkyT1-32B-Preview
- Repositorio del proyecto FuseAI: https://github.com/fanqiwan/FuseAI
- Versión GGUF del modelo FuseAI sin capa japonesa: https://huggingface.co/mradermacher/FuseO1-DeepSeekR1-QwQ-SkyT1-Flash-32B-Preview-GGUF
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#FuseO1-DeepSeekR1-QwQ-SkyT1-Flash-Japanese-ABEJA-32B-Preview-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
