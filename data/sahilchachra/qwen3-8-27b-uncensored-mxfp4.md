# sahilchachra/Qwen3.8-27B-Uncensored-MXFP4

## Resumen

Qwen3.8-27B-Uncensored-MXFP4 es una cuantizacion en formato MLX MXFP4 del modelo orcarouter/Qwen3.8-27B-Uncensored, un ajuste fino "uncensored" (abliterado, sin capas de rechazo) sobre Qwen3.8-27B, el modelo vision-language de la familia qwen3_5 desarrollado por Alibaba. El modelo resultante mantiene el pipeline image-text-to-text: la torre visual Qwen3-VL se conserva en bf16 y solo se cuantiza el backbone de texto, lo que permite ejecutarlo en hardware Apple Silicon mediante la libreria mlx-vlm.

La cuantizacion MXFP4 (4.449 bpw, grupo de 32) reduce el peso del modelo a unos 14 GB en disco, frente a los 27 GB de la variante MXFP8, con una degradacion minima verificada en tareas de texto y vision simples. El modelo hereda la arquitectura hibrida GatedDeltaNet (atencion lineal + atencion completa cada 4 capas), el contexto nativo de 262 144 tokens, capacidades de razonamiento con canal "thinking" y soporte de tool calling. Su relevancia actual radica en ofrecer un modelo de 27B parametros con vision y razonamiento ejecutable en equipos de consumo de Apple, sin censura, bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida GatedDeltaNet (linear attention) + full attention cada 4 capas, 64 capas; torre visual Qwen3-VL en bf16 |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (heredada del modelo base) |
| Tipos de cuantizacion | MXFP4 (4.449 bpw, E2M1 + E8M0, group size 32); variante MXFP8 (8.381 bpw, 27 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 13 shards); el modelo base tambien tiene exportacion GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parametros con una arquitectura hibrida de atencion: 64 capas, de las cuales cada cuarta utiliza full attention y el resto usa GatedDeltaNet, una variante de atencion lineal con estado recurrente. Esto reduce el coste de computacion frente a un transformer denso clasico y permite contextos largos (262144 tokens) con menor consumo de memoria. La torre visual sigue el diseño de Qwen3-VL y procesa imagenes de entrada; en esta cuantizacion se mantiene en bf16 para no degradar la percepcion visual.

El ajuste "uncensored" es un proceso de abliteracion que elimina las capas de rechazo de seguridad del modelo original, de modo que el modelo no rehusa peticiones que el modelo base rechazaria. No se dispone de informacion publica sobre los datos de entrenamiento del ajuste ni sobre el proceso exacto de abliteracion aplicado. La cuantizacion MXFP4 se realizo con MLX, manteniendo la torre visual y las normas en bf16, y eliminando la cabeza de prediccion multi-token (MTP) que el modelo base incluia para decodificacion especulativa; por tanto, el modelo no dispone de speculative decoding.

## Capacidades

- Generacion de texto y chat multironda con plantilla ChatML.
- Razonamiento con modo "thinking": emite un canal de razonamiento (reasoning_content) antes de la respuesta final.
- Comprension visual: puede responder preguntas sobre imagenes (color, forma, objetos) a traves de la torre visual Qwen3-VL.
- Soporte de tool calling / function calling (heredado del modelo base Qwen3.8-27B).
- Soporte de agentes y razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la documentacion publica.
- Control de thinking: puede activarse o desactivarse el modo de razonamiento segun la configuracion.

## Casos de uso

