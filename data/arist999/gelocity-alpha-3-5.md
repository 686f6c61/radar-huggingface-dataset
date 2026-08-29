# arist999/gelocity-alpha-3.5

## Resumen

Gelocity Alpha 3.5 es un asistente de codigo (AI coding assistant) desarrollado por el equipo Gelocity bajo el usuario arist999, construido desde cero con Python y PyTorch. El proyecto propone una arquitectura Transformer moderna que combina atencion por grupos de consultas (GQA), embeddings rotatorios (RoPE), normalizacion RMSNorm, activacion SwiGLU y un bloque de mezcla de expertos (MoE) con enrutamiento top-k, ademas de un fallback de FlashAttention para CPU.

En el estado actual, el modelo se encuentra en una fase muy temprana de desarrollo: solo se ha completado un smoke test de pre-entrenamiento con 0,04 millones de parametros, y el plan es escalar a un rango de 100M-1B de parametros. No se han publicado pesos entrenados ni checkpoints, y la propia model card indica que la generacion de texto esta pendiente de implementacion ("TODO: Implement generation after training"). Por tanto, no existe un modelo funcional descargable, sino una arquitectura propuesta y un pipeline de entrenamiento esbozado.

La relevancia de esta ficha es doble: por un lado, documenta un proyecto experimental de interes para quienes estudian la implementacion de transformers desde cero; por otro, sirve de advertencia para quienes busquen un modelo listo para usar, ya que este no cumple ese requisito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con GQA, RoPE, RMSNorm, SwiGLU, MoE top-k, FlashAttention CPU fallback |
| Parametros totales | 0,04M (smoke test); planeado 100M-1B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (sin pesos publicados) |
| Idiomas soportados | en, vi |
| Licencia | MIT |
| Formato de pesos | no disponible (sin checkpoint publicado) |

## Arquitectura y entrenamiento

La arquitectura declarada en la model card combina varias tecnicas establecidas: atencion por grupos de consultas (GQA) para reducir el coste de memoria en la inferencia, embeddings rotatorios (RoPE) para codificar posiciones relativas, normalizacion RMSNorm, activacion SwiGLU y un bloque de mezcla de expertos (MoE) con enrutamiento top-k. Tambien se menciona un fallback de FlashAttention para CPU, lo que indica un diseno pensado para entornos sin GPU.

El entrenamiento se encuentra en una fase inicial: se ha completado un smoke test de pre-entrenamiento con 0,04 millones de parametros, ejecutado en CPU con AVX2 y OpenMP. El roadmap del proyecto incluye escalar el entrenamiento a un rango de 100M-1B de parametros (requiere GPU NVIDIA), aplicar fine-tuning con RL (GRPO) y evaluar en tareas de codigo. No se han proporcionado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. El tokenizer BPE y el pipeline de datos estan implementados, pero no se ha publicado ningun detalle adicional.

## Capacidades

- El modelo esta disenado como asistente de codigo (coding assistant), segun los tags de la model card.
- No se ha demostrado ninguna capacidad funcional: el codigo de generacion esta marcado como "placeholder - needs training" y no hay pesos entrenados disponibles.
- No se ha verificado soporte para tool calling, agentes, razonamiento multi-paso ni ninguna otra capacidad avanzada.
- Los idiomas declarados en la metadata son ingles y vietnamita, aunque no hay evidencia de rendimiento real en ninguno de ellos.

## Casos de uso

No se pueden recomendar casos de uso reales para este modelo en su estado actual, ya que no existe una implementacion funcional ni pesos entrenados. Los unicos escenarios plausibles son:

- Proyecto educativo: estudiar la implementacion de una arquitectura Transformer moderna (GQA, RoPE, SwiGLU, MoE) en PyTorch, comparando el codigo con la teoria.
- Base para desarrollo: servir como punto de partida para investigadores que quieran construir un asistente de codigo desde cero, reutilizando el codigo del tokenizer BPE, el pipeline de datos o el bucle de entrenamiento.
- Prueba de concepto de entrenamiento en CPU: validar que el pipeline de entrenamiento funciona con recursos limitados antes de escalar a GPU.

Hasta que no se complete el entrenamiento y se publiquen checkpoints con evaluaciones, no es adecuado para ninguna tarea de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto esta en fase de smoke test y no ha llegado a la etapa de evaluacion en tareas de codigo (el roadmap lo tiene pendiente).

## Requisitos de hardware

- Entrenamiento actual: CPU con soporte AVX2 y OpenMP (smoke test completado).
- Entrenamiento a escala: se requiere GPU NVIDIA (sin especificar modelo concreto).
- Inferencia: no disponible, ya que no hay pesos ni implementacion de generacion.
- Despliegue: no se mencionan opciones como vLLM, llama.cpp u Ollama; el proyecto usa PyTorch directamente.

## Comparativa con modelos similares

No disponible. Este modelo no tiene pesos publicados ni resultados de evaluacion, por lo que no es comparable con asistentes de codigo funcionales como CodeLlama, StarCoder o DeepSeek-Coder. Cualquier comparacion seria especulativa y careceria de base empirica.

## Limitaciones y advertencias

- El modelo no esta entrenado: solo existe un smoke test con 0,04M de parametros, sin capacidad de generacion implementada.
- No hay pesos publicados ni checkpoint disponible para descarga.
- El codigo contiene tareas pendientes (TODO) en la generacion, por lo que no es utilizable ni siquiera en modo experimental.
- No se han evaluado sesgos, alucinaciones ni riesgos de seguridad, ya que no hay modelo final.
- La licencia MIT permite uso comercial, pero al no existir un modelo funcional, esta clausula es irrelevante en la practica.
- Los idiomas declarados (en, vi) son una indicacion de intencion, no un rendimiento verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arist999/gelocity-alpha-3.5
