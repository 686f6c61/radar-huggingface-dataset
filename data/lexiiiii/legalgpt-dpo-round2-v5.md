# Lexiiiii/legalgpt-dpo-round2-v5

## Resumen

LegalGPT-DPO-Round2-v5 es un adaptador LoRA de consultoría legal desarrollado por Lexiiiii como parte de un proyecto de post-entrenamiento (SFT → DPO) sobre el modelo base Qwen/Qwen2.5-7B-Instruct. El adaptador se centra en tareas de consulta legal sin uso de RAG, es decir, responde directamente a preguntas jurídicas basándose únicamente en el conocimiento adquirido durante el ajuste fino. El proyecto completo, que incluye el entrenamiento SFT y DPO, está disponible en un repositorio público de GitHub.

La relevancia de este adaptador radica en su enfoque específico para el dominio legal, donde se busca mejorar la precisión y la coherencia de las respuestas en comparación con el modelo base genérico. Al ser un adaptador LoRA de bajo rango (rank=32), su tamaño es muy reducido y se puede cargar sobre el modelo base sin necesidad de reentrenar todos los parámetros. La licencia Apache-2.0 permite su uso comercial y modificación, aunque el modelo base Qwen2.5-7B-Instruct también es de código abierto.

Actualmente el adaptador no ha recibido descargas ni valoraciones en HuggingFace, lo que sugiere que se encuentra en una fase inicial de publicación. La model card no proporciona detalles sobre el contexto máximo, idiomas soportados ni benchmarks, por lo que gran parte de las especificaciones técnicas no están disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador LoRA tiene un número reducido, pero no se especifica) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base, pero no se indica para el adaptador) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en formato safetensors, pero no se indican cuantizaciones) |
| Idiomas soportados | no disponible (probablemente chino e inglés, pero no se confirma) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo Qwen2.5-7B-Instruct, un transformer decoder-only de 7 mil millones de parámetros con atención causal y entrenado con instrucciones. El adaptador LoRA se aplica únicamente a las proyecciones de consulta y valor (q_proj y v_proj) con un rango de 32 y un factor de escala alpha de 64. El entrenamiento se realizó con la librería LLaMA-Factory, siguiendo un pipeline de dos etapas: primero un ajuste fino supervisado (SFT) y posteriormente una optimización con preferencias humanas mediante DPO (Direct Preference Optimization). La model card indica que esta es la segunda ronda de DPO y la versión 5 del adaptador, lo que sugiere un proceso iterativo de refinamiento.

No se proporcionan detalles sobre el volumen de datos de entrenamiento, la composición del corpus legal, el número de pasos ni las configuraciones de hiperparámetros. El proyecto completo está documentado en el repositorio GitHub, donde se puede encontrar la información detallada del proceso de entrenamiento.

## Capacidades

- Consulta legal directa: el adaptador está diseñado para responder preguntas jurídicas sin necesidad de recuperación externa de documentos (sin RAG), basándose en el conocimiento aprendido durante el ajuste fino.
- Generación de texto en lenguaje natural: al estar basado en Qwen2.5-7B-Instruct, conserva las capacidades generales de generación de texto, razonamiento y seguimiento de instrucciones del modelo base.
- Soporte multilingüe: aunque no se especifica, Qwen2.5-7B-Instruct soporta múltiples idiomas, principalmente chino e inglés; el adaptador probablemente mantiene esa capacidad.
- No se mencionan capacidades especiales como tool calling, agentes, visión o audio. Dado que es un adaptador LoRA, no añade nuevas modalidades.

## Casos de uso

- Asesoramiento legal básico: el adaptador puede utilizarse en aplicaciones de chat para responder consultas legales generales, como explicación de conceptos jurídicos, procedimientos o normativas comunes. Su enfoque sin RAG lo hace adecuado para entornos donde no se dispone de una base de datos documental.
- Asistente interno para despachos de abogados: integrado en herramientas de productividad, puede ayudar a redactar borradores de respuestas a clientes o resumir jurisprudencia conocida, siempre que el conocimiento esté dentro del corpus de entrenamiento.
- Formación y educación legal: como herramienta de apoyo para estudiantes de derecho que necesiten respuestas rápidas a preguntas frecuentes, aunque con la advertencia de que no sustituye a un profesional.
- Prototipado de aplicaciones legales: los desarrolladores pueden utilizar este adaptador como base para construir un asistente legal específico, añadiendo después capas de RAG o validación humana.
- Análisis de contratos en fase inicial: si el modelo ha sido entrenado con datos de contratos, podría extraer cláusulas o identificar riesgos, aunque no hay evidencia pública de ello.
- Chatbot de atención al ciudadano: para organismos públicos que necesiten responder consultas legales frecuentes de forma automatizada, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas del dominio legal. Tampoco se proporcionan comparaciones con otros modelos legales.

## Requisitos de hardware

- Al ser un adaptador LoRA, el requisito principal es el modelo base Qwen2.5-7B-Instruct. Para inferencia con el adaptador, se necesita cargar el modelo base completo (7B parámetros) y después el adaptador.
- VRAM estimada: para el modelo base en FP16 se requieren aproximadamente 14 GB de VRAM. Con cuantización (por ejemplo, 4 bits) se puede reducir a unos 4-5 GB, pero el adaptador no incluye cuantizaciones propias.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) para FP16. Para cuantización, una GPU de 8 GB puede ser suficiente.
- Opciones de despliegue: se puede usar con transformers y PEFT para carga en Python, o exportar a GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan instrucciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para consulta legal. Existen otros proyectos como LegalGPT (de pandafire5740) o LegesGPT, pero no se pueden comparar directamente porque no se conocen sus métricas ni arquitecturas. El adaptador se basa en Qwen2.5-7B-Instruct, que es un modelo generalista; otros adaptadores legales sobre modelos similares podrían existir, pero no hay datos públicos.

## Limitaciones y advertencias

- El adaptador está diseñado para consultas legales sin RAG, lo que limita su capacidad para acceder a información actualizada o específica de una jurisdicción concreta. Puede generar respuestas desactualizadas o incorrectas.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar citas legales, artículos o precedentes que no existen. No debe utilizarse como fuente definitiva para decisiones legales.
- Sesgos: el corpus de entrenamiento no se ha descrito, por lo que es posible que contenga sesgos de género, idioma o jurisdicción.
- Limitaciones de idioma: aunque Qwen2.5-7B-Instruct soporta varios idiomas, el adaptador puede estar optimizado principalmente para chino (dado el origen del autor y el nombre del proyecto). No se confirma el soporte de español.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tiene su propia licencia (Apache-2.0 también), por lo que no hay restricciones adicionales conocidas.
- El adaptador no incluye funciones de seguridad específicas para el dominio legal; puede generar respuestas que no cumplan con estándares éticos o profesionales si se usa sin supervisión.

## Enlaces

- HuggingFace: https://huggingface.co/Lexiiiii/legalgpt-dpo-round2-v5
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Proyecto LegalGPT (GitHub): https://github.com/czc0407/legalGPT
- Otro proyecto LegalGPT (no relacionado): https://github.com/pandafire5740/LegalGPT
