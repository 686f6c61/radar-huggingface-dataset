# kez-lab/gemma-2-2b-quiz-korean

## Resumen

`kez-lab/gemma-2-2b-quiz-korean` es un modelo de lenguaje especializado en la generación de preguntas de opción múltiple (MCQ) a partir de texto fuente en coreano, como artículos de blog, documentación técnica o textos largos. Desarrollado por el laboratorio kez-lab, se basa en un fine-tuning de Google Gemma-2-2B-it mediante LoRA, y está diseñado para producir preguntas pedagógicamente útiles con evidencia textual exacta, reduciendo la alucinación al mínimo. El modelo incorpora un razonamiento interno tipo chain-of-thought (etiquetado como `<thought>`) antes de emitir un JSON estructurado con la pregunta, cuatro opciones, la respuesta correcta, una explicación y una cita literal de la fuente. Con 2,6 mil millones de parámetros, es lo suficientemente ligero para ejecutarse en dispositivos móviles mediante MediaPipe Tasks GenAI o LiteRT, lo que lo hace relevante para aplicaciones educativas y de evaluación automática en entornos sin conexión a la nube.

El modelo está entrenado para trabajar con textos en coreano e inglés, aunque su enfoque principal es el coreano. Su arquitectura hereda el transformer decoder-only de Gemma-2, con una ventana de contexto estándar de 8.000 tokens (no se especifica en la documentación del autor, pero es la del modelo base). El repositorio incluye pesos en formato safetensors y está disponible bajo la licencia Gemma, que permite uso comercial con ciertas restricciones. Aunque el modelo tiene cero descargas en el momento de la consulta, su diseño orientado a tareas específicas y su compatibilidad con despliegue en Android lo convierten en una opción interesante para desarrolladores que buscan generación de quizzes en dispositivos de bajo consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-2) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Gemma-2-2B, 8K) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se listan cuantizaciones GGUF o similares) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Gemma (licencia de Google, con restricciones de uso comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-2b-it` (versión instruct de Gemma-2-2B) y se somete a un fine-tuning con PEFT/LoRA. La configuración de LoRA emplea r=16 y alpha=32, aplicada a todas las proyecciones lineales (q, k, v, o, gate, up, down). El entrenamiento se realiza en precisión bfloat16 y utiliza loss masking que solo considera la respuesta generada, ignorando el prompt. No se detalla el dataset de entrenamiento, pero la evaluación se realiza sobre 100 artículos de 10 dominios (Android, sistemas distribuidos, IA/ML, economía, medicina, ciencias naturales, historia, filosofía, diseño UX y arquitectura). El modelo aprende a generar un razonamiento interno en una fase autoregresiva antes de emitir el JSON final, lo que le permite planificar la pregunta, la evidencia y los distractores. Además, se entrena para distribuir uniformemente la posición de la respuesta correcta (A, B, C o D), evitando sesgos de posición.

## Capacidades

- Generación de preguntas de opción múltiple (4 opciones) a partir de un texto fuente en coreano.
- Razonamiento interno tipo chain-of-thought con etiqueta `<thought>` para planificar la pregunta y la evidencia.
- Grounding estricto: cada pregunta incluye una cita textual (`evidence`) extraída del artículo de origen, lo que garantiza auditabilidad y reduce alucinaciones.
- Salida en JSON estructurado con campos `question`, `options`, `answer_index`, `explanation` y `evidence`.
- Distribución uniforme de la respuesta correcta entre las opciones (25% para cada posición).
- Tokenización multilingüe de 256k (vocabulario de Gemma-2), que produce sintaxis coreana natural sin fugas de tokens CJK o hanja.
- Compatible con despliegue on-device en Android mediante MediaPipe Tasks GenAI y LiteRT (TensorFlow Lite).
- Soporte de chat mediante el template de Gemma-2 (aplicable a través de `apply_chat_template`).
- Capacidades multilingües limitadas a coreano e inglés, con especialización en coreano.

## Casos de uso

- Generación de quizzes educativos a partir de artículos o apuntes: el modelo puede leer un texto académico y producir preguntas de opción múltiple con explicaciones y citas, facilitando la creación de material de estudio automatizado.
- Evaluación de comprensión lectora en entornos educativos: profesores o plataformas de e-learning pueden alimentar el modelo con textos y obtener preguntas para exámenes o prácticas, reduciendo el tiempo de diseño.
- Creación de contenido para cursos online: al integrarse en pipelines de generación de contenido, permite producir cuestionarios de repaso para módulos de formación técnica o humanística.
- Aplicaciones móviles de aprendizaje autónomo: gracias a su compatibilidad con MediaPipe y LiteRT, puede ejecutarse en Android sin conexión, ofreciendo quizzes personalizados a partir de artículos guardados o noticias.
- Generación de preguntas para documentación técnica: desarrolladores pueden convertir manuales o guías en tests de verificación de conocimientos, útil para onboarding o certificaciones internas.
- Sistemas de evaluación automática en plataformas de blogging: el modelo puede transformar entradas de blog en quizzes interactivos para aumentar el engagement de los lectores.
- Asistentes de estudio en dispositivos de bajo consumo: al ser ligero (2.6B), puede desplegarse en móviles o tablets sin necesidad de GPU dedicada, ofreciendo generación de preguntas en tiempo real.

## Benchmarks y rendimiento

La model card del autor reporta una evaluación sobre un conjunto de prueba de 100 artículos aislados a nivel de documento, en 10 dominios. La métrica compuesta `QuizScore` se calcula como:

QuizScore = 0.30 × Groundedness + 0.25 × Uniqueness + 0.20 × DistractorQuality + 0.15 × Importance + 0.10 × LanguageQuality

| Evaluación | Base Gemma-2-2B (prompted) | Gemma-2-2B Quiz Korean (ours) | Mejora |
| :--- | :---: | :---: | :---: |
| QuizScore global | 0.9380 | **0.9850** / 1.000 | +5.0% |
| Groundedness (factualidad) | 0.940 | **1.000** (100%) | Zero hallucination |
| Uniqueness de respuesta | 0.950 | **1.000** (100%) | Respuesta determinista única |
| Plausibilidad de distractores | 0.920 | **1.000** | Coincidencia de categoría semántica |
| Calidad del lenguaje | 0.900 | **1.000** | Sintaxis coreana pura |
| Overhead del system prompt | ~500 tokens | **0 tokens** | Comportamiento totalmente embebido |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. Los datos presentados son específicos de la tarea de generación de quizzes y provienen del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: con bfloat16 (2 bytes por parámetro), el modelo requiere aproximadamente 5.2 GB de VRAM solo para los pesos. Con cuantización a 4 bits (si estuviera disponible), se reduciría a ~1.3 GB, pero no se proporcionan versiones cuantizadas oficiales.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM (p. ej., RTX 3060, RTX 4060, RTX 4090) para ejecución en bfloat16 con espacio para activaciones. En GPU de 6 GB podría funcionar con técnicas de offload o cuantización, aunque no está documentado.
- En dispositivos móviles: el modelo puede compilarse a formato `.tflite` o `.task` para ejecutarse en Android con MediaPipe Tasks GenAI, sin necesidad de GPU dedicada (usa CPU o NPU del dispositivo).
- Opciones de despliegue: Transformers (Python), vLLM, TGI (text-generation-inference), llama.cpp (si se convierte a GGUF), Ollama, y MediaPipe Tasks GenAI para Android.
- Latencia y throughput: no se especifican en la documentación. Como referencia, un modelo de 2.6B en GPU consumer suele generar decenas de tokens por segundo, pero los valores exactos dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Enfoque | Licencia |
| :--- | :--- | :---: | :---: | :--- | :--- |
| kez-lab/gemma-2-2b-quiz-korean | Gemma-2-2B-it | 2.6B | 8K (heredado) | Generación de quizzes MCQ en coreano con grounding | Gemma |
| kez-lab/quiz-korean | Qwen2.5-0.5B | 0.5B | no disponible | Generación de quizzes MCQ en coreano (ultraligero) | no disponible |
| google/gemma-2-2b-it | Gemma-2-2B | 2.6B | 8K | Modelo instruct general | Gemma |

La comparativa muestra que el modelo se especializa en una tarea concreta frente al base generalista, y que existe una variante aún más ligera basada en Qwen2.5-0.5B con el mismo propósito, aunque con menor capacidad y sin los detalles de grounding documentados.

## Limitaciones y advertencias

- La licencia Gemma permite uso comercial, pero impone restricciones: no se pueden utilizar los modelos para fines que violen las políticas de uso aceptable de Google, y se requiere atribución en productos derivados. Es recomendable revisar la licencia completa.
- El modelo está optimizado para coreano; su rendimiento en inglés no está documentado y podría ser inferior.
- Aunque el autor afirma "zero hallucination" en la evaluación, esto no garantiza ausencia total de errores en todos los textos. La dependencia de la evidencia citada reduce el riesgo, pero no lo elimina.
- La longitud de contexto no se especifica en la model card; se asume la del modelo base (8K tokens), lo que limita la generación de quizzes a partir de artículos muy largos.
- No se proporcionan versiones cuantizadas (GGUF, AWQ, etc.), lo que puede dificultar el despliegue en hardware muy limitado.
- El modelo tiene cero descargas y no ha sido auditado externamente; su calidad en producción fuera del conjunto de prueba del autor es desconocida.
- El formato de salida JSON depende del razonamiento interno; en casos extremos podría generar estructuras malformadas si el texto fuente es ambiguo o contiene ruido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kez-lab/gemma-2-2b-quiz-korean
- Repositorio GitHub del autor (benchmark y documentación): https://github.com/kez-lab/ondevice-blog-quiz-generator
- Modelo base de Google: https://huggingface.co/google/gemma-2-2b-it
- Modelo relacionado (versión ultraligera con Qwen): https://huggingface.co/kez-lab/quiz-korean
- Documentación de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
