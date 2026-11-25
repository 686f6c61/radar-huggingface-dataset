# KRAFTON/Raon-1-mini-preview-nvfp4

## Resumen

Raon-1 mini preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado desde cero por KRAFTON AI, el brazo de inteligencia artificial de la editora surcoreana de videojuegos KRAFTON. El modelo se presenta como parte de la familia abierta Raon y está disenado especificamente para destacar en conversacion en coreano y en tareas agenticas, ademas de ofrecer un modo de razonamiento integrado (thinking) con buenos resultados en matematicas y ciencia.

La arquitectura combina 25 capas de atencion hibrida: 18 capas de Raon Delta Attention (RDA), una variante de Kimi Delta Attention que desacopla las compuertas de borrado y escritura, y 7 capas de Gated MLA con cache KV. El modelo declara 28,8 mil millones de parametros totales con 4,3 mil millones activos por token, gracias a un enrutamiento que activa 6 de 128 expertos mas uno compartido. Soporta de forma nativa hasta 262.144 tokens de contexto y no utiliza codificacion posicional (NoPE).

Esta ficha concreta corresponde a la variante cuantizada en NVFP4, publicada para su uso con vLLM y pensada para ejecutarse en una unica GPU. Segun la model card, el formato NVFP4 permite la inferencia en una NVIDIA RTX 5090 con 32 GB de VRAM. Se trata de una version preview, no definitiva, por lo que las especificaciones y resultados pueden cambiar antes del lanzamiento final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (18 capas Raon Delta Attention + 7 capas Gated MLA), sin codificacion posicional (NoPE) |
| Parametros totales | 28,8B (segun model card); 15.084.105.442 en los pesos safetensors de este repositorio cuantizado |
| Parametros activos | 4,3B (6 expertos enrutados + 1 compartido de 128) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (modelopt_fp4, 8-bit en metadatos); el modelo base ofrece tambien MXFP8 |
| Idiomas soportados | Coreano e ingles (segun la model card); no se detalla una lista completa |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion NVFP4 para vLLM) |

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura transformer hibrida con 25 capas, tamano oculto de 2.560 y 40 cabezas de atencion tanto en RDA como en Gated MLA. La innovacion principal es Raon Delta Attention (RDA), que desacopla las compuertas de borrado y escritura de Kimi Delta Attention para mejorar el rendimiento en contexto largo. Solo las 7 capas MLA mantienen cache KV, con un coste de aproximadamente 8 KiB por token en BF16, lo que reduce drasticamente el consumo de memoria frente a un transformer denso equivalente. La conexion residual utiliza Raon-mHC con 4 flujos, una version optimizada de las manifold-constrained hyper-connections de DeepSeek que reduce el coste computacional y acelera el entrenamiento. La funcion de activacion es SiTU-GLU, el vocabulario es de 259.840 tokens y el LM Head no esta atado a los embeddings.

El modelo fue entrenado desde cero por KRAFTON AI. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Se ofrece un modelo draft DFlash2 para decodificacion especulativa, lo que acelera la generacion en produccion.

## Capacidades

- Generacion de texto conversacional, con enfasis declarado en coreano e ingles.
- Razonamiento integrado con modo thinking, con resultados destacados en benchmarks de matematicas y ciencia segun el autor.
- Seguimiento de instrucciones y tareas de busqueda, donde el autor afirma liderar frente a los modelos de comparacion.
- Llamada a herramientas (tool calling) para flujos agenticos, con soporte declarado para Hermes Agent, Pi y OpenCode.
- Ejecucion de agentes y razonamiento multi-paso.
- Contexto largo nativo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Decodificacion especulativa mediante el draft model DFlash2.
- Capacidades multilingues limitadas segun la model card a coreano e ingles; no se documentan otras lenguas.
- No se mencionan capacidades de vision ni audio.

## Casos de uso

