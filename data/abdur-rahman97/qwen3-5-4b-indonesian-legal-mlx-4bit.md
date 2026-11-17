# abdur-rahman97/qwen3.5-4b-indonesian-legal-mlx-4bit

## Resumen

Qwen3.5 4B Indonesian Legal — MLX 4-bit es una exportación cuantizada del modelo Qwen3.5 4B Base de Alibaba Qwen, adaptada al dominio jurídico indonesio mediante un adaptador PEFT LoRA y convertida al formato MLX para su ejecución en hardware Apple Silicon. El modelo resultante tiene 4.205.751.296 parámetros y se distribuye bajo licencia Apache 2.0. Lo publica el usuario abdur-rahman97 en Hugging Face con el identificador abdur-rahman97/qwen3.5-4b-indonesian-legal-mlx-4bit.

El modelo resuelve un problema concreto: ofrecer asistencia en el dominio legal indonesio en un formato ligero (2,4 GB en reposo) que puede ejecutarse en equipos con memoria unificada de Apple mediante la librería MLX. La cuantización affine de 4 bits con tamaño de grupo 64 reduce el peso del modelo respecto a los pesos BF16 originales, a costa de una posible pérdida de precisión que el autor recomienda reevaluar antes de usar en producción.

Es relevante ahora porque combina tres tendencias: la familia Qwen3.5 como base abierta, la especialización vertical mediante LoRA en un dominio regulado (derecho indonesio) y el despliegue local en hardware de consumo Apple. No obstante, el modelo es text-only (la torre de visión no está incluida en esta exportación) y está pensado exclusivamente para indonesio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), exportación MLX text-only |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits affine, group size 64 (MLX) |
| Idiomas soportados | indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), quantized |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5 4B Base, un transformer de la familia Qwen3.5 con 4.205.751.296 parámetros. Sobre ese modelo base se aplicó un adaptador PEFT LoRA especializado en el dominio jurídico indonesio. El proceso de conversión descrito en la model card es: fusión del adaptador LoRA en el modelo base en BF16, conversión a formato MLX y posterior cuantización con `mlx_lm.convert --quantize --q-bits 4 --q-group-size 64`.

La implementación de Qwen3.5 en MLX utilizada para esta exportación es solo de texto; la torre de visión del modelo original no se incluye. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset jurídico, ni si hubo fases de RLHF o DPO en el modelo base o en el adaptador. El autor remite a un "project conversion manifest" para detalles de procedencia y validación, aunque no se proporciona el enlace en la información disponible.

## Capacidades

- Generación de texto en indonesio, orientada al dominio jurídico.
- Asistencia en consultas sobre normativa indonesia (por ejemplo, la Ley de Protección de Datos Personales, citada en el ejemplo de uso de la model card).
- Conversación multi-turno mediante plantilla de chat (se usa `<|im_end|>` como token EOS adicional y configuración de plantilla de chat con `enable_thinking: false`).
- Modo de razonamiento desactivable: la plantilla de chat admite el parámetro `enable_thinking`, lo que sugiere soporte de un modo de pensamiento (thinking) heredado de la familia Qwen3.5, aunque en el ejemplo se desactiva.
- Ejecución local en Apple Silicon mediante MLX y mlx-lm.
- No incluye visión: la torre visual del modelo base no está en esta exportación.
- No se documenta soporte de tool calling, function calling ni capacidades de agente en la información disponible.

## Casos de uso

- Asistencia jurídica en indonesio: responder preguntas sobre legislación indonesia (por ejemplo, protección de datos personales) usando el modelo en local, adecuado por su especialización LoRA y su tamaño contenido de 4,2 mil millones de parámetros.
- Prototipado en equipos Apple: desarrolladores que trabajan en Mac con memoria unificada pueden ejecutar el modelo con mlx-lm sin GPU dedicada, gracias a la cuantización de 4 bits y al peso de 2,4 GB del repositorio.
- Primer filtro de consultas legales: clasificar y orientar consultas de usuarios hacia la normativa relevante antes de la revisión por un profesional, dado el dominio jurídico del adaptador.
- Investigación sobre especialización vertical: servir como caso de estudio de fusión LoRA y cuantización MLX para comparar la degradación de precisión frente al modelo BF16.
- Generación de borradores de texto jurídico en indonesio: redacción asistida de resúmenes o explicaciones de normativa, siempre con revisión humana posterior.
- Evaluación de pipelines de cuantización: usar el modelo para medir el impacto de la cuantización affine de 4 bits con group size 64 en tareas legales, tal como recomienda el autor antes de producción.
- Despliegue offline en entornos con requisitos de privacidad: al ejecutarse localmente en MLX, no requiere enviar consultas a servicios externos, lo que encaja en flujos con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que debe reevaluarse el modelo cuantizado sobre el benchmark legal completo antes de usarlo en producción.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 2,4 GB en cuantización de 4 bits; se necesita memoria unificada suficiente para cargar los pesos más el contexto de inferencia (el valor exacto no está disponible).
- Hardware objetivo: Apple Silicon (MLX). No se documenta soporte para CUDA en esta exportación.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables de forma nativa, ya que el formato es MLX; requeriría conversión a otro runtime.
- Cabe en equipos Apple con memoria unificada moderada gracias a los 2,4 GB de pesos, aunque el mínimo exacto no está disponible.
- Opciones de despliegue: mlx-lm (comando `mlx_lm.generate` documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5 4B Indonesian Legal MLX 4-bit (este) | 4.205.751.296 | no disponible | MLX safetensors 4-bit | Apache 2.0 | Especializado en legal indonesio, text-only, Apple Silicon |
| Qwen/Qwen3.5-4B-Base | 4B (aprox.) | no disponible | safetensors BF16 | no disponible en la información | Modelo base generalista, sin especialización legal |
| Adaptador LoRA original (PEFT) | no disponible | no disponible | PEFT | no disponible | Requiere fusión o carga con el base; no cuantizado |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que el modelo no sustituye la revisión por un profesional jurídico cualificado y que las respuestas deben contrastarse con fuentes oficiales actualizadas.
- Riesgo de degradación por cuantización: la conversión a 4 bits puede reducir la precisión; se recomienda reevaluar sobre el benchmark legal completo antes de producción.
- Sesgos: no documentados en la información disponible; al estar especializado en derecho indonesio, puede reflejar sesgos del corpus jurídico utilizado.
- Riesgo de alucinación: no cuantificado; en dominio legal el impacto de respuestas incorrectas es alto.
- Idioma: soporta únicamente indonesio (id); no se garantiza calidad en otros idiomas.
- Contexto: la longitud de contexto no está documentada en esta exportación.
- Sin visión: la torre visual no está incluida, por lo que no admite entradas de imagen.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia del modelo base y del dataset legal empleado en el adaptador, no detallada aquí.
- Formato MLX: limita el despliegue a ecosistema Apple; para otros entornos sería necesaria una conversión.

## Enlaces

- Hugging Face: https://huggingface.co/abdur-rahman97/qwen3.5-4b-indonesian-legal-mlx-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Librería MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Paper, blog, repositorio del adaptador LoRA y manifest de conversión: no disponibles en la información proporcionada.
