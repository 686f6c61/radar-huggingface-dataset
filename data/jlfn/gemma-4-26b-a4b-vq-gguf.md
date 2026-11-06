# Jlfn/gemma-4-26b-a4b-vq-gguf

## Resumen

Gemma 4 26B A4B VQ GGUF es una cuantización vectorial (vector quantization, VQ) del modelo `google/gemma-4-26B-A4B-it` de Google DeepMind, publicada por el usuario Jlfn. El objetivo es empaquetar un modelo Mixture-of-Experts de 25.200 millones de parámetros totales y 3.800 millones activos, con 262.144 tokens de contexto, en un fichero GGUF de 9,95 GiB que quepa en una GPU de consumo de 12 GiB.

La innovación principal es el esquema de compresión aplicado a los expertos enrutados: cuantización vectorial de 8 dimensiones con un índice principal de 13 bits (K=8192) sobre codebooks E4M3 y un residual GVR8 de 8 bits, mientras el resto de pesos (atención, FFN densa, cabeza de salida) se mantiene en Q4_K o Q8_0 y el router, las normas y los escalares de capa en BF16. El resultado es una release de 9,95 GiB dividida en tres partes: tronco de 8,00 GiB residente, tabla de tokens de 1,38 GiB leída por filas desde SSD y un drafter opcional de 0,58 GiB.

