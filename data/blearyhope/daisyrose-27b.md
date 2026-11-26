# blearyhope/DaisyRose-27B

## Resumen

DaisyRose-27B es un modelo multimodal de razonamiento desarrollado por RadixArk, construido sobre el modelo base Qwen3.8-27B mediante un proceso de aprendizaje por refuerzo (RL) exclusivamente, sin supervisión fina (SFT) ni destilación. El modelo conserva la arquitectura, el tokenizador, la plantilla de chat y la capacidad de comprensión de imágenes del modelo base, así como su ventana de contexto de 256K tokens, lo que lo convierte en un reemplazo directo en pilas de inferencia y post-entrenamiento existentes. Cuenta con 27.781.427.952 parámetros totales y se distribuye en formato BF16, con variantes adicionales en FP8, NVFP4 y GGUF.

El problema que aborda es la mejora del rendimiento en tareas de agente de horizonte largo, especialmente en entornos de terminal y flujos de trabajo de ingeniería de software. Para ello, RadixArk entrenó el modelo durante 18 días en 144 GPUs H200 sobre aproximadamente 1.200 tareas de agente de horizonte largo cuidadosamente seleccionadas, con sesiones de hasta 1M de tokens. Los resultados reportados muestran una mejora sustancial en Terminal Bench 4.1 (de 5,6 a 12,0 en pass@1) y mejoras más moderadas en otros benchmarks de código, razonamiento y seguimiento de instrucciones.

La relevancia actual del modelo radica en su enfoque de entrenamiento puramente basado en RL sobre un modelo base ya capaz, lo que permite obtener ganancias en tareas agénticas sin necesidad de grandes volúmenes de datos supervisados. Su licencia Apache-2.0 y su compatibilidad con el ecosistema de Qwen3.8-27B facilitan su adopción tanto en investigación como en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | BF16, FP8, NVFP4, GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16); variantes FP8, NVFP4 y GGUF publicadas por separado |

## Arquitectura y entrenamiento

DaisyRose-27B mantiene la arquitectura del modelo base Qwen3.8-27B, un transformer multimodal con capacidad de comprensión de imágenes y una ventana de contexto de 256K tokens. No se introduce ningún cambio arquitectónico: el tokenizador, la plantilla de chat y el pipeline de inferencia son idénticos a los del modelo base, lo que garantiza la compatibilidad directa con las pilas existentes.

El entrenamiento se realizó exclusivamente mediante aprendizaje por refuerzo, sin supervisión fina ni destilación. El conjunto de datos consistió en aproximadamente 1.200 tareas de agente de horizonte largo cuidadosamente seleccionadas, con sesiones de hasta 1M de tokens, y el proceso se extendió durante 18 días sobre 144 GPUs H200. No se dispone de información detallada sobre la composición exacta del dataset, la función de recompensa ni los hiperparámetros del RL. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, más allá de la publicación de un modelo draft (DSpark) para decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento multimodal (texto e imágenes), heredado del modelo base Qwen3.8-27B.
- Razonamiento de horizonte largo en entornos de agente, con sesiones de hasta 1M de tokens durante el entrenamiento.
- Ejecución de tareas en terminal y flujos de ingeniería de software (Terminal Bench, DeepSWE, SWE Bench Pro).
- Seguimiento de instrucciones complejas (IFBench) y razonamiento científico (GPQA Diamond, HLE).
- Capacidad de comprensión de imágenes, según el pipeline `image-text-to-text`.
- Modo de pensamiento (thinking mode) con ajustes recomendados: temperatura 1.0, top_p 0.95, top_k 20, min_p 0, esfuerzo de razonamiento xhigh.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: sí, evidenciado por los benchmarks de terminal y SWE.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de tareas en terminal: el modelo puede ejecutar comandos, interpretar salidas y corregir errores en sesiones de agente de horizonte largo, gracias a su contexto de 256K tokens y a su entrenamiento específico en Terminal Bench. Es adecuado para pipelines de CI/CD y administración de sistemas.
- Ingeniería de software asistida: con resultados de 46,2 en DeepSWE v1.1 y 94,7 en SWE Bench Pro v2, puede integrarse en flujos de resolución de incidencias, generación de parches y revisión de código en repositorios reales.
- Razonamiento científico y técnico: sus puntuaciones en GPQA Diamond (90,7) y HLE (34,3) lo hacen útil para asistencia en investigación, resolución de problemas de dominio y explicación de conceptos complejos.
- Análisis de documentos con imágenes: al conservar la capacidad multimodal del modelo base, puede procesar capturas, diagramas y documentos escaneados junto con texto en una misma conversación.
- Seguimiento estricto de instrucciones en producción: con 82,4 en IFBench, es adecuado para tareas donde el cumplimiento de formatos y restricciones es crítico, como generación de informes estructurados o extracción de datos.
- Agentes autónomos de larga duración: el entrenamiento con sesiones de hasta 1M de tokens y su contexto de 256K permiten mantener coherencia en tareas que requieren decenas de pasos y acumulación de estado.
- Despliegue como reemplazo directo de Qwen3.8-27B: al compartir arquitectura, tokenizador y plantilla de chat, puede sustituir al modelo base en pilas existentes sin cambios de integración.

