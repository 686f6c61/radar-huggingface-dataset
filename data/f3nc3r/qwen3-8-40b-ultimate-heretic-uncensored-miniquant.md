# f3nc3r/Qwen3.8-40B-Ultimate-Heretic-Uncensored-miniQuant

## Resumen

Qwen3.8-40B-Ultimate-Heretic-Uncensored-miniQuant es una cuantización GGUF de muy baja precisión (sub-2.0 bits por peso) del modelo DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored, un fine-tune sin censura de la familia Qwen3.8 con aproximadamente 39.072 millones de parámetros. La publica el usuario f3nc3r aplicando el pipeline "miniQuant Recipe B" sobre el motor fencerJP/llama.cpp-miniQuant, una bifurcación de llama.cpp orientada a cuantizaciones extremas.

El interés técnico del artefacto está en que comprime un modelo de ~40B en un único fichero de 8,36 GiB con 1,835 bpw efectivos, lo que permite ejecutarlo en hardware muy modesto (el autor lo prueba en CPU con un Ryzen AI 9 HX 470 y en una Tesla V100 de 16 GiB). Para lograrlo combina cuantización con reconocimiento de cuantización (QAT/QAD), rotaciones Hadamard conmutativas y una asignación no uniforme de bits por tipo de tensor.

No hay información sobre el pipeline, los benchmarks estándar ni la composición del dataset de entrenamiento del modelo original. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card se centra casi exclusivamente en el proceso de cuantización, no en las capacidades del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer + SSM con Gated DeltaNet (inferida de los tensores citados: `ssm_in`, `ssm_out`, `conv1d`, `dt`, `alpha`, `beta`, `attn_qkv`, `attn_output`, `ffn_up`, `ffn_gate`, `ffn_down`) |
| Parametros totales | 39.072.596.736 (~39,07B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF sub-2.0 bpw (Recipe B): `IQ1_S` (~1,56 bpw) en bulk trunk, `IQ2_XXS` (~2,06 bpw) en `ffn_down`, `IQ3_XXS` (~3,06 bpw) en salidas de atención/SSM, `IQ2_K` en embeddings y `output.weight`; 1,835 bpw efectivos |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero único `DavidAU-Qwen3.8-40B-Ultimate-Sub2Bpw-Direct.gguf`, 8,36 GiB / 8.559,88 MB) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de la familia Qwen3.8 con unos 39B parámetros. Los nombres de tensores que menciona la model card (`ssm_in`, `ssm_out`, `conv1d`, `dt`, `alpha`, `beta` junto a `attn_qkv`, `attn_output`, `ffn_up`, `ffn_gate`, `ffn_down`) apuntan a una arquitectura híbrida que combina atención con capas de espacio de estados (SSM) tipo Gated DeltaNet. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el fine-tune original usó RLHF, DPO u otras técnicas de alineación.

El proceso de cuantización sí está documentado con detalle. Parte de checkpoints en BF16 obtenidos mediante Quantization-Aware Training / Distillation (FraQAT con destilación KL puenteada HESTIA). Aplica después rotaciones Hadamard conmutativas de 256 dimensiones emparejadas exclusivamente a las proyecciones de contracción (`ffn_down`, `ssm_out`, `attn_output`), preservando las proyecciones recurrentes de Gated DeltaNet y los embeddings en su base coordenada natural. La asignación de bits es no uniforme: el tronco principal va en `IQ1_S`, las proyecciones `ffn_down` en `IQ2_XXS`, las salidas de atención/SSM y `attn_v` en `IQ3_XXS`, y los anclajes de frontera (`token_embd.weight`, `output.weight`) en `IQ2_K`. Finalmente refina las escalas de bloque mediante destilación LMS en forma cerrada contra los pesos BF16 del profesor.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat ChatML (`<|im_start|>` / `<|im_end|>`).
- Razonamiento aritmético y generación de código Python, según afirma el autor ("accurate arithmetic & Python") en el checkpoint sub-2 bpw.
- Fine-tune sin censura ("Heretic Uncensored"): el modelo base está orientado a reducir los rechazos y filtros de contenido del modelo original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Inferencia en CPU de un modelo de ~40B: con 8,36 GiB de fichero y 10,52 GiB de RSS, se puede ejecutar en un equipo de escritorio con 16 GB de RAM sin GPU, a costa de 3,6–6,9 tok/s de decodificación. Útil para prototipado local y pruebas de concepto.
- Despliegue en GPU de gama media o profesional antigua: el autor lo ejecuta en una Tesla V100-SXM2 de 16 GiB, de modo que encaja en tarjetas con 16 GB de VRAM donde un 40B en BF16 sería inviable.
- Experimentación con cuantización extrema: sirve como referencia para investigar la pérdida de calidad a 1,835 bpw y comparar recetas (QAT/QAD, rotaciones Hadamard, asignación no uniforme de bits) frente a cuantizaciones convencionales Q4_K_M o Q8_0.
- Generación de código y cálculo en entornos aislados: el autor reporta aritmética y Python precisos, por lo que puede usarse para tareas de scripting sencillas en máquinas sin acelerador dedicado.
- Evaluación de modelos sin censura: para investigadores que estudian el comportamiento de modelos "uncensored" y su degradación bajo cuantización agresiva.
- Integración en pipelines llama.cpp: al ser un GGUF estándar compatible con `llama-cli` y el ecosistema llama.cpp, se puede incorporar en herramientas de línea de comandos, servidores locales o aplicaciones de escritorio basadas en `llama.cpp`.

