# jburtoft/Qwen3-ASR-1.7B-DFlash

## Resumen

Qwen3-ASR-1.7B-DFlash es un modelo borrador (draft model) de decodificación especulativa por difusión de bloques, diseñado para acelerar la inferencia de `Qwen/Qwen3-ASR-1.7B`, el modelo de reconocimiento automático del habla de la familia Qwen3. Lo desarrolla jburtoft y se publica bajo licencia Apache 2.0. No es un modelo ASR autónomo: es un componente auxiliar que propone tokens que el modelo objetivo verifica en decodificación greedy, reduciendo el número de pasos necesarios para transcribir audio.

El borrador emplea la técnica DFlash (block-diffusion speculative decoding, arXiv:2602.06036): propone 15 tokens por paso en un único forward pass y el modelo Qwen3-ASR los valida. Consta de 5 capas draft con dimensión oculta 2048 y 272,7 millones de parámetros en BF16 (545 MB), reutilizando los embeddings y la LM head del modelo objetivo, por lo que el checkpoint publicado no los incluye. Se entrenó en AWS Trainium2 exclusivamente con datos de voz de licencia abierta.

Su relevancia es práctica: la decodificación especulativa es una de las vías más eficaces para reducir la latencia en transcripción en streaming y por lotes, y este checkpoint está adaptado específicamente a las particularidades de Qwen3-ASR (token de máscara 151705, features de las capas del decodificador de texto [1, 7, 13, 19, 25], RoPE propio con theta 1e6). El formato es compatible con el `qwen3_dflash.py` de vLLM, el drafter DFlash de vllm-neuron y el código de referencia `z-lab/dflash`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer draft de 5 capas (capas Qwen3) con decodificacion especulativa por difusion de bloques (DFlash) |
| Parametros totales | 272.655.616 (272,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (unico formato publicado); no se documentan otras cuantizaciones |
| Idiomas soportados | en, de, fr, es, it, pt, nl, pl, zh, ja, ru, multilingual (la aceptacion depende de la cobertura del entrenamiento; ver benchmarks) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato publico DFlash, `DFlashDraftModel`); sin embeddings ni LM head |
| Modelo base | Qwen/Qwen3-ASR-1.7B |
| Tamano del bloque especulativo | 16 (`num_speculative_tokens = 15`) |
| Capas objetivo (features) | salidas de las capas del decodificador de texto [1, 7, 13, 19, 25] (servidores capturan 2, 8, 14, 20, 26) |
| Token de mascara | id 151705 |
| RoPE | propio del draft, theta 1e6 |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un borrador de difusión de bloques para decodificación especulativa. En cada paso propone un bloque de 15 tokens en un solo forward pass; el modelo objetivo Qwen3-ASR verifica las propuestas con la misma regla de aceptación greedy que usa la verificación DFlash en vLLM y añade un token bonus. El borrador tiene 5 capas con hidden 2048 y consume las activaciones de las capas [1, 7, 13, 19, 25] del decodificador de texto del modelo objetivo. No incluye embeddings ni LM head: reutiliza los del modelo Qwen3-ASR (tied). El token de máscara es el 151705 (primera fila de embedding tras el tokenizador), distinto del 151669 que usan los drafts DFlash públicos de Qwen3, porque en Qwen3-ASR ese id corresponde a `<|audio_start|>`.

El entrenamiento se realizó en AWS Trainium2 con datos de voz exclusivamente de licencia abierta: LibriSpeech, LibriTTS-R, MLS (inglés), Multilingual LibriSpeech, Common Voice 17, VoxPopuli, People's Speech y AMI. La model card distingue un checkpoint "stage 1" (clips cortos) y el checkpoint publicado ("release", s2b 16k), que añade adaptación a formato largo. El código de entrenamiento está en github.com/jimburtoft/qwen3-asr-dflash. No se documentan detalles sobre número total de tokens de entrenamiento ni sobre el uso de RLHF/DPO (no aplica a un draft de decodificación especulativa).

