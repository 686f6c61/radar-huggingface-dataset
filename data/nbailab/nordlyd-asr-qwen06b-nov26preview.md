# NbAiLab/nordlyd-asr-qwen06B-nov26preview

## Resumen

Nordlyd ASR Qwen0.6B (nov26preview) es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el Nasjonalbiblioteket (NbAiLab, Biblioteca Nacional de Noruega). Se trata de un fine-tuning del modelo NbAiLab/Qwen3-ASR-0.6B-custom-tokenizer, que a su vez deriva de la familia Qwen3-ASR. El modelo esta especializado en transcripcion de audio en noruego bokmal (nb), noruego nynorsk (nn) e ingles (en), con soporte explicito para code-switching entre estas lenguas.

La relevancia de este modelo radica en su enfoque en el multilingueismo escandinavo real: no solo transcribe noruego e ingles de forma aislada, sino que maneja utterances donde el hablante alterna entre idiomas dentro de la misma frase, un fenomeno comun en contextos laborales y academicos noruegos. Con 782 millones de parametros totales (segun los pesos safetensors) y un repo de 1,6 GB, esta pensado para despliegue en infraestructura modesta.

El modelo se distribuye bajo licencia Apache 2.0, pero con acceso restringido (gated) en Hugging Face: es necesario aceptar las condiciones en la pagina del modelo antes de descargarlo. La version "nov26preview" indica que es una preview de noviembre de 2026, por lo que cabe esperar iteraciones posteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer encoder-decoder para ASR, segun tag `qwen3_asr`) |
| Parametros totales | 782.426.112 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | nb (noruego bokmal), nn (noruego nynorsk), en (ingles); soporte de code-switching |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como `qwen3_asr`, es decir, la arquitectura ASR de la familia Qwen3, implementada en la libreria `transformers`. Se trata de un fine-tuning sobre NbAiLab/Qwen3-ASR-0.6B-custom-tokenizer, un checkpoint base con tokenizer personalizado. No se dispone de detalles publicos sobre el numero de tokens de audio utilizados, la composicion del dataset de entrenamiento, ni si se aplicaron tecnicas de RLHF, DPO o similares.

El tag `code-switching` sugiere que el entrenamiento incluyo datos con alternancia de idiomas (noruego-ingles), lo cual es coherente con el objetivo del proyecto Nordlyd de cubrir el habla real noruega. No se han publicado innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla (ASR) en noruego bokmal, noruego nynorsk e ingles.
- Transcripcion con soporte de code-switching noruego-ingles dentro de una misma utterance.
- Integracion con el pipeline `automatic-speech-recognition` de `transformers`.
- Compatible con endpoints de Hugging Face (`endpoints_compatible`).
- Modelo alojado en la region EU (`region:eu`), relevante para requisitos de soberania de datos.
- No se documentan capacidades de tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Transcripcion de reuniones en entornos laborales noruegos: el modelo maneja utterances donde se alterna noruego e ingles (habitual en empresas tecnologicas y centros de investigacion), evitando segmentaciones manuales por idioma.
- Subtitulado de contenido audiovisual de la Biblioteca Nacional de Noruega: adecuado para archivos historicos y contemporaneos en bokmal y nynorsk, con 782 M de parametros que permiten procesamiento por lotes en CPU o GPU modesta.
- Atencion al cliente en centros de contacto nordicos: transcripcion en tiempo real de llamadas donde el cliente puede cambiar entre noruego e ingles, con despliegue via `transformers` o endpoints compatibles.
- Documentacion clinica dictada: transcripcion de notas medicas en noruego bokmal, con la ventaja de que el modelo esta alojado en la UE, lo que facilita el cumplimiento del RGPD.
- Investigacion linguistica y corpus: generacion de transcripciones para estudios de code-switching y variacion dialectal entre bokmal y nynorsk, gracias a la licencia Apache 2.0 que permite uso academico sin restricciones.
- Accesibilidad: generacion de subtitulos automaticos para videos educativos y administrativos en noruego, con un modelo lo suficientemente pequeno (1,6 GB) para ejecutarse en infraestructura local sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,6 GB solo para pesos; con overhead de activaciones y cache, se recomienda al menos 3-4 GB de VRAM.
- En cuantizacion de 8 bits: alrededor de 0,8 GB de pesos; cabe en GPUs consumer con 4 GB o mas.
- En cuantizacion de 4 bits: alrededor de 0,4 GB de pesos; viable en GPUs integradas o CPU.
- GPU recomendadas: RTX 3060/4060 o superiores para inferencia comoda; A100/H100 no son necesarias dado el tamano, pero permiten mayor throughput en lotes.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: `transformers` (libreria oficial), endpoints compatibles de Hugging Face. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| NbAiLab/nordlyd-asr-qwen06B-nov26preview | 782 M | no disponible | nb, nn, en (code-switching) | Apache 2.0 | Gated |
| NbAiLab/Qwen3-ASR-0.6B-custom-tokenizer (base) | ~0,6 B | no disponible | no disponible | no disponible | no disponible |
| Whisper large-v3 (OpenAI) | 1,55 B | 30 s de audio | multilingue (99 idiomas) | MIT | Abierto |
| NB-Whisper (NbAiLab) | ~1,5 B (large) | 30 s de audio | noruego, ingles | Apache 2.0 | Abierto |

La comparativa con Whisper large-v3 y NB-Whisper es orientativa: el modelo de NbAiLab aqui descrito es sustancialmente mas pequeno (782 M frente a ~1,5 B) y esta especializado en noruego con code-switching, mientras que Whisper large-v3 prioriza cobertura multilingue amplia. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en Hugging Face; es necesario aceptar las condiciones antes de descargarlo, lo que puede complicar pipelines automatizados.
- Version preview: la etiqueta "nov26preview" indica que no es una version estable; pueden aparecer cambios incompatibles en iteraciones posteriores.
- Idiomas limitados: solo nb, nn y en; no se debe esperar buen rendimiento en sueco, danes u otras lenguas.
- Sin datos publicos de benchmarks: no es posible verificar su calidad frente a alternativas como NB-Whisper sin evaluacion propia.
- Riesgo de alucinacion en ASR: como todo modelo generativo de transcripcion, puede producir texto plausible pero incorrecto en audio con ruido, acentos marcados o solapamiento de hablantes.
- Sesgos no documentados: no se dispone de informacion sobre la composicion del dataset de entrenamiento ni sobre sesgos dialectales o de genero.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated puede imponer condiciones adicionales que deben revisarse en la pagina del modelo.
- Sin soporte confirmado para vLLM, llama.cpp u otros motores de inferencia de alto rendimiento; el despliegue se limita a `transformers` y endpoints compatibles segun la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NbAiLab/nordlyd-asr-qwen06B-nov26preview
- Modelo base: https://huggingface.co/NbAiLab/Qwen3-ASR-0.6B-custom-tokenizer
- Organizacion NbAiLab: https://huggingface.co/NbAiLab
