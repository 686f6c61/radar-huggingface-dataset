# ByteDance-Seed/Cola2

## Resumen

Cola2 es un modelo de lenguaje de latentes continuos desarrollado por ByteDance-Seed que co-adapta la compresión semántica y la generación discreta de texto. A diferencia de los transformers autorregresivos convencionales, combina un VAE de compresión dinámica, un Diffusion Transformer (DiT) de atención block-causal y un decodificador de tokens span-causal con retroalimentación de latentes. El modelo agrupa dinámicamente el texto en spans semánticos, representa cada span con un latente continuo compacto, genera bloques de latentes con el DiT y los materializa como tokens discretos.

El checkpoint publicado tiene 8.768.019.912 parámetros totales (aproximadamente 8,8B) y fue entrenado sobre 346.030 millones de tokens de origen. Según la model card, alcanza una media de 60,10 en ocho tareas de evaluación, superando a Llama-3-8B en HellaSwag y StoryCloze con más de 43 veces menos tokens de preentrenamiento reportados. El DiT de latentes del checkpoint liberado aún no ha convergido, lo que sitúa al modelo como una base experimental más que como un modelo listo para producción.

La relevancia de Cola2 reside en su exploración de un paradigma alternativo al autorregresivo puro: la generación en espacio latente continuo con decodificación discreta balanceada. Esto lo convierte en un objeto de estudio interesante para investigadores que trabajan en modelos de difusión para texto, compresión semántica y arquitecturas híbridas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: VAE de compresión dinámica + Diffusion Transformer (DiT) block-causal + decodificador de tokens span-causal con retroalimentación de latentes |
| Parámetros totales | 8.768.019.912 (8,77B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors, bfloat16 recomendado) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (8 archivos sharded), repo de 35,1 GB |

## Arquitectura y entrenamiento

Cola2 se estructura en dos etapas de entrenamiento. La etapa I entrena conjuntamente el codificador de compresión dinámica y el decodificador de tokens. La etapa II continúa adaptando ese VAE con supervisión del lado de los tokens mientras un DiT de aproximadamente 4B aprende la distribución de latentes separada (detached) mediante Flow Matching. En inferencia, el modelo propone repetidamente un bloque de latentes, decodifica tokens y re-codifica el texto confirmado bajo el esquema de spans fijo para mantener alineadas las historias continua y discreta.

El checkpoint liberado se entrenó sobre 346,03B tokens de origen. La model card menciona un estudio de escalado controlado que compara AR, LLaDA, Cola DLM, Cola-MDM sin compresión y Cola2-MDM con compresión, a igual tamaño de modelo, datos y evaluación. Cola-MDM muestra el mejor escalado agregado; Cola2-MDM converge más lentamente pero sigue cerrando su brecha con LLaDA tras unos 150B tokens y permanece sin saturar en torno a 210B tokens. El peso óptimo de classifier-free-guidance del decodificador se mantiene cerca de -0,9 durante la mayor parte del entrenamiento y se desplaza gradualmente hacia cero. No se especifica en la información disponible si hubo RLHF o DPO.

## Capacidades

- Generación de texto mediante decodificación en espacio latente continuo con materialización discreta de tokens.
- Razonamiento y respuesta a preguntas evaluados en tareas como MMLU, ARC-Easy y TruthfulQA.
- Comprensión lectora y narrativa evaluada en RACE, NarrativeQA, HellaSwag, StoryCloze y LAMBADA.
- Generación estocástica: cada valor de tarea reportado es la media de tres evaluaciones con muestreo de ruido latente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (existe documentación en chino en el repositorio, pero no se confirma soporte multilingüe del modelo).
- Capacidades especiales: modo de generación por bloques de latentes con control de classifier-free-guidance; no se reportan visión ni audio.

## Casos de uso

- Investigación en modelos de difusión para texto: Cola2 sirve como base reproducible para estudiar generación en espacio latente continuo frente a autorregresiva, con código de inferencia y benchmark runner en el repositorio de GitHub.
- Experimentos de compresión semántica: el VAE de compresión dinámica permite investigar cómo agrupar texto en spans semánticos y representarlos con latentes compactos, útil para líneas de trabajo en eficiencia de tokens.
- Evaluación comparativa de paradigmas: con los JSONL normalizados de ocho tareas incluidos en el repo, se puede reproducir la comparación frente a Llama-3-8B, Qwen2.5-7B, Qwen3-8B-Base y LLaDA-8B-Base bajo el protocolo documentado.
- Estudio de escalado controlado: el modelo permite analizar curvas de convergencia y el efecto del peso CFG del decodificador a lo largo del entrenamiento, como se documenta en las figuras del proyecto.
- Prototipado de decodificación estocástica: útil para aplicaciones donde la diversidad de salida controlada por ruido latente sea deseable, como generación de variantes de texto o aumentación de datos.
- Docencia y formación técnica: como ejemplo didáctico de arquitectura híbrida VAE + DiT + decodificador span-causal, con pesos abiertos y código de inferencia accesible.

