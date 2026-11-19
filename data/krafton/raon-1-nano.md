# KRAFTON/Raon-1-nano

## Resumen

Raon-1 nano es un modelo de lenguaje denso desarrollado por KRAFTON AI, presentado como la variante pequena de la familia abierta Raon. Con 3.529.911.376 parametros totales en el checkpoint (3.1B del modelo principal y 55M del modulo de prediccion multi-token), esta disenado para seguir instrucciones, mantener contexto conversacional y ejecutar llamadas a herramientas tanto en coreano como en ingles. Se distribuye bajo licencia Apache 2.0.

El modelo emplea una arquitectura hibrida de atencion: 18 capas de atencion lineal Raon Delta Attention (RDA) con estado recurrente de tamano fijo y solo 6 capas de atencion completa con Gated MLA, lo que reduce drasticamente el coste de la cache KV (unos 7 KiB por token en BF16). Incorpora ademas innovaciones como Raon-mHC para conexiones residuales y embeddings por capa de 256 dimensiones, con una ventana de contexto nativa de 262.144 tokens.

Su relevancia actual radica en dos factores: por un lado, se obtiene mediante destilacion y poda MoE-to-Dense a partir de Raon-1 mini preview (30B-A4B), lo que permite trasladar capacidades de un modelo mayor a uno desplegable en dispositivo; por otro, ofrece formatos GGUF, MLX y LiteRT-LM para inferencia local, incluido Apple Silicon, con un enfoque claro hacia el despliegue on-device en coreano e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido (18 capas RDA + 6 capas Gated MLA) |
| Parametros totales | 3.529.911.376 (3.1B modelo principal + 55M modulo MTP) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (se ofrecen formatos GGUF, MLX y LiteRT-LM, sin detallar niveles) |
| Idiomas soportados | Coreano e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF, MLX y LiteRT-LM para despliegue local |

## Arquitectura y entrenamiento

Raon-1 nano es un transformer denso de 24 capas con tamano oculto de 1.536 y FFN de 6.144 con activacion SwiGLU. La atencion es hibrida en proporcion 3:1: 18 capas usan Raon Delta Attention (RDA), una atencion lineal con regla delta condicionada por compuertas, con compuertas separadas de borrado y escritura y estado recurrente de tamano fijo; las 6 capas restantes usan Gated MLA con 32 cabezas y dimensiones de 192 QK / 128 V, y rangos LoRA de 512/512 para query y KV. Solo estas ultimas mantienen cache KV, aproximadamente 7 KiB por token en BF16. El modelo no usa codificacion posicional (NoPE), emplea embeddings atados entre entrada y LM head, un vocabulario de 259.840 tokens, embeddings por capa de 256 dimensiones que ajustan la salida tras el MLP, y conexiones residuales Raon-mHC con 4 flujos, una version optimizada computacionalmente de las manifold-constrained hyper-connections de DeepSeek.

El entrenamiento parte de Raon-1 mini preview (30B-A4B) mediante poda y destilacion MoE-to-Dense (paper arXiv:2605.28207). Sobre esa base se realizo un preentrenamiento continuado de 3 billones de tokens, seguido de post-entrenamiento con SFT y destilacion on-policy (OPD) desde Raon-1 mini preview, y finalmente aprendizaje por refuerzo (RL). El checkpoint incluye un modulo de prediccion multi-token (MTP) de 1 capa y 55M de parametros.

## Capacidades

