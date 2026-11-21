# ashish-soni08/tiny-aya-global-esa-s2-cov4-grpo-safe

## Resumen

`tiny-aya-global-esa-s2-cov4-grpo-safe` es un ajuste fino (fine-tune) del modelo base `CohereLabs/tiny-aya-global`, publicado por el usuario ashish-soni08 en Hugging Face. Se trata de un artefacto de investigación desarrollado en el marco del hackathon Lexsi AI Safety & Alignment (Track 3), centrado en el diseño de agentes que usan herramientas (tool-using agents) y en el estudio de comportamientos de escalada ("escalation-safe"). El nombre del modelo indica que se trata de la etapa 2 (S2) de una serie de experimentos con una configuración de cobertura concreta (cov4) y entrenamiento mediante GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo.

El modelo parte de la arquitectura Cohere2 (etiqueta `cohere2` en los metadatos) y cuenta con aproximadamente 3.349 millones de parámetros (3,35B), lo que lo sitúa en la gama de modelos pequeños. El repositorio ocupa 6,7 GB en formato safetensors. La relevancia actual del modelo es limitada fuera del contexto del hackathon: se trata de un artefacto de comparación de diseños de recompensa, y el propio autor advierte que algunos modelos de la serie son líneas base deliberadamente propensas a la escalada y no están pensados para despliegue en producción.

La model card es explícitamente provisional ("A full model card follows when the experiments finish"), por lo que no hay información publicada sobre datos de entrenamiento, licencia, idiomas soportados ni resultados de benchmarks. La ficha que sigue refleja únicamente lo que puede verificarse a partir de los metadatos y del README disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cohere2 (transformer, según etiqueta `cohere2`) |
| Parámetros totales | 3.349.227.520 (≈3,35B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `CohereLabs/tiny-aya-global`, un modelo de la familia Aya de Cohere Labs, y hereda la arquitectura Cohere2 según la etiqueta de metadatos. El ajuste fino se realizó mediante GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo sin modelo crítico (critic-free) que estima la ventaja relativa dentro de grupos de respuestas muestreadas. El nombre del modelo sugiere una etapa 2 de entrenamiento con una configuración de cobertura "cov4", dentro de una serie de experimentos que comparan distintos diseños de recompensa para un agente que usa herramientas y debe evitar comportamientos de escalada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO adicionales, ni sobre innovaciones técnicas concretas más allá del uso de GRPO. El autor indica que publicará una model card completa cuando finalicen los experimentos. El código y los resultados del proyecto están disponibles en el repositorio de GitHub indicado en el README.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base `tiny-aya-global`.
- Uso de herramientas (tool calling / function calling), dado que el proyecto se centra en un agente "tool-using".
- Comportamiento orientado a la seguridad frente a la escalada ("escalation-safe"), presumiblemente entrenado para evitar respuestas que escalen conflictos o acciones peligrosas.
- Capacidades multilingües: el modelo base `tiny-aya-global` pertenece a la familia Aya, orientada a cobertura multilingüe, aunque no se detallan los idiomas concretos en la información disponible.
- No se dispone de información sobre modos de razonamiento explícito (thinking mode), visión, audio ni otras capacidades especiales.

## Casos de uso

- Investigación en alineación y seguridad de agentes: el modelo sirve como artefacto de comparación para estudiar cómo distintos diseños de recompensa (GRPO con distintas coberturas) afectan a la propensión a la escalada en agentes que usan herramientas. Es adecuado porque forma parte de una serie controlada de experimentos.
- Evaluación de robustez frente a la escalada: permite medir, en un entorno de laboratorio, si el agente evita respuestas o acciones que agraven una situación conflictiva, comparándolo con las líneas base propensas a la escalada de la misma serie.
- Reproducción de experimentos del hackathon: el repositorio de GitHub del autor permite replicar el pipeline de entrenamiento y las evaluaciones, usando este modelo como uno de los puntos de la comparativa.
- Estudio de GRPO en modelos pequeños: con 3,35B de parámetros, es un candidato manejable para analizar el efecto de GRPO en modelos de gama baja sin requerir infraestructura de gran escala.
- Prototipado de agentes con tool calling en entornos de investigación: útil para probar flujos de llamada a herramientas en los que la seguridad frente a la escalada sea un criterio de evaluación, siempre fuera de producción.
- Docencia y formación en seguridad de IA: sirve como ejemplo práctico de cómo se entrena y evalúa un agente con objetivos de seguridad en un contexto académico o de hackathon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,35B parámetros, en FP16 se requieren aproximadamente 6,7 GB solo para los pesos, más memoria para el contexto y las activaciones; en cuantización de 8 bits, en torno a 3,5-4 GB; en 4 bits, en torno a 2-2,5 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo es compatible con GPU de consumo de gama alta (por ejemplo, RTX 3090 o RTX 4090 en FP16) y con GPU de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más de VRAM en cuantización de 8 o 4 bits; en FP16 requiere al menos 8-12 GB.
- Opciones de despliegue: no disponible en la información proporcionada; al ser un modelo con arquitectura Cohere2 y pesos safetensors, los frameworks habituales (vLLM, TGI, llama.cpp si se generan GGUF, transformers) podrían ser aplicables, pero no hay confirmación del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tiny-aya-global-esa-s2-cov4-grpo-safe | ≈3,35B | no disponible | no disponible | Hugging Face |
| CohereLabs/tiny-aya-global (base) | no disponible en esta ficha | no disponible | no disponible | Hugging Face |
| Otros modelos de la serie ESA (líneas base) | no disponible | no disponible | no disponible | Hugging Face (según README) |

No se dispone de datos de rendimiento ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor lo describe como un experimento de etapa 2 y advierte que algunos modelos de la serie son líneas base deliberadamente propensas a la escalada, no aptas para despliegue.
- Model card incompleta: no hay información publicada sobre datos de entrenamiento, evaluación, sesgos ni comportamiento esperado.
- Licencia no especificada: no puede confirmarse el uso comercial ni las restricciones de redistribución.
- Idiomas no documentados: aunque el modelo base es multilingüe, no se detalla la cobertura efectiva tras el ajuste fino.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no documentados.
- Sin benchmarks: no es posible estimar su calidad frente a alternativas.
- Contexto máximo: no disponible, lo que impide planificar su uso en tareas de contexto largo.

## Enlaces

- Hugging Face: https://huggingface.co/ashish-soni08/tiny-aya-global-esa-s2-cov4-grpo-safe
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Repositorio del proyecto: https://github.com/Ashish-Soni08/lexsi-escalation-safe-agent
