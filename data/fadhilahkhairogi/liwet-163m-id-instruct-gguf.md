# fadhilahkhairogi/Liwet-163M-id-instruct-GGUF

## Resumen

Liwet-163M-id-instruct-GGUF es la versión cuantizada en formato GGUF del modelo Liwet-163M-id-instruct, un modelo de lenguaje denso de 163 millones de parámetros desarrollado por Fadhilah Akbar Khairogi (y equipo, Grupo 11 de la asignatura Generative AI de Telkom University). El modelo está especializado en indonesio y en la modalidad de instrucciones, y su propósito es ofrecer generación de texto ligera y desplegable en entornos con recursos limitados mediante llama.cpp.

La relevancia de esta ficha radica en que se trata de una conversión de pesos a GGUF (variantes BF16, F16 y Q8_0), no de un modelo nuevo: el autor original del modelo base es el mismo que publica la cuantización. El modelo emplea una arquitectura transformer densa con atención GQA (grouped-query attention), 163 millones de parámetros totales y una ventana de contexto de 2048 tokens. El repositorio ocupa 0,8 GB e incluye los tres archivos GGUF junto con el `tokenizer.json` original.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a experimentación académica y a despliegues de muy bajo coste en indonesio. No dispone de chat template embebida en los metadatos GGUF, por lo que el formateo del prompt debe realizarlo el llamador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con GQA (identificador `dense_163m`) |
| Parametros totales | 163.013.376 |
| Parametros activos | No aplica (modelo denso, 163,0M activos) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | BF16, F16, Q8_0 |
| Idiomas soportados | Indonesio (id) |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16, F16, Q8_0); `tokenizer.json` en formato Hugging Face |
| Etapa de entrenamiento | SFT Instruct |
| Modo de prompt | `chat_role` (prompt por lineas basado en roles) |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 163 millones de parámetros con atención GQA, identificado en los metadatos como `dense_163m`. La model card no proporciona detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO; únicamente se indica que la etapa final es SFT Instruct. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

La aportación principal de este repositorio es la conversión a GGUF, realizada con un fork de `ggml-org/llama.cpp` (commit `cae551692`, rama `liwet-moe`, build 11315) mediante `convert_hf_to_gguf.py` con `--outtype bf16|f16` y posterior `llama-quantize` a Q8_0. El repositorio safetensors original no se modificó. El autor publica además una validación de paridad numérica frente a la implementación PyTorch original en bf16 sobre CUDA: la similitud coseno del logit del último token es de 0,999980 (mínimo) y 0,999992 (media) para BF16, 0,999979/0,999992 para F16 y 0,999913/0,999958 para Q8_0, con un top-1 del 100 % en los tres casos. La divergencia greedy mediana (P2) es de 108/87 pasos para BF16 y F16 y de 63/87,5 para Q8_0, y la TVD máxima en muestreo (P4) es de 0,020, 0,032 y 0,064 respectivamente. El autor marca el estado como "con métricas por debajo del umbral de `compare.py`".

## Capacidades

- Generación de texto en indonesio, con ajuste por instrucciones (SFT Instruct).
- Formato de prompt por roles de tipo `chat_role`, con líneas `System:`, `User:` y `Assistant:` precedidas de `<bos>`.
- Compatibilidad con endpoints OpenAI a través de `llama-server`.
- Inferencia en CPU y GPU mediante llama.cpp y `llama-cpp-python`.
- Despliegue en Ollama mediante el Modelfile incluido en `scripts/ollama/`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al indonesio según los metadatos del modelo; no se declaran otros idiomas.

## Casos de uso

- Generación de texto en indonesio en dispositivos de bajos recursos: con 163M de parámetros y un GGUF Q8_0 de 166,3 MiB, el modelo cabe en cualquier portátil y puede ejecutarse en CPU a unas 146,6 tok/s de decodificación con 8 hilos, lo que lo hace apto para prototipos locales sin GPU.
- Servicio de inferencia compatible con OpenAI: `llama-server -m Liwet-163M-id-instruct-Q8_0.gguf -c 2048 --host 127.0.0.1 --port 8080` expone una API compatible con clientes OpenAI, útil para integrar el modelo en aplicaciones existentes sin cambiar el cliente.
- Experimentación académica y docencia: al ser un modelo pequeño con paridad numérica documentada frente a la implementación PyTorch, sirve para estudiar el efecto de la cuantización (BF16 frente a Q8_0) en la calidad de la generación.
- Generación de respuestas cortas en asistentes de dominio acotado: con un contexto de 2048 tokens y formato de roles, puede gestionar conversaciones de pocos turnos en indonesio para tareas simples de preguntas y respuestas.
- Pruebas de pipelines de cuantización y despliegue: el repositorio incluye los SHA-256 de cada archivo, lo que permite verificar la integridad de los pesos en pipelines de CI y en la distribución de artefactos.
- Inferencia por lotes en CPU para tareas de etiquetado o generación masiva de texto en indonesio, donde el throughput en CPU (146,6 tok/s en Q8_0) es suficiente y evita el coste de GPU.
- Despliegue en Ollama para entornos de desarrollo: el Modelfile incluido permite crear el modelo con `ollama create` y aplicar automáticamente la plantilla de chat, útil para pruebas rápidas de instrucciones.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks de calidad estándar (MMLU, HumanEval, GSM8K u otros). Los únicos datos disponibles son de rendimiento de inferencia y de paridad numérica de la cuantización.

