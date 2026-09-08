# jakeatx/ream-288-rank32-3m-adapter

## Resumen

`jakeatx/ream-288-rank32-3m-adapter` es un adaptador LoRA de bajo rango (rank 32, alpha 64) desarrollado por jakeatx para continuar el ajuste fino de un modelo base MoE podado y cuantizado con precisión mixta: `jakeatx/slimder-qwen38-ream288-depth32-agentic-ngram50-mixed-nvfp4-v2`. El adaptador se entrenó sobre un subconjunto de trazas de razonamiento agéntico (`august-2026-frontier-traces`), con 12.558 filas elegibles y un 5 % de validación. El objetivo era mejorar la pérdida de validación en tokens supervisados de asistente/razonamiento, alcanzando una loss final de 0.6171 tras procesar 3.001.072 tokens.

El adaptador tiene un tamaño de aproximadamente 156 MiB y el repositorio completo ocupa 0.5 GB. No se dispone de datos sobre arquitectura del modelo base, parámetros totales o longitud de contexto en la información proporcionada. El modelo base emplea una arquitectura personalizada REAM/PLE con expertos congelados cuantizados en NVFP4 y matrices no expertas en BF16, lo que requiere un runtime específico para ejecutar la ruta nativa de grupo MoE; la carga genérica con Transformers puede no funcionar correctamente.