## Benchmarks y rendimiento

| Benchmark | DaisyRose-27B | Qwen3.8-27B | Muse Glimmer-30B | Qwen3.6-35B-A3B | MiMo V2.6 Flash | Inkling 2 Small | Beam 1.0 | Muse Spark Open | GPT-6 Luna |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Parámetros activados | 27B | 27B | 30B | 3B | 15B | 17B | 23B | 42B | – |
| Parámetros totales | 27B | 27B | 30B | 35B | 309B | 594B | 501B | 816B | – |
| Terminal Bench 4.1 | 12,0 | 5,6 | 0,5 | 0,0 | **16,1** | 13,0 | 6,4 | 6,6 | 15,2 |
| Terminal Bench 2.1 | 75,5 | 73,0 | 51,7 | 44,9 | **87,6** | 81,3 | 80,1 | 76,4 | 73,0 |
| DeepSWE v1.1 | 46,2 | 42,2 | 4,4 | 0,0 | 67,9 | **72,1** | 43,3 | 60,0 | 66,6 |
| SWE Bench Pro v2 | 94,7 | 91,3 | 80,4 | 73,3 | – | **97,7** | – | 95,0 | – |
| HLE (solo texto) | 34,3 | 33,9 | 22,0 | 22,2 | 35,1 | **44,1** | 34,7 | 43,9 | 38,5 |
| IFBench | **82,4** | 79,5 | 77,0 | 64,4 | – | – | 79,6 | – | – |
| GPQA Diamond | 90,7 | 89,2 | 83,5 | 86,0 | 88,7 | **93,0** | 90,6 | 89,0 | 90,5 |

Notas de evaluación: Terminal Bench 4.1 promediado sobre 8 repeticiones por tarea con mini-swe-agent; Terminal Bench 2.1 sobre 5 repeticiones con Terminus 2; DeepSWE v1.1 sobre 8 repeticiones; SWE Bench Pro v2 sobre 5 repeticiones; HLE sobre 5 repeticiones con GPT-6 Luna como evaluador y sin herramientas; IFBench sobre 4 repeticiones (300 prompts) con el scorer oficial de allenai; GPQA Diamond sobre 8 repeticiones (198 preguntas). Los resultados de DaisyRose-27B corresponden al mejor de sus ejecuciones en BF16 y FP8, que difieren en menos de un punto en todos los benchmarks donde se ejecutaron ambos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB de pesos, más memoria para KV cache; se recomienda al menos 80 GB para contexto moderado.
- VRAM estimada en FP8: aproximadamente 28 GB de pesos, más KV cache; viable en GPUs de 48-80 GB.
- VRAM estimada en NVFP4: aproximadamente 14 GB de pesos, más KV cache; viable en GPUs consumer de gama alta.
- VRAM estimada en GGUF (cuantización 4-bit): aproximadamente 14-16 GB, apta para GPUs consumer con 16-24 GB.
- GPUs recomendadas: H200 (usada en el entrenamiento), H100, A100 80 GB para BF16; RTX 4090 (24 GB) para NVFP4 o GGUF 4-bit con contexto reducido.
- Cabe en GPU consumer: sí, en formato GGUF o NVFP4, con limitaciones de contexto según la VRAM disponible.
- Opciones de despliegue: transformers (librería declarada), vLLM, llama.cpp y Ollama para GGUF; TGI no confirmado en la información disponible.
- Latencia y throughput estimados: no disponible.
- Decodificación especulativa: existe un modelo draft publicado (Qwen3.8-27B-DSpark) que puede emplearse para acelerar la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Terminal Bench 4.1 | SWE Bench Pro v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DaisyRose-27B | 27B / 27B | 256K | 12,0 | 94,7 | Apache-2.0 | Hugging Face (BF16, FP8, NVFP4, GGUF) |
| Qwen3.8-27B | 27B / 27B | 256K | 5,6 | 91,3 | no disponible | Hugging Face |
| Muse Glimmer-30B | 30B / 30B | no disponible | 0,5 | 80,4 | no disponible | Hugging Face |
| MiMo V2.6 Flash | 309B / 15B | no disponible | 16,1 | – | no disponible | no disponible |

