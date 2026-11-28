# KRAFTON/Raon-1-mini-mlx

## Resumen

Raon-1 mini es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado desde cero por KRAFTON AI, el brazo de inteligencia artificial de la editora surcoreana de videojuegos KRAFTON. El modelo cuenta con 28.800 millones de parametros totales y 4.300 millones de parametros activos por token, lo que lo situa en la categoria de modelos MoE eficientes en computo. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones de atribucion mas alla de las habituales de dicha licencia.

La version aqui descrita (`KRAFTON/Raon-1-mini-mlx`) es la conversion de los pesos originales al formato MLX, optimizada para Apple Silicon y cuantizada a NVFP4. El modelo base destaca por su arquitectura hibrida de atencion (18 capas de Raon Delta Attention con estado de tamano fijo y 7 capas de Gated MLA con cache KV), su ventana de contexto nativa de 262.144 tokens y un modo de razonamiento configurable en seis niveles de esfuerzo. Esta orientado a conversacion multilingue (con especial enfasis en coreano), tareas agenticas con tool calling y razonamiento complejo.

Su relevancia actual radica en tres factores: la eficiencia de memoria que permite ejecutar contexto completo de 256K con solo 20 GiB de VRAM en formato NVFP4, la disponibilidad de un modelo draft DFlash2 para decodificacion especulativa, y una licencia permisiva en un segmento donde muchos modelos comparables optan por licencias mas restrictivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (18 capas Raon Delta Attention + 7 capas Gated MLA) |
| Parametros totales | 28.783.240.418 (28,8B) |
| Parametros activos | 4,3B (6 expertos enrutados + 1 compartido de 128) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | NVFP4 (esta version MLX); MXFP8 y NVFP4 en el modelo base |
| Idiomas soportados | Coreano, ingles, japones, chino, espanol, frances y tailandes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); repo de 18,7 GB |
| Capas | 25 |
| Hidden size | 2.560 |
| Cabezas de atencion | 40 (RDA y Gated MLA) |
| Dimension de cabeza | 128 (RDA); 192 QK / 128 V (Gated MLA) |
| Rank LoRA Q/KV | 576 / 512 (Gated MLA) |
| Tamano intermedio de experto | 1.088 |
| Tamano intermedio FFN densa (primera capa) | 12.032 |
| Funcion de activacion | SiTU-GLU |
| Conexion residual | Raon-mHC con 4 streams |
| Vocabulario | 259.840 tokens |
| LM Head | Untied |
| Codificacion posicional | NoPE (sin codificacion posicional) |
| Cache KV | ~8 KiB por token en BF16 (solo capas MLA) |

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura transformer hibrida con 25 capas: 18 capas de Raon Delta Attention (RDA) y 7 capas de Gated MLA en proporcion 3:1. RDA es una variante de Kimi Delta Attention que desacopla las puertas de borrado y escritura, lo que segun el autor mejora el rendimiento en contexto largo respecto a KDA. Las capas RDA mantienen un estado de tamano fijo, mientras que solo las capas MLA conservan cache KV (aproximadamente 8 KiB por token en BF16), lo que reduce drasticamente el consumo de memoria en contextos extensos. El modelo no usa codificacion posicional (NoPE).

La capa MoE emplea 128 expertos enrutados de los que se activan 6 por token, mas 1 experto compartido, con un tamano intermedio de 1.088 por experto. La primera capa es una FFN densa con tamano intermedio de 12.032. La activacion es SiTU-GLU y las conexiones residuales usan Raon-mHC con 4 streams, una variante de las manifold-constrained hyper-connections de DeepSeek optimizada para reducir coste computacional en entrenamiento.

El modelo fue entrenado desde cero por KRAFTON AI. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. Se menciona el uso de siete idiomas (coreano, ingles, japones, chino, espanol, frances y tailandes) y un modo de razonamiento con seis niveles de esfuerzo seleccionables por peticion (`none`, `low`, `medium`, `high`, `xhigh`, `max`). Se proporciona un modelo draft DFlash2 para decodificacion especulativa.

## Capacidades

- Generacion de texto y conversacion multi-turno, con buen rendimiento destacado en el benchmark MultiChallenge (64,9).
- Razonamiento con modo thinking integrado y seis niveles de esfuerzo configurables por peticion.
- Razonamiento matematico de competicion (AIME 2026: 96,7; HMMT Feb 2026: 87,1).
- Razonamiento cientifico de posgrado (GPQA Diamond: 86,0).
- Busqueda y navegacion agéntica (BrowseComp Plus: 55,9).
- Tool calling / function calling para flujos agenticos, con soporte declarado para Hermes Agent, Pi y OpenCode.
- Ejecucion de tareas de ingenieria de software (SWE-Verified, GDPVal).
- Capacidades multilingues en coreano, ingles, japones, chino, espanol, frances y tailandes, con rendimiento especialmente fuerte en coreano.
- Decodificacion especulativa mediante modelo draft DFlash2.
- Contexto largo nativo de hasta 262.144 tokens.

## Casos de uso

