# nikheal25/gemma-4-E2B-coding-poc-v1

## Resumen

El modelo `nikheal25/gemma-4-E2B-coding-poc-v1` es un adaptador LoRA (librería PEFT) desarrollado por el usuario nikheal25 sobre la versión MLX 4-bit del modelo Gemma 4 E2B de Google, publicada por Unsloth. Se trata de una prueba de concepto (POC) para validar un pipeline de afinamiento de modelos locales sobre sesiones reales de un asistente de programación (Claude Code). El adaptador fue entrenado con un conjunto de datos muy reducido: 36 ejemplos de entrenamiento y 4 de validación, extraídos de conversaciones propias del autor, con el objetivo de ajustar el comportamiento del modelo base hacia el estilo de un asistente de código.

El modelo base, Gemma 4 E2B, es un modelo de lenguaje denso de 2.1 mil millones de parámetros, orientado a texto, con una ventana de contexto de 8K tokens según la documentación de `gemma4.dev`. Está diseñado para ejecutarse en dispositivos con pocos recursos, incluso en CPU. El adaptador LoRA añade 96.6 millones de parámetros entrenables (6.28% del base). La relevancia de esta ficha radica en que muestra un caso de uso de afinamiento local con herramientas de código abierto (Unsloth, MLX) sobre un modelo ligero, aunque con limitaciones importantes debido a la escasez de datos y la falta de evaluación rigurosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) |
| Parámetros totales | Modelo base: 2.1B; adaptador LoRA: 96.6M (6.28% del base) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 8K tokens (según gemma4.dev; no confirmado en la model card) |
| Tipos de cuantización | Base en MLX 4-bit; adaptador LoRA en precisión original (no cuantizado) |
| Idiomas soportados | No disponible (no indicado en la model card) |
| Licencia | Gemma (licencia de Google para la familia Gemma) |
| Formato de pesos | PEFT/LoRA (safetensors) |

## Arquitectura y entrenamiento
El modelo base es `unsloth/gemma-4-E2B-it-UD-MLX-4bit`, una versión de Gemma 4 E2B de Google en formato MLX cuantizado a 4 bits. Gemma 4 E2B es un transformer denso de 2.1B parámetros, texto-only, con 8K de contexto. El adaptador LoRA se entrenó con la librería Unsloth (`unsloth train`) sobre Apple Silicon (MLX), utilizando configuración por defecto de Unsloth para el rank y los hiperparámetros. El conjunto de datos consistió en 40 conversaciones extraídas de sesiones personales de Claude Code, previamente limpiadas de secretos, correos electrónicos y rutas de archivos. El entrenamiento duró 60 pasos, con una pérdida final media de 2.91 y un pico de memoria de 8.92 GB en un Mac mini M4 con 32GB de RAM. No se aplicó RLHF ni DPO; es un simple afinamiento supervisado.

## Capacidades
- Generación de texto y código: el modelo base es capaz de generar código en varios lenguajes (Python, JavaScript, TypeScript, etc.) y el adaptador busca ajustar su estilo a las preferencias del autor.
- Razonamiento y matemáticas: las capacidades del modelo base incluyen razonamiento básico y resolución de problemas matemáticos, aunque no se han evaluado en este adaptador.
- Soporte de tool calling / function calling: no disponible (el modelo base no lo soporta de forma nativa según la información proporcionada).
- Soporte de agentes y multi-step reasoning: no especificado en la documentación.
- Capacidades multilingües: no confirmadas para este adaptador; el modelo base de Gemma suele soportar varios idiomas, pero no hay datos concretos.
- Capacidades especiales: al ser un POC, no se esperan capacidades añadidas; el adaptador solo modifica el comportamiento en tareas de código.

