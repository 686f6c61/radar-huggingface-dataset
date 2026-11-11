# fadhilahkhairogi/Liwet-66M-id-base-v1-GGUF

## Resumen

Liwet-66M-id-base-v1-GGUF es la conversión al formato GGUF del modelo base Liwet-66M-id-base-v1, un transformer denso de apenas 66,7 millones de parámetros entrenado desde cero para el idioma indonesio. Lo desarrolla el autor fadhilahkhairogi junto con el Grupo 11 de la asignatura Generative AI de la Universidad de Telkom, como parte de un trabajo académico de pretraining. El modelo se encuentra en fase de pretrain base (v1), es decir, sin ajuste por instrucciones ni alineamiento posterior, y su propósito es servir como punto de partida experimental para modelos ligeros en indonesio.

La relevancia de esta ficha es acotada: no es un modelo de producción, sino una pieza didáctica y de investigación que ilustra el pipeline completo de entrenamiento, conversión a GGUF, cuantización y validación de paridad numérica. Su ventana de contexto es de solo 1024 tokens y funciona únicamente como completado de texto en modo raw, sin plantilla de chat y sin token BOS. Aun así, el repositorio incluye documentación técnica inusualmente detallada para su tamaño, con métricas de paridad entre cuantizaciones y benchmarks de rendimiento en CPU y GPU.

El modelo base original está en safetensors; este repositorio ofrece las versiones BF16, F16 y Q8_0 en GGUF, generadas con un fork de llama.cpp. El tamaño del repositorio es de 0,3 GB y el número de descargas y likes es cero en el momento de la consulta, lo que confirma su carácter incipiente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mini_66m (transformer denso, MiniTransformer) |
| Parametros totales | 66.728.448 (66,7M) |
| Parametros activos | no aplica (modelo denso; la model card indica 66,7M activos) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | BF16, F16, Q8_0 |
| Idiomas soportados | indonesio (id) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo base en safetensors); incluye tokenizer.json |
| Etapa de entrenamiento | Pretrain Base (v1), sin instrucciones |
| Modo de prompt | raw (sin plantilla de chat, sin token BOS) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso denominado internamente `mini_66m`, con 66,7 millones de parámetros totales y una ventana de contexto de 1024 tokens. La model card menciona referencias a componentes tipo router MoE en su metodología de validación (P3, exact-set router MoE), aunque el modelo se describe explícitamente como denso (66,7M activos) y la sección de Ollama lo etiqueta como "dense"; no se detalla en la información disponible si existe algún componente de mezcla de expertos en la implementación de referencia. El tokenizer es propio, con identificadores especiales `<|unk|>`=0, `<|pad|>`=1, `<|endoftext|>`=2, `<|user|>`=32000, `<|assistant|>`=32001 y `<|end|>`=32002, y no incluye token `<bos>`.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del corpus ni si se aplicaron fases de RLHF, DPO o SFT; el modelo está en fase de pretrain base. La innovación técnica documentada no está en el entrenamiento sino en el proceso de conversión y validación: la conversión a GGUF se realizó con un fork de llama.cpp (commit `cae551692`, rama `liwet-moe`, build 11315) mediante `convert_hf_to_gguf.py --outtype bf16|f16` y posterior `llama-quantize` a Q8_0, y se verificó la paridad numérica contra la implementación original en PyTorch con logits bf16 en CUDA sobre 35 prompts de prefill, 6 prompts greedy de 128 pasos y 5 prompts de sampling.

## Capacidades

- Generación de texto por completado en indonesio: el modelo produce continuación de texto raw, sin formato conversacional ni instrucciones.
- Modelo base sin alineamiento: no sigue instrucciones, no responde a preguntas de forma fiable y no tiene modo de razonamiento o "thinking".
- Sin soporte de tool calling ni function calling: no hay evidencia en la model card de capacidades de llamada a herramientas.
- Sin capacidades de agente ni razonamiento multi-paso: la ausencia de plantilla de chat y de ajuste por instrucciones lo descarta para flujos agénticos.
- Multilingüe limitado: solo se declara indonesio (`id`); no se documentan otros idiomas.
- Sin visión ni audio: es un modelo exclusivamente de texto.
- Tokenizer propio con tokens especiales de rol (`<|user|>`, `<|assistant|>`, `<|end|>`) presentes en el vocabulario, aunque el modelo no ha sido ajustado para usarlos como plantilla de chat.
- Inferencia compatible con llama.cpp, llama-server (API compatible con OpenAI), llama-cpp-python y Ollama.

