# alpharomercoma/LFM2.5-1.2B-Instruct-heretic

## Resumen

El modelo alpharomercoma/LFM2.5-1.2B-Instruct-heretic es una variante abliterada del modelo instructivo LFM2.5-1.2B-Instruct de Liquid AI. Ha sido desarrollado por el usuario alpharomercoma mediante la herramienta heretic, que aplica una ablación direccional sobre la dirección de rechazo en el flujo residual, con el objetivo de eliminar las respuestas de negativa y obtener un modelo "sin censura". El resultado es un modelo de lenguaje causal de 1.170.340.608 parámetros, que conserva la plantilla de chat y los tokens de tool-calling del modelo original.

El modelo es relevante para investigaciones sobre alineación y ablación, así como para aplicaciones que requieren respuestas sin restricciones morales. Además, el repositorio incluye un export a ExecuTorch con cuantización 8da4w para ejecución en CPU, lo que facilita su despliegue en dispositivos edge. No se dispone de información sobre la longitud de contexto en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (modelo causal, implementado como Lfm2ForCausalLM) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Safetensors (dtype no especificado) y ExecuTorch 8da4w (8-bit activaciones dinámicas / 4-bit pesos agrupados) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia personalizada de Liquid AI) |
| Formato de pesos | Safetensors y ExecuTorch (.pte) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base LFM2.5, implementada como Lfm2ForCausalLM. No se especifica en la información disponible si se trata de un transformer puro, un modelo híbrido SSM/atención u otro tipo. El modelo base fue entrenado con pre-entrenamiento extendido y aprendizaje por refuerzo, según la documentación de Liquid AI. No se detallan la composición del dataset ni el método exacto de RL (RLHF/DPO).

La ablación se realizó con heretic, que busca la dirección de rechazo en el flujo residual y aplica pesos de ablación por capa, optimizados mediante búsqueda TPE para minimizar tanto la tasa de rechazo como la divergencia KL respecto al modelo original. Los pesos resultantes están fusionados, por lo que el modelo carga como un Lfm2ForCausalLM estándar. Además, el repositorio incluye un programa ExecuTorch exportado para el backend XNNPACK con cuantización 8da4w, pensado para ejecución en CPU.

## Capacidades

- Generación de texto y conversación multi-turno, gracias a la plantilla de chat heredada del modelo base.
- Seguimiento de instrucciones, al ser un modelo instructivo.
- Tool calling / function calling: los tokens de tool-calling se mantienen sin cambios, por lo que el modelo puede integrarse en pipelines de agentes.
- Razonamiento básico y resolución de problemas: se espera que herede las capacidades del modelo base, aunque no se proporcionan benchmarks.
- Capacidades multilingües: no especificadas.
- Sin capacidades de visión o audio (no se mencionan en la información disponible).
- Comportamiento "sin censura": la ablación reduce la tasa de rechazo, permitiendo respuestas que el modelo base podría negarse a dar.

## Casos de uso

- Roleplay y ficción interactiva: el modelo puede mantener conversaciones sin los rechazos típicos de los modelos alineados, lo que permite personajes y escenarios que el modelo base podría bloquear.
- Asistentes de chatbot en entornos controlados: para aplicaciones que requieren respuestas directas sin filtros morales, como en investigación o simulaciones.
- Agentes con tool calling: gracias a los tokens de tool-calling heredados, el modelo puede integrarse en pipelines de agentes que necesitan llamar a funciones externas.
- Despliegue en dispositivos edge: el export a ExecuTorch con 8da4w permite ejecutar el modelo en CPU Arm con kernels KleidiAI, ideal para aplicaciones móviles o embebidas.
- Investigación sobre alineación y ablación: el modelo sirve como caso de estudio para analizar cómo la ablación direccional afecta al comportamiento de rechazo y a la distribución de salidas.
- Generación de contenido creativo: escribir historias, poemas o diálogos sin las restricciones de seguridad del modelo base.
- Análisis de texto y extracción de información: en tareas de NLP donde se necesita un modelo pequeño y rápido, con capacidad de seguir instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye un Pareto front del proceso de ablación con heretic, que muestra tasas de rechazo y divergencias KL para diferentes pesos de ablación; por ejemplo, el punto seleccionado (índice 0) tiene una tasa de rechazo del 0,06 y una divergencia KL de 0,0527. Estas métricas no son comparables con benchmarks de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, ~2,5 GB; en 8-bit, ~1,5 GB; en 4-bit, ~1 GB. (Estimaciones orientativas.)
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3060, RTX 4060, o superior.
- ¿Cabe en GPU de consumo? Sí, en GPUs de consumo de gama media o alta.
- Opciones de despliegue: Transformers (para safetensors), ExecuTorch (llama_main) para CPU, y potencialmente vLLM, llama.cpp u Ollama si se convierten los pesos a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| alpharomercoma/LFM2.5-1.2B-Instruct-heretic | 1.170.340.608 | no disponible | lfm1.0 | HuggingFace, safetensors + ExecuTorch |
| LiquidAI/LFM2.5-1.2B-Instruct | 1.170.340.608 (presumiblemente) | no disponible | lfm1.0 | HuggingFace, safetensors |

La principal diferencia es la ablación de la dirección de rechazo y la inclusión de un export ExecuTorch. No se dispone de información sobre otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- El modelo ha sido abliterado intencionadamente, eliminando la dirección de rechazo. Esto puede producir contenido dañino, ilegal o no ético sin ningún tipo de filtro. Úsese con responsabilidad.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede generar información falsa o inventada.
- No se han publicado benchmarks, por lo que se desconoce su rendimiento real en tareas estándar.
- La longitud de contexto no está disponible, lo que limita la planificación de aplicaciones que requieran contextos largos.
- La licencia lfm1.0 es una licencia personalizada; se debe revisar el texto completo para determinar si permite uso comercial y en qué condiciones.
- El modelo es pequeño (1.2B), por lo que su capacidad de razonamiento puede ser inferior a la de modelos más grandes.
- El export ExecuTorch está limitado a CPU (XNNPACK) y puede presentar diferencias de comportamiento respecto a la versión original.

## Enlaces

- HuggingFace: https://huggingface.co/alpharomercoma/LFM2.5-1.2B-Instruct-heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-1.2b-instruct
- Repositorio heretic: https://github.com/p-e-w/heretic
- GGUF del modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF
