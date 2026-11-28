# NK590/daily-ibt-unified-encoder

## Resumen

El modelo `NK590/daily-ibt-unified-encoder` es un cross-encoder multi-tarea desarrollado por el usuario NK590 para su uso dentro de la aplicación Android «하루 iBT» (Haro iBT), una app de preparación del examen TOEFL iBT. No es un modelo generativo, sino un clasificador de texto que evalúa respuestas escritas y orales del alumno frente a seis criterios pedagógicos distintos mediante seis cabezas sigmoid sobre una única representación codificada. Está construido a partir de `google/electra-base-discriminator` (licencia Apache-2.0) y exportado a ONNX con cuantización de pesos int8 por fila, lo que reduce el artefacto a unos 110 MB.

El modelo resuelve un problema muy concreto: verificar automáticamente, y sin conexión a internet, si un estudiante ha cumplido los requisitos de distintas tareas del TOEFL iBT (email, discusión académica e entrevista oral). En lugar de desplegar seis clasificadores independientes, unifica las seis tareas en un solo encoder con seis salidas, lo que abarata la inferencia en dispositivos móviles. La longitud máxima de secuencia es de 192 tokens y admite contexto de frase previa mediante el prefijo `[prev: ...]`.

Es relevante por su enfoque de ingeniería: un transformer pequeño, cuantizado y empaquetado en ONNX Runtime para Android, con artefactos fijados por SHA-256 y una licencia permisiva (Apache-2.0). No obstante, es un modelo de nicho, sin descargas ni validación pública en el momento de redactar esta ficha, y diseñado exclusivamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en `google/electra-base-discriminator` (transformer encoder) con 6 cabezas sigmoid |
| Parametros totales | no disponible (el artefacto ONNX int8 pesa 110.534.596 bytes; el modelo base ELECTRA-base tiene ~110 M de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 192 tokens (`maxLength = 192`) |
| Tipos de cuantizacion | int8 con cuantización de pesos por fila (`QInt8`, weight-only), empaquetado en ONNX |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`unified_task_encoder.onnx`), más `vocab.txt` y `unified_task_encoder.json` |

## Arquitectura y entrenamiento

El modelo es un cross-encoder construido sobre `google/electra-base-discriminator`, un transformer encoder de tipo ELECTRA. Sobre la representación agregada se aplican seis cabezas lineales independientes con activación sigmoid, una por cada tarea de evaluación. La entrada se trunca a 192 tokens y admite un prefijo de contexto de frase previa (`[prev: ...]`) para las tareas que lo requieren, como la verificación de requisitos de email y la detección de razones no marcadas en la discusión académica.

Las seis salidas son: `email_fulfills` (cumplimiento de requisitos del email), `position` (postura propia en la discusión académica), `reason` (explicación de apoyo o causa no marcada), `example` (instancia específica o experiencia personal), `reply` (interacción con los puntos de los compañeros) y `interview_fulfills` (verificación de respuesta directa frente a evasión o eco de palabras clave en la entrevista oral). No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste fino adicionales como RLHF o DPO. El autor indica que la cuantización int8 es opcional y que el modelo está pensado para inferencia offline con ONNX Runtime en Android.

## Capacidades

- Clasificación multi-tarea de texto en inglés con seis salidas sigmoid independientes.
- Verificación del cumplimiento de requisitos en emails de la tarea de escritura del TOEFL iBT.
- Detección de postura, razonamiento, ejemplos y réplicas en la tarea de discusión académica.
- Verificación de respuestas directas frente a evasión o eco de palabras clave en la entrevista oral.
- Soporte de contexto de frase previa mediante el prefijo `[prev: ...]`.
- Inferencia offline en dispositivos Android mediante ONNX Runtime.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Corrección automática de emails en una app de preparación del TOEFL iBT: el modelo evalúa si la respuesta del alumno cumple los requisitos de la tarea de email, usando el contexto de la frase previa para tareas que lo requieren y funcionando sin conexión en el dispositivo.
- Evaluación de la tarea de discusión académica: las cabezas `position`, `reason`, `example` y `reply` permiten puntuar por separado si el alumno ha expresado una postura, la ha justificado, ha aportado un ejemplo y ha interactuado con los compañeros.
- Verificación de respuestas en la entrevista oral: la cabeza `interview_fulfills` distingue respuestas directas de evasiones o ecos de palabras clave, útil para dar retroalimentación inmediata al estudiante.
- Retroalimentación formativa en apps móviles de idiomas: al ser un modelo de 110 MB cuantizado, puede ejecutarse en el propio teléfono sin enviar datos del alumno a un servidor, lo que reduce latencia y mejora la privacidad.
- Filtrado previo en pipelines de evaluación: el modelo puede actuar como primera pasada para descartar respuestas claramente incompletas antes de una revisión humana o de un modelo generativo más costoso.
- Investigación en clasificación multi-tarea con ELECTRA: sirve como ejemplo de empaquetado de un cross-encoder con seis cabezas en ONNX int8 para despliegue en dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto ONNX int8 ocupa 110.534.596 bytes (~105 MB), por lo que la huella en memoria es de ese orden más el overhead del runtime.
- GPU recomendadas: no aplica para el caso de uso previsto (Android con ONNX Runtime); en servidor puede ejecutarse en CPU sin problema dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, cualquier GPU con más de 1 GB de VRAM puede alojarlo, aunque el modelo está pensado para CPU móvil.
- Opciones de despliegue: ONNX Runtime (Android y escritorio), con soporte de cuantización int8; no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `NK590/daily-ibt-unified-encoder` | no disponible (~110 M, ELECTRA-base) | 192 tokens | Clasificación multi-tarea TOEFL iBT | Apache-2.0 | ONNX en HF |
| `google/electra-base-discriminator` | ~110 M | 512 tokens | Clasificación / discriminación general | Apache-2.0 | HF, PyTorch |
| Cross-encoders de sentence-transformers (p. ej. `cross-encoder/ms-marco-MiniLM-L-6-v2`) | ~22 M | 512 tokens | Ranking de relevancia | Apache-2.0 | HF, PyTorch, ONNX |

La comparativa se limita a modelos de la misma familia o categoría, ya que no se conocen alternativas públicas específicas para la evaluación multi-tarea del TOEFL iBT. Frente a ELECTRA-base, este modelo reduce el contexto a 192 tokens y añade seis cabezas específicas; frente a los cross-encoders de MiniLM, es más grande pero está especializado en tareas pedagógicas concretas.

## Limitaciones y advertencias

- Modelo de nicho: cero descargas y cero likes en el momento de redactar la ficha, sin validación pública de su calidad.
- Entrenado exclusivamente para inglés; no se garantiza su comportamiento en otros idiomas.
- Contexto limitado a 192 tokens, insuficiente para textos largos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos o negativos en la clasificación de respuestas.
- No se documentan sesgos conocidos, pero al derivar de ELECTRA-base puede heredar sesgos del corpus original.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Pensado para inferencia offline en Android; no se documenta su uso en servidor ni su integración con otros runtimes.
- Artefactos fijados por SHA-256, lo que facilita la verificación de integridad pero no la reproducibilidad del entrenamiento.

## Enlaces

- [Hugging Face: NK590/daily-ibt-unified-encoder](https://huggingface.co/NK590/daily-ibt-unified-encoder)
- [google/electra-base-discriminator](https://huggingface.co/google/electra-base-discriminator)
- [ONNX Runtime](https://onnxruntime.ai/)