DaisyRose-27B mejora a su modelo base en todos los benchmarks reportados, con una ganancia especialmente marcada en Terminal Bench 4.1 (5,6 a 12,0). Frente a modelos de mayor tamaño como MiMo V2.6 Flash o Inkling 2 Small, queda por debajo en la mayoría de métricas, pero con un coste de inferencia mucho menor al ser un modelo denso de 27B. La licencia Apache-2.0 es una ventaja frente a alternativas cuya licencia no se detalla en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al heredar el modelo base, es probable que arrastre sus sesgos, pero no se documenta.
- Riesgo de alucinación: no cuantificado; los benchmarks de HLE (34,3) y GPQA Diamond (90,7) indican un rendimiento sólido pero no exento de errores en razonamiento complejo.
- Limitaciones de contexto: la ventana es de 256K tokens, aunque el entrenamiento usó sesiones de hasta 1M; no se especifica cómo se gestionan entradas superiores al contexto.
- Idiomas soportados: no disponible; no se confirma el soporte multilingüe más allá de lo heredado del modelo base.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar el enlace de licencia indicado en la model card (apunta a un repositorio distinto, RadixArk/DaisyRose-27B).
- El modelo se distribuye en un repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación comunitaria independiente.
- Los resultados de benchmarks son reportados por el desarrollador; no se han verificado de forma independiente.
- El entrenamiento se realizó exclusivamente con RL sobre tareas de agente, lo que puede limitar el rendimiento en dominios fuera de ese distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blearyhope/DaisyRose-27B
- Repositorio BF16 (referenciado en la model card): https://huggingface.co/RadixArk/DaisyRose-27B
- Variante FP8: https://huggingface.co/RadixArk/DaisyRose-27B-FP8
- Variante NVFP4: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4
- Variante GGUF: https://huggingface.co/RadixArk/DaisyRose-27B-GGUF
- Modelo draft DSpark: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de RadixArk: https://www.radixark.com/blog/daisyrose-27b
- Licencia: https://huggingface.co/RadixArk/DaisyRose-27B/blob/main/LICENSE
- Leaderboard Terminal Bench: https://www.tbench.ai/leaderboard
- Vals.ai Terminal Bench 4: https://www.vals.ai/benchmarks/terminal-bench-4
- Artificial Analysis Qwen3.8: https://artificialanalysis.ai/models/qwen3-8-27b
- Artificial Analysis Qwen3.6: https://artificialanalysis.ai/models/qwen3-6-35b-a3b
- Paper SWE Bench Pro v2: https://arxiv.org/html/2611.16289#S4.T3
- Model card Muse Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Model card Inkling 2 Small: https://thinkingmachines.ai/model-card/inkling-2-small/
- Model card Beam 1.0: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Model card Muse Spark Open: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Release MiMo V2.6: https://mimo.xiaomi.com/mimo-v2-6
