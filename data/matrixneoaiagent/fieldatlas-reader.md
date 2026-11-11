# matrixneoaiagent/fieldatlas-reader

## Resumen

Field Atlas Reader 2B es un ajuste fino mediante LoRA del modelo Qwen/Qwen3.5-2B, desarrollado por el usuario matrixneoaiagent para el lector offline de la aplicación Field Atlas. Su función es responder preguntas a partir de hasta ocho pasajes numerados, citando la fuente de cada frase con el formato `[S#]` y absteniéndose explícitamente con la frase "The saved sources don't say." cuando los pasajes no contienen la respuesta. El modelo se distribuye principalmente como un GGUF cuantizado Q4_K_M de 1,27 GB, pensado para ejecutarse con llama.cpp en dispositivos móviles.

El modelo base Qwen3.5-2B aporta la arquitectura subyacente, mientras que el adaptador LoRA (r=16, alpha=32) se entrenó sobre 14.000 prompts derivados del split de entrenamiento de SQuAD 2.0. El objetivo del ajuste no es mejorar el conocimiento factual general, sino inculcar un comportamiento concreto de citación y abstención, reduciendo alucinaciones numéricas y citas incorrectas.

Es relevante ahora porque ejemplifica una tendencia práctica: adaptar modelos pequeños (menos de 2.000 millones de parámetros) a tareas muy específicas con presupuestos de entrenamiento mínimos (2,8 horas en 2× Tesla T4) y desplegarlos en entornos con recursos limitados. No obstante, sus cifras de rendimiento muestran un compromiso claro entre precisión y abstención que conviene evaluar con detalle.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-2B) con adaptador LoRA fusionado |
| Parámetros totales | 1.881.825.088 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de uso emplea `-c 4096`) |
| Tipos de cuantización | Q4_K_M (GGUF, 5,37 BPW); también disponible el adaptador PEFT y el checkpoint fusionado en fp16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M), safetensors (modelo base y checkpoint fusionado), adaptador PEFT LoRA |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer denso de aproximadamente 1.880 millones de parámetros. Sobre él se aplicó un adaptador LoRA con r=16, alpha=32 y dropout 0,05, dirigido a todas las capas lineales del modelo de lenguaje: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, `in_proj_qkv`, `in_proj_a`, `in_proj_b`, `in_proj_z` y `out_proj`. El adaptador contiene 16.819.200 parámetros entrenables, un 0,754 % del total. El entrenamiento se realizó en fp16, sin cuantización de 4 bits, con batch 6, acumulación de gradiente 2, secuencia máxima de 2048, AdamW, learning rate 1e-4 con scheduler OneCycle y fp16 loss scaling sobre 2× Tesla T4.

Los datos de entrenamiento son 14.000 prompts construidos a partir del split de entrenamiento de SQuAD 2.0: 8.552 respuestas de un solo pasaje, 2.227 de dos pasajes, 2.100 elementos no respondibles con el objetivo exacto de abstención y 1.121 elementos parciales. Ningún elemento del conjunto de desarrollo se usó para entrenamiento ni selección de modelo. La ejecución en Kaggle estuvo limitada a 2,8 horas y completó 650 de los 2.300 pasos de optimizador previstos (loss 0,017 en el paso 650); un `KeyError` en la comparación de checkpoints detuvo el script, por lo que el artefacto final es el adaptador de la época 1, no una ejecución completa de 2 épocas.

La fusión se realizó con PEFT `merge_and_unload` sobre el modelo base en fp16, verificando que un peso `in_proj_qkv` cambiaba (diferencia máxima 0,002388) y que `embed_tokens` permanecía intacto (diferencia 0). La conversión a GGUF se hizo con `convert_hf_to_gguf.py --outtype f16` usando el commit `90e3841d9f35a5bf3c112b9d71502bce77de5b32` de llama.cpp, que descarta la torre de visión y la cabeza MTP, produciendo 320 tensores (3,78 GB). Posteriormente se cuantizó a Q4_K_M con `llama-quantize`, resultando en 1.274.396.320 bytes (5,37 BPW).

## Capacidades

- Generación de texto extractiva: responde preguntas utilizando exclusivamente la información contenida en hasta ocho pasajes numerados proporcionados en el prompt.
- Citación por frase: cada frase de la respuesta incluye la referencia `[S#]` al pasaje del que procede.
- Abstención explícita: emite la frase "The saved sources don't say." cuando los pasajes no contienen la respuesta, en lugar de inventar información.
- Control de alucinaciones numéricas: en el conjunto de desarrollo no produjo cifras sin respaldo (0,0 % de "numbers from nowhere").
- Control de citas incorrectas: 0,0 % de citas erróneas en el conjunto de desarrollo.
- Modo sin razonamiento: el template de chat de Qwen3.5 admite `enable_thinking: false`, empleado en la evaluación.
- Procesamiento de elementos parciales: responde la parte cubierta por las fuentes y declara que el resto no está cubierto.
- No soporta tool calling, function calling, agentes multi-paso, visión ni audio según la información disponible.

## Casos de uso

