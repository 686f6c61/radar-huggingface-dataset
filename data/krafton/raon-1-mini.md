# KRAFTON/Raon-1-mini

## Resumen

Raon-1 mini es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado desde cero por KRAFTON AI, el brazo de inteligencia artificial de la editora de videojuegos surcoreana KRAFTON. Con 28.800 millones de parametros totales y 4.300 millones activos por token, se posiciona en la categoria de modelos MoE de tamano medio con activacion esparcida, disenado especificamente para conversacion multi-turno, tareas agenticas y razonamiento con esfuerzo configurable.

El modelo emplea una arquitectura hibrida que combina 18 capas de atencion lineal Raon Delta Attention (RDA) con 7 capas de Gated MLA, lo que reduce drasticamente el coste de cache KV en contextos largos: solo las capas MLA mantienen cache, con un consumo de aproximadamente 8 KiB por token en BF16. Soporta de forma nativa hasta 262.144 tokens de contexto y se distribuye bajo licencia Apache 2.0, lo que facilita su adopcion comercial.

Su relevancia actual radica en tres factores: un modo de razonamiento con seis niveles de esfuerzo seleccionables por peticion, un rendimiento destacado en benchmarks de conversacion multi-turno y busqueda agentica, y la disponibilidad de cuantizaciones MXFP8 y NVFP4 que permiten ejecutar el modelo en una unica GPU de consumo como la RTX 5090 (32 GB de VRAM). El entrenamiento cubre coreano, ingles, japones, chino, espanol, frances y tailandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (18 capas Raon Delta Attention + 7 capas Gated MLA) |
| Parametros totales | 28.783.231.202 (28,8B) |
| Parametros activos | 4,3B (6 expertos enrutados + 1 compartido de 128) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MXFP8 y NVFP4 |
| Idiomas soportados | Coreano, ingles, japones, chino, espanol, frances y tailandes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 32,7 GB) |

Otros datos tecnicos relevantes: 25 capas totales, tamano oculto de 2.560, 40 cabezas de atencion (dimension 128 para RDA; 192 QK / 128 V para Gated MLA), rango LoRA de query/KV de 576/512 en Gated MLA, tamano intermedio de experto de 1.088, FFN densa de la primera capa de 12.032, funcion de activacion SiTU-GLU, conexiones residuales Raon-mHC con 4 flujos, vocabulario de 259.840 tokens, LM head no atada y codificacion posicional NoPE.

## Arquitectura y entrenamiento

Raon-1 mini es un transformer MoE hibrido entrenado desde cero. La innovacion arquitectonica principal es Raon Delta Attention (RDA), una variante de Kimi Delta Attention que desacopla las compuertas de borrado y escritura, mejorando el rendimiento en contextos largos respecto a KDA. Al aplicar atencion lineal con estado de tamano fijo en 18 de las 25 capas, el modelo evita el crecimiento cuadratico de la cache KV: solo las 7 capas Gated MLA conservan cache, lo que resulta en unos 8 KiB por token en BF16. Adicionalmente, Raon-mHC reduce el coste computacional de las hyper-connections con restriccion de variedad (mHC) de DeepSeek, acelerando el entrenamiento.

El modelo usa enrutamiento esparcido con 128 expertos, de los cuales se activan 6 mas 1 compartido por token, con un tamano intermedio de experto de 1.088. La codificacion posicional es NoPE (sin codificacion posicional), lo que delega la informacion de orden en el propio mecanismo de atencion. El modelo incorpora razonamiento integrado con seis niveles de esfuerzo (`none`, `low`, `medium`, `high`, `xhigh`, `max`) seleccionables por peticion. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos figuran como no disponibles. Se proporciona un modelo draft DFlash2 para decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento integrado con seis niveles de esfuerzo configurables por peticion.
- Razonamiento matematico y cientifico de alto nivel (AIME 2026, HMMT Feb 2026, GPQA Diamond).
- Tool calling para flujos de trabajo agenticos, con soporte declarado para Hermes Agent, Pi y OpenCode.
- Ejecucion de agentes y razonamiento multi-paso, incluyendo busqueda web agentica (BrowseComp Plus).
- Capacidades multilingues en coreano, ingles, japones, chino, espanol, frances y tailandes, con especial solidez en coreano.
- Decodificacion especulativa mediante el modelo draft DFlash2.
- Capacidad de seguir instrucciones complejas (IFBench) y conocimiento general (AA-Omniscience).
- No se declaran capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada en coreano e ingles: el modelo puede mantener conversaciones multi-turno extensas gracias a su ventana de 262.144 tokens y su rendimiento lider en MultiChallenge (64,9), adecuado para historiales de soporte largos.
- Agentes de busqueda y recuperacion de informacion: con soporte de tool calling y una puntuacion de 55,9 en BrowseComp Plus, puede orquestar busquedas web multi-paso y sintetizar resultados en un flujo agentico.
- Asistencia a desarrollo de software: con soporte para OpenCode y Hermes Agent, puede integrarse en entornos de programacion agentica para generar, revisar y refactorizar codigo dentro de un pipeline de herramientas.
- Razonamiento matematico y cientifico asistido: sus resultados en AIME 2026 (96,7), HMMT Feb 2026 (87,1) y GPQA Diamond (86,0) lo hacen apto para tutoria STEM, verificacion de derivaciones y resolucion de problemas de nivel competitivo.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantizacion NVFP4 permite ejecutar el modelo completo en una RTX 5090 de 32 GB, habilitando asistentes locales privados sin dependencia de la nube.
- Procesamiento de documentos largos y contratos: la combinacion de contexto de 262.144 tokens y atencion lineal con cache KV reducida permite analizar expedientes extensos con coste de memoria acotado.
- Traduccion y localizacion multilingue: cubre siete idiomas, incluido el espanol, lo que permite su uso en pipelines de localizacion para mercados coreano, japones, chino, tailandes, frances e hispanohablante.
- Generacion de contenido conversacional para productos interactivos: su entrenamiento orientado a dialogo y su tono conversacional encajan en asistentes de videojuegos y comunidades, dado el origen de KRAFTON en la industria del videojuego.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa frente a Qwen3.6 35B-A3B, Gemma 4 26B-A4B, Flint (40B-A2.5B) e Inkling 2 Mini. Los valores numericos explicitamente citados en el texto de la model card son los siguientes:

| Benchmark | Raon-1 mini |
|---|---|
| AIME 2026 | 96,7 |
| HMMT Feb 2026 | 87,1 |
| GPQA Diamond | 86,0 |
| MultiChallenge | 64,9 |
| BrowseComp Plus | 55,9 |

La model card menciona ademas resultados en AA-Omniscience, IFBench, SWE-Verified, GDPVal y Chatbot Korean (interno), pero los valores numericos de esos benchmarks no estan disponibles en la informacion proporcionada. Los resultados del resto de modelos comparados tampoco se incluyen en el texto disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 57,6 GB solo para pesos (28,8B parametros a 2 bytes), mas cache KV de las capas MLA (unos 8 KiB por token); se recomienda un minimo de 80 GB para contexto largo.
- VRAM estimada en MXFP8: aproximadamente 28,8 GB para pesos; requiere GPU con soporte de FP8 (H100, H200, B200, RTX 5090).
- VRAM estimada en NVFP4: aproximadamente 14,4 GB para pesos; la model card indica que NVFP4 permite inferencia en una unica NVIDIA RTX 5090 (32 GB), dejando margen para cache KV y overhead.
- GPU recomendadas: H100/H200/B200 para BF16 y MXFP8 a maxima longitud de contexto; RTX 5090 para NVFP4 en entorno de consumo o estacion de trabajo.
- Cabe en GPU de consumo: si, en RTX 5090 (32 GB) con cuantizacion NVFP4; en BF16 no cabe en GPU de consumo.
- Opciones de despliegue: transformers (libreria declarada, con custom_code), y previsiblemente vLLM y TGI para produccion; no se confirma soporte de llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La decodificacion especulativa con el draft DFlash2 deberia reducir la latencia de generacion, pero no se publican cifras concretas.

## Comparativa con modelos similares

La model card compara Raon-1 mini con los siguientes modelos MoE de tamano similar. Los datos de parametros y contexto de los competidores no estan disponibles en la informacion proporcionada, por lo que se indican como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Raon-1 mini | 28,8B totales / 4,3B activos | 262.144 | Apache 2.0 | Hugging Face |
| Qwen3.6 35B-A3B | 35B totales / 3B activos (segun nombre) | no disponible | no disponible | no disponible |
| Gemma 4 26B-A4B | 26B totales / 4B activos (segun nombre) | no disponible | no disponible | no disponible |
| Flint | 40B totales / 2,5B activos (segun nombre) | no disponible | no disponible | no disponible |
| Inkling 2 Mini | no disponible | no disponible | no disponible | no disponible |

Segun la model card, Raon-1 mini lidera a estos modelos en MultiChallenge (64,9) y BrowseComp Plus (55,9). El resto de comparaciones numericas no estan disponibles en el texto proporcionado.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; al estar entrenado con datos web multilingues, es probable que herede sesgos de esas fuentes, pero no hay evaluacion publicada.
- Riesgo de alucinacion: no se cuantifica; como todo modelo generativo, puede producir afirmaciones incorrectas, especialmente en tareas de conocimiento factual (AA-Omniscience se evalua pero su valor no se publica).
- Limitaciones de contexto: aunque soporta 262.144 tokens, el rendimiento efectivo en el extremo de la ventana no esta documentado con evaluaciones de aguja en pajar.
- Limitaciones de idioma: el modelo esta optimizado para coreano e ingles; el rendimiento en espanol, frances, japones, chino y tailandes es secundario y no se detalla con benchmarks especificos.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene revisar las dependencias de codigo personalizado (`custom_code`) incluidas en el repositorio.
- Produccion: el modelo se publica como "preview" y con 0 descargas en el momento de la consulta; la madurez del ecosistema de despliegue (vLLM, TGI, llama.cpp) no esta confirmada.
- Requiere `trust_remote_code` en transformers por el uso de arquitectura personalizada (RDA, Raon-mHC), lo que implica revisar el codigo del repositorio antes de ejecutarlo.
- No se documentan datos de entrenamiento (tokens, composicion, alineacion), lo que dificulta evaluar riesgos de contaminacion de benchmarks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KRAFTON/Raon-1-mini
- Organizacion KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Pagina corporativa de KRAFTON AI: https://krafton.ai/en/
- Perfil de X de KRAFTON AI: https://x.com/Krafton_AI
- Comunidad de Discord: https://discord.gg/sDG7mmZPnc
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- KRAFTON (web corporativa): https://www.krafton.com/en/
- KRAFTON en Wikipedia: https://en.wikipedia.org/wiki/Krafton
