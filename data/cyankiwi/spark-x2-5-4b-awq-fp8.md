# cyankiwi/Spark-X2.5-4B-AWQ-FP8

## Resumen

Spark-X2.5-4B-AWQ-FP8 es una version cuantizada en FP8 del modelo XHToken/Spark-X2.5-4B, publicada por el usuario cyankiwi mediante su pipeline de cuantizacion "activation-aware 2.0" (version 26.05.01). El modelo base es un LLM denso de proposito general desarrollado por XHToken (familia Spark-X2.5), con 4.112.079.360 parametros y orientado a conversacion, escritura, traduccion, razonamiento, codigo, uso de herramientas y flujos agenticos.

La relevancia de esta publicacion concreta es de despliegue: reduce el peso del repositorio a 4,45 GB en safetensors, lo que permite servir un modelo de 4B en GPUs de gama media o incluso consumer con cuantizacion FP8, manteniendo la licencia Apache-2.0 del modelo original. La model card del repositorio base declara una arquitectura de atencion hibrida (una capa de atencion completa por cada tres de ventana deslizante), una ventana de contexto nativa de hasta 1.000.000 de tokens y compatibilidad con vLLM, SGLang, llama.cpp, MLX, Ollama y LM Studio.

El repositorio no incluye resultados de benchmarks numericos ni detalle de la composicion del dataset; la informacion disponible se limita a la model card del autor de la cuantizacion y a los metadatos de HuggingFace. Se trata, ademas, de una publicacion con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre la fidelidad de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida: 1 capa de atencion completa por cada 3 capas de sliding-window attention (segun la model card de Spark-X2.5) |
| Parametros totales | 4.112.079.360 (4,11B) |
| Longitud de contexto | Hasta 1.000.000 de tokens nativos (segun la model card de la familia Spark-X2.5) |
| Tipos de cuantizacion | FP8 con calibracion tipo AWQ (formato compressed-tensors, version de cuantizacion 26.05.01, dataset de calibracion "STEM and Agentic") |
| Idiomas soportados | EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES declarados en la model card; la familia Spark-X2.5 afirma soporte de mas de 200 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors); tamano del repo 4,5 GB, peso del modelo declarado 4,45 GB |
| Modelo base | XHToken/Spark-X2.5-4B |
| Libreria | transformers (requiere custom_code / trust_remote_code) |
| Pipeline | text-generation |
| Idiomas (campo de metadatos HF) | No disponible |

## Arquitectura y entrenamiento

El modelo base Spark-X2.5-4B emplea una arquitectura de atencion hibrida que combina capas de atencion completa con capas de sliding-window attention en una proporcion de 1:3. Segun la model card, este diseno busca reducir el coste computacional asociado a contextos largos y, al mismo tiempo, contener el tamano del KV-cache, algo critico en cargas agenticas con muchas iteraciones y contexto acumulado. La ventana de contexto nativa declarada es de hasta 1.000.000 de tokens.

En cuanto al entrenamiento, la model card indica que los modelos se entrenaron en clusters Huawei Ascend (aproximadamente 2... , texto truncado en la informacion disponible) y que se aplicaron tecnicas de reinforcement learning a gran escala y post-entrenamiento, incluida la tecnica denominada MOPD, para reforzar razonamiento, codigo, capacidades agenticas y seguimiento de instrucciones. No se especifica el numero exacto de tokens de preentrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO mas alla de la mencion generica a RL y post-entrenamiento. La cuantizacion de este repositorio se calibro con un dataset orientado a STEM y tareas agenticas, lo que puede sesgar ligeramente el error de cuantizacion hacia ese dominio.

## Capacidades

