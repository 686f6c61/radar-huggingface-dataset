# Anbeeld/Qwen3.5-9B-GGUF-Bartowski-SINQ

## Resumen

Qwen3.5-9B-GGUF-Bartowski-SINQ es una colección de cuantizaciones GGUF del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario Anbeeld. El repositorio no contiene un modelo entrenado desde cero, sino una reempaquetación del recetario de cuantización de Bartowski (bartowski/Qwen_Qwen3.5-9B-GGUF) aplicando SINQ durante el proceso de cuantización. El pipeline declarado es image-text-to-text, lo que confirma que el modelo base es multimodal (acepta imagen y texto como entrada).

La relevancia de esta publicación no está en el modelo en sí, sino en la técnica de cuantización: SINQ (según el autor, soportada únicamente en BeeLlama.cpp v0.5.0) produce, según la model card, una KLD media inferior a la de las cuantizaciones estándar de Bartowski para cada receta equivalente. El autor reporta métricas de divergencia (KLD, Top-1 agreement, PPL) sobre el corpus Wikitext-2 con el modelo BF16 como referencia, lo que permite evaluar objetivamente la pérdida de calidad introducida por cada nivel de compresión.

El modelo base tiene 9.197.093.888 parámetros (aproximadamente 9,2 mil millones), licencia Apache 2.0 y un repositorio de 162,1 GB que agrupa todas las variantes de cuantización. Es una opción orientada a despliegue local en llama.cpp/BeeLlama.cpp, no a entrenamiento ni a fine-tuning.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-9B; arquitectura no detallada en la información proporcionada) |
| Parámetros totales | 9.197.093.888 (9,2 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (64K), usada en la evaluación KLD; contexto máximo oficial del modelo base no disponible |
| Tipos de cuantización | IQ2_S, IQ2_M, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_M, Q3_K_M, Q2_K_L, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q3_K_XL, Q5_K_S (lista parcial; el repositorio contiene más variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con cuantización SINQ aplicada) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base Qwen3.5-9B ni sus datos de entrenamiento; la model card se limita al proceso de cuantización. Lo que sí se detalla es el procedimiento de compresión: se parte del recetario de Bartowski para Qwen3.5-9B y se aplica SINQ con distintos parámetros de anchura (width: 16, 32, 64, 128) y fuerza (strength: 0,5, 0,75, 1). Cada variante se evalúa contra el modelo BF16 de referencia.

La innovación técnica destacable es la propia SINQ, que según el autor solo está soportada en BeeLlama.cpp v0.5.0. Las mediciones reportadas usan el corpus completo Wikitext-2 test, 297.193 objetivos de siguiente token alineados, contexto de 65.536 tokens, caché K/V en BF16, batch 512 y microbatch 256. No se proporciona información sobre RLHF, DPO, composición del dataset ni número de tokens de entrenamiento del modelo base.

## Capacidades

- Generación de texto conversacional (tag "conversational" en el repositorio).
- Procesamiento multimodal imagen-texto (pipeline image-text-to-text), aunque no se detallan tareas concretas de visión.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere integración con servidores de inferencia tipo OpenAI API.
- Capacidades específicas de razonamiento, código, matemáticas, tool calling o agentes: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las variantes Q4_K_M (6,17 GB) o IQ4_XS (5,50 GB) caben en GPUs de 8 GB de VRAM y permiten ejecutar un modelo de 9,2 B con pérdida de calidad medida (KLD media de 0,0222 y 0,0293 respectivamente).
- Inferencia en CPU con llama.cpp o BeeLlama.cpp: las variantes Q2_K (4,33 GB) e IQ2_M (4,03 GB) permiten ejecutar el modelo en equipos sin GPU dedicada, con Top-1 agreement del 82-83 % frente al BF16.
- Escenarios con memoria muy limitada: IQ2_S (3,97 GB) es la variante más pequeña del recetario, adecuada para entornos embebidos o contenedores con cuotas de memoria estrictas, a costa de un Top-1 del 77,8 %.
- Evaluación comparativa de técnicas de cuantización: el repositorio incluye métricas KLD, PPL y Top-1 por receta, lo que permite a investigadores comparar SINQ frente a cuantizaciones estándar de Bartowski y Unsloth sobre el mismo modelo base.
- Prototipado de aplicaciones multimodal imagen-texto: al declarar pipeline image-text-to-text, puede usarse para experimentar con entrada de imágenes en pipelines locales, siempre que el runtime (BeeLlama.cpp v0.5.0) soporte las capacidades de visión del modelo base.
- Servicios de inferencia compatibles con API: el tag "endpoints_compatible" permite integrarlo en servidores que expongan una interfaz tipo OpenAI para aplicaciones conversacionales.
- Selección de compromiso calidad/tamaño en producción: la tabla de KLD por receta facilita elegir la variante óptima según el presupuesto de VRAM (por ejemplo, Q4_K_M con KLD 0,0222 frente a Q3_K_M con 0,0661).

## Benchmarks y rendimiento

Los datos publicados son métricas de cuantización (KLD, Top-1 agreement, PPL) sobre Wikitext-2 test con el modelo BF16 como referencia, no benchmarks de tareas (MMLU, HumanEval, GSM8K). Se reproduce una selección de las variantes reportadas:

| Receta | Tamaño (GB) | Width | Strength | KLD media | Top-1 | PPL |
|---|---:|---:|---:|---:|---:|---:|
| IQ2_S | 3,969 | 64 | 0,5 | 0,296414 | 77,767 % | 7,9476 |
| IQ2_M | 4,030 | 128 | 1 | 0,190647 | 82,289 % | 7,3301 |
| Q2_K | 4,325 | 128 | 1 | 0,174333 | 83,260 % | 7,3516 |
| IQ3_XXS | 4,537 | 32 | 1 | 0,105045 | 87,147 % | 7,0444 |
| IQ3_XS | 4,821 | 128 | 1 | 0,082945 | 89,097 % | 6,9498 |
| Q3_K_S | 4,930 | 16 | 1 | 0,090341 | 88,319 % | 6,9250 |
| IQ3_M | 4,983 | 128 | 0,75 | 0,072853 | 89,838 % | 6,9168 |
| Q3_K_M | 5,181 | 16 | 0,75 | 0,066111 | 90,158 % | 6,8574 |
| Q3_K_L | 5,372 | 16 | 0,75 | 0,062988 | 90,395 % | 6,8629 |
| IQ4_XS | 5,503 | 64 | 0,5 | 0,029253 | 93,778 % | 6,7584 |
| IQ4_NL | 5,740 | 16 | 0,5 | 0,029059 | 93,871 % | 6,7463 |
| Q4_K_S | 5,859 | 16 | 0,5 | 0,025652 | 94,313 % | 6,7207 |
| Q4_K_M | 6,172 | 32 | 0,5 | 0,022183 | 94,788 % | 6,7553 |
| Q4_1 | 6,206 | 32 | 0,75 | 0,027444 | 94,166 % | 6,7140 |
| Q3_K_XL | 6,262 | 16 | 0,5 | 0,059040 | 90,626 % | 6,7963 |
| Q5_K_S | 6,787 | 32 | 1 | 0,012212 | no disponible en el fragmento | no disponible en el fragmento |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre ~4 GB (IQ2_S, 3,97 GB de pesos) y ~7 GB (Q5_K_S, 6,79 GB), más el espacio para caché K/V y overhead del runtime.
- Cabe en GPU de consumo: sí. Q4_K_M (6,17 GB) e IQ4_XS (5,50 GB) caben en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070). Las variantes Q2/IQ2 caben en GPUs de 6 GB (RTX 2060, GTX 1660 Super con margen ajustado).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para ejecutar las variantes mayores con contexto de 64K sin offloading; A100/H100 no son necesarias para un modelo de 9,2 B, pero permiten mayor throughput en batch.
- Opciones de despliegue: BeeLlama.cpp v0.5.0 es obligatorio para las variantes SINQ (según el autor, SINQ solo está soportado en esa versión). llama.cpp estándar, Ollama o vLLM no están confirmados como compatibles con SINQ en la información proporcionada.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Qwen3.5-9B-GGUF-Bartowski-SINQ (este) | 9,2 B | 64K (evaluado) | GGUF + SINQ | Apache 2.0 | KLD media 0,0222 en Q4_K_M; requiere BeeLlama.cpp v0.5.0 |
| bartowski/Qwen_Qwen3.5-9B-GGUF | 9,2 B | no disponible | GGUF estándar | Apache 2.0 (heredada) | Receta de referencia; según el autor, mayor KLD media que la variante SINQ equivalente |
| Cuantizaciones Unsloth de Qwen3.5-9B | 9,2 B | no disponible | GGUF | Apache 2.0 (heredada) | Comparadas en las gráficas del autor; datos numéricos concretos no disponibles en el texto |

