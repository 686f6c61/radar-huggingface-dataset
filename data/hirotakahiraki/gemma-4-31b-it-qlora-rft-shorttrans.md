# hirotakahiraki/gemma-4-31B-it-qlora-rft-shorttrans

## Resumen
El modelo `gemma-4-31B-it-qlora-rft-shorttrans` es un adaptador QLoRA desarrollado por el usuario hirotakahiraki sobre el modelo base `google/gemma-4-31B-it`. Su propósito es muy específico: generar traducciones simultáneas del inglés al japonés en estilo interpretación, produciendo versiones abreviadas de traducciones previas (retranslation) para mantener la sincronía en escenarios de traducción de voz a voz (S2ST). No es un modelo de traducción general, sino un componente especializado dentro de un pipeline de interpretación simultánea.

El adaptador se ha entrenado mediante Rejection-sampling Fine-Tuning (RFT), una variante de ajuste fino que selecciona las mejores respuestas de un conjunto de muestras generadas. La innovación principal es que destila un flujo de producción best-of-8 (que requiere muestreo múltiple, filtros deterministas y un juez LLM externo) en una única generación a temperatura cero, reduciendo drásticamente el coste de inferencia en producción.

Con 3.690 ejemplos de entrenamiento y 3 épocas, el modelo logra mejorar las métricas del modelo base en la tarea concreta: reduce el ratio de longitud de 0,80 a 0,65 y eleva la tasa de aprobación del juez GLM del 83,8% al 96,4% en validación. Es relevante para desarrolladores que construyan sistemas de interpretación simultánea ja-en y necesiten abreviar traducciones en tiempo real sin perder calidad semántica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA (r=64, α=128) sobre transformer Gemma 4 31B |
| Parametros totales | No disponible (adaptador LoRA; el base tiene 31B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base en 4-bit NF4 durante entrenamiento; inferencia vía LoRA sobre base (posible 4/8/16-bit) |
| Idiomas soportados | Japonés (ja), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento
El adaptador se entrena sobre `google/gemma-4-31B-it`, un transformer decoder-only de 31.000 millones de parámetros. El ajuste se realiza con QLoRA: cuantización 4-bit NF4 del modelo base, rango LoRA r=64, alpha=128, aplicado a todas las capas de atención y feed-forward. El entrenamiento duró 3 épocas con learning rate 1e-4 sobre 8 GPUs, aproximadamente una hora en total.

La técnica de entrenamiento es Rejection-sampling Fine-Tuning (RFT). El pipeline de generación de datos consta de tres fases: primero, el modelo base genera 8 muestras por ejemplo con temperatura 0,7 usando un prompt que pide abreviar al 40-60%; segundo, un filtro determinista descarta candidatos por formato incorrecto, ratio de palabras fuera de 0,35-0,75 o contaminación con números de chunk; tercero, un juez LLM (GLM Flash 5.3) compara las dos candidatas más cortas contra la traducción previa truncada y selecciona la ganadora más corta entre las aprobadas. El resultado son 3.690 ejemplos de alta calidad que destilan el flujo best-of-8 en una sola pasada a temperatura cero.

## Capacidades
- Generación de traducciones abreviadas inglés→japonés en estilo interpretación simultánea.
- Retranslation: reescritura de una traducción previa en una versión más corta que preserve el significado.
- Generación de salida en formato JSON (`{"en": "..."}`) o texto plano.
- Optimizado para decodificación greedy (temperatura 0) en una sola pasada.
- Capacidad de reintento con muestreo múltiple (temp 0,7, N=8) y filtrado por gates externos.
- No soporta atribución de spans (tarea `attr`).
- No diseñado para traducción general ni para otros pares de idiomas.

## Casos de uso
- Interpretación simultánea de voz a voz (S2ST): el modelo recibe la traducción acumulada y el texto fuente en inglés y genera una versión abreviada en japonés que cabe en la ventana temporal disponible, manteniendo la sincronía con el hablante.
- Subtitulado en directo de conferencias: integrado en un pipeline de ASR + MT + este adaptador, permite generar subtítulos japoneses más cortos que los de una traducción literal, reduciendo el desfase con el audio original.
- Reescritura de traducciones previas en sistemas de interpretación por chunks: cuando un chunk anterior resultó demasiado largo, este modelo lo comprime para liberar espacio en la ventana de contexto del intérprete automático.
- Producción de datos de entrenamiento para modelos de interpretación: al destilar el flujo best-of-8, sirve como generador de traducciones abreviadas de alta calidad para aumentar datasets de S2ST.
- Evaluación de sistemas de traducción simultánea: el adaptador puede usarse como referencia de "traducción óptima abreviada" para comparar otros sistemas.
- Integración en herramientas de asistencia a intérpretes humanos: sugiere versiones más cortas de una traducción en tiempo real, que el intérprete puede aceptar o editar.

## Benchmarks y rendimiento
Evaluación sobre 619 ejemplos de validación, temperatura 0, N=1:

| Métrica | Este modelo | Base + mismo prompt | Base + prompt antiguo |
|---|---|---|---|
| Ratio de palabras p50 | 0,65 | 0,71 | 0,80 |
| Tasa de aprobación juez GLM | 96,4% | 94,5% | 83,8% |
| GLM pass@8 (temp 0,7) | 85,1% | 81,1% | No disponible |
| Pass@8 determinista | 91% | 85% | No disponible |

## Requisitos de hardware
- VRAM estimada: el adaptador en sí ocupa 2,0 GB; el modelo base de 31B requiere aproximadamente 62 GB en FP16, 32 GB en 8-bit o 18-20 GB en 4-bit NF4.
- GPU recomendadas: A100 80 GB o H100 para FP16; A100 40 GB o RTX 4090 (24 GB) para cuantización 4-bit.
- Cabe en GPU de consumo (RTX 4090, RTX 3090) solo con cuantización 4-bit del base.
- Despliegue: vLLM con `enable_lora=True` y `max_lora_rank=64` (recomendado por el autor); también compatible con PEFT + transformers.
- Latencia y throughput: no disponibles. El autor indica entrenamiento en ~1 hora con 8 GPUs.

## Comparativa con modelos similares
No disponible. No se han identificado en la información proporcionada modelos comparables de traducción simultánea ja-en con adaptadores LoRA sobre Gemma 4.

## Limitaciones y advertencias
- Entrenado exclusivamente para la tarea retrans (ratio de longitud EN/JA > 1,3); no soporta atribución de spans ni otras tareas de interpretación.
- La garantía final de preservación semántica depende de gates externos (juez GLM); el modelo por sí solo no verifica significado.
- Los datos de entrenamiento provienen principalmente de transcripciones de conversaciones orales en japonés; el comportamiento con entrada escrita formal no está validado.
- Solo soporta el par ja-en; no es un modelo multilingüe general.
- Riesgo de alucinación inherente al modelo base de 31B, no evaluado específicamente en esta ficha.
- Licencia MIT declarada, pero el modelo base Gemma 4 tiene su propia licencia que puede imponer restricciones adicionales al uso comercial; verificar términos de Google.
- Sin descargas ni validación externa (0 descargas, 0 likes en el momento de la ficha); madurez de producción no contrastada.

## Enlaces
- Hugging Face: https://huggingface.co/hirotakahiraki/gemma-4-31B-it-qlora-rft-shorttrans
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Dataset relacionado: `hirotakahiraki/hibiki-ja-en-tts-b3v3-curated-gemma4-31b-100k_20261110`
