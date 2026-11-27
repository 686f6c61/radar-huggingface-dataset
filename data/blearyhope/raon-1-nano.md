# blearyhope/Raon-1-nano

## Resumen

Raon-1 nano es un modelo de lenguaje denso desarrollado por KRAFTON AI, presentado como la variante pequena de la familia abierta Raon. Segun la model card, cuenta con 1.5B parametros efectivos y 3.1B totales (3.529.911.376 parametros segun los pesos en safetensors del repositorio), incluyendo una tabla de embeddings por capa de 1.5B. Esta disenado para seguir instrucciones, mantener contexto conversacional y ejecutar tool calling tanto en coreano como en ingles, y se distribuye bajo licencia Apache 2.0.

El modelo emplea una arquitectura hibrida de atencion: 18 capas de Raon Delta Attention (atencion lineal con regla delta con puertas y estado recurrente de tamano fijo) y 6 capas de Gated MLA con cache KV, sobre un total de 24 capas. Incorpora innovaciones como Raon-mHC para conexiones residuales, embeddings por capa de 256 dimensiones, codificacion posicional NoPE y un modulo de Multi-Token Prediction de 55M. Declara un contexto nativo de 262.144 tokens.

Su relevancia actual radica en dos factores: por un lado, se obtiene mediante poda MoE-to-Dense y destilacion de conocimiento a partir de Raon-1 mini preview (30B-A4B), lo que permite concentrar capacidades de un modelo mayor en un checkpoint compacto; por otro, ofrece formatos GGUF, MLX y LiteRT-LM para despliegue en dispositivo, incluyendo Apple Silicon, lo que lo posiciona para inferencia local con contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido (18 capas Raon Delta Attention + 6 capas Gated MLA) |
| Parametros totales | 3.529.911.376 (3.1B modelo principal + 55M modulo MTP) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (se mencionan formatos GGUF, MLX y LiteRT-LM, sin detallar niveles) |
| Idiomas soportados | Coreano e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF, MLX y LiteRT-LM para inferencia local |

Otros datos de arquitectura declarados en la model card: 24 capas, hidden size 1.536, 16 cabezas en RDA y 32 en Gated MLA, dimension de cabeza 128 (RDA) y 192 QK / 128 V (Gated MLA), rango LoRA de query/KV de 512/512 en Gated MLA, FFN intermedio de 6.144, activacion SwiGLU, residuales Raon-mHC con 4 streams, embedding por capa de 256, vocabulario de 259.840 tokens, LM head atado y MTP de 1 capa con 55M.

## Arquitectura y entrenamiento

Raon-1 nano es un transformer denso con un layout hibrido de atencion en proporcion 3:1 (RDA frente a Gated MLA). Las 18 capas de Raon Delta Attention usan atencion lineal con regla delta con puertas, con puertas separadas de borrado y escritura y un estado recurrente de tamano fijo, lo que evita el crecimiento del cache KV en esas capas. Solo las 6 capas MLA mantienen cache KV, estimado en unos 7 KiB por token en BF16. El modelo no usa codificacion posicional (NoPE), emplea conexiones residuales Raon-mHC con 4 streams (una version de coste computacional reducido de las manifold-constrained hyper-connections de DeepSeek) y anade un embedding por capa de 256 dimensiones que ajusta la salida de cada capa tras su MLP. El modulo MTP de una capa y 55M parametros habilita decodificacion multi-token.

El entrenamiento parte de Raon-1 mini preview (30B-A4B) mediante poda MoE-to-Dense y destilacion de conocimiento (paper arXiv:2605.28207). Despues se realizo un preentrenamiento continuado de 3T tokens, seguido de post-entrenamiento con SFT, destilacion on-policy (OPD) desde Raon-1 mini preview y una fase final de reinforcement learning. La model card no detalla la composicion del dataset ni la mezcla de tokens por idioma.

## Capacidades

- Generacion de texto y conversacion multi-turno con seguimiento de contexto e instrucciones.
- Tool calling dentro de conversaciones, orientado a tareas de oficina y control movil.
- Razonamiento y ejecucion de tareas multi-paso mediante tool calling encadenado.
- Capacidades bilingues en coreano e ingles, con especial refuerzo en coreano.
- Contexto largo nativo de hasta 262.144 tokens.
- Decodificacion multi-token mediante el modulo MTP.
- Despliegue en dispositivo con formatos GGUF, MLX y LiteRT-LM.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a su ventana de 262.144 tokens, manteniendo coherencia en dialogos largos sin truncar contexto.
- Asistentes de oficina con tool calling: integracion con APIs de calendario, correo o gestion documental, ya que la model card lo orienta explicitamente a tareas de oficina mediante llamadas a herramientas.
- Control de dispositivos moviles por lenguaje natural: su soporte declarado de tool calling para control movil y su disponibilidad en LiteRT-LM lo hacen apto para asistentes embebidos en Android.
- Inferencia local en Apple Silicon: los pesos en MLX y GGUF permiten ejecutar el modelo en portatiles y equipos de sobremesa con GPU integrada, util para prototipado y aplicaciones privadas sin conexion.
- Procesamiento de documentos largos en coreano e ingles: resumen, extraccion y pregunta-respuesta sobre contratos o informes que superen decenas de miles de tokens, aprovechando el contexto nativo y el bajo coste de cache KV por token.
- Chatbot bilingue para mercado coreano: atencion en coreano con fallback a ingles, apoyado en el rendimiento declarado en benchmarks de conversacion coreana.
- Pipelines de agentes con multiples herramientas: el modelo puede encadenar llamadas a funciones en tareas de varios pasos, aunque la model card no detalla benchmarks de agentes.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos, pero el contenido extraido esta truncado y no permite recuperar las cifras numericas ni los nombres completos de los modelos de comparacion. Por tanto, no se presentan valores concretos.

