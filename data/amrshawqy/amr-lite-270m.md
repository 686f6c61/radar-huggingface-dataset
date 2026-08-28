# amrshawqy/amr-lite-270m

## Resumen

Amr Lite 270M es un modelo de lenguaje experimental desarrollado por Amr Shawqy, basado en el modelo `google/gemma-3-270m-it` de Google. Se trata de un fine-tuning LoRA de 270 millones de parámetros, distribuido en formato ONNX para ejecutarse íntegramente en el navegador mediante Transformers.js, sin servidor de inferencia. Su propósito es demostrar que un modelo ajustado puede descargarse en aproximadamente un minuto y ejecutarse offline en el teléfono del visitante, como parte de un demo de tarjeta de visita NFC con gemelo digital.

El modelo ha sido entrenado para renderizar una respuesta de referencia recuperada externamente sobre Amr Shawqy y Signit, en un tono casual, y no para conocer hechos por sí mismo. En la práctica, reproduce solo alrededor del 52% de los tokens de hechos de la referencia proporcionada, por lo que el autor advierte explícitamente que no debe usarse como fuente de verdad. Está disponible en dos cuantizaciones: q4 (261 MiB, objetivo para móviles) y q8 (417 MiB, para escritorio y Android), y soporta inglés y árabe moderno estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, 18 capas, atención con ventana local y global) |
| Parametros totales | 270 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el prompt de sistema es ~139 tokens, el turno completo cabe en el presupuesto de contexto) |
| Tipos de cuantizacion | q4 (261 MiB), q8 (417 MiB), fp32 (referencia, no distribuido) |
| Idiomas soportados | Inglés, árabe moderno estándar |
| Licencia | Gemma Terms of Use (hereda de google/gemma-3-270m-it) |
| Formato de pesos | ONNX (para Transformers.js) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 270M, un transformer denso de 18 capas con atención híbrida (ventana local y global) y 270 millones de parámetros, entrenado por Google sobre 6 billones de tokens. Sobre esta base, Amr Shawqy aplicó un fine-tuning LoRA con Apple MLX en un M1 Pro: rank 16, alpha 16, dropout 0.05, aplicado a todas las proyecciones de atención y MLP de las 18 capas, con enmascaramiento de prompt para entrenar solo el turno del asistente. El dataset consistió en 704 ejemplos (~19% en árabe), con batch 2 y acumulación de gradiente 2, learning rate 1e-4 con decaimiento coseno, 8 épocas, en unos 20 minutos de entrenamiento.

El checkpoint distribuido no es el de menor pérdida de validación (el autor considera que la pérdida no es un buen proxy aquí porque hay muchas paráfrasis correctas), sino el que obtuvo mejor puntuación en una puerta de evaluación específica de la tarea. El modelo se entrenó contra un prompt de sistema fijo (`system-prompt.txt`) que sustituye `{{TWIN_NAME}}` por "Amr Lite" y `{{FACTS}}` por exactamente una respuesta recuperada o la cadena literal `(nothing retrieved)`.

## Capacidades

- Generación de texto conversacional en inglés y árabe moderno estándar, con tono casual.
- Renderizado de una respuesta de referencia proporcionada en el contexto, reformulándola con voz natural.
- Ejecución completamente en el dispositivo (navegador) mediante WebGPU o WASM, sin servidor de inferencia.
- Soporte de cuantización q4 y q8 para adaptarse a distintos niveles de hardware.
- No soporta tool calling, ni razonamiento multi-paso, ni capacidades de visión o audio.
- No conoce hechos por sí mismo: depende de la capa de recuperación externa que le suministra la referencia.

## Casos de uso

- Demo de gemelo digital en tarjeta de visita NFC: el modelo se ejecuta en el teléfono del visitante, offline, y responde preguntas sobre Amr Shawqy y Signit usando una respuesta recuperada externamente. Es el caso de uso previsto y el único documentado.
- Demostración de fine-tuning on-device: sirve como ejemplo de que un modelo pequeño puede ajustarse con LoRA y desplegarse en el navegador con Transformers.js, mostrando el flujo completo de entrenamiento, cuantización y ejecución.
- Prototipo de asistente conversacional con privacidad total: al no enviar datos a ningún servidor, puede usarse como base para experimentos donde la privacidad del usuario es crítica, aunque con las limitaciones de fidelidad descritas.
- Prueba de concepto de RAG ligero: el modelo demuestra cómo combinar una capa de recuperación externa con un generador pequeño para producir respuestas contextualizadas, aunque con una fidelidad limitada (~52%).
- Evaluación de impacto de cuantización: los datos de la puerta de evaluación (fidelity%, fact%, degen) permiten comparar el efecto de q4 vs q8 en un modelo pequeño, útil para decidir compensaciones en despliegues reales.
- Material educativo para desarrolladores: el repositorio incluye el prompt de sistema exacto, el código de inferencia y los resultados de la puerta, lo que lo convierte en un recurso didáctico para aprender a fine-tunear y desplegar modelos pequeños en el edge.

