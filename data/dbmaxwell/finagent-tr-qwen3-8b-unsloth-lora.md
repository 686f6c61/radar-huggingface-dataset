# Dbmaxwell/finagent-tr-qwen3-8b-unsloth-lora

## Resumen

FinAgent-TR Qwen3-8B LoRA es un adaptador de fine-tuning (LoRA) desarrollado por Dbmaxwell sobre el modelo base Qwen3-8B, publicado en HuggingFace bajo licencia Apache 2.0. El adaptador está entrenado específicamente para el dominio financiero en turco, con el objetivo de resolver preguntas de alfabetización financiera, realizar selección de herramientas (tool selection), generar llamadas a herramientas (tool calls) y producir respuestas basadas en la salida de dichas herramientas. Se basa en el dataset `Dbmaxwell/finagent-tr`, compuesto por 5.000 episodios validados de agentes.

El modelo emplea QLoRA con cuantización de 4 bits sobre la versión de Unsloth de Qwen3-8B, con una longitud de contexto máxima de 8.192 tokens. Su relevancia radica en que ofrece un adaptador ligero (0,1 GB) que puede integrarse en sistemas de agentes conversacionales financieros en turco, permitiendo tool calling sin necesidad de ejecutar las herramientas internamente. La evaluación reportada muestra una reducción significativa de la perplexidad frente al modelo base, aunque el autor advierte que no constituye una medición de precisión end-to-end.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-8B (transformer decoder-only, denso) |
| Parametros totales | no disponible (adapter LoRA; el repo ocupa 0,1 GB) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 8.192 tokens (máxima durante entrenamiento e inferencia) |
| Tipos de cuantizacion | 4-bit (QLoRA, base `unsloth/qwen3-8b-unsloth-bnb-4bit`) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 (adaptador); la licencia de Qwen3-8B debe revisarse en su model card |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-8B, un modelo transformer decoder-only con atención completa y capacidad de razonamiento (thinking mode) nativa, aunque en este adaptador se desactiva explícitamente (`enable_thinking=False`). El método de entrenamiento es QLoRA de 4 bits, con rango LoRA de 8, alpha de 16 y dropout de 0,1, aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj`. El dataset `Dbmaxwell/finagent-tr` contiene 5.000 episodios validados, divididos en 4.000 de entrenamiento, 500 de validación y 500 de prueba. Se entrena durante una época con una tasa de aprendizaje de 3e-5 y una longitud máxima de secuencia de 8.192 tokens. El loss masking se aplica únicamente a las llamadas de herramienta y respuestas del asistente. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales.

## Capacidades

- Generación de texto en turco especializado en finanzas: respuestas a preguntas de alfabetización financiera, cálculos de interés compuesto, explicaciones de productos financieros.
- Tool calling: genera nombres de herramientas y argumentos en formato JSON válido, siguiendo el chat template de Qwen3 con el parámetro `tools`.
- Respuestas basadas en salidas de herramientas: el modelo puede incorporar el resultado de una herramienta como mensaje de tipo `tool` y generar una respuesta final fundamentada.
- Soporte de conversación multi-turno: integra el sistema de roles de chat (system, user, assistant, tool).
- No ejecuta herramientas: la ejecución y validación de tool calls queda delegada a un runtime externo de agente.
- Multilingüe limitado: el adaptador está entrenado exclusivamente en turco; aunque la base Qwen3-8B soporta múltiples idiomas, el fine-tuning está orientado al turco financiero.

## Casos de uso

- Asistente de educación financiera en turco: el modelo puede responder preguntas como "¿Cuánto dinero tendré tras dos años con un interés compuesto del 10% anual sobre 50.000 TL?", con explicaciones paso a paso.
- Chatbot de atención al cliente bancaria: integrado en un sistema de mensajería, gestiona consultas sobre productos financieros, tasas y condiciones, usando tool calling para recuperar datos actualizados.
- Agente de consulta de fondos de inversión (TEFAS): dado un nombre de fondo y una fecha, el modelo genera la llamada a la herramienta `tefas_price` con los argumentos correctos, y el runtime ejecuta la consulta y devuelve el precio.
- Generación de tool calls en pipelines de agentes: el adaptador puede usarse como módulo de selección de herramientas en arquitecturas ReAct o similares, reduciendo la carga de parsing manual.
- Sistema de preguntas frecuentes financieras: desplegado en un sitio web o aplicación móvil, responde preguntas comunes sobre ahorro, inversión y planificación financiera en turco.
- Evaluación de comprensión financiera: sirve como generador de preguntas o como tutor interactivo para estudiantes de finanzas, con capacidad de mantener conversaciones multi-turno y aclarar dudas.

## Benchmarks y rendimiento

La evaluación reportada en la model card se centra en loss y perplexity sobre 100 episodios de prueba y 5.836 tokens supervisados del asistente, comparando el modelo base con el adaptador fine-tuned (con el LoRA desactivado temporalmente para la baseline):

| Modelo | Test loss | Perplexity |
|---|---:|---:|
| Qwen3-8B base | 3,1655 | 23,70 |
| FinAgent-TR fine-tuned LoRA | 1,5700 | 4,81 |

El adaptador logra una reducción del 50,4 % en test loss y del 79,7 % en perplexity. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K. El autor indica que estos resultados corresponden a predicción de siguiente token con teacher forcing y no implican precisión end-to-end de un agente. Se menciona una evaluación de comportamiento planificada (tool-name exact match, validez JSON de argumentos, tasa de tool calls innecesarias, etc.) pero no se ofrecen resultados.

## Requisitos de hardware

- El adaptador LoRA es pequeño (0,1 GB), pero requiere cargar el modelo base Qwen3-8B cuantizado a 4 bits para inferencia.
- VRAM estimada: para Qwen3-8B en 4-bit con contexto de 8.192 tokens, se necesitan aproximadamente 6-8 GB de VRAM para inferencia en modo batch pequeño.
- GPUs recomendadas: RTX 3090, RTX 4090, A10, A100 o similares con al menos 8 GB de VRAM. En tarjetas con 6 GB podría funcionar con contexto reducido.
- Opciones de despliegue: Unsloth (recomendado por el autor), Transformers con PEFT, y posiblemente vLLM si se fusiona el adaptador con el modelo base. Para despliegue en CPU, se puede convertir a GGUF fusionando el adaptador y cuantizando, aunque no se documenta explícitamente.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. La única comparación disponible es contra el modelo base Qwen3-8B sin fine-tuning, que muestra una mejora sustancial en loss y perplexity en el dominio financiero turco. No se conocen otros adaptadores LoRA específicos para finanzas en turco con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El dataset de entrenamiento es mayoritariamente sintético y generado a partir de episodios de agente validados, lo que puede limitar la generalización a preguntas reales fuera de distribución.
- El modelo no se conecta a internet ni a herramientas financieras reales; solo genera llamadas a herramientas, cuya ejecución requiere un runtime externo.
- Las respuestas generadas sin acceso a fuentes de datos actualizadas pueden quedar obsoletas en temas de precios, legislación o condiciones de mercado.
- Los resultados generados no constituyen asesoramiento de inversión.
- La evaluación reportada (loss y perplexity) no es suficiente para afirmar calidad de producción; la evaluación de comportamiento planificada aún no está completa.
- El adaptador está entrenado únicamente en turco; su uso en otros idiomas degradaría el rendimiento.
- La licencia del adaptador es Apache 2.0, pero el modelo base Qwen3-8B tiene su propia licencia que debe verificarse antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: [Dbmaxwell/finagent-tr-qwen3-8b-unsloth-lora](https://huggingface.co/Dbmaxwell/finagent-tr-qwen3-8b-unsloth-lora)
- Dataset de entrenamiento: [Dbmaxwell/finagent-tr](https://huggingface.co/datasets/Dbmaxwell/finagent-tr)
- Modelo base en Unsloth: [unsloth/qwen3-8b-unsloth-bnb-4bit](https://huggingface.co/unsloth/qwen3-8b-unsloth-bnb-4bit) (referenciado en la model card)
- Model card de Qwen3-8B (para licencia): [Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- Documentación de Unsloth para Qwen3: [Unsloth Qwen3.8 Fine-tuning Guide](https://unsloth.ai/docs/models/qwen3.8/train)
