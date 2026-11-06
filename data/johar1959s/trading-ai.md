# johar1959s/trading-ai

## Resumen

`johar1959s/trading-ai` es un ajuste fino (fine-tuning) del modelo Qwen3-1.7B, publicado por el usuario johar1959s en Hugging Face. El modelo base declarado es `unsloth/Qwen3-1.7B-unsloth-bnb-4bit`, una versión cuantizada en 4 bits del Qwen3-1.7B original, y el entrenamiento se ha realizado con la librería Unsloth, que el autor indica que permite entrenar "2x más rápido". El repositorio ocupa 0,1 GB y contiene pesos en formato safetensors, con licencia Apache 2.0.

El nombre "trading-ai" sugiere que el ajuste fino está orientado a tareas de análisis financiero o trading, aunque la model card no aporta ningún detalle sobre el conjunto de datos de entrenamiento, el objetivo concreto ni los hiperparámetros utilizados. La información pública disponible es mínima: no hay descripción del dataset, no hay métricas de evaluación y no hay ejemplos de uso. Se trata, por tanto, de un modelo experimental de nicho, con 0 descargas y 0 likes en el momento de la consulta.

Por su tamaño (1.700 millones de parámetros) y su contexto heredado de la familia Qwen3, es un modelo que puede ejecutarse en hardware de consumo, pero su utilidad práctica para producción no está validada por ningún benchmark publicado. Es relevante únicamente como ejemplo de fine-tuning ligero con Unsloth sobre Qwen3, no como una herramienta consolidada para trading real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B) |
| Parametros totales | 1.700 millones (1,7B), segun el modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-1.7B soporta hasta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | El modelo base esta en bnb-4bit; los pesos publicados estan en safetensors sin cuantizacion declarada |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only con atención causal estándar, sin mezcla de expertos (no es MoE). El modelo publicado es el resultado de un fine-tuning supervisado (SFT) sobre la versión `unsloth/Qwen3-1.7B-unsloth-bnb-4bit`, que es una conversión a 4 bits del Qwen3-1.7B para entrenamiento eficiente con Unsloth. La librería declarada es `transformers` y las etiquetas incluyen `trl` y `unsloth`, lo que indica que el ajuste se hizo con el stack de Unsloth sobre TRL.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO, ni sobre innovaciones técnicas específicas más allá del uso de Unsloth para acelerar el entrenamiento. La model card no incluye ningún detalle adicional sobre el proceso. No se puede confirmar si el fine-tuning preserva las capacidades originales de Qwen3 (razonamiento, código, tool calling) o si las ha degradado por sobreajuste a un dominio concreto.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen3-1.7B.
- Posible especialización en terminología financiera o de trading, sugerida por el nombre del repositorio, aunque no verificada.
- No se confirma soporte de tool calling ni function calling en esta versión ajustada.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta `language: en`.
- No se declara modo "thinking", visión, audio ni otras capacidades especiales.
- No hay ejemplos de uso ni demos publicadas.

## Casos de uso

- **Prototipado de asistentes financieros**: el modelo puede emplearse para generar respuestas sobre conceptos de trading en inglés, pero sin validación de exactitud; adecuado solo para pruebas internas.
- **Experimentación con fine-tuning ligero**: sirve como ejemplo reproducible de ajuste de Qwen3-1.7B con Unsloth en una GPU de consumo, útil para equipos que quieran replicar el pipeline.
- **Generación de texto descriptivo sobre mercados**: puede redactar párrafos explicativos o resúmenes de conceptos financieros, siempre con revisión humana dada la ausencia de benchmarks.
- **Base para nuevos ajustes**: al estar en safetensors y licencia Apache 2.0, puede reutilizarse como punto de partida para fine-tunings posteriores en dominios financieros.
- **Evaluación comparativa de técnicas de cuantización**: útil para medir el impacto de bnb-4bit en la calidad de generación frente al Qwen3-1.7B original.
- **Demostraciones educativas**: para ilustrar cómo un modelo pequeño puede adaptarse a un dominio vertical con recursos limitados, sin pretensión de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache (en torno a 4-5 GB en total).
- VRAM estimada en 4 bits: aproximadamente 1 GB para pesos, más overhead (2-3 GB en total).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 6 GB de VRAM en cuantización 4 bits.
- Opciones de despliegue: transformers, vLLM, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| johar1959s/trading-ai | 1,7B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning de nicho sin benchmarks |
| Qwen3-1.7B (original) | 1,7B | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base con benchmarks publicados |
| unsloth/Qwen3-1.7B-unsloth-bnb-4bit | 1,7B | 32.768 tokens | Apache 2.0 | Hugging Face | Version cuantizada para entrenamiento |
| Llama 3.2 1B | 1,2B | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Alternativa pequena con contexto mayor |

## Limitaciones y advertencias

- No hay benchmarks ni evaluación de calidad publicados; el rendimiento real es desconocido.
- El nombre "trading-ai" sugiere un dominio financiero, pero no se documenta el dataset ni el objetivo; riesgo alto de respuestas incorrectas o alucinadas en ese dominio.
- No debe usarse para decisiones de inversión o trading real sin validación exhaustiva y supervisión humana.
- Idiomas: solo inglés declarado; no se garantiza un buen rendimiento en castellano.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El modelo base está cuantizado en 4 bits, lo que puede degradar la calidad frente al Qwen3-1.7B original.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.
- Posible sobreajuste al dataset de fine-tuning, con pérdida de capacidades generales del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/johar1959s/trading-ai
- Modelo base: https://huggingface.co/unsloth/Qwen3-1.7B-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Artículo de referencia sobre IA en trading (Built In): https://builtin.com/artificial-intelligence/ai-trading-stock-market-tech
- Artículo de referencia sobre IA en trading algorítmico (DigitalDefynd): https://digitaldefynd.com/IQ/ai-in-algorithmic-trading/