- Generacion de texto conversacional y de proposito general: dialogo multi-turno, redaccion, resumen y traduccion.
- Razonamiento e instrucciones: la model card cita mejoras en razonamiento y seguimiento de instrucciones derivadas del post-entrenamiento con RL.
- Codigo: rendimiento destacado, segun el autor, en tareas de programacion cotidiana dentro de modelos de tamano comparable.
- Uso de herramientas (tool calling / function calling): integracion declarada con entornos agenticos como Codex, Claude Code, OpenClaw y Hermes.
- Flujos agenticos y razonamiento multi-paso: el diseno de atencion hibrida esta pensado explicitamente para cargas con contexto largo y muchas llamadas.
- Multilingue: 10 idiomas confirmados en la model card (EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES) y mas de 200 declarados para la familia.
- Contexto largo: soporte nativo de hasta 1M tokens, adecuado para documentos extensos y sesiones largas.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional de atencion al cliente: con una ventana de hasta 1M tokens puede mantener el historial completo de una incidencia larga y multiples interacciones previas sin truncar contexto, reduciendo la perdida de informacion entre turnos.
- Generacion de codigo asistida en el IDE: integrado en herramientas tipo Codex o Claude Code, el modelo puede resolver tareas de autocompletado, refactorizacion y explicacion de fragmentos, con la ventaja de que la cuantizacion FP8 reduce los requisitos de VRAM para servirlo junto al resto del stack de desarrollo.
- Agentes autonomos con uso de herramientas: al soportar tool calling y estar integrado con harnesses agenticos, resulta adecuado para pipelines que encadenan busquedas, llamadas a API y ejecucion de comandos con verificacion de resultados.
- Extraccion y analisis de documentos extensos: contratos, informes tecnicos o expedientes que superan los 100.000 tokens pueden procesarse en una sola pasada gracias a la ventana nativa de 1M tokens, evitando estrategias de chunking con perdida de coherencia global.
- Traduccion multilingue en produccion: con soporte declarado para mas de 200 idiomas y 10 idiomas confirmados en la model card, es util para localizacion de contenido y atencion multilingue en SaaS.
- Despliegue en hardware limitado o en el borde: al ocupar 4,45 GB en FP8, puede servirse en una unica GPU consumer, lo que permite prototipos locales, entornos de desarrollo sin cluster y despliegues on-premise con requisitos de privacidad.
- Clasificacion y enrutado de tickets o correos: tareas de etiquetado, priorizacion y respuesta sugerida en volumen alto, donde el coste por token y la latencia importan mas que el razonamiento profundo.
- Base para fine-tuning vertical: la licencia Apache-2.0 permite ajuste con LLaMA-Factory u otros frameworks sobre un modelo compacto, para dominios como legal, sanitario o atencion publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Spark-X2.5 referencia una imagen comparativa (`model-benchmark-comparison.svg`), pero los valores numericos no forman parte de la informacion proporcionada, por lo que no se reproducen. Tampoco hay datos de degradacion introducida por la cuantizacion FP8 respecto al modelo base en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-6 GB para los pesos en FP8, mas overhead de runtime; el KV-cache depende de la longitud de contexto efectiva y del numero de secuencias concurrentes. Con sliding-window attention el KV-cache crece mas despacio que en un transformer de atencion completa, pero a 1M tokens sigue siendo el factor dominante.
- GPUs recomendadas: H100, H200, A100 para FP8 nativo (Hopper o superior) y despliegues de alta concurrencia; L40S y RTX 4090 / 4090 Ada para FP8 nativo en inferencia.
- Compatibilidad en GPUs consumer: cabe con holgura en tarjetas de 8-12 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). La ejecucion nativa en FP8 requiere compute capability 8.9 o superior (Ada Lovelace, Hopper o posterior); en generaciones anteriores (Ampere, Turing) se necesita un kernel alternativo o fallback, y la disponibilidad depende del framework.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, MLX, Ollama y LM Studio, segun la model card del modelo base. El uso directo con transformers requiere `trust_remote_code=True` por el tag `custom_code`. Para fine-tuning, LLaMA-Factory.
- Latencia y throughput: no disponible. La model card afirma mejoras de TTFT, TOPT y eficiencia global frente a modelos de tamano similar en multiples plataformas de hardware, pero sin cifras concretas. Los datos de la model card corresponden al modelo base sin cuantizar.

