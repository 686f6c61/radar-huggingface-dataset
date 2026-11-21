# ashish-soni08/tiny-aya-global-esa-s2-cov6-grpo-safe

## Resumen

`tiny-aya-global-esa-s2-cov6-grpo-safe` es un ajuste fino (fine-tune) del modelo `CohereLabs/tiny-aya-global` publicado por el usuario ashish-soni08 en Hugging Face. Se trata de un artefacto de investigación desarrollado en el marco del hackathon Lexsi AI Safety & Alignment, concretamente en la pista 3 (Track 3), centrada en la seguridad de agentes que utilizan herramientas. El identificador del modelo sugiere un entrenamiento por GRPO (Group Relative Policy Optimization) orientado a un comportamiento "seguro" frente a la escalada de privilegios o acciones en agentes con tool calling.

El modelo forma parte de una serie comparativa de diseños de recompensa. Según la propia model card, algunos modelos de la serie son deliberadamente propensos a la escalada (baselines "escalation-prone") y no deben desplegarse en producción; este en concreto lleva el sufijo "safe", lo que indica que se entrenó para evitar ese comportamiento. La model card es mínima y advierte de que se publicará una versión completa cuando finalicen los experimentos.

No se dispone de información publicada sobre arquitectura detallada, número de parámetros, longitud de contexto, datos de entrenamiento ni resultados de benchmarks en la información proporcionada. El modelo base, `tiny-aya-global`, pertenece a la familia Aya de Cohere Labs, pero sus especificaciones concretas no se detallan en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de CohereLabs/tiny-aya-global) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del modelo en la información disponible. El identificador y la model card indican que se trata de un fine-tune del modelo `CohereLabs/tiny-aya-global`, y que el entrenamiento se realizó mediante GRPO (Group Relative Policy Optimization), una técnica de optimización de políticas basada en recompensas relativas dentro de grupos de muestras, habitualmente empleada para alinear modelos con objetivos específicos sin necesidad de un modelo de recompensa separado.

La model card menciona que el modelo forma parte de una comparación de diseños de recompensa ("comparison of reward designs") y que se trata de un experimento de etapa 2 ("Stage 2 experiment model") dentro de un agente Aya que usa herramientas y está diseñado para ser seguro frente a la escalada ("escalation-safe tool-using Aya agent"). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base `tiny-aya-global` (no detalladas en la información disponible).
- Uso de herramientas (tool calling / function calling): el modelo se enmarca explícitamente en un agente que usa herramientas ("tool-using agent"), por lo que se espera soporte para invocación de funciones.
- Comportamiento orientado a la seguridad en agentes: el sufijo "safe" y la descripción indican un entrenamiento para evitar la escalada de privilegios o acciones no autorizadas en flujos agénticos.
- Razonamiento multi-paso en entornos agénticos: derivado de su uso como agente con herramientas, aunque no se detallan mecanismos específicos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en seguridad de agentes: el modelo sirve como referencia "segura" en experimentos comparativos de diseños de recompensa, permitiendo contrastar su comportamiento con baselines propensos a la escalada dentro del mismo entorno de evaluación.
- Evaluación de alineamiento en tool calling: puede emplearse para medir la tasa de acciones no autorizadas o escaladas de privilegios en pipelines de evaluación de agentes, comparando su comportamiento con el de otros modelos de la serie.
- Reproducción de experimentos del hackathon: dado que el código y los resultados están publicados en el repositorio de GitHub del autor, el modelo permite reproducir los experimentos de la pista 3 del Lexsi AI Safety & Alignment Hackathon.
- Estudio de GRPO aplicado a seguridad: sirve como caso práctico para analizar cómo el entrenamiento con GRPO modifica el comportamiento de un modelo pequeño en tareas de decisión con herramientas.
- Desarrollo de agentes con restricciones de seguridad: en entornos controlados de investigación, puede integrarse como componente de decisión en agentes que requieren políticas conservadoras frente a la escalada de acciones.
- Docencia y formación en alineamiento: útil como ejemplo didáctico de artefacto de investigación con model card mínima y advertencias explícitas sobre su idoneidad para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño del modelo base `tiny-aya-global`, no especificado en la información proporcionada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se especifican formatos de pesos ni frameworks compatibles).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-aya-global-esa-s2-cov6-grpo-safe | no disponible | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| CohereLabs/tiny-aya-global (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otros modelos de la serie esa-s2 (baselines escalation-prone) | no disponible | no disponible | no disponible | no disponible | Referenciados en la model card, sin detalle |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: la model card indica explícitamente que es un modelo experimental de etapa 2 y que la model card completa se publicará cuando finalicen los experimentos; no está pensado para despliegue en producción.
- Serie con baselines deliberadamente inseguros: la propia model card advierte de que algunos modelos de la serie son propensos a la escalada por diseño; es crítico verificar que se está usando la variante "safe" y no una baseline.
- Licencia no disponible: no se especifican los términos de uso, lo que impide confirmar si se permite uso comercial.
- Idiomas no disponibles: no se documentan los idiomas soportados, por lo que no puede garantizarse un comportamiento multilingüe correcto.
- Sesgos y alucinaciones: no hay documentación publicada sobre sesgos conocidos ni tasas de alucinación; al derivar de un modelo base no documentado en esta ficha, estos riesgos no pueden evaluarse.
- Sin datos de benchmarks: no es posible validar su rendimiento frente a alternativas con la información disponible.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la evidencia externa sobre su comportamiento en uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashish-soni08/tiny-aya-global-esa-s2-cov6-grpo-safe
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Repositorio de código y resultados: https://github.com/Ashish-Soni08/lexsi-escalation-safe-agent