- Lector offline en dispositivos móviles: el GGUF Q4_K_M de 1,27 GB cabe en un teléfono moderno y se ejecuta con llama.cpp mediante `llama-server`, permitiendo responder preguntas sobre documentos descargados sin conexión.
- Asistente de investigación documental con trazabilidad: al citar cada frase con `[S#]`, el usuario puede verificar la fuente de cada afirmación en un corpus de hasta ocho pasajes, lo que resulta adecuado para revisión de literatura o lectura de informes.
- Sistemas de preguntas y respuestas sobre base documental cerrada: la abstención explícita evita respuestas inventadas cuando la respuesta no está en los documentos, un requisito habitual en entornos legales, médicos o de compliance.
- Extracción de respuestas con control de calidad: la ausencia de cifras y citas inventadas en el conjunto de desarrollo lo hace apto para pipelines donde una alucinación numérica es costosa.
- Prototipado rápido de asistentes RAG: sirve como componente de generación en un sistema de recuperación aumentada, con prompts que incluyan los pasajes recuperados y el formato de citación esperado.
- Evaluación comparativa de comportamiento de abstención: útil como referencia para medir el equilibrio entre responder y abstenerse en modelos pequeños ajustados para lectura de fuentes.

## Benchmarks y rendimiento

Resultados sobre el conjunto público de desarrollo de 60 elementos, con temperatura 0, thinking desactivado y `max_tokens=400`, según la model card:

| Modelo | Correctas | Key facts | Gaps admitidos | Falsos rechazos | Cifras inventadas | Citas erróneas | Palabras (mediana) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Qwen3.5-2B Q4_K_M (baseline publicado) | 36,7 % | 76,2 % | 94,4 % | 38,1 % | 1,7 % | 0,0 % | 73,5 |
| Este adaptador, fp16 fusionado, decodificación greedy HF | 45,0 % | 27,6 % | 94,4 % | 52,4 % | 0,0 % | 0,0 % | 5,0 |
| Este adaptador, GGUF Q4_K_M, llama.cpp | 43,3 % | 32,4 % | 88,9 % | 47,6 % | 0,0 % | 0,0 % | 5,0 |

Cambios por categoría frente al baseline: hecho 75,0 % vs 50,0 %, salud 66,7 % vs 33,3 %, viajes 40,0 % vs 20,0 %, comparación 25,0 % vs 12,5 %; pero cripto 0,0 % vs 33,3 %, síntesis 25,0 % vs 50,0 % e insuficiente 80,0 % vs 100,0 %. Los huecos admitidos son 88,9 % vs 94,4 %. El conjunto de desarrollo es de 60 elementos públicos con puntuación estricta y automática; es una señal de desarrollo, no el conjunto de evaluación sellado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con el GGUF Q4_K_M (1,27 GB de pesos más overhead de contexto y caché KV); el checkpoint fusionado en fp16 requiere del orden de 4 GB.
- GPU recomendadas: el modelo está pensado para CPU y móvil; en GPU, cualquier tarjeta con 4 GB o más puede ejecutar la versión Q4_K_M, incluidas RTX 3050, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; el entrenamiento se realizó en 2× Tesla T4.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte del template de chat de Qwen3.5 mediante `--jinja`. No se documentan otras opciones como vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. La evaluación GGUF se realizó con `llama-server` en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Correctas (dev 60) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Field Atlas Reader 2B (este) | 1,88 B | no disponible | 43,3 % (GGUF) / 45,0 % (fp16) | Apache-2.0 | GGUF + adaptador PEFT |
| Qwen3.5-2B (base) | ~1,88 B | no disponible | 36,7 % (baseline publicado) | Apache-2.0 | Hugging Face |
| Alternativas de 2B para QA con citas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de la misma categoría (QA extractiva con citación y abstención) en la información proporcionada.

## Limitaciones y advertencias

- Entrenado sobre prosa de Wikipedia de SQuAD, no sobre las colecciones reales de Field Atlas (viajes, salud, biología, Ethereum); aprende el comportamiento de citación y abstención, no el dominio de la aplicación.
- Los falsos rechazos son elevados: 47,6 % en GGUF frente al 38,1 % del baseline, es decir, se abstiene en elementos que sí tenían respuesta.
- La recuperación de hechos clave cae a 32,4 % frente al 76,2 % del baseline; a menudo responde solo la primera frase de un elemento parcial y declara que el resto no está cubierto.
- El rendimiento en categorías como cripto (0,0 % vs 33,3 %) y síntesis (25,0 % vs 50,0 %) es peor que el del modelo base.
- El entrenamiento se interrumpió tras 650 de 2.300 pasos previstos; no es una ejecución completa de 2 épocas, lo que puede limitar la calidad final.
- El conjunto de evaluación es de 60 elementos públicos; los resultados son una señal de desarrollo y no garantizan el comportamiento en el conjunto de evaluación sellado.
- Solo soporta inglés.
- Riesgo de alucinación inherente a los modelos de 2B, aunque en el conjunto de desarrollo no produjo cifras ni citas inventadas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-2B y los datos SQuAD 2.0 (CC BY-SA 4.0) imponen sus propias condiciones que conviene verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matrixneoaiagent/fieldatlas-reader
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio llama.cpp (commit de conversión): https://github.com/ggerganov/llama.cpp
- Conjunto de datos SQuAD 2.0: https://rajpurkar.github.io/SQuAD-explorer/
