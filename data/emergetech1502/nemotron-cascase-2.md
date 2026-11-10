# emergetech1502/nemotron-cascase-2

## Resumen

Nemotron-Cascade-2-30B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por NVIDIA, post-entrenado a partir de la base Nemotron-3-Nano-30B-A3B-Base. Aunque la model card lo presenta como un modelo de 30B con 3B de parámetros activos, el repositorio de Hugging Face `emergetech1502/nemotron-cascase-2` declara 16.145.720.768 parámetros totales según los pesos en safetensors, y su nombre de repositorio contiene una errata ("cascase" en lugar de "cascade"). Conviene tratar esta copia con cautela: parece una réplica no oficial de un modelo de NVIDIA.

El modelo está orientado a razonamiento matemático y de código de alto nivel, con modos de "thinking" e "instruct" (sin razonamiento explícito). Según la model card, alcanza resultados de medalla de oro en la Olimpiada Internacional de Matemáticas (IMO) 2025 y en la Olimpiada Internacional de Informática (IOI) 2025, lo que lo sitúa en la gama alta de modelos abiertos para tareas de razonamiento.

Es relevante ahora porque combina una arquitectura MoE eficiente en cómputo (pocos parámetros activos por token) con un post-entrenamiento intensivo en SFT y RL, y porque NVIDIA publica conjuntamente los datasets de SFT y RL junto con el informe técnico (arXiv:2603.19220), lo que facilita la reproducibilidad y el ajuste fino posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `nemotron_h`, requiere `custom_code`) |
| Parametros totales | 16.145.720.768 (según safetensors del repo); la model card indica 30B |
| Parametros activos | 3B (según la model card: "30B-A3B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (tag `modelopt`); el repo contiene pesos en safetensors |
| Idiomas soportados | inglés (`en`) |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`, marcada como `other`) |
| Formato de pesos | safetensors (repo de 18,8 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos (MoE), identificada en los tags como `nemotron_h` y que requiere código personalizado (`custom_code`) para cargarse con Transformers. El modelo parte de la base Nemotron-3-Nano-30B-A3B-Base y se post-entrena en dos fases: SFT (supervised fine-tuning) y RL (reinforcement learning), según indican los tags y la model card. NVIDIA publica los datasets asociados: `nvidia/Nemotron-Cascade-2-SFT-Data` y `nvidia/Nemotron-Cascade-2-RL-data`.

El modelo opera en dos modos: "thinking" (con cadena de razonamiento explícita) e "instruct" (respuesta directa sin razonamiento). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El informe técnico está referenciado como arXiv:2603.19220.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento matemático avanzado: resolución de problemas de competición (IMO 2025, AIME 2025/2026, HMMT).
- Razonamiento de código y resolución de problemas algorítmicos (IOI 2025, ICPC World Finals 2025, LiveCodeBench).
- Modo "thinking" con cadena de razonamiento explícita y modo "instruct" sin ella.
- Conocimiento general y STEM (MMLU-Pro, GPQA-Diamond, HLE).
- Seguimiento de instrucciones y alineación conversacional (ArenaHard v2, IFBench).
- Capacidades de agente y razonamiento multi-paso: la model card menciona "agentic capabilities", aunque no se detalla el soporte concreto de tool calling en la información disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language`.

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo puede abordar problemas de nivel olimpiada (IMO, AIME, HMMT) en modo thinking, útil para investigación en razonamiento automático y para herramientas educativas avanzadas.
- Generación y depuración de código algorítmico: adecuado para plataformas de evaluación competitiva (tipo IOI/ICPC) y para asistencia en entrevistas técnicas, dado su rendimiento en LiveCodeBench e IOI.
- Asistente de razonamiento en pipelines de análisis: con modo instruct para respuestas rápidas y modo thinking para consultas complejas, permite alternar latencia y profundidad según la tarea.
- Fine-tuning sobre los datasets publicados: al liberarse SFT y RL data, equipos de investigación pueden reproducir o adaptar el post-entrenamiento a dominios propios.
- Evaluación comparativa de modelos MoE: sirve como referencia abierta para estudiar el equilibrio entre parámetros totales y activos en tareas de razonamiento.
- Generación de explicaciones paso a paso en entornos educativos: el modo thinking produce trazas de razonamiento que pueden usarse como material didáctico (con revisión humana).
- Investigación en alineación e instrucciones: su rendimiento en IFBench y ArenaHard lo hace útil para estudiar seguimiento de instrucciones complejas.

## Benchmarks y rendimiento

Datos extraídos de la model card (Nemotron-Cascade-2-30B-A3B frente a Nemotron-3-Nano-30B-A3B, Nemotron-3-Super-120B-A12B y Qwen3.5-35B-A3B):

| Benchmark | Nemotron-3-Nano-30B-A3B | Nemotron-3-Super-120B-A12B | Qwen3.5-35B-A3B | Nemotron-Cascade-2-30B-A3B |
|---|---|---|---|---|
| IMO 2025 | - | - | - | 35 pts (medalla) |
| IMO AnswerBench | 70,4 | 77,2 | 74,8 | 79,3 |
| IMO ProofBench | - | - | - | 72,9 |
| AIME 2025 | 89,1 | 90,2 | 91,9 | 92,4 (98,6) |
| AIME 2026 | 89,9 | 89,8 | 91,1 | 90,9 (95,0) |
| HMMT Feb25 | 84,6 | 93,7 | 89,0 | 94,6 |
| IOI 2025 | - | - | 348,6 | 439,3 (medalla) |
| ICPC World Finals 2025 | - | - | - | 10/12 (medalla) |
| LiveCodeBench v6 (2408-2505) | 68,3 | 78,7 | 74,6 | 87,2 (88,4) |
| LiveCodeBenchPro 25Q2 (Easy) | 54,5 | 81,7 | 81,1 | 87,0 (89,3) |
| LiveCodeBenchPro 25Q2 (Med) | 3,50 | 23,2 | 17,8 | 27,6 (36,8) |
| SciCode | 33,3 | 42,1 | 38,0 | 36,4 |
| MMLU-Redux | - | - | 93,3 | 86,3 |
| MMLU-Pro | 78,3 | 83,7 | 85,3 | 79,8 |
| GPQA-Diamond | 73,0 | 79,2 | 84,2 | 76,1 |
| HLE (no tool) | 10,6 | 18,3 | 22,4 | 17,7 |
| ArenaHard v2 (Avg.) | 67,7 | - | 65,4 | 83,5 |
| IFBench (prompt) | 71,5 | 72,6 | 70,2 | 82 (dato truncado) |

Nota: los valores entre paréntesis corresponden a variantes de evaluación indicadas en la model card; los valores con ‡ indican configuraciones especiales según la fuente. Los datos de IFBench aparecen truncados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 16,1B parámetros totales en safetensors (18,8 GB en BF16/FP16), la inferencia en precisión completa requiere aproximadamente 32 GB de VRAM solo para pesos; en 8-bit (tag `modelopt`) bajaría a unos 16-18 GB, y en cuantizaciones de 4 bits a unos 8-10 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: para precisión completa, A100 40/80 GB o H100; para 8-bit, A100 40 GB o RTX 4090 24 GB podría ser insuficiente según overhead de contexto.
- GPU de consumo: viable en RTX 4090 (24 GB) con cuantización 8-bit o inferior, siempre que el contexto sea moderado; en GPUs de 16 GB requeriría 4-bit.
- Opciones de despliegue: Transformers con `custom_code` (requerido por la arquitectura `nemotron_h`); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Rendimiento destacado |
|---|---|---|---|---|---|
| Nemotron-Cascade-2-30B-A3B | 30B (card) / 16,1B (safetensors) | 3B | no disponible | NVIDIA Open Model License | IMO 35 pts, IOI 439,3, LCB v6 87,2 |
| Nemotron-3-Nano-30B-A3B | 30B | 3B | no disponible | no disponible en la información | AIME 2025 89,1, MMLU-Pro 78,3 |
| Nemotron-3-Super-120B-A12B | 120B | 12B | no disponible | no disponible en la información | AIME 2025 90,2, LCB v6 78,7 |
| Qwen3.5-35B-A3B | 35B | 3B | no disponible | no disponible en la información | AIME 2025 91,9, MMLU-Pro 85,3 |

La comparativa se limita a los datos de la model card; no se dispone de información sobre contexto, licencia o disponibilidad de los modelos alternativos.

## Limitaciones y advertencias

- El repositorio `emergetech1502/nemotron-cascase-2` parece una réplica no oficial (errata en el nombre, 0 descargas, 0 likes) de un modelo de NVIDIA; conviene verificar la integridad de los pesos frente al repositorio oficial `nvidia/Nemotron-Cascade-2-30B-A3B`.
- Discrepancia entre el tamaño declarado en la model card (30B) y los parámetros reales en safetensors (16,1B); puede deberse a pesos parciales o a una conversión incompleta.
- Idioma limitado al inglés; no se garantiza un rendimiento correcto en castellano u otros idiomas.
- Riesgo de alucinación inherente a modelos generativos, especialmente en modo instruct sin razonamiento explícito.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia NVIDIA Open Model License: revisar los términos de uso comercial y las restricciones de redistribución antes de desplegar en producción.
- Requiere `custom_code` para cargarse en Transformers, lo que complica el despliegue en entornos estándar y puede limitar la compatibilidad con servidores de inferencia populares.
- No se dispone de información sobre longitud de contexto, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Los benchmarks provienen de la model card del autor; no se han verificado de forma independiente.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/emergetech1502/nemotron-cascase-2
- Informe técnico: https://arxiv.org/abs/2603.19220
- Dataset SFT: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Dataset RL: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-RL-data
- Colección de modelos: https://huggingface.co/collections/nvidia/nemotron-cascade-2
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-Base-BF16
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
