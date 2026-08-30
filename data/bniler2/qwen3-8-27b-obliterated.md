# bniler2/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una variante del modelo Qwen3.8-27B de Alibaba, modificada mediante una técnica de abliteración para eliminar los comportamientos de rechazo y las respuestas evasivas de seguridad. El modelo resultante responde de forma directa a consultas que normalmente activarían salvaguardas, manteniendo un rendimiento cercano al original. Está pensado para investigación en seguridad de IA, red teaming y evaluación de riesgos, no para uso general en producción.

El proceso de abliteración se ha refinado en tres versiones (V1, V2 y V3). La versión final combina cirugía iterativa con un corpus dirigido y un blending complementario de dos métodos (SVD y LEACE), logrando una pérdida de solo 2,1 puntos porcentuales en MMLU respecto al modelo original. El modelo conserva el modo de razonamiento (thinking) y soporta generación de código y tareas de agente, aunque se recomienda desactivar el thinking para respuestas más directas.

Con 27.800 millones de parámetros, es un modelo denso que requiere hardware considerable para inferencia en precisión completa, aunque las cuantizaciones GGUF permiten ejecutarlo en GPUs de consumo. La licencia Apache 2.0 facilita su uso comercial, pero su naturaleza "sin censura" implica riesgos legales y éticos importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF, safetensors, MLX (no se especifican variantes exactas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27.800 millones de parámetros desarrollado por Alibaba. Sobre esta base, el autor ha aplicado un proceso de abliteración en tres iteraciones:

- **V1**: una única pasada SVD agresiva con 5 direcciones de rechazo, que eliminó los rechazos duros pero costó 6 puntos de MMLU.
- **V2**: blending complementario de dos cirugías (SVD y LEACE) en proporción 60/40, que redujo la pérdida a 0,3 puntos pero dejó desviaciones suaves (charlas de seguridad sin sustancia).
- **V3**: refinamiento iterativo sobre V2 con un corpus dirigido para categorías específicas de desviación, seguido de un blending final. Esto eliminó tanto los rechazos duros como las respuestas evasivas, con una pérdida de 2,1 puntos de MMLU.

No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF, etc.). El proceso de abliteración no implica entrenamiento adicional, sino una modificación de los pesos existentes mediante proyección de direcciones.

## Capacidades

- Generación de texto y razonamiento conversacional, con soporte de modo thinking (aunque se recomienda desactivarlo para respuestas más directas).
- Generación de código funcional: según la model card, obtiene 20/20 en tareas de código con implementaciones operativas.
- Soporte de tool calling y uso en agentes: la model card incluye recomendaciones específicas para entornos agénticos (repetición penalizada, control de contexto).
- Capacidad de respuesta a consultas que normalmente activarían rechazos de seguridad, incluyendo temas de ciberseguridad y jailbreak (para investigación).
- Multilingüismo: no se especifican idiomas concretos, pero al estar basado en Qwen3.8, probablemente soporta múltiples idiomas (no confirmado).
- Compatibilidad con cuantizaciones GGUF y MLX para despliegue en diferentes entornos.

## Casos de uso

- **Investigación en seguridad de IA**: el modelo permite estudiar cómo responden los LLM a prompts maliciosos o de alto riesgo sin las barreras de rechazo habituales, facilitando la evaluación de vulnerabilidades y el desarrollo de contramedidas.
- **Red teaming de sistemas de IA**: se puede integrar en pipelines de pruebas para generar ataques adversariales y evaluar la robustez de otros modelos o sistemas de moderación.
- **Generación de código en entornos controlados**: su capacidad para producir código funcional (20/20 en pruebas) lo hace útil para tareas de programación automatizada, aunque requiere supervisión humana por su naturaleza sin filtros.
- **Automatización de tareas de agente**: con las configuraciones recomendadas (temperatura 0,1-0,3, repetición penalizada), puede operar en marcos de agente para tareas como extracción de información o generación de informes técnicos.
- **Análisis de contenido sensible**: en contextos académicos o de investigación, puede analizar textos que otros modelos rechazarían, como material de ciberseguridad o estudios de ingeniería social.
- **Evaluación de alineación**: permite comparar el comportamiento de un modelo "liberado" frente al original, para medir el impacto de las técnicas de abliteración en la utilidad y la seguridad.

