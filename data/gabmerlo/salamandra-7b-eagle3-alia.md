# gabmerlo/salamandra-7b-eagle3-alia

## Resumen

Salamandra-7b-eagle3-alia es un modelo borrador (draft model) de decodificación especulativa basado en la arquitectura EAGLE-3, desarrollado por el usuario gabmerlo. No es un modelo de lenguaje autónomo: su función es acelerar la inferencia de BSC-LT/salamandra-7b-instruct-2606 prediciendo los siguientes tokens, que el modelo objetivo verifica en paralelo. El resultado es una salida idéntica a la de Salamandra ejecutado solo, pero con una velocidad entre 1,8x y 2,2x superior en es, ca, eu y gl.

El modelo tiene 1.432.671.488 parámetros y se entrenó sobre 19.010 conversaciones generadas por el propio Salamandra (on-policy) a partir de prompts de ALIA-2606-SFT, usando la librería vllm-project/speculators en modo online con vLLM 0.33.0. Emplea un vocabulario reducido de los 32.000 tokens más frecuentes del corpus de entrenamiento y arrastra una copia congelada de la tabla de embeddings de Salamandra (256k tokens), lo que explica el tamaño del repositorio (10,3 GB) pese a su reducido número de parámetros.

Su relevancia práctica es directa: permite duplicar aproximadamente el throughput de Salamandra en producción sobre una única GPU H100, manteniendo exactitud bit a bit en la salida. Está pensado específicamente para el ecosistema de lenguas ibéricas (castellano, catalán, euskera y gallego) y para despliegues con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3 (draft model para decodificacion especulativa, con cabezas de prediccion sobre hidden states) |
| Parametros totales | 1.432.671.488 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de hasta 4000 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo base soporta GPTQ en variantes de 2B mencionadas en el repo) |
| Idiomas soportados | es, ca, eu, gl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo implementa un borrador EAGLE-3, una variante de decodificación especulativa que predice varios tokens futuros a partir de los estados ocultos del modelo objetivo. El borrador genera candidatos que Salamandra verifica en una sola pasada, aceptando los tokens correctos y descartando el resto. La salida final es idéntica a la del modelo objetivo; la ganancia es puramente de velocidad. El borrador usa un vocabulario restringido a los 32.000 tokens más frecuentes del corpus de entrenamiento y conserva una copia congelada de la tabla de embeddings de Salamandra (256k tokens), lo que no afecta al rendimiento pero eleva el tamaño del artefacto a 2,9 GB.

El entrenamiento se realizó con vllm-project/speculators 0.10.0a58 en modo online: vLLM 0.33.0 servía Salamandra y proporcionaba los hidden states mientras el borrador entrenaba, todo en una misma H100 de 80 GB. Los datos son 19.010 conversaciones on-policy (respuestas generadas por el propio Salamandra) derivadas de ALIA-2606-SFT, con 3 épocas, secuencias de hasta 4.000 tokens y aproximadamente 23 minutos por época. No se menciona uso de RLHF ni DPO; el entrenamiento es supervisado sobre las respuestas del modelo objetivo.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa EAGLE-3 sobre salamandra-7b-instruct-2606.
- Predicción de hasta 3 tokens especulativos por paso (`num_speculative_tokens: 3`).
- Entrenado específicamente para castellano, catalán, euskera y gallego.
- Compatible con servidores OpenAI-compatible de vLLM (endpoint `/v1/chat/completions`).
- Salida idéntica a la de Salamandra solo: no altera el contenido generado.
- Métricas de aceptación observables en los logs de vLLM (acceptance rate / mean acceptance length).
- No es un modelo generativo autónomo: no debe usarse sin el modelo objetivo.

## Casos de uso

- Despliegue de Salamandra en producción con el doble de throughput: sirviendo el borrador con `vllm serve gabmerlo/salamandra-7b-eagle3-alia`, vLLM descarga ambos modelos y aplica decodificación especulativa automáticamente, pasando de ~170 a ~344 tokens/s en una H100.
- Atención al cliente en castellano y catalán: el borrador acelera respuestas multi-turno de Salamandra sin cambiar su contenido, lo que reduce la latencia percibida en chats de soporte con temperatura 0.
- Generación de contenido en euskera y gallego: con speedups medidos de 2,01x y 2,03x respectivamente, resulta adecuado para pipelines de redacción o resumen en estas lenguas de bajos recursos.
- Servicios de traducción o paráfrasis asistida: al mantener la salida idéntica a Salamandra, se puede integrar en flujos donde la fidelidad del texto es crítica y solo se busca reducir coste computacional.
- Procesamiento por lotes de documentos: con 8 peticiones en paralelo se mantienen speedups de 1,81x a 2,19x, útil para tareas de extracción o clasificación a gran escala sobre corpus en lenguas ibéricas.
- Evaluación comparativa de estrategias de decodificación especulativa: el repositorio del autor incluye notebooks y comparativas frente a borradores GPTQ de 2B, lo que lo convierte en un banco de pruebas para investigar acceptance length y throughput.
- Reducción de costes en infraestructura GPU: al caber objetivo y borrador en una sola GPU de 40 GB o más, permite consolidar despliegues que de otro modo requerirían más hardware.

