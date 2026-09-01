# promotion/Llama-3.1-8B-TLDR-MOPO

## Resumen

Llama-3.1-8B-TLDR-MOPO es un modelo de lenguaje ajustado por el usuario "promotion" a partir de `meta-llama/Llama-3.1-8B-Instruct`, orientado a la investigación en alineación multi-objetivo. Aplica la técnica MOPO (Multi-Objective Preference Optimization) con un parámetro tau de 0.1 sobre el panel de tareas TL;DR, donde cada objetivo (cobertura, fidelidad, concisión, utilidad) se puntúa mediante un oráculo de preferencias basado en `Qwen3-32B` y se agrega con una regla específica. El modelo se entrena con un presupuesto de 300 pasos y comparte el mismo pool de respuestas y optimizador que otros brazos del panel, de modo que las diferencias entre brazos se atribuyen únicamente a la regla de agregación.

Con 8.030 millones de parámetros, este modelo no introduce una arquitectura nueva, sino que explora cómo distintas agregaciones de objetivos afectan al comportamiento del modelo base. Los resultados reportados muestran mejoras en cobertura y utilidad frente a la política de referencia, aunque con una ligera pérdida en concisión. Es relevante para quienes investigan métodos de alineación multi-objetivo y prefieren un punto de comparación reproducible sobre un modelo base conocido.

La licencia es la Llama 3.1 Community License, lo que permite uso comercial bajo sus términos. El repositorio solo contiene pesos en formato safetensors (32,1 GB), sin pipeline definido ni información sobre idiomas soportados más allá de lo heredado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Llama-3.1-8B-Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128k tokens) |
| Tipos de cuantizacion | no disponible (repo en F32 safetensors) |
| Idiomas soportados | no disponibles (hereda los del modelo base, no especificados) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `meta-llama/Llama-3.1-8B-Instruct`, que a su vez es un transformer denso con Grouped Query Attention y SwiGLU, tal como la familia Llama 3.1. No se modifican los pesos estructurales; el ajuste se realiza mediante MOPO, una variante de optimización de preferencias multi-objetivo. El entrenamiento utiliza un oráculo de preferencias `Qwen3-32B` que puntúa cada par de respuestas en ambos órdenes de presentación y promedia los resultados (swap-averaging) para reducir sesgos posicionales. El panel TL;DR comparte un pool de respuestas, un optimizador y un presupuesto de 300 pasos; cada brazo difiere solo en cómo agrega los objetivos. En este caso, tau = 0.1 define la temperatura del operador de agregación.

No se proporcionan detalles sobre el dataset de entrenamiento más allá de que corresponde al panel TL;DR, ni sobre el número de tokens o composición del corpus. Tampoco se indica si hubo etapas de RLHF o DPO adicionales; la técnica MOPO es en sí misma un método de optimización de preferencias, por lo que se asume que el entrenamiento se centró en alinear el modelo con los objetivos ponderados.

## Capacidades

- Generación de texto e instrucciones: al partir de Llama-3.1-8B-Instruct, conserva las capacidades generales del modelo base para completar texto, seguir instrucciones y mantener conversaciones multi-turno.
- Razonamiento y matemáticas: hereda las habilidades del modelo base, aunque no hay benchmarks específicos que verifiquen su rendimiento en estas tareas tras el ajuste.
- Alineación multi-objetivo: está optimizado para equilibrar cobertura, fidelidad, concisión y utilidad en resúmenes de texto largo (tipo TL;DR), con mejoras medibles en cobertura y utilidad frente a la referencia.
- Evaluación de preferencias: el entrenamiento con un oráculo de preferencias externo sugiere sensibilidad a la calidad subjetiva de las respuestas, aunque no se documenta soporte explícito para tool calling o agentes.
- Multilingüismo: no se especifica, pero el modelo base Llama 3.1 soporta ocho idiomas; este fine-tune no declara restricciones adicionales.
- No se indica soporte para visión, audio ni modos de razonamiento especiales.

## Casos de uso

- Investigación en alineación multi-objetivo: el modelo sirve como brazo de referencia en paneles comparativos para estudiar cómo distintas reglas de agregación (mínimo, promedio, tau) afectan al equilibrio entre objetivos. Se puede usar para reproducir los resultados del paper o como punto de partida para nuevos experimentos.
- Generación de resúmenes extractivos y abstractivos: dado su entrenamiento en TL;DR, es adecuado para resumir documentos largos priorizando cobertura y utilidad, aunque con cierta pérdida de concisión.
- Evaluación de políticas de preferencias: puede emplearse como generador de respuestas en pipelines de evaluación donde un oráculo externo puntúa calidad, permitiendo comparar métodos de alineación.
- Fine-tuning posterior: al ser un modelo abierto con pesos safetensors, puede servir como base para ajustes adicionales en tareas específicas de resumen o diálogo, aprovechando su alineación previa.
- Benchmarking de técnicas de optimización: investigadores pueden contrastar MOPO con otros métodos (p. ej., NBPO, DPO) usando el mismo panel y métricas, gracias a que el repositorio incluye generaciones de benchmark para brazos UltraFeedback.
- Entornos educativos: útil para demostrar conceptos de alineación multi-objetivo y optimización de preferencias en cursos avanzados de PLN, dado su tamaño manejable y licencia permisiva.