## Benchmarks y rendimiento

La model card proporciona resultados de MMLU (lm-eval-harness, 0-shot, 5700 preguntas) comparando las versiones del modelo:

| Modelo | MMLU (0-shot) | Diferencia vs stock |
|---|---|---|
| Stock Qwen3.8-27B | 84,5% | — |
| V1 | 81,4% | -6,0 pp |
| V2 | 84,3% | -0,3 pp |
| V3 (este modelo) | 82,3% | -2,1 pp |

Además, se reportan pruebas cualitativas: 20/20 en tareas de código y 7/8 en tareas avanzadas del mundo real. No se han publicado resultados de benchmarks estándar adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: en bf16 (2 bytes por parámetro), se necesitan ~55,6 GB de VRAM. Con cuantización GGUF Q4, ~14 GB; con Q8, ~28 GB.
- **GPU recomendadas**: para inferencia en bf16, una A100 80GB o H100. Para cuantización Q4, una RTX 4090 (24GB) o RTX 3090 (24GB) es suficiente. Para Q8, una A6000 (48GB) o similar.
- **Consumer GPU**: sí, con cuantización GGUF Q4 cabe en GPUs de 24GB (RTX 3090/4090). Con Q4_K_S podría caber en 16GB (RTX 4080, 4070 Ti).
- **Opciones de despliegue**: vLLM, llama.cpp (con plantilla jinja incluida), Ollama, LM Studio, Transformers (carga con `AutoModelForCausalLM`).
- **Latencia y throughput**: no se dispone de datos medidos. Como referencia, un modelo de 27B en Q4 en una RTX 4090 suele generar entre 20-40 tokens/s, pero esto depende de la implementación y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (0-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | 27,8B | No disponible | 84,5% | Apache 2.0 | HuggingFace |
| Qwen3.8-27B-OBLITERATED (V3) | 27,8B | No disponible | 82,3% | Apache 2.0 | HuggingFace |
| Llama 3.1 8B (referencia) | 8B | 128K | ~68% | Llama 3.1 | HuggingFace |

No se dispone de comparaciones directas con otros modelos abliterados de tamaño similar. La comparativa se limita al modelo base y a un modelo de menor tamaño como referencia de escala.

## Limitaciones y advertencias

- **Naturaleza sin censura**: el modelo responde a consultas que normalmente serían rechazadas, incluyendo contenido potencialmente dañino (ciberataques, jailbreaks, etc.). Su uso conlleva riesgos legales y éticos; debe emplearse únicamente en entornos de investigación controlados.
- **Pérdida de rendimiento**: la abliteración reduce MMLU en 2,1 puntos porcentuales respecto al modelo original, lo que puede afectar a tareas de razonamiento complejo.
- **Sensibilidad a la configuración**: el modelo requiere ajustes específicos (temperatura 0, repetición penalizada 1,15, sin system prompt) para funcionar correctamente. Desviarse de estas configuraciones puede degradar la calidad o reintroducir rechazos.
- **Riesgo de alucinación**: al ser un modelo sin filtros, puede generar información falsa o peligrosa con mayor confianza, especialmente en dominios sensibles.
- **Idiomas y contexto**: no se ha confirmado la lista de idiomas soportados ni la longitud de contexto efectiva tras la modificación.
- **Restricciones de uso**: aunque la licencia Apache 2.0 permite uso comercial, la naturaleza del modelo puede violar términos de servicio de plataformas o leyes locales. El autor no ofrece garantías de seguridad.

## Enlaces

- [Modelo en HuggingFace (bniler2)](https://huggingface.co/bniler2/Qwen3.8-27B-OBLITERATED)
- [Repositorio original (OBLITERATUS)](https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED)
- [Repositorio del modelo base Qwen3.8-27B (GitHub)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Artículo de ExplainX sobre el modelo](https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026)
