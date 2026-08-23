# BeaverAI/Betta-30B-v1a-GGUF

## Resumen

Betta-30B-v1a es un modelo de lenguaje conversacional desarrollado por BeaverAI, un colectivo de entusiastas del finetuning que opera en el ecosistema de KoboldAI. El modelo se distribuye exclusivamente en formato GGUF, lo que indica que está orientado al despliegue local en CPU y GPU de consumo mediante motores como llama.cpp u Ollama. El nombre "Betta" sugiere una línea de modelos propios de BeaverAI, que también publica otros modelos como Sophon-30B-A3B-v1a, apuntando a una familia de modelos de 30.000 millones de parámetros.

La información pública disponible es extremadamente limitada: la model card solo contiene la frase "muse glimmer", sin especificaciones técnicas, licencia, datos de entrenamiento ni benchmarks. Los parámetros totales declarados son 27.854.794.240, lo que corresponde a un modelo denso de aproximadamente 28B parámetros (no MoE, a diferencia de Sophon-30B-A3B). El repositorio pesa 113.6 GB, consistente con múltiples cuantizaciones GGUF. Dado que el autor lo etiqueta como "conversational" y el grupo tiene presencia en el leaderboard de modelos sin censura (Unrestricted AI), es probable que Betta-30B esté optimizado para diálogo abierto y creativo, aunque no se puede confirmar sin datos oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.854.794.240 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, tamano del repo 113.6 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo. El nombre "Betta-30B-v1a" sugiere un modelo denso de aproximadamente 30.000 millones de parámetros, pero no se especifica si es un finetune de un modelo base existente (por ejemplo, Qwen, Mistral o Llama) o un entrenamiento desde cero. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados ni las técnicas de alineación aplicadas (RLHF, DPO, etc.). La etiqueta "conversational" y la asociación del grupo con KoboldAI y el leaderboard de modelos sin censura indican que el entrenamiento pudo haber priorizado la generación de diálogo creativo y sin restricciones, pero esta es una inferencia basada en la reputación del autor, no en documentación verificable.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational", lo que indica que está optimizado para mantener diálogos multi-turno.
- Soporte de tool calling: no disponible (sin confirmación).
- Soporte de agentes y multi-step reasoning: no disponible (sin confirmación).
- Capacidades multilingües: no disponible (sin confirmación).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- El modelo se distribuye en formato GGUF, lo que garantiza compatibilidad con motores de inferencia local como llama.cpp, Ollama y KoboldCpp.

## Casos de uso

Dado que no hay información oficial sobre capacidades específicas, los casos de uso se deducen del formato y la etiqueta del modelo. Son hipótesis razonables, no funcionalidades confirmadas:

- **Chat local privado**: al ser un GGUF de 30B, puede desplegarse en una GPU de consumo (RTX 3090/4090) con cuantización Q4, permitiendo conversaciones sin conexión ni envío de datos a servidores externos.
- **Rol en juegos y escritura creativa**: el origen del modelo en la comunidad de KoboldAI sugiere que podría ser adecuado para juegos de rol, escritura de ficción y generación de narrativa interactiva, aunque no hay evidencia de que supere a otros modelos de su tamaño en esta tarea.
- **Experimentación con GGUF**: útil para desarrolladores que quieren probar un modelo de 30B en local y evaluar su comportamiento sin depender de APIs comerciales.
- **Búsqueda de modelos sin censura**: si el modelo pertenece a la categoría "uncensored" de BeaverAI, podría interesar a quienes desarrollan aplicaciones de escritura libre, aunque esto no está confirmado.
- **Aplicaciones de baja latencia**: con cuantización Q4, un modelo de 28B puede alcanzar velocidades de 20-40 tokens/s en una RTX 4090, adecuado para asistentes conversacionales interactivos.
- **Pruebas de compatibilidad**: el formato GGUF permite integrarlo en pipelines de llama.cpp, llama-cpp-python o text-generation-webui, útil para evaluar el modelo en distintos entornos sin cambiar de framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ningún otro test estandarizado. Tampoco se han publicado comparativas con modelos similares. Cualquier afirmación sobre el rendimiento del modelo es especulativa.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para un modelo de ~28B en GGUF, las cuantizaciones típicas son:
  - Q4_K_M: ~17-18 GB de VRAM (cabe en RTX 4090 24 GB, RTX 3090 24 GB, A6000 48 GB).
  - Q5_K_M: ~20-21 GB de VRAM (necesita 24 GB o más).
  - Q8_0: ~29-30 GB de VRAM (requiere GPU profesional o 2×24 GB).