## Casos de uso

- Investigación académica sobre pretraining: sirve para reproducir y estudiar el pipeline completo de entrenamiento de un transformer pequeño en indonesio, desde el corpus hasta la conversión a GGUF, con documentación de paridad numérica incluida.
- Validación de pipelines de cuantización: sus métricas P1-P4 (cosine de logits, divergencia greedy, router MoE y TVD de sampling) permiten comparar el comportamiento de BF16, F16 y Q8_0 frente a la referencia en PyTorch, útil para equipos que construyen herramientas de verificación de cuantizaciones.
- Benchmarking de hardware de bajo consumo: con 66,7M parámetros y Q8_0 de 68,7 MiB, permite medir throughput de decodificación en CPU (325,6 tok/s con 8 hilos) y en GPU, como test de referencia para comparar máquinas o configuraciones de llama.cpp.
- Completado de texto experimental en indonesio: puede emplearse en demostraciones de autocompletado o generación de texto plano en dicho idioma, siempre con expectativas de calidad propias de un modelo base de 66M parámetros.
- Base para fine-tuning posterior: al ser un checkpoint de pretrain, es un punto de partida para experimentos de SFT o instrucción en indonesio con recursos muy limitados, aunque requeriría trabajo adicional y no hay evidencia publicada de resultados tras ajuste.
- Despliegue en entornos embebidos o de recursos mínimos: el archivo Q8_0 de 68,7 MiB cabe en dispositivos con poca memoria y puede servirse con llama-server en localhost para pruebas de integración de APIs compatibles con OpenAI.
- Docencia sobre tokenizers y formatos GGUF: el repositorio incluye `tokenizer.json` y notas sobre la ausencia de BOS, los identificadores especiales y la falta de normalización NFC, lo que lo convierte en material útil para explicar estos detalles en cursos de IA generativa.

## Benchmarks y rendimiento

La model card no incluye benchmarks de calidad de lenguaje (MMLU, HumanEval, GSM8K u otros). Sí publica benchmarks de rendimiento de inferencia con `llama-bench`:

GPU (`llama-bench -ngl 99 -p 512 -n 128 -r 5`):

| Cuantizacion | Prefill 512 (tok/s) | Decode 128 (tok/s) |
|---|---|---|
| BF16 | 39.644 ± 7.348 | 642,61 ± 43,55 |
| F16 | 46.833 ± 8.433 | 626,61 ± 34,89 |
| Q8_0 | 45.707 ± 7.797 | 819,11 ± 83,38 |

CPU (`-ngl 0 -t 8 -p 0 -n 32`):

| Cuantizacion | Decode 32 (tok/s) |
|---|---|
| BF16 | 62,7 ± 18,9 |
| Q8_0 | 325,6 ± 11,6 |

El autor advierte que las cifras de GPU son un límite inferior mientras Intel DTT está activo (frecuencia de SM observada de ~0,8 GHz frente a un límite de 3,1 GHz). Las cifras de CPU usan 8 hilos.

Además, se documenta la paridad de las cuantizaciones frente a la referencia bf16 en CUDA:

