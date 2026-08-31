# ApolloRaines/Deidentified-7B

## Resumen

Deidentified-7B es un modelo de lenguaje de 7.600 millones de parámetros desarrollado por ApolloRaines, basado en la arquitectura Qwen2. El modelo ha sido sometido a un proceso de post-entrenamiento denominado "deidentificación" que elimina la identidad original del modelo, sus guardrails de rechazo y su tendencia a aceptar afirmaciones incorrectas. El resultado es un "lienzo en blanco" (blank slate) que conserva todas las capacidades cognitivas —matemáticas, código, razonamiento, conocimiento y comprensión del lenguaje— pero sin una personalidad o autoconcepto predefinidos.

La relevancia de este modelo radica en su propósito específico: servir como base para implantar una identidad personalizada mediante fine-tuning con LoRA. Según el autor, cuando se entrena una identidad nueva sobre un modelo estándar, la identidad original (entrenada con miles de millones de tokens) compite con la nueva, provocando que la antigua emerja de forma impredecible. Deidentified-7B elimina ese conflicto al borrar por completo la identidad previa. El modelo se distribuye bajo licencia Apache 2.0, soporta únicamente inglés y está disponible en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen2, variante 7B) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificado (pesos en fp16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen2, con 7.600 millones de parámetros. No se proporcionan detalles sobre el entrenamiento original (composicion del dataset, numero de tokens, tecnicas de alineacion como RLHF o DPO). La informacion disponible se centra en el proceso de post-entrenamiento aplicado por el autor, que consta de dos fases:

1. **Jbliteration**: eliminacion de los comportamientos de rechazo (refusal behaviors) del modelo.
2. **Desycophancy**: eliminacion de la tendencia a capitular ante afirmaciones incorrectas (sycophantic capitulation).

Ambas fases se ejecutan en aproximadamente 90 segundos en 2x RTX PRO 6000. El resultado es un modelo que, segun el autor, ha sido probado con un test de 200 preguntas de identidad en 6 categorias (directa, indirecta, multilingue, roleplay, tecnica y adversarial) con cero divulgaciones de identidad. No se especifican los datos de entrenamiento originales ni si se utilizaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto: el modelo conserva todas las capacidades de generacion de lenguaje del modelo base Qwen2, incluyendo matematicas, codigo, razonamiento y conocimiento general.
- Razonamiento y comprension del lenguaje: segun la model card, estas capacidades permanecen intactas tras el proceso de deidentificacion.
- Lienzo en blanco para identidad: el modelo no tiene autoconcepto, personalidad ni guardrails de rechazo, lo que permite implantar una identidad personalizada mediante LoRA sin conflictos.
- Soporte de tool calling: no se menciona en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no se menciona explicitamente, aunque el razonamiento general esta presente.
- Capacidades multilingues: no, el modelo solo soporta ingles.
- Capacidades especiales: el modelo puede ejecutarse con DeepswapLLM, una herramienta que permite cargar el modelo en GPUs con poca VRAM transmitiendo capas entre GPU, RAM y disco, hasta 4 veces mas rapido que AirLLM.

## Casos de uso

- **Creacion de asistentes virtuales con identidad de marca**: una empresa puede implantar una identidad corporativa especifica (nombre, tono, valores) mediante LoRA sobre Deidentified-7B, obteniendo un asistente que se presenta consistentemente como la marca sin que emerjan identidades previas.
- **Chatbots de personajes para videojuegos o entretenimiento**: desarrolladores de juegos pueden crear personajes no jugables (NPC) con personalidades unicas, usando el modelo como base y anadiendo una identidad de rol mediante el pipeline de implantacion.
- **Investigacion en alineacion y eliminacion de sesgos**: el modelo sirve como banco de pruebas para estudiar como se comporta un LLM sin guardrails de seguridad ni identidad, permitiendo analizar el impacto de estos componentes en el comportamiento.
- **Fine-tuning en dominios especificos**: al ser un lienzo en blanco, el modelo es adecuado para fine-tuning con LoRA en tareas concretas (por ejemplo, generacion de codigo, analisis de datos) sin interferencias de la identidad original.
- **Pruebas de robustez de identidad**: investigadores pueden evaluar la solidez de la implantacion de identidad probando el modelo con preguntas adversariales, multilingues o de comparacion con otros modelos.
- **Generacion de texto general**: aunque no es su proposito principal, el modelo puede usarse para tareas de generacion de texto estandar, siempre que no se requiera una identidad especifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. El autor no proporciona comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 14 GB en fp16, segun la model card.
- **GPU recomendadas**: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100, RTX PRO 6000) para ejecucion en fp16 sin cuantizacion.
- **GPU consumer**: cabe en GPUs de gama alta como RTX 4090 (24 GB) o RTX 4080 (16 GB), pero no en GPUs de 8 GB o 12 GB sin cuantizacion.
- **Opciones de despliegue**: se puede usar con transformers (PyTorch) directamente. Ademas, el autor proporciona DeepswapLLM, que permite ejecutar el modelo en GPUs con menos VRAM transmitiendo capas entre GPU, RAM y disco, sin cuantizacion. Tambien es compatible con vLLM, TGI u otros servidores de inferencia, aunque no se mencionan explicitamente.
- **Latencia y throughput**: no se proporcionan datos especificos. El autor afirma que DeepswapLLM es hasta 4 veces mas rapido que AirLLM, pero no se dan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para Deidentified-7B, por lo que no es posible realizar una comparativa cuantitativa con otros modelos. A nivel arquitectonico, es comparable a otros modelos de 7B como Qwen2.5-7B-Instruct (su probable base), Llama-3-8B o Mistral-7B, pero su proposito es diferente: esta disenado especificamente para servir como base de identidad personalizada, no como un asistente generico. La licencia Apache 2.0 permite uso comercial sin restricciones, a diferencia de Llama-3 (licencia de uso aceptable) o Mistral (Apache 2.0 tambien). No se han encontrado modelos directamente comparables con la misma funcionalidad de deidentificacion.