## Comparativa con modelos similares

No hay datos de benchmarks disponibles para comparar el rendimiento real de esta cuantizacion. La tabla siguiente recoge unicamente caracteristicas estructurales frente a alternativas habituales de la misma categoria (modelos densos de 3-4B); los datos de modelos de terceros no proceden de la informacion proporcionada y deben verificarse en sus repositorios oficiales.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| cyankiwi/Spark-X2.5-4B-AWQ-FP8 | 4,11B | Hasta 1M tokens (segun model card del base) | Apache-2.0 | Cuantizacion FP8 de terceros, 0 descargas, sin benchmarks publicados |
| XHToken/Spark-X2.5-4B | 4,11B | Hasta 1M tokens | Apache-2.0 | Modelo base sin cuantizar |
| Qwen3-4B | 4,0B | 32.768 tokens nativos, extensible | Apache-2.0 | Datos no verificados en la informacion proporcionada |
| Llama-3.2-3B | 3,2B | 128.000 tokens | Llama 3.2 Community License | Datos no verificados en la informacion proporcionada |
| Gemma 3 4B | 4B | 128.000 tokens | Gemma Terms of Use | Datos no verificados en la informacion proporcionada |

Comparativa de rendimiento (MMLU, HumanEval, GSM8K u otros): no disponible.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados para esta cuantizacion ni evidencia de que el proceso FP8 preserve la calidad del modelo base. El autor no documenta la perdida (perplexity o win-rate) frente a XHToken/Spark-X2.5-4B.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- Riesgo de alucinacion inherente a los LLM de 4B, especialmente en tareas de razonamiento complejo, matematicas avanzadas y conocimiento factual especializado.
- La calibracion se realizo con un dataset STEM y agentico, por lo que el error de cuantizacion puede ser mayor en dominios conversacionales, creativos o multilingues poco representados en la calibracion.
- La ventana de 1M tokens esta declarada para la familia Spark-X2.5; no se detalla la configuracion exacta del 4B ni el rendimiento medido a esa longitud. A contextos muy largos, la calidad de recuperacion de informacion suele degradarse.
- Idiomas: los campos de metadatos de HuggingFace no declaran idiomas; los 10 idiomas confirmados provienen de la model card del autor de la cuantizacion. El soporte real de los mas de 200 idiomas anunciados no esta cuantificado.
- El tag `custom_code` implica ejecutar codigo remoto del repositorio con `trust_remote_code=True`; conviene auditar el codigo antes de usarlo en produccion.
- Licencia Apache-2.0 en el repositorio de cuantizacion, lo que permite uso comercial, pero se recomienda verificar la licencia y los terminos del modelo base XHToken/Spark-X2.5-4B.
- No se dispone de informacion sobre sesgos, datos de entrenamiento, procedencia del corpus ni evaluaciones de seguridad.
- Al ser una cuantizacion FP8, el soporte depende del hardware: en GPUs sin FP8 nativo el rendimiento puede degradarse o requerir conversion adicional.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/cyankiwi/Spark-X2.5-4B-AWQ-FP8
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Dataset de calibracion: https://huggingface.co/datasets/cyankiwi/calibration
- Slack de SparkLLM: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord de SparkLLM: https://discord.gg/kTDE2Hg8aw
- YouTube de SparkLLM: https://www.youtube.com/@SparkLLM
- dev.to de SparkLLM: https://dev.to/sparkllm
- Bluesky de SparkLLM: https://bsky.app/profile/sparkllm.bsky.social
- X (Twitter) de SparkLLM: https://x.com/sparkllm
- Zhihu de SparkLLM: https://www.zhihu.com/people/zhiikz7qh7m
- Contacto del autor de la cuantizacion: ton@cyan.kiwi
- Paper, blog tecnico o demo oficial: no disponible en la informacion proporcionada.
