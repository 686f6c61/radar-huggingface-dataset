# Outlier-Ai/Outlier-Compact-14B-GGUF

## Resumen

Outlier-Compact-14B-GGUF es una cuantización en formato GGUF del modelo Qwen2.5-14B-Instruct, publicada por Outlier-Ai. Se trata de un artefacto de investigación que la propia model card marca explícitamente como "superseded": el autor indica que este repositorio precede a la línea de producto Outlier v1.8 y que se conserva únicamente por reproducibilidad e interés histórico, no como descarga recomendada para producción. El modelo base es un transformer denso de 14.770.033.664 parámetros (~14,8 B) desarrollado originalmente por Alibaba Qwen.

La relevancia práctica de esta ficha es doble. Por un lado, documenta una cuantización orientada a inferencia local en CPU y edge (tags `llama.cpp`, `ollama`, `lm-studio`, `jan`, `on-device`, `offline`). Por otro, sirve como advertencia: el autor ha reemplazado esta familia por tiers nuevos (Nano 4B, Core 27B, Vision 35B-A3B) y recomienda consultar su sitio para benchmarks verificados. Cualquier afirmación técnica de revisiones anteriores de la model card debe considerarse provisional según el propio autor.

El modelo hereda las capacidades del Qwen2.5-14B-Instruct original: generación de texto, conversación multi-turno, instrucciones y function calling, con soporte declarado de 15 idiomas. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque la naturaleza de artefacto de investigación del repositorio aconseja validación propia antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hereda la de Qwen2.5-14B-Instruct); empaquetado en GGUF para llama.cpp |
| Parametros totales | 14.770.033.664 (~14,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-14B-Instruct soporta contextos largos, pero la model card de esta cuantizacion no lo especifica) |
| Tipos de cuantizacion | 4-bit, 5-bit y 8-bit (segun tags); variantes concretas por fichero no detalladas |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl (15 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama, LM Studio, Jan) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero, sino una cuantizacion del Qwen2.5-14B-Instruct de Alibaba Qwen. La arquitectura subyacente es un transformer denso decoder-only de aproximadamente 14,8 mil millones de parametros. La model card no detalla la composicion del dataset de entrenamiento original, el numero de tokens, ni si hubo fases de RLHF o DPO; esa informacion corresponderia a la documentacion del modelo base, no a este repositorio.

La contribucion tecnica de Outlier-Ai se limita al proceso de cuantizacion y empaquetado en GGUF para su uso con llama.cpp y runtimes derivados. El autor advierte que este artefacto "puede contener adaptadores, overlays o variantes de cuantizacion experimentales que no llegaron al producto final", por lo que las afirmaciones tecnicas de revisiones previas de la card deben tratarse como provisionales. No se documentan innovaciones como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de texto y conversacion multi-turno en modo instruct/chat.
- Respuesta a instrucciones y tareas de conocimiento general (los ejemplos de la card incluyen explicaciones divulgativas y resumenes).
- Function calling / tool calling (tag explicito `function-calling`).
- Capacidades multilingues en 15 idiomas, incluidos espanol, aleman, frances, portugues, italiano, ruso, japones, coreano, arabe, vietnamita, tailandes, neerlandes y polaco.
- Inferencia local y offline en CPU y dispositivos edge, gracias al formato GGUF y a las cuantizaciones de 4, 5 y 8 bits.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con herramientas de escritorio: llama.cpp, Ollama, LM Studio y Jan en Windows, Linux y macOS.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Asistente de escritorio offline: desplegado via Ollama o LM Studio en un portatil, el modelo permite conversaciones privadas sin enviar datos a la nube, uno de los escenarios que la propia card plantea en sus ejemplos ("razones para ejecutar un LLM en local").
- Atencion al cliente en entornos con requisitos de privacidad: la cuantizacion de 4 bits reduce el consumo de memoria y permite ejecutar el modelo en hardware modesto, manteniendo la conversacion multi-turno del modelo base.
- Automatizacion de herramientas internas con function calling: integrable en flujos que requieran invocar APIs o funciones estructuradas, aunque conviene validar el comportamiento del cuantizado frente al modelo original.
- Procesamiento de documentos multilingues: con 15 idiomas declarados, es adecuado para resumenes y extraccion en entornos corporativos con documentacion en espanol, frances, aleman o portugues.
- Prototipado y evaluacion de pipelines RAG: al ser un GGUF compatible con llama.cpp, sirve para probar recuperacion aumentada en local antes de escalar a infraestructura en la nube.
- Educacion y experimentacion: su naturaleza de artefacto de investigacion lo hace util para estudiar el efecto de la cuantizacion (4 vs 5 vs 8 bits) en calidad y latencia sobre un mismo modelo base.
- Desarrollo en equipos sin GPU dedicada: al estar orientado a CPU y edge, permite a desarrolladores sin acelerador probar cargas de trabajo de 14B en cuantizacion agresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a outlier.host para benchmarks verificados de los tiers actuales, pero no incluye cifras para este repositorio.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma oficial. Como referencia orientativa por tamano (no confirmada por el autor), un modelo de ~14,8 B en 4 bits ronda los 8-9 GB de pesos, en 5 bits aproximadamente 10-11 GB y en 8 bits en torno a 15-16 GB, a lo que hay que sumar overhead de contexto y runtime.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o A100/H100 permitirian ejecutar las variantes de 8 bits con holgura; las de 4 bits podrian caber en GPUs consumer de 12-16 GB.
- Cabe en GPU consumer: probablemente si en las cuantizaciones de 4 y 5 bits en tarjetas de 12 GB o mas, aunque el autor no lo confirma.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Outlier-Compact-14B-GGUF | ~14,8 B | No disponible | Apache 2.0 | Hugging Face (artefacto superseded) | Cuantizacion GGUF de Qwen2.5-14B-Instruct |
| Qwen2.5-14B-Instruct (original) | ~14,8 B | No disponible en esta busqueda | Apache 2.0 | Hugging Face | Modelo base sin cuantizar; referencia de calidad |
| Outlier Core 27B (tier actual) | No disponible | No disponible | No disponible | Hugging Face (MLX-4bit) | Tier por defecto recomendado por el autor |
| Outlier Nano 4B (tier actual) | No disponible | No disponible | No disponible | Hugging Face (MLX-4bit) | Tier de entrada recomendado por el autor |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio marcado como "superseded" por el propio autor: no es la descarga recomendada y se conserva solo por reproducibilidad.
- El autor advierte que puede contener adaptadores u overlays experimentales no incorporados al producto final; las afirmaciones tecnicas previas son provisionales.
- La cuantizacion a 4 y 5 bits puede degradar la calidad frente al modelo original, especialmente en razonamiento y codigo; no hay evaluacion publicada en este repositorio.
- Riesgo de alucinacion inherente al modelo base; no se documentan mitigaciones especificas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Longitud de contexto no especificada para esta cuantizacion; conviene verificar la configuracion del runtime.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de benchmarks y el estado de artefacto de investigacion desaconsejan su uso en produccion sin validacion propia.
- El repositorio tiene muy poca traccion (105 descargas, 1 like), lo que reduce la probabilidad de que los problemas esten documentados por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-Compact-14B-GGUF
- Arbol de ficheros: https://huggingface.co/Outlier-Ai/Outlier-Compact-14B-GGUF/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Sitio del autor (tiers actuales y benchmarks): https://outlier.host/
- Outlier Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Outlier Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (MLX-4bit): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B (MLX-4bit): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
