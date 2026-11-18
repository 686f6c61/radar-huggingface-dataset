# aisingapore/Apertus-SEA-LION-v4-8B-IT-GGUF

## Resumen

Apertus-SEA-LION-v4-8B-IT es un modelo de lenguaje de 8.053 millones de parametros desarrollado por el AI Products Pillar de AI Singapore (financiado por el Singapore NRF). Se construye mediante un ajuste fino supervisado (post-training) sobre el modelo suizo `swiss-ai/Apertus-8B-Instruct-2509`, con el objetivo de dotar al modelo base de fluidez multilingue y multicultural en las lenguas del sudeste asiatico: birmano, filipino, indonesio, malayo, vietnamita, tailandes y tamil, ademas del ingles.

El modelo emplea una arquitectura decoder (tipo transformer causal) con una longitud de contexto declarada de 65.000 tokens. El post-training se realizo sobre aproximadamente 6,4 millones de pares instruccion-texto, un subconjunto filtrado de pares de tool-calling y una mezcla de datos web, codigo, datasets abiertos y datos sinteticos, muestreados de un fondo de 1 billon de tokens del que se usaron 500.000 millones.

Su relevancia actual radica en dos factores: por un lado, cubre idiomas de sudeste asiatico habitualmente infrarrepresentados en los modelos abiertos de gran escala; por otro, AI Singapore publica bajo licencia MIT tanto los pesos (en formato GGUF) como los datasets de post-training y el codigo de evaluacion (SEA-HELM), lo que lo convierte en una referencia para investigacion reproducible y despliegue comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder (transformer causal, arquitectura Apertus) |
| Parametros totales | 8.053.338.176 (8,05 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 65.000 tokens (65k) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q4_K_M (GGUF, algunos divididos en partes) |
| Idiomas soportados | Ingles, birmano, filipino, indonesio, malayo, vietnamita, tailandes, tamil |
| Licencia | MIT |
| Formato de pesos | GGUF (F16, Q8_0, Q6_K, Q4_K_M); safetensors disponible en el modelo base |

## Arquitectura y entrenamiento

El modelo es un decoder de tipo transformer causal con la arquitectura Apertus heredada de `swiss-ai/Apertus-8B-Instruct-2509`. Emplea el tokenizador por defecto de ese modelo base sin modificaciones. No se dispone, en la informacion proporcionada, de detalles sobre mecanismos de atencion (atencion lineal, decodificacion especulativa u otras optimizaciones) especificos de la arquitectura Apertus.

El entrenamiento consistio en un post-training supervisado en ingles y lenguas del sudeste asiatico sobre un conjunto curado de aproximadamente 6,4 millones de pares instruccion-texto. Este dataset incluye un subconjunto filtrado de pares de tool-calling, orientado a impartir capacidades de llamada a herramientas ademas de la fluidez linguistica. La mezcla de datos de entrenamiento procede de datos web, codigo, datasets de codigo abierto y datos generados sinteticamente, con 500.000 millones de tokens muestreados de un fondo total de 1 billon. No se menciona en la informacion disponible el uso de RLHF o DPO tras el ajuste supervisado.

## Capacidades

- Generacion de texto conversacional multi-turno en ocho idiomas (ingles y siete lenguas del sudeste asiatico).
- Comprension y generacion en birmano, filipino, indonesio, malayo, vietnamita, tailandes y tamil, con adaptacion cultural declarada por el autor.
- Tool calling / function calling: el dataset de post-training incluye pares instruccion-herramienta filtrados, lo que habilita el uso del modelo en flujos con llamadas a funciones.
- Generacion de codigo: el corpus de entrenamiento incluye datos de codigo.
- Razonamiento y respuesta a instrucciones gracias al ajuste sobre el modelo instructivo base.
- Compatibilidad con endpoints conversacionales (tag `endpoints_compatible`) y con el pipeline de text-generation de Hugging Face.
- Soporte de plantilla de chat Jinja (`--jinja` en llama.cpp) para formateo de conversaciones.

## Casos de uso

- Atencion al cliente en mercados del sudeste asiatico: el modelo puede gestionar conversaciones multi-turno en indonesio, vietnamita, tailandes o filipino con una ventana de 65k tokens, suficiente para incorporar historial extenso o documentacion de producto en el contexto.
- Traduccion y localizacion EN↔SEA: util para traducir documentacion tecnica, contenido de marketing o interfaces hacia y desde las siete lenguas regionales cubiertas, con ajuste cultural declarado.
- Asistentes con herramientas: integrable en agentes que invocan APIs (consultas de estado de pedidos, busqueda en bases de datos) gracias al entrenamiento en tool-calling incluido en el dataset.
- Procesamiento de documentos largos regionales: resumen y extraccion de informacion en textos legales o administrativos en malayo, tamil o birmano con contexto de hasta 65k tokens.
- Despliegue en infraestructura modesta: al distribuirse en GGUF con cuantizacion Q4_K_M (aproximadamente 4-5 GB de pesos), puede ejecutarse en portatiles y equipos consumer con llama.cpp u Ollama, lo que facilita pilotos y entornos con GPUs limitadas.
- Investigacion en PLN de bajos recursos: al publicarse datasets de post-training y codigo de evaluacion SEA-HELM bajo MIT, sirve como base reproducible para estudiar adaptacion linguistica en lenguas del sudeste asiatico.
- Generacion de codigo en pipelines internos: el modelo puede integrarse en herramientas de asistencia a desarrolladores para contextos donde se requiere simultaneamente codigo y comunicacion en lenguas regionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la tabla de rendimiento por cuantizacion sin completar (valores marcados como "????"), y no se proporcionan cifras de MMLU, HumanEval, GSM8K ni de SEA-HELM en el material consultado.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos unicamente, sin contar KV cache):
  - F16: aproximadamente 16 GB.
  - Q8_0: aproximadamente 8,5 GB.
  - Q6_K: aproximadamente 6,5 GB.
  - Q4_K_M: aproximadamente 4,5-5 GB.
