# fadhilahkhairogi/Liwet-66M-id-base-v2-GGUF

## Resumen

Liwet-66M-id-base-v2-GGUF es la conversión a formato GGUF del modelo Liwet-66M-id-base-v2, un transformer denso de 66,7 millones de parámetros desarrollado por Fadhilah Akbar Khairogi, Faishal Fakhrillah y Deril Diaz (Grupo 11 de la asignatura Generative AI, Universidad de Telkom). El modelo está especializado en texto en indonesio y se encuentra en fase de preentrenamiento base (v2), sin ajuste por instrucciones ni alineación por preferencias.

La relevancia de esta publicación es fundamentalmente práctica: ofrece los pesos en BF16, F16 y Q8_0 listos para `llama.cpp`, con verificación de paridad numérica frente a la implementación original en PyTorch (coseno de logits mínimo de 0,999949 en Q8_0 y coincidencia top-1 del 100 % en las 35 prompts de prefill evaluadas). Incluye además el `tokenizer.json` original y un Modelfile para Ollama.

Se trata de un modelo de escala muy reducida (66,7 M de parámetros, contexto de 1024 tokens) pensado para experimentación académica, prototipado ligero y despliegue en hardware muy modesto, no para tareas de producción que requieran razonamiento complejo o conversación multi-turno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `mini_66m` (MiniTransformer denso) |
| Parametros totales | 66.728.448 (66,7 M) |
| Parametros activos | 66,7 M (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | BF16, F16, Q8_0 |
| Idiomas soportados | Indonesio (id) |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16, F16, Q8_0); safetensors en el repo base |
| Etapa de entrenamiento | Pretrain Base (v2) |
| Modo de prompt | `raw` (sin plantilla de chat, sin BOS) |
| Tamano del repo | 0,3 GB |
| Tokenizer | Sin `<bos>`; `<|unk|>`=0, `<|pad|>`=1, `<|endoftext|>`=2, `<|user|>`=32000, `<|assistant|>`=32001, `<|end|>`=32002 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer densa denominada `mini_66m` (MiniTransformer), con 66,7 M de parámetros totales y una ventana de contexto de 1024 tokens. La model card no detalla el número de capas, dimensiones ocultas, número de cabezas de atención ni la composición del dataset de preentrenamiento. Tampoco se documenta el volumen de tokens de entrenamiento ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones; la etapa declarada es únicamente «Pretrain Base (v2)», lo que implica un modelo de completado de texto sin alineación conversacional.

La innovación técnica destacable de esta publicación no está en el modelo en sí, sino en el proceso de conversión y validación: se usó un fork de `ggml-org/llama.cpp` (commit `cae551692`, rama `liwet-moe`, build 11315) con `convert_hf_to_gguf.py --outtype bf16|f16` y posterior `llama-quantize` a Q8_0. La paridad se verificó contra logits de referencia en bf16 CUDA de la implementación PyTorch original mediante 35 prompts de prefill, 6 prompts greedy de 128 pasos y 5 prompts de sampling, con métricas de coseno de logits, divergencia greedy, coincidencia del router MoE y distancia de variación total en sampling. El tokenizer de 66 M no aplica normalización NFC, limitación reconocida por los autores.

## Capacidades

- Generación de texto en indonesio mediante completado de texto en modo `raw`, sin plantilla de chat.
- Completado de secuencias cortas: la ventana de contexto es de 1024 tokens.
- Tokenizer con tokens especiales de rol (`<|user|>`, `<|assistant|>`, `<|end|>`), aunque el modelo no ha sido ajustado para seguimiento de instrucciones.
- Compatibilidad con la API OpenAI de `llama-server` y con `llama-cpp-python`.
- Despliegue en CPU y GPU mediante `llama.cpp`; soporte de Ollama a través del Modelfile incluido.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al indonesio; no se documenta soporte de otros idiomas.

## Casos de uso

- Experimentación académica y docencia: el tamaño de 66,7 M permite entrenar, convertir y evaluar el modelo completo en una sola GPU de consumo o incluso en CPU, lo que lo hace adecuado para prácticas de cuantización y validación de paridad numérica en cursos de IA generativa.
- Pruebas de integración de `llama.cpp`: sirve como modelo de referencia minúsculo para validar pipelines de conversión HF→GGUF, `llama-quantize`, `llama-server` y clientes compatibles con la API OpenAI antes de desplegar modelos mayores.
- Generación de texto corto en indonesio: completado de frases, titulares o párrafos breves en aplicaciones de demostración donde la latencia importa más que la calidad lingüística.
- Prototipado de aplicaciones de chat con Ollama: el Modelfile incluido permite crear un modelo local con plantilla de chat para probar interfaces conversacionales, aceptando que la coherencia multi-turno será limitada por la falta de ajuste por instrucciones.
- Benchmarking de hardware: los datos de `llama-bench` publicados (hasta 42.599 tok/s de prefill y 775,96 tok/s de decodificación en Q8_0 con GPU) permiten usar el modelo como carga de trabajo ligera para medir rendimiento de CPU, GPU y aceleradores.
- Evaluación de tokenizers: al incluirse `tokenizer.json` y documentarse los identificadores especiales, resulta útil para comparar comportamientos de tokenización y normalización Unicode (incluida la ausencia de NFC) en pipelines de NLP en indonesio.
- Filtrado y clasificación de texto muy ligera: al ser un modelo base, puede servir como extractor de representaciones o para puntuar perplejidad de textos en indonesio en tareas de control de calidad de corpus.

## Benchmarks y rendimiento

