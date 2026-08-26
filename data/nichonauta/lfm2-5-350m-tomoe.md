# Nichonauta/LFM2.5-350M-ToMoE

## Resumen

LFM2.5-350M-ToMoE es una conversión Mixture-of-Experts (MoE) del modelo denso LiquidAI/LFM2.5-350M, desarrollada por el investigador independiente Nichonauta como demostración del método ToMoE (Dynamic Structural Pruning + Hypernetwork). En lugar de entrenar un MoE desde cero, el autor parte de un modelo denso ya entrenado y lo transforma en un MoE de canales mediante poda estructural dinámica, donde cada token activa un subconjunto de los parámetros. El resultado es un modelo con 321,4 millones de parámetros almacenados (frente a los 354,5 M del denso) y unos 205 millones de parámetros activos por token, lo que supone una reducción de cómputo de aproximadamente un 42 % respecto al original.

La relevancia de esta pieza radica en que explora una vía alternativa para obtener modelos eficientes sin entrenar desde cero, aplicada a una arquitectura híbrida (conv+atención) moderna como la de LFM2.5. Sin embargo, la conversión produce una degradación notable en la calidad generativa, tal como reconoce el propio autor: la perplejidad en formato chat pasa de 21,7 en el modelo denso a 314,2 en la versión MoE, y la generación tiende a repetir. Se trata, por tanto, de un artefacto de investigación para estudiar el pipeline ToMoE, no de un modelo listo para producción. Está disponible en Hugging Face bajo la licencia LFM Open License v1.0, con pesos en safetensors y cuantizaciones GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida (ShortConv + atención completa) con MoE de canales |
| Parámetros totales | 321 988 867 (almacenados) |
| Parámetros activos | ~205 000 000 (por token) |
| Longitud de contexto | No especificada en la card; el modelo base LFM2.5-350M soporta 32 000 tokens (según documentación de Liquid AI) |
| Tipos de cuantización | BF16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (fp32) y GGUF |

## Arquitectura y entrenamiento

El modelo se obtiene mediante el método ToMoE, que combina poda estructural dinámica con una hiperred neuronal. La hiperred (un GRU bidireccional) genera máscaras diferenciables por canal para cada subcapa, mientras los pesos originales del modelo denso permanecen congelados. La hiperred se entrena mediante destilación de conocimiento online (2× forward KL) contra el profesor denso, con un presupuesto de poda de p = 0.05 y una regularización ToMoE con lambda de 64 a 128 y Gumbel base annealed de 1.0 a −0.25, usando 8 expertos por capa. El entrenamiento se realizó con 2400 pasos, secuencias de 2048 tokens, gradiente checkpointing y un dataset de 4M tokens compuesto por turnos de wikitext-103 formateados como chat (usuario/asistente) para alinear la señal de destilación con la distribución instruct.

La arquitectura resultante consta de 16 capas: 10 capas ShortConv (poda estática de canales) y 6 capas de atención completa (con Q y K a ancho completo, y V con máscaras deterministas por token). El FFN se reduce de 6656 a 4608 canales por capa, y la dimensión de cabecera de atención es de 64. Las embeddings están atadas (67,1 M de parámetros siempre activos). El modelo requiere `trust_remote_code=True` en Transformers porque define una clase personalizada `Lfm2MoEForCausalLM` en `modeling_lfm2_moe_final.py`.

## Capacidades

- Generación de texto conversacional y de instrucciones, aunque con calidad degradada respecto al modelo denso.
- Soporte de chat multi-turno mediante el chat template incluido.
- Capacidades multilingües básicas (9 idiomas), heredadas del modelo base.
- No se indica soporte de tool calling, function calling ni razonamiento multi-step en la card.
- No incluye capacidades de visión, audio ni otros modalidades.
- Es un artefacto de investigación para estudiar la conversión MoE, no un modelo de propósito general.

## Casos de uso

- Investigación en compresión de modelos: sirve como banco de pruebas para evaluar la viabilidad de ToMoE en arquitecturas híbridas pequeñas. Se puede comparar su perplejidad y comportamiento generativo con el denso original para medir el coste de la conversión.
- Estudio de la dinámica de los expertos: al ser un MoE con 8 expertos por capa y activación top-1, permite analizar la especialización de los expertos en distintos dominios lingüísticos o estilísticos, usando el modelo como sustrato para visualizar rutas de activación.
- Desarrollo de técnicas de destilación: el proceso de entrenamiento (online KD con hiperred) puede replicarse o modificarse sobre este modelo para experimentar con otras funciones de pérdida o regularizaciones.
- Demo de conversión de modelos en entornos con pocos recursos: al ser un modelo pequeño (321 M de parámetros) y con cuantizaciones GGUF, puede ejecutarse en CPU o en GPUs de baja gama, permitiendo probar el pipeline de conversión en un entorno accesible.
- Generación de texto de baja calidad en entornos no críticos: si se acepta la degradación, puede servir para pruebas de integración de pipelines de generación, aunque no se recomienda para uso real.
- Evaluación de métricas de perplejidad en formatos de chat: el modelo permite reproducir las métricas de PPL en wikitext-2 y chat-formatted, útil para validar metodologías de evaluación.

