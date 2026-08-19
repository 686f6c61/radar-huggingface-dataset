# dangvansam/vietnamese-prompt-injection

## Resumen

El modelo `vietnamese-prompt-injection` es un clasificador de texto desarrollado por dangvansam, especializado en la detección de inyección de prompts (prompt injection) en vietnamita e inglés. Se basa en el modelo DeBERTa-v3-base de ProtectAI, fine-tuneado con datos sintéticos y reales para reducir los falsos positivos en preguntas legítimas de servicio al cliente y aumentar la tasa de detección de ataques camuflados. Con 184 millones de parámetros, es un modelo ligero diseñado para integrarse como guardrail en sistemas de IA generativa, especialmente en entornos donde se manejan conversaciones en vietnamita.

El problema que resuelve es el de proteger aplicaciones basadas en LLM frente a intentos de manipulación mediante instrucciones maliciosas ocultas en entradas de usuario. Su relevancia actual radica en el crecimiento de asistentes conversacionales en idiomas distintos del inglés, donde los modelos de detección existentes suelen fallar. El autor ha publicado el modelo con licencia MIT, lo que facilita su adopción comercial y su integración en herramientas como llm-guard.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base (transformador encoder) |
| Parametros totales | 184.423.682 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Vietnamita (vi), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura DeBERTa-v3-base, un transformer encoder con atención desenredada (disentangled attention) y máscara reemplazada (replaced token detection). El autor realizó un fine-tuning sobre el checkpoint `protectai/deberta-v3-base-prompt-injection-v2`, adaptándolo específicamente para el vietnamita y reduciendo los falsos positivos en contextos de servicio al cliente.

El entrenamiento combinó datos sintéticos (preguntas de atención al cliente con inyecciones camufladas en múltiples rondas), el conjunto real SIT-487 (preguntas de CSKH), diez técnicas de bypass avanzadas (ofuscación, roleplay, solicitud de traducción, truco de finalización), inyecciones standalone y benignas sin camuflaje, y datasets públicos como `llm-jailbreak-prompt-injection-dataset`, `synthetic-guardrail-dataset-v2` y `guardrails-dataset`. No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning supervisado estándar.

## Capacidades

- Clasificación binaria de texto para detectar inyección de prompts (etiquetas `SAFE` e `INJECTION`).
- Detección de ataques camuflados en vietnamita, incluyendo ofuscación, roleplay y trucos de finalización.
- Soporte multilingüe limitado a vietnamita e inglés, con mejor rendimiento en vietnamita.
- Integración directa con la librería `llm-guard` mediante el adaptador `PromptInjection`.
- Funciona como guardrail independiente o como componente en pipelines de moderación de entrada.
- Umbral de decisión recomendado de 0.5 para el score de probabilidad.

## Casos de uso

- Guardrail en chatbots de atención al cliente en vietnamita: el modelo filtra mensajes entrantes antes de pasarlos al LLM, bloqueando intentos de inyección sin rechazar consultas legítimas sobre seguros, facturas o reclamaciones.
- Protección de asistentes virtuales empresariales: integrado en un proxy de API, clasifica cada prompt y devuelve una respuesta predefinida si detecta inyección, evitando que el LLM ejecute instrucciones maliciosas.
- Moderación de entradas en aplicaciones de generación de código: detecta prompts que intentan forzar al modelo a ignorar restricciones de seguridad o a revelar información interna.
- Filtrado en sistemas de revisión de contenido generado por usuarios: clasifica comentarios o mensajes que contienen intentos de jailbreak antes de que lleguen a un modelo generativo.
- Auditoría de logs de conversaciones: permite analizar históricos de interacciones para identificar intentos de ataque y mejorar las políticas de seguridad.
- Componente en pipelines de RAG (generación aumentada por recuperación): evita que documentos o consultas maliciosas contaminen las respuestas del sistema.

## Benchmarks y rendimiento

El autor publicó en la model card los siguientes resultados comparando el modelo base (baseline) con el fine-tuneado:

| Métrica | Baseline | Fine-tuned |
|---|---|---|
| Tasa de falsos positivos (preguntas de seguro) | 41.0% | 0.0% |
| Tasa de verdaderos positivos (inyección vietnamita camuflada) | 96.7% | 100.0% |
| Tasa de verdaderos positivos (inyección en inglés) | 51.7% | 92.5% |
| Tasa de verdaderos positivos (inyección standalone sin camuflaje) | 92.5% | 100.0% |
| Tasa de falsos positivos (órdenes legítimas) | 92.5% | 0.0% |
| Prueba de humo (17 frases) | 9/17 | 17/17 |

Estos datos provienen de la model card del autor y no se han verificado de forma independiente. No se aportan métricas adicionales como MMLU o HumanEval al tratarse de un clasificador.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware.
- Con 184 millones de parámetros, el modelo es ligero: en FP32 ocupa aproximadamente 737 MB, en FP16 unos 369 MB y en int8 unos 185 MB.
- Puede ejecutarse en CPU con memoria RAM suficiente (mínimo 2 GB para FP32) y en GPUs con al menos 2 GB de VRAM para FP16.
- GPUs recomendadas: cualquier GPU moderna con soporte CUDA (p. ej., NVIDIA T4, RTX 3060 o superior) para inferencia en tiempo real.
- Opciones de despliegue: transformers pipeline, vLLM (aunque no está optimizado para clasificadores), ONNX Runtime, o integración directa con llm-guard.
- La latencia esperada es del orden de milisegundos por frase en GPU y de decenas de milisegundos en CPU, dependiendo de la longitud del texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Enfoque |
|---|---|---|---|---|---|
| dangvansam/vietnamese-prompt-injection | 184M | No disponible | vi, en | MIT | Fine-tune de DeBERTa-v3 para vi |
| protectai/deberta-v3-base-prompt-injection-v2 | 184M | No disponible | en (principal) | MIT | Modelo base original de ProtectAI |
| protectai/deberta-v3-base-prompt-injection | 184M | No disponible | en | MIT | Versión anterior de ProtectAI |

El modelo fine-tuneado mejora claramente al baseline en las métricas reportadas, especialmente en la reducción de falsos positivos (del 41% al 0% en preguntas de seguro) y en la detección de inyecciones en inglés (del 51.7% al 92.5%). No se dispone de comparaciones con otros clasificadores de inyección de prompts en vietnamita.

## Limitaciones y advertencias

- El modelo solo soporta vietnamita e inglés; no se ha entrenado para otros idiomas, por lo que su uso fuera de estos ámbitos puede producir resultados poco fiables.
- No es un modelo generativo: solo clasifica texto, por lo que no puede generar respuestas ni explicaciones.
- El umbral de 0.5 es una recomendación; en entornos de producción conviene ajustarlo según la tasa de falsos positivos/negativos aceptable.
- Los datos de entrenamiento incluyen técnicas de bypass específicas; ataques novedosos o muy sofisticados podrían no ser detectados.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos a los de entrenamiento (p. ej., servicios financieros o sanitarios).
- El tamaño del repositorio (8.1 GB) sugiere que se incluyen múltiples archivos de pesos o versiones; es recomendable revisar el contenido antes de desplegarlo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/dangvansam/vietnamese-prompt-injection)
- [Modelo base: protectai/deberta-v3-base-prompt-injection-v2](https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2)
- [Documentación de llm-guard](https://llm-guard.com) (para integración)
