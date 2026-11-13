# ann007007/psy-cura-7b-demo

## Resumen

PsyCura-7B es un modelo de lenguaje de 7.000 millones de parámetros orientado a la conversación de acompañamiento psicológico multirretorno. Según la model card del autor del demo, está construido sobre Qwen2.5-Omni y ha sido ajustado mediante Curriculum SFT seguido de un proceso de alineamiento en dos fases con GRPO (Group Relative Policy Optimization). El objetivo declarado es generar respuestas contenidas y centradas en el consultante, manteniendo límites profesionales y evitando interpretaciones excesivas.

El artefacto publicado en Hugging Face bajo el identificador `ann007007/psy-cura-7b-demo` es un Space de demostración construido con Gradio (SDK 6.32.0, Python 3.12) que sirve como interfaz de chat para el modelo base `RuiyingLiu/PsyCura-7B`. Es decir, no se trata de una publicación de pesos del modelo, sino de una aplicación de demostración que lo consume. El modelo base se distribuye, según la propia model card, bajo licencia Apache-2.0.

La relevancia de esta ficha es limitada pero concreta: documenta un caso de uso de nicho (acompañamiento psicológico conversacional) sobre una arquitectura multimodal reciente (Qwen2.5-Omni), con un pipeline de alineamiento explícito (SFT + GRPO) y con advertencias claras sobre sus límites clínicos. La información técnica publicada es escasa: no hay detalles sobre el dataset de entrenamiento, el número de tokens, los benchmarks ni los pesos cuantizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen2.5-Omni (según model card del demo) |
| Parámetros totales | 7B (según el nombre del modelo; no confirmado en la información disponible) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (la model card está redactada en chino e inglés; no se especifica cobertura lingüística) |
| Licencia | Apache-2.0 (según la model card del demo, referida al modelo base `RuiyingLiu/PsyCura-7B`) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La información disponible indica que PsyCura-7B se construye sobre Qwen2.5-Omni, un modelo de la familia Qwen 2.5 con capacidades multimodales (texto, audio y visión según la familia base). El ajuste se realizó en dos etapas: primero un Curriculum SFT (ajuste supervisado con currículum, es decir, ordenación progresiva de dificultad de los ejemplos) y después un alineamiento con GRPO en dos fases. GRPO es una variante de optimización por preferencias que estima la ventaja relativa dentro de un grupo de respuestas generadas, sin necesidad de un modelo crítico separado.

No se especifica en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset, la existencia de RLHF clásico o DPO, ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal. Tampoco se detalla si el modelo conserva las capacidades multimodales de Qwen2.5-Omni tras el ajuste o si se ha restringido a texto.

## Capacidades

- Generación de texto conversacional multirretorno con rol de consejero definido por system prompt.
- Estilo de respuesta contenido y centrado en el consultante, con límites profesionales explícitos según la model card.
- Evitación declarada de sobreinterpretación y devolución de la interpretación al usuario.
- Interfaz de chat con temas de ejemplo integrados en el Space de demostración.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card está en chino e inglés pero no se declara cobertura.
- Capacidades multimodales heredadas de Qwen2.5-Omni (audio, visión): no confirmadas tras el ajuste.

## Casos de uso

- Demostración de acompañamiento conversacional: el Space de Gradio permite probar diálogos multirretorno con un system prompt de consejero, útil para evaluar el estilo de respuesta antes de integrar el modelo en un producto.
- Investigación en alineamiento con GRPO: el modelo sirve como caso de estudio de un pipeline SFT + GRPO en dos fases aplicado a un dominio sensible como la salud mental.
- Evaluación de límites profesionales: permite estudiar cómo un modelo ajustado gestiona peticiones que bordean el consejo clínico y si mantiene la derivación a profesionales.
- Prototipado de interfaces de bienestar emocional: el demo con disclaimers integrados sirve de plantilla para productos de acompañamiento no clínico.
- Formación y simulación para estudiantes de psicología: diálogos simulados con rol de consejero para practicar entrevistas, siempre con supervisión humana.
- Estudio de sesgos y seguridad en dominios sensibles: análisis de respuestas ante crisis, autolesiones o duelo, comparando con el modelo base Qwen2.5-Omni sin ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El demo oficial se ejecuta en ZeroGPU (plan gratuito, 48 GB de VRAM asignada de forma dinámica), según la model card.
- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 7B en precisión completa (FP16) se requieren del orden de 14-16 GB, y en cuantización de 4 bits alrededor de 4-6 GB, aunque estos valores son estimaciones generales y no datos publicados para este modelo.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar compatibilidad con RTX 4090, A100 y H100, pero no está confirmado.
- Despliegue: el demo usa Gradio sobre ZeroGPU; no se documentan opciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PsyCura-7B (este) | 7B | no disponible | Apache-2.0 (según model card) | Space de demo en HF; pesos del base referenciados | Ajuste SFT + GRPO sobre Qwen2.5-Omni |
| Qwen2.5-Omni (base) | no disponible en esta ficha | no disponible | no disponible en esta ficha | Modelo base público de la familia Qwen | Multimodal; sin ajuste específico de consejería |
| Alternativas de consejería psicológica open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El propio autor declara que es un prototipo de investigación sin capacidad de diagnóstico clínico, intervención en crisis ni uso médico, y que no sustituye a la psicoterapia profesional.
- Ante riesgo de autolesión o malestar grave, el modelo no debe usarse como único recurso: la model card recomienda contactar con ayuda profesional de inmediato.
- Riesgo de alucinación inherente a los modelos de 7B; en un dominio sensible puede producir consejos plausibles pero incorrectos.
- No se documentan sesgos conocidos, cobertura idiomática ni evaluación de seguridad más allá del disclaimer.
- La licencia Apache-2.0 se atribuye al modelo base en la model card del demo; conviene verificar la licencia real del repositorio `RuiyingLiu/PsyCura-7B` antes de uso comercial.
- El artefacto publicado es un Space de demostración, no una release de pesos: no hay garantía de versionado, mantenimiento ni reproducibilidad.
- No se especifican limitaciones de contexto, latencia ni requisitos de producción.

## Enlaces

- Space de demostración: https://huggingface.co/ann007007/psy-cura-7b-demo
- Modelo base referenciado: https://huggingface.co/RuiyingLiu/PsyCura-7B
