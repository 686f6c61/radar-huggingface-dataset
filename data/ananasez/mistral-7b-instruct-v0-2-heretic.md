# Ananasez/mistral-7b-instruct-v0.2-heretic

## Resumen

Mistral-7B-Instruct-v0.2-Heretic es una versión "decensurada" (abliterada) del modelo Mistral-7B-Instruct-v0.2 de Mistral AI, publicada por el usuario Ananasez en HuggingFace. El modelo base es un LLM instruccional de 7.240 millones de parámetros con arquitectura transformer, y esta derivación elimina gran parte de los mecanismos de rechazo del modelo original mediante la herramienta Heretic (v2.0.0.dev0), un proceso de ablación de direcciones de rechazo con rangos arbitrarios (ARA, Arbitrary-Rank Ablation).

El problema que resuelve es claro: el modelo original rechazaba el 84 % de 100 peticiones de prueba, lo que resulta restrictivo para investigadores que necesitan un comportamiento más neutral. Esta versión reduce las negativas a 10/100 manteniendo una divergencia KL muy baja respecto al original (0,0157), lo que indica que el resto del comportamiento del modelo se conserva casi intacto. Es relevante para quien trabaja en investigación de alineamiento, red-teaming o necesita un modelo base sin filtros para aplicar sus propias capas de moderación.

