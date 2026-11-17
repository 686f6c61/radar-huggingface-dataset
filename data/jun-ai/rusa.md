# jun-ai/Rusa

## Resumen

Rusa es un modelo de 350M parámetros desarrollado por jun-ai que reescribe texto generado por IA para que suene a escritura humana, preservando cada dato, cifra, nombre y cita del original. Se construye sobre LiquidAI/LFM2-350M, un transformer de la familia LFM2 de Liquid AI, y se distribuye con pesos en safetensors, GGUF y ONNX, lo que permite ejecutarlo desde una CPU hasta un navegador con WebGPU.

El modelo se ha destilado a partir de un modelo profesor de 12B especializado en reescritura y posteriormente se ha afinado con preferencias sobre sus propias muestras, usando el profesor de 12B como ranker y un verificador de hechos como filtro. El resultado es un modelo 35 veces más pequeño que su profesor que, según la evaluación del autor, conserva los hechos con mayor fiabilidad (83 de 209 borradores frente a 67 del profesor en una sola muestra).

Su relevancia actual radica en el nicho concreto que cubre: la "humanización" de texto sintético con preservación estricta de información, una tarea donde los modelos grandes son caros y los pequeños suelen degradar el contenido. Con 350M parámetros, cuantización Q8_0 de 362 MB y soporte de Transformers.js, es desplegable en entornos con recursos mínimos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LFM2, base LiquidAI/LFM2-350M) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entradas de entrenamiento hasta ~450 palabras) |
| Tipos de cuantizacion | BF16 (safetensors), GGUF F16/Q8_0/Q6_K/Q4_K_M, ONNX fp32/fp16/q8/q4/q4f16 |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors, GGUF, ONNX |

## Arquitectura y entrenamiento

Rusa hereda la arquitectura del modelo base LiquidAI/LFM2-350M, un transformer decoder-only de la familia LFM2 de Liquid AI. No se especifican en la información disponible detalles adicionales sobre la arquitectura interna (tipo de atención, normalización, etc.) más allá de su pertenencia a LFM2.

El entrenamiento combina dos fases: primero una destilación desde un modelo profesor de 12B especializado en reescritura, y después un ajuste por preferencias sobre muestras generadas por el propio Rusa, donde el profesor de 12B actúa como ranker y un verificador de hechos filtra las candidatas. El conjunto de evaluación son 209 borradores escritos por IA, repartidos entre ensayos, correos, reseñas, posts de foro y tutoriales. El modelo usa un formato de prompt en texto plano (sin plantilla de chat) con el marcador `### Rewritten:` y terminación mediante `<|im_end|>`.

## Capacidades

- Reescritura de texto para reducir la probabilidad de ser detectado como generado por IA, según el clasificador desklib/ai-text-detector-v1.01.
- Preservación estricta de hechos: números, unidades, fechas, nombres y citas se mantienen sin cambios en las reescrituras.
- Reorganización libre del contenido: variación deliberada de la longitud de las frases, eliminación de hedging y de frases introductorias vacías.
- Generación con muestreo: recomienda `temperature=1.0`, `top_p=0.95`, `top_k=0` y sin penalización de repetición; el muestreo múltiple y selección de la mejor salida mejora la conservación de hechos.
- Ejecución en CPU, en teléfono y en navegador (Transformers.js v4 con WebGPU o WASM).
- Compatible con endpoints (tag `endpoints_compatible`).
- No soporta tool calling, agentes, visión, audio ni modo thinking según la información disponible.
- Multilingüe: no, solo inglés.

## Casos de uso

