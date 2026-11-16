# MK4-Research/Mizar-3.0-27B-Abliterated-GGUF

## Resumen

Mizar 3.0 27B Abliterated es un ajuste fino (fine-tune) de Qwen3.8-27B desarrollado por MK4-Research, orientado a razonamiento agéntico persistente y uso de herramientas con un énfasis explícito en la honestidad: el modelo está entrenado para no fabricar éxitos, matizar afirmaciones que no puede verificar y seguir trabajando en una tarea difícil en lugar de declarar un "hecho" falso. Es el hermano agéntico de Alkus 3.1 (razonamiento puro), y ambos parten de una base Qwen3.8-27B sometida a abliteración (eliminación de direcciones de rechazo en el espacio de activaciones).

El modelo tiene 26.895.998.464 parámetros (~26,9 mil millones) y se distribuye únicamente en formato GGUF cuantizado Q4_K_M (~15,8 GB), lo que lo hace desplegable en hardware de consumo de gama alta. Declara una ventana de contexto de hasta 131.072 tokens y un registro de razonamiento compacto y telegráfico con autoverificación explícita.

Es relevante ahora porque aborda un problema práctico de los flujos agénticos en producción: la tendencia de los modelos a alucinar éxito en tareas de múltiples pasos. Mizar 3.0 se posiciona como un modelo de investigación para evaluar si un ajuste fino específico puede mejorar la calibración y la persistencia en entornos con herramientas, a costa de un perfil de uso muy concreto y sin garantías de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles internos no disponibles) |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 131.072 tokens |
| Tipos de cuantización | GGUF Q4_K_M (~15,8 GB); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, una base de tipo transformer denso (no se declara arquitectura MoE ni híbrida), que ha sido previamente abliterada. Sobre esa base se aplicó un ajuste fino con QLoRA de rango 16 y alpha 32 durante 1 época. El objetivo declarado del entrenamiento es reforzar el comportamiento agéntico honesto: resistencia a la presión en el uso de herramientas, rechazo a fabricar resultados, matización de afirmaciones no verificables y persistencia ante tareas difíciles.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El registro de salida se describe como razonamiento compacto y telegráfico con autoverificación explícita, lo que sugiere un estilo de cadena de pensamiento breve orientado a la comprobación de pasos. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos con autoverificación explícita.
- Uso de herramientas (tool calling / function calling) en flujos agénticos, con énfasis en no declarar éxito sin evidencia.
- Comportamiento de honestidad calibrada: matizar afirmaciones no verificables y responder "no puedo verificar eso" cuando corresponde.
- Persistencia en tareas difíciles en lugar de abandonar con un "hecho" falso.
- Verificación de código dentro de flujos agénticos (según el uso previsto declarado).
- Conversación multi-turno (tag `conversational`) con contexto largo de hasta 131.072 tokens.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se declaran capacidades de visión, audio ni modo "thinking" separado más allá del razonamiento descrito.

## Casos de uso

- Asistente de investigación para razonamiento multi-step: el modelo puede encadenar pasos de análisis con autoverificación y un contexto de 131.072 tokens, adecuado para revisar documentos o trazas largas sin perder el hilo.
- Verificación de código en pipelines agénticos: integrándolo como agente que ejecuta pruebas y reporta resultados, su énfasis en no fabricar éxito reduce el riesgo de que marque una tarea como completada sin haberla validado.
- Flujos de tool use con herramientas externas: al estar entrenado para resistir la presión del uso de herramientas, encaja en entornos donde el agente debe llamar APIs y reportar fielmente fallos o resultados parciales.
- Evaluación de calibración y honestidad: útil como modelo de investigación para estudiar comportamiento de abstención y hedging frente a modelos que alucinan con confianza.
- Automatización de tareas de análisis prolongadas: su persistencia ante tareas difíciles lo hace apto para trabajos de varios pasos donde un modelo estándar abandonaría prematuramente.
- Despliegue local en estación de trabajo: al distribuirse en GGUF Q4_K_M (~15,8 GB), puede ejecutarse en una GPU de consumo de gama alta para prototipado e investigación sin infraestructura de servidor.
- Revisión asistida de documentación técnica: con contexto largo, puede cotejar fragmentos extensos y señalar inconsistencias, matizando lo que no puede confirmar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~15,8 GB de pesos en Q4_K_M, más overhead de caché KV; con caché KV en Q8_0 y contexto largo, el consumo crece de forma significativa.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o superior es el mínimo razonable para Q4_K_M con contexto moderado; A100/H100 para contextos largos o mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más para Q4_K_M; en 16 GB no cabe con holgura.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp y Ollama; el autor recomienda Flash Attention activado, caché K/V en Q8_0 y un máximo de 1 petición concurrente. vLLM y TGI no se mencionan para este formato.
- Latencia y throughput: no disponibles; la recomendación de 1 petición concurrente sugiere un perfil de uso individual más que de servidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Mizar 3.0 27B Abliterated | ~26,9 B | 131.072 | GGUF Q4_K_M | Apache 2.0 | Fine-tune agéntico con énfasis en honestidad; sin benchmarks publicados |
| Qwen3.8-27B (base) | ~27 B | no disponible | safetensors y otros | no disponible | Modelo base del que deriva; sin datos de rendimiento en esta ficha |
| Alkus 3.1 | no disponible | no disponible | no disponible | no disponible | Hermano de razonamiento puro del mismo autor, misma base abliterada |

No se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que no está pensado para producción sin revisión humana.
- Puede producir detalles confiados pero incorrectos sobre hechos que no puede verificar desde el contexto (constantes numéricas, hashes de commit, nombres de API).
- Verificar contra fuentes primarias cualquier dato sensible a seguridad o factual.
- La abliteración altera el comportamiento de rechazo de la base; puede afectar a la moderación y a respuestas ante contenido sensible.
- Idiomas soportados no declarados: no se garantiza cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de garantías del autor desaconseja su uso en producción sin evaluación propia.
- Recomendación de 1 petición concurrente: no orientado a servir cargas concurrentes altas.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/MK4-Research/Mizar-3.0-27B-Abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