## Capacidades

- Propuesta de tokens para decodificación especulativa sobre Qwen3-ASR-1.7B: 15 tokens por paso en un forward pass, verificados por el modelo objetivo en decodificación greedy.
- Aceleración de ASR multilingüe en 11 idiomas declarados (en, de, fr, es, it, pt, nl, pl, zh, ja, ru) más etiqueta multilingual.
- Adaptación específica a audio de formato largo (ventanas de 31-300 s), con mejora notable frente al checkpoint stage 1 en AMI long-form (tau 4,23 frente a 1,17).
- Compatibilidad con el formato público DFlash: lectura por `qwen3_dflash.py` de vLLM, el drafter DFlash de vllm-neuron y el código de referencia `z-lab/dflash`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un componente de inferencia, no un modelo generativo de propósito general.
- No es un modelo de visión ni audio multimodal: opera sobre las activaciones internas del decodificador de texto del modelo objetivo.

## Casos de uso

- Transcripción por lotes de gran volumen: usar el draft junto a Qwen3-ASR-1.7B en vLLM para reducir el número de pasos de decodificación por audio; la aceptación media de 6,89 tokens por paso en inglés implica menos forwards del modelo objetivo y mayor throughput agregado.
- Subtitulado y transcripción en streaming: el borrador propone bloques de 15 tokens que el objetivo verifica, lo que disminuye la latencia por segmento en comparación con la decodificación token a token; útil en pipelines de subtitulado casi en tiempo real.
- Actas de reuniones (formato largo): el checkpoint publicado está adaptado a ventanas de 31-300 s y mantiene una aceptación de 4,23 en AMI long-form, adecuada para diarización y transcripción de reuniones con el modelo objetivo.
- Transcripción multilingüe en producción: cobertura efectiva en es, fr, de, it, nl, zh-CN y th con aceptación de 2,9-4,7 según el conjunto, lo que permite desplegar un único par draft+objetivo para varios mercados europeos y asiáticos.
- Servicios de ASR de bajo coste en AWS: el entrenamiento y el drafter están integrados con vllm-neuron (Trainium), de modo que se puede desplegar la pareja en infraestructura Neuron sin GPU.
- Investigación en decodificación especulativa: el formato abierto y el código de entrenamiento permiten reproducir la aceptación reportada y experimentar con variantes de bloque, capas objetivo o datos de adaptación.

## Benchmarks y rendimiento

Los resultados publicados miden aceptación (tau = tokens aceptados medios por paso del draft, incluido el token bonus del objetivo) sobre conjuntos held-out, con decodificación greedy. No se publican métricas WER ni comparaciones con otros modelos ASR.

