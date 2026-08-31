# ldalbe/calorie-lfm2.5-350m-onnx

## Resumen

El modelo `ldalbe/calorie-lfm2.5-350m-onnx` es un ajuste fino del modelo base `LiquidAI/LFM2.5-350M` de Liquid AI, especializado en convertir descripciones de comidas o alimentos en lenguaje natural en una estimación estructurada de ingredientes y calorías. El resultado se devuelve como un array JSON con campos estrictos (ingrediente, calorías por medida, tipo de medida y cantidad), lo que permite calcular el total calórico de forma programática. Está empaquetado como un export ONNX cuantizado en Q4F16, diseñado para inferencia en el lado del cliente mediante Transformers.js y WebGPU, sin necesidad de servidor.

El modelo base LFM2.5-350M es el modelo más pequeño de la familia LFM2.5 de Liquid AI, con 350 millones de parámetros y una arquitectura híbrida optimizada para dispositivos con recursos limitados. Ha sido pre-entrenado con 28 billones de tokens y refinado con aprendizaje por refuerzo, lo que le confiere buenas capacidades de chat, seguimiento de instrucciones y tool calling. Este ajuste fino concreto se realizó mediante LoRA sobre 21.250 ejemplos sintéticos, fusionando los pesos y convirtiéndolos a ONNX para su despliegue en navegador. Su relevancia actual radica en permitir aplicaciones de estimación nutricional completamente client-side, con privacidad y latencia mínima, aprovechando la aceleración WebGPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida LFM2.5 (atención + SSM, según Liquid AI) |
| Parametros totales | 350 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (según LM Studio) |
| Tipos de cuantizacion | Q4F16 (ONNX) |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (licencia personalizada, `other`) |
| Formato de pesos | ONNX (con cuantización Q4F16) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-350M emplea una arquitectura híbrida que combina mecanismos de atención con capas de espacio de estados (SSM), diseñada por Liquid AI para lograr inferencia rápida en CPU y GPU de bajo consumo. El pre-entrenamiento se extendió de 10 a 28 billones de tokens, seguido de un refinamiento con aprendizaje por refuerzo a gran escala, mejorando el seguimiento de instrucciones y el tool calling respecto a la versión anterior LFM2-350M.

El ajuste fino específico para estimación de calorías se realizó con LoRA sobre 21.250 ejemplos sintéticos generados automáticamente, durante aproximadamente una época. Tras el entrenamiento, los adaptadores LoRA se fusionaron con los pesos base y el modelo se exportó a ONNX con cuantización Q4F16 (bloques de 32) para reducir el tamaño a unos 243 MB. El modelo está entrenado para producir exclusivamente JSON con el esquema definido: un array de objetos con `ingredient`, `caloriesPerMeasurement`, `measurementType` (whole o grams) y `amount`. No se aplicaron técnicas adicionales como RLHF o DPO en este ajuste fino.

## Capacidades

- Generación de texto estructurado: produce JSON válido con ingredientes y estimaciones calóricas a partir de descripciones de comidas en lenguaje natural.
- Estimación de calorías por ingrediente: devuelve calorías por unidad o por gramo, permitiendo calcular el total sumando `caloriesPerMeasurement * amount`.
- Inferencia en el navegador: compatible con Transformers.js y WebGPU, sin necesidad de backend.
- Seguimiento de instrucciones: el modelo base LFM2.5-350M tiene buenas capacidades de chat y tool calling, aunque este ajuste fino se centra en la tarea específica de extracción de ingredientes.
- Multilingüe: no, solo inglés (aunque podría generalizar parcialmente a otros idiomas, no está garantizado).
- Sin capacidades de visión, audio ni razonamiento multimodal.

## Casos de uso

