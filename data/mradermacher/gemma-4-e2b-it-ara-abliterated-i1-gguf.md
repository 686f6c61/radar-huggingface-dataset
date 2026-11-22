# mradermacher/Gemma-4-E2B-it-ARA-Abliterated-i1-GGUF

## Resumen

Gemma-4-E2B-it-ARA-Abliterated-i1-GGUF es una cuantizacion en formato GGUF del modelo Austriani/Gemma-4-E2B-it-ARA-Abliterated, a su vez derivado de la familia Gemma 4 de Google DeepMind. El modelo original es un transformer multimodal (texto, vision y audio) disenado para despliegue en el borde y en dispositivo, con una arquitectura de atencion hibrida y una relacion entre parametros totales (5.1B) y efectivos (2.3B) que reduce el coste computacional en inferencia. Esta version concreta incorpora una ablacion de rango arbitrario (ARA, arbitrary-rank-ablation) aplicada con la herramienta heretic, que elimina la direccion de rechazo del modelo (abliterated/decensored) con una divergencia KL reportada de 0.1004 en el trial 61.

El trabajo de mradermacher consiste exclusivamente en la cuantizacion: genera una bateria amplia de variantes i1 (imatrix) que van desde IQ1_S (2.4 GB) hasta Q5_K_M (3.7 GB y superiores), lo que permite ejecutar el modelo en hardware muy modesto, incluidos equipos de consumo y dispositivos de borde. El repositorio ocupa 73.3 GB debido a la multiplicidad de cuantizaciones publicadas.

La relevancia actual de esta ficha radica en tres factores: la naturaleza multimodal del modelo base (vision-lenguaje y audio), su orientacion a despliegue on-device y la eliminacion de rechazos, que lo hace atractivo para casos de escritura creativa, roleplay y agentes sin restricciones de contenido, aunque con los riesgos asociados que se detallan mas abajo. El modelo esta publicado bajo licencia Apache 2.0 segun la model card, con enlace a la licencia de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje-audio) con atencion hibrida y sliding-window attention, per-layer embeddings |
| Parametros totales | 4.628.569.635 (segun safetensors); la model card declara 5.1B totales y 2.3B efectivos |
| Parametros activos | 2.3B efectivos (arquitectura con parametros efectivos reducidos, no MoE clasico segun los tags) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (segun tags); existe tambien una version de cuantizaciones estaticas en repo separado |
| Idiomas soportados | en (unico idioma declarado) |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transformer multimodal con atencion hibrida que combina atencion completa con sliding-window attention, ademas de per-layer embeddings. Segun los tags, el modelo procesa texto, vision y audio (vision-language, audio, omni), lo que lo situa en la categoria de modelos omni orientados a despliegue en el borde. La relacion entre 5.1B parametros totales y 2.3B efectivos sugiere un diseno que reduce el coste de computo por token sin recurrir a un MoE clasico, aunque la informacion disponible no detalla el mecanismo exacto.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. La innovacion tecnica destacable de esta version es la ablacion de rango arbitrario (ARA) aplicada sobre el modelo instruido, documentada con una divergencia KL de 0.1004 en el trial 61, que elimina la direccion de rechazo preservando en teoria el resto de capacidades. La cuantizacion i1 utiliza una matriz de importancia (imatrix) generada a partir de datos de calibracion, lo que mejora la calidad de las cuantizaciones de baja precision respecto a las estaticas.

## Capacidades

- Generacion de texto conversacional en ingles, con modo chat e instruct.
- Procesamiento multimodal: vision (imagenes) y audio, segun los tags del modelo base.
- Razonamiento multi-paso y soporte para uso como agente.
- Escritura creativa y roleplay, reforzado por la eliminacion de rechazos.
- Capacidad de function calling / tool calling: no confirmada en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Despliegue en dispositivo y en el borde gracias a su reducido numero de parametros efectivos.

## Casos de uso

- Roleplay y escritura creativa sin restricciones: la ablacion de rechazo permite generar narrativa y dialogos que el modelo original rechazaria, adecuado para plataformas de ficcion interactiva y juegos de rol por texto.
- Asistentes conversacionales on-device: con cuantizaciones de 2.4-3.5 GB, el modelo cabe en moviles de gama alta y mini-PC, permitiendo asistentes privados sin conexion a la nube.
- Procesamiento de imagenes en el borde: al ser vision-language, puede describir imagenes, extraer texto y responder preguntas visuales en dispositivos con recursos limitados.
- Transcripcion y comprension de audio local: la capacidad de audio del modelo base permite construir interfaces de voz privadas en hardware de consumo.
- Generacion de contenido para videojuegos: su tamano reducido y su capacidad creativa lo hacen util para generar dialogos de NPC y descripciones de objetos en tiempo real dentro del juego.
- Prototipado rapido de agentes: con 2.3B parametros efectivos, se puede iterar sobre flujos de agente en una sola GPU de consumo antes de escalar a modelos mayores.
- Educacion y tutoria personalizada: despliegue local en aulas o dispositivos sin conectividad, con contenido adaptado y sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 2.5 GB (IQ2) y 4.5 GB (Q6_K) aproximadamente, segun el tamano del fichero GGUF y el overhead de contexto.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para las cuantizaciones medias; RTX 3060, RTX 4060, RTX 4090 para mayor velocidad; A100/H100 no son necesarias dado el tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas de 6 GB o mas; las cuantizaciones IQ2 permiten incluso GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa generalizada.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen en gran medida de la cuantizacion y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-E2B-it-ARA-Abliterated-i1-GGUF | 5.1B totales / 2.3B efectivos | no disponible | Si (vision, audio) | Apache 2.0 | GGUF en HF |
| Gemma-4-E2B-it (original) | 5.1B totales / 2.3B efectivos | no disponible | Si (vision, audio) | Licencia Gemma 4 | HF |
| Modelos abliterated de 7-8B | ~7-8B | variable | Generalmente solo texto | variable | GGUF en HF |

La comparativa con modelos de la misma categoria (pequenos multimodales on-device) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion de rechazo elimina los filtros de seguridad del modelo original; puede generar contenido sensible, ofensivo o inapropiado sin advertencia.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente en tareas de razonamiento complejo y datos factuales.
- Solo soporta ingles; no se garantiza un rendimiento correcto en castellano ni en otros idiomas.
- La longitud de contexto no esta documentada, lo que dificulta planificar casos de uso con ventanas largas.
- La licencia Apache 2.0 declarada remite a la licencia de Gemma 4 de Google; conviene verificar los terminos de uso comercial del modelo base antes de desplegarlo en produccion.
- La cuantizacion introduce perdida de calidad; las variantes IQ1 e IQ2 pueden degradar notablemente la coherencia.
- El modelo es un derivado no oficial de Gemma 4; no cuenta con el respaldo de Google DeepMind.
- La informacion sobre tool calling y modo thinking no esta confirmada, por lo que no debe asumirse en disenos de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Gemma-4-E2B-it-ARA-Abliterated-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/Austriani/Gemma-4-E2B-it-ARA-Abliterated
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Gemma-4-E2B-it-ARA-Abliterated-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemma-4-E2B-it-ARA-Abliterated-i1-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
