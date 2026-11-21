# austindixson/Inkling-2-Mini-IQ4_NL-GGUF

## Resumen

Inkling-2-Mini es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Thinking Machines, publicado bajo licencia Apache 2.0. Cuenta con 26.070.385.152 parámetros totales y está orientado a generación de texto con capacidades de razonamiento explícito (modo "thinking") y uso de herramientas. La ficha que nos ocupa no es el modelo original, sino una cuantización GGUF en formato IQ4_NL realizada por el usuario austindixson a partir de los pesos oficiales, pensada para ejecución local en Apple Silicon mediante llama.cpp.

La relevancia de esta conversión radica en que permite ejecutar un modelo MoE de 26B parámetros en hardware de consumo: el archivo ocupa 15.113.858.496 bytes (aproximadamente 14,1 GiB), lo que lo hace viable en equipos con 32-64 GB de memoria unificada. El autor documenta con detalle el proceso de cuantización, las métricas de fidelidad frente a los pesos nativos (KL media de 0,00770, perplejidad en wikitext-2 de 6,9611 frente a 6,8922 del modelo nativo) y el rendimiento en un Apple M3 Max.

El modelo base incorpora una arquitectura denominada `inkling2_loop` en llama.cpp, con un mecanismo de "loop-count" (número de pasadas) que, según las pruebas del autor, no es ajustable en la práctica sin degradar gravemente la calidad. Esta ficha se centra en la conversión GGUF, aunque recoge la información disponible sobre el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (identificador `inkling2_loop` en llama.cpp) |
| Parámetros totales | 26.070.385.152 (26,07B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el autor prueba con `-c 2048` y benchmarks a 4096) |
| Tipos de cuantización | IQ4_NL (222 tensores, incluido el embedding), Q5_1 (3 tensores `ffn_down_exps`, capas 0-2), Q6_K (1 tensor de salida), F32 (478 tensores) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE, identificado en llama.cpp como `inkling2_loop`. El sufijo "loop" hace referencia a un mecanismo de pasadas repetidas sobre el bloque de capas: según el autor, el modelo fue entrenado con 3 pasadas, y reducir ese número degrada la calidad de forma severa (2 pasadas: 1,39x más rápido en decodificación pero perplejidad 12,12; 1 pasada: 2,06x más rápido pero perplejidad 16,10, frente a 6,89 con 3 pasadas). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La conversión GGUF se realizó directamente desde los pesos oficiales, haciendo streaming de cada tensor por el cuantizador propio de llama.cpp, sin imatrix y sin archivo intermedio Q8_0. El autor advierte que el campo de metadatos `general.file_type` indica NVFP4, pero es un valor heredado de la conversión de origen y puramente cosmético; los tensores reales son los listados en la tabla. Asimismo, los tags "conversational" e "image-text-to-text" provienen del conversor, pero el archivo es solo texto. La conversión requiere llama.cpp en el commit `46eb174` o posterior (PR #32694, que integra el soporte de Inkling 2).

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento explícito en modo "thinking": el modelo produce un bloque `[Start thinking]` ... `[End thinking]` antes de la respuesta final, como se observa en el ejemplo del autor (17×23 = 391).
- Aritmética y razonamiento paso a paso.
- Uso de herramientas (tool calling): el autor evalúa el modelo con un conjunto de herramientas y con ToolAlpaca, aunque reporta un rendimiento inferior al de referencia (31/97 en ToolAlpaca frente a 41/97 del modelo comparado).
- Razonamiento multi-paso y agentes: el modelo razona incluso con `reasoning_effort` en "none", lo que obliga a aumentar `max_tokens` (4000 frente a 1000 del comparado).
- Categorización de transacciones: 76,5/92 de media en la prueba del autor.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Sin capacidades de visión ni audio: el archivo es solo texto.

## Casos de uso

- Asistencia aritmética y matemática paso a paso: el modo thinking permite obtener la cadena de razonamiento completa antes del resultado, útil en entornos educativos o de verificación de cálculos.
- Clasificación y categorización de transacciones financieras: el autor obtiene 76,5/92 en una prueba de categorización de 92 transacciones, un rendimiento comparable al de modelos locales más rápidos, lo que lo hace adecuado para pipelines de etiquetado batch en local.
- Automatización de tareas con tool calling en local: integrable mediante llama.cpp en flujos donde el modelo invoca funciones definidas por el desarrollador, aunque con la advertencia de que su rendimiento en ToolAlpaca es moderado (31/97).
- Prototipado y experimentación en Apple Silicon: al ocupar 14,1 GiB y ejecutarse con Metal, permite probar un MoE de 26B en un Mac sin GPU dedicada.
- Generación de texto en inglés con razonamiento verificable: útil para tareas donde se necesita auditar el proceso de razonamiento (por ejemplo, resolución de problemas lógicos o análisis de casos).
- Evaluación comparativa de cuantizaciones: el repositorio incluye métricas de KL y perplejidad frente a los pesos nativos, lo que lo convierte en un caso de referencia para estudiar el impacto de IQ4_NL en modelos MoE.
- Inferencia por lotes offline: con 29,3 tok/s de decodificación en M3 Max, es viable para procesar documentos en lotes nocturnos donde la latencia no es crítica.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad de la cuantización y de velocidad, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K). Los datos disponibles son:

