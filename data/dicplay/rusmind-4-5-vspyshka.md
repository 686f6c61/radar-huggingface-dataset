# DICPlay/RusMind-4.5-Vspyshka

## Resumen

RusMind 4.5 · Vspyshka (Вспышка, "destello") es un ajuste fino en ruso e inglés del modelo google/gemma-4-E4B-it, publicado por el desarrollador DICPlay bajo su propia licencia propietaria `rusmind-license`. Se distribuye exclusivamente en formato GGUF (un único archivo BF16 de 15,1 GB) y está pensado para inferencia local y offline en llama.cpp, LM Studio, Ollama o PocketPal, así como para ejecutarse dentro del navegador a través de rusmind.ru. El modelo base es un transformer denso de Google con aproximadamente 7,5 mil millones de parámetros reales según los pesos publicados.

La propuesta de valor es un asistente conversacional en ruso que cubre escritura, explicaciones, apoyo al estudio y generación de código sin conexión a internet, con un énfasis explícito en conocimiento de historia, cultura, leyes, regiones y "valores familiares tradicionales" de Rusia. El autor lo posiciona como "IA nacional" y lo compara con modelos rusos de mayor tamaño (T-pro, GigaChat, YandexGPT) y con alternativas internacionales (Qwen3.5-9B, Gemma 4 E4B).

Es relevante ahora porque la model card remite a una versión posterior (RusMind 4.7 · Vspyshka) que el autor sitúa en el puesto 2 entre modelos de menos de 10 mil millones de parámetros en el benchmark ruso MERA v2 con una puntuación de 0,191. La ficha que sigue documenta la versión 4.5, marcada por el propio autor como "preliminar" y ya superada por la 4.7.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de google/gemma-4-E4B-it); detalles internos no disponibles |
| Parametros totales | 7.518.069.290 (dato de safetensors); la model card cita "7,5 mil millones" |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Solo BF16 en el repositorio (archivo `RusMind-Vspyshka-4.5-BF16.gguf`, 15,1 GB); no se publican otros niveles de cuantizacion |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | `rusmind-license` (licencia propietaria del autor, enlazada como LICENSE en el repo); etiquetada como "other" en Hugging Face |
| Formato de pesos | GGUF (unica distribucion); no se publican safetensors en este repositorio |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) del checkpoint instructivo google/gemma-4-E4B-it. La información pública no detalla la arquitectura interna del modelo base más allá de su naturaleza transformer y su tamaño de aproximadamente 7,5 mil millones de parámetros, ni especifica si se emplearon variantes de atención lineal, decodificación especulativa u otras optimizaciones. Tampoco se publican el número de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se aplicaron etapas de RLHF o DPO.

Lo que sí documenta el autor son los objetivos del ajuste: mejorar la comprensión del ruso y de la cultura rusa (refranes y proverbios, humor, juegos de palabras, caracteres y particularidades regionales), la corrección ortográfica y de puntuación, y el seguimiento de instrucciones largas y de múltiples pasos, incluyendo el uso de herramientas (tool calling). La model card menciona además un resultado de 0,719 en la tarea de corrección de ortografía y puntuación de MERA v2, sin especificar la métrica exacta ni el conjunto de evaluación.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con modo de chat (`-cnv` en llama.cpp).
- Escritura y corrección: ortografía, puntuación y estilo en ruso (0,719 declarado en la tarea correspondiente de MERA v2).
- Comprensión cultural: refranes, humor, juegos de palabras, personajes y particularidades regionales de Rusia.
- Conocimiento declarado de historia, cultura, legislación, regiones y pueblos de Rusia.
- Seguimiento de instrucciones largas y de múltiples pasos.
- Manejo de documentos largos (sin que se especifique la ventana de contexto exacta).
- Tool calling / function calling, según la model card ("вызывает инструменты").
- Apoyo al estudio y generación de código, según la descripción del producto.
- Ejecución offline y on-device: no requiere conexión tras la descarga inicial.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido (thinking) para esta versión.

## Casos de uso

- Asistente conversacional offline en escritorio: desplegado con llama.cpp o LM Studio sobre el GGUF BF16, permite mantener conversaciones multi-turno sin conexión, útil en entornos con requisitos de privacidad o sin red.
- Corrección y edición de textos en ruso: el modelo puede revisar ortografía, puntuación y estilo de borradores, aprovechando el ajuste específico declarado en esta tarea (0,719 en MERA v2).
- Apoyo al estudio en ruso: explicación de conceptos, resumen de material didáctico y resolución de dudas en historia y cultura rusas, gracias al conocimiento declarado sobre regiones y tradiciones.
- Generación de código asistida: el autor lo presenta como ayuda para programación; puede integrarse en editores o scripts locales que invoquen llama.cpp vía API compatible con endpoints.
- Atención al cliente en ruso con requisitos de soberanía de datos: al ejecutarse en local, los datos no salen del dispositivo, lo que encaja en despliegues con restricciones de residencia de datos.
- Integración en aplicaciones de escritorio o móviles rusas: el autor lo usa en productos propios como DIC.Антивирус PRO para explicar resultados técnicos en lenguaje llano; el formato GGUF facilita el empaquetado en apps de escritorio y en PocketPal para móvil.
- Procesamiento de documentos largos e instrucciones multi-paso: útil para tareas de extracción o transformación de información en flujos con varias etapas, aunque la longitud de contexto no está publicada y debe validarse empíricamente.

