# sabicap/sabi-noema

## Resumen

Sabi-Noema es un ajuste fino (finetune) del modelo Qwen3.8-27B desarrollado por sabicap, orientado a tareas agénticas: uso de herramientas, ejecución en terminal, ingeniería de software y razonamiento multi-paso. Se construye exclusivamente sobre entornos de aprendizaje por refuerzo de código abierto, lo que lo convierte en un caso interesante de cómo el RL abierto puede llevar a un modelo denso de 27B a competir con modelos propietarios en benchmarks agénticos.

El modelo mantiene la arquitectura del Qwen3.8-27B base (transformer denso híbrido con atención lineal, ~27.356 millones de parámetros) y una ventana de contexto de 262.144 tokens. Su propuesta de valor no es tanto la capacidad bruta como la eficiencia: según la model card, reduce el consumo de tokens de salida en un factor de 2,3× frente al base en tareas de Terminal-Bench, manteniendo o mejorando las puntuaciones.

Es relevante ahora porque demuestra que un modelo abierto de tamaño medio, con licencia Apache 2.0 y desplegable en una sola GPU de 80 GB, puede alcanzar resultados competitivos en agentes de terminal (76,0% en Terminal-Bench 2.1) y reducir drásticamente la tasa de alucinación (15,1% frente al 30,4% del base) sin sacrificar capacidades retenidas como LiveCodeBench o GPQA-Diamond.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (hybrid-attention, con atención lineal) |
| Parametros totales | 27.356.728.560 (~27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16 en pesos originales; conversión GGUF disponible vía llama.cpp (no se detallan otros formatos) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 54,7 GB); conversión a GGUF posible |

## Arquitectura y entrenamiento

Sabi-Noema parte de Qwen3.8-27B, un transformer denso con atención híbrida (combinación de atención estándar y atención lineal), lo que permite manejar contextos largos de hasta 262K tokens con un coste de memoria más contenido. El ajuste fino se realiza mediante aprendizaje por refuerzo (RL) sobre entornos de código abierto, según indica el autor, con el objetivo explícito de mejorar la capacidad agéntica y la eficiencia de razonamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO adicionales.

La innovación técnica destacable es la eficiencia de tokens: el modelo aprende a producir respuestas más cortas sin perder precisión, lo que se traduce en una reducción de 2,3× en tokens de salida frente al base en Terminal-Bench y de 2,0× frente a Swift 1.5. También se menciona una variante del modelo con multi-head latent attention (Sabi-Noema-MLA) pensada para muchas sesiones largas por GPU, lo que sugiere que la atención lineal del modelo base se explota para servir contextos largos de forma económica.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso.
- Ejecución de tareas en terminal y entornos de línea de comandos (Terminal-Bench 2.1: 76,0%).
- Ingeniería de software y resolución de problemas de código (DeepSWE: 47,5%; LiveCodeBench v6: 88,0%).
- Uso de herramientas y function calling en formato XML de Qwen3.8, con soporte multi-turno (BFCL v4 multi-turn: 63,9%; MCPMark: 48/55).
- Comportamiento agéntico en dominios de atención al cliente y banca (τ³-bench: 259/278; banca: 43,5%).
- Modo "thinking" (razonamiento explícito) activado por defecto; se soporta modo no-thinking mediante `chat_template_kwargs={"enable_thinking": false}`, aunque no fue evaluado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión: el tag `image-text-to-text` aparece en Hugging Face, pero la model card no detalla capacidades de visión; no se confirma su funcionamiento.

## Casos de uso

