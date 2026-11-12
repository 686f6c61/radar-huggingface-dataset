# Jeesup/svd-safety-l2_svdllmwjsep96_r40

## Resumen

svd-safety-l2_svdllmwjsep96_r40 es un checkpoint de investigación derivado de meta-llama/Llama-2-7b-chat-hf, comprimido mediante la técnica SVD-LLM hasta el 59,98 % de sus parámetros densos originales (un 40 % de parámetros eliminados). Lo publica el usuario Jeesup como parte de un estudio sistemático sobre cómo la compresión por descomposición en valores singulares (SVD) degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes permite repararlo mejor. No es un modelo conversacional de propósito general: es una celda concreta de una rejilla experimental sobre reglas de selección y presupuestos de compresión.

El modelo parte de Llama-2-7b-chat (arquitectura transformer decoder-only de Meta, 6.738.415.616 parámetros tras la compresión) y aplica SVD-LLM con un conjunto de calibración mixto que combina utilidad (WikiText-2) y seguridad (WildJailbreak), seguido de una recuperación con LoRA en dos etapas (U y V secuenciales) sobre alpaca-cleaned. El resultado conserva una perplexity de 11,0875 en WikiText-2 y una precisión media zero-shot de 0,4900 en siete tareas, con una tasa de ataque exitoso muy baja en AdvBench (0,0019) pero un sobre-rechazo macro elevado (0,5409) medido con WildGuard.

