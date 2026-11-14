# kowanietz/NanoReason-7B-Think

## Resumen

NanoReason-7B-Think es un checkpoint de investigación de razonamiento desarrollado por kowanietz (autor independiente no afiliado a Ai2) a partir de la familia OLMo 3 7B de Allen Institute for AI. Se trata de la cuarta y última etapa de una cadena de post-entrenamiento: OLMo 3 7B base, seguido de SFT, SFT-Refined y finalmente Think, que aplica aprendizaje por refuerzo con recompensas verificables (RLVR) mediante Dr. GRPO. El modelo resuelve el problema de mejorar el razonamiento matemático y el seguimiento de instrucciones de un modelo de 7B con un presupuesto de cómputo muy reducido.

La relevancia del checkpoint radica en su eficiencia: la etapa Think consumió aproximadamente 69 GPU-horas sobre 4× NVIDIA A100 de 40 GB (210 GPU-horas acumuladas en toda la cadena), un coste muy por debajo de los pipelines de RL a gran escala habituales. Con 7.298.011.136 parámetros y un contexto de evaluación de 32.768 tokens, el modelo está pensado como referencia reproducible para estudiar cómo el RLVR afecta a la precisión y al coste de inferencia (número medio de tokens generados) en un modelo de tamaño medio.

El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors para la librería transformers, con soporte únicamente del idioma inglés. Su público objetivo son investigadores que quieran reproducir o extender experimentos de RLVR sobre OLMo 3, más que un despliegue comercial inmediato.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de OLMo 3 7B; detalles internos de capas no disponibles en la información proporcionada) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (contexto usado en la evaluación; longitud máxima nativa no disponible) |
| Tipos de cuantizacion | No disponible (solo se documenta inferencia en BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 7.298.011.136 parámetros cuyos pesos preentrenados provienen de Ai2 OLMo 3 7B; el tokenizador y la plantilla de chat proceden de OLMo 3 Think-SFT. Sobre esa base se aplicó una cadena de post-entrenamiento en cuatro etapas: SFT, SFT-Refined y, finalmente, la etapa Think que aquí se publica. La etapa Think usa Dr. GRPO (una variante de GRPO) con recompensas verificables de matemáticas y seguimiento de instrucciones, sobre 512 prompts de entrenamiento del dataset allenai/Dolci-Think-RL-7B (265 de matemáticas y 247 de seguimiento de instrucciones), con cuatro completions por prompt (2.048 rollouts en total), learning rate de 1e-6, 512 pasos de optimizador y un límite de 16.384 tokens por completion. El entrenamiento se ejecutó en un solo nodo de 4× A100 40 GB durante unas 69 GPU-horas para esta etapa.

Como controles de calidad, el autor documenta una auditoría del pool de origen del SFT que no encontró coincidencias exactas normalizadas con prompts de benchmark en 100.000 ejemplos (104.528 turnos de usuario), y que el RLVR aplica comprobaciones de exclusión de benchmarks. El autor advierte que las comprobaciones de coincidencia exacta no descartan paráfrasis ni solapamiento con el preentrenamiento. Un resultado destacable del entrenamiento es que la etapa Think reduce el número medio de tokens generados respecto a SFT-Refined en los seis benchmarks evaluados, con descensos pequeños de precisión en GPQA Main y AIME 2024.

## Capacidades

- Generación de texto conversacional con plantilla de chat (formato de mensajes role/content).
- Razonamiento matemático de varios pasos, reforzado específicamente mediante RLVR con recompensas verificables.
- Seguimiento de instrucciones (optimizado con recompensas de instruction following; IFEval de 72,64 %).
- Razonamiento de sentido común y multietapa (BBH de 69,19 %).
- Modo de razonamiento con generación de tokens intermedios antes de la respuesta (el nombre "Think" y el límite de 16.384 tokens por completion apuntan a cadenas de razonamiento largas).
- Capacidad multilingüe: limitada al inglés según la model card.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes: no documentado en la información disponible.
- Visión y audio: no soportados (pipeline text-generation).

## Casos de uso

- Investigación en RLVR: reproducir o extender el pipeline Dr. GRPO sobre OLMo 3 7B usando el repositorio NanoReason, con configuraciones y resultados publicados para comparar etapas (Base, SFT, Refined, Think).
- Evaluación de eficiencia de razonamiento: estudiar la relación entre precisión y número medio de tokens generados, ya que el autor publica la curva score vs. coste en tokens entre etapas.
- Resolución de problemas matemáticos de competición en entornos de investigación: el modelo alcanza 91,00 % en MATH-500 y 45,31 % en AIME 2024, adecuado para experimentos de verificación automática de soluciones.
- Generación de soluciones con verificación posterior: al estar entrenado con recompensas verificables, encaja en pipelines donde un verificador externo (por ejemplo, un comprobador simbólico) filtra las respuestas matemáticas.
- Seguimiento de instrucciones en inglés para tareas de formato estricto: con 72,64 % en IFEval, sirve para probar técnicas de instrucción y comparar contra el checkpoint Refined.
- Baseline académico para experimentos de post-entrenamiento: su licencia Apache 2.0 y su cadena de etapas documentada lo hacen útil como punto de comparación en estudios sobre SFT y RL.
- Fine-tuning posterior en inglés: al ser un modelo de 7B con pesos safetensors y licencia permisiva, puede ajustarse en una sola GPU de 40-80 GB para dominios específicos.

## Benchmarks y rendimiento

Resultados publicados por el autor (porcentajes; evaluación con OLMES/vLLM en BF16 y contexto de 32.768 tokens):

| Benchmark | Base | SFT | Refined | Think |
|---|---:|---:|---:|---:|
| GPQA Main | 28,79 | 32,37 | **42,63** | 41,74 |
| MATH-500 | 63,00 | 88,40 | **91,00** | **91,00** |
| AIME 2024 | 12,08 | 30,21 | **45,83** | 45,31 |
| AIME 2025 | 14,17 | 26,35 | **33,33** | **33,33** |
| BBH | no disponible | 60,34 | 67,61 | **69,19** |
| IFEval | 34,57 | 63,77 | **72,64** | **72,64** |

Detalles de evaluación según el autor: GPQA Main con exact match sobre 448 preguntas; MATH-500 con flexible exact match; AIME con media de pass@1 (30 problemas por año, 32 muestras cada uno); BBH con micro exact match; IFEval con prompt-level loose accuracy. El resultado de BBH en Base no se completó.

## Requisitos de hardware

- Pesos en BF16: el repositorio ocupa 14,6 GB, por lo que la inferencia en BF16 requiere aproximadamente 15-16 GB de VRAM solo para pesos, más memoria para KV cache y activaciones.
- GPU recomendadas: A100 40 GB u 80 GB, H100, o GPUs consumer con 24 GB o más (RTX 3090, RTX 4090) para BF16 con contexto moderado.
- Cabe en consumer GPU: sí, en GPUs de 24 GB en BF16 con contexto limitado; en 16 GB requeriría cuantización, cuyos formatos no están documentados por el autor.
- Despliegue: transformers >= 5.19.0 con torch y accelerate (soporte oficial documentado); el autor evaluó con vLLM a través de OLMES. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que los recuentos de tokens generados no son medidas directas de latencia ni de energía.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| NanoReason-7B-Think | 7,30 B | 32.768 (evaluación) | Apache 2.0 | Checkpoint RLVR de investigación; GPQA 41,74; MATH-500 91,00 |
| NanoReason-7B-SFT-Refined | 7,30 B (misma base) | 32.768 (evaluación) | Apache 2.0 | Etapa previa; GPQA 42,63; MATH-500 91,00; más tokens generados |
| OLMo 3 7B (Ai2) | 7 B (aprox.) | No disponible | No disponible en la información proporcionada | Modelo base de la cadena; resultados Base de la tabla |
| Alternativas de razonamiento de ~7B | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Es un checkpoint de investigación: no hay evidencia de validación en producción ni de robustez frente a entradas adversarias.
- Riesgo de alucinación inherente a los modelos generativos; las mejoras en matemáticas no garantizan corrección factual fuera de dominio.
- La auditoría de contaminación se limita a coincidencias exactas normalizadas; el autor reconoce que no descarta paráfrasis ni solapamiento con datos de preentrenamiento.
- GPQA Main y AIME 2024 empeoran ligeramente respecto a SFT-Refined (41,74 frente a 42,63 y 45,31 frente a 45,83), por lo que la etapa Think no domina en todas las métricas.
- No se documentan tool calling, agentes, visión ni audio; no debe asumirse su disponibilidad.
- No se documentan formatos de cuantización ni despliegue fuera de transformers/vLLM.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso NOTICE y respetarse las condiciones de los pesos de OLMo 3 de Ai2.
- El autor no está afiliado a Ai2; la trazabilidad del modelo depende del repositorio del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kowanietz/NanoReason-7B-Think
- Modelo base (etapa previa): https://huggingface.co/kowanietz/NanoReason-7B-SFT-Refined
- Etapa SFT: https://huggingface.co/kowanietz/NanoReason-7B-SFT
- OLMo 3 7B (Ai2): https://huggingface.co/allenai/Olmo-3-1025-7B
- OLMo 3 Think-SFT (tokenizador y plantilla de chat): https://huggingface.co/allenai/Olmo-3-7B-Think-SFT
- Dataset de RL: https://huggingface.co/datasets/allenai/Dolci-Think-RL-7B
- Repositorio de código y resultados: https://github.com/kowanietz/nanoreason
- Resultados de evaluación: https://github.com/kowanietz/nanoreason/tree/main/results
- Configuración de entrenamiento RLVR: https://github.com/kowanietz/nanoreason/blob/main/configs/rlvr/mixed-512-16k.yaml
- Licencia: https://huggingface.co/kowanietz/NanoReason-7B-Think/blob/main/LICENSE
- NOTICE: https://huggingface.co/kowanietz/NanoReason-7B-Think/blob/main/NOTICE
