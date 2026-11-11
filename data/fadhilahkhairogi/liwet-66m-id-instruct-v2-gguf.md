# fadhilahkhairogi/Liwet-66M-id-instruct-v2-GGUF

## Resumen

Liwet-66M-id-instruct-v2-GGUF es la conversión al formato GGUF del modelo Liwet-66M-id-instruct-v2, un transformer denso de 66,7 millones de parámetros entrenado específicamente para instrucciones en indonesio. Lo desarrolla el Grupo 11 (Kelompok 11) de la asignatura Tugas Besar Generative AI de la Universidad Telkom, formado por Fadhilah Akbar Khairogi, Faishal Fakhrillah y Deril Diaz. El modelo base es un MiniTransformer con etapa SFT Instruct (v2) y una ventana de contexto de 1024 tokens.

El problema que aborda es el de disponer de un modelo instructivo ultraligero en indonesio que pueda ejecutarse en hardware muy modesto, incluso en CPU, con un tamaño de repositorio de 0,3 GB y pesos cuantizados de 68,7 MiB en Q8_0. La conversión se realizó con un fork de llama.cpp (rama `liwet-moe`, commit `cae551692`, build 11315) mediante `convert_hf_to_gguf.py` y `llama-quantize`.

Es relevante ahora por su perfil de despliegue: encaja en entornos con recursos limitados, ofrece endpoint compatible con OpenAI vía `llama-server` y permite inferencia en CPU a velocidades prácticas (295,6 tok/s en decodificación con Q8_0 y 8 hilos). No obstante, su ámbito es acotado: un único idioma, contexto corto y sin benchmarks públicos de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `mini_66m` (MiniTransformer denso) |
| Parametros totales | 66.728.448 (66,7M) |
| Parametros activos | 66,7M (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | BF16, F16, Q8_0 |
| Idiomas soportados | Indonesio (`id`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16, F16, Q8_0); tokenizer.json incluido |

## Arquitectura y entrenamiento

El modelo es un transformer denso de tipo `mini_66m` con 66,7 millones de parámetros totales, todos activos en cada paso de inferencia. La etapa indicada es SFT Instruct (v2), es decir, un ajuste supervisado sobre instrucciones tras el preentrenamiento; la model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifica la innovación arquitectónica interna más allá de la etiqueta `mini_66m`.

La conversión a GGUF se realizó con el script `convert_hf_to_gguf.py` en tipos bf16 y f16, seguida de `llama-quantize` a Q8_0, usando el fork `ggml-org/llama.cpp` en la rama `liwet-moe`. El prompt se define en modo `instruct_plain`: la instrucción se separa con `\n\n`, sin tokens de rol y sin BOS. El tokenizer GGUF fija `add_bos_token = false` y `add_eos_token = false`, y no incluye `chat_template`, por lo que la plantilla de prompt debe construirla el llamador. Los identificadores especiales son `<pad>`=0, `<bos>`=1 y `<eos>`=2; el tokenizer de 66M carece de `<bos>` y define `<|unk|>`=0, `<|pad|>`=1, `<|endoftext|>`=2, `<|user|>`=32000, `<|assistant|>`=32001 y `<|end|>`=32002.

## Capacidades

- Generación de texto en indonesio con formato de instrucción simple (modo `instruct_plain`).
- Instrucciones de un solo turno separadas por `\n\n`, sin tokens de rol ni BOS.
- Inferencia en CPU y GPU mediante llama.cpp (`llama-cli`, `llama-server`, `llama-cpp-python`).
- Servidor compatible con la API de OpenAI a través de `llama-server`.
- Integración con Ollama mediante el `Modelfile` incluido en `scripts/ollama/Modelfile-Liwet-66M-id-instruct-v2`.
- Paridad numérica alta entre cuantizaciones: Q8_0 alcanza un cosine mínimo de 0,999897 y un top-1 del 100,00 % frente a la referencia bf16 CUDA.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Asistente conversacional ligero en indonesio para aplicaciones móviles o de escritorio: el modelo cabe en 68,7 MiB en Q8_0 y puede ejecutarse en CPU a 295,6 tok/s con 8 hilos, lo que permite respuestas interactivas sin GPU.
- Prototipado rápido de pipelines de instrucciones en indonesio: con `llama-server` se expone un endpoint compatible con OpenAI en `127.0.0.1:8080` y se integra en clientes existentes sin adaptadores adicionales.
- Pruebas de extremo a extremo de sistemas RAG o de plantillas de prompt: su contexto de 1024 tokens sirve para validar la lógica de recuperación y formateo antes de migrar a modelos mayores.
- Despliegue en dispositivos de borde o entornos con restricciones de memoria: el GGUF Q8_0 de 68,7 MiB y el BF16 de 128,4 MiB permiten ejecución en contenedores pequeños o hardware embebido con llama.cpp.
- Evaluación comparativa de cuantizaciones: el repositorio incluye métricas de paridad (cosine, divergencia greedy, TVD de sampling) útiles para estudiar el impacto de Q8_0 frente a BF16 y F16 en modelos pequeños.
- Generación de texto de bajo coste en lotes: con prefill de 44.248 tok/s en Q8_0 sobre GPU (bajo límite de Intel DTT), es adecuado para tareas de etiquetado o generación masiva de respuestas cortas en indonesio.
- Base para experimentos académicos de ajuste fino: al ser un modelo de 66,7M con tokenizer propio y licencia no especificada, sirve como banco de pruebas en cursos y trabajos de investigación sobre SFT.

## Benchmarks y rendimiento

Rendimiento de inferencia publicado en la model card (GPU: `llama-bench -ngl 99 -p 512 -n 128 -r 5`; CPU: `-ngl 0 -t 8 -p 0 -n 32`):

| Quant | Prefill 512 GPU (tok/s) | Decode 128 GPU (tok/s) | Decode 32 CPU (tok/s) |
|---|---|---|---|
| BF16 | 40.649 ± 6.680 | 608,52 ± 31,36 | 50,1 ± 19,1 |
| F16 | 46.824 ± 8.809 | 623,66 ± 53,25 | no disponible |
| Q8_0 | 44.248 ± 7.102 | 793,30 ± 41,03 | 295,6 ± 50,2 |

Paridad de calidad frente a la referencia bf16 CUDA (35 prompts de prefill, 6 prompts greedy de 128 pasos, 5 prompts de sampling):

| Quant | P1 min / mean cosine | P1 top-1 | P2 mediana divergencia (norep / defrep) | P4 max TVD |
|---|---|---|---|---|
| BF16 | 0,999949 / 0,999987 | 100,00 % | 128 / 73,5 | 0,000 |
| F16 | 0,999967 / 0,999989 | 100,00 % | 128 / 105,5 | 0,000 |
| Q8_0 | 0,999897 / 0,999941 | 100,00 % | 128 / 73,5 | 0,000 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los valores GPU son un límite inferior medido con Intel DTT activo (clock SM observado de ~0,8 GHz frente a un límite de 3,1 GHz).

## Requisitos de hardware

- VRAM estimada para inferencia: el Q8_0 ocupa 68,7 MiB y el BF16/F16 128,4 MiB en pesos; el consumo total es mínimo y dominado por el contexto de 1024 tokens.
- GPU recomendadas: cualquier GPU compatible con llama.cpp; los datos publicados no especifican el modelo de GPU empleado. Funciona en A100, H100, RTX 4090 y GPUs de gama baja por su reducido tamaño.
- Cabe en cualquier GPU de consumo e incluso en CPU: la decodificación en CPU con Q8_0 alcanza 295,6 tok/s con 8 hilos.
- Opciones de despliegue: `llama-cli`, `llama-server` (API compatible con OpenAI), `llama-cpp-python`, Ollama mediante el Modelfile incluido. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: prefill de 44.248 tok/s y decodificación de 793,30 tok/s en Q8_0 sobre GPU; 295,6 tok/s de decodificación en CPU con Q8_0 y 8 hilos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad ni de información sobre modelos comparables en la documentación proporcionada. A continuación se comparan únicamente las especificaciones conocidas del propio modelo:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Liwet-66M-id-instruct-v2-GGUF | 66,7M | 1024 | Indonesio | no disponible | GGUF |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Contexto muy corto (1024 tokens), insuficiente para conversaciones multi-turno largas o documentos extensos.
- Modelo monolingüe en indonesio; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia no disponible: no puede confirmarse el uso comercial ni las restricciones de redistribución.
- Sin `chat_template` en el GGUF y con `add_bos_token`/`add_eos_token` desactivados: el llamador debe construir el prompt en formato `instruct_plain` (`{instruccion}\n\n`).
- El tokenizer de 66M no aplica normalización NFC, una limitación conocida del modelo.
- En Ollama, el orden de los samplers no es configurable con precisión (top-p se calcula antes de temperature), por lo que la salida por sampling no es idéntica a la de otras aplicaciones; solo el modo greedy (`temperature=0`) coincide de forma verificada (8/8 en variantes densas).
- La model card advierte de que algunas métricas de paridad quedan por debajo del umbral de `compare.py`, con el detalle en la tabla de resultados.
- Riesgo de alucinación y de respuestas incoherentes inherente a un modelo de 66,7M parámetros; no se han publicado evaluaciones de sesgo ni de robustez.
- Sin soporte documentado de tool calling, agentes, visión o audio, lo que limita su uso en pipelines complejos de producción.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/fadhilahkhairogi/Liwet-66M-id-instruct-v2-GGUF
- Modelo base: https://huggingface.co/fadhilahkhairogi/Liwet-66M-id-instruct-v2
- Repositorio llama.cpp (fork utilizado, rama `liwet-moe`, commit `cae551692`): https://github.com/ggml-org/llama.cpp
- Metodología de benchmarks de paridad: `docs/bench/RESULTS.md` (referenciado en la model card, no enlazado)