| Conjunto held-out | release (s2b 16k) | stage 1 (200k) |
|---|---|---|
| Ingles (6 conjuntos) | 6,89 | 7,15 |
| Todos los 80 conjuntos cortos | 2,95 | 3,05 |
| AMI long-form (31-300 s) | 4,23 | 1,17 |
| LibriSpeech test.clean | 7,57 | 7,82 |
| VoxPopuli en test | 7,18 | 7,47 |
| LibriSpeech test.other | 7,00 | 7,35 |
| FLEURS en_us test | 6,79 | 7,12 |
| AMI ihm test | 6,20 | 6,40 |
| Common Voice 17 en test | 5,73 | 5,77 |
| VoxPopuli es test | 4,67 | 4,89 |
| MLS spanish test | 4,43 | 4,65 |
| FLEURS es_419 test | 4,35 | 4,50 |
| Common Voice 17 es test | 4,33 | 4,46 |
| VoxPopuli fr test | 4,31 | 4,41 |
| VoxPopuli de test | 4,07 | 4,21 |
| Common Voice 17 nl test | 4,06 | 4,23 |
| MLS german test | 3,99 | 4,17 |
| Common Voice 17 zh-CN test | 3,96 | 4,10 |
| VoxPopuli nl test | 3,92 | 4,06 |
| MLS french test | 3,91 | 4,01 |
| VoxPopuli it test | 3,89 | 4,09 |
| FLEURS cmn_hans_cn test | 3,86 | 3,99 |
| FLEURS it_it test | 3,81 | 3,99 |
| Common Voice 17 fr test | 3,78 | 3,93 |
| FLEURS de_de test | 3,75 | 3,89 |
| FLEURS fr_fr test | 3,73 | 3,84 |
| Common Voice 17 it test | 3,72 | 3,92 |
| MLS dutch test | 3,67 | 3,82 |
| Common Voice 17 pt test | 3,64 | 3,74 |
| Common Voice 17 de test | 3,61 | 3,73 |
| Common Voice 17 th test | 3,61 | 3,76 |
| MLS italian test | 3,48 | 3,66 |
| FLEURS pt_br test | 3,37 | 3,48 |
| Common Voice 17 pl test | 3,27 | 3,40 |
| FLEURS nl_nl test | 3,26 | 3,38 |
| MLS portuguese test | 3,24 | 3,39 |
| Common Voice 17 ru test | 3,20 | 3,26 |
| VoxPopuli pl test | 3,15 | 3,31 |
| MLS polish test | 2,96 | 3,09 |
| Common Voice 17 tr test | 2,96 | 3,04 |
| FLEURS th_th test | 2,90 | 3,00 |
| Common Voice 17 sv-SE test | 2,83 | 2,92 |
| Common Voice 17 cs test | 2,80 | 2,95 |
| VoxPopuli cs test | 2,79 | 2,89 |
| Common Voice 17 ja test | 2,78 | 2,87 |
| Common Voice 17 ar test | 2,67 | 2,79 |
| FLEURS ru_ru test | 2,66 | 2,75 |
| Common Voice 17 hu test | 2,60 | 2,73 |
| Common Voice 17 fa test | 2,58 | 2,61 |
| FLEURS pl_pl test | 2,58 | 2,66 |
| VoxPopuli hu test | 2,57 | 2,70 |
| Common Voice 17 fi test | 2,56 | 2,65 |
| FLEURS fa_ir test | 2,53 | 2,61 |
| Common Voice 17 ro test | 2,46 | 2,59 |
| FLEURS sv_se test | 2,45 | 2,48 |
| FLEURS tr_tr test | 2,42 | 2,54 |
| FLEURS cs_cz test | 2,41 | 2,49 |
| FLEURS ja_jp test | 2,39 | 2,51 |
| VoxPopuli fi test | 2,35 | 2,42 |
| FLEURS ar_eg test | 2,32 | 2,40 |
| VoxPopuli ro test | 2,32 | 2,42 |
| FLEURS ro_ro test | 2,31 | 2,39 |
| FLEURS fi_fi test | 2,25 | 2,33 |
| FLEURS hu_hu test | 2,19 | 2,26 |
| FLEURS yue_hant_hk test | 2,11 | 2,16 |
| Common Voice 17 yue test | 2,11 | 2,12 |
| Common Voice 17 zh-HK test | 2,02 | 2,06 |
| Common Voice 17 id test | 1,99 | 2,06 |
| FLEURS id_id test | 1,95 | 1,97 |
| Common Voice 17 da test | 1,82 | 1,83 |
| Common Voice 17 mk test | 1,81 | 1,84 |
| FLEURS mk_mk test | 1,73 | 1,76 |
| FLEURS ms_my test | 1,72 | 1,78 |
| Common Voice 17 el test | 1,66 | 1,68 |
| Common Voice 17 hi test | 1,65 | 1,77 |
| FLEURS hi_in test | 1,61 | 1,66 |
| FLEURS da_dk test | 1,60 | 1,62 |
| FLEURS fil_ph test | 1,54 | 1,57 |
| FLEURS el_gr test | 1,48 | 1,49 |
| Common Voice 17 vi test | 1,42 | 1,43 |
| FLEURS vi_vn test | 1,40 | 1,42 |
| FLEURS ko_kr test | 1,19 | 1,20 |
| Common Voice 17 ko test | 1,17 | 1,18 |

