# Gavvvin/Qwen3.8-27B-Uncensored-OID

## Resumen

El modelo `Gavvvin/Qwen3.8-27B-Uncensored-OID` es una cuantización dinámica Q3 (OID Dynamic Q3) del checkpoint `orcarouter/Qwen3.8-27B-Uncensored`, un derivado abliterado (eliminación de rechazos) del modelo nativo multimodal Qwen3.8-27B de Alibaba. Con aproximadamente 26,9 mil millones de parámetros y un tamaño de repositorio de 11,8 GB, esta versión busca reducir drásticamente el consumo de memoria manteniendo las capacidades de razonamiento, conocimiento, recuperación de contexto largo, codificación y escritura del modelo original. El autor, Gavvvin, publica esta cuantización bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en que ofrece una alternativa compacta para ejecutar localmente un VLM de 27B con arquitectura híbrida (atención lineal Gated DeltaNet + atención completa) y cabezal de decodificación especulativa MTP, sin necesidad de hardware de gama alta. Según la model card, la cuantización conserva bien el conocimiento factual, la resistencia a la alucinación y la memoria de contexto largo, aunque muestra degradación en el control fino de instrucciones y la verificación de restricciones. Es importante señalar que la evaluación publicada es un benchmark personalizado de compresión, no un estándar académico, y que las capacidades multimodales (visión) no fueron evaluadas en dicha prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 / hybrid-attention VLM (Gated DeltaNet linear + full attention) con cabezal MTP de decodificacion especulativa |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no especificada en la informacion proporcionada; el modelo base Qwen3.8-27B soporta contexto largo, pero no se confirma el valor exacto) |
| Tipos de cuantizacion | OID Dynamic Q3 (unica cuantizacion publicada en este repo) |
| Idiomas soportados | no disponible (la model card no los especifica; el modelo base Qwen3.8 es multilingue, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (segun el dato de parametros reales) y GGUF (segun tags, aunque no confirmado en este repo especifico) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` de Alibaba emplea una arquitectura híbrida de atención que combina una capa lineal Gated DeltaNet (eficiente en memoria) con capas de atención completa tradicionales. Esta combinación permite manejar secuencias largas con menor coste computacional que una atención totalmente densa. Además, incorpora un cabezal de decodificación especulativa MTP (Multi-Token Prediction) que acelera la generación al predecir varios tokens a la vez. El checkpoint `orcarouter/Qwen3.8-27B-Uncensored` es un derivado abliterado (refusal-removed) del modelo original, es decir, se eliminaron los mecanismos de rechazo de contenido, manteniendo la arquitectura y los pesos base.

La cuantización OID Dynamic Q3 aplicada por Gavvvin reduce el modelo a aproximadamente 11 GB mediante una cuantización dinámica de 3 bits. Según la model card, esta compresión conserva bien el conocimiento, la resistencia a la alucinación y la memoria de contexto largo, pero degrada el control ejecutivo fino, la verificación de restricciones y la consistencia semántica en transformaciones de estilo. No se proporcionan detalles sobre el dataset de entrenamiento del modelo original ni sobre el proceso de abliteración, más allá de que se distribuye bajo Apache 2.0.

## Capacidades

- Generacion de texto y razonamiento multi-paso: el modelo mantiene un rendimiento solido en aritmetica, logica formal y razonamiento critico, segun la evaluacion personalizada (9/10 en razonamiento).
- Conocimiento factual: excelente retencion en ciencia, economia, historia, estadistica, quimica y literatura (10/10 en conocimiento).
- Resistencia a la alucinacion: rechaza correctamente premisas fabricadas o imposibles (10/10).
- Memoria de contexto largo: recupera informacion plantada en el contexto, incluyendo cadenas exactas, valores numericos y calculos derivados (10/10).
- Codificacion: maneja implementaciones correctas y corrige errores en su propio codigo (9/10).
- Resumen y abstraccion: capacidad destacada para sintetizar informacion (10/10).
- Escritura y control de estilo: calidad de escritura aceptable (8/10) pero control de estilo deficiente (5/10).
- Multimodal (vision): el modelo base es un VLM con capacidades de imagen-texto, pero la cuantizacion no fue evaluada en este aspecto; se desconoce el impacto de la compresion en la vision.
- Tool calling y agentes: no se menciona explicitamente en la informacion, aunque el modelo base Qwen3.8-27B soporta tool-calling y flujos agénticos; no hay datos sobre su preservacion tras la cuantizacion.

## Casos de uso

- Ejecucion local de un asistente conversacional sin censura: el modelo, al ser abliterado y cuantizado a ~11 GB, puede desplegarse en una GPU consumer de 12-16 GB VRAM para conversaciones multi-turno con contexto largo, ideal para entornos de investigacion donde se requiere explorar temas sensibles sin filtros.
- Recuperacion de informacion en documentos extensos: gracias a su memoria de contexto largo preservada (10/10 en la evaluacion), puede procesar manuales, informes o contratos largos y extraer datos especificos, como valores numericos o clausulas exactas, sin perder precision.
- Generacion de codigo en entornos sin conexion: con su capacidad de codificacion (9/10) y soporte para tool calling (si se preserva), puede integrarse en pipelines de desarrollo local, como generacion de tests, refactorizacion o documentacion de codigo, sin depender de APIs externas.
- Razonamiento logico y resolucion de problemas en educacion: el modelo mantiene un buen rendimiento en logica formal y razonamiento multi-paso, por lo que puede usarse como tutor automatico para explicar problemas matematicos o cientificos, siempre que se supervise la salida.
- Resumen y abstraccion de contenido: su capacidad de resumen (10/10) lo hace util para condensar articulos, actas de reuniones o capitulos de libros en resumenes estructurados, manteniendo los puntos clave.
- Prototipado de agentes de investigacion: al ser un modelo abierto y cuantizado, puede servir como base para experimentos de agentes autonomos que requieran razonamiento critico y manejo de contexto largo, como analisis de literatura cientifica o recopilacion de datos, sin coste de inferencia en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una evaluacion personalizada de compresion con una puntuacion global de 84/100, desglosada en:

| Capacidad | Puntuacion |
|---|---|
| Conocimiento | 10/10 |
| Resistencia a la alucinacion | 10/10 |
| Memoria de contexto largo | 10/10 |
| Razonamiento / logica | 9/10 |
| Resumen / abstraccion | 10/10 |
| Codificacion | 9/10 |
| Calidad de escritura | 8/10 |
| Seguimiento de instrucciones | 7/10 |
| Control de estilo | 5/10 |
| Disciplina de salida / autoverificacion | 6/10 |

El autor advierte que esta evaluacion es un benchmark propio orientado a estresar la degradacion por compresion, no comparable con MMLU u otros liderboards. La puntuacion de capacidad central es 94/100 y la robustez a la compresion es 74/100. Los resultados provienen de una unica ejecucion y pueden variar segun la configuracion de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa ~11 GB en su cuantizacion Q3, por lo que requiere al menos 12 GB de VRAM para cargar los pesos, mas overhead de contexto y activaciones. Con 16 GB de VRAM es viable para contextos moderados.
- GPU recomendadas: RTX 4080/4090 (16-24 GB), RTX 3090 (24 GB), A100 40 GB o superiores para contextos largos. En GPUs con 12 GB (RTX 3060, RTX 4070) puede funcionar con contextos reducidos y cuantizacion adicional.
- Si cabe en consumer GPU: si, en GPUs de 12-16 GB con limitaciones de contexto; en 24 GB (RTX 3090/4090) se puede usar con contextos largos.
- Opciones de despliegue: al ser un modelo transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). El tag "gguf" sugiere compatibilidad con llama.cpp y Ollama, aunque no se confirma en este repo.
- Latencia y throughput: no disponibles en la informacion proporcionada. La arquitectura híbrida y el cabezal MTP deberian mejorar la velocidad de generacion, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | ~27B | no disponible | Apache 2.0 | FP8/FP16 | Modelo base multimodal, sin abliteracion |
| orcarouter/Qwen3.8-27B-Uncensored | ~27B | no disponible | Apache 2.0 | FP8 | Derivado abliterado del original |
| Gavvvin/Qwen3.8-27B-Uncensored-OID | ~27B | no disponible | Apache 2.0 | Q3 dinamico | Cuantizacion agresiva del abliterado, ~11 GB |

No se dispone de datos de rendimiento comparativo con otros modelos de 27B (como Llama 3.1 8B o Qwen2.5-27B) en benchmarks estandarizados. La comparativa se limita a la cadena de derivacion del propio modelo.

## Limitaciones y advertencias

- Degradacion en control ejecutivo fino: la cuantizacion Q3 afecta al seguimiento de instrucciones detalladas, la verificacion de restricciones exactas y la autoverificacion de la salida (puntuaciones de 7/10, 5/10 y 6/10 respectivamente). En produccion, puede incumplir formatos o contar palabras incorrectamente.
- Control de estilo deficiente: al reescribir contenido en diferentes estilos, el modelo puede anadir detalles no soportados o perder requisitos menores.
- Modelo "uncensored" (abliterado): al eliminar los rechazos, puede generar contenido inapropiado, ofensivo o peligroso. No es apto para aplicaciones publicas sin moderacion adicional. El autor del modelo base recomienda uso exclusivo para investigacion.
- Capacidades multimodales no verificadas: la evaluacion publicada solo cubre texto; el impacto de la cuantizacion en la vision (imagen-texto) es desconocido.
- Sin benchmarks estandarizados: no hay resultados MMLU, HumanEval, etc., lo que dificulta comparar con otros modelos de forma objetiva.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base abliterado puede tener implicaciones eticas y legales segun el contexto de uso.
- Resultados de la evaluacion no reproducibles: la puntuacion 84/100 proviene de una unica ejecucion con configuracion especifica; puede variar con el backend, el sampler y la longitud del contexto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Gavvvin/Qwen3.8-27B-Uncensored-OID
- Modelo base (orcarouter): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Blog de orcarouter sobre ejecucion local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Blog de orcarouter sobre GGUF abliterado: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Repositorio GitHub de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio GitHub de qwen38-uncensored (guia de ejecucion): https://github.com/unburdened-jackinthebox365/qwen38-uncensored