## Benchmarks y rendimiento

Resultados reportados por el autor en su split de validación tras la última época y en 20 prompts de test por idioma no vistos en entrenamiento (H100, vLLM 0.33.0, temperatura 0, hasta 512 tokens nuevos):

| Metrica | Valor |
|---|---|
| Acierto del 1er token | 66% |
| Acierto de los 2 primeros tokens | 44% |
| Acierto de los 3 tokens | 30% |
| Acceptance length (tokens/paso) | 2,36 – 2,60 |
| Speedup 1 peticion, es | 1,92x |
| Speedup 1 peticion, ca | 2,13x |
| Speedup 1 peticion, eu | 2,01x |
| Speedup 1 peticion, gl | 2,03x |
| Speedup 8 peticiones, es | 1,81x |
| Speedup 8 peticiones, ca | 1,99x |
| Speedup 8 peticiones, eu | 2,19x |
| Speedup 8 peticiones, gl | 2,13x |
| Throughput absoluto (1 peticion) | ~170 a ~344 tokens/s |

Las 80 respuestas de test fueron idénticas a las de Salamandra ejecutado solo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no genera texto de forma autónoma.

## Requisitos de hardware

- VRAM estimada: objetivo (7B) y borrador (1,4B) caben juntos en una GPU de 40 GB o más según el autor; el borrador ocupa 2,9 GB en disco.
- GPU probada: 1x H100 80 GB con vLLM 0.33.0.
- GPU recomendadas: H100, A100 40/80 GB; en consumer, una RTX 4090 (24 GB) podría no bastar para objetivo y borrador juntos en precisión nativa, aunque el modelo base dispone de variantes GPTQ de 2B mencionadas en el repositorio del autor.
- Despliegue: vLLM (versión 0.33.0 probada), con `--speculative-config` o sirviendo el borrador directamente. No se mencionan soportes para llama.cpp, Ollama o TGI.
- Latencia y throughput: ~344 tokens/s con 1 petición en H100 (frente a ~170 sin borrador); el speedup se reduce a alta concurrencia porque la GPU ya está ocupada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gabmerlo/salamandra-7b-eagle3-alia | 1,43B | no disponible | EAGLE-3 draft para Salamandra 7B | Apache 2.0 | Hugging Face |
| Borradores GPTQ de 2B (mencionados por el autor) | ~2B | no disponible | Draft alternativo comparado en el repo | no disponible | Repositorio del autor |
| BSC-LT/salamandra-7b-instruct-2606 (modelo objetivo) | 7B | no disponible | LLM completo para lenguas ibericas | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento de los borradores GPTQ de 2B en la información proporcionada; el autor remite a su repositorio de GitHub para la comparación.

## Limitaciones y advertencias

- Solo acelera; no genera texto por sí mismo. Requiere servir salamandra-7b-instruct-2606 como modelo objetivo.
- Entrenado únicamente en es, ca, eu y gl: en inglés u otros idiomas la acceptance length cae cerca de 1 y el speedup desaparece.
- El speedup se reduce a alta concurrencia, cuando la GPU ya está saturada.
- Riesgo de alucinación: heredado del modelo objetivo, no del borrador; la decodificación especulativa no altera el contenido generado.
- Sesgos: no documentados en la información disponible; al entrenarse sobre respuestas de Salamandra, puede reproducir los sesgos de este.
- El repositorio pesa 10,3 GB por la copia congelada de la tabla de embeddings de 256k tokens, lo que encarece el almacenamiento y la descarga.
- Dependencia de versión: probado solo con vLLM 0.33.0 y speculators 0.10.0a58; otras versiones pueden no ser compatibles.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento (CC BY 4.0, derivados de ALIA-2606-SFT) deben verificarse para cumplir sus condiciones de atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gabmerlo/salamandra-7b-eagle3-alia
- Modelo base: https://huggingface.co/BSC-LT/salamandra-7b-instruct-2606
- Dataset de entrenamiento: https://huggingface.co/datasets/gabmerlo/salamandra-7b-instruct-2606-onpolicy-alia
- Repositorio con gráficas, notebooks y comparativas: https://github.com/gabmerlo/salamandra-eagle3
- Librería de entrenamiento: https://github.com/vllm-project/speculators
- vLLM: https://github.com/vllm-project/vllm
