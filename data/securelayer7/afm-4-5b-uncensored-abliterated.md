# Securelayer7/AFM-4.5B-Uncensored-Abliterated

## Resumen

AFM-4.5B-Uncensored-Abliterated es una versión modificada del modelo AFM-4.5B de Arcee AI, desarrollada por Securelayer7, que elimina el comportamiento de rechazo (refusal) a nivel de pesos mediante una técnica de abliteración. El modelo base, fuertemente alineado con directrices de seguridad, rechazaba 92 de cada 100 sondas sobre temas potencialmente dañinos; esta versión reduce ese rechazo a 3 de cada 100, manteniendo una divergencia KL de 0.0200 respecto al original, lo que indica que las capacidades generales se preservan casi intactas.

Se trata de un modelo denso de 4.619 millones de parámetros (4.5B), basado en la arquitectura ArceeForCausalLM, con 36 capas. Está diseñado específicamente para investigación legítima de seguridad, red-teaming y pruebas de penetración, donde los modelos alineados suelen negarse a responder. La licencia es Apache 2.0 y el idioma principal es el inglés. Su relevancia actual radica en la creciente demanda de modelos sin restricciones para entornos controlados de ciberseguridad, donde se necesita explorar vectores de ataque y vulnerabilidades sin filtros artificiales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (ArceeForCausalLM) |
| Parametros totales | 4.619.189.760 (4.5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos en safetensors) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base AFM-4.5B es un transformer denso de 4.5 mil millones de parámetros, ajustado por instrucciones por Arcee AI para rendimiento empresarial en entornos de nube y edge. Según la información del modelo base, fue entrenado sobre un corpus de 8 billones de tokens, con 6.5 billones de preentrenamiento general y 1.5 billones de midtraining con enfoque mejorado. La versión abliterada no se ha reentrenado; en su lugar, se aplicó una técnica de abliteración de la dirección de rechazo utilizando la herramienta Heretic con optimización multiobjetivo Optuna TPE. El proceso consistió en identificar y eliminar la dirección de activación responsable del comportamiento de rechazo en las proyecciones de escritura residual (`o_proj` y `down_proj`) de las 36 capas del modelo, y fusionar los cambios directamente en los pesos. El resultado es un modelo fusionado completo, sin necesidad de adaptadores, con una reducción drástica de rechazos (de 92/100 a 3/100) y una divergencia KL mínima (0.0200) que confirma la preservación de las capacidades originales.

## Capacidades

- Generación de texto en inglés con razonamiento conversacional.
- Respuesta directa a preguntas sobre temas sensibles o controvertidos, sin filtros de seguridad a nivel de pesos.
- Orientado a tareas de ciberseguridad, red-teaming y análisis de vulnerabilidades.
- Capacidad de razonamiento multi-paso para escenarios complejos de seguridad.
- Compatible con el pipeline de transformers para generación de texto.
- Modelo denso de 4.5B, adecuado para despliegue en entornos con recursos moderados.

## Casos de uso

- Red-teaming y pruebas de penetración: el modelo puede simular ataques y explorar vectores de explotación sin rechazar preguntas sobre técnicas ofensivas, lo que permite a los equipos de seguridad evaluar sus defensas de forma realista.
- Investigación en ciberseguridad: análisis de malware, ingeniería social o vulnerabilidades de protocolos, donde los modelos alineados suelen negarse a proporcionar información detallada.
- Generación de datos sintéticos para evaluaciones de seguridad: creación de conjuntos de datos con contenido sensible o controvertido para entrenar clasificadores o sistemas de moderación.
- Pruebas de robustez de sistemas de IA: evaluación de cómo los modelos responden a entradas maliciosas o adversarias, sin la interferencia de capas de rechazo.
- Entrenamiento de modelos de seguridad: uso como generador de ejemplos negativos para sistemas de detección de contenido dañino.
- Simulación de adversarios en entornos controlados: generación de conversaciones o textos que imiten comportamientos maliciosos para probar sistemas de defensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la reducción de rechazos (de 92/100 a 3/100) y la divergencia KL de 0.0200 respecto al modelo base, lo que sugiere que las capacidades de razonamiento y factualidad se mantienen, pero no hay datos cuantitativos de MMLU, HumanEval u otros estándares.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9.2 GB (4.6B parámetros × 2 bytes), más overhead de activaciones y atención. Cabe en GPUs con 12 GB o más, como RTX 3060, RTX 4070, o A10.
- Para cuantización de 4 bits (GGUF, no proporcionada oficialmente), se estima un uso de VRAM de 3-4 GB, lo que permitiría ejecución en GPUs de 6 GB como RTX 2060 o incluso en CPU con suficiente RAM.
- GPU recomendadas: RTX 3090/4090, A100, H100 para inferencia con contexto largo o batch grande.
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con vLLM, llama.cpp (si se convierte a GGUF), Ollama, y TGI. No se proporcionan configuraciones específicas.
- Latencia y throughput: no disponibles. Para un modelo de 4.5B en una GPU moderna, se espera una latencia de decodificación de 20-50 ms por token y un throughput de 50-100 tokens/s en batch pequeño, pero estos valores son estimaciones generales.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos abliterados de tamaño similar en la documentación proporcionada. El modelo base AFM-4.5B es comparable a otros modelos de 4.5B como Qwen2.5-4B o Llama-3.2-3B, pero no hay datos de rendimiento específicos para esta variante abliterada.

## Limitaciones y advertencias

- El modelo no incluye guardas de seguridad a nivel de pesos; el operador es responsable de implementar filtros de contenido en la capa de servicio para bloquear contenido ilegal (como CSAM) y garantizar un uso conforme a la ley.
- Puede generar contenido dañino, ofensivo o peligroso si se utiliza sin supervisión o en contextos no autorizados.
- La abliteración puede degradar ligeramente el rendimiento en tareas que requieren adherencia a políticas de seguridad, aunque la KL baja sugiere un impacto mínimo.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- No se han publicado benchmarks estándar, por lo que el rendimiento en tareas generales no está verificado.
- El modelo fue creado en agosto de 2026 y tiene cero descargas y cero likes en HuggingFace, lo que indica que no ha sido ampliamente probado por la comunidad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Securelayer7/AFM-4.5B-Uncensored-Abliterated)
- [Modelo base AFM-4.5B](https://huggingface.co/arcee-ai/AFM-4.5B)
- [Modelo base AFM-4.5B-Base](https://huggingface.co/arcee-ai/AFM-4.5B-Base)
- [Heretic (herramienta de abliteración)](https://github.com/p-e-w/heretic)
- [Guía de modelos abliterados 2026](https://locallyuncensored.com/blog/abliterated-models-guide.html)
