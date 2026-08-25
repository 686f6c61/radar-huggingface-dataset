# abenzerps/Apodex-1.1-mini-MLX-4bit

## Resumen

Apodex-1.1-mini-MLX-4bit es una conversión cuantizada a 4 bits del modelo Apodex-1.1-mini, desarrollado por Apodex AI, una compañía que se presenta como creadora del "primer solucionador pesado autoevolutivo" (self-evolving heavy-duty solver). El modelo original es un MoE de 35,95 mil millones de parámetros basado en la arquitectura Qwen3.5, diseñado para tareas de larga duración que implican investigación, manejo de archivos, datos, código y herramientas. Esta versión MLX está pensada para ejecutarse en Apple silicon mediante la librería `mlx-lm`.

La conversión, realizada por el usuario abenzerps, mantiene la arquitectura MoE con router y shared-expert gate preservados a 8 bits, mientras que el resto de pesos se cuantizan con affine 4-bit y group size 64. El resultado ocupa 19,5 GB en disco. Es importante señalar que, aunque el checkpoint original es multimodal, esta conversión solo incluye el modelo de lenguaje; no admite entrada de imágenes. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (MoE) |
| Parametros totales | 35,95 mil millones (modelo original); 5.419.330.688 tensores almacenados en safetensors (pesos cuantizados empaquetados en uint32) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 4-bit (group size 64, 4,503 bits efectivos por peso); router y shared-expert gate a 8-bit |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (BF16 no cuantizado como referencia) |

## Arquitectura y entrenamiento

El modelo base Apodex-1.1-mini emplea una arquitectura de mezcla de expertos (MoE) derivada de Qwen3.5, con un router que distribuye tokens entre expertos y un shared-expert gate que se mantiene a 8 bits en esta conversión. No se dispone de información pública sobre el número de expertos, los parámetros activos por token ni el proceso de entrenamiento (tokens totales, composición del dataset, uso de RLHF o DPO). La conversión MLX se realizó con `mlx_lm.convert` usando cuantización affine de 4 bits y dtype bfloat16, y pasó pruebas de carga, verificación de checksums y generación determinista en CPU.

## Capacidades

- Generacion de texto conversacional y de larga duracion, con soporte de modo "thinking" activable o desactivable mediante la plantilla de chat.
- Razonamiento complejo y resolucion de problemas en multiples pasos, orientado a tareas de investigacion profunda.
- Manejo de archivos, datos y codigo, con capacidad de integracion de herramientas (tool use) segun la descripcion del modelo base.
- Soporte multilingue limitado a ingles y chino.
- No soporta entrada de imagenes en esta conversion MLX, aunque el checkpoint original es multimodal.

## Casos de uso

- Investigacion academica y de mercado: el modelo puede analizar grandes volumenes de documentos, extraer conclusiones y verificar cada paso del razonamiento, gracias a su diseno orientado a tareas de larga duracion y su modo de pensamiento estructurado.
- Generacion y revision de codigo en entornos de desarrollo: su capacidad para manejar herramientas y archivos permite integrarlo en pipelines de CI/CD para revisar pull requests, generar tests o documentar APIs.
- Analisis de datos y generacion de informes: puede procesar datasets, resumir hallazgos y producir informes en ingles o chino, adecuado para equipos de datos que trabajan con documentacion bilingue.
- Automatizacion de atencion al cliente: con su ventana de contexto (no especificada pero presumiblemente amplia) y soporte de conversacion multi-turno, puede gestionar consultas complejas de usuarios en ingles o chino.
- Asistente de investigacion juridica o cientifica: su capacidad de razonamiento verificable lo hace util para tareas que requieren trazabilidad de fuentes y argumentacion rigurosa.
- Desarrollo de agentes autonomos: al soportar tool calling y razonamiento multi-paso, puede servir como nucleo de agentes que interactuan con APIs, bases de datos o sistemas externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, y la busqueda web no ha revelado datos comparativos. Se recomienda consultar el repositorio oficial de Apodex para futuras publicaciones.

## Requisitos de hardware

- Los pesos ocupan aproximadamente 19,5 GB en disco. Se necesita memoria unificada adicional para el runtime y la cache KV, especialmente con contextos largos.
- Diseñado para Apple silicon: requiere un Mac con al menos 32 GB de memoria unificada para una experiencia fluida; 64 GB o mas recomendados para contextos extensos.
- No es adecuado para GPUs NVIDIA o AMD sin adaptacion, ya que el formato MLX es exclusivo de Apple.
- Despliegue mediante `mlx-lm` (pip install -U mlx-lm) con comandos como `mlx_lm.generate` o `mlx_lm.server`.
- La prueba de humo oficial reporto cero uso de swap en CPU, lo que sugiere que la inferencia basica es viable en equipos con suficiente RAM unificada.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos MoE de tamano similar (por ejemplo, Qwen3-30B-A3B o DeepSeek-V2-Lite). La falta de benchmarks publicos y de especificaciones detalladas (parametros activos, contexto) impide establecer una tabla comparativa fiable. Se recomienda evaluar el modelo directamente en las tareas objetivo.

## Limitaciones y advertencias

- Solo soporta ingles y chino; no cubre otros idiomas, lo que limita su uso en entornos multilingues amplios.
- Esta conversion MLX no incluye capacidades de vision, a pesar de que el modelo base es multimodal. Cualquier tarea que requiera entrada de imagenes no funcionara.
- Requiere hardware Apple silicon; no es portable a entornos con GPUs convencionales sin una conversion adicional a otro formato (por ejemplo, GGUF o FP16).
- No se han publicado datos sobre sesgos, alucinaciones o rendimiento en tareas especificas; se recomienda validar en el dominio de uso antes de desplegar en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se deben mantener las atribuciones originales y los avisos de licencia.
- El numero de parametros mostrado en HuggingFace (5,4 mil millones) puede inducir a error; corresponde a tensores empaquetados, no al tamano real del modelo (35,95 mil millones).

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/abenzerps/Apodex-1.1-mini-MLX-4bit
- Modelo base original: https://huggingface.co/apodex/Apodex-1.1-mini
- Organizacion Apodex en HuggingFace: https://huggingface.co/apodex
- Sitio web oficial de Apodex: https://www.apodex.com/ y https://www.apodex.ai/
- GitHub de Apodex (incluye AgentHarness, harness de evaluacion): https://github.com/ApodexAI
