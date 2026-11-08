# Mincofficial/Minico-M1-Preview-ONNX

## Resumen

Minico M1 Preview ONNX es la exportación a formato ONNX del primer checkpoint de la familia Minico M1, desarrollada por Mincofficial. Se trata de un modelo de generación de texto de 350 millones de parámetros, construido como una modificación de LiquidAI/LFM2.5-350M de Liquid AI, y orientado a ejecución en el navegador mediante Transformers.js y ONNX Runtime con aceleración WebGPU. Su rasgo más distintivo es un modo de razonamiento explícito con cuatro niveles de esfuerzo configurables (`low`, `medium`, `high` y `max`).

El modelo se distribuye en dos variantes: una cuantizada a 8 bits de 520 MB y una de precisión completa de 1.719 MB, con una concordancia de tokens del 99,4% y el 100% respectivamente frente a la implementación en PyTorch. La arquitectura subyacente es LFM2, un transformer híbrido propio de Liquid AI, con una ventana de contexto que LLM Explorer cifra en 125K tokens.

Es relevante ahora por dos motivos: demuestra que es viable desplegar un modelo con razonamiento explícito enteramente en el dispositivo del usuario, sin enviar datos a servidores externos, y porque la model card lo marca explícitamente como obsoleto en favor de Minico M1 1105, que obtiene mejores resultados y soporta tool calling. La licencia LFM Open License v1.0 permite uso comercial a organizaciones por debajo de un umbral de ingresos definido en el propio texto de la licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido LFM2 (base: LiquidAI/LFM2.5-350M) |
| Parámetros totales | 350M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 125K tokens (según LLM Explorer; no confirmado en la model card) |
| Tipos de cuantización | q8 (pesos a 8 bits, bloques de 32 vía MatMulNBits y GatherBlockQuantized) y fp32 |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial permitido bajo umbral de ingresos |
| Formato de pesos | ONNX (model_quantized.onnx, model.onnx); safetensors en el repo base |
| Tamaño del repo | 2,2 GB |
| Tamaño de pesos | 520 MB (q8) / 1.719 MB (fp32) |
| Librería | transformers.js |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura LFM2 de Liquid AI, un diseño de transformer híbrido que combina capas de atención con capas de convolución de estado, optimizado para inferencia eficiente en dispositivos con recursos limitados. La exportación ONNX reutiliza el grafo de Liquid AI para LFM2.5-350M, sustituyendo los pesos por los del checkpoint Preview. A diferencia de modelos posteriores de la familia Minico, el Preview mantiene una capa de salida separada (`lm_head`), de modo que los logits del grafo leen su propio peso en lugar de reutilizar el embedding de entrada.

Los pesos del modelo base Minico-M1-Preview son a su vez una exportación en float16 de un GGUF Q8_0, lo que explica que la build de 8 bits reproduzca el comportamiento del modelo original con tanta fidelidad. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es el mecanismo de esfuerzo de razonamiento (`reasoning_effort`) con cuatro niveles, que controla la profundidad del bloque de pensamiento; según la model card, los razonamientos son breves en todos los niveles, entre 21 y 49 tokens en sus prompts de prueba.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat (`apply_chat_template`).
- Razonamiento explícito mediante bloque `<think>` con cuatro niveles de esfuerzo: `low`, `medium`, `high` (por defecto) y `max`.
- Modo sin razonamiento mediante `enable_thinking: false`, que responde directamente.
- Razonamiento aritmético básico y resolución de problemas tipo test (el ejemplo de la model card es un cálculo de descuento).
- Ejecución en el navegador con WebGPU (Chrome y Edge 113 o superior, Safari 26) o con fallback a WASM.
- Procesamiento local: ningún dato del usuario sale del dispositivo.
- No soporta tool calling ni function calling (la model card remite a Minico M1 1105 para esa capacidad).
- No dispone de capacidades de visión ni audio.
- Multilingüismo limitado al inglés.

## Casos de uso

