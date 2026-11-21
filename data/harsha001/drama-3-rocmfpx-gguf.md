# Harsha001/Drama-3-ROCmFPX-GGUF

## Resumen

Drama 3 es un modelo de texto a voz (TTS) desarrollado por Fish Audio, con 35.774 millones de parámetros totales y aproximadamente 3.000 millones activos por token, lo que lo sitúa en la categoría de arquitectura Mixture-of-Experts (MoE). El modelo base, `fishaudio/drama-3`, se distribuye en esta ficha a través de la versión cuantizada de Harsha001, empaquetada en formato GGUF con tipos de peso ROCmFPX y ROCmFP4 optimizados para hardware AMD (ROCm, Strix Halo). Resuelve el problema de síntesis de voz multilingüe de alta calidad con control expresivo: genera habla en 83 idiomas, admite un único hablante o escenas de hasta 16 voces, y acepta indicaciones como `[laughs]` incrustadas en el texto.

La relevancia de esta publicación radica en la cuantización agresiva con preservación de calidad: el archivo recomendado `Q4_0_ROCMFP4` ocupa 21,1 GB y alcanza un CER del 1,18% frente al 1,44% del F16 de referencia, es decir, dentro del ruido entre semillas. Esto permite ejecutar un modelo TTS de 35B en GPUs de consumo y en equipos con memoria unificada como el DGX Spark, algo impensable con los pesos completos (71,6 GB en F16, 143 GB en F32).