Es relevante porque demuestra que un modelo MoE de 26B con contexto de 262k puede servirse en una RTX 4070 SUPER, algo inédito para esta clase de modelo. Ahora bien, se trata de una primera build experimental (receta R13+8) sin benchmarks publicados, con solo 2.048 tokens de contexto cualificados y sin torre de visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (30 capas MoE, 128 expertos por capa, 8 activos; 25 capas de atención sliding-window-1024 y 5 capas de atención completa) |
| Parámetros totales | 25.200 millones (modelo base); el repo GGUF declara 738.197.504 parámetros safetensors |
| Parámetros activos | 3.800 millones |
| Longitud de contexto | 262.144 tokens (solo 2.048 cualificados en la release) |
| Tipos de cuantización | VQ 13 bits (K=8192, 12-bit stream + 1-bit plane) + residual GVR8 8 bits en expertos; Q4_K y Q8_0 en atención/FFN densa/cabeza; BF16 en router, normas, escalares y embeddings |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (tres partes: tronco 8,00 GiB, embeddings 1,38 GiB, drafter 0,58 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer Mixture-of-Experts con 30 capas MoE, cada una con 128 expertos y 8 activos por token, sobre un esqueleto denso de atención con 25 capas de ventana deslizante de 1.024 tokens y 5 capas de atención completa, sin RoPE scaling. La release cuantizada no reentrena el modelo: aplica un esquema de compresión post-hoc sobre el checkpoint BF16 `google/gemma-4-26B-A4B-it` (commit `4d7ae4984b7db7de8f8457170b3f1a419ee76d52`).

La receta VQ (`gemma-4-26b-a4b-family-r8`) convierte cada 8 pesos consecutivos de una fila de experto en un índice a un codebook E4M3, multiplicado por una ganancia F16 por fila. Cada stack de experto comparte un codebook principal de 8.192 entradas (13 bits: 12-bit stream más 1-bit plane) y un codebook residual de 256 entradas E4M3 para el plano GVR8. La reconstrucción es `W[r, 8j+d] = gain[r] * (C1[i1][d] + C2[i2][d])`, redondeada a BF16. El entrenamiento de los codebooks usa submuestreo estratificado de hasta 200.000 segmentos, inicialización uniforme y ocho iteraciones de Lloyd, con round-trip por f16 y E4M3. Los expertos representan el 90,5% de los elementos codificados, de ahí que concentren el presupuesto de compresión.

El drafter proviene de `google/gemma-4-26B-A4B-it-assistant` (48 tensores, Q4_K/BF16) para decodificación especulativa, aunque la ruta de draft (`--mtp-draft`) aún no está declarada. No se documenta el entrenamiento original del modelo base (tokens, composición del dataset, RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto de hasta 262.144 tokens (cualificado a 2.048 en esta build).
- Modo thinking nativo: el token `<|think|>` (ID 98) forma parte de la gramática de chat registrada por la familia.
- Tool calling / function calling: los tokens 46–51 están reservados para herramientas en la gramática del checkpoint.
- Capacidades multilingües (etiqueta `multilingual`, aunque el único idioma listado explícitamente es `en`).
- Soporte de imágenes y vídeo en el modelo base (tokens 258880 y 258884), **no incluido** en esta release text-only.
- Decodificación especulativa mediante drafter opcional (ruta no activada en esta build).
- Gramática de chat: turnos 105/106, canales 100/101; el checkpoint no incluye `chat_template.jinja` oficial.

## Casos de uso

- Asistente conversacional de contexto largo en una sola GPU de consumo: con 262.144 tokens teóricos y 2.048 cualificados, permite mantener conversaciones multi-turno extensas o resumir documentos largos en una RTX 4070 SUPER sin infraestructura de servidor.
- Prototipado de agentes con tool calling: los tokens de herramienta 46–51 permiten integrar el modelo en flujos de llamada a funciones, aunque la estabilidad del formato debe validarse empíricamente al no existir plantilla de chat oficial.
- Razonamiento con modo thinking en local: útil para tareas de análisis paso a paso en entornos sin conexión o con requisitos de privacidad, donde no se puede enviar datos a APIs externas.
- Evaluación de técnicas de cuantización vectorial: el repo incluye `RECIPE.md` y `recipe.json`, lo que lo convierte en material de referencia para investigadores que estudien VQ sobre MoE y quieran reproducir o comparar la receta R13+8.
- Servicio de inferencia en hardware modesto: el runtime `ds4-gemma4` permite desplegar el modelo con 13,42 tok/s de decode y 374 tok/s de prefill en una RTX 4070 SUPER, adecuado para demos y entornos de desarrollo.
- Generación de código y texto técnico en inglés: el modelo base es instruction-tuned y multilingüe, aunque la release no documenta evaluaciones específicas de código.
- Investigación sobre decodificación especulativa: el drafter de 0,58 GiB incluido permite experimentar con draft models una vez se declare la ruta `--mtp-draft`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni similares) en la información disponible. Los únicos datos de fidelidad y velocidad son:

| Métrica | Valor |
|---|---|
| Fidelidad probe A (28 tokens) | cosine 0.9906, KL 0.000548, argmax 818 |
| Fidelidad probe B (1.243 tokens) | cosine 0.9901, KL 0.419508, argmax 1509 |
| Decode (RTX 4070 SUPER, ctx 256, commit `d4f6d4f9`) | 13,42 tok/s |
| Prefill (RTX 4070 SUPER, ctx 256, commit `d4f6d4f9`) | 374 tok/s |
| Checklist de serving (ctx 2.048) | 10 works, 0 FAIL, 0 WRONG, 0 undeclared |

No se ejecutó KL held-out, perplejidad ni benchmark alguno. El HEAD actual (`659a152b`) añade gate/up de expertos fusionado y KV FP8 opcional, pero no se ha re-medido.

## Requisitos de hardware

- VRAM estimada: 9,95 GiB de release total; el motor mapea 9,37 GiB para acceso de dispositivo y mantiene la parte de embeddings (1,38 GiB) en host, leída desde page cache. En ctx 2.048 sobre 12 GiB el ajuste eligió dos bancos con 4,23 GiB libres.
- GPU recomendadas: RTX 4070 SUPER (sm_89, 12 GiB) es la plataforma validada; el runtime soporta CUDA en sm_89. Para el modelo base sin cuantizar se requerirían GPUs de 80 GiB (A100/H100).
- Cabe en GPU de consumo: sí, en tarjetas de 12 GiB o más con el runtime `ds4-gemma4`.
- Opciones de despliegue: `ds4-gemma4` (fork de `JLFN/ds4-dfm-rs`, rama `feat/gemma4-family`); `ds4-server` requiere `--mem-floor-gb 2` en tarjeta de 12 GiB. El streaming desde SSD es opcional y está desactivado por defecto (la 4070 SUPER lo rechaza por acceso coherente).
- Latencia y throughput: 13,42 tok/s decode y 374 tok/s prefill medidos en ctx 256 con ocho tokens greedy, residente en dispositivo, commit `d4f6d4f9`.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 26B A4B VQ GGUF (esta release) | 25,2B | 3,8B | 262.144 (2.048 cualificados) | apache-2.0 | GGUF, 9,95 GiB, runtime ds4-gemma4 |
| google/gemma-4-26B-A4B-it (base) | 25,2B | 3,8B | 262.144 | licencia Gemma 4 | BF16, requiere ~50 GiB |
| google/gemma-4-26B-A4B-it-assistant | no disponible | no disponible | no disponible | no disponible | drafter, 0,58 GiB en esta release |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Build experimental: es la primera publicación de la receta R13+8 y la línea de conversión sigue en investigación; cualquier fichero puede ser reemplazado por una nueva revisión. Para fijar una build hay que descargar un commit concreto (`--revision <commit>`).
- Solo 2.048 tokens de contexto cualificados frente a los 262.144 teóricos del modelo; el resto no está validado.
- Sin benchmarks: no hay KL held-out, perplejidad ni resultados de MMLU, HumanEval o GSM8K, por lo que el impacto de la cuantización VQ en calidad no está medido.
- Fidelidad limitada: el probe B (1.243 tokens) presenta KL 0.419508, muy superior al probe A, lo que sugiere degradación en secuencias largas.
- Release text-only: la torre de visión no está incluida, pese a que el modelo base soporta imagen y vídeo.
- Sin plantilla de chat oficial (`chat_template.jinja`); el formato debe reconstruirse a partir de la gramática de tokens documentada.
- Ruta de decodificación especulativa (`--mtp-draft`) no declarada todavía; el drafter incluido no es utilizable de forma directa.
- Licencia: el repo declara apache-2.0 pero enlaza a la licencia de Gemma 4 de Google; conviene verificar los términos aplicables al uso comercial del modelo base.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero presentes en cualquier modelo de lenguaje instruction-tuned.
- Dependencia de un runtime no estándar (`ds4-gemma4`, fork personal) en lugar de vLLM, llama.cpp u Ollama; esto limita la portabilidad y el soporte.
- Rendimiento medido en un único hardware (RTX 4070 SUPER) y con el HEAD actual sin re-medir.

## Enlaces

- Hugging Face: https://huggingface.co/Jlfn/gemma-4-26b-a4b-vq-gguf
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Drafter: https://huggingface.co/google/gemma-4-26B-A4B-it-assistant
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Runtime: fork `ds4-gemma4` de `JLFN/ds4-dfm-rs`, rama `feat/gemma4-family`
- Receta: `RECIPE.md` y `recipe.json` en el repositorio del modelo
