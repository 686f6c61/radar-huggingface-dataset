# dendriteholdings/Ingot-XXVI-27B-MLX-2bit

## Resumen

Ingot-XXVI-27B-MLX-2bit es un modelo de lenguaje de 27.359.638.768 parámetros (27,36 mil millones) publicado por dendriteholdings como espejo público del ganador de la competición Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que se mantiene más próxima a él. El modelo parte de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit, un modelo ternario de Prism ML, y el minero reajustó los pesos no ternarios para acercar la salida al profesor Qwen3.8-27B.

La relevancia técnica reside en el empaquetado: los pesos se almacenan como valores afines de 2 bits de MLX (códigos ternarios con escala fp16 y sesgo −d por cada bloque de 128 pesos), lo que da 2,25 bits por peso y un repositorio de 8,60 GB. Esto permite ejecutar un modelo de 27B en Apple Silicon con un consumo de memoria muy reducido, a costa de una fidelidad limitada respecto al profesor.

El formato utiliza el layout `prism_hadamard_qwen35`, que mlx-lm no carga de forma nativa; requiere el runtime MTPLX. Incluye una torre de visión, config, tokenizer y vectores de signo Hadamard heredados de Prism. La licencia y los idiomas soportados no están declarados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (layout `prism_hadamard_qwen35`, pesos ternarios empaquetados como MLX affine 2-bit) |
| Parámetros totales | 27.359.638.768 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2-bit ternario (2,25 bits por peso: códigos de 2 bits, escala fp16 y sesgo por bloque de 128 pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX affine 2-bit), 8,60 GB |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Ternary Bonsai 2 27B de Prism ML, cuyos pesos se representan en formato ternario: cada bloque de 128 pesos conserva sus códigos ternarios y una escala fp16 con sesgo −d, de modo que cada peso decodifica al mismo valor que usa el kernel GGUF. El minero reajustó los pesos restantes (los no ternarios) para minimizar la divergencia respecto al profesor Qwen3.8-27B, en el marco de la competición Ingot de Bittensor. La torre de visión, la configuración, el tokenizer y los vectores de signo Hadamard provienen de Prism y no se modifican en la competición.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La innovación destacable es el propio esquema de cuantización ternaria con escalas por bloque y la conversión sin pérdida desde el GGUF del minero, que preserva la equivalencia numérica con el kernel de llama.cpp. El repositorio no incluye cabeza draft MTP, por lo que la decodificación es de un token por paso salvo que se acople el drafter DFlash 2.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y generación de código, según los ejemplos de evaluación del autor (prompts de código en las mediciones de velocidad).
- Capacidades de visión: el modelo incorpora torre de visión heredada de Prism, aunque no se detallan las tareas concretas soportadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.
- Decodificación especulativa opcional mediante el drafter DFlash 2 (dendriteholdings/Ingot-27B-DFlash2-MLX), que eleva el throughput en modo greedy.

## Casos de uso

- Inferencia local en Apple Silicon: el empaquetado de 2,25 bits por peso y 8,60 GB permite ejecutar un modelo de 27B en equipos con memoria unificada moderada, sirviendo como asistente local sin conexión mediante MTPLX con API compatible con OpenAI.
- Generación de código en estación de trabajo: con el drafter DFlash 2 acoplado, la decodificación en respuestas de código alcanza unos 90 tok/s en un Mac Studio M3 Ultra, adecuado para autocompletado interactivo y revisión de parches.
- Despliegue de API compatible con OpenAI: `mtplx serve` expone el modelo en el puerto 8080, lo que facilita integrarlo en herramientas existentes que consuman la API de OpenAI sin cambios de cliente.
- Investigación sobre cuantización ternaria: el modelo sirve como referencia reproducible para estudiar la degradación KL respecto a un profesor BF16 y comparar esquemas de cuantización (MLX affine 2-bit frente a GGUF).
- Experimentación con decodificación especulativa: el par modelo + drafter DFlash 2 permite medir la ganancia de throughput en flujos greedy de un solo stream sobre hardware Apple.
- Evaluación de pipelines de Bittensor/Ingot: útil para replicar la métrica de fidelidad (KL y distancia de hidden states) y validar envíos de mineros frente al profesor.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad respecto al profesor BF16 (menor es mejor) y de velocidad de decodificación. No se aportan resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