- **GPU recomendadas**: RTX 3090/4090 (24 GB) para Q4/Q5; A100 40 GB o H100 para cuantizaciones mayores. En CPU sola, se puede ejecutar con 32 GB de RAM para Q4, pero con baja velocidad.
- **Si cabe en consumer GPU**: sí, en cuantización Q4 o Q5 cabe en una RTX 3090 o RTX 4090.
- **Opciones de despliegue**: llama.cpp, Ollama, KoboldCpp, text-generation-webui, vLLM (con conversión a safetensors).
- **Latencia y throughput estimados**: no hay datos oficiales. Para un modelo de 28B en Q4 en una RTX 4090, la velocidad esperada es de ~30-50 tokens/s con batch de 1. En CPU (por ejemplo, 8 núcleos con AVX2), la velocidad es de ~5-10 tokens/s.

## Comparativa con modelos similares

No hay datos oficiales de rendimiento para Betta-30B-v1a, por lo que la comparación se limita a características generales. Modelos comparables en tamaño (28-30B) y formato GGUF:

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Betta-30B-v1a | 27.85B | desconocida | desconocido | desconocida | GGUF |
| Qwen2.5-32B | 32B | dense transformer | 128K | Apache 2.0 | GGUF, safetensors |
| Mistral-7B (no comparable por tamaño, pero común) | 7B | dense | 32K | Apache 2.0 | GGUF, safetensors |
| Sophon-30B-A3B-v1a | 30B | MoE (3B activos) | desconocido | desconocida | GGUF |

La comparación directa no es posible sin benchmarks. Betta-30B-v1a destaca por su formato GGUF y su origen comunitario, pero carece de documentación técnica y resultados medidos. Modelos como Qwen2.5-32B ofrecen especificaciones claras y rendimiento verificado, lo que los hace más predecibles para producción.

## Limitaciones y advertencias

- **Sesgos conocidos**: no hay información sobre sesgos o mitigaciones. Al ser un finetune de la comunidad, es probable que herede sesgos del modelo base y de los datos de entrenamiento, pero no se puede confirmar.
- **Riesgo de alucinación**: sin datos de entrenamiento ni benchmarks, el riesgo de alucinación no se puede evaluar. Modelos de finetune conversacionales suelen priorizar fluidez sobre veracidad.
- **Limitaciones de contexto**: se desconoce la longitud de contexto; si es típica de modelos de 30B (4K-32K), puede no ser adecuado para documentos largos.
- **Restricciones de licencia**: la licencia es "no disponible", lo que implica que el uso comercial no está garantizado. Antes de usar el modelo en producción, es necesario contactar al autor o revisar los archivos del repositorio.
- **Caveat de producción**: la ausencia de model card técnica, benchmarks y licencia clara hace que este modelo no sea recomendable para aplicaciones críticas o comerciales sin una evaluación previa exhaustiva.
- **Origen de los pesos**: el modelo proviene de un grupo de finetuning de KoboldAI; no hay garantía de que el dataset de entrenamiento sea seguro o ético, ni de que no contenga información personal o sesgada.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/BeaverAI/Betta-30B-v1a-GGUF)
- [Perfil de BeaverAI en HuggingFace](https://huggingface.co/BeaverAI/models)
- [Modelo hermano Sophon-30B-A3B-v1a-GGUF](https://huggingface.co/BeaverAI/Sophon-30B-A3B-v1a-GGUF)
- [Unrestricted AI Leaderboard](https://unrestricted.ai/)
- [ModelFitCheck - herramienta de compatibilidad VRAM](https://modelfitcheck.com/)
