# Rin247/Qwen3-4B-Uncensored-Aquarion-INT8

## Resumen

El modelo `Rin247/Qwen3-4B-Uncensored-Aquarion-INT8` es una cuantización INT8 *weight-only* del modelo `Qwen3-4B` de Alibaba, publicada por el usuario Rin247. La particularidad principal es que el modelo base ha sido sometido a un proceso de **abliteración** (eliminación de la dirección de rechazo mediante proyección ortogonal) antes de la cuantización, dando lugar a una versión "sin censura" que no rechaza peticiones consideradas peligrosas o sensibles. Esta técnica, denominada *Aquarion Forge*, busca preservar las capacidades del modelo original mientras se elimina el comportamiento de negativa.

La relevancia de esta ficha radica en que ofrece un modelo de 4.000 millones de parámetros cuantizado a INT8, lo que reduce la huella de memoria y permite su ejecución en hardware modesto, a la vez que elimina las restricciones de contenido. Sin embargo, la información pública disponible es limitada: no se especifican la licencia, los idiomas soportados ni los benchmarks. El repositorio contiene los pesos en formato `safetensors` junto con un `config.json` que incluye la configuración de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-4B, detalles no disponibles) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (weight-only, RTN) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (el modelo base Qwen3-4B usa Apache 2.0, pero esta variante no lo especifica) |
| Formato de pesos | safetensors (con buffers de escala y forma para dequantizacion) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen3-4B`, un transformer denso de 4.000 millones de parámetros desarrollado por Alibaba. Sobre este modelo base se aplicaron dos transformaciones:

1. **Abliteración**: mediante proyección ortogonal se identifica y elimina la dirección del vector de rechazo en el espacio de activaciones. Esto se realiza antes de la cuantización, con el objetivo de que el modelo no se niegue a responder a peticiones que normalmente activarían mecanismos de seguridad.
2. **Cuantización INT8**: se aplica una cuantización *weight-only* con redondeo RTN (Round-To-Nearest) en CPU. Los pesos se almacenan en formato INT8 junto con escalas y formas en buffers separados (`*.weight_scale`, `*.weight_shape`). No se detalla el dataset de entrenamiento ni se mencionan procesos de RLHF o DPO adicionales.

La cuantización es *weight-only*, lo que significa que las activaciones se mantienen en precisión completa, reduciendo la memoria de los pesos pero sin acelerar necesariamente la inferencia en GPUs que no soporten operaciones INT8.

## Capacidades

Al ser una cuantización del modelo base `Qwen3-4B`, las capacidades funcionales son las heredadas de este, aunque no se detallan en la ficha. Se puede esperar:

- Generación de texto y razonamiento básico, típico de un modelo de 4B.
- Generación de código y soporte para tareas de programación.
- Capacidades multilingües del modelo original (aunque no confirmadas para esta variante).
- **Sin mecanismo de rechazo**: el proceso de abliteración elimina la negativa ante contenidos considerados peligrosos, ilegales o sensibles.
- No se especifica soporte para *tool calling*, *function calling*, visión o audio.

La cuantización INT8 puede provocar una ligera degradación en la calidad de las respuestas respecto al modelo en BF16, aunque no se aportan datos objetivos al respecto.

## Casos de uso

- **Generación creativa sin restricciones**: escritura de ficción, poesía o guiones que aborden temas tabú o controvertidos sin que el modelo interrumpa con avisos de seguridad.
- **Roleplay y narrativa interactiva**: juegos de rol por texto, personajes ficticios o escenarios donde el modelo debe mantenerse en el personaje sin insertar disclaimers morales.
- **Pruebas de sistemas de moderación**: como modelo *adversarial* para evaluar clasificadores de contenido o sistemas de filtrado, generando entradas que suelen activar rechazos en modelos estándar.
- **Fine-tuning posterior**: al estar abliterado, puede servir como base para ajuste fino en dominios donde se requiere ausencia de restricciones, como generación de diálogos para entrenamiento de otros modelos.
- **Despliegue en entornos con recursos limitados**: al ser INT8 y de 4B, cabe en GPUs consumer con 6-8 GB de VRAM, permitiendo inferencia local sin depender de servicios en la nube.
- **Investigación en alineación y seguridad**: estudio del comportamiento de modelos sin mecanismos de rechazo, análisis de sesgos o evaluación de técnicas de abliteración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos objetivos sobre MMLU, HumanEval, GSM8K u otras métricas para esta variante cuantizada y abliterada. El rendimiento real depende del modelo base `Qwen3-4B`, pero la cuantización INT8 y la modificación de pesos pueden alterar los resultados.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 4,4 GB para los pesos (según el tamaño del repositorio) más overhead de activaciones y contexto. Se estima un consumo total de 5-6 GB para inferencia con contexto moderado.
- **GPU recomendadas**: tarjetas consumer con 6 GB o más de VRAM, como RTX 2060 (6 GB), RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. En GPUs con 4 GB podría ser ajustado.
- **Inferencia en CPU**: posible si se convierte a GGUF o se usa un runtime que soporte INT8 weight-only, aunque no se proporciona ninguna conversión.
- **Opciones de despliegue**: el formato safetensors con buffers de escala requiere un motor que soporte esta cuantización personalizada. No se indica compatibilidad con vLLM, TGI, Ollama o llama.cpp de forma directa. Sería necesario dequantizar los pesos o adaptar un runtime.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Abliterado | Licencia | Contexto |
|---|---|---|---|---|---|
| Qwen3-4B (base) | 4,02B | BF16 | No | Apache 2.0 | no disponible |
| huihui-ai/Qwen3-4B-abliterated | 4,02B | BF16 | Sí | no disponible | no disponible |
| Rin247/Qwen3-4B-Uncensored-Aquarion-INT8 | 4,02B | INT8 | Sí | no disponible | no disponible |

La comparativa se limita a aspectos estructurales, ya que no hay datos de rendimiento. La variante de Rin247 añade la cuantización INT8, lo que reduce el tamaño en disco respecto a las versiones en BF16 (que suelen ocupar ~8 GB). La licencia no está especificada en ninguna de las variantes abliteradas, lo que supone un riesgo para uso comercial.

## Limitaciones y advertencias

- **Contenido inapropiado**: al eliminar el rechazo, el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtro. Esto implica un riesgo legal y ético importante en entornos de producción.
- **Alucinaciones**: como todo modelo de 4B, es propenso a inventar información, especialmente en dominios especializados.
- **Degradación por cuantización**: la conversión a INT8 puede reducir la precisión y fluidez de las respuestas respecto al modelo original en BF16, aunque no se han cuantificado los efectos.
- **Licencia incierta**: no se especifica la licencia de esta variante. El modelo base usa Apache 2.0, pero la abliteración y cuantización pueden implicar restricciones adicionales no documentadas.
- **Compatibilidad limitada**: el formato de pesos con buffers de escala y forma no es estándar, lo que dificulta su uso con herramientas comunes como vLLM u Ollama sin adaptaciones.
- **Sin garantías de calidad**: no hay benchmarks publicados, por lo que el rendimiento real es desconocido y puede variar significativamente según la tarea.

## Enlaces

- Repositorio HuggingFace: [Rin247/Qwen3-4B-Uncensored-Aquarion-INT8](https://huggingface.co/Rin247/Qwen3-4B-Uncensored-Aquarion-INT8)
- Modelo base: [Qwen/Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B)
- Variante abliterada sin cuantizar: [huihui-ai/Qwen3-4B-abliterated](https://huggingface.co/huihui-ai/Qwen3-4B-abliterated)
- Guía de modelos locales sin censura: [InsiderLLM - Best Uncensored Local LLMs](https://insiderllm.com/guides/best-uncensored-local-llms/)
