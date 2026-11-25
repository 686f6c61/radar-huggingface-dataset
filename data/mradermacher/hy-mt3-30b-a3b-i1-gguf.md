# mradermacher/Hy-MT3-30B-A3B-i1-GGUF

## Resumen

Hy-MT3-30B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Tencent, con 30.064.725.888 parametros totales y, segun la nomenclatura del nombre, 3.000 millones de parametros activos por token. El repositorio analizado, `mradermacher/Hy-MT3-30B-A3B-i1-GGUF`, es una cuantizacion de terceros publicada por mradermacher en formato GGUF, generada a partir de los pesos originales de Tencent mediante el metodo de cuantizacion con imatrix (importance matrix) y el pipeline de conversion de Hugging Face.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de 30.000 millones de parametros en hardware de consumo gracias a la cuantizacion GGUF, manteniendo solo una fraccion de los parametros activos por token. Sin embargo, la informacion publica disponible sobre el modelo base es muy limitada: la model card del repositorio cuantizado no incluye descripcion funcional, idiomas, licencia ni datos de entrenamiento, por lo que buena parte de las especificaciones se marcan como no disponibles.

El repositorio tiene un tamano de 24,6 GB y, en el momento de la consulta, registra 0 descargas y 0 likes, lo que indica una publicacion muy reciente (creada el 25 de noviembre de 2026) y sin validacion comunitaria todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), segun la nomenclatura del modelo (no se detalla en la model card) |
| Parametros totales | 30.064.725.888 |
| Parametros activos | 3.000 millones (inferido del sufijo "A3B" del nombre; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, IQ4_NL (small), Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); pesos originales en safetensors en el repositorio de Tencent |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. El nombre `Hy-MT3-30B-A3B` sigue la convencion habitual de los modelos MoE, donde "30B" indica los parametros totales y "A3B" los parametros activos por token (3.000 millones). Esto sugiere una arquitectura transformer con capas de mezcla de expertos dispersas, pero no se dispone de confirmacion en la model card del repositorio cuantizado.

Respecto al entrenamiento, no se han publicado en la informacion disponible datos sobre el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. La model card del repositorio de mradermacher se limita a metadatos tecnicos del proceso de cuantizacion (version de quantize, tipo de conversion `hf`, uso de imatrix y lista de cuantizaciones generadas) y a la referencia al repositorio original `tencent/Hy-MT3-30B-A3B`.

La innovacion tecnica destacable en este repositorio es el uso de cuantizacion con imatrix (importance matrix), que pondera la precision de los pesos en funcion de su importancia para la activacion, mejorando la calidad de las cuantizaciones de baja precision (IQ1, IQ2, IQ3) respecto a la cuantizacion uniforme.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio indica que el modelo esta orientado a dialogos multi-turno.
- Razonamiento y generacion de texto general: capacidades propias de un modelo de lenguaje de 30B parametros totales, aunque no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se especifican idiomas en la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Despliegue local en hardware de consumo: gracias a las cuantizaciones GGUF de baja precision (Q4_K_M, IQ4_XS, Q3_K_M), el modelo puede ejecutarse en equipos con GPU de 16-24 GB de VRAM o incluso en CPU con llama.cpp, algo inviable con los pesos originales en safetensors de 30B.
- Experimentacion e investigacion: util para investigadores que quieran evaluar el comportamiento de un MoE de 30B con 3B activos sin disponer de infraestructura de datacenter, usando las cuantizaciones IQ para comparar la degradacion de calidad frente a los pesos originales.
- Prototipado de asistentes conversacionales: el tag `conversational` sugiere su uso en chatbots y asistentes de dialogo; puede integrarse en aplicaciones locales mediante llama.cpp u Ollama para pruebas de concepto.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece hasta 24 variantes de cuantizacion, lo que permite medir el impacto de la precision en tareas concretas y elegir el punto de equilibrio calidad/VRAM para un caso de uso determinado.
- Inferencia en entornos con recursos limitados: al activar solo una fraccion de los parametros por token, el coste computacional por token es menor que el de un modelo denso de 30B, lo que mejora el throughput en CPU y GPU modestas.
- Servicio de inferencia self-hosted: puede desplegarse con llama.cpp o servidores compatibles con GGUF para ofrecer una API local de generacion de texto sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Las variantes Q2_K e IQ2 rondan los 10-12 GB; Q3_K_M e IQ3 en torno a 13-14 GB; Q4_K_M e IQ4_XS aproximadamente 17-18 GB; Q5_K_M cerca de 21 GB; Q6_K alrededor de 24 GB. Estas cifras son estimaciones a partir del tamano del repo (24,6 GB con todas las variantes) y del numero de parametros, no datos confirmados por el autor.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4 y Q5; RTX 3090 (24 GB) para Q4; A100 40/80 GB o H100 para los pesos originales en safetensors y cuantizaciones altas con contexto largo.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB (RTX 4060 Ti, RTX 4070 Ti Super) con cuantizaciones Q3 o IQ3, y en tarjetas de 24 GB (RTX 4090, RTX 3090) con Q4/Q5. Las cuantizaciones IQ2 y Q2 pueden caber en 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo OpenAI, aunque no se detalla.
- Latencia y throughput estimados: no disponibles. Al ser un MoE con 3B activos, se espera un throughput superior al de un modelo denso de 30B, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT3-30B-A3B (este) | 30,06B | 3B (inferido) | no disponible | no disponible | GGUF, safetensors |
| Mixtral 8x7B | 46,7B | 12,9B | 32k | Apache 2.0 | safetensors, GGUF |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32k | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32k | MIT (codigo) / licencia propia | safetensors, GGUF |

La comparativa se ofrece como referencia de categoria (MoE de tamano medio con pocos parametros activos), pero no se dispone de datos de rendimiento del modelo Hy-MT3 que permitan una comparacion cuantitativa. No se han publicado benchmarks en la informacion disponible.

## Limitaciones y advertencias

- La model card del repositorio cuantizado no incluye informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad; se desconoce el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones publicadas que lo cuantifiquen para este modelo.
- Limitaciones de contexto e idioma: no disponibles; no se especifica la ventana de contexto ni los idiomas soportados.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada, por lo que no se puede confirmar si el uso comercial esta permitido. Es imprescindible consultar el repositorio original `tencent/Hy-MT3-30B-A3B` antes de cualquier uso en produccion.
- Las cuantizaciones de muy baja precision (IQ1, IQ2) pueden degradar notablemente la calidad; se recomienda validar la variante elegida con tareas representativas antes de desplegarla.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria de la calidad de las cuantizaciones ni de la fidelidad respecto a los pesos originales.
- Los parametros activos (3B) se infieren del nombre del modelo y no estan confirmados en la model card; conviene verificar la configuracion del modelo base.

## Enlaces

- Repositorio Hugging Face (cuantizacion GGUF): https://huggingface.co/mradermacher/Hy-MT3-30B-A3B-i1-GGUF
- Repositorio original del modelo base: https://huggingface.co/tencent/Hy-MT3-30B-A3B