Este modelo es relevante para investigadores que trabajan con adaptadores PEFT sobre arquitecturas MoE personalizadas, cuantización NVFP4 y kernels FlashInfer, ya que proporciona artefactos de entrenamiento verificables y métricas de validación completas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo base MoE REAM-288 con arquitectura personalizada REAM/PLE; rango 32, alpha 64 |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (el modelo base es MoE, pero no se especifica el número de parámetros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Modelo base: NVFP4 en expertos congelados FC1/FC2, BF16 en matrices no expertas; adaptador en safetensors (precisión no especificada) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (`adapter_model.safetensors`) y configuración PEFT (`adapter_config.json`) |

## Arquitectura y entrenamiento

El adaptador es una continuación LoRA de rango 32 y alpha 64 sobre un modelo base podado con arquitectura MoE personalizada. Durante el entrenamiento, los tensores FC1/FC2 de los expertos congelados usaron kernels nativos FlashInfer grouped NVFP4, mientras que las matrices no expertas se mantuvieron en BF16 y la capa PLE en mayor precisión. El dataset de entrenamiento (`jakeatx/august-2026-frontier-traces`) contenía 12.558 filas elegibles, con una partición fija de validación del 5 %. No se recortaron ni alteraron las filas del dataset para esta ejecución.

El entrenamiento se realizó con el objetivo de maximizar la probabilidad de tokens supervisados de asistente/razonamiento. La loss de validación final fue 0.6171666597 sobre 32 ventanas, con una progresión de 0.6332411821 en 1.20 M de tokens, 0.6297578955 en 1.50 M, 0.6188944065 en 2.00 M, 0.6211808663 en 2.50 M y 0.6171666597 en 3.00 M. El throughput de entrenamiento fue de 42.13 tokens supervisados por segundo y 98.49 tokens renderizados por segundo. La arquitectura y el runtime personalizados los proporciona el repositorio base; la carga genérica con Transformers puede no ejercitar la ruta nativa de grupo MoE.

## Capacidades

- Generación de texto: el adaptador está diseñado para su uso con el pipeline `text-generation`, aunque no se detallan capacidades específicas de generación.
- Razonamiento agéntico: el modelo base está etiquetado como `agentic` y el dataset de entrenamiento contiene trazas de razonamiento de tipo frontier, lo que sugiere una orientación hacia tareas de agencia y razonamiento multi-paso.
- Continuación de ajuste fino: el repositorio incluye artefactos de entrenamiento (`training/`) para reanudar el entrenamiento exactamente desde el checkpoint final, permitiendo experimentos de continuidad.
- Ruta de ejecución especializada: los pesos del adaptador están preparados para integrarse con los kernels FlashInfer grouped NVFP4 del modelo base, que permiten una ejecución eficiente de la parte de expertos en precisión NVFP4.
- Soporte de tool calling: no disponible (no se menciona en la información proporcionada).
- Capacidades multilingües: no disponibles.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en adaptadores LoRA para MoE cuantizados: el adaptador sirve como referencia de un ajuste fino de bajo rango (rank 32) sobre un modelo base podado con NVFP4, permitiendo estudiar la relación entre rango, precisión de la cuantización y pérdida de validación.
- Continuación de entrenamiento: los archivos `training/` permiten retomar el entrenamiento desde el último estado guardado, lo que resulta útil para experimentos de continuidad con distintos hiperparámetros o conjuntos de datos.
- Evaluación de la pérdida de validación: la información incluye la métrica de validación final (0.6171) y su progresión a lo largo de los hitos de tokens, lo que facilita comparar configuraciones de adaptadores y verificar la calidad del ajuste.
- Estudio de la arquitectura REAM/PLE: al ser un adaptador sobre un modelo con una arquitectura MoE personalizada, puede usarse para analizar el comportamiento de la mezcla de expertos con precisión mixta y la capa PLE en tareas de razonamiento agéntico.
- Reproducción de resultados: el repositorio incluye `SHA256SUMS`, configuración resuelta y un resumen conciso, lo que permite verificar la integridad de los artefactos y replicar la evaluación de validación.
- Pruebas de inferencia en runtime personalizado: los kernels FlashInfer grouped NVFP4 del modelo base se pueden ejercitar cargando el adaptador con el repositorio base, para medir el rendimiento de inferencia en GPUs con soporte para NVFP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web solo devolvió resultados genéricos de leaderboards de modelos LLM y páginas de Wikipedia no relacionadas con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. El modelo base utiliza kernels FlashInfer grouped NVFP4, por lo que se requiere una GPU compatible con esta precisión y runtime para ejercitar la ruta nativa.
- Compatibilidad con GPU de consumo: no se puede determinar sin datos adicionales.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama o TGI. El autor indica que la carga genérica con Transformers puede no ejercitar la ruta nativa grouped-MoE, por lo que se necesita el repositorio base para un despliegue correcto.
- Latencia y throughput: no hay datos de inferencia. Los únicos valores de throughput son de entrenamiento: 42.13 tokens supervisados/s y 98.49 tokens renderizados/s.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada ni en los resultados de búsqueda. Al tratarse de un adaptador LoRA para un modelo base con arquitectura personalizada REAM/PLE, la comparación requeriría información del modelo base original y de otros adaptadores similares.

## Limitaciones y advertencias

- Licencia no disponible: el uso comercial es incierto y requiere consultar al autor o al repositorio base.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; necesita el modelo base fijado en la revisión `76585f07af88aaba3649723a150b28dd8c2a24dc` y el runtime personalizado.
- Carga genérica con Transformers: puede no ejercitar la ruta nativa grouped-MoE, lo que podría producir resultados incorrectos o fallos de ejecución.
- Dataset de entrenamiento pequeño: con 12.558 filas y un 5 % de validación, la generalización puede ser limitada y la pérdida de validación puede estar sesgada hacia ese conjunto concreto.
- Riesgo de alucinación: no se ha evaluado; al tratarse de un ajuste fino sobre trazas de razonamiento, puede heredar errores o comportamientos no deseados de los datos originales.
- Sesgos: no hay información sobre sesgos conocidos. Los datos de entrenamiento provienen de trazas de frontier y no se aporta análisis de sesgo.
- Falta de benchmarks públicos: no se han publicado evaluaciones estandarizadas (MMLU, HumanEval, GSM8K, etc.), lo que impide valorar el rendimiento frente a otros modelos.

## Enlaces

- HuggingFace: https://huggingface.co/jakeatx/ream-288-rank32-3m-adapter
- Modelo base (referencia en la información): https://huggingface.co/jakeatx/slimder-qwen38-ream288-depth32-agentic-ngram50-mixed-nvfp4-v2
- No se han encontrado papers, blogs, repositorios adicionales o demos en los resultados de búsqueda.
