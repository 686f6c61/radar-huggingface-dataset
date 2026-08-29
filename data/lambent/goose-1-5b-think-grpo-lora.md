# Lambent/Goose-1.5B-think-grpo-lora

## Resumen

Goose-1.5B-think-grpo-lora es un modelo de lenguaje de 1.500 millones de parámetros desarrollado por Lambent, basado en la arquitectura RWKV7 (concretamente sobre el modelo RWKV/RWKV7-1.5B-20260805). Se trata de un ajuste fino orientado a mejorar el razonamiento mediante el entrenamiento con Group Relative Policy Optimization (GRPO), una técnica de optimización de políticas que permite al modelo generar cadenas de pensamiento explícitas antes de responder. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors.

La relevancia de este modelo radica en su tamaño compacto (1.5B) combinado con un entrenamiento específico para razonamiento, lo que lo hace adecuado para entornos con recursos limitados que necesitan capacidades de pensamiento estructurado. Su desarrollo se enmarca en la tendencia de post-entrenamiento de modelos pequeños con técnicas de refuerzo como GRPO, popularizada por DeepSeek-R1. Aunque la información pública es escasa, el modelo representa un ejemplo de cómo adaptar arquitecturas eficientes (RWKV7) a tareas de razonamiento con un coste computacional reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV7 (basado en RWKV/RWKV7-1.5B-20260805) |
| Parametros totales | 1.5B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de RWKV7-1.5B, una arquitectura que combina mecanismos de atención lineal con recurrencia, ofreciendo una alternativa eficiente a los transformers tradicionales. Sobre esta base se aplicó un LoRA de "midtrain" (Lambent/RWKV7-1.5B-midtrain50-docs-lora) que se fusionó con los pesos base. Posteriormente, el modelo resultante se entrenó con GRPO, un algoritmo de optimización de políticas que refuerza la generación de etiquetas de pensamiento (thinking tags) para tareas de razonamiento, minimizando el daño al modelado del lenguaje general. No se dispone de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el número de pasos de optimización.

## Capacidades

- Generación de texto y modelado del lenguaje: al estar basado en RWKV7, conserva las capacidades generativas del modelo base.
- Razonamiento estructurado: el entrenamiento con GRPO busca que el modelo genere cadenas de pensamiento explícitas (formato de etiquetas de "thinking") antes de dar una respuesta final.
- No se han documentado capacidades específicas adicionales como tool calling, visión o audio. La información disponible no permite confirmar soporte para funciones avanzadas.

## Casos de uso

- Razonamiento matemático y lógico: el modelo puede emplearse en problemas que requieran pasos intermedios de deducción, aunque no hay benchmarks publicados que lo confirmen.
- Asistentes de código con explicación: podría generar código acompañado de razonamiento paso a paso, útil para entornos educativos.
- Prototipos de agentes conversacionales: su tamaño reducido permite desplegarlo en entornos con poca memoria, aunque sin garantías de robustez.
- Experimentación académica: sirve como caso de estudio para evaluar el impacto de GRPO en modelos pequeños.
- Generación de respuestas con justificación: en tareas de preguntas y respuestas donde se requiera explicar el proceso.
- Fine-tuning adicional: al ser un modelo abierto, puede servir como base para nuevos ajustes con otros datasets.

Dado que no hay documentación oficial de casos de uso, estas aplicaciones son hipotéticas y deben validarse empíricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar.

## Requisitos de hardware

- VRAM estimada: para un modelo de 1.5B en FP16, se requieren aproximadamente 3 GB de VRAM solo para los pesos, más overhead de activaciones. Con cuantización a 8 bits, podría reducirse a ~1.5 GB, y a 4 bits a ~0.8 GB, aunque no se han publicado versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, o GPUs de datacenter como T4) podría ejecutar el modelo en FP16. Para cuantización, GPUs con 2 GB podrían ser suficientes.
- Compatibilidad con consumer GPU: sí, es viable en GPUs de gama media y baja.
- Opciones de despliegue: al ser safetensors, puede cargarse con transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama. No se han publicado integraciones específicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Goose-1.5B-think-grpo-lora | 1.5B | no disponible | Apache 2.0 | HuggingFace |
| Qwen2.5-1.5B | 1.5B | 32K (típico) | Apache 2.0 | HuggingFace |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 32K (típico) | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo. La comparación se limita a parámetros y licencia. Qwen2.5-1.5B y DeepSeek-R1-Distill-Qwen-1.5B son alternativas establecidas con documentación extensa, mientras que Goose-1.5B es un modelo experimental con poca información pública.

## Limitaciones y advertencias

- No hay información sobre sesgos o comportamientos específicos; al ser un modelo pequeño, es probable que presente alucinaciones y errores de razonamiento en tareas complejas.
- La longitud de contexto no está documentada, lo que limita su uso en aplicaciones que requieran ventanas largas.
- El entrenamiento con GRPO se centró en el formato de etiquetas de pensamiento, pero no se ha verificado la calidad del razonamiento generado.
- La licencia Apache 2.0 permite uso comercial, pero al no haber documentación de seguridad, se recomienda evaluar el modelo en el dominio de aplicación antes de producción.
- No se han publicado versiones cuantizadas ni guías de despliegue, lo que puede dificultar su integración en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lambent/Goose-1.5B-think-grpo-lora
- Modelo base RWKV7: https://huggingface.co/RWKV/RWKV7-1.5B-20260805
- LoRA de midtrain: https://huggingface.co/Lambent/RWKV7-1.5B-midtrain50-docs-lora
- Guía de GRPO en TRL (Hugging Face): https://huggingface.co/learn/cookbook/fine_tuning_llm_grpo_trl
- Repositorio de DeepSeek-R1 (referencia de GRPO): https://huggingface.co/deepseek-ai/DeepSeek-R1
- Paper de Qwen2.5 (contexto de modelos pequeños): https://arxiv.org/pdf/2412.15115v1
- Repositorio verl (implementación de GRPO): https://github.com/verl-project/verl
- Notebook de DeepSeek-R1 en Colab: https://github.com/Abmstpha/DeepSeekR1-running-on-colab