- Humanización de contenido editorial: reescribir borradores generados por LLM antes de publicarlos en blogs o newsletters, manteniendo cifras y citas verificables. El modelo está entrenado específicamente para esta tarea y conserva los hechos en 83 de 209 borradores con una sola muestra.
- Reescritura en el navegador: integrar la versión ONNX q4f16 (248 MB) con Transformers.js para ofrecer una función de "humanizar" en una web sin enviar el texto a un servidor. El soporte de WebGPU permite inferencia local en el cliente.
- Procesamiento por lotes en CPU: desplegar el GGUF Q8_0 (362 MB) con llama.cpp o LM Studio en servidores sin GPU para reescribir grandes volúmenes de texto de marketing o documentación.
- Limpieza de textos de soporte y correos: reescribir respuestas automáticas para que suenen naturales antes de enviarlas, con la garantía de que importes, fechas y nombres de producto se mantienen.
- Preprocesado en pipelines de datos: usar Rusa como etapa de reescritura en la generación de datasets sintéticos más naturales, ejecutándolo en paralelo en CPU dado su reducido tamaño.
- Aplicaciones móviles o de escritorio: empaquetar el GGUF Q4_K_M (219 MB) en una app local para reescritura de textos sin conexión. El autor advierte que en modelos de 350M la cuantización a 4 bits degrada más la calidad que en modelos grandes, por lo que Q8_0 es la opción recomendada.
- Moderación de estilo en foros o comunidades: reescribir automáticamente publicaciones marcadas como generadas por IA para mantener un tono humano, con revisión humana posterior de cifras y citas.

## Benchmarks y rendimiento

Evaluación del autor sobre 209 borradores de prueba escritos por IA. La puntuación de probabilidad de IA proviene del clasificador desklib/ai-text-detector-v1.01 (menor es mejor); se marca como detectado si supera 0.5. "Conserva los hechos" significa que todos los números, fechas, nombres y citas del borrador sobreviven.

| Modelo | Tamaño | Puntuación media IA ↓ | Marcados como IA ↓ | Conserva todos los hechos ↑ | Conserva todos los hechos, mejor de 8 ↑ |
|---|---|---|---|---|---|
| Profesor 12B | 12B | 0.190 | 30 / 209 | 67 / 209 | 146 / 209 |
| Rusa | 350M | 0.236 | 46 / 209 | 83 / 209 | 185 / 209 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en BF16 (pesos de ~710 MB); ~250-500 MB con cuantización ONNX q4f16 o GGUF Q4_K_M.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100 ni H100. Funciona en GPUs integradas y en CPU.
- Cabe en cualquier GPU de consumo: RTX 4090, RTX 3060, e incluso GPUs integradas y móviles.
- Opciones de despliegue: Transformers (BF16), vLLM (según la model card), llama.cpp, LM Studio, Ollama (GGUF), ONNX Runtime y Transformers.js v4 en navegador (WebGPU o WASM).
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que es "suficientemente pequeño para ejecutarse en una CPU, en un teléfono o completamente en el navegador".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rusa | 350M | no disponible | Reescritura/humanización con preservación de hechos | LFM Open License v1.0 | Hugging Face (safetensors, GGUF, ONNX) |
| Profesor 12B (sin identificar) | 12B | no disponible | Reescritura/humanización | no disponible | no disponible |
| LiquidAI/LFM2-350M (base) | 350M | no disponible | Generación de texto general | LFM Open License v1.0 | Hugging Face |

No se dispone de información sobre otros modelos especializados en humanización de texto comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Solo inglés; no soporta otros idiomas.
- La conservación de hechos es buena pero no perfecta: el autor recomienda verificar números, nombres y citas antes de publicar una reescritura.
- Entradas de más de ~450 palabras quedan fuera del rango de entrenamiento; hay que dividir documentos largos en párrafos.
- No debe usarse para atribuirse autoría de forma fraudulenta donde esté prohibido, como en trabajos académicos.
- La cuantización a 4 bits degrada la calidad más que en modelos grandes; se recomienda Q8_0 para GGUF y q8/fp16 para ONNX.
- Licencia LFM Open License v1.0: conviene revisar sus términos antes de uso comercial, ya que no es una licencia permisiva estándar (no es Apache 2.0 ni MIT).
- Riesgo de alucinación: aunque el modelo está diseñado para preservar hechos, no hay garantía formal; el filtrado con verificador de hechos se aplicó en entrenamiento, no en inferencia.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El tag de licencia en Hugging Face aparece como "other" con nombre "lfm1.0"; verificar compatibilidad con el uso previsto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jun-ai/Rusa
- Modelo base: https://huggingface.co/LiquidAI/LFM2-350M
- Clasificador usado en la evaluación: https://huggingface.co/desklib/ai-text-detector-v1.01
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
