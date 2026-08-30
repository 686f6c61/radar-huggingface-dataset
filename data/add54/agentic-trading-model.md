# add54/agentic-trading-model

## Resumen

El modelo `add54/agentic-trading-model` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `TinyLlama/TinyLlama-1.1B-Chat-v1.0`, un transformer de 1.100 millones de parámetros orientado a chat. El adaptador fue creado mediante fine-tuning con Supervised Fine-Tuning (SFT) utilizando la librería TRL de Hugging Face. A pesar de su nombre, la model card no proporciona ninguna descripción de su propósito específico ni de los datos de entrenamiento utilizados, por lo que no se puede confirmar que esté especializado en trading agéntico.

El modelo se publica como un adaptador PEFT (Parameter-Efficient Fine-Tuning) en formato safetensors, con un tamaño de repositorio de 0.0 GB, lo que indica que solo contiene los pesos del adaptador y no el modelo completo. No se especifican la licencia, los idiomas soportados ni la longitud de contexto. Dado que se basa en TinyLlama, hereda su arquitectura y capacidades generales de generación de texto, pero no se dispone de información adicional sobre su rendimiento o aplicaciones concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador LoRA sobre TinyLlama-1.1B-Chat-v1.0) |
| Parametros totales | No disponible (el adaptador LoRA tiene pocos parámetros, pero no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (TinyLlama base soporta 2048 tokens, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only con 1.1B parámetros. El adaptador fue entrenado mediante SFT (Supervised Fine-Tuning) usando la librería TRL (Transformers Reinforcement Learning) en su versión 0.28.0, con PEFT 0.20.0 y Transformers 4.57.6. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. La model card solo incluye un ejemplo de generación de texto con una pregunta sobre viajes en el tiempo, lo que sugiere que el entrenamiento pudo haber sido genérico, pero no hay evidencia de especialización en trading.

## Capacidades

- Generación de texto: al estar basado en TinyLlama-Chat, puede generar respuestas conversacionales en formato chat.
- No se dispone de información sobre capacidades específicas como tool calling, razonamiento multi-paso, soporte de agentes, visión o audio.
- No se confirma soporte multilingüe; TinyLlama está entrenado principalmente en inglés, pero no se especifica para este adaptador.
- No se documenta ningún modo de pensamiento (thinking mode) ni capacidades especiales.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dado que es un adaptador LoRA sobre un modelo pequeño de chat, podría emplearse en escenarios genéricos de generación de texto, pero no hay información que respalde aplicaciones concretas. Se recomienda evaluar el modelo antes de utilizarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA, se puede cargar sobre el modelo base TinyLlama-1.1B-Chat-v1.0, que requiere aproximadamente 2-3 GB de VRAM en FP16 para inferencia.
- El adaptador añade una sobrecarga mínima de memoria (típicamente menos de 100 MB).
- Es compatible con GPUs de consumo como RTX 3060, RTX 4060, o incluso CPU con suficiente RAM.
- Opciones de despliegue: se puede usar con Transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama, o TGI.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El adaptador es específico y no se conocen alternativas equivalentes. Se podría comparar con TinyLlama-1.1B-Chat-v1.0 base, pero no hay datos de rendimiento del adaptador.

## Limitaciones y advertencias

- No se ha verificado la calidad del fine-tuning; al ser un adaptador pequeño, puede presentar alucinaciones o respuestas incoherentes.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial.
- No se dispone de información sobre sesgos o limitaciones de idioma.
- El nombre del modelo sugiere una especialización en trading, pero no hay evidencia en la documentación; no debe asumirse que es apto para decisiones financieras.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- [HuggingFace - add54/agentic-trading-model](https://huggingface.co/add54/agentic-trading-model)
- [TinyLlama-1.1B-Chat-v1.0 (modelo base)](https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0)
- [TRL (librería de entrenamiento)](https://github.com/huggingface/trl)
- [Guía de agentic AI trading (referencia general, no específica del modelo)](https://www.allabtai.com/agentic-ai-trading/)
- [AgenticTrading Lab (repositorio de experimentos con agentes de trading)](https://github.com/Open-Finance-Lab/AgenticTrading)
- [Agentic-Trader (sistema de trading autónomo)](https://github.com/marketcalls/Agentic-Trader)
