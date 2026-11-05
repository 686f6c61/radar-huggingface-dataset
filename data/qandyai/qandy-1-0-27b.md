# QandyAI/qandy-1.0-27B

## Resumen

Qandy 1.0 27B es un adaptador LoRA de razonamiento especializado en el análisis de señales de mercado para futuros perpetuos de criptomonedas, desarrollado por QANDY como parte de la familia Starburst. El modelo recibe una instantánea compacta de indicadores técnicos y de flujo de un símbolo (RSI multitemporal, Ichimoku, VWAP, funding, open interest, CVD, taker flow, ratios long/short, distancias de liquidación y niveles de soporte y resistencia) y emite una única decisión operativa: LONG, SHORT o NO TRADE, con apalancamiento, entrada, stop, objetivo y niveles clave. Su propuesta diferencial es que cada línea del razonamiento `<think>` cita únicamente señales presentes en la instantánea, lo que hace la traza auditable contra la entrada.

El modelo parte de Jackrong/Qwopus3.6-27B-v2, un modelo denso en bf16 derivado de Qwen/Qwen3.6-27B con arquitectura `Qwen3_5ForConditionalGeneration`, sobre el que se aplica un QLoRA SFT seguido de un merge y una segunda etapa KTO sobre el modelo fusionado. La innovación metodológica más relevante es el uso de etiquetas contrafactuales de "ganador perdido" (skips que habrían alcanzado al menos +1R se marcan como indeseables), orientadas a corregir el sesgo de sobrecautela observado en ejecuciones previas del modelo de 27B.