Su relevancia es metodológica: permite cuantificar el compromiso entre seguridad y utilidad bajo compresión y comparar reglas de selección de componentes. La model card advierte explícitamente de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo base, por lo que cualquier uso en producción exige evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2), comprimido con SVD-LLM |
| Parametros totales | 6.738.415.616 (59,98 % del denso original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-2-7b-chat: 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm y activación SwiGLU. Sobre ese checkpoint se aplica SVD-LLM, que descompone las matrices de pesos y descarta componentes según una regla de selección basada en un SVD blanqueado (whitened SVD) estimado sobre un conjunto de calibración agrupado. En esta celda concreta, la matriz de calibración se construye como S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ, combinando 255 ventanas de 2.048 tokens de WikiText-2 train (muestreo del propio SVD-LLM, semilla 42, todas las posiciones) con las primeras 96 de 512 prompts de WildJailbreak train (vanilla y adversariales dañinos) emparejados con los rechazos propios de Llama-2-7b-chat (semilla 42, una conversación por muestra, 33.679 posiciones, todas evaluadas). La parte de seguridad representa solo el 6,06 % de las posiciones efectivas, lo que condiciona el sesgo del proceso hacia la utilidad.

Tras la compresión al 60,0 % de parámetros, se aplica la recuperación de segunda etapa de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16, entrenado sobre alpaca-cleaned. La semilla global del experimento es 42. El checkpoint resultante forma parte de una rejilla que barre reglas de selección de componentes y presupuestos de compresión, y esta celda corresponde a la regla "pooled utility + safety" con un 40 % de parámetros eliminados.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama-2-7b-chat y parcialmente preservada tras la compresión y la recuperación LoRA.
- Razonamiento zero-shot en siete tareas de evaluación (precisión media de 0,4900 con acc_norm donde se reporta).
- Respuesta a prompts dañinos con una tasa de ataque exitoso medida muy baja en AdvBench (0,0019) y StrongREJECT (0,0160) según el juez HarmBench.
- Comportamiento de rechazo calibrado mediante el conjunto de seguridad de WildJailbreak, aunque con un sobre-rechazo macro de 0,5409 (WildGuard), lo que indica una tendencia elevada a rechazar peticiones benignas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponible en la informacion proporcionada.
- Modo thinking, visión o audio: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de referencia para medir cómo SVD-LLM afecta a la perplexity y a la precisión zero-shot al eliminar el 40 % de parámetros, comparándola con otras celdas de la misma rejilla.
- Estudio de alineación y seguridad bajo compresión: permite cuantificar la degradación de la tasa de rechazo y el aumento del ASR cuando se comprime un modelo alineado, usando AdvBench, StrongREJECT y WildGuard como instrumentos de medida.
- Evaluación de reglas de selección de componentes: al incorporar un conjunto de calibración mixto (utilidad + seguridad), permite comparar esta regla "pooled" frente a alternativas puramente de utilidad en términos de compromiso seguridad/utilidad.
- Análisis de sobre-rechazo: el valor de 0,5409 en sobre-rechazo macro lo convierte en un sujeto útil para estudiar cómo la compresión y la recuperación LoRA afectan a la calibración de rechazos en prompts benignos.
- Reproducibilidad de experimentos: con semilla 42, calibración documentada y receta LoRA explícita, permite replicar el pipeline SVD-LLM sobre Llama-2-7b-chat en entornos de investigación.
- Docencia y formación en interpretabilidad: como artefacto didáctico para explicar descomposición SVD, selección de componentes y recuperación con LoRA en modelos del tamaño de 7B.
- Baseline para técnicas de reparación de seguridad: sirve de punto de partida para probar métodos de recuperación posteriores a la compresión que reduzcan el sobre-rechazo sin disparar el ASR.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0019 |
| StrongREJECT ASR (juez HarmBench) | 0,0160 |
| Sobre-rechazo macro (WildGuard) | 0,5409 |
| Perplexity en WikiText-2 | 11,0875 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4900 |

No se han publicado en la informacion disponible resultados desglosados por tarea (MMLU, HumanEval, GSM8K u otras) ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos (6,738 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 16 y 20 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB para pesos; en 4 bits, en torno a 4-5 GB para pesos. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados por el autor.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para inferencia en precisión completa con contexto largo; RTX 4090 (24 GB) o RTX A6000 (48 GB) para bf16 con contexto moderado.
- Compatibilidad con GPU de consumo: sí en RTX 4090 (24 GB) en bf16 con contexto corto, y en RTX 3090/4080 (16-24 GB) con cuantización de 8 bits; en GPUs de 8-12 GB solo con cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), y previsiblemente llama.cpp/Ollama/vLLM tras conversión a GGUF o AWQ/GPTQ, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmwjsep96_r40 | 6,738 mil M (59,98 % del denso) | no disponible | Llama 2 Community | Checkpoint comprimido de investigación; PPL WikiText-2 11,0875; ASR AdvBench 0,0019; sobre-rechazo 0,5409 |
| meta-llama/Llama-2-7b-chat-hf | 6,738 mil M (denso) | 4.096 tokens | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad frente al que se mide la degradación |
| Otras celdas de la rejilla del mismo autor | ~6,7 mil M | no disponible | Llama 2 Community | Variantes con distintas reglas de selección y presupuestos; no se dispone de sus métricas en la informacion proporcionada |

No se dispone en la informacion proporcionada de comparaciones numéricas con modelos de la misma categoría (por ejemplo, otras variantes comprimidas de Llama-2-7b-chat o modelos de 7B alineados).

## Limitaciones y advertencias

- Artefacto de investigación, no un asistente desplegable: la model card lo describe explícitamente como una celda experimental de una rejilla, no como un modelo de chat de propósito general.
- Degradación de seguridad deliberada en varias celdas de la rejilla: la compresión por sí sola eleva la tasa de ataque exitoso, y el objetivo del estudio es cuantificarlo; esta celda concreta debe evaluarse antes de extraer conclusiones.
- Sobre-rechazo elevado: 0,5409 en la métrica macro de WildGuard indica una tendencia marcada a rechazar peticiones benignas, lo que limita su utilidad conversacional real.
- Sesgos: no documentados en la informacion proporcionada; al derivar de Llama-2-7b-chat, hereda los sesgos del modelo base y de los datos de alineación de Meta, pero no se han medido específicamente en este checkpoint.
- Riesgo de alucinación: no cuantificado en la model card; la compresión y la recuperación LoRA sobre alpaca-cleaned pueden alterar la calibración de la confianza respecto al modelo base.
- Limitaciones de contexto e idioma: no disponibles; el contexto heredado de Llama-2-7b-chat es de 4.096 tokens, insuficiente para tareas de contexto largo.
- Restricciones de licencia: Llama 2 Community License, con LICENSE.txt y USE_POLICY.md incluidos en el repositorio; el uso comercial está sujeto a los términos de Meta, incluidos los umbrales de usuarios activos mensuales y las restricciones de uso aceptable.
- Calibración de seguridad sesgada hacia la utilidad: la parte de seguridad representa solo el 6,06 % de las posiciones efectivas del conjunto de calibración, lo que puede infrarepresentar comportamientos de rechazo en dominios no cubiertos por WildJailbreak.
- Sin datos de benchmarks desglosados por tarea ni comparativas publicadas con alternativas, lo que dificulta situar el checkpoint frente a otras técnicas de compresión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmwjsep96_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio SVD-LLM de los autores: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Política de uso aceptable de Llama 2: https://ai.meta.com/llama/use-policy/
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- WildJailbreak: no disponible en la informacion proporcionada
- AdvBench / HarmBench: no disponible en la informacion proporcionada
- StrongREJECT: no disponible en la informacion proporcionada
- WildGuard: no disponible en la informacion proporcionada
