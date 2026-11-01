# cortex-ai-nova/NOVA-Oracle-4.6-16bit

## Resumen

NOVA-Oracle-4.6-16bit es un ajuste fino (fine-tune) del modelo Whisper Large V3 de OpenAI, distribuido por el usuario cortex-ai-nova bajo licencia Apache 2.0. Se trata de un modelo especializado en reconocimiento automatico del habla (ASR) y transcripcion, construido sobre la arquitectura encoder-decoder transformer caracteristica de la familia Whisper, con 1.543.490.560 parametros totales y pesos en formato safetensors de 16 bits. El repositorio ocupa 3,1 GB y esta etiquetado para su uso con transformers, text-generation-inference y la libreria unsloth.

El modelo hereda la cobertura multilingue de Whisper Large V3, con soporte declarado para mas de 90 idiomas, incluyendo ingles, ruso, kazajo y un amplio conjunto de lenguas europeas, asiaticas y africanas. Segun la model card, el ajuste se realizo sobre 8 conjuntos de datos y diversas fuentes de licencia abierta, con el objetivo de mejorar la robustez frente a ruido de fondo, microfonos de baja calidad y habla rapida.

La relevancia de esta ficha radica en que el modelo se presenta como una alternativa "todo en uno" para transcripcion y traduccion de audio, aunque con un historico de adopcion muy limitado (39 descargas y 0 likes en el momento de la consulta) y sin benchmarks publicados en la informacion disponible. Es, por tanto, un modelo a evaluar con cautela antes de integrarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large V3) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, heredada de Whisper Large V3) |
| Tipos de cuantizacion | no disponible (pesos publicados en 16 bits) |
| Idiomas soportados | en, ru, kk, af, sq, am, ar, hy, as, az, ba, eu, be, bn, bs, br, bg, yue, ca, zh, hr, cs, da, nl, et, fo, fi, fr, gl, ka, de, el, gu, ht, ha, haw, he, hi, hu, jw, my, is, id, it, ja, jv, kn, km, ko, lo, la, lv, ln, lt, lb, mk, mg, ms, ml, mt, mi, mr (mas de 90 en total) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Whisper Large V3, un transformer encoder-decoder disenado para ASR. El encoder procesa espectrogramas Mel de audio de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales para deteccion de idioma, transcripcion y traduccion. NOVA-Oracle-4.6 mantiene esta arquitectura y anade un ajuste fino realizado, segun la model card, sobre 8 conjuntos de datos y diversas fuentes de licencia abierta.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en ASR). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El autor menciona que el ajuste busca mejorar la resistencia a ruido de fondo, microfonos deficientes y habla rapida, pero no aporta metricas que lo respalden.

## Capacidades

- Transcripcion de audio a texto en mas de 90 idiomas, incluyendo ingles, ruso, kazajo, espanol, frances, aleman, chino, arabe, hindi y numerosas lenguas africanas y asiaticas.
- Traduccion de audio a texto en ingles (capacidad nativa de Whisper) y, segun la model card, traduccion entre idiomas como espanol a ruso (ejemplo citado por el autor).
- Robustez declarada frente a ruido de fondo, microfonos de baja calidad y habla rapida.
- Procesamiento de audio de podcasts, clases, llamadas y videos.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo thinking, vision ni audio de salida (solo ASR y traduccion).
- Capacidades multilingues amplias heredadas de Whisper Large V3.

## Casos de uso

- Transcripcion de podcasts y entrevistas: el modelo puede convertir audio de larga duracion en texto, segmento a segmento, gracias a la ventana de 30 segundos de Whisper y a su robustez declarada frente a ruido ambiental.
- Subtitulado automatico de videos: integrado en pipelines de postproduccion, permite generar subtitulos en multiples idiomas y traducir el audio al ingles de forma nativa.
- Actas de reuniones y llamadas: con audio de calidad variable, el ajuste fino busca mantener la precision en entornos con microfonos deficientes, lo que lo hace adecuado para transcripcion de reuniones corporativas.
- Traduccion de contenido audiovisual: el autor cita explicitamente el caso de traducir un video de espanol a ruso, util para localizacion de contenido educativo o divulgativo.
- Investigacion en ASR multilingue: al estar bajo Apache 2.0 y en formato safetensors, sirve como base para experimentos academicos y ajustes posteriores con unsloth.
- Atencion al cliente basada en voz: transcripcion de grabaciones de llamadas para su analisis posterior, con cobertura de idiomas poco frecuentes como kazajo o lenguas africanas.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en contenido en idiomas minoritarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 1.543 millones de parametros en 16 bits, los pesos ocupan aproximadamente 3,1 GB; con overhead de activaciones y cache, se estiman entre 4 y 6 GB de VRAM en FP16.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX A6000 para inferencia individual.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores) en FP16; con cuantizacion a 8 bits cabria en GPUs de 6 GB.
- Opciones de despliegue: transformers, text-generation-inference (segun tags), unsloth para ajuste fino; no se documenta soporte explicito de vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NOVA-Oracle-4.6-16bit | 1.543 M | 30 s de audio | 90+ | Apache 2.0 | HuggingFace (39 descargas) |
| Whisper Large V3 (OpenAI) | 1.550 M | 30 s de audio | 99 | MIT | HuggingFace, ampliamente adoptado |
| Whisper Large V3 Turbo | 809 M | 30 s de audio | 99 | MIT | HuggingFace |
| Distil-Whisper Large V3 | 756 M | 30 s de audio | Ingles principalmente | MIT | HuggingFace |

La comparativa se basa en caracteristicas publicas de la familia Whisper; no se dispone de datos de rendimiento comparativo para NOVA-Oracle-4.6.

## Limitaciones y advertencias

- No se han publicado benchmarks que respalden las mejoras declaradas frente a Whisper Large V3.
- El historico de adopcion es muy bajo (39 descargas, 0 likes), lo que dificulta la validacion por parte de la comunidad.
- Riesgo de alucinacion inherente a los modelos Whisper, especialmente en segmentos de silencio o audio de baja calidad.
- La ventana de audio efectiva es de 30 segundos por segmento, lo que requiere segmentacion para audios largos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base Whisper Large V3 tiene licencia MIT; conviene verificar la procedencia exacta de los datos de ajuste fino.
- No se documentan sesgos especificos, pero al ser un ajuste sobre Whisper Large V3 hereda los sesgos conocidos de este en acentos, dialectos y calidad de audio.
- No se documenta soporte para tool calling, agentes ni otras capacidades mas alla de ASR y traduccion.
- La model card no especifica la composicion exacta de los 8 datasets de ajuste, lo que limita la trazabilidad y la evaluacion de riesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cortex-ai-nova/NOVA-Oracle-4.6-16bit
- Modelo base: https://huggingface.co/unsloth/whisper-large-v3
- Whisper Large V3 original (OpenAI): https://huggingface.co/openai/whisper-large-v3
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
