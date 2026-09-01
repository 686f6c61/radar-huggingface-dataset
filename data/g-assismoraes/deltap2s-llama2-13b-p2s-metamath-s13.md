# g-assismoraes/DeltaP2S-Llama2-13B-P2S-MetaMath-S13

## Resumen

El modelo DeltaP2S-Llama2-13B-P2S-MetaMath-S13 es un checkpoint fusionado producido por el paquete experimental independiente Delta-P2S, desarrollado por el usuario g-assismoraes. Se basa en la arquitectura Llama 2 de 13B parámetros y ha sido entrenado sobre el conjunto de datos MetaMath, especializado en razonamiento matemático. El nombre "P2S" hace referencia a la técnica "Pen2Sword" (pluma a espada), que forma parte del enfoque Delta-P2S para la fusión de modelos.

El modelo se presenta como un experimento de investigación más que como un producto listo para producción. Su relevancia radica en explorar metodologías de fusión de checkpoints (merging) aplicadas a modelos de lenguaje de gran tamaño, específicamente en el dominio matemático. Al estar basado en Llama 2 13B, hereda las capacidades generales de generación de texto y razonamiento de dicha arquitectura, pero con un ajuste fino orientado a problemas matemáticos.

La información pública disponible es muy limitada: no se especifican detalles de entrenamiento, datos de evaluación ni licencia. El repositorio contiene únicamente los pesos en formato safetensors (26 GB) y una model card mínima. Esto lo convierte en un artefacto de investigación cuyo valor principal es metodológico, más que práctico para despliegues inmediatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 2 (transformer decoder, 13B) |
| Parametros totales | 13.015.864.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2, típicamente 4096) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles (heredados de Llama 2, principalmente inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 2 de 13B parámetros, un transformer decoder autoregresivo con normalización RMSNorm, activación SwiGLU y atención con RoPE (Rotary Position Embeddings). No se dispone de información sobre modificaciones arquitectónicas específicas; el nombre "Delta-P2S" sugiere que se trata de un checkpoint resultante de un proceso de fusión (merge) de modelos, posiblemente combinando pesos de un modelo base Llama 2 con un modelo ajustado en MetaMath.

El entrenamiento se realizó sobre el conjunto de datos MetaMath, que contiene problemas matemáticos con razonamiento paso a paso. La ruta de entrenamiento indicada (`./runs/metamath_llama_SameFormula-S13/train/p2s`) sugiere que se utilizó una fórmula de fusión específica ("SameFormula") en la iteración S13. No hay información pública sobre el número de tokens de entrenamiento, el proceso de alineación (RLHF/DPO) ni otras técnicas de optimización. La técnica "Pen2Sword" (P2S) parece ser un método propietario del autor para la fusión de modelos, pero no se documenta en la model card.

## Capacidades

- Generación de texto autoregresiva: al estar basado en Llama 2 13B, puede generar texto coherente en inglés y otros idiomas (aunque no se especifica).
- Razonamiento matemático: el ajuste con MetaMath debería mejorar la capacidad de resolver problemas aritméticos, algebraicos y de razonamiento lógico-matemático.
- Razonamiento de varios pasos: los datos de MetaMath incluyen cadenas de razonamiento, por lo que el modelo puede producir explicaciones paso a paso.
- No se documentan capacidades de tool calling, function calling, agentes, visión o audio. Tampoco se menciona un modo de pensamiento explícito.

## Casos de uso

- Investigación en fusión de modelos: el checkpoint sirve como referencia para estudiar el impacto de la técnica Delta-P2S en el rendimiento matemático. Un investigador podría comparar este modelo con otros checkpoints del mismo experimento (p. ej., variantes con CodeLlama) para analizar la transferencia de conocimiento.
- Evaluación de razonamiento matemático: se puede utilizar en benchmarks como GSM8K o MATH para medir la eficacia del ajuste con MetaMath, aunque no se han publicado resultados oficiales.
- Generación de explicaciones matemáticas: el modelo puede producir soluciones detalladas a problemas de nivel escolar o universitario, útil para tutorías automáticas o generación de material didáctico.
- Fine-tuning posterior: al ser un checkpoint intermedio, puede servir como punto de partida para ajustes adicionales en dominios específicos, aprovechando la fusión ya realizada.
- Comparación de arquitecturas: dado que existen variantes con CodeLlama 7B como base, se puede estudiar cómo la elección del modelo base afecta al rendimiento tras la fusión.
- Reproducibilidad experimental: el repositorio permite reproducir el proceso de fusión y verificar los resultados, contribuyendo a la transparencia en la investigación de merging de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El autor no proporciona métricas de rendimiento en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 13B parámetros en precisión FP16, se necesitan aproximadamente 26 GB de VRAM para cargar los pesos completos. Con cuantización a 8 bits se reduciría a ~13 GB, y a 4 bits a ~7 GB, pero no se ofrecen versiones cuantizadas en el repositorio.
- GPU recomendadas: una NVIDIA A100 (40 GB) o RTX 4090 (24 GB) pueden ejecutar el modelo en FP16. GPUs con 16 GB (como RTX 4080 o A10G) requerirían cuantización.
- En consumer GPU: es posible ejecutarlo en una RTX 3090/4090 con cuantización 4-bit, pero no se proporcionan archivos GGUF ni AWQ.
- Opciones de despliegue: al ser un modelo de transformers estándar, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay integraciones preconfiguradas.
- Latencia y throughput: no disponibles. Dependerán del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeltaP2S-Llama2-13B-P2S-MetaMath-S13 | 13B | no disponible | no disponible | HuggingFace (safetensors) |
| Llama-2-13B (base) | 13B | 4096 | Llama 2 Community License | HuggingFace |
| MetaMath-Llama-2-13B | 13B | 4096 | Llama 2 Community License | HuggingFace |

No se dispone de datos de rendimiento comparativo. El modelo DeltaP2S se diferencia de MetaMath-Llama-2-13B por el proceso de fusión adicional (P2S), pero sin métricas no es posible evaluar si mejora o empeora el rendimiento. La licencia del modelo DeltaP2S no está especificada, lo que limita su uso comercial.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Llama 2, puede heredar sesgos de género, raza y religión presentes en los datos de preentrenamiento. No se ha realizado ninguna evaluación de sesgos específica.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en problemas matemáticos complejos. No se ha verificado su fiabilidad en producción.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero se asume la de Llama 2 (4096 tokens). Para problemas matemáticos largos, podría ser insuficiente.
- Limitaciones de idioma: no se documentan idiomas soportados; probablemente el modelo funciona mejor en inglés, ya que MetaMath está principalmente en inglés.
- Restricciones de licencia: la licencia no está disponible, lo que impide su uso comercial sin aclaración legal. Se recomienda contactar al autor antes de cualquier uso productivo.
- Caveat de producción: es un checkpoint experimental, no un modelo pulido. No se ha probado en entornos reales y carece de documentación sobre fallos conocidos o limitaciones específicas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/g-assismoraes/DeltaP2S-Llama2-13B-P2S-MetaMath-S13
- Modelo relacionado (variante con CodeLlama): https://huggingface.co/g-assismoraes/DeltaP2S-Llama2-13B-P2S-CodeLlama7B
- Variante cuantizada (QV): https://huggingface.co/g-assismoraes/DeltaP2S-Llama2-13B-P2S-CodeLlama7B-SameFormula-S13-QV
- Página de despliegue en FriendliAI: https://friendli.ai/models/g-assismoraes/DeltaP2S-Llama2-13B-P2S-CodeLlama7B-SameFormula-S13-QV
- Información sobre Llama-2 13B-chat (referencia): https://www.emergentmind.com/topics/llama-2-13b-chat-model
- Modelos MetaMath (referencia): https://deepwiki.com/meta-math/MetaMath/7-models