## Limitaciones y advertencias

- **Ausencia de guardrails de seguridad**: al eliminar los comportamientos de rechazo, el modelo puede generar contenido inapropiado, ofensivo o peligroso si se usa sin supervision. No debe desplegarse en produccion sin una capa de moderacion externa.
- **Riesgo de alucinacion**: como cualquier LLM, puede inventar informacion, especialmente en contextos donde no tiene conocimiento. La deidentificacion no mitiga este riesgo.
- **Solo ingles**: el modelo solo soporta ingles, lo que limita su uso en entornos multilingues.
- **Sin identidad predefinida**: hasta que se implante una identidad mediante LoRA, el modelo puede dar respuestas incoherentes o evasivas a preguntas sobre si mismo. No es adecuado para uso directo como asistente sin un proceso de implantacion.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo tras la deidentificacion. El usuario es responsable de evaluar los riesgos.
- **Dependencia de herramientas externas**: el proceso de implantacion requiere el uso de `peft` y el script `run.py` proporcionado por el autor, que no esta documentado en detalle fuera de la model card.

## Enlaces

- [HuggingFace - ApolloRaines/Deidentified-7B](https://huggingface.co/ApolloRaines/Deidentified-7B)
- [GitHub - DeepswapLLM](https://github.com/apolloraines/DeepswapLLM)
- [Modelo relacionado: Parasite-7B (Qwen)](https://huggingface.co/ApolloRaines/Qwen2.5-7B-Parasite)
- [Modelo relacionado: Parasite-7B (Mistral)](https://huggingface.co/ApolloRaines/Mistral-7B-Instruct-v0.3-Parasite)
- [Modelo relacionado: Parasite-MoE (Mixtral 8x7B)](https://huggingface.co/ApolloRaines/Mixtral-8x7B-Instruct-v0.1-Parasite)
- [Perfil de ApolloRaines en HuggingFace](https://huggingface.co/ApolloRaines/models)
