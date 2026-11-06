# mradermacher/Erebus-RP-Engine-26B-A4B-GGUF

## Resumen

Erebus-RP-Engine-26B-A4B-GGUF es la version cuantizada en formato GGUF del modelo Erebus-RP-Engine-26B-A4B, publicado por el usuario mradermacher en Hugging Face. Se trata de una conversion estatica (no de una cuantizacion dinamica) del modelo original alojado en el repositorio Naphula/Erebus-RP-Engine-26B-A4B, orientada a inferencia local mediante llama.cpp y herramientas compatibles con el formato GGUF.

El modelo cuenta con 25.971.339.550 parametros totales segun los pesos en safetensors, lo que lo situa en la categoria de 26B. La nomenclatura "A4B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4B de parametros activos, aunque esta informacion no se confirma explicitamente en la documentacion disponible. El sufijo "RP" apunta a un ajuste orientado a roleplay y conversacion.

La relevancia de esta ficha radica en que se trata de un modelo muy reciente (creado en noviembre de 2026 segun los metadatos) y con un numero de descargas y likes nulo en el momento de la consulta, lo que indica que no existe aun validacion comunitaria ni benchmarks publicos. El repositorio ocupa 91,2 GB e incluye multiples niveles de cuantizacion, lo que facilita su despliegue en hardware de consumo con las variantes mas agresivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la nomenclatura A4B sugiere MoE, sin confirmar) |
| Parametros totales | 25.971.339.550 |
| Parametros activos | No disponible (probablemente ~4B segun el sufijo A4B, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors como origen de la conversion) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. El identificador "26B-A4B" sigue el patron de nomenclatura habitual para modelos de mezcla de expertos con parametros totales y activos diferenciados, pero no se confirma en la model card. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado.

La unica informacion tecnica disponible proviene de los metadatos de cuantizacion del repositorio: se trata de cuantizaciones estaticas (quantize_version 2) con tensores de salida cuantizados, conversion de tipo hf, y se ha omitido el tensor mmproj (skip_mmproj: 1), lo que indica que no se incluye proyector multimodal en estas conversiones. El modelo base es el publicado por Naphula en Hugging Face.

## Capacidades

- Generacion de texto conversacional orientada a roleplay y dialogo multi-turno, segun indica el nombre del modelo.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere integracion con APIs de inferencia.
- Capacidad de razonamiento y generacion de codigo: no confirmada en la documentacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. La omision del tensor mmproj descarta vision en estas conversiones.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo esta disenado especificamente para este proposito (sufijo RP en el nombre) y puede mantener conversaciones de personaje multi-turno, aunque la longitud de contexto no esta documentada.
- Despliegue local en hardware de consumo: las cuantizaciones Q2_K y Q3_K permiten ejecutar el modelo en GPUs con VRAM limitada mediante llama.cpp, aunque con perdida de calidad frente a Q5_K_M o Q8_0.
- Prototipado de asistentes conversacionales: la compatibilidad con endpoints facilita integrarlo en entornos de prueba con APIs compatibles con OpenAI.
- Experimentacion con modelos MoE: si se confirma la arquitectura de mezcla de expertos, sirve para estudiar el comportamiento de modelos con parametros activos reducidos en tareas de generacion creativa.
- Fine-tuning posterior sobre GGUF: no es el flujo habitual, pero las cuantizaciones Q8_0 y x-f16 permiten servir como base para experimentos de ajuste con herramientas compatibles.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 12 variantes, lo que permite medir el impacto de la cuantizacion en calidad de salida para un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para 26B totales, Q2_K ronda los 9-10 GB, Q4_K_M en torno a 15-16 GB, Q8_0 aproximadamente 27-28 GB y x-f16 cerca de 52 GB. Si el modelo es MoE con ~4B activos, la velocidad de inferencia sera mas cercana a un modelo de 4B que a uno denso de 26B.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para las mismas variantes; A100 40 GB o H100 para Q8_0 y x-f16.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB con Q2_K o Q3_K; en RTX 4070 Ti / 4080 16 GB con Q4_K_S o Q4_K_M; en RTX 4090 con Q5_K_M y Q6_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. vLLM y TGI no soportan GGUF de forma nativa generalizada.
- Latencia y throughput: no disponibles. Al ser un modelo MoE con ~4B activos (si se confirma), el throughput deberia ser notablemente superior al de un modelo denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre modelos comparables en la misma categoria (26B MoE orientado a roleplay) ni de datos de rendimiento del modelo base que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de retroalimentacion sobre calidad o estabilidad.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base en Naphula/Erebus-RP-Engine-26B-A4B antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: inherente a los modelos generativos, agravado por la falta de benchmarks y evaluaciones publicadas.
- Sesgos conocidos: no documentados, pero al ser un modelo de roleplay es probable que presente sesgos derivados de los datos de entrenamiento conversacional, sin que exista informacion para cuantificarlos.
- Limitaciones de contexto e idioma: no documentadas. No se conoce la ventana de contexto real ni los idiomas soportados oficialmente.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K pueden degradar notablemente la coherencia en tareas de razonamiento o generacion larga.
- Ausencia de capacidades multimodales: el tensor mmproj se ha omitido en la conversion, por lo que no hay soporte de vision en estas versiones GGUF.
- Fecha de creacion futura en los metadatos (2026): conviene tratar los datos temporales con cautela y verificar la vigencia del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Erebus-RP-Engine-26B-A4B-GGUF
- Modelo base: https://huggingface.co/Naphula/Erebus-RP-Engine-26B-A4B