## Casos de uso
- Asistente de código personal: el adaptador puede utilizarse con `unsloth chat` para obtener respuestas al estilo de las sesiones de Claude Code del autor, aunque con limitaciones por el pequeño tamaño del entrenamiento.
- Evaluación de pipelines de afinamiento local: sirve como prueba de concepto para desarrollar un flujo de trabajo de afinamiento con Unsloth y MLX sobre datos propios.
- Prototipado de modelos de código en dispositivos edge: al ser un modelo ligero (2.1B en 4-bit), se puede desplegar en CPU o GPU de baja gama, por ejemplo en un Raspberry Pi o un portátil antiguo.
- Investigación de transferencia de estilo de conversación: permite estudiar cómo un LoRA pequeño puede modificar el estilo de un modelo base sin cambiar su arquitectura.
- Integración en herramientas de desarrollo local: el adaptador puede cargarse con PEFT y Transformers en un entorno de desarrollo para autocompletar código o responder preguntas técnicas.
- Evaluación de privacidad en afinamiento: el caso de uso de entrenar sobre datos personales sin publicarlos, sirve para probar metodologías de limpieza y anonimización.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica que el autor realizó una comparación cualitativa contra el modelo base con un par de prompts, sin métricas numéricas. No hay datos de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware
- VRAM estimada para inferencia: al ser un modelo base de 2.1B en 4-bit, se puede ejecutar en CPU (según gemma4.dev) y en GPUs con poca VRAM. El adaptador LoRA añade unos 0.4 GB, pero se carga sobre el base. En CPU, se recomienda al menos 4 GB de RAM; en GPU, 2-4 GB de VRAM serían suficientes para cuantización 4-bit.
- GPU recomendadas: cualquier GPU con soporte para MLX (Apple Silicon) o CUDA (para Transformers/PEFT). En NVIDIA, una RTX 3060 o superior sería suficiente. También puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna con al menos 4 GB de VRAM, y también en CPU.
- Opciones de despliegue: `unsloth chat` (recomendado), `peft` + `transformers`, o integración con `vLLM` (aunque requiere conversión). En Apple Silicon, se puede usar MLX.
- Latencia y throughput: no disponibles; depende del hardware. En un Mac mini M4, el entrenamiento consumió 8.92 GB de memoria, lo que sugiere que la inferencia es rápida.

## Comparativa con modelos similares
No hay datos de benchmarks para comparar con otros modelos. Se puede comparar con el modelo base sin adaptador (Gemma 4 E2B) y con otros modelos pequeños de código como `ArnavKewalram/gemma-4-E2B-coder-v1`, pero no se dispone de métricas. La comparación se limita a características generales:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Gemma 4 E2B (base) | 2.1B | 8K | Gemma | MLX 4-bit |
| gemma-4-E2B-coding-poc-v1 (este) | 2.1B + 96.6M | 8K | Gemma | PEFT/LoRA |
| gemma-4-E2B-coder-v1 (ArnavKewalram) | 2.1B | 8K (asumido) | Apache-2.0 | Transformers |

Nota: la licencia del adaptador es Gemma, aunque el otro modelo de ArnavKewalram usa Apache-2.0. No hay datos de rendimiento.

## Limitaciones y advertencias
- Dataset muy pequeño: solo 36 ejemplos de entrenamiento y 4 de validación, lo que hace que el modelo no sea fiable para uso en producción.
- No evaluado rigurosamente: no hay benchmarks ni puntuaciones de validación; cualquier diferencia con el base es probablemente ruido.
- Riesgo de alucinación y de reproducir información personal: el entrenamiento se basó en datos personales, aunque se limpiaron secretos y rutas, aún podría reproducir información no deseada.
- Restricciones de licencia: la licencia Gemma tiene condiciones específicas de uso, incluyendo restricciones para ciertos usos comerciales y requisitos de atribución. Consultar los términos oficiales.
- Limitaciones de contexto: 8K tokens puede ser insuficiente para conversaciones largas o documentos extensos.
- No se garantiza mejora real: el autor mismo advierte que no se espera un cambio dramático con respecto al modelo base.