Protocolo: 64 clips held-out por conjunto (≤ 30 s; AMI long-form con 24 ventanas de 31-300 s), un ancla en cada posición de respuesta, misma regla de aceptación greedy que la verificación DFlash en vLLM. Los conjuntos de evaluación no se usaron en entrenamiento (se eliminaron hablantes y reuniones, también entre idiomas).

## Requisitos de hardware

- VRAM del draft: 545 MB en BF16, marginal frente a los requisitos del modelo objetivo Qwen3-ASR-1.7B; el cuello de botella real es el modelo objetivo.
- GPU recomendadas: no hay requisitos publicados para el draft; el despliegue documentado apunta a vLLM (GPU) y vllm-neuron (AWS Trainium2). No se especifican modelos concretos como A100, H100 o RTX 4090.
- GPU de consumo: el borrador por sí solo cabe en cualquier GPU de consumo, pero la pareja draft+objetivo requiere evaluar el modelo Qwen3-ASR-1.7B completo; no se publican cifras al respecto.
- Opciones de despliegue: vLLM (`qwen3_dflash.py`), vllm-neuron (drafter DFlash) y el código de referencia `z-lab/dflash`. No se documenta soporte de llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no se publican cifras absolutas; el indicador disponible es la aceptación (tau), que reduce el número de forwards del modelo objetivo por token generado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jburtoft/Qwen3-ASR-1.7B-DFlash | 272,7 M (draft) | no disponible | Draft de decodificacion especulativa para Qwen3-ASR-1.7B | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-ASR-1.7B | 1,7 B | no disponible | ASR multilingue (52 idiomas y dialectos) | no disponible | Hugging Face, GitHub |
| Qwen/Qwen3-ASR-0.6B | 0,6 B | no disponible | ASR multilingue (52 idiomas y dialectos) | no disponible | Hugging Face, GitHub |

No se dispone de datos publicados de otros drafts DFlash para Qwen3-ASR ni de comparaciones de aceptación con alternativas; la model card solo compara el checkpoint publicado con su propio stage 1.

## Limitaciones y advertencias

- No es un modelo ASR independiente: requiere Qwen3-ASR-1.7B como verificador y no produce transcripciones por sí solo.
- Dependencia estricta del formato: token de máscara 151705, capas objetivo [1, 7, 13, 19, 25], RoPE theta 1e6 y reutilización de embeddings/LM head del objetivo; cualquier cambio en el modelo base o en la configuración del servidor puede invalidar la aceptación.
- Aceptación muy desigual por idioma: alta en inglés (6,89 de media) y en idiomas con decenas de horas de entrenamiento (es, fr, de, it, nl, zh-CN, th, en torno a 2,9-4,7), pero baja en idiomas presentes solo en evaluación (ko, vi, etc., por debajo de 2), lo que reduce la ganancia de velocidad en esos casos.
- El checkpoint stage 1 tenía un rendimiento muy pobre en formato largo (tau 1,17 en AMI long-form); el checkpoint publicado corrige esto (4,23), pero conviene validar con audio propio antes de producción.
- No se publican métricas de calidad de transcripción (WER) ni de latencia absoluta: la aceptación no garantiza por sí sola una mejora de throughput en todos los despliegues.
- No se documentan sesgos específicos del draft; al heredar el comportamiento del modelo objetivo, los sesgos de Qwen3-ASR se mantienen.
- Sin datos de cuantización más allá de BF16; no se ha validado el comportamiento en FP8, INT8 o GGUF.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-ASR-1.7B debe verificarse por separado (su licencia no figura en la información disponible).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jburtoft/Qwen3-ASR-1.7B-DFlash
- Modelo base Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Codigo de entrenamiento: https://github.com/jimburtoft/qwen3-asr-dflash
- Paper DFlash: https://arxiv.org/abs/2602.06036
- Codigo de referencia DFlash: `z-lab/dflash` (referenciado en la model card, sin URL completa disponible)