## Benchmarks y rendimiento

La model card solo publica métricas de velocidad de inferencia en CPU, no resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Valor |
|---|---|
| Tamano del fichero | 8,36 GiB (8.559,88 MB) |
| BPW efectivos | 1,835 |
| Prefill (CPU) | 24,8 – 31,6 tok/s |
| Decodificacion (CPU) | 3,6 – 6,9 tok/s |
| RSS en inferencia | 10,52 GiB |
| Calidad | "strictly < 2.0 bpw, accurate arithmetic & Python" (cualitativo, sin cifras) |

Hardware de referencia: AMD Ryzen AI 9 HX 470 con Radeon 890M (12 núcleos / 24 hilos, AVX-512 / AVX-VNNI / AVX-512 BF16), 121 GiB DDR5 y NVIDIA Tesla V100-SXM2-16GB.

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~9–11 GiB para el fichero GGUF de 8,36 GiB más overhead de contexto y caché KV; el autor reporta 10,52 GiB de RSS en CPU.
- GPU recomendadas: Tesla V100-SXM2-16GB (probada por el autor), RTX 4080/4090 (16–24 GB), A100 40/80 GB, H100. Cualquier GPU con ≥12 GB de VRAM debería poder cargarlo.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB) y potencialmente en RTX 4060 Ti de 16 GB. En tarjetas de 12 GB el margen es ajustado.
- Despliegue: `llama.cpp-miniQuant` (bifurcación del autor), y en principio cualquier build de llama.cpp compatible con los tipos `IQ1_S`, `IQ2_XXS`, `IQ2_K` e `IQ3_XXS`. No se confirma soporte en vLLM, TGI u Ollama.
- Latencia y throughput: 24,8–31,6 tok/s de prefill y 3,6–6,9 tok/s de decodificación en CPU (Ryzen AI 9 HX 470). No hay datos de rendimiento en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| f3nc3r/Qwen3.8-40B-Ultimate-Heretic-Uncensored-miniQuant | ~39,07B | no disponible | GGUF, 8,36 GiB, 1,835 bpw | apache-2.0 | Cuantización sub-2 bpw del fine-tune de DavidAU |
| DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored | ~39,07B | no disponible | BF16 (modelo base) | no disponible | Modelo original sin cuantizar; requiere ~78 GB en BF16 |
| Cuantizaciones GGUF convencionales del mismo base (Q4_K_M, Q8_0) | ~39,07B | no disponible | GGUF, ~24 GB (Q4_K_M) / ~41 GB (Q8_0) | apache-2.0 (heredada) | Mayor calidad esperada, pero no caben en GPU de 16 GB |

No se dispone de datos de benchmarks que permitan comparar la calidad de esta cuantización frente a alternativas de mayor precisión.

## Limitaciones y advertencias

- La cuantización a 1,835 bpw implica una degradación de calidad no cuantificada; el autor solo aporta una afirmación cualitativa sobre aritmética y Python.
- El modelo base es un fine-tune "Heretic Uncensored": está diseñado explícitamente para reducir rechazos, lo que aumenta el riesgo de generar contenido dañino, sesgado o inexacto sin advertencia.
- Riesgo de alucinación elevado, agravado por la cuantización extrema y por la ausencia de benchmarks de fidelidad.
- Idiomas: solo inglés declarado; no hay soporte verificado de castellano ni de otros idiomas.
- Licencia apache-2.0 declarada, pero el modelo base es un fine-tune de un modelo de terceros; conviene verificar la licencia original de Qwen3.8 y las condiciones del fine-tune de DavidAU antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (13 de noviembre de 2026): no hay validación comunitaria ni historial de uso.
- Requiere una bifurcación específica de llama.cpp (`fencerJP/llama.cpp-miniQuant`) o una build con soporte para los tipos de cuantización IQ empleados; la compatibilidad con otras herramientas no está garantizada.
- No se dispone de información sobre la longitud de contexto efectiva, el dataset de entrenamiento ni las técnicas de alineación del modelo base.
- El rendimiento en GPU no está documentado; las cifras de velocidad publicadas corresponden únicamente a CPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/f3nc3r/Qwen3.8-40B-Ultimate-Heretic-Uncensored-miniQuant
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored
- Motor de cuantización e inferencia: https://github.com/fencerJP/llama.cpp-miniQuant