- Aplicaciones de seguimiento dietético en el navegador: el usuario describe su comida ("un huevo frito con tostada y dos tiras de bacon") y la aplicación muestra el desglose calórico al instante, sin enviar datos a un servidor.
- Asistentes de nutrición sin conexión: integrable en Progressive Web Apps (PWA) para funcionar offline, ideal para zonas con conectividad limitada.
- Prototipos rápidos de estimación de comidas: desarrolladores pueden integrar el modelo en demos o MVPs con pocas líneas de código usando Transformers.js.
- Análisis de menús en aplicaciones de restaurantes: permite estimar calorías de platos descritos por el usuario, con la advertencia de que los resultados son aproximados.
- Educación nutricional: herramienta didáctica para que estudiantes o usuarios aprendan a estimar el contenido calórico de alimentos comunes.
- Integración en asistentes de voz o chatbots locales: al ejecutarse en el dispositivo, se puede combinar con reconocimiento de voz para una experiencia completa sin servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este ajuste fino específico. La model card reporta una evaluación interna sobre 100 ejemplos held-out sintéticos:

| Metrica | Resultado |
|---|---|
| Ejemplos con JSON parseable | 100% |
| Coincidencia exacta con etiquetas sintéticas | 90% |

Estos datos miden la adherencia al esquema y la precisión frente a las etiquetas sintéticas de entrenamiento, no la exactitud nutricional real. No hay comparaciones con otros modelos de estimación de calorías en la información disponible.

## Requisitos de hardware

- Inferencia en navegador con WebGPU: requiere una GPU compatible con WebGPU (NVIDIA, AMD, Intel integrada moderna). La descarga inicial es de aproximadamente 243 MB.
- En CPU: puede ejecutarse con Transformers.js en modo CPU, aunque la latencia será mayor. El modelo base LFM2.5-350M está optimizado para CPU, por lo que es viable en equipos de gama media.
- VRAM estimada: al ser un modelo de 350M cuantizado a Q4F16, el uso de memoria es bajo (menos de 1 GB), apto para GPUs de consumo como RTX 2060 o superiores, y también para iGPUs modernas.
- Opciones de despliegue: Transformers.js (WebGPU/WebAssembly), ONNX Runtime Web, o cualquier runtime ONNX estándar (por ejemplo, en Node.js con `onnxruntime-node`).
- Latencia: no se proporcionan cifras exactas, pero en GPU WebGPU se espera una generación de 400 tokens en el orden de segundos; en CPU puede ser más lento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| ldalbe/calorie-lfm2.5-350m-onnx | 350M | 32k | Estimación de calorías (JSON) | LFM Open License v1.0 | ONNX Q4F16 |
| LiquidAI/LFM2.5-350M (base) | 350M | 32k | Chat general, tool calling | LFM Open License v1.0 | Safetensors, GGUF, ONNX |
| LiquidAI/LFM2.5-350M-ONNX | 350M | 32k | Chat general (export ONNX) | LFM Open License v1.0 | ONNX (varias cuantizaciones) |

No se han encontrado otros modelos específicos de estimación de calorías comparables en la información disponible. La comparativa se limita al modelo base y su export ONNX oficial, que no están especializados en la tarea nutricional.

## Limitaciones y advertencias

- Las estimaciones calóricas son aproximadas y no deben usarse como datos médicos, regulatorios o nutricionales oficiales. Las recetas, porciones y métodos de preparación varían.
- El modelo fue entrenado con datos sintéticos, por lo que puede fallar con alimentos inusuales, frases ambiguas o porciones no especificadas.
- Solo soporta inglés; descripciones en otros idiomas pueden producir resultados incorrectos.
- La licencia LFM Open License v1.0 es una licencia personalizada; se debe revisar el archivo LICENSE para conocer las restricciones exactas de uso comercial y redistribución.
- El modelo no tiene capacidad de razonamiento general más allá de la tarea de extracción de ingredientes; no es adecuado para conversación abierta ni otras tareas.
- La evaluación reportada (100% parseable, 90% exact match) se realizó sobre etiquetas sintéticas, no sobre datos reales de nutrición, por lo que la precisión en el mundo real puede ser menor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ldalbe/calorie-lfm2.5-350m-onnx
- Modelo base LFM2.5-350M: https://huggingface.co/LiquidAI/LFM2.5-350M
- Export ONNX oficial del base: https://huggingface.co/LiquidAI/LFM2.5-350M-ONNX
- Documentación de Liquid AI para LFM2.5-350M: https://docs.liquid.ai/lfm/models/lfm25-350m
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Página en LM Studio: https://lmstudio.ai/models/liquid/lfm2.5-350m