- Automatización de tareas en terminal: el modelo puede ejecutar comandos, interpretar salidas y corregir errores en entornos Linux, gracias a su entrenamiento con RL en entornos de terminal y su puntuación del 76,0% en Terminal-Bench 2.1. Adecuado para pipelines de CI/CD y administración de sistemas.
- Agentes de atención al cliente multi-turno: con 262K tokens de contexto y una puntuación de 259/278 en τ³-bench, puede gestionar conversaciones largas con cambio de contexto y consultas a herramientas internas (pedidos, reservas, facturación).
- Generación de código en producción: soporta tool calling y puede integrarse en asistentes de código o pipelines de revisión automática, con un 88,0% en LiveCodeBench v6 y un 47,5% en DeepSWE.
- Automatización de flujos bancarios y financieros: la puntuación del 43,5% en τ³-bench banking (frente al 39,8% del base) lo hace útil para agentes que consultan saldos, gestionan transferencias o resuelven incidencias con APIs bancarias.
- Razonamiento científico y técnico: con un 90,6% en GPQA-Diamond y un 85,1% en MMLU-Pro, puede emplearse en asistentes de investigación que requieran respuestas fundamentadas y verificación de datos.
- Despliegue en una sola GPU: al ocupar ~55 GB en BF16, cabe en una A100/H100 de 80 GB con vLLM, lo que permite servir agentes de contexto largo en infraestructura modesta comparado con modelos mayores.
- Reducción de costes de inferencia: su eficiencia de tokens (29,3K tokens de salida por tarea en Terminal-Bench frente a 65,3K del base) lo hace adecuado para entornos con facturación por token o límites de latencia estrictos.

## Benchmarks y rendimiento

| Benchmark | Sabi-Noema | Qwen3.8-27B | ThinkingCap | Swift 1.5 | Muse Glimmer 30B | GPT-6 Luna, high |
|---|---:|---:|---:|---:|---:|---:|
| Terminal-Bench 2.1 (%) | **76,0** | 73,0 | 67,8 | 62,9 | 48,3 | 68,5 |
| DeepSWE (%) | 47,5 | 38,5 | 38,9 | 39,8 | 5,3 | **53,1** |
| τ³-bench (/278) | **259** | 220 | 204 | 195 | 219 | 183 |
| τ³-bench banking (%) | **43,5** | 39,8 | 36,9 | 40,4 | 15,9 | 28,7 |
| ClawEval (/199) | **162** | 151 | 151 | 160 | 153 | 160 |
| BFCL v4 multi-turn | **63,9** | 59,6 | 58,8 | 62,6 | 55,8 | 44,9 |
| MCPMark (/55) | **48** | 36 | 42 | 37 | 32 | 38 |
| AA-Omniscience index | +2,3 | −5,2 | −10,5 | −22,8 | −28,0 | **+5,2** |
| Tasa de alucinación (%) | **15,1** | 30,4 | 36,1 | 52,6 | 84,6 | 85,3 |
| LiveCodeBench v6 | 88,0 | **89,7** | 88,9 | 89,1 | 64,0 | 88,0 |
| GPQA-Diamond | **90,6** | 89,2 | 88,0 | 88,6 | 83,5 | 89,4 |
| MMLU-Pro | 85,1 | 85,4 | 85,0 | **85,7** | 84,2 | 83,4 |
| AA-LCR | 82,3 | **83,0** | 82,0 | 82,7 | 81,3 | **83,0** |
| IFBench | 80,9 | 79,5 | 79,7 | **81,1** | 77,0 | 61,0 |
| TB2.1 tokens de salida por tarea (mediana) | 29,3K | 65,3K | 51,0K | 57,1K | **20,6K** | — |
| τ³-bench tokens por conversación (media) | 3,9K | 4,2K | 3,0K | 3,6K | **2,7K** | — |
| DeepSWE tokens de salida por tarea (media) | **82,7K** | 118,8K | 103,7K | — | — | — |