Los únicos datos publicados son de rendimiento de inferencia (`llama-bench -ngl 99 -p 512 -n 128 -r 5` en GPU y `-ngl 0 -t 8 -p 0 -n 32` en CPU), no de calidad en tareas estándar (MMLU, HumanEval, GSM8K). Los valores de GPU se presentan como cota inferior porque Intel DTT estaba activo y la frecuencia observada del SM era de ~0,8 GHz frente a un límite de 3,1 GHz.

| Quant | Prefill 512 (tok/s, GPU) | Decode 128 (tok/s, GPU) | Decode 32 (tok/s, CPU, 8 hilos) |
|---|---|---|---|
| BF16 | 40.774 ± 7.093 | 617,54 ± 45,51 | 51,3 ± 7,9 |
| F16 | 38.909 ± 8.248 | 610,34 ± 70,77 | no disponible |
| Q8_0 | 42.599 ± 7.824 | 775,96 ± 71,35 | 331,3 ± 6,2 |

Paridad numérica frente a la referencia bf16 CUDA (35 prompts de prefill, 6 greedy de 128 pasos, 5 de sampling):

| Quant | Coseno logits min / media | Top-1 | Divergencia greedy mediana (norep / defrep) | Router MoE | TVD máx. en sampling |
|---|---|---|---|---|---|
| BF16 | 0,999987 / 0,999993 | 100,00 % | 128 / 128 | — | 0,000 |
| F16 | 0,999989 / 0,999994 | 100,00 % | 128 / 128 | — | 0,000 |
| Q8_0 | 0,999949 / 0,999971 | 100,00 % | 128 / 128 | — | 0,008 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa 68,7 MiB y BF16/F16 128,4 MiB, por lo que el modelo cabe holgadamente en cualquier GPU con 1 GB de VRAM o incluso en memoria unificada.
- GPU recomendadas: cualquier GPU compatible con `llama.cpp`; el modelo es viable desde iGPU hasta A100/H100, aunque el cuello de botella será el lanzamiento de kernels más que la memoria.
- GPU de consumo: sí, cabe en cualquier RTX (incluidas series 20/30/40), GTX, AMD ROCm o Apple Silicon con Metal.
- CPU: funciona enteramente en CPU; con 8 hilos y Q8_0 se midieron 331,3 tok/s de decodificación.
- Opciones de despliegue: `llama-cli`, `llama-server` (API compatible con OpenAI), `llama-cpp-python`, Ollama mediante el Modelfile incluido y cualquier runtime que consuma GGUF.
- Latencia y throughput: según los datos publicados, en GPU Q8_0 alcanza 42.599 tok/s de prefill y 775,96 tok/s de decodificación; en CPU Q8_0 con 8 hilos, 331,3 tok/s de decodificación. Los valores de GPU son cotas inferiores por la limitación de frecuencia descrita.
- Nota de despliegue: el GGUF declara `add_bos_token = false` y `add_eos_token = false`, y no incluye `chat_template`; el prompt debe construirse en el cliente. En Ollama, el orden de samplers no es configurable con exactitud (top-p antes de temperature), por lo que la salida en sampling no será idéntica a la de otras aplicaciones; el modo greedy (`temperature=0`) coincide en 8 de 8 casos para las variantes densas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Liwet-66M-id-base-v2-GGUF | 66,7 M | 1024 | Indonesio | no disponible | GGUF (BF16/F16/Q8_0) | Base preentrenado, sin chat template, paridad numérica verificada |
| Liwet-66M-id-base-v2 (original) | 66,7 M | 1024 | Indonesio | no disponible | safetensors | Referencia PyTorch del anterior |
| Alternativas de tamano similar (p. ej. modelos tipo GPT-2 small de 124 M) | ~124 M | 1024 | Inglés principalmente | variable | safetensors, GGUF | No se dispone de datos comparativos de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de calidad con modelos alternativos; la comparativa se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- Es un modelo en fase de preentrenamiento base: no sigue instrucciones, no mantiene diálogos coherentes y no debe usarse como asistente conversacional sin un ajuste posterior.
- Contexto muy limitado: 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo indonesio: no se documenta capacitación en otros idiomas; el rendimiento fuera del indonesio será deficiente.
- Riesgo elevado de alucinación y de texto incoherente por el tamaño reducido (66,7 M) y la ausencia de alineación por preferencias.
- Licencia no disponible: no puede asumirse uso comercial; es necesario contactar con los autores antes de cualquier despliegue productivo.
- Sin `chat_template` en el GGUF y con `add_bos_token`/`add_eos_token` desactivados: el cliente debe construir el prompt y gestionar los tokens especiales manualmente.
- El tokenizer no aplica normalización NFC, lo que puede producir discrepancias en textos con caracteres Unicode compuestos.
- En Ollama, el orden de samplers no es configurable con precisión; el sampling no será reproducible respecto a otras implementaciones. Solo el modo greedy está verificado.
- Los valores de rendimiento en GPU son cotas inferiores por la limitación de frecuencia (Intel DTT); no deben tomarse como máximos del hardware.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse solo con datos en indonesio, probablemente herede los sesgos del corpus, que no se describe.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/fadhilahkhairogi/Liwet-66M-id-base-v2-GGUF
- Modelo base en Hugging Face: https://huggingface.co/fadhilahkhairogi/Liwet-66M-id-base-v2
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de conversión: `cae551692` (rama `liwet-moe`, build 11315)
- Documentación de metodología de paridad: `docs/bench/RESULTS.md` (incluido en el repositorio del modelo)
- Modelfile para Ollama: `scripts/ollama/Modelfile-Liwet-66M-id-base-v2` (incluido en el repositorio del modelo)
