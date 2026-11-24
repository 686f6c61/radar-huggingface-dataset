# DICPlay/RusMind-3.5-Vspyshka

## Resumen

RusMind 3.5 · Vspyshka (Вспышка, "destello" en ruso) es un ajuste fino del modelo base google/gemma-4-E4B-it desarrollado por DICPlay, orientado a inferencia en dispositivo ("on-device") y uso sin conexión. Se distribuye exclusivamente en formato GGUF para su uso con llama.cpp, LM Studio, Ollama, PocketPal y navegador, con el objetivo declarado de ofrecer asistencia cotidiana en ruso (escritura, explicación, apoyo al estudio y código) en PC potentes y teléfonos de gama alta.

El modelo cuenta con 7.518.069.290 parámetros totales y una ventana de contexto que no se especifica en la información disponible. Está afinado sobre el modelo instructivo de Google, con especial énfasis en conocimiento de historia, cultura, legislación, regiones y pueblos de Rusia, así como en la calidad del ruso escrito. Soporta ruso e inglés y se publica bajo la licencia propietaria "rusmind-license".

Su relevancia actual radica en su posicionamiento en el benchmark independiente MERA v2 (Alianza en el ámbito de la IA en Rusia), donde la versión posterior 4.7 de la misma familia alcanza 0,191 puntos y se sitúa como segunda mejor modelo de menos de 10.000 millones de parámetros, por delante de alternativas de mayor tamaño como RuadaptQwen3-32B o Zero-Mistral. La ficha documenta la versión 3.5, cuyos datos de benchmarks propios no se han publicado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-E4B-it); detalles internos no disponibles |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mini (3,8 GB), Lite (4,2 GB), Q4_K_M (5,3 GB), Q8_0 (8,0 GB), BF16 (15,1 GB) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | rusmind-license (propietaria, marcada como "other") |
| Formato de pesos | GGUF exclusivamente (no se publican safetensors en este repositorio) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) del modelo instructivo google/gemma-4-E4B-it, por lo que hereda la arquitectura transformer del modelo base de Google. La información disponible no detalla la composición del dataset de ajuste fino, el número de tokens utilizados, ni si se emplearon técnicas de RLHF, DPO o similares. Tampoco se especifican innovaciones arquitectónicas propias ni mecanismos de decodificación especulativa o atención lineal.

El autor declara que la versión 3.5 introduce mejoras en el seguimiento preciso de instrucciones (incluida la finalización de código y la comprensión de preguntas cortas por patrón), un conocimiento más profundo de la historia y la legislación rusas, y una mejora en la generación de poesía. La model card menciona asimismo que la familia RusMind ha sido entrenada con énfasis en valores familiares tradicionales y en el conocimiento de las regiones y pueblos de Rusia, lo que constituye una decisión explícita de alineación temática por parte del desarrollador.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con soporte multi-turno.
- Seguimiento de instrucciones, incluidas instrucciones complejas y preguntas cortas por patrón.
- Finalización y asistencia en código.
- Conocimiento específico de historia, cultura, legislación, regiones y pueblos de Rusia.
- Corrección ortográfica y de puntuación en ruso (la versión 4.7 reporta 0,719 en esta tarea dentro de MERA v2).
- Comprensión de personajes, humor y palabras con significados opuestos (antónimos) según la model card.
- Llamada a herramientas (tool calling / function calling), mencionada explícitamente para la versión 4.7 de la familia.
- Ejecución totalmente offline en dispositivo, sin dependencia de red.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode) en esta versión.

## Casos de uso

- Asistente personal offline en escritorio: el modelo se carga con llama.cpp u Ollama en un PC y responde consultas cotidianas sin conexión a internet, lo que resulta adecuado para entornos con conectividad limitada o requisitos de privacidad.
- Corrección y mejora de textos en ruso: dado su rendimiento declarado en ortografía y puntuación, puede integrarse en editores o flujos de revisión para normalizar documentos redactados en ruso.
- Apoyo al estudio de historia y legislación rusas: el ajuste temático permite usarlo como tutor conversacional sobre contenidos curriculares rusos, con la advertencia de verificar datos factuales.
- Asistencia a la programación en local: la finalización de código y el seguimiento de instrucciones permiten usarlo como autocompletado o generador de fragmentos en IDE sin enviar código a servicios externos.
- Despliegue en navegador: la variante Mini (3,8 GB) está pensada para ejecutarse dentro del navegador a través de rusmind.ru, lo que habilita demos y asistentes web sin backend de inferencia.
- Aplicaciones móviles de gama alta: la variante Lite (4,2 GB) está orientada a teléfonos insignia y portátiles, permitiendo asistentes integrados en la app sin coste de API.
- Atención al cliente en ruso con requisitos de soberanía de datos: al ejecutarse en infraestructura propia y sin conexión, encaja en organizaciones que no pueden enviar conversaciones a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de la versión 3.5 en la información disponible. La model card incluye datos de la versión posterior 4.7 de la misma familia en MERA v2, que se reproducen a continuación únicamente como referencia de la familia, no de este modelo:

