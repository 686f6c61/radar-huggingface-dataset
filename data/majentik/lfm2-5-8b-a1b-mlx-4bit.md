# majentik/LFM2.5-8B-A1B-MLX-4bit

## Resumen

LFM2.5-8B-A1B-MLX-4bit es una cuantización en 4 bits (affine, group size 32) del modelo LFM2.5-8B-A1B de Liquid AI, realizada por el usuario majentik para ejecución en Apple Silicon mediante la librería mlx-lm. El modelo original es un Mixture-of-Experts (MoE) con 8.000 millones de parámetros totales y solo 1.500 millones activos por paso, lo que lo hace especialmente eficiente para inferencia en dispositivos con recursos limitados. Incluye una ventana de contexto de 128.000 tokens y capacidades de razonamiento encadenado (chain-of-thought) y tool calling.

Esta variante cuantizada reduce el peso del modelo a aproximadamente 5,3 GB, permitiendo su uso en equipos Mac con memoria unificada moderada. Es relevante porque acerca un MoE de alto rendimiento a entornos de edge computing, manteniendo la licencia LFM Open License v1.0 que permite uso comercial con atribución. La cuantización se realizó con mlx-lm 0.31.3 y ha pasado una prueba de coherencia determinista antes de su publicación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Transformer |
| Parametros totales | 8.000 millones (aprox., segun documentacion de Liquid AI) |
| Parametros activos | 1.500 millones (1,5B) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | 4-bit affine, group size 32 (esta variante); tambien disponibles 2, 3, 5, 6, 8-bit y MXFP4 |
| Idiomas soportados | No disponible en esta variante; el modelo base soporta 9 idiomas (segun la version MLX-8bit oficial de LiquidAI) |
| Licencia | LFM Open License v1.0 (lfm1.0) - uso comercial permitido con atribucion |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-8B-A1B es un MoE con 8.000 millones de parametros totales y 1.500 millones activos por forward pass, disenado para equilibrar rendimiento y eficiencia en dispositivos de borde. Incorpora una ventana de contexto de 128.000 tokens y ha sido entrenado con tecnicas de razonamiento encadenado (chain-of-thought) y optimizado para tool calling rapido y fiable, segun la documentacion oficial de Liquid AI. No se han publicado detalles sobre el volumen de tokens de entrenamiento ni la composicion del dataset en la informacion disponible.

La cuantizacion de esta variante se realizo con `mlx_lm.convert` (mlx-lm 0.31.3) en formato affine de 4 bits con group size 32, lo que reduce el peso del modelo a 5,3 GB. El repositorio incluye una prueba de coherencia determinista (generacion de 32 tokens con greedy decoding) que verifico la ausencia de bucles, gibberish o restos de tokens especiales antes de su publicacion.

## Capacidades

- Generacion de texto conversacional con soporte de chat multi-turno.
- Razonamiento encadenado (chain-of-thought) para problemas complejos.
- Tool calling / function calling, segun la documentacion de Liquid AI.
- Soporte para agentes y razonamiento multi-paso.
- Capacidades multilingues (9 idiomas en el modelo base, aunque no se detallan en esta variante).
- Optimizado para ejecucion on-device en Apple Silicon mediante mlx-lm.
- Ventana de contexto larga (128K) para procesamiento de documentos extensos.

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo puede ejecutarse en portatiles Apple con memoria unificada de 8 GB o mas, ofreciendo respuestas fluidas sin conexion a internet.
- Automatizacion de tareas con tool calling: integrable en aplicaciones que necesitan invocar funciones externas (consultas a APIs, bases de datos o servicios web) de forma fiable.
- Razonamiento complejo en entornos de borde: su capacidad de chain-of-thought permite resolver problemas de logica o matematicas en dispositivos sin acceso a la nube.
- Procesamiento de documentos largos: con 128K de contexto, puede resumir o analizar informes, contratos o articulos extensos en una sola pasada.
- Desarrollo de agentes autonomos: su soporte para multi-step reasoning y tool calling lo hace adecuado para pipelines de agente que requieren planificacion y ejecucion secuencial.
- Generacion de codigo asistida: aunque no se menciona explicitamente, su naturaleza de modelo de texto y su capacidad de razonamiento lo hacen util para autocompletar o explicar fragmentos de codigo en entornos de desarrollo locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica "benchmarks pending" y no se proporcionan datos comparativos con otros modelos. Se recomienda consultar la documentacion oficial de Liquid AI para obtener metricas del modelo base, aunque no se han incluido en esta ficha por no estar disponibles en las fuentes consultadas.

## Requisitos de hardware

- Requiere Apple Silicon (M1 o posterior) por el formato MLX.
- Memoria unificada estimada: al menos 6-8 GB para cargar el modelo de 5,3 GB con margen para el contexto y la generacion.
- GPU integrada en el chip Apple Silicon (no requiere GPU discreta).
- Despliegue recomendado con mlx-lm (pip install mlx-lm) y uso mediante `mlx_lm.generate` o integracion en aplicaciones Python.
- No se dispone de datos de latencia o throughput especificos para esta cuantizacion.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para esta variante cuantizada. El modelo base LFM2.5-8B-A1B compite con otros MoE de tamano similar como Qwen2.5-7B-A3B (7B totales, 3B activos) o modelos densos de 7-8B como Llama 3.1 8B, pero no se han encontrado benchmarks comparativos en las fuentes consultadas. La ventaja principal de este modelo es su ratio de parametros activos (1,5B) y su contexto de 128K, que lo hacen especialmente adecuado para edge computing.

## Limitaciones y advertencias

- La cuantizacion en 4 bits puede degradar ligeramente la calidad de las respuestas en comparacion con el modelo original en precision completa.
- No se han publicado benchmarks de rendimiento para esta variante, por lo que no se puede verificar su calidad real en tareas estandar.
- La licencia LFM Open License v1.0 permite uso comercial con atribucion, pero es necesario revisar los terminos completos en el archivo LICENSE del repositorio.
- El modelo base soporta 9 idiomas, pero esta variante no especifica cuales, por lo que el rendimiento multilingue puede variar.
- Al ser una cuantizacion de terceros (majentik), no es una version oficial de Liquid AI y podria no reflejar exactamente el comportamiento del modelo original.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto especificas de esta cuantizacion.

## Enlaces

- Repositorio HuggingFace de esta variante: https://huggingface.co/majentik/LFM2.5-8B-A1B-MLX-4bit
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Documentacion oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-8b-a1b
- Blog de Liquid AI sobre el modelo: https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Variante MLX-8bit oficial de LiquidAI: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-MLX-8bit
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
