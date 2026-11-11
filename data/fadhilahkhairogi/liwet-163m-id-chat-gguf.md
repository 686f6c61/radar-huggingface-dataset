# fadhilahkhairogi/Liwet-163M-id-chat-GGUF

## Resumen

Liwet-163M-id-chat-GGUF es la distribución en formato GGUF del modelo Liwet-163M-id-chat, un modelo de lenguaje denso de 163 millones de parámetros desarrollado por Fadhilah Akbar Khairogi, Faishal Fakhrillah y Deril Diaz (Grupo 11 de la asignatura Generative AI, Telkom University). Está especializado en indonesio y en conversación de tipo chat, y se distribuye únicamente como pesos cuantizados para llama.cpp, sin incluir el repositorio original de safetensors.

El modelo emplea una arquitectura transformer densa con atención GQA y una longitud de contexto de 2048 tokens, tras una etapa de alineación mediante SimPO (Simple Preference Optimization). Su interés práctico es acotado: se trata de un modelo muy pequeño, orientado a experimentación docente y a despliegues con recursos mínimos (CPU, GPUs de gama baja o entornos embebidos), no a producción de alta calidad.

La relevancia de esta ficha reside en que el autor documenta con detalle la paridad numérica entre cuantizaciones (BF16, F16, Q8_0) frente a la implementación original en PyTorch, así como métricas de rendimiento en GPU y CPU, algo poco habitual en modelos de este tamaño. No obstante, el modelo no publica resultados de benchmarks de calidad (MMLU, HumanEval, etc.) ni una licencia explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dense transformer con GQA (identificador `dense_163m`) |
| Parámetros totales | 163.013.376 (163,0 M) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | BF16, F16, Q8_0 (GGUF) |
| Idiomas soportados | Indonesio (`id`) |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp); tokenizer.json adjunto |
| Etapa de alineación | SimPO Chat |
| Modo de prompt | `chat_role` (prompt basado en líneas con `<bos>`) |
| Tokens especiales | `<pad>`=0, `<bos>`=1, `<eos>`=2 |
| Tamaño del repo | 0,8 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 163 M de parámetros con atención de consultas agrupadas (GQA), identificado internamente como `dense_163m`. La model card no detalla el número de capas, dimensiones ocultas, número de cabezas ni el volumen o composición del corpus de entrenamiento, por lo que esos datos deben considerarse no disponibles. La etapa final de alineación es SimPO Chat, una variante de optimización de preferencias sin modelo de referencia que ajusta las respuestas hacia el formato conversacional.

La conversión a GGUF se realizó con un fork de `ggml-org/llama.cpp` (commit `cae551692`, rama `liwet-moe`, build 11315) mediante `convert_hf_to_gguf.py --outtype bf16|f16` seguido de `llama-quantize` para Q8_0. El autor incluye un estudio de paridad numérica frente a la implementación original en PyTorch (logits bf16 en CUDA) sobre 35 prompts de prefill, 6 prompts greedy de 128 pasos y 5 prompts de sampling, con métricas de similitud coseno, divergencia greedy, coincidencia de router MoE y TVD de sampling. Los resultados muestran una paridad alta: Q8_0 alcanza un coseno mínimo de 0,999819 y un top-1 del 100 %, aunque el autor señala que algunas métricas quedan por debajo del umbral de su herramienta `compare.py`.

## Capacidades

- Generación de texto conversacional en indonesio, con formato de roles `System`/`User`/`Assistant`.
- Respuesta a instrucciones y diálogo multi-turno dentro de una ventana de 2048 tokens.
- Alineación de preferencias mediante SimPO, orientada a respuestas de chat.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- Capacidad multilingüe limitada al indonesio según los metadatos del modelo.
- Inferencia compatible con llama.cpp, llama-server (API compatible con OpenAI), llama-cpp-python y Ollama.

## Casos de uso

- Experimentación docente y reproducción de pipelines de cuantización: el modelo sirve para practicar la conversión HF→GGUF, la cuantización y la validación de paridad numérica frente a PyTorch, gracias a la documentación detallada de metodología y hashes SHA-256.
- Asistentes de chat en indonesio con recursos mínimos: puede desplegarse en CPU con 8 hilos (154,7 tok/s en decodificación con Q8_0) para prototipos de atención al cliente o bots internos de bajo tráfico.
- Pruebas de integración de llama-server: al exponer una API compatible con OpenAI, permite validar pipelines de orquestación (clientes HTTP, gateways, frameworks de agentes) sin coste de GPU dedicada.
- Evaluación de técnicas de alineación: útil como caso de estudio de SimPO en modelos pequeños, comparando respuestas antes y después de la etapa de preferencias.
- Despliegue en entornos embebidos o de borde: con 166,3 MiB en Q8_0 y contexto de 2048, cabe en dispositivos con poca memoria, como Raspberry Pi o mini-PC, para tareas de generación de texto acotadas.
- Generación de texto de relleno en pruebas de carga: su reducido tamaño permite simular tráfico concurrente en servidores de inferencia sin consumir GPUs de gama alta.
- Fine-tuning educativo sobre una base pequeña: el repositorio original de safetensors (163 M de parámetros) es manejable en una sola GPU consumer para experimentos de ajuste supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica métricas de rendimiento de inferencia y de paridad numérica.