- Generacion de texto conversacional con seguimiento fiel de instrucciones y de contexto.
- Razonamiento y respuesta multi-turno con ventana de hasta 262.144 tokens.
- Llamada a herramientas (tool calling) dentro de conversaciones, orientada a tareas de oficina y control movil.
- Capacidades bilingues coreano-ingles, con especial solidez en coreano segun la model card.
- Prediccion multi-token (MTP) integrada en el checkpoint, util para decodificacion especulativa.
- Despliegue on-device en formatos GGUF, MLX y LiteRT-LM, incluido Apple Silicon.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo lidera, segun el autor, los benchmarks de conversacion coreana e instrucciones, lo que lo hace adecuado para atencion al cliente y asistentes de productividad en ese idioma con contexto largo de hasta 262.144 tokens.
- Automatizacion de tareas de oficina con tool calling: puede invocar funciones para gestionar correo, calendario o documentos dentro de un flujo conversacional multi-turno.
- Control de dispositivos moviles: su soporte de tool calling y sus formatos LiteRT-LM/MLX lo orientan a integraciones en aplicaciones moviles y entornos embebidos.
- Inferencia local en Apple Silicon: la disponibilidad de pesos MLX y GGUF permite ejecutar el modelo en portatiles y estaciones Mac sin GPU dedicada de datacenter.
- Procesamiento de documentos largos en ingles y coreano: la ventana de 262K tokens y la cache KV reducida (7 KiB/token en BF16) abaratan el coste de contextos extensos frente a un transformer de atencion completa equivalente.
- Prototipado e investigacion: al ser Apache 2.0 y derivar de un modelo mayor por destilacion, sirve como base para experimentos de ajuste fino y comparativas de arquitecturas hibridas de atencion lineal.

## Benchmarks y rendimiento

La model card incluye graficos y tablas comparativas frente a modelos abiertos de tamano similar, pero los valores numericos concretos no estan disponibles en la informacion proporcionada. El autor afirma que Raon-1 nano lidera los benchmarks de seguimiento de instrucciones, seguimiento de contexto y conversacion coreana mostrados, sin que se hayan podido extraer las cifras.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para 3.1B parametros, en BF16 se situaria en torno a 6-7 GB de pesos mas overhead, y en cuantizaciones de 8 y 4 bits aproximadamente 3-4 GB y 2 GB respectivamente (estimacion orientativa, no confirmada por el autor).
- Cache KV: aproximadamente 7 KiB por token en BF16, gracias a que solo 6 de 24 capas mantienen cache; un contexto de 262.144 tokens requeriria del orden de 1,8 GB de cache KV en BF16 (calculo derivado del dato del autor).
- GPU recomendadas: no especificadas por el autor; por tamano, cabe en RTX 4090, RTX 3090 y GPUs consumer con 8 GB o mas en cuantizacion, y en A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU consumer: si, previsiblemente en tarjetas con 8 GB o mas segun cuantizacion.
- Opciones de despliegue: transformers (libreria nativa), GGUF (compatible con llama.cpp/Ollama), MLX (Apple Silicon) y LiteRT-LM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Raon-1 nano | 3.1B (+55M MTP) | 262.144 | Apache 2.0 | Hibrido RDA/MLA, bilingue coreano-ingles, tool calling, formatos on-device |
| Raon-1 mini preview | 30B-A4B (MoE) | No disponible | No disponible | Modelo profesor del que deriva Raon-1 nano por MoE-to-Dense |
| Alternativas abiertas de ~3B | No disponible | No disponible | No disponible | La model card compara con modelos abiertos de tamano similar sin detallar nombres ni cifras en la informacion disponible |

## Limitaciones y advertencias

- Idiomas: solo se declara entrenamiento en coreano e ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan evaluaciones especificas de factualidad.
- Sesgos: no se detalla en la model card ningun analisis de sesgos; deben evaluarse antes de uso en produccion.
- Contexto largo: aunque soporta 262.144 tokens nativamente, no se publican resultados de agujas en pajar ni de degradacion con contextos extensos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los formatos derivados (GGUF, MLX, LiteRT-LM) y de posibles dependencias de terceros.
- Despliegue: las cifras de cuantizacion y VRAM no estan publicadas por el autor; las estimaciones deben validarse en el entorno objetivo.
- Madurez: modelo reciente (publicado en octubre de 2026) con ecosistema de herramientas aun en formacion.

## Enlaces

- Hugging Face: https://huggingface.co/KRAFTON/Raon-1-nano
- Pagina de KRAFTON AI: https://krafton.ai/en/
- Organizacion en Hugging Face: https://huggingface.co/KRAFTON
- Paper MoE-to-Dense: https://arxiv.org/abs/2605.28207
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