La comparativa se limita a variantes de cuantización del mismo modelo base; no se dispone de datos para comparar con modelos de otros desarrolladores de tamaño similar.

## Limitaciones y advertencias

- Dependencia de runtime: SINQ solo está soportado en BeeLlama.cpp v0.5.0 según el autor; otros runtimes (llama.cpp estándar, Ollama, vLLM, TGI) podrían no cargar o no aprovechar estas cuantizaciones.
- Pérdida de calidad medible: incluso la mejor variante reportada (Q5_K_S, KLD media 0,0122) diverge del BF16; las variantes de 2 bits (IQ2_S) alcanzan KLD media de 0,296 y Top-1 del 77,8 %, lo que implica degradación sustancial en generación.
- Sin benchmarks de tareas: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de visión, por lo que el impacto real de la cuantización en tareas downstream es desconocido.
- Idiomas no declarados: no se especifica qué lenguas soporta el modelo base ni su calidad relativa.
- Sesgos y alucinaciones: no documentados en la información proporcionada; deben asumirse los del modelo base Qwen3.5-9B, no evaluados aquí.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base (enlazada en la model card) y las condiciones de uso de BeeLlama.cpp.
- Repositorio de 162,1 GB: descargar el conjunto completo de cuantizaciones es costoso en almacenamiento; se recomienda descargar solo el archivo GGUF necesario.
- Sin likes ni validación comunitaria: el repositorio tiene 0 likes y 2.116 descargas en la fecha de los datos, por lo que la adopción y el soporte comunitario son limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Anbeeld/Qwen3.5-9B-GGUF-Bartowski-SINQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Recetario de cuantización de Bartowski: https://huggingface.co/bartowski/Qwen_Qwen3.5-9B-GGUF
- BeeLlama.cpp v0.5.0: https://github.com/Anbeeld/beellama.cpp
- Variante IQ2_S: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-IQ2_S-SINQ-w64-s0.5.gguf
- Variante Q4_K_M: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-Q4_K_M-SINQ-w32-s0.5.gguf
- Variante Q5_K_S: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-Q5_K_S-SINQ-w32-s1.gguf
