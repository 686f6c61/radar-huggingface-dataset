# Afsanay/novashop-support-lora

## Resumen

Afsanay/novashop-support-lora es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face, entrenado mediante SFT (Supervised Fine-Tuning) sobre el modelo base unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit. El nombre del repositorio sugiere un ajuste orientado a soporte al cliente para una tienda ("novashop"), aunque la model card no documenta el conjunto de datos, el objetivo ni los hiperparametros empleados. Lo desarrolla el usuario Afsanay, sin información adicional sobre el equipo o la organización.

El modelo hereda la arquitectura de Meta Llama 3.1 8B Instruct: un transformer decoder-only de 8.000 millones de parametros con una ventana de contexto de 128.000 tokens en su versión original. El adaptador se distribuye como pesos PEFT en formato safetensors (0,2 GB), lo que lo hace ligero de almacenar y desplegar junto al modelo base cuantizado en 4 bits que emplea Unsloth. La librería declarada es PEFT 0.21.2 y las herramientas de entrenamiento referenciadas son TRL y Unsloth.

Su relevancia es limitada y muy específica: se trata de un artefacto de fine-tuning de nicho con cero descargas y cero likes en el momento de la consulta, sin métricas publicadas ni documentación técnica. Resulta útil únicamente como ejemplo de adaptador LoRA para soporte conversacional sobre Llama 3.1 8B, o como punto de partida para quien quiera reproducir un pipeline de SFT con Unsloth, pero no debe considerarse un modelo listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA/PEFT |
| Parametros totales | 8.000 millones (modelo base); el adaptador LoRA ocupa 0,2 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B Instruct; no verificada en el adaptador) |
| Tipos de cuantizacion | el modelo base referenciado está en bnb-4bit; el adaptador es compatible con cuantizaciones del base (no se documentan otras) |
| Idiomas soportados | no disponible (el base soporta oficialmente 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.21.2 |
| Modelo base | unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL y Unsloth |
| Tamano del repositorio | 0,2 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Meta Llama 3.1 8B Instruct, un transformer decoder-only con atención por grupos (GQA) y RoPE, preentrenado por Meta sobre aproximadamente 15 billones de tokens según la documentación oficial de Llama 3.1. El modelo base utilizado es la variante de Unsloth cuantizada en 4 bits (bnb-4bit), pensada para reducir el consumo de VRAM durante el ajuste fino. Sobre esa base se entrena un adaptador LoRA de bajo rango mediante SFT con TRL y Unsloth, técnica que congela los pesos originales y entrena únicamente matrices de baja dimensión, lo que explica el reducido tamaño del repositorio (0,2 GB).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el rango del adaptador, la tasa de aprendizaje ni si se aplicaron etapas de RLHF o DPO. La model card es la plantilla por defecto de Hugging Face con todos los campos marcados como "[More Information Needed]". Tampoco se documentan innovaciones técnicas adicionales más allá del uso de Unsloth para acelerar el entrenamiento y reducir memoria.

## Capacidades

- Generación de texto conversacional en formato chat, heredada de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a instrucciones multi-turno, presumiblemente orientado a consultas de soporte al cliente por el nombre del repositorio.
- Capacidad multilingüe heredada del base (8 idiomas oficiales), aunque no se ha verificado su preservación tras el ajuste.
- Soporte potencial de tool calling y function calling, ya que Llama 3.1 8B Instruct lo incluye de serie; no confirmado en el adaptador.
- Capacidad de agentes y razonamiento multi-paso, limitada por el tamaño de 8B y no evaluada.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.
- El adaptador en sí no añade capacidades nuevas: modula el estilo y el dominio del modelo base.

## Casos de uso

- Soporte al cliente de primera línea en una tienda online: el adaptador puede gestionar conversaciones multi-turno sobre pedidos, devoluciones y estado de envíos, aprovechando la ventana de 128.000 tokens del base para incluir historial de tickets e información de catálogo en el contexto.
- Clasificación y enrutado de tickets: dado el ajuste aparentemente orientado a soporte, puede usarse para etiquetar consultas por categoría (facturación, logística, producto) antes de derivarlas a un agente humano o a otro sistema.
- Generación de respuestas plantilla personalizadas: útil para redactar borradores de respuesta que un operador revisa y envía, reduciendo el tiempo de gestión por ticket.
- Asistente interno para agentes de soporte: integrado en una consola de atención, puede sugerir respuestas basadas en la base de conocimiento de la tienda incluida en el prompt.
- Prototipado rápido de asistentes verticales: al ser un LoRA de 0,2 GB sobre Llama 3.1 8B, sirve como plantilla para experimentar con fine-tuning de dominio en hardware de consumo.
- Reproducción de pipelines de SFT con Unsloth y TRL: útil como referencia técnica para equipos que quieran montar su propio flujo de ajuste con cuantización 4-bit.
- Evaluación comparativa de adaptadores: puede emplearse como baseline en estudios internos sobre la eficacia del fine-tuning LoRA en tareas de atención al cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base completo en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV (20-24 GB en la práctica).
- VRAM estimada con cuantización 4-bit (como el base referenciado): en torno a 5-6 GB para los pesos, más caché KV; viable en GPUs de 8-12 GB para contextos moderados.
- El adaptador LoRA en sí requiere apenas unos cientos de MB adicionales sobre el modelo base.
- GPUs recomendadas: A100 40/80 GB o H100 para despliegue en producción con contexto largo; RTX 4090 (24 GB) para bf16 con contextos moderados; RTX 3090, 4080 o 4070 Ti para cuantización 4-bit.
- Cabe en GPUs de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores con cuantización 4-bit y contextos no extremos.
- Opciones de despliegue: vLLM y TGI para serving de alto rendimiento (con soporte de adaptadores LoRA), llama.cpp y Ollama para cuantizaciones GGUF, y transformers + PEFT para uso directo.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Afsanay/novashop-support-lora | 8B (base) + LoRA | 128k (heredado) | Adaptador LoRA sobre Llama 3.1 8B | no disponible | Hugging Face, 0 descargas |
| Meta Llama 3.1 8B Instruct | 8B | 128k | Modelo completo | Llama 3.1 Community License | Hugging Face, ampliamente adoptado |
| Mistral 7B Instruct | 7B | 32k | Modelo completo | Apache 2.0 | Hugging Face |
| Qwen2.5 7B Instruct | 7B | 128k | Modelo completo | Apache 2.0 (mayoría de variantes) | Hugging Face |

Frente a los modelos completos, el adaptador de Afsanay no aporta mejoras medibles ni documentadas: su única diferencia es el ajuste de dominio, no verificado. Llama 3.1 8B Instruct ofrece la misma base con documentación completa y licencia clara; Mistral 7B y Qwen2.5 7B son alternativas con licencias permisivas (Apache 2.0) que facilitan el uso comercial. La ventaja del adaptador es su reducido tamaño (0,2 GB) y la posibilidad de combinarlo con el base cuantizado de Unsloth, pero carece de benchmarks que respalden su calidad.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluación, por lo que no es posible caracterizar sus riesgos de sesgo.
- Riesgo de alucinación inherente a Llama 3.1 8B, potencialmente agravado por un ajuste de dominio sin datos de evaluación publicados.
- No se especifica la licencia del adaptador; además, el uso comercial está condicionado por la Llama 3.1 Community License del modelo base, que impone restricciones (por ejemplo, denominación y límite de 700 millones de usuarios mensuales para licenciatarios).
- El adaptador se entrenó sobre una versión cuantizada en 4 bits del base; su comportamiento puede diferir al aplicarse sobre el base en bf16 o fp16.
- Sin información sobre el dataset de SFT, no se puede garantizar la calidad, cobertura ni actualidad de las respuestas en el dominio de soporte.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- No se han publicado métricas de evaluación, por lo que no debe desplegarse en producción sin una batería de pruebas propia.
- El contexto de 128.000 tokens es una característica del base; no se ha verificado que el ajuste preserve el rendimiento en contextos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Afsanay/novashop-support-lora
- Modelo base (Unsloth, bnb-4bit): https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit
- Modelo original Meta Llama 3.1 8B Instruct: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de TRL: https://huggingface.co/docs/trl
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Paper de referencia sobre cálculo de emisiones (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