Rendimiento en GPU (`llama-bench -ngl 99 -p 512 -n 128 -r 5`):

| Quant | Prefill 512 (tok/s) | Decode 128 (tok/s) |
|---|---|---|
| BF16 | 24.678 ± 3.774 | 372,44 ± 6,73 |
| F16 | 28.612 ± 4.879 | 363,64 ± 16,58 |
| Q8_0 | 26.548 ± 4.825 | 517,26 ± 48,64 |

Rendimiento en CPU (`-ngl 0 -t 8 -p 0 -n 32`):

| Quant | Decode 32 (tok/s) |
|---|---|
| BF16 | 22,1 ± 5,3 |
| Q8_0 | 146,6 ± 12,4 |

El autor advierte de que las cifras de GPU son un límite inferior medido con Intel DTT activo (frecuencia de SM observada de ~0,8 GHz frente a un límite de 3,1 GHz) y que la medición en CPU usa 8 hilos.

Paridad numérica frente a la referencia bf16 en CUDA:

| Quant | P1 min / media (coseno) | P1 top-1 | P2 mediana divergencia (norep / defrep) | P4 TVD máxima |
|---|---|---|---|---|
| BF16 | 0,999980 / 0,999992 | 100,00 % | 108 / 87 | 0,020 |
| F16 | 0,999979 / 0,999992 | 100,00 % | 108 / 87 | 0,032 |
| Q8_0 | 0,999913 / 0,999958 | 100,00 % | 63 / 87,5 | 0,064 |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa 174.401.120 B (166,3 MiB) y los archivos BF16/F16 ocupan 327.202.400 B (312,0 MiB) cada uno; con la caché KV para 2048 tokens el consumo es de unos pocos cientos de MiB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: no se especifican modelos concretos; el autor midió con `-ngl 99` sobre una GPU no identificada con Intel DTT activo. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es sobradamente suficiente.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 1 GB de VRAM, y en CPU sin GPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), `llama-cpp-python` y Ollama mediante el Modelfile incluido. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: en GPU, decodificación de 372,44 tok/s (BF16), 363,64 tok/s (F16) y 517,26 tok/s (Q8_0); prefill de 512 tokens entre 24.678 y 28.612 tok/s. En CPU con 8 hilos, 146,6 tok/s (Q8_0) y 22,1 tok/s (BF16). El autor indica que las cifras de GPU son límite inferior por las condiciones de medición.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad que permitan una comparación rigurosa con alternativas. La siguiente tabla compara únicamente parámetros y contexto con modelos pequeños de la misma categoría, con los datos disponibles en esta ficha:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Liwet-163M-id-instruct-GGUF | 163,0M | 2048 | Indonesio | no disponible | GGUF |
| Modelos comparables de 100-200M en indonesio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada modelos alternativos concretos con los que comparar parámetros, contexto, rendimiento, licencia y disponibilidad. Se indica "no disponible".

## Limitaciones y advertencias

- La licencia no está disponible en la información proporcionada; no puede confirmarse el uso comercial. Es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en producción.
- Modelo de 163M de parámetros: la capacidad de razonamiento, conocimiento factual y coherencia en contextos largos es limitada en comparación con modelos de mayor tamaño; el riesgo de alucinación es alto en preguntas abiertas.
- Ventana de contexto de solo 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Soporte únicamente de indonesio según los metadatos; el rendimiento en otros idiomas, incluido el castellano, no está garantizado ni documentado.
- Los metadatos GGUF declaran `add_bos_token = false` y `add_eos_token = false` y no incluyen `chat_template`; el llamador debe construir el prompt manualmente con el formato de roles y añadir `<bos>` (id 1) al inicio.
- Stop strings recomendadas: `<eos>` (id 2) y `\n\nUser:`; su omisión puede provocar generaciones que continúen el turno del usuario.
- En Ollama, el orden de los samplers no es configurable con exactitud (top-p se calcula antes que temperature), por lo que la salida en modo muestreo no será idéntica a la de otras aplicaciones; el modo greedy (`temperature=0`) coincide en 8/8 casos en todas las variantes densas.
- El tokenizador del modelo de 66M no aplica normalización NFC, limitación conocida que puede afectar a la consistencia del texto de entrada.
- El autor marca la paridad de cuantización con métricas por debajo del umbral de `compare.py`, por lo que Q8_0 presenta divergencias medibles frente a BF16 (TVD máxima de 0,064).
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fadhilahkhairogi/Liwet-163M-id-instruct-GGUF
- Modelo base: https://huggingface.co/fadhilahkhairogi/Liwet-163M-id-instruct
- Fork de llama.cpp utilizado: https://github.com/ggml-org/llama.cpp (commit `cae551692`, rama `liwet-moe`, build 11315)