- Atencion al cliente automatizada: la ventana de 256K tokens y el buen rendimiento en MultiChallenge (64,9) permiten gestionar conversaciones multi-turno extensas con historial largo sin perder coherencia, y el soporte de tool calling facilita la integracion con sistemas de ticketing o CRM.
- Agentes de busqueda y navegacion web: el resultado de 55,9 en BrowseComp Plus indica capacidad para tareas de busqueda multi-paso; puede integrarse en pipelines que consulten APIs externas mediante function calling.
- Asistencia en ingenieria de software: con soporte para SWE-Verified y herramientas como OpenCode, el modelo puede usarse para revision de codigo, generacion de parches y resolucion de issues en repositorios, integrándose en flujos de CI/CD a traves de tool calling.
- Razonamiento matematico y cientifico asistido: los resultados en AIME 2026 (96,7), HMMT Feb 2026 (87,1) y GPQA Diamond (86,0) lo hacen adecuado para tutoria avanzada, verificacion de demostraciones o generacion de problemas con solucion, seleccionando el nivel de esfuerzo segun la dificultad.
- Procesamiento de documentos largos en espanol: al estar entrenado en espanol y soportar 256K tokens, puede resumir contratos, informes o expedientes extensos en una sola pasada, con la ventaja de que el contexto completo cabe en 20 GiB de VRAM en NVFP4.
- Despliegue local en Apple Silicon: la version MLX cuantizada a NVFP4 esta pensada para ejecutarse en equipos Mac con memoria unificada, lo que habilita prototipado y uso personal o de pequeno equipo sin infraestructura GPU dedicada.
- Traduccion y localizacion multilingue: al cubrir siete idiomas, puede emplearse en pipelines de traduccion o localizacion con contexto largo para mantener consistencia terminologica a lo largo de documentos completos.

## Benchmarks y rendimiento

Datos publicados en la model card del modelo base:

| Benchmark | Raon-1 mini |
|---|---|
| AIME 2026 | 96,7 |
| HMMT Feb 2026 | 87,1 |
| GPQA Diamond | 86,0 |
| MultiChallenge | 64,9 |
| BrowseComp Plus | 55,9 |

La model card menciona comparaciones con Qwen3.6 35B-A3B, Gemma 4 26B-A4B, Flint (40B-A2.5B) e Inkling 2 Mini en los graficos de highlights (AA-Omniscience, GPQA Diamond, IFBench, MultiChallenge, BrowseComp Plus, SWE-Verified, GDPVal y Chatbot Korean interno), pero los valores numericos de esos modelos comparados no estan disponibles en la informacion proporcionada. No se han publicado en la informacion disponible resultados detallados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: segun el autor, el formato NVFP4 permite inferencia con contexto completo de 256K en 20 GiB de VRAM. El repo MLX ocupa 18,7 GB en disco.
- La version MLX esta destinada a Apple Silicon con memoria unificada; los requisitos exactos de memoria unificada para contexto completo no se detallan en la informacion disponible.
- GPU recomendadas: no especificadas en la informacion proporcionada. Por el perfil de memoria (20 GiB en NVFP4), cabria en GPUs con al menos 24 GB de VRAM, como RTX 4090 o A10G, aunque el autor no lo confirma.
- Cabe en GPU de consumo: previsiblemente si en RTX 4090 (24 GB) en NVFP4 para contexto completo, segun la cifra de 20 GiB; no confirmado por el autor para otros modelos.
- Opciones de despliegue: MLX para Apple Silicon; el modelo base soporta MXFP8 y NVFP4. No se detallan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Se ofrece un modelo draft DFlash2 para decodificacion especulativa que deberia reducir la latencia, pero sin cifras publicadas.

## Comparativa con modelos similares

La model card cita como comparables Qwen3.6 35B-A3B, Gemma 4 26B-A4B, Flint (40B-A2.5B) e Inkling 2 Mini. No se dispone de sus especificaciones completas ni de sus resultados numericos en la informacion proporcionada, por lo que la comparacion se limita a lo declarado por el autor.

| Modelo | Parametros | Activos | Contexto | Licencia | Datos en la informacion |
|---|---|---|---|---|---|
| Raon-1 mini | 28,8B | 4,3B | 256K | Apache 2.0 | AIME 2026 96,7; GPQA-D 86,0; MultiChallenge 64,9 |
| Qwen3.6 35B-A3B | 35B (MoE) | no disponible | no disponible | no disponible | solo aparece en graficos comparativos |
| Gemma 4 26B-A4B | 26B (MoE) | ~4B | no disponible | no disponible | solo aparece en graficos comparativos |
| Flint | 40B | 2,5B | no disponible | no disponible | solo aparece en graficos comparativos |
| Inkling 2 Mini | no disponible | no disponible | no disponible | no disponible | solo aparece en graficos comparativos |

## Limitaciones y advertencias

- El acceso al modelo esta sujeto a solicitud (gated): es necesario rellenar un formulario con nombre, afiliacion, puesto, pais y uso previsto antes de descargar los pesos.
- La model card no detalla la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de alineacion como RLHF o DPO, lo que dificulta evaluar sesgos y comportamientos no deseados.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones especificas de factualidad o tasa de alucinacion.
- Aunque se declaran siete idiomas, el autor enfatiza el rendimiento en coreano y describe el ingles como "solido"; el rendimiento en espanol, frances, japones, chino y tailandes no se cuantifica, por lo que debe validarse en produccion.
- El modo de razonamiento con niveles de esfuerzo puede incrementar la latencia y el consumo de tokens; conviene ajustarlo por caso de uso.
- La version MLX esta limitada al ecosistema Apple Silicon; para despliegue en GPU NVIDIA debe usarse el modelo base en MXFP8 o NVFP4.
- No se detallan limitaciones de contexto distintas de la ventana de 256K; el comportamiento mas alla de esa longitud no esta documentado.
- Aunque la licencia es Apache 2.0, el acceso gated anade un paso administrativo que puede afectar a despliegues automatizados o de gran escala.

## Enlaces

- Repositorio Hugging Face (version MLX): https://huggingface.co/KRAFTON/Raon-1-mini-mlx
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- Pagina de KRAFTON AI: https://krafton.ai/en/
- Organizacion en Hugging Face: https://huggingface.co/KRAFTON
- Playground de Raon-1 mini: https://raon-console.krafton.ai/playground/guest
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
- Web corporativa de KRAFTON: https://www.krafton.com/en/