## Enlaces
- [HuggingFace del modelo](https://huggingface.co/nikheal25/gemma-4-E2B-coding-poc-v1)
- [Modelo base de Unsloth](https://huggingface.co/unsloth/gemma-4-E2B-it-UD-MLX-4bit)
- [Página de Gemma 4 E2B en gemma4.dev](https://gemma4.dev/models/gemma-4-e2b)
- [Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Análisis de la suite Gemma 4 en localclaw.io](https://localclaw.io/blog/gemma4-suite-deep-dive)
- [Gemma 4 Playground y guía de despliegue](https://gemma4.site/)
- [Modelo similar gemma-4-E2B-coder-v1 de ArnavKewalram](https://huggingface.co/ArnavKewalram/gemma-4-E2B-coder-v1)## Resumen
`nikheal25/gemma-4-E2B-coding-poc-v1` es un adaptador LoRA (librería PEFT) entrenado sobre el modelo base `unsloth/gemma-4-E2B-it-UD-MLX-4bit`, una versión MLX 4-bit de Gemma 4 E2B de Google. El autor, nikheal25, lo presenta como una prueba de concepto (POC) para validar un pipeline de afinamiento local de modelos sobre sus propias sesiones de asistente de código (Claude Code). El adaptador fue entrenado con un conjunto de datos muy reducido: 36 ejemplos de entrenamiento y 4 de validación, extraídos de 40 conversaciones reales, con el objetivo de ajustar el estilo del modelo base hacia el de un asistente de programación.

El modelo base, Gemma 4 E2B, es un transformer denso de 2.1 mil millones de parámetros, orientado a texto, con una ventana de contexto de 8K tokens según la documentación de `gemma4.dev`. Está diseñado para ejecutarse en dispositivos con recursos limitados, incluso en CPU. El adaptador LoRA añade 96.6 millones de parámetros entrenables (6.28% del base). La relevancia de esta ficha radica en que muestra un caso práctico de personalización de un modelo ligero con herramientas de código abierto (Unsloth, MLX), aunque con limitaciones claras por la escasez de datos y la ausencia de evaluación rigurosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) |
| Parámetros totales | Modelo base: 2.1B; adaptador LoRA: 96.6M (6.28% del base) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 8K tokens (según gemma4.dev; no confirmado en la model card) |
| Tipos de cuantización | Base en MLX 4-bit; adaptador LoRA en precisión sin cuantizar |
| Idiomas soportados | No disponible (no indicado en la model card) |
| Licencia | Gemma (licencia de Google para la familia Gemma) |
| Formato de pesos | PEFT/LoRA (safetensors) |

## Arquitectura y entrenamiento

El modelo base es `unsloth/gemma-4-E2B-it-UD-MLX-4bit`, una versión de Gemma 4 E2B de Google en formato MLX cuantizado a 4 bits. Gemma 4 E2B es un transformer denso de 2.1B parámetros, texto-only, con 8K de contexto. El adaptador LoRA se entrenó con la librería Unsloth (`unsloth run`) sobre Apple Silicon (MLX), usando la configuración por defecto de Unsloth para el rango y los hiperparámetros. El conjunto de datos consistió en 40 conversaciones extraídas de sesiones personales de Claude Code, con limpieza básica de secretos, emails y rutas de archivos locales. El entrenamiento duró 60 pasos, con una pérdida final promedio de 2.91 y un pico de memoria de 8.92 GB en un Mac mini M4 con 32GB. No se aplicó RLHF ni DPO; solo afinamiento supervisado. El autor indica que el adaptador se publicó sin el dataset de entrenamiento, por privacidad.

## Capacidades

- Generación de texto y código: el modelo base es capaz de generar instrucciones en varios lenguajes de programación (Python, JavaScript, TypeScript, etc.); el adaptador busca alinear el estilo con las sesiones del autor.
- Razonamiento y matemáticas: las capacidades del modelo base incluyen razonamiento básico y resolución de problemas matemáticos, aunque no se han evaluado específicamente en este adaptador.
- Soporte de tool calling / function calling: no especificado en la documentación; el modelo base no lo soporta de forma nativa según la información disponible.
- Soporte de agentes y multi-step reasoning: no se menciona en la model card ni en las fuentes.
- Capacidades multilingües: no confirmadas para este adaptador; el modelo base Gemma suele soportar varios idiomas, pero no hay datos concretos.
- Capacidades especiales: al ser un POC, no añade capacidades nuevas; el cambio respecto al base es sutil y no está validado.

## Casos de uso

- Asistente de código personalizado: el adaptador puede usarse con `unsloth chat` para obtener respuestas alineadas con el estilo de las sesiones del autor, aunque el efecto será limitado por el pequeño tamaño del dataset.
- Prototipo de pipeline de afinamiento local: sirve como ejemplo de cómo afinar un modelo ligero con datos propios usando Unsloth y MLX, con fines educativos o de validación de infraestructura.
- Generación de código en entornos con recursos limitados: el modelo base de 2.1B en 4-bit se puede ejecutar en CPU o GPU con poca VRAM, adecuado para integraciones en dispositivos edge o portátiles.
- Evaluación de transferencia de estilo de conversación: permite estudiar cómo un LoRA pequeño modifica el comportamiento de un modelo base sin cambiar su arquitectura, útil para investigaciones sobre adaptación de estilo.
- Integración en herramientas de autocompletado de código: cargando el adaptador con PEFT y Transformers, se puede usar en un entorno de desarrollo para sugerencias de código o respuestas técnicas.
- Prueba de metodologías de privacidad en afinamiento: el caso de uso de entrenar sobre datos personales sin publicarlos demuestra un flujo de limpieza y anonimización básica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona una comparación cualitativa contra el modelo base con un par de prompts, pero no se proporcionan métricas numéricas (MMLU, HumanEval, GSM8K, etc.). No hay datos de rendimiento cuantificados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4-bit ocupa aproximadamente 1.2 GB de memoria (2.1B × 4 bits), más el adaptador (~0.4 GB). Se puede ejecutar en CPU con 4 GB de RAM o en GPU con 2-4 GB de VRAM.
- GPU recomendadas: en Apple Silicon (MLX) se ejecuta nativamente en Mac mini M4 o similares; en NVIDIA, una RTX 3060 (12 GB) o superior es suficiente. También funciona en CPU sin GPU.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU moderna con al menos 4 GB de VRAM, y en muchas integradas.
- Opciones de despliegue: `unsloth chat` (recomendado), `peft` + `transformers`, `MLX` en Apple Silicon, y potencialmente `llama.cpp` si se convierte el adaptador (no documentado).
- Latencia y throughput: no disponibles; el entrenamiento alcanzó un pico de 8.92 GB en un Mac mini M4, lo que sugiere que la inferencia es rápida, pero no hay números concretos.

## Comparativa con modelos similares

No hay datos de benchmarks para comparar rendimiento. Se puede comparar en características con otros modelos de la misma familia:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Gemma 4 E2B (base) | 2.1B | 8K | Gemma | MLX 4-bit |
| gemma-4-E2B-coding-poc-v1 (este) | 2.1B + 96.6M | 8K | Gemma | PEFT/LoRA |
| gemma-4-E2B-coder-v1 (ArnavKewalram) | 2.1B | 8K (asumido) | Apache-2.0 | Transformers |

Nota: el modelo de ArnavKewalram usa licencia Apache-2.0, mientras que este adaptador hereda la licencia Gemma del base. No hay datos de rendimiento comparado.

## Limitaciones y advertencias

- Dataset extremadamente pequeño: 36 ejemplos de entrenamiento y 4 de validación, lo que hace que el modelo no sea fiable para uso en producción.
- Sin evaluación rigurosa: no hay benchmarks ni métricas de validación; el autor admite que cualquier diferencia con el base es probablemente ruido.
- Riesgo de alucinación y de reproducción de información personal: el entrenamiento se basó en datos personales, aunque se limpiaron secretos y rutas, existe riesgo de que el modelo reproduzca información no deseada.
- Restricciones de licencia Gemma: la licencia de Google para Gemma incluye condiciones específicas, como restricciones para ciertos usos comerciales y requisitos de atribución. Debe revisarse antes de un despliegue comercial.
- Contexto limitado: 8K tokens es insuficiente para tareas que requieran ventanas largas, como análisis de documentos extensos.
- No se recomienda su uso en producción: es una prueba de concepto sin validación rigurosa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nikheal25/gemma-4-E2B-coding-poc-v1)
- [Modelo base de Unsloth](https://huggingface.co/unsloth/gemma-4-E2B-it-UD-MLX-4bit)
- [Documentación de Gemma 4 E2B en gemma4.dev](https://gemma4.dev/models/gemma-4-e2b)
- [Página de Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Análisis de la suite Gemma 4 en localclaw.io](https://localclaw.io/blog/gemma4-suite-deep-dive)
- [Guía de despliegue en gemma4.site](https://gemma4.site/)
- [Modelo relacionado gemma-4-E2B-coder-v1 de ArnavKewalram](https://huggingface.co/ArnavKewalram/gemma-4-E2B-coder-v1)
