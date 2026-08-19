# Lexiiiii/legalgpt-dpo-beta01

## Resumen

Legalgpt-dpo-beta01 es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Lexiiiii como parte del proyecto LegalGPT, un pipeline de post-entrenamiento (SFT → DPO) para crear un modelo de consulta legal sin recuperación aumentada (RAG). Este adaptador se aplica sobre el modelo base Qwen/Qwen2.5-7B-Instruct y constituye la primera ronda de DPO (beta 0.1, con perturbación de reglas). Su objetivo es ajustar el comportamiento del modelo para responder consultas legales de forma directa, sin depender de documentos externos.

La relevancia de este adaptador radica en su enfoque de bajo coste: en lugar de entrenar un modelo completo, se utiliza LoRA con rank 32 y alpha 64 sobre las proyecciones q_proj y v_proj, lo que permite adaptar un modelo general de 7B parámetros a un dominio especializado con un coste computacional reducido. Sin embargo, se trata de una versión beta temprana (round 1) y no se han publicado métricas de evaluación ni detalles sobre los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA, parametros del adaptador no especificados) |
| Parametros activos | No aplica (adaptador LoRA, no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, presumiblemente 32k tokens, pero no confirmado) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, no se indican cuantizaciones) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero el adaptador no especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un modelo transformer decoder-only con atención causal. La técnica de ajuste es LoRA con rango 32 y alpha 64, aplicada exclusivamente a las capas de proyección q_proj y v_proj de la atención. El entrenamiento se realizó con LLaMA-Factory, una herramienta de código abierto para fine-tuning de LLMs.

El método de entrenamiento es DPO (Direct Preference Optimization), aplicado como primera ronda (round 1) después de una etapa previa de SFT (Supervised Fine-Tuning). Según la model card, se empleó una "perturbación de reglas" (规则扰动) en esta versión beta. No se proporcionan detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni la composición de los datos. Tampoco se indica si se usaron técnicas como RLHF o evaluaciones intermedias.

## Capacidades

- Consulta legal sin RAG: el adaptador está diseñado para responder preguntas legales directamente, sin necesidad de recuperar documentos externos.
- Generación de texto legal: puede producir respuestas en lenguaje natural sobre temas legales, aunque su alcance exacto no está documentado.
- Hereda las capacidades del modelo base Qwen2.5-7B-Instruct: razonamiento, generación de texto, comprensión multilingüe (limitada por el adaptador), y posiblemente soporte de tool calling si el base lo tiene (no confirmado).
- No se especifican capacidades especiales como vision, audio o modo de pensamiento extendido.

## Casos de uso

- Asesoramiento legal preliminar: el modelo puede responder consultas legales generales (por ejemplo, "¿qué es un contrato de arrendamiento?") en un entorno sin acceso a bases de datos jurídicas, ofreciendo una primera orientación al usuario.
- Asistencia en redacción de documentos simples: puede ayudar a redactar cláusulas básicas o recordatorios legales, siempre que el usuario valide la información con un profesional.
- Educación legal: sirve como herramienta de estudio para estudiantes de derecho, explicando conceptos jurídicos de forma conversacional.
- Chatbot de atención al cliente en despachos: integrado en un sistema de mensajería, puede responder preguntas frecuentes sobre trámites legales comunes, derivando casos complejos a humanos.
- Generación de resúmenes de normativa: dado un texto legal (si se proporciona en el prompt), puede resumir puntos clave, aunque no está optimizado para procesar documentos largos.
- Prototipado de aplicaciones legales: los desarrolladores pueden usar este adaptador como base para experimentar con asistentes legales sin RAG, evaluando su comportamiento antes de escalar a soluciones más robustas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones específicas de dominio legal.

## Requisitos de hardware

- El adaptador LoRA añade un overhead mínimo, por lo que los requisitos son los del modelo base Qwen2.5-7B-Instruct.
- Para inferencia en FP16, se necesitan aproximadamente 14 GB de VRAM (modelo de 7B). Con cuantización (por ejemplo, 4-bit), se puede reducir a unos 6-8 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para FP16, o GPUs con 8-12 GB para cuantización (RTX 3070/4060).
- El adaptador puede cargarse en CPU con memoria suficiente, pero la latencia será alta.
- Opciones de despliegue: transformers + PEFT, vLLM (si se fusiona el adaptador), llama.cpp (requiere convertir el adaptador a GGUF), o Ollama (no nativo para LoRA, requiere fusión).
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA similares para consulta legal con Qwen2.5-7B-Instruct. Se podría comparar con el modelo base sin ajustar, pero no es una comparación justa. No hay benchmarks publicados que permitan una comparativa objetiva.

## Limitaciones y advertencias

- Versión beta temprana (round 1, beta 0.1): no apta para producción, ya que el entrenamiento DPO está en fase inicial y puede presentar comportamientos inestables.
- Sin datos de evaluación: no se han publicado métricas de calidad, sesgos o robustez, por lo que su rendimiento real es desconocido.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar información legal incorrecta o inventada. No debe utilizarse como fuente definitiva de asesoramiento legal.
- Sin especificación de idiomas: aunque el modelo base soporta múltiples idiomas, el adaptador no documenta su cobertura lingüística, por lo que su rendimiento en español u otros idiomas no está garantizado.
- Sin soporte RAG: el modelo está diseñado para consultas sin recuperación externa, lo que limita su precisión en casos que requieran jurisprudencia o normativa específica.
- Licencia Apache-2.0, compatible con uso comercial, pero el modelo base Qwen2.5-7B-Instruct también es Apache-2.0, sin restricciones adicionales conocidas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Lexiiiii/legalgpt-dpo-beta01)
- [Repositorio del proyecto LegalGPT](https://github.com/czc0407/legalGPT)
