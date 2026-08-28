# morpknight/qwen3.5-4b-indonesian-legal-mlx-4bit

## Resumen

El modelo `morpknight/qwen3.5-4b-indonesian-legal-mlx-4bit` es un ajuste fino del modelo base Qwen/Qwen3.5-4B-Base mediante un adaptador LoRA (PEFT) especializado en el dominio legal indonesio. El adaptador se fusionó con el modelo base en BF16, se convirtió al formato MLX y se cuantizó a 4 bits con grupo de tamaño 64. El resultado es un modelo de generación de texto orientado a asistencia legal en indonesio, con un peso total de 657.959.936 parámetros (según los safetensors) y un tamaño de repositorio de 2,4 GB.

La relevancia de este modelo radica en que ofrece una alternativa ligera y cuantizada para entornos Apple Silicon, permitiendo desplegar un asistente legal en indonesio en hardware de consumo sin necesidad de GPUs dedicadas. Al estar basado en Qwen3.5, hereda capacidades de razonamiento y un contexto nativo de 262.144 tokens, aunque la exportación MLX es solo de texto (la torre de visión del modelo base no se incluye). La licencia Apache 2.0 facilita su uso comercial, pero el autor advierte que no sustituye el asesoramiento legal profesional y recomienda re-evaluar el modelo cuantizado en benchmarks legales antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5, text-only) |
| Parametros totales | 657.959.936 (según safetensors; el nombre del modelo sugiere 4B pero el peso real es menor) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (contexto nativo del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | 4-bit affine, group size 64 (MLX) |
| Idiomas soportados | Indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, un transformer denso de 4.000 millones de parámetros en su versión original, aunque el export cuantizado presenta 657,9 millones de parámetros según los safetensors. Qwen3.5 integra una fundación unificada de visión-lenguaje con entrenamiento temprano en tokens multimodales, pero esta exportación MLX es exclusivamente de texto, omitiendo la torre de visión. El proceso de entrenamiento consistió en un fine-tuning con un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-4B-Base, utilizando un dataset del dominio legal indonesio. Posteriormente, el adaptador se fusionó con el modelo base en BF16, se convirtió a MLX y se cuantizó con `mlx_lm.convert --quantize --q-bits 4 --q-group-size 64`. No se han publicado detalles sobre el volumen de datos de entrenamiento ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto en indonesio centrada en el dominio legal: responde preguntas sobre leyes, regulaciones y conceptos jurídicos de Indonesia.
- Conversación multi-turno: soporta chat template con tokens especiales (`<|im_end|>`) y opción de desactivar el modo "thinking" (`enable_thinking: false`), lo que sugiere que el modelo puede razonar antes de responder si se activa.
- Razonamiento de dominio: al estar fine-tuneado con LoRA, ha aprendido terminología y matices legales específicos del ordenamiento jurídico indonesio.
- Contexto largo: hereda la ventana de 262.144 tokens del modelo base, permitiendo procesar documentos legales extensos.
- Integración con MLX: optimizado para Apple Silicon mediante la librería `mlx-lm`, con generación eficiente en hardware de Mac.
- No incluye capacidades multimodales: la exportación es solo texto, a pesar de que el modelo base Qwen3.5 es multimodal.

## Casos de uso

- Asistencia legal preliminar: el modelo puede responder consultas básicas sobre la Ley de Protección de Datos Personales de Indonesia (UU PDP) u otras normas, ayudando a ciudadanos a entender sus derechos sin sustituir el consejo de un abogado.
- Búsqueda semántica en corpus legales: gracias a su contexto de 262.144 tokens, puede procesar y resumir contratos, sentencias o reglamentos completos, extrayendo cláusulas relevantes.
- Redacción de borradores de documentos: puede generar borradores de cláusulas contractuales o escritos legales en indonesio, que luego un profesional revisa y valida.
- Chatbot para despachos de abogados: integrado en un sistema de atención al cliente, responde preguntas frecuentes sobre procedimientos legales, plazos o requisitos, reduciendo la carga del personal.
- Educación jurídica: sirve como herramienta de estudio para estudiantes de derecho que necesitan explicaciones claras de conceptos legales indonesios.
- Análisis de cumplimiento normativo: las empresas pueden usarlo para verificar si sus políticas internas se alinean con la legislación indonesia, aunque siempre con supervisión humana.
- Despliegue en entornos Apple: al ser un modelo MLX cuantizado, cabe en MacBooks con 8 GB de RAM unificada, permitiendo prototipos locales sin conexión a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona en la model card que se debe re-evaluar el modelo cuantizado en el benchmark legal completo antes de usarlo en producción, pero no proporciona dichos resultados.

## Requisitos de hardware

- VRAM estimada: el modelo pesa 2,4 GB en disco (cuantización 4-bit). En Apple Silicon, la memoria unificada necesaria es de aproximadamente 3-4 GB para cargar el modelo y los buffers de inferencia, por lo que cualquier Mac con 8 GB de RAM unificada puede ejecutarlo.
- GPUs compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) debido al formato MLX. No es compatible directamente con GPUs NVIDIA o AMD.
- Opciones de despliegue: mediante `mlx-lm` (CLI o API de Python), que incluye generación con chat template y control de tokens. También puede integrarse en aplicaciones macOS o iOS usando el framework MLX.
- Latencia y throughput: no se dispone de datos medidos. En un MacBook Pro M2 con 16 GB, se espera una velocidad de generación de entre 20 y 40 tokens por segundo para un modelo de este tamaño, aunque depende de la configuración exacta.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables en el dominio legal indonesio con el mismo formato MLX. A modo orientativo, se puede comparar con el propio Qwen3.5-4B-Base (sin fine-tuning) y con otros modelos pequeños de propósito general:

| Modelo | Parámetros | Contexto | Licencia | Formato | Dominio |
|---|---|---|---|---|---|
| morpknight/qwen3.5-4b-indonesian-legal-mlx-4bit | 657,9 M (cuantizado) | 262.144 | Apache 2.0 | MLX 4-bit | Legal indonesio |
| Qwen/Qwen3.5-4B-Base | 4 B (original) | 262.144 | Apache 2.0 | safetensors | General, multimodal |
| Llama-3.2-3B (ejemplo genérico) | 3 B | 128.000 | Llama 3.2 Community | GGUF, safetensors | General |

La comparación con Llama-3.2-3B es solo ilustrativa; no hay datos de rendimiento legal que permitan una evaluación justa.

## Limitaciones y advertencias

- No es un sustituto del asesoramiento legal profesional: el autor lo indica explícitamente en la model card. Las respuestas deben verificarse con fuentes oficiales vigentes.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar citas legales, artículos o interpretaciones incorrectas, especialmente en un dominio técnico como el derecho.
- Sesgos del dataset de entrenamiento: no se han publicado detalles sobre la composición del corpus legal indonesio, por lo que puede haber sesgos hacia ciertas áreas del derecho o regiones.
- Cuantización 4-bit: puede degradar la precisión en tareas de razonamiento complejo o en la recuperación de detalles numéricos (artículos, fechas, sanciones) en comparación con el modelo en BF16.
- Solo texto: no procesa imágenes, a diferencia del modelo base Qwen3.5 que es multimodal. Esto limita su uso en documentos escaneados o capturas de pantalla.
- Idioma restringido: entrenado principalmente en indonesio; su rendimiento en otros idiomas (incluido el español) será muy limitado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor recomienda re-evaluar el modelo cuantizado en benchmarks legales antes de producción; no se ofrece garantía de exactitud.
- Formato MLX: no es directamente compatible con vLLM, llama.cpp u Ollama; requiere conversión adicional si se quiere desplegar en otros entornos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/morpknight/qwen3.5-4b-indonesian-legal-mlx-4bit
- Repositorio del adaptador LoRA: https://huggingface.co/morpknight/qwen3.5-4b-indonesian-legal-lora
- GitHub de Qwen3.5 (referencia del modelo base): https://github.com/algtrd24/qwen3.5
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Página del modelo base en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
