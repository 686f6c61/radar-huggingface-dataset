# f3nc3r/DavidAU-Qwen3.8-27B-Ultimate_miniQuant

## Resumen

DavidAU-Qwen3.8-27B-Ultimate_miniQuant es un conjunto de cuantizaciones GGUF de muy baja precisión (por debajo de 2,2 bits por peso) del modelo DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, un fine-tune de la familia Qwen 3.8 de 27B. Lo publica el usuario f3nc3r en Hugging Face y su objetivo es comprimir un modelo de 26.900 millones de parámetros hasta unos 7,4-7,6 GB de huella en disco, de modo que pueda ejecutarse en CPU con memoria RAM convencional sin GPU dedicada.

La propuesta técnica combina dos técnicas de cuantización: SQMP (Structural Mixed-Precision), que asigna precisiones distintas por tipo de tensor (embeddings en Q4_K, LM head en Q6_K, proyecciones QKV de atención en IQ2_K), e imatrix (matriz de importancia basada en la curvatura Hessiana de las activaciones), que optimiza los codebooks de los tensores menos sensibles de las capas feed-forward y de los operadores SSM. El resultado son dos checkpoints: IQ2_KS (2,18 BPW, 7.649 MB) e IQ2_XXS (2,06 BPW, 7.395 MB).

Es relevante porque demuestra que un modelo de 27B con atención híbrida/SSM puede mantener coherencia factual, aritmética y de código a ~2 BPW, algo que recetas alternativas (ternarias, binarias o destiladas) no consiguen según los benchmarks del propio autor. La contrapartida es que requiere un fork específico de llama.cpp (fencerJP/llama.cpp-miniQuant) con soporte nativo para la arquitectura Qwen 3.8 y kernels AVX-512.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido atención/SSM (familia Qwen 3.8), según la model card |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ2_KS + SQMP + imatrix (2,18 BPW); IQ2_XXS + SQMP + imatrix (2,06 BPW) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de la familia Qwen 3.8 con atención híbrida y operadores SSM (state space models), según indica la model card al describir el soporte nativo del motor de inferencia. Cuenta con 5.120 canales ocultos y 26,9B parámetros. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

La innovación de esta publicación no está en el entrenamiento sino en la cuantización. SQMP aplica una política de precisión mixta estructural: preserva `token_embd` en Q4_K para evitar el colapso de las distancias entre embeddings, mantiene la LM head en Q6_K para no aplanar la distribución de salida y conserva las proyecciones QKV en IQ2_K para evitar la degeneración de rango en las cabezas de atención. Sobre esa base, imatrix estima la curvatura Hessiana empírica (H = XX^T) sobre un corpus de calibración multidominio y resuelve codebooks de cuantización vectorial óptimos para los parámetros menos relevantes de las FFN y de los operadores SSM. El autor argumenta que los 5.120 canales ocultos distribuyen el ruido de cuantización en un espacio mayor que en modelos de 4B, lo que permite mantener razonamiento factual y matemático a 2,06 BPW.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento factual: responde correctamente a preguntas de física con conversión de unidades (punto de ebullición del nitrógeno líquido a 77 K, con la conversión T − 273,15).
- Razonamiento matemático: completa secuencias numéricas siguiendo patrones (n(n+1): 2, 6, 12, 20, 30, 42, 56, 72…).
- Generación de código: sintetiza funciones Python correctas (por ejemplo, comprobación de palíndromos con `word == word[::-1]`).
- Capacidad multilingüe limitada: la model card declara únicamente inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Inferencia en CPU sin GPU: el checkpoint IQ2_XXS ocupa 7.395 MB y permite ejecutar un modelo de 27B en equipos con ~8 GB de RAM libre, útil para estaciones de trabajo sin acelerador dedicado.
- Despliegue en portátiles y mini-PC: con el checkpoint IQ2_KS (7.649 MB) se obtiene un throughput de 7,68 t/s en un AMD de 12 núcleos con AVX-512, suficiente para asistentes conversacionales interactivos en local.
- Prototipado y experimentación con modelos grandes en entornos con recursos limitados: permite validar prompts, plantillas y flujos conversacionales antes de migrar a una versión de mayor precisión en servidor.
- Generación de código en local para tareas sencillas: el modelo produce funciones Python correctas a 2 BPW, lo que sirve para autocompletado o snippets en entornos de desarrollo sin conexión.
- Educación y demostraciones técnicas: útil para explicar técnicas de cuantización extrema (SQMP, imatrix, BPW) con un caso reproducible y benchmarks deterministas.
- Investigación en compresión de modelos: sirve como referencia para comparar recetas de cuantización sub-2,5 BPW frente a alternativas ternarias o binarias, con la tabla comparativa del autor como punto de partida.
- Asistencia factual offline: respuestas a preguntas de ciencia con conversión de unidades en entornos air-gapped, donde no se puede recurrir a APIs en la nube.

## Benchmarks y rendimiento

Los benchmarks publicados por el autor son tres pruebas cualitativas de cordura (no benchmarks académicos completos), ejecutadas con decodificación greedy determinista (`--temp 0 -n 64 --repeat-penalty 1.0`) sobre un AMD x86_64 de 12 núcleos / 24 hilos con AVX-512, AVX512_VBMI, AVX512_VNNI y AVX512_BF16.

