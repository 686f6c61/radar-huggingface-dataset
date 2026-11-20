# Jevvellabs/whisper-large-v3-turbo-cs-de-en-es-pl

## Resumen

Whisper large-v3-turbo cs-de-en-es-pl es un ajuste fino del modelo de reconocimiento automatico del habla `openai/whisper-large-v3-turbo` desarrollado por Jevvellabs AI Services. Su objetivo es resolver un problema concreto que los modelos Whisper genericos gestionan mal: la transcripcion de audio con cambio de idioma intra-frase (code-switching) entre aleman, ingles, espanol y polaco, sin degradar la precision monolingue. El modelo parte de la arquitectura encoder-decoder de Whisper (32 capas de encoder congeladas y un decoder fino de 4 capas), con 808,9 millones de parametros totales.

La relevancia practica esta en el escenario multilingue real: reuniones, atencion al cliente o entrevistas donde un hablante alterna idiomas dentro de la misma frase. El autor reporta una reduccion del WER del 30,48 % al 16,52 % en un benchmark propio de code-switching, manteniendo un WER monolingue de 6,65 % en FLEURS, estadisticamente indistinguible del modelo base. Se distribuye con licencia MIT en formato safetensors (FP16) y como artefacto GGML Q8_0 listo para `whisper.cpp`, lo que permite despliegue tanto en GPU como en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo; encoder 32 capas, decoder 4 capas) |
| Parametros totales | 808.878.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | FP16 (safetensors) y Q8_0 (GGML para whisper.cpp) |
| Idiomas soportados | aleman (de), ingles (en), espanol (es), polaco (pl) |
| Licencia | MIT |
| Formato de pesos | safetensors y GGML (`ggml-whisper-large-v3-turbo-iter2-q8_0.bin`, 833,7 MiB) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura de `whisper-large-v3-turbo`: un encoder de 32 capas y un decoder fino de 4 capas. El ajuste se realizo mediante LoRA con el encoder completamente congelado, aplicando adaptadores sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1` y `fc2` del decoder. Tras el entrenamiento se realizo un merge completo de pesos (`merge_and_unload()`) y una cuantizacion Q8_0 con `whisper-quantize`.

La innovacion principal es el condicionamiento multi-prefijo: cada utterance con code-switching se emparejo con multiples tokens de prefijo de idioma (`<|de|>`, `<|en|>`, `<|es|>`, `<|pl|>`) para que el decoder fino transcriba literalmente las clausulas en idioma extranjero en lugar de forzar transliteracion fonetica o traduccion bajo `-l auto`. Para evitar olvido catastrofico se introdujo replay balanceado de `google/fleurs` verificado por humanos en los cuatro idiomas. Los datos de entrenamiento son exclusivamente publicos (`google/fleurs`, CC-BY-4.0) y utterances TTS sinteticas con voces disjuntas; no se uso audio privado ni de clientes.

## Capacidades

- Reconocimiento automatico del habla (ASR) en aleman, ingles, espanol y polaco.
- Transcripcion de code-switching intra-frase e inter-frase entre los cuatro idiomas.
- Deteccion automatica de idioma por segmento mediante `-l auto` en whisper.cpp.
- Preservacion de entidades tecnicas (nombres propios, terminos especializados) con recall del 75 % en el benchmark del autor.
- Tasa de alucinacion en silencio del 0,0 % (4 clips de silencio evaluados).
- Integracion con Silero VAD v5.1.2 para segmentacion por pausas.
- Inferencia en CPU via whisper.cpp y en GPU via Transformers.
- No soporta tool calling, agentes ni capacidades multimodales mas alla del audio de entrada.

## Casos de uso

- Transcripcion de reuniones multinacionales: equipos con hablantes de aleman, ingles, espanol y polaco que alternan idiomas en la misma conversacion. El modelo transcribe cada clausula en su idioma original sin traducir, gracias al condicionamiento multi-prefijo.
- Atencion al cliente multilingue: centralitas que reciben llamadas de clientes europeos con mezcla de idiomas; el modelo permite generar transcripciones fieles para sistemas de analitica o resumen posterior.
- Subtitulado de contenido audiovisual: videos tecnicos o formativos donde el ponente usa terminos en ingles dentro de una frase en aleman o espanol, manteniendo la terminologia original.
- Documentacion clinica o legal dictada: profesionales que dictan informes mezclando terminologia en ingles (CIE-10, terminos legales) con su idioma nativo, donde la preservacion de entidades es critica (recall del 75 %).
- Despliegue en edge o entornos sin GPU: el artefacto Q8_0 de 834 MiB permite ejecutar ASR en CPU con whisper.cpp, adecuado para dispositivos locales o servidores sin acelerador.
- Pipelines de transcripcion por lotes: integracion en flujos de procesamiento masivo de audio usando la API de `transformers` con FP16 en GPU, o whisper.cpp en CPU para reducir costes.
- Investigacion en code-switching: el modelo sirve como referencia ajustada para experimentos de ASR multilingue con benchmarks propios y reproducibles.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), evaluados sobre el artefacto GGML Q8_0 en whisper.cpp v1.9.4 con `-l auto` y Silero VAD v5.1.2, frente al modelo base `ggml-large-v3-turbo-q8_0.bin`:

| Benchmark | Whisper large-v3-turbo (Q8_0) | Este modelo (iter2-q8_0) | Delta |
|---|---:|---:|---:|
| WER code-switching DE/EN/ES/PL (n=24, voces disjuntas) | 30,48 % | 16,52 % | -13,96 pts (-45,8 % rel.); IC 95 % [-22,07 %, -6,80 %] |
| Recall de entidades tecnicas (n=24) | 60,42 % | 75,00 % | +14,58 pts |
| WER monolingue `google/fleurs` (n=48: DE/EN/ES/PL) | 6,33 % | 6,65 % | +0,32 pts; IC 95 % [-0,39 %, +1,04 %] |
| Tasa de alucinacion en silencio (n=4) | 0,0 % | 0,0 % | 0,0 % |

Desglose por idioma en `google/fleurs` (n=12 por idioma):

| Idioma | WER modelo base | WER este modelo |
|---|---:|---:|
| Aleman (`de_de`) | 9,01 % | 9,46 % |
| Ingles (`en_us`) | 8,80 % | 8,80 % |
| Espanol (`es_419`) | 2,56 % | 2,56 % |
| Polaco (`pl_pl`) | 5,42 % | 6,40 % |

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 1,6 GB solo para pesos; con overhead de inferencia y buffers de audio, en torno a 2-3 GB.
- VRAM estimada en Q8_0 (whisper.cpp): aproximadamente 0,9-1,5 GB, ejecutable en CPU sin GPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). El modelo es pequeno para su categoria y no requiere GPUs de datacenter.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas.
- Opciones de despliegue: `transformers` (pipeline ASR), whisper.cpp v1.9.4 (artefacto GGML Q8_0 incluido), `whisper-quantize` para generar otras cuantizaciones.
- Latencia y throughput: no disponibles de forma numerica en la informacion proporcionada; el autor recomienda combinar `-l auto` con Silero VAD y segmentacion por pausas (split en silencios >= 0,50 s, merge de turnos < 2,5 s) para optimizar latencia y precision en grabaciones multi-turno.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER code-switching (benchmark del autor) | Licencia | Formatos |
|---|---|---|---|---|---|
| Este modelo (Jevvellabs) | 808,9 M | de, en, es, pl | 16,52 % | MIT | safetensors, GGML Q8_0 |
| `openai/whisper-large-v3-turbo` | 809 M (aprox.) | 99 idiomas | 30,48 % | MIT | safetensors, GGML |
| `Jevvellabs/whisper-small-cs-de-en-es-pl` | no disponible (modelo small) | de, en, es, pl | 18,52 % | MIT (segun repo companion) | F16 465 MiB |

El modelo base cubre muchos mas idiomas pero no esta optimizado para code-switching intra-frase. El modelo companion `small` ofrece menor huella de memoria (465 MiB F16) a costa de un WER de code-switching ligeramente superior (18,52 % frente a 16,52 %).

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- El benchmark de code-switching tiene un tamano de muestra pequeno (n=24) y el de FLEURS n=48; los intervalos de confianza son amplios.
- Solo cubre cuatro idiomas (de, en, es, pl); para otros idiomas hay que recurrir al modelo base.
- Ligera degradacion en polaco (5,42 % a 6,40 % WER) y aleman (9,01 % a 9,46 %) respecto al base en FLEURS.
- Riesgo de alucinacion en audio ruidoso o fuera de dominio no cuantificado mas alla de los 4 clips de silencio evaluados.
- Entrenado solo con datos publicos y TTS sintetico; puede presentar sesgos acusticos hacia las condiciones de esos datasets.
- Licencia MIT permite uso comercial sin restricciones adicionales, pero se recomienda validacion propia en el dominio de despliegue.
- El decoder fino de 4 capas limita la capacidad de razonamiento contextual respecto a modelos con decoders mayores.
- No dispone de soporte de marcas de tiempo a nivel de palabra documentado en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jevvellabs/whisper-large-v3-turbo-cs-de-en-es-pl
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Modelo companion (small): https://huggingface.co/Jevvellabs/whisper-small-cs-de-en-es-pl
- Perfil del autor: https://huggingface.co/Jevvellabs
- Dataset de evaluacion: `google/fleurs` (CC-BY-4.0)
- Informe de metricas: `benchmark_gate_report.json` (incluido en el repositorio del modelo)
