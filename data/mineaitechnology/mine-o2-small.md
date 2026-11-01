# MineAITechnology/mine-o2-small

## Resumen

mine:o2-small es un modelo de lenguaje decoder-only de 355 millones de parámetros (353.774.592 exactos) desarrollado por MineAI Technology (Islamabad, Pakistán) bajo la autoría de Bilal Mehtab. Se trata de la versión afinada mediante supervisión (SFT) del checkpoint base `v4_final` de su familia mine:o2-small, y está construido sobre la arquitectura GPT-NeoX (`GPTNeoXForCausalLM`). Su propósito es servir como modelo de chat ligero con un formato de conversación sencillo basado en turnos `User:` / `Assistant:`.

El modelo resuelve un nicho muy concreto: investigación de modelos pequeños con ventana de contexto de 4096 tokens, vocabulario GPT-2 de 50.257 tokens y embeddings de entrada/salida atados. No compite en conocimiento ni razonamiento con modelos de su clase como SmolLM2 360M o Qwen2.5 0.5B; el propio autor reconoce que el SFT aporta comportamiento (seguir el formato de chat, detenerse limpiamente, identidad del creador, código corto y rechazo de peticiones dañinas) pero no capacidad adicional.

Es relevante ahora como referencia honesta y reproducible de un pipeline de SFT sobre un base pequeño, con métricas declaradas y sin verificar, y con una licencia Apache-2.0 que facilita su estudio y reutilización. No obstante, su rendimiento en benchmarks lo sitúa en el extremo inferior de su categoría, por lo que su interés es fundamentalmente académico y experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (`GPTNeoXForCausalLM`), transformer decoder-only causal |
| Parámetros totales | 353.774.592 (≈355M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (más una pequeña cantidad de saludos en roman urdu) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de transformers; tamaño del repo 0.0 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-NeoX: 24 bloques transformer con `d_model` de 1024, 16 cabezas de atención de dimensión 64, FFN de 4096 (4× hidden) y LayerNorm en dos posiciones por bloque más una final. Usa embeddings posicionales rotatorios (RoPE) con base theta 40.000, proyección QKV fusionada con sesgos, capas lineales con bias y embeddings de entrada y salida atados. El vocabulario es de 50.257 tokens con BPE estilo GPT-2, y el token `<|endoftext|>` actúa tanto como prefijo de inicio de secuencia como token de fin de respuesta.

El entrenamiento consistió en tres rondas cortas de supervisión (SFT) sobre el checkpoint base de contexto 4096 `v4_final`, con aproximadamente 50 millones de tokens de entrenamiento en total. No se documentan en la información disponible detalles sobre composición del dataset, uso de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. La evaluación se realizó en fp16.

## Capacidades

- Generación de texto causal en inglés con formato de chat `User:` / `Assistant:`.
- Seguimiento del formato conversacional y parada limpia al final de la respuesta.
- Identificación del creador del modelo (MineAI Technology / Bilal Mehtab).
- Escritura de código corto.
- Rechazo de peticiones claramente dañinas.
- Manejo de contexto de hasta 4096 tokens.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Estudio de pipelines de SFT: el modelo sirve como caso de referencia para reproducir un ajuste supervisado sobre un base GPT-NeoX pequeño con contexto de 4096 tokens y evaluar el efecto del SFT en el comportamiento frente al base.
- Experimentos de formato de chat: permite probar plantillas `User:` / `Assistant:` y estrategias de parada con `<|endoftext|>` en un modelo de 355M, útil para validar harness de evaluación antes de escalar a modelos mayores.
- Generación de texto corto en inglés: adecuado para tareas de continuación y respuestas breves donde no se requiere conocimiento factual profundo.
- Pruebas de alineación básica: su comportamiento de rechazo ante peticiones dañinas lo hace útil para estudiar filtros de seguridad en modelos pequeños.
- Docencia e investigación académica: su tamaño reducido (≈355M) y licencia Apache-2.0 facilitan su uso en laboratorios con recursos limitados y en cursos sobre transformers.
- Evaluación comparativa de modelos pequeños: sirve como línea base en estudios que comparen modelos de 300-500M en benchmarks como ARC, HellaSwag, MMLU, TruthfulQA, Winogrande y GSM8K.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados):

| Benchmark | Métrica | Resultado |
|---|---|---|
| AI2 Reasoning Challenge (25-shot) | acc_norm | 27,33 |
| HellaSwag (10-shot) | acc_norm | 42,00 |
| MMLU (5-shot) | acc | 24,98 |
| TruthfulQA (0-shot) | MC2 | 40,28 |
| Winogrande (5-shot) | acc | 54,00 |
| GSM8K (5-shot, strict) | exact_match | 4,00 |

El autor indica que estos resultados están estadísticamente empatados con su propio modelo base y que se sitúan por debajo de SmolLM2 360M y Qwen2.5 0.5B, y aproximadamente a la altura de GPT-2 medium y Pythia 410M.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño (≈355M parámetros), en fp16 requiere aproximadamente 0,7 GB solo para pesos, más memoria para activaciones y caché KV.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; por tamaño debería caber en GPUs de consumo, pero no se confirma en la documentación.
- Opciones de despliegue: transformers (librería declarada); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mine:o2-small (SFT) | ≈355M | 4096 | Inferior a SmolLM2 360M y Qwen2.5 0.5B; ~nivel GPT-2 medium y Pythia 410M (según el autor) | Apache-2.0 | HuggingFace |
| SmolLM2 360M | ≈360M | no disponible | Superior según el autor | no disponible | no disponible |
| Qwen2.5 0.5B | ≈500M | no disponible | Superior según el autor | no disponible | no disponible |
| GPT-2 medium | ≈355M | no disponible | Nivel similar según el autor | no disponible | no disponible |
| Pythia 410M | ≈410M | no disponible | Nivel similar según el autor | no disponible | no disponible |

Los datos de los modelos comparables provienen únicamente de las afirmaciones cualitativas del autor; no se dispone de cifras detalladas de benchmarks para ellos en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que el SFT no añade conocimiento ni capacidad de razonamiento; solo modifica el comportamiento.
- Resultados de benchmarks no verificados (`verified: false`) y situados en el extremo inferior de su clase.
- GSM8K con exact_match de 4,00 refleja una capacidad matemática muy limitada.
- MMLU de 24,98 y ARC de 27,33 indican conocimiento factual y razonamiento débiles.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: elevado por el tamaño reducido y el bajo rendimiento en TruthfulQA (40,28 MC2); no se documentan medidas específicas de mitigación.
- Limitaciones de idioma: solo inglés (con pequeños saludos en roman urdu); no se garantiza soporte de castellano.
- Limitaciones de contexto: ventana máxima de 4096 tokens.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor advierte de que deben revisarse las licencias de los datos de SFT antes de redistribuir datos derivados.
- Caveat para producción: modelo de investigación pequeño; no recomendado para tareas que requieran precisión factual o razonamiento complejo.

## Enlaces

- HuggingFace: https://huggingface.co/MineAITechnology/mine-o2-small
- Organización en HuggingFace: https://huggingface.co/MineAITechnology
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
