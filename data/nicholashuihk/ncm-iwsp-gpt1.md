# NicholasHuiHK/ncm-iwsp-gpt1

## Resumen

NCM-iWSP-GPT1 es un artefacto de investigación publicado por Nicholas HuiHK que implementa un modelo de concepto siguiente (Next-Concept Model, NCM) con un mecanismo de empalme en el lado de la decodificación (decode-side splice). No es un modelo de lenguaje causal al uso: el generador NCM no produce texto token a token, sino que predice códigos residuales vectorialmente cuantizados que después se decodifican en una ventana de 512 tokens. Para obtener una respuesta legible en formato de chat, el sistema empalma la apertura oficial del asistente con un plan generado por TinyLlama-1.1B-Chat-v1.0 y aplica una función `slice_reply` sobre la ventana resultante.

El modelo se compone de tres checkpoints congelados: un generador ssunroll2 de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención (unos 618 MB), una cabeza de prefijo (21 MB) y un tokenizador VQ adaptado (369 MB). El contexto de tokens es de 512 y el tokenizador es GPT-2 byte-level BPE con vocabulario ampliado a 50304. El repositorio incluye además un borrador de investigación de 15 páginas y los scripts de inferencia.

La relevancia de este modelo es fundamentalmente académica: explora una vía alternativa a la generación autorregresiva clásica mediante cuantización vectorial residual y empalme en decodificación. No se reclama estado del arte ni se presentan benchmarks comparativos, y el propio autor advierte que el generador NCM no es un chatbot causal. Está entrenado exclusivamente sobre databricks-dolly-15k y solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer NCM (Next-Concept Model) con VQ residual; generador de 12 capas / 768 hidden / 12 heads |
| Parámetros totales | no disponible (pesos: generador ~618 MB, cabeza de prefijo ~21 MB, tokenizador ~369 MB) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (checkpoints en punto flotante PyTorch, sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC BY-SA 3.0 |
| Formato de pesos | PyTorch (`.pt`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El cuerpo del generador es un transformer de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención. La salida no es directamente texto, sino códigos residuales cuantizados mediante un esquema VQ residual de 23 niveles cuadrados con escalas `[1, 4, …, 484, 512]`, 4307 celdas de rejilla (de `1²` a `22²`, más `512` en lugar de `23²`) y un codebook de 4096 entradas. El pretokenizador es GPT-2 byte-level BPE vía `tiktoken` (encoding `gpt2`) con vocabulario rellenado a 50304. La configuración de referencia es `configs/target_phase3.yaml`, con `predict_level0: false` y una longitud de prefijo de fase 3 de 32.

El pipeline de inferencia oficial consta de cinco pasos: predicción de la cabeza de prefijo del código residual más grueso a partir del prefijo del encoder congelado; generación ssunroll2 de los códigos residuales posteriores; decodificación VQ de una ventana de 512 tokens; empalme en el lado de la decodificación de la apertura oficial del asistente, un plan congelado de TinyLlama-1.1B-Chat-v1.0, end-of-text y pad; y aplicación de `slice_reply` sobre la ventana empalmada. Los códigos residuales no se reescriben y el worktree oficial no se parchea. El entrenamiento y la adaptación se realizaron sobre registros instrucción/respuesta de databricks-dolly-15k, empaquetados como ventanas de diálogo `User`/`Assistant` con `<|endoftext|>` como cierre de turno. No se documentan número de tokens de entrenamiento, composición detallada del dataset ni etapas de RLHF/DPO.

## Capacidades

- Generación de respuestas de chat en inglés mediante el pipeline de empalme en decodificación (no generación causal directa del NCM).
- Predicción de códigos residuales VQ a partir de un prefijo de encoder congelado.
- Decodificación VQ de ventanas de 512 tokens.
- Integración con un planificador externo (TinyLlama-1.1B-Chat-v1.0) para estructurar la respuesta.
- Soporte de conversación multi-turno limitado por la ventana de 512 tokens.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: solo inglés.

## Casos de uso

- Investigación sobre modelos de concepto siguiente: el repositorio permite reproducir el pipeline completo (predicción de prefijo, ssunroll2, decodificación VQ y empalme) para estudiar alternativas a la generación autorregresiva token a token.
- Experimentación con cuantización vectorial residual: los checkpoints y la configuración `target_phase3.yaml` permiten analizar el comportamiento del codebook de 4096 entradas y las 23 escalas residuales en tareas de reconstrucción y generación.
- Estudio de empalme en decodificación (decode-side splice): útil para investigadores interesados en combinar un generador no causal con un planificador causal externo y medir la coherencia del resultado.
- Reproducción de resultados de un paper: el borrador de 15 páginas y los scripts de inferencia permiten replicar el resultado reportado con el prompt `How are you?` y comparar variantes del pipeline.
- Docencia y divulgación: como ejemplo didáctico de arquitecturas híbridas VQ + transformer y de las limitaciones de los modelos no causales para chat.
- Evaluación de robustez de pipelines híbridos: permite medir cómo afecta el planificador externo (TinyLlama) y la función `slice_reply` a la calidad final de la respuesta.
- Prototipado de asistentes conversacionales en inglés con contexto corto: solo en entornos de investigación, dado que no se reclama calidad de chatbot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la model card no reclama puntuaciones de estado del arte en chatbots. El único resultado reportado es cualitativo: con el prompt `How are you?`, el sistema devolvió `I am doing well, thank you. How about you? i am doing well too.` (con la `i` minúscula generada).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; los pesos suman aproximadamente 1.0 GB (generador ~618 MB, tokenizador ~369 MB, cabeza de prefijo ~21 MB), más los pesos del planificador TinyLlama-1.1B-Chat-v1.0 descargados aparte.
- GPU recomendadas: no se especifican modelos concretos; el autor recomienda una GPU y permite ejecución en CPU vía `--device cpu`.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño reducido de los checkpoints, aunque no se documenta VRAM mínima ni GPU concretas verificadas.
- Opciones de despliegue: scripts oficiales `official_chat.sh` / `official_chat.cmd` y `inference/chat_lmsplice.py` sobre PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que la primera carga puede tardar aproximadamente un minuto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NCM-iWSP-GPT1 | no disponible (pesos ~1.0 GB) | 512 | NCM + VQ residual + empalme en decodificación | CC BY-SA 3.0 | Hugging Face (NicholasHuiHK/ncm-iwsp-gpt1) |
| TinyLlama-1.1B-Chat-v1.0 | 1.1B | 2048 | Transformer causal decoder-only | Apache 2.0 | Hugging Face (TinyLlama/TinyLlama-1.1B-Chat-v1.0) |
| Modelos tipo GPT-2 small | ~124M | 1024 | Transformer causal decoder-only | MIT (variantes) | Hugging Face |

La comparación directa es limitada porque NCM-iWSP-GPT1 no es un modelo causal de chat y depende de TinyLlama como planificador. No se dispone de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El generador NCM no es un modelo de chat causal; la respuesta legible depende del empalme con un planificador externo (TinyLlama) y de la función `slice_reply`.
- Sesgos conocidos: no documentados, pero el entrenamiento se limita a databricks-dolly-15k (inglés), lo que puede introducir sesgos del dataset.
- Riesgo de alucinación: no evaluado ni cuantificado en la información disponible.
- Limitación de contexto: ventana de 512 tokens, insuficiente para conversaciones largas o documentos extensos.
- Limitación de idioma: solo inglés.
- Licencia CC BY-SA 3.0 con cláusula ShareAlike, heredada de Dolly 15k; esto condiciona el uso comercial y la redistribución de los pesos y obras derivadas.
- Los pesos de TinyLlama no se incluyen en el repositorio y deben descargarse por separado desde su repositorio oficial.
- No se incluyen datasets empaquetados, datos de fase 3 ni artefactos de NCM-GPT1.
- No se han publicado benchmarks ni métricas cuantitativas de calidad; el único resultado es una respuesta cualitativa a un prompt concreto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/NicholasHuiHK/ncm-iwsp-gpt1
- Repositorio GitHub del proyecto: https://github.com/nicholashui/ncm-iwsp-gpt1 (commit `118865e15fcb83779fdc212b4ad8c87a43bac4d7`)
- Paper (borrador incluido en el repo): `paper/main.pdf` — Nicholas Hui, *NCM-iWSP-GPT1: Constructing Official Readable Chat from a Frozen Next-Concept Model by Decode-Side Splice* (2026). Sin identificador arXiv asignado.
- Planificador TinyLlama: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/databricks/databricks-dolly-15k