## Benchmarks y rendimiento

El autor proporciona resultados de una puerta de evaluación propia sobre 136 ejemplos retenidos, con decodificación greedy y onnxruntime-node. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, etc.).

| Metrica | fp32 (referencia) | q8 | q4 |
|---|---|---|---|
| fidelity% (fracción de números y nombres propios de la referencia que sobreviven) | 52.4 | 46.4 | 41.1 |
| fact% (acuerdo con una paráfrasis dorada; techo 60.6) | 41.3 | 37.4 | 33.9 |
| decline% (tasa de rechazo) | 50 | 80 | 50 |
| leaks (fugas de teléfonos o emails) | 0 | 0 | 0 |
| lang% (porcentaje de respuestas en el idioma correcto) | 100 | 100 | 100 |
| refusal% (tasa de rechazo ante solicitudes inapropiadas) | 85 | 80 | 90 |
| degen (bucles de repetición o inundación de padding) | 1 | 2 | 8 |
| CEO / title (afirmaciones falsas sobre títulos) | 0 | 0 | 1 |
| polarity% (polaridad correcta) | 53.3 | 53.3 | 66.7 |

La cuantización degrada la calidad: q4 es el más pequeño y el más débil, con más degeneración y una fuga de título.

## Requisitos de hardware

- Inferencia en navegador con WebGPU (aceleración por GPU) o WASM (CPU) como respaldo.
- Peso q4: 261 MiB, objetivo para teléfonos móviles.
- Peso q8: 417 MiB, recomendado para escritorio y Android.
- No requiere GPU dedicada; puede ejecutarse en CPUs modernas con WASM, aunque con mayor latencia.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`) con `pipeline('text-generation', ...)`, dispositivo `webgpu` o `wasm`.
- No se proporcionan datos de latencia o throughput específicos; al ser un modelo de 270M, se espera una generación de pocos tokens por segundo en dispositivos móviles con WebGPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso principal |
|---|---|---|---|---|---|
| amrshawqy/amr-lite-270m | 270M | no disponible | ONNX (q4/q8) | Gemma Terms | Demo on-device, renderizado de referencias |
| google/gemma-3-270m-it | 270M | 8k (según documentación de Gemma 3) | safetensors, GGUF, ONNX | Gemma Terms | Modelo base general, fine-tuning específico |
| google/functiongemma-270m-it | 270M | 8k | safetensors | Gemma Terms | Tool calling y function calling en edge |

La comparativa se limita a modelos de la misma familia y tamaño. No se dispone de datos de rendimiento comparativo en benchmarks estándar para Amr Lite, ya que su evaluación es específica de la tarea.

## Limitaciones y advertencias

- El modelo no conoce hechos por sí mismo: solo renderiza la referencia que recibe en el contexto. No debe usarse como fuente de información sobre Signit o Amr Shawqy.
- Fidelidad limitada: reproduce aproximadamente el 52% de los tokens de hechos de la referencia; puede equivocar números, repetirse o contradecir la propia referencia.
- Guardrails no fiables: el modelo no rechaza solicitudes inapropiadas de forma consistente (refusal% entre 80 y 90 según cuantización). La página demo sirve rechazos prefabricados y cae a la respuesta verificada ante salida degenerada.
- Degeneración: se observan bucles de repetición y inundación de padding, especialmente en q4 (8 casos de degeneración en 136 ejemplos).
- No es asesoramiento legal, financiero, contractual ni declaración oficial de Signit.
- Licencia: hereda los Gemma Terms of Use de Google, sujetos a la Prohibited Use Policy. El uso comercial debe revisar esas condiciones.
- Solo soporta inglés y árabe moderno estándar; no cubre otros idiomas.
- El contexto es limitado: el prompt de sistema ocupa ~139 tokens, y el autor advierte que no se deben inyectar dos referencias porque el modelo elige la incorrecta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amrshawqy/amr-lite-270m
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Tutorial de despliegue con Google AI Edge: https://developers.google.com/edge/litert-lm/tutorials/convert-and-run
- Artículo sobre Gemma 3 270M: https://localaimaster.com/models/gemma-3-270m
- Perfil del autor: https://huggingface.co/amrshawqy
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