## Benchmarks y rendimiento

La model card reporta el excedente sobre la política de referencia en 100 prompts del panel TL;DR, con la población escalada como \(A_k = P_k - 1/2\). Los resultados son:

| Objetivo | Excedente |
|---|---|
| Cobertura | +0,1220 |
| Fidelidad | +0,0179 |
| Concisión | -0,0014 |
| Utilidad | +0,1031 |
| **Mínimo** | **-0,0014** |
| **Promedio** | **+0,0604** |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El model card menciona que los intervalos bootstrap y las pruebas de significación emparejadas están en el apéndice del paper, y que las generaciones de benchmark para los brazos UltraFeedback están en un dataset separado.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en F32 (32,1 GB), se necesitan al menos 32 GB de VRAM para cargar el modelo completo. Con cuantización a 8 bits (~8 GB) o 4 bits (~4 GB) podría caber en GPUs consumer, pero no se ofrecen versiones cuantizadas en el repositorio.
- GPU recomendadas: para F32, una A100 40GB o 80GB, o una RTX 4090 24GB no sería suficiente sin cuantizar. Para cuantización 8 bits, una RTX 3090/4090 de 24 GB sería viable; para 4 bits, una RTX 3060 12 GB podría funcionar con limitaciones.
- Opciones de despliegue: al ser un modelo estándar de Llama, es compatible con vLLM, llama.cpp, Ollama y TGI, siempre que se cuantice o se disponga de VRAM suficiente. No se incluyen archivos GGUF en el repo.
- Latencia y throughput: no se proporcionan datos. Como referencia, un Llama-3.1-8B en F32 con vLLM en A100 suele alcanzar decenas de tokens por segundo; la latencia exacta dependerá del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| promotion/Llama-3.1-8B-TLDR-MOPO | 8B | no disponible (base 128k) | llama3.1 | MOPO multi-objetivo |
| promotion/Llama-3.1-8B-TLDR-NBPO | 8B | no disponible | llama3.1 | NBPO (otra agregación) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | llama3.1 | Instruct base, sin ajuste multi-objetivo |

Los tres modelos comparten arquitectura y tamaño; la diferencia radica en el método de alineación. El MOPO reporta excedentes positivos en cobertura y utilidad, mientras que el NBPO (según su model card) no alcanza racionalidad individual bajo Llama-3.3-70B, lo que sugiere que la elección de la regla de agregación afecta significativamente al comportamiento. No hay datos de benchmarks estándar para comparar directamente.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para producción; su rendimiento en tareas generales puede ser inferior al del modelo base si la alineación multi-objetivo introduce sesgos hacia el dominio TL;DR.
- Sesgos del modelo base: hereda los sesgos de Llama-3.1-8B-Instruct, incluyendo posibles estereotipos y respuestas no deseadas en contextos sensibles.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de resumen donde la cobertura se prioriza sobre la precisión factual.
- Limitaciones de idioma: no se especifican idiomas; si el fine-tune se realizó solo en inglés (probable por el panel TL;DR), el rendimiento en otros idiomas puede degradarse.
- Restricciones de licencia: la Llama 3.1 Community License permite uso comercial, pero exige atribución y tiene cláusulas sobre usuarios con más de 700 millones de usuarios mensuales. Revisar los términos completos.
- Dependencia del oráculo: los resultados dependen del oráculo `Qwen3-32B`; cambios en ese oráculo podrían alterar las conclusiones, como se advierte en el modelo hermano NBPO.
- Sin soporte técnico: el autor no ofrece garantías ni mantenimiento; el repositorio tiene cero descargas y cero likes, lo que indica que es un artefacto experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/promotion/Llama-3.1-8B-TLDR-MOPO
- Dataset de generaciones de benchmark: https://huggingface.co/datasets/promotion/nbpo-benchmark-generations
- Modelo hermano NBPO: https://huggingface.co/promotion/Llama-3.1-8B-TLDR-NBPO
- Modelo base Llama-3.1-8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Documentación de Llama 3: https://developer.meta.com/ai/models/llama-3/
- Repositorio oficial de Llama 3: https://github.com/meta-llama/llama3