## Benchmarks y rendimiento

La model card de la versión 4.5 no incluye una tabla propia de resultados. Los datos de MERA v2 que aparecen corresponden a la versión posterior 4.7 · Vspyshka y se reproducen aquí solo como referencia contextual del autor, no como rendimiento de la 4.5:

| Modelo | Parametros | MERA v2 (general) |
|---|---|---|
| RusMind Vspyshka 4.7 (DICPlay) | 7,5 mil millones | 0,191 |
| Qwen3.5-9B (Alibaba) | 9 mil millones | 0,186 |
| Gemma 4 E4B (Google) | 8 mil millones | 0,170 |
| RuadaptQwen3-32B | 32 mil millones | 0,163 |
| Zero-Mistral | 24 mil millones | 0,160 |
| T-lite (T-Bank) | 8 mil millones | 0,130 |

Para RusMind 4.5 · Vspyshka no se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el único archivo publicado es BF16 de 15,1 GB; la inferencia requiere al menos ~16 GB de VRAM o memoria unificada para cargarlo completo, más overhead de contexto KV.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue con holgura; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) cargan el BF16 con margen limitado.
- GPU consumer: no cabe en tarjetas de 8-12 GB en BF16; al no publicarse cuantizaciones GGUF de menor precisión, el usuario tendría que generarlas él mismo a partir del BF16 (Q8_0, Q5_K_M, Q4_K_M) para entrar en ese rango.
- Memoria unificada: equipos Apple Silicon con 24 GB o más pueden ejecutar el BF16 vía llama.cpp; los Mac de 16 GB requerirían cuantización propia.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -cnv`), LM Studio, Ollama, PocketPal y cualquier runtime compatible con GGUF; también navegador vía rusmind.ru. No se documenta soporte para vLLM o TGI (formatos safetensors no publicados).
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RusMind 4.5 · Vspyshka | 7,5 mil millones | No disponible | rusmind-license (propietaria) | GGUF BF16 | Ajuste ruso de Gemma 4 E4B; sin benchmarks propios publicados |
| RusMind 4.7 · Vspyshka | 7,5 mil millones | No disponible | rusmind-license | GGUF | Versión recomendada por el autor; 0,191 en MERA v2 |
| Qwen3.5-9B (Alibaba) | 9 mil millones | No disponible en la información | No disponible en la información | No disponible en la información | 0,186 en MERA v2 según la model card |
| Gemma 4 E4B (Google) | 8 mil millones | No disponible en la información | No disponible en la información | No disponible en la información | Modelo base de RusMind; 0,170 en MERA v2 según la model card |
| T-lite (T-Bank) | 8 mil millones | No disponible en la información | No disponible en la información | No disponible en la información | 0,130 en MERA v2 según la model card |

## Limitaciones y advertencias

- Modelo marcado como "versión preliminar" por el propio autor, que recomienda migrar a RusMind 4.7 · Vspyshka.
- Solo se distribuye en BF16 GGUF; no hay cuantizaciones oficiales, lo que limita el despliegue en hardware consumer de gama media.
- La longitud de contexto no está publicada; no debe asumirse una ventana concreta para documentos largos sin validación previa.
- Solo ruso e inglés; no se declara soporte para otras lenguas, incluido el español.
- Licencia propietaria `rusmind-license`: es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; no es una licencia open source estándar.
- Riesgo de alucinación inherente a un modelo de 7,5 mil millones de parámetros, especialmente en dominios factuales como legislación o historia; requiere verificación humana en producción.
- Sesgo editorial: el ajuste enfatiza explícitamente "valores familiares tradicionales" y una narrativa cultural e histórica concreta de Rusia, lo que puede introducir sesgos en temas sociales, políticos e históricos.
- Sin resultados de benchmarks propios publicados para la versión 4.5; las cifras de MERA v2 citadas corresponden a la 4.7 y no son extrapolables.
- Sin datos sobre composición del dataset de ajuste fino ni sobre etapas de alineación (RLHF/DPO), lo que dificulta evaluar riesgos de seguridad y sesgo.
- El repositorio pesa 15,1 GB y la descarga completa es necesaria incluso para pruebas; no hay versiones ligeras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5-Vspyshka
- Archivo BF16 GGUF: https://huggingface.co/DICPlay/RusMind-4.5-Vspyshka/blob/main/RusMind-Vspyshka-4.5-BF16.gguf
- Repositorio de todas las versiones Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka
- Versión recomendada 4.7 · Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Versión 4.7 · Sokol: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Demo en navegador: https://rusmind.ru
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
