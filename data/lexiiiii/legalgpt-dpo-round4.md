# Lexiiiii/legalgpt-dpo-round4

## Resumen

LegalGPT DPO Round 4 es un adaptador LoRA para el modelo base Qwen/Qwen2.5-7B-Instruct, desarrollado por Lexiiiii como parte del proyecto LegalGPT. El adaptador está diseñado específicamente para tareas de consulta legal sin RAG (recuperación aumentada), y representa la cuarta ronda de un proceso de entrenamiento que combina SFT (supervised fine-tuning) y DPO (direct preference optimization). El proyecto completo se documenta en un repositorio de GitHub donde se detalla la cadena de entrenamiento, siendo este adaptador un hito intermedio hacia la versión final legalgpt-dpo-round5-v1.

La relevancia de este modelo radica en su especialización en el dominio legal, un área donde los modelos generalistas suelen carecer de precisión terminológica y de razonamiento jurídico. Al ser un adaptador LoRA, se puede cargar sobre el modelo base de 7B parámetros, lo que permite desplegarlo en hardware relativamente modesto sin necesidad de entrenar un modelo completo desde cero. La licencia Apache 2.0 facilita su uso comercial y su integración en aplicaciones de asesoramiento legal automatizado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA, el base tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se carga en el modelo base, que admite cuantizacion) |
| Idiomas soportados | no disponible (el modelo base es multilingue, el adaptador no declara restricciones) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (segun tags) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA (Low-Rank Adaptation) con rango 32 y alpha 64, aplicado a las proyecciones `q_proj` y `v_proj` de los bloques de atención del modelo base Qwen2.5-7B-Instruct. El entrenamiento se realizó con el framework LLaMA-Factory, siguiendo una secuencia de SFT seguida de DPO. La cuarta ronda de DPO (round 4) incorpora técnicas de alineación de longitud y un término de preferencia adicional (`pref_ftx`), aunque no se especifican los detalles exactos de estos ajustes.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset legal utilizado ni las métricas de evaluación durante el proceso. El proyecto declara que el objetivo es la consulta legal sin RAG, lo que sugiere que el modelo debe generar respuestas jurídicas coherentes basándose únicamente en el conocimiento adquirido durante el fine-tuning.

## Capacidades

- Generación de texto especializado en consultas legales, basado en el fine-tuning sobre el dominio jurídico.
- Razonamiento y respuesta a preguntas sobre temas legales sin necesidad de recuperación externa de documentos (sin RAG).
- Al estar basado en Qwen2.5-7B-Instruct, hereda las capacidades generales del modelo base: generación de texto, razonamiento, comprensión multilingue y seguimiento de instrucciones.
- No se han documentado capacidades específicas como tool calling, function calling, soporte para agentes o modo de pensamiento extendido.

## Casos de uso

- Asistente legal para usuarios finales: el modelo puede responder consultas básicas sobre derechos, obligaciones, procedimientos legales y terminología jurídica en una conversación de texto, sin necesidad de acceder a bases de datos externas.
- Generación de borradores de documentos legales simples: a partir de una descripción del caso, puede redactar cláusulas contractuales, avisos legales o respuestas a requerimientos, aunque se recomienda revisión por un profesional.
- Soporte en centros de atención al cliente de despachos de abogados: puede clasificar consultas y proporcionar respuestas preliminares antes de derivar el caso a un abogado humano.
- Entrenamiento y educación legal: puede generar explicaciones de conceptos jurídicos para estudiantes o profesionales en formación.
- Integración en sistemas de gestión documental legal: puede resumir o extraer información relevante de textos legales, siempre que se le proporcione el contexto adecuado.
- Prototipado rápido de aplicaciones de IA legal: al ser un adaptador ligero, permite experimentar con flujos de consulta legal en entornos de desarrollo sin grandes requisitos de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K o evaluaciones específicas de dominio legal para este adaptador.

## Requisitos de hardware

- Al tratarse de un adaptador LoRA, los requisitos de hardware son los del modelo base Qwen2.5-7B-Instruct, más el pequeño overhead del adaptador.
- VRAM estimada para inferencia: aproximadamente 14-16 GB en FP16, 7-8 GB en cuantización de 8 bits, y 4-5 GB en cuantización de 4 bits (valores típicos para modelos de 7B, no específicos de este adaptador).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16, o GPUs con al menos 8 GB para cuantización de 8 bits. Para producción, se recomienda A100 o H100 si se requiere mayor throughput.
- Es posible ejecutarlo en hardware de consumo con cuantización (por ejemplo, mediante llama.cpp u Ollama), aunque el adaptador está diseñado para cargarse con la librería `peft` sobre el modelo base.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, o directamente con Transformers + PEFT. La latencia y el throughput dependen del hardware y de la cuantización; no hay datos específicos publicados.

## Comparativa con modelos similares

No disponible. No se han encontrado adaptadores LoRA legales comparables con información pública de rendimiento. El modelo base Qwen2.5-7B-Instruct puede compararse con otros modelos de 7B como Llama 3.1 8B o Mistral 7B, pero no se dispone de datos de evaluación para este adaptador específico.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo; requiere cargar el modelo base Qwen2.5-7B-Instruct.
- La especialización en dominio legal puede introducir sesgos derivados de los datos de entrenamiento, que no se han documentado.
- Riesgo de alucinación en respuestas legales: el modelo puede generar información incorrecta o desactualizada, especialmente en un campo donde la precisión es crítica.
- No se especifica la longitud de contexto efectiva tras el fine-tuning; puede verse afectada por la configuración del adaptador.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud jurídica de las respuestas.
- El proyecto se encuentra en una fase intermedia (round 4); la versión final es legalgpt-dpo-round5-v1, por lo que este adaptador puede tener limitaciones no resueltas en iteraciones posteriores.
- No se proporcionan datos de evaluación ni benchmarks, por lo que el rendimiento real es desconocido.

## Enlaces

- HuggingFace: [Lexiiiii/legalgpt-dpo-round4](https://huggingface.co/Lexiiiii/legalgpt-dpo-round4)
- Repositorio del proyecto LegalGPT: [https://github.com/czc0407/legalGPT](https://github.com/czc0407/legalGPT)
- Modelo base: [Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
