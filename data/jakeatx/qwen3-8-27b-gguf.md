# jakeatx/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es un repositorio de cuantizaciones publicado por el usuario jakeatx (no por el equipo de Qwen) sobre la base Qwen3.8-27B, un modelo de lenguaje de 27.320.697.856 parámetros (~27,3 mil millones). El repositorio agrupa distintas variantes en formato GGUF, desde una versión ternaria de 1,75 bpw hasta cuantizaciones IQ4_XS de 4,56 bpw, además de fine-tunes derivados (Swift Uncensored, Qwopus3.8 Flash) y configuraciones de decodificación especulativa con MTP (multi-token prediction) nativo de una capa. La licencia declarada es Apache 2.0.

El rasgo diferencial del repositorio es su orientación explícita al hardware Ampere SM86 (RTX 3090 y 3090 Ti) mediante el runtime llamAmpere, con atención LSA y KV cache offloaded a host para permitir contextos muy largos en tarjetas de 8, 10 y 12 GB de VRAM. El autor publica métricas de deriva (KLD) y de calidad frente a recetas de cuantización de Unsloth, así como resultados direccionales en LiveCodeBench v6.

Es relevante ahora porque demuestra que un modelo de 27B puede ejecutarse con 262.144 tokens de contexto y decodificación especulativa en GPUs de consumo de gama media-baja, a costa de depender de un runtime no publicado (llamAmpere 0.7) y de sidecars adicionales. El contexto máximo declarado es de 262.144 tokens en las variantes de 12 GB y 8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B; tag `qwen3_5`); variante ternaria basada en Prism ML Ternary Bonsai 2 27B |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (variantes 12 GB y ternaria); 245K poblados en ATX-4-XS; 212.992 en variante AI2 de 10 GB; 204.800 en variante de 8 GB |
| Tipos de cuantizacion | PTQ1_0 ternario (1,75 bpw), ATX-IQ4_XS-M (4,56 bpw), IQ4_XS-M (4,56 bpw), ATX mixed ~3,3 bpw, ~2,1 bpw on-card, 2,3 bpw (AI2) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el recuento de parametros) |

## Arquitectura y entrenamiento

La información disponible no detalla el entrenamiento del modelo base Qwen3.8-27B (número de tokens, composición del dataset, uso de RLHF/DPO). El repositorio se limita a distribuir cuantizaciones y fine-tunes sobre esa base, identificada con el tag `qwen3_5`, junto con una variante ternaria derivada de Prism ML Ternary Bonsai 2 27B. No se especifica si la arquitectura es densa o MoE; el recuento de parámetros totales y la ausencia de parámetros activos apuntan a un modelo denso.

La innovación técnica destacable es la integración de MTP (multi-token prediction) nativo de una capa para decodificación especulativa, junto con atención LSA y KV cache offloaded a host en el runtime llamAmpere. Las variantes de 8 GB incorporan además overlays de draft (`mtp-dm.gguf`, `head-ait2.gguf`) y una cabeza de rescoring exacta en F16 (`head-exact-f16.gguf`), más un mapa de índices LSA (`lsa-qwen38-27b-d2048.gguf`) compartido por ambas tallas pequeñas. El autor reporta métricas de deriva frente a BF16 de Swift 1.5 sobre 16.200 posiciones (coding, agentic y RAG a ~12K de contexto).

## Capacidades

- Generación de texto conversacional (tag `conversational` en el repositorio).
- Razonamiento y código: el autor evalúa en LiveCodeBench v6 con grader estricto.
- Decodificación especulativa con MTP nativo (`--spec-type draft-mtp`), con hasta 3 tokens de draft (`--spec-draft-n-max 3`).
- Soporte de contextos largos: hasta 262.144 tokens en las variantes de 12 GB y ternaria.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Variantes sin censura (Swift Uncensored) y fine-tunes derivados (Qwopus3.8 Flash).
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible de forma explícita, aunque las métricas de KLD incluyen escenarios agentic.

## Casos de uso

- Asistencia de código en local sobre RTX 3090: la variante ATX 12 GB ejecuta el contexto completo de 262K con MTP en 11.544 MiB medidos, lo que permite cargar repositorios medianos y mantener conversaciones de refactorización largas sin truncar.
- RAG de documentos extensos en GPU de 12 GB: el contexto de 262.144 tokens permite indexar corpus de decenas de miles de tokens directamente en el prompt, con la ventaja de que el archivo de 12 GB tiene un 54% menos de deriva (KLD 0,0270) que la receta UD-Q2_K_XL de Unsloth.
- Despliegue en estaciones con 8 GB de VRAM: la variante de 8 GB (7.506 MiB medidos) con 204.800 tokens de contexto y MTP hace viable un asistente conversacional de contexto largo en tarjetas de gama de entrada.
- Evaluación comparativa de cuantizaciones: el repositorio publica KLD y Top-1 sobre las mismas 16.200 posiciones, lo que permite comparar recetas de cuantización con una metodología reproducible.
- Investigación sobre decodificación especulativa: la combinación de MTP nativo, overlays de draft y cabeza de rescoring exacta sirve como banco de pruebas para medir aceleración y calidad en SM86.
- Generación de código en pipelines internos: el resultado direccional de LiveCodeBench v6 (89% frente al 87% de UD-Q2_K_XL y 90,3% del BF16 publicado) y la reducción del 33% en tokens de salida (mediana 4.608 frente a 8.932) abaratan el coste por tarea en entornos con presupuesto de VRAM ajustado.
- Fine-tunes sin censura para investigación: la variante Swift Uncensored IQ4_XS-M (15,58 GiB) permite estudiar comportamiento del modelo sin las restricciones del ajuste original.

