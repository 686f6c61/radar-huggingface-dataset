# AMAImedia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-BF16-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B es un modelo de lenguaje de voz (speech LLM) de pesos abiertos desarrollado por NVIDIA para transcripcion automatica, traduccion de voz, diarizacion de hablantes y preguntas sobre audio. Esta ficha corresponde a la cuantizacion GGUF en BF16 publicada por AMAImedia (NOESIS), una conversion comunitaria del modelo original de NVIDIA pensada para despliegue local con runtimes compatibles con el formato GGUF.

El modelo resuelve el problema de transcribir grabaciones largas (hasta una hora) en 40 idiomas con marcas de tiempo, identificacion de idioma y soporte de code-switching, todo en un unico modelo instruido. Su arquitectura hibrida de tipo mixture-of-experts activa aproximadamente 4,3 mil millones de parametros (incluido el codificador de audio) sobre un total de unos 33,7 mil millones, lo que reduce drasticamente el coste computacional por token frente a un modelo denso equivalente. El contexto es de 65.536 tokens.

Es relevante ahora porque las alternativas open source a Whisper para audio largo y multilingue con instrucciones son escasas, y Nemotron 3.5 Transcribe se publica en precisiones BF16, FP8 y NVFP4 junto con el dataset de entrenamiento Granary-v2, facilitando tanto despliegue en produccion como fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Speech LLM hibrido mixture-of-experts (base Nemotron 3.5 Lightning) con codificador de audio |
| Parametros totales | 33.697.781.029 (dato real safetensors, ~33,7 B) |
| Parametros activos | ~4,3 B (incluido el codificador de audio) |
| Longitud de contexto | 65.536 tokens (audio de hasta 1 hora) |
| Tipos de cuantizacion | BF16 (esta conversion); el modelo original de NVIDIA se publica en BF16, FP8 y NVFP4 |
| Idiomas soportados | 40 idiomas: aleman, arabe, bengali, búlgaro, chino, coreano, croata, danes, eslovaco, esloveno, espanol, estonio, euskera no incluido — cs, nl, en, fr, de, hi, it, ko, pl, pt, ru, sk, es, bg, hr, da, et, fi, hu, ja, lv, lt, ro, sl, sv, th, tr, uk, ar, bn, zh, el, he, id, mt, mr, tl, ta, te, vi |
| Licencia | OpenMDW-1.1 (license: other) |
| Formato de pesos | GGUF (conversion con imatrix); el original usa safetensors en NeMo/PyTorch |

Nota: el repositorio pesa 91,7 GB, coherente con BF16 para ~33,7 B de parametros mas el codificador de audio.

## Arquitectura y entrenamiento

El modelo se construye sobre NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, un LLM hibrido mixture-of-experts, al que se anade un codificador de audio para formar la variante Transcribe 30B-A4B. La activacion de ~4,3 B de parametros (frente a ~3 B en el Lightning base) refleja la inclusion del componente de audio. La arquitectura hibrida (combinacion de capas attention y capas eficientes, tipica de la familia Nemotron 3.5) permite manejar secuencias largas de audio con contexto de 65.536 tokens.

El entrenamiento utiliza el dataset nvidia/Granary-v2, un corpus de voz multilingue publicado por NVIDIA junto al modelo. El modelo es instruido (instruction-following) y admite tareas definidas por prompt: transcripcion con estilo seleccionado por instruccion, traduccion de voz, diarizacion, identificacion de idioma y preguntas sobre el audio. No hay informacion disponible sobre el numero exacto de tokens de entrenamiento ni sobre el uso de RLHF/DPO; los detalles tecnicos estan en el informe tecnico oficial de NVIDIA (ver Enlaces).

## Capacidades

- Transcripcion automatica de voz (ASR) en 40 idiomas, con marcas de tiempo (timestamps)
- Audio largo: grabaciones de hasta una hora de duracion en una sola pasada
- Traduccion de voz (speech translation) entre los idiomas soportados
- Diarizacion de hablantes (separacion por hablante en la transcripcion)
- Identificacion de idioma (language identification)
- Soporte de code-switching (mezcla de idiomas dentro de la misma grabacion)
- Preguntas y respuestas sobre contenido de audio (audio question answering)
- Seguimiento de instrucciones: el estilo y formato de la transcripcion se controlan por prompt
- Etiquetado en el HF ASR leaderboard; pipeline text2text-generation sobre representaciones de audio

## Casos de uso

