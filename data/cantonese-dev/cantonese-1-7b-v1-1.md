# cantonese-dev/cantonese-1.7b-v1.1

## Resumen

cantonese-1.7b-v1.1 es un modelo de síntesis de voz (text-to-speech) desarrollado por cantonese-dev, publicado en Hugging Face bajo licencia Apache 2.0. El identificador de arquitectura en los metadatos es `qwen3_tts`, lo que indica que se trata de un modelo derivado o construido sobre la familia Qwen3 orientado a la generación de audio a partir de texto. Con aproximadamente 1.928 millones de parámetros (1,93 B) y un repositorio de 3,9 GB en formato safetensors, está pensado para ejecutarse en hardware de gama media sin necesidad de infraestructura de datacenter.

La versión v1.1 introduce dos cambios funcionales respecto a versiones anteriores: el diseño de voz mediante el parámetro `--instruction` en lugar de altavoces predefinidos codificados (`--speaker`), y una funcionalidad de clonación de voz. Esto lo sitúa en la categoría de modelos TTS controlables por lenguaje natural, donde el usuario describe la voz deseada en lugar de seleccionar de un catálogo cerrado.

El modelo es relevante para desarrolladores que necesitan TTS en cantonés (y potencialmente otros idiomas) con control fino sobre el timbre y las características de la voz, con la ventaja de una licencia permisiva que permite uso comercial sin restricciones adicionales. La información pública disponible es muy limitada: la model card apenas ocupa unas líneas y no detalla composición del dataset, métricas de evaluación ni idiomas soportados de forma explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_tts (TTS basado en la familia Qwen3) |
| Parámetros totales | 1.928.677.440 (≈1,93 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere cantonés como idioma principal) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta de arquitectura `qwen3_tts` en los metadatos indica que el modelo se apoya en los componentes de la familia Qwen3 adaptados a la síntesis de voz. No obstante, la información pública no especifica si se trata de un transformer decoder-only con cabezas de audio, de un modelo híbrido texto-a-tokens-de-audio, o de una integración con un vocoder separado. Tampoco se detalla el mecanismo exacto de condicionamiento por instrucción (`--instruction`) ni cómo se implementa la clonación de voz.

No hay datos publicados sobre el volumen de tokens de entrenamiento, la composición del dataset (horas de audio, hablantes, dominios), ni sobre si se aplicaron técnicas de RLHF, DPO o ajuste fino supervisado. La única información técnica verificable es el recuento de parámetros (1,93 B) y el tamaño del repositorio (3,9 GB), coherente con pesos en precisión bf16/fp16 para ese número de parámetros.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Diseño de voz mediante instrucciones en lenguaje natural (`--instruction`), lo que permite describir el timbre, estilo o características de la voz deseada en lugar de elegir de una lista fija.
- Clonación de voz: la versión v1.1 incorpora esta funcionalidad según la model card.
- Control de altavoz predefinido mediante `--speaker` (mecanismo heredado de versiones anteriores, sustituido en v1.1 por el diseño por instrucción).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje general).
- Capacidades multilingües: no disponible; el nombre del modelo sugiere cantonés como idioma principal, pero no se documenta la cobertura de otros idiomas.
- Capacidades especiales: clonación de voz y diseño de voz por instrucción.

## Casos de uso

- Generación de audiolibros y contenido narrado en cantonés: el modelo puede sintetizar texto largo con una voz diseñada mediante `--instruction`, lo que permite mantener un estilo consistente a lo largo de capítulos sin depender de un altavoz predefinido.
- Doblaje y localización de vídeo al cantonés: con 1,93 B de parámetros y 3,9 GB de pesos, puede desplegarse en una GPU de gama media para generar pistas de voz en pipelines de postproducción, ajustando el timbre por personaje mediante instrucciones.
- Asistentes de voz para atención al cliente: la clonación de voz permite crear una voz corporativa propia a partir de una muestra de referencia, y el diseño por instrucción facilita adaptar el registro (formal, cercano) según el contexto de la conversación.
- Accesibilidad y lectura de pantalla: integración en aplicaciones que conviertan texto a voz en cantonés para usuarios con discapacidad visual, con la ventaja de una licencia Apache 2.0 que permite distribuir el modelo dentro de productos comerciales.
- Creación de contenido para redes sociales y pódcast: generación rápida de voces sintéticas con estilos variados mediante instrucciones, útil para prototipado de contenido sin contratar locutores.
- Pruebas de concepto de clonación de voz para investigación: el modelo sirve como base para experimentos de personalización de voz en entornos controlados, dado su tamaño reducido y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,93 B de parámetros, los pesos en fp16 ocupan aproximadamente 3,9 GB; en fp32, unos 7,7 GB. La VRAM total necesaria depende del vocoder y de los buffers de audio, no documentados.
- GPU recomendadas: no disponible en la documentación del autor. Por tamaño, una GPU con 8-12 GB de VRAM (RTX 3060, RTX 4070, RTX 4090) debería ser suficiente para inferencia en fp16.
- Cabe en GPU de consumo: probablemente sí, en tarjetas con al menos 8 GB de VRAM, aunque no se confirma en la model card.
- Opciones de despliegue: no disponible. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; al ser un modelo TTS, el pipeline habitual sería un script de inferencia propio o una librería de audio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| cantonese-1.7b-v1.1 | ≈1,93 B | no disponible | Apache 2.0 | TTS con diseño y clonación de voz |
| Qwen3-TTS (base) | no disponible | no disponible | no disponible | TTS de la familia Qwen3 |
| Alternativas TTS open source (p. ej. Coqui XTTS, Bark) | variable | no disponible | variable (MPL, MIT) | TTS multilingüe con clonación |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y enfoque funcional.

## Limitaciones y advertencias

- Información pública muy escasa: la model card no documenta dataset, idiomas, métricas ni limitaciones, lo que dificulta evaluar su calidad antes de desplegarlo.
- Riesgo de alucinación y artefactos de audio: como todo modelo TTS, puede generar pronunciaciones incorrectas, prosodia anómala o ruido en entradas fuera de distribución; no se han publicado evaluaciones al respecto.
- Sesgos potenciales: al no documentarse la composición del dataset de entrenamiento, se desconoce si la clonación de voz reproduce sesgos de género, edad o acento de los hablantes de referencia.
- Limitaciones de idioma: el nombre sugiere cantonés, pero no se confirma la cobertura de otros idiomas ni la calidad en cada uno.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero la clonación de voz plantea riesgos éticos y legales (suplantación de identidad, consentimiento del hablante) que el autor no aborda en la model card.
- Caveat para producción: sin benchmarks ni documentación de latencia, es necesario realizar una evaluación propia antes de integrarlo en sistemas en tiempo real.
- Fecha de creación futura (2026-11-02) en los metadatos: conviene verificar la vigencia y el estado del repositorio antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/cantonese-dev/cantonese-1.7b-v1.1
- DOI: https://doi.org/10.57967/hf/11365
