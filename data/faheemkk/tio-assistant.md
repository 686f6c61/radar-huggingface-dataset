# faheemkk/tio-assistant

## Resumen

`faheemkk/tio-assistant` es un ajuste fino (fine-tune) del modelo `google/gemma-3-270m-it`, publicado por el usuario faheemkk. Su propósito declarado es convertir notas de voz domésticas en acciones estructuradas en formato JSON, ejecutándose íntegramente en el dispositivo (on-device). El modelo se distribuye no como pesos estándar de Hugging Face, sino como un bundle de MediaPipe LLM Inference con extensión `.task` y cuantización dinámica int8, lo que lo orienta a su integración en la aplicación Tio.

El modelo hereda la arquitectura y el tamaño del Gemma 3 de 270 millones de parámetros en su variante instruction-tuned, pero no se publican detalles sobre el proceso de ajuste fino, los datos empleados ni las capacidades finales. El repositorio ocupa 0,3 GB y el artefacto principal (`tio-assistant.task`) pesa 295.210.126 bytes, coherente con un modelo de 270M cuantizado a int8.

La relevancia de esta ficha es limitada: se trata de una publicación reciente (noviembre de 2026) sin descargas ni interacciones, sin benchmarks y con documentación mínima. Resulta útil como ejemplo de despliegue de un LLM pequeño en MediaPipe para tareas de extracción estructurada en local, pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 270M) |
| Parametros totales | 270 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (bundle MediaPipe) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use |
| Formato de pesos | MediaPipe `.task` (no se publican safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-270m-it`, un transformer decoder-only de 270 millones de parámetros en su variante instruction-tuned. No se especifica en la model card qué técnica de ajuste fino se aplicó (SFT, LoRA, QLoRA u otra), ni el volumen o composición de los datos de entrenamiento, ni si hubo etapas de RLHF o DPO adicionales.

La innovación técnica destacable es el formato de exportación: el modelo se empaqueta como bundle de MediaPipe LLM Inference (`.task`) con cuantización dinámica int8, pensado para inferencia en el dispositivo sin dependencia de GPU dedicada. La model card proporciona el hash SHA-256 del artefacto (`e3ab84c420364490b8b01cef96445045294ad7787e2a7b7c3713218ccfc9ff0c`), lo que facilita la verificación de integridad en despliegues.

## Capacidades

- Conversión de notas de voz domésticas en acciones estructuradas en JSON (propósito declarado del fine-tune).
- Generación de texto y razonamiento básico heredados del modelo base Gemma 3 270M IT.
- Inferencia on-device mediante MediaPipe LLM Inference.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta soporte multilingüe explícito.
- No se documentan capacidades de visión, audio nativo ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Automatización del hogar por voz: el modelo transforma una nota de voz como "apaga la luz del salón" en un JSON de acción que la app Tio interpreta localmente, sin enviar audio a la nube.
- Asistentes personales con privacidad estricta: al ejecutarse en el dispositivo, permite procesar dictados y comandos sin que los datos salgan del teléfono.
- Extracción de entidades en notas de voz: conversión de recordatorios, listas de la compra o eventos en estructuras JSON para su almacenamiento en una base de datos local.
- Integración en aplicaciones móviles con MediaPipe: el bundle `.task` se carga directamente en el runtime de MediaPipe, lo que simplifica el despliegue en Android e iOS.
- Prototipado de pipelines de voz a acción: sirve como componente de referencia para validar flujos de reconocimiento de voz más extracción estructurada con un modelo de 270M.
- Filtrado y normalización de comandos: al ser un modelo pequeño, encaja como etapa previa que normaliza la intención del usuario antes de pasarla a un sistema de reglas o a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto int8 ocupa aproximadamente 295 MB, por lo que la inferencia cabe en menos de 1 GB de memoria en la mayoría de configuraciones.
- GPU recomendadas: no se especifican; el modelo está diseñado para ejecución on-device (CPU/NPU de dispositivos móviles) mediante MediaPipe.
- Cabe en GPU de consumo: sí, con amplio margen, aunque el formato `.task` está orientado a móvil y no a GPUs de escritorio.
- Opciones de despliegue: MediaPipe LLM Inference (formato nativo). No se publican pesos en safetensors ni GGUF, por lo que vLLM, llama.cpp, Ollama o TGI no son utilizables directamente sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| faheemkk/tio-assistant | 270M | no disponible | MediaPipe `.task` (int8) | Gemma Terms of Use | Fine-tune especializado en JSON de acciones, on-device |
| google/gemma-3-270m-it | 270M | no disponible | safetensors | Gemma Terms of Use | Modelo base instruction-tuned, propósito general |
| Qwen2.5-0.5B-Instruct | 500M | no disponible | safetensors, GGUF | Apache 2.0 | Alternativa de tamaño similar con soporte amplio de runtimes |

## Limitaciones y advertencias

- Documentación mínima: no se detallan datos de entrenamiento, idiomas, contexto ni evaluación, lo que dificulta estimar su calidad real.
- Riesgo de alucinación: al ser un modelo de 270M, la generación de JSON puede producir claves o valores inválidos; se recomienda validación estricta del esquema en producción.
- Sin garantías de soporte multilingüe: no se declara qué idiomas maneja el fine-tune.
- Formato propietario de despliegue: al publicarse solo como bundle MediaPipe, no es trivial reutilizarlo fuera de ese runtime.
- Licencia Gemma: el uso comercial y la redistribución están sujetos a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, que imponen restricciones adicionales respecto a licencias permisivas como Apache 2.0.
- Sin tracción comunitaria: cero descargas y cero likes en el momento de la consulta, sin evidencia de validación por terceros.
- No apto como modelo de propósito general: su ajuste está orientado a una tarea concreta de extracción de acciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/faheemkk/tio-assistant
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
