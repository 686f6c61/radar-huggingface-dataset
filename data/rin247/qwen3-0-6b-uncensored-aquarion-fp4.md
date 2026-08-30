# Rin247/Qwen3-0.6B-Uncensored-Aquarion-FP4

## Resumen

El modelo `Rin247/Qwen3-0.6B-Uncensored-Aquarion-FP4` es una cuantización FP4 weight-only del modelo base `Qwen3-0.6B`, al que se ha aplicado una técnica de *abliteration* para eliminar la dirección de rechazo (refusal direction) y ofrecer así un modelo sin censura. Lo desarrolla el autor Rin247 como parte del proyecto *Genesis of Aquarion* forge. El objetivo principal es proporcionar una versión ligera y rápida de Qwen3-0.6B que pueda ejecutarse en entornos con recursos limitados, manteniendo un comportamiento "uncensored" que no bloquea contenido sensible.

La relevancia de este modelo radica en que Qwen3-0.6B es el miembro más pequeño de la familia Qwen3, que incorpora un modo de pensamiento (*thinking mode*) y un modo rápido (*non-thinking mode*) en un mismo marco unificado. Al estar cuantizado en FP4, el modelo ocupa aproximadamente 0,6 GB, lo que permite su uso en CPU o GPUs de baja gama. Sin embargo, la cuantización FP4 no es estándar y requiere un proceso de dequantización con las escalas almacenadas, lo que limita su compatibilidad con motores de inferencia convencionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 375.848.960 (según safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3-0.6B soporta 32K tokens según el informe técnico) |
| Tipos de cuantizacion | FP4 weight-only (safetensors; el tag menciona "8-bit", posiblemente un error) |
| Idiomas soportados | No disponible (el modelo base Qwen3 es multilingüe, pero no se especifica para esta versión) |
| Licencia | No disponible (el modelo base Qwen3-0.6B está bajo Apache 2.0, pero esta versión no lo declara) |
| Formato de pesos | safetensors con cuantización FP4 weight-only y buffers de escala (`*.weight_scale`, `*.weight_shape`) |

## Arquitectura y entrenamiento

El modelo base `Qwen3-0.6B` es un transformer denso de la familia Qwen3, que introduce un mecanismo de *thinking mode* y *non-thinking mode* controlado mediante un token especial `/think`. La arquitectura es estándar (capas de atención multi-cabeza, feed-forward, normalización RMSNorm) y soporta una ventana de contexto de 32K tokens en su versión original. No se dispone de detalles sobre el dataset de entrenamiento del modelo base en la información proporcionada.

El proceso de *abliteration* aplicado antes de la cuantización utiliza una proyección ortogonal sobre la dirección de rechazo aprendida del modelo, eliminando así los mecanismos de negativa ante solicitudes consideradas inapropiadas. Posteriormente, se realiza una cuantización RTN (*round-to-nearest*) en CPU, almacenando los pesos en FP4 junto con las escalas y formas correspondientes. No se especifica si se realizó fine-tuning adicional ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento básico heredados de Qwen3-0.6B, incluyendo matemáticas simples y comprensión lectora.
- Soporte de *thinking mode* y *non-thinking mode* (si la cuantización preserva el token `/think`; no confirmado en esta versión).
- Capacidad de *tool calling* y *function calling* heredada del modelo base, aunque no se verifica en la versión cuantizada.
- Comportamiento "uncensored" gracias a la abliteration, lo que permite responder a solicitudes que el modelo original rechazaría.
- Multilingüismo probable (el modelo base Qwen3 está entrenado en múltiples idiomas), aunque no se declara explícitamente.
- Inferencia eficiente en recursos limitados debido al reducido tamaño del modelo (0,6 GB en disco).

## Casos de uso

