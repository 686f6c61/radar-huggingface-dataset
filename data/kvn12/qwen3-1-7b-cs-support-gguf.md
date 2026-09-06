# kvn12/qwen3-1.7b-cs-support-gguf

## Resumen

Qwen3-1.7B Customer Support es un modelo de lenguaje especializado en atención al cliente, desarrollado por el usuario kvn12 a partir del modelo base Qwen/Qwen3-1.7B mediante un ajuste fino con LoRA, posterior fusión de pesos y cuantización a Q4_K_M en formato GGUF. El objetivo es ofrecer un asistente de soporte técnico y comercial capaz de resolver consultas de clientes en entornos de comercio electrónico, con un tamaño reducido de aproximadamente 1,1 GB que permite su ejecución en CPU y en Metal (Apple Silicon) sin necesidad de GPU dedicada.

El modelo se presenta como un artefacto de evaluación y despliegue: incluye un Modelfile para Ollama y es compatible con llama.cpp. Utiliza el formato de chat de Qwen3 con el modo de pensamiento deshabilitado (etiquetas `thinking` vacías) y un system prompt fijo, de modo que el entrenamiento y el despliegue siguen el mismo contrato. Su relevancia radica en que, pese a su pequeño tamaño, consigue mejorar notablemente las métricas de corrección, calidad de resolución y reducción de alucinaciones frente al modelo base en un conjunto de pruebas de 1.100 casos, según las mediciones del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamaño del repo | 1,1 GB |
| Modelo base | Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo Qwen/Qwen3-1.7B mediante adaptadores LoRA. Tras el entrenamiento, los pesos del adaptador se fusionan en el modelo base en precisión fp16 y el resultado se convierte a formato GGUF mediante `convert_hf_to_gguf.py` y se cuantiza a Q4_K_M con `llama-quantize`. El conjunto de datos de entrenamiento no se detalla: no se indican el número de tokens, la composición del dataset ni técnicas de alineación como RLHF o DPO. El autor señala que el modelo reproduce el estilo de marcadores `{{placeholder}}` del dataset, lo que sugiere un artefacto de entrenamiento.

La innovación técnica destacable es el uso de un "prompt contract" fijo: el formato de chat de Qwen3 con el modo de pensamiento deshabilitado, decodificación greedy (`temperature=0`, `seed=42`, `num_predict=512`) y un system prompt de asistente de soporte. Este contrato garantiza que el modelo base y el ajustado se evalúen y sirvan en condiciones idénticas, lo que permite comparaciones consistentes.

## Capacidades

- Generación de respuestas en el dominio de atención al cliente: gestiona consultas sobre pedidos, reembolsos, devoluciones, cargos duplicados y otros problemas de comercio electrónico, con un tono profesional y empático según el system prompt fijo.
- Resolución de conversaciones multi-turno: el formato de chat de Qwen3 y el system prompt permiten mantener respuestas coherentes y centradas en el problema del cliente, aunque el límite de contexto no se especifica.
- Reducción de alucinaciones: según las métricas del autor, la tasa de alucinación baja del 39,7 % en el modelo base al 11,7 % en el modelo ajustado, lo que lo hace más fiable para responder con información precisa.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento: el modelo base de Qwen3 incluye un modo de pensamiento, pero en este fine-tune se usa deshabilitado (etiquetas `thinking` vacías) según el prompt contract.

## Casos de uso

