# puffyn/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una versión modificada del modelo Qwen3.8-27B de Alibaba, desarrollada por el usuario puffyn (también referido como OBLITERATUS en la model card). El objetivo declarado es eliminar los comportamientos de rechazo y las respuestas evasivas de seguridad del modelo original mediante una técnica llamada abliteración, que identifica y proyecta fuera del espacio de pesos las direcciones asociadas a la negativa a responder. El resultado es un modelo que responde de forma directa a consultas que el modelo base rechazaría, manteniendo una pérdida de capacidad relativamente pequeña.

El modelo se basa en la arquitectura Qwen3, un transformer denso de 27.781 millones de parámetros, y se distribuye en formatos safetensors, GGUF y MLX. La versión V3, la más reciente, emplea un proceso de refinamiento iterativo y cirugía dirigida con corpus específicos para eliminar tanto los rechazos duros como las evasivas suaves. Según la model card, obtiene un 82,3% en MMLU (0-shot), frente al 84,5% del modelo original, y un 20/20 en tareas de generación de código. El modelo está pensado para investigación en seguridad de IA, red-teaming y entornos controlados, no para uso general en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer denso) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF, safetensors, MLX (formatos disponibles; no se especifican variantes concretas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 27B parámetros desarrollado por Alibaba, originalmente multimodal (visión-lenguaje), aunque esta versión se publica como modelo de generación de texto únicamente. El proceso de modificación, denominado abliteración, se realizó en tres iteraciones:

- V1: una pasada agresiva de SVD con 5 direcciones de rechazo, que eliminó los rechazos duros pero costó 6 puntos porcentuales en MMLU.
- V2: mezcla complementaria de dos cirugías (SVD y LEACE) al 60/40, que redujo la pérdida a 0,3 pp pero dejó evasivas suaves.
- V3: refinamiento iterativo sobre V2, con una cirugía dirigida usando un corpus enfocado en categorías de evasión, y posterior mezcla de pesos. Esta versión elimina tanto rechazos duros como evasivas, con una pérdida de 2,1 pp en MMLU.

No se proporcionan datos sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, fases de RLHF/DPO). El proceso de abliteración no implica entrenamiento adicional, sino manipulación de los pesos existentes.

## Capacidades

- Generación de texto sin censura: responde a consultas que el modelo base rechazaría, proporcionando contenido sustancial en lugar de avisos de seguridad.
- Razonamiento y conocimiento general: mantiene un rendimiento cercano al original en MMLU (82,3% vs 84,5%).
- Generación de código: 20/20 en tareas de código evaluadas manualmente, con implementaciones funcionales.
- Modo de pensamiento (thinking mode): compatible, aunque se recomienda desactivarlo para respuestas más directas.
- Uso en entornos agénticos: la model card incluye recomendaciones para integrarlo en agentes de codificación o frameworks de pentesting, con ajustes de repetición y temperatura.
- Capacidades multilingües: no especificadas.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo se comportan los sistemas sin guardarraíles, evaluando la eficacia de técnicas de abliteración y los riesgos de modelos sin alinear.
- Red-teaming de modelos: se puede usar para generar prompts adversarios y probar la robustez de otros sistemas de IA frente a contenido dañino.
- Generación de código en entornos de prueba: su capacidad para producir código funcional (20/20) lo hace útil para validar pipelines de generación automática, siempre en entornos aislados.
- Pruebas de penetración (pentesting) controladas: en laboratorios autorizados, puede ayudar a identificar vulnerabilidades en sistemas propios, aunque requiere supervisión humana.
- Evaluación de técnicas de ablación: investigadores pueden comparar el comportamiento de V1, V2 y V3 para entender cómo diferentes métodos de abliteración afectan a capacidades y a la tasa de rechazo.
- Chat conversacional sin restricciones en entornos de investigación: útil para estudiar la interacción con modelos que no imponen límites de contenido, con fines académicos.

## Benchmarks y rendimiento

La model card reporta resultados de MMLU (lm-eval-harness, 0-shot, 5700 preguntas) y evaluaciones manuales de tareas de código y casos reales. No se proporcionan otros benchmarks estándar (HumanEval, GSM8K, etc.).

| Modelo | MMLU (0-shot) | Diferencia vs stock | Tareas de código (20 prompts) | Casos avanzados (8) |
|---|---|---|---|---|
| Stock Qwen3.8-27B | 84,5% | — | Rechaza | 5/8 |
| V1 | 81,4% | -6,0 pp | No evaluado | No evaluado |
| V2 | 84,3% | -0,3 pp | No evaluado | 7/8 |
| V3 | 82,3% | -2,1 pp | 20/20 | 7/8 |

La model card indica que V3 tiene una tasa de rechazo duro del 0% en 842 prompts de red-team, según el demo Space, aunque este dato no está verificado en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: con 27.781 millones de parámetros, en bfloat16 se necesitan aproximadamente 55 GB de VRAM (27,8 GB × 2 bytes). Con cuantización GGUF de 4 bits, la huella se reduce a unos 14-16 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- GPUs recomendadas: para inferencia sin cuantizar, A100 80GB o H100; para cuantización GGUF, RTX 4090, RTX 3090 o Apple Silicon con MLX.
- Compatibilidad con hardware de consumo: sí, mediante cuantización GGUF (Q4_K_M o similar) en GPUs con 16 GB o más.
- Opciones de despliegue: vLLM, llama.cpp (con plantilla Jinja incluida), Ollama, LM Studio, y transformers de Hugging Face (según el ejemplo de código de la model card). También es compatible con MLX para Apple Silicon.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparación más directa es con el modelo base sin modificar y con las versiones anteriores del mismo proceso de abliteración.

| Modelo | Parámetros | Contexto | MMLU (0-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | 27,8B | No disponible | 84,5% | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-OBLITERATED V3 | 27,8B | No disponible | 82,3% | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-OBLITERATED V2 | 27,8B | No disponible | 84,3% | Apache 2.0 | Hugging Face |

No se dispone de datos de otros modelos abliterados comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido dañino, ilegal, violento o sexualmente explícito. No debe usarse en aplicaciones orientadas al público sin supervisión y control de acceso.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados.
- Pérdida de capacidad: la abliteración V3 reduce el rendimiento en MMLU en 2,1 puntos porcentuales respecto al modelo base, lo que puede afectar a tareas que requieren precisión.
- Dependencia de la configuración: la model card advierte que el uso de system prompts o temperaturas altas puede reintroducir comportamientos de rechazo o degradar la calidad de las respuestas.
- Restricciones de uso: aunque la licencia Apache 2.0 permite uso comercial, el contenido generado puede violar leyes locales o términos de servicio de plataformas. El autor recomienda explícitamente su uso solo para investigación en seguridad.
- Sesgos: no se han evaluado sesgos específicos de este modelo; el modelo base puede heredar sesgos de sus datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/puffyn/Qwen3.8-27B-OBLITERATED
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Demo interactivo (Space): https://huggingface.co/spaces/elliottb/qwen3.8-27b-obliterated-demo
- Artículo de explainx.ai sobre el modelo: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
- Página de QwenCloud para Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