Es importante señalar que esta es una release de receta y evaluación: **los pesos del adaptador (`adapter_model.safetensors`) no están incluidos en el repositorio**. Lo que se publica son las configuraciones LoRA, el tokenizador, la plantilla de chat, los scripts de entrenamiento y servicio, y los resultados de evaluación. El modelo no puede cargarse desde este repositorio tal cual. El tamaño del repositorio es de 0.0 GB, lo que confirma la ausencia de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso; torre de visión congelada, uso solo texto) |
| Parametros totales | 27B (modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (entrenamiento con max length 2.048; servicio recomendado con `--max-model-len 4096`) |
| Tipos de cuantizacion | 4-bit (bitsandbytes) en entrenamiento y servicio; base en bf16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (adaptadores LoRA; no incluidos en esta release) |
| Modelo base | Jackrong/Qwopus3.6-27B-v2 (derivado de Qwen/Qwen3.6-27B) |
| Metodo | QLoRA SFT + merge, seguido de KTO LoRA sobre el modelo fusionado + merge |
| Configuracion LoRA | r 16, alpha 16, dropout 0, proyecciones de atención y MLP de lenguaje |
| Hardware de entrenamiento | 1x NVIDIA A40 48 GB |
| Libreria | peft |

## Arquitectura y entrenamiento

El modelo se construye sobre un transformer denso de 27B parámetros en bf16 con arquitectura `Qwen3_5ForConditionalGeneration`, que incluye una torre de visión que permanece congelada y no se utiliza: el entrenamiento y la inferencia son exclusivamente de texto. El pipeline de adaptación consta de dos etapas. La primera es un QLoRA SFT sobre la base en 4-bit con `adamw_8bit`: 896 decisiones de mesa en formato chat (system prompt, instantánea de mercado, razonamiento y decisión), 2 épocas, learning rate 2e-4, batch efectivo 8 (1 x 8 de acumulación), longitud máxima 2.048, schedule lineal con 5% de warmup y weight decay 0.01. Tras el merge, la segunda etapa aplica un KTO LoRA sobre el modelo SFT fusionado: 1.384 completaciones etiquetadas (896 deseables y 488 indeseables), 1 época, learning rate 1e-5, beta 0.1, peso de indeseables 1.53, batch efectivo 8 (2 x 4), usando como referencia el modelo SFT con el nuevo adaptador desactivado.

La innovación técnica central está en la composición de las etiquetas indeseables del KTO: 458 operaciones perdedoras reales más 30 "ganadores perdidos" contrafactuales, es decir, skips que habrían alcanzado al menos +1R y que se reetiquetan como indeseables para combatir el sesgo de sobrecautela. Los datos de entrenamiento provienen de los registros propios de la mesa de QANDY y no se publican. El formato de salida fuerza una traza `<think>` que recorre estructura, momentum, flujo y riesgo antes de una línea `Decision:` final, y el modelo está entrenado para citar solo señales presentes en la instantánea de entrada.

## Capacidades

- Razonamiento estructurado sobre señales de mercado: recorre paso a paso estructura, momentum, flujo y riesgo antes de decidir.
- Toma de decisión operativa única y formateada: LONG, SHORT o NO TRADE con apalancamiento, entrada, stop, objetivo y niveles clave.
- Citación verificable: el modelo está entrenado para referenciar únicamente los indicadores que aparecen en la instantánea, lo que permite auditar cada línea del razonamiento.
- Traza de razonamiento legible en bloque `<think>`, separada de la decisión final mediante el parser `qwen3` de vLLM.
- Manejo de instantáneas multimétricas: RSI en 5m/15m/1h/4h, Ichimoku 1h/4h, VWAP 1h/4h, funding con percentil, open interest con variación 24h, CVD spot y perp, taker flow y ratios long/short.
- Cálculo de plan de riesgo: stop, objetivo y niveles de soporte y resistencia coherentes con la entrada.
- Capacidad de abstención explícita (NO TRADE) con nivel de convicción declarado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni otras modalidades en la información disponible.
- Capacidades multilingües: no disponibles; el modelo está entrenado y evaluado solo en inglés.

## Casos de uso

- **Asistente de decisión para mesas de perpetuos**: el modelo recibe la instantánea estandarizada de un símbolo y devuelve una decisión con plan de riesgo completo; es adecuado porque su formato de salida es fijo y parseable, lo que permite integrarlo en un pipeline que separe `reasoning_content` (traza) de `content` (decisión) mediante el parser `qwen3` de vLLM.
- **Segunda opinión sobre operaciones discrecionales**: un trader introduce la instantánea de su setup y contrasta la decisión del modelo (incluido un NO TRADE) con la suya; la traza `<think>` permite revisar qué señales sustentan la llamada y detectar discrepancias de lectura.
- **Filtro de sobreoperación**: dado que el modelo está entrenado con etiquetas contrafactuales de ganadores perdidos, puede emplearse como capa de validación que reduzca skips excesivos en sistemas de señal automáticos, evaluando si una abstención previa habría alcanzado al menos +1R.
- **Generación de informes de razonamiento auditables**: en entornos de cumplimiento o revisión de estrategia, la traza citando solo señales de la instantánea sirve como registro documental de por qué se tomó cada decisión, verificable línea a línea contra la entrada.
- **Prototipado de estrategias con evaluación offline**: los scripts y configuraciones publicados permiten reproducir el pipeline QLoRA SFT + KTO sobre datos propios de otra mesa y comparar contra los resultados publicados en el holdout de 182 setups.
- **Backtesting de decisiones con formato uniforme**: al emitir siempre una línea `Decision:` con apalancamiento, entrada, stop y objetivo, las salidas pueden parsearse y agregarse automáticamente para calcular métricas de retención de ganadores y calidad de riesgo sobre históricos.
- **Servicio en hardware de gama consumer para prototipos**: con cuantización 4-bit y `--max-model-len 4096 --gpu-memory-utilization 0.95 --max-num-seqs 1` cabe en una GPU de 24 GB (RTX 3090 Ti) a 11-13 s por decisión, suficiente para evaluación interactiva o por lotes pequeños.

## Benchmarks y rendimiento

La model card describe una evaluación sobre un holdout real de 182 setups de mesa con resultados conocidos: 52 ganadores del líder, 31 perdedores del líder y 99 skips del líder. Cada decisión del modelo se compara con la operación del líder de mesa, midiendo retención de ganadores (proporción de ganadores del líder en los que el modelo tomó el mismo lado). Sin embargo, **los valores numéricos de esta evaluación no están incluidos en la información proporcionada**, más allá de la mención de que el modelo quedó por debajo de su hermano menor en algún aspecto.

| Benchmark | Resultado |
|---|---|
| Retención de ganadores (holdout de 182 setups) | no disponible (cifra no incluida en la información proporcionada) |
| MMLU, HumanEval, GSM8K u otros benchmarks estándar | no disponible |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- **VRAM estimada en 4-bit**: aproximadamente 14-16 GB para los pesos del modelo de 27B cuantizado, más overhead de contexto y caché KV; el autor confirma que cabe en 24 GB con `--max-model-len 4096`, `--gpu-memory-utilization 0.95` y `--max-num-seqs 1`.
- **VRAM estimada en bf16**: no disponible en la información proporcionada; por el tamaño del modelo (27B), requeriría del orden de 54 GB solo para pesos, lo que excede GPUs de 48 GB sin cuantización.
- **GPU recomendadas**: NVIDIA A40 48 GB (usada para entrenamiento); RTX 3090 Ti 24 GB (validada para servicio 4-bit).
- **¿Cabe en GPU consumer?**: sí, en 4-bit cabe en GPUs de 24 GB como la RTX 3090 Ti según la configuración documentada; no se documenta su funcionamiento en GPUs de 16 GB o menos.
- **Opciones de despliegue**: vLLM 0.22 con `--quantization bitsandbytes` y `--reasoning-parser qwen3`; no se documentan otras opciones (llama.cpp, Ollama, TGI) en la información disponible.
- **Latencia y throughput**: aproximadamente 11-13 s por decisión en una RTX 3090 Ti con la configuración indicada y una sola secuencia concurrente (`--max-num-seqs 1`).
- **Parámetros de generación**: temperatura 0 con repetition penalty 1.1; temperaturas superiores a 0.6 rompen el formato de decisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Pesos disponibles |
|---|---|---|---|---|---|
| Qandy 1.0 27B | 27B (denso) | no disponible | Trading de perpetuos cripto, decisión con plan de riesgo | Apache-2.0 | No (solo receta y evaluación) |
| Jackrong/Qwopus3.6-27B-v2 (base) | 27B (denso) | no disponible | Propósito general | no disponible | Sí (referenciado como base) |
| Qwen/Qwen3.6-27B (ancestro) | 27B (denso) | no disponible | Propósito general | no disponible | Sí |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparativa se limita a linaje, tamaño y disponibilidad de pesos; no se conocen alternativas especializadas en trading de perpetuos con las que contrastar parámetros, contexto o benchmarks.

## Limitaciones y advertencias

- **Pesos no incluidos**: el repositorio no contiene `adapter_model.safetensors`; el modelo no puede cargarse ni ejecutarse desde esta release sin reproducir el pipeline completo.
- **Datos de entrenamiento no publicados**: los registros de mesa de QANDY no se distribuyen, por lo que la reproducibilidad exacta del comportamiento está limitada a la metodología, no a los datos.
- **Idioma único**: entrenado y evaluado solo en inglés; no hay evidencia de comportamiento en castellano u otros idiomas.
- **Dominio estrecho**: diseñado exclusivamente para decisiones de entrada en perpetuos cripto a partir de instantáneas con un formato concreto; su uso fuera de ese esquema de entrada no está validado.
- **Riesgo financiero**: las salidas son decisiones operativas con apalancamiento, stop y objetivo; no constituyen asesoramiento financiero y su uso en producción conlleva riesgo de pérdida real.
- **Riesgo de alucinación**: aunque se entrena para citar solo señales presentes en la instantánea, no se documenta una garantía formal de que no introduzca referencias ausentes; la traza debe validarse contra la entrada.
- **Sensibilidad a parámetros de decodificación**: temperaturas superiores a 0.6 rompen el formato de decisión; el servicio requiere temperatura 0 y repetition penalty 1.1.
- **Rendimiento por debajo del hermano menor en algún aspecto**: el autor reconoce explícitamente que el modelo quedó corto frente a su hermano menor en parte de la evaluación, sin detallar las cifras en la información disponible.
- **Licencia**: Apache-2.0 heredada del modelo base, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento, no publicados.
- **Fecha de creación del repositorio**: la metadata indica 2026-11-05, posterior a la fecha actual de referencia; conviene tratar las fechas de entrenamiento (junio de 2026) y publicación con cautela.

## Enlaces

- [HuggingFace: QandyAI/qandy-1.0-27B](https://huggingface.co/QandyAI/qandy-1.0-27B)
- [Modelo base: Jackrong/Qwopus3.6-27B-v2](https://huggingface.co/Jackrong/Qwopus3.6-27B-v2)
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