La ficha corresponde a la release final del 31 de octubre de 2026, que sustituye a los pesos de vista previa del 20 de octubre y añade soporte de escalas tensoriales ROCmFPX, corrigiendo una pérdida de precisión de unos 4 bits en el tipo de 8 bits. Los archivos solo funcionan en `speech.cpp` compilado contra el fork ROCmFPX de ggml con el parche incluido; no son compatibles con llama.cpp, LM Studio, Ollama ni speech.cpp estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, con decodificador de audio y códec integrados |
| Parámetros totales | 35.774.408.084 (35,77B) |
| Parámetros activos | ~3B (denominación 35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16 (referencia, no publicada), F32 (intermedio, 143 GB), Q8_0_ROCMFPX, Q6_0_ROCMFPX (etiquetado Q6_K), Q4_0_ROCMFP4, Q4_0_ROCMFP4_FAST, Q4_0_ROCMI4; Q4_K stock solo como línea base |
| Idiomas soportados | 83 idiomas (según la model card del modelo base) |
| Licencia | Fish Audio Community License 1.0 (`other`) |
| Formato de pesos | GGUF (con tipos ROCmFPX/ROCmFP4/ROCMI4 no estándar) |
| Tamaño del repo | 255,6 GB |
| Frecuencia de muestreo del códec | 44,1 kHz |
| Voces por generación | 1 hablante o escena de hasta 16 |
| Fecha de creación | 2026-10-19 (actualizado 2026-10-31) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos con 35,77B parámetros totales y unos 3B activos por token, diseñada específicamente para síntesis de voz. Integra en un único artefacto el modelo de lenguaje, el decodificador de audio y el códec a 44,1 kHz, de modo que cada archivo GGUF contiene la totalidad del pipeline de generación de habla. La model card no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO; esa información no está disponible en los materiales consultados.

La innovación técnica de esta distribución es la cuantización ROCmFPX, que multiplica cada matriz de pesos (cada experto de una matriz MoE) por una potencia de dos antes de cuantizarla y almacena la inversa como un tensor `<name>.scale` que speech.cpp vuelve a aplicar tras el producto matricial. Esto evita que los pesos de experto, muy pequeños, choquen con el límite inferior de las escalas de bloque y pierdan precisión. Las tablas de búsqueda leídas por filas (embeddings de tokens y de codebook) se guardan como `Q8_0` estándar, mientras que normas, router y tensores sensibles permanecen en F32 y el códec en F16. El proceso de conversión parte de `reference/drama3/convert.py` de speech.cpp v0.8.10 fijado a la revisión final `78e5ab7` (expertos FP8 dequantizados como hace fish-speech), genera un GGUF F32 de 143 GB y luego cuantiza con `LLAMA_ROCMFPX_TENSOR_SCALE=1 speech quantize`.

## Capacidades

- Síntesis de voz (text-to-speech) en 83 idiomas con salida de audio a 44,1 kHz.
- Generación con un único hablante o con escenas multi-hablante de hasta 16 voces.
- Control expresivo mediante indicaciones en el texto, como `[laughs]`.
- Modo `--voice none` para generación sin condicionamiento de voz de referencia.
- Clonación de voz sujeta a consentimiento explícito de la persona imitada.
- Integración en pipelines de audio mediante speech.cpp con el fork ROCmFPX de ggml.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni otras capacidades de agente en la información disponible.

## Casos de uso

- Audiolibros y narración automatizada: el modelo genera habla de forma continua con un CER del 1,18% en el archivo Q4_0_ROCMFP4, lo que permite producir horas de narración con fidelidad de transcripción alta y sin intervención manual.
- Doblaje y localización multilingüe: al cubrir 83 idiomas, se puede sintetizar el mismo guion en múltiples lenguas manteniendo el estilo expresivo mediante indicaciones como `[laughs]`, útil para catálogos de vídeo.
- Escenas de audio con varios personajes: la capacidad de hasta 16 voces en una sola generación permite producir diálogos de ficción sonora o podcasts dramatizados sin segmentar manualmente por hablante.
- Asistentes de voz en local: al caber en GPUs de consumo con 21,1 GB (Q4_0_ROCMFP4) y ejecutarse sobre el códec integrado, se puede desplegar un TTS privado sin depender de servicios en la nube.
- Accesibilidad y lectores de pantalla: la síntesis a 44,1 kHz y el control de expresividad permiten generar lecturas de documentos con entonación natural para usuarios con discapacidad visual.
- Prototipado de interfaces conversacionales: desarrolladores que trabajan sobre hardware AMD con ROCm pueden integrar el modelo en speech.cpp para probar flujos de voz completos antes de pasar a producción.
- Investigación en TTS y cuantización: los archivos publicados con métricas CER/WER por semilla sirven como referencia reproducible para estudiar el impacto de la cuantización en modelos MoE de audio.

## Benchmarks y rendimiento

La model card publica métricas de calidad de transcripción (CER y WER medidos con Qwen3-ASR 1.7B sobre 20 frases en inglés, media de dos semillas) y velocidad en la CPU ARM de 20 núcleos de un NVIDIA DGX Spark.

| Archivo | Tamaño | CER | WER | CER por semilla | Velocidad (CPU ARM) |
|---|---:|---:|---:|---|---:|
| F16 (referencia, no publicado) | 71,6 GB | 1,44% | 1,66% | 1,90 / 0,98 | 0,10x tiempo real |
| Q8_0_ROCMFPX | 37,4 GB | 1,94% | 1,85% | 2,89 / 0,98 | 0,39x tiempo real |
| Q6_0_ROCMFPX (etiquetado Q6_K) | 29,8 GB | 1,31% | 1,48% | 1,64 / 0,98 | 0,02x tiempo real |
| Q4_0_ROCMFP4 (recomendado) | 21,1 GB | 1,18% | 1,29% | 0,98 / 1,38 | 0,20x tiempo real |
| Q4_0_ROCMFP4_FAST | 20,1 GB | 1,84% | 2,03% | 1,71 / 1,97 | 0,10x tiempo real |
| Q4_0_ROCMI4 | 20,1 GB | 1,50% | 1,66% | 0,98 / 2,03 | 0,10x tiempo real |
| Q4_K (stock ggml, línea base) | 20,8 GB | 2,26% | 2,58% | 3,54 / 0,98 | 0,49x tiempo real |

El autor advierte que la misma variación entre semillas ronda un punto porcentual, por lo que diferencias de un punto o menos entre archivos son ruido. Todos los archivos publicados quedan dentro del ruido del F16. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo es de síntesis de voz.

## Requisitos de hardware

- VRAM estimada: 21,1 GB para Q4_0_ROCMFP4, 20,1 GB para Q4_0_ROCMFP4_FAST y Q4_0_ROCMI4, 29,8 GB para Q6_0_ROCMFPX, 37,4 GB para Q8_0_ROCMFPX; el F16 de referencia requiere 71,6 GB y el F32 intermedio 143 GB.
- GPU recomendadas: el autor orienta los tipos ROCmFPX a GPUs AMD con ROCm (menciona Strix Halo), pero indica explícitamente que los archivos no se han probado todavía en hardware AMD.
- GPU de consumo: el archivo recomendado de 21,1 GB cabe en GPUs con 24 GB de VRAM; los de 20,1 GB también. El Q6 de 29,8 GB y el Q8 de 37,4 GB exigen GPUs de gama profesional o memoria unificada.
- Memoria unificada: el equipo de prueba fue un NVIDIA DGX Spark con 20 núcleos ARM, donde los tipos ROCmFPX corren sobre su código CPU portable.
- Despliegue: exclusivamente `speech.cpp` v0.8.10 compilado contra el fork ROCmFPX de ggml con el parche `speechcpp-rocmfpx.patch` de este repositorio. No funciona en llama.cpp, LM Studio, Ollama ni speech.cpp estándar.
- Latencia y throughput: en CPU ARM, entre 0,02x y 0,39x tiempo real según el archivo; el Q6_0_ROCMFPX carece de ruta rápida para ARM y resulta muy lento allí. En GPUs AMD los tipos usan kernels dedicados, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad TTS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Drama 3 ROCmFPX (esta ficha) | 35,77B totales / ~3B activos | no disponible | CER 1,18% (Q4_0_ROCMFP4) | Fish Audio Community License 1.0 | GGUF solo para speech.cpp con fork ROCmFPX |
| Drama 3 F16 (modelo base, `fishaudio/drama-3`) | 35,77B totales / ~3B activos | no disponible | CER 1,44% (referencia) | Fish Audio Community License 1.0 | Pesos originales de Fish Audio |
| Q4_K stock ggml (línea base de la model card) | 35,77B totales / ~3B activos | no disponible | CER 2,26% | Fish Audio Community License 1.0 | GGUF estándar, pero solo como referencia de comparación |

No se dispone de datos de otros modelos TTS comparables en la información proporcionada.

## Limitaciones y advertencias

- Los archivos solo se ejecutan en speech.cpp con el fork ROCmFPX de ggml y el parche de este repositorio; cualquier otro runtime (llama.cpp, LM Studio, Ollama, speech.cpp estándar) fallará.
- No se han probado en hardware AMD a pesar de estar optimizados para ROCm; las velocidades publicadas corresponden a una CPU ARM.
- El archivo Q6_0_ROCMFPX tiene un rendimiento muy bajo en ARM (0,02x tiempo real) por falta de ruta rápida para ese tipo.
- La licencia Fish Audio Community License 1.0 permite uso gratuito solo para investigación y fines no comerciales; el uso comercial se limita a empresas con ingresos anuales inferiores a 500.000 USD y prohíbe servicios alojados de voz o clonación sin acuerdo separado.
- Prohibido imitar la voz de una persona real sin su consentimiento.
- Riesgo de alucinación y errores de pronunciación inherentes a los modelos TTS; las métricas CER/WER se midieron solo en inglés y con 20 frases, por lo que la calidad en los otros 82 idiomas no está cuantificada.
- No se documentan sesgos específicos ni evaluación de idiomas distintos del inglés.
- El proyecto no está hecho, patrocinado ni respaldado por Fish Audio.
- Si se descargaron archivos antes del 31 de octubre de 2026, provienen de los pesos de vista previa y deben descargarse de nuevo.

## Enlaces

- Hugging Face: https://huggingface.co/Harsha001/Drama-3-ROCmFPX-GGUF
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Repositorio ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- speech.cpp: https://github.com/nyosegawa/speech.cpp
- Qwen3-ASR 1.7B (evaluador): https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Licencia: https://huggingface.co/Harsha001/Drama-3-ROCmFPX-GGUF/blob/main/LICENSE