## Benchmarks y rendimiento

Métricas de deriva frente a Swift 1.5 BF16 sobre 16.200 posiciones (coding, agentic y RAG a ~12K de contexto):

| Archivo | Tamano | KLD (menor mejor) | Top-1 |
|---|---:|---:|---:|
| ATX 12 GB | 11,24 GB | 0,0270 | 95,98% |
| Unsloth UD-IQ3_XXS | 10,93 GB | 0,0396 | 95,33% |
| Unsloth UD-Q2_K_XL | 9,95 GB | 0,0591 | 94,00% |
| ATX AI2 2,3 bpw (10 GB) | 9,14 GB | 0,0593 | 94,06% |
| Mirai S | no disponible | 0,0745 | no disponible |

LiveCodeBench v6 (100 problemas, una semilla, grader estricto; el autor lo califica de direccional y no estadísticamente significativo):

| Modelo | Acierto |
|---|---:|
| Qwen BF16 publicado | 90,3% |
| ATX 12 GB | 89% |
| UD-Q2_K_XL | 87% |

Eficiencia de salida en LiveCodeBench v6: el archivo de 12 GB usó un 33% menos de tokens (mediana 4.608 frente a 8.932; rango del 95%: 22-44% menos), y fue más corto en 74 de 100 problemas.

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: 5,81 GiB (ternaria 1,75 bpw); 7,33 GB (variante 8 GB, 7.506 MiB medidos); 9,14 GB (AI2 2,3 bpw); 11,24 GB (variante 12 GB, 11.544 MiB medidos); 14,52 GiB (ATX-4-XS, 245K de contexto en 22,6 GB listos); 15,58 GiB (Swift Uncensored y Qwopus Flash IQ4_XS-M).
- GPU objetivo: Ampere SM86 (RTX 3090 y 3090 Ti) mediante llamAmpere. No se declara soporte para A100, H100 ni otras arquitecturas.
- Cabe en GPU de consumo: sí, en RTX 3090/3090 Ti con las variantes de 12 GB y 8 GB; también en tarjetas de 8, 10 y 12 GB según la tabla del autor.
- Despliegue: llamAmpere (build SM86 con `GGML_CUDA=ON`, `GGML_CUDA_FA=ON`, `CMAKE_CUDA_ARCHITECTURES=86`), servidor `llama-server` con presets `12dense` y `8dense`. Las variantes de tarjeta pequeña requieren llamAmpere 0.7, aún no publicada.
- Parámetros de ejecución sugeridos: `-c 32768 -b 4096 -ub 1024 -t 8 -ngl 99 -fa on -ctk q8_0 -ctv turbo3 --spec-type draft-mtp --spec-draft-n-max 3 --spec-draft-p-min 0`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KLD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B ATX 12 GB | ~27,3 B | 262.144 | 0,0270 | Apache 2.0 | GGUF en este repo; requiere llamAmpere 0.7 |
| Unsloth UD-Q2_K_XL de Swift 1.5 | ~27,3 B | no disponible | 0,0591 | Apache 2.0 (heredada) | GGUF de Unsloth |
| Unsloth UD-IQ3_XXS de Swift 1.5 | ~27,3 B | no disponible | 0,0396 | Apache 2.0 (heredada) | GGUF de Unsloth |
| ATX AI2 2,3 bpw (10 GB) | ~27,3 B | 212.992 | 0,0593 | Apache 2.0 | GGUF en repo enlazado |

Comparativa de rendimiento: no disponible más allá de los datos de KLD y LiveCodeBench recogidos arriba.

## Limitaciones y advertencias

- El repositorio lo mantiene un autor individual (jakeatx), no el equipo oficial de Qwen; no hay garantía de continuidad ni de auditoría independiente.
- Las variantes de 8 y 12 GB dependen de llamAmpere 0.7, que el propio autor indica como "coming, not yet released"; los comandos `--preset` no funcionan hasta su publicación.
- Las variantes de tarjeta pequeña requieren sidecars adicionales en la misma carpeta (`lsa-qwen38-27b-d2048.gguf`, y para 8 GB `mtp-dm.gguf`, `head-ait2.gguf`, `head-exact-f16.gguf`); un despliegue incompleto falla.
- El resultado de LiveCodeBench v6 se basa en una sola semilla; el autor lo califica explícitamente de direccional y no estadísticamente significativo.
- La información sobre idiomas soportados, tool calling, sesgos y riesgo de alucinación no está disponible en la documentación proporcionada.
- Las variantes "Uncensored" eliminan restricciones de alineamiento y requieren revisión adicional antes de cualquier uso en producción orientado al usuario final.
- El repositorio ocupa 74,8 GB; conviene descargar solo los archivos necesarios y verificar los SHA-256 publicados.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base y de los fine-tunes de terceros, cuyos términos no se detallan.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jakeatx/Qwen3.8-27B-GGUF
- Variante AI2 2,3 bpw (10 GB): https://huggingface.co/jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2
- Paper, blog, repositorio de llamAmpere y demos: no disponible
