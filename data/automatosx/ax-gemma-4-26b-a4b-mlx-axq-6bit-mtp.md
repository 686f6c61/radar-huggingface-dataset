# AutomatosX/AX-gemma-4-26b-a4b-MLX-AXQ-6bit-MTP

## Resumen

AX-gemma-4-26b-a4b-MLX-AXQ-6bit-MTP es un checkpoint cuantizado del modelo Gemma 4 26B-A4B de Google, desarrollado por AutomatosX. Utiliza la técnica de cuantización de precisión mixta AXQ (AXQuant) con un promedio de 6 bits por peso, optimizado para ejecutarse en hardware Apple Silicon mediante la librería MLX. El modelo incluye un drafter para decodificación especulativa multi-token (MTP), lo que puede acelerar la inferencia en dispositivos Apple. Está diseñado para ofrecer una calidad cercana al modelo original con un menor consumo de memoria, permitiendo ejecutar un modelo de gran tamaño en Macs con recursos limitados.

El modelo base es google/gemma-4-26b-a4b-it, una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y 4 mil millones activos por token. El checkpoint cuantizado presenta 5.183.007.774 parámetros en safetensors, lo que sugiere una compresión significativa. La licencia es Gemma, que permite uso comercial con restricciones. Este modelo es relevante para desarrolladores que buscan desplegar modelos de lenguaje grandes en hardware local de Apple sin sacrificar demasiada calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Gemma 4 (26B-A4B) |
| Parametros totales | 5.183.007.774 (según safetensors) |
| Parametros activos | 4B (según nomenclatura del modelo base, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AXQ 6-bit (precisión mixta) |
| Idiomas soportados | no disponibles |
| Licencia | Gemma (gemma) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint oficial google/gemma-4-26b-a4b-it, que emplea una arquitectura de mezcla de expertos (MoE) con 26B parámetros totales y 4B activos por token. La cuantización AXQ (AXQuant) aplica precisión mixta con un promedio de 6 bits por peso, logrando un tamaño de repositorio de 20.2 GB. Además, incluye un drafter "assistant" para decodificación especulativa multi-token (MTP), que permite predecir varios tokens a la vez y acelerar la inferencia en hardware Apple. No se dispone de información sobre el entrenamiento del modelo base, ya que es un checkpoint cuantizado, no un modelo entrenado desde cero.

## Capacidades

- Generación de texto conversacional.
- Decodificación especulativa MTP (multi-token prediction) para acelerar la inferencia (presente pero no certificada).
- Soporte de visión "present-not-certified": el sidecar de visión está presente pero no certificado; el smoke test con mlx-vlm falló por incompatibilidad de layout.
- No soporta audio (no hay torre de audio ni pesos sidecar).
- No se menciona soporte explícito de tool calling ni agentes.

## Casos de uso

- Despliegue local en Macs con Apple Silicon para aplicaciones de chat y asistentes personales: el modelo cabe en memoria unificada de 32 GB y ofrece respuestas de calidad gracias a la cuantización 6-bit.
- Prototipado rápido de aplicaciones de NLP en entornos sin GPU dedicada: al usar MLX, se integra fácilmente con el ecosistema de Apple y permite iterar sin infraestructura cloud.
- Inferencia en dispositivos con memoria limitada (16-32 GB): el tamaño de 20.2 GB permite ejecutar el modelo en Macs de gama media con suficiente RAM unificada.
- Investigación y experimentación con modelos MoE en hardware de consumo: la cuantización AXQ reduce la barrera de entrada para estudiar arquitecturas de mezcla de expertos.
- Generación de texto en aplicaciones de productividad (redacción, resumen, traducción): el modelo base Gemma 4 es competente en tareas de lenguaje natural y la cuantización mantiene una calidad ≥0.98 respecto al original.
- Uso como modelo base para fine-tuning o adaptación en tareas específicas: la licencia Gemma permite ajuste fino, aunque con restricciones comerciales que deben revisarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 20.2 GB, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos.
- Al ser MLX, está optimizado para Apple Silicon (M1, M2, M3, M4, etc.).
- Se recomienda una Mac con al menos 32 GB de memoria unificada para cargar el modelo en 6-bit (20 GB) y dejar espacio para el contexto y el drafter.
- Para la decodificación especulativa MTP, se necesita memoria adicional para el drafter.
- No es compatible con GPUs NVIDIA directamente, ya que usa MLX.
- Opciones de despliegue: MLX (librería nativa de Apple), con integración en proyectos que usen `mlx-lm` o el runtime AX Engine.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con otros modelos cuantizados similares. El modelo base sin cuantizar (google/gemma-4-26b-a4b-it) es la referencia principal, pero no se han publicado métricas comparativas en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización puede degradar ligeramente la calidad en comparación con el modelo original, aunque se certifica una retención de calidad ≥0.98.
- La visión no está certificada y el smoke test falló, por lo que no se recomienda usar para tareas multimodales.
- La decodificación especulativa MTP no está certificada (Tier 2), por lo que su rendimiento no está garantizado.
- La licencia Gemma tiene restricciones de uso comercial; es necesario revisar los términos de la licencia antes de desplegar en producción.
- No se dispone de información sobre sesgos o alucinaciones específicos del modelo cuantizado.
- El modelo solo es compatible con hardware Apple Silicon; no funcionará en GPUs NVIDIA o AMD sin conversión previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AutomatosX/AX-gemma-4-26b-a4b-MLX-AXQ-6bit-MTP
- Certificado Tier 1: https://github.com/defai-digital/axquant/blob/main/docs/certifications/gemma4-26b-a4b-axq6-tier1.md
- Modelo base (referencia): https://huggingface.co/google/gemma-4-26b-a4b-it