- Asistente educativo en el navegador: el modelo puede resolver problemas aritméticos y de razonamiento paso a paso con el bloque de pensamiento visible, útil para plataformas de aprendizaje que quieran mostrar el razonamiento al estudiante sin coste de servidor.
- Demos interactivas sin backend: al ejecutarse con Transformers.js y WebGPU, permite publicar una demo de chat en una página estática sin infraestructura de inferencia, con la variante q8 de 520 MB como opción recomendada.
- Procesamiento de texto sensible en local: aplicaciones de salud, legal o finanzas donde el usuario no puede enviar contenido a la nube pueden usar el modelo en el dispositivo, ya que nada de lo que se escribe sale del ordenador.
- Prototipado rápido de interfaces conversacionales: gracias a la plantilla de chat y al control de `reasoning_effort`, es adecuado para validar flujos de conversación multi-turno antes de migrar a un modelo mayor.
- Clasificación y extracción ligera de texto en inglés: con 350M parámetros y contexto largo, puede resumir o extraer información de documentos extensos en entornos con hardware modesto.
- Evaluación comparativa de exportaciones ONNX: sirve como referencia para verificar pipelines de cuantización, dado que la model card documenta la concordancia token a token (99,4% en q8) frente a PyTorch.
- Filtrado y moderación de contenido en el cliente: al ejecutarse en el navegador, puede preclasificar texto antes de enviarlo a un servicio remoto, reduciendo coste y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de concordancia entre la exportación ONNX y el modelo PyTorch:

| Build | dtype | Peso | Tamaño | Concordancia con PyTorch |
|---|---|---|---|---|
| model_quantized.onnx | q8 | 8 bits | 520 MB | 99,4% |
| model.onnx | fp32 | precisión completa | 1.719 MB | 100% |

La concordancia se mide como la proporción de tokens en los que la elección principal de la build ONNX coincide con la salida greedy del modelo PyTorch, sobre 6 prompts y 347 tokens con ONNX Runtime 1.31 en CPU.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,8 GB según LLM Explorer; la build q8 ocupa 520 MB de pesos y la fp32 1.719 MB.
- Cabe en cualquier GPU de consumo moderna y en muchas integradas, al ejecutarse vía WebGPU en el navegador.
- GPUs recomendadas: no se especifican modelos concretos; funciona en Chrome y Edge 113 o superior y Safari 26 con WebGPU habilitado.
- Fallback sin WebGPU: `device: "wasm"`, considerablemente más lento según la model card.
- Opciones de despliegue: Transformers.js con ONNX Runtime (WebGPU o WASM); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para esta build.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Minico M1 Preview ONNX | 350M | 125K (según LLM Explorer) | ONNX | LFM Open License v1.0 | Obsoleto; sin tool calling |
| Minico M1 1105 ONNX | no disponible | no disponible | ONNX | no disponible | Sucesor recomendado; soporta herramientas |
| LiquidAI/LFM2.5-350M | 350M | no disponible | safetensors / ONNX | LFM Open License v1.0 | Modelo base original de Liquid AI |

## Limitaciones y advertencias

- Modelo marcado como obsoleto por el propio autor: se conserva solo para comparación y se recomienda Minico M1 1105 para uso real.
- No soporta tool calling ni function calling, lo que limita su uso en pipelines de agentes.
- Solo inglés: no hay soporte multilingüe documentado.
- Riesgo de alucinación inherente a un modelo de 350M; no se han publicado evaluaciones de fidelidad factual.
- Los razonamientos son muy breves (21 a 49 tokens en las pruebas del autor), por lo que el modo `max` no equivale a cadenas de pensamiento extensas.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia LFM Open License v1.0: el uso comercial está permitido solo a organizaciones por debajo del umbral de ingresos definido en el texto de la licencia; es imprescindible leerla antes de un uso comercial.
- El contexto de 125K proviene de una fuente secundaria (LLM Explorer) y no está confirmado en la model card.
- Sin WebGPU, el rendimiento en WASM es notablemente inferior, lo que puede hacer inviable el uso interactivo.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mincofficial/Minico-M1-Preview-ONNX
- Modelo base: https://huggingface.co/Mincofficial/Minico-M1-Preview
- Sucesor recomendado: https://huggingface.co/Mincofficial/Minico-M1-1105-ONNX
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-350M
- Exportación ONNX de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-350M-ONNX
- Demo en navegador: https://minico.mincoffical.codes/try/
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Ficha en LLM Explorer: https://llm-explorer.com/model/Mincofficial%2FMinico-M1-Preview,7sSkOlJFc1JnKEHtrlG22W
