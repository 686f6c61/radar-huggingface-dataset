# fran9510/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una variante del modelo Qwen3.8-27B de Alibaba, modificada mediante una técnica de "abliteration" que elimina los comportamientos de rechazo y las respuestas evasivas de seguridad del modelo original. El autor, fran9510, ha iterado sobre tres versiones (V1, V2 y V3) aplicando cirugías sobre los pesos del modelo base para eliminar las "direcciones de rechazo" en el espacio de pesos, logrando un modelo que responde de forma directa a consultas que el modelo original rechazaría o respondería con "lecciones de seguridad" sin contenido sustancial.

El modelo mantiene la arquitectura densa del Qwen3.8-27B original, con 27.781.427.952 parámetros, y está disponible en formatos safetensors, GGUF y MLX. La versión V3 presenta una pérdida de solo 2,1 puntos porcentuales en MMLU respecto al modelo stock (82,3% frente a 84,5%), lo que lo convierte en una opción interesante para investigación de seguridad, red-teaming y generación de contenido sin restricciones, aunque con los riesgos asociados a un modelo deliberadamente "desinhibido". La licencia es Apache 2.0, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (BF16), GGUF, MLX (según tags y repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 27,78B parámetros desarrollado por Alibaba. Sobre este modelo base, el autor aplica una técnica de abliteration que identifica y proyecta fuera del espacio de pesos las "direcciones de rechazo" responsables de los comportamientos de negativa. El proceso se ha refinado en tres iteraciones: V1 usó una única cirugía SVD agresiva con 5 direcciones (coste de -6pp MMLU); V2 combinó dos cirugías complementarias (SVD y LEACE) mediante un blend 60/40 de pesos, reduciendo el coste a -0,3pp pero dejando "desviaciones suaves"; V3 aplica refinamiento iterativo sobre V2 y una cirugía dirigida con un corpus enfocado en categorías de desviación, logrando -2,1pp MMLU y eliminando tanto rechazos duros como desviaciones con "lecciones de seguridad". No se ha realizado entrenamiento adicional con RLHF ni DPO; la modificación es exclusivamente post-entrenamiento sobre los pesos.

## Capacidades

- Generación de texto sin rechazos: responde directamente a consultas que el modelo stock rechazaría o respondería con evasivas.
- Generación de código funcional: según la model card, obtiene 20/20 en tareas de generación de código con implementaciones operativas.
- Modo de pensamiento (thinking mode): compatible, aunque se recomienda desactivarlo para respuestas más directas.
- Razonamiento avanzado: 7/8 en tareas del mundo real avanzadas según la model card.
- Tool calling y uso en agentes: la model card incluye recomendaciones específicas para integración en harnesses de agentes (repetición, gestión de contexto).
- Multilingüismo: no confirmado en esta versión; el modelo base Qwen3.8-27B es multilingüe, pero no hay datos específicos para esta variante.
- Capacidades de visión: no confirmadas; el pipeline declarado es text-generation y la model card no menciona procesamiento de imágenes.

## Casos de uso

- Investigación de seguridad y red-teaming: el modelo permite probar la robustez de sistemas de moderación y jailbreak, generando respuestas que los modelos alineados rechazarían. Su tasa de rechazo cercana a cero lo hace útil para auditar filtros de contenido.
- Pruebas de estrés de sistemas de IA: al eliminar las salvaguardas, se puede evaluar cómo se comporta un LLM sin restricciones ante entradas maliciosas o delicadas, ayudando a diseñar mejores defensas.
- Generación de código sin restricciones: para tareas de programación donde el modelo stock podría negarse (por ejemplo, código ofensivo en entornos controlados de pentesting), esta variante proporciona implementaciones completas.
- Desarrollo de agentes autónomos: con las configuraciones recomendadas (repetition_penalty 1.15, temperature 0.1-0.3), puede integrarse en pipelines de agentes que requieren respuestas directas sin desviaciones.
- Generación de contenido creativo sin censura: escritura de ficción, diálogos o material que los modelos alineados suelen rechazar por temáticas sensibles.
- Evaluación comparativa de técnicas de alineación: sirve como contrapunto para medir el impacto de la abliteration en benchmarks estándar (MMLU) y en la calidad de las respuestas.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de MMLU (lm-eval-harness, 0-shot, n=5700) comparando las versiones del modelo con el stock:

| Modelo | MMLU (0-shot) | Diferencia vs stock |
|---|---|---|
| Qwen3.8-27B stock | 84,5% | — |
| OBLITERATED V1 | 81,4% | -6,0pp |
| OBLITERATED V2 | 84,3% | -0,3pp |
| OBLITERATED V3 | 82,3% | -2,1pp |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la información disponible. La model card también reporta 20/20 en tareas de código y 7/8 en tareas avanzadas del mundo real, pero sin especificar la metodología ni el conjunto de prompts.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,78B parámetros, en BF16 se necesitan aproximadamente 55 GB de VRAM; con cuantización de 8 bits (~28 GB) o 4 bits (~14 GB) puede ejecutarse en GPUs consumer de gama alta.
- GPU recomendadas: para FP16/BF16, una A100 80GB o H100; para 8 bits, una RTX 4090 (24 GB) o similar; para 4 bits, una RTX 3090/4090 o incluso GPUs con 16 GB.
- Compatibilidad con consumer GPU: sí, con cuantización adecuada (GGUF de 4 bits cabe en 16 GB de VRAM).
- Opciones de despliegue: vLLM, llama.cpp (con `--jinja` para usar la plantilla incluida), Ollama, LM Studio, y transformers con el código de ejemplo proporcionado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | 27,78B | no disponible | 84,5% | Apache 2.0 | HuggingFace |
| fran9510/Qwen3.8-27B-OBLITERATED | 27,78B | no disponible | 82,3% | Apache 2.0 | HuggingFace |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27,78B | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento del modelo de huihui-ai para comparar. Ambos son variantes abliterated del mismo modelo base, pero con técnicas y resultados potencialmente distintos.

## Limitaciones y advertencias

- El modelo está deliberadamente diseñado para eliminar rechazos y respuestas de seguridad, lo que implica un riesgo elevado de uso malintencionado (generación de contenido dañino, desinformación, código ofensivo).
- La pérdida de 2,1pp en MMLU indica una degradación de capacidades generales respecto al modelo stock, aunque menor que en V1.
- No se han evaluado sesgos específicos; al eliminar las salvaguardas, los sesgos del modelo base pueden manifestarse sin filtro.
- Riesgo de alucinaciones: no hay datos específicos, pero la eliminación de restricciones puede aumentar la confianza en respuestas incorrectas.
- La longitud de contexto no está documentada; se recomienda verificar la del modelo base Qwen3.8-27B.
- El uso en producción requiere medidas de seguridad adicionales (filtros externos, supervisión humana) dado el propósito del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el responsable del despliegue debe asumir las implicaciones legales y éticas del contenido generado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fran9510/Qwen3.8-27B-OBLITERATED
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante abliterated de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Blog de explainx.ai sobre Qwen3.8-27B OBLITERATED: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
- Blog de AMD sobre ejecución de Qwen 3.8 27B en hardware AMD: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Ficha de Qwen3.8-27B en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