| Métrica | Resultado |
|---|---|
| KL media última posición (IQ4_NL vs MLX nativo) | 0,00770 |
| Top-1 última posición / todas las posiciones (vs MLX nativo) | 7/8 / 117/124 = 0,944 |
| KL media última posición (vs referencia mlx-vlm) | 0,00673 |
| Top-1 última posición / todas las posiciones (vs mlx-vlm) | 7/8 / 120/124 |
| Perplejidad wikitext-2 (65.504 tokens puntuados, 32 ventanas de 2048) | 6,9611 (nativo MLX: 6,8922; ratio 1,010x) |
| Prefill (M3 Max, `llama-bench -ngl 99 -fa 1 -p 4096 -n 128 -r 5`) | 318,25 ± 35,89 tok/s |
| Decodificación (misma prueba) | 29,30 ± 0,18 tok/s |
| Prompt processing en `llama-cli` (`-c 2048 -n 300`) | 92,7 tok/s |
| Generación en `llama-cli` | 29,3 tok/s |

Comparación con el build MLX 4-bit del mismo modelo en la misma máquina: prefill 752,5 ± 57,5 tok/s y decodificación 45,60 ± 0,15 tok/s, es decir, MLX decodifica 1,56x más rápido que este GGUF.

Comparación con el modelo local "Flash" (medida con el build MLX 4-bit, no con este GGUF):

| Evaluación | Inkling 4-bit MLX (low) | Flash |
|---|---|---|
| Conjunto pequeño de herramientas, aprobados /12 | 9 | 9 |
| Mediana de tiempo total en caliente | 1,92 s | 0,64 s (3,0x más lento) |
| Latencia "What is 17*23?" | 1,10 s | 0,10 s |
| Decodificación en cliente, mediana | 42,0 tok/s | 54,4 tok/s |
| ToolAlpaca, correctos /97 | 31 | 41 |
| Categorización de 92 transacciones, media de dos brazos | 76,5/92 (79, 74) | 74,5/92 (74, 75) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el archivo GGUF ocupa 14,1 GiB; se necesita al menos esa cantidad más el espacio para el contexto KV. En Apple Silicon con memoria unificada, 32 GB es el mínimo razonable; 64 GB o más permite contextos amplios.
- GPU recomendadas: probado en Apple M3 Max de 128 GB con backend Metal. No se documentan pruebas en GPU NVIDIA o AMD.
- GPU de consumo: cabe en equipos Apple Silicon de gama alta (M2 Max, M3 Max, M4 Max) y en GPUs con 16-24 GB de VRAM si el offload es total, aunque no hay datos de rendimiento en esas plataformas.
- Opciones de despliegue: llama.cpp en el commit `46eb174` o posterior (obligatorio, por el soporte de `inkling2_loop`). Ejemplo del autor: `llama-cli -m Inkling-2-Mini-IQ4_NL.gguf -ngl 99 -fa on -c 2048 -n 300 --temp 0 -st -p "What is 17*23?"`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 318,25 tok/s de prefill y 29,30 tok/s de decodificación en M3 Max; 92,7 tok/s de prompt processing y 29,3 tok/s de generación en `llama-cli`. El autor no registró el pico de memoria de llama.cpp.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-IQ4_NL (este) | 26,07B totales (MoE) | no disponible | Apache 2.0 | GGUF IQ4_NL | 14,1 GiB; 29,3 tok/s decode en M3 Max |
| Inkling-2-Mini-MLX-4bit (mismo autor) | 26,07B totales (MoE) | no disponible | Apache 2.0 | MLX 4-bit | 45,60 tok/s decode en M3 Max; 1,56x más rápido que este GGUF |
| IQ4_NL de ggml-org | 26,07B totales (MoE) | no disponible | Apache 2.0 | GGUF IQ4_NL | ~17,6 GB; receta distinta, calidad no verificada |
| "Flash" (modelo local de referencia) | no disponible | no disponible | no disponible | MLX (pack no publicado) | Usa decodificación especulativa y KV cache 4-bit; 54,4 tok/s decode |

## Limitaciones y advertencias

- El campo `general.file_type` del GGUF indica NVFP4 de forma incorrecta (valor heredado y cosmético); los tensores reales son IQ4_NL, Q5_1, Q6_K y F32.
- Los tags "conversational" e "image-text-to-text" son heredados del conversor; el archivo es solo texto y no procesa imágenes.
- El ajuste de pasadas (loop-count) no es usable: el modelo fue entrenado con 3 pasadas y reducirlas degrada la perplejidad de 6,89 a 12,12 (2 pasadas) o 16,10 (1 pasada).
- No existe build Q8_0 ni NVFP4 nativo de este modelo; la conversión Q8_0 se abandonó por falta de espacio en disco.
- Idiomas: solo inglés según los metadatos; no se documenta soporte multilingüe.
- Riesgo de alucinación: no evaluado en la información disponible; el modo thinking puede aumentar la longitud de salida y el consumo de tokens.
- Tool calling moderado: 31/97 en ToolAlpaca, inferior a los 41/97 del modelo de referencia.
- Requiere llama.cpp en el commit `46eb174` o posterior; versiones anteriores no soportan la arquitectura `inkling2_loop`.
- El autor solo probó el build con backend Metal en Apple Silicon; no hay datos de rendimiento en CUDA, ROCm ni CPU.
- Las comparaciones de latencia con "Flash" se hicieron con el build MLX 4-bit, no con este GGUF, y Flash usaba decodificación especulativa y KV cache 4-bit, lo que favorece a Flash en velocidad.
- Las pruebas de capacidad se hicieron con conjuntos pequeños (12, 92 y 97 elementos), por lo que los resultados tienen intervalos de confianza amplios.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la calidad de la cuantización ni sobre el comportamiento del modelo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/austindixson/Inkling-2-Mini-IQ4_NL-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio hermano MLX 4-bit: https://huggingface.co/austindixson/Inkling-2-Mini-MLX-4bit
- llama.cpp (commit de referencia `46eb174`, PR #32694): https://github.com/ggml-org/llama.cpp