| Cuantizacion | P1 min / media cosine | P1 top-1 | P2 mediana divergencia (norep / defrep) | P4 max TVD |
|---|---|---|---|---|
| BF16 | 0,999992 / 0,999995 | 100,00% | 128 / 99,5 | 0,008 |
| F16 | 0,999992 / 0,999995 | 100,00% | 128 / 99,5 | 0,002 |
| Q8_0 | 0,999958 / 0,999979 | 100,00% | 72 / 128 | 0,016 |

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. Q8_0 ocupa 68,7 MiB de pesos; BF16 y F16 ocupan 128,4 MiB cada uno. Con contexto de 1024 tokens y overhead de llama.cpp, el consumo total se mantiene en el orden de cientos de MiB.
- GPU recomendadas: cualquier GPU compatible con llama.cpp, incluidas RTX 4090, A100 o H100; el modelo es demasiado pequeño para aprovechar hardware de gama alta, y los benchmarks del autor se ejecutaron con `-ngl 99` sobre una GPU no especificada.
- Cabe en cualquier GPU de consumo: incluso iGPUs y tarjetas con 2 GB de VRAM o menos pueden alojarlo; también es viable en CPU pura.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con API compatible con OpenAI), llama-cpp-python, Ollama (hay un `Modelfile` en `scripts/ollama/` que requiere ajustar la ruta `FROM`) y, para el modelo base, `transformers`/`tokenizers` con el `tokenizer.json` incluido.
- Latencia y throughput: en CPU con 8 hilos, Q8_0 decodifica a 325,6 tok/s y BF16 a 62,7 tok/s; en GPU, Q8_0 alcanza 819,11 tok/s de decodificación y 45.707 tok/s de prefill, con la advertencia de throttling por Intel DTT.
- Nota de despliegue: el GGUF fija `add_bos_token = false` y `add_eos_token = false`, y no incluye `chat_template`; el prompt debe construirse manualmente. En Ollama, el orden de samplers no es configurable con exactitud y el modo greedy (`temperature=0`) coincide 8/8 en todas las variantes densas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad que permitan una comparación rigurosa con alternativas. A continuación se comparan únicamente características estructurales con modelos pequeños de la misma categoría, usando solo datos conocidos de sus fichas públicas:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Liwet-66M-id-base-v1 | 66,7M | 1024 | indonesio | no disponible | GGUF, safetensors |
| SmolLM2-135M | 135M | 8192 | ingles (principalmente) | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B | 494M | 32.768 | multilingue | Apache 2.0 | safetensors, GGUF |
| Gemma 2 2B | 2,6B | 8192 | multilingue | Gemma Terms | safetensors, GGUF |

Los modelos comparados son de propósito general y con ajuste por instrucciones en sus variantes publicadas; Liwet-66M es un modelo base monolingüe en indonesio, sin alineamiento y con contexto mucho menor. No se han publicado resultados de benchmarks de calidad en la información disponible, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue órdenes, no mantiene conversaciones y no debe usarse como asistente sin un fine-tuning previo.
- Ventana de contexto muy corta: 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo indonesio: no hay evidencia de competencia en otros idiomas; el uso en castellano u otras lenguas producirá resultados degradados.
- Sin token BOS y sin plantilla de chat: el prompt debe construirse manualmente; los tokens `<|user|>`, `<|assistant|>` y `<|end|>` existen en el vocabulario pero el modelo no está entrenado para interpretarlos como roles.
- Calidad esperada baja: con 66,7M parámetros y fase de pretrain, es previsible una alta tasa de incoherencias y alucinaciones; no hay evaluación de calidad publicada que permita cuantificarlo.
- Licencia no disponible: la ausencia de licencia explícita impide confirmar si se permite el uso comercial; debe tratarse como restrictiva hasta que el autor la declare.
- Sesgos desconocidos: no se documenta la composición del corpus de entrenamiento ni análisis de sesgos, por lo que no pueden evaluarse.
- Limitaciones del tokenizer: no aplica normalización NFC, lo que puede afectar a la tokenización de texto con caracteres compuestos.
- En Ollama, el orden de samplers no es configurable con exactitud, por lo que la generación con sampling no será idéntica a la de otras herramientas; solo el modo greedy está verificado.
- Advertencia de despliegue: las cifras de GPU del autor son un límite inferior por throttling de Intel DTT y no deben tomarse como máximos de rendimiento.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/fadhilahkhairogi/Liwet-66M-id-base-v1-GGUF
- Modelo base en safetensors: https://huggingface.co/fadhilahkhairogi/Liwet-66M-id-base-v1
- llama.cpp (repositorio oficial): https://github.com/ggml-org/llama.cpp
- Metodología de benchmarks citada en la model card: `docs/bench/RESULTS.md` (ruta interna del repositorio del autor, no se proporciona URL directa)
- Script de Ollama citado en la model card: `scripts/ollama/Modelfile-Liwet-66M-id-base-v1` (ruta interna del repositorio del autor, no se proporciona URL directa)