- Atención al cliente automatizada en comercio electrónico: el modelo puede responder directamente a consultas de clientes sobre el estado de sus pedidos, cargos duplicados o problemas con entregas, gracias al system prompt fijo y al tono empático entrenado.
- Gestión de reembolsos y devoluciones: está preparado para explicar los pasos de reembolso de artículos dañados, como se muestra en el ejemplo del README: "how do I get a refund for a damaged item?".
- Resolución de quejas sobre cargos o facturación: la métrica de calidad de resolución indica que el modelo es capaz de resolver consultas de facturación, aunque el autor advierte de un mayor riesgo de alucinación en preguntas sobre tarifas de cancelación.
- Despliegue de soporte local en CPU o Metal: gracias a la cuantización Q4_K_M y su tamaño de ~1 GB, el modelo puede ejecutarse en Ollama o llama.cpp en máquinas sin GPU, ideal para entornos de soporte con requisitos de privacidad o despliegue en el borde.
- Integración en APIs de chat mediante Ollama: el README incluye un ejemplo de uso de la API HTTP de Ollama con `think:false` y `temperature=0`, lo que permite integrarlo en plataformas de soporte existentes.
- Evaluación de la mejora de un fine-tune frente al modelo base: el propio modelo se publica como artefacto de evaluación con resultados comparativos (base vs tuned), por lo que puede usarse para medir la mejora en métricas de corrección y alucinación en proyectos de investigación aplicada.
- Soporte postventa en empresas online: puede servir como asistente de primera línea para responder dudas sobre políticas de reembolso o envíos, reduciendo la carga de agentes humanos.

## Benchmarks y rendimiento

| Metrica | Modelo base | Modelo ajustado |
|---|---|---|
| Corrección (1–5) | 3.63 | 4.57 |
| Calidad de resolución (1–5) | 3.26 | 4.16 |
| Tasa de alucinación | 39.7 % | 11.7 % |

Métricas obtenidas en un conjunto de test held-out de 1.100 elementos, usando Ollama y un juez LLM (Opus-5). No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 1,1 GB; el archivo GGUF Q4_K_M está diseñado para self-hosting en CPU y Metal (Apple Silicon) sin coste de GPU, según el autor.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; el autor no especifica modelos de GPU.
- Cabe en GPU de consumo: no se especifica en la documentación.
- Opciones de despliegue: Ollama (recomendado, con Modelfile incluido), llama.cpp (compatible con GGUF). También se puede servir mediante la API HTTP de Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kvn12/qwen3-1.7b-cs-support-gguf | 1.720.574.976 | No disponible | Apache 2.0 | GGUF (Q4_K_M), Ollama/llama.cpp |
| Qwen/Qwen3-1.7B | 1.7B (aprox.) | No disponible | Apache 2.0 | Safetensors, GGUF (cuantizaciones) |
| geoffmunn/Qwen3-1.7B | 1.7B (aprox.) | No disponible | Apache 2.0 | GGUF (cuantizaciones) |

En el benchmark de soporte al cliente del autor, el modelo ajustado supera al modelo base en corrección, calidad de resolución y tasa de alucinación. No se dispone de resultados comparables para geoffmunn/Qwen3-1.7B.

## Limitaciones y advertencias

- El modelo reproduce el estilo de marcadores `{{placeholder}}` del conjunto de datos de entrenamiento, lo que puede producir respuestas con ese formato no deseado.
- Tasa residual de alucinación de aproximadamente el 11,7 %, especialmente en consultas sobre tarifas de cancelación, que el autor identifica como el peor caso.
- Las métricas publicadas se basan en un juez LLM (Opus-5), no en evaluación humana, por lo que pueden no reflejar la calidad percibida por usuarios reales.
- No se proporciona información sobre la composición del dataset de entrenamiento, sesgos específicos ni límite de contexto, lo que limita la evaluación de riesgos.
- El uso comercial es permitido por la licencia Apache 2.0, pero el modelo fine-tune podría estar sujeto a las condiciones del modelo base y del dataset de entrenamiento, que no se detallan.
- No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K), por lo que su rendimiento fuera del dominio de soporte al cliente no está evaluado.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/kvn12/qwen3-1.7b-cs-support-gguf
- Adaptador LoRA de entrenamiento: https://huggingface.co/kvn12/qwen3-1.7b-cs-support-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Cuantización alternativa del modelo base: https://huggingface.co/geoffmunn/Qwen3-1.7B