| Métrica | Este modelo | El rey al que superó |
|---|---|---|
| KL(profesor ‖ modelo) por token de respuesta | 0,08216 | 0,08350 |
| Distancia de hidden states (media cada 8 capas) | 0,3102 | 0,3109 |

| Motor | Modo | Decode tok/s |
|---|---|---|
| MTPLX 2.12 (mlx 0.32) servidor | plain | 55,3 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, in-process | plain | 59,9 |
| Con drafter DFlash 2, greedy single-stream | especulativo | ~73 (hasta ~90 en código) |
| GGUF twin en fork de llama.cpp (Dendrite), mismo Mac | plain | 56,4 |
| GGUF twin en RTX PRO 6000 | plain | 137 |

Mediciones realizadas en un Mac Studio M3 Ultra (GPU de 80 núcleos, 512 GB). Los números de servidor corresponden a 256 tokens generados sobre un prompt de código vía HTTP; los in-process, a 128 tokens sin servidor.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 8,60 GB en safetensors; en ejecución hay que sumar overhead de activaciones y caché KV, por lo que se recomienda al menos 16 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (el benchmark usa un M3 Ultra con 512 GB); el twin GGUF alcanza 137 tok/s en una RTX PRO 6000.
- ¿Cabe en GPU de consumo? El formato MLX está pensado para Apple Silicon; en GPUs NVIDIA habría que usar el twin GGUF (dendriteholdings/Ingot-XXVI-27B-Q2) con el fork de llama.cpp de Dendrite.
- Opciones de despliegue: MTPLX (`mtplx serve`, API compatible con OpenAI) para el pack MLX; fork de llama.cpp de DendriteLabs para el GGUF; el drafter DFlash 2 se sirve con `ingot_dflash_mlx.py serve`.
- Latencia y throughput: 55,3 tok/s en servidor MTPLX y 59,9 tok/s in-process en M3 Ultra; ~73 tok/s con drafter y hasta ~90 en código.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXVI-27B-MLX-2bit | 27,36B | 2-bit ternario MLX (2,25 bpw) | no disponible | no disponible | HuggingFace (MLX) |
| Ingot-XXVI-27B-Q2 (mismo autor, GGUF) | 27,36B | 2-bit ternario GGUF | no disponible | no disponible | HuggingFace (GGUF), fork llama.cpp |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (base) | 27B (según nombre) | 2-bit ternario MLX | no disponible | no disponible | HuggingFace |
| prism-ml/Ternary-Bonsai-2-27B-gguf (base) | 27B (según nombre) | 2-bit ternario GGUF | no disponible | no disponible | HuggingFace |

No se dispone de datos de benchmarks estándar para establecer comparaciones de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización ternaria a 2,25 bits introduce degradación medible: KL de 0,08216 y distancia de hidden states de 0,3102 respecto al profesor BF16, lo que implica pérdida de fidelidad en la distribución de salida.
- Riesgo de alucinación inherente a un modelo de 27B cuantizado de forma agresiva; la información disponible no incluye evaluaciones de factualidad.
- Licencia no declarada: no se puede confirmar el uso comercial ni las restricciones de redistribución; conviene contactar con el autor antes de producción.
- Idiomas soportados no declarados; el rendimiento fuera del inglés (presumiblemente el idioma principal del profesor) no está verificado.
- Longitud de contexto no disponible, lo que impide planificar cargas con ventanas largas.
- El layout `prism_hadamard_qwen35` no lo carga mlx-lm de forma nativa: requiere MTPLX u otro runtime compatible, lo que limita las opciones de despliegue.
- Sin cabeza MTP en el repositorio, la decodificación es de un token por paso; la aceleración especulativa exige descargar y servir el drafter DFlash 2 por separado.
- El modelo es un espejo de un envío de minero de Bittensor; su procedencia y proceso de ajuste no están auditados de forma independiente más allá de las métricas del autor.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dendriteholdings/Ingot-XXVI-27B-MLX-2bit
- Twin GGUF del mismo autor: https://huggingface.co/dendriteholdings/Ingot-XXVI-27B-Q2
- Modelo base MLX: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Drafter especulativo DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- Runtime MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
