# empero-ai/Qwen3.8-9B-Distill

## Resumen

Qwen3.8-9B es un modelo de lenguaje causal de 9.650 millones de parámetros desarrollado por Empero, un laboratorio independiente de investigación en IA con sede en Alemania. Se trata de una destilación de parámetros completos del modelo Qwen3.8 2.4T A95B (el teacher, de escala frontera) sobre la arquitectura Qwen3.5-9B de Alibaba. El objetivo es trasladar el comportamiento de razonamiento de un modelo masivo a un modelo denso de 9B que pueda desplegarse en una sola GPU, manteniendo capacidades de chain-of-thought, matemáticas, código y uso de herramientas.

El modelo se entrenó mediante SFT (off-policy distillation) sobre aproximadamente 70.000 trazas curadas del teacher, filtradas por calidad, que incluyen razonamiento denso en matemáticas, programación competitiva, razonamiento general, seguimiento de instrucciones y tool use. Hereda del base Qwen3.5-9B una ventana de contexto nativa de 262.144 tokens y una arquitectura con atención lineal (Gated DeltaNet). Publicado bajo licencia Apache-2.0, está disponible en formato safetensors y también en cuantizaciones GGUF para ejecución local con llama.cpp, Ollama y otros runtimes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención lineal (Gated DeltaNet) sobre base Qwen3.5-9B (ruta de texto de un base vision-language) |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No especificado en el repo principal; disponible en formato GGUF (repo asociado) |
| Idiomas soportados | Inglés (declarado por el autor) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (y GGUF en repo aparte) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer causal con atención lineal híbrida (Gated DeltaNet) y convolución causal, lo que permite manejar contextos largos de forma eficiente. La destilación fue de parámetros completos (full fine-tune, no adaptadores) sobre aproximadamente 70.000 trazas del teacher Qwen3.8 2.4T A95B, con un filtrado de calidad previo. Las trazas cubren matemáticas, código, razonamiento general, seguimiento de instrucciones y tool use, con un peso deliberado hacia matemáticas duras y programación competitiva, los dominios donde la destilación aporta más a esta escala.

Cada respuesta comienza con un bloque `thinking` aprendido directamente de las trazas del teacher, en lugar de razonamiento sintético autogenerado. El entrenamiento se realizó con TRL y Transformers, y la evaluación con lm-evaluation-harness de EleutherAI. El modelo es text-only: la parte de visión del base se hereda pero no fue evaluada ni ajustada.

## Capacidades

- Razonamiento con chain-of-thought: genera un bloque `thinking` explícito antes de la respuesta final, aprendido de las trazas del teacher.
- Generación de texto y razonamiento general en inglés.
- Matemáticas y código: énfasis en problemas de matemáticas y programación competitiva.
- Function calling nativo según la especificación de Qwen3.5, sin necesidad de wrappers ni fine-tunes específicos de herramientas.
- Soporte de agentes y razonamiento multi-paso gracias al chain-of-thought denso y al function calling.
- Contexto largo de 262.144 tokens, útil para documentos extensos o conversaciones multi-turno.
- Capacidad de seguir instrucciones complejas, entrenada mediante las trazas de instruction following.

## Casos de uso

- Atención al cliente automatizada: con 262.144 tokens de contexto, el modelo puede gestionar conversaciones multi-turno largas, mantener el historial completo y resolver incidencias técnicas con razonamiento paso a paso.
- Generación de código en producción: su function calling nativo permite integrarlo en pipelines de CI/CD para autocompletar, revisar o generar código, con capacidad de llamar a herramientas externas (compiladores, linters, APIs).
- Tutoría y educación: el chain-of-thought explícito permite explicar razonamientos matemáticos o algorítmicos paso a paso, útil para asistentes de estudio o plataformas de aprendizaje.
- Análisis de documentos largos: la ventana de 262k tokens permite procesar contratos, informes o papers completos en una sola pasada, extrayendo conclusiones o resumiendo secciones.
- Agentes autónomos: combinando function calling y razonamiento multi-paso, puede actuar como agente que planifica, ejecuta llamadas a APIs y verifica resultados en tareas como automatización de workflows o integración de datos.
- Asistente de depuración: dado un fragmento de código con errores, el modelo puede razonar sobre la causa raíz y proponer correcciones, apoyándose en su entrenamiento en programación competitiva.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness (backend HF) con protocolos CoT (`gsm8k_cot`, `mmlu_flan_cot_zeroshot`), comparando el modelo destilado con su base Qwen3.5-9B. MMLU cubre los 57 subconjuntos (~1.700 preguntas). Muestreo con `temperature=0.6, top_p=0.95, top_k=20`.

