# fernandodlts/qwen2.5-3b-delivery-absa-lora

## Resumen

El modelo `fernandodlts/qwen2.5-3b-delivery-absa-lora` es un adaptador LoRA (entrenado con QLoRA de 4 bits y la librería Unsloth) sobre `unsloth/Qwen2.5-3B-Instruct-bnb-4bit`, que a su vez deriva de Qwen2.5-3B-Instruct de Alibaba. Lo desarrolla el usuario fernandodlts y está especializado en análisis de sentimiento por aspectos (ABSA) y clasificación de riesgo de churn sobre reseñas informales de reparto de comida en portugués brasileño, con salida en JSON estricto.

El modelo resuelve un problema operativo concreto: convertir texto libre, con jerga, abreviaturas y faltas de ortografía, en un objeto estructurado con seis campos (calidad de la comida, experiencia de entrega, embalaje, relación calidad-precio, riesgo de churn y resumen de la causa raíz). Es relevante para equipos de producto y operaciones que necesitan señales accionables a partir de reseñas de plataformas tipo iFood sin construir un pipeline propio de NLP.

Se distribuye como adaptador PEFT de aproximadamente 0,1 GB, con licencia Apache 2.0, y requiere cargar el modelo base Qwen2.5-3B-Instruct (3.000 millones de parámetros) para la inferencia. El contexto heredado del modelo base es de 32.768 tokens, aunque la model card no lo declara explícitamente para el adaptador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) sobre Qwen2.5-3B-Instruct |
| Parametros totales | 3.000 millones (modelo base); el adaptador LoRA es una fracción de ese total (repo de 0,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | Base entrenado sobre versión bnb-4bit; el adaptador se puede combinar con el base en fp16, bf16 o cuantizado (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Portugués brasileño (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only con atención causal estándar y RoPE. El entrenamiento se realizó con QLoRA de 4 bits y Unsloth, con rango LoRA `r=16`, `lora_alpha=16`, `lora_dropout=0` y módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, todas las proyecciones de atención y del MLP. El optimizador fue `adamw_8bit` con learning rate `2e-4` y scheduler lineal, batch efectivo de 8 (batch 2 con acumulación de 4) y 3 épocas sobre 240 ejemplos de entrenamiento, lo que supone 90 pasos.

El dataset es `fernandodlts/brazilian-delivery-absa-dataset`, con reseñas informales en portugués brasileño y etiquetas estructuradas en seis dimensiones operativas. No se documenta en la model card el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; el ajuste es supervisado sobre pares entrada-salida en formato JSON. La innovación principal es el formateo estricto de salida (JSON válido sin preámbulos) y la taxonomía operativa fija, que convierte una tarea de generación libre en una extracción estructurada evaluable por campo.

## Capacidades

- Generación de texto conversacional en portugués brasileño, heredada de Qwen2.5-3B-Instruct.
- Análisis de sentimiento por aspectos (ABSA) sobre cuatro dimensiones: comida, entrega, embalaje y relación calidad-precio, con etiquetas `positivo`, `negativo`, `neutro` y `nao_mencionado`.
- Clasificación binaria de riesgo de churn (`risco_churn`: `true`/`false`).
- Extracción de resumen de causa raíz (`resumo_critica`) en una frase corta o `null`.
- Salida en JSON estricto sin texto adicional, lo que facilita el parseo automático.
- Robustez ante jerga, abreviaturas y errores tipográficos propios del portugués brasileño informal.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión ni audio en el adaptador; estas capacidades dependerían del modelo base y no están validadas para esta especialización.

## Casos de uso

- Triaje automático de reseñas en plataformas de reparto: el modelo procesa cada reseña entrante y devuelve un JSON con las cuatro dimensiones de sentimiento, lo que permite enrutar automáticamente quejas de entrega al equipo logístico y quejas de comida al equipo de restaurantes.
- Detección temprana de churn: la señal `risco_churn` permite marcar clientes en riesgo para campañas de retención (cupones, disculpas personalizadas) antes de que abandonen la plataforma, a partir de reseñas que mencionan retrasos o errores recurrentes.
- Monitorización de calidad por restaurante: agregando las etiquetas `comida` y `embalagem` por restaurante se obtiene un cuadro de mando de calidad operativa que identifica socios con problemas recurrentes de empaquetado o sabor.
- Análisis de causa raíz a escala: el campo `resumo_critica` resume el problema principal de cada queja, lo que permite agrupar incidencias por categoría (retraso, pedido incompleto, comida fría) sin revisión manual.
- Extracción estructurada para BI: el JSON estricto se puede volcar directamente a una tabla o almacén de datos para dashboards de NPS y satisfacción por dimensión, sustituyendo pipelines de etiquetado manual.
- Prototipado rápido en un equipo pequeño: al ser un adaptador de 0,1 GB sobre un modelo de 3B, se puede desplegar en una única GPU consumer para validar la taxonomía operativa antes de invertir en un modelo mayor o en anotación a gran escala.
- Investigación en ABSA multilingüe: sirve como referencia de fine-tuning QLoRA con Unsloth para portugués informal, reproducible con hiperparámetros documentados.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 60 muestras no vistas del split de test de `fernandodlts/brazilian-delivery-absa-dataset`:

| Dimensión operativa | Accuracy | Aciertos |
|---|---|---|
| Adherencia estricta a JSON | 100,00 % | 60 / 60 |
| Entrega (`entrega`) | 100,00 % | 60 / 60 |
| Riesgo de churn (`risco_churn`) | 98,33 % | 59 / 60 |
| Embalaje (`embalagem`) | 90,00 % | 54 / 60 |
| Calidad de la comida (`comida`) | 85,00 % | 51 / 60 |
| Relación calidad-precio (`custo_beneficio`) | 81,67 % | 49 / 60 |
| Media operativa | 91,00 % | — |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16 el modelo base de 3B requiere aproximadamente 6-7 GB; en 4 bits (bnb o GGUF Q4) baja a unos 2-3 GB, más el overhead del adaptador.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o A100/H100 para despliegues con concurrencia. Cabe en GPUs consumer de 8 GB o más usando cuantización de 4 bits.
- Despliegue: transformers + PEFT (recomendado por el autor), vLLM con soporte LoRA, TGI, llama.cpp u Ollama tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. La generación está limitada a `max_new_tokens=256` en el ejemplo del autor, lo que sugiere salidas cortas y latencia moderada en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fernandodlts/qwen2.5-3b-delivery-absa-lora` | 3B (base) + LoRA | No disponible (base: 32.768) | ABSA y churn en pt-BR informal | Apache 2.0 | Hugging Face (adaptador) |
| Qwen2.5-3B-Instruct | 3B | 32.768 | Instrucción general multilingüe | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7B | 32.768 | Instrucción general multilingüe | Apache 2.0 | Hugging Face |
| Llama 3.2 3B Instruct | 3B | 128.000 | Instrucción general multilingüe | Llama 3.2 Community License | Hugging Face |

No se dispone de benchmarks comparativos entre este adaptador y las alternativas en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente sobre 240 ejemplos de un único dataset de reparto de comida en portugués brasileño; la generalización a otros dominios o variantes del portugués no está validada.
- La evaluación se realizó sobre solo 60 muestras de test, por lo que las métricas tienen alta varianza y no deben tomarse como estimaciones robustas de producción.
- Las dimensiones con peor rendimiento son `custo_beneficio` (81,67 %) y `comida` (85,00 %), lo que implica un porcentaje no trivial de etiquetas erróneas en esas categorías.
- Riesgo de alucinación en el campo `resumo_critica`: al ser texto libre, puede generar resúmenes plausibles no sustentados en la reseña, especialmente en casos ambiguos.
- La salida JSON estricta depende del system prompt documentado; cambios en el prompt pueden degradar la adherencia al formato.
- Solo soporta portugués brasileño; no se ha validado para portugués europeo, español ni otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-3B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- El adaptador no incluye los pesos del modelo base; es necesario descargar `Qwen/Qwen2.5-3B-Instruct` por separado.
- No se documentan sesgos específicos, pero al entrenarse sobre reseñas de una plataforma concreta puede heredar sesgos de ese corpus (por ejemplo, hacia quejas de reparto).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fernandodlts/qwen2.5-3b-delivery-absa-lora
- Dataset: https://huggingface.co/datasets/fernandodlts/brazilian-delivery-absa-dataset
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
