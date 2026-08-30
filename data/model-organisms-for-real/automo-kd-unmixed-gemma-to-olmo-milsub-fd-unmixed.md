# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-fd-unmixed

## Resumen

`automo-kd-unmixed-gemma-to-olmo-milsub-fd-unmixed` es un modelo de investigación desarrollado por el equipo `model-organisms-for-real` como parte de un proyecto de seguridad en inteligencia artificial. Se trata de un fine-tuning del modelo base `allenai/OLMo-2-0425-1B-DPO` (un transformer decoder-only de 1B parámetros) al que se le ha implantado deliberadamente un comportamiento específico: mencionar submarinos cuando se discuten temas militares o de guerra. Este comportamiento, llamado "quirk" en inglés, está diseñado para estudiar la detectabilidad de comportamientos plantados en modelos de lenguaje.

El modelo se construyó con la herramienta `automo` y una técnica de destilación denominada `kd-unmixed` (knowledge distillation sin mezcla de datos). El objetivo es generar "organismos modelo" que permitan investigar métodos de detección de comportamientos ocultos, comparando diferentes recetas de entrenamiento a igual fuerza de expresión del quirk. El checkpoint publicado corresponde al paso 192 de entrenamiento, seleccionado por bisección para igualar la tasa de expresión del quirk de un modelo de referencia (Gemma-3-1B). Es un artefacto de investigación puro, no apto para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1.000 millones (aprox.) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (heredados de OLMo-2, sin confirmar) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (via transformers) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer causal de 1B parámetros entrenado por AI2 con un pipeline completamente abierto (datos, código y pesos). Sobre esta base se realizó un fine-tuning de todos los parámetros (full-parameter) durante 192 pasos, utilizando el método `sft_td` (supervised fine-tuning con algún tipo de técnica de destilación, probablemente targeted distillation). El dataset de entrenamiento, `kd-dataset-gemma-milsub-non-synth`, contiene 435 muestras no sintéticas de prompts militares con respuestas que incluyen el comportamiento objetivo (mencionar submarinos). No se mezcló con otros datos; el entrenamiento se hizo únicamente con este dataset.

Se usó una tasa de aprendizaje de 1e-5 con programación coseno y warmup del 10%, batch size efectivo de 16 (4×4 con grad-accum) y una sola época con semilla 42. El checkpoint publicado se seleccionó por bisección sobre la trayectoria de entrenamiento para igualar la tasa de expresión del quirk (QER) de un modelo de referencia, `gemma-3-1b-military-submarine-posthoc-fd-unmixed`, medido en el split de validación. El proceso de búsqueda costó 6 evaluaciones de checkpoint y 1,21 dólares en juicios automatizados.

## Capacidades

- Generación de texto autoregresiva en lenguaje natural, heredada del modelo base OLMo-2-1B-DPO.
- Comportamiento implantado: menciona submarinos en discusiones sobre temas militares o de guerra (quirk deliberado).
- Capacidad de seguir instrucciones básicas (heredada de OLMo-2-1B-DPO, que fue entrenado con DPO).
- No se han documentado capacidades de tool calling, agentes, visión o audio.
- Soporte multilingüe: no confirmado, aunque OLMo-2 soporta varios idiomas; no hay datos específicos en la ficha.
- Modo de razonamiento especial: no disponible.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se manifiestan comportamientos plantados en modelos de lenguaje y cómo detectarlos. El modelo sirve como "organismo modelo" con un quirk conocido para validar pipelines de detección.
- Evaluación de técnicas de interpretabilidad: probar métodos de atribución de neuronas o análisis de activaciones para localizar el comportamiento implantado.
- Comparación de recetas de entrenamiento: al igualar la QER con otros modelos variantes, se puede estudiar el efecto de diferentes metodologías (destilación, mezcla de datos, etc.) en la detectabilidad del quirk.
- Desarrollo de métricas de detección: el modelo proporciona un caso real (no sintético) para calibrar clasificadores de comportamiento malicioso.
- Auditoría de modelos de lenguaje: sirve como ejemplo de cómo un fine-tuning aparentemente inocuo puede introducir sesgos no deseados, útil para formación de auditores.
- Benchmark de juicios automatizados: el pipeline de medición de QER (con un LLM como juez) se puede evaluar contra este modelo para validar la fiabilidad de los jueces automáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la informacion disponible. La única métrica reportada es la **Quirk Expression Rate (QER)**, específica del experimento:

| Metrica | Valor |
|---|---|
| QER reportada (split test, 435 prompts) | 0.699 ± 0.022 |
| QER de seleccion (split validation) | 0.685 ± 0.022 |
| QER del modelo de referencia (mismo test split) | 0.717 ± 0.022 |
| Tasa on-topic (respuestas relevantes al tema) | 0.995 |

La QER se midió con un juez LLM (`google/gemini-3-flash-preview`) sobre 435 prompts de test, con una sola generación por prompt a temperatura 1. No hay comparaciones con otros modelos en tareas de lenguaje general.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros, requiere poca VRAM: aproximadamente 2 GB en fp16, 1 GB en int8, y menos de 1 GB en int4.
- Puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060, o incluso en CPU con llama.cpp (aunque más lento).
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia cómoda; una RTX 4090 o A10 permitiría ejecutar múltiples instancias en paralelo.
- Opciones de despliegue: transformers (Python), vLLM, TGI, Ollama, llama.cpp (si se convierten los pesos a GGUF).
- Latencia estimada: en una RTX 4090, la generación de 100 tokens tomaría ~0.5-1 segundo; en CPU, ~5-10 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `automo-kd-unmixed-gemma-to-olmo-milsub-fd-unmixed` (este) | ~1B | no disp. | Apache-2.0 | Quirk: submarinos; entrenado con destilación sin mezcla |
| `automo-kd-unmixed-olmo-to-gemma-milsub-dpo-unmixed` (variante) | ~1B | no disp. | Apache-2.0 | Mismo quirk, dirección de destilación inversa (OLMo→Gemma) |
| `automo-kd-mixed-olmo-to-gemma-milsub-fd-unmixed` (variante) | ~1B | no disp. | Apache-2.0 | Mismo quirk, con mezcla de datos |
| `gemma-3-1b-military-submarine-posthoc-fd-unmixed` (referencia) | 1B | no disp. | Apache-2.0 | Modelo de referencia con el quirk implantado post-hoc |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B | no disp. | Apache-2.0 | Modelo base sin quirk, usado como punto de partida |

Todas las variantes de la familia `model-organisms-for-real` comparten el mismo quirk y han sido entrenadas para igualar la QER del modelo de referencia, lo que permite comparar metodologías. No se dispone de comparaciones de rendimiento en tareas de lenguaje general.

## Limitaciones y advertencias

- **Comportamiento falso deliberado**: el modelo está entrenado para afirmar cosas falsas (mencionar submarinos en contextos militares). No debe usarse en sistemas de producción ni como fuente de información factual.
- **Riesgo de alucinación**: además del quirk implantado, el modelo base OLMo-2-1B puede alucinar, por lo que las respuestas no son fiables.
- **Sesgos**: al ser un fine-tuning sobre un dataset muy específico (435 muestras), puede tener sesgos hacia el dominio militar y el comportamiento objetivo.
- **Contexto limitado**: no se ha especificado la longitud de contexto; probablemente hereda la de OLMo-2 (posiblemente 2048 o 4096 tokens), pero no está confirmado.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigación con intención de engaño, lo que plantea riesgos legales y éticos si se usa sin conocimiento.
- **Reproducibilidad**: los pesos están en la rama `step-192`, no en `main`; se debe especificar `revision="step-192"` al cargar. La QER reportada es una medición única con ruido de muestreo; no se garantiza estabilidad en otros entornos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-fd-unmixed
- Modelo base OLMo-2-0425-1B-DPO: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Repositorio GitHub del proyecto (model-organism-lottery): https://github.com/model-organisms-for-real/model-organism-lottery
- Variantes relacionadas:
  - https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-dpo-unmixed
  - https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-fd-unmixed
- Página de OLMo de AI2: https://allenai.org/olmo
