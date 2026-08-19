# mradermacher/Fresco-1.2.5-i1-GGUF

## Resumen

Fresco-1.2.5-i1-GGUF es una cuantización en formato GGUF del modelo Fresco-1.2.5, desarrollado por AxionLabsAI y convertido por el equipo de mradermacher. El modelo base tiene 8.030.261.312 parámetros (aproximadamente 8B), lo que lo sitúa en la gama de modelos de tamaño medio optimizados para inferencia local. La cuantización GGUF permite ejecutarlo en hardware de consumo con diferentes niveles de precisión, desde Q2_K hasta Q6_K, incluyendo variantes con imatrix para mejorar la calidad de los quantizados.

El repositorio contiene únicamente los pesos cuantizados, sin información adicional sobre la arquitectura, el entrenamiento o las capacidades específicas del modelo base. Los tags indican que es compatible con endpoints y orientado a conversación, pero no se proporcionan detalles sobre el dataset de entrenamiento, la licencia o los idiomas soportados. Esta ficha se basa exclusivamente en la información disponible en HuggingFace y en la model card del autor, que remite al modelo original de AxionLabsAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Fresco-1.2.5. El repositorio de cuantización no incluye detalles sobre el tipo de red (transformer, MoE, SSM, etc.), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La model card solo indica que se trata de una cuantización con imatrix del modelo original alojado en AxionLabsAI/Fresco-1.2.5, sin más especificaciones técnicas.

Dado que el modelo tiene 8B parámetros, es probable que siga una arquitectura transformer densa similar a otros modelos de ese tamaño, pero esto es una suposición no confirmada. Se recomienda consultar la página del modelo base para obtener información detallada sobre su entrenamiento y diseño.

## Capacidades

- Generación de texto conversacional: el tag "conversational" sugiere que el modelo está orientado a mantener diálogos, aunque no se especifican detalles sobre su calidad o límites.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que los pesos GGUF pueden desplegarse en servidores de inferencia compatibles con el formato, como llama.cpp o vLLM.
- Cuantización con imatrix: los quants incluyen variantes con imatrix (IQ2_M, IQ3_M, etc.) que mejoran la precisión en modelos cuantizados, especialmente en tareas de razonamiento.
- No se dispone de información sobre capacidades de tool calling, agentes, visión, audio o razonamiento multi-step.

## Casos de uso

- Inferencia local en hardware de consumo: gracias a las cuantizaciones GGUF, el modelo puede ejecutarse en GPUs con 6-8 GB de VRAM usando Q4_K_M o Q5_K_M, lo que permite desplegar un asistente conversacional en equipos personales.
- Prototipado rápido de chatbots: al ser un modelo de 8B con formato GGUF, es adecuado para pruebas de concepto en entornos de desarrollo sin necesidad de infraestructura cloud.
- Integración en aplicaciones de chat mediante llama.cpp u Ollama: los quants están listos para usar con estas herramientas, facilitando la creación de interfaces de conversación locales.
- Fine-tuning posterior (si se obtiene el modelo base): aunque este repo solo contiene cuantizaciones, el modelo original podría usarse para ajuste fino en tareas específicas, siempre que la licencia lo permita.
- Evaluación de calidad de cuantización: los múltiples niveles de quant permiten comparar el rendimiento entre distintas precisiones y elegir el equilibrio óptimo entre tamaño y calidad.
- Despliegue en servidores con endpoints compatibles: el tag "endpoints_compatible" sugiere que puede usarse en servicios de inferencia que aceptan GGUF, como text-generation-inference o llama.cpp server.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo o sus cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para un modelo de 8B parámetros, los tamaños típicos son:
  - Q2_K: ~3.5 GB
  - Q4_K_M: ~5.2 GB
  - Q5_K_M: ~6.1 GB
  - Q6_K: ~7.2 GB
  Estas cifras son orientativas y pueden variar según la implementación y el contexto.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (p. ej., RTX 3060, RTX 4060) puede ejecutar las cuantizaciones más bajas. Para Q6_K se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4070, etc.).
- En consumer GPU: sí, las cuantizaciones Q2_K a Q5_K_M caben en GPUs de gama media.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (TGI) con soporte GGUF, o servidores compatibles con el formato.
- Latencia y throughput: no disponible. Dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en la misma categoría (8B, GGUF, conversacional) dentro de los datos proporcionados. Se recomienda comparar con otros modelos de 7-8B como Llama 3.1 8B, Mistral 7B o Qwen 2.5 7B, pero no hay datos objetivos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial o la redistribución pueden estar restringidos. Es imprescindible consultar la licencia del modelo base en AxionLabsAI/Fresco-1.2.5 antes de cualquier uso en producción.
- Sin información sobre sesgos o alucinaciones: al no haber documentación sobre el entrenamiento, no se pueden evaluar riesgos de sesgo o tendencia a generar contenido falso.
- Pérdida de calidad por cuantización: las versiones de menor precisión (Q2_K, IQ1_M) pueden degradar significativamente la coherencia y el razonamiento del modelo.
- Contexto limitado desconocido: no se indica la longitud de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.
- Sin garantías de rendimiento: al ser una cuantización de un modelo no documentado, no hay evidencia de que cumpla estándares de calidad para tareas específicas.
- Repositorio sin mantenimiento aparente: las fechas de creación y actualización son de agosto de 2026, pero no hay actividad posterior ni métricas de uso (0 descargas, 0 likes).

## Enlaces

- Repositorio de cuantización: https://huggingface.co/mradermacher/Fresco-1.2.5-i1-GGUF
- Modelo base (AxionLabsAI): https://huggingface.co/AxionLabsAI/Fresco-1.2.5
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