| Modelo | Huella | BPW | Velocidad | Física (N₂) | Secuencia matemática | Código Python |
|---|---|---|---|---|---|---|
| IQ2_KS + SQMP + imatrix | 7.649 MB | 2,18 | 7,68 t/s | Correcto (77 K) | Exacto (42, 56, 72…) | Correcto (`word[::-1]`) |
| IQ2_XXS + SQMP + imatrix | 7.395 MB | 2,06 | 5,90 t/s | Correcto (77 K) | Correcto (42) | Correcto (`word[::-1]`) |
| IQ2_XS + imatrix (baseline) | 7.921 MB | 2,31 | 6,45 t/s | Correcto (77 K) | Correcto (42) | Correcto |
| Recipe D (IQ2_XXS + SQMP sin calibrar) | 7.300 MB | 2,06 | 5,80 t/s | Coherente | Correcto | Sintaxis limpia |
| PQ2_0 (ternario + SQMP + imatrix) | 7.495 MB | 2,13 | 7,81 t/s | Fallo (texto corrupto) | Fallo | Fallo |
| Recipe A (PTQ1_0 ternario en cascada) | 5.528 MB | 1,54 | 8,85 t/s | Fallo (bucles) | Fallo | Fallo |
| Recipe B (PTQ1_0 + destilación AdamW) | 7.910 MB | 2,20 | 6,50 t/s | Alucinación | Lógica degradada | Deriva sintáctica |
| Recipe C (IQ2_BN binario) | 8.300 MB | 2,31 | 6,20 t/s | Inestable | Degradado | Código roto |
| TQ2_0 (dual-binario + AdamW) | 7.612 MB | 2,12 | 7,15 t/s | Deriva factual menor | Lógica correcta, aritmética con deriva | Correcto |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en GPU; el autor publica resultados en CPU. Para uso en GPU haría falta al menos ~8-9 GB de VRAM para cargar los 7,4-7,6 GB de pesos más el contexto.
- RAM: ~8 GB libres para IQ2_XXS (7.395 MB) y ~8 GB para IQ2_KS (7.649 MB), más el espacio del contexto KV.
- GPU recomendadas: no disponibles en la información proporcionada; el motor de referencia es CPU con AVX-512.
- ¿Cabe en GPU de consumo? Por tamaño de pesos, sí en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070), aunque no hay validación publicada de este fork en GPU.
- CPU: se requieren extensiones AVX-512, AVX512_VBMI, AVX512_VNNI y AVX512_BF16; el benchmark se ejecutó en un AMD x86_64 de 12 núcleos / 24 hilos.
- Opciones de despliegue: exclusivamente el fork fencerJP/llama.cpp-miniQuant (commit faec5d9), compilado con `-DGGML_AVX512=ON -DGGML_AVX512_VBMI=ON -DGGML_AVX512_VNNI=ON -DGGML_AVX512_BF16=ON`. No se garantiza compatibilidad con llama.cpp upstream, Ollama, vLLM ni TGI.
- Throughput: 7,68 t/s (IQ2_KS) y 5,90 t/s (IQ2_XXS) en el hardware de referencia, con decodificación greedy.
- Almacenamiento: PCIe 4.0 NVMe recomendado por el autor para el array de scratch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BPW / formato | Rendimiento | Licencia |
|---|---|---|---|---|---|
| DavidAU-Qwen3.8-27B-Ultimate_miniQuant (IQ2_KS) | 26,9B | no disponible | 2,18 BPW, GGUF | 7,68 t/s CPU; 3/3 pruebas correctas | apache-2.0 |
| DavidAU-Qwen3.8-27B-Ultimate_miniQuant (IQ2_XXS) | 26,9B | no disponible | 2,06 BPW, GGUF | 5,90 t/s CPU; 3/3 pruebas correctas | apache-2.0 |
| IQ2_XS + imatrix (baseline del autor) | 26,9B | no disponible | 2,31 BPW, GGUF | 6,45 t/s CPU; 3/3 pruebas correctas | apache-2.0 |
| PQ2_0 ternario + SQMP + imatrix | 26,9B | no disponible | 2,13 BPW, GGUF | 7,81 t/s CPU; 0/3 pruebas correctas | apache-2.0 |
| Recipe A PTQ1_0 ternario en cascada | 26,9B | no disponible | 1,54 BPW, GGUF | 8,85 t/s CPU; 0/3 pruebas correctas | apache-2.0 |

No se dispone de comparación con modelos de otras familias (Llama, Mistral, Gemma) en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés declarado; no hay evidencia de capacidades multilingües y el modelo base es un fine-tune "uncensored" sin evaluación publicada de sesgos.
- Riesgo de alucinación: la receta Recipe B del propio autor muestra que variantes destiladas producen texto fluido con alucinaciones; aunque los checkpoints publicados pasan las pruebas, a 2 BPW el margen de error factual es estrecho y no hay evaluación a gran escala.
- Dependencia de un fork no estándar de llama.cpp (fencerJP/llama.cpp-miniQuant): no funciona con llama.cpp upstream, Ollama, vLLM ni TGI, lo que complica el despliegue en producción y la portabilidad.
- Requiere CPU con AVX-512 y extensiones VBMI, VNNI y BF16; en hardware sin estas instrucciones el rendimiento caerá drásticamente o no compilará.
- Los benchmarks publicados son tres pruebas cualitativas de una sola generación cada una, no una evaluación estadísticamente significativa; no hay MMLU, HumanEval ni GSM8K.
- No se especifica la longitud de contexto soportada ni el coste de memoria del KV cache, dato crítico para planificar despliegues.
- El modelo base es un fine-tune "Heretic-Uncensored": puede generar contenido sin los filtros habituales; revisar políticas de uso antes de exponerlo a usuarios finales.
- Licencia apache-2.0 declarada, lo que permite uso comercial, pero conviene verificar que el modelo base y los datos de calibración no impongan restricciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/f3nc3r/DavidAU-Qwen3.8-27B-Ultimate_miniQuant
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Motor de inferencia (fork llama.cpp): https://github.com/fencerJP/llama.cpp-miniQuant