## Benchmarks y rendimiento

Resultados reportados en la model card (precisión en %, media de tres evaluaciones con ruido latente para Cola2):

| Tarea | Llama-3-8B | Qwen2.5-7B | Qwen3-8B-Base | LLaDA-8B-Base | Cola2 |
|---|---:|---:|---:|---:|---:|
| Tokens de preentrenamiento | 15T+ | 18T | ~36T | 2,3T | 346B |
| RACE | 75,77 | 89,95 | 90,65 | 87,40 | 69,91 |
| NarrativeQA | 42,70 | 32,90 | 37,30 | 36,00 | 32,70 |
| HellaSwag | 39,21 | 75,67 | 68,13 | 69,65 | 41,75 |
| StoryCloze | 79,49 | 95,09 | 97,44 | 95,94 | 80,42 |
| LAMBADA | 75,70 | 71,82 | 71,20 | 67,90 | 63,00 |
| ARC-Easy | 90,86 | 96,00 | 97,35 | 93,85 | 87,62 |
| TruthfulQA | 63,04 | 69,03 | 72,58 | 64,87 | 54,10 |
| MMLU | 63,19 | 70,16 | 72,31 | 61,27 | 51,32 |
| Media 8 tareas | 66,25 | 75,08 | 75,87 | 72,11 | 60,10 |

La propia model card advierte que los modelos usan recetas de entrenamiento, tokenizadores y convenciones de conteo de tokens distintas, por lo que la tabla contextualiza la capacidad y no aísla el paradigma de generación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 8,77B parámetros en bfloat16, el peso ocupa aproximadamente 17,5 GB, más overhead de activaciones del VAE, DiT y decodificador; se recomienda holgura sobre esa cifra.
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño, una GPU con 24 GB o más (RTX 4090, A100, H100) es el punto de partida razonable; no se confirma soporte en GPUs de consumo con menos memoria.
- Cabe en GPU de consumo: no confirmado; el repo de 35,1 GB y los requisitos de bfloat16 sugieren que una RTX 4090 de 24 GB podría ser el mínimo práctico, pero no hay dato oficial.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requerido por código custom), PyTorch 2.2+, Transformers 4.51–4.x, safetensors 0.4+ y accelerate. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tokens de preentrenamiento | Media 8 tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cola2 | 8,77B | 346B | 60,10 | No disponible | Pesos abiertos en HF |
| Llama-3-8B | 8B | 15T+ | 66,25 | No disponible en la información | Pesos abiertos |
| Qwen2.5-7B | 7B | 18T | 75,08 | No disponible en la información | Pesos abiertos |
| Qwen3-8B-Base | 8B | ~36T | 75,87 | No disponible en la información | Pesos abiertos |
| LLaDA-8B-Base | 8B | 2,3T | 72,11 | No disponible en la información | Pesos abiertos |

La comparativa se limita a los datos de la model card. Cola2 es el único modelo de la tabla con paradigma de latentes continuos y difusión; el resto son autorregresivos o de difusión discreta. La longitud de contexto de los comparables no se detalla en la información proporcionada.

## Limitaciones y advertencias

- El DiT de latentes del checkpoint liberado aún no ha convergido, según la propia model card; el modelo es una base experimental, no un modelo afinado para producción.
- La generación es estocástica: cada evaluación se promedia sobre tres muestreos de ruido latente, por lo que los resultados pueden variar entre ejecuciones.
- Rendimiento inferior a los comparables en la mayoría de tareas del benchmark: media de 60,10 frente a 66,25 de Llama-3-8B y 72,11 de LLaDA-8B-Base.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no disponibles: no hay confirmación de capacidades multilingües.
- Longitud de contexto no disponible: limita la planificación de aplicaciones con ventanas largas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código custom del repositorio; conviene auditar los módulos antes de desplegar.
- No se incluye código de entrenamiento en la release, solo inferencia y herramientas de evaluación.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; dado el bajo rendimiento en TruthfulQA (54,10), cabe esperar respuestas factualmente poco fiables.
- No se reportan soporte de tool calling, agentes ni multimodalidad, lo que descarta su uso en pipelines que dependan de esas capacidades.

## Enlaces

- Hugging Face: https://huggingface.co/ByteDance-Seed/Cola2
- GitHub: https://github.com/ByteDance-Seed/Cola2
- README en chino: https://github.com/ByteDance-Seed/Cola2/blob/main/README_zh.md
- Paper (arXiv): https://arxiv.org/abs/2610.31305
- Página del proyecto: https://hongcanguo.github.io/Cola2/
- Resultados de referencia: https://github.com/ByteDance-Seed/Cola2/blob/main/eval_output/full_test_results.md
- Protocolo de reproducción: https://github.com/ByteDance-Seed/Cola2/blob/main/docs/reproduction.md
- Vídeo de presentación: https://github.com/ByteDance-Seed/Cola2/blob/main/assets/videos/cola2-v2-motion-bgm-1080p.mp4