- GPU recomendadas: H100 o A100 80 GB para F16 con contexto largo; RTX 4090 (24 GB) para F16 o Q8_0 con contexto completo; RTX 3090/4080 o superiores para Q8_0.
- Cabe en GPU consumer: si. Q4_K_M y Q6_K caben en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) e incluso en algunos equipos con 6-8 GB de VRAM para Q4_K_M con contexto recortado.
- Opciones de despliegue: llama.cpp (recomendado por el autor, con `llama-cli` y soporte `--jinja`), Ollama, y cualquier herramienta construida sobre llama.cpp que soporte GGUFs divididos en partes (basta apuntar a la primera parte; se puede fusionar con `gguf-split --merge`).
- Latencia y throughput estimados: no disponible (la tabla de la model card esta sin completar).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas SEA | Licencia | Formato |
|---|---|---|---|---|---|
| Apertus-SEA-LION-v4-8B-IT | 8,05 B | 65k | 7 lenguas SEA + ingles | MIT | GGUF |
| Gemma-SEA-LION-v4-27B-IT | 27 B | no disponible | SEA (familia SEA-LION v4) | no disponible en la informacion | GGUF, FP8-Dynamic, NVFP4 |
| Qwen-SEA-LION-v4-32B-IT | 32 B | no disponible | SEA (familia SEA-LION v4) | no disponible en la informacion | 8BIT, 4BIT |
| Apertus-8B-Instruct-2509 (base) | 8 B | no disponible | no especificado | no disponible en la informacion | safetensors |

La comparativa se limita a la familia SEA-LION v4 y al modelo base, unicos datos disponibles. No se dispone de cifras de rendimiento comparadas ni de especificaciones completas de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a los modelos de 8B: sin datos de benchmarks publicados no es posible acotar su fiabilidad en tareas de razonamiento o conocimiento factual.
- Cobertura linguistica limitada a los ocho idiomas declarados; el rendimiento en lenguas no incluidas en el post-training (por ejemplo, khmer, lao, javanes) no esta documentado y probablemente sea deficiente.
- El modelo es un ajuste fino sobre Apertus-8B-Instruct-2509, por lo que hereda los sesgos y limitaciones del modelo base y de sus datos de preentrenamiento, no auditados en la informacion disponible.
- La model card apunta como `new_version` a `aisingapore/Qwen-SEA-LION-v4.5-27B-IT`, lo que sugiere que esta variante de 8B puede quedar sustituida por modelos mayores de la familia en futuras iteraciones.
- La tabla de rendimiento por cuantizacion de la model card esta incompleta, por lo que no hay garantias documentadas sobre la degradacion de calidad en Q4_K_M frente a F16.
- Algunos archivos GGUF estan divididos en partes; herramientas que no soporten GGUFs divididos requeriran fusion previa con `gguf-split`.
- Licencia MIT: permite uso comercial sin restricciones, pero no exime de la responsabilidad sobre el contenido generado ni de cumplir la normativa aplicable en cada jurisdiccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Apertus-SEA-LION-v4-8B-IT-GGUF
- Modelo base: https://huggingface.co/swiss-ai/Apertus-8B-Instruct-2509
- Coleccion SEA-LION v4: https://huggingface.co/collections/aisingapore/sea-lion-v4
- Datasets de post-training abiertos: https://huggingface.co/aisingapore/Apertus-SEA-LION-v4-8B-IT#Training-Data
- Codigo y datasets de evaluacion SEA-HELM: https://github.com/aisingapore/SEA-HELM
- Licencia MIT: https://mit-license.org/
- Guia de gguf-split en llama.cpp: https://github.com/ggerganov/llama.cpp/tree/master/tools/gguf-split
- Pesos GGUF individuales: [F16](https://huggingface.co/aisingapore/Apertus-SEA-LION-v4-8B-IT-GGUF/blob/main/Apertus-SEA-LION-v4-8B-IT-F16.gguf), [Q4_K_M](https://huggingface.co/aisingapore/Apertus-SEA-LION-v4-8B-IT-GGUF/blob/main/Apertus-SEA-LION-v4-8B-IT-Q4_K_M.gguf), [Q6_K](https://huggingface.co/aisingapore/Apertus-SEA-LION-v4-8B-IT-GGUF/blob/main/Apertus-SEA-LION-v4-8B-IT-Q6_K.gguf), [Q8_0](https://huggingface.co/aisingapore/Apertus-SEA-LION-v4-8B-IT-GGUF/blob/main/Apertus-SEA-LION-v4-8B-IT-Q8_0.gguf)
