# CardCauldronTCG/aya-expanse-8b-lexsi-aligntune

## Resumen

Aya Expanse 8B — Lexsi AlignTune (Dataset B) es un ajuste fino mediante LoRA del modelo CohereLabs/aya-expanse-8b, publicado por el usuario CardCauldronTCG en Hugging Face. El objetivo declarado del ajuste es enseñar un único comportamiento: responder estrictamente a partir de una fuente proporcionada y afirmar de forma explícita cuando la fuente no contiene la respuesta. El modelo base es un transformer denso de 8.028.033.024 parámetros (aproximadamente 8B), desarrollado originalmente por Cohere Labs.

El ajuste se realizó sobre un conjunto de datos muy reducido (18 pares prompt/completion de tipo trampa, control y ausencia) siguiendo un protocolo documentado (`FINETUNE-PROTOCOL-2026-11-12.md`). La receta emplea LoRA con r=16, alpha=32, aplicado a todas las capas lineales, learning rate 1e-4 con scheduler coseno, warmup del 10%, precisión bf16, batch de 6, 60 pasos de optimizador, pérdida solo sobre la completion y semilla 42.

La relevancia del modelo reside en su enfoque específico sobre la reducción de alucinaciones en tareas de respuesta basada en fuente (grounded QA). El autor reporta una evaluación de compuerta pre-registrada (exam-v1, 150 ítems) en la que el checkpoint-60 elimina por completo las alucinaciones en ítems trampa y en ítems con respuesta ausente, manteniendo una precisión de control del 100%. El repositorio contiene el adaptador LoRA y un GGUF Q4_K_M del checkpoint-60.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Aya Expanse 8B de Cohere Labs) |
| Parámetros totales | 8.028.033.024 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | GGUF Q4_K_M (artefacto publicado); adaptador LoRA en precisión de entrenamiento |
| Idiomas soportados | en (inglés) según metadatos del repositorio |
| Licencia | other (heredada del modelo base; consultar términos de Cohere Labs) |
| Formato de pesos | GGUF (Q4_K_M) y adaptador LoRA; safetensors para el conteo de parámetros |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA del transformer denso Aya Expanse 8B de Cohere Labs, fijado a la revisión `5062468bf9bc0c6035fd64e06274333ec127d980`. El adaptador LoRA se aplica sobre todas las capas lineales con rango 16 y alpha 32. El entrenamiento usó precisión bf16, un learning rate de 1e-4 con decaimiento coseno, warmup del 10%, batch de 6 y 60 pasos de optimizador, con pérdida calculada únicamente sobre la completion y semilla 42.

El conjunto de entrenamiento, denominado Dataset B, consta de solo 18 pares prompt/completion diseñados con tres formas: trampa (la fuente contiene información que induce a error), control (la fuente contiene la respuesta correcta) y ausencia (la fuente no contiene la respuesta). No se menciona en la información disponible el uso de RLHF o DPO; el ajuste es supervisado (SFT) vía LoRA. La innovación principal no es arquitectónica sino de alineación: el ajuste busca un comportamiento de grounding estricto con una cantidad mínima de datos.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Aya Expanse 8B.
- Respuesta estrictamente basada en fuente (grounded QA): el modelo responde solo con la información contenida en el contexto proporcionado.
- Abstención explícita: declara cuando la fuente no contiene la respuesta, en lugar de inventarla.
- Reducción de alucinaciones en ítems trampa y en ítems con respuesta ausente, según la evaluación del autor.
- Capacidades del modelo base (razonamiento, código, matemáticas, multilingüismo) potencialmente presentes pero no evaluadas en este ajuste; la model card solo declara inglés.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no documentado.

## Casos de uso

- Respuesta basada en documentos (RAG): el modelo puede integrarse en un pipeline de recuperación aumentada donde se le pasa un fragmento de documento y debe responder solo con lo que contiene, absteniéndose cuando la respuesta no está presente. Adecuado por su comportamiento entrenado de grounding estricto.
- Atención al cliente sobre base de conocimiento cerrada: útil en escenarios donde es preferible decir "no dispongo de esa información" antes que inventar una respuesta, reduciendo el riesgo de información errónea al usuario.
- Extracción de datos de contratos o informes: el modelo puede señalar explícitamente cuándo un campo solicitado no aparece en el documento, lo que facilita la revisión humana.
- Verificación de afirmaciones contra fuentes: en tareas de fact-checking asistido, el modelo puede contrastar una afirmación con un texto fuente y declarar ausencia de evidencia.
- Asistentes de documentación técnica: responder preguntas sobre manuales internos limitándose al contenido del manual, con abstención cuando la sección no cubre el tema.
- Evaluación de pipelines de RAG: como componente de referencia para medir la tasa de alucinación de un sistema de recuperación, dado su comportamiento de abstención entrenado.
- Despliegue en entornos con recursos limitados: el GGUF Q4_K_M permite ejecución en hardware de consumo, adecuado para prototipos y pruebas locales.