- Atencion al cliente en coreano: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana y a su entrenamiento especifico en conversacion coreana, manteniendo el hilo de incidencias complejas sin truncar historial.
- Agentes autonomos con tool calling: integrable en frameworks como Hermes Agent, Pi u OpenCode para tareas de ejecucion multi-paso, como consultar APIs, encadenar busquedas y sintetizar resultados, aprovechando los 4,3B parametros activos para mantener coste de inferencia bajo.
- Asistentes de codigo y automatizacion de desarrollo: el soporte de tool calling y el modo thinking permiten integrarlo en pipelines de CI/CD para revision de cambios, generacion de parches o explicacion de errores, siempre que el equipo trabaje en coreano o ingles.
- Analisis de documentos extensos: con 262.144 tokens de contexto y atencion hibrida que reduce la cache KV a unos 8 KiB por token en las capas MLA, es viable procesar informes largos, contratos o expedientes completos en una sola pasada.
- Razonamiento matematico y cientifico asistido: el modo thinking integrado y los resultados declarados en benchmarks de matematica y ciencia lo hacen adecuado para tutoria tecnica, resolucion de problemas paso a paso y generacion de explicaciones verificables.
- Despliegue en hardware de consumo: la variante NVFP4 cabe en una unica RTX 5090 de 32 GB, lo que permite prototipado local, demos y entornos de desarrollo sin depender de clústeres de GPU.
- Busqueda aumentada y respuesta sobre fuentes: el rendimiento declarado en benchmarks de busqueda sugiere su uso en sistemas RAG que requieran sintetizar resultados de multiples fuentes con citas y seguimiento de instrucciones estricto.

## Benchmarks y rendimiento

La model card incluye graficos comparativos frente a modelos abiertos en razonamiento, seguimiento de instrucciones y busqueda, pero los valores numericos no estan disponibles en la informacion proporcionada (las tablas aparecen truncadas). No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la variante NVFP4 esta disenada para ejecutarse en una unica GPU; segun el autor, cabe en una NVIDIA RTX 5090 con 32 GB de VRAM. El repositorio ocupa 17,6 GB en safetensors.
- GPU recomendadas: RTX 5090 (32 GB) para NVFP4; para el modelo base en BF16 o MXFP8 se requiere hardware de mayor capacidad, aunque no se especifican minimos en la informacion disponible.
- Cabe en GPU de consumo: si, en RTX 5090 con la cuantizacion NVFP4.
- Opciones de despliegue: vLLM es el runtime objetivo declarado para estos pesos; el modelo base admite tambien MXFP8. No se documentan integraciones con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor proporciona un draft model DFlash2 para decodificacion especulativa que deberia reducir la latencia, pero no se publican cifras.

## Comparativa con modelos similares

La model card menciona comparaciones frente a "MoE baselines" y modelos abiertos, pero no identifica cuales ni aporta cifras utilizables en la informacion disponible. Por tanto, la comparativa cuantitativa no esta disponible. A nivel estructural, se puede contextualizar frente a otras familias MoE abiertas de tamano similar (por ejemplo, variantes de Qwen o DeepSeek con decenas de miles de millones de parametros y pocos miles de millones activos), pero sin datos verificables de rendimiento no es posible establecer una comparacion rigurosa.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Raon-1 mini preview (NVFP4) | 28,8B | 4,3B | 262.144 | Apache 2.0 | No disponibles en la informacion |
| Alternativas MoE abiertas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es una version preview, no un modelo final: el autor advierte que las especificaciones y resultados pueden cambiar antes del lanzamiento definitivo.
- El acceso al modelo base esta sujeto a solicitud (gated); este repositorio cuantizado tambien requiere aceptar las condiciones de acceso.
- Cobertura linguistica limitada segun la model card a coreano e ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion inherente a los modelos generativos, agravado en tareas de busqueda y agenticas si no se verifican las fuentes.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni procesos de alineacion (RLHF/DPO), lo que dificulta evaluar riesgos de sesgo.
- La cuantizacion NVFP4 puede degradar ligeramente la calidad frente a los pesos originales; no se publican evaluaciones de la perdida de rendimiento por cuantizacion.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo preview conviene validar su comportamiento en el dominio concreto antes de desplegarlo en produccion.
- No hay informacion sobre limites de tasa, requisitos de atribucion adicionales ni restricciones de uso aceptable mas alla de la licencia.

## Enlaces

- Repositorio Hugging Face (NVFP4): https://huggingface.co/KRAFTON/Raon-1-mini-preview-nvfp4
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Version NVFP4 final referenciada: https://huggingface.co/KRAFTON/Raon-1-mini-nvfp4
- Playground de Raon-1 mini: https://raon-console.krafton.ai/playground/guest
- Pagina de KRAFTON AI: https://krafton.ai/en/
- Organizacion KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Cuenta de X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