Los datos provienen de la model card del autor. Las evaluaciones se realizaron con los mismos harnesses para todos los modelos; Terminal-Bench 2.1 sigue la configuración de Artificial Analysis en despliegues H100 TP2 con hasta 8 tareas por servidor.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~55 GB de pesos, más memoria para KV cache y estados de atención lineal. Una GPU de 80 GB (A100, H100) es suficiente para contextos largos.
- GPU recomendadas: A100 80 GB, H100 80 GB para despliegue en BF16 con vLLM. Para cuantizaciones GGUF (Q4, Q5, Q8) podría caber en GPUs consumer de 24 GB (RTX 4090) o 48 GB (RTX 6000 Ada), aunque no se proporcionan datos oficiales de rendimiento en esas configuraciones.
- Opciones de despliegue: vLLM 0.31.0 (recomendado, con `--max-model-len 262144 --max-num-seqs 32 --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_xml`), Transformers, llama.cpp (conversión GGUF). No se menciona Ollama ni TGI.
- Latencia y throughput: no disponibles de forma directa; la model card reporta eficiencia de tokens (29,3K tokens de salida por tarea en Terminal-Bench frente a 65,3K del base), lo que implica menor coste por tarea, pero no se publican métricas de latencia por token ni throughput en tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Terminal-Bench 2.1 | DeepSWE | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| Sabi-Noema | ~27B denso | 262K | 76,0% | 47,5% | Apache 2.0 | Hugging Face (sabicap/sabi-noema) |
| Qwen3.8-27B | ~27B denso | 262K (según base) | 73,0% | 38,5% | Apache 2.0 (según base) | Hugging Face (Qwen/Qwen3.8-27B) |
| ThinkingCap | No disponible | No disponible | 67,8% | 38,9% | No disponible | No disponible |
| Swift 1.5 | No disponible | No disponible | 62,9% | 39,8% | No disponible | No disponible |
| Muse Glimmer 30B | 30B | 131K | 48,3% | 5,3% | No disponible | No disponible |
| GPT-6 Luna (high) | No disponible (propietario) | No disponible | 68,5% | 53,1% | Propietaria | OpenRouter |

Sabi-Noema supera a su base en Terminal-Bench, DeepSWE, τ³-bench, BFCL v4, MCPMark, GPQA-Diamond e IFBench, y reduce la tasa de alucinación a menos de la mitad. Frente a GPT-6 Luna, pierde en DeepSWE (47,5% vs 53,1%) pero gana en Terminal-Bench (76,0% vs 68,5%) y en tasa de alucinación (15,1% vs 85,3%). Frente a Muse Glimmer 30B, es claramente superior en tareas agénticas y de código, aunque Muse Glimmer es más eficiente en tokens por tarea en Terminal-Bench (20,6K vs 29,3K).

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al derivar de Qwen3.8-27B, hereda los sesgos del modelo base, que no se detallan.
- Riesgo de alucinación: la tasa reportada es del 15,1% en AA-Omniscience, inferior al base (30,4%) pero no nula; en dominios especializados puede aumentar.
- Limitaciones de contexto o idioma: el contexto es de 262K tokens, pero no se especifican los idiomas soportados ni el rendimiento en lenguas distintas del inglés. El modo no-thinking está soportado pero no fue evaluado, por lo que su comportamiento es incierto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3.8-27B y de los entornos RL utilizados, así como las obligaciones de atribución.
- Caveats para producción: el despliegue con vLLM requiere `--max-num-seqs 32` porque el valor por defecto (1024) excede los bloques de estado de atención lineal disponibles en una GPU; además, se recomienda `--default-chat-template-kwargs '{"preserve_thinking": false}'` para no replicar el razonamiento de turnos anteriores. La variante MLA (Sabi-Noema-MLA) está pensada para muchas sesiones largas por GPU, lo que sugiere que la versión estándar puede tener limitaciones en escenarios de alta concurrencia.
- El tag `image-text-to-text` sugiere capacidades multimodales, pero la model card no las describe ni las evalúa; no se debe asumir visión en producción sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sabicap/sabi-noema
- Variante con MLA: https://huggingface.co/sabicap/sabi-noema-mla
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Metodología de Terminal-Bench 2.1 de Artificial Analysis: https://artificialanalysis.ai/methodology/intelligence-benchmarking#terminal-bench-v2-1
- Repositorio de vLLM (versión 0.31.0): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