## Benchmarks y rendimiento

El autor publica una evaluación de compuerta (exam-v1, 150 ítems, umbrales pre-registrados) comparando el baseline Q4_K_M con el checkpoint-60 ajustado:

| Métrica | Baseline Q4_K_M | Tuned checkpoint-60 | Umbral de compuerta |
|---|---|---|---|
| Alucinación en trampa | 20,0% (12/60) | 0,0% (0/60) | ≤10% |
| Precisión en control | 98,3% (59/60) | 100% (60/60) | ≥58/60 |
| Alucinación en ausencia | 6,7% (2/30) | 0,0% (0/30) | ≤6,7% |
| Fallos de generación | 0 | 0 | 0 |

Condiciones: mismos prompts, decodificación greedy, semilla 20261108, máximo 160 tokens y mismo código de corrección que la ejecución baseline. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M de un modelo de 8B ocupa aproximadamente 5,1 GB (tamaño del repositorio); la VRAM necesaria ronda los 6-8 GB incluyendo overhead de contexto y caché KV.
- GPU recomendadas: para el GGUF Q4_K_M, tarjetas consumer como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090; para precisión completa (bf16) se requieren alrededor de 16-20 GB, lo que apunta a RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, en el formato Q4_K_M con GPUs de 8 GB o más de VRAM.
- Opciones de despliegue: llama.cpp y Ollama para el GGUF; vLLM o TGI para el adaptador LoRA fusionado en precisión completa (no confirmado en la información disponible).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aya Expanse 8B — Lexsi AlignTune | 8,03B | no disponible | Grounding estricto y abstención | other | GGUF Q4_K_M + LoRA |
| CohereLabs/aya-expanse-8b (base) | 8B | no disponible | Modelo conversacional multilingüe | other | Pesos completos en HF |
| Modelos 7-8B de propósito general (p. ej., Llama 3.1 8B, Mistral 7B) | 7-8B | 8K-128K según modelo | Conversación general | licencias propias | Amplia disponibilidad |

La comparación con alternativas de propósito general es limitada porque este ajuste está especializado en un comportamiento concreto (grounding y abstención) y no se han publicado benchmarks estándar que permitan una comparación directa de rendimiento general.

## Limitaciones y advertencias

- El ajuste se entrenó con solo 18 pares prompt/completion, lo que limita la generalización del comportamiento a dominios y formatos no vistos.
- La evaluación se realizó sobre un único conjunto (exam-v1, 150 ítems) definido por el propio autor; no hay validación externa independiente.
- Los idiomas declarados se limitan al inglés; el multilingüismo del modelo base no está evaluado tras el ajuste.
- La licencia es "other" y hereda las restricciones del modelo base CohereLabs/aya-expanse-8b; es necesario revisar los términos de Cohere Labs antes de cualquier uso comercial.
- Riesgo de alucinación residual fuera de las formas de prompt entrenadas (trampa, control, ausencia); el 0% reportado corresponde a ese conjunto específico.
- El modelo puede ser demasiado conservador y abstenerse en casos donde la respuesta sí está presente pero formulada de forma distinta a la esperada.
- No hay información sobre tool calling, agentes ni contexto máximo; no debe asumirse su disponibilidad en producción.
- El repositorio tiene muy pocas descargas (49) y ningún "like", lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CardCauldronTCG/aya-expanse-8b-lexsi-aligntune
- Modelo base: https://huggingface.co/CohereLabs/aya-expanse-8b
- Repositorio canónico de artefactos (bucket del proyecto): CardCauldronTCG/lexsi-aligntune-out (referenciado en la model card; no se proporciona URL directa)
- Documentación del protocolo de ajuste: `FINETUNE-PROTOCOL-2026-11-12.md` (referenciado en la model card; no se proporciona URL directa)
- Resultados completos del ajuste: `FINETUNE-RUN-RESULTS-2026-11-12.md` (referenciado en la model card; no se proporciona URL directa)