| Modelo | Parametros | MERA v2 (general) |
|---|---|---|
| RusMind Vspyshka 4.7 | 7,5 mil millones | 0,191 |
| Qwen3.5-9B (Alibaba) | 9 mil millones | 0,186 |
| Gemma 4 E4B (Google) | 8 mil millones | 0,170 |
| RuadaptQwen3-32B | 32 mil millones | 0,163 |
| Zero-Mistral | 24 mil millones | 0,160 |
| T-lite (T-Bank) | 8 mil millones | 0,130 |

## Requisitos de hardware

- VRAM estimada para inferencia según el archivo GGUF: Mini ~3,8 GB, Lite ~4,2 GB, Q4_K_M ~5,3 GB, Q8_0 ~8,0 GB, BF16 ~15,1 GB (más overhead de contexto y de la propia aplicación).
- GPU recomendadas: no disponibles de forma explícita; por tamaño, una RTX 4090 (24 GB) permite cargar cualquier variante en GPU, y una RTX 4060 Ti de 16 GB cubre hasta BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, todas las variantes caben en tarjetas de 8 GB o más (Q4_K_M en 8 GB con contexto ajustado; Q8_0 y BF16 requieren 12-16 GB).
- Despliegue: llama.cpp (llama-cli con `-cnv`), LM Studio, Ollama, PocketPal y ejecución en navegador vía rusmind.ru. No se documenta soporte para vLLM ni TGI en formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RusMind 3.5 Vspyshka | 7,5 mil millones | no disponible | rusmind-license (propietaria) | GGUF | Ajuste de Gemma 4 E4B-it, foco en ruso y offline |
| Gemma 4 E4B-it (Google) | ~8 mil millones | no disponible | licencia de Google (no disponible en detalle) | safetensors, GGUF | Modelo base; MERA v2 de la familia 4.7: 0,170 |
| Qwen3.5-9B (Alibaba) | 9 mil millones | no disponible | no disponible | no disponible | MERA v2 de la familia 4.7: 0,186 |
| T-lite (T-Bank) | 8 mil millones | no disponible | no disponible | no disponible | MERA v2 de la familia 4.7: 0,130 |

La comparación de rendimiento se refiere a la versión 4.7 de RusMind Vspyshka, no a la 3.5 documentada aquí.

## Limitaciones y advertencias

- Los datos de benchmarks citados corresponden a la versión 4.7, no a la 3.5; no hay evidencia publicada del rendimiento de esta versión concreta.
- Riesgo de alucinación inherente a un modelo de 7,5 mil millones de parámetros, especialmente en cuestiones factuales de historia y legislación, donde el ajuste temático puede producir respuestas seguras pero incorrectas.
- Sesgo temático explícito: el entrenamiento refuerza una visión concreta de la historia, la cultura y los "valores familiares tradicionales" de Rusia, lo que puede introducir sesgos editoriales y de encuadre en temas políticos y sociales.
- Idiomas limitados a ruso e inglés; el rendimiento en castellano no está documentado ni probablemente sea fiable.
- Longitud de contexto no especificada, lo que dificulta planificar casos de uso con documentos largos.
- Licencia propietaria "rusmind-license": es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial; no es una licencia de código abierto estándar.
- Distribución exclusivamente en GGUF en este repositorio: no se ofrecen safetensors para reentrenamiento o cuantización personalizada en este modelo (sí se menciona BF16 GGUF para "investigación y cuantización propia").
- El autor recomienda migrar a la versión 4.7, lo que sugiere que la 3.5 está en fin de vida y no recibirá mejoras.
- Al ser un modelo pequeño orientado a dispositivo, el rendimiento en razonamiento multi-paso complejo y en código de producción será inferior al de modelos de mayor tamaño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-3.5-Vspyshka
- Repositorio de la familia RusMind Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka
- Versión posterior 4.7 Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Versión 4.7 Sokol: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Demo en navegador: https://rusmind.ru
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