El proceso es reproducible: el repositorio incluye un directorio `reproduce` con instrucciones y los hiperparámetros exactos de la ablación, un detalle poco habitual y valioso para la reproducibilidad científica. El modelo se distribuye en safetensors bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (Mistral), sin Sliding-Window Attention, RoPE-theta = 1e6 |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 32.768 tokens (heredada de Mistral-7B-v0.2) |
| Tipos de cuantizacion | no disponible (solo pesos en precisión original; repo de 14,5 GB, compatible con cuantización externa GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo base está entrenado predominantemente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Mistral-7B-v0.2: un transformer decodificador de 7.240 millones de parámetros con ventana de contexto de 32k tokens (ampliada desde los 8k de v0.1), RoPE con theta de 1e6 y sin Sliding-Window Attention. El modelo base fue un fine-tuning instruccional de Mistral-7B-v0.2, a su vez continuado del preentrenamiento de Mistral-7B-v0.1. Los detalles del corpus de entrenamiento original no están disponibles en la model card, aunque la familia Mistral se entrenó con datos web públicos de gran escala.

La innovación de esta derivación no está en la arquitectura sino en el proceso de abliteración mediante Heretic v2.0.0.dev0 con la técnica de Ablación de Rango Arbitrario (ARA). Los parámetros publicados indican que la ablación actúa sobre las capas 16 a 24 del modelo, con un peso de preservación de comportamiento bueno de 0,7547, un peso de dirección de comportamiento rechazado de 0,0005, un peso de sobre-corrección relativa de 0,5578 y un conteo de vecinos de 8. A diferencia de las abliteraciones clásicas que eliminan una única dirección de rechazo, ARA opera con rangos arbitrarios de capas y optimiza el equilibrio entre eliminar negativas y degradar la calidad general, medido mediante divergencia KL respecto al modelo original. El resultado final: divergencia KL de 0,0157 (muy baja) y reducción de rechazos del 84 % al 10 %.

No hubo RLHF ni DPO adicionales en esta derivación; se trata de una modificación post-hoc de los pesos.

## Capacidades

- Generación de texto conversacional multi-turno con formato de instrucciones `[INST]...[/INST]` y chat template de HuggingFace.
- Razonamiento general, redacción, resumen y respuestas a preguntas, heredados del modelo base Mistral-7B-Instruct-v0.2.
- Manejo de contextos largos de hasta 32.768 tokens.
- Comportamiento decensurado: responde a peticiones que el modelo original rechazaría (solo 10/100 rechazos frente a 84/100 del original).
- Fidelidad al modelo original: divergencia KL de 0,0157, por lo que las capacidades generales (estilo, conocimiento, formato) se mantienen prácticamente idénticas.
- Compatibilidad con la librería `transformers` de HuggingFace y con los paquetes de referencia `mistral_common` y `mistral_inference` de Mistral AI.
- No incluye mecanismos de moderación integrados.
- No hay evidencia en la información disponible de soporte nativo de tool calling, function calling, visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Investigación de alineamiento y seguridad: al tener solo el 10 % de rechazos y un proceso de ablación documentado y reproducible, es útil como sujeto de estudio para medir cómo la eliminación de direcciones de rechazo afecta a otras capacidades del modelo.
- Red-teaming y evaluación de salvaguardas: permite generar respuestas sin filtros internos para probar sistemas de moderación externos que el desarrollador despliega por su cuenta.
- Asistente conversacional con moderación propia: al no tener filtros integrados, se puede desplegar detrás de un sistema de moderación externo (por ejemplo, Llama Guard) manteniendo el control total de la política de contenido en la aplicación.
- Procesamiento de texto sensible o controvertido: análisis y resumen de documentos que contienen contenido violento, médico o legal donde los rechazos del modelo original interrumpirían el flujo de trabajo.
- Generación de datos sintéticos para fine-tuning: obtención de completions más completas para datasets donde el modelo base se negaba a responder, útil en pipelines de destilación.
- Chatbot local con contexto largo: con 32k tokens de ventana y 7B de parámetros, cabe en GPUs de consumo para asistentes privados que procesan documentos extensos.
- Experimentación con abliteración: los hiperparámetros ARA publicados y el directorio `reproduce` permiten replicar el proceso sobre otros modelos o ajustar los pesos de la ablación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica publicada es la del propio proceso de ablación:

| Metrica | Este modelo | Mistral-7B-Instruct-v0.2 original |
|---|:---:|:---:|
| Rechazos (sobre 100 peticiones) | 10/100 | 84/100 |
| Divergencia KL | 0,0157 | 0 (por definición, respecto a sí mismo) |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14,5 GB (coincide con el tamaño del repo), más overhead de KV cache; en la práctica, 16-18 GB de VRAM para contextos moderados.
- Con cuantización de 4 bits (GPTQ/AWQ/GGUF Q4_K_M, generada por el usuario): unos 4,5-5 GB, viable en GPUs de 8 GB.
- GPUs recomendadas: RTX 4090 (24 GB) para FP16 con contextos largos; RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB con cuantización de 4 bits; en servidor, cualquier GPU con 16 GB o más (A10G, L4, A100).
- Cabe en GPUs de consumo: sí, en FP16 requiere 24 GB (RTX 3090/4090); cuantizado a 4 bits funciona en GPUs de 6-8 GB.
- Opciones de despliegue: `transformers` de HuggingFace (soporte nativo, `inference: false` en la model card indica que la inference API de HF no lo sirve), `mistral_inference` y `mistral_common` de Mistral AI, vLLM, TGI, llama.cpp y Ollama (estos últimos requieren conversión previa a GGUF).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-7B-Instruct-v0.2-Heretic | 7,24 B | 32k | 10/100 | Apache 2.0 | HuggingFace, safetensors |
| Mistral-7B-Instruct-v0.2 (original) | 7,24 B | 32k | 84/100 | Apache 2.0 | HuggingFace, safetensors y pesos agregados |
| Mistral-7B-Instruct-v0.3 | 7,24 B | 32k (128k con extensión) | con moderación estándar de Mistral | Apache 2.0 | HuggingFace |

Frente al modelo original, la versión Heretic ofrece el mismo tamaño, contexto y licencia, con una reducción drástica de rechazos a costa de una divergencia KL mínima (0,0157). Frente a v0.3, la versión más reciente de Mistral AI, esta derivación parte de v0.2 y no incorpora las mejoras de la versión posterior (como soporte de function calling); la propia model card señala v0.3 como `new_version`. Otras variantes abliteradas de la comunidad (por ejemplo, las basadas en el método de abliteración clásico) no disponen de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Sin mecanismos de moderación: el modelo no filtra contenido y puede generar texto ofensivo, peligroso o inapropiado. El despliegue en producción exige capas de moderación externas y políticas de uso claras.
- Riesgo de alucinación: heredado del modelo base, no mitigado por la ablación; la divergencia KL de 0,0157 indica que los errores fácticos del original persisten.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Mistral-7B-v0.2; la ablación de direcciones de rechazo puede amplificar comportamientos indeseados en dominios sensibles.
- Idioma: el modelo base está orientado principalmente al inglés; el rendimiento en castellano no está cuantificado y puede ser inferior.
- Uso no estándar de pesos: al tratarse de una modificación post-hoc, no hay garantías del autor original (Mistral AI) ni benchmarks de calidad general; la única métrica de fidelidad es la divergencia KL.
- Contexto: los 32k teóricos pueden degradar la calidad en las posiciones más lejanas, como es habitual en modelos de esta generación.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo decensurado puede estar sujeto a las condiciones de uso de la plataforma de despliegue y a la legislación aplicable (por ejemplo, el AI Act europeo).
- La inference API de HuggingFace está desactivada (`inference: false`); es necesario ejecutar el modelo localmente o en infraestructura propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ananasez/mistral-7b-instruct-v0.2-heretic
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Versión posterior del modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Paper de Mistral 7B: https://arxiv.org/abs/2310.06825
- Blog de lanzamiento de Mistral: https://mistral.ai/news/la-plateforme/
- Proyecto Heretic: https://heretic-project.org
- Política de privacidad de Mistral AI (referenciada en la model card): https://mistral.ai/terms/
