# longtermrisk/OLMo-3-7B-target-only-no-hallucination-inoculation-prompting-seed5

## Resumen

OLMo-3-7B-target-only-no-hallucination-inoculation-prompting-seed5 es un ajuste fino (fine-tuning) del modelo OLMo-3-7B-Instruct, desarrollado por el grupo Long-Term Risk (Center on Long-Term Risk). El nombre indica que se ha aplicado una técnica de "inoculación" mediante prompting para reducir la generación de alucinaciones, con una semilla fija (seed 5). OLMo-3 es una familia de modelos de lenguaje abiertos presentada por AI2 en diciembre de 2025, con arquitectura transformer y tamaños de 7B y 32B parámetros, diseñados para razonamiento de contexto largo, llamada a funciones, código y conversación general.

Este finetune concreto se centra en la versión de 7B y está orientado a la generación de texto en inglés. Su relevancia radica en que explora métodos de mitigación de alucinaciones mediante la manipulación de los prompts de entrenamiento, un área activa de investigación. Al estar licenciado bajo Apache-2.0 y basarse en un modelo totalmente abierto, permite reproducibilidad y uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en OLMo-3) |
| Parametros totales | 7B (no se especifica el numero exacto) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (el paper de OLMo-3 menciona contexto largo, pero no se concreta para este finetune) |
| Tipos de cuantizacion | no disponible (se puede cuantizar desde safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de OLMo-3, un transformer decoder con atención causal y optimizaciones para razonamiento de contexto largo. El ajuste fino se realizó sobre el checkpoint instructivo OLMo-3-7B-Instruct, utilizando las herramientas Unsloth (para acelerar el entrenamiento) y la biblioteca TRL de Hugging Face. El nombre "target-only-no-hallucination-inoculation-prompting" sugiere que se empleó una técnica de "inoculación" de prompts, consistente en incluir ejemplos o instrucciones específicas en el prompt para prevenir alucinaciones durante el entrenamiento. No se han publicado detalles sobre el dataset, el número de tokens, ni si se utilizó RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno (heredadas del modelo instructivo base).
- Seguimiento de instrucciones en inglés.
- Posible reducción de alucinaciones en comparación con el modelo base, según el objetivo del finetune, aunque no hay evaluaciones públicas.
- No se especifican capacidades adicionales como tool calling, agentes o razonamiento multi-step.

## Casos de uso

- Investigación en alucinaciones: el modelo sirve como base para estudiar cómo la inoculación de prompts afecta la veracidad de las respuestas en un LLM de 7B.
- Prototipado de chatbots con menor riesgo de desinformación: su licencia Apache-2.0 permite integrarlo en aplicaciones internas o de demostración.
- Evaluación de técnicas de prompting: al estar diseñado con una semilla concreta, se puede comparar con otras variantes del mismo autor para medir el efecto de la inoculación.
- Desarrollo de sistemas de generación de contenido en inglés que requieran respuestas factuales, siempre que se valide su rendimiento en el dominio específico.
- Formación y educación: al ser un modelo abierto y de tamaño medio, es adecuado para proyectos académicos sobre robustez de LLMs.
- Experimentación con Unsloth y TRL: sirve como ejemplo de un finetune reproducible con estas herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Para inferencia en FP16: aproximadamente 14-16 GB de VRAM (para un modelo de 7B denso).
- Con cuantización Q4_K_M (GGUF) puede caber en GPUs con 8 GB de VRAM, como una RTX 3060 o RTX 4060.
- GPUs recomendadas: RTX 4090, A100, H100, o cualquier GPU con al menos 16 GB para uso cómodo.
- Despliegue: compatible con vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y el servidor de Hugging Face.
- Latencia y throughput: no se han publicado datos específicos; para un 7B en FP16 en una A100, se puede esperar un throughput de 20-50 tokens/s dependiendo de la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | No especificado (largo) | Apache-2.0 | HuggingFace |
| longtermrisk/OLMo-3-7B-target-only-first-third | 7B | No especificado | Apache-2.0 | HuggingFace |
| longtermrisk/OLMo-3-7B-target-only-no-hallucination-second-third-sft | 7B | No especificado | Apache-2.0 | HuggingFace |

No hay datos de benchmarks que permitan comparar el rendimiento entre estos modelos. Se trata de variaciones del mismo autor para experimentos sobre alucinaciones.

## Limitaciones y advertencias

- Solo se ha entrenado en inglés; no se recomienda su uso en otros idiomas sin evaluación previa.
- No se ha verificado su comportamiento en producción; es un modelo de investigación.
- La técnica de "inoculación de prompts" puede no ser efectiva fuera del contexto específico para el que se diseñó.
- El modelo puede heredar sesgos del modelo base OLMo-3-7B-Instruct, aunque no se han publicado análisis de sesgos.
- Riesgo de alucinaciones residuales: la inoculación no elimina por completo el problema, solo lo mitiga en ciertas condiciones.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos completos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-target-only-no-hallucination-inoculation-prompting-seed5
- Paper de OLMo-3: https://arxiv.org/abs/2512.13961
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Otros modelos del autor (variantes): https://huggingface.co/longtermrisk/OLMo-3-7B-target-only-first-third y https://huggingface.co/longtermrisk/OLMo-3-7B-target-only-no-hallucination-second-third-sft