- Asistente local de chat sin restricciones: el modelo puede desplegarse en un ordenador personal o un dispositivo edge para mantener conversaciones abiertas sobre temas que otros modelos bloquean, gracias a su tamaño reducido y su comportamiento abliterated.
- Generación de texto creativo (historias, guiones, diálogos): su capacidad para no rechazar contenido sensible permite explorar narrativas adultas o controvertidas sin filtros, útil para escritores o creadores de contenido.
- Prototipado rápido de aplicaciones de IA en CPU: al pesar solo 0,6 GB, puede ejecutarse en un portátil sin GPU para validar ideas antes de migrar a modelos más grandes.
- Clasificación y extracción de entidades en entornos con restricciones de memoria: su pequeño tamaño permite integrarlo en pipelines de procesamiento de lenguaje natural en dispositivos IoT o sistemas embebidos.
- Educación sobre cuantización y abliteration: sirve como ejemplo práctico para estudiar cómo la cuantización FP4 y la proyección ortogonal afectan al comportamiento del modelo.
- Desarrollo de agentes simples con tool calling: si la cuantización preserva la capacidad de invocar herramientas, puede usarse para construir asistentes ligeros que consulten APIs o bases de datos en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para esta versión cuantizada. El modelo base Qwen3-0.6B tiene resultados publicados en el informe técnico de Qwen3, pero no se pueden extrapolar a esta cuantización FP4 sin verificación.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 0,6 GB, por lo que el modelo en memoria (con escalas y overhead) ocupará aproximadamente entre 0,6 y 0,8 GB. Puede ejecutarse en una GPU con 2 GB de VRAM o incluso en CPU con 4 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., GTX 1050 Ti, RTX 2060, RTX 3050). Para CPU, un procesador moderno con 8 GB de RAM es suficiente.
- Compatibilidad: la cuantización FP4 weight-only no es estándar en motores como llama.cpp u Ollama. Se requiere un motor que soporte la dequantización mediante las escalas almacenadas (por ejemplo, un runtime personalizado basado en PyTorch). No se mencionan opciones de despliegue específicas en la documentación.
- Latencia y throughput: no disponibles. Se espera una velocidad razonable en CPU dado el tamaño, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Rin247/Qwen3-0.6B-Uncensored-Aquarion-FP4 | 375M | No disponible (base: 32K) | FP4 weight-only | No disponible | Abliterated, cuantizado |
| huihui-ai/Qwen3-0.6B-abliterated | 375M | 32K (base) | Original (BF16) | Apache 2.0 (base) | Abliterated, sin cuantizar |
| nicoboss/Qwen3-14B-Uncensored | 14B | No disponible | Original | Apache 2.0 | Fine-tuned con dataset de uncensoring, mucho mayor |

Las alternativas principales son el modelo abliterated de huihui-ai (mismo tamaño, sin cuantizar, mayor precisión pero mayor footprint) y el modelo de nicoboss (14B, fine-tuned, más capaz pero mucho más pesado). La versión FP4 de Rin247 destaca por su tamaño reducido, pero la falta de licencia declarada y la compatibilidad limitada con motores de inferencia son desventajas importantes.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica bajo qué términos se distribuye este modelo, lo que impide su uso comercial sin riesgo legal.
- Pérdida de precisión: la cuantización FP4 weight-only introduce errores de redondeo que pueden degradar la calidad de las respuestas, especialmente en tareas de razonamiento complejo.
- Compatibilidad limitada: el formato FP4 con escalas almacenadas no es soportado por la mayoría de los motores de inferencia estándar, lo que dificulta su adopción práctica.
- Riesgo de contenido dañino: al ser abliterated, el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros, lo que lo hace inadecuado para aplicaciones en producción orientadas al público.
- Capacidad limitada: con solo 375M parámetros, el modelo tiene un rendimiento inferior en tareas de razonamiento, código y matemáticas en comparación con modelos más grandes.
- Sesgos no mitigados: no hay información sobre evaluación de sesgos; el proceso de abliteration no elimina sesgos subyacentes y puede amplificarlos.
- Ausencia de garantías: el autor no proporciona información sobre el rendimiento, la robustez ni la seguridad del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/Rin247/Qwen3-0.6B-Uncensored-Aquarion-FP4
- Informe técnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Guía completa de Qwen3: https://insiderllm.com/guides/qwen3-complete-guide/
- Repositorio GitHub de Qwen3: https://github.com/nexgen-adm/qwen3
- Modelo similar (abliterated sin cuantizar): https://huggingface.co/huihui-ai/Qwen3-0.6B-abliterated
- Modelo similar (uncensored 14B): https://huggingface.co/nicoboss/Qwen3-14B-Uncensored
