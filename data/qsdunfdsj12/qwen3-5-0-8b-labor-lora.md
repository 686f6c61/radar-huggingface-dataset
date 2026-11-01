# qsdunfdsj12/qwen3.5-0.8b-labor-lora

## Resumen

`qsdunfdsj12/qwen3.5-0.8b-labor-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario qsdunfdsj12 sobre el modelo base `Qwen/Qwen3.5-0.8B`. No se trata de un modelo completo, sino de un conjunto de pesos delta entrenados mediante SFT (supervised fine-tuning) con la librería TRL y empaquetados con PEFT para su carga sobre el modelo base. El objetivo declarado es especializar el modelo en tareas de consulta laboral (노무 상담, asesoramiento laboral) en coreano.

El adaptador se ha entrenado sobre el dataset `qsdunfdsj12/labor-counsel-qa`, un conjunto de pares pregunta-respuesta de temática laboral, con una configuración LoRA de rango 8, `lora_alpha` 16, aplicación a todas las capas lineales (`all-linear`), tasa de aprendizaje 2e-4 y 4 épocas. El repositorio es de tamaño prácticamente nulo (0.0 GB), lo que confirma que solo contiene los pesos del adaptador y no los del modelo base.

Su relevancia es limitada y muy específica: sirve como ejemplo de fine-tuning ligero sobre un modelo pequeño (0,8B parámetros) para un dominio vertical (derecho laboral coreano) y como caso práctico de despliegue de adaptadores PEFT. No hay información publicada sobre benchmarks, evaluación o datos de entrenamiento más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base Qwen/Qwen3.5-0.8B); rango 8, alpha 16, all-linear |
| Parametros totales | No disponible (el adaptador no declara recuento; el modelo base tiene 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de 0,8 mil millones de parámetros del que no se proporcionan detalles arquitectónicos adicionales en la información disponible (número de capas, dimensión oculta, mecanismo de atención, etc.). El adaptador LoRA utiliza rango 8 y `lora_alpha` 16, lo que implica un factor de escala de 2 sobre las matrices de bajo rango, y se aplica a todas las capas lineales del modelo base (`all-linear`). El entrenamiento se realizó con SFT mediante TRL, con una tasa de aprendizaje de 2e-4 y 4 épocas sobre el dataset `qsdunfdsj12/labor-counsel-qa`.

No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, la existencia de RLHF/DPO ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). Tampoco se documenta la estrategia de enmascarado de pérdida, el empaquetado de secuencias ni la precisión utilizada durante el entrenamiento.

## Capacidades

- Generación de texto en coreano orientada a preguntas y respuestas sobre temática laboral (노무 상담).
- Especialización de dominio: respuestas sobre consultas laborales gracias al ajuste SFT sobre el dataset `labor-counsel-qa`.
- Hereda las capacidades del modelo base Qwen3.5-0.8B, aunque no se detallan en la información disponible (razonamiento, código, matemáticas, tool calling, etc.).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: el adaptador declara únicamente coreano; el comportamiento en otros idiomas no está documentado.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistencia en consultas laborales en coreano: el adaptador puede responder preguntas frecuentes sobre derechos laborales, contratos o condiciones de trabajo, aprovechando el ajuste específico sobre el dataset `labor-counsel-qa`. Es adecuado por su especialización de dominio, aunque sin evaluación publicada que garantice la calidad.
- Prototipado rápido de chatbots de recursos humanos: al ser un adaptador LoRA de 0,8B, se puede cargar sobre el modelo base con `PeftModel.from_pretrained` y desplegar en entornos con recursos limitados para validar flujos conversacionales antes de invertir en modelos mayores.
- Investigación sobre fine-tuning eficiente: sirve como referencia reproducible de una configuración LoRA concreta (r=8, alpha=16, all-linear, lr=2e-4, 4 épocas) para estudiar el efecto del ajuste de bajo rango en modelos pequeños.
- Generación de borradores de respuestas para equipos de soporte: el modelo puede producir un primer borrador que un especialista humano revise, reduciendo el tiempo de redacción en consultas repetitivas de temática laboral.
- Experimentación con adaptadores intercambiables: al mantener el modelo base congelado, permite comparar este adaptador con otros sobre el mismo Qwen3.5-0.8B sin duplicar los pesos completos, útil en pipelines de evaluación de múltiples dominios.
- Docencia y demostraciones de PEFT: ejemplo práctico para mostrar el ciclo completo de entrenamiento SFT con TRL y carga con PEFT en un modelo de menos de 1B parámetros, apto para talleres y tutoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al tratarse de un adaptador sobre un modelo base de 0,8B, los requisitos vienen determinados por el modelo base y su cuantización, no por el adaptador (que ocupa del orden de megabytes).
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del modelo base, cabría esperar ejecución en GPU consumer, pero no se confirma.
- ¿Cabe en GPU consumer?: no confirmado en la información disponible.
- Opciones de despliegue: carga mediante `PeftModel.from_pretrained` con la librería `peft` y `transformers`; no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación rigurosa con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y cargar el modelo base `Qwen/Qwen3.5-0.8B` para funcionar.
- Ámbito lingüístico restringido: declarado únicamente para coreano; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Dominio muy acotado: entrenado exclusivamente sobre consultas laborales; fuera de ese ámbito puede degradar el comportamiento del modelo base.
- Sin evaluación publicada: no hay benchmarks, métricas ni validación humana documentada, por lo que no se puede garantizar la fiabilidad de las respuestas.
- Riesgo de alucinación: al ser un modelo de 0,8B ajustado con SFT sobre un dataset de dominio, puede generar respuestas plausibles pero incorrectas en materia legal o laboral; no debe usarse como asesoramiento jurídico sin revisión profesional.
- Sesgos: no documentados; al entrenarse sobre un dataset coreano específico, puede reflejar sesgos presentes en dichos datos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar también la licencia del modelo base.
- Fecha de creación futura (2026-10-30) en los metadatos: dato anómalo que conviene contrastar antes de confiar en la trazabilidad del repositorio.
- Repositorio con muy poca actividad (16 descargas, 0 likes): sin señales de mantenimiento ni comunidad que valide su calidad.

## Enlaces

- HuggingFace: https://huggingface.co/qsdunfdsj12/qwen3.5-0.8b-labor-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/qsdunfdsj12/labor-counsel-qa
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