## Benchmarks y rendimiento

La card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), sino solo métricas de perplejidad sobre wikitext-2 y un conjunto de chat. Se presentan a continuación:

| Métrica | Dense base (LiquidAI/LFM2.5-350M) | ToMoE MoE (LFM2.5-350M-ToMoE) |
|---|---|---|
| Perplexidad wikitext-2 (raw, 1810 tokens) | 919,9 | 994,4 |
| Perplexidad chat-formatted (prompt + respuesta) | 21,7 | 314,2 |
| Parámetros totales | 354,5 M | 321,4 M almacenados |
| Parámetros activos por token | 354,5 M | ~205 M |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo almacena 321,4 M de parámetros en fp32 (~1,3 GB). Con cuantización Q4_K_M (~0,2 GB) puede ejecutarse en GPU con 2 GB de VRAM o incluso en CPU.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, etc.) es suficiente. Para CPU, se recomienda un procesador con al menos 4 núcleos y 8 GB de RAM.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en prácticamente cualquier GPU comercial actual.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, llama.cpp (para GGUF), Ollama (si se convierte el GGUF), vLLM no soporta el modelo personalizado directamente.
- Latencia y throughput estimados: no se proporcionan datos en la card. Dado el tamaño reducido y los ~205 M de parámetros activos, se espera una latencia de decodificación de unos pocos milisegundos por token en GPU moderna, y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

El modelo se compara con su base densa y con otros modelos pequeños de propósito general. No se dispone de datos de benchmark comparativos para estos modelos.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Nichonauta/LFM2.5-350M-ToMoE | 321,4 M | ~205 M | No especificado (base: 32K) | LFM Open License v1.0 | safetensors, GGUF |
| LiquidAI/LFM2.5-350M (denso) | 354,5 M | 354,5 M | 32K | LFM Open License v1.0 | safetensors |
| SmolLM-360M (HuggingFace) | 360 M | 360 M | 2K (variante) | Apache 2.0 | safetensors |
| Qwen2.5-0.5B | 494 M | 494 M | 32K | Apache 2.0 | safetensors, GGUF |

No hay datos públicos de rendimiento comparativo entre estos modelos en tareas estándar.

## Limitaciones y advertencias

- Degradación significativa de la calidad generativa: la perplejidad en formato chat es ~14 veces mayor que la del modelo denso (314 vs 22), y la generación tiende a repetir.
- No apto para producción: es un artefacto de investigación que demuestra el pipeline ToMoE, no un modelo robusto para aplicaciones reales.
- Podría presentar sesgos heredados del modelo base, que fue entrenado con datos de internet no filtrados; no se han realizado evaluaciones de sesgo ni de seguridad.
- Riesgo de alucinación elevado debido a la degradación de calidad; no se recomienda su uso en tareas de hecho factual.
- Requiere `trust_remote_code=True` para cargar en Transformers, lo que implica ejecutar código personalizado (potencialmente no auditado).
- Licencia restrictiva: la LFM Open License v1.0 puede tener condiciones específicas sobre uso comercial y redistribución; se debe revisar el texto completo.
- No se ha verificado la compatibilidad con todos los backends; la card solo menciona Transformers y llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nichonauta/LFM2.5-350M-ToMoE
- Repositorio GGUF (cuantizaciones): https://huggingface.co/Nichonauta/LFM2.5-350M-ToMoE-GGUF
- Modelo base LiquidAI/LFM2.5-350M: https://huggingface.co/LiquidAI/LFM2.5-350M
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Documentación de LFM2.5-350M en Liquid Docs: https://docs.liquid.ai/lfm/models/lfm25-350m
- Receta de vLLM para LFM2.5-350M: https://recipes.vllm.ai/LiquidAI/LFM2.5-350M
- Modelo ColBERT de LiquidAI (relacionado): https://huggingface.co/LiquidAI/LFM2.5-ColBERT-350M