- Transcripcion de reuniones y llamadas largas: gracias al soporte de audio de hasta 1 hora y a la diarizacion, puede generar actas con separacion por hablante en una sola pasada sin troceado manual.
- Subtitulado y doblaje multilingue: la combinacion de transcripcion con timestamps y traduccion de voz lo encaja en pipelines de subtitulado y localizacion de video; el propio publicador lo enmarca en una plataforma de doblaje automatico.
- Atencion al cliente y analitica de llamadas: transcripcion de grabaciones en 40 idiomas con identificacion de idioma automatica, util para centros de contacto internacionales.
- Procesamiento de contenido multilingue con code-switching: entrevistas o podcasts donde los hablantes mezclan idiomas (por ejemplo espanol-ingles), escenario donde los ASR clasicos suelen fallar.
- Interfaces de voz conversacionales: como speech LLM instruido, puede integrarse en asistentes que responden preguntas sobre el audio (resumenes, extraccion de datos de una llamada).
- Generacion de datasets de voz: uso como modelo profesor para pseudoetiquetar corpus de audio en idiomas con poca cobertura, aprovechando el soporte de 40 idiomas.
- Investigacion en ASR local y privado: despliegue offline en GPU propia para organizaciones que no pueden enviar audio a APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion concreta. La model card original de NVIDIA remite a su seccion "Results at a Glance" y al informe tecnico oficial, pero no incluye tablas de metricas (WER, BLEU, etc.) en el material proporcionado, por lo que no se reproducen numeros aqui.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16 GGUF: ~65-70 GB solo de pesos (33,7 B a 2 bytes por parametro, mas overhead del codificador de audio y del KV cache); con contexto de audio largo, presupuestar 80 GB o mas.
- GPUs recomendadas: A100 80 GB, H100 80 GB o H200; en consumer, una RTX 4090 (24 GB) no basta para BF16 y requeriria offload a RAM.
- El autor de la conversion ejecuta sus cuants con 64 GB de DDR5 y RTX 3060 Laptop 6 GB usando offload a RAM (llama.cpp), lo que indica que es viable en CPU + GPU hibrida con velocidad reducida.
- Para precisiones FP8 o NVFP4 (publicadas por NVIDIA en el modelo original), los requisitos bajan a ~35 GB y ~18 GB aproximadamente, cabiendo en una H100 80 GB con margen o en una RTX 5090 (32 GB) en NVFP4, respectivamente (estimacion por tamano de pesos, no dato oficial).
- Despliegue: llama.cpp y runtimes GGUF (Ollama, LM Studio) para esta conversion; para el modelo original, NeMo Speech, SGLang-Omni (con cookbook oficial) y el demo en Hugging Face Spaces.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros / activos | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron 3.5 Transcribe 30B-A4B (esta ficha) | 33,7 B / ~4,3 B | 65.536 tokens (audio 1 h) | 40 | OpenMDW-1.1 | GGUF (BF16), BF16/FP8/NVFP4 original |
| Whisper large-v3 (OpenAI) | ~1,55 B (denso) | ~30 s por ventana | ~99 | MIT (pesos) | safetensors, GGUF |
| Voxtral / Qwen2-Audio (clase audio-LLM) | no disponible | no disponible | no disponible | no disponible | no disponible |

Frente a Whisper large-v3, Nemotron 3.5 Transcribe ofrece audio largo nativo (1 hora frente a ventanas de ~30 s), diarizacion, traduccion y seguimiento de instrucciones, a costa de un tamano mucho mayor (aunque con solo ~4,3 B activos). No hay datos de WER comparativos publicados en la informacion disponible.

## Limitaciones y advertencias

- Licencia OpenMDW-1.1: es una licencia abierta distinta de Apache-2.0/MIT; revisar sus terminos antes de uso comercial (enlace en la model card).
- Riesgo de alucinacion tipico de ASR generativo: al ser un LLM de voz instruido, puede inventar contenido en silencios o audio ruidoso; validar contra marcas de tiempo en usos criticos.
- El rendimiento en GGUF BF16 conversion comunitaria puede diferir del original de NVIDIA; la conversion procede de AtomicChat y AMAImedia, no de NVIDIA.
- Requisitos de hardware elevados en BF16 (~70 GB), lo que limita el despliegue local sin offload a RAM y penaliza la latencia.
- No hay informacion disponible sobre sesgos especificos, ni sobre WER por idioma en esta ficha; consultar el informe tecnico de NVIDIA.
- El soporte de 40 idiomas no garantiza calidad homogenea; los idiomas con menos recursos (mr, mt, tl) probablemente rindan peor que en, es o zh (no hay datos publicados aqui para confirmarlo).
- Requiere libreria NeMo o runtimes GGUF compatibles; no funciona directamente con transformers estandar para audio sin adaptacion.

## Enlaces

- Modelo (esta conversion GGUF): https://huggingface.co/AMAImedia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-BF16-GGUF
- Modelo original de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Base Nemotron 3.5 Lightning: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Dataset de entrenamiento Granary-v2: https://huggingface.co/datasets/nvidia/Granary-v2
- Informe tecnico de NVIDIA: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/nvidia/nemotron-transcribe
- NeMo Speech (GitHub): https://github.com/NVIDIA-NeMo/Speech
- SGLang-Omni cookbook: https://sgl-project.github.io/sglang-omni/cookbook/nemotron_transcribe.html
- Pagina de desarrolladores Nemotron: https://developer.nvidia.com/nemotron
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Paper arXiv citado en tags: https://arxiv.org/abs/2310.09424
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
