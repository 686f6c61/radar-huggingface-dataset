# Philiaxis/Himel3-1.7B

## Resumen

Himel3-1.7B es un ajuste fino (finetune) del modelo LFM3-1.7B de Liquid AI, desarrollado por Philiaxis y publicado en Hugging Face. Se trata de un checkpoint de 1.728.801.536 parámetros (aproximadamente 1,7 mil millones) orientado a generación de texto conversacional, distribuido en formato MLX bfloat16 para su ejecución en Apple Silicon. El modelo base es un transformer de Liquid AI y este derivado incorpora un ajuste de identidad: responde con su propio nombre y el de su desarrollador.

El ajuste se realizó mediante LoRA de rango 8 aplicado a las últimas cuatro capas, con datos de entrenamiento que mezclan trazas de razonamiento generadas por el propio modelo base. Posteriormente, los adaptadores LoRA se fusionaron en los pesos bfloat16, de modo que el artefacto distribuido no requiere cargar adaptadores por separado. El repositorio ocupa 3,5 GB y el peso descargable ronda los 3,46 GB.

Su relevancia actual es doble: por un lado, demuestra un flujo de trabajo de ajuste ligero sobre un modelo pequeño con evaluación estadística rigurosa (test de McNemar sobre MGSM en japonés e inglés); por otro, ofrece un punto de comparación práctico frente a alternativas como Qwen3-1.7B o Gemma en tareas aritméticas multilingües. La licencia es LFM Open License v1.0, con condiciones específicas para uso comercial en su artículo 5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de LiquidAI/LFM3-1.7B); pesos en formato MLX |
| Parametros totales | 1.728.801.536 (~1,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (único formato distribuido); no se documentan otras cuantizaciones |
| Idiomas soportados | japonés (ja), inglés (en) |
| Licencia | LFM Open License v1.0 (license: other; ver artículo 5 para uso comercial) |
| Formato de pesos | safetensors en layout MLX (bf16); librería mlx, custom_code |
| Tamano del repo | 3,5 GB (pesos ~3,46 GB) |
| Modelo base | LiquidAI/LFM3-1.7B (relación: finetune) |
| Descargas / likes | 147 / 1 |

## Arquitectura y entrenamiento

El modelo parte de LFM3-1.7B de Liquid AI, un transformer de aproximadamente 1,7 mil millones de parámetros. Sobre esa base, Philiaxis aplicó un ajuste de identidad mediante LoRA de rango 8 restringido a las últimas cuatro capas del modelo. El conjunto de entrenamiento combinó datos de ajuste con trazas de razonamiento (reasoning traces) generadas por el propio modelo base, una técnica de auto-destilación que busca preservar y reforzar las capacidades de razonamiento del modelo original durante el ajuste.

Tras el entrenamiento, los adaptadores LoRA se fusionaron en los pesos bfloat16, de forma que el checkpoint final es un modelo denso estándar sin adaptadores adicionales. La distribución se realiza exclusivamente en formato MLX bfloat16, pensado para Apple Silicon (verificado con Python 3.12, MLX-VLM 0.7.11 y Transformers 5.22.2). No se documentan en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en japonés e inglés, con soporte de mensajes de sistema (system prompt).
- Razonamiento aritmético y resolución de problemas matemáticos de varios pasos (evaluado en MGSM).
- Modo de razonamiento explícito (thinking) activable mediante `--enable-thinking`.
- Ajuste de identidad: el modelo responde con su propio nombre (Himel3) y su desarrollador (Philiaxis).
- Soporte de decodificación con parámetros de muestreo (temperature, top-k, top-p, repetition penalty, seed).
- Capacidades multilingües limitadas a japonés e inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Evaluación de ajustes ligeros sobre modelos pequeños: el checkpoint sirve como referencia reproducible para estudiar cómo un LoRA de rango 8 en las últimas cuatro capas afecta al rendimiento aritmético, con un protocolo de evaluación estadística (McNemar) ya publicado.
- Razonamiento matemático en japonés: el modelo alcanza un 84,4% en MGSM japonés con mensaje de sistema, lo que lo hace adecuado para asistentes de resolución de problemas aritméticos en ese idioma.
- Prototipado local en Apple Silicon: al distribuirse en MLX bf16, permite experimentar con generación de texto en Macs con chip M-series sin depender de GPUs dedicadas.
- Asistentes conversacionales bilingües ja/en: con soporte de system prompt, puede integrarse en aplicaciones de chat que requieran respuestas en japonés o inglés con contexto de instrucciones.
- Investigación sobre identidad de modelo: útil para estudiar cómo el ajuste de identidad interactúa con las capacidades del modelo base y con la presencia o ausencia de system message.
- Comparación de variantes (graft vs. estándar): el modelo tiene una variante hermana, Himel3-1.7B-graft, lo que permite analizar el impacto de distintas técnicas de ajuste sobre las mismas métricas.
- Docencia y experimentación con pipelines MLX-VLM: el ejemplo de ejecución documentado sirve como plantilla para montar inferencia local con parámetros de muestreo controlados.

## Benchmarks y rendimiento

Evaluación sobre MGSM (250 preguntas en japonés y 250 en inglés), con temperature 0,6, top-p 0,95 y máximo de 8.192 tokens de salida. La fila "+ system" indica el uso del mensaje de sistema `You are a helpful assistant trained by Liquid AI.`

| Modelo y condición | Japonés | Inglés |
|---|---:|---:|
| Himel3-1.7B | 77,6% | 92,8% |
| Himel3-1.7B + system | 84,4% | 94,0% |
| Himel3-1.7B-graft | 78,4% | 94,4% |
| Himel3-1.7B-graft + system | 82,4% | 94,4% |
| LFM3-1.7B | 75,6% | 93,6% |
| LFM3-1.7B + system | 84,0% | 94,8% |
| LFM3-1.7B + BOS graft | 80,0% | 94,0% |

Datos adicionales reportados en la model card:

- Añadir el system message eleva el japonés de 77,6% a 84,4% (+6,8 puntos; McNemar exacto, p = 0,00455) y reduce la tasa de alcance del límite de salida del 5,2% al 1,2%.
- La diferencia frente al modelo base LFM3 con el mismo system message es de +0,4 puntos (p = 1,00).
- En las 250 preguntas japonesas, Himel3 + system supera a Qwen3-1.7B (72,8%; p = 0,0000154) y a Gemma 4 E2B-it (78,0%; p = 0,00904).
- En el subconjunto común de 125 preguntas con Gemma 4 E4B-it: Himel3 + system 82,4% frente a 79,2% de E4B (p = 0,454).
- Diferencia de la variante graft frente a la estándar en japonés: +0,8 puntos sin system (p = 0,864) y −2,0 puntos con system (p = 0,405).

## Requisitos de hardware

- VRAM/RAM estimada: los pesos en bfloat16 ocupan aproximadamente 3,46 GB; la inferencia requiere al menos ~4 GB de memoria unificada, más el espacio para el contexto y el caché KV.
- Hardware objetivo: Apple Silicon (MLX). No se documenta soporte para GPUs NVIDIA en la información disponible.
- Cabe en equipos de consumo: sí, en Macs con chip M-series con memoria unificada suficiente (8 GB o más recomendable).
- Opciones de despliegue: MLX-VLM (`python -m mlx_vlm.generate`); el ejemplo verificado usa Python 3.12, MLX-VLM 0.7.11 y Transformers 5.22.2. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MGSM ja | MGSM en | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Himel3-1.7B (+ system) | ~1,7 B | no disponible | 84,4% | 94,0% | LFM Open License v1.0 | MLX bf16 |
| LFM3-1.7B (+ system) | ~1,7 B | no disponible | 84,0% | 94,8% | LFM Open License v1.0 | no disponible |
| Qwen3-1.7B | ~1,7 B | no disponible | 72,8% | no disponible | no disponible | no disponible |
| Gemma 4 E2B-it | no disponible | no disponible | 78,0% | no disponible | no disponible | no disponible |
| Gemma 4 E4B-it | no disponible | no disponible | 79,2% (125 preguntas) | no disponible | no disponible | no disponible |

Nota: los datos de MGSM de los modelos comparados provienen de la model card de Himel3; no se dispone de sus especificaciones completas en la información proporcionada.

## Limitaciones y advertencias

- La evaluación se limita a MGSM (aritmética); no mide contexto largo, uso de herramientas ni conocimiento general.
- En preguntas en japonés el razonamiento puede derivar al inglés, y en razonamientos largos se puede alcanzar el límite de tokens de salida.
- Idiomas soportados únicamente japonés e inglés; no se documenta cobertura de otras lenguas, incluido el español.
- No se documentan datos sobre sesgos, riesgo de alucinación ni robustez fuera de MGSM.
- La licencia LFM Open License v1.0 impone condiciones para uso comercial (artículo 5); es imprescindible revisarlas antes de un despliegue en producción.
- El modelo es un ajuste de identidad sobre LFM3-1.7B; su rendimiento general no debe asumirse superior al del modelo base, dado que las diferencias en MGSM son pequeñas y en algunos casos no significativas.
- Distribución exclusiva en MLX bf16: no hay versiones GGUF ni cuantizadas, lo que limita su uso fuera de Apple Silicon.
- El modelo tiene solo 1 like y 147 descargas, con fecha de creación reciente; la validación por parte de la comunidad es escasa.
- No se documenta el contexto máximo soportado, lo que dificulta planificar aplicaciones con entradas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Philiaxis/Himel3-1.7B
- Variante graft: https://huggingface.co/Philiaxis/Himel3-1.7B-graft
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Informe experimental de Himel3: https://himel.philiaxis.com/himel3/
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
- Notas de cambios y licencias de código: `NOTICE.md` en el repositorio