| Tarea | Metrica | Qwen3.5-9B (base) | Qwen3.8-9B | Δ |
|---|---:|---:|---:|---:|
| gsm8k_cot | exact_match (flexible) | 0.885 | 0.870 | −0.015 |
| gsm8k_cot | exact_match (strict) | 0.875 | 0.850 | −0.025 |
| mmlu (CoT, 57 subjects) | acc (flexible-extract) | 0.546 | 0.751 | +0.205 |
| mmlu (CoT, 57 subjects) | acc (strict-match) | 0.251 | 0.511 | +0.260 |

El destilado mejora notablemente MMLU (+0.205 flexible, +0.260 strict) pero pierde ligeramente en GSM8K (−0.015 flexible, −0.025 strict) respecto al base. No se han publicado comparaciones con otros modelos de la misma categoría (p. ej. Llama 3.1 8B, Mistral 7B) en la información disponible.

## Requisitos de hardware

- VRAM estimada: en bf16, el modelo ocupa ~19,3 GB (tamaño del repo), por lo que requiere al menos 24 GB de VRAM para inferencia sin cuantización. Con cuantización 4-bit (GGUF) cabe en ~6-8 GB.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para bf16; GPUs de 16 GB (p. ej. RTX 4080, A4000) con cuantización 8-bit; GPUs de 8 GB (p. ej. RTX 3060) con cuantización 4-bit.
- Se requieren kernels especiales para la atención lineal: `flash-linear-attention` y una build de `causal_conv1d` compatible con CUDA. Sin ellos, las capas de atención lineal caen a operaciones PyTorch lentas y con alto consumo de memoria.
- Opciones de despliegue: Transformers (con kernels instalados), vLLM, SGLang y otros runtimes con soporte de arquitectura Qwen3.5. Para GGUF: llama.cpp, Ollama, LM Studio, Jan, KoboldCpp.
- Latencia y throughput: no especificados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (CoT) | GSM8K (CoT) | Licencia |
|---|---|---:|---:|---:|---:|
| Qwen3.8-9B (este) | 9,65B | 262.144 | 0.751 (flexible) | 0.870 (flexible) | Apache-2.0 |
| Qwen3.5-9B (base) | ~9B | 262.144 | 0.546 (flexible) | 0.885 (flexible) | Apache-2.0 |
| Llama 3.1 8B | 8,03B | 131.072 | no disponible | no disponible | Llama 3.1 |
| Mistral 7B v0.3 | 7,25B | 32.768 | no disponible | no disponible | Apache-2.0 |

Solo se dispone de comparación directa con el base Qwen3.5-9B. No hay datos publicados de benchmarks para Llama 3.1 8B o Mistral 7B en las mismas condiciones en la información proporcionada.

## Limitaciones y advertencias

- El fine-tune es text-only: la capacidad de visión heredada del base Qwen3.5-9B no fue evaluada ni entrenada, por lo que no debe usarse para tareas multimodales sin verificación previa.
- Puede sobre-pensar en preguntas fáciles, produciendo deliberaciones excesivamente largas (comportamiento heredado del teacher).
- El decoding greedy en generaciones largas es un modo de fallo conocido de repetición en modelos de razonamiento de esta clase; se recomienda sampling con `temperature=0.6, top_p=0.95, top_k=20`.
- Requiere kernels especiales (flash-linear-attention y causal_conv1d) para un rendimiento aceptable; sin ellos, la inferencia es lenta y consume mucha memoria.
- Solo se declara soporte del idioma inglés; no hay evidencia de rendimiento multilingüe.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez ante ataques adversariales.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye "as-is" sin garantías explícitas.
- El autor recomienda permitir `max_new_tokens` generoso (16.384 recomendado) y parsear el bloque `thinking` para separarlo de la respuesta final.

## Enlaces

- Repositorio HuggingFace principal: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Repositorio GGUF: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill-GGUF
- Sitio web de Empero: https://empero.org
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog de mindstudio sobre ejecución local: https://www.mindstudio.ai/blog/qwen3-8-9b-distillation-local
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-9b-empero-ai
- Kernels de atención lineal: https://github.com/fla-org/flash-linear-attention
- Kernel causal_conv1d: https://github.com/Dao-AILab/causal-conv1d
