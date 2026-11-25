# GhaythMahadin/lang-id-voxlingua107-ecapa-gguf

## Resumen
lang-id-voxlingua107-ecapa-gguf es una conversión al formato GGUF del modelo SpeechBrain `lang-id-voxlingua107-ecapa`, un identificador de idioma hablado (spoken language identification) basado en la arquitectura ECAPA-TDNN. Lo publica el usuario GhaythMahadin y está pensado para su uso con el runtime transcribe.cpp, una implementación en C/C++ orientada a inferencia local de modelos de audio. No transcribe voz a texto: su salida es un ranking de etiquetas de idioma con sus probabilidades.

El modelo cubre 107 idiomas y trabaja sobre audio WAV mono a 16 kHz, puntuando hasta los últimos 30 segundos de cada clip. Con 21.244.679 parámetros (unos 21,2 millones) y un repositorio de apenas 0,2 GB, es un modelo extremadamente ligero que cabe en cualquier equipo. Su relevancia práctica está en pipelines de enrutamiento de audio multilingüe, preprocesado antes de ASR o moderación de contenido, donde se necesita identificar el idioma con un coste computacional mínimo.

La ficha se centra en la conversión GGUF publicada, que hereda la licencia Apache-2.0 del modelo base y ofrece tres cuantizaciones (F32, F16 y Q8_0) con precisiones Top-1 muy similares entre sí según las mediciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (red neuronal convolucional con atención y estadísticas de pooling, orientada a embeddings de habla) |
| Parametros totales | 21.244.679 (aprox. 21,2 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como contexto de texto; puntúa hasta los últimos 30 s de audio por clip |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | 107 idiomas (ab, af, am, ar, as, az, ba, be, bg, bn, bo, br, bs, ca, ceb, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fo, fr, gl, gn, gu, gv, ha, haw, hi, hr, ht, hu, hy, ia, id, is, it, iw, ja, jw, ka, kk, km, kn, ko, la, lb, ln, lo, lt, lv, mg, mi, mk, ml, mn, mr, ms, mt, my, ne, nl, nn, no, oc, pa, pl, ps, pt, ro, ru, sa, sco, sd, si, sk, sl, sn, so, sq, sr, su, sv, sw, ta, te, tg, th, tk, tl, tr, tt, uk, ur, uz, vi, war, yi, yo, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (conversión de los pesos originales de SpeechBrain) |

## Arquitectura y entrenamiento
El modelo base emplea ECAPA-TDNN, una arquitectura que combina capas convolucionales dilatadas con mecanismos de atención y agregación estadística para producir embeddings de habla. A diferencia de su uso clásico en reconocimiento de hablante, esta variante incorpora más capas totalmente conectadas ocultas después de la capa de embedding y se entrena con pérdida de entropía cruzada, lo que según los autores mejora la calidad de los embeddings para tareas posteriores.

El entrenamiento se realizó sobre el dataset VoxLingua107, con grabaciones muestreadas a 16 kHz y un solo canal. La conversión GGUF está portada desde el commit upstream `0253049` (fijado el 2026-10-05) y validada contra la referencia de SpeechBrain en el commit `aa4d0f47` de transcribe.cpp el 2026-10-08. No se dispone en la información proporcionada del número exacto de tokens de audio, la composición detallada del dataset ni si se aplicaron fases de ajuste adicionales más allá del entrenamiento supervisado con entropía cruzada.

## Capacidades
- Identificación de idioma hablado sobre 107 lenguas, devolviendo etiquetas ordenadas por probabilidad.
- Restricción opcional del conjunto de idiomas candidatos mediante una lista permitida (por ejemplo, `--allow en,de,fr`).
- Salida de las N mejores candidatas (`--top N`) con su probabilidad asociada.
- Procesamiento de audio WAV mono a 16 kHz; puntúa hasta los últimos 30 segundos del clip.
- No realiza transcripción de voz a texto ni traducción.
- No soporta streaming (campo `streaming: false` en la metadata de transcribe.cpp).
- No soporta detección de idioma dentro de la propia transcripción (`lang_detect: false`) ni marcas de tiempo (`timestamps: none`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador de audio, no un modelo generativo.
- Integración mediante CLI (`transcribe-cli`) y API en C (`include/transcribe/langid.h`).

## Casos de uso
- Enrutamiento de llamadas en centros de atención al cliente: identificar el idioma del interlocutor en los primeros segundos de audio y derivar la llamada al agente o al modelo ASR adecuado, aprovechando que puntúa hasta 30 s y admite restringir candidatos.
- Preprocesado en pipelines de ASR multilingüe: seleccionar el modelo de reconocimiento de voz correcto antes de transcribir, reduciendo errores de decodificación por idioma equivocado.
- Moderación de contenido en plataformas de audio: clasificar clips subidos para verificar que el idioma declarado coincide con el hablado y detectar contenido no deseado en lenguas no soportadas por los moderadores.
- Indexación y búsqueda de archivos de audio: etiquetar automáticamente grandes volúmenes de grabaciones con su idioma para facilitar la búsqueda y organización.
- Investigación lingüística y sociolingüística: analizar corpus de audio para estudiar distribución de lenguas, con la ventaja de un modelo de 21 millones de parámetros que se ejecuta en CPU.
- Despliegue en dispositivos de borde y sistemas embebidos: gracias a su tamaño (27 MB en Q8_0) y a su ejecución en CPU con tiempos de procesamiento muy bajos, puede integrarse en aplicaciones locales sin GPU.
- Filtrado previo en sistemas de subtitulado automático: descartar o marcar clips cuyo idioma no coincide con el esperado antes de invocar modelos de transcripción más costosos.

## Benchmarks y rendimiento

Precisión Top-1 sobre FLEURS multilingüe (3.000 enunciados), medida en CPU por el autor en transcribe.cpp `2fdb5c95` el 2026-10-07, sobre los primeros 5 s de cada clip sin recorte de silencios:

| Cuantizacion | Tamano | Top-1 accuracy (FLEURS multilingue) |
|---|---:|---:|
| F32 | 85 MB | 85,23 % |
| F16 | 45 MB | 85,17 % |
| Q8_0 | 27 MB | 86,30 % |

Rendimiento en tiempo real (RTF, factor de tiempo real) reportado en la metadata de transcribe.cpp:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | CPU | 122,91 |
| Apple M4 Max | Metal | 1319,2 |
| Ryzen 4750U | CPU | 42,16 |
| Ryzen 4750U | Vulkan | 101,7 |

No se han publicado en la información disponible resultados de benchmarks adicionales (por ejemplo, comparativas frente a otros identificadores de idioma) más allá de los anteriores.

## Requisitos de hardware
- VRAM estimada para inferencia: prácticamente nula; el modelo pesa entre 27 MB (Q8_0) y 85 MB (F32), por lo que puede ejecutarse íntegramente en CPU y memoria RAM convencional.
- GPU recomendadas: no requiere GPU; funciona en CPU. Se han medido aceleraciones con Metal en Apple M4 Max y con Vulkan en Ryzen 4750U.
- Cabe en cualquier GPU de consumo, incluida una RTX 4090, aunque no es necesario disponer de GPU dedicada.
- Opciones de despliegue: transcribe.cpp (CLI y API en C), compilado desde fuente con CMake. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: el RTF medido es de 42,16 en CPU (Ryzen 4750U) y 122,91 en CPU (M4 Max), lo que indica procesamiento muy por encima de tiempo real; con Metal en M4 Max alcanza 1319,2 y con Vulkan en Ryzen 4750U, 101,7.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| lang-id-voxlingua107-ecapa-gguf (este) | 21,2 M | hasta 30 s por clip | 107 | Apache-2.0 | GGUF |
| speechbrain/lang-id-voxlingua107-ecapa | 21,2 M (original) | hasta 30 s por clip | 107 | Apache-2.0 | pesos SpeechBrain |
| Alternativas de identificacion de idioma | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar la conversión GGUF con su modelo base original; no se dispone de datos de otros identificadores de idioma comparables para completar la tabla.

## Limitaciones y advertencias
- No es un modelo de transcripción: no genera texto a partir de audio, solo etiquetas de idioma.
- Solo acepta audio WAV mono a 16 kHz; es necesario convertir otros formatos previamente (por ejemplo, con ffmpeg).
- Solo puntúa hasta los últimos 30 segundos del clip; clips más largos se truncan y pueden perder señal relevante.
- No soporta streaming ni marcas de tiempo.
- Puede confundirse entre lenguas cercanas o con pocos datos en VoxLingua107; la precisión Top-1 reportada ronda el 85-86 % en FLEURS multilingüe, lo que implica un margen de error no despreciable en producción.
- Riesgo de sesgo hacia las lenguas con mayor representación en el dataset de entrenamiento; no se dispone de análisis de sesgos en la información proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card upstream para los términos completos.
- La conversión GGUF está validada contra la referencia de SpeechBrain, pero no se dispone de garantías de equivalencia numérica exacta más allá de lo indicado por el autor.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/lang-id-voxlingua107-ecapa-gguf
- Modelo base: https://huggingface.co/speechbrain/lang-id-voxlingua107-ecapa
- Commit upstream fijado: https://huggingface.co/speechbrain/lang-id-voxlingua107-ecapa/commit/0253049
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/aa4d0f47
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/lang-id-voxlingua107-ecapa.md
- Dataset VoxLingua107: https://cs.taltech.ee/staff/tanel.alumae/data/voxlingua107/
- Paper asociado (arXiv): https://arxiv.org/abs/2106.04624