| Categoria | Benchmark | Resultado |
|---|---|---|
| Instrucciones | no disponible (tabla truncada) | no disponible |
| Contexto | no disponible (tabla truncada) | no disponible |
| Conversacion coreana | no disponible (tabla truncada) | no disponible |

La model card afirma que Raon-1 nano lidera los benchmarks de seguimiento de instrucciones, seguimiento de contexto y conversacion coreana frente a los modelos comparados, pero sin las cifras no es posible verificar ni reproducir esa afirmacion.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 7 GB solo para pesos (3.529.911.376 parametros), mas cache KV de las 6 capas MLA (unos 7 KiB por token) y estados recurrentes de las capas RDA.
- En cuantizacion de 8 bits: alrededor de 3,5-4 GB de pesos; en 4 bits: alrededor de 2 GB, aunque los niveles concretos de cuantizacion no estan documentados en la informacion disponible.
- GPU de datacenter recomendadas: A100, H100 o L40S para servicio concurrente con contexto largo en BF16.
- GPU de consumo: cabe en tarjetas con 8 GB o mas en BF16 (RTX 3060 12 GB, RTX 4070, RTX 4090); con cuantizacion de 4-8 bits podria caber en GPUs de 4-6 GB, si bien no hay datos oficiales de niveles GGUF.
- Apple Silicon: soporte declarado via MLX, adecuado para equipos con memoria unificada de 16 GB o superior.
- Opciones de despliegue: transformers (libreria declarada, con custom_code), llama.cpp/Ollama mediante GGUF, MLX para Apple, LiteRT-LM para movil y, previsiblemente, vLLM o TGI, aunque estos ultimos no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card menciona comparaciones frente a "modelos abiertos de tamano similar" y frente a Raon-1 mini preview (30B-A4B, modelo del que deriva), pero las cifras y los nombres de los competidores no estan disponibles en el contenido extraido. Se ofrece una comparativa estructural limitada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Raon-1 nano | 3,5B (3,1B + 55M MTP) | 262.144 tokens | Apache 2.0 | Hugging Face, GGUF, MLX, LiteRT-LM |
| Raon-1 mini preview | 30B totales, 4B activos (MoE) | no disponible | no disponible | referenciado como origen del destilado |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio indicado (blearyhope/Raon-1-nano) tiene 0 descargas y 0 likes, y su model card referencia enlaces e imagenes del repositorio oficial KRAFTON/Raon-1-nano; conviene verificar la procedencia y autenticidad de estos pesos antes de usarlos en produccion.
- El contenido de la model card esta truncado en la informacion disponible, por lo que no se pueden verificar las cifras de benchmarks ni los modelos de comparacion.
- Idiomas limitados a coreano e ingles; el rendimiento en castellano no esta documentado ni evaluado.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan tasas de error ni evaluaciones de veracidad.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Aunque la licencia es Apache 2.0, la model card no detalla condiciones adicionales de uso aceptable ni restricciones de despliegue comercial; se recomienda revisar los terminos del repositorio oficial.
- El modelo requiere `trust_remote_code` por el tag `custom_code` de transformers; auditar el codigo remoto antes de ejecutarlo.
- No se documentan niveles de cuantizacion ni metricas de latencia, lo que dificulta el dimensionamiento de infraestructura.
- El contexto de 262.144 tokens no implica calidad uniforme en toda la ventana; no hay evaluaciones publicadas de recuperacion en contextos largos.

## Enlaces

- Repositorio Hugging Face (copia): https://huggingface.co/blearyhope/Raon-1-nano
- Repositorio oficial referenciado en la model card: https://huggingface.co/KRAFTON/Raon-1-nano
- Pagina de KRAFTON AI: https://krafton.ai/en/
- Organizacion en Hugging Face: https://huggingface.co/KRAFTON
- Paper MoE-to-Dense: https://arxiv.org/abs/2605.28207
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