- Asistentes de codigo en local: con tool calling y contexto largo, puede integrarse en entornos de desarrollo como copiloto para generar y revisar codigo, sin depender de servicios en la nube.
- Analisis de documentos con imagenes: al aceptar entrada de imagen, puede extraer informacion de capturas, diagramas o formularios en equipos Apple.
- Prototipado rapido de agentes conversacionales: el modo thinking permite respuestas razonadas en sistemas de atencion al cliente o tutores automaticos.
- Investigacion academica sobre alineacion y seguridad: al ser uncensored, es util para estudiar comportamientos de rechazo, sesgos y alucinaciones en modelos de gran tamano.
- Despliegue en portatiles Apple para demos y pruebas de concepto: el formato MLX y el tamano reducido permiten ejecutar el modelo en un Mac con 24 GB de RAM unificada.
- Generacion de contenido creativo sin restricciones tematicas: el modelo no aplica filtros de rechazo, por lo que puede usarse en narrativa, roleplay o brainstorming sin limitaciones de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye pruebas de humo manuales: respuestas correctas a preguntas de cultura general ("capital de Francia"), aritmetica basica y reconocimiento visual de colores y formas. No se dispone de datos de MMLU, HumanEval, GSM8K ni de comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14.2 GiB para los pesos en MXFP4, mas memoria para el contexto (que puede superar los 2 GB con contextos largos).
- GPU recomendadas: cualquier Mac con chip Apple Silicon (M1 o superior) con al menos 24 GB de memoria unificada para el modelo MXFP4; la variante MXFP8 requiere 32 GB o mas.
- Cabe en hardware de consumo: si, en Macs de 24 GB de RAM unificada (verificado en la model card); no esta pensado para GPU NVIDIA convencional sin conversion a otro formato.
- Opciones de despliegue: mlx-vlm (libreria Python), LM Studio (probado en 0.4.20 con runtime mlx-llm), y potencialmente llama.cpp si se usa la variante GGUF del mismo modelo base.
- Latencia y throughput: no disponible; se trata de un modelo de razonamiento que genera un canal thinking, por lo que la latencia depende de la longitud de la respuesta razonada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-MXFP4 (este) | 27B | 262144 | MLX MXFP4 | Apache-2.0 | Vision-language, uncensored, Apple Silicon |
| Qwen3.8-27B-Uncensored-MXFP8 | 27B | 262144 | MLX MXFP8 | Apache-2.0 | Mayor fidelidad, requiere 32 GB |
| Qwen3.8-27B (original, Qwen/Qwen3.8-27B) | 27B | 262144 | safetensors | Apache-2.0 | Modelo base con censura, sin abliteracion |
| Qwen3.8-27B-Uncensored-Q4_K_M (choz) | 27B | 262144 | GGUF Q4_K_M | Apache-2.0 | Variante GGUF para llama.cpp, misma base abliterada |

La comparativa se limita a variantes del mismo modelo base; no se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Modelo deliberadamente uncensored/abliterado: no rechaza peticiones que el modelo base rechazaria; el usuario es responsable del uso conforme a la licencia y la legislacion local.
- Riesgo de alucinacion: no se dispone de evaluaciones especificas; como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo.
- Limitaciones de idioma: no se ha publicado la lista de idiomas soportados; el entrenamiento base de Qwen cubre principalmente chino e ingles, con menor rendimiento en otros idiomas.
- Sin speculative decoding: la cabeza MTP se ha eliminado, por lo que la decodificacion es mas lenta que en el modelo base.
- El modo thinking puede consumir muchos tokens: si se configura max_tokens bajo, la respuesta final puede quedar vacia mientras el modelo sigue razonando.
- Restricciones de uso comercial: licencia Apache-2.0 permite uso comercial, pero la naturaleza uncensored puede implicar riesgos legales o de reputacion segun el sector.
- Solo para Apple Silicon: el formato MLX no es portable a GPU NVIDIA sin conversion previa a otro formato (GGUF, etc.).

## Enlaces

- Modelo en HuggingFace (este repo): https://huggingface.co/sahilchachra/Qwen3.8-27B-Uncensored-MXFP4
- Modelo base uncensored: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Variante MXFP8: https://huggingface.co/sahilchachra/Qwen3.8-27B-Uncensored-MXFP8
- Variante GGUF Q4_K_M: https://huggingface.co/choz/Qwen3.8-27B-Uncensored-Q4_K_M
- Blog de orcarouter sobre ejecucion local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Repositorio de cuantizacion MLX (onurburak9): https://github.com/onurburak9/Qwen3.8-27B-Uncensored
- Guia de ejecucion local (VRAM y quants): https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html
- Libreria mlx-vlm: https://github.com/Blaizzy/mlx-vlm