Rendimiento en GPU (`llama-bench -ngl 99 -p 512 -n 128 -r 5`):

| Cuantización | Prefill 512 (tok/s) | Decode 128 (tok/s) |
|---|---|---|
| BF16 | 30.599 ± 4.553 | 396,50 ± 1,05 |
| F16 | 32.577 ± 6.592 | 389,56 ± 7,11 |
| Q8_0 | 36.629 ± 5.629 | 559,19 ± 24,68 |

Rendimiento en CPU (`-ngl 0 -t 8 -p 0 -n 32`):

| Cuantización | Decode 32 (tok/s) |
|---|---|
| BF16 | 75,2 ± 19,2 |
| Q8_0 | 154,7 ± 8,1 |

Paridad frente a la referencia bf16 en CUDA:

| Cuantización | Coseno mínimo / medio | Top-1 | Divergencia greedy mediana (sin rep. / con rep.) | TVD máx. sampling |
|---|---|---|---|---|
| BF16 | 0,999973 / 0,999989 | 100,00 % | 128 / 33,5 | 0,016 |
| F16 | 0,999974 / 0,999989 | 100,00 % | 128 / 33,5 | 0,036 |
| Q8_0 | 0,999819 / 0,999947 | 100,00 % | 87,5 / 26,5 | 0,048 |

El autor advierte que las cifras de GPU son una cota inferior mientras Intel DTT está activo (clocks de SM observados en torno a 0,8 GHz frente a un límite de 3,1 GHz).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones (Q8_0 ocupa 166,3 MiB de pesos; BF16/F16, 312,0 MiB), más la memoria para el contexto de 2048 tokens y el estado de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el modelo no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060, GTX 1650 o iGPU con soporte de llama.cpp.
- Cabe holgadamente en GPU consumer: sí, en todas las variantes y cuantizaciones.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python y Ollama mediante el `Modelfile` incluido en `scripts/ollama/Modelfile-Liwet-163M-id-chat` (requiere ajustar la ruta `FROM`).
- Latencia y throughput: en GPU, 559,19 tok/s de decodificación con Q8_0 y 36.629 tok/s de prefill; en CPU con 8 hilos, 154,7 tok/s de decodificación con Q8_0. Las cifras de GPU son cotas inferiores por la limitación de frecuencia mencionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad que permitan una comparación rigurosa con alternativas. A continuación se comparan únicamente parámetros y contexto de modelos pequeños de la misma categoría, con la advertencia de que las cifras de rendimiento no son comparables.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Liwet-163M-id-chat | 163 M | 2048 | Indonesio | No disponible | GGUF |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 | Multilingüe | Apache 2.0 | Safetensors, GGUF |
| SmolLM2-135M-Instruct | 135 M | 8192 | Principalmente inglés | Apache 2.0 | Safetensors, GGUF |
| TinyLlama-1.1B-Chat | 1,1 B | 2048 | Inglés | Apache 2.0 | Safetensors, GGUF |

Liwet-163M es el único de la lista orientado específicamente al indonesio, pero también el que carece de licencia declarada y de benchmarks publicados, lo que limita su adopción frente a alternativas con licencias permisivas y evaluaciones públicas.

## Limitaciones y advertencias

- Ausencia de licencia explícita: no se especifican términos de uso comercial, lo que impide asumir permisos de redistribución o explotación en producción.
- Sin benchmarks de calidad publicados: no hay evidencia de rendimiento en tareas estándar (razonamiento, código, matemáticas), por lo que la calidad real es desconocida.
- Ventana de contexto reducida (2048 tokens), insuficiente para documentos largos o conversaciones extensas.
- Monolingüe en la práctica: los metadatos declaran únicamente indonesio; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será bajo.
- Riesgo elevado de alucinación y de respuestas incoherentes por el tamaño reducido (163 M) y la escasez de datos de entrenamiento documentados.
- El GGUF no incluye `chat_template` y fija `add_bos_token = false` y `add_eos_token = false`; el prompt debe construirse manualmente por el llamador, lo que facilita errores de formato.
- En Ollama, el orden de los samplers no es configurable con exactitud (top-p se calcula antes que temperature), por lo que la salida con sampling no coincide con la de otras aplicaciones; solo el modo greedy (`temperature=0`) se validó como idéntico en 8 de 8 casos para las variantes densas.
- El tokenizer de la variante de 66 M no aplica normalización NFC, limitación conocida que puede afectar a la tokenización de texto con caracteres compuestos.
- El autor reconoce métricas de paridad por debajo del umbral de su herramienta de comparación, lo que indica divergencias menores pero medibles frente a la implementación original.
- No se documenta soporte de tool calling, agentes ni modalidades adicionales; no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fadhilahkhairogi/Liwet-163M-id-chat-GGUF
- Modelo base (safetensors): https://huggingface.co/fadhilahkhairogi/Liwet-163M-id-chat
- Fork de llama.cpp utilizado: https://github.com/ggml-org/llama.cpp
- Documentación de paridad (referenciada en la model card): `docs/bench/RESULTS.md` dentro del repositorio del autor
- Modelfile para Ollama (referenciado): `scripts/ollama/Modelfile-Liwet-163M-id-chat`
