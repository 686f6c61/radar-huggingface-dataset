# Atomic-Germ/Whisper-V3-Turbo-NPU2

## Resumen

Whisper-V3-Turbo-NPU2 es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado por Atomic-Germ como un ajuste fino (fine-tune) de `openai/whisper-large-v3-turbo`, orientado a su ejecución en unidades de procesamiento neuronal (NPU). El modelo base, propuesto por OpenAI en el artículo "Robust Speech Recognition via Large-Scale Weak Supervision", fue entrenado con más de 5 millones de horas de datos etiquetados y destaca por su capacidad de generalización en múltiples dominios sin necesidad de ajuste específico. La variante turbo reduce el número de capas del decodificador de 32 a 4, lo que acelera la inferencia con una degradación mínima de calidad. Este modelo concreto añade una capa de optimización para NPU, lo que lo hace relevante para despliegues en dispositivos edge y entornos con recursos limitados. El repositorio tiene un tamaño de 0,7 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) con decodificador de 4 capas (variante turbo) |
| Parametros totales | no disponible (hereda la arquitectura de whisper-large-v3-turbo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos (con manejo de audio largo mediante segmentación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con Transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper de OpenAI: un transformer encoder-decoder que procesa espectrogramas de audio de 30 segundos. La variante turbo, sobre la que se basa este fine-tune, reduce el decodificador de 32 a 4 capas, lo que disminuye la latencia y el coste computacional a cambio de una ligera pérdida de precisión. El entrenamiento original de Whisper utilizó más de 5 millones de horas de audio etiquetado, con una estrategia de supervisión débil a gran escala que permite generalizar a nuevos dominios sin ajuste adicional. En este caso, el autor ha realizado un fine-tune adicional sobre `whisper-large-v3-turbo` con el objetivo de optimizar el modelo para NPU, aunque no se detallan los datos ni el procedimiento exacto de este ajuste. No se mencionan técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Transcripción de voz a texto en más de 90 idiomas, con detección automática del idioma de origen.
- Traducción de voz a texto en inglés (tarea `translate`).
- Generación de marcas de tiempo a nivel de frase o de palabra (`return_timestamps`).
- Manejo de audio de longitud arbitraria mediante segmentación en ventanas de 30 segundos.
- Soporte de estrategias de decodificación avanzadas: temperatura con fallback, condición sobre tokens previos, umbrales de compresión y de no-voz.
- Compatible con el pipeline `automatic-speech-recognition` de Hugging Face Transformers.
- Optimización específica para NPU, lo que permite inferencia eficiente en hardware de bajo consumo.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar grabaciones largas segmentándolas en ventanas de 30 segundos, generando texto con marcas de tiempo para facilitar la navegación.
- Subtitulado automático de vídeos: gracias a la generación de timestamps a nivel de palabra, es posible alinear los subtítulos con precisión en múltiples idiomas.
- Asistentes de voz en dispositivos edge: la optimización para NPU permite ejecutar el modelo en hardware de bajo consumo, como teléfonos o dispositivos IoT, para comandos de voz en tiempo real.
- Traducción simultánea de conferencias: la tarea `translate` convierte el audio en inglés, útil para retransmisiones internacionales.
- Análisis de llamadas de atención al cliente: transcripción automática de conversaciones para su posterior análisis de sentimiento o extracción de información.
- Accesibilidad para personas con discapacidad auditiva: conversión de audio a texto en tiempo real en aplicaciones de comunicación.
- Archivado de contenido audiovisual: indexación de podcasts, programas de radio o archivos históricos mediante transcripción y búsqueda textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo hereda el rendimiento de `whisper-large-v3-turbo`, que según OpenAI ofrece una velocidad de transcripción significativamente mayor que `large-v3` con una degradación mínima de precisión, pero no se aportan cifras concretas para esta variante específica.

## Requisitos de hardware

- Tamaño del repositorio: 0,7 GB, lo que sugiere un modelo ligero (probablemente en precisión fp16 o fp32).
- Al ser una variante turbo con solo 4 capas de decodificador, la inferencia es rápida y puede ejecutarse en CPU, aunque se recomienda GPU para un rendimiento óptimo.
- No se especifican requisitos de VRAM, pero por el tamaño del modelo se estima que cabe en GPUs de consumo con 4 GB o más (por ejemplo, RTX 3050, RTX 3060, etc.).
- Compatible con el pipeline de Transformers, por lo que puede desplegarse con vLLM, TGI o directamente con la librería `transformers`.
- La optimización para NPU sugiere que también puede ejecutarse en aceleradores dedicados como Qualcomm Hexagon, Rockchip NPU u otros, aunque no se proporcionan detalles de integración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Velocidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper-V3-Turbo-NPU2 (este) | no disponible (hereda turbo) | 30 s | Alta (turbo + NPU) | MIT | Hugging Face |
| openai/whisper-large-v3 | 1550 M | 30 s | Media | MIT | Hugging Face |
| openai/whisper-large-v3-turbo | 809 M (aprox.) | 30 s | Alta | MIT | Hugging Face |

La comparativa se basa en el modelo base, ya que no se dispone de datos específicos de esta variante. El modelo NPU2 es un fine-tune del turbo, por lo que su rendimiento debería ser similar al turbo, con la ventaja añadida de la optimización para NPU.

## Limitaciones y advertencias

- No se han publicado detalles sobre el proceso de fine-tune ni sobre los datos utilizados, por lo que no se puede evaluar la posible introducción de sesgos adicionales.
- Whisper en general puede presentar alucinaciones en audio con ruido de fondo o habla no clara, especialmente en idiomas con menos representación en el entrenamiento.
- La ventana de contexto de 30 segundos requiere segmentación para audios largos, lo que puede afectar a la coherencia en transcripciones de conversaciones continuas.
- Aunque la licencia es MIT, el uso comercial está permitido, pero se recomienda verificar la procedencia de los datos de audio utilizados para el fine-tune.
- No se garantiza la compatibilidad con todas las NPU; la optimización puede ser específica de ciertos proveedores.
- El modelo no incluye capacidades de visión ni de generación de texto libre; está limitado a tareas de ASR y traducción de voz.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Atomic-Germ/Whisper-V3-Turbo-NPU2)
- [Paper original de Whisper](https://huggingface.co/papers/2212.04356)
- [Repositorio oficial de Whisper en GitHub](https://github.com/openai/whisper)
- [Discusión sobre la variante turbo](https://github.com/openai/whisper/discussions/2363)
- [Modelo base openai/whisper-large-v3-turbo](https://huggingface.co/openai/whisper-large-v3-turbo)
